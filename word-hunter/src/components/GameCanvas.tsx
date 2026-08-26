import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  LevelConfig, SpellingItem, Target, Arrow, Particle, FloatingText,
  ArrowType, ArcherBow, LevelResult,
} from '../types/game';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { audioService } from '../services/AudioService';
import { createScene, Scene } from '../engine/scenery';
import {
  VW, VH, GROUND_Y, ARCHER_X, ARCHER_Y, FIELD,
  computeTransform, screenToWorld, clamp, shuffle, fa,
} from '../engine/world';
import * as D from '../engine/draw';
import { outlinedText, clearGlowCache } from '../engine/glow';
import confetti from 'canvas-confetti';
import { Heart } from 'lucide-react';

/* ─────────── اندازه‌گیری متن خارج از حلقهٔ رسم ─────────── */
const measureCanvas = document.createElement('canvas');
const measureCtx = measureCanvas.getContext('2d')!;

interface Props {
  level: LevelConfig;
  equippedBow: ArcherBow;
  activeArrowType: ArrowType;
  arrowInventory: Record<ArrowType, number>;
  isProjectorMode: boolean;
  isPaused: boolean;
  currentStudent: string | null;
  /**
   * داخل «مأموریت»، نوار بالای خودِ مأموریت جان و پیشرفت را نشان می‌دهد،
   * پس نوار هدفِ بازی نباید همان‌ها را دوباره نشان دهد.
   */
  compact?: boolean;
  onConsumeArrow: (type: ArrowType) => void;
  onSelectArrowType: (type: ArrowType) => void;
  onComboChange: (combo: number) => void;
  onScoreDelta: (points: number, coins: number) => void;
  /** پس از داوری هر واژه — برای ثبت آمار کلاس و کارنامهٔ آزمون */
  onWordResult: (
    item: SpellingItem,
    correct: boolean,
    detail: { chosen: string; ms: number; mode: LevelConfig['mode'] }
  ) => void;
  onCurrentItem: (item: SpellingItem | null) => void;
  onFinish: (result: LevelResult) => void;
}

type Phase = 'active' | 'resolved';
type Verdict = 'none' | 'right' | 'wrong';

interface Shockwave { x: number; y: number; r: number; max: number; color: string }

export const GameCanvas: React.FC<Props> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /** پراپ‌ها در ref نگه داشته می‌شوند تا حلقهٔ بازی در هر رندر ری‌استارت نشود */
  const P = useRef(props);
  P.current = props;

  const { level, isProjectorMode } = props;
  const proj = isProjectorMode;

  /* ─────────── وضعیت موتور ─────────── */
  const S = useRef({
    scene: null as Scene | null,
    time: 0,
    tScale: 1,
    slowTimer: 0,
    hitStop: 0,
    shake: 0,
    flash: 0,
    flashColor: '#ffffff',

    // نشانه‌گیری
    aim: -0.55,
    drawing: false,
    hovering: false,
    power: 0.55,
    dragX: 0, dragY: 0,
    recoil: 0,
    reloadCd: 0,

    // موجودیت‌ها
    arrows: [] as Arrow[],
    targets: [] as Target[],
    particles: [] as Particle[],
    floats: [] as FloatingText[],
    waves: [] as Shockwave[],

    // دور جاری
    item: null as SpellingItem | null,
    recent: [] as string[],
    phase: 'active' as Phase,
    verdict: 'none' as Verdict,
    verdictTargetId: null as string | null,
    resolveTimer: 0,
    roundsDone: 0,
    roundSeq: 0,
    roundStartedAt: 0,
    roundMode: 'word_hunt' as LevelConfig['mode'],

    // حالت‌های ویژه
    locksLeft: 0,
    slotFilled: null as string | null,
    slotFlash: 0,
    bossHp: 0,
    bossMax: 0,
    curseTimer: 0,
    enraged: false,
    hintCd: 0,

    // آمار
    lives: 3,
    maxLives: 3,
    combo: 0,
    bestCombo: 0,
    shots: 0,
    hits: 0,
    correct: 0,
    wrong: 0,
    points: 0,
    coins: 0,
    elapsed: 0,
    timeLeft: 0,
    finished: false,
  });

  /* ─────────── وضعیت نمایشی (React) ─────────── */
  const [ui, setUi] = useState({
    lives: level.lives,
    maxLives: level.lives,
    rounds: 0,
    combo: 0,
    timeLeft: level.timeLimit || 0,
    bossHp: level.bossMaxHealth || 0,
    bossMax: level.bossMaxHealth || 0,
    speaking: false,
    banner: null as { kind: 'right' | 'wrong'; item: SpellingItem } | null,
    hint: '',
  });
  const uiThrottle = useRef(0);

  const modeInfo = spellingContentAdapter.getGameModeDisplayName(level.mode);

  /* ═══════════════ ساخت هدف‌ها ═══════════════ */

  const makeTarget = useCallback(
    (o: Partial<Target> & { id: string; kind: Target['kind']; text: string; isCorrect: boolean; x: number; y: number }): Target => {
      const fs = o.kind === 'letter' ? (proj ? 40 : 34) : proj ? 26 : 22;
      let halfW = 40, halfH = 34;
      if (o.kind === 'word' || o.kind === 'cage_lock' || o.kind === 'trapped_word') {
        const w = D.measure(measureCtx, o.text, o.kind === 'trapped_word' ? fs * 1.25 : fs, 800);
        halfW = w / 2 + (o.kind === 'trapped_word' ? 30 : 22);
        halfH = (o.kind === 'trapped_word' ? fs * 1.25 : fs) * 0.78 + 10;
      } else if (o.kind === 'monster') {
        const w = D.measure(measureCtx, o.text, fs, 800);
        halfW = Math.max(64, w / 2 + 18);
        halfH = o.radius || 58;
      }
      return {
        id: o.id, kind: o.kind, text: o.text, subText: o.subText,
        isCorrect: o.isCorrect,
        x: o.x, y: o.y,
        vx: o.vx ?? 0, vy: o.vy ?? 0,
        radius: o.radius ?? Math.max(halfW, halfH),
        halfW: o.halfW ?? halfW,
        halfH: o.halfH ?? halfH,
        health: o.health ?? 1, maxHealth: o.maxHealth ?? o.health ?? 1,
        hue: o.hue ?? 210,
        bob: Math.random() * Math.PI * 2,
        bobSpeed: o.bobSpeed ?? 1.4 + Math.random() * 0.7,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: o.spinSpeed ?? (Math.random() > 0.5 ? 0.35 : -0.35),
        pattern: o.pattern ?? 'drift',
        p: o.p ?? {},
        shudder: 0, spawnT: 0, dying: 0, isDead: false,
        locked: o.locked, cleansed: o.cleansed,
        item: o.item,
      };
    },
    [proj]
  );

  /** چیدمان بدون هم‌پوشانی در میدان بازی */
  const layout = (n: number, halfHeights: number[]): { x: number; y: number }[] => {
    const cols = n <= 2 ? 2 : n <= 4 ? 2 : 3;
    const rows = Math.ceil(n / cols);
    const spots: { x: number; y: number }[] = [];
    const fieldW = FIELD.maxX - FIELD.minX;
    const fieldH = FIELD.maxY - FIELD.minY;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (spots.length >= n) break;
        const cx = FIELD.minX + fieldW * ((c + 0.5) / cols);
        const cy = FIELD.minY + fieldH * ((r + 0.5) / rows);
        spots.push({
          x: cx + (Math.random() - 0.5) * (fieldW / cols) * 0.28,
          y: cy + (Math.random() - 0.5) * (fieldH / rows) * 0.3,
        });
      }
    }
    return shuffle(spots).map((s, i) => ({
      x: clamp(s.x, FIELD.minX + 60, FIELD.maxX - 60),
      y: clamp(s.y, FIELD.minY + halfHeights[i] + 6, FIELD.maxY - halfHeights[i] - 6),
    }));
  };

  const speakItem = useCallback((item: SpellingItem | null) => {
    if (!item) return;
    setUi((u) => ({ ...u, speaking: true }));
    audioService.speakPersian(item.word, () => setUi((u) => ({ ...u, speaking: false })));
  }, []);

  /* ═══════════════ آماده‌سازی یک دور ═══════════════ */

  const startRound = useCallback(() => {
    const s = S.current;
    const lvl = P.current.level;
    const needSnipe = lvl.mode === 'letter_snipe';
    const needVariants = lvl.mode === 'word_rescue' ? 2 : 1;

    const item = spellingContentAdapter.getRandomItem(lvl.category, lvl.grade, lvl.difficulty, {
      needSnipeable: needSnipe,
      needVariants,
      recentIds: s.recent,
    });
    s.item = item;
    s.recent = [item.id, ...s.recent].slice(0, 8);
    s.phase = 'active';
    s.verdict = 'none';
    s.verdictTargetId = null;
    s.slotFilled = null;
    s.slotFlash = 0;
    s.roundSeq++;
    s.roundStartedAt = performance.now();
    s.targets = [];
    P.current.onCurrentItem(item);

    // رنگ‌مایه‌ها عمداً سبز و قرمز نیستند تا رنگِ گویچه پاسخ درست را لو ندهد
    // (سبز و قرمز فقط پس از داوری برای نشان دادن درست/نادرست به کار می‌روند)
    const HUES = [205, 258, 292, 322, 190, 232];
    const mkWordPool = (variantCount: number) => {
      const bad = shuffle(item.incorrectVariants).slice(0, variantCount);
      return shuffle([
        { text: item.correctSpelling, ok: true },
        ...bad.map((v) => ({ text: v, ok: false })),
      ]);
    };

    // اگر واژهٔ انتخاب‌شده حرف جداشدنی ندارد، همان دور به شکل «شکار کلمه» اجرا می‌شود
    const effectiveMode: typeof lvl.mode =
      lvl.mode === 'letter_snipe' && !(item.isSnipeable && item.missingLetter)
        ? 'word_hunt'
        : lvl.mode;
    s.roundMode = effectiveMode;

    if (effectiveMode === 'word_hunt' || effectiveMode === 'audio_whisper' || effectiveMode === 'speed_rush') {
      const count = lvl.mode === 'speed_rush' ? 2 : lvl.difficulty >= 2 ? 3 : 2;
      const pool = mkWordPool(count);
      const fs = proj ? 26 : 22;
      const hh = pool.map(() => fs * 0.78 + 10);
      const spots = layout(pool.length, hh);
      pool.forEach((p, i) => {
        const sp = spots[i];
        const fast = lvl.mode === 'speed_rush';
        s.targets.push(
          makeTarget({
            id: `w${s.roundSeq}_${i}`, kind: 'word', text: p.text, isCorrect: p.ok,
            x: sp.x, y: sp.y,
            vx: (0.34 + Math.random() * 0.5) * (i % 2 ? 1 : -1) * (fast ? 2.2 : 1) * (0.75 + lvl.difficulty * 0.3),
            vy: (0.18 + Math.random() * 0.3) * (i % 2 ? -1 : 1) * (fast ? 1.8 : 1) * (0.75 + lvl.difficulty * 0.3),
            hue: HUES[i % HUES.length],
            pattern: lvl.mode === 'speed_rush' ? 'portal' : 'drift',
            p: { opacity: 1, fadeDir: -0.9 },
            item,
          })
        );
      });
      if (effectiveMode === 'audio_whisper') window.setTimeout(() => speakItem(item), 420);
    } else if (lvl.mode === 'letter_snipe' && item.isSnipeable && item.missingLetter) {
      const key = item.missingLetter;
      const decoys = shuffle(item.decoyLetters.filter((d) => d !== key)).slice(0, Math.min(3, 1 + lvl.difficulty));
      const pool = shuffle([{ text: key, ok: true }, ...decoys.map((d) => ({ text: d, ok: false }))]);
      const r = proj ? 46 : 40;
      const spots = layout(pool.length, pool.map(() => r));
      pool.forEach((p, i) => {
        const sp = spots[i];
        s.targets.push(
          makeTarget({
            id: `l${s.roundSeq}_${i}`, kind: 'letter', text: p.text, isCorrect: p.ok,
            x: sp.x, y: sp.y, radius: r, halfW: r, halfH: r,
            hue: HUES[(i + 2) % HUES.length],
            pattern: 'orbit',
            p: { cx: sp.x, cy: sp.y, r: 34 + i * 9, angle: i * 1.3, speed: (0.9 + lvl.difficulty * 0.35) * (i % 2 ? 1 : -1) },
            item,
          })
        );
      });
    } else if (lvl.mode === 'word_rescue') {
      const locks = shuffle(item.incorrectVariants).slice(0, Math.min(3, Math.max(2, item.incorrectVariants.length)));
      s.locksLeft = locks.length;
      const cx = VW * 0.66;
      const cy = (FIELD.minY + FIELD.maxY) / 2;
      s.targets.push(
        makeTarget({
          id: `core${s.roundSeq}`, kind: 'trapped_word', text: item.correctSpelling, isCorrect: true,
          x: cx, y: cy, hue: 45, pattern: 'static', locked: true, item,
        })
      );
      locks.forEach((lw, i) => {
        const a = (i / locks.length) * Math.PI * 2;
        s.targets.push(
          makeTarget({
            id: `lock${s.roundSeq}_${i}`, kind: 'cage_lock', text: lw, isCorrect: false,
            x: cx + Math.cos(a) * 170, y: cy + Math.sin(a) * 120,
            hue: 0, pattern: 'orbit',
            p: { cx, cy, r: 170, angle: a, speed: 0.5 + lvl.difficulty * 0.22 },
            item,
          })
        );
      });
    } else if (lvl.mode === 'monster_combat') {
      const bad = item.incorrectVariants[0] || 'غلط‌نوشت';
      s.targets.push(
        makeTarget({
          id: `mon${s.roundSeq}`, kind: 'monster', text: bad, isCorrect: false,
          x: FIELD.maxX - 110, y: FIELD.maxY - 40,
          vx: -(0.9 + lvl.difficulty * 0.5), radius: proj ? 66 : 56,
          hue: 270, pattern: 'patrol',
          p: { minX: FIELD.minX + 80, maxX: FIELD.maxX - 60 },
          health: 1, item,
        })
      );
      const others = item.incorrectVariants.filter((v) => v !== bad);
      const pool = shuffle([
        { text: item.correctSpelling, ok: true },
        ...shuffle(others).slice(0, 2).map((v) => ({ text: v, ok: false })),
      ]);
      const fs = proj ? 26 : 22;
      const spots = layout(pool.length, pool.map(() => fs * 0.78 + 10)).map((p) => ({
        x: p.x, y: clamp(p.y, FIELD.minY + 30, FIELD.minY + 190),
      }));
      pool.forEach((p, i) => {
        s.targets.push(
          makeTarget({
            id: `rune${s.roundSeq}_${i}`, kind: 'word', text: p.text, isCorrect: p.ok,
            x: spots[i].x, y: spots[i].y,
            vx: (0.5 + Math.random() * 0.6) * (i % 2 ? 1 : -1),
            vy: 0.3 * (i % 2 ? -1 : 1),
            hue: HUES[i % HUES.length], pattern: 'drift', item,
          })
        );
      });
    } else if (lvl.mode === 'boss_battle') {
      // غول سمت راست می‌ایستد و رون‌ها در کمانی سمت چپ او می‌چرخند
      // تا نوار سلامت و نام غول با هیچ رونی هم‌پوشانی نداشته باشد
      const cx = VW * 0.80;
      const cy = 400;
      const bossR = proj ? 92 : 82;
      s.targets.push(
        makeTarget({
          id: 'boss', kind: 'boss', text: lvl.bossName || 'غول غلط‌نویس', isCorrect: false,
          x: cx, y: cy, radius: bossR,
          halfW: bossR, halfH: bossR,
          health: s.bossHp, maxHealth: s.bossMax,
          hue: 350, pattern: 'vertical', vy: 0.35,
          p: { minY: 384, maxY: 416 },
          item,
        })
      );
      const pool = mkWordPool(2);
      const fs = proj ? 25 : 21;
      pool.forEach((p, i) => {
        const a = (i / pool.length) * Math.PI * 2 - Math.PI / 2;
        s.targets.push(
          makeTarget({
            id: `br${s.roundSeq}_${i}`, kind: 'word', text: p.text, isCorrect: p.ok,
            x: cx - 300 + Math.cos(a) * 150, y: cy + Math.sin(a) * 110,
            hue: HUES[i % HUES.length], pattern: 'orbit',
            p: { cx: cx - 300, cy, r: 150, angle: a, speed: 0.42 + (s.enraged ? 0.3 : 0) },
            halfW: D.measure(measureCtx, p.text, fs, 800) / 2 + 20,
            halfH: fs * 0.78 + 10,
            item,
          })
        );
      });
      s.curseTimer = s.enraged ? 2.6 : 4.2;
    }
  }, [makeTarget, proj, speakItem]);

  /* ═══════════════ راه‌اندازی مرحله ═══════════════ */

  useEffect(() => {
    const s = S.current;
    // هاله‌های ذخیره‌شدهٔ مرحلهٔ پیشین دیگر لازم نیستند
    clearGlowCache();
    s.scene = createScene(level.theme);
    s.time = 0; s.tScale = 1; s.slowTimer = 0; s.hitStop = 0;
    s.arrows = []; s.particles = []; s.floats = []; s.waves = [];
    s.recent = [];
    s.roundsDone = 0; s.roundSeq = 0;
    s.lives = level.lives; s.maxLives = level.lives;
    s.combo = 0; s.bestCombo = 0;
    s.shots = 0; s.hits = 0; s.correct = 0; s.wrong = 0;
    s.points = 0; s.coins = 0; s.elapsed = 0;
    s.timeLeft = level.timeLimit || 0;
    s.bossHp = level.bossMaxHealth || 8;
    s.bossMax = level.bossMaxHealth || 8;
    s.enraged = false;
    s.finished = false;
    s.aim = -0.5;
    setUi((u) => ({
      ...u, lives: level.lives, maxLives: level.lives, rounds: 0, combo: 0,
      timeLeft: level.timeLimit || 0, bossHp: s.bossHp, bossMax: s.bossMax,
      banner: null, hint: '',
    }));
    startRound();
    audioService.startAmbient(level.theme);
    return () => audioService.stopSpeech();
  }, [level, startRound]);

  /* ═══════════════ ورودی ═══════════════ */

  const pointerToWorld = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const t = computeTransform(rect.width, rect.height);
    return screenToWorld(e.clientX - rect.left, e.clientY - rect.top, t);
  };

  const aimAt = (wx: number, wy: number) => {
    const s = S.current;
    const dx = wx - ARCHER_X;
    const dy = wy - (ARCHER_Y - 22);
    s.aim = clamp(Math.atan2(dy, dx), -Math.PI * 0.49, Math.PI * 0.22);
    // هرچه هدف دورتر، کشش بیشتر
    const dist = Math.hypot(dx, dy);
    s.power = clamp(0.42 + dist / 1250, 0.42, 1);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (P.current.isPaused || S.current.finished) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const w = pointerToWorld(e);
    S.current.drawing = true;
    aimAt(w.x, w.y);
    audioService.playBowDraw(S.current.power);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (P.current.isPaused || S.current.finished) return;
    const w = pointerToWorld(e);
    S.current.hovering = true;
    if (S.current.drawing) aimAt(w.x, w.y);
    else {
      const dx = w.x - ARCHER_X;
      const dy = w.y - (ARCHER_Y - 22);
      S.current.aim = clamp(Math.atan2(dy, dx), -Math.PI * 0.49, Math.PI * 0.22);
      const dist = Math.hypot(dx, dy);
      S.current.power = clamp(0.42 + dist / 1250, 0.42, 1);
    }
  };

  const onPointerLeave = () => { S.current.hovering = false; };

  const onPointerUp = () => {
    const s = S.current;
    if (!s.drawing || P.current.isPaused || s.finished) return;
    s.drawing = false;
    shoot();
  };

  const shoot = () => {
    const s = S.current;
    if (s.reloadCd > 0 || s.finished) return;
    const pr = P.current;

    let type = pr.activeArrowType;
    if (type !== 'standard' && (pr.arrowInventory[type] ?? 0) <= 0) {
      type = 'standard';
      pr.onSelectArrowType('standard');
    }
    pr.onConsumeArrow(type);

    const speed = 17 * pr.equippedBow.arrowSpeed * (0.62 + s.power * 0.72);
    const sx = ARCHER_X + Math.cos(s.aim) * 40;
    const sy = ARCHER_Y - 22 + Math.sin(s.aim) * 40;

    const spread = type === 'multi_shot' ? [-0.13, 0, 0.13] : [0];
    spread.forEach((off, i) => {
      s.arrows.push({
        id: `a${Date.now()}_${i}_${Math.random()}`,
        x: sx, y: sy,
        vx: Math.cos(s.aim + off) * speed,
        vy: Math.sin(s.aim + off) * speed,
        angle: s.aim + off,
        power: s.power,
        type,
        lifeTime: 0,
        pierceLeft: type === 'piercing' ? 3 : 1,
        hitIds: [],
        trail: [],
      });
    });

    s.shots++;
    s.recoil = 1;
    s.reloadCd = 0.16 / Math.max(0.5, pr.equippedBow.drawSpeed);
    if (type === 'slow_mo') { s.slowTimer = 1.6; }
    audioService.playBowRelease();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (P.current.isPaused) return;
      const s = S.current;
      const step = 0.055;
      if (e.code === 'Space') { e.preventDefault(); shoot(); }
      else if (e.code === 'ArrowUp') { e.preventDefault(); s.aim = clamp(s.aim - step, -Math.PI * 0.49, Math.PI * 0.22); }
      else if (e.code === 'ArrowDown') { e.preventDefault(); s.aim = clamp(s.aim + step, -Math.PI * 0.49, Math.PI * 0.22); }
      else if (e.code === 'ArrowRight') { s.power = clamp(s.power + 0.05, 0.42, 1); }
      else if (e.code === 'ArrowLeft') { s.power = clamp(s.power - 0.05, 0.42, 1); }
      else if (e.key === '1') P.current.onSelectArrowType('standard');
      else if (e.key === '2') P.current.onSelectArrowType('fire');
      else if (e.key === '3') P.current.onSelectArrowType('slow_mo');
      else if (e.key === '4') P.current.onSelectArrowType('piercing');
      else if (e.key === '5') P.current.onSelectArrowType('multi_shot');
      else if (e.key.toLowerCase() === 'r' && P.current.level.mode === 'audio_whisper') speakItem(S.current.item);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [speakItem]);

  /* ═══════════════ جلوه‌ها ═══════════════ */

  const burst = (x: number, y: number, color: string, n: number, glyphs?: string[]) => {
    const s = S.current;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 6;
      s.particles.push({
        x, y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1,
        size: 2 + Math.random() * 5,
        color, alpha: 1, life: 0,
        maxLife: 28 + Math.random() * 30,
        gravity: 0.16,
        text: glyphs ? glyphs[i % glyphs.length] : undefined,
        shape: glyphs ? 'glyph' : Math.random() > 0.5 ? 'spark' : 'dot',
        rot: Math.random() * 6.28,
        rotSpeed: (Math.random() - 0.5) * 0.25,
      });
    }
  };

  const float = (x: number, y: number, text: string, color: string, size = 20) => {
    S.current.floats.push({
      id: `f${Math.random()}`, x, y, text, color,
      alpha: 1, scale: 0.6, vy: -1.1, size, life: 0,
    });
  };

  const wave = (x: number, y: number, color: string, max = 110) =>
    S.current.waves.push({ x, y, r: 6, max, color });

  /* ═══════════════ داوری ═══════════════ */

  const resolveRound = (correct: boolean, tgt: Target | null) => {
    const s = S.current;
    const pr = P.current;
    if (s.phase === 'resolved' || !s.item) return;
    s.phase = 'resolved';
    s.verdict = correct ? 'right' : 'wrong';
    s.verdictTargetId = tgt?.id ?? null;
    s.resolveTimer = correct ? 1.0 : 2.6;

    pr.onWordResult(s.item, correct, {
      chosen: tgt?.text ?? '',
      ms: Math.round(performance.now() - s.roundStartedAt),
      mode: pr.level.mode,
    });

    if (correct) {
      s.correct++;
      s.combo++;
      s.bestCombo = Math.max(s.bestCombo, s.combo);
      s.roundsDone++;
      const gained = 100 + s.combo * 25 + pr.level.difficulty * 20;
      const coins = 8 + s.combo * 2;
      s.points += gained;
      s.coins += coins;
      pr.onScoreDelta(gained, coins);
      pr.onComboChange(s.combo);
      if (tgt) {
        float(tgt.x, tgt.y - tgt.halfH - 14, `+${fa(gained)}`, '#6ee7b7', 26);
        wave(tgt.x, tgt.y, '#34d399', 150);
      }
      s.flash = 0.22; s.flashColor = '#34d399';
      audioService.playCorrect(s.combo);
      if (s.combo > 0 && s.combo % 5 === 0) {
        float(VW / 2, FIELD.minY + 40, `کمبوی ${fa(s.combo)} تایی! 🔥`, '#fbbf24', 32);
        audioService.playComboFanfare();
      }
    } else {
      s.wrong++;
      s.combo = 0;
      pr.onComboChange(0);
      s.lives = Math.max(0, s.lives - 1);
      s.shake = 16;
      s.flash = 0.3; s.flashColor = '#f87171';
      audioService.playWrong();
      if (tgt) burst(tgt.x, tgt.y, '#f87171', 20);
      // هدف درست را برای آموزش برجسته کن
      const right = s.targets.find((t) => t.isCorrect && !t.isDead);
      if (right) s.verdictTargetId = `${s.verdictTargetId}|${right.id}`;
    }

    setUi((u) => ({
      ...u,
      lives: s.lives, rounds: s.roundsDone, combo: s.combo,
      banner: { kind: correct ? 'right' : 'wrong', item: s.item! },
    }));
  };

  const finish = (victory: boolean) => {
    const s = S.current;
    if (s.finished) return;
    s.finished = true;
    const answered = s.correct + s.wrong;
    const accuracy = answered > 0 ? s.correct / answered : 0;
    const stars = !victory ? 0 : accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : 1;
    if (victory) {
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 }, ticks: 220 });
      audioService.playVictory();
    } else {
      audioService.playDefeat();
    }
    P.current.onFinish({
      stars, score: s.points, coins: s.coins,
      accuracy, shots: s.shots, hits: s.hits,
      bestCombo: s.bestCombo, rounds: s.roundsDone,
      elapsed: s.elapsed, victory, livesLeft: s.lives,
    });
  };

  /* ═══════════════ حلقهٔ بازی ═══════════════ */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let cssW = 0, cssH = 0;

    /**
     * کیفیت خودکار.
     *
     * روی رایانه‌های کم‌توانِ مدرسه و ویدئوپروژکتورهای بزرگ، تعداد پیکسل‌ها
     * می‌تواند از توان کارت گرافیک بیشتر شود. اگر فریم‌ها جا بمانند، وضوح
     * بوم پله‌پله پایین می‌آید تا بازی روان بماند. هرگز خودبه‌خود بالا نمی‌رود
     * تا کیفیت مدام بالا و پایین نپرد.
     */
    const QUALITY_STEPS = [2, 1.5, 1.25, 1];
    let qualityIdx = 0;
    let slowFrames = 0;
    let sampled = 0;
    // چند ثانیهٔ نخست نادیده گرفته می‌شود: هنگام بارگذاری صفحه و ساخته شدن
    // هاله‌ها چند فریم کند طبیعی است و نباید کیفیت را برای همیشه پایین بیاورد
    let warmup = 2.5;

    const pixelRatio = () =>
      Math.min(window.devicePixelRatio || 1, QUALITY_STEPS[qualityIdx]);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      const dpr = pixelRatio();
      cssW = Math.max(320, r.width);
      cssH = Math.max(240, r.height);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
    };

    const considerQualityDrop = (frameMs: number) => {
      if (warmup > 0) { warmup -= frameMs / 1000; return; }
      if (qualityIdx >= QUALITY_STEPS.length - 1) return;
      sampled++;
      if (frameMs > 26) slowFrames++;
      if (sampled < 150) return;
      // اگر بیش از یک‌سوم فریم‌های اخیر کند بوده‌اند، یک پله پایین بیا
      if (slowFrames > sampled / 3) {
        qualityIdx++;
        resize();
      }
      sampled = 0;
      slowFrames = 0;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const s = S.current;
      const pr = P.current;
      const lvl = pr.level;
      const frameMs = now - last;
      const raw = Math.min(frameMs / 1000, 0.05);
      last = now;
      if (!pr.isPaused) considerQualityDrop(frameMs);

      const paused = pr.isPaused || s.finished;

      /* ── به‌روزرسانی ── */
      if (!paused) {
        s.slowTimer = Math.max(0, s.slowTimer - raw);
        s.tScale = s.slowTimer > 0 ? 0.42 : 1;
        s.hitStop = Math.max(0, s.hitStop - raw);
      }
      const dt = paused || s.hitStop > 0 ? 0 : raw * s.tScale;
      const k = dt * 60; // ضریب تبدیل به «فریم ۶۰ هرتزی»

      s.time += paused ? raw * 0.35 : raw;
      s.scene?.update(paused ? raw * 0.35 : raw);

      if (dt > 0) {
        s.elapsed += raw;
        s.recoil = Math.max(0, s.recoil - k * 0.12);
        s.reloadCd = Math.max(0, s.reloadCd - dt);
        s.shake = Math.max(0, s.shake - k * 0.85);
        s.flash = Math.max(0, s.flash - dt * 2.2);
        s.slotFlash = Math.max(0, s.slotFlash - dt * 1.6);
        s.hintCd = Math.max(0, s.hintCd - raw);

        // ── تایمر حالت زمان‌دار ──
        if (lvl.mode === 'speed_rush' && s.timeLeft > 0) {
          s.timeLeft = Math.max(0, s.timeLeft - raw);
          if (s.timeLeft <= 0) {
            finish(s.roundsDone >= Math.max(1, Math.floor(lvl.rounds * 0.5)));
          }
        }

        // ── هدف‌ها ──
        for (const t of s.targets) {
          if (t.isDead) continue;
          t.spawnT = Math.min(1, t.spawnT + dt * 3.2);
          t.bob += t.bobSpeed * dt;
          t.spin += t.spinSpeed * dt;
          t.shudder = Math.max(0, t.shudder - k * 1.1);
          if (t.dying > 0) {
            t.dying += dt * 2.6;
            if (t.dying >= 1) t.isDead = true;
            continue;
          }

          switch (t.pattern) {
            case 'drift': {
              t.x += t.vx * k; t.y += t.vy * k;
              if (t.x - t.halfW < FIELD.minX) { t.x = FIELD.minX + t.halfW; t.vx = Math.abs(t.vx); }
              if (t.x + t.halfW > FIELD.maxX) { t.x = FIELD.maxX - t.halfW; t.vx = -Math.abs(t.vx); }
              if (t.y - t.halfH < FIELD.minY) { t.y = FIELD.minY + t.halfH; t.vy = Math.abs(t.vy); }
              if (t.y + t.halfH > FIELD.maxY) { t.y = FIELD.maxY - t.halfH; t.vy = -Math.abs(t.vy); }
              break;
            }
            case 'portal': {
              t.x += t.vx * k; t.y += t.vy * k;
              if (t.x - t.halfW < FIELD.minX || t.x + t.halfW > FIELD.maxX) t.vx *= -1;
              if (t.y - t.halfH < FIELD.minY || t.y + t.halfH > FIELD.maxY) t.vy *= -1;
              t.x = clamp(t.x, FIELD.minX + t.halfW, FIELD.maxX - t.halfW);
              t.y = clamp(t.y, FIELD.minY + t.halfH, FIELD.maxY - t.halfH);
              const o = (t.p.opacity ?? 1) + (t.p.fadeDir ?? -0.9) * dt;
              if (o <= 0.25) { t.p.opacity = 0.25; t.p.fadeDir = 0.9; }
              else if (o >= 1) { t.p.opacity = 1; t.p.fadeDir = -0.9; }
              else t.p.opacity = o;
              break;
            }
            case 'orbit': {
              t.p.angle = (t.p.angle ?? 0) + (t.p.speed ?? 0.5) * dt;
              const cx = t.p.cx ?? VW * 0.6;
              const cy = t.p.cy ?? (FIELD.minY + FIELD.maxY) / 2;
              const rr = t.p.r ?? 120;
              t.x = clamp(cx + Math.cos(t.p.angle) * rr, FIELD.minX + t.halfW, FIELD.maxX - t.halfW);
              t.y = clamp(cy + Math.sin(t.p.angle) * rr * 0.72, FIELD.minY + t.halfH, FIELD.maxY - t.halfH);
              break;
            }
            case 'patrol': {
              t.x += t.vx * k;
              if (t.x < (t.p.minX ?? FIELD.minX)) t.vx = Math.abs(t.vx);
              if (t.x > (t.p.maxX ?? FIELD.maxX)) t.vx = -Math.abs(t.vx);
              break;
            }
            case 'vertical': {
              t.y += t.vy * k;
              if (t.y < (t.p.minY ?? FIELD.minY)) t.vy = Math.abs(t.vy);
              if (t.y > (t.p.maxY ?? FIELD.maxY)) t.vy = -Math.abs(t.vy);
              break;
            }
            case 'ballistic': {
              t.x += t.vx * k; t.y += t.vy * k;
              t.vy += 0.055 * k;
              break;
            }
          }
        }

        // ── نفرین‌های غول ──
        if (lvl.mode === 'boss_battle' && s.phase === 'active') {
          s.curseTimer -= dt;
          if (s.curseTimer <= 0) {
            s.curseTimer = s.enraged ? 2.2 : 3.6;
            const boss = s.targets.find((t) => t.kind === 'boss' && !t.isDead);
            const liveCurses = s.targets.filter((t) => t.kind === 'curse' && !t.isDead && t.dying <= 0).length;
            if (boss && s.item && liveCurses < 3) {
              const bad = s.item.incorrectVariants[0] || 'غلط';
              const x0 = boss.x - 70;
              const y0 = boss.y + 10;
              const targetX = ARCHER_X + 20;
              const targetY = ARCHER_Y - 30;
              // سرعت افقی ثابت است؛ سرعت عمودی طوری حساب می‌شود که
              // کمانه دقیقاً روی کماندار فرود بیاید (وگرنه نفرین بی‌خطر می‌شد)
              const vx = -(3.1 + (s.enraged ? 1.1 : 0));
              const g = 0.055;
              const frames = Math.max(20, (x0 - targetX) / -vx);
              const vy = (targetY - y0 - 0.5 * g * frames * frames) / frames;
              s.targets.push(
                makeTarget({
                  id: `curse${Math.random()}`, kind: 'curse', text: bad, isCorrect: false,
                  x: x0, y: y0, radius: 26, halfW: 26, halfH: 26,
                  vx, vy,
                  hue: 350, pattern: 'ballistic', spinSpeed: 2.4, item: s.item,
                })
              );
              audioService.playCurseThrow();
            }
          }
          // برخورد نفرین با کماندار
          for (const t of s.targets) {
            if (t.kind !== 'curse' || t.isDead || t.dying > 0) continue;
            if (t.y > GROUND_Y - 20 || t.x < ARCHER_X + 42) {
              const hitArcher = t.x < ARCHER_X + 46 && Math.abs(t.y - (ARCHER_Y - 20)) < 70;
              t.dying = 0.01;
              burst(t.x, t.y, '#f43f5e', 16);
              if (hitArcher) {
                s.lives = Math.max(0, s.lives - 1);
                s.combo = 0;
                s.shake = 22;
                s.flash = 0.35; s.flashColor = '#ef4444';
                audioService.playWrong();
                float(ARCHER_X + 40, ARCHER_Y - 80, 'نفرین خورد! −۱ جان', '#f87171', 22);
                P.current.onComboChange(0);
                setUi((u) => ({ ...u, lives: s.lives, combo: 0 }));
              }
            }
          }
        }

        // ── تیرها ──
        for (let i = s.arrows.length - 1; i >= 0; i--) {
          const a = s.arrows[i];
          a.lifeTime += dt;
          const prevX = a.x;
          const prevY = a.y;
          const g = a.type === 'slow_mo' ? 0.13 : 0.27;
          a.vy += g * k;
          a.x += a.vx * k;
          a.y += a.vy * k;
          a.angle = Math.atan2(a.vy, a.vx);
          a.trail.push({ x: a.x, y: a.y, a: 1 });
          if (a.trail.length > 16) a.trail.shift();
          a.trail.forEach((p) => (p.a *= 0.9));

          let consumed = false;
          for (const t of s.targets) {
            if (t.isDead || t.dying > 0 || a.hitIds.includes(t.id)) continue;
            // برخورد جاروبی: مسیر تیر بین دو فریم نمونه‌برداری می‌شود تا
            // تیرهای تند از میان هدف رد نشوند
            if (!sweptHit(prevX, prevY, a.x, a.y, t)) continue;

            a.hitIds.push(t.id);
            onArrowHit(a, t);
            a.pierceLeft--;
            if (a.pierceLeft <= 0) { s.arrows.splice(i, 1); consumed = true; }
            break;
          }
          if (consumed) continue;

          // برخورد با زمین
          if (a.y > GROUND_Y - 2) {
            burst(a.x, GROUND_Y - 4, '#94a3b8', 7);
            audioService.playThud();
            s.arrows.splice(i, 1);
            continue;
          }
          if (a.x > VW + 80 || a.x < -80 || a.lifeTime > 5) s.arrows.splice(i, 1);
        }

        // ── ذرات ──
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.life++;
          p.x += p.vx * k; p.y += p.vy * k;
          p.vy += p.gravity * k;
          p.vx *= 1 - 0.02 * k;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          if (p.rot !== undefined && p.rotSpeed) p.rot += p.rotSpeed * k;
          if (p.life >= p.maxLife) s.particles.splice(i, 1);
        }

        // ── متن‌های شناور ──
        for (let i = s.floats.length - 1; i >= 0; i--) {
          const f = s.floats[i];
          f.life += dt;
          f.y += f.vy * k;
          f.scale = Math.min(1, f.scale + dt * 4);
          if (f.life > 0.7) f.alpha -= dt * 1.8;
          if (f.alpha <= 0) s.floats.splice(i, 1);
        }

        // ── موج‌های ضربه ──
        for (let i = s.waves.length - 1; i >= 0; i--) {
          const w = s.waves[i];
          w.r += (w.max - w.r) * 0.14 * k + 1.5 * k;
          if (w.r >= w.max - 3) s.waves.splice(i, 1);
        }

        // ── پایان دور ──
        if (s.phase === 'resolved') {
          s.resolveTimer -= raw;
          if (s.resolveTimer <= 0) {
            setUi((u) => ({ ...u, banner: null }));
            if (s.lives <= 0) {
              finish(false);
            } else if (lvl.mode === 'boss_battle' && s.bossHp <= 0) {
              finish(true);
            } else if (lvl.mode !== 'speed_rush' && s.roundsDone >= lvl.rounds) {
              finish(true);
            } else {
              startRound();
            }
          }
        }
      }

      /* ── همگام‌سازی سبک با React ── */
      uiThrottle.current += raw;
      if (uiThrottle.current > 0.12) {
        uiThrottle.current = 0;
        setUi((u) => {
          const nt = Math.ceil(s.timeLeft);
          if (u.timeLeft === nt && u.rounds === s.roundsDone && u.lives === s.lives &&
              u.combo === s.combo && u.bossHp === s.bossHp) return u;
          return { ...u, timeLeft: nt, rounds: s.roundsDone, lives: s.lives, combo: s.combo, bossHp: s.bossHp };
        });
      }

      /* ── رسم ── */
      const dpr = pixelRatio();
      const tr = computeTransform(cssW, cssH);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, cssW, cssH);

      ctx.save();
      ctx.translate(tr.offsetX, tr.offsetY);
      ctx.scale(tr.scale, tr.scale);
      ctx.beginPath();
      ctx.rect(0, 0, VW, VH);
      ctx.clip();

      if (s.shake > 0.2) {
        ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
      }

      s.scene?.drawBack(ctx);

      // لوح جای خالی
      if (s.roundMode === 'letter_snipe' && s.item && s.item.missingLetter) {
        const idx = s.item.missingIndex ?? 0;
        const key = s.item.missingLetter ?? '';
        drawSlot(ctx, s.item.correctSpelling, idx, key, s.slotFilled, s.time, proj, s.slotFlash);
      }

      const wrongIds = s.verdictTargetId?.split('|') ?? [];
      const fsWord = proj ? 26 : 22;
      const fsLetter = proj ? 40 : 34;

      // اهداف
      for (const t of s.targets) {
        if (t.isDead) continue;
        let reveal: 'none' | 'right' | 'wrong' = 'none';
        if (s.phase === 'resolved') {
          if (t.isCorrect && (lvl.mode !== 'word_rescue')) reveal = 'right';
          else if (wrongIds.includes(t.id) && !t.isCorrect) reveal = 'wrong';
        }
        switch (t.kind) {
          case 'word':
            ctx.save();
            if (t.pattern === 'portal') ctx.globalAlpha = t.p.opacity ?? 1;
            D.drawWordTablet(ctx, t, s.time, { projector: proj, reveal, fontSize: fsWord });
            ctx.restore();
            break;
          case 'letter':
            D.drawLetterCrystal(ctx, t, s.time, { projector: proj, reveal, fontSize: fsLetter });
            break;
          case 'cage_lock':
            D.drawCageLock(ctx, t, { fontSize: proj ? 22 : 19 });
            break;
          case 'trapped_word':
            D.drawTrappedWord(ctx, t, s.time, s.locksLeft, { fontSize: proj ? 32 : 27 });
            break;
          case 'monster':
            D.drawMonster(ctx, t, s.time, { fontSize: proj ? 22 : 19 });
            break;
          case 'boss':
            D.drawBoss(ctx, t, s.time, { projector: proj, enraged: s.enraged });
            break;
          case 'curse':
            D.drawCurse(ctx, t, s.time);
            break;
        }
      }

      // موج ضربه
      s.waves.forEach((w) =>
        D.drawShockwave(ctx, w.x, w.y, w.r, Math.max(0, 1 - w.r / w.max), w.color)
      );

      // تیرها
      s.arrows.forEach((a) => D.drawArrow(ctx, a));

      // ذرات
      ctx.save();
      for (const p of s.particles) {
        ctx.globalAlpha = p.alpha;
        if (p.shape === 'glyph' && p.text) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot ?? 0);
          D.font(ctx, 17, 800);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, 0, 0);
          ctx.restore();
        } else if (p.shape === 'spark') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.55;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4);
          ctx.stroke();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // کماندار
      D.drawArcher(ctx, {
        x: ARCHER_X, y: ARCHER_Y,
        aim: s.aim, drawing: s.drawing, power: s.power,
        recoil: s.recoil, bowGlow: pr.equippedBow.glowColor,
        arrowType: pr.activeArrowType, combo: s.combo,
        projector: proj, time: s.time,
      });

      // پیش‌نمای مسیر — همیشه دیده می‌شود تا نشانه‌گیری برای بچه‌ها آسان باشد
      if ((s.drawing || s.hovering) && !paused) {
        const sp = 17 * pr.equippedBow.arrowSpeed * (0.62 + s.power * 0.72);
        D.drawTrajectory(
          ctx, ARCHER_X, ARCHER_Y - 22, s.aim, sp,
          pr.activeArrowType === 'slow_mo' ? 0.13 : 0.27,
          D.arrowColor(pr.activeArrowType), s.drawing ? 34 : 24
        );
      }

      // متن‌های شناور
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
      for (const f of s.floats) {
        ctx.globalAlpha = Math.max(0, f.alpha);
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.scale(f.scale, f.scale);
        D.font(ctx, f.size, 800);
        ctx.fillStyle = f.color;
        outlinedText(ctx, f.text, 0, 0, 5);
        ctx.restore();
      }
      ctx.restore();

      s.scene?.drawFront(ctx);

      // فلاش تمام‌صفحه
      if (s.flash > 0.01) {
        ctx.save();
        ctx.globalAlpha = s.flash * 0.5;
        ctx.fillStyle = s.flashColor;
        ctx.fillRect(0, 0, VW, VH);
        ctx.restore();
      }

      ctx.restore();
      // نوارهای سیاه بالا/پایین بیرون از دنیای مجازی قبلاً پر شده‌اند
    };

    /** آیا پارهٔ خط حرکت تیر با هدف تلاقی دارد؟ */
    function sweptHit(x0: number, y0: number, x1: number, y1: number, t: Target): boolean {
      const box = t.kind === 'word' || t.kind === 'cage_lock' || t.kind === 'trapped_word';
      const padX = box ? t.halfW + 13 : t.radius + 13;
      const padY = box ? t.halfH + 13 : t.radius + 13;
      const dist = Math.hypot(x1 - x0, y1 - y0);
      const steps = Math.max(1, Math.ceil(dist / 9));
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const px = x0 + (x1 - x0) * u;
        const py = y0 + (y1 - y0) * u;
        const dx = Math.abs(px - t.x);
        const dy = Math.abs(py - t.y);
        if (box) {
          if (dx < padX && dy < padY) return true;
        } else if (dx * dx + dy * dy < padX * padY) {
          return true;
        }
      }
      return false;
    }

    /* ── برخورد تیر با هدف ── */
    function onArrowHit(a: Arrow, t: Target) {
      const s = S.current;
      const lvl = P.current.level;
      s.hits++;
      t.shudder = 9;
      s.shake = Math.max(s.shake, 7);
      if (a.type === 'fire') burst(a.x, a.y, '#fb7185', 26);

      // آسیب‌ناپذیرها
      if (t.kind === 'boss') {
        if (s.hintCd <= 0) {
          s.hintCd = 1.4;
          float(t.x, t.y - t.radius - 76, 'سپر غول! رونِ درست را بزن', '#fca5a5', 18);
        }
        burst(a.x, a.y, '#a855f7', 10);
        audioService.playThud();
        return;
      }
      if (t.kind === 'curse') {
        t.dying = 0.01;
        burst(t.x, t.y, '#fb7185', 18);
        s.points += 20;
        P.current.onScoreDelta(20, 2);
        float(t.x, t.y, '+۲۰', '#fda4af', 18);
        audioService.playCurseBreak();
        return;
      }

      if (s.phase === 'resolved') return;

      // ── نجات کلمه ──
      if (lvl.mode === 'word_rescue') {
        if (t.kind === 'cage_lock') {
          t.dying = 0.01;
          s.locksLeft = Math.max(0, s.locksLeft - 1);
          burst(t.x, t.y, '#f87171', 22, ['✖']);
          wave(t.x, t.y, '#f87171', 110);
          audioService.playLockBreak();
          float(t.x, t.y - 30, `قفل «${t.text}» شکست!`, '#fca5a5', 18);
          s.hitStop = 0.05;
          if (s.locksLeft === 0) {
            const core = s.targets.find((x) => x.kind === 'trapped_word');
            if (core) { core.locked = false; core.bobSpeed = 2.4; }
            float(VW * 0.66, FIELD.minY + 30, 'طلسم شکست! واژه را آزاد کن ✦', '#fbbf24', 26);
            audioService.playUnlock();
          }
          return;
        }
        if (t.kind === 'trapped_word') {
          if (s.locksLeft > 0) {
            if (s.hintCd <= 0) {
              s.hintCd = 1.2;
              float(t.x, t.y - t.halfH - 22, 'اول قفل‌ها را بشکن!', '#fca5a5', 18);
            }
            audioService.playThud();
            return;
          }
          t.dying = 0.01;
          burst(t.x, t.y, '#fbbf24', 34, [...t.text]);
          s.hitStop = 0.09;
          resolveRound(true, t);
          return;
        }
      }

      // ── هیولا ──
      if (lvl.mode === 'monster_combat') {
        if (t.kind === 'monster') {
          float(t.x, t.y - t.radius - 60, 'به رونِ درست شلیک کن!', '#fca5a5', 18);
          burst(a.x, a.y, '#a855f7', 10);
          audioService.playThud();
          return;
        }
        if (t.kind === 'word') {
          if (t.isCorrect) {
            const mon = s.targets.find((x) => x.kind === 'monster');
            if (mon) {
              mon.cleansed = true;
              mon.vx = 0;
              burst(mon.x, mon.y, '#34d399', 40, ['✨', '💚']);
              wave(mon.x, mon.y, '#34d399', 190);
              mon.text = s.item?.correctSpelling ?? mon.text;
              audioService.playCleanse();
            }
            t.dying = 0.01;
            s.hitStop = 0.09;
            resolveRound(true, t);
          } else {
            t.dying = 0.01;
            resolveRound(false, t);
          }
          return;
        }
      }

      // ── نبرد غول ──
      if (lvl.mode === 'boss_battle' && t.kind === 'word') {
        if (t.isCorrect) {
          const boss = s.targets.find((x) => x.kind === 'boss');
          s.bossHp = Math.max(0, s.bossHp - 1);
          if (boss) { boss.health = s.bossHp; boss.shudder = 16; }
          if (!s.enraged && s.bossHp <= Math.ceil(s.bossMax / 2)) {
            s.enraged = true;
            float(VW * 0.7, FIELD.minY + 20, 'غول خشمگین شد! ⚡', '#f87171', 30);
            audioService.playBossRage();
          }
          burst(boss?.x ?? t.x, boss?.y ?? t.y, '#f87171', 34, ['💥']);
          wave(boss?.x ?? t.x, boss?.y ?? t.y, '#ef4444', 220);
          s.shake = 20;
          s.hitStop = 0.1;
          t.dying = 0.01;
          audioService.playBossHit();
          resolveRound(true, t);
          if (s.bossHp <= 0) {
            s.targets.forEach((x) => { if (x.kind === 'curse') x.dying = 0.01; });
            if (boss) boss.dying = 0.01;
            audioService.playBossDefeat();
          }
        } else {
          t.dying = 0.01;
          resolveRound(false, t);
        }
        return;
      }

      // ── حالت‌های واژه/حرف ساده ──
      if (t.kind === 'word' || t.kind === 'letter') {
        if (t.isCorrect) {
          t.dying = 0.01;
          burst(t.x, t.y, '#34d399', 32, t.kind === 'letter' ? [t.text] : [...t.text.slice(0, 6)]);
          s.hitStop = 0.09;
          if (s.roundMode === 'letter_snipe') {
            s.slotFilled = t.text;
            s.slotFlash = 1;
            audioService.playLetterSnap();
          }
          resolveRound(true, t);
        } else {
          t.dying = 0.01;
          resolveRound(false, t);
        }
      }
    }

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__whDebug = () => ({
        state: S.current,
        transform: computeTransform(cssW, cssH),
        rect: canvas.getBoundingClientRect(),
      });
    }

    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proj]);

  /* ═══════════════ رابط روی بوم ═══════════════ */

  const progressLabel =
    level.mode === 'speed_rush'
      ? `زمان: ${fa(Math.max(0, ui.timeLeft))} ثانیه`
      : level.mode === 'boss_battle'
      ? `طلسم غول: ${fa(ui.bossHp)} / ${fa(ui.bossMax)}`
      : `دور ${fa(Math.min(ui.rounds + 1, level.rounds))} از ${fa(level.rounds)}`;

  const pct =
    level.mode === 'speed_rush'
      ? (ui.timeLeft / (level.timeLimit || 1)) * 100
      : level.mode === 'boss_battle'
      ? (ui.bossHp / (ui.bossMax || 1)) * 100
      : (ui.rounds / level.rounds) * 100;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#05070f]">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
        className="w-full h-full touch-none select-none cursor-crosshair block"
      />

      {/* نوار هدف مرحله */}
      <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-20 w-[min(94vw,660px)]">
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/85 border border-slate-700/70 shadow-2xl backdrop-blur-md">
          <span className={proj ? 'text-3xl' : 'text-2xl'}>{modeInfo.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className={`font-black text-amber-300 ${proj ? 'text-lg' : 'text-sm'}`}>{modeInfo.fa}</span>
              {!props.compact && (
                <span className={`font-bold text-slate-200 ${proj ? 'text-base' : 'text-xs'}`}>{progressLabel}</span>
              )}
            </div>
            {!props.compact && (
              <div className="mt-1.5 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    level.mode === 'boss_battle' ? 'bg-gradient-to-l from-rose-500 to-orange-400' : 'bg-gradient-to-l from-emerald-400 to-sky-400'
                  }`}
                  style={{ width: `${clamp(pct, 0, 100)}%` }}
                />
              </div>
            )}
            <p className={`mt-1 text-slate-400 leading-tight ${proj ? 'text-sm' : 'text-[11px]'}`}>{modeInfo.how}</p>
          </div>

          {/* جان‌ها — در حالت مأموریت، نوار بالا آن‌ها را نشان می‌دهد */}
          {!props.compact && (
          <div className="flex items-center gap-1 shrink-0" title={`جان باقی‌مانده: ${fa(ui.lives)}`}>
            {Array.from({ length: ui.maxLives }).map((_, i) => (
              <Heart
                key={i}
                className={`transition-all duration-300 ${proj ? 'w-7 h-7' : 'w-5 h-5'} ${
                  i < ui.lives
                    ? 'text-rose-400 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,.6)]'
                    : 'text-slate-700 fill-slate-800 scale-90'
                }`}
              />
            ))}
          </div>
          )}

          {level.mode === 'audio_whisper' && (
            <button
              onClick={() => speakItem(S.current.item)}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl font-bold shadow-md transition active:scale-95 ${
                proj ? 'px-4 py-2.5 text-base' : 'px-3 py-2 text-xs'
              } ${ui.speaking ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-sky-600 hover:bg-sky-500 text-white'}`}
            >
              🔊 <span>شنیدن دوباره</span>
            </button>
          )}
        </div>
      </div>

      {/* بنر آموزشی پس از داوری */}
      {ui.banner && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-3">
          <div
            className={`w-[min(94vw,860px)] rounded-2xl border-2 shadow-2xl backdrop-blur-md px-5 py-3.5 animate-[wh-rise_.3s_ease-out] ${
              ui.banner.kind === 'right'
                ? 'bg-emerald-950/90 border-emerald-500/70'
                : 'bg-rose-950/92 border-rose-500/70'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={proj ? 'text-4xl' : 'text-3xl'}>{ui.banner.kind === 'right' ? '✅' : '📌'}</span>
              <div className="flex-1 text-right">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className={`font-black ${proj ? 'text-2xl' : 'text-xl'} ${ui.banner.kind === 'right' ? 'text-emerald-300' : 'text-rose-200'}`}>
                    {ui.banner.kind === 'right' ? 'آفرین! درست بود' : `املای درست: «${ui.banner.item.correctSpelling}»`}
                  </span>
                  <span className={`text-slate-300 ${proj ? 'text-base' : 'text-sm'}`}>
                    {ui.banner.item.meaning}
                  </span>
                </div>
                <p className={`mt-1 text-slate-200 leading-relaxed ${proj ? 'text-lg' : 'text-sm'}`}>
                  {ui.banner.item.ruleExplanation}
                </p>
                <p className={`mt-1 text-slate-400 italic ${proj ? 'text-base' : 'text-xs'}`}>
                  «{ui.banner.item.sentence}»
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نوبت دانش‌آموز */}
      {props.currentStudent && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-20">
          <div className={`flex items-center gap-2 rounded-2xl bg-teal-950/90 border border-teal-500/60 shadow-xl backdrop-blur-md ${proj ? 'px-5 py-3' : 'px-3.5 py-2'}`}>
            <span className={proj ? 'text-2xl' : 'text-lg'}>🎯</span>
            <div className="text-right leading-tight">
              <div className={`text-teal-400 font-bold ${proj ? 'text-sm' : 'text-[10px]'}`}>نوبت پرتاب با</div>
              <div className={`font-black text-teal-100 ${proj ? 'text-xl' : 'text-sm'}`}>{props.currentStudent}</div>
            </div>
          </div>
        </div>
      )}

      {/* راهنمای کنترل */}
      <div className={`pointer-events-none absolute bottom-3 left-3 z-10 hidden ${ui.banner ? "" : "md:flex"} items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/75 border border-slate-700/60 text-[11px] text-slate-400 backdrop-blur-sm`}>
        <span className="text-amber-400 font-bold">کنترل:</span>
        <span>نشانه‌گیری با موس/لمس، رها کردن = شلیک · Space شلیک · ↑↓ زاویه · ۱ تا ۵ نوع تیر</span>
      </div>
    </div>
  );
};

/* رسم لوح جای خالی با تقسیم واژه */
function drawSlot(
  ctx: CanvasRenderingContext2D,
  word: string,
  idx: number,
  key: string,
  filled: string | null,
  time: number,
  proj: boolean,
  flash: number
) {
  const prefix = word.slice(0, idx);
  const suffix = word.slice(idx + key.length);
  D.drawSlotTablet(ctx, prefix, suffix, filled, time, proj, flash);
}

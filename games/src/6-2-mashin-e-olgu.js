/*!
title: ماشینِ الگو — حلّ مسئلهٔ ساده‌تر
bg: #1b1410
*/

/* ═══════════════════════════════════════════════════════════════════════
   ماشینِ الگو — ریاضی سوم، فصل ۶، درس ۲ (حلّ مسئلهٔ ساده‌تر)
   ───────────────────────────────────────────────────────────────────────
   کتاب می‌گوید: مسئلهٔ بزرگ را رها کن، چند تای کوچکش را حل کن تا الگو
   پیدا شود، بعد با الگو جوابِ بزرگ را بگو. مثالش هم همین است: «اگر شکلِ
   دهم با ۲۸ چوب ساخته شود، شکلِ یازدهم با چند چوب ساخته می‌شود؟ آیا
   لازم است شکلِ دهم و یازدهم را بکشی؟»

   پس بازی سه ضرب‌آهنگ دارد:
     ۱) ماشین جلوی چشمت مرحلهٔ ۱ و ۲ را می‌سازد و تعدادِ چوب‌ها را
        روی پلاکِ برنجی می‌نویسد.
     ۲) مرحلهٔ ۳ را خودت می‌سازی — روی هر جای خالی می‌زنی و چوب می‌نشیند.
        حالا چهار عدد داری و پرشِ الگو را با چشم می‌بینی.
     ۳) صفحهٔ ماشین یک مرحلهٔ دور می‌پرسد. عقربهٔ برنجی را می‌چرخانی و
        اهرم را می‌کشی. درست بود، ماشین می‌سازدش.

   هیچ‌جا جوابی نوشته نمی‌شود؛ فقط مرحله‌های کوچک و شمارشِ خودت.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  wall:  '#241a15', wallHi: '#3a2a20', wallLo: '#120c09',
  wood:  '#553a22', woodDk: '#33210f', woodLt: '#7a5530',
  brass: '#c9a04a', brassDk: '#8a6a24', brassLt: '#f2dd9a', brassHi: '#fff6d4',
  iron:  '#4c5158', ironDk: '#2b2f34', ironLt: '#7e858e',
  glass: 'rgba(150, 210, 220, .12)', glassEdge: 'rgba(190, 235, 245, .3)',
  rod:   '#e8b45c', rodLit: '#ffe6a8', rodDk: '#a2762c',
  ghost: 'rgba(232, 180, 92, .16)',
  lamp:  '#ffcf80',
  paper: '#f6e8c8', ink: '#2e2415', inkSoft: '#8a7550',
  good:  '#6fa85c', bad: '#cd5b3f', gold: '#eab53f',
};

/* چهار خانوادهٔ شکل. تعدادِ چوب = k×n + c */
const FAMS = [
  { id: 'tri',   n: 'قطارِ مثلث',    k: 2, c: 1, w: .5, h: 1 },
  { id: 'sq',    n: 'قطارِ مربّع',    k: 3, c: 1, w: 1,  h: 1 },
  { id: 'cross', n: 'ستاره‌ها',       k: 4, c: 0, w: 1.7, h: 1.4 },
  { id: 'hex',   n: 'زنجیرِ شش‌ضلعی', k: 5, c: 1, w: 1.74, h: 2 },
];

const LEVELS = [
  { name: 'راه‌اندازی', fams: ['tri'], far: [5, 6], next: .5, time: 70, quota: 3,
    hint: 'ماشین دو مرحلهٔ اوّل را می‌سازد. مرحلهٔ سوم با توست.' },
  { name: 'دنده دو',   fams: ['tri', 'sq'], far: [5, 7], next: .5, time: 68, quota: 4,
    hint: 'به پرشِ عددها نگاه کن: هر مرحله چند تا اضافه می‌شود؟' },
  { name: 'چرخِ سوم',  fams: ['sq', 'cross'], far: [6, 8], next: .4, time: 64, quota: 4,
    hint: 'گاهی می‌پرسد مرحلهٔ بعدِ یک مرحلهٔ دور چند چوب می‌خواهد.' },
  { name: 'دیگِ بخار', fams: ['sq', 'cross', 'hex'], far: [6, 8], next: .35, time: 58, quota: 5,
    hint: 'فشارِ بخار بالا می‌رود. زود بساز.' },
  { name: 'تا آخرِ شب', fams: null, far: [5, 9], next: .4, time: 58, endless: true,
    hint: 'تا دیگ نترکیده، الگوها را پیدا کن.' },
];

const HUD_H = 52;
const SHELF = { x: 22, y: 82, w: 686, h: 178 };
const STAGE = { x: 22, y: 276, w: 686, h: 322 };
const PANEL = { x: 728, y: 82, w: 450, h: 596 };
const DIAL = { x: 953, y: 452, r: 116 };
const LEVER = { x: 1108, y: 356, w: 54, h: 210 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };
const MAXV = 50;

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  fam: FAMS[0],
  buildN: 3,
  askN: 6, askNext: false, askBase: 0,
  answer: 0,
  segs: [],            // چوب‌های مرحلهٔ ۳: { a, b, on }
  watch: 0,
  stage: 'watch',      // watch → build → ask → show
  dial: 0, dragDial: false,
  lever: 0, leverT: 0,
  showT: 0, ok: false,
  timeLeft: 0,
  bolts: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  sparks: [], steam: [],
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const count = (f, n) => f.k * n + f.c;

function loadBest() { try { return +localStorage.getItem('olgu-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('olgu-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

/* ───────── هندسهٔ شکل‌ها ───────── */

const key = (x, y) => Math.round(x * 1000) + ',' + Math.round(y * 1000);

/** چوب‌های مرحلهٔ n از خانوادهٔ f، در دستگاهِ واحد. تکراری‌ها حذف می‌شوند. */
function shapeSegs(f, n) {
  const out = [], seen = {};
  const add = (x1, y1, x2, y2) => {
    const k1 = key(x1, y1), k2 = key(x2, y2);
    const k = k1 < k2 ? k1 + '|' + k2 : k2 + '|' + k1;
    if (seen[k]) return;
    seen[k] = 1;
    out.push({ x1, y1, x2, y2 });
  };
  if (f.id === 'tri') {
    const p = (i) => ({ x: i * .5, y: i % 2 ? 1 : 0 });
    for (let i = 0; i <= n; i++) { const a = p(i), b = p(i + 1); add(a.x, a.y, b.x, b.y); }
    for (let i = 0; i < n; i++) { const a = p(i), b = p(i + 2); add(a.x, a.y, b.x, b.y); }
  } else if (f.id === 'sq') {
    for (let i = 0; i <= n; i++) add(i, 0, i, 1);
    for (let i = 0; i < n; i++) { add(i, 0, i + 1, 0); add(i, 1, i + 1, 1); }
  } else if (f.id === 'cross') {
    for (let i = 0; i < n; i++) {
      const cx = i * 1.7 + .7, cy = .7;
      add(cx, cy, cx, cy - .7); add(cx, cy, cx, cy + .7);
      add(cx, cy, cx - .7, cy); add(cx, cy, cx + .7, cy);
    }
  } else {
    const R = 1, dx = Math.sqrt(3) * R;
    for (let i = 0; i < n; i++) {
      const cx = i * dx + dx / 2, cy = R;
      const v = [];
      for (let k = 0; k < 6; k++) {
        const a = (30 + k * 60) * Math.PI / 180;
        v.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R });
      }
      for (let k = 0; k < 6; k++) add(v[k].x, v[k].y, v[(k + 1) % 6].x, v[(k + 1) % 6].y);
    }
  }
  return out;
}

/** جعبهٔ در بر گیرندهٔ شکل، برای جا دادنش در کادر. */
function shapeBox(segs) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const s of segs) {
    x0 = Math.min(x0, s.x1, s.x2); x1 = Math.max(x1, s.x1, s.x2);
    y0 = Math.min(y0, s.y1, s.y2); y1 = Math.max(y1, s.y1, s.y2);
  }
  return { x0, y0, w: x1 - x0 || 1, h: y1 - y0 || 1 };
}

/** تبدیلِ شکل به مختصاتِ صفحه، وسطِ کادر. */
function fitShape(segs, box, pad) {
  const b = shapeBox(segs);
  const s = Math.min((box.w - pad * 2) / b.w, (box.h - pad * 2) / b.h);
  const ox = box.x + (box.w - b.w * s) / 2 - b.x0 * s;
  const oy = box.y + (box.h - b.h * s) / 2 - b.y0 * s;
  return segs.map((q) => ({
    a: { x: ox + q.x1 * s, y: oy + q.y1 * s },
    b: { x: ox + q.x2 * s, y: oy + q.y2 * s },
  }));
}

/* ───────── دور تازه ───────── */

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function newRound() {
  const lv = L();
  const ids = lv.fams || FAMS.map((f) => f.id);
  /* شناسه را یک‌بار انتخاب می‌کنیم؛ اگر داخلِ شرطِ find بماند، هر بار
     عددِ تصادفیِ تازه‌ای می‌دهد و ممکن است هیچ خانواده‌ای جور درنیاید. */
  const pick = ids[Math.floor(Math.random() * ids.length)];
  S.fam = FAMS.find((f) => f.id === pick) || FAMS[0];
  S.buildN = 3;
  S.segs = fitShape(shapeSegs(S.fam, S.buildN), STAGE, 46).map((q) => ({ a: q.a, b: q.b, on: false }));
  /* عددها باید روی عقربه جا شوند و برای کلاسِ سوم قابلِ حساب بمانند */
  const top = MAXV - 6;
  S.askNext = Math.random() < lv.next;
  for (let tries = 0; tries < 40; tries++) {
    if (S.askNext) {
      S.askBase = R(lv.far[0] + 1, lv.far[1] + 3);
      S.askN = S.askBase + 1;
    } else {
      S.askN = R(lv.far[0], lv.far[1]);
      S.askBase = 0;
    }
    if (count(S.fam, S.askN) <= top) break;
    S.askN = Math.max(4, Math.floor(top / S.fam.k));
    S.askBase = S.askNext ? S.askN - 1 : 0;
  }
  S.answer = count(S.fam, S.askN);
  S.dial = 0;
  S.lever = 0; S.leverT = 0;
  S.stage = 'watch';
  S.watch = 0;
  S.showT = 0;
  S.sparks = [];
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.bolts = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newRound();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.leverT > 0) S.leverT -= dt;
  S.lever += ((S.leverT > 0 ? 1 : 0) - S.lever) * Math.min(1, dt * 10);
  for (const q of S.sparks) { q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 620 * dt; }
  S.sparks = S.sparks.filter((q) => q.t < .7);
  for (const q of S.steam) { q.t += dt; q.y -= q.sp * dt; q.r += 16 * dt; }
  S.steam = S.steam.filter((q) => q.t < 2);
  if (Math.random() < dt * 1.6) {
    S.steam.push({ x: 760 + Math.random() * 40, y: 690, r: 6 + Math.random() * 6,
                   sp: 26 + Math.random() * 22, t: 0 });
  }

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (S.stage === 'watch') { S.watch += dt; if (S.watch > 2.4) S.stage = 'build'; }
    if (S.stage === 'show') {
      S.showT += dt;
      if (S.showT > 2.1) { if (S.phase === 'play') newRound(); }
    }
    if (!frozen && S.stage !== 'show') {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseBolt('دیگِ بخار سر رفت!'); }
    }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseBolt(msg) {
  S.bolts--;
  S.combo = 0;
  S.shake = .45;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.bolts <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newRound();
}

function spark(x, y, n, col) {
  for (let i = 0; i < n; i++) {
    S.sparks.push({ x, y, t: 0, r: 1.2 + Math.random() * 2, col,
      vx: (Math.random() - .5) * 240, vy: -60 - Math.random() * 180 });
  }
}

const placed = () => S.segs.filter((q) => q.on).length;

function pullLever() {
  if (S.stage !== 'ask') return;
  S.leverT = .5;
  sfx.tone(180, .22, 'sawtooth', .05);
  S.ok = S.dial === S.answer;
  S.stage = 'show';
  S.showT = 0;
  if (S.ok) {
    S.combo++;
    S.cleared++;
    const pts = 300 + Math.round(S.timeLeft * 6) + Math.min(S.combo, 6) * 70;
    S.score += pts;
    if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
    bits.confetti(DIAL.x, DIAL.y, 40, [P.brassLt, P.gold, '#fff', P.rodLit]);
    sfx.win();
    toast.say('درست! ماشین ساختش.', 'good');
    if (S.tut.on) S.tut.on = false;
    if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
  } else {
    S.combo = 0;
    S.bolts--;
    S.shake = .45;
    sfx.nope();
    toast.say('ماشین گیر کرد. ببین چند تا لازم بود.', 'bad');
    if (S.bolts <= 0) { S.phase = 'lost'; S.phaseT = 0; }
  }
}

/* ───────── ورودی ───────── */

function segHit(p, q) {
  const dx = q.b.x - q.a.x, dy = q.b.y - q.a.y;
  const L2 = dx * dx + dy * dy || 1;
  let u = clamp(((p.x - q.a.x) * dx + (p.y - q.a.y) * dy) / L2, 0, 1);
  return Math.hypot(p.x - (q.a.x + dx * u), p.y - (q.a.y + dy * u)) < 17;
}

function dialValue(p) {
  const a = Math.atan2(p.y - DIAL.y, p.x - DIAL.x);
  let deg = a * 180 / Math.PI + 90;            // ۰ درجه = بالا
  if (deg > 180) deg -= 360;
  const k = clamp((deg + 140) / 280, 0, 1);
  return Math.round(k * MAXV);
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.dragDial) { S.dial = dialValue(p); return; }
  S.hover = null;
  if (S.stage === 'ask') {
    if (Math.hypot(p.x - DIAL.x, p.y - DIAL.y) < DIAL.r + 16) S.hover = 'dial';
    else if (inRect(p, LEVER)) S.hover = 'lever';
  }
  cv.style.cursor = S.hover ? 'grab' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { startLevel(0); return; }
  if (S.phase === 'won') {
    if (!inRect(p, BTN_GO)) return;
    if (L().endless) startLevel(S.level, true);
    else if (S.level + 1 < LEVELS.length) startLevel(S.level + 1, true);
    else startLevel(0);
    return;
  }
  if (S.phase === 'lost') { if (inRect(p, BTN_GO)) startLevel(S.level); return; }
  if (tutTap(S.tut, TUT_TAP, TUT_LAST)) return;

  if (S.stage === 'build') {
    for (const q of S.segs) {
      if (q.on || !segHit(p, q)) continue;
      q.on = true;
      spark((q.a.x + q.b.x) / 2, (q.a.y + q.b.y) / 2, 6, P.rodLit);
      sfx.tone(420 + placed() * 16, .07, 'triangle', .045);
      if (placed() === S.segs.length) {
        S.stage = 'ask';
        sfx.good();
        if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
      }
      return;
    }
    return;
  }
  if (S.stage === 'ask') {
    if (Math.hypot(p.x - DIAL.x, p.y - DIAL.y) < DIAL.r + 16) {
      S.dragDial = true;
      S.dial = dialValue(p);
      sfx.tap();
      try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
      return;
    }
    if (inRect(p, LEVER)) pullLever();
  }
});

cv.addEventListener('pointerup', () => { S.dragDial = false; });
cv.addEventListener('pointercancel', () => { S.dragDial = false; });

const TUT_TAP = [0, 2], TUT_LAST = 2;

/* ───────── ابزارِ نقاشی ───────── */

function rrPath(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function numText(str, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.family === 'Vazirmatn' ? (o.weight || 700) : '400'} ${o.size || 20}px "${o.family || 'Lalezar'}", Tahoma, sans-serif`;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'ltr';
  ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
  if (o.stroke) { ctx.lineWidth = o.strokeWidth || 5; ctx.lineJoin = 'round';
    ctx.strokeStyle = o.stroke; ctx.strokeText(str, x, y); }
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(8, 5, 3, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(246, 232, 200, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '8, 5, 3');
  ctx.fillStyle = P.brassDk;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6b5a3a' }); yy += 30; }
  return h + 20;
}

/** قابِ برنجیِ پیچ‌دار — واحدِ تکرارشوندهٔ همهٔ ماشین. */
function brassFrame(x, y, w, h, r, inner) {
  ctx.fillStyle = shade(P.brassDk, -.5);
  ctx.beginPath(); rrPath(x - 5, y - 5, w + 10, h + 10, r + 5); ctx.fill();
  const g = ctx.createLinearGradient(0, y - 5, 0, y + h + 5);
  g.addColorStop(0, P.brassLt);
  g.addColorStop(.35, P.brass);
  g.addColorStop(.7, P.brassDk);
  g.addColorStop(1, P.brass);
  ctx.fillStyle = g;
  ctx.beginPath(); rrPath(x - 4, y - 4, w + 8, h + 8, r + 4); ctx.fill();
  ctx.fillStyle = inner || '#0f0b07';
  ctx.beginPath(); rrPath(x, y, w, h, r); ctx.fill();
  /* پیچ‌های گوشه */
  for (const [sx, sy] of [[x + 4, y + 4], [x + w - 4, y + 4], [x + 4, y + h - 4], [x + w - 4, y + h - 4]]) {
    ctx.fillStyle = shade(P.brassDk, -.3);
    ctx.beginPath(); ctx.arc(sx, sy, 4.4, 0, TAU); ctx.fill();
    ctx.fillStyle = P.brassLt;
    ctx.beginPath(); ctx.arc(sx - .8, sy - .8, 2.4, 0, TAU); ctx.fill();
  }
}

/** یک چوبِ برنجی. */
function rod(a, b, lit, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha === undefined ? 1 : alpha;
  ctx.lineCap = 'round';
  if (lit) {
    ctx.strokeStyle = 'rgba(255, 220, 150, .22)'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  ctx.strokeStyle = lit ? P.rodDk : P.ghost; ctx.lineWidth = lit ? 9 : 6;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  if (lit) {
    ctx.strokeStyle = P.rod; ctx.lineWidth = 6.4;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.strokeStyle = P.rodLit; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(a.x + 1, a.y - 1.4); ctx.lineTo(b.x + 1, b.y - 1.4); ctx.stroke();
    ctx.fillStyle = P.rodLit;
    ctx.beginPath(); ctx.arc(a.x, a.y, 3.2, 0, TAU); ctx.arc(b.x, b.y, 3.2, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawShape(segs, box, pad, upTo) {
  const fitted = fitShape(segs, box, pad);
  const n = upTo === undefined ? fitted.length : upTo;
  for (let i = 0; i < fitted.length; i++) rod(fitted[i].a, fitted[i].b, i < n, 1);
}

/* ───────── صحنه ───────── */

function paintWorkshopStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallLo);
  g.addColorStop(.4, P.wall);
  g.addColorStop(1, P.wallHi);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.globalAlpha = .5;
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* تخته‌های دیوار */
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 3;
  for (let y = 120; y < SCENE_H; y += 96) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke();
  }
  /* لوله‌های برنجیِ پس‌زمینه */
  for (const px of [714, 1188]) {
    ctx.strokeStyle = shade(P.brassDk, -.4); ctx.lineWidth = 20;
    ctx.beginPath(); ctx.moveTo(px, HUD_H); ctx.lineTo(px, SCENE_H); ctx.stroke();
    ctx.strokeStyle = P.brassDk; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(px, HUD_H); ctx.lineTo(px, SCENE_H); ctx.stroke();
    ctx.strokeStyle = P.brass; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(px - 4, HUD_H); ctx.lineTo(px - 4, SCENE_H); ctx.stroke();
    for (let y = 130; y < SCENE_H; y += 150) {
      ctx.fillStyle = P.brassDk;
      ctx.beginPath(); rrPath(px - 14, y, 28, 20, 5); ctx.fill();
      ctx.fillStyle = P.brassLt;
      ctx.fillRect(px - 14, y + 2, 28, 3);
    }
  }
  /* کفِ کارگاه */
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.fillRect(0, 690, SCENE_W, SCENE_H - 690);
  ctx.fillStyle = P.ironDk;
  ctx.fillRect(0, 690, SCENE_W, 10);
  ctx.fillStyle = P.iron;
  ctx.fillRect(0, 690, SCENE_W, 4);
}

function draw() {
  beginScene(P.wall);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('shop', SCENE_W, SCENE_H, paintWorkshopStatic), 0, 0, SCENE_W, SCENE_H);
  drawLamp();
  drawShelf();
  drawStage();
  drawPanel();
  drawSteam();
  drawSparks();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    ctx.save();
    ctx.translate(STAGE.x + STAGE.w / 2 - SCENE_W / 2, 0);
    toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
    ctx.restore();
  }
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.1, 'rgba(6, 4, 2, .55)', .42, .16);
}

function drawLamp() {
  const cx = STAGE.x + STAGE.w / 2;
  const fl = .95 + Math.sin(S.t * 6) * .05;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cg = ctx.createLinearGradient(0, 70, 0, 660);
  cg.addColorStop(0, 'rgba(150, 112, 50, .45)');
  cg.addColorStop(1, 'rgba(80, 58, 24, 0)');
  ctx.fillStyle = cg;
  for (const k of [1, .66]) {
    ctx.globalAlpha = k * .5;
    ctx.beginPath();
    ctx.moveTo(cx - 30 * k, 70); ctx.lineTo(cx + 30 * k, 70);
    ctx.lineTo(cx + 420 * k, 700); ctx.lineTo(cx - 420 * k, 700);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = P.lamp;
  ctx.beginPath(); ctx.ellipse(cx, 72, 30 * fl, 9, 0, 0, TAU); ctx.fill();
}

/** سه پنجرهٔ مرحله‌های کوچک — همان «مسئلهٔ ساده‌تر»ِ کتاب. */
function drawShelf() {
  const wBox = (SHELF.w - 24) / 3;
  for (let i = 0; i < 3; i++) {
    const n = i + 1;
    const box = { x: SHELF.x + i * (wBox + 12), y: SHELF.y, w: wBox, h: SHELF.h };
    brassFrame(box.x, box.y, box.w, box.h - 40, 10, '#120d08');
    /* شیشه */
    ctx.save();
    ctx.beginPath(); rrPath(box.x, box.y, box.w, box.h - 40, 10); ctx.clip();
    ctx.fillStyle = P.glass;
    ctx.fillRect(box.x, box.y, box.w, box.h - 40);
    const gg = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
    gg.addColorStop(0, 'rgba(255,255,255,.1)');
    gg.addColorStop(.5, 'rgba(255,255,255,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(box.x, box.y, box.w, box.h - 40);
    const ready = S.stage !== 'watch' || S.watch > .7 * n;
    if (ready) {
      const segs = shapeSegs(S.fam, n);
      const k = S.stage === 'watch' ? clamp((S.watch - .7 * (n - 1)) / .7, 0, 1) : 1;
      drawShape(segs, { x: box.x, y: box.y, w: box.w, h: box.h - 40 }, 26,
        Math.round(segs.length * k));
    }
    ctx.restore();
    /* پلاکِ برنجیِ زیرِ پنجره */
    const py = box.y + box.h - 34;
    ctx.fillStyle = shade(P.brassDk, -.4);
    ctx.beginPath(); rrPath(box.x + 14, py, box.w - 28, 30, 7); ctx.fill();
    const pg = ctx.createLinearGradient(0, py, 0, py + 30);
    pg.addColorStop(0, P.brass); pg.addColorStop(1, P.brassDk);
    ctx.fillStyle = pg;
    ctx.beginPath(); rrPath(box.x + 15, py + 1, box.w - 30, 27, 6); ctx.fill();
    const ready2 = S.stage !== 'watch' || S.watch > .7 * n;
    text('مرحلهٔ ' + fa(n), box.x + box.w / 2 + 44, py + 15, { size: 17, family: 'Lalezar', color: '#2a1e08' });
    numText(ready2 ? fa(count(S.fam, n)) : '—', box.x + box.w / 2 - 40, py + 15,
      { size: 23, color: '#2a1e08' });
  }
}

/** سکوی ساخت: مرحلهٔ سوم را خودت می‌سازی. */
function drawStage() {
  const b = STAGE;
  brassFrame(b.x, b.y, b.w, b.h, 12, '#0d0906');
  ctx.save();
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.clip();
  /* نورِ کفِ سکو */
  const gg = ctx.createRadialGradient(b.x + b.w / 2, b.y + b.h / 2, 20, b.x + b.w / 2, b.y + b.h / 2, b.w * .6);
  gg.addColorStop(0, 'rgba(255, 200, 110, .16)');
  gg.addColorStop(1, 'rgba(255, 200, 110, 0)');
  ctx.fillStyle = gg;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = 'rgba(201, 160, 74, .08)'; ctx.lineWidth = 1;
  for (let x = b.x; x < b.x + b.w; x += 28) { ctx.beginPath(); ctx.moveTo(x, b.y); ctx.lineTo(x, b.y + b.h); ctx.stroke(); }
  for (let y = b.y; y < b.y + b.h; y += 28) { ctx.beginPath(); ctx.moveTo(b.x, y); ctx.lineTo(b.x + b.w, y); ctx.stroke(); }

  if (S.stage === 'show') {
    /* ماشین جوابِ خودش را می‌سازد */
    const segs = shapeSegs(S.fam, Math.min(S.askN, 12));
    const k = clamp(S.showT / 1.2, 0, 1);
    drawShape(segs, b, 40, Math.round(segs.length * k));
    ctx.restore();
    const msg = S.ok ? 'مرحلهٔ ' + fa(S.askN) : 'مرحلهٔ ' + fa(S.askN) + ' این‌قدر چوب داشت';
    ctx.save();
    ctx.globalAlpha = clamp(S.showT * 2, 0, 1);
    ctx.fillStyle = S.ok ? 'rgba(30, 60, 24, .8)' : 'rgba(80, 24, 14, .82)';
    ctx.beginPath(); rrPath(b.x + b.w / 2 - 170, b.y + b.h - 62, 340, 46, 12); ctx.fill();
    text(msg, b.x + b.w / 2 + (S.ok ? 0 : 56), b.y + b.h - 39,
      { size: 20, family: 'Lalezar', color: '#fff' });
    if (!S.ok) numText(fa(count(S.fam, S.askN)), b.x + b.w / 2 - 118, b.y + b.h - 39,
      { size: 26, color: P.rodLit });
    ctx.restore();
    return;
  }
  for (const q of S.segs) rod(q.a, q.b, q.on, 1);
  ctx.restore();

  /* برچسبِ سکو */
  const done = placed() === S.segs.length;
  ctx.fillStyle = 'rgba(12, 9, 6, .8)';
  ctx.beginPath(); rrPath(b.x + 14, b.y + 12, 250, 38, 10); ctx.fill();
  text(S.stage === 'watch' ? 'ماشین دارد می‌سازد…' : (done ? 'مرحلهٔ ۳ ساخته شد' : 'مرحلهٔ ۳ را تو بساز'),
    b.x + 100, b.y + 31, { size: 18, family: 'Lalezar', color: P.brassLt });
  numText(fa(placed()) + '/' + fa(S.segs.length), b.x + 218, b.y + 31, { size: 19, color: P.rod });
}

function drawSparks() {
  for (const q of S.sparks) {
    ctx.save();
    ctx.globalAlpha = clamp(1 - q.t / .7, 0, 1);
    ctx.fillStyle = q.col;
    ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function drawSteam() {
  for (const q of S.steam) {
    ctx.save();
    ctx.globalAlpha = clamp(1 - q.t / 2, 0, 1) * .22;
    ctx.fillStyle = '#dfe6ea';
    ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

/** تابلوی سؤال، عقربهٔ برنجی و اهرم. */
function drawPanel() {
  const b = PANEL;
  brassFrame(b.x, b.y, b.w, b.h, 14, '#171009');
  ctx.save();
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 14); ctx.clip();
  ctx.globalAlpha = .45;
  ctx.fillStyle = texStone('#241a10', '#0b0705');
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.restore();

  /* تابلوی سؤال */
  const q = { x: b.x + 26, y: b.y + 26, w: b.w - 52, h: 148 };
  ctx.fillStyle = '#0a1512';
  ctx.beginPath(); rrPath(q.x, q.y, q.w, q.h, 10); ctx.fill();
  ctx.strokeStyle = shade(P.brassDk, -.1); ctx.lineWidth = 4;
  ctx.beginPath(); rrPath(q.x, q.y, q.w, q.h, 10); ctx.stroke();
  const glow = S.stage === 'ask' ? .55 + .25 * Math.sin(S.t * 3) : .2;
  ctx.save();
  ctx.globalAlpha = glow;
  const gg = ctx.createRadialGradient(q.x + q.w / 2, q.y + q.h / 2, 8, q.x + q.w / 2, q.y + q.h / 2, q.w * .6);
  gg.addColorStop(0, 'rgba(120, 255, 200, .3)');
  gg.addColorStop(1, 'rgba(120, 255, 200, 0)');
  ctx.fillStyle = gg;
  ctx.fillRect(q.x, q.y, q.w, q.h);
  ctx.restore();

  text('نامِ الگو: ' + S.fam.n, q.x + q.w / 2, q.y + 26, { size: 16, color: 'rgba(160, 240, 210, .7)' });
  if (S.stage === 'ask' || S.stage === 'show') {
    if (S.askNext) {
      text('مرحلهٔ ' + fa(S.askBase) + ' با ' + fa(count(S.fam, S.askBase)) + ' چوب ساخته می‌شود.',
        q.x + q.w / 2, q.y + 62, { size: 17, color: '#9ff0d2' });
      text('مرحلهٔ ' + fa(S.askN) + ' چند چوب می‌خواهد؟',
        q.x + q.w / 2, q.y + 100, { size: 24, family: 'Lalezar', color: '#c8ffe8' });
    } else {
      text('مرحلهٔ ' + fa(S.askN) + ' چند چوب می‌خواهد؟',
        q.x + q.w / 2, q.y + 82, { size: 26, family: 'Lalezar', color: '#c8ffe8' });
      text('لازم نیست بکشی‌اش — الگو را ببین.', q.x + q.w / 2, q.y + 118,
        { size: 15, color: 'rgba(160, 240, 210, .6)' });
    }
  } else {
    text('اوّل مرحلهٔ ۳ را بساز', q.x + q.w / 2, q.y + 84, { size: 22, family: 'Lalezar', color: 'rgba(160, 240, 210, .5)' });
  }

  /* عقربهٔ برنجی */
  const d = DIAL, live = S.stage === 'ask';
  ctx.fillStyle = shade(P.brassDk, -.5);
  ctx.beginPath(); ctx.arc(d.x, d.y + 5, d.r + 10, 0, TAU); ctx.fill();
  const dg = ctx.createLinearGradient(0, d.y - d.r, 0, d.y + d.r);
  dg.addColorStop(0, P.brassLt); dg.addColorStop(.45, P.brass); dg.addColorStop(1, P.brassDk);
  ctx.fillStyle = dg;
  ctx.beginPath(); ctx.arc(d.x, d.y, d.r + 8, 0, TAU); ctx.fill();
  ctx.fillStyle = '#120d08';
  ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill();
  const fg = ctx.createRadialGradient(d.x - d.r * .3, d.y - d.r * .4, 4, d.x, d.y, d.r);
  fg.addColorStop(0, 'rgba(255, 230, 170, .12)');
  fg.addColorStop(1, 'rgba(255, 230, 170, 0)');
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill();
  /* درجه‌ها */
  for (let v = 0; v <= MAXV; v++) {
    const a = (-140 + (v / MAXV) * 280 - 90) * Math.PI / 180;
    const big = v % 5 === 0;
    ctx.strokeStyle = big ? P.brassLt : 'rgba(201, 160, 74, .45)';
    ctx.lineWidth = big ? 2.6 : 1.4;
    const r0 = d.r - (big ? 18 : 11), r1 = d.r - 4;
    ctx.beginPath();
    ctx.moveTo(d.x + Math.cos(a) * r0, d.y + Math.sin(a) * r0);
    ctx.lineTo(d.x + Math.cos(a) * r1, d.y + Math.sin(a) * r1);
    ctx.stroke();
    if (v % 10 === 0) {
      numText(fa(v), d.x + Math.cos(a) * (d.r - 34), d.y + Math.sin(a) * (d.r - 34),
        { size: 16, color: 'rgba(242, 221, 154, .8)' });
    }
  }
  /* عقربه */
  const ang = (-140 + (clamp(S.dial, 0, MAXV) / MAXV) * 280 - 90) * Math.PI / 180;
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.rotate(ang);
  ctx.fillStyle = live ? '#e2503a' : '#7b4034';
  ctx.beginPath();
  ctx.moveTo(d.r - 16, 0); ctx.lineTo(-14, -7); ctx.lineTo(-14, 7);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); ctx.arc(d.x, d.y, 15, 0, TAU); ctx.fill();
  ctx.fillStyle = P.brassLt;
  ctx.beginPath(); ctx.arc(d.x - 2, d.y - 2, 8, 0, TAU); ctx.fill();
  /* پنجرهٔ عدد */
  ctx.fillStyle = '#0a0f0d';
  ctx.beginPath(); rrPath(d.x - 54, d.y + d.r - 54, 108, 46, 8); ctx.fill();
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(d.x - 54, d.y + d.r - 54, 108, 46, 8); ctx.stroke();
  numText(fa(S.dial), d.x, d.y + d.r - 30, { size: 32, color: live ? '#8affd0' : '#3d6b5c' });
  text('چوب', d.x, d.y - d.r + 34, { size: 15, color: 'rgba(242, 221, 154, .55)' });

  /* اهرم */
  const lv = LEVER, hot = S.hover === 'lever' && live;
  ctx.fillStyle = shade(P.ironDk, -.3);
  ctx.beginPath(); rrPath(lv.x, lv.y, lv.w, lv.h, 22); ctx.fill();
  ctx.fillStyle = P.ironDk;
  ctx.beginPath(); rrPath(lv.x + 4, lv.y + 4, lv.w - 8, lv.h - 8, 18); ctx.fill();
  const ky = lv.y + 26 + S.lever * (lv.h - 78);
  ctx.strokeStyle = P.iron; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(lv.x + lv.w / 2, lv.y + lv.h - 30); ctx.lineTo(lv.x + lv.w / 2, ky); ctx.stroke();
  ctx.strokeStyle = P.ironLt; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(lv.x + lv.w / 2 - 2, lv.y + lv.h - 34); ctx.lineTo(lv.x + lv.w / 2 - 2, ky); ctx.stroke();
  const kg = ctx.createRadialGradient(lv.x + lv.w / 2 - 6, ky - 6, 2, lv.x + lv.w / 2, ky, 24);
  kg.addColorStop(0, hot ? '#ff9d76' : '#e0603c');
  kg.addColorStop(1, hot ? '#c03d1e' : '#8d2f18');
  ctx.fillStyle = kg;
  ctx.beginPath(); ctx.arc(lv.x + lv.w / 2, ky, 22, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.beginPath(); ctx.ellipse(lv.x + lv.w / 2 - 7, ky - 8, 7, 4, -.6, 0, TAU); ctx.fill();
  text('بکِش', lv.x + lv.w / 2, lv.y + lv.h + 20, { size: 16, family: 'Lalezar', color: live ? P.brassLt : 'rgba(201,160,74,.4)' });

  /* فشارسنجِ بخار = وقت */
  const gx0 = b.x + 30, gy0 = b.y + b.h - 74, gw = b.w - 60;
  const k = clamp(S.timeLeft / L().time, 0, 1);
  ctx.fillStyle = '#0d0a06';
  ctx.beginPath(); rrPath(gx0, gy0, gw, 26, 13); ctx.fill();
  const bg2 = ctx.createLinearGradient(gx0, 0, gx0 + gw, 0);
  bg2.addColorStop(0, '#c8452c'); bg2.addColorStop(.4, P.gold); bg2.addColorStop(1, '#6fa85c');
  ctx.save();
  ctx.beginPath(); rrPath(gx0 + 3, gy0 + 3, (gw - 6) * k, 20, 10); ctx.clip();
  ctx.fillStyle = bg2;
  ctx.fillRect(gx0, gy0, gw, 26);
  ctx.restore();
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(gx0, gy0, gw, 26, 13); ctx.stroke();
  text(k < .3 ? 'فشارِ دیگ بالاست!' : 'فشارِ دیگ', b.x + b.w / 2, gy0 - 14,
    { size: 15, color: k < .3 ? '#ff9e86' : 'rgba(242, 221, 154, .6)' });
}

function drawHUD() {
  ctx.fillStyle = 'rgba(22, 15, 9, .9)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(201, 160, 74, .35)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 208 - i * 32;
    ctx.save();
    ctx.globalAlpha = i < S.bolts ? 1 : .22;
    ctx.fillStyle = i < S.bolts ? P.brass : '#7d766a';
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = k * TAU / 6;
      ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * 11, HUD_H / 2 + Math.sin(a) * 11);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(22,15,9,.7)';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, 4.4, 0, TAU); ctx.fill();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(246, 232, 200, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([SHELF], .74);
    const h = tutCard(230, 300, 560,
      ['ماشین دو مرحلهٔ اوّل را می‌سازد', 'و تعدادِ چوب‌ها را روی پلاک می‌نویسد.'], 'ماشینِ الگو');
    tutMore(510, 300 + h + 12, S.t, P.ink);
  } else if (st === 1) {
    spot([STAGE], .7);
    tutCard(230, 116, 560, ['مرحلهٔ ۳ را خودت بساز:',
      'روی هر جای خالی بزن تا چوب بنشیند.']);
  } else {
    spot([PANEL], .7);
    const h = tutCard(150, 300, 540,
      ['حالا چهار عدد داری. پرشِ الگو را ببین.', 'عقربه را بچرخان روی عددی که فکر می‌کنی،',
       'بعد اهرم را بکِش.'], 'عقربه و اهرم');
    tutMore(420, 300 + h + 12, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function gearIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(S.t * .5);
  ctx.fillStyle = P.brassDk;
  for (let i = 0; i < 8; i++) {
    const a = i * TAU / 8;
    ctx.save(); ctx.rotate(a);
    ctx.fillRect(-5, -30, 10, 14);
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill();
  ctx.fillStyle = P.brass;
  ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2e2415';
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 760, h: 290, y: 136,
    paper: P.paper, band: P.brassDk, ink: P.ink, inkSoft: '#7f6c48',
    icon: gearIcon,
    title: 'ماشینِ الگو',
    body: 'ماشین مرحلهٔ ۱ و ۲ را می‌سازد و تعدادِ چوب‌ها را می‌نویسد.\nمرحلهٔ ۳ را تو می‌سازی — آن‌وقت پرشِ الگو پیدا می‌شود.\nبعد ماشین یک مرحلهٔ دور می‌پرسد: عقربه را بچرخان و اهرم را بکِش.',
    btn: BTN_GO, btnLabel: 'روشنش کن', btnHot: S.hover === BTN_GO,
    btnFill: '#8a6a24', btnHotFill: '#a5822f',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#7f6c48',
    icon: gearIcon,
    title: L().endless ? 'کارگاه بست' : 'ماشین راه افتاد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ دنده‌ها را رد کردی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'دندهٔ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#8a6a24', btnHotFill: '#a5822f',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#7f6c48',
    icon: (x, y) => { ctx.fillStyle = '#9aa2a8';
      for (let i = 0; i < 3; i++) { ctx.globalAlpha = .5 - i * .12;
        ctx.beginPath(); ctx.arc(x - 14 + i * 15, y - i * 10, 14 - i * 2, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1; },
    title: 'دیگ سر رفت',
    body: 'امتیاز: ' + fa(S.score) + '\nاوّل پرشِ الگو را از عددهای کوچک پیدا کن.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#8a6a24', btnHotFill: '#a5822f',
  });
}

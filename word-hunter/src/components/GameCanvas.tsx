import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  LevelConfig,
  SpellingItem,
  Target,
  Arrow,
  Particle,
  FloatingText,
  ArrowType,
  ArcherBow,
} from '../types/game';
import { spellingContentAdapter } from '../services/SpellingContentAdapter';
import { audioService } from '../services/AudioService';
import confetti from 'canvas-confetti';

interface GameCanvasProps {
  level: LevelConfig;
  equippedBow: ArcherBow;
  activeArrowType: ArrowType;
  arrowInventory: Record<ArrowType, number>;
  isProjectorMode: boolean;
  isPaused: boolean;
  onConsumeArrow: (type: ArrowType) => void;
  onHitTarget: (isCorrect: boolean, points: number, item?: SpellingItem) => void;
  onCompleteLevel: (stars: number, score: number) => void;
  onSelectArrowType: (type: ArrowType) => void;
  currentCombo: number;
  score: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  equippedBow,
  activeArrowType,
  arrowInventory,
  isProjectorMode,
  isPaused,
  onConsumeArrow,
  onHitTarget,
  onCompleteLevel,
  onSelectArrowType,
  currentCombo,
  score,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Engine state in refs for maximum 60+ FPS performance without React re-render lag
  const stateRef = useRef<{
    width: number;
    height: number;
    // Archer
    archerX: number;
    archerY: number;
    aimAngle: number;
    isAiming: boolean;
    aimPower: number; // 0 to 1
    dragStartX: number;
    dragStartY: number;
    currentDragX: number;
    currentDragY: number;
    // Game Entities
    arrows: Arrow[];
    targets: Target[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    // Challenge
    currentItem: SpellingItem | null;
    targetsSolvedCount: number;
    bossHealth: number;
    bossMaxHealth: number;
    bossState: 'idle' | 'charging' | 'hit' | 'defeated';
    bossChargeTimer: number;
    // Word Rescue & Letter Snipe Specifics
    incompleteWordDisplay: string;
    missingLetterTarget: string;
    trappedWordCorrect: string;
    isCageBroken: boolean;
    // Timer for speed rush
    timeRemaining: number;
    lastFrameTime: number;
    // Shake effect
    screenShake: number;
    // Whisper mode audio played
    hasPlayedWhisper: boolean;
  }>({
    width: 1200,
    height: 700,
    archerX: 120,
    archerY: 560,
    aimAngle: -Math.PI / 6,
    isAiming: false,
    aimPower: 0,
    dragStartX: 0,
    dragStartY: 0,
    currentDragX: 0,
    currentDragY: 0,
    arrows: [],
    targets: [],
    particles: [],
    floatingTexts: [],
    currentItem: null,
    targetsSolvedCount: 0,
    bossHealth: level.bossMaxHealth || 6,
    bossMaxHealth: level.bossMaxHealth || 6,
    bossState: 'idle',
    bossChargeTimer: 0,
    incompleteWordDisplay: '',
    missingLetterTarget: '',
    trappedWordCorrect: '',
    isCageBroken: false,
    timeRemaining: level.timeLimit || 60,
    lastFrameTime: performance.now(),
    screenShake: 0,
    hasPlayedWhisper: false,
  });

  const [, setUiIncompleteWord] = useState<string>('');
  const [uiSolvedCount, setUiSolvedCount] = useState<number>(0);
  const [uiTimeRemaining, setUiTimeRemaining] = useState<number>(level.timeLimit || 60);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState<boolean>(false);

  // Initialize or spawn a round of targets based on level mode
  const setupNextChallenge = useCallback(() => {
    const s = stateRef.current;
    const item = spellingContentAdapter.getRandomItem(
      level.category,
      level.grade,
      level.difficulty
    );
    s.currentItem = item;

    const canvasW = s.width;

    // Clear previous targets
    s.targets = [];

    if (level.mode === 'word_hunt') {
      // Spawn 1 correct word + 2-3 incorrect variants as floating magical orbs
      const pool = [
        { text: item.correctSpelling, isCorrect: true },
        ...item.incorrectVariants.slice(0, 3).map((v) => ({ text: v, isCorrect: false })),
      ];

      // Shuffle pool
      const shuffled = pool.sort(() => Math.random() - 0.5);
      const targetColors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#10b981'];

      shuffled.forEach((targetData, idx) => {
        const spacingX = (canvasW - 380) / (shuffled.length + 1);
        const posX = 320 + spacingX * (idx + 1) + (Math.random() * 40 - 20);
        const posY = 160 + (idx % 2) * 140 + Math.random() * 50;

        s.targets.push({
          id: `target_word_${idx}_${Date.now()}`,
          type: 'word',
          text: targetData.text,
          isCorrect: targetData.isCorrect,
          x: posX,
          y: posY,
          vx: (Math.random() * 0.8 + 0.4) * (idx % 2 === 0 ? 1 : -1),
          vy: Math.random() * 0.5 - 0.25,
          radius: isProjectorMode ? 64 : 54,
          health: 1,
          maxHealth: 1,
          color: targetColors[idx % targetColors.length],
          glowColor: targetData.isCorrect ? '#38bdf8' : '#e879f9',
          bobOffset: Math.random() * Math.PI * 2,
          bobSpeed: 1.5 + Math.random() * 0.8,
          movePattern: idx % 2 === 0 ? 'horizontal' : 'vertical',
          patternParams: {
            minX: 300,
            maxX: canvasW - 80,
            minY: 100,
            maxY: 460,
          },
          itemData: item,
        });
      });
    } else if (level.mode === 'letter_snipe') {
      // Incomplete word displayed on stone tablet; letters float around
      s.incompleteWordDisplay = item.incompleteForm || `${item.correctSpelling[0]}_${item.correctSpelling.slice(2)}`;
      s.missingLetterTarget = item.missingLetter || item.correctSpelling[1] || 'ر';
      setUiIncompleteWord(s.incompleteWordDisplay);

      const candidateLetters = [
        { letter: s.missingLetterTarget, isCorrect: true },
        ...(item.decoyLetters || ['ز', 'س', 'د']).slice(0, 3).map((l) => ({ letter: l, isCorrect: false })),
      ].sort(() => Math.random() - 0.5);

      const crystalColors = ['#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'];

      candidateLetters.forEach((data, idx) => {
        const posX = 400 + (idx * 160) % (canvasW - 480);
        const posY = 200 + (idx % 3) * 110;

        s.targets.push({
          id: `letter_${idx}_${Date.now()}`,
          type: 'letter',
          text: data.letter,
          isCorrect: data.isCorrect,
          x: posX,
          y: posY,
          vx: (Math.random() * 1.2 + 0.5) * (idx % 2 === 0 ? 1 : -1),
          vy: Math.random() * 0.8 - 0.4,
          radius: isProjectorMode ? 46 : 38,
          health: 1,
          maxHealth: 1,
          color: crystalColors[idx % crystalColors.length],
          glowColor: data.isCorrect ? '#fbbf24' : '#c084fc',
          bobOffset: Math.random() * Math.PI * 2,
          bobSpeed: 2.0,
          movePattern: 'circle',
          patternParams: {
            centerX: posX,
            centerY: posY,
            radius: 40 + idx * 10,
            angle: idx * (Math.PI / 2),
            speed: 0.02 * (idx % 2 === 0 ? 1 : -1),
          },
          itemData: item,
        });
      });
    } else if (level.mode === 'word_rescue') {
      // Trapped golden word in center with dark cage lock targets
      s.trappedWordCorrect = item.correctSpelling;
      s.isCageBroken = false;

      // Center trapped word (invulnerable until locks broken)
      s.targets.push({
        id: `trapped_core_${Date.now()}`,
        type: 'trapped_word',
        text: item.correctSpelling,
        isCorrect: true,
        x: canvasW * 0.65,
        y: 280,
        vx: 0,
        vy: 0,
        radius: isProjectorMode ? 85 : 72,
        health: 1,
        maxHealth: 1,
        color: '#fbbf24',
        glowColor: '#f59e0b',
        bobOffset: 0,
        bobSpeed: 1.2,
        movePattern: 'static',
        cageBroken: false,
        itemData: item,
      });

      // 3 rotating cage lock targets (incorrect variants to shoot away)
      const lockWords = item.incorrectVariants.slice(0, 3);
      if (lockWords.length === 0) lockWords.push('غلط');

      lockWords.forEach((lw, idx) => {
        const angle = (idx * (Math.PI * 2)) / lockWords.length;
        s.targets.push({
          id: `cage_lock_${idx}_${Date.now()}`,
          type: 'cage_lock',
          text: lw,
          subText: '🔓 قفل طلسم',
          isCorrect: true, // shooting this breaks the lock!
          x: canvasW * 0.65 + Math.cos(angle) * 140,
          y: 280 + Math.sin(angle) * 140,
          vx: 0,
          vy: 0,
          radius: 44,
          health: 1,
          maxHealth: 1,
          color: '#ef4444',
          glowColor: '#f87171',
          bobOffset: 0,
          bobSpeed: 2.5,
          movePattern: 'circle',
          patternParams: {
            centerX: canvasW * 0.65,
            centerY: 280,
            radius: 140,
            angle: angle,
            speed: 0.015,
          },
          itemData: item,
        });
      });
    } else if (level.mode === 'monster_combat') {
      // Spawn wandering spell-beast carrying incorrect word banner
      const incorrectWord = item.incorrectVariants[0] || 'غلط‌نوشت';
      s.targets.push({
        id: `monster_${Date.now()}`,
        type: 'monster',
        text: incorrectWord,
        subText: `تبدیل به: ${item.correctSpelling}`,
        isCorrect: true, // Hit the monster to cleanse it!
        x: canvasW - 120,
        y: 320,
        vx: -0.6,
        vy: 0,
        radius: isProjectorMode ? 75 : 62,
        health: 2,
        maxHealth: 2,
        color: '#7c3aed',
        glowColor: '#a855f7',
        bobOffset: 0,
        bobSpeed: 2.0,
        movePattern: 'chase_wall',
        patternParams: {
          minX: 240,
          maxX: canvasW - 100,
        },
        itemData: item,
      });

      // Also spawn decoy decoy wisps
      s.targets.push({
        id: `wisp_${Date.now()}`,
        type: 'word',
        text: 'نگهبان سایه',
        isCorrect: false,
        x: canvasW * 0.55,
        y: 160,
        vx: 1.0,
        vy: 0,
        radius: 38,
        health: 1,
        maxHealth: 1,
        color: '#475569',
        glowColor: '#64748b',
        bobOffset: Math.PI,
        bobSpeed: 1.8,
        movePattern: 'horizontal',
        patternParams: {
          minX: 350,
          maxX: canvasW - 100,
        },
      });
    } else if (level.mode === 'audio_whisper') {
      // Audio whisper: voice speaks the Persian word!
      const pool = [
        { text: item.correctSpelling, isCorrect: true },
        ...item.incorrectVariants.slice(0, 3).map((v) => ({ text: v, isCorrect: false })),
      ].sort(() => Math.random() - 0.5);

      pool.forEach((t, idx) => {
        s.targets.push({
          id: `whisper_target_${idx}_${Date.now()}`,
          type: 'word',
          text: t.text,
          isCorrect: t.isCorrect,
          x: 380 + idx * 170,
          y: 220 + (idx % 2) * 120,
          vx: (Math.random() * 0.6 + 0.3) * (idx % 2 === 0 ? 1 : -1),
          vy: 0.3 * (idx % 2 === 0 ? -1 : 1),
          radius: isProjectorMode ? 58 : 48,
          health: 1,
          maxHealth: 1,
          color: '#0284c7',
          glowColor: '#38bdf8',
          bobOffset: Math.random() * 4,
          bobSpeed: 1.6,
          movePattern: 'vertical',
          patternParams: {
            minY: 130,
            maxY: 430,
          },
          itemData: item,
        });
      });

      // Speak automatically on challenge start
      setTimeout(() => {
        triggerVoicePlayback();
      }, 400);
    } else if (level.mode === 'speed_rush') {
      // Rapid portal fading targets
      const pool = [
        { text: item.correctSpelling, isCorrect: true },
        ...item.incorrectVariants.slice(0, 2).map((v) => ({ text: v, isCorrect: false })),
      ].sort(() => Math.random() - 0.5);

      pool.forEach((t, idx) => {
        s.targets.push({
          id: `speed_target_${idx}_${Date.now()}`,
          type: 'word',
          text: t.text,
          isCorrect: t.isCorrect,
          x: 360 + idx * 240,
          y: 180 + (idx % 3) * 100,
          vx: (Math.random() * 1.5 + 0.8) * (idx % 2 === 0 ? 1 : -1),
          vy: 0,
          radius: 52,
          health: 1,
          maxHealth: 1,
          color: '#ea580c',
          glowColor: '#f97316',
          bobOffset: idx,
          bobSpeed: 3.0,
          movePattern: 'portal_fade',
          patternParams: {
            minX: 300,
            maxX: canvasW - 80,
            opacity: 1,
            fadeDir: -0.015,
          },
          itemData: item,
        });
      });
    } else if (level.mode === 'boss_battle') {
      // Boss Colossus in arena center-right
      s.targets.push({
        id: 'boss_entity',
        type: 'boss',
        text: level.bossName || 'غول غلط‌نوشت‌خوار',
        subText: `ضعف املایی: ${item.word}`,
        isCorrect: false, // Boss itself cannot be shot directly until minions/spells are broken
        x: canvasW * 0.76,
        y: 280,
        vx: 0,
        vy: 0.3,
        radius: isProjectorMode ? 115 : 98,
        health: s.bossHealth,
        maxHealth: s.bossMaxHealth,
        color: '#dc2626',
        glowColor: '#f87171',
        bobOffset: 0,
        bobSpeed: 1.5,
        movePattern: 'vertical',
        patternParams: {
          minY: 180,
          maxY: 360,
        },
        itemData: item,
      });

      // Boss shield minions (1 correct spell antidote + 2 dark decoys)
      const spellRunes = [
        { text: item.correctSpelling, isCorrect: true },
        ...item.incorrectVariants.slice(0, 2).map((v) => ({ text: v, isCorrect: false })),
      ].sort(() => Math.random() - 0.5);

      spellRunes.forEach((sr, idx) => {
        const angle = (idx * (Math.PI * 2)) / spellRunes.length;
        s.targets.push({
          id: `boss_minion_${idx}_${Date.now()}`,
          type: 'boss_minion',
          text: sr.text,
          isCorrect: sr.isCorrect,
          x: canvasW * 0.76 + Math.cos(angle) * 160,
          y: 280 + Math.sin(angle) * 130,
          vx: 0,
          vy: 0,
          radius: 46,
          health: 1,
          maxHealth: 1,
          color: sr.isCorrect ? '#10b981' : '#9333ea',
          glowColor: sr.isCorrect ? '#34d399' : '#c084fc',
          bobOffset: 0,
          bobSpeed: 2.0,
          movePattern: 'circle',
          patternParams: {
            centerX: canvasW * 0.76,
            centerY: 280,
            radius: 160,
            angle: angle,
            speed: 0.02,
          },
          itemData: item,
        });
      });
    }
  }, [level, isProjectorMode]);

  // Voice playback trigger for auditory mode
  const triggerVoicePlayback = () => {
    const s = stateRef.current;
    if (s.currentItem) {
      setIsAudioSpeaking(true);
      const textToSpeak = s.currentItem.word;
      audioService.speakPersian(textToSpeak, () => {
        setIsAudioSpeaking(false);
      });
    }
  };

  // Setup level when mounted or level changes
  useEffect(() => {
    stateRef.current.targetsSolvedCount = 0;
    stateRef.current.bossHealth = level.bossMaxHealth || 6;
    stateRef.current.bossMaxHealth = level.bossMaxHealth || 6;
    stateRef.current.bossState = 'idle';
    stateRef.current.timeRemaining = level.timeLimit || 60;
    setUiSolvedCount(0);
    setUiTimeRemaining(level.timeLimit || 60);

    setupNextChallenge();
    audioService.startAmbient();
  }, [level, setupNextChallenge]);

  // Handle Canvas Resize and High DPI Display
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = rect.width || 1000;
      const displayHeight = Math.min(rect.height || 600, displayWidth * (7 / 12));

      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      const s = stateRef.current;
      s.width = displayWidth;
      s.height = displayHeight;
      s.archerX = Math.max(80, displayWidth * 0.1);
      s.archerY = displayHeight * 0.82;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Spawn Particle Helper
  const spawnParticles = (x: number, y: number, color: string, count: number = 18, textShards?: string[]) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 35 + 25,
        text: textShards ? textShards[i % textShards.length] : undefined,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
  };

  // Spawn Floating Combat Text Helper
  const spawnFloatingText = (x: number, y: number, text: string, color: string = '#fbbf24') => {
    stateRef.current.floatingTexts.push({
      id: `float_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      alpha: 1,
      scale: 1,
      vy: -1.8,
    });
  };

  // Main Shoot Arrow Logic
  const shootArrow = (angle: number, powerRatio: number) => {
    const s = stateRef.current;
    if (activeArrowType !== 'standard' && arrowInventory[activeArrowType] <= 0) {
      // Fallback to standard arrow if inventory depleted
      onSelectArrowType('standard');
    }

    onConsumeArrow(activeArrowType);

    const bowMultiplier = equippedBow.arrowSpeed * (0.6 + powerRatio * 0.8);
    const speed = 18 * bowMultiplier;
    const arrowVx = Math.cos(angle) * speed;
    const arrowVy = Math.sin(angle) * speed;

    const spawnX = s.archerX + Math.cos(angle) * 35;
    const spawnY = s.archerY + Math.sin(angle) * 35;

    s.arrows.push({
      id: `arrow_${Date.now()}_${Math.random()}`,
      x: spawnX,
      y: spawnY,
      vx: arrowVx,
      vy: arrowVy,
      angle: angle,
      power: powerRatio,
      type: activeArrowType,
      lifeTime: 0,
      trailParticles: [],
    });

    audioService.playBowRelease();
    audioService.playArrowWhoosh();

    // Multi-shot arrow bonus
    if (activeArrowType === 'multi_shot') {
      [-0.15, 0.15].forEach((spreadAngleOffset) => {
        const spreadAngle = angle + spreadAngleOffset;
        s.arrows.push({
          id: `arrow_spread_${Date.now()}_${Math.random()}`,
          x: spawnX,
          y: spawnY,
          vx: Math.cos(spreadAngle) * speed,
          vy: Math.sin(spreadAngle) * speed,
          angle: spreadAngle,
          power: powerRatio,
          type: 'multi_shot',
          lifeTime: 0,
          trailParticles: [],
        });
      });
    }
  };

  // Mouse & Touch Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const s = stateRef.current;
    s.isAiming = true;
    s.dragStartX = clickX;
    s.dragStartY = clickY;
    s.currentDragX = clickX;
    s.currentDragY = clickY;

    // Calculate initial aim angle towards pointer
    const dx = clickX - s.archerX;
    const dy = clickY - s.archerY;
    s.aimAngle = Math.atan2(dy, dx);
    s.aimPower = 0.5;

    audioService.playBowDraw(0.5);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (!s.isAiming || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    s.currentDragX = currX;
    s.currentDragY = currY;

    // Slingshot or Direct Aiming calculation:
    // If dragging backwards from dragStart, power increases with drag distance
    const dragDx = s.dragStartX - currX;
    const dragDy = s.dragStartY - currY;
    const dragDistance = Math.hypot(dragDx, dragDy);

    if (dragDistance > 15) {
      // Slingshot mode: aiming opposite to drag
      s.aimAngle = Math.atan2(dragDy, dragDx);
      s.aimPower = Math.min(1.0, Math.max(0.3, dragDistance / 140));
    } else {
      // Direct point-and-aim mode
      const dx = currX - s.archerX;
      const dy = currY - s.archerY;
      s.aimAngle = Math.atan2(dy, dx);
      s.aimPower = 0.8;
    }
  };

  const handlePointerUp = () => {
    const s = stateRef.current;
    if (!s.isAiming || isPaused) return;

    s.isAiming = false;
    shootArrow(s.aimAngle, s.aimPower);
  };

  // Keyboard controls listener (Space to shoot, Arrow keys to aim)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      const s = stateRef.current;
      if (e.code === 'Space') {
        e.preventDefault();
        shootArrow(s.aimAngle, 0.85);
      } else if (e.code === 'ArrowUp') {
        s.aimAngle = Math.max(-Math.PI * 0.45, s.aimAngle - 0.08);
      } else if (e.code === 'ArrowDown') {
        s.aimAngle = Math.min(Math.PI * 0.25, s.aimAngle + 0.08);
      } else if (e.key === '1') {
        onSelectArrowType('standard');
      } else if (e.key === '2') {
        onSelectArrowType('fire');
      } else if (e.key === '3') {
        onSelectArrowType('slow_mo');
      } else if (e.key === '4') {
        onSelectArrowType('piercing');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, activeArrowType, arrowInventory, onSelectArrowType]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = (currentTime: number) => {
      const s = stateRef.current;
      const dt = Math.min((currentTime - s.lastFrameTime) / 1000, 0.1);
      s.lastFrameTime = currentTime;

      const dpr = window.devicePixelRatio || 1;
      const width = s.width;
      const height = s.height;

      // Reset transform and clear
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Apply screen shake
      if (s.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.screenShake;
        const shakeY = (Math.random() - 0.5) * s.screenShake;
        ctx.translate(shakeX, shakeY);
        s.screenShake = Math.max(0, s.screenShake - 0.4);
      }

      // 1. UPDATE PHYSICS & ENTITIES (only if not paused)
      if (!isPaused) {
        // Update timer for speed rush
        if (level.mode === 'speed_rush') {
          s.timeRemaining -= dt;
          setUiTimeRemaining(Math.max(0, Math.ceil(s.timeRemaining)));
          if (s.timeRemaining <= 0) {
            // Speed rush level complete or time over
            const stars = s.targetsSolvedCount >= level.targetCount ? 3 : s.targetsSolvedCount >= 3 ? 2 : 1;
            onCompleteLevel(stars, score);
          }
        }

        // Update Targets
        s.targets.forEach((target) => {
          if (target.isDestroyed) return;

          // Bobbing motion
          target.bobOffset += target.bobSpeed * dt;

          // Movement patterns
          if (target.movePattern === 'horizontal') {
            target.x += target.vx;
            const minX = target.patternParams?.minX || 280;
            const maxX = target.patternParams?.maxX || width - 80;
            if (target.x < minX || target.x > maxX) {
              target.vx *= -1;
            }
          } else if (target.movePattern === 'vertical') {
            target.y += target.vy;
            const minY = target.patternParams?.minY || 120;
            const maxY = target.patternParams?.maxY || height - 160;
            if (target.y < minY || target.y > maxY) {
              target.vy *= -1;
            }
          } else if (target.movePattern === 'circle' && target.patternParams) {
            const p = target.patternParams;
            p.angle = (p.angle || 0) + (p.speed || 0.02);
            target.x = (p.centerX || width * 0.6) + Math.cos(p.angle) * (p.radius || 100);
            target.y = (p.centerY || 260) + Math.sin(p.angle) * (p.radius || 100);
          } else if (target.movePattern === 'portal_fade' && target.patternParams) {
            const p = target.patternParams;
            target.x += target.vx;
            const minX = p.minX || 280;
            const maxX = p.maxX || width - 80;
            if (target.x < minX || target.x > maxX) {
              target.vx *= -1;
            }
            // Pulse opacity
            p.opacity = (p.opacity || 1) + (p.fadeDir || -0.01);
            if (p.opacity <= 0.2) p.fadeDir = 0.015;
            if (p.opacity >= 1.0) p.fadeDir = -0.015;
          } else if (target.movePattern === 'chase_wall') {
            target.x += target.vx;
            if (target.x < (target.patternParams?.minX || 260)) {
              // Reached wall, turn around
              target.vx = Math.abs(target.vx);
            } else if (target.x > (target.patternParams?.maxX || width - 100)) {
              target.vx = -Math.abs(target.vx);
            }
          }

          // Shudder decay
          if (target.hitShudder && target.hitShudder > 0) {
            target.hitShudder -= dt * 15;
          }
        });

        // Update Arrows
        for (let i = s.arrows.length - 1; i >= 0; i--) {
          const arrow = s.arrows[i];
          arrow.lifeTime += dt;

          // Ballistic Gravity Physics
          const gravity = arrow.type === 'slow_mo' ? 0.12 : 0.28;
          arrow.vy += gravity;
          arrow.x += arrow.vx;
          arrow.y += arrow.vy;
          arrow.angle = Math.atan2(arrow.vy, arrow.vx);

          // Arrow Trail Particles
          if (Math.random() < 0.7) {
            const trailColor =
              arrow.type === 'fire'
                ? '#f97316'
                : arrow.type === 'slow_mo'
                ? '#38bdf8'
                : arrow.type === 'piercing'
                ? '#a855f7'
                : '#fbbf24';
            arrow.trailParticles.push({
              x: arrow.x - Math.cos(arrow.angle) * 15,
              y: arrow.y - Math.sin(arrow.angle) * 15,
              vx: (Math.random() - 0.5) * 0.8,
              vy: (Math.random() - 0.5) * 0.8,
              size: Math.random() * 4 + 2,
              color: trailColor,
              alpha: 0.8,
              life: 0,
              maxLife: 15,
            });
          }

          // Update trail particles
          arrow.trailParticles.forEach((p) => {
            p.life++;
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          });
          arrow.trailParticles = arrow.trailParticles.filter((p) => p.life < p.maxLife);

          // Collision Detection with Targets
          let arrowRemoved = false;

          for (let tIdx = 0; tIdx < s.targets.length; tIdx++) {
            const target = s.targets[tIdx];
            if (target.isDestroyed) continue;

            const dist = Math.hypot(arrow.x - target.x, arrow.y - target.y);
            if (dist < target.radius + 12) {
              // IMPACT!
              target.hitShudder = 10;
              s.screenShake = 6;

              if (target.isCorrect) {
                // Correct target hit!
                const isFinalHit = --target.health <= 0;

                if (isFinalHit) {
                  target.isDestroyed = true;
                  spawnParticles(target.x, target.y, target.glowColor, 28, [
                    '✨',
                    '🎯',
                    'آفرین',
                    target.text,
                  ]);
                } else {
                  spawnParticles(target.x, target.y, target.glowColor, 12);
                }

                audioService.playTargetHit(true, currentCombo + 1);

                // Specific mode reactions
                if (level.mode === 'letter_snipe') {
                  audioService.playLetterSnap();
                  spawnFloatingText(target.x, target.y, `حرف «${target.text}» قرار گرفت!`, '#34d399');
                  s.incompleteWordDisplay = s.currentItem?.correctSpelling || target.text;
                  setUiIncompleteWord(s.incompleteWordDisplay);
                } else if (level.mode === 'monster_combat') {
                  audioService.playMonsterCleanse();
                  target.transformedToFriendly = true;
                  spawnFloatingText(target.x, target.y, 'هیولا پاکسازی شد! ✨', '#a855f7');
                } else if (level.mode === 'word_rescue') {
                  spawnFloatingText(target.x, target.y, 'قفل طلسم شکست! 🔓', '#fbbf24');
                } else if (level.mode === 'boss_battle') {
                  audioService.playBossHit();
                  s.bossHealth = Math.max(0, s.bossHealth - 1);
                  spawnFloatingText(target.x, target.y, 'ضربه کاری به غول! 💥', '#ef4444');

                  if (s.bossHealth <= 0) {
                    s.bossState = 'defeated';
                    audioService.playBossDefeat();
                    confetti({
                      particleCount: 120,
                      spread: 80,
                      origin: { y: 0.6 },
                    });
                  }
                } else {
                  const pointsGained = 150 + currentCombo * 25;
                  spawnFloatingText(target.x, target.y, `+${pointsGained} درست!`, '#34d399');
                }

                onHitTarget(true, 150, target.itemData);

                // Progress target count
                s.targetsSolvedCount++;
                setUiSolvedCount(s.targetsSolvedCount);

                // Check Level Victory
                if (
                  (level.mode === 'boss_battle' && s.bossHealth <= 0) ||
                  (level.mode !== 'boss_battle' && s.targetsSolvedCount >= level.targetCount)
                ) {
                  const starsEarned = currentCombo >= 5 ? 3 : currentCombo >= 2 ? 2 : 1;
                  confetti({
                    particleCount: 90,
                    spread: 70,
                    origin: { y: 0.5 },
                  });
                  setTimeout(() => {
                    onCompleteLevel(starsEarned, score + 300);
                  }, 1200);
                } else {
                  // Spawn next spelling wave after short pause
                  setTimeout(() => {
                    if (!isPaused) {
                      setupNextChallenge();
                    }
                  }, 800);
                }
              } else {
                // Incorrect target hit
                audioService.playTargetHit(false, 0);
                spawnParticles(target.x, target.y, '#94a3b8', 8);
                const feedbackText = `نادرست: املای درست «${s.currentItem?.correctSpelling}» است`;
                spawnFloatingText(target.x, target.y - 20, feedbackText, '#f87171');
                onHitTarget(false, 0, target.itemData);
              }

              // Fire arrow AOE explosion
              if (arrow.type === 'fire') {
                spawnParticles(arrow.x, arrow.y, '#f97316', 35);
              }

              // Non-piercing arrows get consumed on impact
              if (arrow.type !== 'piercing') {
                s.arrows.splice(i, 1);
                arrowRemoved = true;
                break;
              }
            }
          }

          // Remove arrow if it goes off screen or lives too long
          if (!arrowRemoved) {
            if (arrow.x > width + 60 || arrow.y > height + 60 || arrow.lifeTime > 4.5) {
              s.arrows.splice(i, 1);
            }
          }
        }

        // Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // gravity on particles
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed;
          }
          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // Update Floating Texts
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y += ft.vy;
          ft.alpha -= 0.015;
          if (ft.alpha <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }
      }

      // 2. RENDER THE FANTASY WORLD BACKGROUND
      renderBackground(ctx, width, height, level.realmId);

      // 3. RENDER ENVIRONMENT ELEMENTS & OBSTACLES
      renderWorldDecorations(ctx, width, height, level.realmId);

      // 4. RENDER INCOMPLETE WORD TABLET (Letter Snipe Mode)
      if (level.mode === 'letter_snipe') {
        renderLetterSnipePlaque(ctx, width, height, s.incompleteWordDisplay);
      }

      // 5. RENDER TARGETS
      s.targets.forEach((target) => {
        renderTargetEntity(ctx, target, isProjectorMode);
      });

      // 6. RENDER ARROW TRAILS & ARROWS
      s.arrows.forEach((arrow) => {
        // Render trail
        arrow.trailParticles.forEach((p) => {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Render arrow projectile
        renderArrowSprite(ctx, arrow);
      });

      // 7. RENDER PARTICLES
      s.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        if (p.text) {
          ctx.font = 'bold 16px Vazirmatn, sans-serif';
          ctx.fillStyle = p.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 8. RENDER FLOATING COMBAT TEXT
      s.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `bold ${isProjectorMode ? '24px' : '18px'} Vazirmatn, sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.direction = 'rtl';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // 9. RENDER ARCHER CHARACTER & AIM TRAJECTORY
      renderArcherHero(
        ctx,
        s.archerX,
        s.archerY,
        s.aimAngle,
        s.isAiming,
        s.aimPower,
        equippedBow,
        activeArrowType,
        isProjectorMode
      );

      // Render Trajectory Prediction Arc when aiming
      if (s.isAiming) {
        renderTrajectoryArc(
          ctx,
          s.archerX,
          s.archerY,
          s.aimAngle,
          s.aimPower,
          equippedBow,
          activeArrowType
        );
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [
    equippedBow,
    activeArrowType,
    isProjectorMode,
    isPaused,
    currentCombo,
    score,
    level,
    onConsumeArrow,
    onHitTarget,
    onCompleteLevel,
    setupNextChallenge,
  ]);

  // Canvas Renderers Helper Functions

  // Render Fantasy Realm Background
  const renderBackground = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    realmId: string
  ) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);

    if (realmId === 'realm_1') {
      // Lush Word Forest (Emerald greens and midnight blues)
      grad.addColorStop(0, '#06201a');
      grad.addColorStop(0.6, '#0b3528');
      grad.addColorStop(1, '#08251c');
    } else if (realmId === 'realm_2') {
      // Crystal Cave (Deep amethyst purple and indigo)
      grad.addColorStop(0, '#130924');
      grad.addColorStop(0.6, '#241242');
      grad.addColorStop(1, '#0f061e');
    } else if (realmId === 'realm_3') {
      // Sky City (Dawn clouds and sky blue)
      grad.addColorStop(0, '#0c243c');
      grad.addColorStop(0.6, '#15416b');
      grad.addColorStop(1, '#1e5387');
    } else if (realmId === 'realm_4') {
      // Dark Fortress (Volcanic embers and crimson dark)
      grad.addColorStop(0, '#240b08');
      grad.addColorStop(0.6, '#421610');
      grad.addColorStop(1, '#1f0704');
    } else {
      // Celestial Sanctuary (Golden aurora and mystic navy)
      grad.addColorStop(0, '#18122B');
      grad.addColorStop(0.6, '#2d1f4d');
      grad.addColorStop(1, '#1c1333');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  };

  // Render Atmospheric scenery & Ground platform
  const renderWorldDecorations = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    realmId: string
  ) => {
    // Distant fantasy silhouettes
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.quadraticCurveTo(w * 0.25, h * 0.55, w * 0.5, h * 0.65);
    ctx.quadraticCurveTo(w * 0.75, h * 0.5, w, h * 0.68);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Ground grass/stone platform under archer
    const groundGrad = ctx.createLinearGradient(0, h * 0.84, 0, h);
    if (realmId === 'realm_1') {
      groundGrad.addColorStop(0, '#1b4d3e');
      groundGrad.addColorStop(1, '#0e2b22');
    } else if (realmId === 'realm_2') {
      groundGrad.addColorStop(0, '#3b1d60');
      groundGrad.addColorStop(1, '#1f0d35');
    } else if (realmId === 'realm_4') {
      groundGrad.addColorStop(0, '#541c15');
      groundGrad.addColorStop(1, '#2c0c08');
    } else {
      groundGrad.addColorStop(0, '#1e3a5f');
      groundGrad.addColorStop(1, '#0f2038');
    }

    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.roundRect(0, h * 0.85, w, h * 0.15, [16, 16, 0, 0]);
    ctx.fill();

    // Glowing platform edge rim
    ctx.strokeStyle =
      realmId === 'realm_1'
        ? '#34d399'
        : realmId === 'realm_2'
        ? '#a855f7'
        : realmId === 'realm_4'
        ? '#fb923c'
        : '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  };

  // Render Stone Plaque for Letter Sniping Mode
  const renderLetterSnipePlaque = (
    ctx: CanvasRenderingContext2D,
    w: number,
    _h: number,
    incompleteWord: string
  ) => {
    ctx.save();
    const plaqueW = 340;
    const plaqueH = 68;
    const plaqueX = w * 0.5 - plaqueW / 2;
    const plaqueY = 24;

    // Plaque background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(plaqueX, plaqueY, plaqueW, plaqueH, 14);
    ctx.fill();
    ctx.stroke();

    // Inner Glow
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 14;

    ctx.font = 'bold 26px Vazirmatn, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText(`کلمه ناقص: ${incompleteWord}`, w * 0.5, plaqueY + 44);

    ctx.restore();
  };

  // Render Targets (Words, Letters, Monsters, Trapped Word, Boss)
  const renderTargetEntity = (
    ctx: CanvasRenderingContext2D,
    t: Target,
    isProj: boolean
  ) => {
    if (t.isDestroyed) return;

    ctx.save();
    const bobY = Math.sin(t.bobOffset) * 6;
    const shudderX = t.hitShudder ? (Math.random() - 0.5) * t.hitShudder : 0;
    const renderX = t.x + shudderX;
    const renderY = t.y + bobY;

    if (t.type === 'word' || t.type === 'letter' || t.type === 'boss_minion') {
      // Glowing Magical Rune Orb / Bubble
      ctx.shadowColor = t.glowColor;
      ctx.shadowBlur = isProj ? 24 : 16;

      // Outer ring
      ctx.beginPath();
      ctx.arc(renderX, renderY, t.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fill();

      ctx.lineWidth = isProj ? 4 : 3;
      ctx.strokeStyle = t.glowColor;
      ctx.stroke();

      // Inner magical rune pulse
      ctx.beginPath();
      ctx.arc(renderX, renderY, t.radius * 0.82, 0, Math.PI * 2);
      ctx.fillStyle = t.color + '33';
      ctx.fill();

      // Word or Letter Persian Typography
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#000';
      const fontSize = t.type === 'letter' ? (isProj ? 38 : 30) : isProj ? 26 : 21;
      ctx.font = `bold ${fontSize}px Vazirmatn, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillText(t.text, renderX, renderY + 2);
    } else if (t.type === 'cage_lock') {
      // Rotating dark rune lock surrounding trapped word
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(69, 10, 10, 0.88)';
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.roundRect(renderX - 44, renderY - 24, 88, 48, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 18px Vazirmatn, sans-serif';
      ctx.fillStyle = '#fecaca';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillText(t.text, renderX, renderY - 4);

      if (t.subText) {
        ctx.font = '11px Vazirmatn, sans-serif';
        ctx.fillStyle = '#f87171';
        ctx.fillText(t.subText, renderX, renderY + 14);
      }
    } else if (t.type === 'trapped_word') {
      // Trapped golden word inside enchanted chains
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 28;
      ctx.fillStyle = 'rgba(30, 27, 75, 0.9)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.roundRect(renderX - 70, renderY - 40, 140, 80, 16);
      ctx.fill();
      ctx.stroke();

      ctx.font = `bold ${isProj ? '28px' : '23px'} Vazirmatn, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillText(t.text, renderX, renderY);

      // Dark chain overlay if cage is not broken
      if (!t.cageBroken) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(renderX - 70, renderY - 40);
        ctx.lineTo(renderX + 70, renderY + 40);
        ctx.moveTo(renderX - 70, renderY + 40);
        ctx.lineTo(renderX + 70, renderY - 40);
        ctx.stroke();
      }
    } else if (t.type === 'monster') {
      // Wandering Spell-Beast Creature
      ctx.shadowColor = t.glowColor;
      ctx.shadowBlur = 20;

      // Monster body
      ctx.fillStyle = t.transformedToFriendly ? '#34d399' : '#7c3aed';
      ctx.beginPath();
      ctx.ellipse(renderX, renderY, 56, 42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(renderX - 16, renderY - 8, 8, 0, Math.PI * 2);
      ctx.arc(renderX + 16, renderY - 8, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = t.transformedToFriendly ? '#065f46' : '#dc2626';
      ctx.beginPath();
      ctx.arc(renderX - 16, renderY - 8, 4, 0, Math.PI * 2);
      ctx.arc(renderX + 16, renderY - 8, 4, 0, Math.PI * 2);
      ctx.fill();

      // Incorrect Word Banner carried on head
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = t.transformedToFriendly ? '#34d399' : '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(renderX - 58, renderY - 68, 116, 38, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 18px Vazirmatn, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillText(t.text, renderX, renderY - 48);
    } else if (t.type === 'boss') {
      // Giant Misspeller Colossus Boss
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 32;

      // Outer dark aura
      ctx.fillStyle = 'rgba(30, 10, 15, 0.92)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(renderX, renderY, t.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing Horns / Crown
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(renderX - 45, renderY - 70);
      ctx.lineTo(renderX - 65, renderY - 110);
      ctx.lineTo(renderX - 25, renderY - 80);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(renderX + 45, renderY - 70);
      ctx.lineTo(renderX + 65, renderY - 110);
      ctx.lineTo(renderX + 25, renderY - 80);
      ctx.fill();

      // Boss Glowing Core Eyes
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(renderX - 28, renderY - 20, 12, 0, Math.PI * 2);
      ctx.arc(renderX + 28, renderY - 20, 12, 0, Math.PI * 2);
      ctx.fill();

      // Boss Name & Weakness Banner
      ctx.font = `bold ${isProj ? '22px' : '18px'} Vazirmatn, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillText(t.text, renderX, renderY + 22);

      if (t.subText) {
        ctx.font = '13px Vazirmatn, sans-serif';
        ctx.fillStyle = '#fca5a5';
        ctx.fillText(t.subText, renderX, renderY + 46);
      }

      // Boss Health Bar on top
      const barW = 180;
      const barH = 14;
      const barX = renderX - barW / 2;
      const barY = renderY - t.radius - 28;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(barX, barY, barW, barH);

      const hpPercent = Math.max(0, t.health / t.maxHealth);
      ctx.fillStyle = hpPercent > 0.4 ? '#ef4444' : '#f59e0b';
      ctx.fillRect(barX + 2, barY + 2, (barW - 4) * hpPercent, barH - 4);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX, barY, barW, barH);
    }

    ctx.restore();
  };

  // Render Arrow Projectile Sprite
  const renderArrowSprite = (ctx: CanvasRenderingContext2D, arrow: Arrow) => {
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.angle);

    // Arrow Shaft
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(12, 0);
    ctx.stroke();

    // Arrow Head
    ctx.fillStyle =
      arrow.type === 'fire'
        ? '#f97316'
        : arrow.type === 'slow_mo'
        ? '#38bdf8'
        : arrow.type === 'piercing'
        ? '#a855f7'
        : '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(8, -6);
    ctx.lineTo(10, 0);
    ctx.lineTo(8, 6);
    ctx.closePath();
    ctx.fill();

    // Arrow Fletching (feathers)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(-32, -6);
    ctx.lineTo(-26, 0);
    ctx.lineTo(-32, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Render Archer Hero Avatar & Bow
  const renderArcherHero = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    aimAngle: number,
    isAiming: boolean,
    aimPower: number,
    bow: ArcherBow,
    arrowType: ArrowType,
    isProj: boolean
  ) => {
    ctx.save();
    ctx.translate(x, y);

    // Hero Body (Stylized Archer Stance)
    // Shadow under feet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cloak / Robes
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(12, -4);
    ctx.lineTo(18, 16);
    ctx.lineTo(-18, 16);
    ctx.closePath();
    ctx.fill();

    // Archer Tunic
    ctx.fillStyle = '#115e59';
    ctx.fillRect(-10, -28, 20, 26);

    // Archer Head & Hood
    ctx.fillStyle = '#0d9488';
    ctx.beginPath();
    ctx.arc(0, -36, 14, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Archer Eye
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(6, -37, 3, 0, Math.PI * 2);
    ctx.fill();

    // Quiver with arrows on back
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-18, -26, 8, 22);

    // Dynamic Bow & Arm Tracking Aim Angle
    ctx.save();
    ctx.translate(6, -20);
    ctx.rotate(aimAngle);

    // Bow Stretch physics
    const bowDrawOffset = isAiming ? aimPower * 14 : 0;

    // Bow Body
    ctx.shadowColor = bow.glowColor;
    ctx.shadowBlur = isProj ? 18 : 10;
    ctx.strokeStyle = bow.glowColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Curved bow stave
    ctx.arc(10, 0, 26, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.stroke();

    // Bow String
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(10 + Math.cos(-Math.PI * 0.42) * 26, Math.sin(-Math.PI * 0.42) * 26);
    ctx.lineTo(-bowDrawOffset, 0); // pulled backward
    ctx.lineTo(10 + Math.cos(Math.PI * 0.42) * 26, Math.sin(Math.PI * 0.42) * 26);
    ctx.stroke();

    // Arrow nocked on bowstring when aiming
    if (isAiming) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-bowDrawOffset, 0);
      ctx.lineTo(24 - bowDrawOffset, 0);
      ctx.stroke();

      // Arrow head glow
      ctx.fillStyle =
        arrowType === 'fire'
          ? '#f97316'
          : arrowType === 'slow_mo'
          ? '#38bdf8'
          : arrowType === 'piercing'
          ? '#a855f7'
          : '#fbbf24';
      ctx.beginPath();
      ctx.arc(24 - bowDrawOffset, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.restore();
  };

  // Render Trajectory Prediction Dots
  const renderTrajectoryArc = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    angle: number,
    power: number,
    bow: ArcherBow,
    arrowType: ArrowType
  ) => {
    ctx.save();
    const speed = 18 * bow.arrowSpeed * (0.6 + power * 0.8);
    const vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    const gravity = arrowType === 'slow_mo' ? 0.12 : 0.28;

    let currX = startX + Math.cos(angle) * 35;
    let currY = startY + Math.sin(angle) * 35;

    const dotColor =
      arrowType === 'fire'
        ? '#f97316'
        : arrowType === 'slow_mo'
        ? '#38bdf8'
        : arrowType === 'piercing'
        ? '#c084fc'
        : '#fbbf24';

    ctx.fillStyle = dotColor;

    for (let step = 0; step < 26; step++) {
      currX += vx;
      vy += gravity;
      currY += vy;

      const alpha = Math.max(0.1, 1 - step / 26);
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.arc(currX, currY, Math.max(2, 5 - step * 0.14), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden bg-slate-950">
      {/* Top Objective Ribbon */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md">
        <div className="text-xl">
          {spellingContentAdapter.getGameModeDisplayName(level.mode).icon}
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-amber-400">
            {spellingContentAdapter.getGameModeDisplayName(level.mode).fa}
          </div>
          <div className="text-xs text-slate-300">
            {level.mode === 'speed_rush'
              ? `زمان باقی‌مانده: ${uiTimeRemaining} ثانیه`
              : level.mode === 'boss_battle'
              ? `سلامت غول: ${stateRef.current.bossHealth} / ${stateRef.current.bossMaxHealth}`
              : `اهداف باقی‌مانده: ${uiSolvedCount} / ${level.targetCount}`}
          </div>
        </div>

        {/* Auditory whisper button */}
        {level.mode === 'audio_whisper' && (
          <button
            onClick={triggerVoicePlayback}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
              isAudioSpeaking
                ? 'bg-amber-500 text-slate-950 animate-pulse'
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
            title="پخش مجدد صدای واژه"
          >
            <span>🔊</span>
            <span>شنیدن مجدد</span>
          </button>
        )}
      </div>

      {/* Main Interactive Action Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full cursor-crosshair touch-none select-none rounded-xl"
      />

      {/* Mobile Aim / Shoot Drag Instruction Pill */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 backdrop-blur-sm">
        <span className="text-amber-400 font-bold">کنترل:</span>
        <span>کلیک و کشیدن به عقب برای نشانه‌گیری و شلیک | کلید Space</span>
      </div>
    </div>
  );
};

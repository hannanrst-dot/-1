// Game Types and Interfaces for Word Hunter (شکارچی کلمات)

export type GameMode =
  | 'word_hunt'       // ۱. شکار کلمه (Floating word targets)
  | 'letter_snipe'    // ۲. تیراندازی به حرف (Missing letter in incomplete word)
  | 'word_rescue'     // ۳. نجات کلمه (Freeing caged trapped word)
  | 'monster_combat'  // ۴. شکار غلط املایی (Spell-mistake beast)
  | 'audio_whisper'   // ۵. املا شنیداری (Auditory spelling challenge)
  | 'speed_rush'      // ۶. حمله زمان‌دار (Rapid vanishing portal targets)
  | 'boss_battle';    // ۷. نبرد با هیولای غلط‌نویس (Arch-Misspeller Colossus)

export type GradeLevel = 'all' | 'grade_1_2' | 'grade_3_4' | 'grade_5_6' | 'middle_school';

export type SpellingCategory =
  | 's_s_th'     // س / ص / ث
  | 'z_z_z_z'   // ز / ض / ظ / ذ
  | 't_t'       // ت / ط
  | 'gh_gh'     // غ / ق
  | 'h_h'       // ه / ح
  | 'khva'      // خوا / خا
  | 'tashdid'   // تشدید و تنوین
  | 'all';

export type ArrowType = 'standard' | 'fire' | 'slow_mo' | 'piercing' | 'multi_shot';

export interface SpellingItem {
  id: string;
  word: string;                   // Correct word (e.g. "مدرسه")
  correctSpelling: string;        // Correct form
  incorrectVariants: string[];    // e.g. ["مدرثه", "مدرسح"]
  incompleteForm?: string;        // e.g. "مـ د _ سـ ه"
  missingLetter?: string;         // e.g. "ر"
  decoyLetters?: string[];        // e.g. ["ز", "د", "س"]
  meaning: string;                // e.g. "محل درس خواندن و آموزش"
  ruleExplanation: string;        // e.g. "مدرسه از ریشه درس و با «س» نوشته می‌شود و با «ث» یا «ح» غلط است."
  audioPhrase?: string;           // Text for speech synthesis
  hint: string;                   // Hint for hunter
  category: SpellingCategory;
  grade: GradeLevel;
  difficulty: 1 | 2 | 3;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Arrow {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  power: number;
  type: ArrowType;
  lifeTime: number;
  isStuck?: boolean;
  stuckTargetId?: string;
  trailParticles: Particle[];
}

export interface Target {
  id: string;
  type: 'word' | 'letter' | 'monster' | 'cage_lock' | 'trapped_word' | 'boss' | 'boss_minion';
  text: string;
  subText?: string;
  isCorrect: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  width?: number;
  height?: number;
  health: number;
  maxHealth: number;
  color: string;
  glowColor: string;
  bobOffset: number;
  bobSpeed: number;
  movePattern: 'horizontal' | 'vertical' | 'circle' | 'zigzag' | 'portal_fade' | 'chase_wall' | 'static';
  patternParams?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    centerX?: number;
    centerY?: number;
    radius?: number;
    angle?: number;
    speed?: number;
    opacity?: number;
    fadeDir?: number;
  };
  hitShudder?: number;
  isDestroyed?: boolean;
  itemData?: SpellingItem;
  cageBroken?: boolean;
  transformedToFriendly?: boolean;
  element?: 'fire' | 'water' | 'crystal' | 'nature' | 'dark' | 'celestial';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  text?: string;
  scale?: number;
  rotation?: number;
  rotationSpeed?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
}

export interface Realm {
  id: string;
  title: string;
  englishTitle: string;
  subtitle: string;
  description: string;
  bgTheme: 'forest' | 'crystal_cave' | 'sky_city' | 'dark_fortress' | 'celestial_island';
  primaryColor: string;
  accentColor: string;
  levels: LevelConfig[];
}

export interface LevelConfig {
  id: string;
  realmId: string;
  levelNumber: number;
  title: string;
  description: string;
  mode: GameMode;
  targetCount: number;
  timeLimit?: number;           // in seconds (for speed rush)
  category: SpellingCategory;
  grade: GradeLevel;
  difficulty: 1 | 2 | 3;
  bossName?: string;
  bossMaxHealth?: number;
  requiredScore: number;
  starsEarned: number;          // 0 to 3
  isUnlocked: boolean;
  isCompleted: boolean;
  highScore: number;
}

export interface ArcherBow {
  id: string;
  name: string;
  description: string;
  drawSpeed: number;
  arrowSpeed: number;
  powerMultiplier: number;
  glowColor: string;
  price: number;
  isUnlocked: boolean;
  icon: string;
}

export interface PlayerStats {
  score: number;
  coins: number;
  totalHits: number;
  accurateHits: number;
  highestCombo: number;
  currentCombo: number;
  equippedBowId: string;
  equippedArrowType: ArrowType;
  arrowInventory: Record<ArrowType, number>;
  unlockedRealms: string[];
  unlockedLevels: string[];
  completedLevels: Record<string, number>; // levelId -> stars
  achievements: string[];
}

export interface ClassroomSession {
  roomCode: string;
  teacherName: string;
  isProjectorMode: boolean;
  isFrozenForDiscussion: boolean;
  studentList: string[];
  selectedStudent: string | null;
  totalClassAttempts: number;
  correctClassAttempts: number;
}

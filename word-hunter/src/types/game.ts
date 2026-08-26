// Game Types and Interfaces for Word Hunter (شکارچی کلمات)

export type GameMode =
  | 'word_hunt'       // ۱. شکار کلمه — انتخاب املای درست از میان گویچه‌های شناور
  | 'letter_snipe'    // ۲. تیراندازی به حرف — پر کردن جای خالی کلمه
  | 'word_rescue'     // ۳. نجات کلمه — شکستن قفل‌های غلط و آزادسازی واژه
  | 'monster_combat'  // ۴. شکار غلط املایی — پاکسازی هیولای غلط‌نویس
  | 'audio_whisper'   // ۵. املا شنیداری — شنیدن واژه و یافتن نوشتار درست
  | 'speed_rush'      // ۶. حمله زمان‌دار — شکار سریع در پرتال‌ها
  | 'boss_battle';    // ۷. نبرد با غول غلط‌نویس

export type GradeLevel = 'all' | 'grade_1_2' | 'grade_3_4' | 'grade_5_6' | 'middle_school';

export type SpellingCategory =
  | 's_s_th'     // س / ص / ث
  | 'z_z_z_z'    // ز / ض / ظ / ذ
  | 't_t'        // ت / ط
  | 'gh_gh'      // غ / ق
  | 'h_h'        // ه / ح
  | 'khva'       // واو معدوله: خوا / خا
  | 'tanvin'     // تنوین نصب: اً
  | 'gozar'      // گزار / گذار
  | 'peyvaste'   // نیم‌فاصله و پیوسته‌نویسی
  | 'all';

export type ArrowType = 'standard' | 'fire' | 'slow_mo' | 'piercing' | 'multi_shot';

export interface SpellingItem {
  id: string;
  word: string;                   // واژه (شکل درست)
  correctSpelling: string;        // املای درست
  incorrectVariants: string[];    // املاهای نادرست رایج
  /** حرفِ کلیدی و چالش‌برانگیز واژه (برای حالت «تیراندازی به حرف») */
  missingLetter?: string;
  /** جایگاه حرف کلیدی در واژه */
  missingIndex?: number;
  /** آیا این واژه برای حالت جای‌خالی مناسب است؟ */
  isSnipeable: boolean;
  decoyLetters: string[];         // حروف هم‌آوای فریبنده
  meaning: string;                // معنی واژه
  ruleExplanation: string;        // قاعدهٔ املایی
  sentence: string;               // نمونه در جمله
  hint: string;                   // سرنخ برای شکارچی
  category: SpellingCategory;
  grade: GradeLevel;
  difficulty: 1 | 2 | 3;
  isCustom?: boolean;             // واژهٔ افزودهٔ معلم
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
  pierceLeft: number;
  hitIds: string[];
  trail: { x: number; y: number; a: number }[];
}

export type TargetKind =
  | 'word'          // گویچهٔ واژه
  | 'letter'        // بلور حرف
  | 'monster'       // هیولای غلط‌نویس
  | 'cage_lock'     // قفل طلسم
  | 'trapped_word'  // واژهٔ اسیر
  | 'boss'          // غول
  | 'curse';        // پرتابهٔ نفرین غول (باید زده شود)

export interface Target {
  id: string;
  kind: TargetKind;
  text: string;
  subText?: string;
  isCorrect: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  /** نیم‌عرض کادر متن — هنگام ساخت اندازه‌گیری می‌شود */
  halfW: number;
  halfH: number;
  health: number;
  maxHealth: number;
  hue: number;                    // رنگ‌مایه برای درخشش
  bob: number;
  bobSpeed: number;
  spin: number;
  spinSpeed: number;
  pattern: 'horizontal' | 'vertical' | 'orbit' | 'drift' | 'portal' | 'patrol' | 'static' | 'ballistic';
  p: {
    minX?: number; maxX?: number; minY?: number; maxY?: number;
    cx?: number; cy?: number; r?: number; angle?: number; speed?: number;
    opacity?: number; fadeDir?: number; homeX?: number; homeY?: number;
  };
  /** شمارش معکوس لرزش پس از اصابت */
  shudder: number;
  /** ۰ تا ۱ — انیمیشن ظاهر شدن */
  spawnT: number;
  /** وقتی نابود می‌شود، انیمیشن محو */
  dying: number;
  isDead: boolean;
  /** برای حالت نجات کلمه */
  locked?: boolean;
  cleansed?: boolean;
  item?: SpellingItem;
}

export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
  text?: string;
  rot?: number;
  rotSpeed?: number;
  shape?: 'dot' | 'spark' | 'ring' | 'glyph';
}

export interface FloatingText {
  id: string;
  x: number; y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  size: number;
  life: number;
}

export type RealmTheme =
  | 'forest'
  | 'crystal_cave'
  | 'sky_city'
  | 'dark_fortress'
  | 'desert_ruins'
  | 'celestial_island';

export interface Realm {
  id: string;
  title: string;
  englishTitle: string;
  subtitle: string;
  description: string;
  icon: string;
  bgTheme: RealmTheme;
  primaryColor: string;
  accentColor: string;
  levels: LevelConfig[];
}

export interface LevelConfig {
  id: string;
  realmId: string;
  theme: RealmTheme;
  levelNumber: number;
  title: string;
  description: string;
  mode: GameMode;
  /** تعداد دور (چالش) لازم برای پیروزی */
  rounds: number;
  timeLimit?: number;           // ثانیه — برای حالت زمان‌دار
  lives: number;                // تعداد جان (کمان)
  category: SpellingCategory;
  grade: GradeLevel;
  difficulty: 1 | 2 | 3;
  bossName?: string;
  bossMaxHealth?: number;
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
  icon: string;
}

/** آمار یک دانش‌آموز در جلسهٔ کلاسی */
export interface StudentRecord {
  name: string;
  attempts: number;
  correct: number;
  bestStreak: number;
  points: number;
}

/** جلسهٔ کلاسی معلم */
export interface ClassSessionState {
  className: string;
  teacherName: string;
  roster: string[];
  turnMode: 'free' | 'turns';       // آزاد یا نوبتی
  currentStudent: string | null;
  turnIndex: number;
  students: Record<string, StudentRecord>;
  /** واژه‌هایی که کلاس در آن‌ها اشتباه کرده — id واژه به تعداد خطا */
  missedWords: Record<string, number>;
  totalAttempts: number;
  totalCorrect: number;
  startedAt: number;
}

/** نتیجهٔ یک مرحله */
export interface LevelResult {
  stars: number;
  score: number;
  coins: number;
  accuracy: number;
  shots: number;
  hits: number;
  bestCombo: number;
  rounds: number;
  elapsed: number;
  victory: boolean;
}

export interface PlayerProgress {
  score: number;
  coins: number;
  completedLevels: Record<string, number>;  // levelId -> ستاره
  highScores: Record<string, number>;       // levelId -> بهترین امتیاز
  unlockedLevels: string[];
  unlockedBows: string[];
  equippedBowId: string;
  arrowInventory: Record<ArrowType, number>;
  totalShots: number;
  totalHits: number;
}

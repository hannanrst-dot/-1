import { Realm, ArcherBow, LevelConfig, RealmTheme, GameMode, SpellingCategory, GradeLevel } from '../types/game';

interface L {
  n: number; t: string; d: string; mode: GameMode;
  rounds: number; lives: number; time?: number;
  cat: SpellingCategory; g: GradeLevel; diff: 1 | 2 | 3;
  boss?: string; bossHp?: number;
}

function realm(
  id: string, theme: RealmTheme, icon: string,
  title: string, en: string, subtitle: string, description: string,
  primary: string, accent: string, levels: L[]
): Realm {
  return {
    id, title, englishTitle: en, subtitle, description, icon,
    bgTheme: theme, primaryColor: primary, accentColor: accent,
    levels: levels.map<LevelConfig>((l) => ({
      id: `${id}_l${l.n}`,
      realmId: id,
      theme,
      levelNumber: l.n,
      title: l.t,
      description: l.d,
      mode: l.mode,
      rounds: l.rounds,
      lives: l.lives,
      timeLimit: l.time,
      category: l.cat,
      grade: l.g,
      difficulty: l.diff,
      bossName: l.boss,
      bossMaxHealth: l.bossHp,
    })),
  };
}

export const GAME_REALMS: Realm[] = [
  realm(
    'r1', 'forest', '🌲',
    'جنگل کلمات', 'Word Forest',
    'سرزمین زمزمهٔ درختان کهن و حروف س، ص و ث',
    'در این جنگل باستانی، حروف هم‌آوای «س»، «ص» و «ث» میان بلوط‌های کهنسال پنهان شده‌اند. کمانت را آماده کن و املای درست را شکار کن.',
    '#10b981', '#34d399',
    [
      { n: 1, t: 'ردِّ پا در بیشه', d: 'نخستین گام: تشخیص املای درست «س / ص / ث»', mode: 'word_hunt', rounds: 5, lives: 3, cat: 's_s_th', g: 'grade_1_2', diff: 1 },
      { n: 2, t: 'تیر بر حرف گم‌شده', d: 'جای خالی واژه را با حرف درست پر کن', mode: 'letter_snipe', rounds: 5, lives: 3, cat: 's_s_th', g: 'grade_1_2', diff: 1 },
      { n: 3, t: 'نجات واژه از کمینگاه', d: 'قفل‌های املای غلط را بشکن و واژه را آزاد کن', mode: 'word_rescue', rounds: 3, lives: 3, cat: 's_s_th', g: 'grade_3_4', diff: 2 },
      { n: 4, t: 'پاکسازی بچه‌هیولا', d: 'هیولای غلط‌نویس را با نوشتار درست پاک کن', mode: 'monster_combat', rounds: 4, lives: 3, cat: 's_s_th', g: 'grade_3_4', diff: 2 },
    ]
  ),
  realm(
    'r2', 'crystal_cave', '💎',
    'غار بلورین حروف', 'Crystal Cave of Letters',
    'دنیای بلورهای چهارگانهٔ ز، ض، ظ و ذ',
    'در ژرفای این غار، بلورهای درخشان واژه‌های دشوار فارسی را بازتاب می‌دهند. تشخیص «ز»، «ض»، «ظ» و «ذ» کلید عبور است.',
    '#8b5cf6', '#a78bfa',
    [
      { n: 1, t: 'رقص بلورهای چهارگانه', d: 'واژه‌های «ز / ض / ظ / ذ» را درست تشخیص بده', mode: 'word_hunt', rounds: 5, lives: 3, cat: 'z_z_z_z', g: 'grade_3_4', diff: 2 },
      { n: 2, t: 'شکار در تاریکی', d: 'حرف درست را روی بلورهای چرخان بزن', mode: 'letter_snipe', rounds: 5, lives: 3, cat: 'z_z_z_z', g: 'grade_3_4', diff: 2 },
      { n: 3, t: 'زمزمهٔ بلورها', d: 'واژه را بشنو و املای درستش را پیدا کن', mode: 'audio_whisper', rounds: 4, lives: 3, cat: 'z_z_z_z', g: 'grade_3_4', diff: 2 },
      { n: 4, t: 'شکستن طلسم بلور', d: 'واژهٔ طلایی را از قفس بیرون بکش', mode: 'word_rescue', rounds: 3, lives: 3, cat: 'z_z_z_z', g: 'grade_5_6', diff: 2 },
    ]
  ),
  realm(
    'r3', 'sky_city', '☁️',
    'شهر معلق واژه‌ها', 'Sky City of Words',
    'برج‌های شناور «ت / ط» و «غ / ق»',
    'بالای ابرها، شهری معلق از سنگ و نور ساخته شده است. نگهبانان آن فقط به کسی راه می‌دهند که «ت» را از «ط» و «غ» را از «ق» بازشناسد.',
    '#0ea5e9', '#38bdf8',
    [
      { n: 1, t: 'دروازهٔ دو حرف', d: 'واژه‌های «ت» و «ط» را از هم جدا کن', mode: 'letter_snipe', rounds: 5, lives: 3, cat: 't_t', g: 'grade_3_4', diff: 2 },
      { n: 2, t: 'برج غین و قاف', d: 'املای درست واژه‌های «غ / ق» را شکار کن', mode: 'word_hunt', rounds: 5, lives: 3, cat: 'gh_gh', g: 'grade_3_4', diff: 2 },
      { n: 3, t: 'توفان بر فراز شهر', d: 'در زمان محدود، بیشترین املای درست را بزن', mode: 'speed_rush', rounds: 8, lives: 3, time: 60, cat: 't_t', g: 'grade_3_4', diff: 2 },
      { n: 4, t: 'نگهبان سایه‌ها', d: 'هیولای «غ / ق» را با نوشتار درست پاک کن', mode: 'monster_combat', rounds: 4, lives: 3, cat: 'gh_gh', g: 'grade_5_6', diff: 3 },
    ]
  ),
  realm(
    'r4', 'dark_fortress', '🏰',
    'قلعهٔ غلط‌نویس', 'Fortress of the Misspeller',
    'دژ آتشین «ه / ح» و واو معدوله',
    'در این دژ سوزان، دیو کوچکِ غلط‌نویسی حروف «ه» و «ح» را جابه‌جا می‌کند و «و» را از واژه‌های خواب و خواهر می‌دزدد.',
    '#f97316', '#fb923c',
    [
      { n: 1, t: 'پلکان آتش', d: 'واژه‌های «ه / ح» را درست بشناس', mode: 'word_hunt', rounds: 5, lives: 3, cat: 'h_h', g: 'grade_3_4', diff: 2 },
      { n: 2, t: 'راز واو خاموش', d: 'در واژه‌های خوا/خا، جای درست را پیدا کن', mode: 'letter_snipe', rounds: 5, lives: 3, cat: 'khva', g: 'grade_3_4', diff: 2 },
      { n: 3, t: 'زندان واژه‌های کهن', d: 'واژه‌های واو معدوله را از بند آزاد کن', mode: 'word_rescue', rounds: 3, lives: 3, cat: 'khva', g: 'grade_5_6', diff: 3 },
      {
        n: 4, t: '⚔️ دیوسالار قلعه', d: 'نخستین نبرد بزرگ با نگهبان دژ',
        mode: 'boss_battle', rounds: 6, lives: 4, cat: 'h_h', g: 'grade_5_6', diff: 3,
        boss: 'دیوسالار حرف‌دزد', bossHp: 6,
      },
    ]
  ),
  realm(
    'r5', 'desert_ruins', '🏜️',
    'کویر طومارهای گمشده', 'Desert of Lost Scrolls',
    'ستون‌های شکسته، «گزار / گذار» و نیم‌فاصله',
    'زیر آفتاب سوزان، طومارهای کهن نیمه‌دفن شده‌اند. هر طومار یکی از دشوارترین قاعده‌های نگارش فارسی را در خود دارد.',
    '#eab308', '#fcd34d',
    [
      { n: 1, t: 'طومار گزاردن و گذاشتن', d: 'تفاوت «گزار» و «گذار» را در عمل بیاموز', mode: 'word_hunt', rounds: 5, lives: 3, cat: 'gozar', g: 'grade_5_6', diff: 3 },
      { n: 2, t: 'دیو فاصله‌خوار', d: 'هیولایی که نیم‌فاصله‌ها را می‌بلعد', mode: 'monster_combat', rounds: 4, lives: 3, cat: 'peyvaste', g: 'grade_5_6', diff: 3 },
      { n: 3, t: 'نجوای شن‌ها', d: 'واژه را بشنو و درست‌نویسی‌اش را برگزین', mode: 'audio_whisper', rounds: 4, lives: 3, cat: 'gozar', g: 'middle_school', diff: 3 },
      { n: 4, t: 'توفان شن', d: 'در توفان، نیم‌فاصله‌ها را نجات بده', mode: 'speed_rush', rounds: 8, lives: 3, time: 60, cat: 'peyvaste', g: 'grade_5_6', diff: 3 },
    ]
  ),
  realm(
    'r6', 'celestial_island', '👑',
    'جزیرهٔ استادان املا', 'Sanctuary of Spelling Masters',
    'آسمانِ شفق، تنوین نصب و آزمون نهایی',
    'واپسین سرزمین؛ جایی که همهٔ قاعده‌ها با هم می‌آیند و غول غلط‌نویس اعظم در انتظار توست.',
    '#facc15', '#fde68a',
    [
      { n: 1, t: 'ستارگان تنوین', d: 'تنوین نصب «اً» را درست بنویس', mode: 'word_hunt', rounds: 5, lives: 3, cat: 'tanvin', g: 'grade_5_6', diff: 3 },
      { n: 2, t: 'آزمون شهاب‌ها', d: 'همهٔ دسته‌ها، در زمان محدود', mode: 'speed_rush', rounds: 10, lives: 3, time: 70, cat: 'all', g: 'all', diff: 3 },
      { n: 3, t: 'واپسین طومار', d: 'واژه‌های ناب را از زنجیر طلسم آزاد کن', mode: 'word_rescue', rounds: 4, lives: 3, cat: 'all', g: 'all', diff: 3 },
      {
        n: 4, t: '👑 نبرد نهایی', d: 'رویارویی با غول غلط‌نویس اعظم',
        mode: 'boss_battle', rounds: 10, lives: 4, cat: 'all', g: 'all', diff: 3,
        boss: 'غول غلط‌نویس اعظم', bossHp: 10,
      },
    ]
  ),
];

/** فهرست تخت همهٔ مرحله‌ها به ترتیب بازی */
export const ALL_LEVELS: LevelConfig[] = GAME_REALMS.flatMap((r) => r.levels);

export const FIRST_LEVEL_ID = ALL_LEVELS[0].id;

export function getLevel(id: string): LevelConfig | undefined {
  return ALL_LEVELS.find((l) => l.id === id);
}

export function nextLevelOf(id: string): LevelConfig | undefined {
  const i = ALL_LEVELS.findIndex((l) => l.id === id);
  return i >= 0 && i + 1 < ALL_LEVELS.length ? ALL_LEVELS[i + 1] : undefined;
}

export const ARCHER_BOWS: ArcherBow[] = [
  {
    id: 'bow_apprentice',
    name: 'کمان چوبی نوآموز',
    description: 'کمانی سبک از چوب گردو؛ آغاز راه هر شکارچی واژه.',
    drawSpeed: 1.0, arrowSpeed: 1.0, powerMultiplier: 1.0,
    glowColor: '#34d399', price: 0, icon: '🪵',
  },
  {
    id: 'bow_simurgh',
    name: 'کمان بال سیمرغ',
    description: 'آمیخته با پرِ آتشین سیمرغ؛ تیرها تندتر و کشش سریع‌تر.',
    drawSpeed: 1.25, arrowSpeed: 1.22, powerMultiplier: 1.2,
    glowColor: '#fb923c', price: 350, icon: '🪶',
  },
  {
    id: 'bow_crystal',
    name: 'کمان بلورین آسمان',
    description: 'تراشیده از بلور غار؛ مسیر تیر صاف‌تر و دقیق‌تر است.',
    drawSpeed: 1.45, arrowSpeed: 1.4, powerMultiplier: 1.4,
    glowColor: '#38bdf8', price: 750, icon: '💎',
  },
  {
    id: 'bow_arash',
    name: 'کمان زرین آرش',
    description: 'افسانه‌ای‌ترین کمان ادب پارسی؛ تیرها چون نور می‌روند.',
    drawSpeed: 1.7, arrowSpeed: 1.65, powerMultiplier: 1.8,
    glowColor: '#facc15', price: 1500, icon: '🏹',
  },
];

export const ARROW_SHOP: {
  type: 'fire' | 'slow_mo' | 'piercing' | 'multi_shot';
  name: string; icon: string; desc: string; price: number; count: number; color: string;
}[] = [
  { type: 'fire', name: 'تیر آتشین', icon: '🔥', desc: 'انفجار آتشین هنگام برخورد؛ جلوهٔ چشمگیر برای کلاس.', price: 60, count: 5, color: 'rose' },
  { type: 'slow_mo', name: 'تیر بلورین', icon: '❄️', desc: 'زمان را کُند می‌کند تا نشانه‌گیری آسان شود.', price: 90, count: 4, color: 'sky' },
  { type: 'piercing', name: 'تیر شکافنده', icon: '🗡️', desc: 'از چند هدف پیاپی عبور می‌کند.', price: 110, count: 3, color: 'violet' },
  { type: 'multi_shot', name: 'تیر سه‌گانه', icon: '✨', desc: 'سه تیر هم‌زمان پرتاب می‌کند.', price: 130, count: 3, color: 'emerald' },
];

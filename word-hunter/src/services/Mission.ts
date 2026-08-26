import { MissionConfig, LevelConfig, GameMode, SpellingCategory } from '../types/game';
import { spellingContentAdapter } from './SpellingContentAdapter';

/**
 * حالت‌هایی که در یک «مأموریت» پیوسته معنی می‌دهند.
 *
 * «نبرد با غول» و «حملهٔ زمان‌دار» عمداً کنار گذاشته شده‌اند: اولی یک صحنهٔ
 * پایانیِ مرحله‌محور است و دومی تایمر مستقل خودش را دارد که با تایمر کلی
 * آزمون تداخل پیدا می‌کند.
 */
export const MISSION_MODES: GameMode[] = [
  'word_hunt', 'letter_snipe', 'word_rescue', 'monster_combat', 'audio_whisper',
];

const MODE_TITLE: Record<string, string> = {
  word_hunt: 'شکار املای درست',
  letter_snipe: 'پر کردن جای خالی',
  word_rescue: 'نجات واژه',
  monster_combat: 'پاکسازی غلط املایی',
  audio_whisper: 'املای شنیداری',
};

/**
 * پرسش‌های مأموریت را به چند «تکه» تقسیم می‌کند؛ هر تکه یک مرحلهٔ کوچک
 * با یک حالت بازی و یک دستهٔ املایی است. بازی این تکه‌ها را پشت سر هم
 * اجرا می‌کند و امتیاز روی هم جمع می‌شود.
 */
export function buildMissionChunks(cfg: MissionConfig): LevelConfig[] {
  const snipeable = spellingContentAdapter
    .getFilteredItems('all', 'all', undefined, { needSnipeable: true })
    .some((i) => i.isSnipeable);

  let modes = cfg.gameModes.filter((m) => MISSION_MODES.includes(m));
  if (!snipeable) modes = modes.filter((m) => m !== 'letter_snipe');
  if (modes.length === 0) modes = ['word_hunt'];

  const cats: SpellingCategory[] = cfg.categories.length ? cfg.categories : ['all'];

  // چرخش بین حالت‌ها و دسته‌ها تا پرسش‌ها یکنواخت نشوند
  const plan: { mode: GameMode; cat: SpellingCategory }[] = [];
  for (let i = 0; i < cfg.questionCount; i++) {
    plan.push({
      mode: modes[i % modes.length],
      cat: cats[Math.floor(i / modes.length) % cats.length],
    });
  }

  // پرسش‌های پشت‌سرهمِ هم‌شکل در یک تکه جمع می‌شوند
  const chunks: LevelConfig[] = [];
  let n = 0;
  for (const step of plan) {
    const last = chunks[chunks.length - 1];
    if (last && last.mode === step.mode && last.category === step.cat) {
      last.rounds++;
      continue;
    }
    chunks.push({
      id: `mission_${n++}`,
      realmId: 'mission',
      theme: THEMES[n % THEMES.length],
      levelNumber: n,
      title: MODE_TITLE[step.mode] || cfg.title,
      description: cfg.title,
      mode: step.mode,
      rounds: 1,
      lives: cfg.lives,
      category: step.cat,
      grade: cfg.grade,
      difficulty: cfg.difficulty,
    });
  }
  return chunks;
}

/** صحنه‌ها در طول مأموریت عوض می‌شوند تا یکنواخت نباشد */
const THEMES = [
  'forest', 'crystal_cave', 'sky_city', 'desert_ruins', 'celestial_island', 'dark_fortress',
] as const;

/** توضیح کوتاه هر حالت برای صفحهٔ آغاز مأموریت */
export function modeSummary(mode: GameMode): string {
  return MODE_TITLE[mode] || mode;
}

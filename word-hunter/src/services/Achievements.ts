import { PlayerProgress } from '../types/game';
import { ALL_LEVELS, GAME_REALMS } from './WorldData';

/**
 * نشان‌ها.
 *
 * هدفشان این است که بچه بداند بعد از این مرحله چه چیزی در انتظارش است.
 * هر نشان از روی همان داده‌ای که پیش‌تر ذخیره می‌شد سنجیده می‌شود،
 * پس چیز تازه‌ای برای نگه‌داری اضافه نمی‌کند.
 */
export interface Achievement {
  id: string;
  title: string;
  hint: string;
  icon: string;
  /** ۰ تا ۱ */
  progress: (p: PlayerProgress) => number;
  /** متن پیشرفت، مثلاً «۳ از ۵» */
  label?: (p: PlayerProgress) => string;
}

const stars = (p: PlayerProgress) => Object.values(p.completedLevels).reduce((a, b) => a + b, 0);
const done = (p: PlayerProgress) => Object.keys(p.completedLevels).length;
const perfect = (p: PlayerProgress) => Object.values(p.completedLevels).filter((s) => s === 3).length;
const realmDone = (p: PlayerProgress, realmId: string) =>
  GAME_REALMS.find((r) => r.id === realmId)!.levels.every((l) => (p.completedLevels[l.id] || 0) > 0);

const ratio = (v: number, target: number) => Math.max(0, Math.min(1, v / target));

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood', title: 'نخستین تیر', hint: 'یک مرحله را کامل کن',
    icon: '🏹', progress: (p) => ratio(done(p), 1),
  },
  {
    id: 'forest_clear', title: 'نگهبان جنگل', hint: 'همهٔ مرحله‌های جنگل کلمات را بگذران',
    icon: '🌲', progress: (p) => (realmDone(p, 'r1') ? 1 : ratio(GAME_REALMS[0].levels.filter((l) => p.completedLevels[l.id]).length, 4)),
    label: (p) => `${GAME_REALMS[0].levels.filter((l) => p.completedLevels[l.id]).length} از ۴`,
  },
  {
    id: 'crystal_clear', title: 'بلورشناس', hint: 'همهٔ مرحله‌های غار بلورین را بگذران',
    icon: '💎', progress: (p) => ratio(GAME_REALMS[1].levels.filter((l) => p.completedLevels[l.id]).length, 4),
    label: (p) => `${GAME_REALMS[1].levels.filter((l) => p.completedLevels[l.id]).length} از ۴`,
  },
  {
    id: 'ten_levels', title: 'کماندار کارکشته', hint: '۱۰ مرحله را کامل کن',
    icon: '🎯', progress: (p) => ratio(done(p), 10), label: (p) => `${done(p)} از ۱۰`,
  },
  {
    id: 'stars_20', title: 'ستاره‌چین', hint: '۲۰ ستاره جمع کن',
    icon: '⭐', progress: (p) => ratio(stars(p), 20), label: (p) => `${stars(p)} از ۲۰`,
  },
  {
    id: 'stars_50', title: 'آسمانِ پرستاره', hint: '۵۰ ستاره جمع کن',
    icon: '🌟', progress: (p) => ratio(stars(p), 50), label: (p) => `${stars(p)} از ۵۰`,
  },
  {
    id: 'perfect_5', title: 'بی‌خطا', hint: '۵ مرحله را با سه ستاره تمام کن',
    icon: '💯', progress: (p) => ratio(perfect(p), 5), label: (p) => `${perfect(p)} از ۵`,
  },
  {
    id: 'sharpshooter', title: 'تیرانداز دقیق', hint: 'دقت کلی‌ات به ۸۰٪ برسد',
    icon: '🔭',
    progress: (p) => (p.totalShots < 20 ? 0 : ratio(p.totalHits / Math.max(1, p.totalShots), 0.8)),
    label: (p) => (p.totalShots < 20 ? 'هنوز کم تیر زده‌ای' : `${Math.round((p.totalHits / p.totalShots) * 100)}٪`),
  },
  {
    id: 'rich', title: 'خزانه‌دار', hint: '۱۰۰۰ سکه داشته باش',
    icon: '🪙', progress: (p) => ratio(p.coins, 1000), label: (p) => `${p.coins} از ۱۰۰۰`,
  },
  {
    id: 'collector', title: 'گردآورندهٔ کمان', hint: 'هر چهار کمان را به دست بیاور',
    icon: '🎁', progress: (p) => ratio(p.unlockedBows.length, 4), label: (p) => `${p.unlockedBows.length} از ۴`,
  },
  {
    id: 'boss_slayer', title: 'دیوکُش', hint: 'دیوسالار قلعه را شکست بده',
    icon: '⚔️', progress: (p) => (p.completedLevels['r4_l4'] ? 1 : 0),
  },
  {
    id: 'grand_master', title: 'استاد املای پارسی', hint: 'غول غلط‌نویس اعظم را شکست بده',
    icon: '👑', progress: (p) => (p.completedLevels['r6_l4'] ? 1 : 0),
  },
  {
    id: 'completionist', title: 'فاتح شش سرزمین', hint: 'هر ۲۴ مرحله را کامل کن',
    icon: '🗺️', progress: (p) => ratio(done(p), ALL_LEVELS.length),
    label: (p) => `${done(p)} از ${ALL_LEVELS.length}`,
  },
];

export function unlockedIds(p: PlayerProgress): string[] {
  return ACHIEVEMENTS.filter((a) => a.progress(p) >= 1).map((a) => a.id);
}

export function countUnlocked(p: PlayerProgress): number {
  return unlockedIds(p).length;
}

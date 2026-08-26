import { PlayerProgress, ArrowType } from '../types/game';
import { FIRST_LEVEL_ID } from './WorldData';

const KEY = 'wh_progress_v2';

export const DEFAULT_ARROWS: Record<ArrowType, number> = {
  standard: Infinity,
  fire: 6,
  slow_mo: 5,
  piercing: 3,
  multi_shot: 4,
};

function defaults(): PlayerProgress {
  return {
    score: 0,
    coins: 250,
    completedLevels: {},
    highScores: {},
    unlockedLevels: [FIRST_LEVEL_ID],
    unlockedBows: ['bow_apprentice'],
    equippedBowId: 'bow_apprentice',
    arrowInventory: { ...DEFAULT_ARROWS },
    totalShots: 0,
    totalHits: 0,
  };
}

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const p = JSON.parse(raw) as Partial<PlayerProgress>;
    const inv = { ...DEFAULT_ARROWS, ...(p.arrowInventory || {}) };
    inv.standard = Infinity;
    return {
      ...defaults(),
      ...p,
      arrowInventory: inv,
      unlockedLevels:
        p.unlockedLevels && p.unlockedLevels.length ? p.unlockedLevels : [FIRST_LEVEL_ID],
    };
  } catch {
    return defaults();
  }
}

export function saveProgress(p: PlayerProgress) {
  try {
    const inv: Record<string, number> = { ...p.arrowInventory };
    delete inv.standard; // بی‌نهایت است و ذخیره نمی‌شود
    localStorage.setItem(KEY, JSON.stringify({ ...p, arrowInventory: inv }));
  } catch { /* حافظه در دسترس نیست */ }
}

export function resetProgress() {
  try { localStorage.removeItem(KEY); } catch { /* حافظه در دسترس نیست */ }
}

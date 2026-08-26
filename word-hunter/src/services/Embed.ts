import {
  MissionConfig, MissionResult, AnswerRecord, SpellingCategory, GameMode, GradeLevel,
} from '../types/game';

/**
 * پل ارتباطی با پلتفرم میزبان.
 *
 * بازی هیچ چیزی دربارهٔ سرور شما نمی‌داند و هیچ درخواستی به بیرون نمی‌فرستد.
 * فقط دو کار می‌کند:
 *   ۱) پیکربندی مأموریت را از میزبان می‌گیرد (از آدرس صفحه یا با postMessage)
 *   ۲) رویدادها را با postMessage به میزبان پس می‌دهد
 *
 * این‌طوری همان Socket.IO و پایگاه‌دادهٔ خودتان کار زندهٔ کلاس را انجام می‌دهد
 * و بازی فقط یک نمایشگر است.
 */

export const EMBED_PROTOCOL = 1;

export type EmbedEvent =
  | { type: 'wordhunter:ready'; protocol: number }
  | { type: 'wordhunter:started'; sessionId: string; startedAt: number }
  | {
      type: 'wordhunter:progress';
      sessionId: string;
      studentId: string;
      answered: number;
      questionCount: number;
      correct: number;
      wrong: number;
      accuracy: number;
      score: number;
      bestStreak: number;
      livesLeft: number;
      secondsLeft: number;
      last: AnswerRecord;
    }
  | { type: 'wordhunter:finished'; result: MissionResult }
  | { type: 'wordhunter:exit'; sessionId: string };

const DEFAULTS: MissionConfig = {
  sessionId: 'local',
  student: { id: 'local', name: 'دانش‌آموز' },
  kind: 'practice',
  title: 'تمرین املا',
  questionCount: 12,
  durationSec: 0,
  lives: 5,
  categories: [],
  grade: 'all',
  difficulty: 2,
  gameModes: ['word_hunt', 'letter_snipe', 'audio_whisper'],
  showEconomy: true,
  locale: 'fa',
};

const VALID_MODES: GameMode[] = [
  'word_hunt', 'letter_snipe', 'word_rescue', 'monster_combat',
  'audio_whisper', 'speed_rush', 'boss_battle',
];
const VALID_CATS: SpellingCategory[] = [
  's_s_th', 'z_z_z_z', 't_t', 'gh_gh', 'h_h', 'khva', 'tanvin', 'gozar', 'peyvaste', 'all',
];
const VALID_GRADES: GradeLevel[] = ['all', 'grade_1_2', 'grade_3_4', 'grade_5_6', 'middle_school'];

const clampInt = (v: unknown, lo: number, hi: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fallback;
};

/** هر ورودی‌ای که از بیرون می‌آید نامعتبر فرض می‌شود تا خلافش ثابت شود */
export function normalizeConfig(raw: unknown): MissionConfig {
  const r = (raw ?? {}) as Record<string, unknown>;
  const student = (r.student ?? {}) as Record<string, unknown>;
  const modes = Array.isArray(r.gameModes)
    ? (r.gameModes as string[]).filter((m): m is GameMode => VALID_MODES.includes(m as GameMode))
    : [];
  const cats = Array.isArray(r.categories)
    ? (r.categories as string[]).filter((c): c is SpellingCategory => VALID_CATS.includes(c as SpellingCategory))
    : [];

  return {
    sessionId: String(r.sessionId ?? DEFAULTS.sessionId).slice(0, 120),
    student: {
      id: String(student.id ?? DEFAULTS.student.id).slice(0, 120),
      name: String(student.name ?? DEFAULTS.student.name).slice(0, 80),
      avatar: student.avatar ? String(student.avatar).slice(0, 500) : undefined,
    },
    kind: r.kind === 'exam' ? 'exam' : 'practice',
    title: String(r.title ?? DEFAULTS.title).slice(0, 120),
    questionCount: clampInt(r.questionCount, 3, 60, DEFAULTS.questionCount),
    durationSec: clampInt(r.durationSec, 0, 3600, DEFAULTS.durationSec),
    lives: clampInt(r.lives, 1, 20, DEFAULTS.lives),
    categories: cats.filter((c) => c !== 'all'),
    grade: VALID_GRADES.includes(r.grade as GradeLevel) ? (r.grade as GradeLevel) : DEFAULTS.grade,
    difficulty: clampInt(r.difficulty, 1, 3, DEFAULTS.difficulty) as 1 | 2 | 3,
    gameModes: modes.length ? modes : DEFAULTS.gameModes,
    words: Array.isArray(r.words) ? (r.words as MissionConfig['words']) : undefined,
    showEconomy: r.showEconomy !== false,
    locale: 'fa',
  };
}

/** خواندن پیکربندی از آدرس صفحه: #mission=<base64 از JSON> یا ?mission=<...> */
export function readConfigFromUrl(): MissionConfig | null {
  try {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(window.location.search);
    const raw = hash.get('mission') || query.get('mission');
    if (!raw) return null;
    const json = decodeURIComponent(escape(atob(raw.replace(/-/g, '+').replace(/_/g, '/'))));
    return normalizeConfig(JSON.parse(json));
  } catch (e) {
    console.warn('[word-hunter] پیکربندی مأموریت در آدرس صفحه خوانده نشد', e);
    return null;
  }
}

/** آیا داخل قاب پلتفرم میزبان اجرا می‌شویم؟ */
export function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/** ساخت آدرسِ راه‌اندازی — همین را در سمت Node هم می‌توانید بسازید */
export function buildLaunchUrl(base: string, config: Partial<MissionConfig>): string {
  const json = JSON.stringify(config);
  const b64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-').replace(/\//g, '_');
  return `${base}#mission=${b64}`;
}

/** فرستادن رویداد به میزبان */
export function emit(event: EmbedEvent) {
  try {
    window.parent?.postMessage(event, '*');
  } catch (e) {
    console.warn('[word-hunter] ارسال رویداد به میزبان ناموفق بود', e);
  }
  // برای اشکال‌زدایی، همان رویداد روی خودِ صفحه هم منتشر می‌شود
  try {
    window.dispatchEvent(new CustomEvent('wordhunter', { detail: event }));
  } catch { /* پشتیبانی نمی‌شود */ }
}

/**
 * منتظر ماندن برای پیکربندی از راه postMessage.
 * میزبان می‌تواند پس از بارگذاری بفرستد: { type: 'wordhunter:mission', config }
 */
export function listenForConfig(onConfig: (c: MissionConfig) => void): () => void {
  const handler = (e: MessageEvent) => {
    const d = e.data as { type?: string; config?: unknown };
    if (d && d.type === 'wordhunter:mission') {
      onConfig(normalizeConfig(d.config));
    }
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}

/** نمرهٔ ۰ تا ۲۰ از روی پاسخ‌های درست */
export function toGrade20(correct: number, questionCount: number): number {
  if (questionCount <= 0) return 0;
  const raw = (Math.min(correct, questionCount) / questionCount) * 20;
  return Math.round(Math.max(0, Math.min(20, raw)) * 100) / 100;
}

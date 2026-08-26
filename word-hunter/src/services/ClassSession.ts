import { ClassSessionState, StudentRecord, SpellingItem } from '../types/game';

const KEY = 'wh_class_session_v1';

const DEFAULT_ROSTER: string[] = [];

function emptyRecord(name: string): StudentRecord {
  return { name, attempts: 0, correct: 0, bestStreak: 0, points: 0 };
}

function initialState(): ClassSessionState {
  return {
    className: 'کلاس ششم',
    teacherName: '',
    roster: DEFAULT_ROSTER,
    turnMode: 'free',
    currentStudent: null,
    turnIndex: -1,
    students: {},
    missedWords: {},
    totalAttempts: 0,
    totalCorrect: 0,
    startedAt: Date.now(),
  };
}

/**
 * جلسهٔ کلاسی — همه چیز روی همین دستگاه ذخیره می‌شود.
 * هیچ داده‌ای به بیرون فرستاده نمی‌شود و نیازی به ثبت‌نام نیست.
 */
class ClassSessionService {
  private state: ClassSessionState = initialState();
  private listeners = new Set<(s: ClassSessionState) => void>();
  /** رشتهٔ پاسخ درست پیاپی برای دانش‌آموز جاری */
  private streak = 0;

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.state = { ...initialState(), ...JSON.parse(raw) };
    } catch {
      this.state = initialState();
    }
  }

  private commit() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state));
    } catch { /* حافظه در دسترس نیست */ }
    const snapshot = this.get();
    this.listeners.forEach((fn) => fn(snapshot));
  }

  public subscribe(fn: (s: ClassSessionState) => void): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  public get(): ClassSessionState {
    return { ...this.state, roster: [...this.state.roster], students: { ...this.state.students } };
  }

  /* ─────────── فهرست کلاس ─────────── */

  public setClassInfo(className: string, teacherName: string) {
    this.state.className = className;
    this.state.teacherName = teacherName;
    this.commit();
  }

  public setRoster(names: string[]) {
    const clean = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
    this.state.roster = clean;
    // آمار کسانی که دیگر در فهرست نیستند حفظ می‌شود تا گزارش کامل بماند
    clean.forEach((n) => {
      if (!this.state.students[n]) this.state.students[n] = emptyRecord(n);
    });
    if (this.state.currentStudent && !clean.includes(this.state.currentStudent)) {
      this.state.currentStudent = null;
      this.state.turnIndex = -1;
    }
    this.commit();
  }

  public setTurnMode(mode: 'free' | 'turns') {
    this.state.turnMode = mode;
    if (mode === 'free') this.state.currentStudent = null;
    else if (this.state.roster.length && !this.state.currentStudent) this.nextTurn();
    else this.commit();
  }

  /* ─────────── نوبت‌ها ─────────── */

  public setCurrentStudent(name: string | null) {
    this.state.currentStudent = name;
    this.streak = 0;
    if (name) {
      if (!this.state.students[name]) this.state.students[name] = emptyRecord(name);
      const i = this.state.roster.indexOf(name);
      if (i >= 0) this.state.turnIndex = i;
    }
    this.commit();
  }

  public nextTurn(): string | null {
    if (this.state.roster.length === 0) return null;
    this.state.turnIndex = (this.state.turnIndex + 1) % this.state.roster.length;
    const name = this.state.roster[this.state.turnIndex];
    this.setCurrentStudent(name);
    return name;
  }

  public randomStudent(): string | null {
    if (this.state.roster.length === 0) return null;
    // ترجیح با کسانی که کمتر نوبت گرفته‌اند تا همه مشارکت کنند
    const min = Math.min(...this.state.roster.map((n) => this.state.students[n]?.attempts ?? 0));
    const pool = this.state.roster.filter((n) => (this.state.students[n]?.attempts ?? 0) <= min + 1);
    const src = pool.length ? pool : this.state.roster;
    return src[Math.floor(Math.random() * src.length)];
  }

  /* ─────────── ثبت پاسخ ─────────── */

  public recordAnswer(item: SpellingItem, correct: boolean, points: number) {
    this.state.totalAttempts++;
    if (correct) this.state.totalCorrect++;
    else this.state.missedWords[item.id] = (this.state.missedWords[item.id] || 0) + 1;

    const name = this.state.currentStudent;
    if (name) {
      const rec = this.state.students[name] || emptyRecord(name);
      rec.attempts++;
      if (correct) {
        rec.correct++;
        rec.points += points;
        this.streak++;
        rec.bestStreak = Math.max(rec.bestStreak, this.streak);
      } else {
        this.streak = 0;
      }
      this.state.students[name] = rec;
    }
    this.commit();
  }

  /* ─────────── گزارش ─────────── */

  public leaderboard(): StudentRecord[] {
    return Object.values(this.state.students)
      .filter((r) => r.attempts > 0)
      .sort((a, b) => b.points - a.points || b.correct - a.correct);
  }

  public accuracy(): number {
    return this.state.totalAttempts > 0 ? this.state.totalCorrect / this.state.totalAttempts : 0;
  }

  /** واژه‌هایی که کلاس بیشترین خطا را در آن‌ها داشته */
  public topMissed(limit = 8): { id: string; count: number }[] {
    return Object.entries(this.state.missedWords)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  public resetStats() {
    Object.keys(this.state.students).forEach((k) => {
      this.state.students[k] = emptyRecord(k);
    });
    this.state.missedWords = {};
    this.state.totalAttempts = 0;
    this.state.totalCorrect = 0;
    this.state.startedAt = Date.now();
    this.streak = 0;
    this.commit();
  }

  public resetAll() {
    this.state = initialState();
    this.streak = 0;
    this.commit();
  }
}

export const classSession = new ClassSessionService();

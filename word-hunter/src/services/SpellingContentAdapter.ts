import { SpellingItem, SpellingCategory, GradeLevel, GameMode } from '../types/game';
import { RAW_WORDS, RawWord, CATEGORY_LETTERS, CATEGORY_INFO } from '../data/wordBank';

const CUSTOM_KEY = 'wh_custom_words_v2';
const LEGACY_KEY = 'word_hunter_custom_words';

/** دسته‌هایی که برای حالت «جای خالی» مناسب نیستند (حرف کلیدی، حرف مستقل نیست) */
const NON_SNIPE_CATEGORIES: SpellingCategory[] = ['tanvin', 'peyvaste', 'gozar'];

let seq = 0;

export function expandRawWord(raw: RawWord, idPrefix = 'w'): SpellingItem {
  const key = raw.key;
  const idx = raw.ki !== undefined && key ? nthIndexOf(raw.w, key, raw.ki) : key ? raw.w.indexOf(key) : -1;
  const snipeable = !!key && idx >= 0 && !NON_SNIPE_CATEGORIES.includes(raw.cat);

  const decoys =
    raw.dec && raw.dec.length > 0
      ? raw.dec.filter((d) => d !== key)
      : (CATEGORY_LETTERS[raw.cat] || CATEGORY_LETTERS.all).filter((l) => l !== key);

  return {
    id: `${idPrefix}_${raw.cat}_${seq++}`,
    word: raw.w,
    correctSpelling: raw.w,
    incorrectVariants: raw.bad.filter((b) => b && b !== raw.w),
    missingLetter: key,
    missingIndex: idx >= 0 ? idx : undefined,
    isSnipeable: snipeable,
    decoyLetters: decoys.length > 0 ? decoys : ['س', 'ز', 'ت'],
    meaning: raw.mean,
    ruleExplanation: raw.rule,
    sentence: raw.sent,
    hint: raw.hint,
    category: raw.cat,
    grade: raw.g,
    difficulty: raw.d,
  };
}

/**
 * حرفِ متمایزکنندهٔ واژه را از روی املاهای غلط پیدا می‌کند.
 * «صابون» در برابر «سابون» فقط در یک حرف فرق دارد؛ همان حرف، حرفِ درس است.
 * اگر تفاوت بیش از یک حرف باشد، چیزی برنمی‌گرداند.
 */
function deriveKeyLetter(word: string, variants: string[]): { letter: string; index: number } | null {
  for (const v of variants) {
    if (!v || v.length !== word.length) continue;
    let diff = -1;
    let count = 0;
    for (let i = 0; i < word.length; i++) {
      if (word[i] !== v[i]) { count++; diff = i; }
      if (count > 1) break;
    }
    if (count === 1 && diff >= 0 && word[diff].trim()) {
      return { letter: word[diff], index: diff };
    }
  }
  return null;
}

function nthIndexOf(text: string, ch: string, n: number): number {
  let found = -1;
  for (let i = 0; i <= n; i++) {
    found = text.indexOf(ch, found + 1);
    if (found === -1) return -1;
  }
  return found;
}

const BUILT_IN: SpellingItem[] = RAW_WORDS.map((r) => expandRawWord(r, 'core'));

export class SpellingContentAdapter {
  private customItems: SpellingItem[] = [];
  /** اگر true باشد فقط از واژه‌های افزودهٔ معلم استفاده می‌شود */
  private customOnly = false;
  /**
   * واژه‌های همین جلسه، وقتی پلتفرم میزبان فهرست درسِ مشخصی می‌فرستد.
   * تا وقتی پر باشد، بازی فقط از همین‌ها استفاده می‌کند و در حافظه هم
   * ذخیره نمی‌شود (مخصوص یک جلسه است، نه بانک دائمی معلم).
   */
  private sessionItems: SpellingItem[] | null = null;
  /**
   * در آزمون، یک واژه نباید دوبار پرسیده شود تا وقتی همهٔ واژه‌ها آمده باشند.
   * در بازی آزاد این حالت خاموش است چون تکرار برای تمرین اشکالی ندارد.
   */
  private noRepeat = false;
  private askedIds = new Set<string>();
  private listeners = new Set<() => void>();

  constructor() {
    this.load();
  }

  // ─────────── ذخیره‌سازی ───────────

  private load(): void {
    try {
      const saved = localStorage.getItem(CUSTOM_KEY) || localStorage.getItem(LEGACY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.customItems = parsed.map((p: Partial<SpellingItem>) => this.normalize(p));
        }
      }
      this.customOnly = localStorage.getItem('wh_custom_only') === '1';
    } catch {
      this.customItems = [];
    }
  }

  /** واژه‌های قدیمی یا واردشده را به ساختار کامل تبدیل می‌کند */
  private normalize(p: Partial<SpellingItem>): SpellingItem {
    const word = (p.word || p.correctSpelling || '').trim();
    const cat = (p.category || 'all') as SpellingCategory;
    const variants = (p.incorrectVariants || []).filter(Boolean);
    // اگر معلم حرف چالشی را ننوشته باشد، از روی تفاوت املای درست و غلط
    // خودمان پیدایش می‌کنیم تا حالت «جای خالی» هم کار کند
    const derived = deriveKeyLetter(word, variants);
    const key = p.missingLetter || derived?.letter;
    const idx = key ? (p.missingLetter ? word.indexOf(key) : derived!.index) : -1;
    return {
      id: p.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      word,
      correctSpelling: word,
      incorrectVariants: variants,
      missingLetter: key,
      missingIndex: idx >= 0 ? idx : undefined,
      isSnipeable: !!key && idx >= 0 && !NON_SNIPE_CATEGORIES.includes(cat),
      decoyLetters:
        p.decoyLetters && p.decoyLetters.length
          ? p.decoyLetters
          : (CATEGORY_LETTERS[cat] || CATEGORY_LETTERS.all).filter((l) => l !== key),
      meaning: p.meaning || 'واژهٔ درسی کلاس',
      ruleExplanation: p.ruleExplanation || `املای درست این واژه «${word}» است.`,
      sentence: p.sentence || `«${word}» را در یک جمله به کار ببر.`,
      hint: p.hint || p.meaning || 'واژهٔ درسی کلاس',
      category: cat,
      grade: (p.grade || 'all') as GradeLevel,
      difficulty: (p.difficulty || 1) as 1 | 2 | 3,
      isCustom: p.isCustom ?? true,
    };
  }

  private save(): void {
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(this.customItems));
      localStorage.setItem('wh_custom_only', this.customOnly ? '1' : '0');
    } catch (e) {
      console.warn('ذخیرهٔ واژه‌های معلم ناموفق بود', e);
    }
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // ─────────── خواندن واژه‌ها ───────────

  public getBuiltInItems(): SpellingItem[] {
    return BUILT_IN;
  }

  public getCustomItems(): SpellingItem[] {
    return this.customItems;
  }

  public getAllItems(): SpellingItem[] {
    if (this.sessionItems && this.sessionItems.length > 0) return this.sessionItems;
    if (this.customOnly && this.customItems.length > 0) return this.customItems;
    return [...BUILT_IN, ...this.customItems];
  }

  /** واژه‌های این جلسه را از بیرون تعیین می‌کند (null یعنی برگرد به بانک کامل) */
  public setSessionWords(words: Partial<SpellingItem>[] | null): number {
    if (!words || words.length === 0) {
      this.sessionItems = null;
      this.listeners.forEach((fn) => fn());
      return 0;
    }
    this.sessionItems = words
      .filter((w) => (w.word || w.correctSpelling || '').trim().length > 0)
      .map((w) => this.normalize(w));
    this.listeners.forEach((fn) => fn());
    return this.sessionItems.length;
  }

  public getSessionWords(): SpellingItem[] | null {
    return this.sessionItems;
  }

  public getCustomOnly(): boolean {
    return this.customOnly;
  }

  public setCustomOnly(v: boolean): void {
    this.customOnly = v;
    this.save();
  }

  public getFilteredItems(
    category: SpellingCategory = 'all',
    grade: GradeLevel = 'all',
    difficulty?: number,
    opts: { needSnipeable?: boolean; needVariants?: number } = {}
  ): SpellingItem[] {
    const all = this.getAllItems();
    const passes = (item: SpellingItem, strict: boolean) => {
      if (opts.needSnipeable && !item.isSnipeable) return false;
      if (opts.needVariants && item.incorrectVariants.length < opts.needVariants) return false;
      if (!strict) return true;
      if (category !== 'all' && item.category !== category) return false;
      if (grade !== 'all' && item.grade !== grade && item.grade !== 'all') return false;
      if (difficulty && item.difficulty > difficulty) return false;
      return true;
    };

    // ۱) دقیقاً مطابق دستهٔ مرحله
    let pool = all.filter((i) => passes(i, true));
    if (pool.length >= 3) return pool;

    // ۲) همان دسته ولی بدون محدودیت پایه/دشواری
    pool = all.filter(
      (i) => (category === 'all' || i.category === category) && passes(i, false)
    );
    if (pool.length >= 3) return pool;

    // ۳) هر واژه‌ای که شرایط فنی حالت بازی را داشته باشد
    pool = all.filter((i) => passes(i, false));
    return pool.length > 0 ? pool : all;
  }

  /**
   * یک واژهٔ تصادفی که در چند دور اخیر تکرار نشده باشد.
   * recentIds برای جلوگیری از تکرار پشت سر هم استفاده می‌شود.
   */
  public getRandomItem(
    category: SpellingCategory = 'all',
    grade: GradeLevel = 'all',
    difficulty?: number,
    opts: { needSnipeable?: boolean; needVariants?: number; recentIds?: string[] } = {}
  ): SpellingItem {
    const pool = this.getFilteredItems(category, grade, difficulty, opts);

    if (this.noRepeat) {
      const unasked = pool.filter((i) => !this.askedIds.has(i.id));
      // وقتی همهٔ واژه‌های این دسته پرسیده شد، دور تازه‌ای آغاز می‌شود
      if (unasked.length === 0) pool.forEach((i) => this.askedIds.delete(i.id));
      const src = unasked.length > 0 ? unasked : pool;
      // اینجا واژه را «پرسیده‌شده» علامت نمی‌زنیم؛ این کار وقتی انجام می‌شود
      // که دانش‌آموز واقعاً به آن پاسخ داده باشد. وگرنه هر بار که یک تکهٔ
      // مأموریت عوض می‌شود، یک واژه بی‌آنکه پرسیده شود مصرف می‌شد.
      return src[Math.floor(Math.random() * src.length)];
    }

    const recent = opts.recentIds || [];
    const fresh = pool.filter((i) => !recent.includes(i.id));
    const source = fresh.length > 0 ? fresh : pool;
    return source[Math.floor(Math.random() * source.length)];
  }

  /** آغاز یک آزمون: از این پس واژه‌ها تکرار نمی‌شوند */
  public beginQuiz(): void {
    this.noRepeat = true;
    this.askedIds.clear();
  }

  /** واژه‌ای که واقعاً پرسیده و پاسخ داده شد */
  public markAsked(id: string): void {
    if (this.noRepeat) this.askedIds.add(id);
  }

  /** پایان آزمون: بازگشت به رفتار عادی */
  public endQuiz(): void {
    this.noRepeat = false;
    this.askedIds.clear();
  }

  public getItemById(id: string): SpellingItem | undefined {
    return this.getAllItems().find((i) => i.id === id);
  }

  // ─────────── مدیریت واژه‌های معلم ───────────

  public addCustomItem(partial: Partial<SpellingItem>): SpellingItem {
    const item = this.normalize(partial);
    this.customItems.push(item);
    this.save();
    return item;
  }

  public removeCustomItem(id: string): boolean {
    const before = this.customItems.length;
    this.customItems = this.customItems.filter((i) => i.id !== id);
    this.save();
    return this.customItems.length < before;
  }

  public clearCustomItems(): void {
    this.customItems = [];
    this.save();
  }

  public exportCustomItems(): string {
    return JSON.stringify(
      { version: 2, exportedAt: new Date().toISOString(), words: this.customItems },
      null,
      2
    );
  }

  /** برمی‌گرداند: تعداد واژه‌های افزوده‌شده */
  public importCustomItems(json: string, replace = false): number {
    const parsed = JSON.parse(json);
    const list: Partial<SpellingItem>[] = Array.isArray(parsed) ? parsed : parsed.words;
    if (!Array.isArray(list)) throw new Error('ساختار فایل معتبر نیست.');
    const normalized = list.filter((p) => (p.word || p.correctSpelling)).map((p) => this.normalize(p));
    if (normalized.length === 0) throw new Error('هیچ واژهٔ معتبری در فایل یافت نشد.');
    this.customItems = replace ? normalized : [...this.customItems, ...normalized];
    this.save();
    return normalized.length;
  }

  // ─────────── نام‌های نمایشی ───────────

  public getCategoryInfo(cat: SpellingCategory) {
    return CATEGORY_INFO[cat] || CATEGORY_INFO.all;
  }

  public getCategoryDisplayName(cat: SpellingCategory): string {
    return (CATEGORY_INFO[cat] || CATEGORY_INFO.all).title;
  }

  public getGradeDisplayName(grade: GradeLevel): string {
    switch (grade) {
      case 'grade_1_2': return 'پایهٔ اول و دوم';
      case 'grade_3_4': return 'پایهٔ سوم و چهارم';
      case 'grade_5_6': return 'پایهٔ پنجم و ششم';
      case 'middle_school': return 'دورهٔ اول متوسطه';
      default: return 'همهٔ پایه‌ها';
    }
  }

  public getGameModeDisplayName(mode: GameMode): { fa: string; desc: string; icon: string; how: string } {
    switch (mode) {
      case 'word_hunt':
        return {
          fa: 'شکار کلمه', icon: '🏹',
          desc: 'از میان گویچه‌های شناور، املای درست را پیدا کن',
          how: 'فقط به گویچه‌ای شلیک کن که املای آن درست است.',
        };
      case 'letter_snipe':
        return {
          fa: 'تیراندازی به حرف', icon: '🔤',
          desc: 'جای خالی واژه را با حرف درست پر کن',
          how: 'حرفِ درستِ جای خالی را روی بلورها پیدا کن و بزن.',
        };
      case 'word_rescue':
        return {
          fa: 'نجات کلمه', icon: '🛡️',
          desc: 'قفل‌های غلط را بشکن تا واژهٔ اسیر آزاد شود',
          how: 'اول همهٔ قفل‌های غلط را بزن، سپس واژهٔ طلایی را آزاد کن.',
        };
      case 'monster_combat':
        return {
          fa: 'شکار غلط املایی', icon: '👾',
          desc: 'هیولا واژه را غلط نوشته؛ نوشتهٔ درست را به او بزن',
          how: 'رون درست را بزن تا هیولا پاک شود؛ زدن خود هیولا کارساز نیست.',
        };
      case 'audio_whisper':
        return {
          fa: 'املای شنیداری', icon: '🎧',
          desc: 'واژه را بشنو و نوشتار درستش را شکار کن',
          how: 'دکمهٔ «شنیدن دوباره» را بزن، سپس املای درست را انتخاب کن.',
        };
      case 'speed_rush':
        return {
          fa: 'حملهٔ زمان‌دار', icon: '⚡',
          desc: 'در زمان محدود، بیشترین املای درست را بزن',
          how: 'سرعت مهم است؛ تا پایان زمان هرچه بیشتر درست بزن.',
        };
      case 'boss_battle':
        return {
          fa: 'نبرد با غول غلط‌نویس', icon: '👑',
          desc: 'سپرهای غول را بشکن و طلسم غلط‌نویسی را پایان بده',
          how: 'رون درست را بزن تا به غول آسیب برسد و نفرین‌ها را در هوا بزن.',
        };
      default:
        return { fa: 'بازی آزاد', desc: '', icon: '🎯', how: '' };
    }
  }
}

export const spellingContentAdapter = new SpellingContentAdapter();

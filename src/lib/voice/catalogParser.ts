import { normalizePersianText } from "../persian/utils";
import { parsePersianNumberWords } from "./persianNormalizer";
import type { DatabaseProductSummary, ResolvedVoiceItem, VoiceResolutionResult } from "./ambiguityResolver";

// کلماتِ عدد (کلمه‌ای) — ارقام انگلیسی هم عدد شمرده می‌شوند.
const NUM_WORDS = new Set([
  "صفر", "یک", "یه", "یکی", "دو", "سه", "چهار", "پنج", "شش", "شیش", "هفت", "هشت", "نه", "ده",
  "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "پونزده", "شانزده", "شونزده", "هفده", "هجده", "نوزده",
  "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود",
  "صد", "یکصد", "دویست", "سیصد", "چهارصد", "پانصد", "پونصد", "ششصد", "شیشصد", "هفتصد", "هشتصد", "نهصد", "هزار",
]);
const UNIT_WORDS = new Set(["تا", "عدد", "بسته", "کارتن", "دونه", "دانه", "عددی", "تایی", "جین", "دست", "جفت"]);
const SEP_WORDS = new Set(["و", "بعدی", "بعدا", "بعدش", "همچنین", "بعد", "سپس", "بعدشم"]);
// کلماتی که در گفتارِ روزمرهٔ مغازه زیاد می‌آیند ولی نامِ کالا نیستند.
// (بدونِ این‌ها، «سلام» یا «ممنون» تبدیل به یک ردیفِ زبالهٔ «پیدا نشد» می‌شد.)
const FILLER_WORDS = new Set([
  "رو", "را", "برای", "لطفا", "میخوام", "می‌خوام", "بده", "بدید", "بدهید", "بزن", "بنویس", "اضافه", "کن", "کنید", "هم",
  "سلام", "درود", "ببخشید", "ممنون", "مرسی", "خواهش", "آقا", "اقا", "خانم", "خانوم", "استاد", "داداش",
  "خب", "خوب", "بسیارخب", "باشه", "اوکی", "بله", "آره", "اره", "دیگه", "فقط", "یعنی", "الان", "بیار", "بیارید",
]);

const isDigitTok = (t: string) => /^\d+$/.test(t);
const isNumTok = (t: string) => isDigitTok(t) || NUM_WORDS.has(t);
/** توکنِ لاتین (a4 و مانندش رقم/حرف مخلوط‌اند و لاتینِ خالص حساب نمی‌شوند). */
const isLatinTok = (t: string) => /^[a-z]+$/i.test(t);

interface CatEntry { p: DatabaseProductSummary; tokens: string[]; }

/**
 * آیا توکنِ گفته‌شده با توکنِ نامِ کالا یکی است؟
 * قاعدهٔ سخت‌گیرانه‌ای که از تطبیق‌های غلط جلوگیری می‌کند:
 *  - رقم فقط با رقمِ دقیقاً برابر یکی است («۸۰» هرگز با «۱۰۰» یا «۸۰۰» یکی نیست).
 *  - کلمه‌ها یا برابرند یا یکی پیشوندِ دیگری با حداقل ۳ حرف است (برای «ماژیک/ماژیکی»).
 */
const tokEq = (spoken: string, cat: string): boolean => {
  if (spoken === cat) return true;
  if (isDigitTok(spoken) || isDigitTok(cat)) return false; // رقم‌ها باید عیناً برابر باشند
  const a = spoken, b = cat;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  return shorter.length >= 3 && longer.startsWith(shorter);
};

/** نامزدهای تطبیق برای یک «پنجرهٔ» گفته‌شده در موقعیت i. */
interface Candidate { c: CatEntry; complete: boolean; covCat: number; }

/**
 * تفکیک و شمارشِ اقلامِ فاکتور/خرید «با کمکِ لیست محصولات».
 *
 * اصولِ این تفکیک‌گر (بازنویسیِ کامل — نسخهٔ ۲۷):
 *  ۱) هر کلمه‌ای که کاربر داخلِ نام گفته باید در نامِ کالا باشد (پوششِ گفتار = ۱۰۰٪).
 *     پس «دفتر ۸۰ برگ» هرگز به «دفتر ۱۰۰ برگ» نمی‌چسبد.
 *  ۲) رقم‌ها باید عیناً برابر باشند؛ کدِ ناموجود («کد ۹۹۹») باعثِ انتخابِ کدِ دیگر نمی‌شود،
 *     بلکه صادقانه «پیدا نشد» گزارش می‌شود.
 *  ۳) اگر گفتار فقط بخشی از نام باشد و چند کالا با آن جور دربیایند، به‌جای انتخابِ
 *     دلبخواه، وضعیت «مبهم» با فهرستِ گزینه‌ها برگردانده می‌شود تا کاربر انتخاب کند.
 *  ۴) عددهای مرکب («بیست و پنج»، «چهل و دو»، «دو هزار») یکجا خوانده می‌شوند.
 *  ۵) واژه‌های لاتینِ بی‌ربط (نویزِ موتور تشخیص مثل ok/thanks) دور ریخته می‌شوند.
 */
export function resolveVoiceItemsWithCatalog(
  normText: string,
  products: DatabaseProductSummary[]
): VoiceResolutionResult {
  // پیش‌پردازش: حذفِ پیشوندِ مشتری و افعالِ دستوری؛ ویرگول → «و».
  let text = normText.replace(/(?:برای|به نام|مشتری)\s+[آ-ی\s]+?(?=\s+فاکتور|\s+سه|\s+دو|\s+یک|\s+\d+)/, "");
  text = text.replace(/فاکتور بزن|فاکتور ثبت کن|ثبت کن/g, "");
  text = text.replace(/[،,؛]/g, " و ");

  // آماده‌سازیِ کاتالوگ.
  const cat: CatEntry[] = products
    .map((p) => ({ p, tokens: normalizePersianText(p.name).split(/\s+/).filter(Boolean) }))
    .filter((c) => c.tokens.length > 0);
  const maxCatLen = cat.reduce((m, c) => Math.max(m, c.tokens.length), 1);
  // واژگانِ کاتالوگ — برای دور ریختنِ نویزِ لاتینِ بی‌ربط.
  const vocab = new Set<string>();
  for (const c of cat) for (const t of c.tokens) vocab.add(t);

  const tokens = text
    .split(/\s+/)
    .filter(Boolean)
    // نویزِ لاتین که در هیچ نامِ کالایی نیست (ok, thanks, …) حذف می‌شود.
    .filter((t) => !(isLatinTok(t) && !vocab.has(t)));

  /**
   * نامزدهای یک پنجره: کالاهایی که «همهٔ» کلماتِ گفته‌شده در نامشان هست و از کلمهٔ اولِ
   * نام شروع می‌شود. complete یعنی پنجره تمامِ کلماتِ نامِ کالا را پوشانده است.
   */
  const candidatesFor = (win: string[]): Candidate[] => {
    const out: Candidate[] = [];
    for (const c of cat) {
      if (win.length > c.tokens.length) continue;
      if (!tokEq(win[0], c.tokens[0])) continue; // لنگرگاه: کلمهٔ اولِ نام
      // هر کلمهٔ گفته‌شده باید جایی در نامِ کالا باشد (به‌ترتیب، بدونِ مصرفِ دوباره).
      const used = new Array(c.tokens.length).fill(false);
      let ok = true;
      let matched = 0;
      for (const w of win) {
        let found = -1;
        for (let j = 0; j < c.tokens.length; j++) {
          if (!used[j] && tokEq(w, c.tokens[j])) { found = j; break; }
        }
        if (found < 0) { ok = false; break; }
        used[found] = true;
        matched++;
      }
      if (!ok) continue;
      out.push({ c, complete: win.length === c.tokens.length, covCat: matched / c.tokens.length });
    }
    return out;
  };

  const resolvedItems: ResolvedVoiceItem[] = [];
  let hasAmbiguity = false;
  const promptParts: string[] = [];
  let pendingQty: number | null = null;
  let unknownBuf: string[] = [];

  /** آیا این کلمه اصلاً شبیهِ واژگانِ کالاهاست؟ (برای دور ریختنِ تک‌کلمه‌های نامربوط) */
  const looksLikeProductWord = (t: string): boolean => {
    for (const v of vocab) if (tokEq(t, v)) return true;
    return false;
  };

  const flushUnknown = (qty: number) => {
    const toks = unknownBuf.slice();
    const name = toks.join(" ").trim();
    unknownBuf = [];
    // یک کلمهٔ تنها که هیچ ربطی به واژگانِ کالاها ندارد، نویزِ گفتار است نه کالا —
    // ردیفِ «پیدا نشد» برایش ساخته نمی‌شود. (نامِ چندکلمه‌ای یا کلمهٔ نزدیک به کاتالوگ
    // مثل «دفترچه» همچنان گزارش می‌شود چون واقعاً درخواستِ کالاست.)
    if (toks.length === 1 && !looksLikeProductWord(toks[0])) return;
    if (name.length > 1) {
      hasAmbiguity = true;
      resolvedItems.push({ requestedName: name, quantity: qty, matches: [], status: "NOT_FOUND" });
      promptParts.push(`کالای «${name}» در انبار پیدا نشد.`);
    }
  };

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];

    // ── جداکننده ──────────────────────────────────────────────────────────
    if (SEP_WORDS.has(tok)) {
      if (unknownBuf.length) {
        flushUnknown(pendingQty ?? 1);
        pendingQty = null;
      } else if (pendingQty != null && resolvedItems.length > 0) {
        // عددی که پس از یک کالا و پیش از جداکننده آمده، «تعدادِ پسوندیِ» همان کالاست.
        resolvedItems[resolvedItems.length - 1].quantity = pendingQty;
        pendingQty = null;
      }
      i++;
      continue;
    }

    // ── تلاش برای تطبیقِ نامِ کالا (بلندترین پنجرهٔ ممکن، اول) ───────────────
    // پیش از بررسیِ عدد انجام می‌شود تا نامی که با رقم شروع می‌شود هم گرفته شود؛
    // ولی فقط وقتی پنجره بیش از یک توکن باشد یا توکن عدد نباشد (تا «یک» به‌عنوانِ
    // زیررشتهٔ «ماژیک» کالا حساب نشود).
    let matchedHere = false;
    const maxSpan = Math.min(maxCatLen, tokens.length - i);
    for (let k = maxSpan; k >= 1; k--) {
      const win = tokens.slice(i, i + k);
      // مرزِ نام: جداکننده یا واحدِ صریح نمی‌تواند داخلِ نام باشد.
      if (win.some((w, idx) => idx > 0 && (SEP_WORDS.has(w) || UNIT_WORDS.has(w)))) continue;
      // پنجرهٔ تک‌کلمه‌ایِ عددی هرگز نامِ کالا نیست (تعداد است).
      if (k === 1 && isNumTok(win[0])) continue;
      const cands = candidatesFor(win);
      if (!cands.length) continue;

      // ترجیح: تطبیق‌های کامل بر ناقص.
      const complete = cands.filter((x) => x.complete);
      let chosen = complete.length ? complete : cands;

      // تطبیقِ ناقص + ادامهٔ نام: کاربر دارد نامِ کالا را کامل می‌گوید ولی هیچ کالایی با
      // نامِ کاملِ گفته‌شده جور در نمی‌آید («خودکار طلایی بیک» یا «مداد پروتون کد ۹۹۹»).
      // در این حالت به‌جای ساختنِ یک ردیفِ ناقص + یک ردیفِ زباله، صادقانه یک ردیفِ
      // «پیدا نشد» با نامِ کاملِ گفته‌شده می‌سازیم.
      // ملاکِ «ادامهٔ نام» در برابر «کالای بعدی»: اگر کلمهٔ بعدی خودش سرِ یک کالای معتبر
      // باشد («… پاک‌کن تراش فلزی») ادامهٔ نام نیست و دو کالای جداست.
      if (!complete.length) {
        const candsHaveDigits = chosen.some((x) => x.c.tokens.some(isDigitTok));
        const absorbable = (t: string): boolean => {
          if (!t || SEP_WORDS.has(t) || UNIT_WORDS.has(t) || FILLER_WORDS.has(t)) return false;
          if (candidatesFor([t]).length > 0) return false;      // خودش سرِ کالای دیگری است
          if (isDigitTok(t)) return candsHaveDigits;            // رقم = کدِ کالا (نه تعداد)
          return !isNumTok(t);                                  // «سه/پنج/…» تعدادند، نه نام
        };
        const nameToks = [...win];
        let j = i + k;
        while (j < tokens.length && absorbable(tokens[j])) { nameToks.push(tokens[j]); j++; }
        if (nameToks.length > win.length) {
          if (unknownBuf.length) flushUnknown(1);
          unknownBuf = nameToks;
          flushUnknown(pendingQty ?? 1);
          pendingQty = null;
          i = j;
          matchedHere = true;
          break;
        }
      }

      // انتخابِ نهایی: اگر بیش از یک کالا نامزد باشد → «مبهم» (کاربر انتخاب می‌کند).
      if (unknownBuf.length) flushUnknown(1);
      const qty = pendingQty ?? 1;
      pendingQty = null;
      if (chosen.length === 1) {
        const c = chosen[0].c;
        resolvedItems.push({
          requestedName: win.join(" "),
          quantity: qty,
          selectedProduct: c.p,
          matches: [c.p],
          status: "EXACT",
        });
      } else {
        // بهترین‌ها را بر اساسِ پوششِ نام مرتب می‌کنیم تا گزینهٔ محتمل‌تر اول باشد.
        const sorted = [...chosen].sort((a, b) => b.covCat - a.covCat);
        hasAmbiguity = true;
        promptParts.push(`«${win.join(" ")}» چند کالای مشابه دارد — کدام را می‌خواهید؟`);
        resolvedItems.push({
          requestedName: win.join(" "),
          quantity: qty,
          selectedProduct: undefined,
          matches: sorted.map((x) => x.c.p),
          status: "AMBIGUOUS",
        });
      }
      i += k;
      matchedHere = true;
      break;
    }
    if (matchedHere) continue;

    // ── عدد (تعداد) — دنبالهٔ کاملِ عدد را یکجا می‌خوانیم ────────────────────
    // «بیست و پنج» → ۲۵، «چهل و دو» → ۴۲، «دو هزار» → ۲۰۰۰، «صد و بیست» → ۱۲۰.
    if (isNumTok(tok)) {
      if (unknownBuf.length) flushUnknown(pendingQty ?? 1);
      const run: string[] = [tok];
      let j = i + 1;
      while (j < tokens.length) {
        if (isNumTok(tokens[j])) { run.push(tokens[j]); j++; continue; }
        // «و» فقط وقتی جزوِ عدد است که پس از آن هم عدد بیاید («بیست و پنج»).
        if (tokens[j] === "و" && j + 1 < tokens.length && isNumTok(tokens[j + 1])) { run.push("و"); j++; continue; }
        break;
      }
      const parsed = parsePersianNumberWords(run.join(" "));
      pendingQty = parsed != null && parsed > 0 ? parsed : 1;
      if (tokens[j] && UNIT_WORDS.has(tokens[j])) j++; // واحد (تا/عدد/…) را مصرف کن
      i = j;
      continue;
    }

    // ── واحدها و کلماتِ پرکننده ────────────────────────────────────────────
    if (UNIT_WORDS.has(tok) || FILLER_WORDS.has(tok) || tok === "تومان" || tok === "تومن" || tok === "ریال") {
      i++;
      continue;
    }

    // ── کلمهٔ نامعلوم ──────────────────────────────────────────────────────
    unknownBuf.push(tok);
    i++;
  }

  if (unknownBuf.length) {
    flushUnknown(pendingQty ?? 1);
  } else if (pendingQty != null && resolvedItems.length > 0) {
    // عددِ انتهایی بدونِ کالای بعدی → تعدادِ پسوندیِ آخرین کالا («دفتر ۸۰ برگ سه تا»).
    resolvedItems[resolvedItems.length - 1].quantity = pendingQty;
  }

  return {
    hasAmbiguity,
    needsConfirmation: true,
    promptText: promptParts.length ? promptParts.join(" ") : undefined,
    resolvedItems,
  };
}

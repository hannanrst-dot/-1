import { calculateSimilarity, normalizePersianText } from "../persian/utils";
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
const FILLER_WORDS = new Set(["رو", "را", "برای", "لطفا", "میخوام", "بده", "بزن", "بنویس", "اضافه", "کن", "هم"]);
const isNumTok = (t: string) => /^\d+$/.test(t) || NUM_WORDS.has(t);

interface CatEntry { p: DatabaseProductSummary; tokens: string[]; }

/**
 * تفکیک و شمارشِ اقلامِ فاکتور/خرید «با کمکِ لیست محصولات».
 *
 * برخلاف تفکیکِ کورِ قبلی، این تابع نامِ کاملِ محصولاتِ ثبت‌شده را (همراه عددهای
 * داخلِ نام مثل «دفتر ۸۰ برگ» یا «منگنه ۵۰۶۳» یا کلمه‌ای مثل «سی» در «خودکار سی کلاس»)
 * به‌صورت یک واحد در متن پیدا می‌کند و فقط عددهایی را «تعداد» می‌گیرد که واقعاً بین/پیش از
 * محصولات هستند. این کار سه ایراد اصلی را حل می‌کند:
 *   ۱) عددِ داخلِ نام به‌اشتباه تعداد گرفته نشود.
 *   ۲) وقتی «و» بین کالاها گفته نشود، کالاها قاطی/گم نشوند.
 *   ۳) کلمه‌های عددیِ داخلِ نام (سی، صد، ...) تعداد حساب نشوند.
 */
export function resolveVoiceItemsWithCatalog(
  normText: string,
  products: DatabaseProductSummary[]
): VoiceResolutionResult {
  // پیش‌پردازش: حذفِ پیشوندِ مشتری و افعالِ دستوری؛ ویرگول → «و».
  let text = normText.replace(/(?:برای|به نام|مشتری)\s+[آ-ی\s]+?(?=\s+فاکتور|\s+سه|\s+دو|\s+یک|\s+\d+)/, "");
  text = text.replace(/فاکتور بزن|فاکتور ثبت کن|ثبت کن/g, "");
  text = text.replace(/[،,؛]/g, " و ");

  const tokens = text.split(/\s+/).filter(Boolean);

  // آماده‌سازیِ کاتالوگ: نامِ هر محصول را نرمال و توکن‌بندی می‌کنیم.
  const cat: CatEntry[] = products
    .map((p) => ({ p, tokens: normalizePersianText(p.name).split(/\s+/).filter(Boolean) }))
    .filter((c) => c.tokens.length > 0);

  // در موقعیت i بهترین محصولِ منطبق را پیدا می‌کند.
  // نکته: کاربر معمولاً «بخشی» از نامِ کامل را می‌گوید (مثلاً «کاغذ a4» به‌جای «کاغذ a4 تکی»).
  // پس برای هر محصول، پنجره‌هایی به طول‌های مختلف امتحان و بهترین تطبیق انتخاب می‌شود.
  const matchAt = (i: number): { c: CatEntry; len: number; score: number } | null => {
    let best: { c: CatEntry; len: number; score: number } | null = null;
    const firstTok = tokens[i];
    const remaining = tokens.length - i;
    for (const c of cat) {
      const L = c.tokens.length;
      const catName = c.tokens.join(" ");
      const firstSim = calculateSimilarity(firstTok, c.tokens[0]);
      if (firstSim < 0.5) continue; // توکنِ اولِ نام باید نسبتاً منطبق باشد (لنگرگاه)
      const maxK = Math.min(L, remaining);
      let localBest: { k: number; score: number } | null = null;
      for (let k = 1; k <= maxK; k++) {
        const tk = tokens[i + k - 1];
        // جداکننده یا واحدِ صریح، مرزِ نام است (عددِ داخلِ نام مثل «۸۰ برگ» اجازه دارد بماند).
        if (k > 1 && (SEP_WORDS.has(tk) || UNIT_WORDS.has(tk))) break;
        const win = tokens.slice(i, i + k).join(" ");
        const score = calculateSimilarity(win, catName);
        if (!localBest || score > localBest.score || (score === localBest.score && k > localBest.k)) {
          localBest = { k, score };
        }
      }
      if (localBest && localBest.score >= 0.6) {
        // ترجیح: امتیازِ بالاتر، سپس پنجرهٔ بلندتر (نامِ دقیق‌تر و بلندتر).
        if (!best || localBest.score > best.score || (localBest.score === best.score && localBest.k > best.len)) {
          best = { c, len: localBest.k, score: localBest.score };
        }
      }
    }
    return best;
  };

  const resolvedItems: ResolvedVoiceItem[] = [];
  let hasAmbiguity = false;
  const promptParts: string[] = [];
  let pendingQty: number | null = null;
  let unknownBuf: string[] = [];

  const emitProduct = (c: CatEntry, qty: number) => {
    resolvedItems.push({
      requestedName: c.tokens.join(" "),
      quantity: qty,
      selectedProduct: c.p,
      matches: [c.p],
      status: "EXACT",
    });
  };
  const flushUnknown = (qty: number) => {
    const name = unknownBuf.join(" ").trim();
    unknownBuf = [];
    if (name.length > 1) {
      hasAmbiguity = true;
      resolvedItems.push({ requestedName: name, quantity: qty, matches: [], status: "NOT_FOUND" });
      promptParts.push(`کالای «${name}» در انبار پیدا نشد.`);
    }
  };

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];

    // جداکننده → پایانِ قلمِ ناشناختهٔ جاری (اگر بود)
    if (SEP_WORDS.has(tok)) {
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      if (tok === "و" && prev && next && isNumTok(prev) && isNumTok(next)) { i++; continue; } // عددِ مرکب
      if (unknownBuf.length) {
        flushUnknown(pendingQty ?? 1);
        pendingQty = null;
      } else if (pendingQty != null && resolvedItems.length > 0) {
        // عددی که بعد از یک محصول و پیش از جداکننده آمده، «تعدادِ پسوندیِ» همان محصول است
        // (مثل «دفتر ۸۰ برگ سه تا و ...»).
        resolvedItems[resolvedItems.length - 1].quantity = pendingQty;
        pendingQty = null;
      }
      // اگر هنوز محصولی نداشته‌ایم، pendingQty را نگه می‌داریم تا به محصولِ بعدی بچسبد.
      i++;
      continue;
    }

    // عددِ «مستقل» را قبل از تطبیقِ محصول بررسی می‌کنیم: چون بعضی کلمه‌های عددی (مثل «یک»)
    // اتفاقاً زیررشتهٔ نامِ کالا هستند (مثلِ «ماژیک»/«جیکسین») و نباید به‌اشتباه محصول شمرده شوند.
    // نکته: عددِ داخلِ نام (مثل «۸۰ برگ» یا «منگنه ۵۰۶۳») هیچ‌وقت به‌صورت توکنِ مستقل به اینجا
    // نمی‌رسد، چون matchAt آن را در پنجرهٔ نام (لنگرگاهش کلمهٔ قبلی است) می‌بلعد.
    if (isNumTok(tok)) {
      if (unknownBuf.length) flushUnknown(pendingQty ?? 1);
      pendingQty = parsePersianNumberWords(tok) || 1;
      if (tokens[i + 1] && UNIT_WORDS.has(tokens[i + 1])) i++; // واحد (تا/عدد/...) را مصرف کن
      i++;
      continue;
    }

    // تلاش برای تطبیقِ محصول از کاتالوگ در این موقعیت.
    const m = matchAt(i);
    if (m) {
      if (unknownBuf.length) flushUnknown(1); // بافرِ ناشناخته را با تعداد ۱ خالی کن
      emitProduct(m.c, pendingQty ?? 1);
      pendingQty = null;
      i += m.len;
      continue;
    }

    // واحدهای آزاد یا کلمه‌های پرکننده را نادیده بگیر.
    if (UNIT_WORDS.has(tok) || FILLER_WORDS.has(tok) || tok === "تومان" || tok === "تومن" || tok === "ریال") {
      i++;
      continue;
    }

    // کلمهٔ نامعلوم → به بافرِ نامِ ناشناخته اضافه کن.
    unknownBuf.push(tok);
    i++;
  }
  if (unknownBuf.length) {
    flushUnknown(pendingQty ?? 1);
  } else if (pendingQty != null && resolvedItems.length > 0) {
    // عددِ انتهایی بدونِ محصولِ بعدی → تعدادِ پسوندیِ آخرین محصول («دفتر ۸۰ برگ سه تا»).
    resolvedItems[resolvedItems.length - 1].quantity = pendingQty;
  }

  return {
    hasAmbiguity,
    needsConfirmation: true,
    promptText: promptParts.length ? promptParts.join(" ") : undefined,
    resolvedItems,
  };
}

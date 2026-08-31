import { normalizePersianText, toEnglishDigits } from "../persian/utils";

// Mapping dictionary for Persian word numbers
const PERSIAN_WORDS_MAP: Record<string, number> = {
  صفر: 0,
  یک: 1,
  یکی: 1,
  دو: 2,
  تایی: 1,
  سه: 3,
  چهار: 4,
  پنج: 5,
  شش: 6,
  شیش: 6,
  هفت: 7,
  هشت: 8,
  نه: 9,
  ده: 10,
  یازده: 11,
  دوازده: 12,
  سیزده: 13,
  چهارده: 14,
  پانزده: 15,
  پونزده: 15,
  شانزده: 16,
  شونزده: 16,
  هفده: 17,
  هجده: 18,
  نوزده: 19,
  بیست: 20,
  سی: 30,
  چهل: 40,
  پنجاه: 50,
  شصت: 60,
  هفتاد: 70,
  هشتاد: 80,
  نود: 90,
  صد: 100,
  یکصد: 100,
  دویست: 200,
  سیصد: 300,
  چهارصد: 400,
  پانصد: 500,
  پونصد: 500,
  ششصد: 600,
  شیشصد: 600,
  هفتصد: 700,
  هشتصد: 800,
  نهصد: 900,
  هزار: 1000,
  میلیون: 1000000,
  میلیارد: 1000000000,
};

/**
 * Parses Persian text containing number words or mixed numbers into integer
 * Examples:
 * "چهل و پنج هزار" -> 45000
 * "پنجاه" -> 50
 * "۱۲ و نیم میلیون" -> 12500000
 * "۵۰ هزار" -> 50000
 */
export function parsePersianNumberWords(text: string): number | null {
  if (!text) return null;

  let cleaned = normalizePersianText(text);
  cleaned = toEnglishDigits(cleaned);

  // If text is purely numeric
  if (/^\d+$/.test(cleaned)) {
    return parseInt(cleaned, 10);
  }

  // Handle fractional millions/thousands e.g., "۱۲ و نیم میلیون" -> 12.5M
  if (cleaned.includes('و نیم میلیون')) {
    const mainNumMatch = cleaned.match(/(\d+|[ا-ی]+)\s*و\s*نیم\s*میلیون/);
    if (mainNumMatch) {
      const base = parsePersianNumberWords(mainNumMatch[1]);
      if (base !== null) return (base + 0.5) * 1000000;
    }
  }

  // Handle "X هزار" or "X میلیون" or "X تومن"
  const multiplierMatches = [
    { regex: /(\d+)\s*(میلیارد)/, mult: 1000000000 },
    { regex: /(\d+)\s*(میلیون|میلیون تومان|میلیون تومن)/, mult: 1000000 },
    { regex: /(\d+)\s*(هزار|کیلو)/, mult: 1000 },
    { regex: /(\d+)\s*(تومان|تومن)/, mult: 1 },
  ];

  for (const m of multiplierMatches) {
    const match = cleaned.match(m.regex);
    if (match) {
      const val = parseInt(match[1], 10);
      return val * m.mult;
    }
  }

  // Split into token parts by spaces or 'و'
  const tokens = cleaned
    .replace(/\bو\b/g, ' ')
    .replace(/تومان|تومن|ریال|عدد|تا|دونه/g, '')
    .split(/\s+/)
    .filter(Boolean);

  let currentSum = 0;
  let tempSum = 0;
  let foundAny = false;

  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      tempSum += parseInt(token, 10);
      foundAny = true;
      continue;
    }

    const val = PERSIAN_WORDS_MAP[token];
    if (val !== undefined) {
      foundAny = true;
      if (val === 1000 || val === 1000000 || val === 1000000000) {
        if (tempSum === 0) tempSum = 1;
        currentSum += tempSum * val;
        tempSum = 0;
      } else {
        tempSum += val;
      }
    }
  }

  currentSum += tempSum;
  return foundAny ? currentSum : null;
}

/**
 * حذف تکرارهای پیاپی که موتور تشخیص گفتار مرورگر (به‌ویژه در موبایل) تولید می‌کند.
 * مثال: «دفتر دفتر پاپکو پاپکو» → «دفتر پاپکو» ، «۴۵ ۴۵ هزار» → «۴۵ هزار».
 * ابتدا عبارت‌های سه‌کلمه‌ای، سپس دو‌کلمه‌ای و در آخر تک‌کلمه‌ایِ تکراری حذف می‌شوند.
 */
export function collapseRepeatedWords(text: string): string {
  let words = text.split(/\s+/).filter(Boolean);
  const collapseN = (arr: string[], n: number): string[] => {
    const out: string[] = [];
    let i = 0;
    while (i < arr.length) {
      if (i + 2 * n <= arr.length) {
        const a = arr.slice(i, i + n).join(" ");
        const b = arr.slice(i + n, i + 2 * n).join(" ");
        if (a === b && a.length > 0) {
          out.push(...arr.slice(i, i + n));
          i += 2 * n;
          continue;
        }
      }
      out.push(arr[i]);
      i += 1;
    }
    return out;
  };
  // عبارت‌های تکراری تا ۶ کلمه را هم پوشش می‌دهیم (برای جمله‌های بلندتر).
  // دو بار اجرا می‌کنیم تا تکرارهای زنجیره‌ای هم پاک شوند.
  for (let pass = 0; pass < 2; pass++) {
    for (const n of [6, 5, 4, 3, 2, 1]) words = collapseN(words, n);
  }
  return words.join(" ");
}

/**
 * Standardizes raw spoken Persian speech input
 */
export function normalizeSpokenPersian(input: string): string {
  let text = normalizePersianText(input);
  // تبدیل ارقام فارسی/عربی به انگلیسی تا الگوهای \d به‌درستی کار کنند.
  text = toEnglishDigits(text);

  // Remove common speech artifacts
  text = text
    .replace(/لطفا|بی‌زحمت|برام|ممنون|مرسی|اگر میشه|رو برام/g, '')
    .replace(/تومان|تومن|تومانی/g, 'تومان')
    .replace(/\s+/g, ' ')
    .trim();

  // حذف تکرارهای پیاپیِ ناشی از تشخیص گفتار
  text = collapseRepeatedWords(text);

  return text;
}

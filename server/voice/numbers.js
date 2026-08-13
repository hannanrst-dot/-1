'use strict';
/**
 * تبدیل عبارت‌های عددی فارسی (حرفی و رقمی) به عدد.
 * پشتیبانی از حالت‌های مختلف بیان قیمت و تعداد:
 *   «۵۰ هزار» ، «پنجاه هزار» ، «۵۰ تومن» ، «پنجاه تومان» ، «۵۰۰۰۰» ،
 *   «چهل و پنج هزار» ، «دو میلیون و پانصد هزار» ، «سه‌ونیم» و ...
 */
const { digitsToEnglish } = require('./normalizer');

const UNITS = {
  صفر: 0, یک: 1, یه: 1, دو: 2, سه: 3, چهار: 4, پنج: 5, شش: 6, شیش: 6,
  هفت: 7, هشت: 8, نه: 9,
};
const TEENS = {
  ده: 10, یازده: 11, دوازده: 12, سیزده: 13, چهارده: 14, پانزده: 15, پونزده: 15,
  شانزده: 16, شونزده: 16, هفده: 17, هجده: 18, هیجده: 18, نوزده: 19,
};
const TENS = {
  بیست: 20, سی: 30, چهل: 40, پنجاه: 50, شصت: 60, هفتاد: 70, هشتاد: 80, نود: 90,
};
const HUNDREDS = {
  صد: 100, یکصد: 100, دویست: 200, سیصد: 300, چهارصد: 400, پانصد: 500, پونصد: 500,
  ششصد: 600, شیشصد: 600, هفتصد: 700, هشتصد: 800, نهصد: 900,
};
const SCALES = {
  هزار: 1000, میلیون: 1000000, ملیون: 1000000, میلیارد: 1000000000,
};

const WORD_MAP = { ...UNITS, ...TEENS, ...TENS, ...HUNDREDS };

/**
 * تلاش برای تبدیل یک عبارت (که ممکن است ترکیبی از رقم و حرف باشد) به عدد.
 * اگر عبارت عددی معتبری یافت نشود null برمی‌گرداند.
 */
function wordsToNumber(text) {
  if (text == null) return null;
  let s = digitsToEnglish(String(text)).toLowerCase();
  s = s.replace(/[٬,،]/g, ''); // جداکننده هزارگان
  s = s.replace(/نیم/g, ' نیم ');

  const tokens = s.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  let total = 0;      // مجموع نهایی
  let current = 0;    // گروه جاری
  let matchedAny = false;
  let sawHalf = false;

  for (let tok of tokens) {
    if (tok === 'و') continue;
    if (tok === 'نیم') { sawHalf = true; matchedAny = true; continue; }

    if (/^\d+(?:\.\d+)?$/.test(tok)) {
      current += parseFloat(tok);
      matchedAny = true;
      continue;
    }

    if (WORD_MAP[tok] != null) {
      current += WORD_MAP[tok];
      matchedAny = true;
      continue;
    }

    if (SCALES[tok] != null) {
      const scale = SCALES[tok];
      if (current === 0) current = 1; // «هزار» تنها = ۱۰۰۰
      current *= scale;
      total += current;
      current = 0;
      matchedAny = true;
      continue;
    }
    // توکن ناشناخته → نادیده گرفته می‌شود (ممکن است بخشی از نام کالا باشد)
  }

  if (!matchedAny) return null;
  let result = total + current;
  if (sawHalf) result += 0.5;
  return result;
}

/**
 * استخراج نخستین مقدار عددی معنادار از یک عبارت آزاد.
 * برمی‌گرداند: { value, raw } یا null
 */
function extractNumber(text) {
  const value = wordsToNumber(text);
  if (value == null || Number.isNaN(value)) return null;
  return { value, raw: String(text).trim() };
}

/**
 * تفسیر مبلغ با در نظر گرفتن واحد پول.
 * پیش‌فرض: اعداد بدون واحد و اعداد همراه «تومان/تومن» به تومان تلقی و به ریال تبدیل می‌شوند.
 * خروجی همیشه بر حسب «ریال» است.
 */
function parseMoneyToRial(text) {
  const n = wordsToNumber(text);
  if (n == null) return null;
  const s = digitsToEnglish(String(text));
  const isRial = /ریال/.test(s);
  return isRial ? Math.round(n) : Math.round(n * 10); // تومان → ریال
}

module.exports = { wordsToNumber, extractNumber, parseMoneyToRial, WORD_MAP, SCALES };

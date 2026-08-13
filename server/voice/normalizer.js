'use strict';
/**
 * نرمال‌سازی متن فارسی.
 * این ماژول مستقل است و هم در سمت سرور و هم (به‌صورت کپی مرورگری) قابل استفاده است.
 * وظیفه: یکدست‌سازی حروف، اعداد و فاصله‌ها تا تطبیق متن گفتاری با داده‌های دیتابیس دقیق شود.
 */

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** تبدیل ارقام فارسی/عربی به انگلیسی */
function digitsToEnglish(str) {
  if (str == null) return '';
  return String(str).replace(/[۰-۹٠-٩]/g, (ch) => {
    const fa = FA_DIGITS.indexOf(ch);
    if (fa > -1) return String(fa);
    const ar = AR_DIGITS.indexOf(ch);
    if (ar > -1) return String(ar);
    return ch;
  });
}

/** تبدیل ارقام انگلیسی به فارسی (برای نمایش) */
function digitsToPersian(str) {
  if (str == null) return '';
  return String(str).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/**
 * نرمال‌سازی کامل متن برای مقایسه و جستجو:
 *  - ی/ك عربی → فارسی
 *  - حذف اعراب و کاراکترهای کنترلی
 *  - یکدست کردن فاصله‌ها و نیم‌فاصله
 *  - ارقام فارسی → انگلیسی
 */
function normalize(input) {
  if (input == null) return '';
  let s = String(input);
  s = s
    .replace(/ي/g, 'ی') // ي عربی
    .replace(/ى/g, 'ی') // ى
    .replace(/ك/g, 'ک') // ك عربی
    .replace(/ة/g, 'ه') // ة
    .replace(/[ً-ْٰ]/g, '') // اعراب
    .replace(/‌/g, ' ') // نیم‌فاصله → فاصله برای مقایسه
    .replace(/[إأآا]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ی');
  s = digitsToEnglish(s);
  s = s.replace(/[^\S\r\n]+/g, ' ').trim().toLowerCase();
  return s;
}

/** حذف کلمات پرتکرار بی‌اثر برای بهبود تطبیق نام کالا */
const STOPWORDS = new Set([
  'یک', 'یه', 'تا', 'عدد', 'دونه', 'دانه', 'تومان', 'تومن', 'ریال', 'قیمت',
  'به', 'از', 'با', 'رو', 'را', 'و', 'هم', 'که', 'برای', 'می', 'خوام',
  'میخوام', 'دارم', 'بده', 'بزن', 'کن',
]);

function stripStopwords(normalizedText) {
  return normalizedText
    .split(' ')
    .filter((w) => w && !STOPWORDS.has(w))
    .join(' ');
}

module.exports = {
  digitsToEnglish,
  digitsToPersian,
  normalize,
  stripStopwords,
  STOPWORDS,
};

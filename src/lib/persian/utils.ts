import * as jalaali from 'jalaali-js';

// Convert English numbers to Persian digits
export function toPersianDigits(n: number | string | null | undefined): string {
  if (n === null || n === undefined) return '';
  const str = String(n);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
}

// Convert Persian and Arabic digits to English digits
export function toEnglishDigits(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

// Format currency in Tomans with Persian digits
export function formatToman(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '۰ تومان';
  const formatted = Math.round(amount).toLocaleString('fa-IR');
  return `${formatted} تومان`;
}

// Format numbers with thousands separators in Persian
export function formatPersianNumber(val: number | string): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '۰';
  return num.toLocaleString('fa-IR');
}

// Get Jalali date string
export function toJalaliDate(dateInput?: Date | string | null): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const j = jalaali.toJalaali(d);
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return `${toPersianDigits(j.jd)} ${monthNames[j.jm - 1]} ${toPersianDigits(j.jy)}`;
}

// Get Jalali date with time
export function toJalaliDateTime(dateInput?: Date | string | null): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const dateStr = toJalaliDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} - ${toPersianDigits(hours)}:${toPersianDigits(minutes)}`;
}

// Normalize Persian Text for searching & comparison
export function normalizePersianText(str: string): string {
  if (!str) return '';
  return str
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/‌/g, ' ') // zero-width non-joiner to space
    .replace(/[إأآا]/g, 'ا')
    .replace(/[َُِّْٰ]/g, '') // remove vowels
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Persian text similarity score (0 to 1) for fuzzy matching
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizePersianText(str1);
  const s2 = normalizePersianText(str2);

  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  const words1 = s1.split(' ').filter(Boolean); // عبارت گفته‌شده
  const words2 = s2.split(' ').filter(Boolean); // نام کالا در دیتابیس
  if (words1.length === 0 || words2.length === 0) return 0;

  let matchCount = 0;
  for (const w1 of words1) {
    if (words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
      matchCount++;
    }
  }

  // «پوشش» = چه مقدار از کلمات گفته‌شده در نام کالا هست (مهم‌تر است تا طول نام).
  const coverage = matchCount / words1.length;
  const union = new Set([...words1, ...words2]).size;
  const jaccard = matchCount / union;
  return coverage * 0.7 + jaccard * 0.3;
}

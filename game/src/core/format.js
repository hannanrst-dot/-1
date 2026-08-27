// قالب‌بندی اعداد و متن فارسی
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** تبدیل ارقام لاتین به فارسی (و نقطه اعشار به ممیز فارسی) */
export function fa(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value)
    .replace(/[0-9]/g, (d) => PERSIAN_DIGITS[+d])
    .replace(/\./g, '٫');
}

/** گرد کردن هوشمند: اعداد بزرگ بدون اعشار، اعداد کوچک با یک/دو رقم اعشار */
export function round(value, digits) {
  if (!Number.isFinite(value)) return 0;
  if (digits === undefined) {
    if (Math.abs(value) >= 100) digits = 0;
    else if (Math.abs(value) >= 10) digits = 1;
    else digits = 2;
  }
  const f = 10 ** digits;
  const r = Math.round(value * f) / f;
  return Object.is(r, -0) ? 0 : r;
}

/** عدد آمادهٔ نمایش: گرد شده + ارقام فارسی */
export function num(value, digits) {
  return fa(String(round(value, digits)));
}

/** محدود کردن یک مقدار بین کمینه و بیشینه */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** درون‌یابی خطی */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** نگاشت بازه به بازه */
export function mapRange(v, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/** نرم‌کنندهٔ حرکت برای انیمیشن */
export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** حذف کاراکترهای خطرناک پیش از درج در HTML */
export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

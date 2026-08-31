export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(input: string | number) {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function toEnDigits(input: string) {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export function formatPrice(value: number) {
  return toFaDigits(value.toLocaleString("en-US"));
}

export function finalPrice(price: number, discountPercent: number) {
  if (!discountPercent) return price;
  return Math.round((price * (100 - discountPercent)) / 100);
}

/** نگاشت حروف فارسی/عربی به لاتین برای ساخت نشانی‌های امن و خوانا */
const TRANSLIT: Record<string, string> = {
  "آ": "a", "ا": "a", "أ": "a", "إ": "a", "ٱ": "a",
  "ب": "b", "پ": "p", "ت": "t", "ث": "s", "ج": "j", "چ": "ch",
  "ح": "h", "خ": "kh", "د": "d", "ذ": "z", "ر": "r", "ز": "z",
  "ژ": "zh", "س": "s", "ش": "sh", "ص": "s", "ض": "z", "ط": "t",
  "ظ": "z", "ع": "a", "غ": "gh", "ف": "f", "ق": "gh", "ک": "k",
  "ك": "k", "گ": "g", "ل": "l", "م": "m", "ن": "n", "و": "v",
  "ؤ": "v", "ه": "h", "ة": "h", "ی": "y", "ي": "y", "ئ": "y",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

/**
 * نشانی امن (ASCII) می‌سازد؛ حروف فارسی به معادل لاتین تبدیل می‌شوند
 * تا آدرس محصول در مرورگر و اشتراک‌گذاری بدون مشکل کار کند.
 */
export function slugify(input: string) {
  const latin = Array.from(input.trim())
    .map((ch) => {
      if (TRANSLIT[ch] !== undefined) return TRANSLIT[ch];
      if (/[a-zA-Z0-9]/.test(ch)) return ch;
      if (/[\s_\-–—.،,/\\]/.test(ch)) return "-";
      return "";
    })
    .join("");

  return latin
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 70)
    .replace(/-$/, "");
}

export function uniqueSlug(base: string) {
  const s = slugify(base);
  return `${s || "product"}-${Math.random().toString(36).slice(2, 7)}`;
}

const FA_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

/** Gregorian -> Jalali conversion. */
export function toJalali(date: Date) {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  const gy2 = gy <= 1600 ? gy - 621 : gy - 1600;
  const gy3 = gm > 2 ? gy2 + 1 : gy2;
  let days =
    365 * gy2 +
    Math.floor((gy3 + 3) / 4) -
    Math.floor((gy3 + 99) / 100) +
    Math.floor((gy3 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const { jy, jm, jd } = toJalali(d);
  return toFaDigits(`${jd} ${FA_MONTHS[jm - 1]} ${jy}`);
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d)} - ${toFaDigits(`${hh}:${mm}`)}`;
}

export function parseJSON<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار پرداخت", color: "bg-amber-100 text-amber-700" },
  PAID: { label: "پرداخت شده", color: "bg-emerald-100 text-emerald-700" },
  PROCESSING: { label: "در حال پردازش", color: "bg-sky-100 text-sky-700" },
  SHIPPED: { label: "ارسال شده", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "تحویل شده", color: "bg-emerald-100 text-emerald-700" },
  CANCELED: { label: "لغو شده", color: "bg-rose-100 text-rose-700" },
};

export const PRODUCT_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار تأیید", color: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "تأیید شده", color: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "رد شده", color: "bg-rose-100 text-rose-700" },
};

export const PROVINCES = [
  "تهران", "البرز", "اصفهان", "فارس", "خراسان رضوی", "آذربایجان شرقی",
  "آذربایجان غربی", "خوزستان", "مازندران", "گیلان", "کرمان", "قم",
  "کرمانشاه", "یزد", "هرمزگان", "گلستان", "اردبیل", "زنجان", "سمنان",
  "قزوین", "لرستان", "همدان", "مرکزی", "بوشهر", "چهارمحال و بختیاری",
  "خراسان جنوبی", "خراسان شمالی", "سیستان و بلوچستان", "کردستان",
  "کهگیلویه و بویراحمد", "ایلام",
];

export const SHIPPING_METHODS = [
  { id: "POST", label: "پست پیشتاز", cost: 45000, days: "۳ تا ۵ روز کاری" },
  { id: "TIPAX", label: "تیپاکس", cost: 68000, days: "۲ تا ۴ روز کاری" },
  { id: "EXPRESS", label: "ارسال فوری (تهران)", cost: 89000, days: "کمتر از ۲۴ ساعت" },
];

export const FREE_SHIPPING_THRESHOLD = 5_000_000;

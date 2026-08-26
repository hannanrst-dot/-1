/**
 * دنیای مجازی بازی.
 *
 * تمام منطق و مختصات بازی در یک بوم ثابت ۱۲۸۰×۷۲۰ نوشته می‌شود و
 * هنگام رسم، با نسبت درست روی هر اندازه صفحه‌ای (موبایل، لپ‌تاپ،
 * ویدئوپروژکتور) جای می‌گیرد. این کار باعث می‌شود چیدمان اهداف
 * روی هیچ نمایشگری از کادر بیرون نزند.
 */
export const VW = 1280;
export const VH = 720;

/** خط زمین */
export const GROUND_Y = 628;
/** جای ایستادن کماندار */
export const ARCHER_X = 158;
export const ARCHER_Y = GROUND_Y - 34;

/** ناحیهٔ مجازِ حضور اهداف (تا زیر نوار بالای HUD و بالای زمین نرود) */
export const FIELD = {
  minX: 330,
  maxX: VW - 90,
  minY: 202,
  maxY: GROUND_Y - 96,
};

export interface ViewTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/** ضریب و جابه‌جایی لازم برای جا دادن دنیای مجازی در بوم واقعی (contain) */
export function computeTransform(cssW: number, cssH: number): ViewTransform {
  const scale = Math.min(cssW / VW, cssH / VH);
  return {
    scale,
    offsetX: (cssW - VW * scale) / 2,
    offsetY: (cssH - VH * scale) / 2,
  };
}

/** تبدیل مختصات اشاره‌گر (پیکسل CSS نسبت به بوم) به مختصات دنیای مجازی */
export function screenToWorld(x: number, y: number, t: ViewTransform) {
  return { x: (x - t.offsetX) / t.scale, y: (y - t.offsetY) / t.scale };
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rand = (min: number, max: number) => min + Math.random() * (max - min);
export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** ژنراتور شبه‌تصادفیِ قطعی — برای اینکه صحنه در هر فریم یکسان بماند */
export function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** تبدیل عدد به رقم فارسی */
const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
export function fa(n: number | string): string {
  return String(n).replace(/\d/g, (d) => FA_DIGITS[+d]);
}

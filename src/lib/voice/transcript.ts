import { collapseRepeatedWords } from "./persianNormalizer";

/**
 * انباشت پایدارِ متنِ گفتار برای مقابله با تکرارِ موتور تشخیص گفتار موبایل.
 *
 * مدل: هر «سشنِ» تشخیص (یک عبارت) در آرایهٔ utterances نگه داشته می‌شود.
 * هنگام افزودن یک عبارت جدید، حالت‌های تکراری/توسعه‌ای مدیریت می‌شوند:
 *  - اگر دقیقاً همان عبارت قبلی باشد → نادیده گرفته می‌شود.
 *  - اگر عبارت جدید «ادامهٔ» عبارت قبلی باشد (با آن شروع شود) → جایگزین می‌شود.
 *  - در غیر این صورت به انتها اضافه می‌شود.
 * در پایان، تکرارهای پیاپیِ باقیمانده هم با collapseRepeatedWords حذف می‌شوند.
 */
export function pushUtterance(utterances: string[], text: string): string[] {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return utterances;
  if (utterances.length === 0) return [t];
  const last = utterances[utterances.length - 1];
  if (last === t) return utterances; // بازپخشِ عینی
  if (t.startsWith(last + " ") || t === last) {
    const copy = utterances.slice();
    copy[copy.length - 1] = t; // توسعهٔ همان عبارت
    return copy;
  }
  if (last.startsWith(t + " ")) return utterances; // نسخهٔ کوتاه‌ترِ همان چیز
  return [...utterances, t];
}

/** ساختِ متنِ نهاییِ نمایش‌داده‌شده از عبارت‌ها + متنِ زندهٔ سشن جاری. */
export function joinTranscript(utterances: string[], live = ""): string {
  const joined = (utterances.join(" ") + " " + (live || "")).replace(/\s+/g, " ").trim();
  return collapseRepeatedWords(joined);
}

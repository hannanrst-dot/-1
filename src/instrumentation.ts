/**
 * این فایل توسط Next.js یک‌بار هنگام راه‌اندازی سرور اجرا می‌شود.
 * از آن برای مقداردهی خودکار دیتابیس (ساخت کاربر مدیر و داده‌های نمونه)
 * استفاده می‌کنیم تا برنامه روی هاست بدون هیچ دستور دستی «آماده» بالا بیاید.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { seedDatabase } = await import("@/lib/db/seed");
      const result = await seedDatabase();
      console.log("[sabtyar][seed]", result.message);
    } catch (err) {
      console.error("[sabtyar][seed] خطا در مقداردهی اولیه:", err);
    }
  }
}

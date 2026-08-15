import { db } from "@/db";
import { users, settings } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

/**
 * مقداردهی اولیه: فقط کاربر مدیر و تنظیمات پایهٔ فروشگاه ساخته می‌شود.
 * هیچ کالا/مشتری/فاکتور نمونه‌ای ساخته نمی‌شود تا برنامه از ابتدا خالی باشد و
 * اطلاعات واقعی خودتان را وارد کنید.
 */
export async function seedDatabase() {
  const existing = await db.select().from(users).where(eq(users.username, "admin"));
  if (existing.length > 0) {
    return { success: true, message: "دیتابیس قبلاً مقداردهی شده است." };
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await db.insert(users).values({
    username: "admin",
    passwordHash: hashedPassword,
    fullName: "مدیر فروشگاه",
    role: "admin",
    status: "active",
  });

  // تنظیمات پیش‌فرض فروشگاه (قابل تغییر از بخش تنظیمات)
  await db.insert(settings).values({
    key: "store_info",
    value: {
      storeName: "نوشت‌افزار حنان",
      phone: "",
      address: "",
      currency: "تومان",
      taxRate: 0,
      receiptHeader: "",
      receiptFooter: "از خرید شما سپاسگزاریم",
    },
  });

  return { success: true, message: "کاربر مدیر ساخته شد (admin / admin123)." };
}

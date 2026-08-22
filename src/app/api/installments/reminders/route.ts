import { NextResponse } from "next/server";
import { db } from "@/db";
import { installmentPlans, installments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendSms } from "@/lib/sms";
import { formatToman, toJalaliDate } from "@/lib/persian/utils";

/**
 * یادآوری اقساط سررسیدشده/نزدیک.
 * قابل فراخوانی به‌صورت دستی (از داخل برنامه) یا با Cron لیارا:
 *   curl -X POST https://APP.liara.run/api/installments/reminders
 * پارامتر اختیاری windowDays (پیش‌فرض ۳): اقساطی که تا این تعداد روز آینده سررسید می‌شوند.
 * اگر REMINDER_SECRET تنظیم شده باشد، باید به‌صورت ?token=... ارسال شود.
 */
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = process.env.REMINDER_SECRET;
    if (secret && searchParams.get("token") !== secret) {
      return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });
    }
    const windowDays = Number(searchParams.get("windowDays") || "3");
    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + windowDays);
    const horizonIso = horizon.toISOString();

    const activePlans = await db.select().from(installmentPlans).where(eq(installmentPlans.status, "active"));
    const notified: { plan: string; phone: string | null; amount: number; due: string; sent: boolean; simulated?: boolean }[] = [];

    for (const plan of activePlans) {
      const due = await db.select().from(installments)
        .where(and(eq(installments.planId, plan.id), eq(installments.paid, false)));
      for (const inst of due) {
        if (inst.dueDate <= horizonIso) {
          const msg = `فروشگاه: ${plan.customerName} عزیز، قسط ${toJalaliDate(inst.dueDate)} به مبلغ ${formatToman(inst.amount)} سررسید شده است. لطفاً پرداخت فرمایید.`;
          const r = await sendSms(plan.phone || "", msg);
          await db.update(installments).set({ remindedAt: new Date().toISOString() }).where(eq(installments.id, inst.id));
          notified.push({ plan: plan.customerName, phone: plan.phone, amount: inst.amount, due: inst.dueDate, sent: r.sent, simulated: r.simulated });
        }
      }
    }

    return NextResponse.json({ success: true, count: notified.length, notified });
  } catch (e) {
    console.error("reminders error:", e);
    return NextResponse.json({ error: "خطا در ارسال یادآوری‌ها" }, { status: 500 });
  }
}

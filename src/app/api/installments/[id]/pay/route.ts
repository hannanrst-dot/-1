import { NextResponse } from "next/server";
import { db } from "@/db";
import { installmentPlans, installments } from "@/db/schema";
import { eq } from "drizzle-orm";

// ثبت پرداخت یک قسط: بدنه { installmentId }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const planId = Number(id);
    const { installmentId } = await req.json();

    await db.update(installments)
      .set({ paid: true, paidAt: new Date().toISOString() })
      .where(eq(installments.id, Number(installmentId)));

    // اگر همهٔ اقساط پرداخت شد، وضعیت طرح «تکمیل‌شده» می‌شود.
    const rows = await db.select().from(installments).where(eq(installments.planId, planId));
    const allPaid = rows.length > 0 && rows.every((r) => r.paid);
    if (allPaid) {
      await db.update(installmentPlans).set({ status: "completed" }).where(eq(installmentPlans.id, planId));
    }

    return NextResponse.json({ success: true, completed: allPaid });
  } catch (e) {
    console.error("installment pay error:", e);
    return NextResponse.json({ error: "خطا در ثبت پرداخت قسط" }, { status: 500 });
  }
}

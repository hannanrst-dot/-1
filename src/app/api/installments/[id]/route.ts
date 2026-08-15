import { NextResponse } from "next/server";
import { db } from "@/db";
import { installmentPlans, installments } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const planId = Number(id);
    const [plan] = await db.select().from(installmentPlans).where(eq(installmentPlans.id, planId));
    if (!plan) return NextResponse.json({ error: "طرح قسطی یافت نشد." }, { status: 404 });
    const rows = await db.select().from(installments).where(eq(installments.planId, planId)).orderBy(asc(installments.seq));
    return NextResponse.json({ plan, installments: rows });
  } catch (e) {
    console.error("installment detail error:", e);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const planId = Number(id);
    await db.delete(installments).where(eq(installments.planId, planId));
    await db.delete(installmentPlans).where(eq(installmentPlans.id, planId));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("installment delete error:", e);
    return NextResponse.json({ error: "خطا در حذف" }, { status: 500 });
  }
}

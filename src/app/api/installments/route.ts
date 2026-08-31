import { NextResponse } from "next/server";
import { db } from "@/db";
import { installmentPlans, installments, customers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// فهرست طرح‌های قسطی به‌همراه وضعیت محاسبه‌شده
export async function GET() {
  try {
    const plans = await db.select().from(installmentPlans).orderBy(desc(installmentPlans.id));
    const result = [];
    const nowIso = new Date().toISOString();
    for (const plan of plans) {
      const rows = await db.select().from(installments).where(eq(installments.planId, plan.id));
      const paidCount = rows.filter((r) => r.paid).length;
      const paidAmount = rows.filter((r) => r.paid).reduce((s, r) => s + r.amount, 0) + plan.downPayment;
      const remaining = Math.max(0, plan.totalAmount - paidAmount);
      const unpaid = rows.filter((r) => !r.paid).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      const nextDue = unpaid[0]?.dueDate || null;
      const overdue = unpaid.some((r) => r.dueDate < nowIso);
      result.push({
        ...plan,
        installmentsTotal: rows.length,
        paidCount,
        paidAmount,
        remaining,
        nextDue,
        overdue,
        computedStatus: remaining <= 0 ? "completed" : overdue ? "overdue" : "active",
      });
    }
    return NextResponse.json({ plans: result });
  } catch (e) {
    console.error("installments list error:", e);
    return NextResponse.json({ error: "خطا در دریافت لیست اقساط" }, { status: 500 });
  }
}

// ساخت طرح قسطی جدید و تولید جدول اقساط
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const customerName = (data.customerName || "").trim();
    if (!customerName) return NextResponse.json({ error: "نام مشتری الزامی است." }, { status: 400 });

    const totalAmount = Math.round(Number(data.totalAmount) || 0);
    const downPayment = Math.round(Number(data.downPayment) || 0);
    const count = Math.max(1, Math.min(24, Number(data.installmentsCount) || 3));
    const intervalDays = Math.max(1, Number(data.intervalDays) || 30);
    const financed = Math.max(0, totalAmount - downPayment);
    if (financed <= 0) return NextResponse.json({ error: "مبلغ قابل تقسیط باید بیشتر از صفر باشد." }, { status: 400 });

    // اتصال به مشتری موجود یا ساخت مشتری جدید
    let customerId: number | null = data.customerId ? Number(data.customerId) : null;
    if (!customerId) {
      const existing = await db.select().from(customers).where(eq(customers.name, customerName));
      if (existing.length > 0) customerId = existing[0].id;
      else {
        const [c] = await db.insert(customers).values({ name: customerName, phone: data.phone || null, address: data.address || null }).returning();
        customerId = c.id;
      }
    }

    const [plan] = await db.insert(installmentPlans).values({
      invoiceId: data.invoiceId ? Number(data.invoiceId) : null,
      invoiceNumber: data.invoiceNumber || null,
      customerId,
      customerName,
      phone: data.phone || null,
      address: data.address || null,
      nationalId: data.nationalId || null,
      totalAmount,
      downPayment,
      installmentsCount: count,
      intervalDays,
      status: "active",
      notes: data.notes || null,
    }).returning();

    // تقسیم مبلغ به اقساط مساوی (قسط آخر باقی‌مانده را جبران می‌کند)
    const base = Math.floor(financed / count);
    const rows = [];
    const now = new Date();
    for (let i = 1; i <= count; i++) {
      const amount = i === count ? financed - base * (count - 1) : base;
      const due = new Date(now);
      due.setDate(due.getDate() + intervalDays * i);
      rows.push({ planId: plan.id, seq: i, dueDate: due.toISOString(), amount, paid: false });
    }
    await db.insert(installments).values(rows);

    return NextResponse.json({ success: true, plan });
  } catch (e) {
    console.error("installment create error:", e);
    return NextResponse.json({ error: "خطا در ثبت خرید قسطی" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const custId = parseInt(id, 10);
    const [customer] = await db.select().from(customers).where(eq(customers.id, custId));
    if (!customer) {
      return NextResponse.json({ error: "مشتری یافت نشد." }, { status: 404 });
    }

    const customerInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.customerId, custId))
      .orderBy(desc(invoices.id));

    return NextResponse.json({ customer, invoices: customerInvoices });
  } catch (error) {
    return NextResponse.json({ error: "خطا در دریافت اطلاعات مشتری" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const custId = parseInt(id, 10);
    const data = await req.json();

    const [updated] = await db
      .update(customers)
      .set({
        name: data.name,
        phone: data.phone,
        address: data.address,
        debt: data.debt !== undefined ? Number(data.debt) : undefined,
        notes: data.notes,
      })
      .where(eq(customers.id, custId))
      .returning();

    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    return NextResponse.json({ error: "خطا در بروزرسانی مشتری" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const custId = parseInt(id, 10);
    await db.delete(customers).where(eq(customers.id, custId));
    return NextResponse.json({ success: true, message: "مشتری با موفقیت حذف شد." });
  } catch (error) {
    return NextResponse.json({ error: "حذف مشتری به علت داشتن سوابق امکان‌پذیر نیست." }, { status: 400 });
  }
}

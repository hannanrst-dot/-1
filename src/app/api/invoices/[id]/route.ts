import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invId = parseInt(id, 10);
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invId));
    if (!invoice) {
      return NextResponse.json({ error: "فاکتور یافت نشد." }, { status: 404 });
    }

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invId));
    return NextResponse.json({ invoice, items });
  } catch (error) {
    return NextResponse.json({ error: "خطا در دریافت فاکتور" }, { status: 500 });
  }
}

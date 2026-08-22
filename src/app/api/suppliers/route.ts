import { NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { desc, like, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    let query = db.select().from(suppliers).$dynamic();
    if (search) {
      const term = `%${search}%`;
      query = query.where(or(like(suppliers.name, term), like(suppliers.company, term), like(suppliers.phone, term)));
    }

    const list = await query.orderBy(desc(suppliers.id));
    return NextResponse.json({ suppliers: list });
  } catch (error) {
    return NextResponse.json({ error: "خطا در دریافت تامین‌کنندگان" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, phone, company, address, debt, notes } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "نام تامین‌کننده الزامی است." }, { status: 400 });
    }
    const [sup] = await db
      .insert(suppliers)
      .values({
        name: name.trim(),
        phone: phone || null,
        company: company || null,
        address: address || null,
        debt: Number(debt ?? 0),
        notes: notes || null,
      })
      .returning();
    return NextResponse.json({ success: true, supplier: sup });
  } catch (error) {
    return NextResponse.json({ error: "خطا در ثبت تامین‌کننده" }, { status: 500 });
  }
}

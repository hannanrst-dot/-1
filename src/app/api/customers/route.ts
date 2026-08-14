import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { desc, like, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    let query = db.select().from(customers).$dynamic();
    if (search) {
      const term = `%${search}%`;
      query = query.where(or(like(customers.name, term), like(customers.phone, term)));
    }

    const list = await query.orderBy(desc(customers.id));
    return NextResponse.json({ customers: list });
  } catch (error) {
    return NextResponse.json({ error: "خطا در دریافت مشتریان" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, phone, address, debt, notes } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "نام مشتری الزامی است." }, { status: 400 });
    }
    const [cust] = await db
      .insert(customers)
      .values({
        name: name.trim(),
        phone: phone || null,
        address: address || null,
        debt: Number(debt ?? 0),
        notes: notes || null,
      })
      .returning();
    return NextResponse.json({ success: true, customer: cust });
  } catch (error) {
    return NextResponse.json({ error: "خطا در ثبت مشتری" }, { status: 500 });
  }
}

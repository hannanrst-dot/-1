import { NextResponse } from "next/server";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(brands).orderBy(desc(brands.id));
    return NextResponse.json({ brands: list });
  } catch (error) {
    return NextResponse.json({ error: "خطا در دریافت برندها" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "نام برند الزامی است." }, { status: 400 });
    }
    const [brand] = await db.insert(brands).values({ name: name.trim() }).returning();
    return NextResponse.json({ success: true, brand });
  } catch (error) {
    return NextResponse.json({ error: "خطا در ساخت برند" }, { status: 500 });
  }
}

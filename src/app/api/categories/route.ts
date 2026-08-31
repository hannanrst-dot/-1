import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(categories).orderBy(desc(categories.id));
    return NextResponse.json({ categories: list });
  } catch (error) {
    return NextResponse.json({ error: "خطا در دریافت دسته‌بندی‌ها" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, code, description, icon } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "نام دسته‌بندی الزامی است." }, { status: 400 });
    }
    const [cat] = await db.insert(categories).values({ name: name.trim(), code, description, icon }).returning();
    return NextResponse.json({ success: true, category: cat });
  } catch (error) {
    return NextResponse.json({ error: "خطا در ساخت دسته‌بندی" }, { status: 500 });
  }
}

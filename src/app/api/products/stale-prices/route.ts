import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

const DAY = 24 * 60 * 60 * 1000;

/**
 * فهرستِ کالاهایی که «قیمتشان قدیمی» است:
 * - اگر بعد از افزودن/تغییرِ قیمت بیش از ۳۰ روز گذشته باشد،
 * - یا اگر یک‌بار «ادامه با همین قیمت» زده شده، بیش از ۱۴ روز از آن تأیید گذشته باشد.
 */
export async function GET() {
  try {
    const all = await db.select().from(products).where(eq(products.isActive, true));
    const now = Date.now();
    const list = [];
    for (const p of all as any[]) {
      const reviewed = p.priceReviewedAt ? Date.parse(p.priceReviewedAt) : 0;
      const changed = p.priceUpdatedAt ? Date.parse(p.priceUpdatedAt) : Date.parse(p.createdAt);
      const refDate = Math.max(reviewed || 0, changed || 0);
      const thresholdDays = reviewed ? 14 : 30;
      const ageDays = Math.floor((now - refDate) / DAY);
      if (ageDays >= thresholdDays) {
        list.push({
          id: p.id, name: p.name, sellPrice: p.sellPrice, buyPrice: p.buyPrice, stock: p.stock, unit: p.unit,
          ageDays, since: new Date(refDate).toISOString(), reviewedOnce: !!reviewed,
        });
      }
    }
    list.sort((a, b) => b.ageDays - a.ageDays);
    return NextResponse.json({ products: list, count: list.length });
  } catch (error) {
    console.error("stale-prices error:", error);
    return NextResponse.json({ error: "خطا در دریافت کالاهای قیمت‌قدیمی" }, { status: 500 });
  }
}

/** ثبتِ «ادامه با همین قیمت» (یادآوریِ بعدی ۲ هفتهٔ دیگر). بدنه: { productId } */
export async function POST(req: Request) {
  try {
    const { productId } = await req.json();
    await db.update(products).set({ priceReviewedAt: new Date().toISOString() }).where(eq(products.id, Number(productId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطا در ثبت تأیید" }, { status: 500 });
  }
}

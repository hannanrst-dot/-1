import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { normalizePersianText } from "@/lib/persian/utils";

/**
 * تغییر گروهیِ قیمت فروش بر حسب درصد.
 * بدنه: { percent, direction: 'increase'|'decrease', filterName?: string|null, applyToBuy?: boolean }
 * اگر filterName داده نشود، روی همهٔ کالاها اعمال می‌شود.
 */
export async function POST(req: Request) {
  try {
    const { percent, amount, changeMode, direction, filterName, applyToBuy, productIds } = await req.json();
    const p = Number(percent) || 0;
    const amt = Number(amount) || 0;
    const mode: "percent" | "amount" = changeMode === "amount" ? "amount" : "percent";
    if (mode === "percent" && p <= 0) {
      return NextResponse.json({ error: "درصد نامعتبر است." }, { status: 400 });
    }
    if (mode === "amount" && amt <= 0) {
      return NextResponse.json({ error: "مبلغ نامعتبر است." }, { status: 400 });
    }
    const factor = direction === "decrease" ? 1 - p / 100 : 1 + p / 100;
    const delta = direction === "decrease" ? -amt : amt;
    const calc = (old: number) => mode === "amount"
      ? Math.max(0, Math.round(old + delta))
      : Math.max(0, Math.round(old * factor));

    const all = await db.select().from(products);
    // اگر فهرستِ شناسه‌ها داده شود (کاربر از لیستِ پیش‌نمایش بعضی را حذف کرده)، فقط روی همان‌ها.
    const ids: number[] | null = Array.isArray(productIds) && productIds.length ? productIds.map((x: any) => Number(x)) : null;
    const nf = filterName ? normalizePersianText(String(filterName)) : null;
    const targets = ids
      ? all.filter((x) => ids.includes(x.id))
      : nf ? all.filter((x) => normalizePersianText(x.name).includes(nf)) : all;

    for (const prod of targets) {
      const patch: Record<string, unknown> = {
        sellPrice: calc(prod.sellPrice),
        updatedAt: new Date().toISOString(),
      };
      if (applyToBuy) patch.buyPrice = calc(prod.buyPrice);
      await db.update(products).set(patch).where(eq(products.id, prod.id));
    }

    return NextResponse.json({ success: true, count: targets.length });
  } catch (error) {
    console.error("bulk-price error:", error);
    return NextResponse.json({ error: "خطا در تغییر قیمت‌ها" }, { status: 500 });
  }
}

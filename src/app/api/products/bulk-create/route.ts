import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, inventoryTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { calculateSimilarity, normalizePersianText } from "@/lib/persian/utils";

/**
 * ثبتِ گروهیِ کالاها (از اکسل).
 * بدنه: { items: [{ name, buyPrice, sellPrice, stock?, barcode?, unit?, force? }] }
 * کالاهایی که مشابهِ کالای موجود (نامِ نزدیک یا بارکدِ یکسان) باشند به‌صورت پیش‌فرض «رد»
 * می‌شوند و در پاسخ برگردانده می‌شوند، مگر آنکه force=true باشد.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const data = await req.json();
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "کالایی برای ثبت ارسال نشده است." }, { status: 400 });
    }

    const existing = await db
      .select({ name: products.name, barcode: products.barcode })
      .from(products)
      .where(eq(products.isActive, true));
    const existNorm = existing.map((p) => ({ name: p.name, n: normalizePersianText(p.name), bc: (p.barcode || "").trim() }));
    const batchNames: { name: string; n: string }[] = []; // برای تشخیصِ تکراری در همین فایل

    let created = 0;
    const skipped: { name: string; matchedName: string }[] = [];

    for (const raw of data.items) {
      const name = String(raw.name || "").trim();
      if (name.length < 1) continue;
      const force = raw.force === true;
      const nn = normalizePersianText(name);
      const bc = raw.barcode ? String(raw.barcode).trim() : "";

      if (!force) {
        // بارکدِ یکسان یا نامِ خیلی نزدیک، چه در دیتابیس چه در همین فایل
        let match = bc ? existNorm.find((p) => p.bc && p.bc === bc) : undefined;
        if (!match) match = existNorm.find((p) => calculateSimilarity(nn, p.n) >= 0.8);
        const batchMatch = !match ? batchNames.find((b) => calculateSimilarity(nn, b.n) >= 0.8) : undefined;
        if (match || batchMatch) {
          skipped.push({ name, matchedName: (match?.name || batchMatch?.name) as string });
          continue;
        }
      }

      const stock = Number(raw.stock ?? 0) || 0;
      const [newProduct] = await db
        .insert(products)
        .values({
          name,
          sku: raw.sku ? String(raw.sku).trim() : `SKU-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`,
          barcode: bc || null,
          unit: raw.unit || "عدد",
          stock,
          minStock: Number(raw.minStock ?? 5) || 0,
          buyPrice: Number(raw.buyPrice ?? 0) || 0,
          sellPrice: Number(raw.sellPrice ?? 0) || 0,
          isActive: true,
          priceUpdatedAt: new Date().toISOString(),
        })
        .returning();
      created++;
      batchNames.push({ name, n: nn });
      if (stock > 0) {
        await db.insert(inventoryTransactions).values({
          productId: newProduct.id, type: "adjustment", quantity: stock, previousStock: 0, newStock: stock,
          referenceId: "IMPORT", notes: "ورود گروهی از اکسل", createdById: session?.id,
        });
      }
    }

    return NextResponse.json({ success: true, count: created, skipped });
  } catch (error) {
    console.error("Bulk create products error:", error);
    return NextResponse.json({ error: "خطا در ثبت گروهی کالاها" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, inventoryTransactions } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

/**
 * ثبتِ گروهیِ کالاها (از اکسل یا اسکنِ عکس).
 * بدنه: { items: [{ name, buyPrice, sellPrice, stock?, barcode?, unit? }] }
 * کالاهای بدونِ نام نادیده گرفته می‌شوند.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const data = await req.json();
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "کالایی برای ثبت ارسال نشده است." }, { status: 400 });
    }

    let created = 0;
    for (const raw of data.items) {
      const name = String(raw.name || "").trim();
      if (name.length < 1) continue;
      const stock = Number(raw.stock ?? 0) || 0;
      const [newProduct] = await db
        .insert(products)
        .values({
          name,
          sku: raw.sku ? String(raw.sku).trim() : `SKU-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`,
          barcode: raw.barcode ? String(raw.barcode).trim() : null,
          unit: raw.unit || "عدد",
          stock,
          minStock: Number(raw.minStock ?? 5) || 0,
          buyPrice: Number(raw.buyPrice ?? 0) || 0,
          sellPrice: Number(raw.sellPrice ?? 0) || 0,
          isActive: true,
        })
        .returning();
      created++;
      if (stock > 0) {
        await db.insert(inventoryTransactions).values({
          productId: newProduct.id, type: "adjustment", quantity: stock, previousStock: 0, newStock: stock,
          referenceId: "IMPORT", notes: "ورود گروهی (اکسل/اسکن)", createdById: session?.id,
        });
      }
    }

    return NextResponse.json({ success: true, count: created });
  } catch (error) {
    console.error("Bulk create products error:", error);
    return NextResponse.json({ error: "خطا در ثبت گروهی کالاها" }, { status: 500 });
  }
}

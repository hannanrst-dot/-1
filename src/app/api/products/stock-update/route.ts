import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, inventoryTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { normalizePersianText } from "@/lib/persian/utils";
import { getSession } from "@/lib/auth/session";

/**
 * تغییر گروهیِ موجودی کالاها با صدا.
 * بدنه: { mode: 'set'|'increase'|'decrease', amount: number, filterName?: string|null }
 * اگر filterName داده نشود، روی همهٔ کالاها اعمال می‌شود.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { mode, amount, filterName } = await req.json();
    const amt = Number(amount) || 0;
    const m: "set" | "increase" | "decrease" = mode === "increase" || mode === "decrease" ? mode : "set";

    const all = await db.select().from(products).where(eq(products.isActive, true));
    const nf = filterName ? normalizePersianText(String(filterName)) : null;
    const targets = nf ? all.filter((x) => normalizePersianText(x.name).includes(nf)) : all;

    for (const prod of targets) {
      const newStock = m === "increase" ? prod.stock + amt : m === "decrease" ? Math.max(0, prod.stock - amt) : amt;
      if (newStock === prod.stock) continue;
      await db.update(products).set({ stock: newStock, updatedAt: new Date().toISOString() }).where(eq(products.id, prod.id));
      await db.insert(inventoryTransactions).values({
        productId: prod.id,
        type: "adjustment",
        quantity: newStock - prod.stock,
        previousStock: prod.stock,
        newStock,
        notes: "تغییر موجودی با دستور صوتی",
        createdById: session?.id,
      });
    }

    return NextResponse.json({ success: true, count: targets.length });
  } catch (error) {
    console.error("stock-update error:", error);
    return NextResponse.json({ error: "خطا در تغییر موجودی" }, { status: 500 });
  }
}

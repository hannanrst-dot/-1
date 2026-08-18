import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceItems, products, inventoryTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

/**
 * افزودنِ یک یا چند کالا به یک فاکتورِ موجود (ویرایشِ فاکتور).
 * بدنه: { items: [{ productId, productName, unit?, quantity, unitPrice, discount? }] }
 * پس از افزودن، موجودی کم و جمع‌های فاکتور دوباره محاسبه می‌شوند.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const invId = parseInt(id, 10);
    const data = await req.json();

    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invId));
    if (!invoice) return NextResponse.json({ error: "فاکتور یافت نشد." }, { status: 404 });
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "کالایی برای افزودن ارسال نشده است." }, { status: 400 });
    }

    for (const item of data.items) {
      const qty = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || 0);
      const discount = Number(item.discount || 0);
      const totalPrice = qty * unitPrice - discount;

      await db.insert(invoiceItems).values({
        invoiceId: invId,
        productId: item.productId ? Number(item.productId) : null,
        productName: item.productName || "کالای بدون نام",
        unit: item.unit || "عدد",
        quantity: qty,
        buyPrice: Number(item.buyPrice || 0),
        unitPrice,
        discount,
        totalPrice,
      });

      if (item.productId) {
        const [prod] = await db.select().from(products).where(eq(products.id, Number(item.productId)));
        if (prod) {
          const newStock = Math.max(0, prod.stock - qty);
          await db.update(products).set({ stock: newStock, updatedAt: new Date().toISOString() }).where(eq(products.id, prod.id));
          await db.insert(inventoryTransactions).values({
            productId: prod.id, type: "sale", quantity: -qty, previousStock: prod.stock, newStock,
            referenceId: invoice.invoiceNumber, notes: `افزوده‌شده به فاکتور ${invoice.invoiceNumber}`, createdById: session?.id,
          });
        }
      }
    }

    // محاسبهٔ دوبارهٔ جمع‌های فاکتور از روی همهٔ اقلام
    const allItems = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invId));
    const totalAmount = allItems.reduce((s, it) => s + it.totalPrice, 0);
    const finalAmount = Math.max(0, totalAmount - invoice.discountAmount + invoice.taxAmount);
    const balance = finalAmount - invoice.paidAmount;
    await db.update(invoices).set({ totalAmount, finalAmount, balance }).where(eq(invoices.id, invId));

    const [updated] = await db.select().from(invoices).where(eq(invoices.id, invId));
    return NextResponse.json({ success: true, invoice: updated, items: allItems });
  } catch (error) {
    console.error("Add invoice items error:", error);
    return NextResponse.json({ error: "خطا در افزودن کالا به فاکتور" }, { status: 500 });
  }
}

/** بازمحاسبهٔ جمع‌های فاکتور از روی اقلامِ فعلی. */
async function recalc(invId: number) {
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invId));
  if (!invoice) return null;
  const allItems = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invId));
  const totalAmount = allItems.reduce((s, it) => s + it.totalPrice, 0);
  const finalAmount = Math.max(0, totalAmount - invoice.discountAmount + invoice.taxAmount);
  const balance = finalAmount - invoice.paidAmount;
  await db.update(invoices).set({ totalAmount, finalAmount, balance }).where(eq(invoices.id, invId));
  const [updated] = await db.select().from(invoices).where(eq(invoices.id, invId));
  return { invoice: updated, items: allItems };
}

/** حذفِ یک ردیف از فاکتور — موجودیِ کالا برگردانده و جمع‌ها بازمحاسبه می‌شود.
 *  شناسه از کوئریِ ?itemId= خوانده می‌شود. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const invId = parseInt(id, 10);
    const itemId = parseInt(new URL(req.url).searchParams.get("itemId") || "0", 10);
    const [item] = await db.select().from(invoiceItems).where(eq(invoiceItems.id, itemId));
    if (!item || item.invoiceId !== invId) return NextResponse.json({ error: "ردیف پیدا نشد." }, { status: 404 });

    if (item.productId) {
      const [prod] = await db.select().from(products).where(eq(products.id, item.productId));
      if (prod) {
        const newStock = prod.stock + item.quantity; // بازگرداندنِ موجودی
        await db.update(products).set({ stock: newStock, updatedAt: new Date().toISOString() }).where(eq(products.id, prod.id));
        await db.insert(inventoryTransactions).values({ productId: prod.id, type: "adjustment", quantity: item.quantity, previousStock: prod.stock, newStock, notes: "حذفِ ردیف از فاکتور", createdById: session?.id });
      }
    }
    await db.delete(invoiceItems).where(eq(invoiceItems.id, itemId));
    const r = await recalc(invId);
    return NextResponse.json({ success: true, ...r });
  } catch (error) {
    console.error("Delete invoice item error:", error);
    return NextResponse.json({ error: "خطا در حذف ردیف فاکتور" }, { status: 500 });
  }
}

/** تغییرِ تعدادِ یک ردیف — اختلافِ موجودی اعمال و جمع‌ها بازمحاسبه می‌شود.
 *  بدنه: { itemId, quantity } */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    const invId = parseInt(id, 10);
    const { itemId, quantity } = await req.json();
    const newQty = Math.max(1, Number(quantity) || 1);
    const [item] = await db.select().from(invoiceItems).where(eq(invoiceItems.id, Number(itemId)));
    if (!item || item.invoiceId !== invId) return NextResponse.json({ error: "ردیف پیدا نشد." }, { status: 404 });

    const delta = newQty - item.quantity; // مثبت = فروشِ بیشتر
    if (item.productId && delta !== 0) {
      const [prod] = await db.select().from(products).where(eq(products.id, item.productId));
      if (prod) {
        const newStock = Math.max(0, prod.stock - delta);
        await db.update(products).set({ stock: newStock, updatedAt: new Date().toISOString() }).where(eq(products.id, prod.id));
        await db.insert(inventoryTransactions).values({ productId: prod.id, type: "adjustment", quantity: -delta, previousStock: prod.stock, newStock, notes: "تغییرِ تعداد در فاکتور", createdById: session?.id });
      }
    }
    await db.update(invoiceItems).set({ quantity: newQty, totalPrice: newQty * item.unitPrice - item.discount }).where(eq(invoiceItems.id, item.id));
    const r = await recalc(invId);
    return NextResponse.json({ success: true, ...r });
  } catch (error) {
    console.error("Patch invoice item error:", error);
    return NextResponse.json({ error: "خطا در ویرایش ردیف فاکتور" }, { status: 500 });
  }
}

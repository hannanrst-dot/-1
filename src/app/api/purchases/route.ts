import { NextResponse } from "next/server";
import { db } from "@/db";
import { purchases, purchaseItems, products, suppliers, inventoryTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const list = await db.select().from(purchases).orderBy(desc(purchases.id));
    return NextResponse.json({ purchases: list });
  } catch (error) {
    return NextResponse.json({ error: "خطا در دریافت لیست خریدها" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const data = await req.json();

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "خرید باید حداقل شامل یک کالا باشد." }, { status: 400 });
    }

    const purchaseNumber = `PUR-${Date.now().toString().slice(-6)}`;
    const supplierName = data.supplierName?.trim() || "تامین‌کننده عمومی";
    const supplierId = data.supplierId ? Number(data.supplierId) : null;

    let totalAmount = 0;
    const preparedItems = [];

    for (const item of data.items) {
      const qty = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || 0);
      const itemTotal = qty * unitPrice;
      totalAmount += itemTotal;

      preparedItems.push({
        productId: item.productId ? Number(item.productId) : null,
        productName: item.productName || "کالای بدون نام",
        unit: item.unit || "عدد",
        quantity: qty,
        unitPrice,
        totalPrice: itemTotal,
      });
    }

    const paidAmount = data.paidAmount !== undefined ? Number(data.paidAmount) : totalAmount;
    const balance = totalAmount - paidAmount;

    // Insert Purchase
    const [newPurchase] = await db
      .insert(purchases)
      .values({
        purchaseNumber,
        supplierId,
        supplierName,
        totalAmount,
        paidAmount,
        balance,
        status: "completed",
        notes: data.notes || null,
        createdById: session?.id,
      })
      .returning();

    // Insert Purchase Items & Increment Stock
    for (const item of preparedItems) {
      await db.insert(purchaseItems).values({
        purchaseId: newPurchase.id,
        productId: item.productId,
        productName: item.productName,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });

      if (item.productId) {
        const [prod] = await db.select().from(products).where(eq(products.id, item.productId));
        if (prod) {
          const newStock = prod.stock + item.quantity;
          await db
            .update(products)
            .set({
              stock: newStock,
              buyPrice: item.unitPrice > 0 ? item.unitPrice : prod.buyPrice,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(products.id, item.productId));

          await db.insert(inventoryTransactions).values({
            productId: prod.id,
            type: "purchase",
            quantity: item.quantity,
            previousStock: prod.stock,
            newStock: newStock,
            referenceId: purchaseNumber,
            notes: `خرید ثبت شده فاکتور خرید ${purchaseNumber}`,
            createdById: session?.id,
          });
        }
      }
    }

    // Update supplier debt & total purchases if supplier selected
    if (supplierId) {
      const [sup] = await db.select().from(suppliers).where(eq(suppliers.id, supplierId));
      if (sup) {
        await db
          .update(suppliers)
          .set({
            totalPurchases: sup.totalPurchases + totalAmount,
            debt: Math.max(0, sup.debt + balance),
          })
          .where(eq(suppliers.id, supplierId));
      }
    }

    return NextResponse.json({ success: true, purchase: newPurchase });
  } catch (error) {
    console.error("Create purchase error:", error);
    return NextResponse.json({ error: "خطا در ثبت فاکتور خرید" }, { status: 500 });
  }
}

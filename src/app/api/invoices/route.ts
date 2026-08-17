import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceItems, products, customers, inventoryTransactions } from "@/db/schema";
import { eq, desc, like, or, and, gte, lte } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    let query = db.select().from(invoices).$dynamic();
    const conditions = [];

    if (search) {
      const term = `%${search}%`;
      conditions.push(or(like(invoices.invoiceNumber, term), like(invoices.customerName, term)));
    }

    if (customerId) {
      conditions.push(eq(invoices.customerId, parseInt(customerId, 10)));
    }

    if (status) {
      conditions.push(eq(invoices.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const list = await query.orderBy(desc(invoices.id));
    return NextResponse.json({ invoices: list });
  } catch (error) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json({ error: "خطا در دریافت فاکتورها" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const data = await req.json();

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "فاکتور باید حداقل شامل یک کالا باشد." }, { status: 400 });
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const customerName = data.customerName?.trim() || "مشتری عمومی";
    const customerPhone = data.customerPhone ? String(data.customerPhone).trim() : null;
    const customerId = data.customerId ? Number(data.customerId) : null;
    const paymentMethod = data.paymentMethod || "cash";

    let totalAmount = 0;
    const preparedItems: {
      productId: number | null;
      productName: string;
      unit: string;
      quantity: number;
      buyPrice: number;
      unitPrice: number;
      discount: number;
      totalPrice: number;
    }[] = [];

    // Calculate totals & check product stock
    for (const item of data.items) {
      const qty = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || 0);
      const discount = Number(item.discount || 0);
      const buyPrice = Number(item.buyPrice || 0);
      const itemTotal = qty * unitPrice - discount;
      totalAmount += itemTotal;

      preparedItems.push({
        productId: item.productId ? Number(item.productId) : null,
        productName: item.productName || "کالای بدون نام",
        unit: item.unit || "عدد",
        quantity: qty,
        buyPrice,
        unitPrice,
        discount,
        totalPrice: itemTotal,
      });
    }

    const discountAmount = Number(data.discountAmount || 0);
    const taxAmount = Number(data.taxAmount || 0);
    const finalAmount = Math.max(0, totalAmount - discountAmount + taxAmount);
    const paidAmount = data.paidAmount !== undefined ? Number(data.paidAmount) : finalAmount;
    const balance = finalAmount - paidAmount;

    // Insert Invoice
    const [newInvoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        customerId,
        customerName,
        customerPhone,
        totalAmount,
        discountAmount,
        taxAmount,
        finalAmount,
        paidAmount,
        balance,
        paymentMethod,
        status: "completed",
        notes: data.notes || null,
        createdById: session?.id,
      })
      .returning();

    // Insert Invoice Items & Update Stock
    for (const item of preparedItems) {
      await db.insert(invoiceItems).values({
        invoiceId: newInvoice.id,
        productId: item.productId,
        productName: item.productName,
        unit: item.unit,
        quantity: item.quantity,
        buyPrice: item.buyPrice,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalPrice: item.totalPrice,
      });

      if (item.productId) {
        // Fetch current product stock
        const [prod] = await db.select().from(products).where(eq(products.id, item.productId));
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await db
            .update(products)
            .set({ stock: newStock, updatedAt: new Date().toISOString() })
            .where(eq(products.id, item.productId));

          // Log transaction
          await db.insert(inventoryTransactions).values({
            productId: prod.id,
            type: "sale",
            quantity: -item.quantity,
            previousStock: prod.stock,
            newStock: newStock,
            referenceId: invoiceNumber,
            notes: `فروش صادر شده در فاکتور ${invoiceNumber}`,
            createdById: session?.id,
          });
        }
      }
    }

    // Update customer debt and total purchases if customer selected
    if (customerId) {
      const [cust] = await db.select().from(customers).where(eq(customers.id, customerId));
      if (cust) {
        await db
          .update(customers)
          .set({
            totalPurchases: cust.totalPurchases + finalAmount,
            debt: Math.max(0, cust.debt + balance),
          })
          .where(eq(customers.id, customerId));
      }
    }

    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "خطا در صدور فاکتور" }, { status: 500 });
  }
}

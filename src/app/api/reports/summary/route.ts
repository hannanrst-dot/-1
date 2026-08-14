import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, invoices, invoiceItems, customers, suppliers } from "@/db/schema";
import { lte, sql, desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Today Invoices
    const todayInvoices = await db
      .select()
      .from(invoices)
      .where(sql`${invoices.createdAt} >= ${todayStart.toISOString()}`);

    const todaySales = todayInvoices.reduce((acc, inv) => sumAmount(acc, inv.finalAmount), 0);
    const todayInvoiceCount = todayInvoices.length;

    // Total Products
    const allProducts = await db.select().from(products).where(eq(products.isActive, true));
    const totalProductsCount = allProducts.length;

    // Low Stock Count
    const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock);
    const lowStockCount = lowStockProducts.length;

    // Total Inventory Value
    const totalInventoryValue = allProducts.reduce((sum, p) => sum + p.stock * p.sellPrice, 0);

    // Calculate Estimated Today Profit
    let todayEstimatedProfit = 0;
    for (const inv of todayInvoices) {
      const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, inv.id));
      for (const item of items) {
        const itemProfit = (item.unitPrice - item.buyPrice) * item.quantity;
        todayEstimatedProfit += itemProfit;
      }
    }

    // Recent 5 Invoices
    const recentInvoices = await db.select().from(invoices).orderBy(desc(invoices.id)).limit(5);

    // Top Selling Products (from all invoice items)
    const topItemsQuery = await db
      .select({
        productName: invoiceItems.productName,
        totalQty: sql<number>`sum(${invoiceItems.quantity})`,
        totalRevenue: sql<number>`sum(${invoiceItems.totalPrice})`,
      })
      .from(invoiceItems)
      .groupBy(invoiceItems.productName)
      .orderBy(desc(sql`sum(${invoiceItems.quantity})`))
      .limit(5);

    // Weekly Sales Trend (last 7 days)
    const weeklyData = [];
    const dayNames = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);

      const dayInvoices = await db
        .select()
        .from(invoices)
        .where(sql`${invoices.createdAt} >= ${d.toISOString()} AND ${invoices.createdAt} <= ${dEnd.toISOString()}`);

      const dayTotal = dayInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
      weeklyData.push({
        day: dayNames[d.getDay()],
        sales: dayTotal,
        count: dayInvoices.length,
      });
    }

    return NextResponse.json({
      summary: {
        todaySales,
        todayInvoiceCount,
        totalProductsCount,
        lowStockCount,
        totalInventoryValue,
        todayEstimatedProfit,
      },
      lowStockProducts: lowStockProducts.slice(0, 5),
      recentInvoices,
      topSellingProducts: topItemsQuery,
      weeklyData,
    });
  } catch (error) {
    console.error("Summary error:", error);
    return NextResponse.json({ error: "خطا در دریافت خلاصه آمار" }, { status: 500 });
  }
}

function sumAmount(acc: number, val: number): number {
  return acc + (val || 0);
}

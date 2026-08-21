import { NextResponse } from "next/server";
import { db, rawSqlite } from "@/db";
import {
  categories, brands, products, customers, suppliers, invoices, invoiceItems,
  purchases, purchaseItems, expenses, settings, inventoryTransactions, installmentPlans, installments,
} from "@/db/schema";

/**
 * بازیابیِ اطلاعات از فایلِ بک‌آپ (JSON خروجیِ /api/backup).
 * همهٔ دادهٔ فعلیِ این جدول‌ها پاک و با محتوای بک‌آپ جایگزین می‌شود.
 * کاربرانِ سیستم دست‌نخورده می‌مانند (تا ورود مختل نشود).
 */
export async function POST(req: Request) {
  try {
    const backup = await req.json();
    if (!backup || typeof backup !== "object" || !Array.isArray(backup.products)) {
      return NextResponse.json({ error: "فایل بک‌آپ نامعتبر است." }, { status: 400 });
    }

    rawSqlite.pragma("foreign_keys = OFF");
    try {
      // پاک‌سازیِ داده‌های وابسته + جدول‌های بک‌آپ‌شده
      for (const t of [installments, installmentPlans, inventoryTransactions, invoiceItems, purchaseItems, invoices, purchases, expenses, products, customers, suppliers, brands, categories, settings]) {
        await db.delete(t);
      }
      // درجِ داده از بک‌آپ (ترتیبِ والد→فرزند)
      const insMany = async (table: any, rows: any[] | undefined) => {
        if (!rows || !rows.length) return 0;
        for (const row of rows) await db.insert(table).values(row);
        return rows.length;
      };
      const counts = {
        categories: await insMany(categories, backup.categories),
        brands: await insMany(brands, backup.brands),
        suppliers: await insMany(suppliers, backup.suppliers),
        customers: await insMany(customers, backup.customers),
        products: await insMany(products, backup.products),
        invoices: await insMany(invoices, backup.invoices),
        invoiceItems: await insMany(invoiceItems, backup.invoiceItems),
        purchases: await insMany(purchases, backup.purchases),
        purchaseItems: await insMany(purchaseItems, backup.purchaseItems),
        expenses: await insMany(expenses, backup.expenses),
        settings: await insMany(settings, backup.settings),
      };
      rawSqlite.pragma("foreign_keys = ON");
      return NextResponse.json({ success: true, counts });
    } catch (e) {
      rawSqlite.pragma("foreign_keys = ON");
      throw e;
    }
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json({ error: "خطا در بازیابی اطلاعات. مطمئن شوید فایل درست است." }, { status: 500 });
  }
}

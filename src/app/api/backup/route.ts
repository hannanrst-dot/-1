import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, brands, customers, suppliers, invoices, invoiceItems, purchases, purchaseItems, expenses, settings } from "@/db/schema";

export async function GET() {
  try {
    const backupData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      categories: await db.select().from(categories),
      brands: await db.select().from(brands),
      products: await db.select().from(products),
      customers: await db.select().from(customers),
      suppliers: await db.select().from(suppliers),
      invoices: await db.select().from(invoices),
      invoiceItems: await db.select().from(invoiceItems),
      purchases: await db.select().from(purchases),
      purchaseItems: await db.select().from(purchaseItems),
      expenses: await db.select().from(expenses),
      settings: await db.select().from(settings),
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="store-backup-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "خطا در تهیه فایل پشتیبان" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { processVoiceCommand } from "@/lib/voice/intentEngine";
import { resolveVoiceInvoiceItems } from "@/lib/voice/ambiguityResolver";
import { db } from "@/db";
import { products, invoices } from "@/db/schema";
import { eq, lte, sql, desc, like } from "drizzle-orm";
import { formatToman, toPersianDigits } from "@/lib/persian/utils";

export async function POST(req: Request) {
  try {
    const { spokenText } = await req.json();

    if (!spokenText || typeof spokenText !== "string" || !spokenText.trim()) {
      return NextResponse.json({ error: "متن صوتی ارسال نشده است." }, { status: 400 });
    }

    // 1. Process Voice Command through Intent Engine
    const actionResult = processVoiceCommand(spokenText);

    // 2. Fetch active products for smart matching
    const allDbProducts = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        barcode: products.barcode,
        stock: products.stock,
        buyPrice: products.buyPrice,
        sellPrice: products.sellPrice,
        unit: products.unit,
      })
      .from(products)
      .where(eq(products.isActive, true));

    // 3. Handle specific intents
    if (actionResult.intent === "QUERY_TODAY_SALES") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayInvoices = await db
        .select()
        .from(invoices)
        .where(sql`${invoices.createdAt} >= ${todayStart.toISOString()}`);

      const totalTodaySales = todayInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
      const invoiceCount = todayInvoices.length;

      const speechResponse = `فروش امروز ${toPersianDigits(invoiceCount)} فاکتور به مبلغ کل ${formatToman(totalTodaySales)} بوده است.`;

      return NextResponse.json({
        result: actionResult,
        speechResponse,
        type: "INFO",
        data: {
          totalTodaySales,
          invoiceCount,
        },
      });
    }

    if (actionResult.intent === "QUERY_LOW_STOCK") {
      const lowStockItems = await db
        .select()
        .from(products)
        .where(lte(products.stock, products.minStock));

      let speechResponse = "";
      if (lowStockItems.length === 0) {
        speechResponse = "تمامی کالاها موجودی کافی دارند و کالای کم‌موجودی یافت نشد.";
      } else {
        const itemNames = lowStockItems.slice(0, 3).map(i => `${i.name} (${toPersianDigits(i.stock)} ${i.unit})`).join("، ");
        speechResponse = `تعداد ${toPersianDigits(lowStockItems.length)} کالا کم‌موجود است. از جمله: ${itemNames}`;
      }

      return NextResponse.json({
        result: actionResult,
        speechResponse,
        type: "LOW_STOCK_LIST",
        data: { lowStockItems },
      });
    }

    if (actionResult.intent === "QUERY_CUSTOMER_INVOICE") {
      const custName = actionResult.entities.customerName;
      let matchedInvoices: typeof invoices.$inferSelect[] = [];
      if (custName) {
        matchedInvoices = await db
          .select()
          .from(invoices)
          .where(like(invoices.customerName, `%${custName}%`))
          .orderBy(desc(invoices.id))
          .limit(1);
      }

      let speechResponse = "";
      if (matchedInvoices.length > 0) {
        const inv = matchedInvoices[0];
        speechResponse = `آخرین فاکتور ${inv.customerName} به شماره ${inv.invoiceNumber} و مبلغ ${formatToman(inv.finalAmount)} پیدا شد.`;
      } else {
        speechResponse = custName ? `فاکتوری برای مشتری ${custName} یافت نشد.` : "نام مشتری مشخص نیست.";
      }

      return NextResponse.json({
        result: actionResult,
        speechResponse,
        type: "INVOICE_FOUND",
        data: { invoice: matchedInvoices[0] || null },
      });
    }

    if (actionResult.intent === "CREATE_PRODUCT") {
      // Voice Product Registration
      const prodData = actionResult.entities;
      // نمایش نام کالا با ارقام فارسی (پردازش داخلی با ارقام انگلیسی انجام می‌شود)
      if (prodData.productName) {
        prodData.productName = prodData.productName.replace(/\d/g, (x: string) => "۰۱۲۳۴۵۶۷۸۹"[Number(x)]);
      }
      const speechResponse = `اطلاعات کالا استخراج شد: ${prodData.productName}، تعداد ${toPersianDigits(prodData.stock)}، قیمت خرید ${formatToman(prodData.buyPrice)}، قیمت فروش ${formatToman(prodData.sellPrice)}. آیا ثبت شود؟`;

      return NextResponse.json({
        result: actionResult,
        speechResponse,
        type: "CREATE_PRODUCT_CONFIRMATION",
        data: {
          product: {
            name: prodData.productName,
            stock: prodData.stock ?? 1,
            buyPrice: prodData.buyPrice ?? 0,
            sellPrice: prodData.sellPrice ?? 0,
          },
        },
      });
    }

    if (actionResult.intent === "CREATE_INVOICE" && actionResult.entities.items) {
      // Resolve fuzzy items against database
      const resolution = resolveVoiceInvoiceItems(actionResult.entities.items, allDbProducts);

      let totalEstAmount = 0;
      const resolvedList = [];

      for (const resItem of resolution.resolvedItems) {
        const itemPrice = resItem.selectedProduct ? resItem.selectedProduct.sellPrice : 0;
        totalEstAmount += itemPrice * resItem.quantity;
        resolvedList.push({
          productId: resItem.selectedProduct?.id || null,
          productName: resItem.selectedProduct?.name || resItem.requestedName,
          quantity: resItem.quantity,
          unitPrice: itemPrice,
          totalPrice: itemPrice * resItem.quantity,
          matches: resItem.matches,
          status: resItem.status,
        });
      }

      let speechResponse = "";
      if (resolution.hasAmbiguity) {
        speechResponse = resolution.promptText || "لطفاً کالای دقیق را انتخاب فرمایید.";
      } else {
        const custText = actionResult.entities.customerName ? ` برای ${actionResult.entities.customerName}` : "";
        speechResponse = `فاکتور شامل ${toPersianDigits(resolvedList.length)} قلم${custText} و مبلغ کل ${formatToman(totalEstAmount)} است. ثبت شود؟`;
      }

      return NextResponse.json({
        result: actionResult,
        resolution,
        speechResponse,
        type: "CREATE_INVOICE_CONFIRMATION",
        data: {
          customerName: actionResult.entities.customerName || "مشتری عمومی",
          items: resolvedList,
          totalAmount: totalEstAmount,
        },
      });
    }

    if (actionResult.intent === "CREATE_PURCHASE" && actionResult.entities.items) {
      const resolution = resolveVoiceInvoiceItems(actionResult.entities.items, allDbProducts);
      let totalEstAmount = 0;
      const resolvedList = [];

      for (const resItem of resolution.resolvedItems) {
        const itemPrice = actionResult.entities.buyPrice || (resItem.selectedProduct ? resItem.selectedProduct.buyPrice : 0);
        totalEstAmount += itemPrice * resItem.quantity;
        resolvedList.push({
          productId: resItem.selectedProduct?.id || null,
          productName: resItem.selectedProduct?.name || resItem.requestedName,
          quantity: resItem.quantity,
          unitPrice: itemPrice,
          totalPrice: itemPrice * resItem.quantity,
          matches: resItem.matches,
          status: resItem.status,
        });
      }

      const suppText = actionResult.entities.supplierName ? ` از ${actionResult.entities.supplierName}` : "";
      const speechResponse = `فاکتور خرید شامل ${toPersianDigits(resolvedList.length)} قلم${suppText} و مبلغ ${formatToman(totalEstAmount)} است. آیا ثبت شود؟`;

      return NextResponse.json({
        result: actionResult,
        speechResponse,
        type: "CREATE_PURCHASE_CONFIRMATION",
        data: {
          supplierName: actionResult.entities.supplierName || "تامین‌کننده عمومی",
          items: resolvedList,
          totalAmount: totalEstAmount,
        },
      });
    }

    // Default Unknown Speech Response
    return NextResponse.json({
      result: actionResult,
      speechResponse: "دستور صوتی شما دریافت شد، اما عنوان یا دستور مشخصی تشخیص داده نشد. لطفاً دوباره بگویید.",
      type: "UNKNOWN",
      data: null,
    });
  } catch (error) {
    console.error("Voice process error:", error);
    return NextResponse.json({ error: "خطا در پردازش دستور صوتی" }, { status: 500 });
  }
}

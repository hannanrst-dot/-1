import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, inventoryTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) {
      return NextResponse.json({ error: "کالا پیدا نشد." }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: "خطا در دریافت کالا" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;
    const productId = parseInt(id, 10);
    const data = await req.json();

    const [existing] = await db.select().from(products).where(eq(products.id, productId));
    if (!existing) {
      return NextResponse.json({ error: "کالا پیدا نشد." }, { status: 404 });
    }

    const newStock = data.stock !== undefined ? Number(data.stock) : existing.stock;

    // Record inventory transaction if stock changed
    if (newStock !== existing.stock) {
      await db.insert(inventoryTransactions).values({
        productId: productId,
        type: "adjustment",
        quantity: newStock - existing.stock,
        previousStock: existing.stock,
        newStock: newStock,
        notes: data.stockNote || "تغییر دستی موجودی",
        createdById: session?.id,
      });
    }

    const [updated] = await db
      .update(products)
      .set({
        name: data.name ?? existing.name,
        sku: data.sku ?? existing.sku,
        barcode: data.barcode ?? existing.barcode,
        categoryId: data.categoryId !== undefined ? (data.categoryId ? Number(data.categoryId) : null) : existing.categoryId,
        brandId: data.brandId !== undefined ? (data.brandId ? Number(data.brandId) : null) : existing.brandId,
        unit: data.unit ?? existing.unit,
        stock: newStock,
        minStock: data.minStock !== undefined ? Number(data.minStock) : existing.minStock,
        buyPrice: data.buyPrice !== undefined ? Number(data.buyPrice) : existing.buyPrice,
        sellPrice: data.sellPrice !== undefined ? Number(data.sellPrice) : existing.sellPrice,
        discount: data.discount !== undefined ? Number(data.discount) : existing.discount,
        taxPercent: data.taxPercent !== undefined ? Number(data.taxPercent) : existing.taxPercent,
        description: data.description ?? existing.description,
        image: data.image ?? existing.image,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, productId))
      .returning();

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "خطا در بروزرسانی کالا" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    await db.delete(products).where(eq(products.id, productId));
    return NextResponse.json({ success: true, message: "کالا با موفقیت حذف شد." });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "حذف کالا امکان‌پذیر نیست زیرا در فاکتورها استفاده شده است." }, { status: 400 });
  }
}

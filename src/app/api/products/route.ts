import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, brands, inventoryTransactions } from "@/db/schema";
import { eq, like, or, lte, desc, sql, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const lowStock = searchParams.get("lowStock") === "true";
    const barcode = searchParams.get("barcode");

    let query = db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        barcode: products.barcode,
        categoryId: products.categoryId,
        categoryName: categories.name,
        brandId: products.brandId,
        brandName: brands.name,
        unit: products.unit,
        stock: products.stock,
        minStock: products.minStock,
        buyPrice: products.buyPrice,
        sellPrice: products.sellPrice,
        discount: products.discount,
        taxPercent: products.taxPercent,
        description: products.description,
        image: products.image,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .$dynamic();

    const conditions = [];

    if (barcode) {
      conditions.push(eq(products.barcode, barcode));
    } else if (search) {
      const term = `%${search}%`;
      conditions.push(
        or(
          like(products.name, term),
          like(products.sku, term),
          like(products.barcode, term),
          like(products.description, term)
        )
      );
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, parseInt(categoryId, 10)));
    }

    if (lowStock) {
      conditions.push(lte(products.stock, products.minStock));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(products.id));
    return NextResponse.json({ products: result });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json({ error: "خطا در دریافت لیست کالاها" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const data = await req.json();

    if (!data.name || data.buyPrice === undefined || data.sellPrice === undefined) {
      return NextResponse.json({ error: "نام کالا، قیمت خرید و قیمت فروش الزامی است." }, { status: 400 });
    }

    const stock = Number(data.stock ?? 0);
    const [newProduct] = await db
      .insert(products)
      .values({
        name: data.name.trim(),
        sku: data.sku ? data.sku.trim() : `SKU-${Date.now().toString().slice(-6)}`,
        barcode: data.barcode ? data.barcode.trim() : null,
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        brandId: data.brandId ? Number(data.brandId) : null,
        unit: data.unit || "عدد",
        stock: stock,
        minStock: Number(data.minStock ?? 5),
        buyPrice: Number(data.buyPrice),
        sellPrice: Number(data.sellPrice),
        discount: Number(data.discount ?? 0),
        taxPercent: Number(data.taxPercent ?? 0),
        description: data.description || null,
        image: data.image || null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      })
      .returning();

    // Log initial stock inventory transaction if stock > 0
    if (stock > 0) {
      await db.insert(inventoryTransactions).values({
        productId: newProduct.id,
        type: "adjustment",
        quantity: stock,
        previousStock: 0,
        newStock: stock,
        referenceId: "INITIAL_STOCK",
        notes: "موجودی اولیه هنگام ثبت کالا",
        createdById: session?.id,
      });
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "خطا در ثبت کالا" }, { status: 500 });
  }
}

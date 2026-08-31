import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { productSchema, zodMessage } from "@/lib/validators";

async function ownedProduct(userId: string, productId: string) {
  const seller = await prisma.seller.findUnique({ where: { userId } });
  if (!seller) return null;
  return prisma.product.findFirst({ where: { id: productId, sellerId: seller.id } });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const existing = await ownedProduct(user.id, id);
  if (!existing) return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
  const d = parsed.data;

  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        title: d.title,
        description: d.description,
        shortDesc: d.shortDesc || null,
        price: d.price,
        discountPercent: d.discountPercent,
        stock: d.stock,
        images: JSON.stringify(d.images),
        specs: JSON.stringify(d.specs.filter((s) => s.key && s.value)),
        tags: d.tags || d.title,
        warranty: d.warranty || null,
        warrantyMonths: d.warrantyMonths,
        condition: d.condition,
        screenSize: d.screenSize || null,
        hasMemory: d.hasMemory,
        panelType: d.panelType || null,
        unitCount: d.unitCount ?? null,
        wiring: d.wiring || null,
        isOriginal: d.isOriginal,
        categoryId: d.categoryId,
        brandId: d.brandId || null,
        // ویرایش محصول تأییدشده، دوباره به صف بررسی می‌رود
        status: "PENDING",
        rejectNote: null,
        variants: {
          create: d.variants
            .filter((v) => v.name && v.value)
            .map((v) => ({
              name: v.name, value: v.value, colorHex: v.colorHex ?? null,
              priceDiff: v.priceDiff, stock: v.stock,
            })),
        },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const existing = await ownedProduct(user.id, id);
  if (!existing) return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });

  const ordered = await prisma.orderItem.count({ where: { productId: id } });
  if (ordered > 0) {
    // محصولی که سابقه سفارش دارد حذف نمی‌شود تا تاریخچه سفارش‌ها سالم بماند
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true, archived: true });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

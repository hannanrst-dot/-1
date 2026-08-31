import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { productSchema, zodMessage } from "@/lib/validators";
import { uniqueSlug } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller || seller.status !== "APPROVED") {
    return NextResponse.json({ error: "فروشندگی شما هنوز تأیید نشده است" }, { status: 403 });
  }

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
  const d = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: d.categoryId } });
  if (!category) return NextResponse.json({ error: "دسته‌بندی نامعتبر است" }, { status: 400 });

  const product = await prisma.product.create({
    data: {
      title: d.title,
      slug: uniqueSlug(d.title),
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
      sellerId: seller.id,
      status: "PENDING",
      variants: {
        create: d.variants
          .filter((v) => v.name && v.value)
          .map((v) => ({
            name: v.name, value: v.value, colorHex: v.colorHex ?? null,
            priceDiff: v.priceDiff, stock: v.stock,
          })),
      },
    },
  });

  return NextResponse.json({ ok: true, id: product.id, slug: product.slug });
}

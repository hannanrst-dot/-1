import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ProductForm, type ProductFormValues } from "@/components/seller/ProductForm";
import { parseJSON, PRODUCT_STATUS } from "@/lib/utils";

export const metadata = { title: "ویرایش محصول" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole(["SELLER", "ADMIN"]);
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) notFound();

  const [product, categories, brands] = await Promise.all([
    prisma.product.findFirst({
      where: { id, sellerId: seller.id },
      include: { variants: true },
    }),
    prisma.category.findMany({
      where: { parentId: { not: null } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  const initial: ProductFormValues = {
    id: product.id,
    title: product.title,
    description: product.description,
    shortDesc: product.shortDesc ?? "",
    price: product.price,
    discountPercent: product.discountPercent,
    stock: product.stock,
    categoryId: product.categoryId,
    brandId: product.brandId ?? "",
    images: parseJSON<string[]>(product.images, []),
    specs: parseJSON<{ key: string; value: string }[]>(product.specs, []),
    variants: product.variants.map((v) => ({
      name: v.name, value: v.value, colorHex: v.colorHex ?? "#000000",
      priceDiff: v.priceDiff, stock: v.stock,
    })),
    tags: product.tags,
    warranty: product.warranty ?? "",
    warrantyMonths: product.warrantyMonths,
    condition: product.condition as ProductFormValues["condition"],
    screenSize: product.screenSize ?? "",
    hasMemory: product.hasMemory,
    panelType: product.panelType ?? "",
    unitCount: product.unitCount ?? "",
    wiring: product.wiring ?? "",
    isOriginal: product.isOriginal,
  };

  const status = PRODUCT_STATUS[product.status];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink-900">ویرایش محصول</h1>
        <span className={`badge ${status.color}`}>{status.label}</span>
      </div>

      {product.status === "REJECTED" && product.rejectNote && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-[13px] leading-6 text-rose-700">
          <b>دلیل رد شدن محصول:</b> {product.rejectNote}
        </div>
      )}

      <ProductForm categories={categories} brands={brands} initial={initial} mode="edit" />
    </div>
  );
}

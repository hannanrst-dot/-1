import { notFound } from "next/navigation";
import { Store, MapPin, Package, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductRow";
import { Stars } from "@/components/ui/Stars";
import { Empty } from "@/components/ui/Empty";
import { toFaDigits, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seller = await prisma.seller.findUnique({ where: { slug } });
  return { title: seller?.shopName ?? "فروشگاه" };
}

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seller = await prisma.seller.findFirst({
    where: { slug, status: "APPROVED" },
    include: { _count: { select: { products: true } } },
  });
  if (!seller) notFound();

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id, status: "APPROVED", isActive: true },
    orderBy: { sold: "desc" },
    select: {
      id: true, title: true, slug: true, price: true, discountPercent: true,
      images: true, stock: true, rating: true, ratingCount: true,
      hasMemory: true, screenSize: true,
      brand: { select: { name: true } }, seller: { select: { shopName: true } },
    },
  });

  return (
    <div className="container-app py-5">
      <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-l from-ink-950 to-ink-800 p-6 text-white lg:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/10">
            <Store className="size-8" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-xl font-bold">
              {seller.shopName}
              <CheckCircle2 className="size-5 text-emerald-400" />
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-white/70">
              <Stars rating={seller.rating} size={14} />
              <span className="flex items-center gap-1.5">
                <Package className="size-4" /> {toFaDigits(seller._count.products)} کالا
              </span>
              {seller.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> {seller.province}، {seller.city}
                </span>
              )}
              <span>عضو از {formatDate(seller.createdAt)}</span>
            </div>
          </div>
        </div>
        {seller.description && (
          <p className="mt-4 max-w-2xl text-[13px] leading-7 text-white/70">{seller.description}</p>
        )}
      </div>

      {products.length === 0 ? (
        <Empty title="این فروشگاه هنوز محصولی ندارد" />
      ) : (
        <>
          <h2 className="section-title mb-3">محصولات فروشگاه ({toFaDigits(products.length)})</h2>
          <ProductGrid products={products} />
        </>
      )}
    </div>
  );
}

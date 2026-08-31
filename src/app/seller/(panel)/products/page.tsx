import Link from "next/link";
import { Package, PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { SellerProductTable } from "@/components/seller/SellerProductTable";
import { Empty } from "@/components/ui/Empty";
import { parseJSON } from "@/lib/utils";

export const metadata = { title: "محصولات من" };
export const dynamic = "force-dynamic";

export default async function SellerProducts() {
  const user = await requireRole(["SELLER", "ADMIN"]);
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return null;

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } },
  });

  if (products.length === 0) {
    return (
      <Empty
        title="هنوز محصولی ثبت نکرده‌اید"
        desc="اولین محصول خود را بارگذاری کنید تا پس از تأیید کارشناسان در فروشگاه نمایش داده شود."
        actionHref="/seller/products/new"
        actionLabel="افزودن محصول"
        icon={<Package className="size-8" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink-900">محصولات من</h1>
        <Link href="/seller/products/new" className="btn-primary">
          <PlusCircle className="size-4" /> افزودن محصول
        </Link>
      </div>

      <SellerProductTable
        products={products.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          image: parseJSON<string[]>(p.images, [])[0] ?? null,
          price: p.price,
          discountPercent: p.discountPercent,
          stock: p.stock,
          sold: p.sold,
          status: p.status,
          rejectNote: p.rejectNote,
          isActive: p.isActive,
          category: p.category.name,
        }))}
      />
    </div>
  );
}

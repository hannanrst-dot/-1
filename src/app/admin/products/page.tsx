import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AdminProductList } from "@/components/admin/AdminProductList";
import { parseJSON } from "@/lib/utils";

export const metadata = { title: "مدیریت محصولات" };
export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  await requireRole(["ADMIN"]);
  const products = await prisma.product.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      seller: { select: { shopName: true, slug: true } },
      category: { select: { name: true } },
    },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink-900">مدیریت و تأیید محصولات</h1>
      <AdminProductList
        products={products.map((p) => ({
          id: p.id, title: p.title, slug: p.slug,
          image: parseJSON<string[]>(p.images, [])[0] ?? null,
          price: p.price, discountPercent: p.discountPercent, stock: p.stock,
          status: p.status, isActive: p.isActive, createdAt: p.createdAt.toISOString(),
          seller: p.seller.shopName, category: p.category.name,
        }))}
      />
    </div>
  );
}

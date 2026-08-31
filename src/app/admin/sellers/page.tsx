import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AdminSellerList } from "@/components/admin/AdminSellerList";

export const metadata = { title: "مدیریت فروشندگان" };
export const dynamic = "force-dynamic";

export default async function AdminSellers() {
  await requireRole(["ADMIN"]);
  const sellers = await prisma.seller.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true, email: true, phone: true } },
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink-900">مدیریت فروشندگان</h1>
      <AdminSellerList
        sellers={sellers.map((s) => ({
          id: s.id, shopName: s.shopName, slug: s.slug, status: s.status,
          description: s.description, nationalId: s.nationalId, iban: s.iban,
          province: s.province, city: s.city, address: s.address,
          createdAt: s.createdAt.toISOString(), products: s._count.products,
          userName: s.user.name, email: s.user.email, phone: s.user.phone ?? "",
        }))}
      />
    </div>
  );
}

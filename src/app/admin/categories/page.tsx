import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AdminCategoryManager } from "@/components/admin/AdminCategoryManager";

export const metadata = { title: "دسته‌بندی‌ها" };
export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  await requireRole(["ADMIN"]);
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true, children: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink-900">مدیریت دسته‌بندی‌ها</h1>
      <AdminCategoryManager
        categories={categories.map((c) => ({
          id: c.id, name: c.name, slug: c.slug, icon: c.icon,
          parentId: c.parentId, order: c.order,
          products: c._count.products, children: c._count.children,
        }))}
      />
    </div>
  );
}

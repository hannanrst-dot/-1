import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ProductForm } from "@/components/seller/ProductForm";

export const metadata = { title: "افزودن محصول" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireRole(["SELLER", "ADMIN"]);
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: { not: null } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-ink-900">افزودن محصول جدید</h1>
        <p className="mt-1 text-[13px] text-ink-500">
          پس از ثبت، محصول برای بررسی به کارشناسان ارسال می‌شود و پس از تأیید در سایت نمایش داده خواهد شد.
        </p>
      </div>
      <ProductForm categories={categories} brands={brands} mode="create" />
    </div>
  );
}

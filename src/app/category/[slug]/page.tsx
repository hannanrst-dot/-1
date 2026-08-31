import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { categoryTreeIds, searchProducts, type SearchParams } from "@/lib/query";
import { Filters } from "@/components/search/Filters";
import { SortBar } from "@/components/search/SortBar";
import { ProductGrid } from "@/components/product/ProductRow";
import { Pagination } from "@/components/ui/Pagination";
import { Empty } from "@/components/ui/Empty";
import { toFaDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  return { title: cat?.name ?? "دسته‌بندی" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const tree = await categoryTreeIds(slug);
  if (!tree) notFound();

  const [{ items, total, page, totalPages }, brands, parent] = await Promise.all([
    searchProducts(sp, tree.ids),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    tree.root.parentId
      ? prisma.category.findUnique({ where: { id: tree.root.parentId } })
      : Promise.resolve(null),
  ]);

  return (
    <div className="container-app py-5">
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-[12px] text-ink-500">
        <Link href="/" className="hover:text-brand-600">خانه</Link>
        <ChevronLeft className="size-3.5" />
        {parent && (
          <>
            <Link href={`/category/${parent.slug}`} className="hover:text-brand-600">{parent.name}</Link>
            <ChevronLeft className="size-3.5" />
          </>
        )}
        <span className="text-ink-800">{tree.root.name}</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-900">
          {tree.root.icon} {tree.root.name}
          <span className="mr-2 text-[13px] font-normal text-ink-400">({toFaDigits(total)} کالا)</span>
        </h1>
      </div>

      {tree.root.children.length > 0 && (
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
          {tree.root.children.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-ink-700 shadow-card transition-colors hover:text-brand-600"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-5">
        <Suspense fallback={<div className="hidden w-64 lg:block" />}>
          <Filters brands={brands} />
        </Suspense>

        <div className="min-w-0 flex-1">
          <Suspense fallback={null}>
            <SortBar total={total} />
          </Suspense>

          {items.length === 0 ? (
            <Empty
              title="در این دسته کالایی یافت نشد"
              desc="فیلترهای اعمال‌شده را بردارید یا دسته دیگری را ببینید."
              actionHref={`/category/${slug}`}
              actionLabel="حذف فیلترها"
              icon={<SearchX className="size-8" />}
            />
          ) : (
            <>
              <ProductGrid products={items} />
              <Suspense fallback={null}>
                <Pagination page={page} totalPages={totalPages} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

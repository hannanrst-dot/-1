import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { searchProducts, type SearchParams } from "@/lib/query";
import { Filters } from "@/components/search/Filters";
import { SortBar } from "@/components/search/SortBar";
import { ProductGrid } from "@/components/product/ProductRow";
import { Pagination } from "@/components/ui/Pagination";
import { Empty } from "@/components/ui/Empty";
import { SearchX } from "lucide-react";
import { toFaDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  return { title: sp.q ? `جستجوی «${sp.q}»` : "جستجوی محصولات" };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const [{ items, total, page, totalPages }, brands] = await Promise.all([
    searchProducts(sp),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="container-app py-5">
      <h1 className="mb-4 text-lg font-bold text-ink-900">
        {sp.q ? (
          <>نتایج جستجو برای «<span className="text-brand-600">{sp.q}</span>» — {toFaDigits(total)} کالا</>
        ) : (
          <>همه محصولات ({toFaDigits(total)} کالا)</>
        )}
      </h1>

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
              title="کالایی پیدا نشد"
              desc="فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید."
              actionHref="/search"
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

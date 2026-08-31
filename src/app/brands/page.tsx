import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toFaDigits } from "@/lib/utils";

export const metadata = { title: "برندها" };
export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="container-app py-6">
      <h1 className="mb-4 text-xl font-bold text-ink-900">برندهای موجود در فروشگاه</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/search?brand=${b.slug}`}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-pop"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-ink-50 text-lg font-bold text-ink-600">
              {b.name.slice(0, 2)}
            </span>
            <span className="text-[13px] font-medium text-ink-800">{b.name}</span>
            <span className="text-[11px] text-ink-400">{toFaDigits(b._count.products)} کالا</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

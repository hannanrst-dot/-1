import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductCard, type ProductCardData } from "./ProductCard";

export function ProductRow({
  title,
  href,
  products,
  accent,
}: {
  title: string;
  href?: string;
  products: ProductCardData[];
  accent?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="container-app py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title flex items-center gap-2">
          {accent && <span className="h-5 w-1.5 rounded-full" style={{ background: accent }} />}
          {title}
        </h2>
        {href && (
          <Link href={href} className="flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:text-brand-700">
            مشاهده همه <ChevronLeft className="size-4" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {products.map((p) => (
          <div key={p.id} className="w-[168px] shrink-0 sm:w-[196px]">
            <ProductCard p={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}

import Link from "next/link";

export function CategoryStrip({
  categories,
}: {
  categories: { id: string; name: string; slug: string; icon: string | null }[];
}) {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/category/${c.slug}`}
          className="group flex w-[104px] shrink-0 flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-pop sm:w-[126px]"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-ink-50 text-2xl transition-colors group-hover:bg-brand-50">
            {c.icon}
          </span>
          <span className="text-center text-[12px] font-medium leading-5 text-ink-700 group-hover:text-brand-600">
            {c.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

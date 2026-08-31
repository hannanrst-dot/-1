"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/query";
import { toFaDigits } from "@/lib/utils";

export function SortBar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("sort") ?? "newest";

  const setSort = (id: string) => {
    const q = new URLSearchParams(sp.toString());
    q.set("sort", id);
    q.delete("page");
    router.push(`${pathname}?${q.toString()}`);
  };

  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
      <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-ink-600">
        <ArrowUpDown className="size-4" /> مرتب‌سازی:
      </span>
      <div className="no-scrollbar flex flex-1 gap-1 overflow-x-auto">
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => setSort(o.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
              current === o.id ? "bg-brand-50 font-medium text-brand-600" : "text-ink-500 hover:bg-ink-50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <span className="hidden shrink-0 text-[12px] text-ink-400 sm:block">
        {toFaDigits(total)} کالا
      </span>
    </div>
  );
}

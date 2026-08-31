"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toFaDigits } from "@/lib/utils";

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  if (totalPages <= 1) return null;

  const go = (p: number) => {
    const q = new URLSearchParams(params.toString());
    q.set("page", String(p));
    router.push(`${pathname}?${q.toString()}`);
  };

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }

  return (
    <div className="flex items-center justify-center gap-1.5 py-6">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="grid size-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 disabled:opacity-40"
        aria-label="صفحه قبل"
      >
        <ChevronRight className="size-4" />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`d${i}`} className="px-1 text-ink-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={`size-9 rounded-lg border text-sm font-medium transition-colors ${
              p === page
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-ink-200 bg-white text-ink-700 hover:border-brand-300"
            }`}
          >
            {toFaDigits(p)}
          </button>
        )
      )}
      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className="grid size-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 disabled:opacity-40"
        aria-label="صفحه بعد"
      >
        <ChevronLeft className="size-4" />
      </button>
    </div>
  );
}

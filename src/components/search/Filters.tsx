"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { toFaDigits, toEnDigits, formatPrice } from "@/lib/utils";
import { SCREEN_SIZES, WIRING_TYPES } from "@/lib/query";

type Brand = { id: string; name: string; slug: string };

export function Filters({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  const get = (k: string) => sp.get(k) ?? "";
  const list = (k: string) => get(k).split(",").filter(Boolean);

  const update = (patch: Record<string, string | null>) => {
    const q = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (!v) q.delete(k);
      else q.set(k, v);
    }
    q.delete("page");
    router.push(`${pathname}?${q.toString()}`);
  };

  const toggleIn = (key: string, value: string) => {
    const cur = list(key);
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    update({ [key]: next.join(",") || null });
  };

  const activeCount =
    list("brand").length + list("screen").length + list("wiring").length +
    (get("min") || get("max") ? 1 : 0) +
    ["discount", "available", "memory", "rating"].filter((k) => get(k)).length;

  const [min, setMin] = useState(get("min"));
  const [max, setMax] = useState(get("max"));

  const body = (
    <div className="space-y-5">
      <FilterBlock title="فقط کالاهای موجود">
        <Toggle checked={get("available") === "1"} onChange={(v) => update({ available: v ? "1" : null })} label="نمایش کالاهای موجود" />
        <Toggle checked={get("discount") === "1"} onChange={(v) => update({ discount: v ? "1" : null })} label="فقط تخفیف‌دارها" />
        <Toggle checked={get("memory") === "1"} onChange={(v) => update({ memory: v ? "1" : null })} label="فقط مدل‌های حافظه‌دار" />
      </FilterBlock>

      <FilterBlock title="محدوده قیمت (تومان)">
        <div className="flex items-center gap-2">
          <input
            className="input text-[13px]" placeholder="از" inputMode="numeric"
            value={min ? toFaDigits(Number(min).toLocaleString("en-US")) : ""}
            onChange={(e) => setMin(toEnDigits(e.target.value).replace(/\D/g, ""))}
          />
          <span className="text-ink-300">تا</span>
          <input
            className="input text-[13px]" placeholder="تا" inputMode="numeric"
            value={max ? toFaDigits(Number(max).toLocaleString("en-US")) : ""}
            onChange={(e) => setMax(toEnDigits(e.target.value).replace(/\D/g, ""))}
          />
        </div>
        <button onClick={() => update({ min: min || null, max: max || null })} className="btn-soft mt-2 w-full py-2 text-xs">
          اعمال قیمت
        </button>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[[0, 3_000_000], [3_000_000, 7_000_000], [7_000_000, 15_000_000], [15_000_000, 0]].map(([a, b]) => (
            <button
              key={`${a}-${b}`}
              onClick={() => { setMin(String(a || "")); setMax(String(b || "")); update({ min: a ? String(a) : null, max: b ? String(b) : null }); }}
              className="rounded-lg bg-ink-50 px-2 py-1 text-[11px] text-ink-600 hover:bg-brand-50 hover:text-brand-600"
            >
              {b ? `${formatPrice(a)} تا ${formatPrice(b)}` : `بالای ${formatPrice(a)}`}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="برند">
        <div className="max-h-52 space-y-1 overflow-y-auto pl-1">
          {brands.map((b) => (
            <Check2 key={b.id} checked={list("brand").includes(b.slug)} onChange={() => toggleIn("brand", b.slug)} label={b.name} />
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="اندازه صفحه نمایش">
        <div className="flex flex-wrap gap-1.5">
          {SCREEN_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleIn("screen", s)}
              className={`rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors ${
                list("screen").includes(s)
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-ink-200 text-ink-600 hover:border-brand-300"
              }`}
            >
              {s} اینچ
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="نوع اتصال">
        <div className="flex flex-wrap gap-1.5">
          {WIRING_TYPES.map((s) => (
            <button
              key={s}
              onClick={() => toggleIn("wiring", s)}
              className={`rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors ${
                list("wiring").includes(s)
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-ink-200 text-ink-600 hover:border-brand-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="حداقل امتیاز">
        <div className="flex gap-1.5">
          {[4, 3].map((r) => (
            <button
              key={r}
              onClick={() => update({ rating: get("rating") === String(r) ? null : String(r) })}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-[12px] ${
                get("rating") === String(r) ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600"
              }`}
            >
              {toFaDigits(r)} ستاره و بالاتر
            </button>
          ))}
        </div>
      </FilterBlock>

      {activeCount > 0 && (
        <button onClick={() => router.push(pathname)} className="btn-outline w-full text-rose-600">
          حذف همه فیلترها
        </button>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-outline w-full justify-between lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" /> فیلترها
        </span>
        {activeCount > 0 && (
          <span className="badge bg-brand-600 text-white">{toFaDigits(activeCount)}</span>
        )}
      </button>

      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-[136px] rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-ink-800">
            <SlidersHorizontal className="size-4" /> فیلترها
          </h2>
          {body}
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">فیلترها</h2>
              <button onClick={() => setOpen(false)} aria-label="بستن"><X className="size-5 text-ink-500" /></button>
            </div>
            {body}
            <button onClick={() => setOpen(false)} className="btn-primary mt-4 w-full py-3">نمایش نتایج</button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink-100 pb-4 last:border-0">
      <h3 className="mb-2.5 text-[13px] font-bold text-ink-700">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1.5">
      <span className="text-[13px] text-ink-600">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-brand-600" : "bg-ink-200"}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${checked ? "right-0.5" : "right-4.5"}`}
          style={{ right: checked ? 2 : 18 }} />
      </button>
    </label>
  );
}

function Check2({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1.5 text-[13px] text-ink-600 hover:text-brand-600">
      <span className={`grid size-4.5 place-items-center rounded border transition-colors ${
        checked ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300"
      }`} style={{ width: 18, height: 18 }}>
        {checked && <Check className="size-3" />}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
      {label}
    </label>
  );
}

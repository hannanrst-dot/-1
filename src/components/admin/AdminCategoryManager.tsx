"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, FolderTree, CornerDownLeft } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { toFaDigits } from "@/lib/utils";

type Cat = {
  id: string; name: string; slug: string; icon: string | null;
  parentId: string | null; order: number; products: number; children: number;
};

export function AdminCategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", slug: "", icon: "", parentId: "", order: 0 });

  const roots = categories.filter((c) => !c.parentId);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "خطا در ثبت دسته‌بندی", "error");
    toast("دسته‌بندی ساخته شد");
    setF({ name: "", slug: "", icon: "", parentId: "", order: 0 });
    setOpen(false);
    router.refresh();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/category?id=${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast(data.error ?? "خطا در حذف", "error");
    toast("دسته‌بندی حذف شد", "info");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <button onClick={() => setOpen((v) => !v)} className="btn-primary">
        <Plus className="size-4" /> دسته‌بندی جدید
      </button>

      {open && (
        <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-white p-4 shadow-card sm:grid-cols-2">
          <div>
            <label className="label">نام دسته‌بندی *</label>
            <input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required minLength={2} />
          </div>
          <div>
            <label className="label">نشانی انگلیسی (slug)</label>
            <input className="input" dir="ltr" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="video-intercom-12" />
          </div>
          <div>
            <label className="label">آیکن (اموجی)</label>
            <input className="input" value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })} placeholder="📺" maxLength={4} />
          </div>
          <div>
            <label className="label">دسته والد</label>
            <select className="input" value={f.parentId} onChange={(e) => setF({ ...f, parentId: e.target.value })}>
              <option value="">دسته اصلی (بدون والد)</option>
              {roots.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button disabled={busy} className="btn-primary flex-1">{busy ? "در حال ثبت…" : "ذخیره دسته‌بندی"}</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">انصراف</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {roots.map((root) => (
          <div key={root.id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-50 text-lg">
                {root.icon ?? <FolderTree className="size-4 text-ink-400" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-ink-800">{root.name}</p>
                <p className="text-[11px] text-ink-400" dir="ltr">{root.slug}</p>
              </div>
              <span className="shrink-0 text-[11px] text-ink-500">
                {toFaDigits(root.products)} کالا — {toFaDigits(root.children)} زیرشاخه
              </span>
              {root.products === 0 && root.children === 0 && (
                <button onClick={() => remove(root.id)} className="shrink-0 text-ink-300 hover:text-rose-600" aria-label="حذف">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>

            {childrenOf(root.id).length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-ink-100 pt-3">
                {childrenOf(root.id).map((c) => (
                  <li key={c.id} className="flex items-center gap-2 py-1.5 pr-4 text-[12px]">
                    <CornerDownLeft className="size-3.5 shrink-0 text-ink-300" />
                    <span className="flex-1 text-ink-700">{c.name}</span>
                    <span className="text-ink-400" dir="ltr">{c.slug}</span>
                    <span className="text-ink-500">{toFaDigits(c.products)} کالا</span>
                    {c.products === 0 && (
                      <button onClick={() => remove(c.id)} className="text-ink-300 hover:text-rose-600" aria-label="حذف">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

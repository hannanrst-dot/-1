"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Tag, Power } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice, toFaDigits, formatDate, toEnDigits } from "@/lib/utils";

type Coupon = {
  id: string; code: string; percent: number; maxAmount: number; minCart: number;
  usageLimit: number; usedCount: number; isActive: boolean; expiresAt: string | null;
};

export function AdminCouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ code: "", percent: "", maxAmount: "", minCart: "", usageLimit: "", expiresAt: "" });

  const num = (v: string) => Number(toEnDigits(v).replace(/\D/g, "")) || 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: f.code, percent: num(f.percent), maxAmount: num(f.maxAmount),
        minCart: num(f.minCart), usageLimit: num(f.usageLimit),
        expiresAt: f.expiresAt || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "خطا در ساخت کد تخفیف", "error");
    toast("کد تخفیف ساخته شد");
    setF({ code: "", percent: "", maxAmount: "", minCart: "", usageLimit: "", expiresAt: "" });
    setOpen(false);
    router.refresh();
  };

  const toggle = async (id: string) => {
    await fetch("/api/admin/coupon", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/coupon?id=${id}`, { method: "DELETE" });
    toast("کد تخفیف حذف شد", "info");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <button onClick={() => setOpen((v) => !v)} className="btn-primary">
        <Plus className="size-4" /> ساخت کد تخفیف
      </button>

      {open && (
        <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-white p-4 shadow-card sm:grid-cols-3">
          <div>
            <label className="label">کد تخفیف *</label>
            <input className="input" dir="ltr" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} required placeholder="NOROOZ25" />
          </div>
          <div>
            <label className="label">درصد تخفیف *</label>
            <input className="input" value={f.percent} onChange={(e) => setF({ ...f, percent: e.target.value })} required placeholder="۱۰" />
          </div>
          <div>
            <label className="label">سقف تخفیف (تومان)</label>
            <input className="input" value={f.maxAmount} onChange={(e) => setF({ ...f, maxAmount: e.target.value })} placeholder="۵۰۰۰۰۰ — ۰ یعنی بدون سقف" />
          </div>
          <div>
            <label className="label">حداقل مبلغ سبد</label>
            <input className="input" value={f.minCart} onChange={(e) => setF({ ...f, minCart: e.target.value })} placeholder="۰" />
          </div>
          <div>
            <label className="label">حداکثر دفعات استفاده</label>
            <input className="input" value={f.usageLimit} onChange={(e) => setF({ ...f, usageLimit: e.target.value })} placeholder="۰ یعنی نامحدود" />
          </div>
          <div>
            <label className="label">تاریخ انقضا</label>
            <input className="input" type="date" dir="ltr" value={f.expiresAt} onChange={(e) => setF({ ...f, expiresAt: e.target.value })} />
          </div>
          <div className="flex gap-2 sm:col-span-3">
            <button disabled={busy} className="btn-primary flex-1">{busy ? "در حال ثبت…" : "ساخت کد"}</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">انصراف</button>
          </div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {coupons.map((c) => (
          <div key={c.id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-brand-600" />
                <span className="text-[15px] font-bold text-ink-900" dir="ltr">{c.code}</span>
                <span className={`badge ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500"}`}>
                  {c.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggle(c.id)} className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-brand-600" aria-label="تغییر وضعیت">
                  <Power className="size-4" />
                </button>
                <button onClick={() => remove(c.id)} className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600" aria-label="حذف">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-ink-600">
              <p>درصد: <b className="text-ink-800">{toFaDigits(c.percent)}٪</b></p>
              <p>سقف: <b className="text-ink-800">{c.maxAmount ? formatPrice(c.maxAmount) : "بدون سقف"}</b></p>
              <p>حداقل سبد: <b className="text-ink-800">{c.minCart ? formatPrice(c.minCart) : "ندارد"}</b></p>
              <p>استفاده: <b className="text-ink-800">{toFaDigits(c.usedCount)}{c.usageLimit ? ` از ${toFaDigits(c.usageLimit)}` : ""}</b></p>
              {c.expiresAt && <p className="col-span-2">انقضا: <b className="text-ink-800">{formatDate(c.expiresAt)}</b></p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

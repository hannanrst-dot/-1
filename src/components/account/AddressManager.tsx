"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { toFaDigits, toEnDigits, PROVINCES } from "@/lib/utils";

type Address = {
  id: string; title: string; receiverName: string; phone: string;
  province: string; city: string; postalCode: string; line: string; isDefault: boolean;
};

export function AddressManager({ initial }: { initial: Address[] }) {
  const { toast } = useToast();
  const [list, setList] = useState(initial);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    title: "خانه", receiverName: "", phone: "", province: "تهران",
    city: "", postalCode: "", line: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, phone: toEnDigits(f.phone), postalCode: toEnDigits(f.postalCode) }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "خطا در ثبت آدرس", "error");
    setList((p) => [data, ...p]);
    setOpen(false);
    setF({ title: "خانه", receiverName: "", phone: "", province: "تهران", city: "", postalCode: "", line: "" });
    toast("آدرس جدید ثبت شد");
  };

  const remove = async (id: string) => {
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    setList((p) => p.filter((a) => a.id !== id));
    toast("آدرس حذف شد", "info");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink-900">آدرس‌های من ({toFaDigits(list.length)})</h1>
        <button onClick={() => setOpen((v) => !v)} className="btn-primary">
          <Plus className="size-4" /> آدرس جدید
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-4 shadow-card">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">عنوان</label><input className="input" value={f.title} onChange={set("title")} /></div>
            <div><label className="label">نام تحویل‌گیرنده</label><input className="input" value={f.receiverName} onChange={set("receiverName")} required /></div>
            <div><label className="label">موبایل</label><input className="input" dir="ltr" value={f.phone} onChange={set("phone")} required placeholder="09121234567" /></div>
            <div><label className="label">کد پستی</label><input className="input" dir="ltr" value={f.postalCode} onChange={set("postalCode")} required placeholder="1234567890" /></div>
            <div>
              <label className="label">استان</label>
              <select className="input" value={f.province} onChange={set("province")}>
                {PROVINCES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="label">شهر</label><input className="input" value={f.city} onChange={set("city")} required /></div>
          </div>
          <div><label className="label">نشانی کامل</label><textarea className="input min-h-20" value={f.line} onChange={set("line")} required minLength={10} /></div>
          <div className="flex gap-2">
            <button disabled={busy} className="btn-primary flex-1">{busy ? "در حال ثبت…" : "ذخیره آدرس"}</button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">انصراف</button>
          </div>
        </form>
      )}

      {list.length === 0 && !open ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <MapPin className="mx-auto size-10 text-ink-300" />
          <p className="mt-3 text-[13px] text-ink-500">هنوز آدرسی ثبت نکرده‌اید.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-brand-600" />
                  <span className="text-[13px] font-bold text-ink-800">{a.title}</span>
                  {a.isDefault && <span className="badge bg-emerald-50 text-emerald-700">پیش‌فرض</span>}
                </div>
                <button onClick={() => remove(a.id)} className="text-ink-300 hover:text-rose-600" aria-label="حذف">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-[13px] leading-7 text-ink-600">
                {a.province}، {a.city}، {a.line}
              </p>
              <p className="mt-1 text-[12px] text-ink-400">
                {a.receiverName} — {toFaDigits(a.phone)} — کدپستی {toFaDigits(a.postalCode)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

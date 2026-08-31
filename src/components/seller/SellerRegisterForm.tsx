"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { PROVINCES, toEnDigits } from "@/lib/utils";

export function SellerRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    shopName: "", description: "", nationalId: "", iban: "",
    province: "تهران", city: "", address: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/seller/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, nationalId: toEnDigits(f.nationalId), iban: toEnDigits(f.iban) }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "خطا در ثبت درخواست", "error");
    toast("درخواست فروشندگی شما ثبت شد");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-lg font-bold text-ink-800">
        <Store className="size-5 text-brand-600" /> فرم ثبت‌نام فروشندگان
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">نام فروشگاه *</label>
          <input className="input" value={f.shopName} onChange={set("shopName")} required minLength={3} placeholder="مثلاً: الکترو پارس" />
        </div>

        <div className="sm:col-span-2">
          <label className="label">معرفی کوتاه کسب‌وکار</label>
          <textarea
            className="input min-h-24 resize-y" value={f.description} onChange={set("description")}
            maxLength={600} placeholder="زمینه فعالیت، سابقه و برندهایی که عرضه می‌کنید"
          />
        </div>

        <div>
          <label className="label">کد ملی / شناسه صنفی *</label>
          <input className="input" dir="ltr" value={f.nationalId} onChange={set("nationalId")} required minLength={8} />
        </div>

        <div>
          <label className="label">شماره شبا (برای تسویه)</label>
          <input className="input" dir="ltr" value={f.iban} onChange={set("iban")} placeholder="IR000000000000000000000000" />
        </div>

        <div>
          <label className="label">استان *</label>
          <select className="input" value={f.province} onChange={set("province")}>
            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="label">شهر *</label>
          <input className="input" value={f.city} onChange={set("city")} required />
        </div>

        <div className="sm:col-span-2">
          <label className="label">آدرس محل کسب *</label>
          <textarea className="input min-h-20 resize-y" value={f.address} onChange={set("address")} required minLength={10} />
        </div>
      </div>

      <p className="rounded-xl bg-ink-50 p-3 text-[12px] leading-6 text-ink-500">
        با ثبت این فرم، صحت اطلاعات واردشده و تعهد به عرضه کالای اصل و دارای گارانتی معتبر را می‌پذیرید.
        درخواست شما پس از بررسی کارشناسان تأیید یا رد خواهد شد.
      </p>

      <button disabled={busy} className="btn-primary w-full py-3">
        {busy && <Loader2 className="size-4 animate-spin" />} ارسال درخواست فروشندگی
      </button>
    </form>
  );
}

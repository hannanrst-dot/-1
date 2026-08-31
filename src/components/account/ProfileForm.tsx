"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { toEnDigits } from "@/lib/utils";

export function ProfileForm({ user }: { user: { name: string; email: string; phone: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [f, setF] = useState({ name: user.name, phone: user.phone, password: "", newPassword: "" });
  const [busy, setBusy] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, phone: toEnDigits(f.phone) }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "خطا در ذخیره اطلاعات", "error");
    toast("اطلاعات حساب به‌روزرسانی شد");
    setF((p) => ({ ...p, password: "", newPassword: "" }));
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink-900">اطلاعات حساب کاربری</h1>
      <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">نام و نام خانوادگی</label>
            <input className="input" value={f.name} onChange={set("name")} required minLength={3} />
          </div>
          <div>
            <label className="label">ایمیل</label>
            <input className="input bg-ink-50" dir="ltr" value={user.email} disabled />
          </div>
          <div>
            <label className="label">شماره موبایل</label>
            <input className="input" dir="ltr" value={f.phone} onChange={set("phone")} placeholder="09121234567" />
          </div>
        </div>

        <div className="border-t border-ink-100 pt-4">
          <h2 className="mb-3 text-sm font-bold text-ink-800">تغییر رمز عبور</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">رمز عبور فعلی</label>
              <input className="input" type="password" dir="ltr" value={f.password} onChange={set("password")} />
            </div>
            <div>
              <label className="label">رمز عبور جدید</label>
              <input className="input" type="password" dir="ltr" value={f.newPassword} onChange={set("newPassword")} minLength={6} />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-ink-400">
            اگر قصد تغییر رمز ندارید، این دو فیلد را خالی بگذارید.
          </p>
        </div>

        <button disabled={busy} className="btn-primary">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} ذخیره تغییرات
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { LogoMark } from "@/components/ui/LogoMark";
import { SITE } from "@/lib/site";
import { toEnDigits } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", identifier: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? { identifier: toEnDigits(form.identifier), password: form.password }
        : {
            name: form.name,
            email: form.email.toLowerCase().trim(),
            phone: toEnDigits(form.phone),
            password: form.password,
          };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) return setError(data.error ?? "خطایی رخ داد، دوباره تلاش کنید");

    const dest =
      next || (data.role === "ADMIN" ? "/admin" : data.role === "SELLER" ? "/seller" : "/account");
    router.push(dest);
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="card p-6 lg:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white">
            <LogoMark className="size-7" />
          </span>
          <h1 className="text-lg font-bold text-ink-900">
            {mode === "login" ? `ورود به ${SITE.name}` : "ساخت حساب کاربری"}
          </h1>
          <p className="text-[13px] text-ink-500">
            {mode === "login"
              ? "برای ادامه، وارد حساب کاربری خود شوید"
              : "در کمتر از یک دقیقه ثبت‌نام کنید"}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" ? (
            <>
              <div>
                <label className="label">نام و نام خانوادگی</label>
                <input className="input" value={form.name} onChange={set("name")} required minLength={3} placeholder="مثلاً علی رضایی" />
              </div>
              <div>
                <label className="label">ایمیل</label>
                <input className="input" type="email" dir="ltr" value={form.email} onChange={set("email")} required placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">شماره موبایل <span className="text-ink-400">(اختیاری)</span></label>
                <input className="input" dir="ltr" value={form.phone} onChange={set("phone")} placeholder="09121234567" inputMode="numeric" />
              </div>
            </>
          ) : (
            <div>
              <label className="label">ایمیل یا شماره موبایل</label>
              <input className="input" dir="ltr" value={form.identifier} onChange={set("identifier")} required placeholder="you@example.com" />
            </div>
          )}

          <div>
            <label className="label">رمز عبور</label>
            <div className="relative">
              <input
                className="input pl-11" type={show ? "text" : "password"} dir="ltr"
                value={form.password} onChange={set("password")} required minLength={6}
                placeholder="********"
              />
              <button
                type="button" onClick={() => setShow((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                aria-label={show ? "مخفی کردن رمز" : "نمایش رمز"}
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button disabled={busy} className="btn-primary w-full py-3">
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "login" ? "ورود" : "ثبت‌نام"}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-ink-500">
          {mode === "login" ? (
            <>حساب کاربری ندارید؟ <Link href="/register" className="link font-medium">ثبت‌نام کنید</Link></>
          ) : (
            <>قبلاً ثبت‌نام کرده‌اید؟ <Link href="/login" className="link font-medium">وارد شوید</Link></>
          )}
        </p>
      </div>

      {mode === "login" && (
        <div className="mt-4 rounded-2xl bg-white/70 p-4 text-[12px] leading-6 text-ink-500 shadow-card">
          <p className="mb-1 font-bold text-ink-700">حساب‌های نمونه برای تست:</p>
          <p dir="ltr" className="text-right">admin@shop.ir / admin1234 — مدیر</p>
          <p dir="ltr" className="text-right">seller@shop.ir / seller1234 — فروشنده</p>
          <p dir="ltr" className="text-right">user@shop.ir / user1234 — خریدار</p>
        </div>
      )}
    </div>
  );
}

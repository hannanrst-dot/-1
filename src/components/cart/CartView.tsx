"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Trash2, Minus, Plus, ShoppingBag, Tag, ArrowLeft, Truck } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice, toFaDigits } from "@/lib/utils";
import { SITE } from "@/lib/site";

export function CartView({ loggedIn }: { loggedIn: boolean }) {
  const { items, subtotal, totalDiscount, setQty, remove, ready } = useCart();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) {
    return (
      <div className="container-app py-10">
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-10">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-20 text-center shadow-card">
          <div className="grid size-24 place-items-center rounded-full bg-ink-50 text-ink-300">
            <ShoppingBag className="size-11" />
          </div>
          <h1 className="text-lg font-bold text-ink-800">سبد خرید شما خالی است</h1>
          <p className="max-w-sm text-[13px] text-ink-500">
            می‌توانید از دسته‌بندی‌ها یا جستجو، محصول مورد نظرتان را پیدا کنید.
          </p>
          <Link href="/category/video-intercom" className="btn-primary mt-2">مشاهده آیفون‌های تصویری</Link>
        </div>
      </div>
    );
  }

  const applyCoupon = async () => {
    if (!code.trim()) return;
    setBusy(true);
    const res = await fetch("/api/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim(), subtotal }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setCoupon(null);
      return toast(data.error ?? "کد تخفیف نامعتبر است", "error");
    }
    setCoupon({ code: data.code, discount: data.discount });
    toast(`کد تخفیف اعمال شد — ${formatPrice(data.discount)} تومان`);
  };

  const shipping = subtotal >= SITE.freeShippingThreshold ? 0 : 45000;
  const payable = subtotal - (coupon?.discount ?? 0) + shipping;

  return (
    <div className="container-app py-5">
      <h1 className="mb-4 text-xl font-bold text-ink-900">
        سبد خرید <span className="text-[13px] font-normal text-ink-400">({toFaDigits(items.length)} کالا)</span>
      </h1>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={`${it.productId}-${it.variantId ?? ""}`} className="flex gap-4 rounded-2xl bg-white p-4 shadow-card">
              <Link href={`/product/${it.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-ink-50 sm:size-28">
                {it.image && <Image src={it.image} alt={it.title} fill className="object-cover" sizes="112px" />}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/product/${it.slug}`} className="line-clamp-2-fa text-[13px] font-medium leading-6 text-ink-800 hover:text-brand-600 sm:text-sm">
                  {it.title}
                </Link>
                <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-ink-500">
                  {it.variantLabel && <span>{it.variantLabel}</span>}
                  {it.sellerName && <span>فروشنده: {it.sellerName}</span>}
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                  <div className="flex items-center gap-1 rounded-xl border border-ink-200">
                    <button onClick={() => setQty(it.productId, Math.min(it.qty + 1, it.maxStock), it.variantId)} disabled={it.qty >= it.maxStock} className="grid size-8 place-items-center text-brand-600 disabled:opacity-30" aria-label="افزایش">
                      <Plus className="size-4" />
                    </button>
                    <span className="min-w-7 text-center text-sm font-medium">{toFaDigits(it.qty)}</span>
                    <button
                      onClick={() => it.qty === 1 ? remove(it.productId, it.variantId) : setQty(it.productId, it.qty - 1, it.variantId)}
                      className="grid size-8 place-items-center text-ink-500" aria-label="کاهش"
                    >
                      {it.qty === 1 ? <Trash2 className="size-4 text-rose-500" /> : <Minus className="size-4" />}
                    </button>
                  </div>

                  <div className="text-left">
                    {it.basePrice > it.price && (
                      <div className="text-[11px] text-ink-400 line-through">{formatPrice(it.basePrice * it.qty)}</div>
                    )}
                    <div className="text-[15px] font-bold text-ink-900">
                      {formatPrice(it.price * it.qty)} <span className="text-[10px] font-normal text-ink-500">تومان</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 lg:sticky lg:top-[136px] lg:self-start">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-800">
              <Tag className="size-4 text-brand-600" /> کد تخفیف
            </h2>
            <div className="flex gap-2">
              <input
                className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="مثلاً WELCOME10" dir="ltr"
              />
              <button onClick={applyCoupon} disabled={busy} className="btn-outline shrink-0 px-4">اعمال</button>
            </div>
            {coupon && (
              <p className="mt-2 text-[12px] text-emerald-600">
                کد {coupon.code} اعمال شد — {formatPrice(coupon.discount)} تومان تخفیف
              </p>
            )}
          </div>

          <div className="space-y-3 rounded-2xl bg-white p-4 shadow-card">
            <div className="flex justify-between text-[13px]">
              <span className="text-ink-600">قیمت کالاها ({toFaDigits(items.reduce((s, i) => s + i.qty, 0))})</span>
              <span className="text-ink-800">{formatPrice(subtotal + totalDiscount)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-[13px] text-brand-600">
                <span>تخفیف کالاها</span>
                <span>{formatPrice(totalDiscount)}−</span>
              </div>
            )}
            {coupon && (
              <div className="flex justify-between text-[13px] text-emerald-600">
                <span>کد تخفیف</span>
                <span>{formatPrice(coupon.discount)}−</span>
              </div>
            )}
            <div className="flex justify-between text-[13px]">
              <span className="flex items-center gap-1 text-ink-600"><Truck className="size-4" /> هزینه ارسال</span>
              <span className={shipping === 0 ? "text-emerald-600" : "text-ink-800"}>
                {shipping === 0 ? "رایگان" : formatPrice(shipping)}
              </span>
            </div>

            {shipping > 0 && (
              <p className="rounded-lg bg-sky-50 px-3 py-2 text-[11px] leading-5 text-sky-700">
                با {formatPrice(SITE.freeShippingThreshold - subtotal)} تومان خرید بیشتر، ارسال شما رایگان می‌شود.
              </p>
            )}

            <div className="flex items-center justify-between border-t border-ink-100 pt-3">
              <span className="text-[13px] font-medium text-ink-700">مبلغ قابل پرداخت</span>
              <span className="text-lg font-bold text-ink-900">
                {formatPrice(payable)} <span className="text-[11px] font-normal text-ink-500">تومان</span>
              </span>
            </div>

            {loggedIn ? (
              <Link
                href={`/checkout${coupon ? `?coupon=${coupon.code}` : ""}`}
                className="btn-primary w-full py-3.5"
              >
                ادامه فرآیند خرید <ArrowLeft className="size-4" />
              </Link>
            ) : (
              <Link href="/login?next=/checkout" className="btn-primary w-full py-3.5">
                ورود و تکمیل خرید
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

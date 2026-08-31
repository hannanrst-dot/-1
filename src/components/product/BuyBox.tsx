"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Check, Store, ShieldCheck, Truck, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice, toFaDigits } from "@/lib/utils";
import { Price } from "@/components/ui/Price";

type Variant = { id: string; name: string; value: string; colorHex: string | null; priceDiff: number; stock: number };

export function BuyBox({
  productId, title, slug, image, price, discountPercent, stock, variants,
  sellerName, sellerSlug, sellerRating, warranty,
}: {
  productId: string; title: string; slug: string; image: string | null;
  price: number; discountPercent: number; stock: number; variants: Variant[];
  sellerName: string; sellerSlug: string; sellerRating: number; warranty: string | null;
}) {
  const { add } = useCart();
  const { toast } = useToast();
  const [variant, setVariant] = useState<Variant | null>(variants[0] ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const basePrice = price + (variant?.priceDiff ?? 0);
  const unit = Math.round((basePrice * (100 - discountPercent)) / 100);
  const available = variants.length > 0 ? (variant?.stock ?? 0) : stock;

  const submit = () => {
    if (available < 1) return;
    add({
      productId, variantId: variant?.id ?? null,
      variantLabel: variant ? `${variant.name}: ${variant.value}` : null,
      title, slug, image, price: unit, basePrice,
      qty, maxStock: available, sellerName,
    });
    setAdded(true);
    toast("محصول به سبد خرید اضافه شد");
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-card lg:sticky lg:top-[136px]">
      {variants.length > 0 && (
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-700">
            {variants[0].name}: <span className="text-ink-500">{variant?.value}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => { setVariant(v); setQty(1); }}
                disabled={v.stock < 1}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] transition-colors disabled:opacity-40 ${
                  variant?.id === v.id ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600 hover:border-brand-300"
                }`}
              >
                {v.colorHex && (
                  <span className="size-4 rounded-full border border-ink-200" style={{ background: v.colorHex }} />
                )}
                {v.value}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 rounded-xl bg-ink-50 p-3 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-ink-600"><Store className="size-4" /> فروشنده</span>
          <Link href={`/seller/shop/${sellerSlug}`} className="font-medium text-ink-800 hover:text-brand-600">
            {sellerName}
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-ink-600"><ShieldCheck className="size-4" /> گارانتی</span>
          <span className="text-ink-800">{warranty || "۱۲ ماه"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-ink-600"><Truck className="size-4" /> ارسال</span>
          <span className="text-ink-800">۲ تا ۵ روز کاری</span>
        </div>
      </div>

      <div className="border-t border-ink-100 pt-3">
        {discountPercent > 0 && (
          <div className="mb-1 flex items-center justify-between">
            <span className="badge bg-brand-600 text-white">{toFaDigits(discountPercent)}٪ تخفیف</span>
            <span className="text-[13px] text-ink-400 line-through">{formatPrice(basePrice)}</span>
          </div>
        )}
        <div className="flex items-end justify-between">
          <span className="text-[13px] text-ink-500">قیمت نهایی</span>
          <Price value={unit} size="lg" />
        </div>
      </div>

      {available > 0 ? (
        <>
          <div className="flex items-center justify-between rounded-xl border border-ink-200 px-3 py-2">
            <span className="text-[13px] text-ink-600">تعداد</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty((q) => Math.min(q + 1, available))} className="grid size-7 place-items-center rounded-lg bg-ink-50 text-brand-600 disabled:opacity-30" disabled={qty >= available} aria-label="افزایش">
                <Plus className="size-4" />
              </button>
              <span className="min-w-6 text-center font-medium">{toFaDigits(qty)}</span>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-7 place-items-center rounded-lg bg-ink-50 text-ink-500 disabled:opacity-30" disabled={qty <= 1} aria-label="کاهش">
                <Minus className="size-4" />
              </button>
            </div>
          </div>

          {available <= 5 && (
            <p className="text-center text-[12px] font-medium text-brand-600">
              تنها {toFaDigits(available)} عدد در انبار باقی مانده است
            </p>
          )}

          <button onClick={submit} className={`w-full py-3.5 text-[15px] ${added ? "btn bg-emerald-500 text-white" : "btn-primary"}`}>
            {added ? <><Check className="size-5" /> به سبد اضافه شد</> : <><ShoppingCart className="size-5" /> افزودن به سبد خرید</>}
          </button>
          <Link href="/cart" className="btn-outline w-full">مشاهده سبد خرید</Link>
        </>
      ) : (
        <div className="rounded-xl bg-ink-50 p-4 text-center">
          <p className="font-bold text-ink-700">این کالا موجود نیست</p>
          <p className="mt-1 text-[12px] text-ink-500">برای اطلاع از موجود شدن با ما تماس بگیرید</p>
        </div>
      )}
    </div>
  );
}

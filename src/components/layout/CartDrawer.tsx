"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice, toFaDigits } from "@/lib/utils";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, subtotal, totalDiscount, setQty, remove } = useCart();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/40" onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col bg-ink-50">
        <div className="flex items-center justify-between border-b border-ink-100 bg-white px-4 py-4">
          <h2 className="flex items-center gap-2 font-bold text-ink-900">
            <ShoppingBag className="size-5 text-brand-600" />
            سبد خرید {items.length > 0 && `(${toFaDigits(items.length)})`}
          </h2>
          <button onClick={onClose} aria-label="بستن" className="grid size-9 place-items-center rounded-lg hover:bg-ink-100">
            <X className="size-5 text-ink-500" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="grid size-20 place-items-center rounded-full bg-white text-ink-300">
              <ShoppingBag className="size-9" />
            </div>
            <p className="font-bold text-ink-800">سبد خرید شما خالی است</p>
            <p className="text-sm text-ink-500">از جدیدترین آیفون‌های تصویری دیدن کنید</p>
            <Link href="/category/video-intercom" onClick={onClose} className="btn-primary mt-2">
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {items.map((it) => (
                <div key={`${it.productId}-${it.variantId ?? ""}`} className="flex gap-3 rounded-xl bg-white p-3">
                  <Link href={`/product/${it.slug}`} onClick={onClose} className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    {it.image ? (
                      <Image src={it.image} alt={it.title} fill className="object-contain p-1" sizes="80px" />
                    ) : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${it.slug}`} onClick={onClose} className="line-clamp-2-fa text-[13px] font-medium leading-6 text-ink-800 hover:text-brand-600">
                      {it.title}
                    </Link>
                    {it.variantLabel && (
                      <p className="mt-1 text-[11px] text-ink-500">{it.variantLabel}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-lg border border-ink-200">
                        <button
                          onClick={() => setQty(it.productId, it.qty + 1, it.variantId)}
                          disabled={it.qty >= it.maxStock}
                          className="grid size-7 place-items-center text-brand-600 disabled:opacity-30"
                          aria-label="افزایش"
                        >
                          <Plus className="size-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-medium">{toFaDigits(it.qty)}</span>
                        <button
                          onClick={() =>
                            it.qty === 1 ? remove(it.productId, it.variantId) : setQty(it.productId, it.qty - 1, it.variantId)
                          }
                          className="grid size-7 place-items-center text-ink-500"
                          aria-label="کاهش"
                        >
                          {it.qty === 1 ? <Trash2 className="size-3.5 text-rose-500" /> : <Minus className="size-3.5" />}
                        </button>
                      </div>
                      <span className="text-sm font-bold text-ink-900">
                        {formatPrice(it.price * it.qty)}
                        <span className="mr-1 text-[10px] font-normal text-ink-500">تومان</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-ink-100 bg-white p-4">
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-brand-600">
                  <span>سود شما از خرید</span>
                  <span className="font-bold">{formatPrice(totalDiscount)} تومان</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-ink-600">مبلغ قابل پرداخت</span>
                <span className="text-lg font-bold text-ink-900">
                  {formatPrice(subtotal)} <span className="text-xs font-normal">تومان</span>
                </span>
              </div>
              <Link href="/cart" onClick={onClose} className="btn-primary w-full py-3">
                تکمیل خرید
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

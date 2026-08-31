"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { finalPrice, formatPrice, parseJSON, toFaDigits } from "@/lib/utils";
import { Stars } from "@/components/ui/Stars";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";

export type ProductCardData = {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPercent: number;
  images: string;
  stock: number;
  rating: number;
  ratingCount: number;
  hasMemory?: boolean;
  screenSize?: string | null;
  brand?: { name: string } | null;
  seller?: { shopName: string } | null;
};

export function ProductCard({ p, compact = false }: { p: ProductCardData; compact?: boolean }) {
  const imgs = parseJSON<string[]>(p.images, []);
  const img = imgs[0] ?? null;
  const price = finalPrice(p.price, p.discountPercent);
  const { add } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);
  const [fav, setFav] = useState(false);

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (p.stock < 1) return;
    add({
      productId: p.id,
      title: p.title,
      slug: p.slug,
      image: img,
      price,
      basePrice: p.price,
      qty: 1,
      maxStock: p.stock,
      sellerName: p.seller?.shopName ?? "",
    });
    setAdded(true);
    toast("محصول به سبد خرید اضافه شد");
    setTimeout(() => setAdded(false), 1800);
  };

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: p.id }),
    });
    if (res.status === 401) return toast("برای افزودن به علاقه‌مندی‌ها وارد شوید", "error");
    const data = await res.json();
    setFav(data.added);
    toast(data.added ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد", "info");
  };

  return (
    <Link
      href={`/product/${p.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop"
    >
      <div className="relative aspect-square overflow-hidden bg-ink-50">
        {img ? (
          <Image
            src={img}
            alt={p.title}
            fill
            sizes="(max-width:768px) 50vw, 240px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-300">بدون تصویر</div>
        )}

        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          {p.discountPercent > 0 && (
            <span className="rounded-lg bg-brand-600 px-2 py-1 text-[11px] font-bold text-white shadow">
              {toFaDigits(p.discountPercent)}٪
            </span>
          )}
          {p.hasMemory && (
            <span className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow">
              حافظه‌دار
            </span>
          )}
        </div>

        <button
          onClick={toggleFav}
          className="absolute left-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-ink-400 opacity-0 shadow transition-all hover:text-brand-600 group-hover:opacity-100"
          aria-label="افزودن به علاقه‌مندی"
        >
          <Heart className={`size-4 ${fav ? "fill-brand-600 text-brand-600" : ""}`} />
        </button>

        {p.stock < 1 && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <span className="rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-bold text-white">
              ناموجود
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {p.brand && (
          <span className="text-[11px] font-medium text-ink-400">{p.brand.name}</span>
        )}
        <h3 className="line-clamp-2-fa min-h-[42px] text-[13px] font-medium leading-[21px] text-ink-800 group-hover:text-brand-600">
          {p.title}
        </h3>

        {!compact && (
          <div className="flex items-center gap-2 text-[11px] text-ink-400">
            {p.ratingCount > 0 && <Stars rating={p.rating} count={p.ratingCount} size={12} />}
            {p.screenSize && <span className="rounded bg-ink-50 px-1.5 py-0.5">{p.screenSize}</span>}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            {p.discountPercent > 0 && (
              <div className="text-[11px] text-ink-400 line-through">{formatPrice(p.price)}</div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-[15px] font-bold text-ink-900">{formatPrice(price)}</span>
              <span className="text-[10px] text-ink-500">تومان</span>
            </div>
          </div>
          <button
            onClick={quickAdd}
            disabled={p.stock < 1}
            className={`grid size-9 shrink-0 place-items-center rounded-xl transition-colors ${
              added ? "bg-emerald-500 text-white" : "bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white"
            } disabled:opacity-40`}
            aria-label="افزودن به سبد"
          >
            {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
          </button>
        </div>
      </div>
    </Link>
  );
}

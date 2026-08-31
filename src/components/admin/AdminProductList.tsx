"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Eye, EyeOff, Store } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice, toFaDigits, formatDate, finalPrice, PRODUCT_STATUS } from "@/lib/utils";

type Row = {
  id: string; title: string; slug: string; image: string | null;
  price: number; discountPercent: number; stock: number; status: string;
  isActive: boolean; createdAt: string; seller: string; category: string;
};

export function AdminProductList({ products }: { products: Row[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const counts = {
    ALL: products.length,
    PENDING: products.filter((p) => p.status === "PENDING").length,
    APPROVED: products.filter((p) => p.status === "APPROVED").length,
    REJECTED: products.filter((p) => p.status === "REJECTED").length,
  };
  const rows = filter === "ALL" ? products : products.filter((p) => p.status === filter);

  const act = async (id: string, action: string, rejectNote?: string) => {
    const res = await fetch("/api/admin/product", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, note: rejectNote }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return toast(d.error ?? "خطا در انجام عملیات", "error");
    }
    setRejecting(null);
    setNote("");
    toast(action === "approve" ? "محصول تأیید شد" : action === "reject" ? "محصول رد شد" : "وضعیت نمایش تغییر کرد");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-2xl bg-white p-1.5 shadow-card">
        {([
          ["PENDING", "در انتظار تأیید"],
          ["APPROVED", "تأیید شده"],
          ["REJECTED", "رد شده"],
          ["ALL", "همه"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`flex-1 rounded-xl px-2 py-2 text-[12px] transition-colors sm:text-[13px] ${
              filter === id ? "bg-brand-50 font-medium text-brand-700" : "text-ink-500 hover:bg-ink-50"
            }`}
          >
            {label} ({toFaDigits(counts[id])})
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-white p-12 text-center text-[13px] text-ink-500 shadow-card">
          موردی در این دسته وجود ندارد.
        </p>
      ) : (
        rows.map((p) => (
          <div key={p.id} className="rounded-2xl bg-white p-3 shadow-card">
            <div className="flex gap-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                {p.image && <Image src={p.image} alt={p.title} fill className="object-cover" sizes="80px" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Link href={`/product/${p.slug}`} className="line-clamp-2-fa flex-1 text-[13px] font-medium leading-6 text-ink-800 hover:text-brand-600">
                    {p.title}
                  </Link>
                  <span className={`badge shrink-0 ${PRODUCT_STATUS[p.status].color}`}>
                    {PRODUCT_STATUS[p.status].label}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-500">
                  <span className="flex items-center gap-1"><Store className="size-3" /> {p.seller}</span>
                  <span>{p.category}</span>
                  <span className="font-medium text-ink-800">
                    {formatPrice(finalPrice(p.price, p.discountPercent))} تومان
                  </span>
                  <span>موجودی: {toFaDigits(p.stock)}</span>
                  <span>{formatDate(p.createdAt)}</span>
                  {!p.isActive && <span className="text-rose-600">مخفی</span>}
                </div>
              </div>
            </div>

            {rejecting === p.id ? (
              <div className="mt-3 space-y-2 border-t border-ink-100 pt-3">
                <textarea
                  className="input min-h-16 resize-y text-[13px]" value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="دلیل رد محصول را بنویسید (برای فروشنده نمایش داده می‌شود)"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={() => act(p.id, "reject", note)} className="btn bg-rose-600 py-2 text-xs text-white">
                    ثبت رد محصول
                  </button>
                  <button onClick={() => { setRejecting(null); setNote(""); }} className="btn-ghost py-2 text-xs">
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
                {p.status !== "APPROVED" && (
                  <button onClick={() => act(p.id, "approve")} className="btn bg-emerald-600 py-2 text-xs text-white hover:bg-emerald-700">
                    <Check className="size-3.5" /> تأیید محصول
                  </button>
                )}
                {p.status !== "REJECTED" && (
                  <button onClick={() => setRejecting(p.id)} className="btn-outline py-2 text-xs text-rose-600">
                    <X className="size-3.5" /> رد محصول
                  </button>
                )}
                {p.status === "APPROVED" && (
                  <button onClick={() => act(p.id, "toggle")} className="btn-ghost py-2 text-xs">
                    {p.isActive ? <><EyeOff className="size-3.5" /> مخفی کردن</> : <><Eye className="size-3.5" /> نمایش دادن</>}
                  </button>
                )}
                <Link href={`/product/${p.slug}`} className="btn-ghost py-2 text-xs">
                  <Eye className="size-3.5" /> مشاهده صفحه
                </Link>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

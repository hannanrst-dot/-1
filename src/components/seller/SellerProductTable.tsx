"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, AlertCircle } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice, toFaDigits, finalPrice, PRODUCT_STATUS } from "@/lib/utils";

type Row = {
  id: string; title: string; slug: string; image: string | null;
  price: number; discountPercent: number; stock: number; sold: number;
  status: string; rejectNote: string | null; isActive: boolean; category: string;
};

export function SellerProductTable({ products }: { products: Row[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"ALL" | "APPROVED" | "PENDING" | "REJECTED">("ALL");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const rows = filter === "ALL" ? products : products.filter((p) => p.status === filter);

  const counts = {
    ALL: products.length,
    APPROVED: products.filter((p) => p.status === "APPROVED").length,
    PENDING: products.filter((p) => p.status === "PENDING").length,
    REJECTED: products.filter((p) => p.status === "REJECTED").length,
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setPendingDelete(null);
    if (!res.ok) return toast(data.error ?? "خطا در حذف محصول", "error");
    toast(data.archived ? "محصول به دلیل سابقه فروش، غیرفعال شد" : "محصول حذف شد", "info");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-2xl bg-white p-1.5 shadow-card">
        {([
          ["ALL", "همه"],
          ["APPROVED", "تأیید شده"],
          ["PENDING", "در انتظار تأیید"],
          ["REJECTED", "رد شده"],
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

      <div className="space-y-2">
        {rows.map((p) => {
          const status = PRODUCT_STATUS[p.status];
          return (
            <div key={p.id} className="rounded-2xl bg-white p-3 shadow-card">
              <div className="flex gap-3">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                  {p.image && <Image src={p.image} alt={p.title} fill className="object-cover" sizes="80px" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="line-clamp-2-fa flex-1 text-[13px] font-medium leading-6 text-ink-800">
                      {p.title}
                    </h3>
                    <span className={`badge shrink-0 ${status.color}`}>{status.label}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-500">
                    <span>{p.category}</span>
                    <span>
                      قیمت: <b className="text-ink-800">{formatPrice(finalPrice(p.price, p.discountPercent))}</b>
                      {p.discountPercent > 0 && <span className="mr-1 text-brand-600">({toFaDigits(p.discountPercent)}٪)</span>}
                    </span>
                    <span className={p.stock < 1 ? "text-rose-600" : ""}>
                      موجودی: {toFaDigits(p.stock)}
                    </span>
                    <span>فروش: {toFaDigits(p.sold)}</span>
                    {!p.isActive && <span className="text-rose-600">غیرفعال</span>}
                  </div>

                  {p.status === "REJECTED" && p.rejectNote && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-rose-50 px-2.5 py-2 text-[11px] leading-5 text-rose-700">
                      <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> {p.rejectNote}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-2 border-t border-ink-100 pt-3">
                <Link href={`/seller/products/${p.id}`} className="btn-outline flex-1 py-2 text-xs">
                  <Pencil className="size-3.5" /> ویرایش
                </Link>
                {p.status === "APPROVED" && (
                  <Link href={`/product/${p.slug}`} className="btn-ghost py-2 text-xs">
                    <Eye className="size-3.5" /> مشاهده
                  </Link>
                )}
                {pendingDelete === p.id ? (
                  <>
                    <button onClick={() => remove(p.id)} className="btn bg-rose-600 py-2 text-xs text-white">
                      تأیید حذف
                    </button>
                    <button onClick={() => setPendingDelete(null)} className="btn-ghost py-2 text-xs">
                      انصراف
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setPendingDelete(p.id)}
                    className="btn-ghost py-2 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="size-3.5" /> حذف
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Phone, User } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice, toFaDigits, formatDate, ORDER_STATUS } from "@/lib/utils";

type Item = {
  id: string; title: string; image: string | null; variant: string | null;
  price: number; qty: number; status: string; orderCode: string; orderStatus: string;
  createdAt: string; customer: string; phone: string; city: string; address: string;
};

const NEXT_STATUS: Record<string, { next: string; label: string } | undefined> = {
  PENDING: { next: "PROCESSING", label: "شروع آماده‌سازی" },
  PROCESSING: { next: "SHIPPED", label: "ثبت ارسال مرسوله" },
  SHIPPED: { next: "DELIVERED", label: "تحویل شد" },
};

export function SellerOrderTable({ items }: { items: Item[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const advance = async (id: string, status: string) => {
    setBusy(id);
    const res = await fetch(`/api/seller/order-item/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return toast(d.error ?? "خطا در به‌روزرسانی وضعیت", "error");
    }
    toast("وضعیت سفارش به‌روزرسانی شد");
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {items.map((it) => {
        const status = ORDER_STATUS[it.status] ?? ORDER_STATUS.PENDING;
        const next = NEXT_STATUS[it.status];
        const expanded = open === it.id;

        return (
          <div key={it.id} className="rounded-2xl bg-white shadow-card">
            <button
              onClick={() => setOpen(expanded ? null : it.id)}
              className="flex w-full items-center gap-3 p-3 text-right"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                {it.image && <Image src={it.image} alt={it.title} fill className="object-cover" sizes="64px" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2-fa text-[13px] font-medium leading-6 text-ink-800">{it.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
                  <span dir="ltr">{it.orderCode}</span>
                  <span>{formatDate(it.createdAt)}</span>
                  <span>تعداد: {toFaDigits(it.qty)}</span>
                </div>
              </div>
              <div className="shrink-0 text-left">
                <span className={`badge ${status.color}`}>{status.label}</span>
                <p className="mt-1.5 text-[13px] font-bold text-ink-900">
                  {formatPrice(it.price * it.qty)}
                </p>
              </div>
              <ChevronDown className={`size-4 shrink-0 text-ink-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>

            {expanded && (
              <div className="space-y-3 border-t border-ink-100 p-4">
                <div className="grid gap-2 text-[12px] text-ink-600 sm:grid-cols-2">
                  <p className="flex items-center gap-1.5"><User className="size-3.5 text-ink-400" /> {it.customer}</p>
                  <p className="flex items-center gap-1.5"><Phone className="size-3.5 text-ink-400" /> <span dir="ltr">{toFaDigits(it.phone)}</span></p>
                  <p className="flex items-start gap-1.5 sm:col-span-2">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-400" />
                    <span className="leading-6">{it.city} — {it.address}</span>
                  </p>
                  {it.variant && <p className="text-ink-500">تنوع: {it.variant}</p>}
                </div>

                {next && (
                  <button
                    onClick={() => advance(it.id, next.next)}
                    disabled={busy === it.id}
                    className="btn-primary w-full py-2.5 text-[13px]"
                  >
                    {busy === it.id ? "در حال ثبت…" : next.label}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

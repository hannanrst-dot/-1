"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, User, Phone, MapPin, Truck } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { formatPrice, toFaDigits, formatDateTime, ORDER_STATUS } from "@/lib/utils";

type Order = {
  id: string; code: string; status: string; total: number; subtotal: number;
  discount: number; shippingCost: number; paymentMethod: string;
  trackingCode: string | null; createdAt: string; customer: string; email: string;
  receiver: string; phone: string; address: string;
  items: { id: string; title: string; qty: number; price: number; image: string | null }[];
};

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"];

export function AdminOrderList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [tracking, setTracking] = useState("");

  const rows = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const update = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return toast(d.error ?? "خطا در به‌روزرسانی", "error");
    }
    toast("سفارش به‌روزرسانی شد");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-card">
        <button
          onClick={() => setFilter("ALL")}
          className={`shrink-0 rounded-xl px-3 py-2 text-[13px] ${filter === "ALL" ? "bg-brand-50 font-medium text-brand-700" : "text-ink-500"}`}
        >
          همه ({toFaDigits(orders.length)})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 rounded-xl px-3 py-2 text-[13px] ${filter === s ? "bg-brand-50 font-medium text-brand-700" : "text-ink-500"}`}
          >
            {ORDER_STATUS[s].label} ({toFaDigits(orders.filter((o) => o.status === s).length)})
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-white p-12 text-center text-[13px] text-ink-500 shadow-card">
          سفارشی در این وضعیت وجود ندارد.
        </p>
      ) : (
        rows.map((o) => {
          const expanded = open === o.id;
          return (
            <div key={o.id} className="rounded-2xl bg-white shadow-card">
              <button
                onClick={() => { setOpen(expanded ? null : o.id); setTracking(o.trackingCode ?? ""); }}
                className="flex w-full flex-wrap items-center gap-3 p-4 text-right"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-bold text-ink-800" dir="ltr">{o.code}</span>
                    <span className={`badge ${ORDER_STATUS[o.status].color}`}>{ORDER_STATUS[o.status].label}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-500">
                    {o.customer} — {formatDateTime(o.createdAt)} — {toFaDigits(o.items.length)} کالا
                  </p>
                </div>
                <span className="shrink-0 text-[14px] font-bold text-ink-900">{formatPrice(o.total)}</span>
                <ChevronDown className={`size-4 shrink-0 text-ink-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>

              {expanded && (
                <div className="space-y-4 border-t border-ink-100 p-4">
                  <div className="grid gap-2 text-[12px] text-ink-600 sm:grid-cols-2">
                    <p className="flex items-center gap-1.5"><User className="size-3.5 text-ink-400" /> {o.receiver || o.customer}</p>
                    <p className="flex items-center gap-1.5"><Phone className="size-3.5 text-ink-400" /> <span dir="ltr">{toFaDigits(o.phone)}</span></p>
                    <p className="flex items-start gap-1.5 sm:col-span-2">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-400" />
                      <span className="leading-6">{o.address}</span>
                    </p>
                  </div>

                  <ul className="divide-y divide-ink-100 rounded-xl bg-ink-50 p-2">
                    {o.items.map((it) => (
                      <li key={it.id} className="flex items-center gap-2 py-2">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-white">
                          {it.image && <Image src={it.image} alt={it.title} fill className="object-cover" sizes="44px" />}
                        </div>
                        <p className="line-clamp-2-fa flex-1 text-[12px] leading-5 text-ink-700">{it.title}</p>
                        <span className="shrink-0 text-[11px] text-ink-500">×{toFaDigits(it.qty)}</span>
                        <span className="shrink-0 text-[12px] font-medium text-ink-800">{formatPrice(it.price * it.qty)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="grid gap-2 text-[12px] sm:grid-cols-4">
                    <p className="text-ink-500">جمع کالاها: <b className="text-ink-800">{formatPrice(o.subtotal)}</b></p>
                    <p className="text-ink-500">تخفیف: <b className="text-emerald-600">{formatPrice(o.discount)}</b></p>
                    <p className="text-ink-500">ارسال: <b className="text-ink-800">{formatPrice(o.shippingCost)}</b></p>
                    <p className="text-ink-500">پرداخت: <b className="text-ink-800">{o.paymentMethod === "COD" ? "در محل" : "اینترنتی"}</b></p>
                  </div>

                  <div className="grid gap-2 border-t border-ink-100 pt-3 sm:grid-cols-2">
                    <div>
                      <label className="label">تغییر وضعیت سفارش</label>
                      <select
                        className="input" value={o.status}
                        onChange={(e) => update(o.id, { status: e.target.value })}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{ORDER_STATUS[s].label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">کد رهگیری مرسوله</label>
                      <div className="flex gap-2">
                        <input
                          className="input" dir="ltr" value={tracking}
                          onChange={(e) => setTracking(e.target.value)}
                          placeholder="مثلاً 1234567890"
                        />
                        <button onClick={() => update(o.id, { trackingCode: tracking })} className="btn-outline shrink-0 px-3">
                          <Truck className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

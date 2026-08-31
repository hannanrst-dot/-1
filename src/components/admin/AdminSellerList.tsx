"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Store, Mail, Phone, MapPin, Package, ExternalLink } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { toFaDigits, formatDate } from "@/lib/utils";

type Row = {
  id: string; shopName: string; slug: string; status: string;
  description: string | null; nationalId: string | null; iban: string | null;
  province: string | null; city: string | null; address: string | null;
  createdAt: string; products: number; userName: string; email: string; phone: string;
};

const STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار بررسی", color: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "تأیید شده", color: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "رد شده", color: "bg-rose-100 text-rose-700" },
};

export function AdminSellerList({ sellers }: { sellers: Row[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const counts = {
    ALL: sellers.length,
    PENDING: sellers.filter((s) => s.status === "PENDING").length,
    APPROVED: sellers.filter((s) => s.status === "APPROVED").length,
    REJECTED: sellers.filter((s) => s.status === "REJECTED").length,
  };
  const rows = filter === "ALL" ? sellers : sellers.filter((s) => s.status === filter);

  const act = async (id: string, action: string, rejectNote?: string) => {
    const res = await fetch("/api/admin/seller", {
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
    toast(action === "approve" ? "فروشنده تأیید شد" : "درخواست رد شد");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-2xl bg-white p-1.5 shadow-card">
        {([
          ["PENDING", "در انتظار"],
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
        rows.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-950 text-white">
                  <Store className="size-5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-bold text-ink-800">{s.shopName}</h3>
                  <p className="text-[11px] text-ink-500">
                    {s.userName} — ثبت در {formatDate(s.createdAt)}
                  </p>
                </div>
              </div>
              <span className={`badge ${STATUS[s.status].color}`}>{STATUS[s.status].label}</span>
            </div>

            {s.description && (
              <p className="mt-3 rounded-xl bg-ink-50 p-3 text-[12px] leading-6 text-ink-600">{s.description}</p>
            )}

            <div className="mt-3 grid gap-2 text-[12px] text-ink-600 sm:grid-cols-2">
              <p className="flex items-center gap-1.5"><Mail className="size-3.5 text-ink-400" /> <span dir="ltr">{s.email}</span></p>
              {s.phone && <p className="flex items-center gap-1.5"><Phone className="size-3.5 text-ink-400" /> <span dir="ltr">{toFaDigits(s.phone)}</span></p>}
              <p className="flex items-center gap-1.5"><Package className="size-3.5 text-ink-400" /> {toFaDigits(s.products)} محصول</p>
              {s.nationalId && <p className="text-ink-500">کد ملی/صنفی: <span dir="ltr">{toFaDigits(s.nationalId)}</span></p>}
              {s.iban && <p className="text-ink-500 sm:col-span-2">شبا: <span dir="ltr">{s.iban}</span></p>}
              <p className="flex items-start gap-1.5 sm:col-span-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-400" />
                <span className="leading-6">{s.province}، {s.city} — {s.address}</span>
              </p>
            </div>

            {rejecting === s.id ? (
              <div className="mt-3 space-y-2 border-t border-ink-100 pt-3">
                <textarea
                  className="input min-h-16 resize-y text-[13px]" value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="دلیل رد درخواست (برای فروشنده نمایش داده می‌شود)"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={() => act(s.id, "reject", note)} className="btn bg-rose-600 py-2 text-xs text-white">
                    ثبت رد درخواست
                  </button>
                  <button onClick={() => { setRejecting(null); setNote(""); }} className="btn-ghost py-2 text-xs">
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
                {s.status !== "APPROVED" && (
                  <button onClick={() => act(s.id, "approve")} className="btn bg-emerald-600 py-2 text-xs text-white hover:bg-emerald-700">
                    <Check className="size-3.5" /> تأیید فروشنده
                  </button>
                )}
                {s.status !== "REJECTED" && (
                  <button onClick={() => setRejecting(s.id)} className="btn-outline py-2 text-xs text-rose-600">
                    <X className="size-3.5" /> رد درخواست
                  </button>
                )}
                {s.status === "APPROVED" && (
                  <Link href={`/seller/shop/${s.slug}`} className="btn-ghost py-2 text-xs">
                    <ExternalLink className="size-3.5" /> مشاهده ویترین
                  </Link>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

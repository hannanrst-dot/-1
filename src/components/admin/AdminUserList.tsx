"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Ban, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { toFaDigits, formatDate } from "@/lib/utils";

type Row = {
  id: string; name: string; email: string; phone: string;
  role: string; isActive: boolean; createdAt: string; orders: number;
};

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  CUSTOMER: { label: "خریدار", color: "bg-ink-100 text-ink-600" },
  SELLER: { label: "فروشنده", color: "bg-sky-100 text-sky-700" },
  ADMIN: { label: "مدیر", color: "bg-brand-100 text-brand-700" },
};

export function AdminUserList({ users, meId }: { users: Row[]; meId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [q, setQ] = useState("");

  const rows = users.filter(
    (u) =>
      !q.trim() ||
      u.name.includes(q) ||
      u.email.includes(q) ||
      u.phone.includes(q)
  );

  const act = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return toast(d.error ?? "خطا در انجام عملیات", "error");
    }
    toast("اطلاعات کاربر به‌روزرسانی شد");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-2xl bg-white px-4 shadow-card">
        <Search className="size-4 text-ink-400" />
        <input
          className="h-12 w-full bg-transparent text-[13px] outline-none"
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو بر اساس نام، ایمیل یا شماره موبایل…"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[720px] text-[13px]">
          <thead>
            <tr className="border-b border-ink-100 text-[12px] text-ink-500">
              <th className="p-3 text-right font-medium">کاربر</th>
              <th className="p-3 text-right font-medium">نقش</th>
              <th className="p-3 text-right font-medium">سفارش‌ها</th>
              <th className="p-3 text-right font-medium">تاریخ عضویت</th>
              <th className="p-3 text-right font-medium">وضعیت</th>
              <th className="p-3 text-right font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-ink-50/50">
                <td className="p-3">
                  <p className="font-medium text-ink-800">{u.name}</p>
                  <p className="text-[11px] text-ink-400" dir="ltr">{u.email}</p>
                  {u.phone && <p className="text-[11px] text-ink-400" dir="ltr">{toFaDigits(u.phone)}</p>}
                </td>
                <td className="p-3">
                  <select
                    className={`rounded-lg border-0 px-2 py-1 text-[12px] font-medium outline-none ${ROLE_LABEL[u.role].color}`}
                    value={u.role}
                    disabled={u.id === meId}
                    onChange={(e) => act(u.id, { action: "role", role: e.target.value })}
                  >
                    <option value="CUSTOMER">خریدار</option>
                    <option value="SELLER">فروشنده</option>
                    <option value="ADMIN">مدیر</option>
                  </select>
                </td>
                <td className="p-3 text-ink-600">{toFaDigits(u.orders)}</td>
                <td className="p-3 text-[12px] text-ink-500">{formatDate(u.createdAt)}</td>
                <td className="p-3">
                  <span className={`badge ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {u.isActive ? "فعال" : "مسدود"}
                  </span>
                </td>
                <td className="p-3">
                  {u.id !== meId && (
                    <button
                      onClick={() => act(u.id, { action: "toggle" })}
                      className={`btn px-2.5 py-1.5 text-[12px] ${u.isActive ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                    >
                      {u.isActive ? <><Ban className="size-3.5" /> مسدود</> : <><CheckCircle2 className="size-3.5" /> فعال‌سازی</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

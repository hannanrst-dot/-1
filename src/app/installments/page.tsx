"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { CalendarClock, Plus, X, BellRing, Phone, MapPin, CheckCircle, ChevronDown, ChevronUp, Trash2, AlertTriangle } from "lucide-react";
import { formatToman, toPersianDigits, toJalaliDate } from "@/lib/persian/utils";

function InstallmentsInner() {
  const sp = useSearchParams();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [detail, setDetail] = useState<Record<number, any[]>>({});
  const [reminding, setReminding] = useState(false);

  // form
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [downPayment, setDownPayment] = useState("0");
  const [count, setCount] = useState(3);
  const [intervalDays, setIntervalDays] = useState(30);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/installments");
      const data = await res.json();
      if (res.ok) setPlans(data.plans || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  // پیش‌پرکردن از روی لینک فاکتور
  useEffect(() => {
    if (sp.get("customer")) setCustomerName(sp.get("customer") || "");
    if (sp.get("phone")) setPhone(sp.get("phone") || "");
    if (sp.get("total")) { setTotalAmount(sp.get("total") || ""); setShowForm(true); }
  }, [sp]);

  const invoiceId = sp.get("invoiceId");
  const invoiceNumber = sp.get("invoiceNumber");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return alert("نام مشتری الزامی است.");
    if (!Number(totalAmount)) return alert("مبلغ کل را وارد کنید.");
    const res = await fetch("/api/installments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName, phone, address, nationalId, totalAmount: Number(totalAmount), downPayment: Number(downPayment) || 0, installmentsCount: count, intervalDays, invoiceId: invoiceId ? Number(invoiceId) : undefined, invoiceNumber }),
    });
    const data = await res.json();
    if (res.ok) {
      setShowForm(false);
      setCustomerName(""); setPhone(""); setAddress(""); setNationalId(""); setTotalAmount(""); setDownPayment("0"); setCount(3);
      fetchPlans();
    } else alert(data.error || "خطا در ثبت.");
  };

  const toggle = async (id: number) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!detail[id]) {
      const res = await fetch(`/api/installments/${id}`);
      const data = await res.json();
      if (res.ok) setDetail((d) => ({ ...d, [id]: data.installments }));
    }
  };

  const payInstallment = async (planId: number, installmentId: number) => {
    const res = await fetch(`/api/installments/${planId}/pay`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ installmentId }) });
    if (res.ok) {
      const d = await fetch(`/api/installments/${planId}`).then((r) => r.json());
      setDetail((prev) => ({ ...prev, [planId]: d.installments }));
      fetchPlans();
    }
  };

  const removePlan = async (id: number) => {
    if (!confirm("این طرح قسطی حذف شود؟")) return;
    await fetch(`/api/installments/${id}`, { method: "DELETE" });
    fetchPlans();
  };

  const runReminders = async () => {
    setReminding(true);
    try {
      const res = await fetch("/api/installments/reminders", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const simulated = (data.notified || []).some((n: any) => n.simulated);
        alert(`${toPersianDigits(data.count)} یادآوری پردازش شد.` + (simulated ? "\n(حالت شبیه‌سازی — برای ارسال واقعی پیامک، کلید سرویس پیامک را در تنظیمات محیطی وارد کنید.)" : ""));
      } else alert(data.error || "خطا");
    } finally { setReminding(false); }
  };

  const statusBadge = (s: string) => {
    if (s === "completed") return <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">تسویه شده</span>;
    if (s === "overdue") return <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">سررسید گذشته</span>;
    return <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">جاری</span>;
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30"><CalendarClock className="w-6 h-6" /></div>
            <div>
              <h1 className="text-xl font-bold">خرید قسطی</h1>
              <p className="text-xs text-gray-500">مدیریت اقساط و مشتریان قسطی</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={runReminders} disabled={reminding} className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-2 rounded-xl text-sm font-bold disabled:opacity-50"><BellRing className="w-4 h-4" /> {reminding ? "..." : "ارسال یادآوری‌ها"}</button>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-bold"><Plus className="w-4 h-4" /> قسط جدید</button>
          </div>
        </div>

        {loading ? <div className="text-center text-gray-400 py-10">در حال بارگذاری...</div> : plans.length === 0 ? (
          <div className="text-center text-gray-400 py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
            <CalendarClock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            هنوز خرید قسطی‌ای ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{p.customerName}</span>
                        {statusBadge(p.computedStatus)}
                        {p.overdue && p.computedStatus !== "completed" && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                      </div>
                      {p.phone && <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {toPersianDigits(p.phone)}</div>}
                    </div>
                    <button onClick={() => removePlan(p.id)} className="text-gray-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl py-2"><div className="text-[11px] text-gray-500">مبلغ کل</div><div className="text-xs font-bold">{formatToman(p.totalAmount)}</div></div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl py-2"><div className="text-[11px] text-gray-500">پرداخت‌شده</div><div className="text-xs font-bold text-emerald-600">{formatToman(p.paidAmount)}</div></div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl py-2"><div className="text-[11px] text-gray-500">مانده</div><div className="text-xs font-bold text-rose-600">{formatToman(p.remaining)}</div></div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-gray-500">اقساط: {toPersianDigits(p.paidCount)} از {toPersianDigits(p.installmentsTotal)}</span>
                    {p.nextDue && p.computedStatus !== "completed" && <span className="text-gray-500">سررسید بعدی: {toJalaliDate(p.nextDue)}</span>}
                    <button onClick={() => toggle(p.id)} className="text-indigo-600 flex items-center gap-1">{expanded === p.id ? <>بستن <ChevronUp className="w-3 h-3" /></> : <>اقساط <ChevronDown className="w-3 h-3" /></>}</button>
                  </div>
                </div>

                {expanded === p.id && (
                  <div className="border-t border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800/40 space-y-2">
                    {(detail[p.id] || []).map((inst) => {
                      const overdue = !inst.paid && inst.dueDate < new Date().toISOString();
                      return (
                        <div key={inst.id} className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs border ${inst.paid ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30" : overdue ? "border-rose-200 bg-rose-50 dark:bg-rose-950/30" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"}`}>
                          <span className="font-bold">قسط {toPersianDigits(inst.seq)}</span>
                          <span className="text-gray-500">{toJalaliDate(inst.dueDate)}</span>
                          <span className="font-bold">{formatToman(inst.amount)}</span>
                          {inst.paid ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> پرداخت شد</span>
                            : <button onClick={() => payInstallment(p.id, inst.id)} className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold">ثبت پرداخت</button>}
                        </div>
                      );
                    })}
                    {p.address && <div className="text-[11px] text-gray-500 flex items-center gap-1 pt-1"><MapPin className="w-3 h-3" /> {p.address}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form onSubmit={submit} className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">خرید قسطی جدید</h3>
              <button type="button" onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            {invoiceNumber && <div className="text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-lg px-3 py-2">مربوط به فاکتور {toPersianDigits(invoiceNumber)}</div>}
            <Input label="نام مشتری *" value={customerName} onChange={setCustomerName} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="شماره موبایل" value={phone} onChange={setPhone} numeric />
              <Input label="کد ملی" value={nationalId} onChange={setNationalId} numeric />
            </div>
            <Input label="آدرس" value={address} onChange={setAddress} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="مبلغ کل (تومان) *" value={totalAmount} onChange={setTotalAmount} numeric />
              <Input label="پیش‌پرداخت (تومان)" value={downPayment} onChange={setDownPayment} numeric />
            </div>
            <div>
              <label className="text-xs text-gray-500">تعداد اقساط</label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {[2, 3, 4, 6].map((n) => (
                  <button type="button" key={n} onClick={() => setCount(n)} className={`py-2 rounded-xl text-sm font-bold border ${count === n ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 dark:border-gray-700"}`}>{toPersianDigits(n)} قسط</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">فاصلهٔ هر قسط</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[{ d: 30, t: "ماهانه" }, { d: 15, t: "۱۵ روز" }, { d: 7, t: "هفتگی" }].map((o) => (
                  <button type="button" key={o.d} onClick={() => setIntervalDays(o.d)} className={`py-2 rounded-xl text-sm font-bold border ${intervalDays === o.d ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 dark:border-gray-700"}`}>{o.t}</button>
                ))}
              </div>
            </div>
            {Number(totalAmount) > 0 && (
              <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                هر قسط تقریباً <b>{formatToman(Math.floor((Number(totalAmount) - (Number(downPayment) || 0)) / count))}</b> — {toPersianDigits(count)} قسط
              </div>
            )}
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> ثبت خرید قسطی</button>
          </form>
        </div>
      )}
    </MainLayout>
  );
}

function Input({ label, value, onChange, numeric }: { label: string; value: string; onChange: (v: string) => void; numeric?: boolean }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode={numeric ? "numeric" : undefined}
        className="w-full mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}

export default function InstallmentsPage() {
  return (
    <Suspense fallback={<MainLayout><div className="text-center text-gray-400 py-10">در حال بارگذاری...</div></MainLayout>}>
      <InstallmentsInner />
    </Suspense>
  );
}

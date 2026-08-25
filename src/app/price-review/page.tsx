"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Clock, CheckCircle, Mic, Save } from "lucide-react";
import { formatToman, toPersianDigits, toEnglishDigits, toJalaliDate } from "@/lib/persian/utils";
import { VoiceAssistantModal } from "@/components/voice/VoiceAssistantModal";

export default function PriceReviewPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Record<number, string>>({});
  const [voiceOpen, setVoiceOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/stale-prices");
      const d = await res.json();
      setRows(d.products || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const keepSame = async (id: number) => {
    await fetch("/api/products/stale-prices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id }) });
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const savePrice = async (id: number) => {
    const v = Number(toEnglishDigits(edit[id] || "")) || 0;
    if (v <= 0) return;
    await fetch(`/api/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sellPrice: v }) });
    setRows((prev) => prev.filter((r) => r.id !== id));
    setEdit((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg"><Clock className="w-6 h-6" /></div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">بازبینیِ قیمت‌های قدیمی</h2>
            <p className="text-xs text-gray-500">کالاهایی که بیش از یک ماه از قیمتشان گذشته. یا «ادامه با همین قیمت» را بزنید (۲ هفته بعد دوباره یادآوری می‌شود) یا قیمتِ جدید بگذارید.</p>
          </div>
          <button onClick={() => setVoiceOpen(true)} className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"><Mic className="w-4 h-4" /> تغییر صوتی</button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">در حال بارگذاری...</div>
        ) : rows.length === 0 ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <div className="font-bold text-emerald-700 dark:text-emerald-300">همهٔ قیمت‌ها به‌روزند ✅</div>
            <div className="text-xs text-gray-500 mt-1">کالایی با قیمتِ قدیمی وجود ندارد.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{r.name}</div>
                    <div className="text-[11px] text-rose-600 dark:text-rose-400">
                      {toPersianDigits(r.ageDays)} روز از {r.reviewedOnce ? "آخرین تأیید" : "تغییر قیمت"} گذشته — از {toJalaliDate(r.since)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">قیمت فعلی: <b className="text-gray-800 dark:text-gray-200">{formatToman(r.sellPrice)}</b> · موجودی: {toPersianDigits(r.stock)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input inputMode="numeric" placeholder="قیمت جدید" value={edit[r.id] || ""} onChange={(e) => setEdit((p) => ({ ...p, [r.id]: e.target.value }))}
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-center" />
                  <button onClick={() => savePrice(r.id)} disabled={!edit[r.id]} className="bg-emerald-600 disabled:opacity-40 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1"><Save className="w-4 h-4" /> ثبت قیمت</button>
                  <button onClick={() => keepSame(r.id)} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-xl text-xs font-bold">ادامه با همین</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <VoiceAssistantModal isOpen={voiceOpen} onClose={() => { setVoiceOpen(false); load(); }} defaultMode="price" onActionExecute={() => load()} />
    </MainLayout>
  );
}

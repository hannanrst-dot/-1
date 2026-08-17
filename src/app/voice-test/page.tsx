"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Mic, Trash2, CheckCircle, Send, Lock, ChevronUp, FlaskConical } from "lucide-react";
import { formatToman, toPersianDigits, toEnglishDigits } from "@/lib/persian/utils";
import { shareInvoice } from "@/lib/invoice/share";

interface Row { productId: number | null; productName: string; quantity: number; unitPrice: number; status: string; }

export default function VoiceTestPage() {
  const router = useRouter();
  const [items, setItems] = useState<Row[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [recording, setRecording] = useState(false);
  const [locked, setLocked] = useState(false);
  const [live, setLive] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any>(null);

  const recRef = useRef<any>(null);
  const startYRef = useRef(0);
  const lockedRef = useRef(false);
  const textRef = useRef("");

  const getSR = () => (typeof window === "undefined" ? null : (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* ignore */ } }, []);

  const beginRecording = () => {
    const SR = getSR();
    if (!SR) { setNotice("مرورگر شما میکروفون را پشتیبانی نمی‌کند."); return; }
    setNotice(""); setLive(""); textRef.current = "";
    const rec = new SR();
    rec.lang = "fa-IR"; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      let final = "", interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript + " "; else interim += r[0].transcript + " ";
      }
      textRef.current = (final + interim).trim();
      setLive(textRef.current);
    };
    rec.onend = () => { setRecording(false); };
    recRef.current = rec;
    try { rec.start(); setRecording(true); } catch { /* ignore */ }
  };

  const endRecording = () => {
    try { recRef.current?.stop(); } catch { /* ignore */ }
    setRecording(false); setLocked(false); lockedRef.current = false;
    const t = textRef.current.trim();
    if (t) processPhrase(t);
    setLive("");
  };

  const processPhrase = async (text: string) => {
    setLoading(true); setNotice("");
    try {
      const res = await fetch("/api/voice/process", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spokenText: text, mode: "invoice" }),
      });
      const data = await res.json();
      const added = (data?.data?.items || []) as any[];
      if (!added.length) { setNotice(`«${text}» شناسایی نشد. دوباره بگویید.`); return; }
      setItems((prev) => {
        const next = [...prev];
        for (const it of added) {
          const idx = it.productId != null ? next.findIndex((x) => x.productId === it.productId) : -1;
          if (idx > -1) next[idx] = { ...next[idx], quantity: next[idx].quantity + Number(it.quantity || 1) };
          else next.push({ productId: it.productId ?? null, productName: it.productName, quantity: Number(it.quantity || 1), unitPrice: Number(it.unitPrice || 0), status: it.status || "EXACT" });
        }
        return next;
      });
      setNotice(`«${added.map((x) => x.productName).join("، ")}» اضافه شد.`);
    } catch { setNotice("خطای ارتباط با سرور."); } finally { setLoading(false); }
  };

  // --- کنترلِ لمسیِ «فشار بده و نگه‌دار» + «بکش بالا برای قفل» (شبیه ویس تلگرام) ---
  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    startYRef.current = e.clientY; lockedRef.current = false; setLocked(false);
    beginRecording();
  };
  const onMove = (e: React.PointerEvent) => {
    if (!recording || lockedRef.current) return;
    if (startYRef.current - e.clientY > 60) { lockedRef.current = true; setLocked(true); }
  };
  const onUp = () => { if (lockedRef.current) return; endRecording(); };

  const invoiceTotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const unresolved = items.some((it) => it.productId == null);

  const submitInvoice = async () => {
    if (!items.length) { setNotice("لیست خالی است."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: customerName || "مشتری عمومی", customerPhone: customerPhone || null, items: items.map((it) => ({ productId: it.productId, productName: it.productName, quantity: it.quantity, unitPrice: it.unitPrice, totalPrice: it.unitPrice * it.quantity })), notes: "ثبت صوتی (آزمایشی)" }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreated({ number: data.invoice?.invoiceNumber || "", id: data.invoice?.id, customerName: customerName || "مشتری عمومی", customerPhone, items: items.map((it) => ({ productName: it.productName, quantity: it.quantity, unitPrice: it.unitPrice, totalPrice: it.unitPrice * it.quantity })), total: invoiceTotal });
      } else setNotice(data.error || "خطا در ثبت فاکتور.");
    } catch { setNotice("خطای ارتباط."); } finally { setLoading(false); }
  };

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg"><FlaskConical className="w-6 h-6" /></div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">فاکتور صوتی — نسخهٔ آزمایشی 🧪</h2>
            <p className="text-xs text-gray-500">دکمه را نگه دارید و بگویید؛ رها کنید تا ثبت شود. برای قفل، به بالا بکشید.</p>
          </div>
        </div>

        {created ? (
          <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 space-y-3">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto mb-2"><CheckCircle className="w-8 h-8" /></div>
              <div className="font-bold text-emerald-700 dark:text-emerald-400">فاکتور ثبت شد ✅</div>
              <div className="text-xs text-gray-500 mt-1">شماره: {toPersianDigits(created.number)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => shareInvoice(created, created.customerPhone)} className="bg-sky-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><Send className="w-4 h-4" /> ارسال فاکتور</button>
              <button onClick={() => { setCreated(null); setItems([]); setCustomerName(""); setCustomerPhone(""); }} className="bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold">فاکتور جدید</button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 flex flex-col items-center gap-3">
              {locked && (
                <div className="text-xs font-bold text-rose-600 flex items-center gap-1"><Lock className="w-4 h-4" /> ضبط قفل شد — برای پایان دکمهٔ زیر را بزنید</div>
              )}
              {!locked && recording && (
                <div className="text-xs font-bold text-gray-500 flex items-center gap-1 animate-bounce"><ChevronUp className="w-4 h-4" /> برای قفل‌کردن به بالا بکشید</div>
              )}
              <button
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                style={{ touchAction: "none" }}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg select-none transition ${recording ? "bg-rose-500 ring-8 ring-rose-200 dark:ring-rose-900/40 scale-110" : "bg-purple-600 ring-8 ring-purple-100 dark:ring-purple-950/40"}`}
              >
                <Mic className="w-10 h-10" />
              </button>
              <span className={`text-xs font-bold ${recording ? "text-rose-600" : "text-gray-500"}`}>
                {recording ? "🔴 در حال شنیدن..." : "دکمه را نگه دارید و بگویید"}
              </span>
              {locked && (
                <button onClick={endRecording} className="mt-1 bg-rose-600 text-white px-6 py-2 rounded-xl text-sm font-bold">توقف و ثبت</button>
              )}
              {live && <div className="w-full text-center text-sm bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">{live}</div>}
              {loading && <div className="text-emerald-600 text-sm flex items-center gap-2"><div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> پردازش...</div>}
              {notice && <div className="w-full text-center text-sm bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-200">{notice}</div>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="نام مشتری (اختیاری)" className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm" />
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} inputMode="tel" placeholder="📱 موبایل مشتری" className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-left font-mono" />
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">🧾 اقلام ({toPersianDigits(items.length)})</span>
                {items.length > 0 && <button onClick={() => setItems([])} className="text-xs text-rose-600">پاک کردن</button>}
              </div>
              {items.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">هنوز چیزی اضافه نشده.</div>
              ) : items.map((it, i) => (
                <div key={i} className={`rounded-xl p-2.5 border ${it.productId == null ? "border-rose-300 bg-rose-50 dark:bg-rose-950/30" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate flex-1">{it.productName}</span>
                    <button onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {it.productId == null && <div className="text-[11px] text-rose-600 mt-1">در انبار پیدا نشد</div>}
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <div className="flex items-center gap-1"><span className="text-gray-500">تعداد:</span>
                      <button onClick={() => setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))} className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold">−</button>
                      <input type="text" inputMode="numeric" value={toPersianDigits(it.quantity)} onChange={(e) => { const v = Number(toEnglishDigits(e.target.value)) || 0; setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: v } : x)); }} className="w-12 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1" />
                      <button onClick={() => setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: x.quantity + 1 } : x))} className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold">+</button>
                    </div>
                    <span className="text-gray-500">{formatToman(it.unitPrice)}</span>
                    <span className="font-bold">{formatToman(it.unitPrice * it.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-sm text-gray-500">مبلغ کل</span>
              <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">{formatToman(invoiceTotal)}</span>
            </div>
            <button onClick={submitInvoice} disabled={loading || !items.length || unresolved} className="w-full bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> ثبت نهایی فاکتور</button>
          </>
        )}
      </div>
    </MainLayout>
  );
}

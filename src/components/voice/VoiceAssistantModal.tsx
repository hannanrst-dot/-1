"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, X, Volume2, CheckCircle, Sparkles, Trash2, Plus, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatToman, toPersianDigits, toEnglishDigits } from "@/lib/persian/utils";
import { collapseRepeatedWords } from "@/lib/voice/persianNormalizer";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionExecute?: (actionType: string, payload: any) => void;
}

interface CartItem {
  productId: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  status: string;
  matches?: { id: number; name: string; sellPrice: number }[];
}

export function VoiceAssistantModal({ isOpen, onClose, onActionExecute }: VoiceAssistantModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);        // لیست انباشتهٔ فاکتور (پاک نمی‌شود مگر با دستور کاربر)
  const [customerName, setCustomerName] = useState("");
  const [notice, setNotice] = useState("");                  // پیام راهنما/پاسخ
  const [extra, setExtra] = useState<any>(null);             // نتیجهٔ کالا/خرید/پرسش
  const [showHelp, setShowHelp] = useState(false);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const sessionBaseRef = useRef("");   // متن سشن‌های قبلی (قبل از restart)
  const currentFinalRef = useRef("");  // بخش نهاییِ سشن جاری

  // قفل اسکرول پس‌زمینه وقتی مودال باز است (مخصوص موبایل)
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "fa-IR";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
      // بازسازی کامل متن سشن جاری از روی همهٔ نتایج (جلوگیری از تکرار کلمات)
      let finalStr = "";
      let interimStr = "";
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalStr += r[0].transcript + " ";
        else interimStr += r[0].transcript;
      }
      currentFinalRef.current = finalStr;
      // حذف تکرارهای پیاپیِ تشخیص گفتار تا کاربر متن تمیز ببیند.
      const combined = collapseRepeatedWords((sessionBaseRef.current + finalStr + interimStr).replace(/\s+/g, " ").trim());
      setTranscript(combined);
    };

    rec.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      console.error("Speech error:", event.error);
    };

    rec.onend = () => {
      if (shouldListenRef.current) {
        // ادامهٔ ضبط تا وقتی کاربر «توقف» را نزده؛ متن نهایی حفظ می‌شود.
        sessionBaseRef.current = (sessionBaseRef.current + currentFinalRef.current).replace(/\s+/g, " ");
        currentFinalRef.current = "";
        try { rec.start(); } catch { /* ignore */ }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;
    return () => {
      shouldListenRef.current = false;
      try { rec.stop(); } catch { /* ignore */ }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      setNotice("مرورگر شما از میکروفون پشتیبانی نمی‌کند. می‌توانید متن را تایپ کنید.");
      return;
    }
    setTranscript("");
    setNotice("");
    setExtra(null);
    sessionBaseRef.current = "";
    currentFinalRef.current = "";
    shouldListenRef.current = true;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) { console.error(e); }
  };

  const stopListening = () => {
    shouldListenRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    setIsListening(false);
    const finalText = (sessionBaseRef.current + currentFinalRef.current + " " + transcript).replace(/\s+/g, " ").trim();
    const text = transcript.trim() || finalText;
    if (text) setTimeout(() => processText(text), 300);
  };

  const speak = (text: string) => {
    try {
      if (!("speechSynthesis" in window) || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "fa-IR";
      u.rate = 0.98;
      window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
  };

  // پردازش متن → افزودن اقلام به لیست فاکتور یا نمایش نتیجهٔ کالا/خرید/پرسش
  const processText = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setNotice("");
    setExtra(null);
    try {
      const res = await fetch("/api/voice/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spokenText: text }),
      });
      const data = await res.json();
      if (!res.ok) { setNotice(data.error || "خطا در پردازش."); return; }

      if (data.type === "CREATE_INVOICE_CONFIRMATION") {
        appendInvoiceItems(data.data.items || []);
        if (data.data.customerName && data.data.customerName !== "مشتری عمومی" && !customerName) {
          setCustomerName(data.data.customerName);
        }
        const added = (data.data.items || []).length;
        setNotice(added ? `${toPersianDigits(added)} قلم به فاکتور اضافه شد. می‌توانید باز هم بگویید یا فاکتور را ثبت کنید.` : "کالایی تشخیص داده نشد.");
        speak(added ? `${added} قلم اضافه شد` : "کالایی پیدا نشد");
      } else if (data.type === "CREATE_PRODUCT_CONFIRMATION") {
        setExtra({ kind: "product", product: data.data.product });
        speak("اطلاعات کالا آماده ثبت است");
      } else if (data.type === "CREATE_PURCHASE_CONFIRMATION") {
        setExtra({ kind: "purchase", ...data.data });
        speak("خرید آماده ثبت است");
      } else if (data.type === "INFO" || data.type === "LOW_STOCK_LIST" || data.type === "INVOICE_FOUND") {
        setNotice(data.speechResponse || "");
        speak(data.speechResponse || "");
      } else {
        setNotice(data.speechResponse || "متوجه نشدم؛ لطفاً واضح‌تر بگویید.");
      }
    } catch {
      setNotice("خطای ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  // افزودن اقلام جدید به لیست موجود (بدون پاک کردن قبلی‌ها؛ ادغام هم‌کالا)
  const appendInvoiceItems = (newItems: any[]) => {
    setItems((prev) => {
      const next = [...prev];
      for (const it of newItems) {
        const idx = it.productId != null ? next.findIndex((x) => x.productId === it.productId) : -1;
        if (idx > -1) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + Number(it.quantity || 1) };
        } else {
          next.push({
            productId: it.productId ?? null,
            productName: it.productName,
            quantity: Number(it.quantity || 1),
            unitPrice: Number(it.unitPrice || 0),
            status: it.status || "EXACT",
            matches: it.matches?.map((m: any) => ({ id: m.id, name: m.name, sellPrice: m.sellPrice })) || [],
          });
        }
      }
      return next;
    });
  };

  const updateItem = (i: number, patch: Partial<CartItem>) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const clearAll = () => { setItems([]); setCustomerName(""); setNotice(""); setExtra(null); setTranscript(""); };

  const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const hasUnresolved = items.some((it) => it.productId == null);

  const submitInvoice = async () => {
    if (items.length === 0) { setNotice("لیست فاکتور خالی است."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName || "مشتری عمومی",
          items: items.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            totalPrice: it.unitPrice * it.quantity,
          })),
          notes: "ثبت شده با دستیار صوتی",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        speak("فاکتور ثبت شد");
        clearAll();
        if (onActionExecute) onActionExecute("NAVIGATE_INVOICE", data.invoice?.id);
        onClose();
      } else {
        setNotice(data.error || "خطا در ثبت فاکتور.");
      }
    } catch {
      setNotice("خطای ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  const registerProduct = async () => {
    if (!extra?.product) return;
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extra.product),
      });
      if (res.ok) {
        setNotice(`کالای «${extra.product.name}» ثبت شد.`);
        speak("کالا ثبت شد");
        setExtra(null);
        if (onActionExecute) onActionExecute("REFRESH_PRODUCTS", null);
      } else setNotice("خطا در ثبت کالا.");
    } finally { setLoading(false); }
  };

  const confirmPurchase = async () => {
    if (!extra) return;
    setLoading(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierName: extra.supplierName, items: extra.items, notes: "ثبت شده با دستیار صوتی" }),
      });
      if (res.ok) {
        setNotice("خرید ثبت و موجودی افزایش یافت.");
        speak("خرید ثبت شد");
        setExtra(null);
        if (onActionExecute) onActionExecute("REFRESH_PURCHASES", null);
      } else setNotice("خطا در ثبت خرید.");
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex sm:items-center sm:justify-center sm:p-4">
      <div className="bg-white dark:bg-gray-900 w-full h-[100dvh] sm:h-[88vh] sm:max-w-lg sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl">

        {/* Header (sticky) */}
        <div className="shrink-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">دستیار صوتی فروشگاه</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Mic + status */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => (isListening ? stopListening() : startListening())}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition ${
                isListening ? "bg-rose-500 animate-pulse ring-8 ring-rose-200 dark:ring-rose-900/40" : "bg-emerald-600 ring-8 ring-emerald-100 dark:ring-emerald-950/40"
              }`}
            >
              <Mic className="w-10 h-10" />
            </button>
            <p className="text-sm text-center font-medium text-gray-600 dark:text-gray-300 px-2">
              {isListening
                ? "🔴 در حال ضبط... هر چقدر می‌خواهید بگویید، بعد روی همین دکمه بزنید تا متوقف شود."
                : "روی میکروفون بزنید و صحبت کنید (شروع و توقف با شماست)"}
            </p>
          </div>

          {/* Live transcript / manual text */}
          <div className="space-y-2">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="آنچه می‌گویید اینجا نوشته می‌شود؛ می‌توانید ویرایش هم بکنید..."
              rows={2}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => processText(transcript)}
              disabled={loading || !transcript.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> افزودن به فاکتور
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> در حال پردازش...
            </div>
          )}

          {notice && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-sm flex items-start gap-2">
              <Volume2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-200 leading-relaxed">{notice}</span>
            </div>
          )}

          {/* Extra result: product / purchase */}
          {extra?.kind === "product" && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-3 space-y-2">
              <div className="font-bold text-sm text-emerald-800 dark:text-emerald-300">پیش‌نمایش ثبت کالا:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>نام: <b>{extra.product.name}</b></div>
                <div>تعداد: <b>{toPersianDigits(extra.product.stock)}</b></div>
                <div>خرید: <b>{formatToman(extra.product.buyPrice)}</b></div>
                <div>فروش: <b>{formatToman(extra.product.sellPrice)}</b></div>
              </div>
              <button onClick={registerProduct} className="w-full bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold">ثبت کالا</button>
            </div>
          )}
          {extra?.kind === "purchase" && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-3 space-y-2">
              <div className="font-bold text-sm text-amber-800 dark:text-amber-300">پیش‌نمایش خرید از {extra.supplierName}:</div>
              {(extra.items || []).map((it: any, i: number) => (
                <div key={i} className="text-xs flex justify-between"><span>{it.productName}</span><span>{toPersianDigits(it.quantity)} × {formatToman(it.unitPrice)}</span></div>
              ))}
              <button onClick={confirmPurchase} className="w-full bg-amber-600 text-white py-2 rounded-xl text-xs font-bold">ثبت خرید و افزایش موجودی</button>
            </div>
          )}

          {/* Customer */}
          <div>
            <label className="text-xs text-gray-500">مشتری (اختیاری)</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مشتری عمومی"
              className="w-full mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Pre-invoice item list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm">🧾 لیست فاکتور ({toPersianDigits(items.length)} قلم)</span>
              {items.length > 0 && (
                <button onClick={clearAll} className="text-xs text-rose-600 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> پاک کردن همه</button>
              )}
            </div>
            {items.length === 0 ? (
              <div className="text-center text-xs text-gray-400 py-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                هنوز کالایی اضافه نشده. مثلاً بگویید: «سه تا دفتر و دو تا خودکار»
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((it, i) => (
                  <div key={i} className={`rounded-xl p-2.5 border ${it.productId == null ? "border-rose-300 bg-rose-50 dark:bg-rose-950/30" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {it.matches && it.matches.length > 1 ? (
                          <select
                            value={it.productId ?? ""}
                            onChange={(e) => {
                              const m = it.matches!.find((x) => x.id === Number(e.target.value));
                              if (m) updateItem(i, { productId: m.id, productName: m.name, unitPrice: m.sellPrice, status: "EXACT" });
                            }}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-xs"
                          >
                            {it.matches.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        ) : (
                          <span className="text-sm font-medium truncate block">{it.productName}</span>
                        )}
                        {it.productId == null && <span className="text-[11px] text-rose-600">در انبار پیدا نشد — حذف کنید یا کالا را ثبت کنید</span>}
                      </div>
                      <button onClick={() => removeItem(i)} className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">تعداد:</span>
                        <input
                          type="text" inputMode="numeric"
                          value={toPersianDigits(it.quantity)}
                          onChange={(e) => { const v = Number(toEnglishDigits(e.target.value)) || 0; updateItem(i, { quantity: v }); }}
                          className="w-14 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1"
                        />
                      </div>
                      <span className="text-gray-500">{formatToman(it.unitPrice)}</span>
                      <span className="font-bold">{formatToman(it.unitPrice * it.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help / examples */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl">
            <button onClick={() => setShowHelp((s) => !s)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4" /> نمونه جمله‌ها و راهنما</span>
              {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showHelp && (
              <ul className="px-4 pb-3 text-[12px] text-gray-600 dark:text-gray-300 space-y-1.5 list-disc list-inside leading-relaxed">
                <li><b>فاکتور:</b> «سه تا دفتر پاپکو و دو تا خودکار بیک» — بعد باز بزنید و بگویید «یک پاک‌کن فابر» تا به همان فاکتور اضافه شود.</li>
                <li><b>با مشتری:</b> «برای علی رضایی پنج تا دفتر بزن»</li>
                <li><b>ثبت کالا:</b> «دفتر پاپکو ۸۰ برگ، تعداد ۵۰ تا، قیمت خرید ۴۵ هزار، قیمت فروش ۶۰ هزار»</li>
                <li><b>خرید:</b> «از شرکت پاپکو صد تا دفتر خریدم دونه‌ای چهل و پنج هزار»</li>
                <li><b>پرسش:</b> «فروش امروز چقدر بوده؟» یا «کدوم کالاها موجودیشون کمه؟»</li>
              </ul>
            )}
          </div>
        </div>

        {/* Footer (sticky) — total + submit */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">مبلغ کل فاکتور</span>
            <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">{formatToman(total)}</span>
          </div>
          <button
            onClick={submitInvoice}
            disabled={loading || items.length === 0 || hasUnresolved}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <CheckCircle className="w-5 h-5" /> ثبت نهایی فاکتور
          </button>
          {hasUnresolved && <p className="text-[11px] text-rose-600 text-center mt-1">ابتدا اقلام «پیدا نشده» را حذف یا اصلاح کنید.</p>}
        </div>
      </div>
    </div>
  );
}

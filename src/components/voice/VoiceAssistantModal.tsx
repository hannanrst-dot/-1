"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, X, CheckCircle, Trash2, Plus, ArrowRight, ShoppingBag, PackagePlus, Truck, MessageCircle } from "lucide-react";
import { formatToman, toPersianDigits, toEnglishDigits } from "@/lib/persian/utils";
import { collapseRepeatedWords } from "@/lib/voice/persianNormalizer";

type Mode = "menu" | "invoice" | "product" | "purchase" | "query";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionExecute?: (actionType: string, payload: any) => void;
  defaultMode?: Mode;
}

interface CartItem {
  productId: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  status: string;
  matches?: { id: number; name: string; sellPrice: number }[];
}

interface ProductDraft { name: string; stock: number; buyPrice: number; sellPrice: number; }

export function VoiceAssistantModal({ isOpen, onClose, onActionExecute, defaultMode = "menu" }: VoiceAssistantModalProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  // invoice
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  // product
  const [product, setProduct] = useState<ProductDraft | null>(null);
  // purchase
  const [supplierName, setSupplierName] = useState("");
  const [purchaseItems, setPurchaseItems] = useState<{ productName: string; quantity: number; unitPrice: number }[]>([]);
  // query
  const [answer, setAnswer] = useState("");

  const recognitionRef = useRef<any>(null);
  const modeRef = useRef<Mode>(mode);
  const transcriptRef = useRef("");
  modeRef.current = mode;

  useEffect(() => { if (isOpen) setMode(defaultMode); }, [isOpen, defaultMode]);

  // قفل اسکرول پس‌زمینه (موبایل)
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "fa-IR";
    rec.continuous = false;      // تک‌جمله‌ای: پایدارترین حالت روی موبایل (بدون تکرار)
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript + " ";
      const clean = collapseRepeatedWords(text.replace(/\s+/g, " ").trim());
      transcriptRef.current = clean;
      setTranscript(clean);
    };
    rec.onerror = (event: any) => {
      if (event.error !== "no-speech" && event.error !== "aborted") console.error("Speech:", event.error);
    };
    rec.onend = () => {
      setIsListening(false);
      const text = transcriptRef.current.trim();
      if (text) setTimeout(() => processText(text, modeRef.current), 200);
    };
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch { /* ignore */ } };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) { setNotice("مرورگر شما میکروفون را پشتیبانی نمی‌کند. می‌توانید تایپ کنید."); return; }
    setTranscript(""); transcriptRef.current = ""; setNotice("");
    try { recognitionRef.current.start(); setIsListening(true); } catch (e) { console.error(e); }
  };
  const stopRecording = () => { try { recognitionRef.current?.stop(); } catch { /* ignore */ } setIsListening(false); };

  const speak = (t: string) => {
    try { if (!("speechSynthesis" in window) || !t) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "fa-IR"; window.speechSynthesis.speak(u); } catch { /* ignore */ }
  };

  const processText = async (text: string, m: Mode) => {
    if (!text.trim()) return;
    setLoading(true); setNotice("");
    try {
      const apiMode = m === "invoice" ? "invoice" : m === "product" ? "product" : m === "purchase" ? "purchase" : undefined;
      const res = await fetch("/api/voice/process", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spokenText: text, mode: apiMode }),
      });
      const data = await res.json();
      if (!res.ok) { setNotice(data.error || "خطا در پردازش."); return; }

      if (m === "invoice") {
        const added = data.data?.items || [];
        appendInvoiceItems(added);
        if (data.data?.customerName && data.data.customerName !== "مشتری عمومی" && !customerName) setCustomerName(data.data.customerName);
        setNotice(added.length ? `«${added.map((x: any) => x.productName).join("، ")}» اضافه شد.` : "کالایی تشخیص داده نشد. دوباره واضح‌تر بگویید.");
      } else if (m === "product") {
        const p = data.data?.product;
        if (p) { setProduct({ name: p.name, stock: p.stock || 1, buyPrice: p.buyPrice || 0, sellPrice: p.sellPrice || 0 }); setNotice("اطلاعات پر شد؛ بررسی و در صورت نیاز اصلاح کنید."); }
      } else if (m === "purchase") {
        if (data.data?.supplierName && data.data.supplierName !== "تامین‌کننده عمومی") setSupplierName(data.data.supplierName);
        const its = (data.data?.items || []).map((x: any) => ({ productName: x.productName, quantity: x.quantity || 1, unitPrice: x.unitPrice || 0 }));
        setPurchaseItems((prev) => [...prev, ...its]);
        setNotice(its.length ? "به لیست خرید اضافه شد." : "کالایی تشخیص داده نشد.");
      } else if (m === "query") {
        setAnswer(data.speechResponse || "پاسخی یافت نشد.");
        speak(data.speechResponse || "");
      }
    } catch { setNotice("خطای ارتباط با سرور."); }
    finally { setLoading(false); }
  };

  const appendInvoiceItems = (newItems: any[]) => {
    setItems((prev) => {
      const next = [...prev];
      for (const it of newItems) {
        const idx = it.productId != null ? next.findIndex((x) => x.productId === it.productId) : -1;
        if (idx > -1) next[idx] = { ...next[idx], quantity: next[idx].quantity + Number(it.quantity || 1) };
        else next.push({ productId: it.productId ?? null, productName: it.productName, quantity: Number(it.quantity || 1), unitPrice: Number(it.unitPrice || 0), status: it.status || "EXACT", matches: it.matches?.map((mm: any) => ({ id: mm.id, name: mm.name, sellPrice: mm.sellPrice })) || [] });
      }
      return next;
    });
  };

  const resetAll = () => { setItems([]); setCustomerName(""); setProduct(null); setSupplierName(""); setPurchaseItems([]); setAnswer(""); setNotice(""); setTranscript(""); };
  const goMenu = () => { resetAll(); setMode("menu"); };

  const invoiceTotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const invoiceUnresolved = items.some((it) => it.productId == null);

  const submitInvoice = async () => {
    if (!items.length) { setNotice("لیست خالی است."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: customerName || "مشتری عمومی", items: items.map((it) => ({ productId: it.productId, productName: it.productName, quantity: it.quantity, unitPrice: it.unitPrice, totalPrice: it.unitPrice * it.quantity })), notes: "ثبت صوتی" }),
      });
      const data = await res.json();
      if (res.ok) { speak("فاکتور ثبت شد"); resetAll(); onActionExecute?.("NAVIGATE_INVOICE", data.invoice?.id); onClose(); }
      else setNotice(data.error || "خطا در ثبت فاکتور.");
    } catch { setNotice("خطای ارتباط."); } finally { setLoading(false); }
  };

  const submitProduct = async () => {
    if (!product || !product.name) { setNotice("نام کالا را وارد کنید."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(product) });
      if (res.ok) { speak("کالا ثبت شد"); setNotice(`کالای «${product.name}» ثبت شد. ✅`); setProduct(null); setTranscript(""); onActionExecute?.("REFRESH_PRODUCTS", null); }
      else setNotice("خطا در ثبت کالا.");
    } catch { setNotice("خطای ارتباط."); } finally { setLoading(false); }
  };

  const submitPurchase = async () => {
    if (!purchaseItems.length) { setNotice("لیست خرید خالی است."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/purchases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ supplierName: supplierName || "تامین‌کننده عمومی", items: purchaseItems, notes: "ثبت صوتی" }) });
      if (res.ok) { speak("خرید ثبت شد"); resetAll(); onActionExecute?.("REFRESH_PURCHASES", null); onClose(); }
      else setNotice("خطا در ثبت خرید.");
    } catch { setNotice("خطای ارتباط."); } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const MENU_TITLE: Record<Mode, string> = {
    menu: "دستیار صوتی", invoice: "🧾 فاکتور صوتی", product: "📦 ثبت کالای صوتی", purchase: "🛒 خرید صوتی", query: "💬 پرسش صوتی",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex sm:items-center sm:justify-center sm:p-4">
      <div className="bg-white dark:bg-gray-900 w-full h-[100dvh] sm:h-[88vh] sm:max-w-lg sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode !== "menu" && (
              <button onClick={goMenu} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center active:scale-95"><ArrowRight className="w-5 h-5" /></button>
            )}
            <span className="font-bold">{MENU_TITLE[mode]}</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-95"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ---------- MENU ---------- */}
          {mode === "menu" && (
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">می‌خواهید با صدا چه کاری انجام دهید؟</p>
              <MenuButton icon={<ShoppingBag />} title="فاکتور صوتی" desc="فروش کالا به مشتری با گفتن نام و تعداد" color="emerald" onClick={() => { resetAll(); setMode("invoice"); }} />
              <MenuButton icon={<PackagePlus />} title="ثبت کالای صوتی" desc="افزودن کالای جدید همراه قیمت خرید و فروش" color="sky" onClick={() => { resetAll(); setMode("product"); }} />
              <MenuButton icon={<Truck />} title="خرید صوتی" desc="ثبت خرید از تأمین‌کننده و افزایش موجودی" color="amber" onClick={() => { resetAll(); setMode("purchase"); }} />
              <MenuButton icon={<MessageCircle />} title="پرسش صوتی" desc="مثلاً: فروش امروز چقدر بوده؟" color="violet" onClick={() => { resetAll(); setMode("query"); }} />
            </div>
          )}

          {/* ---------- SHARED: mic + guide (non-menu) ---------- */}
          {mode !== "menu" && (
            <>
              <Guide mode={mode} />

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => (isListening ? stopRecording() : startRecording())}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition ${isListening ? "bg-rose-500 animate-pulse ring-8 ring-rose-200 dark:ring-rose-900/40" : "bg-emerald-600 ring-8 ring-emerald-100 dark:ring-emerald-950/40"}`}
                >
                  <Mic className="w-9 h-9" />
                </button>
                <span className="text-xs text-gray-500">{isListening ? "🔴 در حال شنیدن... بگویید" : "بزنید و یک جمله بگویید"}</span>
              </div>

              <div className="space-y-2">
                <textarea value={transcript} onChange={(e) => { setTranscript(e.target.value); transcriptRef.current = e.target.value; }} placeholder="متن گفتار شما اینجا می‌آید (قابل ویرایش)..." rows={2}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <button onClick={() => processText(transcript, mode)} disabled={loading || !transcript.trim()} className="w-full bg-emerald-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" /> {mode === "invoice" ? "افزودن به فاکتور" : mode === "purchase" ? "افزودن به خرید" : mode === "product" ? "پر کردن فرم" : "پرسیدن"}
                </button>
              </div>

              {loading && <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm"><div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> پردازش...</div>}
              {notice && <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-200">{notice}</div>}
            </>
          )}

          {/* ---------- INVOICE list ---------- */}
          {mode === "invoice" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">مشتری (اختیاری)</label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="مشتری عمومی" className="w-full mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">🧾 اقلام ({toPersianDigits(items.length)})</span>
                {items.length > 0 && <button onClick={() => setItems([])} className="text-xs text-rose-600 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> پاک کردن</button>}
              </div>
              {items.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">هنوز چیزی اضافه نشده — میکروفون را بزنید و بگویید.</div>
              ) : items.map((it, i) => (
                <div key={i} className={`rounded-xl p-2.5 border ${it.productId == null ? "border-rose-300 bg-rose-50 dark:bg-rose-950/30" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"}`}>
                  <div className="flex items-center justify-between gap-2">
                    {it.matches && it.matches.length > 1 ? (
                      <select value={it.productId ?? ""} onChange={(e) => { const mm = it.matches!.find((x) => x.id === Number(e.target.value)); if (mm) setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, productId: mm.id, productName: mm.name, unitPrice: mm.sellPrice } : x)); }} className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-xs">
                        {it.matches.map((mm) => <option key={mm.id} value={mm.id}>{mm.name}</option>)}
                      </select>
                    ) : <span className="text-sm font-medium truncate flex-1">{it.productName}</span>}
                    <button onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {it.productId == null && <div className="text-[11px] text-rose-600 mt-1">در انبار پیدا نشد — حذفش کنید</div>}
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <div className="flex items-center gap-1"><span className="text-gray-500">تعداد:</span>
                      <input type="text" inputMode="numeric" value={toPersianDigits(it.quantity)} onChange={(e) => { const v = Number(toEnglishDigits(e.target.value)) || 0; setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: v } : x)); }} className="w-14 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1" />
                    </div>
                    <span className="text-gray-500">{formatToman(it.unitPrice)}</span>
                    <span className="font-bold">{formatToman(it.unitPrice * it.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------- PRODUCT form ---------- */}
          {mode === "product" && product && (
            <div className="space-y-3 border border-sky-200 dark:border-sky-900 rounded-2xl p-3 bg-sky-50 dark:bg-sky-950/30">
              <div className="font-bold text-sm text-sky-800 dark:text-sky-300">فرم کالا (قابل ویرایش):</div>
              <Field label="نام کالا" value={product.name} onChange={(v) => setProduct({ ...product, name: v })} />
              <div className="grid grid-cols-2 gap-2">
                <NumField label="تعداد موجودی" value={product.stock} onChange={(v) => setProduct({ ...product, stock: v })} />
                <NumField label="قیمت خرید (تومان)" value={product.buyPrice} onChange={(v) => setProduct({ ...product, buyPrice: v })} />
                <NumField label="قیمت فروش (تومان)" value={product.sellPrice} onChange={(v) => setProduct({ ...product, sellPrice: v })} />
              </div>
              <button onClick={submitProduct} disabled={loading} className="w-full bg-sky-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><CheckCircle className="w-4 h-4" /> ثبت کالا</button>
            </div>
          )}

          {/* ---------- PURCHASE ---------- */}
          {mode === "purchase" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">تأمین‌کننده</label>
                <input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="نام تأمین‌کننده" className="w-full mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm" />
              </div>
              {purchaseItems.map((it, i) => (
                <div key={i} className="rounded-xl p-2.5 border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input value={it.productName} onChange={(e) => setPurchaseItems((prev) => prev.map((x, idx) => idx === i ? { ...x, productName: e.target.value } : x))} className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 text-xs" />
                    <button onClick={() => setPurchaseItems((prev) => prev.filter((_, idx) => idx !== i))} className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">تعداد:</span>
                    <input type="text" inputMode="numeric" value={toPersianDigits(it.quantity)} onChange={(e) => setPurchaseItems((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: Number(toEnglishDigits(e.target.value)) || 0 } : x))} className="w-16 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1" />
                    <span className="text-gray-500">قیمت خرید:</span>
                    <input type="text" inputMode="numeric" value={toPersianDigits(it.unitPrice)} onChange={(e) => setPurchaseItems((prev) => prev.map((x, idx) => idx === i ? { ...x, unitPrice: Number(toEnglishDigits(e.target.value)) || 0 } : x))} className="flex-1 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------- QUERY answer ---------- */}
          {mode === "query" && answer && (
            <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900 rounded-2xl p-4 text-sm font-semibold text-violet-900 dark:text-violet-200">{answer}</div>
          )}
        </div>

        {/* Footer actions */}
        {mode === "invoice" && (
          <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-500">مبلغ کل</span><span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">{formatToman(invoiceTotal)}</span></div>
            <button onClick={submitInvoice} disabled={loading || !items.length || invoiceUnresolved} className="w-full bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> ثبت نهایی فاکتور</button>
          </div>
        )}
        {mode === "purchase" && purchaseItems.length > 0 && (
          <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 p-3">
            <button onClick={submitPurchase} disabled={loading} className="w-full bg-amber-600 disabled:opacity-50 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> ثبت خرید و افزایش موجودی</button>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuButton({ icon, title, desc, color, onClick }: { icon: React.ReactNode; title: string; desc: string; color: string; onClick: () => void }) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
    sky: "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300",
    amber: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
    violet: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300",
  };
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-right active:scale-[0.99] transition ${map[color]}`}>
      <div className="w-11 h-11 rounded-xl bg-white/70 dark:bg-black/20 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="font-bold">{title}</div>
        <div className="text-xs opacity-80">{desc}</div>
      </div>
      <ArrowRight className="w-5 h-5 opacity-60" />
    </button>
  );
}

function Guide({ mode }: { mode: Mode }) {
  const data: Record<string, { pattern: string; example: string; note?: string }> = {
    invoice: { pattern: "«[تعداد] + [نام کالا]»", example: "سه تا دفتر پاپکو", note: "چند کالا با «و»: «سه تا دفتر و دو تا خودکار». برای مشتری: «برای علی رضایی...». هر بار میکروفون را بزنید، اقلام جمع می‌شوند." },
    product: { pattern: "«[نام] قیمت خرید [عدد] قیمت فروش [عدد] تعداد [عدد]»", example: "دفتر پاپکو قیمت خرید ۴۵ هزار قیمت فروش ۶۰ هزار تعداد ۵۰" },
    purchase: { pattern: "«از [تأمین‌کننده] [تعداد] [نام کالا] دونه‌ای [عدد]»", example: "از پاپکو صد تا دفتر دونه‌ای ۴۵ هزار" },
    query: { pattern: "یک سؤال بپرسید", example: "فروش امروز چقدر بوده؟", note: "یا: «کدوم کالاها موجودیشون کمه؟»" },
  };
  const g = data[mode];
  if (!g) return null;
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 text-xs space-y-1.5">
      <div className="text-gray-500">الگوی گفتن: <span className="font-bold text-gray-700 dark:text-gray-200">{g.pattern}</span></div>
      <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 rounded-lg px-2 py-1.5">🗣️ مثال: «{g.example}»</div>
      {g.note && <div className="text-gray-500 leading-relaxed">{g.note}</div>}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm" />
    </div>
  );
}
function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input type="text" inputMode="numeric" value={toPersianDigits(value)} onChange={(e) => onChange(Number(toEnglishDigits(e.target.value)) || 0)} className="w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-center" />
    </div>
  );
}

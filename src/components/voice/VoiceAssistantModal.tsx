"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, X, CheckCircle, Trash2, Plus, ArrowRight, ShoppingBag, PackagePlus, Truck, MessageCircle, TrendingUp, Check, Send, Image as ImageIcon, Users, Pause, Barcode, Search } from "lucide-react";
import { BarcodeScannerModal } from "@/components/barcode/BarcodeScannerModal";
import { formatToman, toPersianDigits, toEnglishDigits, normalizePersianText } from "@/lib/persian/utils";
import { pushUtterance, joinTranscript } from "@/lib/voice/transcript";
import { normalizeSpokenPersian, parsePersianNumberWords } from "@/lib/voice/persianNormalizer";
import { shareInvoice, sendToWhatsapp, shareInvoiceImage } from "@/lib/invoice/share";

type Mode = "menu" | "invoice" | "product" | "purchase" | "query" | "price";

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
  stock?: number | null;
  matches?: { id: number; name: string; sellPrice: number }[];
}

interface ProductDraft { name: string; stock: number; buyPrice: number; sellPrice: number; barcode?: string; }

export function VoiceAssistantModal({ isOpen, onClose, onActionExecute, defaultMode = "menu" }: VoiceAssistantModalProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  // invoice
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  // حالت گام‌به‌گام: هر کالا را جدا می‌گویید، تأیید می‌کنید، بعد بعدی (پیشنهاد کاربر).
  // سه حالتِ فاکتور صوتی: گام‌به‌گام | یکجا | نگه‌دار و بگو
  const [invMode, setInvMode] = useState<"step" | "batch" | "hold">("step");
  // روشِ افزودن به فاکتور: سرچ‌وانتخاب | بارکد | صوتی (هر سه به همان سبدِ فاکتور اضافه می‌کنند)
  const [invInput, setInvInput] = useState<"search" | "barcode" | "voice">("search");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [invSearch, setInvSearch] = useState("");
  const [invScanOpen, setInvScanOpen] = useState(false);
  const stepMode = invMode === "step";
  const holdMode = invMode === "hold";
  const [holdLocked, setHoldLocked] = useState(false);
  const [pendingItem, setPendingItem] = useState<CartItem | null>(null);
  const [stockAlert, setStockAlert] = useState(false);
  // چند مشتریِ هم‌زمان در فاکتور صوتی: فاکتورِ فعلی را «پارک» کن، مشتریِ بعدی را شروع کن،
  // بعداً هرکدام را برگردان و ادامه بده. هر فاکتور جدا ثبت می‌شود.
  const [parkedInv, setParkedInv] = useState<{ items: CartItem[]; customerName: string; customerPhone: string; label: string; total: number }[]>([]);
  // product
  const [product, setProduct] = useState<ProductDraft | null>(null);
  const [productDup, setProductDup] = useState<any>(null); // کالای مشابهِ کشف‌شده
  // فهرستِ کالاهای صوتی: هر بار که یک کالا را می‌گویید، یک ردیفِ جدید به این جدول اضافه
  // می‌شود؛ می‌توانید ۴-۵ کالا را پشت‌سرِ هم بگویید، همه را ویرایش کنید و یکجا ثبت کنید.
  const [productDrafts, setProductDrafts] = useState<ProductDraft[]>([]);
  const [scanRowIdx, setScanRowIdx] = useState<number | null>(null); // ردیفی که برایش بارکد اسکن می‌شود
  // purchase
  const [supplierName, setSupplierName] = useState("");
  const [purchaseItems, setPurchaseItems] = useState<{ productName: string; quantity: number; unitPrice: number }[]>([]);
  // query
  const [answer, setAnswer] = useState("");
  // price update
  const [pricePreview, setPricePreview] = useState<any>(null);
  // stock update (from price panel)
  const [stockPreview, setStockPreview] = useState<any>(null);
  // فاکتور ثبت‌شده (برای نمایش کامل پس از ثبت)
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);

  const recognitionRef = useRef<any>(null);
  const modeRef = useRef<Mode>(mode);
  const transcriptRef = useRef("");
  const shouldListenRef = useRef(false); // تا کاربر خودش «توقف» نزند، ضبط ادامه دارد
  modeRef.current = mode;
  // refهای حالت‌های فاکتور
  const invModeRef = useRef(invMode); invModeRef.current = invMode;
  const stepModeRef = useRef(stepMode); stepModeRef.current = stepMode;
  const pendingItemRef = useRef<CartItem | null>(null);
  const stepProcessedRef = useRef(0); // تعدادِ نتایجِ نهاییِ پردازش‌شده در سشنِ جاری
  // refهای حالتِ «نگه‌دار و بگو» (فشار بده و نگه‌دار + بکش بالا برای قفل)
  const holdStartYRef = useRef(0);
  const holdLockedRef = useRef(false);

  useEffect(() => { if (isOpen) setMode(defaultMode); else setParkedInv([]); }, [isOpen, defaultMode]);

  // بارگذاری تنظیمِ «هشدار موجودی»
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/settings").then((r) => r.json()).then((d) => setStockAlert(!!d?.settings?.store_info?.stockAlert)).catch(() => {});
    // فهرستِ کالاها برای سرچ‌وانتخاب و بارکد در فاکتور
    fetch("/api/products").then((r) => r.json()).then((d) => setAllProducts(d.products || [])).catch(() => {});
  }, [isOpen]);

  // قفل اسکرول پس‌زمینه (موبایل)
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // committedRef: متنِ سشن‌های تمام‌شدهٔ قبلی. currentSessionRef: متنِ سشن جاری.
  const committedRef = useRef("");
  const currentSessionRef = useRef("");

  const getSR = () => (typeof window === "undefined" ? null : (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const restartTimerRef = useRef<any>(null);
  const processGuardRef = useRef(false);

  const fullText = () => joinTranscript([committedRef.current, currentSessionRef.current].filter(Boolean));

  // پردازش نهاییِ گفتار — فقط یک‌بار اجرا می‌شود (چه از onend چه از دکمهٔ توقف).
  const finalizeAndProcess = () => {
    if (processGuardRef.current) return;
    processGuardRef.current = true;
    setIsListening(false);
    // در حالت گام‌به‌گامِ فاکتور، اقلام همان لحظه ثبت شده‌اند؛ نیازی به پردازشِ کلِ متن نیست.
    if (stepModeRef.current && modeRef.current === "invoice") { setTranscript(""); return; }
    // متنی که پردازش می‌شود دقیقاً همان چیزی است که کاربر در کادر می‌بیند و تأیید کرده
    // (WYSIWYG). اگر کاربر متن را دستی اصلاح کرده باشد، همان اصلاح‌شده پردازش می‌شود؛
    // این جلوی هر اختلافِ احتمالی میان «متنِ نمایش‌داده‌شده» و «متنِ بازساخته‌شده» را
    // می‌گیرد (علت مشکل «تعداد اشتباه در فاکتور»).
    const shown = (transcriptRef.current || "").trim();
    const finalText = shown || fullText().trim();
    if (finalText) setTimeout(() => processText(finalText, modeRef.current), 120);
  };

  // یک ضبطِ «پیوسته» که از مکث‌های کوتاه رد می‌شود (تا چند کالا پشت‌سرهم گفته شود)
  // و تا وقتی کاربر خودش «توقف» نزند ادامه دارد.
  const startSession = () => {
    const SR = getSR();
    if (!SR) return;
    const rec = new SR();
    rec.lang = "fa-IR";
    rec.continuous = true;      // از مکث‌ها رد می‌شود → «فقط اولی» رفع می‌شود
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    stepProcessedRef.current = 0; // شمارندهٔ نتایجِ نهاییِ همین سشن از صفر

    rec.onresult = (event: any) => {
      // حالت گام‌به‌گام (فقط فاکتور): هر عبارتِ نهایی به‌محضِ آماده‌شدن، جداگانه پردازش می‌شود.
      if (stepModeRef.current && modeRef.current === "invoice") {
        let finalCount = 0;
        for (let i = 0; i < event.results.length; i++) if (event.results[i].isFinal) finalCount++;
        if (finalCount > stepProcessedRef.current) {
          for (let i = stepProcessedRef.current; i < finalCount; i++) {
            const phrase = String(event.results[i][0].transcript).trim();
            if (phrase) handleStepPhrase(phrase);
          }
          stepProcessedRef.current = finalCount;
        }
        // متنِ زنده را هم برای نمایش به‌روزرسانی می‌کنیم (interim آخر)
        let live = "";
        for (let i = 0; i < event.results.length; i++) if (!event.results[i].isFinal) live += event.results[i][0].transcript + " ";
        setTranscript(live.trim());
        return;
      }
      // در حالت پیوسته، event.results همیشه همهٔ نتایجِ همین سشن را دارد؛ پس هر بار
      // متنِ سشن را «از نو» می‌سازیم (نه الحاق) تا دوبرابر نشود. تکرارهای پیاپیِ نهایی
      // با pushUtterance و joinTranscript حذف می‌شوند.
      let interim = "";
      let acc: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) acc = pushUtterance(acc, String(r[0].transcript).trim());
        else interim += r[0].transcript + " ";
      }
      currentSessionRef.current = joinTranscript(acc);
      const disp = joinTranscript([committedRef.current, currentSessionRef.current].filter(Boolean), interim.trim());
      transcriptRef.current = disp;
      setTranscript(disp);
    };
    rec.onerror = (event: any) => {
      if (event.error !== "no-speech" && event.error !== "aborted") console.error("Speech:", event.error);
    };
    rec.onend = () => {
      // متنِ این سشن را به «قبلی‌ها» منتقل کن.
      committedRef.current = joinTranscript([committedRef.current, currentSessionRef.current].filter(Boolean));
      currentSessionRef.current = "";
      if (shouldListenRef.current) {
        restartTimerRef.current = setTimeout(() => { if (shouldListenRef.current) { try { startSession(); } catch { /* ignore */ } } }, 250);
      } else {
        finalizeAndProcess();
      }
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch { /* ignore */ }
  };

  useEffect(() => () => { shouldListenRef.current = false; if (restartTimerRef.current) clearTimeout(restartTimerRef.current); try { recognitionRef.current?.stop(); } catch { /* ignore */ } }, []);

  const startRecording = () => {
    if (!getSR()) { setNotice("مرورگر شما میکروفون را پشتیبانی نمی‌کند. می‌توانید متن را تایپ کنید."); return; }
    committedRef.current = "";
    currentSessionRef.current = "";
    setTranscript(""); transcriptRef.current = ""; setNotice("");
    processGuardRef.current = false;
    shouldListenRef.current = true;
    setIsListening(true);
    startSession();
  };
  // توقف دستی توسط کاربر — گفتار جمع‌آوری‌شده پردازش می‌شود.
  const stopRecording = () => {
    shouldListenRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    setTimeout(finalizeAndProcess, 500);
  };

  // --- حالتِ «نگه‌دار و بگو» (شبیه ویس تلگرام): فشار بده و نگه‌دار؛ رها کن تا ثبت شود؛
  //     بکش بالا برای قفل. از همان موتورِ ضبطِ حذف‌تکرار (startSession) استفاده می‌کند،
  //     پس مشکلِ تکرارِ کلمات را ندارد. ---
  const beginHold = (e: React.PointerEvent) => {
    e.preventDefault();
    holdStartYRef.current = e.clientY;
    holdLockedRef.current = false; setHoldLocked(false);
    startRecording();
  };
  const moveHold = (e: React.PointerEvent) => {
    if (!isListening || holdLockedRef.current) return;
    if (holdStartYRef.current - e.clientY > 60) { holdLockedRef.current = true; setHoldLocked(true); }
  };
  const endHold = () => {
    if (holdLockedRef.current) return; // قفل است؛ با دکمهٔ توقف پایان می‌یابد
    stopRecording();
  };
  const stopHold = () => { holdLockedRef.current = false; setHoldLocked(false); stopRecording(); };

  // پاسخِ صوتی — فقط اگر گوشی واقعاً «صدای فارسی» داشته باشد.
  // (علتِ «وسطِ کار به انگلیسی یه چیزی می‌گفت»: بدونِ صدای فارسی، مرورگر متنِ فارسی را
  //  با صدای انگلیسی می‌خواند و نتیجه‌اش وزوزِ نامفهوم است.)
  const speak = (t: string) => {
    try {
      if (!("speechSynthesis" in window) || !t) return;
      const voices = window.speechSynthesis.getVoices() || [];
      const fa = voices.find((v) => /^fa/i.test(v.lang));
      if (!fa) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "fa-IR"; u.voice = fa;
      window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
  };

  // ---------- حالت گام‌به‌گام ----------
  const CONFIRM_RE = /^(تایید|تاييد|تایید کن|درست|درسته|درست است|اوکی|اوکه|خوبه|بله|آره|همین|همینه|ثبت|ثبت کن|بعدی)$/;
  const CANCEL_RE = /^(نه|نه بابا|پاک|پاک کن|غلط|اشتباه|اشتباهه|دوباره|رد|رد کن|بیخیال|بی خیال|حذف|حذف کن|نیست)$/;

  // اگر عبارت «فقط یک عدد» باشد، همان را به‌عنوان تعداد برمی‌گرداند؛ وگرنه null.
  const bareQuantity = (norm: string): number | null => {
    const t = norm.replace(/(تا|عدد|بسته|دونه|دانه|کارتن|عددشو|تعداد|تعدادش|بذار|بزار|رو|را)/g, " ").replace(/\s+/g, " ").trim();
    if (!t) return null;
    if (/^\d+$/.test(toEnglishDigits(t))) return parseInt(toEnglishDigits(t), 10);
    const words = t.split(/\s+/);
    if (words.length <= 3) {
      const n = parsePersianNumberWords(t);
      if (n != null && n > 0) return n;
    }
    return null;
  };

  const commitPending = () => {
    const p = pendingItemRef.current;
    if (!p) { setNotice("چیزی برای تأیید نیست — نام کالا را بگویید."); return; }
    if (p.productId == null && p.matches && p.matches.length > 1) { setNotice(`«${p.productName}» چند کالای مشابه دارد — یکی را از بالا انتخاب کنید.`); return; }
    if (p.productId == null) { setNotice(`«${p.productName}» در انبار نیست؛ اول کالا را ثبت کنید یا کالای دیگری بگویید.`); speak("پیدا نشد"); return; }
    appendInvoiceItems([{ productId: p.productId, productName: p.productName, quantity: p.quantity, unitPrice: p.unitPrice, status: p.status, matches: p.matches }]);
    setPendingItem(null); pendingItemRef.current = null;
    setNotice(`«${p.productName}» (${toPersianDigits(p.quantity)}) به فاکتور اضافه شد. کالای بعدی را بگویید.`);
    speak("اضافه شد");
  };

  const setPending = (p: CartItem | null) => { pendingItemRef.current = p; setPendingItem(p); };

  const adjustPendingQty = (q: number) => {
    const p = pendingItemRef.current; if (!p) return;
    const up = { ...p, quantity: Math.max(1, q) };
    setPending(up);
  };

  // پردازشِ یک عبارتِ گفتاری در حالت گام‌به‌گام
  const handleStepPhrase = async (raw: string) => {
    const norm = normalizeSpokenPersian(raw).trim();
    if (!norm) return;
    if (CONFIRM_RE.test(norm)) { commitPending(); return; }
    if (CANCEL_RE.test(norm)) { setPending(null); setNotice("پاک شد — دوباره بگویید."); return; }

    // اگر فقط یک عدد گفته شد و کالای در انتظار داریم → تعدادش را تنظیم کن.
    const q = bareQuantity(norm);
    if (q != null && pendingItemRef.current) { adjustPendingQty(q); speak(`تعداد ${toPersianDigits(q)}`); return; }

    // در غیر این صورت این عبارت یک «کالا» است → با کاتالوگ تطبیق بده.
    try {
      const res = await fetch("/api/voice/process", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spokenText: norm, mode: "invoice" }),
      });
      const data = await res.json();
      const it = data?.data?.items?.[0];
      if (it) {
        setPending({ productId: it.productId ?? null, productName: it.productName, quantity: Number(it.quantity || 1), unitPrice: Number(it.unitPrice || 0), status: it.status || "EXACT", matches: it.matches?.map((mm: any) => ({ id: mm.id, name: mm.name, sellPrice: mm.sellPrice })) || [] });
        if (it.productId != null) speak(it.productName);
      } else {
        setPending({ productId: null, productName: norm, quantity: 1, unitPrice: 0, status: "NOT_FOUND" });
      }
    } catch { setNotice("خطای ارتباط."); }
  };

  const processText = async (text: string, m: Mode) => {
    if (!text.trim()) return;
    setLoading(true); setNotice("");
    try {
      const apiMode = m === "invoice" ? "invoice" : m === "product" ? "product" : m === "purchase" ? "purchase" : m === "price" ? "price" : undefined;
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
        if (p && (p.name || "").trim()) {
          // به‌جای جایگزینی، یک ردیفِ جدید اضافه می‌شود تا چند کالا را پشت‌سرِ هم بگویید.
          setProductDrafts((prev) => [...prev, { name: p.name, stock: p.stock || 1, buyPrice: p.buyPrice || 0, sellPrice: p.sellPrice || 0, barcode: "" }]);
          setNotice(`«${p.name}» به جدول اضافه شد. کالای بعدی را بگویید یا قیمت/بارکد را همین‌جا اصلاح کنید.`);
          setTranscript("");
        } else setNotice("کالایی تشخیص داده نشد. دوباره واضح‌تر بگویید.");
      } else if (m === "purchase") {
        if (data.data?.supplierName && data.data.supplierName !== "تامین‌کننده عمومی") setSupplierName(data.data.supplierName);
        const its = (data.data?.items || []).map((x: any) => ({ productName: x.productName, quantity: x.quantity || 1, unitPrice: x.unitPrice || 0 }));
        setPurchaseItems((prev) => [...prev, ...its]);
        setNotice(its.length ? "به لیست خرید اضافه شد." : "کالایی تشخیص داده نشد.");
      } else if (m === "query") {
        setAnswer(data.speechResponse || "پاسخی یافت نشد.");
        speak(data.speechResponse || "");
      } else if (m === "price") {
        if (data.type === "STOCK_UPDATE_PREVIEW") {
          setStockPreview(data.data || null);
          setPricePreview(null);
        } else {
          setPricePreview(data.data || null);
          setStockPreview(null);
        }
        setNotice(data.speechResponse || "");
      }
    } catch { setNotice("خطای ارتباط با سرور."); }
    finally { setLoading(false); }
  };

  // افزودنِ یک کالای انتخاب‌شده (از سرچ یا بارکد) به سبدِ فاکتور
  const addProductToInvoice = (p: any) => {
    appendInvoiceItems([{ productId: p.id, productName: p.name, quantity: 1, unitPrice: p.sellPrice, status: "EXACT", stock: p.stock }]);
    setNotice(`«${p.name}» به فاکتور اضافه شد.`);
  };
  // بارکدِ خوانده‌شده در فاکتور → کالای متناظر را اضافه کن (حالت پیوسته: برچسب برمی‌گرداند)
  const onInvBarcode = (code: string): string | void | null => {
    const c = String(code).trim();
    const p = allProducts.find((x) => (x.barcode || "").trim() === c);
    if (p) { addProductToInvoice(p); return p.name; }
    setNotice(`بارکد ${toPersianDigits(c)} در انبار پیدا نشد.`);
    return null;
  };
  // نتایجِ سرچ (نام یا بارکد؛ ارقام فارسی/انگلیسی یکسان)
  const invSearchResults = (() => {
    const q = normalizePersianText(invSearch.trim());
    if (!q) return [] as any[];
    return allProducts.filter((p) => normalizePersianText(p.name).includes(q) || (p.barcode || "").includes(toEnglishDigits(invSearch.trim()))).slice(0, 20);
  })();

  const appendInvoiceItems = (newItems: any[]) => {
    setItems((prev) => {
      const next = [...prev];
      for (const it of newItems) {
        const idx = it.productId != null ? next.findIndex((x) => x.productId === it.productId) : -1;
        if (idx > -1) next[idx] = { ...next[idx], quantity: next[idx].quantity + Number(it.quantity || 1) };
        else next.push({ productId: it.productId ?? null, productName: it.productName, quantity: Number(it.quantity || 1), unitPrice: Number(it.unitPrice || 0), status: it.status || "EXACT", stock: it.stock ?? null, matches: it.matches?.map((mm: any) => ({ id: mm.id, name: mm.name, sellPrice: mm.sellPrice })) || [] });
      }
      return next;
    });
  };

  const resetAll = () => { setItems([]); setCustomerName(""); setCustomerPhone(""); setProduct(null); setProductDup(null); setProductDrafts([]); setScanRowIdx(null); setStockPreview(null); setSupplierName(""); setPurchaseItems([]); setAnswer(""); setPricePreview(null); setCreatedInvoice(null); setNotice(""); setTranscript(""); setInvSearch(""); setInvScanOpen(false); pendingItemRef.current = null; setPendingItem(null); };

  // ---------- جدولِ کالاهای صوتی: ویرایش/افزودن/حذفِ ردیف + ثبتِ گروهی ----------
  const setDraftCell = (i: number, key: keyof ProductDraft, value: any) => setProductDrafts((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  const addDraftRow = () => setProductDrafts((prev) => [...prev, { name: "", stock: 1, buyPrice: 0, sellPrice: 0, barcode: "" }]);
  const removeDraftRow = (i: number) => setProductDrafts((prev) => prev.filter((_, idx) => idx !== i));

  const submitAllProducts = async () => {
    const list = productDrafts.filter((p) => p.name.trim());
    if (!list.length) { setNotice("حداقل یک کالا با نام لازم است."); return; }
    setLoading(true);
    try {
      let created = 0;
      const dups: { p: ProductDraft; matchedName: string }[] = [];
      for (const p of list) {
        const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...p, confirmNew: false }) });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.duplicate) dups.push({ p, matchedName: data.duplicate.name });
        else if (res.ok) created++;
      }
      if (dups.length > 0) {
        const listTxt = dups.map((d) => `• ${d.p.name}  (مشابهِ: ${d.matchedName})`).join("\n");
        if (window.confirm(`${toPersianDigits(created)} کالا ثبت شد.\n\n${toPersianDigits(dups.length)} کالا مشابهِ کالای موجود بودند:\n${listTxt}\n\nاین‌ها را هم به‌عنوانِ کالای جدید ثبت کنم؟`)) {
          for (const d of dups) { const r = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...d.p, confirmNew: true }) }); if (r.ok) created++; }
        }
      }
      speak("کالاها ثبت شد");
      setNotice(`${toPersianDigits(created)} کالا با موفقیت ثبت شد. ✅`);
      setProductDrafts([]); setTranscript("");
      onActionExecute?.("REFRESH_PRODUCTS", null);
    } catch { setNotice("خطای ارتباط."); } finally { setLoading(false); }
  };

  // حذفِ یک کالا از لیستِ پیش‌نمایشِ قیمت/موجودی (تا در اعمال دخالت نکند).
  const removePricePreviewItem = (id: number) => setPricePreview((prev: any) => prev ? { ...prev, items: prev.items.filter((x: any) => x.id !== id), affectedCount: prev.items.filter((x: any) => x.id !== id).length } : prev);
  const removeStockPreviewItem = (id: number) => setStockPreview((prev: any) => prev ? { ...prev, items: prev.items.filter((x: any) => x.id !== id), affectedCount: prev.items.filter((x: any) => x.id !== id).length } : prev);

  const applyPriceUpdate = async () => {
    if (!pricePreview || !pricePreview.items?.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/products/bulk-price", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percent: pricePreview.percent, amount: pricePreview.amount, changeMode: pricePreview.changeMode, direction: pricePreview.direction, productIds: pricePreview.items.map((x: any) => x.id) }),
      });
      const data = await res.json();
      if (res.ok) { speak("قیمت‌ها به‌روزرسانی شد"); setNotice(`قیمت ${toPersianDigits(data.count)} کالا به‌روزرسانی شد. ✅`); setPricePreview(null); setTranscript(""); onActionExecute?.("REFRESH_PRODUCTS", null); }
      else setNotice(data.error || "خطا در تغییر قیمت.");
    } catch { setNotice("خطای ارتباط."); } finally { setLoading(false); }
  };
  const applyStockUpdate = async () => {
    if (!stockPreview || !stockPreview.items?.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/products/stock-update", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: stockPreview.mode, amount: stockPreview.amount, productIds: stockPreview.items.map((x: any) => x.id) }),
      });
      const data = await res.json();
      if (res.ok) { speak("موجودی به‌روزرسانی شد"); setNotice(`موجودی ${toPersianDigits(data.count)} کالا به‌روزرسانی شد. ✅`); setStockPreview(null); setTranscript(""); onActionExecute?.("REFRESH_PRODUCTS", null); }
      else setNotice(data.error || "خطا در تغییر موجودی.");
    } catch { setNotice("خطای ارتباط."); } finally { setLoading(false); }
  };
  const goMenu = () => { resetAll(); setParkedInv([]); setMode("menu"); };

  const invoiceTotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const invoiceUnresolved = items.some((it) => it.productId == null);

  // ---------- پارک کردن فاکتورِ فعلی و رفتن به مشتریِ دیگر ----------
  const labelFor = (name: string, n: number) => (name && name.trim() ? name.trim() : `مشتری ${toPersianDigits(n)}`);
  const parkCurrentInv = () => {
    if (!items.length) { setNotice("فاکتور خالی است — چیزی برای پارک نیست."); return; }
    setParkedInv((p) => [...p, { items, customerName, customerPhone, label: labelFor(customerName, p.length + 1), total: invoiceTotal }]);
    setItems([]); setCustomerName(""); setCustomerPhone(""); setPending(null); setTranscript("");
    setNotice("فاکتور پارک شد ⏸ — حالا مشتریِ بعدی را شروع کنید. برای برگشت، روی نامِ مشتری بزنید.");
  };
  const resumeParkedInv = (idx: number) => {
    const target = parkedInv[idx];
    if (!target) return;
    const rest = parkedInv.filter((_, i) => i !== idx);
    // اگر فاکتورِ فعلی خالی نیست، آن را هم پارک کن تا از دست نرود.
    if (items.length) rest.push({ items, customerName, customerPhone, label: labelFor(customerName, parkedInv.length + 1), total: invoiceTotal });
    setParkedInv(rest);
    setItems(target.items); setCustomerName(target.customerName || ""); setCustomerPhone(target.customerPhone || ""); setPending(null); setTranscript("");
    setNotice(`برگشتید به فاکتورِ «${target.label}». ادامه دهید.`);
  };

  const submitInvoice = async () => {
    if (!items.length) { setNotice("لیست خالی است."); return; }
    // هشدارِ غیرمسدودکنندهٔ موجودی (اگر در تنظیمات فعال باشد)
    if (stockAlert) {
      const short = items.filter((it) => it.stock != null && it.quantity > (it.stock as number));
      if (short.length > 0) {
        const list = short.map((it) => `• ${it.productName}: موجودی ${toPersianDigits(it.stock as number)}، درخواست ${toPersianDigits(it.quantity)}`).join("\n");
        if (!window.confirm(`⚠️ موجودیِ این کالاها کافی نیست:\n\n${list}\n\nبا این حال فاکتور ثبت شود؟`)) return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: customerName || "مشتری عمومی", customerPhone: customerPhone || null, items: items.map((it) => ({ productId: it.productId, productName: it.productName, quantity: it.quantity, unitPrice: it.unitPrice, totalPrice: it.unitPrice * it.quantity })), notes: "ثبت صوتی" }),
      });
      const data = await res.json();
      if (res.ok) {
        speak("فاکتور ثبت شد");
        // نمایش کامل فاکتور همان‌جا (نه رفتن به صفحهٔ دیگر)
        setCreatedInvoice({
          id: data.invoice?.id,
          number: data.invoice?.invoiceNumber || "",
          customerName: customerName || "مشتری عمومی",
          customerPhone: customerPhone || "",
          items: items.map((it) => ({ productName: it.productName, quantity: it.quantity, unitPrice: it.unitPrice, totalPrice: it.unitPrice * it.quantity })),
          total: invoiceTotal,
        });
      } else setNotice(data.error || "خطا در ثبت فاکتور.");
    } catch { setNotice("خطای ارتباط."); } finally { setLoading(false); }
  };

  const submitProduct = async (confirmNew = false) => {
    if (!product || !product.name) { setNotice("نام کالا را وارد کنید."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...product, confirmNew }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.duplicate) {
        // کالای مشابهی پیدا شد — از کاربر بپرس جدید است یا همان قبلی.
        setProductDup(data.duplicate);
      } else if (res.ok) {
        speak("کالا ثبت شد");
        setNotice(`کالای «${product.name}» ثبت شد. ✅ می‌توانید کالای بعدی را بگویید.`);
        setProduct(null); setProductDup(null); setTranscript("");
        onActionExecute?.("REFRESH_PRODUCTS", null);
      } else setNotice(data.error || "خطا در ثبت کالا.");
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
    menu: "دستیار صوتی", invoice: "🧾 ثبت فاکتور", product: "📦 ثبت کالای صوتی", purchase: "🛒 خرید صوتی", query: "💬 پرسش صوتی", price: "📈 تغییر قیمت صوتی",
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
              <MenuButton icon={<ShoppingBag />} title="ثبت فاکتور" desc="با سرچ و انتخاب، بارکد، یا صدا — هر سه در یک صفحه" color="emerald" onClick={() => { resetAll(); setMode("invoice"); }} />
              <MenuButton icon={<PackagePlus />} title="ثبت کالای صوتی" desc="افزودن کالای جدید همراه قیمت خرید و فروش" color="sky" onClick={() => { resetAll(); setMode("product"); }} />
              <MenuButton icon={<Truck />} title="خرید صوتی" desc="ثبت خرید از تأمین‌کننده و افزایش موجودی" color="amber" onClick={() => { resetAll(); setMode("purchase"); }} />
              <MenuButton icon={<TrendingUp />} title="تغییر قیمت صوتی" desc="افزایش/کاهش درصدی قیمت همه یا گروهی از کالاها" color="rose" onClick={() => { resetAll(); setMode("price"); }} />
              <MenuButton icon={<MessageCircle />} title="پرسش صوتی" desc="مثلاً: فروش امروز چقدر بوده؟" color="violet" onClick={() => { resetAll(); setMode("query"); }} />
            </div>
          )}

          {/* ---------- Invoice success (full invoice shown here) ---------- */}
          {mode === "invoice" && createdInvoice && (
            <div className="space-y-3">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto mb-2"><CheckCircle className="w-8 h-8" /></div>
                <div className="font-bold text-emerald-700 dark:text-emerald-400">فاکتور با موفقیت ثبت شد ✅</div>
                <div className="text-xs text-gray-500 mt-1">شماره: {toPersianDigits(createdInvoice.number)}</div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm font-bold flex justify-between"><span>مشتری: {createdInvoice.customerName}</span></div>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500"><tr><th className="p-2 text-right">کالا</th><th className="p-2">تعداد</th><th className="p-2">قیمت</th><th className="p-2">جمع</th></tr></thead>
                  <tbody>
                    {createdInvoice.items.map((it: any, i: number) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="p-2 text-right">{it.productName}</td>
                        <td className="p-2 text-center">{toPersianDigits(it.quantity)}</td>
                        <td className="p-2 text-center">{formatToman(it.unitPrice)}</td>
                        <td className="p-2 text-center font-bold">{formatToman(it.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-sm font-extrabold">
                  <span>مبلغ کل</span><span className="text-emerald-700 dark:text-emerald-400">{formatToman(createdInvoice.total)}</span>
                </div>
              </div>
              {/* ارسال فاکتور برای مشتری */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => shareInvoiceImage({ invoiceNumber: createdInvoice.number, customerName: createdInvoice.customerName, items: createdInvoice.items, total: createdInvoice.total }, createdInvoice.customerPhone)} className="bg-sky-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><ImageIcon className="w-4 h-4" /> ارسال عکسِ فاکتور</button>
                <button onClick={() => shareInvoice({ invoiceNumber: createdInvoice.number, customerName: createdInvoice.customerName, items: createdInvoice.items, total: createdInvoice.total }, createdInvoice.customerPhone)} className="bg-gray-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><Send className="w-4 h-4" /> ارسال متن</button>
              </div>
              {createdInvoice.customerPhone && (
                <button onClick={() => sendToWhatsapp({ invoiceNumber: createdInvoice.number, customerName: createdInvoice.customerName, items: createdInvoice.items, total: createdInvoice.total }, createdInvoice.customerPhone)} className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">واتساپ به {toPersianDigits(createdInvoice.customerPhone)}</button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { resetAll(); }} className="bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> فاکتور جدید</button>
                <button onClick={() => { resetAll(); onActionExecute?.("NAVIGATE_INVOICE", createdInvoice.id); onClose(); }} className="border border-gray-300 dark:border-gray-700 py-2.5 rounded-xl text-sm">بستن</button>
              </div>
              {/* مشتریانِ پارک‌شده — برای ادامهٔ فاکتورِ نفرِ بعدی */}
              {parkedInv.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-2.5 space-y-2">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1"><Users className="w-4 h-4" /> مشتریانِ پارک‌شده — ادامه دهید:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {parkedInv.map((p, i) => (
                      <button key={i} onClick={() => { setCreatedInvoice(null); resumeParkedInv(i); }} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                        {p.label} <span className="opacity-60">({toPersianDigits(p.items.length)})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------- SHARED: mic + guide (non-menu) ---------- */}
          {mode !== "menu" && !(mode === "invoice" && createdInvoice) && (
            <>
              {/* روشِ افزودن به فاکتور: سرچ‌وانتخاب | بارکد | صوتی */}
              {mode === "invoice" && (
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl grid grid-cols-3 gap-1 text-xs font-bold">
                  <button onClick={() => setInvInput("search")} className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${invInput === "search" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-300"}`}><Search className="w-4 h-4" /> سرچ و انتخاب</button>
                  <button onClick={() => setInvInput("barcode")} className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${invInput === "barcode" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-300"}`}><Barcode className="w-4 h-4" /> بارکد</button>
                  <button onClick={() => setInvInput("voice")} className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${invInput === "voice" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-300"}`}><Mic className="w-4 h-4" /> صوتی</button>
                </div>
              )}

              {/* پنل سرچ و انتخاب */}
              {mode === "invoice" && invInput === "search" && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input autoFocus value={invSearch} onChange={(e) => setInvSearch(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && invSearchResults.length > 0) { addProductToInvoice(invSearchResults[0]); setInvSearch(""); } }}
                      placeholder="نامِ کالا یا بارکد را بنویسید…" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl pr-9 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  {invSearch.trim() && (
                    invSearchResults.length === 0 ? (
                      <div className="text-center text-xs text-gray-400 py-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">کالایی پیدا نشد.</div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {invSearchResults.map((p) => (
                          <button key={p.id} onClick={() => { addProductToInvoice(p); setInvSearch(""); }} className="w-full flex items-center justify-between gap-2 text-right bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition">
                            <span className="text-sm font-medium truncate flex-1">{p.name}</span>
                            <span className="text-xs text-gray-500 shrink-0">موجودی {toPersianDigits(p.stock)}</span>
                            <span className="text-sm font-bold text-emerald-600 shrink-0">{formatToman(p.sellPrice)}</span>
                            <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* پنل بارکد */}
              {mode === "invoice" && invInput === "barcode" && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center space-y-3">
                  <p className="text-xs text-emerald-800 dark:text-emerald-200">دوربین را روی بارکدِ کالا بگیرید تا به فاکتور اضافه شود. می‌توانید چند بارکد را پشت‌سرِ هم بزنید.</p>
                  <button onClick={() => setInvScanOpen(true)} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Barcode className="w-5 h-5" /> باز کردن دوربینِ بارکد</button>
                </div>
              )}

              {/* انتخاب حالتِ صوتی (فقط وقتی روشِ «صوتی» فعال است): گام‌به‌گام | یکجا | نگه‌دار و بگو */}
              {mode === "invoice" && invInput === "voice" && (
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl flex gap-1 text-[11px] font-bold">
                  <button onClick={() => { setInvMode("step"); setPending(null); }} className={`flex-1 py-2 rounded-xl transition ${invMode === "step" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-300"}`}>گام‌به‌گام ✅</button>
                  <button onClick={() => { setInvMode("hold"); setPending(null); }} className={`flex-1 py-2 rounded-xl transition ${invMode === "hold" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-300"}`}>نگه‌دار و بگو 🎙️</button>
                  <button onClick={() => { setInvMode("batch"); setPending(null); }} className={`flex-1 py-2 rounded-xl transition ${invMode === "batch" ? "bg-emerald-600 text-white shadow" : "text-gray-600 dark:text-gray-300"}`}>یکجا</button>
                </div>
              )}

              {/* بخشِ صوتی: راهنما + میکروفون (برای فاکتور فقط وقتی روشِ «صوتی» است؛ برای بقیهٔ حالت‌ها همیشه) */}
              {(mode !== "invoice" || invInput === "voice") && (<>
              {mode === "invoice" && stepMode ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3 text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                  🎙️ میکروفون را بزنید و <b>نامِ یک کالا</b> را بگویید (مثلاً «دفتر ۸۰ برگ میکرو»). کالا پایین نشان داده می‌شود؛ اگر درست بود بگویید <b>«تأیید»</b> یا دکمهٔ سبز را بزنید. برای تعداد فقط عدد را بگویید («سه»). ضبط قطع نمی‌شود تا همهٔ کالاها را بگویید.
                </div>
              ) : mode === "invoice" && holdMode ? (
                <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-3 text-xs leading-relaxed text-purple-800 dark:text-purple-200">
                  🎙️ دکمهٔ میکروفون را <b>نگه دارید</b> و بگویید (مثلاً «دو تا دفتر ۸۰ برگ»)؛ وقتی <b>رها کردید</b> به فاکتور اضافه می‌شود. برای اینکه دستتان آزاد بماند، همان‌طور که نگه داشته‌اید <b>به بالا بکشید</b> تا قفل شود. (بدونِ تکرارِ کلمات ✅)
                </div>
              ) : (
                <Guide mode={mode} />
              )}

              <div className="flex flex-col items-center gap-2">
                {mode === "invoice" && holdMode && isListening && !holdLocked && (
                  <div className="text-[11px] font-bold text-gray-500 flex items-center gap-1 animate-bounce"><ArrowRight className="w-3.5 h-3.5 -rotate-90" /> برای قفل به بالا بکشید</div>
                )}
                {mode === "invoice" && holdMode ? (
                  <button
                    onPointerDown={beginHold}
                    onPointerMove={moveHold}
                    onPointerUp={endHold}
                    onPointerCancel={endHold}
                    style={{ touchAction: "none" }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg select-none transition ${isListening ? "bg-rose-500 ring-8 ring-rose-200 dark:ring-rose-900/40 scale-110" : "bg-purple-600 ring-8 ring-purple-100 dark:ring-purple-950/40"}`}
                  >
                    <Mic className="w-9 h-9" />
                  </button>
                ) : (
                  <button
                    onClick={() => (isListening ? stopRecording() : startRecording())}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition ${isListening ? "bg-rose-500 animate-pulse ring-8 ring-rose-200 dark:ring-rose-900/40" : "bg-emerald-600 ring-8 ring-emerald-100 dark:ring-emerald-950/40"}`}
                  >
                    {isListening ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-9 h-9" />}
                  </button>
                )}
                {mode === "invoice" && holdMode && holdLocked && (
                  <button onClick={stopHold} className="bg-rose-600 text-white px-6 py-2 rounded-xl text-xs font-bold">🔒 توقف و ثبت</button>
                )}
                <span className={`text-xs text-center px-2 font-bold ${isListening ? "text-rose-600" : "text-gray-500"}`}>{isListening ? (mode === "invoice" && stepMode ? "🔴 در حال شنیدن — یک کالا بگویید، تأیید کنید، بعد بعدی. پایان: دکمهٔ ⏹" : mode === "invoice" && holdMode ? "🔴 در حال شنیدن — بگویید و رها کنید" : "🔴 در حال ضبط — چند کالا را پشت‌سرهم بگویید، بعد برای پایان، همین دکمه (⏹) را بزنید.") : (mode === "invoice" && holdMode ? "دکمه را نگه دارید و بگویید" : "میکروفون را بزنید و صحبت کنید")}</span>
              </div>

              {/* کارتِ کالای در انتظارِ تأیید (حالت گام‌به‌گام) */}
              {mode === "invoice" && stepMode && pendingItem && (
                <div className={`rounded-2xl p-3 border-2 ${pendingItem.productId == null ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30" : "border-emerald-400 bg-white dark:bg-gray-900"}`}>
                  <div className="text-[11px] text-gray-500 mb-1">کالای شنیده‌شده — تأیید می‌کنید؟</div>
                  <div className="font-extrabold text-base text-gray-900 dark:text-white">{pendingItem.productName}</div>
                  {pendingItem.productId == null && pendingItem.matches && pendingItem.matches.length > 1 ? (
                    // چند کالای هم‌نام: به‌جای انتخابِ دلبخواه، خودتان انتخاب می‌کنید.
                    <div className="mt-2">
                      <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-1">❓ چند کالا با این نام هست — کدام؟</div>
                      <div className="flex flex-wrap gap-1.5">
                        {pendingItem.matches.map((mm) => (
                          <button key={mm.id} onClick={() => setPending({ ...pendingItem, productId: mm.id, productName: mm.name, unitPrice: mm.sellPrice, status: "EXACT", matches: [] })}
                            className="text-[11px] px-2 py-1 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                            {mm.name} <span className="opacity-70">({formatToman(mm.sellPrice)})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : pendingItem.productId == null ? (
                    <div className="text-xs text-rose-600 mt-1">در انبار پیدا نشد. دوباره بگویید یا کالای دیگری بگویید.</div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs">تعداد:</span>
                          <button onClick={() => adjustPendingQty(pendingItem.quantity - 1)} className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold text-lg">−</button>
                          <span className="w-8 text-center font-extrabold">{toPersianDigits(pendingItem.quantity)}</span>
                          <button onClick={() => adjustPendingQty(pendingItem.quantity + 1)} className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold text-lg">+</button>
                        </div>
                        <span className="text-emerald-600 font-bold">{formatToman(pendingItem.unitPrice * pendingItem.quantity)}</span>
                      </div>
                      <button onClick={commitPending} className="w-full mt-3 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> تأیید و افزودن به فاکتور</button>
                    </>
                  )}
                  <button onClick={() => setPending(null)} className="w-full mt-2 border border-gray-300 dark:border-gray-700 py-2 rounded-xl text-xs">رد / دوباره می‌گویم</button>
                </div>
              )}

              {/* نمایشِ زندهٔ متن در حالتِ «نگه‌دار و بگو» */}
              {mode === "invoice" && holdMode && transcript && (
                <div className="w-full text-center text-sm bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-200">{transcript}</div>
              )}

              {/* کادر متن + دکمهٔ افزودن (در حالت گام‌به‌گام و نگه‌دار نمایش داده نمی‌شود) */}
              {!(mode === "invoice" && (stepMode || holdMode)) && (
                <div className="space-y-2">
                  <textarea value={transcript} onChange={(e) => { setTranscript(e.target.value); transcriptRef.current = e.target.value; }} placeholder="متن گفتار شما اینجا می‌آید (قابل ویرایش)..." rows={2}
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button onClick={() => processText(transcript, mode)} disabled={loading || !transcript.trim()} className="w-full bg-emerald-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> {mode === "invoice" ? "افزودن به فاکتور" : mode === "purchase" ? "افزودن به خرید" : mode === "product" ? "افزودن کالا به جدول" : mode === "price" ? "محاسبهٔ قیمت جدید" : "پرسیدن"}
                  </button>
                </div>
              )}
              </>)}

              {loading && <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm"><div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> پردازش...</div>}
              {notice && <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-200">{notice}</div>}
            </>
          )}

          {/* ---------- INVOICE list ---------- */}
          {mode === "invoice" && !createdInvoice && (
            <div className="space-y-3">
              {/* نوارِ چند مشتریِ هم‌زمان: پارک و رفتن به مشتریِ بعدی/قبلی */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-2 flex items-center gap-1.5 flex-wrap">
                <button onClick={parkCurrentInv} disabled={!items.length} className="bg-amber-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"><Pause className="w-3.5 h-3.5" /> پارک و مشتریِ بعدی</button>
                {parkedInv.map((p, i) => (
                  <button key={i} onClick={() => resumeParkedInv(i)} className="bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-gray-300 dark:border-gray-700 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1" title="برگشت به این مشتری">
                    <Users className="w-3.5 h-3.5 text-amber-600" /> {p.label} <span className="opacity-60">({toPersianDigits(p.items.length)})</span>
                  </button>
                ))}
                {parkedInv.length === 0 && <span className="text-[11px] text-gray-400">مشتریِ دیگری منتظر است؟ فاکتور را «پارک» کنید، بعد برگردید.</span>}
              </div>
              <div>
                <label className="text-xs text-gray-500">مشتری (اختیاری)</label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="مشتری عمومی" className="w-full mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm" />
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} inputMode="tel" placeholder="📱 شماره موبایل مشتری (برای ارسال فاکتور)" className="w-full mt-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-left font-mono" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">🧾 اقلام ({toPersianDigits(items.length)})</span>
                {items.length > 0 && <button onClick={() => setItems([])} className="text-xs text-rose-600 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> پاک کردن</button>}
              </div>
              {items.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">هنوز چیزی اضافه نشده — میکروفون را بزنید و بگویید.</div>
              ) : items.map((it, i) => {
                const ambiguous = it.status === "AMBIGUOUS" && !!(it.matches && it.matches.length > 1);
                return (
                <div key={i} className={`rounded-xl p-2.5 border ${it.productId == null ? "border-rose-300 bg-rose-50 dark:bg-rose-950/30" : ambiguous ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate flex-1">{it.productName}</span>
                    <button onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  {/* انتخاب‌گر ابهام: چند کالای مشابه */}
                  {ambiguous && (
                    <div className="mt-2">
                      <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-1">❓ چند کالای مشابه پیدا شد — کدام را می‌خواهید؟</div>
                      <div className="flex flex-wrap gap-1.5">
                        {it.matches!.map((mm) => (
                          <button key={mm.id}
                            onClick={() => setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, productId: mm.id, productName: mm.name, unitPrice: mm.sellPrice, matches: [] } : x))}
                            className={`text-[11px] px-2 py-1 rounded-lg border ${it.productId === mm.id ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"}`}>
                            {mm.name} <span className="opacity-70">({formatToman(mm.sellPrice)})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {it.productId == null && <div className="text-[11px] text-rose-600 mt-1">در انبار پیدا نشد — حذفش کنید یا اول کالا را ثبت کنید</div>}

                  <div className="flex items-center justify-between mt-2 text-xs">
                    <div className="flex items-center gap-1"><span className="text-gray-500">تعداد:</span>
                      {/* اصلاح یک‌ضربه‌ایِ تعداد اگر صدا اشتباه شنیده شد */}
                      <button type="button" onClick={() => setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))} className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold shrink-0">−</button>
                      <input type="text" inputMode="numeric" value={toPersianDigits(it.quantity)} onChange={(e) => { const v = Number(toEnglishDigits(e.target.value)) || 0; setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: v } : x)); }} className="w-12 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1" />
                      <button type="button" onClick={() => setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: x.quantity + 1 } : x))} className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold shrink-0">+</button>
                    </div>
                    <span className="text-gray-500">{formatToman(it.unitPrice)}</span>
                    <span className="font-bold">{formatToman(it.unitPrice * it.quantity)}</span>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* ---------- PRODUCT: جدولِ چند کالا (قابل ویرایش + اسکنِ بارکد در هر ردیف) ---------- */}
          {mode === "product" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-sky-800 dark:text-sky-300">📦 کالاها ({toPersianDigits(productDrafts.length)})</span>
                <div className="flex gap-2">
                  <button onClick={addDraftRow} className="text-xs text-sky-600 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> ردیف خالی</button>
                  {productDrafts.length > 0 && <button onClick={() => setProductDrafts([])} className="text-xs text-rose-600">پاک کردن</button>}
                </div>
              </div>

              {productDrafts.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">هنوز کالایی گفته نشده — میکروفون را بزنید و نامِ کالا را بگویید (مثلاً «دفتر ۸۰ برگ خرید ۵۰ فروش ۸۰»). هر کالا یک ردیفِ جدید می‌سازد.</div>
              ) : (
                <div className="space-y-2">
                  {productDrafts.map((p, i) => (
                    <div key={i} className="border border-sky-200 dark:border-sky-900 rounded-2xl p-3 bg-sky-50 dark:bg-sky-950/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-sky-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{toPersianDigits(i + 1)}</span>
                        <input value={p.name} onChange={(e) => setDraftCell(i, "name", e.target.value)} placeholder="نام کالا" className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm font-bold" />
                        <button onClick={() => removeDraftRow(i)} className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="block"><span className="text-[10px] text-gray-500">موجودی</span>
                          <input inputMode="numeric" value={p.stock ? toPersianDigits(p.stock) : ""} onChange={(e) => setDraftCell(i, "stock", Number(toEnglishDigits(e.target.value)) || 0)} className="w-full text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1.5 text-sm" /></label>
                        <label className="block"><span className="text-[10px] text-gray-500">قیمت خرید</span>
                          <input inputMode="numeric" value={p.buyPrice ? toPersianDigits(p.buyPrice) : ""} onChange={(e) => setDraftCell(i, "buyPrice", Number(toEnglishDigits(e.target.value)) || 0)} className="w-full text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1.5 text-sm" /></label>
                        <label className="block"><span className="text-[10px] text-gray-500">قیمت فروش</span>
                          <input inputMode="numeric" value={p.sellPrice ? toPersianDigits(p.sellPrice) : ""} onChange={(e) => setDraftCell(i, "sellPrice", Number(toEnglishDigits(e.target.value)) || 0)} className="w-full text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1.5 text-sm" /></label>
                      </div>
                      {/* بارکد + دستیارِ اسکن */}
                      <div className="flex gap-2">
                        <input value={p.barcode || ""} onChange={(e) => setDraftCell(i, "barcode", e.target.value)} placeholder="بارکد (اختیاری)" className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm font-mono text-left" />
                        <button onClick={() => setScanRowIdx(i)} className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"><Barcode className="w-4 h-4" /> اسکن</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={submitAllProducts} disabled={loading} className="w-full bg-sky-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"><CheckCircle className="w-4 h-4" /> ثبتِ همهٔ کالاها ({toPersianDigits(productDrafts.filter((p) => p.name.trim()).length)})</button>
                </div>
              )}
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

          {/* ---------- PRICE preview ---------- */}
          {mode === "price" && pricePreview && pricePreview.affectedCount > 0 && (
            <div className="border border-rose-200 dark:border-rose-900 rounded-2xl p-3 bg-rose-50 dark:bg-rose-950/20 space-y-2">
              <div className="font-bold text-sm text-rose-800 dark:text-rose-300">
                {pricePreview.direction === "decrease" ? "کاهش" : "افزایش"} {pricePreview.changeMode === "amount" ? formatToman(pricePreview.amount) : `${toPersianDigits(pricePreview.percent)}٪`} قیمت — {toPersianDigits(pricePreview.affectedCount)} کالا
                {pricePreview.filterName ? ` («${pricePreview.filterName}»)` : " (همه)"}
              </div>
              <div className="text-[11px] text-gray-500">کالاهایی که نمی‌خواهید را با 🗑 حذف کنید تا تغییر نکنند:</div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {pricePreview.items.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between gap-2 text-xs bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5">
                    <button onClick={() => removePricePreviewItem(s.id)} className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    <span className="truncate flex-1">{s.name}</span>
                    <span className="text-gray-400 line-through mx-1">{formatToman(s.oldPrice)}</span>
                    <span className="font-bold text-rose-700 dark:text-rose-400">{formatToman(s.newPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- STOCK preview (from price panel) ---------- */}
          {mode === "price" && stockPreview && stockPreview.affectedCount > 0 && (
            <div className="border border-indigo-200 dark:border-indigo-900 rounded-2xl p-3 bg-indigo-50 dark:bg-indigo-950/20 space-y-2">
              <div className="font-bold text-sm text-indigo-800 dark:text-indigo-300">
                {stockPreview.mode === "increase" ? "افزایش" : stockPreview.mode === "decrease" ? "کاهش" : "تنظیم"} موجودی — {toPersianDigits(stockPreview.affectedCount)} کالا
                {stockPreview.filterName ? ` («${stockPreview.filterName}»)` : " (همه)"}
              </div>
              <div className="text-[11px] text-gray-500">کالاهایی که نمی‌خواهید را با 🗑 حذف کنید:</div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {stockPreview.items.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between gap-2 text-xs bg-white dark:bg-gray-900 rounded-lg px-2 py-1.5">
                    <button onClick={() => removeStockPreviewItem(s.id)} className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    <span className="truncate flex-1">{s.name}</span>
                    <span className="text-gray-400 line-through mx-1">{toPersianDigits(s.oldStock)}</span>
                    <span className="font-bold text-indigo-700 dark:text-indigo-400">{toPersianDigits(s.newStock)} {s.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {mode === "invoice" && !createdInvoice && (
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
        {mode === "price" && pricePreview && pricePreview.affectedCount > 0 && (
          <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 p-3">
            <button onClick={applyPriceUpdate} disabled={loading} className="w-full bg-rose-600 disabled:opacity-50 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> اعمال قیمت‌های جدید</button>
          </div>
        )}
        {mode === "price" && stockPreview && stockPreview.affectedCount > 0 && (
          <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 p-3">
            <button onClick={applyStockUpdate} disabled={loading} className="w-full bg-indigo-600 disabled:opacity-50 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> اعمال موجودی جدید</button>
          </div>
        )}
      </div>

      {/* اسکنِ بارکد برای یک ردیفِ کالای صوتی — روی همین پنجره باز می‌شود (z بالاتر) */}
      <BarcodeScannerModal
        isOpen={scanRowIdx !== null}
        onClose={() => setScanRowIdx(null)}
        onDetected={(code) => { if (scanRowIdx !== null) setDraftCell(scanRowIdx, "barcode", code); }}
      />

      {/* اسکنِ بارکد برای افزودن به فاکتور (پیوسته: چند بارکد پشت‌سرِ هم) */}
      <BarcodeScannerModal
        isOpen={invScanOpen}
        continuous
        onClose={() => setInvScanOpen(false)}
        onDetected={onInvBarcode}
      />
    </div>
  );
}

function MenuButton({ icon, title, desc, color, onClick }: { icon: React.ReactNode; title: string; desc: string; color: string; onClick: () => void }) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
    sky: "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300",
    amber: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
    violet: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300",
    rose: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
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
    invoice: { pattern: "«[تعداد] + [نام کالا]»", example: "سه تا دفتر پاپکو و دو تا خودکار", note: "چند کالا را پشت‌سرهم با «و» یا «بعدی» بگویید: «سه تا دفتر بعدی دو تا خودکار». وقتی تمام شد دکمهٔ توقف (⏹) را بزنید. برای مشتری: «برای علی رضایی...»." },
    product: { pattern: "«[نام] قیمت خرید [عدد] قیمت فروش [عدد] تعداد [عدد]»", example: "دفتر پاپکو قیمت خرید ۴۵ هزار قیمت فروش ۶۰ هزار تعداد ۵۰" },
    purchase: { pattern: "«از [تأمین‌کننده] [تعداد] [نام کالا] دونه‌ای [عدد]»", example: "از پاپکو صد تا دفتر دونه‌ای ۴۵ هزار" },
    query: { pattern: "یک سؤال بپرسید", example: "فروش امروز چقدر بوده؟", note: "یا: «کدوم کالاها موجودیشون کمه؟»" },
    price: { pattern: "«قیمت [کالا/گروه/همه] را [عدد] درصد یا [عدد] تومان زیاد/کم کن»", example: "قیمت دفتر ۵۰ برگ میکرو رو ۵۰ هزار تومان زیاد کن", note: "درصدی: «قیمت دفترها رو ۲۰ درصد زیاد کن». مبلغی: «قیمت خودکار رو ۵ هزار تومان بیشتر کن». یک کالای خاص یا همه. موجودی هم: «موجودی دفتر پاپکو رو ۵۰ کن». قبل از اعمال، پیش‌نمایش و امکانِ حذفِ موارد را دارید." },
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

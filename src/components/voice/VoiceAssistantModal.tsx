"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, X, Volume2, CheckCircle, AlertTriangle, Sparkles, ShoppingBag, PlusCircle, HelpCircle } from "lucide-react";
import { formatToman, toPersianDigits } from "@/lib/persian/utils";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionExecute?: (actionType: string, payload: any) => void;
}

export function VoiceAssistantModal({ isOpen, onClose, onActionExecute }: VoiceAssistantModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceResult, setVoiceResult] = useState<any>(null);
  const [speechFeedback, setSpeechResponse] = useState<string>("");
  const recognitionRef = useRef<any>(null);
  // آیا کاربر می‌خواهد ضبط ادامه یابد؟ (کنترل دستی شروع/توقف)
  const shouldListenRef = useRef(false);
  // متن نهاییِ انباشته‌شده در طول ضبط (حتی با قطع‌وصل‌های مرورگر)
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    // Initialize Web Speech API if supported
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "fa-IR";
        // ضبط پیوسته: تا وقتی کاربر خودش «توقف» را نزند، گوش می‌دهد.
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              finalTranscriptRef.current += res[0].transcript + " ";
            } else {
              interim += res[0].transcript;
            }
          }
          const combined = (finalTranscriptRef.current + interim).trim();
          setTranscript(combined);
          setInputText(combined);
        };

        recognition.onerror = (event: any) => {
          // no-speech را نادیده می‌گیریم تا ضبط طولانی قطع نشود
          if (event.error === "no-speech" || event.error === "aborted") return;
          console.error("Speech recognition error:", event.error);
        };

        recognition.onend = () => {
          // اگر کاربر هنوز «توقف» را نزده، ضبط را ادامه بده (رفع قطع خودکار مرورگر).
          if (shouldListenRef.current) {
            try {
              recognition.start();
            } catch {
              /* گاهی start سریع پشت‌سرهم خطا می‌دهد؛ نادیده */
            }
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      }
    }
    return () => {
      shouldListenRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  // شروع ضبط دستی
  const startListening = () => {
    if (!recognitionRef.current) {
      alert("مرورگر شما از تشخیص صوتی مستقیم پشتیبانی نمی‌کند. می‌توانید متن دستور را تایپ فرمایید.");
      return;
    }
    setTranscript("");
    setInputText("");
    setVoiceResult(null);
    setSpeechResponse("");
    finalTranscriptRef.current = "";
    shouldListenRef.current = true;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error(err);
    }
  };

  // توقف دستی — و پردازش خودکار همان یک گفتار طولانی
  const stopListening = () => {
    shouldListenRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setIsListening(false);
    const finalText = (finalTranscriptRef.current || inputText).trim();
    if (finalText) {
      // کمی صبر تا آخرین نتایج نهایی برسند، سپس خودکار «فاکتور/کالا» را بده
      setTimeout(() => handleProcessText(finalText), 350);
    }
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleProcessText = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    setLoading(true);
    setSpeechResponse("");
    try {
      const res = await fetch("/api/voice/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spokenText: textToProcess }),
      });
      const data = await res.json();
      if (res.ok) {
        setVoiceResult(data);
        setSpeechResponse(data.speechResponse || "دستور پردازش شد.");
        speakText(data.speechResponse);
      } else {
        setSpeechResponse(data.error || "خطا در پردازش دستور صوتی");
      }
    } catch (error) {
      setSpeechResponse("خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && text) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "fa-IR";
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("TTS error", e);
      }
    }
  };

  const handleConfirmAction = async () => {
    if (!voiceResult) return;
    setLoading(true);

    try {
      if (voiceResult.type === "CREATE_PRODUCT_CONFIRMATION") {
        const prod = voiceResult.data.product;
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prod),
        });
        if (res.ok) {
          alert(`کالای ${prod.name} با موفقیت ثبت شد.`);
          if (onActionExecute) onActionExecute("REFRESH_PRODUCTS", null);
          onClose();
        } else {
          alert("خطا در ثبت کالا");
        }
      } else if (voiceResult.type === "CREATE_INVOICE_CONFIRMATION") {
        const invData = voiceResult.data;
        const res = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: invData.customerName,
            items: invData.items,
            notes: "ثبت شده با دستیار صوتی",
          }),
        });
        if (res.ok) {
          const invJson = await res.json();
          alert(`فاکتور ${invJson.invoice.invoiceNumber} با موفقیت صادر شد.`);
          if (onActionExecute) onActionExecute("NAVIGATE_INVOICE", invJson.invoice.id);
          onClose();
        } else {
          alert("خطا در صدور فاکتور");
        }
      } else if (voiceResult.type === "CREATE_PURCHASE_CONFIRMATION") {
        const purData = voiceResult.data;
        const res = await fetch("/api/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supplierName: purData.supplierName,
            items: purData.items,
            notes: "ثبت شده با دستیار صوتی",
          }),
        });
        if (res.ok) {
          alert("فاکتور خرید با موفقیت ثبت شد.");
          if (onActionExecute) onActionExecute("REFRESH_PURCHASES", null);
          onClose();
        }
      }
    } catch (err) {
      alert("خطا در اجرای عملیات");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/20 text-gray-800 dark:text-gray-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-emerald-200 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg">دستیار هوشمند صوتی فروشگاه</h3>
              <p className="text-xs text-emerald-100">پردازش زبان طبیعی فارسی و صدور سریع فاکتور</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">

          {/* Big Interactive Mic Button */}
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <button
              onClick={toggleListening}
              className={`relative group w-24 h-24 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
                isListening
                  ? "bg-rose-500 text-white shadow-rose-500/50 animate-pulse ring-8 ring-rose-200 dark:ring-rose-900/50"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/40 ring-8 ring-emerald-100 dark:ring-emerald-950/50"
              }`}
            >
              {isListening ? (
                <MicOff className="w-10 h-10 animate-bounce" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
              {isListening
                ? "🔴 در حال ضبط... هر چقدر می‌خواهید بگویید، بعد روی همین دکمه بزنید تا متوقف شود و فاکتور ساخته شود."
                : "روی میکروفون بزنید و شروع به صحبت کنید (شروع و توقف کاملاً با شماست)"}
            </span>
          </div>

          {/* Sample Prompts */}
          {!voiceResult && !inputText && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/40">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-2">
                <HelpCircle className="w-4 h-4" /> نمونه جملات قابل فهم:
              </div>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 list-disc list-inside">
                <li>«برای علی رضایی سه تا دفتر پاپکو و دو تا مداد استدلر بزن»</li>
                <li>«دفتر پاپکو ۸۰ برگ، تعداد ۵۰ تا، قیمت خرید ۴۵ هزار تومان، قیمت فروش ۶۰ هزار»</li>
                <li>«فروش امروز چقدر بوده؟»</li>
                <li>«کدوم کالاها موجودیشون کمه؟»</li>
                <li>«از شرکت پاپکو ۱۰۰ تا دفتر خریدم، دونه‌ای ۴۵ هزار»</li>
              </ul>
            </div>
          )}

          {/* Text Input Fallback */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleProcessText(inputText)}
              placeholder="یا دستور خود را اینجا بنویسید..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleProcessText(inputText)}
              disabled={loading || !inputText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              پردازش
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm py-4">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <span>در حال تحلیل هوشمند زبان طبیعی...</span>
            </div>
          )}

          {/* Speech Feedback & Results */}
          {speechFeedback && (
            <div className="bg-gray-100 dark:bg-gray-800/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                {speechFeedback}
              </p>
            </div>
          )}

          {/* Confirmation Box for Sensitive Actions */}
          {voiceResult && voiceResult.data && (
            <div className="space-y-4">
              {/* Product Confirmation Card */}
              {voiceResult.type === "CREATE_PRODUCT_CONFIRMATION" && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-3">
                  <div className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" /> پیش‌نمایش ثبت کالا:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">نام کالا:</span> <strong>{voiceResult.data.product.name}</strong></div>
                    <div><span className="text-gray-500">تعداد:</span> <strong>{toPersianDigits(voiceResult.data.product.stock)}</strong></div>
                    <div><span className="text-gray-500">قیمت خرید:</span> <strong>{formatToman(voiceResult.data.product.buyPrice)}</strong></div>
                    <div><span className="text-gray-500">قیمت فروش:</span> <strong>{formatToman(voiceResult.data.product.sellPrice)}</strong></div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleConfirmAction}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> ثبت کالا در سیستم
                    </button>
                  </div>
                </div>
              )}

              {/* Invoice Confirmation Card */}
              {voiceResult.type === "CREATE_INVOICE_CONFIRMATION" && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-3">
                  <div className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" /> پیش‌نمایش فاکتور صوتی:
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    مشتری: <strong>{voiceResult.data.customerName}</strong>
                  </p>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-right">
                      <thead className="bg-emerald-100/60 dark:bg-emerald-900/50 text-gray-700 dark:text-gray-300">
                        <tr>
                          <th className="p-2">نام محصول</th>
                          <th className="p-2">تعداد</th>
                          <th className="p-2">قیمت واحد</th>
                          <th className="p-2">جمع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {voiceResult.data.items.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium">{item.productName}</td>
                            <td className="p-2">{toPersianDigits(item.quantity)}</td>
                            <td className="p-2">{formatToman(item.unitPrice)}</td>
                            <td className="p-2 font-bold">{formatToman(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <span>مبلغ کل فاکتور:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 text-sm">{formatToman(voiceResult.data.totalAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleConfirmAction}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> صدور و ثبت نهایی فاکتور
                    </button>
                  </div>
                </div>
              )}

              {/* Purchase Confirmation Card */}
              {voiceResult.type === "CREATE_PURCHASE_CONFIRMATION" && (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-300 dark:border-amber-800 space-y-3">
                  <div className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" /> پیش‌نمایش خرید صوتی:
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    تأمین‌کننده: <strong>{voiceResult.data.supplierName}</strong>
                  </p>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-right">
                      <thead className="bg-amber-100/60 dark:bg-amber-900/50 text-gray-700 dark:text-gray-300">
                        <tr>
                          <th className="p-2">نام محصول</th>
                          <th className="p-2">تعداد</th>
                          <th className="p-2">قیمت خرید</th>
                          <th className="p-2">جمع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {voiceResult.data.items.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium">{item.productName}</td>
                            <td className="p-2">{toPersianDigits(item.quantity)}</td>
                            <td className="p-2">{formatToman(item.unitPrice)}</td>
                            <td className="p-2 font-bold">{formatToman(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <span>مبلغ کل خرید:</span>
                    <span className="text-amber-700 dark:text-amber-400 text-sm">{formatToman(voiceResult.data.totalAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleConfirmAction}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> ثبت نهایی خرید و افزایش موجودی
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

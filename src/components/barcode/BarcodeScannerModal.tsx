"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Barcode, Check, ListChecks } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * وقتی بارکدی خوانده می‌شود صدا زده می‌شود. در حالت پیوسته (continuous) می‌تواند یک
   * برچسب برای نمایش در لیست برگرداند (مثلاً نام کالا)، یا null اگر کالا پیدا نشد.
   */
  onDetected: (barcode: string) => string | void | null;
  /** حالت اسکن پیوسته: پس از هر اسکن بسته نمی‌شود و لیست اسکن‌ها را نشان می‌دهد. */
  continuous?: boolean;
}

interface ScanRow { code: string; label: string; ok: boolean; }

export function BarcodeScannerModal({ isOpen, onClose, onDetected, continuous = false }: BarcodeScannerModalProps) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [status, setStatus] = useState("در حال روشن‌کردن دوربین...");
  const [scans, setScans] = useState<ScanRow[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<any>(null);
  const doneRef = useRef(false);
  // برای جلوگیری از ثبت مکررِ یک بارکد در حالت پیوسته
  const lastCodeRef = useRef<string>("");
  const lastTimeRef = useRef<number>(0);

  const cleanup = () => {
    try { controlsRef.current?.stop(); } catch { /* ignore */ }
    controlsRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleCode = (code: string) => {
    if (continuous) {
      // debounce: همان کد را در بازهٔ ۲.۵ ثانیه دوباره ثبت نکن
      const now = Date.now();
      if (code === lastCodeRef.current && now - lastTimeRef.current < 2500) return;
      lastCodeRef.current = code;
      lastTimeRef.current = now;
      const label = onDetected(code);
      const ok = typeof label === "string" && label.length > 0;
      setScans((prev) => [{ code, label: ok ? String(label) : "در انبار پیدا نشد", ok }, ...prev].slice(0, 30));
      try { (navigator as any).vibrate?.(60); } catch { /* ignore */ }
      setStatus("اسکن شد ✅ — بارکد بعدی را بگیرید...");
    } else {
      if (doneRef.current) return;
      doneRef.current = true;
      cleanup();
      onDetected(code);
      onClose();
    }
  };

  const start = async () => {
    doneRef.current = false;
    setStatus("در حال روشن‌کردن دوربین...");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("مرورگر شما از دوربین پشتیبانی نمی‌کند. کد را دستی وارد کنید.");
        return;
      }
      // ۱) دوربین را خودمان باز و به ویدیو وصل می‌کنیم تا حتماً تصویر بیاید.
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play().catch(() => {});
      setStatus("دوربین را روی بارکد بگیرید...");

      // ۲) از همان ویدیوی درحال‌پخش، بارکد را می‌خوانیم. کنترل‌ها باز می‌مانند تا در
      //    حالت پیوسته چند بارکد پشت‌سرهم خوانده شود.
      const reader = new BrowserMultiFormatReader();
      controlsRef.current = await reader.decodeFromVideoElement(video, (result: any) => {
        if (result) handleCode(String(result.getText()));
      });
    } catch (err) {
      console.error("Scanner error:", err);
      setStatus("دسترسی به دوربین ممکن نشد. مطمئن شوید سایت با https باز شده و اجازهٔ دوربین را داده‌اید — یا کد را دستی وارد کنید.");
    }
  };

  useEffect(() => {
    if (isOpen) { setScans([]); lastCodeRef.current = ""; lastTimeRef.current = 0; start(); }
    else cleanup();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualBarcode.trim();
    if (!code) return;
    setManualBarcode("");
    handleCode(code);
  };

  const handleClose = () => { cleanup(); onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4">
      <div className="bg-white dark:bg-gray-900 w-full h-full sm:h-auto sm:max-w-lg sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 sm:max-h-[95vh] flex flex-col">
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm"><Barcode className="w-5 h-5" /> {continuous ? "اسکن چندتایی بارکد" : "اسکن بارکد کالا"}</div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-emerald-700 transition"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-3 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* دوربینِ بزرگ — روی موبایل بیشترِ صفحه را می‌گیرد تا اسکن آسان باشد */}
          <div className="relative h-[58vh] sm:h-auto sm:aspect-[4/5] bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-emerald-500">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4/5 h-0.5 bg-rose-500 animate-pulse shadow-[0_0_12px_2px_rgba(244,63,94,0.9)]" />
            <div className="absolute inset-0 border-2 border-dashed border-emerald-400 opacity-50 rounded-xl pointer-events-none m-10" />
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white bg-black/70 px-4 py-1.5 text-sm rounded-full text-center max-w-[90%]">{status}</span>
          </div>

          {/* لیست اسکن‌ها (فقط در حالت پیوسته) */}
          {continuous && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1"><ListChecks className="w-4 h-4 text-emerald-600" /> اسکن‌شده‌ها ({scans.length})</span>
                {scans.length > 0 && <button onClick={() => setScans([])} className="text-[11px] text-rose-600">پاک کردن لیست</button>}
              </div>
              {scans.length === 0 ? (
                <div className="text-center text-[11px] text-gray-400 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">هنوز چیزی اسکن نشده — بارکدها را یکی‌یکی جلوی دوربین بگیرید.</div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {scans.map((s, i) => (
                    <div key={i} className={`flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5 border ${s.ok ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"}`}>
                      <span className={`font-bold ${s.ok ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>{s.ok ? "✓ " : "✕ "}{s.label}</span>
                      <span className="font-mono text-[10px] text-gray-500">{s.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">ورود دستی کد یا اسکن با بارکدخوان فیزیکی:</label>
            <div className="flex gap-2">
              <input type="text" value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} placeholder="مثال: 6260000111001"
                className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-left font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1"><Check className="w-4 h-4" /> {continuous ? "افزودن" : "تایید"}</button>
            </div>
          </form>

          {continuous && (
            <button onClick={handleClose} className="w-full bg-gray-800 dark:bg-gray-700 text-white py-2.5 rounded-xl text-sm font-bold">تمام شد ({scans.filter((s) => s.ok).length} کالا)</button>
          )}
        </div>
      </div>
    </div>
  );
}

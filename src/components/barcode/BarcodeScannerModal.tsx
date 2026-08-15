"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Barcode, Check } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
}

export function BarcodeScannerModal({ isOpen, onClose, onDetected }: BarcodeScannerModalProps) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [status, setStatus] = useState("در حال آماده‌سازی دوربین...");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<any>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const doneRef = useRef(false);

  const stop = () => {
    try { controlsRef.current?.stop(); } catch { /* ignore */ }
    controlsRef.current = null;
  };

  const finish = (code: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    stop();
    onDetected(code);
    onClose();
  };

  const start = async () => {
    doneRef.current = false;
    setStatus("دوربین را روی بارکد بگیرید...");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("دوربین در دسترس نیست. کد را دستی وارد کنید.");
        return;
      }
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      // decodeFromVideoDevice خودش دوربین را باز می‌کند و مدام اسکن می‌کند.
      controlsRef.current = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result, _err, controls) => {
          if (result) {
            controls.stop();
            finish(result.getText());
          }
        }
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setStatus("دسترسی به دوربین ممکن نشد. مطمئن شوید سایت https است و اجازهٔ دوربین را داده‌اید — یا کد را دستی وارد کنید.");
    }
  };

  useEffect(() => {
    if (isOpen) start();
    else stop();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) finish(manualBarcode.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm"><Barcode className="w-5 h-5" /> اسکن بارکد کالا</div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-700 transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-emerald-500">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4/5 h-0.5 bg-rose-500 animate-pulse" />
            <div className="absolute inset-0 border-2 border-dashed border-emerald-400 opacity-50 rounded-xl pointer-events-none m-8" />
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white bg-black/60 px-3 py-1 text-xs rounded-full">{status}</span>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">ورود دستی کد یا اسکن با بارکدخوان فیزیکی:</label>
            <div className="flex gap-2">
              <input type="text" value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} placeholder="مثال: 6260000111001"
                className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-left font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1"><Check className="w-4 h-4" /> تایید</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

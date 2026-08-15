"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Barcode, Check } from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
}

export function BarcodeScannerModal({ isOpen, onClose, onDetected }: BarcodeScannerModalProps) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [status, setStatus] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<any>(null);
  const stoppedRef = useRef(false);

  const stopCamera = () => {
    stoppedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const finish = (code: string) => {
    stopCamera();
    onDetected(code);
    onClose();
  };

  const startCamera = async () => {
    stoppedRef.current = false;
    setStatus("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("مرورگر شما از دوربین پشتیبانی نمی‌کند. کد را دستی وارد کنید.");
        return;
      }
      // دوربین فقط روی https یا localhost کار می‌کند.
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // موتور تشخیص بارکد مرورگر (Chrome/Edge روی اندروید پشتیبانی می‌کنند).
      const BD = (window as any).BarcodeDetector;
      if (BD) {
        try {
          detectorRef.current = new BD({
            formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e", "qr_code", "itf"],
          });
          setScanning(true);
          setStatus("دوربین را روی بارکد بگیرید...");
          scanLoop();
        } catch {
          setStatus("تشخیص خودکار در این مرورگر فعال نشد — کد را دستی وارد کنید یا از بارکدخوان فیزیکی استفاده کنید.");
        }
      } else {
        setStatus("این مرورگر تشخیص خودکار بارکد ندارد. کد را دستی وارد کنید یا از بارکدخوان فیزیکی استفاده کنید (کروم اندروید توصیه می‌شود).");
      }
    } catch (err) {
      console.error("Camera error:", err);
      setStatus("دسترسی به دوربین ممکن نشد. مطمئن شوید سایت https است و اجازهٔ دوربین را داده‌اید.");
    }
  };

  const scanLoop = async () => {
    if (stoppedRef.current || !videoRef.current || !detectorRef.current) return;
    try {
      const codes = await detectorRef.current.detect(videoRef.current);
      if (codes && codes.length > 0 && codes[0].rawValue) {
        finish(String(codes[0].rawValue));
        return;
      }
    } catch {
      /* فریم آماده نبود؛ ادامه */
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  };

  useEffect(() => {
    if (isOpen) startCamera();
    else stopCamera();
    return () => stopCamera();
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
          <div className="flex items-center gap-2 font-bold text-sm">
            <Barcode className="w-5 h-5" /> اسکن بارکد کالا
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-emerald-500">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4/5 h-0.5 ${scanning ? "bg-rose-500 animate-pulse" : "bg-emerald-400/60"}`} />
            <div className="absolute inset-0 border-2 border-dashed border-emerald-400 opacity-50 rounded-xl pointer-events-none m-8" />
            {scanning && <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white bg-black/60 px-3 py-1 text-xs rounded-full">در حال جستجوی بارکد...</span>}
          </div>

          {status && <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed text-center">{status}</p>}

          <form onSubmit={handleManualSubmit} className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              ورود دستی کد یا اسکن با بارکدخوان فیزیکی:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="مثال: 6260000111001"
                className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-left font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> تایید
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

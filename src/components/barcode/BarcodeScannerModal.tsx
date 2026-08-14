"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Camera, Barcode, Check, RefreshCw } from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
}

export function BarcodeScannerModal({ isOpen, onClose, onDetected }: BarcodeScannerModalProps) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } else {
        alert("دستگاه شما از دوربین پشتیبانی نمی‌کند یا دسترسی محدود شده است.");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("امکان دسترسی به دوربین وجود ندارد.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onDetected(manualBarcode.trim());
      onClose();
    }
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
          {/* Camera View */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-emerald-500">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-dashed border-emerald-400 opacity-60 rounded-xl pointer-events-none m-8 flex items-center justify-center">
              <span className="text-white bg-black/60 px-3 py-1 text-xs rounded-full">
                بارکد را در این کادر قرار دهید
              </span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              ورود دستی کد یا اسکن با بارکدخوان فیزیکی:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="مثال: 6260000111001"
                className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-left font-mono"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
              >
                <Check className="w-4 h-4" /> تایید
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

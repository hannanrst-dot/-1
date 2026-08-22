"use client";

import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

/**
 * ثبتِ سرویس‌ورکر + دکمهٔ «نصبِ برنامه».
 *
 * با این کار برنامه روی گوشی مثلِ یک اپِ واقعی نصب می‌شود: آیکون روی صفحهٔ خانه،
 * باز شدنِ تمام‌صفحه بدونِ نوارِ آدرسِ مرورگر. چون موتورش همان کرومِ گوشی است،
 * میکروفون و دوربینِ بارکد دقیقاً مثلِ قبل کار می‌کنند (برخلافِ APKهای WebView که
 * تشخیصِ گفتار در آن‌ها اصلاً پشتیبانی نمی‌شود).
 */
export function InstallApp() {
  const [deferred, setDeferred] = useState<any>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // ثبتِ سرویس‌ورکر (فقط روی https یا localhost کار می‌کند)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => { /* مهم نیست */ });
    }

    const onPrompt = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      // اگر قبلاً «بعداً» را زده باشند، دوباره اذیت نمی‌کنیم.
      try { if (localStorage.getItem("hideInstall") === "1") return; } catch { /* ignore */ }
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => { setHidden(true); setDeferred(null); });
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch { /* ignore */ }
    setDeferred(null);
    setHidden(true);
  };

  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem("hideInstall", "1"); } catch { /* ignore */ }
  };

  if (hidden || !deferred) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-3 right-3 z-40 mx-auto max-w-md">
      <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-2xl p-3 flex items-center gap-3">
        <img src="/icon-192.png" alt="" className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-900 dark:text-white">نصبِ برنامه روی گوشی</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">آیکون روی صفحهٔ خانه، بازشدنِ تمام‌صفحه — مثلِ یک اپ.</div>
        </div>
        <button onClick={install} className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
          <Download className="w-4 h-4" /> نصب
        </button>
        <button onClick={dismiss} aria-label="بعداً" className="p-1 text-gray-400 shrink-0"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

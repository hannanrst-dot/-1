"use client";

import React, { useEffect, useState } from "react";

/**
 * صفحهٔ «تعمیر». اگر برنامه روی گوشی گیر کرد و با رفرش درست نشد، این آدرس را باز کنید:
 *   <آدرسِ سایت>/fix
 * این صفحه سرویس‌ورکرِ باقی‌مانده و همهٔ حافظهٔ موقتِ برنامه را پاک می‌کند.
 * عمداً هیچ وابستگیِ سنگینی ندارد تا حتی وقتی بقیهٔ برنامه بالا نمی‌آید کار کند.
 */
export default function FixPage() {
  const [log, setLog] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const add = (s: string) => setLog((p) => [...p, s]);

  const run = async () => {
    setLog([]); setDone(false);
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        add(`سرویس‌ورکرهای یافت‌شده: ${regs.length}`);
        for (const r of regs) { try { await r.unregister(); } catch { /* ignore */ } }
        add("سرویس‌ورکرها حذف شدند ✅");
      } else add("این مرورگر سرویس‌ورکر ندارد.");
    } catch { add("حذفِ سرویس‌ورکر ممکن نشد."); }

    try {
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        add(`حافظه‌های موقت: ${keys.length}`);
        for (const k of keys) { try { await caches.delete(k); } catch { /* ignore */ } }
        add("حافظهٔ موقت پاک شد ✅");
      }
    } catch { add("پاک‌کردنِ حافظهٔ موقت ممکن نشد."); }

    try { localStorage.clear(); sessionStorage.clear(); add("تنظیماتِ محلی پاک شد ✅"); } catch { /* ignore */ }

    add("تمام شد. حالا دکمهٔ پایین را بزنید.");
    setDone(true);
  };

  useEffect(() => { run(); }, []);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f9fafb", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 440, width: "100%", background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 10px 40px rgba(0,0,0,.08)" }}>
        <div style={{ fontSize: 40, textAlign: "center" }}>🧹</div>
        <h2 style={{ textAlign: "center", fontSize: 18, margin: "8px 0 4px" }}>تعمیر و پاک‌سازیِ برنامه</h2>
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: 12.5, lineHeight: 1.9, marginTop: 0 }}>
          حافظهٔ موقت و سرویس‌ورکرِ باقی‌مانده پاک می‌شود. اطلاعاتِ فروشگاه (کالاها و فاکتورها) روی سرور است و دست نمی‌خورد.
        </p>

        <div style={{ background: "#f3f4f6", borderRadius: 12, padding: 12, fontSize: 12.5, lineHeight: 2, minHeight: 90 }}>
          {log.map((l, i) => <div key={i}>• {l}</div>)}
        </div>

        <button
          onClick={() => location.replace("/?fresh=" + Date.now())}
          disabled={!done}
          style={{ width: "100%", marginTop: 14, background: done ? "#059669" : "#9ca3af", color: "#fff", border: 0, padding: "13px 0", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: done ? "pointer" : "default" }}
        >
          بازکردنِ برنامه
        </button>
        <button onClick={run} style={{ width: "100%", marginTop: 8, background: "#fff", color: "#374151", border: "1px solid #d1d5db", padding: "11px 0", borderRadius: 14, fontSize: 13 }}>
          یک بار دیگر پاک کن
        </button>
      </div>
    </div>
  );
}

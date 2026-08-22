"use client";

/**
 * صفحهٔ خطای سراسری.
 *
 * اگر هر جای برنامه خطای غیرمنتظره‌ای رخ دهد، به‌جای صفحهٔ سفید یا پیامِ عمومیِ
 * مرورگر («هنگام بارگیری این صفحه خطایی رخ داد»)، این صفحه نشان داده می‌شود:
 * متنِ واقعیِ خطا را می‌گوید و یک دکمهٔ «پاک‌سازی و تلاش دوباره» دارد که حافظهٔ
 * موقتِ مرورگر و سرویس‌ورکرِ باقی‌مانده را پاک می‌کند — همان چیزی که خطاهای
 * ماندگارِ «هرچه رفرش می‌کنم درست نمی‌شود» را برطرف می‌کند.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const hardReset = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
      }
    } catch { /* ignore */ }
    try {
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
      }
    } catch { /* ignore */ }
    try { localStorage.clear(); sessionStorage.clear(); } catch { /* ignore */ }
    location.replace("/?fresh=" + Date.now());
  };

  return (
    <html lang="fa" dir="rtl">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f9fafb", color: "#111827" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ maxWidth: 440, width: "100%", background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 10px 40px rgba(0,0,0,.08)", textAlign: "center" }}>
            <div style={{ fontSize: 44 }}>⚠️</div>
            <h2 style={{ margin: "8px 0", fontSize: 18 }}>برنامه با یک خطا روبه‌رو شد</h2>
            <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.9, margin: "8px 0 16px" }}>
              اگر این خطا تکرار می‌شود، دکمهٔ زیر حافظهٔ موقتِ برنامه را پاک می‌کند و معمولاً مشکل را برطرف می‌کند.
            </p>

            <button onClick={hardReset} style={{ width: "100%", background: "#059669", color: "#fff", border: 0, padding: "13px 0", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              پاک‌سازی و تلاش دوباره
            </button>
            <button onClick={() => reset()} style={{ width: "100%", marginTop: 8, background: "#fff", color: "#374151", border: "1px solid #d1d5db", padding: "11px 0", borderRadius: 14, fontSize: 13, cursor: "pointer" }}>
              فقط تلاش دوباره
            </button>

            {/* متنِ خطا — برای اینکه بتوانید از آن عکس بگیرید و بفرستید */}
            <details style={{ marginTop: 16, textAlign: "right" }}>
              <summary style={{ fontSize: 12, color: "#6b7280", cursor: "pointer" }}>جزئیاتِ فنیِ خطا (برای فرستادن عکس)</summary>
              <pre style={{ direction: "ltr", textAlign: "left", background: "#f3f4f6", padding: 10, borderRadius: 10, fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 220, overflow: "auto" }}>
{String(error?.name || "Error")}: {String(error?.message || "")}
{error?.digest ? "\ndigest: " + error.digest : ""}
{"\n"}{String(error?.stack || "").split("\n").slice(0, 8).join("\n")}
              </pre>
            </details>
          </div>
        </div>
      </body>
    </html>
  );
}

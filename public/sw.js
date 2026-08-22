/*
 * سرویس‌ورکرِ «نوشت‌افزار حنان»
 *
 * قاعدهٔ طلایی: این یک برنامهٔ فروشگاهی است و داده‌ها (قیمت، موجودی، فاکتور) باید
 * همیشه تازه باشند. پس هیچ‌وقت پاسخِ /api/ کش نمی‌شود و هیچ صفحه‌ای از کش
 * جلوترِ شبکه سرو نمی‌شود. کش فقط برای دو کار است:
 *   ۱) فایل‌های ثابتِ ساخت (_next/static و آیکون‌ها) که نامشان هش دارد و کهنه نمی‌شوند.
 *   ۲) نمایشِ یک صفحهٔ آفلاینِ محترمانه وقتی اینترنت قطع است.
 */
const VERSION = "hannan-v28";
const STATIC_CACHE = VERSION + "-static";
const PAGE_CACHE = VERSION + "-pages";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((c) => c.addAll(["/icon-192.png", "/icon-512.png", "/manifest.webmanifest"]))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;                    // POST/PUT/DELETE هرگز دست‌کاری نمی‌شوند

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;     // فونت و منابعِ بیرونی: دستِ نزن
  if (url.pathname.startsWith("/api/")) return;        // دادهٔ زنده: همیشه از شبکه، بدونِ کش

  // فایل‌های ثابتِ ساخت: نامشان هش دارد، پس کش‌اول امن و سریع است.
  const isStatic = url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|woff2?)$/.test(url.pathname);
  if (isStatic) {
    event.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(STATIC_CACHE).then((c) => c.put(req, copy)); }
          return res;
        })
      )
    );
    return;
  }

  // صفحه‌ها: همیشه اول شبکه (تا هیچ‌وقت صفحهٔ کهنه نبینید)؛ کش فقط پشتیبانِ حالتِ آفلاین.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(PAGE_CACHE).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) =>
            hit || new Response(
              '<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8">' +
              '<meta name="viewport" content="width=device-width,initial-scale=1">' +
              '<title>آفلاین</title><body style="font-family:system-ui;background:#f9fafb;color:#111827;' +
              'display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">' +
              '<div><div style="font-size:48px">📶</div><h2>اینترنت قطع است</h2>' +
              '<p style="color:#6b7280;font-size:14px">برای کار با فاکتورها و کالاها به اینترنت نیاز است.<br>' +
              'وصل که شدید، همین صفحه را دوباره باز کنید.</p></div></body></html>',
              { headers: { "Content-Type": "text/html; charset=utf-8" } }
            )
          )
        )
    );
  }
});

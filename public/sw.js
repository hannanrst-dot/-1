/*
 * سرویس‌ورکرِ «خودحذف‌کن».
 *
 * نسخهٔ ۲۸ یک سرویس‌ورکرِ کش‌دار داشت که باعثِ خطای ماندگارِ «هنگام بارگیری این صفحه
 * خطایی رخ داد» می‌شد — و چون سرویس‌ورکر روی گوشی نصب می‌ماند، بارگیریِ مجدد هم
 * درستش نمی‌کرد. این فایل جایگزینِ آن است و تنها کارش این است که خودش و همهٔ
 * کش‌هایش را پاک کند و کنار برود.
 *
 * مرورگر فایلِ /sw.js را دوباره می‌گیرد، این نسخه را می‌بیند، و گوشی‌های گرفتار
 * خودبه‌خود آزاد می‌شوند. هیچ درخواستی دیگر دست‌کاری نمی‌شود.
 */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) { /* مهم نیست */ }
      try { await self.registration.unregister(); } catch (e) { /* مهم نیست */ }
      try {
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((c) => c.navigate(c.url));   // یک بار تازه‌سازی، بدونِ سرویس‌ورکر
      } catch (e) { /* مهم نیست */ }
    })()
  );
});

// هیچ fetchای را دست نمی‌گیریم — همه‌چیز مستقیم از شبکه.

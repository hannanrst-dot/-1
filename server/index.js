'use strict';
/**
 * نقطه ورود سرور — راه‌اندازی Express، اتصال ماژول‌ها و سرو کردن رابط کاربری.
 * تمام APIها با پیشوند /api/<module> در دسترس هستند.
 */
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./config');
const { migrate } = require('./db');
const { seed, isEmpty } = require('./db/seed');

console.log('[ثبت‌یار] مسیر دیتابیس:', config.databaseFile);
migrate(); // اطمینان از وجود جداول

// اگر دیتابیس خالی است (اولین اجرا روی هاست)، خودکار کاربر مدیر و داده‌های
// نمونه ساخته می‌شود تا برنامه بدون هیچ دستور دستی «آماده» بالا بیاید.
if (isEmpty()) {
  const withSamples = process.env.SEED_SAMPLE_DATA !== 'false';
  seed({ withSamples, log: (m) => console.log('[seed]', m) });
}

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.session.secret));

// --- ماژول‌های API (هر ماژول مستقل و مستند) ---
app.use('/api/auth', require('./modules/auth/routes'));
app.use('/api/products', require('./modules/products/routes'));
app.use('/api/catalog', require('./modules/categories/routes')); // categories + brands
app.use('/api/customers', require('./modules/customers/routes'));
app.use('/api/suppliers', require('./modules/suppliers/routes'));
app.use('/api/invoices', require('./modules/invoices/routes'));
app.use('/api/purchases', require('./modules/purchases/routes'));
app.use('/api/reports', require('./modules/reports/routes'));
app.use('/api/settings', require('./modules/settings/routes'));
app.use('/api/backup', require('./modules/backup/routes'));
app.use('/api/voice', require('./modules/voice/routes'));

// وضعیت سلامت سرویس
app.get('/api/health', (req, res) => res.json({ ok: true, name: 'ثبت‌یار', version: '1.0.0' }));

// --- رابط کاربری (SPA بدون build-step) ---
const publicDir = path.join(config.root, 'public');
app.use(express.static(publicDir));
// همه مسیرهای غیر-API به index.html می‌روند (روتینگ سمت کلاینت)
app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

// --- مدیریت خطای متمرکز ---
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[خطا]', err.message);
  const status = err.status || 500;
  res.status(status).json({ ok: false, error: err.message || 'خطای داخلی سرور.' });
});

app.listen(config.port, () => {
  console.log(`\n  ثبت‌یار روی پورت ${config.port} در حال اجراست`);
  console.log(`  http://localhost:${config.port}\n`);
});

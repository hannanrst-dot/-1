'use strict';
/**
 * پیکربندی مرکزی برنامه.
 * تمام تنظیمات مهم از طریق متغیرهای محیطی (Environment Variables) خوانده می‌شوند
 * تا برنامه روی هر هاستی بدون تغییر کد قابل اجرا باشد.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config();

const ROOT = path.resolve(__dirname, '..');

function resolvePath(p, fallback) {
  const value = p || fallback;
  return path.isAbsolute(value) ? value : path.join(ROOT, value);
}

/**
 * آزمایش می‌کند که آیا می‌توان در یک پوشه فایل ساخت (نوشتن).
 * برخی هاست‌ها (مثل لیارا) فضای برنامه را «فقط‌خواندنی» می‌کنند و دیتابیس
 * نمی‌تواند آنجا ساخته شود (خطای SQLITE_CANTOPEN). این تابع به ما اجازه می‌دهد
 * در صورت نبود دسترسی نوشتن، به مسیر موقتِ قابل‌نوشتن سیستم برگردیم.
 */
function isWritableDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const probe = path.join(dir, `.wtest-${process.pid}`);
    fs.writeFileSync(probe, 'ok');
    fs.unlinkSync(probe);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * یک مسیر قابل‌نوشتن برای فایل انتخاب می‌کند: اول مسیر دلخواه، و اگر قابل‌نوشتن
 * نبود، مسیر موقت سیستم‌عامل (که همیشه قابل‌نوشتن است). این تضمین می‌کند برنامه
 * روی هر هاستی — حتی با فایل‌سیستم فقط‌خواندنی — بالا بیاید.
 */
function writableFilePath(preferred, tmpSubpath) {
  if (isWritableDir(path.dirname(preferred))) return preferred;
  const fallback = path.join(os.tmpdir(), 'sabtyar', tmpSubpath);
  fs.mkdirSync(path.dirname(fallback), { recursive: true });
  return fallback;
}
function writableDir(preferred, tmpSubpath) {
  if (isWritableDir(preferred)) return preferred;
  const fallback = path.join(os.tmpdir(), 'sabtyar', tmpSubpath);
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

const config = {
  root: ROOT,
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',

  databaseFile: writableFilePath(resolvePath(process.env.DATABASE_FILE, './data/store.db'), 'store.db'),
  backupDir: writableDir(resolvePath(process.env.BACKUP_DIR, './backups'), 'backups'),

  session: {
    secret: process.env.SESSION_SECRET || 'insecure-dev-secret-change-me',
    ttlHours: parseInt(process.env.SESSION_TTL_HOURS || '72', 10),
    cookieName: 'sabtyar_sid',
  },

  voice: {
    recognizer: process.env.VOICE_RECOGNIZER || 'web',
    lang: process.env.VOICE_LANG || 'fa-IR',
  },

  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin',
    name: process.env.ADMIN_NAME || 'مدیر فروشگاه',
  },
};

module.exports = config;

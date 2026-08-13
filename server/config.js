'use strict';
/**
 * پیکربندی مرکزی برنامه.
 * تمام تنظیمات مهم از طریق متغیرهای محیطی (Environment Variables) خوانده می‌شوند
 * تا برنامه روی هر هاستی بدون تغییر کد قابل اجرا باشد.
 */
const path = require('path');
require('dotenv').config();

const ROOT = path.resolve(__dirname, '..');

function resolvePath(p, fallback) {
  const value = p || fallback;
  return path.isAbsolute(value) ? value : path.join(ROOT, value);
}

const config = {
  root: ROOT,
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',

  databaseFile: resolvePath(process.env.DATABASE_FILE, './data/store.db'),
  backupDir: resolvePath(process.env.BACKUP_DIR, './backups'),

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

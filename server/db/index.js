'use strict';
/**
 * لایه دسترسی به دیتابیس.
 * از better-sqlite3 (سریع، همگام، تک‌فایل، بسیار قابل انتقال) استفاده می‌شود.
 * تمام کوئری‌ها از این ماژول عبور می‌کنند تا در آینده تعویض موتور دیتابیس
 * (مثلاً MySQL) با کمترین تغییر ممکن باشد.
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

const dir = path.dirname(config.databaseFile);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(config.databaseFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/** اجرای اسکیمای اولیه در صورت نبود جداول */
function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
}

module.exports = { db, migrate };

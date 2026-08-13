'use strict';
/**
 * مقداردهی اولیه دیتابیس.
 *
 * دو حالت استفاده:
 *   ۱) به‌صورت اسکریپت:
 *        node server/db/seed.js          → ساخت کاربر مدیر و داده‌های نمونه در صورت خالی بودن
 *        node server/db/seed.js --reset  → پاک‌سازی کامل و ساخت مجدد
 *   ۲) به‌صورت تابع: seed({ reset, withSamples }) که هنگام اولین اجرای سرور
 *      (server/index.js) به‌طور خودکار فراخوانی می‌شود تا روی هاست، برنامه
 *      بدون نیاز به دستور دستی «آماده» بالا بیاید.
 */
const bcrypt = require('bcryptjs');
const { db, migrate } = require('./index');
const config = require('../config');
const { normalize } = require('../voice/normalizer');

function seed({ reset = false, withSamples = true, log = () => {} } = {}) {
  migrate();

  if (reset) {
    const tables = ['audit_logs', 'payments', 'expenses', 'inventory_transactions',
      'invoice_items', 'invoices', 'purchase_items', 'purchases', 'products',
      'categories', 'brands', 'customers', 'suppliers', 'sessions', 'settings', 'users'];
    for (const t of tables) db.exec(`DELETE FROM ${t};`);
    log('دیتابیس پاک‌سازی شد.');
  }

  // کاربر مدیر (اگر هیچ کاربری نباشد)
  const hasAdmin = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (hasAdmin === 0) {
    db.prepare('INSERT INTO users (username, password_hash, full_name, role) VALUES (?,?,?,?)')
      .run(config.admin.username, bcrypt.hashSync(config.admin.password, 10), config.admin.name, 'admin');
    log(`کاربر مدیر ساخته شد → نام کاربری: ${config.admin.username} / رمز: ${config.admin.password}`);
  }

  // داده‌های نمونه (اختیاری) فقط اگر کالایی وجود ندارد
  const hasProducts = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  if (withSamples && hasProducts === 0) {
    const catId = {};
    for (const name of ['لوازم‌التحریر', 'دفتر', 'نوشت‌افزار']) {
      catId[name] = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name).lastInsertRowid;
    }
    const brandId = {};
    for (const name of ['پاپکو', 'استدلر', 'فابرکاستل', 'کلیپس']) {
      brandId[name] = db.prepare('INSERT INTO brands (name) VALUES (?)').run(name).lastInsertRowid;
    }

    const products = [
      { name: 'دفتر پاپکو ۸۰ برگ', cat: 'دفتر', brand: 'پاپکو', stock: 50, min: 10, buy: 450000, sell: 600000 },
      { name: 'دفتر سیمی ۸۰ برگ', cat: 'دفتر', brand: 'پاپکو', stock: 30, min: 8, buy: 500000, sell: 680000 },
      { name: 'دفتر کلاسور ۸۰ برگ', cat: 'دفتر', brand: 'کلیپس', stock: 20, min: 5, buy: 700000, sell: 950000 },
      { name: 'مداد استدلر مشکی', cat: 'نوشت‌افزار', brand: 'استدلر', stock: 8, min: 15, buy: 90000, sell: 130000 },
      { name: 'مداد رنگی ۱۲ رنگ استدلر', cat: 'نوشت‌افزار', brand: 'استدلر', stock: 25, min: 10, buy: 350000, sell: 480000 },
      { name: 'پاک‌کن فابرکاستل', cat: 'نوشت‌افزار', brand: 'فابرکاستل', stock: 60, min: 20, buy: 25000, sell: 40000 },
      { name: 'خودکار آبی کلیپس', cat: 'نوشت‌افزار', brand: 'کلیپس', stock: 100, min: 30, buy: 30000, sell: 50000 },
      { name: 'دفتر ۱۰۰ برگ پاپکو', cat: 'دفتر', brand: 'پاپکو', stock: 40, min: 10, buy: 550000, sell: 720000 },
    ];

    const insertProduct = db.prepare(`INSERT INTO products
      (name, normalized_name, category_id, brand_id, unit, stock, min_stock, buy_price, sell_price)
      VALUES (?,?,?,?, 'عدد', ?,?,?,?)`);
    const insertTx = db.prepare(`INSERT INTO inventory_transactions (product_id, change, balance, reason, note)
      VALUES (?,?,?, 'initial', 'موجودی اولیه')`);

    for (const p of products) {
      const id = insertProduct.run(p.name, normalize(p.name), catId[p.cat], brandId[p.brand], p.stock, p.min, p.buy, p.sell).lastInsertRowid;
      insertTx.run(id, p.stock, p.stock);
    }

    for (const [name, phone] of [['علی رضایی', '09121234567'], ['مریم احمدی', '09351112233'], ['فروشگاه گلستان', '02177889900']]) {
      db.prepare('INSERT INTO customers (name, phone) VALUES (?,?)').run(name, phone);
    }
    db.prepare('INSERT INTO suppliers (name, phone) VALUES (?,?)').run('شرکت پاپکو', '02188776655');
    log(`${products.length} کالای نمونه و چند مشتری ثبت شد.`);
  }

  // تنظیمات پیش‌فرض فروشگاه
  const s = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)');
  s.run('shop_name', 'فروشگاه من');
  s.run('shop_phone', '');
  s.run('shop_address', '');
  s.run('default_tax', '0');

  return { seeded: hasAdmin === 0 };
}

/** آیا دیتابیس هنوز خالی است (هیچ کاربری ندارد)؟ */
function isEmpty() {
  migrate();
  return db.prepare('SELECT COUNT(*) AS c FROM users').get().c === 0;
}

module.exports = { seed, isEmpty };

// اجرای مستقیم به‌صورت اسکریپت
if (require.main === module) {
  const reset = process.argv.includes('--reset');
  seed({ reset, withSamples: true, log: console.log });
  console.log('مقداردهی اولیه کامل شد.');
}

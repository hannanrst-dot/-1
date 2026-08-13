'use strict';
/**
 * ماژول API صوتی (بخش‌های ۵، ۶، ۷، ۱۳، ۲۰، ۲۸، ۲۹).
 * مرورگر گفتار را به متن تبدیل می‌کند و متن را به این API می‌فرستد.
 * سرور با VoiceEngine متن را «تفسیر» می‌کند و «طرح عملیات» را برمی‌گرداند.
 * اجرای واقعی عملیات از طریق APIهای همان ماژول‌ها (products/invoices/...) و
 * فقط پس از تأیید کاربر انجام می‌شود — نه در این ماژول.
 */
const express = require('express');
const { db } = require('../../db');
const { asyncHandler } = require('../../lib/util');
const { requireAuth } = require('../../middleware/auth');
const VoiceEngine = require('../../voice/VoiceEngine');
const { normalize, digitsToPersian } = require('../../voice/normalizer');
const { matchProduct } = require('../../voice/matcher');

const router = express.Router();

// تزریق وابستگی‌ها به موتور: موتور خودش به دیتابیس وصل نیست.
const listProductsStmt = db.prepare('SELECT id, name, normalized_name, sku, barcode, sell_price, buy_price, stock, min_stock FROM products WHERE is_active = 1');
const findCustomersStmt = db.prepare('SELECT id, name, phone FROM customers WHERE name LIKE ? LIMIT 10');

const engine = new VoiceEngine({
  listProducts: () => listProductsStmt.all(),
  findCustomers: (name) => findCustomersStmt.all(`%${String(name).trim()}%`),
});

// اطلاعات موتور فعال (برای نمایش در تنظیمات و تشخیص قابلیت مرورگر)
router.get('/info', requireAuth, asyncHandler((req, res) => {
  res.json({ ok: true, info: engine.info() });
}));

// تفسیر متن → طرح عملیات + پرسش‌های رفع ابهام
router.post('/interpret', requireAuth, asyncHandler((req, res) => {
  const text = (req.body || {}).text || '';
  const result = engine.interpret(text, { userId: req.user.id });
  res.json({ ok: true, result });
}));

// اجرای درخواست‌های اطلاعاتی دستیار صوتی (بخش ۲۸)
router.post('/query', requireAuth, asyncHandler((req, res) => {
  const q = (req.body || {}).query || {};
  switch (q.type) {
    case 'sales_today': {
      const row = db.prepare(`SELECT COALESCE(SUM(total),0) AS s, COUNT(*) AS c FROM invoices WHERE date(created_at)=date('now','localtime')`).get();
      const toman = Math.round(row.s / 10);
      return res.json({ ok: true, answer: `فروش امروز ${digitsToPersian(toman.toLocaleString('en-US'))} تومان در ${digitsToPersian(row.c)} فاکتور بوده است.`, data: row });
    }
    case 'low_stock': {
      const items = db.prepare('SELECT name, stock, unit FROM products WHERE is_active=1 AND stock <= min_stock ORDER BY stock ASC LIMIT 20').all();
      const answer = items.length
        ? `${digitsToPersian(items.length)} کالا کم‌موجود است: ` + items.slice(0, 5).map((i) => `${i.name} (${digitsToPersian(i.stock)} ${i.unit})`).join('، ')
        : 'همه کالاها موجودی کافی دارند.';
      return res.json({ ok: true, answer, data: items });
    }
    case 'search_product': {
      const products = listProductsStmt.all();
      const m = matchProduct(q.term || '', products);
      return res.json({ ok: true, match: m, answer: m.status === 'not_found' ? `کالایی با «${q.term}» پیدا نشد.` : null });
    }
    case 'customer_last_invoice': {
      if (!q.customer) return res.json({ ok: true, answer: 'نام مشتری مشخص نیست.' });
      const c = db.prepare('SELECT id, name FROM customers WHERE name LIKE ? LIMIT 1').get(`%${String(q.customer).trim()}%`);
      if (!c) return res.json({ ok: true, answer: `مشتری با نام «${q.customer}» پیدا نشد.` });
      const inv = db.prepare('SELECT id, number, total FROM invoices WHERE customer_id=? ORDER BY id DESC LIMIT 1').get(c.id);
      if (!inv) return res.json({ ok: true, answer: `برای «${c.name}» فاکتوری ثبت نشده است.` });
      return res.json({ ok: true, answer: `آخرین فاکتور ${c.name}: شماره ${inv.number}`, invoiceId: inv.id });
    }
    default:
      return res.json({ ok: true, answer: 'درخواست پشتیبانی نمی‌شود.' });
  }
}));

module.exports = router;

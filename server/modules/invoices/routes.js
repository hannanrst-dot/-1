'use strict';
/** ماژول فاکتور (بخش‌های ۹، ۱۲، ۱۹) — لیست، ساخت با تأیید، مشاهده کامل */
const express = require('express');
const { db } = require('../../db');
const { asyncHandler } = require('../../lib/util');
const audit = require('../../lib/audit');
const { requireAuth, requireRole } = require('../../middleware/auth');
const service = require('./service');

const router = express.Router();

const listStmt = db.prepare(`
  SELECT i.id, i.number, i.total, i.paid, i.due, i.payment_method, i.created_at,
         c.name AS customer_name
  FROM invoices i LEFT JOIN customers c ON c.id = i.customer_id
  ORDER BY i.id DESC LIMIT 300`);

router.get('/', requireAuth, asyncHandler((req, res) => {
  res.json({ ok: true, invoices: listStmt.all() });
}));

router.get('/:id', requireAuth, asyncHandler((req, res) => {
  const invoice = service.getFullInvoice(Number(req.params.id));
  if (!invoice) return res.status(404).json({ ok: false, error: 'فاکتور یافت نشد.' });
  res.json({ ok: true, invoice });
}));

// ساخت فاکتور — مرحله تأیید در سمت کلاینت انجام شده و اینجا اجرای نهایی است (بخش ۱۹).
router.post('/', requireAuth, requireRole('seller'), asyncHandler((req, res) => {
  try {
    const result = service.createInvoice(req.body || {}, req.user.id);
    audit.log(req.user.id, 'create', 'invoice', result.id, { total: result.total });
    res.json({ ok: true, invoice: result });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
}));

module.exports = router;

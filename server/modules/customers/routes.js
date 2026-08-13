'use strict';
/** ماژول مشتریان (بخش ۱۴) — شامل خلاصه خرید، بدهی و تاریخچه فاکتورها */
const express = require('express');
const { db } = require('../../db');
const { asyncHandler } = require('../../lib/util');
const audit = require('../../lib/audit');
const { requireAuth } = require('../../middleware/auth');
const { normalize } = require('../../voice/normalizer');

const router = express.Router();

const insert = db.prepare('INSERT INTO customers (name, phone, address, note) VALUES (@name, @phone, @address, @note)');
const updateStmt = db.prepare('UPDATE customers SET name=@name, phone=@phone, address=@address, note=@note WHERE id=@id');
const del = db.prepare('DELETE FROM customers WHERE id = ?');
const getById = db.prepare('SELECT * FROM customers WHERE id = ?');

// خلاصه مالی هر مشتری از روی فاکتورها
const summary = db.prepare(`
  SELECT
    COUNT(*) AS invoice_count,
    COALESCE(SUM(total),0) AS total_bought,
    COALESCE(SUM(paid),0) AS total_paid,
    COALESCE(SUM(due),0) AS total_due
  FROM invoices WHERE customer_id = ?`);
const customerInvoices = db.prepare('SELECT id, number, total, paid, due, created_at FROM invoices WHERE customer_id = ? ORDER BY id DESC LIMIT 100');

router.get('/', requireAuth, asyncHandler((req, res) => {
  const { q } = req.query;
  let rows;
  if (q) {
    rows = db.prepare('SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY name LIMIT 300').all(`%${q}%`, `%${q}%`);
  } else {
    rows = db.prepare('SELECT * FROM customers ORDER BY name LIMIT 300').all();
  }
  res.json({ ok: true, customers: rows });
}));

router.get('/:id', requireAuth, asyncHandler((req, res) => {
  const c = getById.get(Number(req.params.id));
  if (!c) return res.status(404).json({ ok: false, error: 'مشتری یافت نشد.' });
  res.json({ ok: true, customer: c, summary: summary.get(c.id), invoices: customerInvoices.all(c.id) });
}));

router.post('/', requireAuth, asyncHandler((req, res) => {
  const b = req.body || {};
  const name = String(b.name || '').trim();
  if (!name) return res.status(400).json({ ok: false, error: 'نام مشتری الزامی است.' });
  const info = insert.run({ name, phone: b.phone || null, address: b.address || null, note: b.note || null });
  audit.log(req.user.id, 'create', 'customer', info.lastInsertRowid, { name });
  res.json({ ok: true, id: info.lastInsertRowid });
}));

router.put('/:id', requireAuth, asyncHandler((req, res) => {
  const id = Number(req.params.id);
  if (!getById.get(id)) return res.status(404).json({ ok: false, error: 'مشتری یافت نشد.' });
  const b = req.body || {};
  updateStmt.run({ id, name: String(b.name || '').trim(), phone: b.phone || null, address: b.address || null, note: b.note || null });
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth, asyncHandler((req, res) => { del.run(Number(req.params.id)); res.json({ ok: true }); }));

module.exports = router;

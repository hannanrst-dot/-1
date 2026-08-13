'use strict';
/** ماژول تأمین‌کنندگان (بخش ۱۵) */
const express = require('express');
const { db } = require('../../db');
const { asyncHandler } = require('../../lib/util');
const audit = require('../../lib/audit');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

const insert = db.prepare('INSERT INTO suppliers (name, phone, contact, note) VALUES (@name, @phone, @contact, @note)');
const updateStmt = db.prepare('UPDATE suppliers SET name=@name, phone=@phone, contact=@contact, note=@note WHERE id=@id');
const del = db.prepare('DELETE FROM suppliers WHERE id = ?');
const getById = db.prepare('SELECT * FROM suppliers WHERE id = ?');
const summary = db.prepare(`
  SELECT COUNT(*) AS purchase_count, COALESCE(SUM(total),0) AS total_bought,
         COALESCE(SUM(paid),0) AS total_paid, COALESCE(SUM(due),0) AS total_due
  FROM purchases WHERE supplier_id = ?`);
const supplierPurchases = db.prepare('SELECT id, number, total, paid, due, created_at FROM purchases WHERE supplier_id = ? ORDER BY id DESC LIMIT 100');

router.get('/', requireAuth, asyncHandler((req, res) => {
  const { q } = req.query;
  const rows = q
    ? db.prepare('SELECT * FROM suppliers WHERE name LIKE ? OR phone LIKE ? ORDER BY name LIMIT 300').all(`%${q}%`, `%${q}%`)
    : db.prepare('SELECT * FROM suppliers ORDER BY name LIMIT 300').all();
  res.json({ ok: true, suppliers: rows });
}));

router.get('/:id', requireAuth, asyncHandler((req, res) => {
  const s = getById.get(Number(req.params.id));
  if (!s) return res.status(404).json({ ok: false, error: 'تأمین‌کننده یافت نشد.' });
  res.json({ ok: true, supplier: s, summary: summary.get(s.id), purchases: supplierPurchases.all(s.id) });
}));

router.post('/', requireAuth, asyncHandler((req, res) => {
  const b = req.body || {};
  const name = String(b.name || '').trim();
  if (!name) return res.status(400).json({ ok: false, error: 'نام تأمین‌کننده الزامی است.' });
  const info = insert.run({ name, phone: b.phone || null, contact: b.contact || null, note: b.note || null });
  audit.log(req.user.id, 'create', 'supplier', info.lastInsertRowid, { name });
  res.json({ ok: true, id: info.lastInsertRowid });
}));

router.put('/:id', requireAuth, asyncHandler((req, res) => {
  const id = Number(req.params.id);
  if (!getById.get(id)) return res.status(404).json({ ok: false, error: 'تأمین‌کننده یافت نشد.' });
  const b = req.body || {};
  updateStmt.run({ id, name: String(b.name || '').trim(), phone: b.phone || null, contact: b.contact || null, note: b.note || null });
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth, asyncHandler((req, res) => { del.run(Number(req.params.id)); res.json({ ok: true }); }));

module.exports = router;

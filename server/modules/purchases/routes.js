'use strict';
/** ماژول خرید (بخش ۱۶) — ثبت خرید، افزایش خودکار موجودی، به‌روزرسانی قیمت خرید */
const express = require('express');
const { db } = require('../../db');
const { serialNumber, asyncHandler } = require('../../lib/util');
const audit = require('../../lib/audit');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { normalize } = require('../../voice/normalizer');
const inventory = require('../inventory/service');

const router = express.Router();

const insertPurchase = db.prepare(`
  INSERT INTO purchases (number, supplier_id, user_id, total, paid, due, note)
  VALUES (@number, @supplier_id, @user_id, @total, @paid, @due, @note)`);
const insertItem = db.prepare(`
  INSERT INTO purchase_items (purchase_id, product_id, name, quantity, unit_price, line_total)
  VALUES (@purchase_id, @product_id, @name, @quantity, @unit_price, @line_total)`);
const findSupplier = db.prepare('SELECT id FROM suppliers WHERE name = ?');
const insertSupplier = db.prepare('INSERT INTO suppliers (name) VALUES (?)');
const insertProduct = db.prepare(`
  INSERT INTO products (name, normalized_name, unit, stock, buy_price, sell_price)
  VALUES (?, ?, 'عدد', 0, ?, ?)`);
const updateBuyPrice = db.prepare('UPDATE products SET buy_price = ? WHERE id = ?');
const getProduct = db.prepare('SELECT id, name, buy_price FROM products WHERE id = ?');

const listStmt = db.prepare(`
  SELECT p.id, p.number, p.total, p.paid, p.due, p.created_at, s.name AS supplier_name
  FROM purchases p LEFT JOIN suppliers s ON s.id = p.supplier_id
  ORDER BY p.id DESC LIMIT 300`);
const getItems = db.prepare('SELECT * FROM purchase_items WHERE purchase_id = ?');

router.get('/', requireAuth, asyncHandler((req, res) => res.json({ ok: true, purchases: listStmt.all() })));

router.get('/:id', requireAuth, asyncHandler((req, res) => {
  const p = db.prepare('SELECT * FROM purchases WHERE id = ?').get(Number(req.params.id));
  if (!p) return res.status(404).json({ ok: false, error: 'خرید یافت نشد.' });
  p.items = getItems.all(p.id);
  res.json({ ok: true, purchase: p });
}));

router.post('/', requireAuth, requireRole('seller', 'stockkeeper'), asyncHandler((req, res) => {
  const payload = req.body || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) return res.status(400).json({ ok: false, error: 'خرید باید حداقل یک قلم داشته باشد.' });

  try {
    const tx = db.transaction(() => {
      // تأمین‌کننده
      let supplierId = payload.supplier_id || null;
      if (!supplierId && payload.supplier_name) {
        const ex = findSupplier.get(String(payload.supplier_name).trim());
        supplierId = ex ? ex.id : insertSupplier.run(String(payload.supplier_name).trim()).lastInsertRowid;
      }

      let total = 0;
      const prepared = [];
      for (const raw of items) {
        const qty = Number(raw.quantity);
        const unitPrice = Math.round(Number(raw.unit_price || 0));
        if (!qty || qty <= 0) throw new Error('تعداد نامعتبر در اقلام خرید.');
        let productId = raw.product_id || null;
        const name = raw.name || (productId ? getProduct.get(productId).name : 'کالا');
        // اگر کالای جدید است، ساخته شود
        if (!productId) {
          const sell = raw.sell_price ? Math.round(Number(raw.sell_price)) : Math.round(unitPrice * 1.2);
          productId = insertProduct.run(name, normalize(name), unitPrice, sell).lastInsertRowid;
        } else if (unitPrice > 0) {
          updateBuyPrice.run(unitPrice, productId); // به‌روزرسانی آخرین قیمت خرید
        }
        const lineTotal = qty * unitPrice;
        total += lineTotal;
        prepared.push({ product_id: productId, name, quantity: qty, unit_price: unitPrice, line_total: lineTotal });
      }

      const paid = payload.paid != null ? Math.round(Number(payload.paid)) : total;
      const due = Math.max(0, total - paid);
      const number = serialNumber('P');
      const info = insertPurchase.run({ number, supplier_id: supplierId, user_id: req.user.id, total, paid, due, note: payload.note || null });
      const purchaseId = info.lastInsertRowid;

      for (const it of prepared) {
        insertItem.run({ ...it, purchase_id: purchaseId });
        inventory.applyChange({ productId: it.product_id, change: it.quantity, reason: 'purchase', refType: 'purchase', refId: purchaseId });
      }
      return { id: purchaseId, number, total, paid, due };
    });
    const result = tx();
    audit.log(req.user.id, 'create', 'purchase', result.id, { total: result.total });
    res.json({ ok: true, purchase: result });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
}));

module.exports = router;

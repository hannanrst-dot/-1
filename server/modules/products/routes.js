'use strict';
/** ماژول مدیریت کالا (بخش‌های ۴، ۱۰) — ثبت، ویرایش، حذف، جستجو، فیلتر، تاریخچه */
const express = require('express');
const { db } = require('../../db');
const { asyncHandler } = require('../../lib/util');
const audit = require('../../lib/audit');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { normalize } = require('../../voice/normalizer');
const inventory = require('../inventory/service');

const router = express.Router();

const insert = db.prepare(`
  INSERT INTO products
    (name, normalized_name, sku, barcode, category_id, brand_id, unit, stock, min_stock,
     buy_price, sell_price, discount, tax, description, image, is_active)
  VALUES
    (@name, @normalized_name, @sku, @barcode, @category_id, @brand_id, @unit, @stock, @min_stock,
     @buy_price, @sell_price, @discount, @tax, @description, @image, @is_active)`);

const updateStmt = db.prepare(`
  UPDATE products SET
    name=@name, normalized_name=@normalized_name, sku=@sku, barcode=@barcode,
    category_id=@category_id, brand_id=@brand_id, unit=@unit, min_stock=@min_stock,
    buy_price=@buy_price, sell_price=@sell_price, discount=@discount, tax=@tax,
    description=@description, image=@image, is_active=@is_active, updated_at=datetime('now')
  WHERE id=@id`);

const getById = db.prepare(`
  SELECT p.*, c.name AS category_name, b.name AS brand_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN brands b ON b.id = p.brand_id
  WHERE p.id = ?`);

const deleteStmt = db.prepare('DELETE FROM products WHERE id = ?');

function normalizeInput(body) {
  const n = (v, d = null) => (v === undefined || v === '' ? d : v);
  const name = String(body.name || '').trim();
  return {
    name,
    normalized_name: normalize(name),
    sku: n(body.sku),
    barcode: n(body.barcode),
    category_id: body.category_id ? Number(body.category_id) : null,
    brand_id: body.brand_id ? Number(body.brand_id) : null,
    unit: n(body.unit, 'عدد'),
    stock: Number(n(body.stock, 0)) || 0,
    min_stock: Number(n(body.min_stock, 0)) || 0,
    buy_price: Math.round(Number(n(body.buy_price, 0)) || 0),
    sell_price: Math.round(Number(n(body.sell_price, 0)) || 0),
    discount: Number(n(body.discount, 0)) || 0,
    tax: Number(n(body.tax, 0)) || 0,
    description: n(body.description),
    image: n(body.image),
    is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
  };
}

// فهرست + جستجو + فیلتر (بخش ۱۰)
router.get('/', requireAuth, asyncHandler((req, res) => {
  const { q, category, brand, stock, lowStock, sort, active } = req.query;
  const where = [];
  const params = {};
  if (q) {
    where.push('(p.normalized_name LIKE @q OR p.sku LIKE @raw OR p.barcode LIKE @raw OR p.name LIKE @raw)');
    params.q = `%${normalize(q)}%`;
    params.raw = `%${q}%`;
  }
  if (category) { where.push('p.category_id = @category'); params.category = Number(category); }
  if (brand) { where.push('p.brand_id = @brand'); params.brand = Number(brand); }
  if (active !== undefined) { where.push('p.is_active = @active'); params.active = active === '1' || active === 'true' ? 1 : 0; }
  if (lowStock === '1' || lowStock === 'true') where.push('p.stock <= p.min_stock');
  if (stock === 'in') where.push('p.stock > 0');
  if (stock === 'out') where.push('p.stock <= 0');

  const sortMap = {
    name: 'p.name ASC', newest: 'p.id DESC', oldest: 'p.id ASC',
    stock_asc: 'p.stock ASC', stock_desc: 'p.stock DESC',
    price_asc: 'p.sell_price ASC', price_desc: 'p.sell_price DESC',
  };
  const orderBy = sortMap[sort] || 'p.id DESC';

  const sql = `
    SELECT p.*, c.name AS category_name, b.name AS brand_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY ${orderBy} LIMIT 500`;
  const rows = db.prepare(sql).all(params);
  res.json({ ok: true, products: rows });
}));

router.get('/:id', requireAuth, asyncHandler((req, res) => {
  const product = getById.get(Number(req.params.id));
  if (!product) return res.status(404).json({ ok: false, error: 'کالا یافت نشد.' });
  res.json({ ok: true, product, history: inventory.history(product.id) });
}));

router.post('/', requireAuth, requireRole('seller', 'stockkeeper'), asyncHandler((req, res) => {
  const data = normalizeInput(req.body || {});
  if (!data.name) return res.status(400).json({ ok: false, error: 'نام کالا الزامی است.' });
  const create = db.transaction(() => {
    const info = insert.run(data);
    const id = info.lastInsertRowid;
    if (data.stock !== 0) {
      inventory.applyChange({ productId: id, change: data.stock, reason: 'initial', refType: 'manual', note: 'موجودی اولیه' });
    }
    return id;
  });
  const id = create();
  audit.log(req.user.id, 'create', 'product', id, { name: data.name });
  res.json({ ok: true, id });
}));

router.put('/:id', requireAuth, requireRole('seller', 'stockkeeper'), asyncHandler((req, res) => {
  const id = Number(req.params.id);
  const existing = getById.get(id);
  if (!existing) return res.status(404).json({ ok: false, error: 'کالا یافت نشد.' });
  const data = normalizeInput(req.body || {});
  data.id = id;
  updateStmt.run(data);
  audit.log(req.user.id, 'update', 'product', id, { name: data.name });
  res.json({ ok: true });
}));

// تغییر موجودی دستی (با ثبت تراکنش) — بخش ۱۰/۱۱
router.post('/:id/adjust-stock', requireAuth, requireRole('seller', 'stockkeeper'), asyncHandler((req, res) => {
  const id = Number(req.params.id);
  const existing = getById.get(id);
  if (!existing) return res.status(404).json({ ok: false, error: 'کالا یافت نشد.' });
  const { change, note } = req.body || {};
  const delta = Number(change);
  if (!delta || Number.isNaN(delta)) return res.status(400).json({ ok: false, error: 'مقدار تغییر نامعتبر است.' });
  const tx = db.transaction(() => inventory.applyChange({ productId: id, change: delta, reason: 'manual', refType: 'manual', note: note || 'اصلاح دستی موجودی' }));
  const result = tx();
  audit.log(req.user.id, 'update', 'product', id, { adjustStock: delta });
  res.json({ ok: true, balance: result.balance, belowMin: result.belowMin });
}));

router.delete('/:id', requireAuth, requireRole('admin'), asyncHandler((req, res) => {
  const id = Number(req.params.id);
  const existing = getById.get(id);
  if (!existing) return res.status(404).json({ ok: false, error: 'کالا یافت نشد.' });
  deleteStmt.run(id);
  audit.log(req.user.id, 'delete', 'product', id, { name: existing.name });
  res.json({ ok: true });
}));

module.exports = router;

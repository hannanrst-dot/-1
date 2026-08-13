'use strict';
/** ماژول دسته‌بندی و برند (ساختار ساده کلید/نام، قابل توسعه به سلسله‌مراتب) */
const express = require('express');
const { db } = require('../../db');
const { asyncHandler } = require('../../lib/util');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

const listCat = db.prepare('SELECT * FROM categories ORDER BY name');
const insCat = db.prepare('INSERT INTO categories (name, parent_id) VALUES (?, ?)');
const delCat = db.prepare('DELETE FROM categories WHERE id = ?');
const listBrand = db.prepare('SELECT * FROM brands ORDER BY name');
const insBrand = db.prepare('INSERT INTO brands (name) VALUES (?)');
const delBrand = db.prepare('DELETE FROM brands WHERE id = ?');

router.get('/categories', requireAuth, asyncHandler((req, res) => res.json({ ok: true, categories: listCat.all() })));
router.post('/categories', requireAuth, asyncHandler((req, res) => {
  const name = String((req.body || {}).name || '').trim();
  if (!name) return res.status(400).json({ ok: false, error: 'نام دسته الزامی است.' });
  const info = insCat.run(name, req.body.parent_id || null);
  res.json({ ok: true, id: info.lastInsertRowid });
}));
router.delete('/categories/:id', requireAuth, asyncHandler((req, res) => { delCat.run(Number(req.params.id)); res.json({ ok: true }); }));

router.get('/brands', requireAuth, asyncHandler((req, res) => res.json({ ok: true, brands: listBrand.all() })));
router.post('/brands', requireAuth, asyncHandler((req, res) => {
  const name = String((req.body || {}).name || '').trim();
  if (!name) return res.status(400).json({ ok: false, error: 'نام برند الزامی است.' });
  const info = insBrand.run(name);
  res.json({ ok: true, id: info.lastInsertRowid });
}));
router.delete('/brands/:id', requireAuth, asyncHandler((req, res) => { delBrand.run(Number(req.params.id)); res.json({ ok: true }); }));

module.exports = router;

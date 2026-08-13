'use strict';
/** ماژول تنظیمات فروشگاه (نام، آدرس، تلفن، پیش‌فرض مالیات و ...) */
const express = require('express');
const { db } = require('../../db');
const { asyncHandler } = require('../../lib/util');
const { requireAuth, requireRole } = require('../../middleware/auth');

const router = express.Router();

const getAll = db.prepare('SELECT key, value FROM settings');
const upsert = db.prepare(`INSERT INTO settings (key, value) VALUES (@key, @value)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value`);

router.get('/', requireAuth, asyncHandler((req, res) => {
  const rows = getAll.all();
  const settings = {};
  for (const r of rows) settings[r.key] = r.value;
  res.json({ ok: true, settings });
}));

router.put('/', requireAuth, requireRole('admin'), asyncHandler((req, res) => {
  const body = req.body || {};
  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(body)) {
      upsert.run({ key, value: value == null ? '' : String(value) });
    }
  });
  tx();
  res.json({ ok: true });
}));

module.exports = router;

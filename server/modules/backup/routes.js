'use strict';
/**
 * ماژول پشتیبان‌گیری و بازیابی (بخش‌های ۲۴، ۲۵).
 * چون دیتابیس SQLite تک‌فایل است، Backup صرفاً یک کپی امن از فایل دیتابیس است
 * که کاملاً قابل انتقال بین هاست‌هاست.
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const { db } = require('../../db');
const config = require('../../config');
const { asyncHandler } = require('../../lib/util');
const audit = require('../../lib/audit');
const { requireAuth, requireRole } = require('../../middleware/auth');

const router = express.Router();

if (!fs.existsSync(config.backupDir)) fs.mkdirSync(config.backupDir, { recursive: true });

// فهرست پشتیبان‌ها
router.get('/', requireAuth, requireRole('admin'), asyncHandler((req, res) => {
  const files = fs.readdirSync(config.backupDir)
    .filter((f) => f.endsWith('.db'))
    .map((f) => {
      const stat = fs.statSync(path.join(config.backupDir, f));
      return { name: f, size: stat.size, created_at: stat.mtime.toISOString() };
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json({ ok: true, backups: files });
}));

// ساخت پشتیبان جدید (از API آنلاین دیتابیس با VACUUM INTO — امن حتی حین کار)
router.post('/', requireAuth, requireRole('admin'), asyncHandler((req, res) => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(config.backupDir, `backup-${stamp}.db`);
  db.prepare('VACUUM INTO ?').run(file);
  audit.log(req.user.id, 'create', 'backup', null, { file: path.basename(file) });
  res.json({ ok: true, file: path.basename(file) });
}));

// دانلود یک پشتیبان
router.get('/download/:name', requireAuth, requireRole('admin'), asyncHandler((req, res) => {
  const name = path.basename(req.params.name); // جلوگیری از path traversal
  const file = path.join(config.backupDir, name);
  if (!file.startsWith(config.backupDir) || !fs.existsSync(file)) {
    return res.status(404).json({ ok: false, error: 'فایل پشتیبان یافت نشد.' });
  }
  res.download(file);
}));

module.exports = router;

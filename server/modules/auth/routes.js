'use strict';
/** ماژول احراز هویت: ورود، خروج، اطلاعات کاربر جاری، مدیریت کاربران */
const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../../db');
const config = require('../../config');
const { randomId, asyncHandler } = require('../../lib/util');
const audit = require('../../lib/audit');
const { requireAuth, requireRole, currentUser } = require('../../middleware/auth');

const router = express.Router();

const getUserByUsername = db.prepare('SELECT * FROM users WHERE username = ?');
const insertSession = db.prepare(
  'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
);
const deleteSession = db.prepare('DELETE FROM sessions WHERE id = ?');

router.post('/login', asyncHandler((req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'نام کاربری و رمز عبور را وارد کنید.' });
  }
  const user = getUserByUsername.get(String(username).trim());
  if (!user || !user.is_active || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ ok: false, error: 'نام کاربری یا رمز عبور نادرست است.' });
  }
  const sid = randomId();
  const expires = new Date(Date.now() + config.session.ttlHours * 3600 * 1000).toISOString();
  insertSession.run(sid, user.id, expires);
  res.cookie(config.session.cookieName, sid, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProd,
    maxAge: config.session.ttlHours * 3600 * 1000,
  });
  audit.log(user.id, 'login', 'user', user.id, null);
  res.json({ ok: true, user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role } });
}));

router.post('/logout', asyncHandler((req, res) => {
  const user = currentUser(req);
  if (user) deleteSession.run(user.sessionId);
  res.clearCookie(config.session.cookieName);
  res.json({ ok: true });
}));

router.get('/me', asyncHandler((req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ ok: false, error: 'وارد نشده‌اید.' });
  res.json({ ok: true, user });
}));

// --- مدیریت کاربران (فقط مدیر) ---
const listUsers = db.prepare('SELECT id, username, full_name, role, is_active, created_at FROM users ORDER BY id');
const insertUser = db.prepare(
  'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)'
);

router.get('/users', requireAuth, requireRole('admin'), asyncHandler((req, res) => {
  res.json({ ok: true, users: listUsers.all() });
}));

router.post('/users', requireAuth, requireRole('admin'), asyncHandler((req, res) => {
  const { username, password, fullName, role } = req.body || {};
  if (!username || !password || !fullName) {
    return res.status(400).json({ ok: false, error: 'همه فیلدها الزامی است.' });
  }
  const validRoles = ['admin', 'seller', 'stockkeeper'];
  const r = validRoles.includes(role) ? role : 'seller';
  try {
    const info = insertUser.run(String(username).trim(), bcrypt.hashSync(String(password), 10), String(fullName).trim(), r);
    audit.log(req.user.id, 'create', 'user', info.lastInsertRowid, { username });
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ ok: false, error: 'این نام کاربری قبلاً ثبت شده است.' });
  }
}));

module.exports = router;

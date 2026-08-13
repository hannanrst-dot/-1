'use strict';
/** میدل‌ور احراز هویت و کنترل سطح دسترسی (نقش‌ها) — بخش ۲۴ */
const { db } = require('../db');
const config = require('../config');

const getSession = db.prepare(
  `SELECT s.id, s.expires_at, u.id AS user_id, u.username, u.full_name, u.role, u.is_active
   FROM sessions s JOIN users u ON u.id = s.user_id
   WHERE s.id = ?`
);
const deleteSession = db.prepare('DELETE FROM sessions WHERE id = ?');

/** استخراج کاربر جاری از کوکی نشست */
function currentUser(req) {
  const sid = req.cookies ? req.cookies[config.session.cookieName] : null;
  if (!sid) return null;
  const row = getSession.get(sid);
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    deleteSession.run(sid);
    return null;
  }
  if (!row.is_active) return null;
  return {
    id: row.user_id,
    username: row.username,
    fullName: row.full_name,
    role: row.role,
    sessionId: row.id,
  };
}

/** الزام ورود */
function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ ok: false, error: 'برای ادامه باید وارد شوید.' });
  req.user = user;
  next();
}

/** الزام نقش خاص (لیست نقش‌های مجاز) */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, error: 'ابتدا وارد شوید.' });
    if (req.user.role === 'admin' || roles.includes(req.user.role)) return next();
    return res.status(403).json({ ok: false, error: 'شما دسترسی لازم برای این عملیات را ندارید.' });
  };
}

module.exports = { currentUser, requireAuth, requireRole };

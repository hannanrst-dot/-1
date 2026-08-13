'use strict';
/** توابع کمکی عمومی */
const crypto = require('crypto');

function randomId(bytes = 24) {
  return crypto.randomBytes(bytes).toString('hex');
}

/** تولید شماره سریال خوانا برای فاکتور/خرید */
function serialNumber(prefix) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${stamp}-${rand}`;
}

/** پاسخ خطای استاندارد */
class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** wrapper برای هندلرهای async تا خطاها به middleware خطا برسند */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { randomId, serialNumber, ApiError, asyncHandler };

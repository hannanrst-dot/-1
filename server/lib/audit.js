'use strict';
/** ثبت فعالیت کاربران (Audit Log) — بخش ۲۴ */
const { db } = require('../db');

const stmt = db.prepare(
  `INSERT INTO audit_logs (user_id, action, entity, entity_id, detail)
   VALUES (@user_id, @action, @entity, @entity_id, @detail)`
);

function log(userId, action, entity, entityId, detail) {
  try {
    stmt.run({
      user_id: userId ?? null,
      action,
      entity,
      entity_id: entityId ?? null,
      detail: detail ? (typeof detail === 'string' ? detail : JSON.stringify(detail)) : null,
    });
  } catch (_) {
    /* ثبت لاگ نباید مانع عملیات اصلی شود */
  }
}

module.exports = { log };

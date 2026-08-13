'use strict';
/**
 * سرویس انبار — منبع حقیقت گردش موجودی (بخش ۱۱).
 * هر تغییر موجودی حتماً از این سرویس عبور می‌کند تا یک ردّ حسابرسی کامل
 * (inventory_transactions) ساخته شود و موجودی هیچ‌گاه ناسازگار نشود.
 */
const { db } = require('../../db');

const getProduct = db.prepare('SELECT id, name, stock, min_stock FROM products WHERE id = ?');
const updateStock = db.prepare('UPDATE products SET stock = ?, updated_at = datetime(\'now\') WHERE id = ?');
const insertTx = db.prepare(
  `INSERT INTO inventory_transactions (product_id, change, balance, reason, ref_type, ref_id, note)
   VALUES (@product_id, @change, @balance, @reason, @ref_type, @ref_id, @note)`
);

/**
 * اعمال تغییر موجودی روی یک کالا و ثبت تراکنش.
 * change مثبت = ورود، منفی = خروج. (این تابع باید درون یک transaction فراخوانی شود.)
 */
function applyChange({ productId, change, reason, refType = null, refId = null, note = null }) {
  const product = getProduct.get(productId);
  if (!product) throw new Error(`کالای با شناسه ${productId} یافت نشد.`);
  const balance = Number((product.stock + change).toFixed(3));
  updateStock.run(balance, productId);
  insertTx.run({ product_id: productId, change, balance, reason, ref_type: refType, ref_id: refId, note });
  return { productId, balance, belowMin: balance <= product.min_stock, name: product.name, minStock: product.min_stock };
}

/** فهرست کالاهای کم‌موجود */
const lowStockStmt = db.prepare(
  `SELECT id, name, stock, min_stock, unit FROM products
   WHERE is_active = 1 AND stock <= min_stock ORDER BY (stock - min_stock) ASC`
);
function lowStock() {
  return lowStockStmt.all();
}

/** تاریخچه تراکنش‌های یک کالا */
const historyStmt = db.prepare(
  `SELECT * FROM inventory_transactions WHERE product_id = ? ORDER BY id DESC LIMIT 200`
);
function history(productId) {
  return historyStmt.all(productId);
}

module.exports = { applyChange, lowStock, history };

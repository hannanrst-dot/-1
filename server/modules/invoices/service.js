'use strict';
/**
 * سرویس فاکتور — منطق ساخت فاکتور، محاسبه مبالغ، کاهش موجودی و ثبت بدهی.
 * جدا از لایه HTTP نگه داشته شده تا هم از API و هم از موتور صوتی قابل استفاده باشد.
 */
const { db } = require('../../db');
const { serialNumber } = require('../../lib/util');
const inventory = require('../inventory/service');

const getProduct = db.prepare('SELECT id, name, sell_price, buy_price, stock FROM products WHERE id = ?');
const insertInvoice = db.prepare(`
  INSERT INTO invoices (number, customer_id, user_id, subtotal, discount, tax, total, paid, due, payment_method, note)
  VALUES (@number, @customer_id, @user_id, @subtotal, @discount, @tax, @total, @paid, @due, @payment_method, @note)`);
const insertItem = db.prepare(`
  INSERT INTO invoice_items (invoice_id, product_id, name, quantity, unit_price, discount, tax, line_total, buy_price)
  VALUES (@invoice_id, @product_id, @name, @quantity, @unit_price, @discount, @tax, @line_total, @buy_price)`);
const insertPayment = db.prepare(`
  INSERT INTO payments (party_type, party_id, amount, method, ref_type, ref_id, note)
  VALUES ('customer', @party_id, @amount, @method, 'invoice', @ref_id, @note)`);
const findCustomer = db.prepare('SELECT id FROM customers WHERE name = ?');
const insertCustomer = db.prepare('INSERT INTO customers (name) VALUES (?)');

/**
 * ساخت فاکتور.
 * payload: {
 *   customer_id | customer_name, items:[{product_id,name,quantity,unit_price,discount,tax}],
 *   discount (مبلغ ریالی کلی اختیاری), discountPercent, paid, payment_method, note
 * }
 * userId: کاربر ثبت‌کننده
 * خروجی: { id, number, total, ... }
 */
function createInvoice(payload, userId) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) throw new Error('فاکتور باید حداقل یک قلم داشته باشد.');

  // حل و فصل مشتری
  let customerId = payload.customer_id || null;
  if (!customerId && payload.customer_name) {
    const existing = findCustomer.get(String(payload.customer_name).trim());
    customerId = existing ? existing.id : insertCustomer.run(String(payload.customer_name).trim()).lastInsertRowid;
  }

  const tx = db.transaction(() => {
    let subtotal = 0, totalTax = 0, totalLineDiscount = 0;
    const preparedItems = [];

    for (const raw of items) {
      const product = raw.product_id ? getProduct.get(raw.product_id) : null;
      const name = product ? product.name : (raw.name || 'کالا');
      const qty = Number(raw.quantity);
      if (!qty || qty <= 0) throw new Error(`تعداد نامعتبر برای «${name}».`);
      const unitPrice = Math.round(Number(raw.unit_price ?? (product ? product.sell_price : 0)));
      const discPercent = Number(raw.discount || 0);
      const taxPercent = Number(raw.tax || 0);
      const gross = unitPrice * qty;
      const discAmount = Math.round(gross * discPercent / 100);
      const taxable = gross - discAmount;
      const taxAmount = Math.round(taxable * taxPercent / 100);
      const lineTotal = taxable + taxAmount;

      subtotal += gross;
      totalLineDiscount += discAmount;
      totalTax += taxAmount;

      preparedItems.push({
        product_id: product ? product.id : null,
        name, quantity: qty, unit_price: unitPrice,
        discount: discPercent, tax: taxPercent, line_total: lineTotal,
        buy_price: product ? product.buy_price : 0,
      });
    }

    // تخفیف کلی (مبلغ یا درصد)
    let headerDiscount = Math.round(Number(payload.discount || 0));
    if (!headerDiscount && payload.discountPercent) {
      headerDiscount = Math.round((subtotal - totalLineDiscount) * Number(payload.discountPercent) / 100);
    }

    const totalDiscount = totalLineDiscount + headerDiscount;
    const total = Math.max(0, subtotal - totalDiscount + totalTax);
    const paid = payload.paid != null ? Math.round(Number(payload.paid)) : total;
    const due = Math.max(0, total - paid);

    const number = serialNumber('F');
    const info = insertInvoice.run({
      number, customer_id: customerId, user_id: userId,
      subtotal, discount: totalDiscount, tax: totalTax, total, paid, due,
      payment_method: payload.payment_method || 'cash', note: payload.note || null,
    });
    const invoiceId = info.lastInsertRowid;

    const warnings = [];
    for (const it of preparedItems) {
      insertItem.run({ ...it, invoice_id: invoiceId });
      if (it.product_id) {
        const result = inventory.applyChange({
          productId: it.product_id, change: -it.quantity, reason: 'sale',
          refType: 'invoice', refId: invoiceId,
        });
        if (result.belowMin) warnings.push(`موجودی «${result.name}» به ${result.balance} رسید و کمتر از حد مجاز است.`);
      }
    }

    if (paid > 0 && customerId) {
      insertPayment.run({ party_id: customerId, amount: paid, method: payload.payment_method || 'cash', ref_id: invoiceId, note: null });
    }

    return { id: invoiceId, number, subtotal, discount: totalDiscount, tax: totalTax, total, paid, due, warnings };
  });

  return tx();
}

const getInvoice = db.prepare(`
  SELECT i.*, c.name AS customer_name, c.phone AS customer_phone, u.full_name AS seller_name
  FROM invoices i
  LEFT JOIN customers c ON c.id = i.customer_id
  LEFT JOIN users u ON u.id = i.user_id
  WHERE i.id = ?`);
const getItems = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?');

function getFullInvoice(id) {
  const invoice = getInvoice.get(id);
  if (!invoice) return null;
  invoice.items = getItems.all(id);
  return invoice;
}

module.exports = { createInvoice, getFullInvoice };

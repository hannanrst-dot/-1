'use strict';
/** ماژول گزارش‌ها و داشبورد (بخش‌های ۳، ۱۷) */
const express = require('express');
const { db } = require('../../db');
const { asyncHandler } = require('../../lib/util');
const { requireAuth } = require('../../middleware/auth');
const inventory = require('../inventory/service');

const router = express.Router();

// --- داشبورد ---
router.get('/dashboard', requireAuth, asyncHandler((req, res) => {
  const today = db.prepare(`
    SELECT COALESCE(SUM(total),0) AS sales, COUNT(*) AS count
    FROM invoices WHERE date(created_at) = date('now','localtime')`).get();

  const profitToday = db.prepare(`
    SELECT COALESCE(SUM((ii.unit_price - ii.buy_price) * ii.quantity),0) AS profit
    FROM invoice_items ii JOIN invoices i ON i.id = ii.invoice_id
    WHERE date(i.created_at) = date('now','localtime')`).get();

  const productCount = db.prepare('SELECT COUNT(*) AS c FROM products WHERE is_active = 1').get().c;
  const lowStockCount = db.prepare('SELECT COUNT(*) AS c FROM products WHERE is_active = 1 AND stock <= min_stock').get().c;
  const inventoryValue = db.prepare('SELECT COALESCE(SUM(stock * buy_price),0) AS v FROM products').get().v;

  const recentInvoices = db.prepare(`
    SELECT i.id, i.number, i.total, i.created_at, c.name AS customer_name
    FROM invoices i LEFT JOIN customers c ON c.id = i.customer_id
    ORDER BY i.id DESC LIMIT 8`).all();

  const topProducts = db.prepare(`
    SELECT ii.name, SUM(ii.quantity) AS qty, SUM(ii.line_total) AS revenue
    FROM invoice_items ii
    GROUP BY ii.product_id, ii.name
    ORDER BY qty DESC LIMIT 8`).all();

  res.json({
    ok: true,
    dashboard: {
      salesToday: today.sales,
      invoicesToday: today.count,
      profitToday: profitToday.profit,
      productCount,
      lowStockCount,
      inventoryValue,
      recentInvoices,
      topProducts,
      lowStockItems: inventory.lowStock().slice(0, 8),
    },
  });
}));

// --- فروش روزانه (۱۴ روز اخیر) ---
router.get('/sales-daily', requireAuth, asyncHandler((req, res) => {
  const rows = db.prepare(`
    SELECT date(created_at,'localtime') AS day, SUM(total) AS total, COUNT(*) AS count
    FROM invoices
    WHERE created_at >= datetime('now','-14 days')
    GROUP BY day ORDER BY day`).all();
  res.json({ ok: true, days: rows });
}));

// --- فروش ماهانه (۱۲ ماه) ---
router.get('/sales-monthly', requireAuth, asyncHandler((req, res) => {
  const rows = db.prepare(`
    SELECT strftime('%Y-%m', created_at,'localtime') AS month, SUM(total) AS total, COUNT(*) AS count
    FROM invoices GROUP BY month ORDER BY month DESC LIMIT 12`).all();
  res.json({ ok: true, months: rows.reverse() });
}));

// --- سود و هزینه ---
router.get('/profit', requireAuth, asyncHandler((req, res) => {
  const revenue = db.prepare('SELECT COALESCE(SUM(total),0) AS v FROM invoices').get().v;
  const cost = db.prepare('SELECT COALESCE(SUM(ii.buy_price*ii.quantity),0) AS v FROM invoice_items ii').get().v;
  const grossProfit = db.prepare('SELECT COALESCE(SUM((ii.unit_price-ii.buy_price)*ii.quantity),0) AS v FROM invoice_items ii').get().v;
  const expenses = db.prepare('SELECT COALESCE(SUM(amount),0) AS v FROM expenses').get().v;
  const purchases = db.prepare('SELECT COALESCE(SUM(total),0) AS v FROM purchases').get().v;
  res.json({ ok: true, revenue, cost, grossProfit, expenses, purchases, netProfit: grossProfit - expenses });
}));

// --- بدهی مشتریان و تأمین‌کنندگان ---
router.get('/debts', requireAuth, asyncHandler((req, res) => {
  const customers = db.prepare(`
    SELECT c.id, c.name, SUM(i.due) AS due FROM invoices i JOIN customers c ON c.id = i.customer_id
    WHERE i.due > 0 GROUP BY c.id ORDER BY due DESC LIMIT 100`).all();
  const suppliers = db.prepare(`
    SELECT s.id, s.name, SUM(p.due) AS due FROM purchases p JOIN suppliers s ON s.id = p.supplier_id
    WHERE p.due > 0 GROUP BY s.id ORDER BY due DESC LIMIT 100`).all();
  res.json({ ok: true, customers, suppliers });
}));

// --- کالاهای پرفروش / کم‌فروش / کم‌موجود ---
router.get('/products', requireAuth, asyncHandler((req, res) => {
  const bestSellers = db.prepare(`
    SELECT ii.name, SUM(ii.quantity) AS qty, SUM(ii.line_total) AS revenue
    FROM invoice_items ii GROUP BY ii.product_id, ii.name ORDER BY qty DESC LIMIT 15`).all();
  const soldIds = db.prepare('SELECT DISTINCT product_id FROM invoice_items WHERE product_id IS NOT NULL').all().map((r) => r.product_id);
  const slowMovers = db.prepare(`
    SELECT id, name, stock FROM products WHERE is_active = 1
    ${soldIds.length ? `AND id NOT IN (${soldIds.join(',')})` : ''}
    ORDER BY stock DESC LIMIT 15`).all();
  res.json({ ok: true, bestSellers, slowMovers, lowStock: inventory.lowStock() });
}));

module.exports = router;

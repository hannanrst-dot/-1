import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

// تاریخ‌ها به‌صورت رشتهٔ ISO ذخیره می‌شوند تا مقایسه‌های تاریخی (>=) به‌صورت
// متنی و سازگار با SQLite کار کنند.
const nowIso = () => new Date().toISOString();

// Users Table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("admin"), // 'admin' | 'seller' | 'stockkeeper'
  phone: text("phone"),
  status: text("status").notNull().default("active"), // 'active' | 'inactive'
  createdAt: text("created_at").notNull().$defaultFn(nowIso),
  updatedAt: text("updated_at").notNull().$defaultFn(nowIso),
});

// Categories Table
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code"),
  description: text("description"),
  icon: text("icon"),
  createdAt: text("created_at").notNull().$defaultFn(nowIso),
});

// Brands Table
export const brands = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(nowIso),
});

// Products Table
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  sku: text("sku"),
  barcode: text("barcode"),
  categoryId: integer("category_id").references(() => categories.id),
  brandId: integer("brand_id").references(() => brands.id),
  unit: text("unit").notNull().default("عدد"),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(5),
  buyPrice: real("buy_price").notNull().default(0),
  sellPrice: real("sell_price").notNull().default(0),
  discount: real("discount").notNull().default(0),
  taxPercent: real("tax_percent").notNull().default(0),
  description: text("description"),
  image: text("image"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(nowIso),
  updatedAt: text("updated_at").notNull().$defaultFn(nowIso),
  // تاریخِ آخرین تغییرِ قیمت (خرید/فروش) و تاریخِ آخرین «تأییدِ ادامه با همین قیمت»
  priceUpdatedAt: text("price_updated_at"),
  priceReviewedAt: text("price_reviewed_at"),
});

// Customers Table
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  totalPurchases: real("total_purchases").notNull().default(0),
  debt: real("debt").notNull().default(0),
  notes: text("notes"),
  createdAt: text("created_at").notNull().$defaultFn(nowIso),
});

// Suppliers Table
export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  company: text("company"),
  address: text("address"),
  totalPurchases: real("total_purchases").notNull().default(0),
  debt: real("debt").notNull().default(0),
  notes: text("notes"),
  createdAt: text("created_at").notNull().$defaultFn(nowIso),
});

// Invoices Table
export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull().default("مشتری عمومی"),
  customerPhone: text("customer_phone"),
  totalAmount: real("total_amount").notNull().default(0),
  discountAmount: real("discount_amount").notNull().default(0),
  taxAmount: real("tax_amount").notNull().default(0),
  finalAmount: real("final_amount").notNull().default(0),
  paidAmount: real("paid_amount").notNull().default(0),
  balance: real("balance").notNull().default(0),
  paymentMethod: text("payment_method").notNull().default("cash"), // cash|card|transfer|credit|split
  status: text("status").notNull().default("completed"), // completed|draft|cancelled
  notes: text("notes"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: text("created_at").notNull().$defaultFn(nowIso),
});

// Invoice Items Table
export const invoiceItems = sqliteTable("invoice_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  unit: text("unit").notNull().default("عدد"),
  quantity: integer("quantity").notNull().default(1),
  buyPrice: real("buy_price").notNull().default(0),
  unitPrice: real("unit_price").notNull().default(0),
  discount: real("discount").notNull().default(0),
  totalPrice: real("total_price").notNull().default(0),
});

// Purchases Table
export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  purchaseNumber: text("purchase_number").notNull().unique(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  supplierName: text("supplier_name").notNull(),
  totalAmount: real("total_amount").notNull().default(0),
  paidAmount: real("paid_amount").notNull().default(0),
  balance: real("balance").notNull().default(0),
  status: text("status").notNull().default("completed"),
  notes: text("notes"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: text("created_at").notNull().$defaultFn(nowIso),
});

// Purchase Items Table
export const purchaseItems = sqliteTable("purchase_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  purchaseId: integer("purchase_id").references(() => purchases.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  unit: text("unit").notNull().default("عدد"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull().default(0),
  totalPrice: real("total_price").notNull().default(0),
});

// Inventory Transactions Table
export const inventoryTransactions = sqliteTable("inventory_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").references(() => products.id).notNull(),
  type: text("type").notNull(), // sale|purchase|adjustment|return
  quantity: integer("quantity").notNull(),
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  referenceId: text("reference_id"),
  notes: text("notes"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: text("created_at").notNull().$defaultFn(nowIso),
});

// Expenses Table
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull().default("سایر"),
  amount: real("amount").notNull(),
  date: text("date").notNull().$defaultFn(nowIso),
  notes: text("notes"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: text("created_at").notNull().$defaultFn(nowIso),
});

// Settings Table (value ذخیره‌شده به‌صورت JSON متنی)
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value", { mode: "json" }).notNull(),
  updatedAt: text("updated_at").notNull().$defaultFn(nowIso),
});

// Installment Plans (خرید قسطی)
export const installmentPlans = sqliteTable("installment_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  invoiceNumber: text("invoice_number"),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  nationalId: text("national_id"),
  totalAmount: real("total_amount").notNull().default(0),
  downPayment: real("down_payment").notNull().default(0),
  installmentsCount: integer("installments_count").notNull().default(3), // 2 | 3 | 4 ...
  intervalDays: integer("interval_days").notNull().default(30),
  status: text("status").notNull().default("active"), // active | completed
  notes: text("notes"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Individual Installments (اقساط)
export const installments = sqliteTable("installments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id").references(() => installmentPlans.id, { onDelete: "cascade" }).notNull(),
  seq: integer("seq").notNull(),                 // شمارهٔ قسط
  dueDate: text("due_date").notNull(),           // تاریخ سررسید (ISO)
  amount: real("amount").notNull().default(0),
  paid: integer("paid", { mode: "boolean" }).notNull().default(false),
  paidAt: text("paid_at"),
  remindedAt: text("reminded_at"),
});

// Audit Logs Table
export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  userName: text("user_name"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  details: text("details"),
  createdAt: text("created_at").notNull().$defaultFn(nowIso),
});

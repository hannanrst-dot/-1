-- =====================================================================
--  اسکیمای دیتابیس نرم‌افزار ثبت‌یار
--  طراحی نرمال و ماژولار تا امکان افزودن ماژول‌های بعدی (حسابداری، چک،
--  چند فروشگاه، چند انبار و ...) بدون بازنویسی وجود داشته باشد.
--  قیمت‌ها همه بر حسب «ریال» به صورت عدد صحیح ذخیره می‌شوند تا خطای
--  اعشار پیش نیاید. نمایش به تومان در لایه رابط کاربری انجام می‌شود.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- کاربران و نقش‌ها -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'seller',   -- admin | seller | stockkeeper
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,               -- شناسه تصادفی نشست
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

-- دسته‌بندی و برند ----------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  parent_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS brands (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- کالاها --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  normalized_name TEXT NOT NULL DEFAULT '',    -- نام نرمال‌شده برای جستجوی هوشمند
  sku            TEXT,
  barcode        TEXT,
  category_id    INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  brand_id       INTEGER REFERENCES brands(id) ON DELETE SET NULL,
  unit           TEXT NOT NULL DEFAULT 'عدد',
  stock          REAL NOT NULL DEFAULT 0,
  min_stock      REAL NOT NULL DEFAULT 0,
  buy_price      INTEGER NOT NULL DEFAULT 0,   -- ریال
  sell_price     INTEGER NOT NULL DEFAULT 0,   -- ریال
  discount       INTEGER NOT NULL DEFAULT 0,   -- درصد
  tax            INTEGER NOT NULL DEFAULT 0,   -- درصد
  description    TEXT,
  image          TEXT,
  is_active      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(normalized_name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- مشتریان و تأمین‌کنندگان ---------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  phone      TEXT,
  address    TEXT,
  note       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

CREATE TABLE IF NOT EXISTS suppliers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  phone      TEXT,
  contact    TEXT,
  note       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- فاکتورهای فروش ------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  number        TEXT NOT NULL UNIQUE,          -- شماره فاکتور خوانا
  customer_id   INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  subtotal      INTEGER NOT NULL DEFAULT 0,    -- جمع اقلام پیش از تخفیف/مالیات (ریال)
  discount      INTEGER NOT NULL DEFAULT 0,    -- مبلغ تخفیف کل (ریال)
  tax           INTEGER NOT NULL DEFAULT 0,    -- مبلغ مالیات کل (ریال)
  total         INTEGER NOT NULL DEFAULT 0,    -- مبلغ نهایی (ریال)
  paid          INTEGER NOT NULL DEFAULT 0,    -- پرداخت‌شده (ریال)
  due           INTEGER NOT NULL DEFAULT 0,    -- بدهکاری (ریال)
  payment_method TEXT NOT NULL DEFAULT 'cash', -- cash|card|transfer|mixed|credit
  note          TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(created_at);

CREATE TABLE IF NOT EXISTS invoice_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id  INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,                   -- نام لحظه فروش (تاریخی)
  quantity    REAL NOT NULL,
  unit_price  INTEGER NOT NULL,                -- ریال
  discount    INTEGER NOT NULL DEFAULT 0,      -- درصد
  tax         INTEGER NOT NULL DEFAULT 0,      -- درصد
  line_total  INTEGER NOT NULL,                -- ریال
  buy_price   INTEGER NOT NULL DEFAULT 0       -- برای محاسبه سود
);

-- خریدها --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  number      TEXT NOT NULL UNIQUE,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  total       INTEGER NOT NULL DEFAULT 0,
  paid        INTEGER NOT NULL DEFAULT 0,
  due         INTEGER NOT NULL DEFAULT 0,
  note        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  quantity    REAL NOT NULL,
  unit_price  INTEGER NOT NULL,
  line_total  INTEGER NOT NULL
);

-- تراکنش‌های انبار (منبع حقیقت گردش موجودی) ---------------------------
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change      REAL NOT NULL,                   -- مثبت = ورود، منفی = خروج
  balance     REAL NOT NULL,                   -- موجودی پس از تراکنش
  reason      TEXT NOT NULL,                   -- sale|purchase|manual|adjust|initial
  ref_type    TEXT,                            -- invoice|purchase|manual
  ref_id      INTEGER,
  note        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inv_tx_product ON inventory_transactions(product_id);

-- پرداخت‌ها (برای بدهکاری مشتری/تأمین‌کننده) --------------------------
CREATE TABLE IF NOT EXISTS payments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  party_type  TEXT NOT NULL,                   -- customer | supplier
  party_id    INTEGER NOT NULL,
  amount      INTEGER NOT NULL,                -- ریال (مثبت = دریافت از مشتری/پرداخت به تأمین‌کننده)
  method      TEXT NOT NULL DEFAULT 'cash',
  ref_type    TEXT,
  ref_id      INTEGER,
  note        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- هزینه‌ها ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  amount     INTEGER NOT NULL,
  note       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- تنظیمات (کلید/مقدار) -----------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- ثبت فعالیت کاربران --------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,                    -- create|update|delete|login|...
  entity     TEXT NOT NULL,                    -- product|invoice|...
  entity_id  INTEGER,
  detail     TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * انتخاب یک مسیر قابل‌نوشتن برای فایل دیتابیس.
 * برخی هاست‌ها (مثل لیارا) فضای برنامه را «فقط‌خواندنی» می‌کنند؛ در آن صورت
 * دیتابیس در مسیر موقتِ سیستم ساخته می‌شود تا برنامه حتماً بالا بیاید.
 * برای ماندگاری دائمی، یک دیسک بسازید و DATABASE_FILE را به آن مسیر تنظیم کنید.
 */
function resolveWritableDbPath(): string {
  const envPath = process.env.DATABASE_FILE;
  const preferred = envPath
    ? path.isAbsolute(envPath)
      ? envPath
      : path.join(process.cwd(), envPath)
    : path.join(process.cwd(), "data", "store.db");

  const dir = path.dirname(preferred);
  try {
    fs.mkdirSync(dir, { recursive: true });
    const probe = path.join(dir, `.wtest-${process.pid}`);
    fs.writeFileSync(probe, "ok");
    fs.unlinkSync(probe);
    return preferred;
  } catch {
    const fallback = path.join(os.tmpdir(), "sabtyar", "store.db");
    fs.mkdirSync(path.dirname(fallback), { recursive: true });
    return fallback;
  }
}

// DDL کامل — با CREATE TABLE IF NOT EXISTS تا در اولین اجرا جداول ساخته شوند.
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  icon TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  category_id INTEGER REFERENCES categories(id),
  brand_id INTEGER REFERENCES brands(id),
  unit TEXT NOT NULL DEFAULT 'عدد',
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  buy_price REAL NOT NULL DEFAULT 0,
  sell_price REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  tax_percent REAL NOT NULL DEFAULT 0,
  description TEXT,
  image TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  total_purchases REAL NOT NULL DEFAULT 0,
  debt REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  address TEXT,
  total_purchases REAL NOT NULL DEFAULT 0,
  debt REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id INTEGER REFERENCES customers(id),
  customer_name TEXT NOT NULL DEFAULT 'مشتری عمومی',
  customer_phone TEXT,
  total_amount REAL NOT NULL DEFAULT 0,
  discount_amount REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  final_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  balance REAL NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_by_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'عدد',
  quantity INTEGER NOT NULL DEFAULT 1,
  buy_price REAL NOT NULL DEFAULT 0,
  unit_price REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  total_price REAL NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_number TEXT NOT NULL UNIQUE,
  supplier_id INTEGER REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  balance REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_by_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS purchase_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'عدد',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  total_price REAL NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reference_id TEXT,
  notes TEXT,
  created_by_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'سایر',
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_by_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS installment_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER REFERENCES invoices(id),
  invoice_number TEXT,
  customer_id INTEGER REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  national_id TEXT,
  total_amount REAL NOT NULL DEFAULT 0,
  down_payment REAL NOT NULL DEFAULT 0,
  installments_count INTEGER NOT NULL DEFAULT 3,
  interval_days INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS installments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL REFERENCES installment_plans(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  due_date TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  paid INTEGER NOT NULL DEFAULT 0,
  paid_at TEXT,
  reminded_at TEXT
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at TEXT NOT NULL
);
`;

const globalForDb = globalThis as typeof globalThis & {
  __sabtyarSqlite?: Database.Database;
};

function createConnection(): Database.Database {
  const dbFile = resolveWritableDbPath();
  const sqlite = new Database(dbFile);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(SCHEMA_SQL);
  // مهاجرت‌های سبک: افزودنِ ستون‌های جدید به دیتابیس‌های موجود (CREATE TABLE IF NOT EXISTS
  // ستونِ جدید را به جدولِ ازقبل‌موجود اضافه نمی‌کند). این کار بی‌خطر و تکرارپذیر است.
  const ensureColumn = (table: string, col: string, def: string) => {
    try {
      const cols = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
      if (!cols.some((c) => c.name === col)) {
        sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
      }
    } catch { /* ignore */ }
  };
  ensureColumn("invoices", "customer_phone", "TEXT");
  console.log("[sabtyar] مسیر دیتابیس:", dbFile);
  return sqlite;
}

const sqlite = globalForDb.__sabtyarSqlite ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  globalForDb.__sabtyarSqlite = sqlite;
}

export const db = drizzle(sqlite);
export { sqlite };

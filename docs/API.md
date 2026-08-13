# مستندات API — ثبت‌یار

همهٔ درخواست‌ها JSON و همهٔ پاسخ‌ها به فرم `{ "ok": true, ... }` یا در خطا
`{ "ok": false, "error": "پیام فارسی" }` هستند. احراز هویت با کوکی نشست
(`sabtyar_sid`) انجام می‌شود؛ پس از `login` کوکی به‌صورت خودکار ست می‌شود.

قیمت‌ها در دیتابیس بر حسب **ریال** (عدد صحیح) ذخیره می‌شوند. رابط کاربری آن‌ها را
به تومان تبدیل و نمایش می‌دهد.

---

## احراز هویت — `/api/auth`

| متد | مسیر | توضیح | دسترسی |
|-----|------|-------|--------|
| POST | `/login` | ورود. بدنه: `{username, password}` | عمومی |
| POST | `/logout` | خروج | کاربر |
| GET | `/me` | کاربر جاری | کاربر |
| GET | `/users` | فهرست کاربران | مدیر |
| POST | `/users` | ساخت کاربر. بدنه: `{username, password, fullName, role}` | مدیر |

`role` یکی از: `admin` | `seller` | `stockkeeper`.

---

## کالا — `/api/products`

| متد | مسیر | توضیح |
|-----|------|-------|
| GET | `/` | فهرست + جستجو/فیلتر. پارامترها: `q, category, brand, stock(in/out), lowStock, sort, active` |
| GET | `/:id` | جزئیات + تاریخچهٔ موجودی |
| POST | `/` | ثبت کالا |
| PUT | `/:id` | ویرایش |
| POST | `/:id/adjust-stock` | تغییر دستی موجودی. بدنه: `{change, note}` |
| DELETE | `/:id` | حذف (فقط مدیر) |

بدنهٔ ثبت/ویرایش کالا:
```json
{
  "name": "دفتر پاپکو ۸۰ برگ", "sku": "A-100", "barcode": "6260...",
  "category_id": 1, "brand_id": 2, "unit": "عدد",
  "stock": 50, "min_stock": 10,
  "buy_price": 450000, "sell_price": 600000,
  "discount": 0, "tax": 9, "description": "", "is_active": true
}
```

---

## دسته‌بندی و برند — `/api/catalog`

`GET/POST /categories` · `DELETE /categories/:id` · `GET/POST /brands` · `DELETE /brands/:id`

---

## فاکتور — `/api/invoices`

| متد | مسیر | توضیح |
|-----|------|-------|
| GET | `/` | فهرست فاکتورها |
| GET | `/:id` | فاکتور کامل با اقلام |
| POST | `/` | ثبت فاکتور (فروشنده) |

بدنهٔ ثبت فاکتور:
```json
{
  "customer_id": 3,               // یا customer_name برای مشتری جدید
  "items": [
    { "product_id": 6, "quantity": 2, "unit_price": 600000, "discount": 0, "tax": 0 }
  ],
  "discount": 0,                  // مبلغ تخفیف کل (ریال) — یا discountPercent
  "discountPercent": 10,
  "payment_method": "cash",       // cash|card|transfer|mixed|credit
  "paid": 1080000                 // اختیاری؛ پیش‌فرض = مبلغ کل
}
```
پاسخ شامل `invoice.warnings` است (مثلاً هشدار کمبود موجودی پس از فروش).

---

## خرید — `/api/purchases`

`GET /` · `GET /:id` · `POST /`

بدنهٔ ثبت خرید (کالای جدید به‌صورت خودکار ساخته می‌شود):
```json
{
  "supplier_id": 1,               // یا supplier_name
  "items": [
    { "product_id": null, "name": "دفتر پاپکو", "quantity": 100, "unit_price": 450000 }
  ],
  "paid": 45000000
}
```

---

## مشتری / تأمین‌کننده — `/api/customers` و `/api/suppliers`

`GET /?q=` · `GET /:id` (شامل خلاصهٔ مالی و تاریخچه) · `POST /` · `PUT /:id` · `DELETE /:id`

---

## گزارش‌ها — `/api/reports`

| مسیر | توضیح |
|------|-------|
| `GET /dashboard` | آمار داشبورد |
| `GET /sales-daily` | فروش ۱۴ روز اخیر |
| `GET /sales-monthly` | فروش ۱۲ ماه |
| `GET /profit` | درآمد/هزینه/سود |
| `GET /debts` | بدهی مشتریان و تأمین‌کنندگان |
| `GET /products` | پرفروش/کم‌فروش/کم‌موجود |

---

## صوتی — `/api/voice`

| متد | مسیر | توضیح |
|-----|------|-------|
| GET | `/info` | اطلاعات موتور فعال STT |
| POST | `/interpret` | تفسیر متن. بدنه: `{text}`. خروجی: «طرح عملیات» |
| POST | `/query` | پاسخ به پرسش‌های اطلاعاتی. بدنه: `{query:{type,...}}` |

خروجی `/interpret` (نمونهٔ فاکتور):
```json
{
  "ok": true,
  "result": {
    "intent": "create_invoice",
    "action": "create_invoice",
    "items": [ { "product_id": 6, "name": "...", "unit_price": 600000, "quantity": 2 } ],
    "customer": { "id": 3, "name": "علی رضایی" },
    "discountPercent": 10,
    "questions": [ /* پرسش‌های رفع ابهام در صورت وجود */ ],
    "needsConfirmation": true,
    "confirmText": "فاکتور شامل ۲ قلم و مبلغ ... تومان است. ثبت شود؟"
  }
}
```

مهم: `/interpret` هیچ داده‌ای را ذخیره یا حذف نمی‌کند؛ فقط «تفسیر» می‌کند. اجرای واقعی
از طریق APIهای همان ماژول‌ها (`/invoices`, `/products`, `/purchases`) و پس از تأیید کاربر است.

انواع `query.type`: `sales_today` · `low_stock` · `search_product` · `customer_last_invoice`.

---

## پشتیبان — `/api/backup` (مدیر)

`GET /` (فهرست) · `POST /` (ساخت پشتیبان) · `GET /download/:name` (دانلود)

---

## تنظیمات — `/api/settings`

`GET /` · `PUT /` (مدیر). کلیدها: `shop_name, shop_phone, shop_address, default_tax`.

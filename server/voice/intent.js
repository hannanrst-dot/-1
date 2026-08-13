'use strict';
/**
 * تشخیص «قصد» (Intent) کاربر از متن فارسی.
 * رویکرد: تطبیق مبتنی بر کلیدواژه و الگو (سبک، بدون وابستگی خارجی، قابل توسعه).
 * برای افزودن Intent جدید کافی است یک ورودی به آرایه RULES اضافه شود.
 */
const { normalize } = require('./normalizer');

/** فهرست Intentها به ترتیب اولویت (خاص‌تر بالاتر) */
const RULES = [
  {
    intent: 'confirm',
    test: (t) => /^(بله|بعله|اره|آره|تایید|تأیید|درسته|ثبت کن|ثبتش کن|اوکی|باشه|انجام بده|okay|ok)\b/.test(t)
      || /(ثبت کن|ثبتش کن|تایید( کن)?|تأیید( کن)?)/.test(t),
  },
  {
    intent: 'cancel',
    test: (t) => /(نه|خیر|لغو|کنسل|بیخیال|انصراف|نمیخوام)/.test(t),
  },
  {
    // ثبت کالا: تعریف یک کالا، معمولاً همراه «قیمت خرید» و «قیمت فروش» و بدون تأمین‌کننده.
    intent: 'add_product',
    test: (t) => {
      const explicit = /(اضافه کن|ثبت کالا|کالای جدید|بنداز تو انبار|به انبار اضافه)/.test(t);
      const hasBuy = /(قیمت خرید|خریدم|خریدی|خرید کردم)/.test(t);
      const hasSell = /(قیمت فروش|بفروش|فروش)/.test(t);
      const hasSupplier = /از\s+(شرکت|فروشگاه|آقای|خانم|تامین|تأمین)/.test(t);
      return explicit || (hasBuy && hasSell && !hasSupplier);
    },
    weight: 3,
  },
  {
    // ثبت خرید: خرید از یک تأمین‌کننده؛ معمولاً «از شرکت ... خریدم» و بدون قیمت فروش.
    intent: 'create_purchase',
    test: (t) => {
      const explicit = /(ثبت خرید|فاکتور خرید|بار اومد)/.test(t);
      const fromSupplier = /از\s+(شرکت|فروشگاه|آقای|خانم|تامین|تأمین)/.test(t) || /از .+ خرید/.test(t);
      const hasSell = /(قیمت فروش|بفروش)/.test(t);
      return explicit || (fromSupplier && /(خرید|خریدم)/.test(t) && !hasSell);
    },
    weight: 3,
  },
  {
    intent: 'create_invoice',
    test: (t) => /(فاکتور.*(بزن|بساز|جدید|صادر)|بزن برای|بفروش|فروش .* بزن|فاکتور کن)/.test(t),
    weight: 1,
  },
  {
    intent: 'query_sales_today',
    test: (t) => /(فروش امروز|امروز چقدر فروش|فروش .* امروز)/.test(t),
  },
  {
    intent: 'query_low_stock',
    test: (t) => /(کم.?موجود|موجودی.*(کم|کمه)|کدوم.*کم|کمبود موجودی)/.test(t),
  },
  {
    intent: 'query_customer_last_invoice',
    test: (t) => /(آخرین فاکتور|فاکتور اخیر).*(باز کن|بیار|نشون)/.test(t)
      || /(فاکتور).*(باز کن)/.test(t),
  },
  {
    intent: 'search_product',
    test: (t) => /(پیدا کن|جستجو|سرچ|بگرد|چند تا .* دارم|موجودی .* چقدر)/.test(t),
  },
];

/**
 * تشخیص Intent. اگر چند قاعده مطابقت داشته باشند، بیشترین وزن انتخاب می‌شود.
 * بازگشت: { intent, confidence }
 */
function detectIntent(rawText) {
  const t = normalize(rawText);
  let best = null;
  for (const rule of RULES) {
    if (rule.test(t)) {
      const w = rule.weight || 1;
      if (!best || w > best.weight) best = { intent: rule.intent, weight: w };
    }
  }
  if (best) return { intent: best.intent, confidence: Math.min(0.6 + best.weight * 0.15, 0.95) };

  // پیش‌فرض: اگر فقط نام کالا و تعداد بیان شده، احتمالاً قصد فاکتور است.
  if (/\d|یک|دو|سه|چهار|پنج|تا/.test(t)) {
    return { intent: 'create_invoice', confidence: 0.4 };
  }
  return { intent: 'unknown', confidence: 0.2 };
}

module.exports = { detectIntent, RULES };

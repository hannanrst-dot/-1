'use strict';
/**
 * موتور مرکزی صوتی (Voice Engine)
 * ----------------------------------------------------------------------
 * تمام منطق درک زبان طبیعی در همین یک ماژول متمرکز است و در سایر بخش‌های
 * برنامه پخش نشده است. مسیر پردازش دقیقاً مطابق معماری خواسته‌شده:
 *
 *   Voice Input (مرورگر)
 *     ↓  Persian Speech Recognition (Web Speech API)
 *     ↓  Persian Text Normalization       (normalizer.js)
 *     ↓  Intent Detection                 (intent.js)
 *     ↓  Entity Extraction                (entities.js)
 *     ↓  Validation + Smart Matching      (matcher.js + این ماژول)
 *     ↓  Ambiguity / Missing-info questions
 *     ↓  Confirmation
 *     ↓  Action  (لایه ماژول‌های تجاری)
 *     ↓  Database
 *
 * نکته امنیتی حیاتی (بخش ۲۹): این موتور هرگز خودش عملیات مالی را اجرا نمی‌کند.
 * خروجی آن یک «طرح عملیات» (plan) به‌همراه پرسش‌های لازم و مرحله تأیید است.
 * اجرای واقعی فقط پس از تأیید صریح کاربر و از طریق ماژول‌های تجاری انجام می‌شود.
 */
const { normalize, digitsToPersian } = require('./normalizer');
const { detectIntent } = require('./intent');
const entities = require('./entities');
const { matchProduct } = require('./matcher');
const { getRecognizer } = require('./recognizers');

class VoiceEngine {
  /**
   * @param {object} deps تزریق وابستگی‌ها (Repository ها) تا موتور مستقل از دیتابیس بماند.
   *   deps.listProducts() -> Array<product>
   *   deps.findCustomers(name) -> Array<customer>
   */
  constructor(deps = {}) {
    this.deps = deps;
    this.recognizer = getRecognizer();
  }

  info() {
    return { recognizer: this.recognizer.info() };
  }

  /**
   * ورودی: متن خام فارسی (از تبدیل گفتار مرورگر).
   * خروجی: یک شیء استاندارد «تفسیر» شامل intent، داده‌های استخراج‌شده،
   * پرسش‌های لازم برای رفع ابهام، و متن تأیید.
   */
  interpret(rawText, context = {}) {
    const text = String(rawText || '').trim();
    const normalized = normalize(text);
    const { intent, confidence } = detectIntent(text);

    const base = { rawText: text, normalized, intent, confidence, questions: [], needsConfirmation: false };

    switch (intent) {
      case 'add_product':
        return this._interpretAddProduct(text, base);
      case 'create_invoice':
        return this._interpretInvoice(text, base);
      case 'create_purchase':
        return this._interpretPurchase(text, base);
      case 'query_sales_today':
        return { ...base, action: 'query', query: { type: 'sales_today' } };
      case 'query_low_stock':
        return { ...base, action: 'query', query: { type: 'low_stock' } };
      case 'query_customer_last_invoice': {
        const customer = entities.extractCustomerName(text);
        return { ...base, action: 'query', query: { type: 'customer_last_invoice', customer } };
      }
      case 'search_product': {
        const found = entities.extractInvoiceItems(text);
        const q = found.items[0] ? found.items[0].name : normalized;
        return { ...base, action: 'query', query: { type: 'search_product', term: q } };
      }
      case 'confirm':
        return { ...base, action: 'confirm' };
      case 'cancel':
        return { ...base, action: 'cancel' };
      default:
        return {
          ...base,
          action: 'none',
          message: 'متوجه منظور شما نشدم. لطفاً واضح‌تر بگویید؛ مثلاً: «دو تا دفتر پاپکو بزن».',
        };
    }
  }

  // --- ثبت کالا ---------------------------------------------------------
  _interpretAddProduct(text, base) {
    const p = entities.extractProduct(text);
    const questions = [];
    if (!p.name) questions.push({ field: 'name', prompt: 'نام کالا را نگفتید. نام کالا چیست؟' });
    if (p.buyPrice == null) questions.push({ field: 'buyPrice', prompt: 'قیمت خرید وارد نشده است. لطفاً قیمت خرید را بگویید.' });
    if (p.sellPrice == null) questions.push({ field: 'sellPrice', prompt: 'قیمت فروش وارد نشده است. لطفاً قیمت فروش را بگویید.' });

    return {
      ...base,
      action: 'add_product',
      product: {
        name: p.name,
        stock: p.quantity ?? 0,
        min_stock: p.minStock ?? 0,
        buy_price: p.buyPrice ?? 0,
        sell_price: p.sellPrice ?? 0,
      },
      questions,
      needsConfirmation: questions.length === 0,
      confirmText: p.name
        ? `کالای «${p.name}»${p.quantity ? ` با موجودی ${digitsToPersian(p.quantity)}` : ''} ثبت شود؟`
        : null,
    };
  }

  // --- فاکتور فروش ------------------------------------------------------
  _interpretInvoice(text, base) {
    const parsed = entities.extractInvoiceItems(text);
    const products = this.deps.listProducts ? this.deps.listProducts() : [];
    const resolvedItems = [];
    const questions = [];

    for (const item of parsed.items) {
      const match = matchProduct(item.name, products);
      if (match.status === 'not_found') {
        questions.push({
          field: 'product', term: item.name, type: 'not_found',
          prompt: `کالایی با عبارت «${item.name}» پیدا نکردم. می‌خواهید آن را ثبت کنید یا نام دیگری بگویید؟`,
        });
        continue;
      }
      if (match.status === 'ambiguous') {
        questions.push({
          field: 'product', term: item.name, type: 'ambiguous',
          prompt: `${digitsToPersian(match.candidates.length)} محصول با عبارت «${item.name}» پیدا کردم. کدام را می‌خواهید؟`,
          options: match.candidates.map((c) => ({ id: c.product.id, name: c.product.name, price: c.product.sell_price })),
          quantity: item.quantity,
        });
        continue;
      }
      // matched
      const prod = match.best.product;
      const resolved = {
        product_id: prod.id,
        name: prod.name,
        unit_price: prod.sell_price,
        quantity: item.quantity,
        stock: prod.stock,
      };
      if (item.quantity == null) {
        questions.push({
          field: 'quantity', product_id: prod.id, name: prod.name,
          prompt: `تعداد «${prod.name}» را چند عدد وارد کنم؟`,
        });
      }
      resolvedItems.push(resolved);
    }

    // مشتری
    let customer = null;
    if (parsed.customer && this.deps.findCustomers) {
      const matches = this.deps.findCustomers(parsed.customer);
      if (matches.length === 1) customer = matches[0];
      else if (matches.length > 1) {
        questions.push({
          field: 'customer', term: parsed.customer, type: 'ambiguous',
          prompt: `چند مشتری با نام «${parsed.customer}» پیدا شد. کدام مورد نظر شماست؟`,
          options: matches.map((c) => ({ id: c.id, name: c.name, phone: c.phone })),
        });
      } else {
        customer = { id: null, name: parsed.customer, isNew: true };
      }
    }

    const total = resolvedItems.reduce((s, it) => s + (it.quantity ? it.quantity * it.unit_price : 0), 0);
    const readyItems = resolvedItems.filter((it) => it.quantity != null);

    return {
      ...base,
      action: 'create_invoice',
      items: resolvedItems,
      customer,
      discountPercent: parsed.discountPercent,
      questions,
      needsConfirmation: questions.length === 0 && readyItems.length > 0,
      estimatedTotal: total,
      confirmText: (questions.length === 0 && readyItems.length > 0)
        ? `فاکتور شامل ${digitsToPersian(readyItems.length)} قلم و مبلغ ${digitsToPersian(this._formatToman(total))} تومان است. ثبت شود؟`
        : null,
    };
  }

  // --- خرید -------------------------------------------------------------
  _interpretPurchase(text, base) {
    const parsed = entities.extractPurchase(text);
    const products = this.deps.listProducts ? this.deps.listProducts() : [];
    const items = [];
    const questions = [];

    for (const it of parsed.items) {
      const match = matchProduct(it.name, products);
      const resolved = {
        name: it.name,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        product_id: match.status === 'matched' ? match.best.product.id : null,
      };
      if (match.status === 'ambiguous') {
        questions.push({
          field: 'product', term: it.name, type: 'ambiguous',
          prompt: `چند کالا با «${it.name}» پیدا شد. کدام؟`,
          options: match.candidates.map((c) => ({ id: c.product.id, name: c.product.name })),
        });
      }
      if (it.quantity == null) questions.push({ field: 'quantity', name: it.name, prompt: `تعداد «${it.name}» را بگویید.` });
      if (it.unitPrice == null) questions.push({ field: 'unit_price', name: it.name, prompt: `قیمت خرید «${it.name}» را بگویید.` });
      items.push(resolved);
    }

    return {
      ...base,
      action: 'create_purchase',
      supplier: parsed.supplier ? { name: parsed.supplier } : null,
      items,
      questions,
      needsConfirmation: questions.length === 0 && items.length > 0,
      confirmText: items.length
        ? `ثبت خرید ${digitsToPersian(items.length)} قلم${parsed.supplier ? ` از «${parsed.supplier}»` : ''} انجام شود؟`
        : null,
    };
  }

  _formatToman(rial) {
    return Math.round(rial / 10);
  }
}

module.exports = VoiceEngine;

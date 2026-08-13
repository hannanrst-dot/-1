'use strict';
/**
 * جستجوی هوشمند و تطبیق نام کالا با داده‌های دیتابیس.
 * فقط تطبیق دقیق متن استفاده نمی‌شود؛ امتیازدهی بر پایه:
 *   - تطبیق کامل نرمال‌شده
 *   - شمول همه کلمات کلیدی
 *   - همپوشانی توکن‌ها (Jaccard)
 * اگر چند نتیجه نزدیک باشند، مدیریت ابهام به عهده لایه بالاتر است.
 */
const { normalize, stripStopwords } = require('./normalizer');

function tokenize(text) {
  return stripStopwords(normalize(text)).split(' ').filter(Boolean);
}

/** امتیاز شباهت بین عبارت جستجو و یک کالا (۰ تا ۱) */
function scoreProduct(queryTokens, product) {
  const nameNorm = product.normalized_name || normalize(product.name);
  const nameTokens = nameNorm.split(' ').filter(Boolean);
  if (queryTokens.length === 0 || nameTokens.length === 0) return 0;

  const queryStr = queryTokens.join(' ');
  // تطبیق دقیق کامل
  if (nameNorm === queryStr) return 1;

  const nameSet = new Set(nameTokens);
  let contained = 0;
  for (const q of queryTokens) {
    if (nameSet.has(q)) contained += 1;
    else if (nameTokens.some((n) => n.includes(q) || q.includes(n))) contained += 0.6;
  }
  const coverage = contained / queryTokens.length; // چه مقدار از کلمات جستجو پوشش داده شد

  // همپوشانی کلی
  const union = new Set([...queryTokens, ...nameTokens]).size;
  const jaccard = contained / union;

  // تطبیق SKU/بارکد
  let codeBonus = 0;
  if (product.sku && normalize(product.sku) === queryStr) codeBonus = 1;
  if (product.barcode && normalize(product.barcode) === queryStr) codeBonus = 1;

  return Math.min(1, Math.max(codeBonus, coverage * 0.75 + jaccard * 0.25));
}

/**
 * تطبیق یک عبارت با فهرست کالاها.
 * بازگشت: { status: 'matched'|'ambiguous'|'not_found', best, candidates }
 *   - matched: یک نتیجه مطمئن
 *   - ambiguous: چند نتیجه نزدیک → باید از کاربر پرسیده شود
 *   - not_found: چیزی یافت نشد
 */
function matchProduct(query, products, opts = {}) {
  const threshold = opts.threshold ?? 0.45;
  const ambiguityGap = opts.ambiguityGap ?? 0.15;
  const maxCandidates = opts.maxCandidates ?? 5;

  const queryTokens = tokenize(query);
  const scored = products
    .map((p) => ({ product: p, score: scoreProduct(queryTokens, p) }))
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { status: 'not_found', best: null, candidates: [] };

  const top = scored[0];
  const second = scored[1];

  // اگر نتیجه دوم بسیار نزدیک به اولی باشد → ابهام
  if (top.score < 0.99 && second && (top.score - second.score) < ambiguityGap) {
    return {
      status: 'ambiguous',
      best: top,
      candidates: scored.slice(0, maxCandidates),
    };
  }

  // اگر بهترین امتیاز خیلی بالا نباشد ولی چند گزینه باشد
  if (top.score < 0.7 && scored.length > 1) {
    return {
      status: 'ambiguous',
      best: top,
      candidates: scored.slice(0, maxCandidates),
    };
  }

  return { status: 'matched', best: top, candidates: scored.slice(0, maxCandidates) };
}

module.exports = { matchProduct, scoreProduct, tokenize };

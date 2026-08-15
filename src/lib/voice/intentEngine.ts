import { normalizeSpokenPersian, parsePersianNumberWords } from "./persianNormalizer";

export type VoiceIntentType =
  | "CREATE_PRODUCT"
  | "CREATE_INVOICE"
  | "CREATE_PURCHASE"
  | "BULK_PRICE_UPDATE"
  | "STOCK_UPDATE"
  | "QUERY_TODAY_SALES"
  | "QUERY_LOW_STOCK"
  | "QUERY_CUSTOMER_INVOICE"
  | "SEARCH_PRODUCT"
  | "CONFIRM"
  | "CANCEL"
  | "UNKNOWN";

export interface ParsedVoiceItem {
  productName: string;
  quantity: number;
  buyPrice?: number;
  sellPrice?: number;
}

export interface VoiceActionResult {
  intent: VoiceIntentType;
  rawText: string;
  normalizedText: string;
  confidence: number;
  entities: {
    productName?: string;
    customerName?: string;
    supplierName?: string;
    stock?: number;
    buyPrice?: number;
    sellPrice?: number;
    discount?: number;
    items?: ParsedVoiceItem[];
    searchQuery?: string;
    percent?: number;
    priceDirection?: "increase" | "decrease";
    filterName?: string | null;
    stockMode?: "set" | "increase" | "decrease";
  };
  promptUser?: string; // If system needs to ask user for missing info
}

/**
 * Helper to extract customer name if spoken in invoice command
 */
function extractCustomerFromVoice(normText: string): string | undefined {
  const match = normText.match(/(?:برای|به نام|مشتری)\s+([آ-ی\s]+?)(?:\s+فاکتور|\s+سه|\s+دو|\s+یک|\s+\d+|\s+بزن|\s+بنویس|,|$)/);
  if (match) {
    const candidate = match[1].replace(/فاکتور|بزن|بنویس/g, '').trim();
    if (candidate.length > 1 && !['سه', 'دو', 'یک', 'پنج', 'چند'].includes(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

/**
 * Extract product registration attributes from speech input
 */
function extractProductDetailsFromVoice(normText: string) {
  // در این مرحله ارقام فارسی قبلاً به انگلیسی تبدیل شده‌اند (normalizeSpokenPersian).
  let stock = 1;
  let buyPrice = 0;
  let sellPrice = 0;

  // قیمت خرید — عبارت عددی بعد از کلیدواژه تا کلیدواژهٔ بعدی/انتها
  const buyMatch = normText.match(/(?:قیمت\s*خرید|خریدم|خریدی|خرید)\s*[:\-]?\s*([\d\s؀-ۿ]+?)(?:تومان|تومن|ریال|قیمت|فروش|تعداد|موجودی|،|,|$)/);
  if (buyMatch) {
    const parsed = parsePersianNumberWords(buyMatch[1]);
    if (parsed) buyPrice = parsed;
  }

  // قیمت فروش
  const sellMatch = normText.match(/(?:قیمت\s*فروش|بفروشم|بفروش|فروش)\s*[:\-]?\s*([\d\s؀-ۿ]+?)(?:تومان|تومن|ریال|قیمت|خرید|تعداد|موجودی|،|,|$)/);
  if (sellMatch) {
    const parsed = parsePersianNumberWords(sellMatch[1]);
    if (parsed) sellPrice = parsed;
  }
  // حالت محاوره‌ای «۶۰ هزار بفروشم» که عدد پیش از فعل می‌آید
  if (!sellPrice) {
    const sell2 = normText.match(/([\d\s؀-ۿ]+?)\s*(?:تومان|تومن|ریال)?\s*(?:می\s*خوام\s*)?بفروش(?:م|ی)?/);
    if (sell2) {
      const parsed = parsePersianNumberWords(sell2[1]);
      if (parsed) sellPrice = parsed;
    }
  }

  // تعداد/موجودی
  const qtyMatch = normText.match(/(?:تعداد|موجودی|تعدادش)\s*[:\-]?\s*([\d\s؀-ۿ]+?)(?:تا|عدد|بسته|قیمت|،|,|$)/);
  if (qtyMatch) {
    const parsed = parsePersianNumberWords(qtyMatch[1]);
    if (parsed) stock = parsed;
  } else {
    const countMatch = normText.match(/(\d+|پنجاه|بیست|سی|چهل|شصت|هفتاد|هشتاد|نود|صد|ده|بیست)\s*(?:تا|عدد|بسته)/);
    if (countMatch) {
      const parsed = parsePersianNumberWords(countMatch[1]);
      if (parsed) stock = parsed;
    }
  }

  // نام کالا: بخش ابتدایی جمله تا اولین کلیدواژهٔ توصیفی یا اولین ویرگول.
  let productName = normText;
  const cutKeywords = ["تعداد", "موجودی", "قیمت خرید", "قیمت فروش", "قیمت", "خرید", "فروش", "بفروش", "حداقل", "تخفیف", "مالیات"];
  let cutIndex = productName.length;
  for (const kw of cutKeywords) {
    const idx = productName.indexOf(kw);
    if (idx > 0 && idx < cutIndex) cutIndex = idx;
  }
  productName = productName.slice(0, cutIndex);
  const comma = productName.search(/[،,]/);
  if (comma > 1) productName = productName.slice(0, comma);
  productName = productName
    .replace(/(اضافه کن|ثبت کن|به انبار|رو اضافه کن|را اضافه کن| رو | را |دارم|میخوام|می خوام|بنداز تو انبار)/g, " ")
    .replace(/^(یه|یک)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
  // حذف تعداد ابتدایی چسبیده به نام مثل «۵۰ تا دفتر پاپکو»
  productName = productName.replace(/^\s*\d+\s*(?:تا|عدد|بسته|دونه)?\s+/, "").trim();

  return {
    productName: productName.length >= 2 ? productName : "کالای جدید",
    stock,
    buyPrice,
    sellPrice,
  };
}

/**
 * Extract items array from voice invoice or purchase command
 * Example: "سه تا دفتر پاپکو و دو تا مداد استدلر" -> [{productName: "دفتر پاپکو", quantity: 3}, {productName: "مداد استدلر", quantity: 2}]
 */
function extractInvoiceOrPurchaseItems(normText: string): ParsedVoiceItem[] {
  const items: ParsedVoiceItem[] = [];

  // Remove preface customer info
  let text = normText.replace(/(?:برای|به نام|مشتری)\s+[آ-ی\s]+?(?=\s+فاکتور|\s+سه|\s+دو|\s+یک|\s+\d+)/, '');
  text = text.replace(/فاکتور بزن|فاکتور ثبت کن|بزن|بنویس|ثبت کن/g, '');

  // جداسازی اقلام با «و»، ویرگول، و کلمات جداکنندهٔ صریح: «بعدی»، «بعدش»، «همچنین».
  // نکته: از \b استفاده نمی‌کنیم چون با حروف فارسی کار نمی‌کند؛ به‌جای آن فاصله می‌گذاریم.
  // همچنین وقتی کالاها فقط با فاصله پشت‌سرهم گفته می‌شوند (بدون «و»)، جایی که یک
  // «[عدد] تا/عدد/بسته» جدید شروع می‌شود، قلم جدید در نظر گرفته می‌شود.
  const QTY = "\\d+|یک|یه|دو|سه|چهار|پنج|شش|شیش|هفت|هشت|نه|ده|یازده|دوازده|بیست|سی|چهل|پنجاه|شصت|هفتاد|هشتاد|نود|صد";
  text = text.replace(new RegExp(`(\\S)\\s+(${QTY})\\s*(تا|عدد|بسته|کارتن)\\s`, "g"), `$1 ||| $2 $3 `);

  const clauses = text
    .split(/\|\|\||[،,؛]|\sو\s|\sبعدی\s|\sبعدا\s|\sبعدش\s|\sهمچنین\s|\sبعد\s/)
    .map(c => c.trim())
    .filter(Boolean);

  for (const clause of clauses) {
    // Match pattern: "3 تا مداد" or "مداد 3 تا" or "دو تا دفتر پاپکو"
    const prefixQtyMatch = clause.match(/^(\d+|یک|دو|سه|چهار|پنج|شش|شیش|هفت|هشت|نه|ده|یازده|دوازده|پانزده|پونزده|بیست|سی|چهل|پنجاه)\s*(?:تا|عدد|بسته|کارتن)?\s+(.+)$/);
    const suffixQtyMatch = clause.match(/^(.+?)\s+(\d+|یک|دو|سه|چهار|پنج|شش|شیش|هفت|هشت|نه|ده|بیست|پنجاه)\s*(?:تا|عدد|بسته)?$/);

    if (prefixQtyMatch) {
      const qty = parsePersianNumberWords(prefixQtyMatch[1]) || 1;
      const pName = prefixQtyMatch[2].trim();
      if (pName.length > 1) {
        items.push({ productName: pName, quantity: qty });
      }
    } else if (suffixQtyMatch) {
      const pName = suffixQtyMatch[1].trim();
      const qty = parsePersianNumberWords(suffixQtyMatch[2]) || 1;
      if (pName.length > 1) {
        items.push({ productName: pName, quantity: qty });
      }
    } else {
      // Just product name without explicit quantity (default 1)
      const cleaned = clause.replace(/\d+\s*(?:تومان|تومن|ریال)/g, '').trim();
      if (cleaned.length > 1) {
        items.push({ productName: cleaned, quantity: 1 });
      }
    }
  }

  return items;
}

const NUMW = "\\d+|صد|یکصد|دویست|سیصد|چهارصد|پانصد|ششصد|هفتصد|هشتصد|نهصد|هزار|یک|دو|سه|چهار|پنج|شش|شیش|هفت|هشت|نه|ده|بیست|سی|چهل|پنجاه|شصت|هفتاد|هشتاد|نود";

/** ساخت نتیجهٔ «ثبت کالا» از متن نرمال‌شده */
export function buildProductResult(raw: string, norm: string): VoiceActionResult {
  return {
    intent: "CREATE_PRODUCT",
    rawText: raw,
    normalizedText: norm,
    confidence: 0.9,
    entities: extractProductDetailsFromVoice(norm),
  };
}

/** ساخت نتیجهٔ «فاکتور» از متن نرمال‌شده */
export function buildInvoiceResult(raw: string, norm: string): VoiceActionResult {
  return {
    intent: "CREATE_INVOICE",
    rawText: raw,
    normalizedText: norm,
    confidence: 0.85,
    entities: {
      customerName: extractCustomerFromVoice(norm),
      items: extractInvoiceOrPurchaseItems(norm),
    },
  };
}

/** ساخت نتیجهٔ «خرید» از متن نرمال‌شده */
export function buildPurchaseResult(raw: string, norm: string): VoiceActionResult {
  let supplierName: string | undefined;
  const sup = norm.match(new RegExp(`از\\s+(?:شرکت|فروشگاه|آقای|خانم|تامین\\s*کننده)?\\s*(.+?)\\s+(?:${NUMW}|خرید)`));
  if (sup) supplierName = sup[1].replace(/^(شرکت|فروشگاه)\s+/, "").trim();

  const items: ParsedVoiceItem[] = [];
  const qi = norm.match(new RegExp(`(${NUMW})\\s*(?:تا|عدد|بسته|کارتن)\\s+(.+?)\\s+(?:رو\\s+)?(?:خرید|قیمت|به قیمت|دونه|دانه|هرکدام|هر\\s*عدد|$)`));
  if (qi) {
    const quantity = parsePersianNumberWords(qi[1]) || 1;
    const productName = qi[2].trim();
    if (productName.length > 1) items.push({ productName, quantity });
  }
  if (items.length === 0) {
    for (const it of extractInvoiceOrPurchaseItems(norm)) items.push(it);
  }

  const buyPriceMatch = norm.match(/(?:قیمت\s*خرید|دونه\s*ای|دانه\s*ای|هرکدام|هر\s*کدام|هر\s*عدد|به قیمت)\s*[:\-]?\s*([\d\s؀-ۿ]+?)(?:تومان|تومن|ریال|،|,|$)/);
  let buyPrice: number | undefined;
  if (buyPriceMatch) buyPrice = parsePersianNumberWords(buyPriceMatch[1]) ?? undefined;

  return {
    intent: "CREATE_PURCHASE",
    rawText: raw,
    normalizedText: norm,
    confidence: 0.88,
    entities: { supplierName, buyPrice, items },
  };
}

/** ساخت نتیجهٔ «تغییر درصدی قیمت» از متن نرمال‌شده */
export function buildPriceUpdateResult(raw: string, norm: string): VoiceActionResult {
  const pm = norm.match(new RegExp(`(${NUMW})\\s*درصد`));
  const percent = pm ? parsePersianNumberWords(pm[1]) ?? 0 : 0;
  const decrease = /کم|تخفیف|پایین|کاهش|ارزون|ارزان/.test(norm);
  const priceDirection: "increase" | "decrease" = decrease ? "decrease" : "increase";

  // اگر «همه/تمام کالاها» گفته شود → همهٔ کالاها؛ وگرنه نامِ فیلتر استخراج می‌شود.
  let filterName: string | null = null;
  if (!/همه|تمام|کل\s*کالا|همگی/.test(norm)) {
    const fm = norm.match(/قیمت\s+(.+?)\s+(?:رو|را|به|\d|درصد|ده|بیست|سی|چهل|پنجاه|شصت|هفتاد|هشتاد|نود|صد)/);
    if (fm) filterName = fm[1].replace(/(ها|های|هارو|هارا)$/, "").trim() || null;
  }

  return {
    intent: "BULK_PRICE_UPDATE",
    rawText: raw,
    normalizedText: norm,
    confidence: 0.9,
    entities: { percent, priceDirection, filterName },
  };
}

/** ساخت نتیجهٔ «تغییر موجودی» از متن نرمال‌شده.
 *  نمونه‌ها: «موجودی دفتر پاپکو رو ۵۰ کن» (تنظیم) ، «موجودی مداد رو ۲۰ تا اضافه کن» (افزایش) ،
 *  «موجودی خودکار رو ۵ تا کم کن» (کاهش). */
export function buildStockUpdateResult(raw: string, norm: string): VoiceActionResult {
  const stockMode: "set" | "increase" | "decrease" =
    /(اضافه|زیاد|بیشتر|افزایش|بالا)/.test(norm) ? "increase"
    : /(کم|کاهش|کسر|کمتر|پایین)/.test(norm) ? "decrease"
    : "set";

  // نام کالا: بین «موجودی» و عدد/فعل
  let filterName: string | null = null;
  const nameMatch = norm.match(new RegExp(`موجودی\\s+(?:کالای\\s+)?(.+?)\\s+(?:رو|را|به|بشه|${NUMW})`));
  if (nameMatch) filterName = nameMatch[1].replace(/(ها|های|هارو|هارا)$/, "").trim() || null;
  if (/همه|تمام|کل\s*کالا|همگی/.test(norm)) filterName = null;

  // مقدار: ترجیحاً عددِ بعد از «رو/را/به»، وگرنه اولین عددِ همراه «تا/عدد»، وگرنه اولین عدد.
  let amountStr: string | null = null;
  const after = norm.match(new RegExp(`(?:رو|را|به|بشه|بکن|تعدادش|بذار|بزار)\\s*(${NUMW}(?:\\s+و\\s+${NUMW})?)`));
  if (after) amountStr = after[1];
  if (!amountStr) { const withUnit = norm.match(new RegExp(`(${NUMW})\\s*(?:تا|عدد|بسته)`)); if (withUnit) amountStr = withUnit[1]; }
  if (!amountStr) { const any = norm.match(new RegExp(`(${NUMW})`)); if (any) amountStr = any[1]; }
  const stock = amountStr ? (parsePersianNumberWords(amountStr) || 0) : 0;

  return {
    intent: "STOCK_UPDATE",
    rawText: raw,
    normalizedText: norm,
    confidence: 0.9,
    entities: { filterName, stock, stockMode },
  };
}

export type ForceMode = "invoice" | "product" | "purchase" | "price";

/**
 * Detects intent and extracts structured entities from raw Persian spoken sentence.
 * اگر forceMode داده شود، تشخیص خودکار نادیده گرفته می‌شود و مستقیماً همان حالت
 * پردازش می‌شود (برای دکمه‌های جداگانهٔ فاکتور/کالا/خرید).
 */
export function processVoiceCommand(spokenText: string, forceMode?: ForceMode): VoiceActionResult {
  const norm = normalizeSpokenPersian(spokenText);
  const raw = spokenText.trim();

  if (forceMode === "product") return buildProductResult(raw, norm);
  if (forceMode === "purchase") return buildPurchaseResult(raw, norm);
  if (forceMode === "invoice") return buildInvoiceResult(raw, norm);
  if (forceMode === "price") {
    // در پنل «تغییر قیمت صوتی»، فرمانِ موجودی هم پشتیبانی می‌شود: اگر «موجودی» گفته شد
    // و «درصد/قیمت» نبود، آن را تغییر موجودی در نظر می‌گیریم؛ وگرنه تغییر درصدی قیمت.
    if (norm.includes("موجودی") && !norm.includes("درصد") && !norm.includes("قیمت")) {
      return buildStockUpdateResult(raw, norm);
    }
    return buildPriceUpdateResult(raw, norm);
  }

  // تغییر درصدی قیمت: «قیمت ... را ... درصد زیاد/کم کن»
  if (norm.includes("درصد") && norm.includes("قیمت") && /(زیاد|اضافه|گرون|گران|بالا|افزایش|کم|تخفیف|کاهش|ارزون|ارزان)/.test(norm)) {
    return buildPriceUpdateResult(raw, norm);
  }

  // 1. Check Confirm / Cancel
  if (/^(ثبت کن|تایید|بله|آره|حتمی|اوکی|ثبت بکن|انجام بده)$/i.test(norm)) {
    return {
      intent: "CONFIRM",
      rawText: raw,
      normalizedText: norm,
      confidence: 0.98,
      entities: {},
    };
  }

  if (/^(لغو|لغو کن|خیر|نه|بیخیال|کنسل|انصراف)$/i.test(norm)) {
    return {
      intent: "CANCEL",
      rawText: raw,
      normalizedText: norm,
      confidence: 0.98,
      entities: {},
    };
  }

  // 2. Check Query Intent: Today Sales
  if (norm.includes("فروش امروز") || norm.includes("امروز چقدر") || norm.includes("امار فروش") || norm.includes("مبلغ فروش امروز")) {
    return {
      intent: "QUERY_TODAY_SALES",
      rawText: raw,
      normalizedText: norm,
      confidence: 0.95,
      entities: {},
    };
  }

  // 3. Check Query Intent: Low Stock
  if (norm.includes("موجودی کم") || norm.includes("کدوم کالاها") || norm.includes("کالاهای کم موجود") || norm.includes("کالاها موجودیشون کمه") || norm.includes("کمبود موجودی")) {
    return {
      intent: "QUERY_LOW_STOCK",
      rawText: raw,
      normalizedText: norm,
      confidence: 0.95,
      entities: {},
    };
  }

  // 4. Check Query Intent: Customer Last Invoice
  if (norm.includes("فاکتور") && (norm.includes("باز کن") || norm.includes("بیار"))) {
    const customerName = extractCustomerFromVoice(norm);
    return {
      intent: "QUERY_CUSTOMER_INVOICE",
      rawText: raw,
      normalizedText: norm,
      confidence: 0.9,
      entities: { customerName },
    };
  }

  // 5. Check Search Product
  if (norm.startsWith("جستجو") || norm.startsWith("سرچ") || norm.startsWith("پیدا کن")) {
    const query = norm.replace(/^(جستجو|سرچ|پیدا کن)\s+(کالای\s+)?/, "").trim();
    return {
      intent: "SEARCH_PRODUCT",
      rawText: raw,
      normalizedText: norm,
      confidence: 0.9,
      entities: { searchQuery: query },
    };
  }

  // 6. Check Purchase Intent (ثبت خرید)
  if (norm.includes("خریدم") || norm.includes("خرید از") || norm.includes("ثبت خرید")) {
    return buildPurchaseResult(raw, norm);
  }

  // 7. Check Single Product Registration Intent (ثبت کالا با صدا)
  if (
    norm.includes("قیمت خرید") ||
    norm.includes("قیمت فروش") ||
    (norm.includes("موجودی") && norm.includes("قیمت")) ||
    (norm.includes("اضافه کن") && norm.includes("خریدی"))
  ) {
    return buildProductResult(raw, norm);
  }

  // 8. Default fallback to Invoice Generation (فاکتور صوتی)
  const invoiceResult = buildInvoiceResult(raw, norm);
  if ((invoiceResult.entities.items?.length || 0) > 0) {
    return invoiceResult;
  }

  // Unknown intent
  return {
    intent: "UNKNOWN",
    rawText: raw,
    normalizedText: norm,
    confidence: 0.3,
    entities: {},
  };
}

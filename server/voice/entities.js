'use strict';
/**
 * استخراج موجودیت‌ها (Entities) از متن فارسی برای هر Intent.
 * خروجی این ماژول ساختار داده‌ای خام است؛ اعتبارسنجی و تطبیق با دیتابیس
 * در لایه‌های بعدی (matcher و pipeline) انجام می‌شود.
 */
const { normalize, digitsToEnglish } = require('./normalizer');
const { wordsToNumber, parseMoneyToRial } = require('./numbers');

// واژه‌های عددی برای الگوها. ترتیب «بلند به کوتاه» مهم است تا مثلاً «پنجاه»
// به‌اشتباه به «پنج» بریده نشود (الترناسیون regex از راست به چپ اولین تطبیق را می‌گیرد).
const QTY_WORDS = ['یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده',
  'چهار', 'پنج', 'شیش', 'شش', 'هفت', 'هشت', 'یه', 'یک', 'دو', 'سه', 'نه', 'ده'].join('|');
// اعداد بزرگ‌تر (برای موجودی و قیمت) — باز هم بلند به کوتاه
const NUM_WORDS = ['پانصد', 'پونصد', 'دویست', 'سیصد', 'چهارصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد',
  'پنجاه', 'هفتاد', 'هشتاد', 'چهل', 'شصت', 'نود', 'بیست', 'صد', 'سی',
  'چهار', 'پنج', 'شیش', 'شش', 'هفت', 'هشت', 'یه', 'یک', 'دو', 'سه', 'نه', 'ده'].join('|');
const DIGIT_OR_NUM = `(?:\\d+(?:\\.\\d+)?)|${NUM_WORDS}`;

/**
 * تجزیه یک عبارت به «تعداد + نام کالا».
 * مثال: «دو تا دفتر پاپکو» → { quantity: 2, name: 'دفتر پاپکو' }
 *        «مداد استدلر ۳ تا» → { quantity: 3, name: 'مداد استدلر' }
 */
function parseLineItem(segment) {
  const raw = segment.trim();
  const norm = normalize(raw);
  if (!norm) return null;

  let quantity = null;
  let namePart = norm;

  // قاعده مهم برای رفع ابهام (بخش ۸):
  // یک عدد فقط زمانی «تعداد» محسوب می‌شود که همراه شمارشگر «تا/عدد/دونه/دانه» باشد،
  // یا یک واژهٔ عددی کوچک باشد (مثل «دو تا»). این‌گونه اعداد داخل نام کالا مانند
  // «دفتر ۸۰» یا «مداد ۱۲ رنگ» به‌اشتباه تعداد تلقی نمی‌شوند.
  const counter = '(?:تا|عدد|دونه|دانه)';
  // الگوی «<عدد> تا <نام>»  (شمارشگر الزامی برای عدد رقمی، اختیاری برای واژه عددی)
  const leadDigit = norm.match(new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*${counter}\\s+(.+)$`));
  const leadWord = norm.match(new RegExp(`^(${QTY_WORDS})\\s*${counter}?\\s+(.+)$`));
  // الگوی «<نام> <عدد> تا»  (شمارشگر الزامی)
  const trailNum = norm.match(new RegExp(`^(.+?)\\s+((?:\\d+(?:\\.\\d+)?)|${QTY_WORDS})\\s*${counter}$`));

  if (leadDigit) {
    quantity = wordsToNumber(leadDigit[1]);
    namePart = leadDigit[2];
  } else if (leadWord) {
    quantity = wordsToNumber(leadWord[1]);
    namePart = leadWord[2];
  } else if (trailNum) {
    quantity = wordsToNumber(trailNum[2]);
    namePart = trailNum[1];
  }

  namePart = namePart.replace(/(^|\s)(تا|عدد|دونه|دانه)(\s|$)/g, ' ').replace(/\s+/g, ' ').trim();
  if (!namePart) return null;

  return {
    name: namePart,
    quantity: quantity != null && quantity > 0 ? quantity : null, // null = تعداد نامشخص (باید پرسیده شود)
    raw,
  };
}

/**
 * استخراج اقلام فاکتور از یک جمله چندقلمی.
 * جداسازی با «و» ، «،» ، «؛».
 */
function extractInvoiceItems(rawText) {
  const customer = extractCustomerName(rawText);
  const discount = extractPercent(rawText);

  let t = normalize(rawText);
  // حذف بخش دستوری «فاکتور بزن/کن» در هر جای جمله
  t = t.replace(/(?:فاکتور\s*(?:بزن|کن|بساز|جدید)?|بزن|بفروش|صادر کن)/g, ' ');
  // حذف پیشوند مشتری «برای <نام>» تا با اقلام قاطی نشود
  if (customer) {
    t = t.replace(new RegExp(`برای\\s+${customer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), ' ');
  }
  t = t.replace(/برای\s+[^،,؛\d]+/, ' ');

  // جداسازی فقط با علائم نگارشی یا « و » با فاصله در دو طرف؛ نه «و» چسبیده،
  // تا حرف پایانی واژه‌هایی مثل «پاپکو» به‌اشتباه بریده نشود.
  const segments = t.split(/\s*[،,؛;]\s*|\s+و\s+/).map((s) => s.trim()).filter(Boolean);
  const items = [];
  for (const seg of segments) {
    // قطعه‌های مربوط به تخفیف/مالیات جزو اقلام نیستند
    if (/تخفیف|درصد|مالیات/.test(seg)) continue;
    const item = parseLineItem(seg);
    if (item && item.name && item.name.length >= 2) items.push(item);
  }
  return { items, customer, discountPercent: discount };
}

/** استخراج نام مشتری بعد از «برای» */
function extractCustomerName(rawText) {
  const t = normalize(rawText);
  const m = t.match(/برای\s+([^\d،,؛]+?)\s+(?:فاکتور|بزن|سه|دو|یک|چهار|پنج|شش|هفت|هشت|نه|ده|\d)/);
  if (m) return m[1].trim();
  const m2 = t.match(/برای\s+([^\d،,؛]+)/);
  return m2 ? m2[1].trim() : null;
}

/** استخراج درصد تخفیف */
function extractPercent(rawText) {
  const t = normalize(rawText);
  const m = t.match(/تخفیف\s*(?:هم)?\s*((?:\d+)|یک|دو|سه|چهار|پنج|شش|هفت|هشت|نه|ده|بیست|سی|چهل|پنجاه)\s*درصد/);
  if (m) return wordsToNumber(m[1]);
  const m2 = t.match(/((?:\d+)|ده|بیست|سی|چهل|پنجاه)\s*درصد\s*تخفیف/);
  if (m2) return wordsToNumber(m2[1]);
  return null;
}

/**
 * استخراج فیلدهای یک کالای جدید از گفتار.
 * مثال: «دفتر پاپکو ۸۰ برگ، تعداد ۵۰ تا، قیمت خرید ۴۵ هزار تومان، قیمت فروش ۶۰ هزار تومان»
 */
function extractProduct(rawText) {
  const t = normalize(rawText);
  const result = {
    name: null, quantity: null, buyPrice: null, sellPrice: null,
    minStock: null, category: null, brand: null,
  };

  const buy = t.match(/(?:قیمت\s*خرید|خرید(?:م|ی)?|خریدم دونه ای|خریدی)\s*[:\-]?\s*([؀-ۿ\d\.\s]+?)(?:تومان|تومن|ریال|قیمت|فروش|تعداد|موجودی|$)/);
  if (buy) result.buyPrice = parseMoneyToRial(buy[1]);

  const sell = t.match(/(?:قیمت\s*فروش|بفروش(?:م|ی)?|فروش)\s*[:\-]?\s*([؀-ۿ\d\.\s]+?)(?:تومان|تومن|ریال|قیمت|خرید|تعداد|موجودی|$)/);
  if (sell) result.sellPrice = parseMoneyToRial(sell[1]);
  // حالت محاوره‌ای که قیمت پیش از فعل می‌آید: «می‌خوام ۶۰ تومن بفروشم»
  // فقط عبارت عددیِ بلافاصله پیش از «بفروش» را می‌گیریم تا خروجی تمیز بماند.
  if (result.sellPrice == null) {
    const sell2 = t.match(new RegExp(`((?:\\d+|${NUM_WORDS})(?:\\s*(?:هزار|و)\\s*(?:\\d+|${NUM_WORDS})?)*)\\s*(?:تومان|تومن|ریال)?\\s*بفروش`));
    if (sell2) result.sellPrice = parseMoneyToRial(sell2[1]);
  }

  const qty = t.match(new RegExp(`(?:تعداد|موجودی)\\s*[:\\-]?\\s*(${DIGIT_OR_NUM})\\s*(?:تا|عدد|دونه)?`));
  if (qty) result.quantity = wordsToNumber(qty[1]);
  const qty2 = t.match(new RegExp(`(${DIGIT_OR_NUM})\\s*(?:تا|عدد|دونه)(?:\\s|$)`));
  if (result.quantity == null && qty2) result.quantity = wordsToNumber(qty2[1]);

  const min = t.match(new RegExp(`(?:حداقل\\s*موجودی|حداقل)\\s*[:\\-]?\\s*(${DIGIT_OR_NUM})`));
  if (min) result.minStock = wordsToNumber(min[1]);

  // نام کالا: بخش ابتدایی جمله تا اولین کلیدواژه یا اولین ویرگول.
  // نکته: از \b استفاده نمی‌کنیم چون در جاوااسکریپت مرز واژه با حروف فارسی کار نمی‌کند.
  let name = t;
  // بریدن پیش از اولین کلیدواژه توصیفی
  const cutKeywords = ['تعداد', 'موجودی', 'قیمت خرید', 'قیمت فروش', 'قیمت', 'خرید', 'فروش', 'حداقل', 'تخفیف', 'مالیات'];
  let cutIndex = name.length;
  for (const kw of cutKeywords) {
    const idx = name.indexOf(kw);
    if (idx > 0 && idx < cutIndex) cutIndex = idx;
  }
  name = name.slice(0, cutIndex);
  // بریدن در اولین ویرگول (اگر جمله چندبخشی است)
  const comma = name.search(/[،,]/);
  if (comma > 1) name = name.slice(0, comma);
  // حذف افعال دستوری
  name = name
    .replace(/(اضافه کن|ثبت کن|به انبار|رو اضافه کن|را اضافه کن| رو | را |دارم|میخوام|می خوام|بنداز تو انبار)/g, ' ')
    .replace(/^(یه|یک)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
  // حذف «تعداد» ابتدایی که ممکن است به نام چسبیده باشد: «۵۰ تا دفتر پاپکو» → «دفتر پاپکو»
  name = name.replace(new RegExp(`^(?:${DIGIT_OR_NUM})\\s*(?:تا|عدد|دونه)\\s+`), '').trim();
  result.name = name.length >= 2 ? name : null;

  return result;
}

/**
 * استخراج اقلام خرید همراه با نام تأمین‌کننده.
 * مثال: «از شرکت پاپکو ۱۰۰ تا دفتر خریدم، قیمت خرید هرکدام ۴۵ هزار تومان.»
 */
function extractPurchase(rawText) {
  const t = normalize(rawText);
  let supplier = null;
  const sup = t.match(/از\s+(?:شرکت|فروشگاه|آقای|خانم)?\s*([^\d،,؛]+?)\s+(?:\d|صد|دویست|سیصد|یک|دو|سه|چهار|پنج|ده|بیست|سی|چهل|پنجاه|خرید)/);
  if (sup) supplier = sup[1].replace(/\b(شرکت|فروشگاه)\b/g,'').trim();

  const price = t.match(/(?:قیمت\s*خرید|هرکدام|هر کدام|دونه ای|هر عدد)\s*[:\-]?\s*([؀-ۿ\d\.\s]+?)(?:تومان|تومن|ریال|$)/);
  const unitPrice = price ? parseMoneyToRial(price[1]) : null;

  const qty = t.match(/((?:\d+)|صد|دویست|سیصد|پانصد|هزار|بیست|سی|چهل|پنجاه|شصت|هفتاد|هشتاد|نود)\s*(?:تا|عدد|دونه)/);
  const quantity = qty ? wordsToNumber(qty[1]) : null;

  // نام کالا بین تعداد و «خریدم»
  let name = null;
  const nm = t.match(/(?:تا|عدد|دونه)\s+([^\d،,؛]+?)\s+(?:خرید|قیمت|به قیمت|$)/);
  if (nm) name = nm[1].trim();

  return {
    supplier,
    items: name ? [{ name, quantity, unitPrice }] : [],
  };
}

module.exports = {
  parseLineItem,
  extractInvoiceItems,
  extractProduct,
  extractPurchase,
  extractCustomerName,
  extractPercent,
};

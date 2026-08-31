import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = (p: string) => bcrypt.hashSync(p, 10);
const img = (n: string) => `/images/products/${n}.svg`;

const CATEGORIES = [
  {
    name: "آیفون تصویری", slug: "video-intercom", icon: "📺", order: 1,
    children: [
      { name: "آیفون تصویری ۴.۳ اینچ", slug: "video-intercom-43" },
      { name: "آیفون تصویری ۷ اینچ", slug: "video-intercom-7" },
      { name: "آیفون تصویری ۱۰ اینچ", slug: "video-intercom-10" },
      { name: "آیفون تصویری حافظه‌دار", slug: "video-intercom-memory" },
      { name: "آیفون تصویری وای‌فای", slug: "video-intercom-wifi" },
    ],
  },
  {
    name: "آیفون صوتی", slug: "audio-intercom", icon: "☎️", order: 2,
    children: [
      { name: "گوشی آیفون صوتی", slug: "audio-handset" },
      { name: "آیفون صوتی مجتمع", slug: "audio-multi" },
    ],
  },
  {
    name: "پنل ورودی", slug: "entrance-panel", icon: "🔢", order: 3,
    children: [
      { name: "پنل کدینگ", slug: "panel-coding" },
      { name: "پنل تک‌واحدی", slug: "panel-single" },
      { name: "پنل چندواحدی", slug: "panel-multi" },
    ],
  },
  {
    name: "قفل و دربازکن", slug: "door-lock", icon: "🔐", order: 4,
    children: [
      { name: "قفل برقی", slug: "electric-lock" },
      { name: "قفل هوشمند", slug: "smart-lock" },
    ],
  },
  {
    name: "جک درب پارکینگ", slug: "gate-opener", icon: "🚧", order: 5,
    children: [
      { name: "جک بازویی", slug: "gate-arm" },
      { name: "جک زیرسطحی", slug: "gate-underground" },
      { name: "ریموت و رسیور", slug: "remote-receiver" },
    ],
  },
  {
    name: "دوربین مداربسته", slug: "cctv", icon: "📹", order: 6,
    children: [
      { name: "دوربین بولت", slug: "cctv-bullet" },
      { name: "دوربین دام", slug: "cctv-dome" },
      { name: "دستگاه ضبط (DVR/NVR)", slug: "cctv-recorder" },
    ],
  },
  {
    name: "لوازم جانبی", slug: "accessories", icon: "🔌", order: 7,
    children: [
      { name: "منبع تغذیه و ترانس", slug: "power-supply" },
      { name: "کابل و سیم", slug: "cable" },
      { name: "کاور و پایه", slug: "mounts" },
    ],
  },
];

const BRANDS = [
  "سیماران", "تابا", "کوماکس", "الکتروپیک", "سوزوکی",
  "فرداد", "ناواک", "رهنما", "تکنما", "دیجیتال",
];
const BRAND_SLUGS: Record<string, string> = {
  "سیماران": "simaran", "تابا": "taba", "کوماکس": "commax", "الکتروپیک": "electropeak",
  "سوزوکی": "suzuki", "فرداد": "fardad", "ناواک": "navak", "رهنما": "rahnama",
  "تکنما": "teknama", "دیجیتال": "digital",
};

type Seed = {
  title: string; cat: string; brand: string; price: number; discount?: number;
  stock: number; image: string; screenSize?: string; hasMemory?: boolean;
  panelType?: string; unitCount?: number; wiring?: string; short: string;
  specs: [string, string][]; sold?: number; rating?: number; ratingCount?: number;
  variants?: { name: string; value: string; colorHex?: string; priceDiff?: number; stock: number }[];
};

const PRODUCTS: Seed[] = [
  {
    title: "آیفون تصویری سیماران مدل HS-43TK لمسی ۴.۳ اینچ",
    cat: "video-intercom-43", brand: "سیماران", price: 3_850_000, discount: 12, stock: 24,
    image: "video-intercom-43inch-handset", screenSize: "۴.۳ اینچ", wiring: "۴ سیمه",
    unitCount: 1, sold: 312, rating: 4.6, ratingCount: 87,
    short: "مانیتور ۴.۳ اینچ رنگی با گوشی، مناسب واحدهای مسکونی تک‌واحدی و آپارتمان‌های کوچک",
    specs: [
      ["اندازه صفحه نمایش", "۴.۳ اینچ رنگی TFT"], ["نوع اتصال", "۴ سیمه"],
      ["حافظه داخلی", "ندارد"], ["تعداد زنگ", "۱۲ ملودی"],
      ["ولتاژ کاری", "۱۲ ولت DC"], ["ابعاد", "۱۹۰ × ۱۴۰ × ۲۵ میلی‌متر"],
      ["گارانتی", "۱۸ ماه گارانتی سیماران"],
    ],
    variants: [
      { name: "رنگ", value: "مشکی", colorHex: "#26292f", stock: 14 },
      { name: "رنگ", value: "سفید", colorHex: "#eceef2", priceDiff: 50_000, stock: 10 },
    ],
  },
  {
    title: "آیفون تصویری تابا مدل TVD-1043 هفت اینچ حافظه‌دار",
    cat: "video-intercom-memory", brand: "تابا", price: 6_450_000, discount: 15, stock: 18,
    image: "video-intercom-7inch-memory", screenSize: "۷ اینچ", hasMemory: true, wiring: "۴ سیمه",
    unitCount: 1, sold: 268, rating: 4.7, ratingCount: 112,
    short: "مانیتور ۷ اینچ با حافظه داخلی و قابلیت ذخیره تصاویر مراجعین در زمان عدم حضور",
    specs: [
      ["اندازه صفحه نمایش", "۷ اینچ رنگی"], ["حافظه", "داخلی + پشتیبانی از کارت SD تا ۳۲ گیگابایت"],
      ["نوع اتصال", "۴ سیمه"], ["عکس‌برداری خودکار", "دارد"],
      ["تعداد ملودی", "۱۶ ملودی"], ["حالت هندزفری", "دارد"],
      ["گارانتی", "۲۴ ماه گارانتی تابا"],
    ],
    variants: [
      { name: "رنگ", value: "مشکی", colorHex: "#23262e", stock: 12 },
      { name: "رنگ", value: "سفید", colorHex: "#e8eaef", priceDiff: 0, stock: 6 },
    ],
  },
  {
    title: "آیفون تصویری کوماکس مدل CDV-70N هفت اینچ",
    cat: "video-intercom-7", brand: "کوماکس", price: 8_900_000, discount: 8, stock: 11,
    image: "video-intercom-7inch-black", screenSize: "۷ اینچ", wiring: "۴ سیمه",
    unitCount: 1, sold: 154, rating: 4.8, ratingCount: 64,
    short: "مانیتور ۷ اینچ کره‌ای با کیفیت تصویر بالا و بدنه نازک، مناسب پروژه‌های لوکس",
    specs: [
      ["اندازه صفحه نمایش", "۷ اینچ TFT LCD"], ["ساخت", "کره جنوبی"],
      ["نوع اتصال", "۴ سیمه"], ["حافظه", "ندارد"],
      ["قابلیت اتصال", "تا ۴ مانیتور و ۲ پنل"], ["مصرف انرژی", "۱۲ وات"],
      ["گارانتی", "۱۸ ماه گارانتی رسمی"],
    ],
  },
  {
    title: "آیفون تصویری الکتروپیک مدل ۱۰ اینچ تاچ FHD",
    cat: "video-intercom-10", brand: "الکتروپیک", price: 12_800_000, discount: 10, stock: 7,
    image: "video-intercom-10inch-touch", screenSize: "۱۰ اینچ", hasMemory: true, wiring: "۴ سیمه",
    unitCount: 4, sold: 76, rating: 4.5, ratingCount: 31,
    short: "بزرگ‌ترین مانیتور خانگی با نمایشگر لمسی ۱۰ اینچ و رابط کاربری فارسی",
    specs: [
      ["اندازه صفحه نمایش", "۱۰.۱ اینچ لمسی"], ["رزولوشن", "۱۰۲۴ × ۶۰۰"],
      ["حافظه", "داخلی ۸ گیگابایت"], ["منوی فارسی", "دارد"],
      ["قاب عکس دیجیتال", "دارد"], ["نصب", "روکار دیواری"],
      ["گارانتی", "۲۴ ماه"],
    ],
  },
  {
    title: "آیفون تصویری وای‌فای هوشمند سیماران مدل SM-Wi7",
    cat: "video-intercom-wifi", brand: "سیماران", price: 11_200_000, discount: 18, stock: 9,
    image: "video-intercom-wifi-7inch", screenSize: "۷ اینچ", hasMemory: true, wiring: "۴ سیمه + Wi-Fi",
    unitCount: 1, sold: 189, rating: 4.9, ratingCount: 96,
    short: "پاسخ‌گویی به درب از هر نقطه دنیا با اپلیکیشن موبایل و اعلان لحظه‌ای",
    specs: [
      ["اندازه صفحه نمایش", "۷ اینچ"], ["اتصال به موبایل", "Wi-Fi + اپلیکیشن اختصاصی"],
      ["حافظه", "کارت SD تا ۱۲۸ گیگابایت"], ["اعلان لحظه‌ای", "دارد"],
      ["باز کردن درب از راه دور", "دارد"], ["پشتیبانی", "iOS و Android"],
      ["گارانتی", "۲۴ ماه"],
    ],
  },
  {
    title: "آیفون تصویری سوزوکی مدل ۵ اینچ اسلیم",
    cat: "video-intercom-7", brand: "سوزوکی", price: 4_290_000, discount: 0, stock: 21,
    image: "video-intercom-5inch-slim", screenSize: "۵ اینچ", wiring: "۴ سیمه",
    unitCount: 1, sold: 143, rating: 4.2, ratingCount: 45,
    short: "طراحی باریک و اقتصادی با کیفیت تصویر مناسب برای واحدهای مسکونی",
    specs: [
      ["اندازه صفحه نمایش", "۵ اینچ"], ["نوع اتصال", "۴ سیمه"],
      ["ضخامت", "۱۹ میلی‌متر"], ["حالت هندزفری", "دارد"], ["گارانتی", "۱۲ ماه"],
    ],
  },
  {
    title: "آیفون تصویری سفید ۷ اینچ فرداد مدل FD-700W",
    cat: "video-intercom-7", brand: "فرداد", price: 5_150_000, discount: 20, stock: 16,
    image: "video-intercom-7inch-white", screenSize: "۷ اینچ", wiring: "۴ سیمه",
    unitCount: 1, sold: 231, rating: 4.4, ratingCount: 73,
    short: "مانیتور ۷ اینچ سفید با قیمت اقتصادی و کیفیت ساخت مناسب",
    specs: [
      ["اندازه صفحه نمایش", "۷ اینچ"], ["رنگ بدنه", "سفید"],
      ["نوع اتصال", "۴ سیمه"], ["تعداد ملودی", "۱۲ ملودی"], ["گارانتی", "۱۸ ماه"],
    ],
  },
  {
    title: "آیفون تصویری ۴.۳ اینچ سفید ناواک مدل NV-430",
    cat: "video-intercom-43", brand: "ناواک", price: 2_980_000, discount: 14, stock: 28,
    image: "video-intercom-43inch-white-handset", screenSize: "۴.۳ اینچ", wiring: "۴ سیمه",
    unitCount: 1, sold: 402, rating: 4.1, ratingCount: 128,
    short: "پرفروش‌ترین مدل اقتصادی بازار با گوشی و کیفیت تصویر قابل قبول",
    specs: [
      ["اندازه صفحه نمایش", "۴.۳ اینچ"], ["نوع", "گوشی‌دار"],
      ["نوع اتصال", "۴ سیمه"], ["گارانتی", "۱۲ ماه"],
    ],
  },
  // پنل‌ها
  {
    title: "پنل کدینگ سیماران مدل ۱۰۰ واحدی ضدآب",
    cat: "panel-coding", brand: "سیماران", price: 7_600_000, discount: 9, stock: 13,
    image: "panel-coding-black", panelType: "کدینگ", unitCount: 100, wiring: "۴ سیمه",
    sold: 97, rating: 4.7, ratingCount: 38,
    short: "پنل کدینگ با کیبورد فلزی و قابلیت پشتیبانی تا ۱۰۰ واحد",
    specs: [
      ["نوع پنل", "کدینگ"], ["حداکثر واحد", "۱۰۰ واحد"],
      ["جنس بدنه", "آلومینیوم رنگ‌شده"], ["دید در شب", "LED مادون قرمز"],
      ["استاندارد ضدآب", "IP54"], ["زاویه دید دوربین", "۱۰۲ درجه"], ["گارانتی", "۱۸ ماه"],
    ],
  },
  {
    title: "پنل کدینگ استیل تابا مدل TVP-2070",
    cat: "panel-coding", brand: "تابا", price: 9_450_000, discount: 12, stock: 8,
    image: "panel-coding-steel", panelType: "کدینگ", unitCount: 200, wiring: "۴ سیمه",
    sold: 64, rating: 4.8, ratingCount: 27,
    short: "بدنه استیل ضدزنگ با دوام بالا، مناسب مجتمع‌های بزرگ تا ۲۰۰ واحد",
    specs: [
      ["نوع پنل", "کدینگ"], ["حداکثر واحد", "۲۰۰ واحد"],
      ["جنس بدنه", "استیل ۳۰۴"], ["نمایشگر", "OLED"],
      ["کارت RFID", "دارد"], ["گارانتی", "۲۴ ماه"],
    ],
  },
  {
    title: "پنل تک‌واحدی کوماکس مدل DRC-4CPN2",
    cat: "panel-single", brand: "کوماکس", price: 3_250_000, discount: 0, stock: 22,
    image: "panel-single-unit", panelType: "تک‌واحدی", unitCount: 1, wiring: "۴ سیمه",
    sold: 176, rating: 4.6, ratingCount: 52,
    short: "پنل تک‌واحدی کره‌ای با کیفیت تصویر بالا و دوام در شرایط جوی",
    specs: [
      ["نوع پنل", "تک‌واحدی"], ["ساخت", "کره جنوبی"],
      ["دوربین", "CCD رنگی"], ["دید در شب", "دارد"], ["گارانتی", "۱۸ ماه"],
    ],
  },
  {
    title: "پنل ۱۲ واحدی الکتروپیک مدل EP-1200",
    cat: "panel-multi", brand: "الکتروپیک", price: 5_800_000, discount: 7, stock: 15,
    image: "panel-multi-unit", panelType: "چندواحدی", unitCount: 12, wiring: "۴ سیمه",
    sold: 88, rating: 4.3, ratingCount: 24,
    short: "پنل دکمه‌ای ۱۲ واحدی با نام‌گذاری قابل تنظیم برای هر واحد",
    specs: [
      ["نوع پنل", "دکمه‌ای چندواحدی"], ["تعداد واحد", "۱۲ واحد"],
      ["جنس بدنه", "آلومینیوم"], ["نصب", "توکار / روکار"], ["گارانتی", "۱۸ ماه"],
    ],
  },
  // قفل و جک
  {
    title: "قفل برقی درب سیماران مدل استاندارد بدون شب‌بند",
    cat: "electric-lock", brand: "سیماران", price: 890_000, discount: 15, stock: 47,
    image: "electric-lock-standard", sold: 623, rating: 4.5, ratingCount: 187,
    short: "قفل برقی استاندارد مناسب درب‌های چوبی و فلزی، سازگار با تمام آیفون‌ها",
    specs: [
      ["ولتاژ کاری", "۱۲ ولت AC/DC"], ["جنس بدنه", "فلزی آبکاری‌شده"],
      ["نوع", "بدون شب‌بند"], ["مناسب برای", "درب چوبی و فلزی"], ["گارانتی", "۱۲ ماه"],
    ],
  },
  {
    title: "قفل برقی سنگین تابا مدل TL-500 با شب‌بند",
    cat: "electric-lock", brand: "تابا", price: 1_450_000, discount: 10, stock: 31,
    image: "electric-lock-heavy", sold: 288, rating: 4.7, ratingCount: 94,
    short: "قفل برقی مقاوم با شب‌بند، مناسب درب‌های سنگین ورودی مجتمع",
    specs: [
      ["ولتاژ کاری", "۱۲ ولت"], ["شب‌بند", "دارد"],
      ["مقاومت", "بیش از ۲۰۰ هزار بار عملکرد"], ["گارانتی", "۱۸ ماه"],
    ],
  },
  {
    title: "جک بازویی درب پارکینگ رهنما مدل RN-400 دوقلو",
    cat: "gate-arm", brand: "رهنما", price: 18_500_000, discount: 11, stock: 6,
    image: "gate-motor-arm", sold: 42, rating: 4.6, ratingCount: 19,
    short: "ست کامل جک بازویی دوقلو همراه با کنترل، رسیور و چشمی ایمنی",
    specs: [
      ["نوع", "بازویی (Arm)"], ["حداکثر وزن درب", "۴۰۰ کیلوگرم هر لنگه"],
      ["سرعت باز شدن", "۱۵ ثانیه"], ["محتویات بسته", "۲ موتور، برد کنترل، ۲ ریموت، چشمی"],
      ["ولتاژ", "۲۲۰ ولت"], ["گارانتی", "۲۴ ماه"],
    ],
  },
  {
    title: "جک زیرسطحی تکنما مدل TK-U600 هیدرولیک",
    cat: "gate-underground", brand: "تکنما", price: 31_900_000, discount: 6, stock: 3,
    image: "gate-motor-underground", sold: 17, rating: 4.9, ratingCount: 8,
    short: "جک زیرسطحی هیدرولیک با بیشترین دوام، بدون اشغال فضای دید",
    specs: [
      ["نوع", "زیرسطحی هیدرولیک"], ["حداکثر وزن درب", "۶۰۰ کیلوگرم"],
      ["ضدآب", "IP67"], ["کارکرد مداوم", "۸۰٪"], ["گارانتی", "۳۶ ماه"],
    ],
  },
  // دوربین
  {
    title: "دوربین مداربسته بولت ۲ مگاپیکسل دیجیتال مدل DG-B200",
    cat: "cctv-bullet", brand: "دیجیتال", price: 2_350_000, discount: 16, stock: 34,
    image: "cctv-bullet-2mp", sold: 194, rating: 4.3, ratingCount: 61,
    short: "دوربین بولت ضدآب با دید در شب تا ۳۰ متر، مناسب فضای باز",
    specs: [
      ["رزولوشن", "۲ مگاپیکسل (1080p)"], ["دید در شب", "تا ۳۰ متر"],
      ["استاندارد ضدآب", "IP66"], ["لنز", "۳.۶ میلی‌متر"], ["گارانتی", "۱۸ ماه"],
    ],
  },
  {
    title: "دوربین مداربسته دام ۵ مگاپیکسل ناواک مدل NV-D500",
    cat: "cctv-dome", brand: "ناواک", price: 3_150_000, discount: 12, stock: 26,
    image: "cctv-dome-5mp", sold: 138, rating: 4.5, ratingCount: 47,
    short: "دوربین دام سقفی با کیفیت ۵ مگاپیکسل، مناسب فضای داخلی و راه‌پله",
    specs: [
      ["رزولوشن", "۵ مگاپیکسل"], ["نوع", "دام سقفی"],
      ["دید در شب", "تا ۲۰ متر"], ["زاویه دید", "۹۰ درجه"], ["گارانتی", "۱۸ ماه"],
    ],
  },
  // صوتی
  {
    title: "گوشی آیفون صوتی سیماران مدل ۷۷۶ سفید",
    cat: "audio-handset", brand: "سیماران", price: 720_000, discount: 8, stock: 58,
    image: "audio-intercom-white", wiring: "۲ سیمه", unitCount: 1,
    sold: 715, rating: 4.4, ratingCount: 203,
    short: "گوشی آیفون صوتی پرفروش با کیفیت صدای شفاف و دکمه بازکن درب",
    specs: [
      ["نوع", "صوتی"], ["اتصال", "۲ سیمه"], ["رنگ", "سفید"],
      ["دکمه بازکن", "دارد"], ["گارانتی", "۱۲ ماه"],
    ],
  },
  {
    title: "گوشی آیفون صوتی الکتروپیک مدل کرم مجتمع",
    cat: "audio-multi", brand: "الکتروپیک", price: 650_000, discount: 0, stock: 64,
    image: "audio-intercom-cream", wiring: "۲ سیمه", unitCount: 1,
    sold: 486, rating: 4.2, ratingCount: 154,
    short: "مناسب مجتمع‌های مسکونی با قابلیت اتصال به پنل کدینگ",
    specs: [
      ["نوع", "صوتی مجتمع"], ["اتصال", "۲ سیمه"],
      ["رنگ", "کرم"], ["گارانتی", "۱۲ ماه"],
    ],
  },
  // جانبی
  {
    title: "منبع تغذیه ۱۲ ولت ۵ آمپر سوئیچینگ",
    cat: "power-supply", brand: "دیجیتال", price: 980_000, discount: 10, stock: 41,
    image: "power-supply-12v", sold: 267, rating: 4.4, ratingCount: 78,
    short: "ترانس سوئیچینگ با محافظت در برابر نوسان برق، مناسب دوربین و آیفون",
    specs: [
      ["ولتاژ خروجی", "۱۲ ولت DC"], ["جریان", "۵ آمپر"],
      ["محافظ اضافه بار", "دارد"], ["فن خنک‌کننده", "دارد"], ["گارانتی", "۱۲ ماه"],
    ],
  },
  {
    title: "منبع تغذیه مرکزی مجتمع ۲۰ آمپر",
    cat: "power-supply", brand: "تابا", price: 3_450_000, discount: 5, stock: 12,
    image: "power-supply-central", sold: 54, rating: 4.6, ratingCount: 21,
    short: "منبع تغذیه صنعتی برای تغذیه هم‌زمان چندین واحد در مجتمع‌های بزرگ",
    specs: [
      ["ولتاژ خروجی", "۱۲ ولت"], ["جریان", "۲۰ آمپر"],
      ["نصب", "ریلی / دیواری"], ["گارانتی", "۱۸ ماه"],
    ],
  },
  {
    title: "کابل آیفون تصویری ۶ رشته کلاف ۱۰۰ متری مسی",
    cat: "cable", brand: "دیجیتال", price: 2_150_000, discount: 14, stock: 37,
    image: "cable-6core-100m", sold: 341, rating: 4.5, ratingCount: 112,
    short: "کابل ۶ رشته تمام مس با روکش PVC، استاندارد سیم‌کشی آیفون تصویری",
    specs: [
      ["تعداد رشته", "۶ رشته"], ["جنس هادی", "مس خالص"],
      ["طول کلاف", "۱۰۰ متر"], ["سطح مقطع", "۰.۵ میلی‌متر مربع"], ["گارانتی", "—"],
    ],
  },
  {
    title: "کابل آیفون تصویری ۸ رشته کلاف ۱۰۰ متری",
    cat: "cable", brand: "دیجیتال", price: 2_780_000, discount: 10, stock: 29,
    image: "cable-8core-100m", sold: 218, rating: 4.4, ratingCount: 76,
    short: "کابل ۸ رشته مناسب پروژه‌های چندواحدی و پنل‌های کدینگ",
    specs: [
      ["تعداد رشته", "۸ رشته"], ["جنس هادی", "مس خالص"],
      ["طول کلاف", "۱۰۰ متر"], ["روکش", "PVC نسوز"],
    ],
  },
];

async function main() {
  console.log("پاکسازی داده‌های قبلی…");
  await prisma.$transaction([
    prisma.answer.deleteMany(), prisma.question.deleteMany(), prisma.review.deleteMany(),
    prisma.wishlist.deleteMany(), prisma.orderItem.deleteMany(), prisma.order.deleteMany(),
    prisma.productVariant.deleteMany(), prisma.product.deleteMany(), prisma.address.deleteMany(),
    prisma.seller.deleteMany(), prisma.ticket.deleteMany(), prisma.user.deleteMany(),
    prisma.category.deleteMany(), prisma.brand.deleteMany(), prisma.coupon.deleteMany(),
    prisma.banner.deleteMany(),
  ]);

  console.log("ساخت کاربران…");
  const admin = await prisma.user.create({
    data: {
      name: "مدیر سایت", email: "admin@shop.ir", phone: "09120000001",
      passwordHash: hash("admin1234"), role: "ADMIN",
    },
  });
  const sellerUser = await prisma.user.create({
    data: {
      name: "رضا محمدی", email: "seller@shop.ir", phone: "09120000002",
      passwordHash: hash("seller1234"), role: "SELLER",
    },
  });
  const sellerUser2 = await prisma.user.create({
    data: {
      name: "مهدی کریمی", email: "seller2@shop.ir", phone: "09120000004",
      passwordHash: hash("seller1234"), role: "SELLER",
    },
  });
  const customer = await prisma.user.create({
    data: {
      name: "سارا احمدی", email: "user@shop.ir", phone: "09120000003",
      passwordHash: hash("user1234"), role: "CUSTOMER",
    },
  });

  const seller = await prisma.seller.create({
    data: {
      userId: sellerUser.id, shopName: "فروشگاه مرکزی لاله‌زار", slug: "lalezar-center",
      description: "عرضه‌کننده مستقیم محصولات سیماران، تابا و کوماکس با بیش از ۱۵ سال سابقه",
      status: "APPROVED", rating: 4.7, province: "تهران", city: "تهران",
      address: "لاله‌زار جنوبی، پاساژ برق", nationalId: "0012345678",
    },
  });
  const seller2 = await prisma.seller.create({
    data: {
      userId: sellerUser2.id, shopName: "الکترو کریمی", slug: "electro-karimi",
      description: "تخصصی جک پارکینگ، دوربین مداربسته و تجهیزات کنترل تردد",
      status: "APPROVED", rating: 4.5, province: "تهران", city: "کرج",
      address: "کرج، بلوار طالقانی", nationalId: "0098765432",
    },
  });

  console.log("ساخت دسته‌بندی‌ها و برندها…");
  const catMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const parent = await prisma.category.create({
      data: { name: c.name, slug: c.slug, icon: c.icon, order: c.order },
    });
    catMap.set(c.slug, parent.id);
    let i = 0;
    for (const ch of c.children) {
      const child = await prisma.category.create({
        data: { name: ch.name, slug: ch.slug, parentId: parent.id, order: i++ },
      });
      catMap.set(ch.slug, child.id);
    }
  }

  const brandMap = new Map<string, string>();
  for (const b of BRANDS) {
    const brand = await prisma.brand.create({ data: { name: b, slug: BRAND_SLUGS[b] } });
    brandMap.set(b, brand.id);
  }

  console.log("ساخت محصولات…");
  let idx = 0;
  for (const p of PRODUCTS) {
    const sellerId = idx % 3 === 2 ? seller2.id : seller.id;
    const created = await prisma.product.create({
      data: {
        title: p.title,
        slug: `${p.image}-${idx}`,
        description: `${p.short}\n\n${p.title} یکی از محصولات پرفروش و باکیفیت موجود در فروشگاه است. این محصول با گارانتی معتبر شرکتی عرضه می‌شود و امکان نصب توسط تکنسین‌های مجموعه در تهران و کرج وجود دارد.\n\nپیش از خرید، از سازگاری این دستگاه با سیستم فعلی ساختمان خود مطمئن شوید. کارشناسان ما به‌صورت رایگان شما را راهنمایی می‌کنند.`,
        shortDesc: p.short,
        price: p.price,
        discountPercent: p.discount ?? 0,
        stock: p.stock,
        images: JSON.stringify([img(p.image)]),
        specs: JSON.stringify(p.specs.map(([key, value]) => ({ key, value }))),
        tags: `${p.brand} ${p.title}`,
        status: "APPROVED",
        rating: p.rating ?? 0,
        ratingCount: p.ratingCount ?? 0,
        sold: p.sold ?? 0,
        views: (p.sold ?? 0) * 7 + 120,
        warranty: p.specs.find(([k]) => k === "گارانتی")?.[1] ?? "۱۲ ماه گارانتی",
        warrantyMonths: 18,
        screenSize: p.screenSize ?? null,
        hasMemory: p.hasMemory ?? false,
        panelType: p.panelType ?? null,
        unitCount: p.unitCount ?? null,
        wiring: p.wiring ?? null,
        categoryId: catMap.get(p.cat)!,
        brandId: brandMap.get(p.brand)!,
        sellerId,
        variants: p.variants ? { create: p.variants.map((v) => ({ ...v, priceDiff: v.priceDiff ?? 0 })) } : undefined,
      },
    });

    if ((p.ratingCount ?? 0) > 0) {
      await prisma.review.create({
        data: {
          productId: created.id, userId: customer.id, rating: Math.round(p.rating ?? 4),
          title: "کیفیت مناسب و ارسال سریع",
          comment: "محصول دقیقاً مطابق توضیحات سایت بود. بسته‌بندی مناسب و ارسال سریع داشت. نصبش هم ساده بود و راهنمای فارسی داخل جعبه کمک‌کننده بود.",
          pros: JSON.stringify(["کیفیت ساخت خوب", "قیمت مناسب", "ارسال سریع"]),
          cons: JSON.stringify(["دفترچه راهنما می‌توانست کامل‌تر باشد"]),
        },
      });
      await prisma.question.create({
        data: {
          productId: created.id, userId: customer.id,
          body: "این مدل با پنل کدینگ قدیمی ساختمان ما سازگار هست؟",
          answers: {
            create: {
              userId: sellerUser.id,
              body: "بله، در صورتی که سیستم فعلی ۴ سیمه باشد بدون نیاز به تغییر سیم‌کشی قابل نصب است. برای اطمینان می‌توانید عکس پنل فعلی را برای کارشناسان ما ارسال کنید.",
            },
          },
        },
      });
    }
    idx++;
  }

  console.log("ساخت آدرس، کوپن و بنر…");
  await prisma.address.create({
    data: {
      userId: customer.id, title: "خانه", receiverName: "سارا احمدی", phone: "09120000003",
      province: "تهران", city: "تهران", postalCode: "1234567890",
      line: "خیابان ولیعصر، بالاتر از میدان ونک، کوچه نگین، پلاک ۱۲، واحد ۴", isDefault: true,
    },
  });

  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", percent: 10, maxAmount: 500_000, minCart: 1_000_000, usageLimit: 0 },
      { code: "NOROOZ20", percent: 20, maxAmount: 1_500_000, minCart: 5_000_000, usageLimit: 100 },
      { code: "FIRST5", percent: 5, maxAmount: 200_000, minCart: 0, usageLimit: 0 },
    ],
  });

  await prisma.banner.createMany({
    data: [
      { title: "جدیدترین آیفون‌های تصویری هوشمند", image: "/images/products/video-intercom-wifi-7inch.svg", link: "/category/video-intercom-wifi", position: "HERO", order: 1 },
      { title: "جک درب پارکینگ با نصب رایگان", image: "/images/products/gate-motor-arm.svg", link: "/category/gate-opener", position: "HERO", order: 2 },
      { title: "پنل کدینگ برای مجتمع‌های بزرگ", image: "/images/products/panel-coding-steel.svg", link: "/category/entrance-panel", position: "HERO", order: 3 },
    ],
  });

  console.log(`
✅ داده‌های اولیه ساخته شد.

حساب‌های آماده برای ورود:
  مدیر     → admin@shop.ir   / admin1234
  فروشنده  → seller@shop.ir  / seller1234
  فروشنده۲ → seller2@shop.ir / seller1234
  خریدار   → user@shop.ir    / user1234

کدهای تخفیف: WELCOME10 و NOROOZ20 و FIRST5
`);
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

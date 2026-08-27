// ثابت‌ها و جدول‌های مرجعِ آزمایشگاه ماشین‌های ساده

/** شتاب گرانش؛ برای محاسبات کلاسی پایهٔ پنجم ۱۰ در نظر گرفته می‌شود */
export const G = 10;

/** توان کشش افراد مختلف (نیوتون) — برای سنجش «شدنی بودن» آزمایش */
export const PULLERS = {
  CHILD: { id: 'CHILD', name: 'یک دانش‌آموز', icon: '🧒', limitN: 120 },
  ADULT: { id: 'ADULT', name: 'یک بزرگ‌سال', icon: '🧑', limitN: 250 },
  TEAM: { id: 'TEAM', name: 'دو نفر با هم', icon: '👥', limitN: 420 }
};

export const DEFAULT_PULLER = 'ADULT';

/** سطح‌های مسیر و ضریب اصطکاک آن‌ها */
export const SURFACES = {
  ROUGH_STONE: {
    id: 'ROUGH_STONE',
    name: 'سنگ ناهموار',
    fullName: 'سنگ صخره‌ای ناهموار',
    mu: 0.65,
    icon: '🪨',
    color: '#8d8378',
    desc: 'سطح طبیعی کوهستان با پستی و بلندی زیاد؛ کشیدن بار روی آن بسیار سخت است.'
  },
  WOOD_PLANKS: {
    id: 'WOOD_PLANKS',
    name: 'تختهٔ چوبی',
    fullName: 'تخته‌چوب تراشیده',
    mu: 0.35,
    icon: '🪵',
    color: '#b98a4e',
    desc: 'تخته‌های چوبی صاف که اصطکاک را تا حدی کم می‌کنند.'
  },
  SMOOTH_TRACK: {
    id: 'SMOOTH_TRACK',
    name: 'مسیر صیقلی',
    fullName: 'مسیر چوبی صیقلی و روغن‌خورده',
    mu: 0.16,
    icon: '✨',
    color: '#d6c3a1',
    desc: 'صیقل دادن و روغن‌کاری، برجستگی‌های ریز سطح را از بین می‌برد.'
  },
  ICE: {
    id: 'ICE',
    name: 'یخ کوهستان',
    fullName: 'سطح یخ‌زدهٔ کوهستان',
    mu: 0.08,
    icon: '🧊',
    color: '#cfe8f3',
    desc: 'روی یخ، اصطکاک بسیار کم است؛ اما مهار کردن بار هم سخت می‌شود!'
  }
};

/** غلتک و چرخ: جایگزین ضریب اصطکاک لغزشی می‌شود */
export const ROLLERS = {
  id: 'ROLLERS',
  name: 'غلتک و چرخ',
  fullName: 'غلتک‌ها و چرخ‌های چوبی',
  mu: 0.06,
  icon: '⚙️',
  color: '#a97142',
  desc: 'غلتک، اصطکاک «مالشی/لغزشی» را به اصطکاک «غلتشی» تبدیل می‌کند.'
};

/**
 * سامانه‌های قرقره.
 * strands = تعداد رشته‌هایی که وزن بار را نگه می‌دارند (مزیت مکانیکی آرمانی)
 * sheaves = تعداد چرخ‌های قرقره (هر چرخ کمی اتلاف اصطکاکی دارد)
 */
export const PULLEYS = {
  NONE: {
    id: 'NONE',
    name: 'بدون قرقره',
    shortName: 'بدون قرقره',
    icon: '✋',
    strands: 1,
    sheaves: 0,
    movable: 0,
    changesDirection: false,
    desc: 'بار را مستقیم با دست بالا می‌کشیم؛ باید رو به بالا زور بزنیم و تمام وزن روی دست ماست.'
  },
  FIXED: {
    id: 'FIXED',
    name: 'قرقرهٔ ثابت',
    shortName: 'ثابت',
    icon: '🔘',
    strands: 1,
    sheaves: 1,
    movable: 0,
    changesDirection: true,
    desc: 'به سقف یا تیر محکم بسته شده است. فقط جهت نیرو را عوض می‌کند تا بتوانیم به سمت پایین بکشیم؛ مقدار نیرو کم نمی‌شود.'
  },
  MOVABLE: {
    id: 'MOVABLE',
    name: 'قرقرهٔ متحرک',
    shortName: 'متحرک',
    icon: '🔄',
    strands: 2,
    sheaves: 1,
    movable: 1,
    changesDirection: false,
    desc: 'همراه بار بالا می‌رود. وزن بار بین ۲ رشته طناب تقسیم می‌شود؛ نیرو نصف می‌شود ولی باید ۲ برابر طناب بکشیم.'
  },
  COMPOUND_2: {
    id: 'COMPOUND_2',
    name: 'قرقرهٔ مرکب (۱ ثابت + ۱ متحرک)',
    shortName: 'مرکب ۲',
    icon: '⛓️',
    strands: 2,
    sheaves: 2,
    movable: 1,
    changesDirection: true,
    desc: 'یک قرقرهٔ متحرک برای نصف کردن نیرو، به‌علاوهٔ یک قرقرهٔ ثابت برای اینکه بتوانیم رو به پایین بکشیم.',
  },
  COMPOUND_3: {
    id: 'COMPOUND_3',
    name: 'سامانهٔ ۳ رشته‌ای',
    shortName: 'مرکب ۳',
    icon: '⚙️⛓️',
    strands: 3,
    sheaves: 2,
    movable: 1,
    changesDirection: false,
    desc: 'سر طناب به بالا بسته شده و ۳ رشته وزن را نگه می‌دارند؛ نیرو یک‌سوم و طول طناب ۳ برابر می‌شود.'
  },
  COMPOUND_4: {
    id: 'COMPOUND_4',
    name: 'قرقرهٔ مرکب ۴ رشته‌ای',
    shortName: 'مرکب ۴',
    icon: '⚙️⚙️',
    strands: 4,
    sheaves: 4,
    movable: 2,
    changesDirection: true,
    desc: 'دو قرقرهٔ ثابت و دو قرقرهٔ متحرک؛ نیرو به یک‌چهارم می‌رسد اما باید ۴ برابر طناب بکشیم.'
  }
};

/** بازدهٔ هر چرخ قرقره (اتلاف اصطکاکی محور و طناب) */
export const SHEAVE_EFFICIENCY = 0.96;

/** بازدهٔ تکیه‌گاه اهرم */
export const LEVER_EFFICIENCY = 0.97;

/** بازدهٔ محور چرخ و محور */
export const WHEEL_AXLE_EFFICIENCY = 0.9;

/** بازدهٔ گوه (بسیار پایین؛ بیشتر نیرو صرف اصطکاک می‌شود) */
export const WEDGE_EFFICIENCY = 0.6;

/** بازدهٔ پیچ (پایین است، ولی همین اصطکاک باعث می‌شود پیچ خودبه‌خود باز نشود) */
export const SCREW_EFFICIENCY = 0.35;

/** بازدهٔ جفت چرخ‌دنده */
export const GEAR_EFFICIENCY = 0.95;

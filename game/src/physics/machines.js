// موتور فیزیک ماشین‌های ساده — قطعی، قابل تست و مستقل از رابط کاربری
//
// همهٔ توابع یک «نتیجهٔ استاندارد» برمی‌گردانند تا رابط کاربری و رندرر
// بتوانند بدون دانستن نوع ماشین با آن کار کنند:
//
//   loadN            وزن (یا نیروی مقاومِ) باری که باید بر آن غلبه کنیم
//   effortIdealN     نیروی لازم در حالت آرمانی (بدون اصطکاک)
//   frictionN        سهم اصطکاک از نیروی لازم
//   effortN          نیروی واقعی لازم = آرمانی + اصطکاک
//   maIdeal          مزیت مکانیکی آرمانی (از روی هندسه)
//   maActual         مزیت مکانیکی واقعی = loadN / effortN
//   efficiency       بازده = maActual / maIdeal  (بین ۰ و ۱)
//   loadDistanceM    مسافتی که بار جابه‌جا می‌شود
//   effortDistanceM  مسافتی که دست ما باید طی کند
//   workOutJ         کار مفید = loadN × loadDistanceM
//   workInJ          کار انجام‌شده توسط ما = effortN × effortDistanceM
//   geom             داده‌های هندسی مورد نیاز رندرر
//   insightFa        جمله‌ای که نتیجهٔ علمی آزمایش را توضیح می‌دهد

import {
  G, SURFACES, ROLLERS, PULLEYS, PULLERS, DEFAULT_PULLER,
  SHEAVE_EFFICIENCY, LEVER_EFFICIENCY, WHEEL_AXLE_EFFICIENCY,
  WEDGE_EFFICIENCY, SCREW_EFFICIENCY, GEAR_EFFICIENCY
} from './constants.js';
import { round, clamp } from '../core/format.js';

export { G, SURFACES, ROLLERS, PULLEYS, PULLERS };

/** فهرست ماشین‌های ساده‌ای که آزمایشگاه پشتیبانی می‌کند */
export const MACHINE_IDS = [
  'FRICTION', 'INCLINED_PLANE', 'LEVER', 'PULLEY',
  'WHEEL_AXLE', 'WEDGE', 'SCREW', 'GEARS'
];

export const MACHINES = {
  FRICTION:       { id: 'FRICTION',       name: 'اصطکاک، چرخ و غلتک', short: 'چرخ و غلتک', icon: '⚙️',  color: '#f59e0b' },
  INCLINED_PLANE: { id: 'INCLINED_PLANE', name: 'سطح شیب‌دار',        short: 'سطح شیب‌دار', icon: '📐', color: '#0ea5e9' },
  LEVER:          { id: 'LEVER',          name: 'اهرم',               short: 'اهرم',        icon: '⚖️',  color: '#8b5cf6' },
  PULLEY:         { id: 'PULLEY',         name: 'قرقره',              short: 'قرقره',       icon: '🔄',  color: '#10b981' },
  WHEEL_AXLE:     { id: 'WHEEL_AXLE',     name: 'چرخ و محور',         short: 'چرخ و محور',  icon: '🎡',  color: '#ec4899' },
  WEDGE:          { id: 'WEDGE',          name: 'گُوِه',               short: 'گوه',         icon: '🔺',  color: '#ef4444' },
  SCREW:          { id: 'SCREW',          name: 'پیچ',                short: 'پیچ',         icon: '🔩',  color: '#64748b' },
  GEARS:          { id: 'GEARS',          name: 'چرخ‌دنده‌ها',         short: 'چرخ‌دنده',    icon: '⚙️',  color: '#14b8a6' }
};

// ————————————————————————————————————————————————————————
// کمکی‌ها
// ————————————————————————————————————————————————————————

function finish(result, pullerId = DEFAULT_PULLER) {
  const puller = PULLERS[pullerId] || PULLERS[DEFAULT_PULLER];
  const effortN = result.effortN;
  const out = {
    ...result,
    puller,
    humanLimitN: puller.limitN,
    feasible: effortN <= puller.limitN,
    // کار مفید و کار ورودی (پایستگی انرژی: کار ورودی همیشه ≥ کار مفید)
    workOutJ: result.workOutJ ?? (result.loadN * result.loadDistanceM),
    workInJ: result.workInJ ?? (effortN * result.effortDistanceM)
  };
  out.energyLostJ = Math.max(0, out.workInJ - out.workOutJ);
  return roundResult(out);
}

function roundResult(r) {
  const numericKeys = [
    'loadN', 'effortIdealN', 'frictionN', 'effortN', 'maIdeal', 'maActual',
    'efficiency', 'loadDistanceM', 'effortDistanceM', 'workOutJ', 'workInJ', 'energyLostJ'
  ];
  for (const k of numericKeys) {
    if (typeof r[k] === 'number') r[k] = round(r[k]);
  }
  return r;
}

function surfaceOf(surfaceId, useRollers) {
  if (useRollers) return ROLLERS;
  return SURFACES[surfaceId] || SURFACES.ROUGH_STONE;
}

// ————————————————————————————————————————————————————————
// ۱) اصطکاک، چرخ و غلتک — کشیدن بار روی سطح افقی
// ————————————————————————————————————————————————————————

export function friction({
  massKg = 50,
  surfaceId = 'ROUGH_STONE',
  useRollers = false,
  distanceM = 6,
  pullerId = DEFAULT_PULLER
} = {}) {
  const surface = surfaceOf(surfaceId, useRollers);
  const loadN = massKg * G;
  // روی سطح افقی، تمام نیروی لازم صرف غلبه بر اصطکاک می‌شود
  const effortN = loadN * surface.mu;

  const baseline = loadN * SURFACES.ROUGH_STONE.mu; // مقایسه با سنگ ناهموار
  const savedPercent = clamp(Math.round(((baseline - effortN) / baseline) * 100), 0, 100);

  return finish({
    machine: 'FRICTION',
    massKg,
    surface,
    useRollers,
    loadN,
    effortIdealN: 0,          // در حالت آرمانیِ بدون اصطکاک، نیرویی لازم نیست
    frictionN: effortN,
    effortN,
    maIdeal: null,            // چرخ و غلتک «مزیت مکانیکی» ندارند؛ اصطکاک را کم می‌کنند
    maActual: null,
    efficiency: null,
    loadDistanceM: distanceM,
    effortDistanceM: distanceM,
    workOutJ: 0,              // بار بالا نمی‌رود؛ همهٔ کار صرف اصطکاک می‌شود
    workInJ: effortN * distanceM,
    forceRatioPercent: Math.round((effortN / loadN) * 100),
    savedPercent,
    geom: { distanceM, mu: surface.mu },
    insightFa: useRollers
      ? 'غلتک‌ها اصطکاکِ مالشی را به اصطکاکِ غلتشی تبدیل کردند؛ نیروی لازم به کمترین مقدار رسید.'
      : surface.mu >= 0.5
        ? 'سطحِ زبر، اصطکاکِ زیادی می‌سازد؛ نیروی لازم نزدیک به وزن بار است.'
        : 'صاف‌تر شدن سطح، اصطکاک را کم کرد؛ اما غلتک از این هم بهتر عمل می‌کند.'
  }, pullerId);
}

// ————————————————————————————————————————————————————————
// ۲) سطح شیب‌دار
// ————————————————————————————————————————————————————————

export function inclinedPlane({
  massKg = 50,
  heightM = 2,
  lengthM = 4,
  surfaceId = 'WOOD_PLANKS',
  useRollers = false,
  pullerId = DEFAULT_PULLER
} = {}) {
  const surface = surfaceOf(surfaceId, useRollers);
  const loadN = massKg * G;

  // طول رمپ هرگز نمی‌تواند از ارتفاع کمتر باشد
  const L = Math.max(heightM * 1.02, lengthM);
  const sin = heightM / L;
  const cos = Math.sqrt(Math.max(0, 1 - sin * sin));
  const angleDeg = round((Math.asin(clamp(sin, 0, 1)) * 180) / Math.PI, 0);

  const effortIdealN = loadN * sin;               // مؤلفهٔ وزن در راستای شیب
  const frictionN = loadN * cos * surface.mu;     // اصطکاک در راستای شیب
  const effortN = effortIdealN + frictionN;

  const maIdeal = L / heightM;
  const maActual = loadN / effortN;

  return finish({
    machine: 'INCLINED_PLANE',
    massKg,
    surface,
    useRollers,
    loadN,
    effortIdealN,
    frictionN,
    effortN,
    maIdeal,
    maActual,
    efficiency: maActual / maIdeal,
    loadDistanceM: heightM,        // بار به اندازهٔ ارتفاع بالا می‌رود
    effortDistanceM: L,            // ولی ما در طول کل رمپ آن را می‌کشیم
    angleDeg,
    heightM,
    lengthM: L,
    directLiftN: loadN,
    savedPercent: clamp(Math.round(((loadN - effortN) / loadN) * 100), 0, 100),
    geom: { heightM, lengthM: L, angleDeg, sin, cos, mu: surface.mu },
    insightFa: angleDeg <= 20
      ? 'شیب ملایم شد: نیروی لازم کم است، اما مسیر درازتری را باید طی کنیم.'
      : angleDeg >= 45
        ? 'شیب خیلی تند است؛ نیروی لازم تقریباً به اندازهٔ بلند کردن مستقیم بار شد.'
        : 'با درازتر کردن رمپ، نیرو کمتر و مسافت بیشتر می‌شود؛ کار انجام‌شده تقریباً ثابت می‌ماند.'
  }, pullerId);
}

// ————————————————————————————————————————————————————————
// ۳) اهرم
// ————————————————————————————————————————————————————————

/** تشخیص نوع اهرم از روی ترتیب تکیه‌گاه، بار و نیرو */
export function leverClass(fulcrumM, loadM, effortM) {
  const between = (x, a, b) => x > Math.min(a, b) && x < Math.max(a, b);
  if (between(fulcrumM, loadM, effortM)) {
    return { type: 1, name: 'اهرم نوع اول', desc: 'تکیه‌گاه بین بار و نیرو است — مانند الاکلنگ، قیچی و دیلم.' };
  }
  if (between(loadM, fulcrumM, effortM)) {
    return { type: 2, name: 'اهرم نوع دوم', desc: 'بار بین تکیه‌گاه و نیرو است — مانند فرغون و دربازکن.' };
  }
  return { type: 3, name: 'اهرم نوع سوم', desc: 'نیرو بین تکیه‌گاه و بار است — مانند انبرک و ساعد دست؛ نیرو بیشتر می‌شود ولی سرعت و مسافتِ بار زیاد.' };
}

export function lever({
  massKg = 80,
  beamLengthM = 3,
  fulcrumM = 1,
  loadM = 0.3,
  effortM = 3,
  liftHeightM = 0.3,
  pullerId = DEFAULT_PULLER
} = {}) {
  const loadN = massKg * G;

  const loadArmM = Math.max(0.05, Math.abs(fulcrumM - loadM));
  const effortArmM = Math.max(0.05, Math.abs(effortM - fulcrumM));

  // تعادل گشتاور:  W × d_بار = F × d_نیرو
  const effortIdealN = (loadN * loadArmM) / effortArmM;
  const effortN = effortIdealN / LEVER_EFFICIENCY;
  const frictionN = effortN - effortIdealN;

  const maIdeal = effortArmM / loadArmM;
  const maActual = loadN / effortN;

  // بار به اندازهٔ liftHeightM بالا می‌رود ⇒ دست ما به همان نسبت بازوها پایین می‌آید
  const effortDistanceM = liftHeightM * maIdeal;

  return finish({
    machine: 'LEVER',
    massKg,
    loadN,
    effortIdealN,
    frictionN,
    effortN,
    maIdeal,
    maActual,
    efficiency: maActual / maIdeal,
    loadDistanceM: liftHeightM,
    effortDistanceM,
    loadArmM: round(loadArmM, 2),
    effortArmM: round(effortArmM, 2),
    leverClass: leverClass(fulcrumM, loadM, effortM),
    geom: { beamLengthM, fulcrumM, loadM, effortM, loadArmM, effortArmM, liftHeightM },
    insightFa: maIdeal >= 3
      ? 'بازوی نیرو چند برابر بازوی بار شد؛ با زور کم، بار سنگین بلند می‌شود (اما دستمان مسیر بیشتری پایین می‌رود).'
      : maIdeal >= 1
        ? 'اهرم کمی به ما کمک می‌کند؛ تکیه‌گاه را به بار نزدیک‌تر کن تا مزیت مکانیکی بیشتر شود.'
        : 'بازوی نیرو از بازوی بار کوتاه‌تر است؛ این اهرم نیرو را زیاد نمی‌کند، فقط بار را تندتر و بیشتر جابه‌جا می‌کند.'
  }, pullerId);
}

// ————————————————————————————————————————————————————————
// ۴) قرقره
// ————————————————————————————————————————————————————————

export function pulley({
  massKg = 60,
  systemId = 'FIXED',
  liftHeightM = 4,
  pullerId = DEFAULT_PULLER
} = {}) {
  const system = PULLEYS[systemId] || PULLEYS.FIXED;
  const loadN = massKg * G;

  const effortIdealN = loadN / system.strands;
  const efficiency = SHEAVE_EFFICIENCY ** system.sheaves;
  const effortN = effortIdealN / efficiency;
  const frictionN = effortN - effortIdealN;

  const maIdeal = system.strands;
  const maActual = loadN / effortN;
  const ropeM = liftHeightM * system.strands;

  return finish({
    machine: 'PULLEY',
    massKg,
    system,
    loadN,
    effortIdealN,
    frictionN,
    effortN,
    maIdeal,
    maActual,
    efficiency: maActual / maIdeal,
    loadDistanceM: liftHeightM,
    effortDistanceM: ropeM,
    ropeM: round(ropeM, 1),
    strands: system.strands,
    changesDirection: system.changesDirection,
    savedPercent: clamp(Math.round(((loadN - effortN) / loadN) * 100), 0, 100),
    geom: { liftHeightM, strands: system.strands, sheaves: system.sheaves, movable: system.movable },
    insightFa: system.strands === 1
      ? (system.changesDirection
          ? 'قرقرهٔ ثابت فقط جهت نیرو را عوض کرد؛ عدد نیروسنج همان وزن بار ماند.'
          : 'بدون قرقره، تمام وزن بار روی دست ماست و باید رو به بالا زور بزنیم.')
      : `وزن بار بین ${system.strands} رشته طناب تقسیم شد؛ نیرو حدود یک‌${system.strands === 2 ? 'دوم' : system.strands === 3 ? 'سوم' : 'چهارم'} شد ولی باید ${system.strands} برابر طناب بکشیم.`
  }, pullerId);
}

// ————————————————————————————————————————————————————————
// ۵) چرخ و محور (چرخ‌چاه / وینچ)
// ————————————————————————————————————————————————————————

export function wheelAxle({
  massKg = 40,
  wheelRadiusM = 0.5,
  axleRadiusM = 0.1,
  liftHeightM = 3,
  pullerId = DEFAULT_PULLER
} = {}) {
  const loadN = massKg * G;
  const R = Math.max(axleRadiusM * 1.05, wheelRadiusM);
  const r = Math.max(0.02, axleRadiusM);

  const effortIdealN = (loadN * r) / R;
  const effortN = effortIdealN / WHEEL_AXLE_EFFICIENCY;
  const frictionN = effortN - effortIdealN;

  const maIdeal = R / r;
  const maActual = loadN / effortN;
  const turns = liftHeightM / (2 * Math.PI * r);
  const handleTravelM = turns * 2 * Math.PI * R;

  return finish({
    machine: 'WHEEL_AXLE',
    massKg,
    loadN,
    effortIdealN,
    frictionN,
    effortN,
    maIdeal,
    maActual,
    efficiency: maActual / maIdeal,
    loadDistanceM: liftHeightM,
    effortDistanceM: handleTravelM,
    wheelRadiusM: R,
    axleRadiusM: r,
    turns: round(turns, 1),
    geom: { wheelRadiusM: R, axleRadiusM: r, liftHeightM, turns },
    insightFa: 'چرخ و محور یک اهرمِ چرخان است: شعاع چرخ نقشِ بازوی نیرو و شعاع محور نقشِ بازوی بار را دارد.'
  }, pullerId);
}

// ————————————————————————————————————————————————————————
// ۶) گوه (تبر، اسکنه، چاقو)
// ————————————————————————————————————————————————————————

export function wedge({
  resistanceN = 900,
  lengthM = 0.24,
  thicknessM = 0.06,
  pullerId = DEFAULT_PULLER
} = {}) {
  const L = Math.max(thicknessM * 1.05, lengthM);
  const t = Math.max(0.005, thicknessM);

  const effortIdealN = (resistanceN * t) / L;
  const effortN = effortIdealN / WEDGE_EFFICIENCY;
  const frictionN = effortN - effortIdealN;

  const maIdeal = L / t;
  const maActual = resistanceN / effortN;

  return finish({
    machine: 'WEDGE',
    loadN: resistanceN,
    effortIdealN,
    frictionN,
    effortN,
    maIdeal,
    maActual,
    efficiency: maActual / maIdeal,
    loadDistanceM: t,       // چوب به اندازهٔ ضخامت گوه از هم باز می‌شود
    effortDistanceM: L,     // ولی گوه باید تمام طولش فرو برود
    lengthM: L,
    thicknessM: t,
    geom: { lengthM: L, thicknessM: t },
    insightFa: 'گوه در واقع یک سطح شیب‌دارِ متحرک است: هرچه باریک‌تر و بلندتر باشد، با ضربهٔ کم‌تری چوب را می‌شکافد.'
  }, pullerId);
}

// ————————————————————————————————————————————————————————
// ۷) پیچ (جک پیچی)
// ————————————————————————————————————————————————————————

export function screw({
  massKg = 300,
  pitchM = 0.01,
  handleRadiusM = 0.35,
  liftHeightM = 0.2,
  pullerId = DEFAULT_PULLER
} = {}) {
  const loadN = massKg * G;
  const p = Math.max(0.002, pitchM);
  const R = Math.max(0.05, handleRadiusM);

  const circumference = 2 * Math.PI * R;
  const effortIdealN = (loadN * p) / circumference;
  const effortN = effortIdealN / SCREW_EFFICIENCY;
  const frictionN = effortN - effortIdealN;

  const maIdeal = circumference / p;
  const maActual = loadN / effortN;
  const turns = liftHeightM / p;

  return finish({
    machine: 'SCREW',
    massKg,
    loadN,
    effortIdealN,
    frictionN,
    effortN,
    maIdeal,
    maActual,
    efficiency: maActual / maIdeal,
    loadDistanceM: liftHeightM,
    effortDistanceM: turns * circumference,
    pitchM: p,
    handleRadiusM: R,
    turns: round(turns, 0),
    geom: { pitchM: p, handleRadiusM: R, liftHeightM, turns },
    insightFa: 'پیچ یک سطح شیب‌دار است که دور یک استوانه پیچیده شده؛ گام کوچک‌تر یعنی شیب ملایم‌تر و نیروی کمتر، اما تعداد چرخش بیشتر.'
  }, pullerId);
}

// ————————————————————————————————————————————————————————
// ۸) چرخ‌دنده‌ها (دادوستد گشتاور و سرعت)
// ————————————————————————————————————————————————————————

export function gears({
  driverTeeth = 12,
  drivenTeeth = 36,
  inputTorqueNm = 10,
  inputRpm = 60
} = {}) {
  const z1 = Math.max(6, Math.round(driverTeeth));
  const z2 = Math.max(6, Math.round(drivenTeeth));
  const ratio = z2 / z1;

  const outputTorqueNm = inputTorqueNm * ratio * GEAR_EFFICIENCY;
  const outputRpm = inputRpm / ratio;

  return roundResult({
    machine: 'GEARS',
    driverTeeth: z1,
    drivenTeeth: z2,
    ratio: round(ratio, 2),
    inputTorqueNm,
    outputTorqueNm: round(outputTorqueNm, 1),
    inputRpm,
    outputRpm: round(outputRpm, 1),
    efficiency: GEAR_EFFICIENCY,
    reversesDirection: true,
    feasible: true,
    geom: { z1, z2, ratio },
    insightFa: ratio > 1
      ? 'چرخ‌دندهٔ بزرگ‌تر کندتر می‌چرخد ولی گشتاور (قدرتِ چرخاندن) بیشتری دارد — درست مثل دنده‌سنگین دوچرخه در سربالایی.'
      : ratio < 1
        ? 'چرخ‌دندهٔ کوچک‌تر تندتر می‌چرخد ولی گشتاورش کمتر است — مثل دنده‌سبک دوچرخه در سرازیری.'
        : 'با تعداد دندانهٔ برابر، سرعت و گشتاور تغییری نمی‌کند؛ فقط جهت چرخش برعکس می‌شود.'
  });
}

// ————————————————————————————————————————————————————————
// حل‌کنندهٔ یکپارچه
// ————————————————————————————————————————————————————————

const SOLVERS = {
  FRICTION: friction,
  INCLINED_PLANE: inclinedPlane,
  LEVER: lever,
  PULLEY: pulley,
  WHEEL_AXLE: wheelAxle,
  WEDGE: wedge,
  SCREW: screw,
  GEARS: gears
};

/** محاسبهٔ نتیجهٔ هر ماشین از روی شناسه و پارامترها */
export function solve(machineId, params = {}) {
  const fn = SOLVERS[machineId];
  if (!fn) throw new Error(`ماشین ناشناخته: ${machineId}`);
  return fn(params);
}

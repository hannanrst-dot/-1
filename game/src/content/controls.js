// توصیف اعلانیِ کنترل‌های هر ماشین — هم آزمایشگاه و هم مأموریت‌ها از این استفاده می‌کنند
import { SURFACES, PULLEYS, PULLERS } from '../physics/machines.js';
import { fa, num } from '../core/format.js';

const surfaceOptions = () => Object.values(SURFACES).map((s) => ({
  value: s.id, label: s.name, icon: s.icon, sub: `اصطکاک ${fa(s.mu)}`
}));

const pulleyOptions = (ids) => (ids || Object.keys(PULLEYS)).map((id) => {
  const p = PULLEYS[id];
  return { value: id, label: p.shortName, icon: p.icon, sub: `${fa(p.strands)} رشته` };
});

export const pullerOptions = () => Object.values(PULLERS).map((p) => ({
  value: p.id, label: p.name, icon: p.icon, sub: `تا ${fa(p.limitN)} نیوتون`
}));

/** پارامترهای پیش‌فرض هر ماشین */
export const DEFAULT_PARAMS = {
  FRICTION: { massKg: 50, surfaceId: 'ROUGH_STONE', useRollers: false, distanceM: 6 },
  INCLINED_PLANE: { massKg: 50, heightM: 2, lengthM: 3, surfaceId: 'WOOD_PLANKS', useRollers: false },
  LEVER: { massKg: 80, beamLengthM: 3, fulcrumM: 2.2, loadM: 0.3, liftHeightM: 0.3 },
  PULLEY: { massKg: 60, systemId: 'FIXED', liftHeightM: 4 },
  WHEEL_AXLE: { massKg: 40, wheelRadiusM: 0.35, axleRadiusM: 0.15, liftHeightM: 3 },
  WEDGE: { resistanceN: 900, lengthM: 0.16, thicknessM: 0.08 },
  SCREW: { massKg: 300, pitchM: 0.012, handleRadiusM: 0.25, liftHeightM: 0.2 },
  GEARS: { driverTeeth: 12, drivenTeeth: 24, inputTorqueNm: 12, inputRpm: 60 }
};

/** کنترل‌های قابل نمایش هر ماشین */
export const MACHINE_CONTROLS = {
  FRICTION: [
    { kind: 'slider', key: 'massKg', label: 'جرم بار', min: 10, max: 120, step: 5, unit: 'کیلوگرم' },
    { kind: 'segment', key: 'surfaceId', label: 'جنس سطح مسیر', options: surfaceOptions() },
    { kind: 'switch', key: 'useRollers', label: 'گذاشتن غلتک زیر بار', sub: 'مالش را به غلتش تبدیل می‌کند' },
    { kind: 'slider', key: 'distanceM', label: 'مسافت جابه‌جایی', min: 2, max: 12, step: 1, unit: 'متر' }
  ],
  INCLINED_PLANE: [
    { kind: 'slider', key: 'massKg', label: 'جرم بار', min: 10, max: 120, step: 5, unit: 'کیلوگرم' },
    { kind: 'slider', key: 'heightM', label: 'ارتفاعی که باید بالا برویم', min: 0.5, max: 4, step: 0.25, unit: 'متر' },
    { kind: 'slider', key: 'lengthM', label: 'طول سطح شیب‌دار', min: 1, max: 10, step: 0.25, unit: 'متر' },
    { kind: 'segment', key: 'surfaceId', label: 'جنس رویهٔ رمپ', options: surfaceOptions() },
    { kind: 'switch', key: 'useRollers', label: 'افزودن غلتک روی رمپ', sub: 'اصطکاک را تا ۰٫۰۶ پایین می‌آورد' }
  ],
  LEVER: [
    { kind: 'slider', key: 'massKg', label: 'جرم تخته‌سنگ', min: 20, max: 200, step: 10, unit: 'کیلوگرم' },
    {
      kind: 'segment', key: 'beamLengthM', label: 'طول تیرک اهرم', numeric: true,
      options: [2, 3, 4].map((v) => ({ value: v, label: `${fa(v)} متری`, icon: '🪵' }))
    },
    { kind: 'slider', key: 'fulcrumM', label: 'جای تکیه‌گاه (فاصله از بار)', min: 0.4, max: 3.8, step: 0.1, unit: 'متر', maxKey: 'beamLengthM', maxOffset: -0.2 },
    { kind: 'slider', key: 'loadM', label: 'جای تخته‌سنگ روی تیرک', min: 0, max: 1, step: 0.1, unit: 'متر' },
    { kind: 'slider', key: 'liftHeightM', label: 'چقدر بالا برود', min: 0.1, max: 0.6, step: 0.05, unit: 'متر' }
  ],
  PULLEY: [
    { kind: 'slider', key: 'massKg', label: 'جرم بار', min: 10, max: 150, step: 5, unit: 'کیلوگرم' },
    { kind: 'segment', key: 'systemId', label: 'سامانهٔ قرقره', options: pulleyOptions() },
    { kind: 'slider', key: 'liftHeightM', label: 'ارتفاع بالا بردن', min: 1, max: 8, step: 0.5, unit: 'متر' }
  ],
  WHEEL_AXLE: [
    { kind: 'slider', key: 'massKg', label: 'جرم سطل آب', min: 5, max: 80, step: 5, unit: 'کیلوگرم' },
    { kind: 'slider', key: 'wheelRadiusM', label: 'شعاع چرخ (دستگیره)', min: 0.15, max: 0.8, step: 0.05, unit: 'متر' },
    { kind: 'slider', key: 'axleRadiusM', label: 'شعاع محور', min: 0.03, max: 0.3, step: 0.01, unit: 'متر' },
    { kind: 'slider', key: 'liftHeightM', label: 'عمق چاه', min: 1, max: 10, step: 0.5, unit: 'متر' }
  ],
  WEDGE: [
    { kind: 'slider', key: 'resistanceN', label: 'سرسختی چوب', min: 200, max: 2000, step: 100, unit: 'نیوتون' },
    { kind: 'slider', key: 'lengthM', label: 'طول گوه', min: 0.06, max: 0.4, step: 0.02, unit: 'متر', decimals: 2 },
    { kind: 'slider', key: 'thicknessM', label: 'ضخامت گوه', min: 0.01, max: 0.16, step: 0.01, unit: 'متر', decimals: 2 }
  ],
  SCREW: [
    { kind: 'slider', key: 'massKg', label: 'جرم تخته‌سنگ', min: 50, max: 1000, step: 50, unit: 'کیلوگرم' },
    { kind: 'slider', key: 'pitchM', label: 'گام پیچ (فاصلهٔ رزوه‌ها)', min: 0.002, max: 0.02, step: 0.002, unit: 'متر', decimals: 3 },
    { kind: 'slider', key: 'handleRadiusM', label: 'شعاع دستهٔ چرخاندن', min: 0.08, max: 0.6, step: 0.02, unit: 'متر', decimals: 2 },
    { kind: 'slider', key: 'liftHeightM', label: 'چقدر بالا برود', min: 0.05, max: 0.5, step: 0.05, unit: 'متر', decimals: 2 }
  ],
  GEARS: [
    { kind: 'slider', key: 'driverTeeth', label: 'دندانه‌های چرخ‌دندهٔ محرک', min: 8, max: 40, step: 1, unit: 'دندانه' },
    { kind: 'slider', key: 'drivenTeeth', label: 'دندانه‌های چرخ‌دندهٔ متحرک', min: 8, max: 60, step: 1, unit: 'دندانه' },
    { kind: 'slider', key: 'inputTorqueNm', label: 'گشتاور ورودی', min: 4, max: 40, step: 2, unit: 'نیوتون‌متر' },
    { kind: 'slider', key: 'inputRpm', label: 'سرعت چرخش ورودی', min: 10, max: 150, step: 10, unit: 'دور بر دقیقه' }
  ],
  CAPSTONE: [
    { kind: 'segment', key: 'surfaceId', label: 'رویهٔ مسیر و رمپ', options: surfaceOptions() },
    { kind: 'switch', key: 'useRollers', label: 'غلتک زیر بار (۲ قطعه مصالح)', sub: 'هم در کشیدن و هم روی رمپ کمک می‌کند' },
    { kind: 'slider', key: 'rampLengthM', label: 'طول رمپ دیوارهٔ سنگی', min: 2.5, max: 8, step: 0.5, unit: 'متر', cost: 'هر ۲ متر = ۱ قطعه' },
    {
      kind: 'segment', key: 'bridgeBeams', label: 'تیرک‌های پل میانی', numeric: true,
      options: [
        { value: 1, label: '۱ تیرک', icon: '⚠️', sub: 'ناپایدار' },
        { value: 2, label: '۲ تیرک', icon: '✅', sub: 'ایمن' },
        { value: 3, label: '۳ تیرک', icon: '🛡️', sub: 'خیلی محکم' }
      ]
    },
    { kind: 'segment', key: 'pulleySystemId', label: 'بالابَر ایوان درمانگاه', options: pulleyOptions(['FIXED', 'MOVABLE', 'COMPOUND_2', 'COMPOUND_3', 'COMPOUND_4']) }
  ]
};

/** پارامترهای وابسته را کامل می‌کند (مثلاً محل دستِ اهرم همیشه سرِ تیرک است) */
export function resolveParams(machineId, params) {
  const p = { ...params };
  if (machineId === 'LEVER') {
    p.effortM = p.beamLengthM;
    p.fulcrumM = Math.min(p.fulcrumM, p.beamLengthM - 0.2);
    p.loadM = Math.min(p.loadM, p.fulcrumM - 0.1);
  }
  if (machineId === 'INCLINED_PLANE' && p.lengthM < p.heightM * 1.05) {
    p.lengthM = Math.round(p.heightM * 1.05 * 4) / 4;
  }
  if (machineId === 'WHEEL_AXLE' && p.axleRadiusM >= p.wheelRadiusM) {
    p.axleRadiusM = Math.max(0.03, p.wheelRadiusM * 0.5);
  }
  if (machineId === 'WEDGE' && p.thicknessM >= p.lengthM) {
    p.thicknessM = Math.max(0.01, p.lengthM * 0.5);
  }
  return p;
}

/** برچسب کوتاه پیکربندی برای دفترچهٔ ثبت آزمایش */
export function describeSetup(machineId, params, result) {
  switch (machineId) {
    case 'FRICTION':
      return `${fa(params.massKg)} کیلوگرم روی ${result.surface.name}${params.useRollers ? ' با غلتک' : ''}`;
    case 'INCLINED_PLANE':
      return `${fa(params.massKg)} کیلوگرم، ارتفاع ${fa(params.heightM)} م، رمپ ${fa(num(result.lengthM, 1))} م${params.useRollers ? ' با غلتک' : ''}`;
    case 'LEVER':
      return `${fa(params.massKg)} کیلوگرم، بازوی بار ${fa(result.loadArmM)} م، بازوی نیرو ${fa(result.effortArmM)} م`;
    case 'PULLEY':
      return `${fa(params.massKg)} کیلوگرم با ${result.system.name} (${fa(result.strands)} رشته)`;
    case 'WHEEL_AXLE':
      return `شعاع چرخ ${fa(num(params.wheelRadiusM, 2))} م و محور ${fa(num(params.axleRadiusM, 2))} م`;
    case 'WEDGE':
      return `گوهٔ ${fa(num(params.lengthM * 100, 0))}×${fa(num(params.thicknessM * 100, 0))} سانتی‌متر`;
    case 'SCREW':
      return `گام ${fa(num(params.pitchM * 1000, 0))} میلی‌متر، دسته ${fa(num(params.handleRadiusM * 100, 0))} سانتی‌متر`;
    case 'GEARS':
      return `${fa(params.driverTeeth)} به ${fa(params.drivenTeeth)} دندانه`;
    case 'CAPSTONE':
      return `رمپ ${fa(params.rampLengthM)} م، ${fa(params.bridgeBeams)} تیرک، ${PULLEYS[params.pulleySystemId].shortName}`;
    default:
      return '—';
  }
}

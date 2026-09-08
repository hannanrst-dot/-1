// توصیف اعلانیِ کنترل‌های هر ماشین — هم آزمایشگاه و هم مأموریت‌ها از این استفاده می‌کنند
import { SURFACES, PULLEYS } from '../physics/machines.js';
import { fa, num } from '../core/format.js';

const surfaceOptions = () => Object.values(SURFACES).map((s) => ({
  value: s.id, label: s.name, icon: s.icon, sub: `اصطکاک ${fa(s.mu)}`
}));

const pulleyOptions = (ids) => (ids || Object.keys(PULLEYS)).map((id) => {
  const p = PULLEYS[id];
  return { value: id, label: p.shortName, icon: p.icon, sub: `${fa(p.strands)} رشته` };
});

/** پارامترهای پیش‌فرض هر ماشین */
export const DEFAULT_PARAMS = {
  FRICTION: { massKg: 50, surfaceId: 'ROUGH_STONE', useRollers: false, distanceM: 6 },
  INCLINED_PLANE: { massKg: 50, heightM: 2, lengthM: 4, surfaceId: 'WOOD_PLANKS', useRollers: false },
  LEVER: { massKg: 80, beamLengthM: 3, fulcrumM: 1, loadM: 0.2, liftHeightM: 0.3 },
  PULLEY: { massKg: 60, systemId: 'FIXED', liftHeightM: 4 },
  WHEEL_AXLE: { massKg: 20, wheelRadiusM: 0.4, axleRadiusM: 0.1, liftHeightM: 5 },
  WEDGE: { resistanceN: 900, lengthM: 0.2, thicknessM: 0.05 },
  SCREW: { massKg: 300, pitchM: 0.005, handleRadiusM: 0.3, liftHeightM: 0.2 },
  GEARS: { driverTeeth: 12, drivenTeeth: 24, inputTorqueNm: 12, inputRpm: 60 }
};

/** کنترل‌های قابل نمایش هر ماشین */
export const MACHINE_CONTROLS = {
  FRICTION: [
    { kind: 'slider', key: 'massKg', label: 'جرم بار', min: 1, max: 200, step: 1, unit: 'کیلوگرم' },
    { kind: 'segment', key: 'surfaceId', label: 'جنس سطح مسیر', options: surfaceOptions() },
    { kind: 'switch', key: 'useRollers', label: 'گذاشتن غلتک زیر بار', sub: 'مالش را به غلتش تبدیل می‌کند' },
    { kind: 'slider', key: 'distanceM', label: 'مسافت جابه‌جایی', min: 0.5, max: 20, step: 0.5, unit: 'متر' }
  ],
  INCLINED_PLANE: [
    { kind: 'slider', key: 'massKg', label: 'جرم بار', min: 1, max: 200, step: 1, unit: 'کیلوگرم' },
    { kind: 'slider', key: 'heightM', label: 'ارتفاع h', min: 0.1, max: 4, step: 0.1, unit: 'متر', decimals: 1 },
    { kind: 'slider', key: 'lengthM', label: 'طول سطح شیب‌دار L', min: 0.2, max: 12, step: 0.1, unit: 'متر', decimals: 1 },
    { kind: 'segment', key: 'surfaceId', label: 'جنس رویهٔ رمپ', options: surfaceOptions() },
    { kind: 'switch', key: 'useRollers', label: 'افزودن غلتک روی رمپ', sub: 'اصطکاک را تا ۰٫۰۶ پایین می‌آورد' }
  ],
  LEVER: [
    { kind: 'slider', key: 'massKg', label: 'جرم بار', min: 1, max: 300, step: 1, unit: 'کیلوگرم' },
    {
      kind: 'segment', key: 'beamLengthM', label: 'طول تیرک اهرم', numeric: true,
      options: [1, 2, 3, 4].map((v) => ({ value: v, label: `${fa(v)} متر`, icon: '📏' }))
    },
    { kind: 'slider', key: 'fulcrumM', label: 'جای تکیه‌گاه از سرِ راست', min: 0.1, max: 3.9, step: 0.05, unit: 'متر', decimals: 2, maxKey: 'beamLengthM', maxOffset: -0.1 },
    { kind: 'slider', key: 'loadM', label: 'جای بار از سرِ راست', min: 0, max: 1, step: 0.05, unit: 'متر', decimals: 2 },
    { kind: 'slider', key: 'liftHeightM', label: 'ارتفاع بلند شدن بار', min: 0.05, max: 0.8, step: 0.05, unit: 'متر', decimals: 2 }
  ],
  PULLEY: [
    { kind: 'slider', key: 'massKg', label: 'جرم بار', min: 1, max: 200, step: 1, unit: 'کیلوگرم' },
    { kind: 'segment', key: 'systemId', label: 'سامانهٔ قرقره', options: pulleyOptions() },
    { kind: 'slider', key: 'liftHeightM', label: 'ارتفاع بالا بردن h', min: 0.2, max: 10, step: 0.1, unit: 'متر', decimals: 1 }
  ],
  WHEEL_AXLE: [
    { kind: 'slider', key: 'massKg', label: 'جرم سطل', min: 1, max: 120, step: 1, unit: 'کیلوگرم' },
    { kind: 'slider', key: 'wheelRadiusM', label: 'شعاع چرخ R', min: 0.05, max: 1, step: 0.01, unit: 'متر', decimals: 2 },
    { kind: 'slider', key: 'axleRadiusM', label: 'شعاع محور r', min: 0.01, max: 0.4, step: 0.01, unit: 'متر', decimals: 2 },
    { kind: 'slider', key: 'liftHeightM', label: 'عمق چاه', min: 0.5, max: 15, step: 0.5, unit: 'متر', decimals: 1 }
  ],
  WEDGE: [
    { kind: 'slider', key: 'resistanceN', label: 'نیروی مقاومِ چوب', min: 50, max: 3000, step: 50, unit: 'نیوتون' },
    { kind: 'slider', key: 'lengthM', label: 'طول گوه L', min: 0.02, max: 0.5, step: 0.01, unit: 'متر', decimals: 2 },
    { kind: 'slider', key: 'thicknessM', label: 'ضخامت گوه t', min: 0.005, max: 0.2, step: 0.005, unit: 'متر', decimals: 3 }
  ],
  SCREW: [
    { kind: 'slider', key: 'massKg', label: 'جرم بار', min: 10, max: 2000, step: 10, unit: 'کیلوگرم' },
    { kind: 'slider', key: 'pitchM', label: 'گام پیچ p', min: 0.001, max: 0.03, step: 0.001, unit: 'متر', decimals: 3 },
    { kind: 'slider', key: 'handleRadiusM', label: 'شعاع دسته R', min: 0.05, max: 0.8, step: 0.01, unit: 'متر', decimals: 2 },
    { kind: 'slider', key: 'liftHeightM', label: 'ارتفاع بلند شدن', min: 0.02, max: 1, step: 0.02, unit: 'متر', decimals: 2 }
  ],
  GEARS: [
    { kind: 'slider', key: 'driverTeeth', label: 'دندانه‌های چرخ‌دندهٔ محرک z₁', min: 6, max: 60, step: 1, unit: 'دندانه' },
    { kind: 'slider', key: 'drivenTeeth', label: 'دندانه‌های چرخ‌دندهٔ متحرک z₂', min: 6, max: 90, step: 1, unit: 'دندانه' },
    { kind: 'slider', key: 'inputTorqueNm', label: 'گشتاور ورودی τ₁', min: 1, max: 100, step: 1, unit: 'نیوتون‌متر' },
    { kind: 'slider', key: 'inputRpm', label: 'سرعت چرخش ورودی n₁', min: 5, max: 300, step: 5, unit: 'دور بر دقیقه' }
  ],
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
    default:
      return '—';
  }
}

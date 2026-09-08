// محاسبهٔ گام‌به‌گام هر آزمایش — همان چیزی که آموزگار روی تخته می‌نویسد.
// هر گام: عنوان، فرمول نمادین، جای‌گذاری اعداد، و نتیجه با یکا.
import { fa, num } from '../core/format.js';

const step = (name, formula, work, value, unit = '', note = '') =>
  ({ name, formula, work, value, unit, note });

/** عدد آمادهٔ نمایش داخل فرمول */
const v = (x, d) => fa(num(x, d));

function energySteps(r) {
  return [
    step('کار مفید — روی بار', 'W_out = F_w × d_w', `${v(r.loadN, 0)} × ${v(r.loadDistanceM, 2)}`, v(r.workOutJ, 0), 'ژول'),
    step('کارِ انجام‌شده توسط ما', 'W_in = F × d_F', `${v(r.effortN, 0)} × ${v(r.effortDistanceM, 2)}`, v(r.workInJ, 0), 'ژول'),
    step('بازده', 'η = W_out ÷ W_in', `${v(r.workOutJ, 0)} ÷ ${v(r.workInJ, 0)}`, `${fa(Math.round(r.efficiency * 100))}٪`, '',
      r.energyLostJ > 0.5 ? `${fa(num(r.energyLostJ, 0))} ژول صرف غلبه بر اصطکاک شد.` : 'در حالت آرمانی هیچ انرژی‌ای هدر نمی‌رود.')
  ];
}

function maSteps(r) {
  return [
    step('مزیت مکانیکی آرمانی', 'MA₀ = d_F ÷ d_w', `${v(r.effortDistanceM, 2)} ÷ ${v(r.loadDistanceM, 2)}`, v(r.maIdeal, 2), 'برابر'),
    step('مزیت مکانیکی واقعی', 'MA = F_w ÷ F', `${v(r.loadN, 0)} ÷ ${v(r.effortN, 0)}`, v(r.maActual, 2), 'برابر')
  ];
}

const weightStep = (r) =>
  step('وزن بار', 'F_w = m × g', `${fa(r.massKg)} × ${fa(num(r.g, 2))}`, v(r.loadN, 0), 'نیوتون');

export function explain(r) {
  switch (r.machine) {
    case 'FRICTION':
      return [
        weightStep(r),
        step('نیروی اصطکاک', 'f = μ × F_w', `${fa(num(r.geom.mu, 2))} × ${v(r.loadN, 0)}`, v(r.effortN, 0), 'نیوتون',
          r.ideal ? 'در حالت آرمانی μ برابر صفر است.' : `ضریب اصطکاک ${r.surface.name}: ${fa(r.surface.mu)}`),
        step('نیروی لازم برای کشیدن', 'F = f', '—', v(r.effortN, 0), 'نیوتون',
          'روی سطح افقی، تمام نیروی ما صرف غلبه بر اصطکاک می‌شود.'),
        step('کارِ انجام‌شده', 'W_in = F × d', `${v(r.effortN, 0)} × ${fa(r.geom.distanceM)}`, v(r.workInJ, 0), 'ژول',
          'چون بار بالا نمی‌رود، کار مفید صفر است و همهٔ این انرژی به گرما تبدیل می‌شود.')
      ];

    case 'INCLINED_PLANE':
      return [
        weightStep(r),
        step('سینوس زاویهٔ شیب', 'sin θ = h ÷ L', `${fa(num(r.heightM, 2))} ÷ ${fa(num(r.lengthM, 2))}`, v(r.geom.sin, 3), `≈ ${fa(r.angleDeg)}°`),
        step('مؤلفهٔ وزن در راستای شیب', 'F₀ = F_w × sin θ', `${v(r.loadN, 0)} × ${v(r.geom.sin, 3)}`, v(r.effortIdealN, 0), 'نیوتون'),
        step('نیروی اصطکاک روی رمپ', 'f = μ × F_w × cos θ', `${fa(num(r.geom.mu, 2))} × ${v(r.loadN, 0)} × ${v(r.geom.cos, 3)}`, v(r.frictionN, 0), 'نیوتون'),
        step('نیروی لازم', 'F = F₀ + f', `${v(r.effortIdealN, 0)} + ${v(r.frictionN, 0)}`, v(r.effortN, 0), 'نیوتون'),
        step('مزیت مکانیکی آرمانی', 'MA₀ = L ÷ h', `${fa(num(r.lengthM, 2))} ÷ ${fa(num(r.heightM, 2))}`, v(r.maIdeal, 2), 'برابر'),
        step('مزیت مکانیکی واقعی', 'MA = F_w ÷ F', `${v(r.loadN, 0)} ÷ ${v(r.effortN, 0)}`, v(r.maActual, 2), 'برابر'),
        ...energySteps(r)
      ];

    case 'LEVER':
      return [
        weightStep(r),
        step('بازوی بار', 'd_w = |x_f − x_w|', `|${fa(num(r.geom.fulcrumM, 2))} − ${fa(num(r.geom.loadM, 2))}|`, v(r.loadArmM, 2), 'متر'),
        step('بازوی نیرو', 'd_F = |x_F − x_f|', `|${fa(num(r.geom.effortM, 2))} − ${fa(num(r.geom.fulcrumM, 2))}|`, v(r.effortArmM, 2), 'متر'),
        step('تعادل گشتاور', 'F_w × d_w = F × d_F', `${v(r.loadN, 0)} × ${v(r.loadArmM, 2)} = F × ${v(r.effortArmM, 2)}`, v(r.effortIdealN, 0), 'نیوتون'),
        step('نیروی لازم با اصطکاک تکیه‌گاه', 'F = F₀ ÷ η', `${v(r.effortIdealN, 0)} ÷ ${fa(num(r.effortIdealN / r.effortN, 2))}`, v(r.effortN, 0), 'نیوتون'),
        step('مزیت مکانیکی آرمانی', 'MA₀ = d_F ÷ d_w', `${v(r.effortArmM, 2)} ÷ ${v(r.loadArmM, 2)}`, v(r.maIdeal, 2), 'برابر',
          r.leverClass.name),
        step('مسافتی که دست طی می‌کند', 'd_F = d_w × MA₀', `${v(r.loadDistanceM, 2)} × ${v(r.maIdeal, 2)}`, v(r.effortDistanceM, 2), 'متر'),
        ...energySteps(r)
      ];

    case 'PULLEY':
      return [
        weightStep(r),
        step('رشته‌های نگهدارندهٔ بار', 'n', '—', fa(r.strands), 'رشته', r.system.name),
        step('نیروی آرمانی', 'F₀ = F_w ÷ n', `${v(r.loadN, 0)} ÷ ${fa(r.strands)}`, v(r.effortIdealN, 0), 'نیوتون'),
        step('نیروی لازم با اصطکاک قرقره‌ها', 'F = F₀ ÷ η', `${v(r.effortIdealN, 0)} ÷ ${fa(num(r.effortIdealN / r.effortN, 2))}`, v(r.effortN, 0), 'نیوتون'),
        step('طول طنابی که می‌کشیم', 'd_F = n × h', `${fa(r.strands)} × ${fa(num(r.loadDistanceM, 2))}`, v(r.effortDistanceM, 2), 'متر'),
        step('مزیت مکانیکی آرمانی', 'MA₀ = n', '—', fa(r.maIdeal), 'برابر'),
        step('مزیت مکانیکی واقعی', 'MA = F_w ÷ F', `${v(r.loadN, 0)} ÷ ${v(r.effortN, 0)}`, v(r.maActual, 2), 'برابر'),
        ...energySteps(r)
      ];

    case 'WHEEL_AXLE':
      return [
        weightStep(r),
        step('مزیت مکانیکی آرمانی', 'MA₀ = R ÷ r', `${fa(num(r.wheelRadiusM, 2))} ÷ ${fa(num(r.axleRadiusM, 2))}`, v(r.maIdeal, 2), 'برابر'),
        step('نیروی آرمانی', 'F₀ = F_w × r ÷ R', `${v(r.loadN, 0)} × ${fa(num(r.axleRadiusM, 2))} ÷ ${fa(num(r.wheelRadiusM, 2))}`, v(r.effortIdealN, 0), 'نیوتون'),
        step('نیروی لازم با اصطکاک محور', 'F = F₀ ÷ η', `${v(r.effortIdealN, 0)} ÷ ${fa(num(r.effortIdealN / r.effortN, 2))}`, v(r.effortN, 0), 'نیوتون'),
        step('تعداد دورهای لازم', 'n = h ÷ (2πr)', `${fa(num(r.loadDistanceM, 2))} ÷ (۲π × ${fa(num(r.axleRadiusM, 2))})`, v(r.turns, 1), 'دور'),
        step('مسیری که دست طی می‌کند', 'd_F = n × 2πR', `${v(r.turns, 1)} × ۲π × ${fa(num(r.wheelRadiusM, 2))}`, v(r.effortDistanceM, 2), 'متر'),
        ...energySteps(r)
      ];

    case 'WEDGE':
      return [
        step('نیروی مقاومِ چوب', 'F_w', '—', v(r.loadN, 0), 'نیوتون'),
        step('مزیت مکانیکی آرمانی', 'MA₀ = L ÷ t', `${fa(num(r.lengthM * 100, 1))} ÷ ${fa(num(r.thicknessM * 100, 1))}`, v(r.maIdeal, 2), 'برابر', 'اندازه‌ها بر حسب سانتی‌متر'),
        step('نیروی آرمانی', 'F₀ = F_w × t ÷ L', `${v(r.loadN, 0)} × ${fa(num(r.thicknessM * 100, 1))} ÷ ${fa(num(r.lengthM * 100, 1))}`, v(r.effortIdealN, 0), 'نیوتون'),
        step('نیروی واقعی ضربه', 'F = F₀ ÷ η', `${v(r.effortIdealN, 0)} ÷ ${fa(num(r.effortIdealN / r.effortN, 2))}`, v(r.effortN, 0), 'نیوتون',
          'گوه بازدهٔ پایینی دارد؛ بخش بزرگی از نیرو صرف اصطکاک با چوب می‌شود.'),
        ...energySteps(r)
      ];

    case 'SCREW':
      return [
        weightStep(r),
        step('محیط دایره‌ای که دسته می‌پیماید', 'C = 2πR', `۲π × ${fa(num(r.handleRadiusM, 2))}`, v(2 * Math.PI * r.handleRadiusM, 3), 'متر'),
        step('مزیت مکانیکی آرمانی', 'MA₀ = C ÷ p', `${v(2 * Math.PI * r.handleRadiusM, 3)} ÷ ${fa(num(r.pitchM, 3))}`, v(r.maIdeal, 1), 'برابر'),
        step('نیروی آرمانی', 'F₀ = F_w ÷ MA₀', `${v(r.loadN, 0)} ÷ ${v(r.maIdeal, 1)}`, v(r.effortIdealN, 1), 'نیوتون'),
        step('نیروی واقعی', 'F = F₀ ÷ η', `${v(r.effortIdealN, 1)} ÷ ${fa(num(r.effortIdealN / r.effortN, 2))}`, v(r.effortN, 1), 'نیوتون',
          'اصطکاک زیادِ پیچ همان چیزی است که نمی‌گذارد بار خودبه‌خود پایین بیاید.'),
        step('تعداد دورهای لازم', 'n = h ÷ p', `${fa(num(r.loadDistanceM, 2))} ÷ ${fa(num(r.pitchM, 3))}`, fa(r.turns), 'دور'),
        ...energySteps(r)
      ];

    case 'GEARS':
      return [
        step('نسبت دنده', 'i = z₂ ÷ z₁', `${fa(r.drivenTeeth)} ÷ ${fa(r.driverTeeth)}`, v(r.ratio, 2), 'برابر'),
        step('سرعت چرخش خروجی', 'n₂ = n₁ ÷ i', `${fa(r.inputRpm)} ÷ ${v(r.ratio, 2)}`, v(r.outputRpm, 1), 'دور بر دقیقه'),
        step('گشتاور خروجی', 'τ₂ = τ₁ × i × η', `${fa(r.inputTorqueNm)} × ${v(r.ratio, 2)} × ${fa(num(r.efficiency, 2))}`, v(r.outputTorqueNm, 1), 'نیوتون‌متر'),
        step('حاصل‌ضرب گشتاور در سرعت', 'τ × n', `${v(r.outputTorqueNm, 1)} × ${v(r.outputRpm, 1)}`, v(r.outputTorqueNm * r.outputRpm, 0), '',
          'هرچه گشتاور بیشتر شود سرعت کمتر می‌شود؛ توان تقریباً ثابت می‌ماند.')
      ];

    default:
      return [];
  }
}

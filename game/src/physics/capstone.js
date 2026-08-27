// مأموریت پایانی: زنجیرهٔ چند مرحله‌ای رساندن محمولهٔ دارو به درمانگاه
import { friction, inclinedPlane, pulley } from './machines.js';
import { PULLERS, DEFAULT_PULLER } from './constants.js';
import { round } from '../core/format.js';

/** هزینهٔ مصالح هر انتخاب (واحد: قطعه) */
export const MATERIAL_COST = {
  rollers: 2,
  rampPerTwoMeters: 1,
  bridgeBeam: 1,
  pulley: { NONE: 0, FIXED: 1, MOVABLE: 2, COMPOUND_2: 3, COMPOUND_3: 4, COMPOUND_4: 5 }
};

export const MATERIAL_BUDGET = 12;

/** هزینهٔ مصالح یک طرح */
export function materialCostOf({ useRollers, rampLengthM, bridgeBeams, pulleySystemId }) {
  return (
    (useRollers ? MATERIAL_COST.rollers : 0) +
    Math.ceil(rampLengthM / 2) * MATERIAL_COST.rampPerTwoMeters +
    bridgeBeams * MATERIAL_COST.bridgeBeam +
    (MATERIAL_COST.pulley[pulleySystemId] ?? 2)
  );
}

export function capstone({
  massKg = 60,
  surfaceId = 'WOOD_PLANKS',
  useRollers = true,
  dragDistanceM = 6,
  cliffHeightM = 2,
  rampLengthM = 6,
  bridgeBeams = 2,
  pulleySystemId = 'MOVABLE',
  balconyHeightM = 4,
  pullerId = DEFAULT_PULLER,
  budget = MATERIAL_BUDGET
} = {}) {
  const puller = PULLERS[pullerId] || PULLERS[DEFAULT_PULLER];

  const stageA = friction({ massKg, surfaceId, useRollers, distanceM: dragDistanceM, pullerId });
  const stageB = inclinedPlane({ massKg, heightM: cliffHeightM, lengthM: rampLengthM, surfaceId, useRollers, pullerId });
  const stageC = pulley({ massKg, systemId: pulleySystemId, liftHeightM: balconyHeightM, pullerId });

  const bridgeStable = bridgeBeams >= 2;

  const materialsUsed = materialCostOf({ useRollers, rampLengthM, bridgeBeams, pulleySystemId });

  const withinBudget = materialsUsed <= budget;
  const stages = [
    { id: 'A', title: 'کشیدن روی دشت سنگی', result: stageA, ok: stageA.feasible },
    { id: 'B', title: 'بالا بردن از دیوارهٔ سنگی', result: stageB, ok: stageB.feasible },
    { id: 'C', title: 'بالا کشیدن تا ایوان درمانگاه', result: stageC, ok: stageC.feasible }
  ];

  const blockingStage = stages.find((s) => !s.ok) || null;
  const maxForceN = Math.max(stageA.effortN, stageB.effortN, stageC.effortN);
  const totalWorkJ = round(stageA.workInJ + stageB.workInJ + stageC.workInJ, 0);
  const success = !blockingStage && bridgeStable && withinBudget;

  const badges = [];
  if (success) {
    badges.push({ id: 'RESCUE', title: 'قهرمان نجات کوهستان', icon: '🏅', desc: 'داروها سالم و به‌موقع به درمانگاه رسیدند.' });
    if (maxForceN <= puller.limitN * 0.6) {
      badges.push({ id: 'LOW_FORCE', title: 'مهندسِ نیروی کم', icon: '⚡', desc: 'در هیچ مرحله‌ای بیش از ۶۰٪ توان کشش لازم نشد.' });
    }
    if (materialsUsed <= budget * 0.6) {
      badges.push({ id: 'THRIFTY', title: 'مصرف هوشمند مصالح', icon: '🪵', desc: 'با کمترین قطعات، بهترین نتیجه گرفته شد.' });
    }
    if (bridgeBeams >= 3) {
      badges.push({ id: 'SAFE', title: 'ایمن و استوار', icon: '🛡️', desc: 'پل میانی با تیرک اضافی، کاملاً پایدار ساخته شد.' });
    }
    if (useRollers && stageC.strands >= 3) {
      badges.push({ id: 'CREATIVE', title: 'طراحی خلاق', icon: '🌟', desc: 'ترکیب هوشمندانهٔ غلتک، سطح شیب‌دار و قرقرهٔ مرکب.' });
    }
  }

  return {
    machine: 'CAPSTONE',
    massKg,
    stages,
    stageA,
    stageB,
    stageC,
    bridgeBeams,
    bridgeStable,
    materialsUsed,
    budget,
    withinBudget,
    maxForceN: round(maxForceN),
    totalWorkJ,
    puller,
    humanLimitN: puller.limitN,
    feasible: success,
    success,
    blockingStage,
    badges,
    insightFa: success
      ? 'یک ماشین پیچیده در دنیای واقعی، زنجیره‌ای از چند ماشین ساده است که هرکدام بخشی از کار را آسان می‌کنند.'
      : blockingStage
        ? `مرحلهٔ «${blockingStage.title}» هنوز به نیروی بیش از توان ${puller.name} نیاز دارد.`
        : !bridgeStable
          ? 'پل میانی با یک تیرک ناپایدار است و گاری واژگون می‌شود؛ دست‌کم ۲ تیرک لازم است.'
          : 'از بودجهٔ مصالح فراتر رفتی؛ طرح را ساده‌تر کن.'
  };
}

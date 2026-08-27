// Deterministic, academically consistent physics simulation for Grade 5 Science (Iranian Curriculum)

export const SURFACES = {
  ROUGH_STONE: {
    id: 'ROUGH_STONE',
    name: 'سنگ صخره‌ای ناهموار',
    frictionCoeff: 0.65,
    icon: '🪨',
    desc: 'سطح طبیعی کوهستان با پستی‌وبلندی‌های زیاد که کشیدن بار را سخت می‌کند.'
  },
  WOOD_PLANKS: {
    id: 'WOOD_PLANKS',
    name: 'تخته‌چوب تراشیده',
    frictionCoeff: 0.35,
    icon: '🪵',
    desc: 'تخته‌های چوبی مسطح که اصطکاک را تا حدی کاهش می‌دهند.'
  },
  SMOOTH_TRACK: {
    id: 'SMOOTH_TRACK',
    name: 'مسیر صیقلی صابونی/روغنی',
    frictionCoeff: 0.16,
    icon: '✨',
    desc: 'مسیر چوبی صاف و صیقلی که سرخوردن بار را آسان‌تر می‌کند.'
  },
  ROLLERS: {
    id: 'ROLLERS',
    name: 'غلتک‌ها و چرخ‌های چوبی',
    frictionCoeff: 0.06,
    icon: '⚙️',
    desc: 'تبدیل مالش به غلتش؛ اصطکاک به کمترین حد ممکن می‌رسد.'
  }
};

export const PULLEY_TYPES = {
  FIXED: {
    id: 'FIXED',
    name: 'قرقره‌ی ثابت',
    icon: '🔘',
    strands: 1,
    frictionLoss: 0.05,
    changesDirection: true,
    desc: 'در یک نقطه محکم شده است. جهت نیرو را تغییر می‌دهد تا کشیدن با وزن بدن آسان‌تر شود، اما مقدار نیرو را کم نمی‌کند.'
  },
  MOVABLE: {
    id: 'MOVABLE',
    name: 'قرقره‌ی متحرک',
    icon: '🔄',
    strands: 2,
    frictionLoss: 0.08,
    changesDirection: false,
    desc: 'همراه با بار بالا می‌رود. چون بار بین ۲ رشته طناب تقسیم می‌شود، نیروی لازم نصف می‌شود ولی مسافت کشیدن ۲ برابر می‌گردد.'
  },
  COMPOUND_2: {
    id: 'COMPOUND_2',
    name: 'قرقره‌ی مرکب (۲ قرقره)',
    icon: '⛓️',
    strands: 3,
    frictionLoss: 0.12,
    changesDirection: true,
    desc: 'ترکیبی از قرقره ثابت و متحرک. هم جهت نیرو را به سمت پایین تغییر می‌دهد و هم نیروی لازم را به یک‌سوم می‌رساند (مسافت ۳ برابر).'
  },
  COMPOUND_4: {
    id: 'COMPOUND_4',
    name: 'سامانه‌ی قرقره‌ی مرکب ۴ تایی',
    icon: '⚙️⚙️',
    strands: 4,
    frictionLoss: 0.15,
    changesDirection: true,
    desc: 'استفاده از ۴ رشته طناب؛ نیروی لازم به حدود یک‌چهارم می‌رسد اما باید ۴ برابر طناب بکشید.'
  }
};

export const G = 10; // m/s^2 for clean Grade 5 classroom calculations

// Helper: Convert digits to standard Persian numerals
export function toPersianDigits(num) {
  if (num === null || num === undefined) return '';
  const str = typeof num === 'number' ? (Number.isInteger(num) ? num.toString() : num.toFixed(1)) : num.toString();
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[+w]).replace(/\./g, '٫');
}

export class PhysicsEngine {
  constructor() {
    this.maxSafeHumanForce = 180; // Newtons - typical comfortable human pulling limit for children/villagers
  }

  // --- 1. Pure Dragging / Flat Rolling ---
  calculateFlatDrag({ cargoMassKg, surfaceType, hasRollers = false }) {
    const surface = hasRollers ? SURFACES.ROLLERS : (SURFACES[surfaceType] || SURFACES.ROUGH_STONE);
    const weightN = cargoMassKg * G;
    const frictionForceN = Math.round(weightN * surface.frictionCoeff);
    const requiredForceN = frictionForceN;
    const isHumanPullable = requiredForceN <= this.maxSafeHumanForce;

    return {
      weightN,
      frictionForceN,
      requiredForceN,
      surface,
      isHumanPullable,
      forceRatioPercent: Math.round((requiredForceN / weightN) * 100),
      explanationFa: hasRollers
        ? 'غلتک‌ها اصطکاک مالشی را به اصطکاک غلتشی تبدیل کردند و نیرو را بسیار کم کردند.'
        : surface.frictionCoeff > 0.5
        ? 'اصطکاک سنگ بسیار زیاد است و کشیدن بار با دست غیرممکن یا طاقت‌فرساست.'
        : 'سطح هموارتر اصطکاک را کم کرد، اما استفاده از چرخ یا غلتک نتیجه بهتری دارد.'
    };
  }

  // --- 2. Inclined Plane (سطح شیب‌دار) ---
  calculateInclinedPlane({ cargoMassKg, heightM, rampLengthM, surfaceType, hasRollers = false }) {
    const surface = hasRollers ? SURFACES.ROLLERS : (SURFACES[surfaceType] || SURFACES.WOOD_PLANKS);
    const weightN = cargoMassKg * G;
    
    // Safety clamp: ramp length must be >= height
    const actualLength = Math.max(heightM, rampLengthM);
    const sinTheta = heightM / actualLength;
    const cosTheta = Math.sqrt(Math.max(0, 1 - sinTheta * sinTheta));
    const angleDeg = Math.round((Math.asin(sinTheta) * 180) / Math.PI);

    // Gravity component along slope + friction along slope
    const idealForceN = weightN * sinTheta;
    const frictionForceN = weightN * cosTheta * surface.frictionCoeff;
    const totalRequiredForceN = Math.round(idealForceN + frictionForceN);

    // Mechanical advantage & distance
    const distanceM = Number(actualLength.toFixed(1));
    const directLiftForceN = weightN;
    const forceReductionPercent = Math.max(0, Math.round(((directLiftForceN - totalRequiredForceN) / directLiftForceN) * 100));
    
    const workIdealJ = Math.round(weightN * heightM);
    const workActualJ = Math.round(totalRequiredForceN * distanceM);
    const isHumanPullable = totalRequiredForceN <= this.maxSafeHumanForce;

    return {
      weightN,
      heightM,
      distanceM,
      angleDeg,
      idealForceN: Math.round(idealForceN),
      frictionForceN: Math.round(frictionForceN),
      totalRequiredForceN,
      directLiftForceN,
      forceReductionPercent,
      workIdealJ,
      workActualJ,
      isHumanPullable,
      surface,
      summaryFa: `برای بالا بردن بار تا ارتفاع ${toPersianDigits(heightM)} متر با شیب ${toPersianDigits(angleDeg)} درجه، نیروی ${toPersianDigits(totalRequiredForceN)} نیوتون در مسافت ${toPersianDigits(distanceM)} متر لازم است.`
    };
  }

  // --- 3. Lever (اهرم) ---
  calculateLever({ cargoMassKg, totalBeamLengthM = 3.0, fulcrumPosM = 1.0, loadPosM = 0.2, effortPosM = 3.0 }) {
    const weightN = cargoMassKg * G;
    
    // Distances from fulcrum
    const loadArmM = Math.max(0.1, Math.abs(fulcrumPosM - loadPosM));
    const effortArmM = Math.max(0.1, Math.abs(effortPosM - fulcrumPosM));

    // Torque balance: W * d_load = F_effort * d_effort
    const idealEffortForceN = (weightN * loadArmM) / effortArmM;
    const fulcrumFrictionN = 10; // small realistic hinge resistance
    const totalRequiredForceN = Math.round(idealEffortForceN + fulcrumFrictionN);

    const mechanicalAdvantage = Number((effortArmM / loadArmM).toFixed(2));
    const loadLiftHeightM = 0.3; // target boulder lift
    const effortTravelDistanceM = Number((loadLiftHeightM * (effortArmM / loadArmM)).toFixed(2));
    const isHumanPullable = totalRequiredForceN <= this.maxSafeHumanForce;

    // Classification of lever
    let leverClassFa = 'اهرم نوع اول (تکیه‌گاه بین بار و نیرو)';
    if (loadPosM > fulcrumPosM && effortPosM > loadPosM) {
      leverClassFa = 'اهرم نوع دوم (بار بین تکیه‌گاه و نیرو)';
    } else if (effortPosM > fulcrumPosM && loadPosM > effortPosM) {
      leverClassFa = 'اهرم نوع سوم (نیرو بین تکیه‌گاه و بار)';
    }

    return {
      weightN,
      loadArmM: Number(loadArmM.toFixed(2)),
      effortArmM: Number(effortArmM.toFixed(2)),
      totalRequiredForceN,
      mechanicalAdvantage,
      loadLiftHeightM,
      effortTravelDistanceM,
      isHumanPullable,
      leverClassFa,
      summaryFa: `بازوی بار: ${toPersianDigits(loadArmM)} متر | بازوی نیرو: ${toPersianDigits(effortArmM)} متر | نیروی لازم: ${toPersianDigits(totalRequiredForceN)} نیوتون.`
    };
  }

  // --- 4. Pulley System (قرقره‌ها) ---
  calculatePulley({ cargoMassKg, liftHeightM = 4.0, pulleyTypeId = 'FIXED' }) {
    const pulley = PULLEY_TYPES[pulleyTypeId] || PULLEY_TYPES.FIXED;
    const weightN = cargoMassKg * G;
    
    const idealForceN = weightN / pulley.strands;
    const frictionForceN = idealForceN * pulley.frictionLoss;
    const totalRequiredForceN = Math.round(idealForceN + frictionForceN);

    const ropePullDistanceM = Number((liftHeightM * pulley.strands).toFixed(1));
    const isHumanPullable = totalRequiredForceN <= this.maxSafeHumanForce;
    const forceReductionPercent = Math.max(0, Math.round(((weightN - totalRequiredForceN) / weightN) * 100));

    return {
      weightN,
      liftHeightM,
      pulley,
      strands: pulley.strands,
      ropePullDistanceM,
      totalRequiredForceN,
      isHumanPullable,
      forceReductionPercent,
      changesDirection: pulley.changesDirection,
      summaryFa: `قرقره با ${toPersianDigits(pulley.strands)} رشته طناب؛ نیروی لازم: ${toPersianDigits(totalRequiredForceN)} نیوتون، طول طنابی که باید کشیده شود: ${toPersianDigits(ropePullDistanceM)} متر.`
    };
  }

  // --- 5. Capstone / Multi-Stage Rescue ---
  calculateCapstone({
    cargoMassKg = 60,
    stage1RampLength = 5,
    stage1UseRollers = true,
    stage2BridgeBeamCount = 2,
    stage3PulleyType = 'MOVABLE',
    materialsUsedCount = 5,
    materialsBudgetMax = 8
  }) {
    const height1 = 2.0; // Stage 1 cliff
    const height3 = 3.0; // Stage 3 tower

    const stage1 = this.calculateInclinedPlane({
      cargoMassKg,
      heightM: height1,
      rampLengthM: stage1RampLength,
      surfaceType: 'WOOD_PLANKS',
      hasRollers: stage1UseRollers
    });

    const stage3 = this.calculatePulley({
      cargoMassKg,
      liftHeightM: height3,
      pulleyTypeId: stage3PulleyType
    });

    // Bridge stability
    const bridgeStable = stage2BridgeBeamCount >= 2;
    const maxForceEncountered = Math.max(stage1.totalRequiredForceN, stage3.totalRequiredForceN);
    const overallSuccess = stage1.isHumanPullable && stage3.isHumanPullable && bridgeStable && (materialsUsedCount <= materialsBudgetMax);

    // Determine earned badges
    const badges = [];
    if (bridgeStable && maxForceEncountered < 150) {
      badges.push({ id: 'SAFE', title: 'ایمن و استوار', icon: '🛡️', desc: 'مسیر کاملاً پایدار و بدون خطر واژگونی طراحی شد.' });
    }
    if (maxForceEncountered <= 110) {
      badges.push({ id: 'LOW_FORCE', title: 'نیروی کم و بهینه', icon: '⚡', desc: 'نیروی لازم برای جابجایی بار به حداقل مقدار ممکن رسید.' });
    }
    if (materialsUsedCount <= 5 && overallSuccess) {
      badges.push({ id: 'SMART_MATERIALS', title: 'مصرف هوشمند مصالح', icon: '🪵', desc: 'با کمترین تعداد قطعات، بهترین بهره‌وری به دست آمد.' });
    }
    if (stage1UseRollers && stage3PulleyType === 'COMPOUND_2') {
      badges.push({ id: 'CREATIVE', title: 'طراحی خلاق و چابک', icon: '🌟', desc: 'ترکیب هوشمندانه‌ی چند ماشین ساده برای نجات بار.' });
    }
    if (badges.length === 0 && overallSuccess) {
      badges.push({ id: 'RESCUE_HERO', title: 'قهرمان نجات کوهستان', icon: '🏅', desc: 'داروها سالم و به‌موقع به درمانگاه رسیدند!' });
    }

    return {
      overallSuccess,
      stage1,
      stage3,
      bridgeStable,
      maxForceEncountered,
      materialsUsedCount,
      materialsBudgetMax,
      badges
    };
  }
}

export const physics = new PhysicsEngine();

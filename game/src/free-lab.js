// Free Invention Lab (کارگاه آزاد مخترع)
import { SURFACES, PULLEY_TYPES, toPersianDigits, physics } from './physics.js';

export const CURIOSITY_CARDS = [
  {
    id: 'c1',
    title: 'کنجکاوی ۱: رمپ فوق‌العاده طولانی',
    prompt: 'طول سطح شیب‌دار را روی حداکثر (۶٫۵ متر) بگذار و غلتک‌ها را فعال کن. ببین نیرو چقدر کم می‌شود!',
    check: (state) => state.workbenchType === 'INCLINED_PLANE' && state.rampLengthM >= 6.0 && state.hasRollers,
    reward: 'شگفت‌انگیز! نیرو به کمتر از ۶۰ نیوتون رسید، اما مسافت کشیدن ۶٫۵ متر شد!'
  },
  {
    id: 'c2',
    title: 'کنجکاوی ۲: اهرم نامتعادل',
    prompt: 'در بخش اهرم، تکیه‌گاه را در نزدیک‌ترین حالت به بار سنگین (۰٫۴ متر) قرار بده و ببین چقدر نیرو کم می‌شود.',
    check: (state) => state.workbenchType === 'LEVER' && state.loadArmM <= 0.5,
    reward: 'عالی بود! بازوی نیرو بسیار بلند شد و حتی سنگ سنگین ۱۰۰ کیلویی به سادگی بلند می‌شود!'
  },
  {
    id: 'c3',
    title: 'کنجکاوی ۳: سامانه قرقره مرکب ۴ تایی',
    prompt: 'در بخش قرقره، سامانه ۴ تایی را انتخاب کن و طول طناب کشیده‌شده را با قرقره ثابت مقایسه کن.',
    check: (state) => state.workbenchType === 'PULLEY' && state.selectedPulley === 'COMPOUND_4',
    reward: 'دیدید؟ با ۴ رشته طناب، نیرو یک‌چهارم شد ولی مسافت ۴ برابر گردید!'
  }
];

export class FreeLabManager {
  constructor() {
    this.state = {
      workbenchType: 'INCLINED_PLANE', // 'FLAT_DRAG', 'INCLINED_PLANE', 'LEVER', 'PULLEY'
      cargoMassKg: 50,
      surfaceType: 'WOOD_PLANKS',
      hasRollers: false,
      rampLengthM: 4.0,
      heightM: 2.0,
      beamLengthM: 3.0,
      fulcrumPosM: 1.0,
      selectedPulley: 'MOVABLE',
      curiosityUnlocked: []
    };
  }

  calculateCurrentState() {
    const s = this.state;
    if (s.workbenchType === 'FLAT_DRAG') {
      return {
        ...s,
        ...physics.calculateFlatDrag({
          cargoMassKg: s.cargoMassKg,
          surfaceType: s.surfaceType,
          hasRollers: s.hasRollers
        })
      };
    } else if (s.workbenchType === 'INCLINED_PLANE') {
      return {
        ...s,
        ...physics.calculateInclinedPlane({
          cargoMassKg: s.cargoMassKg,
          heightM: s.heightM,
          rampLengthM: s.rampLengthM,
          surfaceType: s.surfaceType,
          hasRollers: s.hasRollers
        })
      };
    } else if (s.workbenchType === 'LEVER') {
      return {
        ...s,
        ...physics.calculateLever({
          cargoMassKg: s.cargoMassKg,
          totalBeamLengthM: s.beamLengthM,
          fulcrumPosM: s.fulcrumPosM,
          loadPosM: 0.2,
          effortPosM: s.beamLengthM
        })
      };
    } else if (s.workbenchType === 'PULLEY') {
      return {
        ...s,
        ...physics.calculatePulley({
          cargoMassKg: s.cargoMassKg,
          liftHeightM: 4.0,
          pulleyTypeId: s.selectedPulley
        })
      };
    }
    return s;
  }
}

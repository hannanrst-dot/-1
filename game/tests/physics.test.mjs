// تست‌های موتور فیزیک — اجرا با:  node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  G, solve, friction, inclinedPlane, lever, leverClass,
  pulley, wheelAxle, wedge, screw, gears, MACHINE_IDS, SURFACES, PULLEYS
} from '../src/physics/machines.js';
import { capstone } from '../src/physics/capstone.js';
import { fa, num, round, clamp, mapRange } from '../src/core/format.js';

const near = (a, b, tol = 0.06) =>
  assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≉ ${b}`);

test('قالب‌بندی: ارقام فارسی و گرد کردن', () => {
  assert.equal(fa('2.5'), '۲٫۵');
  assert.equal(num(1234.56), '۱۲۳۵');
  assert.equal(num(2.345), '۲٫۳۵');
  assert.equal(round(-0.001, 1), 0);
  assert.equal(clamp(15, 0, 10), 10);
  assert.equal(mapRange(5, 0, 10, 0, 100), 50);
});

test('اصطکاک: نیرو = ضریب اصطکاک × وزن', () => {
  const r = friction({ massKg: 50, surfaceId: 'ROUGH_STONE' });
  assert.equal(r.loadN, 50 * G);
  near(r.effortN, 500 * SURFACES.ROUGH_STONE.mu);
});

test('اصطکاک: غلتک نیروی لازم را به‌شدت کم می‌کند', () => {
  const stone = friction({ massKg: 50, surfaceId: 'ROUGH_STONE' });
  const rollers = friction({ massKg: 50, surfaceId: 'ROUGH_STONE', useRollers: true });
  assert.ok(rollers.effortN < stone.effortN / 5);
  assert.ok(rollers.savedPercent > 85);
});

test('سطح شیب‌دار: رمپ درازتر ⇒ نیروی کمتر و مسافت بیشتر', () => {
  const short = inclinedPlane({ massKg: 50, heightM: 2, lengthM: 3, surfaceId: 'WOOD_PLANKS' });
  const long = inclinedPlane({ massKg: 50, heightM: 2, lengthM: 6, surfaceId: 'WOOD_PLANKS' });
  assert.ok(long.effortN < short.effortN);
  assert.ok(long.effortDistanceM > short.effortDistanceM);
  assert.ok(long.maIdeal > short.maIdeal);
});

test('سطح شیب‌دار بدون اصطکاک: F = W × sin(θ) و کار پایسته است', () => {
  const r = inclinedPlane({ massKg: 100, heightM: 2, lengthM: 4, surfaceId: 'ROUGH_STONE', useRollers: false });
  const ideal = inclinedPlane({ massKg: 100, heightM: 2, lengthM: 4, surfaceId: 'ICE' });
  near(r.effortIdealN, 1000 * (2 / 4));
  // کارِ آرمانی (نیروی آرمانی × طول رمپ) برابر کارِ بلند کردن مستقیم است
  near(ideal.effortIdealN * ideal.effortDistanceM, ideal.loadN * ideal.loadDistanceM);
});

test('سطح شیب‌دار: طول کمتر از ارتفاع پذیرفته نمی‌شود', () => {
  const r = inclinedPlane({ massKg: 50, heightM: 3, lengthM: 1 });
  assert.ok(r.lengthM >= 3);
  assert.ok(r.angleDeg <= 90);
});

test('اهرم: تعادل گشتاور W×d₁ = F×d₂', () => {
  const r = lever({ massKg: 100, beamLengthM: 3, fulcrumM: 0.5, loadM: 0.1, effortM: 3, liftHeightM: 0.2 });
  near(r.loadArmM, 0.4);
  near(r.effortArmM, 2.5);
  near(r.effortIdealN, (1000 * 0.4) / 2.5);
  near(r.maIdeal, 2.5 / 0.4);
});

test('اهرم: نزدیک کردن تکیه‌گاه به بار، نیرو را کم می‌کند', () => {
  const far = lever({ massKg: 80, fulcrumM: 2.2, loadM: 0.3, effortM: 3 });
  const close = lever({ massKg: 80, fulcrumM: 0.6, loadM: 0.3, effortM: 3 });
  assert.ok(close.effortN < far.effortN);
});

test('اهرم: تشخیص درست نوع اول، دوم و سوم', () => {
  assert.equal(leverClass(1.5, 0.2, 3).type, 1);
  assert.equal(leverClass(0, 1.5, 3).type, 2);
  assert.equal(leverClass(0, 3, 1.5).type, 3);
  assert.ok(lever({ fulcrumM: 0, loadM: 3, effortM: 1 }).maIdeal < 1);
});

test('قرقره: قرقرهٔ ثابت نیرو را کم نمی‌کند، فقط جهت را عوض می‌کند', () => {
  const r = pulley({ massKg: 60, systemId: 'FIXED', liftHeightM: 4 });
  assert.equal(r.maIdeal, 1);
  assert.ok(r.effortN >= r.loadN);          // با احتساب اصطکاک، حتی کمی بیشتر
  assert.equal(r.ropeM, 4);
  assert.equal(r.changesDirection, true);
});

test('قرقره: مزیت مکانیکی برابر تعداد رشته‌هاست و طناب به همان نسبت بلندتر', () => {
  for (const id of ['MOVABLE', 'COMPOUND_2', 'COMPOUND_3', 'COMPOUND_4']) {
    const r = pulley({ massKg: 60, systemId: id, liftHeightM: 4 });
    assert.equal(r.maIdeal, PULLEYS[id].strands);
    near(r.effortIdealN, 600 / PULLEYS[id].strands);
    near(r.ropeM, 4 * PULLEYS[id].strands);
  }
});

test('چرخ و محور: مزیت مکانیکی = شعاع چرخ ÷ شعاع محور', () => {
  const r = wheelAxle({ massKg: 40, wheelRadiusM: 0.6, axleRadiusM: 0.1, liftHeightM: 3 });
  near(r.maIdeal, 6);
  near(r.effortIdealN, 400 / 6);
  assert.ok(r.effortDistanceM > r.loadDistanceM);
});

test('گوه: باریک‌تر و بلندتر ⇒ نیروی کمتر', () => {
  const thick = wedge({ resistanceN: 900, lengthM: 0.2, thicknessM: 0.1 });
  const thin = wedge({ resistanceN: 900, lengthM: 0.3, thicknessM: 0.04 });
  assert.ok(thin.effortN < thick.effortN);
  near(thin.maIdeal, 0.3 / 0.04);
});

test('پیچ: مزیت مکانیکی = محیط دستگیره ÷ گام', () => {
  const r = screw({ massKg: 300, pitchM: 0.01, handleRadiusM: 0.35, liftHeightM: 0.2 });
  near(r.maIdeal, (2 * Math.PI * 0.35) / 0.01);
  assert.equal(r.turns, 20);
  assert.ok(r.effortN < r.loadN / 20);
});

test('چرخ‌دنده: گشتاور و سرعت معکوس هم تغییر می‌کنند', () => {
  const r = gears({ driverTeeth: 12, drivenTeeth: 36, inputTorqueNm: 10, inputRpm: 60 });
  near(r.ratio, 3);
  near(r.outputRpm, 20);
  assert.ok(r.outputTorqueNm > r.inputTorqueNm);
});

test('پایستگی انرژی: کار ورودی هرگز کمتر از کار مفید نیست', () => {
  const cases = [
    inclinedPlane({ massKg: 60, heightM: 2, lengthM: 5 }),
    lever({ massKg: 80, fulcrumM: 0.6 }),
    pulley({ massKg: 60, systemId: 'COMPOUND_4' }),
    wheelAxle({ massKg: 40 }),
    wedge({}),
    screw({})
  ];
  for (const r of cases) {
    assert.ok(r.workInJ >= r.workOutJ - 1e-6, `${r.machine}: کار ورودی ${r.workInJ} < کار مفید ${r.workOutJ}`);
    assert.ok(r.efficiency > 0 && r.efficiency <= 1, `${r.machine}: بازدهٔ نامعتبر ${r.efficiency}`);
    assert.ok(r.energyLostJ >= 0);
  }
});

test('حل‌کنندهٔ یکپارچه برای همهٔ ماشین‌ها کار می‌کند', () => {
  for (const id of MACHINE_IDS) {
    const r = solve(id);
    assert.equal(r.machine, id);
    assert.ok(typeof r.insightFa === 'string' && r.insightFa.length > 10);
  }
  assert.throws(() => solve('NOPE'));
});

test('توان کشش: انتخاب نیروی کشندهٔ قوی‌تر، آزمایش را شدنی می‌کند', () => {
  const child = pulley({ massKg: 60, systemId: 'COMPOUND_2', pullerId: 'CHILD' });
  const team = pulley({ massKg: 60, systemId: 'COMPOUND_2', pullerId: 'TEAM' });
  assert.equal(child.feasible, false);
  assert.equal(team.feasible, true);
});

test('مأموریت پایانی: طرح خوب موفق و طرح ضعیف مردود می‌شود', () => {
  const good = capstone({
    massKg: 60, surfaceId: 'WOOD_PLANKS', useRollers: true,
    rampLengthM: 7, bridgeBeams: 2, pulleySystemId: 'COMPOUND_3', pullerId: 'ADULT'
  });
  assert.equal(good.success, true);
  assert.ok(good.badges.length >= 1);
  assert.ok(good.totalWorkJ > 0);

  const weak = capstone({
    massKg: 60, surfaceId: 'ROUGH_STONE', useRollers: false,
    rampLengthM: 2.5, bridgeBeams: 1, pulleySystemId: 'FIXED', pullerId: 'CHILD'
  });
  assert.equal(weak.success, false);
  assert.ok(weak.blockingStage);
});

test('مأموریت پایانی: فراتر رفتن از بودجهٔ مصالح، طرح را رد می‌کند', () => {
  const r = capstone({ rampLengthM: 8, bridgeBeams: 4, pulleySystemId: 'COMPOUND_4', useRollers: true, budget: 8 });

  assert.ok(r.materialsUsed > 8);
  assert.equal(r.withinBudget, false);
  assert.equal(r.success, false);
});

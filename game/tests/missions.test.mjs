// تست‌های محتوای مأموریت‌ها: هر مأموریت باید در آغاز حل‌نشده و با ابزارهای موجود حل‌شدنی باشد
import test from 'node:test';
import assert from 'node:assert/strict';

import { MISSIONS } from '../src/content/missions.js';
import { MACHINE_CONTROLS, DEFAULT_PARAMS, resolveParams, describeSetup } from '../src/content/controls.js';
import { solve, MACHINE_IDS } from '../src/physics/machines.js';
import { capstone } from '../src/physics/capstone.js';

function run(machine, params) {
  const p = resolveParams(machine, params);
  return machine === 'CAPSTONE' ? capstone(p) : solve(machine, p);
}

const passes = (mission, result) =>
  mission.goalTest ? mission.goalTest(result) : result.feasible;

test('هر ماشین ساده دقیقاً یک مأموریت دارد', () => {
  const machines = MISSIONS.map((m) => m.machine);
  for (const id of MACHINE_IDS) assert.ok(machines.includes(id), `مأموریتی برای ${id} نیست`);
  assert.ok(machines.includes('CAPSTONE'));
  assert.equal(new Set(MISSIONS.map((m) => m.id)).size, MISSIONS.length);
});

test('ساختار محتوای هر مأموریت کامل است', () => {
  for (const m of MISSIONS) {
    assert.ok(m.title && m.subtitle && m.icon, `${m.id}: عنوان ناقص`);
    assert.ok(m.story.text.length > 30, `${m.id}: متن داستان کوتاه است`);
    assert.equal(m.hints.length, 3, `${m.id}: باید سه پلهٔ راهنمایی داشته باشد`);
    assert.equal(m.prediction.options.length, 3, `${m.id}: باید سه گزینهٔ پیش‌بینی داشته باشد`);
    assert.equal(m.prediction.options.filter((o) => o.correct).length, 1, `${m.id}: باید دقیقاً یک گزینهٔ درست باشد`);
    assert.ok(m.discovery.summary.length > 40, `${m.id}: خلاصهٔ کارت کشف کوتاه است`);
    for (const key of m.controls) {
      const list = MACHINE_CONTROLS[m.machine] || [];
      assert.ok(list.some((c) => c.key === key), `${m.id}: کنترل ${key} برای ${m.machine} تعریف نشده`);
    }
  }
});

test('هیچ مأموریتی در حالت آغازین حل‌شده نیست', () => {
  for (const m of MISSIONS) {
    const r = run(m.machine, m.params);
    assert.equal(passes(m, r), false, `${m.id} از همان اول حل شده است`);
  }
});

test('هر مأموریت با تنظیم کنترل‌های در دسترس حل‌شدنی است', () => {
  // بهترین حالتِ ممکن با کنترل‌های هر مأموریت
  const best = {
    M1: { surfaceId: 'ROUGH_STONE', useRollers: true },
    M2: { lengthM: 10, useRollers: true },
    M3: { beamLengthM: 4, fulcrumM: 0.4 },
    M4: { systemId: 'COMPOUND_4' },
    M5: { wheelRadiusM: 0.8, axleRadiusM: 0.03 },
    M6: { lengthM: 0.4, thicknessM: 0.01 },
    M7: { pitchM: 0.002, handleRadiusM: 0.6 },
    M8: { driverTeeth: 8, drivenTeeth: 60 },
    M9: { surfaceId: 'WOOD_PLANKS', useRollers: true, rampLengthM: 7, bridgeBeams: 2, pulleySystemId: 'COMPOUND_3' }
  };
  for (const m of MISSIONS) {
    const r = run(m.machine, { ...m.params, ...best[m.id] });
    assert.ok(passes(m, r), `${m.id} با بهترین تنظیمات هم حل نشد`);
  }
});

test('راهنماییِ پلهٔ آخر هر مأموریت به یک کنترل واقعی اشاره دارد', () => {
  for (const m of MISSIONS) {
    assert.ok(m.hints[2].length > 20, `${m.id}: راهنمایی آخر خیلی کوتاه است`);
  }
});

test('توصیف پیکربندی برای همهٔ ماشین‌ها متن معتبر می‌دهد', () => {
  for (const m of MISSIONS) {
    const p = resolveParams(m.machine, m.params);
    const r = run(m.machine, m.params);
    const text = describeSetup(m.machine, p, r);
    assert.ok(typeof text === 'string' && text.length > 3, `${m.machine}: توصیف نامعتبر`);
  }
});

test('پارامترهای پیش‌فرض آزمایشگاه برای همهٔ ماشین‌ها معتبرند', () => {
  for (const id of MACHINE_IDS) {
    assert.ok(DEFAULT_PARAMS[id], `${id}: پارامتر پیش‌فرض ندارد`);
    const r = solve(id, resolveParams(id, DEFAULT_PARAMS[id]));
    assert.ok(r.machine === id);
    for (const c of MACHINE_CONTROLS[id]) {
      assert.ok(c.key in DEFAULT_PARAMS[id], `${id}: مقدار پیش‌فرض برای ${c.key} نیست`);
      if (c.kind === 'slider') {
        const v = DEFAULT_PARAMS[id][c.key];
        assert.ok(v >= c.min && v <= c.max, `${id}.${c.key}: مقدار ${v} خارج از بازهٔ لغزنده است`);
      }
    }
  }
});

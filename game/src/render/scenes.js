// صحنهٔ هر ماشین ساده — یک نمودار فیزیکِ دقیق، نه یک تصویر تزئینی.
// هر صحنه هندسه را از روی اعداد واقعی می‌سازد و ابزارهای اندازه‌گیری را نشان می‌دهد.
import {
  rr, grad, label, arrow, dim, angleArc, plank, crate, rope, sheave, gear, person, gauge
} from './draw.js';
import { drawWorld, wall, platform } from './world.js';
import { num, fa, clamp, lerp } from '../core/format.js';

const N = (x) => `${num(x, 0)} نیوتون`;

/** جای خط زمین در هر صحنه (نسبت به ارتفاع بوم) */
export const GROUND_RATIO = {
  FRICTION: 0.66, INCLINED_PLANE: 0.84, LEVER: 0.86, PULLEY: 0.92,
  WHEEL_AXLE: 0.90, WEDGE: 0.70, SCREW: 0.86, GEARS: 0.95
};

/** ضریب بزرگ‌نمایی پیکره‌ها متناسب با اندازهٔ بوم */
const zoom = (h) => clamp(h / 620, 0.85, 2.1);

/** ارتفاع امن برای برچسب‌های زیر خط زمین */
const under = (gy, h, off = 30) => Math.min(gy + off, h - 15);

/** نوار سطح مسیر */
function surfaceStrip(ctx, x0, x1, y, surface, P, thickness = 11) {
  ctx.save();
  ctx.fillStyle = surface.id === 'ICE'
    ? grad(ctx, 0, y - thickness, 0, y + 3, [[0, '#e8f6fd'], [1, '#a9d4e8']])
    : surface.id === 'ROUGH_STONE'
      ? grad(ctx, 0, y - thickness, 0, y + 3, [[0, '#a49a8f'], [1, '#726a60']])
      : grad(ctx, 0, y - thickness, 0, y + 3, [[0, P.woodLight], [1, P.woodDark]]);
  rr(ctx, x0, y - thickness, x1 - x0, thickness + 3, 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.20)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 1.2;
  if (surface.id === 'ROUGH_STONE') {
    for (let x = x0 + 6; x < x1; x += 12) {
      ctx.beginPath(); ctx.moveTo(x, y - thickness + 2); ctx.lineTo(x + 3, y - thickness + 6); ctx.lineTo(x - 2, y); ctx.stroke();
    }
  } else if (surface.id === 'WOOD_PLANKS' || surface.id === 'SMOOTH_TRACK') {
    for (let x = x0 + 30; x < x1; x += 34) { ctx.beginPath(); ctx.moveTo(x, y - thickness); ctx.lineTo(x, y + 2); ctx.stroke(); }
  }
  ctx.restore();
}

/** غلتک‌های چوبی زیر بار */
function rollers(ctx, cx, y, width, spin, P, z = 1) {
  const r = 8 * z;
  const count = Math.max(3, Math.round(width / 26));
  for (let i = 0; i < count; i++) {
    const x = cx - width / 2 + (width / (count - 1)) * i;
    ctx.save();
    ctx.translate(x, y - r);
    ctx.rotate(spin);
    ctx.fillStyle = grad(ctx, -r, -r, r, r, [[0, P.woodLight], [1, P.woodDark]]);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = P.woodDark; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * 0.7, 0); ctx.lineTo(r * 0.7, 0); ctx.stroke();
    ctx.restore();
  }
}

/** بردارهای نیرو روی بار؛ angle = راستای حرکت بار */
function forceVectors(ctx, cx, cy, state, P, opts = {}) {
  const { angle = Math.PI, showNormal = true } = opts;
  const maxF = Math.max(state.loadN, state.effortN, state.frictionN, 1);
  const len = (f) => clamp(Math.sqrt(clamp(f, 0, maxF) / maxF) * 82, 28, 90);
  const A = (dx, dy, f, color, text, extra = {}) =>
    arrow(ctx, cx, cy, cx + dx * len(f), cy + dy * len(f),
      { color, width: 3.2, text, textSize: 10, labelAt: 'tip', ...extra });

  A(0, 1, state.loadN, P.load, `وزن ${N(state.loadN)}`);
  if (showNormal && state.machine !== 'PULLEY') {
    A(-Math.sin(angle), Math.cos(angle), state.loadN * Math.abs(Math.cos(angle)), P.normal, 'نیروی تکیه‌گاه', { dashed: true, width: 2.4 });
  }
  if (state.frictionN > 0.5) {
    A(-Math.cos(angle), -Math.sin(angle), state.frictionN, P.friction, `اصطکاک ${N(state.frictionN)}`, { width: 2.6 });
  }
  if (state.effortN > 0.5) {
    A(Math.cos(angle), Math.sin(angle), state.effortN, P.effort, `نیروی ما ${N(state.effortN)}`, { width: 3.6 });
  }
}

/** شمارندهٔ مسافتِ زنده هنگام اجرای حرکت */
function travelReadout(ctx, x, y, title, doneM, totalM, color, P) {
  label(ctx, x, y, `${title}: ${fa(num(doneM, 2))} از ${fa(num(totalM, 2))} متر`, { size: 10.5, color });
}

// ══════════════ ۱) اصطکاک، چرخ و غلتک ══════════════
function sceneFriction(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, showDims } = env;
  const z = zoom(h);
  const x0 = w * 0.74, x1 = w * 0.24;
  const size = clamp((38 + state.massKg * 0.3) * z, 44, h * 0.22);
  const cx = lerp(x0, x1, t);
  const cy = gy - size * 0.41 - (state.useRollers ? 16 * z : 0);

  surfaceStrip(ctx, w * 0.12, w * 0.88, gy, state.surface, P, 11 * z);
  if (state.useRollers) rollers(ctx, cx, gy, size * 1.1, -t * 26, P, z);
  crate(ctx, cx, cy, size, 0, P, { massKg: state.massKg });

  const hand = person(ctx, cx - size * 0.5 - 78 * z, gy, 92 * z, {
    P, pose: 'pull', dir: 1, t: env.time * 3, effort: clamp(state.effortN / Math.max(state.loadN, 1) * 1.4, 0.15, 1)
  });
  const gx = (hand.x + cx - size * 0.5) / 2;
  rope(ctx, [[hand.x, hand.y], [cx - size * 0.5, cy + size * 0.08]], P, { width: 3.2 });
  gauge(ctx, gx, Math.min(hand.y, cy) - 52 * z, state.effortN, Math.max(state.loadN, state.effortN), P);

  if (showDims && h - gy > 76) {
    dim(ctx, x0, gy + 22, x1, gy + 22, `مسافت ${fa(num(state.geom.distanceM, 2))} متر`, { color: P.inkSoft });
  }
  label(ctx, w * 0.5, under(gy, h, 48),
    `${state.surface.icon} ${state.surface.fullName} — ضریب اصطکاک μ = ${fa(num(state.geom.mu, 2))}`,
    { size: 11 });
  if (t > 0 && t < 1) {
    travelReadout(ctx, w * 0.5, h * 0.10, 'مسافت پیموده‌شده', state.geom.distanceM * t, state.geom.distanceM, P.effort, P);
  }
  if (showVectors) forceVectors(ctx, cx, cy, state, P, { angle: Math.PI });
  return [];
}

// ══════════════ ۲) سطح شیب‌دار ══════════════
function sceneIncline(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, showDims } = env;
  const { heightM, lengthM, angleDeg } = state.geom;

  const mscale = Math.min((w * 0.56) / lengthM, (h * 0.52) / Math.max(heightM, 0.4), 190);
  const hPx = heightM * mscale;
  const lPx = lengthM * mscale;
  const ang = Math.asin(clamp(hPx / lPx, 0, 1));

  const baseX = w * 0.88;
  const topX = baseX - Math.cos(ang) * lPx;
  const topY = gy - hPx;

  // سکوی بلندی که رمپ به آن می‌رسد
  wall(ctx, Math.max(w * 0.03, topX - w * 0.24), topX + 8, topY, gy, P);

  const thick = 12;
  ctx.save();
  ctx.translate(baseX, gy);
  ctx.rotate(ang);
  ctx.fillStyle = state.useRollers
    ? grad(ctx, 0, -thick, 0, 2, [[0, P.woodLight], [1, P.woodDark]])
    : grad(ctx, 0, -thick, 0, 2, [[0, state.surface.color], [1, 'rgba(0,0,0,.35)']]);
  rr(ctx, -lPx, -thick, lPx, thick, 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();

  const size = clamp((36 + state.massKg * 0.24) * zoom(h) * 0.8, 38, 78);
  const bx = lerp(baseX - size * 0.55, topX + size * 0.55, t);
  const by = lerp(gy, topY, t) - thick;

  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(ang);
  if (state.useRollers) rollers(ctx, 0, 0, size * 1.05, -t * 24, P);
  crate(ctx, 0, -size * 0.42 - (state.useRollers ? 15 : 0), size, 0, P, { massKg: state.massKg, shadow: false });
  ctx.restore();

  const hand = person(ctx, topX - 34, topY, clamp(mscale * 1.7, 80, h * 0.30), {
    P, pose: 'pull', dir: 1, t: env.time * 3, effort: clamp(state.effortN / Math.max(state.loadN, 1) * 1.6, 0.15, 1)
  });
  const anchor = [bx - Math.cos(ang) * size * 0.45, by - size * 0.5];
  rope(ctx, [[hand.x, hand.y], anchor], P, { width: 3 });
  gauge(ctx, (hand.x + anchor[0]) / 2 - 8, (hand.y + anchor[1]) / 2 - 34, state.effortN, Math.max(state.loadN, state.effortN), P);

  if (showDims) {
    ctx.save();
    ctx.strokeStyle = P.gridStrong; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(topX, topY); ctx.lineTo(baseX + 46, topY); ctx.stroke();
    ctx.restore();
    dim(ctx, baseX + 38, gy, baseX + 38, topY, `ارتفاع h = ${fa(num(heightM, 2))} متر`, { color: P.load });
    dim(ctx, baseX, gy, topX, topY, `طول رمپ L = ${fa(num(state.lengthM, 2))} متر`, { color: P.effort, offset: 34 });
    angleArc(ctx, baseX, gy, 56, Math.PI, Math.PI + ang, `θ = ${fa(angleDeg)}°`, P.inkSoft);
  }
  if (t > 0 && t < 1) {
    travelReadout(ctx, w * 0.5, h * 0.07, 'بار بالا رفت', heightM * t, heightM, P.load, P);
    travelReadout(ctx, w * 0.5, h * 0.07 + 20, 'طناب کشیده شد', state.lengthM * t, state.lengthM, P.effort, P);
  }
  if (showVectors) forceVectors(ctx, bx, by - size * 0.55, state, P, { angle: Math.PI + ang });

  return [{
    id: 'rampLength', x: topX + 16, y: topY - 26, r: 15,
    hint: 'بالای رمپ را بکش تا شیب عوض شود',
    toValue: (px) => Math.hypot(Math.max(6, baseX - px), hPx) / mscale
  }];
}

// ══════════════ ۳) اهرم ══════════════
function sceneLever(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, showDims } = env;
  const g = state.geom;
  const z = zoom(h);
  const scale = Math.min((w * 0.74) / g.beamLengthM, 230);
  const originX = w * 0.88;
  const X = (m) => originX - m * scale;
  const fx = X(g.fulcrumM);

  // تکیه‌گاه آن‌قدر بلند است که چرخش تیرک دیده شود
  const dxLoad = (g.fulcrumM - g.loadM) * scale;
  const dxEffort = (g.fulcrumM - g.effortM) * scale;
  const liftPx = g.liftHeightM * scale;
  const sinT = clamp(dxLoad > 4 ? liftPx / dxLoad : 0, 0, 0.55);
  const drop = Math.abs(dxEffort) * sinT;             // سرِ نیرو چقدر پایین می‌آید
  const fulcrumH = clamp(Math.max(liftPx, drop) + 46 * z, 74 * z, h * 0.5);
  const beamY = gy - fulcrumH;

  const theta = -Math.asin(sinT) * t;
  const pt = (m) => {
    const dx = X(m) - fx;
    return [fx + dx * Math.cos(theta), beamY + dx * Math.sin(theta)];
  };
  const [lx, ly] = pt(g.loadM);
  const [ex, ey] = pt(g.effortM);

  // تیرک
  ctx.save();
  ctx.translate(fx, beamY);
  ctx.rotate(theta);
  plank(ctx, X(g.beamLengthM) - fx, -7 * z, g.beamLengthM * scale, 14 * z, 0, P);
  ctx.restore();

  // تکیه‌گاه
  const fw = 26 * z;
  ctx.save();
  ctx.fillStyle = grad(ctx, fx - fw, beamY, fx + fw, gy, [[0, P.structure], [1, P.structureDeep]]);
  ctx.beginPath();
  ctx.moveTo(fx, beamY + 2); ctx.lineTo(fx + fw, gy); ctx.lineTo(fx - fw, gy);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = P.structureLine; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
  label(ctx, fx, under(gy, h, 18), 'تکیه‌گاه', { size: 10.5 });

  // بار روی سرِ تیرک
  const size = clamp((32 + state.massKg * 0.2) * z * 0.85, 36, h * 0.16);
  crate(ctx, lx, ly - size * 0.55, size, theta, P, { massKg: state.massKg, shadow: false });

  // کارگر روی زمین، دست‌ها روی سرِ تیرک
  const pDir = ex < fx ? -1 : 1;
  // قد را طوری می‌گیریم که دست دقیقاً به سرِ تیرک برسد
  const ph = clamp((gy - ey) / 0.63, 70, h * 0.34);
  person(ctx, ex - pDir * 0.22 * ph, gy, ph, {
    P, pose: 'push', dir: pDir, t: env.time * 3,
    effort: clamp(state.effortN / Math.max(state.loadN, 1), 0.15, 1)
  });
  gauge(ctx, ex - pDir * 6, ey - 52 * z, state.effortN, Math.max(state.loadN, state.effortN), P);

  if (showDims) {
    const dy = gy + 20;
    dim(ctx, fx, dy, lx, dy, `بازوی بار d_w = ${fa(num(state.loadArmM, 2))} م`, { color: P.load });
    dim(ctx, ex, dy + 24, fx, dy + 24, `بازوی نیرو d_F = ${fa(num(state.effortArmM, 2))} م`, { color: P.effort });
  }
  label(ctx, w * 0.5, h * 0.06, state.leverClass.name, { size: 11.5 });
  if (t > 0 && t < 1) {
    travelReadout(ctx, w * 0.5, h * 0.06 + 22, 'بار بالا رفت', state.loadDistanceM * t, state.loadDistanceM, P.load, P);
    travelReadout(ctx, w * 0.5, h * 0.06 + 42, 'دست پایین رفت', state.effortDistanceM * t, state.effortDistanceM, P.effort, P);
  }

  if (showVectors) {
    const mx = Math.max(state.loadN, state.effortN, 1);
    const L = (f) => clamp(Math.sqrt(f / mx) * 78, 26, 86);
    arrow(ctx, lx, ly - size * 1.1, lx, ly - size * 1.1 + L(state.loadN), { color: P.load, width: 3.2, text: `وزن ${N(state.loadN)}`, labelAt: 'tip', textSize: 10 });
    arrow(ctx, ex, ey - 14, ex, ey - 14 + L(state.effortN), { color: P.effort, width: 3.4, text: `نیروی ما ${N(state.effortN)}`, labelAt: 'tip', textSize: 10 });
    arrow(ctx, fx, gy - 6, fx, gy - 6 - fulcrumH * 0.5, { color: P.normal, width: 2.4, text: 'تکیه‌گاه', dashed: true, labelAt: 'tip', textSize: 10 });
  }

  return [{
    id: 'fulcrum', x: fx, y: gy - fulcrumH * 0.4, r: 20,
    hint: 'تکیه‌گاه را بکش و جابه‌جا کن',
    toValue: (px) => clamp((originX - px) / scale, 0.1, g.beamLengthM - 0.1)
  }];
}

// ══════════════ ۴) قرقره ══════════════
function pulleyLayout(system, geo) {
  const { cx, topY, crateTopY, groundY, R } = geo;
  const L = { top: [], bottom: [], anchor: null, path: [], hand: null, pullDown: system.changesDirection };

  if (system.id === 'NONE') {
    L.hand = [cx + 30, topY + 88];
    L.path = [[cx, crateTopY], L.hand];
    L.pullDown = false;
  } else if (system.id === 'FIXED') {
    const S = [cx, topY + R + 6];
    L.top = [S];
    L.hand = [cx + 132, groundY - 54];
    L.path = [[cx, crateTopY], [S[0] - R, S[1]], [S[0], S[1] - R], [S[0] + R, S[1]], L.hand];
  } else if (system.id === 'MOVABLE') {
    const M = [cx, crateTopY - R - 8];
    L.bottom = [M];
    L.anchor = [cx - R, topY + 10];
    L.hand = [cx + R + 70, topY + 92];
    L.path = [L.anchor, [M[0] - R, M[1]], [M[0], M[1] + R], [M[0] + R, M[1]], L.hand];
    L.pullDown = false;
  } else if (system.id === 'COMPOUND_2') {
    const M = [cx, crateTopY - R - 8];
    const T = [cx + R * 2.6, topY + R + 6];
    L.bottom = [M]; L.top = [T];
    L.anchor = [cx - R, topY + 10];
    L.hand = [T[0] + 112, groundY - 54];
    L.path = [L.anchor, [M[0] - R, M[1]], [M[0], M[1] + R], [M[0] + R, M[1]],
      [T[0] - R, T[1]], [T[0], T[1] - R], [T[0] + R, T[1]], L.hand];
  } else if (system.id === 'COMPOUND_3') {
    const M = [cx, crateTopY - R - 8];
    const T1 = [cx - R * 2.4, topY + R + 6];
    const T2 = [cx + R * 2.4, topY + R + 6];
    L.bottom = [M]; L.top = [T1, T2];
    L.anchor = [M[0] - R * 0.2, M[1] + R + 4];
    L.hand = [T2[0] + 106, groundY - 54];
    L.path = [L.anchor, [T1[0] - R, T1[1]], [T1[0], T1[1] - R], [T1[0] + R, T1[1]],
      [M[0] - R, M[1]], [M[0], M[1] + R], [M[0] + R, M[1]],
      [T2[0] - R, T2[1]], [T2[0], T2[1] - R], [T2[0] + R, T2[1]], L.hand];
  } else {
    const M1 = [cx - R * 1.15, crateTopY - R - 10];
    const M2 = [cx + R * 1.15, crateTopY - R - 10];
    const T1 = [cx - R * 1.15, topY + R + 6];
    const T2 = [cx + R * 1.15, topY + R + 6];
    L.bottom = [M1, M2]; L.top = [T1, T2];
    L.anchor = [cx - R * 2.6, topY + 10];
    L.hand = [T2[0] + 110, groundY - 54];
    L.path = [L.anchor,
      [M1[0] - R, M1[1]], [M1[0], M1[1] + R], [M1[0] + R, M1[1]],
      [T1[0] - R, T1[1]], [T1[0], T1[1] - R], [T1[0] + R, T1[1]],
      [M2[0] - R, M2[1]], [M2[0], M2[1] + R], [M2[0] + R, M2[1]],
      [T2[0] - R, T2[1]], [T2[0], T2[1] - R], [T2[0] + R, T2[1]], L.hand];
  }
  return L;
}

function scenePulley(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, showDims } = env;
  const system = state.system;
  const topY = h * 0.13;
  const cx = w * 0.44;
  const R = 17;
  const size = clamp(36 + state.massKg * 0.24, 40, 66);

  const liftPx = (gy - topY - 118) * t;
  const crateCY = gy - size * 0.42 - liftPx;
  const crateTopY = crateCY - size * 0.41;

  // تیر سقف روی دو پایه
  const beamX0 = w * 0.16, beamX1 = w * 0.86;
  wall(ctx, beamX1 - 26, beamX1 - 2, topY + 8, gy, P);
  wall(ctx, beamX0 + 2, beamX0 + 26, topY + 8, gy, P);
  plank(ctx, beamX0, topY, beamX1 - beamX0, 15, 0, P);

  const L = pulleyLayout(system, { cx, topY, crateTopY, groundY: gy, R });
  rope(ctx, L.path, P, { width: 3.2 });

  const spin = t * 12;
  for (const [sx, sy] of L.top) sheave(ctx, sx, sy, R, spin, P, { mount: 'top' });
  for (const [sx, sy] of L.bottom) sheave(ctx, sx, sy, R, -spin, P, { mount: 'hook' });

  if (L.bottom.length) {
    const mid = L.bottom.length === 1 ? L.bottom[0]
      : [(L.bottom[0][0] + L.bottom[1][0]) / 2, L.bottom[0][1]];
    ctx.save();
    ctx.strokeStyle = P.metalDark; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(mid[0], mid[1] + R + 2); ctx.lineTo(cx, crateTopY); ctx.stroke();
    ctx.restore();
  }
  crate(ctx, cx, crateCY, size, 0, P, { massKg: state.massKg, shadow: t < 0.05 });

  const [hx, hy] = L.hand;
  const effort = clamp(state.effortN / Math.max(state.loadN, 1), 0.15, 1);
  if (L.pullDown) {
    person(ctx, hx + 16, gy, 92, { P, pose: 'pull', dir: -1, t: env.time * 3, effort });
    gauge(ctx, hx - 54, hy - 34, state.effortN, Math.max(state.loadN, state.effortN), P);
  } else {
    platform(ctx, hx + 32, hy + 52, 88, P);
    person(ctx, hx + 22, hy + 52, 86, { P, pose: 'up', dir: -1, t: env.time * 3, effort });
    gauge(ctx, hx - 30, hy - 18, state.effortN, Math.max(state.loadN, state.effortN), P);
    label(ctx, hx + 32, hy + 78, 'بدون تغییر جهت: باید رو به بالا بکشیم', { size: 10 });
  }

  if (showDims) {
    dim(ctx, w * 0.28, gy, w * 0.28, gy - liftPx - 1,
      `بار: ${fa(num(state.loadDistanceM * t, 2))} از ${fa(num(state.loadDistanceM, 2))} متر`, { color: P.load });
  }
  label(ctx, w * 0.5, h * 0.07,
    `${fa(state.strands)} رشتهٔ نگهدارندهٔ بار — طنابی که می‌کشیم ${fa(num(state.effortDistanceM, 2))} متر`,
    { size: 11 });

  if (showVectors) {
    const mx = Math.max(state.loadN, state.effortN, 1);
    const Lf = (f) => clamp(Math.sqrt(f / mx) * 78, 26, 86);
    arrow(ctx, cx, crateCY, cx, crateCY + Lf(state.loadN), { color: P.load, width: 3.2, text: `وزن ${N(state.loadN)}`, labelAt: 'tip', textSize: 10 });
    arrow(ctx, hx, hy, hx, hy + (L.pullDown ? 1 : -1) * Lf(state.effortN), { color: P.effort, width: 3.4, text: `نیروی ما ${N(state.effortN)}`, labelAt: 'tip', textSize: 10 });
  }
  return [];
}

// ══════════════ ۵) چرخ و محور ══════════════
function sceneWheelAxle(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, showDims } = env;
  const g = state.geom;
  const z = zoom(h);
  const cx = w * 0.46;

  // قدِ کارگر مبنای همهٔ ارتفاع‌هاست تا صحنه واقعی به‌نظر برسد
  const ph = clamp(h * 0.40, 100, 300);
  const wellH = 0.30 * ph;
  const wellTop = gy - wellH;
  const axleY = gy - ph * 0.86;                    // محور در ارتفاع سینهٔ کارگر

  // مقیاس متر→پیکسل طوری که چرخ از فاصلهٔ محور تا لبهٔ چاه بزرگ‌تر نشود
  const pxPerM = Math.min(150 * z, (ph * 0.50) / Math.max(g.wheelRadiusM, 0.05));
  const Rpx = Math.max(24, g.wheelRadiusM * pxPerM);
  const rpx = clamp(g.axleRadiusM * pxPerM, 5, Rpx * 0.8);

  // چاه
  wall(ctx, cx - 74 * z, cx + 74 * z, wellTop, gy, P);
  ctx.save();
  ctx.fillStyle = '#2b241d';
  ctx.beginPath(); ctx.ellipse(cx, wellTop, 52 * z, 9 * z, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // پایه‌ها
  plank(ctx, cx - 74 * z, axleY, 12 * z, wellTop - axleY + 4, 0, P);
  plank(ctx, cx + 62 * z, axleY, 12 * z, wellTop - axleY + 4, 0, P);

  const spin = -t * 9;
  // محور
  ctx.save();
  ctx.translate(cx, axleY);
  ctx.fillStyle = grad(ctx, -rpx, -rpx, rpx, rpx, [[0, P.woodLight], [1, P.woodDark]]);
  ctx.beginPath(); ctx.arc(0, 0, rpx, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = P.woodDark; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  // چرخ
  ctx.save();
  ctx.translate(cx, axleY);
  ctx.rotate(spin);
  ctx.strokeStyle = P.wood; ctx.lineWidth = 6 * z;
  ctx.beginPath(); ctx.arc(0, 0, Rpx, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = P.woodDark; ctx.lineWidth = 3.5 * z;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos((i / 6) * Math.PI * 2) * Rpx, Math.sin((i / 6) * Math.PI * 2) * Rpx);
    ctx.stroke();
  }
  ctx.fillStyle = P.metalDark;
  ctx.beginPath(); ctx.arc(Rpx, 0, 7 * z, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // طناب و سطل — پس از چرخ رسم می‌شوند تا جلوتر دیده شوند
  const size = clamp((30 + state.massKg * 0.28) * z * 0.8, 30, ph * 0.30);
  const bucketCY = lerp(wellTop + wellH * 0.9, axleY + rpx + size * 0.62, t);
  rope(ctx, [[cx, axleY], [cx, bucketCY - size * 0.45]], P, { width: 2.6 });
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, wellTop);           // بخشی که داخل چاه است دیده نمی‌شود
  ctx.clip();
  crate(ctx, cx, bucketCY, size, 0, P, { massKg: state.massKg, shadow: false });
  ctx.restore();

  const handleX = cx + Math.cos(spin) * Rpx;
  const handleY = axleY + Math.sin(spin) * Rpx;


  person(ctx, cx + Rpx + 0.22 * ph, gy, ph, {
    P, pose: 'crank', dir: -1, t: env.time * 3,
    effort: clamp(state.effortN / Math.max(state.loadN, 1), 0.15, 1)
  });
  gauge(ctx, cx + Rpx + 0.5 * ph, axleY - 12, state.effortN, Math.max(state.loadN, state.effortN), P);

  if (showDims) {
    dim(ctx, cx, axleY - Rpx - 16, cx + Rpx, axleY - Rpx - 16, `شعاع چرخ R = ${fa(num(g.wheelRadiusM, 2))} م`, { color: P.effort });
    dim(ctx, cx - rpx, axleY - rpx - 6, cx, axleY - rpx - 6, `شعاع محور r = ${fa(num(g.axleRadiusM, 2))} م`, { color: P.load, offset: 30 });
  }
  label(ctx, cx, under(gy, h, 26), `مزیت مکانیکی = R ÷ r = ${fa(num(state.maIdeal, 2))}`, { size: 11 });
  if (t > 0 && t < 1) {
    travelReadout(ctx, w * 0.5, h * 0.06, 'بار بالا رفت', state.loadDistanceM * t, state.loadDistanceM, P.load, P);
    travelReadout(ctx, w * 0.5, h * 0.06 + 20, 'دست پیمود', state.effortDistanceM * t, state.effortDistanceM, P.effort, P);
  }
  if (showVectors) {
    const mx = Math.max(state.loadN, state.effortN, 1);
    const Lf = (f) => clamp(Math.sqrt(f / mx) * 78, 26, 84);
    arrow(ctx, handleX, handleY, handleX, handleY + Lf(state.effortN), { color: P.effort, width: 3.2, text: `نیروی ما ${N(state.effortN)}`, labelAt: 'tip', textSize: 10 });
    arrow(ctx, cx, bucketCY, cx, bucketCY + Lf(state.loadN), { color: P.load, width: 3.2, text: `وزن ${N(state.loadN)}`, labelAt: 'tip', textSize: 10 });
  }
  return [];
}

// ══════════════ ۶) گوه ══════════════
function sceneWedge(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, showDims } = env;
  const g = state.geom;
  const z = zoom(h);
  const scale = 620 * z;
  const wl = clamp(g.lengthM * scale, 70, h * 0.34);
  const wt = clamp(g.thicknessM * scale, 12, wl * 0.7);

  const cx = w * 0.48;
  const logH = clamp(60 * z, 56, h * 0.20);
  const logY = gy - logH * 0.55;
  const logW = w * 0.46;
  const gap = wt * t;

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx + side * (gap / 2), logY);
    ctx.fillStyle = grad(ctx, 0, -logH / 2, 0, logH / 2, [[0, P.woodLight], [1, P.woodDark]]);
    rr(ctx, side === -1 ? -logW / 2 : 0, -logH / 2, logW / 2, logH, 4);
    ctx.fill();
    ctx.strokeStyle = P.woodDark; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 1.3;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(side === -1 ? -logW / 2 + 4 : logW / 2 - 4, 0, i * 11,
        side === -1 ? -1.2 : Math.PI - 1.2, side === -1 ? 1.2 : Math.PI + 1.2);
      ctx.stroke();
    }
    ctx.restore();
  }
  platform(ctx, cx, gy - 8, logW + 18, P);

  const wedgeTop = logY - logH / 2 - wl + (wl + 8) * t;
  ctx.save();
  ctx.translate(cx, wedgeTop);
  ctx.fillStyle = grad(ctx, -wt / 2, 0, wt / 2, wl, [[0, P.metalLight], [1, P.metalDark]]);
  ctx.beginPath();
  ctx.moveTo(-wt / 2, 0); ctx.lineTo(wt / 2, 0); ctx.lineTo(0, wl);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = P.metalDark; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();

  const hand = person(ctx, cx + logW * 0.30, gy, clamp(94 * z, 84, h * 0.30), {
    P, pose: 'hammer', dir: -1, t: env.time * 3,
    effort: clamp(state.effortN / Math.max(state.loadN, 1) * 2, 0.15, 1)
  });
  ctx.save();
  ctx.strokeStyle = P.woodDark; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const mAng = Math.atan2(wedgeTop - 14 - hand.y, cx - hand.x);
  ctx.beginPath();
  ctx.moveTo(hand.x, hand.y);
  ctx.lineTo(hand.x + Math.cos(mAng) * 38, hand.y + Math.sin(mAng) * 38);
  ctx.stroke();
  ctx.fillStyle = P.metalDark;
  ctx.translate(hand.x + Math.cos(mAng) * 44, hand.y + Math.sin(mAng) * 44);
  ctx.rotate(mAng);
  rr(ctx, -11, -8, 22, 16, 3); ctx.fill();
  ctx.restore();
  gauge(ctx, cx - logW * 0.34, wedgeTop + 6, state.effortN, Math.max(state.loadN, state.effortN), P);

  if (showDims) {
    dim(ctx, cx - wt / 2 - 34, wedgeTop, cx - wt / 2 - 34, wedgeTop + wl, `طول گوه L = ${fa(num(g.lengthM * 100, 1))} سانتی‌متر`, { color: P.effort });
    dim(ctx, cx - wt / 2, wedgeTop - 24, cx + wt / 2, wedgeTop - 24, `ضخامت t = ${fa(num(g.thicknessM * 100, 1))} سانتی‌متر`, { color: P.load });
  }
  label(ctx, w * 0.5, under(gy, h, 30), `گوه = سطح شیب‌دارِ متحرک • MA = L ÷ t = ${fa(num(state.maIdeal, 2))}`, { size: 11 });
  if (showVectors) {
    const mx = Math.max(state.loadN, state.effortN, 1);
    const Lf = (f) => clamp(Math.sqrt(f / mx) * 76, 26, 82);
    arrow(ctx, cx, wedgeTop - 22, cx, wedgeTop - 22 + Lf(state.effortN), { color: P.effort, width: 3.4, text: `ضربهٔ ما ${N(state.effortN)}`, labelAt: 'tip', textSize: 10 });
    arrow(ctx, cx - wt / 2 - 6, logY, cx - wt / 2 - 6 - Lf(state.loadN) * 0.6, logY, { color: P.load, width: 3, text: 'مقاومت چوب', labelAt: 'tip', textSize: 10 });
    arrow(ctx, cx + wt / 2 + 6, logY, cx + wt / 2 + 6 + Lf(state.loadN) * 0.6, logY, { color: P.load, width: 3 });
  }
  return [];
}

// ══════════════ ۷) پیچ ══════════════
function sceneScrew(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, showDims } = env;
  const g = state.geom;
  const z = zoom(h);
  const cx = w * 0.46;
  const shaftH = h * 0.34;
  const shaftW = 30 * z;
  const baseY = gy - 8;
  const liftPx = 50 * t;
  const topY = baseY - shaftH - liftPx;

  ctx.save();
  ctx.fillStyle = P.metalDark;
  rr(ctx, cx - 54, baseY - 16, 108, 18, 4); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = grad(ctx, cx - shaftW / 2, 0, cx + shaftW / 2, 0, [[0, P.metalLight], [0.5, P.metal], [1, P.metalDark]]);
  rr(ctx, cx - shaftW / 2, topY, shaftW, baseY - 16 - topY, 3);
  ctx.fill();
  ctx.strokeStyle = P.metalDark; ctx.lineWidth = 1.4; ctx.stroke();
  const pitchPx = clamp(g.pitchM * 900, 6, 26);
  const phase = (t * 240) % pitchPx;
  for (let y = topY + 4 + phase; y < baseY - 18; y += pitchPx) {
    ctx.strokeStyle = 'rgba(0,0,0,.40)'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(cx - shaftW / 2, y); ctx.lineTo(cx + shaftW / 2, y - pitchPx * 0.55); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.42)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - shaftW / 2, y + 2.2); ctx.lineTo(cx + shaftW / 2, y - pitchPx * 0.55 + 2.2); ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = P.metalDark;
  rr(ctx, cx - 44, topY - 12, 88, 14, 4); ctx.fill();
  ctx.restore();
  const rSize = clamp(36 + state.massKg * 0.08, 42, 78);
  ctx.save();
  ctx.fillStyle = grad(ctx, cx - rSize, topY - rSize, cx + rSize, topY, [[0, '#9d958a'], [1, '#645d54']]);
  ctx.beginPath(); ctx.ellipse(cx, topY - 12 - rSize * 0.6, rSize, rSize * 0.62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#544d45'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  label(ctx, cx, topY - 12 - rSize * 1.45, `تخته‌سنگ ${fa(state.massKg)} کیلوگرم`, { size: 10 });

  const ang = t * 10;
  const Rpx = clamp(g.handleRadiusM * 190, 46, 112);
  const handleY = gy - clamp(96 * z, 84, h * 0.30) * 0.62;
  const e1 = [cx + Math.cos(ang) * Rpx, handleY + Math.sin(ang) * Rpx * 0.22];
  const e2 = [cx - Math.cos(ang) * Rpx, handleY - Math.sin(ang) * Rpx * 0.22];
  const near = e1[0] >= e2[0] ? e1 : e2;
  const far = near === e1 ? e2 : e1;
  ctx.save();
  ctx.strokeStyle = P.metalDark; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(far[0], far[1]); ctx.lineTo(near[0], near[1]); ctx.stroke();
  ctx.fillStyle = P.woodDark;
  ctx.beginPath(); ctx.arc(near[0], near[1], 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(far[0], far[1], 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  person(ctx, near[0] + 0.24 * clamp(96 * z, 84, h * 0.30), gy, clamp(96 * z, 84, h * 0.30), {
    P, pose: 'crank', dir: -1, t: env.time * 3,
    effort: clamp(state.effortN / Math.max(state.loadN, 1) * 6, 0.15, 1)
  });
  gauge(ctx, near[0] + 8, handleY - 54, state.effortN, Math.max(state.effortN * 2, 1), P);

  if (showDims) {
    dim(ctx, cx, handleY + 34, cx + Rpx, handleY + 34, `شعاع دسته R = ${fa(num(g.handleRadiusM * 100, 1))} سانتی‌متر`, { color: P.effort });
    label(ctx, cx - shaftW / 2 - 66, topY + 58, `گام پیچ = ${fa(num(g.pitchM * 1000, 1))} میلی‌متر`, { size: 10, color: P.load });
  }
  label(ctx, w * 0.5, under(gy, h, 28), `${fa(state.turns)} دور چرخش برای ${fa(num(state.loadDistanceM, 2))} متر بالا رفتن`, { size: 11 });
  if (showVectors) {
    arrow(ctx, near[0], near[1], near[0], near[1] + 50, { color: P.effort, width: 3.2, text: `نیروی ما ${N(state.effortN)}`, labelAt: 'tip', textSize: 10 });
    arrow(ctx, cx, topY - 18, cx, topY - 18 + 62, { color: P.load, width: 3.2, text: `وزن ${N(state.loadN)}`, labelAt: 'tip', textSize: 10 });
  }
  return [];
}

// ══════════════ ۸) چرخ‌دنده‌ها ══════════════
function sceneGears(ctx, env) {
  const { w, h, P, state, time, t } = env;
  const cy = h * 0.46;
  // اندازه‌ها نسبت واقعی دندانه‌ها را نگه می‌دارند و بعد در کادر جا داده می‌شوند
  const u1 = 1, u2 = state.drivenTeeth / state.driverTeeth;
  const span = 0.885 * (u1 + u2) + u1 + u2;
  const k = Math.min((w * 0.80) / span, (h * 0.38) / Math.max(u1, u2));
  const R1 = u1 * k, r2 = u2 * k;
  const gap = (R1 + r2) * 0.885;
  const x2 = (w - (span * k)) / 2 + r2;
  const x1 = x2 + gap;

  const spin = (time * 0.9 + t * 3) * (state.inputRpm / 60);
  gear(ctx, x1, cy, R1, state.driverTeeth, spin, '#e08a1e', P);
  gear(ctx, x2, cy, r2, state.drivenTeeth, -spin * (state.driverTeeth / state.drivenTeeth) + Math.PI / state.drivenTeeth, '#1a7fb8', P);

  label(ctx, x1, cy + R1 + 24, `چرخ‌دندهٔ محرک — ${fa(state.driverTeeth)} دندانه`, { size: 11 });
  label(ctx, x2, cy + r2 + 24, `چرخ‌دندهٔ متحرک — ${fa(state.drivenTeeth)} دندانه`, { size: 11 });
  label(ctx, x1, cy - R1 - 22, `${fa(state.inputRpm)} دور/دقیقه`, { size: 10.5, color: '#a2560a' });
  label(ctx, x2, cy - r2 - 22, `${fa(num(state.outputRpm, 1))} دور/دقیقه`, { size: 10.5, color: '#0f5f8c' });

  for (const [x, r, dir, color] of [[x1, R1, 1, '#a2560a'], [x2, r2, -1, '#0f5f8c']]) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, cy, r * 0.42, dir > 0 ? -0.6 : Math.PI + 0.6, dir > 0 ? 1.6 : Math.PI - 1.6, dir < 0);
    ctx.stroke();
    ctx.restore();
  }
  return [];
}

export const SCENES = {
  FRICTION: sceneFriction,
  INCLINED_PLANE: sceneIncline,
  LEVER: sceneLever,
  PULLEY: scenePulley,
  WHEEL_AXLE: sceneWheelAxle,
  WEDGE: sceneWedge,
  SCREW: sceneScrew,
  GEARS: sceneGears
};

export { drawWorld };

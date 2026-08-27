// صحنه‌های تعاملی هر ماشین ساده
import {
  rr, grad, label, arrow, dim, angleArc, plank, crate, rope, sheave, gear, person
} from './draw.js';
import { drawWorld, clinic, balcony } from './world.js';
import { num, fa, clamp, lerp } from '../core/format.js';

const N = (v) => `${num(v, 0)} نیوتون`;

/** نوار سطح مسیر با بافت مخصوص هر جنس */
function surfaceStrip(ctx, x0, x1, y, surface, P, thickness = 12) {
  const w = x1 - x0;
  ctx.save();
  ctx.fillStyle = surface.id === 'ICE'
    ? grad(ctx, 0, y - thickness, 0, y + 4, [[0, '#eaf7ff'], [1, '#a8d8ee']])
    : surface.id === 'ROUGH_STONE'
      ? grad(ctx, 0, y - thickness, 0, y + 4, [[0, '#a89e92'], [1, '#6a6157']])
      : grad(ctx, 0, y - thickness, 0, y + 4, [[0, P.woodLight], [1, P.woodDark]]);
  rr(ctx, x0, y - thickness, w, thickness + 4, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.18)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0,0,0,.16)';
  ctx.lineWidth = 1.2;
  if (surface.id === 'ROUGH_STONE') {
    for (let x = x0 + 6; x < x1; x += 13) {
      ctx.beginPath();
      ctx.moveTo(x, y - thickness + 2);
      ctx.lineTo(x + 3, y - thickness + 7);
      ctx.lineTo(x - 2, y);
      ctx.stroke();
    }
  } else if (surface.id === 'WOOD_PLANKS' || surface.id === 'SMOOTH_TRACK') {
    for (let x = x0 + 28; x < x1; x += 34) {
      ctx.beginPath(); ctx.moveTo(x, y - thickness); ctx.lineTo(x, y + 3); ctx.stroke();
    }
  }
  if (surface.id === 'SMOOTH_TRACK' || surface.id === 'ICE') {
    ctx.strokeStyle = 'rgba(255,255,255,.65)';
    ctx.lineWidth = 2;
    for (let x = x0 + 14; x < x1; x += 46) {
      ctx.beginPath(); ctx.moveTo(x, y - thickness + 3); ctx.lineTo(x + 18, y - thickness + 3); ctx.stroke();
    }
  }
  ctx.restore();
}

/** دیوارهٔ سنگی با لبهٔ ناهموار (به جای بلوک تخت) */
function rockFace(ctx, x0, x1, topY, bottomY, P, seed = 5) {
  let n = seed * 9973;
  const rnd = () => ((n = (n * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const steps = 7;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, bottomY + 4);
  ctx.lineTo(x0, topY + 14);
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    ctx.lineTo(x, topY + (i === steps ? 0 : rnd() * 16 - 6));
  }
  ctx.lineTo(x1, bottomY + 4);
  ctx.closePath();
  ctx.fillStyle = grad(ctx, x0, topY, x1, bottomY, [[0, P.nearRock], [1, P.midRock]]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.20)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // درزهای سنگ
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,.13)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 9; i++) {
    const y = topY + rnd() * (bottomY - topY);
    const x = x0 + rnd() * (x1 - x0);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rnd() - 0.5) * 70, y + rnd() * 26);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

/** غلتک‌های چوبی زیر بار */
function rollers(ctx, cx, y, width, spin, P) {
  const r = 9;
  const count = Math.max(3, Math.round(width / 26));
  for (let i = 0; i < count; i++) {
    const x = cx - width / 2 + (width / (count - 1)) * i;
    ctx.save();
    ctx.translate(x, y - r);
    ctx.rotate(spin);
    ctx.fillStyle = grad(ctx, -r, -r, r, r, [[0, P.woodLight], [1, P.woodDark]]);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = P.woodDark; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * 0.7, 0); ctx.lineTo(r * 0.7, 0); ctx.stroke();
    ctx.restore();
  }
}

/** بردارهای نیرو روی بار */
function forceVectors(ctx, cx, cy, size, state, P, opts = {}) {
  const { angle = 0, showNormal = true } = opts;
  const s = clamp(46 / Math.max(60, state.loadN) * 60, 24, 70);
  const scale = (f) => clamp((f / Math.max(state.loadN, 1)) * 74, 16, 88);

  // وزن (همیشه رو به پایین)
  arrow(ctx, cx, cy, cx, cy + scale(state.loadN), { color: P.load, width: 3, text: `وزن ${N(state.loadN)}` });

  if (showNormal && state.machine !== 'PULLEY') {
    const nx = Math.sin(angle), ny = -Math.cos(angle);
    arrow(ctx, cx, cy, cx + nx * scale(state.loadN * Math.cos(angle)), cy + ny * scale(state.loadN * Math.cos(angle)),
      { color: P.normal, width: 2.6, text: 'نیروی تکیه‌گاه', dashed: true, textSize: 10 });
  }
  if (state.frictionN > 0.5) {
    arrow(ctx, cx, cy, cx + Math.cos(angle) * scale(state.frictionN), cy + Math.sin(angle) * scale(state.frictionN),
      { color: P.friction, width: 2.6, text: `اصطکاک ${N(state.frictionN)}`, textSize: 10 });
  }
  arrow(ctx, cx, cy, cx - Math.cos(angle) * scale(state.effortN), cy - Math.sin(angle) * scale(state.effortN),
    { color: P.effort, width: 3.4, text: `نیروی تو ${N(state.effortN)}` });
}

// ═══════════════ ۱) اصطکاک، چرخ و غلتک ═══════════════
function sceneFriction(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, particles, time } = env;
  const x0 = w * 0.74, x1 = w * 0.22;
  const size = clamp(40 + state.massKg * 0.32, 44, 78);
  const cx = lerp(x0, x1, t);
  const lift = state.useRollers ? 18 : 0;
  const cy = gy - size * 0.41 - lift;

  surfaceStrip(ctx, w * 0.12, w * 0.86, gy, state.surface, P);

  if (state.useRollers) {
    rollers(ctx, cx, gy, size * 1.1, -t * 26, P);
  }
  crate(ctx, cx, cy, size, 0, P, { massKg: state.massKg });

  const px = cx - size * 0.5 - 76;
  const hand = person(ctx, px, gy, 92, {
    P, pose: 'pull', dir: 1, t: time * 3,
    effort: clamp(state.effortN / state.humanLimitN, 0, 1)
  });
  rope(ctx, [[hand.x, hand.y], [cx - size * 0.5, cy + size * 0.1]], P, { width: 3.4, sag: 3 });

  if (t > 0 && t < 1 && particles && Math.random() < 0.4) {
    particles.burst(cx + size * 0.4, gy - 2, 1, state.useRollers ? 'rgba(200,180,150,.5)' : 'rgba(190,170,140,.75)',
      { speed: 1.4, life: 0.6, size: 3, gravity: 0.03, dir: 0.5, spread: 1.6 });
  }

  dim(ctx, x0, gy + 26, x1, gy + 26, `مسافت ${fa(state.geom.distanceM)} متر`, { color: P.inkSoft });
  label(ctx, w * 0.5, gy + 52,
    `${state.surface.icon} ${state.surface.fullName} — ضریب اصطکاک ${fa(state.surface.mu)}`,
    { size: 11, color: P.ink });

  if (showVectors) forceVectors(ctx, cx, cy, size, state, P, { angle: 0 });
  return [];
}

// ═══════════════ ۲) سطح شیب‌دار ═══════════════
function sceneIncline(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, particles, time } = env;
  const { heightM, lengthM, angleDeg } = state.geom;

  const mscale = Math.min((w * 0.46) / lengthM, (h * 0.40) / Math.max(heightM, 0.5), 105);
  const hPx = heightM * mscale;
  const lPx = lengthM * mscale;
  const ang = Math.asin(clamp(hPx / lPx, 0, 1));

  const baseX = Math.min(w * 0.88, w * 0.30 + Math.cos(ang) * lPx);
  const topX = baseX - Math.cos(ang) * lPx;
  const topY = gy - hPx;

  // دیوارهٔ سنگی که رمپ به آن تکیه دارد
  rockFace(ctx, -12, topX + 10, topY, gy, P, 4);
  clinic(ctx, Math.max(64, topX * 0.4), topY - 4, 0.55, P);

  // رمپ (از پایینِ راست به بالای چپ)
  const thick = 13;
  ctx.save();
  ctx.translate(baseX, gy);
  ctx.rotate(ang);
  ctx.fillStyle = state.useRollers
    ? grad(ctx, 0, -thick, 0, 2, [[0, P.woodLight], [1, P.woodDark]])
    : grad(ctx, 0, -thick, 0, 2, [[0, state.surface.color], [1, 'rgba(0,0,0,.35)']]);
  rr(ctx, -lPx, -thick, lPx, thick, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();

  // بار روی رمپ
  const size = clamp(38 + state.massKg * 0.26, 40, 68);
  const bx = lerp(baseX - size * 0.55, topX + size * 0.55, t);
  const by = lerp(gy, topY, t) - thick;

  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(ang);
  if (state.useRollers) rollers(ctx, 0, 0, size * 1.05, -t * 24, P);
  crate(ctx, 0, -size * 0.42 - (state.useRollers ? 17 : 0), size, 0, P, { massKg: state.massKg, shadow: false });
  ctx.restore();

  // کارگر بالای دیواره
  const hand = person(ctx, topX - 30, topY, clamp(mscale * 1.7, 78, 132), {
    P, pose: 'pull', dir: 1, t: time * 3,
    effort: clamp(state.effortN / state.humanLimitN, 0, 1)
  });
  rope(ctx, [[hand.x, hand.y], [bx - Math.cos(ang) * size * 0.45, by - size * 0.5]], P, { width: 3.2, sag: 2 });

  if (t > 0 && t < 1 && particles && Math.random() < 0.3) {
    particles.burst(bx + 6, by, 1, 'rgba(190,170,140,.7)', { speed: 1.2, life: 0.5, size: 2.6, gravity: 0.04, dir: 0.6, spread: 1.4 });
  }

  // اندازه‌ها
  ctx.save();
  ctx.strokeStyle = 'rgba(70,95,120,.45)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(topX, topY); ctx.lineTo(baseX + 46, topY); ctx.stroke();
  ctx.restore();
  dim(ctx, baseX + 38, gy, baseX + 38, topY, `ارتفاع ${fa(heightM)} متر`, { color: P.load });
  dim(ctx, baseX, gy, topX, topY, `طول رمپ ${fa(state.lengthM)} متر`, { color: P.effort, offset: 32 });
  angleArc(ctx, baseX, gy, 56, Math.PI, Math.PI + ang, `${fa(angleDeg)}°`, P.inkSoft);

  if (showVectors) forceVectors(ctx, bx, by - size * 0.5, size, state, P, { angle: -ang });

  return [{
    id: 'rampLength', x: topX + 16, y: topY - 26, r: 15,
    hint: 'بالای رمپ را بکش تا شیب عوض شود',
    toValue: (px) => {
      const run = Math.max(6, baseX - px);
      return Math.hypot(run, hPx) / mscale;
    }
  }];
}

// ═══════════════ ۳) اهرم ═══════════════
function sceneLever(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, time } = env;
  const g = state.geom;
  const scale = Math.min((w * 0.68) / g.beamLengthM, 210);
  const originX = w * 0.86;                 // متر صفرِ تیرک، سمت راست
  const X = (m) => originX - m * scale;

  const fx = X(g.fulcrumM);
  const beamY = gy - 34;

  // سنگ‌های زمینه
  ctx.save();
  ctx.fillStyle = P.stoneDark;
  ctx.beginPath(); ctx.ellipse(w * 0.12, gy - 6, 54, 20, 0, Math.PI, 0); ctx.fill();
  ctx.restore();

  // زاویهٔ چرخش تیرک
  const dxLoad = (g.fulcrumM - g.loadM) * scale;
  const liftPx = g.liftHeightM * scale * 0.55;
  const maxSin = dxLoad > 4 ? clamp(liftPx / dxLoad, 0, 0.6) : 0;
  const theta = -Math.asin(maxSin) * t;

  const pt = (m) => {
    const dx = X(m) - fx;
    return [fx + dx * Math.cos(theta), beamY + dx * Math.sin(theta)];
  };

  const [lx, ly] = pt(g.loadM);
  const [ex, ey] = pt(g.effortM);
  const [ax, ay] = pt(0);
  const [bx, by] = pt(g.beamLengthM);

  // تیرک
  ctx.save();
  ctx.translate(fx, beamY);
  ctx.rotate(theta);
  plank(ctx, X(g.beamLengthM) - fx, -7, g.beamLengthM * scale, 14, 0, P);
  ctx.restore();

  // تکیه‌گاه
  ctx.save();
  ctx.fillStyle = grad(ctx, fx - 26, beamY, fx + 26, gy, [[0, P.stone], [1, P.stoneDark]]);
  ctx.beginPath();
  ctx.moveTo(fx, beamY + 2);
  ctx.lineTo(fx + 27, gy);
  ctx.lineTo(fx - 27, gy);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
  label(ctx, fx, gy + 18, 'تکیه‌گاه', { size: 11, color: P.ink });

  // تخته‌سنگ روی سرِ بار
  const rSize = clamp(30 + state.massKg * 0.28, 34, 62);
  ctx.save();
  ctx.fillStyle = grad(ctx, lx - rSize, ly - rSize * 2, lx + rSize, ly, [[0, '#a49a8d'], [1, '#6d655a']]);
  ctx.beginPath();
  ctx.ellipse(lx, ly - rSize * 0.75, rSize, rSize * 0.78, theta, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#575047'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.beginPath(); ctx.ellipse(lx - rSize * 0.3, ly - rSize * 1.05, rSize * 0.3, rSize * 0.2, theta, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  label(ctx, lx, ly - rSize * 1.9, `تخته‌سنگ ${fa(state.massKg)} کیلوگرم`, { size: 10, color: P.ink });

  // کارگر روی سرِ نیرو
  const pDir = ex < fx ? -1 : 1;
  person(ctx, ex - pDir * 26, ey + 4, 86, {
    P, pose: 'push', dir: pDir, t: time * 3,
    effort: clamp(state.effortN / state.humanLimitN, 0, 1)
  });

  // بازوها
  dim(ctx, fx, beamY + 46, lx, beamY + 46, `بازوی بار ${fa(state.loadArmM)} م`, { color: P.load });
  dim(ctx, ex, beamY + 68, fx, beamY + 68, `بازوی نیرو ${fa(state.effortArmM)} م`, { color: P.effort });

  if (showVectors) {
    const s = (f) => clamp((f / Math.max(state.loadN, 1)) * 78, 18, 86);
    arrow(ctx, lx, ly - rSize * 1.5, lx, ly - rSize * 1.5 + s(state.loadN), { color: P.load, width: 3.2, text: `وزن ${N(state.loadN)}` });
    arrow(ctx, ex, ey - 12, ex, ey - 12 + s(state.effortN), { color: P.effort, width: 3.4, text: `نیروی تو ${N(state.effortN)}` });
    arrow(ctx, fx, gy - 4, fx, gy - 4 - 34, { color: P.normal, width: 2.4, text: 'تکیه‌گاه', dashed: true, textSize: 10 });
  }

  label(ctx, w * 0.5, 34, state.leverClass.name, { size: 12, color: P.ink, bg: 'rgba(255,255,255,.9)' });

  return [{
    id: 'fulcrum', x: fx, y: gy - 12, r: 20,
    hint: 'تکیه‌گاه را بکش و جابه‌جا کن',
    toValue: (px) => clamp((originX - px) / scale, 0.1, g.beamLengthM - 0.1)
  }];
}

// ═══════════════ ۴) قرقره ═══════════════
/** مسیر طناب برای هر سامانهٔ قرقره */
function pulleyLayout(system, geom) {
  const { cx, topY, crateTopY, handGroundY, R } = geom;
  const L = { sheavesTop: [], sheavesBottom: [], anchor: null, path: [], handAt: null, pullDown: system.changesDirection };

  if (system.id === 'NONE') {
    // بدون قرقره باید بالای بار بایستیم و طناب را رو به بالا بکشیم
    L.handAt = [cx + 34, topY + 96];
    L.path = [[cx, crateTopY], L.handAt];
    L.pullDown = false;
  } else if (system.id === 'FIXED') {
    const S = [cx, topY + R + 6];
    L.sheavesTop = [S];
    L.handAt = [cx + 130, handGroundY - 52];
    L.path = [[cx, crateTopY], [S[0] - R, S[1]], [S[0], S[1] - R], [S[0] + R, S[1]], [L.handAt[0], L.handAt[1]]];
  } else if (system.id === 'MOVABLE') {
    const M = [cx, crateTopY - R - 8];
    L.sheavesBottom = [M];
    L.anchor = [cx - R, topY + 10];
    L.handAt = [cx + R + 74, topY + 96];
    L.path = [L.anchor, [M[0] - R, M[1]], [M[0], M[1] + R], [M[0] + R, M[1]], L.handAt];
    L.pullDown = false;
  } else if (system.id === 'COMPOUND_2') {
    const M = [cx, crateTopY - R - 8];
    const T = [cx + R * 2.6, topY + R + 6];
    L.sheavesBottom = [M]; L.sheavesTop = [T];
    L.anchor = [cx - R, topY + 10];
    L.handAt = [T[0] + 110, handGroundY - 52];
    L.path = [L.anchor, [M[0] - R, M[1]], [M[0], M[1] + R], [M[0] + R, M[1]],
      [T[0] - R, T[1]], [T[0], T[1] - R], [T[0] + R, T[1]], L.handAt];
  } else if (system.id === 'COMPOUND_3') {
    const M = [cx, crateTopY - R - 8];
    const T1 = [cx - R * 2.4, topY + R + 6];
    const T2 = [cx + R * 2.4, topY + R + 6];
    L.sheavesBottom = [M]; L.sheavesTop = [T1, T2];
    L.anchor = [M[0] - R * 0.2, M[1] + R + 4];   // سر طناب به قرقرهٔ متحرک بسته است
    L.handAt = [T2[0] + 104, handGroundY - 52];
    L.path = [L.anchor, [T1[0] - R, T1[1]], [T1[0], T1[1] - R], [T1[0] + R, T1[1]],
      [M[0] - R, M[1]], [M[0], M[1] + R], [M[0] + R, M[1]],
      [T2[0] - R, T2[1]], [T2[0], T2[1] - R], [T2[0] + R, T2[1]], L.handAt];
  } else { // COMPOUND_4
    const M1 = [cx - R * 1.15, crateTopY - R - 10];
    const M2 = [cx + R * 1.15, crateTopY - R - 10];
    const T1 = [cx - R * 1.15, topY + R + 6];
    const T2 = [cx + R * 1.15, topY + R + 6];
    L.sheavesBottom = [M1, M2]; L.sheavesTop = [T1, T2];
    L.anchor = [cx - R * 2.6, topY + 10];
    L.handAt = [T2[0] + 108, handGroundY - 52];
    L.path = [L.anchor,
      [M1[0] - R, M1[1]], [M1[0], M1[1] + R], [M1[0] + R, M1[1]],
      [T1[0] - R, T1[1]], [T1[0], T1[1] - R], [T1[0] + R, T1[1]],
      [M2[0] - R, M2[1]], [M2[0], M2[1] + R], [M2[0] + R, M2[1]],
      [T2[0] - R, T2[1]], [T2[0], T2[1] - R], [T2[0] + R, T2[1]], L.handAt];
  }
  return L;
}

function scenePulley(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, time } = env;
  const system = state.system;
  const topY = h * 0.13;
  const cx = w * 0.44;
  const R = 17;
  const size = clamp(40 + state.massKg * 0.28, 44, 70);

  const liftPx = (gy - topY - 120) * t;
  const crateCY = gy - size * 0.42 - liftPx;
  const crateTopY = crateCY - size * 0.41;

  // صخره و درمانگاه سمت چپ
  rockFace(ctx, -12, w * 0.19, topY + 52, gy, P, 6);
  clinic(ctx, w * 0.085, topY + 52, 0.55, P);

  // تیر افقی بالا روی دو پایه
  const beamX0 = w * 0.20, beamX1 = w * 0.86;
  ctx.save();
  ctx.fillStyle = P.stoneDark;
  rr(ctx, beamX1 - 26, topY + 8, 22, gy - topY - 4, 4); ctx.fill();
  ctx.restore();
  plank(ctx, beamX0, topY, beamX1 - beamX0, 16, 0, P);
  label(ctx, beamX1 - 60, topY - 13, 'تیرِ سقف', { size: 10, color: P.ink });

  const L = pulleyLayout(system, { cx, topY, crateTopY, handGroundY: gy, R });

  // طناب
  rope(ctx, L.path, P, { width: 3.2 });

  // قرقره‌ها
  const spin = t * 12;
  for (const [sx, sy] of L.sheavesTop) sheave(ctx, sx, sy, R, spin, P, { mount: 'top' });
  for (const [sx, sy] of L.sheavesBottom) sheave(ctx, sx, sy, R, -spin, P, { mount: 'hook' });

  if (L.anchor && L.sheavesBottom.length && L.anchor[1] < topY + 40) {
    ctx.save();
    ctx.fillStyle = P.metalDark;
    rr(ctx, L.anchor[0] - 5, L.anchor[1] - 8, 10, 10, 2); ctx.fill();
    ctx.restore();
  }

  // قلاب بین قرقرهٔ متحرک و بار
  if (L.sheavesBottom.length) {
    const mid = L.sheavesBottom.length === 1
      ? L.sheavesBottom[0]
      : [(L.sheavesBottom[0][0] + L.sheavesBottom[1][0]) / 2, L.sheavesBottom[0][1]];
    ctx.save();
    ctx.strokeStyle = P.metalDark; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(mid[0], mid[1] + R + 2); ctx.lineTo(cx, crateTopY); ctx.stroke();
    ctx.restore();
  }

  crate(ctx, cx, crateCY, size, 0, P, { massKg: state.massKg, shadow: t < 0.05 });

  // کارگر
  const [hx, hy] = L.handAt;
  const effort = clamp(state.effortN / state.humanLimitN, 0, 1);
  if (L.pullDown) {
    person(ctx, hx + 16, gy, 92, { P, pose: 'pull', dir: -1, t: time * 3, effort });
  } else {
    // برای کشیدن رو به بالا باید روی سکو، بالای بار ایستاد
    balcony(ctx, hx + 34, hy + 54, 86, P);
    person(ctx, hx + 26, hy + 54, 86, { P, pose: 'cheer', dir: -1, t: time * 3, effort });
    label(ctx, hx + 34, hy + 100, 'باید بالای بار بایستی و رو به بالا بکشی', { size: 10, color: P.ink });
  }

  // اندازه‌ها
  dim(ctx, w * 0.30, gy, w * 0.30, gy - liftPx - 1, `ارتفاع ${fa(num(state.loadDistanceM * t, 1))} از ${fa(state.loadDistanceM)} متر`,
    { color: P.inkSoft });
  label(ctx, w * 0.68, gy - 18,
    `${fa(state.strands)} رشتهٔ نگهدارندهٔ بار • طول طنابی که می‌کشی: ${fa(state.ropeM)} متر`,
    { size: 11, color: P.ink });

  if (showVectors) {
    const s = (f) => clamp((f / Math.max(state.loadN, 1)) * 78, 18, 86);
    arrow(ctx, cx, crateCY, cx, crateCY + s(state.loadN), { color: P.load, width: 3.2, text: `وزن ${N(state.loadN)}` });
    const dirY = L.pullDown ? 1 : -1;
    arrow(ctx, hx, hy, hx, hy + dirY * s(state.effortN), { color: P.effort, width: 3.4, text: `نیروی تو ${N(state.effortN)}` });
    for (const [sx, sy] of L.sheavesBottom) {
      arrow(ctx, sx, sy - R - 4, sx, sy - R - 4 - s(state.effortN) * 0.7,
        { color: P.ok, width: 2, dashed: true, textSize: 9 });
    }
  }
  return [];
}

// ═══════════════ ۵) چرخ و محور ═══════════════
function sceneWheelAxle(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, time } = env;
  const g = state.geom;
  const axleY = h * 0.34;
  const cx = w * 0.46;
  const Rpx = clamp(g.wheelRadiusM * 150, 46, h * 0.2);
  const rpx = clamp(Rpx * (g.axleRadiusM / g.wheelRadiusM), 7, Rpx * 0.72);

  // چاه سنگی
  ctx.save();
  ctx.fillStyle = P.stoneDark;
  rr(ctx, cx - 74, gy - 44, 148, 46, 6); ctx.fill();
  ctx.fillStyle = '#2c2620';
  ctx.beginPath(); ctx.ellipse(cx, gy - 44, 62, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.stone;
  for (let i = 0; i < 5; i++) rr(ctx, cx - 70 + i * 29, gy - 40, 26, 17, 3), ctx.fill();
  // پایه‌ها
  ctx.fillStyle = P.woodDark;
  rr(ctx, cx - 74, axleY, 13, gy - 44 - axleY, 3); ctx.fill();
  rr(ctx, cx + 61, axleY, 13, gy - 44 - axleY, 3); ctx.fill();
  ctx.restore();

  const spin = -t * 9;

  // محور
  ctx.save();
  ctx.translate(cx, axleY);
  ctx.fillStyle = grad(ctx, -rpx, -rpx, rpx, rpx, [[0, P.woodLight], [1, P.woodDark]]);
  ctx.beginPath(); ctx.arc(0, 0, rpx, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = P.woodDark; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();

  // چرخ بزرگ با دسته
  ctx.save();
  ctx.translate(cx, axleY);
  ctx.rotate(spin);
  ctx.strokeStyle = P.wood; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(0, 0, Rpx, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = P.woodDark; ctx.lineWidth = 4;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos((i / 6) * Math.PI * 2) * Rpx, Math.sin((i / 6) * Math.PI * 2) * Rpx);
    ctx.stroke();
  }
  ctx.fillStyle = P.metalDark;
  ctx.beginPath(); ctx.arc(Rpx, 0, 8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  const handleX = cx + Math.cos(spin) * Rpx;
  const handleY = axleY + Math.sin(spin) * Rpx;

  // طناب و سطل
  const liftPx = (gy - 44 - axleY - 60) * t;
  const bucketY = gy - 60 - liftPx;
  rope(ctx, [[cx - rpx, axleY], [cx - rpx, bucketY - 26]], P, { width: 3 });
  const size = clamp(34 + state.massKg * 0.3, 38, 62);
  crate(ctx, cx - rpx, bucketY, size, 0, P, { massKg: state.massKg, shadow: false });

  // کارگر
  person(ctx, cx + Rpx + 34, gy, 92, {
    P, pose: 'crank', dir: -1, t: time * 3,
    effort: clamp(state.effortN / state.humanLimitN, 0, 1)
  });

  dim(ctx, cx, axleY - Rpx - 16, cx + Rpx, axleY - Rpx - 16, `شعاع چرخ ${fa(num(g.wheelRadiusM, 2))} متر`, { color: P.effort });
  dim(ctx, cx - rpx, axleY + Rpx + 22, cx, axleY + Rpx + 22, `شعاع محور ${fa(num(g.axleRadiusM, 2))} متر`, { color: P.load, offset: 16 });
  label(ctx, cx, gy + 30, `مزیت مکانیکی = شعاع چرخ ÷ شعاع محور = ${fa(num(state.maIdeal, 1))}`, { size: 11, color: P.ink });

  if (showVectors) {
    const s = (f) => clamp((f / Math.max(state.loadN, 1)) * 78, 18, 84);
    arrow(ctx, handleX, handleY, handleX, handleY + s(state.effortN), { color: P.effort, width: 3.2, text: `نیروی تو ${N(state.effortN)}` });
    arrow(ctx, cx - rpx, bucketY, cx - rpx, bucketY + s(state.loadN), { color: P.load, width: 3.2, text: `وزن ${N(state.loadN)}` });
  }
  return [];
}

// ═══════════════ ۶) گوه ═══════════════
function sceneWedge(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, particles, time } = env;
  const g = state.geom;
  const scale = 620;
  const wl = clamp(g.lengthM * scale, 70, h * 0.34);
  const wt = clamp(g.thicknessM * scale, 12, wl * 0.7);

  const cx = w * 0.5;
  const logY = gy - 34;
  const logW = w * 0.44, logH = 62;

  const gap = wt * t;
  // دو نیمهٔ چوب
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx + side * (gap / 2), logY);
    ctx.fillStyle = grad(ctx, 0, -logH / 2, 0, logH / 2, [[0, P.woodLight], [1, P.woodDark]]);
    rr(ctx, side === -1 ? -logW / 2 : 0, -logH / 2, logW / 2, logH, 5);
    ctx.fill();
    ctx.strokeStyle = P.woodDark; ctx.lineWidth = 1.5; ctx.stroke();
    // حلقه‌های سالیانه
    ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 1.4;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(side === -1 ? -logW / 2 + 4 : logW / 2 - 4, 0, i * 11, side === -1 ? -1.2 : Math.PI - 1.2, side === -1 ? 1.2 : Math.PI + 1.2);
      ctx.stroke();
    }
    ctx.restore();
  }
  // پایه
  ctx.save();
  ctx.fillStyle = P.stoneDark;
  rr(ctx, cx - logW / 2 - 8, gy - 6, logW + 16, 12, 4); ctx.fill();
  ctx.restore();

  // گوه
  const wedgeTop = logY - logH / 2 - wl + (wl + 10) * t;
  ctx.save();
  ctx.translate(cx, wedgeTop);
  ctx.fillStyle = grad(ctx, -wt / 2, 0, wt / 2, wl, [[0, P.metalLight], [1, P.metalDark]]);
  ctx.beginPath();
  ctx.moveTo(-wt / 2, 0); ctx.lineTo(wt / 2, 0); ctx.lineTo(0, wl);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = P.metalDark; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = P.woodDark;
  rr(ctx, -wt / 2 - 3, -13, wt + 6, 14, 3); ctx.fill();
  ctx.restore();

  // ضربه‌زننده به‌همراه پتک
  const hand = person(ctx, cx + 104, gy, 94, { P, pose: 'hammer', dir: -1, t: time * 3, effort: clamp(state.effortN / state.humanLimitN, 0, 1) });
  ctx.save();
  ctx.strokeStyle = P.woodDark; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const mAng = Math.atan2(wedgeTop - 16 - hand.y, cx - hand.x);
  ctx.beginPath();
  ctx.moveTo(hand.x, hand.y);
  ctx.lineTo(hand.x + Math.cos(mAng) * 40, hand.y + Math.sin(mAng) * 40);
  ctx.stroke();
  ctx.fillStyle = P.metalDark;
  ctx.save();
  ctx.translate(hand.x + Math.cos(mAng) * 46, hand.y + Math.sin(mAng) * 46);
  ctx.rotate(mAng);
  rr(ctx, -12, -9, 24, 18, 3); ctx.fill();
  ctx.restore();
  ctx.restore();

  if (t > 0 && t < 1 && particles && Math.random() < 0.25) {
    particles.burst(cx, wedgeTop + wl, 2, 'rgba(215,185,140,.85)', { speed: 2.2, life: 0.6, size: 3, gravity: 0.2, dir: -Math.PI / 2, spread: 2.4 });
  }

  dim(ctx, cx - wt / 2 - 44, wedgeTop, cx - wt / 2 - 44, wedgeTop + wl, `طول گوه ${fa(num(g.lengthM * 100, 0))} سانتی‌متر`, { color: P.effort });
  dim(ctx, cx - wt / 2, wedgeTop - 26, cx + wt / 2, wedgeTop - 26, `ضخامت ${fa(num(g.thicknessM * 100, 0))} سانتی‌متر`, { color: P.load });
  label(ctx, w * 0.5, gy + 34, `گوه = سطح شیب‌دارِ متحرک • مزیت مکانیکی = طول ÷ ضخامت = ${fa(num(state.maIdeal, 1))}`, { size: 11, color: P.ink });

  if (showVectors) {
    const s = (f) => clamp((f / Math.max(state.loadN, 1)) * 76, 18, 82);
    arrow(ctx, cx, wedgeTop - 22, cx, wedgeTop - 22 + s(state.effortN), { color: P.effort, width: 3.4, text: `ضربهٔ تو ${N(state.effortN)}` });
    arrow(ctx, cx - wt / 2 - 6, logY, cx - wt / 2 - 6 - s(state.loadN) * 0.6, logY, { color: P.load, width: 3, text: 'مقاومت چوب' });
    arrow(ctx, cx + wt / 2 + 6, logY, cx + wt / 2 + 6 + s(state.loadN) * 0.6, logY, { color: P.load, width: 3 });
  }
  return [];
}

// ═══════════════ ۷) پیچ ═══════════════
function sceneScrew(ctx, env) {
  const { w, h, gy, P, t, state, showVectors, time } = env;
  const g = state.geom;
  const cx = w * 0.46;
  const shaftH = h * 0.30;
  const shaftW = 30;
  const baseY = gy - 10;
  const liftPx = 52 * t;
  const topY = baseY - shaftH - liftPx;

  // پایه
  ctx.save();
  ctx.fillStyle = P.metalDark;
  rr(ctx, cx - 56, baseY - 16, 112, 18, 4); ctx.fill();
  ctx.restore();

  // بدنهٔ پیچ با رزوه
  ctx.save();
  ctx.fillStyle = grad(ctx, cx - shaftW / 2, 0, cx + shaftW / 2, 0, [[0, P.metalLight], [0.5, P.metal], [1, P.metalDark]]);
  rr(ctx, cx - shaftW / 2, topY, shaftW, baseY - 16 - topY, 3);
  ctx.fill();
  ctx.strokeStyle = P.metalDark; ctx.lineWidth = 1.4; ctx.stroke();
  // خطوط رزوه (گام)
  const pitchPx = clamp(g.pitchM * 900, 6, 26);
  const phase = (t * 240) % pitchPx;
  for (let y = topY + 4 + phase; y < baseY - 18; y += pitchPx) {
    ctx.strokeStyle = 'rgba(0,0,0,.42)'; ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(cx - shaftW / 2, y);
    ctx.lineTo(cx + shaftW / 2, y - pitchPx * 0.55);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(cx - shaftW / 2, y + 2.4);
    ctx.lineTo(cx + shaftW / 2, y - pitchPx * 0.55 + 2.4);
    ctx.stroke();
  }
  ctx.restore();

  // صفحهٔ بالا و تخته‌سنگ
  ctx.save();
  ctx.fillStyle = P.metalDark;
  rr(ctx, cx - 46, topY - 12, 92, 14, 4); ctx.fill();
  ctx.restore();
  const rSize = clamp(38 + state.massKg * 0.09, 44, 84);
  ctx.save();
  ctx.fillStyle = grad(ctx, cx - rSize, topY - rSize, cx + rSize, topY, [[0, '#a49a8d'], [1, '#676056']]);
  ctx.beginPath();
  ctx.ellipse(cx, topY - 12 - rSize * 0.62, rSize, rSize * 0.66, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#575047'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  label(ctx, cx, topY - 12 - rSize * 1.5, `تخته‌سنگ ${fa(state.massKg)} کیلوگرم`, { size: 10, color: P.ink });

  // دستهٔ چرخان (پایینِ بدنه، جایی که دست به آن می‌رسد)
  const ang = t * 10;
  const Rpx = clamp(g.handleRadiusM * 190, 46, 112);
  const handleY = baseY - 54;
  const e1 = [cx + Math.cos(ang) * Rpx, handleY + Math.sin(ang) * Rpx * 0.22];
  const e2 = [cx - Math.cos(ang) * Rpx, handleY - Math.sin(ang) * Rpx * 0.22];
  const near = e1[0] >= e2[0] ? e1 : e2;   // سرِ نزدیک به کارگر
  const far = near === e1 ? e2 : e1;
  ctx.save();
  ctx.strokeStyle = P.metalDark; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(far[0], far[1]); ctx.lineTo(near[0], near[1]); ctx.stroke();
  ctx.fillStyle = P.woodDark;
  ctx.beginPath(); ctx.arc(near[0], near[1], 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(far[0], far[1], 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  const hx = near[0], hy = near[1];

  person(ctx, hx + 34, gy, 90, { P, pose: 'crank', dir: -1, t: time * 3, effort: clamp(state.effortN / state.humanLimitN, 0, 1) });

  dim(ctx, cx, handleY + 34, cx + Rpx, handleY + 34, `شعاع دسته ${fa(num(g.handleRadiusM * 100, 0))} سانتی‌متر`, { color: P.effort });
  label(ctx, cx - shaftW / 2 - 66, topY + 60, `گامِ پیچ ${fa(num(g.pitchM * 1000, 0))} میلی‌متر`, { size: 10, color: P.load });
  label(ctx, w * 0.5, gy + 32, `پیچ = سطح شیب‌دارِ پیچیده‌شده دور استوانه • ${fa(state.turns)} دور چرخش لازم است`, { size: 11, color: P.ink });

  if (showVectors) {
    const s = (f) => clamp((f / Math.max(state.loadN, 1)) * 300, 20, 84);
    arrow(ctx, hx, hy, hx, hy + s(state.effortN), { color: P.effort, width: 3.2, text: `نیروی تو ${N(state.effortN)}` });
    arrow(ctx, cx, topY - 18, cx, topY - 18 + 60, { color: P.load, width: 3.2, text: `وزن ${N(state.loadN)}` });
  }
  return [];
}

// ═══════════════ ۸) چرخ‌دنده‌ها ═══════════════
function sceneGears(ctx, env) {
  const { w, h, P, state, time, t } = env;
  const cy = h * 0.5;
  const base = Math.min(w, h) * 0.17;
  const r1 = base, r2 = base * (state.drivenTeeth / state.driverTeeth);
  const rr2 = clamp(r2, base * 0.4, Math.min(w, h) * 0.32);
  const scaleFix = rr2 / r2;
  const R1 = r1 * (rr2 === r2 ? 1 : scaleFix);
  const gap = (R1 + rr2) * 0.885;   // فاصلهٔ مرکزها تا دندانه‌ها واقعاً درگیر شوند
  const x1 = w * 0.62, x2 = x1 - gap;

  const spin = (time * 0.9 + t * 3) * (state.inputRpm / 60);
  const a1 = spin;
  const a2 = -spin * (state.driverTeeth / state.drivenTeeth);

  // تخته پشت
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  rr(ctx, w * 0.1, h * 0.16, w * 0.8, h * 0.68, 20); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.10)'; ctx.stroke();
  ctx.restore();

  gear(ctx, x1, cy, R1, state.driverTeeth, a1, '#f0900c', P);
  gear(ctx, x2, cy, rr2, state.drivenTeeth, a2 + Math.PI / state.drivenTeeth, '#0b7fc4', P);

  label(ctx, x1, cy + R1 + 26, `چرخ‌دندهٔ محرک • ${fa(state.driverTeeth)} دندانه`, { size: 11, color: P.ink });
  label(ctx, x2, cy + rr2 + 26, `چرخ‌دندهٔ متحرک • ${fa(state.drivenTeeth)} دندانه`, { size: 11, color: P.ink });
  label(ctx, x1, cy - R1 - 24, `${fa(state.inputRpm)} دور بر دقیقه`, { size: 11, color: '#a2560a' });
  label(ctx, x2, cy - rr2 - 24, `${fa(state.outputRpm)} دور بر دقیقه`, { size: 11, color: '#075985' });

  // پیکان جهت چرخش
  for (const [x, r, dir, color] of [[x1, R1, 1, '#a2560a'], [x2, rr2, -1, '#075985']]) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, cy, r * 0.42, dir > 0 ? -0.6 : Math.PI + 0.6, dir > 0 ? 1.6 : Math.PI - 1.6, dir < 0);
    ctx.stroke();
    ctx.restore();
  }

  label(ctx, w * 0.5, h * 0.80,
    `گشتاور خروجی ${fa(state.outputTorqueNm)} نیوتون‌متر • نسبت دنده ${fa(state.ratio)} به ۱`,
    { size: 12, color: P.ink });
  return [];
}

// ═══════════════ ۹) مأموریت پایانی ═══════════════
function sceneCapstone(ctx, env) {
  const { w, h, gy, P, t, state, time } = env;
  const size = 40;

  // ── هندسهٔ سه مرحله (از راست به چپ) ──
  const cliffTopY = gy - h * 0.19;          // بالای دیوارهٔ میانی
  const towerTopY = h * 0.14;               // تیرِ قرقرهٔ برج درمانگاه
  const cliffRight = w * 0.56;              // لبهٔ راست دیوارهٔ میانی
  const bridgeX0 = w * 0.30, bridgeX1 = w * 0.40;   // دهانهٔ پل

  const rampH = gy - cliffTopY;
  const lPx = clamp(state.stageB.lengthM * (rampH / state.stageB.heightM), rampH * 1.05, w * 0.34);
  const ang = Math.asin(clamp(rampH / lPx, 0, 1));
  const rampBaseX = cliffRight + Math.cos(ang) * lPx;

  // ── صخره‌ها ──
  rockFace(ctx, bridgeX1, cliffRight, cliffTopY, gy, P, 8);      // دیوارهٔ میانی
  rockFace(ctx, -12, bridgeX0, towerTopY + 54, gy, P, 3);        // برج درمانگاه
  clinic(ctx, w * 0.08, towerTopY + 54, 0.52, P);

  // ── رمپ مرحلهٔ ۲ ──
  ctx.save();
  ctx.translate(rampBaseX, gy);
  ctx.rotate(ang);
  plank(ctx, -lPx, -11, lPx, 11, 0, P);
  ctx.restore();

  // ── پل میانی ──
  for (let i = 0; i < state.bridgeBeams; i++) {
    plank(ctx, bridgeX0 - 8, cliffTopY - 4 + i * 8, (bridgeX1 - bridgeX0) + 16, 8, 0, P);
  }
  if (!state.bridgeStable) {
    label(ctx, (bridgeX0 + bridgeX1) / 2, cliffTopY - 26, '⚠️ پل ناپایدار است', { size: 10, color: '#c02a3c', bg: 'rgba(253,234,236,.95)' });
  }

  // ── قرقرهٔ برج ──
  const R = 15;
  plank(ctx, w * 0.10, towerTopY, w * 0.20, 12, 0, P);
  const pulX = w * 0.205;
  sheave(ctx, pulX, towerTopY + R + 8, R, t * 10, P, { mount: 'top' });
  balcony(ctx, w * 0.12, towerTopY + 54, 74, P);

  // ── مسیر حرکت بار در سه مرحله ──
  let cx, cy, tilt = 0, phase;
  if (t < 0.34) {
    phase = 'A';
    cx = lerp(w * 0.94, rampBaseX, t / 0.34);
    cy = gy - size * 0.45;
  } else if (t < 0.72) {
    phase = 'B';
    const k = (t - 0.34) / 0.38;
    cx = lerp(rampBaseX, cliffRight, k);
    cy = lerp(gy, cliffTopY, k) - size * 0.5;
    tilt = ang;
  } else {
    phase = 'C';
    const k = (t - 0.72) / 0.28;
    cx = lerp(cliffRight - 10, pulX, Math.min(1, k * 2.2));
    cy = lerp(cliffTopY - size * 0.5, towerTopY + 72, k);
  }

  // ── کارگر و طناب ──
  if (phase === 'C') {
    rope(ctx, [[pulX - R, towerTopY + R + 8], [cx, cy - size * 0.45]], P, { width: 3 });
    rope(ctx, [[pulX + R, towerTopY + R + 8], [pulX + 52, gy - 62]], P, { width: 3 });
    person(ctx, pulX + 66, gy, 88, { P, pose: 'pull', dir: -1, t: time * 3, effort: clamp(state.stageC.effortN / state.humanLimitN, 0, 1) });
  } else {
    const eff = clamp((phase === 'A' ? state.stageA : state.stageB).effortN / state.humanLimitN, 0, 1);
    const px = cx - size * 0.6 - 66 * Math.cos(tilt);
    const py = phase === 'A' ? gy : cy + size * 0.5 - Math.tan(tilt) * 0;
    const hand = person(ctx, phase === 'B' ? cliffRight - 30 : px, phase === 'B' ? cliffTopY : py, 86,
      { P, pose: 'pull', dir: 1, t: time * 3, effort: eff });
    rope(ctx, [[hand.x, hand.y], [cx - size * 0.45, cy]], P, { width: 3, sag: 2 });
  }

  // ── بار ──
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);
  if (state.stageA.useRollers && phase !== 'C') rollers(ctx, 0, size * 0.45, size, -t * 30, P);
  crate(ctx, 0, 0, size, 0, P, { massKg: state.massKg, shadow: false });
  ctx.restore();

  // ── برچسب مراحل ──
  const stages = [
    [w * 0.86, gy - 66, '۱) کشیدن', state.stageA],
    [rampBaseX - Math.cos(ang) * lPx * 0.5 + 52, gy - rampH * 0.5 - 8, '۲) رمپ', state.stageB],
    [pulX + 4, towerTopY + 96, '۳) قرقره', state.stageC]
  ];
  for (const [x, y, name, st] of stages) {
    label(ctx, x, y, `${st.feasible ? '✓' : '✕'} ${name} — ${N(st.effortN)}`, {
      size: 11,
      color: st.feasible ? '#0d7a52' : '#c02a3c',
      bg: st.feasible ? 'rgba(226,247,238,.96)' : 'rgba(253,234,236,.96)'
    });
  }
  label(ctx, w * 0.5, gy + 32,
    `مصالح مصرفی ${fa(state.materialsUsed)} از ${fa(state.budget)} • بیشترین نیرو ${N(state.maxForceN)} • توان ${state.puller.name}: ${fa(state.humanLimitN)} نیوتون`,
    { size: 11, color: P.ink });
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
  GEARS: sceneGears,
  CAPSTONE: sceneCapstone
};

export { drawWorld };

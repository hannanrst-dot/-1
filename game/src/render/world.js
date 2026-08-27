// پس‌زمینهٔ مشترک همهٔ صحنه‌ها: آسمان، کوه، دشت و درمانگاه
import { rr, grad, label } from './draw.js';
import { fa } from '../core/format.js';

/** مولد عدد شبه‌تصادفی قطعی — تا کوه‌ها در هر بار اجرا یکسان باشند */
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** ساخت خط‌الرأس یک رشته‌کوه */
function ridge(seed, points, baseY, amp, x0, x1) {
  const rng = makeRng(seed);
  const pts = [];
  for (let i = 0; i <= points; i++) {
    const x = x0 + ((x1 - x0) * i) / points;
    const peak = Math.sin((i / points) * Math.PI * 1.7 + seed) * 0.5 + 0.5;
    pts.push([x, baseY - (peak * 0.55 + rng() * 0.45) * amp]);
  }
  return pts;
}

function drawRidge(ctx, pts, bottomY, fill, opts = {}) {
  const { snow = null, snowLine = 0 } = opts;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], bottomY);
  for (const [x, y] of pts) ctx.lineTo(x, y);
  ctx.lineTo(pts[pts.length - 1][0], bottomY);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();

  if (snow) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = snow;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], snowLine);
    for (const [x, y] of pts) ctx.lineTo(x, y - 1);
    ctx.lineTo(pts[pts.length - 1][0], snowLine);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function pine(ctx, x, y, h, P) {
  ctx.save();
  ctx.fillStyle = '#4a3524';
  ctx.fillRect(x - h * 0.045, y - h * 0.16, h * 0.09, h * 0.17);
  ctx.fillStyle = P.grassLow;
  for (let i = 0; i < 3; i++) {
    const k = 1 - i * 0.24;
    ctx.beginPath();
    ctx.moveTo(x, y - h * (0.55 + i * 0.22));
    ctx.lineTo(x - h * 0.26 * k, y - h * (0.12 + i * 0.22));
    ctx.lineTo(x + h * 0.26 * k, y - h * (0.12 + i * 0.22));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function cloud(ctx, x, y, size, alpha = 0.85) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.42, 0, Math.PI * 2);
  ctx.arc(x + size * 0.38, y - size * 0.13, size * 0.32, 0, Math.PI * 2);
  ctx.arc(x - size * 0.36, y + size * 0.04, size * 0.28, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y + size * 0.16, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function bird(ctx, x, y, size, flap) {
  ctx.save();
  ctx.strokeStyle = 'rgba(40,60,80,.65)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const w = Math.sin(flap) * size * 0.45;
  ctx.beginPath();
  ctx.moveTo(x - size, y + w);
  ctx.quadraticCurveTo(x - size * 0.4, y - w, x, y);
  ctx.quadraticCurveTo(x + size * 0.4, y - w, x + size, y + w);
  ctx.stroke();
  ctx.restore();
}

/** ساختمان درمانگاه روی صخرهٔ سمت چپ */
export function clinic(ctx, x, y, scale, P, opts = {}) {
  const { showLabel = true } = opts;
  const w = 92 * scale, h = 78 * scale;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.12)';
  ctx.beginPath(); ctx.ellipse(x, y + 3, w * 0.6, 6 * scale, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = grad(ctx, x - w / 2, y - h, x + w / 2, y, [[0, '#f5f2ea'], [1, '#ddd7ca']]);
  rr(ctx, x - w / 2, y - h, w, h, 4 * scale);
  ctx.fill();
  ctx.strokeStyle = '#b9b1a2'; ctx.lineWidth = 1.5; ctx.stroke();

  // شیروانی
  ctx.fillStyle = '#a1553a';
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 9 * scale, y - h);
  ctx.lineTo(x, y - h - 30 * scale);
  ctx.lineTo(x + w / 2 + 9 * scale, y - h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7d3f2b'; ctx.stroke();

  // هلال احمر
  ctx.fillStyle = '#e0435a';
  ctx.beginPath();
  ctx.arc(x, y - h * 0.60, 12 * scale, 0.55, Math.PI * 2 - 0.55);
  ctx.arc(x + 4.5 * scale, y - h * 0.60, 9.5 * scale, Math.PI * 2 - 0.8, 0.8, true);
  ctx.closePath();
  ctx.fill();

  // در و پنجره
  ctx.fillStyle = '#7a5a3c';
  rr(ctx, x - 12 * scale, y - h * 0.36, 24 * scale, h * 0.36, 3 * scale); ctx.fill();
  ctx.fillStyle = '#9fd0e8';
  rr(ctx, x - w / 2 + 8 * scale, y - h * 0.34, 15 * scale, 14 * scale, 2 * scale); ctx.fill();
  rr(ctx, x + w / 2 - 23 * scale, y - h * 0.34, 15 * scale, 14 * scale, 2 * scale); ctx.fill();
  ctx.restore();

  if (showLabel) label(ctx, x, y - h - 44 * scale, 'درمانگاه روستا', { size: 11, color: P.ink });
}

/** ایوان/سکوی چوبی */
export function balcony(ctx, x, y, w, P) {
  ctx.save();
  ctx.fillStyle = P.woodDark;
  rr(ctx, x - w / 2, y, w, 10, 3); ctx.fill();
  ctx.fillStyle = P.wood;
  rr(ctx, x - w / 2, y - 4, w, 8, 3); ctx.fill();
  ctx.strokeStyle = P.woodDark; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 8, y + 10); ctx.lineTo(x - w / 2 + 14, y + 30);
  ctx.moveTo(x + w / 2 - 8, y + 10); ctx.lineTo(x + w / 2 - 14, y + 30);
  ctx.stroke();
  ctx.restore();
}

/**
 * پس‌زمینه: آسمان، خورشید، ابر، کوه‌ها، دشت.
 * groundY نسبت ارتفاع زمین است (۰ تا ۱)
 */
export function drawWorld(ctx, w, h, P, time, opts = {}) {
  const { groundY = 0.80, trees = true, birds = true } = opts;
  const gy = h * groundY;

  // آسمان
  ctx.fillStyle = grad(ctx, 0, 0, 0, gy, [[0, P.skyTop], [0.55, P.skyMid], [1, P.skyLow]]);
  ctx.fillRect(0, 0, w, gy + 2);

  // خورشید
  const sx = w * 0.14, sy = h * 0.16;
  ctx.save();
  ctx.fillStyle = P.sunGlow;
  ctx.beginPath(); ctx.arc(sx, sy, 62, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.sun;
  ctx.beginPath(); ctx.arc(sx, sy, 30, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ابرها
  const clouds = [[0.30, 0.13, 62, 10], [0.62, 0.09, 84, 7], [0.86, 0.20, 52, 13]];
  for (const [fx, fy, size, speed] of clouds) {
    let x = (w * fx + time * speed) % (w + size * 2) - size;
    cloud(ctx, x, h * fy, size, 0.9);
  }

  // رشته‌کوه‌های پشت‌سرهم
  const far = ridge(3, 9, gy - h * 0.06, h * 0.44, -20, w + 20);
  drawRidge(ctx, far, gy, P.farRock, { snow: P.snow, snowLine: h * 0.12 });
  const mid = ridge(11, 8, gy - h * 0.02, h * 0.34, -30, w + 30);
  drawRidge(ctx, mid, gy, P.midRock, { snow: P.snow, snowLine: h * 0.2 });
  const near = ridge(23, 7, gy + h * 0.02, h * 0.2, -40, w + 40);
  drawRidge(ctx, near, gy, P.nearRock);

  if (trees) {
    const rng = makeRng(77);
    for (let i = 0; i < 12; i++) {
      const x = rng() * w;
      const th = 24 + rng() * 18;
      pine(ctx, x, gy + 1, th, P);
    }
  }

  if (birds) {
    bird(ctx, (w * 0.68 + time * 14) % (w + 60) - 30, h * 0.22 + Math.sin(time * 0.8) * 8, 9, time * 5);
    bird(ctx, (w * 0.74 + time * 14) % (w + 60) - 30, h * 0.27 + Math.sin(time * 0.8 + 1) * 8, 6, time * 5 + 1);
  }

  // دشت
  ctx.fillStyle = grad(ctx, 0, gy - 12, 0, h, [[0, P.grassTop], [0.22, P.grassLow], [0.3, P.soil], [1, P.soilDark]]);
  ctx.beginPath();
  ctx.moveTo(0, gy);
  for (let x = 0; x <= w; x += 24) ctx.lineTo(x, gy + Math.sin(x * 0.02 + 1.2) * 2.2);
  ctx.lineTo(w, h); ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // خط علف
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.20)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, gy);
  for (let x = 0; x <= w; x += 24) ctx.lineTo(x, gy + Math.sin(x * 0.02 + 1.2) * 2.2);
  ctx.stroke();
  ctx.restore();

  return gy;
}

export { label, fa };

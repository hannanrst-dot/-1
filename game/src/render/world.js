// پس‌زمینهٔ آرام و بی‌حاشیهٔ صحنه — چیزی که حواس را از اندازه‌گیری پرت نکند
import { grad, rr } from './draw.js';

/**
 * زمینِ آزمایشگاه: یک شیبِ ملایمِ رنگی، خط زمین و شبکهٔ کمکی.
 * برمی‌گرداند: ارتفاع خط زمین بر حسب پیکسل.
 */
export function drawWorld(ctx, w, h, P, opts = {}) {
  const { groundRatio = 0.80, grid = true } = opts;
  const gy = Math.round(h * groundRatio);

  // آسمان/زمینهٔ کاری
  ctx.fillStyle = grad(ctx, 0, 0, 0, gy, [[0, P.skyTop], [1, P.skyLow]]);
  ctx.fillRect(0, 0, w, gy);

  // شبکهٔ کمکی — مانند کاغذ میلی‌متری، برای حس اندازه
  if (grid) {
    ctx.save();
    ctx.strokeStyle = P.gridLine;
    ctx.lineWidth = 1;
    const s = 40;
    ctx.beginPath();
    for (let x = s; x < w; x += s) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, gy); }
    for (let y = gy - s; y > 0; y -= s) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();
    ctx.restore();
  }

  // زمین، با هاشورِ ملایمِ نقشه‌کشی
  ctx.fillStyle = grad(ctx, 0, gy, 0, h, [[0, P.ground], [1, P.groundDeep]]);
  ctx.fillRect(0, gy, w, h - gy);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, gy, w, h - gy); ctx.clip();
  ctx.strokeStyle = P.groundLine;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = -(h - gy); x < w; x += 13) { ctx.moveTo(x, h); ctx.lineTo(x + (h - gy), gy); }
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = P.groundLine;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, gy + 1); ctx.lineTo(w, gy + 1);
  ctx.stroke();

  return gy;
}

/** دیوارهٔ سنگی/بتنی که رمپ یا تیرک به آن تکیه می‌کند */
export function wall(ctx, x0, x1, topY, bottomY, P) {
  ctx.save();
  ctx.fillStyle = grad(ctx, x0, topY, x1, bottomY, [[0, P.structure], [1, P.structureDeep]]);
  rr(ctx, x0, topY, x1 - x0, bottomY - topY, 3);
  ctx.fill();
  ctx.strokeStyle = P.structureLine;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // درزهای آجرچینی
  ctx.save();
  rr(ctx, x0, topY, x1 - x0, bottomY - topY, 3);
  ctx.clip();
  ctx.strokeStyle = P.structureLine;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  for (let y = topY + 24; y < bottomY; y += 24) {
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

/** سکوی افقی (برای ایستادن یا نصب تیر) */
export function platform(ctx, x, y, width, P) {
  ctx.save();
  ctx.fillStyle = P.structure;
  rr(ctx, x - width / 2, y, width, 11, 3);
  ctx.fill();
  ctx.strokeStyle = P.structureLine;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

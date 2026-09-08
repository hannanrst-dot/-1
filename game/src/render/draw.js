// ابزارهای پایهٔ نقاشی روی بوم — همهٔ صحنه‌ها از این‌ها استفاده می‌کنند
import { fa, num, clamp, lerp } from '../core/format.js';

/** پالت رنگ صحنه (در تم تیره کمی کدرتر می‌شود) */
export const PALETTE = {
  light: {
    skyTop: '#eaf4fa', skyMid: '#eff6fb', skyLow: '#f7fbfd',
    gridLine: 'rgba(28, 70, 105, .07)', gridStrong: 'rgba(28, 70, 105, .30)',
    ground: '#cfd9e2', groundDeep: '#b6c3d0', groundLine: '#8fa1b2',
    structure: '#c3ccd6', structureDeep: '#a3aeba', structureLine: '#7f8c9a',
    wood: '#c08b4f', woodDark: '#8d6134', woodLight: '#dcae74',
    rope: '#b98a55', ropeDark: '#8a6136',
    metal: '#8fa2b5', metalDark: '#5d7186', metalLight: '#c3d1de',
    crate: '#d09a5c', crateDark: '#9a6c37',
    stone: '#8d8378', stoneDark: '#6a6157',
    ink: '#1d3247', inkSoft: '#4a627a', paper: '#ffffff',
    ok: '#12a06a', bad: '#e0435a', effort: '#ef7d17', load: '#2b6fd6',
    friction: '#b5477f', normal: '#0f9b8e'
  },
  dark: {
    skyTop: '#101d29', skyMid: '#13212e', skyLow: '#162836',
    gridLine: 'rgba(160, 200, 230, .07)', gridStrong: 'rgba(160, 200, 230, .28)',
    ground: '#1c2a37', groundDeep: '#16212c', groundLine: '#3a5062',
    structure: '#2a3a49', structureDeep: '#202d39', structureLine: '#45596b',
    wood: '#9b6f3f', woodDark: '#6d4b28', woodLight: '#b98a56',
    rope: '#9a7549', ropeDark: '#6f5334',
    metal: '#647689', metalDark: '#3d4c5b', metalLight: '#8ea0b1',
    crate: '#a87a45', crateDark: '#77542c',
    stone: '#5f5a53', stoneDark: '#46423c',
    ink: '#e8f1f8', inkSoft: '#a8becf', paper: '#132433',
    ok: '#3ed99b', bad: '#ff7b8a', effort: '#fbb03b', load: '#6fa8ff',
    friction: '#e08ab8', normal: '#4fd0c4'
  }
};

/** پالت فعال — تا برچسب‌ها در تم تیره هم خوانا بمانند */
let ACTIVE = PALETTE.light;
export function setPalette(p) { ACTIVE = p; }

/** مستطیل گردگوشه */
export function rr(ctx, x, y, w, h, r = 6) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

/** گرادیان خطی سریع */
export function grad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [pos, color] of stops) g.addColorStop(pos, color);
  return g;
}

/** متن با پس‌زمینهٔ کوچک (برچسب روی صحنه) */
export function label(ctx, x, y, text, opts = {}) {
  const {
    size = 12, weight = 700, color = ACTIVE.ink, bg = `${ACTIVE.paper}ee`,
    border = ACTIVE === PALETTE.dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.10)',
    align = 'center', pad = 5, radius = 7
  } = opts;
  ctx.save();
  ctx.font = `${weight} ${size}px Vazirmatn, Tahoma, sans-serif`;
  ctx.direction = 'rtl';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + pad * 2;
  const h = size + pad * 1.7;
  let bx = x - w / 2;
  if (align === 'start') bx = x - w;
  if (align === 'end') bx = x;
  if (bg) {
    ctx.fillStyle = bg;
    rr(ctx, bx, y - h / 2, w, h, radius);
    ctx.fill();
    if (border) { ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.stroke(); }
  }
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, bx + w / 2, y + 0.5);
  ctx.restore();
}

/** پیکان نیرو با برچسب */
export function arrow(ctx, x1, y1, x2, y2, opts = {}) {
  const { color = '#ef7d17', width = 3.5, head = 10, text = null, dashed = false, textSize = 11, labelAt = 'middle' } = opts;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  if (dashed) ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(ang) * head * 0.8, y2 - Math.sin(ang) * head * 0.8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(ang - 0.4) * head, y2 - Math.sin(ang - 0.4) * head);
  ctx.lineTo(x2 - Math.cos(ang + 0.4) * head, y2 - Math.sin(ang + 0.4) * head);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  if (text) {
    const mx = labelAt === 'tip' ? x2 + Math.cos(ang) * 20 : (x1 + x2) / 2 - Math.sin(ang) * 13;
    const my = labelAt === 'tip' ? y2 + Math.sin(ang) * 14 : (y1 + y2) / 2 + Math.cos(ang) * 13;
    label(ctx, mx, my, text, { size: textSize, color });
  }
}

/** خط اندازه‌گیری با دو سرِ کوتاه و برچسب وسط */
export function dim(ctx, x1, y1, x2, y2, text, opts = {}) {
  const { color = '#4a627a', offset = 0, size = 11 } = opts;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const ox = -Math.sin(ang) * offset;
  const oy = Math.cos(ang) * offset;
  const ax = x1 + ox, ay = y1 + oy, bx = x2 + ox, by = y2 + oy;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ax, ay);
  ctx.moveTo(x2, y2); ctx.lineTo(bx, by);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  for (const [px, py, dir] of [[ax, ay, 1], [bx, by, -1]]) {
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(ang + 0.35) * 8 * dir, py + Math.sin(ang + 0.35) * 8 * dir);
    ctx.lineTo(px + Math.cos(ang - 0.35) * 8 * dir, py + Math.sin(ang - 0.35) * 8 * dir);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }
  ctx.restore();
  if (text) label(ctx, (ax + bx) / 2, (ay + by) / 2, text, { size, color });
}

/** کمان زاویه با برچسب درجه */
export function angleArc(ctx, x, y, radius, a0, a1, text, color = '#4a627a') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, radius, a0, a1, a1 < a0);
  ctx.stroke();
  ctx.restore();
  if (text) {
    const mid = (a0 + a1) / 2;
    label(ctx, x + Math.cos(mid) * (radius + 15), y + Math.sin(mid) * (radius + 15), text, { size: 11, color });
  }
}

/** تختهٔ چوبی با رگه (زاویه بر حسب رادیان، حول نقطهٔ شروع) */
export function plank(ctx, x, y, w, h, angle, P, opts = {}) {
  const { radius = 3 } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = grad(ctx, 0, 0, 0, h, [[0, P.woodLight], [0.45, P.wood], [1, P.woodDark]]);
  rr(ctx, 0, 0, w, h, radius);
  ctx.fill();
  ctx.strokeStyle = P.woodDark;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.10)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(4, (h / 3) * i);
    ctx.lineTo(w - 4, (h / 3) * i + (i % 2 ? 1 : -1));
    ctx.stroke();
  }
  ctx.restore();
}

/** صندوق بار با علامت هلال‌احمر و برچسب جرم */
export function crate(ctx, x, y, size, angle, P, opts = {}) {
  const { massKg = null, shadow = true } = opts;
  const w = size, h = size * 0.82;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (shadow) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.16)';
    ctx.beginPath();
    ctx.ellipse(0, h / 2 + 4, w / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = grad(ctx, -w / 2, -h / 2, w / 2, h / 2, [[0, P.crate], [1, P.crateDark]]);
  rr(ctx, -w / 2, -h / 2, w, h, 4);
  ctx.fill();
  ctx.strokeStyle = P.crateDark; ctx.lineWidth = 2; ctx.stroke();
  // نوارهای ضربدری
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 3, -h / 2 + 3); ctx.lineTo(w / 2 - 3, h / 2 - 3);
  ctx.moveTo(w / 2 - 3, -h / 2 + 3); ctx.lineTo(-w / 2 + 3, h / 2 - 3);
  ctx.stroke();
  // هلال احمر
  ctx.fillStyle = '#e0435a';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.17, 0.5, Math.PI * 2 - 0.5);
  ctx.arc(size * 0.055, 0, size * 0.135, Math.PI * 2 - 0.75, 0.75, true);
  ctx.closePath();
  ctx.fill();
  if (massKg !== null) {
    label(ctx, 0, h / 2 - 8, `${fa(massKg)} کیلوگرم`, { size: 10, color: '#5b3a12', bg: 'rgba(255,255,255,.88)' });
  }
  ctx.restore();
}

/** طناب با افتادگی طبیعی بین دو نقطه */
export function rope(ctx, pts, P, opts = {}) {
  const { width = 3, sag = 0, color = null } = opts;
  if (pts.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color || P.rope;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if (sag > 0) {
      ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag, x1, y1);
    } else {
      ctx.lineTo(x1, y1);
    }
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.28)';
  ctx.lineWidth = Math.max(1, width * 0.32);
  ctx.stroke();
  ctx.restore();
}

/** چرخ قرقره */
export function sheave(ctx, x, y, r, angle, P, opts = {}) {
  const { mount = 'none' } = opts; // 'top' | 'hook' | 'none'
  ctx.save();
  if (mount === 'top') {
    ctx.strokeStyle = P.metalDark; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(x, y - r - 16); ctx.lineTo(x, y); ctx.stroke();
    ctx.fillStyle = P.metalDark;
    rr(ctx, x - 5, y - r - 20, 10, 8, 2); ctx.fill();
  }
  ctx.translate(x, y);
  ctx.fillStyle = grad(ctx, -r, -r, r, r, [[0, P.metalLight], [1, P.metalDark]]);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = P.metalDark; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = P.woodDark;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(angle);
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, 0); ctx.lineTo(r * 0.6, 0);
    ctx.stroke();
    ctx.rotate(Math.PI / 4);
  }
  ctx.rotate(-angle - Math.PI);
  ctx.fillStyle = P.metalLight;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = P.metalDark; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.restore();
  if (mount === 'hook') {
    ctx.save();
    ctx.strokeStyle = P.metalDark; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y + r); ctx.lineTo(x, y + r + 12); ctx.stroke();
    ctx.restore();
  }
}

/** چرخ‌دنده */
export function gear(ctx, x, y, r, teeth, angle, color, P) {
  const inner = r * 0.78;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const step = (Math.PI * 2) / teeth / 4;
    ctx.lineTo(Math.cos(a0) * inner, Math.sin(a0) * inner);
    ctx.lineTo(Math.cos(a0 + step) * r, Math.sin(a0 + step) * r);
    ctx.lineTo(Math.cos(a0 + step * 2) * r, Math.sin(a0 + step * 2) * r);
    ctx.lineTo(Math.cos(a0 + step * 3) * inner, Math.sin(a0 + step * 3) * inner);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = P.paper;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.stroke();
  // پره‌ها برای دیده شدن چرخش
  ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos((i / 3) * Math.PI * 2) * inner * 0.85, Math.sin((i / 3) * Math.PI * 2) * inner * 0.85);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * پیکرهٔ آزمایشگر.
 * همهٔ اندام‌ها حول «لگن» می‌چرخند تا تنه و پاها هیچ‌وقت از هم جدا نیفتند.
 * pose: 'pull' | 'push' | 'crank' | 'hammer' | 'idle'
 * dir: ۱ رو به راست، ۱- رو به چپ
 * effort: ۰ تا ۱ — هرچه بیشتر، خمیدگی بدن بیشتر
 */
export function person(ctx, x, y, height, opts = {}) {
  const {
    P, pose = 'idle', dir = -1, t = 0, effort = 0.4,
    skin = '#efbf95', shirt = '#e07a2c', pants = '#33506f'
  } = opts;
  const s = height / 100;
  const HIP = -36;                       // ارتفاع لگن بر حسب واحد پیکره
  const lean = pose === 'pull' ? -0.16 - effort * 0.20
    : pose === 'push' ? 0.12 + effort * 0.14 : 0;
  const bob = pose === 'idle' ? Math.sin(t * 2) * 0.8 : Math.sin(t * 6) * (1 + effort * 1.6);
  const stride = pose === 'pull' ? 17 : pose === 'push' ? 14 : 8;

  ctx.save();
  ctx.translate(x, y + bob * s);
  ctx.scale(dir, 1);

  // سایه
  ctx.fillStyle = 'rgba(0,0,0,.14)';
  ctx.beginPath(); ctx.ellipse(0, 1.5 * s, 19 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();

  // پاها — از لگن تا کف
  ctx.lineCap = 'round';
  ctx.strokeStyle = pants; ctx.lineWidth = 8 * s;
  ctx.beginPath();
  ctx.moveTo(0, HIP * s); ctx.lineTo(-stride * s, -2 * s);
  ctx.moveTo(0, HIP * s); ctx.lineTo(stride * 0.5 * s, -2 * s);
  ctx.stroke();
  // کفش
  ctx.strokeStyle = '#3a2b1e'; ctx.lineWidth = 5.5 * s;
  ctx.beginPath();
  ctx.moveTo(-stride * s, 0); ctx.lineTo((-stride - 5) * s, 0);
  ctx.moveTo(stride * 0.5 * s, 0); ctx.lineTo((stride * 0.5 + 5) * s, 0);
  ctx.stroke();

  // ── از اینجا به بعد همه‌چیز حول لگن می‌چرخد ──
  ctx.translate(0, HIP * s);
  ctx.rotate(lean);

  // تنه (کمی پایین‌تر از لگن کشیده می‌شود تا درز دیده نشود)
  ctx.fillStyle = shirt;
  rr(ctx, -8.5 * s, -34 * s, 17 * s, 38 * s, 7 * s);
  ctx.fill();
  // کمربند
  ctx.fillStyle = 'rgba(0,0,0,.16)';
  rr(ctx, -8.5 * s, -3 * s, 17 * s, 6 * s, 3 * s);
  ctx.fill();
  // مفصل لگن
  ctx.fillStyle = pants;
  ctx.beginPath(); ctx.arc(0, 0, 8 * s, 0, Math.PI * 2); ctx.fill();

  // گردن و سر
  ctx.strokeStyle = skin; ctx.lineWidth = 6 * s;
  ctx.beginPath(); ctx.moveTo(0, -33 * s); ctx.lineTo(0, -38 * s); ctx.stroke();
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(0, -47 * s, 11 * s, 0, Math.PI * 2); ctx.fill();
  // مو
  ctx.fillStyle = '#43301f';
  ctx.beginPath();
  ctx.arc(0, -48 * s, 11.2 * s, Math.PI * 1.05, Math.PI * 2.05);
  ctx.closePath(); ctx.fill();
  // چشم و دهان
  ctx.fillStyle = '#22303f';
  ctx.beginPath(); ctx.arc(6 * s, -47 * s, 1.6 * s, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#22303f'; ctx.lineWidth = 1.3 * s;
  ctx.beginPath();
  if (effort > 0.7) ctx.arc(5 * s, -41.5 * s, 2.2 * s, 0, Math.PI);
  else ctx.arc(5 * s, -43 * s, 2.4 * s, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // بازوها — شانه در ارتفاع ۳۰- نسبت به لگن
  const shoulder = [0, -30 * s];
  let hand = [14 * s, -14 * s];
  let elbow = [9 * s, -22 * s];
  if (pose === 'pull') {
    hand = [24 * s, (-17 + Math.sin(t * 6) * 1.2) * s];
    elbow = [13 * s, -24 * s];
  } else if (pose === 'push') {
    hand = [22 * s, -27 * s];
    elbow = [12 * s, -29 * s];
  } else if (pose === 'crank') {
    const a = t * 3;
    hand = [(15 + Math.cos(a) * 8) * s, (-23 + Math.sin(a) * 8) * s];
    elbow = [10 * s, -26 * s];
  } else if (pose === 'up') {
    hand = [9 * s, (-48 + Math.sin(t * 5) * 1.5) * s];
    elbow = [12 * s, -38 * s];
  } else if (pose === 'hammer') {
    const a = Math.sin(t * 5) * 0.9 - 1;
    hand = [(15 + Math.cos(a) * 12) * s, (-27 + Math.sin(a) * 12) * s];
    elbow = [8 * s, -29 * s];
  }
  ctx.strokeStyle = skin; ctx.lineWidth = 6.5 * s;
  ctx.beginPath();
  ctx.moveTo(shoulder[0], shoulder[1]);
  ctx.lineTo(elbow[0], elbow[1]);
  ctx.lineTo(hand[0], hand[1]);
  ctx.stroke();
  // بازوی دور (کمی تیره‌تر برای حس عمق)
  ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 6.5 * s;
  ctx.beginPath();
  ctx.moveTo(shoulder[0] - 2 * s, shoulder[1] + 1 * s);
  ctx.lineTo(elbow[0] - 3 * s, elbow[1] + 3 * s);
  ctx.lineTo(hand[0] - 3 * s, hand[1] + 3 * s);
  ctx.stroke();
  ctx.restore();

  // مختصات دستِ کاری در فضای صفحه (برای وصل کردن طناب یا دسته)
  const c = Math.cos(lean), sn = Math.sin(lean);
  return {
    x: x + dir * (hand[0] * c - hand[1] * sn),
    y: y + bob * s + HIP * s + (hand[0] * sn + hand[1] * c)
  };
}

/**
 * نیروسنج (دینامومتر) — ابزار اندازه‌گیریِ روی طناب.
 * عدد را هم روی عقربه و هم به شکل رقمی نشان می‌دهد.
 */
export function gauge(ctx, x, y, valueN, maxN, P, opts = {}) {
  const { title = 'نیروسنج', angle = 0 } = opts;
  const w = 86, h = 44;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.fillStyle = ACTIVE.paper;
  rr(ctx, -w / 2, -h / 2, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = ACTIVE === PALETTE.dark ? 'rgba(255,255,255,.22)' : 'rgba(20,40,60,.28)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // کمان مدرج
  const cx = 0, cy = h / 2 - 9, r = 22;
  ctx.strokeStyle = ACTIVE.inkSoft;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.stroke();
  for (let i = 0; i <= 4; i++) {
    const a = Math.PI + (Math.PI * i) / 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4));
    ctx.stroke();
  }
  // عقربه
  const k = clamp(valueN / (maxN || 1), 0, 1);
  const a = Math.PI + Math.PI * k;
  ctx.strokeStyle = k > 0.85 ? '#d33b4a' : '#0b7fc4';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
  ctx.stroke();
  ctx.fillStyle = ACTIVE.ink;
  ctx.beginPath(); ctx.arc(cx, cy, 2.6, 0, Math.PI * 2); ctx.fill();

  // عدد
  ctx.font = `800 13px Vazirmatn, Tahoma, sans-serif`;
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = ACTIVE.ink;
  ctx.fillText(`${fa(Math.round(valueN))} N`, 0, -h / 2 + 12);
  ctx.font = `600 8.5px Vazirmatn, Tahoma, sans-serif`;
  ctx.fillStyle = ACTIVE.inkSoft;
  ctx.fillText(title, 0, -h / 2 + 24);
  ctx.restore();
}

/** ذرات (گرد و خاک، جرقه) */
export class Particles {
  constructor() { this.items = []; }
  burst(x, y, count, color, opts = {}) {
    const { speed = 3, life = 0.9, size = 4, gravity = 0.12, spread = Math.PI * 2, dir = 0 } = opts;
    for (let i = 0; i < count; i++) {
      const a = dir + (Math.random() - 0.5) * spread;
      const sp = speed * (0.4 + Math.random() * 0.9);
      this.items.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6,
        life: life * (0.6 + Math.random() * 0.7), age: 0,
        size: size * (0.6 + Math.random() * 0.8), color, gravity
      });
    }
  }
  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.age += dt;
      if (p.age >= p.life) this.items.splice(i, 1);
    }
  }
  draw(ctx) {
    for (const p of this.items) {
      const k = 1 - p.age / p.life;
      ctx.save();
      ctx.globalAlpha = clamp(k, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.4 + k * 0.8), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  clear() { this.items.length = 0; }
}

export { fa, num, clamp, lerp };

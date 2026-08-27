// ابزارهای پایهٔ نقاشی روی بوم — همهٔ صحنه‌ها از این‌ها استفاده می‌کنند
import { fa, num, clamp, lerp } from '../core/format.js';

/** پالت رنگ صحنه (در تم تیره کمی کدرتر می‌شود) */
export const PALETTE = {
  light: {
    skyTop: '#8fd0f2', skyMid: '#bfe6fa', skyLow: '#e6f5fd',
    sun: '#fff3c4', sunGlow: 'rgba(255,236,150,.55)',
    farRock: '#93a9c4', midRock: '#6f88ab', nearRock: '#55708f',
    snow: '#f4f9ff', grassTop: '#7cbf6a', grassLow: '#5aa356',
    soil: '#8a6a4a', soilDark: '#6f5238',
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
    skyTop: '#16324a', skyMid: '#1d4260', skyLow: '#255074',
    sun: '#f6e6a8', sunGlow: 'rgba(246,230,168,.20)',
    farRock: '#2c4258', midRock: '#243849', nearRock: '#1c2c3b',
    snow: '#cfe3f2', grassTop: '#2f5f43', grassLow: '#244a35',
    soil: '#3f3226', soilDark: '#2e251c',
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
    size = 12, weight = 700, color = '#1d3247', bg = 'rgba(255,255,255,.92)',
    border = 'rgba(0,0,0,.10)', align = 'center', pad = 5, radius = 7
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
  const { color = '#ef7d17', width = 3.5, head = 10, text = null, dashed = false, textSize = 11 } = opts;
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
    const mx = (x1 + x2) / 2 - Math.sin(ang) * 13;
    const my = (y1 + y2) / 2 + Math.cos(ang) * 13;
    label(ctx, mx, my, text, { size: textSize, color, bg: 'rgba(255,255,255,.9)' });
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
  if (text) label(ctx, (ax + bx) / 2, (ay + by) / 2, text, { size, color, bg: 'rgba(255,255,255,.92)' });
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
 * شخصیت بازی.
 * pose: 'pull' | 'push' | 'crank' | 'hammer' | 'idle' | 'cheer'
 * dir: ۱ رو به راست، ۱- رو به چپ
 * effortLevel: ۰ تا ۱ — هرچه بیشتر، خمیدگی بدن بیشتر
 */
export function person(ctx, x, y, height, opts = {}) {
  const {
    P, pose = 'idle', dir = -1, t = 0, effort = 0.4, skin = '#f2c396',
    shirt = '#f07f24', pants = '#31527a', hat = '#1f9d63'
  } = opts;
  const s = height / 100;
  const lean = pose === 'pull' ? -0.18 - effort * 0.22 : pose === 'push' ? 0.12 + effort * 0.16 : 0;
  const bob = pose === 'idle' ? Math.sin(t * 2) * 1.2 : Math.sin(t * 7) * (1.5 + effort * 2);

  ctx.save();
  ctx.translate(x, y + bob * s);
  ctx.scale(dir, 1);

  // سایه
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  ctx.beginPath(); ctx.ellipse(0, 2 * s, 20 * s, 4.5 * s, 0, 0, Math.PI * 2); ctx.fill();

  const stride = pose === 'pull' ? 16 : pose === 'push' ? 13 : 7;
  // پاها
  ctx.strokeStyle = pants; ctx.lineWidth = 7 * s; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -34 * s); ctx.lineTo(-stride * s, 0);
  ctx.moveTo(0, -34 * s); ctx.lineTo(stride * 0.55 * s, 0);
  ctx.stroke();
  // کفش
  ctx.strokeStyle = '#3b2a1d'; ctx.lineWidth = 5 * s;
  ctx.beginPath();
  ctx.moveTo(-stride * s, 0); ctx.lineTo((-stride - 5) * s, 0);
  ctx.moveTo(stride * 0.55 * s, 0); ctx.lineTo((stride * 0.55 + 5) * s, 0);
  ctx.stroke();

  ctx.rotate(lean);

  // تنه
  ctx.fillStyle = shirt;
  rr(ctx, -8 * s, -70 * s, 16 * s, 38 * s, 6 * s);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.12)';
  rr(ctx, -8 * s, -44 * s, 16 * s, 12 * s, 4 * s);
  ctx.fill();

  // سر
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(0, -80 * s, 11 * s, 0, Math.PI * 2); ctx.fill();
  // کلاه
  ctx.fillStyle = hat;
  ctx.beginPath();
  ctx.arc(0, -82 * s, 11.5 * s, Math.PI, 0);
  ctx.lineTo(14 * s, -82 * s); ctx.lineTo(-12 * s, -82 * s);
  ctx.closePath(); ctx.fill();
  // چشم
  ctx.fillStyle = '#243244';
  ctx.beginPath(); ctx.arc(6 * s, -80 * s, 1.7 * s, 0, Math.PI * 2); ctx.fill();
  // دهان (تلاش)
  ctx.strokeStyle = '#243244'; ctx.lineWidth = 1.4 * s;
  ctx.beginPath();
  if (effort > 0.7) ctx.arc(5 * s, -75 * s, 2.4 * s, 0, Math.PI);
  else ctx.arc(5 * s, -76 * s, 2.6 * s, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // بازوها
  ctx.strokeStyle = skin; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
  let hand = [18 * s, -58 * s];
  ctx.beginPath();
  if (pose === 'pull') {
    hand = [24 * s, -52 * s - Math.sin(t * 7) * 2 * s];
    ctx.moveTo(-2 * s, -64 * s); ctx.lineTo(12 * s, -58 * s); ctx.lineTo(hand[0], hand[1]);
  } else if (pose === 'push') {
    hand = [22 * s, -62 * s];
    ctx.moveTo(-2 * s, -64 * s); ctx.lineTo(12 * s, -63 * s); ctx.lineTo(hand[0], hand[1]);
  } else if (pose === 'crank') {
    const a = t * 3;
    hand = [(16 + Math.cos(a) * 8) * s, (-58 + Math.sin(a) * 8) * s];
    ctx.moveTo(-2 * s, -64 * s); ctx.lineTo(10 * s, -60 * s); ctx.lineTo(hand[0], hand[1]);
  } else if (pose === 'hammer') {
    const a = Math.sin(t * 6) * 0.9;
    hand = [(16 + Math.cos(a - 1) * 12) * s, (-62 + Math.sin(a - 1) * 12) * s];
    ctx.moveTo(-2 * s, -64 * s); ctx.lineTo(8 * s, -64 * s); ctx.lineTo(hand[0], hand[1]);
  } else if (pose === 'cheer') {
    hand = [10 * s, -96 * s];
    ctx.moveTo(-2 * s, -64 * s); ctx.lineTo(10 * s, -80 * s); ctx.lineTo(hand[0], hand[1]);
    ctx.moveTo(-2 * s, -64 * s); ctx.lineTo(-12 * s, -80 * s); ctx.lineTo(-12 * s, -96 * s);
  } else {
    ctx.moveTo(-2 * s, -64 * s); ctx.lineTo(10 * s, -50 * s);
  }
  ctx.stroke();
  ctx.restore();

  // مختصات دستِ کاری در فضای صفحه (برای وصل کردن طناب)
  const cos = Math.cos(lean), sin = Math.sin(lean);
  return {
    x: x + dir * (hand[0] * cos - hand[1] * sin),
    y: y + bob * s + (hand[0] * sin + hand[1] * cos)
  };
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

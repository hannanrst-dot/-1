import { Arrow, ArrowType, Target } from '../types/game';
import { VW, GROUND_Y, fa } from './world';
import { rectGlow, circleGlow, hexGlow, softDot, blit, blitScaled, outlinedText } from './glow';

export const FONT = 'Vazirmatn, "Segoe UI", Tahoma, sans-serif';

export function font(ctx: CanvasRenderingContext2D, size: number, weight: number | string = 700) {
  ctx.font = `${weight} ${size}px ${FONT}`;
}

export function measure(ctx: CanvasRenderingContext2D, text: string, size: number, weight = 700) {
  font(ctx, size, weight);
  return ctx.measureText(text).width;
}

/** آماده‌سازی متن فارسی روی بوم */
function rtlText(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

const ARROW_COLOR: Record<ArrowType, string> = {
  standard: '#fbbf24',
  fire: '#fb7185',
  slow_mo: '#38bdf8',
  piercing: '#c084fc',
  multi_shot: '#34d399',
};

export const arrowColor = (t: ArrowType) => ARROW_COLOR[t] || '#fbbf24';

/* ═══════════ گویچه/لوح واژه ═══════════ */

export function drawWordTablet(
  ctx: CanvasRenderingContext2D,
  t: Target,
  time: number,
  opts: { projector: boolean; reveal: 'none' | 'right' | 'wrong'; fontSize: number }
) {
  const bob = Math.sin(t.bob) * 5;
  const shake = t.shudder > 0 ? (Math.random() - 0.5) * t.shudder * 1.6 : 0;
  const x = t.x + shake;
  const y = t.y + bob;

  const pop = easeOutBack(Math.min(1, t.spawnT));
  const fade = t.dying > 0 ? Math.max(0, 1 - t.dying) : 1;
  const s = pop * (1 + (t.dying > 0 ? t.dying * 0.5 : 0));

  const w = t.halfW * 2;
  const h = t.halfH * 2;
  const base = `hsl(${t.hue} 70% 55%)`;
  const deep = `hsl(${t.hue} 72% 22%)`;
  const glow =
    opts.reveal === 'right' ? '#34d399' : opts.reveal === 'wrong' ? '#f87171' : `hsl(${t.hue} 85% 65%)`;

  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(x, y);
  ctx.scale(s, s);

  // حلقهٔ رون چرخان
  ctx.save();
  ctx.rotate(t.spin);
  ctx.strokeStyle = glow;
  ctx.globalAlpha = fade * 0.5;
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 11]);
  ctx.beginPath();
  ctx.ellipse(0, 0, t.halfW + 15, t.halfH + 15, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // هالهٔ از پیش‌ساخته پشت بدنه
  blit(ctx, rectGlow(w, h, 20, opts.projector ? 34 : 24, glow, 2), 0, 0, fade);

  // بدنه
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, 'rgba(15,23,42,0.96)');
  g.addColorStop(0.55, deep);
  g.addColorStop(1, 'rgba(9,13,26,0.98)');
  ctx.fillStyle = g;
  roundRect(ctx, -t.halfW, -t.halfH, w, h, 20);
  ctx.fill();

  ctx.strokeStyle = glow;
  ctx.lineWidth = opts.projector ? 3.6 : 2.8;
  ctx.stroke();

  // درخشش داخلی بالا
  ctx.save();
  ctx.globalAlpha = fade * (0.16 + 0.1 * Math.sin(time * 2 + t.bob));
  ctx.fillStyle = base;
  roundRect(ctx, -t.halfW + 5, -t.halfH + 5, w - 10, h * 0.42, 14);
  ctx.fill();
  ctx.restore();

  // زینت گوشه‌ها
  ctx.strokeStyle = glow;
  ctx.globalAlpha = fade * 0.85;
  ctx.lineWidth = 2.4;
  const c = 12;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(sx * (t.halfW - 3), sy * (t.halfH - 3) - sy * c);
    ctx.lineTo(sx * (t.halfW - 3), sy * (t.halfH - 3));
    ctx.lineTo(sx * (t.halfW - 3) - sx * c, sy * (t.halfH - 3));
    ctx.stroke();
  });
  ctx.globalAlpha = fade;

  // واژه
  rtlText(ctx);
  font(ctx, opts.fontSize, 800);
  ctx.fillStyle = opts.reveal === 'wrong' ? '#fecaca' : '#ffffff';
  outlinedText(ctx, t.text, 0, 1, 4);

  // علامت درست/غلط پس از داوری
  if (opts.reveal !== 'none') {
    font(ctx, opts.fontSize * 0.95, 800);
    ctx.fillStyle = glow;
    outlinedText(ctx, opts.reveal === 'right' ? '✔' : '✘', t.halfW + 22, 0, 4);
  }
  ctx.restore();
}

/* ═══════════ بلور حرف ═══════════ */

export function drawLetterCrystal(
  ctx: CanvasRenderingContext2D,
  t: Target,
  time: number,
  opts: { projector: boolean; reveal: 'none' | 'right' | 'wrong'; fontSize: number }
) {
  const bob = Math.sin(t.bob) * 5;
  const shake = t.shudder > 0 ? (Math.random() - 0.5) * t.shudder * 1.6 : 0;
  const pop = easeOutBack(Math.min(1, t.spawnT));
  const fade = t.dying > 0 ? Math.max(0, 1 - t.dying) : 1;
  const r = t.radius;
  const glow =
    opts.reveal === 'right' ? '#34d399' : opts.reveal === 'wrong' ? '#f87171' : `hsl(${t.hue} 88% 66%)`;

  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(t.x + shake, t.y + bob);
  ctx.scale(pop, pop);

  // هالهٔ نبض‌دار — نقطهٔ نورانیِ از پیش‌ساخته
  blitScaled(ctx, softDot(glow, 4, 26), 0, 0, r * 3.4, fade * (0.30 + 0.16 * Math.sin(time * 3 + t.bob)));
  blit(ctx, hexGlow(r, opts.projector ? 30 : 22, glow), 0, 0, fade);

  ctx.rotate(t.spin * 0.4);

  // شش‌ضلعی بلورین
  const g = ctx.createLinearGradient(0, -r, 0, r);
  g.addColorStop(0, `hsl(${t.hue} 78% 40%)`);
  g.addColorStop(0.5, 'rgba(12,18,34,0.96)');
  g.addColorStop(1, `hsl(${t.hue} 70% 26%)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = glow;
  ctx.lineWidth = opts.projector ? 3.4 : 2.6;
  ctx.stroke();

  // وجه‌های بلور
  ctx.globalAlpha = fade * 0.28;
  ctx.beginPath();
  ctx.moveTo(0, -r); ctx.lineTo(0, r);
  ctx.moveTo(-r * 0.86, -r * 0.5); ctx.lineTo(r * 0.86, r * 0.5);
  ctx.moveTo(-r * 0.86, r * 0.5); ctx.lineTo(r * 0.86, -r * 0.5);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = fade;

  ctx.rotate(-t.spin * 0.4);
  rtlText(ctx);
  font(ctx, opts.fontSize, 900);
  ctx.fillStyle = '#ffffff';
  outlinedText(ctx, t.text, 0, 2, 5);
  ctx.restore();
}

/* ═══════════ لوح جای خالی (حالت تیراندازی به حرف) ═══════════ */

export function drawSlotTablet(
  ctx: CanvasRenderingContext2D,
  prefix: string,
  suffix: string,
  filled: string | null,
  time: number,
  projector: boolean,
  flash: number
) {
  const size = projector ? 46 : 40;
  const padX = 30;
  const slotW = size * 1.15;
  const wPre = measure(ctx, prefix, size, 800);
  const wSuf = measure(ctx, suffix, size, 800);
  const inner = wPre + wSuf + slotW + 26;
  const boxW = inner + padX * 2;
  const boxH = size + 64;
  const cx = VW / 2;
  const y = 150;

  ctx.save();
  blit(ctx, rectGlow(boxW, boxH, 18, 26, '#f59e0b', 2), cx, y);
  const g = ctx.createLinearGradient(0, y - boxH / 2, 0, y + boxH / 2);
  g.addColorStop(0, 'rgba(30,25,10,0.95)');
  g.addColorStop(1, 'rgba(12,10,4,0.97)');
  ctx.fillStyle = g;
  roundRect(ctx, cx - boxW / 2, y - boxH / 2, boxW, boxH, 18);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.6;
  ctx.stroke();

  rtlText(ctx);
  font(ctx, size, 800);
  ctx.fillStyle = '#fef3c7';

  // چیدمان راست‌به‌چپ: پیشوند در سمت راست، سپس جای خالی، سپس پسوند
  const rightEdge = cx + inner / 2;
  const preCx = rightEdge - wPre / 2;
  const slotCx = rightEdge - wPre - 13 - slotW / 2;
  const sufCx = rightEdge - wPre - 26 - slotW - wSuf / 2;

  ctx.fillText(prefix, preCx, y - 8);
  ctx.fillText(suffix, sufCx, y - 8);

  // جای خالی
  const pulse = 0.55 + 0.45 * Math.sin(time * 4);
  ctx.save();
  if (filled) {
    blit(ctx, rectGlow(slotW, size * 1.44, 9, 24, '#34d399', 2), slotCx, y - 8, 0.6 + flash * 0.4);
    ctx.fillStyle = 'rgba(16,185,129,0.22)';
  } else {
    blit(ctx, rectGlow(slotW, size * 1.44, 9, 12, '#fbbf24'), slotCx, y - 8, pulse * 0.8);
    ctx.fillStyle = 'rgba(251,191,36,0.10)';
  }
  roundRect(ctx, slotCx - slotW / 2, y - 8 - size * 0.72, slotW, size * 1.44, 9);
  ctx.fill();
  ctx.strokeStyle = filled ? '#34d399' : `rgba(251,191,36,${0.4 + pulse * 0.5})`;
  ctx.lineWidth = 2.4;
  ctx.setLineDash(filled ? [] : [6, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  if (filled) {
    font(ctx, size * 1.05, 900);
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText(filled, slotCx, y - 8);
  } else {
    font(ctx, size * 0.8, 900);
    ctx.fillStyle = `rgba(251,191,36,${0.35 + pulse * 0.4})`;
    ctx.fillText('؟', slotCx, y - 7);
  }

  font(ctx, projector ? 15 : 13, 600);
  ctx.fillStyle = '#a8a29e';
  ctx.fillText('حرفِ درست را شکار کن', cx, y + boxH / 2 - 14);
  ctx.restore();
}

/* ═══════════ قفل طلسم و واژهٔ اسیر ═══════════ */

export function drawCageLock(ctx: CanvasRenderingContext2D, t: Target, opts: { fontSize: number }) {
  const shake = t.shudder > 0 ? (Math.random() - 0.5) * t.shudder * 2 : 0;
  const fade = t.dying > 0 ? Math.max(0, 1 - t.dying) : 1;
  const pop = easeOutBack(Math.min(1, t.spawnT));
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(t.x + shake, t.y);
  ctx.scale(pop, pop);
  ctx.rotate(Math.sin(t.bob) * 0.06);

  blit(ctx, rectGlow(t.halfW * 2, t.halfH * 2, 12, 20, '#ef4444', 2), 0, 0, fade);
  const g = ctx.createLinearGradient(0, -t.halfH, 0, t.halfH);
  g.addColorStop(0, 'rgba(76,10,10,0.97)');
  g.addColorStop(1, 'rgba(28,5,5,0.98)');
  ctx.fillStyle = g;
  roundRect(ctx, -t.halfW, -t.halfH, t.halfW * 2, t.halfH * 2, 12);
  ctx.fill();
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 2.6;
  ctx.stroke();

  // زنجیر روی قفل
  ctx.strokeStyle = 'rgba(248,113,113,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-t.halfW, -t.halfH); ctx.lineTo(t.halfW, t.halfH);
  ctx.stroke();

  rtlText(ctx);
  font(ctx, opts.fontSize, 800);
  ctx.fillStyle = '#fecaca';
  outlinedText(ctx, t.text, 0, -3, 4);
  font(ctx, 12, 600);
  ctx.fillStyle = '#fca5a5';
  ctx.fillText('🔒 قفل غلط', 0, t.halfH - 13);
  ctx.restore();
}

export function drawTrappedWord(
  ctx: CanvasRenderingContext2D,
  t: Target,
  time: number,
  locksLeft: number,
  opts: { fontSize: number }
) {
  const free = locksLeft === 0;
  const bob = Math.sin(t.bob) * (free ? 10 : 3);
  ctx.save();
  ctx.translate(t.x, t.y + bob);
  const pop = easeOutBack(Math.min(1, t.spawnT));
  ctx.scale(pop, pop);

  const glow = free ? '#fde68a' : '#a16207';
  blit(
    ctx, rectGlow(t.halfW * 2, t.halfH * 2, 18, free ? 46 : 20, glow, free ? 2 : 1),
    0, 0, free ? 0.75 + 0.25 * Math.sin(time * 5) : 1
  );
  const g = ctx.createLinearGradient(0, -t.halfH, 0, t.halfH);
  g.addColorStop(0, free ? 'rgba(120,84,10,0.96)' : 'rgba(35,32,20,0.96)');
  g.addColorStop(1, free ? 'rgba(60,40,6,0.98)' : 'rgba(15,14,10,0.98)');
  ctx.fillStyle = g;
  roundRect(ctx, -t.halfW, -t.halfH, t.halfW * 2, t.halfH * 2, 18);
  ctx.fill();
  ctx.strokeStyle = free ? '#fbbf24' : '#78716c';
  ctx.lineWidth = 3.4;
  ctx.stroke();

  rtlText(ctx);
  font(ctx, opts.fontSize, 900);
  ctx.fillStyle = free ? '#fef3c7' : '#a8a29e';
  outlinedText(ctx, t.text, 0, 0, 5);

  if (!free) {
    // میله‌های قفس
    ctx.strokeStyle = 'rgba(203,213,225,0.30)';
    ctx.lineWidth = 2.4;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * (t.halfW / 2.6), -t.halfH - 6);
      ctx.lineTo(i * (t.halfW / 2.6), t.halfH + 6);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-t.halfW - 6, -t.halfH * 0.45); ctx.lineTo(t.halfW + 6, -t.halfH * 0.45);
    ctx.moveTo(-t.halfW - 6, t.halfH * 0.45); ctx.lineTo(t.halfW + 6, t.halfH * 0.45);
    ctx.stroke();

    font(ctx, 14, 700);
    ctx.fillStyle = '#f87171';
    ctx.fillText(`${fa(locksLeft)} قفل باقی مانده`, 0, t.halfH + 26);
  } else {
    font(ctx, 14, 700);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('✦ آزاد شد! به واژه شلیک کن ✦', 0, t.halfH + 26);
  }
  ctx.restore();
}

/* ═══════════ هیولا ═══════════ */

export function drawMonster(ctx: CanvasRenderingContext2D, t: Target, time: number, opts: { fontSize: number }) {
  const bob = Math.sin(t.bob) * 8;
  const shake = t.shudder > 0 ? (Math.random() - 0.5) * t.shudder * 2 : 0;
  const fade = t.dying > 0 ? Math.max(0, 1 - t.dying) : 1;
  const good = !!t.cleansed;
  const body = good ? '#10b981' : '#7c3aed';
  const glow = good ? '#6ee7b7' : '#c084fc';
  const dir = t.vx >= 0 ? 1 : -1;

  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(t.x + shake, t.y + bob);
  ctx.scale(easeOutBack(Math.min(1, t.spawnT)), easeOutBack(Math.min(1, t.spawnT)));

  // سایه
  ctx.save();
  ctx.globalAlpha = fade * 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, t.radius * 0.92, t.radius * 0.78, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  blit(ctx, circleGlow(t.radius, 26, glow, 2), 0, 0, fade);

  // شاخک‌ها
  ctx.strokeStyle = body;
  ctx.lineWidth = 5;
  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.moveTo(s * t.radius * 0.4, -t.radius * 0.55);
    ctx.quadraticCurveTo(
      s * t.radius * 0.7, -t.radius * 1.1 + Math.sin(time * 3 + s) * 5,
      s * t.radius * 0.42, -t.radius * 1.3
    );
    ctx.stroke();
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(s * t.radius * 0.42, -t.radius * 1.3, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // بدن
  const bg = ctx.createRadialGradient(-t.radius * 0.25, -t.radius * 0.3, 4, 0, 0, t.radius);
  bg.addColorStop(0, good ? '#6ee7b7' : '#a78bfa');
  bg.addColorStop(1, body);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(0, 0, t.radius * 0.95, t.radius * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // چشم‌ها
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-t.radius * 0.3, -t.radius * 0.16, t.radius * 0.2, 0, Math.PI * 2);
  ctx.arc(t.radius * 0.28, -t.radius * 0.16, t.radius * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = good ? '#065f46' : '#dc2626';
  ctx.beginPath();
  ctx.arc(-t.radius * 0.3 + dir * 4, -t.radius * 0.16, t.radius * 0.1, 0, Math.PI * 2);
  ctx.arc(t.radius * 0.28 + dir * 4, -t.radius * 0.16, t.radius * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // دهان
  ctx.strokeStyle = good ? '#064e3b' : '#450a0a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (good) ctx.arc(0, t.radius * 0.16, t.radius * 0.34, 0.15 * Math.PI, 0.85 * Math.PI);
  else ctx.arc(0, t.radius * 0.44, t.radius * 0.34, 1.15 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();

  // بنر واژه روی سر
  const bw = t.halfW;
  const bh = 34;
  const byy = -t.radius - 46;
  blit(ctx, rectGlow(bw * 2, bh, 10, 16, good ? '#34d399' : '#f43f5e'), 0, byy, fade);
  ctx.fillStyle = 'rgba(9,13,26,0.94)';
  roundRect(ctx, -bw, byy - bh / 2, bw * 2, bh, 10);
  ctx.fill();
  ctx.strokeStyle = good ? '#34d399' : '#f43f5e';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  rtlText(ctx);
  font(ctx, opts.fontSize, 800);
  ctx.fillStyle = good ? '#a7f3d0' : '#fecdd3';
  ctx.fillText(t.text, 0, byy);
  if (!good) {
    // خط روی املای غلط
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.4;
    const tw = measure(ctx, t.text, opts.fontSize, 800);
    ctx.beginPath();
    ctx.moveTo(-tw / 2 - 4, byy + 1);
    ctx.lineTo(tw / 2 + 4, byy + 1);
    ctx.stroke();
  }
  ctx.restore();
}

/* ═══════════ غول ═══════════ */

export function drawBoss(
  ctx: CanvasRenderingContext2D,
  t: Target,
  time: number,
  opts: { projector: boolean; enraged: boolean }
) {
  const bob = Math.sin(t.bob) * 8;
  const shake = t.shudder > 0 ? (Math.random() - 0.5) * t.shudder * 2.4 : 0;
  const r = t.radius;
  const hp = Math.max(0, t.health / t.maxHealth);
  const rage = opts.enraged;

  ctx.save();
  ctx.translate(t.x + shake, t.y + bob);

  // هالهٔ تاریک
  ctx.save();
  ctx.globalAlpha = 0.3 + Math.sin(time * 2) * 0.09;
  const ag = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 2);
  ag.addColorStop(0, rage ? 'rgba(239,68,68,0.7)' : 'rgba(147,51,234,0.55)');
  ag.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ag;
  ctx.beginPath();
  ctx.arc(0, 0, r * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ردا / بدنه
  blit(ctx, circleGlow(r, 40, rage ? '#ef4444' : '#a855f7', 2), 0, 0);
  const bg = ctx.createLinearGradient(0, -r, 0, r);
  bg.addColorStop(0, rage ? '#7f1d1d' : '#3b0764');
  bg.addColorStop(1, '#0c0a1a');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(r * 1.05, -r * 0.4, r * 0.86, r);
  ctx.lineTo(-r * 0.86, r);
  ctx.quadraticCurveTo(-r * 1.05, -r * 0.4, 0, -r);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rage ? '#f87171' : '#c084fc';
  ctx.lineWidth = 4;
  ctx.stroke();

  // شاخ‌ها
  ctx.fillStyle = rage ? '#dc2626' : '#7e22ce';
  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.moveTo(s * r * 0.46, -r * 0.72);
    ctx.quadraticCurveTo(s * r * 1.0, -r * 1.35, s * r * 0.52, -r * 1.42);
    ctx.quadraticCurveTo(s * r * 0.62, -r * 0.98, s * r * 0.24, -r * 0.8);
    ctx.closePath();
    ctx.fill();
  });

  // چشم‌های آتشین
  const eyeGlow = rage ? '#fca5a5' : '#fde68a';
  const eyeHalo = softDot(eyeGlow, 3, 20);
  ctx.fillStyle = eyeGlow;
  [-1, 1].forEach((s) => {
    blitScaled(ctx, eyeHalo, s * r * 0.3, -r * 0.2, r * 0.9, 0.8);
    ctx.beginPath();
    ctx.ellipse(s * r * 0.3, -r * 0.2, r * 0.15, r * 0.09, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
  });

  // دهانِ نفرین
  ctx.strokeStyle = eyeGlow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, r * 0.32, r * 0.3, 1.12 * Math.PI, 1.88 * Math.PI);
  ctx.stroke();

  // نام و نوار سلامت
  rtlText(ctx);
  font(ctx, opts.projector ? 22 : 19, 800);
  ctx.fillStyle = '#fff';
  outlinedText(ctx, t.text, 0, r + 26, 5);

  const bw = 240;
  const bh = 16;
  const by = -r - 52;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  roundRect(ctx, -bw / 2, by, bw, bh, 8);
  ctx.fill();
  const hg = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
  hg.addColorStop(0, hp > 0.35 ? '#ef4444' : '#f59e0b');
  hg.addColorStop(1, hp > 0.35 ? '#fb923c' : '#fbbf24');
  ctx.fillStyle = hg;
  roundRect(ctx, -bw / 2 + 3, by + 3, Math.max(0, (bw - 6) * hp), bh - 6, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, -bw / 2, by, bw, bh, 8);
  ctx.stroke();
  font(ctx, 12, 700);
  ctx.fillStyle = '#fecaca';
  ctx.fillText(`طلسم غول: ${fa(Math.ceil(t.health))} / ${fa(t.maxHealth)}`, 0, by - 11);

  ctx.restore();
}

/* ═══════════ نفرین پرتابی غول ═══════════ */

export function drawCurse(ctx: CanvasRenderingContext2D, t: Target, time: number) {
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.rotate(t.spin);
  blit(ctx, circleGlow(t.radius, 22, '#f43f5e', 2), 0, 0);
  ctx.fillStyle = 'rgba(60,8,20,0.95)';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? t.radius : t.radius * 0.55;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fb7185';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.rotate(-t.spin);
  rtlText(ctx);
  font(ctx, 15, 800);
  ctx.fillStyle = '#fecdd3';
  ctx.globalAlpha = 0.85 + 0.15 * Math.sin(time * 8);
  ctx.fillText(t.text, 0, 1);
  ctx.restore();
}

/* ═══════════ کماندار ═══════════ */

export interface ArcherView {
  x: number; y: number;
  aim: number;
  drawing: boolean;
  power: number;
  recoil: number;
  bowGlow: string;
  arrowType: ArrowType;
  combo: number;
  projector: boolean;
  time: number;
}

export function drawArcher(ctx: CanvasRenderingContext2D, v: ArcherView) {
  const idle = Math.sin(v.time * 1.8) * 2;
  ctx.save();
  ctx.translate(v.x - v.recoil * 6, v.y + idle);
  ctx.scale(1.28, 1.28);

  // آتش کمبو دور پا
  if (v.combo >= 3) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const inten = Math.min(1, v.combo / 10);
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.14 * inten;
      const rr = 40 + i * 16 + Math.sin(v.time * 6 + i) * 5;
      const cg = ctx.createRadialGradient(0, 22, 4, 0, 22, rr);
      cg.addColorStop(0, v.combo >= 8 ? '#fde68a' : '#fb923c');
      cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(0, 22, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // سایه
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 34, 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ردا
  const cloakSway = Math.sin(v.time * 1.4) * 4;
  ctx.fillStyle = '#134e4a';
  ctx.beginPath();
  ctx.moveTo(-14, -14);
  ctx.quadraticCurveTo(-26 + cloakSway, 10, -22 + cloakSway, 32);
  ctx.lineTo(20, 32);
  ctx.quadraticCurveTo(22, 6, 14, -14);
  ctx.closePath();
  ctx.fill();

  // پاها
  ctx.strokeStyle = '#0f3f3c';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 26); ctx.lineTo(-14, 34);
  ctx.moveTo(6, 26); ctx.lineTo(16, 34);
  ctx.stroke();

  // تنه
  const tg = ctx.createLinearGradient(0, -32, 0, 4);
  tg.addColorStop(0, '#0f766e');
  tg.addColorStop(1, '#115e59');
  ctx.fillStyle = tg;
  roundRect(ctx, -12, -32, 24, 36, 8);
  ctx.fill();

  // ترکش
  ctx.save();
  ctx.rotate(-0.35);
  ctx.fillStyle = '#78350f';
  roundRect(ctx, -26, -30, 11, 28, 4);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  [-22, -18.5].forEach((ax) => {
    ctx.beginPath(); ctx.moveTo(ax, -30); ctx.lineTo(ax, -38); ctx.stroke();
  });
  ctx.restore();

  // سر و کلاهخود
  ctx.fillStyle = '#0d9488';
  ctx.beginPath();
  ctx.arc(2, -44, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f766e';
  ctx.beginPath();
  ctx.arc(2, -46, 13.5, Math.PI, Math.PI * 2);
  ctx.fill();
  // چشم درخشان
  blitScaled(ctx, softDot('#fde68a', 2, 9), 9, -44, 20, 0.75);
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.ellipse(9, -44, 3.4, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // شال
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(-9, -50);
  ctx.quadraticCurveTo(-24 + cloakSway * 1.6, -46, -28 + cloakSway * 2, -34);
  ctx.quadraticCurveTo(-18, -40, -9, -44);
  ctx.closePath();
  ctx.fill();

  // بازو + کمان
  ctx.save();
  ctx.translate(6, -22);
  ctx.rotate(v.aim);
  const pull = v.drawing ? 6 + v.power * 16 : 0;

  // بازوی جلو
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(20, 0);
  ctx.stroke();
  // بازوی کشنده
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-pull * 0.7, 6);
  ctx.stroke();

  // کمان — درخشش با دو خطِ پهنِ کم‌رنگ زیر خط اصلی
  ctx.lineCap = 'round';
  ctx.strokeStyle = v.bowGlow;
  const bowArc = () => {
    ctx.beginPath();
    ctx.arc(22, 0, 30, -Math.PI * 0.44, Math.PI * 0.44);
    ctx.stroke();
  };
  ctx.globalAlpha = 0.12; ctx.lineWidth = v.projector ? 22 : 16; bowArc();
  ctx.globalAlpha = 0.22; ctx.lineWidth = 10; bowArc();
  ctx.globalAlpha = 1;    ctx.lineWidth = 5;  bowArc();

  // زه
  const tipX = 22 + Math.cos(-Math.PI * 0.44) * 30;
  const tipY = Math.sin(-Math.PI * 0.44) * 30;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(6 - pull, 0);
  ctx.lineTo(tipX, -tipY);
  ctx.stroke();

  // تیر آمادهٔ شلیک
  if (v.drawing) {
    const ac = arrowColor(v.arrowType);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6 - pull, 0);
    ctx.lineTo(40 - pull, 0);
    ctx.stroke();
    blitScaled(ctx, softDot(ac, 2, 10), 44 - pull, 0, 24, 0.7);
    ctx.fillStyle = ac;
    ctx.beginPath();
    ctx.moveTo(48 - pull, 0);
    ctx.lineTo(38 - pull, -5);
    ctx.lineTo(38 - pull, 5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

/* ═══════════ تیر ═══════════ */

export function drawArrow(ctx: CanvasRenderingContext2D, a: Arrow) {
  const col = arrowColor(a.type);
  // دنباله
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  a.trail.forEach((p, i) => {
    const k = i / Math.max(1, a.trail.length - 1);
    ctx.globalAlpha = p.a * k * 0.75;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5 + k * 4.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.angle);
  blitScaled(ctx, softDot(col, 3, 13), 4, 0, 40, 0.55);

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-24, 0);
  ctx.lineTo(12, 0);
  ctx.stroke();

  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(8, -6);
  ctx.lineTo(11, 0);
  ctx.lineTo(8, 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = col;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(-24, 0);
  ctx.lineTo(-33, -6);
  ctx.lineTo(-27, 0);
  ctx.lineTo(-33, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ═══════════ کمان‌نمای مسیر ═══════════ */

export function drawTrajectory(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number,
  angle: number, speed: number, gravity: number,
  color: string, steps: number
) {
  let vx = Math.cos(angle) * speed;
  let vy = Math.sin(angle) * speed;
  let x = x0 + Math.cos(angle) * 40;
  let y = y0 + Math.sin(angle) * 40;
  ctx.save();
  for (let i = 0; i < steps; i++) {
    x += vx; vy += gravity; y += vy;
    if (y > GROUND_Y + 10 || x > VW + 40) break;
    const k = 1 - i / steps;
    ctx.globalAlpha = 0.08 + k * 0.55;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1.6, 4.6 * k), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ═══════════ جلوه‌ها ═══════════ */

export function drawShockwave(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number, color: string) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.globalAlpha = alpha * 0.25;
  ctx.lineWidth = Math.max(2, 20 * alpha);
  ctx.stroke();
  ctx.globalAlpha = alpha;
  ctx.lineWidth = Math.max(1, 7 * alpha);
  ctx.stroke();
  ctx.restore();
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158, c3 = c1 + 1;
  const p = t - 1;
  return 1 + c3 * p * p * p + c1 * p * p;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

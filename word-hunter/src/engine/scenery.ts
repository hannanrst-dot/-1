import { RealmTheme } from '../types/game';
import { VW, VH, GROUND_Y, makeRng } from './world';
import { softDot, blitScaled, circleGlow, blit, rectGlow } from './glow';

interface Mote {
  x: number; y: number; vx: number; vy: number;
  r: number; a: number; phase: number; hue: string;
}

export interface ScenePalette {
  sky: string[];
  ground: string[];
  rim: string;
  glow: string;
  mote: string;
  fog: string;
  ink: string;
}

export interface Scene {
  theme: RealmTheme;
  palette: ScenePalette;
  update(dt: number): void;
  /** آسمان، لایه‌های دور و میانی، زمین */
  drawBack(ctx: CanvasRenderingContext2D): void;
  /** مه، ذرات معلق و وینیت روی همه چیز */
  drawFront(ctx: CanvasRenderingContext2D): void;
}

const PALETTES: Record<RealmTheme, ScenePalette> = {
  forest: {
    sky: ['#04150f', '#0a3325', '#0d4a33'],
    ground: ['#1c5a43', '#0a2418'],
    rim: '#4ade80', glow: '#22c55e', mote: '#bef264', fog: 'rgba(34,197,94,0.07)', ink: '#03110b',
  },
  crystal_cave: {
    sky: ['#0b0518', '#25113f', '#160828'],
    ground: ['#3f1d68', '#180a2b'],
    rim: '#c084fc', glow: '#a855f7', mote: '#e9d5ff', fog: 'rgba(168,85,247,0.08)', ink: '#0a0417',
  },
  sky_city: {
    sky: ['#0b2a4a', '#1d5f96', '#5aa4d4'],
    ground: ['#2b5f8c', '#123049'],
    rim: '#7dd3fc', glow: '#38bdf8', mote: '#e0f2fe', fog: 'rgba(125,211,252,0.10)', ink: '#07182b',
  },
  dark_fortress: {
    sky: ['#1a0604', '#3d120a', '#601c0c'],
    ground: ['#5a1d10', '#200806'],
    rim: '#fb923c', glow: '#f97316', mote: '#fdba74', fog: 'rgba(249,115,22,0.09)', ink: '#150402',
  },
  desert_ruins: {
    sky: ['#2b1608', '#7a3f14', '#c07a34'],
    ground: ['#8a5a25', '#3d2410'],
    rim: '#fcd34d', glow: '#f59e0b', mote: '#fde68a', fog: 'rgba(252,211,77,0.10)', ink: '#1c0f05',
  },
  celestial_island: {
    sky: ['#080b23', '#1b1440', '#2e1d5c'],
    ground: ['#3b2a6b', '#150e2c'],
    rim: '#fde68a', glow: '#facc15', mote: '#fef3c7', fog: 'rgba(250,204,21,0.07)', ink: '#05061a',
  },
};

/* ── کمک‌رسم‌ها ─────────────────────────────────────────── */

function skyGradient(ctx: CanvasRenderingContext2D, colors: string[]) {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, VH);
}

function ridge(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  baseY: number,
  amp: number,
  step: number,
  fill: string
) {
  ctx.beginPath();
  ctx.moveTo(0, VH);
  ctx.lineTo(0, baseY);
  for (let x = 0; x <= VW; x += step) {
    const y = baseY - Math.sin(x * 0.004 + rng() * 0.6) * amp - rng() * amp * 0.5;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(VW, VH);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function tree(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number, fill: string, sway: number) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.fillStyle = fill;
  // تنه
  ctx.fillRect(-h * 0.035, -h * 0.42, h * 0.07, h * 0.42);
  // تاج مخروطی سه‌طبقه
  for (let i = 0; i < 3; i++) {
    const ty = -h * (0.38 + i * 0.2);
    const tw = h * (0.34 - i * 0.075);
    const th = h * 0.3;
    const s = sway * (i + 1) * 0.4;
    ctx.beginPath();
    ctx.moveTo(s, ty - th);
    ctx.lineTo(-tw, ty);
    ctx.lineTo(tw, ty);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function crystalShard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, up: boolean) {
  ctx.beginPath();
  if (up) {
    ctx.moveTo(x, y - h);
    ctx.lineTo(x - w, y);
    ctx.lineTo(x + w, y);
  } else {
    ctx.moveTo(x, y + h);
    ctx.lineTo(x - w, y);
    ctx.lineTo(x + w, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function tower(ctx: CanvasRenderingContext2D, x: number, baseY: number, w: number, h: number, fill: string, rim: string) {
  ctx.fillStyle = fill;
  ctx.fillRect(x - w / 2, baseY - h, w, h);
  // بام مخروطی
  ctx.beginPath();
  ctx.moveTo(x, baseY - h - w * 0.85);
  ctx.lineTo(x - w * 0.72, baseY - h);
  ctx.lineTo(x + w * 0.72, baseY - h);
  ctx.closePath();
  ctx.fill();
  // پنجره‌های روشن
  ctx.fillStyle = rim;
  for (let i = 0; i < Math.max(1, Math.floor(h / 34)); i++) {
    ctx.globalAlpha = 0.55;
    ctx.fillRect(x - 3, baseY - h + 16 + i * 30, 6, 9);
  }
  ctx.globalAlpha = 1;
}

function vignette(ctx: CanvasRenderingContext2D, strength: number, ink: string) {
  const g = ctx.createRadialGradient(VW / 2, VH * 0.46, VH * 0.28, VW / 2, VH * 0.5, VH * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, ink);
  ctx.save();
  ctx.globalAlpha = strength;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, VH);
  ctx.restore();
}

function ground(ctx: CanvasRenderingContext2D, pal: ScenePalette) {
  const g = ctx.createLinearGradient(0, GROUND_Y - 12, 0, VH);
  g.addColorStop(0, pal.ground[0]);
  g.addColorStop(1, pal.ground[1]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 6);
  ctx.quadraticCurveTo(VW * 0.3, GROUND_Y - 10, VW * 0.62, GROUND_Y + 2);
  ctx.quadraticCurveTo(VW * 0.86, GROUND_Y + 10, VW, GROUND_Y - 4);
  ctx.lineTo(VW, VH);
  ctx.lineTo(0, VH);
  ctx.closePath();
  ctx.fill();

  // لبهٔ درخشان زمین
  // درخشش لبه با چند خطِ پهنِ کم‌رنگ ساخته می‌شود؛ نتیجه مثل blur است ولی رایگان
  ctx.save();
  const edge = () => {
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 6);
    ctx.quadraticCurveTo(VW * 0.3, GROUND_Y - 10, VW * 0.62, GROUND_Y + 2);
    ctx.quadraticCurveTo(VW * 0.86, GROUND_Y + 10, VW, GROUND_Y - 4);
    ctx.stroke();
  };
  ctx.strokeStyle = pal.glow;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.10; ctx.lineWidth = 16; edge();
  ctx.globalAlpha = 0.16; ctx.lineWidth = 8;  edge();
  ctx.strokeStyle = pal.rim;
  ctx.globalAlpha = 0.8;  ctx.lineWidth = 2.5; edge();
  ctx.restore();
}

/**
 * لایه‌های ثابت صحنه یک‌بار روی یک بومِ پنهان کشیده می‌شوند و در هر فریم
 * فقط کپی می‌شوند. برای چیزهایی مثل بلورهای غار و ستاره‌های آسمان که
 * هندسه‌شان تغییر نمی‌کند و فقط روشناییشان نوسان دارد.
 */
function bakeLayer(draw: (g: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = VW;
  c.height = VH;
  const g = c.getContext('2d')!;
  draw(g);
  return c;
}

/* ── ساخت صحنه ─────────────────────────────────────────── */

export function createScene(theme: RealmTheme): Scene {
  const pal = PALETTES[theme] || PALETTES.forest;
  const rng = makeRng(theme.length * 7919 + 13);
  let t = 0;

  // ذرات معلق (کرم شب‌تاب، غبار، جرقه، شن، ستاره)
  const moteCount = theme === 'dark_fortress' ? 70 : 52;
  const motes: Mote[] = Array.from({ length: moteCount }, () => ({
    x: rng() * VW,
    y: rng() * (GROUND_Y - 40),
    vx: (rng() - 0.5) * (theme === 'desert_ruins' ? 60 : 14),
    vy: theme === 'dark_fortress' ? -(18 + rng() * 34) : (rng() - 0.5) * 12,
    r: 1 + rng() * 2.6,
    a: 0.25 + rng() * 0.65,
    phase: rng() * Math.PI * 2,
    hue: pal.mote,
  }));

  // هندسهٔ ثابتِ لایه‌ها
  const farTrees = Array.from({ length: 22 }, () => ({ x: rng() * VW, h: 130 + rng() * 90 }));
  const nearTrees = Array.from({ length: 9 }, () => ({ x: 300 + rng() * (VW - 300), h: 150 + rng() * 110 }));
  const shards = Array.from({ length: 26 }, () => ({
    x: rng() * VW, w: 8 + rng() * 26, h: 60 + rng() * 190, up: rng() > 0.55,
  }));
  const clouds = Array.from({ length: 9 }, () => ({
    x: rng() * VW, y: 60 + rng() * 300, w: 130 + rng() * 220, h: 26 + rng() * 40, s: 4 + rng() * 10,
  }));
  const islands = Array.from({ length: 5 }, () => ({
    x: 120 + rng() * (VW - 240), y: 150 + rng() * 260, w: 90 + rng() * 130, tw: 16 + rng() * 16, th: 40 + rng() * 60,
  }));
  const stars = Array.from({ length: 150 }, () => ({
    x: rng() * VW, y: rng() * (VH * 0.8), r: rng() * 1.5 + 0.35, ph: rng() * 6.28,
  }));
  const dunes = Array.from({ length: 4 }, (_, i) => ({ y: 380 + i * 62, amp: 26 + rng() * 26, sp: 0.003 + i * 0.0012 }));
  const columns = Array.from({ length: 7 }, () => ({ x: rng() * VW, h: 90 + rng() * 150, broken: rng() > 0.5 }));
  // لایه‌های پخته‌شده — با نیاز ساخته می‌شوند
  let shardLayers: HTMLCanvasElement[] | null = null;
  let starLayers: HTMLCanvasElement[] | null = null;

  let lightning = 0;
  let nextBolt = 3 + rng() * 5;
  const shooting = { x: 0, y: 0, life: 0, len: 0 };
  let nextShoot = 2 + rng() * 4;

  return {
    theme,
    palette: pal,

    update(dt: number) {
      t += dt;
      for (const m of motes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt + Math.sin(t * 1.4 + m.phase) * 5 * dt;
        if (m.x < -20) m.x = VW + 20;
        if (m.x > VW + 20) m.x = -20;
        if (m.y < -20) m.y = GROUND_Y - 20;
        if (m.y > GROUND_Y) m.y = -10;
      }
      if (theme === 'dark_fortress') {
        nextBolt -= dt;
        if (nextBolt <= 0) { lightning = 0.35; nextBolt = 3.5 + Math.random() * 6; }
        lightning = Math.max(0, lightning - dt);
      }
      if (theme === 'celestial_island') {
        nextShoot -= dt;
        if (nextShoot <= 0 && shooting.life <= 0) {
          shooting.x = Math.random() * VW * 0.8;
          shooting.y = Math.random() * VH * 0.35;
          shooting.life = 0.9;
          shooting.len = 120 + Math.random() * 160;
          nextShoot = 3 + Math.random() * 6;
        }
        shooting.life = Math.max(0, shooting.life - dt);
      }
    },

    drawBack(ctx) {
      skyGradient(ctx, pal.sky);

      if (theme === 'forest') {
        // ماه و پرتوهای نور
        ctx.save();
        ctx.globalAlpha = 0.5;
        const mg = ctx.createRadialGradient(VW * 0.72, 110, 8, VW * 0.72, 110, 190);
        mg.addColorStop(0, 'rgba(226,255,238,0.85)');
        mg.addColorStop(1, 'rgba(226,255,238,0)');
        ctx.fillStyle = mg;
        ctx.fillRect(VW * 0.72 - 200, -90, 400, 400);
        ctx.restore();

        ridge(ctx, makeRng(11), 430, 44, 46, 'rgba(6,44,30,0.85)');
        ctx.save();
        ctx.globalAlpha = 0.55;
        farTrees.forEach((tr, i) =>
          tree(ctx, tr.x, 470, tr.h, '#0a3324', Math.sin(t * 0.8 + i) * 2)
        );
        ctx.restore();
        // پرتوهای نور از میان شاخه‌ها
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) {
          const gx = VW * (0.55 + i * 0.11);
          ctx.globalAlpha = 0.05 + Math.sin(t * 0.5 + i) * 0.02;
          ctx.fillStyle = '#a3e635';
          ctx.beginPath();
          ctx.moveTo(gx, 0); ctx.lineTo(gx + 60, 0);
          ctx.lineTo(gx + 190, GROUND_Y); ctx.lineTo(gx + 40, GROUND_Y);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        ground(ctx, pal);
        nearTrees.forEach((tr, i) =>
          tree(ctx, tr.x, GROUND_Y + 14, tr.h, 'rgba(3,18,12,0.95)', Math.sin(t * 0.6 + i * 1.7) * 3.5)
        );
      } else if (theme === 'crystal_cave') {
        // هالهٔ درخشش مرکزی غار
        ctx.save();
        const cg = ctx.createRadialGradient(VW * 0.6, 300, 30, VW * 0.6, 300, 460);
        cg.addColorStop(0, 'rgba(168,85,247,0.35)');
        cg.addColorStop(1, 'rgba(168,85,247,0)');
        ctx.fillStyle = cg;
        ctx.fillRect(0, 0, VW, VH);
        ctx.restore();

        if (!shardLayers) {
          shardLayers = [0, 1].map((half) =>
            bakeLayer((g) => {
              shards.forEach((sh, i) => {
                if (i % 2 !== half) return;
                const cy = sh.up ? GROUND_Y + 10 - sh.h / 2 : sh.h / 2;
                blit(g, circleGlow(Math.max(sh.w, sh.h * 0.5), 22, pal.glow), sh.x, cy, 0.55);
                crystalShard(g, sh.x, sh.up ? GROUND_Y + 10 : 0, sh.w, sh.h, i % 3 === 0 ? '#7e22ce' : '#4c1d95', sh.up);
              });
            })
          );
        }
        // دو لایه با نوسانِ ناهم‌فاز، همان تپشِ بلورها را می‌سازد
        ctx.save();
        ctx.globalAlpha = 0.34 + 0.2 * Math.sin(t * 1.1);
        ctx.drawImage(shardLayers[0], 0, 0);
        ctx.globalAlpha = 0.34 + 0.2 * Math.sin(t * 1.1 + 1.7);
        ctx.drawImage(shardLayers[1], 0, 0);
        ctx.restore();
        ground(ctx, pal);
        // برکهٔ بازتاب
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.ellipse(VW * 0.55, VH - 32, VW * 0.4, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (theme === 'sky_city') {
        // خورشید سپیده‌دم
        ctx.save();
        const sg = ctx.createRadialGradient(VW * 0.24, 150, 10, VW * 0.24, 150, 260);
        sg.addColorStop(0, 'rgba(255,240,200,0.9)');
        sg.addColorStop(1, 'rgba(255,200,140,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, VW, VH);
        ctx.restore();

        clouds.forEach((c, i) => {
          const cx = (c.x + t * c.s) % (VW + 400) - 200;
          ctx.save();
          ctx.globalAlpha = 0.2 + (i % 3) * 0.08;
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.ellipse(cx, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + c.w * 0.28, c.y + 6, c.w / 3, c.h / 2.4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        islands.forEach((s, i) => {
          const fy = s.y + Math.sin(t * 0.7 + i * 1.3) * 8;
          ctx.save();
          ctx.fillStyle = 'rgba(15,52,84,0.92)';
          ctx.beginPath();
          ctx.moveTo(s.x - s.w / 2, fy);
          ctx.lineTo(s.x + s.w / 2, fy);
          ctx.lineTo(s.x + s.w * 0.18, fy + s.w * 0.55);
          ctx.lineTo(s.x - s.w * 0.2, fy + s.w * 0.42);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = 'rgba(56,189,248,0.35)';
          ctx.fillRect(s.x - s.w / 2, fy - 4, s.w, 5);
          tower(ctx, s.x, fy - 2, s.tw, s.th, 'rgba(11,38,63,0.95)', '#fbbf24');
          ctx.restore();
        });
        ground(ctx, pal);
      } else if (theme === 'dark_fortress') {
        if (lightning > 0) {
          ctx.save();
          ctx.globalAlpha = lightning * 0.9;
          ctx.fillStyle = '#fed7aa';
          ctx.fillRect(0, 0, VW, VH);
          ctx.restore();
        }
        ridge(ctx, makeRng(29), 400, 60, 40, 'rgba(30,8,5,0.9)');
        // قلعه
        ctx.save();
        ctx.fillStyle = 'rgba(20,5,3,0.95)';
        ctx.fillRect(VW * 0.52, 300, 400, 260);
        [0.55, 0.66, 0.78, 0.9].forEach((f, i) =>
          tower(ctx, VW * f, 310, 44, 120 + (i % 2) * 70, 'rgba(16,4,2,0.98)', '#f97316')
        );
        // کنگره‌ها
        ctx.fillStyle = 'rgba(16,4,2,0.98)';
        for (let x = VW * 0.52; x < VW * 0.52 + 400; x += 34) ctx.fillRect(x, 286, 18, 20);
        ctx.restore();
        // دریاچهٔ گدازه
        ctx.save();
        const lg = ctx.createLinearGradient(0, GROUND_Y - 10, 0, VH);
        lg.addColorStop(0, '#f97316');
        lg.addColorStop(0.4, '#b91c1c');
        lg.addColorStop(1, '#450a0a');
        ctx.fillStyle = lg;
        ctx.fillRect(0, GROUND_Y + 4, VW, VH - GROUND_Y);
        ctx.globalAlpha = 0.35 + Math.sin(t * 2) * 0.12;
        ctx.fillStyle = '#fde68a';
        for (let i = 0; i < 8; i++) {
          const cx = ((i * 173 + t * 26) % (VW + 200)) - 100;
          ctx.beginPath();
          ctx.ellipse(cx, GROUND_Y + 30 + (i % 3) * 18, 46, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        ground(ctx, pal);
      } else if (theme === 'desert_ruins') {
        // خورشید داغ
        ctx.save();
        ctx.globalAlpha = 0.85;
        const sg = ctx.createRadialGradient(VW * 0.5, 120, 20, VW * 0.5, 120, 220);
        sg.addColorStop(0, 'rgba(255,247,214,0.95)');
        sg.addColorStop(1, 'rgba(252,211,77,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, VW, VH);
        ctx.restore();

        dunes.forEach((d, i) => {
          ctx.save();
          ctx.globalAlpha = 0.3 + i * 0.16;
          ctx.fillStyle = i % 2 ? '#a16207' : '#854d0e';
          ctx.beginPath();
          ctx.moveTo(0, VH);
          ctx.lineTo(0, d.y);
          for (let x = 0; x <= VW; x += 24) {
            ctx.lineTo(x, d.y - Math.sin(x * d.sp + t * 0.12 + i) * d.amp);
          }
          ctx.lineTo(VW, VH);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
        // ستون‌های ویران
        columns.forEach((c) => {
          ctx.save();
          ctx.fillStyle = 'rgba(60,36,16,0.85)';
          ctx.fillRect(c.x - 13, GROUND_Y - c.h, 26, c.h);
          if (!c.broken) {
            ctx.fillRect(c.x - 22, GROUND_Y - c.h - 14, 44, 14);
          }
          ctx.fillRect(c.x - 24, GROUND_Y - 12, 48, 14);
          ctx.restore();
        });
        ground(ctx, pal);
      } else {
        // celestial_island
        if (!starLayers) {
          starLayers = [0, 1].map((half) =>
            bakeLayer((g) => {
              g.fillStyle = '#fff';
              stars.forEach((st, i) => {
                if (i % 2 !== half) return;
                g.beginPath();
                g.arc(st.x, st.y, st.r, 0, Math.PI * 2);
                g.fill();
              });
            })
          );
        }
        ctx.save();
        ctx.globalAlpha = 0.45 + 0.45 * Math.abs(Math.sin(t * 1.2));
        ctx.drawImage(starLayers[0], 0, 0);
        ctx.globalAlpha = 0.45 + 0.45 * Math.abs(Math.sin(t * 1.2 + 1.1));
        ctx.drawImage(starLayers[1], 0, 0);
        ctx.restore();
        // شفق قطبی
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) {
          ctx.globalAlpha = 0.12;
          const ag = ctx.createLinearGradient(0, 60 + i * 60, VW, 240 + i * 60);
          ag.addColorStop(0, ['#22d3ee', '#a855f7', '#facc15'][i]);
          ag.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = ag;
          ctx.beginPath();
          ctx.moveTo(0, 120 + i * 55 + Math.sin(t * 0.4 + i) * 24);
          for (let x = 0; x <= VW; x += 40) {
            ctx.lineTo(x, 120 + i * 55 + Math.sin(x * 0.005 + t * 0.5 + i) * 42);
          }
          ctx.lineTo(VW, 0); ctx.lineTo(0, 0);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        // شهاب
        if (shooting.life > 0) {
          ctx.save();
          ctx.globalAlpha = shooting.life;
          ctx.strokeStyle = '#fde68a';
          ctx.lineWidth = 7;
          ctx.globalAlpha = shooting.life * 0.28;
          const p = 1 - shooting.life;
          ctx.beginPath();
          ctx.moveTo(shooting.x + p * 260, shooting.y + p * 150);
          ctx.lineTo(shooting.x + p * 260 + shooting.len * 0.5, shooting.y + p * 150 + shooting.len * 0.29);
          ctx.stroke();
          ctx.globalAlpha = shooting.life;
          ctx.strokeStyle = '#fff7d6';
          ctx.lineWidth = 2.4;
          ctx.stroke();
          ctx.restore();
        }
        // سکوهای شناور رونی
        islands.forEach((s, i) => {
          const fy = s.y + Math.sin(t * 0.5 + i * 2) * 12;
          ctx.save();
          blit(ctx, rectGlow(s.w, 34, 17, 26, '#facc15'), s.x, fy, 0.85);
          ctx.fillStyle = 'rgba(45,30,80,0.9)';
          ctx.beginPath();
          ctx.ellipse(s.x, fy, s.w / 2, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(250,204,21,0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        });
        ground(ctx, pal);
      }
    },

    drawFront(ctx) {
      // ذرات معلق — از نقطهٔ نورانیِ از پیش‌ساخته استفاده می‌شود
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const dot = softDot(pal.mote, 2, 11);
      for (const m of motes) {
        const tw = 0.55 + 0.45 * Math.sin(t * 2.4 + m.phase);
        blitScaled(ctx, dot, m.x, m.y, (m.r + 9) * 2, m.a * tw * 0.55);
      }
      ctx.restore();

      // مه پایین صحنه
      ctx.save();
      const fg = ctx.createLinearGradient(0, GROUND_Y - 130, 0, GROUND_Y + 30);
      fg.addColorStop(0, 'rgba(0,0,0,0)');
      fg.addColorStop(1, pal.fog);
      ctx.fillStyle = fg;
      ctx.fillRect(0, GROUND_Y - 130, VW, 160);
      ctx.restore();

      vignette(ctx, 0.55, pal.ink);
    },
  };
}

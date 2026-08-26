/**
 * درخشش‌های از پیش‌ساخته.
 *
 * `ctx.shadowBlur` تنها گران‌ترین کار در کل حلقهٔ رسم است: اندازه‌گیری نشان داد
 * با آن ۲.۵ فریم بر ثانیه و بدون آن ۶۰ فریم بر ثانیه می‌گیریم. به‌جای محو کردن
 * دوبارهٔ هر هاله در هر فریم، هر هاله یک‌بار روی یک بوم کوچک ساخته و در فریم‌های
 * بعد فقط کپی می‌شود. نتیجهٔ دیداری همان است، اما هزینه تقریباً صفر می‌شود.
 */

type Sprite = HTMLCanvasElement;

const cache = new Map<string, Sprite>();
const MAX_ENTRIES = 220;

function remember(key: string, sprite: Sprite): Sprite {
  if (cache.size > MAX_ENTRIES) {
    // سادهٔ ساده: وقتی حافظه پر شد، از نو شروع کن
    cache.clear();
  }
  cache.set(key, sprite);
  return sprite;
}

function make(w: number, h: number): { c: Sprite; g: CanvasRenderingContext2D } {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return { c, g: c.getContext('2d')! };
}

/** اندازه‌ها را گرد می‌کنیم تا تعداد هاله‌های ذخیره‌شده کم بماند */
const q = (v: number, step = 8) => Math.ceil(v / step) * step;

/**
 * هالهٔ یک شکل دلخواه.
 * `path` باید مسیر را حول مبدأ (۰،۰) بسازد.
 * فقط سایه ذخیره می‌شود، نه خودِ شکل؛ شکل در زمان اجرا روی آن کشیده می‌شود.
 */
export function shapeGlow(
  key: string,
  w: number,
  h: number,
  blur: number,
  color: string,
  path: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  passes = 1
): Sprite {
  const W = q(w);
  const H = q(h);
  const B = q(blur, 4);
  const id = `${key}|${W}|${H}|${B}|${color}|${passes}`;
  const hit = cache.get(id);
  if (hit) return hit;

  const pad = Math.ceil(B * 1.9) + 6;
  const { c, g } = make(W + pad * 2, H + pad * 2);
  // شکل را بیرون از بوم می‌کشیم و فقط سایه‌اش را روی بوم می‌اندازیم
  const OFF = 6000;
  g.shadowColor = color;
  g.shadowBlur = B;
  g.shadowOffsetX = OFF;
  g.fillStyle = '#000';
  g.translate(pad + W / 2 - OFF, pad + H / 2);
  for (let i = 0; i < passes; i++) {
    path(g, W, H);
    g.fill();
  }
  return remember(id, c);
}

/** هالهٔ کادر گرد — برای لوح واژه‌ها، قفل‌ها و بنرها */
export function rectGlow(w: number, h: number, radius: number, blur: number, color: string, passes = 1): Sprite {
  return shapeGlow(`r${radius}`, w, h, blur, color, (g, W, H) => {
    g.beginPath();
    g.roundRect(-W / 2, -H / 2, W, H, radius);
  }, passes);
}

/** هالهٔ دایره — برای غول، هیولا و بلورها */
export function circleGlow(r: number, blur: number, color: string, passes = 1): Sprite {
  return shapeGlow('c', r * 2, r * 2, blur, color, (g, W) => {
    g.beginPath();
    g.arc(0, 0, W / 2, 0, Math.PI * 2);
  }, passes);
}

/** هالهٔ شش‌ضلعی — بلور حرف */
export function hexGlow(r: number, blur: number, color: string): Sprite {
  return shapeGlow('h', r * 2, r * 2, blur, color, (g, W) => {
    const rr = W / 2;
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      i === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
    }
    g.closePath();
  });
}

/**
 * نقطهٔ نورانی نرم — جایگزین دایره‌های محوشدهٔ ذرات معلق و کرم‌های شب‌تاب.
 * با شیب شعاعی ساخته می‌شود که هزینه‌اش در زمان اجرا صفر است.
 */
export function softDot(color: string, coreR: number, halo: number): Sprite {
  const R = Math.max(1, Math.round(coreR));
  const H = Math.round(halo);
  const id = `dot|${color}|${R}|${H}`;
  const hit = cache.get(id);
  if (hit) return hit;

  const outer = R + H;
  const { c, g } = make(outer * 2, outer * 2);
  const core = R / outer;
  const grad = g.createRadialGradient(outer, outer, 0, outer, outer, outer);
  // منحنی افت به شکلِ محوشدگی گاوسی تنظیم شده تا نتیجه با shadowBlur یکی باشد
  grad.addColorStop(0, rgba(color, 1));
  grad.addColorStop(core, rgba(color, 0.92));
  grad.addColorStop(core + (1 - core) * 0.22, rgba(color, 0.34));
  grad.addColorStop(core + (1 - core) * 0.5, rgba(color, 0.09));
  grad.addColorStop(1, rgba(color, 0));
  g.fillStyle = grad;
  g.beginPath();
  g.arc(outer, outer, outer, 0, Math.PI * 2);
  g.fill();
  return remember(id, c);
}

/** تبدیل رنگ hex به rgba با شفافیت دلخواه */
function rgba(hex: string, a: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return hex;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** کپی کردن یک هاله با مرکزِ داده‌شده */
export function blit(ctx: CanvasRenderingContext2D, sprite: Sprite, x: number, y: number, alpha = 1) {
  if (alpha <= 0) return;
  const prev = ctx.globalAlpha;
  if (alpha !== 1) ctx.globalAlpha = prev * alpha;
  ctx.drawImage(sprite, x - sprite.width / 2, y - sprite.height / 2);
  if (alpha !== 1) ctx.globalAlpha = prev;
}

/** کپی با اندازهٔ دلخواه (برای ذرات با اندازه‌های گوناگون) */
export function blitScaled(
  ctx: CanvasRenderingContext2D, sprite: Sprite, x: number, y: number, size: number, alpha = 1
) {
  if (alpha <= 0) return;
  const prev = ctx.globalAlpha;
  if (alpha !== 1) ctx.globalAlpha = prev * alpha;
  ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
  if (alpha !== 1) ctx.globalAlpha = prev;
}

/**
 * سایهٔ متن بدون blur.
 * به‌جای محو کردن، یک دورخطِ تیره دور حرف‌ها کشیده می‌شود؛
 * خوانایی روی پس‌زمینهٔ روشن همان است اما هزینه‌اش ناچیز.
 */
export function outlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width = 4,
  color = 'rgba(0,0,0,0.85)'
) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.strokeText(text, x, y);
  ctx.restore();
  ctx.fillText(text, x, y);
}

export function clearGlowCache() {
  cache.clear();
}

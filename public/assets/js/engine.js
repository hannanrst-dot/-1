/**
 * موتور مشترک بازی‌های آموزشی
 * ─────────────────────────────
 * ابزارهای پایه‌ای که همه‌ی بازی‌ها از آن استفاده می‌کنند:
 * ریاضیات کمکی، حلقه‌ی انیمیشن، سیستم ذرات، صداسازی، بلندخوانی فارسی،
 * و کمک‌کننده‌ی کشیدن‌ورهاکردن که هم با ماوس و هم با لمس کار می‌کند.
 */

/* ─── ابزار عددی و رنگی ──────────────────────────────────────────── */

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** عدد را با رقم‌های فارسی برمی‌گرداند. */
export const faNum = (n) =>
  String(n).replace(/\d/g, (d) => FA_DIGITS[+d]);

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a = 1, b = 0) => b + Math.random() * (a - b);
export const randInt = (a, b) => Math.floor(rand(b + 1, a));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** آرایه را در جا بُر می‌زند و برمی‌گرداند. */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** بزرگ‌ترین مقسوم‌علیه مشترک — برای ساده‌کردن کسرها. */
export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

export const ease = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2),
  outElastic: (t) =>
    t === 0 || t === 1 ? t : Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * 2.09) + 1,
};

/* ─── حلقه‌ی انیمیشن ─────────────────────────────────────────────── */

export class Loop {
  /** @param {(dt:number, t:number)=>void} step تابعی که هر فریم صدا زده می‌شود (dt به ثانیه) */
  constructor(step) {
    this.step = step;
    this.running = false;
    this.last = 0;
    this.t = 0;
    this._frame = this._frame.bind(this);
  }
  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this._frame);
  }
  stop() {
    this.running = false;
  }
  _frame(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.last) / 1000, 1 / 20); // سقف برای جلوگیری از پرش
    this.last = now;
    this.t += dt;
    this.step(dt, this.t);
    requestAnimationFrame(this._frame);
  }
}

/** بوم را با نسبت پیکسل دستگاه تنظیم می‌کند تا روی موبایل تار نشود. */
export function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

/* ─── سیستم ذرات ────────────────────────────────────────────────── */

const CONFETTI_COLORS = ['#ff5d8f', '#ffd166', '#06d6a0', '#5b8def', '#c77dff', '#ff9f1c'];

export class Particles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.items = [];
  }

  /** انفجار کاغذرنگی از یک نقطه — برای لحظه‌های موفقیت. */
  confetti(x, y, count = 40) {
    for (let i = 0; i < count; i++) {
      const a = rand(Math.PI * 2);
      const sp = rand(420, 120);
      this.items.push({
        kind: 'confetti', x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 160,
        w: rand(11, 5), h: rand(14, 6),
        rot: rand(Math.PI * 2), vr: rand(9, -9),
        color: pick(CONFETTI_COLORS),
        life: rand(1.6, 0.9), age: 0,
      });
    }
  }

  /** درخشش نرم — برای بازخورد ملایم روی یک شیء. */
  sparkle(x, y, count = 14, color = '#ffd166') {
    for (let i = 0; i < count; i++) {
      const a = rand(Math.PI * 2);
      const sp = rand(180, 40);
      this.items.push({
        kind: 'spark', x, y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: rand(4, 1.5), color,
        life: rand(0.8, 0.4), age: 0,
      });
    }
  }

  /** حلقه‌ی موج — برای نشان‌دادن «اینجا اتفاقی افتاد». */
  ring(x, y, color = '#5b8def', maxR = 90) {
    this.items.push({ kind: 'ring', x, y, r: 6, maxR, color, life: 0.6, age: 0 });
  }

  update(dt) {
    for (const p of this.items) {
      p.age += dt;
      if (p.kind === 'confetti') {
        p.vy += 900 * dt;
        p.vx *= 0.99;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
      } else if (p.kind === 'spark') {
        p.vx *= 0.93; p.vy *= 0.93;
        p.x += p.vx * dt; p.y += p.vy * dt;
      } else if (p.kind === 'ring') {
        p.r = lerp(6, p.maxR, ease.outCubic(p.age / p.life));
      }
    }
    this.items = this.items.filter((p) => p.age < p.life);
  }

  draw() {
    const ctx = this.ctx;
    for (const p of this.items) {
      const k = 1 - p.age / p.life;
      ctx.save();
      ctx.globalAlpha = clamp(k, 0, 1);
      if (p.kind === 'confetti') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else if (p.kind === 'spark') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * k, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4 * k;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  get length() { return this.items.length; }
  clear() { this.items.length = 0; }
}

/* ─── صدا (بدون فایل صوتی؛ ساخته‌شده با WebAudio) ────────────────── */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  _ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  /** یک نُت ساده با پوش نمایی. */
  tone(freq, dur = 0.18, type = 'sine', gain = 0.18, delay = 0) {
    const ctx = this._ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  pop()     { this.tone(560, 0.12, 'triangle', 0.14); }
  click()   { this.tone(320, 0.07, 'square', 0.07); }
  pick()    { this.tone(700, 0.09, 'sine', 0.12); }
  drop()    { this.tone(420, 0.14, 'sine', 0.14); }
  good()    { [523, 659, 784].forEach((f, i) => this.tone(f, 0.22, 'sine', 0.16, i * 0.075)); }
  win()     { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.35, 'triangle', 0.16, i * 0.11)); }
  nope()    { this.tone(196, 0.22, 'sawtooth', 0.09); }
  whoosh()  { this.tone(180, 0.3, 'sine', 0.06); this.tone(240, 0.25, 'sine', 0.05, 0.05); }
  toggle(on) { this.enabled = on; }
}

export const sfx = new SoundEngine();

/* ─── بلندخوانی فارسی (اختیاری) ─────────────────────────────────── */

export const speech = {
  enabled: true,
  say(text) {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fa-IR';
    u.rate = 0.92;
    const fa = window.speechSynthesis.getVoices().find((v) => v.lang?.startsWith('fa'));
    if (fa) u.voice = fa;
    window.speechSynthesis.speak(u);
  },
  stop() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  },
};

/* ─── کشیدن و رها کردن (ماوس + لمس) ─────────────────────────────── */

/**
 * روی یک عنصر HTML قابلیت کشیدن اضافه می‌کند.
 * @param {HTMLElement} el
 * @param {{onStart?:Function, onMove?:Function, onEnd?:Function, handleOnly?:boolean}} hooks
 */
export function makeDraggable(el, hooks = {}) {
  let startX = 0, startY = 0, baseX = 0, baseY = 0, dragging = false, pid = null;

  const down = (e) => {
    if (el.dataset.locked === 'true') return;
    dragging = true;
    pid = e.pointerId;
    el.setPointerCapture(pid);
    startX = e.clientX; startY = e.clientY;
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform || '');
    baseX = m ? +m[1] : 0;
    baseY = m ? +m[2] : 0;
    el.classList.add('is-dragging');
    hooks.onStart?.(e, el);
  };
  const move = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.style.transform = `translate(${baseX + dx}px, ${baseY + dy}px)`;
    hooks.onMove?.(e, el, { dx, dy });
  };
  const up = (e) => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('is-dragging');
    try { el.releasePointerCapture(pid); } catch { /* عنصر قبلاً حذف شده */ }
    hooks.onEnd?.(e, el);
  };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.style.touchAction = 'none';
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
  };
}

/** آیا مرکز عنصر a داخل مستطیل عنصر b است؟ */
export function centerInside(a, b, pad = 0) {
  const ra = a.getBoundingClientRect();
  const rb = b.getBoundingClientRect();
  const cx = ra.left + ra.width / 2;
  const cy = ra.top + ra.height / 2;
  return cx > rb.left - pad && cx < rb.right + pad && cy > rb.top - pad && cy < rb.bottom + pad;
}

/* ─── رابط کاربری مشترک ─────────────────────────────────────────── */

/** پیام راهنمای پایین صفحه را عوض می‌کند (با انیمیشن ملایم). */
export function setHint(text, { speak = false } = {}) {
  const el = document.querySelector('[data-hint]');
  if (!el) return;
  el.classList.remove('hint--in');
  void el.offsetWidth; // ری‌استارت انیمیشن
  el.innerHTML = text;
  el.classList.add('hint--in');
  if (speak) speech.say(el.textContent);
}

/** پیام شناور کوتاه. */
export function toast(text, kind = 'ok') {
  const box = document.querySelector('[data-toasts]') || (() => {
    const d = document.createElement('div');
    d.setAttribute('data-toasts', '');
    d.className = 'toasts';
    document.body.appendChild(d);
    return d;
  })();
  const t = document.createElement('div');
  t.className = `toast toast--${kind}`;
  t.textContent = text;
  box.appendChild(t);
  setTimeout(() => {
    t.classList.add('toast--out');
    setTimeout(() => t.remove(), 400);
  }, 2200);
}

/** پرده‌ی جشن پایان مرحله. */
export function celebrate({ title, body, buttonText = 'مرحله‌ی بعد', onNext, emoji = '🎉' }) {
  sfx.win();
  const back = document.createElement('div');
  back.className = 'celebrate';
  back.innerHTML = `
    <div class="celebrate__card">
      <div class="celebrate__emoji">${emoji}</div>
      <h2>${title}</h2>
      <p>${body}</p>
      <button class="btn btn--big" type="button">${buttonText}</button>
    </div>`;
  document.body.appendChild(back);
  requestAnimationFrame(() => back.classList.add('celebrate--in'));
  back.querySelector('button').addEventListener('click', () => {
    back.classList.remove('celebrate--in');
    setTimeout(() => back.remove(), 300);
    onNext?.();
  });
  return back;
}

/** ذخیره‌ی ساده‌ی پیشرفت در مرورگر (اگر در دسترس نبود، بی‌صدا رد می‌شود). */
export const store = {
  key: (game) => `bazi:${game}`,
  get(game, fallback = {}) {
    try { return JSON.parse(localStorage.getItem(this.key(game))) ?? fallback; }
    catch { return fallback; }
  },
  set(game, value) {
    try { localStorage.setItem(this.key(game), JSON.stringify(value)); } catch { /* حالت خصوصی */ }
  },
};

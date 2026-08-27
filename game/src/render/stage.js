// مدیریت بوم: اندازه، حلقهٔ انیمیشن، تم، ذرات و کشیدن دستگیره‌ها
import { PALETTE, Particles, rr, setPalette } from './draw.js';
import { SCENES, drawWorld } from './scenes.js';
import { clamp } from '../core/format.js';

export class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = 1;
    this.w = 0;
    this.h = 0;
    this.time = 0;
    this.theme = 'light';
    this.particles = new Particles();
    this.handles = [];
    this.activeHandle = null;
    this.hoverHandle = null;
    this.reducedMotion = false;
    this.getState = () => null;
    this.onHandleChange = () => {};
    this.running = false;
    this._lastFrame = 0;

    this._bindPointer();

    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(canvas);
    }
  }

  get palette() {
    return this.theme === 'dark' ? PALETTE.dark : PALETTE.light;
  }

  setTheme(theme) { this.theme = theme; }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.render();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._lastFrame = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this._lastFrame) / 1000);
      this._lastFrame = now;
      if (!this.reducedMotion) this.time += dt;
      this.particles.update(dt);
      this.render();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  render() {
    const view = this.getState();
    if (!view || !this.w) return;
    const ctx = this.ctx;
    const P = this.palette;
    setPalette(P);
    ctx.clearRect(0, 0, this.w, this.h);

    const groundY = view.machine === 'GEARS' ? 0.92 : 0.80;
    const gy = drawWorld(ctx, this.w, this.h, P, this.time, {
      groundY,
      trees: view.machine !== 'GEARS',
      birds: !this.reducedMotion
    });

    const scene = SCENES[view.machine];
    let handles = [];
    if (scene) {
      ctx.save();
      try {
        handles = scene(ctx, {
          w: this.w, h: this.h, gy, P,
          time: this.time,
          t: clamp(view.t ?? 0, 0, 1),
          state: view.state,
          showVectors: !!view.showVectors,
          particles: this.reducedMotion ? null : this.particles
        }) || [];
      } catch (err) {
        console.error('خطا در رسم صحنه:', err);
      }
      ctx.restore();
    }

    this.particles.draw(ctx);

    this.handles = view.interactive === false ? [] : handles;
    this._drawHandles(ctx, P);

    if (this.theme === 'contrast') {
      ctx.save();
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = 'hsl(0,0%,50%)';
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.restore();
    }
  }

  _drawHandles(ctx, P) {
    for (const hd of this.handles) {
      const active = this.activeHandle === hd.id || this.hoverHandle === hd.id;
      ctx.save();
      ctx.translate(hd.x, hd.y);
      ctx.beginPath();
      ctx.arc(0, 0, hd.r, 0, Math.PI * 2);
      ctx.fillStyle = active ? 'rgba(240,144,12,.30)' : 'rgba(255,255,255,.55)';
      ctx.fill();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = active ? '#f0900c' : 'rgba(30,50,70,.55)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = active ? '#f0900c' : 'rgba(30,50,70,.7)';
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
      // پیکان‌های راهنما
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * (hd.r - 4), 0);
        ctx.lineTo(s * (hd.r - 9), -4);
        ctx.moveTo(s * (hd.r - 4), 0);
        ctx.lineTo(s * (hd.r - 9), 4);
        ctx.stroke();
      }
      ctx.restore();
      if (active && hd.hint) {
        ctx.save();
        ctx.font = '700 11px Vazirmatn, Tahoma, sans-serif';
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        const tw = ctx.measureText(hd.hint).width + 14;
        ctx.fillStyle = 'rgba(20,35,50,.9)';
        rr(ctx, hd.x - tw / 2, hd.y - hd.r - 30, tw, 22, 8);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'middle';
        ctx.fillText(hd.hint, hd.x, hd.y - hd.r - 19);
        ctx.restore();
      }
    }
  }

  _pos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  _hit(pos) {
    for (const hd of this.handles) {
      if (Math.hypot(pos.x - hd.x, pos.y - hd.y) <= hd.r + 8) return hd;
    }
    return null;
  }

  _bindPointer() {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => {
      const hit = this._hit(this._pos(e));
      if (hit) {
        this.activeHandle = hit.id;
        c.setPointerCapture(e.pointerId);
        e.preventDefault();
      }
    });
    c.addEventListener('pointermove', (e) => {
      const pos = this._pos(e);
      if (this.activeHandle) {
        const hd = this.handles.find((x) => x.id === this.activeHandle);
        if (hd && hd.toValue) this.onHandleChange(hd.id, hd.toValue(pos.x, pos.y));
        return;
      }
      const hit = this._hit(pos);
      const id = hit ? hit.id : null;
      if (id !== this.hoverHandle) {
        this.hoverHandle = id;
        c.style.cursor = id ? 'grab' : 'default';
      }
    });
    const end = () => {
      if (this.activeHandle) this.activeHandle = null;
      c.style.cursor = this.hoverHandle ? 'grab' : 'default';
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    c.addEventListener('pointerleave', () => { this.hoverHandle = null; });
  }

  celebrate(x, y) {
    if (this.reducedMotion) return;
    const colors = ['#f0900c', '#12a06a', '#0b7fc4', '#e0435a', '#fbbf24'];
    for (let i = 0; i < 5; i++) {
      this.particles.burst(x ?? this.w / 2, y ?? this.h / 2, 14, colors[i % colors.length],
        { speed: 5, life: 1.4, size: 5, gravity: 0.16 });
    }
  }
}

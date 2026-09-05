/*!
title: آزمایشگاهِ آینه‌ها — نور و مشاهدهٔ اجسام (آزمایش)
bg: #16202c
*/

/* ═══════════════════════════════════════════════════════════════════════
   آزمایشگاهِ آینه‌ها — علومِ سوم، درس ۷ «نور و مشاهدهٔ اجسام»

   فعّالیتِ کتاب: «به تصویرِ خود در یک آینهٔ تخت، یک آینهٔ فرورفته و یک
   آینهٔ برآمده دقّت کنید… ویژگی‌های تصویر را در جدولِ زیر بنویسید.»
   و: «سطحِ درونی و بیرونیِ یک قاشقِ برّاق را نگاه کنید.»

   اینجا همان جدول است، ولی خودش را پُر نمی‌کند: بچّه شمع را جلو و عقب
   می‌برد، تصویر را می‌بیند و سه ستونِ دفترچه را خودش می‌زند. دفترچه فقط
   می‌گوید درست بود یا نه — هرگز جوابی نمی‌نویسد.

   ── درستیِ فیزیکی ───────────────────────────────────────────────
   همه‌چیز از قانونِ آینهٔ کروی می‌آید و هیچ عددی دستی نیست:

        ۱/فاصلهٔ جسم + ۱/فاصلهٔ تصویر = ۱/کانون ،   کانون = شعاع ÷ ۲
        بزرگ‌نمایی = − فاصلهٔ تصویر ÷ فاصلهٔ جسم

   ▸ آینهٔ تخت مثل آینه‌ای با کانونِ بی‌نهایت است: تصویر به همان اندازه،
     راست، و به همان فاصله پشتِ آینه.
   ▸ آینهٔ فرورفته کانونِ مثبت دارد؛ پس تصویر با فاصلهٔ جسم عوض می‌شود —
     دورتر از مرکزِ خمیدگی: کوچک و وارونه؛ بینِ مرکز و کانون: بزرگ و
     وارونه؛ نزدیک‌تر از کانون: بزرگ و راست و پشتِ آینه.
   ▸ آینهٔ برآمده کانونِ منفی دارد؛ پس تصویر همیشه کوچک و راست و پشتِ
     آینه است، هرجای جسم باشد.

   سه پرتوِ نقشه هم پرتوهای اصلیِ واقعی‌اند و درست همان‌جا به هم می‌رسند
   که فرمول می‌گوید — نقشه و عدد یک چیز را می‌گویند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  bg:    '#16202c', bgLo: '#0e161f', bgHi: '#22303f',
  wood:  '#8a6a45', woodDk: '#4f3a24',
  steel: '#9aa9ba', steelDk: '#5d6a79', glass: '#dceaf5',
  paper: '#fbf7ec', card: '#ffffff',
  ink:   '#1e2a34', inkSoft: '#78868f',
  good:  '#4e9f6c', bad: '#c04a34', gold: '#d9a43c', accent: '#4c9ec4',
  ray1:  '#ffd27a', ray2: '#7fd0e8', ray3: '#f39ec0',
  flame: '#ffb54a',
};

/* ───────── قانونِ آینه ───────── */

const CM = 3;                  /* پیکسل بر سانتی‌متر */
const FCM = 30;                /* کانونِ آینه‌های خمیده: ۳۰ سانتی‌متر */
const RCM = FCM * 2;           /* شعاعِ خمیدگی */
const DO_MIN = 12, DO_MAX = 120;
const AY = 340;                /* محورِ نوری */
const MX = 720;                /* رأسِ آینه */
const HO = 54;                 /* بلندیِ شمع روی صحنه */
const APER = 96;               /* نیم‌دهانهٔ آینه */
const RAY_H = 215;             /* تا این بلندی، صفحهٔ آینه با خط‌چین ادامه دارد */

/** فاصلهٔ تصویر و بزرگ‌نمایی — از خودِ فرمولِ آینه. */
function optics(kind, d) {
  if (kind === 0) return { f: Infinity, di: -d, m: 1 };
  const f = kind === 1 ? FCM : -FCM;
  const di = d * f / (d - f);
  return { f, di, m: -di / d };
}

const KINDS = ['آینهٔ تخت', 'آینهٔ فرورفته', 'آینهٔ برآمده'];

const ROWS = [
  { n: 'اندازهٔ تصویر', opts: ['بزرگ‌تر', 'برابر', 'کوچک‌تر'] },
  { n: 'جهتِ تصویر',   opts: ['راست', 'وارونه'] },
  { n: 'جای تصویر',    opts: ['جلوی آینه', 'پشتِ آینه'] },
];

/** پاسخِ درست از روی فیزیک — نه از روی جدولِ آماده. */
function truthOf(o) {
  const am = Math.abs(o.m);
  return [am > 1.02 ? 0 : am < .98 ? 2 : 1, o.m > 0 ? 0 : 1, o.di > 0 ? 0 : 1];
}

/** هر آینه چند جای مختلف را باید ثبت کند. */
const SLOTS = [1, 3, 2];
function slotOf(kind, d) {
  if (kind === 0) return 0;
  if (kind === 1) {
    if (d > RCM + 2) return 0;               /* دورتر از مرکزِ خمیدگی */
    if (d > FCM + 2 && d < RCM - 2) return 1; /* بینِ مرکز و کانون */
    if (d < FCM - 2) return 2;               /* نزدیک‌تر از کانون */
    return -1;
  }
  if (d < 50) return 0;
  if (d > 70) return 1;
  return -1;
}

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  kind: 0, d: 75,
  sel: [-1, -1, -1],
  done: SLOTS.map((n) => new Array(n).fill(0)),
  mark: null, markT: 0,
  drag: false,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
function tip(msg) { S.tip = msg; S.tipT = 3.6; }

const allDone = () => S.done.every((a) => a.every((v) => v));

/* ───────── جای‌ها ───────── */

const PAN = { x: 24, y: 96, w: 300, h: 640 };
const BEN = { x: 344, y: 96, w: 832, h: 640 };
const BENCH_Y = 600;                       /* میزِ نوری */
const RULER_Y = 616;

function tabRect(i) { return { x: BEN.x + 20 + i * 264, w: 252, y: BEN.y + 16, h: 46 }; }
function chipRect(r, i) {
  const y = PAN.y + 138 + r * 90;
  const opts = ROWS[r].opts.length;
  const gap = 6, w = (PAN.w - 24 - gap * (opts - 1)) / opts;
  return { x: PAN.x + 12 + i * (w + gap), y: y + 26, w, h: 42 };
}
const BTN_SAVE = { x: PAN.x + 12, y: PAN.y + 414, w: PAN.w - 24, h: 54 };
const BTN_LESS = { x: BEN.x + 252, y: BENCH_Y + 82, r: 26 };
const BTN_MORE = { x: BEN.x + 332, y: BENCH_Y + 82, r: 26 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 490, w: 300, h: 68 };

const objX = () => MX - S.d * CM;

/* ───────── ورودی ───────── */

function setDo(d) {
  S.d = clamp(Math.round(d), DO_MIN, DO_MAX);
  S.mark = null;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.drag) { setDo((MX - p.x) / CM); return; }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    for (let i = 0; i < 3; i++) if (inRect(p, tabRect(i))) S.hover = { k: 'tab', i };
    for (let r = 0; r < ROWS.length; r++)
      for (let i = 0; i < ROWS[r].opts.length; i++)
        if (inRect(p, chipRect(r, i))) S.hover = { k: 'chip', r, i };
    if (inRect(p, BTN_SAVE)) S.hover = { k: 'save' };
    if (inCircle(p, BTN_LESS)) S.hover = { k: 'less' };
    if (inCircle(p, BTN_MORE)) S.hover = { k: 'more' };
    if (Math.abs(p.x - objX()) < 34 && p.y > AY - HO - 26 && p.y < BENCH_Y) S.hover = { k: 'obj' };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { S.phase = 'lab'; S.phaseT = 0; sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) {
      S.phase = 'intro'; S.phaseT = 0;
      S.done = SLOTS.map((n) => new Array(n).fill(0));
      S.kind = 0; S.d = 75; S.sel = [-1, -1, -1]; S.mark = null;
      sfx.tap();
    }
    return;
  }
  for (let i = 0; i < 3; i++) if (inRect(p, tabRect(i))) {
    S.kind = i; S.sel = [-1, -1, -1]; S.mark = null; sfx.tap(); return;
  }
  for (let r = 0; r < ROWS.length; r++)
    for (let i = 0; i < ROWS[r].opts.length; i++)
      if (inRect(p, chipRect(r, i))) {
        S.sel[r] = S.sel[r] === i ? -1 : i; S.mark = null; sfx.tap(); return;
      }
  if (inRect(p, BTN_SAVE)) { save(); return; }
  if (inCircle(p, BTN_LESS, 6)) { setDo(S.d - 5); sfx.tick(); return; }
  if (inCircle(p, BTN_MORE, 6)) { setDo(S.d + 5); sfx.tick(); return; }
  if (Math.abs(p.x - objX()) < 34 && p.y > AY - HO - 26 && p.y < BENCH_Y) {
    S.drag = true;
    try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
    sfx.tap();
  }
});

function release() { S.drag = false; }
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

function save() {
  if (S.sel.some((v) => v < 0)) { tip('هر سه سطر را پر کن.'); S.shake = .12; sfx.nope(); return; }
  const slot = slotOf(S.kind, S.d);
  if (slot < 0) { tip('شمع را کمی جلوتر یا عقب‌تر ببر.'); S.shake = .1; sfx.nope(); return; }
  const t = truthOf(optics(S.kind, S.d));
  const mark = S.sel.map((v, i) => v === t[i]);
  S.mark = mark; S.markT = 2.6;
  if (mark.every(Boolean)) {
    if (!S.done[S.kind][slot]) {
      S.done[S.kind][slot] = 1;
      bits.confetti(PAN.x + PAN.w / 2, BTN_SAVE.y, 20, [P.good, P.gold, P.card]);
    }
    sfx.good();
    if (allDone()) { S.phase = 'won'; S.phaseT = 0; sfx.win(); }
    else if (S.done[S.kind].every((v) => v)) toast.say(KINDS[S.kind] + ' تمام شد', 'good');
  } else { sfx.nope(); S.shake = .14; }
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.markT > 0) S.markT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => runLoop(step));

/* ───────── ابزارِ نقاشی ───────── */

function rrPath(x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function numText(str, x, y, o = {}) {
  ctx.save();
  ctx.direction = 'ltr';
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = o.color || P.ink;
  ctx.font = `${o.weight || 700} ${o.size || 18}px "${o.family || 'Vazirmatn'}", Tahoma, sans-serif`;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function line(x0, y0, x1, y1, col, w, dash) {
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.restore();
}

/* ───────── نقشهٔ پرتوها ─────────
   ساختِ نزدیک‌محور — همان سه پرتوی اصلیِ کتابِ فیزیک.               */

/** نقطهٔ روی سطحِ آینه در بلندیِ h (برای اینکه پرتو به خودِ سطح بخورد). */
function surfX(h) {
  if (S.kind === 0) return MX;
  const R = RCM * CM, sg = S.kind === 1 ? 1 : -1;
  const hh = Math.min(Math.abs(h), R - 1);
  return MX - sg * (R - Math.sqrt(R * R - hh * hh));
}

function drawRays() {
  const o = optics(S.kind, S.d);
  const ox = objX(), oy = AY - HO;                 /* نوکِ شمع */
  const ix = MX - o.di * CM;                       /* جای تصویر روی صحنه */
  const iy = AY - o.m * HO;
  const far = Math.abs(o.di) * CM > 3000;
  const fx = MX - (S.kind === 0 ? 0 : o.f * CM);   /* نقطهٔ کانون روی محور */

  const seg = (x0, y0, x1, y1, col) => line(x0, y0, x1, y1, col, 2.6);
  const virt = (x0, y0, x1, y1, col) => line(x0, y0, x1, y1, col, 2, [7, 7]);

  /* ── پرتوِ ۱: موازیِ محور می‌آید ── */
  const a1x = surfX(HO), a1y = oy;
  seg(ox, oy, a1x, a1y, P.ray1);
  if (S.kind === 0) {
    seg(a1x, a1y, BEN.x + 26, a1y, P.ray1);
    virt(a1x, a1y, Math.min(ix, BEN.x + BEN.w - 20), iy, P.ray1);
  } else {
    /* بازتاب از کانون می‌گذرد (فرورفته) یا انگار از آن می‌آید (برآمده) */
    const sg = S.kind === 1 ? 1 : -1;
    const dx = (fx - a1x) * sg, dy = (AY - a1y) * sg;
    const k = 620 / Math.hypot(dx, dy);
    seg(a1x, a1y, a1x + dx * k, a1y + dy * k, P.ray1);
    if (S.kind === 2) virt(a1x, a1y, fx, AY, P.ray1);
    if (o.di < 0 && !far) virt(a1x, a1y, ix, iy, P.ray1);
  }

  /* ── پرتوِ ۲: روی خطِ جسم و کانون، رو به آینه ──
     اگر جسم داخلِ کانون باشد این پرتو «انگار از کانون آمده» است؛
     در هر دو حال بازتابش موازیِ محور می‌شود.                      */
  if (S.kind !== 0) {
    let dx = fx - ox, dy = AY - oy;
    if (dx < 0) { dx = -dx; dy = -dy; }
    const hy = oy + dy * (MX - ox) / dx;
    if (Math.abs(hy - AY) < RAY_H) {
      const hx = surfX(hy - AY);
      seg(ox, oy, hx, hy, P.ray2);
      if (S.kind === 2 || fx > ox) virt(hx, hy, fx, AY, P.ray2);
      seg(hx, hy, BEN.x + 26, hy, P.ray2);
      if (o.di < 0 && !far) virt(hx, hy, ix, iy, P.ray2);
    }
  }

  /* ── پرتوِ ۳: به رأسِ آینه، با زاویهٔ برابر برمی‌گردد ── */
  const vdx = MX - ox, vdy = AY - oy;
  seg(ox, oy, MX, AY, P.ray3);
  const k3 = (S.kind === 0 ? 520 : 620) / Math.hypot(vdx, vdy);
  seg(MX, AY, MX - vdx * k3, AY + vdy * k3, P.ray3);
  if (o.di < 0 && !far) virt(MX, AY, ix, iy, P.ray3);

  /* ── تصویر ── */
  if (far) {
    text('تصویر خیلی دور می‌افتد', (BEN.x + MX) / 2, AY - 150, { size: 17, color: P.inkSoft });
  } else if (ix > BEN.x + 10 && ix < BEN.x + BEN.w - 10) {
    drawCandle(ix, AY, o.m, true);
  }
  return o;
}

/* ───────── شمع ───────── */

function drawCandle(x, base, m, ghost) {
  const h = HO * Math.abs(m);
  const up = m >= 0 ? -1 : 1;                /* وارونه یا راست */
  ctx.save();
  if (ghost) {
    ctx.globalAlpha = .9;
    const gg = ctx.createRadialGradient(x, base, 4, x, base, 90);
    gg.addColorStop(0, 'rgba(127, 208, 232, .18)');
    gg.addColorStop(1, 'rgba(127, 208, 232, 0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(x, base, 90, 0, TAU); ctx.fill();
  }
  const bodyH = h * .68, wick = h * .1, fl = h * .22;
  /* نعلبکی */
  ctx.fillStyle = P.steel;
  wobbleEllipse(x, base, 26 * Math.min(1.3, Math.abs(m) * .6 + .5), 7, 0, 5, 1); ctx.fill();
  /* بدنه */
  const w = 15 * clamp(Math.abs(m) * .5 + .6, .5, 1.5);
  const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
  g.addColorStop(0, '#fff2d6'); g.addColorStop(1, '#dcc189');
  ctx.fillStyle = g;
  ctx.beginPath();
  rrPath(x - w, base + Math.min(0, up * bodyH), w * 2, bodyH, 5);
  ctx.fill();
  /* فتیله و شعله */
  const ty = base + up * bodyH;
  line(x, ty, x, ty + up * wick, '#4a3a2c', 3);
  ctx.fillStyle = P.flame;
  wobbleEllipse(x, ty + up * (wick + fl * .5), fl * .45, fl * .6, 0, 9, 1); ctx.fill();
  ctx.fillStyle = '#fff6dc';
  wobbleEllipse(x, ty + up * (wick + fl * .45), fl * .22, fl * .34, 0, 11, .8); ctx.fill();
  ctx.restore();
}

/* ───────── آینه ───────── */

function mirrorPath(off) {
  if (S.kind === 0) {
    ctx.beginPath();
    ctx.moveTo(MX + off, AY - APER); ctx.lineTo(MX + off, AY + APER);
    return;
  }
  const R = RCM * CM, sg = S.kind === 1 ? 1 : -1;
  const cx = MX - sg * R;                       /* مرکزِ خمیدگی */
  const th = Math.asin(APER / R);
  const a0 = sg > 0 ? -th : Math.PI - th, a1 = sg > 0 ? th : Math.PI + th;
  ctx.beginPath();
  ctx.arc(cx, AY, R + sg * off, a0, a1);
}

function drawMirror() {
  ctx.save();
  ctx.lineCap = 'round';
  /* پشتِ مات */
  withShadow(16, 6, .4, () => {
    ctx.strokeStyle = P.woodDk; ctx.lineWidth = 17;
    mirrorPath(S.kind === 0 ? 7 : 7); ctx.stroke();
  }, '0, 0, 0');
  /* رویهٔ آینه‌ای */
  const g = ctx.createLinearGradient(MX - 14, 0, MX + 14, 0);
  g.addColorStop(0, P.glass); g.addColorStop(1, '#9fb2c4');
  ctx.strokeStyle = g; ctx.lineWidth = 10;
  mirrorPath(0); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 2.6;
  mirrorPath(-3.2); ctx.stroke();
  ctx.restore();
  /* پایه تا میز */
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(MX - 7, AY + APER, 14, BENCH_Y - AY - APER, 5); ctx.fill();
  ctx.fillStyle = P.wood;
  ctx.beginPath(); rrPath(MX - 34, BENCH_Y - 12, 68, 16, 6); ctx.fill();
}

/* ───────── میز، خط‌کش و نشانه‌ها ───────── */

function drawBench() {
  ctx.fillStyle = '#111c26';
  ctx.beginPath(); rrPath(BEN.x, BEN.y, BEN.w, BEN.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(76,158,196,.22)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(BEN.x, BEN.y, BEN.w, BEN.h, 16); ctx.stroke();

  /* محورِ نوری */
  line(BEN.x + 18, AY, BEN.x + BEN.w - 18, AY, 'rgba(220,234,245,.28)', 2, [10, 8]);
  /* ادامهٔ صفحهٔ آینه — تا پرتوهای بلند هم جایی برای خوردن داشته باشند */
  line(MX, AY - RAY_H, MX, AY - APER, 'rgba(220,234,245,.16)', 2, [6, 8]);
  line(MX, AY + APER, MX, AY + RAY_H, 'rgba(220,234,245,.16)', 2, [6, 8]);

  /* میزِ چوبی */
  ctx.save();
  ctx.beginPath(); rrPath(BEN.x + 18, BENCH_Y, BEN.w - 36, 14, 6); ctx.clip();
  ctx.fillStyle = texWood(P.wood, '#5b4128');
  ctx.fillRect(BEN.x + 18, BENCH_Y, BEN.w - 36, 14);
  ctx.restore();

  /* خط‌کشِ سانتی‌متری از رأسِ آینه به چپ */
  line(BEN.x + 24, RULER_Y, MX, RULER_Y, 'rgba(220,234,245,.35)', 2);
  for (let c = 0; c <= 130; c += 5) {
    const x = MX - c * CM;
    if (x < BEN.x + 24) break;
    const big = c % 20 === 0;
    line(x, RULER_Y, x, RULER_Y + (big ? 12 : 6), 'rgba(220,234,245,.35)', big ? 2 : 1.4);
    if (big && c) numText(fa(c), x, RULER_Y + 26, { size: 13, color: 'rgba(220,234,245,.6)' });
  }
  /* کانون و مرکزِ خمیدگی */
  if (S.kind !== 0) {
    const sg = S.kind === 1 ? 1 : -1;
    for (const [cm, lab] of [[FCM, 'ک'], [RCM, 'م']]) {
      const x = MX - sg * cm * CM;
      if (x < BEN.x + 20 || x > BEN.x + BEN.w - 20) continue;
      ctx.save();
      ctx.translate(x, AY); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = S.kind === 1 ? P.gold : 'rgba(217,164,60,.6)';
      ctx.fillRect(-7, -7, 14, 14);
      ctx.restore();
      text(lab, x, AY, { size: 12, color: '#1c2530' });
      if (sg < 0) line(x, AY - 16, x, AY + 16, 'rgba(217,164,60,.35)', 1.6, [4, 4]);
    }
    text('ک: کانون    م: مرکزِ خمیدگی', BEN.x + BEN.w - 30, BEN.y + BEN.h - 18,
      { size: 13, color: 'rgba(217,164,60,.75)', align: 'right' });
  }
  /* پشتِ آینه سایه‌دار است تا «پشت» دیده شود */
  ctx.fillStyle = 'rgba(10, 18, 26, .38)';
  ctx.fillRect(MX + 10, BEN.y + 78, BEN.x + BEN.w - 18 - (MX + 10), BENCH_Y - BEN.y - 70);
  text('پشتِ آینه', (MX + BEN.x + BEN.w) / 2, BEN.y + 102, { size: 15, color: 'rgba(220,234,245,.4)' });
}

function drawTabs() {
  for (let i = 0; i < 3; i++) {
    const r = tabRect(i);
    const on = S.kind === i, hot = S.hover && S.hover.k === 'tab' && S.hover.i === i;
    ctx.fillStyle = on ? P.accent : (hot ? '#2b3d4c' : '#1b2734');
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 12); ctx.fill();
    ctx.strokeStyle = on ? '#8fd6ee' : 'rgba(220,234,245,.16)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 12); ctx.stroke();
    text(KINDS[i], r.x + r.w / 2 + 22, r.y + r.h / 2,
      { size: 19, color: on ? '#f4fbff' : 'rgba(220,234,245,.7)' });
    /* دانه‌های پرشده */
    for (let k = 0; k < SLOTS[i]; k++) {
      const cx = r.x + 20 + k * 14, cy = r.y + r.h / 2;
      ctx.fillStyle = S.done[i][k] ? P.good : 'rgba(255,255,255,.22)';
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, TAU); ctx.fill();
    }
  }
}

/* ───────── دفترچه ───────── */

function drawPanel() {
  paper(PAN.x, PAN.y, PAN.w, PAN.h, P.paper, 31, 16, .4);
  ctx.fillStyle = P.accent;
  ctx.beginPath(); rrPath(PAN.x, PAN.y, PAN.w, 10, 5); ctx.fill();
  text('دفترچه', PAN.x + PAN.w / 2, PAN.y + 42, { size: 26, family: 'Lalezar', color: P.ink });
  text('تصویر را نگاه کن و بنویس', PAN.x + PAN.w / 2, PAN.y + 74, { size: 15, color: P.inkSoft });
  text(KINDS[S.kind], PAN.x + PAN.w / 2, PAN.y + 102, { size: 17, color: P.accent });

  for (let r = 0; r < ROWS.length; r++) {
    const y = PAN.y + 138 + r * 90;
    text(ROWS[r].n, PAN.x + PAN.w - 14, y + 8, { size: 16, color: P.ink, align: 'right' });
    if (S.mark && S.markT > 0) {
      const ok = S.mark[r];
      ctx.fillStyle = ok ? P.good : P.bad;
      ctx.beginPath(); ctx.arc(PAN.x + 22, y + 8, 9, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      ctx.beginPath();
      if (ok) { ctx.moveTo(PAN.x + 18, y + 8); ctx.lineTo(PAN.x + 21, y + 12); ctx.lineTo(PAN.x + 27, y + 4); }
      else { ctx.moveTo(PAN.x + 18, y + 4); ctx.lineTo(PAN.x + 26, y + 12); ctx.moveTo(PAN.x + 26, y + 4); ctx.lineTo(PAN.x + 18, y + 12); }
      ctx.stroke();
    }
    for (let i = 0; i < ROWS[r].opts.length; i++) {
      const b = chipRect(r, i);
      const on = S.sel[r] === i;
      const hot = S.hover && S.hover.k === 'chip' && S.hover.r === r && S.hover.i === i;
      ctx.fillStyle = on ? P.accent : (hot ? '#e7eef3' : '#f0f0e8');
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
      ctx.strokeStyle = on ? '#2c7fa4' : '#d6d6cb'; ctx.lineWidth = 2;
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
      text(ROWS[r].opts[i], b.x + b.w / 2, b.y + b.h / 2,
        { size: ROWS[r].opts.length > 2 ? 15 : 16, color: on ? '#fff' : P.ink });
    }
  }
  button(BTN_SAVE, 'ثبت کن', {
    hot: S.hover && S.hover.k === 'save', fill: '#2f7f96', hotFill: '#4fa3b8', size: 24 });

  /* جدولِ کارهای انجام‌شده */
  text('جدولِ آینه‌ها', PAN.x + PAN.w / 2, PAN.y + 500, { size: 17, color: P.ink });
  for (let i = 0; i < 3; i++) {
    const y = PAN.y + 530 + i * 34;
    text(KINDS[i], PAN.x + PAN.w - 14, y, { size: 15, color: P.inkSoft, align: 'right' });
    for (let k = 0; k < SLOTS[i]; k++) {
      const x = PAN.x + 26 + k * 24;
      ctx.fillStyle = S.done[i][k] ? P.good : '#e0e0d6';
      ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
      if (S.done[i][k]) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 4, y); ctx.lineTo(x - 1, y + 4); ctx.lineTo(x + 4, y - 4);
        ctx.stroke();
      }
    }
  }
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#0b131b';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(76,158,196,.28)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text('آزمایشگاهِ آینه‌ها', SCENE_W - 150, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  const n = S.done.reduce((a, b) => a + b.reduce((x, y) => x + y, 0), 0);
  const all = SLOTS.reduce((a, b) => a + b, 0);
  numText(fa(n) + ' / ' + fa(all), 300, HUD_H / 2, { size: 20, color: P.gold });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * (n / all), 5, 3); ctx.fill();
}

function mirIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 13;
  ctx.beginPath(); ctx.arc(0, 86, 96, -Math.PI / 2 - .5, -Math.PI / 2 + .5); ctx.stroke();
  ctx.strokeStyle = P.glass; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(0, 86, 92, -Math.PI / 2 - .5, -Math.PI / 2 + .5); ctx.stroke();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-34, 18); ctx.lineTo(-6, -4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(30, 18); ctx.stroke();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 880, h: 314, y: 132,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: P.inkSoft,
    icon: mirIcon,
    title: 'آینهٔ تخت، فرورفته، برآمده',
    body: 'یک شمع جلوی آینه می‌گذاریم و تصویرش را می‌بینیم.\nشمع را جلو و عقب ببر و ببین تصویر چه شکلی می‌شود.\nهر بار سه ستونِ دفترچه را خودت پر کن و ثبت بزن.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 830, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: P.inkSoft,
    icon: mirIcon,
    title: 'جدول کامل شد',
    body: 'هر سه آینه را خودت آزمایش کردی و جدولِ کتاب را پر کردی.\nحالا می‌دانی هر آینه با تصویر چه می‌کند و چرا آینهٔ ماشین\nو آینهٔ آرایشگاه مثل هم نیستند.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function draw() {
  beginScene(P.bgLo);
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.bgHi); g.addColorStop(1, P.bgLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, 0);
  }
  drawBench();
  ctx.save();
  ctx.beginPath(); rrPath(BEN.x, BEN.y, BEN.w, BEN.h, 16); ctx.clip();
  drawRays();
  drawMirror();
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(objX() - 6, AY + 4, 12, BENCH_Y - AY - 4, 5); ctx.fill();
  ctx.fillStyle = P.wood;
  ctx.beginPath(); rrPath(objX() - 26, BENCH_Y - 12, 52, 16, 6); ctx.fill();
  drawCandle(objX(), AY, 1, false);
  bits.draw();
  ctx.restore();
  drawTabs();

  /* فاصلهٔ جسم و دکمه‌های ریز */
  const o = optics(S.kind, S.d);
  line(objX(), RULER_Y - 10, objX(), RULER_Y + 10, P.gold, 3);
  ctx.fillStyle = 'rgba(251,247,236,.92)';
  ctx.beginPath(); rrPath(BEN.x + 26, BENCH_Y + 58, 190, 48, 12); ctx.fill();
  text('فاصلهٔ شمع', BEN.x + 190, BENCH_Y + 82, { size: 15, color: P.inkSoft, align: 'right' });
  numText(fa(S.d), BEN.x + 78, BENCH_Y + 82, { size: 22, color: P.ink });
  text('سانتی‌متر', BEN.x + 62, BENCH_Y + 82, { size: 12, color: P.inkSoft, align: 'right' });
  roundButton(BTN_LESS, '−', { hot: S.hover && S.hover.k === 'less', fill: '#3d5668', hotFill: '#51708a' });
  roundButton(BTN_MORE, '+', { hot: S.hover && S.hover.k === 'more', fill: '#3d5668', hotFill: '#51708a' });
  text('شمع را بکش یا با دکمه‌ها جابه‌جا کن', BEN.x + 620, BENCH_Y + 82,
    { size: 15, color: 'rgba(220,234,245,.55)' });
  ctx.restore();

  drawPanel();
  drawHUD();
  toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 460;
    paper(BEN.x + BEN.w / 2 - w / 2, SCENE_H - 52, w, 42, P.paper, 51, 12, .3);
    text(S.tip, BEN.x + BEN.w / 2, SCENE_H - 31, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.08, 'rgba(4, 10, 16, .44)', 0, .1);
}

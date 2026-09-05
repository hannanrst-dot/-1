/*!
title: کانونِ آینه — جست‌وجو کنیم و بسازیم (آزمایش)
bg: #131a24
*/

/* ═══════════════════════════════════════════════════════════════════════
   کانونِ آینه — علومِ سوم، درس ۸ «جست‌وجو کنیم و بسازیم»

   آینه‌ای که در کارگاه ساختیم را می‌بریم زیرِ آفتاب. نورِ خورشید موازی
   می‌تابد؛ آینه آن را برمی‌گرداند و ما با یک مقوّای سفید دنبالِ جایی
   می‌گردیم که لکّهٔ نور از همه‌جا کوچک‌تر و روشن‌تر است. آن‌جا کانونِ
   آینه است — آن‌قدر داغ که جای سوختگی روی مقوّا می‌گذارد.

   ── درستیِ فیزیکی ───────────────────────────────────────────────
   هیچ عددی از پیش نوشته نشده. سیزده پرتوِ موازی از سطحِ واقعیِ کمانِ
   آینه بازتاب می‌شوند — بردارِ عمود در نقطهٔ برخورد، و زاویهٔ بازتاب
   برابرِ زاویهٔ تابش — و پهنای لکّه روی مقوّا از خودِ همان پرتوها
   اندازه گرفته می‌شود. پس کوچک‌ترین لکّه را آزمایش پیدا می‌کند، نه
   یک فرمولِ از پیش نوشته.

   غشای کشیده‌شده کلاهکِ کره است؛ پس با هندسه:
         شعاعِ خمیدگی = (a² + s²) ÷ (۲s)   و   کانون ≈ شعاع ÷ ۲
   هرچه غشا گودتر شود، شعاع کمتر و کانون نزدیک‌تر می‌شود؛ آزمایش خودش
   همین را نشان می‌دهد، بی‌آنکه جایی نوشته شود. (آینه کمی کج است تا
   مقوّا جلوی نورِ خورشید را نگیرد؛ برای همین کانونِ اندازه‌گیری‌شده
   به‌اندازهٔ کسینوسِ همان کجی کمی نزدیک‌تر می‌افتد — این هم واقعی است.)

   آینهٔ برآمده کانونِ واقعی ندارد: پرتوها پخش می‌شوند و لکّه هرچه
   دورتر بروی فقط بزرگ‌تر می‌شود.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  bg:    '#131a24', bgLo: '#0c1119', bgHi: '#1e2a38',
  wood:  '#8a6a45', woodDk: '#4f3a24',
  tube:  '#c9a077', tubeDk: '#8d6b48',
  foil:  '#dfe8f2', foilDk: '#8d9bb0', foilLo: '#5b697d',
  band:  '#6ac0a8', bandDk: '#3d8571',
  card:  '#fbf7ea', scorch: '#6b4526',
  paper: '#fbf7ea', white: '#ffffff',
  ink:   '#1c2530', inkSoft: '#78868f',
  good:  '#4e9f6c', bad: '#c04a34', gold: '#e0a63f', accent: '#4c9ec4',
  sun:   '#ffd27a', ray: '#ffcf7d',
};

/* ───────── قانونِ غشا ───────── */

const APER = 40;               /* شعاعِ دهانهٔ لوله، میلی‌متر */
const LIT = 14;                /* نیمهٔ روشن‌شده (دهانهٔ نور)، میلی‌متر */
const S_MAX = 14;
const PXMM = 1.6;              /* پیکسل بر میلی‌متر */
const NRAY = 13;

const radiusOf = (s) => (APER * APER + s * s) / (2 * Math.abs(s));
const focalOf = (s) => (Math.abs(s) < .5 ? Infinity : radiusOf(s) / 2 * (s > 0 ? 1 : -1));

/* ───────── هندسهٔ نیمکت ───────── */

const V = { x: 980, y: 320 };          /* رأسِ آینه */
const SUN_A = 20 * Math.PI / 180;      /* راستای تابشِ خورشید */
const TILT = 18 * Math.PI / 180;       /* کجیِ آینه */
const FACE = SUN_A + Math.PI - TILT;   /* راستای رویهٔ آینه */
const D0 = { x: Math.cos(SUN_A), y: Math.sin(SUN_A) };
const FV = { x: Math.cos(FACE), y: Math.sin(FACE) };
const DR = (() => {                    /* راستای پرتوِ مرکزیِ بازتاب‌شده */
  const k = 2 * (D0.x * FV.x + D0.y * FV.y);
  return { x: D0.x - k * FV.x, y: D0.y - k * FV.y };
})();

const T_MIN = 20, T_MAX = 260;         /* فاصلهٔ مقوّا، میلی‌متر */
const cardPos = (t) => ({ x: V.x + DR.x * t * PXMM, y: V.y + DR.y * t * PXMM });

/* ───────── دفترچه ───────── */

const BANDS = [
  { n: 'گودیِ کم',    lo: 2,   hi: 4.5 },
  { n: 'گودیِ میانه', lo: 4.5, hi: 8.5 },
  { n: 'گودیِ زیاد',  lo: 8.5, hi: 14.1 },
];

const S = {
  phase: 'intro', phaseT: 0,
  s: 3, t: 120,
  rec: [null, null, null],
  noFocus: 0,
  burn: 0, smokeT: 0,
  drag: null,
  tt: 0, hover: null, tip: '', tipT: 0, shake: 0,
  cache: null,
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
function tip(msg) { S.tip = msg; S.tipT = 3.6; }
const allDone = () => S.rec.every((r) => r !== null) && S.noFocus;

/* ───────── ردِّ پرتوها ───────── */

function rays() {
  if (S.cache && S.cache.s === S.s) return S.cache;
  const out = [];
  const sgn = S.s > 0 ? 1 : -1;
  const R = radiusOf(S.s) * PXMM;
  const C = { x: V.x + FV.x * R * sgn, y: V.y + FV.y * R * sgn };
  const aC = Math.atan2(V.y - C.y, V.x - C.x);
  const th = Math.asin(Math.min(.999, APER * PXMM / R));
  const px = -D0.y, py = D0.x;
  for (let i = 0; i < NRAY; i++) {
    const off = (i / (NRAY - 1) * 2 - 1) * LIT * PXMM;
    const o = { x: V.x + px * off - D0.x * 400, y: V.y + py * off - D0.y * 400 };
    const mx = o.x - C.x, my = o.y - C.y;
    const b = 2 * (D0.x * mx + D0.y * my);
    const c = mx * mx + my * my - R * R;
    const disc = b * b - 4 * c;
    if (disc < 0) continue;
    const sq = Math.sqrt(disc);
    let hit = null;
    for (const tt of [(-b - sq) / 2, (-b + sq) / 2]) {
      if (tt <= .01) continue;
      const hx = o.x + D0.x * tt, hy = o.y + D0.y * tt;
      let a = Math.atan2(hy - C.y, hx - C.x) - aC;
      while (a > Math.PI) a -= TAU;
      while (a < -Math.PI) a += TAU;
      if (Math.abs(a) > th) continue;
      const nx = (hx - C.x) / R * -sgn, ny = (hy - C.y) / R * -sgn;
      if (D0.x * nx + D0.y * ny > 0) continue;
      hit = { hx, hy, nx, ny };
      break;
    }
    if (!hit) continue;
    const k = 2 * (D0.x * hit.nx + D0.y * hit.ny);
    out.push({ x: hit.hx, y: hit.hy, dx: D0.x - k * hit.nx, dy: D0.y - k * hit.ny, ox: o.x, oy: o.y });
  }
  let best = { t: T_MIN, w: 1e9 };
  for (let t = T_MIN; t <= T_MAX; t += .5) {
    const w = spread(out, t);
    if (w < best.w) best = { t, w };
  }
  S.cache = { s: S.s, list: out, best, R: radiusOf(S.s) };
  return S.cache;
}

/** پهنای لکّهٔ نور روی مقوّا در فاصلهٔ t، بر حسبِ میلی‌متر. */
function spread(list, t) {
  const c = cardPos(t);
  const ux = -DR.y, uy = DR.x;
  let lo = 1e9, hi = -1e9, n = 0;
  for (const r of list) {
    const den = r.dx * DR.x + r.dy * DR.y;
    if (Math.abs(den) < 1e-9) continue;
    const k = ((c.x - r.x) * DR.x + (c.y - r.y) * DR.y) / den;
    if (k <= 0) continue;
    const qx = r.x + r.dx * k, qy = r.y + r.dy * k;
    const u = (qx - c.x) * ux + (qy - c.y) * uy;
    if (u < lo) lo = u;
    if (u > hi) hi = u;
    n++;
  }
  if (n < 2) return 1e9;
  return (hi - lo) / PXMM;
}

const curSpread = () => spread(rays().list, S.t);
/** آیا مقوّا روی کانون است؟ ملاک، خودِ اندازهٔ لکّه است. */
function atFocus() {
  if (S.s <= 0) return false;
  const r = rays();
  return curSpread() <= Math.max(r.best.w * 2.5, r.best.w + 6);
}

/* ───────── کارها ───────── */

const bandOf = (s) => BANDS.findIndex((b) => s >= b.lo && s < b.hi);

function recordFocus() {
  if (S.s <= 0) { tip('اینجا لکّهٔ نور هیچ‌جا کوچک نشد.'); S.shake = .12; sfx.nope(); return; }
  const bi = bandOf(S.s);
  if (bi < 0) { tip('غشا را کمی گودتر کن.'); S.shake = .1; sfx.nope(); return; }
  if (!atFocus()) { tip('لکّه هنوز کوچک‌ترین حالتش نیست.'); S.shake = .12; sfx.nope(); return; }
  const fresh = S.rec[bi] === null;
  S.rec[bi] = S.t;
  sfx.good();
  if (fresh) {
    const c = cardPos(S.t);
    bits.confetti(c.x, c.y, 20, [P.gold, P.white, P.good]);
    toast.say(BANDS[bi].n + ' ثبت شد', 'good');
  }
  if (allDone()) { S.phase = 'won'; S.phaseT = 0; sfx.win(); }
}

function recordNoFocus() {
  if (S.s > -1.5) { tip('این آینه هنوز برآمده نشده.'); S.shake = .1; sfx.nope(); return; }
  if (S.noFocus) { tip('این را یک بار ثبت کرده‌ای.'); return; }
  S.noFocus = 1;
  sfx.good();
  toast.say('ثبت شد', 'good');
  if (allDone()) { S.phase = 'won'; S.phaseT = 0; sfx.win(); }
}

/* ───────── جای‌ها ───────── */

const PAN = { x: 24, y: 96, w: 296, h: 640 };
const BEN = { x: 336, y: 96, w: 840, h: 640 };
const PUMP = { x: BEN.x + 60, y: BEN.y + 500, w: 380, h: 36 };
const SLIDE = { x: BEN.x + 60, y: BEN.y + 572, w: 380, h: 36 };
const BOX_SPOT = { x: BEN.x + 540, y: BEN.y + 492, w: 220, h: 46 };
const BOX_DIST = { x: BEN.x + 540, y: BEN.y + 564, w: 220, h: 46 };
const BTN_REC = { x: PAN.x + 16, y: PAN.y + 430, w: PAN.w - 32, h: 56 };
const BTN_NO = { x: PAN.x + 16, y: PAN.y + 496, w: PAN.w - 32, h: 48 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };

const pumpX = () => PUMP.x + PUMP.w * (S.s / S_MAX + 1) / 2;
const slideX = () => SLIDE.x + SLIDE.w * (S.t - T_MIN) / (T_MAX - T_MIN);

/* ───────── ورودی ───────── */

function setPump(px) {
  const u = clamp((px - PUMP.x) / PUMP.w, 0, 1);
  let s = (u * 2 - 1) * S_MAX;
  if (Math.abs(s) < .5) s = 0;
  S.s = Math.round(s * 10) / 10;
  S.cache = null; S.burn = 0;
}
function setSlide(px) {
  const u = clamp((px - SLIDE.x) / SLIDE.w, 0, 1);
  S.t = Math.round(T_MIN + u * (T_MAX - T_MIN));
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.drag === 'pump') { setPump(p.x); return; }
  if (S.drag === 'slide') { setSlide(p.x); return; }
  if (S.drag === 'card') {
    const t = ((p.x - V.x) * DR.x + (p.y - V.y) * DR.y) / PXMM;
    S.t = clamp(Math.round(t), T_MIN, T_MAX);
    return;
  }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    if (inRect(p, BTN_REC)) S.hover = { k: 'rec' };
    if (inRect(p, BTN_NO)) S.hover = { k: 'no' };
    if (Math.abs(p.x - pumpX()) < 28 && Math.abs(p.y - (PUMP.y + PUMP.h / 2)) < 32) S.hover = { k: 'pump' };
    if (Math.abs(p.x - slideX()) < 28 && Math.abs(p.y - (SLIDE.y + SLIDE.h / 2)) < 32) S.hover = { k: 'slide' };
    const c = cardPos(S.t);
    if (Math.hypot(p.x - c.x, p.y - c.y) < 74) S.hover = { k: 'card' };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  const cap = () => { try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ } };
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { S.phase = 'lab'; S.phaseT = 0; sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) {
      S.phase = 'intro'; S.phaseT = 0;
      S.rec = [null, null, null]; S.noFocus = 0; S.s = 3; S.t = 120; S.cache = null;
      sfx.tap();
    }
    return;
  }
  if (inRect(p, BTN_REC)) { recordFocus(); return; }
  if (inRect(p, BTN_NO)) { recordNoFocus(); return; }
  if (inRect(p, PUMP) || (Math.abs(p.x - pumpX()) < 28 && Math.abs(p.y - (PUMP.y + PUMP.h / 2)) < 34)) {
    S.drag = 'pump'; setPump(p.x); cap(); sfx.tap(); return;
  }
  if (inRect(p, SLIDE) || (Math.abs(p.x - slideX()) < 28 && Math.abs(p.y - (SLIDE.y + SLIDE.h / 2)) < 34)) {
    S.drag = 'slide'; setSlide(p.x); cap(); sfx.tap(); return;
  }
  const c = cardPos(S.t);
  if (Math.hypot(p.x - c.x, p.y - c.y) < 74) { S.drag = 'card'; cap(); sfx.tap(); return; }
});

function release() { S.drag = null; }
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

/* ───────── حلقه ───────── */

function step(dt) {
  S.tt += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.phase === 'lab' && atFocus()) {
    S.burn = clamp(S.burn + dt * .5, 0, 1);
    if (S.burn > .25) S.smokeT += dt;
    if (S.smokeT > .18) {
      S.smokeT = 0;
      const c = cardPos(S.t);
      bits.add(c.x, c.y, 1, 'dot', ['rgba(212,212,206,.8)', 'rgba(182,182,176,.7)'],
        { speed: 20, lift: 40, size: 5, life: 1.4, grav: -30, drag: .96 });
    }
  } else S.burn = Math.max(0, S.burn - dt * .35);
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

const faNum = (v, d) => fa(v.toFixed(d)).replace('.', '٫');

function line2(x0, y0, x1, y1, col, w, dash) {
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.restore();
}

function slider(b, hx, label, lo, hi) {
  ctx.fillStyle = 'rgba(255,255,255,.09)';
  ctx.beginPath(); rrPath(b.x, b.y + 10, b.w, 16, 8); ctx.fill();
  text(lo, b.x - 10, b.y + 18, { size: 14, color: 'rgba(224,236,246,.55)', align: 'left' });
  text(hi, b.x + b.w + 10, b.y + 18, { size: 14, color: 'rgba(224,236,246,.55)', align: 'right' });
  text(label, b.x + b.w / 2, b.y - 14, { size: 15, color: 'rgba(224,236,246,.7)' });
  withShadow(12, 5, .5, () => {
    ctx.fillStyle = hx.hot ? P.gold : '#cbd6e4';
    wobbleRect(hx.x - 20, b.y - 6, 40, b.h + 12, 10, 7, 1.2); ctx.fill();
  }, '0,0,0');
  ctx.strokeStyle = 'rgba(30,40,55,.45)'; ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(hx.x + i * 6, b.y + 4); ctx.lineTo(hx.x + i * 6, b.y + b.h - 4);
    ctx.stroke();
  }
}

/* ───────── نیمکتِ آزمایش ───────── */

function drawMirror() {
  const sgn = S.s > 0 ? 1 : -1;
  const flat = Math.abs(S.s) < .5;
  /* لولهٔ پشتِ آینه — اوّل، تا رویهٔ آینه رویش بنشیند */
  ctx.save();
  ctx.translate(V.x, V.y);
  ctx.rotate(FACE);
  const ah = APER * PXMM;
  ctx.fillStyle = P.tubeDk;
  ctx.beginPath(); rrPath(-96, -ah - 6, 96, ah * 2 + 12, 10); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(-92, -ah - 2, 88, ah * 2 + 4, 8); ctx.clip();
  ctx.fillStyle = texWood(P.tube, '#8a6238');
  ctx.fillRect(-92, -ah - 2, 88, ah * 2 + 4);
  ctx.fillStyle = vgrad(-ah, ah, 'rgba(255,255,255,.14)', 'rgba(0,0,0,.42)');
  ctx.fillRect(-92, -ah - 2, 88, ah * 2 + 4);
  ctx.restore();
  ctx.strokeStyle = P.band; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-20, -ah - 4); ctx.lineTo(-20, ah + 4); ctx.stroke();
  ctx.strokeStyle = P.bandDk;
  ctx.beginPath(); ctx.moveTo(-40, -ah - 4); ctx.lineTo(-40, ah + 4); ctx.stroke();
  ctx.restore();
  /* رویهٔ آینه */
  ctx.save();
  ctx.lineCap = 'round';
  if (flat) {
    const ux = -FV.y, uy = FV.x;
    const a = { x: V.x - ux * ah, y: V.y - uy * ah };
    const b = { x: V.x + ux * ah, y: V.y + uy * ah };
    line2(a.x, a.y, b.x, b.y, P.foilLo, 14);
    line2(a.x, a.y, b.x, b.y, P.foil, 8);
  } else {
    const R = radiusOf(S.s) * PXMM;
    const C = { x: V.x + FV.x * R * sgn, y: V.y + FV.y * R * sgn };
    const aC = Math.atan2(V.y - C.y, V.x - C.x);
    const th = Math.asin(Math.min(.999, ah / R));
    const arc = (off, col, w) => {
      ctx.strokeStyle = col; ctx.lineWidth = w;
      ctx.beginPath(); ctx.arc(C.x, C.y, R + sgn * off, aC - th, aC + th); ctx.stroke();
    };
    arc(6, P.foilLo, 15);
    arc(0, P.foil, 9);
    arc(-3.4, 'rgba(255,255,255,.7)', 2.4);
  }
  ctx.restore();
}

function drawSun() {
  const c = { x: V.x - D0.x * 430, y: V.y - D0.y * 430 };
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, 130);
  g.addColorStop(0, 'rgba(255, 210, 122, .5)');
  g.addColorStop(1, 'rgba(255, 210, 122, 0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(c.x, c.y, 130, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = P.sun;
  wobbleCircle(c.x, c.y, 28, 3, 1.6); ctx.fill();
  ctx.strokeStyle = P.sun; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const a = i * TAU / 10 + S.tt * .12;
    ctx.beginPath();
    ctx.moveTo(c.x + Math.cos(a) * 36, c.y + Math.sin(a) * 36);
    ctx.lineTo(c.x + Math.cos(a) * 48, c.y + Math.sin(a) * 48);
    ctx.stroke();
  }
}

function drawRays() {
  const r = rays();
  const c = cardPos(S.t);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const [w, col] of [[9, 'rgba(255, 190, 96, .06)'], [1.6, 'rgba(255, 246, 224, .36)']]) {
    ctx.lineWidth = w; ctx.strokeStyle = col;
    ctx.beginPath();
    for (const ry of r.list) {
      ctx.moveTo(ry.ox, ry.oy); ctx.lineTo(ry.x, ry.y);
      const den = ry.dx * DR.x + ry.dy * DR.y;
      let k = 460;
      if (Math.abs(den) > 1e-9) {
        const kk = ((c.x - ry.x) * DR.x + (c.y - ry.y) * DR.y) / den;
        if (kk > 0) k = kk;
      }
      ctx.lineTo(ry.x + ry.dx * k, ry.y + ry.dy * k);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawCard() {
  const c = cardPos(S.t);
  const ux = -DR.y, uy = DR.x;
  const half = 78;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(Math.atan2(uy, ux));
  withShadow(16, 6, .5, () => {
    ctx.fillStyle = P.card;
    ctx.beginPath(); rrPath(-half, -9, half * 2, 18, 6); ctx.fill();
  }, '0,0,0');
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(-9, 9, 18, 58, 5); ctx.fill();
  const w = Math.min(curSpread() * PXMM, half * 2);
  const bright = clamp(26 / Math.max(2, w), 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(-w / 2 - 8, 0, w / 2 + 8, 0);
  g.addColorStop(0, 'rgba(255,214,140,0)');
  g.addColorStop(.5, `rgba(255, 246, 214, ${.5 + .5 * bright})`);
  g.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-w / 2 - 8, -9, w + 16, 18);
  const gg = ctx.createRadialGradient(0, 0, 2, 0, 0, 66 * (.4 + bright));
  gg.addColorStop(0, `rgba(255, 230, 170, ${.55 * bright})`);
  gg.addColorStop(1, 'rgba(255, 230, 170, 0)');
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(0, 0, 66 * (.4 + bright), 0, TAU); ctx.fill();
  ctx.restore();
  if (S.burn > .04) {
    ctx.fillStyle = `rgba(107, 69, 38, ${clamp(S.burn, 0, .9)})`;
    wobbleEllipse(0, 0, Math.max(3, w / 2 + 2), 7, 0, 9, 1.4); ctx.fill();
  }
  ctx.restore();
}

function drawScale() {
  const ux = DR.y, uy = -DR.x;          /* سمتِ پایینِ مسیر */
  const off = 96;
  const a = cardPos(T_MIN), b = cardPos(T_MAX);
  line2(a.x + ux * off, a.y + uy * off, b.x + ux * off, b.y + uy * off, 'rgba(224,236,246,.3)', 2);
  for (let t = T_MIN; t <= T_MAX; t += 10) {
    const q = cardPos(t);
    const big = t % 50 === 0;
    line2(q.x + ux * off, q.y + uy * off,
      q.x + ux * (off + (big ? 12 : 6)), q.y + uy * (off + (big ? 12 : 6)),
      'rgba(224,236,246,.3)', big ? 2 : 1.3);
    if (big) numText(fa(t / 10), q.x + ux * (off + 26), q.y + uy * (off + 26),
      { size: 12, color: 'rgba(224,236,246,.55)' });
  }
  const c = cardPos(S.t);
  ctx.fillStyle = 'rgba(224,166,63,.9)';
  ctx.beginPath(); ctx.arc(c.x + ux * off, c.y + uy * off, 6, 0, TAU); ctx.fill();
  line2(c.x, c.y, c.x + ux * off, c.y + uy * off, 'rgba(224,166,63,.35)', 1.6, [5, 6]);
}

function drawBench() {
  ctx.fillStyle = '#101821';
  ctx.beginPath(); rrPath(BEN.x, BEN.y, BEN.w, BEN.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(76,158,196,.2)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(BEN.x, BEN.y, BEN.w, BEN.h, 16); ctx.stroke();
  ctx.save();
  ctx.beginPath(); rrPath(BEN.x, BEN.y, BEN.w, 380, 16); ctx.clip();
  drawSun();
  drawRays();
  drawScale();
  drawMirror();
  drawCard();
  bits.draw();
  ctx.restore();

  text('مقوّا را بکش تا کوچک‌ترین لکّه پیدا شود', BEN.x + BEN.w / 2, BEN.y + 466,
    { size: 16, color: 'rgba(224,236,246,.6)' });
  slider(PUMP, { x: pumpX(), hot: S.hover && S.hover.k === 'pump' }, 'غشا', 'بیرون', 'گود');
  slider(SLIDE, { x: slideX(), hot: S.hover && S.hover.k === 'slide' }, 'جای مقوّا', 'نزدیک', 'دور');

  const box = (b, label, val, unit, col) => {
    ctx.fillStyle = 'rgba(251,247,234,.94)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.fill();
    text(label, b.x + b.w - 14, b.y + b.h / 2, { size: 14, color: P.inkSoft, align: 'right' });
    numText(val, b.x + 74, b.y + b.h / 2, { size: 20, color: col || P.ink });
    text(unit, b.x + 14, b.y + b.h / 2, { size: 11, color: P.inkSoft, align: 'left' });
  };
  const sp = curSpread();
  box(BOX_SPOT, 'پهنای لکّه', sp > 90 ? fa(90) + '+' : faNum(sp, 1), 'میلی‌متر',
    atFocus() ? P.good : P.ink);
  box(BOX_DIST, 'فاصلهٔ مقوّا', fa(Math.round(S.t / 10)), 'سانتی‌متر');
}

/* ───────── دفترچه ───────── */

function drawPanel() {
  paper(PAN.x, PAN.y, PAN.w, PAN.h, P.paper, 31, 16, .4);
  ctx.fillStyle = P.accent;
  ctx.beginPath(); rrPath(PAN.x, PAN.y, PAN.w, 10, 5); ctx.fill();
  text('دفترچه', PAN.x + PAN.w / 2, PAN.y + 44, { size: 26, family: 'Lalezar', color: P.ink });
  text('کانونِ آینه را اندازه بگیر', PAN.x + PAN.w / 2, PAN.y + 76, { size: 15, color: P.inkSoft });

  for (let i = 0; i < BANDS.length; i++) {
    const y = PAN.y + 106 + i * 76;
    const on = S.rec[i] !== null;
    const here = bandOf(S.s) === i;
    ctx.fillStyle = on ? '#eef6f0' : (here ? '#f6f0e0' : '#f0f0e8');
    ctx.beginPath(); rrPath(PAN.x + 16, y, PAN.w - 32, 62, 12); ctx.fill();
    ctx.strokeStyle = on ? P.good : (here ? P.gold : '#d8d8cd'); ctx.lineWidth = (on || here) ? 3 : 2;
    ctx.beginPath(); rrPath(PAN.x + 16, y, PAN.w - 32, 62, 12); ctx.stroke();
    text(BANDS[i].n, PAN.x + PAN.w - 30, y + 22, { size: 16, color: P.ink, align: 'right' });
    if (on) {
      numText(fa(Math.round(S.rec[i] / 10)), PAN.x + 88, y + 42, { size: 20, color: P.good });
      text('سانتی‌متر', PAN.x + 108, y + 42, { size: 13, color: P.inkSoft, align: 'left' });
    } else {
      text('—', PAN.x + PAN.w / 2, y + 44, { size: 18, color: '#c3c3b6' });
    }
    ctx.save();
    ctx.translate(PAN.x + 44, y + 22);
    ctx.strokeStyle = on ? P.good : '#a9a99c'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    const dep = [4, 9, 16][i];
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.quadraticCurveTo(dep, 0, 0, 13); ctx.stroke();
    ctx.restore();
  }

  const yb = PAN.y + 106 + 3 * 76;
  ctx.fillStyle = S.noFocus ? '#eef6f0' : '#f0f0e8';
  ctx.beginPath(); rrPath(PAN.x + 16, yb, PAN.w - 32, 52, 12); ctx.fill();
  ctx.strokeStyle = S.noFocus ? P.good : '#d8d8cd'; ctx.lineWidth = S.noFocus ? 3 : 2;
  ctx.beginPath(); rrPath(PAN.x + 16, yb, PAN.w - 32, 52, 12); ctx.stroke();
  text('غشای بیرون‌زده', PAN.x + PAN.w - 30, yb + 26, { size: 16, color: P.ink, align: 'right' });
  ctx.save();
  ctx.translate(PAN.x + 44, yb + 26);
  ctx.strokeStyle = S.noFocus ? P.good : '#a9a99c'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -13); ctx.quadraticCurveTo(-11, 0, 0, 13); ctx.stroke();
  ctx.restore();
  if (S.noFocus) {
    ctx.fillStyle = P.good;
    ctx.beginPath(); ctx.arc(PAN.x + 94, yb + 26, 11, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(PAN.x + 89, yb + 26); ctx.lineTo(PAN.x + 93, yb + 31); ctx.lineTo(PAN.x + 100, yb + 21);
    ctx.stroke();
  }

  button(BTN_REC, 'اینجا کانون است', {
    hot: S.hover && S.hover.k === 'rec', fill: '#2f7f96', hotFill: '#4fa3b8', size: 21 });
  button(BTN_NO, 'کانون ندارد', {
    hot: S.hover && S.hover.k === 'no', fill: '#5f6b78', hotFill: '#78838f', size: 19 });
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#0a1017';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224,166,63,.22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text('کانونِ آینه', SCENE_W - 130, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  const n = S.rec.filter((r) => r !== null).length + S.noFocus;
  numText(fa(n) + ' / ' + fa(4), 300, HUD_H / 2, { size: 20, color: P.gold });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * (n / 4), 5, 3); ctx.fill();
}

function sunIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.sun;
  wobbleCircle(0, 0, 20, 3, 1.4); ctx.fill();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 3.6; ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = i * TAU / 8;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 27, Math.sin(a) * 27);
    ctx.lineTo(Math.cos(a) * 37, Math.sin(a) * 37);
    ctx.stroke();
  }
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 880, h: 310, y: 130,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: P.inkSoft,
    icon: sunIcon,
    title: 'کانون کجاست؟',
    body: 'آینهٔ ساخته‌شده را زیر آفتاب می‌گیریم. نور برمی‌گردد و روی مقوّا\nلکّه‌ای می‌سازد. مقوّا را جلو و عقب ببر تا کوچک‌ترین لکّه پیدا شود.\nسه گودیِ مختلف را اندازه بگیر و در دفترچه ثبت کن.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function drawWon() {
  const a = S.rec.map((r) => fa(Math.round(r / 10)));
  overlay({
    t: S.phaseT, w: 840, h: 300, y: 140,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    icon: sunIcon,
    title: 'کانون را پیدا کردی',
    body: 'اندازه‌هایت: ' + a[0] + ' و ' + a[1] + ' و ' + a[2] + ' سانتی‌متر.\n'
        + 'هرچه غشا را گودتر کردی، نور نزدیک‌ترِ آینه جمع شد.\n'
        + 'و آینهٔ بیرون‌زده هیچ‌جا نور را جمع نکرد.',
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
    ctx.translate(Math.sin(S.tt * 55) * k, 0);
  }
  drawBench();
  drawPanel();
  ctx.restore();
  drawHUD();
  toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.white, ink: P.ink });
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

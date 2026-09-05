/*!
title: آزمایشگاهِ حجم — اندازه‌گیری مواد (آزمایش)
bg: #14242c
*/

/* ═══════════════════════════════════════════════════════════════════════
   آزمایشگاهِ حجم — علومِ سوم، درس ۳ «اندازه‌گیری مواد»  (آزمایش)

   کتاب سه چیز می‌خواهد و این آزمایشگاه هر سه را مرحله‌به‌مرحله انجام
   می‌دهد:

   ۱) «مواد جا می‌گیرند. به مقدارِ جایی که هر مادّه می‌گیرد، حجمِ آن
      می‌گویند.» — و آزمایشِ یونولیت و خمیرِ بازی: دو چیز با جرمِ برابر
      می‌توانند حجمِ کاملاً متفاوت داشته باشند.
   ۲) «علی با استکان اندازه گرفت، رضا با لیوان» — با دو پیمانهٔ متفاوت
      نمی‌شود مقایسه کرد. اینجا خودت هر دو را می‌ریزی و عددها را
      کنارِ هم می‌بینی.
   ۳) یکای مشترک: لیتر و میلی‌لیتر؛ هر لیتر ۱۰۰۰ میلی‌لیتر.

   و یک چیزِ چهارم که کتاب راهش را باز می‌کند («چطور مطمئن شویم؟»):
   اندازه‌گیریِ حجمِ یک جسمِ جامد با بالا آمدنِ آب. این قانونِ واقعیِ
   جابه‌جاییِ آب است: جسمی که کاملاً زیرِ آب برود، آب را دقیقاً به
   اندازهٔ حجمِ خودش بالا می‌آورد. در بازی هم دقیقاً همین حساب می‌شود.

   ▸ چگالی هر جسم واقعی است (گرم بر سانتی‌متر مکعب)، پس جرم و حجم با
     هم جور درمی‌آیند: یونولیت سبک و پرحجم، آهن سنگین و کم‌حجم.
   ▸ جسمی که چگالی‌اش از آب کمتر است روی آب می‌ماند و کاملاً فرو
     نمی‌رود؛ آن‌وقت آبِ جابه‌جاشده حجمِ خودِ جسم نیست. آزمایشگاه این را
     می‌پذیرد و می‌گذارد بچّه با نگه‌داشتنِ جسم زیرِ آب درستش کند —
     همان کاری که در آزمایشگاهِ واقعی می‌کنند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  bench:  '#22333c', benchLo: '#14242c', benchHi: '#314854',
  steel:  '#8d99a3', steelDk: '#54606a', steelLt: '#c3ced6',
  water:  '#4f9fc4', waterDk: '#2c6f92', waterLt: '#8fd0e6',
  glass:  'rgba(206, 232, 239, .42)',
  paper:  '#fbfaf2', card: '#ffffff',
  ink:    '#22302e', inkSoft: '#78867f',
  good:   '#4e8f5c', bad: '#c04a34', gold: '#c9962c', accent: '#4fa3b8',
};

/* ───────── جسم‌ها ─────────
   d = چگالی به گرم بر سانتی‌متر مکعب (عددهای واقعی).
   v = حجم به سانتی‌متر مکعب (میلی‌لیتر). جرم = d × v.               */

const SOLIDS = [
  { id: 'yunolit', n: 'یونولیت',    d: 0.03, v: 200, c: '#cfd8c6', c2: '#8b9784' },
  { id: 'khamir',  n: 'خمیرِ بازی', d: 1.30, v: 40,  c: '#d95f7a', c2: '#a83a52' },
  { id: 'chub',    n: 'تکّه‌چوب',   d: 0.65, v: 120, c: '#b9884f', c2: '#7d5528' },
  { id: 'sang',    n: 'سنگ',        d: 2.60, v: 60,  c: '#8d99a3', c2: '#5c6870' },
  { id: 'ahan',    n: 'مهرهٔ آهنی', d: 7.80, v: 20,  c: '#7b8590', c2: '#464f58' },
  { id: 'lastik',  n: 'توپِ لاستیکی', d: 1.10, v: 90, c: '#3f7d8c', c2: '#255563' },
  { id: 'shishe',  n: 'گویِ شیشه‌ای', d: 2.50, v: 30, c: '#a8d8e8', c2: '#6ea8bc' },
  { id: 'moom',    n: 'شمع',        d: 0.90, v: 80,  c: '#f0e2b8', c2: '#c8b381' },
];

/* پیمانه‌های دلخواه و پیمانهٔ استاندارد */
const CUPS = [
  { id: 'estekan', n: 'استکان', ml: 60,  c: '#c98a5e' },
  { id: 'livan',   n: 'لیوان',  ml: 200, c: '#5f8aa8' },
];

const STEPS = [
  { n: 'جا گرفتن', t: 'دو جسمِ هم‌جرم را ببین: حجمشان یکی نیست.' },
  { n: 'پیمانه',   t: 'همان آب را یک‌بار با استکان و یک‌بار با لیوان خالی کن.' },
  { n: 'میلی‌لیتر', t: 'حالا با پیمانهٔ مدرّج بخوان: عددِ مشترک.' },
  { n: 'جابه‌جایی', t: 'جسم را در آب بینداز؛ آب به اندازهٔ حجمِ آن بالا می‌آید.' },
];

const S = {
  stepI: 0,
  /* مرحلهٔ ۱ */
  pairA: 0, pairB: 1,
  /* مرحلهٔ ۲ — همان آب را یک‌بار با استکان و یک‌بار با لیوان خالی می‌کنیم */
  jugML: 600,
  active: -1,            /* الان با کدام پیمانه کار می‌کنیم */
  count: [0, 0],         /* شمارِ پیمانه‌های ریخته‌شده در دورِ جاری */
  result: [-1, -1],      /* نتیجهٔ هر پیمانه، وقتی ظرف کاملاً خالی شد */
  /* مرحلهٔ ۴ */
  solid: -1, dunk: 0, held: false, splash: 0,
  book: [],              /* جسم‌هایی که حجمشان خوانده شد */
  t: 0, hover: null, tip: '', tipT: 0, flash: 0, shake: 0,
};

const bits = new Bits();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const massOf = (s) => s.d * s.v;
/** جسمی که سبک‌تر از آب است روی آب می‌ماند. */
const floats = (s) => s.d < 1;
/** چه کسری از جسم زیرِ آب است: شناور تا حدِّ چگالی، مگر نگهش داری. */
function submerged(s, held) {
  if (held || !floats(s)) return 1;
  return clamp(s.d / 1, 0, 1);
}
/** آبِ جابه‌جاشده به میلی‌لیتر. */
const displaced = (s, held) => s.v * submerged(s, held);

/* ───────── جای‌ها ───────── */

const PANEL_A = { x: 24, y: 96, w: 348, h: 640 };
const PANEL_B = { x: 392, y: 96, w: 384, h: 640 };
const PANEL_C = { x: 796, y: 96, w: 380, h: 640 };

const BTN_PAIR = { x: PANEL_A.x + 24, y: PANEL_A.y + 570, w: PANEL_A.w - 48, h: 50 };
function cupBtn(i) { return { x: PANEL_B.x + 26 + i * 170, y: PANEL_B.y + 470, w: 156, h: 54 }; }
const BTN_REFILL = { x: PANEL_B.x + 26, y: PANEL_B.y + 536, w: PANEL_B.w - 52, h: 46 };
function solidBtn(i) {
  const col = i % 2, row = Math.floor(i / 2);
  return { x: PANEL_C.x + 20 + col * 172, y: PANEL_C.y + 44 + row * 52, w: 164, h: 46 };
}
const BTN_DUNK = { x: PANEL_C.x + 20, y: PANEL_C.y + 500, w: 164, h: 54 };
const BTN_HOLD = { x: PANEL_C.x + 196, y: PANEL_C.y + 500, w: 164, h: 54 };
const CYL = { x: PANEL_C.x + 250, y: PANEL_C.y + 268, w: 96, h: 200 };
const CYL_MAX = 500;   /* میلی‌لیترِ پیمانهٔ مدرّج */
const CYL_BASE = 200;  /* آبِ اوّلیه */

/* ───────── کارها ───────── */

function tip(msg) { S.tip = msg; S.tipT = 3.6; }

function newPair() {
  /* دو جسم با جرمِ نزدیک ولی حجمِ خیلی متفاوت — همان درسِ یونولیت و خمیر */
  for (let i = 0; i < 300; i++) {
    const a = R(0, SOLIDS.length - 1), b = R(0, SOLIDS.length - 1);
    if (a === b) continue;
    const ma = massOf(SOLIDS[a]), mb = massOf(SOLIDS[b]);
    if (Math.abs(ma - mb) / Math.max(ma, mb) > .3) continue;    /* جرم‌ها نزدیک */
    if (Math.max(SOLIDS[a].v, SOLIDS[b].v) < Math.min(SOLIDS[a].v, SOLIDS[b].v) * 1.8) continue;
    S.pairA = SOLIDS[a].v > SOLIDS[b].v ? a : b;
    S.pairB = SOLIDS[a].v > SOLIDS[b].v ? b : a;
    S.stepI = Math.max(S.stepI, 0);
    sfx.tap();
    return;
  }
  S.pairA = 0; S.pairB = 1;
}

const JUG_ML = 600;

/** یک پیمانه از ظرف برمی‌داریم. کارِ اصلی این است که *همان* آب یک‌بار
    با استکان و یک‌بار با لیوان خالی شود، تا دو عددِ متفاوت برای یک
    مقدارِ ثابت به دست بیاید — دقیقاً پرسشِ علی و رضا در کتاب. */
function pourCup(i) {
  const c = CUPS[i];
  if (S.result[i] >= 0) { tip('این پیمانه را قبلاً شمرده‌ای.'); return; }
  if (S.active >= 0 && S.active !== i) {
    tip('اوّل ظرف را پر کن، بعد با پیمانهٔ دیگر.'); S.flash = 1; sfx.nope(); return;
  }
  if (S.jugML <= 0) { tip('ظرف خالی است؛ پرش کن.'); S.flash = 1; sfx.nope(); return; }
  S.active = i;
  S.jugML = Math.max(0, S.jugML - c.ml);
  S.count[i]++;
  S.stepI = Math.max(S.stepI, 1);
  sfx.pop();
  if (S.jugML <= 0) {
    S.result[i] = S.count[i];
    S.active = -1;
    sfx.good();
    if (S.result[0] >= 0 && S.result[1] >= 0) S.stepI = Math.max(S.stepI, 2);
  }
}

function refill() { S.jugML = JUG_ML; S.active = -1; S.count = [0, 0]; sfx.tap(); }

function chooseSolid(i) {
  S.solid = i; S.dunk = 0; S.held = false;
  S.stepI = Math.max(S.stepI, 3);
  sfx.tap();
}

function dunkIt(hold) {
  if (S.solid < 0) { tip('اوّل یک جسم بردار.'); S.flash = 1; sfx.nope(); return; }
  S.held = hold;
  S.dunk = .0001;
  S.splash = 1;
  sfx.slide();
  const s = SOLIDS[S.solid];
  if (floats(s) && !hold) {
    tip('سبک‌تر از آب است و بالا می‌ماند؛ کاملاً فرو نرفته.');
  } else {
    if (S.book.indexOf(S.solid) < 0) S.book.push(S.solid);
    bits.spark(CYL.x + CYL.w / 2, CYL.y + 20, 12, [P.waterLt, '#fff']);
  }
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.flash > 0) S.flash -= dt;
  if (S.splash > 0) S.splash -= dt * 1.6;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.dunk > 0 && S.dunk < 1) S.dunk = Math.min(1, S.dunk + dt * 1.6);
  bits.step(dt);
  draw();
}

whenFontsReady(() => { newPair(); runLoop(step); });

/* ───────── ورودی ───────── */

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  if (inRect(p, BTN_PAIR)) S.hover = { k: 'pair' };
  for (let i = 0; i < CUPS.length; i++) if (inRect(p, cupBtn(i))) S.hover = { k: 'cup', i };
  if (inRect(p, BTN_REFILL)) S.hover = { k: 'refill' };
  for (let i = 0; i < SOLIDS.length; i++) if (inRect(p, solidBtn(i))) S.hover = { k: 'solid', i };
  if (inRect(p, BTN_DUNK)) S.hover = { k: 'dunk' };
  if (inRect(p, BTN_HOLD)) S.hover = { k: 'hold' };
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (inRect(p, BTN_PAIR)) { newPair(); return; }
  for (let i = 0; i < CUPS.length; i++) if (inRect(p, cupBtn(i))) { pourCup(i); return; }
  if (inRect(p, BTN_REFILL)) { refill(); return; }
  for (let i = 0; i < SOLIDS.length; i++) if (inRect(p, solidBtn(i))) { chooseSolid(i); return; }
  if (inRect(p, BTN_DUNK)) { dunkIt(false); return; }
  if (inRect(p, BTN_HOLD)) { dunkIt(true); return; }
});

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

function faNum(v, d) {
  const s = d === 0 ? String(Math.round(v)) : v.toFixed(d).replace(/\.?0+$/, '');
  return fa(s).replace('.', '٫');
}

/** جسم‌ها را با اندازهٔ واقعیِ حجمشان می‌کشیم — ریشهٔ سوم، چون سه‌بعدی‌اند. */
function solidIcon(s, k) {
  const side = Math.cbrt(s.v) * k;
  ctx.fillStyle = s.c2;
  ctx.beginPath(); rrPath(-side / 2 + 3, -side / 2 + 3, side, side, side * .18); ctx.fill();
  ctx.fillStyle = s.c;
  ctx.beginPath(); rrPath(-side / 2, -side / 2, side, side, side * .18); ctx.fill();
  ctx.strokeStyle = 'rgba(34, 48, 46, .35)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); rrPath(-side / 2, -side / 2, side, side, side * .18); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.28)';
  ctx.beginPath(); rrPath(-side / 2 + side * .12, -side / 2 + side * .12, side * .34, side * .24, side * .08); ctx.fill();
  return side;
}

/* ───────── پرده‌ها ───────── */

function paintBenchStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.benchHi); g.addColorStop(1, P.benchLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 2;
  for (let x = 0; x < SCENE_W; x += 58) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SCENE_H); ctx.stroke(); }
  for (let y = 0; y < SCENE_H; y += 58) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke(); }
  for (const b of [PANEL_A, PANEL_B, PANEL_C]) {
    ctx.fillStyle = 'rgba(255, 253, 246, .95)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(16, 34, 42, .2)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 16); ctx.stroke();
  }
}

function drawSteps() {
  for (let i = 0; i < STEPS.length; i++) {
    const w = 168, x = SCENE_W - 24 - (i + 1) * (w + 8) + 8, y = 16, h = 44;
    const on = i === S.stepI, done = i < S.stepI;
    ctx.fillStyle = on ? P.accent : (done ? 'rgba(79, 163, 184, .28)' : 'rgba(255,255,255,.1)');
    ctx.beginPath(); rrPath(x, y, w, h, 12); ctx.fill();
    numText(fa(i + 1), x + w - 20, y + h / 2, { size: 15, color: on ? '#fff' : 'rgba(255,255,255,.6)' });
    text(STEPS[i].n, x + w / 2 + 6, y + h / 2,
      { size: 16, family: 'Lalezar', color: on ? '#fff' : 'rgba(255,255,255,.62)' });
  }
  ctx.save();
  ctx.beginPath(); ctx.rect(16, 12, 400, 52); ctx.clip();
  text(STEPS[S.stepI].t, 416, 39, { size: 16, color: 'rgba(255,255,255,.82)', align: 'right' });
  ctx.restore();
}

/* ── تخته ۱: جرمِ برابر، حجمِ نابرابر ── */
function drawPanelA() {
  const b = PANEL_A;
  text('جا گرفتن', b.x + b.w - 18, b.y + 28, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  const a = SOLIDS[S.pairA], c = SOLIDS[S.pairB];
  /* ترازوی کوچک — جرم‌ها تقریباً برابر */
  const cx = b.x + b.w / 2, cy = b.y + 96;
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - 118, cy); ctx.lineTo(cx + 118, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 34); ctx.stroke();
  ctx.fillStyle = P.steel;
  ctx.beginPath(); ctx.ellipse(cx, cy + 38, 34, 7, 0, 0, TAU); ctx.fill();
  for (const [sd, s] of [[-1, a], [1, c]]) {
    ctx.fillStyle = P.steelLt;
    ctx.beginPath(); ctx.ellipse(cx + sd * 92, cy + 6, 44, 8, 0, 0, TAU); ctx.fill();
    ctx.save();
    ctx.translate(cx + sd * 92, cy - 6 - Math.cbrt(s.v) * 2.6 / 2);
    solidIcon(s, 2.6);
    ctx.restore();
    text(s.n, cx + sd * 92, cy + 32, { size: 13, color: P.ink });
    numText(faNum(massOf(s), 0) + ' گرم', cx + sd * 92, cy + 52, { size: 14, color: P.inkSoft });
  }
  /* حجم — دو ستون */
  const gy = b.y + 210;
  text('جایی که می‌گیرند', cx, gy - 14, { size: 14, color: P.inkSoft });
  const maxV = Math.max(a.v, c.v);
  for (const [sd, s] of [[-1, a], [1, c]]) {
    const h = 250 * s.v / maxV;
    const x = cx + sd * 92 - 44;
    ctx.fillStyle = 'rgba(34,48,46,.06)';
    ctx.beginPath(); rrPath(x, gy, 88, 250, 8); ctx.fill();
    ctx.fillStyle = s.c;
    ctx.beginPath(); rrPath(x, gy + 250 - h, 88, h, 8); ctx.fill();
    /* دورِ پررنگ، وگرنه جسمِ روشن روی تختهٔ روشن گم می‌شود */
    ctx.strokeStyle = 'rgba(34, 48, 46, .45)'; ctx.lineWidth = 2.2;
    ctx.beginPath(); rrPath(x, gy + 250 - h, 88, h, 8); ctx.stroke();
    /* اگر ستون تا بالا پر است، عدد داخلش می‌نشیند تا روی سرنویس نیفتد */
    const high = h > 232;
    numText(fa(s.v) + ' میلی‌لیتر', cx + sd * 92, gy + 250 - h + (high ? 18 : -16),
      { size: 14, color: high ? '#3a4a44' : P.ink });
  }
  button(BTN_PAIR, 'دو جسمِ دیگر', { hot: S.hover && S.hover.k === 'pair', fill: '#3c7f8f', hotFill: '#4fa3b8', size: 20 });
}

/* ── تخته ۲: پیمانهٔ دلخواه در برابرِ میلی‌لیتر ── */
function drawPanelB() {
  const b = PANEL_B;
  text('پیمانه', b.x + b.w - 18, b.y + 28, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  /* ظرفِ آب */
  const jx = b.x + 34, jy = b.y + 62, jw = 116, jh = 190;
  ctx.fillStyle = P.glass;
  ctx.beginPath(); rrPath(jx, jy, jw, jh, 10); ctx.fill();
  const k = clamp(S.jugML / JUG_ML, 0, 1);
  ctx.save();
  ctx.beginPath(); rrPath(jx, jy, jw, jh, 10); ctx.clip();
  ctx.fillStyle = P.water;
  ctx.fillRect(jx, jy + jh - jh * k, jw, jh * k + 4);
  ctx.fillStyle = P.waterLt;
  ctx.fillRect(jx, jy + jh - jh * k, jw, 4);
  ctx.restore();
  ctx.strokeStyle = 'rgba(90, 130, 140, .7)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(jx, jy, jw, jh, 10); ctx.stroke();
  numText(fa(S.jugML) + ' میلی‌لیتر', jx + jw / 2, jy + jh + 20, { size: 15, color: P.ink });

  /* شمارشِ پیمانه‌ها */
  for (let i = 0; i < CUPS.length; i++) {
    const c = CUPS[i], x = b.x + 186, y = b.y + 78 + i * 108;
    ctx.save();
    ctx.translate(x, y);
    const cw = 26 + i * 16, ch = 30 + i * 16;
    ctx.fillStyle = c.c;
    ctx.beginPath();
    ctx.moveTo(-cw / 2, -ch / 2); ctx.lineTo(cw / 2, -ch / 2);
    ctx.lineTo(cw / 2 - 4, ch / 2); ctx.lineTo(-cw / 2 + 4, ch / 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath(); ctx.ellipse(0, -ch / 2, cw / 2, 5, 0, 0, TAU); ctx.fill();
    ctx.restore();
    text(c.n, x + 44, y - 8, { size: 15, family: 'Lalezar', color: P.ink, align: 'left' });
    const shown = S.result[i] >= 0 ? S.result[i] : S.count[i];
    numText(fa(shown) + ' بار', x + 44, y + 14, { size: 15, color: P.accent, align: 'left' });
    if (S.result[i] >= 0) {
      ctx.strokeStyle = P.good; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + 100, y + 8); ctx.lineTo(x + 105, y + 14); ctx.lineTo(x + 114, y + 2);
      ctx.stroke();
    }
    /* دایره‌های ریخته‌شده */
    for (let j = 0; j < Math.min(shown, 12); j++) {
      ctx.fillStyle = c.c;
      ctx.beginPath(); ctx.arc(x + 106 + (j % 6) * 13, y - 6 + Math.floor(j / 6) * 15, 5, 0, TAU); ctx.fill();
    }
  }
  /* عددها کنارِ هم — همان درسِ علی و رضا */
  const cy = b.y + 300;
  const both = S.result[0] >= 0 && S.result[1] >= 0;
  ctx.fillStyle = both ? 'rgba(79,163,184,.14)' : 'rgba(34,48,46,.05)';
  ctx.beginPath(); rrPath(b.x + 22, cy, b.w - 44, 138, 12); ctx.fill();
  text(both ? 'همان آب، دو عددِ متفاوت' : 'ظرف را با هر پیمانه تا ته خالی کن',
    b.x + b.w / 2, cy + 24, { size: 15, family: 'Lalezar', color: both ? P.ink : P.inkSoft });
  for (let i = 0; i < CUPS.length; i++) {
    const r = S.result[i];
    numText(r >= 0 ? fa(r) + ' ' + CUPS[i].n : '؟ ' + CUPS[i].n,
      b.x + b.w / 2, cy + 56 + i * 30, { size: 17, color: r >= 0 ? CUPS[i].c : 'rgba(34,48,46,.3)' });
  }
  numText(both ? '= ' + fa(JUG_ML) + ' میلی‌لیتر' : '',
    b.x + b.w / 2, cy + 118, { size: 18, family: 'Lalezar', color: P.good });

  for (let i = 0; i < CUPS.length; i++) {
    button(cupBtn(i), 'یک ' + CUPS[i].n, {
      hot: S.hover && S.hover.k === 'cup' && S.hover.i === i, fill: '#3c7f8f', hotFill: '#4fa3b8', size: 19 });
  }
  button(BTN_REFILL, 'ظرف را پر کن', {
    hot: S.hover && S.hover.k === 'refill', fill: '#5c6870', hotFill: '#77848d', size: 18 });
  if (S.flash > 0) {
    ctx.save(); ctx.globalAlpha = clamp(S.flash, 0, 1);
    ctx.strokeStyle = P.bad; ctx.lineWidth = 3;
    ctx.beginPath(); rrPath(jx - 6, jy - 6, jw + 12, jh + 12, 12); ctx.stroke();
    ctx.restore();
  }
}

/* ── تخته ۳: جابه‌جاییِ آب ── */
function drawPanelC() {
  const b = PANEL_C;
  text('جابه‌جاییِ آب', b.x + b.w - 18, b.y + 28, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  for (let i = 0; i < SOLIDS.length; i++) {
    const r = solidBtn(i), s = SOLIDS[i];
    const on = S.solid === i, hot = S.hover && S.hover.k === 'solid' && S.hover.i === i;
    ctx.fillStyle = on ? 'rgba(79,163,184,.2)' : (hot ? 'rgba(34,48,46,.07)' : 'rgba(34,48,46,.035)');
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 9); ctx.fill();
    ctx.strokeStyle = on ? P.accent : 'rgba(34,48,46,.13)'; ctx.lineWidth = on ? 2.4 : 1.2;
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 9); ctx.stroke();
    ctx.save();
    ctx.translate(r.x + 24, r.y + r.h / 2);
    solidIcon(s, 1.5);
    ctx.restore();
    text(s.n, r.x + r.w - 10, r.y + r.h / 2, { size: 13, color: P.ink, align: 'right' });
    if (S.book.indexOf(i) >= 0) {
      ctx.strokeStyle = P.good; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(r.x + 44, r.y + r.h / 2); ctx.lineTo(r.x + 49, r.y + r.h / 2 + 5); ctx.lineTo(r.x + 57, r.y + r.h / 2 - 5);
      ctx.stroke();
    }
  }
  /* پیمانهٔ مدرّج */
  const s = S.solid >= 0 ? SOLIDS[S.solid] : null;
  const disp = s ? displaced(s, S.held) * clamp(S.dunk, 0, 1) : 0;
  const level = CYL_BASE + disp;
  const yOf = (ml) => CYL.y + CYL.h - (clamp(ml, 0, CYL_MAX) / CYL_MAX) * CYL.h;

  ctx.fillStyle = P.glass;
  ctx.beginPath(); rrPath(CYL.x, CYL.y, CYL.w, CYL.h, 8); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(CYL.x, CYL.y, CYL.w, CYL.h, 8); ctx.clip();
  ctx.fillStyle = P.water;
  ctx.fillRect(CYL.x, yOf(level), CYL.w, CYL.y + CYL.h - yOf(level) + 4);
  /* جسمِ داخلِ آب */
  if (s && S.dunk > 0) {
    const sub = submerged(s, S.held);
    const side = Math.cbrt(s.v) * 3.6;
    const surf = yOf(level);
    /* مرکزِ جسم: کسری که زیرِ آب است */
    const cyc = surf - side / 2 + side * sub;
    ctx.save();
    ctx.translate(CYL.x + CYL.w / 2, cyc);
    solidIcon(s, 3.6);
    ctx.restore();
  }
  ctx.fillStyle = P.waterLt;
  ctx.fillRect(CYL.x, yOf(level) - (S.splash > 0 ? 1 : 0), CYL.w, 4);
  ctx.restore();
  /* درجه‌بندی */
  ctx.strokeStyle = 'rgba(40,60,66,.55)'; ctx.lineWidth = 1.4;
  for (let ml = 0; ml <= CYL_MAX; ml += 50) {
    const big = ml % 100 === 0;
    ctx.beginPath();
    ctx.moveTo(CYL.x, yOf(ml)); ctx.lineTo(CYL.x + (big ? 20 : 12), yOf(ml)); ctx.stroke();
    if (big) numText(fa(ml), CYL.x - 16, yOf(ml), { size: 11, color: P.inkSoft });
  }
  ctx.strokeStyle = 'rgba(90, 130, 140, .8)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(CYL.x, CYL.y, CYL.w, CYL.h, 8); ctx.stroke();
  /* خطِ آبِ اوّلیه */
  ctx.strokeStyle = 'rgba(200, 90, 60, .7)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(CYL.x - 6, yOf(CYL_BASE)); ctx.lineTo(CYL.x + CYL.w + 6, yOf(CYL_BASE)); ctx.stroke();
  ctx.setLineDash([]);

  /* خواندنِ عددها */
  const rx = b.x + 26, ry = CYL.y + 6;
  numText('اوّل: ' + fa(CYL_BASE), rx, ry + 14, { size: 15, color: '#a8542c', align: 'left' });
  numText('حالا: ' + faNum(level, 0), rx, ry + 42, { size: 15, color: P.accent, align: 'left' });
  ctx.strokeStyle = 'rgba(34,48,46,.2)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(rx, ry + 58); ctx.lineTo(rx + 170, ry + 58); ctx.stroke();
  numText('بالا آمد: ' + faNum(disp, 0) + ' م‌ل', rx, ry + 78, { size: 17, family: 'Lalezar', color: P.good, align: 'left' });
  if (s && S.dunk >= 1) {
    const full = !floats(s) || S.held;
    text(full ? 'حجمِ ' + s.n + ' همین است.' : 'کاملاً زیرِ آب نرفته.',
      rx, ry + 110, { size: 14, color: full ? P.good : P.bad, align: 'left' });
    if (!full) text('نگهش دار تا برود.', rx, ry + 132, { size: 13, color: P.inkSoft, align: 'left' });
  }

  button(BTN_DUNK, 'بینداز', { hot: S.hover && S.hover.k === 'dunk', fill: '#3c7f8f', hotFill: '#4fa3b8', size: 20 });
  button(BTN_HOLD, 'زیرِ آب نگه دار', { hot: S.hover && S.hover.k === 'hold', fill: '#7a6a3c', hotFill: '#9a874c', size: 17 });
  text('هر میلی‌لیتر یک سانتی‌متر مکعب است.', b.x + b.w / 2, b.y + b.h - 24, { size: 13, color: P.inkSoft });
}

function draw() {
  beginScene(P.benchLo);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  const layer = staticLayer('bench', SCENE_W, SCENE_H, paintBenchStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawSteps();
  drawPanelA();
  drawPanelB();
  drawPanelC();
  bits.draw();
  ctx.restore();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 560;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 58, w, 42, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 37, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.09, 'rgba(8, 20, 28, .42)', 0, .1);
}

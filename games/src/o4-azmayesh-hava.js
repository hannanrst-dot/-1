/*!
title: آزمایشگاهِ هوا — مواد اطراف ما (آزمایش)
bg: #16232e
*/

/* ═══════════════════════════════════════════════════════════════════════
   آزمایشگاهِ هوا — علومِ سوم، درس ۴ «مواد اطراف ما»  (آزمایش)

   کتاب سه آزمایش دارد و هر سه اینجا مرحله‌به‌مرحله انجام می‌شود:

   ۱) لیوانِ وارونه با دستمالِ کاغذی ته آن. لیوان را وارونه تا ته در آب
      فرو می‌بریم: دستمال خیس نمی‌شود، چون هوا داخلِ لیوان است و جای
      آب را گرفته. بعد همان کار با لیوانی که ته آن سوراخ دارد: حباب‌ها
      بیرون می‌آیند، آب بالا می‌آید و دستمال خیس می‌شود.
      ⟵ «لیوانِ خالی واقعاً خالی نیست.»

   ۲) دو بادکنکِ هم‌اندازه روی ترازوی تعادلی. یکی را باد می‌کنیم؛ ترازو
      به سمتِ بادکنکِ بادشده می‌چرخد. ⟵ «هوا جرم دارد.»

   ۳) آبِ جوش و درِ سردِ قابلمه: آب بخار می‌شود (تبخیر) و بخار که به
      سطحِ سرد می‌خورد دوباره قطره می‌شود (میعان).

   فیزیکِ پشتِ کار واقعی است، نه نمایشی:
   ▸ فشارِ هوای محبوس با قانونِ بویل حساب می‌شود: P×V ثابت است. هرچه
     لیوان را عمیق‌تر ببری، فشارِ آب بیشتر می‌شود و هوای داخل کمی
     فشرده‌تر — پس آب کمی بالا می‌آید، ولی نه تا ته. با فرمولِ واقعیِ
     فشارِ عمق (هر ۱۰ متر آب یک اتمسفر) حساب می‌شود؛ در عمقِ چند
     ده‌سانتی‌متریِ یک ظرف این بالا آمدن بسیار کم است و دستمال خشک
     می‌ماند — همان چیزی که در کلاس هم دیده می‌شود.
   ▸ جرمِ هوای داخلِ بادکنک از چگالیِ واقعیِ هوا (۱٫۲ گرم بر لیتر)
     حساب می‌شود، پس شیبِ ترازو الکی نیست.
   ▸ دمای آب با گرما بالا می‌رود و در ۱۰۰ درجه می‌جوشد؛ بخار روی سطحی
     که سردتر از دمای شبنم باشد میعان می‌کند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  bench:  '#24343f', benchLo: '#16232e', benchHi: '#35505f',
  steel:  '#8d99a3', steelDk: '#54606a', steelLt: '#c3ced6',
  water:  '#4f9fc4', waterDk: '#2c6f92', waterLt: '#9fd8ea',
  glass:  'rgba(206, 232, 239, .38)',
  paper:  '#fbfaf2', card: '#ffffff',
  ink:    '#20303a', inkSoft: '#78868f',
  good:   '#4e9f6c', bad: '#c04a34', gold: '#c9962c', accent: '#4fa3b8',
  fire:   '#e8702a', fireLt: '#f6b23c',
};

/* ───────── قانون‌های واقعی ───────── */

const P_ATM = 101325;          /* فشارِ هوا، پاسکال */
const RHO_W = 1000;            /* چگالیِ آب، کیلوگرم بر متر مکعب */
const G = 9.81;
const RHO_AIR = 1.2;           /* چگالیِ هوا، گرم بر لیتر */

/** فشار در عمقِ d متر زیرِ آب. */
const pressureAt = (d) => P_ATM + RHO_W * G * d;

/** قانونِ بویل: هوای محبوس در عمقِ d چه کسری از حجمِ اوّلش می‌ماند.
    کسری که آب بالا می‌آید = ۱ منهای همین. */
function airFraction(d) { return P_ATM / pressureAt(d); }

/** جرمِ هوای داخلِ بادکنک، به گرم؛ v به لیتر. */
const airMass = (v) => RHO_AIR * v;

/* ───────── وضعیت ───────── */

const STEPS = [
  { n: 'لیوانِ وارونه', t: 'لیوان را وارونه تا ته در آب فرو ببر.' },
  { n: 'سوراخ',        t: 'حالا با لیوانی که ته آن سوراخ دارد.' },
  { n: 'بادکنک',       t: 'یک بادکنک را باد کن و ترازو را ببین.' },
  { n: 'بخار',         t: 'آب را بجوشان و درِ سرد را بالایش بگیر.' },
];

const S = {
  stepI: 0,
  /* ۱ و ۲ */
  hole: false, depth: 0, dipping: 0, wet: 0, bubbles: [],
  /* ۳ */
  blown: 0,              /* حجمِ هوای بادکنکِ راست، لیتر */
  pumping: 0,
  /* ۴ */
  heat: 0, temp: 20, lidCold: false, lidT: 5, drops: [], steamT: 0,
  t: 0, hover: null, tip: '', tipT: 0, flash: 0,
};

const bits = new Bits();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const R = (a, b) => a + Math.random() * (b - a);
function tip(msg) { S.tip = msg; S.tipT = 3.6; }

/* ───────── جای‌ها ───────── */

const A = { x: 24, y: 96, w: 372, h: 640 };    /* لیوان و آب */
const B = { x: 412, y: 96, w: 352, h: 640 };   /* بادکنک و ترازو */
const C = { x: 780, y: 96, w: 396, h: 640 };   /* جوش و میعان */

const TANK = { x: A.x + 40, y: A.y + 230, w: 292, h: 250 };
const BTN_DIP = { x: A.x + 24, y: A.y + 528, w: 156, h: 56 };
const BTN_HOLE = { x: A.x + 192, y: A.y + 528, w: 156, h: 56 };
const BTN_RESET_A = { x: A.x + 24, y: A.y + 594, w: A.w - 48, h: 46 };

const BTN_PUMP = { x: B.x + 24, y: B.y + 528, w: 148, h: 56 };
const BTN_DEFLATE = { x: B.x + 184, y: B.y + 528, w: 144, h: 56 };

const POT = { x: C.x + 60, y: C.y + 246, w: 190, h: 120 };
const BTN_HEAT = { x: C.x + 22, y: C.y + 528, w: 168, h: 56 };
const BTN_LID = { x: C.x + 204, y: C.y + 528, w: 168, h: 56 };

/* ───────── کارها ───────── */

function dipStep(dt) {
  if (!S.dipping) {
    S.depth = Math.max(0, S.depth - dt * .5);
    return;
  }
  S.depth = Math.min(.34, S.depth + dt * .3);     /* تا ۳۴ سانتی‌متر */
  S.stepI = Math.max(S.stepI, S.hole ? 1 : 0);
  if (S.hole) {
    /* آب از پایین بالا می‌آید و هوا حباب‌حباب بیرون می‌رود */
    S.wet = Math.min(1, S.wet + dt * 1.1);
    if (Math.random() < dt * 14) {
      S.bubbles.push({ x: R(-16, 16), y: 0, r: R(3, 7), t: 0 });
    }
    if (S.wet >= 1 && S.stepI < 2) S.stepI = 2;
  }
}

function toggleHole() {
  S.hole = !S.hole;
  S.wet = 0; S.bubbles.length = 0; S.depth = 0; S.dipping = 0;
  sfx.tap();
  if (S.hole) S.stepI = Math.max(S.stepI, 1);
}

function pump(dt) {
  if (!S.pumping) return;
  S.blown = Math.min(3.2, S.blown + dt * 1.1);
  S.stepI = Math.max(S.stepI, 2);
}

function heatStep(dt) {
  if (S.heat) {
    /* گرما دما را بالا می‌برد، ولی در نقطهٔ جوش می‌ایستد */
    S.temp = Math.min(100, S.temp + dt * 16);
    S.stepI = Math.max(S.stepI, 3);
  } else {
    S.temp = Math.max(20, S.temp - dt * 7);
  }
  const boiling = S.temp >= 99.5;
  S.steamT += dt * (boiling ? 1 : 0);
  /* میعان: بخار روی سطحی که سرد باشد قطره می‌شود */
  if (boiling && S.lidCold && Math.random() < dt * 9) {
    S.drops.push({ x: R(-72, 72), y: 0, r: R(2.4, 4.6), v: 0, t: 0 });
  }
  for (let i = S.drops.length - 1; i >= 0; i--) {
    const d = S.drops[i];
    d.t += dt;
    if (d.t > .9) { d.v += dt * 260; d.y += d.v * dt; }
    if (d.y > 150) S.drops.splice(i, 1);
  }
  if (S.lidCold) S.lidT = Math.min(60, S.lidT + dt * (boiling ? 3.4 : .8));
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.flash > 0) S.flash -= dt;
  dipStep(dt);
  pump(dt);
  heatStep(dt);
  for (let i = S.bubbles.length - 1; i >= 0; i--) {
    const b = S.bubbles[i];
    b.t += dt; b.y -= dt * 90;
    if (b.t > 1.6) S.bubbles.splice(i, 1);
  }
  bits.step(dt);
  draw();
}

whenFontsReady(() => runLoop(step));

/* ───────── ورودی ───────── */

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  if (inRect(p, BTN_DIP)) S.hover = { k: 'dip' };
  if (inRect(p, BTN_HOLE)) S.hover = { k: 'hole' };
  if (inRect(p, BTN_RESET_A)) S.hover = { k: 'resetA' };
  if (inRect(p, BTN_PUMP)) S.hover = { k: 'pump' };
  if (inRect(p, BTN_DEFLATE)) S.hover = { k: 'deflate' };
  if (inRect(p, BTN_HEAT)) S.hover = { k: 'heat' };
  if (inRect(p, BTN_LID)) S.hover = { k: 'lid' };
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (inRect(p, BTN_DIP)) { S.dipping = 1; try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ } return; }
  if (inRect(p, BTN_HOLE)) { toggleHole(); return; }
  if (inRect(p, BTN_RESET_A)) { S.depth = 0; S.wet = 0; S.dipping = 0; S.bubbles.length = 0; sfx.tap(); return; }
  if (inRect(p, BTN_PUMP)) { S.pumping = 1; try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ } return; }
  if (inRect(p, BTN_DEFLATE)) { S.blown = 0; sfx.slide(); return; }
  if (inRect(p, BTN_HEAT)) { S.heat = !S.heat; sfx.tap(); return; }
  if (inRect(p, BTN_LID)) { S.lidCold = !S.lidCold; if (S.lidCold) S.lidT = 5; sfx.tap(); return; }
});

function release() { S.dipping = 0; S.pumping = 0; }
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
cv.addEventListener('pointerleave', release);
addEventListener('blur', release);

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

/* ───────── نقاشیِ صحنه ───────── */

function paintBackStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.benchHi); g.addColorStop(1, P.benchLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 2;
  for (let x = 0; x < SCENE_W; x += 58) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SCENE_H); ctx.stroke(); }
  for (let y = 0; y < SCENE_H; y += 58) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke(); }
  for (const b of [A, B, C]) {
    ctx.fillStyle = 'rgba(255, 253, 246, .95)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(12, 28, 38, .2)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 16); ctx.stroke();
  }
}

function drawSteps() {
  for (let i = 0; i < STEPS.length; i++) {
    const w = 170, x = SCENE_W - 24 - (i + 1) * (w + 8) + 8, y = 16, h = 44;
    const on = i === S.stepI, done = i < S.stepI;
    ctx.fillStyle = on ? P.accent : (done ? 'rgba(79, 163, 184, .28)' : 'rgba(255,255,255,.1)');
    ctx.beginPath(); rrPath(x, y, w, h, 12); ctx.fill();
    numText(fa(i + 1), x + w - 20, y + h / 2, { size: 15, color: on ? '#fff' : 'rgba(255,255,255,.6)' });
    text(STEPS[i].n, x + w / 2 + 6, y + h / 2,
      { size: 16, family: 'Lalezar', color: on ? '#fff' : 'rgba(255,255,255,.62)' });
  }
  ctx.save();
  ctx.beginPath(); ctx.rect(16, 12, 380, 52); ctx.clip();
  text(STEPS[S.stepI].t, 396, 39, { size: 16, color: 'rgba(255,255,255,.82)', align: 'right' });
  ctx.restore();
}

/* ── تخته ۱: لیوانِ وارونه ── */
function drawTank() {
  text('لیوانِ خالی', A.x + A.w - 18, A.y + 30, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  const t = TANK;
  const surf = t.y + 26;
  /* آبِ ظرف */
  ctx.fillStyle = P.glass;
  ctx.beginPath(); rrPath(t.x, t.y, t.w, t.h, 10); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(t.x, t.y, t.w, t.h, 10); ctx.clip();
  ctx.fillStyle = P.water;
  ctx.fillRect(t.x, surf, t.w, t.h);
  ctx.fillStyle = P.waterLt;
  ctx.fillRect(t.x, surf, t.w, 4);
  ctx.restore();

  /* لیوانِ وارونه — بیرونِ برش کشیده می‌شود تا بالای آب هم دیده شود */
  const gw = 108, gh = 120;
  const gx = t.x + t.w / 2 - gw / 2;
  const gy = surf - gh - 10 + (S.depth / .34) * 230;
  const frac = S.hole ? (1 - S.wet) : airFraction(S.depth);
  const airH = gh * clamp(frac, 0, 1);
  ctx.save();
  ctx.beginPath(); rrPath(gx, gy, gw, gh, 3); ctx.clip();
  /* هوای محبوس */
  ctx.fillStyle = 'rgba(236, 248, 252, .55)';
  ctx.fillRect(gx, gy, gw, airH);
  /* آبی که بالا آمده */
  if (airH < gh) {
    ctx.fillStyle = P.waterDk;
    ctx.fillRect(gx, gy + airH, gw, gh - airH);
    ctx.fillStyle = P.waterLt;
    ctx.fillRect(gx, gy + airH, gw, 3);
  }
  /* دستمالِ کاغذی، چسبیده به تهِ لیوان که حالا بالاست */
  const dry = S.hole ? (1 - S.wet) : 1;
  ctx.fillStyle = dry > .5 ? '#f6f2e2' : '#9e9682';
  ctx.beginPath(); rrPath(gx + 20, gy + 8, gw - 40, 24, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(90,90,70,.45)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); rrPath(gx + 20, gy + 8, gw - 40, 24, 4); ctx.stroke();
  ctx.restore();
  /* شیشهٔ لیوان */
  ctx.strokeStyle = 'rgba(190, 230, 242, .95)'; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(gx, gy + gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.lineTo(gx + gw, gy + gh);
  ctx.stroke();
  if (S.hole) {
    ctx.strokeStyle = 'rgba(20,40,50,.85)'; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.arc(gx + gw / 2, gy, 8, Math.PI, TAU); ctx.stroke();
  }
  /* حباب‌ها، فقط داخلِ ظرف */
  ctx.save();
  ctx.beginPath(); rrPath(t.x, t.y, t.w, t.h, 10); ctx.clip();
  for (const b of S.bubbles) {
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(gx + gw / 2 + b.x, gy + b.y - 4, b.r, 0, TAU); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(90, 130, 140, .8)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(t.x, t.y, t.w, t.h, 10); ctx.stroke();

  /* خواندنی‌ها */
  const yy = A.y + 62;
  numText('عمق: ' + faNum(S.depth * 100, 0) + ' سانتی‌متر', A.x + A.w / 2, yy, { size: 15, color: P.ink });
  const rise = (1 - airFraction(S.depth)) * 100;
  numText(S.hole ? 'هوا از سوراخ بیرون رفت' : 'آبِ بالا آمده در لیوان: ' + faNum(rise, 1) + '٪',
    A.x + A.w / 2, yy + 26, { size: 14, color: S.hole ? P.bad : P.accent });
  text(S.hole ? (S.wet > .6 ? 'دستمال خیس شد.' : 'آب دارد بالا می‌آید…')
              : (S.depth > .1 ? 'دستمال هنوز خشک است.' : 'لیوان را فرو ببر.'),
    A.x + A.w / 2, yy + 52, { size: 15, family: 'Lalezar', color: S.hole && S.wet > .6 ? P.bad : P.good });

  button(BTN_DIP, S.dipping ? 'فرو می‌رود…' : 'فرو ببر', {
    hot: S.hover && S.hover.k === 'dip', fill: '#2f7f96', hotFill: '#4fa3b8', size: 20 });
  button(BTN_HOLE, S.hole ? 'لیوانِ سالم' : 'لیوانِ سوراخ', {
    hot: S.hover && S.hover.k === 'hole', fill: S.hole ? '#8a5a2a' : '#5c6870', hotFill: '#a4703a', size: 18 });
  button(BTN_RESET_A, 'از نو', {
    hot: S.hover && S.hover.k === 'resetA', fill: '#5c6870', hotFill: '#77848d', size: 18 });
}

/* ── تخته ۲: هوا جرم دارد ── */
function drawBalloons() {
  text('هوا جرم دارد؟', B.x + B.w - 18, B.y + 30, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  const cx = B.x + B.w / 2, cy = B.y + 150;
  const m = airMass(S.blown);                    /* گرمِ هوای داخل */
  const ang = -0.3 * Math.tanh(m / 1.6);         /* راست سنگین‌تر ⟵ راست پایین */
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 190); ctx.stroke();
  ctx.fillStyle = P.steel;
  ctx.beginPath(); ctx.ellipse(cx, cy + 194, 46, 9, 0, 0, TAU); ctx.fill();
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-118, 0); ctx.lineTo(118, 0); ctx.stroke();
  ctx.strokeStyle = P.steelLt; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-118, 0); ctx.lineTo(118, 0); ctx.stroke();
  ctx.restore();
  /* دو بادکنک */
  for (const [sd, vol] of [[-1, 0], [1, S.blown]]) {
    const hx = cx + sd * 118 * Math.cos(ang), hy = cy + sd * 118 * Math.sin(ang);
    ctx.strokeStyle = 'rgba(120,140,150,.8)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx, hy + 34); ctx.stroke();
    const r = 16 + vol * 11;
    ctx.fillStyle = sd < 0 ? '#c05a6a' : '#5a86c0';
    ctx.beginPath(); ctx.ellipse(hx, hy + 34 + r * .9, r * .92, r, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath(); ctx.ellipse(hx - r * .3, hy + 30 + r * .6, r * .22, r * .3, -.4, 0, TAU); ctx.fill();
    ctx.fillStyle = sd < 0 ? '#8e3a48' : '#3a5c8e';
    ctx.beginPath();
    ctx.moveTo(hx - 5, hy + 34); ctx.lineTo(hx + 5, hy + 34); ctx.lineTo(hx, hy + 44); ctx.closePath(); ctx.fill();
  }
  /* عددها */
  const yy = B.y + 400;
  ctx.fillStyle = 'rgba(79,163,184,.1)';
  ctx.beginPath(); rrPath(B.x + 22, yy, B.w - 44, 106, 12); ctx.fill();
  numText('هوای داخل: ' + faNum(S.blown, 1) + ' لیتر', B.x + B.w / 2, yy + 26, { size: 16, color: P.ink });
  numText('جرمِ آن هوا: ' + faNum(m, 2) + ' گرم', B.x + B.w / 2, yy + 56,
    { size: 17, family: 'Lalezar', color: m > 0 ? P.accent : P.inkSoft });
  text(m > .3 ? 'ترازو به سمتِ بادکنکِ بادشده چرخید.' : 'هنوز برابرند.',
    B.x + B.w / 2, yy + 84, { size: 14, color: m > .3 ? P.good : P.inkSoft });
  text('هر لیتر هوا ' + faNum(RHO_AIR, 1) + ' گرم است.', B.x + B.w / 2, B.y + 372,
    { size: 13, color: P.inkSoft });

  button(BTN_PUMP, S.pumping ? 'باد می‌شود…' : 'باد کن', {
    hot: S.hover && S.hover.k === 'pump', fill: '#2f7f96', hotFill: '#4fa3b8', size: 20 });
  button(BTN_DEFLATE, 'خالی کن', {
    hot: S.hover && S.hover.k === 'deflate', fill: '#5c6870', hotFill: '#77848d', size: 19 });
}

/* ── تخته ۳: تبخیر و میعان ── */
function drawBoil() {
  text('بخار و قطره', C.x + C.w - 18, C.y + 30, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  const boiling = S.temp >= 99.5;
  const lx = C.x + C.w / 2, ly = C.y + 150;
  /* درِ قابلمه */
  ctx.fillStyle = S.lidCold ? '#a8cbd8' : P.steel;
  ctx.beginPath(); rrPath(lx - 96, ly, 192, 16, 8); ctx.fill();
  ctx.fillStyle = S.lidCold ? '#7fb0c4' : P.steelDk;
  ctx.beginPath(); ctx.arc(lx, ly - 6, 13, Math.PI, TAU); ctx.fill();
  if (S.lidCold) {
    ctx.strokeStyle = 'rgba(150, 210, 235, .9)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(lx - 100, ly - 4, 200, 24, 10); ctx.stroke();
  }
  /* قطره‌های میعان زیرِ در */
  for (const d of S.drops) {
    ctx.fillStyle = P.water;
    ctx.beginPath(); ctx.arc(lx + d.x, ly + 18 + d.y, d.r, 0, TAU); ctx.fill();
  }
  /* بخار */
  if (boiling) {
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const ph = (S.steamT * .8 + i * .33) % 1;
      const y = POT.y - 6 - ph * 120;
      ctx.globalAlpha = .72 * (1 - ph * .85);
      ctx.fillStyle = '#eef5f8';
      ctx.beginPath();
      ctx.arc(POT.x + 34 + i * 22 + Math.sin(S.t * 2 + i) * 9, y, 14 + ph * 16, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  /* قابلمه */
  const t = POT;
  ctx.fillStyle = P.glass;
  ctx.beginPath(); rrPath(t.x, t.y, t.w, t.h, 8); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(t.x, t.y, t.w, t.h, 8); ctx.clip();
  ctx.fillStyle = P.water;
  ctx.fillRect(t.x, t.y + 34, t.w, t.h);
  ctx.fillStyle = P.waterLt;
  ctx.fillRect(t.x, t.y + 34, t.w, 4);
  if (boiling) {
    for (let i = 0; i < 10; i++) {
      const ph = (S.t * 1.4 + i * .21) % 1;
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.beginPath();
      ctx.arc(t.x + 16 + i * 17, t.y + t.h - ph * (t.h - 40), 3 + ph * 4, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(t.x, t.y, t.w, t.h, 8); ctx.stroke();
  /* شعله */
  if (S.heat) {
    for (let i = 0; i < 5; i++) {
      const w = 1 + Math.sin(S.t * 9 + i) * .12;
      ctx.fillStyle = i % 2 ? P.fireLt : P.fire;
      ctx.beginPath();
      ctx.ellipse(t.x + 24 + i * 36, t.y + t.h + 18, 11 * w, 20 * w, 0, 0, TAU);
      ctx.fill();
    }
  }
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(t.x - 8, t.y + t.h + 34, t.w + 16, 12, 5); ctx.fill();

  /* دماسنج */
  const th = { x: C.x + 300, y: C.y + 176, w: 26, h: 190 };
  const yOf = (v) => th.y + th.h - (clamp(v, 0, 120) / 120) * th.h;
  ctx.fillStyle = '#e8ecec';
  ctx.beginPath(); rrPath(th.x, th.y, th.w, th.h, th.w / 2); ctx.fill();
  ctx.beginPath(); ctx.arc(th.x + th.w / 2, th.y + th.h + 18, 19, 0, TAU); ctx.fill();
  ctx.fillStyle = boiling ? P.fire : P.water;
  ctx.beginPath(); ctx.arc(th.x + th.w / 2, th.y + th.h + 18, 14, 0, TAU); ctx.fill();
  ctx.beginPath(); rrPath(th.x + 6, yOf(S.temp), th.w - 12, th.y + th.h - yOf(S.temp) + 8, (th.w - 12) / 2); ctx.fill();
  ctx.strokeStyle = 'rgba(32,48,58,.6)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(th.x - 6, yOf(100)); ctx.lineTo(th.x + th.w + 6, yOf(100)); ctx.stroke();
  numText('۱۰۰', th.x + th.w + 26, yOf(100), { size: 12, color: P.inkSoft });
  numText(faNum(S.temp, 0) + '°', th.x + th.w / 2, th.y - 16, { size: 16, family: 'Lalezar', color: P.ink });

  /* خواندنی‌ها */
  const yy = C.y + 424;
  ctx.fillStyle = 'rgba(79,163,184,.1)';
  ctx.beginPath(); rrPath(C.x + 22, yy, C.w - 44, 84, 12); ctx.fill();
  text(boiling ? 'تبخیر: آب دارد گاز می‌شود.' : 'آب هنوز نجوشیده.',
    C.x + C.w / 2, yy + 26, { size: 16, family: 'Lalezar', color: boiling ? P.accent : P.inkSoft });
  text(boiling && S.lidCold ? 'میعان: بخار روی درِ سرد قطره شد.'
                            : (S.lidCold ? 'درِ سرد آماده است.' : 'درِ قابلمه سرد نیست.'),
    C.x + C.w / 2, yy + 56, { size: 15, color: boiling && S.lidCold ? P.good : P.inkSoft });

  button(BTN_HEAT, S.heat ? 'شعله خاموش' : 'شعله روشن', {
    hot: S.hover && S.hover.k === 'heat', fill: S.heat ? '#a8410c' : '#2f7f96', hotFill: '#e8702a', size: 19 });
  button(BTN_LID, S.lidCold ? 'درِ معمولی' : 'درِ سرد', {
    hot: S.hover && S.hover.k === 'lid', fill: S.lidCold ? '#3c7f8f' : '#5c6870', hotFill: '#4fa3b8', size: 19 });
}

function draw() {
  beginScene(P.benchLo);
  const layer = staticLayer('back', SCENE_W, SCENE_H, paintBackStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawSteps();
  drawTank();
  drawBalloons();
  drawBoil();
  bits.draw();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 520;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 58, w, 42, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 37, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.09, 'rgba(6, 18, 26, .42)', 0, .1);
}

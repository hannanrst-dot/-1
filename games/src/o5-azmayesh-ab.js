/*!
title: آزمایشگاهِ آب — آبِ باارزش (آزمایش)
bg: #15242c
*/

/* ═══════════════════════════════════════════════════════════════════════
   آزمایشگاهِ آب — علومِ سوم، درس ۵ «آب مادّه‌ای با ارزش»  (آزمایش)

   سه ایستگاه، هر سه از خودِ کتاب:

   ۱) تقطیر. کتاب می‌گوید در ظرف به‌جای آب، آبِ شور بریزید؛ قطره‌هایی
      را که روی درِ سردِ قابلمه جمع می‌شوند بچشید. نتیجه: شور نیست.
      چرا؟ چون نمک بخار نمی‌شود. نقطهٔ جوشِ آب ۱۰۰ درجه است ولی نمکِ
      خوراکی در ۱۴۱۳ درجه می‌جوشد، پس در دمای جوشِ آب اصلاً به بخار
      نمی‌رود و ته ظرف می‌ماند. هرچه آب بیشتر بخار شود، آبِ باقی‌مانده
      شورتر می‌شود — در آزمایش هم دقیقاً همین حساب می‌شود:
      شوریِ باقی‌مانده = نمکِ اوّل ÷ آبِ باقی‌مانده.

   ۲) نفوذ در خاک. کتاب سه خاک را مقایسه می‌کند: خاکِ رُس، خاکِ باغچه و
      ماسه. سرعتِ نفوذِ واقعیِ آب در این‌ها بسیار متفاوت است (میلی‌متر
      در ساعت): رُس حدودِ ۲، خاکِ باغچه حدودِ ۱۵، ماسه حدودِ ۶۰. همین
      عددها اینجا به کار رفته‌اند، پس ستون‌ها با سرعتِ واقعی خالی
      می‌شوند و بچّه خودش می‌بیند کدام زودتر آب را می‌بلعد.

   ۳) آبِ شیرینِ زمین. کتاب می‌گوید از هر ۱۰۰ قسمتِ آبِ روی زمین، ۹۷
      قسمت شور و ۳ قسمت شیرین است؛ و از همان مقدارِ شیرین هم فقط
      کمی در دسترسِ ماست (سطلِ ۱۰ لیتری، یک لیوان، نصف قاشقِ چای‌خوری).
      اینجا هر سه با هم نشان داده می‌شود: صد خانه، و بعد همان نسبت با
      سطل و لیوان و قاشق.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  bench:  '#22333c', benchLo: '#15242c', benchHi: '#32505e',
  steel:  '#8d99a3', steelDk: '#54606a', steelLt: '#c3ced6',
  water:  '#4f9fc4', waterDk: '#2c6f92', waterLt: '#9fd8ea',
  salt:   '#f2f4f2', saltDk: '#c8cec8',
  glass:  'rgba(206, 232, 239, .38)',
  clay:   '#b1745a', clayDk: '#7d4a34',
  garden: '#7a5a38', gardenDk: '#4f3a22',
  sand:   '#dcc38a', sandDk: '#b19a5e',
  paper:  '#fbfaf2', card: '#ffffff',
  ink:    '#20303a', inkSoft: '#78868f',
  good:   '#4e9f6c', bad: '#c04a34', gold: '#c9962c', accent: '#4fa3b8',
  fire:   '#e8702a', fireLt: '#f6b23c',
};

/* ───────── قانون‌های واقعی ───────── */

const BOIL_W = 100, BOIL_SALT = 1413;   /* نقطهٔ جوش، درجهٔ سلسیوس */
/** آیا این مادّه در دمای T بخار می‌شود؟ */
const evaporates = (boil, T) => T >= boil;

/* سرعتِ نفوذِ واقعی، میلی‌متر بر ساعت */
const SOILS = [
  { id: 'ros',    n: 'خاکِ رُس',   rate: 2,  c: P.clay,   d: P.clayDk },
  { id: 'baghche', n: 'خاکِ باغچه', rate: 15, c: P.garden, d: P.gardenDk },
  { id: 'mase',   n: 'ماسه',      rate: 60, c: P.sand,   d: P.sandDk },
];
const POUR_MM = 40;          /* چند میلی‌متر آب روی هر ستون می‌ریزیم */

/* نسبتِ آبِ زمین */
const SALT_PCT = 97, FRESH_PCT = 3;

const STEPS = [
  { n: 'تقطیر',      t: 'آبِ شور را بجوشان و قطره‌ها را جمع کن.' },
  { n: 'نفوذ',       t: 'روی هر سه خاک آب بریز و ببین کدام زودتر می‌مکد.' },
  { n: 'آبِ شیرین',  t: 'از صد قسمتِ آبِ زمین، چند قسمت به کار می‌آید؟' },
];

const S = {
  stepI: 0,
  /* ۱ تقطیر */
  heat: false, temp: 20, water: 100, salt: 6, collected: 0, drops: [],
  tasted: -1,             /* ۰ ظرف، ۱ لیوانِ جمع‌شده */
  /* ۲ نفوذ */
  soak: [0, 0, 0], soaking: false, soakT: 0,
  /* ۳ نسبت */
  showFresh: false,
  t: 0, hover: null, tip: '', tipT: 0, flash: 0,
};

const bits = new Bits();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
function tip(msg) { S.tip = msg; S.tipT = 3.6; }
const R = (a, b) => a + Math.random() * (b - a);

/** شوریِ آبِ باقی‌مانده در ظرف، گرم بر صد میلی‌لیتر. */
const brine = () => (S.water > 0 ? S.salt / S.water * 100 : Infinity);

/* ───────── جای‌ها ───────── */

const A = { x: 24, y: 96, w: 392, h: 640 };
const B = { x: 432, y: 96, w: 356, h: 640 };
const C = { x: 804, y: 96, w: 372, h: 640 };

const POT = { x: A.x + 52, y: A.y + 250, w: 176, h: 116 };
const CUP = { x: A.x + 274, y: A.y + 300, w: 84, h: 96 };
const BTN_HEAT = { x: A.x + 22, y: A.y + 480, w: 168, h: 54 };
const BTN_RESET_A = { x: A.x + 202, y: A.y + 480, w: 168, h: 54 };
const BTN_TASTE_POT = { x: A.x + 22, y: A.y + 546, w: 168, h: 50 };
const BTN_TASTE_CUP = { x: A.x + 202, y: A.y + 546, w: 168, h: 50 };

function soilCol(i) { return { x: B.x + 26 + i * 106, y: B.y + 128, w: 90, h: 300 }; }
const BTN_POUR = { x: B.x + 26, y: B.y + 480, w: 148, h: 54 };
const BTN_RESET_B = { x: B.x + 186, y: B.y + 480, w: 144, h: 54 };

const GRID100 = { x: C.x + 26, y: C.y + 76, w: 320, h: 320 };
const BTN_ZOOM = { x: C.x + 26, y: C.y + 576, w: C.w - 52, h: 54 };

/* ───────── کارها ───────── */

function distillStep(dt) {
  if (S.heat) S.temp = Math.min(105, S.temp + dt * 18);
  else S.temp = Math.max(20, S.temp - dt * 9);
  const boiling = evaporates(BOIL_W, S.temp);
  if (boiling && S.water > 0) {
    /* فقط آب بخار می‌شود؛ نمک در این دما اصلاً بخار نمی‌شود */
    const d = Math.min(S.water, dt * 5.2);
    S.water -= d;
    S.collected += d;
    S.stepI = Math.max(S.stepI, 0);
    if (Math.random() < dt * 9) S.drops.push({ u: R(0, .45), y: 0, v: 0 });
  }
  /* قطره روی درِ شیب‌دار سُر می‌خورد تا لبه، بعد در لیوان می‌افتد */
  for (let i = S.drops.length - 1; i >= 0; i--) {
    const q = S.drops[i];
    if (q.u < 1) q.u = Math.min(1, q.u + dt * .38);
    else { q.v += dt * 300; q.y += q.v * dt; }
    if (q.y > 140) S.drops.splice(i, 1);   /* تا داخلِ لیوان برود */
  }
}

function taste(which) {
  if (which === 1 && S.collected < 12) { tip('هنوز آبِ جمع‌شده کم است.'); S.flash = 1; sfx.nope(); return; }
  S.tasted = which;
  sfx.tap();
  if (which === 1) S.stepI = Math.max(S.stepI, 1);
}

function resetDistill() {
  S.heat = false; S.temp = 20; S.water = 100; S.salt = 6;
  S.collected = 0; S.drops.length = 0; S.tasted = -1;
  sfx.tap();
}

function soakStep(dt) {
  if (!S.soaking) return;
  S.soakT += dt;
  /* یک ثانیهٔ بازی = یک ساعتِ واقعی */
  let done = true;
  for (let i = 0; i < 3; i++) {
    if (S.soak[i] < POUR_MM) {
      S.soak[i] = Math.min(POUR_MM, S.soak[i] + SOILS[i].rate * dt);
      done = false;
    }
  }
  if (done) { S.soaking = false; S.stepI = Math.max(S.stepI, 2); }
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.flash > 0) S.flash -= dt;
  distillStep(dt);
  soakStep(dt);
  bits.step(dt);
  draw();
}

whenFontsReady(() => runLoop(step));

/* ───────── ورودی ───────── */

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  if (inRect(p, BTN_HEAT)) S.hover = { k: 'heat' };
  if (inRect(p, BTN_RESET_A)) S.hover = { k: 'resetA' };
  if (inRect(p, BTN_TASTE_POT)) S.hover = { k: 'tp' };
  if (inRect(p, BTN_TASTE_CUP)) S.hover = { k: 'tc' };
  if (inRect(p, BTN_POUR)) S.hover = { k: 'pour' };
  if (inRect(p, BTN_RESET_B)) S.hover = { k: 'resetB' };
  if (inRect(p, BTN_ZOOM)) S.hover = { k: 'zoom' };
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (inRect(p, BTN_HEAT)) { S.heat = !S.heat; sfx.tap(); return; }
  if (inRect(p, BTN_RESET_A)) { resetDistill(); return; }
  if (inRect(p, BTN_TASTE_POT)) { taste(0); return; }
  if (inRect(p, BTN_TASTE_CUP)) { taste(1); return; }
  if (inRect(p, BTN_POUR)) { S.soak = [0, 0, 0]; S.soakT = 0; S.soaking = true; sfx.slide(); return; }
  if (inRect(p, BTN_RESET_B)) { S.soak = [0, 0, 0]; S.soakT = 0; S.soaking = false; sfx.tap(); return; }
  if (inRect(p, BTN_ZOOM)) { S.showFresh = !S.showFresh; sfx.tap(); S.stepI = Math.max(S.stepI, 2); return; }
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
    const w = 180, x = SCENE_W - 24 - (i + 1) * (w + 8) + 8, y = 16, h = 44;
    const on = i === S.stepI, done = i < S.stepI;
    ctx.fillStyle = on ? P.accent : (done ? 'rgba(79, 163, 184, .28)' : 'rgba(255,255,255,.1)');
    ctx.beginPath(); rrPath(x, y, w, h, 12); ctx.fill();
    numText(fa(i + 1), x + w - 20, y + h / 2, { size: 15, color: on ? '#fff' : 'rgba(255,255,255,.6)' });
    text(STEPS[i].n, x + w / 2 + 6, y + h / 2,
      { size: 16, family: 'Lalezar', color: on ? '#fff' : 'rgba(255,255,255,.62)' });
  }
  ctx.save();
  ctx.beginPath(); ctx.rect(16, 12, 540, 52); ctx.clip();
  text(STEPS[S.stepI].t, 556, 39, { size: 16, color: 'rgba(255,255,255,.82)', align: 'right' });
  ctx.restore();
}

/* ── ایستگاه ۱: تقطیر ── */
function drawDistill() {
  text('تقطیر', A.x + A.w - 18, A.y + 30, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  const boiling = evaporates(BOIL_W, S.temp);
  /* درِ سردِ شیب‌دار: بخار رویش قطره می‌شود، قطره سُر می‌خورد و در
     لیوان می‌افتد — همان چیدمانِ واقعیِ تقطیر. */
  const ly = POT.y - 116;
  const L0 = { x: POT.x - 10, y: ly }, L1 = { x: CUP.x + CUP.w / 2, y: ly + 36 };
  ctx.strokeStyle = '#7fb0c4'; ctx.lineWidth = 15; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(L0.x, L0.y); ctx.lineTo(L1.x, L1.y); ctx.stroke();
  ctx.strokeStyle = '#a8cbd8'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(L0.x, L0.y); ctx.lineTo(L1.x, L1.y); ctx.stroke();
  ctx.fillStyle = '#5f96ac';
  ctx.beginPath(); ctx.arc(L0.x + 32, L0.y - 8, 10, Math.PI, TAU); ctx.fill();
  text('درِ سرد', L0.x + 46, L0.y - 22, { size: 12, color: P.inkSoft });
  for (const q of S.drops) {
    const dx = lerp(L0.x, L1.x, q.u), dy = lerp(L0.y, L1.y, q.u) + 9 + q.y;
    ctx.fillStyle = P.water;
    ctx.beginPath(); ctx.arc(dx, dy, 3.6, 0, TAU); ctx.fill();
  }
  /* بخار */
  if (boiling) {
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const ph = (S.t * .7 + i * .3) % 1;
      ctx.globalAlpha = .6 * (1 - ph * .8);
      ctx.fillStyle = '#eef5f8';
      ctx.beginPath();
      ctx.arc(POT.x + 30 + i * 24 + Math.sin(S.t * 2 + i) * 8, POT.y - 10 - ph * 90, 12 + ph * 12, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  /* قابلمه با آبِ شور */
  ctx.fillStyle = P.glass;
  ctx.beginPath(); rrPath(POT.x, POT.y, POT.w, POT.h, 8); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(POT.x, POT.y, POT.w, POT.h, 8); ctx.clip();
  const wh = POT.h * clamp(S.water / 100, 0, 1);
  ctx.fillStyle = P.water;
  ctx.fillRect(POT.x, POT.y + POT.h - wh, POT.w, wh);
  /* دانه‌های نمک، هرچه آب کمتر غلیظ‌تر */
  const dens = clamp(brine() / 26, 0, 1);
  ctx.fillStyle = P.salt;
  const n = Math.round(6 + dens * 40);
  for (let i = 0; i < n; i++) {
    const px = POT.x + 8 + ((i * 37) % (POT.w - 16));
    const py = POT.y + POT.h - 6 - ((i * 23) % Math.max(6, wh - 8));
    ctx.beginPath(); ctx.arc(px, py, 1.8, 0, TAU); ctx.fill();
  }
  if (boiling) {
    for (let i = 0; i < 8; i++) {
      const ph = (S.t * 1.5 + i * .23) % 1;
      ctx.fillStyle = 'rgba(255,255,255,.65)';
      ctx.beginPath(); ctx.arc(POT.x + 14 + i * 20, POT.y + POT.h - ph * Math.max(8, wh), 3 + ph * 3, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(POT.x, POT.y, POT.w, POT.h, 8); ctx.stroke();
  if (S.heat) {
    for (let i = 0; i < 4; i++) {
      const w = 1 + Math.sin(S.t * 9 + i) * .12;
      ctx.fillStyle = i % 2 ? P.fireLt : P.fire;
      ctx.beginPath(); ctx.ellipse(POT.x + 26 + i * 42, POT.y + POT.h + 16, 10 * w, 18 * w, 0, 0, TAU); ctx.fill();
    }
  }
  /* لیوانِ آبِ جمع‌شده */
  ctx.fillStyle = P.glass;
  ctx.beginPath(); rrPath(CUP.x, CUP.y, CUP.w, CUP.h, 7); ctx.fill();
  const ch = CUP.h * clamp(S.collected / 100, 0, 1);
  ctx.fillStyle = P.waterLt;
  ctx.fillRect(CUP.x + 2, CUP.y + CUP.h - ch, CUP.w - 4, ch);
  ctx.strokeStyle = 'rgba(90,130,140,.8)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(CUP.x, CUP.y, CUP.w, CUP.h, 7); ctx.stroke();
  text('آبِ جمع‌شده', CUP.x + CUP.w / 2, CUP.y + CUP.h + 20, { size: 13, color: P.inkSoft });

  /* عددها */
  const yy = A.y + 66;
  numText('دما: ' + faNum(S.temp, 0) + '°', A.x + 96, yy, { size: 15, color: boiling ? P.fire : P.ink });
  numText('آبِ ظرف: ' + faNum(S.water, 0), A.x + 250, yy, { size: 15, color: P.ink });
  numText('نمکِ ظرف: ' + faNum(S.salt, 0) + ' گرم', A.x + 96, yy + 26, { size: 14, color: P.inkSoft });
  numText('شوری: ' + (S.water > 0 ? faNum(brine(), 1) : '—'), A.x + 260, yy + 26,
    { size: 14, color: brine() > 12 ? P.bad : P.inkSoft });
  numText('جمع‌شده: ' + faNum(S.collected, 0), A.x + A.w / 2, yy + 52, { size: 15, color: P.accent });
  text('نمک در ' + fa(BOIL_SALT) + ' درجه می‌جوشد؛ در ' + fa(BOIL_W) + ' درجه بخار نمی‌شود.',
    A.x + A.w / 2, A.y + 448, { size: 13, color: P.inkSoft });

  button(BTN_HEAT, S.heat ? 'شعله خاموش' : 'شعله روشن', {
    hot: S.hover && S.hover.k === 'heat', fill: S.heat ? '#a8410c' : '#2f7f96', hotFill: '#e8702a', size: 19 });
  button(BTN_RESET_A, 'از نو', {
    hot: S.hover && S.hover.k === 'resetA', fill: '#5c6870', hotFill: '#77848d', size: 19 });
  button(BTN_TASTE_POT, 'آبِ ظرف را بچش', {
    hot: S.hover && S.hover.k === 'tp', fill: '#7a6a3c', hotFill: '#9a874c', size: 16 });
  button(BTN_TASTE_CUP, 'آبِ جمع‌شده را بچش', {
    hot: S.hover && S.hover.k === 'tc', fill: '#3c7f8f', hotFill: '#4fa3b8', size: 16 });
  if (S.tasted >= 0) {
    const salty = S.tasted === 0;
    ctx.fillStyle = salty ? 'rgba(192,74,52,.14)' : 'rgba(78,159,108,.16)';
    ctx.beginPath(); rrPath(A.x + 22, A.y + 604, A.w - 44, 32, 8); ctx.fill();
    text(salty ? 'شور است — نمک ته ظرف مانده.' : 'شور نیست — نمک با بخار بالا نیامد.',
      A.x + A.w / 2, A.y + 620, { size: 15, color: salty ? P.bad : P.good });
  }
}

/* ── ایستگاه ۲: نفوذ در خاک ── */
function drawSoak() {
  text('نفوذ در خاک', B.x + B.w - 18, B.y + 30, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  numText('گذشتِ زمان: ' + faNum(S.soakT, 1) + ' ساعت', B.x + B.w / 2, B.y + 62,
    { size: 15, color: S.soaking ? P.accent : P.inkSoft });
  for (let i = 0; i < 3; i++) {
    const b = soilCol(i), so = SOILS[i];
    /* ستونِ خاک */
    ctx.fillStyle = P.glass;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 8); ctx.fill();
    ctx.save();
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 8); ctx.clip();
    ctx.fillStyle = so.d;
    ctx.fillRect(b.x, b.y + 74, b.w, b.h);
    ctx.fillStyle = so.c;
    ctx.fillRect(b.x, b.y + 74, b.w, b.h - 74 - 20);
    /* دانه‌بندی: رُس ریز، ماسه درشت */
    ctx.fillStyle = so.d;
    const gs = i === 0 ? 2 : (i === 1 ? 3.4 : 5);
    for (let k = 0; k < 90; k++) {
      const px = b.x + ((k * 29) % b.w), py = b.y + 80 + ((k * 47) % (b.h - 90));
      ctx.beginPath(); ctx.arc(px, py, gs, 0, TAU); ctx.fill();
    }
    /* آبِ روی خاک */
    const left = POUR_MM - S.soak[i];
    const wh = 70 * clamp(left / POUR_MM, 0, 1);
    ctx.fillStyle = P.water;
    ctx.fillRect(b.x, b.y + 74 - wh, b.w, wh);
    ctx.fillStyle = P.waterLt;
    if (wh > 2) ctx.fillRect(b.x, b.y + 74 - wh, b.w, 3);
    /* آبی که فرو رفته، خاک را تیره می‌کند */
    const wet = clamp(S.soak[i] / POUR_MM, 0, 1);
    ctx.fillStyle = 'rgba(30, 60, 80, .3)';
    ctx.fillRect(b.x, b.y + 74, b.w, (b.h - 74) * wet);
    ctx.restore();
    ctx.strokeStyle = 'rgba(90,130,140,.8)'; ctx.lineWidth = 2.4;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 8); ctx.stroke();
    text(so.n, b.x + b.w / 2, b.y + b.h + 22, { size: 14, family: 'Lalezar', color: P.ink });
    numText(faNum(so.rate, 0) + ' م‌م بر ساعت', b.x + b.w / 2, b.y + b.h + 44, { size: 12, color: P.inkSoft });
    if (S.soak[i] >= POUR_MM) {
      ctx.fillStyle = P.good;
      ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y - 14, 9, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.x + b.w / 2 - 4, b.y - 14); ctx.lineTo(b.x + b.w / 2 - 1, b.y - 11);
      ctx.lineTo(b.x + b.w / 2 + 4, b.y - 18); ctx.stroke();
    }
  }
  button(BTN_POUR, S.soaking ? 'می‌رود…' : 'آب بریز', {
    hot: S.hover && S.hover.k === 'pour', fill: '#2f7f96', hotFill: '#4fa3b8', size: 19 });
  button(BTN_RESET_B, 'از نو', {
    hot: S.hover && S.hover.k === 'resetB', fill: '#5c6870', hotFill: '#77848d', size: 19 });
  const done = S.soak.filter((v) => v >= POUR_MM).length;
  if (done === 3) {
    ctx.fillStyle = 'rgba(78,159,108,.16)';
    ctx.beginPath(); rrPath(B.x + 22, B.y + 552, B.w - 44, 56, 10); ctx.fill();
    text('ماسه زودتر از همه، رُس دیرتر از همه.', B.x + B.w / 2, B.y + 572, { size: 15, color: P.good });
    text('برای همین آبِ باران روی خاکِ رُس می‌ماند.', B.x + B.w / 2, B.y + 594, { size: 13, color: P.inkSoft });
  }
}

/* ── ایستگاه ۳: آبِ شیرینِ زمین ── */
function drawShare() {
  text('آبِ شیرینِ زمین', C.x + C.w - 18, C.y + 30, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  const g = GRID100, cell = g.w / 10;
  for (let i = 0; i < 100; i++) {
    const cx = g.x + (i % 10) * cell, cy = g.y + Math.floor(i / 10) * cell;
    const fresh = i >= SALT_PCT;
    ctx.fillStyle = fresh ? P.waterLt : P.waterDk;
    ctx.beginPath(); rrPath(cx + 2, cy + 2, cell - 4, cell - 4, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); rrPath(cx + 2, cy + 2, cell - 4, cell - 4, 4); ctx.stroke();
  }
  numText(fa(SALT_PCT) + ' خانه شور', g.x + 96, g.y + g.h + 24, { size: 15, color: P.waterDk });
  numText(fa(FRESH_PCT) + ' خانه شیرین', g.x + 240, g.y + g.h + 24, { size: 15, color: '#2f7f96' });

  /* سطل، لیوان، قاشق */
  const by = C.y + 440;
  if (S.showFresh) {
    /* سطلِ ده‌لیتری */
    ctx.fillStyle = P.steel;
    ctx.beginPath();
    ctx.moveTo(C.x + 40, by); ctx.lineTo(C.x + 116, by);
    ctx.lineTo(C.x + 106, by + 74); ctx.lineTo(C.x + 50, by + 74); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.waterDk;
    ctx.beginPath();
    ctx.moveTo(C.x + 44, by + 12); ctx.lineTo(C.x + 112, by + 12);
    ctx.lineTo(C.x + 104, by + 70); ctx.lineTo(C.x + 52, by + 70); ctx.closePath(); ctx.fill();
    text('سطلِ ' + fa(10) + ' لیتری', C.x + 78, by + 92, { size: 12, color: P.inkSoft });
    text('همهٔ آبِ شور', C.x + 78, by + 110, { size: 12, color: P.waterDk });
    /* لیوان */
    ctx.fillStyle = P.glass;
    ctx.beginPath(); rrPath(C.x + 168, by + 18, 52, 56, 5); ctx.fill();
    ctx.fillStyle = P.waterLt;
    ctx.fillRect(C.x + 171, by + 30, 46, 42);
    ctx.strokeStyle = 'rgba(90,130,140,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(C.x + 168, by + 18, 52, 56, 5); ctx.stroke();
    text('یک لیوان', C.x + 194, by + 92, { size: 12, color: P.inkSoft });
    text('همهٔ آبِ شیرین', C.x + 194, by + 110, { size: 12, color: '#2f7f96' });
    /* قاشقِ چای‌خوری */
    ctx.fillStyle = P.steelLt;
    ctx.beginPath(); ctx.ellipse(C.x + 292, by + 44, 20, 13, -.25, 0, TAU); ctx.fill();
    ctx.strokeStyle = P.steelLt; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(C.x + 306, by + 36); ctx.lineTo(C.x + 336, by + 20); ctx.stroke();
    ctx.fillStyle = P.waterLt;
    ctx.beginPath(); ctx.ellipse(C.x + 290, by + 44, 11, 6, -.25, 0, TAU); ctx.fill();
    text('نصفِ قاشقِ چای‌خوری', C.x + 300, by + 92, { size: 12, color: P.inkSoft });
    text('آبی که به کار می‌آید', C.x + 300, by + 110, { size: 12, color: P.good });
  } else {
    text('برای دیدنِ همین نسبت با سطل و لیوان و قاشق، دکمه را بزن.',
      C.x + C.w / 2, by + 50, { size: 14, color: 'rgba(32,48,58,.45)' });
  }
  button(BTN_ZOOM, S.showFresh ? 'برگرد به صد خانه' : 'با سطل و لیوان نشان بده', {
    hot: S.hover && S.hover.k === 'zoom', fill: '#2f7f96', hotFill: '#4fa3b8', size: 18 });
}

function draw() {
  beginScene(P.benchLo);
  const layer = staticLayer('back', SCENE_W, SCENE_H, paintBackStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawSteps();
  drawDistill();
  drawSoak();
  drawShare();
  bits.draw();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 520;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 56, w, 42, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 35, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.09, 'rgba(6, 18, 26, .42)', 0, .1);
}

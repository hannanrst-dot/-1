/*!
title: آزمایشگاهِ برچسبِ خوراکی — خوراکی‌ها (آزمایش)
bg: #1a2630
*/

/* ═══════════════════════════════════════════════════════════════════════
   آزمایشگاهِ برچسبِ خوراکی — علومِ سوم، درس ۲ «خوراکی‌ها»  (آزمایش)

   کتاب می‌گوید: «به برچسبِ سیبِ سلامت که روی بسته‌بندی‌ها قرار دارد
   توجّه کنید… اگر روی برچسبِ سیبِ سلامت، یک سطر قرمز یا دو سطر رنگِ زرد
   باشد، یعنی باید در مصرفِ آن خوراکی احتیاط کرد.»

   این آزمایش همان کار را مرحله‌به‌مرحله و با عددهای واقعی انجام می‌دهد:

   ۱) خوراکی را روی ترازو بگذار تا دقیقاً ۱۰۰ گرم شود. (چرا ۱۰۰ گرم؟
      چون برچسب همیشه «در هر ۱۰۰ گرم» را می‌گوید؛ وگرنه مقایسهٔ دو
      خوراکی با هم بی‌معنی است — ترازو خودش این را یاد می‌دهد.)
   ۲) سه لولهٔ نمک و قند و چربی به اندازهٔ همان ۱۰۰ گرم پر می‌شود.
   ۳) هر لوله را روی خط‌کشِ رنگی بخوان: سبز، زرد یا قرمز.
   ۴) سطرهای برچسب را خودت رنگ کن.
   ۵) قانون: یک قرمز یا دو زرد ⟵ احتیاط.

   عددهای مرزِ رنگ‌ها ساختگی نیستند؛ همان مرزهای چراغِ راهنماییِ
   تغذیه‌اند که سیبِ سلامت هم از آن‌ها استفاده می‌کند (در هر ۱۰۰ گرم):
      چربی : تا ۳ سبز، تا ۱۷٫۵ زرد، بیشتر قرمز
      قند  : تا ۵ سبز، تا ۲۲٫۵ زرد، بیشتر قرمز
      نمک  : تا ۰٫۳ سبز، تا ۱٫۵ زرد، بیشتر قرمز
   برای نوشیدنی‌ها مرزِ چربی و قند نصف می‌شود (در هر ۱۰۰ میلی‌لیتر)،
   ولی مرزِ نمک نصف نمی‌شود — همان‌طور که در قانونِ واقعی است.

   مقدارهای هر خوراکی هم از مقدارهای واقعیِ همان خوراکی گرفته شده‌اند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  bench:  '#2a3a46', benchLo: '#1a2630', benchHi: '#3b4f5e',
  steel:  '#8d99a3', steelDk: '#5c6870', steelLt: '#c3ced6',
  glass:  'rgba(206, 232, 239, .5)',
  paper:  '#fbfaf2', card: '#ffffff',
  ink:    '#25302a', inkSoft: '#7d8a80',
  green:  '#3f9a4e', greenD: '#256b30',
  amber:  '#e0a422', amberD: '#a4740c',
  red:    '#c8402c', redD:   '#8e2716',
  gold:   '#c9962c', accent: '#4fa3b8',
  good:   '#4e8f5c', bad: '#c04a34',
};

/* ───────── قانونِ رنگِ برچسب ─────────
   مرزها «در هر ۱۰۰ گرم»؛ برای نوشیدنی «در هر ۱۰۰ میلی‌لیتر»، و مرزِ
   چربی و قند نصف می‌شود ولی مرزِ نمک نه.                             */

const NUTS = [
  /* half: آیا برای نوشیدنی مرز نصف می‌شود؟ چربی و قند بله، نمک نه. */
  { id: 'charbi', n: 'چربی', unit: 'گرم', g: 3,  a: 17.5, max: 40, half: 1 },
  { id: 'ghand',  n: 'قند',  unit: 'گرم', g: 5,  a: 22.5, max: 60, half: 1 },
  { id: 'namak',  n: 'نمک',  unit: 'گرم', g: .3, a: 1.5,  max: 4,  half: 0 },
];

/** مرزهای سبز و زردِ یک ماده برای این خوراکی. */
function limits(k, drink) {
  const nu = NUTS[k];
  const d = drink && nu.half ? 2 : 1;
  return [nu.g / d, nu.a / d];
}
/** رنگِ یک سطر: ۰ سبز، ۱ زرد، ۲ قرمز. */
function bandOf(k, val, drink) {
  const lm = limits(k, drink);
  if (val <= lm[0]) return 0;
  if (val <= lm[1]) return 1;
  return 2;
}
/** قانونِ کتاب: یک قرمز یا دو زرد ⟵ احتیاط. */
function needCare(bands) {
  const red = bands.filter((b) => b === 2).length;
  const amber = bands.filter((b) => b === 1).length;
  return red >= 1 || amber >= 2;
}

/* ───────── خوراکی‌ها ─────────
   v = [چربی، قند، نمک] در هر ۱۰۰ گرم (یا ۱۰۰ میلی‌لیتر برای نوشیدنی). */

const ITEMS = [
  { id: 'shir',    n: 'شیرِ کم‌چرب',   v: [1.5, 4.8, .1],   drink: 1 , por: 240, porN: 'لیوان' },
  { id: 'ab',      n: 'آبِ آشامیدنی',  v: [0, 0, 0],        drink: 1 , por: 240, porN: 'لیوان' },
  { id: 'nushabe', n: 'نوشابه',        v: [0, 10.6, .01],   drink: 1 , por: 330, porN: 'قوطی' },
  { id: 'abmive',  n: 'آبِ پرتقال',    v: [.2, 8.4, .01],   drink: 1 , por: 240, porN: 'لیوان' },
  { id: 'doogh',   n: 'دوغ',           v: [1, 2.6, .8],     drink: 1 , por: 240, porN: 'لیوان' },
  { id: 'mast',    n: 'ماست',          v: [3.3, 4.7, .1],   drink: 0 , por: 150, porN: 'کاسه' },
  { id: 'panir',   n: 'پنیرِ سفید',    v: [22, .5, 2.1],    drink: 0 , por: 30, porN: 'تکّه' },
  { id: 'nan',     n: 'نانِ سنگک',     v: [1.2, 2.2, 1.1],  drink: 0 , por: 120, porN: 'نان' },
  { id: 'sib',     n: 'سیب',           v: [.2, 10.4, 0],    drink: 0 , por: 180, porN: 'سیب' },
  { id: 'khiar',   n: 'خیار',          v: [.1, 1.7, 0],     drink: 0 , por: 130, porN: 'خیار' },
  { id: 'morgh',   n: 'مرغِ پخته',     v: [7.4, 0, .2],     drink: 0 , por: 100, porN: 'تکّه' },
  { id: 'adas',    n: 'عدسِ پخته',     v: [.4, 1.8, 0],     drink: 0 , por: 180, porN: 'کاسه' },
  { id: 'chips',   n: 'چیپس',          v: [34, .3, 1.5],    drink: 0 , por: 60, porN: 'بسته' },
  { id: 'pofak',   n: 'پفک',           v: [28, 2, 2.4],     drink: 0 , por: 60, porN: 'بسته' },
  { id: 'shokolat',n: 'شکلاتِ شیری',   v: [30, 52, .2],     drink: 0 , por: 40, porN: 'تکّه' },
  { id: 'biscuit', n: 'بیسکویت',       v: [17, 22, .8],     drink: 0 , por: 50, porN: 'بسته' },
  { id: 'keik',    n: 'کیکِ خامه‌ای',  v: [20, 33, .5],     drink: 0 , por: 80, porN: 'برش' },
  { id: 'sosis',   n: 'سوسیس',         v: [24, 1.2, 2.2],   drink: 0 , por: 60, porN: 'عدد' },
  { id: 'khorma',  n: 'خرما',          v: [.4, 63, 0],      drink: 0 , por: 25, porN: 'سه عدد' },
  { id: 'gerdu',   n: 'گردو',          v: [65, 2.6, 0],     drink: 0 , por: 30, porN: 'مشت' },
];

/* ───────── مرحله‌های آزمایش ───────── */

const STEPS = [
  { n: 'خوراکی', t: 'یک خوراکی از قفسه بردار.' },
  { n: 'ترازو',  t: 'روی ترازو دقیقاً ۱۰۰ گرم بریز.' },
  { n: 'لوله‌ها', t: 'ببین در این ۱۰۰ گرم چه‌قدر نمک و قند و چربی هست.' },
  { n: 'برچسب',  t: 'هر سطر را از روی خط‌کشِ رنگی، خودت رنگ کن.' },
  { n: 'قانون',  t: 'یک قرمز یا دو زرد ⟵ احتیاط. حکم را بزن.' },
];

const S = {
  stepI: 0,
  item: -1,             /* شمارهٔ خوراکیِ انتخاب‌شده */
  pour: 0,              /* گرمِ روی ترازو */
  pouring: 0,           /* ۱ وقتی انگشت روی دکمهٔ ریختن است */
  poured: false,        /* ۱۰۰ گرم دقیق شد */
  tubes: 0,             /* جانِ پر شدنِ لوله‌ها */
  mark: [-1, -1, -1],   /* رنگی که بچّه برای هر سطر انتخاب کرده */
  markT: [0, 0, 0],
  wrong: [0, 0, 0],
  verdict: null,        /* {pick, ok} */
  book: [],             /* خوراکی‌هایی که کارشان تمام شده */
  t: 0, hover: null, tip: '', tipT: 0, flash: 0, shake: 0,
};

const bits = new Bits();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const IT = () => ITEMS[S.item];
const vals = () => IT().v;
const trueBands = () => vals().map((v, k) => bandOf(k, v, IT().drink));

/* ───────── جای‌ها ───────── */

const SHELF = { x: 24, y: 96, w: 300, h: 640 };
const BENCH = { x: 344, y: 96, w: 430, h: 640 };
const LABEL = { x: 794, y: 96, w: 382, h: 640 };

function shelfCard(i) {
  const col = i % 2, row = Math.floor(i / 2);
  return { x: SHELF.x + 12 + col * 140, y: SHELF.y + 44 + row * 60, w: 132, h: 52 };
}
const SCALE = { x: BENCH.x + 40, y: BENCH.y + 76, w: 350, h: 162 };
const BTN_POUR = { x: BENCH.x + 34, y: BENCH.y + 250, w: 168, h: 54 };
const BTN_ZERO = { x: BENCH.x + 218, y: BENCH.y + 250, w: 158, h: 54 };
function tube(k) {
  return { x: BENCH.x + 44 + k * 118, y: BENCH.y + 332, w: 68, h: 190 };
}
const PORTION = { x: BENCH.x + 20, y: BENCH.y + 562, w: BENCH.w - 40, h: 56 };
function labRow(k) {
  return { x: LABEL.x + 20, y: LABEL.y + 104 + k * 112, w: LABEL.w - 40, h: 98 };
}
function swatch(k, c) {
  const r = labRow(k);
  return { x: r.x + 14 + c * 62, y: r.y + 52, w: 54, h: 36 };
}
const BTN_OK = { x: LABEL.x + 24, y: LABEL.y + 476, w: 160, h: 58 };
const BTN_CARE = { x: LABEL.x + 198, y: LABEL.y + 476, w: 160, h: 58 };
const BTN_NEW = { x: LABEL.x + 24, y: LABEL.y + 570, w: LABEL.w - 48, h: 50 };

/* ───────── کار با آزمایش ───────── */

function tip(msg) { S.tip = msg; S.tipT = 3.6; }

function chooseItem(i) {
  S.item = i;
  S.pour = 0; S.poured = false; S.pouring = 0; S.tubes = 0;
  S.mark = [-1, -1, -1]; S.markT = [0, 0, 0]; S.wrong = [0, 0, 0];
  S.verdict = null;
  S.stepI = 1;
  sfx.tap();
}

function zero() {
  S.pour = 0; S.poured = false; S.tubes = 0;
  S.mark = [-1, -1, -1]; S.wrong = [0, 0, 0]; S.verdict = null;
  S.stepI = Math.min(S.stepI, 1);
  sfx.tap();
}

/* پنجرهٔ پذیرش و آستانهٔ سرریز — به‌اندازهٔ کافی باز، تا بازی «مسابقهٔ
   انگشت» نشود؛ ولی به‌اندازهٔ کافی تنگ، که «دقیقاً ۱۰۰ گرم» معنی بدهد. */
const OK_LO = 98.5, OK_HI = 101.5, OVER = 103.5, TOP = 115;

/** سرعتِ ریختن — نزدیکِ ۱۰۰ کُند می‌شود، مثلِ ریختنِ با احتیاط. */
function pourRate(g) {
  if (g < 82) return 52;
  return lerp(52, 7, clamp((g - 82) / 16, 0, 1));
}

/** ریختنِ خوراکی روی ترازو — از ۱۰۰ که خیلی رد شود باید صفر کند. */
function pourStep(dt) {
  if (!S.pouring || S.item < 0 || S.poured) return;
  S.pour = Math.min(TOP, S.pour + dt * pourRate(S.pour));
  if (S.pour > OVER) {
    S.pouring = 0; S.flash = 1; sfx.nope();
    tip('از ۱۰۰ گرم گذشت؛ ترازو را صفر کن.');
  }
}

function settle() {
  /* وقتی دست را برداشتی، اگر روی ۱۰۰ ایستاده باشی آزمایش جلو می‌رود */
  if (S.item < 0 || S.poured) return;
  if (S.pour >= OK_LO && S.pour <= OK_HI) {
    S.pour = 100; S.poured = true; S.tubes = 0.0001;
    S.stepI = Math.max(S.stepI, 2);
    sfx.good();
  } else if (S.pour > OK_HI) {
    tip('بیشتر از ۱۰۰ گرم شد؛ صفر کن و دوباره.');
  } else if (S.pour > 0) {
    tip('هنوز به ۱۰۰ گرم نرسیده؛ باز هم بریز.');
  }
}

function markRow(k, c) {
  if (!S.poured) { tip('اوّل ۱۰۰ گرم را بریز.'); S.flash = 1; sfx.nope(); return; }
  if (S.tubes < 1) { tip('صبر کن لوله‌ها پر شوند.'); return; }
  const right = trueBands()[k];
  if (c === right) {
    S.mark[k] = c; S.markT[k] = 0; sfx.place();
    const r = labRow(k);
    bits.spark(r.x + r.w / 2, r.y + r.h / 2, 10, ['#fff', [P.green, P.amber, P.red][c]]);
    if (S.mark.every((m) => m >= 0)) { S.stepI = Math.max(S.stepI, 4); sfx.good(); }
  } else {
    S.wrong[k] = 1; sfx.nope(); S.shake = .14;
    tip('لوله را با خط‌کشِ کنارش بسنج.');
  }
}

function judge(care) {
  if (S.mark.some((m) => m < 0)) { tip('اوّل هر سه سطر را رنگ کن.'); S.flash = 1; sfx.nope(); return; }
  const right = needCare(trueBands());
  const ok = care === right;
  S.verdict = { pick: care, ok };
  if (ok) {
    sfx.win();
    if (S.book.indexOf(S.item) < 0) S.book.push(S.item);
    bits.confetti(LABEL.x + LABEL.w / 2, LABEL.y + 300, 26, [P.green, P.amber, P.gold, '#fff']);
  } else {
    sfx.nope(); S.shake = .16;
    tip('قانون را دوباره بخوان: یک قرمز، یا دو زرد.');
  }
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.flash > 0) S.flash -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  for (let k = 0; k < 3; k++) {
    if (S.wrong[k] > 0) S.wrong[k] = Math.max(0, S.wrong[k] - dt * 1.6);
    if (S.mark[k] >= 0 && S.markT[k] < 1) S.markT[k] += dt * 3;
  }
  pourStep(dt);
  if (S.tubes > 0 && S.tubes < 1) S.tubes = Math.min(1, S.tubes + dt * .9);
  bits.step(dt);
  draw();
}

whenFontsReady(() => runLoop(step));

/* ───────── ورودی ───────── */

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  for (let i = 0; i < ITEMS.length; i++) if (inRect(p, shelfCard(i))) S.hover = { k: 'item', i };
  if (inRect(p, BTN_POUR)) S.hover = { k: 'pour' };
  if (inRect(p, BTN_ZERO)) S.hover = { k: 'zero' };
  if (inRect(p, BTN_OK)) S.hover = { k: 'ok' };
  if (inRect(p, BTN_CARE)) S.hover = { k: 'care' };
  if (inRect(p, BTN_NEW)) S.hover = { k: 'new' };
  for (let k = 0; k < 3; k++) for (let c = 0; c < 3; c++) if (inRect(p, swatch(k, c))) S.hover = { k: 'sw', r: k, c };
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  for (let i = 0; i < ITEMS.length; i++) if (inRect(p, shelfCard(i))) { chooseItem(i); return; }
  if (inRect(p, BTN_ZERO)) { zero(); return; }
  if (inRect(p, BTN_POUR)) {
    if (S.item < 0) { tip('اوّل یک خوراکی بردار.'); S.flash = 1; sfx.nope(); return; }
    if (S.poured) { tip('۱۰۰ گرم آماده است.'); return; }
    S.pouring = 1;
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    return;
  }
  for (let k = 0; k < 3; k++) for (let c = 0; c < 3; c++) if (inRect(p, swatch(k, c))) { markRow(k, c); return; }
  if (inRect(p, BTN_OK)) { judge(false); return; }
  if (inRect(p, BTN_CARE)) { judge(true); return; }
  if (inRect(p, BTN_NEW)) { S.item = -1; S.stepI = 0; zero(); return; }
});

function endPour() { if (S.pouring) { S.pouring = 0; settle(); } }
cv.addEventListener('pointerup', endPour);
cv.addEventListener('pointercancel', () => { S.pouring = 0; });
cv.addEventListener('pointerleave', () => { S.pouring = 0; });
addEventListener('blur', () => { S.pouring = 0; });

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

/** عددِ اعشاری با ممیزِ فارسی. */
function faNum(v, d) {
  const s = d === 0 ? String(Math.round(v)) : v.toFixed(d).replace(/\.?0+$/, '');
  return fa(s).replace('.', '٫');
}

const BAND_C = [P.green, P.amber, P.red];
const BAND_D = [P.greenD, P.amberD, P.redD];
const BAND_N = ['سبز', 'زرد', 'قرمز'];

/* ───────── شکلِ خوراکی‌ها ───────── */

function itemIcon(id, s) {
  ctx.save();
  ctx.scale(s, s);
  const ell = (x, y, rx, ry, rot, col) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill();
  };
  const bottle = (body, cap) => {
    ctx.fillStyle = body;
    ctx.beginPath(); rrPath(-8, -8, 16, 22, 4); ctx.fill();
    ctx.fillStyle = cap; ctx.fillRect(-4, -16, 8, 9);
  };
  switch (id) {
    case 'shir': bottle('#eef4f8', '#4a86c4'); break;
    case 'ab': bottle('rgba(180,220,235,.85)', '#5aa8c4'); break;
    case 'nushabe': bottle('#4a2b18', '#c0392b'); break;
    case 'abmive': bottle('#e8912c', '#7a4a18'); break;
    case 'doogh': bottle('#f3f6f2', '#7fa356'); break;
    case 'mast': ctx.fillStyle = '#4a86c4';
      ctx.beginPath(); ctx.moveTo(-12, -6); ctx.lineTo(12, -6); ctx.lineTo(9, 12); ctx.lineTo(-9, 12); ctx.closePath(); ctx.fill();
      ell(0, -6, 12, 3.6, 0, '#fbfdff'); break;
    case 'panir': ctx.fillStyle = '#f7f2df';
      ctx.beginPath(); ctx.moveTo(-13, 8); ctx.lineTo(-4, -9); ctx.lineTo(13, -9); ctx.lineTo(13, 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e2d8b8';
      ctx.beginPath(); ctx.moveTo(-13, 8); ctx.lineTo(-4, -9); ctx.lineTo(-4, 3); ctx.closePath(); ctx.fill(); break;
    case 'nan': ell(0, 0, 15, 8, -.2, '#d9a441'); ell(-3, -2, 10, 4.4, -.2, '#eec27a'); break;
    case 'sib': ell(0, 2, 10, 11, 0, '#cf4436'); ell(-3, -2, 4, 4, 0, '#e8837a');
      ctx.strokeStyle = '#6b4a2c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(1, -14); ctx.stroke(); break;
    case 'khiar': ell(0, 0, 5.5, 13, .35, '#5da24e'); ell(-1.4, -2, 2.6, 8, .35, '#8fc97a'); break;
    case 'morgh': ell(1, 1, 11, 8, -.15, '#c98a5e'); ell(1, 3, 9.4, 4.6, -.15, '#a86a3e'); break;
    case 'adas': for (const [x, y] of [[-6, -4], [1, -6], [6, -3], [-4, 2], [3, 1], [-1, 7]]) ell(x, y, 3.6, 2.8, .3, '#9b7f3f'); break;
    case 'chips': ctx.fillStyle = '#e8b25a';
      for (const [x, y, r] of [[-5, 2, .3], [4, -2, -.4], [0, 6, .1]]) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(r);
        ctx.beginPath(); ctx.ellipse(0, 0, 8, 5, 0, 0, TAU); ctx.fill(); ctx.restore(); } break;
    case 'pofak': ctx.fillStyle = '#e8a13a';
      for (const [x, y] of [[-6, 2], [2, -3], [6, 4]]) {
        ctx.beginPath(); ctx.ellipse(x, y, 7, 3.4, .5, 0, TAU); ctx.fill(); } break;
    case 'shokolat': ctx.fillStyle = '#5b3a22';
      ctx.beginPath(); rrPath(-13, -8, 26, 17, 3); ctx.fill();
      ctx.strokeStyle = '#3d2513'; ctx.lineWidth = 1.6;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 8.6, -8); ctx.lineTo(i * 8.6, 9); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-13, .5); ctx.lineTo(13, .5); ctx.stroke(); break;
    case 'biscuit': ell(0, 0, 12, 12, 0, '#d9a962');
      ctx.fillStyle = '#a87b3c';
      for (const [x, y] of [[-4, -3], [4, -1], [0, 5], [-5, 4]]) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, TAU); ctx.fill(); } break;
    case 'keik': ctx.fillStyle = '#c98a5e';
      ctx.beginPath(); ctx.moveTo(-12, 10); ctx.lineTo(-9, -4); ctx.lineTo(9, -4); ctx.lineTo(12, 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fbf3e6'; ell(0, -5, 11, 5, 0, '#fbf3e6');
      ell(0, -11, 4, 4, 0, '#cf4436'); break;
    case 'sosis': ctx.fillStyle = '#c4645c';
      ctx.beginPath(); rrPath(-14, -5, 28, 11, 5.5); ctx.fill();
      ctx.fillStyle = '#d98d84';
      ctx.beginPath(); rrPath(-11, -3.4, 20, 4, 2); ctx.fill(); break;
    case 'khorma': for (const [x, y] of [[-5, 0], [4, -2], [1, 6]]) ell(x, y, 6.4, 4.4, .4, '#6b3b1e'); break;
    case 'gerdu': ell(0, 0, 11, 10.6, 0, '#b98a56'); ell(0, 0, 8.4, 8.4, 0, '#d9b183');
      ctx.strokeStyle = '#9c6d3c'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(s * 6, -1, 0, 3); ctx.stroke(); } break;
    default: ell(0, 0, 10, 10, 0, '#999');
  }
  ctx.restore();
}

/* ───────── نقاشیِ صحنه ───────── */

function paintBenchStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.benchHi); g.addColorStop(1, P.benchLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  /* کاشیِ آزمایشگاه */
  ctx.strokeStyle = 'rgba(255,255,255,.045)'; ctx.lineWidth = 2;
  for (let x = 0; x < SCENE_W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SCENE_H); ctx.stroke(); }
  for (let y = 0; y < SCENE_H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke(); }
  for (const b of [SHELF, BENCH, LABEL]) {
    ctx.fillStyle = 'rgba(255, 253, 244, .95)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(20, 34, 42, .18)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 16); ctx.stroke();
  }
}

function drawSteps() {
  for (let i = 0; i < STEPS.length; i++) {
    const w = 146, x = SCENE_W - 24 - (i + 1) * (w + 8) + 8, y = 16, h = 44;
    const on = i === S.stepI, done = i < S.stepI;
    ctx.fillStyle = on ? P.accent : (done ? 'rgba(79, 163, 184, .28)' : 'rgba(255,255,255,.1)');
    ctx.beginPath(); rrPath(x, y, w, h, 12); ctx.fill();
    numText(fa(i + 1), x + w - 20, y + h / 2, { size: 15, color: on ? '#fff' : 'rgba(255,255,255,.6)' });
    text(STEPS[i].n, x + w / 2 + 6, y + h / 2,
      { size: 16, family: 'Lalezar', color: on ? '#fff' : 'rgba(255,255,255,.62)' });
  }
  /* راهنمای مرحله سمتِ چپ می‌ماند و به نوارِ مرحله‌ها نمی‌خورد */
  ctx.save();
  ctx.beginPath(); ctx.rect(16, 12, 350, 52); ctx.clip();
  text(STEPS[S.stepI].t, 366, 39, { size: 16, color: 'rgba(255,255,255,.82)', align: 'right' });
  ctx.restore();
}

function drawShelf() {
  text('قفسه', SHELF.x + SHELF.w - 16, SHELF.y + 26, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  for (let i = 0; i < ITEMS.length; i++) {
    const c = shelfCard(i), it = ITEMS[i];
    const on = S.item === i, hot = S.hover && S.hover.k === 'item' && S.hover.i === i;
    const done = S.book.indexOf(i) >= 0;
    ctx.fillStyle = on ? 'rgba(79, 163, 184, .2)' : (hot ? 'rgba(37,48,42,.07)' : 'rgba(37, 48, 42, .035)');
    ctx.beginPath(); rrPath(c.x, c.y, c.w, c.h, 10); ctx.fill();
    ctx.strokeStyle = on ? P.accent : 'rgba(37, 48, 42, .14)'; ctx.lineWidth = on ? 2.6 : 1.2;
    ctx.beginPath(); rrPath(c.x, c.y, c.w, c.h, 10); ctx.stroke();
    ctx.save();
    ctx.translate(c.x + c.w - 26, c.y + c.h / 2);
    itemIcon(it.id, .92);
    ctx.restore();
    text(it.n, c.x + c.w - 48, c.y + c.h / 2, { size: 14, color: P.ink, align: 'right' });
    if (done) {
      ctx.strokeStyle = P.good; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(c.x + 10, c.y + c.h / 2); ctx.lineTo(c.x + 15, c.y + c.h / 2 + 5); ctx.lineTo(c.x + 24, c.y + c.h / 2 - 6);
      ctx.stroke();
    }
    if (it.drink) {
      ctx.fillStyle = 'rgba(79, 163, 184, .22)';
      ctx.beginPath(); rrPath(c.x + 8, c.y + 6, 34, 16, 8); ctx.fill();
      text('نوشیدنی', c.x + 25, c.y + 14, { size: 10, color: '#2c6070' });
    }
  }
}

function drawScale() {
  const b = SCALE;
  /* کفهٔ ترازو */
  ctx.fillStyle = P.steelLt;
  ctx.beginPath(); rrPath(b.x + 40, b.y + 54, b.w - 80, 16, 8); ctx.fill();
  ctx.fillStyle = P.steel;
  ctx.beginPath(); rrPath(b.x + 20, b.y + 70, b.w - 40, b.h - 70, 14); ctx.fill();
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(b.x + 20, b.y + b.h - 18, b.w - 40, 18, 9); ctx.fill();
  /* خوراکیِ روی کفه */
  if (S.item >= 0 && S.pour > 0) {
    const n = Math.min(14, Math.ceil(S.pour / 8.5));
    for (let i = 0; i < n; i++) {
      const a = i * 2.4;
      ctx.save();
      ctx.translate(b.x + b.w / 2 + Math.cos(a) * (10 + i * 2.6), b.y + 46 - Math.sin(a) * 6 - i * .6);
      itemIcon(IT().id, .62);
      ctx.restore();
    }
  }
  /* صفحهٔ عدد */
  const dw = 176, dx = b.x + b.w / 2 - dw / 2, dy = b.y + 84;
  ctx.fillStyle = '#16242b';
  ctx.beginPath(); rrPath(dx, dy, dw, 46, 8); ctx.fill();
  const over = S.pour > OK_HI;
  const exact = S.poured;
  numText(faNum(S.pour, 1) + ' گرم', dx + dw / 2, dy + 24,
    { size: 25, family: 'Lalezar', color: exact ? '#7fe08a' : (over ? '#ff9a86' : '#cfe8ef') });
  /* نوارِ رسیدن به ۱۰۰ — نوارِ سبزِ هدف روی آن دیده می‌شود */
  const fx = (g2) => dx + dw * clamp(g2 / TOP, 0, 1);
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(dx, dy + 52, dw, 10, 5); ctx.fill();
  ctx.fillStyle = 'rgba(63, 154, 78, .55)';
  ctx.fillRect(fx(OK_LO), dy + 52, fx(OK_HI) - fx(OK_LO), 10);
  ctx.fillStyle = 'rgba(200, 64, 44, .4)';
  ctx.fillRect(fx(OVER), dy + 52, dx + dw - fx(OVER), 10);
  ctx.save();
  ctx.beginPath(); rrPath(dx, dy + 52, dw, 10, 5); ctx.clip();
  ctx.fillStyle = exact ? P.green : (over ? P.red : P.accent);
  ctx.fillRect(dx, dy + 52, fx(S.pour) - dx, 10);
  ctx.restore();
  /* نشانهٔ ۱۰۰ گرم */
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(fx(100), dy + 46); ctx.lineTo(fx(100), dy + 66); ctx.stroke();
  numText('۱۰۰', fx(100), dy + 70, { size: 12, color: 'rgba(255,255,255,.7)' });
  if (S.flash > 0) {
    ctx.save(); ctx.globalAlpha = clamp(S.flash, 0, 1);
    ctx.strokeStyle = P.bad; ctx.lineWidth = 3;
    ctx.beginPath(); rrPath(dx - 6, dy - 6, dw + 12, 78, 10); ctx.stroke();
    ctx.restore();
  }
  /* دکمه‌ها */
  button(BTN_POUR, S.pouring ? 'می‌ریزد…' : 'بریز', {
    hot: S.hover && S.hover.k === 'pour', fill: '#3c7f8f', hotFill: '#4fa3b8', size: 22 });
  button(BTN_ZERO, 'صفر کن', {
    hot: S.hover && S.hover.k === 'zero', fill: '#7a7060', hotFill: '#948a78', size: 22 });
}

function drawTubes() {
  for (let k = 0; k < 3; k++) {
    const b = tube(k), nu = NUTS[k];
    const drink = S.item >= 0 && IT().drink;
    const lm = limits(k, drink), g = lm[0], a = lm[1];
    /* خط‌کشِ رنگی پشتِ لوله — همان مرزهای واقعی */
    const H = b.h;
    const yOf = (v) => b.y + H - (clamp(v, 0, nu.max) / nu.max) * H;
    const segs = [[0, g, 0], [g, a, 1], [a, nu.max, 2]];
    for (const [v0, v1, c] of segs) {
      ctx.fillStyle = BAND_C[c];
      ctx.save(); ctx.globalAlpha = .22;
      ctx.beginPath(); rrPath(b.x + b.w + 6, yOf(v1), 16, yOf(v0) - yOf(v1), 3); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = BAND_D[c]; ctx.lineWidth = 1.2;
      ctx.beginPath(); rrPath(b.x + b.w + 6, yOf(v1), 16, yOf(v0) - yOf(v1), 3); ctx.stroke();
    }
    /* عددِ مرزها */
    for (const v of [g, a]) {
      ctx.strokeStyle = 'rgba(37,48,42,.5)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(b.x + b.w + 2, yOf(v)); ctx.lineTo(b.x + b.w + 26, yOf(v)); ctx.stroke();
      numText(faNum(v, 1), b.x + b.w + 40, yOf(v), { size: 12, color: P.inkSoft });
    }
    /* خودِ لوله */
    ctx.fillStyle = 'rgba(206, 232, 239, .35)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
    /* پرشدگی */
    if (S.item >= 0 && S.poured) {
      const v = vals()[k] * clamp(S.tubes, 0, 1);
      const hh = (clamp(v, 0, nu.max) / nu.max) * H;
      const band = bandOf(k, vals()[k], IT().drink);
      ctx.save();
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.clip();
      ctx.fillStyle = ['#e8e4d8', '#f0e2c0', '#d8c9a8'][k];
      ctx.fillRect(b.x, b.y + H - hh, b.w, hh + 4);
      ctx.fillStyle = 'rgba(0,0,0,.08)';
      for (let y = b.y + H - hh; y < b.y + H; y += 7) ctx.fillRect(b.x, y, b.w, 2);
      ctx.restore();
      /* سطحِ مایع */
      ctx.strokeStyle = BAND_D[band]; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(b.x - 4, b.y + H - hh); ctx.lineTo(b.x + b.w + 4, b.y + H - hh); ctx.stroke();
      if (S.tubes >= 1) {
        const high = hh > H - 34;      /* اگر تا بالا پر شده، عدد را داخلِ لوله بنویس */
        numText(faNum(vals()[k], 1), b.x + b.w / 2, b.y + H - hh + (high ? 18 : -16),
          { size: 16, family: 'Lalezar', color: high ? '#5a4a2a' : P.ink });
      }
    }
    ctx.strokeStyle = 'rgba(90, 120, 130, .6)'; ctx.lineWidth = 2.4;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
    text(nu.n, b.x + b.w / 2, b.y + b.h + 22, { size: 17, family: 'Lalezar', color: P.ink });
  }
  const capY = BENCH.y + 316;
  if (S.item >= 0 && IT().drink) {
    text('در هر ۱۰۰ میلی‌لیتر', BENCH.x + BENCH.w / 2, capY, { size: 13, color: '#2c6070' });
  } else {
    text('در هر ۱۰۰ گرم', BENCH.x + BENCH.w / 2, capY, { size: 13, color: P.inkSoft });
  }
  drawPortion();
}

/* ───────── یک وعدهٔ واقعی ─────────
   برچسب همیشه «در هر ۱۰۰ گرم» را می‌گوید، ولی کسی ۱۰۰ میلی‌لیتر نوشابه
   نمی‌خورد؛ یک قوطیِ کامل می‌خورد. این تکّه همان را نشان می‌دهد و
   حبّه‌های قند را می‌شمارد — یک حبّهٔ قند حدودِ ۴ گرم است.            */

const CUBE_G = 4;

function drawPortion() {
  const b = PORTION;
  ctx.fillStyle = 'rgba(201, 150, 44, .1)';
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
  if (S.item < 0 || !S.poured || S.tubes < 1) {
    text('یک وعدهٔ واقعی، بعد از پر شدنِ لوله‌ها', b.x + b.w / 2, b.y + b.h / 2,
      { size: 13, color: 'rgba(37,48,42,.35)' });
    return;
  }
  const it = IT();
  const sug = it.v[1] * it.por / 100;
  const unit = it.drink ? 'میلی‌لیتر' : 'گرم';
  text('یک ' + it.porN + ' = ' + fa(it.por) + ' ' + unit, b.x + b.w - 14, b.y + 19,
    { size: 14, color: P.ink, align: 'right' });
  numText('قند: ' + faNum(sug, 1) + ' گرم', b.x + b.w - 156, b.y + 19,
    { size: 14, color: sug >= 20 ? P.redD : P.inkSoft, align: 'right' });
  /* حبّه‌های قند */
  const n = Math.min(14, Math.round(sug / CUBE_G));
  for (let i = 0; i < n; i++) {
    const x = b.x + 14 + i * 20, y = b.y + 32;
    ctx.fillStyle = '#fbfaf2';
    ctx.beginPath(); rrPath(x, y, 16, 14, 3); ctx.fill();
    ctx.strokeStyle = '#b8ae94'; ctx.lineWidth = 1.2;
    ctx.beginPath(); rrPath(x, y, 16, 14, 3); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 2, y + 4); ctx.lineTo(x + 13, y + 4); ctx.stroke();
  }
  if (n === 0) {
    text('تقریباً بدونِ قند', b.x + 14, b.y + 39, { size: 13, color: P.green, align: 'left' });
  } else {
    numText('≈ ' + fa(n) + ' حبّه قند', b.x + 30 + n * 20, b.y + 39,
      { size: 13, color: P.inkSoft, align: 'left' });
  }
}

function drawLabel() {
  text('برچسبِ سیبِ سلامت', LABEL.x + LABEL.w - 18, LABEL.y + 30,
    { size: 21, family: 'Lalezar', color: P.ink, align: 'right' });
  /* سیب */
  ctx.save();
  ctx.translate(LABEL.x + 44, LABEL.y + 30);
  ctx.fillStyle = '#cf4436';
  ctx.beginPath(); ctx.arc(0, 2, 13, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#6b4a2c'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(1, -18); ctx.stroke();
  ctx.fillStyle = '#5da24e';
  ctx.beginPath(); ctx.ellipse(8, -15, 7, 3.6, -.5, 0, TAU); ctx.fill();
  ctx.restore();

  if (S.item < 0) {
    text('اوّل یک خوراکی از قفسه بردار.', LABEL.x + LABEL.w / 2, LABEL.y + 200,
      { size: 16, color: 'rgba(37,48,42,.4)' });
    return;
  }
  text(IT().n, LABEL.x + LABEL.w / 2, LABEL.y + 74, { size: 22, family: 'Lalezar', color: P.accent });

  for (let k = 0; k < 3; k++) {
    const r = labRow(k), got = S.mark[k];
    ctx.fillStyle = got >= 0 ? BAND_C[got] : 'rgba(37, 48, 42, .05)';
    ctx.save();
    if (got >= 0) ctx.globalAlpha = .2 + .8 * clamp(S.markT[k], 0, 1) * .35;
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 12); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = got >= 0 ? BAND_D[got] : 'rgba(37, 48, 42, .16)';
    ctx.lineWidth = got >= 0 ? 3 : 1.4;
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 12); ctx.stroke();
    text(NUTS[k].n, r.x + r.w - 16, r.y + 26, { size: 19, family: 'Lalezar', color: P.ink, align: 'right' });
    if (S.poured && S.tubes >= 1) {
      numText(faNum(vals()[k], 1) + ' گرم', r.x + r.w - 84, r.y + 26, { size: 15, color: P.inkSoft, align: 'right' });
    }
    /* سه رنگ برای انتخاب */
    for (let c = 0; c < 3; c++) {
      const sb = swatch(k, c);
      const on = got === c;
      const hot = S.hover && S.hover.k === 'sw' && S.hover.r === k && S.hover.c === c;
      ctx.fillStyle = on ? BAND_C[c] : (hot ? BAND_C[c] : 'rgba(255,255,255,.9)');
      ctx.save();
      if (!on && !hot) ctx.globalAlpha = .55;
      ctx.beginPath(); rrPath(sb.x, sb.y, sb.w, sb.h, 8); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = BAND_D[c]; ctx.lineWidth = on ? 3 : 1.6;
      ctx.beginPath(); rrPath(sb.x, sb.y, sb.w, sb.h, 8); ctx.stroke();
      text(BAND_N[c], sb.x + sb.w / 2, sb.y + sb.h / 2, { size: 13, color: on ? '#fff' : BAND_D[c] });
    }
    if (S.wrong[k] > 0) {
      ctx.save(); ctx.globalAlpha = clamp(S.wrong[k], 0, 1);
      ctx.strokeStyle = P.bad; ctx.lineWidth = 3;
      ctx.beginPath(); rrPath(r.x - 4, r.y - 4, r.w + 8, r.h + 8, 14); ctx.stroke();
      ctx.restore();
    }
  }

  /* قانون */
  const ry = LABEL.y + 450;
  ctx.fillStyle = 'rgba(201, 150, 44, .14)';
  ctx.beginPath(); rrPath(LABEL.x + 20, ry - 16, LABEL.w - 40, 32, 8); ctx.fill();
  text('یک قرمز، یا دو زرد ⟵ احتیاط', LABEL.x + LABEL.w / 2, ry, { size: 15, color: '#8a6a12' });

  const ready = S.mark.every((m) => m >= 0);
  const v = S.verdict;
  /* بعد از حکم، فقط دکمهٔ انتخاب‌شده رنگ می‌گیرد */
  const btnFill = (mine) => {
    if (v) return v.pick === mine ? (v.ok ? P.good : P.bad) : '#9aa39c';
    if (!ready) return '#8a9285';
    return mine ? '#b07a2a' : '#4e7f4a';
  };
  button(BTN_OK, 'سالم است', {
    hot: S.hover && S.hover.k === 'ok', fill: btnFill(false), hotFill: '#63a05b', size: 20 });
  button(BTN_CARE, 'احتیاط', {
    hot: S.hover && S.hover.k === 'care', fill: btnFill(true), hotFill: '#cf9438', size: 20 });
  if (v && v.ok) {
    text(v.pick ? 'درست — برچسبش می‌گوید احتیاط.' : 'درست — برچسبش قرمز یا دو زرد ندارد.',
      LABEL.x + LABEL.w / 2, LABEL.y + 548, { size: 15, color: P.good });
  }
  button(BTN_NEW, 'خوراکیِ تازه', {
    hot: S.hover && S.hover.k === 'new', fill: '#5c6870', hotFill: '#77848d', size: 19 });
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
  drawShelf();
  drawScale();
  drawTubes();
  drawLabel();
  bits.draw();
  ctx.restore();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 520;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 62, w, 44, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 40, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.09, 'rgba(10, 22, 30, .42)', .3, .12);
}

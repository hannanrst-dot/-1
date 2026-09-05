/*!
title: آزمایشگاهِ چاه — زندگی ما و آب (آزمایش)
bg: #1c2a22
*/

/* ═══════════════════════════════════════════════════════════════════════
   آزمایشگاهِ چاه — علومِ سوم، درس ۶ «زندگی ما و آب»  (آزمایش)

   کتاب سه چیز می‌پرسد و این آزمایشگاه هر سه را نشان می‌دهد:

   ۱) «آیا از هر سه چاه می‌توان به آب رسید؟ از کجا فهمیدید؟»
      سه چاه با ژرفای متفاوت. چاهی آب می‌دهد که کفش زیرِ سطحِ آبِ
      زیرزمینی باشد. همین و بس — و روی صحنه دیدنی است.

   ۲) «اگر چند سال دیگر بگذرد و آب‌های زیرزمینی مثل قبل مصرف شوند، چه
      اتّفاقی خواهد افتاد؟» سطحِ آبِ زیرزمینی با ترازِ آب بالا و پایین
      می‌رود: بارش آن را بالا می‌آورد و برداشت پایین می‌برد. چاهِ
      کم‌عمق زودتر خشک می‌شود. این همان معادلهٔ سادهٔ ترازِ آب است:
          تغییرِ ذخیره = تغذیه (بارش) − برداشت
      و بالا و پایین رفتنِ سطح = تغییرِ ذخیره ÷ تخلخلِ خاک.
      تخلخل عددِ واقعی است: ماسه حدودِ ۳۰٪، خاکِ باغچه ۲۵٪، رُس ۴۵٪ ولی
      رُس آب را به‌سختی پس می‌دهد. اینجا از ماسه استفاده می‌شود.

   ۳) «آبِ بعضی چاه‌ها آلوده است… دلیلِ آلوده شدنِ این چاه چیست؟»
      چاهِ فاضلاب کنارِ چاهِ آب. آلودگی با آبِ زیرزمینی حرکت می‌کند و
      به چاه‌هایی می‌رسد که پایین‌دستِ آن‌اند. سرعتِ حرکت هم واقعی
      است: آبِ زیرزمینی در ماسه روزی چند ده سانتی‌متر جابه‌جا می‌شود.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  sky:   '#8fc0d8', skyLo: '#5f96b4',
  grass: '#6b9a4a', grassDk: '#3f6a28',
  soil:  '#9a7a52', soilDk: '#6b5232', soilLo: '#4e3a20',
  aqua:  '#4f9fc4', aquaDk: '#2c6f92', aquaLt: '#9fd8ea',
  waste: '#8a6a3a', wasteDk: '#5c4520', foul: '#a8703c',
  steel: '#8d99a3', steelDk: '#54606a',
  paper: '#fbfaf2', card: '#ffffff',
  ink:   '#20302a', inkSoft: '#7b8b80',
  good:  '#4e9f6c', bad: '#c04a34', gold: '#c9962c', accent: '#4fa3b8',
};

/* ───────── قانونِ ترازِ آب ─────────
   ذخیرهٔ آب در خاک با بارش زیاد و با برداشت کم می‌شود؛ سطحِ آب
   به‌اندازهٔ تغییرِ ذخیره تقسیم بر تخلخل بالا و پایین می‌رود.        */

const POROSITY = .30;          /* تخلخلِ ماسه، نسبتِ حجمِ خالی */
const GROUND_M = 0;            /* سطحِ زمین، متر */
const BEDROCK_M = 14;          /* سنگِ سختِ کف، متر پایین‌تر از زمین */
const WELLS = [
  { n: 'چاهِ کم‌عمق',  depth: 4 },
  { n: 'چاهِ میانه',   depth: 7.5 },
  { n: 'چاهِ عمیق',    depth: 11 },
];
const CESSPIT_M = 2.5;         /* ژرفای چاهِ فاضلاب */
const FLOW_M_PER_MONTH = 4.5;  /* حرکتِ آبِ زیرزمینی در ماسه */

/** سطحِ تازهٔ آب بعد از یک ماه. rain و pump به میلی‌متر بر ماه. */
function nextTable(level, rainMM, pumpMM) {
  const net = (rainMM - pumpMM) / 1000;      /* متر آبِ خالص */
  const dz = net / POROSITY;                 /* سطح چقدر بالا/پایین می‌رود */
  return clamp(level - dz, GROUND_M, BEDROCK_M);
}
/** آیا این چاه آب می‌دهد؟ */
const wellWet = (w, level) => w.depth > level;

const STEPS = [
  { n: 'سه چاه',   t: 'کدام چاه به آب می‌رسد؟ از کجا فهمیدی؟' },
  { n: 'سال‌ها',   t: 'بارش و برداشت را تنظیم کن و ماه‌ها را جلو ببر.' },
  { n: 'آلودگی',   t: 'چاهِ فاضلاب را جابه‌جا کن و ببین کدام چاه آلوده می‌شود.' },
];

const S = {
  stepI: 0,
  level: 3,              /* ژرفای سطحِ آبِ زیرزمینی از زمین، متر — اوّل هر سه چاه آب دارند */
  rain: 40, pump: 40,    /* میلی‌متر بر ماه */
  month: 0, running: false, runT: 0,
  hist: [],              /* سطحِ آب در ماه‌های گذشته */
  pitX: 300,             /* جای چاهِ فاضلاب روی صحنه */
  plume: 0,              /* پیشرویِ آلودگی، متر */
  dragPit: false,
  t: 0, hover: null, tip: '', tipT: 0, flash: 0,
};

const bits = new Bits();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
function tip(msg) { S.tip = msg; S.tipT = 3.6; }

/* ───────── جای‌ها ───────── */

const FIELD = { x: 24, y: 96, w: 760, h: 560 };
const SIDE = { x: 804, y: 96, w: 372, h: 560 };
const GY = FIELD.y + 96;                    /* سطحِ زمین روی صحنه */
const MPX = (FIELD.h - 120) / BEDROCK_M;    /* پیکسل بر متر */
const yOfM = (m) => GY + m * MPX;
/* جای هر چاه روی صحنه */
const wellX = (i) => FIELD.x + 210 + i * 180;

function slider(i) { return { x: SIDE.x + 24, y: SIDE.y + 150 + i * 92, w: SIDE.w - 48, h: 40 }; }
const BTN_RUN = { x: SIDE.x + 24, y: SIDE.y + 348, w: 158, h: 54 };
const BTN_STEP = { x: SIDE.x + 190, y: SIDE.y + 348, w: 158, h: 54 };
const BTN_RESET = { x: SIDE.x + 24, y: SIDE.y + 396, w: SIDE.w - 48, h: 44 };
const CHART = { x: SIDE.x + 24, y: SIDE.y + 462, w: SIDE.w - 48, h: 54 };
const BTN_TICK = { x: FIELD.x + 20, y: FIELD.y + FIELD.h - 60, w: 200, h: 44 };

/* ───────── کارها ───────── */

function advance() {
  S.level = nextTable(S.level, S.rain, S.pump);
  S.month++;
  S.hist.push(S.level);
  if (S.hist.length > 120) S.hist.shift();
  /* آلودگی با آبِ زیرزمینی جلو می‌رود */
  S.plume += FLOW_M_PER_MONTH / 12;
  S.stepI = Math.max(S.stepI, 1);
}

function resetAll() {
  S.level = 3; S.month = 0; S.hist = []; S.running = false; S.plume = 0;
  sfx.tap();
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.flash > 0) S.flash -= dt;
  if (S.running) {
    S.runT += dt;
    while (S.runT >= .34) { S.runT -= .34; advance(); }
    if (S.month >= 120) S.running = false;
  }
  bits.step(dt);
  draw();
}

whenFontsReady(() => runLoop(step));

/* ───────── ورودی ───────── */

function setSlider(i, px) {
  const b = slider(i);
  const u = clamp((px - b.x) / b.w, 0, 1);
  if (i === 0) S.rain = Math.round(u * 120);
  else S.pump = Math.round(u * 120);
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.hover && S.hover.k === 'drag') { setSlider(S.hover.i, p.x); return; }
  if (S.dragPit) {
    S.pitX = clamp(p.x, FIELD.x + 40, FIELD.x + FIELD.w - 40);
    S.stepI = Math.max(S.stepI, 2);
    return;
  }
  S.hover = null;
  for (let i = 0; i < 2; i++) if (inRect(p, slider(i))) S.hover = { k: 'sl', i };
  if (inRect(p, BTN_RUN)) S.hover = { k: 'run' };
  if (inRect(p, BTN_STEP)) S.hover = { k: 'step' };
  if (inRect(p, BTN_RESET)) S.hover = { k: 'reset' };
  if (Math.abs(p.x - S.pitX) < 42 && p.y > GY - 70 && p.y < GY + 40) S.hover = { k: 'pit' };
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  for (let i = 0; i < 2; i++) if (inRect(p, slider(i))) {
    S.hover = { k: 'drag', i }; setSlider(i, p.x);
    try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
    return;
  }
  if (inRect(p, BTN_RUN)) { S.running = !S.running; sfx.tap(); return; }
  if (inRect(p, BTN_STEP)) { advance(); sfx.tick(); return; }
  if (inRect(p, BTN_RESET)) { resetAll(); return; }
  if (Math.abs(p.x - S.pitX) < 42 && p.y > GY - 70 && p.y < GY + 40) {
    S.dragPit = true;
    try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
    sfx.tap();
  }
});

function release() { if (S.hover && S.hover.k === 'drag') S.hover = null; S.dragPit = false; }
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
  g.addColorStop(0, '#2e4438'); g.addColorStop(1, '#141f18');
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.fillStyle = 'rgba(255, 253, 246, .95)';
  ctx.beginPath(); rrPath(SIDE.x, SIDE.y, SIDE.w, SIDE.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(12, 28, 22, .22)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(SIDE.x, SIDE.y, SIDE.w, SIDE.h, 16); ctx.stroke();
}

function drawField() {
  const f = FIELD;
  ctx.save();
  ctx.beginPath(); rrPath(f.x, f.y, f.w, f.h, 14); ctx.clip();
  /* آسمان */
  const sg = ctx.createLinearGradient(0, f.y, 0, GY);
  sg.addColorStop(0, P.skyLo); sg.addColorStop(1, P.sky);
  ctx.fillStyle = sg; ctx.fillRect(f.x, f.y, f.w, GY - f.y);
  /* باران، به اندازهٔ تنظیم */
  const drops = Math.round(S.rain / 8);
  ctx.strokeStyle = 'rgba(220, 240, 250, .6)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < drops; i++) {
    const x = f.x + ((i * 97) % f.w);
    const y = f.y + ((i * 53 + S.t * 160) % (GY - f.y));
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 12); ctx.stroke();
  }
  /* خاک */
  ctx.fillStyle = P.soilDk; ctx.fillRect(f.x, GY, f.w, f.h);
  ctx.fillStyle = P.soil; ctx.fillRect(f.x, GY, f.w, f.h);
  ctx.fillStyle = 'rgba(80,60,32,.25)';
  for (let i = 0; i < 220; i++) {
    const x = f.x + ((i * 71) % f.w), y = GY + 8 + ((i * 131) % (f.y + f.h - GY - 8));
    ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill();
  }
  /* سبزه */
  ctx.fillStyle = P.grassDk; ctx.fillRect(f.x, GY - 6, f.w, 10);
  ctx.fillStyle = P.grass; ctx.fillRect(f.x, GY - 6, f.w, 6);
  /* سنگِ سختِ کف */
  ctx.fillStyle = P.steelDk; ctx.fillRect(f.x, yOfM(BEDROCK_M), f.w, f.y + f.h - yOfM(BEDROCK_M));
  ctx.fillStyle = P.steel; ctx.fillRect(f.x, yOfM(BEDROCK_M), f.w, 8);

  /* آبِ زیرزمینی */
  const wy = yOfM(S.level);
  ctx.save();
  ctx.globalAlpha = .8;
  const ag = ctx.createLinearGradient(0, wy, 0, yOfM(BEDROCK_M));
  ag.addColorStop(0, P.aquaLt); ag.addColorStop(.2, P.aqua); ag.addColorStop(1, P.aquaDk);
  ctx.fillStyle = ag;
  ctx.fillRect(f.x, wy, f.w, yOfM(BEDROCK_M) - wy);
  ctx.restore();
  ctx.strokeStyle = '#dff2fb'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(f.x, wy); ctx.lineTo(f.x + f.w, wy); ctx.stroke();

  /* آلودگی از چاهِ فاضلاب: در آبِ زیرزمینی جلو می‌رود */
  if (S.plume > 0) {
    const r = S.plume * MPX;
    ctx.save();
    ctx.globalAlpha = .5;
    ctx.fillStyle = P.foul;
    ctx.beginPath();
    ctx.ellipse(S.pitX, Math.max(wy + 10, yOfM(CESSPIT_M) + 20), r, r * .55, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  /* چاهِ فاضلاب */
  const px = S.pitX;
  ctx.fillStyle = P.wasteDk;
  ctx.fillRect(px - 15, GY - 4, 30, yOfM(CESSPIT_M) - GY + 4);
  ctx.fillStyle = P.waste;
  ctx.fillRect(px - 11, GY - 2, 22, yOfM(CESSPIT_M) - GY);
  ctx.fillStyle = P.foul;
  ctx.fillRect(px - 11, yOfM(CESSPIT_M) - 22, 22, 22);
  ctx.fillStyle = 'rgba(20, 34, 24, .7)';
  ctx.beginPath(); rrPath(px - 44, GY - 108, 88, 24, 10); ctx.fill();
  text('چاهِ فاضلاب', px, GY - 96, { size: 13, color: '#f2e2cc' });
  if (S.hover && S.hover.k === 'pit') {
    ctx.strokeStyle = P.gold; ctx.lineWidth = 2.4; ctx.setLineDash([6, 5]);
    ctx.strokeRect(px - 26, GY - 46, 52, yOfM(CESSPIT_M) - GY + 52);
    ctx.setLineDash([]);
  }

  /* سه چاهِ آب */
  for (let i = 0; i < WELLS.length; i++) {
    const w = WELLS[i], x = wellX(i), by = yOfM(w.depth);
    const wet = wellWet(w, S.level);
    /* آلوده اگر در بُردِ آلودگی باشد و آب داشته باشد */
    const dist = Math.abs(x - S.pitX) / MPX;
    const foul = wet && S.plume >= dist && w.depth > CESSPIT_M;
    ctx.fillStyle = P.soilLo;
    ctx.fillRect(x - 17, GY - 6, 34, by - GY + 6);
    ctx.fillStyle = '#2a2018';
    ctx.fillRect(x - 12, GY - 4, 24, by - GY + 4);
    /* آبِ داخلِ چاه */
    if (wet) {
      const top = Math.max(yOfM(S.level), GY);
      ctx.fillStyle = foul ? P.foul : P.aqua;
      ctx.fillRect(x - 12, top, 24, by - top);
      ctx.fillStyle = foul ? '#c88a52' : P.aquaLt;
      ctx.fillRect(x - 12, top, 24, 3);
    }
    /* دیوارهٔ چاه */
    ctx.fillStyle = P.steel;
    ctx.fillRect(x - 20, GY - 14, 40, 12);
    ctx.fillStyle = P.steelDk;
    ctx.fillRect(x - 20, GY - 4, 40, 4);
    /* برچسب */
    ctx.fillStyle = wet ? (foul ? 'rgba(168,112,60,.9)' : 'rgba(30,60,72,.85)') : 'rgba(150,60,40,.9)';
    ctx.beginPath(); rrPath(x - 56, GY - 46, 112, 26, 11); ctx.fill();
    text(w.n, x, GY - 33, { size: 13, color: '#eaf4f8' });
    ctx.fillStyle = wet ? (foul ? P.foul : P.good) : P.bad;
    ctx.beginPath(); rrPath(x - 40, GY - 78, 80, 24, 10); ctx.fill();
    text(wet ? (foul ? 'آلوده' : 'آب دارد') : 'خشک', x, GY - 66, { size: 13, color: '#fff' });
    numText(faNum(w.depth, 1) + ' متر', x, by + 16, { size: 12, color: '#f0e6d2' });
  }

  /* خط‌کشِ ژرفا */
  for (let m = 0; m <= BEDROCK_M; m += 2) {
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(f.x + 6, yOfM(m)); ctx.lineTo(f.x + 24, yOfM(m)); ctx.stroke();
    numText(fa(m), f.x + 38, yOfM(m), { size: 11, color: 'rgba(255,255,255,.6)' });
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(10, 24, 18, .5)'; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(f.x, f.y, f.w, f.h, 14); ctx.stroke();

  /* نوارهای خبری پایینِ صحنه — بالای صحنه جای برچسبِ چاه‌هاست */
  const by = f.y + f.h - 46;
  ctx.fillStyle = 'rgba(12, 26, 32, .85)';
  ctx.beginPath(); rrPath(f.x + 16, by, 322, 32, 10); ctx.fill();
  numText('سطحِ آبِ زیرزمینی: ' + faNum(S.level, 1) + ' متر زیرِ زمین',
    f.x + 177, by + 16, { size: 14, color: '#dff2fb' });
  ctx.fillStyle = 'rgba(12, 26, 32, .85)';
  ctx.beginPath(); rrPath(f.x + f.w - 176, by, 160, 32, 10); ctx.fill();
  numText('ماهِ ' + fa(S.month), f.x + f.w - 96, by + 16, { size: 14, color: '#dff2fb' });
}

function drawSide() {
  text('تنظیم', SIDE.x + SIDE.w - 18, SIDE.y + 30, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  text('هر ماه چقدر باران می‌بارد و چقدر آب برداشت می‌شود؟',
    SIDE.x + SIDE.w / 2, SIDE.y + 62, { size: 13, color: P.inkSoft });
  const names = ['بارش', 'برداشت'], vals = [S.rain, S.pump], cols = [P.accent, P.bad];
  for (let i = 0; i < 2; i++) {
    const b = slider(i), u = vals[i] / 120;
    text(names[i], b.x + b.w, b.y - 14, { size: 16, family: 'Lalezar', color: P.ink, align: 'right' });
    numText(fa(vals[i]) + ' میلی‌متر در ماه', b.x + 92, b.y - 14, { size: 13, color: P.inkSoft });
    ctx.fillStyle = 'rgba(32,48,42,.12)';
    ctx.beginPath(); rrPath(b.x, b.y + 14, b.w, 12, 6); ctx.fill();
    ctx.fillStyle = cols[i];
    ctx.beginPath(); rrPath(b.x, b.y + 14, b.w * u, 12, 6); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(b.x + b.w * u, b.y + 20, 12, 0, TAU); ctx.fill();
    ctx.strokeStyle = cols[i]; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(b.x + b.w * u, b.y + 20, 12, 0, TAU); ctx.stroke();
  }
  /* تراز */
  const net = S.rain - S.pump;
  ctx.fillStyle = net > 0 ? 'rgba(78,159,108,.14)' : (net < 0 ? 'rgba(192,74,52,.14)' : 'rgba(32,48,42,.07)');
  ctx.beginPath(); rrPath(SIDE.x + 24, SIDE.y + 296, SIDE.w - 48, 38, 9); ctx.fill();
  text(net > 0 ? 'بیشتر می‌بارد تا برداشت ⟵ سطحِ آب بالا می‌آید'
     : net < 0 ? 'بیشتر برداشت می‌شود تا بارش ⟵ سطح پایین می‌رود'
               : 'بارش و برداشت برابرند ⟵ سطح ثابت می‌ماند',
    SIDE.x + SIDE.w / 2, SIDE.y + 315, { size: 13, color: net > 0 ? P.good : (net < 0 ? P.bad : P.inkSoft) });

  button(BTN_RUN, S.running ? 'ایست' : 'ماه‌ها جلو', {
    hot: S.hover && S.hover.k === 'run', fill: S.running ? '#a8552c' : '#2f7f96', hotFill: '#4fa3b8', size: 19 });
  button(BTN_STEP, 'یک ماه', {
    hot: S.hover && S.hover.k === 'step', fill: '#4a7f5c', hotFill: '#5f9f72', size: 19 });
  button(BTN_RESET, 'از نو', {
    hot: S.hover && S.hover.k === 'reset', fill: '#5c6870', hotFill: '#77848d', size: 18 });

  /* نمودارِ سطحِ آب در گذرِ ماه‌ها */
  const c = CHART;
  ctx.fillStyle = 'rgba(32,48,42,.06)';
  ctx.beginPath(); rrPath(c.x, c.y, c.w, c.h, 8); ctx.fill();
  text('سطحِ آب در گذرِ ماه‌ها', c.x + c.w / 2, c.y - 12, { size: 13, color: P.inkSoft });
  if (S.hist.length > 1) {
    ctx.strokeStyle = P.accent; ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i < S.hist.length; i++) {
      const x = c.x + (i / Math.max(1, S.hist.length - 1)) * c.w;
      const y = c.y + (S.hist[i] / BEDROCK_M) * c.h;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  /* خطِ ژرفای هر چاه روی نمودار */
  for (const w of WELLS) {
    const y = c.y + (w.depth / BEDROCK_M) * c.h;
    ctx.strokeStyle = 'rgba(192,74,52,.45)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(c.x, y); ctx.lineTo(c.x + c.w, y); ctx.stroke();
    ctx.setLineDash([]);
  }
  /* شمارشِ چاه‌های خشک */
  const dry = WELLS.filter((w) => !wellWet(w, S.level)).length;
  ctx.fillStyle = dry ? 'rgba(192,74,52,.14)' : 'rgba(78,159,108,.16)';
  ctx.beginPath(); rrPath(SIDE.x + 24, SIDE.y + 522, SIDE.w - 48, 32, 9); ctx.fill();
  text(dry === 0 ? 'هر سه چاه آب دارند.' : fa(dry) + ' چاه خشک شده است.',
    SIDE.x + SIDE.w / 2, SIDE.y + 538, { size: 15, family: 'Lalezar', color: dry ? P.bad : P.good });
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

function draw() {
  beginScene('#141f18');
  const layer = staticLayer('back', SCENE_W, SCENE_H, paintBackStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawSteps();
  drawField();
  drawSide();
  bits.draw();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 520;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 60, w, 42, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 39, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.09, 'rgba(6, 20, 14, .42)', 0, .1);
}

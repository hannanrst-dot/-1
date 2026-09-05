/*!
title: آزمایشگاهِ جوانه — زنگ علوم (آزمایش)
bg: #eef0e4
*/

/* ═══════════════════════════════════════════════════════════════════════
   آزمایشگاهِ جوانه — علوم سوم، درس ۱ «زنگ علوم» (آزمایش)
   ───────────────────────────────────────────────────────────────────────
   آزمایشِ کتاب: «مادر پرسید کدام قسمتِ مزرعه برای کاشتنِ دانه‌های کاهو
   مناسب‌تر است؟ … مریم و سارا تعدادِ یکسانی دانهٔ کاهو را در دو ظرفِ
   کاملاً مشابه کاشتند. یکی جلوی خانه (۲۵ درجه) و یکی پشتِ خانه (۱۵
   درجه)… هر روز جوانه‌ها را شمردند.»

   اینجا همان آزمایش، مرحله‌به‌مرحله، با قانونِ واقعیِ جوانه‌زنی:

   ▸ سرعتِ جوانه‌زنی با دما بالا و پایین می‌رود. برای کاهو دمای کمینه
     نزدیکِ ۲ درجه، بهینه نزدیکِ ۲۴ و بیشینه نزدیکِ ۳۰ درجه است. مدلِ
     «دماهای اصلی» (cardinal temperatures) همین است: نرخ از Tmin تا
     Topt بالا می‌رود و از Topt تا Tmax سریع می‌افتد؛ بیرونِ این بازه
     صفر است. برای همین است که ۲۵ درجه از ۱۵ درجه تندتر جوانه می‌زند —
     همان چیزی که در جدولِ کتاب می‌بینیم — ولی ۳۵ درجه اصلاً جوانه
     نمی‌زند (خوابِ گرماییِ کاهو).
   ▸ آب هم لازم است: خاکِ خشک جوانه نمی‌دهد و خاکِ غرقاب هم دانه را
     خفه می‌کند (ریشه به هوا نیاز دارد).
   ▸ نور برای کاهو مهم است: بذرِ کاهو «نوردوست» است (photoblastic). در
     روشنایی فیتوکرومِ بذر فعّال می‌شود و جوانه می‌زند؛ در تاریکی خوابِ
     بذر می‌ماند — و هرچه هوا گرم‌تر باشد این خواب عمیق‌تر است. برای
     همین در تاریکی و ۲۵ درجه تقریباً چیزی سبز نمی‌شود، ولی در تاریکی و
     ۱۵ درجه بیشترشان بالاخره سبز می‌شوند.
   ▸ «رنگِ ظرف» عمداً گذاشته شده و هیچ اثری ندارد — تا بچّه ببیند هر
     عاملی که عوض می‌کنی لزوماً مهم نیست و نتیجهٔ «فرقی نکرد» هم یک
     نتیجهٔ درستِ علمی است.
   ▸ همهٔ دانه‌ها با هم جوانه نمی‌زنند؛ پخشِ زمانی دارند و درصدی هم
     هیچ‌وقت جوانه نمی‌زنند.

   قانونِ اصلیِ درس هم رعایت می‌شود: تا وقتی بیش از یک چیز را بینِ دو
   ظرف عوض کرده باشی، آزمایشگاه نتیجه‌گیری را قبول نمی‌کند — چون معلوم
   نیست کدام عامل اثر داشته. این همان «آزمایشِ منصفانه» است.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  wall:  '#eef0e4', wallLo: '#cfd4c0', wallHi: '#f8faf0',
  wood:  '#b08a52', woodDk: '#7a5a2e', woodLt: '#d8b47e',
  steel: '#8d99a3', steelDk: '#5c6870', steelLt: '#c3ced6',
  soil:  '#6b4a2c', soilDk: '#3f2a15', soilLt: '#8d6742',
  leaf:  '#5da24e', leafDk: '#356b2c', leafLt: '#8fc97a',
  glass: '#cfe8ef',
  paper: '#fbfaf2', card: '#ffffff', ink: '#25302a', inkSoft: '#7d8a80',
  warm:  '#d9663f', cool: '#4a86c4',
  good:  '#4e8f5c', bad: '#c04a34', gold: '#c9962c', accent: '#3f7d8c',
};

/* ───────── قانونِ جوانه‌زنی ─────────
   مدلِ دماهای اصلی + اثرِ رطوبت. خروجی: نرخِ جوانه‌زنیِ روزانه.
   Tmin = ۲، Topt = ۲۴، Tmax = ۳۰ (کاهو).                              */

const T_MIN = 2, T_OPT = 24, T_MAX = 30;
const MAX_FRAC = .92;            /* چند درصد از دانه‌ها اصلاً توانِ جوانه‌زدن دارند */

/** ضریبِ دما: صفر بیرونِ بازه، ۱ در دمای بهینه. */
function fTemp(T) {
  if (T <= T_MIN || T >= T_MAX) return 0;
  if (T <= T_OPT) return (T - T_MIN) / (T_OPT - T_MIN);
  return (T_MAX - T) / (T_MAX - T_OPT);
}
/** ضریبِ آب: خاکِ خشک و خاکِ غرقاب هر دو بد است؛ بهینه نزدیکِ نیمه‌مرطوب. */
function fWater(w) {
  if (w <= .08) return 0;
  if (w >= .98) return .06;                 /* غرقاب: تقریباً هیچ */
  const x = (w - .55) / .34;
  return clamp(1 - x * x, .05, 1);
}
/** ضریبِ نور: بذرِ کاهو نوردوست است. روشنایی جوانه‌زنی را راه می‌اندازد؛
    در تاریکی هرچه گرم‌تر، خوابِ بذر عمیق‌تر (خوابِ گرمایی). */
function fLight(on, T) {
  if (on) return 1;
  return clamp(1 - (T - 12) / 16, .06, .85);
}
/** رنگِ ظرف هیچ اثری بر جوانه‌زنی ندارد — و باید هم نداشته باشد. */
const DISH_N = ['سفالی', 'آبی'];
const DISH_C = ['#b9714a', '#5a8fb8'];

/** شمارِ دانه‌های جوانه‌زده تا روزِ day، با نرخِ r در روز و تأخیرِ lag. */
function sprouted(seeds, r, day, lag) {
  if (r <= 0) return 0;
  const t = Math.max(0, day - lag);
  return Math.round(seeds * MAX_FRAC * (1 - Math.exp(-r * t)));
}

function makePot() {
  return { seeds: 20, temp: 25, water: .55, light: true, dish: 0, day: 0 };
}
const potRate = (p) => .62 * fTemp(p.temp) * fWater(p.water) * fLight(p.light, p.temp);
/* هرچه از دمای بهینه دورتر، دیرتر هم شروع می‌کند — نه فقط کندتر پیش می‌رود */
const potLag = (p) => 1 + 3.2 * (1 - fTemp(p.temp));
const potCount = (p, day) => sprouted(p.seeds, potRate(p), day === undefined ? p.day : day, potLag(p));

/* ───────── وضعیت ───────── */

const STEPS = [
  { n: 'پرسش',   t: 'می‌خواهیم اثرِ چه چیزی را بفهمیم؟' },
  { n: 'دو ظرف', t: 'دو ظرف را بچین — فقط یک چیز را فرق بده.' },
  { n: 'روزها',  t: 'روزها را جلو ببر و جوانه‌ها را ببین.' },
  { n: 'جدول',   t: 'شمارشِ هر روز در جدول نشسته است.' },
  { n: 'نتیجه',  t: 'کدام ظرف بهتر بود؟ رویش بزن.' },
];

const QUESTIONS = [
  { id: 'temp',  n: 'گرمای هوا', f: 'temp' },
  { id: 'water', n: 'آبِ خاک',   f: 'water' },
  { id: 'light', n: 'روشنایی',   f: 'light' },
  { id: 'dish',  n: 'رنگِ ظرف',   f: 'dish'  },
];

const S = {
  stepI: 0,
  q: 0,
  pot: [makePot(), makePot()],
  day: 0, running: false, runT: 0,
  note: [],
  verdict: null, fairMsg: 0,
  drag: null,
  t: 0, hover: null, tip: '', tipT: 0, flash: 0,
};

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
whenFontsReady(() => runLoop(step));

/* ───────── منصفانه بودنِ آزمایش ───────── */

/** کدام عامل‌ها بینِ دو ظرف فرق دارند؟ */
function diffs() {
  const a = S.pot[0], b = S.pot[1], out = [];
  if (a.seeds !== b.seeds) out.push('seeds');
  if (Math.abs(a.temp - b.temp) > .5) out.push('temp');
  if (Math.abs(a.water - b.water) > .02) out.push('water');
  if (a.light !== b.light) out.push('light');
  if (a.dish !== b.dish) out.push('dish');
  return out;
}
const fair = () => diffs().length === 1;
const testing = () => diffs()[0] || null;

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.fairMsg > 0) S.fairMsg -= dt;
  if (S.flash > 0) S.flash -= dt;
  if (S.running) {
    S.runT += dt;
    if (S.runT >= .5) { S.runT = 0; nextDay(); }
  }
  draw();
}

function nextDay() {
  if (S.day >= 12) { S.running = false; return; }
  S.day++;
  S.pot[0].day = S.day; S.pot[1].day = S.day;
  S.note.push({ day: S.day, a: potCount(S.pot[0]), b: potCount(S.pot[1]) });
  sfx.tone(400 + S.day * 16, .06, 'sine', .05);
  if (S.stepI === 2 && S.day >= 7) S.stepI = 3;
  if (S.day >= 12) S.running = false;
}

function resetRun() {
  S.day = 0; S.note = []; S.running = false; S.runT = 0;
  S.pot[0].day = 0; S.pot[1].day = 0;
  S.verdict = null;
}

function tip(msg) { S.tip = msg; S.tipT = 3.6; }

/** نتیجه‌گیری: فقط وقتی آزمایش منصفانه بوده و روزها گذشته باشد. */
function conclude(i) {
  if (S.day < 7) { tip('اوّل دستِ‌کم تا روزِ هفتم صبر کن.'); S.flash = 1; sfx.nope(); return; }
  if (!fair()) {
    S.fairMsg = 3.6;
    sfx.nope();
    tip('بیش از یک چیز فرق دارد؛ معلوم نمی‌شود کدام اثر داشته.');
    return;
  }
  /* داوری از رویِ همهٔ روزهای جدول، نه فقط روزِ آخر.
     دما سرعت را عوض می‌کند نه سقف را: تا روزِ دوازدهم هر دو ظرف پُر
     می‌شوند و عددِ آخر یکی می‌شود، ولی یکی زودتر سبز شده است. اگر فقط
     روزِ آخر را نگاه کنیم، آزمایشگاه به غلط می‌گوید «دما اثری نداشت». */
  let sa = 0, sb = 0;
  for (const r of S.note) { sa += r.a; sb += r.b; }
  const win = sa === sb ? -1 : (sa > sb ? 0 : 1);
  if (win === -1) {
    S.verdict = { pick: i, ok: true, tie: true };
    sfx.good();
    tip('هر روز هر دو یکی بودند — پس این عامل اثری نداشت.');
    S.stepI = 4;
    return;
  }
  const last = [potCount(S.pot[0]), potCount(S.pot[1])];
  S.verdict = { pick: i, ok: i === win, win, sooner: last[0] === last[1] };
  if (i === win) {
    sfx.win();
    tip(last[0] === last[1] ? 'درست است؛ عددِ آخر یکی شد ولی این ظرف زودتر سبز شد.'
                            : 'درست است؛ همین ظرف بیشتر جوانه داد.');
  } else {
    sfx.nope();
    tip('به جدولِ همهٔ روزها نگاه کن، نه فقط روزِ آخر.');
  }
  S.stepI = 4;
}

/* ───────── جای‌ها ───────── */

const potBox = (i) => ({ x: 44 + i * 292, y: 112, w: 268, h: 596 });
const SIDE = { x: 636, y: 112, w: 528, h: 596 };
const CTRL = ['seeds', 'temp', 'water', 'light', 'dish'];
const CTRL_N = ['دانه', 'دما', 'آبِ خاک', 'نور', 'رنگِ ظرف'];
function ctrlRow(i, k) {
  const b = potBox(i);
  return { x: b.x + 12, y: b.y + 362 + k * 46, w: b.w - 24, h: 42 };
}
function trackOf(i, k) {
  const r = ctrlRow(i, k);
  return { x: r.x + 78, y: r.y + r.h / 2, w: r.w - 132 };
}
function qChip(i) {
  return { x: SIDE.x + 22 + i * 124, y: SIDE.y + 62, w: 112, h: 58 };
}
const TABLE = { x: SIDE.x + 20, y: SIDE.y + 148, w: SIDE.w - 40, h: 292 };
const BTN_DAY = { x: SIDE.x + 22, y: SIDE.y + 462, w: 200, h: 62 };
const BTN_RUN = { x: SIDE.x + 238, y: SIDE.y + 462, w: 148, h: 62 };
const BTN_NEW = { x: SIDE.x + 402, y: SIDE.y + 462, w: 104, h: 62 };
const potPick = (i) => { const b = potBox(i); return { x: b.x + 30, y: b.y + 288, w: b.w - 60, h: 46 }; };

/* ───────── ورودی ───────── */

function setCtrl(i, k, px) {
  const t = trackOf(i, k), p = S.pot[i];
  const u = clamp((px - t.x) / t.w, 0, 1);
  if (CTRL[k] === 'seeds') p.seeds = Math.round(lerp(10, 30, u));
  else if (CTRL[k] === 'temp') p.temp = Math.round(lerp(2, 38, u));
  else if (CTRL[k] === 'water') p.water = Math.round(u * 100) / 100;
  resetRun();
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.drag) { setCtrl(S.drag.i, S.drag.k, p.x); return; }
  S.hover = null;
  for (let i = 0; i < 2; i++) {
    for (let k = 0; k < CTRL.length; k++) {
      const r = ctrlRow(i, k);
      if (inRect(p, r)) S.hover = { k: 'ctrl', i, c: k };
    }
    if (inRect(p, potPick(i))) S.hover = { k: 'pick', i };
  }
  for (let i = 0; i < QUESTIONS.length; i++) if (inRect(p, qChip(i))) S.hover = { k: 'q', i };
  if (inRect(p, BTN_DAY)) S.hover = { k: 'day' };
  if (inRect(p, BTN_RUN)) S.hover = { k: 'run' };
  if (inRect(p, BTN_NEW)) S.hover = { k: 'new' };
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  for (let i = 0; i < QUESTIONS.length; i++) if (inRect(p, qChip(i))) {
    S.q = i; S.stepI = Math.max(S.stepI, 1); sfx.tap();
    /* دو ظرف را همسان می‌کنیم و فقط همان عامل را فرق می‌دهیم */
    S.pot = [makePot(), makePot()];
    const f = QUESTIONS[i].f;
    if (f === 'temp') { S.pot[0].temp = 25; S.pot[1].temp = 15; }
    if (f === 'water') { S.pot[0].water = .55; S.pot[1].water = .12; }
    if (f === 'light') { S.pot[0].light = true; S.pot[1].light = false; }
    if (f === 'dish') { S.pot[0].dish = 0; S.pot[1].dish = 1; }
    resetRun();
    return;
  }
  if (inRect(p, BTN_DAY)) { if (S.day < 12) { S.stepI = Math.max(S.stepI, 2); nextDay(); } else tip('دوازده روز تمام شد.'); return; }
  if (inRect(p, BTN_RUN)) { S.stepI = Math.max(S.stepI, 2); S.running = !S.running && S.day < 12; sfx.tap(); return; }
  if (inRect(p, BTN_NEW)) { resetRun(); sfx.tap(); tip('از روزِ صفر شروع شد.'); return; }
  for (let i = 0; i < 2; i++) {
    if (inRect(p, potPick(i))) { conclude(i); return; }
    for (let k = 0; k < CTRL.length; k++) {
      const r = ctrlRow(i, k);
      if (!inRect(p, r)) continue;
      if (CTRL[k] === 'light') { S.pot[i].light = !S.pot[i].light; resetRun(); sfx.tap(); return; }
      if (CTRL[k] === 'dish') { S.pot[i].dish = 1 - S.pot[i].dish; resetRun(); sfx.tap(); return; }
      S.drag = { i, k };
      setCtrl(i, k, p.x);
      try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
      return;
    }
  }
});

cv.addEventListener('pointerup', () => { S.drag = null; });
cv.addEventListener('pointercancel', () => { S.drag = null; });
cv.addEventListener('pointerleave', () => { S.drag = null; });

/* ───────── ابزارِ نقاشی ───────── */

function rrPath(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function numText(str, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.family === 'Vazirmatn' ? (o.weight || 700) : '400'} ${o.size || 20}px "${o.family || 'Lalezar'}", Tahoma, sans-serif`;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'ltr';
  ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

const waterName = (w) => w < .12 ? 'خشک' : (w < .38 ? 'کم‌آب' : (w < .74 ? 'نمناک' : (w < .95 ? 'خیس' : 'غرقاب')));

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintLabStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallHi); g.addColorStop(.5, P.wall); g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.globalAlpha = .5;
  ctx.fillStyle = texPaper(P.wall);
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* کاشیِ کفِ آزمایشگاه */
  ctx.strokeStyle = 'rgba(90, 105, 85, .12)'; ctx.lineWidth = 1.6;
  for (let x = 0; x < SCENE_W; x += 60) { ctx.beginPath(); ctx.moveTo(x, HUD_H); ctx.lineTo(x, SCENE_H); ctx.stroke(); }
  for (let y = HUD_H; y < SCENE_H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke(); }
  /* میزِ کار */
  for (let i = 0; i < 2; i++) {
    const b = potBox(i);
    ctx.fillStyle = 'rgba(255,255,255,.62)';
    ctx.beginPath(); rrPath(b.x - 8, b.y - 8, b.w + 16, b.h + 16, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(90, 105, 85, .22)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(b.x - 8, b.y - 8, b.w + 16, b.h + 16, 16); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,.66)';
  ctx.beginPath(); rrPath(SIDE.x - 10, SIDE.y - 8, SIDE.w + 20, SIDE.h + 16, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(90, 105, 85, .22)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(SIDE.x - 10, SIDE.y - 8, SIDE.w + 20, SIDE.h + 16, 16); ctx.stroke();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.wall);
  ctx.drawImage(staticLayer('lab', SCENE_W, SCENE_H, paintLabStatic), 0, 0, SCENE_W, SCENE_H);
  for (let i = 0; i < 2; i++) drawPot(i);
  drawSide();
  drawSteps();
  drawTip();
  endScene(.12, 'rgba(90, 100, 70, .22)', .2, .08);
}

function drawSteps() {
  ctx.fillStyle = 'rgba(37, 48, 42, .95)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = P.accent;
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);
  text('آزمایشگاهِ جوانه', SCENE_W - 22, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.card, align: 'right' });
  const w = 132, gap = 8, total = STEPS.length * w + (STEPS.length - 1) * gap;
  for (let i = 0; i < STEPS.length; i++) {
    const x = 24 + i * (w + gap);
    const on = i <= S.stepI;
    ctx.fillStyle = on ? (i === S.stepI ? P.accent : 'rgba(63, 125, 140, .45)') : 'rgba(255,255,255,.1)';
    ctx.beginPath(); rrPath(x, 8, w, HUD_H - 16, 9); ctx.fill();
    numText(fa(i + 1), x + 20, HUD_H / 2, { size: 17, color: on ? '#fff' : 'rgba(255,255,255,.4)' });
    text(STEPS[i].n, x + w / 2 + 12, HUD_H / 2, { size: 16, family: 'Lalezar', color: on ? '#fff' : 'rgba(255,255,255,.45)' });
  }
  void total;
}

function drawTip() {
  const msg = S.tipT > 0 ? S.tip : STEPS[S.stepI].t;
  ctx.save();
  ctx.globalAlpha = S.tipT > 0 ? clamp(S.tipT, 0, 1) : .8;
  ctx.font = '700 17px "Vazirmatn", Tahoma, sans-serif';
  const w = ctx.measureText(msg).width + 60;
  const x = SCENE_W / 2 - w / 2, y = SCENE_H - 44;
  ctx.fillStyle = S.tipT > 0 ? 'rgba(63, 125, 140, .95)' : 'rgba(37, 48, 42, .8)';
  ctx.beginPath(); rrPath(x, y, w, 34, 17); ctx.fill();
  text(msg, SCENE_W / 2, y + 18, { size: 17, color: '#fff' });
  ctx.restore();
}

/* ───────── ظرف ───────── */

function sprout(x, y, h, seed) {
  ctx.strokeStyle = P.leafDk; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  const sway = Math.sin(S.t * 1.2 + seed) * .06;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(sway);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(1.6, -h * .5, 0, -h); ctx.stroke();
  ctx.fillStyle = P.leaf;
  wobbleEllipse(-5, -h + 1, 6, 3.4, -.5, seed, .5); ctx.fill();
  ctx.fillStyle = P.leafLt;
  wobbleEllipse(5, -h - 2, 6, 3.4, .45, seed + 2, .5); ctx.fill();
  ctx.restore();
}

function drawPot(i) {
  const b = potBox(i), p = S.pot[i];
  const other = S.pot[1 - i];
  text('ظرفِ ' + fa(i + 1), b.x + b.w - 12, b.y + 22, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  /* نشانِ اینکه چه چیزی فرق دارد */
  const d = diffs();
  if (d.length) {
    const names = { seeds: 'دانه', temp: 'دما', water: 'آب', light: 'نور', dish: 'رنگِ ظرف' };
    const lbl = d.map((x) => names[x]).join('، ');
    ctx.fillStyle = d.length === 1 ? 'rgba(78, 143, 92, .18)' : 'rgba(192, 74, 52, .16)';
    ctx.beginPath(); rrPath(b.x + 12, b.y + 8, 150, 28, 8); ctx.fill();
    text((d.length === 1 ? 'فرق: ' : 'چند فرق: ') + lbl, b.x + 87, b.y + 22,
      { size: 13, color: d.length === 1 ? P.good : P.bad });
  }

  /* ظرفِ شیشه‌ای با خاک — سمتِ راست برای دماسنج باز مانده */
  const dx = b.x + 20, dw = b.w - 86, dy = b.y + 200, dh = 92;
  ctx.fillStyle = 'rgba(120, 150, 160, .18)';
  ctx.beginPath(); rrPath(dx - 6, dy - 116, dw + 12, 116 + dh, 10); ctx.fill();
  /* خاک — هرچه خیس‌تر، تیره‌تر */
  const wet = clamp(p.water, 0, 1);
  ctx.save();
  ctx.beginPath(); rrPath(dx, dy, dw, dh, 8); ctx.clip();
  ctx.fillStyle = shade(P.soil, -wet * .45);
  ctx.fillRect(dx, dy, dw, dh);
  ctx.fillStyle = texStone(shade(P.soil, -wet * .45), shade(P.soilLt, -wet * .3));
  ctx.globalAlpha = .6;
  ctx.fillRect(dx, dy, dw, dh);
  ctx.globalAlpha = 1;
  if (wet > .95) {
    ctx.fillStyle = 'rgba(120, 170, 200, .5)';
    ctx.fillRect(dx, dy, dw, 12);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(90, 105, 85, .3)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(dx, dy, dw, dh, 8); ctx.stroke();
  ctx.strokeStyle = DISH_C[p.dish]; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(dx - 6, dy - 116, dw + 12, 116 + dh, 10); ctx.stroke();

  /* جوانه‌ها */
  const n = potCount(p);
  const cols = 10;
  for (let k = 0; k < n; k++) {
    const col = k % cols, row = Math.floor(k / cols);
    const x = dx + 12 + col * ((dw - 24) / (cols - 1));
    const y = dy + 8 + row * 9;
    /* بلندیِ جوانه به روزهایی که از سبز شدنش گذشته بستگی دارد */
    const born = Math.max(1, potLag(p) + (k / Math.max(1, p.seeds)) * 4);
    const age = Math.max(0, S.day - born);
    sprout(x, y, 8 + Math.min(34, age * 7), k * 3 + i);
  }
  /* شمارشِ جوانه بالای شیشه می‌نشیند تا روی خودِ جوانه‌ها نیفتد */
  const ly = dy - 116 - 14;
  if (!n) text(S.day ? 'هنوز جوانه‌ای نیست' : 'دانه‌ها کاشته شد', dx + dw / 2, ly,
    { size: 14, color: 'rgba(37, 48, 42, .45)' });
  else {
    ctx.fillStyle = 'rgba(93, 162, 78, .16)';
    ctx.beginPath(); rrPath(dx + dw / 2 - 56, ly - 13, 112, 26, 8); ctx.fill();
    numText(fa(n) + ' جوانه', dx + dw / 2, ly, { size: 18, color: P.leafDk });
  }

  /* ظرفِ تاریک زیرِ سرپوش است — باید دیده شود که تاریک است */
  if (!p.light) {
    ctx.fillStyle = 'rgba(24, 30, 26, .5)';
    ctx.beginPath(); rrPath(dx - 8, dy - 118, dw + 16, 118 + dh + 2, 11); ctx.fill();
  }

  /* دماسنج کنارِ ظرف */
  const tx = b.x + b.w - 34, ty = b.y + 80;
  const TH = 168;
  ctx.fillStyle = '#e8ecec';
  ctx.beginPath(); rrPath(tx - 7, ty, 14, TH, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(tx, ty + TH + 10, 13, 0, TAU); ctx.fill();
  const kk = clamp(p.temp / 40, 0, 1);
  const col = p.temp >= 24 ? P.warm : (p.temp <= 12 ? P.cool : '#8a9a55');
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(tx, ty + TH + 10, 9, 0, TAU); ctx.fill();
  ctx.beginPath(); rrPath(tx - 4, ty + TH - 4 - kk * (TH - 14), 8, kk * (TH - 14) + 14, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(90, 105, 85, .5)'; ctx.lineWidth = 1.4;
  for (let v = 0; v <= 40; v += 10) {
    const y = ty + TH - 4 - (v / 40) * (TH - 14);
    ctx.beginPath(); ctx.moveTo(tx + 7, y); ctx.lineTo(tx + 13, y); ctx.stroke();
  }

  /* دکمهٔ نتیجه */
  const pb = potPick(i);
  const chosen = S.verdict && S.verdict.pick === i;
  ctx.fillStyle = chosen ? (S.verdict.ok ? 'rgba(78, 143, 92, .22)' : 'rgba(192, 74, 52, .18)') : 'rgba(63, 125, 140, .12)';
  ctx.beginPath(); rrPath(pb.x, pb.y, pb.w, pb.h, 10); ctx.fill();
  ctx.strokeStyle = chosen ? (S.verdict.ok ? P.good : P.bad)
                           : (S.hover && S.hover.k === 'pick' && S.hover.i === i ? P.accent : 'rgba(63, 125, 140, .35)');
  ctx.lineWidth = chosen || (S.hover && S.hover.k === 'pick' && S.hover.i === i) ? 3 : 1.8;
  ctx.beginPath(); rrPath(pb.x, pb.y, pb.w, pb.h, 10); ctx.stroke();
  text(chosen ? (S.verdict.tie ? 'فرقی نکرد' : (S.verdict.ok ? (S.verdict.sooner ? 'درست — زودتر' : 'درست') : 'دوباره ببین'))
              : 'این یکی بهتر بود', pb.x + pb.w / 2, pb.y + pb.h / 2,
    { size: 16, family: 'Lalezar', color: chosen ? (S.verdict.ok ? P.good : P.bad) : P.accent });

  /* تنظیم‌ها */
  for (let k = 0; k < CTRL.length; k++) {
    const r = ctrlRow(i, k), t2 = trackOf(i, k), cy = r.y + r.h / 2;
    const hot = S.hover && S.hover.k === 'ctrl' && S.hover.i === i && S.hover.c === k;
    const key = CTRL[k];
    const same = key === 'seeds' ? p.seeds === other.seeds
               : key === 'temp' ? Math.abs(p.temp - other.temp) <= .5
               : key === 'water' ? Math.abs(p.water - other.water) <= .02
               : key === 'dish' ? p.dish === other.dish
               : p.light === other.light;
    ctx.fillStyle = same ? 'rgba(37, 48, 42, .04)' : 'rgba(217, 102, 63, .1)';
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 9); ctx.fill();
    if (!same) {
      ctx.strokeStyle = 'rgba(217, 102, 63, .5)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 9); ctx.stroke();
    }
    text(CTRL_N[k], r.x + r.w - 8, r.y + 14, { size: 13, color: P.inkSoft, align: 'right' });
    if (key === 'light' || key === 'dish') {
      const on = key === 'light' ? p.light : !!p.dish;
      const bx = t2.x + t2.w - 62;
      ctx.fillStyle = key === 'dish' ? DISH_C[p.dish] : (on ? P.gold : 'rgba(37, 48, 42, .2)');
      ctx.beginPath(); rrPath(bx, cy - 13, 58, 26, 13); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(on ? bx + 44 : bx + 14, cy, 10, 0, TAU); ctx.fill();
      text(key === 'dish' ? DISH_N[p.dish] : (on ? 'روشن' : 'تاریک'), t2.x + 26, cy,
        { size: 14, color: P.ink });
      if (hot) { ctx.strokeStyle = P.accent; ctx.lineWidth = 2;
        ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 9); ctx.stroke(); }
      continue;
    }
    const u = key === 'seeds' ? (p.seeds - 10) / 20 : (key === 'temp' ? (p.temp - 2) / 36 : p.water);
    ctx.fillStyle = 'rgba(37, 48, 42, .12)';
    ctx.beginPath(); rrPath(t2.x, t2.y - 5, t2.w, 10, 5); ctx.fill();
    ctx.fillStyle = key === 'temp' ? col : (key === 'water' ? '#5b9dc4' : P.leaf);
    ctx.beginPath(); rrPath(t2.x, t2.y - 5, t2.w * u, 10, 5); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(t2.x + t2.w * u, t2.y, hot ? 12 : 10, 0, TAU); ctx.fill();
    ctx.strokeStyle = P.steelDk; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(t2.x + t2.w * u, t2.y, hot ? 12 : 10, 0, TAU); ctx.stroke();
    const val = key === 'seeds' ? fa(p.seeds) : (key === 'temp' ? fa(p.temp) + '°' : waterName(p.water));
    numText(val, r.x + 34, cy, { size: key === 'water' ? 15 : 19, color: P.ink,
      family: key === 'water' ? 'Vazirmatn' : 'Lalezar' });
  }
}

/* ───────── تختهٔ کنار: پرسش، جدول، روزها ───────── */

function drawSide() {
  text('پرسشِ آزمایش', SIDE.x + SIDE.w - 20, SIDE.y + 26,
    { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  text('کدام‌یک را می‌آزماییم؟', SIDE.x + 130, SIDE.y + 27, { size: 14, color: P.inkSoft });
  for (let i = 0; i < QUESTIONS.length; i++) {
    const b = qChip(i), on = S.q === i;
    const hot = S.hover && S.hover.k === 'q' && S.hover.i === i;
    ctx.fillStyle = on ? 'rgba(63, 125, 140, .18)' : 'rgba(37, 48, 42, .05)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
    ctx.strokeStyle = on ? P.accent : (hot ? 'rgba(63,125,140,.5)' : 'rgba(37, 48, 42, .16)');
    ctx.lineWidth = on ? 3 : 1.6;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
    text(QUESTIONS[i].n, b.x + b.w / 2, b.y + b.h / 2, { size: 16, family: 'Lalezar', color: on ? P.accent : P.ink });
  }
  /* نشانِ منصفانه بودن */
  const d = diffs();
  const ok = d.length === 1;
  const fy = SIDE.y + 128;
  ctx.fillStyle = ok ? 'rgba(78, 143, 92, .14)' : 'rgba(192, 74, 52, .12)';
  ctx.beginPath(); rrPath(SIDE.x + 20, fy - 3, SIDE.w - 40, 32, 8); ctx.fill();
  text(ok ? 'آزمایشِ منصفانه: فقط یک چیز فرق دارد.'
          : (d.length === 0 ? 'دو ظرف کاملاً یکی‌اند؛ چیزی برای مقایسه نیست.'
                            : 'بیش از یک چیز فرق دارد؛ نتیجه معلوم نمی‌شود.'),
    SIDE.x + SIDE.w / 2, fy + 13, { size: 15, color: ok ? P.good : P.bad });
  if (S.fairMsg > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.fairMsg, 0, 1);
    ctx.strokeStyle = P.bad; ctx.lineWidth = 3;
    ctx.beginPath(); rrPath(SIDE.x + 16, fy - 7, SIDE.w - 32, 40, 10); ctx.stroke();
    ctx.restore();
  }

  /* جدول */
  ctx.fillStyle = 'rgba(37, 48, 42, .04)';
  ctx.beginPath(); rrPath(TABLE.x, TABLE.y, TABLE.w, TABLE.h, 10); ctx.fill();
  text('روز', TABLE.x + TABLE.w - 26, TABLE.y + 20, { size: 14, color: P.inkSoft, align: 'right' });
  text('ظرفِ ۱', TABLE.x + TABLE.w - 96, TABLE.y + 20, { size: 14, color: P.inkSoft, align: 'right' });
  text('ظرفِ ۲', TABLE.x + 96, TABLE.y + 20, { size: 14, color: P.inkSoft, align: 'right' });
  ctx.strokeStyle = 'rgba(37, 48, 42, .16)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(TABLE.x + 12, TABLE.y + 32); ctx.lineTo(TABLE.x + TABLE.w - 12, TABLE.y + 32); ctx.stroke();
  if (!S.note.length) {
    text('هنوز روزی نگذشته است.', TABLE.x + TABLE.w / 2, TABLE.y + 120, { size: 16, color: 'rgba(37,48,42,.4)' });
  }
  const maxSeeds = Math.max(S.pot[0].seeds, S.pot[1].seeds, 1);
  const rows = S.note.slice(-12);
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], y = TABLE.y + 48 + i * 20;
    numText(fa(r.day), TABLE.x + TABLE.w - 34, y, { size: 15, color: P.ink });
    numText(fa(r.a), TABLE.x + TABLE.w - 116, y, { size: 15, color: P.leafDk });
    numText(fa(r.b), TABLE.x + 76, y, { size: 15, color: P.leafDk });
    /* دو میلهٔ کوچک برای مقایسه با چشم */
    const bx = TABLE.x + 106, bw = TABLE.w - 250;
    ctx.fillStyle = 'rgba(37,48,42,.08)';
    ctx.beginPath(); rrPath(bx, y - 7, bw, 6, 3); ctx.fill();
    ctx.beginPath(); rrPath(bx, y + 1, bw, 6, 3); ctx.fill();
    ctx.fillStyle = '#6fae5c';
    ctx.beginPath(); rrPath(bx + bw - bw * (r.a / maxSeeds), y - 7, bw * (r.a / maxSeeds), 6, 3); ctx.fill();
    ctx.fillStyle = '#3f7d8c';
    ctx.beginPath(); rrPath(bx + bw - bw * (r.b / maxSeeds), y + 1, bw * (r.b / maxSeeds), 6, 3); ctx.fill();
  }

  /* دکمه‌های روز */
  const dayHot = S.hover && S.hover.k === 'day';
  button(BTN_DAY, 'یک روز جلو', { hot: dayHot, fill: '#3f7d8c', hotFill: '#4f97a8', size: 20,
    sub: 'روزِ ' + fa(S.day) + ' از ۱۲', subColor: 'rgba(255,255,255,.85)' });
  button(BTN_RUN, S.running ? 'ایست' : 'پخشِ روزها',
    { hot: S.hover && S.hover.k === 'run', fill: S.running ? '#c9962c' : '#5f8f6a', hotFill: S.running ? '#dda93c' : '#71a67c', size: 19 });
  button(BTN_NEW, 'از نو', { hot: S.hover && S.hover.k === 'new', fill: '#8d99a3', hotFill: '#a3aeb7', size: 19 });
  if (S.flash > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.flash, 0, 1);
    ctx.strokeStyle = P.bad; ctx.lineWidth = 3;
    ctx.beginPath(); rrPath(BTN_DAY.x - 4, BTN_DAY.y - 4, BTN_DAY.w + 8, BTN_DAY.h + 8, 16); ctx.stroke();
    ctx.restore();
  }
}

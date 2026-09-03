/*!
title: چاپخانهٔ روزنامه — انتخاب نمودار
bg: #e7dcc4
*/

/* ═══════════════════════════════════════════════════════════════════════
   چاپخانهٔ روزنامه — ریاضی سوم، فصل ۷، درس ۵ (انتخاب نمودار)
   ───────────────────────────────────────────────────────────────────────
   کتاب دو کار می‌خواهد: «اطّلاعات جدول را در یک نمودار ستونی قرار دهید»
   و «کدام‌یک از این نمودارهای دایره‌ای به‌طور تقریبی همان اطّلاعات را
   نشان می‌دهد؟ چرا؟»

   اینجا هر دو کار، کارِ چاپخانه است. خبر با یک جدول می‌رسد. اوّل باید
   ستون‌های صفحه را بالا بکشی تا هر ستون به بلندیِ درست برسد — و بلندی
   را از خط‌کشِ کنارِ صفحه می‌خوانی، نه از عددی که روی ستون نوشته باشد.
   خط‌کش گاهی یکی‌یکی است و گاهی پنج‌تا پنج‌تا؛ همین‌جاست که باید فکر
   کنی.

   بعد دستگاه سه قالبِ دایره‌ای پیش می‌آورد و باید همانی را انتخاب کنی
   که با ستون‌های خودت جور است: بزرگ‌ترین تکّه باید مالِ بلندترین ستون
   باشد. جواب هیچ‌جا نوشته نمی‌شود؛ روی همان نموداری که خودت ساخته‌ای
   پیدایش می‌کنی.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  wall:  '#e7dcc4', wallLo: '#cdbf9f', wallHi: '#f4ecd8',
  wood:  '#a97b46', woodDk: '#6d4b25', woodLt: '#d0a26a',
  iron:  '#6a6357', ironDk: '#3f3a32', ironLt: '#9b9385',
  paper: '#fbf6e8', card: '#fffdf6', ink: '#2b2a2e', inkSoft: '#7b7770',
  red:   '#c33f36', redDk: '#8e2620',
  brass: '#c39a3e', brassDk: '#8a6a1e', brassLt: '#eed9a6',
  good:  '#4e8f5c', bad: '#c33f36', gold: '#d9a026',
};

/* مرکّب‌های چاپخانه */
const INK = [
  { n: 'سرخ',  c: '#c85340', d: '#8f2f21' },
  { n: 'آبی',  c: '#3f7fb0', d: '#255579' },
  { n: 'سبز',  c: '#4e8f5c', d: '#2e6038' },
  { n: 'زرد',  c: '#d9a026', d: '#9a6c0e' },
  { n: 'بنفش', c: '#7a5fae', d: '#4d3a77' },
];

const STORIES = [
  { t: 'شیرفروشیِ محلّه', u: 'بطری', cats: ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'] },
  { t: 'میوهٔ مورد علاقه', u: 'رأی',  cats: ['سیب', 'پرتقال', 'انگور', 'هلو', 'انار'] },
  { t: 'کتاب‌های کتابخانه', u: 'کتاب', cats: ['داستان', 'علمی', 'شعر', 'تاریخ', 'نقّاشی'] },
  { t: 'ورزشِ کلاس',       u: 'نفر',  cats: ['فوتبال', 'والیبال', 'شنا', 'دو', 'بسکتبال'] },
];

const LEVELS = [
  { name: 'صفحهٔ اوّل', cats: 3, rows: 6, scale: 1, pie: false, quota: 3, time: 74,
    hint: 'ستون را بالا بکِش تا به عددِ خط‌کش برسد.' },
  { name: 'خط‌کشِ دوتایی', cats: 4, rows: 7, scale: 2, pie: true, quota: 3, time: 88,
    hint: 'هر خانهٔ خط‌کش حالا دوتاست.' },
  { name: 'خط‌کشِ پنج‌تایی', cats: 4, rows: 7, scale: 5, pie: true, quota: 3, time: 92,
    hint: 'قالبِ دایره‌ای را با ستون‌های خودت بسنج.' },
  { name: 'شمارهٔ ویژه', cats: 5, rows: 8, scale: 5, pie: true, quota: 4, time: 96,
    hint: 'بزرگ‌ترین تکّه مالِ بلندترین ستون است.' },
  { name: 'تا مرکّب هست', cats: 5, rows: 8, scale: 0, pie: true, time: 92, endless: true,
    hint: 'تا مرکّب هست، روزنامه چاپ کن.' },
];

const CHART = { x: 336, y: 104, w: 828, base: 498, rows: 8 };
const SHEET = { x: 30, y: 96, w: 282, h: 404 };
const PLATES = { y: 658, r: 62 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', stage: 'bars',
  level: 0, rows: 6, scale: 1,
  story: 0, cats: [],          /* { name, ink, qty } */
  bar: [],                     /* بلندیِ ستون‌ها بر حسبِ خانه */
  plates: [], right: 0, picked: -1,
  drag: -1, wrong: 0, roll: 0,
  timeLeft: 0, inks: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  done: 0, doneT: 0,
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function loadBest() { try { return +localStorage.getItem('chap-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('chap-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();

/* ───────── خبرِ تازه ───────── */

function newStory() {
  const lv = L();
  const k = lv.cats;
  const rows = lv.rows;
  const scale = lv.scale || [1, 2, 5][R(0, 2)];
  let h;
  for (let tries = 0; tries < 200; tries++) {
    h = [];
    for (let i = 0; i < k; i++) h.push(R(1, rows));
    const mx = Math.max(...h), mn = Math.min(...h);
    if (mx === mn) continue;                       /* همه‌برابر، قالبِ دایره‌ای بی‌معنا می‌شود */
    if (h.filter((v) => v === mx).length !== 1) continue;   /* بلندترین ستون باید یکی باشد */
    if (h.filter((v) => v === mn).length !== 1) continue;
    break;
  }
  const st = R(0, STORIES.length - 1);
  const names = STORIES[st].cats.slice(0, k);
  const inks = [0, 1, 2, 3, 4];
  for (let i = inks.length - 1; i > 0; i--) { const j = R(0, i); const t = inks[i]; inks[i] = inks[j]; inks[j] = t; }
  S.story = st;
  S.rows = rows; S.scale = scale;
  S.cats = names.map((n, i) => ({ name: n, ink: inks[i], qty: h[i] * scale }));
  S.bar = new Array(k).fill(0);
  S.stage = 'bars';
  S.plates = []; S.right = 0; S.picked = -1;
  S.wrong = 0; S.roll = 0;
  S.done = 0; S.doneT = 0;
}

/** سه قالبِ دایره‌ای: یکی درست، یکی همه‌برابر، یکی با جای عوض‌شدهٔ بیشترین و کمترین. */
function makePlates() {
  const share = S.cats.map((c) => c.qty);
  const k = share.length;
  const mxI = share.indexOf(Math.max(...share));
  const mnI = share.indexOf(Math.min(...share));
  const swapped = share.slice();
  const tmp = swapped[mxI]; swapped[mxI] = swapped[mnI]; swapped[mnI] = tmp;
  const equal = new Array(k).fill(1);
  const list = [
    { v: share, ok: true },
    { v: swapped, ok: false },
    { v: equal, ok: false },
  ];
  for (let i = list.length - 1; i > 0; i--) { const j = R(0, i); const t = list[i]; list[i] = list[j]; list[j] = t; }
  S.plates = list;
  S.right = list.findIndex((p) => p.ok);
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.inks = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newStory();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

newStory();
whenFontsReady(() => runLoop(step));

const rowH = () => (CHART.base - CHART.y) / S.rows;
function barBox(i) {
  const k = S.cats.length;
  const w = k <= 3 ? 122 : (k === 4 ? 108 : 92);
  const gap = k <= 3 ? 56 : (k === 4 ? 44 : 34);
  const total = k * w + (k - 1) * gap;
  const x = CHART.x + (CHART.w - total) / 2 + i * (w + gap);
  return { x, w, top: CHART.base - S.bar[i] * rowH(), h: S.bar[i] * rowH() };
}
const barOK = (i) => S.bar[i] * S.scale === S.cats[i].qty;
const barsOK = () => S.cats.every((_, i) => barOK(i));
function plateBox(i) {
  const gap = 92;
  const total = 3 * PLATES.r * 2 + 2 * gap;
  return { x: CHART.x + (CHART.w - total) / 2 + i * (PLATES.r * 2 + gap) + PLATES.r, y: PLATES.y, r: PLATES.r };
}

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.wrong > 0) S.wrong -= dt;
  if (S.roll > 0) S.roll -= dt;

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.done) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseInk('وقتِ چاپ تمام شد!'); }
    }
    if (S.done) { S.doneT += dt; if (S.doneT > 2.2) { newStory(); S.timeLeft = L().time; } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseInk(msg) {
  if (S.done) return;
  S.inks--;
  S.combo = 0;
  S.shake = .5;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.inks <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newStory();
}

function setBar(i, h) {
  if (S.phase !== 'play' || S.stage !== 'bars' || S.done) return;
  h = clamp(h, 0, S.rows);
  if (h === S.bar[i]) return;
  const was = barOK(i);
  S.bar[i] = h;
  sfx.tone(300 + h * 34, .05, 'triangle', .05);
  if (!was && barOK(i)) {
    sfx.place();
    const b = barBox(i);
    bits.add(b.x + b.w / 2, b.top, 10, 'dot', [INK[S.cats[i].ink].c, '#fff'],
      { speed: 150, lift: 60, size: 3.4, life: .5, grav: 320 });
  }
  if (S.tut.on && S.tut.step === 1 && barOK(i)) { S.tut.step = 2; S.tut.t = 0; }
  if (barsOK()) {
    if (L().pie) {
      S.stage = 'plates';
      makePlates();
      S.roll = .6;
      sfx.slide();
      toast.say('ستون‌ها جور شد. حالا قالبِ دایره‌ای را انتخاب کن.', 'good');
    } else finish();
  }
}

function choosePlate(i) {
  if (S.stage !== 'plates' || S.done) return;
  S.picked = i;
  if (i === S.right) { sfx.good(); finish(); }
  else {
    S.wrong = .9;
    S.shake = .2;
    sfx.nope();
    S.timeLeft = Math.max(5, S.timeLeft - 6);
    toast.say('این قالب با ستون‌های تو جور نیست.', 'bad');
    S.picked = -1;
  }
}

function finish() {
  S.done = .001; S.doneT = 0;
  S.combo++;
  S.cleared++;
  S.score += 320 + S.cats.length * 60 + Math.round(S.timeLeft * 4) + Math.min(S.combo, 6) * 70;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(SCENE_W / 2, 300, 46, [P.red, P.gold, INK[1].c, INK[2].c, '#fff']);
  sfx.win();
  toast.say('روزنامه چاپ شد!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function colAt(p) {
  if (p.y < CHART.y - 30 || p.y > CHART.base + 40) return -1;
  for (let i = 0; i < S.cats.length; i++) {
    const b = barBox(i);
    if (p.x >= b.x - 8 && p.x <= b.x + b.w + 8) return i;
  }
  return -1;
}
const rowAt = (p) => Math.round((CHART.base - p.y) / rowH());

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.drag >= 0) {
    if (e.buttons === 0 && e.pointerType === 'mouse') { S.drag = -1; return; }
    setBar(S.drag, rowAt(p));
    return;
  }
  S.hover = null;
  if (S.stage === 'bars') { const i = colAt(p); if (i >= 0) S.hover = { k: 'bar', i }; }
  else for (let i = 0; i < 3; i++) if (inCircle(p, plateBox(i), 10)) S.hover = { k: 'plate', i };
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { startLevel(0); return; }
  if (S.phase === 'won') {
    if (!inRect(p, BTN_GO)) return;
    if (L().endless) startLevel(S.level, true);
    else if (S.level + 1 < LEVELS.length) startLevel(S.level + 1, true);
    else startLevel(0);
    return;
  }
  if (S.phase === 'lost') { if (inRect(p, BTN_GO)) startLevel(S.level); return; }
  if (tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  S.drag = -1;
  if (S.stage === 'plates') {
    for (let i = 0; i < 3; i++) if (inCircle(p, plateBox(i), 12)) { choosePlate(i); return; }
    return;
  }
  const i = colAt(p);
  if (i >= 0) {
    S.drag = i;
    setBar(i, rowAt(p));
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
  }
});

cv.addEventListener('pointerup', () => { S.drag = -1; });
cv.addEventListener('pointercancel', () => { S.drag = -1; });
cv.addEventListener('pointerleave', () => { S.drag = -1; });
addEventListener('blur', () => { S.drag = -1; });

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

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(30, 24, 14, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .4, () => {
    ctx.fillStyle = 'rgba(255, 253, 246, .98)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '60, 40, 16');
  ctx.fillStyle = P.red;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6c675f' }); yy += 30; }
  return h + 20;
}

/** یک قالبِ دایره‌ایِ چاپ. */
function plate(cx, cy, r, vals, o = {}) {
  const tot = vals.reduce((a, b) => a + b, 0) || 1;
  /* بشقابِ فلزی */
  ctx.fillStyle = P.ironDk;
  ctx.beginPath(); ctx.arc(cx, cy + 3, r + 12, 0, TAU); ctx.fill();
  ctx.fillStyle = ball(cx - r * .3, cy - r * .3, r * 2.4, P.ironLt, P.iron, P.ironDk);
  ctx.beginPath(); ctx.arc(cx, cy, r + 9, 0, TAU); ctx.fill();
  ctx.fillStyle = P.card;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  let a = -Math.PI / 2;
  for (let i = 0; i < vals.length; i++) {
    const a1 = a + vals[i] / tot * TAU;
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a, a1); ctx.closePath();
    const mid = (a + a1) / 2;
    const g = ctx.createRadialGradient(cx + Math.cos(mid) * r * .3, cy + Math.sin(mid) * r * .3, 2, cx, cy, r);
    g.addColorStop(0, shade(INK[S.cats[i].ink].c, .3));
    g.addColorStop(1, INK[S.cats[i].ink].d);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(43, 42, 46, .45)'; ctx.lineWidth = 2;
    ctx.stroke();
    a = a1;
  }
  ctx.strokeStyle = P.ironDk; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
  /* پیچ‌های بشقاب */
  for (let i = 0; i < 6; i++) {
    const b = i / 6 * TAU + .3;
    ctx.fillStyle = P.brass;
    ctx.beginPath(); ctx.arc(cx + Math.cos(b) * (r + 5), cy + Math.sin(b) * (r + 5), 3.4, 0, TAU); ctx.fill();
  }
  if (o.ring) {
    ctx.save();
    ctx.globalAlpha = o.ringAlpha === undefined ? 1 : o.ringAlpha;
    ctx.strokeStyle = o.ring; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, r + 18, 0, TAU); ctx.stroke();
    ctx.restore();
  }
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintPressStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallHi); g.addColorStop(.55, P.wall); g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.globalAlpha = .5;
  ctx.fillStyle = texPaper(P.wall);
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* پنجرهٔ بزرگِ چاپخانه، نورِ روز */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const wg = ctx.createRadialGradient(240, 90, 40, 240, 90, 760);
  wg.addColorStop(0, 'rgba(255, 246, 214, .5)');
  wg.addColorStop(1, 'rgba(255, 246, 214, 0)');
  ctx.fillStyle = wg;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* تخته‌های دیوار */
  ctx.strokeStyle = 'rgba(109, 75, 37, .16)'; ctx.lineWidth = 2;
  for (let x = 0; x < SCENE_W; x += 96) { ctx.beginPath(); ctx.moveTo(x, HUD_H); ctx.lineTo(x, 620); ctx.stroke(); }
  /* کفِ چوبی */
  ctx.fillStyle = P.woodDk;
  ctx.fillRect(0, 612, SCENE_W, SCENE_H - 612);
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.fillRect(0, 620, SCENE_W, SCENE_H - 620);
  ctx.fillStyle = 'rgba(255, 246, 214, .28)';
  ctx.fillRect(0, 620, SCENE_W, 3);
  const fg = ctx.createLinearGradient(0, 620, 0, SCENE_H);
  fg.addColorStop(0, 'rgba(255, 246, 214, .16)');
  fg.addColorStop(1, 'rgba(60, 40, 16, .42)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, 620, SCENE_W, SCENE_H - 620);
  /* میزِ حروف‌چینی زیرِ نمودار */
  ctx.fillStyle = 'rgba(109, 75, 37, .22)';
  ctx.beginPath(); rrPath(CHART.x - 26, CHART.y - 30, CHART.w + 52, CHART.base - CHART.y + 90, 16); ctx.fill();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.wall);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('press', SCENE_W, SCENE_H, paintPressStatic), 0, 0, SCENE_W, SCENE_H);
  drawSheet();
  drawChart();
  if (S.stage === 'plates') drawPlates();
  else drawPressIdle();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.13, 'rgba(70, 46, 16, .3)', .3, .1);
}

/** برگهٔ خبر: جدولِ کتاب. */
function drawSheet() {
  paper(SHEET.x, SHEET.y, SHEET.w, SHEET.h, P.card, 21, 12, .3);
  const st = STORIES[S.story];
  ctx.fillStyle = P.red;
  ctx.beginPath(); rrPath(SHEET.x + 18, SHEET.y + 16, SHEET.w - 36, 6, 3); ctx.fill();
  text(st.t, SHEET.x + SHEET.w / 2, SHEET.y + 48, { size: 22, family: 'Lalezar', color: P.ink });
  text('جدولِ خبر', SHEET.x + SHEET.w / 2, SHEET.y + 76, { size: 14, color: P.inkSoft });
  ctx.strokeStyle = 'rgba(43, 42, 46, .22)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(SHEET.x + 22, SHEET.y + 92); ctx.lineTo(SHEET.x + SHEET.w - 22, SHEET.y + 92); ctx.stroke();
  for (let i = 0; i < S.cats.length; i++) {
    const c = S.cats[i], y = SHEET.y + 120 + i * 54;
    const ok = barOK(i);
    ctx.fillStyle = ok ? 'rgba(78, 143, 92, .14)' : 'rgba(43, 42, 46, .04)';
    ctx.beginPath(); rrPath(SHEET.x + 18, y - 22, SHEET.w - 36, 46, 9); ctx.fill();
    ctx.fillStyle = INK[c.ink].c;
    ctx.beginPath(); rrPath(SHEET.x + SHEET.w - 46, y - 12, 22, 24, 5); ctx.fill();
    text(c.name, SHEET.x + SHEET.w - 56, y, { size: 17, color: P.ink, align: 'right' });
    numText(fa(c.qty), SHEET.x + 44, y + 1, { size: 23, color: P.ink, align: 'left' });
    if (ok) {
      ctx.strokeStyle = P.good; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(SHEET.x + 84, y); ctx.lineTo(SHEET.x + 92, y + 8); ctx.lineTo(SHEET.x + 106, y - 10);
      ctx.stroke();
    }
  }
  text(st.u, SHEET.x + SHEET.w / 2, SHEET.y + SHEET.h - 26, { size: 14, color: P.inkSoft });
}

function drawChart() {
  const rh = rowH();
  /* خط‌کشِ کنارِ صفحه */
  ctx.strokeStyle = 'rgba(43, 42, 46, .16)'; ctx.lineWidth = 1.6;
  for (let r = 0; r <= S.rows; r++) {
    const y = CHART.base - r * rh;
    ctx.beginPath(); ctx.moveTo(CHART.x, y); ctx.lineTo(CHART.x + CHART.w - 96, y); ctx.stroke();
    numText(fa(r * S.scale), CHART.x + CHART.w - 62, y, { size: 19, color: r ? P.inkSoft : P.ink });
    ctx.strokeStyle = 'rgba(43, 42, 46, .5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(CHART.x + CHART.w - 96, y); ctx.lineTo(CHART.x + CHART.w - 86, y); ctx.stroke();
    ctx.strokeStyle = 'rgba(43, 42, 46, .16)'; ctx.lineWidth = 1.6;
  }
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(CHART.x + CHART.w - 96, CHART.y - 10); ctx.lineTo(CHART.x + CHART.w - 96, CHART.base);
  ctx.lineTo(CHART.x, CHART.base);
  ctx.stroke();
  text(STORIES[S.story].u, CHART.x + CHART.w - 34, CHART.y - 22, { size: 15, color: P.inkSoft });

  for (let i = 0; i < S.cats.length; i++) {
    const b = barBox(i), c = S.cats[i];
    const ok = barOK(i);
    const hot = S.hover && S.hover.k === 'bar' && S.hover.i === i;
    /* جای خالیِ ستون */
    if (S.stage === 'bars') {
      ctx.strokeStyle = hot ? 'rgba(43, 42, 46, .3)' : 'rgba(43, 42, 46, .12)';
      ctx.lineWidth = 1.6; ctx.setLineDash([6, 7]);
      ctx.beginPath(); rrPath(b.x, CHART.y, b.w, CHART.base - CHART.y, 6); ctx.stroke();
      ctx.setLineDash([]);
    }
    if (S.bar[i] > 0) {
      withShadow(12, 5, .28, () => {
        ctx.fillStyle = INK[c.ink].d;
        ctx.beginPath(); rrPath(b.x, b.top, b.w, b.h, 5); ctx.fill();
      }, '60, 40, 16');
      const g = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
      g.addColorStop(0, shade(INK[c.ink].c, .28));
      g.addColorStop(.55, INK[c.ink].c);
      g.addColorStop(1, INK[c.ink].d);
      ctx.fillStyle = g;
      ctx.beginPath(); rrPath(b.x, b.top, b.w - 3, b.h, 5); ctx.fill();
      /* خط‌های خانه‌ها روی ستون تا شمردنی باشد */
      ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1.4;
      for (let r = 1; r < S.bar[i]; r++) {
        const y = CHART.base - r * rh;
        ctx.beginPath(); ctx.moveTo(b.x + 6, y); ctx.lineTo(b.x + b.w - 9, y); ctx.stroke();
      }
      /* سرِ ستون */
      ctx.fillStyle = ok ? P.good : shade(INK[c.ink].c, .45);
      ctx.beginPath(); rrPath(b.x - 3, b.top - 7, b.w + 3, 10, 4); ctx.fill();
      if (ok) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(b.x + b.w / 2 - 10, b.top - 22); ctx.lineTo(b.x + b.w / 2 - 3, b.top - 15);
        ctx.lineTo(b.x + b.w / 2 + 11, b.top - 30);
        ctx.stroke();
      }
    }
    /* نامِ ستون زیرِ محور */
    ctx.fillStyle = INK[c.ink].c;
    ctx.beginPath(); rrPath(b.x + b.w / 2 - 11, CHART.base + 10, 22, 10, 4); ctx.fill();
    text(c.name, b.x + b.w / 2, CHART.base + 38, { size: 16, family: 'Lalezar', color: P.ink });
    if (S.stage === 'bars' && hot) {
      ctx.strokeStyle = P.red; ctx.lineWidth = 2.4;
      ctx.beginPath(); rrPath(b.x - 4, CHART.y - 4, b.w + 8, CHART.base - CHART.y + 8, 7); ctx.stroke();
    }
  }
}

/** سه قالبِ دستگاه: یکی با ستون‌ها جور است. */
function drawPlates() {
  const k = clamp(1 - S.roll / .6, 0, 1);
  ctx.save();
  ctx.globalAlpha = k;
  ctx.fillStyle = 'rgba(43, 42, 46, .1)';
  ctx.beginPath(); rrPath(CHART.x - 20, PLATES.y - PLATES.r - 44, CHART.w + 40, PLATES.r * 2 + 74, 16); ctx.fill();
  text('کدام قالب با ستون‌های تو جور است؟', SCENE_W / 2, PLATES.y - PLATES.r - 22,
    { size: 19, family: 'Lalezar', color: P.ink });
  for (let i = 0; i < 3; i++) {
    const b = plateBox(i);
    const hot = S.hover && S.hover.k === 'plate' && S.hover.i === i;
    const bad = S.wrong > 0 && S.picked === -1 && hot;
    ctx.save();
    ctx.translate(b.x, b.y + (1 - k) * 60);
    ctx.translate(-b.x, -b.y);
    plate(b.x, b.y, b.r, S.plates[i].v,
      { ring: hot ? P.red : null, ringAlpha: .6 + .3 * Math.sin(S.t * 6) });
    ctx.restore();
    if (bad) {
      ctx.save();
      ctx.globalAlpha = clamp(S.wrong, 0, 1);
      ctx.strokeStyle = P.bad; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.x - 26, b.y - 26); ctx.lineTo(b.x + 26, b.y + 26);
      ctx.moveTo(b.x + 26, b.y - 26); ctx.lineTo(b.x - 26, b.y + 26);
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawPressIdle() {
  ctx.fillStyle = 'rgba(43, 42, 46, .08)';
  ctx.beginPath(); rrPath(CHART.x - 20, PLATES.y - PLATES.r - 44, CHART.w + 40, PLATES.r * 2 + 74, 16); ctx.fill();
  /* غلتکِ دستگاه، آمادهٔ چاپ */
  const cx = SCENE_W / 2;
  ctx.fillStyle = P.ironDk;
  ctx.beginPath(); rrPath(cx - 190, PLATES.y - 26, 380, 52, 26); ctx.fill();
  ctx.fillStyle = ball(cx - 60, PLATES.y - 16, 300, P.ironLt, P.iron, P.ironDk);
  ctx.beginPath(); rrPath(cx - 184, PLATES.y - 22, 368, 42, 21); ctx.fill();
  for (let i = -3; i <= 3; i++) {
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath(); rrPath(cx + i * 52 - 3, PLATES.y - 22, 6, 42, 3); ctx.fill();
  }
  text('اوّل ستون‌ها را جور کن', cx, PLATES.y + 52, { size: 16, color: P.inkSoft });
}

function drawHUD() {
  ctx.fillStyle = 'rgba(43, 42, 46, .94)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = P.red;
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.card, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 226 - i * 32;
    ctx.save();
    ctx.globalAlpha = i < S.inks ? 1 : .22;
    ctx.fillStyle = i < S.inks ? INK[i].c : '#8a867e';
    ctx.beginPath(); rrPath(x - 9, HUD_H / 2 - 10, 18, 22, 4); ctx.fill();
    ctx.fillStyle = i < S.inks ? '#f3ecd8' : '#a9a49a';
    ctx.beginPath(); rrPath(x - 6, HUD_H / 2 - 14, 12, 6, 2); ctx.fill();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(251, 246, 232, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
  const k = clamp(S.timeLeft / L().time, 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.beginPath(); rrPath(SCENE_W / 2 - 150, HUD_H - 10, 300, 5, 3); ctx.fill();
  ctx.fillStyle = k > .3 ? P.gold : P.red;
  ctx.beginPath(); rrPath(SCENE_W / 2 - 150, HUD_H - 10, 300 * k, 5, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: SHEET.x, y: SHEET.y, w: SHEET.w, h: SHEET.h }], .74);
    const h = tutCard(360, 200, 560,
      ['خبر با یک جدول می‌رسد: هر چیز چند تا.'], 'چاپخانهٔ روزنامه');
    tutMore(640, 200 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: CHART.x - 20, y: CHART.y - 24, w: CHART.w + 40, h: CHART.base - CHART.y + 80 }], .7);
    tutCard(300, 566, 600, ['ستون را بالا بکِش تا سرش به عددِ خط‌کش برسد.',
      'خط‌کش کنارِ صفحه است — عددهایش را بخوان.']);
  } else {
    spot([{ x: CHART.x + CHART.w - 130, y: CHART.y - 20, w: 130, h: CHART.base - CHART.y + 40 }], .72);
    const h = tutCard(120, 150, 540,
      ['خط‌کش گاهی یکی‌یکی است و گاهی پنج‌تا پنج‌تا.',
       'ستون‌ها که جور شد، دستگاه سه قالبِ دایره‌ای می‌آورد؛',
       'همانی را بردار که با ستون‌هایت جور است.'], 'خط‌کش را بخوان');
    tutMore(390, 150 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function pressIcon(x, y) {
  const hs = [26, 40, 16, 32];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = INK[i].c;
    ctx.beginPath(); rrPath(x - 56 + i * 30, y + 24 - hs[i], 22, hs[i], 4); ctx.fill();
  }
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 62, y - 22); ctx.lineTo(x - 62, y + 26); ctx.lineTo(x + 56, y + 26); ctx.stroke();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 800, h: 300, y: 128,
    paper: P.card, band: P.red, ink: P.ink, inkSoft: '#6c675f',
    icon: pressIcon,
    title: 'چاپخانهٔ روزنامه',
    body: 'خبر با یک جدول می‌رسد. ستون‌های صفحه را بالا بکِش تا هر ستون\nبه عددِ خودش برسد — بلندی را از خط‌کشِ کنارِ صفحه می‌خوانی.\nبعد دستگاه سه قالبِ دایره‌ای می‌آورد؛ همانی را بردار که جور است.',
    btn: BTN_GO, btnLabel: 'دستگاه را روشن کن', btnHot: S.hover === BTN_GO,
    btnFill: '#c33f36', btnHotFill: '#d8564c',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.card, band: P.gold, ink: P.ink, inkSoft: '#6c675f',
    icon: pressIcon,
    title: L().endless ? 'مرکّب تمام شد' : 'روزنامه رفت زیرِ چاپ!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ شماره‌ها را چاپ کردی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'خبرِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#c33f36', btnHotFill: '#d8564c',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.card, band: P.bad, ink: P.ink, inkSoft: '#6c675f',
    icon: (x, y) => {
      ctx.fillStyle = '#8a867e';
      ctx.beginPath(); rrPath(x - 16, y - 16, 32, 40, 6); ctx.fill();
      ctx.fillStyle = '#c8c3b8';
      ctx.beginPath(); rrPath(x - 10, y - 24, 20, 10, 3); ctx.fill();
      pressIcon(x + 70, y);
    },
    title: 'مرکّب‌ها تمام شد',
    body: 'امتیاز: ' + fa(S.score) + '\nخط‌کش را بخوان: هر خانه چندتاست؟',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#c33f36', btnHotFill: '#d8564c',
  });
}

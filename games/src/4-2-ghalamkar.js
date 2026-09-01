/*!
title: کارگاهِ قلمکار — ضرب
bg: #1b1710
*/

/* ═══════════════════════════════════════════════════════════════════════
   کارگاهِ قلمکار — ریاضی سوم، فصل ۴، درس ۲ (ضرب)
   ───────────────────────────────────────────────────────────────────────
   کتاب ضرب را با «دسته‌های مساوی» شروع می‌کند: طاها در هر بسته ۴ شکلات
   گذاشت و همسایه ۳ بسته برداشت، پس ۳ × ۴ = ۱۲. بعد همین را با آجرچینی و
   با مستطیل و با جمعِ مکرّر نشان می‌دهد.

   اینجا مهرِ چوبیِ قلمکار همان بسته است:

     هر مهر تعدادِ نقشِ خودش را دارد. هر ضربه یک ردیفِ کامل چاپ می‌کند.

   پس اگر مهرِ چهارتایی را سه بار بزنی، پارچه‌ات می‌شود یک مستطیلِ ۳ در ۴ —
   هم دسته‌های مساوی، هم مستطیل، هم ۴+۴+۴. هر سه تصویرِ کتاب، یک‌جا.

   و یک قاعدهٔ سخت‌گیر: نقشِ قلمکار باید منظّم باشد. اگر وسطِ کار مهر را
   عوض کنی، ردیف‌ها هم‌اندازه نمی‌مانند و استاد پارچه را قبول نمی‌کند.
   یعنی تعدادِ کل، به‌تنهایی کافی نیست؛ باید از دسته‌های مساوی درآمده باشد.

   مرکّب شمرده است، پس برای رسیدن به سفارش باید مهرِ درست را پیدا کنی —
   همان چیزی که بعدها اسمش می‌شود «شمارنده».
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const MAXROW = 9;

const P = {
  wallHi:  '#4a3a26',
  wallLo:  '#191309',
  wood:    '#8a5f33',
  woodLit: '#a9793f',
  woodDk:  '#573818',
  cloth:   '#f4ecd8',
  clothDk: '#ded3ba',
  clothSh: '#c9bd9f',
  indigo:  '#2f4b8c',
  madder:  '#b23b3b',
  saffron: '#dfa02c',
  leafG:   '#4b7a45',
  plum:    '#7a3f68',
  ink:     '#2b2318',
  inkSoft: '#7d7060',
  paper:   '#fbf3e2',
  brass:   '#d3a349',
  brassDk: '#8f6a24',
  good:    '#6fa85c',
  bad:     '#cf5f4a',
  gold:    '#f0c552',
  glow:    'rgba(255, 210, 130, .2)',
};

/* مهرها: هر کدام چند نقش دارد، با نقش و رنگِ خودش. */
const STAMPS = [
  { n: 2, col: P.indigo,  motif: 0 },
  { n: 3, col: P.madder,  motif: 1 },
  { n: 4, col: P.leafG,   motif: 2 },
  { n: 5, col: P.saffron, motif: 3 },
  { n: 6, col: P.plum,    motif: 0 },
  { n: 7, col: P.indigo,  motif: 1 },
  { n: 8, col: P.madder,  motif: 2 },
  { n: 9, col: P.leafG,   motif: 3 },
];

const LEVELS = [
  { target: 12, ink: 6,
    hint: 'مهر را انتخاب کن و روی پارچه بزن. هر ضربه یک ردیفِ کامل می‌زند.' },
  { target: 18, ink: 4,
    hint: 'فقط چهار ضربه مرکّب داری. کدام مهر با چهار ضربه هجده می‌شود؟' },
  { target: 24, ink: 4,
    hint: 'باز هم چهار ضربه.' },
  { target: 35, ink: 5,
    hint: 'پنج ضربه، سی و پنج نقش.' },
  { target: 42, ink: 6,
    hint: 'شش ضربه. مهرها را نگاه کن.' },
  { endless: true,
    hint: 'سفارش‌ها پشتِ سرِ هم می‌آیند. مرکّب را حرام نکن.' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  target: 0,
  ink: 0, inkMax: 0,
  sel: 2,                 // اندیسِ مهرِ انتخاب‌شده
  rows: [],               // [{ s: اندیسِ مهر, t: عمرِ انیمیشن }]
  hearts: 3,
  score: 0, best: 0,
  done: 0,
  press: 0,               // انیمیشنِ ضربه
  t: 0, phaseT: 0,
  hover: null,
  shake: 0,
  motes: [],
  floats: [],
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const total = () => S.rows.reduce((a, r) => a + STAMPS[r.s].n, 0);
const tidy = () => S.rows.length > 0 && S.rows.every((r) => r.s === S.rows[0].s);

function loadBest() { try { return +localStorage.getItem('ghalam-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('ghalam-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── چیدمان ───────── */

const HUD_H = 52;
const CARD = { x: 26, y: 84, w: 286, h: 210 };
const INKB = { x: 26, y: 312, w: 286, h: 150 };
const CLOTH = { x: 344, y: 88, w: 504, h: 504 };
const CELL = CLOTH.w / MAXROW;
const RACK = { x: 880, y: 88, w: 296 };
const EXPR = { x: 344, y: 612, w: 504, h: 118 };
const BTN_PRINT = { x: 880, y: 548, w: 296, h: 74 };
const BTN_CLEAR = { x: 880, y: 634, w: 296, h: 58 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

function stampBox(i) {
  const w = 140, h = 92, gx = 12, gy = 8;
  return { x: RACK.x + (i % 2) * (w + gx), y: RACK.y + 40 + Math.floor(i / 2) * (h + gy), w, h };
}
function cellPos(r, c) {
  return { x: CLOTH.x + c * CELL + CELL / 2, y: CLOTH.y + r * CELL + CELL / 2 };
}

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 22; i++) {
  S.motes.push({ x: Math.random() * SCENE_W, y: Math.random() * SCENE_H,
                 ph: Math.random() * TAU, sp: .2 + Math.random() * .4, r: .8 + Math.random() * 1.6 });
}
whenFontsReady(() => runLoop(step));

/** سفارشِ تصادفی: همیشه با یک مهر و در حدِ مرکّب شدنی است. */
function randomOrder() {
  const rows = 2 + Math.floor(Math.random() * 5);          // ۲ تا ۶ ضربه
  const s = 2 + Math.floor(Math.random() * 8);             // مهرِ ۲ تا ۹
  return { target: rows * s, ink: rows + 1 };
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  const o = lv.endless ? randomOrder() : { target: lv.target, ink: lv.ink };
  S.target = o.target;
  S.ink = o.ink; S.inkMax = o.ink;
  S.rows = [];
  S.sel = 2;
  S.press = 0;
  if (!keep) { S.hearts = 3; S.done = 0; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  toast.say(lv.hint, 'info');
}

function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 24 }); }

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.press > 0) S.press = Math.max(0, S.press - dt * 3.4);
  for (const r of S.rows) if (r.t < 1) r.t = Math.min(1, r.t + dt * 3.2);
  for (const m of S.motes) {
    m.ph += dt * m.sp; m.y -= dt * (5 + m.sp * 10); m.x += Math.sin(m.ph) * dt * 8;
    if (m.y < -10) { m.y = SCENE_H + 10; m.x = Math.random() * SCENE_W; }
  }
  for (const f of S.floats) { f.t += dt; f.y -= 42 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.5);
  if (S.phase === 'play' && S.tut.on) tutStep(dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── چاپ ───────── */

function pressStamp() {
  if (S.phase !== 'play') return;
  if (S.rows.length >= MAXROW) {
    S.shake = .2; sfx.nope();
    toast.say('پارچه جا ندارد', 'bad');
    return;
  }
  if (S.ink <= 0) {
    S.shake = .24; sfx.nope();
    toast.say('مرکّب تمام شد — پارچه را پاک کن یا از نو شروع کن', 'bad');
    return;
  }
  S.rows.push({ s: S.sel, t: 0 });
  S.ink--;
  S.press = 1;
  sfx.tone(210, .16, 'triangle', .08);
  const y = CLOTH.y + (S.rows.length - .5) * CELL;
  bits.add(CLOTH.x + CLOTH.w / 2, y, 12, 'dot',
    [STAMPS[S.sel].col, '#fff'], { speed: 150, lift: 30, size: 3.2, life: .5 });
  check();
}

function clearCloth() {
  if (S.phase !== 'play') return;
  S.rows = [];
  sfx.slide();
  if (S.ink <= 0) noInk();
}

function noInk() {
  S.hearts--;
  S.shake = .34;
  sfx.nope();
  if (S.hearts <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.ink = S.inkMax;
  S.rows = [];
  toast.say('مرکّبِ تازه — یک دل کم شد', 'bad');
}

function check() {
  if (!tidy() || S.rows.length < 2 || total() !== S.target) {
    if (S.ink <= 0 && total() !== S.target) setTimeout(() => { if (S.phase === 'play') noInk(); }, 700);
    return;
  }
  const pts = 300 + S.ink * 150;
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  S.done++;
  floatText(CLOTH.x + CLOTH.w / 2, CLOTH.y + 60, `+${fa(pts)}`, P.gold);
  bits.confetti(CLOTH.x + CLOTH.w / 2, CLOTH.y + CLOTH.h / 2, 70,
    [P.gold, P.indigo, P.madder, P.saffron, '#fff']);
  sfx.win();
  S.phase = 'won'; S.phaseT = 0;
}

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 30) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 1 && S.rows.length > 0) { S.tut.step = 2; S.tut.t = 0; }
  if (S.tut.step === 2 && S.tut.t > 30) S.tut.on = false;
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (inRect(p, BTN_PRINT)) return BTN_PRINT;
  if (inRect(p, BTN_CLEAR)) return BTN_CLEAR;
  for (let i = 0; i < STAMPS.length; i++) if (inRect(p, stampBox(i))) return { stamp: i };
  if (inRect(p, CLOTH)) return { cloth: true };
  return null;
}

cv.addEventListener('pointermove', (e) => {
  S.hover = hitTest(toStage(e));
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});
cv.addEventListener('pointerleave', () => { S.hover = null; });
cv.addEventListener('pointerdown', (e) => {
  if (S.phase === 'play' && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  const h = hitTest(toStage(e));
  if (S.phase === 'intro') { if (h) startLevel(0); return; }
  if (S.phase === 'won') {
    if (!h) return;
    if (L().endless) startLevel(S.level, true);
    else if (S.level + 1 < LEVELS.length) startLevel(S.level + 1, true);
    else { S.score = 0; startLevel(0); }
    return;
  }
  if (S.phase === 'lost') { if (h) { S.score = 0; startLevel(S.level); } return; }
  if (!h) return;
  if (h === BTN_PRINT || h.cloth) return pressStamp();
  if (h === BTN_CLEAR) return clearCloth();
  if (h.stamp !== undefined) { S.sel = h.stamp; sfx.tap(); }
});

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
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 20);
  ctx.fillStyle = `rgba(14, 10, 5, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function pointHand(x, y) {
  const bob = Math.sin(S.t * 3.4) * 8;
  ctx.save();
  ctx.translate(x, y + bob);
  withShadow(12, 5, .4, () => {
    ctx.fillStyle = '#f6dfc0';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(-9, -2, -10, 16);
    ctx.quadraticCurveTo(-11, 34, 0, 36);
    ctx.quadraticCurveTo(11, 34, 10, 16);
    ctx.quadraticCurveTo(9, -2, 0, -6);
    ctx.closePath(); ctx.fill();
    wobbleCircle(0, -12, 8, 4, 1); ctx.fill();
  }, '20, 14, 6');
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

/** نقش‌های قلمکار: بته جقه، گل، برگ، ستاره. */
function motif(kind, x, y, s, col) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = col;
  if (kind === 0) {                                  // بته جقه
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.bezierCurveTo(-11, 8, -12, -6, -3, -11);
    ctx.bezierCurveTo(4, -14, 9, -9, 6, -4);
    ctx.bezierCurveTo(4, -1, 0, -2, 1, -5);
    ctx.bezierCurveTo(6, -3, 4, 5, 0, 12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-1, 8); ctx.quadraticCurveTo(-7, 2, -3, -6);
    ctx.stroke();
  } else if (kind === 1) {                           // گل
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate(i / 6 * TAU);
      ctx.beginPath();
      ctx.ellipse(0, -8, 4, 7, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,245,220,.85)';
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill();
  } else if (kind === 2) {                           // برگ
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(10, -2, 0, 12);
    ctx.quadraticCurveTo(-10, -2, 0, -12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke();
  } else {                                           // ستاره
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * TAU - Math.PI / 2;
      const r = i % 2 ? 4.6 : 12;
      i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#1b1710');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 13;
    ctx.translate(Math.sin(S.t * 58) * k, Math.cos(S.t * 45) * k * .5);
  }

  drawShop();
  drawCloth();
  drawRack();
  drawCard();
  drawInk();
  drawExpr();
  drawButtons();
  bits.draw();
  drawFloats();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    ctx.save();
    ctx.translate(CLOTH.x + CLOTH.w / 2 - SCENE_W / 2, 0);
    toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
    ctx.restore();
  }

  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.13, 'rgba(10, 6, 2, .5)');
}

function drawShop() {
  const g = ctx.createLinearGradient(300, 80, 900, 760);
  g.addColorStop(0, P.wallHi);
  g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  ctx.save();
  ctx.globalAlpha = .14;
  ctx.strokeStyle = '#0f0b05'; ctx.lineWidth = 4;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath(); ctx.moveTo(i * 106, 0); ctx.lineTo(i * 106, SCENE_H); ctx.stroke();
  }
  ctx.restore();

  const gl = ctx.createRadialGradient(600, 120, 40, 600, 120, 720);
  gl.addColorStop(0, P.glow);
  gl.addColorStop(1, 'rgba(255, 210, 130, 0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  ctx.save();
  for (const m of S.motes) {
    ctx.globalAlpha = .05 + .1 * (.5 + .5 * Math.sin(m.ph * 2));
    ctx.fillStyle = '#ffe9c4';
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
  }
  ctx.restore();

  /* پارچه‌های چاپ‌شدهٔ آویزان، پشتِ صحنه */
  ctx.save();
  ctx.globalAlpha = .3;
  for (let i = 0; i < 4; i++) {
    const x = 60 + i * 300, w = 120;
    ctx.fillStyle = ['#3f5a92', '#a8544f', '#c2913f', '#5b7f52'][i];
    ctx.beginPath();
    ctx.moveTo(x, 52);
    ctx.lineTo(x + w, 52);
    ctx.lineTo(x + w - 6, 300 + Math.sin(S.t * .7 + i) * 8);
    ctx.quadraticCurveTo(x + w / 2, 320 + Math.sin(S.t * .9 + i) * 10, x + 6, 300 + Math.sin(S.t * .8 + i) * 8);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  /* میزِ چاپ */
  ctx.fillStyle = P.woodDk;
  ctx.fillRect(0, 600, SCENE_W, SCENE_H - 600);
  ctx.fillStyle = P.wood;
  wobbleRect(0, 594, SCENE_W, 20, 0, 21, 1.4); ctx.fill();
  ctx.fillStyle = P.woodLit;
  wobbleRect(0, 592, SCENE_W, 6, 0, 23, .8); ctx.fill();
  ctx.save();
  ctx.globalAlpha = .18;
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const y = 626 + i * 18;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= SCENE_W; x += 40) ctx.lineTo(x, y + Math.sin(x * .02 + i) * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/* ───────── پارچه ───────── */

function drawCloth() {
  const b = CLOTH;
  withShadow(24, 12, .45, () => {
    ctx.fillStyle = P.wood;
    wobbleRect(b.x - 16, b.y - 16, b.w + 32, b.h + 32, 8, 31, 1.6); ctx.fill();
  }, '20, 14, 6');
  ctx.fillStyle = P.woodLit;
  wobbleRect(b.x - 16, b.y - 16, b.w + 32, 10, 4, 33, 1); ctx.fill();
  ctx.fillStyle = P.cloth;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  /* بافتِ پارچه */
  ctx.save();
  ctx.globalAlpha = .16;
  ctx.strokeStyle = P.clothSh; ctx.lineWidth = 1;
  for (let i = 0; i < b.w; i += 7) {
    ctx.beginPath(); ctx.moveTo(b.x + i, b.y); ctx.lineTo(b.x + i, b.y + b.h); ctx.stroke();
  }
  for (let i = 0; i < b.h; i += 7) {
    ctx.beginPath(); ctx.moveTo(b.x, b.y + i); ctx.lineTo(b.x + b.w, b.y + i); ctx.stroke();
  }
  ctx.restore();
  /* سنجاق‌های چهار گوشه */
  for (const cx of [b.x + 14, b.x + b.w - 14]) for (const cy of [b.y + 14, b.y + b.h - 14]) {
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = P.brass;
    ctx.beginPath(); ctx.arc(cx - 1.6, cy - 1.6, 3.2, 0, TAU); ctx.fill();
  }

  /* ردیف‌های چاپ‌شده — از چپ‌بالا، تا مستطیل خوانده شود */
  for (let r = 0; r < S.rows.length; r++) {
    const row = S.rows[r], st = STAMPS[row.s];
    const k = easeBack(clamp(row.t, 0, 1));
    for (let c = 0; c < st.n; c++) {
      const p = cellPos(r, c);
      ctx.save();
      ctx.globalAlpha = clamp(row.t * 1.6, 0, 1);
      motif(st.motif, p.x, p.y, CELL / 30 * k, st.col);
      ctx.restore();
    }
    /* قابِ نرمِ دورِ هر ردیف: دسته دیده شود */
    ctx.save();
    ctx.globalAlpha = .16 * clamp(row.t, 0, 1);
    ctx.strokeStyle = st.col; ctx.lineWidth = 2.4;
    ctx.beginPath();
    rrPath(CLOTH.x + 3, CLOTH.y + r * CELL + 3, st.n * CELL - 6, CELL - 6, 8);
    ctx.stroke();
    ctx.restore();
  }

  if (S.rows.length === 0) {
    text('اینجا چاپ می‌شود', b.x + b.w / 2, b.y + b.h / 2,
      { size: 19, color: 'rgba(43, 35, 24, .32)' });
  }
}

/* ───────── مهرها، سفارش، مرکّب، عبارت ───────── */

function drawRack() {
  text('مهرهای چوبی', RACK.x + RACK.w / 2, RACK.y + 18,
    { size: 20, family: 'Lalezar', color: '#f0e2c4' });
  for (let i = 0; i < STAMPS.length; i++) {
    const b = stampBox(i), st = STAMPS[i];
    const on = S.sel === i, hot = S.hover && S.hover.stamp === i;
    const dy = on ? 3 : 0;
    withShadow(12, on ? 3 : 7, .38, () => {
      ctx.fillStyle = on ? '#c9955a' : (hot ? '#a8794a' : P.wood);
      wobbleRect(b.x, b.y + dy, b.w, b.h, 10, b.x + b.y, 1.4); ctx.fill();
    }, '20, 14, 6');
    ctx.fillStyle = on ? '#e0b579' : P.woodLit;
    wobbleRect(b.x + 5, b.y + 5 + dy, b.w - 10, 8, 4, b.x + 1, .8); ctx.fill();
    /* دستهٔ مهر */
    ctx.fillStyle = P.woodDk;
    wobbleRect(b.x + b.w / 2 - 16, b.y + 16 + dy, 32, 10, 4, b.x + 3, .8); ctx.fill();
    /* نقش‌های همین مهر، به تعدادِ خودش */
    const n = st.n;
    const span = b.w - 34, gap = span / Math.max(1, n - 1);
    const sc = clamp(Math.min(gap, 16) / 26, .28, .62);
    for (let c = 0; c < n; c++) {
      motif(st.motif, b.x + 17 + (n === 1 ? span / 2 : c * gap), b.y + 50 + dy, sc, st.col);
    }
    numText(fa(n), b.x + b.w / 2, b.y + 76 + dy, { size: 24, color: on ? '#3a2a14' : '#f2e4c6' });
    if (on) {
      ctx.strokeStyle = P.gold; ctx.lineWidth = 3.4;
      ctx.beginPath(); rrPath(b.x - 3, b.y - 3 + dy, b.w + 6, b.h + 6, 12); ctx.stroke();
    }
  }
}

function drawCard() {
  const b = CARD;
  withShadow(20, 9, .4, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 41, 2); ctx.fill();
  }, '20, 14, 6');
  ctx.fillStyle = P.madder;
  wobbleRect(b.x, b.y, b.w, 11, 5, 43, .8); ctx.fill();
  text('سفارشِ استاد', b.x + b.w / 2, b.y + 40, { size: 22, family: 'Lalezar', color: P.inkSoft });
  numText(fa(S.target), b.x + b.w / 2, b.y + 102, { size: 60, color: P.ink });
  text('نقش روی پارچه', b.x + b.w / 2, b.y + 146, { size: 16, color: P.inkSoft });
  text('همهٔ ردیف‌ها باید هم‌اندازه باشند', b.x + b.w / 2, b.y + 178,
    { size: 14, color: 'rgba(125, 112, 96, .9)' });
}

function drawInk() {
  const b = INKB;
  withShadow(16, 8, .34, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 12, 51, 2); ctx.fill();
  }, '20, 14, 6');
  ctx.fillStyle = P.indigo;
  wobbleRect(b.x, b.y, b.w, 10, 4, 53, .8); ctx.fill();
  text('مرکّبِ مانده', b.x + b.w / 2, b.y + 34, { size: 18, family: 'Lalezar', color: P.inkSoft });
  const n = S.inkMax, step = Math.min(40, (b.w - 50) / Math.max(1, n));
  for (let i = 0; i < n; i++) {
    const x = b.x + b.w / 2 - (n - 1) * step / 2 + i * step;
    const alive = i < S.ink;
    ctx.save();
    ctx.globalAlpha = alive ? 1 : .22;
    ctx.fillStyle = alive ? P.indigo : '#9a948a';
    ctx.beginPath();
    ctx.moveTo(x, b.y + 62);
    ctx.bezierCurveTo(x + 11, b.y + 80, x + 10, b.y + 96, x, b.y + 96);
    ctx.bezierCurveTo(x - 10, b.y + 96, x - 11, b.y + 80, x, b.y + 62);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath(); ctx.arc(x - 3, b.y + 84, 2.6, 0, TAU); ctx.fill();
    ctx.restore();
  }
  text(`${fa(S.ink)} از ${fa(n)} ضربه`, b.x + b.w / 2, b.y + b.h - 18,
    { size: 15, color: S.ink > 0 ? P.inkSoft : P.bad });
}

/** جمعِ مکرّر و ضرب، کنارِ هم — همان پلی که کتاب می‌زند. */
function drawExpr() {
  const b = EXPR;
  withShadow(16, 8, .34, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 12, 61, 2); ctx.fill();
  }, '20, 14, 6');
  ctx.fillStyle = P.saffron;
  wobbleRect(b.x, b.y, b.w, 9, 4, 63, .8); ctx.fill();

  if (!S.rows.length) {
    text('هنوز چیزی چاپ نشده', b.x + b.w / 2, b.y + b.h / 2, { size: 18, color: P.inkSoft });
    return;
  }
  const parts = S.rows.map((r) => fa(STAMPS[r.s].n));
  if (tidy()) {
    const n = STAMPS[S.rows[0].s].n, k = S.rows.length;
    numText(parts.join(' + ') + ' = ' + fa(total()), b.x + b.w / 2, b.y + 38,
      { size: 22, color: P.inkSoft, family: 'Vazirmatn' });
    numText(`${fa(k)} × ${fa(n)} = ${fa(k * n)}`, b.x + b.w / 2, b.y + 84,
      { size: 40, color: total() === S.target ? P.good : P.ink });
  } else {
    numText(parts.join(' + ') + ' = ' + fa(total()), b.x + b.w / 2, b.y + 42,
      { size: 22, color: P.inkSoft, family: 'Vazirmatn' });
    text('ردیف‌ها هم‌اندازه نیستند؛ این ضرب نمی‌شود', b.x + b.w / 2, b.y + 84,
      { size: 17, color: P.bad });
  }
}

function drawButtons() {
  button(BTN_PRINT, 'مهر را بزن', {
    hot: S.hover === BTN_PRINT, disabled: S.phase !== 'play' || S.ink <= 0,
    fill: '#8f6a24', hotFill: '#a97f2e', size: 27,
  });
  button(BTN_CLEAR, 'پارچه را پاک کن', {
    hot: S.hover === BTN_CLEAR, disabled: S.phase !== 'play',
    fill: '#6a5b4a', hotFill: '#7d6c58', size: 17, r: 12, family: 'Vazirmatn',
  });
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.5, 0, 1);
    numText(f.txt, f.x, f.y, { size: f.size, color: f.col, alpha: k });
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(24, 18, 10, .8)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(211, 163, 73, .45)';
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 32 - i * 33;
    ctx.save();
    ctx.globalAlpha = i < S.hearts ? 1 : .22;
    ctx.fillStyle = i < S.hearts ? '#d4574a' : '#574c40';
    ctx.translate(x, HUD_H / 2);
    const s = i < S.hearts ? 1 + Math.sin(S.t * 3 + i) * .05 : 1;
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-14, -2, -9, -13, 0, -6);
    ctx.bezierCurveTo(9, -13, 14, -2, 0, 9);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const nm = L().endless ? 'سفارش‌های آزاد' : `سفارشِ ${fa(S.level + 1)} از ${fa(LEVELS.length - 1)}`;
  text(nm, SCENE_W - 146, HUD_H / 2, { size: 18, family: 'Lalezar', color: '#f4e5c6', align: 'right' });
  numText(fa(S.score), 26, HUD_H / 2 - 1, { size: 26, color: P.gold, align: 'left' });
  text(`رکورد ${fa(S.best)}`, 108, HUD_H / 2, { size: 14, color: 'rgba(244, 229, 198, .58)', align: 'left' });
  if (S.done) text(`${fa(S.done)} پارچه`, 216, HUD_H / 2, { size: 15, color: P.good, align: 'left' });
}

/* ───────── آموزش ───────── */

function drawTutorial() {
  const st = S.tut.step;
  let holes = [], msg = '', hand = null;

  if (st === 0) {
    holes = [{ x: CARD.x - 6, y: CARD.y - 6, w: CARD.w + 12, h: CARD.h + 12 },
             { x: INKB.x - 6, y: INKB.y - 6, w: INKB.w + 12, h: INKB.h + 12 }];
    msg = 'استاد می‌گوید چند نقش می‌خواهد. مرکّب هم شمرده است.';
  } else if (st === 1) {
    holes = [{ x: RACK.x - 10, y: RACK.y - 10, w: RACK.w + 20, h: 480 },
             { x: CLOTH.x - 20, y: CLOTH.y - 20, w: CLOTH.w + 40, h: CLOTH.h + 40 }];
    msg = 'یک مهر بردار و بزن. هر ضربه یک ردیفِ کامل چاپ می‌کند.';
    hand = { x: RACK.x - 34, y: RACK.y + 90 };
  } else {
    holes = [{ x: EXPR.x - 8, y: EXPR.y - 8, w: EXPR.w + 16, h: EXPR.h + 16 }];
    msg = 'پایین می‌بینی که چاپت هم جمعِ مکرّر است هم ضرب. اگر مهر را عوض کنی، دیگر ضرب نمی‌شود.';
  }

  spot(holes, .6);
  const w = 300, h = 168, x = 26, y = 486;
  paper(x, y, w, h, P.paper, 71, 14, .45);
  ctx.fillStyle = P.madder;
  wobbleRect(x, y, 9, h, 4, 73, .8); ctx.fill();
  textWrap(msg, x + w / 2 + 6, y + 40, w - 46, { size: 16, color: P.ink, lineHeight: 25 });
  if (TUT_TAP.indexOf(st) >= 0) tutMore(x + w / 2, y - 42, S.t, P.ink);
  if (hand) pointHand(hand.x, hand.y);
}

/* ───────── پرده‌ها ───────── */

function clothIcon(x, y) {
  ctx.save();
  ctx.translate(x - 78, y - 34);
  ctx.fillStyle = P.cloth;
  wobbleRect(0, 0, 156, 76, 5, 3, 1.4); ctx.fill();
  ctx.strokeStyle = P.wood; ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, 156, 76);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    motif(r ? 1 : 0, 22 + c * 38, 22 + r * 34, .85, r ? P.madder : P.indigo);
  }
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT,
    w: 760, h: 348, y: 166,
    title: 'کارگاهِ قلمکار',
    body: 'هر مهر تعدادِ نقشِ خودش را دارد و هر ضربه یک ردیفِ کامل می‌زند.\nبا مهرِ درست، سفارشِ استاد را روی پارچه چاپ کن.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'شروع',
    paper: P.paper, band: P.madder, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#8f6a24', btnHotFill: '#a97f2e',
    icon: clothIcon,
  });
}

function drawWon() {
  const last = !L().endless && S.level + 1 >= LEVELS.length;
  const k = S.rows.length, n = S.rows.length ? STAMPS[S.rows[0].s].n : 0;
  overlay({
    t: S.phaseT,
    w: 720, h: 320, y: 190,
    title: 'استاد پسندید!',
    body: `${fa(k)} ضربه از مهرِ ${fa(n)}تایی شد ${fa(S.target)} نقش. امتیازت ${fa(S.score)} شد.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: L().endless ? 'سفارشِ بعدی' : (last ? 'از اوّل' : 'سفارشِ بعدی'),
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#8f6a24', btnHotFill: '#a97f2e',
    icon: (x, y) => star(x, y + 6, 26, P.gold, Math.sin(S.t * 2) * .2),
  });
}

function drawLost() {
  overlay({
    t: S.phaseT,
    w: 720, h: 306, y: 196,
    title: 'مرکّب تمام شد',
    body: 'قبل از زدن، ببین با چند ضربه از کدام مهر به سفارش می‌رسی.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'دوباره',
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#cf5f4a', btnHotFill: '#dd6f59',
    icon: clothIcon,
  });
}

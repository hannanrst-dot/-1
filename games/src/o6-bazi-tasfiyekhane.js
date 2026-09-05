/*!
title: تصفیه‌خانه — زندگی ما و آب (بازی)
bg: #1a2a2e
*/

/* ═══════════════════════════════════════════════════════════════════════
   تصفیه‌خانه — علومِ سوم، درس ۶ «زندگی ما و آب»  (بازی)

   کاوشگریِ کتاب: «چگونه آبِ گل‌آلود را صاف کنیم؟» — با یک بطری و
   خرده‌سنگ و شن و ماسه و پنبه و پارچه. و پرسشِ اصلیِ کتاب همین است:
   «این‌ها را به چه ترتیبی در بطری بریزیم؟»
   و بعد: «چرا این آب هنوز قابل آشامیدن نیست؟»

   بازی همان پرسش است، ولی جوابش را نمی‌گوید — می‌گذارد بچّه خودش
   کشف کند، چون قانون‌ها روشن و دیدنی‌اند:

   ▸ هر لایه فقط ذرّه‌هایی را می‌گیرد که از سوراخ‌هایش بزرگ‌ترند. پس
     لایهٔ درشت ذرّهٔ ریز را نمی‌گیرد و آب کدر می‌ماند.
   ▸ اگر لایهٔ ریز بالا باشد، ذرّه‌های خیلی درشت سوراخ‌هایش را می‌بندند
     و آب اصلاً رد نمی‌شود — لایه گرفته می‌شود. برای همین باید از درشت
     به ریز چید.
   ▸ مادّهٔ ضدعفونی میکروب را می‌کشد، ولی فقط وقتی آبِ رسیده به آن
     صاف باشد؛ در آبِ گل‌آلود میکروب پشتِ ذرّه‌ها پنهان می‌ماند. این هم
     قانونِ واقعیِ تصفیه است و برای همین ضدعفونی همیشه مرحلهٔ آخر است.

   بعد از هر بار ریختن، بچّه می‌بیند کدام لایه گرفت و چه چیزی از صافی
   رد شد — نه اینکه به او بگویند ترتیبِ درست چیست.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  wall:  '#24383d', wallLo: '#1a2a2e', wallHi: '#365055',
  steel: '#8d99a3', steelDk: '#54606a', steelLt: '#c3ced6',
  water: '#4f9fc4', waterDk: '#2c6f92', waterLt: '#9fd8ea',
  mud:   '#8a6a44', mudDk: '#5c4526',
  glass: 'rgba(206, 232, 239, .34)',
  paper: '#fbfaf2', card: '#ffffff',
  ink:   '#20303a', inkSoft: '#7b8990',
  good:  '#4e9f6c', bad: '#c04a34', gold: '#c9962c', accent: '#4fa3b8',
};

/* ───────── مواد و ذرّه‌ها ─────────
   pore = اندازهٔ سوراخ‌های لایه. هر ذرّهٔ بزرگ‌تر یا برابرِ آن گیر
   می‌افتد؛ ذرّهٔ خیلی درشت‌تر (سه برابر) لایه را می‌بندد.          */

const MATS = [
  { id: 'sang',  n: 'خرده‌سنگ',  pore: 8, c: '#8d99a3', d: '#5c6870', grain: 9 },
  { id: 'shen',  n: 'شن',        pore: 4, c: '#b0a184', d: '#7d7053', grain: 6 },
  { id: 'mase',  n: 'ماسه',      pore: 2, c: '#dcc38a', d: '#a8905a', grain: 3.4 },
  { id: 'panbe', n: 'پنبه و پارچه', pore: 1, c: '#f2f2ea', d: '#c8c8bc', grain: 1.8 },
  { id: 'zed',   n: 'موادِ ضدعفونی', pore: 0, kills: true, c: '#7fc4a8', d: '#3f8f74', grain: 2.4 },
];
const matBy = (id) => MATS.find((m) => m.id === id);

const BITS = [
  { id: 'barg',  n: 'برگ و شاخه', size: 10,  c: '#4f7a34' },
  { id: 'shen',  n: 'دانهٔ شن',   size: 5,   c: '#9a8a63' },
  { id: 'gel',   n: 'گِل',        size: 2.5, c: '#8a6a44' },
  { id: 'riz',   n: 'ذرّهٔ ریز',  size: 1.2, c: '#b9a48a' },
  { id: 'mik',   n: 'میکروب',     size: 0,   micro: true, c: '#c05a8a' },
];
const bitBy = (id) => BITS.find((b) => b.id === id);

/* ذرّه‌ای که یک‌ونیم برابرِ سوراخ‌ها یا بزرگ‌تر باشد، لایه را می‌بندد.
   با همین عدد، تنها ترتیبِ کارگر «از درشت به ریز» است. */
const CLOG_X = 1.5;

const LEVELS = [
  { name: 'دو لایه',   slots: 2, shelf: ['sang', 'mase'],
    dirt: ['barg', 'gel'] },
  { name: 'سه لایه',   slots: 3, shelf: ['sang', 'shen', 'mase'],
    dirt: ['barg', 'shen', 'gel'] },
  { name: 'پنبه هم هست', slots: 4, shelf: ['sang', 'shen', 'mase', 'panbe'],
    dirt: ['barg', 'shen', 'gel', 'riz'] },
  { name: 'میکروب‌ها',  slots: 5, shelf: ['sang', 'shen', 'mase', 'panbe', 'zed'],
    dirt: ['barg', 'shen', 'gel', 'riz', 'mik'] },
  { name: 'تصفیه‌خانه', slots: 5, shelf: ['sang', 'shen', 'mase', 'panbe', 'zed'],
    dirt: ['barg', 'shen', 'gel', 'riz', 'mik'], endless: true },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  level: 0, score: 0, best: 0,
  slot: [],              /* شناسهٔ مادّهٔ هر لایه یا null */
  shelf: [],             /* موادِ این دور — در حالتِ بی‌پایان بُر می‌خورد */
  pick: -1,              /* مادّهٔ برداشته‌شده از قفسه */
  run: null,             /* {y, layer, carry:[], caught:[], clogged, done} */
  runT: 0,
  out: null,             /* آبِ بیرون‌آمده: {bits:[], clean, clogged} */
  won: false, winT: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const L = () => LEVELS[Math.min(S.level, LEVELS.length - 1)];
function tip(msg) { S.tip = msg; S.tipT = 3.6; }
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function loadLevel(i) {
  S.level = i;
  const lv = LEVELS[i];
  S.shelf = lv.shelf.slice();
  if (lv.endless) {
    for (let k = S.shelf.length - 1; k > 0; k--) {
      const j = R(0, k); const t2 = S.shelf[k]; S.shelf[k] = S.shelf[j]; S.shelf[j] = t2;
    }
  }
  S.slot = new Array(lv.slots).fill(null);
  S.pick = -1;
  S.run = null; S.out = null; S.won = false; S.winT = 0;
}

function startLevel(i, keep) {
  S.phase = 'play'; S.phaseT = 0;
  if (!keep) S.score = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  loadLevel(i);
}

/* ───────── قانونِ صافی ─────────
   آب از بالا وارد می‌شود و لایه‌به‌لایه پایین می‌رود.               */

/** آبِ گل‌آلودِ این مرحله: فهرستِ ذرّه‌ها. */
function makeDirt() {
  const out = [];
  for (const id of L().dirt) {
    const b = bitBy(id);
    const n = b.micro ? 6 : R(3, 5);
    for (let k = 0; k < n; k++) out.push(id);
  }
  return out;
}

/** یک لایه را حساب می‌کند. برمی‌گرداند: چه چیزی گرفت، چه چیزی رد شد،
    و آیا لایه بسته شد. */
function throughLayer(matId, carry) {
  const m = matBy(matId);
  if (!m) return { pass: carry.slice(), caught: [], clog: false };
  /* ذرّهٔ خیلی درشت‌تر از سوراخ‌ها، لایه را می‌بندد */
  if (m.pore > 0 && carry.some((id) => bitBy(id).size >= m.pore * CLOG_X)) {
    return { pass: [], caught: [], clog: true };
  }
  const pass = [], caught = [];
  for (const id of carry) {
    const b = bitBy(id);
    if (m.kills) {
      /* ضدعفونی فقط در آبِ صاف کار می‌کند؛ در آبِ گل‌آلود میکروب
         پشتِ ذرّه‌ها پنهان می‌ماند. */
      const dirty = carry.some((q) => !bitBy(q).micro);
      if (b.micro && !dirty) { caught.push(id); continue; }
      pass.push(id);
      continue;
    }
    if (!b.micro && b.size >= m.pore) caught.push(id);
    else pass.push(id);
  }
  return { pass, caught, clog: false };
}

/** کلِّ صافی را یک‌جا حساب می‌کند — برای آزمون و برای داوری. */
function filterAll(slots, dirt) {
  let carry = dirt.slice();
  const caught = slots.map(() => []);
  for (let i = 0; i < slots.length; i++) {
    const r = throughLayer(slots[i], carry);
    if (r.clog) return { clogged: i, out: [], caught };
    caught[i] = r.caught;
    carry = r.pass;
  }
  return { clogged: -1, out: carry, caught };
}

function pour() {
  if (S.run) return;
  if (S.slot.some((s) => s === null)) { tip('همهٔ لایه‌ها را پر کن.'); S.shake = .12; sfx.nope(); return; }
  S.out = null;
  S.run = { y: 0, layer: 0, carry: makeDirt(), caught: S.slot.map(() => []), clogged: -1, done: false };
  S.runT = 0;
  sfx.slide();
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
}

function runStep() {
  const r = S.run;
  if (!r || r.done) return;
  if (r.layer >= S.slot.length) {
    r.done = true;
    finishRun();
    return;
  }
  const res = throughLayer(S.slot[r.layer], r.carry);
  if (res.clog) {
    r.clogged = r.layer; r.done = true;
    finishRun();
    return;
  }
  r.caught[r.layer] = res.caught;
  r.carry = res.pass;
  r.layer++;
}

function finishRun() {
  const r = S.run;
  const clean = r.clogged < 0 && r.carry.length === 0;
  S.out = { bits: r.carry.slice(), clean, clogged: r.clogged };
  if (clean) {
    if (!S.won) {
      S.won = true; S.winT = .001;
      S.score += 120 + S.level * 30;
      if (S.score > S.best) S.best = S.score;
      sfx.win();
      bits.confetti(GLASS.x + GLASS.w / 2, GLASS.y, 28, [P.waterLt, P.good, P.gold, '#fff']);
    }
  } else {
    sfx.nope();
    S.shake = .14;
  }
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.tut.on) S.tut.t += dt;
  if (S.run && !S.run.done) {
    S.runT += dt;
    while (S.runT >= .55 && S.run && !S.run.done) { S.runT -= .55; runStep(); }
  }
  if (S.winT) {
    S.winT += dt;
    if (S.winT > 2.4) {
      S.winT = 0;
      if (!L().endless && S.level >= LEVELS.length - 1) { S.phase = 'won'; S.phaseT = 0; }
      else if (L().endless) { loadLevel(S.level); toast.say('یک بارِ دیگر', 'good'); }
      else { loadLevel(S.level + 1); toast.say(L().name, 'good'); }
    }
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { loadLevel(0); runLoop(step); });

/* ───────── جای‌ها ───────── */

const COL = { x: 300, y: 130, w: 210, h: 430 };     /* بطریِ صافی */
const GLASS = { x: 336, y: 572, w: 138, h: 112 };   /* لیوانِ آبِ بیرون‌آمده */
const SHELF = { x: 588, y: 96, w: 300, h: 528 };
const LENS = { x: 916, y: 96, w: 260, h: 528 };
const BTN_POUR = { x: 588, y: 646, w: 300, h: 66 };
const BTN_CLEAR = { x: 916, y: 646, w: 260, h: 66 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 470, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };

function slotRect(i) {
  const n = S.slot.length, h = COL.h / n;
  return { x: COL.x, y: COL.y + i * h, w: COL.w, h: h - 4 };
}
function shelfRect(i) {
  return { x: SHELF.x + 16, y: SHELF.y + 52 + i * 90, w: SHELF.w - 32, h: 78 };
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 1, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    for (let i = 0; i < S.shelf.length; i++) if (inRect(p, shelfRect(i))) S.hover = { k: 'mat', i };
    for (let i = 0; i < S.slot.length; i++) if (inRect(p, slotRect(i))) S.hover = { k: 'slot', i };
    if (inRect(p, BTN_POUR)) S.hover = { k: 'pour' };
    if (inRect(p, BTN_CLEAR)) S.hover = { k: 'clear' };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startLevel(0); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.score = 0; loadLevel(0); sfx.tap(); }
    return;
  }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (S.winT) return;
  if (inRect(p, BTN_POUR)) { pour(); return; }
  if (inRect(p, BTN_CLEAR)) { S.slot.fill(null); S.pick = -1; S.run = null; S.out = null; sfx.tap(); return; }
  for (let i = 0; i < S.shelf.length; i++) {
    if (!inRect(p, shelfRect(i))) continue;
    S.pick = S.pick === i ? -1 : i;
    sfx.tap();
    return;
  }
  for (let i = 0; i < S.slot.length; i++) {
    if (!inRect(p, slotRect(i))) continue;
    if (S.slot[i]) { S.slot[i] = null; S.run = null; S.out = null; sfx.pop(); return; }
    if (S.pick < 0) { tip('اوّل از قفسه یک مادّه بردار.'); return; }
    const id = S.shelf[S.pick];
    if (S.slot.indexOf(id) >= 0) { tip('این مادّه یک بار بیشتر لازم نیست.'); sfx.nope(); return; }
    S.slot[i] = id;
    S.run = null; S.out = null;
    sfx.place();
    if (S.tut.on && S.tut.step === 0) { S.tut.step = 1; S.tut.t = 0; }
    return;
  }
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

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(10, 20, 22, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 246, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '10, 20, 22');
  ctx.fillStyle = P.accent;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6d7d84' }); yy += 30; }
  return h + 20;
}

/** دانه‌های یک لایه — درشتیِ دانه از خودِ مادّه می‌آید. */
function grains(x, y, w, h, m, seed) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = m.d;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = m.c;
  const g = m.grain;
  let k = seed;
  for (let py = y + g; py < y + h; py += g * 1.7) {
    for (let px = x + g; px < x + w; px += g * 1.7) {
      k = (k * 1103515245 + 12345) & 0x7fffffff;
      const jx = ((k >> 7) % 100) / 100 - .5, jy = ((k >> 13) % 100) / 100 - .5;
      ctx.beginPath();
      ctx.arc(px + jx * g, py + jy * g, g * .62, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

function bitDot(x, y, b, r) {
  ctx.fillStyle = b.c;
  if (b.micro) {
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r * .8, .4, 0, TAU); ctx.fill();
    ctx.strokeStyle = b.c; ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      const a = i * TAU / 4 + .5;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r * .7);
      ctx.lineTo(x + Math.cos(a) * r * 2, y + Math.sin(a) * r * 1.5);
      ctx.stroke();
    }
    return;
  }
  if (b.id === 'barg') {
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.6, r * .8, -.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2f5a1c'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - r * 1.4, y + r * .6); ctx.lineTo(x + r * 1.4, y - r * .6); ctx.stroke();
    return;
  }
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

/* ───────── نقاشیِ صحنه ───────── */

function paintBackStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallHi); g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.fillStyle = texStone(P.wall, P.wallHi);
  ctx.globalAlpha = .45; ctx.fillRect(0, 0, SCENE_W, SCENE_H); ctx.globalAlpha = 1;
  for (const b of [SHELF, LENS]) {
    ctx.fillStyle = 'rgba(255, 253, 246, .95)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(12, 28, 32, .22)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 16); ctx.stroke();
  }
  /* میزِ فلزی */
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(240, 726, 340, 16, 6); ctx.fill();
}

function drawColumn() {
  /* آبِ گل‌آلود بالای بطری */
  const r = S.run;
  ctx.fillStyle = P.mudDk;
  ctx.beginPath(); rrPath(COL.x + 34, COL.y - 74, COL.w - 68, 56, 8); ctx.fill();
  ctx.fillStyle = P.mud;
  ctx.beginPath(); rrPath(COL.x + 34, COL.y - 70, COL.w - 68, 48, 8); ctx.fill();
  text('آبِ گل‌آلود', COL.x + COL.w / 2, COL.y - 46, { size: 14, color: '#f0e2cc' });
  if (r && !r.done) {
    ctx.strokeStyle = P.mud; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(COL.x + COL.w / 2, COL.y - 20);
    ctx.lineTo(COL.x + COL.w / 2, COL.y + slotRect(Math.min(r.layer, S.slot.length - 1)).h * .5 + (r.layer) * (COL.h / S.slot.length));
    ctx.stroke();
  }

  /* بطری */
  ctx.fillStyle = P.glass;
  ctx.beginPath(); rrPath(COL.x - 8, COL.y - 8, COL.w + 16, COL.h + 16, 12); ctx.fill();
  for (let i = 0; i < S.slot.length; i++) {
    const b = slotRect(i), id = S.slot[i];
    const hot = S.hover && S.hover.k === 'slot' && S.hover.i === i;
    if (!id) {
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 6); ctx.fill();
      ctx.strokeStyle = hot ? P.accent : 'rgba(255,255,255,.28)';
      ctx.lineWidth = hot ? 3 : 1.6; ctx.setLineDash([7, 6]);
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 6); ctx.stroke();
      ctx.setLineDash([]);
      numText(fa(i + 1), b.x + b.w / 2, b.y + b.h / 2, { size: 22, color: 'rgba(255,255,255,.4)' });
      continue;
    }
    const m = matBy(id);
    grains(b.x, b.y, b.w, b.h, m, 7 + i * 131);
    /* ذرّه‌های گیرافتاده در این لایه */
    const caught = (S.run && S.run.caught[i]) || [];
    for (let k = 0; k < caught.length; k++) {
      const bb = bitBy(caught[k]);
      const px = b.x + 16 + ((k * 37) % (b.w - 32));
      const py = b.y + 12 + ((k * 23) % Math.max(10, b.h - 24));
      bitDot(px, py, bb, 3.4);
    }
    ctx.strokeStyle = hot ? P.accent : 'rgba(20,40,44,.4)';
    ctx.lineWidth = hot ? 3 : 1.4;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 6); ctx.stroke();
    /* نامِ لایه روی یک پلاکِ کوچک، تا روی دانه‌ها گم نشود */
    ctx.font = '700 12px "Vazirmatn", Tahoma, sans-serif';
    const lw = ctx.measureText(m.n).width + 16;
    ctx.fillStyle = 'rgba(16, 30, 34, .72)';
    ctx.beginPath(); rrPath(b.x + b.w - lw - 6, b.y + 5, lw, 20, 9); ctx.fill();
    text(m.n, b.x + b.w - 14, b.y + 15, { size: 12, color: '#e8f2f5', align: 'right' });
    /* لایهٔ بسته‌شده */
    if (S.out && S.out.clogged === i) {
      ctx.fillStyle = 'rgba(192,74,52,.3)';
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 6); ctx.fill();
      ctx.strokeStyle = P.bad; ctx.lineWidth = 4; ctx.lineCap = 'round';
      const cx = b.x + 26, cy = b.y + b.h / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy - 9); ctx.lineTo(cx + 9, cy + 9);
      ctx.moveTo(cx + 9, cy - 9); ctx.lineTo(cx - 9, cy + 9);
      ctx.stroke();
      text('گرفت', b.x + b.w / 2 + 24, b.y + b.h / 2, { size: 15, family: 'Lalezar', color: '#fff' });
    }
  }
  ctx.strokeStyle = 'rgba(190, 230, 240, .8)'; ctx.lineWidth = 4;
  ctx.beginPath(); rrPath(COL.x - 8, COL.y - 8, COL.w + 16, COL.h + 16, 12); ctx.stroke();

  /* لیوانِ آبِ بیرون‌آمده */
  const g = GLASS;
  ctx.fillStyle = P.glass;
  ctx.beginPath(); rrPath(g.x, g.y, g.w, g.h, 8); ctx.fill();
  if (S.out && S.out.clogged < 0) {
    const dirtyN = S.out.bits.filter((id) => !bitBy(id).micro).length;
    const col = dirtyN > 0 ? P.mud : P.waterLt;
    ctx.fillStyle = col;
    ctx.fillRect(g.x + 3, g.y + 34, g.w - 6, g.h - 38);
    for (let k = 0; k < S.out.bits.length; k++) {
      const bb = bitBy(S.out.bits[k]);
      bitDot(g.x + 16 + ((k * 29) % (g.w - 32)), g.y + 50 + ((k * 19) % (g.h - 70)), bb, 3.2);
    }
  }
  ctx.strokeStyle = 'rgba(120,160,170,.8)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(g.x, g.y, g.w, g.h, 8); ctx.stroke();
  text('آبِ بیرون‌آمده', g.x + g.w / 2, g.y + g.h + 18, { size: 13, color: '#cfe2e8' });
}

function drawShelf() {
  text('قفسهٔ مواد', SHELF.x + SHELF.w - 16, SHELF.y + 28,
    { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  for (let i = 0; i < S.shelf.length; i++) {
    const b = shelfRect(i), m = matBy(S.shelf[i]);
    const on = S.pick === i, used = S.slot.indexOf(m.id) >= 0;
    const hot = S.hover && S.hover.k === 'mat' && S.hover.i === i;
    ctx.fillStyle = on ? 'rgba(79,163,184,.2)' : (hot ? 'rgba(32,48,58,.07)' : 'rgba(32,48,58,.035)');
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 11); ctx.fill();
    ctx.strokeStyle = on ? P.accent : 'rgba(32,48,58,.14)'; ctx.lineWidth = on ? 3 : 1.3;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 11); ctx.stroke();
    ctx.save();
    ctx.globalAlpha = used ? .3 : 1;
    grains(b.x + 10, b.y + 12, 76, b.h - 24, m, 3 + i * 77);
    ctx.strokeStyle = 'rgba(32,48,58,.25)'; ctx.lineWidth = 1.2;
    ctx.strokeRect(b.x + 10, b.y + 12, 76, b.h - 24);
    ctx.restore();
    text(m.n, b.x + b.w - 12, b.y + 30, { size: 15, family: 'Lalezar', color: P.ink, align: 'right' });
    if (m.kills) text('میکروب‌کُش', b.x + b.w - 12, b.y + 54, { size: 12, color: '#2f8f74', align: 'right' });
    else numText('سوراخ: ' + fa(m.pore), b.x + b.w - 46, b.y + 54, { size: 13, color: P.inkSoft });
    if (used) {
      ctx.fillStyle = P.good;
      ctx.beginPath(); ctx.arc(b.x + b.w - 16, b.y + b.h - 16, 8, 0, TAU); ctx.fill();
    }
  }
}

function drawLens() {
  text('زیرِ ذرّه‌بین', LENS.x + LENS.w - 16, LENS.y + 28,
    { size: 19, family: 'Lalezar', color: P.ink, align: 'right' });
  /* چه چیزهایی در آبِ گل‌آلود هست */
  text('در آبِ گل‌آلود:', LENS.x + LENS.w - 16, LENS.y + 62, { size: 14, color: P.inkSoft, align: 'right' });
  const list = L().dirt;
  for (let i = 0; i < list.length; i++) {
    const b = bitBy(list[i]), y = LENS.y + 90 + i * 40;
    bitDot(LENS.x + LENS.w - 32, y, b, 5);
    text(b.n, LENS.x + LENS.w - 54, y, { size: 14, color: P.ink, align: 'right' });
    numText(b.micro ? 'خیلی ریز' : 'اندازه ' + fa(b.size), LENS.x + 58, y, { size: 12, color: P.inkSoft });
  }
  /* نتیجه */
  const yy = LENS.y + 320;
  if (!S.out) {
    text('صافی را بچین و آب را بریز.', LENS.x + LENS.w / 2, yy + 40,
      { size: 14, color: 'rgba(32,48,58,.4)' });
    return;
  }
  if (S.out.clogged >= 0) {
    ctx.fillStyle = 'rgba(192,74,52,.14)';
    ctx.beginPath(); rrPath(LENS.x + 16, yy, LENS.w - 32, 96, 10); ctx.fill();
    text('لایهٔ ' + fa(S.out.clogged + 1) + ' گرفت.', LENS.x + LENS.w / 2, yy + 30,
      { size: 17, family: 'Lalezar', color: P.bad });
    text('ذرّهٔ درشت سوراخ‌هایش را بست.', LENS.x + LENS.w / 2, yy + 58, { size: 13, color: P.inkSoft });
    text('آب اصلاً رد نشد.', LENS.x + LENS.w / 2, yy + 78, { size: 13, color: P.inkSoft });
    return;
  }
  const left = S.out.bits;
  ctx.fillStyle = left.length ? 'rgba(201,150,44,.14)' : 'rgba(78,159,108,.16)';
  ctx.beginPath(); rrPath(LENS.x + 16, yy, LENS.w - 32, 150, 10); ctx.fill();
  if (!left.length) {
    text('آبِ صاف و سالم', LENS.x + LENS.w / 2, yy + 30, { size: 18, family: 'Lalezar', color: P.good });
    text('هیچ ذرّه‌ای و هیچ میکروبی نماند.', LENS.x + LENS.w / 2, yy + 58, { size: 13, color: P.inkSoft });
  } else {
    text('هنوز در آب مانده:', LENS.x + LENS.w / 2, yy + 26, { size: 15, family: 'Lalezar', color: '#8a6a12' });
    const seen = [];
    for (const id of left) if (seen.indexOf(id) < 0) seen.push(id);
    for (let i = 0; i < seen.length; i++) {
      const id = seen[i], b = bitBy(id);
      const n = left.filter((q) => q === id).length;
      bitDot(LENS.x + LENS.w - 40, yy + 56 + i * 28, b, 5);
      text(b.n + ' × ' + fa(n), LENS.x + LENS.w - 62, yy + 56 + i * 28,
        { size: 13, color: P.ink, align: 'right' });
    }
  }
}
function drawHUD() {
  ctx.fillStyle = 'rgba(16, 30, 34, .94)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(120, 190, 210, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.paper, align: 'right' });
  numText(fa(S.level + 1) + ' / ' + fa(LEVELS.length), 640, HUD_H / 2, { size: 21, color: P.gold });
  numText(fa(S.score), 300, HUD_H / 2, { size: 20, color: P.paper });
  text('بیشترین ' + fa(S.best), 150, HUD_H / 2, { size: 15, color: 'rgba(251,250,242,.6)' });
  const kk = clamp((S.level + (S.won ? 1 : 0)) / LEVELS.length, 0, 1);
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * kk, 5, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: SHELF.x, y: SHELF.y, w: SHELF.w, h: SHELF.h }], .72);
    const h = tutCard(60, 250, 480,
      ['از قفسه یک مادّه بردار،', 'بعد روی یکی از لایه‌های بطری بزن.'], 'تصفیه‌خانه');
    tutMore(300, 250 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: BTN_POUR.x, y: BTN_POUR.y, w: BTN_POUR.w, h: BTN_POUR.h }], .68);
    tutCard(60, 250, 480, ['لایه‌ها که پر شد،', 'آبِ گل‌آلود را بریز و ببین چه می‌شود.']);
  } else {
    spot([{ x: LENS.x, y: LENS.y, w: LENS.w, h: LENS.h }], .7);
    const h = tutCard(60, 230, 520,
      ['هر لایه فقط ذرّهٔ بزرگ‌تر از سوراخش را می‌گیرد.',
       'ذرّهٔ خیلی درشت هم لایهٔ ریز را می‌بندد.'], 'قانونِ صافی');
    tutMore(320, 230 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function filterIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(206,232,239,.4)';
  ctx.beginPath(); rrPath(-26, -30, 52, 56, 6); ctx.fill();
  const cols = [['#8d99a3', 12], ['#b0a184', 12], ['#dcc38a', 12], ['#f2f2ea', 12]];
  let yy = -28;
  for (const [c, h] of cols) { ctx.fillStyle = c; ctx.fillRect(-24, yy, 48, h); yy += h; }
  ctx.strokeStyle = '#bfe6f2'; ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(-26, -30, 52, 56, 6); ctx.stroke();
  ctx.fillStyle = '#4f9fc4';
  ctx.beginPath(); ctx.arc(0, 34, 5, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 840, h: 300, y: 128,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: '#6d7d84',
    icon: filterIcon,
    title: 'تصفیه‌خانه',
    body: 'آبِ گل‌آلود را باید از چند لایه رد کنیم تا صاف شود.\nهر لایه فقط ذرّه‌های بزرگ‌تر از سوراخ‌هایش را می‌گیرد.\nترتیبِ لایه‌ها با توست — ببین کدام ترتیب کار می‌کند.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 780, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#6d7d84',
    icon: filterIcon,
    title: 'آبِ سالم',
    body: 'از درشت به ریز چیدی، و آخر هم ضدعفونی — همان کاری که\nتصفیه‌خانهٔ شهر می‌کند.\nامتیازت: ' + fa(S.score),
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function draw() {
  beginScene(P.wallLo);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  const layer = staticLayer('back', SCENE_W, SCENE_H, paintBackStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawColumn();
  drawShelf();
  drawLens();
  bits.draw();
  ctx.restore();
  button(BTN_POUR, S.run && !S.run.done ? 'می‌ریزد…' : 'آب را بریز', {
    hot: S.hover && S.hover.k === 'pour', fill: '#2f7f96', hotFill: '#4fa3b8', size: 22 });
  button(BTN_CLEAR, 'خالی کن', {
    hot: S.hover && S.hover.k === 'clear', fill: '#5c6870', hotFill: '#77848d', size: 20 });
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 480;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 54, w, 42, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 33, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.09, 'rgba(6, 20, 24, .42)', 0, .1);
}

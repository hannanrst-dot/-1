/*!
title: نجّاریِ کوچک — کسر در اندازه‌گیری
bg: #2a1d14
*/

/* ═══════════════════════════════════════════════════════════════════════
   نجّاریِ کوچک — ریاضی سوم، فصل ۳، درس ۳ (کاربرد کسر در اندازه‌گیری)
   ───────────────────────────────────────────────────────────────────────
   کتاب می‌گوید طولِ مداد «۵ سانتی‌متر و ۱/۲» است، یعنی بینِ دو عددِ درست
   یک تکّه می‌ماند و آن تکّه اسم دارد. اسمش هم به این بستگی دارد که واحد
   را به چند قسمتِ مساوی بریده باشی.

   قانونِ فیزیکیِ این بازی همین است و بچه خودش کشفش می‌کند:

     خط‌کشِ نجّاری بینِ هر دو عددِ درست، به چند قسمتِ مساوی تقسیم شده. اره
     فقط روی همان خط‌ها می‌ایستد. پس هرچه قسمت‌ها ریزتر، اندازه‌های
     بیشتری می‌توانی ببُری.

   مرحله به مرحله واحد ریزتر می‌شود: نصف، بعد چهارک، بعد ده‌قسمتی. و در
   مرحلهٔ آخر نقشه «۶ و ۱/۵» می‌خواهد ولی خط‌کش ده‌قسمتی است؛ بچه باید
   ببیند که یک‌پنجم همان دو تا از ده است. این همان تمرینِ صفحهٔ ۵۱ کتاب
   است، ولی به‌جای نوشتن، با اره.

   چوب شمرده است. برشِ اشتباه چوب را هدر می‌دهد؛ پس اوّل ذرّه‌بین، بعد اره.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

/* همه‌ی طول‌ها با واحدِ «یک‌بیستمِ سانتی‌متر» شمرده می‌شوند تا اعشار نداشته
   باشیم: نصف=۱۰، چهارک=۵، یک‌پنجم=۴، یک‌دهم=۲. */
const U = 20;                       // یک سانتی‌متر چند واحد است

const P = {
  wallHi:   '#6d5236',
  wallLo:   '#3d2c1c',
  plank:    '#c99552',
  plankLit: '#e0b070',
  plankDk:  '#9c6c33',
  grain:    'rgba(90, 56, 22, .28)',
  bench:    '#7b4f2a',
  benchDk:  '#54341a',
  benchLit: '#96633a',
  steel:    '#b9c2c8',
  steelDk:  '#7c878f',
  steelLo:  '#525c63',
  ruler:    '#f4e3bd',
  rulerDk:  '#d3bd90',
  ink:      '#2f2417',
  inkSoft:  '#7d6b4e',
  paper:    '#fbf1dc',
  paperDk:  '#e5d6b6',
  blue:     '#3f6f9c',
  blueLo:   '#dbe7f0',
  brass:    '#d9a840',
  brassDk:  '#a2761f',
  good:     '#6fa85c',
  bad:      '#cf5f4a',
  gold:     '#f0c552',
  sun:      'rgba(255, 224, 160, .16)',
};

/* ───────── نقشه‌ها ─────────
   هر قطعه یک پاره‌خط روی نقشه است و طولش (به واحد) همان اندازه‌ای است که
   باید ببُری. مختصات‌ها هم به همان واحدند تا نقشه دروغ نگوید.        */

const LEVELS = [
  { name: 'نردبانِ کوتاه', den: 2, planks: 2,
    obj: 'نردبان',
    segs: [[0, 0, 0, 80], [50, 0, 50, 80], [0, 26, 50, 26], [0, 54, 50, 54]],
    hint: 'خط‌کش بینِ هر دو عدد یک خطِ وسط دارد: نصف.' },
  { name: 'قابِ عکس', den: 4, planks: 2,
    obj: 'قاب',
    segs: [[0, 0, 115, 0], [0, 65, 115, 65], [0, 0, 0, 65], [115, 0, 115, 65]],
    hint: 'حالا هر سانتی‌متر به چهار قسمت بریده شده: چهارک.' },
  { name: 'نردبانِ بلند', den: 10, planks: 2,
    obj: 'نردبان',
    segs: [[0, 0, 0, 134], [68, 0, 68, 134], [0, 30, 68, 30], [0, 67, 68, 67], [0, 104, 68, 104]],
    hint: 'ده قسمت. همان میلی‌متر است؛ ذرّه‌بین را نگاه کن.' },
  { name: 'بادبادک', den: 10, planks: 2, ask: 5,
    obj: 'بادبادک',
    segs: [[62, 0, 62, 168], [0, 62, 124, 62], [62, 168, 11, 219], [62, 168, 113, 219]],
    hint: 'نقشه با پنجم نوشته شده ولی خط‌کش ده‌قسمتی است. پیدایش کن.' },
  { name: 'سفارشِ آزاد', den: 10, planks: 3, endless: true,
    obj: 'نردبان',
    hint: 'سفارش‌ها پشتِ سرِ هم می‌آیند. تا وقتی چوب داری بساز.' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  pieces: [],           // { len, seg, done }
  planksLeft: 0,
  woodLeft: 0,          // چوبِ باقی‌ماندهٔ تختهٔ فعلی (واحد)
  plankLen: 22 * U,
  cut: 0,               // جای اره از سرِ تخته (واحد)
  dragging: false,
  sawT: 0,              // انیمیشنِ برش
  fly: null,            // قطعه‌ای که به نقشه می‌رود
  scrap: 0,
  orders: 0,
  score: 0, best: 0,
  t: 0, phaseT: 0,
  hover: null,
  shake: 0,
  chips: [],
  floats: [],
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const den = () => L().den;
const gridStep = () => U / den();          // اره روی همین شبکه می‌ایستد
const askDen = () => L().ask || L().den;   // نقشه با چه مخرجی نوشته شده

function loadBest() { try { return +localStorage.getItem('najjari-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('najjari-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── چیدمان ───────── */

const HUD_H = 52;
const CMPX = 44;                                   // یک سانتی‌متر چند پیکسل
const BOARD = { x: 96, y: 508, h: 62 };            // تختهٔ چوب
const RULER_Y = 470;                               // خط‌کشِ بالای تخته
const LENS = { x: 58, y: 196, w: 486, h: 198 };
const READ = { x: 566, y: 196, w: 238, h: 198 };
const BP = { x: 830, y: 76, w: 344, h: 386 };      // نقشه
const BTN_MINUS = { x: 372, y: 646, w: 68, h: 66 };
const BTN_CUT   = { x: 456, y: 646, w: 220, h: 66 };
const BTN_PLUS  = { x: 692, y: 646, w: 68, h: 66 };
const BTN_NEW   = { x: 800, y: 652, w: 194, h: 54 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

const xOfU = (u) => BOARD.x + (u / U) * CMPX;
const uOfX = (x) => ((x - BOARD.x) / CMPX) * U;

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

const segLen = (s) => Math.round(Math.hypot(s[2] - s[0], s[3] - s[1]));

/** سفارشِ تصادفیِ حالتِ آزاد: نردبانی با اندازه‌های گرد شده روی شبکه. */
function randomOrder() {
  const g = gridStep();
  const rail = Math.round((90 + Math.random() * 70) / g) * g;
  const rung = Math.round((45 + Math.random() * 35) / g) * g;
  return [[0, 0, 0, rail], [rung, 0, rung, rail],
          [0, rail * .24, rung, rail * .24],
          [0, rail * .52, rung, rail * .52],
          [0, rail * .8, rung, rail * .8]];
}

function makePieces(segs) {
  return segs.map((seg) => ({ len: segLen(seg), seg, done: false }));
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.pieces = makePieces(lv.endless ? randomOrder() : lv.segs);
  S.planksLeft = lv.planks - 1;
  S.woodLeft = S.plankLen;
  S.cut = 2 * U;
  S.sawT = 0; S.fly = null;
  S.scrap = 0;
  if (!keep) { S.orders = 0; }
  S.chips.length = 0;
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  toast.say(lv.hint, 'info');
}

function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 24 }); }

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.sawT > 0) S.sawT = Math.max(0, S.sawT - dt * 2.2);
  if (S.fly) { S.fly.t += dt * 1.6; if (S.fly.t >= 1) S.fly = null; }
  for (const c of S.chips) { c.t += dt; c.vy += 900 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt; }
  S.chips = S.chips.filter((c) => c.t < 1.4);
  for (const f of S.floats) { f.t += dt; f.y -= 42 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.5);
  if (S.phase === 'play' && S.tut.on) tutStep(dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── اره ─────────
   اره فقط روی خط‌های خط‌کش می‌ایستد. همین یک قاعده کلِ درس را می‌سازد:
   هرچه واحد را ریزتر بریده باشیم، اندازه‌های بیشتری در دسترس است.     */

function setCut(u) {
  const g = gridStep();
  const v = clamp(Math.round(u / g) * g, g, S.woodLeft);
  if (v !== S.cut) { S.cut = v; sfx.tick(); }
}

function remaining() { return S.pieces.filter((p) => !p.done); }
function smallestNeeded() {
  const r = remaining();
  return r.length ? Math.min(...r.map((p) => p.len)) : 0;
}

function doCut() {
  if (S.phase !== 'play' || S.fly) return;
  const len = S.cut;
  if (len > S.woodLeft) return;
  S.sawT = 1;
  sfx.tone(220, .22, 'sawtooth', .06);
  chipBurst(xOfU(len), BOARD.y + BOARD.h / 2);

  const hit = S.pieces.find((p) => !p.done && p.len === len);
  S.woodLeft -= len;
  if (hit) {
    hit.done = true;
    S.score += 250;
    S.fly = { t: 0, piece: hit, from: { x: xOfU(len / 2), y: BOARD.y + BOARD.h / 2 } };
    floatText(xOfU(len / 2), BOARD.y - 40, `+${fa(250)}`, P.gold);
    sfx.good();
  } else {
    S.scrap += len;
    S.shake = .34;
    sfx.nope();
    toast.say('این اندازه توی نقشه نبود؛ چوبش هدر رفت', 'bad');
  }
  S.cut = Math.min(S.cut, Math.max(gridStep(), S.woodLeft));

  if (!remaining().length) return finishOrder();
  ensureWood();
}

/** تختهٔ کوتاه‌شده اگر به‌دردِ هیچ قطعه‌ای نخورد، خودش کنار می‌رود. */
function ensureWood() {
  if (S.woodLeft >= smallestNeeded()) return;
  takeNewPlank(true);
}

function takeNewPlank(auto) {
  if (S.planksLeft <= 0) {
    S.phase = 'lost'; S.phaseT = 0;
    sfx.nope();
    return;
  }
  S.planksLeft--;
  S.scrap += S.woodLeft;
  S.woodLeft = S.plankLen;
  S.cut = Math.min(2 * U, S.woodLeft);
  sfx.slide();
  toast.say(auto ? 'تهٔ تخته به کاری نمی‌آمد؛ تختهٔ تازه' : 'تختهٔ تازه روی میز', 'info');
}

function finishOrder() {
  const bonus = 600 + Math.round(S.woodLeft / 2) + S.planksLeft * 150;
  S.score += bonus;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  S.orders++;
  S.phase = 'won'; S.phaseT = 0;
  sfx.win();
  bits.confetti(BP.x + BP.w / 2, BP.y + BP.h / 2, 70, [P.gold, P.plankLit, P.blue, '#fff']);
}

function chipBurst(x, y) {
  for (let i = 0; i < 14; i++) {
    S.chips.push({ x, y, t: 0, rot: Math.random() * TAU, vr: (Math.random() - .5) * 14,
      vx: (Math.random() - .5) * 220, vy: -60 - Math.random() * 220,
      r: 3 + Math.random() * 5 });
  }
}

/* ───────── آموزش ───────── */

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 5.4) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 1 && S.cut !== 2 * U) { S.tut.step = 2; S.tut.t = 0; }
  if (S.tut.step === 2 && S.tut.t > 8.5) S.tut.on = false;
}

/* ───────── ورودی ───────── */

function boardBand() {
  return { x: BOARD.x - 30, y: RULER_Y - 26, w: S.plankLen / U * CMPX + 60, h: BOARD.h + 132 };
}

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (inRect(p, BTN_CUT)) return BTN_CUT;
  if (inRect(p, BTN_NEW)) return BTN_NEW;
  if (inRect(p, BTN_MINUS)) return BTN_MINUS;
  if (inRect(p, BTN_PLUS)) return BTN_PLUS;
  if (inRect(p, boardBand())) return { board: true };
  return null;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.dragging) { setCut(uOfX(p.x)); return; }
  S.hover = hitTest(p);
  cv.style.cursor = S.hover ? (S.hover.board ? 'ew-resize' : 'pointer') : 'default';
});
cv.addEventListener('pointerup', () => { S.dragging = false; });
cv.addEventListener('pointerleave', () => { S.dragging = false; S.hover = null; });
cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  const h = hitTest(p);
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
  if (h === BTN_CUT) return doCut();
  if (h === BTN_NEW) return takeNewPlank(false);
  if (h === BTN_MINUS) return setCut(S.cut - gridStep());
  if (h === BTN_PLUS) return setCut(S.cut + gridStep());
  if (h.board) { S.dragging = true; setCut(uOfX(p.x)); }
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
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(20, 12, 6, ${alpha})`;
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
  }, '30, 18, 6');
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

/** طول را به «درست و کسر» می‌شکند، با مخرجِ خواسته‌شده. */
function parts(u, d) {
  const whole = Math.floor(u / U);
  const num = Math.round((u - whole * U) * d / U);
  return { whole, num, den: d };
}

/** عددِ مخلوط را مثل کتاب می‌نویسد: عددِ درست، «و»، بعد کسرِ دوطبقه. */
function drawMixed(cx, y, u, d, size, color) {
  const q = parts(u, d);
  const fw = size * .78;
  ctx.save();
  ctx.font = `400 ${size}px "Lalezar", Tahoma, sans-serif`;
  const wholeW = q.whole > 0 ? ctx.measureText(fa(q.whole)).width : 0;
  ctx.font = `700 ${size * .6}px "Vazirmatn", Tahoma, sans-serif`;
  const andW = (q.whole > 0 && q.num > 0) ? ctx.measureText(' و ').width : 0;
  const total = wholeW + andW + (q.num > 0 ? fw : 0);
  let x = cx + total / 2;                         // از راست به چپ چیده می‌شود
  if (q.whole > 0) {
    numText(fa(q.whole), x - wholeW / 2, y, { size, color });
    x -= wholeW;
  }
  if (q.whole > 0 && q.num > 0) {
    text('و', x - andW / 2, y + size * .06, { size: size * .55, color });
    x -= andW;
  }
  if (q.num > 0) {
    const fx = x - fw / 2;
    numText(fa(q.num), fx, y - size * .34, { size: size * .62, color });
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, size * .05); ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fx - fw * .32, y + size * .04);
    ctx.lineTo(fx + fw * .32, y + size * .04);
    ctx.stroke();
    numText(fa(q.den), fx, y + size * .42, { size: size * .62, color });
  }
  ctx.restore();
  return total;
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#2a1d14');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 13;
    ctx.translate(Math.sin(S.t * 58) * k, Math.cos(S.t * 45) * k * .5);
  }

  drawShop();
  drawBench();
  drawBoard();
  drawSaw();
  drawChips();
  ctx.restore();

  drawLens();
  drawRead();
  drawBlueprint();
  drawButtons();
  drawFly();
  bits.draw();
  drawFloats();
  drawHUD();
  ctx.save();
  ctx.translate(430 - SCENE_W / 2, 0);
  toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  ctx.restore();

  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.13, 'rgba(28, 14, 4, .45)');
}

function drawShop() {
  const g = ctx.createLinearGradient(160, 60, 900, 760);
  g.addColorStop(0, P.wallHi);
  g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* تخته‌های دیوار */
  ctx.save();
  ctx.globalAlpha = .16;
  ctx.strokeStyle = '#2a1b0d'; ctx.lineWidth = 4;
  for (let i = 0; i < 11; i++) {
    const x = i * 116;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SCENE_H); ctx.stroke();
  }
  ctx.restore();

  /* پنجرهٔ نورگیر */
  const w = { x: 58, y: 66, w: 244, h: 124 };
  ctx.fillStyle = '#4a3520';
  wobbleRect(w.x - 8, w.y - 8, w.w + 16, w.h + 16, 6, 3, 1.2); ctx.fill();
  const sg = ctx.createLinearGradient(w.x, w.y, w.x, w.y + w.h);
  sg.addColorStop(0, '#cfe6f2');
  sg.addColorStop(1, '#f6e6c2');
  ctx.fillStyle = sg;
  ctx.fillRect(w.x, w.y, w.w, w.h);
  ctx.strokeStyle = '#4a3520'; ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(w.x + w.w / 2, w.y); ctx.lineTo(w.x + w.w / 2, w.y + w.h);
  ctx.moveTo(w.x, w.y + w.h / 2); ctx.lineTo(w.x + w.w, w.y + w.h / 2);
  ctx.stroke();
  const beam = ctx.createLinearGradient(w.x, w.y, w.x + 520, w.y + 520);
  beam.addColorStop(0, P.sun);
  beam.addColorStop(1, 'rgba(255, 224, 160, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(w.x, w.y + w.h);
  ctx.lineTo(w.x + w.w, w.y);
  ctx.lineTo(w.x + w.w + 460, w.y + 460);
  ctx.lineTo(w.x + 300, w.y + w.h + 460);
  ctx.closePath(); ctx.fill();

  /* ابزارهای آویزان */
  const px = 636;
  ctx.fillStyle = '#4a3520';
  wobbleRect(px, 72, 176, 12, 4, 9, 1); ctx.fill();
  /* چکش */
  ctx.strokeStyle = '#8a5a32'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(px + 32, 92); ctx.lineTo(px + 32, 150); ctx.stroke();
  ctx.fillStyle = P.steelDk;
  wobbleRect(px + 16, 84, 34, 18, 4, 11, .8); ctx.fill();
  /* گونیا */
  ctx.strokeStyle = P.steel; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(px + 92, 88); ctx.lineTo(px + 92, 152); ctx.lineTo(px + 140, 152); ctx.stroke();
  /* اره‌ی آویز */
  ctx.fillStyle = P.steel;
  ctx.beginPath();
  ctx.moveTo(px + 150, 88); ctx.lineTo(px + 172, 88); ctx.lineTo(px + 168, 156);
  ctx.lineTo(px + 152, 150); ctx.closePath(); ctx.fill();
}

function drawBench() {
  ctx.fillStyle = P.benchDk;
  wobbleRect(40, 570, SCENE_W - 80, 26, 5, 21, 1.4); ctx.fill();
  ctx.fillStyle = P.bench;
  wobbleRect(40, 560, SCENE_W - 80, 18, 5, 23, 1.2); ctx.fill();
  ctx.fillStyle = P.benchLit;
  wobbleRect(40, 558, SCENE_W - 80, 6, 3, 25, .8); ctx.fill();
  for (const x of [130, SCENE_W - 190]) {
    ctx.fillStyle = P.benchDk;
    wobbleRect(x, 596, 44, 164, 4, x, 1.2); ctx.fill();
    ctx.fillStyle = P.bench;
    wobbleRect(x, 596, 16, 164, 4, x + 2, 1); ctx.fill();
  }
  ctx.fillStyle = 'rgba(24, 12, 4, .35)';
  ctx.fillRect(0, 616, SCENE_W, SCENE_H - 616);
}

/* ───────── تخته و خط‌کش ───────── */

function drawBoard() {
  const wPx = (S.woodLeft / U) * CMPX;
  const cutPx = xOfU(S.cut);

  /* سایه روی میز */
  ctx.save();
  ctx.globalAlpha = .3;
  ctx.fillStyle = '#1d1006';
  wobbleRect(BOARD.x + 6, BOARD.y + BOARD.h - 4, wPx, 16, 4, 31, 1.4); ctx.fill();
  ctx.restore();

  /* بدنهٔ تخته */
  ctx.fillStyle = P.plank;
  wobbleRect(BOARD.x, BOARD.y, wPx, BOARD.h, 4, 33, 1.2); ctx.fill();
  ctx.fillStyle = P.plankLit;
  wobbleRect(BOARD.x, BOARD.y, wPx, 9, 3, 35, .8); ctx.fill();
  ctx.fillStyle = P.plankDk;
  wobbleRect(BOARD.x, BOARD.y + BOARD.h - 10, wPx, 10, 3, 37, .8); ctx.fill();
  /* رگهٔ چوب */
  ctx.save();
  ctx.beginPath(); ctx.rect(BOARD.x, BOARD.y, wPx, BOARD.h); ctx.clip();
  ctx.strokeStyle = P.grain; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const y = BOARD.y + 8 + i * 8;
    ctx.beginPath();
    ctx.moveTo(BOARD.x, y);
    for (let x = 0; x < wPx; x += 30) ctx.lineTo(BOARD.x + x, y + Math.sin(x * .04 + i) * 2.2);
    ctx.stroke();
  }
  ctx.restore();
  /* سرِ بریده‌شدهٔ تخته */
  ctx.fillStyle = P.plankDk;
  wobbleRect(BOARD.x + wPx - 5, BOARD.y, 6, BOARD.h, 2, 39, .8); ctx.fill();

  /* قطعه‌ای که قرار است جدا شود */
  ctx.save();
  ctx.globalAlpha = .34 + .1 * Math.sin(S.t * 3);
  ctx.fillStyle = '#fff3cf';
  wobbleRect(BOARD.x, BOARD.y, cutPx - BOARD.x, BOARD.h, 4, 41, 1); ctx.fill();
  ctx.restore();

  drawRuler(wPx);
}

function drawRuler(wPx) {
  const g = gridStep(), d = den();
  ctx.fillStyle = P.ruler;
  wobbleRect(BOARD.x - 10, RULER_Y, wPx + 20, 34, 4, 43, 1); ctx.fill();
  ctx.fillStyle = P.rulerDk;
  wobbleRect(BOARD.x - 10, RULER_Y + 30, wPx + 20, 6, 3, 45, .8); ctx.fill();

  const cm = Math.floor(S.woodLeft / U);
  ctx.strokeStyle = P.ink; ctx.lineCap = 'butt';
  for (let u = 0; u <= S.woodLeft + .01; u += g) {
    const x = xOfU(u);
    const isCm = Math.abs(u % U) < .001;
    const isHalf = d >= 4 && Math.abs((u % U) - U / 2) < .001;
    const h = isCm ? 22 : (isHalf ? 14 : 9);
    ctx.lineWidth = isCm ? 2.6 : 1.6;
    ctx.beginPath();
    ctx.moveTo(x, RULER_Y + 30); ctx.lineTo(x, RULER_Y + 30 - h); ctx.stroke();
  }
  for (let c = 0; c <= cm; c++) {
    if (cm > 14 && c % 2 === 1) continue;
    numText(fa(c), xOfU(c * U), RULER_Y + 9, { size: 15, color: P.ink });
  }
}

function drawSaw() {
  const x = xOfU(S.cut);
  const shake = S.sawT > 0 ? Math.sin(S.t * 60) * 5 * S.sawT : 0;
  ctx.save();
  ctx.translate(x + shake, 0);
  ctx.strokeStyle = 'rgba(200, 60, 40, .75)'; ctx.lineWidth = 2.4;
  ctx.setLineDash([7, 6]);
  ctx.beginPath(); ctx.moveTo(0, RULER_Y + 36); ctx.lineTo(0, BOARD.y + BOARD.h + 10); ctx.stroke();
  ctx.setLineDash([]);
  /* تیغهٔ اره */
  const by = BOARD.y - 74;
  ctx.fillStyle = P.steel;
  ctx.beginPath();
  ctx.moveTo(-9, by); ctx.lineTo(9, by); ctx.lineTo(6, by + 92); ctx.lineTo(-6, by + 92);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.steelDk;
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.moveTo(-6, by + 92 - i * 9);
    ctx.lineTo(-1, by + 88 - i * 9);
    ctx.lineTo(-6, by + 84 - i * 9);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = P.bench;
  wobbleRect(-22, by - 34, 44, 36, 8, 51, 1); ctx.fill();
  ctx.fillStyle = P.benchDk;
  wobbleRect(-14, by - 26, 28, 20, 6, 53, .8); ctx.fill();
  ctx.restore();
}

function drawChips() {
  for (const c of S.chips) {
    const k = clamp(1 - c.t / 1.4, 0, 1);
    ctx.save();
    ctx.globalAlpha = k;
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = P.plankLit;
    ctx.fillRect(-c.r, -c.r * .4, c.r * 2, c.r * .8);
    ctx.restore();
  }
}

/* ───────── ذرّه‌بین ─────────
   کارِ اصلی‌اش این نیست که کمک کند؛ این است که نشان دهد بینِ دو عددِ درست
   چه خبر است. همان ذرّه‌بینِ مورچه‌ی کتاب.                             */

function drawLens() {
  const b = LENS, g = gridStep(), d = den();
  const R = Math.max(U * 1.1, 4 * g);          // نصفِ پهنای دیدِ ذرّه‌بین
  const px = b.w / (2 * R);                    // پیکسل به ازای هر واحد

  withShadow(20, 9, .38, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 61, 2); ctx.fill();
  }, '30, 18, 6');
  ctx.fillStyle = P.brass;
  wobbleRect(b.x, b.y, b.w, 10, 4, 63, .8); ctx.fill();
  text('ذرّه‌بینِ نجّار', b.x + b.w / 2, b.y + 32, { size: 19, family: 'Lalezar', color: P.inkSoft });

  const iy = b.y + 52, ih = b.h - 70;
  ctx.save();
  ctx.beginPath(); rrPath(b.x + 12, iy, b.w - 24, ih, 10); ctx.clip();
  ctx.fillStyle = '#efe2c4';
  ctx.fillRect(b.x + 12, iy, b.w - 24, ih);

  const cx = b.x + b.w / 2;
  const X = (u) => cx + (u - S.cut) * px;
  /* تکّهٔ چوب زیرِ خط‌کش */
  ctx.fillStyle = P.plank;
  ctx.fillRect(b.x + 12, iy + ih - 46, b.w - 24, 40);
  ctx.fillStyle = '#fff3cf';
  ctx.globalAlpha = .5;
  ctx.fillRect(b.x + 12, iy + ih - 46, Math.max(0, X(S.cut) - b.x - 12), 40);
  ctx.globalAlpha = 1;

  /* خط‌های خط‌کش، بزرگ‌شده */
  const lo = Math.floor((S.cut - R) / g) * g, hi = S.cut + R + g;
  ctx.strokeStyle = P.ink; ctx.lineCap = 'butt';
  for (let u = lo; u <= hi; u += g) {
    if (u < 0 || u > S.woodLeft + .01) continue;
    const x = X(u);
    const isCm = Math.abs(u % U) < .001;
    const isHalf = d >= 4 && Math.abs((u % U) - U / 2) < .001;
    const h = isCm ? 42 : (isHalf ? 28 : 18);
    ctx.lineWidth = isCm ? 4 : 2.4;
    ctx.beginPath();
    ctx.moveTo(x, iy + ih - 52); ctx.lineTo(x, iy + ih - 52 - h); ctx.stroke();
    if (isCm) numText(fa(Math.round(u / U)), x, iy + ih - 108, { size: 22, color: P.ink });
  }
  /* شمارهٔ قسمت‌ها بینِ دو عددِ درست */
  ctx.globalAlpha = .8;
  for (let u = lo; u <= hi; u += g) {
    if (u < 0 || u > S.woodLeft + .01) continue;
    const r = Math.round((u % U) * d / U);
    if (r === 0 || r === d) continue;
    numText(fa(r), X(u), iy + ih - 78, { size: 14, color: P.inkSoft });
  }
  ctx.globalAlpha = 1;

  /* تیغهٔ اره وسطِ ذرّه‌بین */
  ctx.strokeStyle = '#c8433a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, iy + 4); ctx.lineTo(cx, iy + ih - 4); ctx.stroke();
  ctx.fillStyle = '#c8433a';
  ctx.beginPath();
  ctx.moveTo(cx, iy + 14); ctx.lineTo(cx - 8, iy + 2); ctx.lineTo(cx + 8, iy + 2);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 4;
  ctx.beginPath(); rrPath(b.x + 12, iy, b.w - 24, ih, 10); ctx.stroke();
}

function drawRead() {
  const b = READ;
  withShadow(20, 9, .38, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 71, 2); ctx.fill();
  }, '30, 18, 6');
  ctx.fillStyle = P.brass;
  wobbleRect(b.x, b.y, b.w, 10, 4, 73, .8); ctx.fill();
  text('اندازهٔ اره', b.x + b.w / 2, b.y + 32, { size: 19, family: 'Lalezar', color: P.inkSoft });
  drawMixed(b.x + b.w / 2, b.y + 96, S.cut, den(), 46, P.ink);
  text('سانتی‌متر', b.x + b.w / 2, b.y + 146, { size: 16, color: P.inkSoft });
  if (den() === 10) {
    const q = parts(S.cut, 10);
    text(`${fa(q.whole)} سانتی‌متر و ${fa(q.num)} میلی‌متر`, b.x + b.w / 2, b.y + 172,
      { size: 14, color: 'rgba(125, 107, 78, .85)' });
  }
}

/* ───────── نقشه ───────── */

function drawBlueprint() {
  const b = BP;
  withShadow(22, 10, .4, () => {
    ctx.fillStyle = P.blue;
    wobbleRect(b.x, b.y, b.w, b.h, 12, 81, 2); ctx.fill();
  }, '30, 18, 6');
  ctx.fillStyle = '#4b81b2';
  wobbleRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16, 8, 83, 1.4); ctx.fill();
  ctx.save();
  ctx.globalAlpha = .12;
  ctx.strokeStyle = '#eaf3fa'; ctx.lineWidth = 1;
  for (let x = b.x + 16; x < b.x + b.w - 8; x += 18) {
    ctx.beginPath(); ctx.moveTo(x, b.y + 16); ctx.lineTo(x, b.y + b.h - 16); ctx.stroke();
  }
  for (let y = b.y + 16; y < b.y + b.h - 8; y += 18) {
    ctx.beginPath(); ctx.moveTo(b.x + 16, y); ctx.lineTo(b.x + b.w - 16, y); ctx.stroke();
  }
  ctx.restore();
  text('نقشه', b.x + b.w / 2, b.y + 36, { size: 24, family: 'Lalezar', color: '#eaf3fa' });
  text(L().obj, b.x + b.w / 2, b.y + 62, { size: 15, color: 'rgba(234, 243, 250, .74)' });

  /* شکل، اندازه‌شده تا در قاب جا شود */
  const area = { x: b.x + 26, y: b.y + 80, w: b.w - 52, h: 176 };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of S.pieces) {
    x0 = Math.min(x0, p.seg[0], p.seg[2]); x1 = Math.max(x1, p.seg[0], p.seg[2]);
    y0 = Math.min(y0, p.seg[1], p.seg[3]); y1 = Math.max(y1, p.seg[1], p.seg[3]);
  }
  const sc = Math.min(area.w / Math.max(1, x1 - x0), area.h / Math.max(1, y1 - y0)) * .9;
  const ox = area.x + area.w / 2 - (x0 + x1) / 2 * sc;
  const oy = area.y + area.h / 2 - (y0 + y1) / 2 * sc;
  const T = (px, py) => [ox + px * sc, oy + py * sc];

  for (const p of S.pieces) {
    const [ax, ay] = T(p.seg[0], p.seg[1]);
    const [bx2, by2] = T(p.seg[2], p.seg[3]);
    if (p.done) {
      ctx.strokeStyle = P.plank; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx2, by2); ctx.stroke();
      ctx.strokeStyle = P.plankLit; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx2, by2); ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(234, 243, 250, .55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.setLineDash([9, 8]);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx2, by2); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  /* فهرستِ اندازه‌ها، گروه‌شده */
  const groups = [];
  for (const p of S.pieces) {
    let g = groups.find((q) => q.len === p.len);
    if (!g) { g = { len: p.len, total: 0, done: 0 }; groups.push(g); }
    g.total++; if (p.done) g.done++;
  }
  groups.sort((a, b2) => b2.len - a.len);
  const ly = b.y + 276;
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const y = ly + i * 34;
    if (y > b.y + b.h - 22) break;
    ctx.save();
    ctx.globalAlpha = g.done === g.total ? .5 : 1;
    drawMixed(b.x + b.w - 78, y, g.len, askDen(), 24, '#f4fbff');
    for (let k = 0; k < g.total; k++) {
      const cx2 = b.x + 42 + k * 22;
      ctx.fillStyle = k < g.done ? P.good : 'rgba(234, 243, 250, .22)';
      ctx.beginPath(); rrPath(cx2 - 8, y - 8, 16, 16, 4); ctx.fill();
      if (k < g.done) {
        ctx.strokeStyle = '#eafce2'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx2 - 4, y); ctx.lineTo(cx2 - 1, y + 4); ctx.lineTo(cx2 + 4, y - 4);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function drawFly() {
  if (!S.fly) return;
  const k = easeOut(S.fly.t);
  const x = lerp(S.fly.from.x, BP.x + BP.w / 2, k);
  const y = lerp(S.fly.from.y, BP.y + 160, k) - Math.sin(k * Math.PI) * 130;
  const w = lerp((S.fly.piece.len / U) * CMPX, 40, k);
  ctx.save();
  ctx.globalAlpha = 1 - k * .3;
  ctx.translate(x, y);
  ctx.rotate(k * 1.6);
  ctx.fillStyle = P.plank;
  wobbleRect(-w / 2, -9, w, 18, 3, 91, 1); ctx.fill();
  ctx.fillStyle = P.plankLit;
  wobbleRect(-w / 2, -9, w, 5, 2, 93, .7); ctx.fill();
  ctx.restore();
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.5, 0, 1);
    numText(f.txt, f.x, f.y, { size: f.size, color: f.col, alpha: k });
  }
}

function drawButtons() {
  const dis = S.phase !== 'play';
  roundButton({ x: BTN_MINUS.x + 34, y: BTN_MINUS.y + 33, r: 33 }, '−',
    { hot: S.hover === BTN_MINUS, fill: P.brassDk, hotFill: P.brass, size: 36, disabled: dis });
  roundButton({ x: BTN_PLUS.x + 34, y: BTN_PLUS.y + 33, r: 33 }, '+',
    { hot: S.hover === BTN_PLUS, fill: P.brassDk, hotFill: P.brass, size: 36, disabled: dis });
  button(BTN_CUT, 'ببُر', { hot: S.hover === BTN_CUT, fill: '#8a5a32', hotFill: '#a97442', size: 30 });
  button(BTN_NEW, `تختهٔ تازه (${fa(S.planksLeft)})`, {
    hot: S.hover === BTN_NEW, disabled: S.planksLeft <= 0,
    fill: '#5c6b74', hotFill: '#6d7e88', size: 17, r: 12, family: 'Vazirmatn',
  });
}

function drawHUD() {
  ctx.fillStyle = 'rgba(28, 18, 10, .76)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(217, 168, 64, .45)';
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);
  text(L().name, SCENE_W - 26, HUD_H / 2, { size: 20, family: 'Lalezar', color: '#f4e5c6', align: 'right' });
  numText(fa(S.score), 26, HUD_H / 2 - 1, { size: 26, color: P.gold, align: 'left' });
  text(`رکورد ${fa(S.best)}`, 108, HUD_H / 2, { size: 14, color: 'rgba(244, 229, 198, .58)', align: 'left' });
  if (S.scrap > 0) {
    const q = parts(S.scrap, 10);
    text(`چوبِ هدررفته: ${fa(q.whole)}٫${fa(q.num)} سانتی‌متر`, 220, HUD_H / 2,
      { size: 14, color: '#e8a08c', align: 'left' });
  }
  const doneN = S.pieces.filter((p) => p.done).length;
  text(`${fa(doneN)} از ${fa(S.pieces.length)} قطعه`, SCENE_W / 2, HUD_H / 2,
    { size: 16, color: 'rgba(244, 229, 198, .8)' });
}

/* ───────── آموزش ───────── */

function drawTutorial() {
  const st = S.tut.step;
  let holes = [], msg = '', hand = null;

  if (st === 0) {
    holes = [{ x: BP.x - 6, y: BP.y - 6, w: BP.w + 12, h: BP.h + 12 }];
    msg = 'نقشه می‌گوید چه قطعه‌هایی و با چه اندازه‌هایی لازم است.';
  } else if (st === 1) {
    holes = [{ x: BOARD.x - 40, y: RULER_Y - 110, w: (S.plankLen / U) * CMPX + 80, h: 230 }];
    msg = 'اره را روی تخته بکش. فقط روی خط‌های خط‌کش می‌ایستد.';
    hand = { x: xOfU(6 * U), y: BOARD.y + BOARD.h + 22 };
  } else {
    holes = [{ x: LENS.x - 6, y: LENS.y - 6, w: LENS.w + 12, h: LENS.h + 12 },
             { x: READ.x - 6, y: READ.y - 6, w: READ.w + 12, h: READ.h + 12 }];
    msg = 'ذرّه‌بین نشان می‌دهد بینِ دو عددِ درست کجایی. وقتی جور شد، ببُر.';
  }

  spot(holes, .58);
  const w = 500, h = 92, x = 240, y = 636;
  paper(x, y, w, h, P.paper, 41, 14, .45);
  ctx.fillStyle = P.brass;
  wobbleRect(x, y, 9, h, 4, 43, .8); ctx.fill();
  textWrap(msg, x + w / 2 + 6, y + h / 2 - 12, w - 54, { size: 18, color: P.ink, lineHeight: 27 });
  if (hand) pointHand(hand.x, hand.y);
}

/* ───────── پرده‌ها ───────── */

function sawIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-.35);
  ctx.fillStyle = P.steel;
  ctx.beginPath();
  ctx.moveTo(-52, -10); ctx.lineTo(34, -12); ctx.lineTo(30, 6); ctx.lineTo(-52, 6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.steelDk;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(-50 + i * 8, 6); ctx.lineTo(-46 + i * 8, 13); ctx.lineTo(-42 + i * 8, 6);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = P.bench;
  wobbleRect(30, -20, 34, 30, 8, 3, 1); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT,
    w: 740, h: 344, y: 168,
    title: 'نجّاریِ کوچک',
    body: 'نقشه اندازهٔ هر قطعه را می‌گوید. اره را روی خط‌کش بگذار و ببُر.\nخط‌کش بینِ هر دو عدد، خط‌های ریزتری هم دارد.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'شروع',
    paper: P.paper, band: P.brass, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#8a5a32', btnHotFill: '#a97442',
    icon: sawIcon,
  });
}

function drawWon() {
  const last = !L().endless && S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT,
    w: 720, h: 320, y: 190,
    title: L().endless ? 'سفارش تحویل شد' : `${L().obj} ساخته شد!`,
    body: S.scrap === 0
      ? `بدون حتّی یک بندانگشت چوبِ هدررفته. امتیازت ${fa(S.score)} شد.`
      : `امتیازت ${fa(S.score)} شد. دفعهٔ بعد کمتر چوب هدر بده.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: L().endless ? 'سفارشِ بعدی' : (last ? 'از اوّل' : 'نقشهٔ بعدی'),
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#8a5a32', btnHotFill: '#a97442',
    icon: (x, y) => star(x, y + 8, 26, P.gold, Math.sin(S.t * 2) * .2),
  });
}

function drawLost() {
  overlay({
    t: S.phaseT,
    w: 720, h: 300, y: 196,
    title: 'چوب تمام شد',
    body: 'برشِ اشتباه چوب می‌خورد. اوّل ذرّه‌بین را نگاه کن، بعد اره را بزن.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'دوباره',
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#cf5f4a', btnHotFill: '#dd6f59',
    icon: sawIcon,
  });
}

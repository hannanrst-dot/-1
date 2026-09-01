/*!
title: برکهٔ قورباغه — تقریب
bg: #10202a
*/

/* ═══════════════════════════════════════════════════════════════════════
   برکهٔ قورباغه — ریاضی سوم، فصل ۲، درس ۵ (تقریب اعداد)
   ───────────────────────────────────────────────────────────────────────
   کتاب می‌پرسد «این عدد به کدام نزدیک‌تر است؟». اینجا «نزدیک‌تر» حرف نیست،
   قانونِ فیزیکیِ بازی است:

     قورباغه فقط تا نصفِ فاصلهٔ دو نیلوفر می‌پرد.

   یعنی از هر جای محور، تنها نیلوفری که به آن نزدیک‌تر است در دسترسِ اوست.
   اگر بچه نیلوفرِ دورتر را بزند، قورباغه وسطِ راه توی آب می‌افتد و خودش
   می‌بیند چرا. هیچ‌کس جواب را به او نگفته؛ برکه نشانش داده.

   محورها همان سه محورِ کتاب‌اند: ۰ تا ۱۰۰۰ (گام صد)، ۰ تا ۱۰۰۰۰ (گام
   هزار)، و ۱۰۰۰ تا ۲۰۰۰ (گام صد). هرچه نیلوفرها دورتر باشند، عددِ روی
   تیرکِ فرود صفرهای بیشتری دارد — همان «حذف رقم و گذاشتن صفر»، ولی دیده
   می‌شود نه اینکه گفته شود.

   سختی پلّه‌پله زیاد می‌شود:
     ۱) برگ لنگر دارد و وقت هم آزاد است.
     ۲) برگ آرام فرو می‌رود؛ باید تصمیم بگیری.
     ۳) برگ روی آب راه می‌افتد و عددش عوض می‌شود — پس نیلوفرِ درست هم
        عوض می‌شود. اینجا بچه می‌فهمد «جای روی محور» و «عدد» یک چیزند.
     ۴) شب می‌شود و محورها قاتی می‌شوند.
     برکهٔ آزاد: بی‌پایان، برای رکورد.

   عددِ ۱۰۵۰ و ۳۵۰۰ عمداً درست وسط‌اند: آنجا هر دو نیلوفر یک‌اندازه
   نزدیک‌اند و هر دو قبول است.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  skyHi:   '#20415e',
  skyLo:   '#f2b06c',
  sunCol:  '#ffd9a0',
  hillFar: '#3e5f6b',
  hillMid: '#33525e',
  hillNear:'#28454f',
  reedDk:  '#1d3a42',
  reed:    '#3f6b56',
  reedLit: '#5b8a63',
  waterHi: '#3f8a8c',
  waterLo: '#0d2731',
  ripple:  'rgba(214, 244, 240, .22)',
  pad:     '#4e8f52',
  padLit:  '#68a95e',
  padDk:   '#356b41',
  padBig:  '#5da058',
  padBigDk:'#3d7a45',
  petal:   '#f3dced',
  petalDk: '#d9aec9',
  petalMid:'#e8c4dc',
  pollen:  '#f0c552',
  leaf:    '#d99a4e',
  leafDk:  '#a86f2c',
  leafLit: '#f0c079',
  frog:    '#9ed45c',
  frogDk:  '#6a9c3a',
  frogBelly:'#dfe9b4',
  frogSpot:'#5b8a30',
  wood:    '#a9773f',
  woodDk:  '#7d5629',
  plaque:  '#e3d3b2',
  ink:     '#22323a',
  inkSoft: '#6d8087',
  gold:    '#f0c552',
  good:    '#6fa85c',
  bad:     '#cf5f4a',
  fly:     '#2c2620',
  night:   'rgba(12, 24, 46, .46)',
};

/* ───────── محورها و مرحله‌ها ─────────
   عددهای مرحله‌های ۱ تا ۳ همان‌هایی‌اند که در کتاب آمده‌اند.        */

const AX = {
  sad:   { from: 0,    to: 1000,  step: 100  },
  hezar: { from: 0,    to: 10000, step: 1000 },
  bein:  { from: 1000, to: 2000,  step: 100  },
};

const LEVELS = [
  { name: 'برکهٔ صبح', axis: AX.sad, nums: [247, 439, 807, 105, 27],
    sink: 0, drift: 0,
    hint: 'قورباغه زورش به نیلوفرِ دور نمی‌رسد؛ فقط تا نصفِ راه می‌پرد.' },
  { name: 'برکهٔ بزرگ', axis: AX.hezar, nums: [920, 2250, 4781, 6099, 3500],
    sink: 26, drift: 0,
    hint: 'اینجا نیلوفرها هزار تا هزار تا فاصله دارند. برگ کم‌کم آب می‌خورد.' },
  { name: 'میانِ دو هزار', axis: AX.bein, nums: [1170, 1430, 1685, 1902, 1050],
    sink: 23, drift: 6,
    hint: 'جریانِ آب برگ را می‌برد و عددش عوض می‌شود. حواست باشد.' },
  { name: 'شبِ برکه', mixed: true, rounds: 6,
    sink: 19, drift: 10,
    hint: 'شب شد و محورها عوض می‌شوند. اوّل تیرک‌ها را بخوان.' },
  { name: 'برکهٔ آزاد', mixed: true, endless: true,
    sink: 17, drift: 11,
    hint: 'تا وقتی دل داری بپر. رکوردت را بشکن.' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',       // intro | play | won | lost
  level: 0,
  round: 0,
  axis: AX.sad,
  val: 0,               // جای دقیقِ برگ روی محور
  sink: 0,              // ۰ تا ۱ — چقدر برگ آب خورده
  hop: null,            // پرشِ در جریان
  splash: 0,
  fell: null,           // افتاده توی آب و دارد برمی‌گردد
  hearts: 3,
  score: 0, combo: 0, best: 0,
  t: 0, phaseT: 0,
  hover: null,
  shake: 0,
  flies: [],
  fireflies: [],
  ripples: [],
  floats: [],
  landed: null,         // {v, t} نیلوفری که تازه شکفته
  sign: null,           // تابلوی عددی که پرواز می‌کند
  streak: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const A = () => S.axis;

function loadBest() { try { return +localStorage.getItem('berke-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('berke-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── چیدمان ───────── */

const HUD_H = 52;
const HORIZON = 250;
const AXIS = { x: 112, y: 516, w: 976 };
const PAD_RX = 34, PAD_RY = 14;
const ROPE_Y = AXIS.y + 46;      // طنابِ محور، پایین‌ترِ نیلوفرها تا دیده شود
const PLAQUE_Y = 416;            // تیرکِ عددهای گِرد
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/** جایِ یک عدد روی محور. */
function xOf(v) {
  const a = A();
  return AXIS.x + ((v - a.from) / (a.to - a.from)) * AXIS.w;
}
function stations() {
  const a = A(), out = [];
  for (let v = a.from; v <= a.to + .5; v += a.step) out.push(v);
  return out;
}
function nearestStation(v) {
  const a = A();
  return clamp(Math.round((v - a.from) / a.step) * a.step + a.from, a.from, a.to);
}
/** درست وسطِ دو نیلوفر؟ آن‌وقت هر دو قبول است. */
function isMiddle(v) {
  const a = A();
  const r = ((v - a.from) % a.step + a.step) % a.step;
  return Math.abs(r - a.step / 2) < .5;
}
/** قانونِ بازی: بُردِ پرش دقیقاً نصفِ فاصلهٔ دو نیلوفر است. */
function reach() { return A().step / 2; }

/* ───────── ساختِ دور ───────── */

function randNum(a) {
  /* عدد نباید دقیقاً روی نیلوفر بیفتد، وگرنه پرشی در کار نیست. */
  const k = Math.floor(Math.random() * ((a.to - a.from) / a.step));
  const r = a.step * (.08 + Math.random() * .84);
  return Math.round(a.from + k * a.step + r);
}

function newRound() {
  const lv = L();
  if (lv.mixed) {
    const opts = [AX.sad, AX.hezar, AX.bein];
    S.axis = opts[Math.floor(Math.random() * opts.length)];
    S.val = randNum(S.axis);
  } else {
    S.axis = lv.axis;
    S.val = lv.nums[S.round];
  }
  S.sink = 0;
  S.hop = null;
  S.fell = null;
  S.landed = null;
  S.sign = null;
  S.swim = null;
  S.flies = [];
  const n = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) S.flies.push(makeFly());
  ripple(xOf(S.val), AXIS.y, 1);
}

function makeFly() {
  return {
    x: 160 + Math.random() * 880,
    y: 300 + Math.random() * 150,
    ph: Math.random() * TAU,
    sp: .5 + Math.random() * .7,
    r: 26 + Math.random() * 30,
    gone: false,
  };
}

function startLevel(i) {
  S.level = i;
  S.round = 0;
  S.hearts = 3;
  S.combo = 0;
  S.splash = 0;
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0; S.tut.step = 0; S.tut.t = 0;
  S.fireflies = [];
  if (i >= 3) for (let k = 0; k < 26; k++) {
    S.fireflies.push({ x: Math.random() * SCENE_W, y: 280 + Math.random() * 380,
                       ph: Math.random() * TAU, sp: .3 + Math.random() * .5 });
  }
  newRound();
  toast.say(LEVELS[i].hint, 'info');
}

function ripple(x, y, k) { S.ripples.push({ x, y, t: 0, k: k || 1 }); }
function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 26 }); }

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.splash > 0) S.splash -= dt;

  if (S.phase === 'play') {
    const lv = L();
    const frozen = S.tut.on && S.tut.step < 1;      // در آموزش وقت نمی‌گذرد
    if (!S.hop && !S.swim && !S.fell && !frozen) {
      if (lv.sink > 0) {
        S.sink += dt / lv.sink;
        if (S.sink >= 1) drown();
      }
      if (lv.drift > 0) {
        const a = A();
        S.val = clamp(S.val + lv.drift * dt, a.from + 1, a.to - 1);
      }
    }
    stepHop(dt);
    stepFell(dt);
    stepSwim(dt);
    if (S.tut.on) tutStep(dt);
  }

  for (const f of S.flies) {
    f.ph += dt * f.sp * 2.4;
    f.x += Math.cos(f.ph * .7) * dt * 26;
    f.y += Math.sin(f.ph) * dt * 18;
  }
  for (const f of S.fireflies) { f.ph += dt * f.sp; f.x += Math.cos(f.ph) * dt * 9; }

  for (const r of S.ripples) r.t += dt;
  S.ripples = S.ripples.filter((r) => r.t < 1.7);
  for (const f of S.floats) { f.t += dt; f.y -= 40 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.5);
  if (S.landed) S.landed.t += dt;
  if (S.sign) { S.sign.t += dt * 1.6; if (S.sign.t > 1) S.sign.t = 1; }

  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── پرش ─────────
   بُردِ پرش = نصفِ فاصلهٔ دو نیلوفر. همین یک خط، کلِ درس است.      */

function jumpTo(v) {
  if (S.hop || S.swim || S.phase !== 'play') return;
  const d = Math.abs(v - S.val);
  const ok = d <= reach() + 1e-6;
  const dir = Math.sign(v - S.val) || 1;
  const endV = ok ? v : S.val + dir * reach();
  S.hop = {
    t: 0, ok, target: v,
    x0: xOf(S.val), x1: xOf(endV),
    lift: 120 + Math.min(220, Math.abs(xOf(endV) - xOf(S.val)) * .5),
    ate: false,
  };
  sfx.tone(360, .12, 'triangle', .1);
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
}

function stepHop(dt) {
  const h = S.hop;
  if (!h) return;
  h.t += dt * 1.55;

  /* مگسِ سرِ راه: مهارت است، نه راهنما — هیچ ربطی به جوابِ درست ندارد. */
  if (!h.ate && h.t > .2 && h.t < .85) {
    const k = clamp(h.t, 0, 1);
    const fx = lerp(h.x0, h.x1, k);
    const fy = AXIS.y - Math.sin(k * Math.PI) * h.lift - 26;
    for (const f of S.flies) {
      if (!f.gone && Math.hypot(f.x - fx, f.y - fy) < 34) {
        f.gone = true; h.ate = true;
        S.score += 150;
        S.sink = Math.max(0, S.sink - .18);
        floatText(fx, fy - 20, `+${fa(150)}`, P.gold, 24);
        bits.spark(fx, fy, 10, [P.gold, '#fff3d0']);
        sfx.pop();
      }
    }
  }
  if (h.t < 1) return;

  S.hop = null;
  if (h.ok) land(h.target); else splash(h.x1);
}

function land(v) {
  S.combo++;
  S.streak++;
  const pts = 100 * Math.min(S.combo, 5);
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  S.landed = { v, t: 0 };
  S.sign = { from: xOf(S.val), to: xOf(v), t: 0, val: S.val };
  ripple(xOf(v), AXIS.y, 1.3);
  bits.confetti(xOf(v), AXIS.y - 30, 18, [P.petal, P.pollen, P.padLit, '#fff']);
  floatText(xOf(v), AXIS.y - 96, `+${fa(pts)}`, P.gold);
  sfx.good();
  if (isMiddle(S.val)) toast.say('درست وسط بود؛ هر دو یک‌اندازه نزدیک بودند', 'good');
  S.swim = { t: 0, at: v };
}

function stepFell(dt) {
  if (!S.fell) return;
  S.fell.t += dt;
  if (S.fell.t > 1.25) S.fell = null;
}

function splash(x) {
  S.fell = { x, t: 0 };
  S.combo = 0;
  S.shake = .38;
  S.splash = .7;
  S.sink = Math.min(.97, S.sink + .22);
  ripple(x, AXIS.y + 6, 1.6);
  bits.add(x, AXIS.y, 22, 'dot', ['#bfe6e2', '#8fc9c6', '#e6f6f2'],
    { speed: 260, lift: 210, size: 4.5, life: .9, grav: 700 });
  sfx.tone(150, .3, 'sine', .09);
  toast.say('نرسید! زورش تا آنجا نمی‌رسد', 'bad');
}

function stepSwim(dt) {
  if (!S.swim) return;
  S.swim.t += dt;
  if (S.swim.t < 1.15) return;
  S.swim = null;
  const lv = L();
  S.round++;
  const total = lv.mixed ? (lv.rounds || Infinity) : lv.nums.length;
  if (S.round >= total) {
    S.phase = 'won'; S.phaseT = 0;
    sfx.win();
    bits.confetti(SCENE_W / 2, 300, 70, [P.petal, P.pollen, P.padLit, '#fff']);
    return;
  }
  newRound();
}

function drown() {
  S.hearts--;
  S.combo = 0;
  S.sink = 0;
  S.shake = .4;
  ripple(xOf(S.val), AXIS.y, 1.5);
  bits.add(xOf(S.val), AXIS.y, 18, 'dot', ['#bfe6e2', '#8fc9c6'],
    { speed: 220, lift: 180, size: 4, life: .8 });
  sfx.nope();
  if (S.hearts <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  toast.say('برگ آب خورد! برگِ تازه', 'bad');
  const lv = L();
  S.round++;
  const total = lv.mixed ? (lv.rounds || Infinity) : lv.nums.length;
  if (S.round >= total) { S.phase = 'won'; S.phaseT = 0; sfx.win(); return; }
  newRound();
}

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;      // پرده‌های خواندنی

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 30) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 2 && S.tut.t > 30) S.tut.on = false;
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  for (const v of stations()) {
    const x = xOf(v);
    /* هدفِ لمس بزرگ‌تر از خودِ نیلوفر است؛ انگشتِ بچهٔ هشت‌ساله دقیق نیست. */
    if (Math.abs(p.x - x) < 50 && p.y > AXIS.y - 66 && p.y < AXIS.y + 62) return { pad: v };
  }
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
    if (S.level + 1 < LEVELS.length) startLevel(S.level + 1);
    else { S.score = 0; startLevel(0); }
    return;
  }
  if (S.phase === 'lost') { if (h) { S.score = 0; startLevel(S.level); } return; }
  if (h && h.pad !== undefined) jumpTo(h.pad);
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

/** عددها را چپ‌به‌راست می‌نویسد تا رقم‌ها جابه‌جا نشوند. */
function numText(str, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.family === 'Vazirmatn' ? (o.weight || 700) : '400'} ${o.size || 20}px "${o.family || 'Lalezar'}", Tahoma, sans-serif`;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'ltr';
  ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
  if (o.stroke) {
    ctx.lineWidth = o.strokeWidth || 6; ctx.lineJoin = 'round';
    ctx.strokeStyle = o.stroke; ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 24);
  ctx.fillStyle = `rgba(8, 18, 28, ${alpha})`;
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
  }, '6, 16, 24');
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

const isNight = () => S.level >= 3;

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#10202a');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 14;
    ctx.translate(Math.sin(S.t * 58) * k, Math.cos(S.t * 47) * k * .5);
  }

  drawSky();
  drawHills();
  drawWater();
  drawRipples();
  drawAxis();
  drawPosts();
  drawPads();
  drawLeaf();
  drawFlies();
  drawFrogNow();
  drawExactSign();
  drawSignFlight();
  drawForeReeds();
  bits.draw();
  drawFloats();
  if (isNight()) drawNight();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {      // یک پیام در یک لحظه بس است
    toast.draw(HUD_H + 12, { good: P.good, bad: P.bad, info: P.plaque, ink: P.ink });
  }

  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.12, 'rgba(6, 20, 30, .40)');
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, HORIZON);
  if (isNight()) { g.addColorStop(0, '#141d3a'); g.addColorStop(1, '#3c3b5e'); }
  else { g.addColorStop(0, P.skyHi); g.addColorStop(.5, '#6e7a78'); g.addColorStop(.82, '#c98f63'); g.addColorStop(1, P.skyLo); }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, HORIZON + 2);

  /* خورشیدِ غروب یا ماه */
  const sx = 940, sy = isNight() ? 118 : 196;
  const hal = ctx.createRadialGradient(sx, sy, 8, sx, sy, 190);
  hal.addColorStop(0, isNight() ? 'rgba(214, 226, 255, .32)' : 'rgba(255, 214, 150, .40)');
  hal.addColorStop(1, 'rgba(255, 214, 150, 0)');
  ctx.fillStyle = hal;
  ctx.fillRect(sx - 190, sy - 190, 380, 380);
  ctx.fillStyle = isNight() ? '#e8eeff' : P.sunCol;
  wobbleCircle(sx, sy, isNight() ? 30 : 44, 7, 1.6); ctx.fill();
  if (isNight()) {
    ctx.fillStyle = '#141d3a';
    wobbleCircle(sx - 15, sy - 8, 27, 9, 1.4); ctx.fill();
    for (let i = 0; i < 40; i++) {
      const x = noise1(i * 3.1) * SCENE_W, y = noise1(i * 7.7) * (HORIZON - 40) + 12;
      ctx.globalAlpha = .3 + .6 * noise1(i * 1.3) * (.5 + .5 * Math.sin(S.t * 2 + i));
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x, y, 1.4 + noise1(i) * 1.2, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else {
    /* ابرهای کشیده و پرنده‌های دور */
    ctx.globalAlpha = .3;
    ctx.fillStyle = '#ffe9cd';
    for (let i = 0; i < 5; i++) {
      const y = 80 + i * 30, w = 160 + noise1(i) * 220;
      const x = ((i * 300 + S.t * (5 + i * 2)) % (SCENE_W + 400)) - 200;
      wobbleEllipse(x, y, w, 9 + i, 0, i * 3, 1.6); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(40, 60, 66, .45)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const x = 180 + i * 62 + Math.sin(S.t * .3 + i) * 20, y = 96 + Math.sin(S.t * .5 + i * 2) * 8;
      const f = Math.sin(S.t * 3 + i) * 4;
      ctx.beginPath();
      ctx.moveTo(x - 11, y + f); ctx.quadraticCurveTo(x, y - 5, x + 11, y + f);
      ctx.stroke();
    }
  }
}

function drawHills() {
  const bands = [
    { y: HORIZON - 76, col: P.hillFar, amp: 30, seed: 3 },
    { y: HORIZON - 42, col: P.hillMid, amp: 22, seed: 9 },
    { y: HORIZON - 14, col: P.hillNear, amp: 14, seed: 17 },
  ];
  for (const b of bands) {
    ctx.fillStyle = b.col;
    ctx.beginPath();
    ctx.moveTo(-10, HORIZON + 4);
    for (let x = -10; x <= SCENE_W + 10; x += 40) {
      ctx.lineTo(x, b.y - Math.sin(x * .006 + b.seed) * b.amp - noise1(x * .01 + b.seed) * b.amp * .5);
    }
    ctx.lineTo(SCENE_W + 10, HORIZON + 4);
    ctx.closePath(); ctx.fill();
  }
  /* نی‌های ساحلِ دور — سایه‌نما */
  ctx.strokeStyle = P.reedDk; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const x = noise1(i * 5.3) * SCENE_W;
    const h = 22 + noise1(i * 2.1) * 40;
    const sw = Math.sin(S.t * .7 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(x, HORIZON + 2);
    ctx.quadraticCurveTo(x + sw * .5, HORIZON - h * .6, x + sw, HORIZON - h);
    ctx.stroke();
    if (i % 5 === 0) {
      ctx.fillStyle = '#2a4b45';
      wobbleEllipse(x + sw, HORIZON - h - 5, 3.6, 8, 0, i, .6); ctx.fill();
    }
  }
}

function drawWater() {
  const g = ctx.createLinearGradient(0, HORIZON, 0, SCENE_H);
  g.addColorStop(0, P.waterHi);
  g.addColorStop(.16, '#2d6a72');
  g.addColorStop(.5, '#1a4854');
  g.addColorStop(1, P.waterLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, HORIZON, SCENE_W, SCENE_H - HORIZON);

  /* ستونِ نورِ خورشید روی آب */
  if (!isNight()) {
    ctx.save();
    for (let i = 0; i < 34; i++) {
      const p2 = i / 34;
      const y = HORIZON + 4 + Math.pow(p2, 1.8) * (SCENE_H - HORIZON);
      const w = 16 + p2 * 190;
      ctx.globalAlpha = .16 * (1 - p2 * .75);
      ctx.fillStyle = '#ffd9a0';
      const off = Math.sin(S.t * 1.4 + i * .8) * (4 + p2 * 26);
      wobbleEllipse(940 + off, y, w * (.5 + noise1(i * 2.3) * .7), 2.6 + p2 * 3, 0, i, 1.2);
      ctx.fill();
    }
    ctx.restore();
  }

  /* بازتابِ نور روی آب: هرچه نزدیک‌تر، موج‌ها پهن‌تر */
  ctx.save();
  for (let i = 0; i < 26; i++) {
    const p = i / 26;
    const y = HORIZON + 6 + Math.pow(p, 1.7) * (SCENE_H - HORIZON);
    const amp = 8 + p * 44;
    ctx.globalAlpha = .05 + .07 * (1 - p);
    ctx.strokeStyle = '#d6f4f0';
    ctx.lineWidth = 1.5 + p * 3.5;
    ctx.beginPath();
    for (let x = -20; x <= SCENE_W + 20; x += 24) {
      const yy = y + Math.sin(x * .012 + S.t * (.5 + p) + i) * (1.5 + p * 3);
      x === -20 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
    if (i % 4 === 0) {
      ctx.globalAlpha = .05;
      ctx.fillStyle = '#eafffb';
      wobbleEllipse(200 + noise1(i * 3) * 800, y, amp, 2.4, 0, i, 1); ctx.fill();
    }
  }
  ctx.restore();
}

function drawRipples() {
  for (const r of S.ripples) {
    const k = clamp(r.t / 1.7, 0, 1);
    ctx.save();
    ctx.globalAlpha = (1 - k) * .55;
    ctx.strokeStyle = '#d6f4f0';
    ctx.lineWidth = 3 * (1 - k) + .6;
    for (const m of [1, .62]) {
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, 20 + k * 110 * r.k * m, (20 + k * 110 * r.k * m) * .34, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/* ───────── محور ─────────
   محور را مثل یک طنابِ کشیده روی آب می‌کشیم با گره‌های ریز؛ خطِ خشکِ
   ریاضی نباشد ولی همان محورِ کتاب باشد.                              */

function drawAxis() {
  ctx.save();
  ctx.globalAlpha = .5;
  ctx.strokeStyle = '#0d2730'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(AXIS.x - 46, ROPE_Y + 4); ctx.lineTo(AXIS.x + AXIS.w + 46, ROPE_Y + 4);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = '#c9dfd7'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.globalAlpha = .72;
  ctx.beginPath();
  ctx.moveTo(AXIS.x - 46, ROPE_Y);
  for (let x = AXIS.x - 46; x <= AXIS.x + AXIS.w + 46; x += 20) {
    ctx.lineTo(x, ROPE_Y + Math.sin(x * .02 + S.t) * 1.6);
  }
  ctx.stroke();
  /* پیکانِ دو سر: محور ادامه دارد */
  for (const s of [-1, 1]) {
    const x = s < 0 ? AXIS.x - 46 : AXIS.x + AXIS.w + 46;
    ctx.beginPath();
    ctx.moveTo(x - s * 14, ROPE_Y - 8); ctx.lineTo(x, ROPE_Y); ctx.lineTo(x - s * 14, ROPE_Y + 8);
    ctx.stroke();
  }
  /* گره‌های ریزِ بین نیلوفرها — ده‌بخشیِ فاصله، مثل خط‌کش */
  const st = stations();
  ctx.globalAlpha = .34;
  ctx.lineWidth = 2.4;
  for (let i = 0; i < st.length - 1; i++) {
    for (let k = 1; k < 10; k++) {
      const x = lerp(xOf(st[i]), xOf(st[i + 1]), k / 10);
      const h = k === 5 ? 11 : 6;
      ctx.beginPath(); ctx.moveTo(x, ROPE_Y - h); ctx.lineTo(x, ROPE_Y + h); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/** تیرکِ چوبیِ پشتِ هر نیلوفر با عددِ گِردِ آن. */
function drawPosts() {
  for (const v of stations()) {
    const x = xOf(v);
    const lit = S.landed && S.landed.v === v;
    const pulse = lit ? 1 + Math.sin(S.landed.t * 9) * .06 * Math.max(0, 1 - S.landed.t) : 1;
    ctx.save();
    ctx.translate(x, 0);
    ctx.scale(pulse, pulse);
    ctx.translate(-x, 0);
    ctx.fillStyle = P.woodDk;
    wobbleRect(x - 3.5, PLAQUE_Y + 32, 7, 74, 2, x, .8); ctx.fill();
    withShadow(10, 5, .34, () => {
      ctx.fillStyle = lit ? '#fff8e2' : P.plaque;
      wobbleRect(x - 31, PLAQUE_Y, 62, 30, 6, x + 3, 1.2); ctx.fill();
    }, '6, 16, 24');
    ctx.fillStyle = lit ? P.gold : P.wood;
    wobbleRect(x - 31, PLAQUE_Y, 62, 5, 2, x + 5, .8); ctx.fill();
    numText(fa(v), x, PLAQUE_Y + 16, { size: 17, color: lit ? P.ink : '#4a4433' });
    ctx.restore();
  }
}

/** نیلوفرِ آبی: بیضیِ کمی ناصاف با یک بریدگیِ گوه‌ای. */
function lilyPad(cx, cy, rx, ry, seed, col, colDk, notch) {
  ctx.save();
  ctx.globalAlpha = .28;
  ctx.fillStyle = '#07202a';
  wobbleEllipse(cx + 4, cy + 7, rx, ry, 0, seed + 2, 1.6); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = colDk;
  wobbleEllipse(cx, cy + 3, rx, ry, 0, seed, 1.8); ctx.fill();
  ctx.fillStyle = col;
  wobbleEllipse(cx, cy, rx, ry, 0, seed + 1, 1.8); ctx.fill();
  /* بریدگی */
  ctx.fillStyle = 'rgba(18, 50, 61, .85)';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(notch - .22) * rx, cy + Math.sin(notch - .22) * ry);
  ctx.lineTo(cx + Math.cos(notch + .22) * rx, cy + Math.sin(notch + .22) * ry);
  ctx.closePath(); ctx.fill();
  /* رگبرگ‌ها */
  ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 1.6;
  for (let i = 0; i < 7; i++) {
    const a = notch + .55 + i * (TAU - 1.1) / 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * rx * .88, cy + Math.sin(a) * ry * .88);
    ctx.stroke();
  }
  ctx.restore();
}

/** گلِ نیلوفر — روی نیلوفری که تازه فرود آمده باز می‌شود. */
function lotus(cx, cy, k) {
  if (k <= 0) return;
  const s = easeBack(clamp(k, 0, 1));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  for (let ring = 0; ring < 2; ring++) {
    const n = ring ? 6 : 5, r = ring ? 15 : 24, col = ring ? P.petal : P.petalMid;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * TAU / n + ring * .5;
      ctx.fillStyle = col;
      ctx.save();
      ctx.rotate(a + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-9, -r * .7, 0, -r);
      ctx.quadraticCurveTo(9, -r * .7, 0, 0);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  ctx.fillStyle = P.pollen;
  wobbleCircle(0, 0, 7, 3, .8); ctx.fill();
  ctx.restore();
}

function padGeom(v) {
  const x = xOf(v), n = noise1(v * .017 + 3);
  return {
    x,
    y: AXIS.y + (n - .5) * 7 + Math.sin(S.t * 1.3 + x * .01) * 2.2,
    rx: PAD_RX * (.86 + n * .3),
    ry: PAD_RY * (.88 + noise1(v * .031) * .28),
    notch: 1.1 + noise1(v * .043) * 2.4,
  };
}

function drawPads() {
  /* اوّل بازتابِ لرزانِ نیلوفرها روی آب — آبِ خالیِ پایین را زنده می‌کند. */
  ctx.save();
  ctx.globalAlpha = .11;
  for (const v of stations()) {
    const g = padGeom(v);
    ctx.fillStyle = '#8fd07a';
    for (let i = 0; i < 3; i++) {
      const yy = g.y + 19 + i * 9;
      const w = g.rx * (.9 - i * .22);
      const off = Math.sin(S.t * 1.7 + i * .9 + g.x * .02) * (3 + i * 3);
      ctx.beginPath();
      ctx.ellipse(g.x + off, yy, w, 2.6, 0, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  for (const v of stations()) {
    const g = padGeom(v);
    const hot = S.hover && S.hover.pad === v && !S.hop && !S.swim;
    const lit = S.landed && S.landed.v === v;
    if (hot) {
      ctx.save();
      ctx.globalAlpha = .34;
      ctx.fillStyle = '#eafffb';
      wobbleEllipse(g.x, g.y, g.rx + 11, g.ry + 7, 0, g.x, 2); ctx.fill();
      ctx.restore();
    }
    lilyPad(g.x, g.y, g.rx, g.ry, g.x, lit ? P.padLit : P.padBig, P.padBigDk, g.notch);
    if (lit) lotus(g.x, g.y - 5, clamp(S.landed.t * 2.6, 0, 1) * .78);
  }
}

/* ───────── برگِ قورباغه ───────── */

function drawLeaf() {
  if (S.swim) return;
  const x = xOf(S.val);
  const sink = S.sink;
  const y = AXIS.y + sink * 15;
  const tilt = Math.sin(S.t * 1.6) * .05 + sink * .14;

  /* حلقهٔ آبِ دورِ برگ: نشان می‌دهد این‌یکی روی آبِ باز شناور است. */
  ctx.save();
  ctx.globalAlpha = .3;
  ctx.strokeStyle = '#d6f4f0'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 44 + Math.sin(S.t * 2) * 3, 15, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.globalAlpha = .32;
  ctx.fillStyle = '#07202a';
  wobbleEllipse(3, 8, 32, 12, 0, 5, 1.3); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = P.leafDk;
  wobbleEllipse(0, 3, 31, 12, 0, 11, 1.4); ctx.fill();
  ctx.fillStyle = P.leaf;
  wobbleEllipse(0, 0, 31, 12, 0, 12, 1.4); ctx.fill();
  /* لبهٔ تاخورده — برگ است، نه نیلوفر */
  ctx.fillStyle = P.leafLit;
  ctx.beginPath();
  ctx.moveTo(-31, 0);
  ctx.quadraticCurveTo(-20, -12, -6, -9);
  ctx.quadraticCurveTo(-18, -3, -31, 0);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-28, 1); ctx.lineTo(28, -2); ctx.stroke();
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(i * 11, -1); ctx.lineTo(i * 11 + 3, 7); ctx.stroke();
  }
  if (sink > .02) {
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 0, 31, 12, 0, 0, TAU); ctx.clip();
    ctx.fillStyle = 'rgba(24, 66, 78, .85)';
    ctx.fillRect(-34, 12 - sink * 26, 68, 32);
    ctx.restore();
  }
  ctx.restore();

  /* لنگرِ نی وقتی جریان نیست */
  if (L().drift === 0 && !L().mixed) {
    ctx.strokeStyle = P.reed; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 22, y + 2);
    ctx.quadraticCurveTo(x + 44, y - 26, x + 38, y - 62);
    ctx.stroke();
    ctx.fillStyle = P.woodDk;
    wobbleEllipse(x + 38, y - 70, 5, 12, 0, 21, .7); ctx.fill();
  }
}

/* ───────── قورباغه ───────── */

function drawFrog(x, y, sc, o = {}) {
  const jump = o.jump || 0;              // ۰ نشسته، ۱ در اوجِ پرش
  const bob = jump ? 0 : Math.sin(S.t * 2.2) * 2;
  const blink = noise1(Math.floor(S.t * 1.4)) > .88 ? 1 : 0;
  const puff = o.croak ? Math.abs(Math.sin(S.t * 8)) : 0;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate((o.rot || 0));
  ctx.scale(sc * (o.flip ? -1 : 1), sc);

  /* پاهای عقب */
  ctx.fillStyle = P.frogDk;
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.scale(s, 1);
    ctx.beginPath();
    if (jump > .1) {
      ctx.moveTo(12, -6);
      ctx.quadraticCurveTo(34, 2 + jump * 8, 46 + jump * 16, 10 + jump * 4);
      ctx.quadraticCurveTo(36, 14 + jump * 6, 10, 4);
    } else {
      ctx.moveTo(10, -10);
      ctx.quadraticCurveTo(30, -12, 30, 2);
      ctx.quadraticCurveTo(30, 12, 8, 8);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  /* بدن */
  withShadow(14, 6, .32, () => {
    ctx.fillStyle = P.frog;
    wobbleEllipse(0, -12, 27, 22, 0, 33, 1.6); ctx.fill();
  }, '6, 16, 24');
  ctx.fillStyle = P.frogBelly;
  wobbleEllipse(0, -4, 19, 12, 0, 35, 1.2); ctx.fill();
  /* لکه‌ها */
  ctx.fillStyle = P.frogSpot;
  ctx.globalAlpha = .55;
  wobbleCircle(-15, -22, 5, 41, .8); ctx.fill();
  wobbleCircle(13, -26, 4, 43, .8); ctx.fill();
  wobbleCircle(18, -14, 3.4, 45, .8); ctx.fill();
  ctx.globalAlpha = 1;
  /* دست‌های جلو */
  ctx.fillStyle = P.frogDk;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * 17, 4 + (jump > .1 ? -6 : 0), 6, 9, s * .35, 0, TAU);
    ctx.fill();
  }
  /* گلو که باد می‌کند */
  if (puff > .02) {
    ctx.fillStyle = P.frogBelly;
    wobbleEllipse(0, 3, 12 + puff * 8, 8 + puff * 7, 0, 47, 1); ctx.fill();
  }
  /* چشم‌ها روی سر */
  for (const s of [-1, 1]) {
    ctx.fillStyle = P.frog;
    wobbleCircle(s * 13, -34, 11, 51 + s, 1); ctx.fill();
    if (blink) {
      ctx.strokeStyle = P.ink; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(s * 13 - 6, -34); ctx.lineTo(s * 13 + 6, -34); ctx.stroke();
    } else {
      ctx.fillStyle = '#fdf6e8';
      wobbleCircle(s * 13, -35, 7.4, 53 + s, .8); ctx.fill();
      ctx.fillStyle = P.ink;
      const lx = clamp((o.look || 0) * .5, -3, 3);
      ctx.beginPath(); ctx.arc(s * 13 + lx, -35, 4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s * 13 + lx - 1.6, -37, 1.5, 0, TAU); ctx.fill();
    }
  }
  /* دهان */
  ctx.strokeStyle = P.frogDk; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -14, 12, .12 * Math.PI, .88 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawFrogNow() {
  if (S.swim) {
    /* شیرجه زد و دارد به برگِ بعدی شنا می‌کند */
    const k = clamp(S.swim.t / 1.15, 0, 1);
    ctx.save();
    ctx.globalAlpha = .35;
    ctx.strokeStyle = '#d6f4f0'; ctx.lineWidth = 2.5;
    const x = lerp(xOf(S.swim.at), xOf(S.val), easeInOut(k));
    ctx.beginPath();
    ctx.ellipse(x, AXIS.y + 12, 16 + Math.sin(S.t * 9) * 3, 6, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const h = S.hop;
  if (h) {
    const k = clamp(h.t, 0, 1);
    const x = lerp(h.x0, h.x1, k);
    const y = AXIS.y - 9 - Math.sin(k * Math.PI) * h.lift + (h.ok ? 0 : easeIn(k) * 26);
    const dir = Math.sign(h.x1 - h.x0) || 1;
    const rot = Math.cos(k * Math.PI) * -.5 * dir;
    drawFrog(x, y, .8, { jump: Math.sin(k * Math.PI), rot, flip: dir < 0, look: dir * 6 });
    return;
  }
  if (S.fell) {
    /* نصفِ بدن زیر آب، بعد شناکنان برمی‌گردد روی برگ. */
    const k = clamp(S.fell.t / 1.25, 0, 1);
    const back = easeInOut(clamp((k - .42) / .58, 0, 1));
    const fx = lerp(S.fell.x, xOf(S.val), back);
    const fy = AXIS.y + 12 - back * 20;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, SCENE_W, AXIS.y + 10 + back * 8);
    ctx.clip();
    drawFrog(fx, fy, .8, { look: Math.sign(xOf(S.val) - S.fell.x) * 5, wet: 1 });
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = .4;
    ctx.strokeStyle = '#d6f4f0'; ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(fx, AXIS.y + 10, 26 + Math.sin(S.t * 8) * 4, 9, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const x = xOf(S.val);
  const y = AXIS.y - 9 + S.sink * 15;
  let look = 0;
  if (S.hover && S.hover.pad !== undefined) look = Math.sign(xOf(S.hover.pad) - x) * 6;
  drawFrog(x, y, .8, { look, croak: noise1(Math.floor(S.t * .7)) > .8 });
}

/* ───────── تابلوی عددِ دقیق ───────── */

function drawExactSign() {
  if (S.swim) return;
  const x = xOf(S.val), y = 322 + S.sink * 10;
  ctx.save();
  ctx.strokeStyle = P.reed; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, AXIS.y - 30);
  ctx.quadraticCurveTo(x - 6, y + 90, x, y + 30);
  ctx.stroke();
  withShadow(18, 8, .4, () => {
    ctx.fillStyle = '#fffaee';
    wobbleRect(x - 66, y - 30, 132, 60, 12, x + 7, 1.8); ctx.fill();
  }, '6, 16, 24');
  ctx.fillStyle = P.gold;
  wobbleRect(x - 66, y - 30, 132, 8, 4, x + 9, 1); ctx.fill();
  numText(fa(Math.round(S.val)), x, y + 4, { size: 40, color: P.ink });
  ctx.restore();
}

/** تابلو بعد از فرود روی تیرکِ نیلوفر می‌نشیند: «این عدد اینجاست». */
function drawSignFlight() {
  if (!S.sign) return;
  const k = easeOut(S.sign.t);
  const x = lerp(S.sign.from, S.sign.to, k);
  const y = lerp(322, PLAQUE_Y + 14, k);
  const s = lerp(1, .5, k);
  ctx.save();
  ctx.globalAlpha = 1 - k * .85;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#fffaee';
  wobbleRect(-66, -30, 132, 60, 12, 71, 1.8); ctx.fill();
  numText(fa(Math.round(S.sign.val)), 0, 4, { size: 40, color: P.ink });
  ctx.restore();
}

/* ───────── مگس‌ها، نی‌های جلو، شب ───────── */

function drawFlies() {
  for (const f of S.flies) {
    if (f.gone) continue;
    const x = f.x + Math.cos(f.ph) * f.r;
    const y = f.y + Math.sin(f.ph * 1.7) * f.r * .4;
    ctx.save();
    ctx.globalAlpha = .34;
    ctx.strokeStyle = '#d6f4f0'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < 14; i++) {
      const p = f.ph - i * .12;
      const px = f.x + Math.cos(p) * f.r, py = f.y + Math.sin(p * 1.7) * f.r * .4;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = P.fly;
    ctx.beginPath(); ctx.ellipse(x, y, 5, 3.4, Math.sin(f.ph) * .4, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(230, 245, 255, .6)';
    const w = 4 + Math.abs(Math.sin(S.t * 24)) * 3;
    ctx.beginPath(); ctx.ellipse(x - 1, y - 4, w, 2.2, -.5, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 3, y - 4, w, 2.2, .5, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function drawForeReeds() {
  ctx.save();
  /* نیلوفرهای نزدیک و تیره — عمقِ صحنه را می‌سازند. */
  ctx.globalAlpha = .82;
  for (const f of [{ x: 120, y: 704, r: 118 }, { x: 330, y: 748, r: 96 },
                   { x: 980, y: 716, r: 130 }, { x: 1160, y: 758, r: 100 }]) {
    lilyPad(f.x, f.y, f.r, f.r * .34, f.x, '#1c4a44', '#123933', 4.2 + noise1(f.x) * 1.5);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#0f2a31';
  wobbleEllipse(SCENE_W / 2, SCENE_H + 30, 720, 70, 0, 61, 3); ctx.fill();
  ctx.strokeStyle = '#14343c'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const x = i < 6 ? -26 + i * 17 : SCENE_W + 26 - (i - 6) * 17;
    const h = 150 + noise1(i * 4.7) * 220;
    const sw = Math.sin(S.t * .6 + i) * 14;
    ctx.beginPath();
    ctx.moveTo(x, SCENE_H + 10);
    ctx.quadraticCurveTo(x + sw * .4, SCENE_H - h * .55, x + sw, SCENE_H - h);
    ctx.stroke();
    ctx.fillStyle = '#123037';
    wobbleEllipse(x + sw, SCENE_H - h - 12, 7, 22, 0, i * 3, 1); ctx.fill();
  }
  ctx.restore();
}

function drawNight() {
  ctx.fillStyle = P.night;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  for (const f of S.fireflies) {
    const a = .25 + .6 * Math.abs(Math.sin(f.ph * 1.3));
    ctx.save();
    ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 16);
    g.addColorStop(0, 'rgba(255, 236, 150, .9)');
    g.addColorStop(1, 'rgba(255, 236, 150, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(f.x - 16, f.y - 16, 32, 32);
    ctx.fillStyle = '#fff6c8';
    ctx.beginPath(); ctx.arc(f.x, f.y, 2, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.5, 0, 1);
    numText(f.txt, f.x, f.y, { size: f.size, color: f.col, alpha: k,
      stroke: 'rgba(10, 30, 38, .55)', strokeWidth: 5 });
  }
}

/* ───────── نوارِ بالا ───────── */

function drawHUD() {
  ctx.fillStyle = 'rgba(9, 26, 34, .74)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(140, 193, 82, .45)';
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);

  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 32 - i * 33;
    ctx.save();
    ctx.globalAlpha = i < S.hearts ? 1 : .22;
    ctx.fillStyle = i < S.hearts ? '#d4574a' : '#4b5f66';
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

  text(L().name, SCENE_W - 146, HUD_H / 2, { size: 17, color: '#dcefe4', align: 'right', family: 'Lalezar' });
  numText(fa(S.score), 26, HUD_H / 2 - 1, { size: 26, color: P.gold, align: 'left' });
  text(`رکورد ${fa(S.best)}`, 108, HUD_H / 2, { size: 14, color: 'rgba(220, 239, 228, .6)', align: 'left' });
  if (S.combo > 1) text(`× ${fa(S.combo)}`, 200, HUD_H / 2, { size: 17, color: P.good, align: 'left' });

  /* شمارِ پرش‌های این مرحله */
  const lv = L();
  const total = lv.mixed ? (lv.rounds || 0) : lv.nums.length;
  if (total) {
    const w = 15, gap = 9, x0 = SCENE_W / 2 - (total * w + (total - 1) * gap) / 2;
    for (let i = 0; i < total; i++) {
      ctx.fillStyle = i < S.round ? P.padLit : 'rgba(255,255,255,.16)';
      ctx.beginPath();
      ctx.ellipse(x0 + i * (w + gap) + w / 2, HUD_H / 2, w / 2, w / 2 * .78, 0, 0, TAU);
      ctx.fill();
    }
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 15, color: 'rgba(220, 239, 228, .55)' });
  }
}

/* ───────── آموزش ───────── */

function drawTutorial() {
  const st = S.tut.step;
  let holes = [], msg = '', hand = null;
  const lx = xOf(S.val);

  if (st === 0) {
    holes = [{ x: AXIS.x - 60, y: 442, w: AXIS.w + 120, h: 116 }];
    msg = 'تیرک‌ها عددهای گِرد را نشان می‌دهند و برگِ تو جایی بینِ آن‌هاست.';
  } else if (st === 1) {
    holes = [{ x: lx - 150, y: AXIS.y - 60, w: 300, h: 130 }];
    msg = 'روی نیلوفری بزن که فکر می‌کنی قورباغه به آن می‌رسد.';
    hand = { x: lx + 120, y: AXIS.y - 118 };
  } else {
    holes = [{ x: lx - 220, y: AXIS.y - 60, w: 440, h: 130 }];
    msg = 'قورباغه فقط تا نصفِ فاصلهٔ دو نیلوفر می‌پرد؛ پس فقط به نزدیک‌ترین می‌رسد.';
  }

  spot(holes, .5);
  const w = 486, h = 90, x = SCENE_W / 2 - w / 2, y = 118;
  paper(x, y, w, h, P.plaque, 41, 14, .42);
  ctx.fillStyle = P.reed;
  wobbleRect(x, y, 9, h, 4, 43, .8); ctx.fill();
  textWrap(msg, x + w / 2 + 6, y + h / 2 - 11, w - 54, { size: 18, color: P.ink, lineHeight: 27 });
  if (TUT_TAP.indexOf(st) >= 0) tutMore(x + w / 2, y + h + 12, S.t, P.ink);
  if (hand) pointHand(hand.x, hand.y);
}

/* ───────── پرده‌ها ───────── */

function frogIcon(x, y) { drawFrog(x, y + 22, .8, { look: 0 }); }

function drawIntro() {
  overlay({
    t: S.phaseT,
    w: 740, h: 350, y: 168,
    title: 'برکهٔ قورباغه',
    body: 'قورباغه روی برگی وسطِ محور نشسته و می‌خواهد روی نیلوفر بپرد.\nامّا زورش تا نصفِ فاصلهٔ دو نیلوفر بیشتر نیست.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'بپر!',
    paper: P.plaque, band: P.reed, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#4e8f52', btnHotFill: '#5da058',
    icon: frogIcon,
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT,
    w: 700, h: 320, y: 190,
    title: last ? 'کلِ برکه مالِ توست!' : 'رسیدی آن‌طرف!',
    body: last ? `همهٔ برکه‌ها را رد کردی. امتیازت ${fa(S.score)} شد.`
               : `امتیازت ${fa(S.score)} شد. برکهٔ بعدی سخت‌تر است.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: last ? 'از اوّل' : 'برکهٔ بعدی',
    paper: P.plaque, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#4e8f52', btnHotFill: '#5da058',
    icon: (x, y) => star(x, y + 10, 26, P.gold, Math.sin(S.t * 2) * .2),
  });
}

function drawLost() {
  overlay({
    t: S.phaseT,
    w: 700, h: 300, y: 200,
    title: 'خیس شدی!',
    body: 'قورباغه خسته شد. یک بار دیگر از همین برکه شروع کن.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'دوباره',
    paper: P.plaque, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#cf5f4a', btnHotFill: '#dd6f59',
    icon: frogIcon,
  });
}

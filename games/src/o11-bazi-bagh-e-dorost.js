/*!
title: باغِ درست — بکارید و ببینید (بازی)
bg: #16211a
*/

/* ═══════════════════════════════════════════════════════════════════════
   باغِ درست — علومِ سوم، درس ۱۱ «بکارید و ببینید»  (بازی)

   کتاب می‌گوید لوبیا و گندم را بکارید و ریشه و برگ و دانه‌شان را با هم
   مقایسه کنید، و بعد الگو را کشف کنید: «با دیدنِ برگِ یک گیاه می‌توانیم
   نوعِ ریشه و دانه‌اش را پیش‌بینی کنیم.»

   اینجا آن الگو، قانونِ زنده ماندن است. هر گودال شرطِ خودش را دارد —
   آب کجاست، آفتاب چقدر است — و بچّه باید دانهٔ درست را در آن بکارد.
   بازی نمی‌گوید کدام دانه کجا؛ فقط می‌گذارد ریشه‌ها جلوی چشمش رشد
   کنند و ببیند کدام به آب می‌رسد و کدام نمی‌رسد.

   ── درستیِ زیستی ───────────────────────────────────────────────
   هر دو گروهِ گیاه همان چیزی‌اند که در کتاب است، و برتری‌شان هم
   واقعی است، نه قراردادی:

   ▸ دانهٔ دولپه (لوبیا، نخود، آفتاب‌گردان) → ریشهٔ راست + برگِ پهن
     ریشهٔ راست تا ژرفای زیاد پایین می‌رود، پس به آبِ عمیق می‌رسد؛
     برگِ پهن نورِ بیشتری می‌گیرد، پس در سایه هم زنده می‌ماند؛ ولی
     همان برگِ پهن آبِ بیشتری هم از دست می‌دهد.
   ▸ دانهٔ تک‌لپه (گندم، ذرّت، برنج) → ریشهٔ افشان + برگِ دراز و باریک
     ریشهٔ افشان کم‌عمق و پهن است، پس بارانِ سطحی را خوب جمع می‌کند
     ولی به آبِ عمیق نمی‌رسد؛ برگِ باریک آبِ کمی از دست می‌دهد ولی
     در سایه نورِ کافی نمی‌گیرد.

   سرنوشتِ هر گیاه از دو ترازِ ساده درمی‌آید و هیچ‌جا از پیش نوشته
   نشده:
        آبِ گرفته‌شده  در برابرِ  آبِ از دست‌رفته
        نورِ گرفته‌شده در برابرِ  نورِ لازم برای رشد
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  sky:   '#5b86a8', skyLo: '#39607d', skyHi: '#7fb0cc',
  soil:  '#6b4c33', soilDk: '#40301f', soilLt: '#8a6644',
  water: '#3f8fc4', waterLt: '#7fc4e8',
  grass: '#4f9f4a', grassDk: '#2f6b2e',
  leaf:  '#4f9f5e', leafDk: '#2f6b3a', leafLt: '#7fc47a',
  stem:  '#4a8f42', root: '#d9c9a3', rootDk: '#a89574',
  seedA: '#e8d9a8', seedADk: '#b8a06a',   /* گندمی */
  seedB: '#d9a06a', seedBDk: '#a06a3a',   /* لوبیایی */
  flowerA: '#e8c44a', flowerB: '#e87fa8',
  sun:   '#ffd27a', shade: '#2b4a3a',
  paper: '#fbf7e8', card: '#ffffff',
  ink:   '#22301f', inkSoft: '#7d8b78',
  good:  '#5fb06a', bad: '#c9603f', gold: '#e0a63f', accent: '#5aa8c4',
};

/* ───────── دو گروهِ گیاه ───────── */

const KINDS = {
  /* تک‌لپه: ریشهٔ افشان، برگِ باریک */
  mono: {
    n: 'تک‌لپه', root: 'افشان', leafN: 'دراز و باریک',
    surface: 1.0,     /* چقدر از آبِ سطحی را جمع می‌کند */
    depth: 22,        /* ژرفای ریشه، سانتی‌متر */
    leaf: .7,         /* پهنای برگ‌ها */
    capture: .9,      /* توانِ گرفتنِ نور در هر واحدِ برگ */
  },
  /* دولپه: ریشهٔ راست، برگِ پهن */
  di: {
    n: 'دولپه', root: 'راست', leafN: 'پهن',
    surface: .35, depth: 60, leaf: 1.0, capture: 1.4,
  },
};

const SEEDS = [
  { id: 'gandom', n: 'گندم',       k: 'mono' },
  { id: 'zorrat', n: 'ذرّت',        k: 'mono' },
  { id: 'berenj', n: 'برنج',        k: 'mono' },
  { id: 'lubia',  n: 'لوبیا',       k: 'di' },
  { id: 'nokhod', n: 'نخود',        k: 'di' },
  { id: 'aftab',  n: 'آفتاب‌گردان', k: 'di' },
];
const seedBy = (id) => SEEDS.find((s) => s.id === id);

const LIGHT_NEED = .5;

/* ───────── گودال‌ها ─────────
   هر گودال: آبِ زیرزمینی در چه ژرفایی، چقدر بارانِ سطحی، و آفتاب.  */

const SPOTS = {
  deep:  { n: 'آبِ عمیق',      table: 45, supply: 1.2, rain: .20, sun: 1.0, light: 1.0 },
  rainy: { n: 'بارانِ خوب',    table: 90, supply: 1.2, rain: .85, sun: 1.0, light: 1.0 },
  shade: { n: 'سایه',          table: 15, supply: 1.0, rain: .30, sun: .45, light: .40 },
  hot:   { n: 'آفتابِ تند',    table: 90, supply: 1.2, rain: 1.1, sun: 1.4, light: 1.0 },
};

/** آیا این گیاه در این گودال زنده می‌ماند؟ دو ترازِ ساده. */
function judge(spotKey, kindKey) {
  const s = SPOTS[spotKey], k = KINDS[kindKey];
  const win = k.surface * s.rain + (s.table <= k.depth ? s.supply : 0);
  const lose = k.leaf * s.sun;
  const light = k.leaf * s.light * k.capture;
  return {
    water: win - lose, lightGap: light - LIGHT_NEED,
    ok: win >= lose && light >= LIGHT_NEED,
    reach: s.table <= k.depth,
    win, lose, light,
  };
}

const LEVELS = [
  { name: 'دو گودال', spots: ['deep', 'rainy'], bag: ['lubia', 'gandom'] },
  { name: 'زیرِ سایه', spots: ['rainy', 'shade', 'deep'], bag: ['gandom', 'nokhod', 'lubia'] },
  { name: 'آفتابِ تند', spots: ['hot', 'deep', 'shade', 'rainy'],
    bag: ['zorrat', 'aftab', 'lubia', 'berenj'] },
  { name: 'باغِ بزرگ', spots: ['deep', 'rainy', 'hot', 'shade', 'deep'],
    bag: ['nokhod', 'gandom', 'berenj', 'aftab', 'lubia'] },
  { name: 'همه‌جور خاک', spots: ['shade', 'hot', 'deep', 'rainy', 'shade', 'rainy'],
    bag: ['lubia', 'zorrat', 'aftab', 'gandom', 'nokhod', 'berenj'] },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  level: 0, score: 0, best: 0,
  put: [],               /* شناسهٔ دانهٔ هر گودال یا null */
  bag: [],               /* دانه‌های باقی‌مانده */
  grow: 0,               /* ۰..۱ پیشرفتِ رشد */
  growing: false,
  lens: -1,              /* دانه‌ای که زیرِ ذرّه‌بین است */
  drag: null,
  won: false, winT: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const L = () => LEVELS[Math.min(S.level, LEVELS.length - 1)];
function tip(msg) { S.tip = msg; S.tipT = 3.4; }

function loadLevel(i) {
  S.level = i;
  const lv = LEVELS[i];
  S.put = lv.spots.map(() => null);
  S.bag = lv.bag.slice();
  S.grow = 0; S.growing = false; S.lens = -1; S.drag = null;
  S.won = false; S.winT = 0;
}

function startLevel(i, keep) {
  S.phase = 'play'; S.phaseT = 0;
  if (!keep) S.score = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  loadLevel(i);
}

const allPlanted = () => S.put.every((p) => p);
function spotOK(i) {
  const id = S.put[i];
  if (!id) return false;
  return judge(L().spots[i], seedBy(id).k).ok;
}
const allOK = () => S.put.every((p, i) => spotOK(i));

/* ───────── جای‌ها ───────── */

const GY = 336;                 /* سطحِ خاک */
const PXCM = 4.2;               /* پیکسل بر سانتی‌متر زیرِ خاک */
const FIELD = { x: 24, y: 88, w: 1152, h: 512 };
const TRAY = { x: 24, y: 612, w: 1152, h: 136 };
const BTN_GROW = { x: SCENE_W - 250, y: 626, w: 216, h: 62 };
const BTN_CLEAR = { x: SCENE_W - 250, y: 694, w: 216, h: 44 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };

const SPOT_GAP = 12;
function spotRect(i) {
  const n = L().spots.length;
  const w = (FIELD.w - SPOT_GAP * (n - 1)) / n;
  return { x: FIELD.x + i * (w + SPOT_GAP), y: FIELD.y, w, h: FIELD.h };
}
function bagRect(i) {
  return { x: TRAY.x + 22 + i * 132, y: TRAY.y + 22, w: 118, h: 92 };
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 1, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.drag) { S.drag.x = p.x; S.drag.y = p.y; return; }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    if (inRect(p, BTN_GROW)) S.hover = { k: 'grow' };
    if (inRect(p, BTN_CLEAR)) S.hover = { k: 'clear' };
    for (let i = 0; i < S.bag.length; i++) if (inRect(p, bagRect(i))) S.hover = { k: 'bag', i };
    for (let i = 0; i < S.put.length; i++) {
      const r = spotRect(i);
      if (p.x > r.x && p.x < r.x + r.w && p.y > FIELD.y && p.y < GY + 60) S.hover = { k: 'spot', i };
    }
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  const cap = () => { try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ } };
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startLevel(0); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.score = 0; loadLevel(0); sfx.tap(); }
    return;
  }
  if (S.lens >= 0) { S.lens = -1; sfx.tap(); return; }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (S.winT) return;
  if (inRect(p, BTN_GROW)) { startGrow(); return; }
  if (inRect(p, BTN_CLEAR)) { pullAll(); return; }
  /* برداشتنِ دانه از کیسه — نگه‌داشتن برای کشیدن، ضربهٔ کوتاه برای ذرّه‌بین */
  for (let i = 0; i < S.bag.length; i++) {
    if (!inRect(p, bagRect(i))) continue;
    if (S.growing) return;
    S.drag = { from: 'bag', i, id: S.bag[i], x: p.x, y: p.y, t0: S.t };
    cap(); sfx.tap();
    return;
  }
  /* بیرون کشیدنِ دانهٔ کاشته‌شده */
  for (let i = 0; i < S.put.length; i++) {
    if (!S.put[i]) continue;
    const r = spotRect(i);
    if (p.x > r.x && p.x < r.x + r.w && p.y > FIELD.y && p.y < GY + 60) {
      if (S.growing) { tip('صبر کن رشدشان تمام شود.'); return; }
      S.bag.push(S.put[i]); S.put[i] = null; S.grow = 0;
      sfx.pop();
      return;
    }
  }
});

function release() {
  const d = S.drag;
  if (!d) return;
  S.drag = null;
  /* ضربهٔ کوتاه = ذرّه‌بین */
  if (S.t - d.t0 < .22 && d.from === 'bag') {
    S.lens = S.bag.indexOf(d.id);
    sfx.place();
    return;
  }
  const p = { x: d.x, y: d.y };
  for (let i = 0; i < S.put.length; i++) {
    const r = spotRect(i);
    if (p.x < r.x || p.x > r.x + r.w || p.y < FIELD.y || p.y > GY + 90) continue;
    if (S.put[i]) { tip('این گودال پر است.'); sfx.nope(); return; }
    const k = S.bag.indexOf(d.id);
    if (k >= 0) S.bag.splice(k, 1);
    S.put[i] = d.id;
    S.grow = 0;
    sfx.place();
    if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
    return;
  }
  sfx.pop();
}
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

function startGrow() {
  if (!allPlanted()) { tip('همهٔ گودال‌ها را بکار.'); S.shake = .1; sfx.nope(); return; }
  if (S.growing) return;
  S.growing = true; S.grow = 0;
  sfx.slide();
}

function pullAll() {
  if (S.growing) return;
  for (let i = 0; i < S.put.length; i++) if (S.put[i]) { S.bag.push(S.put[i]); S.put[i] = null; }
  S.grow = 0;
  sfx.tap();
}

function finishGrow() {
  S.growing = false;
  if (allOK()) {
    S.won = true; S.winT = .001;
    S.score += 120 + S.level * 30;
    if (S.score > S.best) S.best = S.score;
    sfx.win();
    for (let i = 0; i < S.put.length; i++) {
      const r = spotRect(i);
      bits.confetti(r.x + r.w / 2, GY - 120, 16, [P.flowerA, P.flowerB, P.leafLt, '#fff']);
    }
  } else {
    sfx.nope();
    toast.say('بعضی‌شان جا نگرفتند', 'bad');
  }
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.tut.on) S.tut.t += dt;
  if (S.growing) {
    S.grow += dt / 3.2;
    if (S.grow >= 1) { S.grow = 1; finishGrow(); }
  }
  if (S.winT) {
    S.winT += dt;
    if (S.winT > 2.4) {
      S.winT = 0;
      if (S.level >= LEVELS.length - 1) { S.phase = 'won'; S.phaseT = 0; }
      else { loadLevel(S.level + 1); toast.say(L().name, 'good'); }
    }
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { loadLevel(0); runLoop(step); });

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
  ctx.fillStyle = `rgba(8, 20, 12, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 244, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '8, 24, 14');
  ctx.fillStyle = P.grass;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6b7a68' }); yy += 30; }
  return h + 20;
}

/* ───────── دانه ───────── */

function drawSeed(id, x, y, k, split) {
  const sd = seedBy(id);
  const mono = sd.k === 'mono';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  if (mono) {
    /* دانهٔ تک‌لپه: یک‌تکّه، با شیارِ باریک */
    ctx.fillStyle = P.seedADk;
    wobbleEllipse(0, 1, 20, 13, -.2, 3, 1.2); ctx.fill();
    ctx.fillStyle = P.seedA;
    wobbleEllipse(0, 0, 19, 12, -.2, 5, 1.2); ctx.fill();
    ctx.strokeStyle = P.seedADk; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-12, 3); ctx.lineTo(12, -3); ctx.stroke();
    if (id === 'zorrat') {
      ctx.fillStyle = '#f0d060';
      wobbleEllipse(0, 0, 16, 11, -.2, 9, 1); ctx.fill();
    }
    if (split) {
      ctx.strokeStyle = '#7a6a3a'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.ellipse(-6, 2, 5, 7, -.2, 0, TAU); ctx.stroke();
    }
  } else {
    /* دانهٔ دولپه: دو نیمه */
    const gap = split ? 9 : 0;
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * gap, 0);
      ctx.fillStyle = P.seedBDk;
      ctx.beginPath();
      ctx.ellipse(s * 5, 1, 12, 15, s * .18, 0, TAU); ctx.fill();
      ctx.fillStyle = P.seedB;
      ctx.beginPath();
      ctx.ellipse(s * 5, 0, 11, 14, s * .18, 0, TAU); ctx.fill();
      ctx.restore();
    }
    if (!split) {
      ctx.strokeStyle = P.seedBDk; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(0, 13); ctx.stroke();
    } else {
      ctx.fillStyle = '#8fbf6a';
      ctx.beginPath(); ctx.ellipse(0, 2, 4, 8, 0, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

/* ───────── گیاه ─────────
   ریشه و برگ همان‌شکلی‌اند که کتاب می‌گوید.                        */

function drawPlant(id, cx, g, ok) {
  const sd = seedBy(id), k = KINDS[sd.k];
  const mono = sd.k === 'mono';
  const up = g * (mono ? 120 : 108);
  const down = g * (mono ? 22 : 58) * PXCM;
  const droop = ok ? 0 : Math.max(0, g - .55) / .45;

  /* ریشه */
  ctx.save();
  ctx.strokeStyle = P.root; ctx.lineCap = 'round';
  if (mono) {
    /* افشان: چند ریشهٔ هم‌کلفت که پهن و کم‌عمق پخش می‌شوند */
    for (let i = 0; i < 9; i++) {
      const a = (i / 8 - .5) * 2.1;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(cx, GY);
      const ex = cx + Math.sin(a) * down * 1.5, ey = GY + Math.cos(a * .6) * down;
      ctx.quadraticCurveTo(cx + Math.sin(a) * down * .7, GY + down * .5, ex, ey);
      ctx.stroke();
      ctx.lineWidth = 1.8;
      for (let j = 1; j <= 2; j++) {
        const t = j / 3;
        const bx = cx + Math.sin(a) * down * 1.5 * t, by = GY + Math.cos(a * .6) * down * t;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.sin(a + .8) * 16, by + 14);
        ctx.stroke();
      }
    }
  } else {
    /* راست: یک ریشهٔ کلفت که مستقیم پایین می‌رود، با ریشه‌های نازکِ کناری */
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx, GY);
    ctx.quadraticCurveTo(cx + 6, GY + down * .55, cx + 2, GY + down);
    ctx.stroke();
    ctx.lineWidth = 2.2;
    for (let j = 1; j <= 6; j++) {
      const t = j / 7;
      const by = GY + down * t;
      const s = j % 2 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(cx + 3, by);
      ctx.quadraticCurveTo(cx + s * 18, by + 6, cx + s * 30, by + 16);
      ctx.stroke();
    }
  }
  ctx.restore();

  if (g < .12) return;

  /* ساقه */
  const stemTop = GY - up;
  ctx.strokeStyle = droop > .3 ? '#8a8f4a' : P.stem;
  ctx.lineWidth = mono ? 5 : 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, GY);
  ctx.quadraticCurveTo(cx + droop * 16, GY - up * .6, cx + droop * 34, stemTop + droop * 24);
  ctx.stroke();
  const tipX = cx + droop * 34, tipY = stemTop + droop * 24;

  /* برگ‌ها */
  const col = droop > .3 ? '#a8a25a' : P.leaf;
  const colDk = droop > .3 ? '#7d7a3a' : P.leafDk;
  if (mono) {
    /* برگِ دراز و باریک با رگبرگ‌های موازی */
    for (let i = 0; i < 3; i++) {
      const s = i % 2 ? 1 : -1;
      const base = GY - up * (.25 + i * .26);
      const len = up * (.62 - i * .1);
      ctx.save();
      ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, base);
      ctx.quadraticCurveTo(cx + s * len * .6, base - len * .5,
        cx + s * len * .95, base - len * .18 + droop * 40);
      ctx.stroke();
      ctx.strokeStyle = colDk; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, base);
      ctx.quadraticCurveTo(cx + s * len * .6, base - len * .5,
        cx + s * len * .95, base - len * .18 + droop * 40);
      ctx.stroke();
      ctx.restore();
    }
  } else {
    /* برگِ پهن با رگبرگ‌های شبکه‌ای */
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      const base = GY - up * .72;
      ctx.save();
      ctx.translate(cx + droop * 24, base + droop * 18);
      ctx.rotate(s * .5 + droop * .5);
      const w = up * .34, h = up * .26;
      ctx.fillStyle = colDk;
      wobbleEllipse(s * w * .8, 2, w, h, 0, 3 + i, 1.6); ctx.fill();
      ctx.fillStyle = col;
      wobbleEllipse(s * w * .8, 0, w * .96, h * .94, 0, 5 + i, 1.6); ctx.fill();
      ctx.strokeStyle = colDk; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * w * 1.7, 0); ctx.stroke();
      for (let v = 1; v <= 3; v++) {
        const t = v / 4;
        ctx.beginPath();
        ctx.moveTo(s * w * 1.7 * t, 0);
        ctx.lineTo(s * w * 1.7 * t + s * 10, -h * .6);
        ctx.moveTo(s * w * 1.7 * t, 0);
        ctx.lineTo(s * w * 1.7 * t + s * 10, h * .6);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /* گل، وقتی جا گرفته باشد */
  if (ok && g > .82) {
    const fg = (g - .82) / .18;
    if (mono) {
      ctx.fillStyle = P.flowerA;
      for (let i = 0; i < 7; i++) {
        const y = tipY - 6 + i * 7;
        wobbleEllipse(tipX + (i % 2 ? 5 : -5), y, 7 * fg, 4.4 * fg, 0, i, .8); ctx.fill();
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const a = i * TAU / 5 - Math.PI / 2;
        ctx.fillStyle = P.flowerB;
        wobbleEllipse(tipX + Math.cos(a) * 13 * fg, tipY + Math.sin(a) * 13 * fg,
          10 * fg, 8 * fg, a, i * 3, 1); ctx.fill();
      }
      ctx.fillStyle = P.flowerA;
      wobbleCircle(tipX, tipY, 7 * fg, 3, 1); ctx.fill();
    }
  }
  /* نشانهٔ سرنوشت */
  if (g > .95) {
    const y = GY - up - 46;
    ctx.fillStyle = ok ? P.good : P.bad;
    ctx.beginPath(); ctx.arc(cx, y, 15, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath();
    if (ok) { ctx.moveTo(cx - 6, y); ctx.lineTo(cx - 1, y + 6); ctx.lineTo(cx + 7, y - 6); }
    else { ctx.moveTo(cx - 6, y - 6); ctx.lineTo(cx + 6, y + 6); ctx.moveTo(cx + 6, y - 6); ctx.lineTo(cx - 6, y + 6); }
    ctx.stroke();
  }
}

/* ───────── باغ ───────── */

function drawSpot(i) {
  const r = spotRect(i);
  const sp = SPOTS[L().spots[i]];
  const cx = r.x + r.w / 2;

  /* آسمانِ این ستون */
  ctx.save();
  ctx.beginPath(); ctx.rect(r.x, FIELD.y, r.w, FIELD.h); ctx.clip();
  const g = ctx.createLinearGradient(0, FIELD.y, 0, GY);
  g.addColorStop(0, P.skyHi); g.addColorStop(1, P.sky);
  ctx.fillStyle = g;
  ctx.fillRect(r.x, FIELD.y, r.w, GY - FIELD.y);

  /* خاک */
  ctx.fillStyle = texStone(P.soil, P.soilDk);
  ctx.fillRect(r.x, GY, r.w, FIELD.y + FIELD.h - GY);
  ctx.fillStyle = vgrad(GY, FIELD.y + FIELD.h, 'rgba(255,255,255,.12)', 'rgba(0,0,0,.42)');
  ctx.fillRect(r.x, GY, r.w, FIELD.y + FIELD.h - GY);

  /* آبِ زیرزمینی */
  const wy = GY + sp.table * PXCM;
  if (wy < FIELD.y + FIELD.h) {
    ctx.fillStyle = 'rgba(63,143,196,.55)';
    ctx.fillRect(r.x, wy, r.w, FIELD.y + FIELD.h - wy);
    ctx.fillStyle = P.waterLt;
    ctx.fillRect(r.x, wy, r.w, 3);
    for (let k = 0; k < 5; k++) {
      ctx.globalAlpha = .3;
      ctx.beginPath();
      ctx.arc(r.x + 18 + ((k * 53) % (r.w - 30)), wy + 20 + ((k * 31) % 60), 4, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  /* رطوبتِ سطحی از باران */
  ctx.fillStyle = `rgba(63,143,196,${.10 + sp.rain * .30})`;
  ctx.fillRect(r.x, GY, r.w, 10 * PXCM);

  /* سایه یا آفتاب */
  if (sp.light < .6) {
    ctx.fillStyle = 'rgba(14,32,22,.45)';
    ctx.fillRect(r.x, FIELD.y, r.w, GY - FIELD.y);
  } else if (sp.sun > 1.2) {
    ctx.fillStyle = 'rgba(255,210,122,.16)';
    ctx.fillRect(r.x, FIELD.y, r.w, GY - FIELD.y);
  }
  ctx.restore();

  /* چمنِ سطح */
  ctx.fillStyle = P.grassDk;
  ctx.fillRect(r.x, GY - 4, r.w, 8);
  ctx.fillStyle = P.grass;
  for (let x = r.x; x < r.x + r.w; x += 8) {
    const h = 6 + ((x * 29) % 8);
    ctx.beginPath();
    ctx.moveTo(x, GY + 2); ctx.lineTo(x + 3, GY - h); ctx.lineTo(x + 6, GY + 2);
    ctx.closePath(); ctx.fill();
  }

  /* نشانه‌های شرطِ گودال */
  const iy = FIELD.y + 30;
  if (sp.light < .6) {
    /* ابرِ سایه */
    ctx.fillStyle = 'rgba(40,66,54,.85)';
    for (const [dx, dy, rr] of [[-26, 0, 22], [2, -8, 27], [30, 2, 20]]) {
      wobbleCircle(cx + dx, iy + dy, rr, dx, 2); ctx.fill();
    }
  } else {
    ctx.fillStyle = sp.sun > 1.2 ? '#ffb347' : P.sun;
    wobbleCircle(cx, iy, sp.sun > 1.2 ? 22 : 18, 3, 1.4); ctx.fill();
    ctx.strokeStyle = sp.sun > 1.2 ? '#ffb347' : P.sun;
    ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    for (let k = 0; k < 8; k++) {
      const a = k * TAU / 8 + S.t * .1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 27, iy + Math.sin(a) * 27);
      ctx.lineTo(cx + Math.cos(a) * (sp.sun > 1.2 ? 40 : 35), iy + Math.sin(a) * (sp.sun > 1.2 ? 40 : 35));
      ctx.stroke();
    }
  }
  /* بارانِ ستون */
  if (sp.rain > .5) {
    ctx.strokeStyle = 'rgba(127,196,232,.75)'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    for (let k = 0; k < 7; k++) {
      const x = r.x + 20 + ((k * 37) % (r.w - 40));
      const y = FIELD.y + 76 + ((S.t * 90 + k * 40) % (GY - FIELD.y - 90));
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 14); ctx.stroke();
    }
  }

  /* گیاه یا گودالِ خالی — همه‌چیز داخلِ ستونِ خودش */
  ctx.save();
  ctx.beginPath(); rrPath(r.x, FIELD.y, r.w, FIELD.h, 12); ctx.clip();
  const id = S.put[i];
  if (id) {
    const g = S.growing || S.grow > 0 ? S.grow : .001;
    if (g < .05) drawSeed(id, cx, GY + 16, .9, false);
    else drawPlant(id, cx, g, spotOK(i));
  } else {
    ctx.save();
    ctx.globalAlpha = .5 + .25 * Math.sin(S.t * 2.6 + i);
    ctx.strokeStyle = P.paper; ctx.lineWidth = 3;
    ctx.setLineDash([9, 8]);
    ctx.beginPath(); ctx.ellipse(cx, GY + 10, 32, 15, 0, 0, TAU); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = P.soilDk;
    ctx.beginPath(); ctx.ellipse(cx, GY + 12, 26, 11, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();

  /* نامِ شرط */
  ctx.fillStyle = 'rgba(20,32,24,.6)';
  ctx.beginPath(); rrPath(cx - 62, FIELD.y + FIELD.h - 40, 124, 30, 9); ctx.fill();
  text(sp.n, cx, FIELD.y + FIELD.h - 25, { size: 14, color: P.paper });
  /* مرزِ ستون */
  ctx.strokeStyle = 'rgba(12,24,16,.55)'; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(r.x, FIELD.y, r.w, FIELD.h, 12); ctx.stroke();
}

function drawTray() {
  ctx.fillStyle = '#1d2a20';
  ctx.beginPath(); rrPath(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(90,168,196,.2)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 14); ctx.stroke();
  S.bag.forEach((id, i) => {
    const b = bagRect(i);
    if (S.drag && S.drag.id === id && S.bag.indexOf(id) === i) return;
    const hot = S.hover && S.hover.k === 'bag' && S.hover.i === i;
    ctx.fillStyle = hot ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.07)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(224,236,224,.24)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.stroke();
    drawSeed(id, b.x + b.w / 2, b.y + 36, .95, false);
    text(seedBy(id).n, b.x + b.w / 2, b.y + b.h - 18,
      { size: seedBy(id).n.length > 8 ? 12 : 14, color: '#dff0e0' });
  });
  text('دانه را بکش توی گودال — یک ضربه هم بزنی، زیرِ ذرّه‌بین می‌بینی‌اش',
    TRAY.x + TRAY.w / 2 - 120, TRAY.y + TRAY.h - 10,
    { size: 13, color: 'rgba(223,240,224,.45)' });
  button(BTN_GROW, S.growing ? 'دارند رشد می‌کنند…' : 'بکار و ببین', {
    hot: S.hover && S.hover.k === 'grow', fill: '#3f8f4a', hotFill: '#55a860',
    size: 22, disabled: S.growing });
  button(BTN_CLEAR, 'همه را دربیاور', {
    hot: S.hover && S.hover.k === 'clear', fill: '#4a5c4a', hotFill: '#5f7460', size: 17 });
}

function drawLens() {
  if (S.lens < 0 || S.lens >= S.bag.length) return;
  const id = S.bag[S.lens];
  const sd = seedBy(id), k = KINDS[sd.k];
  ctx.fillStyle = 'rgba(10, 20, 14, .82)';
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  const w = 560, h = 380, x = (SCENE_W - w) / 2, y = 180;
  paper(x, y, w, h, P.paper, 41, 18, .5);
  ctx.fillStyle = P.grass;
  ctx.beginPath(); rrPath(x, y, w, 10, 5); ctx.fill();
  text(sd.n, x + w / 2, y + 46, { size: 28, family: 'Lalezar', color: P.ink });
  text('دانه را خیس کردیم و پوستش را برداشتیم', x + w / 2, y + 80,
    { size: 15, color: P.inkSoft });
  ctx.save();
  ctx.translate(0, 30);
  drawSeed(id, x + w / 2, y + 190, 3.4, true);
  ctx.restore();
  text(sd.k === 'mono' ? 'یک قسمتی' : 'دو قسمتی', x + w / 2, y + 314,
    { size: 24, family: 'Lalezar', color: P.grassDk });
  text('برای بستن، هرجا را بزن', x + w / 2, y + 352, { size: 14, color: P.inkSoft });
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#101a12';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224,166,63,.22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 150, HUD_H / 2, { size: 24, family: 'Lalezar', color: P.paper });
  numText(fa(S.level + 1) + ' / ' + fa(LEVELS.length), 640, HUD_H / 2, { size: 21, color: P.gold });
  numText(fa(S.score), 300, HUD_H / 2, { size: 20, color: P.paper });
  text('بیشترین ' + fa(S.best), 150, HUD_H / 2, { size: 15, color: 'rgba(251,247,232,.6)' });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * clamp((S.level + (S.won ? 1 : 0)) / LEVELS.length, 0, 1), 5, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    const r = spotRect(0);
    spot([{ x: r.x, y: FIELD.y, w: r.w, h: FIELD.h }], .72);
    const h = tutCard(380, 250, 520,
      ['هر گودال شرطِ خودش را دارد:', 'آب کجاست و آفتاب چقدر است.'], 'باغِ درست');
    tutMore(640, 250 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: TRAY.x, y: TRAY.y, w: 300, h: TRAY.h }], .7);
    const h = tutCard(380, 250, 520,
      ['دانه را بکش توی گودال.', 'یک ضربه بزنی، توی ذرّه‌بین می‌بینی‌اش.']);
    tutMore(640, 250 + h + 8, S.t, P.ink);
  } else {
    spot([{ x: BTN_GROW.x, y: BTN_GROW.y, w: BTN_GROW.w, h: BTN_GROW.h }], .7);
    const h = tutCard(320, 230, 560,
      ['بعد «بکار و ببین» را بزن', 'و ریشه‌ها را زیرِ خاک تماشا کن.']);
    tutMore(600, 230 + h + 8, S.t, P.ink);
  }
}

function seedIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  drawSeed('gandom', -26, 0, 1.1, false);
  drawSeed('lubia', 26, 0, 1.1, false);
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 880, h: 306, y: 128,
    paper: P.paper, band: P.grass, ink: P.ink, inkSoft: '#6b7a68',
    icon: seedIcon,
    title: 'باغِ درست',
    body: 'هر گودالِ باغ شرطِ خودش را دارد: آبش عمیق است یا سطحی،\nآفتابش تند است یا سایه.\nدانهٔ درست را در گودالِ درست بکار تا همه گل بدهند.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#3f8f4a', btnHotFill: '#55a860',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 840, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#6b7a68',
    icon: seedIcon,
    title: 'باغت گل داد',
    body: 'دانهٔ دو قسمتی ریشهٔ راست و برگِ پهن دارد،\nدانهٔ یک قسمتی ریشهٔ افشان و برگِ باریک —\nو همین بود که هرکدام را جای خودش زنده نگه داشت. امتیازت: ' + fa(S.score),
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#3f8f4a', btnHotFill: '#55a860',
  });
}

function draw() {
  beginScene(P.skyLo);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, 0);
  }
  ctx.fillStyle = P.skyLo;
  ctx.fillRect(0, HUD_H, SCENE_W, SCENE_H - HUD_H);
  for (let i = 0; i < L().spots.length; i++) drawSpot(i);
  drawTray();
  if (S.drag) drawSeed(S.drag.id, S.drag.x, S.drag.y, 1.1, false);
  bits.draw();
  ctx.restore();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on && S.lens < 0) drawTutorial();
  if (S.lens >= 0) drawLens();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 470;
    paper(SCENE_W / 2 - w / 2, GY - 60, w, 42, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, GY - 39, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.08, 'rgba(8, 20, 12, .4)', 0, .1);
}

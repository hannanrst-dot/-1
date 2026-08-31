/*!
title: بادکنکِ هزار — معرّفی عدد هزار
bg: #0d1b30
*/

/* ═══════════════════════════════════════════════════════════════════════
   بادکنکِ هزار — ریاضی سوم، فصل ۲، درس ۲ (معرّفی عدد هزار)
   ───────────────────────────────────────────────────────────────────────
   کتاب سه الگو دارد که هر سه به یک جا می‌رسند:
       ۱۰۰، ۲۰۰، … ، ۱۰۰۰      (ده تا صدتایی)
       ۹۰۰، ۹۱۰، … ، ۱۰۰۰      (ده تا ده‌تایی)
       ۹۹۰، ۹۹۱، … ، ۱۰۰۰      (ده تا یکی)

   اینجا هر سه یک کارند: بالا رفتنِ بادکنک تا جزیرهٔ هزار. تنها چیزی که
   عوض می‌شود، بزرگیِ خط‌کشِ کنارِ صحنه است — و بین مرحله‌ها دوربین روی
   همان محور زوم می‌کند، از ۰ تا ۱۰۰۰ به ۹۰۰ تا ۱۰۰۰ و بعد ۹۹۰ تا ۱۰۰۰.
   بچه با چشمِ خودش می‌بیند که هر سه راه به یک نقطه می‌رسند؛ فقط پلّه‌ها
   کوچک‌تر شده‌اند.

   سوختِ بادکنک همان دسته‌های کتاب است: مکعّبِ یکی، میلهٔ ده‌تایی و
   صفحهٔ صدتایی. جایزهٔ آخر هم مکعّبِ بزرگِ هزارتایی است.

   باید دقیقاً روی ابرِ هدف بایستی. زیادی بریزی، از آن رد می‌شوی و سرما
   می‌خوری و برمی‌گردی سرِ جای قبلی. پس شمردن مهم است، نه تند زدن.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  skyTop:   '#12294d',
  skyMid:   '#3f7fa8',
  skyLo:    '#a9d6de',
  cloud:    '#f2f6f8',
  cloudDk:  '#cfdde6',
  cloudFar: 'rgba(226, 240, 246, .38)',
  hill:     '#4b7b52',
  hillDk:   '#3a6242',
  hillFar:  '#6d9a7a',
  roof:     '#b3563f',
  wall:     '#e8dcc0',
  wood:     '#8a5a32',
  woodDk:   '#5f3c1f',
  woodLit:  '#a97442',
  rope:     '#d8c49a',
  env1:     '#e2574c',
  env2:     '#f0b33c',
  env3:     '#4e9ed6',
  env4:     '#f2ece0',
  brass:    '#d9a840',
  brassDk:  '#a2761f',
  ones:     '#e8b04a',
  onesDk:   '#bd8524',
  tens:     '#5fae7a',
  tensDk:   '#3d8556',
  hund:     '#5e94d6',
  hundDk:   '#3b6bab',
  thou:     '#e6c15a',
  thouDk:   '#b08f2c',
  paper:    '#fbf3e2',
  ink:      '#26313f',
  inkSoft:  '#6f8291',
  good:     '#6fa85c',
  bad:      '#cf5f4a',
  gold:     '#f0c552',
  flame:    '#ffcf6b',
};

/* ───────── دسته‌های کتاب: یکی، ده‌تایی، صدتایی ───────── */

const UNITS = [
  { v: 100, name: 'صدتایی', col: P.hund, dk: P.hundDk },
  { v: 10,  name: 'ده‌تایی', col: P.tens, dk: P.tensDk },
  { v: 1,   name: 'یکی',    col: P.ones, dk: P.onesDk },
];

const LEVELS = [
  { name: 'ده تا صدتایی', from: 0, gates: [300, 700, 1000],
    stock: [10, 0, 0], view: [0, 1000],
    hint: 'فقط صدتایی داری. تا ابرِ اوّل چند تا لازم است؟' },
  { name: 'ده تا ده‌تایی', from: 900, gates: [930, 970, 1000],
    stock: [0, 10, 0], view: [900, 1000],
    hint: 'خط‌کش زوم شد. حالا هر پلّه ده‌تاست.' },
  { name: 'ده تا یکی', from: 990, gates: [993, 997, 1000],
    stock: [0, 0, 10], view: [990, 1000],
    hint: 'باز هم زوم. ده تا یکی هم می‌رساندت به هزار.' },
  { name: 'هر سه با هم', from: 0, gates: [246, 583, 1000],
    stock: [10, 11, 24], view: [0, 1000],
    hint: 'حالا هر سه دسته را داری. راهش یکی نیست؛ خودت انتخاب کن.' },
  { name: 'پروازِ آزاد', endless: true, from: 0,
    stock: [12, 14, 26], view: [0, 1000],
    hint: 'ابرها هر بار جای تازه‌ای‌اند. تا وقتی دل داری پرواز کن.' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  alt: 0,               // ارتفاعِ نشان‌داده‌شده (نرم)
  target: 0,            // ارتفاعِ واقعی که به آن می‌رویم
  gates: [],
  gi: 0,                // ابرِ بعدی
  segStart: 0,          // ارتفاعِ ابرِ قبلی
  segSpent: [0, 0, 0],  // چقدر سوخت در این تکّه خرج شده
  stock: [0, 0, 0],
  view: { lo: 0, hi: 1000 },
  viewTo: { lo: 0, hi: 1000 },
  viewFrom: { lo: 0, hi: 1000 },
  viewT: 1,
  hearts: 3,
  score: 0, best: 0,
  flights: 0,
  burn: 0,              // شعلهٔ مشعل
  over: null,           // انیمیشنِ رد شدن از ابر
  t: 0, phaseT: 0,
  hover: null,
  shake: 0,
  clouds: [],
  floats: [],
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const nextGate = () => S.gates[S.gi];

function loadBest() { try { return +localStorage.getItem('hezar-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('hezar-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── چیدمان ───────── */

const HUD_H = 52;
const RULER = { x: 300, top: 200, bot: 664 };
const BX = 520;                                  // محورِ عمودیِ بادکنک
const FUEL = { x: 762, y: 138, w: 408, h: 486 };
const ALT_CARD = { x: 26, y: 74, w: 190, h: 92 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

function fuelBox(i) {
  const h = 132, gap = 22;
  return { x: FUEL.x + 20, y: FUEL.y + 92 + i * (h + gap), w: FUEL.w - 40, h };
}

function yOf(v) {
  const k = (v - S.view.lo) / (S.view.hi - S.view.lo);
  return RULER.bot - k * (RULER.bot - RULER.top);
}

/** پلّهٔ درشتِ خط‌کش = یک‌دهمِ پنجره؛ همان چیزی که کتاب روی محور می‌کشد. */
function majorStep() { return (S.view.hi - S.view.lo) / 10; }

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 10; i++) {
  S.clouds.push({ a: Math.random() * 1100, x: Math.random() * SCENE_W,
                  w: 54 + Math.random() * 84, sp: 4 + Math.random() * 12, far: i % 2 === 0 });
}
whenFontsReady(() => runLoop(step));

/** ابرهای هدف را برای پروازِ آزاد می‌سازد؛ همیشه صعودی. */
function randomGates() {
  const g1 = 120 + Math.floor(Math.random() * 260);
  const g2 = g1 + 150 + Math.floor(Math.random() * 300);
  return [g1, g2, 1000];
}

/** چند تا از هر دسته لازم است تا از from به این ابرها برسیم. */
function stockFor(gates, from) {
  const need = [0, 0, 0];
  let cur = from;
  for (const g of gates) {
    let d = g - cur;
    need[0] += Math.floor(d / 100); d %= 100;
    need[1] += Math.floor(d / 10);  d %= 10;
    need[2] += d;
    cur = g;
  }
  return need;
}

/** آیا با این موجودی می‌شود دقیقاً به فاصلهٔ need رسید؟ */
function canReach(need, st) {
  const maxH = Math.min(st[0], Math.floor(need / 100));
  for (let h = maxH; h >= 0; h--) {
    const r = need - h * 100;
    const maxT = Math.min(st[1], Math.floor(r / 10));
    for (let t = maxT; t >= 0; t--) {
      if (r - t * 10 <= st[2]) return true;
    }
  }
  return false;
}

/* کمبودِ سوخت باید سخت باشد، نه بن‌بست: اگر بچه جوری خرج کرده که دیگر
   نمی‌تواند دقیقاً روی ابر بنشیند، از زمین برایش بسته می‌فرستند. */
function ensureReachable() {
  if (S.gi >= S.gates.length) return;
  const need = nextGate() - S.target;
  if (need <= 0 || canReach(need, S.stock)) return;
  const want = [Math.floor(need / 100), Math.floor((need % 100) / 10), need % 10];
  for (let i = 0; i < 3; i++) if (S.stock[i] < want[i]) S.stock[i] = want[i];
  toast.say('سوختت جور در نمی‌آمد؛ از زمین بستهٔ کمکی رسید', 'info');
  sfx.place();
}

function startLevel(i, keepScore) {
  const lv = LEVELS[i];
  S.level = i;
  S.viewFrom = { ...S.view };             // از جای فعلی زوم می‌کند
  S.viewTo = { lo: lv.view[0], hi: lv.view[1] };
  S.viewT = S.phase === 'intro' ? 1 : 0;
  if (S.phase === 'intro') S.view = { ...S.viewTo };
  S.gates = lv.endless ? randomGates() : lv.gates.slice();
  S.alt = lv.from; S.target = lv.from;
  S.gi = 0; S.segStart = lv.from; S.segSpent = [0, 0, 0];
  S.stock = lv.endless
    ? stockFor(S.gates, lv.from).map((n, k) => n + [3, 5, 8][k])
    : lv.stock.slice();
  S.over = null;
  S.flights = 0;
  if (!keepScore) S.hearts = 3;
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0; S.tut.step = 0; S.tut.t = 0;
  toast.say(lv.hint, 'info');
}

function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 26 }); }

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;

  /* زومِ دوربین روی همان محور — زمان‌دار است تا دقیقاً سرِ عددهای گِرد
     بایستد؛ وگرنه برچسب‌های خط‌کش عددهای عجیب می‌شوند. */
  if (S.viewT < 1) {
    S.viewT = Math.min(1, S.viewT + dt / .9);
    const e = easeInOut(S.viewT);
    S.view.lo = lerp(S.viewFrom.lo, S.viewTo.lo, e);
    S.view.hi = lerp(S.viewFrom.hi, S.viewTo.hi, e);
  }

  /* بالا رفتنِ نرمِ بادکنک */
  if (Math.abs(S.alt - S.target) > .02) {
    S.alt = lerp(S.alt, S.target, Math.min(1, dt * 3.4));
    S.burn = Math.min(1, S.burn + dt * 4);
  } else {
    S.alt = S.target;
    S.burn = Math.max(0, S.burn - dt * 1.6);
  }

  stepOver(dt);

  for (const c of S.clouds) {
    c.x += c.sp * dt * (c.far ? .4 : 1);
    if (c.x > SCENE_W + 200) { c.x = -200; c.a = Math.random() * 1100; }
  }
  for (const f of S.floats) { f.t += dt; f.y -= 44 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.5);
  if (S.phase === 'play' && S.tut.on) tutStep(dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── ریختنِ سوخت ───────── */

function burn(i) {
  if (S.phase !== 'play' || S.over) return;
  if (S.stock[i] <= 0) { S.shake = .16; sfx.tone(150, .1, 'sine', .05); return; }
  const g = nextGate();
  const nv = S.target + UNITS[i].v;
  S.stock[i]--;
  S.segSpent[i]++;
  sfx.tone(520 + i * 90, .12, 'triangle', .1);

  if (nv > g) {                       // از ابر رد شدی
    S.target = nv;
    S.over = { t: 0 };
    return;
  }
  S.target = nv;
  bits.add(BX, yOf(S.target) + 62, 8, 'dot', [P.flame, '#ffe9b0'],
    { speed: 90, lift: -40, size: 3.4, life: .5, grav: -60 });
  if (nv === g) reachGate(); else ensureReachable();
}

function reachGate() {
  S.score += 200;
  floatText(BX, yOf(nextGate()) - 70, `+${fa(200)}`, P.gold);
  bits.confetti(BX, yOf(nextGate()) - 30, 22, [P.gold, P.cloud, P.thou]);
  sfx.good();
  S.gi++;
  S.segStart = S.target;
  S.segSpent = [0, 0, 0];
  if (S.gi >= S.gates.length) return finishFlight();
  toast.say('روی ابر نشستی! ابرِ بعدی', 'good');
  ensureReachable();
}

function finishFlight() {
  const left = S.stock.reduce((a, b) => a + b, 0);
  S.score += 400 + left * 40;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  sfx.win();
  bits.confetti(BX, yOf(1000) - 20, 80, [P.gold, P.thou, P.cloud, P.env1, P.env3]);
  S.flights++;
  if (L().endless) {
    /* پروازِ آزاد: دوباره از زمین، ابرهای تازه */
    S.phase = 'won'; S.phaseT = 0;
  } else {
    S.phase = 'won'; S.phaseT = 0;
  }
}

function stepOver(dt) {
  if (!S.over) return;
  S.over.t += dt;
  if (S.over.t < 1.1) return;
  /* سرما خورد و برگشت سرِ ابرِ قبلی؛ سوختِ این تکّه پس داده می‌شود
     چون بچه نباید به بن‌بست بخورد — ولی یک دل کم می‌شود. */
  for (let i = 0; i < 3; i++) { S.stock[i] += S.segSpent[i]; S.segSpent[i] = 0; }
  S.target = S.segStart;
  S.over = null;
  S.hearts--;
  S.shake = .4;
  sfx.nope();
  if (S.hearts <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  toast.say('از ابر رد شدی! برگشتی سرِ جای قبل', 'bad');
  ensureReachable();
}

/* ───────── آموزش ───────── */

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 5.2) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 1 && S.target > S.segStart) { S.tut.step = 2; S.tut.t = 0; }
  if (S.tut.step === 2 && S.tut.t > 8) S.tut.on = false;
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  for (let i = 0; i < 3; i++) if (inRect(p, fuelBox(i))) return { fuel: i };
  return null;
}

cv.addEventListener('pointermove', (e) => {
  S.hover = hitTest(toStage(e));
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});
cv.addEventListener('pointerleave', () => { S.hover = null; });
cv.addEventListener('pointerdown', (e) => {
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
  if (h && h.fuel !== undefined) burn(h.fuel);
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
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(8, 18, 34, ${alpha})`;
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
  }, '10, 24, 40');
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

/** دستهٔ ده‌تاییِ کتاب، در مقیاسِ واقعی: یکی کوچک است و صد، صد برابر.
    x,y گوشهٔ پایین-چپِ رویهٔ جلو است. */
function blockArt(cols, rows, x, y, cell, col, dk, lit) {
  const w = cols * cell, h = rows * cell;
  const d = cell * .55;
  const bx = x, by = y - h;
  ctx.fillStyle = lit;                        // رویهٔ بالا
  ctx.beginPath();
  ctx.moveTo(bx, by); ctx.lineTo(bx + d, by - d);
  ctx.lineTo(bx + w + d, by - d); ctx.lineTo(bx + w, by);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = dk;                         // رویهٔ راست
  ctx.beginPath();
  ctx.moveTo(bx + w, by); ctx.lineTo(bx + w + d, by - d);
  ctx.lineTo(bx + w + d, by + h - d); ctx.lineTo(bx + w, by + h);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = col;                        // رویهٔ جلو
  ctx.fillRect(bx, by, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1;
  for (let c = 1; c < cols; c++) { ctx.beginPath(); ctx.moveTo(bx + c * cell, by); ctx.lineTo(bx + c * cell, by + h); ctx.stroke(); }
  for (let r = 1; r < rows; r++) { ctx.beginPath(); ctx.moveTo(bx, by + r * cell); ctx.lineTo(bx + w, by + r * cell); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.6;
  ctx.strokeRect(bx, by, w, h);
}

function unitArt(i, x, y, cell) {
  const u = UNITS[i];
  const lit = shade(u.col, 30);
  if (i === 0) blockArt(10, 10, x, y, cell, u.col, u.dk, lit);
  else if (i === 1) blockArt(10, 1, x, y, cell, u.col, u.dk, lit);
  else blockArt(1, 1, x, y, cell, u.col, u.dk, lit);
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => clamp(v + amt, 0, 255).toString(16).padStart(2, '0'));
  return `#${c.join('')}`;
}

/** ابرِ کاغذی: پهن و کم‌ارتفاع، مثل سکّویی که می‌شود رویش نشست. */
function cloud(cx, cy, w, seed, col, alpha, solid) {
  ctx.save();
  ctx.globalAlpha = alpha === undefined ? 1 : alpha;
  if (solid) {
    ctx.save();
    ctx.globalAlpha = (alpha === undefined ? 1 : alpha) * .22;
    ctx.fillStyle = '#3b6a8c';
    wobbleEllipse(cx + 6, cy + w * .12, w * .5, w * .09, 0, seed + 21, 1.6);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = col;
  const n = 5;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) - .5;
    const r = w * (.19 + .13 * Math.cos(t * 3.1) + noise1(seed + i) * .05);
    wobbleEllipse(cx + t * w * .78, cy - Math.cos(t * 2.6) * w * .05, r, r * .62,
      0, seed + i * 3, 1.6);
    ctx.fill();
  }
  wobbleEllipse(cx, cy + w * .05, w * .48, w * .09, 0, seed + 9, 1.4);
  ctx.fill();
  ctx.restore();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#0d1b30');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 13;
    ctx.translate(Math.sin(S.t * 60) * k, Math.cos(S.t * 47) * k * .6);
  }

  drawSky();
  drawFarClouds();
  drawGround();
  drawGoal();
  drawRuler();
  drawGates();
  drawBalloon();
  drawNearClouds();
  bits.draw();
  drawFloats();
  ctx.restore();

  drawFuel();
  drawAltCard();
  drawHUD();
  ctx.save();
  ctx.translate(BX - SCENE_W / 2, 0);
  toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  ctx.restore();

  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.1, 'rgba(8, 20, 40, .34)');
}

function drawSky() {
  /* هرچه بالاتر، آسمان تیره‌تر و سردتر */
  const high = clamp(S.view.lo / 1000, 0, 1);
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, high > .5 ? '#0b1c38' : P.skyTop);
  g.addColorStop(.55, high > .5 ? '#2c5e8c' : P.skyMid);
  g.addColorStop(1, high > .8 ? '#6fb0c8' : P.skyLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* خورشید و هالهٔ آن */
  const sx = 1000, sy = 140;
  const gl = ctx.createRadialGradient(sx, sy, 8, sx, sy, 240);
  gl.addColorStop(0, 'rgba(255, 236, 180, .34)');
  gl.addColorStop(1, 'rgba(255, 236, 180, 0)');
  ctx.fillStyle = gl;
  ctx.fillRect(sx - 240, sy - 240, 480, 480);
  ctx.fillStyle = '#fff2cd';
  wobbleCircle(sx, sy, 40, 3, 1.6); ctx.fill();

  /* پرنده‌های دور */
  ctx.strokeStyle = 'rgba(30, 50, 70, .3)'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const x = 660 + i * 54 + Math.sin(S.t * .3 + i) * 24;
    const y = 250 + Math.sin(S.t * .5 + i * 2) * 10;
    const f = Math.sin(S.t * 3 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + f); ctx.quadraticCurveTo(x, y - 5, x + 10, y + f);
    ctx.stroke();
  }
}

function drawFarClouds() {
  for (const c of S.clouds) {
    if (!c.far) continue;
    const y = yOf(c.a);
    if (y < -120 || y > SCENE_H + 120) continue;
    cloud(c.x, y, c.w, c.a, 'rgba(226, 240, 246, .22)', 1);
  }
}

function drawNearClouds() {
  for (const c of S.clouds) {
    if (c.far) continue;
    const y = yOf(c.a);
    if (y < -140 || y > SCENE_H + 140) continue;
    cloud(c.x, y, c.w * 1.1, c.a + 5, P.cloud, .26);
  }
}

/** زمین فقط وقتی دیده می‌شود که ارتفاعِ صفر توی پنجره باشد. */
function drawGround() {
  const y0 = yOf(0);
  if (y0 < -60) return;
  ctx.fillStyle = P.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H);
  for (let x = 0; x <= SCENE_W; x += 40) ctx.lineTo(x, y0 - 26 - Math.sin(x * .008) * 22);
  ctx.lineTo(SCENE_W, SCENE_H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.hill;
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H);
  for (let x = 0; x <= SCENE_W; x += 40) ctx.lineTo(x, y0 - Math.sin(x * .011 + 2) * 14);
  ctx.lineTo(SCENE_W, SCENE_H); ctx.closePath(); ctx.fill();

  /* خانه‌های ده */
  for (const h of [{ x: 640, s: 1 }, { x: 730, s: .8 }, { x: 840, s: .95 }, { x: 250, s: .7 }]) {
    const b = y0 + 16, w = 54 * h.s, hh = 42 * h.s;
    ctx.fillStyle = P.wall;
    wobbleRect(h.x - w / 2, b - hh, w, hh, 3, h.x, 1); ctx.fill();
    ctx.fillStyle = P.roof;
    ctx.beginPath();
    ctx.moveTo(h.x - w / 2 - 6, b - hh);
    ctx.lineTo(h.x, b - hh - 26 * h.s);
    ctx.lineTo(h.x + w / 2 + 6, b - hh);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5f7f9a';
    wobbleRect(h.x - 8 * h.s, b - hh + 12, 16 * h.s, 14 * h.s, 2, h.x + 2, .6); ctx.fill();
  }
  /* درخت‌ها */
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * 132 + noise1(i * 3) * 40;
    const b = y0 + 24 + noise1(i * 7) * 14;
    ctx.strokeStyle = P.woodDk; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, b); ctx.lineTo(x, b - 26); ctx.stroke();
    ctx.fillStyle = P.hillDk;
    wobbleCircle(x, b - 40, 20, i * 3, 1.6); ctx.fill();
  }
}

/* ───────── جزیرهٔ هزار ───────── */

function drawGoal() {
  const y = yOf(1000);
  if (y < -220 || y > SCENE_H + 160) return;
  const bob = Math.sin(S.t * .9) * 5;
  cloud(BX, y + 26 + bob, 206, 77, P.cloud, 1, true);
  cloud(BX - 150, y + 36 + bob, 96, 91, P.cloudDk, .62);
  cloud(BX + 152, y + 34 + bob, 100, 93, P.cloudDk, .62);

  /* مکعّبِ بزرگِ هزارتایی — جایزه و نمادِ درس */
  const cx = BX, cy = y + 16 + bob, s = 70;
  const gl = ctx.createRadialGradient(cx, cy - 20, 6, cx, cy - 20, 190);
  gl.addColorStop(0, `rgba(255, 226, 140, ${.3 + .1 * Math.sin(S.t * 2)})`);
  gl.addColorStop(1, 'rgba(255, 226, 140, 0)');
  ctx.fillStyle = gl;
  ctx.fillRect(cx - 190, cy - 210, 380, 380);
  blockArt(10, 10, cx - s / 2, cy, s / 10, P.thou, P.thouDk, shade(P.thou, 34));
  /* عددش را خطِ‌کش می‌گوید؛ اینجا دوباره نوشتنش لازم نیست. */
}

/* ───────── خط‌کشِ ارتفاع ───────── */

function drawRuler() {
  const ms = majorStep();
  ctx.save();
  ctx.strokeStyle = 'rgba(20, 40, 60, .30)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(RULER.x + 2, RULER.top - 12); ctx.lineTo(RULER.x + 2, RULER.bot + 12); ctx.stroke();
  ctx.strokeStyle = P.paper; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(RULER.x, RULER.top - 14); ctx.lineTo(RULER.x, RULER.bot + 14); ctx.stroke();

  const start = Math.ceil(S.view.lo / ms) * ms;
  /* خط‌های ریز = یک‌دهمِ پلّهٔ درشت؛ همان تقسیم‌بندیِ محورِ کتاب */
  const minor = ms / 10;
  if ((RULER.bot - RULER.top) / ((S.view.hi - S.view.lo) / minor) > 8) {
    ctx.strokeStyle = 'rgba(251, 243, 226, .5)'; ctx.lineWidth = 2;
    for (let v = Math.ceil(S.view.lo / minor) * minor; v <= S.view.hi + .001; v += minor) {
      const y = yOf(v);
      ctx.beginPath(); ctx.moveTo(RULER.x, y); ctx.lineTo(RULER.x + 9, y); ctx.stroke();
    }
  }
  ctx.strokeStyle = P.paper; ctx.lineWidth = 4;
  for (let v = start; v <= S.view.hi + .001; v += ms) {
    const y = yOf(v);
    ctx.beginPath(); ctx.moveTo(RULER.x - 4, y); ctx.lineTo(RULER.x + 22, y); ctx.stroke();
    numText(fa(Math.round(v)), RULER.x - 14, y, { size: 21, color: '#f4f8fb', align: 'right',
      alpha: S.viewT, stroke: 'rgba(20, 40, 60, .45)', strokeWidth: 5 });
  }
  ctx.restore();

  /* نشانگرِ ارتفاعِ فعلی روی خط‌کش */
  const y = yOf(S.alt);
  ctx.fillStyle = P.gold;
  ctx.beginPath();
  ctx.moveTo(RULER.x + 26, y);
  ctx.lineTo(RULER.x + 44, y - 9);
  ctx.lineTo(RULER.x + 44, y + 9);
  ctx.closePath(); ctx.fill();
}

/* ───────── ابرهای هدف ───────── */

function drawGates() {
  for (let i = 0; i < S.gates.length; i++) {
    const g = S.gates[i];
    if (g === 1000) continue;                 // جزیرهٔ هزار خودش کشیده شده
    const y = yOf(g);
    if (y < -140 || y > SCENE_H + 140) continue;
    const done = i < S.gi;
    const next = i === S.gi;
    ctx.save();
    ctx.globalAlpha = done ? .45 : 1;
    const bob = Math.sin(S.t * 1.1 + i) * 4;
    cloud(BX, y + 20 + bob, 158, g, done ? P.cloudDk : P.cloud, 1, true);
    /* تیرکِ پرچم با عددِ ابر */
    const px = BX + 84;
    ctx.strokeStyle = P.woodDk; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px, y + 30 + bob); ctx.lineTo(px, y - 46 + bob); ctx.stroke();
    const fw = 12 + Math.sin(S.t * 3 + i) * 3;
    ctx.fillStyle = done ? P.good : (next ? P.env1 : P.brassDk);
    ctx.beginPath();
    ctx.moveTo(px, y - 46 + bob);
    ctx.lineTo(px + 78, y - 38 + bob + fw * .2);
    ctx.lineTo(px + 62, y - 22 + bob);
    ctx.lineTo(px + 78, y - 6 + bob - fw * .2);
    ctx.lineTo(px, y - 14 + bob);
    ctx.closePath(); ctx.fill();
    numText(fa(g), px + 40, y - 30 + bob, { size: 22, color: '#fff6e2' });
    if (next) {
      ctx.strokeStyle = 'rgba(255, 226, 140, .75)';
      ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -S.t * 22;
      ctx.beginPath();
      ctx.moveTo(BX - 150, y + 14 + bob); ctx.lineTo(BX + 150, y + 14 + bob);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
}

/* ───────── بادکنک ───────── */

function drawBalloon() {
  const y = yOf(S.alt);
  const over = S.over ? easeOut(clamp(S.over.t / .8, 0, 1)) : 0;
  const sway = Math.sin(S.t * 1.2) * 4 + (S.burn > .1 ? Math.sin(S.t * 9) * 1.5 : 0);
  const x = BX + sway;
  const ey = y - 176;                                 // مرکزِ کیسه

  /* لرزشِ سرما وقتی از ابر رد شده */
  ctx.save();
  if (over > 0) ctx.translate(Math.sin(S.t * 26) * 5 * (1 - over * .3), 0);

  /* طناب‌ها */
  ctx.strokeStyle = P.rope; ctx.lineWidth = 2.4;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + s * 44, ey + 56);
    ctx.lineTo(x + s * 26, y - 52);
    ctx.stroke();
  }

  /* کیسهٔ بادکنک */
  const cols = [P.env1, P.env2, P.env3, P.env4];
  withShadow(24, 12, .28, () => {
    ctx.fillStyle = P.env4;
    ctx.beginPath();
    ctx.moveTo(x, ey - 92);
    ctx.bezierCurveTo(x + 96, ey - 84, x + 84, ey + 34, x, ey + 62);
    ctx.bezierCurveTo(x - 84, ey + 34, x - 96, ey - 84, x, ey - 92);
    ctx.closePath(); ctx.fill();
  }, '10, 24, 44');
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, ey - 92);
  ctx.bezierCurveTo(x + 96, ey - 84, x + 84, ey + 34, x, ey + 62);
  ctx.bezierCurveTo(x - 84, ey + 34, x - 96, ey - 84, x, ey - 92);
  ctx.closePath();
  ctx.clip();
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath();
    const x0 = x - 96 + i * 32;
    ctx.moveTo(x0, ey - 110);
    ctx.quadraticCurveTo(x0 + 16, ey, x0, ey + 80);
    ctx.lineTo(x0 + 32, ey + 80);
    ctx.quadraticCurveTo(x0 + 48, ey, x0 + 32, ey - 110);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,.24)';
  wobbleEllipse(x - 34, ey - 32, 22, 40, -.4, 5, 1.6); ctx.fill();
  ctx.fillStyle = 'rgba(20, 30, 50, .16)';
  wobbleEllipse(x + 46, ey + 6, 26, 52, .2, 7, 1.6); ctx.fill();
  ctx.restore();

  /* شعلهٔ مشعل */
  if (S.burn > .05) {
    const f = S.burn * (.8 + Math.sin(S.t * 18) * .2);
    const g = ctx.createRadialGradient(x, y - 62, 2, x, y - 62, 60 * f);
    g.addColorStop(0, 'rgba(255, 206, 120, .55)');
    g.addColorStop(1, 'rgba(255, 206, 120, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 60, y - 122, 120, 120);
    ctx.fillStyle = P.flame;
    ctx.beginPath();
    ctx.moveTo(x, y - 52 - 44 * f);
    ctx.quadraticCurveTo(x + 13, y - 62, x, y - 50);
    ctx.quadraticCurveTo(x - 13, y - 62, x, y - 52 - 44 * f);
    ctx.closePath(); ctx.fill();
  }

  /* سبد */
  withShadow(14, 7, .3, () => {
    ctx.fillStyle = P.wood;
    wobbleRect(x - 38, y - 52, 76, 52, 7, 11, 1.4); ctx.fill();
  }, '10, 24, 44');
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 2.4;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(x - 38 + i * 19, y - 52); ctx.lineTo(x - 38 + i * 19, y); ctx.stroke();
  }
  for (let i = 1; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(x - 38, y - 52 + i * 17); ctx.lineTo(x + 38, y - 52 + i * 17); ctx.stroke();
  }
  ctx.fillStyle = P.woodLit;
  wobbleRect(x - 42, y - 58, 84, 10, 4, 13, 1); ctx.fill();

  /* خلبانِ کوچک */
  const bob = Math.sin(S.t * 2) * 1.6;
  ctx.fillStyle = '#e8a33e';
  wobbleCircle(x - 4, y - 74 + bob, 15, 17, 1.2); ctx.fill();     // کاله/مو
  ctx.fillStyle = '#f3d3ac';
  wobbleCircle(x - 4, y - 70 + bob, 12, 19, 1.1); ctx.fill();
  ctx.fillStyle = P.ink;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x - 4 + s * 4.4, y - 71 + bob, 2.1, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath();
  if (over > 0) ctx.arc(x - 4, y - 64 + bob, 4, Math.PI * 1.15, Math.PI * 1.85);
  else ctx.arc(x - 4, y - 66 + bob, 5, .15 * Math.PI, .85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = P.env1;                                          // شالِ گردن
  wobbleRect(x - 14, y - 60 + bob, 20, 7, 3, 21, .7); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 58 + bob);
  ctx.quadraticCurveTo(x + 24 + Math.sin(S.t * 4) * 6, y - 52 + bob, x + 30, y - 40 + bob);
  ctx.lineTo(x + 22, y - 40 + bob);
  ctx.quadraticCurveTo(x + 16, y - 50 + bob, x + 4, y - 52 + bob);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  /* بلورهای سرما وقتی از ابر رد شده */
  if (over > 0) {
    ctx.save();
    ctx.globalAlpha = .7 * (1 - over * .4);
    ctx.strokeStyle = '#cfeaf6'; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + S.t;
      const r = 110 + Math.sin(S.t * 6 + i) * 10;
      const px = x + Math.cos(a) * r, py = ey + Math.sin(a) * r * .7;
      for (let k = 0; k < 3; k++) {
        const b = k / 3 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(px - Math.cos(b) * 7, py - Math.sin(b) * 7);
        ctx.lineTo(px + Math.cos(b) * 7, py + Math.sin(b) * 7);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

/* ───────── تابلوی سوخت ───────── */

function drawFuel() {
  const b = FUEL;
  withShadow(22, 10, .3, () => {
    ctx.fillStyle = P.wood;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 31, 2); ctx.fill();
  }, '10, 24, 44');
  ctx.fillStyle = P.woodLit;
  wobbleRect(b.x + 6, b.y + 6, b.w - 12, 12, 5, 33, 1); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  wobbleRect(b.x + 6, b.y + b.h - 16, b.w - 12, 10, 4, 35, 1); ctx.fill();
  text('انبارِ سوخت', b.x + b.w / 2, b.y + 46, { size: 26, family: 'Lalezar', color: '#fbf3e2' });
  text('روی هر دسته بزن تا توی مشعل بریزد', b.x + b.w / 2, b.y + 72,
    { size: 14, color: 'rgba(251, 243, 226, .68)' });

  for (let i = 0; i < 3; i++) {
    const r = fuelBox(i), u = UNITS[i];
    const n = S.stock[i];
    const hot = S.hover && S.hover.fuel === i && n > 0;
    ctx.save();
    ctx.globalAlpha = n > 0 ? 1 : .4;
    withShadow(12, hot ? 3 : 6, .3, () => {
      ctx.fillStyle = hot ? '#fffaf0' : P.paper;
      wobbleRect(r.x, r.y + (hot ? 2 : 0), r.w, r.h, 12, r.y, 1.6); ctx.fill();
    }, '10, 24, 44');
    ctx.fillStyle = u.col;
    wobbleRect(r.x, r.y + (hot ? 2 : 0), r.w, 9, 4, r.y + 2, .8); ctx.fill();

    /* دسته در مقیاسِ واقعی: صدتایی صد برابرِ یکی است و همین را نشان می‌دهد */
    unitArt(i, r.x + r.w - 132, r.y + r.h - 14 + (hot ? 2 : 0), 10);
    numText(fa(u.v), r.x + 74, r.y + 52 + (hot ? 2 : 0), { size: 40, color: P.ink });
    text(u.name, r.x + 74, r.y + 88 + (hot ? 2 : 0), { size: 17, color: P.inkSoft });

    /* شمارهٔ باقی‌مانده */
    ctx.fillStyle = n > 0 ? u.dk : '#96a3ad';
    wobbleCircle(r.x + 24, r.y + 24 + (hot ? 2 : 0), 19, r.y + 5, 1.2); ctx.fill();
    numText(fa(n), r.x + 24, r.y + 24 + (hot ? 2 : 0), { size: 21, color: '#fff' });
    ctx.restore();
  }
}

function drawAltCard() {
  const b = ALT_CARD;
  paper(b.x, b.y, b.w, b.h, P.paper, 51, 12, .3);
  ctx.fillStyle = P.brass;
  wobbleRect(b.x, b.y, b.w, 8, 4, 53, .8); ctx.fill();
  text('ارتفاع', b.x + b.w / 2, b.y + 28, { size: 16, color: P.inkSoft });
  numText(fa(Math.round(S.alt)), b.x + b.w / 2, b.y + 62, { size: 42, color: P.ink });
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.5, 0, 1);
    numText(f.txt, f.x, f.y, { size: f.size, color: f.col, alpha: k,
      stroke: 'rgba(20, 34, 52, .5)', strokeWidth: 5 });
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(13, 27, 48, .74)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(217, 168, 64, .45)';
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
  text(L().name, SCENE_W - 146, HUD_H / 2, { size: 18, family: 'Lalezar', color: '#e8f0f6', align: 'right' });
  numText(fa(S.score), 26, HUD_H / 2 - 1, { size: 26, color: P.gold, align: 'left' });
  text(`رکورد ${fa(S.best)}`, 108, HUD_H / 2, { size: 14, color: 'rgba(232, 240, 246, .6)', align: 'left' });

  /* ابرهای رد شده */
  const w = 15, gap = 9, n = S.gates.length;
  const x0 = SCENE_W / 2 - (n * w + (n - 1) * gap) / 2;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i < S.gi ? P.good : 'rgba(255,255,255,.18)';
    ctx.beginPath();
    ctx.ellipse(x0 + i * (w + gap) + w / 2, HUD_H / 2, w / 2, w / 2 * .8, 0, 0, TAU);
    ctx.fill();
  }
}

/* ───────── آموزش ───────── */

function drawTutorial() {
  const st = S.tut.step;
  let holes = [], msg = '', hand = null;

  if (st === 0) {
    holes = [{ x: RULER.x - 96, y: RULER.top - 24, w: 150, h: RULER.bot - RULER.top + 48 },
             { x: BX - 170, y: yOf(nextGate()) - 76, w: 340, h: 130 }];
    msg = 'خط‌کشِ کنار ارتفاع را نشان می‌دهد. باید دقیقاً روی ابرِ پرچم‌دار بایستی.';
  } else if (st === 1) {
    holes = [{ x: FUEL.x - 6, y: FUEL.y - 6, w: FUEL.w + 12, h: FUEL.h + 12 }];
    msg = 'روی دسته‌ها بزن تا توی مشعل بریزند و بادکنک بالا برود.';
    hand = { x: fuelBox(0).x + fuelBox(0).w / 2, y: fuelBox(0).y + fuelBox(0).h + 14 };
  } else {
    holes = [{ x: ALT_CARD.x - 6, y: ALT_CARD.y - 6, w: ALT_CARD.w + 12, h: ALT_CARD.h + 12 },
             { x: BX - 170, y: yOf(nextGate()) - 76, w: 340, h: 130 }];
    msg = 'زیادی بریزی از ابر رد می‌شوی و سرما می‌خوری. اوّل بشمار، بعد بریز.';
  }

  spot(holes, .56);
  const w = 490, h = 92, x = BX - w / 2, y = SCENE_H - 118;
  paper(x, y, w, h, P.paper, 41, 14, .42);
  ctx.fillStyle = P.brass;
  wobbleRect(x, y, 9, h, 4, 43, .8); ctx.fill();
  textWrap(msg, x + w / 2 + 6, y + h / 2 - 12, w - 54, { size: 18, color: P.ink, lineHeight: 27 });
  if (hand) pointHand(hand.x, hand.y);
}

/* ───────── پرده‌ها ───────── */

function balloonIcon(x, y) {
  ctx.save();
  ctx.translate(x, y - 4);
  ctx.scale(.42, .42);
  const cols = [P.env1, P.env2, P.env3, P.env4];
  ctx.fillStyle = P.env4;
  ctx.beginPath();
  ctx.moveTo(0, -92);
  ctx.bezierCurveTo(96, -84, 84, 34, 0, 62);
  ctx.bezierCurveTo(-84, 34, -96, -84, 0, -92);
  ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip();
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = cols[i % cols.length];
    const x0 = -96 + i * 32;
    ctx.beginPath();
    ctx.moveTo(x0, -110); ctx.quadraticCurveTo(x0 + 16, 0, x0, 80);
    ctx.lineTo(x0 + 32, 80); ctx.quadraticCurveTo(x0 + 48, 0, x0 + 32, -110);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = P.wood;
  wobbleRect(-30, 76, 60, 42, 6, 3, 1.2); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT,
    w: 740, h: 340, y: 172,
    title: 'بادکنکِ هزار',
    body: 'با دسته‌های یکی و ده‌تایی و صدتایی سوخت بریز و بالا برو.\nباید دقیقاً روی ابرها بنشینی تا به جزیرهٔ هزار برسی.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'پرواز!',
    paper: P.paper, band: P.brass, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#5e94d6', btnHotFill: '#6ea4e4',
    icon: balloonIcon,
  });
}

function drawWon() {
  const last = !L().endless && S.level + 1 >= LEVELS.length;
  const left = S.stock.reduce((a, b) => a + b, 0);
  overlay({
    t: S.phaseT,
    w: 720, h: 320, y: 186,
    title: L().endless ? 'یک پروازِ دیگر تمام شد' : 'رسیدی به هزار!',
    body: L().endless
      ? `امتیازت ${fa(S.score)} شد. ابرهای تازه منتظرند.`
      : `${fa(left)} دسته هم برایت ماند. امتیازت ${fa(S.score)} شد.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: L().endless ? 'پروازِ بعدی' : (last ? 'از اوّل' : 'مرحلهٔ بعدی'),
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#5e94d6', btnHotFill: '#6ea4e4',
    icon: (x, y) => blockArt(10, 10, x - 30, y + 28, 6, P.thou, P.thouDk, shade(P.thou, 34)),
  });
}

function drawLost() {
  overlay({
    t: S.phaseT,
    w: 720, h: 300, y: 196,
    title: 'باد خوابید',
    body: 'سه بار از ابر رد شدی. این بار قبل از ریختن، بشمار.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'دوباره',
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#cf5f4a', btnHotFill: '#dd6f59',
    icon: balloonIcon,
  });
}

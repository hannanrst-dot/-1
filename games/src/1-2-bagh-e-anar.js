/*!
title: باغِ انار — شمارش چندتا چندتا
bg: #17281c
*/

/* ═══════════════════════════════════════════════════════════════════════
   باغِ انار — ریاضی سوم، فصل ۱، درس ۲ (شمارش چندتا چندتا)
   ───────────────────────────────────────────────────────────────────────
   کتاب می‌گوید مربّع‌ها را ۳تا۳تا یا ۴تا۴تا دسته‌بندی کن و یک جمع بنویس.
   اینجا به‌جای مربّع، انار داریم و به‌جای دسته‌بندیِ روی کاغذ، جعبهٔ واقعی:
   بچه اندازهٔ جعبه را خودش انتخاب می‌کند، انارها را می‌چیند، و هر بار که
   یک جعبه پر می‌شود، یک گره روی «طنابِ شمارش» روشن می‌شود و عددش می‌آید.
   پس ۳،۶،۹،۱۲ چیزی نیست که بخوانَد؛ چیزی است که خودش می‌سازد.

   نکتهٔ دوم درس هم هست: با اندازه‌های مختلفِ جعبه به همان عدد می‌رسد.
   ۱۲ انار می‌شود ۴ جعبهٔ ۳تایی، یا ۳ جعبهٔ ۴تایی، یا ۶ جعبهٔ ۲تایی.

   تلفیق: انار و برگ و زنبور از علوم، و باغِ پاییزیِ ایرانی از مطالعات.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

/* ───────── پالتِ باغِ پاییزی ─────────
   سبزِ عمیقِ سایه در بالا، نورِ طلاییِ لابه‌لای برگ‌ها، و انارهای سرخ که
   روشن‌ترین و پررنگ‌ترین چیزِ تصویرند تا چشم مستقیم سراغشان برود.      */
const P = {
  skyTop:   '#8ec5c8',
  skyLow:   '#d8e6c4',
  leafDark: '#2f5233',
  leafMid:  '#41703f',
  leafLit:  '#5d8f45',
  leafSun:  '#8bb24f',
  trunk:    '#6b4a30',
  trunkDk:  '#4e3521',
  grass:    '#6d8f44',
  grassDk:  '#4f6f34',
  grassLit: '#93b25a',
  soil:     '#7b5a3a',
  pom:      '#c1364a',
  pomLit:   '#dd5560',
  pomDk:    '#8f2333',
  crown:    '#a35a3a',
  seed:     '#e8677a',
  crate:    '#c9a06a',
  crateDk:  '#a67f4d',
  crateLit: '#e0bc86',
  rope:     '#dcc79a',
  knot:     '#f0d089',
  paper:    '#f8f0dd',
  ink:      '#33301f',
  inkSoft:  '#7d7a55',
  gold:     '#efb43f',
  sky:      '#bcd9d6',
};

/* ───────── سفارش‌های باغبان ───────── */
const LEVELS = [
  { total: 6,  box: 3, free: false,
    name: 'صبحِ اوّلِ برداشت',
    story: 'باغبان شش انار چیده و می‌خواهد سه‌تا‌سه‌تا در جعبه بگذارد.\nانارها را بردار و بگذار توی جعبه‌ها.' },
  { total: 12, box: 4, free: false,
    name: 'جعبه‌های چهارتایی',
    story: 'این بار دوازده انار داریم و جعبه‌ها چهارتایی‌اند.\nببین چند جعبه می‌شود.' },
  { total: 15, box: 5, free: false,
    name: 'بازارِ پنج‌شنبه',
    story: 'پانزده انار برای بازار. جعبه‌ها پنج‌تایی‌اند.\nخوب به عددهای روی طناب نگاه کن.' },
  { total: 12, box: 0, free: true,
    name: 'هر جور که تو بخواهی',
    story: 'باز هم دوازده انار — ولی این بار اندازهٔ جعبه با خودت است.\nهر اندازه‌ای بگذاری باز هم دوازده تا می‌شود. امتحان کن!' },
];

/* ───────── وضعیت ───────── */

const S = {
  level: 0,
  phase: 'intro',
  box: 3,
  crates: [],        // هر جعبه: آرایه‌ای از انارها
  tree: [],          // انارهای روی درخت
  flying: [],
  t: 0, introT: 0, doneT: 0,
  hover: null,
  stars: 0,
  gardener: 'idle', gardenerT: 0,
  wind: 0,
  leaves: [],        // برگ‌های در حال افتادن
  bees: [],
  lastFull: -1, fullT: 0,
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];

function boxSize() { return L().free ? S.box : L().box; }
function crateCount() { return Math.ceil(L().total / boxSize()); }
function packed() { return S.crates.reduce((a, c) => a + c.length, 0); }

function loadLevel(i) {
  S.level = i;
  const lv = LEVELS[i];
  S.box = lv.free ? 3 : lv.box;
  rebuild();
  S.phase = 'intro'; S.introT = 0;
  S.leaves = Array.from({ length: 14 }, (_, k) => ({
    x: 60 + noise1(k * 3.1) * (SCENE_W - 120),
    y: -noise1(k * 7.7) * 500,
    v: 24 + noise1(k) * 30, a: noise1(k * 5) * TAU, s: .7 + noise1(k * 2) * .6,
  }));
  S.bees = Array.from({ length: 3 }, (_, k) => ({ a: k * 2.1, r: 60 + k * 26, cx: 300 + k * 300, cy: 300 + k * 40 }));
}

/** انارها را روی درخت می‌چیند و جعبه‌های خالی را می‌سازد. */
function rebuild() {
  const lv = L();
  S.crates = Array.from({ length: crateCount() }, () => []);
  S.tree = Array.from({ length: lv.total }, (_, k) => ({
    id: k,
    x: TREE.x + Math.cos(k * 2.4 + .6) * (66 + (k % 4) * 34) + noise1(k * 9) * 26 - 13,
    y: TREE.y + Math.sin(k * 1.7) * 58 + (k % 3) * 26 - 20,
    sway: noise1(k * 4.3) * TAU,
  }));
  S.flying.length = 0;
  S.lastFull = -1;
}

/* ───────── چیدمان ───────── */

const TREE = { x: 306, y: 244 };
const BENCH = { x: 430, y: 604, w: 648, h: 26 };
const CRATE_H = 96;
const CRATE_Y = BENCH.y - CRATE_H;
const ROPE_L = { x: 404, y: 396 }, ROPE_R = { x: 1058, y: 372 };
const BOX_L = { x: 108, y: 664, r: 24 };
const BOX_R = { x: 244, y: 664, r: 24 };
const BTN_GO = { x: 470, y: 556, w: 260, h: 76 };
const BTN_RESET = { x: 84, y: 700, w: 184, h: 44 };

function crateBox(i) {
  const n = crateCount();
  const gap = 12;
  const w = (BENCH.w - gap * (n + 1)) / n;
  return { x: BENCH.x + gap + i * (w + gap), y: CRATE_Y, w, h: CRATE_H };
}

/** جای هر انار داخل جعبه. تا سه‌تا یک ردیف، بیشتر از آن دو ردیف. */
function slotPos(ci, k) {
  const b = crateBox(ci);
  const size = boxSize();
  const per = size <= 3 ? size : Math.ceil(size / 2);
  const rows = size <= 3 ? 1 : 2;
  const row = Math.floor(k / per), col = k % per;
  const cw = (b.w - 14) / per;
  const rh = (b.h - 26) / rows;
  return {
    x: b.x + 7 + cw * (col + .5),
    y: b.y + 12 + rh * (row + .5),
  };
}

/** شعاعِ انار داخل جعبه، متناسب با جای موجود. */
function slotR(ci) {
  const b = crateBox(ci);
  const size = boxSize();
  const per = size <= 3 ? size : Math.ceil(size / 2);
  const rows = size <= 3 ? 1 : 2;
  return Math.min((b.w - 14) / per, (b.h - 26) / rows) * .40;
}

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
loadLevel(0);
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt;
  S.wind = Math.sin(S.t * .7) * .5 + Math.sin(S.t * 1.9) * .2;
  if (S.phase === 'intro') S.introT += dt;
  if (S.phase === 'done') S.doneT += dt;
  if (S.fullT > 0) S.fullT -= dt;
  if (S.gardenerT > 0) { S.gardenerT -= dt; if (S.gardenerT <= 0) S.gardener = 'idle'; }

  for (const f of S.flying) {
    f.t += dt * 2.2;
    if (f.t >= 1) { f.done = true; landPom(f); }
  }
  S.flying = S.flying.filter((f) => !f.done);

  for (const l of S.leaves) {
    l.y += l.v * dt;
    l.x += Math.sin(S.t * 1.2 + l.a) * 22 * dt;
    l.a += dt * 1.6;
    if (l.y > SCENE_H + 30) { l.y = -30; l.x = 60 + Math.random() * (SCENE_W - 120); }
  }
  for (const b of S.bees) b.a += dt * 1.5;

  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── چیدنِ انار ───────── */

function firstOpenCrate() {
  for (let i = 0; i < S.crates.length; i++) if (S.crates[i].length < boxSize()) return i;
  return -1;
}

function pickPom(pom) {
  const ci = firstOpenCrate();
  if (ci === -1) { toast.say('همهٔ جعبه‌ها پر شده‌اند', 'info'); return; }
  const k = S.crates[ci].length;
  S.crates[ci].push(pom.id);
  S.tree = S.tree.filter((p) => p.id !== pom.id);
  const dest = slotPos(ci, k);
  S.flying.push({ t: 0, id: pom.id, sx: pom.x, sy: pom.y, dx: dest.x, dy: dest.y, ci, k });
  sfx.pop();
}

function landPom(f) {
  bits.add(f.dx, f.dy + 10, 6, 'dot', [P.pomLit, P.leafSun], { speed: 70, lift: 24, size: 2.4, life: .45 });
  sfx.place();
  const crate = S.crates[f.ci];
  if (crate.length === boxSize()) {
    S.lastFull = f.ci;
    S.fullT = 1;
    sfx.good();
    const b = crateBox(f.ci);
    bits.confetti(b.x + b.w/2, b.y + 20, 18, [P.pomLit, P.gold, P.leafSun]);
    S.gardener = 'happy'; S.gardenerT = 1.6;
  }
  if (packed() === L().total) {
    setTimeout(() => {
      if (S.phase !== 'play') return;
      S.phase = 'done'; S.doneT = 0;
      S.stars++;
      sfx.win();
      bits.confetti(SCENE_W/2, 320, 70, [P.pomLit, P.gold, P.leafSun, P.crateLit]);
    }, 520);
  }
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase === 'intro' || S.phase === 'done') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (L().free) {
    if (inCircle(p, BOX_L, 6)) return BOX_L;
    if (inCircle(p, BOX_R, 6)) return BOX_R;
    if (inRect(p, BTN_RESET)) return BTN_RESET;
  }
  for (const pom of S.tree) if (Math.hypot(p.x - pom.x, p.y - pom.y) < 30) return pom;
  return null;
}

cv.addEventListener('pointermove', (e) => {
  S.hover = hitTest(toStage(e));
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});
cv.addEventListener('pointerleave', () => { S.hover = null; });
cv.addEventListener('pointerdown', (e) => {
  const h = hitTest(toStage(e));
  if (!h) return;
  if (S.phase === 'intro') { S.phase = 'play'; sfx.tap(); return; }
  if (S.phase === 'done') {
    if (S.level + 1 < LEVELS.length) loadLevel(S.level + 1);
    else { loadLevel(LEVELS.length - 1); S.phase = 'play'; }
    return;
  }
  if (h === BOX_L) return setBox(S.box - 1);
  if (h === BOX_R) return setBox(S.box + 1);
  if (h === BTN_RESET) { rebuild(); sfx.tap(); return; }
  pickPom(h);
});

function setBox(n) {
  const v = clamp(n, 2, 6);
  if (v === S.box) return;
  S.box = v;
  rebuild();
  sfx.tap();
  toast.say(`جعبه‌های ${fa(v)}تایی — ${fa(crateCount())} جعبه لازم است`, 'info');
}

/* ───────── ترسیم ───────── */

function draw() {
  beginScene('#17281c');
  drawSky();
  drawFarTrees();
  drawGround();
  drawTree();
  drawFallingLeaves();
  drawBench();
  drawCrates();
  drawRope();
  drawTreePoms();
  drawFlying();
  drawGardener(1116, 606);
  drawBees();
  if (L().free) drawBoxDial();
  bits.draw();
  toast.draw(20, { ink: P.ink });
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'done') drawDone();
  endScene(.10, 'rgba(24,44,26,.34)');
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, 470);
  g.addColorStop(0, P.skyTop);
  g.addColorStop(1, P.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, 470);
  // نورِ نرمِ خورشید از بالا-چپ
  const halo = ctx.createRadialGradient(210, 60, 20, 210, 60, 420);
  halo.addColorStop(0, 'rgba(255,248,214,.7)');
  halo.addColorStop(1, 'rgba(255,248,214,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, SW, 470);
}

/** ردیفِ درخت‌های دور، کم‌رنگ و مه‌آلود. */
function drawFarTrees() {
  for (let i = 0; i < 12; i++) {
    const x = -40 + i * 108 + noise1(i * 3.3) * 40;
    const y = 428 + noise1(i * 7.1) * 14;
    const r = 46 + noise1(i * 2.2) * 22;
    ctx.globalAlpha = .3;
    ctx.fillStyle = P.leafMid;
    wobbleCircle(x, y - r * .7, r, i, 3);
    ctx.fill();
    ctx.fillStyle = P.trunk;
    ctx.fillRect(x - 5, y - r * .4, 10, r * .8);
    ctx.globalAlpha = 1;
  }
}

function drawGround() {
  const g = ctx.createLinearGradient(0, 452, 0, SH);
  g.addColorStop(0, P.grassDk);
  g.addColorStop(.3, P.grass);
  g.addColorStop(1, '#3f5a2a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 452, SW, SH - 452);

  // نورِ لکه‌لکهٔ لابه‌لای برگ‌ها روی چمن
  for (let i = 0; i < 16; i++) {
    const x = noise1(i * 5.7) * SW, y = 470 + noise1(i * 2.9) * 200;
    ctx.globalAlpha = .13 + noise1(i) * .1;
    ctx.fillStyle = P.grassLit;
    wobbleEllipse(x, y, 40 + noise1(i * 3) * 60, 11, 0, i, 3);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // تُرّهٔ علف در پیش‌زمینه
  ctx.strokeStyle = P.grassDk;
  ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 40; i++) {
    const x = noise1(i * 8.1) * SW, y = 630 + noise1(i * 1.3) * 130;
    const h = 12 + noise1(i * 4) * 16;
    const bend = Math.sin(S.t * 1.4 + i) * 4 * S.wind;
    ctx.globalAlpha = .5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + bend, y - h * .6, x + bend * 2 + 4, y - h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/* ───────── درختِ انار ───────── */

function drawTree() {
  const sway = S.wind * .012;
  ctx.save();
  ctx.translate(TREE.x, 520);
  ctx.rotate(sway * .3);
  // تنه
  withShadow(20, 10, .28, () => {
    ctx.fillStyle = P.trunk;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.quadraticCurveTo(-20, -110, -26, -210);
    ctx.lineTo(24, -212);
    ctx.quadraticCurveTo(20, -110, 30, 0);
    ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = P.trunkDk;                 // بافتِ پوستِ تنه
  ctx.globalAlpha = .5;
  for (let i = 0; i < 6; i++) {
    const y = -20 - i * 32;
    ctx.beginPath();
    ctx.moveTo(-16 + noise1(i) * 22, y);
    ctx.quadraticCurveTo(-10 + noise1(i * 3) * 20, y - 18, -14 + noise1(i * 5) * 24, y - 34);
    ctx.lineWidth = 3; ctx.strokeStyle = P.trunkDk; ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // شاخه‌های اصلی
  ctx.strokeStyle = P.trunk;
  ctx.lineWidth = 15; ctx.lineCap = 'round';
  for (const [dx, dy] of [[-96, -282], [92, -276], [-24, -320]]) {
    ctx.beginPath();
    ctx.moveTo(0, -206);
    ctx.quadraticCurveTo(dx * .4, -260, dx, dy);
    ctx.stroke();
  }
  ctx.restore();

  // تاجِ برگ: به‌جای چند تودهٔ بزرگ، خوشه‌های کوچکِ زیاد. لبهٔ تاج هم
  // برگ‌های تکیِ بیرون‌زده دارد تا مثل یک لکهٔ سبز به‌نظر نرسد.
  const clusters = [];
  for (let i = 0; i < 30; i++) {
    const a = noise1(i * 3.7) * TAU;
    const rad = 26 + noise1(i * 5.1) * 86;
    clusters.push({
      x: Math.cos(a) * rad * 1.6,
      y: 208 + Math.sin(a) * rad * 1.05,
      r: 46 + noise1(i * 7.3) * 34,
      tone: noise1(i * 2.9),
      seed: i,
    });
  }
  clusters.sort((a, b) => a.tone - b.tone);      // تیره‌ها اوّل، روشن‌ها رو
  for (const c of clusters) {
    const sw = Math.sin(S.t * .9 + c.seed) * 3 * (1 + S.wind);
    const col = c.tone > .78 ? P.leafSun : c.tone > .52 ? P.leafLit
              : c.tone > .26 ? P.leafMid : P.leafDark;
    ctx.fillStyle = col;
    wobbleCircle(TREE.x + c.x + sw, c.y, c.r, c.seed, 6, 40);
    ctx.fill();
  }
  // برگ‌های تکِ لبه
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * TAU + noise1(i) * .2;
    const rad = 108 + noise1(i * 4.4) * 26;
    const x = TREE.x + Math.cos(a) * rad * 1.62 + Math.sin(S.t + i) * 3;
    const y = 208 + Math.sin(a) * rad * 1.06;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + 1.2);
    ctx.fillStyle = noise1(i * 6) > .5 ? P.leafLit : P.leafMid;
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.quadraticCurveTo(0, -8, 15, 0);
    ctx.quadraticCurveTo(0, 8, -13, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // نردبانِ چوبی که به درخت تکیه داده
  ctx.save();
  ctx.strokeStyle = P.crateDk;
  ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(TREE.x + 178, 560); ctx.lineTo(TREE.x + 104, 288);
  ctx.moveTo(TREE.x + 212, 556); ctx.lineTo(TREE.x + 138, 284);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = P.crate;
  for (let i = 0; i < 9; i++) {
    const t = i / 9;
    ctx.beginPath();
    ctx.moveTo(lerp(TREE.x + 178, TREE.x + 104, t), lerp(560, 288, t));
    ctx.lineTo(lerp(TREE.x + 212, TREE.x + 138, t), lerp(556, 284, t));
    ctx.stroke();
  }
  ctx.restore();
}

/** انارهای روی درخت — بزرگ‌ترین و پررنگ‌ترین چیزِ صحنه. */
function drawTreePoms() {
  for (const pom of S.tree) {
    const sw = Math.sin(S.t * 1.5 + pom.sway) * 3 * (1 + S.wind);
    const hot = S.hover === pom && S.phase === 'play';
    drawPom(pom.x + sw, pom.y, 25, hot);
    if (hot) {
      ctx.strokeStyle = 'rgba(255,246,214,.9)';
      ctx.lineWidth = 3;
      wobbleCircle(pom.x + sw, pom.y, 31, pom.id, 1.6);
      ctx.stroke();
    }
  }
}

/** انار: بدنِ گِرد و کمی پهن، با تاجِ پنج‌پرِ بالا و برقِ نور از بالا-چپ.
 *  تاج همان چیزی است که انار را از سیب جدا می‌کند، پس بزرگ و واضح است. */
function drawPom(x, y, r, hot) {
  // تاج، پشتِ بدنه تا از دو طرف بیرون بزند
  ctx.save();
  ctx.translate(x, y - r * .78);
  ctx.fillStyle = P.crown;
  for (let k = -2; k <= 2; k++) {
    ctx.save();
    ctx.rotate(k * .38);
    ctx.beginPath();
    ctx.moveTo(-r * .10, r * .26);
    ctx.quadraticCurveTo(-r * .05, -r * .05, 0, -r * .30);
    ctx.quadraticCurveTo(r * .05, -r * .05, r * .10, r * .26);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#a56a33';
  wobbleCircle(0, r * .18, r * .2, x, r * .04);
  ctx.fill();
  ctx.restore();

  withShadow(9, 5, .3, () => {
    ctx.fillStyle = hot ? P.pomLit : P.pom;
    wobbleEllipse(x, y, r, r * .94, 0, x + y, r * .05);
    ctx.fill();
  }, '60, 20, 24');

  ctx.save();
  wobbleEllipse(x, y, r, r * .94, 0, x + y, r * .05);
  ctx.clip();
  ctx.fillStyle = P.pomDk;                       // سایهٔ پایین-راست
  ctx.globalAlpha = .42;
  wobbleCircle(x + r * .5, y + r * .42, r * .86, x, r * .05);
  ctx.fill();
  ctx.globalAlpha = .2;                          // انحنای پهلوها
  ctx.strokeStyle = P.pomDk;
  ctx.lineWidth = r * .09;
  for (const d of [-.5, .5]) {
    ctx.beginPath();
    ctx.ellipse(x + d * r * .5, y, r * .3, r * .9, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.fillStyle = 'rgba(255,228,216,.6)';        // برقِ نور
  wobbleEllipse(x - r * .36, y - r * .38, r * .24, r * .16, -.55, x, r * .04);
  ctx.fill();
}

function drawFlying() {
  for (const f of S.flying) {
    const t = easeInOut(clamp(f.t, 0, 1));
    const x = lerp(f.sx, f.dx, t);
    const y = lerp(f.sy, f.dy, t) - Math.sin(Math.PI * t) * 120;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 2.4);
    drawPom(0, 0, 25 - t * 3, false);
    ctx.restore();
  }
}

function drawFallingLeaves() {
  for (const l of S.leaves) {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.a);
    ctx.scale(l.s, l.s * (.5 + Math.abs(Math.cos(l.a)) * .5));
    ctx.fillStyle = noise1(l.x) > .5 ? P.leafSun : P.gold;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.quadraticCurveTo(0, -7, 9, 0);
    ctx.quadraticCurveTo(0, 7, -9, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

/** نیمکتِ چوبیِ برداشت — جعبه‌ها رویش می‌نشینند تا روی چمن شناور نباشند. */
function drawBench() {
  const b = BENCH;
  ctx.globalAlpha = .22;                         // سایهٔ روی چمن
  ctx.fillStyle = '#2f4a22';
  wobbleEllipse(b.x + b.w/2 + 14, b.y + 112, b.w * .52, 20, 0, 3, 4);
  ctx.fill();
  ctx.globalAlpha = 1;

  for (const px of [b.x + 44, b.x + b.w - 44]) { // پایه‌ها
    ctx.fillStyle = P.crateDk;
    wobbleRect(px - 13, b.y + 18, 26, 96, 4, px, 1.4);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    wobbleRect(px + 4, b.y + 18, 9, 96, 3, px + 1, 1);
    ctx.fill();
  }
  withShadow(14, 7, .3, () => {                  // صفحهٔ نیمکت
    ctx.fillStyle = P.crate;
    wobbleRect(b.x - 16, b.y, b.w + 32, b.h, 5, 31, 1.6);
    ctx.fill();
  }, '46, 70, 34');
  ctx.fillStyle = 'rgba(255,240,204,.3)';
  wobbleRect(b.x - 12, b.y + 2, b.w + 24, 6, 3, 33, 1);
  ctx.fill();
  ctx.strokeStyle = P.crateDk;                   // درزِ تخته‌ها
  ctx.lineWidth = 2;
  ctx.globalAlpha = .5;
  for (let x = b.x + 60; x < b.x + b.w; x += 132) {
    ctx.beginPath(); ctx.moveTo(x, b.y + 3); ctx.lineTo(x - 2, b.y + b.h - 3); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/* ───────── جعبه‌ها ───────── */

function drawCrates() {
  const n = crateCount();
  for (let i = 0; i < n; i++) {
    const b = crateBox(i);
    const filled = S.crates[i].length === boxSize();
    const justFull = S.lastFull === i && S.fullT > 0;

    // بدنهٔ جعبه — تخته‌های چوبیِ افقی
    withShadow(14, 7, .3, () => {
      ctx.fillStyle = filled ? P.crateLit : P.crate;
      wobbleRect(b.x, b.y, b.w, b.h, 6, i * 11, 1.6);
      ctx.fill();
    }, '46, 70, 34');
    ctx.strokeStyle = P.crateDk;
    ctx.lineWidth = 2;
    for (let k = 1; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(b.x + 4, b.y + k * b.h / 3);
      ctx.lineTo(b.x + b.w - 4, b.y + k * b.h / 3);
      ctx.stroke();
    }
    ctx.fillStyle = P.crateDk;                 // پایه‌های کناری
    wobbleRect(b.x, b.y, 9, b.h, 3, i * 3, 1);
    ctx.fill();
    wobbleRect(b.x + b.w - 9, b.y, 9, b.h, 3, i * 5, 1);
    ctx.fill();

    // جای خالیِ انارها
    for (let k = 0; k < boxSize(); k++) {
      const sp = slotPos(i, k);
      if (k < S.crates[i].length) continue;
      ctx.save();
      ctx.globalAlpha = .3;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = P.crateDk;
      ctx.lineWidth = 2;
      wobbleCircle(sp.x, sp.y, slotR(i), i * 7 + k, 1);
      ctx.stroke();
      ctx.restore();
    }
    // انارهای داخلِ جعبه
    for (let k = 0; k < S.crates[i].length; k++) {
      const sp = slotPos(i, k);
      const pop = justFull ? 1 + Math.sin(S.fullT * 12) * .05 : 1;
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.scale(pop, pop);
      drawPom(0, 0, slotR(i), false);
      ctx.restore();
    }
  }
}

/** طنابِ شمارش: بالای جعبه‌ها کشیده شده و از هر جعبه یک پلاکِ چوبی
 *  آویزان است. پلاک تا وقتی جعبه پر نشده خالی است؛ پرشدنِ جعبه عددِ
 *  روی‌هم را می‌آورد. یعنی ۳،۶،۹ را بچه می‌سازد، نه اینکه بخوانَد.     */
function drawRope() {
  const n = crateCount();
  const sag = 26;
  const ropeAt = (t) => ({
    x: lerp(ROPE_L.x, ROPE_R.x, t),
    y: lerp(ROPE_L.y, ROPE_R.y, t) + Math.sin(Math.PI * t) * sag,
  });

  // تیرکِ سمت راست
  ctx.fillStyle = P.trunkDk;
  wobbleRect(ROPE_R.x - 7, ROPE_R.y, 14, 236, 4, 5, 1.4);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  wobbleRect(ROPE_R.x - 7, ROPE_R.y, 5, 236, 3, 7, 1);
  ctx.fill();

  ctx.strokeStyle = P.rope;
  ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ROPE_L.x, ROPE_L.y);
  ctx.quadraticCurveTo((ROPE_L.x + ROPE_R.x)/2, (ROPE_L.y + ROPE_R.y)/2 + sag * 2, ROPE_R.x, ROPE_R.y);
  ctx.stroke();

  for (let i = 0; i < n; i++) {
    const cb = crateBox(i);
    const t = clamp((cb.x + cb.w/2 - ROPE_L.x) / (ROPE_R.x - ROPE_L.x), 0, 1);
    const at = ropeAt(t);
    const on = S.crates[i].length === boxSize();
    const pop = S.lastFull === i && S.fullT > 0 ? 1 + Math.sin(S.fullT * 14) * .16 : 1;
    const swing = Math.sin(S.t * 1.6 + i) * .04 * (1 + S.wind);

    ctx.save();
    ctx.translate(at.x, at.y);
    ctx.rotate(swing);
    ctx.strokeStyle = P.rope;                    // بندِ آویز
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.stroke();
    ctx.scale(pop, pop);
    withShadow(on ? 12 : 5, 4, on ? .32 : .18, () => {
      ctx.fillStyle = on ? P.knot : 'rgba(224,204,160,.5)';
      wobbleRect(-30, 26, 60, 46, 7, i * 9, 1.4);
      ctx.fill();
    }, '80, 60, 20');
    if (on) {
      text(fa(boxSize() * (i + 1)), 0, 51, { size: 26, color: P.ink, family: 'Lalezar' });
    } else {
      text('؟', 0, 51, { size: 22, color: 'rgba(51,48,31,.35)', family: 'Lalezar' });
    }
    ctx.restore();
  }

  // جملهٔ جمع — همان چیزی که کتاب می‌خواهد بنویسند، اینجا خودش نوشته می‌شود
  const full = S.crates.filter((c) => c.length === boxSize()).length;
  if (full > 0) {
    const parts = Array.from({ length: full }, () => fa(boxSize())).join(' + ');
    const sum = `${parts}  =  ${fa(boxSize() * full)}`;
    ctx.font = '400 27px "Lalezar", Tahoma, sans-serif';
    const sw = ctx.measureText(sum).width + 64;
    const sy = BENCH.y + 62;
    paper(BENCH.x + BENCH.w/2 - sw/2, sy, sw, 50, P.paper, 91, 8, .3);
    text(sum, BENCH.x + BENCH.w/2, sy + 26, { size: 27, color: P.pom, family: 'Lalezar' });
  }
}

/* ───────── دستگیرهٔ اندازهٔ جعبه (حالتِ آزاد) ───────── */

function drawBoxDial() {
  const x = 58, y = 608, w = 236, h = 122;
  paper(x, y, w, h, P.paper, 71, 10, .3);
  text('جعبه‌ها چندتایی باشند؟', x + w/2, y + 20, { size: 15, color: P.inkSoft });
  roundButton(BOX_L, '−', { fill: P.crateDk, hot: S.hover === BOX_L, size: 26 });
  text(fa(S.box), x + w/2, y + 56, { size: 40, color: P.pom, family: 'Lalezar' });
  roundButton(BOX_R, '+', { fill: P.crate, hot: S.hover === BOX_R, size: 26 });
  text(`${fa(crateCount())} جعبه لازم است`, x + w/2, y + 92, { size: 14, color: P.inkSoft });
  button(BTN_RESET, 'از نو بچین', { hot: S.hover === BTN_RESET, fill: P.leafMid, hotFill: P.leafLit, size: 19 });
}

/* ───────── باغبان ───────── */

function drawGardener(x, footY) {
  const happy = S.gardener === 'happy';
  const bob = Math.sin(S.t * 1.4) * 3 + (happy ? Math.abs(Math.sin(S.t * 8)) * -7 : 0);
  ctx.save();
  ctx.translate(x, footY + bob);
  ctx.scale(.94, .94);

  ctx.globalAlpha = .22;                        // سایه
  ctx.fillStyle = '#2f4a22';
  wobbleEllipse(8, 4, 52, 10, 0, 3, 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = P.trunkDk;                    // چکمه
  wobbleRect(-32, -20, 28, 22, 5, 21, 1.2); ctx.fill();
  wobbleRect(6, -20, 28, 22, 5, 23, 1.2); ctx.fill();

  withShadow(16, 8, .26, () => {                // پیراهن
    ctx.fillStyle = '#c9744a';
    ctx.beginPath();
    ctx.moveTo(-44, -14);
    ctx.quadraticCurveTo(-52, -108, -30, -136);
    ctx.lineTo(30, -136);
    ctx.quadraticCurveTo(52, -108, 44, -14);
    ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = '#a85c39';
  ctx.beginPath();
  ctx.moveTo(14, -14);
  ctx.quadraticCurveTo(36, -100, 26, -134);
  ctx.lineTo(30, -136);
  ctx.quadraticCurveTo(52, -108, 44, -14);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = '#d8a878';                  // دست‌ها
  ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-36, -108); ctx.lineTo(-54, -70 + (happy ? -40 : 0));
  ctx.moveTo(36, -108);  ctx.lineTo(54, -70 + (happy ? -40 : 0));
  ctx.stroke();

  withShadow(12, 6, .22, () => {                // سر
    ctx.fillStyle = '#d8a878';
    wobbleCircle(0, -166, 36, 9, 1.8);
    ctx.fill();
  });
  ctx.fillStyle = '#4a3524';                    // مو
  ctx.beginPath();
  ctx.moveTo(-36, -172);
  ctx.quadraticCurveTo(-38, -212, 0, -206);
  ctx.quadraticCurveTo(38, -212, 36, -172);
  ctx.quadraticCurveTo(18, -190, 0, -188);
  ctx.quadraticCurveTo(-18, -190, -36, -172);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.ink;
  for (const s of [-1, 1]) {
    if (happy) {
      ctx.strokeStyle = P.ink; ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.arc(s * 13, -172, 7.5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else { ctx.beginPath(); ctx.ellipse(s * 13, -170, 4.2, 5, 0, 0, TAU); ctx.fill(); }
  }
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
  ctx.beginPath();
  if (happy) ctx.arc(0, -152, 12, .15 * Math.PI, .85 * Math.PI);
  else ctx.arc(0, -154, 9, .2 * Math.PI, .8 * Math.PI);
  ctx.stroke();
  ctx.globalAlpha = .3;
  ctx.fillStyle = P.pom;
  wobbleCircle(-24, -158, 7, 1, .6); ctx.fill();
  wobbleCircle(24, -158, 7, 2, .6); ctx.fill();
  ctx.globalAlpha = 1;

  // سبدِ حصیریِ دستش
  ctx.save();
  ctx.translate(58, -58 + (happy ? -40 : 0));
  ctx.fillStyle = '#c9a06a';
  ctx.beginPath();
  ctx.moveTo(-22, 0); ctx.lineTo(22, 0);
  ctx.quadraticCurveTo(18, 26, 0, 26);
  ctx.quadraticCurveTo(-18, 26, -22, 0);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#a67f4d'; ctx.lineWidth = 2;
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    ctx.moveTo(k * 11, 2); ctx.lineTo(k * 8, 24);
    ctx.stroke();
  }
  ctx.strokeStyle = '#a67f4d'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 22, Math.PI, TAU); ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawBees() {
  for (const b of S.bees) {
    const x = b.cx + Math.cos(b.a) * b.r;
    const y = b.cy + Math.sin(b.a * 1.7) * 24;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = P.gold;
    wobbleEllipse(0, 0, 6, 4, 0, b.r, .5);
    ctx.fill();
    ctx.fillStyle = '#3a3018';
    ctx.fillRect(-1, -3.4, 2, 6.8);
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    const f = Math.sin(S.t * 30 + b.a) * 3;
    wobbleEllipse(-1, -5 - f * .3, 5, 2.4, -.4, b.r + 2, .4);
    ctx.fill();
    ctx.restore();
  }
}

/* ───────── پرده‌ها ───────── */

function drawIntro() {
  overlay({
    t: S.introT, title: L().name, body: L().story,
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.pom, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.leafMid, btnHotFill: P.leafLit,
    icon: (cx, cy) => {
      for (let k = 0; k < 3; k++) drawPom(cx - 40 + k * 40, cy, 19, false);
    },
  });
}

function drawDone() {
  const n = crateCount(), b = boxSize();
  const parts = Array.from({ length: n }, () => fa(b)).join(' + ');
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.doneT,
    title: `${fa(L().total)} انار، ${fa(n)} جعبه`,
    body: `${parts}  =  ${fa(L().total)}\n` +
      (L().free
        ? 'هر اندازه‌ای برای جعبه بگذاری، تهش باز هم همان تعداد انار است.'
        : `یعنی ${fa(b)}تا${fa(b)}تا شمردی و ${fa(n)} بار شمردن کافی بود.`),
    btn: BTN_GO, btnLabel: last ? 'یک بار دیگر' : 'باغِ بعدی', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.leafMid, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.leafMid, btnHotFill: P.leafLit,
    icon: (cx, cy) => star(cx, cy, 28, P.gold),
  });
}

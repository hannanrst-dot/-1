/*!
title: کارخانهٔ کلوچه — ارزش مکانی
bg: #1b1a22
*/

/* ═══════════════════════════════════════════════════════════════════════
   کارخانهٔ کلوچه — ریاضی سوم، فصل ۲، درس ۳ (ارزش مکانی)
   ───────────────────────────────────────────────────────────────────────
   نسخهٔ اوّل ایراد داشت: بچه بازی می‌کرد ولی نمی‌فهمید «۱۲۰۴» چه ربطی به
   آن چهار ماشین دارد. مفهوم باید از داخلِ بازی کشف شود، نه از توضیح.

   کاری که این نسخه می‌کند:

   • یک شمارندهٔ بزرگ بالای خطِ تولید هست و هر رقمش دقیقاً بالای ماشینِ
     خودش نشسته، با خطی که به آن وصل است. بچه یک کلوچه می‌اندازد و
     می‌بیند فقط راست‌ترین رقم عوض شد. یک پاکت می‌اندازد و رقمِ بعدی
     تکان می‌خورد. هیچ‌کس این را به او نگفته؛ خودش پیدایش کرده.

   • لحظهٔ «ده‌تا یکی می‌شود» دیدنی است: وقتی دهمین کلوچه می‌افتد، رقمِ
     یکان از ۹ به ۰ می‌غلتد و هم‌زمان رقمِ دهگان بالا می‌رود، درست وقتی
     که ده کلوچه به هم می‌چسبند و می‌شوند یک پاکت.

   • سفارش‌ها پلّه‌پله چیده شده‌اند و هر کدام یک چیز یاد می‌دهند:
     ۱) فقط کلوچه می‌آید ⇒ مجبور است ده‌تا جمع کند و بسته‌شدن را ببیند.
     ۲) کلوچه و پاکت ⇒ می‌فهمد پاکت راهِ کوتاه است.
     ۳) فقط پاکت می‌آید ولی سفارش کوچک است ⇒ مجبور است پاکت را باز کند.
     ۴ و ۵) جعبه و کارتن.

   سفارش همچنان فقط یک عدد است و هیچ‌جا نوشته نمی‌شود یعنی چند کارتن و
   چند جعبه.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  wallTop:  '#4b3d31',
  wallLow:  '#75604c',
  steel:    '#9c8f80',
  steelLit: '#bcae9c',
  steelDk:  '#6a5e50',
  belt:     '#4d4136',
  beltLit:  '#695849',
  dough:    '#e8b871',
  doughDk:  '#c8934c',
  choc:     '#7a4a28',
  bag:      '#c8a06a',
  bagDk:    '#a37d47',
  boxc:     '#7f9ac2',
  boxDk:    '#5c7aa3',
  carton:   '#b0764f',
  cartonDk: '#8a5836',
  glass:    'rgba(190, 225, 235, .16)',
  paper:    '#f8f0dd',
  ink:      '#2b2620',
  inkSoft:  '#7d7360',
  good:     '#6f9a52',
  bad:      '#c2503f',
  gold:     '#e8b448',
  brass:    '#c8974e',
  brassDk:  '#9a7030',
  lampGlow: 'rgba(255, 206, 130, .20)',
  dial:     '#241d17',
};

/* از راست به چپ: کلوچه، پاکت، جعبه، کارتن — همان ترتیبِ ارزش مکانی. */
const TIERS = [
  { name: 'کلوچه', place: 'یکان',    unit: 1,    col: P.dough,  dk: P.doughDk },
  { name: 'پاکت',  place: 'دهگان',   unit: 10,   col: P.bag,    dk: P.bagDk },
  { name: 'جعبه',  place: 'صدگان',   unit: 100,  col: P.boxc,   dk: P.boxDk },
  { name: 'کارتن', place: 'هزارگان', unit: 1000, col: P.carton, dk: P.cartonDk },
];

/* هر سفارش یک چیز یاد می‌دهد. tiers = چه چیزهایی روی نوار می‌آید. */
const ORDERS = [
  { n: 13,   tiers: [0],          time: 0,   name: 'اوّلین سفارش',
    hint: 'امروز فقط کلوچهٔ تکی می‌آید. چشمت به شمارندهٔ بالا باشد.' },
  { n: 24,   tiers: [0, 1],       time: 100, name: 'سفارشِ مغازه',
    hint: 'حالا پاکتِ آماده هم می‌آید. کدام راه کوتاه‌تر است؟' },
  { n: 7,    tiers: [1],          time: 90,  name: 'سفارشِ کوچک',
    hint: 'فقط پاکت می‌آید و سفارش کوچک است. چه می‌کنی؟' },
  { n: 106,  tiers: [0, 1, 2],    time: 105, name: 'سفارشِ مدرسه',
    hint: 'جعبه هم اضافه شد.' },
  { n: 1204, tiers: [0, 1, 2, 3], time: 120, name: 'سفارشِ شهرِ کناری',
    hint: 'کارتن هم آمد. بزرگ‌ترین سفارشِ امسال.' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  order: 0,
  have: [0, 0, 0, 0],
  belt: [],
  flying: [],
  bundling: null,
  opening: null,
  timeLeft: 0,
  hearts: 3,
  score: 0, combo: 0, best: 0,
  t: 0, phaseT: 0,
  spawnT: 0,
  hover: null,
  floats: [],
  shake: 0,
  scrap: 0,
  noBundle: [false, false, false, false],   // بعد از «باز کن» نباید فوراً دوباره بسته شود
  dial: [0, 0, 0, 0],       // رقم‌های نشان‌داده‌شده
  roll: [0, 0, 0, 0],       // پیشرفتِ غلتیدنِ هر رقم
  prevDial: [0, 0, 0, 0],
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const O = () => ORDERS[S.order];
const total = () => S.have.reduce((a, n, i) => a + n * TIERS[i].unit, 0);
const digitOf = (v, i) => Math.floor(v / TIERS[i].unit) % 10;

function loadBest() { try { return +localStorage.getItem('kolouche-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('kolouche-best', String(v)); } catch { /* حالت خصوصی */ } }

function startOrder(i) {
  S.order = i;
  S.have = [0, 0, 0, 0];
  S.belt = []; S.flying = [];
  S.bundling = null; S.opening = null;
  S.timeLeft = ORDERS[i].time;
  S.spawnT = 1.0;
  S.scrap = 0;
  S.noBundle = [false, false, false, false];
  S.phase = 'play'; S.phaseT = 0;
  S.dial = [0, 0, 0, 0]; S.prevDial = [0, 0, 0, 0]; S.roll = [0, 0, 0, 0];
  S.tut.on = i === 0; S.tut.step = 0; S.tut.t = 0;
}

/* ───────── چیدمان ───────── */

const HUD_H = 54;
const ORDER_CARD = { x: 30, y: 78, w: 244, h: 138 };
const DIAL_Y = 92, DIAL_H = 96;
const MACH_Y = 240, MACH_H = 186;
const BELT = { x: 148, y: 574, w: 1012, h: 86 };
const BTN_SEND = { x: 476, y: 478, w: 248, h: 58 };
const BTN_GO = { x: 470, y: 556, w: 260, h: 76 };

function station(i) {
  const w = 202, gap = 16;
  const x = SCENE_W - 44 - (i + 1) * w - i * gap;
  return { x, y: MACH_Y, w, h: MACH_H };
}
function dialBox(i) {
  const st = station(i);
  return { x: st.x + st.w / 2 - 44, y: DIAL_Y, w: 88, h: DIAL_H };
}
function openBtn(i) {
  const st = station(i);
  return { x: st.x + st.w / 2 - 62, y: st.y + st.h + 10, w: 124, h: 36 };
}

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;

  if (S.phase === 'play') {
    if (O().time > 0 && (!S.tut.on || S.tut.step >= 2)) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) failOrder('وقت تمام شد');
    }
    S.spawnT -= dt;
    if (S.spawnT <= 0) { spawnItem(); S.spawnT = 1.4 + Math.random() * 1.0; }
    const speed = 50 + S.order * 5;
    for (const it of S.belt) it.x -= speed * dt;
    const fell = S.belt.filter((it) => it.x < BELT.x - 26);
    for (const it of fell) {
      S.scrap++;
      bits.add(BELT.x - 60, BELT.y + 40, 6, 'dot', [TIERS[it.tier].col], { speed: 90, lift: 40, size: 3, life: .6 });
    }
    if (fell.length) S.belt = S.belt.filter((it) => it.x >= BELT.x - 26);
    if (S.tut.on) tutStep(dt);
  }

  for (const f of S.flying) {
    f.t += dt * 2.1;
    if (f.t >= 1) { f.done = true; S.have[f.tier]++; checkBundle(); }
  }
  S.flying = S.flying.filter((f) => !f.done);

  stepBundle(dt);
  stepOpen(dt);
  stepDial(dt);

  for (const f of S.floats) { f.t += dt; f.y -= 42 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.4);
  bits.step(dt);
  toast.step(dt);
  draw();
}

function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 24 }); }

/* ───────── شمارنده ─────────
   رقم‌ها از روی مجموعِ فعلی ساخته می‌شوند و وقتی عوض می‌شوند می‌غلتند.
   همین غلتیدن است که «ده‌تا یکی می‌شود» را دیدنی می‌کند.              */

function stepDial(dt) {
  const v = total();
  for (let i = 0; i < 4; i++) {
    const d = digitOf(v, i);
    if (d !== S.dial[i]) {
      S.prevDial[i] = S.dial[i];
      S.dial[i] = d;
      S.roll[i] = 1;
      sfx.tick();
    }
    if (S.roll[i] > 0) S.roll[i] = Math.max(0, S.roll[i] - dt * 4.2);
  }
}

/* ───────── تولید و بسته‌بندی ───────── */

function spawnItem() {
  const allowed = O().tiers;
  const need = Math.max(0, O().n - total());
  const w = allowed.map((i) => {
    let k = [4, 3, 2, 1][i];
    if (digitOf(need, i) > 0) k += 5;
    if (TIERS[i].unit > need) k = .2;
    return k;
  });
  const sum = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum, tier = allowed[0];
  for (let k = 0; k < allowed.length; k++) { r -= w[k]; if (r <= 0) { tier = allowed[k]; break; } }
  S.belt.push({ tier, x: BELT.x + BELT.w + 40, id: Math.random() });
}

function checkBundle() {
  for (let i = 0; i < 4; i++) if (S.have[i] < 10) S.noBundle[i] = false;
  if (S.bundling || S.opening) return;
  for (let i = 0; i < 3; i++) {
    /* اگر بچه خودش یک بسته را باز کرده، همان ده‌تا نباید دوباره بسته شود؛
       وگرنه هیچ‌وقت نمی‌تواند از ده کمتر بردارد. یازده‌تا که شد، بسته می‌شود. */
    if (S.noBundle[i] && S.have[i] === 10) continue;
    if (S.have[i] >= 10) { S.bundling = { from: i, t: 0 }; sfx.slide(); return; }
  }
}

function stepBundle(dt) {
  if (!S.bundling) return;
  S.bundling.t += dt * 1.45;
  if (S.bundling.t < 1) return;
  const b = S.bundling;
  S.have[b.from] -= 10;
  S.have[b.from + 1]++;
  S.bundling = null;
  sfx.good();
  S.combo++;
  const pts = 60 * Math.min(S.combo, 5);
  S.score += pts;
  const st = station(b.from + 1);
  floatText(st.x + st.w / 2, st.y - 16, `+${fa(pts)}`, P.gold);
  bits.confetti(st.x + st.w / 2, st.y + 60, 20, [P.gold, P.good, TIERS[b.from + 1].col]);
  toast.say(`ده ${TIERS[b.from].name} شد یک ${TIERS[b.from + 1].name}`, 'good');
  checkBundle();
}

function stepOpen(dt) {
  if (!S.opening) return;
  S.opening.t += dt * 1.5;
  if (S.opening.t < 1) return;
  const o = S.opening;
  S.have[o.from] -= 1;
  S.have[o.from - 1] += 10;
  S.noBundle[o.from - 1] = true;
  S.opening = null;
  sfx.good();
  toast.say(`یک ${TIERS[o.from].name} شد ده ${TIERS[o.from - 1].name}`, 'good');
  checkBundle();
}

/* ───────── کنش‌ها ───────── */

function takeItem(it) {
  S.belt = S.belt.filter((q) => q !== it);
  const st = station(it.tier);
  S.flying.push({ tier: it.tier, t: 0, sx: it.x, sy: BELT.y + 44, dx: st.x + st.w / 2, dy: st.y + 118 });
  sfx.pop();
}

function openOne(tier) {
  if (S.bundling || S.opening) return;
  if (tier === 0) {
    if (S.have[0] === 0) return;
    S.have[0]--;
    S.combo = 0;
    S.scrap++;
    sfx.tap();
    return;
  }
  if (S.have[tier] === 0) return;
  S.opening = { from: tier, t: 0 };
  sfx.slide();
}

function deliver() {
  if (S.phase !== 'play') return;
  if (total() === O().n) {
    const bonus = O().time > 0 ? Math.round(S.timeLeft * 12) : 300;
    S.score += 400 + bonus;
    S.phase = 'won'; S.phaseT = 0;
    if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
    sfx.win();
    bits.confetti(SCENE_W / 2, 320, 80, [P.gold, P.good, P.dough, P.boxc]);
  } else {
    S.combo = 0;
    S.shake = .4;
    if (O().time > 0) S.timeLeft = Math.max(2, S.timeLeft - 6);
    sfx.nope();
    toast.say('سفارش هنوز جور نیست', 'bad');
  }
}

function failOrder(why) {
  S.hearts--;
  S.phase = 'lost'; S.phaseT = 0;
  sfx.nope();
  toast.say(why, 'bad');
}

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 3], TUT_LAST = 3;      // پرده‌های خواندنی

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 30) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 1 && S.have[0] > 0) { S.tut.step = 2; S.tut.t = 0; }
  if (S.tut.step === 2 && S.have[1] > 0) { S.tut.step = 3; S.tut.t = 0; }
  if (S.tut.step === 3 && S.tut.t > 30) S.tut.on = false;
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (inRect(p, BTN_SEND)) return BTN_SEND;
  for (const it of S.belt) {
    if (Math.hypot(p.x - it.x, p.y - (BELT.y + 44)) < 52) return { item: it };
  }
  for (let i = 0; i < 4; i++) if (inRect(p, openBtn(i))) return { open: i };
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
  if (!h) return;
  if (S.phase === 'intro') { startOrder(0); return; }
  if (S.phase === 'won') {
    if (S.order + 1 < ORDERS.length) startOrder(S.order + 1);
    else { S.score = 0; S.hearts = 3; startOrder(0); }
    return;
  }
  if (S.phase === 'lost') {
    if (S.hearts <= 0) { S.hearts = 3; S.score = 0; startOrder(0); }
    else startOrder(S.order);
    return;
  }
  if (h === BTN_SEND) return deliver();
  if (h.item) return takeItem(h.item);
  if (h.open !== undefined) return openOne(h.open);
});

/* ───────── ابزارِ کوچکِ نقاشی ───────── */

/** مسیرِ مستطیلِ گردگوشه — برای قاب‌ها و نورافکنِ آموزش. */
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
  ctx.font = `${o.family === 'Lalezar' ? '400' : (o.weight || 700)} ${o.size || 20}px "${o.family || 'Lalezar'}", Tahoma, sans-serif`;
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

/** همه‌جا را تاریک می‌کند جز سوراخ‌هایی که داده‌ای. */
function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 10, r.y - 10, r.w + 20, r.h + 20, 20);
  ctx.fillStyle = `rgba(16, 12, 20, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

/** دستِ اشاره‌گرِ آموزش. */
function pointHand(x, y, dir) {
  const bob = Math.sin(S.t * 3.4) * 7;
  ctx.save();
  ctx.translate(x, y + bob * (dir === 'up' ? -1 : 1));
  if (dir === 'up') ctx.rotate(Math.PI);
  withShadow(12, 5, .4, () => {
    ctx.fillStyle = '#f6dfc0';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(-9, -2, -10, 16);
    ctx.quadraticCurveTo(-11, 34, 0, 36);
    ctx.quadraticCurveTo(11, 34, 10, 16);
    ctx.quadraticCurveTo(9, -2, 0, -6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f6dfc0';
    wobbleCircle(0, -12, 8, 4, 1); ctx.fill();
  }, '10, 8, 16');
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

/** تا کدام ماشین امروز روشن است. */
function litMax() {
  let m = 0;
  for (const t of O().tiers) m = Math.max(m, t);
  for (let i = 0; i < 4; i++) if (TIERS[i].unit <= O().n) m = Math.max(m, i);
  return Math.min(3, m);
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#1b1a22');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 16;
    ctx.translate(Math.sin(S.t * 60) * k, Math.cos(S.t * 51) * k * .6);
  }

  drawRoom();
  drawLinks();
  drawStations();
  drawDials();
  drawBelt();
  drawWorker(74, 754);
  drawFlying();
  drawOrderCard();
  drawSendButton();
  bits.draw();
  drawFloats();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {      // یک پیام در یک لحظه بس است
    toast.draw(SCENE_H - 92, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  }

  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.12, 'rgba(24, 14, 6, .34)');
}

/* ───────── سالنِ کارخانه ───────── */

function drawRoom() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallTop);
  g.addColorStop(.62, P.wallLow);
  g.addColorStop(1, '#4c3e32');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* آجرهای کم‌رنگِ دیوار — عمق می‌دهد بی‌آنکه شلوغ کند. */
  ctx.save();
  ctx.globalAlpha = .07;
  ctx.strokeStyle = '#f3e2c4'; ctx.lineWidth = 2;
  for (let r = 0; r < 9; r++) {
    const y = 70 + r * 58;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke();
    for (let c = 0; c < 11; c++) {
      const x = (r % 2 ? 56 : 0) + c * 112;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 58); ctx.stroke();
    }
  }
  ctx.restore();

  /* لوله‌های سقف */
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-20, 66); ctx.lineTo(SCENE_W + 20, 66); ctx.stroke();
  ctx.strokeStyle = P.steel; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(-20, 62); ctx.lineTo(SCENE_W + 20, 62); ctx.stroke();

  /* چراغ‌های آویزِ بالای هر ماشین */
  const lit = litMax();
  for (let i = 0; i < 4; i++) {
    const st = station(i), cx = st.x + st.w / 2;
    const sway = Math.sin(S.t * .8 + i) * 2.4;
    ctx.strokeStyle = '#2a241c'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, 66); ctx.lineTo(cx + sway, 200); ctx.stroke();
    ctx.fillStyle = i <= lit ? P.brass : P.steelDk;
    ctx.beginPath();
    ctx.moveTo(cx + sway - 26, 224);
    ctx.lineTo(cx + sway - 9, 200);
    ctx.lineTo(cx + sway + 9, 200);
    ctx.lineTo(cx + sway + 26, 224);
    ctx.closePath(); ctx.fill();
    if (i <= lit) {
      const gl = ctx.createLinearGradient(0, 224, 0, 500);
      gl.addColorStop(0, 'rgba(255, 218, 150, .30)');
      gl.addColorStop(.55, 'rgba(255, 218, 150, .10)');
      gl.addColorStop(1, 'rgba(255, 218, 150, 0)');
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.moveTo(cx + sway - 22, 226);
      ctx.quadraticCurveTo(cx + sway - 120, 380, cx + sway - 132, 500);
      ctx.lineTo(cx + sway + 132, 500);
      ctx.quadraticCurveTo(cx + sway + 120, 380, cx + sway + 22, 226);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffe6ae';
      wobbleCircle(cx + sway, 224, 8, i * 3, .8); ctx.fill();
    }
  }

  /* کارتن‌های آمادهٔ گوشهٔ سالن — عمق و شلوغیِ طبیعیِ کارخانه */
  ctx.save();
  ctx.globalAlpha = .82;
  for (const c of [{ x: 62, y: 470, w: 86, h: 62 }, { x: 150, y: 486, w: 78, h: 46 },
                   { x: 88, y: 408, w: 70, h: 62 }]) {
    withShadow(14, 6, .32, () => {
      ctx.fillStyle = P.cartonDk;
      wobbleRect(c.x, c.y, c.w, c.h, 4, c.x, 1.2); ctx.fill();
    }, '10, 8, 16');
    ctx.fillStyle = P.carton;
    wobbleRect(c.x, c.y, c.w, c.h * .38, 3, c.x + 1, 1); ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,214,.22)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x + c.w / 2, c.y); ctx.lineTo(c.x + c.w / 2, c.y + c.h);
    ctx.stroke();
  }
  ctx.restore();

  /* کف — تیره‌تر و سردتر از دیوار تا صحنه سبک نشود. */
  ctx.fillStyle = '#3b3128';
  ctx.fillRect(0, 660, SCENE_W, SCENE_H - 660);
  ctx.save();
  ctx.globalAlpha = .5;
  ctx.strokeStyle = '#231d17'; ctx.lineWidth = 3;
  for (let i = -3; i < 16; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 90, 660); ctx.lineTo(i * 90 - 60, SCENE_H); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, 706); ctx.lineTo(SCENE_W, 706); ctx.stroke();
  ctx.restore();
}

/* ───────── خطِ رقم ↔ ماشین ─────────
   قلبِ درس همین خط است: هر رقم به ماشینِ خودش بند است.            */

function drawLinks() {
  const lit = litMax();
  for (let i = 0; i <= lit; i++) {
    const b = dialBox(i), st = station(i), T = TIERS[i];
    const cx = b.x + b.w / 2;
    ctx.save();
    /* میلهٔ ثابت: همیشه پیداست که این رقم مالِ کدام ماشین است. */
    ctx.globalAlpha = .5;
    ctx.strokeStyle = T.col; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, b.y + b.h + 2); ctx.lineTo(cx, st.y - 4); ctx.stroke();
    /* و وقتی رقم می‌غلتد، جریان روی همان میله می‌دود. */
    ctx.globalAlpha = .55 + .45 * S.roll[i];
    ctx.strokeStyle = S.roll[i] > 0 ? '#fff0cd' : T.col;
    ctx.lineWidth = 3;
    ctx.setLineDash([9, 9]);
    ctx.lineDashOffset = S.t * 30;
    ctx.beginPath(); ctx.moveTo(cx, b.y + b.h + 2); ctx.lineTo(cx, st.y - 4); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = T.col;
    ctx.beginPath(); ctx.arc(cx, st.y - 2, 6, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

/* ───────── شمارندهٔ بزرگ ───────── */

function drawDials() {
  const lit = litMax();
  for (let i = 3; i >= 0; i--) {
    const b = dialBox(i), T = TIERS[i];
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const on = i <= lit;
    ctx.save();
    ctx.globalAlpha = on ? 1 : .3;

    if (on && S.roll[i] > 0) {
      const gl = ctx.createRadialGradient(cx, cy, 8, cx, cy, 110);
      gl.addColorStop(0, `rgba(255, 226, 160, ${.4 * S.roll[i]})`);
      gl.addColorStop(1, 'rgba(255, 226, 160, 0)');
      ctx.fillStyle = gl;
      ctx.fillRect(cx - 110, cy - 110, 220, 220);
    }

    withShadow(18, 8, .45, () => {
      ctx.fillStyle = P.dial;
      wobbleRect(b.x, b.y, b.w, b.h, 12, i * 9 + 5, 1.6);
      ctx.fill();
    }, '8, 6, 14');

    /* شیشهٔ رقم */
    ctx.save();
    ctx.beginPath(); rrPath(b.x + 6, b.y + 6, b.w - 12, b.h - 12, 9); ctx.clip();
    ctx.fillStyle = '#171219';
    ctx.fillRect(b.x + 6, b.y + 6, b.w - 12, b.h - 12);
    const h = b.h - 10, r = S.roll[i];
    numText(fa(S.dial[i]), cx, cy + r * h, { size: 64, family: 'Lalezar', color: '#f7ebd3' });
    if (r > 0) numText(fa(S.prevDial[i]), cx, cy - (1 - r) * h, { size: 64, family: 'Lalezar', color: '#f7ebd3', alpha: .75 });
    ctx.globalAlpha = .12;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(b.x + 6, b.y + 6, b.w - 12, 16);
    ctx.globalAlpha = .2;
    ctx.fillStyle = '#000000';
    for (let k = 0; k < 6; k++) ctx.fillRect(b.x + 6, b.y + 10 + k * 15, b.w - 12, 2);
    ctx.restore();

    /* قابِ هم‌رنگِ ماشین */
    ctx.strokeStyle = T.col; ctx.lineWidth = 4;
    ctx.beginPath(); rrPath(b.x + 3, b.y + 3, b.w - 6, b.h - 6, 10); ctx.stroke();
    ctx.fillStyle = T.col;
    ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y - 6, 6, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

/* ───────── ماشین‌ها ───────── */

/** جای خانهٔ k اُم از قاب ده‌تایی — از راست به چپ پر می‌شود. */
function slotPos(i, k) {
  const st = station(i);
  const wx = st.x + 12, wy = st.y + 50, ww = st.w - 24;
  const col = k % 5, row = k < 5 ? 0 : 1;
  const x = wx + ww - 9 - col * 34 - 15;
  const y = wy + 20 + row * 34;
  return { x, y };
}

function drawStations() {
  const lit = litMax();
  for (let i = 3; i >= 0; i--) {
    const st = station(i), T = TIERS[i];
    const on = i <= lit;
    ctx.save();
    ctx.globalAlpha = on ? 1 : .32;

    /* بدنه */
    withShadow(20, 10, .4, () => {
      ctx.fillStyle = P.steel;
      wobbleRect(st.x, st.y, st.w, st.h, 14, st.x, 1.8);
      ctx.fill();
    }, '10, 8, 16');
    ctx.fillStyle = P.steelLit;
    wobbleRect(st.x + 5, st.y + 5, st.w - 10, 12, 6, st.x + 2, 1); ctx.fill();
    ctx.fillStyle = P.steelDk;
    wobbleRect(st.x + 5, st.y + st.h - 16, st.w - 10, 11, 5, st.x + 4, 1); ctx.fill();

    /* تابلوی نام و ارزشِ مکانی */
    ctx.fillStyle = T.col;
    wobbleRect(st.x + 12, st.y + 8, st.w - 24, 36, 8, st.x + 6, 1.2); ctx.fill();
    text(T.name, st.x + st.w / 2, st.y + 20, { size: 20, family: 'Lalezar', color: '#33261a' });
    text(T.place, st.x + st.w / 2, st.y + 36, { size: 12, color: 'rgba(40, 28, 18, .78)' });

    /* شیشه و قابِ ده‌تایی */
    ctx.fillStyle = '#211b16';
    wobbleRect(st.x + 12, st.y + 50, st.w - 24, 92, 8, st.x + 8, 1); ctx.fill();
    for (let k = 0; k < 10; k++) {
      const s = slotPos(i, k);
      ctx.fillStyle = 'rgba(255, 240, 210, .07)';
      ctx.beginPath(); rrPath(s.x - 14, s.y - 14, 28, 28, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255, 240, 210, .12)'; ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    /* واحدهای داخلِ ماشین */
    const bun = S.bundling && S.bundling.from === i ? easeInOut(clamp(S.bundling.t, 0, 1)) : 0;
    const opn = S.opening && S.opening.from === i ? clamp(S.opening.t, 0, 1) : 0;
    const born = S.bundling && S.bundling.from === i - 1 ? easeBack(clamp(S.bundling.t, 0, 1)) : 0;
    const rain = S.opening && S.opening.from === i + 1 ? clamp(S.opening.t, 0, 1) : 0;
    const n = Math.min(10, S.have[i]);
    for (let k = 0; k < n; k++) {
      const s = slotPos(i, k);
      let x = s.x, y = s.y, sc = .8;
      if (bun > 0) {                       // ده‌تا به هم می‌چسبند و می‌روند بغل
        const cxm = st.x + st.w / 2;
        x = lerp(s.x, cxm, bun); y = lerp(s.y, st.y + 96, bun);
        sc = .8 * (1 - .55 * bun);
      }
      if (opn > 0 && k === n - 1) sc = .8 * (1 - opn);
      if (rain > 0 && k >= n - 10) {
        const p = clamp(rain * 1.4 - k * .03, 0, 1);
        y = lerp(st.y + 20, s.y, easeOut(p));
        sc = .8 * easeOut(clamp(p * 2, 0, 1));
      }
      if (sc > .02) drawUnit(i, x, y, sc);
    }
    if (born > 0) drawUnit(i, st.x + st.w / 2, st.y + 96, .8 * born);

    /* دهانهٔ خروجی به سمتِ ماشینِ بعدی (چپ) */
    if (i < 3) {
      ctx.fillStyle = P.steelDk;
      wobbleRect(st.x - 18, st.y + 84, 22, 26, 5, st.x, .8); ctx.fill();
    }

    /* دکمهٔ باز کردن / دور ریختن */
    const ob = openBtn(i);
    const canOpen = i === 0 ? S.have[0] > 0 : S.have[i] > 0;
    const hot = S.hover && S.hover.open === i;
    button(ob, i === 0 ? 'دور بریز' : 'باز کن', {
      hot, disabled: !canOpen || !on,
      fill: i === 0 ? '#8a5a4a' : P.brassDk,
      hotFill: i === 0 ? '#9d6754' : P.brass,
      size: 17, r: 10, family: 'Vazirmatn',
    });
    ctx.restore();
  }
}

/* ───────── نوارِ نقاله ───────── */

function drawBelt() {
  withShadow(20, 10, .4, () => {
    ctx.fillStyle = P.belt;
    wobbleRect(BELT.x - 22, BELT.y, BELT.w + 44, BELT.h, 16, 31, 1.6);
    ctx.fill();
  }, '10, 8, 16');
  ctx.save();
  ctx.beginPath(); rrPath(BELT.x - 22, BELT.y, BELT.w + 44, BELT.h, 16); ctx.clip();
  ctx.fillStyle = P.beltLit;
  const off = (S.t * 52) % 46;
  for (let x = BELT.x - 70; x < BELT.x + BELT.w + 60; x += 46) {
    ctx.fillRect(x - off, BELT.y, 8, BELT.h);
  }
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.fillRect(BELT.x - 22, BELT.y + BELT.h - 14, BELT.w + 44, 14);
  ctx.restore();

  /* غلتک‌های دو سر */
  for (const cx of [BELT.x - 22, BELT.x + BELT.w + 22]) {
    ctx.fillStyle = P.steelDk;
    wobbleCircle(cx, BELT.y + BELT.h / 2, 26, cx, 1.2); ctx.fill();
    ctx.fillStyle = P.steel;
    wobbleCircle(cx, BELT.y + BELT.h / 2, 17, cx + 1, 1); ctx.fill();
    ctx.strokeStyle = P.steelDk; ctx.lineWidth = 4;
    const a = -S.t * 2.4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 13, BELT.y + BELT.h / 2 + Math.sin(a) * 13);
    ctx.lineTo(cx - Math.cos(a) * 13, BELT.y + BELT.h / 2 - Math.sin(a) * 13);
    ctx.stroke();
  }

  /* بارهای روی نوار */
  const y = BELT.y + 44;
  for (const it of S.belt) {
    const hv = S.hover && S.hover.item === it;
    const bump = Math.sin(S.t * 7 + it.id * 20) * 2;
    if (hv) {
      ctx.save();
      ctx.globalAlpha = .35;
      ctx.fillStyle = P.gold;
      wobbleCircle(it.x, y + bump, 34, it.id * 90, 2); ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = .3;
    ctx.fillStyle = '#12100a';
    wobbleEllipse(it.x + 3, BELT.y + 74, 24, 7, 0, it.id * 30, 1.4); ctx.fill();
    ctx.restore();
    drawUnit(it.tier, it.x, y + bump - (hv ? 4 : 0), hv ? 1.5 : 1.35);
  }
}

function drawFlying() {
  for (const f of S.flying) {
    const k = easeOut(clamp(f.t, 0, 1));
    const x = lerp(f.sx, f.dx, k);
    const y = lerp(f.sy, f.dy, k) - Math.sin(k * Math.PI) * 130;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(k * 2.4);
    drawUnit(f.tier, 0, 0, lerp(1.35, .8, k));
    ctx.restore();
  }
}

/* ───────── کارتِ سفارش و دکمهٔ فرستادن ───────── */

function drawOrderCard() {
  const b = ORDER_CARD;
  paper(b.x, b.y, b.w, b.h, P.paper, 17, 14, .34);
  ctx.fillStyle = P.brass;
  wobbleRect(b.x, b.y, b.w, 10, 5, 19, .8); ctx.fill();
  text('سفارشِ امروز', b.x + b.w / 2, b.y + 32, { size: 19, color: P.inkSoft });
  const puls = 1 + Math.sin(S.t * 2) * .012;
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + 84);
  ctx.scale(puls, puls);
  numText(fa(O().n), 0, 0, { size: 62, family: 'Lalezar', color: P.ink });
  ctx.restore();
  text('کلوچه', b.x + b.w / 2, b.y + 120, { size: 17, color: P.inkSoft });

  /* گیرهٔ کاغذ */
  ctx.strokeStyle = P.steelLit; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(b.x + b.w / 2 - 16, b.y - 4);
  ctx.lineTo(b.x + b.w / 2 - 16, b.y + 26);
  ctx.moveTo(b.x + b.w / 2 + 16, b.y - 4);
  ctx.lineTo(b.x + b.w / 2 + 16, b.y + 26);
  ctx.stroke();

  /* یادداشتِ سرکارگر */
  ctx.save();
  ctx.globalAlpha = .92;
  text(O().name, b.x + b.w / 2, b.y + b.h + 30, { size: 18, family: 'Lalezar', color: P.gold });
  textWrap(O().hint, b.x + b.w / 2, b.y + b.h + 58, b.w - 6,
    { size: 14, color: 'rgba(246, 236, 214, .74)', lineHeight: 23 });
  ctx.restore();

  /* آشغال — بی‌دقتی خرج دارد */
  if (S.scrap > 0) {
    paper(244, 502, 132, 34, 'rgba(122, 62, 52, .92)', 71, 10, .3);
    text(`هدررفته ${fa(S.scrap)}`, 310, 520, { size: 15, color: '#f6e2d6' });
  }
}

function drawSendButton() {
  /* عمداً هیچ نشانه‌ای نمی‌دهد که سفارش جور شده یا نه؛
     خودِ بچه باید از روی شمارنده تصمیم بگیرد.                       */
  button(BTN_SEND, 'بفرست', { hot: S.hover === BTN_SEND, fill: '#6f9a52', hotFill: '#80ad60', size: 27 });
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.4, 0, 1);
    numText(f.txt, f.x, f.y, { size: f.size, family: 'Lalezar', color: f.col, alpha: k, stroke: 'rgba(30,20,12,.5)', strokeWidth: 5 });
  }
}

/* ───────── نوارِ بالا ───────── */

function drawHUD() {
  ctx.fillStyle = 'rgba(24, 18, 14, .72)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(200, 151, 78, .5)';
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);

  /* دل‌ها — راست */
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 34 - i * 34;
    ctx.save();
    ctx.globalAlpha = i < S.hearts ? 1 : .22;
    ctx.fillStyle = i < S.hearts ? '#d4574a' : '#6b5a4a';
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

  /* مرحله */
  text(`سفارشِ ${fa(S.order + 1)} از ${fa(ORDERS.length)}`, SCENE_W - 150, HUD_H / 2,
    { size: 16, color: '#e8dcc4', align: 'right' });

  /* امتیاز — چپ */
  numText(fa(S.score), 26, HUD_H / 2 - 1, { size: 26, family: 'Lalezar', color: P.gold, align: 'left' });
  text(`رکورد ${fa(S.best)}`, 108, HUD_H / 2, { size: 14, color: 'rgba(230, 214, 186, .6)', align: 'left' });
  if (S.combo > 1) text(`× ${fa(S.combo)}`, 200, HUD_H / 2, { size: 17, color: P.good, align: 'left' });

  /* زمان */
  if (O().time > 0 && S.phase === 'play') {
    const w = 320, x = SCENE_W / 2 - w / 2, k = clamp(S.timeLeft / O().time, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); rrPath(x, 18, w, 16, 8); ctx.fill();
    ctx.fillStyle = k > .35 ? P.good : (k > .15 ? P.gold : P.bad);
    ctx.beginPath(); rrPath(x, 18, Math.max(6, w * k), 16, 8); ctx.fill();
    if (k < .25) {
      ctx.save();
      ctx.globalAlpha = .4 + .4 * Math.sin(S.t * 9);
      ctx.strokeStyle = P.bad; ctx.lineWidth = 3;
      ctx.beginPath(); rrPath(x - 2, 16, w + 4, 20, 10); ctx.stroke();
      ctx.restore();
    }
  } else if (S.phase === 'play') {
    text('بی‌عجله', SCENE_W / 2, 26, { size: 15, color: 'rgba(230, 214, 186, .55)' });
  }
}

/* ───────── آموزشِ چهار پلّه ───────── */

function drawTutorial() {
  const st = S.tut.step;
  let holes = [], msg = '', hand = null;

  if (st === 0) {
    const dR = dialBox(0), dL = dialBox(3);
    holes = [ORDER_CARD, { x: dL.x - 10, y: DIAL_Y - 14, w: dR.x + dR.w - dL.x + 20, h: DIAL_H + 28 }];
    msg = 'این‌قدر کلوچه می‌خواهند. شمارندهٔ بالا می‌گوید تا حالا چند تا جمع کرده‌ای.';
  } else if (st === 1) {
    holes = [{ x: BELT.x - 40, y: BELT.y - 34, w: BELT.w + 80, h: BELT.h + 44 }];
    msg = 'روی کلوچه‌های روی نوار بزن تا بروند توی ماشین.';
    hand = { x: BELT.x + BELT.w * .58, y: BELT.y - 52, dir: 'down' };
  } else if (st === 2) {
    const s0 = station(0), d0 = dialBox(0);
    holes = [{ x: d0.x - 10, y: d0.y - 10, w: d0.w + 20, h: s0.y + s0.h - d0.y + 20 }];
    msg = 'دیدی کدام رقم تکان خورد؟ همان که با میله به همین ماشین وصل است.';
  } else {
    const s1 = station(1), d1 = dialBox(1);
    holes = [{ x: d1.x - 10, y: d1.y - 10, w: d1.w + 20, h: s1.y + s1.h - d1.y + 20 }];
    msg = 'هر ده کلوچه یک پاکت می‌شود و می‌رود توی ماشینِ کناری. حواست به رقم‌ها باشد.';
  }

  spot(holes, .5);

  /* تختهٔ سرکارگر همیشه یک‌جاست تا بچه دنبالش نگردد. */
  const w = 424, h = 92, x = 26, y = 470;
  paper(x, y, w, h, P.paper, 41, 14, .42);
  ctx.fillStyle = P.brass;
  wobbleRect(x, y, 9, h, 4, 43, .8); ctx.fill();
  textWrap(msg, x + w / 2 + 6, y + h / 2 - 12, w - 52, { size: 18, color: P.ink, lineHeight: 27 });
  if (TUT_TAP.indexOf(st) >= 0) tutMore(x + w / 2, y + h + 12, S.t, P.ink);
  if (hand) pointHand(hand.x, hand.y, hand.dir);
}

/* ───────── پرده‌ها ───────── */

function drawIntro() {
  overlay({
    t: S.phaseT,
    w: 720, h: 340, y: 176,
    title: 'کارخانهٔ کلوچه',
    body: 'کلوچه‌ها روی نوار می‌آیند. تو باید دقیقاً به اندازهٔ سفارش جمع کنی؛ نه یکی کمتر، نه یکی بیشتر.\nهر ده‌تا خودش یکی می‌شود.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'شروع',
    paper: P.paper, band: P.brass, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#6f9a52', btnHotFill: '#80ad60',
    icon: (x, y) => { drawUnit(1, x - 46, y + 6, 1.5); drawUnit(0, x + 34, y + 10, 1.7); },
  });
}

function drawWon() {
  const last = S.order + 1 >= ORDERS.length;
  overlay({
    t: S.phaseT,
    w: 700, h: 320, y: 190,
    title: last ? 'کارخانه مالِ توست!' : 'سفارش رفت!',
    body: last
      ? `همهٔ سفارش‌های امسال را رساندی. امتیازت ${fa(S.score)} شد.`
      : `درست به اندازهٔ سفارش. امتیازت ${fa(S.score)} شد.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: last ? 'از اوّل' : 'سفارشِ بعدی',
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#6f9a52', btnHotFill: '#80ad60',
    icon: (x, y) => { star(x, y, 26, P.gold, Math.sin(S.t * 2) * .2); },
  });
}

function drawLost() {
  const over = S.hearts <= 0;
  overlay({
    t: S.phaseT,
    w: 700, h: 300, y: 200,
    title: over ? 'کارخانه تعطیل شد' : 'این سفارش نرسید',
    body: over ? 'همهٔ دل‌ها رفت. از سفارشِ اوّل شروع کن.' : 'اشکالی ندارد. دوباره امتحان کن.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: over ? 'از اوّل' : 'دوباره',
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#c2503f', btnHotFill: '#d05f4d',
    icon: (x, y) => { drawUnit(0, x, y + 6, 1.6); },
  });
}

/* ───────── واحدها و کارگر ───────── */
/** یک واحد از هر مرحله: کلوچه، پاکت، جعبه، کارتن. */
function drawUnit(tier, x, y, sc) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  const T = TIERS[tier];
  if (tier === 0) {
    ctx.fillStyle = T.col;
    wobbleCircle(0, 0, 15, x + y, 1.4); ctx.fill();
    ctx.fillStyle = T.dk;
    wobbleCircle(2, 3, 12, x + y + 1, 1.2); ctx.fill();
    ctx.fillStyle = T.col;
    wobbleCircle(0, 0, 12, x + y + 2, 1.2); ctx.fill();
    ctx.fillStyle = P.choc;
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7 + x * .01;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 6, Math.sin(a) * 6, 2.2, 0, TAU);
      ctx.fill();
    }
  } else if (tier === 1) {
    ctx.fillStyle = T.col;
    ctx.beginPath();
    ctx.moveTo(-14, 18); ctx.lineTo(-11, -14);
    ctx.lineTo(11, -14); ctx.lineTo(14, 18);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = T.dk;
    ctx.beginPath();
    ctx.moveTo(-11, -14); ctx.lineTo(0, -20); ctx.lineTo(11, -14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    wobbleRect(-8, -4, 16, 12, 2, x, .8); ctx.fill();
  } else if (tier === 2) {
    ctx.fillStyle = T.col;
    wobbleRect(-17, -13, 34, 26, 3, x + y, 1); ctx.fill();
    ctx.fillStyle = T.dk;
    wobbleRect(-17, -13, 34, 7, 2, x + y + 1, .8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(0, 13); ctx.stroke();
  } else {
    ctx.fillStyle = T.col;
    wobbleRect(-19, -11, 38, 26, 3, x + y, 1); ctx.fill();
    ctx.fillStyle = shadeHex(T.col, 26);
    ctx.beginPath();
    ctx.moveTo(-19, -11); ctx.lineTo(-13, -19); ctx.lineTo(25, -19); ctx.lineTo(19, -11);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = T.dk;
    ctx.beginPath();
    ctx.moveTo(19, -11); ctx.lineTo(25, -19); ctx.lineTo(25, 7); ctx.lineTo(19, 15);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.3)';
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-19, 1); ctx.lineTo(19, 1); ctx.stroke();
  }
  ctx.restore();
}

function shadeHex(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => clamp(v + amt, 0, 255).toString(16).padStart(2, '0'));
  return `#${c.join('')}`;
}


function drawWorker(x, footY) {
  const bob = Math.sin(S.t * 1.6) * 3;
  ctx.save();
  ctx.translate(x, footY + bob);
  ctx.scale(1.06, 1.06);
  ctx.globalAlpha = .3;
  ctx.fillStyle = '#12101a';
  wobbleEllipse(8, 6, 48, 11, 0, 3, 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#3b3a46';
  wobbleRect(-30, -20, 26, 22, 5, 21, 1.2); ctx.fill();
  wobbleRect(6, -20, 26, 22, 5, 23, 1.2); ctx.fill();
  withShadow(16, 8, .4, () => {
    ctx.fillStyle = '#e8e4da';                     // روپوشِ سفیدِ کارخانه
    ctx.beginPath();
    ctx.moveTo(-42, -14);
    ctx.quadraticCurveTo(-50, -106, -28, -132);
    ctx.lineTo(28, -132);
    ctx.quadraticCurveTo(50, -106, 42, -14);
    ctx.closePath(); ctx.fill();
  }, '10, 8, 16');
  ctx.fillStyle = '#d2cec4';
  ctx.beginPath();
  ctx.moveTo(14, -14);
  ctx.quadraticCurveTo(34, -98, 24, -130);
  ctx.lineTo(28, -132);
  ctx.quadraticCurveTo(50, -106, 42, -14);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#d9a97e';
  ctx.lineWidth = 13; ctx.lineCap = 'round';
  const wave = Math.sin(S.t * 2.2) * 8;
  ctx.beginPath();
  ctx.moveTo(-34, -106); ctx.lineTo(-52, -66 + wave);
  ctx.moveTo(34, -106);  ctx.lineTo(54, -70 - wave);
  ctx.stroke();
  withShadow(12, 6, .3, () => {
    ctx.fillStyle = '#d9a97e';
    wobbleCircle(0, -160, 34, 9, 1.7); ctx.fill();
  }, '10, 8, 16');
  ctx.fillStyle = '#f2efe8';                       // کلاهِ بهداشتی
  ctx.beginPath();
  ctx.moveTo(-36, -176);
  ctx.quadraticCurveTo(-40, -214, 0, -210);
  ctx.quadraticCurveTo(40, -214, 36, -176);
  ctx.quadraticCurveTo(0, -190, -36, -176);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.ink;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 12, -160, 4, 4.8, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -146, 9, .2 * Math.PI, .8 * Math.PI); ctx.stroke();
  ctx.globalAlpha = .3;
  ctx.fillStyle = P.bad;
  wobbleCircle(-22, -150, 7, 1, .6); ctx.fill();
  wobbleCircle(22, -150, 7, 2, .6); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}


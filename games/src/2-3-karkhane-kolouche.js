/*!
title: کارخانهٔ کلوچه — ارزش مکانی
bg: #1b1a22
*/

/* ═══════════════════════════════════════════════════════════════════════
   کارخانهٔ کلوچه — ریاضی سوم، فصل ۲، درس ۳ (ارزش مکانی)
   ───────────────────────────────────────────────────────────────────────
   خودِ کتاب این مدل را می‌دهد: ماشین ۱۰ کلوچه را در یک پاکت می‌گذارد،
   ۱۰ پاکت را در یک جعبه، و ۱۰ جعبه را در یک کارتن. اینجا همان کارخانه است.

   سفارش فقط یک عدد است — مثلاً «۲۳۴۵ کلوچه». هیچ‌جا نوشته نمی‌شود که یعنی
   چند کارتن و چند جعبه؛ فهمیدنش تمامِ کارِ بچه است. روی خطِ تولید هم فقط
   می‌بیند از هر چیز چند تا ساخته، نه اینکه درست است یا نه.

   چالش:
   • نوار نقاله نمی‌ایستد؛ هرچه برنداری از تهِ خط می‌افتد توی ضایعات.
   • وقتِ هر سفارش محدود است.
   • بعضی وقت‌ها کلوچهٔ تکی نمی‌آید و مجبوری پاکت را «باز کنی».
   • تحویلِ اشتباه زنجیره را می‌شکند و وقت می‌گیرد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

/* ───────── پالتِ کارخانه ───────── */
const P = {
  wallTop:  '#3a3128',
  wallLow:  '#57483a',
  steel:    '#8d8073',
  steelLit: '#ab9d8d',
  steelDk:  '#5e5346',
  belt:     '#43382e',
  beltLit:  '#5c4d3e',
  dough:    '#e8b871',
  doughDk:  '#c8934c',
  choc:     '#7a4a28',
  bag:      '#c8a06a',
  bagDk:    '#a37d47',
  boxc:     '#7f9ac2',
  boxDk:    '#5c7aa3',
  carton:   '#b0764f',
  cartonDk: '#8a5836',
  glass:    'rgba(190, 225, 235, .22)',
  paper:    '#f8f0dd',
  ink:      '#2b2620',
  inkSoft:  '#7d7360',
  good:     '#6f9a52',
  bad:      '#c2503f',
  gold:     '#e8b448',
  lampGlow: 'rgba(255, 206, 130, .20)',
  brass:    '#c8974e',
  brassDk:  '#9a7030',
};

/* ───────── مرحله‌های تولید ─────────
   از راست به چپ: کلوچه، پاکت، جعبه، کارتن — همان ترتیبِ ارزش مکانی.  */
const TIERS = [
  { key: 'kolouche', name: 'کلوچه', unit: 1,    col: P.dough,  dk: P.doughDk },
  { key: 'paket',    name: 'پاکت',  unit: 10,   col: P.bag,    dk: P.bagDk },
  { key: 'jabe',     name: 'جعبه',  unit: 100,  col: P.boxc,   dk: P.boxDk },
  { key: 'carton',   name: 'کارتن', unit: 1000, col: P.carton, dk: P.cartonDk },
];

/* ───────── سفارش‌ها ───────── */
const ORDERS = [
  { n: 23,   time: 70, name: 'سفارشِ مغازهٔ سرِ کوچه' },
  { n: 145,  time: 80, name: 'سفارشِ مدرسه' },
  { n: 302,  time: 80, name: 'سفارشِ اردوگاه' },
  { n: 1204, time: 95, name: 'سفارشِ شهرِ کناری' },
  { n: 2350, time: 95, name: 'سفارشِ بزرگِ نوروز' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',            // intro | play | won | lost
  order: 0,
  have: [0, 0, 0, 0],        // تعداد در هر مرحله (کلوچه ← کارتن)
  belt: [],                  // { tier, x, id }
  flying: [],
  bundling: null,            // انیمیشنِ بسته‌شدنِ ده‌تا
  timeLeft: 70,
  hearts: 3,
  score: 0, combo: 0, best: 0,
  t: 0, phaseT: 0,
  spawnT: 0,
  hover: null,
  floats: [],
  shake: 0,
  scrap: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const O = () => ORDERS[S.order];
const total = () => S.have.reduce((a, n, i) => a + n * TIERS[i].unit, 0);

function loadBest() { try { return +localStorage.getItem('kolouche-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('kolouche-best', String(v)); } catch { /* حالت خصوصی */ } }

function startOrder(i) {
  S.order = i;
  S.have = [0, 0, 0, 0];
  S.belt = [];
  S.flying = [];
  S.bundling = null;
  S.timeLeft = ORDERS[i].time;
  S.spawnT = 1.2;
  S.scrap = 0;
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0; S.tut.step = 0; S.tut.t = 0;
}

/* ───────── چیدمان ───────── */

const HUD_H = 60;
const BOARD = { x: 400, y: 74, w: 400, h: 116 };
const BELT = { x: 148, y: 596, w: 1010, h: 88 };
const BTN_SEND = { x: 478, y: 466, w: 244, h: 60 };
const BTN_GO = { x: 470, y: 556, w: 260, h: 76 };

/** ایستگاهِ هر مرحله. راست‌ترین = کلوچه (کم‌ارزش‌ترین). */
function station(i) {
  const w = 202, gap = 16;
  const x = SCENE_W - 44 - (i + 1) * w - i * gap;
  return { x, y: 232, w, h: 196 };
}

function beltSlotX(item) { return item.x; }

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;

  if (S.phase === 'play') {
    if (!S.tut.on || S.tut.step >= 2) S.timeLeft -= dt;
    if (S.timeLeft <= 0) failOrder('وقت تمام شد');

    // نوار نقاله
    S.spawnT -= dt;
    if (S.spawnT <= 0) { spawnItem(); S.spawnT = 1.5 + Math.random() * 1.1; }
    const speed = 52 + S.order * 6;
    for (const it of S.belt) it.x -= speed * dt;
    const fell = S.belt.filter((it) => it.x < BELT.x - 30);
    for (const it of fell) {
      S.scrap++;
      bits.add(BELT.x - 20, BELT.y + 40, 6, 'dot', [P.doughDk], { speed: 90, lift: 40, size: 3, life: .6 });
    }
    if (fell.length) S.belt = S.belt.filter((it) => it.x >= BELT.x - 30);

    if (S.tut.on) tutStep(dt);
  }

  for (const f of S.flying) {
    f.t += dt * 2.1;
    if (f.t >= 1) { f.done = true; S.have[f.tier]++; afterAdd(f.tier); }
  }
  S.flying = S.flying.filter((f) => !f.done);

  if (S.bundling) {
    S.bundling.t += dt * 1.7;
    if (S.bundling.t >= 1) {
      const b = S.bundling;
      S.have[b.from] -= 10;
      S.have[b.from + 1]++;
      S.bundling = null;
      sfx.good();
      S.combo++;
      const pts = 60 * Math.min(S.combo, 5);
      S.score += pts;
      const st = station(b.from + 1);
      floatText(st.x + st.w / 2, st.y + 40, `+${fa(pts)}`, P.gold);
      bits.confetti(st.x + st.w / 2, st.y + 70, 18, [P.gold, P.good, TIERS[b.from + 1].col]);
      checkBundle();
    }
  }

  for (const f of S.floats) { f.t += dt; f.y -= 42 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.4);
  bits.step(dt);
  toast.step(dt);
  draw();
}

function floatText(x, y, txt, col) { S.floats.push({ x, y, txt, col, t: 0 }); }

function spawnItem() {
  // نوار نقاله تصادفی است، اما نه بی‌انصاف: چیزی که برای سفارشِ امروز هنوز
  // لازم است شانسِ بیشتری برای آمدن دارد. وگرنه بچه باید منتظرِ شانس بماند،
  // و انتظار چالش نیست.
  const need = Math.max(0, O().n - total());
  const w = [4, 3, 2, 1];                        // وزنِ پایه: کلوچه بیشتر می‌آید
  for (let i = 0; i < 4; i++) {
    const digit = Math.floor(need / TIERS[i].unit) % 10;
    if (digit > 0) w[i] += 5;                    // این مرحله هنوز لازم است
    if (TIERS[i].unit > need) w[i] = .2;         // بزرگ‌تر از کلِ باقی‌مانده
  }
  const sum = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum, tier = 0;
  for (let i = 0; i < 4; i++) { r -= w[i]; if (r <= 0) { tier = i; break; } }
  S.belt.push({ tier, x: BELT.x + BELT.w + 40, id: Math.random() });
}

function afterAdd(tier) { checkBundle(); }

/** ده‌تا که شد، ماشین خودش می‌بندد و می‌فرستد مرحلهٔ بعد. */
function checkBundle() {
  if (S.bundling) return;
  for (let i = 0; i < 3; i++) {
    if (S.have[i] >= 10) { S.bundling = { from: i, t: 0 }; sfx.slide(); return; }
  }
}

/* ───────── کنش‌ها ───────── */

function takeItem(it) {
  S.belt = S.belt.filter((q) => q !== it);
  const st = station(it.tier);
  S.flying.push({ tier: it.tier, t: 0, sx: it.x, sy: BELT.y + 44, dx: st.x + st.w / 2, dy: st.y + 120 });
  sfx.pop();
}

/** بازکردنِ یک بسته: یک پاکت می‌شود ده کلوچه. */
function openOne(tier) {
  if (tier === 0) {                    // کلوچهٔ تکی را فقط می‌شود دور ریخت
    if (S.have[0] === 0) return;
    S.have[0]--;
    S.combo = 0;
    sfx.tap();
    const st = station(0);
    floatText(st.x + st.w / 2, st.y + 40, 'یکی برداشته شد', P.inkSoft);
    return;
  }
  if (S.have[tier] === 0) return;
  S.have[tier]--;
  S.have[tier - 1] += 10;
  sfx.slide();
  const st = station(tier - 1);
  bits.add(st.x + st.w / 2, st.y + 120, 14, 'dot', [TIERS[tier - 1].col], { speed: 130, lift: 40, size: 3, life: .6 });
  checkBundle();
}

function deliver() {
  if (S.phase !== 'play') return;
  if (total() === O().n) {
    const bonus = Math.round(S.timeLeft * 12);
    S.score += 400 + bonus;
    S.phase = 'won'; S.phaseT = 0;
    if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
    sfx.win();
    bits.confetti(SCENE_W / 2, 320, 80, [P.gold, P.good, P.dough, P.boxc]);
  } else {
    S.combo = 0;
    S.shake = .4;
    S.timeLeft = Math.max(2, S.timeLeft - 6);
    sfx.nope();
    toast.say('سفارش هنوز جور نیست', 'bad');
    floatText(SCENE_W / 2, 420, '−۶ ثانیه', P.bad);
  }
}

function failOrder(why) {
  S.hearts--;
  S.phase = 'lost'; S.phaseT = 0;
  sfx.nope();
  toast.say(why, 'bad');
}

/* ───────── آموزش ───────── */

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 4.2) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 1 && S.have.some((n) => n > 0)) { S.tut.step = 2; S.tut.t = 0; }
  if (S.tut.step === 2 && S.tut.t > 7) { S.tut.on = false; }
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (inRect(p, BTN_SEND)) return BTN_SEND;
  for (const it of S.belt) {
    if (Math.hypot(p.x - it.x, p.y - (BELT.y + 44)) < 52) return { item: it };
  }
  for (let i = 0; i < 4; i++) {
    const st = station(i);
    if (inRect(p, { x: st.x, y: st.y, w: st.w, h: st.h })) return { open: i };
  }
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
  if (S.phase === 'intro') { startOrder(0); return; }
  if (S.phase === 'won') {
    if (S.order + 1 < ORDERS.length) startOrder(S.order + 1);
    else { S.order = 0; S.score = 0; S.hearts = 3; startOrder(0); }
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

/* ───────── ترسیم ───────── */

function draw() {
  beginScene('#1b1a22');
  drawRoom();
  drawStations();
  drawBelt();
  drawFlying();
  drawBoard();
  drawSendButton();
  drawWorker(84, 592);
  drawHUD();
  for (const f of S.floats) {
    ctx.globalAlpha = clamp(1.4 - f.t, 0, 1);
    text(f.txt, f.x, f.y, { size: 24, color: f.col, family: 'Lalezar',
      stroke: 'rgba(20,16,12,.65)', strokeWidth: 5 });
    ctx.globalAlpha = 1;
  }
  bits.draw();
  toast.draw(HUD_H + 10, { ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.11, 'rgba(12,10,18,.44)');
}

function drawRoom() {
  const g = ctx.createLinearGradient(0, 0, 0, 600);
  g.addColorStop(0, P.wallTop);
  g.addColorStop(1, P.wallLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, 620);
  // کاشیِ دیوار
  ctx.strokeStyle = 'rgba(0,0,0,.14)';
  ctx.lineWidth = 2;
  for (let y = 40; y < 620; y += 52) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SW, y); ctx.stroke();
    for (let x = (y / 52) % 2 ? 0 : 66; x < SW; x += 132) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 52); ctx.stroke();
    }
  }
  // لوله‌های سقف
  ctx.strokeStyle = P.steelDk;
  ctx.lineWidth = 20; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-10, 34); ctx.lineTo(SW + 10, 34); ctx.stroke();
  ctx.strokeStyle = P.steel;
  ctx.lineWidth = 13;
  ctx.beginPath(); ctx.moveTo(-10, 34); ctx.lineTo(SW + 10, 34); ctx.stroke();
  for (let x = 90; x < SW; x += 210) {
    ctx.fillStyle = P.steelDk;
    wobbleRect(x - 12, 24, 24, 22, 4, x, 1); ctx.fill();
  }
  // چراغ‌های کارگاهی
  for (const x of [300, 640, 980]) {
    ctx.strokeStyle = P.steelDk; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, 44); ctx.lineTo(x, 92); ctx.stroke();
    ctx.fillStyle = P.steel;
    ctx.beginPath();
    ctx.moveTo(x - 38, 128); ctx.quadraticCurveTo(x - 28, 90, x, 88);
    ctx.quadraticCurveTo(x + 28, 90, x + 38, 128);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe6a8';
    wobbleEllipse(x, 128, 24, 6, 0, x, 1); ctx.fill();
    const gl = ctx.createRadialGradient(x, 140, 10, x, 340, 300);
    gl.addColorStop(0, P.lampGlow);
    gl.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = gl;
    ctx.fillRect(0, 0, SW, SH);
  }
  // کف
  ctx.fillStyle = '#332f3a';
  ctx.fillRect(0, 596, SW, SH - 596);
  ctx.strokeStyle = 'rgba(0,0,0,.2)';
  for (let x = -40; x < SW + 120; x += 120) {
    ctx.beginPath(); ctx.moveTo(x, 596); ctx.lineTo(x - 60, SH); ctx.stroke();
  }
}

/* ─── ایستگاه‌ها ─── */

function drawStations() {
  for (let i = 3; i >= 0; i--) drawStation(i);
  // لوله‌های اتصال بین ایستگاه‌ها، از راست به چپ
  for (let i = 0; i < 3; i++) {
    const a = station(i), b = station(i + 1);
    const y = a.y + 38;
    ctx.strokeStyle = P.steelDk;
    ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a.x - 2, y); ctx.lineTo(b.x + b.w + 2, y); ctx.stroke();
    ctx.strokeStyle = P.steel;
    ctx.lineWidth = 8;
    ctx.stroke();
    // فلشِ جهت
    const mx = (a.x + b.x + b.w) / 2;
    ctx.fillStyle = P.steelLit;
    ctx.beginPath();
    ctx.moveTo(mx - 8, y - 7); ctx.lineTo(mx - 8, y + 7); ctx.lineTo(mx - 20, y);
    ctx.closePath(); ctx.fill();
  }
}

function drawStation(i) {
  const st = station(i);
  const T = TIERS[i];
  const hot = S.hover && S.hover.open === i && S.have[i] > 0;
  const shake = S.shake > 0 ? Math.sin(S.shake * 55) * 3 : 0;

  ctx.save();
  ctx.translate(shake, 0);
  // بدنهٔ ماشین
  withShadow(18, 9, .42, () => {
    ctx.fillStyle = P.steel;
    wobbleRect(st.x, st.y, st.w, st.h, 12, i * 7, 1.8);
    ctx.fill();
  }, '10, 8, 16');
  ctx.fillStyle = P.steelLit;
  wobbleRect(st.x + 6, st.y + 6, st.w - 12, 10, 5, i * 9, 1.2);
  ctx.fill();
  ctx.fillStyle = P.steelDk;
  wobbleRect(st.x + 6, st.y + st.h - 20, st.w - 12, 14, 5, i * 11, 1.2);
  ctx.fill();

  // پنجرهٔ شیشه‌ای با محتویات
  const gx = st.x + 14, gy = st.y + 50, gw = st.w - 28, gh = 104;
  ctx.fillStyle = '#3a2f26';
  wobbleRect(gx, gy, gw, gh, 8, i * 13, 1.2);
  ctx.fill();
  ctx.save();
  wobbleRect(gx, gy, gw, gh, 8, i * 13, 1.2);
  ctx.clip();
  const n = Math.min(S.have[i], 10);
  const per = 5, cell = gw / per;

  // ده جای خالی، مثل شانهٔ تخم‌مرغ. بچه بدون شمردن می‌بیند چقدر تا پرشدن
  // مانده — و همین است که «ده‌تا یکی می‌شود» را دیدنی می‌کند.
  for (let k = 0; k < 10; k++) {
    const col = k % per, row = Math.floor(k / per);
    const cx = gx + cell * (col + .5);
    const cy = gy + gh - 26 - row * 46;
    ctx.fillStyle = 'rgba(0,0,0,.26)';           // گودیِ خالی
    wobbleCircle(cx, cy, 15, k * 3 + i, 1);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,236,200,.13)';   // لبهٔ روشنِ گودی
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 15, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
  for (let k = 0; k < n; k++) {
    const col = k % per, row = Math.floor(k / per);
    const cx = gx + cell * (col + .5);
    const cy = gy + gh - 26 - row * 46;
    const bundling = S.bundling && S.bundling.from === i;
    let sc = 1, ox = 0, oy = 0, al = 1;
    if (bundling) {
      const t = easeInOut(clamp(S.bundling.t, 0, 1));
      ox = (gx + gw / 2 - cx) * t;
      oy = (gy + 20 - cy) * t;
      sc = 1 - t * .7; al = 1 - t * .6;
    }
    ctx.save();
    ctx.globalAlpha = al;
    ctx.translate(cx + ox, cy + oy);
    ctx.scale(sc, sc);
    drawUnit(i, 0, 0, .92);
    ctx.restore();
  }
  ctx.fillStyle = P.glass;
  ctx.fillRect(gx, gy, gw, gh);
  ctx.restore();
  ctx.strokeStyle = P.steelDk;
  ctx.lineWidth = 4;
  wobbleRect(gx, gy, gw, gh, 8, i * 13, 1.2);
  ctx.stroke();
  if (hot) {
    ctx.strokeStyle = 'rgba(255,236,180,.9)';
    ctx.lineWidth = 3;
    wobbleRect(gx - 4, gy - 4, gw + 8, gh + 8, 10, i, 1.2);
    ctx.stroke();
  }

  // اسم و شمارنده
  text(T.name, st.x + st.w / 2, st.y + 28, { size: 21, color: '#f4ece0', family: 'Lalezar' });
  ctx.fillStyle = P.paper;
  wobbleRect(st.x + st.w / 2 - 38, st.y + st.h - 46, 76, 38, 8, i * 3, 1.2);
  ctx.fill();
  text(fa(S.have[i]), st.x + st.w / 2, st.y + st.h - 26,
    { size: 28, color: S.have[i] ? P.ink : '#b9b2a2', family: 'Lalezar' });

  // راهنمای بازکردن
  if (S.have[i] > 0) {
    text(i === 0 ? 'بزن: یکی بردار' : 'بزن: بازش کن',
      st.x + st.w / 2, st.y + st.h + 16, { size: 13, color: 'rgba(244,236,224,.55)' });
  }
  ctx.restore();
}

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

/* ─── نوار نقاله ─── */

function drawBelt() {
  const b = BELT;
  withShadow(16, 8, .4, () => {
    ctx.fillStyle = P.steelDk;
    wobbleRect(b.x - 14, b.y - 8, b.w + 28, b.h + 22, 10, 21, 1.6);
    ctx.fill();
  }, '10, 8, 16');
  ctx.fillStyle = P.belt;
  wobbleRect(b.x, b.y, b.w, b.h, 6, 23, 1.2);
  ctx.fill();
  // تسمه‌های متحرک
  ctx.fillStyle = P.beltLit;
  const off = (S.t * 52) % 44;
  for (let x = b.x - off; x < b.x + b.w; x += 44) {
    const w = Math.min(8, b.x + b.w - x);
    if (x < b.x) continue;
    ctx.fillRect(x, b.y + 4, w, b.h - 8);
  }
  // غلتک‌های دو سر
  for (const rx of [b.x - 6, b.x + b.w + 6]) {
    ctx.fillStyle = P.steel;
    wobbleCircle(rx, b.y + b.h / 2, 22, rx, 1.4); ctx.fill();
    ctx.fillStyle = P.steelDk;
    wobbleCircle(rx, b.y + b.h / 2, 9, rx + 1, 1); ctx.fill();
  }
  // سطلِ ضایعات، تهِ خط
  // سطلِ ضایعات، کاملاً داخلِ کادر
  ctx.fillStyle = P.steelDk;
  ctx.beginPath();
  ctx.moveTo(b.x - 96, b.y + 26); ctx.lineTo(b.x - 22, b.y + 26);
  ctx.lineTo(b.x - 34, b.y + 118); ctx.lineTo(b.x - 84, b.y + 118);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.steel;
  wobbleRect(b.x - 100, b.y + 20, 82, 12, 4, 7, 1); ctx.fill();
  text('ضایعات', b.x - 59, b.y + 134, { size: 13, color: 'rgba(244,236,224,.5)' });
  text(fa(S.scrap), b.x - 59, b.y + 72, { size: 24, color: 'rgba(244,236,224,.4)', family: 'Lalezar' });

  // چیزهای روی نوار
  for (const it of S.belt) {
    const hot = S.hover && S.hover.item === it;
    const bob = Math.sin(S.t * 6 + it.id * 10) * 2;
    ctx.save();
    ctx.translate(it.x, b.y + 44 + bob);
    if (hot) {
      ctx.strokeStyle = 'rgba(255,236,180,.9)';
      ctx.lineWidth = 3;
      wobbleCircle(0, 0, 40, it.id, 2);
      ctx.stroke();
    }
    drawUnit(it.tier, 0, 0, hot ? 1.5 : 1.34);
    ctx.restore();
  }
}

function drawFlying() {
  for (const f of S.flying) {
    const t = easeInOut(clamp(f.t, 0, 1));
    const x = lerp(f.sx, f.dx, t);
    const y = lerp(f.sy, f.dy, t) - Math.sin(Math.PI * t) * 150;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 3);
    drawUnit(f.tier, 0, 0, 1.24);
    ctx.restore();
  }
}

/* ─── تابلوی سفارش ─── */

function drawBoard() {
  const b = BOARD;
  ctx.strokeStyle = P.steelDk;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(b.x + 60, b.y); ctx.lineTo(b.x + 60, 34);
  ctx.moveTo(b.x + b.w - 60, b.y); ctx.lineTo(b.x + b.w - 60, 34);
  ctx.stroke();
  paper(b.x, b.y, b.w, b.h, P.paper, 31, 12, .46);
  text('سفارشِ امروز', b.x + b.w / 2, b.y + 28, { size: 17, color: P.inkSoft });
  text(`${fa(O().n)}`, b.x + b.w / 2, b.y + 74, { size: 54, color: P.ink, family: 'Lalezar' });
  text('کلوچه', b.x + b.w / 2, b.y + 106, { size: 18, color: P.inkSoft });

  // نوارِ زمان
  const tw = b.w - 40, k = clamp(S.timeLeft / O().time, 0, 1);
  ctx.fillStyle = 'rgba(43,38,32,.16)';
  wobbleRect(b.x + 20, b.y + b.h + 10, tw, 14, 7, 33, 1);
  ctx.fill();
  ctx.fillStyle = k > .4 ? P.good : k > .18 ? P.gold : P.bad;
  wobbleRect(b.x + 22, b.y + b.h + 12, (tw - 4) * k, 10, 5, 35, .8);
  ctx.fill();
}

function drawSendButton() {
  button(BTN_SEND, 'بفرست به بازار', {
    hot: S.hover === BTN_SEND, fill: P.good, hotFill: '#7fae5e', size: 22, r: 12,
  });
}

/* ─── کارگر ─── */

function drawWorker(x, footY) {
  const bob = Math.sin(S.t * 1.6) * 3;
  ctx.save();
  ctx.translate(x, footY + bob);
  ctx.scale(.96, .96);
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

/* ─── نوارِ بالا ─── */

function drawHUD() {
  ctx.fillStyle = 'rgba(22,20,28,.84)';
  ctx.fillRect(0, 0, SW, HUD_H);
  ctx.fillStyle = P.steelDk;
  ctx.fillRect(0, HUD_H - 4, SW, 4);
  for (let i = 0; i < 3; i++) {
    const hx = 40 + i * 34;
    ctx.fillStyle = i < S.hearts ? P.bad : 'rgba(238,242,246,.16)';
    ctx.beginPath();
    ctx.moveTo(hx, HUD_H / 2 + 8);
    ctx.bezierCurveTo(hx - 16, HUD_H / 2 - 4, hx - 10, HUD_H / 2 - 16, hx, HUD_H / 2 - 6);
    ctx.bezierCurveTo(hx + 10, HUD_H / 2 - 16, hx + 16, HUD_H / 2 - 4, hx, HUD_H / 2 + 8);
    ctx.closePath(); ctx.fill();
  }
  text(`سفارشِ ${fa(S.order + 1)} از ${fa(ORDERS.length)}`, 220, HUD_H / 2,
    { size: 16, color: 'rgba(238,242,246,.75)' });
  text(`امتیاز ${fa(S.score)}`, SW - 40, HUD_H / 2,
    { size: 20, color: P.gold, family: 'Lalezar', align: 'right' });
  if (S.combo > 1) {
    text(`زنجیره ×${fa(Math.min(S.combo, 5))}`, SW - 190, HUD_H / 2,
      { size: 17, color: P.good, align: 'right' });
  }
  if (S.best > 0) text(`رکورد ${fa(S.best)}`, SW / 2, HUD_H - 12,
    { size: 12, color: 'rgba(238,242,246,.4)' });
}

/* ─── آموزش ─── */

function drawTutorial() {
  const steps = [
    { txt: 'تابلوی بالا می‌گوید امروز چند کلوچه سفارش داده‌اند.\nروی نوار نقاله کلوچه و پاکت و جعبه می‌آید.',
      at: () => spotlight(BOARD) },
    { txt: 'روی هرچه لازم داری بزن تا برود توی ماشین‌ها.\nهرچه برنداری، تهِ خط می‌افتد توی ضایعات.',
      at: () => { spotlight({ x: BELT.x, y: BELT.y - 10, w: BELT.w, h: BELT.h + 20 }); } },
    { txt: 'ده‌تا که شد، ماشین خودش می‌بندد و می‌فرستد ماشینِ بعدی.\nهر وقت فکر کردی سفارش جور شد، «بفرست به بازار» را بزن.',
      at: () => spotlight(BTN_SEND) },
  ];
  const st = steps[Math.min(S.tut.step, 2)];
  const w = 560, h = 104, x = (SW - w) / 2, y = 452;
  ctx.save();
  ctx.globalAlpha = .97;
  paper(x, y, w, h, '#fffaf0', 81, 12, .46);
  ctx.restore();
  ctx.fillStyle = P.gold;
  wobbleRect(x, y, w, 8, 4, 83, 1); ctx.fill();
  textWrap(st.txt, x + w / 2, y + 38, w - 56, { size: 18, color: P.ink, lineHeight: 28 });
  st.at();
}

function spotlight(r) {
  ctx.save();
  ctx.strokeStyle = `rgba(232,180,72,${.55 + Math.sin(S.t * 4) * .35})`;
  ctx.lineWidth = 5;
  ctx.setLineDash([12, 8]);
  ctx.lineDashOffset = -S.t * 22;
  wobbleRect(r.x - 8, r.y - 8, r.w + 16, r.h + 16, 12, 3, 1.4);
  ctx.stroke();
  ctx.restore();
}

/* ─── پرده‌ها ─── */

function drawIntro() {
  overlay({
    t: S.phaseT, title: 'کارخانهٔ کلوچه',
    body: 'ماشینِ اوّل ده کلوچه را در یک پاکت می‌گذارد،\n' +
          'ماشینِ دوم ده پاکت را در یک جعبه، و ماشینِ سوم ده جعبه را در یک کارتن.\n' +
          'امروز تو مسئولِ خطِ تولیدی.',
    btn: BTN_GO, btnLabel: 'شروعِ کار', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.dough, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.good, btnHotFill: '#7fae5e', h: 296,
    icon: (cx, cy) => { for (let k = 0; k < 4; k++) drawUnit(k, cx - 60 + k * 40, cy, 1); },
  });
}

function drawWon() {
  const last = S.order + 1 >= ORDERS.length;
  overlay({
    t: S.phaseT, title: 'سفارش رفت!',
    body: `${O().name} آماده شد.\nامتیازت: ${fa(S.score)}`,
    btn: BTN_GO, btnLabel: last ? 'از اوّل' : 'سفارشِ بعدی', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.good, btnHotFill: '#7fae5e',
    icon: (cx, cy) => star(cx, cy, 28, P.gold),
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, title: S.hearts > 0 ? 'وقت تمام شد' : 'خطِ تولید خوابید',
    body: S.hearts > 0 ? 'اشکالی ندارد — دوباره امتحان کن.' : `امتیازت: ${fa(S.score)}`,
    btn: BTN_GO, btnLabel: S.hearts > 0 ? 'دوباره' : 'از اوّل', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.good, btnHotFill: '#7fae5e',
  });
}

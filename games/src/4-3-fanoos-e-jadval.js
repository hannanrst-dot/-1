/*!
title: فانوسِ جدول — ضرب عددهای یک‌رقمی
bg: #0e1a26
*/

/* ═══════════════════════════════════════════════════════════════════════
   فانوسِ جدول — ریاضی سوم، فصل ۴، درس ۳ (ضرب عددهای یک‌رقمی)
   ───────────────────────────────────────────────────────────────────────
   کتاب می‌گوید حاصل‌ضربِ دو عددِ یک‌رقمی را با هر روشی که دوست داری پیدا
   کن — با جمع، با مستطیل، با محور — و بعد جدولِ ضرب را کامل کن.

   اینجا آن دو تا یکی شده‌اند:

     دیوارِ فانوس‌ها همان جدولِ ضرب است، و کشیدنِ مستطیل از گوشهٔ دیوار
     تا هر فانوس، دقیقاً همان‌قدر فانوس را می‌گیرد که خانهٔ جدول می‌گوید.

   پس یک حرکت، هم مستطیل است هم خانهٔ جدول. بچه مستطیل را می‌کشد، تعدادِ
   سطر و ستون را می‌بیند، ولی حاصل را بازی نمی‌گوید — اگر مطمئن نیست
   می‌تواند فانوس‌ها را بشمارد. همان «هر روشی که دوست داری».

   فانوس‌هایی که روشن کرده روشن می‌مانند و عددشان رویشان می‌ماند، پس
   جدولش کم‌کم جلوی چشمش ساخته می‌شود و الگوها پیدا می‌شوند: قطرِ مربّع‌ها،
   و اینکه ۶×۷ و ۷×۶ یک‌جور روشن می‌شوند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const N = 9;

const P = {
  skyHi:   '#0c1a2a',
  skyLo:   '#24405a',
  wall:    '#20313f',
  wallLo:  '#132330',
  brick:   'rgba(255, 232, 190, .05)',
  rope:    '#7a6448',
  metal:   '#6b5a44',
  metalLit:'#9b8560',
  glassOff:'#2b3b47',
  glassOn: '#ffd98a',
  flame:   '#ffbf5c',
  brass:   '#d3a349',
  brassDk: '#8f6a24',
  paper:   '#fbf3e2',
  ink:     '#22303a',
  inkSoft: '#6f8290',
  pick:    '#5fc7d8',
  good:    '#6fa85c',
  bad:     '#cf5f4a',
  gold:    '#f0c552',
};

const LEVELS = [
  { name: 'شبِ اوّل', rows: [2, 5], rounds: 5, time: 0,
    hint: 'مستطیل را از گوشهٔ دیوار بکش تا فانوسِ درست را بگیری.' },
  { name: 'شبِ دوم', rows: [3, 4], rounds: 5, time: 0,
    hint: 'اگر مطمئن نیستی، فانوس‌های داخلِ مستطیل را بشمار.' },
  { name: 'شبِ سوم', rows: [6, 7, 8, 9], rounds: 6, time: 0,
    hint: 'عددهای بزرگ‌تر. فانوس‌های روشن‌شده کمکت می‌کنند.' },
  { name: 'شبِ چهارم', rows: [2, 3, 4, 5, 6, 7, 8, 9], rounds: 8, time: 22,
    hint: 'حاال شمع هم می‌سوزد. زود تصمیم بگیر.' },
  { name: 'شبِ بی‌پایان', rows: [2, 3, 4, 5, 6, 7, 8, 9], endless: true, time: 18,
    hint: 'تا وقتی دل داری روشن کن.' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  target: 0,
  sel: null,             // { r, c }
  dragging: false,
  lit: {},               // "r,c" → true
  shown: null,           // { r, c, t } فانوسی که تازه روشن شده
  round: 0, rounds: 0,
  timeLeft: 0,
  hearts: 3,
  score: 0, best: 0,
  pairs: 0,
  t: 0, phaseT: 0,
  hover: null,
  shake: 0,
  stars: [],
  floats: [],
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const key = (r, c) => `${r},${c}`;
const isLit = (r, c) => !!S.lit[key(r, c)];

function loadBest() { try { return +localStorage.getItem('fanoos-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('fanoos-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── چیدمان ───────── */

const HUD_H = 52;
const CELL = 52;
const G = { x: 376, y: 158 };                      // گوشهٔ چپ-بالای دیوار
const CARD = { x: 26, y: 92, w: 296, h: 214 };
const PROG = { x: 26, y: 326, w: 296, h: 194 };
const READ = { x: 882, y: 158, w: 292, h: 212 };
const BTN_LIGHT = { x: 882, y: 396, w: 292, h: 82 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

function cellBox(r, c) {
  return { x: G.x + (c - 1) * CELL, y: G.y + (r - 1) * CELL, w: CELL, h: CELL };
}
const gridRect = { x: G.x, y: G.y, w: N * CELL, h: N * CELL };

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 70; i++) {
  S.stars.push({ x: Math.random() * SCENE_W, y: Math.random() * 420,
                 r: .8 + Math.random() * 1.6, ph: Math.random() * TAU });
}
whenFontsReady(() => runLoop(step));

/** هدفی که دستِ‌کم یک جفتِ خاموش دارد، وگرنه بازی بن‌بست می‌شود. */
function pickTarget() {
  const rows = L().rows;
  const cands = [];
  for (const r of rows) for (let c = 1; c <= N; c++) {
    if (!isLit(r, c) || !isLit(c, r)) cands.push(r * c);
  }
  if (!cands.length) {
    for (let r = 1; r <= N; r++) for (let c = 1; c <= N; c++) if (!isLit(r, c)) cands.push(r * c);
  }
  if (!cands.length) return 12;
  return cands[Math.floor(Math.random() * cands.length)];
}

function nextRound() {
  S.target = pickTarget();
  S.sel = null;
  S.timeLeft = L().time;
  S.shown = null;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.rounds = lv.endless ? Infinity : lv.rounds;
  S.round = 0;
  if (!keep) { S.hearts = 3; S.lit = {}; S.pairs = 0; }
  nextRound();
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  toast.say(lv.hint, 'info');
}

function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 26 }); }

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.shown) { S.shown.t += dt; if (S.shown.t > 1.4) afterShow(); }
  if (S.phase === 'play' && !S.shown && L().time > 0 && (!S.tut.on || S.tut.step >= 2)) {
    S.timeLeft -= dt;
    if (S.timeLeft <= 0) miss('شمع تمام شد');
  }
  for (const f of S.floats) { f.t += dt; f.y -= 42 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.5);
  if (S.phase === 'play' && S.tut.on) tutStep(dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── روشن کردن ───────── */

function setSel(p) {
  if (S.phase !== 'play' || S.shown) return;
  const c = Math.floor((p.x - G.x) / CELL) + 1;
  const r = Math.floor((p.y - G.y) / CELL) + 1;
  if (r < 1 || r > N || c < 1 || c > N) return;
  if (!S.sel || S.sel.r !== r || S.sel.c !== c) { S.sel = { r, c }; sfx.tick(); }
}

function light() {
  if (S.phase !== 'play' || S.shown || !S.sel) return;
  const { r, c } = S.sel;
  if (r * c !== S.target) return miss('این مستطیل به عددِ سفارش نمی‌رسد');
  if (isLit(r, c)) {
    /* فانوسِ روشن، اشتباه نیست؛ فقط تکراری است. دل کم نمی‌شود. */
    S.shake = .14; sfx.tap();
    toast.say('این فانوس روشن است؛ جفتش را پیدا کن', 'info');
    return;
  }
  S.lit[key(r, c)] = true;
  S.shown = { r, c, t: 0 };
  let pts = 250;
  if (isLit(c, r) && c !== r) { pts += 200; S.pairs++; toast.say('جفتش هم روشن است!', 'good'); }
  if (L().time > 0) pts += Math.round(S.timeLeft * 8);
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  const b = cellBox(r, c);
  floatText(b.x + CELL / 2, b.y - 20, `+${fa(pts)}`, P.gold);
  bits.confetti(b.x + CELL / 2, b.y + CELL / 2, 26, [P.gold, P.glassOn, '#fff']);
  sfx.good();
}

function miss(why) {
  S.hearts--;
  S.shake = .34;
  sfx.nope();
  toast.say(why, 'bad');
  if (S.hearts <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.sel = null;
  S.timeLeft = L().time;
}

function afterShow() {
  S.shown = null;
  S.round++;
  if (!L().endless && S.round >= S.rounds) {
    S.score += 400;
    if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
    S.phase = 'won'; S.phaseT = 0;
    sfx.win();
    bits.confetti(gridRect.x + gridRect.w / 2, gridRect.y + gridRect.h / 2, 80,
      [P.gold, P.glassOn, P.pick, '#fff']);
    return;
  }
  nextRound();
}

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 30) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 1 && S.sel) { S.tut.step = 2; S.tut.t = 0; }
  if (S.tut.step === 2 && S.tut.t > 30) S.tut.on = false;
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (inRect(p, BTN_LIGHT)) return BTN_LIGHT;
  if (inRect(p, gridRect)) return { grid: true };
  return null;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.dragging) { setSel(p); return; }
  S.hover = hitTest(p);
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});
cv.addEventListener('pointerup', () => { S.dragging = false; });
cv.addEventListener('pointerleave', () => { S.dragging = false; S.hover = null; });
cv.addEventListener('pointerdown', (e) => {
  if (S.phase === 'play' && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
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
  if (h === BTN_LIGHT) return light();
  if (h.grid) { S.dragging = true; setSel(p); }
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
  ctx.fillStyle = `rgba(6, 12, 20, ${alpha})`;
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
  }, '6, 14, 22');
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

/** یک فانوسِ آویزان. on = روشن، val = عددی که رویش نوشته می‌شود. */
function lantern(cx, cy, on, val, k) {
  const sway = Math.sin(S.t * 1.1 + cx * .02 + cy * .01) * 1.6;
  ctx.save();
  ctx.translate(cx + sway, cy);
  if (on) {
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 50);
    g.addColorStop(0, `rgba(255, 205, 120, ${.46 * k})`);
    g.addColorStop(1, 'rgba(255, 205, 120, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(-50, -50, 100, 100);
  }
  /* بندِ آویز */
  ctx.strokeStyle = on ? P.metalLit : 'rgba(122, 100, 72, .55)';
  ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(0, -25); ctx.lineTo(0, -17); ctx.stroke();
  /* کلاهکِ باریک */
  ctx.fillStyle = on ? P.metalLit : P.metal;
  ctx.beginPath();
  ctx.moveTo(-9, -17); ctx.lineTo(9, -17); ctx.lineTo(6, -12); ctx.lineTo(-6, -12);
  ctx.closePath(); ctx.fill();
  /* شیشه — کوزه‌ای، نه مربّعی */
  ctx.fillStyle = on ? P.glassOn : P.glassOff;
  ctx.beginPath();
  ctx.moveTo(-6, -12);
  ctx.bezierCurveTo(-15, -4, -14, 12, -6, 15);
  ctx.lineTo(6, 15);
  ctx.bezierCurveTo(14, 12, 15, -4, 6, -12);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = on ? 'rgba(255, 240, 200, .8)' : 'rgba(150, 180, 200, .22)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  if (on) {
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath(); ctx.ellipse(-5, -3, 2.6, 5, -.4, 0, TAU); ctx.fill();
    numText(fa(val), 0, 2, { size: val >= 10 ? 17 : 19, color: '#5a3c10' });
  } else {
    ctx.fillStyle = 'rgba(120, 150, 170, .3)';
    ctx.beginPath(); ctx.arc(0, 2, 2.6, 0, TAU); ctx.fill();
  }
  /* پایه */
  ctx.fillStyle = on ? P.metalLit : P.metal;
  wobbleRect(-7, 15, 14, 4, 2, cx, .5); ctx.fill();
  ctx.restore();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#0e1a26');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 13;
    ctx.translate(Math.sin(S.t * 58) * k, Math.cos(S.t * 45) * k * .5);
  }

  drawNight();
  drawWall();
  drawGrid();
  drawSel();
  drawCard();
  drawProgress();
  drawRead();
  bits.draw();
  drawFloats();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    ctx.save();
    ctx.translate(gridRect.x + gridRect.w / 2 - SCENE_W / 2, 0);
    toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
    ctx.restore();
  }

  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.11, 'rgba(4, 10, 18, .46)');
}

function drawNight() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.skyHi);
  g.addColorStop(.55, P.skyLo);
  g.addColorStop(1, '#132330');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  for (const s of S.stars) {
    ctx.globalAlpha = .25 + .55 * Math.abs(Math.sin(S.t * .7 + s.ph));
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
  }
  ctx.restore();
  /* ماه */
  ctx.fillStyle = 'rgba(230, 240, 255, .9)';
  wobbleCircle(1088, 108, 30, 5, 1.4); ctx.fill();
  ctx.fillStyle = P.skyHi;
  wobbleCircle(1074, 98, 26, 7, 1.2); ctx.fill();
}

function drawWall() {
  const b = gridRect;
  withShadow(30, 14, .5, () => {
    ctx.fillStyle = P.wall;
    wobbleRect(b.x - 34, b.y - 60, b.w + 68, b.h + 96, 12, 21, 2); ctx.fill();
  }, '4, 10, 18');
  ctx.fillStyle = P.wallLo;
  wobbleRect(b.x - 34, b.y + b.h + 18, b.w + 68, 18, 6, 23, 1.2); ctx.fill();
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = P.brick;
  for (let r = 0; r < 12; r++) for (let c = 0; c < 8; c++) {
    const x = b.x - 30 + c * 66 + (r % 2 ? 33 : 0), y = b.y - 54 + r * 46;
    if (y > b.y + b.h + 30) continue;
    wobbleRect(x, y, 60, 40, 3, r * 8 + c, 1); ctx.fill();
  }
  ctx.restore();
  /* بندهای افقیِ فانوس‌ها */
  ctx.save();
  ctx.globalAlpha = .5;
  ctx.strokeStyle = P.rope; ctx.lineWidth = 2.2;
  for (let r = 1; r <= N; r++) {
    const y = cellBox(r, 1).y + CELL / 2 - 25;
    ctx.beginPath();
    ctx.moveTo(b.x - 26, y - 3);
    ctx.quadraticCurveTo(b.x + b.w / 2, y + 5, b.x + b.w + 26, y - 3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGrid() {
  /* شمارهٔ ستون‌ها و سطرها */
  for (let i = 1; i <= N; i++) {
    numText(fa(i), cellBox(1, i).x + CELL / 2, G.y - 34,
      { size: 20, color: 'rgba(210, 232, 244, .68)' });
    numText(fa(i), G.x - 30, cellBox(i, 1).y + CELL / 2,
      { size: 20, color: 'rgba(210, 232, 244, .68)' });
  }
  text('ستون', G.x + gridRect.w / 2, G.y - 62, { size: 14, color: 'rgba(210, 232, 244, .4)' });
  ctx.save();
  ctx.translate(G.x - 62, G.y + gridRect.h / 2);
  ctx.rotate(-Math.PI / 2);
  text('سطر', 0, 0, { size: 14, color: 'rgba(210, 232, 244, .4)' });
  ctx.restore();

  for (let r = 1; r <= N; r++) for (let c = 1; c <= N; c++) {
    const b = cellBox(r, c);
    const on = isLit(r, c);
    const fresh = S.shown && S.shown.r === r && S.shown.c === c;
    const k = fresh ? easeOut(clamp(S.shown.t * 2.2, 0, 1)) : 1;
    lantern(b.x + CELL / 2, b.y + CELL / 2, on, r * c, k);
  }
}

/** مستطیلِ انتخاب‌شده: از گوشهٔ دیوار تا فانوسِ زیرِ انگشت. */
function drawSel() {
  if (!S.sel) return;
  const { r, c } = S.sel;
  const w = c * CELL, h = r * CELL;
  ctx.save();
  ctx.globalAlpha = .16 + .05 * Math.sin(S.t * 4);
  ctx.fillStyle = P.pick;
  ctx.fillRect(G.x, G.y, w, h);
  ctx.restore();
  ctx.strokeStyle = P.pick; ctx.lineWidth = 4;
  ctx.strokeRect(G.x + 2, G.y + 2, w - 4, h - 4);
  /* اندازهٔ مستطیل کنارِ آن — ولی حاصل‌ضرب نه */
  ctx.save();
  ctx.fillStyle = 'rgba(12, 24, 34, .8)';
  ctx.beginPath(); rrPath(G.x + w - 78, G.y + h + 8, 78, 34, 8); ctx.fill();
  numText(`${fa(r)} × ${fa(c)}`, G.x + w - 39, G.y + h + 25, { size: 21, color: P.pick });
  ctx.restore();
}

/* ───────── کارت‌ها و دکمه ───────── */

function drawCard() {
  const b = CARD;
  withShadow(20, 9, .42, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 41, 2); ctx.fill();
  }, '4, 10, 18');
  ctx.fillStyle = P.brass;
  wobbleRect(b.x, b.y, b.w, 11, 5, 43, .8); ctx.fill();
  text('کدام فانوس؟', b.x + b.w / 2, b.y + 40, { size: 22, family: 'Lalezar', color: P.inkSoft });
  numText(fa(S.target), b.x + b.w / 2, b.y + 108, { size: 62, color: P.ink });
  text('فانوسی که این عدد رویش می‌افتد', b.x + b.w / 2, b.y + 158,
    { size: 15, color: P.inkSoft });
  text('مستطیلش را از گوشه بکش', b.x + b.w / 2, b.y + 186,
    { size: 14, color: 'rgba(111, 130, 144, .85)' });

  /* شمع، اگر این شب وقت دارد */
  if (L().time > 0 && S.phase === 'play') {
    const k = clamp(S.timeLeft / L().time, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,.16)';
    ctx.beginPath(); rrPath(b.x + 28, b.y + b.h - 26, b.w - 56, 12, 6); ctx.fill();
    ctx.fillStyle = k > .35 ? P.good : (k > .15 ? P.gold : P.bad);
    ctx.beginPath(); rrPath(b.x + 28, b.y + b.h - 26, Math.max(6, (b.w - 56) * k), 12, 6); ctx.fill();
  }
}

function drawProgress() {
  const b = PROG;
  withShadow(16, 8, .36, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 12, 51, 2); ctx.fill();
  }, '4, 10, 18');
  ctx.fillStyle = P.pick;
  wobbleRect(b.x, b.y, b.w, 10, 4, 53, .8); ctx.fill();
  text('جدولِ تو', b.x + b.w / 2, b.y + 34, { size: 19, family: 'Lalezar', color: P.inkSoft });

  /* نقشهٔ کوچکِ دیوار: چه‌قدرش روشن شده */
  const m = 12, ox = b.x + b.w / 2 - N * m / 2, oy = b.y + 52;
  for (let r = 1; r <= N; r++) for (let c = 1; c <= N; c++) {
    ctx.fillStyle = isLit(r, c) ? P.gold : 'rgba(111, 130, 144, .22)';
    ctx.beginPath(); rrPath(ox + (c - 1) * m, oy + (r - 1) * m, m - 2.4, m - 2.4, 2.4); ctx.fill();
  }
  let n = 0;
  for (const k in S.lit) if (S.lit[k]) n++;
  text(`${fa(n)} فانوس از ${fa(N * N)}`, b.x + b.w / 2, b.y + b.h - 34,
    { size: 15, color: P.inkSoft });
  if (S.pairs) text(`${fa(S.pairs)} جفتِ کامل`, b.x + b.w / 2, b.y + b.h - 14,
    { size: 14, color: P.good });
}

function drawRead() {
  const b = READ;
  withShadow(20, 9, .4, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 61, 2); ctx.fill();
  }, '4, 10, 18');
  ctx.fillStyle = P.pick;
  wobbleRect(b.x, b.y, b.w, 11, 5, 63, .8); ctx.fill();
  text('مستطیلِ تو', b.x + b.w / 2, b.y + 40, { size: 21, family: 'Lalezar', color: P.inkSoft });
  if (!S.sel) {
    text('روی دیوار بزن یا انگشتت را بکش', b.x + b.w / 2, b.y + 112,
      { size: 16, color: P.inkSoft });
  } else {
    numText(`${fa(S.sel.r)} × ${fa(S.sel.c)}`, b.x + b.w / 2, b.y + 100, { size: 52, color: P.ink });
    text(`${fa(S.sel.r)} سطر، ${fa(S.sel.c)} ستون`, b.x + b.w / 2, b.y + 150,
      { size: 15, color: P.inkSoft });
    text('اگر مطمئن نیستی، فانوس‌ها را بشمار', b.x + b.w / 2, b.y + 178,
      { size: 13, color: 'rgba(111, 130, 144, .8)' });
  }
  button(BTN_LIGHT, 'روشن کن', {
    hot: S.hover === BTN_LIGHT, disabled: S.phase !== 'play' || !S.sel || !!S.shown,
    fill: '#c08c2a', hotFill: '#d9a337', size: 28,
  });
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.5, 0, 1);
    numText(f.txt, f.x, f.y, { size: f.size, color: f.col, alpha: k });
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(10, 20, 30, .8)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(211, 163, 73, .45)';
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 32 - i * 33;
    ctx.save();
    ctx.globalAlpha = i < S.hearts ? 1 : .22;
    ctx.fillStyle = i < S.hearts ? '#d4574a' : '#3f5461';
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
  text(L().name, SCENE_W - 146, HUD_H / 2, { size: 18, family: 'Lalezar', color: '#e6f2fa', align: 'right' });
  numText(fa(S.score), 26, HUD_H / 2 - 1, { size: 26, color: P.gold, align: 'left' });
  text(`رکورد ${fa(S.best)}`, 108, HUD_H / 2, { size: 14, color: 'rgba(230, 242, 250, .58)', align: 'left' });
  if (!L().endless) {
    const n = S.rounds;
    const w = 15, gap = 9, x0 = SCENE_W / 2 - (n * w + (n - 1) * gap) / 2;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i < S.round ? P.gold : 'rgba(255,255,255,.18)';
      ctx.beginPath();
      ctx.ellipse(x0 + i * (w + gap) + w / 2, HUD_H / 2, w / 2, w / 2 * .8, 0, 0, TAU);
      ctx.fill();
    }
  } else {
    text(`${fa(S.round)} فانوس`, SCENE_W / 2, HUD_H / 2, { size: 16, color: P.gold });
  }
}

/* ───────── آموزش ───────── */

function drawTutorial() {
  const st = S.tut.step;
  let holes = [], msg = '', hand = null;

  if (st === 0) {
    holes = [{ x: CARD.x - 6, y: CARD.y - 6, w: CARD.w + 12, h: CARD.h + 12 }];
    msg = 'یک عدد سفارش داده می‌شود. باید فانوسی را روشن کنی که همان عدد رویش می‌افتد.';
  } else if (st === 1) {
    holes = [{ x: gridRect.x - 40, y: gridRect.y - 66, w: gridRect.w + 80, h: gridRect.h + 90 }];
    msg = 'از گوشهٔ دیوار انگشتت را بکش. مستطیلی که می‌گیری، همان‌قدر فانوس دارد.';
    hand = { x: gridRect.x + 3.5 * CELL, y: gridRect.y + 3.5 * CELL };
  } else {
    holes = [{ x: READ.x - 8, y: READ.y - 8, w: READ.w + 16, h: BTN_LIGHT.y + BTN_LIGHT.h - READ.y + 16 }];
    msg = 'سطر و ستونت اینجاست، ولی حاصل را بازی نمی‌گوید. مطمئن شدی، روشن کن.';
  }

  spot(holes, .6);
  const w = 300, h = 176, x = 26, y = 540;
  paper(x, y, w, h, P.paper, 71, 14, .45);
  ctx.fillStyle = P.pick;
  wobbleRect(x, y, 9, h, 4, 73, .8); ctx.fill();
  textWrap(msg, x + w / 2 + 6, y + 40, w - 46, { size: 16, color: P.ink, lineHeight: 25 });
  if (TUT_TAP.indexOf(st) >= 0) tutMore(x + w / 2, y - 42, S.t, P.ink);
  if (hand) pointHand(hand.x, hand.y);
}

/* ───────── پرده‌ها ───────── */

function wallIcon(x, y) {
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    lantern(x - 58 + c * 38, y - 22 + r * 34, r < 2 && c < 3, (r + 1) * (c + 1), 1);
  }
}

function drawIntro() {
  overlay({
    t: S.phaseT,
    w: 760, h: 352, y: 164,
    title: 'فانوسِ جدول',
    body: 'دیوار پر از فانوسِ خاموش است. برای هر عددی که سفارش می‌دهند،\nمستطیلش را از گوشهٔ دیوار بکش تا فانوسِ درست روشن شود.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'شروع',
    paper: P.paper, band: P.brass, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#c08c2a', btnHotFill: '#d9a337',
    icon: wallIcon,
  });
}

function drawWon() {
  const last = !L().endless && S.level + 1 >= LEVELS.length;
  let n = 0;
  for (const k in S.lit) if (S.lit[k]) n++;
  overlay({
    t: S.phaseT,
    w: 720, h: 320, y: 190,
    title: 'دیوار روشن شد!',
    body: `${fa(n)} فانوس روشن کرده‌ای. امتیازت ${fa(S.score)} شد.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: L().endless ? 'باز هم' : (last ? 'از اوّل' : 'شبِ بعدی'),
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#c08c2a', btnHotFill: '#d9a337',
    icon: (x, y) => star(x, y + 6, 26, P.gold, Math.sin(S.t * 2) * .2),
  });
}

function drawLost() {
  overlay({
    t: S.phaseT,
    w: 720, h: 306, y: 196,
    title: 'فانوس‌ها خاموش ماندند',
    body: 'اگر حاصل را مطمئن نیستی، اوّل فانوس‌های داخلِ مستطیل را بشمار.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'دوباره',
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#cf5f4a', btnHotFill: '#dd6f59',
    icon: wallIcon,
  });
}

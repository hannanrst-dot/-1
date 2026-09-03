/*!
title: کارگاهِ فرش — ضرب یک‌رقمی در چندرقمی
bg: #241726
*/

/* ═══════════════════════════════════════════════════════════════════════
   کارگاهِ فرش — ریاضی سوم، فصل ۸، درس ۳ (ضرب عددهای یک‌رقمی در چندرقمی)
   ───────────────────────────────────────────────────────────────────────
   کتاب می‌گوید: «۲ × ۲۳ را این‌طور بشکن: ۲۳ = ۲۰ + ۳، پس ۲×۲۰ و ۲×۳»،
   و می‌خواهد بچّه حاصل را با رسم شکل پیدا کند.

   اینجا سفارشِ فرش می‌رسد: مثلاً «۳ ردیف، هر ردیف ۲۴ گره». نقشهٔ یک
   ردیف کنارِ دار هست و گره‌هایش با چینه نشان داده شده: ۲ ده‌تایی و ۴
   یکی.

   ولی پیش از بافتن باید نخ سفارش بدهی، و انبار یکی‌یکی نمی‌فروشد:
   باید بگویی رویِ‌هم چند ده‌تایی و چند یکی می‌خواهی. برای سه ردیف،
   سه‌تا دوتا ده‌تایی و سه‌تا چهارتا یکی — همان ۳×۲۰ و ۳×۴.

   اهرم را که بکِشی، دار می‌بافد. اگر نخ کم آورده باشی، ردیف سوراخ
   می‌ماند و خودت می‌بینی کجا کم آوردی؛ اگر زیاد باشد، نخ هدر می‌رود.
   حاصلِ ضرب هیچ‌جا نوشته نمی‌شود — آخرِ کار از روی خودِ فرش خوانده
   می‌شود.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  wall:  '#33203a', wallLo: '#1a0f20', wallHi: '#4d3155',
  wood:  '#8a5f33', woodDk: '#4d3218', woodLt: '#b88752',
  rug:   '#8d3a3a', rugDk: '#5a2020', rugLt: '#c2604f',
  brass: '#cfa74e', brassDk: '#8f7327', brassLt: '#f2dd99',
  paper: '#f4ecd9', card: '#fdf7e8', ink: '#2b2035', inkSoft: '#7d7290',
  good:  '#5da26f', bad: '#cd5b45', gold: '#eab53f', lamp: '#ffd08a',
};

/* چینه‌ها بر حسبِ ارزشِ مکانی */
const PL = [
  { v: 100, n: 'صدتایی', c: '#5da26f', d: '#2f6b40', w: 40, h: 40 },
  { v: 10,  n: 'ده‌تایی', c: '#5aa8d8', d: '#2f6f99', w: 14, h: 40 },
  { v: 1,   n: 'یکی',    c: '#e0b13c', d: '#a37c1c', w: 14, h: 14 },
];

const LEVELS = [
  { name: 'دو ردیف', rows: [2, 3], dig: 2, dmax: 4, quota: 3, time: 84,
    hint: 'خطّکشِ نخ را بکِش تا به تعدادی که می‌خواهی برسد.' },
  { name: 'سه ردیف', rows: [2, 4], dig: 2, dmax: 6, quota: 3, time: 88,
    hint: 'برای هر ردیف یک بار، پس چند بار روی‌هم؟' },
  { name: 'صدتایی هم دارد', rows: [2, 3], dig: 3, dmax: 4, quota: 3, time: 96,
    hint: 'حالا سه جور نخ داری.' },
  { name: 'فرشِ بزرگ', rows: [3, 5], dig: 3, dmax: 5, quota: 4, time: 104,
    hint: 'نخِ کم، ردیفِ سوراخ.' },
  { name: 'تا دار برپاست', rows: [2, 5], dig: 3, dmax: 6, time: 100, endless: true,
    hint: 'تا دار برپاست، فرش هست.' },
];

const LOOM = { x: 48, y: 116, w: 592, h: 588 };
const SIDE = { x: 664, y: 88, w: 508 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  rows: 3, dig: [0, 2, 4],      /* رقم‌های عددِ هر ردیف: صد، ده، یک */
  places: [1, 2],               /* کدام ارزش‌ها در کارند */
  want: [0, 0, 0],              /* نخِ سفارش‌داده‌شده بر حسبِ ارزش */
  woven: 0, weave: null,
  drag: -1,
  timeLeft: 0, shuttles: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  done: 0, doneT: 0, bad: 0,
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const rowVal = () => S.dig[0] * 100 + S.dig[1] * 10 + S.dig[2];
const total = () => S.rows * rowVal();
const need = (k) => S.rows * S.dig[k];
const maxWant = () => S.rows * 9;

function loadBest() { try { return +localStorage.getItem('farsh-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('farsh-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();

/* ───────── سفارشِ تازه ───────── */

function newOrder() {
  const lv = L();
  S.rows = R(lv.rows[0], lv.rows[1]);
  const d = [0, 0, 0];
  if (lv.dig === 3) d[0] = R(1, lv.dmax);
  d[1] = R(1, lv.dmax);
  d[2] = R(1, lv.dmax);
  S.dig = d;
  S.places = [];
  for (let k = 0; k < 3; k++) if (d[k] > 0) S.places.push(k);
  S.want = [0, 0, 0];
  S.woven = 0; S.weave = null;
  S.done = 0; S.doneT = 0; S.bad = 0; S.drag = -1;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.shuttles = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newOrder();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

newOrder();
whenFontsReady(() => runLoop(step));

function rowBox(r) {
  const top = LOOM.y + 74, h = (LOOM.h - 130) / Math.max(3, S.rows);
  return { x: LOOM.x + 26, y: top + r * h, w: LOOM.w - 52, h: h - 8 };
}
function trackBox(i) {
  const k = S.places[i];
  return { x: SIDE.x + 46, y: SIDE.y + 218 + i * 104, w: SIDE.w - 150, h: 22, k };
}
const leverKnob = () => ({ x: SIDE.x + SIDE.w - 66, y: SIDE.y + 546, r: 34 });

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.bad > 0) S.bad -= dt;

  if (S.weave) {
    S.weave.t += dt;
    const per = .42;
    const n = Math.min(S.rows, Math.floor(S.weave.t / per));
    if (n > S.woven) {
      S.woven = n;
      sfx.tone(420 + n * 40, .09, 'triangle', .06);
      const b = rowBox(n - 1);
      bits.add(b.x + b.w / 2, b.y + b.h / 2, 10, 'dot', [P.rugLt, P.brassLt],
        { speed: 140, lift: 40, size: 3, life: .5, grav: 260 });
    }
    if (S.weave.t > S.rows * per + .5) { S.weave = null; judge(); }
  }

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.done) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseShuttle('کارگاه بسته شد!'); }
    }
    if (S.done) { S.doneT += dt; if (S.doneT > 2.4) { newOrder(); S.timeLeft = L().time; } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function pullLever() {
  if (S.weave || S.done || S.phase !== 'play') return;
  S.woven = 0;
  S.weave = { t: 0 };
  sfx.slide();
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
}

/** آیا نخِ سفارش‌داده‌شده درست بود؟ */
function judge() {
  const short = S.places.filter((k) => S.want[k] < need(k));
  const over = S.places.filter((k) => S.want[k] > need(k));
  if (!short.length && !over.length) { finish(); return; }
  S.bad = 1.2;
  S.shake = .3;
  /* ردیف‌ها را پاک نمی‌کنیم: بچّه باید سوراخ‌ها را ببیند */
  S.woven = S.rows;
  sfx.nope();
  toast.say(short.length ? 'نخ کم آمد؛ ردیف‌ها سوراخ ماند.' : 'نخ زیاد آمد و هدر رفت.', 'bad');
}

function loseShuttle(msg) {
  if (S.done) return;
  S.shuttles--;
  S.combo = 0;
  S.shake = .5;
  S.weave = null; S.woven = 0;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.shuttles <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newOrder();
}

function finish() {
  S.done = .001; S.doneT = 0;
  S.woven = S.rows;
  S.combo++;
  S.cleared++;
  S.score += 340 + S.places.length * 110 + Math.round(S.timeLeft * 4) + Math.min(S.combo, 6) * 70;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(LOOM.x + LOOM.w / 2, LOOM.y + LOOM.h / 2, 50, [P.gold, P.rugLt, PL[1].c, PL[2].c, '#fff']);
  sfx.win();
  toast.say('فرش بافته شد!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function setWant(i, px) {
  const b = trackBox(i);
  const v = clamp(Math.round((px - b.x) / b.w * maxWant()), 0, maxWant());
  if (v === S.want[b.k]) return;
  S.want[b.k] = v;
  S.woven = 0;
  sfx.tone(260 + v * 8, .04, 'sine', .04);
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.drag >= 0) {
    if (e.buttons === 0 && e.pointerType === 'mouse') { S.drag = -1; return; }
    setWant(S.drag, p.x);
    return;
  }
  S.hover = null;
  for (let i = 0; i < S.places.length; i++) {
    const b = trackBox(i);
    if (p.x > b.x - 24 && p.x < b.x + b.w + 24 && Math.abs(p.y - b.y - 11) < 30) S.hover = { k: 'track', i };
  }
  if (inCircle(p, leverKnob(), 12)) S.hover = { k: 'lever' };
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { startLevel(0); return; }
  if (S.phase === 'won') {
    if (!inRect(p, BTN_GO)) return;
    if (L().endless) startLevel(S.level, true);
    else if (S.level + 1 < LEVELS.length) startLevel(S.level + 1, true);
    else startLevel(0);
    return;
  }
  if (S.phase === 'lost') { if (inRect(p, BTN_GO)) startLevel(S.level); return; }
  if (tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (S.weave || S.done) return;
  if (inCircle(p, leverKnob(), 14)) { pullLever(); return; }
  for (let i = 0; i < S.places.length; i++) {
    const b = trackBox(i);
    if (p.x > b.x - 24 && p.x < b.x + b.w + 24 && Math.abs(p.y - b.y - 11) < 30) {
      S.drag = i;
      setWant(i, p.x);
      try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
      return;
    }
  }
});

cv.addEventListener('pointerup', () => { S.drag = -1; });
cv.addEventListener('pointercancel', () => { S.drag = -1; });
cv.addEventListener('pointerleave', () => { S.drag = -1; });
addEventListener('blur', () => { S.drag = -1; });

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
  ctx.fillStyle = `rgba(10, 5, 14, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(253, 247, 232, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '10, 5, 14');
  ctx.fillStyle = P.rug;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6c6280' }); yy += 30; }
  return h + 20;
}

/** یک چینه با ارزشِ k. */
function chip(x, y, k, sc = 1) {
  const pl = PL[k], w = pl.w * sc, h = pl.h * sc;
  ctx.fillStyle = pl.d;
  ctx.beginPath(); rrPath(x - w / 2, y - h / 2 + 2 * sc, w, h, 3 * sc); ctx.fill();
  ctx.fillStyle = pl.c;
  ctx.beginPath(); rrPath(x - w / 2, y - h / 2, w, h, 3 * sc); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.32)';
  ctx.beginPath(); rrPath(x - w / 2 + 2 * sc, y - h / 2 + 2 * sc, w - 4 * sc, 3 * sc, 1.5 * sc); ctx.fill();
  if (k === 0) {
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(x - w / 2, y - h / 2 + i * h / 4); ctx.lineTo(x + w / 2, y - h / 2 + i * h / 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - w / 2 + i * w / 4, y - h / 2); ctx.lineTo(x - w / 2 + i * w / 4, y + h / 2); ctx.stroke();
    }
  } else if (k === 1) {
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(x - w / 2, y - h / 2 + i * h / 4); ctx.lineTo(x + w / 2, y - h / 2 + i * h / 4); ctx.stroke();
    }
  }
}

/** یک ردیف چینه — نقشهٔ یک ردیفِ فرش. */
function chipRow(cx, cy, dig, sc = 1, gap = 6) {
  const items = [];
  for (let k = 0; k < 3; k++) for (let n = 0; n < dig[k]; n++) items.push(k);
  let w = 0;
  for (const k of items) w += PL[k].w * sc + gap;
  w -= gap;
  let x = cx - w / 2;
  for (const k of items) {
    x += PL[k].w * sc / 2;
    chip(x, cy, k, sc);
    x += PL[k].w * sc / 2 + gap;
  }
  return w;
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintShopStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallLo); g.addColorStop(.45, P.wall); g.addColorStop(1, '#150c1a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.globalAlpha = .4;
  ctx.fillStyle = texCloth('#3c2544', '#573463');
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* گره‌چینیِ دیوار */
  ctx.save();
  ctx.globalAlpha = .1;
  ctx.strokeStyle = P.brassLt; ctx.lineWidth = 2;
  for (let x = -40; x < SCENE_W + 40; x += 64) for (let y = HUD_H; y < SCENE_H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(x, y + 32); ctx.lineTo(x + 32, y); ctx.lineTo(x + 64, y + 32); ctx.lineTo(x + 32, y + 64);
    ctx.closePath(); ctx.stroke();
  }
  ctx.restore();
  /* چراغِ سقف */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const lg = ctx.createRadialGradient(360, 90, 20, 360, 90, 620);
  lg.addColorStop(0, 'rgba(255, 208, 138, .3)');
  lg.addColorStop(1, 'rgba(255, 208, 138, 0)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* دارِ چوبی */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(LOOM.x - 14, LOOM.y - 14, LOOM.w + 28, LOOM.h + 28, 14); ctx.fill();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.beginPath(); rrPath(LOOM.x - 8, LOOM.y - 8, LOOM.w + 16, LOOM.h + 16, 10); ctx.fill();
  ctx.fillStyle = 'rgba(20, 10, 26, .78)';
  ctx.beginPath(); rrPath(LOOM.x, LOOM.y, LOOM.w, LOOM.h, 8); ctx.fill();
  /* تارهای عمودیِ دار */
  ctx.strokeStyle = 'rgba(244, 236, 217, .12)'; ctx.lineWidth = 2;
  for (let x = LOOM.x + 22; x < LOOM.x + LOOM.w - 10; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, LOOM.y + 8); ctx.lineTo(x, LOOM.y + LOOM.h - 8); ctx.stroke();
  }
  /* میزِ کنارِ کارگاه */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(SIDE.x - 18, SIDE.y - 16, SIDE.w + 36, 612, 14); ctx.fill();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.beginPath(); rrPath(SIDE.x - 12, SIDE.y - 10, SIDE.w + 24, 600, 10); ctx.fill();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.wall);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('shop', SCENE_W, SCENE_H, paintShopStatic), 0, 0, SCENE_W, SCENE_H);
  drawLoom();
  drawSide();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.11, 'rgba(8, 4, 12, .5)', .42, .16);
}

function drawLoom() {
  text('دارِ قالی', LOOM.x + LOOM.w - 20, LOOM.y + 30,
    { size: 21, family: 'Lalezar', color: 'rgba(244, 236, 217, .85)', align: 'right' });
  numText(fa(S.rows) + ' ردیف', LOOM.x + 90, LOOM.y + 31, { size: 18, color: 'rgba(244, 236, 217, .6)' });

  for (let r = 0; r < S.rows; r++) {
    const b = rowBox(r);
    const done = r < S.woven;
    ctx.fillStyle = done ? P.rugDk : 'rgba(255,255,255,.03)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 8); ctx.fill();
    if (done) {
      ctx.save();
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 8); ctx.clip();
      ctx.fillStyle = texCloth(P.rug, P.rugDk);
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = 'rgba(242, 221, 153, .3)'; ctx.lineWidth = 2;
      ctx.beginPath(); rrPath(b.x + 6, b.y + 6, b.w - 12, b.h - 12, 6); ctx.stroke();
      ctx.restore();
    } else {
      ctx.strokeStyle = 'rgba(244, 236, 217, .14)'; ctx.lineWidth = 1.6; ctx.setLineDash([7, 7]);
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 8); ctx.stroke();
      ctx.setLineDash([]);
    }
    /* گره‌های ردیف: نقشه، و آنچه نخ رسیده */
    const items = [];
    for (const k of S.places) for (let n = 0; n < S.dig[k]; n++) items.push(k);
    let w = 0;
    for (const k of items) w += PL[k].w + 8;
    w -= 8;
    let x = b.x + b.w / 2 - w / 2;
    /* چند تا از هر ارزش به این ردیف می‌رسد */
    const left = S.places.map((k) => Math.max(0, S.want[k] - S.dig[k] * r));
    const got = {};
    S.places.forEach((k, i) => { got[k] = Math.min(S.dig[k], left[i]); });
    const usedK = {};
    for (const k of items) {
      x += PL[k].w / 2;
      usedK[k] = (usedK[k] || 0) + 1;
      const has = done && usedK[k] <= got[k];
      if (has) chip(x, b.y + b.h / 2, k, 1);
      else {
        ctx.strokeStyle = done ? P.bad : 'rgba(244, 236, 217, .22)';
        ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
        ctx.beginPath();
        rrPath(x - PL[k].w / 2, b.y + b.h / 2 - PL[k].h / 2, PL[k].w, PL[k].h, 3);
        ctx.stroke(); ctx.setLineDash([]);
      }
      x += PL[k].w / 2 + 8;
    }
  }
  /* شمارشِ فرشِ تمام‌شده */
  if (S.done) {
    const y = LOOM.y + LOOM.h - 34;
    ctx.fillStyle = 'rgba(10, 5, 16, .82)';
    ctx.beginPath(); rrPath(LOOM.x + 90, y - 26, LOOM.w - 180, 52, 12); ctx.fill();
    ctx.strokeStyle = P.gold; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(LOOM.x + 90, y - 26, LOOM.w - 180, 52, 12); ctx.stroke();
    text('همهٔ گره‌ها', LOOM.x + LOOM.w - 130, y, { size: 15, color: 'rgba(244, 236, 217, .6)', align: 'right' });
    numText(fa(total()), LOOM.x + 190, y + 1, { size: 30, color: P.gold });
  }
}

/** برگهٔ سفارش، خطّکش‌های نخ و اهرمِ دار. */
function drawSide() {
  /* سفارش */
  paper(SIDE.x, SIDE.y, SIDE.w, 172, P.card, 31, 12, .34);
  text('سفارشِ فرش', SIDE.x + SIDE.w - 22, SIDE.y + 32, { size: 21, family: 'Lalezar', color: P.ink, align: 'right' });
  numText(fa(S.rows), SIDE.x + 54, SIDE.y + 33, { size: 26, color: P.ink });
  text('ردیف', SIDE.x + 92, SIDE.y + 33, { size: 15, color: P.inkSoft, align: 'left' });
  ctx.strokeStyle = 'rgba(43, 32, 53, .2)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(SIDE.x + 22, SIDE.y + 52); ctx.lineTo(SIDE.x + SIDE.w - 22, SIDE.y + 52); ctx.stroke();
  text('نقشهٔ یک ردیف', SIDE.x + SIDE.w - 22, SIDE.y + 76, { size: 14, color: P.inkSoft, align: 'right' });
  chipRow(SIDE.x + SIDE.w / 2, SIDE.y + 116, S.dig, 1, 7);
  numText(fa(rowVal()), SIDE.x + SIDE.w / 2, SIDE.y + 152, { size: 24, color: P.ink });

  /* خطّکش‌های نخ */
  text('سفارشِ نخ به انبار', SIDE.x + SIDE.w - 22, SIDE.y + 196,
    { size: 18, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < S.places.length; i++) {
    const b = trackBox(i), k = b.k;
    const v = S.want[k];
    /* نشانِ نوعِ نخ */
    chip(SIDE.x + 22, b.y + 11, k, k === 0 ? .6 : 1);
    text(PL[k].n, SIDE.x + 22, b.y + 42, { size: 12, color: 'rgba(244, 236, 217, .6)' });
    /* شیار */
    ctx.fillStyle = 'rgba(10, 5, 16, .7)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 11); ctx.fill();
    ctx.fillStyle = PL[k].d;
    ctx.beginPath(); rrPath(b.x, b.y, b.w * v / maxWant(), b.h, 11); ctx.fill();
    /* خط‌های شمارش */
    ctx.strokeStyle = 'rgba(244, 236, 217, .22)'; ctx.lineWidth = 1.4;
    for (let n = 1; n < maxWant(); n++) {
      const x = b.x + b.w * n / maxWant();
      const big = n % 5 === 0;
      ctx.beginPath(); ctx.moveTo(x, b.y + (big ? 2 : 6)); ctx.lineTo(x, b.y + b.h - (big ? 2 : 6)); ctx.stroke();
    }
    /* دستگیره */
    const hx = b.x + b.w * v / maxWant();
    const hot = (S.hover && S.hover.k === 'track' && S.hover.i === i) || S.drag === i;
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); ctx.arc(hx, b.y + 11 + 2, 15, 0, TAU); ctx.fill();
    ctx.fillStyle = ball(hx - 4, b.y + 7, 28, P.brassLt, P.brass, P.brassDk);
    ctx.beginPath(); ctx.arc(hx, b.y + 11, 14, 0, TAU); ctx.fill();
    if (hot) {
      ctx.strokeStyle = P.brassLt; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(hx, b.y + 11, 21, 0, TAU); ctx.stroke();
    }
    /* عددِ انتخاب‌شده و پیش‌نمایشِ کلاف */
    ctx.fillStyle = 'rgba(10, 5, 16, .8)';
    ctx.beginPath(); rrPath(b.x + b.w + 14, b.y - 12, 62, 46, 10); ctx.fill();
    numText(fa(v), b.x + b.w + 45, b.y + 12, { size: 24, color: P.brassLt });
    /* کلاف‌ها زیرِ شیار */
    const show = Math.min(v, 18);
    for (let n = 0; n < show; n++) {
      chip(b.x + 12 + n * 20, b.y + 48, k, k === 0 ? .38 : .62);
    }
    if (v > 18) numText('+' + fa(v - 18), b.x + 12 + 18 * 20 + 12, b.y + 48, { size: 14, color: P.brassLt });
  }

  /* اهرمِ دار */
  const kb = leverKnob();
  ctx.fillStyle = 'rgba(10, 5, 16, .6)';
  ctx.beginPath(); rrPath(kb.x - 17, kb.y - 76, 34, 116, 17); ctx.fill();
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(kb.x, kb.y - 62); ctx.lineTo(kb.x, kb.y); ctx.stroke();
  const busy = !!S.weave;
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); ctx.arc(kb.x, kb.y + 4 + (busy ? 12 : 0), kb.r, 0, TAU); ctx.fill();
  ctx.fillStyle = ball(kb.x - 10, kb.y - 10, kb.r * 2, P.brassLt, P.brass, P.brassDk);
  ctx.beginPath(); ctx.arc(kb.x, kb.y + (busy ? 12 : 0), kb.r - 2, 0, TAU); ctx.fill();
  if (S.hover && S.hover.k === 'lever' && !busy) {
    ctx.save();
    ctx.globalAlpha = .5 + .3 * Math.sin(S.t * 6);
    ctx.strokeStyle = P.brassLt; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(kb.x, kb.y, kb.r + 10, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  text('بباف', kb.x - 76, kb.y, { size: 22, family: 'Lalezar', color: P.paper, align: 'right' });
  text(busy ? 'دار می‌بافد…' : 'اوّل نخ، بعد اهرم', kb.x - 76, kb.y + 30,
    { size: 14, color: 'rgba(244, 236, 217, .5)', align: 'right' });
  if (S.bad > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.bad, 0, 1);
    ctx.strokeStyle = P.bad; ctx.lineWidth = 4;
    ctx.beginPath(); rrPath(SIDE.x - 12, SIDE.y + 186, SIDE.w + 24, 300, 14); ctx.stroke();
    ctx.restore();
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(22, 12, 28, .93)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(207, 167, 78, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 246 - i * 30;
    ctx.save();
    ctx.globalAlpha = i < S.shuttles ? 1 : .22;
    ctx.fillStyle = i < S.shuttles ? P.wood : '#5f5868';
    ctx.beginPath(); ctx.ellipse(x, HUD_H / 2, 13, 7, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = i < S.shuttles ? P.brassLt : '#807890';
    ctx.beginPath(); ctx.ellipse(x, HUD_H / 2, 5, 4, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(244, 236, 217, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
  const k = clamp(S.timeLeft / L().time, 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.beginPath(); rrPath(SCENE_W / 2 - 150, HUD_H - 8, 300, 6, 3); ctx.fill();
  ctx.fillStyle = k > .3 ? P.brass : P.bad;
  ctx.beginPath(); rrPath(SCENE_W / 2 - 150, HUD_H - 8, 300 * k, 6, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: SIDE.x, y: SIDE.y, w: SIDE.w, h: 172 }], .78);
    const h = tutCard(60, 300, 560,
      ['سفارش می‌گوید چند ردیف، و نقشهٔ یک ردیف کنارش هست:',
       'گره‌هایش با چینه نشان داده شده.'], 'کارگاهِ فرش');
    tutMore(340, 300 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: SIDE.x + 10, y: SIDE.y + 186, w: SIDE.w - 20, h: 300 },
          { x: leverKnob().x - 60, y: leverKnob().y - 80, w: 120, h: 160 }], .74);
    tutCard(40, 200, 580, ['خطّکشِ هر نخ را بکِش: رویِ‌هم چند تا لازم داری؟',
      'بعد اهرم را بکِش تا دار بافتن را شروع کند.']);
  } else {
    spot([{ x: LOOM.x, y: LOOM.y, w: LOOM.w, h: LOOM.h }], .74);
    const h = tutCard(636, 200, 540,
      ['هر ردیف به اندازهٔ نقشه نخ می‌خواهد.',
       'نخ کم بیاید، ردیف سوراخ می‌ماند و خودت می‌بینی کجا.',
       'نخِ زیادی هم هدر می‌رود.'], 'نخِ کم، ردیفِ سوراخ');
    tutMore(906, 200 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function rugIcon(x, y) {
  ctx.fillStyle = P.rugDk;
  ctx.beginPath(); rrPath(x - 62, y - 26, 124, 52, 6); ctx.fill();
  ctx.fillStyle = P.rug;
  ctx.beginPath(); rrPath(x - 58, y - 22, 116, 44, 5); ctx.fill();
  chipRow(x, y - 8, [0, 1, 2], .5, 4);
  chipRow(x, y + 12, [0, 1, 2], .5, 4);
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 800, h: 300, y: 128,
    paper: P.paper, band: P.rug, ink: P.ink, inkSoft: '#6c6280',
    icon: rugIcon,
    title: 'کارگاهِ فرش',
    body: 'سفارش می‌گوید چند ردیف، و نقشهٔ یک ردیف گره‌هایش را با چینه نشان می‌دهد.\nپیش از بافتن باید نخ سفارش بدهی: رویِ‌هم چند صدتایی، چند ده‌تایی، چند یکی؟\nنخ کم بیاید، ردیف سوراخ می‌ماند؛ زیاد بیاید، هدر می‌رود.',
    btn: BTN_GO, btnLabel: 'دار را ببند', btnHot: S.hover === BTN_GO,
    btnFill: '#8d3a3a', btnHotFill: '#a94a46',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#6c6280',
    icon: rugIcon,
    title: L().endless ? 'دار خوابید' : 'همهٔ فرش‌ها بافته شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ کارگاه‌ها را گرداندی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'سفارشِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#8d3a3a', btnHotFill: '#a94a46',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#6c6280',
    icon: (x, y) => {
      ctx.fillStyle = '#6d6580';
      ctx.beginPath(); ctx.ellipse(x - 40, y, 18, 9, 0, 0, TAU); ctx.fill();
      rugIcon(x + 34, y);
    },
    title: 'ماکوها تمام شد',
    body: 'امتیاز: ' + fa(S.score) + '\nبرای هر ردیف یک نقشه؛ رویِ‌هم چند تا؟',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#8d3a3a', btnHotFill: '#a94a46',
  });
}

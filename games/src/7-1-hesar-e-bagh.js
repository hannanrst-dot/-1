/*!
title: حصارِ باغ — حدس و آزمایش
bg: #17242b
*/

/* ═══════════════════════════════════════════════════════════════════════
   حصارِ باغ — ریاضی سوم، فصل ۷، درس ۱ (راهبردِ حدس و آزمایش)
   ───────────────────────────────────────────────────────────────────────
   مسئلهٔ کتاب: «مساحتِ یک مستطیل ۱۸ سانتی‌متر مربّع است. اندازهٔ ضلع‌ها را
   طوری پیدا کنید که محیطش ۲۲ شود.» راهِ حلّش هم در خودِ کتاب آمده:
   حدس بزن، آزمایش کن، حدست را بنویس.

   اینجا همان کار زمینی می‌شود. یک تکّه خاکِ شخم‌زده داری و باید باغچه‌ای
   بکِشی که:
     • دورش دقیقاً به اندازهٔ تخته‌های حصارِ توی انبار باشد (محیط)،
     • و درونش دقیقاً به اندازهٔ بذرهای توی کیسه جا بدهد (مساحت).

   گوشهٔ باغچه را بکِش تا بزرگ و کوچک شود؛ تخته‌ها دورش می‌چینند و بذرها
   درونش می‌افتند، پس محیط و مساحت را با چشم می‌شماری نه با فرمول.

   هر بار که دست را برداری، حدست در «دفترِ حدس» ثبت می‌شود: چه اندازه‌ای
   را آزمودی و کدام‌یک کم بود و کدام زیاد. دفتر جواب نمی‌دهد، فقط کارِ
   خودت را نگه می‌دارد — همان چیزی که کتاب می‌خواهد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  sky:   '#25414e', skyLo: '#16242c', skyHi: '#3d6472',
  hill:  '#1d3a36', hillLo: '#132724',
  soil:  '#5a4028', soilDk: '#332313', soilLt: '#7d5c3a',
  wood:  '#8a5f33', woodDk: '#4d3218', woodLt: '#b88752',
  plank: '#c99a5e', plankDk: '#8d6636', plankLt: '#e8c188',
  rock:  '#5b6a70', rockDk: '#39454a', rockLt: '#8b9aa0',
  seed:  '#8dbf5a', seedDk: '#4d7a2c', seedLt: '#c7e79a',
  glass: '#9fd4d8',
  brass: '#cfa74e', brassDk: '#8f7327', brassLt: '#f2dd99',
  paper: '#f4ead3', ink: '#2c3a3f', inkSoft: '#7c8e94',
  good:  '#63a56d', bad: '#cd5b45', gold: '#eab53f', sun: '#ffd489',
};

const CELL = 46, COLS = 13, ROWS = 7;
const FX = 300, FY = 150;
const FW = COLS * CELL, FH = ROWS * CELL;

const RACK = { x: 34, y: 150, w: 246, h: 550 };
const JAR  = { x: 920, y: 150, w: 246, h: 550 };
const NOTE = { x: 306, y: 492, w: 586, h: 252 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

const LEVELS = [
  { name: 'باغچهٔ اوّل', min: 2, max: 5, rocks: 0, time: 80, quota: 3,
    hint: 'گوشهٔ باغچه را بکِش تا اندازه‌اش عوض شود.' },
  { name: 'سنگِ وسطِ زمین', min: 2, max: 6, rocks: 2, time: 76, quota: 3,
    hint: 'باغچه نباید روی سنگ بیفتد؛ خودِ باغچه را جابه‌جا کن.' },
  { name: 'زمینِ سنگالخ', min: 3, max: 7, rocks: 4, time: 72, quota: 4,
    hint: 'گاهی فقط یک طرفِ اندازه جا می‌شود.' },
  { name: 'پیش از غروب', min: 3, max: 7, rocks: 6, time: 64, quota: 4,
    hint: 'حدس بزن، بیازما، دوباره حدس بزن.' },
  { name: 'تا آفتاب هست', min: 2, max: 7, rocks: 5, time: 66, endless: true,
    hint: 'تا آفتاب هست، باغچه بکِش.' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  tP: 0, tA: 0,            /* تخته‌های حصار و بذرها که داده شده */
  w: 2, h: 2, cx: 0, cy: 0, /* باغچهٔ فعلی: اندازه و گوشهٔ بالا-چپ */
  rocks: [],
  log: [],
  drag: null,
  grow: 0, bad: 0, badMsg: 0,
  timeLeft: 0, days: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  tries: 0,
  birds: [],
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const peri = () => 2 * (S.w + S.h);
const area = () => S.w * S.h;

function loadBest() { try { return +localStorage.getItem('hesar-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('hesar-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

/* ───────── دورِ تازه ───────── */

const cellFree = (x, y) => !S.rocks.some((r) => r.x === x && r.y === y);

/** آیا باغچه‌ای به این اندازه جایی در زمین جا می‌شود؟ */
function fits(w, h) {
  if (w > COLS || h > ROWS) return null;
  for (let y = 0; y + h <= ROWS; y++) {
    for (let x = 0; x + w <= COLS; x++) {
      let ok = true;
      for (let j = 0; j < h && ok; j++) for (let i = 0; i < w; i++) {
        if (!cellFree(x + i, y + j)) { ok = false; break; }
      }
      if (ok) return { x, y };
    }
  }
  return null;
}

function newRound() {
  const lv = L();
  for (let tries = 0; tries < 400; tries++) {
    const a = R(lv.min, lv.max), b = R(lv.min, lv.max);
    if (a === b) continue;
    if (a > ROWS || b > ROWS) continue;      /* هر دو چرخش باید در زمین جا شود */
    /* جایی برای جوابِ درست کنار می‌گذاریم و سنگ‌ها را بیرونش می‌ریزیم */
    const sw = Math.random() < .5 ? a : b, sh = sw === a ? b : a;
    const ox = R(0, COLS - sw), oy = R(0, ROWS - sh);
    const free = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (x >= ox && x < ox + sw && y >= oy && y < oy + sh) continue;
      free.push({ x, y });
    }
    if (free.length < lv.rocks) continue;
    const rocks = [];
    for (let k = 0; k < lv.rocks; k++) rocks.push(free.splice(R(0, free.length - 1), 1)[0]);
    S.rocks = rocks;
    S.tP = 2 * (a + b);
    S.tA = a * b;
    /* باغچه از کوچک‌ترین حالت شروع می‌شود؛ حدس زدن کارِ بچّه است */
    S.w = 2; S.h = 2;
    const start = fits(2, 2) || { x: 0, y: 0 };
    S.cx = start.x; S.cy = start.y;
    S.log = [];
    S.tries = 0;
    S.grow = 0; S.bad = 0;
    return;
  }
  S.rocks = [];
  S.tP = 22; S.tA = 18; S.w = 2; S.h = 2; S.cx = 0; S.cy = 0;
  S.log = []; S.tries = 0; S.grow = 0; S.bad = 0;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.days = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newRound();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

const cellX = (i) => FX + i * CELL;
const cellY = (j) => FY + j * CELL;
const plotBox = () => ({ x: cellX(S.cx), y: cellY(S.cy), w: S.w * CELL, h: S.h * CELL });
const handle = () => { const b = plotBox(); return { x: b.x + b.w, y: b.y + b.h, r: 26 }; };

/** آیا باغچه روی سنگ افتاده؟ */
function clear() {
  for (let j = 0; j < S.h; j++) for (let i = 0; i < S.w; i++) {
    if (!cellFree(S.cx + i, S.cy + j)) return false;
  }
  return true;
}

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.bad > 0) S.bad -= dt;
  if (S.badMsg > 0) S.badMsg -= dt;

  if (Math.random() < dt * .4 && S.birds.length < 4) {
    S.birds.push({ x: -40, y: 66 + Math.random() * 32, v: 60 + Math.random() * 70, f: Math.random() * 6 });
  }
  for (const b of S.birds) { b.x += b.v * dt; b.f += dt * 7; }
  S.birds = S.birds.filter((b) => b.x < SCENE_W + 60);

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.grow) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseDay('آفتاب غروب کرد!'); }
    }
    if (S.grow) { S.grow += dt; if (S.grow > 2.2) { newRound(); S.timeLeft = L().time; } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseDay(msg) {
  if (S.grow) return;
  S.days--;
  S.combo = 0;
  S.shake = .5;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.days <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newRound();
}

/** حدس را در دفتر می‌نویسیم — نه جواب، فقط کارِ خودِ بچّه. */
function record() {
  const e = { w: S.w, h: S.h, p: peri(), a: area() };
  const last = S.log[0];
  if (last && last.w === e.w && last.h === e.h) return;
  S.log.unshift(e);
  if (S.log.length > 4) S.log.pop();
  S.tries++;
}

function check() {
  if (S.grow || S.phase !== 'play') return;
  if (peri() !== S.tP || area() !== S.tA) return;
  if (!clear()) {
    S.bad = .8;
    if (S.badMsg <= 0) {
      S.badMsg = 4;
      sfx.nope();
      toast.say('اندازه درست است، امّا باغچه روی سنگ افتاده — جابه‌جایش کن یا بچرخانش.', 'bad');
    }
    return;
  }
  win();
}

function win() {
  S.grow = .001;
  S.drag = null;
  S.combo++;
  S.cleared++;
  record();
  const pts = 320 + S.tA * 8 + Math.round(S.timeLeft * 5) + Math.min(S.combo, 6) * 70 - Math.max(0, S.tries - 4) * 25;
  S.score += Math.max(100, pts);
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  const b = plotBox();
  bits.confetti(b.x + b.w / 2, b.y + b.h / 2, 44, [P.seedLt, P.seed, P.gold, '#fff']);
  sfx.win();
  toast.say('باغچه سبز شد!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

const cellOf = (p) => ({ x: Math.floor((p.x - FX) / CELL), y: Math.floor((p.y - FY) / CELL) });

function applySize(p) {
  const gx = Math.round((p.x - FX) / CELL), gy = Math.round((p.y - FY) / CELL);
  const w = clamp(gx - S.cx, 1, COLS);
  const h = clamp(gy - S.cy, 1, ROWS);
  /* اگر باغچه به لبهٔ زمین خورد، خودش عقب می‌رود؛ وگرنه بچّه گیر می‌کند */
  const cx = Math.min(S.cx, COLS - w), cy = Math.min(S.cy, ROWS - h);
  if (w !== S.w || h !== S.h || cx !== S.cx || cy !== S.cy) {
    S.w = w; S.h = h; S.cx = cx; S.cy = cy;
    sfx.tick(); check();
  }
}

function applyMove(p) {
  const gx = Math.round((p.x - S.drag.ax - FX) / CELL);
  const gy = Math.round((p.y - S.drag.ay - FY) / CELL);
  const cx = clamp(gx, 0, COLS - S.w), cy = clamp(gy, 0, ROWS - S.h);
  if (cx !== S.cx || cy !== S.cy) { S.cx = cx; S.cy = cy; sfx.tick(); check(); }
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.drag) {
    if (S.grow) return;                    /* باغچه سبز شده؛ دست نگه دار */
    if (S.drag.mode === 'size') applySize(p); else applyMove(p);
    return;
  }
  const b = plotBox();
  S.hover = inCircle(p, handle(), 6) ? 'size' : (inRect(p, b) ? 'move' : null);
  cv.style.cursor = S.hover === 'size' ? 'nwse-resize' : (S.hover === 'move' ? 'grab' : 'default');
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
  if (S.grow) return;
  const b = plotBox();
  if (inCircle(p, handle(), 8)) {
    S.drag = { mode: 'size' };
    sfx.tap();
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    return;
  }
  if (inRect(p, b)) {
    S.drag = { mode: 'move', ax: p.x - b.x, ay: p.y - b.y };
    sfx.tap();
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    return;
  }
  /* زدن روی خاکِ خالی: باغچه را همان‌جا می‌برد */
  if (p.x > FX && p.x < FX + FW && p.y > FY && p.y < FY + FH) {
    const c = cellOf(p);
    S.cx = clamp(c.x, 0, COLS - S.w); S.cy = clamp(c.y, 0, ROWS - S.h);
    sfx.tap(); check();
  }
});

cv.addEventListener('pointerup', () => {
  const d = S.drag;
  S.drag = null;
  if (!d || S.phase !== 'play' || S.grow) return;
  if (d.mode === 'size') { record(); if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; } }
});

cv.addEventListener('pointercancel', () => { S.drag = null; });

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
  if (o.stroke) { ctx.lineWidth = o.strokeWidth || 5; ctx.lineJoin = 'round';
    ctx.strokeStyle = o.stroke; ctx.strokeText(str, x, y); }
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(5, 12, 15, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(244, 234, 211, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '4, 10, 12');
  ctx.fillStyle = P.seedDk;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#5d6f76' }); yy += 30; }
  return h + 20;
}

/** تختهٔ حصار — افقی یا عمودی، با میخ‌ها. */
function plank(x1, y1, x2, y2, tk = 11) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  ctx.save();
  ctx.translate((x1 + x2) / 2, (y1 + y2) / 2);
  ctx.rotate(a);
  ctx.fillStyle = P.plankDk;
  ctx.beginPath(); rrPath(-len / 2 + 1, -tk / 2 + 2, len - 2, tk, 3); ctx.fill();
  const g = ctx.createLinearGradient(0, -tk / 2, 0, tk / 2);
  g.addColorStop(0, P.plankLt); g.addColorStop(.5, P.plank); g.addColorStop(1, P.plankDk);
  ctx.fillStyle = g;
  ctx.beginPath(); rrPath(-len / 2 + 1, -tk / 2, len - 2, tk, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(88, 56, 22, .35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-len / 2 + 5, 0); ctx.lineTo(len / 2 - 5, 0); ctx.stroke();
  ctx.fillStyle = 'rgba(60, 40, 18, .6)';
  for (const nx of [-len / 2 + 7, len / 2 - 7]) { ctx.beginPath(); ctx.arc(nx, 0, 1.6, 0, TAU); ctx.fill(); }
  ctx.restore();
}

/** نهالِ کوچک؛ k از ۰ تا ۱ رشدِ آن است. */
function sprout(x, y, k, seed) {
  const s = .82 + k * .62;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const sway = Math.sin(S.t * 1.8 + seed) * .1;
  ctx.rotate(sway);
  ctx.strokeStyle = P.seedDk; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.quadraticCurveTo(1, 2, 0, -8); ctx.stroke();
  ctx.fillStyle = P.seed;
  wobbleEllipse(-7, -4, 8, 5, -.5, seed, .8); ctx.fill();
  ctx.fillStyle = P.seedLt;
  wobbleEllipse(7, -8, 8, 5, .4, seed + 2, .8); ctx.fill();
  if (k > .7) {
    ctx.fillStyle = P.gold;
    star(0, -16, 6 * (k - .7) / .3, P.gold, S.t * .8 + seed);
  }
  ctx.restore();
}

function rockShape(x, y, seed) {
  contact(x, y + 15, 19, 6, .5);
  ctx.fillStyle = P.rockDk;
  wobbleCircle(x, y + 3, 17, seed, 3.2, 12); ctx.fill();
  ctx.fillStyle = ball(x - 6, y - 6, 26, P.rockLt, P.rock, P.rockDk);
  wobbleCircle(x, y, 16, seed, 3.2, 12); ctx.fill();
  ctx.fillStyle = 'rgba(120, 160, 110, .5)';
  wobbleEllipse(x + 5, y + 7, 8, 4, .2, seed + 1, .8); ctx.fill();
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintLandStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, 160);
  g.addColorStop(0, P.skyLo); g.addColorStop(.55, P.sky); g.addColorStop(1, P.skyHi);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, 160);
  /* تپّه‌های دور، سه لایه */
  for (let L2 = 0; L2 < 3; L2++) {
    const base = 100 + L2 * 13, amp = 20 - L2 * 5;
    ctx.fillStyle = L2 === 2 ? P.hill : shade(P.hillLo, .06 * L2);
    ctx.beginPath();
    ctx.moveTo(-10, base);
    for (let x = -10; x <= SCENE_W + 10; x += 30) {
      ctx.lineTo(x, base - Math.sin(x * .006 + L2 * 2.1) * amp - Math.sin(x * .014 + L2) * amp * .4);
    }
    ctx.lineTo(SCENE_W + 10, 200); ctx.lineTo(-10, 200);
    ctx.closePath(); ctx.fill();
  }
  /* مه روی دامنه */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const mg = ctx.createLinearGradient(0, 92, 0, 146);
  mg.addColorStop(0, 'rgba(150, 190, 200, 0)');
  mg.addColorStop(.5, 'rgba(150, 190, 200, .2)');
  mg.addColorStop(1, 'rgba(150, 190, 200, 0)');
  ctx.fillStyle = mg;
  ctx.fillRect(0, 92, SCENE_W, 54);
  ctx.restore();

  /* زمینِ روستا */
  ctx.fillStyle = shade(P.hill, -.3);
  ctx.fillRect(0, 126, SCENE_W, SCENE_H - 126);
  ctx.save();
  ctx.globalAlpha = .5;
  ctx.fillStyle = texStone('#20342f', '#2f4a42');
  ctx.fillRect(0, 126, SCENE_W, SCENE_H - 126);
  ctx.restore();
  const lg = ctx.createLinearGradient(0, 126, 0, SCENE_H);
  lg.addColorStop(0, 'rgba(255, 214, 150, .14)');
  lg.addColorStop(1, 'rgba(0, 0, 0, .42)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 126, SCENE_W, SCENE_H - 126);

  /* خاکِ شخم‌زدهٔ زمینِ کاشت */
  ctx.fillStyle = P.soilDk;
  ctx.beginPath(); rrPath(FX - 16, FY - 16, FW + 32, FH + 32, 14); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(FX - 10, FY - 10, FW + 20, FH + 20, 10); ctx.clip();
  ctx.fillStyle = P.soil;
  ctx.fillRect(FX - 10, FY - 10, FW + 20, FH + 20);
  ctx.save();
  ctx.globalAlpha = .3;
  ctx.fillStyle = texStone(P.soil, P.soilLt);
  ctx.fillRect(FX - 10, FY - 10, FW + 20, FH + 20);
  ctx.restore();
  /* کلوخه‌ها: هرکدام یک تیرگی و یک برقِ ریز */
  for (let k = 0; k < 460; k++) {
    const x = FX - 10 + noise1(k * 1.7) * (FW + 20), y = FY - 10 + noise1(k * 3.1 + 5) * (FH + 20);
    const r = 2.4 + noise1(k) * 4.6, rot = noise1(k * .7) * 3;
    ctx.fillStyle = 'rgba(38, 24, 10, .34)';
    ctx.beginPath(); ctx.ellipse(x, y + 1.5, r, r * .7, rot, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(160, 122, 76, .3)';
    ctx.beginPath(); ctx.ellipse(x - r * .2, y - r * .2, r * .7, r * .48, rot, 0, TAU); ctx.fill();
  }
  /* شیارهای شخم */
  ctx.strokeStyle = 'rgba(40, 26, 12, .2)'; ctx.lineWidth = 4;
  for (let y = FY + 4; y < FY + FH; y += 17) {
    ctx.beginPath();
    for (let x = FX - 10; x < FX + FW + 12; x += 16) {
      ctx.lineTo(x, y + Math.sin(x * .035 + y * .3) * 3 + noise1(x * .1 + y) * 2);
    }
    ctx.stroke();
  }
  const sg = ctx.createLinearGradient(0, FY - 10, 0, FY + FH + 10);
  sg.addColorStop(0, 'rgba(255, 226, 176, .16)');
  sg.addColorStop(1, 'rgba(0,0,0,.34)');
  ctx.fillStyle = sg;
  ctx.fillRect(FX - 10, FY - 10, FW + 20, FH + 20);
  ctx.restore();
  /* شبکهٔ کرت‌ها */
  ctx.strokeStyle = 'rgba(255, 226, 176, .12)'; ctx.lineWidth = 1.4;
  for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(cellX(i), FY); ctx.lineTo(cellX(i), FY + FH); ctx.stroke(); }
  for (let j = 0; j <= ROWS; j++) { ctx.beginPath(); ctx.moveTo(FX, cellY(j)); ctx.lineTo(FX + FW, cellY(j)); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(30, 18, 8, .6)'; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(FX - 10, FY - 10, FW + 20, FH + 20, 10); ctx.stroke();

  /* میزِ چوبیِ دفتر */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(NOTE.x - 18, NOTE.y - 14, NOTE.w + 36, NOTE.h + 30, 12); ctx.fill();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.beginPath(); rrPath(NOTE.x - 12, NOTE.y - 8, NOTE.w + 24, NOTE.h + 20, 9); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.fillRect(NOTE.x - 12, NOTE.y + NOTE.h + 4, NOTE.w + 24, 8);
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.sky);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('land', SCENE_W, SCENE_H, paintLandStatic), 0, 0, SCENE_W, SCENE_H);
  drawSun();
  drawBirds();
  drawRocks();
  drawPlot();
  drawRack();
  drawJar();
  drawNote();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.1, 'rgba(4, 10, 13, .48)', .38, .15);
}

/** آفتاب، هم چراغِ صحنه است هم ساعتِ بازی. */
function drawSun() {
  const k = 1 - clamp(S.timeLeft / L().time, 0, 1);
  const x = lerp(110, 1090, k), y = 104 - Math.sin(k * Math.PI) * 34;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 4, x, y, 130);
  g.addColorStop(0, 'rgba(255, 212, 137, .55)');
  g.addColorStop(1, 'rgba(255, 212, 137, 0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, 130, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = k > .8 ? '#ff9a5e' : P.sun;
  ctx.beginPath(); ctx.arc(x, y, 24, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.beginPath(); ctx.arc(x - 7, y - 8, 8, 0, TAU); ctx.fill();
  /* غروب: صحنه سرد و تاریک می‌شود */
  if (k > .55) {
    ctx.fillStyle = `rgba(30, 14, 40, ${(k - .55) * .5})`;
    ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  }
}

function drawBirds() {
  ctx.strokeStyle = 'rgba(20, 30, 34, .55)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (const b of S.birds) {
    const f = Math.sin(b.f) * 6;
    ctx.beginPath();
    ctx.moveTo(b.x - 9, b.y + f); ctx.quadraticCurveTo(b.x, b.y - 4, b.x + 9, b.y + f);
    ctx.stroke();
  }
}

function drawRocks() {
  for (let i = 0; i < S.rocks.length; i++) {
    const r = S.rocks[i];
    rockShape(cellX(r.x) + CELL / 2, cellY(r.y) + CELL / 2, i * 3 + 1);
  }
}

function fenceSegs() {
  const b = plotBox(), s = [];
  for (let i = 0; i < S.w; i++) s.push([b.x + i * CELL, b.y, b.x + (i + 1) * CELL, b.y]);
  for (let j = 0; j < S.h; j++) s.push([b.x + b.w, b.y + j * CELL, b.x + b.w, b.y + (j + 1) * CELL]);
  for (let i = S.w - 1; i >= 0; i--) s.push([b.x + (i + 1) * CELL, b.y + b.h, b.x + i * CELL, b.y + b.h]);
  for (let j = S.h - 1; j >= 0; j--) s.push([b.x, b.y + (j + 1) * CELL, b.x, b.y + j * CELL]);
  return s;
}

function drawPlot() {
  const b = plotBox();
  const ok = clear();
  const grow = S.grow ? clamp(S.grow / 1.2, 0, 1) : 0;

  /* کفِ باغچه */
  ctx.save();
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 6); ctx.clip();
  ctx.fillStyle = 'rgba(120, 90, 48, .45)';
  ctx.fillRect(b.x, b.y, b.w, b.h);
  if (!ok) {
    ctx.fillStyle = `rgba(205, 91, 69, ${.3 + (S.bad > 0 ? .22 * Math.abs(Math.sin(S.t * 12)) : .06 * Math.sin(S.t * 3))})`;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }
  ctx.restore();
  if (!ok) {
    ctx.save();
    ctx.strokeStyle = P.bad; ctx.lineWidth = 5; ctx.setLineDash([12, 8]);
    ctx.lineDashOffset = -S.t * 26;
    ctx.beginPath(); rrPath(b.x - 5, b.y - 5, b.w + 10, b.h + 10, 8); ctx.stroke();
    ctx.restore();
  }

  /* بذرهای کاشته‌شده: تا سقفِ کیسه نهال، بعدش گودالِ خالی */
  const n = S.w * S.h;
  for (let k = 0; k < n; k++) {
    const i = k % S.w, j = Math.floor(k / S.w);
    const x = b.x + i * CELL + CELL / 2, y = b.y + j * CELL + CELL / 2;
    if (k < S.tA) sprout(x, y + 6, grow, k * 1.7);
    else {
      ctx.fillStyle = 'rgba(24, 12, 4, .6)';
      ctx.beginPath(); ctx.ellipse(x, y + 8, 11, 6, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = P.bad; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x, y + 8, 11, 6, 0, 0, TAU); ctx.stroke();
    }
  }

  /* حصار: تا وقتی تخته هست، بعدش جای خالی */
  const segs = fenceSegs();
  for (let k = 0; k < segs.length; k++) {
    const s = segs[k];
    if (k < S.tP) plank(s[0], s[1], s[2], s[3]);
    else {
      ctx.save();
      ctx.strokeStyle = P.bad; ctx.lineWidth = 4; ctx.setLineDash([7, 7]);
      ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); ctx.stroke();
      ctx.restore();
    }
  }
  /* تیرک‌های گوشه */
  for (const [px, py] of [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]]) {
    ctx.fillStyle = P.woodDk;
    ctx.beginPath(); ctx.arc(px, py + 2, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = ball(px - 2, py - 2, 12, P.woodLt, P.wood, P.woodDk);
    ctx.beginPath(); ctx.arc(px, py, 6.5, 0, TAU); ctx.fill();
  }

  /* دستگیرهٔ گوشه — با آن باغچه را بزرگ و کوچک می‌کنی */
  const hd = handle();
  const hot = S.hover === 'size' || (S.drag && S.drag.mode === 'size');
  ctx.save();
  ctx.globalAlpha = .35 + .25 * Math.sin(S.t * 4);
  ctx.fillStyle = P.gold;
  ctx.beginPath(); ctx.arc(hd.x, hd.y, hot ? 26 : 21, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); ctx.arc(hd.x, hd.y + 2, 14, 0, TAU); ctx.fill();
  ctx.fillStyle = ball(hd.x - 4, hd.y - 4, 24, P.brassLt, P.brass, P.brassDk);
  ctx.beginPath(); ctx.arc(hd.x, hd.y, 13, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#3a2b0c'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hd.x - 5, hd.y - 5); ctx.lineTo(hd.x + 5, hd.y + 5);
  ctx.moveTo(hd.x + 5, hd.y - 1); ctx.lineTo(hd.x + 5, hd.y + 5); ctx.lineTo(hd.x - 1, hd.y + 5);
  ctx.stroke();

  /* اندازهٔ باغچه، کنارِ خودش */
  const lw = 108, lx = clamp(b.x + b.w / 2 - lw / 2, FX, FX + FW - lw);
  ctx.fillStyle = 'rgba(8, 16, 18, .82)';
  ctx.beginPath(); rrPath(lx, b.y - 40, lw, 32, 9); ctx.fill();
  ctx.strokeStyle = 'rgba(207, 167, 78, .5)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); rrPath(lx, b.y - 40, lw, 32, 9); ctx.stroke();
  numText(fa(S.w) + ' × ' + fa(S.h), lx + lw / 2, b.y - 23, { size: 22, color: P.brassLt });
}

/** انبارِ تخته: هرچه حصار بلندتر، انبار خالی‌تر. */
function drawRack() {
  const left = S.tP - peri();
  ctx.fillStyle = 'rgba(10, 18, 20, .5)';
  ctx.beginPath(); rrPath(RACK.x, RACK.y, RACK.w, RACK.h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(200, 154, 94, .35)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(RACK.x, RACK.y, RACK.w, RACK.h, 14); ctx.stroke();
  /* پایه‌های چوبی */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(RACK.x + 16, RACK.y + 96, 14, RACK.h - 120, 5); ctx.fill();
  ctx.beginPath(); rrPath(RACK.x + RACK.w - 30, RACK.y + 96, 14, RACK.h - 120, 5); ctx.fill();

  text('انبارِ تخته', RACK.x + RACK.w / 2, RACK.y + 26, { size: 22, family: 'Lalezar', color: P.plankLt });
  text('دورِ باغچه', RACK.x + RACK.w / 2, RACK.y + 50, { size: 14, color: 'rgba(232, 193, 136, .6)' });

  /* تخته‌های باقی‌مانده، از پایین چیده */
  const bx = RACK.x + 40, bw = RACK.w - 80;
  const rby = RACK.y + 140, rbh = RACK.h - 172;
  ctx.save();
  ctx.beginPath(); rrPath(bx - 12, rby, bw + 24, rbh, 10); ctx.clip();
  ctx.fillStyle = shade(P.woodDk, -.35);
  ctx.fillRect(bx - 12, rby, bw + 24, rbh);
  ctx.fillStyle = texWood(shade(P.wood, -.42), shade(P.woodDk, -.3));
  ctx.fillRect(bx - 12, rby, bw + 24, rbh);
  ctx.strokeStyle = 'rgba(0,0,0,.32)'; ctx.lineWidth = 3;
  for (let x = bx - 12; x < bx + bw + 24; x += 34) {
    ctx.beginPath(); ctx.moveTo(x, rby); ctx.lineTo(x, rby + rbh); ctx.stroke();
  }
  const rg = ctx.createLinearGradient(0, rby, 0, rby + rbh);
  rg.addColorStop(0, 'rgba(0,0,0,.5)'); rg.addColorStop(1, 'rgba(0,0,0,.12)');
  ctx.fillStyle = rg; ctx.fillRect(bx - 12, rby, bw + 24, rbh);
  ctx.restore();
  ctx.strokeStyle = 'rgba(120, 80, 36, .5)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(bx - 12, rby, bw + 24, rbh, 10); ctx.stroke();
  const show = clamp(left, 0, 30);
  for (let k = 0; k < show; k++) {
    const y = RACK.y + RACK.h - 34 - k * 14;
    plank(bx, y, bx + bw, y, 10);
  }
  /* شمارنده */
  const short = left < 0;
  const cy = RACK.y + 100;
  ctx.fillStyle = short ? 'rgba(150, 42, 28, .9)' : (left === 0 ? 'rgba(60, 120, 74, .9)' : 'rgba(8, 16, 18, .8)');
  ctx.beginPath(); rrPath(RACK.x + 30, cy - 24, RACK.w - 60, 48, 12); ctx.fill();
  ctx.strokeStyle = short ? P.bad : (left === 0 ? P.good : 'rgba(200, 154, 94, .4)'); ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(RACK.x + 30, cy - 24, RACK.w - 60, 48, 12); ctx.stroke();
  if (left === 0) text('تمام شد', RACK.x + RACK.w / 2, cy, { size: 22, family: 'Lalezar', color: '#eafbe9' });
  else {
    text(short ? 'کم داری' : 'مانده', RACK.x + RACK.w - 52, cy, { size: 15, color: short ? '#ffd9cf' : 'rgba(232, 193, 136, .7)', align: 'right' });
    numText(fa(Math.abs(left)), RACK.x + 74, cy + 1, { size: 26, color: short ? '#ffd9cf' : P.plankLt });
  }
}

/** کیسهٔ بذر: هر کرت یک نهال می‌خورد. */
function drawJar() {
  const left = S.tA - area();
  ctx.fillStyle = 'rgba(10, 18, 20, .5)';
  ctx.beginPath(); rrPath(JAR.x, JAR.y, JAR.w, JAR.h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(141, 191, 90, .3)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(JAR.x, JAR.y, JAR.w, JAR.h, 14); ctx.stroke();

  text('کیسهٔ بذر', JAR.x + JAR.w / 2, JAR.y + 26, { size: 22, family: 'Lalezar', color: P.seedLt });
  text('درونِ باغچه', JAR.x + JAR.w / 2, JAR.y + 50, { size: 14, color: 'rgba(199, 231, 154, .6)' });

  /* شیشهٔ بذر */
  const gx = JAR.x + 42, gw = JAR.w - 84, gy = JAR.y + 122, gh = RACK.h - 172;
  ctx.fillStyle = 'rgba(140, 200, 205, .12)';
  ctx.beginPath(); rrPath(gx, gy, gw, gh, 16); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(gx + 3, gy + 3, gw - 6, gh - 6, 13); ctx.clip();
  const show = clamp(left, 0, 45);
  const per = 5, rw = (gw - 22) / per;
  for (let k = 0; k < show; k++) {
    const c = k % per, r = Math.floor(k / per);
    const x = gx + 11 + rw * (c + .5), y = gy + gh - 18 - r * 24;
    ctx.fillStyle = P.seedDk;
    ctx.beginPath(); ctx.ellipse(x, y + 2, 8, 6, .4, 0, TAU); ctx.fill();
    ctx.fillStyle = ball(x - 3, y - 3, 14, P.seedLt, P.seed, P.seedDk);
    ctx.beginPath(); ctx.ellipse(x, y, 8, 6, .4, 0, TAU); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(159, 212, 216, .55)'; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(gx, gy, gw, gh, 16); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ctx.beginPath(); rrPath(gx + 10, gy + 14, 12, gh - 40, 6); ctx.fill();

  const short = left < 0;
  const cy = JAR.y + 100;
  ctx.fillStyle = short ? 'rgba(150, 42, 28, .9)' : (left === 0 ? 'rgba(60, 120, 74, .9)' : 'rgba(8, 16, 18, .8)');
  ctx.beginPath(); rrPath(JAR.x + 30, cy - 24, JAR.w - 60, 48, 12); ctx.fill();
  ctx.strokeStyle = short ? P.bad : (left === 0 ? P.good : 'rgba(141, 191, 90, .4)'); ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(JAR.x + 30, cy - 24, JAR.w - 60, 48, 12); ctx.stroke();
  if (left === 0) text('تمام شد', JAR.x + JAR.w / 2, cy, { size: 22, family: 'Lalezar', color: '#eafbe9' });
  else {
    text(short ? 'کم داری' : 'مانده', JAR.x + JAR.w - 52, cy, { size: 15, color: short ? '#ffd9cf' : 'rgba(199, 231, 154, .7)', align: 'right' });
    numText(fa(Math.abs(left)), JAR.x + 74, cy + 1, { size: 26, color: short ? '#ffd9cf' : P.seedLt });
  }
}

/** دفترِ حدس — کتاب می‌گوید حدس‌ها را بنویس؛ اینجا خودش نوشته می‌شود. */
function drawNote() {
  paper(NOTE.x, NOTE.y, NOTE.w, NOTE.h, P.paper, 61, 10, .34);
  ctx.strokeStyle = 'rgba(120, 100, 60, .28)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(NOTE.x + 22, NOTE.y + 10); ctx.lineTo(NOTE.x + 22, NOTE.y + NOTE.h - 10); ctx.stroke();
  text('دفترِ حدس', NOTE.x + NOTE.w - 26, NOTE.y + 28, { size: 22, family: 'Lalezar', color: P.ink, align: 'right' });
  text('اندازه', NOTE.x + NOTE.w - 96, NOTE.y + 60, { size: 14, color: P.inkSoft, align: 'right' });
  text('حصار', NOTE.x + 330, NOTE.y + 60, { size: 14, color: P.inkSoft });
  text('بذر', NOTE.x + 150, NOTE.y + 60, { size: 14, color: P.inkSoft });
  ctx.strokeStyle = 'rgba(120, 100, 60, .3)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(NOTE.x + 34, NOTE.y + 74); ctx.lineTo(NOTE.x + NOTE.w - 22, NOTE.y + 74); ctx.stroke();

  if (!S.log.length) {
    text('گوشهٔ باغچه را بکِش؛ هر حدس همین‌جا نوشته می‌شود.', NOTE.x + NOTE.w / 2, NOTE.y + 140,
      { size: 16, color: 'rgba(44, 58, 63, .45)' });
    return;
  }
  for (let i = 0; i < S.log.length; i++) {
    const e = S.log[i], y = NOTE.y + 106 + i * 40;
    ctx.save();
    ctx.globalAlpha = 1 - i * .18;
    numText(fa(e.w) + ' × ' + fa(e.h), NOTE.x + NOTE.w - 96, y, { size: 24, color: P.ink });
    noteChip(NOTE.x + 330, y, e.p, S.tP);
    noteChip(NOTE.x + 150, y, e.a, S.tA);
    ctx.restore();
  }
}

function noteChip(cx, y, val, target) {
  const ok = val === target;
  const word = ok ? 'درست' : (val < target ? 'کم' : 'زیاد');
  const col = ok ? P.good : P.bad;
  ctx.fillStyle = ok ? 'rgba(99, 165, 109, .18)' : 'rgba(205, 91, 69, .14)';
  ctx.beginPath(); rrPath(cx - 78, y - 17, 156, 34, 9); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 1.6;
  ctx.beginPath(); rrPath(cx - 78, y - 17, 156, 34, 9); ctx.stroke();
  numText(fa(val), cx - 40, y + 1, { size: 21, color: P.ink });
  text(word, cx + 46, y + 1, { size: 16, family: 'Lalezar', color: col });
}

function drawHUD() {
  ctx.fillStyle = 'rgba(9, 20, 24, .92)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(141, 191, 90, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 206 - i * 32;
    ctx.save();
    ctx.globalAlpha = i < S.days ? 1 : .22;
    ctx.fillStyle = i < S.days ? P.sun : '#5f6a6d';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, 10, 0, TAU); ctx.fill();
    ctx.strokeStyle = i < S.days ? P.sun : '#5f6a6d'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * TAU;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 13, HUD_H / 2 + Math.sin(a) * 13);
      ctx.lineTo(x + Math.cos(a) * 17, HUD_H / 2 + Math.sin(a) * 17);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(244, 234, 211, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: RACK.x, y: RACK.y, w: RACK.w, h: RACK.h }, { x: JAR.x, y: JAR.y, w: JAR.w, h: JAR.h }], .76);
    const h = tutCard(320, 250, 560,
      ['این‌همه تخته و این‌همه بذر داری — نه یکی کم، نه یکی زیاد.',
       'باغچه‌ای بکِش که هر دو را تمام کند.'], 'حصارِ باغ');
    tutMore(600, 250 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: FX - 12, y: FY - 12, w: FW + 24, h: FH + 24 }], .7);
    tutCard(330, 540, 540, ['گوشهٔ طلاییِ باغچه را بکِش تا بزرگ و کوچک شود.',
      'تخته‌ها دورش می‌چینند و نهال‌ها درونش می‌نشینند.']);
  } else {
    spot([{ x: NOTE.x, y: NOTE.y, w: NOTE.w, h: NOTE.h }], .72);
    const h = tutCard(320, 160, 560,
      ['هر حدس که می‌زنی، همین‌جا نوشته می‌شود:',
       'کدام کم بود و کدام زیاد.', 'با همین‌ها حدسِ بعدی را بهتر بزن.'], 'دفترِ حدس');
    tutMore(600, 160 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function gardenIcon(x, y) {
  plank(x - 62, y + 22, x + 62, y + 22, 12);
  sprout(x - 34, y + 14, 1, 1);
  sprout(x, y + 16, 1, 4);
  sprout(x + 34, y + 14, 1, 7);
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 780, h: 300, y: 128,
    paper: P.paper, band: P.seedDk, ink: P.ink, inkSoft: '#5d6f76',
    icon: gardenIcon,
    title: 'حصارِ باغ',
    body: 'انبار این‌قدر تختهٔ حصار دارد و کیسه این‌قدر بذر — نه یکی کم، نه یکی زیاد.\nباغچه‌ای بکِش که دورش همهٔ تخته‌ها و درونش همهٔ بذرها را تمام کند.\nگوشهٔ طلایی را بکِش، بیازما، و از دفترِ حدس کمک بگیر.',
    btn: BTN_GO, btnLabel: 'برو سرِ زمین', btnHot: S.hover === BTN_GO,
    btnFill: '#4d7a2c', btnHotFill: '#5f9438',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#5d6f76',
    icon: gardenIcon,
    title: L().endless ? 'آفتاب رفت' : 'همهٔ باغچه‌ها سبز شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ زمین‌ها را کاشتی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'زمینِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#4d7a2c', btnHotFill: '#5f9438',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#5d6f76',
    icon: (x, y) => { rockShape(x - 26, y + 14, 2); rockShape(x + 24, y + 18, 5);
      plank(x - 50, y + 34, x + 50, y + 34, 10); },
    title: 'روزها تمام شد',
    body: 'امتیاز: ' + fa(S.score) + '\nاز دفترِ حدس کمک بگیر: کدام کم بود، کدام زیاد.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#4d7a2c', btnHotFill: '#5f9438',
  });
}

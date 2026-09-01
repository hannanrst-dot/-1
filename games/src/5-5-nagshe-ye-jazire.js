/*!
title: نقشهٔ جزیره — واحدِ اندازه‌گیریِ سطح
bg: #2f2015
*/

/* ═══════════════════════════════════════════════════════════════════════
   نقشهٔ جزیره — ریاضی سوم، فصل ۵، درس ۵ (واحدِ اندازه‌گیریِ سطح)
   ───────────────────────────────────────────────────────────────────────
   درسِ صفحهٔ ۹۱ دو حرف دارد:
     ۱) مساحتِ یک شکلِ کج‌ومعوج یک عدد نیست؛ «بینِ دو عدد» است — آن‌هایی
        که کاملاً تویش‌اند، و آن‌هایی که فقط لبه‌شان را گرفته.
     ۲) هرچه واحد ریزتر باشد، این دو عدد به هم نزدیک‌ترند، یعنی
        اندازه‌گیری دقیق‌تر است.

   پس بازی این شد: نقشه‌بردارِ کشتی هستی. جزیره‌ای پیدا شده و باید
   مساحتش در دفترِ ناخدا ثبت شود. اوّل یکی از سه «قابِ شبکه» را روی نقشه
   می‌گذاری — درشت، میانه، ریز — بعد با دو مداد رنگ می‌زنی:

     • مدادِ طلایی برای خانه‌ای که کاملاً روی جزیره است.
     • مدادِ راه‌راه برای خانه‌ای که فقط لبه‌اش روی جزیره است.

   قابِ درشت زود تمام می‌شود ولی فاصلهٔ دو عدد زیاد است؛ قابِ ریز وقت
   می‌برد ولی ثبتش دقیق است و ناخدا بیشتر می‌دهد. انتخابْ خودِ درس است.

   عددِ مساحت هیچ‌جا از پیش نوشته نمی‌شود؛ دو عددِ آخر همان چیزی است که
   خودِ بچّه رنگ زده.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  desk:   '#3a281c', deskLt: '#513829', deskDk: '#241710',
  paper:  '#f2e3c0', paperDk: '#dcc79a', paperLt: '#fbf1d8',
  ink:    '#3b3020', inkSoft: '#8d7a56',
  sea:    '#9cc6d4', seaDk: '#79aabd', seaLine: 'rgba(60, 110, 130, .28)',
  sand:   '#e3c98c', sandDk: '#c9a86a', palm: '#6d9350', palmDk: '#4e7038',
  gold:   '#e5ab3c', goldDk: '#b8812a', goldLt: '#ffd97e',
  stripe: '#b98a48', stripeDk: '#8d6430',
  brass:  '#cba64f', brassDk: '#9a7930', brassLt: '#e8cd82',
  lamp:   '#ffcf7a',
  good:   '#5f9a70', bad: '#c9563f',
};

/* سه قابِ شبکه — همان «واحدهای اندازه‌گیریِ سطح» */
const FRAMES = [
  { id: 'big', n: 'درشت', c: 160 },
  { id: 'mid', n: 'میانه', c: 80 },
  { id: 'fin', n: 'ریز',  c: 40 },
];

const LEVELS = [
  { name: 'خلیجِ آرام', rMin: 72, rMax: 84, wob: .14, time: 64, quota: 3,
    hint: 'اوّل یک قابِ شبکه را روی نقشه بگذار.' },
  { name: 'جزیرهٔ کج', rMin: 76, rMax: 88, wob: .2, time: 62, quota: 3,
    hint: 'خانه‌ای که فقط لبه‌اش روی جزیره است، راه‌راه می‌شود.' },
  { name: 'دریای بزرگ', rMin: 78, rMax: 92, wob: .24, time: 60, quota: 4,
    hint: 'قابِ ریزتر وقت می‌برد، ولی ثبتش دقیق‌تر است.' },
  { name: 'تنگهٔ توفان', rMin: 76, rMax: 92, wob: .3, time: 54, quota: 4,
    hint: 'جزیره‌ها ناجورتر شده‌اند و آب دارد بالا می‌آید.' },
  { name: 'تا سپیده‌دم', rMin: 72, rMax: 92, wob: .28, time: 54, endless: true,
    hint: 'تا مدّ نرسیده، هرچه جزیره هست ثبت کن.' },
];

const HUD_H = 52;
const CHART = { x: 360, y: 172, w: 480, h: 320 };
const LEFT  = { x: 22, y: 82, w: 292, h: 500 };
const RIGHT = { x: 886, y: 82, w: 292, h: 500 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  isle: null,            // { cx, cy, R, a[], p[] }
  frame: null,           // قابِ انتخاب‌شده
  cells: [],             // { c, r, x, y, s, kind: 0 بیرون|1 نیمه|2 پُر, mark: 0|1|2, bad }
  tool: 2,               // ۲ طلایی، ۱ راه‌راه
  full: 0, part: 0,      // پاسخِ درست (برای بررسی، نه نمایش)
  stage: 'grid',         // grid → mark → done
  record: null,
  timeLeft: 0,
  flag: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  done: 0, gulls: [],
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];

function loadBest() { try { return +localStorage.getItem('jazire-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('jazire-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 5; i++) S.gulls.push({ x: Math.random() * SCENE_W, y: 70 + Math.random() * 40,
  sp: 18 + Math.random() * 26, ph: Math.random() * TAU });
whenFontsReady(() => runLoop(step));

/* ───────── جزیره ───────── */

/** شعاعِ جزیره در زاویهٔ داده‌شده — پس «تویِ جزیره بودن» یک مقایسهٔ ساده است. */
function isleR(is, th) {
  let k = 1;
  for (let i = 0; i < is.a.length; i++) k += is.a[i] * Math.sin((i + 2) * th + is.p[i]);
  return is.R * k;
}
function inIsle(is, x, y) {
  const dx = x - is.cx, dy = y - is.cy;
  return Math.hypot(dx, dy) <= isleR(is, Math.atan2(dy, dx));
}
/** فاصلهٔ شعاعی تا لبه — مثبت یعنی داخل. برای اطمینان از «آشکار بودنِ» حالتِ هر خانه. */
function isleMargin(is, x, y) {
  const dx = x - is.cx, dy = y - is.cy;
  return isleR(is, Math.atan2(dy, dx)) - Math.hypot(dx, dy);
}

function makeIsle() {
  const lv = L();
  const n = 3;
  const a = [], p = [];
  for (let i = 0; i < n; i++) { a.push((Math.random() * 2 - 1) * lv.wob / (i + 1)); p.push(Math.random() * TAU); }
  /* مرکزِ جزیره را نزدیکِ گوشهٔ خانه‌های قابِ درشت می‌گذاریم تا جزیره
     همیشه از هر دو خطِ درشت رد شود؛ وگرنه قابِ درشت گاهی الکی «دقیق»
     درمی‌آید و درسِ «ریزتر یعنی دقیق‌تر» به هم می‌ریزد. */
  const big = FRAMES[0].c;
  const xs = [], ys = [];
  for (let x = big; x < CHART.w; x += big) xs.push(x);
  for (let y = big; y < CHART.h; y += big) ys.push(y);
  return {
    cx: CHART.x + xs[Math.floor(Math.random() * xs.length)] + (Math.random() * 2 - 1) * 16,
    cy: CHART.y + ys[Math.floor(Math.random() * ys.length)] + (Math.random() * 2 - 1) * 14,
    R: lv.rMin + Math.random() * (lv.rMax - lv.rMin), a, p,
  };
}

/** نیم‌پهنای خطِ ساحل. قاعده با چشم دیدنی است: خانه‌ای که خطِ ساحل از
    تویش رد شود «نیمه» است، وگرنه یا کاملاً روی جزیره است یا بیرون. */
const COAST = 4;

function classify(is, cell) {
  const out = [];
  const cols = Math.round(CHART.w / cell), rows = Math.round(CHART.h / cell);
  const N = 10;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = CHART.x + c * cell, y = CHART.y + r * cell;
    let mMin = 1e9, mMax = -1e9;
    for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
      const m = isleMargin(is, x + cell * i / N, y + cell * j / N);
      if (m < mMin) mMin = m;
      if (m > mMax) mMax = m;
    }
    const kind = mMin >= COAST ? 2 : (mMax <= -COAST ? 0 : 1);
    out.push({ c, r, x, y, s: cell, kind, mark: 0, bad: 0 });
  }
  return out;
}

function newChart() {
  for (let tries = 0; tries < 200; tries++) {
    const is = makeIsle();
    /* جزیره باید کاملاً توی نقشه بماند */
    let fits = true;
    for (let i = 0; i < 64; i++) {
      const th = i * TAU / 64, rr = isleR(is, th);
      const x = is.cx + Math.cos(th) * rr, y = is.cy + Math.sin(th) * rr;
      if (x < CHART.x + 16 || x > CHART.x + CHART.w - 16 || y < CHART.y + 16 || y > CHART.y + CHART.h - 16) { fits = false; break; }
    }
    if (!fits) continue;
    /* هر قاب باید دستِ‌کم یک خانهٔ نیمه داشته باشد، وگرنه درس بی‌معنی است */
    if (!FRAMES.every((f) => classify(is, f.c).some((q) => q.kind === 1))) continue;
    S.isle = is;
    S.frame = null;
    S.cells = [];
    S.stage = 'grid';
    S.record = null;
    S.tool = 2;
    S.done = 0;
    return;
  }
  S.isle = { cx: CHART.x + CHART.w / 2, cy: CHART.y + CHART.h / 2, R: 110, a: [0, 0, 0], p: [0, 0, 0] };
  S.frame = null; S.cells = []; S.stage = 'grid'; S.record = null; S.tool = 2; S.done = 0;
}

function chooseFrame(f) {
  S.frame = f;
  S.cells = classify(S.isle, f.c);
  S.full = S.cells.filter((q) => q.kind === 2).length;
  S.part = S.cells.filter((q) => q.kind === 1).length;
  S.stage = 'mark';
  sfx.tone(460, .14, 'triangle', .06);
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.flag = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newChart();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  for (const q of S.cells) if (q.bad > 0) q.bad -= dt;
  for (const g of S.gulls) { g.x += g.sp * dt; if (g.x > SCENE_W + 30) { g.x = -30; g.y = 66 + Math.random() * 40; } }

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.done) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseFlag('مدّ رسید! نقشه خیس شد.'); }
    }
    if (S.done) { S.done += dt; if (S.done > 2.2) { S.done = 0; newChart(); } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseFlag(msg) {
  S.flag--;
  S.combo = 0;
  S.shake = .4;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.flag <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newChart();
}

/** پهنای نادانستگی، به پیکسلِ مربع — هرچه کمتر، ثبت دقیق‌تر. */
const bandArea = () => S.part * S.frame.c * S.frame.c;

function finish() {
  if (S.done) return;
  S.done = .001;
  S.combo++;
  S.cleared++;
  const band = bandArea();
  const worst = 5 * 160 * 160;
  const acc = clamp(1 - band / worst, 0, 1);
  const pts = 200 + Math.round(1400 * acc) + Math.round(S.timeLeft * 4) + Math.min(S.combo, 6) * 60;
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  S.record = { lo: S.full, hi: S.full + S.part, unit: S.frame.n, acc };
  bits.confetti(CHART.x + CHART.w / 2, CHART.y + CHART.h / 2, 44,
    [P.gold, P.brass, '#fff', P.sand]);
  sfx.win();
  if (S.frame.id === 'big') toast.say('ثبت شد. با قابِ ریزتر، فاصلهٔ دو عدد کمتر می‌شد.', 'info');
  else if (S.frame.id === 'fin') toast.say('ثبتِ دقیق! ناخدا راضی است.', 'good');
  else toast.say('ثبت شد.', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

function checkDone() {
  for (const q of S.cells) if (q.mark !== q.kind) return;
  finish();
}

/* ───────── ورودی ───────── */

function frameBox(i) {
  return { x: LEFT.x + 22, y: LEFT.y + 78 + i * 134, w: LEFT.w - 44, h: 116 };
}
function toolBox(i) {
  return { x: LEFT.x + 22, y: LEFT.y + 96 + i * 144, w: LEFT.w - 44, h: 124 };
}
function cellAt(p) {
  if (!S.frame) return null;
  if (p.x < CHART.x || p.x > CHART.x + CHART.w || p.y < CHART.y || p.y > CHART.y + CHART.h) return null;
  const c = Math.floor((p.x - CHART.x) / S.frame.c), r = Math.floor((p.y - CHART.y) / S.frame.c);
  return S.cells.find((q) => q.c === c && q.r === r) || null;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  S.hover = null;
  if (S.stage === 'grid') {
    for (let i = 0; i < 3; i++) if (inRect(p, frameBox(i))) S.hover = i;
    cv.style.cursor = S.hover !== null ? 'pointer' : 'default';
  } else {
    for (let i = 0; i < 2; i++) if (inRect(p, toolBox(i))) S.hover = 'tool' + i;
    cv.style.cursor = (S.hover || cellAt(p)) ? 'pointer' : 'default';
  }
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
  if (S.done) return;
  if (tutTap(S.tut, TUT_TAP, TUT_LAST)) return;

  if (S.stage === 'grid') {
    for (let i = 0; i < 3; i++) if (inRect(p, frameBox(i))) {
      chooseFrame(FRAMES[i]);
      if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
      return;
    }
    return;
  }
  for (let i = 0; i < 2; i++) if (inRect(p, toolBox(i))) {
    S.tool = i === 0 ? 2 : 1;
    sfx.tap();
    return;
  }
  const q = cellAt(p);
  if (!q) return;
  if (q.mark === S.tool) { q.mark = 0; sfx.tone(240, .07, 'sine', .04); return; }
  if (S.tool !== q.kind) {
    q.bad = .5; S.shake = .1; sfx.nope();
    S.timeLeft = Math.max(2, S.timeLeft - 2);
    return;
  }
  q.mark = S.tool;
  sfx.tone(S.tool === 2 ? 520 : 380, .07, 'triangle', .045);
  checkDone();
});

const TUT_TAP = [0, 2], TUT_LAST = 2;

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
  ctx.fillStyle = `rgba(14, 8, 4, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(251, 241, 216, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '10, 6, 2');
  ctx.fillStyle = P.brassDk;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6f5c3c' }); yy += 30; }
  return h + 20;
}

function islePath(is) {
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const th = i * TAU / 120, rr = isleR(is, th);
    const x = is.cx + Math.cos(th) * rr, y = is.cy + Math.sin(th) * rr;
    ctx[i ? 'lineTo' : 'moveTo'](x, y);
  }
  ctx.closePath();
}

function stripes(x, y, w, h, col, gap) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = col; ctx.lineWidth = 3;
  for (let d = -h; d < w; d += gap) {
    ctx.beginPath(); ctx.moveTo(x + d, y + h); ctx.lineTo(x + d + h, y); ctx.stroke();
  }
  ctx.restore();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.desk);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 9;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  drawDesk();
  drawChart();
  drawLeft();
  drawRight();
  drawRecord();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    ctx.save();
    ctx.translate(CHART.x + CHART.w / 2 - SCENE_W / 2, 0);
    toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
    ctx.restore();
  }
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.14, 'rgba(8, 4, 2, .52)');
}

function drawDesk() {
  const g = ctx.createRadialGradient(SCENE_W / 2, 300, 80, SCENE_W / 2, 340, 780);
  g.addColorStop(0, P.deskLt);
  g.addColorStop(1, P.deskDk);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  /* رگهٔ چوب */
  ctx.save();
  ctx.globalAlpha = .1;
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
  for (let i = 0; i < 22; i++) {
    ctx.beginPath();
    const y0 = 60 + i * 34;
    ctx.moveTo(0, y0);
    for (let x = 0; x <= SCENE_W; x += 40) ctx.lineTo(x, y0 + Math.sin(x * .006 + i) * 7);
    ctx.stroke();
  }
  ctx.restore();
  /* مرغِ دریایی */
  ctx.strokeStyle = 'rgba(240, 226, 192, .3)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (const g2 of S.gulls) {
    const f = Math.sin(S.t * 4 + g2.ph) * 5;
    ctx.beginPath();
    ctx.moveTo(g2.x - 10, g2.y + f); ctx.quadraticCurveTo(g2.x, g2.y - 5, g2.x + 10, g2.y + f);
    ctx.stroke();
  }
}

function drawChart() {
  const b = CHART;
  withShadow(30, 12, .5, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x - 18, b.y - 18, b.w + 36, b.h + 36, 8, 11, 2.6); ctx.fill();
  }, '8, 4, 2');
  /* دریا */
  ctx.fillStyle = P.sea;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.save();
  ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
  ctx.strokeStyle = P.seaLine; ctx.lineWidth = 2;
  for (let i = 0; i < 22; i++) {
    ctx.beginPath();
    const y0 = b.y + 12 + i * 20;
    ctx.moveTo(b.x, y0);
    for (let x = b.x; x <= b.x + b.w; x += 20) ctx.lineTo(x, y0 + Math.sin(x * .05 + i * 1.3) * 3.5);
    ctx.stroke();
  }
  /* جزیره */
  if (S.isle) {
    const is = S.isle;
    ctx.fillStyle = P.seaDk;
    ctx.save(); ctx.translate(4, 5); islePath(is); ctx.fill(); ctx.restore();
    ctx.fillStyle = P.sandDk; islePath(is); ctx.fill();
    ctx.save();
    islePath(is); ctx.clip();
    ctx.fillStyle = P.sand;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const th = i * TAU / 120, rr = isleR(is, th) - 9;
      ctx[i ? 'lineTo' : 'moveTo'](is.cx + Math.cos(th) * rr, is.cy + Math.sin(th) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.palmDk;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const th = i * TAU / 120, rr = isleR(is, th) * .62 + Math.sin(th * 3 + 1) * 8;
      ctx[i ? 'lineTo' : 'moveTo'](is.cx + Math.cos(th) * rr, is.cy + Math.sin(th) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.palm;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const th = i * TAU / 120, rr = isleR(is, th) * .58 + Math.sin(th * 3 + 1) * 8;
      ctx[i ? 'lineTo' : 'moveTo'](is.cx + Math.cos(th) * rr - 2, is.cy + Math.sin(th) * rr - 3);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
    /* خطِ ساحل — همان چیزی که «نیمه» بودن را معلوم می‌کند */
    ctx.strokeStyle = '#4a3a22'; ctx.lineWidth = COAST * 2;
    islePath(is); ctx.stroke();
    ctx.strokeStyle = '#8d6b3a'; ctx.lineWidth = 2;
    islePath(is); ctx.stroke();
  }
  ctx.restore();

  /* رنگ‌آمیزیِ خانه‌ها */
  for (const q of S.cells) {
    if (q.mark === 2) {
      ctx.fillStyle = 'rgba(229, 171, 60, .62)';
      ctx.fillRect(q.x + 1, q.y + 1, q.s - 2, q.s - 2);
      ctx.strokeStyle = P.goldDk; ctx.lineWidth = 2.4;
      ctx.strokeRect(q.x + 2, q.y + 2, q.s - 4, q.s - 4);
    } else if (q.mark === 1) {
      ctx.fillStyle = 'rgba(185, 138, 72, .3)';
      ctx.fillRect(q.x + 1, q.y + 1, q.s - 2, q.s - 2);
      stripes(q.x + 2, q.y + 2, q.s - 4, q.s - 4, 'rgba(141, 100, 48, .65)', 12);
      ctx.strokeStyle = P.stripeDk; ctx.lineWidth = 2;
      ctx.strokeRect(q.x + 2, q.y + 2, q.s - 4, q.s - 4);
    }
    if (q.bad > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(q.bad * 2, 0, 1);
      ctx.fillStyle = 'rgba(201, 86, 63, .5)';
      ctx.fillRect(q.x + 1, q.y + 1, q.s - 2, q.s - 2);
      ctx.restore();
    }
  }

  /* قابِ شبکه */
  if (S.frame) {
    ctx.save();
    ctx.strokeStyle = 'rgba(58, 40, 28, .5)'; ctx.lineWidth = 1.6;
    const c = S.frame.c;
    for (let x = b.x; x <= b.x + b.w + .5; x += c) { ctx.beginPath(); ctx.moveTo(x, b.y); ctx.lineTo(x, b.y + b.h); ctx.stroke(); }
    for (let y = b.y; y <= b.y + b.h + .5; y += c) { ctx.beginPath(); ctx.moveTo(b.x, y); ctx.lineTo(b.x + b.w, y); ctx.stroke(); }
    ctx.restore();
  }

  /* قابِ برنجیِ دورِ نقشه */
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 6;
  ctx.strokeRect(b.x - 3, b.y - 3, b.w + 6, b.h + 6);
  ctx.strokeStyle = P.brass; ctx.lineWidth = 2.4;
  ctx.strokeRect(b.x - 3, b.y - 3, b.w + 6, b.h + 6);

  /* گلِ قطب‌نما */
  const cx = b.x + b.w - 46, cy = b.y + b.h - 46;
  ctx.save();
  ctx.globalAlpha = .3;
  ctx.strokeStyle = P.ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, 22, 0, TAU); ctx.stroke();
  ctx.fillStyle = P.ink;
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20);
    ctx.lineTo(cx + Math.cos(a + 2.4) * 7, cy + Math.sin(a + 2.4) * 7);
    ctx.lineTo(cx + Math.cos(a - 2.4) * 7, cy + Math.sin(a - 2.4) * 7);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/** ستونِ چپ: یا سه قابِ شبکه، یا دو مداد. */
function drawLeft() {
  const b = LEFT;
  withShadow(20, 9, .45, () => {
    ctx.fillStyle = P.paperDk;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 21, 2.2); ctx.fill();
  }, '8, 4, 2');
  ctx.fillStyle = P.brassDk;
  wobbleRect(b.x, b.y, b.w, 10, 5, 23, 1); ctx.fill();

  if (S.stage === 'grid') {
    text('کدام قابِ شبکه؟', b.x + b.w / 2, b.y + 40, { size: 22, family: 'Lalezar', color: P.ink });
    for (let i = 0; i < FRAMES.length; i++) {
      const f = FRAMES[i], r = frameBox(i), hot = S.hover === i;
      const dy = hot ? 3 : 0;
      withShadow(hot ? 16 : 8, hot ? 5 : 3, .3, () => {
        ctx.fillStyle = hot ? P.paperLt : P.paper;
        wobbleRect(r.x, r.y + dy, r.w, r.h, 12, r.y, 1.4); ctx.fill();
      }, '8, 4, 2');
      /* یک خانهٔ همین قاب، با نسبتِ واقعی نسبت به بقیه */
      const s = f.c * .42;
      const gx0 = r.x + 20, gy0 = r.y + r.h / 2 - s / 2 + dy;
      ctx.fillStyle = 'rgba(156, 198, 212, .55)';
      ctx.fillRect(gx0, gy0, s, s);
      ctx.strokeStyle = 'rgba(58, 40, 28, .6)'; ctx.lineWidth = 1.8;
      ctx.strokeRect(gx0, gy0, s, s);
      text(f.n, r.x + r.w - 26, r.y + r.h / 2 - 12 + dy, { size: 25, family: 'Lalezar', color: P.ink, align: 'right' });
      text(f.id === 'big' ? 'زود، ولی سرانگشتی' : (f.id === 'fin' ? 'کُند، ولی دقیق' : 'میانه'),
        r.x + r.w - 26, r.y + r.h / 2 + 16 + dy, { size: 14, color: P.inkSoft, align: 'right' });
    }
    return;
  }

  text('مدادها', b.x + b.w / 2, b.y + 42, { size: 22, family: 'Lalezar', color: P.ink });
  const tools = [
    { k: 2, n: 'کاملاً روی جزیره', sub: 'طلایی' },
    { k: 1, n: 'فقط لبه‌اش', sub: 'راه‌راه' },
  ];
  tools.forEach((t, i) => {
    const r = toolBox(i), on = S.tool === t.k, hot = S.hover === 'tool' + i;
    const dy = hot && !on ? 2 : 0;
    withShadow(on ? 16 : 7, on ? 5 : 3, .3, () => {
      ctx.fillStyle = on ? P.paperLt : P.paper;
      wobbleRect(r.x, r.y + dy, r.w, r.h, 12, r.y, 1.4); ctx.fill();
    }, '8, 4, 2');
    if (on) { ctx.strokeStyle = P.brassDk; ctx.lineWidth = 3.4;
      wobbleRect(r.x, r.y + dy, r.w, r.h, 12, r.y, 1.4); ctx.stroke(); }
    /* نمونهٔ رنگ */
    const sx = r.x + 20, sy = r.y + 22 + dy;
    if (t.k === 2) {
      ctx.fillStyle = 'rgba(229, 171, 60, .62)';
      ctx.fillRect(sx, sy, 56, 56);
      ctx.strokeStyle = P.goldDk; ctx.lineWidth = 2.6; ctx.strokeRect(sx, sy, 56, 56);
    } else {
      ctx.fillStyle = 'rgba(185, 138, 72, .3)';
      ctx.fillRect(sx, sy, 56, 56);
      stripes(sx, sy, 56, 56, 'rgba(141, 100, 48, .65)', 12);
      ctx.strokeStyle = P.stripeDk; ctx.lineWidth = 2.2; ctx.strokeRect(sx, sy, 56, 56);
    }
    text(t.n, r.x + r.w - 20, r.y + r.h / 2 - 10 + dy, { size: 19, color: P.ink, align: 'right' });
    text(t.sub, r.x + r.w - 20, r.y + r.h / 2 + 16 + dy, { size: 14, color: P.inkSoft, align: 'right' });
  });
  text('روی خانه بزن. دوباره بزنی، پاک می‌شود.', b.x + b.w / 2, b.y + b.h - 34,
    { size: 14, color: P.inkSoft });
}

/** ستونِ راست: ناخدا، قابِ انتخاب‌شده، و مدّ آب. */
function drawRight() {
  const b = RIGHT;
  withShadow(20, 9, .45, () => {
    ctx.fillStyle = P.paperDk;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 31, 2.2); ctx.fill();
  }, '8, 4, 2');
  ctx.fillStyle = P.brassDk;
  wobbleRect(b.x, b.y, b.w, 10, 5, 33, 1); ctx.fill();
  text('دفترِ ناخدا', b.x + b.w / 2, b.y + 40, { size: 22, family: 'Lalezar', color: P.ink });

  /* ناخدا */
  const cx = b.x + b.w / 2, hy = b.y + 108;
  const bob = Math.sin(S.t * 1.8) * 2;
  ctx.fillStyle = '#2f4a63';
  ctx.beginPath();
  ctx.moveTo(cx - 34, hy - 12 + bob); ctx.quadraticCurveTo(cx, hy - 34 + bob, cx + 34, hy - 12 + bob);
  ctx.quadraticCurveTo(cx, hy - 6 + bob, cx - 34, hy - 12 + bob); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f2d7b3';
  wobbleCircle(cx, hy + 10 + bob, 19, 5, 1.2); ctx.fill();
  ctx.fillStyle = '#3d2a16';
  ctx.beginPath(); ctx.arc(cx - 7, hy + 6 + bob, 2.6, 0, TAU); ctx.arc(cx + 7, hy + 6 + bob, 2.6, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8d7a56';
  ctx.beginPath(); ctx.ellipse(cx, hy + 20 + bob, 15, 7, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#2f4a63';
  wobbleRect(cx - 26, hy + 30 + bob, 52, 34, 8, 9, 1.2); ctx.fill();

  if (S.frame) {
    text('قابِ ' + S.frame.n, cx, b.y + 196, { size: 21, family: 'Lalezar', color: P.ink });
    ctx.fillStyle = 'rgba(58, 40, 28, .08)';
    ctx.beginPath(); rrPath(b.x + 20, b.y + 214, b.w - 40, 88, 12); ctx.fill();
    const s = S.frame.c * .42;
    const gx0 = cx - s / 2, gy0 = b.y + 258 - s / 2;
    ctx.fillStyle = 'rgba(156, 198, 212, .55)';
    ctx.fillRect(gx0, gy0, s, s);
    ctx.strokeStyle = 'rgba(58, 40, 28, .6)'; ctx.lineWidth = 1.8;
    ctx.strokeRect(gx0, gy0, s, s);
  } else {
    textWrap('جزیره‌ای پیدا شده.\nمساحتش را ثبت کن.', cx, b.y + 200, b.w - 50,
      { size: 17, color: P.inkSoft, lineHeight: 26 });
  }

  /* مدّ آب = وقت */
  const k = clamp(S.timeLeft / L().time, 0, 1);
  const gy1 = b.y + b.h - 118, gh = 92;
  ctx.fillStyle = 'rgba(58, 40, 28, .14)';
  ctx.beginPath(); rrPath(b.x + 26, gy1, b.w - 52, gh, 12); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(b.x + 26, gy1, b.w - 52, gh, 12); ctx.clip();
  const wh = gh * (1 - k);
  ctx.fillStyle = k < .3 ? '#c9563f' : P.seaDk;
  ctx.fillRect(b.x + 26, gy1 + gh - wh, b.w - 52, wh);
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.beginPath();
  ctx.moveTo(b.x + 26, gy1 + gh - wh);
  for (let x = 0; x <= b.w - 52; x += 12) ctx.lineTo(b.x + 26 + x, gy1 + gh - wh + Math.sin(x * .09 + S.t * 3) * 3);
  ctx.lineTo(b.x + b.w - 26, gy1 + gh - wh + 5); ctx.lineTo(b.x + 26, gy1 + gh - wh + 5);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  text(k < .3 ? 'آب دارد بالا می‌آید!' : 'تا مدّ آب', cx, gy1 - 16,
    { size: 15, color: k < .3 ? '#a8402c' : P.inkSoft });
}

/** ثبتِ نهایی: «مساحت بین … و … است» — از روی همان چیزی که رنگ زده. */
function drawRecord() {
  if (!S.record) return;
  const t = S.done;
  const k = easeOut(clamp(t / .4, 0, 1));
  const w = 620, h = 116, x = SCENE_W / 2 - w / 2, y = 606;
  ctx.save();
  ctx.globalAlpha = k;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = P.paperLt;
    wobbleRect(x, y, w, h, 14, 51, 2.2); ctx.fill();
  }, '8, 4, 2');
  ctx.fillStyle = P.brassDk;
  wobbleRect(x, y, w, 9, 4, 53, 1); ctx.fill();
  text('در دفترِ ناخدا ثبت شد', x + w / 2, y + 32, { size: 17, color: P.inkSoft });
  const R = S.record;
  text('مساحتِ جزیره بین', x + w / 2 + 152, y + 74, { size: 22, family: 'Lalezar', color: P.ink });
  numText(fa(R.lo), x + w / 2 + 40, y + 74, { size: 38, color: P.goldDk });
  text('و', x + w / 2 - 6, y + 74, { size: 22, family: 'Lalezar', color: P.ink });
  numText(fa(R.hi), x + w / 2 - 56, y + 74, { size: 38, color: P.stripeDk });
  text(R.unit + ' است', x + w / 2 - 158, y + 74, { size: 22, family: 'Lalezar', color: P.ink });
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = 'rgba(30, 18, 10, .88)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(203, 166, 79, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  /* پرچم‌ها = جان */
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 208 - i * 32;
    ctx.save();
    ctx.globalAlpha = i < S.flag ? 1 : .22;
    ctx.strokeStyle = i < S.flag ? P.brassLt : '#8d8577'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(x - 8, HUD_H / 2 - 13); ctx.lineTo(x - 8, HUD_H / 2 + 13); ctx.stroke();
    ctx.fillStyle = i < S.flag ? '#c9563f' : '#8d8577';
    ctx.beginPath(); ctx.moveTo(x - 6, HUD_H / 2 - 12); ctx.lineTo(x + 12, HUD_H / 2 - 6);
    ctx.lineTo(x - 6, HUD_H / 2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.brassLt });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.brassLt });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.brassLt, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(242, 227, 192, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.brassLt, align: 'left' });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([CHART], .74);
    const h = tutCard(300, 556, 600,
      ['جزیره‌ای پیدا شده و باید مساحتش ثبت شود.', 'ولی لبه‌اش کج است و درست روی خانه‌ها نمی‌افتد.'], 'نقشهٔ جزیره');
    tutMore(600, 556 + h + 10, S.t, P.ink);
  } else if (st === 1) {
    spot([LEFT], .7);
    tutCard(330, 566, 540, ['یک قابِ شبکه بردار.',
      'درشت زود تمام می‌شود، ریز دقیق‌تر است.']);
  } else {
    spot([CHART, LEFT], .66);
    const h = tutCard(300, 548, 600,
      ['طلایی: خانه‌ای که کاملاً روی جزیره است.', 'راه‌راه: خانه‌ای که فقط لبه‌اش روی جزیره است.',
       'آخرش می‌بینی مساحت بینِ دو عدد است.'], 'دو مداد');
    tutMore(600, 548 + h + 10, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function compassIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.brassDk;
  wobbleCircle(0, 0, 28, 3, 1.4); ctx.fill();
  ctx.fillStyle = P.paperLt;
  wobbleCircle(0, 0, 23, 5, 1.2); ctx.fill();
  ctx.fillStyle = '#c9563f';
  ctx.beginPath(); ctx.moveTo(0, -19); ctx.lineTo(6, 0); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3b3020';
  ctx.beginPath(); ctx.moveTo(0, 19); ctx.lineTo(6, 0); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 760, h: 286, y: 138,
    paper: P.paperLt, band: P.brassDk, ink: P.ink, inkSoft: '#7f6c48',
    icon: compassIcon,
    title: 'نقشهٔ جزیره',
    body: 'لبهٔ جزیره کج است و درست روی خانه‌ها نمی‌افتد.\nپس مساحتش یک عدد نیست: بینِ دو عدد است.\nقابِ شبکه را انتخاب کن و با دو مداد رنگ بزن.',
    btn: BTN_GO, btnLabel: 'برو سرِ نقشه', btnHot: S.hover === BTN_GO,
    btnFill: '#9a7930', btnHotFill: '#b18f3d',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paperLt, band: P.brass, ink: P.ink, inkSoft: '#7f6c48',
    icon: compassIcon,
    title: L().endless ? 'دفتر پر شد' : 'همهٔ جزیره‌ها ثبت شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ دریاها را گشتی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'دریای بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#9a7930', btnHotFill: '#b18f3d',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paperLt, band: P.bad, ink: P.ink, inkSoft: '#7f6c48',
    icon: (x, y) => { ctx.fillStyle = P.seaDk;
      ctx.beginPath(); ctx.moveTo(x - 34, y + 14);
      for (let i = 0; i <= 8; i++) ctx.lineTo(x - 34 + i * 8.5, y + 14 + Math.sin(i * 1.1) * 7);
      ctx.lineTo(x + 34, y + 26); ctx.lineTo(x - 34, y + 26); ctx.closePath(); ctx.fill(); },
    title: 'مدّ آب رسید',
    body: 'امتیاز: ' + fa(S.score) + '\nقابِ درشت‌تر زودتر تمام می‌شود.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#9a7930', btnHotFill: '#b18f3d',
  });
}

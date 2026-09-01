/*!
title: معدنِ فیروزه — خاصیت‌های ضرب
bg: #0d1418
*/

/* ═══════════════════════════════════════════════════════════════════════
   معدنِ فیروزه — ریاضی سوم، فصل ۴، درس ۴ (خاصیت‌های ضرب)
   ───────────────────────────────────────────────────────────────────────
   درسِ کتاب «شکستنِ ضرب» است: ۷×۸ را نمی‌دانی، ولی ۷×۵ و ۷×۳ را می‌دانی،
   پس ۷×۸ = (۷×۵) + (۷×۳). این کار یک فعلِ فیزیکیِ روشن دارد — بریدن — و
   همین شد قلبِ بازی.

   ولی این‌بار اوّل بازی ساخته شد، بعد درس تویش گذاشته شد:

     سنگ‌های فیروزه از سقفِ معدن پایین می‌آیند. سنگی که نتوانی نامش را
     ببری، واگن را می‌شکند. برای نام بردن باید تیشه بزنی و آن را به
     تکّه‌هایی بشکنی که بلدی.

   پس نه سؤال هست، نه دکمهٔ «تحویل». تهدید از بالا می‌آید و وقت دارد تمام
   می‌شود؛ تنها راهِ نجات، شکستنِ ضرب است. هرچه با تکّه‌های کمتر بشکنی،
   فیروزهٔ بیشتری گیرت می‌آید.

   کارتِ «بلدی‌ها» گوشهٔ صحنه است: ×۱، ×۲، ×۵، ×۱۰. هر تکّه‌ای که یک ضلعش
   یکی از این‌هاست، بلدی حساب می‌شود. بقیه را باید بشکنی.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const KNOWN = [1, 2, 5, 10];
const CELL = 30;

const P = {
  rockHi:  '#2a3942',
  rockLo:  '#0b1114',
  seam:    'rgba(120, 200, 210, .06)',
  wood:    '#7a5230',
  woodLit: '#9a6c40',
  woodDk:  '#4e3219',
  iron:    '#4a545c',
  ironLit: '#6d7982',
  rail:    '#5d6a72',
  gem:     '#3fb0bd',
  gemDk:   '#25808c',
  gemLit:  '#7fe0e8',
  gemBad:  '#a86a7a',
  gemBadDk:'#7d4657',
  lamp:    '#ffd07a',
  glow:    'rgba(255, 200, 110, .16)',
  paper:   '#f4ead6',
  ink:     '#22303a',
  inkSoft: '#6f8290',
  brass:   '#d3a349',
  good:    '#6fa85c',
  bad:     '#cf5f4a',
  gold:    '#f0c552',
};

const LEVELS = [
  { name: 'رگهٔ اوّل', lo: 3, hi: 6, speed: 20, max: 1, quota: 6, gap: 4.2,
    hint: 'تیشه بزن و سنگ را به تکّه‌هایی بشکن که بلدی.' },
  { name: 'رگهٔ دوم', lo: 3, hi: 8, speed: 25, max: 2, quota: 8, gap: 3.6,
    hint: 'دو سنگ با هم می‌آیند. عجله کن.' },
  { name: 'رگهٔ عمیق', lo: 4, hi: 9, speed: 30, max: 2, quota: 10, gap: 3.2,
    hint: 'سنگ‌ها بزرگ‌تر شده‌اند.' },
  { name: 'شبِ معدن', lo: 3, hi: 9, speed: 36, max: 3, quota: 12, gap: 2.6,
    hint: 'سه سنگ هم‌زمان. تکّهٔ کمتر، فیروزهٔ بیشتر.' },
  { name: 'معدنِ بی‌پایان', lo: 3, hi: 9, speed: 30, max: 3, endless: true, gap: 2.8,
    hint: 'تا وقتی واگن سالم است، بکَن.' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  blocks: [],
  spawnT: 0,
  cleared: 0, quota: 0,
  speed: 0,
  hearts: 3,
  score: 0, best: 0, combo: 0,
  cracks: [],            // خرده‌سنگ‌های پرنده
  banner: null,          // { txt, t } نمایشِ شکستنِ ضرب
  log: [],               // چند شکستنِ آخر، برای دفترِ گوشهٔ صحنه
  shakeC: 0,             // لرزشِ واگن
  t: 0, phaseT: 0,
  hover: null,
  shake: 0,
  dust: [],
  floats: [],
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];

function loadBest() { try { return +localStorage.getItem('madan-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('madan-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── چیدمان ───────── */

const HUD_H = 52;
const SHAFT = { x: 322, y: 62, w: 560, h: 566 };
const CART = { x: 322, y: 630, w: 560, h: 86 };
const KCARD = { x: 26, y: 88, w: 272, h: 252 };
const LOGC = { x: 906, y: 88, w: 268, h: 260 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/** آیا این تکّه را «بلدیم»؟ یعنی یک ضلعش توی کارتِ بلدی‌هاست. */
const known = (w, h) => KNOWN.indexOf(w) >= 0 || KNOWN.indexOf(h) >= 0;
const pieceW = (p) => p.c1 - p.c0;
const pieceH = (p) => p.r1 - p.r0;
const solved = (b) => b.pieces.every((p) => known(pieceW(p), pieceH(p)));

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 30; i++) {
  S.dust.push({ x: Math.random() * SCENE_W, y: Math.random() * SCENE_H,
                ph: Math.random() * TAU, sp: .2 + Math.random() * .5, r: .8 + Math.random() * 1.6 });
}
whenFontsReady(() => runLoop(step));

/** سنگی می‌سازد که با حداکثر دو تیشه شکستنی باشد. */
function makeBlock() {
  const lv = L();
  for (let tries = 0; tries < 40; tries++) {
    const rows = lv.lo + Math.floor(Math.random() * (lv.hi - lv.lo + 1));
    const cols = lv.lo + Math.floor(Math.random() * (lv.hi - lv.lo + 1));
    if (known(cols, rows)) continue;              // خیلی ساده، حوصله‌سربر
    if (minCuts(rows, cols, 3) > 2) continue;     // خیلی سخت برای سنگِ در حالِ سقوط
    const maxC = Math.floor(SHAFT.w / CELL);
    const cx = Math.floor(Math.random() * (maxC - cols + 1));
    return {
      rows, cols, cx,
      y: -rows * CELL - 10,
      pieces: [{ r0: 0, c0: 0, r1: rows, c1: cols }],
      t: 0, dead: false, hitT: 0,
    };
  }
  return { rows: 2, cols: 7, cx: 3, y: -80, pieces: [{ r0: 0, c0: 0, r1: 2, c1: 7 }], t: 0, dead: false, hitT: 0 };
}

/** کمترین تعدادِ تیشه‌ای که این مستطیل را به تکّه‌های بلد می‌رساند. */
function minCuts(h, w, cap) {
  if (known(w, h)) return 0;
  if (cap <= 0) return 99;
  let best = 99;
  for (let k = 1; k < w; k++) {
    const a = minCuts(h, k, cap - 1), b = minCuts(h, w - k, cap - 1 - a);
    best = Math.min(best, 1 + a + b);
  }
  for (let k = 1; k < h; k++) {
    const a = minCuts(k, w, cap - 1), b = minCuts(h - k, w, cap - 1 - a);
    best = Math.min(best, 1 + a + b);
  }
  return best;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.blocks = [];
  S.spawnT = .8;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.speed = lv.speed;
  S.combo = 0;
  S.banner = null;
  S.log = [];
  if (!keep) S.hearts = 3;
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  toast.say(lv.hint, 'info');
}

function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 24 }); }

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.shakeC > 0) S.shakeC -= dt;
  if (S.banner) { S.banner.t += dt; if (S.banner.t > 2.4) S.banner = null; }

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen) {
      S.spawnT -= dt;
      if (S.spawnT <= 0 && S.blocks.length < L().max) {
        S.blocks.push(makeBlock());
        S.spawnT = L().gap;
      }
      if (L().endless) S.speed += dt * .55;         // معدن هرچه جلوتر، تندتر
      for (const b of S.blocks) {
        b.t += dt;
        b.y += S.speed * dt;
        if (b.hitT > 0) b.hitT -= dt;
        if (b.y + b.rows * CELL >= CART.y + 10 && !b.dead) crush(b);
      }
      S.blocks = S.blocks.filter((b) => !b.dead);
    }
    if (S.tut.on) tutStep(dt);
  }

  for (const c of S.cracks) { c.t += dt; c.vy += 900 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt; }
  S.cracks = S.cracks.filter((c) => c.t < 1.3);
  for (const d of S.dust) { d.ph += dt * d.sp; d.y += dt * (6 + d.sp * 10); d.x += Math.sin(d.ph) * dt * 8;
    if (d.y > SCENE_H + 10) { d.y = -10; d.x = Math.random() * SCENE_W; } }
  for (const f of S.floats) { f.t += dt; f.y -= 44 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.5);
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── تیشه ───────── */

function blockRect(b) {
  return { x: SHAFT.x + b.cx * CELL, y: b.y, w: b.cols * CELL, h: b.rows * CELL };
}

/** نزدیک‌ترین خطِ داخلیِ همین تکّه به جایی که انگشت خورده. */
function chop(p) {
  if (S.phase !== 'play') return;
  for (const b of S.blocks) {
    const R = blockRect(b);
    if (p.x < R.x || p.x > R.x + R.w || p.y < R.y || p.y > R.y + R.h) continue;
    const col = (p.x - R.x) / CELL, row = (p.y - R.y) / CELL;
    const pi = b.pieces.findIndex((q) => col >= q.c0 && col <= q.c1 && row >= q.r0 && row <= q.r1);
    if (pi < 0) return;
    const q = b.pieces[pi];
    let best = null;
    for (let k = q.c0 + 1; k < q.c1; k++) {
      const d = Math.abs(col - k);
      if (!best || d < best.d) best = { d, vert: true, k };
    }
    for (let k = q.r0 + 1; k < q.r1; k++) {
      const d = Math.abs(row - k);
      if (!best || d < best.d) best = { d, vert: false, k };
    }
    if (!best) { S.shake = .12; sfx.nope(); return; }
    const a = best.vert
      ? [{ r0: q.r0, c0: q.c0, r1: q.r1, c1: best.k }, { r0: q.r0, c0: best.k, r1: q.r1, c1: q.c1 }]
      : [{ r0: q.r0, c0: q.c0, r1: best.k, c1: q.c1 }, { r0: best.k, c0: q.c0, r1: q.r1, c1: q.c1 }];
    b.pieces.splice(pi, 1, ...a);
    b.hitT = .3;
    sfx.tone(320, .1, 'square', .06);
    const hx = best.vert ? R.x + best.k * CELL : R.x + (q.c0 + q.c1) / 2 * CELL;
    const hy = best.vert ? R.y + (q.r0 + q.r1) / 2 * CELL : R.y + best.k * CELL;
    for (let i = 0; i < 10; i++) {
      S.cracks.push({ x: hx, y: hy, t: 0, rot: Math.random() * TAU, vr: (Math.random() - .5) * 14,
        vx: (Math.random() - .5) * 260, vy: -80 - Math.random() * 160, r: 2.5 + Math.random() * 4 });
    }
    if (solved(b)) mine(b);
    if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
    return;
  }
}

/** سنگِ نام‌بُرده می‌شکند و فیروزه‌اش می‌ریزد توی واگن. */
function mine(b) {
  b.dead = true;
  const R = blockRect(b);
  const parts = b.pieces.map((p) => `${fa(pieceH(p))}×${fa(pieceW(p))}`);
  const sum = b.pieces.reduce((a, p) => a + pieceW(p) * pieceH(p), 0);
  /* فقط شکستنی که خودِ بچّه ساخته را نشان می‌دهیم؛ حاصل را نه. */
  S.banner = { t: 0, head: `${fa(b.rows)} × ${fa(b.cols)}  =`, body: parts.join('  +  ') };
  S.log.unshift({ head: `${fa(b.rows)}×${fa(b.cols)}`, body: parts.join(' + ') });
  if (S.log.length > 4) S.log.pop();
  S.combo++;
  S.cleared++;
  /* تکّهٔ کمتر یعنی شکستنِ هوشمندانه‌تر */
  const bonus = Math.max(0, 5 - b.pieces.length) * 120;
  const pts = 150 + sum * 6 + bonus + Math.min(S.combo, 6) * 60;
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  floatText(R.x + R.w / 2, R.y + R.h / 2, `+${fa(pts)}`, P.gold);
  bits.confetti(R.x + R.w / 2, R.y + R.h / 2, 40, [P.gemLit, P.gem, P.gold, '#fff']);
  sfx.good();
  if (!L().endless && S.cleared >= S.quota) {
    S.score += 500;
    if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
    S.phase = 'won'; S.phaseT = 0;
    sfx.win();
  }
}

function crush(b) {
  b.dead = true;
  S.combo = 0;
  S.hearts--;
  S.shake = .5;
  S.shakeC = .8;
  sfx.nope();
  const R = blockRect(b);
  bits.add(R.x + R.w / 2, CART.y, 30, 'dot', ['#8a6a5a', '#5d4a3e', P.gemBad],
    { speed: 320, lift: 180, size: 5, life: 1, grav: 800 });
  toast.say(`${fa(b.rows)} × ${fa(b.cols)} را نشکستی!`, 'bad');
  if (S.hearts <= 0) { S.phase = 'lost'; S.phaseT = 0; }
}

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 30) {
    S.tut.step = 1; S.tut.t = 0;
    if (!S.blocks.length) S.blocks.push(makeBlock());
    S.blocks[0].y = 120;
  }
  if (S.tut.step === 2 && S.tut.t > 30) S.tut.on = false;
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  return inRect(p, { x: SHAFT.x, y: 0, w: SHAFT.w, h: CART.y }) ? { shaft: true } : null;
}

cv.addEventListener('pointermove', (e) => {
  S.hover = hitTest(toStage(e));
  cv.style.cursor = S.hover ? 'crosshair' : 'default';
});
cv.addEventListener('pointerleave', () => { S.hover = null; });
cv.addEventListener('pointerdown', (e) => {
  if (S.phase === 'play' && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  const p = toStage(e);
  const h = hitTest(p);
  if (S.phase === 'intro') { if (h || inRect(p, BTN_GO)) startLevel(0); return; }
  if (S.phase === 'won') {
    if (!inRect(p, BTN_GO)) return;
    if (L().endless) startLevel(S.level, true);
    else if (S.level + 1 < LEVELS.length) startLevel(S.level + 1, true);
    else { S.score = 0; startLevel(0); }
    return;
  }
  if (S.phase === 'lost') { if (inRect(p, BTN_GO)) { S.score = 0; startLevel(S.level); } return; }
  chop(p);
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
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 20);
  ctx.fillStyle = `rgba(4, 8, 10, ${alpha})`;
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
  }, '4, 10, 14');
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

function gemCell(x, y, ok, seed) {
  const c = ok ? P.gem : P.gemBad, d = ok ? P.gemDk : P.gemBadDk;
  ctx.fillStyle = d;
  wobbleRect(x + 2, y + 2, CELL - 4, CELL - 4, 4, seed, 1); ctx.fill();
  ctx.fillStyle = c;
  wobbleRect(x + 3, y + 3, CELL - 7, CELL - 7, 4, seed + 1, 1); ctx.fill();
  ctx.fillStyle = ok ? 'rgba(200, 250, 255, .38)' : 'rgba(255, 220, 230, .22)';
  ctx.beginPath();
  ctx.moveTo(x + 5, y + CELL - 6); ctx.lineTo(x + 5, y + 5); ctx.lineTo(x + CELL - 6, y + 5);
  ctx.closePath(); ctx.fill();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#0d1418');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 12;
    ctx.translate(Math.sin(S.t * 60) * k, Math.cos(S.t * 47) * k * .5);
  }

  drawMine();
  drawBlocks();
  drawCart();
  drawCracks();
  bits.draw();
  drawFloats();
  ctx.restore();

  drawKnownCard();
  drawLog();
  drawBanner();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    ctx.save();
    ctx.translate(SHAFT.x + SHAFT.w / 2 - SCENE_W / 2, 0);
    toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
    ctx.restore();
  }

  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.13, 'rgba(2, 6, 8, .56)');
}

function drawMine() {
  const g = ctx.createLinearGradient(300, 60, 900, 760);
  g.addColorStop(0, P.rockHi);
  g.addColorStop(1, P.rockLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* سنگ‌های دیوار */
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,.028)';
  for (let r = 0; r < 16; r++) for (let c = 0; c < 12; c++) {
    const x = c * 104 + (r % 2 ? 52 : 0), y = 30 + r * 48;
    wobbleRect(x, y, 96, 42, 6, r * 7 + c, 1.6); ctx.fill();
  }
  ctx.restore();

  /* رگهٔ فیروزه توی دیوار */
  ctx.save();
  ctx.globalAlpha = .12;
  ctx.strokeStyle = P.gem; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    let x = 40 + i * 260, y = 80;
    ctx.moveTo(x, y);
    for (let k = 0; k < 7; k++) {
      x += (noise1(i * 5 + k) - .5) * 90;
      y += 90;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  /* دهانهٔ چاه */
  ctx.fillStyle = 'rgba(5, 10, 12, .55)';
  ctx.fillRect(SHAFT.x, 0, SHAFT.w, CART.y);
  ctx.fillStyle = P.woodDk;
  wobbleRect(SHAFT.x - 22, 0, 22, CART.y, 0, 21, 1.6); ctx.fill();
  wobbleRect(SHAFT.x + SHAFT.w, 0, 22, CART.y, 0, 23, 1.6); ctx.fill();
  ctx.fillStyle = P.wood;
  for (let y = 66; y < CART.y; y += 108) {
    wobbleRect(SHAFT.x - 26, y, SHAFT.w + 52, 12, 3, y, 1); ctx.fill();
  }

  /* چراغ‌های معدن */
  for (const lx of [SHAFT.x - 54, SHAFT.x + SHAFT.w + 54]) {
    for (let i = 0; i < 3; i++) {
      const ly = 140 + i * 200;
      const gl = ctx.createRadialGradient(lx, ly, 6, lx, ly, 200);
      gl.addColorStop(0, P.glow);
      gl.addColorStop(1, 'rgba(255, 200, 110, 0)');
      ctx.fillStyle = gl;
      ctx.fillRect(lx - 200, ly - 200, 400, 400);
      ctx.fillStyle = P.iron;
      wobbleRect(lx - 12, ly - 22, 24, 10, 3, i + lx, .8); ctx.fill();
      ctx.fillStyle = P.lamp;
      wobbleCircle(lx, ly, 10, i * 3 + lx, 1); ctx.fill();
    }
  }

  /* غبار */
  ctx.save();
  for (const d of S.dust) {
    ctx.globalAlpha = .05 + .1 * (.5 + .5 * Math.sin(d.ph * 2));
    ctx.fillStyle = '#cfe6ee';
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill();
  }
  ctx.restore();

  /* خطِ خطر */
  const danger = S.blocks.some((b) => b.y + b.rows * CELL > CART.y - 120);
  ctx.save();
  ctx.globalAlpha = danger ? .35 + .3 * Math.sin(S.t * 9) : .12;
  ctx.strokeStyle = P.bad; ctx.lineWidth = 3;
  ctx.setLineDash([12, 10]);
  ctx.beginPath(); ctx.moveTo(SHAFT.x, CART.y - 8); ctx.lineTo(SHAFT.x + SHAFT.w, CART.y - 8); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawBlocks() {
  for (const b of S.blocks) {
    const R = blockRect(b);
    const jit = b.hitT > 0 ? Math.sin(S.t * 60) * 3 * b.hitT : 0;
    ctx.save();
    ctx.translate(jit, 0);
    /* سایه‌ی سنگ */
    ctx.globalAlpha = .4;
    ctx.fillStyle = '#04080a';
    wobbleRect(R.x + 5, R.y + 8, R.w, R.h, 6, 31, 1.6); ctx.fill();
    ctx.globalAlpha = 1;

    for (const p of b.pieces) {
      const ok = known(pieceW(p), pieceH(p));
      for (let r = p.r0; r < p.r1; r++) for (let c = p.c0; c < p.c1; c++) {
        gemCell(R.x + c * CELL, R.y + r * CELL, ok, r * 13 + c * 7 + b.cx);
      }
      const px = R.x + p.c0 * CELL, py = R.y + p.r0 * CELL;
      const pw = pieceW(p) * CELL, ph = pieceH(p) * CELL;
      ctx.strokeStyle = ok ? P.gemLit : P.bad;
      ctx.lineWidth = ok ? 3 : 3.4;
      if (!ok) { ctx.save(); ctx.globalAlpha = .55 + .4 * Math.sin(S.t * 6); }
      ctx.beginPath(); rrPath(px + 1.5, py + 1.5, pw - 3, ph - 3, 6); ctx.stroke();
      if (!ok) ctx.restore();
      /* نامِ تکّه، اگر جا باشد */
      if (pw >= 52 && ph >= 26) {
        const lbl = `${fa(pieceH(p))}×${fa(pieceW(p))}`;
        numText(lbl, px + pw / 2, py + ph / 2,
          { size: Math.min(22, pw / 3.4), color: ok ? '#eafcff' : '#ffe0e4',
            stroke: 'rgba(6, 14, 18, .7)', strokeWidth: 5 });
      }
    }
    ctx.restore();
  }
}

function drawCart() {
  const sh = S.shakeC > 0 ? Math.sin(S.t * 40) * 5 * S.shakeC : 0;
  /* ریل */
  ctx.fillStyle = P.rail;
  wobbleRect(SHAFT.x - 60, CART.y + 74, SHAFT.w + 120, 8, 3, 41, 1); ctx.fill();
  ctx.fillStyle = P.woodDk;
  for (let x = SHAFT.x - 50; x < SHAFT.x + SHAFT.w + 50; x += 46) {
    wobbleRect(x, CART.y + 80, 26, 12, 2, x, .8); ctx.fill();
  }
  ctx.save();
  ctx.translate(sh, 0);
  withShadow(20, 10, .5, () => {
    ctx.fillStyle = P.wood;
    wobbleRect(CART.x, CART.y, CART.w, CART.h - 12, 6, 43, 1.6); ctx.fill();
  }, '4, 10, 14');
  ctx.fillStyle = P.woodLit;
  wobbleRect(CART.x, CART.y, CART.w, 10, 4, 45, 1); ctx.fill();
  ctx.fillStyle = P.iron;
  for (const dx of [26, CART.w - 46]) {
    wobbleRect(CART.x + dx, CART.y, 20, CART.h - 12, 3, dx, 1); ctx.fill();
  }
  /* فیروزه‌های جمع‌شده */
  const n = Math.min(22, S.cleared * 3);
  for (let i = 0; i < n; i++) {
    const x = CART.x + 40 + noise1(i * 3.1) * (CART.w - 80);
    const y = CART.y + 22 + noise1(i * 7.7) * 34;
    ctx.fillStyle = i % 3 ? P.gem : P.gemLit;
    wobbleCircle(x, y, 7 + noise1(i) * 4, i * 5, 1); ctx.fill();
  }
  /* چرخ‌ها */
  for (const dx of [46, CART.w - 46]) {
    ctx.fillStyle = P.iron;
    wobbleCircle(CART.x + dx, CART.y + CART.h - 4, 17, dx, 1.2); ctx.fill();
    ctx.fillStyle = P.ironLit;
    wobbleCircle(CART.x + dx, CART.y + CART.h - 4, 8, dx + 1, 1); ctx.fill();
  }
  ctx.restore();
}

function drawCracks() {
  for (const c of S.cracks) {
    const k = clamp(1 - c.t / 1.3, 0, 1);
    ctx.save();
    ctx.globalAlpha = k;
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = P.gemLit;
    ctx.fillRect(-c.r, -c.r, c.r * 2, c.r * 2);
    ctx.restore();
  }
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.5, 0, 1);
    numText(f.txt, f.x, f.y, { size: f.size, color: f.col, alpha: k,
      stroke: 'rgba(4, 10, 14, .6)', strokeWidth: 5 });
  }
}

/** کارتِ «بلدی‌ها» — تنها چیزی که معدنچی از بر است. */
function drawKnownCard() {
  const b = KCARD;
  withShadow(20, 9, .5, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 16, 31, 2.2); ctx.fill();
  }, '2, 8, 12');
  ctx.fillStyle = P.brass;
  wobbleRect(b.x, b.y, b.w, 11, 5, 33, 1); ctx.fill();

  text('چیزهایی که بلدی', b.x + b.w / 2, b.y + 40, { size: 25, family: 'Lalezar', color: P.ink });

  /* چهار تراشهٔ فیروزه، هرکدام یک ضربِ بلد */
  for (let i = 0; i < KNOWN.length; i++) {
    const cx = b.x + 42 + (i % 2) * 96, cy = b.y + 92 + Math.floor(i / 2) * 62;
    withShadow(8, 3, .3, () => {
      ctx.fillStyle = P.gemDk;
      wobbleRect(cx - 36, cy - 22, 76, 44, 10, 51 + i, 1.4); ctx.fill();
      ctx.fillStyle = P.gem;
      wobbleRect(cx - 34, cy - 20, 72, 40, 9, 61 + i, 1.2); ctx.fill();
    }, '2, 8, 12');
    ctx.fillStyle = 'rgba(210, 250, 255, .3)';
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy + 14); ctx.lineTo(cx - 30, cy - 15); ctx.lineTo(cx + 30, cy - 15);
    ctx.closePath(); ctx.fill();
    numText('×' + fa(KNOWN[i]), cx + 2, cy + 1, { size: 27, color: '#093038' });
  }

  textWrap('تکّه‌ای که یک ضلعش\nاین‌هاست، بلدی است.', b.x + b.w / 2, b.y + b.h - 48, b.w - 44,
    { size: 14, color: P.inkSoft, lineHeight: 22 });
}

/** دفترِ معدن — چند شکستنِ آخرِ خودِ بچّه. */
function drawLog() {
  const b = LOGC;
  withShadow(20, 9, .5, () => {
    ctx.fillStyle = 'rgba(244, 234, 214, .93)';
    wobbleRect(b.x, b.y, b.w, b.h, 16, 71, 2.2); ctx.fill();
  }, '2, 8, 12');
  ctx.fillStyle = P.brass;
  wobbleRect(b.x, b.y, b.w, 11, 5, 73, 1); ctx.fill();
  text('دفترِ معدن', b.x + b.w / 2, b.y + 40, { size: 25, family: 'Lalezar', color: P.ink });

  if (!S.log.length) {
    textWrap('هر سنگی که بشکنی\nاینجا نوشته می‌شود.', b.x + b.w / 2, b.y + 96, b.w - 40,
      { size: 15, color: P.inkSoft });
    return;
  }
  for (let i = 0; i < S.log.length; i++) {
    const e = S.log[i], y = b.y + 76 + i * 46;
    ctx.globalAlpha = 1 - i * .17;
    ctx.fillStyle = i === 0 ? 'rgba(63, 176, 189, .16)' : 'rgba(34, 48, 58, .05)';
    wobbleRect(b.x + 14, y - 17, b.w - 28, 38, 9, 81 + i, 1); ctx.fill();
    numText(e.head, b.x + b.w - 30, y, { size: 20, color: P.ink, align: 'right' });
    numText('=', b.x + b.w - 82, y, { size: 17, color: P.inkSoft, align: 'center' });
    numText(e.body, b.x + 20, y, { size: 17, color: P.gemDk, align: 'left', family: 'Vazirmatn', weight: 700 });
    ctx.globalAlpha = 1;
  }
}

/** لحظهٔ شکستن: «۷ × ۸  =  ۷×۵ + ۷×۳» — بی حاصل، فقط خودِ شکستن. */
function drawBanner() {
  if (!S.banner) return;
  const t = S.banner.t;
  const k = clamp(t / .25, 0, 1) * clamp((2.4 - t) / .5, 0, 1);
  const cx = SHAFT.x + SHAFT.w / 2, cy = 210;
  ctx.save();
  ctx.globalAlpha = k;
  const rise = (1 - easeOut(clamp(t / .4, 0, 1))) * 22;
  ctx.translate(0, rise);
  withShadow(26, 10, .5, () => {
    ctx.fillStyle = 'rgba(9, 34, 40, .92)';
    wobbleRect(cx - 250, cy - 52, 500, 104, 18, 91, 2.4); ctx.fill();
  }, '0, 0, 0');
  ctx.strokeStyle = 'rgba(127, 224, 232, .5)'; ctx.lineWidth = 3;
  wobbleRect(cx - 250, cy - 52, 500, 104, 18, 91, 2.4); ctx.stroke();
  numText(S.banner.head, cx, cy - 22, { size: 34, color: P.gemLit });
  numText(S.banner.body, cx, cy + 22, { size: 27, color: P.paper });
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = 'rgba(6, 14, 18, .78)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(127, 224, 232, .18)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);

  text(L().name, SCENE_W - 26, HUD_H / 2, { size: 24, family: 'Lalezar', color: P.paper, align: 'right' });

  /* جان‌ها = سلامتِ واگن */
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 200 - i * 34, full = i < S.hearts;
    ctx.save();
    ctx.globalAlpha = full ? 1 : .22;
    ctx.fillStyle = full ? P.bad : '#8fa0aa';
    wobbleCircle(x - 5, HUD_H / 2 - 3, 7, i, 1); ctx.fill();
    wobbleCircle(x + 5, HUD_H / 2 - 3, 7, i + 9, 1); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 11, HUD_H / 2); ctx.lineTo(x, HUD_H / 2 + 12); ctx.lineTo(x + 11, HUD_H / 2);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  if (!L().endless) {
    const done = Math.min(S.cleared, L().quota);
    numText(fa(done) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gemLit });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gemLit });
  }

  numText(fa(S.score), 26, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(244, 234, 214, .55)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 250, HUD_H / 2, { size: 22, color: P.gemLit, align: 'left' });
}

/* ───────── آموزش ───────── */

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(253, 246, 232, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '0, 0, 0');
  ctx.fillStyle = P.gem;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#4d5f6b' }); yy += 30; }
  return h + 20;
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([KCARD], .74);
    const h = tutCard(400, 300, 480,
      ['سنگ‌های فیروزه از سقف پایین می‌آیند.', 'هر سنگی که به واگن برسد، آن را می‌شکند.',
       'فقط سنگی نجات پیدا می‌کند که', 'تکّه‌هایش را «بلد» باشی.'], 'معدنِ فیروزه');
    tutMore(640, 300 + h + 16, S.t, P.ink);
  } else if (st === 1) {
    const b = S.blocks[0];
    if (b) {
      const R = blockRect(b);
      spot([R], .7);
      pointHand(R.x + R.w / 2, R.y + R.h + 12);
      tutCard(400, 470, 480, ['روی سنگ بزن تا تیشه بخورد و دو نیم شود.',
        'نزدیک‌ترین خط به انگشتت شکسته می‌شود.'], 'تیشه بزن');
    }
  } else {
    spot([blockRect(S.blocks[0] || { cx: 0, y: 0, rows: 1, cols: 1 })], .7);
    const h = tutCard(400, 440, 480,
      ['تکّهٔ فیروزه‌ای یعنی بلدش هستی.', 'تکّهٔ سرخ یعنی هنوز نه — بازش کن.',
       'وقتی همهٔ تکّه‌ها فیروزه‌ای شد،', 'سنگ خودش می‌ریزد توی واگن.'], 'دو رنگِ سنگ');
    tutMore(640, 440 + h + 16, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function lampIcon(x, y) {
  withShadow(18, 6, .4, () => {
    ctx.fillStyle = P.iron;
    wobbleRect(x - 22, y - 18, 44, 34, 8, 111, 1.4); ctx.fill();
    ctx.fillStyle = P.lamp;
    wobbleCircle(x, y - 1, 12, 113, 1.2); ctx.fill();
  }, '90, 60, 20');
  ctx.fillStyle = 'rgba(255, 208, 122, .3)';
  wobbleCircle(x, y - 1, 22, 115, 1.6); ctx.fill();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 720, h: 262, y: 150,
    paper: '#f4ead6', band: '#25808c', ink: P.ink, inkSoft: '#6f8290',
    icon: lampIcon,
    title: 'معدنِ فیروزه',
    body: 'سنگ‌ها می‌ریزند و واگنت زیرِ آن‌هاست.\nهر سنگ را باید به تکّه‌هایی بشکنی که بلدی —\nهرچه تکّه کمتر، فیروزهٔ بیشتر.',
    btn: BTN_GO, btnLabel: 'برو توی معدن', btnHot: S.hover === BTN_GO,
    btnFill: '#25808c', btnHotFill: '#2e97a5',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: '#f4ead6', band: '#d3a349', ink: P.ink, inkSoft: '#6f8290',
    icon: (x, y) => { ctx.fillStyle = P.gem; wobbleRect(x - 26, y - 18, 52, 36, 8, 131, 1.6); ctx.fill();
      ctx.fillStyle = 'rgba(210, 250, 255, .35)'; ctx.beginPath();
      ctx.moveTo(x - 20, y + 12); ctx.lineTo(x - 20, y - 12); ctx.lineTo(x + 20, y - 12); ctx.closePath(); ctx.fill(); },
    title: L().endless ? 'واگن پر شد' : 'رگه تمام شد!',
    body: 'فیروزه‌ات: ' + fa(S.score) + (last ? '\nمعدن تمام شد. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'رگهٔ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#25808c', btnHotFill: '#2e97a5',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: '#f4ead6', band: '#cf5f4a', ink: P.ink, inkSoft: '#6f8290',
    icon: (x, y) => { ctx.fillStyle = P.wood;
      ctx.save(); ctx.translate(x, y); ctx.rotate(.22);
      wobbleRect(-30, -14, 60, 28, 6, 141, 2); ctx.fill(); ctx.restore(); },
    title: 'واگن شکست',
    body: 'فیروزه‌ات: ' + fa(S.score) + '\nسنگِ بزرگ را به تکّه‌های بلد بشکن.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#25808c', btnHotFill: '#2e97a5',
  });
}

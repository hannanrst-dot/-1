/*!
title: تئاترِ سایه — زیرمسئله
bg: #1e1626
*/

/* ═══════════════════════════════════════════════════════════════════════
   تئاترِ سایه — ریاضی سوم، فصل ۵، درس ۱ (حلّ مسئله: زیرمسئله)
   ───────────────────────────────────────────────────────────────────────
   درسِ کتاب می‌گوید: مسئلهٔ بزرگ را به چند مسئلهٔ کوچک بشکن. صفحهٔ ۸۱ هم
   همین را با شکل می‌گوید: «این شکل‌ها از قطعه‌های مختلفی درست شده‌اند،
   این قطعه‌ها را جدا کنید.»

   اینجا برعکسش را بازی می‌کنیم، چون بازی‌تر است: سایهٔ یک چیز روی پرده
   افتاده و تو باید با تکّه‌های مقوّاییِ سادهٔ پشتِ صحنه، دقیقاً همان سایه
   را بسازی. هیچ تکّه‌ای به‌تنهایی جوابِ سایه نیست؛ باید ببینی سایه از چه
   قطعه‌هایی ساخته شده.

   شمع می‌سوزد. هر سایه‌ای که کامل شود، شمع را بلندتر می‌کند و عروسک
   جان می‌گیرد.

   هیچ‌جا نوشته نمی‌شود کدام تکّه کجاست؛ فقط تکّه‌ها و سایه.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const CELL = 46;

const P = {
  night:   '#1e1626',
  nightLo: '#120c18',
  curtain: '#5e2439', curtainDk: '#3c1524', curtainLt: '#7c3149',
  screen:  '#f7e2ae', screen2: '#e9c882', screenEdge: '#b98d4e',
  shade:   '#2c1d27',            // رنگِ سایه روی پرده
  hole:    'rgba(44, 29, 39, .22)',
  piece:   '#3b2a34', pieceLt: '#4e3a45', pieceEdge: '#6a5060',
  wood:    '#6d4a2b', woodDk: '#4a3120', woodLt: '#8b6238',
  flame:   '#ffcf6b', flameHot: '#fff3c8',
  paper:   '#f6e9d2', ink: '#33222c', inkSoft: '#8a7382',
  good:    '#79a05a', bad: '#c1544a', gold: '#e9b74a',
};

/* ───────── سایه‌ها: هر کدام چند قطعهٔ ساده ───────── */

const SHAPES = [
  { id: 'house', name: 'خانه', w: 7, h: 6,
    rects: [{ x: 2, y: 0, w: 3, h: 1 }, { x: 1, y: 1, w: 5, h: 1 }, { x: 0, y: 2, w: 7, h: 4 }] },
  { id: 'tree', name: 'درخت', w: 5, h: 7,
    rects: [{ x: 1, y: 0, w: 3, h: 2 }, { x: 0, y: 2, w: 5, h: 2 }, { x: 2, y: 4, w: 1, h: 3 }] },
  { id: 'fish', name: 'ماهی', w: 7, h: 5,
    rects: [{ x: 1, y: 0, w: 2, h: 1 }, { x: 0, y: 1, w: 5, h: 3 }, { x: 5, y: 0, w: 2, h: 5 }] },
  { id: 'boat', name: 'قایق', w: 7, h: 7,
    rects: [{ x: 3, y: 0, w: 1, h: 1 }, { x: 2, y: 1, w: 3, h: 4 }, { x: 0, y: 5, w: 7, h: 2 }] },
  { id: 'cat', name: 'گربه', w: 6, h: 7,
    rects: [{ x: 0, y: 0, w: 3, h: 1 }, { x: 0, y: 1, w: 3, h: 2 },
            { x: 1, y: 3, w: 5, h: 3 }, { x: 5, y: 1, w: 1, h: 2 }, { x: 1, y: 6, w: 4, h: 1 }] },
  { id: 'bird', name: 'پرنده', w: 8, h: 4,
    rects: [{ x: 0, y: 2, w: 2, h: 1 }, { x: 2, y: 2, w: 4, h: 2 },
            { x: 1, y: 0, w: 3, h: 2 }, { x: 4, y: 0, w: 3, h: 2 }, { x: 6, y: 2, w: 2, h: 1 }] },
  { id: 'rocket', name: 'موشک', w: 5, h: 8,
    rects: [{ x: 2, y: 0, w: 1, h: 1 }, { x: 1, y: 1, w: 3, h: 5 },
            { x: 0, y: 5, w: 1, h: 2 }, { x: 4, y: 5, w: 1, h: 2 }, { x: 2, y: 6, w: 1, h: 2 }] },
  { id: 'camel', name: 'شتر', w: 8, h: 6,
    rects: [{ x: 6, y: 0, w: 2, h: 1 }, { x: 6, y: 1, w: 1, h: 2 },
            { x: 1, y: 1, w: 5, h: 1 }, { x: 0, y: 2, w: 6, h: 2 }, { x: 1, y: 4, w: 5, h: 2 }] },
];

const LEVELS = [
  { name: 'پردهٔ اوّل', pool: ['house', 'tree', 'fish'], decoy: 0, wax: 46, quota: 3,
    hint: 'تکّه‌ها را بکِش روی سایه تا کاملش کنی.' },
  { name: 'مهمانِ شب', pool: ['boat', 'fish', 'tree', 'house'], decoy: 1, wax: 44, quota: 4,
    hint: 'یک تکّه اضافه است. لازم نیست همه را بگذاری.' },
  { name: 'سایه‌های بزرگ', pool: ['cat', 'bird', 'boat'], decoy: 1, wax: 46, quota: 4,
    hint: 'روی تکّه بزن تا بچرخد.' },
  { name: 'نمایشِ بزرگ', pool: ['camel', 'rocket', 'cat', 'bird'], decoy: 2, wax: 44, quota: 5,
    hint: 'سایه‌ها پیچیده‌تر شدند.' },
  { name: 'شبِ بی‌پایان', pool: null, decoy: 2, wax: 40, endless: true,
    hint: 'تا شمع روشن است، سایه بساز.' },
];

const HUD_H = 52;
const SCREEN = { x: 246, y: 88, w: 620, h: 452 };
const RACK   = { x: 56, y: 566, w: 1088, h: 164 };
const CANDLE = { x: 1000, y: 130, w: 130, h: 400 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  shape: null,
  gx: 0, gy: 0,          // گوشهٔ شبکه روی صحنه
  need: [],              // خانه‌های سایه
  fill: [],              // خانه‌های پوشیده‌شده
  rack: [],              // { w, h, id, used, x, y }
  placed: [],            // { w, h, c, r, id, t }
  drag: null,
  wax: 1, waxMax: 46,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  alive: 0,              // انیمیشنِ جان‌گرفتنِ عروسک
  moths: [],
  t: 0, phaseT: 0, hover: null, shake: 0, glow: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];

function loadBest() { try { return +localStorage.getItem('saye-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('saye-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 7; i++) {
  S.moths.push({ x: 900 + Math.random() * 260, y: 160 + Math.random() * 320,
                 ph: Math.random() * TAU, sp: .5 + Math.random() * .9, r: 3 + Math.random() * 3 });
}
whenFontsReady(() => runLoop(step));

/* ───────── ساختِ پرده ───────── */

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

function newShow() {
  const lv = L();
  const pool = lv.pool || SHAPES.map((s) => s.id);
  const id = pool[Math.floor(Math.random() * pool.length)];
  const sh = SHAPES.find((s) => s.id === id);
  S.shape = sh;
  S.gx = Math.round((SCREEN.x + SCREEN.w / 2 - sh.w * CELL / 2) / 1);
  S.gy = Math.round((SCREEN.y + SCREEN.h / 2 - sh.h * CELL / 2) / 1);
  S.need = [];
  S.fill = [];
  for (let r = 0; r < sh.h; r++) { S.need.push(new Array(sh.w).fill(0)); S.fill.push(new Array(sh.w).fill(-1)); }
  for (const q of sh.rects) for (let r = q.y; r < q.y + q.h; r++) for (let c = q.x; c < q.x + q.w; c++) S.need[r][c] = 1;

  /* تکّه‌ها: دقیقاً همان قطعه‌های سایه، به‌هم‌ریخته و گاهی چرخیده */
  const items = sh.rects.map((q, i) => {
    const rot = Math.random() < .5 && q.w !== q.h;
    return { w: rot ? q.h : q.w, h: rot ? q.w : q.h, id: i, used: false };
  });
  /* تکّهٔ اضافه: مستطیلی که هیچ‌جای سایه جا نمی‌شود، ولی اندازه‌اش باورکردنی است. */
  const big = Math.max.apply(null, sh.rects.map((q) => q.w * q.h));
  for (let d = 0; d < lv.decoy; d++) {
    for (let tries = 0; tries < 80; tries++) {
      const w = 1 + Math.floor(Math.random() * sh.w), h = 1 + Math.floor(Math.random() * sh.h);
      if (w * h < 2 || w * h > big + 4) continue;
      if (items.some((z) => (z.w === w && z.h === h) || (z.w === h && z.h === w))) continue;
      if (fitsAnywhere(w, h) || fitsAnywhere(h, w)) continue;
      items.push({ w, h, id: 100 + d, used: false, decoy: true });
      break;
    }
  }
  S.rack = shuffle(items);
  layoutRack();
  S.placed = [];
  S.drag = null;
  S.alive = 0;
}

/** آیا مستطیلِ w×h اصلاً جایی توی سایه جا می‌شود؟ (برای ساختنِ تکّهٔ اضافه) */
function fitsAnywhere(w, h) {
  const sh = S.shape;
  for (let r = 0; r + h <= sh.h; r++) for (let c = 0; c + w <= sh.w; c++) {
    let ok = true;
    for (let rr = r; rr < r + h && ok; rr++) for (let cc = c; cc < c + w; cc++) if (!S.need[rr][cc]) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

function layoutRack() {
  const n = S.rack.length;
  const slot = Math.min(150, (RACK.w - 40) / Math.max(1, n));
  const total = slot * n;
  S.rack.forEach((p, i) => {
    p.x = RACK.x + (RACK.w - total) / 2 + slot * i + slot / 2;
    p.s = Math.min(.8, (slot - 26) / (p.w * CELL), 98 / (p.h * CELL));
    p.y = RACK.y + 58 + p.h * CELL * p.s / 2;
    p.slot = slot;
  });
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.waxMax = lv.wax; S.wax = 1;
  if (!keep) { S.score = 0; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newShow();
  if (S.tut.on) {
    S.shape = SHAPES[1]; // درخت: سه تکّه، ساده
    newShowFrom(SHAPES[1]);
  }
  toast.say(lv.hint, 'info');
}

function newShowFrom(sh) {
  S.shape = sh;
  S.gx = SCREEN.x + SCREEN.w / 2 - sh.w * CELL / 2;
  S.gy = SCREEN.y + SCREEN.h / 2 - sh.h * CELL / 2;
  S.need = []; S.fill = [];
  for (let r = 0; r < sh.h; r++) { S.need.push(new Array(sh.w).fill(0)); S.fill.push(new Array(sh.w).fill(-1)); }
  for (const q of sh.rects) for (let r = q.y; r < q.y + q.h; r++) for (let c = q.x; c < q.x + q.w; c++) S.need[r][c] = 1;
  S.rack = shuffle(sh.rects.map((q, i) => ({ w: q.w, h: q.h, id: i, used: false })));
  layoutRack();
  S.placed = []; S.drag = null; S.alive = 0;
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.glow > 0) S.glow -= dt;
  if (S.alive > 0) {
    S.alive += dt;
    if (S.alive > 2.2) { S.alive = 0; newShow(); }
  }
  if (S.phase === 'play' && !S.alive) {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen) {
      S.wax -= dt / S.waxMax;
      if (S.wax <= 0) { S.wax = 0; S.phase = 'lost'; S.phaseT = 0; sfx.nope(); }
    }
    if (S.tut.on) S.tut.t += dt;
  }
  for (const m of S.moths) {
    m.ph += dt * m.sp;
    m.x += Math.cos(m.ph * 1.7) * 26 * dt;
    m.y += Math.sin(m.ph * 2.3) * 22 * dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── چیدنِ تکّه ───────── */

const gridOf = (p) => ({ c: Math.floor((p.x - S.gx) / CELL), r: Math.floor((p.y - S.gy) / CELL) });

/** آیا این تکّه با این گوشه، درست روی سایهٔ خالی می‌نشیند؟ */
function canPlace(w, h, c, r) {
  const sh = S.shape;
  if (c < 0 || r < 0 || c + w > sh.w || r + h > sh.h) return false;
  for (let rr = r; rr < r + h; rr++) for (let cc = c; cc < c + w; cc++) {
    if (!S.need[rr][cc] || S.fill[rr][cc] >= 0) return false;
  }
  return true;
}

function stamp(pc, v) {
  for (let rr = pc.r; rr < pc.r + pc.h; rr++) for (let cc = pc.c; cc < pc.c + pc.w; cc++) S.fill[rr][cc] = v;
}

function isDone() {
  const sh = S.shape;
  for (let r = 0; r < sh.h; r++) for (let c = 0; c < sh.w; c++) if (S.need[r][c] && S.fill[r][c] < 0) return false;
  return true;
}

function finishShow() {
  S.alive = .001;
  S.combo++;
  S.cleared++;
  S.wax = Math.min(1, S.wax + .34);
  const pts = 240 + S.placed.length * 70 + Math.min(S.combo, 6) * 60 + Math.round(S.wax * 200);
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  S.glow = 1.1;
  bits.confetti(SCREEN.x + SCREEN.w / 2, SCREEN.y + SCREEN.h / 2, 46,
    [P.gold, P.flame, '#fff', P.screen]);
  sfx.win();
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 600; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

function rackAt(p) {
  for (let i = 0; i < S.rack.length; i++) {
    const q = S.rack[i];
    if (q.used) continue;
    const w = q.w * CELL * q.s, h = q.h * CELL * q.s;
    if (Math.abs(p.x - q.x) < Math.max(w, q.slot * .5) / 2 + 4 && Math.abs(p.y - q.y) < h / 2 + 24) return i;
  }
  return -1;
}

function placedAt(p) {
  for (let i = S.placed.length - 1; i >= 0; i--) {
    const q = S.placed[i];
    const x = S.gx + q.c * CELL, y = S.gy + q.r * CELL;
    if (p.x >= x && p.x <= x + q.w * CELL && p.y >= y && p.y <= y + q.h * CELL) return i;
  }
  return -1;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.drag) { S.drag.x = p.x; S.drag.y = p.y; S.drag.moved += 1; return; }
  cv.style.cursor = (rackAt(p) >= 0 || placedAt(p) >= 0) ? 'grab' : 'default';
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
  if (S.alive) return;
  if (tutTap(S.tut, TUT_TAP, TUT_LAST)) return;

  const ri = rackAt(p);
  if (ri >= 0) {
    const q = S.rack[ri];
    S.drag = { from: 'rack', i: ri, w: q.w, h: q.h, x: p.x, y: p.y, moved: 0, dx: 0, dy: 0 };
    sfx.tap();
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    return;
  }
  const pi = placedAt(p);
  if (pi >= 0) {
    const q = S.placed[pi];
    stamp(q, -1);
    S.placed.splice(pi, 1);
    const rq = S.rack.find((z) => z.id === q.id);
    if (rq) { rq.used = false; rq.w = q.w; rq.h = q.h; }
    S.drag = { from: 'board', i: -1, id: q.id, w: q.w, h: q.h, x: p.x, y: p.y, moved: 0,
               dx: p.x - (S.gx + q.c * CELL) - q.w * CELL / 2, dy: p.y - (S.gy + q.r * CELL) - q.h * CELL / 2 };
    sfx.tap();
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
  }
});

cv.addEventListener('pointerup', (e) => {
  const p = toStage(e);
  const d = S.drag;
  S.drag = null;
  if (!d || S.phase !== 'play') return;

  /* ضربهٔ بی‌حرکت روی تکّهٔ رَف = چرخاندن */
  if (d.from === 'rack' && d.moved < 4) {
    const q = S.rack[d.i];
    if (q && q.w !== q.h) { const t = q.w; q.w = q.h; q.h = t; sfx.tone(520, .08, 'triangle', .05); layoutRack(); }
    return;
  }
  const cx = p.x - (d.dx || 0), cy = p.y - (d.dy || 0);
  const g = gridOf({ x: cx - d.w * CELL / 2 + CELL / 2, y: cy - d.h * CELL / 2 + CELL / 2 });
  if (canPlace(d.w, d.h, g.c, g.r)) {
    const id = d.from === 'rack' ? S.rack[d.i].id : d.id;
    const pc = { w: d.w, h: d.h, c: g.c, r: g.r, id, t: 0 };
    S.placed.push(pc);
    stamp(pc, S.placed.length - 1);
    if (d.from === 'rack') S.rack[d.i].used = true;
    else { const rq = S.rack.find((z) => z.id === id); if (rq) rq.used = true; }
    sfx.tone(300 + S.placed.length * 40, .1, 'sine', .06);
    if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
    if (isDone()) finishShow();
  } else {
    if (d.from === 'board') { const rq = S.rack.find((z) => z.id === d.id); if (rq) rq.used = false; }
    S.shake = .12;
    sfx.nope();
  }
});

cv.addEventListener('pointercancel', () => { if (S.drag && S.drag.from === 'board') {
  const rq = S.rack.find((z) => z.id === S.drag.id); if (rq) rq.used = false; } S.drag = null; });

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(246, 233, 210, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '10, 4, 16');
  ctx.fillStyle = P.curtain;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6a5060' }); yy += 30; }
  return h + 20;
}

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
  ctx.fillStyle = `rgba(10, 4, 16, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

/* ───────── سایه‌های نرم (پاداشِ پایانِ پرده) ───────── */

function silhouette(id, x, y, w, h, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.shade;
  ctx.strokeStyle = P.shade;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const S1 = w, H1 = h;
  const wig = Math.sin(t * 4);
  if (id === 'house') {
    ctx.beginPath(); ctx.moveTo(0, H1 * .34); ctx.lineTo(S1 / 2, 0); ctx.lineTo(S1, H1 * .34); ctx.closePath(); ctx.fill();
    ctx.beginPath(); rrPath(S1 * .1, H1 * .32, S1 * .8, H1 * .68, 8); ctx.fill();
    ctx.fillRect(S1 * .72, H1 * .04, S1 * .1, H1 * .2);
    ctx.save(); ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); rrPath(S1 * .42, H1 * .58, S1 * .18, H1 * .42, 6); ctx.fill();
    ctx.beginPath(); ctx.arc(S1 * .26, H1 * .56, S1 * .07, 0, TAU); ctx.fill();
    ctx.restore();
  } else if (id === 'tree') {
    ctx.lineWidth = S1 * .16;
    ctx.beginPath(); ctx.moveTo(S1 / 2, H1); ctx.quadraticCurveTo(S1 * .46, H1 * .7, S1 / 2, H1 * .5); ctx.stroke();
    for (const b of [[.5, .2, .34], [.28, .36, .26], [.72, .36, .26], [.5, .42, .3]]) {
      ctx.beginPath(); ctx.arc(S1 * b[0], H1 * b[1] + wig * 1.6, S1 * b[2], 0, TAU); ctx.fill();
    }
  } else if (id === 'fish') {
    ctx.save(); ctx.translate(S1 * .38, H1 * .5); ctx.rotate(wig * .07);
    ctx.beginPath(); ctx.ellipse(0, 0, S1 * .36, H1 * .34, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-S1 * .1, -H1 * .3); ctx.lineTo(S1 * .08, -H1 * .52); ctx.lineTo(S1 * .2, -H1 * .28); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.translate(S1 * .74, H1 * .5); ctx.rotate(wig * .3);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(S1 * .26, -H1 * .42); ctx.lineTo(S1 * .26, H1 * .42); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(S1 * .18, H1 * .42, S1 * .034, 0, TAU); ctx.fill(); ctx.restore();
  } else if (id === 'boat') {
    ctx.save(); ctx.translate(S1 / 2, H1 * .5); ctx.rotate(wig * .05); ctx.translate(-S1 / 2, -H1 * .5);
    ctx.beginPath();
    ctx.moveTo(S1 * .02, H1 * .72); ctx.lineTo(S1 * .98, H1 * .72);
    ctx.quadraticCurveTo(S1 * .78, H1, S1 * .5, H1); ctx.quadraticCurveTo(S1 * .22, H1, S1 * .02, H1 * .72);
    ctx.closePath(); ctx.fill();
    ctx.lineWidth = S1 * .045;
    ctx.beginPath(); ctx.moveTo(S1 * .5, H1 * .72); ctx.lineTo(S1 * .5, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(S1 * .5, H1 * .06); ctx.lineTo(S1 * .5, H1 * .66);
    ctx.quadraticCurveTo(S1 * .16, H1 * .6, S1 * .5, H1 * .06); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S1 * .52, H1 * .02); ctx.lineTo(S1 * .78, H1 * .09); ctx.lineTo(S1 * .52, H1 * .17); ctx.closePath(); ctx.fill();
    ctx.restore();
  } else if (id === 'cat') {
    ctx.beginPath(); ctx.ellipse(S1 * .52, H1 * .66, S1 * .42, H1 * .27, 0, 0, TAU); ctx.fill();
    ctx.fillRect(S1 * .2, H1 * .82, S1 * .1, H1 * .18);
    ctx.fillRect(S1 * .62, H1 * .82, S1 * .1, H1 * .18);
    ctx.beginPath(); ctx.arc(S1 * .26, H1 * .3, S1 * .22, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S1 * .08, H1 * .2); ctx.lineTo(S1 * .05, H1 * .01); ctx.lineTo(S1 * .24, H1 * .12); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S1 * .3, H1 * .1); ctx.lineTo(S1 * .46, H1 * .0); ctx.lineTo(S1 * .45, H1 * .22); ctx.closePath(); ctx.fill();
    ctx.lineWidth = S1 * .07;
    ctx.beginPath(); ctx.moveTo(S1 * .9, H1 * .66);
    ctx.quadraticCurveTo(S1 * (1.1 + wig * .05), H1 * .4, S1 * .86, H1 * (.2 + wig * .04)); ctx.stroke();
  } else if (id === 'bird') {
    ctx.beginPath(); ctx.ellipse(S1 * .5, H1 * .56, S1 * .27, H1 * .22, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(S1 * .24, H1 * .44, S1 * .11, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S1 * .16, H1 * .42); ctx.lineTo(S1 * .02, H1 * .5); ctx.lineTo(S1 * .16, H1 * .56); ctx.closePath(); ctx.fill();
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(S1 * .5, H1 * .48); ctx.rotate(s * (.5 + wig * .5));
      ctx.beginPath(); ctx.ellipse(0, -H1 * .3, S1 * .12, H1 * .32, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(S1 * .74, H1 * .56); ctx.lineTo(S1 * .99, H1 * .78); ctx.lineTo(S1 * .74, H1 * .74); ctx.closePath(); ctx.fill();
  } else if (id === 'rocket') {
    ctx.beginPath();
    ctx.moveTo(S1 * .5, 0); ctx.quadraticCurveTo(S1 * .84, H1 * .3, S1 * .8, H1 * .76);
    ctx.lineTo(S1 * .2, H1 * .76); ctx.quadraticCurveTo(S1 * .16, H1 * .3, S1 * .5, 0);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S1 * .2, H1 * .5); ctx.lineTo(S1 * .0, H1 * .84); ctx.lineTo(S1 * .2, H1 * .78); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S1 * .8, H1 * .5); ctx.lineTo(S1, H1 * .84); ctx.lineTo(S1 * .8, H1 * .78); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(S1 * .5, H1 * .34, S1 * .15, 0, TAU); ctx.fill(); ctx.restore();
    ctx.fillStyle = P.flame;
    const fl = .16 + Math.abs(wig) * .12;
    ctx.beginPath(); ctx.moveTo(S1 * .34, H1 * .78); ctx.quadraticCurveTo(S1 * .5, H1 * (.78 + fl * 2.4), S1 * .66, H1 * .78);
    ctx.closePath(); ctx.fill();
  } else {
    /* شتر */
    ctx.beginPath(); ctx.ellipse(S1 * .42, H1 * .56, S1 * .34, H1 * .2, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S1 * .18, H1 * .44); ctx.quadraticCurveTo(S1 * .32, H1 * .12, S1 * .46, H1 * .44); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S1 * .46, H1 * .46); ctx.quadraticCurveTo(S1 * .58, H1 * .18, S1 * .7, H1 * .46); ctx.closePath(); ctx.fill();
    ctx.lineWidth = S1 * .1;
    ctx.beginPath(); ctx.moveTo(S1 * .7, H1 * .5); ctx.quadraticCurveTo(S1 * .88, H1 * .3, S1 * .86, H1 * .1); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(S1 * .92, H1 * .07, S1 * .09, H1 * .06, -.3, 0, TAU); ctx.fill();
    ctx.lineWidth = S1 * .055;
    for (let k = 0; k < 4; k++) {
      const lx = S1 * (.24 + k * .13), sw = Math.sin(t * 3 + k * 1.5) * S1 * .015;
      ctx.beginPath(); ctx.moveTo(lx, H1 * .7); ctx.lineTo(lx + sw, H1 * .98); ctx.stroke();
    }
  }
  ctx.restore();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.night);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 9;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  drawHall();
  drawScreen();
  drawCandle();
  drawRack();
  drawDrag();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    ctx.save();
    ctx.translate(SCREEN.x + SCREEN.w / 2 - SCENE_W / 2, 0);
    toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
    ctx.restore();
  }
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.14, 'rgba(6, 2, 10, .5)');
}

function drawHall() {
  const g = ctx.createRadialGradient(SCENE_W / 2, 300, 60, SCENE_W / 2, 320, 780);
  g.addColorStop(0, '#2e2136');
  g.addColorStop(1, P.nightLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* پرده‌های مخملی دو طرف */
  for (const side of [0, 1]) {
    ctx.save();
    if (side) { ctx.translate(SCENE_W, 0); ctx.scale(-1, 1); }
    ctx.fillStyle = P.curtainDk;
    ctx.beginPath();
    ctx.moveTo(0, HUD_H); ctx.lineTo(238, HUD_H);
    for (let y = HUD_H; y <= SCENE_H; y += 18) ctx.lineTo(214 + Math.sin(y * .014) * 26, y);
    ctx.lineTo(0, SCENE_H); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 ? P.curtain : P.curtainLt;
      ctx.globalAlpha = .5;
      ctx.beginPath();
      const bx = 16 + i * 42;
      ctx.moveTo(bx, HUD_H);
      for (let y = HUD_H; y <= SCENE_H; y += 18) ctx.lineTo(bx + Math.sin(y * .015 + i) * 11, y);
      ctx.lineTo(bx + 15, SCENE_H);
      for (let y = SCENE_H; y >= HUD_H; y -= 18) ctx.lineTo(bx + 15 + Math.sin(y * .015 + i) * 11, y);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  /* چوبِ بالای صحنه */
  ctx.fillStyle = P.woodDk;
  ctx.fillRect(0, HUD_H, SCENE_W, 16);
  ctx.fillStyle = P.wood;
  ctx.fillRect(0, HUD_H, SCENE_W, 8);

  /* پروانه‌های شب گردِ نور */
  ctx.fillStyle = 'rgba(255, 232, 180, .5)';
  for (const m of S.moths) {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(Math.sin(m.ph * 3) * .5);
    ctx.beginPath(); ctx.ellipse(-m.r, 0, m.r, m.r * .5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(m.r, 0, m.r, m.r * .5, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

/** پردهٔ روشن با سایهٔ خالی و تکّه‌های چیده‌شده. */
function drawScreen() {
  withShadow(30, 12, .5, () => {
    ctx.fillStyle = P.woodDk;
    wobbleRect(SCREEN.x - 16, SCREEN.y - 16, SCREEN.w + 32, SCREEN.h + 32, 12, 11, 2); ctx.fill();
  }, '4, 0, 8');
  const g = ctx.createRadialGradient(SCREEN.x + SCREEN.w / 2, SCREEN.y + SCREEN.h * .42, 40,
                                     SCREEN.x + SCREEN.w / 2, SCREEN.y + SCREEN.h * .5, SCREEN.w * .78);
  g.addColorStop(0, P.screen);
  g.addColorStop(1, P.screen2);
  ctx.save();
  ctx.beginPath(); rrPath(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, 8); ctx.clip();
  ctx.fillStyle = g;
  ctx.fillRect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h);
  /* بافتِ پارچه */
  ctx.strokeStyle = 'rgba(180, 140, 80, .1)'; ctx.lineWidth = 1;
  for (let y = SCREEN.y; y < SCREEN.y + SCREEN.h; y += 7) {
    ctx.beginPath(); ctx.moveTo(SCREEN.x, y); ctx.lineTo(SCREEN.x + SCREEN.w, y); ctx.stroke();
  }
  if (!S.shape) { ctx.restore(); return; }
  const sh = S.shape;

  if (S.alive) {
    /* عروسک جان می‌گیرد */
    const k = clamp(S.alive / .45, 0, 1);
    ctx.globalAlpha = 1 - k;
    drawCells();
    ctx.globalAlpha = k;
    silhouette(sh.id, S.gx, S.gy, sh.w * CELL, sh.h * CELL, S.alive * 3);
    ctx.globalAlpha = 1;
  } else {
    /* جای خالیِ سایه */
    for (let r = 0; r < sh.h; r++) for (let c = 0; c < sh.w; c++) {
      if (!S.need[r][c] || S.fill[r][c] >= 0) continue;
      ctx.fillStyle = P.hole;
      ctx.fillRect(S.gx + c * CELL, S.gy + r * CELL, CELL, CELL);
    }
    /* خطّ دورِ سایه، تا مرزِ مسئله روشن باشد */
    ctx.strokeStyle = 'rgba(44, 29, 39, .7)'; ctx.lineWidth = 3.5;
    edgePath(); ctx.stroke();
    drawCells();
  }
  ctx.restore();

  if (S.glow > 0) {
    ctx.save();
    ctx.globalAlpha = S.glow * .5;
    ctx.fillStyle = P.flameHot;
    ctx.beginPath(); rrPath(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, 8); ctx.fill();
    ctx.restore();
  }
}

/** مرزِ بیرونیِ سایه (فقط ضلع‌هایی که همسایه ندارند). */
function edgePath() {
  const sh = S.shape;
  ctx.beginPath();
  const on = (r, c) => r >= 0 && c >= 0 && r < sh.h && c < sh.w && S.need[r][c];
  for (let r = 0; r < sh.h; r++) for (let c = 0; c < sh.w; c++) {
    if (!S.need[r][c]) continue;
    const x = S.gx + c * CELL, y = S.gy + r * CELL;
    if (!on(r - 1, c)) { ctx.moveTo(x, y); ctx.lineTo(x + CELL, y); }
    if (!on(r + 1, c)) { ctx.moveTo(x, y + CELL); ctx.lineTo(x + CELL, y + CELL); }
    if (!on(r, c - 1)) { ctx.moveTo(x, y); ctx.lineTo(x, y + CELL); }
    if (!on(r, c + 1)) { ctx.moveTo(x + CELL, y); ctx.lineTo(x + CELL, y + CELL); }
  }
}

function drawCells() {
  for (const q of S.placed) {
    const x = S.gx + q.c * CELL, y = S.gy + q.r * CELL, w = q.w * CELL, h = q.h * CELL;
    ctx.fillStyle = P.piece;
    ctx.beginPath(); rrPath(x + 1.5, y + 1.5, w - 3, h - 3, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255, 235, 190, .07)';
    ctx.beginPath(); rrPath(x + 4, y + 4, w - 8, 5, 3); ctx.fill();
    ctx.strokeStyle = P.pieceEdge; ctx.lineWidth = 1.6;
    ctx.beginPath(); rrPath(x + 1.5, y + 1.5, w - 3, h - 3, 5); ctx.stroke();
  }
}

/** تکّه‌ای که روی چوبِ عروسک‌گردانی است. */
function paperPiece(x, y, w, h, s, hot) {
  const W = w * CELL * s, H = h * CELL * s;
  withShadow(hot ? 16 : 8, hot ? 6 : 3, .4, () => {
    ctx.fillStyle = hot ? P.pieceLt : P.piece;
    wobbleRect(x - W / 2, y - H / 2, W, H, 6, x + y, 1.4); ctx.fill();
  }, '4, 0, 8');
  ctx.strokeStyle = P.pieceEdge; ctx.lineWidth = 2;
  wobbleRect(x - W / 2, y - H / 2, W, H, 6, x + y, 1.4); ctx.stroke();
  /* شبکهٔ داخلی تا اندازه‌اش شمردنی باشد */
  ctx.strokeStyle = 'rgba(255, 235, 190, .13)'; ctx.lineWidth = 1;
  for (let i = 1; i < w; i++) {
    ctx.beginPath(); ctx.moveTo(x - W / 2 + i * CELL * s, y - H / 2 + 3); ctx.lineTo(x - W / 2 + i * CELL * s, y + H / 2 - 3); ctx.stroke();
  }
  for (let i = 1; i < h; i++) {
    ctx.beginPath(); ctx.moveTo(x - W / 2 + 3, y - H / 2 + i * CELL * s); ctx.lineTo(x + W / 2 - 3, y - H / 2 + i * CELL * s); ctx.stroke();
  }
}

function drawRack() {
  ctx.fillStyle = 'rgba(12, 6, 18, .55)';
  ctx.beginPath(); rrPath(RACK.x, RACK.y, RACK.w, RACK.h, 16); ctx.fill();
  ctx.fillStyle = P.woodDk;
  ctx.fillRect(RACK.x, RACK.y + RACK.h - 16, RACK.w, 16);
  ctx.fillStyle = P.wood;
  ctx.fillRect(RACK.x, RACK.y + RACK.h - 16, RACK.w, 6);
  text('تکّه‌های پشتِ صحنه', RACK.x + RACK.w / 2, RACK.y + 22,
    { size: 17, color: 'rgba(246, 233, 210, .5)' });

  for (const q of S.rack) {
    if (q.used) continue;
    if (S.drag && S.drag.from === 'rack' && S.rack[S.drag.i] === q) continue;
    /* چوبِ عروسک‌گردانی */
    ctx.strokeStyle = P.wood; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(q.x, q.y + q.h * CELL * q.s / 2 - 3); ctx.lineTo(q.x, RACK.y + RACK.h - 12); ctx.stroke();
    paperPiece(q.x, q.y, q.w, q.h, q.s, false);
  }
}

function drawDrag() {
  const d = S.drag;
  if (!d) return;
  const cx = d.x - (d.dx || 0), cy = d.y - (d.dy || 0);
  const g = gridOf({ x: cx - d.w * CELL / 2 + CELL / 2, y: cy - d.h * CELL / 2 + CELL / 2 });
  const ok = canPlace(d.w, d.h, g.c, g.r);
  if (ok) {
    ctx.save();
    ctx.globalAlpha = .35;
    ctx.fillStyle = P.piece;
    ctx.fillRect(S.gx + g.c * CELL, S.gy + g.r * CELL, d.w * CELL, d.h * CELL);
    ctx.restore();
  }
  paperPiece(cx, cy, d.w, d.h, 1, true);
}

/** شمعِ کنارِ صحنه — همان وقتِ بازی. */
function drawCandle() {
  const b = CANDLE;
  const hMax = b.h - 90;
  const h = hMax * clamp(S.wax, 0, 1);
  const baseY = b.y + b.h - 30;
  /* پایه */
  ctx.fillStyle = '#8d6a3a';
  wobbleEllipse(b.x + b.w / 2, baseY + 14, 54, 13, 0, 71, 1.6); ctx.fill();
  ctx.fillStyle = '#a9814a';
  wobbleRect(b.x + b.w / 2 - 16, baseY - 6, 32, 20, 5, 73, 1); ctx.fill();
  /* بدنهٔ شمع */
  ctx.fillStyle = '#f0e3c4';
  wobbleRect(b.x + b.w / 2 - 21, baseY - h, 42, h + 4, 8, 75, 1.4); ctx.fill();
  ctx.fillStyle = 'rgba(180, 150, 100, .3)';
  wobbleRect(b.x + b.w / 2 + 7, baseY - h, 14, h + 4, 6, 77, 1.2); ctx.fill();
  /* شعله */
  const fy = baseY - h - 6;
  const fl = 1 + Math.sin(S.t * 9) * .12;
  ctx.save();
  const gg = ctx.createRadialGradient(b.x + b.w / 2, fy - 14, 4, b.x + b.w / 2, fy - 14, 96 * fl);
  gg.addColorStop(0, 'rgba(255, 214, 130, .34)');
  gg.addColorStop(1, 'rgba(255, 190, 100, 0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(b.x + b.w / 2, fy - 14, 96 * fl, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = P.flame;
  ctx.beginPath();
  ctx.moveTo(b.x + b.w / 2, fy - 40 * fl);
  ctx.quadraticCurveTo(b.x + b.w / 2 + 15, fy - 12, b.x + b.w / 2, fy);
  ctx.quadraticCurveTo(b.x + b.w / 2 - 15, fy - 12, b.x + b.w / 2, fy - 40 * fl);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.flameHot;
  ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, fy - 13, 5, 11 * fl, 0, 0, TAU); ctx.fill();
  if (S.wax < .28) {
    ctx.save();
    ctx.globalAlpha = .5 + .5 * Math.sin(S.t * 7);
    text('شمع دارد تمام می‌شود', b.x + b.w / 2, b.y - 18, { size: 16, color: '#e6b06a' });
    ctx.restore();
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(24, 14, 30, .86)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(233, 183, 74, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2,
      { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(246, 233, 210, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([SCREEN], .74);
    const h = tutCard(350, 592, 500,
      ['سایهٔ یک چیز روی پرده افتاده.', 'هیچ تکّه‌ای به‌تنهایی اندازهٔ آن نیست.'], 'تئاترِ سایه');
    tutMore(600, 592 + h + 12, S.t, P.ink);
  } else if (st === 1) {
    spot([RACK], .7);
    tutCard(350, 150, 500, ['یک تکّه را بردار و بکِش روی سایه.',
      'خودش سرِ جایش می‌نشیند.'], 'یک تکّه را بکِش');
  } else {
    spot([SCREEN, RACK], .66);
    const h = tutCard(350, 300, 500,
      ['روی تکّهٔ رَف بزن تا بچرخد.', 'روی تکّهٔ چیده‌شده بزن تا برش داری.',
       'وقتی سایه پُر شد، عروسک جان می‌گیرد.'], 'باقی‌اش با تو');
    tutMore(600, 300 + h + 12, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function maskIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.shade;
  ctx.beginPath(); ctx.ellipse(0, 2, 22, 26, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, -14); ctx.lineTo(-24, -34); ctx.lineTo(-4, -22); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(20, -14); ctx.lineTo(24, -34); ctx.lineTo(4, -22); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.flame;
  ctx.beginPath(); ctx.arc(-8, 0, 4, 0, TAU); ctx.arc(8, 0, 4, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 730, h: 268, y: 146,
    paper: P.paper, band: P.curtain, ink: P.ink, inkSoft: '#7a6070',
    icon: maskIcon,
    title: 'تئاترِ سایه',
    body: 'سایه‌ای روی پرده افتاده که از چند تکّهٔ ساده ساخته شده.\nتکّه‌های پشتِ صحنه را بکِش روی آن تا کاملش کنی.\nتا شمع نسوخته، عروسک را زنده کن.',
    btn: BTN_GO, btnLabel: 'پرده را بالا بکش', btnHot: S.hover === BTN_GO,
    btnFill: '#7c3149', btnHotFill: '#93405b',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#7a6070',
    icon: maskIcon,
    title: L().endless ? 'شبِ خوبی بود' : 'تشویقِ تماشاچی‌ها!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ پرده‌ها را بازی کردی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'پردهٔ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#7c3149', btnHotFill: '#93405b',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#7a6070',
    icon: (x, y) => { ctx.fillStyle = '#7a6a58';
      wobbleRect(x - 12, y - 20, 24, 44, 6, 161, 1.4); ctx.fill();
      ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x + 6, y - 32); ctx.stroke(); },
    title: 'شمع تمام شد',
    body: 'امتیاز: ' + fa(S.score) + '\nسایهٔ بزرگ را به تکّه‌های کوچک بشکن.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#7c3149', btnHotFill: '#93405b',
  });
}

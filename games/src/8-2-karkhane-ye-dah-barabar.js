/*!
title: کارخانهٔ ده‌برابر — ضرب در ۱۰
bg: #12242a
*/

/* ═══════════════════════════════════════════════════════════════════════
   کارخانهٔ ده‌برابر — ریاضی سوم، فصل ۸، درس ۲ (ضرب در عدد ۱۰)
   ───────────────────────────────────────────────────────────────────────
   کتاب می‌پرسد: «بین تعداد صفرهای دو عدد و تعداد صفرهای حاصل‌ضرب چه
   رابطه‌ای وجود دارد؟» و می‌خواهد بچّه خودش کشفش کند.

   اینجا جعبه‌ای پر از چینه روی نوار نقّاله راه می‌افتد و از دلِ چند
   دستگاه می‌گذرد. دستگاهِ «×۱۰» کارِ عجیبی نمی‌کند: هر چینه را یک پلّه
   بالا می‌بَرد — یکی می‌شود ده‌تایی، ده‌تایی می‌شود صدتایی. برای همین
   یک صفر ته عدد سبز می‌شود. دستگاهِ «×۳» هم هر چینه را سه برابر می‌کند.

   سفارشِ انبار یک عدد است و بس. کدام دستگاه‌ها را روی نوار بگذاری تا
   جعبه دقیقاً همان‌قدر شود؟ جواب نوشته نمی‌شود؛ روی خودِ نوار پیدا
   می‌شود — و چون چند چیدمان به یک جواب می‌رسد، دست بچّه باز است.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  wall:  '#1d3a42', wallLo: '#0e1e23', wallHi: '#2f5b66',
  steel: '#54707a', steelDk: '#2c4149', steelLt: '#8aa8b2',
  copper:'#c0794a', copperDk: '#8a4f26', copperLt: '#e8a86a',
  belt:  '#2a3238', beltLt: '#48545c',
  wood:  '#8a5f33', woodDk: '#4d3218', woodLt: '#b88752',
  brass: '#cfa74e', brassDk: '#8f7327', brassLt: '#f2dd99',
  paper: '#f4ecd9', card: '#fdf7e8', ink: '#22333a', inkSoft: '#748b93',
  good:  '#5da26f', bad: '#cd5b45', gold: '#eab53f', lamp: '#ffd08a',
  /* رنگِ چینه‌ها بر حسبِ ارزشِ مکانی */
  one: '#e0b13c', ten: '#5aa8d8', hun: '#5da26f', tho: '#c05b8f',
};

const LEVELS = [
  { name: 'نوارِ کوتاه', slots: 2, extra: 2, big: false, quota: 3, time: 80,
    hint: 'دستگاه را بردار و روی جای خالیِ نوار بگذار.' },
  { name: 'صد هم هست', slots: 2, extra: 2, big: true, quota: 3, time: 82,
    hint: 'ببین هر ×۱۰ چند صفر ته عدد می‌گذارد.' },
  { name: 'سه دستگاه', slots: 3, extra: 2, big: true, quota: 3, time: 92,
    hint: 'ترتیبشان مهم نیست؛ حاصل یکی است.' },
  { name: 'سفارشِ بزرگ', slots: 3, extra: 3, big: true, quota: 4, time: 96,
    hint: 'دستگاهِ اضافه هم روی قفسه هست؛ حواست باشد.' },
  { name: 'تا نوار می‌چرخد', slots: 3, extra: 3, big: true, time: 92, endless: true,
    hint: 'تا نوار می‌چرخد، سفارش هست.' },
];

const BELT = { y: 424, x0: 110, x1: 1096 };
const SHELF = { x: 150, y: 560, w: 900, h: 168 };
const CHUTE = { x: 1060, y: 300 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0, slots: 2,
  start: 2, target: 20,
  shelf: [],            /* { m, used } */
  slot: [],             /* شناسهٔ دستگاهِ قفسه در هر جا، یا ‑۱ */
  run: null,            /* { i, t, from, to } */
  crateX: 0, val: 0,
  timeLeft: 0, boxes: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  done: 0, doneT: 0, held: -1, hx: 0, hy: 0, px: 0, py: 0,
  steam: [], bad: 0,
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function loadBest() { try { return +localStorage.getItem('dahbarabar-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('dahbarabar-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();

/* ───────── سفارشِ تازه ───────── */

function newOrder() {
  const lv = L();
  const pool = lv.big ? [10, 100] : [10];
  for (let tries = 0; tries < 300; tries++) {
    const start = R(2, 9);
    const chain = [];
    /* حدّاکثر یک دستگاهِ رقمی، بقیه ده و صد — تا چینه‌ها تمیز بمانند */
    const withDigit = Math.random() < .7;
    if (withDigit) chain.push(R(2, 9));
    while (chain.length < lv.slots) chain.push(pool[R(0, pool.length - 1)]);
    for (let i = chain.length - 1; i > 0; i--) { const j = R(0, i); const t = chain[i]; chain[i] = chain[j]; chain[j] = t; }
    const target = chain.reduce((a, b) => a * b, start);
    if (target > 9999 || target < 20) continue;
    /* قفسه: دستگاه‌های لازم به‌علاوهٔ چند دستگاهِ اضافه */
    const shelf = chain.slice();
    for (let i = 0; i < lv.extra; i++) shelf.push(Math.random() < .5 ? R(2, 9) : pool[R(0, pool.length - 1)]);
    for (let i = shelf.length - 1; i > 0; i--) { const j = R(0, i); const t = shelf[i]; shelf[i] = shelf[j]; shelf[j] = t; }
    S.start = start; S.target = target;
    S.shelf = shelf.map((m) => ({ m, used: false }));
    S.slot = new Array(lv.slots).fill(-1);
    S.slots = lv.slots;
    S.val = start;
    S.run = null; S.crateX = BELT.x0 + 60;
    S.done = 0; S.doneT = 0; S.held = -1; S.bad = 0;
    return;
  }
  S.start = 3; S.target = 300;
  S.shelf = [{ m: 10, used: false }, { m: 10, used: false }, { m: 4, used: false }, { m: 100, used: false }];
  S.slot = new Array(lv.slots).fill(-1);
  S.slots = lv.slots; S.val = 3; S.run = null; S.crateX = BELT.x0 + 60;
  S.done = 0; S.doneT = 0; S.held = -1; S.bad = 0;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.boxes = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newOrder();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

newOrder();
whenFontsReady(() => runLoop(step));

function slotBox(i) {
  const w = 150, gap = S.slots === 2 ? 190 : 96;
  const total = S.slots * w + (S.slots - 1) * gap;
  const x = (SCENE_W - total) / 2 + i * (w + gap);
  return { x, y: BELT.y - 196, w, h: 168 };
}
function shelfSlot(i) {
  const n = S.shelf.length, w = 104, gap = 20;
  const total = n * w + (n - 1) * gap;
  return { x: SHELF.x + (SHELF.w - total) / 2 + i * (w + gap), y: SHELF.y + 42, w, h: 104 };
}
const filled = () => S.slot.every((v) => v >= 0);
const chainVal = () => S.slot.reduce((a, i) => (i < 0 ? a : a * S.shelf[i].m), S.start);

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.bad > 0) S.bad -= dt;
  if (Math.random() < dt * 10) S.steam.push({ x: 946 + (Math.random() - .5) * 16, y: 236, r: 5 + Math.random() * 6, t: 0, dur: 1.8 + Math.random() });
  for (const s of S.steam) { s.t += dt; s.y -= 26 * dt; s.r += 8 * dt; }
  S.steam = S.steam.filter((s) => s.t < s.dur);

  if (S.run) {
    const r = S.run;
    r.t += dt;
    const k = clamp(r.t / r.dur, 0, 1);
    S.crateX = lerp(r.from, r.to, easeInOut(k));
    if (r.t >= r.dur) {
      if (r.i < S.slots) {
        S.val *= S.shelf[S.slot[r.i]].m;
        sfx.tone(300 + r.i * 120, .12, 'triangle', .07);
        bits.add(slotBox(r.i).x + 75, BELT.y - 30, 12, 'dot', [P.brassLt, P.lamp],
          { speed: 160, lift: 60, size: 3.4, life: .5, grav: 300 });
        r.i++;
        nextLeg();
      } else { S.run = null; deliver(); }
    }
  }

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.done) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseBox('وقتِ کارخانه تمام شد!'); }
    }
    if (S.done) { S.doneT += dt; if (S.doneT > 2.2) { newOrder(); S.timeLeft = L().time; } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function nextLeg() {
  const r = S.run;
  const to = r.i < S.slots ? slotBox(r.i).x + 75 : CHUTE.x - 40;
  r.from = S.crateX; r.to = to; r.t = 0;
  r.dur = .7;
}

function startRun() {
  if (S.run || S.done) return;
  S.val = S.start;
  S.crateX = BELT.x0 + 60;
  S.run = { i: 0, t: 0, from: S.crateX, to: slotBox(0).x + 75, dur: .7 };
  sfx.slide();
}

function deliver() {
  if (S.val === S.target) finish();
  else {
    S.bad = 1;
    S.shake = .3;
    sfx.nope();
    toast.say('این‌قدر نشد. دستگاه‌ها را عوض کن.', 'bad');
    S.val = S.start;
    S.crateX = BELT.x0 + 60;
  }
}

function loseBox(msg) {
  if (S.done) return;
  S.boxes--;
  S.combo = 0;
  S.shake = .5;
  S.run = null;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.boxes <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newOrder();
}

function finish() {
  S.done = .001; S.doneT = 0;
  S.combo++;
  S.cleared++;
  S.score += 340 + S.slots * 90 + Math.round(S.timeLeft * 4) + Math.min(S.combo, 6) * 70;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(CHUTE.x - 40, BELT.y - 60, 46, [P.gold, P.brassLt, P.hun, P.ten, '#fff']);
  sfx.win();
  toast.say('سفارش رسید!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function putIn(slotI) {
  if (S.held < 0 || S.run || S.done) return;
  if (S.slot[slotI] >= 0) return;
  S.shelf[S.held].used = true;
  S.slot[slotI] = S.held;
  S.held = -1;
  sfx.place();
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
  if (filled()) startRun();
}

function takeOut(slotI) {
  if (S.run || S.done) return;
  const i = S.slot[slotI];
  if (i < 0) return;
  S.shelf[i].used = false;
  S.slot[slotI] = -1;
  S.val = S.start;
  S.crateX = BELT.x0 + 60;
  sfx.tap();
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.held >= 0) { S.hx = p.x; S.hy = p.y; return; }
  S.hover = null;
  for (let i = 0; i < S.slots; i++) if (inRect(p, slotBox(i))) S.hover = { k: 'slot', i };
  for (let i = 0; i < S.shelf.length; i++) if (!S.shelf[i].used && inRect(p, shelfSlot(i))) S.hover = { k: 'shelf', i };
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
  if (S.run || S.done) return;
  if (S.held >= 0) {
    for (let i = 0; i < S.slots; i++) if (inRect(p, slotBox(i))) { putIn(i); return; }
    S.held = -1; sfx.tap();
    return;
  }
  for (let i = 0; i < S.slots; i++) if (inRect(p, slotBox(i)) && S.slot[i] >= 0) { takeOut(i); return; }
  for (let i = 0; i < S.shelf.length; i++) if (!S.shelf[i].used && inRect(p, shelfSlot(i))) {
    S.held = i; S.hx = p.x; S.hy = p.y; S.px = p.x; S.py = p.y; sfx.tap();
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    return;
  }
});

cv.addEventListener('pointerup', (e) => {
  if (S.held < 0 || S.phase !== 'play') return;
  const p = toStage(e);
  if (Math.hypot(p.x - S.px, p.y - S.py) < 14) return;    /* ضربهٔ ساده: دستگاه در دست می‌ماند */
  for (let i = 0; i < S.slots; i++) if (inRect(p, slotBox(i))) { putIn(i); return; }
  S.held = -1;
});

cv.addEventListener('pointercancel', () => { S.held = -1; });

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
  if (o.stroke) { ctx.lineWidth = o.strokeWidth || 5; ctx.lineJoin = 'round'; ctx.strokeStyle = o.stroke; ctx.strokeText(str, x, y); }
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(4, 12, 15, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(253, 247, 232, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '4, 12, 15');
  ctx.fillStyle = P.copperDk;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#657f88' }); yy += 30; }
  return h + 20;
}

const PLACE = [
  { v: 1,    c: P.one, n: 'یکی' },
  { v: 10,   c: P.ten, n: 'ده‌تایی' },
  { v: 100,  c: P.hun, n: 'صدتایی' },
  { v: 1000, c: P.tho, n: 'هزارتایی' },
];

/** چینه‌های یک عدد: هزارتایی، صدتایی، ده‌تایی، یکی. */
function chips(cx, cy, val, sc = 1) {
  const d = [Math.floor(val / 1000) % 10, Math.floor(val / 100) % 10, Math.floor(val / 10) % 10, val % 10];
  const list = [];
  for (let k = 0; k < 4; k++) for (let n = 0; n < d[k]; n++) list.push(3 - k);
  const cols = 5, w = 15 * sc, h = 15 * sc;
  const rows = Math.ceil(list.length / cols);
  for (let i = 0; i < list.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const x = cx + (col - (cols - 1) / 2) * (w + 3 * sc);
    const y = cy + (row - (rows - 1) / 2) * (h + 3 * sc);
    const pl = PLACE[list[i]];
    ctx.fillStyle = shade(pl.c, -.35);
    ctx.beginPath(); rrPath(x - w / 2, y - h / 2 + 2, w, h, 3 * sc); ctx.fill();
    ctx.fillStyle = pl.c;
    ctx.beginPath(); rrPath(x - w / 2, y - h / 2, w, h, 3 * sc); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath(); rrPath(x - w / 2 + 2 * sc, y - h / 2 + 2 * sc, w - 4 * sc, 3 * sc, 1.5 * sc); ctx.fill();
  }
}

/** جعبهٔ روی نوار، با عددش. */
function crate(x, y, val, hot) {
  const w = 116, h = 92;
  contact(x, y + 8, 56, 10, .5);
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(x - w / 2, y - h, w, h, 8); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(x - w / 2 + 4, y - h + 4, w - 8, h - 8, 6); ctx.clip();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.fillRect(x - w / 2, y - h, w, h);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fillRect(x - w / 2, y - h, w, 26);
  ctx.restore();
  ctx.strokeStyle = hot ? P.brassLt : P.brassDk; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(x - w / 2, y - h, w, h, 8); ctx.stroke();
  numText(fa(val), x, y - h + 15, { size: 21, color: P.brassLt });
  chips(x, y - h + 58, val, .95);
}

/** دستگاهِ ضرب. */
function machine(x, y, w, h, m, o = {}) {
  const ten = m === 10 || m === 100;
  withShadow(14, 6, .4, () => {
    ctx.fillStyle = ten ? P.copperDk : P.steelDk;
    ctx.beginPath(); rrPath(x, y, w, h, 12); ctx.fill();
  }, '4, 12, 15');
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, ten ? P.copperLt : P.steelLt);
  g.addColorStop(.5, ten ? P.copper : P.steel);
  g.addColorStop(1, ten ? P.copperDk : P.steelDk);
  ctx.fillStyle = g;
  ctx.beginPath(); rrPath(x + 3, y + 3, w - 6, h - 6, 10); ctx.fill();
  /* پیچ‌ها */
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  for (const [dx, dy] of [[12, 12], [w - 12, 12], [12, h - 12], [w - 12, h - 12]]) {
    ctx.beginPath(); ctx.arc(x + dx, y + dy, 4, 0, TAU); ctx.fill();
  }
  /* صفحهٔ عدد */
  ctx.fillStyle = 'rgba(10, 20, 24, .8)';
  ctx.beginPath(); rrPath(x + 16, y + h / 2 - 24, w - 32, 48, 8); ctx.fill();
  numText('×' + fa(m), x + w / 2, y + h / 2 + 1, { size: 30, color: ten ? P.lamp : P.brassLt });
  if (o.ring) {
    ctx.strokeStyle = o.ring; ctx.lineWidth = 3;
    ctx.beginPath(); rrPath(x - 3, y - 3, w + 6, h + 6, 14); ctx.stroke();
  }
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintFactoryStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallLo); g.addColorStop(.45, P.wall); g.addColorStop(1, '#0a171b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.globalAlpha = .4;
  ctx.fillStyle = texStone('#22414a', '#33606d');
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* ورق‌های موج‌دارِ دیوار */
  ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 3;
  for (let x = 0; x < SCENE_W; x += 34) { ctx.beginPath(); ctx.moveTo(x, HUD_H); ctx.lineTo(x, 540); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(180, 220, 230, .06)'; ctx.lineWidth = 2;
  for (let x = 4; x < SCENE_W; x += 34) { ctx.beginPath(); ctx.moveTo(x, HUD_H); ctx.lineTo(x, 540); ctx.stroke(); }
  /* لوله‌های سقف */
  for (const y of [98, 132]) {
    ctx.strokeStyle = P.copperDk; ctx.lineWidth = 20;
    ctx.beginPath(); ctx.moveTo(-10, y); ctx.lineTo(SCENE_W + 10, y); ctx.stroke();
    ctx.strokeStyle = P.copper; ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(-10, y); ctx.lineTo(SCENE_W + 10, y); ctx.stroke();
    ctx.strokeStyle = P.copperLt; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-10, y - 4); ctx.lineTo(SCENE_W + 10, y - 4); ctx.stroke();
    for (let x = 60; x < SCENE_W; x += 190) {
      ctx.fillStyle = P.brassDk;
      ctx.beginPath(); rrPath(x - 9, y - 14, 18, 28, 4); ctx.fill();
    }
  }
  /* کفِ کارگاه */
  ctx.fillStyle = '#152227';
  ctx.fillRect(0, 540, SCENE_W, SCENE_H - 540);
  ctx.fillStyle = texStone('#1e3038', '#2c4750');
  ctx.fillRect(0, 546, SCENE_W, SCENE_H - 546);
  ctx.fillStyle = 'rgba(200, 230, 236, .1)';
  ctx.fillRect(0, 546, SCENE_W, 3);
  /* قفسهٔ دستگاه‌ها */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(SHELF.x - 14, SHELF.y - 12, SHELF.w + 28, SHELF.h + 26, 14); ctx.fill();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.beginPath(); rrPath(SHELF.x - 8, SHELF.y - 6, SHELF.w + 16, SHELF.h + 14, 10); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.fillRect(SHELF.x - 8, SHELF.y + SHELF.h + 8, SHELF.w + 16, 8);
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.wall);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('factory', SCENE_W, SCENE_H, paintFactoryStatic), 0, 0, SCENE_W, SCENE_H);
  drawBelt();
  drawSlots();
  drawChute();
  crate(S.crateX, BELT.y - 6, S.val, !!S.run);
  drawSteam();
  drawShelf();
  bits.draw();
  if (S.held >= 0) machine(S.hx - 52, S.hy - 52, 104, 104, S.shelf[S.held].m);
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.1, 'rgba(3, 10, 13, .5)', .4, .15);
}

function drawBelt() {
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(BELT.x0 - 16, BELT.y - 4, BELT.x1 - BELT.x0 + 32, 40, 18); ctx.fill();
  ctx.fillStyle = P.belt;
  ctx.beginPath(); rrPath(BELT.x0 - 10, BELT.y, BELT.x1 - BELT.x0 + 20, 30, 14); ctx.fill();
  /* شِوِرون‌های متحرّک */
  ctx.save();
  ctx.beginPath(); rrPath(BELT.x0 - 10, BELT.y, BELT.x1 - BELT.x0 + 20, 30, 14); ctx.clip();
  ctx.strokeStyle = P.beltLt; ctx.lineWidth = 4;
  const off = (S.t * 60) % 40;
  for (let x = BELT.x0 - 60 + off; x < BELT.x1 + 40; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, BELT.y + 4); ctx.lineTo(x + 12, BELT.y + 15); ctx.lineTo(x, BELT.y + 26);
    ctx.stroke();
  }
  ctx.restore();
  /* غلتک‌ها */
  for (const x of [BELT.x0 - 4, BELT.x1 + 4]) {
    ctx.fillStyle = P.steelDk;
    ctx.beginPath(); ctx.arc(x, BELT.y + 15, 22, 0, TAU); ctx.fill();
    ctx.fillStyle = ball(x - 6, BELT.y + 9, 40, P.steelLt, P.steel, P.steelDk);
    ctx.beginPath(); ctx.arc(x, BELT.y + 15, 18, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(S.t * 3) * 14, BELT.y + 15 + Math.sin(S.t * 3) * 14);
    ctx.lineTo(x - Math.cos(S.t * 3) * 14, BELT.y + 15 - Math.sin(S.t * 3) * 14);
    ctx.stroke();
  }
  /* سکّوی شروع */
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(BELT.x0 - 6, BELT.y + 34, 130, 16, 6); ctx.fill();
  numText(fa(S.start), BELT.x0 + 60, BELT.y + 74, { size: 22, color: P.brassLt });
  text('جعبهٔ اوّل', BELT.x0 + 60, BELT.y + 100, { size: 14, color: 'rgba(244, 236, 217, .5)' });
}

function drawSlots() {
  for (let i = 0; i < S.slots; i++) {
    const b = slotBox(i);
    const idx = S.slot[i];
    const hot = S.hover && S.hover.k === 'slot' && S.hover.i === i;
    /* پایه‌های دستگاه روی نوار */
    ctx.fillStyle = P.steelDk;
    ctx.beginPath(); rrPath(b.x + 10, b.y + b.h, 18, 28, 4); ctx.fill();
    ctx.beginPath(); rrPath(b.x + b.w - 28, b.y + b.h, 18, 28, 4); ctx.fill();
    if (idx < 0) {
      ctx.save();
      ctx.globalAlpha = S.held >= 0 ? .5 + .3 * Math.sin(S.t * 5 + i) : .3;
      ctx.strokeStyle = S.held >= 0 ? P.brassLt : P.steelLt; ctx.lineWidth = 3; ctx.setLineDash([9, 8]);
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);
      text('جای دستگاه', b.x + b.w / 2, b.y + b.h / 2, { size: 15, color: 'rgba(200, 230, 236, .4)' });
    } else {
      machine(b.x, b.y, b.w, b.h, S.shelf[idx].m, { ring: hot ? P.bad : null });
      /* عددِ بعد از این دستگاه — کارِ خودِ بچّه */
      let v = S.start;
      for (let k = 0; k <= i; k++) if (S.slot[k] >= 0) v *= S.shelf[S.slot[k]].m;
      ctx.fillStyle = 'rgba(10, 20, 24, .8)';
      ctx.beginPath(); rrPath(b.x + b.w / 2 - 52, b.y - 44, 104, 36, 9); ctx.fill();
      numText(fa(v), b.x + b.w / 2, b.y - 26, { size: 24, color: P.lamp });
    }
  }
}

function drawChute() {
  const x = CHUTE.x, y = BELT.y;
  ctx.fillStyle = P.steelDk;
  ctx.beginPath();
  ctx.moveTo(x - 46, y - 150); ctx.lineTo(x + 60, y - 150);
  ctx.lineTo(x + 40, y + 10); ctx.lineTo(x - 26, y + 10);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.steel;
  ctx.beginPath();
  ctx.moveTo(x - 40, y - 144); ctx.lineTo(x + 54, y - 144);
  ctx.lineTo(x + 34, y + 4); ctx.lineTo(x - 20, y + 4);
  ctx.closePath(); ctx.fill();
  /* تابلوی سفارش */
  const bw = 216, bx = x - 128, by = 148;
  paper(bx, by, bw, 116, P.card, 31, 12, .34);
  ctx.fillStyle = P.copperDk;
  ctx.beginPath(); rrPath(bx + 14, by + 14, bw - 28, 6, 3); ctx.fill();
  text('سفارشِ انبار', bx + bw / 2, by + 42, { size: 17, family: 'Lalezar', color: P.ink });
  numText(fa(S.target), bx + bw / 2, by + 82, { size: 40, color: P.ink });
  if (S.bad > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.bad, 0, 1);
    ctx.strokeStyle = P.bad; ctx.lineWidth = 4;
    ctx.beginPath(); rrPath(bx - 4, by - 4, bw + 8, 124, 14); ctx.stroke();
    ctx.restore();
  }
}

function drawSteam() {
  ctx.save();
  for (const s of S.steam) {
    ctx.globalAlpha = clamp(1 - s.t / s.dur, 0, 1) * .22;
    ctx.fillStyle = '#dff0f4';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawShelf() {
  text('قفسهٔ دستگاه‌ها', SHELF.x + SHELF.w - 16, SHELF.y + 20,
    { size: 18, family: 'Lalezar', color: 'rgba(244, 236, 217, .8)', align: 'right' });
  for (let i = 0; i < S.shelf.length; i++) {
    const b = shelfSlot(i);
    if (S.shelf[i].used || S.held === i) {
      ctx.strokeStyle = 'rgba(200, 230, 236, .2)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
      ctx.setLineDash([]);
      continue;
    }
    const hot = S.hover && S.hover.k === 'shelf' && S.hover.i === i;
    machine(b.x, b.y - (hot ? 5 : 0), b.w, b.h, S.shelf[i].m, { ring: hot ? P.brassLt : null });
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(10, 24, 28, .93)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(207, 167, 78, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 246 - i * 32;
    ctx.save();
    ctx.globalAlpha = i < S.boxes ? 1 : .22;
    ctx.fillStyle = i < S.boxes ? P.wood : '#5c645f';
    ctx.beginPath(); rrPath(x - 11, HUD_H / 2 - 9, 22, 19, 3); ctx.fill();
    ctx.strokeStyle = i < S.boxes ? P.brassLt : '#7d857f'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(x - 11, HUD_H / 2 - 9, 22, 19, 3); ctx.stroke();
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
    spot([{ x: CHUTE.x - 132, y: 144, w: 224, h: 124 }], .76);
    const h = tutCard(140, 480, 560,
      ['انبار یک عدد سفارش داده است.', 'جعبه با عددِ کوچکی راه می‌افتد.'], 'کارخانهٔ ده‌برابر');
    tutMore(420, 480 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: SHELF.x, y: SHELF.y, w: SHELF.w, h: SHELF.h },
          { x: slotBox(0).x - 10, y: slotBox(0).y - 10, w: SCENE_W - slotBox(0).x - 180, h: 190 }], .72);
    tutCard(300, 150, 600, ['دستگاه را از قفسه بردار و روی جای خالیِ نوار بگذار.',
      'جاها که پُر شد، جعبه خودش راه می‌افتد.']);
  } else {
    spot([{ x: slotBox(0).x - 10, y: slotBox(0).y - 60, w: SCENE_W - slotBox(0).x - 180, h: 250 }], .74);
    const h = tutCard(120, 500, 580,
      ['دستگاهِ ×۱۰ هر چینه را یک پلّه بالا می‌بَرد:',
       'یکی می‌شود ده‌تایی، ده‌تایی می‌شود صدتایی.',
       'ببین ته عدد چند صفر سبز می‌شود.'], 'یک پلّه بالا');
    tutMore(410, 500 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function factoryIcon(x, y) {
  machine(x - 54, y - 26, 52, 52, 10);
  ctx.strokeStyle = P.brass; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 6, y); ctx.lineTo(x + 26, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 18, y - 8); ctx.lineTo(x + 27, y); ctx.lineTo(x + 18, y + 8); ctx.stroke();
  chips(x + 56, y, 300, 1);
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 800, h: 300, y: 128,
    paper: P.paper, band: P.copperDk, ink: P.ink, inkSoft: '#657f88',
    icon: factoryIcon,
    title: 'کارخانهٔ ده‌برابر',
    body: 'جعبه‌ای پر از چینه روی نوار راه می‌افتد و از دلِ دستگاه‌ها می‌گذرد.\n«×۱۰» هر چینه را یک پلّه بالا می‌بَرد: یکی می‌شود ده‌تایی.\nکدام دستگاه‌ها را بگذاری تا جعبه دقیقاً به سفارشِ انبار برسد؟',
    btn: BTN_GO, btnLabel: 'نوار را روشن کن', btnHot: S.hover === BTN_GO,
    btnFill: '#8a4f26', btnHotFill: '#a9642f',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#657f88',
    icon: factoryIcon,
    title: L().endless ? 'نوار ایستاد' : 'همهٔ سفارش‌ها رفت!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ کارخانه‌ها را گرداندی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'سفارشِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#8a4f26', btnHotFill: '#a9642f',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#657f88',
    icon: (x, y) => { chips(x - 40, y, 4, 1.2); factoryIcon(x + 40, y); },
    title: 'جعبه‌ها تمام شد',
    body: 'امتیاز: ' + fa(S.score) + '\nهر ×۱۰ یک صفر ته عدد می‌گذارد.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#8a4f26', btnHotFill: '#a9642f',
  });
}

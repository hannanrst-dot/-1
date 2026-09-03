/*!
title: ایستگاهِ هواشناسی — جدولِ داده‌ها
bg: #101c26
*/

/* ═══════════════════════════════════════════════════════════════════════
   ایستگاهِ هواشناسی — ریاضی سوم، فصل ۷، درس ۲ (جدولِ داده‌ها)
   ───────────────────────────────────────────────────────────────────────
   جدولِ کتاب همین است: دمای هوای یک شهر در روزها و ساعت‌های مختلف، و
   بعد سه پرسش — «بیشترین دما در چه روز و چه ساعتی؟»، «کمترین؟»،
   «بیشترین تغییرِ دما در چه زمانی اتّفاق افتاد؟»

   اینجا جدول از آسمان نمی‌آید؛ خودت می‌سازی‌اش. دماسنج‌های کوه هر بار
   یک برگه می‌فرستند: یک عدد، با نشانِ رنگیِ روز و نشانِ ساعت. برگه را
   می‌گذاری سرِ جایش تا خانه‌های جدول پُر شود.

   بعد کوه‌نورد و چوپان می‌آیند و سؤال می‌پرسند. جوابشان را جایی
   نمی‌نویسیم: باید در جدولی که خودت ساختی، روی همان خانه بزنی.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  sky:   '#1c3648', skyLo: '#0d1922', skyHi: '#3a6a80',
  snow:  '#dceaf2', snowDk: '#93b4c6', snowSh: '#5d84a0',
  rock:  '#2d4453', rockDk: '#1a2b36', rockLt: '#4a6a7d',
  wood:  '#7a5433', woodDk: '#452c14', woodLt: '#a87c4c',
  brass: '#cfa74e', brassDk: '#8f7327', brassLt: '#f2dd99',
  glass: '#a8d8e4',
  paper: '#f4ecd9', card: '#fbf5e6', ink: '#22333c', inkSoft: '#728790',
  cold:  '#5b9fd4', warm: '#e0913c', hot: '#d2543a',
  good:  '#5da26f', bad: '#cd5b45', gold: '#eab53f', lamp: '#ffd08a',
};

/* رنگِ هر روز — بچّه با رنگ برگه را پیدا می‌کند، نه با خواندنِ اسم */
const DAY = [
  { n: 'شنبه',      c: '#d2694a' },
  { n: 'یکشنبه',    c: '#d8a53c' },
  { n: 'دوشنبه',    c: '#5da26f' },
  { n: 'سه‌شنبه',   c: '#6f8fd0' },
];
const TIME = [
  { n: 'صبح',  k: 'dawn',  base: 6 },
  { n: 'ظهر',  k: 'noon',  base: 20 },
  { n: 'عصر',  k: 'dusk',  base: 14 },
  { n: 'شب',   k: 'night', base: 3 },
];

const LEVELS = [
  { name: 'ایستگاهِ نو', rows: 3, cols: 3, asks: 2, time: 96, quota: 2,
    hint: 'برگه را بردار و در خانهٔ هم‌رنگ و هم‌ساعتش بگذار.' },
  { name: 'چهار روزِ کوه', rows: 4, cols: 3, asks: 3, time: 100, quota: 2,
    hint: 'وقتی جدول پُر شد، از خودِ جدول جواب بگیر.' },
  { name: 'شب هم ثبت کن', rows: 4, cols: 4, asks: 3, time: 108, quota: 3,
    hint: 'گاهی سؤال دربارهٔ یک روز است، نه کلِّ جدول.' },
  { name: 'پیش از توفان', rows: 4, cols: 4, asks: 4, time: 96, quota: 3,
    hint: 'بیشترین تغییر یعنی بزرگ‌ترین پرش از یک ساعت به ساعتِ بعد.' },
  { name: 'تا برف بیاید', rows: 4, cols: 4, asks: 4, time: 100, endless: true,
    hint: 'تا برف نیامده، ثبت کن.' },
];

const TBOX = { x: 244, y: 104, w: 614, h: 344 };
const SHELF = { x: 244, y: 476, w: 614, h: 150 };
const SIDE = { x: 880, y: 104, w: 292, h: 522 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };
const LABW = 132, HEADH = 50;
const WIN = { x: 24, y: 96, w: 196, h: 240 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', stage: 'fill',
  level: 0, rows: 3, cols: 3,
  val: [], grid: [],
  deck: [], held: null,
  q: null, qIdx: 0, qTotal: 0, doneT: 0,
  flash: null, wrong: 0, hint: 0,
  timeLeft: 0, lamps: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  snow: [], vane: 0,
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function loadBest() { try { return +localStorage.getItem('havashenasi-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('havashenasi-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();

/* ───────── جدولِ تازه ───────── */

function tableGeom() {
  const w = LABW + S.cols * cellW(), h = HEADH + S.rows * cellH();
  return { x: TBOX.x + (TBOX.w - w) / 2, y: TBOX.y + (TBOX.h - h) / 2, w, h };
}
function cellW() { return S.cols <= 3 ? 150 : 118; }
function cellH() { return S.rows <= 3 ? 92 : 72; }
function cellRect(r, c) {
  const g = tableGeom();
  return { x: g.x + LABW + c * cellW(), y: g.y + HEADH + r * cellH(), w: cellW(), h: cellH() };
}
function rowLabel(r) {
  const g = tableGeom();
  return { x: g.x, y: g.y + HEADH + r * cellH(), w: LABW, h: cellH() };
}
function colHead(c) {
  const g = tableGeom();
  return { x: g.x + LABW + c * cellW(), y: g.y, w: cellW(), h: HEADH };
}

/** مقدارها با الگوی روز ساخته می‌شوند و بعد یکتا می‌شوند؛ رد کردن و
    دوباره ساختن جواب نمی‌داد و گاهی به مقدارهای پشتِ‌سرِ‌هم می‌رسید. */
function makeValues(rows, cols) {
  const off = [];
  for (let r = 0; r < rows; r++) off.push(R(-4, 5));
  const seen = new Set();
  const v = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      let x = clamp(TIME[c].base + off[r] + R(-2, 2), 0, 32);
      let d = 0;
      /* اگر تکراری شد، یکی بالا و پایین می‌رویم تا خانهٔ خالی پیدا شود */
      while (seen.has(x)) { d++; x = clamp(x + (d % 2 ? d : -d), 0, 34); }
      seen.add(x);
      row.push(x);
    }
    v.push(row);
  }
  return v;
}

function newRound() {
  const lv = L();
  S.rows = lv.rows; S.cols = lv.cols;
  S.val = makeValues(S.rows, S.cols);
  S.grid = S.val.map((row) => row.map(() => null));
  S.deck = [];
  for (let r = 0; r < S.rows; r++) for (let c = 0; c < S.cols; c++) S.deck.push({ r, c, v: S.val[r][c] });
  for (let i = S.deck.length - 1; i > 0; i--) {
    const j = R(0, i);
    const tmp = S.deck[i]; S.deck[i] = S.deck[j]; S.deck[j] = tmp;
  }
  S.held = null;
  S.stage = 'fill';
  S.q = null; S.qIdx = 0; S.qTotal = lv.asks;
  S.flash = null; S.wrong = 0; S.hint = 0;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.lamps = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newRound();
  toast.say(lv.hint, 'info');
}

/* ───────── پرسش‌ها ───────── */

/** پرشِ صبح→ظهر باید یک بیشینهٔ یکتا داشته باشد، وگرنه سؤالش را نمی‌پرسیم. */
function jumpUnique() {
  const j = S.val.map((row) => Math.abs(row[1] - row[0]));
  const m = Math.max(...j);
  return j.filter((x) => x === m).length === 1;
}

/** هر پرسش با زدنِ یک خانه، یک برچسبِ روز یا یک سرستون جواب داده می‌شود. */
function askNew() {
  const kinds = ['hot', 'cold'];
  if (S.level >= 1) kinds.push('hotDay');
  if (S.level >= 2) kinds.push('coldTime');
  if (S.level >= 3 && S.cols >= 2 && jumpUnique()) kinds.push('jump');
  const used = S.q ? S.q.kind : null;
  let kind = kinds[R(0, kinds.length - 1)];
  if (kinds.length > 1) { let g = 0; while (kind === used && g++ < 8) kind = kinds[R(0, kinds.length - 1)]; }

  const all = [];
  for (let r = 0; r < S.rows; r++) for (let c = 0; c < S.cols; c++) all.push({ r, c, v: S.val[r][c] });

  if (kind === 'hot' || kind === 'cold') {
    const best = all.reduce((a, b) => ((kind === 'hot' ? b.v > a.v : b.v < a.v) ? b : a));
    S.q = { kind, target: 'cell', r: best.r, c: best.c };
  } else if (kind === 'hotDay') {
    const r = R(0, S.rows - 1);
    let bc = 0;
    for (let c = 1; c < S.cols; c++) if (S.val[r][c] > S.val[r][bc]) bc = c;
    S.q = { kind, target: 'cell', row: r, r, c: bc };
  } else if (kind === 'coldTime') {
    const c = R(0, S.cols - 1);
    let br = 0;
    for (let r = 1; r < S.rows; r++) if (S.val[r][c] < S.val[br][c]) br = r;
    S.q = { kind, target: 'cell', col: c, r: br, c };
  } else {
    let br = 0;
    for (let r = 1; r < S.rows; r++) {
      if (Math.abs(S.val[r][1] - S.val[r][0]) > Math.abs(S.val[br][1] - S.val[br][0])) br = r;
    }
    S.q = { kind, target: 'row', r: br };
  }
  S.wrong = 0;
}

/* ───────── حلقه ───────── */

newRound();                 /* پشتِ پردهٔ شروع هم باید جدولی باشد */
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt; S.phaseT += dt;
  S.vane += dt * (1.6 + Math.sin(S.t * .7) * .8);
  if (S.shake > 0) S.shake -= dt;
  if (S.hint > 0) S.hint -= dt;
  if (S.flash) { S.flash.t += dt; if (S.flash.t > 1.1) S.flash = null; }

  if (Math.random() < dt * 30) S.snow.push({ x: WIN.x + Math.random() * WIN.w, y: WIN.y, r: 1 + Math.random() * 2.6, v: 26 + Math.random() * 44, p: Math.random() * 6 });
  for (const f of S.snow) { f.y += f.v * dt; f.x += Math.sin(f.p + S.t * 1.3) * 14 * dt; }
  S.snow = S.snow.filter((f) => f.y < WIN.y + WIN.h);

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && S.stage !== 'done') {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseLamp('توفان رسید و برگه‌ها پرید!'); }
    }
    if (S.stage === 'done') {
      S.doneT += dt;
      if (S.doneT > 1.9) { newRound(); S.timeLeft = L().time; }
    }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseLamp(msg) {
  if (S.stage === 'done') return;
  S.lamps--;
  S.combo = 0;
  S.shake = .5;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.lamps <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newRound();
}

/** برگه را در خانه می‌گذارد. جای اشتباه پس زده می‌شود. */
function place(r, c) {
  const h = S.held;
  if (!h) return;
  if (S.grid[r][c] !== null) { sfx.nope(); S.hint = .6; return; }
  if (h.r !== r || h.c !== c) {
    sfx.nope(); S.hint = .6; S.shake = .16;
    S.flash = { kind: 'miss', r, c, t: 0 };
    return;
  }
  S.grid[r][c] = h.v;
  S.held = null;
  sfx.place();
  bits.add(cellRect(r, c).x + cellW() / 2, cellRect(r, c).y + cellH() / 2, 8, 'dot',
    [P.brassLt, P.snow], { speed: 130, lift: 40, size: 3, life: .5, grav: 300 });
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
  if (S.deck.length === 0 && S.grid.every((row) => row.every((v) => v !== null))) {
    S.stage = 'ask';
    askNew();
    sfx.good();
    toast.say('جدول کامل شد. حالا از خودش جواب بگیر.', 'good');
  }
}

/** جوابِ پرسش: زدنِ خانه یا برچسبِ روز. */
function answer(kind, r, c) {
  const q = S.q;
  if (!q || S.stage !== 'ask') return;
  const ok = q.target === 'cell' ? (kind === 'cell' && r === q.r && c === q.c)
                                 : (kind === 'row' && r === q.r);
  if (!ok) {
    S.wrong++;
    S.shake = .2;
    sfx.nope();
    S.flash = { kind: 'no', r, c, t: 0, target: kind };
    S.timeLeft = Math.max(4, S.timeLeft - 5);
    toast.say('دوباره در جدول بگرد.', 'bad');
    return;
  }
  S.flash = { kind: 'yes', r: q.r, c: q.c, t: 0, target: q.target };
  sfx.good();
  const box = q.target === 'row' ? rowLabel(q.r) : cellRect(q.r, q.c);
  bits.confetti(box.x + box.w / 2, box.y + box.h / 2, 26, [P.gold, P.brassLt, P.snow, '#fff']);
  S.score += Math.max(60, 220 - S.wrong * 60);
  S.qIdx++;
  if (S.qIdx >= S.qTotal) win();
  else { askNew(); toast.say('درست بود! پرسشِ بعد.', 'good'); }
}

function win() {
  S.stage = 'done';
  S.doneT = 0;
  S.held = null;
  S.combo++;
  S.cleared++;
  S.score += 300 + Math.round(S.timeLeft * 4) + Math.min(S.combo, 6) * 70;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(SCENE_W / 2, 300, 44, [P.gold, P.brassLt, P.snow, '#fff']);
  sfx.win();
  toast.say('گزارشِ امروز تمام شد!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function shelfSlot(i) {
  const n = 5, w = 96, gap = 14;
  const total = n * w + (n - 1) * gap;
  return { x: SHELF.x + (SHELF.w - total) / 2 + i * (w + gap), y: SHELF.y + 30, w, h: 104 };
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.held) { S.held.x = p.x; S.held.y = p.y; return; }
  S.hover = null;
  if (S.stage === 'fill') {
    for (let i = 0; i < Math.min(5, S.deck.length); i++) if (inRect(p, shelfSlot(i))) S.hover = { k: 'card', i };
  }
  for (let r = 0; r < S.rows; r++) for (let c = 0; c < S.cols; c++) if (inRect(p, cellRect(r, c))) S.hover = { k: 'cell', r, c };
  for (let r = 0; r < S.rows; r++) if (inRect(p, rowLabel(r))) S.hover = { k: 'row', r };
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

  if (S.stage === 'fill') {
    if (S.held) {
      for (let r = 0; r < S.rows; r++) for (let c = 0; c < S.cols; c++) if (inRect(p, cellRect(r, c))) { place(r, c); return; }
      S.deck.unshift({ r: S.held.r, c: S.held.c, v: S.held.v });   /* برگه به قفسه برمی‌گردد */
      S.held = null; sfx.tap();
      return;
    }
    for (let i = 0; i < Math.min(5, S.deck.length); i++) if (inRect(p, shelfSlot(i))) {
      const card = S.deck.splice(i, 1)[0];
      S.held = { ...card, x: p.x, y: p.y, x0: p.x, y0: p.y };
      sfx.tap();
      try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
      return;
    }
    return;
  }
  if (S.stage === 'ask') {
    for (let r = 0; r < S.rows; r++) for (let c = 0; c < S.cols; c++) if (inRect(p, cellRect(r, c))) { answer('cell', r, c); return; }
    for (let r = 0; r < S.rows; r++) if (inRect(p, rowLabel(r))) { answer('row', r, -1); return; }
  }
});

cv.addEventListener('pointerup', (e) => {
  if (S.phase !== 'play' || S.stage !== 'fill' || !S.held) return;
  const p = toStage(e);
  /* اگر فقط یک ضربه بود، برگه در دست می‌ماند تا خانه را بزند؛
     اگر کشیده شد، همان‌جا که رها شده می‌نشیند. */
  if (Math.hypot(p.x - S.held.x0, p.y - S.held.y0) <= 14) return;
  for (let r = 0; r < S.rows; r++) for (let c = 0; c < S.cols; c++) if (inRect(p, cellRect(r, c))) { place(r, c); return; }
});

cv.addEventListener('pointercancel', () => {
  if (S.held) { S.deck.unshift({ r: S.held.r, c: S.held.c, v: S.held.v }); S.held = null; }
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
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(4, 10, 14, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(244, 236, 217, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '4, 10, 14');
  ctx.fillStyle = P.cold;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#5a6f79' }); yy += 30; }
  return h + 20;
}

/** نشانِ ساعت: سپیده، ظهر، غروب، شب. */
function timeIcon(x, y, k, s = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  if (k === 'night') {
    ctx.fillStyle = '#cfe2f0';
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(6, -4, 10, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  } else {
    const col = k === 'noon' ? '#ffd062' : (k === 'dawn' ? '#ffb27a' : '#f08a52');
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(0, k === 'noon' ? 0 : 3, k === 'noon' ? 9 : 8, 0, TAU); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    const n = k === 'noon' ? 8 : 5;
    for (let i = 0; i < n; i++) {
      const a = k === 'noon' ? i / n * TAU : Math.PI + i / (n - 1) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 13, (k === 'noon' ? 0 : 3) + Math.sin(a) * 13);
      ctx.lineTo(Math.cos(a) * 17, (k === 'noon' ? 0 : 3) + Math.sin(a) * 17);
      ctx.stroke();
    }
    if (k !== 'noon') {
      ctx.strokeStyle = 'rgba(220, 234, 242, .7)'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(-16, 8); ctx.lineTo(16, 8); ctx.stroke();
    }
  }
  ctx.restore();
}

/** رنگِ دما: هرچه گرم‌تر، سرخ‌تر. */
function tempCol(v) {
  const k = clamp(v / 30, 0, 1);
  if (k < .35) return P.cold;
  if (k < .62) return '#7fb56a';
  if (k < .82) return P.warm;
  return P.hot;
}

/** برگهٔ دماسنج: عدد، نشانِ رنگیِ روز، نشانِ ساعت. */
function readingCard(x, y, w, h, d) {
  withShadow(14, 6, .4, () => {
    ctx.fillStyle = P.card;
    wobbleRect(x, y, w, h, 10, x + y, 1.6); ctx.fill();
  }, '4, 10, 14');
  ctx.fillStyle = DAY[d.r].c;
  ctx.beginPath(); rrPath(x, y, w, 14, 6); ctx.fill();
  numText(fa(d.v), x + w / 2, y + h * .44, { size: 36, color: tempCol(d.v) });
  timeIcon(x + w / 2, y + h - 24, TIME[d.c].k, .74);
  ctx.strokeStyle = 'rgba(34, 51, 60, .18)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); rrPath(x + .5, y + .5, w - 1, h - 1, 10); ctx.stroke();
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintStationStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.skyLo); g.addColorStop(.4, P.sky); g.addColorStop(1, '#0b141b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* قلّه‌های برفی، سه لایه */
  for (let L2 = 0; L2 < 3; L2++) {
    const base = 300 + L2 * 90, sc = 1 - L2 * .22;
    ctx.fillStyle = L2 === 0 ? '#22384a' : (L2 === 1 ? '#2b465a' : P.rock);
    ctx.beginPath();
    ctx.moveTo(-20, base + 120);
    for (let x = -20; x <= SCENE_W + 20; x += 12) {
      const y = base - (Math.sin(x * .0042 + L2 * 2.2) * 120 + Math.sin(x * .011 + L2) * 44 + Math.sin(x * .031 + L2 * 3) * 12) * sc;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(SCENE_W + 20, SCENE_H); ctx.lineTo(-20, SCENE_H);
    ctx.closePath(); ctx.fill();
    /* برفِ نوکِ قلّه */
    ctx.save();
    ctx.clip();
    ctx.fillStyle = `rgba(220, 234, 242, ${.5 - L2 * .12})`;
    ctx.beginPath();
    ctx.moveTo(-20, base + 120);
    for (let x = -20; x <= SCENE_W + 20; x += 12) {
      const y = base - (Math.sin(x * .0042 + L2 * 2.2) * 120 + Math.sin(x * .011 + L2) * 44 + Math.sin(x * .031 + L2 * 3) * 12) * sc;
      ctx.lineTo(x, y + 26 + Math.sin(x * .05 + L2) * 8);
    }
    ctx.lineTo(SCENE_W + 20, base - 400); ctx.lineTo(-20, base - 400);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  /* مهِ درّه */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const mg = ctx.createLinearGradient(0, 330, 0, 470);
  mg.addColorStop(0, 'rgba(150, 190, 210, 0)');
  mg.addColorStop(.5, 'rgba(150, 190, 210, .14)');
  mg.addColorStop(1, 'rgba(150, 190, 210, 0)');
  ctx.fillStyle = mg;
  ctx.fillRect(0, 330, SCENE_W, 140);
  ctx.restore();

  /* دیوارِ چوبیِ کلبه، پشتِ جدول */
  ctx.fillStyle = '#2a1c10';
  ctx.fillRect(0, HUD_H, SCENE_W, SCENE_H - HUD_H);
  ctx.fillStyle = texWood('#4d3520', '#241708');
  ctx.fillRect(0, HUD_H, SCENE_W, SCENE_H - HUD_H);
  ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 3;
  for (let y = HUD_H + 44; y < SCENE_H; y += 44) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255, 214, 150, .07)'; ctx.lineWidth = 2;
  for (let y = HUD_H + 46; y < SCENE_H; y += 44) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke();
  }
  /* نورِ فانوسِ سقف */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const hg = ctx.createRadialGradient(600, 120, 20, 600, 120, 700);
  hg.addColorStop(0, 'rgba(255, 208, 138, .3)');
  hg.addColorStop(1, 'rgba(255, 208, 138, 0)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, HUD_H, SCENE_W, SCENE_H - HUD_H);
  ctx.restore();
  const vg = ctx.createLinearGradient(0, HUD_H, 0, SCENE_H);
  vg.addColorStop(0, 'rgba(0,0,0,.12)');
  vg.addColorStop(1, 'rgba(0,0,0,.5)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, HUD_H, SCENE_W, SCENE_H - HUD_H);
  /* پنجرهٔ کلبه که کوه از آن پیداست */
  const WX = WIN.x, WY = WIN.y, WW = WIN.w, WH = WIN.h;
  ctx.save();
  ctx.beginPath(); rrPath(WX, WY, WW, WH, 12); ctx.clip();
  ctx.drawImage(staticLayer('peaks', SCENE_W, SCENE_H, paintPeaksOnly), 0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 12;
  ctx.beginPath(); rrPath(WX, WY, WW, WH, 12); ctx.stroke();
  ctx.strokeStyle = P.wood; ctx.lineWidth = 7;
  ctx.beginPath(); rrPath(WX, WY, WW, WH, 12); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(WX + WW / 2, WY); ctx.lineTo(WX + WW / 2, WY + WH);
  ctx.moveTo(WX, WY + WH / 2); ctx.lineTo(WX + WW, WY + WH / 2);
  ctx.stroke();

  /* قفسهٔ برگه‌ها */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(SHELF.x - 12, SHELF.y - 8, SHELF.w + 24, SHELF.h + 24, 12); ctx.fill();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.beginPath(); rrPath(SHELF.x - 6, SHELF.y - 2, SHELF.w + 12, SHELF.h + 12, 9); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.fillRect(SHELF.x - 6, SHELF.y + SHELF.h + 4, SHELF.w + 12, 8);
}

function paintPeaksOnly() {
  const g = ctx.createLinearGradient(0, 0, 0, 400);
  g.addColorStop(0, '#20415c'); g.addColorStop(1, '#4c7d94');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, 420);
  for (let L2 = 0; L2 < 2; L2++) {
    ctx.fillStyle = L2 ? '#8fb0c4' : '#3d6076';
    ctx.beginPath();
    ctx.moveTo(0, 420);
    for (let x = 0; x <= 320; x += 8) {
      ctx.lineTo(x, 240 - Math.abs(Math.sin(x * .018 + L2 * 1.7)) * (110 - L2 * 34) + L2 * 40);
    }
    ctx.lineTo(320, 420); ctx.closePath(); ctx.fill();
  }
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.sky);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('station', SCENE_W, SCENE_H, paintStationStatic), 0, 0, SCENE_W, SCENE_H);
  drawVane();
  drawTable();
  drawShelf();
  drawSide();
  drawSnow();
  bits.draw();
  if (S.held) {
    const w = 96, h = 104;
    readingCard(S.held.x - w / 2, S.held.y - h / 2, w, h, S.held);
  }
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.1, 'rgba(3, 8, 12, .5)', .36, .14);
}

function drawSnow() {
  ctx.save();
  ctx.beginPath(); rrPath(WIN.x + 6, WIN.y + 6, WIN.w - 12, WIN.h - 12, 8); ctx.clip();
  ctx.fillStyle = 'rgba(226, 240, 248, .6)';
  for (const f of S.snow) { ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.fill(); }
  ctx.restore();
}

/** بادنمای پشتِ پنجره — ساعتِ بازی هم هست. */
function drawVane() {
  const x = 122, y = 380;
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y + 90); ctx.lineTo(x, y); ctx.stroke();
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
  for (let i = 0; i < 3; i++) {
    const a = S.vane + i / 3 * TAU;
    const cx2 = x + Math.cos(a) * 34, cy2 = y + Math.sin(a) * 34 * .45;
    ctx.strokeStyle = P.brass; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx2, cy2); ctx.stroke();
    ctx.fillStyle = ball(cx2 - 3, cy2 - 3, 18, P.snow, P.snowDk, P.snowSh);
    ctx.beginPath(); ctx.ellipse(cx2, cy2, 11, 8, a, 0, TAU); ctx.fill();
  }
  /* ساعتِ روز: نوارِ زیرِ بادنما */
  const k = clamp(S.timeLeft / L().time, 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.beginPath(); rrPath(x - 74, y + 104, 148, 12, 6); ctx.fill();
  ctx.fillStyle = k > .3 ? P.brass : P.bad;
  ctx.beginPath(); rrPath(x - 72, y + 106, 144 * k, 8, 4); ctx.fill();
  text('تا توفان', x, y + 134, { size: 14, color: 'rgba(220, 234, 242, .6)' });
}

function drawTable() {
  const g = tableGeom();
  const cw = cellW(), ch = cellH();
  withShadow(22, 10, .45, () => {
    ctx.fillStyle = 'rgba(20, 34, 44, .93)';
    ctx.beginPath(); rrPath(g.x - 12, g.y - 12, g.w + 24, g.h + 24, 14); ctx.fill();
  }, '2, 8, 12');
  ctx.strokeStyle = 'rgba(207, 167, 78, .45)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(g.x - 12, g.y - 12, g.w + 24, g.h + 24, 14); ctx.stroke();

  /* سرستون‌ها */
  for (let c = 0; c < S.cols; c++) {
    const b = colHead(c);
    const lit = S.q && S.stage === 'ask' && S.q.col === c;
    ctx.fillStyle = lit ? 'rgba(207, 167, 78, .3)' : 'rgba(255,255,255,.05)';
    ctx.beginPath(); rrPath(b.x + 3, b.y + 3, b.w - 6, b.h - 6, 8); ctx.fill();
    timeIcon(b.x + b.w / 2 - 34, b.y + b.h / 2, TIME[c].k, .74);
    text(TIME[c].n, b.x + b.w / 2 + 18, b.y + b.h / 2, { size: 19, family: 'Lalezar', color: P.snow });
  }
  /* برچسبِ روزها */
  for (let r = 0; r < S.rows; r++) {
    const b = rowLabel(r);
    const lit = S.q && S.stage === 'ask' && (S.q.row === r || (S.q.target === 'row' && S.hover && S.hover.k === 'row' && S.hover.r === r));
    const hot = S.stage === 'ask' && S.q && S.q.target === 'row' && S.hover && S.hover.k === 'row' && S.hover.r === r;
    ctx.fillStyle = lit ? 'rgba(207, 167, 78, .26)' : 'rgba(255,255,255,.05)';
    ctx.beginPath(); rrPath(b.x + 3, b.y + 3, b.w - 6, b.h - 6, 8); ctx.fill();
    ctx.fillStyle = DAY[r].c;
    ctx.beginPath(); rrPath(b.x + 9, b.y + 10, 12, b.h - 20, 6); ctx.fill();
    text(DAY[r].n, b.x + b.w / 2 + 8, b.y + b.h / 2, { size: 19, family: 'Lalezar', color: hot ? P.gold : P.snow });
  }
  /* خانه‌ها */
  for (let r = 0; r < S.rows; r++) for (let c = 0; c < S.cols; c++) {
    const b = cellRect(r, c), v = S.grid[r][c];
    const target = S.held && S.stage === 'fill' && v === null;
    const hovered = S.hover && S.hover.k === 'cell' && S.hover.r === r && S.hover.c === c;
    ctx.fillStyle = v === null ? 'rgba(8, 16, 22, .55)' : 'rgba(244, 236, 217, .09)';
    ctx.beginPath(); rrPath(b.x + 4, b.y + 4, b.w - 8, b.h - 8, 8); ctx.fill();
    if (target) {
      ctx.save();
      ctx.globalAlpha = .35 + .25 * Math.sin(S.t * 5 + r + c);
      ctx.strokeStyle = P.brassLt; ctx.lineWidth = 2.4; ctx.setLineDash([7, 6]);
      ctx.beginPath(); rrPath(b.x + 4, b.y + 4, b.w - 8, b.h - 8, 8); ctx.stroke();
      ctx.restore();
    }
    if (v !== null) {
      numText(fa(v), b.x + b.w / 2, b.y + b.h / 2 - 2, { size: ch > 80 ? 34 : 30, color: tempCol(v) });
      /* ستونِ دماسنجِ کوچک، تا عددها با چشم هم مقایسه شوند */
      const bh = clamp(v / 34, 0, 1) * (ch - 34);
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.beginPath(); rrPath(b.x + b.w - 22, b.y + 14, 9, ch - 34, 4); ctx.fill();
      ctx.fillStyle = tempCol(v);
      ctx.beginPath(); rrPath(b.x + b.w - 22, b.y + 14 + (ch - 34 - bh), 9, bh, 4); ctx.fill();
    }
    if (S.stage === 'ask' && hovered) {
      ctx.strokeStyle = P.gold; ctx.lineWidth = 3;
      ctx.beginPath(); rrPath(b.x + 4, b.y + 4, b.w - 8, b.h - 8, 8); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(160, 190, 205, .16)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); rrPath(b.x + 4, b.y + 4, b.w - 8, b.h - 8, 8); ctx.stroke();
  }

  /* بازخوردِ لحظه‌ای */
  if (S.flash) {
    const f = S.flash, k = clamp(1 - f.t / 1.1, 0, 1);
    const b = f.target === 'row' ? rowLabel(f.r) : (f.c >= 0 ? cellRect(f.r, f.c) : rowLabel(f.r));
    ctx.save();
    ctx.globalAlpha = k;
    ctx.strokeStyle = f.kind === 'yes' ? P.good : P.bad;
    ctx.lineWidth = 5;
    ctx.beginPath(); rrPath(b.x + 2, b.y + 2, b.w - 4, b.h - 4, 9); ctx.stroke();
    ctx.restore();
  }
}

function drawShelf() {
  text('برگه‌های دماسنج', SHELF.x + SHELF.w - 12, SHELF.y + 14,
    { size: 17, family: 'Lalezar', color: 'rgba(244, 236, 217, .8)', align: 'right' });
  if (S.stage !== 'fill') {
    text('جدول کامل است.', SHELF.x + SHELF.w / 2, SHELF.y + SHELF.h / 2 + 8,
      { size: 19, color: 'rgba(244, 236, 217, .45)' });
    return;
  }
  const n = Math.min(5, S.deck.length);
  for (let i = 0; i < n; i++) {
    const b = shelfSlot(i);
    const hot = S.hover && S.hover.k === 'card' && S.hover.i === i;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.rotate(Math.sin(i * 2.3) * .03);
    ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2 + (hot ? 6 : 0)));
    readingCard(b.x, b.y, b.w, b.h, S.deck[i]);
    ctx.restore();
  }
  if (S.deck.length > 5) {
    const b = shelfSlot(4);
    ctx.fillStyle = 'rgba(8, 16, 22, .8)';
    ctx.beginPath(); rrPath(b.x + b.w - 26, b.y - 14, 52, 30, 8); ctx.fill();
    numText('+' + fa(S.deck.length - 5), b.x + b.w, b.y + 1, { size: 19, color: P.brassLt });
  }
}

/** آدمکِ کوهستان: چوپان یا کوه‌نورد، بسته به پرسش. */
function visitor(x, y, kind) {
  const bob = Math.sin(S.t * 2) * 3;
  ctx.save();
  ctx.translate(x, y + bob);
  contact(0, 62, 34, 9, .5);
  /* بالاپوش */
  ctx.fillStyle = kind === 'cold' ? '#3d6f8e' : '#8a5a34';
  ctx.beginPath();
  ctx.moveTo(-30, 60);
  ctx.quadraticCurveTo(-34, -6, -14, -22);
  ctx.lineTo(14, -22);
  ctx.quadraticCurveTo(34, -6, 30, 60);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); ctx.moveTo(-30, 60); ctx.quadraticCurveTo(-34, -6, -14, -22); ctx.lineTo(-4, -22);
  ctx.quadraticCurveTo(-16, 10, -12, 60); ctx.closePath(); ctx.fill();
  /* سر و کلاه */
  ctx.fillStyle = '#e2c39a';
  ctx.beginPath(); ctx.arc(0, -36, 17, 0, TAU); ctx.fill();
  ctx.fillStyle = kind === 'cold' ? '#2b5570' : '#6d4526';
  ctx.beginPath(); ctx.arc(0, -40, 18, Math.PI, 0); ctx.fill();
  ctx.fillRect(-22, -42, 44, 6);
  ctx.fillStyle = '#2c2018';
  ctx.beginPath(); ctx.arc(-6, -34, 2.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -34, 2.2, 0, TAU); ctx.fill();
  /* شالِ گردن */
  ctx.fillStyle = P.bad;
  ctx.beginPath(); rrPath(-16, -22, 32, 10, 5); ctx.fill();
  /* فانوس یا عصا */
  if (kind === 'cold') {
    ctx.strokeStyle = P.brassDk; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(30, 4); ctx.lineTo(42, 4); ctx.stroke();
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); rrPath(34, 6, 18, 24, 5); ctx.fill();
    ctx.fillStyle = P.lamp;
    ctx.beginPath(); rrPath(37, 10, 12, 16, 3); ctx.fill();
  } else {
    ctx.strokeStyle = P.woodDk; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(34, -18); ctx.lineTo(30, 60); ctx.stroke();
  }
  ctx.restore();
}

const QTEXT = {
  hot:      ['گرم‌ترین دمای هفته', 'روی همان خانه بزن'],
  cold:     ['سردترین دمای هفته', 'روی همان خانه بزن'],
  hotDay:   ['گرم‌ترین ساعتِ این روز', 'روی همان خانه بزن'],
  coldTime: ['سردترین روز در این ساعت', 'روی همان خانه بزن'],
  jump:     ['بیشترین تغییر از صبح تا ظهر', 'روی نامِ همان روز بزن'],
};

function drawSide() {
  ctx.fillStyle = 'rgba(12, 24, 32, .8)';
  ctx.beginPath(); rrPath(SIDE.x, SIDE.y, SIDE.w, SIDE.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(207, 167, 78, .3)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(SIDE.x, SIDE.y, SIDE.w, SIDE.h, 16); ctx.stroke();
  const cx = SIDE.x + SIDE.w / 2;

  if (S.stage === 'fill') {
    text('دفترِ ثبت', cx, SIDE.y + 34, { size: 24, family: 'Lalezar', color: P.snow });
    text('برگه‌ها را در خانه‌های', cx, SIDE.y + 74, { size: 16, color: 'rgba(220, 234, 242, .7)' });
    text('هم‌رنگ و هم‌ساعت بگذار.', cx, SIDE.y + 100, { size: 16, color: 'rgba(220, 234, 242, .7)' });
    /* راهنمای رنگ‌ها */
    for (let r = 0; r < S.rows; r++) {
      const y = SIDE.y + 152 + r * 40;
      ctx.fillStyle = DAY[r].c;
      ctx.beginPath(); rrPath(SIDE.x + SIDE.w - 58, y - 11, 22, 22, 6); ctx.fill();
      text(DAY[r].n, SIDE.x + SIDE.w - 70, y, { size: 17, color: P.snow, align: 'right' });
    }
    for (let c = 0; c < S.cols; c++) {
      const y = SIDE.y + 152 + c * 40;
      timeIcon(SIDE.x + 44, y, TIME[c].k, .62);
      text(TIME[c].n, SIDE.x + 66, y, { size: 17, color: P.snow, align: 'left' });
    }
    const left = S.deck.length + (S.held ? 1 : 0);
    ctx.fillStyle = 'rgba(8, 16, 22, .8)';
    ctx.beginPath(); rrPath(SIDE.x + 40, SIDE.y + SIDE.h - 76, SIDE.w - 80, 52, 12); ctx.fill();
    text('مانده', SIDE.x + SIDE.w - 62, SIDE.y + SIDE.h - 50, { size: 15, color: 'rgba(220,234,242,.6)', align: 'right' });
    numText(fa(left), SIDE.x + 90, SIDE.y + SIDE.h - 49, { size: 28, color: P.brassLt });
    return;
  }

  if (S.stage === 'done') {
    text('گزارش رفت', cx, SIDE.y + 34, { size: 24, family: 'Lalezar', color: P.gold });
    visitor(cx, SIDE.y + 190, 'warm');
    return;
  }

  const q = S.q;
  const kind = q.kind === 'cold' || q.kind === 'coldTime' ? 'cold' : 'warm';
  visitor(cx, SIDE.y + 150, kind);
  /* حبابِ گفت‌وگو */
  const by = SIDE.y + 236, bh = 148;
  ctx.fillStyle = P.paper;
  ctx.beginPath(); rrPath(SIDE.x + 20, by, SIDE.w - 40, bh, 14); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 12, by); ctx.lineTo(cx, by - 16); ctx.lineTo(cx + 12, by);
  ctx.closePath(); ctx.fill();

  /* نشانِ پرسش */
  if (q.kind === 'hot' || q.kind === 'cold') thermoIcon(cx, by + 40, q.kind === 'hot');
  else if (q.kind === 'hotDay') {
    ctx.fillStyle = DAY[q.row].c;
    ctx.beginPath(); rrPath(cx - 46, by + 26, 92, 30, 8); ctx.fill();
    text(DAY[q.row].n, cx, by + 41, { size: 18, family: 'Lalezar', color: '#fff' });
  } else if (q.kind === 'coldTime') {
    timeIcon(cx - 34, by + 40, TIME[q.col].k, .8);
    text(TIME[q.col].n, cx + 22, by + 41, { size: 19, family: 'Lalezar', color: P.ink });
  } else {
    timeIcon(cx - 52, by + 40, 'dawn', .62);
    ctx.strokeStyle = P.hot; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 18, by + 40); ctx.lineTo(cx + 16, by + 40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 6, by + 31); ctx.lineTo(cx + 17, by + 40); ctx.lineTo(cx + 6, by + 49); ctx.stroke();
    timeIcon(cx + 48, by + 40, 'noon', .62);
  }
  text(QTEXT[q.kind][0], cx, by + 84, { size: 18, family: 'Lalezar', color: P.ink });
  text(QTEXT[q.kind][1], cx, by + 114, { size: 15, color: P.inkSoft });

  /* پیشرفتِ پرسش‌ها */
  for (let i = 0; i < S.qTotal; i++) {
    const x = cx - (S.qTotal - 1) * 15 + i * 30;
    ctx.fillStyle = i < S.qIdx ? P.good : (i === S.qIdx ? P.gold : 'rgba(220, 234, 242, .22)');
    ctx.beginPath(); ctx.arc(x, by + bh + 28, 9, 0, TAU); ctx.fill();
  }
}

function thermoIcon(x, y, hot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#dfe9ef';
  ctx.beginPath(); rrPath(-7, -26, 14, 38, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 16, 12, 0, TAU); ctx.fill();
  ctx.fillStyle = hot ? P.hot : P.cold;
  ctx.beginPath(); ctx.arc(0, 16, 8, 0, TAU); ctx.fill();
  ctx.beginPath(); rrPath(-4, hot ? -22 : -2, 8, hot ? 40 : 20, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(34, 51, 60, .4)'; ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(7, -20 + i * 9); ctx.lineTo(13, -20 + i * 9); ctx.stroke(); }
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = 'rgba(8, 18, 25, .93)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(168, 216, 228, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 216 - i * 32;
    ctx.save();
    ctx.globalAlpha = i < S.lamps ? 1 : .22;
    ctx.fillStyle = i < S.lamps ? P.brassDk : '#5b6367';
    ctx.beginPath(); rrPath(x - 9, HUD_H / 2 - 11, 18, 24, 5); ctx.fill();
    ctx.fillStyle = i < S.lamps ? P.lamp : '#7d8589';
    ctx.beginPath(); rrPath(x - 6, HUD_H / 2 - 7, 12, 16, 3); ctx.fill();
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
}

function drawTutorial() {
  const st = S.tut.step;
  const g = tableGeom();
  if (st === 0) {
    spot([{ x: SHELF.x, y: SHELF.y, w: SHELF.w, h: SHELF.h }], .76);
    const h = tutCard(300, 120, 600,
      ['هر برگه یک دما دارد: نوارِ رنگی روزش را می‌گوید',
       'و نشانِ پایینش ساعتش را.'], 'ایستگاهِ هواشناسی');
    tutMore(600, 120 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: g.x - 12, y: g.y - 12, w: g.w + 24, h: g.h + 24 }], .7);
    tutCard(300, 500, 600, ['برگه را بردار و در خانه‌ای بگذار که',
      'روزش هم‌رنگ و ساعتش هم‌نشان باشد.']);
  } else {
    spot([{ x: SIDE.x, y: SIDE.y, w: SIDE.w, h: SIDE.h }], .72);
    const h = tutCard(240, 140, 600,
      ['وقتی جدول پُر شد، مهمانِ کوه می‌آید و می‌پرسد.',
       'جوابش را جایی ننوشته‌ایم —', 'باید در جدولِ خودت پیدایش کنی و رویش بزنی.'], 'از جدول بپرس');
    tutMore(540, 140 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function stationIcon(x, y) {
  thermoIcon(x - 44, y + 6, true);
  thermoIcon(x + 44, y + 6, false);
  ctx.fillStyle = 'rgba(34, 51, 60, .16)';
  ctx.beginPath(); rrPath(x - 22, y - 20, 44, 52, 7); ctx.fill();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 4); ctx.lineTo(x + 22, y - 4);
  ctx.moveTo(x - 22, y + 14); ctx.lineTo(x + 22, y + 14);
  ctx.moveTo(x - 6, y - 20); ctx.lineTo(x - 6, y + 32);
  ctx.stroke();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 800, h: 300, y: 128,
    paper: P.paper, band: P.cold, ink: P.ink, inkSoft: '#5a6f79',
    icon: stationIcon,
    title: 'ایستگاهِ هواشناسی',
    body: 'دماسنج‌های کوه برگه می‌فرستند: یک عدد، با نوارِ رنگیِ روز و نشانِ ساعت.\nبرگه‌ها را سرِ جایشان بگذار تا جدولِ هفته کامل شود.\nبعد مهمانِ کوه می‌آید و می‌پرسد — جوابش را در جدولِ خودت پیدا کن.',
    btn: BTN_GO, btnLabel: 'ایستگاه را باز کن', btnHot: S.hover === BTN_GO,
    btnFill: '#3d6f8e', btnHotFill: '#4e88ab',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#5a6f79',
    icon: stationIcon,
    title: L().endless ? 'برف نشست' : 'گزارش‌ها تمام شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ ایستگاه‌ها را گرداندی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'ایستگاهِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#3d6f8e', btnHotFill: '#4e88ab',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#5a6f79',
    icon: (x, y) => {
      ctx.fillStyle = '#8f7327';
      ctx.beginPath(); rrPath(x - 14, y - 14, 28, 38, 6); ctx.fill();
      ctx.fillStyle = '#6b6f72';
      ctx.beginPath(); rrPath(x - 9, y - 8, 18, 26, 4); ctx.fill();
      thermoIcon(x + 46, y + 4, false);
    },
    title: 'چراغ‌ها خاموش شد',
    body: 'امتیاز: ' + fa(S.score) + '\nاوّل جدول را کامل کن، بعد از خودش جواب بگیر.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#3d6f8e', btnHotFill: '#4e88ab',
  });
}

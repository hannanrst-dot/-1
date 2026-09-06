/*!
title: درمانگاهِ جانوران — هر کدام جای خود (بازی)
bg: #17202b
*/

/* ═══════════════════════════════════════════════════════════════════════
   درمانگاهِ جانوران — علومِ سوم، درس ۱۲ «هر کدام جای خود (۱)»  (بازی)

   فعّالیتِ کتاب: «یک دام‌پزشک تصویرهای زیر را از داخلِ بدنِ چند جانور
   جمع‌آوری کرده است. به دقّت نگاه کنید. کدام جانوران ستونِ مهره
   دارند؟» و بعد: «جانوران در جایی زندگی می‌کنند که بتوانند نیازهایشان
   را برطرف کنند.»

   اینجا بچّه خودش دام‌پزشک است: با دستگاهِ عکس، داخلِ بدنِ هر جانور را
   می‌بیند — ستونِ مهره هست یا نیست — و بعد جانور را به اتاقِ درستش
   می‌برد. بازی هیچ‌وقت نمی‌گوید کدام کدام است؛ فقط می‌گذارد نگاه کند.

   ── درستیِ زیستی ───────────────────────────────────────────────
   ستونِ مهرهٔ هر جانور همان‌جایی کشیده می‌شود که واقعاً هست: در ماهی
   از سر تا دُم، در مار در تمامِ درازای بدن، در پرنده و پستان‌دار از
   گردن تا انتهای دُم. و جانورانِ بی‌مهره ستونِ مهره ندارند؛ به‌جایش
   بدنِ بندبند یا صدف یا بدنِ نرم دارند — مورچه و ملخ و پروانه و کرم
   و خرچنگ و عروسِ دریایی، همان‌هایی که کتاب نام می‌برد.

   محلِّ زندگی هم واقعی است: ماهی و دلفین و خرچنگ و عروسِ دریایی در
   آب، و عقاب و مرغ و خرس و اسب و مار و مورچه و ملخ و پروانه و کرم
   در خشکی.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  wall: '#25344a', wallLo: '#17202b', wallHi: '#33465f',
  tile: '#2e4058', floor: '#3a4f6b',
  steel: '#9fb0c4', steelDk: '#5f7089', steelLt: '#dbe6f2',
  xray: '#0b1a16', bone: '#eef4f0', boneDk: '#b9c8c0',
  glass: 'rgba(160, 220, 240, .18)',
  water: '#3f8fc4', waterLt: '#7fc4e8', land: '#8a6a3f', landLt: '#b98f57',
  paper: '#fbf7ec', card: '#ffffff',
  ink: '#1b2733', inkSoft: '#78889a',
  good: '#4e9f6c', bad: '#c04a34', gold: '#e0a63f', accent: '#4c9ec4',
  fur: '#a8703f', skin: '#e8b98e',
};

/* ───────── جانوران ───────── */

const ANIMALS = {
  mahi:      { n: 'ماهیِ قرمز',    v: 1, w: 1 },
  qezel:     { n: 'قزل‌آلا',       v: 1, w: 1 },
  delfin:    { n: 'دلفین',         v: 1, w: 1 },
  oghab:     { n: 'عقاب',          v: 1, w: 0 },
  morgh:     { n: 'مرغ',           v: 1, w: 0 },
  khers:     { n: 'خرس',           v: 1, w: 0 },
  asb:       { n: 'اسب',           v: 1, w: 0 },
  mar:       { n: 'مار',           v: 1, w: 0 },
  morche:    { n: 'مورچه',         v: 0, w: 0 },
  malakh:    { n: 'ملخ',           v: 0, w: 0 },
  parvane:   { n: 'پروانه',        v: 0, w: 0 },
  kerm:      { n: 'کرمِ خاکی',     v: 0, w: 0 },
  kharchang: { n: 'خرچنگ',         v: 0, w: 1 },
  arus:      { n: 'عروسِ دریایی',  v: 0, w: 1 },
};

const LEVELS = [
  { name: 'ستونِ مهره', rooms: 2,
    q: ['asb', 'morche', 'mahi', 'malakh'] },
  { name: 'آب یا خشکی', rooms: 4,
    q: ['mahi', 'oghab', 'kharchang', 'morche', 'delfin', 'kerm'] },
  { name: 'شش تا مهمان', rooms: 4,
    q: ['mar', 'arus', 'morgh', 'parvane', 'qezel', 'khers', 'malakh', 'kharchang'] },
  { name: 'درمانگاهِ شلوغ', rooms: 4,
    q: ['khers', 'arus', 'parvane', 'delfin', 'kerm', 'asb', 'kharchang', 'qezel', 'morche', 'oghab'] },
];

/* اتاق‌ها: دو حالته یا چهارحالته */
const ROOMS2 = [
  { n: 'مهره‌دار', v: 1 },
  { n: 'بی‌مهره', v: 0 },
];
const ROOMS4 = [
  { n: 'مهره‌دارِ آبی', v: 1, w: 1 },
  { n: 'مهره‌دارِ خشکی', v: 1, w: 0 },
  { n: 'بی‌مهرهٔ آبی', v: 0, w: 1 },
  { n: 'بی‌مهرهٔ خشکی', v: 0, w: 0 },
];
const rooms = () => (L().rooms === 2 ? ROOMS2 : ROOMS4);

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  level: 0, score: 0, best: 0,
  queue: [], cur: null, done: 0,
  lens: { x: 600, y: 300, on: false },
  lensTo: null,              /* دستگاه بعد از عکس خودش کنار می‌رود */
  scanned: false, scanT: 0,
  drag: null,
  fly: null,                 /* جانورِ در حالِ رفتن به اتاق */
  badRoom: -1, badT: 0,
  won: false, winT: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const L = () => LEVELS[Math.min(S.level, LEVELS.length - 1)];
function tip(msg) { S.tip = msg; S.tipT = 3.2; }

function loadLevel(i) {
  S.level = i;
  S.queue = LEVELS[i].q.slice();
  S.cur = S.queue.shift();
  S.done = 0;
  S.scanned = false; S.scanT = 0;
  S.lens = { x: 300, y: 250, on: false };
  S.lensTo = null;
  S.drag = null; S.fly = null; S.badRoom = -1;
  S.won = false; S.winT = 0;
}

function startLevel(i, keep) {
  S.phase = 'play'; S.phaseT = 0;
  if (!keep) S.score = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  loadLevel(i);
}

/* ───────── جای‌ها ───────── */

const TABLE = { x: 420, y: 268, w: 360, h: 200 };
const TABLE_CX = TABLE.x + TABLE.w / 2, TABLE_CY = TABLE.y + 70;
const LENS_R = 96;
const QUEUE_Y = 660;
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };

function roomRect(i) {
  const n = rooms().length;
  const w = n === 2 ? 340 : 268;
  const gap = (SCENE_W - 80 - w * n) / Math.max(1, n - 1);
  return { x: 40 + i * (w + gap), y: HUD_H + 18, w, h: 150 };
}
function queueSlot(i) { return { x: 90 + i * 104, y: QUEUE_Y, w: 92, h: 82 }; }

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 1, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.lens.on) { S.lens.x = p.x; S.lens.y = p.y; checkScan(); return; }
  if (S.drag) { S.drag.x = p.x; S.drag.y = p.y; return; }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    if (S.cur && S.scanned && Math.hypot(p.x - TABLE_CX, p.y - TABLE_CY) < 96) S.hover = { k: 'animal' };
    else if (Math.hypot(p.x - S.lens.x, p.y - S.lens.y) < LENS_R) S.hover = { k: 'lens' };
    for (let i = 0; i < rooms().length; i++) if (inRect(p, roomRect(i))) S.hover = { k: 'room', i };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  const cap = () => { try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ } };
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startLevel(0); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.score = 0; loadLevel(0); sfx.tap(); }
    return;
  }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (S.winT || S.fly) return;
  /* بعد از عکس گرفتن، خودِ جانور اولویت دارد — وگرنه دستگاه رویش می‌ماند */
  if (S.cur && S.scanned && Math.hypot(p.x - TABLE_CX, p.y - TABLE_CY) < 96) {
    S.drag = { id: S.cur, x: p.x, y: p.y };
    cap(); sfx.tap();
    return;
  }
  if (Math.hypot(p.x - S.lens.x, p.y - S.lens.y) < LENS_R) {
    S.lens.on = true; S.lens.x = p.x; S.lens.y = p.y;
    cap(); sfx.slide();
    checkScan();
    return;
  }
  if (S.cur && Math.hypot(p.x - TABLE_CX, p.y - TABLE_CY) < 96) {
    if (!S.scanned) { tip('اوّل با دستگاهِ عکس داخلش را ببین.'); S.shake = .1; sfx.nope(); return; }
    S.drag = { id: S.cur, x: p.x, y: p.y };
    cap(); sfx.tap();
  }
});

function checkScan() {
  if (!S.cur || S.scanned) return;
  if (Math.hypot(S.lens.x - TABLE_CX, S.lens.y - TABLE_CY) < 48) {
    S.scanned = true; S.scanT = .001;
    S.lensTo = { x: 232, y: 386 };
    sfx.place();
    if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
  }
}

function release() {
  S.lens.on = false;
  const d = S.drag;
  if (!d) return;
  S.drag = null;
  const p = { x: d.x, y: d.y };
  for (let i = 0; i < rooms().length; i++) {
    if (!inRect(p, roomRect(i))) continue;
    const a = ANIMALS[d.id], r = rooms()[i];
    const ok = a.v === r.v && (r.w === undefined || a.w === r.w);
    if (ok) {
      const rr = roomRect(i);
      S.fly = { id: d.id, x: p.x, y: p.y, tx: rr.x + rr.w / 2, ty: rr.y + rr.h / 2, t: 0 };
      sfx.good();
      bits.confetti(rr.x + rr.w / 2, rr.y + rr.h, 14, [P.good, P.gold, '#fff']);
    } else {
      S.badRoom = i; S.badT = .7;
      S.shake = .14; sfx.nope();
      tip('اینجا نه — دوباره نگاهش کن.');
    }
    return;
  }
  sfx.pop();
}
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

function nextAnimal() {
  S.done++;
  S.score += 40;
  if (S.score > S.best) S.best = S.score;
  if (!S.queue.length) {
    S.cur = null;
    S.won = true; S.winT = .001;
    S.score += 60 + S.level * 20;
    if (S.score > S.best) S.best = S.score;
    sfx.win();
    return;
  }
  S.cur = S.queue.shift();
  S.scanned = false; S.scanT = 0;
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.badT > 0) { S.badT -= dt; if (S.badT <= 0) S.badRoom = -1; }
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.scanT) S.scanT = Math.min(1, S.scanT + dt * 2.4);
  if (S.lensTo && !S.lens.on) {
    const k = clamp(dt * 7, 0, 1);
    S.lens.x = lerp(S.lens.x, S.lensTo.x, k);
    S.lens.y = lerp(S.lens.y, S.lensTo.y, k);
    if (Math.hypot(S.lens.x - S.lensTo.x, S.lens.y - S.lensTo.y) < 2) S.lensTo = null;
  }
  if (S.tut.on) S.tut.t += dt;
  if (S.fly) {
    S.fly.t += dt * 2.4;
    if (S.fly.t >= 1) { S.fly = null; nextAnimal(); }
  }
  if (S.winT) {
    S.winT += dt;
    if (S.winT > 2.2) {
      S.winT = 0;
      if (S.level >= LEVELS.length - 1) { S.phase = 'won'; S.phaseT = 0; }
      else { loadLevel(S.level + 1); toast.say(L().name, 'good'); }
    }
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { loadLevel(0); runLoop(step); });

/* ───────── ابزارِ نقاشی ───────── */

function rrPath(x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function numText(str, x, y, o = {}) {
  ctx.save();
  ctx.direction = 'ltr';
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = o.color || P.ink;
  ctx.font = `${o.weight || 700} ${o.size || 18}px "${o.family || 'Vazirmatn'}", Tahoma, sans-serif`;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(shapes, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const s of shapes) {
    if (s.r) { ctx.moveTo(s.x + s.r, s.y); ctx.arc(s.x, s.y, s.r, 0, TAU, true); }
    else rrPath(s.x - 10, s.y - 10, s.w + 20, s.h + 20, 18);
  }
  ctx.fillStyle = `rgba(6, 14, 22, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 248, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '6, 14, 22');
  ctx.fillStyle = P.accent;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#68788a' }); yy += 30; }
  return h + 20;
}

/* ───────── بدنِ جانوران ───────── */

function body(id, x, y, k) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  const E = (cx, cy, rx, ry, rot, col, seed) => {
    ctx.fillStyle = col; wobbleEllipse(cx, cy, rx, ry, rot || 0, seed || 3, 1.4); ctx.fill();
  };
  if (id === 'mahi' || id === 'qezel') {
    const c1 = id === 'mahi' ? '#e8703f' : '#7f9fb8', c2 = id === 'mahi' ? '#ffa06a' : '#b8cfdc';
    E(0, 0, 52, 30, 0, c1, 3);
    ctx.fillStyle = c1;
    ctx.beginPath(); ctx.moveTo(44, 0); ctx.lineTo(76, -24); ctx.lineTo(76, 24); ctx.closePath(); ctx.fill();
    E(-6, -22, 20, 10, -.3, c2, 5);
    E(4, 20, 16, 8, .3, c2, 7);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-32, -6, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1b2733';
    ctx.beginPath(); ctx.arc(-33, -6, 3.4, 0, TAU); ctx.fill();
    ctx.strokeStyle = c2; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(-14, 0, 20, -1.1, 1.1); ctx.stroke();
  } else if (id === 'delfin') {
    E(0, 0, 62, 26, -.08, '#6f93b8', 3);
    ctx.fillStyle = '#6f93b8';
    ctx.beginPath(); ctx.moveTo(52, -4); ctx.lineTo(84, -22); ctx.lineTo(80, 10); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-2, -24); ctx.lineTo(14, -48); ctx.lineTo(22, -22); ctx.closePath(); ctx.fill();
    E(-46, 6, 24, 13, .25, '#6f93b8', 9);
    E(0, 10, 54, 16, -.05, '#cfe0ec', 11);
    ctx.fillStyle = '#1b2733';
    ctx.beginPath(); ctx.arc(-44, -4, 3.6, 0, TAU); ctx.fill();
  } else if (id === 'oghab') {
    E(0, 4, 34, 30, 0, '#6b4a2c', 3);
    E(-26, -22, 20, 17, 0, '#e8ddc8', 5);
    ctx.fillStyle = '#e0a63f';
    ctx.beginPath(); ctx.moveTo(-42, -22); ctx.lineTo(-58, -14); ctx.lineTo(-40, -10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a3d22';
    ctx.beginPath(); ctx.moveTo(6, -14); ctx.quadraticCurveTo(56, -34, 62, 6);
    ctx.quadraticCurveTo(36, 6, 6, 14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e0a63f'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, 30); ctx.lineTo(-6, 44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, 30); ctx.lineTo(14, 44); ctx.stroke();
    ctx.fillStyle = '#1b2733';
    ctx.beginPath(); ctx.arc(-30, -24, 3.4, 0, TAU); ctx.fill();
  } else if (id === 'morgh') {
    E(4, 4, 32, 27, 0, '#f0ede2', 3);
    E(-24, -20, 16, 14, 0, '#f0ede2', 5);
    ctx.fillStyle = '#d94f3d';
    ctx.beginPath(); ctx.moveTo(-30, -34); ctx.quadraticCurveTo(-24, -44, -18, -34);
    ctx.quadraticCurveTo(-12, -44, -8, -32); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e0a63f';
    ctx.beginPath(); ctx.moveTo(-38, -18); ctx.lineTo(-50, -14); ctx.lineTo(-38, -10); ctx.closePath(); ctx.fill();
    E(14, 2, 18, 15, .3, '#dcd6c4', 9);
    ctx.strokeStyle = '#e0a63f'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 28); ctx.lineTo(-2, 44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(16, 28); ctx.lineTo(18, 44); ctx.stroke();
    ctx.fillStyle = '#1b2733';
    ctx.beginPath(); ctx.arc(-28, -22, 3.2, 0, TAU); ctx.fill();
  } else if (id === 'khers') {
    E(6, 4, 42, 34, 0, P.fur, 3);
    E(-34, -12, 24, 22, 0, P.fur, 5);
    E(-46, -30, 9, 9, 0, P.fur, 7);
    E(-24, -32, 9, 9, 0, P.fur, 9);
    E(-44, -6, 12, 9, 0, '#d9b08a', 11);
    ctx.fillStyle = '#1b2733';
    ctx.beginPath(); ctx.arc(-48, -8, 3.6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(-34, -16, 3, 0, TAU); ctx.fill();
    ctx.fillStyle = P.fur;
    for (const dx of [-8, 26]) { wobbleEllipse(dx, 36, 12, 10, 0, dx, 1); ctx.fill(); }
  } else if (id === 'asb') {
    E(6, 0, 46, 28, 0, '#a8703f', 3);
    ctx.fillStyle = '#a8703f';
    ctx.beginPath(); ctx.moveTo(-34, -8); ctx.lineTo(-52, -44); ctx.lineTo(-34, -46);
    ctx.lineTo(-18, -12); ctx.closePath(); ctx.fill();
    E(-46, -46, 13, 10, -.4, '#a8703f', 5);
    ctx.fillStyle = '#4a3320';
    ctx.beginPath(); ctx.moveTo(-30, -44); ctx.quadraticCurveTo(-14, -30, -8, -8);
    ctx.lineTo(-20, -6); ctx.quadraticCurveTo(-24, -28, -38, -40); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(48, -18); ctx.quadraticCurveTo(72, 0, 56, 30);
    ctx.lineTo(46, 22); ctx.quadraticCurveTo(58, 2, 42, -14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#a8703f'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    for (const dx of [-14, 4, 22, 36]) {
      ctx.beginPath(); ctx.moveTo(dx, 22); ctx.lineTo(dx + 2, 50); ctx.stroke();
    }
    ctx.fillStyle = '#1b2733';
    ctx.beginPath(); ctx.arc(-42, -42, 3.2, 0, TAU); ctx.fill();
  } else if (id === 'mar') {
    ctx.strokeStyle = '#5f9f4a'; ctx.lineWidth = 20; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-64, 22);
    ctx.bezierCurveTo(-20, 40, -30, -14, 8, -6);
    ctx.bezierCurveTo(44, 2, 40, -34, 66, -30);
    ctx.stroke();
    ctx.strokeStyle = '#8fc46a'; ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-64, 22);
    ctx.bezierCurveTo(-20, 40, -30, -14, 8, -6);
    ctx.bezierCurveTo(44, 2, 40, -34, 66, -30);
    ctx.stroke();
    E(68, -32, 16, 12, -.2, '#5f9f4a', 5);
    ctx.fillStyle = '#1b2733';
    ctx.beginPath(); ctx.arc(74, -36, 3, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#d94f3d'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(82, -30); ctx.lineTo(96, -28); ctx.stroke();
  } else if (id === 'morche') {
    for (const [cx, rx, ry] of [[-30, 14, 12], [0, 11, 10], [30, 20, 16]]) E(cx, 0, rx, ry, 0, '#5a3d22', cx + 5);
    ctx.strokeStyle = '#5a3d22'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-6 + i * 12, 0);
      ctx.quadraticCurveTo(-6 + i * 12 + s * 6, s * 18, -14 + i * 16 + s * 10, s * 30);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(-38, -6); ctx.quadraticCurveTo(-52, -22, -60, -18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-36, -10); ctx.quadraticCurveTo(-46, -28, -40, -34); ctx.stroke();
    ctx.fillStyle = '#f0ede2';
    ctx.beginPath(); ctx.arc(-34, -4, 3, 0, TAU); ctx.fill();
  } else if (id === 'malakh') {
    E(6, 0, 40, 16, -.08, '#6ba83f', 3);
    E(-32, -4, 16, 12, -.1, '#5a9432', 5);
    ctx.fillStyle = '#8fc46a';
    wobbleEllipse(10, -10, 34, 11, -.12, 7, 1.2); ctx.fill();
    ctx.strokeStyle = '#5a9432'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(16, 8); ctx.lineTo(38, -14); ctx.lineTo(52, 22); ctx.stroke();
    ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(-6, 10); ctx.lineTo(-14, 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, 10); ctx.lineTo(2, 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-40, -10); ctx.quadraticCurveTo(-56, -26, -64, -20); ctx.stroke();
    ctx.fillStyle = '#f0ede2';
    ctx.beginPath(); ctx.arc(-36, -6, 3.4, 0, TAU); ctx.fill();
  } else if (id === 'parvane') {
    ctx.fillStyle = '#e07fb0';
    wobbleEllipse(-24, -18, 26, 22, -.4, 3, 1.6); ctx.fill();
    wobbleEllipse(24, -18, 26, 22, .4, 5, 1.6); ctx.fill();
    ctx.fillStyle = '#f2a8cf';
    wobbleEllipse(-22, 16, 20, 17, .3, 7, 1.4); ctx.fill();
    wobbleEllipse(22, 16, 20, 17, -.3, 9, 1.4); ctx.fill();
    ctx.fillStyle = '#e8c44a';
    for (const [cx, cy] of [[-28, -20], [28, -20], [-24, 16], [24, 16]]) {
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, TAU); ctx.fill();
    }
    E(0, 0, 7, 26, 0, '#4a3320', 11);
    ctx.strokeStyle = '#4a3320'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-3, -24); ctx.quadraticCurveTo(-14, -40, -20, -38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, -24); ctx.quadraticCurveTo(14, -40, 20, -38); ctx.stroke();
  } else if (id === 'kerm') {
    ctx.strokeStyle = '#d98fa0'; ctx.lineWidth = 22; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-62, 10);
    ctx.bezierCurveTo(-24, 30, -10, -20, 22, -2);
    ctx.bezierCurveTo(46, 10, 52, -14, 64, -12);
    ctx.stroke();
    ctx.strokeStyle = '#c47487'; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const u = i / 9;
      const x = -62 + u * 126, y = 10 + Math.sin(u * 6) * 14;
      ctx.beginPath(); ctx.moveTo(x, y - 11); ctx.lineTo(x, y + 11); ctx.stroke();
    }
    ctx.fillStyle = '#b06478';
    ctx.beginPath(); ctx.arc(-16, 8, 12, 0, TAU); ctx.fill();
  } else if (id === 'kharchang') {
    E(0, 0, 44, 30, 0, '#d9553f', 3);
    ctx.strokeStyle = '#d9553f'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(s * 26, 6 + i * 6);
      ctx.quadraticCurveTo(s * 50, 16 + i * 10, s * 60, 34 + i * 6);
      ctx.stroke();
    }
    for (const s of [-1, 1]) {
      ctx.strokeStyle = '#d9553f'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(s * 30, -12); ctx.lineTo(s * 54, -30); ctx.stroke();
      ctx.fillStyle = '#e8705a';
      ctx.beginPath();
      ctx.moveTo(s * 54, -30); ctx.lineTo(s * 78, -44); ctx.lineTo(s * 76, -26);
      ctx.lineTo(s * 84, -16); ctx.lineTo(s * 58, -22); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#fff';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 14, -18, 7, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#1b2733';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 14, -18, 3.4, 0, TAU); ctx.fill(); }
  } else {
    /* عروسِ دریایی */
    ctx.fillStyle = 'rgba(214, 160, 224, .75)';
    ctx.beginPath();
    ctx.moveTo(-46, 4);
    ctx.quadraticCurveTo(-46, -46, 0, -46);
    ctx.quadraticCurveTo(46, -46, 46, 4);
    ctx.quadraticCurveTo(24, 14, 0, 4);
    ctx.quadraticCurveTo(-24, 14, -46, 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(240, 210, 246, .6)';
    wobbleEllipse(-14, -22, 16, 10, -.3, 5, 1.4); ctx.fill();
    ctx.strokeStyle = 'rgba(214, 160, 224, .8)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const x = -34 + i * 14;
      ctx.beginPath();
      ctx.moveTo(x, 6);
      ctx.quadraticCurveTo(x + Math.sin(i + S.t * 2) * 12, 26, x + Math.sin(i * 2 + S.t * 2) * 10, 48);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ───────── اسکلت ─────────
   ستونِ مهره دقیقاً همان‌جایی است که در بدنِ واقعی هست.            */

function spineOf(id) {
  switch (id) {
    case 'mahi': case 'qezel':
      return [[-46, -2], [-24, -2], [0, 0], [24, 2], [44, 2], [62, 0]];
    case 'delfin':
      return [[-46, -4], [-20, -6], [6, -2], [32, 0], [56, -2], [76, -10]];
    case 'oghab':
      return [[-26, -20], [-14, -8], [0, 2], [16, 10], [30, 14]];
    case 'morgh':
      return [[-24, -18], [-12, -6], [2, 4], [16, 10], [28, 12]];
    case 'khers':
      return [[-32, -12], [-14, -6], [6, 0], [26, 4], [44, 8]];
    case 'asb':
      return [[-40, -38], [-26, -20], [-8, -8], [14, -6], [36, -8], [50, -14]];
    case 'mar':
      return [[-62, 22], [-40, 30], [-18, 12], [4, -6], [26, 0], [48, -20], [66, -30]];
    default: return null;
  }
}

function skeleton(id, x, y, k) {
  const a = ANIMALS[id];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  const sp = spineOf(id);
  if (a.v && sp) {
    /* ستونِ مهره: زنجیرهٔ مهره‌ها */
    ctx.strokeStyle = P.boneDk; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sp[0][0], sp[0][1]);
    for (let i = 1; i < sp.length; i++) ctx.lineTo(sp[i][0], sp[i][1]);
    ctx.stroke();
    for (let i = 0; i < sp.length - 1; i++) {
      const steps = 5;
      for (let j = 0; j <= steps; j++) {
        const u = j / steps;
        const px = sp[i][0] + (sp[i + 1][0] - sp[i][0]) * u;
        const py = sp[i][1] + (sp[i + 1][1] - sp[i][1]) * u;
        ctx.fillStyle = P.bone;
        ctx.beginPath(); ctx.arc(px, py, 4.6, 0, TAU); ctx.fill();
      }
    }
    /* جمجمه */
    ctx.fillStyle = P.bone;
    const h = sp[0];
    ctx.beginPath(); ctx.ellipse(h[0] - 6, h[1] - 4, 13, 10, -.2, 0, TAU); ctx.fill();
    /* دنده‌ها یا اندام‌ها */
    ctx.strokeStyle = P.bone; ctx.lineWidth = 3;
    if (id === 'mahi' || id === 'qezel') {
      for (let i = 1; i < 5; i++) {
        const t = i / 5, px = -46 + t * 92, py = -2 + t * 4;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 4, py + 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 4, py - 20); ctx.stroke();
      }
    } else if (id === 'mar') {
      for (let i = 0; i < 12; i++) {
        const u = i / 11;
        const seg = Math.min(sp.length - 2, Math.floor(u * (sp.length - 1)));
        const f = u * (sp.length - 1) - seg;
        const px = sp[seg][0] + (sp[seg + 1][0] - sp[seg][0]) * f;
        const py = sp[seg][1] + (sp[seg + 1][1] - sp[seg][1]) * f;
        ctx.beginPath(); ctx.arc(px, py + 2, 9, .2, Math.PI - .2); ctx.stroke();
      }
    } else {
      for (let i = 1; i < 4; i++) {
        const t = i / 4;
        const seg = Math.min(sp.length - 2, Math.floor(t * (sp.length - 1)));
        const f = t * (sp.length - 1) - seg;
        const px = sp[seg][0] + (sp[seg + 1][0] - sp[seg][0]) * f;
        const py = sp[seg][1] + (sp[seg + 1][1] - sp[seg][1]) * f;
        ctx.beginPath(); ctx.arc(px, py + 10, 14, -1.1, 1.1); ctx.stroke();
      }
      /* استخوانِ پاها */
      if (id === 'khers' || id === 'asb' || id === 'morgh' || id === 'oghab') {
        const legs = id === 'asb' ? [-14, 4, 22, 36] : id === 'khers' ? [-8, 26] : [0, 16];
        for (const dx of legs) {
          ctx.beginPath(); ctx.moveTo(dx, 6); ctx.lineTo(dx + 2, 34); ctx.stroke();
        }
      }
      if (id === 'delfin') {
        ctx.beginPath(); ctx.moveTo(-40, 4); ctx.lineTo(-52, 12); ctx.stroke();
      }
    }
  } else {
    /* بی‌مهره: هیچ ستونِ مهره‌ای نیست */
    ctx.strokeStyle = 'rgba(238,244,240,.5)'; ctx.lineWidth = 2.4;
    ctx.setLineDash([5, 6]);
    if (id === 'kharchang') {
      ctx.beginPath(); ctx.ellipse(0, 0, 44, 30, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(238,244,240,.75)'; ctx.lineWidth = 3;
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(s * 26, 6 + i * 6);
        ctx.quadraticCurveTo(s * 50, 16 + i * 10, s * 60, 34 + i * 6);
        ctx.stroke();
      }
    } else if (id === 'arus') {
      ctx.beginPath();
      ctx.moveTo(-46, 4);
      ctx.quadraticCurveTo(0, -52, 46, 4);
      ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -16, 22, 14, 0, 0, TAU); ctx.stroke();
    } else if (id === 'kerm') {
      ctx.beginPath();
      ctx.moveTo(-62, 10);
      ctx.bezierCurveTo(-24, 30, -10, -20, 22, -2);
      ctx.bezierCurveTo(46, 10, 52, -14, 64, -12);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(238,244,240,.7)'; ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        const u = i / 9, x = -62 + u * 126, y = 10 + Math.sin(u * 6) * 14;
        ctx.beginPath(); ctx.moveTo(x, y - 11); ctx.lineTo(x, y + 11); ctx.stroke();
      }
    } else {
      /* بندبندهای حشره */
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(238,244,240,.7)'; ctx.lineWidth = 3;
      const segs = id === 'parvane' ? [[0, -20], [0, 0], [0, 20]]
        : id === 'malakh' ? [[-32, -4], [-6, 0], [26, 2]]
        : [[-30, 0], [0, 0], [30, 0]];
      for (const [cx, cy] of segs) {
        ctx.beginPath(); ctx.ellipse(cx, cy, 13, 11, 0, 0, TAU); ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(segs[0][0], segs[0][1]);
      for (const s of segs) ctx.lineTo(s[0], s[1]);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    /* نشانهٔ «ستونِ مهره ندارد» */
    ctx.strokeStyle = 'rgba(201,90,70,.9)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-70, -46); ctx.lineTo(-52, -28);
    ctx.moveTo(-52, -46); ctx.lineTo(-70, -28);
    ctx.stroke();
  }
  ctx.restore();
}

/* ───────── صحنه ───────── */

function paintRoomStatic() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, SCENE_H);
  g.addColorStop(0, P.wallHi); g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, HUD_H, SCENE_W, SCENE_H - HUD_H);
  /* کاشی‌های دیوار */
  ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 2;
  for (let x = 0; x < SCENE_W; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, HUD_H); ctx.lineTo(x, 560); ctx.stroke();
  }
  for (let y = HUD_H; y < 560; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke();
  }
  /* کف */
  ctx.fillStyle = P.floor;
  ctx.fillRect(0, 560, SCENE_W, SCENE_H - 560);
  ctx.fillStyle = 'rgba(255,255,255,.05)';
  ctx.fillRect(0, 560, SCENE_W, 4);

  /* قفسهٔ داروها */
  const cx0 = 56, cy0 = 306, cw = 214, ch = 254;
  ctx.fillStyle = '#22303f';
  ctx.beginPath(); rrPath(cx0, cy0, cw, ch, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(159,176,196,.35)'; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(cx0, cy0, cw, ch, 10); ctx.stroke();
  for (let r = 0; r < 3; r++) {
    const sy = cy0 + 74 + r * 68;
    ctx.fillStyle = 'rgba(159,176,196,.3)';
    ctx.fillRect(cx0 + 8, sy, cw - 16, 5);
    for (let j = 0; j < 4; j++) {
      const jx = cx0 + 30 + j * 44;
      ctx.fillStyle = ['#7fc4a8', '#e8c46a', '#d98fa0', '#8fb0e0'][(r + j) % 4];
      ctx.beginPath(); rrPath(jx - 12, sy - 34, 24, 34, 5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      ctx.beginPath(); rrPath(jx - 8, sy - 30, 5, 24, 2); ctx.fill();
      ctx.fillStyle = '#5f7089';
      ctx.beginPath(); rrPath(jx - 8, sy - 40, 16, 8, 3); ctx.fill();
    }
  }
  /* پوسترِ ستونِ مهره روی دیوار */
  const px0 = 934, py0 = 300, pw = 220, ph = 210;
  ctx.fillStyle = '#f4f0e2';
  ctx.beginPath(); rrPath(px0, py0, pw, ph, 8); ctx.fill();
  ctx.strokeStyle = '#5f7089'; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(px0, py0, pw, ph, 8); ctx.stroke();
  ctx.save();
  ctx.translate(px0 + pw / 2, py0 + 106);
  ctx.strokeStyle = '#3a4f6b'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, -62); ctx.lineTo(0, 62); ctx.stroke();
  ctx.fillStyle = '#3a4f6b';
  for (let y = -62; y <= 62; y += 13) {
    ctx.beginPath(); ctx.ellipse(0, y, 13, 5.4, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = '#e8ddc8';
  ctx.beginPath(); ctx.ellipse(0, -78, 20, 16, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawRooms() {
  const rs = rooms();
  for (let i = 0; i < rs.length; i++) {
    const r = roomRect(i), room = rs[i];
    const hot = S.hover && S.hover.k === 'room' && S.hover.i === i;
    const bad = S.badRoom === i;
    ctx.fillStyle = bad ? 'rgba(192,74,52,.35)' : (hot ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.07)');
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 14); ctx.fill();
    ctx.strokeStyle = bad ? P.bad : (room.w === 1 ? P.water : room.w === 0 ? P.land : P.steel);
    ctx.lineWidth = 3;
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 14); ctx.stroke();
    /* نشانهٔ اتاق */
    const cx = r.x + r.w / 2;
    if (room.w === 1) {
      ctx.fillStyle = 'rgba(63,143,196,.4)';
      ctx.beginPath(); rrPath(r.x + 8, r.y + r.h - 46, r.w - 16, 38, 8); ctx.fill();
      ctx.strokeStyle = P.waterLt; ctx.lineWidth = 2.6;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        for (let x = r.x + 14; x < r.x + r.w - 14; x += 14) {
          ctx.lineTo(x, r.y + r.h - 34 + k * 11 + Math.sin((x + S.t * 40 + k * 20) * .05) * 3);
        }
        ctx.stroke();
      }
    } else if (room.w === 0) {
      ctx.fillStyle = 'rgba(138,106,63,.5)';
      ctx.beginPath(); rrPath(r.x + 8, r.y + r.h - 46, r.w - 16, 38, 8); ctx.fill();
      ctx.fillStyle = '#5f9f4a';
      for (let x = r.x + 16; x < r.x + r.w - 16; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, r.y + r.h - 8); ctx.lineTo(x + 4, r.y + r.h - 26); ctx.lineTo(x + 8, r.y + r.h - 8);
        ctx.closePath(); ctx.fill();
      }
    }
    /* نشانهٔ ستونِ مهره */
    ctx.save();
    ctx.translate(cx, r.y + 46);
    ctx.scale(.9, .9);
    if (room.v) {
      ctx.strokeStyle = P.bone; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.stroke();
      ctx.fillStyle = P.bone;
      for (let x = -40; x <= 40; x += 10) { ctx.beginPath(); ctx.arc(x, 0, 4.4, 0, TAU); ctx.fill(); }
    } else {
      ctx.strokeStyle = 'rgba(238,244,240,.5)'; ctx.lineWidth = 4;
      ctx.setLineDash([6, 7]);
      ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = P.bad; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, -12); ctx.lineTo(10, 8);
      ctx.moveTo(10, -12); ctx.lineTo(-10, 8);
      ctx.stroke();
    }
    ctx.restore();
    text(room.n, cx, r.y + 92, { size: 17, color: P.paper });
  }
}

function drawTable() {
  /* میزِ معاینه */
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(TABLE.x, TABLE.y + 100, TABLE.w, 22, 8); ctx.fill();
  ctx.fillStyle = P.steel;
  ctx.beginPath(); rrPath(TABLE.x, TABLE.y + 96, TABLE.w, 18, 8); ctx.fill();
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(TABLE.x + 40, TABLE.y + 118, 22, 90, 6); ctx.fill();
  ctx.beginPath(); rrPath(TABLE.x + TABLE.w - 62, TABLE.y + 118, 22, 90, 6); ctx.fill();
  if (!S.cur) return;
  contact(TABLE_CX, TABLE.y + 100, 90, 14, .4);
  if (!(S.drag && S.drag.id === S.cur)) body(S.cur, TABLE_CX, TABLE_CY, 1);
  text(ANIMALS[S.cur].n, TABLE_CX, TABLE.y + 150,
    { size: 20, family: 'Lalezar', color: P.paper });
}

function drawLens() {
  const l = S.lens;
  /* پرتوِ دستگاه */
  ctx.save();
  ctx.beginPath(); ctx.arc(l.x, l.y, LENS_R, 0, TAU); ctx.clip();
  ctx.fillStyle = P.xray;
  ctx.fillRect(l.x - LENS_R, l.y - LENS_R, LENS_R * 2, LENS_R * 2);
  /* خطوطِ اسکن */
  ctx.strokeStyle = 'rgba(120, 220, 190, .12)'; ctx.lineWidth = 1.6;
  for (let y = l.y - LENS_R; y < l.y + LENS_R; y += 7) {
    ctx.beginPath(); ctx.moveTo(l.x - LENS_R, y); ctx.lineTo(l.x + LENS_R, y); ctx.stroke();
  }
  if (S.cur) {
    ctx.save();
    ctx.globalAlpha = .35;
    body(S.cur, TABLE_CX, TABLE_CY, 1);
    ctx.restore();
    skeleton(S.cur, TABLE_CX, TABLE_CY, 1);
    /* بعد از عکس، عکسِ گرفته‌شده داخلِ خودِ دستگاه می‌ماند */
    if (S.scanned && Math.hypot(l.x - TABLE_CX, l.y - TABLE_CY) > 40) {
      ctx.save();
      ctx.globalAlpha = .3;
      body(S.cur, l.x, l.y, .78);
      ctx.restore();
      skeleton(S.cur, l.x, l.y, .78);
    }
  }
  ctx.restore();
  /* قابِ دستگاه */
  ctx.strokeStyle = P.steelLt; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(l.x, l.y, LENS_R, 0, TAU); ctx.stroke();
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(l.x, l.y, LENS_R + 5, 0, TAU); ctx.stroke();
  /* دسته */
  ctx.save();
  ctx.translate(l.x, l.y);
  ctx.rotate(-.7);
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(LENS_R + 2, -13, 76, 26, 10); ctx.fill();
  ctx.fillStyle = P.steel;
  ctx.beginPath(); rrPath(LENS_R + 6, -9, 66, 18, 8); ctx.fill();
  ctx.restore();
  if (!S.scanned && S.cur) {
    ctx.save();
    ctx.globalAlpha = .5 + .3 * Math.sin(S.t * 3);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 3;
    ctx.setLineDash([10, 9]);
    ctx.lineDashOffset = -S.t * 26;
    ctx.beginPath(); ctx.arc(TABLE_CX, TABLE_CY, 62, 0, TAU); ctx.stroke();
    ctx.restore();
  }
}

function drawQueue() {
  text('در نوبت', 40, QUEUE_Y + 40, { size: 17, color: 'rgba(251,247,236,.6)', align: 'right' });
  for (let i = 0; i < S.queue.length; i++) {
    const b = queueSlot(i);
    if (b.x > SCENE_W - 120) break;
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.fill();
    ctx.save();
    ctx.globalAlpha = .85;
    body(S.queue[i], b.x + b.w / 2, b.y + b.h / 2 + 4, .42);
    ctx.restore();
  }
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#0e161f';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224,166,63,.22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 150, HUD_H / 2, { size: 24, family: 'Lalezar', color: P.paper });
  numText(fa(S.level + 1) + ' / ' + fa(LEVELS.length), 640, HUD_H / 2, { size: 21, color: P.gold });
  numText(fa(S.score), 300, HUD_H / 2, { size: 20, color: P.paper });
  text('بیشترین ' + fa(S.best), 150, HUD_H / 2, { size: 15, color: 'rgba(251,247,236,.6)' });
  const tot = L().q.length;
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * (S.done / tot), 5, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: TABLE_CX, y: TABLE_CY, r: 110 }], .72);
    const h = tutCard(360, 480, 500, ['یک مهمان روی میزِ معاینه.'], 'درمانگاهِ جانوران');
    tutMore(610, 480 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: S.lens.x, y: S.lens.y, r: LENS_R + 20 }], .7);
    const h = tutCard(360, 480, 520,
      ['دستگاهِ عکس را بکش روی جانور', 'تا داخلِ بدنش را ببینی.']);
    tutMore(620, 480 + h + 8, S.t, P.ink);
  } else {
    const r = roomRect(0);
    spot([{ x: r.x, y: r.y, w: r.w, h: r.h }], .7);
    const h = tutCard(360, 480, 520, ['بعد جانور را بکش به اتاقِ درستش.']);
    tutMore(620, 480 + h + 8, S.t, P.ink);
  }
}

function xIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.xray;
  ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.bone; ctx.lineWidth = 3.4;
  ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.stroke();
  ctx.fillStyle = P.bone;
  for (let k = -20; k <= 20; k += 8) { ctx.beginPath(); ctx.arc(k, 0, 3.6, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = P.steelLt; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.stroke();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 880, h: 306, y: 128,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: '#68788a',
    icon: xIcon,
    title: 'درمانگاهِ جانوران',
    body: 'امروز تو دام‌پزشکی. دستگاهِ عکس را روی هر مهمان بکش\nو ببین داخلِ بدنش ستونِ مهره هست یا نه،\nبعد ببرش به اتاقی که به آن می‌خورد.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 840, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#68788a',
    icon: xIcon,
    title: 'همه را جا دادی',
    body: 'بعضی جانوران داخلِ بدنشان ستونِ مهره دارند و بعضی ندارند،\nو هرکدام جایی زندگی می‌کنند که نیازشان آنجا برطرف شود.\nامتیازت: ' + fa(S.score),
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function draw() {
  beginScene(P.wallLo);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, 0);
  }
  const layer = staticLayer('room', SCENE_W, SCENE_H, paintRoomStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawRooms();
  drawTable();
  drawQueue();
  if (S.cur) drawLens();
  if (S.fly) {
    const u = easeOut(S.fly.t);
    body(S.fly.id, lerp(S.fly.x, S.fly.tx, u), lerp(S.fly.y, S.fly.ty, u), lerp(1, .5, u));
  }
  if (S.drag) body(S.drag.id, S.drag.x, S.drag.y, 1);
  bits.draw();
  ctx.restore();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 178, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 470;
    paper(SCENE_W / 2 - w / 2, 556, w, 42, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, 577, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.08, 'rgba(4, 12, 20, .42)', 0, .1);
}

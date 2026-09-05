/*!
title: ترازوخانهٔ بازار — اندازه‌گیری مواد (بازی)
bg: #2a2018
*/

/* ═══════════════════════════════════════════════════════════════════════
   ترازوخانهٔ بازار — علومِ سوم، درس ۳ «اندازه‌گیری مواد»  (بازی)

   درسِ کتاب: با چشم و دست نمی‌شود فهمید کدام سنگین‌تر است؛ ترازو لازم
   است. بعد: جرمِ پاک‌کن برابرِ چند گیرهٔ کاغذ است؟ و مهم‌ترین پرسشِ
   کتاب: «اگر از گیره‌های دیگری استفاده کنیم، نتیجه تغییر می‌کند؟»
   و سرانجام: یکای مشترک — گرم و کیلوگرم.

   بازی همان است، ولی هیچ پرسشی پرسیده نمی‌شود:
   ▸ ترازوی دوکفّه‌ای واقعی است: زاویهٔ شاهین با اختلافِ جرم کم و زیاد
     می‌شود و در برابری صاف می‌ایستد. پس بچّه با چشمِ خودش می‌بیند کدام
     طرف سنگین‌تر است، نه اینکه به او بگویند.
   ▸ روی هر دو کفّه می‌شود وزنه گذاشت — همان‌طور که با ترازوی واقعی
     می‌شود. آزادیِ کامل، و هیچ حرکتی برگشت‌ناپذیر نیست.
   ▸ مرحلهٔ دوم دو جورِ مهره دارد: مهرهٔ بزرگ و مهرهٔ کوچک. یک جسمِ
     ثابت با مهرهٔ بزرگ می‌شود ۴ تا و با مهرهٔ کوچک ۱۰ تا؛ هر دو در
     دفتر کنارِ هم می‌نشینند. بچّه خودش می‌بیند که عددِ بی‌یکا بی‌معنی
     است — بی‌آنکه جمله‌ای نوشته شود.
   ▸ از مرحلهٔ سوم وزنه‌های گرمی می‌آیند و کارِ اصلی پیدا کردنِ ترکیبِ
     درستِ وزنه‌هاست؛ چالشِ واقعی همین است، نه پاسخ دادن به سؤال.

   جرمِ هر جسم طوری انتخاب می‌شود که با وزنه‌های همان قفسه دقیقاً
   ساختنی باشد (با جست‌وجوی زیرمجموعه بررسی می‌شود)، پس هیچ دوری
   بن‌بست نیست — ولی ترکیبِ درست هیچ‌جا نشان داده نمی‌شود.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  wall:  '#3a2c20', wallLo: '#241a13', wallHi: '#4e3b2b',
  wood:  '#a9855a', woodDk: '#6f5533', woodLt: '#cdae83',
  brass: '#c9962c', brassDk: '#8a6410', brassLt: '#eccb72',
  steel: '#8d99a3', steelDk: '#5c6870', steelLt: '#c3ced6',
  paper: '#fbf5e4', card: '#fffdf5',
  ink:   '#3a2f22', inkSoft: '#8a7c68',
  good:  '#5f9a56', bad: '#c04a34', gold: '#d8ab3c', accent: '#4f8aa0',
};

/* ───────── وزنه‌ها و قفسه‌ها ─────────
   g = جرم به گرم. kind: مهره یا وزنهٔ استاندارد.                     */

const SHELVES = {
  bead:  [{ id: 'b10', n: 'مهره', g: 10, kind: 'bead', c: '#b8743a', r: 17, count: 14 }],
  two:   [{ id: 'bb', n: 'مهرهٔ بزرگ', g: 20, kind: 'bead', c: '#a8552c', r: 21, count: 9 },
          { id: 'bs', n: 'مهرهٔ کوچک', g: 8,  kind: 'bead', c: '#5f8aa8', r: 13, count: 22 }],
  gram:  [{ id: 'g1',   n: '۱',   g: 1,    kind: 'w', count: 4 },
          { id: 'g2',   n: '۲',   g: 2,    kind: 'w', count: 2 },
          { id: 'g5',   n: '۵',   g: 5,    kind: 'w', count: 2 },
          { id: 'g10',  n: '۱۰',  g: 10,   kind: 'w', count: 3 },
          { id: 'g20',  n: '۲۰',  g: 20,   kind: 'w', count: 2 },
          { id: 'g50',  n: '۵۰',  g: 50,   kind: 'w', count: 2 },
          { id: 'g100', n: '۱۰۰', g: 100,  kind: 'w', count: 2 },
          { id: 'g200', n: '۲۰۰', g: 200,  kind: 'w', count: 2 }],
  kilo:  [{ id: 'g10',  n: '۱۰',  g: 10,   kind: 'w', count: 2 },
          { id: 'g20',  n: '۲۰',  g: 20,   kind: 'w', count: 2 },
          { id: 'g50',  n: '۵۰',  g: 50,   kind: 'w', count: 2 },
          { id: 'g100', n: '۱۰۰', g: 100,  kind: 'w', count: 3 },
          { id: 'g200', n: '۲۰۰', g: 200,  kind: 'w', count: 2 },
          { id: 'g500', n: '۵۰۰', g: 500,  kind: 'w', count: 2 },
          { id: 'k1',   n: '۱ ک', g: 1000, kind: 'w', count: 2 }],
};

/* ───────── جسم‌ها ───────── */

const THINGS = [
  { id: 'sib',    n: 'سیب' },
  { id: 'porteqal', n: 'پرتقال' },
  { id: 'sibz',   n: 'سیب‌زمینی' },
  { id: 'sang',   n: 'سنگ' },
  { id: 'ketab',  n: 'کتاب' },
  { id: 'ajor',   n: 'آجر' },
  { id: 'ghuri',  n: 'قوری' },
  { id: 'kafsh',  n: 'کفش' },
  { id: 'toop',   n: 'توپ' },
  { id: 'hendevane', n: 'هندوانه' },
  { id: 'medad',  n: 'مداد' },
  { id: 'pakkon', n: 'پاک‌کن' },
];

const LEVELS = [
  { name: 'مهره‌ها',        shelf: 'bead', lo: 30,  hi: 120,  step: 10, quota: 3, unit: 'مهره' },
  { name: 'بزرگ یا کوچک',   shelf: 'two',  lo: 40,  hi: 160,  step: 40, quota: 4, twin: true },
  { name: 'وزنه‌های گرمی',   shelf: 'gram', lo: 25,  hi: 380,  step: 1,  quota: 3, unit: 'گرم' },
  { name: 'کیلوگرم',        shelf: 'kilo', lo: 600, hi: 2600, step: 10, quota: 3, unit: 'گرم' },
  { name: 'ترازوخانه',      shelf: 'kilo', lo: 300, hi: 3000, step: 10, endless: true, unit: 'گرم' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  level: 0, cleared: 0, score: 0, best: 0,
  thing: 0, mass: 100,
  useBead: 0,             /* در مرحلهٔ دو: با کدام مهره می‌سنجیم */
  shelf: [],              /* {def, left: n, right: n} شمارِ باقی‌مانده */
  pan: [[], []],          /* وزنه‌های روی هر کفّه: {def, t} */
  onLeft: true,           /* جسم روی کفّهٔ چپ است */
  ang: 0, angV: 0,
  carry: null,
  note: [],               /* {thing, n, unitName} */
  winT: 0, shake: 0,
  t: 0, hover: null, tip: '', tipT: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const L = () => LEVELS[Math.min(S.level, LEVELS.length - 1)];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/* ───────── ساختِ دور ─────────
   جرمِ جسم باید با وزنه‌های همین قفسه دقیقاً ساختنی باشد.            */

/** آیا با این وزنه‌ها می‌شود دقیقاً g گرم ساخت؟ */
function reachable(defs, g) {
  const cap = defs.reduce((a, d) => a + d.g * d.count, 0);
  if (g > cap || g <= 0) return false;
  const ok = new Uint8Array(cap + 1);
  ok[0] = 1;
  for (const d of defs) {
    for (let c = 0; c < d.count; c++) {
      for (let v = cap; v >= d.g; v--) if (ok[v - d.g]) ok[v] = 1;
    }
  }
  return !!ok[g];
}

function shelfDefs(lv) {
  const defs = SHELVES[lv.shelf];
  if (!lv.twin) return defs;
  /* در مرحلهٔ دو فقط یک جور مهره در دسترس است — همان که این دور می‌خواهیم */
  return [defs[S.useBead]];
}

function newRound() {
  const lv = L();
  if (lv.twin) {
    /* یک دور با مهرهٔ بزرگ، دورِ بعد با کوچک، روی همان جسم */
    if (S.note.length && S.note[S.note.length - 1].pending) {
      S.useBead = 1;
      S.thing = S.note[S.note.length - 1].thing;
      S.mass = S.note[S.note.length - 1].mass;
    } else {
      S.useBead = 0;
      S.thing = R(0, THINGS.length - 1);
      const k = R(1, 4);
      S.mass = k * 40;      /* هم بر ۲۰ بخش‌پذیر است هم بر ۸ */
    }
  } else {
    S.thing = R(0, THINGS.length - 1);
    const defs = SHELVES[lv.shelf];
    for (let i = 0; i < 500; i++) {
      const steps = Math.floor((lv.hi - lv.lo) / lv.step);
      const g = lv.lo + R(0, steps) * lv.step;
      if (reachable(defs, g)) { S.mass = g; break; }
      if (i === 499) S.mass = lv.lo;
    }
  }
  S.shelf = shelfDefs(lv).map((def) => ({ def, left: def.count }));
  S.pan = [[], []];
  S.onLeft = true;
  S.ang = 0; S.angV = 0;
  S.winT = 0;
  S.carry = null;
}

function startLevel(i, keep) {
  S.level = i;
  S.phase = 'play'; S.phaseT = 0;
  S.cleared = 0;
  if (!keep) { S.score = 0; S.note = []; }
  S.useBead = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newRound();
}

/* ───────── فیزیکِ ترازو ─────────
   شاهین حولِ تکیه‌گاه می‌چرخد. هرچه اختلافِ جرم بیشتر، شیب بیشتر —
   ولی بی‌نهایت نمی‌شود؛ شاهین به ته می‌خورد. برابری یعنی صاف.       */

const MAX_ANG = .26;
function panMass(i) {
  let m = 0;
  for (const w of S.pan[i]) m += w.def.g;
  if ((i === 0) === S.onLeft) m += S.mass;
  return m;
}
const diffMass = () => panMass(0) - panMass(1);
/** پاسخِ شاهین: یکنواخت، اشباع‌شونده، و در صفر دقیقاً صاف.
    منفی است چون کفّهٔ سنگین‌تر باید پایین برود، نه بالا. */
function targetAng() {
  const d = diffMass();
  const scale = Math.max(24, S.mass * .28);
  return -MAX_ANG * Math.tanh(d / scale);
}
const isLevelNow = () => diffMass() === 0 && (S.pan[0].length + S.pan[1].length) > 0;

/* ───────── گذاشتن و برداشتن ───────── */

function placeOn(si, side) {
  const sh = S.shelf[si];
  if (!sh || sh.left <= 0) return;
  sh.left--;
  S.pan[side].push({ def: sh.def, si, t: 0 });
  sfx.place();
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
  checkWin();
}

function removeFrom(side, i) {
  const w = S.pan[side][i];
  if (!w) return;
  S.pan[side].splice(i, 1);
  const sh = S.shelf[w.si];
  if (sh) sh.left++;
  sfx.pop();
}

function checkWin() {
  if (S.winT > 0 || !isLevelNow()) return;
  const lv = L();
  /* عددی که ترازو می‌گوید. اگر بچّه روی کفّهٔ خودِ جسم هم وزنه گذاشته
     باشد — که آزاد است و با ترازوی واقعی هم می‌شود — آن‌ها باید کم
     شوند، وگرنه عددِ ثبت‌شده جرمِ جسم نیست. */
  const other = S.onLeft ? 1 : 0, own = 1 - other;
  const list = S.pan[other], mine = S.pan[own];
  const bead = lv.shelf === 'bead' || lv.twin;
  const val = bead ? (list.length - mine.length)
                   : (list.reduce((a, w) => a + w.def.g, 0) - mine.reduce((a, w) => a + w.def.g, 0));
  const unitName = bead ? shelfDefs(lv)[0].n : 'گرم';
  if (lv.twin && S.useBead === 0) {
    S.note.push({ thing: S.thing, mass: S.mass, val, unitName, pending: true });
  } else if (lv.twin) {
    const prev = S.note[S.note.length - 1];
    if (prev && prev.pending) { prev.pending = false; prev.val2 = val; prev.unit2 = unitName; }
  } else {
    S.note.push({ thing: S.thing, mass: S.mass, val, unitName });
  }
  if (S.note.length > 5) S.note.shift();
  S.winT = .001;
  S.cleared++;
  S.score += 50 + S.level * 25;
  if (S.score > S.best) S.best = S.score;
  sfx.win();
  bits.confetti(BEAM.x, BEAM.y + 40, 26, [P.brass, P.brassLt, '#fff', P.good]);
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.tut.on) S.tut.t += dt;
  for (const side of S.pan) for (const w of side) if (w.t < 9) w.t += dt;
  /* فنرِ شاهین */
  const tg = targetAng();
  S.angV += (tg - S.ang) * 42 * dt;
  S.angV *= Math.pow(.0021, dt);
  S.ang += S.angV * dt;
  if (S.winT > 0) {
    S.winT += dt;
    if (S.winT > 1.7) {
      S.winT = 0;
      if (!L().endless && S.cleared >= L().quota) {
        if (S.level >= LEVELS.length - 1) { S.phase = 'won'; S.phaseT = 0; }
        else { S.level++; S.cleared = 0; S.useBead = 0; S.phaseT = 0; newRound(); toast.say(L().name, 'good'); }
      } else newRound();
    }
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { newRound(); runLoop(step); });

/* ───────── جای‌ها ───────── */

const BEAM = { x: 470, y: 210, len: 300 };   /* تکیه‌گاه */
const PAN_DROP = 210;                        /* بلندیِ ریسمان */
const SHELF_BOX = { x: 852, y: 84, w: 324, h: 420 };
const NOTE = { x: 852, y: 524, w: 324, h: 214 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 470, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };

/** نقطهٔ آویزِ کفّهٔ side روی شاهین. */
function panPos(side) {
  const s = side === 0 ? -1 : 1;
  const a = S.ang;
  return { x: BEAM.x + s * BEAM.len * Math.cos(a), y: BEAM.y + s * BEAM.len * Math.sin(a) + PAN_DROP };
}
const PAN_W = 190, PAN_H = 26;
function panRect(side) {
  const p = panPos(side);
  return { x: p.x - PAN_W / 2, y: p.y - PAN_H, w: PAN_W, h: PAN_H + 66 };
}
function shelfSlot(i) {
  const col = i % 2, row = Math.floor(i / 2);
  return { x: SHELF_BOX.x + 16 + col * 150, y: SHELF_BOX.y + 54 + row * 92, w: 140, h: 82 };
}
/** جای هر وزنه روی کفّه — چیده‌شده در ردیف. */
function slotOnPan(side, i) {
  const p = panPos(side);
  const perRow = 5;
  const col = i % perRow, row = Math.floor(i / perRow);
  return { x: p.x - 68 + col * 34, y: p.y - 16 - row * 26 };
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.carry) { S.carry.x = p.x; S.carry.y = p.y;
    if (Math.hypot(p.x - S.carry.px, p.y - S.carry.py) > 8) S.carry.moved = true; return; }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    for (let i = 0; i < S.shelf.length; i++) if (S.shelf[i].left > 0 && inRect(p, shelfSlot(i))) S.hover = { k: 'shelf', i };
    for (let side = 0; side < 2; side++) {
      for (let i = S.pan[side].length - 1; i >= 0; i--) {
        const s = slotOnPan(side, i);
        if (Math.hypot(p.x - s.x, p.y - s.y) < 17) { S.hover = { k: 'onpan', side, i }; break; }
      }
    }
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startLevel(0); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.level = 0; S.score = 0; S.note = []; newRound(); sfx.tap(); }
    return;
  }
  if (S.winT > 0) return;
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  /* برداشتنِ وزنه از کفّه */
  for (let side = 0; side < 2; side++) {
    for (let i = S.pan[side].length - 1; i >= 0; i--) {
      const s = slotOnPan(side, i);
      if (Math.hypot(p.x - s.x, p.y - s.y) < 17) { removeFrom(side, i); return; }
    }
  }
  /* برداشتنِ وزنه از قفسه */
  for (let i = 0; i < S.shelf.length; i++) {
    if (S.shelf[i].left <= 0) continue;
    if (!inRect(p, shelfSlot(i))) continue;
    S.carry = { i, x: p.x, y: p.y, px: p.x, py: p.y, moved: false };
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    sfx.tap();
    return;
  }
});

function dropCarry(p) {
  if (!S.carry) return;
  const c = S.carry;
  S.carry = null;
  if (p) {
    for (let side = 0; side < 2; side++) {
      if (inRect(p, panRect(side))) { placeOn(c.i, side); return; }
    }
  }
  /* ضربهٔ کوتاه: خودش روی کفّهٔ خالی می‌نشیند */
  if (!c.moved) { placeOn(c.i, S.onLeft ? 1 : 0); return; }
  sfx.tap();
}

cv.addEventListener('pointerup', (e) => dropCarry(toStage(e)));
cv.addEventListener('pointercancel', () => { S.carry = null; });
cv.addEventListener('pointerleave', () => { S.carry = null; });
addEventListener('blur', () => { S.carry = null; });

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

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(18, 12, 6, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 252, 240, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '18, 12, 6');
  ctx.fillStyle = P.brass;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#7b6c56' }); yy += 30; }
  return h + 20;
}

/* ───────── شکلِ جسم‌ها ───────── */

function thingIcon(id, s) {
  ctx.save();
  ctx.scale(s, s);
  const ell = (x, y, rx, ry, rot, col) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill();
  };
  switch (id) {
    case 'sib':
      ell(0, 2, 17, 18, 0, '#cf4436'); ell(-6, -4, 7, 6, 0, '#e8837a');
      ctx.strokeStyle = '#6b4a2c'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(2, -24); ctx.stroke();
      ell(10, -22, 8, 4, -.5, '#5da24e'); break;
    case 'porteqal':
      ell(0, 0, 19, 18, 0, '#e08a2e'); ell(-6, -6, 7, 5, 0, '#f3b364');
      ctx.strokeStyle = '#8a5210'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 12, .4, 1.4); ctx.stroke(); break;
    case 'sibz':
      ell(0, 0, 21, 15, .2, '#b98a56'); ell(-6, -4, 8, 5, .2, '#d9b183');
      ctx.fillStyle = '#7a5a2e';
      for (const [x, y] of [[-9, 4], [6, -5], [11, 6]]) { ctx.beginPath(); ctx.arc(x, y, 2, 0, TAU); ctx.fill(); } break;
    case 'sang':
      ctx.fillStyle = '#8d99a3';
      ctx.beginPath(); ctx.moveTo(-19, 8); ctx.lineTo(-12, -11); ctx.lineTo(8, -14); ctx.lineTo(20, 2); ctx.lineTo(12, 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c3ced6';
      ctx.beginPath(); ctx.moveTo(-12, -11); ctx.lineTo(8, -14); ctx.lineTo(2, -2); ctx.closePath(); ctx.fill(); break;
    case 'ketab':
      ctx.fillStyle = '#7a4a9c';
      ctx.beginPath(); rrPath(-20, -14, 40, 28, 3); ctx.fill();
      ctx.fillStyle = '#f3ead2'; ctx.fillRect(-16, -11, 32, 22);
      ctx.fillStyle = '#5a3078'; ctx.fillRect(-20, -14, 7, 28); break;
    case 'ajor':
      ctx.fillStyle = '#a5563f';
      ctx.beginPath(); rrPath(-22, -12, 44, 24, 3); ctx.fill();
      ctx.strokeStyle = '#7d3b28'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0);
      ctx.moveTo(-6, -12); ctx.lineTo(-6, 0); ctx.moveTo(8, 0); ctx.lineTo(8, 12); ctx.stroke(); break;
    case 'ghuri':
      ctx.fillStyle = '#4f8aa0';
      ctx.beginPath(); ctx.ellipse(0, 2, 17, 14, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7cb0c4'; ctx.beginPath(); ctx.ellipse(-5, -2, 8, 6, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#4f8aa0'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(15, -2); ctx.lineTo(25, -8); ctx.stroke();
      ctx.beginPath(); ctx.arc(-16, -2, 7, -1.2, 1.2); ctx.stroke();
      ctx.fillStyle = '#39697a'; ctx.beginPath(); rrPath(-5, -16, 10, 6, 2); ctx.fill(); break;
    case 'kafsh':
      ctx.fillStyle = '#5b3a22';
      ctx.beginPath(); ctx.moveTo(-20, 10); ctx.lineTo(-16, -6); ctx.quadraticCurveTo(-4, -10, 6, -2);
      ctx.lineTo(20, 4); ctx.lineTo(20, 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#33200f'; ctx.fillRect(-20, 8, 40, 5); break;
    case 'toop':
      ell(0, 0, 18, 18, 0, '#d9b73f');
      ctx.strokeStyle = '#8a6410'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, 8, 18, 0, 0, TAU); ctx.stroke(); break;
    case 'hendevane':
      ell(0, 0, 22, 19, 0, '#3f7d2c');
      ctx.strokeStyle = '#2a5a1c'; ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(0, 0, 8 + i * 7, 19, 0, 0, TAU); ctx.stroke(); } break;
    case 'medad':
      ctx.fillStyle = '#e0a422';
      ctx.beginPath(); rrPath(-22, -5, 36, 10, 2); ctx.fill();
      ctx.fillStyle = '#e8cfa8';
      ctx.beginPath(); ctx.moveTo(14, -5); ctx.lineTo(24, 0); ctx.lineTo(14, 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3a2f22';
      ctx.beginPath(); ctx.moveTo(21, -1.6); ctx.lineTo(24, 0); ctx.lineTo(21, 1.6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#cf6f8a'; ctx.beginPath(); rrPath(-24, -5, 8, 10, 2); ctx.fill(); break;
    case 'pakkon':
      ctx.fillStyle = '#e8837a';
      ctx.beginPath(); rrPath(-16, -9, 32, 18, 3); ctx.fill();
      ctx.fillStyle = '#f3f2ea'; ctx.beginPath(); rrPath(-16, -9, 32, 7, 3); ctx.fill(); break;
    default: ell(0, 0, 16, 16, 0, '#999');
  }
  ctx.restore();
}

/** وزنهٔ برنجی یا مهرهٔ رنگی. */
function weightIcon(def, s, hot) {
  ctx.save();
  ctx.scale(s, s);
  if (def.kind === 'bead') {
    const r = def.r;
    ctx.fillStyle = shade(def.c, -.35);
    ctx.beginPath(); ctx.arc(0, 2, r, 0, TAU); ctx.fill();
    ctx.fillStyle = def.c;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.fillStyle = shade(def.c, .45);
    ctx.beginPath(); ctx.arc(-r * .3, -r * .34, r * .34, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(30,20,10,.5)';
    ctx.beginPath(); ctx.arc(0, 0, r * .22, 0, TAU); ctx.fill();
  } else {
    const w = 30, h = 22;
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); rrPath(-w / 2, -h / 2 + 3, w, h, 4); ctx.fill();
    ctx.fillStyle = hot ? P.brassLt : P.brass;
    ctx.beginPath(); rrPath(-w / 2, -h / 2, w, h, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath(); rrPath(-w / 2 + 3, -h / 2 + 2, w - 6, 5, 2); ctx.fill();
    /* دستهٔ کوچکِ بالای وزنه */
    ctx.strokeStyle = P.brassDk; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, -h / 2 - 1, 5, Math.PI, TAU); ctx.stroke();
    numText(def.n, 0, 1, { size: 12, color: '#4a3406', family: 'Lalezar' });
  }
  ctx.restore();
}

/* ───────── نقاشیِ صحنه ───────── */

function paintWallStatic() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, SCENE_H);
  g.addColorStop(0, P.wallHi); g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.fillStyle = texStone(P.wall, P.wallHi);
  ctx.globalAlpha = .5; ctx.fillRect(0, 0, SCENE_W, SCENE_H); ctx.globalAlpha = 1;
  /* طاقِ آجریِ بازار */
  ctx.strokeStyle = 'rgba(255, 225, 180, .07)'; ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.arc(160 + i * 200, 90, 120, Math.PI, TAU); ctx.stroke();
  }
  /* میزِ چوبی */
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.beginPath(); rrPath(40, 640, 780, 30, 8); ctx.fill();
  ctx.fillStyle = 'rgba(60,40,18,.5)';
  ctx.fillRect(80, 670, 26, 78); ctx.fillRect(740, 670, 26, 78);
  /* قفسه و دفتر */
  for (const b of [SHELF_BOX, NOTE]) {
    ctx.fillStyle = 'rgba(255, 250, 236, .94)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(60, 44, 24, .25)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 14); ctx.stroke();
  }
}

function drawBalance() {
  /* ستون */
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(BEAM.x - 13, BEAM.y, 26, 440, 6); ctx.fill();
  ctx.fillStyle = P.steel;
  ctx.beginPath(); rrPath(BEAM.x - 9, BEAM.y, 18, 440, 5); ctx.fill();
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); ctx.ellipse(BEAM.x, 646, 92, 16, 0, 0, TAU); ctx.fill();

  /* نشانهٔ صاف بودن — دو خطِ ثابت که شاهین باید میانشان بایستد */
  ctx.strokeStyle = 'rgba(255, 240, 200, .28)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(BEAM.x - 46, BEAM.y - 26); ctx.lineTo(BEAM.x + 46, BEAM.y - 26); ctx.stroke();

  const a = S.ang;
  const bal = Math.abs(diffMass()) === 0 && (S.pan[0].length + S.pan[1].length) > 0;

  /* عقربهٔ وسط */
  ctx.save();
  ctx.translate(BEAM.x, BEAM.y);
  ctx.rotate(a);
  ctx.strokeStyle = bal ? P.good : P.brassLt; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -54); ctx.stroke();
  /* شاهین */
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 13; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-BEAM.len, 0); ctx.lineTo(BEAM.len, 0); ctx.stroke();
  ctx.strokeStyle = P.brass; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(-BEAM.len, 0); ctx.lineTo(BEAM.len, 0); ctx.stroke();
  ctx.fillStyle = P.brassLt;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * BEAM.len, 0, 8, 0, TAU); ctx.fill(); }
  ctx.restore();

  /* پیچِ میانی */
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); ctx.arc(BEAM.x, BEAM.y, 15, 0, TAU); ctx.fill();
  ctx.fillStyle = P.brass;
  ctx.beginPath(); ctx.arc(BEAM.x, BEAM.y, 11, 0, TAU); ctx.fill();

  /* ریسمان‌ها و کفّه‌ها */
  for (let side = 0; side < 2; side++) {
    const s = side === 0 ? -1 : 1;
    const hx = BEAM.x + s * BEAM.len * Math.cos(a), hy = BEAM.y + s * BEAM.len * Math.sin(a);
    const p = panPos(side);
    ctx.strokeStyle = 'rgba(240, 226, 190, .8)'; ctx.lineWidth = 2;
    for (const dx of [-PAN_W / 2 + 14, PAN_W / 2 - 14]) {
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(p.x + dx, p.y - PAN_H + 2); ctx.stroke();
    }
    /* کفّه */
    const hot = S.carry && inRect({ x: S.carry.x, y: S.carry.y }, panRect(side));
    ctx.fillStyle = hot ? P.brassLt : P.brassDk;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, PAN_W / 2, 16, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = hot ? '#f6e2a8' : P.brass;
    ctx.beginPath(); ctx.ellipse(p.x, p.y - 5, PAN_W / 2 - 4, 13, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = P.brassDk; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(p.x, p.y - 5, PAN_W / 2 - 4, 13, 0, 0, TAU); ctx.stroke();
  }

  /* جسم روی کفّهٔ خودش */
  const objSide = S.onLeft ? 0 : 1;
  const op = panPos(objSide);
  ctx.save();
  ctx.translate(op.x, op.y - 26);
  thingIcon(THINGS[S.thing].id, 1.25);
  ctx.restore();
  ctx.fillStyle = 'rgba(28, 20, 10, .55)';
  const nm = THINGS[S.thing].n;
  ctx.font = '700 14px "Vazirmatn", Tahoma, sans-serif';
  const nw = ctx.measureText(nm).width + 20;
  ctx.beginPath(); rrPath(op.x - nw / 2, op.y + 16, nw, 22, 11); ctx.fill();
  text(nm, op.x, op.y + 27, { size: 14, color: '#ffeecb' });

  /* وزنه‌های روی کفّه‌ها */
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < S.pan[side].length; i++) {
      const w = S.pan[side][i], s = slotOnPan(side, i);
      const hot = S.hover && S.hover.k === 'onpan' && S.hover.side === side && S.hover.i === i;
      const k = clamp(w.t / .22, 0, 1);
      ctx.save();
      ctx.translate(s.x, s.y - (1 - k) * 40);
      ctx.globalAlpha = k;
      weightIcon(w.def, hot ? .96 : .86, hot);
      ctx.restore();
    }
  }
}

function drawShelf() {
  text('قفسهٔ وزنه', SHELF_BOX.x + SHELF_BOX.w - 16, SHELF_BOX.y + 28,
    { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  for (let i = 0; i < S.shelf.length; i++) {
    const sh = S.shelf[i], b = shelfSlot(i);
    const hot = S.hover && S.hover.k === 'shelf' && S.hover.i === i;
    const out = sh.left <= 0;
    ctx.fillStyle = out ? 'rgba(60,44,24,.05)' : (hot ? 'rgba(201,150,44,.16)' : 'rgba(60,44,24,.05)');
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
    ctx.strokeStyle = hot ? P.brass : 'rgba(60,44,24,.14)'; ctx.lineWidth = hot ? 2.4 : 1.2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
    ctx.save();
    ctx.globalAlpha = out ? .25 : 1;
    ctx.translate(b.x + 44, b.y + 40);
    weightIcon(sh.def, 1.05, hot);
    ctx.restore();
    text(sh.def.n, b.x + b.w - 12, b.y + 28, { size: 14, color: P.ink, align: 'right' });
    numText('×' + fa(sh.left), b.x + b.w - 22, b.y + 58, { size: 17, color: out ? P.bad : P.inkSoft });
  }
  /* در مرحلهٔ دو، فقط یک جور مهره داریم و همان‌جا گفته می‌شود */
  if (L().twin) {
    const y = SHELF_BOX.y + SHELF_BOX.h - 34;
    ctx.fillStyle = 'rgba(79, 138, 160, .14)';
    ctx.beginPath(); rrPath(SHELF_BOX.x + 16, y - 17, SHELF_BOX.w - 32, 34, 8); ctx.fill();
    text('این بار فقط با ' + shelfDefs(L())[0].n, SHELF_BOX.x + SHELF_BOX.w / 2, y,
      { size: 15, color: '#2f6274' });
  }
}

function drawNote() {
  text('دفترِ اندازه‌گیری', NOTE.x + NOTE.w - 16, NOTE.y + 26,
    { size: 19, family: 'Lalezar', color: P.ink, align: 'right' });
  if (!S.note.length) {
    text('هنوز چیزی سنجیده نشده', NOTE.x + NOTE.w / 2, NOTE.y + 110,
      { size: 14, color: 'rgba(58,47,34,.35)' });
    return;
  }
  const rows = S.note.slice(-3);
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], twin = r.val2 !== undefined;
    const y = NOTE.y + 48 + i * 52;
    ctx.save();
    ctx.translate(NOTE.x + NOTE.w - 30, y + 14);
    thingIcon(THINGS[r.thing].id, .5);
    ctx.restore();
    text(THINGS[r.thing].n, NOTE.x + NOTE.w - 58, y + 14, { size: 13, color: P.ink, align: 'right' });
    if (twin) {
      /* همان جسم، دو عدد — چون یکا فرق دارد. زیرِ هم تا مقایسه آسان باشد. */
      numText(fa(r.val) + ' ' + r.unitName, NOTE.x + 96, y + 4, { size: 14, color: '#a8552c' });
      numText(fa(r.val2) + ' ' + r.unit2, NOTE.x + 96, y + 26, { size: 14, color: '#3f7d94' });
      ctx.strokeStyle = 'rgba(58,47,34,.18)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(NOTE.x + 18, y + 15); ctx.lineTo(NOTE.x + 172, y + 15); ctx.stroke();
    } else {
      numText(fa(r.val) + ' ' + r.unitName, NOTE.x + 84, y + 14,
        { size: 16, color: r.pending ? P.inkSoft : P.ink, family: 'Lalezar' });
    }
    ctx.strokeStyle = 'rgba(58,47,34,.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(NOTE.x + 16, y + 40); ctx.lineTo(NOTE.x + NOTE.w - 16, y + 40); ctx.stroke();
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(34, 24, 14, .94)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(207, 167, 78, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.paper, align: 'right' });
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), 640, HUD_H / 2, { size: 21, color: P.gold });
  } else {
    text('بی‌پایان', 640, HUD_H / 2, { size: 21, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 300, HUD_H / 2, { size: 20, color: P.paper });
  text('بیشترین ' + fa(S.best), 150, HUD_H / 2, { size: 15, color: 'rgba(251,245,228,.6)' });
  const kk = clamp((S.level + S.cleared / Math.max(1, L().quota)) / LEVELS.length, 0, 1);
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * kk, 5, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: BEAM.x - 380, y: BEAM.y - 60, w: 760, h: 400 }], .74);
    const h = tutCard(SHELF_BOX.x - 6, 190, SHELF_BOX.w + 12,
      ['ترازو خودش می‌گوید کدام طرف سنگین‌تر است.', 'وقتی صاف بایستد، دو طرف برابرند.'], 'ترازوخانه');
    tutMore(SHELF_BOX.x + SHELF_BOX.w / 2, 190 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: SHELF_BOX.x, y: SHELF_BOX.y, w: SHELF_BOX.w, h: SHELF_BOX.h }], .62);
    tutCard(90, 300, 520, ['از قفسه وزنه بردار و روی کفّه بگذار', 'تا ترازو صاف شود.']);
  } else {
    spot([{ x: NOTE.x, y: NOTE.y, w: NOTE.w, h: NOTE.h }], .7);
    const h = tutCard(90, 250, 520,
      ['هرچه سنجیدی در دفتر می‌نشیند.', 'روی وزنهٔ روی کفّه بزنی، برمی‌گردد.'], 'دفتر');
    tutMore(350, 250 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function balIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, 22); ctx.stroke();
  ctx.save();
  ctx.rotate(-.14);
  ctx.strokeStyle = P.brass; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(28, 0); ctx.stroke();
  ctx.restore();
  for (const s of [-1, 1]) {
    const px = s * 27.7, py = s * -3.9 + 14;
    ctx.strokeStyle = 'rgba(240,226,190,.9)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(px, py - 14); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = P.brass;
    ctx.beginPath(); ctx.ellipse(px, py, 13, 4.4, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); ctx.ellipse(0, 24, 20, 5, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 820, h: 300, y: 128,
    paper: P.paper, band: P.brass, ink: P.ink, inkSoft: '#7b6c56',
    icon: balIcon,
    title: 'ترازوخانهٔ بازار',
    body: 'با چشم و دست نمی‌شود فهمید کدام سنگین‌تر است.\nوزنه‌ها را روی کفّه بگذار تا ترازو صاف بایستد؛\nآن‌وقت ترازو خودش جرمِ جسم را می‌گوید.',
    btn: BTN_GO, btnLabel: 'برو به ترازوخانه', btnHot: S.hover === BTN_GO,
    btnFill: '#8a6410', btnHotFill: '#b0821a',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 760, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#7b6c56',
    icon: balIcon,
    title: 'ترازودارِ بازار شدی',
    body: 'از مهره تا گرم و کیلوگرم، همه را با ترازو سنجیدی.\nامتیازت: ' + fa(S.score),
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#8a6410', btnHotFill: '#b0821a',
  });
}

function draw() {
  beginScene(P.wallLo);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  const layer = staticLayer('wall', SCENE_W, SCENE_H, paintWallStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawBalance();
  drawShelf();
  drawNote();
  bits.draw();
  ctx.restore();

  if (S.carry) {
    const sh = S.shelf[S.carry.i];
    if (sh) {
      ctx.save();
      ctx.translate(S.carry.x, S.carry.y - 10);
      ctx.globalAlpha = .95;
      weightIcon(sh.def, 1.1, true);
      ctx.restore();
    }
  }

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  endScene(.1, 'rgba(30, 18, 6, .44)', 0, .12);
}

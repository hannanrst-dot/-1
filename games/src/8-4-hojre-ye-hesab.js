/*!
title: حجرهٔ حساب — محاسبهٔ ضرب
bg: #efe2c6
*/

/* ═══════════════════════════════════════════════════════════════════════
   حجرهٔ حساب — ریاضی سوم، فصل ۸، درس ۴ (محاسبهٔ ضرب)
   ───────────────────────────────────────────────────────────────────────
   صفحهٔ کتاب همین است: ضرب را می‌شکنند و هر تکّه را جدا می‌نویسند —
   «ضربِ ۱۰تایی‌ها» و «ضربِ یکی» — و بعد جمعشان می‌کنند:

        ۲۳                  ۲۳۴
      ×  ۳                ×   ۳
      ─────                ─────
        ۶۰   ← ۳×۲۰           ۱۲   ← ۳×۴
      +  ۹   ← ۳×۳            ۹۰   ← ۳×۳۰
      ─────               + ۶۰۰   ← ۳×۲۰۰
        ۶۹                 ─────
                             ۷۰۲

   اینجا همان دفتر روی پیشخوانِ حجره باز است. هر سطر می‌گوید کدام تکّه
   را می‌خواهد («۳ × ۳۰») و تو باید پلاکِ درست را از تختهٔ کنار برداری
   و در همان سطر بگذاری.

   روی هر پلاک، هم عدد نوشته شده هم چینه‌هایش کشیده شده؛ پس اگر بینِ ۹
   و ۹۰ شک کردی، شمردنِ چینه‌ها جواب می‌دهد — همان اشتباهِ همیشگیِ جای
   صفر، این بار دیدنی.

   جمعِ آخر را دفتر خودش می‌زند، چون جمع را فصلِ ششم یاد داده. جوابِ
   ضرب هیچ‌جا از پیش نوشته نمی‌شود.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  wall:  '#efe2c6', wallLo: '#cdb894', wallHi: '#faf3e2',
  wood:  '#a4713c', woodDk: '#6a441f', woodLt: '#cb9a5e',
  brass: '#c39a3e', brassDk: '#8a6a1e', brassLt: '#eed9a6',
  paper: '#fbf4e2', card: '#fffdf5', ink: '#2f2a24', inkSoft: '#8b8172',
  red:   '#b5432f', redDk: '#7d2a1c',
  good:  '#4e8f5c', bad: '#b5432f', gold: '#d9a026',
};

/* رنگِ چینه‌ها */
const PL = [
  { v: 1000, c: '#a45fa8', d: '#6d3a70', w: 34, h: 34 },
  { v: 100,  c: '#4e8f5c', d: '#2f6038', w: 26, h: 26 },
  { v: 10,   c: '#3f7fb0', d: '#255579', w: 9,  h: 26 },
  { v: 1,    c: '#d9a026', c2: 1, d: '#9a6c0e', w: 9, h: 9 },
];

const LEVELS = [
  { name: 'دو سطر', dig: 2, amax: 4, dmax: 4, decoy: 2, quota: 3, time: 82,
    hint: 'پلاکِ درست را بردار و در سطرش بگذار.' },
  { name: 'ضربِ بزرگ‌تر', dig: 2, amax: 6, dmax: 6, decoy: 3, quota: 3, time: 86,
    hint: 'چینه‌های روی پلاک را بشمار؛ ۹ با ۹۰ فرق دارد.' },
  { name: 'سه سطر', dig: 3, amax: 4, dmax: 4, decoy: 3, quota: 3, time: 96,
    hint: 'هر سطر یک تکّهٔ ضرب است.' },
  { name: 'دفترِ شلوغ', dig: 3, amax: 6, dmax: 5, decoy: 4, quota: 4, time: 104,
    hint: 'پلاکِ اضافه هم روی تخته هست.' },
  { name: 'تا بازار باز است', dig: 3, amax: 6, dmax: 6, decoy: 4, time: 100, endless: true,
    hint: 'تا بازار باز است، حساب هست.' },
];

const BOOK = { x: 54, y: 88, w: 656, h: 628 };
const RACK = { x: 742, y: 88, w: 424, h: 628 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  a: 3, b: 234, dig: [], places: [],
  parts: [],            /* مقدارِ درستِ هر سطر، از یکان به بالا */
  rack: [],             /* { v, used } */
  slot: [],             /* شناسهٔ پلاک در هر سطر، یا ‑۱ */
  held: -1, hx: 0, hy: 0, px: 0, py: 0,
  sum: 0, sumT: 0, bad: -1, badT: 0,
  timeLeft: 0, seals: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  done: 0, doneT: 0,
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function loadBest() { try { return +localStorage.getItem('hojre-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('hojre-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();

/* ───────── حسابِ تازه ───────── */

function newSum() {
  const lv = L();
  const a = R(2, lv.amax);
  const d = [];
  for (let i = 0; i < lv.dig; i++) d.push(R(1, lv.dmax));
  /* d از پرارزش به کم‌ارزش؛ سطرها از یکان بالا می‌روند */
  const b = d.reduce((x, y) => x * 10 + y, 0);
  S.a = a; S.b = b; S.dig = d;
  S.places = [];
  S.parts = [];
  for (let i = 0; i < lv.dig; i++) {
    const k = lv.dig - 1 - i;                 /* ۰ = یکان */
    S.places.push(k);
    S.parts.push(a * d[i] * Math.pow(10, k));
  }
  /* سطرها را از یکان به بالا مرتّب می‌کنیم */
  S.places.reverse(); S.parts.reverse();

  /* تختهٔ پلاک‌ها: درست‌ها به‌علاوهٔ چند پلاکِ فریب‌دهنده */
  const set = new Set(S.parts);
  const rack = S.parts.slice();
  const cand = [];
  S.parts.forEach((p, i) => {
    const k = S.places[i];
    if (k > 0) cand.push(p / 10);             /* اشتباهِ همیشگی: صفرِ کم */
    cand.push(p * 10);                        /* صفرِ زیاد */
    const base = p / Math.pow(10, k);
    if (base > 1) cand.push((base - 1) * Math.pow(10, k));
    cand.push((base + 1) * Math.pow(10, k));
  });
  for (let i = cand.length - 1; i > 0; i--) { const j = R(0, i); const t = cand[i]; cand[i] = cand[j]; cand[j] = t; }
  for (const c of cand) {
    if (rack.length >= S.parts.length + lv.decoy) break;
    if (set.has(c) || c <= 0 || c > 9999) continue;   /* بالاتر از این، چینه‌ها دیگر کشیدنی نیست */
    set.add(c); rack.push(c);
  }
  for (let i = rack.length - 1; i > 0; i--) { const j = R(0, i); const t = rack[i]; rack[i] = rack[j]; rack[j] = t; }
  S.rack = rack.map((v) => ({ v, used: false }));
  S.slot = new Array(S.parts.length).fill(-1);
  S.held = -1; S.sum = 0; S.sumT = 0; S.bad = -1; S.badT = 0;
  S.done = 0; S.doneT = 0;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.seals = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newSum();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

newSum();
whenFontsReady(() => runLoop(step));

const ROW_H = 74;
function rowBox(i) {
  return { x: BOOK.x + 46, y: BOOK.y + 258 + i * ROW_H, w: BOOK.w - 92, h: ROW_H - 12 };
}
function rackSlot(i) {
  const cols = 2, w = 186, h = 92, gx = 22, gy = 16;
  const col = i % cols, row = Math.floor(i / cols);
  return { x: RACK.x + 20 + (cols - 1 - col) * (w + gx), y: RACK.y + 74 + row * (h + gy), w, h };
}
const allSet = () => S.slot.every((v, i) => v >= 0 && S.rack[v].v === S.parts[i]);
const allFilled = () => S.slot.every((v) => v >= 0);

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.badT > 0) { S.badT -= dt; if (S.badT <= 0) S.bad = -1; }
  if (S.sumT > 0) S.sumT = Math.min(1, S.sumT + dt * 1.4);

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.done) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseSeal('حجره بسته شد!'); }
    }
    if (S.done) { S.doneT += dt; if (S.doneT > 2.4) { newSum(); S.timeLeft = L().time; } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseSeal(msg) {
  if (S.done) return;
  S.seals--;
  S.combo = 0;
  S.shake = .5;
  S.held = -1;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.seals <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newSum();
}

function putIn(row) {
  if (S.held < 0 || S.done) return;
  if (S.slot[row] >= 0) return;
  const v = S.rack[S.held].v;
  if (v !== S.parts[row]) {
    S.bad = row; S.badT = 1; S.shake = .14;
    sfx.nope();
    toast.say('این پلاک به این سطر نمی‌خورَد.', 'bad');
    return;
  }
  S.rack[S.held].used = true;
  S.slot[row] = S.held;
  S.held = -1;
  sfx.place();
  const b = rowBox(row);
  bits.add(b.x + 120, b.y + b.h / 2, 10, 'dot', [P.brassLt, P.gold],
    { speed: 140, lift: 40, size: 3, life: .5, grav: 280 });
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
  if (allSet()) finish();
}

function takeOut(row) {
  if (S.done) return;
  const i = S.slot[row];
  if (i < 0) return;
  S.rack[i].used = false;
  S.slot[row] = -1;
  sfx.tap();
}

function finish() {
  S.done = .001; S.doneT = 0;
  S.sum = S.a * S.b;
  S.sumT = .001;
  S.combo++;
  S.cleared++;
  S.score += 340 + S.parts.length * 120 + Math.round(S.timeLeft * 4) + Math.min(S.combo, 6) * 70;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(BOOK.x + BOOK.w / 2, BOOK.y + 520, 46, [P.gold, P.brassLt, P.red, '#fff']);
  sfx.win();
  toast.say('دفتر بسته شد!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.held >= 0) { S.hx = p.x; S.hy = p.y; return; }
  S.hover = null;
  for (let i = 0; i < S.parts.length; i++) if (inRect(p, rowBox(i))) S.hover = { k: 'row', i };
  for (let i = 0; i < S.rack.length; i++) if (!S.rack[i].used && inRect(p, rackSlot(i))) S.hover = { k: 'rack', i };
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
  if (S.done) return;
  if (S.held >= 0) {
    for (let i = 0; i < S.parts.length; i++) if (inRect(p, rowBox(i))) { putIn(i); return; }
    S.held = -1; sfx.tap();
    return;
  }
  for (let i = 0; i < S.parts.length; i++) if (inRect(p, rowBox(i)) && S.slot[i] >= 0) { takeOut(i); return; }
  for (let i = 0; i < S.rack.length; i++) if (!S.rack[i].used && inRect(p, rackSlot(i))) {
    S.held = i; S.hx = p.x; S.hy = p.y; S.px = p.x; S.py = p.y; sfx.tap();
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    return;
  }
});

cv.addEventListener('pointerup', (e) => {
  if (S.held < 0 || S.phase !== 'play') return;
  const p = toStage(e);
  if (Math.hypot(p.x - S.px, p.y - S.py) < 14) return;    /* ضربهٔ ساده: پلاک در دست می‌ماند */
  for (let i = 0; i < S.parts.length; i++) if (inRect(p, rowBox(i))) { putIn(i); return; }
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
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(40, 28, 12, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .4, () => {
    ctx.fillStyle = 'rgba(255, 253, 245, .98)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '80, 55, 20');
  ctx.fillStyle = P.red;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#7a7164' }); yy += 30; }
  return h + 20;
}

/** چینه‌های یک عدد، فشرده — تا ۹ با ۹۰ اشتباه نشود. */
function chipsOf(cx, cy, v, sc = 1, maxW = 150) {
  const d = [Math.floor(v / 1000) % 10, Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10];
  const items = [];
  for (let k = 0; k < 4; k++) for (let n = 0; n < d[k]; n++) items.push(k);
  if (v >= 10000 || items.length > 26) { numText('…', cx, cy, { size: 16, color: P.inkSoft }); return; }
  let w = 0;
  for (const k of items) w += PL[k].w * sc + 3 * sc;
  const s2 = w > maxW ? sc * maxW / w : sc;
  w = 0;
  for (const k of items) w += PL[k].w * s2 + 3 * s2;
  w -= 3 * s2;
  let x = cx - w / 2;
  for (const k of items) {
    const pw = PL[k].w * s2, ph = PL[k].h * s2;
    x += pw / 2;
    ctx.fillStyle = PL[k].d;
    ctx.beginPath(); rrPath(x - pw / 2, cy - ph / 2 + 1.5 * s2, pw, ph, 2 * s2); ctx.fill();
    ctx.fillStyle = PL[k].c;
    ctx.beginPath(); rrPath(x - pw / 2, cy - ph / 2, pw, ph, 2 * s2); ctx.fill();
    x += pw / 2 + 3 * s2;
  }
}

/** پلاکِ برنجیِ یک عدد. */
function plaque(x, y, w, h, v, o = {}) {
  withShadow(12, 5, .3, () => {
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); rrPath(x, y, w, h, 10); ctx.fill();
  }, '80, 55, 20');
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, P.brassLt); g.addColorStop(.5, P.brass); g.addColorStop(1, P.brassDk);
  ctx.fillStyle = g;
  ctx.beginPath(); rrPath(x + 3, y + 3, w - 6, h - 6, 8); ctx.fill();
  /* بالا عدد، پایین چینه‌ها — نسبت‌ها با بلندیِ پلاک جور می‌شوند */
  const band = Math.max(20, h * .34);
  ctx.fillStyle = 'rgba(47, 42, 36, .12)';
  ctx.beginPath(); rrPath(x + 10, y + h - band - 6, w - 20, band, 6); ctx.fill();
  numText(fa(v), x + w / 2, y + (h - band) * .5 + 6, { size: Math.min(30, (h - band) * .62), color: '#3a2c0a' });
  chipsOf(x + w / 2, y + h - band / 2 - 6, v, Math.min(.9, band / 34), w - 26);
  for (const dx of [14, w - 14]) {
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath(); ctx.arc(x + dx, y + 13, 3.4, 0, TAU); ctx.fill();
  }
  if (o.ring) {
    ctx.strokeStyle = o.ring; ctx.lineWidth = 3;
    ctx.beginPath(); rrPath(x - 3, y - 3, w + 6, h + 6, 12); ctx.stroke();
  }
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintShopStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallHi); g.addColorStop(.5, P.wall); g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.globalAlpha = .5;
  ctx.fillStyle = texPaper(P.wall);
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* طاقچه‌های گچیِ حجره */
  ctx.save();
  ctx.globalAlpha = .1;
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 3;
  for (let x = -30; x < SCENE_W + 30; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, SCENE_H); ctx.lineTo(x, 240);
    ctx.arc(x + 60, 240, 60, Math.PI, 0);
    ctx.lineTo(x + 120, SCENE_H);
    ctx.stroke();
  }
  ctx.restore();
  /* نورِ روز از چپ */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const lg = ctx.createRadialGradient(120, 80, 30, 120, 80, 800);
  lg.addColorStop(0, 'rgba(255, 244, 210, .4)');
  lg.addColorStop(1, 'rgba(255, 244, 210, 0)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* پیشخوانِ چوبی */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(BOOK.x - 24, BOOK.y - 20, BOOK.w + 48, BOOK.h + 44, 16); ctx.fill();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.beginPath(); rrPath(BOOK.x - 18, BOOK.y - 14, BOOK.w + 36, BOOK.h + 32, 12); ctx.fill();
  /* تختهٔ پلاک‌ها */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(RACK.x - 16, RACK.y - 14, RACK.w + 32, RACK.h + 32, 14); ctx.fill();
  ctx.fillStyle = texWood('#8c5c2c', '#553618');
  ctx.beginPath(); rrPath(RACK.x - 10, RACK.y - 8, RACK.w + 20, RACK.h + 20, 10); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.fillRect(RACK.x - 10, RACK.y + RACK.h + 12, RACK.w + 20, 8);
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
  drawBook();
  drawRack();
  bits.draw();
  if (S.held >= 0) plaque(S.hx - 93, S.hy - 46, 186, 92, S.rack[S.held].v);
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.13, 'rgba(80, 52, 16, .3)', .28, .1);
}

function drawBook() {
  paper(BOOK.x, BOOK.y, BOOK.w, BOOK.h, P.card, 21, 12, .3);
  ctx.strokeStyle = 'rgba(181, 67, 47, .3)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(BOOK.x + 30, BOOK.y + 18); ctx.lineTo(BOOK.x + 30, BOOK.y + BOOK.h - 18); ctx.stroke();
  text('دفترِ حجره', BOOK.x + BOOK.w - 30, BOOK.y + 36, { size: 21, family: 'Lalezar', color: P.ink, align: 'right' });

  const right = BOOK.x + BOOK.w - 90;      /* ستونِ راست‌چینِ عددها */
  /* عددِ بالا و ضرب‌کننده */
  numText(fa(S.b), right, BOOK.y + 108, { size: 52, color: P.ink, align: 'right' });
  numText('×', right - 170, BOOK.y + 176, { size: 34, color: P.red, align: 'right' });
  numText(fa(S.a), right, BOOK.y + 178, { size: 52, color: P.ink, align: 'right' });
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(BOOK.x + 46, BOOK.y + 214); ctx.lineTo(right + 14, BOOK.y + 214); ctx.stroke();

  for (let i = 0; i < S.parts.length; i++) {
    const b = rowBox(i);
    const k = S.places[i];
    const dIdx = S.dig.length - 1 - k;
    const hot = S.hover && S.hover.k === 'row' && S.hover.i === i;
    const filledOK = S.slot[i] >= 0;
    /* برچسبِ سطر: کدام تکّهٔ ضرب */
    ctx.fillStyle = 'rgba(47, 42, 36, .05)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
    if (!filledOK) {
      ctx.strokeStyle = hot || S.held >= 0 ? P.red : 'rgba(47, 42, 36, .2)';
      ctx.lineWidth = 2; ctx.setLineDash([8, 7]);
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
      ctx.setLineDash([]);
    }
    numText(fa(S.a) + ' × ' + fa(S.dig[dIdx] * Math.pow(10, k)), b.x + 96, b.y + b.h / 2,
      { size: 24, color: filledOK ? P.inkSoft : P.red });
    if (filledOK) {
      plaque(b.x + b.w - 208, b.y + 2, 186, b.h - 4, S.rack[S.slot[i]].v,
        { ring: hot ? P.red : null });
    } else {
      text('پلاکِ این سطر', b.x + b.w - 116, b.y + b.h / 2, { size: 16, color: 'rgba(47, 42, 36, .35)' });
    }
    if (S.bad === i && S.badT > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(S.badT, 0, 1);
      ctx.strokeStyle = P.bad; ctx.lineWidth = 4;
      ctx.beginPath(); rrPath(b.x - 3, b.y - 3, b.w + 6, b.h + 6, 12); ctx.stroke();
      ctx.restore();
    }
  }
  /* خطِ جمع و جوابِ نهایی */
  const ly = BOOK.y + 258 + S.parts.length * ROW_H + 4;
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(BOOK.x + 46, ly); ctx.lineTo(right + 14, ly); ctx.stroke();
  numText('+', BOOK.x + 60, ly - 34, { size: 30, color: P.red, align: 'left' });
  if (S.done) {
    ctx.save();
    ctx.globalAlpha = clamp(S.sumT, 0, 1);
    numText(fa(S.sum), right, ly + 52, { size: 56, color: P.red, align: 'right' });
    ctx.restore();
  } else {
    text('جمعِ سطرها', right - 40, ly + 52, { size: 17, color: 'rgba(47, 42, 36, .3)', align: 'right' });
  }
}

function drawRack() {
  text('تختهٔ پلاک', RACK.x + RACK.w - 18, RACK.y + 34,
    { size: 21, family: 'Lalezar', color: P.card, align: 'right' });
  for (let i = 0; i < S.rack.length; i++) {
    const b = rackSlot(i);
    if (S.rack[i].used || S.held === i) {
      ctx.strokeStyle = 'rgba(255, 253, 245, .25)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
      ctx.setLineDash([]);
      continue;
    }
    const hot = S.hover && S.hover.k === 'rack' && S.hover.i === i;
    plaque(b.x, b.y - (hot ? 5 : 0), b.w, b.h, S.rack[i].v, { ring: hot ? P.card : null });
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(47, 42, 36, .94)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = P.red;
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.card, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 246 - i * 30;
    ctx.save();
    ctx.globalAlpha = i < S.seals ? 1 : .22;
    ctx.fillStyle = i < S.seals ? P.red : '#7d766c';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, 11, 0, TAU); ctx.fill();
    ctx.fillStyle = i < S.seals ? '#f6d9cf' : '#a09a90';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, 5, 0, TAU); ctx.fill();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(255, 253, 245, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
  const k = clamp(S.timeLeft / L().time, 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.beginPath(); rrPath(SCENE_W / 2 - 150, HUD_H - 10, 300, 5, 3); ctx.fill();
  ctx.fillStyle = k > .3 ? P.gold : P.red;
  ctx.beginPath(); rrPath(SCENE_W / 2 - 150, HUD_H - 10, 300 * k, 5, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: BOOK.x + 30, y: BOOK.y + 70, w: BOOK.w - 60, h: 160 }], .74);
    const h = tutCard(700, 300, 480,
      ['دفتر ضرب را می‌شکند:', 'هر سطر یک تکّه از آن است.'], 'حجرهٔ حساب');
    tutMore(940, 300 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: RACK.x, y: RACK.y, w: RACK.w, h: RACK.h },
          { x: rowBox(0).x, y: rowBox(0).y - 6, w: rowBox(0).w, h: S.parts.length * ROW_H }], .72);
    tutCard(60, 84, 620, ['سطر می‌گوید کدام تکّه را می‌خواهد؛',
      'پلاکِ درست را از تخته بردار و همان‌جا بگذار.']);
  } else {
    spot([{ x: RACK.x, y: RACK.y, w: RACK.w, h: RACK.h }], .74);
    const h = tutCard(60, 200, 620,
      ['روی هر پلاک، هم عدد هست هم چینه‌هایش.',
       'اگر بینِ ۹ و ۹۰ شک کردی، چینه‌ها را بشمار.',
       'جمعِ آخر را خودِ دفتر می‌زند.'], 'چینه‌ها را بشمار');
    tutMore(370, 200 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function bookIcon(x, y) {
  ctx.fillStyle = P.card;
  ctx.beginPath(); rrPath(x - 52, y - 30, 104, 60, 6); ctx.fill();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(x - 52, y - 30, 104, 60, 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 40, y - 4); ctx.lineTo(x + 40, y - 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 40, y + 16); ctx.lineTo(x + 40, y + 16); ctx.stroke();
  numText('۲۳۴', x + 30, y - 17, { size: 17, color: P.ink, align: 'right' });
  numText('۹۰', x + 30, y + 6, { size: 15, color: P.red, align: 'right' });
  numText('۷۰۲', x + 30, y + 26, { size: 17, color: P.red, align: 'right' });
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 800, h: 300, y: 128,
    paper: P.paper, band: P.red, ink: P.ink, inkSoft: '#7a7164',
    icon: bookIcon,
    title: 'حجرهٔ حساب',
    body: 'دفتر ضرب را می‌شکند: هر سطر یک تکّه است — ۳×۴، ۳×۳۰، ۳×۲۰۰.\nپلاکِ درستِ هر سطر را از تختهٔ کنار بردار و همان‌جا بگذار.\nروی پلاک هم عدد هست هم چینه‌ها؛ ۹ با ۹۰ فرق دارد.',
    btn: BTN_GO, btnLabel: 'دفتر را باز کن', btnHot: S.hover === BTN_GO,
    btnFill: '#b5432f', btnHotFill: '#cb5540',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#7a7164',
    icon: bookIcon,
    title: L().endless ? 'بازار بسته شد' : 'همهٔ حساب‌ها بسته شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ حجره‌ها را گرداندی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'حسابِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#b5432f', btnHotFill: '#cb5540',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#7a7164',
    icon: (x, y) => {
      ctx.fillStyle = '#8a8378';
      ctx.beginPath(); ctx.arc(x - 54, y, 15, 0, TAU); ctx.fill();
      bookIcon(x + 16, y);
    },
    title: 'مهرها تمام شد',
    body: 'امتیاز: ' + fa(S.score) + '\nچینه‌های روی پلاک را بشمار تا جای صفر گم نشود.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#b5432f', btnHotFill: '#cb5540',
  });
}

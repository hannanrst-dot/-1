/*!
title: هندوانه‌فروشِ تابستان — مقایسهٔ کسرها
bg: #10231c
*/

/* ═══════════════════════════════════════════════════════════════════════
   هندوانه‌فروشِ تابستان — ریاضی سوم، فصل ۳، درس ۵ (مقایسهٔ کسرها)
   ───────────────────────────────────────────────────────────────────────
   کتاب دو نتیجه می‌گیرد:
     • اگر مخرج‌ها برابر باشند، هر کدام صورتش بزرگ‌تر است بزرگ‌تر است.
     • اگر صورت‌ها برابر باشند، هر کدام مخرجش بزرگ‌تر است کوچک‌تر است.

   دوّمی همان چیزی است که بچه‌ها معمولاً برعکس می‌فهمند. اینجا حرفش زده
   نمی‌شود؛ دیده می‌شود:

     چاقو را که می‌چرخانی، هندوانه به قاچ‌های بیشتری بریده می‌شود و هر
     قاچ جلوی چشمِ بچه نازک‌تر می‌شود.

   سفارشِ مشتری همیشه یک «بازه» است: بیشتر از این، کمتر از آن. پس بچه
   مجبور است کسرها را کنارِ هم بچیند، نه فقط بزرگ و کوچک بگوید. و چون
   هندوانه‌ها شمرده‌اند، قاچِ بیخودی زیاد دادن خرج دارد.

   بعد از «بفرمایید»، ترازوی برنجی نشان می‌دهد قاچِ تو کجای بازه نشست —
   جواب قبلش هیچ‌جا گفته نمی‌شود.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const MAXD = 12, MIND = 2;

const P = {
  skyHi:   '#1d4a54',
  skyLo:   '#e8b06a',
  sun:     'rgba(255, 222, 150, .22)',
  awning1: '#c8433f',
  awning2: '#f4ead2',
  wood:    '#8a5a32',
  woodLit: '#a97442',
  woodDk:  '#5b3a1c',
  board:   '#c3a878',
  boardDk: '#9c8459',
  flesh:   '#e8455e',
  fleshDk: '#c02a45',
  fleshLit:'#f4788a',
  rind:    '#eef4dd',
  skin:    '#3f8a3c',
  skinDk:  '#2c6a2c',
  skinLit: '#63ab52',
  seed:    '#2b2018',
  brass:   '#d9a840',
  brassDk: '#a2761f',
  ice:     '#cfe9ef',
  paper:   '#fbf3e0',
  ink:     '#25302c',
  inkSoft: '#6f827a',
  good:    '#6fa85c',
  bad:     '#cf5f4a',
  gold:    '#f0c552',
};

/* ───────── سفارش‌ها ─────────
   هر سفارش یک بازه است. «eq» یعنی دقیقاً هم‌اندازه (تساویِ کسر).       */

const F = (n, d) => ({ n, d });
const val = (f) => f.n / f.d;

const LEVELS = [
  { name: 'صبحِ بازار', melons: 5, pics: true, orders: [
      { lo: F(1, 4), hi: F(3, 4) },
      { lo: F(1, 3), hi: F(1, 1) },
      { lo: F(0, 1), hi: F(1, 2) },
    ],
    hint: 'چاقو را بچرخان تا هندوانه به قاچ‌های بیشتری بریده شود.' },
  { name: 'مخرج‌های برابر', melons: 5, pics: true, orders: [
      { lo: F(2, 5), hi: F(4, 5) },
      { lo: F(3, 8), hi: F(6, 8) },
      { lo: F(1, 6), hi: F(3, 6) },
    ],
    hint: 'وقتی قاچ‌ها هم‌اندازه‌اند، هر چه بیشتر برداری بیشتر است.' },
  { name: 'صورت‌های برابر', melons: 5, pics: false, orders: [
      { lo: F(1, 5), hi: F(1, 3) },
      { lo: F(1, 4), hi: F(1, 2) },
      { lo: F(1, 7), hi: F(1, 4) },
    ],
    hint: 'همه‌شان یک قاچ‌اند! پس فرق در تعدادِ بریدن‌هاست.' },
  { name: 'سفارشِ باریک', melons: 5, pics: false, orders: [
      { lo: F(1, 2), hi: F(2, 3) },
      { lo: F(2, 5), hi: F(1, 2) },
      { lo: F(3, 4), hi: F(5, 6) },
      { eq: F(2, 6) },
    ],
    hint: 'بازه‌ها تنگ شده‌اند. آخری هم دقیقاً هم‌اندازه می‌خواهد.' },
  { name: 'بازارِ آزاد', melons: 6, pics: false, endless: true,
    hint: 'مشتری‌ها یکی‌یکی می‌آیند. هندوانه‌ها را حرام نکن.' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',        // intro | play | judge | won | lost
  level: 0,
  oi: 0,                 // شمارهٔ سفارش
  order: null,
  d: 4,                  // چند قاچ
  taken: [],             // قاچ‌های برداشته‌شده (اندیس)
  melons: 0,
  served: 0,
  hearts: 3,
  score: 0, best: 0,
  judge: null,           // { ok, mine, t }
  cutT: 0,               // انیمیشنِ بریدن
  t: 0, phaseT: 0,
  hover: null,
  shake: 0,
  bubbles: [],
  floats: [],
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const mine = () => S.taken.length / S.d;

function loadBest() { try { return +localStorage.getItem('hend-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('hend-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── چیدمان ───────── */

const HUD_H = 52;
const CARD = { x: 28, y: 96, w: 258, h: 226 };
const STOCK = { x: 28, y: 342, w: 258, h: 128 };
const MELON = { x: 578, y: 388, r: 168 };
const PLATE = { x: 966, y: 372, r: 122 };
const DIAL = { x: 430, y: 618, w: 296, h: 74 };
const BTN_MINUS = { x: 430, y: 618, w: 74, h: 74 };
const BTN_PLUS = { x: 652, y: 618, w: 74, h: 74 };
const BTN_GIVE = { x: 850, y: 618, w: 232, h: 74 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/** زاویهٔ قاچِ i اُم؛ از بالا شروع می‌شود. */
function wedgeAngles(i, d) {
  const a0 = -Math.PI / 2 + i * TAU / d;
  return [a0, a0 + TAU / d];
}

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

/** بازهٔ تصادفی که با مخرجِ ۲ تا ۱۲ حتماً جواب دارد. */
function randomOrder() {
  const cands = [];
  for (let d1 = 2; d1 <= 8; d1++) for (let n1 = 1; n1 < d1; n1++)
    for (let d2 = 2; d2 <= 8; d2++) for (let n2 = 1; n2 < d2; n2++) {
      const a = n1 / d1, b = n2 / d2;
      if (b - a < .1 || b - a > .35) continue;
      let ok = false;
      for (let d = MIND; d <= MAXD && !ok; d++)
        for (let n = 1; n < d; n++) if (n / d > a + 1e-9 && n / d < b - 1e-9) { ok = true; break; }
      if (ok) cands.push({ lo: F(n1, d1), hi: F(n2, d2) });
    }
  if (Math.random() < .2) {
    const d = 2 + Math.floor(Math.random() * 5);
    const n = 1 + Math.floor(Math.random() * (d - 1));
    return { eq: F(n * 2, d * 2) };
  }
  return cands[Math.floor(Math.random() * cands.length)];
}

function nextOrder() {
  const lv = L();
  S.order = lv.endless ? randomOrder() : lv.orders[S.oi];
  S.d = 4;
  S.taken = [];
  S.judge = null;
  S.phase = 'play'; S.phaseT = 0;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.oi = 0;
  S.melons = lv.melons;
  S.served = 0;
  if (!keep) S.hearts = 3;
  S.bubbles = [];
  nextOrder();
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  toast.say(lv.hint, 'info');
}

function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 26 }); }

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.cutT > 0) S.cutT = Math.max(0, S.cutT - dt * 3);
  if (S.judge) {
    S.judge.t += dt;
    if (S.judge.t > 2.6) afterJudge();
  }
  for (const b of S.bubbles) { b.y -= b.sp * dt; b.ph += dt * 2; }
  S.bubbles = S.bubbles.filter((b) => b.y > -30);
  for (const f of S.floats) { f.t += dt; f.y -= 42 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.5);
  if (S.phase === 'play' && S.tut.on) tutStep(dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── بریدن و برداشتن ─────────
   عوض کردنِ تعدادِ قاچ‌ها یعنی هندوانه را از نو بریدن، پس بشقاب خالی
   می‌شود. همین باعث می‌شود بچه اوّل فکر کند بعد ببُرد.                */

function setD(v) {
  if (S.phase !== 'play') return;
  const nv = clamp(v, MIND, MAXD);
  if (nv === S.d) { S.shake = .12; return; }
  S.d = nv;
  S.taken = [];
  S.cutT = 1;
  sfx.tone(300 + nv * 14, .1, 'triangle', .07);
}

function takeWedge(i) {
  if (S.phase !== 'play') return;
  const k = S.taken.indexOf(i);
  if (k >= 0) { S.taken.splice(k, 1); sfx.tap(); return; }
  if (S.taken.length >= S.d - 0) return;
  S.taken.push(i);
  sfx.place();
  const a = wedgeAngles(i, S.d);
  const mid = (a[0] + a[1]) / 2;
  bits.add(MELON.x + Math.cos(mid) * MELON.r * .6, MELON.y + Math.sin(mid) * MELON.r * .6,
    6, 'dot', [P.fleshLit, P.flesh, '#fff'], { speed: 100, lift: 40, size: 3, life: .5 });
}

/* ───────── داوریِ ترازو ───────── */

function give() {
  if (S.phase !== 'play' || !S.taken.length) return;
  const o = S.order, m = mine();
  const ok = o.eq
    ? Math.abs(m - val(o.eq)) < 1e-9
    : (m > val(o.lo) + 1e-9 && m < val(o.hi) - 1e-9);
  S.melons--;
  S.judge = { ok, mine: m, t: 0, d: S.d, n: S.taken.length };
  S.phase = 'judge';
  if (ok) {
    /* هرچه به مرزِ پایین نزدیک‌تر، هندوانهٔ کمتری حرام شده */
    const waste = o.eq ? 0 : (m - val(o.lo)) / Math.max(.001, val(o.hi) - val(o.lo));
    const pts = 250 + Math.round((1 - waste) * 150);
    S.score += pts;
    if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
    S.served++;
    floatText(PLATE.x, PLATE.y - 130, `+${fa(pts)}`, P.gold);
    bits.confetti(PLATE.x, PLATE.y - 40, 40, [P.gold, P.fleshLit, P.skinLit, '#fff']);
    sfx.win();
  } else {
    S.hearts--;
    S.shake = .4;
    sfx.nope();
  }
}

function afterJudge() {
  const lv = L();
  S.judge = null;
  if (S.hearts <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  if (S.melons <= 0) {
    /* در بازارِ آزاد، تمام‌شدنِ هندوانه یعنی روز تمام شد، نه باخت. */
    S.phase = lv.endless ? 'won' : 'lost';
    S.phaseT = 0;
    if (lv.endless) sfx.win();
    return;
  }
  S.oi++;
  if (!lv.endless && S.oi >= lv.orders.length) {
    S.phase = 'won'; S.phaseT = 0;
    S.score += S.melons * 120;
    if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
    sfx.win();
    return;
  }
  nextOrder();
  for (let i = 0; i < 6; i++) {
    S.bubbles.push({ x: 200 + Math.random() * 800, y: SCENE_H + 20,
                     r: 3 + Math.random() * 5, sp: 30 + Math.random() * 40, ph: Math.random() * TAU });
  }
}

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 30) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 1 && S.taken.length > 0) { S.tut.step = 2; S.tut.t = 0; }
  if (S.tut.step === 2 && S.tut.t > 30) S.tut.on = false;
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (inRect(p, BTN_MINUS)) return BTN_MINUS;
  if (inRect(p, BTN_PLUS)) return BTN_PLUS;
  if (inRect(p, BTN_GIVE)) return BTN_GIVE;
  const dx = p.x - MELON.x, dy = p.y - MELON.y;
  const r = Math.hypot(dx, dy);
  if (r < MELON.r + 18) {
    let a = Math.atan2(dy, dx) + Math.PI / 2;
    a = ((a % TAU) + TAU) % TAU;
    return { wedge: Math.floor(a / (TAU / S.d)) % S.d };
  }
  return null;
}

cv.addEventListener('pointermove', (e) => {
  S.hover = hitTest(toStage(e));
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});
cv.addEventListener('pointerleave', () => { S.hover = null; });
cv.addEventListener('pointerdown', (e) => {
  if (S.phase === 'play' && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  const h = hitTest(toStage(e));
  if (S.phase === 'intro') { if (h) startLevel(0); return; }
  if (S.phase === 'judge') return;
  if (S.phase === 'won') {
    if (!h) return;
    if (L().endless) startLevel(S.level, true);
    else if (S.level + 1 < LEVELS.length) startLevel(S.level + 1, true);
    else { S.score = 0; startLevel(0); }
    return;
  }
  if (S.phase === 'lost') { if (h) { S.score = 0; startLevel(S.level); } return; }
  if (!h) return;
  if (h === BTN_MINUS) return setD(S.d - 1);
  if (h === BTN_PLUS) return setD(S.d + 1);
  if (h === BTN_GIVE) return give();
  if (h.wedge !== undefined) return takeWedge(h.wedge);
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
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function frac(cx, cy, n, d, size, color) {
  numText(fa(n), cx, cy - size * .42, { size, color });
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2.2, size * .07);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - size * .42, cy); ctx.lineTo(cx + size * .42, cy);
  ctx.stroke();
  ctx.restore();
  numText(fa(d), cx, cy + size * .5, { size, color });
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(8, 22, 18, ${alpha})`;
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
  }, '10, 30, 24');
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

/** یک قاچِ هندوانه: گوشتِ سرخ، سفیدیِ زیرِ پوست، پوستِ سبز، و تخمه‌ها. */
function wedge(cx, cy, r, a0, a1, o = {}) {
  const pull = o.pull || 0;
  const mid = (a0 + a1) / 2;
  ctx.save();
  ctx.translate(Math.cos(mid) * pull, Math.sin(mid) * pull);
  if (o.shadow) {
    ctx.save();
    ctx.globalAlpha = .3;
    ctx.fillStyle = '#0b1d17';
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy + 8);
    ctx.arc(cx + 4, cy + 8, r, a0, a1);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  /* گوشت */
  ctx.fillStyle = o.dim ? '#8a6a58' : P.flesh;
  ctx.beginPath();
  ctx.moveTo(cx, cy); ctx.arc(cx, cy, r * .84, a0, a1); ctx.closePath(); ctx.fill();
  if (!o.dim) {
    ctx.fillStyle = P.fleshLit;
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.arc(cx, cy, r * .84, a0, a0 + (a1 - a0) * .32); ctx.closePath();
    ctx.globalAlpha = .5; ctx.fill(); ctx.globalAlpha = 1;
    /* تخمه‌ها */
    ctx.fillStyle = P.seed;
    for (let k = 0; k < 3; k++) {
      const t = .38 + k * .2;
      const a = a0 + (a1 - a0) * (.3 + noise1(a0 * 7 + k) * .45);
      ctx.save();
      ctx.translate(cx + Math.cos(a) * r * t, cy + Math.sin(a) * r * t);
      ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0, 0, 4.4, 2.6, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }
  /* سفیدیِ زیرِ پوست */
  ctx.fillStyle = o.dim ? '#c9c4b4' : P.rind;
  ctx.beginPath();
  ctx.arc(cx, cy, r * .92, a0, a1);
  ctx.arc(cx, cy, r * .84, a1, a0, true);
  ctx.closePath(); ctx.fill();
  /* پوست */
  ctx.fillStyle = o.dim ? '#6b7a63' : P.skin;
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, a1);
  ctx.arc(cx, cy, r * .92, a1, a0, true);
  ctx.closePath(); ctx.fill();
  if (!o.dim) {
    ctx.strokeStyle = P.skinDk; ctx.lineWidth = 3;
    for (let k = 0; k < 2; k++) {
      const a = a0 + (a1 - a0) * (.3 + k * .4);
      ctx.beginPath(); ctx.arc(cx, cy, r * .96, a - .05, a + .05); ctx.stroke();
    }
  }
  ctx.restore();
}

/** هندوانهٔ بریده‌شده. taken = قاچ‌هایی که برداشته شده‌اند. */
function cutDisc(cx, cy, r, d, taken, o = {}) {
  /* تخته زیرش */
  if (o.board) {
    ctx.fillStyle = P.boardDk;
    wobbleCircle(cx + 4, cy + 10, r + 22, 11, 2); ctx.fill();
    ctx.fillStyle = P.board;
    wobbleCircle(cx, cy + 4, r + 22, 13, 2); ctx.fill();
  }
  for (let i = 0; i < d; i++) {
    if (taken && taken.indexOf(i) >= 0) continue;
    const [a0, a1] = wedgeAngles(i, d);
    const hot = o.hover === i;
    wedge(cx, cy, r, a0 + .006, a1 - .006, { shadow: true, pull: hot ? 8 : 0 });
  }
  /* خط‌های چاقو */
  if (o.cutFlash) {
    ctx.save();
    ctx.globalAlpha = o.cutFlash * .9;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    for (let i = 0; i < d; i++) {
      const a = -Math.PI / 2 + i * TAU / d;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * (r + 16), cy + Math.sin(a) * (r + 16));
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** آیکنِ کوچکِ کسر: دایره‌ای که n قسمت از d قسمتش پُر است. */
function pieIcon(cx, cy, r, n, d, col) {
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * (n / d));
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40, 50, 44, .5)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < d; i++) {
    const a = -Math.PI / 2 + i * TAU / d;
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(40, 50, 44, .7)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#10231c');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 13;
    ctx.translate(Math.sin(S.t * 58) * k, Math.cos(S.t * 45) * k * .5);
  }

  drawStreet();
  drawCart();
  drawMelon();
  drawPlate();
  bits.draw();
  ctx.restore();

  drawCard();
  drawStock();
  drawDial();
  drawGive();
  drawFloats();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  }

  if (S.phase === 'judge') drawJudge();
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.12, 'rgba(10, 30, 20, .40)');
}

function drawStreet() {
  const g = ctx.createLinearGradient(0, 0, 0, 520);
  g.addColorStop(0, P.skyHi);
  g.addColorStop(.6, '#7fa08a');
  g.addColorStop(1, P.skyLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* خانه‌های آن‌طرفِ خیابان */
  ctx.fillStyle = 'rgba(40, 66, 60, .5)';
  for (let i = 0; i < 7; i++) {
    const x = i * 186 - 40, h = 150 + noise1(i * 3) * 120;
    wobbleRect(x, 300 - h, 168, h, 4, i * 5, 1.6); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255, 232, 190, .18)';
  for (let i = 0; i < 22; i++) {
    const x = 20 + noise1(i * 7.3) * 1160, y = 180 + noise1(i * 3.1) * 100;
    wobbleRect(x, y, 22, 30, 3, i, 1); ctx.fill();
  }

  /* نورِ داغِ تابستان */
  const gl = ctx.createRadialGradient(980, 60, 30, 980, 60, 700);
  gl.addColorStop(0, P.sun);
  gl.addColorStop(1, 'rgba(255, 222, 150, 0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* سایبانِ راه‌راه */
  ctx.save();
  const aw = 168;
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = i % 2 ? P.awning1 : P.awning2;
    ctx.beginPath();
    ctx.moveTo(i * 92 - 20, 52);
    ctx.lineTo(i * 92 + 72, 52);
    ctx.lineTo(i * 92 + 62, aw - 10 + Math.sin(i) * 4);
    ctx.quadraticCurveTo(i * 92 + 26, aw + 16, i * 92 - 10, aw - 10 + Math.sin(i) * 4);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,.16)';
  ctx.fillRect(0, 52, SCENE_W, 16);
  ctx.restore();

  /* حباب‌های خنکی */
  ctx.save();
  for (const b of S.bubbles) {
    ctx.globalAlpha = .3;
    ctx.fillStyle = P.ice;
    ctx.beginPath(); ctx.arc(b.x + Math.sin(b.ph) * 8, b.y, b.r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawCart() {
  /* پیشخوانِ چوبی */
  ctx.fillStyle = P.woodDk;
  wobbleRect(0, 556, SCENE_W, 30, 0, 21, 1.6); ctx.fill();
  ctx.fillStyle = P.wood;
  wobbleRect(0, 544, SCENE_W, 20, 0, 23, 1.4); ctx.fill();
  ctx.fillStyle = P.woodLit;
  wobbleRect(0, 542, SCENE_W, 7, 0, 25, .8); ctx.fill();
  ctx.fillStyle = '#4a2f16';
  ctx.fillRect(0, 586, SCENE_W, SCENE_H - 586);
  ctx.save();
  ctx.globalAlpha = .2;
  ctx.strokeStyle = '#2c1b0c'; ctx.lineWidth = 3;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath(); ctx.moveTo(i * 132, 586); ctx.lineTo(i * 132 - 60, SCENE_H); ctx.stroke();
  }
  ctx.restore();

  /* هندوانه‌های سالم، گوشهٔ پیشخوان */
  for (let i = 0; i < Math.min(4, S.melons); i++) {
    const x = 92 + i * 46 + (i % 2) * 8, y = 524 - (i % 2) * 12;
    ctx.save();
    ctx.globalAlpha = .35;
    ctx.fillStyle = '#0b1d17';
    wobbleEllipse(x + 4, y + 26, 34, 10, 0, i, 1.4); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = P.skin;
    wobbleCircle(x, y, 33, i * 3 + 1, 1.8); ctx.fill();
    ctx.fillStyle = P.skinDk;
    for (let k = -2; k <= 2; k++) {
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, 33, 0, TAU); ctx.clip();
      ctx.beginPath();
      ctx.ellipse(x + k * 13, y, 5, 34, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    wobbleEllipse(x - 11, y - 13, 9, 6, -.6, i * 2, 1); ctx.fill();
    ctx.restore();
  }
}

function drawMelon() {
  const hov = S.hover && S.hover.wedge !== undefined ? S.hover.wedge : -1;
  cutDisc(MELON.x, MELON.y, MELON.r, S.d, S.taken,
    { board: true, hover: S.phase === 'play' ? hov : -1, cutFlash: S.cutT });
  /* چاقو، تکیه‌داده به تخته */
  ctx.save();
  ctx.translate(MELON.x - MELON.r - 34, 566);
  ctx.rotate(-.38);
  ctx.fillStyle = '#c6ced4';
  ctx.beginPath();
  ctx.moveTo(-8, 0); ctx.lineTo(8, -4); ctx.lineTo(6, -108); ctx.lineTo(-6, -104);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e6edf1';
  ctx.beginPath();
  ctx.moveTo(6, -108); ctx.lineTo(-6, -104); ctx.lineTo(-3, -100); ctx.lineTo(5, -102);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.woodDk;
  wobbleRect(-10, -2, 20, 46, 5, 3, 1); ctx.fill();
  ctx.restore();
}

function drawPlate() {
  /* بشقابِ برنجی */
  ctx.save();
  ctx.globalAlpha = .3;
  ctx.fillStyle = '#0b1d17';
  wobbleEllipse(PLATE.x + 6, PLATE.y + 132, PLATE.r + 18, 16, 0, 31, 1.6); ctx.fill();
  ctx.restore();
  ctx.fillStyle = P.brassDk;
  wobbleCircle(PLATE.x, PLATE.y + 8, PLATE.r + 20, 33, 2); ctx.fill();
  ctx.fillStyle = P.brass;
  wobbleCircle(PLATE.x, PLATE.y, PLATE.r + 20, 35, 2); ctx.fill();
  ctx.fillStyle = '#e8c073';
  wobbleCircle(PLATE.x, PLATE.y, PLATE.r + 8, 37, 1.6); ctx.fill();

  if (!S.taken.length) {
    text('قاچ‌ها را بگذار اینجا', PLATE.x, PLATE.y, { size: 17, color: 'rgba(60, 46, 20, .55)' });
  } else {
    /* قاچ‌های برداشته‌شده، کنارِ هم چیده تا کسر خوانده شود */
    for (let k = 0; k < S.taken.length; k++) {
      const [a0, a1] = wedgeAngles(k, S.d);
      wedge(PLATE.x, PLATE.y, PLATE.r, a0 + .006, a1 - .006, { shadow: true });
    }
    ctx.strokeStyle = 'rgba(90, 60, 20, .35)'; ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(PLATE.x, PLATE.y, PLATE.r, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
  }
  /* کسرِ روی بشقاب */
  text('روی بشقاب', PLATE.x + 74, PLATE.y - PLATE.r - 44, { size: 16, color: 'rgba(251, 243, 224, .78)' });
  frac(PLATE.x - 22, PLATE.y - PLATE.r - 42, S.taken.length, S.d, 32, '#fbf3e0');
}

/* ───────── کارتِ سفارش ───────── */

function drawCard() {
  const b = CARD, o = S.order;
  if (!o) return;
  withShadow(20, 9, .4, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 41, 2); ctx.fill();
  }, '10, 30, 24');
  ctx.fillStyle = P.awning1;
  wobbleRect(b.x, b.y, b.w, 11, 5, 43, .8); ctx.fill();
  text('مشتری می‌خواهد', b.x + b.w / 2, b.y + 38, { size: 19, family: 'Lalezar', color: P.inkSoft });

  const pics = L().pics;
  if (o.eq) {
    text('دقیقاً هم‌اندازهٔ', b.x + b.w / 2, b.y + 74, { size: 17, color: P.ink });
    frac(b.x + b.w / 2 + (pics ? 44 : 0), b.y + 132, o.eq.n, o.eq.d, 44, P.ink);
    if (pics) pieIcon(b.x + b.w / 2 - 56, b.y + 132, 34, o.eq.n, o.eq.d, P.flesh);
    text('از یک هندوانه', b.x + b.w / 2, b.y + 190, { size: 15, color: P.inkSoft });
  } else {
    const row = (label, f, y) => {
      text(label, b.x + b.w - 26, y, { size: 16, color: P.inkSoft, align: 'right' });
      frac(b.x + b.w - 106, y, f.n, f.d, 32, P.ink);
      if (pics) pieIcon(b.x + 46, y, 26, f.n, f.d, P.flesh);
    };
    row('بیشتر از', o.lo, b.y + 92);
    ctx.strokeStyle = 'rgba(111, 130, 122, .4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(b.x + 26, b.y + 132); ctx.lineTo(b.x + b.w - 26, b.y + 132); ctx.stroke();
    row('کمتر از', o.hi, b.y + 172);
  }
}

function drawStock() {
  const b = STOCK;
  withShadow(16, 8, .35, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 12, 51, 2); ctx.fill();
  }, '10, 30, 24');
  ctx.fillStyle = P.skin;
  wobbleRect(b.x, b.y, b.w, 10, 4, 53, .8); ctx.fill();
  text('هندوانه‌ها', b.x + b.w / 2, b.y + 34, { size: 18, family: 'Lalezar', color: P.inkSoft });
  const n = L().melons;
  const step = Math.min(40, (b.w - 40) / Math.max(1, n));
  for (let i = 0; i < n; i++) {
    const x = b.x + b.w / 2 - (n - 1) * step / 2 + i * step;
    const alive = i < S.melons;
    ctx.save();
    ctx.globalAlpha = alive ? 1 : .2;
    ctx.fillStyle = alive ? P.skin : '#8f968a';
    wobbleCircle(x, b.y + 82, 16, i * 3 + 1, 1.2); ctx.fill();
    if (alive) {
      ctx.fillStyle = P.skinDk;
      ctx.save();
      ctx.beginPath(); ctx.arc(x, b.y + 82, 16, 0, TAU); ctx.clip();
      for (const k of [-1, 0, 1]) { ctx.beginPath(); ctx.ellipse(x + k * 7, b.y + 82, 2.6, 17, 0, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
  }
  text(`${fa(S.melons)} مانده`, b.x + b.w / 2, b.y + b.h - 16, { size: 15, color: P.inkSoft });
}

function drawDial() {
  const b = DIAL;
  withShadow(14, 6, .34, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x + 82, b.y + 6, b.w - 164, b.h - 12, 12, 61, 1.4); ctx.fill();
  }, '10, 30, 24');
  text('چند قاچ', b.x + b.w / 2, b.y + 22, { size: 14, color: P.inkSoft });
  numText(fa(S.d), b.x + b.w / 2, b.y + 50, { size: 34, color: P.ink });
  roundButton({ x: BTN_MINUS.x + 37, y: BTN_MINUS.y + 37, r: 34 }, '−', {
    hot: S.hover === BTN_MINUS, disabled: S.phase !== 'play' || S.d <= MIND,
    fill: P.brassDk, hotFill: P.brass, size: 36,
  });
  roundButton({ x: BTN_PLUS.x + 37, y: BTN_PLUS.y + 37, r: 34 }, '+', {
    hot: S.hover === BTN_PLUS, disabled: S.phase !== 'play' || S.d >= MAXD,
    fill: P.brassDk, hotFill: P.brass, size: 36,
  });
}

function drawGive() {
  button(BTN_GIVE, 'بفرمایید', {
    hot: S.hover === BTN_GIVE, disabled: S.phase !== 'play' || !S.taken.length,
    fill: '#3f8a5c', hotFill: '#4d9d6c', size: 28,
  });
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.5, 0, 1);
    numText(f.txt, f.x, f.y, { size: f.size, color: f.col, alpha: k });
  }
}

/* ───────── ترازوی داوری ─────────
   بعد از تصمیمِ بچه، جای قاچش را روی خطِ صفر تا یک نشان می‌دهد.       */

function drawJudge() {
  const j = S.judge, o = S.order;
  const k = easeOut(clamp(j.t / .4, 0, 1));
  ctx.fillStyle = `rgba(10, 26, 20, ${.62 * k})`;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  const w = 720, h = 380, x = SCENE_W / 2 - w / 2, y = 176;
  ctx.save();
  const s = lerp(.92, 1, easeBack(clamp(j.t / .6, 0, 1)));
  ctx.translate(SCENE_W / 2, y + h / 2);
  ctx.scale(s, s);
  ctx.translate(-SCENE_W / 2, -(y + h / 2));
  withShadow(28, 12, .45, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(x, y, w, h, 18, 71, 2.4); ctx.fill();
  }, '10, 30, 24');
  ctx.fillStyle = j.ok ? P.good : P.bad;
  wobbleRect(x, y, w, 13, 6, 73, 1); ctx.fill();

  text(j.ok ? 'دستت درد نکند!' : 'این اندازه نشد', SCENE_W / 2, y + 52,
    { size: 32, family: 'Lalezar', color: j.ok ? P.good : P.bad });

  /* بشقابِ بچه: فقط قاچ‌هایی که داد، با خط‌چینِ یک هندوانهٔ کامل */
  const px = x + 118, py = y + 172;
  for (let k = 0; k < j.n; k++) {
    const [a0, a1] = wedgeAngles(k, j.d);
    wedge(px, py, 62, a0 + .008, a1 - .008, { shadow: true });
  }
  ctx.strokeStyle = 'rgba(90, 100, 92, .45)'; ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.arc(px, py, 62, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  frac(px, py + 104, j.n, j.d, 30, P.ink);

  /* خطِ صفر تا یک با بازهٔ سفارش */
  const bx = x + 244, bw = w - 312, by = y + 186;
  ctx.fillStyle = 'rgba(111, 130, 122, .2)';
  ctx.beginPath(); rrPath(bx, by - 15, bw, 30, 15); ctx.fill();

  const tick = (t, f, side) => {
    const tx = bx + bw * t;
    ctx.strokeStyle = 'rgba(60, 74, 68, .55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx, by - 15); ctx.lineTo(tx, by - 40); ctx.stroke();
    frac(tx + side * 26, by - 62, f.n, f.d, 22, P.inkSoft);
  };

  if (o.eq) {
    const t = val(o.eq);
    ctx.fillStyle = 'rgba(217, 168, 64, .8)';
    ctx.beginPath(); rrPath(bx + bw * t - 5, by - 15, 10, 30, 5); ctx.fill();
    tick(t, o.eq, 0);
  } else {
    const t0 = val(o.lo), t1 = val(o.hi);
    ctx.fillStyle = 'rgba(111, 168, 92, .6)';
    ctx.beginPath(); rrPath(bx + bw * t0, by - 15, bw * (t1 - t0), 30, 15); ctx.fill();
    tick(t0, o.lo, -1);
    tick(t1, o.hi, 1);
  }
  ctx.strokeStyle = 'rgba(60, 74, 68, .5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx, by - 22); ctx.lineTo(bx, by + 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + bw, by - 22); ctx.lineTo(bx + bw, by + 22); ctx.stroke();
  numText(fa(0), bx, by + 42, { size: 18, color: P.inkSoft });
  numText(fa(1), bx + bw, by + 42, { size: 18, color: P.inkSoft });

  /* نشانگرِ قاچِ بچه */
  const mx = bx + bw * j.mine;
  ctx.strokeStyle = j.ok ? P.good : P.bad; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(mx, by - 20); ctx.lineTo(mx, by + 42); ctx.stroke();
  ctx.fillStyle = j.ok ? P.good : P.bad;
  ctx.beginPath();
  ctx.moveTo(mx, by + 50); ctx.lineTo(mx - 13, by + 72); ctx.lineTo(mx + 13, by + 72);
  ctx.closePath(); ctx.fill();
  frac(mx, by + 96, j.n, j.d, 20, j.ok ? P.good : P.bad);

  text(j.ok ? 'قاچِ تو درست توی بازه نشست.' : 'قاچِ تو بیرونِ بازه افتاد.',
    SCENE_W / 2, y + h - 46, { size: 19, color: P.ink });
  ctx.restore();
}

/* ───────── نوارِ بالا ───────── */

function drawHUD() {
  ctx.fillStyle = 'rgba(12, 30, 24, .78)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(217, 168, 64, .45)';
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);

  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 32 - i * 33;
    ctx.save();
    ctx.globalAlpha = i < S.hearts ? 1 : .22;
    ctx.fillStyle = i < S.hearts ? '#d4574a' : '#4b5f56';
    ctx.translate(x, HUD_H / 2);
    const s = i < S.hearts ? 1 + Math.sin(S.t * 3 + i) * .05 : 1;
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-14, -2, -9, -13, 0, -6);
    ctx.bezierCurveTo(9, -13, 14, -2, 0, 9);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  text(L().name, SCENE_W - 146, HUD_H / 2, { size: 18, family: 'Lalezar', color: '#e8f4ea', align: 'right' });
  numText(fa(S.score), 26, HUD_H / 2 - 1, { size: 26, color: P.gold, align: 'left' });
  text(`رکورد ${fa(S.best)}`, 108, HUD_H / 2, { size: 14, color: 'rgba(232, 244, 234, .58)', align: 'left' });

  const lv = L();
  if (!lv.endless) {
    const n = lv.orders.length;
    const w = 15, gap = 9, x0 = SCENE_W / 2 - (n * w + (n - 1) * gap) / 2;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i < S.served ? P.good : 'rgba(255,255,255,.18)';
      ctx.beginPath();
      ctx.ellipse(x0 + i * (w + gap) + w / 2, HUD_H / 2, w / 2, w / 2 * .8, 0, 0, TAU);
      ctx.fill();
    }
  } else {
    text(`${fa(S.served)} مشتری`, SCENE_W / 2, HUD_H / 2, { size: 16, color: P.good });
  }
}

/* ───────── آموزش ───────── */

function drawTutorial() {
  const st = S.tut.step;
  let holes = [], msg = '', hand = null;

  if (st === 0) {
    holes = [{ x: CARD.x - 6, y: CARD.y - 6, w: CARD.w + 12, h: CARD.h + 12 }];
    msg = 'مشتری یک بازه می‌خواهد: بیشتر از این و کمتر از آن.';
  } else if (st === 1) {
    holes = [{ x: DIAL.x - 10, y: DIAL.y - 10, w: DIAL.w + 20, h: DIAL.h + 20 },
             { x: MELON.x - MELON.r - 30, y: MELON.y - MELON.r - 30, w: MELON.r * 2 + 60, h: MELON.r * 2 + 60 }];
    msg = 'با − و + هندوانه را به قاچ‌های بیشتری ببُر، بعد روی قاچ‌ها بزن تا برداری.';
    hand = { x: DIAL.x + DIAL.w / 2, y: DIAL.y - 66 };
  } else {
    holes = [{ x: PLATE.x - PLATE.r - 40, y: PLATE.y - PLATE.r - 40, w: PLATE.r * 2 + 80, h: PLATE.r * 2 + 230 }];
    msg = 'هرچه بیشتر ببُری قاچ‌ها نازک‌ترند. کسرِ بشقاب زیرش نوشته شده.';
  }

  spot(holes, .56);
  const w = 520, h = 92, x = SCENE_W / 2 - w / 2, y = 470;
  paper(x, y, w, h, P.paper, 61, 14, .45);
  ctx.fillStyle = P.awning1;
  wobbleRect(x, y, 9, h, 4, 63, .8); ctx.fill();
  textWrap(msg, x + w / 2 + 6, y + h / 2 - 12, w - 54, { size: 17, color: P.ink, lineHeight: 26 });
  if (TUT_TAP.indexOf(st) >= 0) tutMore(x + w / 2, y + h + 12, S.t, P.ink);
  if (hand) pointHand(hand.x, hand.y);
}

/* ───────── پرده‌ها ───────── */

function melonIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(.42, .42);
  cutDisc(0, 0, 74, 6, [0, 1], {});
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT,
    w: 750, h: 348, y: 168,
    title: 'هندوانه‌فروشِ تابستان',
    body: 'مشتری می‌گوید قاچش باید از یکی بیشتر و از یکی کمتر باشد.\nهندوانه را هرجور خواستی ببُر و قاچ بردار.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'باز کن دکّه را',
    paper: P.paper, band: P.awning1, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#3f8a5c', btnHotFill: '#4d9d6c',
    icon: melonIcon,
  });
}

function drawWon() {
  const last = !L().endless && S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT,
    w: 720, h: 320, y: 190,
    title: L().endless ? 'دکّه بسته شد' : 'همهٔ مشتری‌ها راضی!',
    body: L().endless
      ? `${fa(S.served)} مشتری را راضی کردی. امتیازت ${fa(S.score)} شد.`
      : `${fa(S.melons)} هندوانه هم برایت ماند. امتیازت ${fa(S.score)} شد.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: L().endless ? 'روزِ بعد' : (last ? 'از اوّل' : 'بازارِ بعدی'),
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#3f8a5c', btnHotFill: '#4d9d6c',
    icon: (x, y) => star(x, y + 6, 26, P.gold, Math.sin(S.t * 2) * .2),
  });
}

function drawLost() {
  overlay({
    t: S.phaseT,
    w: 720, h: 306, y: 196,
    title: S.hearts <= 0 ? 'مشتری‌ها رفتند' : 'هندوانه تمام شد',
    body: 'قبل از بریدن، دو کسرِ سفارش را با هم بسنج. بعد چاقو را بردار.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'دوباره',
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#cf5f4a', btnHotFill: '#dd6f59',
    icon: melonIcon,
  });
}

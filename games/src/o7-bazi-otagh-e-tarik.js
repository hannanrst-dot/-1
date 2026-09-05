/*!
title: اتاقِ تاریک — نور و مشاهدهٔ اجسام (بازی)
bg: #0d141f
*/

/* ═══════════════════════════════════════════════════════════════════════
   اتاقِ تاریک — علومِ سوم، درس ۷ «نور و مشاهدهٔ اجسام»  (بازی)

   کتاب سه چیز می‌گوید و این بازی هر سه را «قانونِ دنیا»یش کرده است،
   بی‌آنکه جوابی را بنویسد:

   ▸ نور از منبع به خطِ راست بیرون می‌آید. پرتوها در بازی واقعاً خط
     راست‌اند؛ هر چیزی سرِ راه باشد جلویشان را می‌گیرد.
   ▸ نور از آینه بازتاب می‌شود، با همان قانونِ واقعی: زاویهٔ برگشت
     برابرِ زاویهٔ تابش. آینه‌ها همان‌جایی که بچّه می‌گذارد و به هر
     زاویه‌ای که می‌چرخاند، پرتو را برمی‌گردانند.
   ▸ ما چیزی را می‌بینیم که نور به آن برسد و از آن به چشمِ ما برگردد.
     در این اتاق هرچه تاریک است دیده نمی‌شود؛ همین که نور به آن
     می‌رسد، رنگ می‌گیرد و از آن خطِ نوری به چشمِ پسرک می‌رود.

   و آینهٔ تخت و فرورفته و برآمده هر سه کارِ خودشان را می‌کنند، چون
   پرتوها از سطحِ واقعیِ آن‌ها بازتاب می‌شوند:
     تخت    → دستهٔ پرتو را می‌چرخاند و پهنایش عوض نمی‌شود.
     فرورفته → پرتوها را جمع می‌کند در یک نقطه (کانون) — نورِ زیاد.
     برآمده  → پرتوها را پخش می‌کند — نورِ کم روی جای زیاد.
   شمع تنها با نورِ جمع‌شده روشن می‌شود و گل‌های دور از هم تنها با
   نورِ پخش‌شده. بچّه خودش می‌فهمد کدام آینه کارِ کدام است.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  night: '#141d2b', nightLo: '#0d141f', nightHi: '#26344a',
  floor: '#1d1727', floorHi: '#2b2338',
  wall:  '#2b2237', wallDk: '#1a1424',
  gold:  '#ffd27a', warm: '#ffb54a', beam: '#ffd489',
  silver: '#e4edf7', silverDk: '#8d9bb0', silverLo: '#5b697d',
  wood:  '#8a6440', woodDk: '#4e3823',
  leaf:  '#57a066', petal: '#f386ad', petalHi: '#ffd3e4',
  paper: '#fbf6ea', card: '#ffffff',
  ink:   '#231a2c', inkSoft: '#7d7590',
  good:  '#6fc08a', bad: '#d0674f', accent: '#8fb6e8',
};

/* ───────── اندازه‌های نوری ─────────
   دستهٔ پرتو ۱۳ پرتوِ موازی است. آینهٔ خمیده کره‌ای است به شعاعِ
   ARC_R؛ کانونِ کرهٔ آینه‌ای دقیقاً نصفِ شعاع است.                */

const NRAY = 13;
const BEAMW = 80;                    /* پهنای دستهٔ پرتو */
const SPACING = BEAMW / (NRAY - 1);
const MIRROR_LEN = 190;              /* درازای آینهٔ تخت */
const ARC_R = 300;                   /* شعاعِ آینهٔ خمیده */
const ARC_TH = .42;                  /* نیم‌زاویهٔ کمان */
const FOCUS = ARC_R / 2;             /* کانون */
const MAXB = 14;                     /* بیشترین بازتاب */
const EPS = .02;

const RX0 = 24, RY0 = 88, RX1 = 916, RY1 = 736;
const TRAY = { x: 932, y: RY0, w: 244, h: RY1 - RY0 };

const NEED = { gol: 1, shame: 10 };
const CATCH = { gol: 22, shame: 24 };

const KINDS = {
  flat:    { n: 'آینهٔ تخت' },
  concave: { n: 'آینهٔ فرورفته' },
  convex:  { n: 'آینهٔ برآمده' },
};

const LEVELS = [
  { name: 'راهِ نور',
    src: [{ x: RX0, y: 180, ang: 0 }],
    walls: [],
    targets: [{ x: 700, y: 600, k: 'gol' }],
    tools: ['flat'] },

  { name: 'راهرو',
    src: [{ x: RX0, y: 640, ang: 0 }],
    walls: [{ x0: 400, y0: 500, x1: RX1, y1: 500 },
            { x0: RX0, y0: 280, x1: 560, y1: 280 }],
    targets: [{ x: 700, y: 170, k: 'gol' }],
    boy: { x: 860, y: 690 },
    tools: ['flat', 'flat', 'flat'] },

  { name: 'شمعِ سرد',
    src: [{ x: RX0, y: 400, ang: 0 }],
    walls: [],
    targets: [{ x: 663, y: 482, k: 'shame' }],
    tools: ['flat', 'concave'] },

  { name: 'سه گل',
    src: [{ x: RX0, y: 200, ang: 0 }],
    walls: [],
    targets: [{ x: 570, y: 616, k: 'gol' },
              { x: 700, y: 616, k: 'gol' },
              { x: 830, y: 616, k: 'gol' }],
    tools: ['flat', 'convex'] },

  { name: 'شمع و گل',
    src: [{ x: RX0, y: 180, ang: 0 }, { x: 300, y: RY0, ang: Math.PI / 2 }],
    walls: [],
    targets: [{ x: 683, y: 262, k: 'shame' },
              { x: 850, y: 360, k: 'gol' },
              { x: 850, y: 500, k: 'gol' },
              { x: 850, y: 640, k: 'gol' }],
    tools: ['flat', 'concave', 'convex'] },

  { name: 'اتاقِ روشن',
    src: [{ x: RX0, y: 470, ang: 0 }, { x: 700, y: RY0, ang: Math.PI / 2 }],
    walls: [{ x0: 800, y0: 300, x1: 800, y1: 560 }],
    targets: [{ x: 332, y: 277, k: 'shame' },
              { x: 340, y: 616, k: 'gol' },
              { x: 480, y: 616, k: 'gol' },
              { x: 620, y: 616, k: 'gol' }],
    tools: ['flat', 'flat', 'concave', 'convex'] },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  level: 0, score: 0, best: 0,
  items: [],                 /* آینه‌ها: {kind,x,y,ang,placed} */
  drag: null,                /* {i, mode:'move'|'rot', dx, dy, moved} */
  trace: { paths: [], hits: [] },
  lit: [],                   /* روشناییِ نرمِ هر هدف ۰..۱ */
  holdT: 0, won: false, winT: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const L = () => LEVELS[Math.min(S.level, LEVELS.length - 1)];
function tip(msg) { S.tip = msg; S.tipT = 3.4; }

function loadLevel(i) {
  S.level = i;
  const lv = LEVELS[i];
  S.items = lv.tools.map((k) => ({
    kind: k, x: 0, y: 0,
    ang: k === 'flat' ? Math.PI * .75 : Math.PI,
    placed: false,
  }));
  S.drag = null;
  S.lit = lv.targets.map(() => 0);
  S.holdT = 0; S.won = false; S.winT = 0;
  retrace();
}

function startLevel(i, keep) {
  S.phase = 'play'; S.phaseT = 0;
  if (!keep) S.score = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  loadLevel(i);
}

/* ───────── هندسه ─────────
   همه‌چیز با برخوردِ پرتو با پاره‌خط، کمان و دایره حساب می‌شود.  */

/** برخوردِ پرتو (o,d) با پاره‌خطِ a→b؛ فاصله یا −۱. */
function hitSeg(o, d, ax, ay, bx, by) {
  const ex = bx - ax, ey = by - ay;
  const den = d.x * ey - d.y * ex;
  if (Math.abs(den) < 1e-9) return -1;
  const t = ((ax - o.x) * ey - (ay - o.y) * ex) / den;
  const u = ((ax - o.x) * d.y - (ay - o.y) * d.x) / den;
  if (t <= EPS || u < 0 || u > 1) return -1;
  return t;
}

/** برخورد با دایره — برای هدف‌ها. */
function hitCircle(o, d, cx, cy, r) {
  const mx = o.x - cx, my = o.y - cy;
  const b = 2 * (d.x * mx + d.y * my);
  const c = mx * mx + my * my - r * r;
  const disc = b * b - 4 * c;
  if (disc < 0) return -1;
  const sq = Math.sqrt(disc);
  const t1 = (-b - sq) / 2, t2 = (-b + sq) / 2;
  if (t1 > EPS) return t1;
  if (t2 > EPS) return t2;
  return -1;
}

/** بدنهٔ آینهٔ تخت: دو سرِ آن. */
function flatEnds(m) {
  const dx = -Math.sin(m.ang), dy = Math.cos(m.ang);   /* راستای خودِ آینه */
  const h = MIRROR_LEN / 2;
  return { ax: m.x - dx * h, ay: m.y - dy * h, bx: m.x + dx * h, by: m.y + dy * h, dx, dy };
}

/** آینهٔ خمیده: مرکزِ کره و راستایش.
    فرورفته → مرکزِ کره جلوی آینه است؛ برآمده → پشتِ آن.            */
function arcGeom(m) {
  const fx = Math.cos(m.ang), fy = Math.sin(m.ang);
  const sgn = m.kind === 'concave' ? 1 : -1;
  const cx = m.x + fx * ARC_R * sgn, cy = m.y + fy * ARC_R * sgn;
  return { cx, cy, sgn, fx, fy, aC: Math.atan2(m.y - cy, m.x - cx) };
}

const wrapPi = (a) => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };

/** برخورد با آینهٔ خمیده. برمی‌گرداند {t, nx, ny, back}. */
function hitArc(o, d, m) {
  const g = arcGeom(m);
  const mx = o.x - g.cx, my = o.y - g.cy;
  const b = 2 * (d.x * mx + d.y * my);
  const c = mx * mx + my * my - ARC_R * ARC_R;
  const disc = b * b - 4 * c;
  if (disc < 0) return null;
  const sq = Math.sqrt(disc);
  for (const t of [(-b - sq) / 2, (-b + sq) / 2]) {
    if (t <= EPS) continue;
    const px = o.x + d.x * t, py = o.y + d.y * t;
    const a = Math.atan2(py - g.cy, px - g.cx);
    if (Math.abs(wrapPi(a - g.aC)) > ARC_TH) continue;
    /* بردارِ عمود بر سطح، رو به سمتِ آینه‌کاری‌شده */
    const nx = (px - g.cx) / ARC_R * -g.sgn, ny = (py - g.cy) / ARC_R * -g.sgn;
    return { t, nx, ny, back: d.x * nx + d.y * ny > 0 };
  }
  return null;
}

function reflect(d, nx, ny) {
  const k = 2 * (d.x * nx + d.y * ny);
  return { x: d.x - k * nx, y: d.y - k * ny };
}

/** نزدیک‌ترین برخوردِ پرتو با هرچه در اتاق است. */
function nearest(o, d) {
  let best = null;
  const put = (t, kind, extra) => {
    if (t < 0 || (best && t >= best.t)) return;
    best = Object.assign({ t, kind }, extra);
  };
  /* دیوارهای اتاق */
  put(hitSeg(o, d, RX0, RY0, RX1, RY0), 'wall');
  put(hitSeg(o, d, RX1, RY0, RX1, RY1), 'wall');
  put(hitSeg(o, d, RX1, RY1, RX0, RY1), 'wall');
  put(hitSeg(o, d, RX0, RY1, RX0, RY0), 'wall');
  for (const w of L().walls) put(hitSeg(o, d, w.x0, w.y0, w.x1, w.y1), 'wall');
  /* هدف‌ها */
  L().targets.forEach((g, i) => put(hitCircle(o, d, g.x, g.y, CATCH[g.k]), 'target', { i }));
  /* آینه‌ها */
  for (const m of S.items) {
    if (!m.placed) continue;
    if (m.kind === 'flat') {
      const e = flatEnds(m);
      const t = hitSeg(o, d, e.ax, e.ay, e.bx, e.by);
      if (t < 0) continue;
      let nx = Math.cos(m.ang), ny = Math.sin(m.ang);
      if (d.x * nx + d.y * ny > 0) { nx = -nx; ny = -ny; }   /* هر دو رو آینه است */
      put(t, 'mirror', { nx, ny });
    } else {
      const h = hitArc(o, d, m);
      if (!h) continue;
      put(h.t, h.back ? 'wall' : 'mirror', { nx: h.nx, ny: h.ny });
    }
  }
  return best;
}

/** همهٔ پرتوها را دنبال می‌کند و می‌گوید به هر هدف چند پرتو رسیده. */
function retrace() {
  const paths = [], hits = L().targets.map(() => 0);
  for (const s of L().src) {
    const dx = Math.cos(s.ang), dy = Math.sin(s.ang);
    const px = -dy, py = dx;
    for (let i = 0; i < NRAY; i++) {
      const off = (i - (NRAY - 1) / 2) * SPACING;
      let o = { x: s.x + px * off, y: s.y + py * off };
      let d = { x: dx, y: dy };
      const pts = [o];
      for (let b = 0; b < MAXB; b++) {
        const h = nearest(o, d);
        if (!h) { pts.push({ x: o.x + d.x * 2400, y: o.y + d.y * 2400 }); break; }
        const p = { x: o.x + d.x * h.t, y: o.y + d.y * h.t };
        pts.push(p);
        if (h.kind === 'target') { hits[h.i]++; break; }
        if (h.kind === 'wall') break;
        d = reflect(d, h.nx, h.ny);
        o = { x: p.x + d.x * .05, y: p.y + d.y * .05 };
      }
      paths.push(pts);
    }
  }
  S.trace = { paths, hits };
  return hits;
}

const allLit = () => L().targets.every((g, i) => S.trace.hits[i] >= NEED[g.k]);

/** آیا از این هدف، نور بی‌مانع به چشمِ پسرک می‌رسد؟ */
const BOY0 = { x: 130, y: 668 };
const boyAt = () => L().boy || BOY0;
function seenByBoy(g) {
  const BOY = boyAt();
  const dx = BOY.x - g.x, dy = BOY.y - 26 - g.y;
  const len = Math.hypot(dx, dy);
  const d = { x: dx / len, y: dy / len };
  const o = { x: g.x, y: g.y };
  for (const w of L().walls) {
    const t = hitSeg(o, d, w.x0, w.y0, w.x1, w.y1);
    if (t > 0 && t < len) return false;
  }
  return true;
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.tut.on) S.tut.t += dt;

  L().targets.forEach((g, i) => {
    const on = S.trace.hits[i] >= NEED[g.k] ? 1 : 0;
    S.lit[i] = lerp(S.lit[i], on, clamp(dt * (on ? 5 : 8), 0, 1));
  });

  if (!S.won && S.phase === 'play') {
    if (allLit() && !S.drag) {
      S.holdT += dt;
      if (S.holdT > .4) {
        S.won = true; S.winT = .001;
        S.score += 120 + S.level * 30;
        if (S.score > S.best) S.best = S.score;
        sfx.win();
        for (const g of L().targets) bits.confetti(g.x, g.y - 20, 18, [P.gold, P.warm, P.petalHi, '#fff']);
      }
    } else S.holdT = 0;
  }
  if (S.winT) {
    S.winT += dt;
    if (S.winT > 2.3) {
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

/* ───────── جای‌ها ───────── */

const BTN_CLEAR = { x: TRAY.x + 20, y: TRAY.y + TRAY.h - 74, w: TRAY.w - 40, h: 58 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 476, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };

function slotRect(i) {
  return { x: TRAY.x + 20, y: TRAY.y + 66 + i * 104, w: TRAY.w - 40, h: 90 };
}
/** دستهٔ گِردِ چرخاندن، روی سمتِ آینه‌ایِ آینه. */
function knobOf(m) {
  return { x: m.x + Math.cos(m.ang) * 60, y: m.y + Math.sin(m.ang) * 60, r: 17 };
}

/** فاصلهٔ نقطه تا بدنهٔ آینه. */
function distToBody(p, m) {
  if (m.kind === 'flat') {
    const e = flatEnds(m);
    const vx = e.bx - e.ax, vy = e.by - e.ay;
    const t = clamp(((p.x - e.ax) * vx + (p.y - e.ay) * vy) / (vx * vx + vy * vy), 0, 1);
    return Math.hypot(p.x - (e.ax + vx * t), p.y - (e.ay + vy * t));
  }
  const g = arcGeom(m);
  const a = Math.atan2(p.y - g.cy, p.x - g.cx);
  if (Math.abs(wrapPi(a - g.aC)) > ARC_TH + .12) return 1e9;
  return Math.abs(Math.hypot(p.x - g.cx, p.y - g.cy) - ARC_R);
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 1, 2], TUT_LAST = 2;
const SNAP = Math.PI / 36;    /* پنج درجه */

function placeAt(m, p) {
  m.x = clamp(p.x, RX0 + 34, RX1 - 34);
  m.y = clamp(p.y, RY0 + 34, RY1 - 34);
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.drag) {
    const m = S.items[S.drag.i];
    if (S.drag.mode === 'rot') {
      let a = Math.atan2(p.y - m.y, p.x - m.x);
      m.ang = Math.round(a / SNAP) * SNAP;
    } else {
      m.x = p.x + S.drag.dx; m.y = p.y + S.drag.dy;
      if (p.x < TRAY.x) placeAt(m, { x: m.x, y: m.y });
    }
    S.drag.moved = true;
    retrace();
    return;
  }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    if (inRect(p, BTN_CLEAR)) S.hover = { k: 'clear' };
    S.items.forEach((m, i) => {
      if (!m.placed) { if (inRect(p, slotRect(i))) S.hover = { k: 'slot', i }; return; }
      if (inCircle(p, knobOf(m), 6)) S.hover = { k: 'rot', i };
      else if (distToBody(p, m) < 26) S.hover = { k: 'body', i };
    });
  }
  cv.style.cursor = S.hover ? (S.hover.k === 'rot' ? 'grab' : 'pointer') : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startLevel(0); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.score = 0; loadLevel(0); sfx.tap(); }
    return;
  }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (S.winT) return;
  if (inRect(p, BTN_CLEAR)) {
    for (const m of S.items) m.placed = false;
    S.drag = null; retrace(); sfx.tap();
    return;
  }
  /* آینهٔ گذاشته‌شده: اوّل دسته، بعد بدنه */
  for (let i = S.items.length - 1; i >= 0; i--) {
    const m = S.items[i];
    if (!m.placed) continue;
    if (inCircle(p, knobOf(m), 8)) {
      S.drag = { i, mode: 'rot', dx: 0, dy: 0, moved: false };
      try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
      sfx.tap();
      return;
    }
  }
  for (let i = S.items.length - 1; i >= 0; i--) {
    const m = S.items[i];
    if (!m.placed) continue;
    if (distToBody(p, m) < 26) {
      S.drag = { i, mode: 'move', dx: m.x - p.x, dy: m.y - p.y, moved: false };
      try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
      sfx.tap();
      return;
    }
  }
  /* برداشتن از قفسه */
  for (let i = 0; i < S.items.length; i++) {
    const m = S.items[i];
    if (m.placed || !inRect(p, slotRect(i))) continue;
    m.placed = true;
    placeAt(m, { x: Math.min(p.x, RX1 - 120), y: p.y });
    S.drag = { i, mode: 'move', dx: 0, dy: 0, moved: false };
    try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
    sfx.place();
    retrace();
    if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
    return;
  }
});

function release() {
  if (!S.drag) return;
  const m = S.items[S.drag.i];
  if (S.drag.mode === 'move') {
    if (m.x > TRAY.x - 20) { m.placed = false; sfx.pop(); }
    else placeAt(m, { x: m.x, y: m.y });
  }
  S.drag = null;
  retrace();
}
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

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
  ctx.fillStyle = `rgba(6, 10, 18, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 246, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '4, 8, 16');
  ctx.fillStyle = P.warm;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6a637c' }); yy += 30; }
  return h + 20;
}

/* ───────── نقاشیِ اتاق ───────── */

function paintBackStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.nightHi); g.addColorStop(1, P.nightLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* کفِ اتاق و دیوارِ پشتی */
  ctx.fillStyle = P.wallDk;
  ctx.fillRect(RX0, RY0, RX1 - RX0, RY1 - RY0);
  ctx.save();
  ctx.beginPath(); ctx.rect(RX0, RY0, RX1 - RX0, RY1 - RY0); ctx.clip();
  ctx.fillStyle = P.wall;
  ctx.fillRect(RX0, RY0, RX1 - RX0, RY1 - RY0);
  ctx.globalAlpha = .3;
  ctx.fillStyle = texCloth(P.wall, '#171122');
  ctx.fillRect(RX0, RY0, RX1 - RX0, RY1 - RY0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = vgrad(RY0, RY1, 'rgba(140,160,220,.05)', 'rgba(0,0,0,.62)');
  ctx.fillRect(RX0, RY0, RX1 - RX0, RY1 - RY0);
  /* گوشه‌های اتاق تاریک‌تر — تا نور جلوه کند */
  const rg = ctx.createRadialGradient((RX0+RX1)/2, (RY0+RY1)/2, 120,
                                      (RX0+RX1)/2, (RY0+RY1)/2, 560);
  rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.5)');
  ctx.fillStyle = rg;
  ctx.fillRect(RX0, RY0, RX1 - RX0, RY1 - RY0);
  /* کف */
  ctx.fillStyle = P.floor;
  ctx.fillRect(RX0, RY1 - 66, RX1 - RX0, 66);
  ctx.fillStyle = 'rgba(255,255,255,.05)';
  ctx.fillRect(RX0, RY1 - 66, RX1 - RX0, 3);
  ctx.restore();

  /* قابِ اتاق */
  ctx.strokeStyle = '#0a0f18'; ctx.lineWidth = 8;
  ctx.strokeRect(RX0, RY0, RX1 - RX0, RY1 - RY0);

  /* تختهٔ کنار */
  ctx.fillStyle = '#1a2130';
  ctx.beginPath(); rrPath(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(143,182,232,.22)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 16); ctx.stroke();
}

function drawWalls() {
  for (const w of L().walls) {
    const hz = Math.abs(w.y1 - w.y0) < 1;
    const x = Math.min(w.x0, w.x1), y = Math.min(w.y0, w.y1);
    const ww = hz ? Math.abs(w.x1 - w.x0) : 20, hh = hz ? 20 : Math.abs(w.y1 - w.y0);
    const bx = hz ? x : x - 10, by = hz ? y - 10 : y;
    withShadow(18, 6, .5, () => {
      ctx.fillStyle = P.woodDk;
      ctx.beginPath(); rrPath(bx, by, ww, hh, 7); ctx.fill();
    }, '0, 0, 0');
    ctx.save();
    ctx.beginPath(); rrPath(bx, by, ww, hh, 7); ctx.clip();
    ctx.fillStyle = texWood(P.wood, '#3a2717');
    ctx.fillRect(bx, by, ww, hh);
    ctx.fillStyle = 'rgba(0,0,0,.42)';
    ctx.fillRect(bx, by, ww, hh);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,220,170,.14)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); rrPath(bx, by, ww, hh, 7); ctx.stroke();
  }
}

function drawSources() {
  for (const s of L().src) {
    const horiz = Math.abs(Math.cos(s.ang)) > .5;
    const w = horiz ? 26 : BEAMW + 34, h = horiz ? BEAMW + 34 : 26;
    const x = s.x - (horiz ? (Math.cos(s.ang) > 0 ? 4 : w - 4) : w / 2);
    const y = s.y - (horiz ? h / 2 : (Math.sin(s.ang) > 0 ? 4 : h - 4));
    ctx.fillStyle = '#2b2338';
    ctx.beginPath(); rrPath(x - 6, y - 6, w + 12, h + 12, 8); ctx.fill();
    /* پنجرهٔ نور */
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#fff3d0'); g.addColorStop(1, P.warm);
    ctx.fillStyle = g;
    ctx.beginPath(); rrPath(x, y, w, h, 5); ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gg = ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, 120);
    gg.addColorStop(0, 'rgba(255, 210, 122, .5)');
    gg.addColorStop(1, 'rgba(255, 210, 122, 0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(s.x, s.y, 120, 0, TAU); ctx.fill();
    ctx.restore();
    /* میله‌های پنجره */
    ctx.strokeStyle = 'rgba(60,40,20,.5)'; ctx.lineWidth = 3;
    for (let k = 1; k < 4; k++) {
      ctx.beginPath();
      if (horiz) { ctx.moveTo(x, y + h * k / 4); ctx.lineTo(x + w, y + h * k / 4); }
      else { ctx.moveTo(x + w * k / 4, y); ctx.lineTo(x + w * k / 4, y + h); }
      ctx.stroke();
    }
  }
}

function drawBeams() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const passes = QUALITY >= 2 ? [[13, 'rgba(255, 190, 96, .045)'], [4.4, 'rgba(255, 214, 140, .10)'], [1.5, 'rgba(255, 246, 224, .3)']]
                              : [[6, 'rgba(255, 200, 110, .09)'], [1.6, 'rgba(255, 246, 224, .3)']];
  for (const [w, col] of passes) {
    ctx.lineWidth = w; ctx.strokeStyle = col;
    ctx.beginPath();
    for (const pts of S.trace.paths) {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/* ───────── آینه‌ها ───────── */

function drawFlat(m, hot) {
  const e = flatEnds(m);
  const nx = Math.cos(m.ang), ny = Math.sin(m.ang);
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(Math.atan2(e.dy, e.dx));
  const h = MIRROR_LEN / 2;
  /* قابِ چوبی */
  withShadow(16, 5, .5, () => {
    ctx.fillStyle = P.woodDk;
    ctx.beginPath(); rrPath(-h - 8, -11, MIRROR_LEN + 16, 22, 8); ctx.fill();
  }, '0, 0, 0');
  /* شیشهٔ آینه */
  const g = ctx.createLinearGradient(0, -7, 0, 7);
  g.addColorStop(0, P.silver); g.addColorStop(.5, '#b9c8dc'); g.addColorStop(1, P.silverLo);
  ctx.fillStyle = g;
  ctx.beginPath(); rrPath(-h, -7, MIRROR_LEN, 14, 5); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.fillRect(-h + 6, -5.5, MIRROR_LEN - 12, 2.2);
  if (hot) {
    ctx.strokeStyle = 'rgba(255, 214, 140, .9)'; ctx.lineWidth = 2.4;
    ctx.beginPath(); rrPath(-h - 8, -11, MIRROR_LEN + 16, 22, 8); ctx.stroke();
  }
  ctx.restore();
  drawKnob(m, hot, nx, ny);
}

function arcPath(m, off) {
  const g = arcGeom(m);
  ctx.beginPath();
  ctx.arc(g.cx, g.cy, ARC_R + off, g.aC - ARC_TH, g.aC + ARC_TH);
}

function drawCurved(m, hot) {
  const g = arcGeom(m);
  /* پشتِ آینه: تیره و مات */
  ctx.save();
  ctx.lineCap = 'round';
  withShadow(16, 5, .5, () => {
    ctx.strokeStyle = P.woodDk; ctx.lineWidth = 20;
    arcPath(m, g.sgn * 7); ctx.stroke();
  }, '0, 0, 0');
  /* رویهٔ آینه‌ای */
  const lin = ctx.createLinearGradient(g.cx, g.cy, m.x, m.y);
  lin.addColorStop(0, P.silver); lin.addColorStop(1, '#9fb0c6');
  ctx.strokeStyle = lin; ctx.lineWidth = 11;
  arcPath(m, 0); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2.4;
  arcPath(m, -g.sgn * 3.4); ctx.stroke();
  if (hot) {
    ctx.strokeStyle = 'rgba(255, 214, 140, .85)'; ctx.lineWidth = 3;
    arcPath(m, -g.sgn * 16); ctx.stroke();
  }
  ctx.restore();
  drawKnob(m, hot, Math.cos(m.ang), Math.sin(m.ang));
}

function drawKnob(m, hot, nx, ny) {
  const k = knobOf(m);
  ctx.strokeStyle = 'rgba(228, 237, 247, .35)'; ctx.lineWidth = 2.4;
  ctx.setLineDash([5, 5]);
  ctx.beginPath(); ctx.moveTo(m.x + nx * 14, m.y + ny * 14); ctx.lineTo(k.x, k.y); ctx.stroke();
  ctx.setLineDash([]);
  withShadow(10, 4, .5, () => {
    ctx.fillStyle = hot ? P.gold : '#c3d2e4';
    wobbleCircle(k.x, k.y, k.r, k.x, 1.2); ctx.fill();
  }, '0, 0, 0');
  ctx.strokeStyle = 'rgba(40,30,60,.5)'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const a = m.ang + Math.PI / 2 + i * TAU / 3;
    ctx.beginPath();
    ctx.moveTo(k.x + Math.cos(a) * 5, k.y + Math.sin(a) * 5);
    ctx.lineTo(k.x + Math.cos(a) * 10, k.y + Math.sin(a) * 10);
    ctx.stroke();
  }
}

function drawMirrors() {
  S.items.forEach((m, i) => {
    if (!m.placed) return;
    const hot = (S.drag && S.drag.i === i) || (S.hover && S.hover.i === i);
    if (m.kind === 'flat') drawFlat(m, hot); else drawCurved(m, hot);
  });
}

/* ───────── هدف‌ها ───────── */

const FLOOR_Y = RY1 - 66;
function drawFlower(g, lit) {
  const x = g.x, y = g.y;
  if (y + 96 < FLOOR_Y + 8) {          /* گلدانِ روی تاقچه */
    ctx.fillStyle = P.woodDk;
    ctx.beginPath(); rrPath(x - 40, y + 94, 80, 12, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,170,.10)';
    ctx.beginPath(); rrPath(x - 40, y + 94, 80, 3, 2); ctx.fill();
  }
  const grow = .55 + .45 * lit;
  ctx.strokeStyle = lit > .2 ? P.leaf : '#2f3a44';
  ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y + 74); ctx.quadraticCurveTo(x + 8 * lit, y + 40, x, y + 12); ctx.stroke();
  /* گلدان */
  ctx.fillStyle = lit > .2 ? '#a8623f' : '#2e2733';
  ctx.beginPath();
  ctx.moveTo(x - 24, y + 60); ctx.lineTo(x + 24, y + 60);
  ctx.lineTo(x + 18, y + 96); ctx.lineTo(x - 18, y + 96);
  ctx.closePath(); ctx.fill();
  /* برگ */
  ctx.fillStyle = lit > .2 ? shade(P.leaf, -.15) : '#28313b';
  wobbleEllipse(x + 22, y + 42, 20, 9, -.5, 7, 1.4); ctx.fill();
  /* گلبرگ */
  const petals = 6;
  for (let i = 0; i < petals; i++) {
    const a = -Math.PI / 2 + i * TAU / petals + lit * .2;
    ctx.fillStyle = lit > .2 ? P.petal : '#39303f';
    wobbleEllipse(x + Math.cos(a) * 18 * grow, y + Math.sin(a) * 18 * grow,
      15 * grow, 11 * grow, a, i * 3, 1.4);
    ctx.fill();
  }
  ctx.fillStyle = lit > .2 ? P.gold : '#463b4d';
  wobbleCircle(x, y, 11 * grow, 3, 1.2); ctx.fill();
  if (lit > .05) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gg = ctx.createRadialGradient(x, y, 4, x, y, 96);
    gg.addColorStop(0, `rgba(255, 214, 140, ${.34 * lit})`);
    gg.addColorStop(1, 'rgba(255, 214, 140, 0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(x, y, 96, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function drawCandle(g, lit, hits) {
  const x = g.x, y = g.y;
  const k = clamp(hits / NEED.shame, 0, 1);
  /* نعلبکی */
  ctx.fillStyle = lit > .2 ? '#b9c3d2' : '#2c2635';
  wobbleEllipse(x, y + 62, 34, 10, 0, 5, 1.2); ctx.fill();
  /* بدنهٔ شمع */
  const cg = ctx.createLinearGradient(x - 16, 0, x + 16, 0);
  cg.addColorStop(0, lit > .2 ? '#fff0cf' : '#3b3346');
  cg.addColorStop(1, lit > .2 ? '#e0c390' : '#2a2434');
  ctx.fillStyle = cg;
  ctx.beginPath(); rrPath(x - 16, y - 4, 32, 66, 6); ctx.fill();
  /* فتیله */
  ctx.strokeStyle = '#3a2f28'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y - 16); ctx.stroke();
  /* حلقهٔ نورِ جمع‌شده — پُر شدنش یعنی نور بیشتر */
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(228, 237, 247, .18)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x, y - 8, 40, -Math.PI * .5 - 2.2, -Math.PI * .5 + 2.2); ctx.stroke();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x, y - 8, 40, -Math.PI * .5 - 2.2, -Math.PI * .5 - 2.2 + 4.4 * k); ctx.stroke();
  ctx.restore();
  /* شعله */
  if (lit > .05) {
    const fl = lit * (1 + Math.sin(S.t * 9) * .07);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gg = ctx.createRadialGradient(x, y - 30, 3, x, y - 30, 150 * lit);
    gg.addColorStop(0, 'rgba(255, 226, 160, .55)');
    gg.addColorStop(1, 'rgba(255, 180, 74, 0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(x, y - 30, 150 * lit, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = P.warm;
    wobbleEllipse(x, y - 30, 12 * fl, 22 * fl, 0, 11, 1.6); ctx.fill();
    ctx.fillStyle = '#fff6dc';
    wobbleEllipse(x, y - 26, 6 * fl, 12 * fl, 0, 13, 1.2); ctx.fill();
  }
}

function drawTargets() {
  L().targets.forEach((g, i) => {
    const lit = S.lit[i];
    if (g.k === 'gol') drawFlower(g, lit); else drawCandle(g, lit, S.trace.hits[i]);
  });
}

/** خطِ نورِ بازتاب‌شده از جسمِ روشن به چشمِ پسرک. */
function drawSight() {
  ctx.save();
  ctx.setLineDash([3, 9]);
  ctx.lineWidth = 2;
  L().targets.forEach((g, i) => {
    if (S.lit[i] < .5 || !seenByBoy(g)) return;
    ctx.strokeStyle = `rgba(255, 214, 140, ${.30 * S.lit[i]})`;
    ctx.lineDashOffset = -S.t * 34;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y); ctx.lineTo(boyAt().x, boyAt().y - 26);
    ctx.stroke();
  });
  ctx.restore();
}

function drawBoy() {
  const seen = L().targets.filter((g, i) => S.lit[i] > .5 && seenByBoy(g)).length;
  const glow = clamp(seen / Math.max(1, L().targets.length), 0, 1);
  const x = boyAt().x, y = boyAt().y;
  contact(x, y + 44, 42, 12, .5);
  /* تن */
  ctx.fillStyle = glow > .1 ? '#4d6f9c' : '#333d54';
  wobbleEllipse(x, y + 16, 30, 32, 0, 21, 1.6); ctx.fill();
  /* سر */
  ctx.fillStyle = glow > .1 ? '#e8b98e' : '#3d3d4f';
  wobbleCircle(x, y - 26, 27, 23, 1.4); ctx.fill();
  /* مو */
  ctx.fillStyle = glow > .1 ? '#3a2a20' : '#272a3a';
  ctx.beginPath();
  ctx.arc(x, y - 32, 27, Math.PI * 1.05, Math.PI * 2.0);
  ctx.closePath(); ctx.fill();
  /* چشم‌ها: در تاریکی بسته و کم‌جان، با نور باز و برّاق */
  const o = .3 + .7 * glow;
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#fdf6ea';
    ctx.beginPath(); ctx.ellipse(x + s * 10, y - 24, 7, 7 * o, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2a2233';
    ctx.beginPath(); ctx.arc(x + s * 10, y - 24, 3.6 * o + .8, 0, TAU); ctx.fill();
    if (glow > .3) {
      ctx.fillStyle = P.gold;
      ctx.beginPath(); ctx.arc(x + s * 10 + 1.6, y - 25.6, 1.5, 0, TAU); ctx.fill();
    }
  }
  /* لبخند وقتی همه را می‌بیند */
  ctx.strokeStyle = glow > .1 ? '#8a5a44' : '#333a4a';
  ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y - 12, 9, .25 + (1 - glow) * .5, Math.PI - .25 - (1 - glow) * .5);
  ctx.stroke();
}

/* ───────── قفسهٔ آینه‌ها ───────── */

function mirrorIcon(kind, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  if (kind === 'flat') {
    ctx.fillStyle = P.woodDk;
    ctx.beginPath(); rrPath(-46, -9, 92, 18, 7); ctx.fill();
    const g = ctx.createLinearGradient(0, -6, 0, 6);
    g.addColorStop(0, P.silver); g.addColorStop(1, P.silverLo);
    ctx.fillStyle = g;
    ctx.beginPath(); rrPath(-42, -6, 84, 12, 4); ctx.fill();
  } else {
    /* فرورفته را مثل کاسه («⌣») و برآمده را مثل گنبد («⌢») می‌کشیم؛
       در هر دو، رویهٔ آینه‌ای رو به بالاست و تفاوت در خمِ آن است. */
    const sgn = kind === 'concave' ? 1 : -1;
    const R = 96, cy = -sgn * R, hw = 46;
    const a0 = Math.atan2(-cy, -hw), a1 = Math.atan2(-cy, hw);
    const lo = Math.min(a0, a1), hi = Math.max(a0, a1);
    ctx.strokeStyle = P.woodDk; ctx.lineWidth = 15;
    ctx.beginPath(); ctx.arc(0, cy, R + sgn * 6, lo, hi); ctx.stroke();
    ctx.strokeStyle = P.silver; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(0, cy, R, lo, hi); ctx.stroke();
  }
  ctx.restore();
}

function drawTray() {
  text('آینه‌ها', TRAY.x + TRAY.w / 2, TRAY.y + 36, { size: 24, family: 'Lalezar', color: P.gold });
  S.items.forEach((m, i) => {
    const r = slotRect(i);
    const hot = S.hover && S.hover.k === 'slot' && S.hover.i === i;
    ctx.fillStyle = m.placed ? 'rgba(255,255,255,.03)' : (hot ? 'rgba(255, 214, 140, .16)' : 'rgba(255,255,255,.07)');
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 12); ctx.fill();
    ctx.strokeStyle = m.placed ? 'rgba(255,255,255,.08)' : 'rgba(228,237,247,.28)';
    ctx.lineWidth = 2;
    ctx.setLineDash(m.placed ? [6, 6] : []);
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 12); ctx.stroke();
    ctx.setLineDash([]);
    ctx.save();
    ctx.globalAlpha = m.placed ? .16 : 1;
    mirrorIcon(m.kind, r.x + r.w / 2, r.y + 34, .82);
    text(KINDS[m.kind].n, r.x + r.w / 2, r.y + 68, { size: 16, color: m.placed ? P.inkSoft : '#dbe6f4' });
    ctx.restore();
  });
  button(BTN_CLEAR, 'جمعش کن', {
    hot: S.hover && S.hover.k === 'clear', fill: '#3d4a63', hotFill: '#55668a', size: 21 });
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#0a0f18';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(255, 214, 140, .18)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 150, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  numText(fa(S.level + 1) + ' / ' + fa(LEVELS.length), 640, HUD_H / 2, { size: 21, color: P.gold });
  numText(fa(S.score), 300, HUD_H / 2, { size: 20, color: P.paper });
  text('بیشترین ' + fa(S.best), 150, HUD_H / 2, { size: 15, color: 'rgba(251,246,234,.6)' });
  const kk = clamp((S.level + (S.won ? 1 : 0)) / LEVELS.length, 0, 1);
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * kk, 5, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  const s0 = L().src[0];
  if (st === 0) {
    spot([{ x: s0.x - 10, y: s0.y - 70, w: 260, h: 140 }], .74);
    const h = tutCard(360, 380, 500, ['نور از پنجره می‌آید', 'و همیشه راست جلو می‌رود.'], 'اتاقِ تاریک');
    tutMore(610, 380 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: TRAY.x, y: TRAY.y, w: TRAY.w, h: 220 }], .72);
    const h = tutCard(300, 300, 520,
      ['آینه را از قفسه بکش توی اتاق.', 'با دستهٔ گِرد بچرخانش.']);
    tutMore(560, 300 + h + 8, S.t, P.ink);
  } else {
    const g = L().targets[0];
    spot([{ x: g.x - 70, y: g.y - 70, w: 140, h: 180 },
          { x: boyAt().x - 60, y: boyAt().y - 70, w: 120, h: 140 }], .7);
    const h = tutCard(300, 250, 520,
      ['هرچه نور به آن برسد،', 'نور را برمی‌گرداند و دیده می‌شود.']);
    tutMore(560, 250 + h + 8, S.t, P.ink);
  }
}

function lampIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 52);
  g.addColorStop(0, 'rgba(255, 214, 140, .8)');
  g.addColorStop(1, 'rgba(255, 214, 140, 0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 52, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = P.warm;
  wobbleCircle(0, 0, 17, 3, 1.4); ctx.fill();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = i * TAU / 8;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 24, Math.sin(a) * 24);
    ctx.lineTo(Math.cos(a) * 34, Math.sin(a) * 34);
    ctx.stroke();
  }
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 860, h: 306, y: 128,
    paper: P.paper, band: P.warm, ink: P.ink, inkSoft: '#6a637c',
    icon: lampIcon,
    title: 'اتاقِ تاریک',
    body: 'در تاریکی هیچ چیز دیده نمی‌شود. نور از پنجره می‌آید و راست جلو می‌رود.\nآینه‌ها را جوری بگذار و بچرخان که نور به چیزهای اتاق برسد.\nسه آینه داری و هرکدام کارِ خودش را می‌کند.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#b07a2e', btnHotFill: '#d29a45',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 800, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#6a637c',
    icon: lampIcon,
    title: 'اتاقِ روشن',
    body: 'نور را با آینه‌ها هرجا خواستی بردی؛ جمعش کردی و پخشش کردی.\nحالا همه‌چیزِ اتاق دیده می‌شود.\nامتیازت: ' + fa(S.score),
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#b07a2e', btnHotFill: '#d29a45',
  });
}

function draw() {
  beginScene(P.nightLo);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  const layer = staticLayer('back', SCENE_W, SCENE_H, paintBackStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.beginPath(); ctx.rect(RX0, RY0, RX1 - RX0, RY1 - RY0); ctx.clip();
  drawWalls();
  drawSources();
  drawBeams();
  drawSight();
  drawTargets();
  drawBoy();
  drawMirrors();
  bits.draw();
  ctx.restore();
  ctx.restore();
  drawTray();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 470;
    paper(RX0 + (RX1 - RX0) / 2 - w / 2, RY1 - 52, w, 42, P.paper, 51, 12, .3);
    text(S.tip, RX0 + (RX1 - RX0) / 2, RY1 - 31, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.08, 'rgba(4, 8, 16, .5)', 0, .1);
}

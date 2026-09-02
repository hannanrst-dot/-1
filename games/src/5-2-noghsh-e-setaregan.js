/*!
title: نقشِ ستارگان — خط، نیم‌خط، پاره‌خط
bg: #070d1c
*/

/* ═══════════════════════════════════════════════════════════════════════
   نقشِ ستارگان — ریاضی سوم، فصل ۵، درس ۲ (خط، نیم‌خط، پاره‌خط)
   ───────────────────────────────────────────────────────────────────────
   تفاوتِ این سه چیز فقط «تا کجا ادامه دارد» است. پس همین را کردیم فعلِ
   بازی: رشته را می‌کِشی و سرش را می‌گیری و بیرون می‌بری.

     • از یک ستارهٔ درخشان تا درخشانِ دیگر بکش  →  پاره‌خط (دو سر دارد)
     • یک سرش را بگیر و بکِش بیرون               →  نیم‌خط (یک سر دارد)
     • هر دو سرش را بکِش بیرون                   →  خط (هیچ سری ندارد)

   ستاره‌های کم‌نورِ سرِ راهِ رشته روشن می‌شوند. بعضی ستاره‌ها بینِ دو
   ستارهٔ درخشان‌اند (پاره‌خط بس است)، بعضی آن‌طرف‌ترند (نیم‌خط لازم است)
   و بعضی دو طرف پخش‌اند (خط لازم است). پس بچّه خودش کشف می‌کند که این
   سه تا کجایشان فرق دارد.

   نورِ شب محدود است: پاره‌خط یک قطره، نیم‌خط دو قطره، خط سه قطره.
   پس «تا هرجا که لازم است» ادامه بده، نه بیشتر. ماه هم دارد غروب می‌کند.

   هیچ‌جا نوشته نمی‌شود کدام رشته کجا باید باشد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const STEP = 58, OX = 112, OY = 152, GW = 17, GH = 8;
const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];
const COST = { seg: 1, ray: 2, line: 3 };

const P = {
  sky0: '#0a1430', sky1: '#0d1b3d', sky2: '#122447', deep: '#050a18',
  dim:  '#8496c6', dimCore: '#cbd8f5',
  bright: '#ffe9a8', brightHot: '#fffdf2',
  lit:  '#ffd98a', litHot: '#fff8dd',
  beam: '#8fd8ff', beamHot: '#d8f2ff',
  drop: '#7fe0ff', dropOff: 'rgba(120, 150, 190, .28)',
  moon: '#f6eed6', moonDk: '#d9cfae',
  hill: '#0b1226', hill2: '#080e1e',
  paper:'#eef3ff', ink: '#1b2440', inkSoft: '#7a88a8',
  good: '#6fbf8e', bad: '#e0705f', gold: '#f2c664',
};

const LEVELS = [
  { name: 'شبِ اوّل', plan: ['seg', 'seg'], slack: 2, time: 78, quota: 3,
    hint: 'از یک ستارهٔ درخشان به درخشانِ دیگر بکش.' },
  { name: 'پرتوِ ستاره', plan: ['seg', 'ray'], slack: 2, time: 76, quota: 3,
    hint: 'سرِ رشته را بگیر و بیرون بکِش تا بی‌انتها شود.' },
  { name: 'بی‌انتها', plan: ['seg', 'ray', 'line'], slack: 1, time: 74, quota: 4,
    hint: 'بعضی ستاره‌ها دو طرفِ رشته‌اند.' },
  { name: 'آسمانِ پُر', plan: ['ray', 'line', 'seg', 'ray'], slack: 1, time: 66, quota: 4,
    hint: 'نور کم است. هر رشته را فقط تا جایی که لازم است بکِش.' },
  { name: 'تا سپیده', plan: null, slack: 1, time: 66, endless: true,
    hint: 'تا ماه غروب نکرده، آسمان را روشن کن.' },
];

const HUD_H = 52;
const SKY = { x: 34, y: 84, w: 1132, h: 508 };
const BAR = { x: 34, y: 600, w: 1132, h: 112 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  stars: [], beams: [],
  budget: 0, spent: 0, planCost: 0, plan: [],
  moon: 0,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  drag: null, hoverA: -1,
  win: 0, shoot: null,
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const px = (c) => OX + c * STEP;
const py = (r) => OY + r * STEP;

function loadBest() { try { return +localStorage.getItem('setare-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('setare-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

/* ───────── ساختنِ آسمان ───────── */

function makeSky() {
  const lv = L();
  const plan = lv.plan || shuffleKinds();
  for (let attempt = 0; attempt < 60; attempt++) {
    const map = {}, stars = [];
    const add = (c, r, bright) => {
      const k = c + ',' + r;
      if (map[k]) { if (bright) map[k].bright = true; return; }
      const s = { c, r, bright: !!bright, lit: false, ph: Math.random() * TAU, pop: 0 };
      map[k] = s; stars.push(s);
    };
    let cost = 0, ok = true;
    const groups = [];
    for (const kind of plan) {
      const g = placeGroup(kind, map);
      if (!g) { ok = false; break; }
      for (const cell of g.cells) add(cell[0], cell[1], false);
      for (const i of g.anchors) add(g.cells[i][0], g.cells[i][1], true);
      cost += COST[kind];
      groups.push(g);
    }
    if (!ok) continue;
    const dim = stars.filter((s) => !s.bright).length;
    const anchors = stars.filter((s) => s.bright).length;
    if (dim < 4 || anchors < 4) continue;
    S.stars = stars;
    S.beams = [];
    /* راهِ حلِ مرجع — فقط برای اطمینان از شدنی بودن؛ هرگز به بازیکن نشان داده نمی‌شود. */
    S.plan = groups.map((g) => {
      const A = map[g.cells[g.anchors[0]].join(',')], B = map[g.cells[g.anchors[1]].join(',')];
      const ext = g.kind === 'seg' ? [false, false] : (g.kind === 'ray' ? [false, true] : [true, true]);
      return { a: A, b: B, ext };
    });
    S.planCost = cost;
    S.budget = cost + lv.slack;
    S.spent = 0;
    relight();
    if (S.stars.every((s) => s.lit)) continue;   // از اوّل حل باشد، بازی نیست
    return;
  }
  /* اگر جور نشد، ساده‌ترین آسمانِ ممکن */
  S.stars = [];
  for (let i = 0; i < 5; i++) S.stars.push({ c: 3 + i * 2, r: 3, bright: i === 0 || i === 4, lit: false, ph: i, pop: 0 });
  S.beams = []; S.planCost = 1; S.budget = 3; S.spent = 0;
  S.plan = [{ a: S.stars[0], b: S.stars[4], ext: [false, false] }];
  relight();
}

function shuffleKinds() {
  const pool = ['seg', 'ray', 'line', 'ray', 'seg'];
  const n = 3 + Math.floor(Math.random() * 2);
  const out = [];
  for (let i = 0; i < n; i++) out.push(pool[Math.floor(Math.random() * pool.length)]);
  return out;
}

/** یک رشتهٔ برنامه‌ریزی‌شده: کدام خانه‌ها ستاره‌اند و کدام‌ها درخشان. */
function placeGroup(kind, map) {
  for (let tries = 0; tries < 90; tries++) {
    const d = DIRS[Math.floor(Math.random() * DIRS.length)];
    const len = 4 + Math.floor(Math.random() * 4);              // ۴ تا ۷ ستاره
    const c0 = Math.floor(Math.random() * GW), r0 = Math.floor(Math.random() * GH);
    const cells = [];
    let fits = true;
    for (let i = 0; i < len; i++) {
      const c = c0 + d[0] * i, r = r0 + d[1] * i;
      if (c < 0 || r < 0 || c >= GW || r >= GH) { fits = false; break; }
      cells.push([c, r]);
    }
    if (!fits) continue;
    let anchors;
    if (kind === 'seg') anchors = [0, len - 1];                  // همه بینِ دو سر
    else if (kind === 'ray') anchors = [0, 1];                   // بقیه آن‌طرف‌ترند
    else {
      const m = Math.floor(len / 2) - 1;                          // دو طرفِ رشته ستاره هست
      if (m < 1 || m + 1 > len - 2) continue;
      anchors = [m, m + 1];
    }
    /* دو گروه نباید دقیقاً یک جفت لنگر داشته باشند */
    const key = cells[anchors[0]].join(',') + '|' + cells[anchors[1]].join(',');
    if (map['#' + key]) continue;
    map['#' + key] = 1;
    return { cells, anchors, kind };
  }
  return null;
}

/* ───────── نور ───────── */

/** آیا این ستاره روی این رشته است؟ حساب روی خانه‌ها، پس دقیق است. */
function onBeam(b, s) {
  const dx = b.b.c - b.a.c, dy = b.b.r - b.a.r;
  const ex = s.c - b.a.c, ey = s.r - b.a.r;
  if (dx * ey - dy * ex !== 0) return false;
  const t = dx ? ex / dx : ey / dy;
  if (b.ext[0] && b.ext[1]) return true;
  if (b.ext[1]) return t >= 0;
  if (b.ext[0]) return t <= 1;
  return t >= 0 && t <= 1;
}

function relight() {
  for (const s of S.stars) s.lit = s.bright;
  for (const b of S.beams) for (const s of S.stars) if (!s.lit && onBeam(b, s)) { s.lit = true; s.pop = .5; }
  for (const b of S.beams) for (const s of S.stars) if (onBeam(b, s)) s.lit = true;
}

const beamCost = (b) => 1 + (b.ext[0] ? 1 : 0) + (b.ext[1] ? 1 : 0);
const beamKind = (b) => (b.ext[0] && b.ext[1] ? 'خط' : (b.ext[0] || b.ext[1] ? 'نیم‌خط' : 'پاره‌خط'));
const spend = () => S.beams.reduce((a, b) => a + beamCost(b), 0);

function checkWin() {
  if (S.win || !S.stars.every((s) => s.lit)) return;
  S.win = .001;
  S.combo++;
  S.cleared++;
  const left = S.budget - spend();
  const pts = 300 + left * 180 + Math.min(S.combo, 6) * 70 + Math.round(S.moon * 0);
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  S.moon = Math.max(0, S.moon - .3);
  bits.confetti(SCENE_W / 2, 320, 50, [P.gold, P.beam, '#fff', P.bright]);
  sfx.win();
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 700; S.phase = 'won'; S.phaseT = 0; }
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.moon = 0;
  S.win = 0;
  if (!keep) S.score = 0;
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  makeSky();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  for (const s of S.stars) if (s.pop > 0) s.pop -= dt;
  if (S.win > 0) {
    S.win += dt;
    if (S.win > 1.8) { S.win = 0; makeSky(); }
  }
  if (S.phase === 'play' && !S.win) {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen) {
      S.moon += dt / L().time;
      if (S.moon >= 1) { S.moon = 1; S.phase = 'lost'; S.phaseT = 0; sfx.nope(); }
    }
    if (S.tut.on) S.tut.t += dt;
  }
  if (S.shoot) { S.shoot.t += dt; if (S.shoot.t > 1.2) S.shoot = null; }
  else if (Math.random() < dt * .18) {
    S.shoot = { t: 0, x: 200 + Math.random() * 800, y: 90 + Math.random() * 160,
                dx: 260 + Math.random() * 160, dy: 120 + Math.random() * 90 };
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── هندسه ───────── */

function unit(dx, dy) { const m = Math.hypot(dx, dy) || 1; return [dx / m, dy / m]; }

/** جایی که پرتو از کادرِ آسمان بیرون می‌زند. */
function rayExit(x, y, dx, dy) {
  let best = 1e9;
  const lim = [[SKY.x, 1, 0], [SKY.x + SKY.w, 1, 0], [SKY.y, 0, 1], [SKY.y + SKY.h, 0, 1]];
  for (const [v, ax] of lim.map((l) => [l[0], l[1]])) {
    const d = ax ? dx : dy, o = ax ? x : y;
    if (Math.abs(d) < 1e-6) continue;
    const t = (v - o) / d;
    if (t > .001 && t < best) best = t;
  }
  if (best > 1e8) best = 900;
  return { x: x + dx * best, y: y + dy * best, t: best };
}

/** دو سرِ رشته، هرجا که باشند. */
function tipPos(b, end) {
  const A = { x: px(b.a.c), y: py(b.a.r) }, B = { x: px(b.b.c), y: py(b.b.r) };
  const [ux, uy] = unit(B.x - A.x, B.y - A.y);
  const base = end ? B : A;
  const dir = end ? 1 : -1;
  if (!b.ext[end]) return { x: base.x, y: base.y, ux: ux * dir, uy: uy * dir, base };
  const e = rayExit(base.x, base.y, ux * dir, uy * dir);
  return { x: e.x, y: e.y, ux: ux * dir, uy: uy * dir, base };
}

function starAt(p, brightOnly) {
  for (const s of S.stars) {
    if (brightOnly && !s.bright) continue;
    if (Math.hypot(p.x - px(s.c), p.y - py(s.r)) < 28) return s;
  }
  return null;
}

/** فقط سرهای «بیرون‌رفته»؛ سرهای روی ستاره را خودِ ستاره اداره می‌کند. */
function tipAt(p) {
  for (let i = S.beams.length - 1; i >= 0; i--) {
    for (const end of [0, 1]) {
      if (!S.beams[i].ext[end]) continue;
      const t = tipPos(S.beams[i], end);
      if (Math.hypot(p.x - t.x, p.y - t.y) < 28) return { i, end };
    }
  }
  return null;
}

/** سرهای بسته‌ای که روی این ستاره نشسته‌اند — یعنی می‌شود از اینجا بیرونشان کشید. */
function tipsAtStar(st) {
  const out = [];
  S.beams.forEach((b, i) => {
    for (const end of [0, 1]) {
      if (b.ext[end]) continue;
      if ((end ? b.b : b.a) === st) out.push({ i, end });
    }
  });
  return out;
}

/** از میانِ سرهای این ستاره، آنی که بیشتر در جهتِ کشیدن است. */
function bestTip(tips, dx, dy) {
  let best = null;
  for (const q of tips) {
    const t = tipPos(S.beams[q.i], q.end);
    const proj = dx * t.ux + dy * t.uy;
    if (!best || proj > best.proj) best = { q, proj, t };
  }
  return best;
}

function beamAt(p) {
  for (let i = S.beams.length - 1; i >= 0; i--) {
    const b = S.beams[i];
    const A = { x: px(b.a.c), y: py(b.a.r) }, B = { x: px(b.b.c), y: py(b.b.r) };
    const t0 = tipPos(b, 0), t1 = tipPos(b, 1);
    const X0 = b.ext[0] ? t0 : A, X1 = b.ext[1] ? t1 : B;
    const dx = X1.x - X0.x, dy = X1.y - X0.y;
    const L2 = dx * dx + dy * dy || 1;
    let u = ((p.x - X0.x) * dx + (p.y - X0.y) * dy) / L2;
    u = clamp(u, 0, 1);
    if (Math.hypot(p.x - (X0.x + dx * u), p.y - (X0.y + dy * u)) < 16) return i;
  }
  return -1;
}

/* ───────── ورودی ───────── */

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.drag) { S.drag.x = p.x; S.drag.y = p.y; S.drag.moved++; return; }
  cv.style.cursor = (tipAt(p) || starAt(p, true) || beamAt(p) >= 0) ? 'grab' : 'default';
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
  if (S.win) return;
  if (tutTap(S.tut, TUT_TAP, TUT_LAST)) return;

  const tp = tipAt(p);
  if (tp) {
    S.drag = { mode: 'tip', i: tp.i, end: tp.end, x: p.x, y: p.y, moved: 0 };
    sfx.tap();
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    return;
  }
  const st = starAt(p, true);
  if (st) {
    S.drag = { mode: 'new', a: st, tips: tipsAtStar(st), x: p.x, y: p.y, moved: 0 };
    sfx.tap();
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    return;
  }
  const bi = beamAt(p);
  if (bi >= 0) {
    S.beams.splice(bi, 1);
    relight();
    sfx.tone(200, .12, 'sine', .05);
  }
});

cv.addEventListener('pointerup', (e) => {
  const p = toStage(e);
  const d = S.drag;
  S.drag = null;
  if (!d || S.phase !== 'play' || S.win) return;

  if (d.mode === 'new') {
    const b2 = starAt(p, true);
    if (b2 && b2 !== d.a) {
      if (S.beams.some((b) => (b.a === d.a && b.b === b2) || (b.a === b2 && b.b === d.a))) return;
      if (spend() + 1 > S.budget) { S.shake = .16; sfx.nope(); toast.say('نورِ امشب تمام شد. یک رشته را بردار.', 'bad'); return; }
      S.beams.push({ a: d.a, b: b2, ext: [false, false], t: 0 });
      relight();
      sfx.tone(430, .13, 'triangle', .06);
      if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
      checkWin();
      return;
    }
    /* روی ستاره‌ای رها نشد: شاید می‌خواسته سرِ همین‌جا را بیرون بکِشد */
    const A = { x: px(d.a.c), y: py(d.a.r) };
    const bt = d.tips.length ? bestTip(d.tips, p.x - A.x, p.y - A.y) : null;
    if (bt && bt.proj > 52) {
      if (spend() + 1 > S.budget) { S.shake = .16; sfx.nope(); toast.say('نورِ امشب کم است.', 'bad'); return; }
      S.beams[bt.q.i].ext[bt.q.end] = true;
      sfx.tone(620, .16, 'triangle', .06);
      relight();
      checkWin();
    }
    return;
  }
  /* کشیدنِ سرِ رشته: بیرون = بی‌انتها، تو = برگرد */
  const b = S.beams[d.i];
  if (!b) return;
  const t = tipPos(b, d.end);
  const proj = (p.x - t.base.x) * t.ux + (p.y - t.base.y) * t.uy;
  const was = b.ext[d.end];
  if (proj > 52 && !was) {
    if (spend() + 1 > S.budget) { S.shake = .16; sfx.nope(); toast.say('نورِ امشب کم است.', 'bad'); return; }
    b.ext[d.end] = true;
    sfx.tone(620, .16, 'triangle', .06);
  } else if (proj < 34 && was) {
    b.ext[d.end] = false;
    sfx.tone(280, .12, 'sine', .05);
  } else return;
  relight();
  checkWin();
});

cv.addEventListener('pointercancel', () => { S.drag = null; });

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
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(3, 6, 16, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(238, 243, 255, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '0, 4, 20');
  ctx.fillStyle = '#3c5f9a';
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#4b5a7c' }); yy += 30; }
  return h + 20;
}

function starShape(x, y, r, spikes) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = -Math.PI / 2 + i * Math.PI / spikes;
    const rr = i % 2 ? r * .38 : r;
    ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.sky0);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 9;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  drawNight();
  drawMoon();
  drawBeams();
  drawStars();
  drawDrag();
  drawHills();
  bits.draw();
  ctx.restore();

  drawBar();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  }
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.12, 'rgba(2, 4, 14, .5)');
}

/** آسمانِ ثابت: شیب و کهکشان. */
function paintSkyStatic() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, SCENE_H);
  g.addColorStop(0, P.deep);
  g.addColorStop(.45, P.sky1);
  g.addColorStop(1, P.sky2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.globalAlpha = .1;
  const mg = ctx.createLinearGradient(0, 180, SCENE_W, 480);
  mg.addColorStop(0, 'rgba(120, 160, 255, 0)');
  mg.addColorStop(.5, 'rgba(160, 190, 255, 1)');
  mg.addColorStop(1, 'rgba(120, 160, 255, 0)');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.moveTo(0, 240);
  for (let x = 0; x <= SCENE_W; x += 20) ctx.lineTo(x, 240 + Math.sin(x * .0035) * 60);
  for (let x = SCENE_W; x >= 0; x -= 20) ctx.lineTo(x, 360 + Math.sin(x * .0035) * 60);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawNight() {
  ctx.drawImage(staticLayer('sky', SCENE_W, SCENE_H, paintSkyStatic), 0, 0, SCENE_W, SCENE_H);

  /* غبارِ ستاره‌ایِ چشمک‌زن */
  ctx.fillStyle = 'rgba(210, 226, 255, .5)';
  for (let i = 0; i < 110; i++) {
    const x = noise1(i * 3.1) * SCENE_W, y = HUD_H + noise1(i * 7.7 + 2) * (SCENE_H - HUD_H - 60);
    const r = .5 + noise1(i * 1.9) * 1.4;
    ctx.globalAlpha = .2 + .5 * Math.abs(Math.sin(S.t * .8 + i));
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (S.shoot) {
    const k = clamp(S.shoot.t / 1.2, 0, 1);
    const x = S.shoot.x + S.shoot.dx * S.shoot.t, y = S.shoot.y + S.shoot.dy * S.shoot.t;
    ctx.save();
    ctx.globalAlpha = Math.sin(k * Math.PI);
    const gg = ctx.createLinearGradient(x, y, x - S.shoot.dx * .25, y - S.shoot.dy * .25);
    gg.addColorStop(0, 'rgba(255,255,255,.9)');
    gg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = gg; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - S.shoot.dx * .25, y - S.shoot.dy * .25); ctx.stroke();
    ctx.restore();
  }
}

/** ماه = ساعتِ شب. از راست بالا می‌آید و از چپ غروب می‌کند. */
function drawMoon() {
  const k = clamp(S.moon, 0, 1);
  const x = lerp(1150, 60, k);
  const y = 116 + Math.sin(k * Math.PI) * -42;
  ctx.save();
  const gg = ctx.createRadialGradient(x, y, 6, x, y, 96);
  gg.addColorStop(0, 'rgba(246, 238, 214, .3)');
  gg.addColorStop(1, 'rgba(246, 238, 214, 0)');
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(x, y, 96, 0, TAU); ctx.fill();
  ctx.fillStyle = P.moon;
  wobbleCircle(x, y, 30, 5, 1.4); ctx.fill();
  ctx.fillStyle = P.moonDk;
  ctx.globalAlpha = .5;
  wobbleCircle(x - 9, y - 7, 6, 9, .8); ctx.fill();
  wobbleCircle(x + 8, y + 5, 8, 13, .9); ctx.fill();
  wobbleCircle(x + 2, y - 12, 4, 17, .6); ctx.fill();
  ctx.restore();
  if (k > .78) {
    ctx.save();
    ctx.globalAlpha = (k - .78) / .22;
    const dg = ctx.createLinearGradient(0, SCENE_H, 0, SCENE_H - 260);
    dg.addColorStop(0, 'rgba(255, 170, 110, .5)');
    dg.addColorStop(1, 'rgba(255, 170, 110, 0)');
    ctx.fillStyle = dg;
    ctx.fillRect(0, SCENE_H - 260, SCENE_W, 260);
    ctx.restore();
  }
}

function drawHills() {
  ctx.fillStyle = P.hill;
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H);
  ctx.lineTo(0, 700);
  for (let x = 0; x <= SCENE_W; x += 16) ctx.lineTo(x, 700 + Math.sin(x * .006 + 1) * 26 + Math.sin(x * .017) * 10);
  ctx.lineTo(SCENE_W, SCENE_H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.hill2;
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H);
  ctx.lineTo(0, 736);
  for (let x = 0; x <= SCENE_W; x += 16) ctx.lineTo(x, 736 + Math.sin(x * .009 + 3) * 16);
  ctx.lineTo(SCENE_W, SCENE_H); ctx.closePath(); ctx.fill();
}

function drawStars() {
  for (const s of S.stars) {
    const x = px(s.c), y = py(s.r);
    const tw = .8 + .2 * Math.sin(S.t * 2 + s.ph);
    const pop = s.pop > 0 ? 1 + s.pop * 1.4 : 1;
    if (s.bright) {
      ctx.save();
      const gg = ctx.createRadialGradient(x, y, 2, x, y, 40);
      gg.addColorStop(0, 'rgba(255, 233, 168, .5)');
      gg.addColorStop(1, 'rgba(255, 233, 168, 0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(x, y, 40, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.fillStyle = P.bright;
      starShape(x, y, 15 * tw * pop, 4); ctx.fill();
      ctx.fillStyle = P.brightHot;
      ctx.beginPath(); ctx.arc(x, y, 5.5, 0, TAU); ctx.fill();
      /* حلقهٔ «اینجا می‌شود گرفت» */
      ctx.strokeStyle = 'rgba(255, 233, 168, .32)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 24 + Math.sin(S.t * 2 + s.ph) * 1.5, 0, TAU); ctx.stroke();
    } else if (s.lit) {
      ctx.save();
      const gg = ctx.createRadialGradient(x, y, 1, x, y, 30 * pop);
      gg.addColorStop(0, 'rgba(255, 217, 138, .55)');
      gg.addColorStop(1, 'rgba(255, 217, 138, 0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(x, y, 30 * pop, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.fillStyle = P.lit;
      starShape(x, y, 10 * tw * pop, 4); ctx.fill();
      ctx.fillStyle = P.litHot;
      ctx.beginPath(); ctx.arc(x, y, 3.4, 0, TAU); ctx.fill();
    } else {
      ctx.save();
      const gg = ctx.createRadialGradient(x, y, 1, x, y, 17);
      gg.addColorStop(0, 'rgba(132, 150, 198, .3)');
      gg.addColorStop(1, 'rgba(132, 150, 198, 0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(x, y, 17, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.fillStyle = P.dim;
      ctx.beginPath(); ctx.arc(x, y, 8 * tw, 0, TAU); ctx.fill();
      ctx.fillStyle = P.dimCore;
      ctx.beginPath(); ctx.arc(x, y, 3.4, 0, TAU); ctx.fill();
    }
  }
}

function drawBeams() {
  for (const b of S.beams) {
    const A = { x: px(b.a.c), y: py(b.a.r) }, B = { x: px(b.b.c), y: py(b.b.r) };
    const t0 = tipPos(b, 0), t1 = tipPos(b, 1);
    const X0 = b.ext[0] ? t0 : A, X1 = b.ext[1] ? t1 : B;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(143, 216, 255, .16)'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(X0.x, X0.y); ctx.lineTo(X1.x, X1.y); ctx.stroke();
    ctx.strokeStyle = P.beam; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(X0.x, X0.y); ctx.lineTo(X1.x, X1.y); ctx.stroke();
    ctx.strokeStyle = P.beamHot; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(X0.x, X0.y); ctx.lineTo(X1.x, X1.y); ctx.stroke();

    /* خط‌کشِ روی رشته: هر گام یک نشانه */
    const [ux, uy] = unit(B.x - A.x, B.y - A.y);
    const stepLen = Math.hypot(B.x - A.x, B.y - A.y) /
      Math.max(1, Math.max(Math.abs(b.b.c - b.a.c), Math.abs(b.b.r - b.a.r)));
    const from = -(b.ext[0] ? Math.hypot(A.x - t0.x, A.y - t0.y) : 0);
    const to = Math.hypot(B.x - A.x, B.y - A.y) + (b.ext[1] ? Math.hypot(B.x - t1.x, B.y - t1.y) : 0);
    ctx.strokeStyle = 'rgba(216, 242, 255, .45)'; ctx.lineWidth = 2;
    for (let d = Math.ceil(from / stepLen) * stepLen; d <= to + .5; d += stepLen) {
      const mx = A.x + ux * d, my = A.y + uy * d;
      ctx.beginPath();
      ctx.moveTo(mx - uy * 5, my + ux * 5); ctx.lineTo(mx + uy * 5, my - ux * 5); ctx.stroke();
    }
    ctx.restore();

    /* دو سرِ رشته: دستگیره */
    for (const end of [0, 1]) {
      const t = end ? t1 : t0;
      ctx.save();
      if (b.ext[end]) {
        /* پیکانِ بی‌انتها */
        ctx.fillStyle = P.beamHot;
        ctx.translate(t.x, t.y);
        ctx.rotate(Math.atan2(t.uy, t.ux));
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-9, -8); ctx.lineTo(-9, 8); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = .5 + .3 * Math.sin(S.t * 4);
        ctx.beginPath(); ctx.arc(-2, 0, 15, 0, TAU); ctx.strokeStyle = P.beam; ctx.lineWidth = 2; ctx.stroke();
      } else {
        ctx.strokeStyle = P.beamHot; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.arc(t.x, t.y, 11, 0, TAU); ctx.stroke();
        ctx.fillStyle = 'rgba(143, 216, 255, .3)';
        ctx.beginPath(); ctx.arc(t.x, t.y, 11, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }

    /* نامِ همین چیزی که ساخته‌ای */
    const [nx, ny] = unit(-(X1.y - X0.y), X1.x - X0.x);
    const mid = { x: clamp((X0.x + X1.x) / 2 + nx * 46, 90, SCENE_W - 90),
                  y: clamp((X0.y + X1.y) / 2 + ny * 46, HUD_H + 74, BAR.y - 16) };
    const steps = Math.max(Math.abs(b.b.c - b.a.c), Math.abs(b.b.r - b.a.r));
    const label = beamKind(b);
    const sub = beamCost(b) === 1 ? fa(steps) + ' گام' : 'بی‌انتها';
    ctx.save();
    ctx.globalAlpha = .95;
    ctx.fillStyle = 'rgba(10, 20, 48, .8)';
    const w = 108, h = 40;
    ctx.beginPath(); rrPath(mid.x - w / 2, mid.y - h / 2, w, h, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(143, 216, 255, .4)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); rrPath(mid.x - w / 2, mid.y - h / 2, w, h, 12); ctx.stroke();
    text(label, mid.x, mid.y - 8, { size: 16, family: 'Lalezar', color: P.beamHot });
    text(sub, mid.x, mid.y + 9, { size: 12, color: 'rgba(216, 242, 255, .7)' });
    ctx.restore();
  }
}

function drawDrag() {
  const d = S.drag;
  if (!d) return;
  ctx.save();
  ctx.setLineDash([9, 8]);
  ctx.strokeStyle = 'rgba(216, 242, 255, .8)'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  if (d.mode === 'new') {
    const A = { x: px(d.a.c), y: py(d.a.r) };
    const over = starAt({ x: d.x, y: d.y }, true);
    const bt = (!over || over === d.a) && d.tips.length ? bestTip(d.tips, d.x - A.x, d.y - A.y) : null;
    if (bt && bt.proj > 52) {
      const e = rayExit(A.x, A.y, bt.t.ux, bt.t.uy);
      ctx.strokeStyle = 'rgba(216, 242, 255, .85)';
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(e.x, e.y); ctx.stroke();
      ctx.setLineDash([]);
      text('بی‌انتها', (A.x + e.x) / 2, (A.y + e.y) / 2 - 24,
        { size: 17, family: 'Lalezar', color: P.beamHot });
    } else {
      const T = over && over !== d.a ? { x: px(over.c), y: py(over.r) } : { x: d.x, y: d.y };
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(T.x, T.y); ctx.stroke();
      if (over && over !== d.a) {
        ctx.setLineDash([]);
        ctx.strokeStyle = P.beamHot; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(T.x, T.y, 26, 0, TAU); ctx.stroke();
      }
    }
  } else {
    const b = S.beams[d.i];
    if (b) {
      const t = tipPos(b, d.end);
      const proj = (d.x - t.base.x) * t.ux + (d.y - t.base.y) * t.uy;
      const willExt = proj > 52;
      const e = rayExit(t.base.x, t.base.y, t.ux, t.uy);
      ctx.strokeStyle = willExt ? 'rgba(216, 242, 255, .85)' : 'rgba(216, 242, 255, .25)';
      ctx.beginPath(); ctx.moveTo(t.base.x, t.base.y); ctx.lineTo(e.x, e.y); ctx.stroke();
      ctx.setLineDash([]);
      text(willExt ? 'بی‌انتها' : 'تا همین‌جا', (t.base.x + e.x) / 2, (t.base.y + e.y) / 2 - 22,
        { size: 17, family: 'Lalezar', color: willExt ? P.beamHot : 'rgba(216,242,255,.5)' });
    }
  }
  ctx.restore();
}

/** قطره‌های نور: بودجهٔ امشب. */
function drawBar() {
  ctx.fillStyle = 'rgba(8, 16, 40, .68)';
  ctx.beginPath(); rrPath(BAR.x, BAR.y, BAR.w, BAR.h, 18); ctx.fill();
  ctx.strokeStyle = 'rgba(143, 216, 255, .16)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(BAR.x, BAR.y, BAR.w, BAR.h, 18); ctx.stroke();

  text('نورِ امشب', BAR.x + 92, BAR.y + 40, { size: 21, family: 'Lalezar', color: P.paper });
  const used = spend();
  const n = S.budget;
  const startX = BAR.x + 190;
  for (let i = 0; i < n; i++) {
    const x = startX + i * 40, y = BAR.y + 40;
    const on = i >= used;
    ctx.save();
    if (on) {
      const gg = ctx.createRadialGradient(x, y, 1, x, y, 22);
      gg.addColorStop(0, 'rgba(127, 224, 255, .45)');
      gg.addColorStop(1, 'rgba(127, 224, 255, 0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = on ? P.drop : P.dropOff;
    ctx.beginPath();
    ctx.moveTo(x, y - 15);
    ctx.quadraticCurveTo(x + 11, y - 2, x + 8, y + 6);
    ctx.quadraticCurveTo(x, y + 15, x - 8, y + 6);
    ctx.quadraticCurveTo(x - 11, y - 2, x, y - 15);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  /* بهایِ هر چیز — یادآوریِ همیشگی، نه جواب */
  const items = [['پاره‌خط', 1], ['نیم‌خط', 2], ['خط', 3]];
  items.forEach((it, i) => {
    const x = BAR.x + BAR.w - 300 + i * 100;
    text(it[0], x, BAR.y + 32, { size: 16, family: 'Lalezar', color: 'rgba(238, 243, 255, .8)' });
    for (let k = 0; k < it[1]; k++) {
      ctx.fillStyle = P.drop;
      ctx.beginPath(); ctx.arc(x - (it[1] - 1) * 7 + k * 14, BAR.y + 58, 4.6, 0, TAU); ctx.fill();
    }
  });
}

function drawHUD() {
  ctx.fillStyle = 'rgba(6, 12, 30, .86)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(143, 216, 255, .22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  const left = S.stars.filter((s) => !s.lit).length;
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  text(left ? 'ستارهٔ خاموش: ' + fa(left) : 'همه روشن شد', SCENE_W / 2 + 190, HUD_H / 2,
    { size: 16, color: left ? 'rgba(238,243,255,.6)' : P.gold });
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(238, 243, 255, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([SKY], .72);
    const h = tutCard(350, 612, 500,
      ['ستاره‌های کم‌نور باید روشن شوند.', 'ستاره‌های درخشان، جای گرفتنِ رشته‌اند.'], 'نقشِ ستارگان');
    tutMore(600, 612 + h + 10, S.t, P.ink);
  } else if (st === 1) {
    spot([SKY], .68);
    tutCard(350, 606, 500, ['از یک ستارهٔ درخشان تا درخشانِ دیگر بکش.',
      'هر ستاره‌ای سرِ راه باشد، روشن می‌شود.'], 'یک رشته بکِش');
  } else {
    spot([SKY, BAR], .66);
    const h = tutCard(330, 596, 540,
      ['سرِ رشته را بگیر و بیرون بکِش تا بی‌انتها شود.',
       'یک سر: نیم‌خط. هر دو سر: خط.',
       'هرچه بی‌انتهاتر، نورِ بیشتری خرج می‌شود.'], 'سرِ رشته را بکِش');
    tutMore(600, 596 + h + 10, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function starIcon(x, y) {
  ctx.save();
  const gg = ctx.createRadialGradient(x, y, 2, x, y, 42);
  gg.addColorStop(0, 'rgba(242, 198, 100, .45)');
  gg.addColorStop(1, 'rgba(242, 198, 100, 0)');
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(x, y, 42, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2c3a63';
  starShape(x, y, 26, 4); ctx.fill();
  ctx.fillStyle = P.gold;
  starShape(x, y, 18, 4); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 740, h: 276, y: 142,
    paper: P.paper, band: '#3c5f9a', ink: P.ink, inkSoft: '#68789c',
    icon: starIcon,
    title: 'نقشِ ستارگان',
    body: 'از یک ستارهٔ درخشان تا درخشانِ دیگر رشته بکش تا ستاره‌های سرِ راه روشن شوند.\nسرِ رشته را بگیر و بیرون بکِش تا بی‌انتها شود.\nنورِ امشب کم است و ماه دارد غروب می‌کند.',
    btn: BTN_GO, btnLabel: 'شب آغاز شد', btnHot: S.hover === BTN_GO,
    btnFill: '#3c5f9a', btnHotFill: '#4a72b4',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#68789c',
    icon: starIcon,
    title: L().endless ? 'آسمان روشن شد' : 'نقش تمام شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ شب‌ها را گذراندی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'شبِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#3c5f9a', btnHotFill: '#4a72b4',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#68789c',
    icon: (x, y) => { ctx.fillStyle = '#f0a86a';
      ctx.beginPath(); ctx.arc(x, y + 10, 24, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#f0a86a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - 40, y + 12); ctx.lineTo(x + 40, y + 12); ctx.stroke(); },
    title: 'ماه غروب کرد',
    body: 'امتیاز: ' + fa(S.score) + '\nرشته را فقط تا جایی بکِش که لازم است.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#3c5f9a', btnHotFill: '#4a72b4',
  });
}

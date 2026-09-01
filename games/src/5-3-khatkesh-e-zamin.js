/*!
title: خط‌کشِ زمینِ بازی — محیط
bg: #86bd63
*/

/* ═══════════════════════════════════════════════════════════════════════
   خط‌کشِ زمینِ بازی — ریاضی سوم، فصل ۵، درس ۳ (محیط)
   ───────────────────────────────────────────────────────────────────────
   محیط یعنی «اندازهٔ دورِ شکل»، و کتاب خودش می‌گوید: از یک نقطه شروع کن،
   دورِ شکل بگرد تا دوباره به همان نقطه برسی. پس فعلِ بازی همین شد.

   تو خط‌کشِ زمینِ ورزشی هستی. باید با گاریِ گچ دورِ زمین را خط بکشی و
   به نقطهٔ شروع برگردی. ولی اوّل باید یکی از سه مخزنِ گچ را برداری —
   و روی هر مخزن نوشته چند متر گچ دارد.

     • کوچک برداری → وسطِ راه گچ تمام می‌شود و خط ناتمام می‌ماند.
     • بزرگ برداری → می‌رسی، ولی کلّی گچ حرام می‌شود.
     • درست برداری → درست سرِ نقطهٔ شروع، آخرین قطرهٔ گچ تمام می‌شود.

   پس محیط را باید از روی اندازهٔ ضلع‌ها حساب کنی، نه از روی حدس. در
   پرده‌های بالاتر اندازهٔ بعضی ضلع‌ها نوشته نشده و باید خودت پیدایش کنی
   (تمرینِ صفحهٔ ۸۷)، و در زمین‌های منظم راهِ کوتاه ضرب است.

   هیچ‌جا عددِ محیط نوشته نمی‌شود؛ فقط اندازهٔ ضلع‌ها و سه مخزن.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const CELL = 36;

const P = {
  sky:   '#cfe9f7', sky2: '#a8d8ef',
  grass: '#7fb85c', grassDk: '#69a24a', grassLt: '#95cb70', grassEdge: '#5c8f42',
  chalk: '#fdfdf6', chalkOff: 'rgba(255, 255, 250, .3)',
  wood:  '#b0803f', woodDk: '#82602c', woodLt: '#cb9a55',
  cart:  '#e05c48', cartDk: '#b0402f', metal: '#79879a', metalLt: '#a3b0bf',
  tank:  '#f3ede0', tankDk: '#cfc4ad',
  paper: '#fdf8ea', ink: '#31402a', inkSoft: '#7d8f6f',
  good:  '#5f9c46', bad: '#d1573f', gold: '#efb63f',
};

const LEVELS = [
  { name: 'زمینِ کوچک', fams: ['rect', 'square'], hide: 0, time: 62, quota: 3,
    hint: 'یک مخزنِ گچ بردار، بعد دورِ زمین را خط بکش.' },
  { name: 'زمینِ ال', fams: ['L', 'T'], hide: 0, time: 60, quota: 3,
    hint: 'ضلع‌ها بیشتر شدند. همه را با هم جمع کن.' },
  { name: 'ضلعِ گمشده', fams: ['L', 'T', 'rect'], hide: 2, time: 60, quota: 4,
    hint: 'اندازهٔ بعضی ضلع‌ها نوشته نشده. از روی ضلع‌های روبه‌رو پیدایش کن.' },
  { name: 'زمینِ منظم', fams: ['square', 'cross', 'L'], hide: 1, time: 56, quota: 4,
    hint: 'وقتی همهٔ ضلع‌ها برابرند، ضرب کن.' },
  { name: 'تا زنگِ آخر', fams: null, hide: 2, time: 52, endless: true,
    hint: 'تا زنگ نخورده، زمین‌ها را خط بکش.' },
];

const HUD_H = 52;
const FIELD = { cx: 600, cy: 346 };
const SHELF = { x: 60, y: 562, w: 1080, h: 176 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  poly: [],          // رأس‌های زمین، مختصاتِ صفحه
  sides: [],         // { len, hidden, mid, dir }
  perim: 0,          // متر
  regular: false,
  segLen: [], total: 0,
  tanks: [], pick: -1,
  stage: 'pick',     // pick → draw → done
  s: 0,              // مسافتی که خط کشیده‌ای (پیکسل)
  drag: false,
  timeLeft: 0,
  whistle: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  done: 0, fail: 0,
  puffs: [],
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];

function loadBest() { try { return +localStorage.getItem('khatkesh-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('khatkesh-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

/* ───────── ساختِ زمین ───────── */

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/** خانوادهٔ زمین‌ها؛ همه‌شان رأس‌های شبکه‌ای می‌دهند تا اندازه‌ها عددِ درست باشد. */
const FAMS = {
  rect() { const w = R(4, 11), h = R(3, 8); return { v: [[0,0],[w,0],[w,h],[0,h]], regular: w === h }; },
  square() { const a = R(3, 8); return { v: [[0,0],[a,0],[a,a],[0,a]], regular: true }; },
  L() {
    const W = R(6, 11), H = R(5, 9), cw = R(2, W - 3), ch = R(2, H - 3);
    return { v: [[0,0],[W,0],[W,ch],[cw,ch],[cw,H],[0,H]], regular: false };
  },
  T() {
    const W = R(6, 11), H = R(5, 9), t = R(2, 3), s = R(2, W - 4);
    const a = Math.floor((W - s) / 2);
    return { v: [[0,0],[W,0],[W,t],[a+s,t],[a+s,H],[a,H],[a,t],[0,t]], regular: false };
  },
  cross() {
    const k = R(2, 4);
    const a = k, b = k, c = k, d = k, W = a + b + a, H = c + d + c;
    return { v: [[a,0],[a+b,0],[a+b,c],[W,c],[W,c+d],[a+b,c+d],[a+b,H],[a,H],[a,c+d],[0,c+d],[0,c],[a,c]],
             regular: true };
  },
};

function newField() {
  const lv = L();
  const fams = lv.fams || Object.keys(FAMS);
  for (let tries = 0; tries < 60; tries++) {
    const f = FAMS[fams[Math.floor(Math.random() * fams.length)]]();
    const xs = f.v.map((p) => p[0]), ys = f.v.map((p) => p[1]);
    const W = Math.max.apply(null, xs), H = Math.max.apply(null, ys);
    if (W > 12 || H > 8 || W < 3 || H < 3) continue;
    /* زمین باید بینِ ردیفِ درخت‌ها و قفسه جا شود، وگرنه برچسبِ ضلع‌ها بیرون می‌زند. */
    const bandTop = 198, bandBot = SHELF.y - 58;
    if (H * CELL > bandBot - bandTop) continue;
    const ox = FIELD.cx - W * CELL / 2;
    const oy = bandTop + (bandBot - bandTop - H * CELL) / 2;
    const poly = f.v.map((p) => ({ x: ox + p[0] * CELL, y: oy + p[1] * CELL }));
    /* ضلع‌ها و محیط */
    const sides = [], segLen = [];
    let perim = 0, total = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const dpx = Math.hypot(b.x - a.x, b.y - a.y);
      const len = Math.round(dpx / CELL);
      if (len < 1) { perim = -1; break; }
      sides.push({ len, hidden: false, ax: b.y === a.y ? 'h' : 'v',
                   mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2,
                   nx: b.y === a.y ? 0 : (b.y > a.y ? 1 : -1), ny: b.y === a.y ? (b.x > a.x ? -1 : 1) : 0 });
      segLen.push(dpx); total += dpx; perim += len;
    }
    if (perim < 8 || perim > 44) continue;
    hideSides(sides, lv.hide);
    S.poly = poly; S.sides = sides; S.segLen = segLen; S.total = total;
    S.perim = perim; S.regular = f.regular && sides.every((q) => q.len === sides[0].len);
    S.tanks = makeTanks(perim);
    S.pick = -1; S.stage = 'pick'; S.s = 0; S.drag = false; S.done = 0; S.fail = 0;
    S.timeLeft = lv.time;
    return;
  }
  /* پناهِ آخر: یک مستطیلِ ساده */
  const poly = [{x:480,y:220},{x:760,y:220},{x:760,y:420},{x:480,y:420}];
  S.poly = poly; S.sides = [{len:7,hidden:false,ax:'h',mx:620,my:220,nx:0,ny:-1},
    {len:5,hidden:false,ax:'v',mx:760,my:320,nx:1,ny:0},
    {len:7,hidden:false,ax:'h',mx:620,my:420,nx:0,ny:1},
    {len:5,hidden:false,ax:'v',mx:480,my:320,nx:-1,ny:0}];
  S.segLen = [280,200,280,200]; S.total = 960; S.perim = 24; S.regular = false;
  S.tanks = makeTanks(24); S.pick = -1; S.stage = 'pick'; S.s = 0; S.done = 0; S.fail = 0;
  S.timeLeft = L().time;
}

/** اندازهٔ حداکثر یک ضلعِ افقی و یک ضلعِ عمودی را برمی‌داریم — هر دو از روی
    ضلع‌های روبه‌رو پیدا شدنی‌اند، چون در شکلِ گوشه‌راست مجموعِ رفت و برگشت برابر است. */
function hideSides(sides, n) {
  if (!n) return;
  for (const ax of ['h', 'v']) {
    if (n <= 0) break;
    const idx = [];
    sides.forEach((q, i) => { if (q.ax === ax) idx.push(i); });
    if (idx.length < 3) continue;
    const pickI = idx[Math.floor(Math.random() * idx.length)];
    sides[pickI].hidden = true;
    n--;
  }
}

/** سه مخزن: یکی درست، یکی کم، یکی زیاد. اشتباه‌های رایج را طعمه می‌کنیم. */
function makeTanks(p) {
  const low = [], high = [];
  const half = Math.round(p / 2);
  if (half >= 4 && half < p - 1) low.push(half);            // فقط دو ضلع را جمع کرده
  low.push(p - R(2, 5));
  high.push(p + R(2, 6));
  high.push(p + R(7, 11));
  const a = low[Math.floor(Math.random() * low.length)];
  const b = high[Math.floor(Math.random() * high.length)];
  const out = [p, Math.max(4, a), b];
  /* یکسان نشوند */
  if (out[1] === p) out[1] = Math.max(4, p - 3);
  if (out[2] === p) out[2] = p + 4;
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = out[i]; out[i] = out[j]; out[j] = t; }
  return out.map((v) => ({ v, ok: v === p }));
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  if (!keep) { S.score = 0; S.whistle = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newField();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

const chalkPx = () => (S.pick >= 0 ? S.tanks[S.pick].v * CELL : 0);
const metersLeft = () => Math.max(0, (chalkPx() - S.s) / CELL);

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  for (const q of S.puffs) { q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 60 * dt; }
  S.puffs = S.puffs.filter((q) => q.t < 1);

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.done && !S.fail) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseWhistle('زنگ خورد!'); }
    }
    if (S.done) { S.done += dt; if (S.done > 1.6) { S.done = 0; newField(); } }
    if (S.fail) { S.fail += dt; if (S.fail > 1.6) { S.fail = 0; retryField(); } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function posAt(s) {
  let acc = 0;
  for (let i = 0; i < S.poly.length; i++) {
    const a = S.poly[i], b = S.poly[(i + 1) % S.poly.length];
    const l = S.segLen[i];
    if (s <= acc + l || i === S.poly.length - 1) {
      const u = clamp((s - acc) / (l || 1), 0, 1);
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u,
               dx: (b.x - a.x) / (l || 1), dy: (b.y - a.y) / (l || 1) };
    }
    acc += l;
  }
  return { x: S.poly[0].x, y: S.poly[0].y, dx: 1, dy: 0 };
}

/** نزدیک‌ترین جای مرز که جلوترِ گاری باشد. */
function projectOn(p) {
  let acc = 0, best = null;
  for (let i = 0; i < S.poly.length; i++) {
    const a = S.poly[i], b = S.poly[(i + 1) % S.poly.length];
    const dx = b.x - a.x, dy = b.y - a.y, l = S.segLen[i], L2 = l * l || 1;
    let u = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / L2, 0, 1);
    const qx = a.x + dx * u, qy = a.y + dy * u;
    const s = acc + u * l;
    if (s >= S.s - 6 && s <= S.s + 190) {
      const d = Math.hypot(p.x - qx, p.y - qy);
      if (!best || d < best.d) best = { d, s };
    }
    acc += l;
  }
  return best;
}

function puff(x, y, n, col) {
  for (let i = 0; i < n; i++) {
    S.puffs.push({ x, y, t: 0, r: 3 + Math.random() * 6, col,
      vx: (Math.random() - .5) * 90, vy: -30 - Math.random() * 70 });
  }
}

function advance(p) {
  const b = projectOn(p);
  if (!b || b.d > 96) return;
  const maxS = Math.min(chalkPx(), S.total);
  const ns = Math.max(S.s, Math.min(b.s, maxS));
  if (ns > S.s + .5) {
    const c = posAt(ns);
    if (Math.random() < .35) puff(c.x, c.y, 1, P.chalk);
    if (Math.floor(ns / CELL) !== Math.floor(S.s / CELL)) sfx.tone(180 + (ns / S.total) * 220, .04, 'square', .025);
  }
  S.s = ns;
  if (S.s >= S.total - 1.5) finishField();
  else if (S.s >= chalkPx() - .5) dryOut();
}

function finishField() {
  if (S.done) return;
  S.s = S.total;
  S.done = .001;
  S.drag = false;
  S.combo++;
  S.cleared++;
  const exact = S.tanks[S.pick].ok;
  const waste = Math.round(metersLeft());
  const pts = 250 + (exact ? 450 : 0) + Math.round(S.timeLeft * 8) + Math.min(S.combo, 6) * 60;
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(FIELD.cx, FIELD.cy, 44, [P.chalk, P.gold, '#fff', P.grassLt]);
  sfx.win();
  toast.say(exact ? 'درست به اندازه! آخرین قطرهٔ گچ.' : `خط کشیده شد، ولی ${fa(waste)} متر گچ حرام شد.`,
    exact ? 'good' : 'info');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 700; S.phase = 'won'; S.phaseT = 0; }
}

function dryOut() {
  if (S.fail || S.done) return;
  S.drag = false;
  const c = posAt(S.s);
  puff(c.x, c.y, 14, '#e8e2cf');
  loseWhistle('گچ وسطِ راه تمام شد.');
}

function loseWhistle(msg) {
  if (S.fail || S.done) return;
  S.fail = .001;
  S.combo = 0;
  S.whistle--;
  S.shake = .4;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.whistle <= 0) { S.phase = 'lost'; S.phaseT = 0; S.fail = 0; }
}

/** همان زمین دوباره، تا بشود با مخزنِ دیگری امتحان کرد. */
function retryField() {
  S.s = 0; S.pick = -1; S.stage = 'pick'; S.drag = false;
  S.timeLeft = L().time;
  for (let i = S.tanks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = S.tanks[i]; S.tanks[i] = S.tanks[j]; S.tanks[j] = t;
  }
}

/* ───────── ورودی ───────── */

function tankBox(i) {
  const w = 224, gap = 34, n = 3;
  const total = n * w + (n - 1) * gap;
  return { x: SHELF.x + (SHELF.w - total) / 2 + i * (w + gap), y: SHELF.y + 38, w, h: 106 };
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.stage === 'pick') {
    S.hover = null;
    for (let i = 0; i < 3; i++) if (inRect(p, tankBox(i))) S.hover = i;
    cv.style.cursor = S.hover !== null ? 'pointer' : 'default';
    return;
  }
  if (S.drag) { advance(p); return; }
  const c = posAt(S.s);
  cv.style.cursor = Math.hypot(p.x - c.x, p.y - c.y) < 80 ? 'grab' : 'default';
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
  if (S.done || S.fail) return;
  if (tutTap(S.tut, TUT_TAP, TUT_LAST)) return;

  if (S.stage === 'pick') {
    for (let i = 0; i < 3; i++) if (inRect(p, tankBox(i))) {
      S.pick = i; S.stage = 'draw'; S.s = 0;
      sfx.tone(480, .12, 'triangle', .06);
      if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
      return;
    }
    return;
  }
  const c = posAt(S.s);
  if (Math.hypot(p.x - c.x, p.y - c.y) < 90) {
    S.drag = true;
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    advance(p);
  }
});

cv.addEventListener('pointerup', () => { S.drag = false; });
cv.addEventListener('pointercancel', () => { S.drag = false; });

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
  ctx.fillStyle = `rgba(18, 34, 12, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .42, () => {
    ctx.fillStyle = 'rgba(253, 248, 234, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '20, 40, 12');
  ctx.fillStyle = P.good;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#57684c' }); yy += 30; }
  return h + 20;
}

function polyPath() {
  ctx.beginPath();
  ctx.moveTo(S.poly[0].x, S.poly[0].y);
  for (let i = 1; i < S.poly.length; i++) ctx.lineTo(S.poly[i].x, S.poly[i].y);
  ctx.closePath();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.grass);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 9;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  drawGround();
  drawField();
  drawChalkLine();
  drawSideLabels();
  drawCart();
  drawPuffs();
  bits.draw();
  ctx.restore();

  drawShelf();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.12, 'rgba(30, 50, 20, .34)');
}

function drawGround() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, SCENE_H);
  g.addColorStop(0, P.sky2);
  g.addColorStop(.16, P.grassLt);
  g.addColorStop(1, P.grassDk);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* نوارهای چمن‌زنی */
  ctx.save();
  ctx.globalAlpha = .1;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 9; i++) ctx.fillRect(0, 140 + i * 70, SCENE_W, 35);
  ctx.restore();

  /* درخت‌های افق */
  ctx.fillStyle = '#4d7f3b';
  for (let i = 0; i < 14; i++) {
    const x = 24 + i * 92 + noise1(i * 3.3) * 40, r = 22 + noise1(i * 7.1) * 14;
    wobbleCircle(x, 112, r, i * 5, 2.2); ctx.fill();
    ctx.fillStyle = '#6b4a2c';
    ctx.fillRect(x - 4, 112, 8, 20);
    ctx.fillStyle = '#4d7f3b';
  }
  ctx.fillStyle = P.grassEdge;
  ctx.fillRect(0, 130, SCENE_W, 6);
}

function drawField() {
  if (!S.poly.length) return;
  /* خاکِ زمینِ بازی */
  withShadow(22, 10, .22, () => {
    ctx.fillStyle = 'rgba(255, 255, 255, .1)';
    polyPath(); ctx.fill();
  }, '20, 40, 12');
  ctx.fillStyle = '#6ea64f';
  polyPath(); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, .07)';
  polyPath(); ctx.fill();

  /* شبکهٔ یک‌متری — تا اندازه‌ها شمردنی باشد */
  ctx.save();
  polyPath(); ctx.clip();
  ctx.strokeStyle = 'rgba(255, 255, 255, .26)'; ctx.lineWidth = 1;
  const xs = S.poly.map((p) => p.x), ys = S.poly.map((p) => p.y);
  const x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
  const y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
  for (let x = x0; x <= x1 + 1; x += CELL) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
  for (let y = y0; y <= y1 + 1; y += CELL) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
  ctx.restore();

  /* مرزِ هنوز خط‌نکشیده */
  ctx.save();
  ctx.setLineDash([11, 11]);
  ctx.strokeStyle = 'rgba(255, 255, 250, .45)'; ctx.lineWidth = 7; ctx.lineJoin = 'round';
  polyPath(); ctx.stroke();
  ctx.restore();

  /* نقطهٔ شروع */
  const s0 = S.poly[0];
  ctx.save();
  ctx.globalAlpha = S.stage === 'draw' && S.s < 4 ? .55 + .35 * Math.sin(S.t * 5) : .35;
  ctx.strokeStyle = P.gold; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(s0.x, s0.y, 22, 0, TAU); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); ctx.arc(s0.x, s0.y, 7, 0, TAU); ctx.fill();
  ctx.save();
  ctx.fillStyle = 'rgba(255, 250, 232, .92)';
  ctx.beginPath(); rrPath(s0.x - 30, s0.y - 52, 60, 26, 12); ctx.fill();
  text('شروع', s0.x, s0.y - 38, { size: 16, family: 'Lalezar', color: '#7a5c16' });
  ctx.restore();
}

function drawChalkLine() {
  if (!S.poly.length || S.s <= 0) return;
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(S.poly[0].x, S.poly[0].y);
  let acc = 0;
  for (let i = 0; i < S.poly.length; i++) {
    const a = S.poly[i], b = S.poly[(i + 1) % S.poly.length], l = S.segLen[i];
    if (S.s >= acc + l) { ctx.lineTo(b.x, b.y); acc += l; continue; }
    const u = clamp((S.s - acc) / (l || 1), 0, 1);
    ctx.lineTo(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u);
    break;
  }
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 15; ctx.stroke();
  ctx.strokeStyle = P.chalk; ctx.lineWidth = 9; ctx.stroke();
  ctx.restore();
}

function drawSideLabels() {
  for (const q of S.sides) {
    const x = q.mx + q.nx * 30, y = q.my + q.ny * 30;
    const txt = q.hidden ? '؟' : fa(q.len);
    ctx.save();
    withShadow(8, 3, .22, () => {
      ctx.fillStyle = q.hidden ? '#fce9c4' : P.paper;
      const w = 52, h = 34;
      ctx.beginPath(); rrPath(x - w / 2, y - h / 2, w, h, 10); ctx.fill();
    }, '20, 40, 12');
    numText(txt, x, y + 1, { size: q.hidden ? 22 : 20, color: q.hidden ? '#a97a20' : P.ink });
    ctx.restore();
  }
  /* واحد و نکتهٔ زمینِ منظم */
  const ys = S.poly.map((p) => p.y);
  const y1 = Math.max.apply(null, ys);
  text(S.regular ? 'همهٔ ضلع‌ها برابرند — متر' : 'اندازه‌ها به متر', FIELD.cx, y1 + 58,
    { size: 17, color: 'rgba(35, 55, 25, .6)' });
}

function drawCart() {
  if (!S.poly.length || S.stage !== 'draw') return;
  const c = posAt(S.s);
  const ang = Math.atan2(c.dy, c.dx);
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.fillStyle = 'rgba(30, 60, 20, .2)';
  ctx.beginPath(); ctx.ellipse(3, 16, 26, 8, 0, 0, TAU); ctx.fill();
  ctx.rotate(ang);
  /* مخزن */
  withShadow(12, 5, .3, () => {
    ctx.fillStyle = P.cartDk;
    wobbleRect(-20, -26, 40, 34, 7, 3, 1.2); ctx.fill();
    ctx.fillStyle = P.cart;
    wobbleRect(-18, -24, 36, 30, 6, 5, 1); ctx.fill();
  }, '20, 40, 12');
  ctx.fillStyle = 'rgba(255,255,255,.3)';
  wobbleRect(-14, -21, 12, 22, 4, 7, .8); ctx.fill();
  /* دسته */
  ctx.strokeStyle = P.metal; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-8, -22); ctx.lineTo(-34, -44); ctx.stroke();
  /* چرخ‌ها */
  const spin = S.s * .06;
  for (const dx of [-13, 13]) {
    ctx.save();
    ctx.translate(dx, 10); ctx.rotate(spin);
    ctx.fillStyle = P.metal;
    wobbleCircle(0, 0, 11, dx, 1); ctx.fill();
    ctx.fillStyle = P.metalLt;
    wobbleCircle(0, 0, 4, dx + 2, .7); ctx.fill();
    ctx.strokeStyle = P.metalLt; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  /* گچِ مانده، بالای گاری */
  const m = metersLeft();
  ctx.save();
  const w = 92, h = 32, bx = c.x - w / 2, by = c.y - 92;
  ctx.fillStyle = m > 0 ? 'rgba(30, 52, 22, .82)' : 'rgba(160, 50, 36, .9)';
  ctx.beginPath(); rrPath(bx, by, w, h, 12); ctx.fill();
  numText(fa(Math.round(m)) + ' متر', c.x, by + h / 2 + 1,
    { size: 18, color: m > 0 ? P.chalk : '#ffd9cf' });
  ctx.restore();
}

function drawPuffs() {
  for (const q of S.puffs) {
    ctx.save();
    ctx.globalAlpha = (1 - q.t) * .7;
    ctx.fillStyle = q.col;
    ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1 + q.t), 0, TAU); ctx.fill();
    ctx.restore();
  }
}

/** قفسهٔ مخزن‌ها — یا انتخاب، یا فشارسنجِ گچ. */
function drawShelf() {
  ctx.fillStyle = 'rgba(30, 52, 22, .3)';
  ctx.beginPath(); rrPath(SHELF.x, SHELF.y, SHELF.w, SHELF.h, 18); ctx.fill();
  ctx.fillStyle = P.woodDk;
  ctx.fillRect(SHELF.x + 10, SHELF.y + SHELF.h - 20, SHELF.w - 20, 14);
  ctx.fillStyle = P.wood;
  ctx.fillRect(SHELF.x + 10, SHELF.y + SHELF.h - 20, SHELF.w - 20, 6);

  if (!S.tanks.length || S.pick >= S.tanks.length) return;

  if (S.stage === 'pick' || S.pick < 0) {
    text('کدام مخزنِ گچ؟', SCENE_W / 2, SHELF.y + 18, { size: 20, family: 'Lalezar', color: '#22371a' });
    for (let i = 0; i < 3; i++) {
      const b = tankBox(i), hot = S.hover === i;
      drawTank(b, S.tanks[i].v, hot, false);
    }
    return;
  }
  /* بعد از انتخاب: همان مخزن، با فشارسنج */
  const b = { x: SCENE_W / 2 - 132, y: SHELF.y + 18, w: 264, h: 88 };
  const frac = chalkPx() ? clamp((chalkPx() - S.s) / chalkPx(), 0, 1) : 0;
  drawTank(b, S.tanks[S.pick].v, false, true, frac);
  /* زنگِ مدرسه = وقت */
  const tw = 440, tx = SCENE_W / 2 - tw / 2, ty = SHELF.y + 140;
  const k = clamp(S.timeLeft / L().time, 0, 1);
  ctx.fillStyle = 'rgba(20, 36, 14, .4)';
  ctx.beginPath(); rrPath(tx, ty, tw, 14, 7); ctx.fill();
  ctx.fillStyle = k > .3 ? P.gold : P.bad;
  ctx.beginPath(); rrPath(tx, ty, tw * k, 14, 7); ctx.fill();
  text('تا زنگِ مدرسه', SCENE_W / 2, ty - 15, { size: 14, color: 'rgba(253,248,234,.85)' });
}

function drawTank(b, v, hot, gauge, frac) {
  const dy = hot ? 3 : 0;
  withShadow(hot ? 18 : 10, hot ? 5 : 4, .32, () => {
    ctx.fillStyle = P.tankDk;
    wobbleRect(b.x, b.y + dy, b.w, b.h, 14, b.x, 1.6); ctx.fill();
    ctx.fillStyle = hot ? '#ffffff' : P.tank;
    wobbleRect(b.x + 3, b.y + 3 + dy, b.w - 6, b.h - 6, 12, b.x + 2, 1.4); ctx.fill();
  }, '20, 40, 12');
  /* گچِ داخل */
  const fr = gauge ? frac : 1;
  ctx.save();
  ctx.beginPath(); rrPath(b.x + 8, b.y + 8 + dy, b.w - 16, b.h - 16, 9); ctx.clip();
  const fy = b.y + b.h - 8 - (b.h - 16) * fr + dy;
  ctx.fillStyle = '#cfdae6';
  ctx.fillRect(b.x + 8, fy, b.w - 16, (b.h - 16) * fr);
  ctx.fillStyle = '#eef4fa';
  ctx.fillRect(b.x + 8, fy, b.w - 16, 4);
  ctx.restore();
  ctx.strokeStyle = 'rgba(120, 130, 110, .4)'; ctx.lineWidth = 1.6;
  for (let i = 1; i < 4; i++) {
    const y = b.y + 8 + (b.h - 16) * i / 4 + dy;
    ctx.beginPath(); ctx.moveTo(b.x + b.w - 34, y); ctx.lineTo(b.x + b.w - 12, y); ctx.stroke();
  }
  numText(fa(v), b.x + b.w / 2, b.y + b.h / 2 - 6 + dy, { size: 40, color: P.ink,
    stroke: 'rgba(255,255,255,.85)', strokeWidth: 6 });
  text('متر گچ', b.x + b.w / 2, b.y + b.h / 2 + 26 + dy, { size: 16, color: P.inkSoft });
}

function drawHUD() {
  ctx.fillStyle = 'rgba(28, 48, 20, .84)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(239, 182, 63, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });

  /* سوت‌های داور = جان */
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 208 - i * 34;
    ctx.save();
    ctx.globalAlpha = i < S.whistle ? 1 : .22;
    ctx.fillStyle = i < S.whistle ? P.gold : '#8d9689';
    ctx.beginPath(); rrPath(x - 13, HUD_H / 2 - 8, 22, 16, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 9, HUD_H / 2 - 2, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(28,48,20,.7)';
    ctx.beginPath(); ctx.arc(x + 9, HUD_H / 2 - 2, 2.6, 0, TAU); ctx.fill();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(253, 248, 234, .55)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: FIELD.cx - 250, y: FIELD.cy - 180, w: 500, h: 360 }], .72);
    const h = tutCard(340, 548, 520,
      ['باید دورِ زمین خط بکشی و به نقطهٔ شروع برگردی.', 'اندازهٔ هر ضلع روی خودش نوشته شده.'], 'خط‌کشِ زمین');
    tutMore(600, 548 + h + 10, S.t, P.ink);
  } else if (st === 1) {
    spot([SHELF], .7);
    tutCard(340, 150, 520, ['یک مخزنِ گچ بردار.',
      'روی هر کدام نوشته چند متر گچ دارد.'], 'مخزن را انتخاب کن');
  } else {
    spot([{ x: FIELD.cx - 250, y: FIELD.cy - 180, w: 500, h: 360 }], .68);
    const h = tutCard(340, 522, 520,
      ['انگشتت را از نقطهٔ شروع، دورِ زمین بکِش.', 'هر متری که می‌روی، یک متر گچ کم می‌شود.',
       'اگر درست انتخاب کرده باشی، سرِ نقطهٔ شروع تمام می‌شود.'], 'حالا خط بکش');
    tutMore(600, 522 + h + 10, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function cartIcon(x, y) {
  ctx.save();
  ctx.translate(x, y + 6);
  ctx.fillStyle = P.cartDk;
  wobbleRect(-20, -26, 40, 34, 7, 3, 1.2); ctx.fill();
  ctx.fillStyle = P.cart;
  wobbleRect(-18, -24, 36, 30, 6, 5, 1); ctx.fill();
  ctx.strokeStyle = P.metal; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-8, -22); ctx.lineTo(-34, -44); ctx.stroke();
  ctx.fillStyle = P.metal;
  for (const dx of [-13, 13]) { wobbleCircle(dx, 10, 11, dx, 1); ctx.fill(); }
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 740, h: 276, y: 142,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: '#6f8062',
    icon: cartIcon,
    title: 'خط‌کشِ زمینِ بازی',
    body: 'باید با گاریِ گچ دورِ زمین خط بکشی و به نقطهٔ شروع برگردی.\nاوّل یکی از سه مخزنِ گچ را بردار — نه کم، نه زیاد.\nاندازهٔ ضلع‌ها روی زمین نوشته شده.',
    btn: BTN_GO, btnLabel: 'برو سرِ زمین', btnHot: S.hover === BTN_GO,
    btnFill: '#5f9c46', btnHotFill: '#6fae54',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#6f8062',
    icon: cartIcon,
    title: L().endless ? 'زمین‌ها آماده شد' : 'همهٔ زمین‌ها خط خورد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ زمین‌ها را کشیدی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'زمینِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#5f9c46', btnHotFill: '#6fae54',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#6f8062',
    icon: (x, y) => { ctx.fillStyle = '#c9c2ae';
      ctx.beginPath(); rrPath(x - 26, y - 14, 44, 30, 10); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 22, y + 2, 12, 0, TAU); ctx.fill();
      ctx.fillStyle = '#8d9689';
      ctx.beginPath(); ctx.arc(x + 22, y + 2, 4.6, 0, TAU); ctx.fill(); },
    title: 'داور سوت زد',
    body: 'امتیاز: ' + fa(S.score) + '\nاوّل محیط را حساب کن، بعد مخزن را بردار.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#5f9c46', btnHotFill: '#6fae54',
  });
}

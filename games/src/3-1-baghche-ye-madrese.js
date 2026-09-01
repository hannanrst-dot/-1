/*!
title: باغچهٔ مدرسه — حل مسئله با رسم شکل
bg: #201a12
*/

/* ═══════════════════════════════════════════════════════════════════════
   باغچهٔ مدرسه — ریاضی سوم، فصل ۳، درس ۱ (حلّ مسئله: رسم شکل)
   ───────────────────────────────────────────────────────────────────────
   کتاب می‌گوید وقتی مسئله را نفهمیدی، شکلش را بکش. مسئله‌های خودش هم
   همین‌اند: «زمین را نصف کردند، نیمِ دیگر را سه قسمت کردند، در یک قسمت
   پیاز کاشتند» — و بچه باید بفهمد آن یک قسمت، یک‌ششمِ کلِ زمین است.

   قانونِ فیزیکیِ بازی همین است:

     بیل هر تکّه را جداگانه می‌بُرد، نه کلِ باغچه را.

   پس وقتی نصفِ زمین را سه قسمت می‌کنی، آن سه تکّه هم‌اندازهٔ نصفِ دیگر
   نیستند؛ هر کدام یک‌ششمِ کلِ باغچه‌اند. بچه این را روی خاک می‌بیند، نه
   در جمله.

   سفارشِ باغبان با کسرهایی از کلِ زمین نوشته شده (۱/۲ هویج، ۱/۶ پیاز)،
   پس بچه باید خودش بفهمد چطور ببُرد تا همه جا شوند. بیل شمرده است، پس
   بی‌حساب بریدن جواب نمی‌دهد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  skyHi:   '#3d5a6b',
  skyLo:   '#d9a86a',
  wallHi:  '#4c3c28',
  wallLo:  '#241a10',
  soil:    '#6b4a2c',
  soilDk:  '#4a3119',
  soilLit: '#825c37',
  edge:    '#8f6a3f',
  edgeLit: '#ab8451',
  grass:   '#4f7a3c',
  grassDk: '#3a5c2c',
  paper:   '#fbf1dc',
  paperDk: '#e6d6b6',
  ink:     '#332617',
  inkSoft: '#7d6b4e',
  brass:   '#d9a840',
  brassDk: '#a2761f',
  good:    '#6fa85c',
  bad:     '#cf5f4a',
  gold:    '#f0c552',
  steel:   '#b9c2c8',
  steelDk: '#77828a',
};

/* ───────── کاشتنی‌ها ───────── */

const CROPS = [
  { name: 'هویج',        col: '#e08a35', dk: '#b26320', leaf: '#4f8a3e' },
  { name: 'کاهو',        col: '#7bb355', dk: '#537f38', leaf: '#8fc766' },
  { name: 'گوجه‌فرنگی',  col: '#d24b46', dk: '#a3332f', leaf: '#4f8a3e' },
  { name: 'پیاز',        col: '#b785c4', dk: '#8b5f9b', leaf: '#6f9a52' },
];

/* ───────── کسرهای صحیح ───────── */

function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function rat(n, d) { const k = gcd(n, d) || 1; return { n: n / k, d: d / k }; }
const addR = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
const subR = (a, b) => rat(a.n * b.d - b.n * a.d, a.d * b.d);
const eqR = (a, b) => a.n * b.d === b.n * a.d;
const ZERO = { n: 0, d: 1 }, ONE = { n: 1, d: 1 };

/* ───────── باغچه‌ها ─────────
   need = [ [شمارهٔ کاشتنی, صورت, مخرج] ... ] از کلِ زمین.              */

const LEVELS = [
  { name: 'باغچهٔ کوچک', cuts: 2,
    need: [[0, 1, 2], [1, 1, 2]],
    hint: 'اوّل زمین را نصف کن. بیل هر تکّه را جدا می‌بُرد.' },
  { name: 'باغچهٔ مدرسه', cuts: 3,
    need: [[0, 1, 3], [1, 1, 6], [2, 1, 3]],
    hint: 'یک‌ششم از کجا می‌آید؟ یک‌سومی را که ببُری پیدا می‌شود.' },
  { name: 'زمینِ کشاورز', cuts: 3,
    need: [[0, 1, 2], [3, 1, 6]],
    hint: 'نصفِ زمین هویج. نیمِ دیگر را سه قسمت کن.' },
  { name: 'باغچهٔ بزرگ', cuts: 4,
    need: [[0, 1, 4], [1, 1, 3], [2, 1, 6], [3, 1, 4]],
    hint: 'چهار کاشتنی و چهار بیل. اوّل نقشه‌ات را توی سرت بکش.' },
  { name: 'باغچهٔ آزاد', cuts: 4, endless: true,
    hint: 'سفارش‌ها پشتِ سرِ هم می‌آیند.' },
];

/* دستورهایی که با ۳ بیل حتماً شدنی‌اند. */
const RECIPES = [
  [[1, 2], [1, 4]], [[1, 2], [1, 3]], [[1, 3], [1, 3], [1, 6]],
  [[1, 4], [1, 4], [1, 2]], [[1, 2], [1, 6], [1, 6]], [[2, 3], [1, 6]],
  [[3, 4], [1, 4]], [[1, 6], [1, 6], [1, 2]], [[1, 3], [1, 2]],
  [[1, 4], [1, 2], [1, 4]], [[5, 6], [1, 6]], [[1, 3], [1, 6], [1, 3]],
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  need: [],
  regions: [],
  cuts: 0, cutsMax: 0,
  tool: 3,              // ۰..۲ بیل‌ها، ۳..۶ کاشتنی‌ها، ۷ پاک‌کن
  hearts: 3,
  score: 0, best: 0,
  gardens: 0,
  winT: 0,
  t: 0, phaseT: 0,
  hover: null,
  shake: 0,
  puffs: [],
  floats: [],
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];

function loadBest() { try { return +localStorage.getItem('baghche-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('baghche-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── چیدمان ───────── */

const HUD_H = 52;
const CARD = { x: 24, y: 88, w: 288, h: 322 };
const CUTC = { x: 24, y: 428, w: 288, h: 96 };
const PLOT = { x: 344, y: 122, w: 656, h: 462 };
const PAL = { x: 1024, y: 88, w: 152 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

function palBox(i) { return { x: PAL.x, y: PAL.y + i * 74, w: PAL.w, h: 64 }; }

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

function randomNeed() {
  const r = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  const crops = [0, 1, 2, 3].sort(() => Math.random() - .5);
  return r.map((f, i) => [crops[i], f[0], f[1]]);
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.need = (lv.endless ? randomNeed() : lv.need).map((q) => ({ crop: q[0], f: rat(q[1], q[2]) }));
  S.regions = [{ x: PLOT.x, y: PLOT.y, w: PLOT.w, h: PLOT.h, v: ONE, crop: -1 }];
  S.cutsMax = lv.cuts;
  S.cuts = lv.cuts;
  S.tool = 3;
  S.winT = 0;
  if (!keep) { S.hearts = 3; S.gardens = 0; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  toast.say(lv.hint, 'info');
}

function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 24 }); }

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.winT > 0) { S.winT -= dt; if (S.winT <= 0) finishGarden(); }
  for (const q of S.puffs) { q.t += dt; q.r += 60 * dt; }
  S.puffs = S.puffs.filter((q) => q.t < .7);
  for (const f of S.floats) { f.t += dt; f.y -= 42 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.5);
  if (S.phase === 'play' && S.tut.on) tutStep(dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── بیل و کاشت ─────────
   بیل فقط همان تکّه‌ای را می‌بُرد که رویش زده‌ای. همین باعث می‌شود
   تکّه‌ها هم‌اندازه نمانند و بچه ببیند «یک قسمت از سه قسمتِ نصف» چقدر
   از کلِ زمین است.                                                    */

function cutRegion(i, k) {
  if (S.cuts <= 0) {
    S.shake = .22; sfx.nope();
    toast.say('بیل دیگر نمانده', 'bad');
    return;
  }
  const r = S.regions[i];
  const horiz = r.w >= r.h;
  const parts = [];
  for (let j = 0; j < k; j++) {
    parts.push({
      x: horiz ? r.x + j * r.w / k : r.x,
      y: horiz ? r.y : r.y + j * r.h / k,
      w: horiz ? r.w / k : r.w,
      h: horiz ? r.h : r.h / k,
      v: rat(r.v.n, r.v.d * k),
      crop: r.crop,
    });
  }
  S.regions.splice(i, 1, ...parts);
  S.cuts--;
  sfx.tone(190, .18, 'sawtooth', .06);
  S.puffs.push({ x: r.x + r.w / 2, y: r.y + r.h / 2, r: 10, t: 0 });
  checkWin();
}

function plant(i, crop) {
  const r = S.regions[i];
  if (r.crop === crop) { r.crop = -1; sfx.tap(); checkWin(); return; }
  r.crop = crop;
  sfx.place();
  bits.add(r.x + r.w / 2, r.y + r.h / 2, 8, 'dot',
    [CROPS[crop].col, CROPS[crop].leaf, '#fff'], { speed: 110, lift: 40, size: 3.2, life: .5 });
  checkWin();
}

function clearRegion(i) { S.regions[i].crop = -1; sfx.tap(); checkWin(); }

/** مساحتِ هر کاشتنی، به‌صورتِ کسرِ دقیق. */
function tally(crop) {
  let s = ZERO;
  for (const r of S.regions) if (r.crop === crop) s = addR(s, r.v);
  return s;
}
function emptyPart() {
  let s = ONE;
  for (const r of S.regions) if (r.crop >= 0) s = subR(s, r.v);
  return s;
}

function checkWin() {
  for (let c = 0; c < CROPS.length; c++) {
    const want = S.need.find((q) => q.crop === c);
    const got = tally(c);
    if (want ? !eqR(got, want.f) : got.n !== 0) return;
  }
  if (S.winT <= 0) { S.winT = .6; sfx.good(); }
}

function finishGarden() {
  const pts = 400 + S.cuts * 150;
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  S.gardens++;
  floatText(PLOT.x + PLOT.w / 2, PLOT.y + 60, `+${fa(pts)}`, P.gold);
  bits.confetti(PLOT.x + PLOT.w / 2, PLOT.y + PLOT.h / 2, 70,
    [P.gold, ...CROPS.map((c) => c.col), '#fff']);
  sfx.win();
  S.phase = 'won'; S.phaseT = 0;
}

function giveUp() {
  if (S.phase !== 'play') return;
  S.hearts--;
  S.shake = .3;
  sfx.nope();
  if (S.hearts <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.regions = [{ x: PLOT.x, y: PLOT.y, w: PLOT.w, h: PLOT.h, v: ONE, crop: -1 }];
  S.cuts = S.cutsMax;
  toast.say('زمین صاف شد — یک دل کم شد', 'bad');
}

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 30) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 1 && S.regions.length > 1) { S.tut.step = 2; S.tut.t = 0; }
  if (S.tut.step === 2 && S.tut.t > 30) S.tut.on = false;
}

/* ───────── ورودی ───────── */

const PAL_N = 8;                       // ۳ بیل + ۴ کاشتنی + پاک‌کن

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  for (let i = 0; i < PAL_N; i++) if (inRect(p, palBox(i))) return { tool: i };
  if (inRect(p, { x: PAL.x, y: PAL.y + PAL_N * 74 + 8, w: PAL.w, h: 52 })) return { reset: true };
  for (let i = 0; i < S.regions.length; i++) {
    const r = S.regions[i];
    if (p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h) return { region: i };
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
  if (S.phase === 'won') {
    if (!h) return;
    if (L().endless) startLevel(S.level, true);
    else if (S.level + 1 < LEVELS.length) startLevel(S.level + 1, true);
    else { S.score = 0; startLevel(0); }
    return;
  }
  if (S.phase === 'lost') { if (h) { S.score = 0; startLevel(S.level); } return; }
  if (!h || S.winT > 0) return;
  if (h.reset) return giveUp();
  if (h.tool !== undefined) { S.tool = h.tool; sfx.tap(); return; }
  if (h.region !== undefined) {
    if (S.tool < 3) return cutRegion(h.region, S.tool + 2);
    if (S.tool === 7) return clearRegion(h.region);
    return plant(h.region, S.tool - 3);
  }
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
  if (d === 1) { numText(fa(n), cx, cy, { size, color }); return; }
  numText(fa(n), cx, cy - size * .42, { size, color });
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, size * .07); ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - size * .4, cy); ctx.lineTo(cx + size * .4, cy);
  ctx.stroke();
  ctx.restore();
  numText(fa(d), cx, cy + size * .5, { size, color });
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
  }, '30, 18, 6');
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

/** یک بوتهٔ کوچک از هر کاشتنی. */
function plantIcon(c, x, y, s) {
  const C = CROPS[c];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (c === 0) {                       // هویج
    ctx.fillStyle = C.col;
    ctx.beginPath();
    ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.lineTo(0, 20);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.dk; ctx.lineWidth = 1.4;
    for (const k of [-3, 0, 3]) { ctx.beginPath(); ctx.moveTo(k, 4); ctx.lineTo(k * .4, 12); ctx.stroke(); }
    ctx.strokeStyle = C.leaf; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (const a of [-.6, 0, .6]) {
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.sin(a) * 9, -10, Math.sin(a) * 13, -19);
      ctx.stroke();
    }
  } else if (c === 1) {                // کاهو
    ctx.fillStyle = C.dk;
    wobbleCircle(0, 4, 14, x + y, 1.4); ctx.fill();
    ctx.fillStyle = C.col;
    wobbleCircle(0, 2, 11, x + y + 1, 1.2); ctx.fill();
    ctx.fillStyle = C.leaf;
    wobbleCircle(-2, 0, 6, x + y + 2, 1); ctx.fill();
  } else if (c === 2) {                // گوجه
    ctx.strokeStyle = C.leaf; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(0, -10); ctx.stroke();
    for (const p2 of [[-9, 2], [9, 4], [0, -8]]) {
      ctx.fillStyle = C.col;
      wobbleCircle(p2[0], p2[1], 7, x + p2[0], 1); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      ctx.beginPath(); ctx.arc(p2[0] - 2.4, p2[1] - 2.4, 2.2, 0, TAU); ctx.fill();
    }
  } else {                             // پیاز
    ctx.fillStyle = C.dk;
    wobbleEllipse(0, 6, 11, 12, 0, x + y, 1.2); ctx.fill();
    ctx.fillStyle = C.col;
    wobbleEllipse(-1, 5, 8, 10, 0, x + y + 1, 1); ctx.fill();
    ctx.strokeStyle = C.leaf; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (const a of [-.5, 0, .5]) {
      ctx.beginPath();
      ctx.moveTo(0, -4); ctx.quadraticCurveTo(Math.sin(a) * 7, -14, Math.sin(a) * 11, -22);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#201a12');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 13;
    ctx.translate(Math.sin(S.t * 58) * k, Math.cos(S.t * 45) * k * .5);
  }

  drawYard();
  drawPlot();
  bits.draw();
  ctx.restore();

  drawCard();
  drawCuts();
  drawPalette();
  drawEmpty();
  drawFloats();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    ctx.save();
    ctx.translate(PLOT.x + PLOT.w / 2 - SCENE_W / 2, 0);
    toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
    ctx.restore();
  }

  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.12, 'rgba(26, 14, 4, .42)');
}

/* پس‌زمینه عمداً ساده است: باغچه باید قهرمانِ صحنه باشد. */
function drawYard() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, SCENE_H);
  g.addColorStop(0, '#5d8c46');
  g.addColorStop(.45, P.grass);
  g.addColorStop(1, '#2f4d24');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  const gl = ctx.createRadialGradient(300, 140, 40, 300, 140, 900);
  gl.addColorStop(0, 'rgba(255, 236, 176, .16)');
  gl.addColorStop(1, 'rgba(255, 236, 176, 0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  ctx.save();
  ctx.globalAlpha = .2;
  ctx.strokeStyle = P.grassDk; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  for (let i = 0; i < 190; i++) {
    const x = noise1(i * 3.7) * SCENE_W, y = HUD_H + 8 + noise1(i * 9.1) * (SCENE_H - HUD_H - 16);
    const sw = Math.sin(S.t * .8 + i) * 2.6;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + sw, y - 9 - noise1(i) * 7);
    ctx.stroke();
  }
  ctx.restore();

  /* چند سنگ و گلِ ریزِ حیاط */
  for (let i = 0; i < 9; i++) {
    const x = noise1(i * 11.3) * SCENE_W, y = 640 + noise1(i * 5.7) * 100;
    ctx.fillStyle = 'rgba(120, 128, 104, .5)';
    wobbleEllipse(x, y, 11 + noise1(i) * 8, 6 + noise1(i * 2) * 4, 0, i * 3, 1.2); ctx.fill();
  }
  for (let i = 0; i < 12; i++) {
    const x = noise1(i * 7.7) * SCENE_W, y = 600 + noise1(i * 13.1) * 150;
    ctx.fillStyle = ['#f0d75c', '#f0f0e0', '#e8a0c0'][i % 3];
    ctx.globalAlpha = .55;
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * TAU;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * 3.4, y + Math.sin(a) * 3.4, 2.4, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function drawPlot() {
  /* قابِ چوبیِ باغچه */
  withShadow(24, 12, .4, () => {
    ctx.fillStyle = P.edge;
    wobbleRect(PLOT.x - 20, PLOT.y - 20, PLOT.w + 40, PLOT.h + 40, 8, 31, 2); ctx.fill();
  }, '30, 18, 6');
  ctx.fillStyle = P.edgeLit;
  wobbleRect(PLOT.x - 20, PLOT.y - 20, PLOT.w + 40, 12, 5, 33, 1); ctx.fill();
  ctx.fillStyle = P.soilDk;
  ctx.fillRect(PLOT.x, PLOT.y, PLOT.w, PLOT.h);

  const hov = S.hover && S.hover.region !== undefined ? S.hover.region : -1;
  for (let i = 0; i < S.regions.length; i++) {
    const r = S.regions[i];
    const hot = i === hov && S.phase === 'play';
    /* خاک */
    ctx.fillStyle = r.crop >= 0 ? P.soilLit : P.soil;
    ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
    ctx.save();
    ctx.beginPath(); ctx.rect(r.x + 2, r.y + 2, r.w - 4, r.h - 4); ctx.clip();
    ctx.globalAlpha = .2;
    ctx.strokeStyle = P.soilDk; ctx.lineWidth = 3;
    for (let y = r.y + 10; y < r.y + r.h; y += 14) {
      ctx.beginPath();
      ctx.moveTo(r.x, y);
      for (let x = r.x; x < r.x + r.w; x += 22) ctx.lineTo(x, y + Math.sin(x * .06) * 2);
      ctx.stroke();
    }
    ctx.restore();

    /* بوته‌ها */
    if (r.crop >= 0) {
      const cols = Math.max(1, Math.min(5, Math.round(r.w / 66)));
      const rows = Math.max(1, Math.min(4, Math.round(r.h / 66)));
      const s = clamp(Math.min(r.w / (cols * 46), r.h / (rows * 52)), .5, 1.25);
      for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) {
        plantIcon(r.crop, r.x + (a + .5) * r.w / cols, r.y + (b + .5) * r.h / rows - 6 * s, s);
      }
    }

    /* لبهٔ تکّه */
    ctx.strokeStyle = 'rgba(38, 24, 10, .55)'; ctx.lineWidth = 3;
    ctx.strokeRect(r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3);
    ctx.strokeStyle = 'rgba(255, 232, 190, .16)'; ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(r.x + 3, r.y + r.h - 3); ctx.lineTo(r.x + 3, r.y + 3); ctx.lineTo(r.x + r.w - 3, r.y + 3);
    ctx.stroke();

    /* کسرِ همین تکّه از کلِ زمین */
    if (r.w > 54 && r.h > 44) {
      ctx.save();
      ctx.globalAlpha = .8;
      const bw = 40, bh = 34;
      ctx.fillStyle = 'rgba(24, 16, 6, .5)';
      ctx.beginPath();
      rrPath(r.x + r.w - bw - 6, r.y + r.h - bh - 6, bw, bh, 7);
      ctx.fill();
      frac(r.x + r.w - bw / 2 - 6, r.y + r.h - bh / 2 - 6, r.v.n, r.v.d, 17, '#f6e8cc');
      ctx.restore();
    }
    if (hot) {
      ctx.save();
      ctx.globalAlpha = .26;
      ctx.fillStyle = S.tool < 3 ? '#fff' : (S.tool === 7 ? '#ffd0c0' : CROPS[S.tool - 3].col);
      ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
      ctx.restore();
      ctx.strokeStyle = P.gold; ctx.lineWidth = 4;
      ctx.strokeRect(r.x + 3, r.y + 3, r.w - 6, r.h - 6);
    }
  }

  /* گردِ بیل */
  for (const q of S.puffs) {
    ctx.save();
    ctx.globalAlpha = (1 - q.t / .7) * .5;
    ctx.fillStyle = '#c9ad84';
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * TAU;
      wobbleCircle(q.x + Math.cos(a) * q.r, q.y + Math.sin(a) * q.r * .6, 14, k * 3, 1.4);
      ctx.fill();
    }
    ctx.restore();
  }

  if (S.winT > 0) {
    ctx.save();
    ctx.globalAlpha = .5 + .3 * Math.sin(S.t * 12);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 7;
    ctx.strokeRect(PLOT.x - 10, PLOT.y - 10, PLOT.w + 20, PLOT.h + 20);
    ctx.restore();
  }
}

/* ───────── کارتِ سفارش، بیل‌ها، جعبه‌ابزار ───────── */

function drawCard() {
  const b = CARD;
  withShadow(20, 9, .4, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 41, 2); ctx.fill();
  }, '30, 18, 6');
  ctx.fillStyle = P.grass;
  wobbleRect(b.x, b.y, b.w, 11, 5, 43, .8); ctx.fill();
  text('سفارشِ باغبان', b.x + b.w / 2, b.y + 38, { size: 22, family: 'Lalezar', color: P.inkSoft });
  text('از کلِ زمین', b.x + b.w / 2, b.y + 62, { size: 14, color: P.inkSoft });

  for (let i = 0; i < S.need.length; i++) {
    const q = S.need[i];
    const y = b.y + 100 + i * 54;
    const got = tally(q.crop);
    const ok = eqR(got, q.f);
    ctx.save();
    ctx.fillStyle = ok ? 'rgba(111, 168, 92, .22)' : 'rgba(125, 107, 78, .09)';
    ctx.beginPath(); rrPath(b.x + 14, y - 23, b.w - 28, 46, 10); ctx.fill();
    ctx.restore();
    plantIcon(q.crop, b.x + b.w - 34, y - 6, .62);
    text(CROPS[q.crop].name, b.x + b.w - 62, y, { size: 15, color: P.ink, align: 'right' });
    frac(b.x + 96, y, q.f.n, q.f.d, 24, P.ink);
    if (ok) {
      ctx.strokeStyle = P.good; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.x + 32, y); ctx.lineTo(b.x + 40, y + 8); ctx.lineTo(b.x + 54, y - 10);
      ctx.stroke();
    } else if (got.n !== 0) {
      frac(b.x + 42, y, got.n, got.d, 19, P.bad);
    }
  }
}

function drawCuts() {
  const b = CUTC;
  withShadow(16, 8, .34, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 12, 51, 2); ctx.fill();
  }, '30, 18, 6');
  ctx.fillStyle = P.brass;
  wobbleRect(b.x, b.y, b.w, 10, 4, 53, .8); ctx.fill();
  text('بیل‌های مانده', b.x + b.w / 2, b.y + 32, { size: 17, family: 'Lalezar', color: P.inkSoft });
  const n = S.cutsMax, step = Math.min(46, (b.w - 50) / Math.max(1, n));
  for (let i = 0; i < n; i++) {
    const x = b.x + b.w / 2 - (n - 1) * step / 2 + i * step;
    const alive = i < S.cuts;
    ctx.save();
    ctx.translate(x, b.y + 66);
    ctx.globalAlpha = alive ? 1 : .22;
    ctx.strokeStyle = '#a2761f'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(0, -8); ctx.stroke();
    ctx.fillStyle = alive ? P.steel : '#8e948a';
    ctx.beginPath();
    ctx.moveTo(-9, -8); ctx.lineTo(9, -8); ctx.lineTo(7, -22); ctx.lineTo(-7, -22);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

function drawPalette() {
  const labels = ['به ۲ قسمت', 'به ۳ قسمت', 'به ۴ قسمت',
    CROPS[0].name, CROPS[1].name, CROPS[2].name, CROPS[3].name, 'پاک کن'];
  for (let i = 0; i < PAL_N; i++) {
    const b = palBox(i);
    const on = S.tool === i;
    const hot = S.hover && S.hover.tool === i;
    withShadow(10, on ? 3 : 6, .32, () => {
      ctx.fillStyle = on ? '#fffaf0' : (hot ? '#f4e9d2' : P.paperDk);
      wobbleRect(b.x, b.y + (on ? 2 : 0), b.w, b.h, 12, b.y, 1.4); ctx.fill();
    }, '30, 18, 6');
    const col = i < 3 ? P.brassDk : (i === 7 ? '#8a5a52' : CROPS[i - 3].col);
    ctx.fillStyle = col;
    wobbleRect(b.x, b.y + (on ? 2 : 0), 8, b.h, 4, b.y + 1, .8); ctx.fill();
    if (i < 3) {
      /* بیلی که تکّه را به i+2 قسمت می‌کند */
      ctx.save();
      ctx.translate(b.x + b.w - 34, b.y + b.h / 2 + (on ? 2 : 0));
      ctx.fillStyle = 'rgba(60, 44, 22, .18)';
      ctx.fillRect(-20, -14, 40, 28);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 2;
      ctx.strokeRect(-20, -14, 40, 28);
      for (let k = 1; k < i + 2; k++) {
        ctx.strokeStyle = P.bad; ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-20 + k * 40 / (i + 2), -14); ctx.lineTo(-20 + k * 40 / (i + 2), 14);
        ctx.stroke();
      }
      ctx.restore();
    } else if (i === 7) {
      ctx.save();
      ctx.translate(b.x + b.w - 34, b.y + b.h / 2 + (on ? 2 : 0));
      ctx.fillStyle = '#d7a99a';
      wobbleRect(-15, -11, 30, 22, 4, 7, 1); ctx.fill();
      ctx.fillStyle = '#b3806f';
      wobbleRect(-15, -1, 30, 12, 3, 9, .8); ctx.fill();
      ctx.restore();
    } else {
      plantIcon(i - 3, b.x + b.w - 34, b.y + b.h / 2 + 6 + (on ? 2 : 0), .72);
    }
    text(labels[i], b.x + 18, b.y + b.h / 2 + (on ? 2 : 0),
      { size: 14, color: P.ink, align: 'left' });
  }
  /* دکمهٔ صاف کردنِ زمین */
  const rb = { x: PAL.x, y: PAL.y + PAL_N * 74 + 8, w: PAL.w, h: 52 };
  button(rb, 'زمین را صاف کن', {
    hot: S.hover && S.hover.reset, disabled: S.phase !== 'play',
    fill: '#8a5a52', hotFill: '#9d6a60', size: 15, r: 12, family: 'Vazirmatn',
  });
}

/** جوابِ سؤالِ کتاب: چه مقدار از زمین باقی مانده؟ خودِ شکل می‌گوید. */
function drawEmpty() {
  const e = emptyPart();
  const cx = PLOT.x + PLOT.w / 2, y = PLOT.y + PLOT.h + 60;
  text('خالی مانده', cx + 84, y, { size: 18, color: 'rgba(251, 241, 220, .78)' });
  frac(cx - 6, y, e.n, e.d, 30, '#fbf1dc');
  text(`${fa(S.regions.length)} تکّه`, cx - 150, y, { size: 15, color: 'rgba(251, 241, 220, .5)' });
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.5, 0, 1);
    numText(f.txt, f.x, f.y, { size: f.size, color: f.col, alpha: k });
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(26, 18, 8, .78)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(217, 168, 64, .45)';
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 32 - i * 33;
    ctx.save();
    ctx.globalAlpha = i < S.hearts ? 1 : .22;
    ctx.fillStyle = i < S.hearts ? '#d4574a' : '#5b503f';
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
  text(L().name, SCENE_W - 146, HUD_H / 2, { size: 18, family: 'Lalezar', color: '#f4e9d2', align: 'right' });
  numText(fa(S.score), 26, HUD_H / 2 - 1, { size: 26, color: P.gold, align: 'left' });
  text(`رکورد ${fa(S.best)}`, 108, HUD_H / 2, { size: 14, color: 'rgba(244, 233, 210, .58)', align: 'left' });
  if (S.gardens) text(`${fa(S.gardens)} باغچه`, 216, HUD_H / 2, { size: 15, color: P.good, align: 'left' });
}

/* ───────── آموزش ───────── */

function drawTutorial() {
  const st = S.tut.step;
  let holes = [], msg = '', hand = null;

  if (st === 0) {
    holes = [{ x: CARD.x - 6, y: CARD.y - 6, w: CARD.w + 12, h: CARD.h + 12 }];
    msg = 'باغبان می‌گوید چه کسری از کلِ زمین را با چه چیزی بکاری.';
  } else if (st === 1) {
    holes = [{ x: PAL.x - 8, y: PAL.y - 8, w: PAL.w + 16, h: 3 * 74 + 8 },
             { x: PLOT.x - 24, y: PLOT.y - 24, w: PLOT.w + 48, h: PLOT.h + 48 }];
    msg = 'یک بیل بردار و روی زمین بزن. بیل فقط همان تکّه‌ای را می‌بُرد که رویش زده‌ای.';
    hand = { x: PAL.x - 30, y: PAL.y + 30 };
  } else {
    holes = [{ x: PLOT.x - 24, y: PLOT.y - 24, w: PLOT.w + 48, h: PLOT.h + 110 }];
    msg = 'روی هر تکّه کسرش نوشته شده. کاشتنی را بردار و روی تکّه‌ها بکار.';
  }

  spot(holes, .58);
  const w = 540, h = 96, x = PLOT.x + PLOT.w / 2 - w / 2, y = 660;
  paper(x, y, w, h, P.paper, 61, 14, .45);
  ctx.fillStyle = P.grass;
  wobbleRect(x, y, 9, h, 4, 63, .8); ctx.fill();
  textWrap(msg, x + w / 2 + 6, y + h / 2 - 12, w - 54, { size: 17, color: P.ink, lineHeight: 26 });
  if (TUT_TAP.indexOf(st) >= 0) tutMore(x + w / 2, y - 46, S.t, P.ink);
  if (hand) pointHand(hand.x, hand.y);
}

/* ───────── پرده‌ها ───────── */

function gardenIcon(x, y) {
  ctx.save();
  ctx.translate(x - 60, y - 26);
  ctx.fillStyle = P.soil;
  ctx.fillRect(0, 0, 120, 56);
  ctx.strokeStyle = P.edge; ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, 120, 56);
  ctx.strokeStyle = 'rgba(38, 24, 10, .6)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(60, 56); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(60, 28); ctx.lineTo(120, 28); ctx.stroke();
  ctx.restore();
  plantIcon(0, x - 30, y - 12, .6);
  plantIcon(1, x + 30, y - 22, .55);
  plantIcon(2, x + 30, y + 8, .55);
}

function drawIntro() {
  overlay({
    t: S.phaseT,
    w: 750, h: 344, y: 168,
    title: 'باغچهٔ مدرسه',
    body: 'باغبان می‌گوید هر کاشتنی چه کسری از کلِ زمین را بگیرد.\nزمین را با بیل ببُر تا تکّه‌ها جور شوند، بعد بکار.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'برویم باغچه',
    paper: P.paper, band: P.grass, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#4f7a3c', btnHotFill: '#5d8c48',
    icon: gardenIcon,
  });
}

function drawWon() {
  const last = !L().endless && S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT,
    w: 720, h: 320, y: 190,
    title: 'باغچه آماده شد!',
    body: S.cuts > 0
      ? `${fa(S.cuts)} بیل هم دست‌نخورده ماند. امتیازت ${fa(S.score)} شد.`
      : `همهٔ بیل‌ها را خرج کردی. امتیازت ${fa(S.score)} شد.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: L().endless ? 'باغچهٔ بعدی' : (last ? 'از اوّل' : 'باغچهٔ بعدی'),
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#4f7a3c', btnHotFill: '#5d8c48',
    icon: (x, y) => star(x, y + 6, 26, P.gold, Math.sin(S.t * 2) * .2),
  });
}

function drawLost() {
  overlay({
    t: S.phaseT,
    w: 720, h: 306, y: 196,
    title: 'زمین خراب شد',
    body: 'قبل از بیل زدن، شکلِ باغچه را توی سرت بکش. بیل‌ها شمرده‌اند.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'دوباره',
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#cf5f4a', btnHotFill: '#dd6f59',
    icon: gardenIcon,
  });
}

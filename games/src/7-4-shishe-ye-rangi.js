/*!
title: کارگاهِ شیشهٔ رنگی — نمودار دایره‌ای
bg: #1b1410
*/

/* ═══════════════════════════════════════════════════════════════════════
   کارگاهِ شیشهٔ رنگی — ریاضی سوم، فصل ۷، درس ۴ (نمودار دایره‌ای)
   ───────────────────────────────────────────────────────────────────────
   کتاب می‌گوید: «دایره‌ی زیر ۱۲ قسمت دارد. کارهای روزانهٔ این دانش‌آموز
   را با رنگ کردن این قسمت‌ها نشان دهید»، و در تمرینِ بعد: «هر قسمت از
   دایره، نشان‌دهندهٔ ۵ کتاب است.»

   اینجا آن دایره یک پنجرهٔ گلِ شیشه‌ایِ کارگاه است. سفارش می‌رسد — مثلاً
   ۲۵ کتابِ سرگرمی و ۱۰ کتابِ درسی — و روی برگه، هر مقدار به شکلِ یک
   نوارِ خط‌کشی‌شده کنارِ خودش کشیده شده که خط‌هایش پنج‌تا پنج‌تا دسته
   شده‌اند. هر شیشه که در پنجره می‌گذاری، یک دسته از آن نوار روشن می‌شود.

   پس بچّه «۲۵ تقسیم بر ۵» را حساب نمی‌کند؛ می‌بیند که نوار با پنج شیشه
   پُر می‌شود. عددِ جواب هیچ‌جا نوشته نیست — فقط سفارش، و کارِ خودش.

   آفتاب از پشتِ پنجره می‌تابد و همان نسبت‌ها را روی زمینِ کارگاه پهن
   می‌کند: نمودار، سایهٔ خودش را هم نشان می‌دهد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  wall:  '#3a2a1e', wallLo: '#1d130c', wallHi: '#553d2a',
  stone: '#4a3a2c', stoneDk: '#2a1e14', stoneLt: '#6d5843',
  wood:  '#7a5231', woodDk: '#432a12', woodLt: '#a97a49',
  lead:  '#4b4740', leadLt: '#7d786c', leadDk: '#2a2620',
  brass: '#cfa74e', brassDk: '#8f7327', brassLt: '#f2dd99',
  paper: '#f4e9d0', card: '#fbf3e0', ink: '#33261a', inkSoft: '#8a7a63',
  good:  '#5da26f', bad: '#cd5b45', gold: '#eab53f', sun: '#ffe0a8',
};

/* شیشه‌های کارگاه */
const GLASS = [
  { n: 'یاقوتی',  c: '#cf4b3f', d: '#8c2a22' },
  { n: 'فیروزه‌ای', c: '#3f9bb0', d: '#226878' },
  { n: 'زمرّدی',  c: '#4f9b5c', d: '#2c6a37' },
  { n: 'کهربایی', c: '#dda63a', d: '#a1701a' },
  { n: 'نیلی',    c: '#6a63bd', d: '#403a86' },
];

const THEMES = [
  { t: 'روزِ من',       u: 'ساعت', cats: ['مدرسه', 'بازی', 'خواب', 'غذا', 'درس'] },
  { t: 'قفسهٔ کتاب',    u: 'کتاب', cats: ['درسی', 'علمی', 'سرگرمی', 'داستان', 'شعر'] },
  { t: 'باغچهٔ حیاط',   u: 'گل',   cats: ['سرخ', 'زرد', 'سفید', 'بنفش', 'نارنجی'] },
  { t: 'صندوقِ بازار',  u: 'میوه', cats: ['سیب', 'پرتقال', 'انگور', 'انار', 'خرما'] },
];

const LEVELS = [
  { name: 'شش‌قسمتی', n: 6,  cats: 3, scale: 1, quota: 3, time: 76,
    hint: 'شیشه را از قفسه بردار و در پنجره بگذار.' },
  { name: 'دوازده ساعتِ روز', n: 12, cats: 4, scale: 1, quota: 3, time: 88,
    hint: 'نوارِ کنارِ هر سفارش می‌گوید چقدر مانده.' },
  { name: 'هر قسمت پنج‌تا', n: 10, cats: 3, scale: 5, quota: 3, time: 84,
    hint: 'حالا هر شیشه پنج‌تا حساب می‌شود.' },
  { name: 'سفارشِ بزرگ', n: 12, cats: 4, scale: 5, quota: 4, time: 92,
    hint: 'نوار را نگاه کن: چند دستهٔ پنج‌تایی؟' },
  { name: 'تا آفتاب هست', n: 12, cats: 4, scale: 0, quota: 0, time: 88, endless: true,
    hint: 'تا آفتاب هست، پنجره بساز.' },
];

const ROSE = { x: 372, y: 400, r: 202 };
const ORDER = { x: 640, y: 88, w: 330, h: 456 };
const RACK = { x: 992, y: 88, w: 184, h: 456 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0, n: 6, scale: 1,
  theme: 0, cats: [],        /* { name, col, qty } */
  pane: [],                  /* رنگِ هر قسمت، یا ‑۱ برای خالی */
  brush: 0,
  done: 0, lit: 0,
  timeLeft: 0, panesLeft: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  motes: [], drawing: false,
  t: 0, phaseT: 0, hover: null, shake: 0, nope: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const paneCount = (k) => S.pane.reduce((a, v) => a + (v === k ? 1 : 0), 0);

function loadBest() { try { return +localStorage.getItem('shishe-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('shishe-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();

/* ───────── سفارشِ تازه ───────── */

function newOrder() {
  const lv = L();
  const n = lv.n;
  const k = lv.cats;
  const scale = lv.scale || [1, 2, 5][R(0, 2)];
  /* n قسمت را بینِ k دسته پخش می‌کنیم، هر دسته دستِ‌کم یکی */
  const part = new Array(k).fill(1);
  for (let i = 0; i < n - k; i++) part[R(0, k - 1)]++;
  const th = R(0, THEMES.length - 1);
  const names = THEMES[th].cats.slice();
  const cols = [0, 1, 2, 3, 4];
  for (let i = cols.length - 1; i > 0; i--) { const j = R(0, i); const t = cols[i]; cols[i] = cols[j]; cols[j] = t; }
  S.theme = th;
  S.n = n; S.scale = scale;
  S.cats = [];
  for (let i = 0; i < k; i++) S.cats.push({ name: names[i], col: cols[i], qty: part[i] * scale });
  S.pane = new Array(n).fill(-1);
  S.brush = S.cats[0].col;
  S.done = 0;
  S.lit = 0;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.panesLeft = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newOrder();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

newOrder();
whenFontsReady(() => runLoop(step));

const catOK = (i) => paneCount(S.cats[i].col) * S.scale === S.cats[i].qty;
const allSet = () => S.cats.every((_, i) => catOK(i)) && S.pane.every((v) => v >= 0);

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.nope > 0) S.nope -= dt;
  if (S.lit > 0 && S.lit < 1) S.lit = Math.min(1, S.lit + dt * 1.6);

  if (Math.random() < dt * 8 && S.motes.length < 60) {
    S.motes.push({ x: 120 + Math.random() * 700, y: 200 + Math.random() * 500,
                   r: .8 + Math.random() * 1.8, v: 6 + Math.random() * 14, p: Math.random() * 6 });
  }
  for (const m of S.motes) { m.y -= m.v * dt; m.x += Math.sin(m.p + S.t * .6) * 8 * dt; }
  S.motes = S.motes.filter((m) => m.y > 140);

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.done) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; losePane('آفتاب رفت و کارگاه بسته شد!'); }
    }
    if (S.done) { S.done += dt; if (S.done > 2.3) { newOrder(); S.timeLeft = L().time; } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function losePane(msg) {
  if (S.done) return;
  S.panesLeft--;
  S.combo = 0;
  S.shake = .5;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.panesLeft <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newOrder();
}

/** شیشه گذاشتن یا برداشتن. */
function setPane(i, remove) {
  if (S.phase !== 'play' || S.done) return;
  if (i < 0 || i >= S.n) return;
  if (remove) {
    if (S.pane[i] < 0) return;
    S.pane[i] = -1;
    sfx.tone(300, .06, 'sine', .05);
  } else {
    if (S.pane[i] === S.brush) return;
    S.pane[i] = S.brush;
    sfx.tone(660 + i * 12, .07, 'triangle', .06);
    const a = (i + .5) / S.n * TAU - Math.PI / 2;
    bits.add(ROSE.x + Math.cos(a) * ROSE.r * .66, ROSE.y + Math.sin(a) * ROSE.r * .66, 5, 'dot',
      [GLASS[S.brush].c, '#fff'], { speed: 120, lift: 30, size: 3, life: .4, grav: 260 });
  }
  if (S.tut.on && S.tut.step === 1 && S.pane.filter((v) => v >= 0).length >= 2) { S.tut.step = 2; S.tut.t = 0; }
  if (allSet()) finish();
}

function finish() {
  S.done = .001;
  S.lit = .001;
  S.combo++;
  S.cleared++;
  S.score += 320 + S.n * 20 + Math.round(S.timeLeft * 4) + Math.min(S.combo, 6) * 70;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(ROSE.x, ROSE.y, 48, [P.gold, P.brassLt, GLASS[0].c, GLASS[1].c, '#fff']);
  sfx.win();
  toast.say('آفتاب از پنجره تابید!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function glassBox(i) {
  const h = 62, gap = 12;
  return { x: RACK.x + 18, y: RACK.y + 62 + i * (h + gap), w: RACK.w - 36, h };
}

function paneAt(p) {
  const dx = p.x - ROSE.x, dy = p.y - ROSE.y;
  const d = Math.hypot(dx, dy);
  if (d > ROSE.r || d < 44) return -1;
  let a = Math.atan2(dy, dx) + Math.PI / 2;
  a = ((a % TAU) + TAU) % TAU;
  return Math.floor(a / (TAU / S.n)) % S.n;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.drawing) { const i = paneAt(p); if (i >= 0 && S.pane[i] < 0) setPane(i, false); return; }
  S.hover = null;
  const i = paneAt(p);
  if (i >= 0) S.hover = { k: 'pane', i };
  for (let g = 0; g < S.cats.length; g++) if (inRect(p, glassBox(g))) S.hover = { k: 'glass', i: g };
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
  for (let g = 0; g < S.cats.length; g++) if (inRect(p, glassBox(g))) { S.brush = S.cats[g].col; sfx.tap(); return; }
  const i = paneAt(p);
  if (i >= 0) {
    if (S.pane[i] >= 0) setPane(i, true);
    else { S.drawing = true; setPane(i, false);
      try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ } }
  }
});

cv.addEventListener('pointerup', () => { S.drawing = false; });
cv.addEventListener('pointercancel', () => { S.drawing = false; });

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
  ctx.fillStyle = `rgba(10, 6, 3, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(244, 233, 208, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '10, 6, 3');
  ctx.fillStyle = P.brassDk;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#7a6a52' }); yy += 30; }
  return h + 20;
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintShopStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallLo); g.addColorStop(.4, P.wall); g.addColorStop(1, '#170f09');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.globalAlpha = .45;
  ctx.fillStyle = texStone(P.stone, P.stoneLt);
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* سنگ‌چینِ دیوار */
  ctx.strokeStyle = 'rgba(0,0,0,.34)'; ctx.lineWidth = 3;
  for (let y = HUD_H + 52; y < 620; y += 52) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke();
    const off = ((y / 52) | 0) % 2 ? 46 : 0;
    for (let x = off; x < SCENE_W; x += 92) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 52); ctx.stroke();
    }
  }
  ctx.strokeStyle = 'rgba(255, 224, 168, .07)'; ctx.lineWidth = 2;
  for (let y = HUD_H + 54; y < 620; y += 52) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke();
  }
  /* طاقِ سنگیِ دورِ پنجره */
  ctx.fillStyle = P.stoneDk;
  ctx.beginPath(); ctx.arc(ROSE.x, ROSE.y, ROSE.r + 48, 0, TAU); ctx.fill();
  ctx.fillStyle = texStone(P.stoneLt, P.stone);
  ctx.beginPath(); ctx.arc(ROSE.x, ROSE.y, ROSE.r + 40, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 3;
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * TAU;
    ctx.beginPath();
    ctx.moveTo(ROSE.x + Math.cos(a) * (ROSE.r + 14), ROSE.y + Math.sin(a) * (ROSE.r + 14));
    ctx.lineTo(ROSE.x + Math.cos(a) * (ROSE.r + 40), ROSE.y + Math.sin(a) * (ROSE.r + 40));
    ctx.stroke();
  }
  const ag = ctx.createRadialGradient(ROSE.x - 40, ROSE.y - 40, ROSE.r, ROSE.x, ROSE.y, ROSE.r + 48);
  ag.addColorStop(0, 'rgba(255, 224, 168, .16)');
  ag.addColorStop(1, 'rgba(0,0,0,.4)');
  ctx.fillStyle = ag;
  ctx.beginPath(); ctx.arc(ROSE.x, ROSE.y, ROSE.r + 48, 0, TAU); ctx.fill();

  /* کفِ کارگاه */
  ctx.fillStyle = '#241811';
  ctx.fillRect(0, 620, SCENE_W, SCENE_H - 620);
  ctx.fillStyle = texStone('#3a2a1c', '#55402c');
  ctx.fillRect(0, 628, SCENE_W, SCENE_H - 628);
  ctx.fillStyle = 'rgba(255, 224, 168, .1)';
  ctx.fillRect(0, 628, SCENE_W, 3);
  const fg = ctx.createLinearGradient(0, 628, 0, SCENE_H);
  fg.addColorStop(0, 'rgba(0,0,0,.16)'); fg.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, 628, SCENE_W, SCENE_H - 628);

  /* میزِ کارِ شیشه‌گر */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(ORDER.x - 26, ORDER.y - 22, RACK.x + RACK.w - ORDER.x + 52, ORDER.h + 44, 14); ctx.fill();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.beginPath(); rrPath(ORDER.x - 20, ORDER.y - 16, RACK.x + RACK.w - ORDER.x + 40, ORDER.h + 32, 10); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.fillRect(ORDER.x - 20, ORDER.y + ORDER.h + 16, RACK.x + RACK.w - ORDER.x + 40, 8);
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
  drawFloorLight();
  drawRose();
  drawMotes();
  drawOrder();
  drawRack();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.11, 'rgba(8, 4, 2, .5)', .44, .16);
}

/** نورِ رنگیِ پنجره روی زمینِ کارگاه — همان نسبت‌ها، پهن‌شده. */
function drawFloorLight() {
  const filled = S.pane.filter((v) => v >= 0).length;
  if (!filled) return;
  const k = .5 + (S.lit > 0 ? S.lit * .7 : 0);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath(); ctx.rect(0, 616, SCENE_W, SCENE_H - 616); ctx.clip();
  const stepA = TAU / S.n;
  for (let i = 0; i < S.n; i++) {
    if (S.pane[i] < 0) continue;
    const a0 = -Math.PI / 2 + i * stepA, a1 = a0 + stepA;
    /* پرتوِ هر قسمت، کشیده به پایین و پهن‌شده روی کف */
    ctx.save();
    ctx.globalAlpha = k * .62;
    const g = ctx.createLinearGradient(ROSE.x, 610, ROSE.x, SCENE_H + 40);
    g.addColorStop(0, shade(GLASS[S.pane[i]].c, .25));
    g.addColorStop(.55, GLASS[S.pane[i]].d);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    const x0 = ROSE.x + Math.cos(a0) * ROSE.r * 1.05, x1 = ROSE.x + Math.cos(a1) * ROSE.r * 1.05;
    ctx.beginPath();
    ctx.moveTo(x0, 616); ctx.lineTo(x1, 616);
    ctx.lineTo(ROSE.x + (x1 - ROSE.x) * 2.1, SCENE_H);
    ctx.lineTo(ROSE.x + (x0 - ROSE.x) * 2.1, SCENE_H);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawMotes() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const m of S.motes) {
    ctx.fillStyle = `rgba(255, 224, 168, ${.1 + m.r * .1})`;
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawRose() {
  const { x, y, r } = ROSE;
  const stepA = TAU / S.n;
  /* شیشه‌ها */
  for (let i = 0; i < S.n; i++) {
    const a0 = -Math.PI / 2 + i * stepA, a1 = a0 + stepA;
    const k = S.pane[i];
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.arc(x, y, r, a0, a1); ctx.closePath();
    if (k < 0) {
      ctx.fillStyle = 'rgba(18, 12, 7, .82)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(125, 120, 108, .5)'; ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]);
    } else {
      const mid = (a0 + a1) / 2;
      const gx = x + Math.cos(mid) * r * .45, gy = y + Math.sin(mid) * r * .45;
      const g = ctx.createRadialGradient(gx, gy, 4, x, y, r * 1.1);
      g.addColorStop(0, shade(GLASS[k].c, .45));
      g.addColorStop(.55, GLASS[k].c);
      g.addColorStop(1, GLASS[k].d);
      ctx.fillStyle = g;
      ctx.fill();
      /* رگه‌های شیشه */
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2;
      for (let s = 0; s < 4; s++) {
        const aa = a0 + (s + .5) / 4 * stepA;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(aa) * 46, y + Math.sin(aa) * 46);
        ctx.lineTo(x + Math.cos(aa + .04) * r, y + Math.sin(aa + .04) * r);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (S.hover && S.hover.k === 'pane' && S.hover.i === i && !S.done) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, a0, a1); ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fill();
    }
  }
  /* سرب‌های میانِ شیشه‌ها */
  ctx.strokeStyle = P.leadDk; ctx.lineWidth = 9; ctx.lineCap = 'round';
  for (let i = 0; i < S.n; i++) {
    const a = -Math.PI / 2 + i * stepA;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * 40, y + Math.sin(a) * 40);
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.strokeStyle = P.leadLt; ctx.lineWidth = 3;
  for (let i = 0; i < S.n; i++) {
    const a = -Math.PI / 2 + i * stepA;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * 40, y + Math.sin(a) * 40);
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.stroke();
  }
  /* حلقهٔ سربیِ لبه و توپیِ میانه */
  ctx.strokeStyle = P.leadDk; ctx.lineWidth = 14;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.strokeStyle = P.leadLt; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(x, y, r - 2, 0, TAU); ctx.stroke();
  ctx.fillStyle = P.leadDk;
  ctx.beginPath(); ctx.arc(x, y, 42, 0, TAU); ctx.fill();
  ctx.fillStyle = ball(x - 12, y - 12, 76, P.brassLt, P.brass, P.brassDk);
  ctx.beginPath(); ctx.arc(x, y, 34, 0, TAU); ctx.fill();
  numText(fa(S.n), x, y + 1, { size: 30, color: '#3b2c0a' });
  text('قسمت', x, y + 24, { size: 11, color: 'rgba(59, 44, 10, .7)' });
  /* درخششِ پایان */
  if (S.lit > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = S.lit * .5;
    const g = ctx.createRadialGradient(x, y, r * .3, x, y, r * 1.6);
    g.addColorStop(0, 'rgba(255, 224, 168, .6)');
    g.addColorStop(1, 'rgba(255, 224, 168, 0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

/** برگهٔ سفارش: هر مقدار یک نوارِ خط‌کشی‌شده دارد که پنج‌تا پنج‌تا دسته شده. */
function drawOrder() {
  paper(ORDER.x, ORDER.y, ORDER.w, ORDER.h, P.card, 31, 12, .34);
  const th = THEMES[S.theme];
  text(th.t, ORDER.x + ORDER.w - 22, ORDER.y + 30, { size: 23, family: 'Lalezar', color: P.ink, align: 'right' });
  /* مقیاس: هر قسمت چندتا */
  const sy = ORDER.y + 62;
  ctx.fillStyle = 'rgba(207, 167, 78, .2)';
  ctx.beginPath(); rrPath(ORDER.x + 20, sy - 20, ORDER.w - 40, 40, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(143, 115, 39, .5)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); rrPath(ORDER.x + 20, sy - 20, ORDER.w - 40, 40, 10); ctx.stroke();
  /* نشانِ یک قسمت */
  ctx.fillStyle = P.leadDk;
  ctx.beginPath(); ctx.moveTo(ORDER.x + ORDER.w - 44, sy);
  ctx.arc(ORDER.x + ORDER.w - 44, sy, 15, -1.9, -.55); ctx.closePath(); ctx.fill();
  text('هر قسمت', ORDER.x + ORDER.w - 68, sy, { size: 15, color: P.ink, align: 'right' });
  numText('=', ORDER.x + ORDER.w - 152, sy + 1, { size: 20, color: P.inkSoft });
  numText(fa(S.scale), ORDER.x + ORDER.w - 182, sy + 1, { size: 24, color: P.ink });
  text(th.u, ORDER.x + 40, sy, { size: 16, color: P.ink, align: 'left' });

  for (let i = 0; i < S.cats.length; i++) {
    const c = S.cats[i];
    const y = ORDER.y + 118 + i * 84;
    const have = paneCount(c.col) * S.scale;
    const ok = have === c.qty;
    const over = have > c.qty;
    ctx.fillStyle = ok ? 'rgba(93, 162, 111, .15)' : (over ? 'rgba(205, 91, 69, .12)' : 'rgba(51, 38, 26, .05)');
    ctx.beginPath(); rrPath(ORDER.x + 18, y - 26, ORDER.w - 36, 74, 12); ctx.fill();
    ctx.strokeStyle = ok ? P.good : (over ? P.bad : 'rgba(51, 38, 26, .16)'); ctx.lineWidth = ok || over ? 2.2 : 1.4;
    ctx.beginPath(); rrPath(ORDER.x + 18, y - 26, ORDER.w - 36, 74, 12); ctx.stroke();
    /* شیشهٔ نمونه و نام */
    ctx.fillStyle = GLASS[c.col].d;
    ctx.beginPath(); rrPath(ORDER.x + ORDER.w - 56, y - 16, 26, 26, 5); ctx.fill();
    ctx.fillStyle = GLASS[c.col].c;
    ctx.beginPath(); rrPath(ORDER.x + ORDER.w - 55, y - 17, 24, 24, 5); ctx.fill();
    text(c.name, ORDER.x + ORDER.w - 66, y - 4, { size: 18, family: 'Lalezar', color: P.ink, align: 'right' });
    numText(fa(c.qty), ORDER.x + 46, y - 3, { size: 24, color: P.ink, align: 'left' });

    /* نوارِ خط‌کشی: هر دسته یک قسمت از پنجره */
    const groups = c.qty / S.scale;
    const bw = ORDER.w - 76, bx = ORDER.x + 38, by = y + 16;
    const gw = Math.min(46, (bw - (groups - 1) * 6) / groups);
    const totalW = groups * gw + (groups - 1) * 6;
    const filled = paneCount(c.col);
    for (let g = 0; g < groups; g++) {
      const gx = bx + (bw - totalW) / 2 + g * (gw + 6);
      ctx.fillStyle = g < filled ? GLASS[c.col].c : 'rgba(51, 38, 26, .1)';
      ctx.beginPath(); rrPath(gx, by - 11, gw, 22, 5); ctx.fill();
      ctx.strokeStyle = 'rgba(51, 38, 26, .3)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); rrPath(gx, by - 11, gw, 22, 5); ctx.stroke();
      /* خط‌های داخلِ دسته — همان‌قدر که مقیاس می‌گوید */
      ctx.strokeStyle = g < filled ? 'rgba(255,255,255,.55)' : 'rgba(51, 38, 26, .3)';
      ctx.lineWidth = 1.4;
      for (let t = 1; t < S.scale; t++) {
        const tx = gx + gw * t / S.scale;
        ctx.beginPath(); ctx.moveTo(tx, by - 7); ctx.lineTo(tx, by + 7); ctx.stroke();
      }
    }
    if (over) {
      numText('+' + fa(have - c.qty), ORDER.x + 46, y + 22, { size: 15, color: P.bad, align: 'left' });
    }
  }
}

function drawRack() {
  ctx.fillStyle = 'rgba(20, 12, 6, .7)';
  ctx.beginPath(); rrPath(RACK.x, RACK.y, RACK.w, RACK.h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(207, 167, 78, .34)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(RACK.x, RACK.y, RACK.w, RACK.h, 14); ctx.stroke();
  text('قفسهٔ شیشه', RACK.x + RACK.w / 2, RACK.y + 32, { size: 20, family: 'Lalezar', color: P.brassLt });
  for (let i = 0; i < S.cats.length; i++) {
    const b = glassBox(i), c = S.cats[i];
    const on = S.brush === c.col;
    const hot = S.hover && S.hover.k === 'glass' && S.hover.i === i;
    ctx.fillStyle = on ? 'rgba(242, 221, 153, .18)' : 'rgba(255,255,255,.04)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
    if (on || hot) {
      ctx.strokeStyle = on ? P.brassLt : 'rgba(242, 221, 153, .4)'; ctx.lineWidth = on ? 3 : 2;
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
    }
    /* ورقهٔ شیشه، کمی کج، با برقِ لبه */
    ctx.save();
    ctx.translate(b.x + 40, b.y + b.h / 2);
    ctx.rotate(-.08);
    ctx.fillStyle = GLASS[c.col].d;
    ctx.beginPath(); rrPath(-25, -22, 50, 44, 5); ctx.fill();
    const gg = ctx.createLinearGradient(-25, -22, 25, 22);
    gg.addColorStop(0, shade(GLASS[c.col].c, .4));
    gg.addColorStop(.6, GLASS[c.col].c);
    gg.addColorStop(1, GLASS[c.col].d);
    ctx.fillStyle = gg;
    ctx.beginPath(); rrPath(-23, -20, 46, 40, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    ctx.beginPath(); ctx.moveTo(-20, 16); ctx.lineTo(-2, -17); ctx.lineTo(6, -17); ctx.lineTo(-12, 16);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    text(c.name, b.x + b.w - 12, b.y + b.h / 2, { size: 17, family: 'Lalezar', color: on ? P.brassLt : '#efe2c8', align: 'right' });
    /* چندتا گذاشته‌ای */
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.beginPath(); rrPath(b.x + 6, b.y + b.h - 20, 30, 20, 6); ctx.fill();
    numText(fa(paneCount(c.col)), b.x + 21, b.y + b.h - 9, { size: 15, color: P.brassLt });
  }
  const left = S.pane.filter((v) => v < 0).length;
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.beginPath(); rrPath(RACK.x + 18, RACK.y + RACK.h - 58, RACK.w - 36, 40, 10); ctx.fill();
  text('خالی', RACK.x + RACK.w - 34, RACK.y + RACK.h - 38, { size: 14, color: 'rgba(244, 233, 208, .6)', align: 'right' });
  numText(fa(left), RACK.x + 46, RACK.y + RACK.h - 37, { size: 22, color: left ? P.brassLt : P.good });
}

function drawHUD() {
  ctx.fillStyle = 'rgba(20, 12, 6, .93)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(207, 167, 78, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 226 - i * 30;
    ctx.save();
    ctx.globalAlpha = i < S.panesLeft ? 1 : .22;
    ctx.fillStyle = i < S.panesLeft ? GLASS[i % GLASS.length].c : '#5f584e';
    ctx.beginPath(); rrPath(x - 9, HUD_H / 2 - 10, 18, 20, 4); ctx.fill();
    ctx.strokeStyle = i < S.panesLeft ? P.leadLt : '#7d786c'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(x - 9, HUD_H / 2 - 10, 18, 20, 4); ctx.stroke();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(244, 233, 208, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
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
    spot([{ x: ORDER.x, y: ORDER.y, w: ORDER.w, h: ORDER.h }], .78);
    const h = tutCard(80, 210, 520,
      ['سفارش می‌گوید از هر چیز چقدر.', 'کنارِ هر مقدار، یک نوارِ خط‌کشی‌شده هست.'], 'کارگاهِ شیشهٔ رنگی');
    tutMore(340, 210 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: ROSE.x - ROSE.r - 30, y: ROSE.y - ROSE.r - 30, w: ROSE.r * 2 + 60, h: ROSE.r * 2 + 60 },
          { x: RACK.x, y: RACK.y, w: RACK.w, h: RACK.h }], .74);
    tutCard(300, 96, 600, ['شیشه را از قفسه بردار و در قسمت‌های پنجره بگذار.',
      'هر شیشه که می‌گذاری، یک دسته از نوار روشن می‌شود.']);
  } else {
    spot([{ x: ORDER.x, y: ORDER.y, w: ORDER.w, h: ORDER.h }], .74);
    const h = tutCard(60, 150, 540,
      ['نوار که پُر شد، آن سفارش جور است.', 'روی شیشهٔ گذاشته‌شده بزنی، برمی‌داری.',
       'پنجره که کامل شود، آفتاب می‌تابد.'], 'نوار را نگاه کن');
    tutMore(330, 150 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function roseIcon(x, y) {
  const r = 32, n = 8;
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + i / n * TAU, a1 = a0 + TAU / n;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, a0, a1); ctx.closePath();
    ctx.fillStyle = GLASS[i % 4].c; ctx.fill();
    ctx.strokeStyle = P.leadDk; ctx.lineWidth = 3; ctx.stroke();
  }
  ctx.fillStyle = P.brass;
  ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 800, h: 300, y: 128,
    paper: P.paper, band: P.brassDk, ink: P.ink, inkSoft: '#7a6a52',
    icon: roseIcon,
    title: 'کارگاهِ شیشهٔ رنگی',
    body: 'پنجرهٔ کارگاه چند قسمت دارد و سفارش می‌گوید از هر چیز چقدر.\nکنارِ هر مقدار یک نوارِ خط‌کشی‌شده هست؛ هر شیشه که می‌گذاری،\nیک دسته از آن نوار روشن می‌شود. نوارها که پُر شوند، آفتاب می‌تابد.',
    btn: BTN_GO, btnLabel: 'کارگاه را باز کن', btnHot: S.hover === BTN_GO,
    btnFill: '#8f7327', btnHotFill: '#b08f38',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#7a6a52',
    icon: roseIcon,
    title: L().endless ? 'آفتاب رفت' : 'همهٔ پنجره‌ها ساخته شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ کارگاه‌ها را گرداندی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'سفارشِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#8f7327', btnHotFill: '#b08f38',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#7a6a52',
    icon: (x, y) => {
      ctx.fillStyle = GLASS[0].d;
      ctx.beginPath(); ctx.moveTo(x - 40, y + 20); ctx.lineTo(x - 14, y - 18); ctx.lineTo(x - 2, y + 20); ctx.closePath(); ctx.fill();
      ctx.fillStyle = GLASS[1].d;
      ctx.beginPath(); ctx.moveTo(x + 4, y + 20); ctx.lineTo(x + 24, y - 12); ctx.lineTo(x + 40, y + 20); ctx.closePath(); ctx.fill();
      roseIcon(x + 74, y + 2);
    },
    title: 'شیشه‌ها تمام شد',
    body: 'امتیاز: ' + fa(S.score) + '\nنوارِ کنارِ سفارش می‌گوید چند دسته مانده.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#8f7327', btnHotFill: '#b08f38',
  });
}

/*!
title: گل‌فروشیِ سرِ کوچه — تقسیم با باقی‌مانده
bg: #16301f
*/

/* ═══════════════════════════════════════════════════════════════════════
   گل‌فروشیِ سرِ کوچه — ریاضی سوم، فصل ۸، درس ۵ (تقسیم با باقی‌مانده)
   ───────────────────────────────────────────────────────────────────────
   دو فعّالیتِ کتاب، همان‌طور که هست:

   ۱) «۱۷ شاخه گل داریم. می‌خواهیم با هر ۴ شاخه یک دسته درست کنیم. چند
      دسته می‌شود؟ چند شاخه باقی می‌ماند؟»
   ۲) «۱۷ شاخه گل داریم. می‌خواهیم آن‌ها را به‌طور مساوی در ۴ گلدان
      تقسیم کنیم… چند گل باقی می‌ماند؟»

   اوّلی دسته‌بندی است و دوّمی پخشِ مساوی؛ هر دو به یک جواب می‌رسند و
   بازی هر دو را می‌آورد.

   کارِ بچّه دو تصمیم است: «باز هم می‌شود؟» و «کِی تمام است؟» تا وقتی
   شاخه‌ها برای یک دستهٔ کامل — یا یک دورِ کاملِ پخش — کافی است، دستگاه
   کار می‌کند؛ کم که آمد، پس می‌زند. آن‌وقت باید دکمهٔ «تمام» را بزنی.

   عددِ جواب هیچ‌جا نوشته نشده: آخرِ کار خودت روی پیشخوان می‌بینی چند
   دسته شد و چند شاخه ماند، و رسید همان را می‌نویسد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  wall:  '#1e4029', wallLo: '#0f2216', wallHi: '#356646',
  wood:  '#9a6b3c', woodDk: '#5d3d1c', woodLt: '#c69a63',
  tile:  '#2b5c46', tileLt: '#4a8b6c',
  brass: '#cfa74e', brassDk: '#8f7327', brassLt: '#f2dd99',
  paper: '#f6f0dd', card: '#fffbef', ink: '#22331f', inkSoft: '#7b8d78',
  stem:  '#4e8f4a', stemDk: '#2f6030',
  good:  '#5da26f', bad: '#cd5b45', gold: '#eab53f', glass: '#a8d8e4',
};

/* رنگِ گل‌ها */
const FLOWER = [
  { c: '#e8687f', d: '#a83a55' },
  { c: '#f0b53c', d: '#b07c14' },
  { c: '#c78ae0', d: '#8b56a5' },
  { c: '#f4f0e2', d: '#c2bba6' },
  { c: '#ea8f4e', d: '#a85c22' },
];

const LEVELS = [
  { name: 'دستهٔ صبح', mode: 'bundle', d: [3, 4], q: [2, 4], quota: 3, time: 78,
    hint: 'دکمه را بزن تا یک دسته بسته شود.' },
  { name: 'گلدان‌های ویترین', mode: 'share', d: [2, 4], q: [2, 4], quota: 3, time: 82,
    hint: 'هر بار یک شاخه به هر گلدان — یک دورِ کامل.' },
  { name: 'سفارشِ عروسی', mode: 'both', d: [3, 6], q: [3, 6], quota: 3, time: 88,
    hint: 'کم که آمد، دیگر دسته نمی‌شود؛ آن‌وقت «تمام».' },
  { name: 'بازارِ شب', mode: 'both', d: [3, 6], q: [4, 8], quota: 4, time: 92,
    hint: 'باقی‌مانده همیشه از خودِ دسته کمتر است.' },
  { name: 'تا گل هست', mode: 'both', d: [2, 6], q: [2, 8], time: 88, endless: true,
    hint: 'تا گل هست، دسته هست.' },
];

const BUCKET = { x: 62, y: 150, w: 320, h: 470 };
const YARD = { x: 418, y: 128, w: 748, h: 456 };
const BTN_DO = { x: 452, y: 620, w: 320, h: 96 };
const BTN_END = { x: 812, y: 620, w: 300, h: 96 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0, mode: 'bundle',
  n: 17, d: 4, q: 4, r: 1,
  made: 0, left: 17,
  fly: [], seed: 0,
  timeLeft: 0, aprons: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  done: 0, doneT: 0, warn: 0, warnKind: '',
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function loadBest() { try { return +localStorage.getItem('gol-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('gol-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();

/* ───────── سفارشِ تازه ───────── */

function newOrder() {
  const lv = L();
  S.mode = lv.mode === 'both' ? (Math.random() < .5 ? 'bundle' : 'share') : lv.mode;
  const d = R(lv.d[0], lv.d[1]);
  const q = R(lv.q[0], lv.q[1]);
  /* گاهی باقی‌مانده صفر — کتاب هم می‌پرسد «باقی‌ماندهٔ کدام تقسیم صفر می‌شود؟» */
  const r = Math.random() < .25 ? 0 : R(1, d - 1);
  S.d = d; S.q = q; S.r = r;
  S.n = d * q + r;
  S.made = 0; S.left = S.n;
  S.fly = []; S.seed = R(0, 9999);
  S.done = 0; S.doneT = 0; S.warn = 0;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.aprons = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newOrder();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

newOrder();
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.warn > 0) S.warn -= dt;
  for (const f of S.fly) f.t += dt;
  S.fly = S.fly.filter((f) => f.t < f.dur);

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.done) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseApron('مغازه بسته شد!'); }
    }
    if (S.done) { S.doneT += dt; if (S.doneT > 2.6) { newOrder(); S.timeLeft = L().time; } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseApron(msg) {
  if (S.done) return;
  S.aprons--;
  S.combo = 0;
  S.shake = .5;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.aprons <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newOrder();
}

/** یک دستهٔ کامل، یا یک دورِ کاملِ پخش. */
function doOne() {
  if (S.phase !== 'play' || S.done) return;
  if (S.left < S.d) {
    S.warn = 1; S.warnKind = 'short'; S.shake = .12;
    sfx.nope();
    toast.say(S.mode === 'bundle' ? 'شاخه‌ها برای یک دستهٔ کامل کم است.' : 'برای یک دورِ کامل کم است.', 'bad');
    return;
  }
  S.left -= S.d;
  S.made++;
  sfx.place();
  for (let i = 0; i < S.d; i++) {
    const to = S.mode === 'bundle' ? bundleSpot(S.made - 1) : vaseSpot(i, S.made - 1);
    S.fly.push({ x0: BUCKET.x + BUCKET.w / 2 + (Math.random() - .5) * 90, y0: BUCKET.y + 150,
                 x1: to.x, y1: to.y, t: -i * .05, dur: .5, k: i });
  }
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
}

/** «تمام» — یعنی دیگر یک دستهٔ کامل نمی‌شود. */
function callEnd() {
  if (S.phase !== 'play' || S.done) return;
  if (S.left >= S.d) {
    S.warn = 1; S.warnKind = 'more'; S.shake = .16;
    S.timeLeft = Math.max(4, S.timeLeft - 5);
    sfx.nope();
    toast.say(S.mode === 'bundle' ? 'هنوز یک دستهٔ دیگر می‌شود!' : 'هنوز یک دورِ دیگر می‌شود!', 'bad');
    return;
  }
  finish();
}

function finish() {
  S.done = .001; S.doneT = 0;
  S.combo++;
  S.cleared++;
  S.score += 320 + S.made * 60 + Math.round(S.timeLeft * 4) + Math.min(S.combo, 6) * 70;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(YARD.x + YARD.w / 2, YARD.y + 200, 46,
    [FLOWER[0].c, FLOWER[1].c, FLOWER[2].c, P.gold, '#fff']);
  sfx.win();
  toast.say('سفارش آماده شد!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  S.hover = inRect(p, BTN_DO) ? 'do' : (inRect(p, BTN_END) ? 'end' : null);
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
  if (inRect(p, BTN_DO)) { doOne(); return; }
  if (inRect(p, BTN_END)) { callEnd(); return; }
});

/* ───────── جای‌ها ───────── */

function bundleSpot(i) {
  const cols = 5, w = 132, h = 210;
  const col = i % cols, row = Math.floor(i / cols);
  return { x: YARD.x + 76 + (cols - 1 - col) * w, y: YARD.y + 116 + row * h };
}
function vaseBox(i) {
  const n = S.d, w = Math.min(140, (YARD.w - 60) / n), gap = 14;
  const total = n * w + (n - 1) * gap;
  return { x: YARD.x + (YARD.w - total) / 2 + i * (w + gap), y: YARD.y + 150, w, h: 210 };
}
function vaseSpot(i, round) {
  const b = vaseBox(i);
  /* دسته‌گل بالای گلدان پخش می‌شود، نه اینکه برجی بالا برود و از صحنه بزند بیرون */
  return { x: b.x + b.w / 2 + ((round * 2 + i) % 5 - 2) * 15,
           y: b.y - 20 - (round % 5) * 19 };
}

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
  ctx.fillStyle = `rgba(6, 16, 10, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 251, 239, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '6, 16, 10');
  ctx.fillStyle = P.stem;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6d7f6a' }); yy += 30; }
  return h + 20;
}

/** یک شاخه گل. */
function stem(x, y, len, seed, sc = 1) {
  const f = FLOWER[Math.floor(noise1(seed * 3.7) * FLOWER.length) % FLOWER.length];
  const sway = Math.sin(S.t * 1.4 + seed) * .05;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(sway + (noise1(seed * 1.3) - .5) * .35);
  ctx.scale(sc, sc);
  ctx.strokeStyle = P.stem; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(3, -len * .5, 0, -len); ctx.stroke();
  ctx.fillStyle = P.stemDk;
  wobbleEllipse(-7, -len * .45, 8, 4, -.5, seed, .8); ctx.fill();
  /* گل */
  ctx.fillStyle = f.d;
  ctx.beginPath(); ctx.arc(0, -len - 1, 10, 0, TAU); ctx.fill();
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * TAU + seed;
    ctx.fillStyle = f.c;
    ctx.beginPath(); ctx.ellipse(Math.cos(a) * 7, -len + Math.sin(a) * 7, 6.5, 5, a, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = P.gold;
  ctx.beginPath(); ctx.arc(0, -len, 4, 0, TAU); ctx.fill();
  ctx.restore();
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintShopStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallHi); g.addColorStop(.42, P.wall); g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  /* کاشیِ دیوار */
  ctx.save();
  ctx.beginPath(); ctx.rect(0, HUD_H, SCENE_W, 460); ctx.clip();
  for (let x = -20; x < SCENE_W + 40; x += 78) for (let y = HUD_H; y < 520; y += 78) {
    ctx.fillStyle = ((x / 78 + y / 78) | 0) % 2 ? P.tile : shade(P.tile, .08);
    ctx.beginPath(); rrPath(x + 3, y + 3, 72, 72, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(x + 3, y + 3, 72, 72, 6); ctx.stroke();
  }
  const tg = ctx.createLinearGradient(0, HUD_H, 0, 520);
  tg.addColorStop(0, 'rgba(255,255,255,.1)'); tg.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = tg; ctx.fillRect(0, HUD_H, SCENE_W, 470);
  ctx.restore();
  /* نورِ ویترین */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const lg = ctx.createRadialGradient(SCENE_W / 2, 60, 30, SCENE_W / 2, 60, 720);
  lg.addColorStop(0, 'rgba(255, 246, 214, .3)');
  lg.addColorStop(1, 'rgba(255, 246, 214, 0)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* پیشخوانِ چوبی */
  ctx.fillStyle = P.woodDk;
  ctx.fillRect(0, 584, SCENE_W, SCENE_H - 584);
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.fillRect(0, 592, SCENE_W, SCENE_H - 592);
  ctx.fillStyle = 'rgba(255, 246, 214, .22)';
  ctx.fillRect(0, 592, SCENE_W, 3);
  const fg = ctx.createLinearGradient(0, 592, 0, SCENE_H);
  fg.addColorStop(0, 'rgba(255, 246, 214, .12)');
  fg.addColorStop(1, 'rgba(0,0,0,.42)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, 592, SCENE_W, SCENE_H - 592);
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
  drawOrder();
  drawBucket();
  if (S.mode === 'bundle') drawBundles(); else drawVases();
  drawFly();
  drawButtons();
  if (S.done) drawReceipt();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.11, 'rgba(4, 12, 8, .46)', .36, .13);
}

function drawOrder() {
  const w = 560, x = YARD.x + (YARD.w - w) / 2, y = 62;
  paper(x, y, w, 62, P.card, 31, 12, .3);
  const mid = x + w / 2;
  if (S.mode === 'bundle') {
    text('هر دسته', x + w - 30, y + 31, { size: 17, color: P.inkSoft, align: 'right' });
    numText(fa(S.d), x + w - 110, y + 32, { size: 30, color: P.ink });
    text('شاخه', x + w - 150, y + 31, { size: 16, color: P.inkSoft, align: 'right' });
  } else {
    numText(fa(S.d), x + w - 40, y + 32, { size: 30, color: P.ink, align: 'right' });
    text('گلدان، هرکدام به یک اندازه', x + w - 70, y + 31, { size: 17, color: P.inkSoft, align: 'right' });
  }
  ctx.strokeStyle = 'rgba(34, 51, 31, .2)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(mid - 20, y + 12); ctx.lineTo(mid - 20, y + 50); ctx.stroke();
  numText(fa(S.n), x + 66, y + 32, { size: 30, color: P.stem });
  text('شاخه در سطل', x + 150, y + 31, { size: 16, color: P.inkSoft, align: 'left' });
}

function drawBucket() {
  const b = BUCKET;
  /* سطلِ حلبی */
  ctx.fillStyle = '#4d6a72';
  ctx.beginPath();
  ctx.moveTo(b.x + 34, b.y + 190); ctx.lineTo(b.x + b.w - 34, b.y + 190);
  ctx.lineTo(b.x + b.w - 62, b.y + b.h); ctx.lineTo(b.x + 62, b.y + b.h);
  ctx.closePath(); ctx.fill();
  const g = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
  g.addColorStop(0, '#39525a'); g.addColorStop(.35, '#7f9aa2');
  g.addColorStop(.6, '#5f8189'); g.addColorStop(1, '#33474e');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(b.x + 38, b.y + 196); ctx.lineTo(b.x + b.w - 38, b.y + 196);
  ctx.lineTo(b.x + b.w - 64, b.y + b.h - 6); ctx.lineTo(b.x + 64, b.y + b.h - 6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2b3f45';
  ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, b.y + 192, b.w / 2 - 34, 16, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#6d8f97';
  ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, b.y + 188, b.w / 2 - 34, 15, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(20, 40, 44, .8)';
  ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, b.y + 190, b.w / 2 - 42, 11, 0, 0, TAU); ctx.fill();

  /* شاخه‌های باقی‌مانده */
  const show = Math.min(S.left, 26);
  for (let i = 0; i < show; i++) {
    const t2 = (i + .5) / Math.max(1, show);
    const x = b.x + 62 + t2 * (b.w - 124) + (noise1(S.seed + i * 2.1) - .5) * 24;
    stem(x, b.y + 192, 96 + noise1(S.seed + i) * 54, S.seed + i * 7, 1);
  }
  /* شمارنده */
  ctx.fillStyle = 'rgba(8, 20, 12, .78)';
  ctx.beginPath(); rrPath(b.x + 62, b.y + b.h + 16, b.w - 124, 52, 12); ctx.fill();
  ctx.strokeStyle = S.left < S.d ? P.gold : 'rgba(207, 167, 78, .4)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(b.x + 62, b.y + b.h + 16, b.w - 124, 52, 12); ctx.stroke();
  text('در سطل', b.x + b.w - 84, b.y + b.h + 42, { size: 15, color: 'rgba(246, 240, 221, .6)', align: 'right' });
  numText(fa(S.left), b.x + 108, b.y + b.h + 43, { size: 28, color: S.left < S.d ? P.gold : P.card });
  if (S.warn > 0 && S.warnKind === 'short') {
    ctx.save();
    ctx.globalAlpha = clamp(S.warn, 0, 1);
    ctx.strokeStyle = P.bad; ctx.lineWidth = 4;
    ctx.beginPath(); rrPath(b.x + 58, b.y + b.h + 12, b.w - 116, 60, 14); ctx.stroke();
    ctx.restore();
  }
}

function drawBundles() {
  text('دسته‌های بسته‌شده', YARD.x + YARD.w - 20, YARD.y + 22,
    { size: 18, family: 'Lalezar', color: 'rgba(246, 240, 221, .8)', align: 'right' });
  for (let i = 0; i < S.made; i++) {
    const s = bundleSpot(i);
    /* دستهٔ گل */
    for (let k = 0; k < S.d; k++) {
      const off = (k - (S.d - 1) / 2) * 15;
      stem(s.x + off, s.y + 78, 84 + noise1(i * 3 + k) * 26, i * 11 + k * 3, .92);
    }
    /* روبانِ دسته */
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); rrPath(s.x - 30, s.y + 34, 60, 16, 6); ctx.fill();
    ctx.fillStyle = P.gold;
    ctx.beginPath(); rrPath(s.x - 27, s.y + 36, 54, 11, 5); ctx.fill();
    numText(fa(S.d), s.x, s.y + 42, { size: 14, color: '#3f2f06' });
  }
  if (!S.made) {
    text('هنوز دسته‌ای بسته نشده', YARD.x + YARD.w / 2, YARD.y + 200,
      { size: 18, color: 'rgba(246, 240, 221, .4)' });
  }
}

function drawVases() {
  text('گلدان‌های ویترین', YARD.x + YARD.w - 20, YARD.y + 22,
    { size: 18, family: 'Lalezar', color: 'rgba(246, 240, 221, .8)', align: 'right' });
  for (let i = 0; i < S.d; i++) {
    const b = vaseBox(i);
    /* گل‌های داخلِ گلدان */
    for (let r = 0; r < S.made; r++) {
      const sp = vaseSpot(i, r);
      stem(sp.x, b.y + 40, b.y + 40 - sp.y + 40, i * 13 + r * 5, .9);
    }
    /* گلدانِ شیشه‌ای */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(b.x + 18, b.y);
    ctx.quadraticCurveTo(b.x + 4, b.y + 70, b.x + 20, b.y + b.h);
    ctx.lineTo(b.x + b.w - 20, b.y + b.h);
    ctx.quadraticCurveTo(b.x + b.w - 4, b.y + 70, b.x + b.w - 18, b.y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(168, 216, 228, .22)'; ctx.fill();
    ctx.clip();
    ctx.fillStyle = 'rgba(120, 190, 210, .3)';
    ctx.fillRect(b.x, b.y + b.h * .45, b.w, b.h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(200, 235, 244, .6)'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b.x + 18, b.y);
    ctx.quadraticCurveTo(b.x + 4, b.y + 70, b.x + 20, b.y + b.h);
    ctx.lineTo(b.x + b.w - 20, b.y + b.h);
    ctx.quadraticCurveTo(b.x + b.w - 4, b.y + 70, b.x + b.w - 18, b.y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    ctx.beginPath(); rrPath(b.x + 28, b.y + 24, 10, b.h - 60, 5); ctx.fill();
    /* شمارهٔ گلدان */
    ctx.fillStyle = 'rgba(8, 20, 12, .7)';
    ctx.beginPath(); rrPath(b.x + b.w / 2 - 24, b.y + b.h + 12, 48, 34, 8); ctx.fill();
    numText(fa(S.made), b.x + b.w / 2, b.y + b.h + 30, { size: 19, color: P.card });
  }
}

function drawFly() {
  for (const f of S.fly) {
    if (f.t < 0) continue;
    const k = clamp(f.t / f.dur, 0, 1);
    const x = lerp(f.x0, f.x1, k);
    const y = lerp(f.y0, f.y1, k) - Math.sin(k * Math.PI) * 90;
    stem(x, y + 60, 60, f.k * 5 + 3, .8);
  }
}

function drawButtons() {
  const canDo = S.left >= S.d && !S.done;
  button(BTN_DO, S.mode === 'bundle' ? 'یک دسته ببند' : 'یک دور پخش کن', {
    hot: S.hover === 'do', fill: canDo ? '#3f7d4c' : '#4a5a4e', hotFill: '#4f9a5d',
    disabled: !canDo, off: '#4a5a4e', size: 26,
    sub: fa(S.d) + ' شاخه از سطل', subColor: 'rgba(255,255,255,.8)',
  });
  button(BTN_END, 'تمام', {
    hot: S.hover === 'end', fill: '#b57a2c', hotFill: '#cf8f36', size: 28,
    sub: 'دیگر کامل نمی‌شود', subColor: 'rgba(255,255,255,.8)',
  });
  if (S.warn > 0 && S.warnKind === 'more') {
    ctx.save();
    ctx.globalAlpha = clamp(S.warn, 0, 1);
    ctx.strokeStyle = P.bad; ctx.lineWidth = 4;
    ctx.beginPath(); rrPath(BTN_END.x - 4, BTN_END.y - 4, BTN_END.w + 8, BTN_END.h + 8, 16); ctx.stroke();
    ctx.restore();
  }
}

/** رسیدِ آخر — نوشتهٔ کارِ خودِ بچّه، نه جوابِ از پیش. */
function drawReceipt() {
  const w = 620, h = 138, x = SCENE_W / 2 - w / 2, y = 300;
  ctx.save();
  ctx.globalAlpha = clamp(S.doneT * 2, 0, 1);
  paper(x, y, w, h, P.card, 41, 12, .4);
  ctx.fillStyle = P.stem;
  ctx.beginPath(); rrPath(x + 16, y + 14, w - 32, 6, 3); ctx.fill();
  text('رسید', x + w - 30, y + 40, { size: 19, family: 'Lalezar', color: P.ink, align: 'right' });
  const mid = y + 92;
  numText(fa(S.n), x + w - 40, mid, { size: 34, color: P.ink, align: 'right' });
  text('شاخه', x + w - 108, mid + 24, { size: 13, color: P.inkSoft, align: 'right' });
  numText('=', x + w - 140, mid, { size: 28, color: P.inkSoft });
  numText(fa(S.made) + ' × ' + fa(S.d), x + w - 250, mid, { size: 32, color: P.stem });
  text(S.mode === 'bundle' ? 'دسته' : 'دور', x + w - 250, mid + 26, { size: 13, color: P.inkSoft });
  numText('+', x + w - 356, mid, { size: 28, color: P.inkSoft });
  numText(fa(S.left), x + w - 412, mid, { size: 32, color: S.left ? P.bad : P.good });
  text('باقی‌مانده', x + w - 412, mid + 26, { size: 13, color: P.inkSoft });
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = 'rgba(12, 28, 18, .93)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(207, 167, 78, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 256 - i * 30;
    ctx.save();
    ctx.globalAlpha = i < S.aprons ? 1 : .22;
    ctx.fillStyle = i < S.aprons ? '#5da26f' : '#5f6a60';
    ctx.beginPath(); rrPath(x - 10, HUD_H / 2 - 9, 20, 20, 4); ctx.fill();
    ctx.strokeStyle = i < S.aprons ? P.brassLt : '#83907f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 7, HUD_H / 2 - 9); ctx.lineTo(x + 7, HUD_H / 2 - 9); ctx.stroke();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(246, 240, 221, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
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
    spot([{ x: BUCKET.x + 40, y: 56, w: SCENE_W - BUCKET.x - 100, h: 78 }], .76);
    const h = tutCard(300, 220, 600,
      ['بالای صحنه نوشته چند شاخه در سطل است', 'و هر دسته (یا هر گلدان) چقدر می‌خواهد.'], 'گل‌فروشیِ سرِ کوچه');
    tutMore(600, 220 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: BTN_DO.x, y: BTN_DO.y, w: BTN_DO.w, h: BTN_DO.h }], .74);
    tutCard(300, 180, 600, ['دکمهٔ سبز را بزن: هر بار یک دستهٔ کامل',
      'بسته می‌شود و به همان اندازه از سطل کم می‌شود.']);
  } else {
    spot([{ x: BTN_END.x, y: BTN_END.y, w: BTN_END.w, h: BTN_END.h },
          { x: BUCKET.x + 50, y: BUCKET.y + BUCKET.h + 6, w: BUCKET.w - 100, h: 72 }], .74);
    const h = tutCard(300, 150, 600,
      ['وقتی شاخه‌های سطل برای یک دستهٔ کامل کم شد،',
       'دکمهٔ سبز پس می‌زند. آن‌وقت «تمام» را بزن.',
       'هرچه در سطل مانده، همان باقی‌مانده است.'], 'کِی تمام است؟');
    tutMore(600, 150 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function shopIcon(x, y) {
  for (let i = 0; i < 3; i++) stem(x - 30 + i * 16, y + 28, 44, i * 5 + 2, .9);
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(x - 40, y + 4, 44, 11, 5); ctx.fill();
  stem(x + 44, y + 28, 40, 9, .9);
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 800, h: 300, y: 128,
    paper: P.paper, band: P.stem, ink: P.ink, inkSoft: '#6d7f6a',
    icon: shopIcon,
    title: 'گل‌فروشیِ سرِ کوچه',
    body: 'گاهی باید با هر چند شاخه یک دسته ببندی، گاهی باید شاخه‌ها را\nبه‌طور مساوی بینِ گلدان‌ها پخش کنی. تا وقتی یک دستهٔ کامل — یا یک\nدورِ کامل — می‌شود، ادامه بده؛ کم که آمد، «تمام» را بزن.',
    btn: BTN_GO, btnLabel: 'مغازه را باز کن', btnHot: S.hover === BTN_GO,
    btnFill: '#3f7d4c', btnHotFill: '#4f9a5d',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#6d7f6a',
    icon: shopIcon,
    title: L().endless ? 'گل‌ها تمام شد' : 'همهٔ سفارش‌ها آماده شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ مغازه‌ها را گرداندی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'سفارشِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#3f7d4c', btnHotFill: '#4f9a5d',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#6d7f6a',
    icon: (x, y) => {
      ctx.fillStyle = '#6f7a6c';
      ctx.beginPath(); rrPath(x - 52, y - 10, 26, 30, 5); ctx.fill();
      shopIcon(x + 22, y);
    },
    title: 'پیش‌بندها تمام شد',
    body: 'امتیاز: ' + fa(S.score) + '\nباقی‌مانده همیشه از خودِ دسته کمتر است.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#3f7d4c', btnHotFill: '#4f9a5d',
  });
}

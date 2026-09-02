/*!
title: قلّه‌ها در مه — مقایسه و تقریب
bg: #141a2c
*/

/* ═══════════════════════════════════════════════════════════════════════
   قلّه‌ها در مه — ریاضی سوم، فصل ۶، درس ۳ (مقایسهٔ عددها و تقریب)
   ───────────────────────────────────────────────────────────────────────
   کتاب می‌گوید برای مقایسهٔ دو عدد، اوّل رقم‌های یکان و دهگان و صدگان را
   حذف کن و به جایشان صفر بگذار، بعد مقایسه کن — و می‌پرسد «آیا با همین
   اوّلین تقریب می‌توانی مقایسه کنی؟».

   این دقیقاً یعنی «از دور نگاه کردن». پس بازی این شد:

   دیده‌بانِ کوهستانی. قلّه‌ها توی مه‌اند و روی تابلوی هر قلّه فقط همان‌قدر
   عدد پیداست که مه اجازه می‌دهد — از دورترین حالت فقط هزارگان: ۳۰۰۰.
   حلقهٔ تنظیمِ دوربین را که یک درجه جلو ببری، مه یک لایه کنار می‌رود و
   صدگان هم پیدا می‌شود: ۳۴۰۰. بعد ۳۴۲۰. بعد ۳۴۲۵.

   تا وقتی عددها یکی دیده می‌شوند، اجازهٔ اشاره کردن نداری — «از این
   فاصله فرقشان معلوم نیست». پس باید همان‌قدر جلو بروی که لازم است، نه
   بیشتر: امتیاز به کسی می‌رسد که با کمترین وضوح تصمیم بگیرد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  sky0: '#161d33', sky1: '#3a3358', sky2: '#8a5570', sky3: '#e2925f', sky4: '#f6c98a',
  far:  '#4a4f77', mid: '#3a3f63', near: '#2a2e4c', ridge: '#1b1e33',
  snow: '#e8ecfb', snowDk: '#b9c2e0',
  fog:  '#dfe6f5',
  wood: '#7a5530', woodDk: '#4e341a', woodLt: '#a6784a',
  brass:'#cba64f', brassDk: '#8f6f28', brassLt: '#f0dc9c',
  iron: '#4a5160', ironLt: '#7d8698',
  paper:'#f7eeda', ink: '#2c2436', inkSoft: '#7d7392',
  good: '#6fa85c', bad: '#cd5b45', gold: '#eab53f',
};

const STOPS = [
  { n: 'هزارتا', d: 1000 },
  { n: 'صدتا',  d: 100 },
  { n: 'ده‌تا',  d: 10 },
  { n: 'یکی',   d: 1 },
];

const LEVELS = [
  { name: 'هوای صاف', k: 3, place: [0, 1], time: 60, quota: 4,
    hint: 'حلقهٔ دوربین را جلو ببر تا عددها از هم جدا شوند.' },
  { name: 'مهِ سبک', k: 3, place: [1, 2], time: 58, quota: 4,
    hint: 'هرچه با وضوحِ کمتری تصمیم بگیری، امتیازت بیشتر است.' },
  { name: 'مهِ غلیظ', k: 3, place: [1, 3], time: 56, quota: 5,
    hint: 'گاهی باید تا آخر جلو بروی.' },
  { name: 'سه قلّه', k: 3, place: [1, 3], three: .6, time: 54, quota: 5,
    hint: 'سه قلّه: از کوتاه‌ترین شروع کن.' },
  { name: 'تا شب', k: 3, place: [0, 3], three: .5, time: 52, endless: true,
    hint: 'تا هوا تاریک نشده، قلّه‌ها را بشناس.' },
];

const HUD_H = 52;
const RING = { x: 300, y: 664, w: 600, h: 64 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  peaks: [],          // { v, x, base, h, seed, picked, wrong }
  order: [],          // ترتیبی که زده شده
  need: 0,            // کمترین وضوحِ لازم
  focus: 0,           // ۰ تا ۳
  focusA: 0,          // انیمیشنِ حلقه
  dragRing: false,
  three: false,
  solved: 0,
  timeLeft: 0,
  lamps: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  birds: [], motes: [],
  t: 0, phaseT: 0, hover: null, shake: 0, nope: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/** عدد از پشتِ مه: رقم‌های پایین‌تر حذف و صفر می‌شوند — همان کارِ کتاب. */
const seen = (v, f) => Math.floor(v / STOPS[f].d) * STOPS[f].d;

function loadBest() { try { return +localStorage.getItem('ghol-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('ghol-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 6; i++) S.birds.push({ x: Math.random() * SCENE_W, y: 120 + Math.random() * 90,
  sp: 14 + Math.random() * 20, ph: Math.random() * TAU });
for (let i = 0; i < 40; i++) S.motes.push({ x: Math.random() * SCENE_W, y: 200 + Math.random() * 420,
  r: .8 + Math.random() * 1.8, sp: 5 + Math.random() * 14, ph: Math.random() * TAU });
whenFontsReady(() => runLoop(step));

/* ───────── ساختِ قلّه‌ها ───────── */

const digitsOf = (v) => [Math.floor(v / 1000) % 10, Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10];
const numOf = (d) => d[0] * 1000 + d[1] * 100 + d[2] * 10 + d[3];

/** دو عدد که تا جایگاهِ d یکی‌اند و در d فرق دارند. */
function pairAt(d) {
  const a = [R(1, 9), R(0, 9), R(0, 9), R(0, 9)];
  const b = a.slice();
  let nd;
  do { nd = R(d === 0 ? 1 : 0, 9); } while (nd === a[d]);
  b[d] = nd;
  for (let i = d + 1; i < 4; i++) { a[i] = R(0, 9); b[i] = R(0, 9); }
  return [numOf(a), numOf(b)];
}

/** کمترین وضوحی که همهٔ عددها از هم جدا دیده شوند. */
function needFocus(vals) {
  for (let f = 0; f < 4; f++) {
    let ok = true;
    for (let i = 0; i < vals.length && ok; i++)
      for (let j = i + 1; j < vals.length; j++)
        if (seen(vals[i], f) === seen(vals[j], f)) { ok = false; break; }
    if (ok) return f;
  }
  return 3;
}

function newRound() {
  const lv = L();
  S.three = !!lv.three && Math.random() < lv.three;
  const d = R(lv.place[0], lv.place[1]);
  let vals;
  for (let tries = 0; tries < 60; tries++) {
    const [a, b] = pairAt(d);
    vals = [a, b];
    if (S.three) {
      /* سومی هم باید از هر دو جدا شود، ولی سختی از همان d بیشتر نشود */
      for (let t2 = 0; t2 < 60; t2++) {
        const c = numOf([R(1, 9), R(0, 9), R(0, 9), R(0, 9)]);
        if (needFocus([a, b, c]) === needFocus([a, b]) && c !== a && c !== b) { vals = [a, b, c]; break; }
      }
    }
    if (needFocus(vals) === d && new Set(vals).size === vals.length) break;
  }
  S.need = needFocus(vals);
  const n = vals.length;
  const xs = n === 2 ? [382, 818] : [278, 600, 922];
  S.peaks = vals.map((v, i) => ({
    v, x: xs[i], base: 556, h: 190 + (i * 37 % 74), seed: Math.random() * 99,
    picked: false, wrong: 0,
  }));
  /* بلندیِ تصویری نباید جوابِ عدد را لو بدهد */
  shuffleH(S.peaks);
  S.order = [];
  S.focus = 0; S.focusA = 0;
  S.solved = 0;
}

function shuffleH(ps) {
  const hs = ps.map((p) => p.h);
  for (let i = hs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = hs[i]; hs[i] = hs[j]; hs[j] = t; }
  ps.forEach((p, i) => { p.h = hs[i]; });
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.lamps = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newRound();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.nope > 0) S.nope -= dt;
  S.focusA += (S.focus - S.focusA) * Math.min(1, dt * 9);
  for (const p of S.peaks) if (p.wrong > 0) p.wrong -= dt;
  for (const b of S.birds) { b.x += b.sp * dt; if (b.x > SCENE_W + 30) { b.x = -30; b.y = 110 + Math.random() * 90; } }
  for (const m of S.motes) { m.x += m.sp * dt; m.y += Math.sin(S.t + m.ph) * 6 * dt;
    if (m.x > SCENE_W + 6) m.x = -6; }

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.solved) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseLamp('هوا تاریک شد!'); }
    }
    if (S.solved) { S.solved += dt; if (S.solved > 1.5) newRound(); }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseLamp(msg) {
  if (S.solved) return;
  S.lamps--;
  S.combo = 0;
  S.shake = .4;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.lamps <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newRound();
}

/** آیا از این وضوح، همهٔ قلّه‌ها از هم جدا دیده می‌شوند؟ */
const clear = () => S.focus >= S.need;

function choose(i) {
  if (S.solved) return;
  if (!clear()) {
    S.nope = .8;
    S.shake = .12;
    sfx.nope();
    toast.say('از این فاصله فرقشان معلوم نیست. حلقه را جلوتر ببر.', 'bad');
    return;
  }
  const p = S.peaks[i];
  if (p.picked) return;
  /* باید از کوتاه‌ترین به بلندترین زده شود */
  const remaining = S.peaks.filter((q) => !q.picked);
  const smallest = remaining.reduce((a, b) => (b.v < a.v ? b : a));
  if (p !== smallest) {
    p.wrong = .7;
    S.combo = 0;
    sfx.nope();
    S.lamps--;
    S.shake = .35;
    toast.say(S.three ? 'کوتاه‌ترین نبود.' : 'آن یکی بلندتر بود.', 'bad');
    if (S.lamps <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
    return;
  }
  p.picked = true;
  S.order.push(i);
  sfx.tone(420 + S.order.length * 90, .1, 'triangle', .05);
  if (S.peaks.filter((q) => !q.picked).length <= 1) {
    S.peaks.forEach((q) => { q.picked = true; });
    finish();
  }
}

function finish() {
  S.solved = .001;
  S.combo++;
  S.cleared++;
  const saved = 3 - S.focus;
  const pts = 260 + saved * 150 + Math.round(S.timeLeft * 5) + Math.min(S.combo, 6) * 70;
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(SCENE_W / 2, 380, 40, [P.snow, P.gold, '#fff', P.brassLt]);
  sfx.win();
  toast.say(S.focus === S.need
    ? 'با کمترین وضوح تصمیم گرفتی — آفرین!'
    : 'درست بود. با وضوحِ کمتر هم می‌شد.', S.focus === S.need ? 'good' : 'info');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

function ringKnobX() { return RING.x + 34 + (S.focusA / 3) * (RING.w - 68); }
function ringValue(px) {
  const k = clamp((px - RING.x - 34) / (RING.w - 68), 0, 1);
  return Math.round(k * 3);
}
function peakAt(p) {
  for (let i = 0; i < S.peaks.length; i++) {
    const q = S.peaks[i];
    if (Math.abs(p.x - q.x) < 118 && p.y > q.base - q.h - 96 && p.y < q.base + 20) return i;
  }
  return -1;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.dragRing) {
    const v = ringValue(p.x);
    if (v !== S.focus) { S.focus = v; sfx.tone(300 + v * 70, .06, 'square', .03); }
    return;
  }
  S.hover = null;
  if (inRect(p, RING)) S.hover = 'ring';
  else if (peakAt(p) >= 0) S.hover = 'peak';
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
  if (inRect(p, RING)) {
    S.dragRing = true;
    const v = ringValue(p.x);
    if (v !== S.focus) { S.focus = v; sfx.tone(300 + v * 70, .06, 'square', .03); }
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    if (S.tut.on && S.tut.step === 1 && S.focus > 0) { S.tut.step = 2; S.tut.t = 0; }
    return;
  }
  const i = peakAt(p);
  if (i >= 0) choose(i);
});

cv.addEventListener('pointerup', () => { S.dragRing = false; });
cv.addEventListener('pointercancel', () => { S.dragRing = false; });

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
  ctx.fillStyle = `rgba(10, 12, 24, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(247, 238, 218, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '6, 8, 18');
  ctx.fillStyle = P.brassDk;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6a6080' }); yy += 30; }
  return h + 20;
}

/** خطّ کوهستان با ارتفاعِ تصادفیِ ثابت. */
function ridge(y, amp, col, seed, step2) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H);
  ctx.lineTo(0, y);
  for (let x = 0; x <= SCENE_W; x += step2) {
    ctx.lineTo(x, y - Math.abs(Math.sin(x * .004 + seed)) * amp
      - Math.abs(Math.sin(x * .011 + seed * 2)) * amp * .5);
  }
  ctx.lineTo(SCENE_W, SCENE_H);
  ctx.closePath(); ctx.fill();
}

function paintSkyStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, 600);
  g.addColorStop(0, P.sky0);
  g.addColorStop(.32, P.sky1);
  g.addColorStop(.6, P.sky2);
  g.addColorStop(.82, P.sky3);
  g.addColorStop(1, P.sky4);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, 620);
  /* خورشیدِ پشتِ کوه */
  const sg = ctx.createRadialGradient(600, 560, 20, 600, 560, 300);
  sg.addColorStop(0, 'rgba(255, 220, 150, .5)');
  sg.addColorStop(1, 'rgba(255, 220, 150, 0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(600, 560, 300, 0, TAU); ctx.fill();
  ridge(470, 92, P.far, 1.3, 14);
  ridge(534, 74, P.mid, 3.1, 14);
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.sky0);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('sky', SCENE_W, SCENE_H, paintSkyStatic), 0, 0, SCENE_W, SCENE_H);
  drawBirds();
  drawPeaks();
  drawFog();
  drawPlates();
  drawLedge();
  drawRing();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.1, 'rgba(6, 8, 18, .5)', .4, .16);
}

function drawBirds() {
  ctx.strokeStyle = 'rgba(30, 30, 50, .35)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (const b of S.birds) {
    const f = Math.sin(S.t * 4 + b.ph) * 5;
    ctx.beginPath();
    ctx.moveTo(b.x - 9, b.y + f); ctx.quadraticCurveTo(b.x, b.y - 5, b.x + 9, b.y + f);
    ctx.stroke();
  }
}

function drawPeaks() {
  for (const p of S.peaks) {
    const top = p.base - p.h;
    ctx.save();
    /* بدنهٔ قلّه */
    const g = ctx.createLinearGradient(p.x - 130, top, p.x + 130, p.base);
    g.addColorStop(0, shade(P.near, .22));
    g.addColorStop(.45, P.near);
    g.addColorStop(1, shade(P.near, -.3));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(p.x - 152, p.base + 30);
    ctx.lineTo(p.x - 44, top + 34);
    ctx.lineTo(p.x, top);
    ctx.lineTo(p.x + 48, top + 40);
    ctx.lineTo(p.x + 156, p.base + 30);
    ctx.closePath(); ctx.fill();
    /* برفِ نوک */
    ctx.fillStyle = P.snow;
    ctx.beginPath();
    ctx.moveTo(p.x - 44, top + 34);
    ctx.lineTo(p.x, top);
    ctx.lineTo(p.x + 48, top + 40);
    ctx.lineTo(p.x + 26, top + 40);
    ctx.lineTo(p.x + 10, top + 26);
    ctx.lineTo(p.x - 12, top + 44);
    ctx.lineTo(p.x - 26, top + 32);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.snowDk;
    ctx.beginPath();
    ctx.moveTo(p.x, top); ctx.lineTo(p.x + 48, top + 40); ctx.lineTo(p.x + 26, top + 40);
    ctx.lineTo(p.x + 10, top + 26);
    ctx.closePath(); ctx.fill();
    /* شکافِ سنگ */
    ctx.strokeStyle = 'rgba(10, 12, 24, .3)'; ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const sx = p.x - 60 + i * 60;
      ctx.moveTo(sx, top + 60 + i * 12);
      ctx.lineTo(sx + (noise1(p.seed + i) - .5) * 50, p.base + 10);
      ctx.stroke();
    }
    if (p.picked) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(234, 181, 63, .2)';
      ctx.beginPath();
      ctx.moveTo(p.x - 152, p.base + 30); ctx.lineTo(p.x, top); ctx.lineTo(p.x + 156, p.base + 30);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    if (p.wrong > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(p.wrong, 0, 1) * .5;
      ctx.fillStyle = P.bad;
      ctx.beginPath();
      ctx.moveTo(p.x - 152, p.base + 30); ctx.lineTo(p.x, top); ctx.lineTo(p.x + 156, p.base + 30);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

/** لایه‌های مه: هر درجه از حلقه، یک لایه کنار می‌رود. */
function drawFog() {
  for (let i = 0; i < 3; i++) {
    const off = clamp(S.focusA - i, 0, 1);
    const a = (1 - off) * .5;
    if (a < .01) continue;
    ctx.save();
    ctx.globalAlpha = a;
    const y = 320 + i * 78;
    const g = ctx.createLinearGradient(0, y - 60, 0, y + 92);
    g.addColorStop(0, 'rgba(223, 230, 245, 0)');
    g.addColorStop(.45, P.fog);
    g.addColorStop(1, 'rgba(223, 230, 245, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, y + 92);
    for (let x = 0; x <= SCENE_W; x += 24) {
      ctx.lineTo(x, y + Math.sin(x * .006 + S.t * .22 + i * 2) * 22 + Math.sin(x * .017 + i) * 9);
    }
    ctx.lineTo(SCENE_W, y + 92);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.save();
  ctx.fillStyle = 'rgba(240, 246, 255, .5)';
  for (const m of S.motes) {
    ctx.globalAlpha = .12 + .2 * Math.abs(Math.sin(S.t * .8 + m.ph));
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/** تابلوی چوبیِ هر قلّه با عددی که از این فاصله پیداست. */
function drawPlates() {
  for (const p of S.peaks) {
    const top = p.base - p.h;
    const y = top - 62;
    const w = 176, h = 62, x = p.x - w / 2;
    /* پایهٔ تابلو */
    ctx.strokeStyle = P.woodDk; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p.x, y + h); ctx.lineTo(p.x, top + 16); ctx.stroke();
    withShadow(16, 7, .4, () => {
      ctx.fillStyle = P.woodDk;
      wobbleRect(x - 5, y - 5, w + 10, h + 10, 9, p.seed, 1.6); ctx.fill();
    }, '6, 8, 18');
    ctx.fillStyle = texWood(P.wood, P.woodDk);
    wobbleRect(x, y, w, h, 7, p.seed + 3, 1.4); ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(255,255,255,.22)');
    g.addColorStop(1, 'rgba(0,0,0,.28)');
    ctx.fillStyle = g;
    wobbleRect(x, y, w, h, 7, p.seed + 3, 1.4); ctx.fill();
    /* عدد */
    const v = seen(p.v, S.focus);
    const hidden = 3 - S.focus;
    numText(fa(v), p.x, y + h / 2 + 1,
      { size: 34, color: p.picked ? P.gold : P.paper, stroke: 'rgba(20, 16, 30, .6)', strokeWidth: 5 });
    if (hidden > 0) {
      text('؟'.repeat(hidden), p.x + 76, y + h - 12, { size: 15, color: 'rgba(247, 238, 218, .5)' });
    }
    /* پیچ‌های تابلو */
    ctx.fillStyle = P.brassDk;
    for (const sx of [x + 12, x + w - 12]) {
      ctx.beginPath(); ctx.arc(sx, y + 12, 4, 0, TAU); ctx.arc(sx, y + h - 12, 4, 0, TAU); ctx.fill();
    }
    if (p.picked) {
      ctx.save();
      ctx.globalAlpha = .7 + .3 * Math.sin(S.t * 4);
      ctx.strokeStyle = P.gold; ctx.lineWidth = 4;
      wobbleRect(x - 5, y - 5, w + 10, h + 10, 9, p.seed, 1.6); ctx.stroke();
      ctx.restore();
      numText(fa(S.order.indexOf(S.peaks.indexOf(p)) + 1), x - 22, y + h / 2,
        { size: 26, color: P.gold, stroke: 'rgba(20,16,30,.6)', strokeWidth: 5 });
    }
  }
}

/** صخرهٔ جلو و دوربینِ دیده‌بانی. */
function drawLedge() {
  ctx.fillStyle = P.ridge;
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H);
  ctx.lineTo(0, 596);
  for (let x = 0; x <= SCENE_W; x += 18) {
    ctx.lineTo(x, 596 + Math.sin(x * .009 + 2) * 14 + Math.sin(x * .026) * 6);
  }
  ctx.lineTo(SCENE_W, SCENE_H);
  ctx.closePath(); ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H); ctx.lineTo(0, 596);
  for (let x = 0; x <= SCENE_W; x += 18) ctx.lineTo(x, 596 + Math.sin(x * .009 + 2) * 14 + Math.sin(x * .026) * 6);
  ctx.lineTo(SCENE_W, SCENE_H); ctx.closePath(); ctx.clip();
  ctx.globalAlpha = .5;
  ctx.fillStyle = texStone('#1b1e33', '#0a0c18');
  ctx.fillRect(0, 590, SCENE_W, SCENE_H - 590);
  ctx.restore();

  /* سه‌پایه و دوربین */
  const tx = 152, ty = 592;
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 9; ctx.lineCap = 'round';
  for (const dx of [-34, 0, 34]) {
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + dx, ty + 96); ctx.stroke();
  }
  ctx.save();
  ctx.translate(tx, ty - 8);
  ctx.rotate(-.22 + S.focusA * .05);
  ctx.fillStyle = shade(P.brassDk, -.4);
  ctx.beginPath(); rrPath(-16, -20, 132, 40, 20); ctx.fill();
  const bg = ctx.createLinearGradient(0, -20, 0, 20);
  bg.addColorStop(0, P.brassLt); bg.addColorStop(.4, P.brass); bg.addColorStop(1, P.brassDk);
  ctx.fillStyle = bg;
  ctx.beginPath(); rrPath(-14, -17, 128, 34, 17); ctx.fill();
  ctx.fillStyle = shade(P.brassDk, -.2);
  ctx.beginPath(); rrPath(96, -22, 30, 44, 12); ctx.fill();
  ctx.fillStyle = '#0d1424';
  ctx.beginPath(); ctx.ellipse(120, 0, 7, 19, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(160, 220, 255, .35)';
  ctx.beginPath(); ctx.ellipse(120, 0, 5, 15, 0, 0, TAU); ctx.fill();
  /* حلقهٔ تنظیم روی بدنه */
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < S.focusA ? P.brassLt : shade(P.brassDk, -.15);
    ctx.beginPath(); rrPath(10 + i * 26, -19, 8, 38, 4); ctx.fill();
  }
  ctx.restore();
}

/** حلقهٔ وضوح: چهار درجه، از «هزارتا» تا «یکی». */
function drawRing() {
  const b = RING;
  ctx.fillStyle = 'rgba(12, 14, 28, .72)';
  ctx.beginPath(); rrPath(b.x - 16, b.y - 34, b.w + 32, b.h + 62, 20); ctx.fill();
  ctx.strokeStyle = 'rgba(203, 166, 79, .3)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(b.x - 16, b.y - 34, b.w + 32, b.h + 62, 20); ctx.stroke();
  text('وضوحِ دوربین', b.x + b.w / 2, b.y - 14, { size: 16, color: 'rgba(247, 238, 218, .75)' });

  /* ریل */
  const y = b.y + b.h / 2;
  ctx.fillStyle = shade(P.brassDk, -.5);
  ctx.beginPath(); rrPath(b.x + 24, y - 9, b.w - 48, 18, 9); ctx.fill();
  const rg = ctx.createLinearGradient(0, y - 9, 0, y + 9);
  rg.addColorStop(0, shade(P.brassDk, -.15)); rg.addColorStop(1, P.brassDk);
  ctx.fillStyle = rg;
  ctx.beginPath(); rrPath(b.x + 25, y - 8, b.w - 50, 16, 8); ctx.fill();
  /* درجه‌ها */
  for (let i = 0; i < 4; i++) {
    const x = b.x + 34 + (i / 3) * (b.w - 68);
    const on = i <= S.focus;
    ctx.fillStyle = on ? P.brassLt : 'rgba(203, 166, 79, .3)';
    ctx.beginPath(); ctx.arc(x, y, 5.5, 0, TAU); ctx.fill();
    text(STOPS[i].n, x, y + 30, { size: 15, family: 'Lalezar',
      color: i === S.focus ? P.gold : 'rgba(247, 238, 218, .5)' });
    if (i === S.need && S.focus < S.need) {
      ctx.save();
      ctx.globalAlpha = .35 + .3 * Math.sin(S.t * 4);
      ctx.strokeStyle = P.snow; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }
  /* دستگیره */
  const kx = ringKnobX();
  const gg = ctx.createRadialGradient(kx - 6, y - 8, 2, kx, y, 26);
  gg.addColorStop(0, P.brassLt); gg.addColorStop(1, P.brassDk);
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.beginPath(); ctx.arc(kx, y + 4, 21, 0, TAU); ctx.fill();
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(kx, y, 20, 0, TAU); ctx.fill();
  ctx.strokeStyle = shade(P.brassDk, -.3); ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(kx + i * 5, y - 10); ctx.lineTo(kx + i * 5, y + 10); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.beginPath(); ctx.ellipse(kx - 6, y - 8, 6, 3.4, -.6, 0, TAU); ctx.fill();

  /* پیامِ «فرقشان معلوم نیست» */
  if (S.nope > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.nope, 0, 1);
    ctx.fillStyle = 'rgba(140, 40, 28, .85)';
    ctx.beginPath(); rrPath(SCENE_W / 2 - 210, 300, 420, 52, 14); ctx.fill();
    text('از این فاصله فرقشان معلوم نیست', SCENE_W / 2, 326,
      { size: 21, family: 'Lalezar', color: '#ffe0d6' });
    ctx.restore();
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(16, 18, 34, .9)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(203, 166, 79, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 206 - i * 32;
    ctx.save();
    ctx.globalAlpha = i < S.lamps ? 1 : .22;
    if (i < S.lamps) {
      const gg = ctx.createRadialGradient(x, HUD_H / 2, 1, x, HUD_H / 2, 16);
      gg.addColorStop(0, 'rgba(234, 181, 63, .6)');
      gg.addColorStop(1, 'rgba(234, 181, 63, 0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(x, HUD_H / 2, 16, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = i < S.lamps ? P.gold : '#7d7684';
    ctx.beginPath(); rrPath(x - 8, HUD_H / 2 - 11, 16, 22, 6); ctx.fill();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(247, 238, 218, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
  /* یادآوریِ کار */
  text(S.three ? 'از کوتاه‌ترین به بلندترین بزن' : 'روی بلندترین قلّه بزن',
    SCENE_W / 2 + 210, HUD_H / 2, { size: 15, color: 'rgba(247, 238, 218, .55)' });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: 180, y: 150, w: 840, h: 330 }], .72);
    const h = tutCard(300, 500, 600,
      ['قلّه‌ها توی مه‌اند و از تابلوشان', 'فقط رقم‌های بالا پیداست.'], 'قلّه‌ها در مه');
    tutMore(600, 500 + h + 10, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: RING.x - 16, y: RING.y - 34, w: RING.w + 32, h: RING.h + 62 }], .7);
    tutCard(300, 250, 600, ['حلقهٔ دوربین را جلو ببر؛', 'هر درجه یک لایه مه کنار می‌رود.']);
  } else {
    spot([{ x: 180, y: 150, w: 840, h: 330 }], .68);
    const h = tutCard(280, 470, 640,
      ['تا عددها یکی دیده می‌شوند، اجازهٔ اشاره نداری.', 'ولی هرچه با وضوحِ کمتری تصمیم بگیری،',
       'امتیازت بیشتر است — پس زیادی جلو نرو.'], 'کمترین وضوح');
    tutMore(600, 470 + h + 10, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function scopeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-.25);
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); rrPath(-30, -13, 62, 26, 13); ctx.fill();
  ctx.fillStyle = P.brass;
  ctx.beginPath(); rrPath(-28, -11, 58, 22, 11); ctx.fill();
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); rrPath(26, -16, 20, 32, 9); ctx.fill();
  ctx.fillStyle = '#0d1424';
  ctx.beginPath(); ctx.ellipse(44, 0, 5, 14, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 760, h: 286, y: 138,
    paper: P.paper, band: P.brassDk, ink: P.ink, inkSoft: '#7d7392',
    icon: scopeIcon,
    title: 'قلّه‌ها در مه',
    body: 'از دور، تابلوی قلّه‌ها فقط رقم‌های بالا را نشان می‌دهد.\nحلقهٔ دوربین را جلو ببر تا مه کنار برود و رقم‌های بعدی پیدا شوند.\nهرچه با وضوحِ کمتری تصمیم بگیری، امتیازت بیشتر است.',
    btn: BTN_GO, btnLabel: 'دوربین را بردار', btnHot: S.hover === BTN_GO,
    btnFill: '#8f6f28', btnHotFill: '#ab8834',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#7d7392',
    icon: scopeIcon,
    title: L().endless ? 'شب شد' : 'همهٔ قلّه‌ها شناخته شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ هواها را دیدی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'هوای بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#8f6f28', btnHotFill: '#ab8834',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#7d7392',
    icon: (x, y) => { ctx.fillStyle = '#9aa2b8';
      for (let i = 0; i < 3; i++) { ctx.globalAlpha = .45 - i * .1;
        ctx.beginPath(); ctx.ellipse(x - 10 + i * 12, y - i * 9, 26 - i * 4, 10, 0, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1; },
    title: 'مه همه‌جا را گرفت',
    body: 'امتیاز: ' + fa(S.score) + '\nاوّل رقم‌های بالا را ببین؛ اگر یکی بودند، یک درجه جلوتر برو.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#8f6f28', btnHotFill: '#ab8834',
  });
}

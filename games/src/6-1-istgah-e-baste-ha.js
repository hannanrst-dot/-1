/*!
title: ایستگاهِ بسته‌ها — تشخیصِ عمل
bg: #e6d5b4
*/

/* ═══════════════════════════════════════════════════════════════════════
   ایستگاهِ بسته‌ها — ریاضی سوم، فصل ۶، درس ۱ (حلّ مسئله)
   ───────────────────────────────────────────────────────────────────────
   کتاب صریح می‌گوید: «در مسئله‌های زیر فقط نوعِ عمل را تشخیص دهید؛ به
   دست آوردن جواب لازم نیست.» و بعد راهش را هم می‌گوید: «گاهی تغییرِ
   عددها کمک می‌کند راهِ حل را تشخیص دهی.»

   پس بازی این شد: در ایستگاهِ پستی کار می‌کنی. بسته‌ها روی نوار می‌آیند
   و روی هرکدام یک مسئله نوشته شده. باید هر بسته را توی سُرسرهٔ درست
   بیندازی: جمع، تفریق، ضرب، تقسیم. هیچ‌وقت چیزی حساب نمی‌کنی.

   و یک ابزار داری: «ذرّه‌بینِ ساده‌ساز». هر وقت رویش بزنی، عددهای گندهٔ
   بسته کوچک می‌شوند — ۳۶۵ می‌شود ۳ و ۲۴ می‌شود ۲ — و آن‌وقت شکلِ مسئله
   پیدا می‌شود. همان کاری که کتاب می‌خواهد یاد بدهد، ولی به دستِ خودت.

   نوار می‌آید و می‌آید. اگر بسته‌ها تلنبار شوند، ایستگاه قفل می‌کند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  wall:  '#f0e2c6', wallDk: '#ddcaa4', wallLt: '#fdf6e6',
  belt:  '#5f6e78', beltDk: '#44515a', beltLt: '#7f909b',
  crate: '#dcb87c', crateDk: '#b28f52', crateLt: '#f0d6a2',
  paper: '#fdf7ea', ink: '#3c3020', inkSoft: '#8b7a5c',
  brass: '#c9a24a', brassDk: '#96762f', brassLt: '#eccf85',
  good:  '#5f9c56', bad: '#cb5b40', gold: '#e8b23f',
};

/* چهار عمل، هرکدام رنگ و سُرسرهٔ خودش */
const OPS = [
  { s: '+', n: 'جمع',   c: '#5f9c56', d: '#43763c' },
  { s: '−', n: 'تفریق', c: '#d1804a', d: '#a95f31' },
  { s: '×', n: 'ضرب',   c: '#5f86b8', d: '#406390' },
  { s: '÷', n: 'تقسیم', c: '#a86ab0', d: '#814b8a' },
];

/* بانکِ مسئله‌ها. {a} و {b} جای عددهای بزرگ، و «کوچک» همان مسئله با
   عددهای ریز است — همان ترفندی که کتاب پیشنهاد می‌کند. */
const STORIES = [
  /* ── جمع ── */
  { op: 0, t: 'در باغی {a} درختِ پرتقال و {b} درختِ نارنگی کاشته‌اند. این باغ روی هم چند درخت دارد؟', A: [900, 1900], B: [120, 800], s: [4, 3] },
  { op: 0, t: 'هاجر {a} تومان و سارا {b} تومان پول دارد. پولِ این دو نفر روی هم چقدر است؟', A: [1200, 4800], B: [800, 3900], s: [4, 3] },
  { op: 0, t: 'در شهری {a} دانش‌آموزِ پسر و {b} دانش‌آموزِ دختر درس می‌خوانند. این شهر چند دانش‌آموز دارد؟', A: [2200, 4800], B: [2100, 4700], s: [5, 4] },
  { op: 0, t: 'حمید {a} ریال در قلّک داشت و {b} ریالِ دیگر هم تویش ریخت. حالا چقدر پول دارد؟', A: [3200, 6900], B: [900, 2900], s: [5, 2] },
  { op: 0, t: 'در صندوقِ اوّل {a} رأی و در صندوقِ دوم {b} رأی بود. روی هم چند رأی ریخته شده است؟', A: [1500, 4500], B: [1400, 4400], s: [3, 4] },
  { op: 0, t: 'یک اتوبوس {a} کیلومتر رفت، بعد {b} کیلومترِ دیگر. روی هم چند کیلومتر رفته است؟', A: [700, 2400], B: [500, 1900], s: [3, 2] },
  /* ── تفریق ── */
  { op: 1, t: 'قلّهٔ اورست {a} متر و قلّهٔ دماوند {b} متر است. اورست چند متر از دماوند بلندتر است؟', A: [8848, 8848], B: [5671, 5671], s: [8, 5] },
  { op: 1, t: 'حمید {a} ریال در قلّک داشت و {b} ریال از آن برداشت. حالا چقدر پول دارد؟', A: [4300, 6900], B: [1100, 2900], s: [6, 2] },
  { op: 1, t: 'کتابی {a} صفحه دارد و علی {b} صفحه‌اش را خوانده است. چند صفحه مانده است؟', A: [180, 460], B: [40, 150], s: [7, 3] },
  { op: 1, t: 'در سالن {a} نفر بودند و {b} نفرشان رفتند. چند نفر مانده‌اند؟', A: [900, 2600], B: [300, 800], s: [6, 2] },
  { op: 1, t: 'مریم {a} تومان داشت و کتابی {b} تومانی خرید. چقدر پول برایش ماند؟', A: [3500, 8500], B: [900, 3200], s: [5, 2] },
  { op: 1, t: 'یک انبار {a} کیسه آرد داشت و {b} کیسه‌اش فروخته شد. چند کیسه مانده است؟', A: [1400, 3800], B: [400, 1300], s: [7, 4] },
  /* ── ضرب ── */
  { op: 2, t: 'هر سال {a} روز است و هر روز {b} ساعت. یک سال چند ساعت است؟', A: [365, 365], B: [24, 24], s: [3, 2] },
  { op: 2, t: '{a} جعبه داریم و در هر جعبه {b} مداد است. روی هم چند مداد داریم؟', A: [24, 96], B: [12, 36], s: [3, 4] },
  { op: 2, t: 'یک قطار {a} واگن دارد و هر واگن {b} صندلی. این قطار چند صندلی دارد؟', A: [12, 28], B: [40, 90], s: [4, 3] },
  { op: 2, t: 'رضا هر روز {b} صفحه می‌خواند. در {a} روز چند صفحه می‌خواند؟', A: [15, 40], B: [18, 45], s: [4, 5] },
  { op: 2, t: 'در هر بستهٔ شکلات {b} تا شکلات است. {a} بسته روی هم چند شکلات دارد؟', A: [18, 45], B: [12, 30], s: [3, 5] },
  { op: 2, t: 'یک باغ {a} ردیف درخت دارد و در هر ردیف {b} درخت است. این باغ چند درخت دارد؟', A: [14, 38], B: [16, 42], s: [4, 3] },
  /* ── تقسیم ── */
  { op: 3, t: 'جواد {a} دفترچه دارد و می‌خواهد در بسته‌های {b}تایی بگذارد. چند بسته درست می‌شود؟', A: [0, 0], B: [3, 8], s: [8, 2], mul: [6, 18] },
  { op: 3, t: '{a} شاخه گل را می‌خواهیم به طورِ مساوی در {b} گلدان بگذاریم. در هر گلدان چند شاخه؟', A: [0, 0], B: [2, 6], s: [6, 3], mul: [5, 16] },
  { op: 3, t: 'اتوبوسی {a} مسافر داشت. اگر هر تاکسی {b} نفر ببرد، چند تاکسی لازم است؟', A: [0, 0], B: [4, 6], s: [8, 4], mul: [5, 14] },
  { op: 3, t: '{a} شکلات را می‌خواهیم بینِ {b} نفر به طورِ مساوی تقسیم کنیم. به هر نفر چند تا می‌رسد؟', A: [0, 0], B: [3, 7], s: [9, 3], mul: [5, 15] },
  { op: 3, t: 'مادرِ محسن {a} دکمه دارد و به هر پیراهن {b} دکمه می‌دوزد. به چند پیراهن می‌دوزد؟', A: [0, 0], B: [4, 8], s: [6, 2], mul: [6, 16] },
  { op: 3, t: 'در انباری {a} استکان هست و در هر جعبه {b} استکان جا می‌شود. چند جعبه لازم است؟', A: [0, 0], B: [6, 9], s: [8, 4], mul: [5, 14] },
];

const LEVELS = [
  { name: 'نوبتِ صبح', ops: [0, 1], gap: 7.5, cap: 4, quota: 8,
    hint: 'بسته را توی سُرسرهٔ درست بینداز. اگر گیج شدی، ذرّه‌بین را بزن.' },
  { name: 'بارِ ظهر', ops: [0, 1, 2], gap: 6.6, cap: 4, quota: 10,
    hint: 'ضرب هم آمد. «هر ... چند تا» را ببین.' },
  { name: 'شلوغیِ عصر', ops: [0, 1, 2, 3], gap: 6, cap: 5, quota: 12,
    hint: 'هر چهار سُرسره باز است.' },
  { name: 'قطارِ شب', ops: [0, 1, 2, 3], gap: 5, cap: 5, quota: 14,
    hint: 'بسته‌ها تندتر می‌آیند.' },
  { name: 'تا صبح', ops: [0, 1, 2, 3], gap: 4.6, cap: 6, endless: true,
    hint: 'تا وقتی نوار قفل نکرده، بسته‌ها را بفرست.' },
];

const HUD_H = 52;
const BELT = { x: 0, y: 110, w: SCENE_W, h: 112 };
const CARD = { x: 292, y: 246, w: 616, h: 176 };
const LENS = { x: 940, y: 260, w: 172, h: 148 };
const CHUTE_Y = 452, CHUTE_H = 250;
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  queue: [],           // { st, a, b, x, small, id }
  spawnT: 0,
  small: false,
  fly: null,           // بستهٔ در حالِ افتادن توی سُرسره
  chuteT: [0, 0, 0, 0],
  wrong: 0,
  jam: 0,
  lives: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  lensT: 0,
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
let nextId = 1;

function loadBest() { try { return +localStorage.getItem('baste-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('baste-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function makeParcel() {
  const ops = L().ops;
  const op = ops[Math.floor(Math.random() * ops.length)];
  const pool = STORIES.filter((q) => q.op === op);
  const st = pool[Math.floor(Math.random() * pool.length)];
  let a, b;
  if (st.mul) { b = R(st.B[0], st.B[1]); a = b * R(st.mul[0], st.mul[1]); }
  else { a = R(st.A[0], st.A[1]); b = R(st.B[0], st.B[1]); }
  if (st.op === 1 && b >= a) b = Math.max(1, Math.floor(a / 2));
  return { st, a, b, id: nextId++, x: SCENE_W + 160, t: 0 };
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.queue = [];
  S.spawnT = .6;
  S.small = false;
  S.fly = null;
  S.wrong = 0; S.jam = 0;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  if (!keep) { S.score = 0; S.lives = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

const front = () => S.queue[0] || null;

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.wrong > 0) S.wrong -= dt;
  if (S.jam > 0) S.jam -= dt;
  if (S.lensT > 0) S.lensT -= dt;
  for (let i = 0; i < 4; i++) if (S.chuteT[i] > 0) S.chuteT[i] -= dt;

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen) {
      S.spawnT -= dt;
      if (S.spawnT <= 0) {
        S.queue.push(makeParcel());
        S.spawnT = L().gap;
        if (S.queue.length > L().cap) jam();
      }
    }
    /* بسته‌ها روی نوار سُر می‌خورند تا جای خودشان */
    for (let i = 0; i < S.queue.length; i++) {
      const q = S.queue[i];
      const tx = i === 0 ? -400 : SCENE_W - 130 - (i - 1) * 150;
      if (i === 0) q.x += (0 - q.x) * Math.min(1, dt * 6);
      else q.x += (tx - q.x) * Math.min(1, dt * 5);
      q.t += dt;
    }
    if (S.tut.on) S.tut.t += dt;
  }
  if (S.fly) {
    S.fly.t += dt;
    if (S.fly.t > .55) S.fly = null;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function jam() {
  S.lives--;
  S.combo = 0;
  S.jam = 1;
  S.shake = .5;
  sfx.nope();
  toast.say('نوار قفل کرد! بسته‌ها تلنبار شدند.', 'bad');
  S.queue = S.queue.slice(0, 2);
  S.small = false;
  if (S.lives <= 0) { S.phase = 'lost'; S.phaseT = 0; }
}

function chuteBox(i) {
  const w = 262, gap = 20;
  const total = 4 * w + 3 * gap;
  return { x: (SCENE_W - total) / 2 + i * (w + gap), y: CHUTE_Y, w, h: CHUTE_H };
}

function send(i) {
  const q = front();
  if (!q || S.fly) return;
  const box = chuteBox(i);
  if (q.st.op === i) {
    S.queue.shift();
    S.small = false;
    S.fly = { q, t: 0, to: i, ok: true };
    S.chuteT[i] = .7;
    S.combo++;
    S.cleared++;
    const pts = 160 + Math.min(S.combo, 8) * 45;
    S.score += pts;
    if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
    bits.confetti(box.x + box.w / 2, box.y + 60, 26, [OPS[i].c, P.gold, '#fff', P.crateLt]);
    sfx.good();
    if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
    if (!L().endless && S.cleared >= S.quota) { S.score += 700; S.phase = 'won'; S.phaseT = 0; }
  } else {
    S.combo = 0;
    S.wrong = .8;
    S.shake = .2;
    S.chuteT[i] = .5;
    sfx.nope();
    /* بسته برمی‌گردد تهِ نوار — فرصتِ دوباره، ولی وقت می‌رود */
    S.queue.shift();
    q.x = SCENE_W + 120;
    S.queue.push(q);
    S.small = false;
    if (S.queue.length > L().cap) jam();
  }
}

/* ───────── ورودی ───────── */

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  S.hover = null;
  for (let i = 0; i < 4; i++) if (inRect(p, chuteBox(i))) S.hover = i;
  if (inRect(p, LENS)) S.hover = 'lens';
  cv.style.cursor = S.hover !== null ? 'pointer' : 'default';
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
  if (inRect(p, LENS)) {
    if (!front()) return;
    S.small = !S.small;
    S.lensT = .5;
    sfx.tone(S.small ? 620 : 380, .12, 'triangle', .05);
    return;
  }
  for (let i = 0; i < 4; i++) if (inRect(p, chuteBox(i))) { send(i); return; }
});

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
  ctx.fillStyle = `rgba(40, 28, 12, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .4, () => {
    ctx.fillStyle = 'rgba(253, 247, 234, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '60, 40, 10');
  ctx.fillStyle = P.brassDk;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6d5c3c' }); yy += 30; }
  return h + 20;
}

/** متنِ مسئله با عددهای بزرگ یا کوچک. */
function storyText(q, small) {
  const a = small ? q.st.s[0] : q.a, b = small ? q.st.s[1] : q.b;
  return q.st.t.replace('{a}', fa(a)).replace('{b}', fa(b));
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.wall);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  drawRoom();
  drawBelt();
  drawChutes();
  drawCard();
  drawLens();
  drawFly();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.12, 'rgba(70, 48, 16, .3)');
}

function drawRoom() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, SCENE_H);
  g.addColorStop(0, P.wallLt);
  g.addColorStop(1, P.wallDk);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  /* کاشیِ دیوار */
  ctx.strokeStyle = 'rgba(150, 120, 70, .1)'; ctx.lineWidth = 2;
  for (let x = 0; x < SCENE_W; x += 60) { ctx.beginPath(); ctx.moveTo(x, HUD_H); ctx.lineTo(x, SCENE_H); ctx.stroke(); }
  for (let y = HUD_H; y < SCENE_H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke(); }
}

function drawBelt() {
  const b = BELT;
  ctx.fillStyle = P.beltDk;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = P.belt;
  ctx.fillRect(b.x, b.y + 6, b.w, b.h - 12);
  /* تسمه‌ها */
  ctx.fillStyle = P.beltLt;
  const off = (S.t * 62) % 44;
  for (let x = -44; x < b.w + 44; x += 44) {
    ctx.fillRect(b.x + x - off, b.y + 8, 8, b.h - 16);
  }
  ctx.fillStyle = P.beltDk;
  ctx.fillRect(b.x, b.y + b.h - 6, b.w, 6);

  /* بسته‌های در صف */
  for (let i = S.queue.length - 1; i >= 1; i--) {
    const q = S.queue[i];
    drawCrate(q.x, b.y + b.h / 2, 130, 84, i);
  }
  /* شمارندهٔ صف */
  const cap = L().cap;
  for (let i = 0; i < cap; i++) {
    const x = 24 + i * 22, on = i < S.queue.length - 1;
    ctx.fillStyle = on ? (i >= cap - 2 ? P.bad : P.brass) : 'rgba(255,255,255,.22)';
    ctx.beginPath(); rrPath(x, b.y + b.h + 10, 16, 10, 4); ctx.fill();
  }
  if (S.jam > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.jam, 0, 1);
    ctx.fillStyle = 'rgba(203, 91, 64, .3)';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.restore();
  }
}

function drawCrate(cx, cy, w, h, seed) {
  ctx.save();
  ctx.translate(cx, cy);
  withShadow(10, 5, .3, () => {
    ctx.fillStyle = P.crateDk;
    wobbleRect(-w / 2, -h / 2, w, h, 8, seed, 1.4); ctx.fill();
    ctx.fillStyle = P.crate;
    wobbleRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 7, seed + 3, 1.2); ctx.fill();
  }, '60, 40, 10');
  ctx.strokeStyle = 'rgba(150, 110, 50, .5)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-w / 2 + 4, -6); ctx.lineTo(w / 2 - 4, -6); ctx.stroke();
  ctx.fillStyle = P.paper;
  wobbleRect(-w / 2 + 16, -h / 2 + 12, w - 32, 22, 4, seed + 7, 1); ctx.fill();
  ctx.strokeStyle = 'rgba(120, 100, 70, .5)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 22, -h / 2 + 18 + i * 5); ctx.lineTo(w / 2 - 22, -h / 2 + 18 + i * 5); ctx.stroke();
  }
  ctx.restore();
}

/** بستهٔ جلوی صف — همان که باید سُرش بدهی. */
function drawCard() {
  const q = front();
  const b = CARD;
  withShadow(24, 10, .38, () => {
    ctx.fillStyle = P.crateDk;
    wobbleRect(b.x - 10, b.y - 10, b.w + 20, b.h + 20, 14, 11, 2); ctx.fill();
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 10, 13, 1.8); ctx.fill();
  }, '60, 40, 10');
  if (S.wrong > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.wrong, 0, 1) * .35;
    ctx.fillStyle = P.bad;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
    ctx.restore();
  }
  /* نوارِ چسبِ بالای بسته */
  ctx.fillStyle = 'rgba(201, 162, 74, .35)';
  ctx.fillRect(b.x + b.w / 2 - 40, b.y - 10, 80, 16);

  if (!q) {
    text('نوار خالی است…', b.x + b.w / 2, b.y + b.h / 2, { size: 22, color: P.inkSoft });
    return;
  }
  ctx.save();
  if (S.lensT > 0) {
    const k = 1 + Math.sin(clamp(S.lensT / .5, 0, 1) * Math.PI) * .04;
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.scale(k, k);
    ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));
  }
  const h = textWrap(storyText(q, S.small), b.x + b.w / 2, b.y + 52, b.w - 60,
    { size: S.small ? 26 : 23, color: P.ink, lineHeight: S.small ? 42 : 38 });
  if (S.small) {
    text('عددها کوچک شدند؛ شکلِ مسئله همان است.', b.x + b.w / 2, b.y + b.h - 26,
      { size: 15, color: '#96762f' });
  }
  ctx.restore();
}

/** ذرّه‌بینِ ساده‌ساز. */
function drawLens() {
  const b = LENS, hot = S.hover === 'lens';
  const dy = hot ? 3 : 0;
  withShadow(hot ? 18 : 10, hot ? 5 : 4, .32, () => {
    ctx.fillStyle = S.small ? P.brassLt : P.paper;
    wobbleRect(b.x, b.y + dy, b.w, b.h, 14, 21, 1.8); ctx.fill();
  }, '60, 40, 10');
  if (S.small) { ctx.strokeStyle = P.brassDk; ctx.lineWidth = 3.4;
    wobbleRect(b.x, b.y + dy, b.w, b.h, 14, 21, 1.8); ctx.stroke(); }
  const cx = b.x + b.w / 2, cy = b.y + 54 + dy;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-.5);
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, 44); ctx.stroke();
  ctx.strokeStyle = P.brass; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(180, 220, 240, .45)';
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.beginPath(); ctx.ellipse(-7, -7, 7, 4, -.7, 0, TAU); ctx.fill();
  ctx.restore();
  text('ذرّه‌بین', cx, b.y + 104 + dy, { size: 20, family: 'Lalezar', color: P.ink });
  text(S.small ? 'عددهای اصلی' : 'عددها را کوچک کن', cx, b.y + 128 + dy,
    { size: 13, color: P.inkSoft });
}

function drawChutes() {
  for (let i = 0; i < 4; i++) {
    const b = chuteBox(i), o = OPS[i], hot = S.hover === i;
    const pulse = S.chuteT[i] > 0 ? clamp(S.chuteT[i] * 2, 0, 1) : 0;
    const dy = hot ? 3 : 0;
    withShadow(hot ? 20 : 12, hot ? 6 : 5, .34, () => {
      ctx.fillStyle = o.d;
      wobbleRect(b.x, b.y + dy, b.w, b.h, 16, b.x, 2); ctx.fill();
      ctx.fillStyle = o.c;
      wobbleRect(b.x + 4, b.y + 4 + dy, b.w - 8, b.h - 12, 14, b.x + 2, 1.8); ctx.fill();
    }, '40, 28, 12');
    /* دهانهٔ سُرسره */
    ctx.fillStyle = 'rgba(20, 14, 6, .3)';
    ctx.beginPath(); rrPath(b.x + 26, b.y + 14 + dy, b.w - 52, 30, 12); ctx.fill();
    if (pulse) {
      ctx.save();
      ctx.globalAlpha = pulse * .55;
      ctx.fillStyle = '#fff';
      wobbleRect(b.x + 4, b.y + 4 + dy, b.w - 8, b.h - 12, 14, b.x + 2, 1.8); ctx.fill();
      ctx.restore();
    }
    numText(o.s, b.x + b.w / 2, b.y + 108 + dy, { size: 78, color: '#fff' });
    text(o.n, b.x + b.w / 2, b.y + 176 + dy, { size: 30, family: 'Lalezar', color: 'rgba(255,255,255,.94)' });
    /* بازوی فلزی پایینِ سُرسره */
    ctx.fillStyle = 'rgba(20, 14, 6, .22)';
    ctx.fillRect(b.x + 20, b.y + b.h - 8 + dy, b.w - 40, 10);
  }
}

function drawFly() {
  if (!S.fly) return;
  const k = clamp(S.fly.t / .55, 0, 1);
  const box = chuteBox(S.fly.to);
  const x = lerp(CARD.x + CARD.w / 2, box.x + box.w / 2, k);
  const y = lerp(CARD.y + CARD.h / 2, box.y + 30, easeIn(k));
  const s = lerp(1, .35, k);
  ctx.save();
  ctx.globalAlpha = 1 - k * .3;
  ctx.translate(x, y);
  ctx.rotate(k * .6);
  ctx.scale(s, s);
  drawCrate(0, 0, 220, 130, 5);
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = 'rgba(60, 44, 22, .88)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(232, 178, 63, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 206 - i * 32;
    ctx.save();
    ctx.globalAlpha = i < S.lives ? 1 : .22;
    ctx.fillStyle = i < S.lives ? P.crate : '#8d8577';
    ctx.beginPath(); rrPath(x - 11, HUD_H / 2 - 9, 22, 18, 4); ctx.fill();
    ctx.strokeStyle = i < S.lives ? P.crateDk : '#6f6a60'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 11, HUD_H / 2 - 1); ctx.lineTo(x + 11, HUD_H / 2 - 1); ctx.stroke();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(253, 247, 234, .55)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([CARD], .74);
    const h = tutCard(300, 452, 600,
      ['روی هر بسته یک مسئله نوشته شده.', 'لازم نیست حسابش کنی — فقط بگو کدام عمل است.'], 'ایستگاهِ بسته‌ها');
    tutMore(600, 452 + h + 10, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: chuteBox(0).x, y: CHUTE_Y, w: chuteBox(3).x + chuteBox(3).w - chuteBox(0).x, h: CHUTE_H }], .7);
    tutCard(300, 246, 600, ['روی سُرسرهٔ درست بزن تا بسته برود تویش.']);
  } else {
    spot([LENS], .7);
    const h = tutCard(240, 452, 600,
      ['اگر عددها گیجت کردند، ذرّه‌بین را بزن.', 'عددها کوچک می‌شوند ولی شکلِ مسئله همان است —',
       'آن‌وقت راحت‌تر می‌بینی کدام عمل است.'], 'ذرّه‌بینِ ساده‌ساز');
    tutMore(540, 452 + h + 10, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function stampIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.crateDk;
  wobbleRect(-26, -6, 52, 22, 5, 3, 1.2); ctx.fill();
  ctx.fillStyle = P.crate;
  wobbleRect(-14, -28, 28, 24, 5, 5, 1); ctx.fill();
  ctx.fillStyle = P.brass;
  wobbleRect(-22, 14, 44, 8, 3, 7, .8); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 760, h: 286, y: 138,
    paper: P.paper, band: P.brassDk, ink: P.ink, inkSoft: '#7f6c48',
    icon: stampIcon,
    title: 'ایستگاهِ بسته‌ها',
    body: 'روی هر بسته یک مسئله نوشته شده. لازم نیست حسابش کنی —\nفقط بسته را توی سُرسرهٔ درست بینداز: جمع، تفریق، ضرب یا تقسیم.\nگیج شدی؟ ذرّه‌بین را بزن تا عددها کوچک شوند.',
    btn: BTN_GO, btnLabel: 'شروعِ نوبت', btnHot: S.hover === BTN_GO,
    btnFill: '#96762f', btnHotFill: '#b18f3d',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#7f6c48',
    icon: stampIcon,
    title: L().endless ? 'نوبت تمام شد' : 'همهٔ بسته‌ها رفتند!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ نوبت‌ها را کار کردی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'نوبتِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#96762f', btnHotFill: '#b18f3d',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#7f6c48',
    icon: (x, y) => { ctx.fillStyle = '#b7a58a';
      for (let i = 0; i < 3; i++) { wobbleRect(x - 26 + i * 6, y - 18 + i * 14, 52, 14, 4, i, 1); ctx.fill(); } },
    title: 'ایستگاه قفل کرد',
    body: 'امتیاز: ' + fa(S.score) + '\nذرّه‌بین را زودتر بزن؛ با عددهای کوچک زودتر معلوم می‌شود.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#96762f', btnHotFill: '#b18f3d',
  });
}

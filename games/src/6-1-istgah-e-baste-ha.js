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
  wallHi: '#4a5a63', wall: '#33414a', wallLo: '#1d272d',
  pipe:  '#5d6d77', pipeLt: '#8ea0aa', pipeDk: '#38454d',
  table: '#7d5a35', tableDk: '#553a1f', tableLt: '#a37845',
  belt:  '#2c353b', beltDk: '#1a2126', frame: '#8d9aa4', frameDk: '#5c6872', rail: '#6f7d88',
  crate: '#cfa267', crateDk: '#9a7440', crateLt: '#e8c692', tape: '#b3803f',
  paper: '#f6ecd6', ink: '#33291a', inkSoft: '#7d6c4e',
  brass: '#d3a94f', brassDk: '#9a7a2c', brassLt: '#f3dc9a',
  lamp:  '#ffd992', lampCone: 'rgba(255, 214, 140, .1)',
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
  /* اوّلین بسته را همین حالا می‌گذاریم؛ وگرنه در آموزش نوار خالی می‌ماند
     و پردهٔ «روی سُرسره بزن» هیچ‌وقت رد نمی‌شود. */
  S.queue.push(makeParcel());
  S.queue[0].x = 0;
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
    if (!S.queue.length) { S.queue.push(makeParcel()); S.spawnT = L().gap; }
    else if (!frozen) {
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
  endScene(.1, 'rgba(6, 10, 14, .5)', .4, .16);
}

/** هرچه در اتاق تکان نمی‌خورد، یک‌بار کشیده و بعد فقط کپی می‌شود. */
function paintRoomStatic() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, 470);
  g.addColorStop(0, P.wallLo);
  g.addColorStop(.5, P.wall);
  g.addColorStop(1, P.wallHi);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, 470);
  ctx.save();
  ctx.globalAlpha = .5;
  ctx.fillStyle = texStone(P.wall, '#0e1418');
  ctx.fillRect(0, HUD_H, SCENE_W, 470 - HUD_H);
  ctx.restore();
  /* ورقهٔ کرکره‌ای */
  ctx.save();
  ctx.globalAlpha = .3;
  const lg = ctx.createLinearGradient(0, 0, 34, 0);
  lg.addColorStop(0, 'rgba(0,0,0,.42)');
  lg.addColorStop(.5, 'rgba(255,255,255,.13)');
  lg.addColorStop(1, 'rgba(0,0,0,.42)');
  for (let x = 0; x < SCENE_W; x += 34) {
    ctx.save();
    ctx.translate(x, 0);
    ctx.fillStyle = lg;
    ctx.fillRect(0, HUD_H, 34, 470 - HUD_H);
    ctx.restore();
  }
  ctx.restore();
  /* لوله‌های سقف */
  for (const py of [86, 104]) {
    ctx.fillStyle = P.pipeDk; ctx.fillRect(0, py, SCENE_W, 13);
    ctx.fillStyle = P.pipe; ctx.fillRect(0, py, SCENE_W, 9);
    ctx.fillStyle = P.pipeLt; ctx.fillRect(0, py + 1, SCENE_W, 2);
    for (let x = 40; x < SCENE_W; x += 190) {
      ctx.fillStyle = P.frameDk; ctx.fillRect(x, py - 3, 14, 19);
      ctx.fillStyle = P.frame; ctx.fillRect(x + 2, py - 3, 10, 17);
    }
  }
  /* میزِ چوبی */
  ctx.fillStyle = P.tableDk;
  ctx.fillRect(0, 462, SCENE_W, SCENE_H - 462);
  ctx.fillStyle = texWood(P.table, P.tableDk);
  ctx.fillRect(0, 470, SCENE_W, SCENE_H - 470);
  const tg = ctx.createLinearGradient(0, 470, 0, SCENE_H);
  tg.addColorStop(0, 'rgba(255, 220, 160, .22)');
  tg.addColorStop(.4, 'rgba(0,0,0,0)');
  tg.addColorStop(1, 'rgba(0,0,0,.34)');
  ctx.fillStyle = tg;
  ctx.fillRect(0, 470, SCENE_W, SCENE_H - 470);
  ctx.fillStyle = P.tableLt;
  ctx.fillRect(0, 470, SCENE_W, 3);
  /* بدنهٔ چراغ‌ها و مخروطِ نور */
  for (const lx of [330, 870]) {
    ctx.strokeStyle = P.pipeDk; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, 110); ctx.lineTo(lx, 150); ctx.stroke();
    ctx.fillStyle = P.frameDk;
    ctx.beginPath();
    ctx.moveTo(lx - 34, 182); ctx.lineTo(lx - 12, 150); ctx.lineTo(lx + 12, 150); ctx.lineTo(lx + 34, 182);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.frame;
    ctx.beginPath();
    ctx.moveTo(lx - 30, 178); ctx.lineTo(lx - 10, 152); ctx.lineTo(lx + 10, 152); ctx.lineTo(lx + 30, 178);
    ctx.closePath(); ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cg = ctx.createLinearGradient(0, 184, 0, SCENE_H);
    cg.addColorStop(0, 'rgba(150, 118, 62, .5)');
    cg.addColorStop(.55, 'rgba(96, 74, 38, .22)');
    cg.addColorStop(1, 'rgba(60, 46, 22, 0)');
    ctx.fillStyle = cg;
    for (const k of [1, .72, .44]) {
      ctx.globalAlpha = k * .42;
      ctx.beginPath();
      ctx.moveTo(lx - 26 * k, 184); ctx.lineTo(lx + 26 * k, 184);
      ctx.lineTo(lx + (360 - 90 * (1 - k)), SCENE_H); ctx.lineTo(lx - (360 - 90 * (1 - k)), SCENE_H);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
}

function drawRoom() {
  ctx.drawImage(staticLayer('room', SCENE_W, SCENE_H, paintRoomStatic), 0, 0, SCENE_W, SCENE_H);
  /* حبابِ چراغ‌ها که سوسو می‌زند */
  for (const lx of [330, 870]) {
    const fl = .94 + Math.sin(S.t * 7 + lx) * .06;
    ctx.fillStyle = P.lamp;
    ctx.beginPath(); ctx.ellipse(lx, 181, 26 * fl, 8, 0, 0, TAU); ctx.fill();
  }
  /* گردوغبارِ توی نور */
  ctx.fillStyle = 'rgba(255, 232, 190, .5)';
  for (let i = 0; i < 40; i++) {
    const x = (noise1(i * 3.1) * SCENE_W + S.t * (6 + noise1(i) * 10)) % SCENE_W;
    const y = 190 + ((noise1(i * 7.7 + 2) * 560) + S.t * (4 + noise1(i * 2) * 8)) % 560;
    ctx.globalAlpha = .1 + .3 * Math.abs(Math.sin(S.t * .7 + i));
    ctx.beginPath(); ctx.arc(x, y, .8 + noise1(i * 1.9) * 1.4, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBelt() {
  const b = BELT;
  /* قابِ فولادیِ نوار */
  ctx.fillStyle = P.frameDk;
  ctx.fillRect(b.x, b.y - 10, b.w, b.h + 22);
  ctx.fillStyle = P.frame;
  ctx.fillRect(b.x, b.y - 10, b.w, 8);
  ctx.fillRect(b.x, b.y + b.h + 4, b.w, 8);
  ctx.fillStyle = shade(P.frame, .25);
  ctx.fillRect(b.x, b.y - 10, b.w, 2);
  /* پیچ‌ها */
  for (let x = 22; x < b.w; x += 68) {
    for (const yy of [b.y - 6, b.y + b.h + 8]) {
      ctx.fillStyle = P.frameDk;
      ctx.beginPath(); ctx.arc(x, yy, 3.4, 0, TAU); ctx.fill();
      ctx.fillStyle = shade(P.frame, .3);
      ctx.beginPath(); ctx.arc(x - .8, yy - .8, 2, 0, TAU); ctx.fill();
    }
  }
  /* لاستیکِ نوار */
  const bg = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
  bg.addColorStop(0, P.beltDk);
  bg.addColorStop(.4, P.belt);
  bg.addColorStop(1, P.beltDk);
  ctx.fillStyle = bg;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  /* هفت‌هشتِ متحرک */
  ctx.save();
  ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
  const off = (S.t * 78) % 52;
  ctx.strokeStyle = 'rgba(180, 200, 214, .16)'; ctx.lineWidth = 7;
  for (let x = -60; x < b.w + 60; x += 52) {
    ctx.beginPath();
    ctx.moveTo(b.x + x - off, b.y + 4);
    ctx.lineTo(b.x + x - off + 22, b.y + b.h / 2);
    ctx.lineTo(b.x + x - off, b.y + b.h - 4);
    ctx.stroke();
  }
  /* برقِ نور روی نوار */
  const sg = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
  sg.addColorStop(0, 'rgba(255, 232, 190, .1)');
  sg.addColorStop(.35, 'rgba(255, 232, 190, 0)');
  ctx.fillStyle = sg;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.restore();

  for (let i = S.queue.length - 1; i >= 1; i--) {
    const q = S.queue[i];
    drawCrate(q.x, b.y + b.h / 2, 132, 86, i, true);
  }
  /* چراغ‌های صف */
  const cap = L().cap;
  for (let i = 0; i < cap; i++) {
    const x = 26 + i * 24, on = i < S.queue.length - 1;
    const col = on ? (i >= cap - 2 ? P.bad : P.brass) : 'rgba(140,160,175,.2)';
    if (on) {
      const gg = ctx.createRadialGradient(x + 8, b.y + b.h + 22, 1, x + 8, b.y + b.h + 22, 16);
      gg.addColorStop(0, col); gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = .5; ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(x + 8, b.y + b.h + 22, 16, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = col;
    ctx.beginPath(); rrPath(x, b.y + b.h + 16, 17, 11, 4); ctx.fill();
  }
  if (S.jam > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.jam, 0, 1) * .5;
    ctx.fillStyle = P.bad;
    ctx.fillRect(b.x, b.y - 10, b.w, b.h + 22);
    ctx.restore();
  }
}

/** جعبهٔ مقوّایی: بافت، چسب، برچسب و ریسمان. */
function drawCrate(cx, cy, w, h, seed, onBelt) {
  ctx.save();
  ctx.translate(cx, cy);
  if (onBelt) contact(0, h / 2 + 4, w * .48, 9, .5);
  withShadow(14, 6, .4, () => {
    ctx.fillStyle = P.crateDk;
    wobbleRect(-w / 2, -h / 2, w, h, 7, seed, 1.4); ctx.fill();
  }, '10, 6, 2');
  ctx.save();
  ctx.beginPath(); wobbleRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 6, seed + 3, 1.2); ctx.clip();
  ctx.fillStyle = texPaper(P.crate);
  ctx.fillRect(-w / 2, -h / 2, w, h);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, 'rgba(255,255,255,.28)');
  g.addColorStop(.45, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(60,30,0,.3)');
  ctx.fillStyle = g;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  /* درزِ وسط و نوارِ چسب */
  ctx.fillStyle = 'rgba(90, 55, 20, .35)';
  ctx.fillRect(-w / 2, -3, w, 3);
  ctx.fillStyle = P.tape;
  ctx.globalAlpha = .8;
  ctx.fillRect(-w / 2, -9, w, 15);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ctx.fillRect(-w / 2, -9, w, 3);
  ctx.restore();
  /* برچسبِ کاغذی */
  ctx.fillStyle = 'rgba(20,12,4,.2)';
  wobbleRect(-w / 2 + 15, -h / 2 + 11, w - 30, 24, 3, seed + 7, 1); ctx.fill();
  ctx.fillStyle = P.paper;
  wobbleRect(-w / 2 + 16, -h / 2 + 10, w - 32, 23, 3, seed + 7, 1); ctx.fill();
  ctx.strokeStyle = 'rgba(120, 100, 70, .55)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 22, -h / 2 + 16 + i * 5); ctx.lineTo(w / 2 - 22, -h / 2 + 16 + i * 5); ctx.stroke();
  }
  /* مُهرِ گِرد */
  ctx.strokeStyle = 'rgba(180, 70, 50, .5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(w / 2 - 22, h / 2 - 20, 11, 0, TAU); ctx.stroke();
  ctx.restore();
}

/** بستهٔ جلوی صف روی گیرهٔ چوبی. */
function drawCard() {
  const q = front();
  const b = CARD;
  const tilt = -.012;
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.rotate(tilt);
  ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));
  contact(b.x + b.w / 2, b.y + b.h + 16, b.w * .48, 16, .42);
  /* تختهٔ چوبیِ گیره */
  withShadow(26, 12, .45, () => {
    ctx.fillStyle = P.tableDk;
    wobbleRect(b.x - 16, b.y - 26, b.w + 32, b.h + 52, 10, 11, 1.6); ctx.fill();
  }, '10, 6, 2');
  ctx.save();
  ctx.beginPath(); wobbleRect(b.x - 16, b.y - 26, b.w + 32, b.h + 52, 10, 11, 1.6); ctx.clip();
  ctx.fillStyle = texWood('#8a6134', '#5a3c1c');
  ctx.fillRect(b.x - 16, b.y - 26, b.w + 32, b.h + 52);
  ctx.restore();
  /* کاغذ */
  ctx.fillStyle = 'rgba(20,12,4,.28)';
  wobbleRect(b.x + 2, b.y + 4, b.w, b.h, 6, 13, 1.4); ctx.fill();
  paper(b.x, b.y, b.w, b.h, P.paper, 13, 6, .3);
  if (S.wrong > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.wrong, 0, 1) * .4;
    ctx.fillStyle = P.bad;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 6); ctx.fill();
    ctx.restore();
  }
  /* گیرهٔ فلزی */
  const cx0 = b.x + b.w / 2;
  ctx.fillStyle = P.frameDk;
  ctx.beginPath(); rrPath(cx0 - 62, b.y - 22, 124, 30, 7); ctx.fill();
  const cg = ctx.createLinearGradient(0, b.y - 22, 0, b.y + 8);
  cg.addColorStop(0, shade(P.frame, .5));
  cg.addColorStop(.5, P.frame);
  cg.addColorStop(1, P.frameDk);
  ctx.fillStyle = cg;
  ctx.beginPath(); rrPath(cx0 - 58, b.y - 20, 116, 24, 6); ctx.fill();
  ctx.fillStyle = 'rgba(30,40,46,.55)';
  ctx.beginPath(); ctx.arc(cx0, b.y - 8, 5, 0, TAU); ctx.fill();

  if (!q) {
    text('نوار خالی است…', cx0, b.y + b.h / 2, { size: 22, color: P.inkSoft });
    ctx.restore();
    return;
  }
  ctx.save();
  if (S.lensT > 0) {
    const k = 1 + Math.sin(clamp(S.lensT / .5, 0, 1) * Math.PI) * .045;
    ctx.translate(cx0, b.y + b.h / 2); ctx.scale(k, k); ctx.translate(-cx0, -(b.y + b.h / 2));
  }
  textWrap(storyText(q, S.small), cx0, b.y + 56, b.w - 64,
    { size: S.small ? 26 : 23, color: P.ink, lineHeight: S.small ? 42 : 38 });
  if (S.small) {
    text('عددها کوچک شدند؛ شکلِ مسئله همان است.', cx0, b.y + b.h - 26,
      { size: 15, color: '#9a7a2c' });
  }
  ctx.restore();
  ctx.restore();
}

/** ذرّه‌بینِ ساده‌ساز، روی پایهٔ برنجی. */
function drawLens() {
  const b = LENS, hot = S.hover === 'lens';
  const dy = hot ? 3 : 0;
  contact(b.x + b.w / 2, b.y + b.h + 10, b.w * .42, 12, .4);
  ctx.fillStyle = shade(S.small ? P.brassDk : '#6b5b3e', -.4);
  wobbleRect(b.x, b.y + dy + 6, b.w, b.h, 14, 21, 1.8); ctx.fill();
  withShadow(hot ? 20 : 12, hot ? 5 : 6, .4, () => {
    ctx.fillStyle = S.small ? P.brass : '#8a7550';
    wobbleRect(b.x, b.y + dy, b.w, b.h, 14, 21, 1.8); ctx.fill();
  }, '10, 6, 2');
  ctx.save();
  ctx.beginPath(); wobbleRect(b.x, b.y + dy, b.w, b.h, 14, 21, 1.8); ctx.clip();
  const g = ctx.createLinearGradient(0, b.y + dy, 0, b.y + dy + b.h);
  g.addColorStop(0, 'rgba(255,255,255,.34)');
  g.addColorStop(.5, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(0,0,0,.3)');
  ctx.fillStyle = g;
  ctx.fillRect(b.x, b.y + dy, b.w, b.h);
  ctx.restore();
  const cx = b.x + b.w / 2, cy = b.y + 54 + dy;
  if (S.small) {
    const gg = ctx.createRadialGradient(cx, cy, 2, cx, cy, 58);
    gg.addColorStop(0, 'rgba(255, 235, 170, .5)');
    gg.addColorStop(1, 'rgba(255, 235, 170, 0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(cx, cy, 58, 0, TAU); ctx.fill();
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-.5 + Math.sin(S.t * 1.6) * .04);
  ctx.strokeStyle = shade(P.brassDk, -.3); ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, 46); ctx.stroke();
  ctx.strokeStyle = P.brass; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, 44); ctx.stroke();
  ctx.strokeStyle = shade(P.brassDk, -.2); ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke();
  ctx.strokeStyle = P.brassLt; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 22, -2.4, -.4); ctx.stroke();
  ctx.fillStyle = 'rgba(190, 226, 244, .5)';
  ctx.beginPath(); ctx.arc(0, 0, 19, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  ctx.beginPath(); ctx.ellipse(-7, -7, 8, 4.4, -.7, 0, TAU); ctx.fill();
  ctx.restore();
  text('ذرّه‌بین', cx, b.y + 106 + dy, { size: 20, family: 'Lalezar', color: '#241a08' });
  text(S.small ? 'عددهای اصلی' : 'عددها را کوچک کن', cx, b.y + 130 + dy,
    { size: 13, color: 'rgba(36, 26, 8, .7)' });
}

/** چهار قیفِ فلزیِ رنگ‌شده. */
function drawChutes() {
  for (let i = 0; i < 4; i++) {
    const b = chuteBox(i), o = OPS[i], hot = S.hover === i;
    const pulse = S.chuteT[i] > 0 ? clamp(S.chuteT[i] * 2, 0, 1) : 0;
    const dy = hot ? 3 : 0;
    const x = b.x, y = b.y + dy, w = b.w, h = b.h;
    contact(x + w / 2, y + h + 8, w * .46, 14, .45);
    /* بدنهٔ قیف: بالا پهن‌تر */
    const body = () => {
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 10);
      ctx.lineTo(x + w - 4, y + 10);
      ctx.lineTo(x + w - 20, y + h);
      ctx.lineTo(x + 20, y + h);
      ctx.closePath();
    };
    ctx.fillStyle = shade(o.d, -.4);
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 16); ctx.lineTo(x + w - 4, y + 16);
    ctx.lineTo(x + w - 20, y + h + 8); ctx.lineTo(x + 20, y + h + 8);
    ctx.closePath(); ctx.fill();
    withShadow(hot ? 22 : 14, hot ? 5 : 8, .42, () => {
      ctx.fillStyle = o.c; body(); ctx.fill();
    }, '10, 6, 2');
    /* حجمِ فلز */
    ctx.save();
    body(); ctx.clip();
    const mg = ctx.createLinearGradient(x, 0, x + w, 0);
    mg.addColorStop(0, 'rgba(0,0,0,.32)');
    mg.addColorStop(.22, 'rgba(255,255,255,.3)');
    mg.addColorStop(.55, 'rgba(255,255,255,.04)');
    mg.addColorStop(1, 'rgba(0,0,0,.34)');
    ctx.fillStyle = mg;
    ctx.fillRect(x, y, w, h);
    const vg2 = ctx.createLinearGradient(0, y, 0, y + h);
    vg2.addColorStop(0, 'rgba(255,255,255,.2)');
    vg2.addColorStop(.6, 'rgba(0,0,0,0)');
    vg2.addColorStop(1, 'rgba(0,0,0,.3)');
    ctx.fillStyle = vg2;
    ctx.fillRect(x, y, w, h);
    if (pulse) {
      ctx.globalAlpha = pulse * .55;
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    /* لبهٔ فلزیِ دهانه */
    ctx.fillStyle = shade(o.d, -.3);
    ctx.beginPath(); rrPath(x, y, w, 22, 8); ctx.fill();
    const lg2 = ctx.createLinearGradient(0, y, 0, y + 22);
    lg2.addColorStop(0, 'rgba(255,255,255,.4)');
    lg2.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = lg2;
    ctx.beginPath(); rrPath(x, y, w, 22, 8); ctx.fill();
    /* دهانهٔ تاریک */
    ctx.fillStyle = '#0d1114';
    ctx.beginPath(); rrPath(x + 26, y + 6, w - 52, 26, 11); ctx.fill();
    const dg = ctx.createLinearGradient(0, y + 6, 0, y + 32);
    dg.addColorStop(0, 'rgba(0,0,0,.85)');
    dg.addColorStop(1, 'rgba(90,90,90,.25)');
    ctx.fillStyle = dg;
    ctx.beginPath(); rrPath(x + 26, y + 6, w - 52, 26, 11); ctx.fill();
    /* پیچ‌ها */
    for (const px2 of [x + 16, x + w - 16]) {
      ctx.fillStyle = shade(o.d, -.45);
      ctx.beginPath(); ctx.arc(px2, y + 42, 5, 0, TAU); ctx.fill();
      ctx.fillStyle = shade(o.c, .35);
      ctx.beginPath(); ctx.arc(px2 - 1, y + 41, 3, 0, TAU); ctx.fill();
    }
    /* پلاکِ لعابیِ نشانه */
    const px = x + w / 2, py2 = y + 116;
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath(); rrPath(px - 62, py2 - 54, 124, 108, 14); ctx.fill();
    ctx.fillStyle = shade(o.d, -.12);
    ctx.beginPath(); rrPath(px - 58, py2 - 52, 116, 104, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(px - 52, py2 - 46, 104, 92, 9); ctx.stroke();
    numText(o.s, px, py2 - 12, { size: 66, color: '#fff', stroke: 'rgba(0,0,0,.3)', strokeWidth: 6 });
    text(o.n, px, py2 + 32, { size: 27, family: 'Lalezar', color: 'rgba(255,255,255,.96)' });
    /* چراغِ نشانگر */
    const on = pulse > .05;
    if (on) {
      const gg = ctx.createRadialGradient(px, y + h - 14, 2, px, y + h - 14, 34);
      gg.addColorStop(0, 'rgba(255, 240, 190, .85)');
      gg.addColorStop(1, 'rgba(255, 240, 190, 0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(px, y + h - 14, 34, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = on ? '#fff3cf' : 'rgba(0,0,0,.4)';
    ctx.beginPath(); ctx.arc(px, y + h - 14, 7, 0, TAU); ctx.fill();
  }
}

function drawFly() {
  if (!S.fly) return;
  const k = clamp(S.fly.t / .55, 0, 1);
  const box = chuteBox(S.fly.to);
  const x = lerp(CARD.x + CARD.w / 2, box.x + box.w / 2, k);
  const y = lerp(CARD.y + CARD.h / 2, box.y + 26, easeIn(k));
  const s = lerp(1, .3, k);
  ctx.save();
  ctx.globalAlpha = 1 - k * .35;
  ctx.translate(x, y);
  ctx.rotate(k * .7);
  ctx.scale(s, s);
  drawCrate(0, 0, 220, 132, 5, false);
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

/*!
title: ریسهٔ جشن — تساوی کسرها
bg: #221626
*/

/* ═══════════════════════════════════════════════════════════════════════
   ریسهٔ جشن — ریاضی سوم، فصل ۳، درس ۴ (تساوی کسرها)
   ───────────────────────────────────────────────────────────────────────
   فعّالیتِ خودِ کتاب این است: یک مربّع را تا می‌زنی و یک قسمتش را رنگ
   می‌کنی؛ دوباره تا می‌زنی و می‌بینی همان رنگ حالا اسمِ تازه‌ای دارد.
   ۱/۴ می‌شود ۲/۸ می‌شود ۴/۱۶، بی‌آنکه ذرّه‌ای رنگ اضافه شده باشد.

   قانونِ فیزیکیِ بازی همین است:

     تا زدن مجّانی است، رنگ زدن نیست.

   قلم‌مو شمرده است. سفارشِ «۶ از ۸» را اگر بخواهی خانه‌به‌خانه رنگ کنی،
   شش بار قلم می‌خواهد و قلم‌هایت کم می‌آید. ولی اگر کاغذ را چهار قسمت
   کنی و سه‌تا را رنگ بزنی و بعد یک بار تا بزنی، با سه قلم همان می‌شود.
   بچه مجبور است کشف کند که ۳/۴ و ۶/۸ یک چیزند — چون راهِ دیگری ندارد.

   تای دوتایی و تای سه‌تایی هر دو هست، پس مخرج‌های ۲ و ۳ و ۴ و ۶ و ۸ و ۹
   و ۱۲ و ۱۶ و ۱۸ همه در دسترس‌اند. «باز کن» هم هست، ولی فقط وقتی رنگ‌ها
   دقیقاً سرِ جای تاها باشند — چون کاغذِ نصفه‌رنگ باز نمی‌شود.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const MAXD = 24;                       // ریزتر از این، کاغذ پاره می‌شود

const P = {
  wallHi:   '#3b2740',
  wallLo:   '#1b1220',
  glow:     'rgba(255, 196, 120, .18)',
  table:    '#7c5136',
  tableLit: '#9b6742',
  tableDk:  '#553520',
  paper:    '#fbf3e0',
  paperDk:  '#e3d6bc',
  paperEdge:'#cbbb9a',
  fold:     '#c9b795',
  ink:      '#2e2434',
  inkSoft:  '#7d7089',
  dye:      '#d8455f',
  dyeDk:    '#a92c45',
  dyeLit:   '#ea6a80',
  pot:      '#3f7fa0',
  potDk:    '#2b5c78',
  brass:    '#d9a840',
  brassDk:  '#a2761f',
  string:   '#8a7358',
  flag:     ['#e05b6a', '#e8a33e', '#5aa36e', '#4f8fc0', '#a86bbe'],
  good:     '#6fa85c',
  bad:      '#cf5f4a',
  gold:     '#f0c552',
  lamp:     '#ffd98a',
};

/* ───────── سفارش‌ها ─────────
   هر سفارش با قلم‌موی کم عمداً «بدونِ تا زدن» نشدنی است.            */

const LEVELS = [
  { n: 2, d: 4, brush: 2,
    hint: 'اوّل کاغذ را تا بزن تا به قسمت‌های مساوی تقسیم شود، بعد رنگ بزن.' },
  { n: 6, d: 8, brush: 4,
    hint: 'شش خانه با چهار قلم‌مو؟ راهِ کوتاه‌تری هست.' },
  { n: 4, d: 16, brush: 2,
    hint: 'دو قلم‌مو بیشتر نداری.' },
  { n: 9, d: 12, brush: 4,
    hint: 'تای سه‌تایی هم داری؛ یادت نرود.' },
  { n: 8, d: 18, brush: 5,
    hint: 'هجده قسمت! ولی لازم نیست از اوّل هجده‌تا کنی.' },
  { endless: true, brush: 0,
    hint: 'سفارش‌ها پشتِ سرِ هم می‌آیند. هر چه ریسه بلندتر، امتیاز بیشتر.' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  d: 1,
  paint: [false],
  used: 0,               // قلم‌موهای خرج‌شده
  brush: 0,              // سقفِ قلم‌مو
  target: { n: 1, d: 1 },
  hearts: 3,
  score: 0, best: 0,
  done: [],              // پرچم‌های آویزان‌شده
  anim: null,            // انیمیشنِ تا/باز
  winT: 0,
  t: 0, phaseT: 0,
  hover: null,
  shake: 0,
  motes: [],
  floats: [],
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const painted = () => S.paint.reduce((a, b) => a + (b ? 1 : 0), 0);
const brushLeft = () => S.brush - S.used;

function loadBest() { try { return +localStorage.getItem('rise-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('rise-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── چیدمان ───────── */

const HUD_H = 52;
const LINE_Y = 128;                                  // ریسهٔ پرچم‌ها
const CARD = { x: 34, y: 214, w: 244, h: 210 };      // سفارش
const STRIP = { x: 316, y: 306, w: 836, h: 156 };    // کاغذ
const BTN_F2 = { x: 316, y: 566, w: 196, h: 68 };
const BTN_F3 = { x: 528, y: 566, w: 196, h: 68 };
const BTN_UN = { x: 740, y: 566, w: 196, h: 68 };
const BTN_RESET = { x: 956, y: 572, w: 196, h: 56 };
const POT = { x: 34, y: 470, w: 244, h: 172 };       // قلم‌موها
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

function cellBox(i) {
  const w = STRIP.w / S.d;
  return { x: STRIP.x + i * w, y: STRIP.y, w, h: STRIP.h };
}

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 22; i++) {
  S.motes.push({ x: Math.random() * SCENE_W, y: Math.random() * SCENE_H,
                 ph: Math.random() * TAU, sp: .2 + Math.random() * .5, r: .9 + Math.random() * 1.8 });
}
whenFontsReady(() => runLoop(step));

/** سفارشِ تصادفیِ حالتِ آزاد: یک کسرِ ساده، ضرب‌شده در ۲ یا ۳ یا ۴. */
function randomTarget() {
  const bases = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6]];
  for (let tries = 0; tries < 40; tries++) {
    const [a, b] = bases[Math.floor(Math.random() * bases.length)];
    const m = [2, 3, 4][Math.floor(Math.random() * 3)];
    if (b * m <= MAXD) return { n: a * m, d: b * m, brush: a + 1 };
  }
  return { n: 2, d: 4, brush: 2 };
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  const t = lv.endless ? randomTarget() : { n: lv.n, d: lv.d, brush: lv.brush };
  S.target = { n: t.n, d: t.d };
  S.brush = t.brush;
  resetPaper();
  if (!keep) { S.hearts = 3; S.done = []; }
  S.phase = 'play'; S.phaseT = 0; S.winT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  toast.say(lv.hint, 'info');
}

function resetPaper() {
  S.d = 1;
  S.paint = [false];
  S.used = 0;
  S.anim = null;
}

function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 24 }); }

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.anim) { S.anim.t += dt * 2.6; if (S.anim.t >= 1) S.anim = null; }
  if (S.winT > 0) {
    S.winT -= dt;
    if (S.winT <= 0) finishOrder();
  }
  for (const m of S.motes) {
    m.ph += dt * m.sp; m.y -= dt * (6 + m.sp * 12); m.x += Math.sin(m.ph) * dt * 10;
    if (m.y < -10) { m.y = SCENE_H + 10; m.x = Math.random() * SCENE_W; }
  }
  for (const f of S.floats) { f.t += dt; f.y -= 42 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.5);
  if (S.phase === 'play' && S.tut.on) tutStep(dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── تا زدن و رنگ زدن ─────────
   تا مجّانی است و رنگ نیست؛ همین یک نابرابری، کلِ درس را می‌سازد.     */

function fold(k) {
  if (S.phase !== 'play' || S.winT > 0) return;
  if (S.d * k > MAXD) {
    S.shake = .2; sfx.nope();
    toast.say('ریزتر از این، کاغذ پاره می‌شود', 'bad');
    return;
  }
  const next = [];
  for (const on of S.paint) for (let j = 0; j < k; j++) next.push(on);
  S.paint = next;
  S.d *= k;
  S.anim = { t: 0, k, dir: 1 };
  sfx.slide();
  checkWin();
}

/** باز کردن فقط وقتی می‌شود که رنگ‌ها سرِ جای تاها باشند. */
function canUnfold(k) {
  if (S.d % k !== 0) return false;
  for (let i = 0; i < S.d; i += k) {
    for (let j = 1; j < k; j++) if (S.paint[i + j] !== S.paint[i]) return false;
  }
  return true;
}

function unfold() {
  if (S.phase !== 'play' || S.winT > 0) return;
  const k = [2, 3].find((q) => canUnfold(q));
  if (!k) {
    S.shake = .2; sfx.nope();
    toast.say('رنگ‌ها سرِ جای تا نیستند؛ باز نمی‌شود', 'bad');
    return;
  }
  const next = [];
  for (let i = 0; i < S.d; i += k) next.push(S.paint[i]);
  S.paint = next;
  S.d /= k;
  S.anim = { t: 0, k, dir: -1 };
  sfx.slide();
  checkWin();
}

function toggle(i) {
  if (S.phase !== 'play' || S.winT > 0) return;
  if (i < 0 || i >= S.d) return;
  if (S.paint[i]) {                    // پاک کردن مجّانی است، ولی قلمِ خرج‌شده برنمی‌گردد
    S.paint[i] = false;
    sfx.tap();
    return;
  }
  if (brushLeft() <= 0) {
    S.shake = .24; sfx.nope();
    toast.say('قلم‌مو تمام شد. با «از نو» دوباره شروع کن', 'bad');
    return;
  }
  S.paint[i] = true;
  S.used++;
  const c = cellBox(i);
  bits.add(c.x + c.w / 2, c.y + c.h / 2, 10, 'dot', [P.dyeLit, P.dye, '#fff'],
    { speed: 130, lift: 40, size: 3.4, life: .6 });
  sfx.place();
  checkWin();
}

function checkWin() {
  if (S.d === S.target.d && painted() === S.target.n) {
    S.winT = .55;
    sfx.good();
  }
}

function finishOrder() {
  const left = brushLeft();
  const pts = 300 + left * 120;
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  S.done.push({ n: S.target.n, d: S.target.d, col: P.flag[S.done.length % P.flag.length] });
  floatText(STRIP.x + STRIP.w / 2, STRIP.y - 30, `+${fa(pts)}`, P.gold);
  bits.confetti(STRIP.x + STRIP.w / 2, STRIP.y + 40, 60, [P.gold, P.dyeLit, ...P.flag]);
  sfx.win();
  S.phase = 'won'; S.phaseT = 0;
}

function giveUp() {
  if (S.phase !== 'play') return;
  S.hearts--;
  S.shake = .3;
  sfx.nope();
  if (S.hearts <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  resetPaper();
  toast.say('کاغذِ تازه — یک دل کم شد', 'bad');
}

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;      // پرده‌های خواندنی

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 30) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 1 && S.d > 1) { S.tut.step = 2; S.tut.t = 0; }
  if (S.tut.step === 2 && S.tut.t > 30) S.tut.on = false;
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (inRect(p, BTN_F2)) return BTN_F2;
  if (inRect(p, BTN_F3)) return BTN_F3;
  if (inRect(p, BTN_UN)) return BTN_UN;
  if (inRect(p, BTN_RESET)) return BTN_RESET;
  for (let i = 0; i < S.d; i++) if (inRect(p, cellBox(i))) return { cell: i };
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
  if (!h) return;
  if (h === BTN_F2) return fold(2);
  if (h === BTN_F3) return fold(3);
  if (h === BTN_UN) return unfold();
  if (h === BTN_RESET) return giveUp();
  if (h.cell !== undefined) return toggle(h.cell);
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

/** کسرِ دوطبقه، همان‌طور که در کتاب نوشته می‌شود. */
function frac(cx, cy, n, d, size, color) {
  numText(fa(n), cx, cy - size * .42, { size, color });
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2.4, size * .07);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - size * .42, cy);
  ctx.lineTo(cx + size * .42, cy);
  ctx.stroke();
  ctx.restore();
  numText(fa(d), cx, cy + size * .5, { size, color });
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(14, 8, 18, ${alpha})`;
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
  }, '20, 10, 26');
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#221626');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 13;
    ctx.translate(Math.sin(S.t * 58) * k, Math.cos(S.t * 45) * k * .5);
  }

  drawRoom();
  drawGarland();
  drawTable();
  drawStrip();
  drawNow();
  ctx.restore();

  drawCard();
  drawPot();
  drawButtons();
  bits.draw();
  drawFloats();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  }

  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.12, 'rgba(14, 6, 20, .48)');
}

function drawRoom() {
  const g = ctx.createLinearGradient(200, 80, 1000, 760);
  g.addColorStop(0, P.wallHi);
  g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* کاغذدیواریِ گل‌دار، خیلی کم‌رنگ */
  ctx.save();
  ctx.globalAlpha = .05;
  ctx.fillStyle = '#ffe6c8';
  for (let r = 0; r < 9; r++) for (let c = 0; c < 12; c++) {
    const x = c * 104 + (r % 2 ? 52 : 0), y = 40 + r * 92;
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * TAU;
      wobbleCircle(x + Math.cos(a) * 12, y + Math.sin(a) * 12, 7, r * 3 + k, .8);
      ctx.fill();
    }
  }
  ctx.restore();

  /* چراغ‌های ریسه‌ای — حالِ جشن */
  const gl = ctx.createRadialGradient(600, 150, 30, 600, 150, 620);
  gl.addColorStop(0, P.glow);
  gl.addColorStop(1, 'rgba(255, 196, 120, 0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  ctx.save();
  for (const m of S.motes) {
    ctx.globalAlpha = .06 + .1 * (.5 + .5 * Math.sin(m.ph * 2));
    ctx.fillStyle = '#ffe9c4';
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/** ریسه: هر جای خالی یک فانوس است و با هر سفارش، یک فانوس جایش را به
    پرچمِ تازه می‌دهد. پس بچه پیشرفتش را روی دیوار می‌بیند.            */
function drawGarland() {
  const SLOTS = 9, sag = 26;
  ctx.strokeStyle = P.string; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, LINE_Y - 16);
  ctx.quadraticCurveTo(SCENE_W / 2, LINE_Y + sag, SCENE_W + 10, LINE_Y - 16);
  ctx.stroke();

  const flags = S.done.slice(-SLOTS);
  for (let i = 0; i < SLOTS; i++) {
    const t = (i + .5) / SLOTS;
    const x = lerp(52, SCENE_W - 52, t);
    const y = LINE_Y - 16 + 2 * sag * t * (1 - t) * 2;
    const sw = Math.sin(S.t * 1.2 + i * 1.3) * .055;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sw);
    if (i < flags.length) {
      const f = flags[i];
      withShadow(10, 5, .3, () => {
        ctx.fillStyle = f.col;
        ctx.beginPath();
        ctx.moveTo(-27, 0); ctx.lineTo(27, 0); ctx.lineTo(0, 62);
        ctx.closePath(); ctx.fill();
      }, '20, 10, 26');
      ctx.fillStyle = 'rgba(255,255,255,.2)';
      ctx.beginPath();
      ctx.moveTo(-27, 0); ctx.lineTo(0, 0); ctx.lineTo(0, 62);
      ctx.closePath(); ctx.fill();
      frac(0, 24, f.n, f.d, 17, '#fff6e6');
    } else {
      const col = P.flag[(i + 2) % P.flag.length];
      ctx.strokeStyle = P.string; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 16); ctx.stroke();
      const gl2 = ctx.createRadialGradient(0, 42, 4, 0, 42, 58);
      gl2.addColorStop(0, 'rgba(255, 217, 138, .28)');
      gl2.addColorStop(1, 'rgba(255, 217, 138, 0)');
      ctx.fillStyle = gl2;
      ctx.fillRect(-58, -16, 116, 116);
      ctx.fillStyle = col;
      wobbleEllipse(0, 42, 21, 25, 0, i * 3 + 1, 1.5); ctx.fill();
      ctx.fillStyle = 'rgba(255, 240, 200, .32)';
      wobbleEllipse(-6, 36, 7, 11, 0, i * 3 + 2, 1); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.13)'; ctx.lineWidth = 1.5;
      for (const k of [0, 1]) {
        ctx.beginPath();
        ctx.ellipse(0, 42, 21 * (1 - k * .55), 25, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.fillStyle = col;
      wobbleRect(-8, 16, 16, 7, 3, i * 3 + 3, .7); ctx.fill();
    }
    ctx.restore();
  }
}

function drawTable() {
  ctx.fillStyle = P.tableDk;
  wobbleRect(0, 660, SCENE_W, 100, 0, 21, 1.6); ctx.fill();
  ctx.fillStyle = P.table;
  wobbleRect(0, 648, SCENE_W, 22, 0, 23, 1.4); ctx.fill();
  ctx.fillStyle = P.tableLit;
  wobbleRect(0, 646, SCENE_W, 7, 0, 25, .8); ctx.fill();
  ctx.save();
  ctx.globalAlpha = .18;
  ctx.strokeStyle = P.tableDk; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const y = 676 + i * 11;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= SCENE_W; x += 40) ctx.lineTo(x, y + Math.sin(x * .02 + i) * 2);
    ctx.stroke();
  }
  ctx.restore();

  /* قیچی و تکّه‌کاغذها روی میز */
  ctx.save();
  ctx.translate(1052, 700);
  ctx.rotate(-.2);
  ctx.strokeStyle = '#8f98a2'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-40, -8); ctx.lineTo(28, 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-40, 8); ctx.lineTo(28, -8); ctx.stroke();
  ctx.strokeStyle = '#c0563f'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(38, 14, 11, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(38, -14, 11, 0, TAU); ctx.stroke();
  ctx.restore();
  for (const sc of [{ x: 120, y: 706, r: -.4 }, { x: 176, y: 722, r: .3 }, { x: 250, y: 700, r: .1 }]) {
    ctx.save();
    ctx.translate(sc.x, sc.y);
    ctx.rotate(sc.r);
    ctx.fillStyle = P.flag[(sc.x | 0) % P.flag.length];
    wobbleRect(-18, -8, 36, 16, 2, sc.x, 1.2); ctx.fill();
    ctx.restore();
  }
}

/* ───────── کاغذ ───────── */

function drawStrip() {
  const sc = S.anim ? lerp(1 / S.anim.k, 1, easeOut(S.anim.t)) : 1;
  const cx = STRIP.x + STRIP.w / 2;
  const win = S.winT > 0 ? 1 : 0;

  ctx.save();
  ctx.translate(cx, 0);
  ctx.scale(sc, 1);
  ctx.translate(-cx, 0);

  /* سایه روی میز */
  ctx.save();
  ctx.globalAlpha = .34;
  ctx.fillStyle = '#100a14';
  wobbleRect(STRIP.x + 8, STRIP.y + 12, STRIP.w, STRIP.h, 6, 31, 2); ctx.fill();
  ctx.restore();

  /* کاغذ */
  ctx.fillStyle = P.paper;
  wobbleRect(STRIP.x, STRIP.y, STRIP.w, STRIP.h, 6, 33, 2); ctx.fill();

  /* خانه‌های رنگ‌شده */
  const w = STRIP.w / S.d;
  for (let i = 0; i < S.d; i++) {
    if (!S.paint[i]) continue;
    const x = STRIP.x + i * w;
    ctx.fillStyle = P.dye;
    wobbleRect(x + 1.5, STRIP.y + 2, w - 3, STRIP.h - 4, 3, x + i, 1.6); ctx.fill();
    ctx.fillStyle = P.dyeLit;
    wobbleRect(x + 1.5, STRIP.y + 2, w - 3, 10, 2, x + i + 1, 1); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    wobbleRect(x + 1.5, STRIP.y + STRIP.h - 14, w - 3, 12, 2, x + i + 2, 1); ctx.fill();
  }

  /* خطِ تاها — دو خط با یک روشنیِ نازک، مثل کاغذِ تاخورده */
  for (let i = 1; i < S.d; i++) {
    const x = STRIP.x + i * w;
    ctx.strokeStyle = 'rgba(90, 70, 40, .32)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, STRIP.y + 3); ctx.lineTo(x, STRIP.y + STRIP.h - 3); ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 250, 230, .5)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x + 2, STRIP.y + 3); ctx.lineTo(x + 2, STRIP.y + STRIP.h - 3); ctx.stroke();
  }

  /* لبهٔ کاغذ */
  ctx.strokeStyle = P.paperEdge; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(STRIP.x, STRIP.y, STRIP.w, STRIP.h, 6); ctx.stroke();

  /* خانه‌ای که انگشت رویش است */
  if (S.hover && S.hover.cell !== undefined && S.hover.cell < S.d && S.phase === 'play') {
    const c = cellBox(S.hover.cell);
    ctx.save();
    ctx.globalAlpha = .3;
    ctx.fillStyle = S.paint[S.hover.cell] ? '#fff' : P.dyeLit;
    wobbleRect(c.x + 2, c.y + 2, c.w - 4, c.h - 4, 3, c.x, 1.4); ctx.fill();
    ctx.restore();
  }

  if (win) {
    ctx.save();
    ctx.globalAlpha = .5 + .3 * Math.sin(S.t * 12);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 6;
    ctx.beginPath(); rrPath(STRIP.x - 6, STRIP.y - 6, STRIP.w + 12, STRIP.h + 12, 10); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/** کسرِ فعلیِ کاغذ، درست زیرِ خودش. */
function drawNow() {
  const cx = STRIP.x + STRIP.w / 2;
  text('الان کاغذِ تو', cx + 78, STRIP.y + STRIP.h + 44, { size: 17, color: 'rgba(251, 243, 224, .68)' });
  frac(cx - 22, STRIP.y + STRIP.h + 46, painted(), S.d, 34, '#fbf3e0');
}

/* ───────── کارتِ سفارش و قلم‌موها ───────── */

function drawCard() {
  const b = CARD;
  withShadow(20, 9, .4, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 41, 2); ctx.fill();
  }, '20, 10, 26');
  ctx.fillStyle = P.dye;
  wobbleRect(b.x, b.y, b.w, 11, 5, 43, .8); ctx.fill();
  text('سفارش', b.x + b.w / 2, b.y + 38, { size: 23, family: 'Lalezar', color: P.inkSoft });
  frac(b.x + b.w / 2, b.y + 106, S.target.n, S.target.d, 56, P.ink);
  text(`${fa(S.target.n)} خانه از ${fa(S.target.d)} خانه رنگی`, b.x + b.w / 2, b.y + 172,
    { size: 15, color: P.inkSoft });
}

function drawPot() {
  const b = POT;
  withShadow(18, 8, .38, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 51, 2); ctx.fill();
  }, '20, 10, 26');
  ctx.fillStyle = P.pot;
  wobbleRect(b.x, b.y, b.w, 11, 5, 53, .8); ctx.fill();
  text('قلم‌موها', b.x + b.w / 2, b.y + 36, { size: 20, family: 'Lalezar', color: P.inkSoft });

  const n = S.brush, left = brushLeft();
  const jx = b.x + b.w / 2, jy = b.y + 152;
  /* لیوانِ قلم‌مو */
  ctx.fillStyle = P.potDk;
  wobbleRect(jx - 44, jy - 40, 88, 46, 8, 55, 1.2); ctx.fill();
  const step = Math.min(26, 150 / Math.max(1, n));
  for (let i = 0; i < n; i++) {
    const alive = i < left;
    const x = jx - (n - 1) * step / 2 + i * step;
    const tilt = (i - (n - 1) / 2) * .06;
    ctx.save();
    ctx.translate(x, jy - 30);
    ctx.rotate(tilt);
    ctx.globalAlpha = alive ? 1 : .22;
    ctx.strokeStyle = '#b08050'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, -52); ctx.stroke();
    ctx.fillStyle = alive ? P.dye : '#9a8f80';
    ctx.beginPath();
    ctx.moveTo(-5, -52); ctx.lineTo(5, -52); ctx.lineTo(0, -70);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = P.pot;
  wobbleRect(jx - 44, jy - 22, 88, 28, 6, 57, 1); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  wobbleRect(jx - 38, jy - 18, 18, 20, 4, 59, .8); ctx.fill();
  text(`${fa(left)} از ${fa(n)} مانده`, b.x + b.w / 2, b.y + 62,
    { size: 15, color: left > 0 ? P.inkSoft : P.bad });
}

function drawButtons() {
  const dis = S.phase !== 'play';
  button(BTN_F2, 'تای دوتایی', {
    hot: S.hover === BTN_F2, disabled: dis || S.d * 2 > MAXD,
    fill: '#3f7fa0', hotFill: '#4c92b5', size: 24,
  });
  button(BTN_F3, 'تای سه‌تایی', {
    hot: S.hover === BTN_F3, disabled: dis || S.d * 3 > MAXD,
    fill: '#3f7fa0', hotFill: '#4c92b5', size: 24,
  });
  button(BTN_UN, 'باز کن', {
    hot: S.hover === BTN_UN, disabled: dis || S.d === 1,
    fill: '#6a5b74', hotFill: '#7d6d88', size: 24,
  });
  button(BTN_RESET, 'کاغذِ تازه', {
    hot: S.hover === BTN_RESET, disabled: S.phase !== 'play',
    fill: '#8a4a52', hotFill: '#9d5a62', size: 18, r: 12, family: 'Vazirmatn',
  });
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.5, 0, 1);
    numText(f.txt, f.x, f.y, { size: f.size, color: f.col, alpha: k });
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(24, 14, 28, .78)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(217, 168, 64, .45)';
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);

  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 32 - i * 33;
    ctx.save();
    ctx.globalAlpha = i < S.hearts ? 1 : .22;
    ctx.fillStyle = i < S.hearts ? '#d4574a' : '#5b4f63';
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
  const nm = L().endless ? 'ریسهٔ آزاد' : `سفارشِ ${fa(S.level + 1)} از ${fa(LEVELS.length - 1)}`;
  text(nm, SCENE_W - 146, HUD_H / 2, { size: 18, family: 'Lalezar', color: '#f4e5f0', align: 'right' });
  numText(fa(S.score), 26, HUD_H / 2 - 1, { size: 26, color: P.gold, align: 'left' });
  text(`رکورد ${fa(S.best)}`, 108, HUD_H / 2, { size: 14, color: 'rgba(244, 229, 240, .58)', align: 'left' });
  if (S.done.length) {
    text(`${fa(S.done.length)} پرچم`, 216, HUD_H / 2, { size: 15, color: P.good, align: 'left' });
  }
}

/* ───────── آموزش ───────── */

function drawTutorial() {
  const st = S.tut.step;
  let holes = [], msg = '', hand = null;

  if (st === 0) {
    holes = [{ x: CARD.x - 6, y: CARD.y - 6, w: CARD.w + 12, h: CARD.h + 12 },
             { x: POT.x - 6, y: POT.y - 6, w: POT.w + 12, h: POT.h + 12 }];
    msg = 'سفارش می‌گوید چند خانه از چند خانه باید رنگی باشد. قلم‌موها شمرده‌اند.';
  } else if (st === 1) {
    holes = [{ x: BTN_F2.x - 8, y: BTN_F2.y - 8, w: BTN_F3.x + BTN_F3.w - BTN_F2.x + 16, h: BTN_F2.h + 16 }];
    msg = 'اوّل کاغذ را تا بزن تا به قسمت‌های مساوی تقسیم شود. تا زدن مجّانی است.';
    hand = { x: BTN_F2.x + BTN_F2.w / 2, y: BTN_F2.y - 62 };
  } else {
    holes = [{ x: STRIP.x - 10, y: STRIP.y - 10, w: STRIP.w + 20, h: STRIP.h + 20 }];
    msg = 'حالا روی خانه‌ها بزن تا رنگ شوند. هر رنگ یک قلم‌مو خرج می‌کند، ولی تای دوباره خرجی ندارد.';
  }

  spot(holes, .58);
  const w = 520, h = 96, x = SCENE_W / 2 - w / 2, y = 648;
  paper(x, y, w, h, P.paper, 61, 14, .45);
  ctx.fillStyle = P.dye;
  wobbleRect(x, y, 9, h, 4, 63, .8); ctx.fill();
  textWrap(msg, x + w / 2 + 6, y + h / 2 - 12, w - 54, { size: 17, color: P.ink, lineHeight: 26 });
  if (TUT_TAP.indexOf(st) >= 0) tutMore(x + w / 2, y - 46, S.t, P.ink);
  if (hand) pointHand(hand.x, hand.y);
}

/* ───────── پرده‌ها ───────── */

function flagIcon(x, y) {
  ctx.save();
  ctx.translate(x, y - 16);
  ctx.strokeStyle = P.string; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-60, 0); ctx.quadraticCurveTo(0, 14, 60, 0); ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const px = -40 + i * 40, py = 4 + (i === 1 ? 8 : 3);
    ctx.fillStyle = P.flag[i];
    ctx.beginPath();
    ctx.moveTo(px - 17, py); ctx.lineTo(px + 17, py); ctx.lineTo(px, py + 38);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT,
    w: 740, h: 344, y: 170,
    title: 'ریسهٔ جشن',
    body: 'برای هر سفارش یک پرچمِ کاغذی بساز. کاغذ را تا بزن تا خانه‌دار شود\nو خانه‌ها را رنگ کن. تا زدن مجّانی است، رنگ زدن نه.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'شروع',
    paper: P.paper, band: P.dye, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#3f7fa0', btnHotFill: '#4c92b5',
    icon: flagIcon,
  });
}

function drawWon() {
  const last = !L().endless && S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT,
    w: 720, h: 320, y: 190,
    title: 'پرچم آماده شد!',
    body: brushLeft() > 0
      ? `${fa(brushLeft())} قلم‌مو هم دست‌نخورده ماند. امتیازت ${fa(S.score)} شد.`
      : `همهٔ قلم‌موها را خرج کردی. امتیازت ${fa(S.score)} شد.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: L().endless ? 'سفارشِ بعدی' : (last ? 'از اوّل' : 'سفارشِ بعدی'),
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#3f7fa0', btnHotFill: '#4c92b5',
    icon: (x, y) => star(x, y + 6, 26, P.gold, Math.sin(S.t * 2) * .2),
  });
}

function drawLost() {
  overlay({
    t: S.phaseT,
    w: 720, h: 300, y: 196,
    title: 'کاغذها تمام شد',
    body: 'قلم‌مو کم است، پس اوّل فکر کن بعد رنگ بزن. تا زدن که خرجی ندارد.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'دوباره',
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#cf5f4a', btnHotFill: '#dd6f59',
    icon: flagIcon,
  });
}

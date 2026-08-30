/*!
title: کارخانهٔ عدد — ماشین ورودی و خروجی
bg: #171b22
*/

/* ═══════════════════════════════════════════════════════════════════════
   کارخانهٔ عدد — ریاضی سوم، فصل ۱، درس ۳ (ماشین‌های ورودی ــ خروجی)
   ───────────────────────────────────────────────────────────────────────
   کتاب یک جعبه می‌کشد که عدد از یک طرف می‌رود تو و از طرف دیگر بیرون
   می‌آید، و می‌پرسد «ماشین چه کار می‌کند؟». اینجا آن جعبه یک ماشینِ
   بخارِ واقعی است با چرخ‌دنده و لوله و سوت.

   چهار جور بازی، دقیقاً همان چهار تمرینِ کتاب:
   ۱) قاعده معلوم است، خروجی را حساب کن.
   ۲) قاعده پنهان است؛ از روی چند ورودی و خروجی خودت کشفش کن.
   ۳) خروجی معلوم است، ورودی را پیدا کن (همان «حدس و آزمایش» کتاب).
   ۴) دو ماشین پشت سر هم بسته شده‌اند.
   و آخرش: ماشینِ خودت را بساز و هر عددی خواستی از تویش رد کن.

   بچه هیچ‌جا عدد تایپ نمی‌کند؛ گویِ عددها را با انگشت برمی‌دارد و توی
   قیف می‌اندازد. اشتباه هم مجازات ندارد: گوی از لولهٔ کناری برمی‌گردد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

/* ───────── پالتِ کارگاهِ برنجی ─────────
   کارگاه تاریک است تا بخار و شعله و برقِ برنج بدرخشند؛ ماشین گرم‌ترین
   و روشن‌ترین چیزِ صحنه است تا چشم مستقیم برود سراغش.                */
const P = {
  wallTop:  '#2b3040',
  wallLow:  '#3d3a3e',
  floor:    '#4a4038',
  floorDk:  '#332c26',
  brass:    '#c99a4e',
  brassLit: '#e8bd6d',
  brassDk:  '#8d6a30',
  copper:   '#b5713f',
  copperDk: '#7d4a26',
  iron:     '#54606e',
  ironDk:   '#39424e',
  ironLit:  '#77879a',
  steam:    '#e8eef2',
  fire:     '#f0913c',
  fireLit:  '#ffd06a',
  glass:    '#8fd0d6',
  ball:     '#e8d9b6',
  ballDk:   '#c4b389',
  ink:      '#2b2418',
  inkSoft:  '#7d6f57',
  paper:    '#f4e9cf',
  green:    '#6fa05a',
  red:      '#c8524a',
  gold:     '#f0b93f',
  lamp:     'rgba(255, 206, 128, .16)',
};

/* ───────── ماشین‌ها ───────── */

const LEVELS = [
  { mode: 'forward', ops: [['+', 11]], inputs: [8, 17, 23],
    name: 'ماشینِ آقای مهندس',
    story: 'روی ماشین نوشته چه کار می‌کند. گویِ عددها را یکی‌یکی توی قیف بینداز\nو ببین از آن طرف چه بیرون می‌آید.' },
  { mode: 'guess', ops: [['-', 7]], inputs: [9, 15, 24],
    name: 'پلاکِ ماشین افتاده',
    story: 'پلاکِ روی ماشین افتاده و معلوم نیست چه کار می‌کند!\nاوّل یک گوی بینداز، خروجی را ببین، بعد پلاکِ درست را وصل کن.' },
  { mode: 'backward', ops: [['+', 15]], outputs: [20, 55, 135],
    name: 'از آخر به اوّل',
    story: 'این بار می‌دانیم از ماشین چه بیرون آمده، ولی نمی‌دانیم چه چیزی رفته تو.\nگوی‌ها را امتحان کن تا خروجیِ خواسته‌شده دربیاید.' },
  { mode: 'forward', ops: [['+', 20], ['-', 15]], inputs: [9, 23, 40],
    name: 'دو ماشینِ پشتِ سر هم',
    story: 'دو ماشین را با لوله به هم بسته‌اند. هرچه از اوّلی بیرون بیاید،\nمستقیم می‌رود توی دومی.' },
];

/* ───────── وضعیت ───────── */

const S = {
  level: 0,
  phase: 'intro',                 // intro | play | done | free
  ops: [['+', 11]],
  queue: [],                      // گوی‌های آمادهٔ روی میز
  done: [],                       // { in, mid, out }
  ball: null,                     // گویِ در حال حرکت
  target: null,                   // در حالتِ backward
  guessOp: null,                  // پلاکی که بچه انتخاب کرده
  free: { op: '+', n: 5, input: 7 },
  t: 0, introT: 0, doneT: 0,
  hover: null,
  gears: 0, steam: [], sparks: [],
  shake: 0, glow: 0,
  stars: 0,
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];

function applyOps(v) {
  let x = v, mid = null;
  S.ops.forEach(([o, n], i) => {
    x = o === '+' ? x + n : x - n;
    if (i === 0 && S.ops.length > 1) mid = x;
  });
  return { out: x, mid };
}

function loadLevel(i) {
  S.level = i;
  const lv = LEVELS[i];
  S.ops = lv.ops.map((o) => o.slice());
  S.done = [];
  S.ball = null;
  S.guessOp = lv.mode === 'guess' ? null : lv.ops[0][0] + lv.ops[0][1];
  if (lv.mode === 'backward') {
    S.target = lv.outputs[0];
    S.queue = shuffledCandidates(lv.outputs[0]);
  } else {
    S.target = null;
    S.queue = lv.inputs.slice();
  }
  S.phase = 'intro'; S.introT = 0;
}

/** برای حالتِ «از آخر به اوّل»، چند گویِ نامزد که یکی‌شان درست است. */
function shuffledCandidates(out) {
  const [o, n] = S.ops[0];
  const right = o === '+' ? out - n : out + n;
  const set = [right, right + 5, right - 5, right + 10];
  for (let i = set.length - 1; i > 0; i--) {
    const j = Math.floor(noise1(i * 7.3 + out) * (i + 1));
    [set[i], set[j]] = [set[j], set[i]];
  }
  return set.filter((v) => v > 0);
}

/* ───────── چیدمان ───────── */

const M = { x: 636, y: 292, w: 384, h: 294 };      // بدنهٔ ماشین
const HOPPER = { x: 636, y: 138, r: 70 };          // قیف بالای ماشین
const TRAY = { x: 96, y: 606, w: 396, h: 118 };    // میزِ گوی‌ها
const OUT_X = 636, OUT_Y = 632;                    // دهانهٔ خروجی
const PLATES = [
  { label: '+ ۷',  key: '+7',  x: 1008, y: 372 },
  { label: '− ۷',  key: '-7',  x: 1132, y: 372 },
  { label: '+ ۱۱', key: '+11', x: 1008, y: 452 },
  { label: '− ۵',  key: '-5',  x: 1132, y: 452 },
];
const BTN_GO = { x: 470, y: 556, w: 260, h: 76 };
const F_OP = { x: 946, y: 250, w: 200, h: 46 };
const F_N_L = { x: 966, y: 336, r: 22 };
const F_N_R = { x: 1126, y: 336, r: 22 };
const F_IN_L = { x: 966, y: 424, r: 22 };
const F_IN_R = { x: 1126, y: 424, r: 22 };
const F_RUN = { x: 946, y: 466, w: 200, h: 54 };

function trayBallPos(i) {
  const per = 4;
  const col = i % per, row = Math.floor(i / per);
  return { x: TRAY.x + 54 + col * 96, y: TRAY.y + 38 + row * 52 };
}

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
loadLevel(0);
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt;
  if (S.phase === 'intro') S.introT += dt;
  if (S.phase === 'done') S.doneT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.glow > 0) S.glow -= dt;
  S.gears += dt * (S.ball ? 4.2 : .55);

  // بخار از دودکش
  if (Math.random() < (S.ball ? .5 : .16)) {
    S.steam.push({ x: M.x + 118 + rndc(10), y: M.y - 118, r: 8 + Math.random() * 8, life: 0 });
  }
  for (const p of S.steam) { p.life += dt; p.y -= 34 * dt; p.x += Math.sin(p.life * 2) * 10 * dt; p.r += 16 * dt; }
  S.steam = S.steam.filter((p) => p.life < 2.4);

  if (S.ball) stepBall(dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

const rndc = (a) => (Math.random() - .5) * 2 * a;

/* ───────── سفرِ گوی داخلِ ماشین ───────── */

function stepBall(dt) {
  const b = S.ball;
  b.t += dt * (b.stage === 'inside' ? .9 : 1.5);
  if (b.t < 1) return;
  b.t = 0;

  if (b.stage === 'toHopper') {
    b.stage = 'inside';
    S.shake = .5;
    sfx.slide();
    bits.add(HOPPER.x, HOPPER.y + 30, 10, 'dot', [P.brassLit, P.fire], { speed: 120, lift: 30, size: 3, life: .5 });
  } else if (b.stage === 'inside') {
    const r = applyOps(b.value);
    b.mid = r.mid;
    b.out = r.out;
    b.stage = 'toOut';
    S.glow = .7;
    sfx.pop();
  } else {
    finishBall(b);
    S.ball = null;
  }
}

function finishBall(b) {
  const lv = L();
  S.done.push({ in: b.value, mid: b.mid, out: b.out });
  bits.confetti(OUT_X + 130, OUT_Y, 16, [P.brassLit, P.gold, P.green]);
  sfx.good();

  if (lv.mode === 'backward') {
    if (b.out === S.target) {
      toast.say('همان عددی که می‌خواستیم!', 'good');
      const idx = lv.outputs.indexOf(S.target);
      if (idx + 1 < lv.outputs.length) {
        S.target = lv.outputs[idx + 1];
        S.queue = shuffledCandidates(S.target);
        S.done = [];
      } else finish();
    } else {
      toast.say(`این شد ${fa(b.out)} — ما ${fa(S.target)} می‌خواستیم`, 'info');
      S.queue.push(b.value);            // گوی برمی‌گردد روی میز، بدون جریمه
    }
    return;
  }
  if (S.queue.length === 0) finish();
}

function finish() {
  S.phase = 'done'; S.doneT = 0;
  S.stars++;
  sfx.win();
  bits.confetti(SCENE_W/2, 300, 70, [P.brassLit, P.gold, P.green, P.fire]);
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase === 'intro' || S.phase === 'done') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (S.phase === 'free') {
    if (inRect(p, F_OP)) return F_OP;
    for (const b of [F_N_L, F_N_R, F_IN_L, F_IN_R]) if (inCircle(p, b, 6)) return b;
    if (inRect(p, F_RUN)) return F_RUN;
    return null;
  }
  if (L().mode === 'guess' && !S.guessOp) {
    for (const pl of PLATES) if (Math.hypot(p.x - pl.x, p.y - pl.y) < 54) return pl;
  }
  if (S.ball) return null;
  for (let i = 0; i < S.queue.length; i++) {
    const bp = trayBallPos(i);
    if (Math.hypot(p.x - bp.x, p.y - bp.y) < 36) return { ballIndex: i };
  }
  return null;
}

cv.addEventListener('pointermove', (e) => {
  S.hover = hitTest(toStage(e));
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});
cv.addEventListener('pointerleave', () => { S.hover = null; });
cv.addEventListener('pointerdown', (e) => {
  const h = hitTest(toStage(e));
  if (!h) return;
  if (S.phase === 'intro') { S.phase = 'play'; sfx.tap(); return; }
  if (S.phase === 'done') {
    if (S.level + 1 < LEVELS.length) loadLevel(S.level + 1);
    else { S.phase = 'free'; S.done = []; }
    return;
  }
  if (S.phase === 'free') return freeInput(h);
  if (h.key) return choosePlate(h);
  if (h.ballIndex !== undefined) dropBall(h.ballIndex);
});

function choosePlate(pl) {
  const real = S.ops[0][0] + S.ops[0][1];
  if (pl.key === real) {
    S.guessOp = pl.key;
    sfx.good();
    toast.say('درست حدس زدی — پلاک سرِ جایش نشست', 'good');
    bits.confetti(pl.x, pl.y, 22, [P.brassLit, P.gold]);
  } else {
    sfx.nope();
    S.shake = .35;
    toast.say('این پلاک با چیزی که دیدی جور نیست', 'info');
  }
}

function dropBall(i) {
  const lv = L();
  if (lv.mode === 'guess' && !S.guessOp && S.done.length >= 1) {
    toast.say('اوّل پلاکِ درست را انتخاب کن', 'info');
    return;
  }
  const v = S.queue[i];
  S.queue.splice(i, 1);
  S.ball = { value: v, stage: 'toHopper', t: 0, from: trayBallPos(i), mid: null, out: null };
  sfx.tap();
}

function freeInput(h) {
  const F = S.free;
  if (h === F_OP) { F.op = F.op === '+' ? '-' : '+'; sfx.tap(); return; }
  if (h === F_N_L) F.n = clamp(F.n - 1, 1, 30);
  if (h === F_N_R) F.n = clamp(F.n + 1, 1, 30);
  if (h === F_IN_L) F.input = clamp(F.input - 1, 0, 99);
  if (h === F_IN_R) F.input = clamp(F.input + 1, 0, 99);
  if (h === F_RUN) {
    S.ops = [[F.op, F.n]];
    S.ball = { value: F.input, stage: 'toHopper', t: 0, from: { x: TRAY.x + 54, y: TRAY.y + 38 }, mid: null, out: null };
    sfx.slide();
    return;
  }
  sfx.pop();
}

/* ───────── ترسیم ───────── */

function draw() {
  beginScene('#171b22');
  drawRoom();
  drawPipes();
  drawShelf();
  drawMachine();
  drawSteam();
  drawMechanic(248, 588);
  drawTray();
  drawBall();
  drawOutputShelf();
  if (L().mode === 'guess' && S.phase === 'play') drawPlates();
  if (L().mode === 'backward' && S.phase === 'play') drawTargetCard();
  if (S.phase === 'free') drawFreePanel();
  bits.draw();
  toast.draw(20, { ink: P.ink });
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'done') drawDone();
  endScene(.12, 'rgba(10,12,18,.5)');
}

function drawRoom() {
  const g = ctx.createLinearGradient(0, 0, 0, 560);
  g.addColorStop(0, P.wallTop);
  g.addColorStop(1, P.wallLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, 560);
  // آجرهای دیوار
  ctx.strokeStyle = 'rgba(0,0,0,.16)';
  ctx.lineWidth = 2;
  for (let y = 40; y < 560; y += 46) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SW, y); ctx.stroke();
    for (let x = (y / 46) % 2 ? 0 : 60; x < SW; x += 120) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 46); ctx.stroke();
    }
  }
  // کف
  const fg = ctx.createLinearGradient(0, 548, 0, SH);
  fg.addColorStop(0, P.floor);
  fg.addColorStop(1, P.floorDk);
  ctx.fillStyle = fg;
  ctx.fillRect(0, 548, SW, SH - 548);
  ctx.strokeStyle = 'rgba(0,0,0,.2)';
  for (let x = -60; x < SW + 200; x += 130) {
    ctx.beginPath();
    ctx.moveTo(x, 548); ctx.lineTo(x - 60, SH);
    ctx.stroke();
  }
  // چراغِ آویز بالای ماشین
  ctx.strokeStyle = P.ironDk; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(M.x, 0); ctx.lineTo(M.x, 42); ctx.stroke();
  ctx.fillStyle = P.iron;
  ctx.beginPath();
  ctx.moveTo(M.x - 54, 92); ctx.quadraticCurveTo(M.x - 40, 42, M.x, 40);
  ctx.quadraticCurveTo(M.x + 40, 42, M.x + 54, 92);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.fireLit;
  wobbleEllipse(M.x, 92, 34, 7, 0, 3, 1.2);
  ctx.fill();
  const lamp = ctx.createRadialGradient(M.x, 110, 20, M.x, 300, 420);
  lamp.addColorStop(0, 'rgba(255,206,128,.22)');
  lamp.addColorStop(1, 'rgba(255,206,128,0)');
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, SW, SH);
}

/** لوله‌های مسیِ روی دیوار — عمقِ صحنه را می‌سازند. */
function drawPipes() {
  ctx.strokeStyle = P.copperDk;
  ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, 132); ctx.lineTo(150, 132);
  ctx.quadraticCurveTo(186, 132, 186, 168);
  ctx.lineTo(186, 430);
  ctx.stroke();
  ctx.strokeStyle = P.copper;
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.fillStyle = P.brassDk;
  for (const [x, y] of [[92, 132], [186, 260], [186, 372]]) {
    wobbleRect(x - 13, y - 11, 26, 22, 4, x, 1); ctx.fill();
  }
  // مانومترِ روی دیوار
  ctx.fillStyle = P.brass;
  wobbleCircle(1042, 132, 40, 7, 2); ctx.fill();
  ctx.fillStyle = '#f2ead6';
  wobbleCircle(1042, 132, 30, 9, 1.4); ctx.fill();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const ang = -2.2 + Math.sin(S.t * 1.3) * .5 + (S.ball ? 1 : 0);
  ctx.beginPath();
  ctx.moveTo(1042, 132);
  ctx.lineTo(1042 + Math.cos(ang) * 20, 132 + Math.sin(ang) * 20);
  ctx.stroke();
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI * 1.15 + k * (Math.PI * 1.3 / 6);
    ctx.beginPath();
    ctx.moveTo(1042 + Math.cos(a) * 24, 132 + Math.sin(a) * 24);
    ctx.lineTo(1042 + Math.cos(a) * 28, 132 + Math.sin(a) * 28);
    ctx.lineWidth = 2; ctx.stroke();
  }
}

/** قفسهٔ قطعات روی دیوارِ راست — عمق و شلوغیِ کارگاه. */
function drawShelf() {
  const x = 940, y = 118, w = 246;
  ctx.fillStyle = P.copperDk;
  wobbleRect(x, y + 74, w, 14, 3, 3, 1.4); ctx.fill();
  ctx.fillStyle = P.copper;
  wobbleRect(x, y + 74, w, 5, 2, 5, 1); ctx.fill();
  for (const [dx, r, col] of [[34, 20, P.brass], [92, 15, P.copper], [146, 24, P.brassDk], [206, 17, P.iron]]) {
    ctx.globalAlpha = .9;
    gear(x + dx, y + 74 - r - 3, r, 8, dx * .1, col);
    ctx.globalAlpha = 1;
  }
  // شیشهٔ روغن
  ctx.fillStyle = 'rgba(143,208,214,.35)';
  wobbleRect(x + 176, y + 26, 34, 46, 5, 9, 1.2); ctx.fill();
  ctx.fillStyle = P.fire;
  wobbleRect(x + 179, y + 48, 28, 22, 4, 11, 1); ctx.fill();
  // زنجیرِ آویزان از سقف
  ctx.strokeStyle = P.ironDk; ctx.lineWidth = 4;
  for (const cx of [206, 1122]) {
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      ctx.moveTo(cx, k * 13);
      ctx.lineTo(cx + (k % 2 ? 4 : -4), k * 13 + 13);
    }
    ctx.stroke();
  }
}

/** شاگردِ کارگاه — با عینکِ جوشکاری روی پیشانی و آچار به دست. */
function drawMechanic(x, footY) {
  const bob = Math.sin(S.t * 1.5) * 3;
  const busy = !!S.ball;
  ctx.save();
  ctx.translate(x, footY + bob);
  ctx.scale(1.12, 1.12);

  ctx.globalAlpha = .3;
  ctx.fillStyle = '#1c1a16';
  wobbleEllipse(10, 4, 46, 10, 0, 3, 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#3b3a3e';                     // چکمه
  wobbleRect(-30, -20, 26, 22, 5, 21, 1.2); ctx.fill();
  wobbleRect(6, -20, 26, 22, 5, 23, 1.2); ctx.fill();

  withShadow(16, 8, .4, () => {                  // لباس کار
    ctx.fillStyle = '#4a6a7c';
    ctx.beginPath();
    ctx.moveTo(-42, -14);
    ctx.quadraticCurveTo(-50, -104, -28, -130);
    ctx.lineTo(28, -130);
    ctx.quadraticCurveTo(50, -104, 42, -14);
    ctx.closePath(); ctx.fill();
  }, '10, 14, 20');
  ctx.fillStyle = '#3b5665';
  ctx.beginPath();
  ctx.moveTo(14, -14);
  ctx.quadraticCurveTo(34, -96, 24, -128);
  ctx.lineTo(28, -130);
  ctx.quadraticCurveTo(50, -104, 42, -14);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.brassDk;                     // بندِ پیش‌بند
  wobbleRect(-30, -104, 60, 8, 3, 25, 1); ctx.fill();

  ctx.strokeStyle = '#d9a97e';                   // دست‌ها
  ctx.lineWidth = 13; ctx.lineCap = 'round';
  const swing = busy ? Math.sin(S.t * 8) * 14 : 0;
  ctx.beginPath();
  ctx.moveTo(-34, -104); ctx.lineTo(-50, -64 + swing);
  ctx.moveTo(34, -104);  ctx.lineTo(52, -68 - swing);
  ctx.stroke();
  ctx.save();                                    // آچار
  ctx.translate(52, -68 - swing);
  ctx.rotate(-.5 + swing * .02);
  ctx.fillStyle = P.ironLit;
  wobbleRect(-4, -2, 34, 8, 3, 31, .8); ctx.fill();
  ctx.beginPath();
  ctx.arc(32, 2, 9, .6, TAU - .6);
  ctx.lineWidth = 6; ctx.strokeStyle = P.ironLit; ctx.stroke();
  ctx.restore();

  withShadow(12, 6, .3, () => {                  // سر
    ctx.fillStyle = '#d9a97e';
    wobbleCircle(0, -158, 34, 9, 1.7);
    ctx.fill();
  }, '10, 14, 20');
  ctx.fillStyle = '#2f2620';                     // مو
  ctx.beginPath();
  ctx.moveTo(-34, -164);
  ctx.quadraticCurveTo(-36, -200, 0, -196);
  ctx.quadraticCurveTo(36, -200, 34, -164);
  ctx.quadraticCurveTo(16, -180, 0, -178);
  ctx.quadraticCurveTo(-16, -180, -34, -164);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.brassDk;                     // عینکِ روی پیشانی
  wobbleRect(-32, -186, 64, 15, 6, 33, 1); ctx.fill();
  ctx.fillStyle = P.glass;
  wobbleCircle(-14, -178, 9, 35, .8); ctx.fill();
  wobbleCircle(14, -178, 9, 37, .8); ctx.fill();

  ctx.fillStyle = P.ink;
  for (const s2 of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(s2 * 12, -158, 4, 4.8, 0, 0, TAU); ctx.fill();
  }
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -144, busy ? 11 : 8, .18 * Math.PI, .82 * Math.PI);
  ctx.stroke();
  ctx.globalAlpha = .3;
  ctx.fillStyle = P.red;
  wobbleCircle(-22, -148, 7, 1, .6); ctx.fill();
  wobbleCircle(22, -148, 7, 2, .6); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ───────── ماشین ───────── */

function drawMachine() {
  const sh = S.shake > 0 ? Math.sin(S.shake * 60) * 4 : 0;
  ctx.save();
  ctx.translate(sh, 0);

  drawHopper();

  // بدنه
  withShadow(24, 12, .45, () => {
    ctx.fillStyle = P.iron;
    wobbleRect(M.x - M.w/2, M.y, M.w, M.h, 16, 21, 2.4);
    ctx.fill();
  }, '10, 14, 20');
  ctx.fillStyle = P.ironLit;                       // لبهٔ روشنِ بالا-چپ
  wobbleRect(M.x - M.w/2 + 6, M.y + 6, M.w - 12, 10, 5, 23, 1.2);
  ctx.fill();
  ctx.fillStyle = P.ironDk;
  wobbleRect(M.x - M.w/2 + 6, M.y + M.h - 18, M.w - 12, 12, 5, 25, 1.2);
  ctx.fill();

  // پیچ‌های گوشه
  for (const [dx, dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
    const x = M.x + dx * (M.w/2 - 20), y = M.y + (dy < 0 ? 26 : M.h - 28);
    ctx.fillStyle = P.brass;
    wobbleCircle(x, y, 8, x + y, .8); ctx.fill();
    ctx.strokeStyle = P.brassDk; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.stroke();
  }

  drawGears();
  drawFirebox();
  drawPlate();
  drawChimney();
  ctx.restore();
}

function drawHopper() {
  const h = HOPPER;
  withShadow(14, 7, .4, () => {
    ctx.fillStyle = P.copper;
    ctx.beginPath();
    ctx.moveTo(h.x - h.r, h.y - 44);
    ctx.lineTo(h.x + h.r, h.y - 44);
    ctx.lineTo(h.x + 26, h.y + 52);
    ctx.lineTo(h.x - 26, h.y + 52);
    ctx.closePath(); ctx.fill();
  }, '10, 14, 20');
  ctx.fillStyle = P.copperDk;
  ctx.beginPath();
  ctx.moveTo(h.x + 18, h.y - 44); ctx.lineTo(h.x + h.r, h.y - 44);
  ctx.lineTo(h.x + 26, h.y + 52); ctx.lineTo(h.x + 12, h.y + 52);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.brass;                        // حلقهٔ دهانه
  wobbleEllipse(h.x, h.y - 44, h.r + 6, 12, 0, 5, 1.6);
  ctx.fill();
  ctx.fillStyle = '#1d2027';
  wobbleEllipse(h.x, h.y - 44, h.r - 6, 8, 0, 7, 1.2);
  ctx.fill();
  // لولهٔ اتصال به بدنه
  ctx.fillStyle = P.copperDk;
  wobbleRect(h.x - 24, h.y + 46, 48, M.y - h.y - 42, 4, 9, 1.2);
  ctx.fill();
}

function drawGears() {
  // پنجرهٔ شیشه‌ایِ وسطِ ماشین که چرخ‌دنده‌ها را نشان می‌دهد
  const gx = M.x - 92, gy = M.y + 172, r = 76;
  ctx.save();
  wobbleCircle(gx, gy, r, 31, 2);
  ctx.fillStyle = '#20252d';
  ctx.fill();
  ctx.clip();
  gear(gx - 18, gy + 8, 50, 11, S.gears, P.brass);
  gear(gx + 42, gy - 28, 32, 9, -S.gears * 1.5 + .4, P.brassDk);
  gear(gx + 16, gy + 56, 27, 8, S.gears * 1.8, P.copper);
  ctx.restore();
  ctx.strokeStyle = P.brass;
  ctx.lineWidth = 7;
  wobbleCircle(gx, gy, r, 31, 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.14)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(gx, gy, r - 8, Math.PI * 1.1, Math.PI * 1.6);
  ctx.stroke();
}

function gear(x, y, r, teeth, rot, col) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = col;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * TAU;
    const rr = i % 2 ? r : r * .82;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#20252d';
  ctx.beginPath(); ctx.arc(0, 0, r * .3, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawFirebox() {
  const x = M.x + 106, y = M.y + 190, w = 116, h = 74;
  ctx.fillStyle = '#1a1d23';
  wobbleRect(x - w/2, y - h/2, w, h, 6, 41, 1.4);
  ctx.fill();
  // شعله
  const flick = .8 + Math.sin(S.t * 12) * .2 + (S.glow > 0 ? .5 : 0);
  const fg = ctx.createRadialGradient(x, y + 14, 4, x, y + 6, 46 * flick);
  fg.addColorStop(0, P.fireLit);
  fg.addColorStop(.5, P.fire);
  fg.addColorStop(1, 'rgba(240,145,60,0)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.ellipse(x, y + 8, 40 * flick, 26 * flick, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = P.brass;
  ctx.lineWidth = 4;
  wobbleRect(x - w/2, y - h/2, w, h, 6, 41, 1.4);
  ctx.stroke();
  for (let k = 1; k < 4; k++) {                   // میله‌های جلوی کوره
    ctx.beginPath();
    ctx.moveTo(x - w/2 + k * w/4, y - h/2 + 4);
    ctx.lineTo(x - w/2 + k * w/4, y + h/2 - 4);
    ctx.lineWidth = 3; ctx.strokeStyle = P.brassDk; ctx.stroke();
  }
}

/** پلاکِ برنجیِ روی ماشین: چه کار می‌کند. */
function drawPlate() {
  const y = M.y + 22;
  const known = L().mode !== 'guess' || S.guessOp;
  withShadow(8, 4, .35, () => {
    ctx.fillStyle = known ? P.brass : P.ironDk;
    wobbleRect(M.x - 118, y, 236, 60, 8, 51, 1.4);
    ctx.fill();
  }, '10, 14, 20');
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 3;
  wobbleRect(M.x - 118, y, 236, 60, 8, 51, 1.4);
  ctx.stroke();
  if (known) {
    const txt = S.ops.map(([o, n]) => `${o === '+' ? '+' : '−'} ${fa(n)}`).join('   ');
    text(txt, M.x, y + 31, { size: 34, color: P.ink, family: 'Lalezar' });
  } else {
    text('؟', M.x, y + 31, { size: 36, color: P.brassDk, family: 'Lalezar' });
  }
}

function drawChimney() {
  ctx.fillStyle = P.ironDk;
  wobbleRect(M.x + 100, M.y - 118, 40, 124, 4, 61, 1.4);
  ctx.fill();
  ctx.fillStyle = P.iron;
  wobbleRect(M.x + 100, M.y - 118, 16, 124, 4, 63, 1.2);
  ctx.fill();
  ctx.fillStyle = P.brass;
  wobbleRect(M.x + 94, M.y - 128, 52, 16, 4, 65, 1.2);
  ctx.fill();
}

function drawSteam() {
  for (const p of S.steam) {
    const k = 1 - p.life / 2.4;
    ctx.globalAlpha = k * .34;
    ctx.fillStyle = P.steam;
    wobbleCircle(p.x, p.y, p.r, p.x, 2.4);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ───────── میزِ گوی‌ها و خروجی ───────── */

function drawTray() {
  const t = TRAY;
  withShadow(16, 8, .4, () => {
    ctx.fillStyle = P.copperDk;
    wobbleRect(t.x, t.y, t.w, t.h, 10, 71, 1.8);
    ctx.fill();
  }, '10, 14, 20');
  ctx.fillStyle = P.copper;
  wobbleRect(t.x + 6, t.y + 6, t.w - 12, t.h - 22, 8, 73, 1.4);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  wobbleRect(t.x + 12, t.y + 12, t.w - 24, t.h - 34, 6, 75, 1.2);
  ctx.fill();
  text('گوی‌های آماده', t.x + t.w - 68, t.y + t.h - 14,
    { size: 15, color: 'rgba(240,226,196,.5)' });

  for (let i = 0; i < S.queue.length; i++) {
    const bp = trayBallPos(i);
    const hot = S.hover && S.hover.ballIndex === i;
    drawNumberBall(bp.x, bp.y + (hot ? -5 : 0), 30, S.queue[i], hot);
  }
  if (S.queue.length === 0 && !S.ball) {
    text('همه رفتند تو', t.x + t.w/2, t.y + t.h/2, { size: 19, color: 'rgba(240,226,196,.5)' });
  }
}

/** گویِ عدد: چوبی و گِرد، با عددِ حکاکی‌شده. */
function drawNumberBall(x, y, r, val, hot) {
  withShadow(10, 6, .45, () => {
    ctx.fillStyle = hot ? '#f6e9c6' : P.ball;
    wobbleCircle(x, y, r, x + y, r * .06);
    ctx.fill();
  }, '10, 14, 20');
  ctx.save();
  wobbleCircle(x, y, r, x + y, r * .06);
  ctx.clip();
  ctx.fillStyle = P.ballDk;
  ctx.globalAlpha = .5;
  wobbleCircle(x + r * .5, y + r * .42, r * .85, x, r * .05);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
  ctx.strokeStyle = P.ballDk;
  ctx.lineWidth = 2;
  wobbleCircle(x, y, r - 5, x + 3, r * .05);
  ctx.stroke();
  text(fa(val), x, y + 1, { size: r * 1.05, color: P.ink, family: 'Lalezar' });
}

function drawOutputShelf() {
  const x0 = M.x + M.w/2 - 20, y0 = M.y + M.h - 40;
  const x1 = 1104, y1 = OUT_Y;
  // کفِ ناودان
  ctx.fillStyle = P.copperDk;
  ctx.beginPath();
  ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
  ctx.lineTo(x1, y1 + 30); ctx.lineTo(x0, y0 + 30);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.copper;
  ctx.beginPath();
  ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
  ctx.lineTo(x1, y1 + 9); ctx.lineTo(x0, y0 + 9);
  ctx.closePath(); ctx.fill();
  // دیوارهٔ جلویی، تا گوی‌ها بیرون نیفتند
  ctx.fillStyle = P.brassDk;
  ctx.beginPath();
  ctx.moveTo(x0, y0 + 26); ctx.lineTo(x1, y1 + 26);
  ctx.lineTo(x1, y1 + 50); ctx.lineTo(x0, y0 + 50);
  ctx.closePath(); ctx.fill();
  // پایه‌های ناودان
  ctx.fillStyle = P.ironDk;
  for (const t of [.5, .92]) {
    const px = lerp(x0, x1, t), py = lerp(y0, y1, t) + 40;
    wobbleRect(px - 7, py, 14, SH - py - 40, 3, px, 1.2);
    ctx.fill();
  }

  for (let i = 0; i < S.done.length; i++) {
    const d = S.done[i];
    const x = x1 - 46 - i * 78;
    const t = (x - x0) / (x1 - x0);
    const y = lerp(y0, y1, t) + 6;
    drawNumberBall(x, y, 28, d.out, false);
    text(`از ${fa(d.in)}`, x, y + 52, { size: 15, color: 'rgba(240,226,196,.72)' });
  }
}

function drawBall() {
  const b = S.ball;
  if (!b) return;
  let x, y, r = 30, alpha = 1;
  const t = easeInOut(clamp(b.t, 0, 1));
  if (b.stage === 'toHopper') {
    x = lerp(b.from.x, HOPPER.x, t);
    y = lerp(b.from.y, HOPPER.y - 40, t) - Math.sin(Math.PI * t) * 210;
  } else if (b.stage === 'inside') {
    x = HOPPER.x; y = lerp(HOPPER.y + 20, M.y + 150, t);
    alpha = 1 - t * .9;
  } else {
    const x0 = M.x + M.w/2 - 20, y0 = M.y + M.h - 34;
    x = lerp(x0, 1104 - 46 - S.done.length * 78, t);
    y = lerp(y0, OUT_Y + 6 + (1104 - 34 - S.done.length * 78 - x0) * 0, t);
    alpha = clamp(t * 3, 0, 1);
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  const shown = b.stage === 'toOut' ? b.out : b.value;
  drawNumberBall(x, y, r, shown, false);
  ctx.restore();
}

/* ───────── پلاک‌های حدس ───────── */

function drawPlates() {
  text('کدام پلاک روی این ماشین بوده؟', 1070, 320,
    { size: 17, color: 'rgba(240,226,196,.85)' });
  for (const pl of PLATES) {
    const hot = S.hover === pl;
    withShadow(10, hot ? 3 : 6, .4, () => {
      ctx.fillStyle = hot ? P.brassLit : P.brass;
      wobbleRect(pl.x - 54, pl.y - 28 + (hot ? 3 : 0), 108, 56, 8, pl.x, 1.4);
      ctx.fill();
    }, '10, 14, 20');
    text(pl.label, pl.x, pl.y + 1 + (hot ? 3 : 0), { size: 26, color: P.ink, family: 'Lalezar' });
  }
}

function drawTargetCard() {
  const x = 962, y = 330, w = 214, h = 128;
  paper(x, y, w, h, P.paper, 81, 10, .4);
  text('باید این عدد بیرون بیاید', x + w/2, y + 26, { size: 15, color: P.inkSoft });
  text(fa(S.target), x + w/2, y + 76, { size: 52, color: P.red, family: 'Lalezar' });
}

/* ───────── حالتِ آزاد ───────── */

function drawFreePanel() {
  const F = S.free;
  const x = 930, y = 210, w = 232, h = 330;
  paper(x, y, w, h, P.paper, 91, 12, .4);
  text('ماشینِ خودت', x + w/2, y + 28, { size: 23, color: P.ink, family: 'Lalezar' });

  button(F_OP, F.op === '+' ? 'جمع می‌کند' : 'کم می‌کند',
    { hot: S.hover === F_OP, fill: F.op === '+' ? P.green : P.red, hotFill: P.brassLit, size: 20, r: 10 });

  text('چند تا؟', x + w/2, y + 106, { size: 14, color: P.inkSoft });
  roundButton(F_N_L, '−', { fill: P.copperDk, hot: S.hover === F_N_L, size: 24 });
  text(fa(F.n), x + w/2, y + 128, { size: 36, color: P.ink, family: 'Lalezar' });
  roundButton(F_N_R, '+', { fill: P.copper, hot: S.hover === F_N_R, size: 24 });

  text('چه عددی بفرستم تو؟', x + w/2, y + 178, { size: 14, color: P.inkSoft });
  roundButton(F_IN_L, '−', { fill: P.copperDk, hot: S.hover === F_IN_L, size: 24 });
  text(fa(F.input), x + w/2, y + 216, { size: 36, color: P.red, family: 'Lalezar' });
  roundButton(F_IN_R, '+', { fill: P.copper, hot: S.hover === F_IN_R, size: 24 });

  button(F_RUN, 'بفرست!', { hot: S.hover === F_RUN, fill: P.green, hotFill: '#82b46a', size: 24 });
}

/* ───────── پرده‌ها ───────── */

function drawIntro() {
  overlay({
    t: S.introT, title: L().name, body: L().story,
    btn: BTN_GO, btnLabel: 'روشنش کن', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.copper, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.green, btnHotFill: '#82b46a',
    icon: (cx, cy) => {
      gear(cx - 26, cy, 24, 8, S.t, P.brass);
      gear(cx + 20, cy - 14, 17, 7, -S.t * 1.4, P.copper);
    },
  });
}

function drawDone() {
  const rows = S.done.map((d) => `${fa(d.in)}  ←  ${fa(d.out)}`).join('     ');
  const last = S.level + 1 >= LEVELS.length;
  const opTxt = S.ops.map(([o, n]) => `${o === '+' ? 'به‌علاوهٔ' : 'منهای'} ${fa(n)}`).join(' و بعد ');
  overlay({
    t: S.doneT,
    title: L().mode === 'backward' ? 'همه را پیدا کردی!' : 'ماشین کارش را کرد',
    body: `${rows}\nاین ماشین هر عددی که می‌گرفت، ${opTxt} می‌کرد.`,
    btn: BTN_GO, btnLabel: last ? 'ماشینِ خودت را بساز' : 'ماشینِ بعدی', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.green, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.green, btnHotFill: '#82b46a',
    icon: (cx, cy) => star(cx, cy, 28, P.gold),
  });
}

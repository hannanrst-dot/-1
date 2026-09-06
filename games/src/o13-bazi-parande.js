/*!
title: از تخم تا پرنده — چرخهٔ زندگی (بازی)
bg: #cfe6ee
*/

/* ═══════════════════════════════════════════════════════════════════════
   از تخم تا پرنده — علومِ سوم، درس ۱۳ «پرندگان»

   کتاب می‌گوید پرندگان تخم می‌گذارند، بدنشان از پَر پوشیده است و
   همین پرها به آن‌ها کمک می‌کند پرواز کنند. اینجا هر چهارتای این
   جمله‌ها یک کار است، نه یک جمله:

     تخم       جوجه از درون به پوسته نوک می‌زند تا بشکند.
     جوجهٔ بی‌پر  هنوز پَر ندارد و چشمش باز نیست؛ فقط وقتی مادر سرِ
               لانه می‌رسد باید دهانش را باز کند — نه زودتر، نه
               دیرتر، وگرنه لقمه به جوجهٔ بغلی می‌رسد.
     پَر درآوردن  حالا پَر دارد؛ باید بال بزند تا بالِ خودش قوی شود.
     اوّلین پرواز  از لانه تا شاخه‌ها. پایین نرود، که گربه آنجاست.
     پرنده     برمی‌گردد سرِ لانه و چرخه بسته می‌شود.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  sky: '#d6ecf4', skyLo: '#a8d6e8', sun: '#fff2c4',
  far: '#9fc6a4', farLo: '#7fae87',
  ground: '#6f9a52', groundLo: '#4d7038', soil: '#6a4d31',
  bark: '#7a5738', barkLo: '#523a24', barkLt: '#9c7450',
  leaf: '#4f9440', leafLt: '#79bd5e', leafDk: '#33702c',
  nest: '#a9773f', nestLt: '#c99a5c', nestDk: '#6f4c25',
  egg: '#e8dfc8', eggDot: '#a08a62',
  chick: '#e8a888', chickDk: '#b87a5e', chickLt: '#f7cdb2',
  down: '#c9b48c',
  bird: '#8a6a48', birdLt: '#c4a37c', birdDk: '#5c4530', bib: '#3a2a1c',
  beak: '#e0a63f', worm: '#d2705f',
  cat: '#5a5a66', catLt: '#8a8a98', catEye: '#e8c44a',
  paper: '#fbf7ec', card: '#ffffff',
  ink: '#2c2a20', inkSoft: '#7d7862',
  good: '#5fb07f', bad: '#d3624a', gold: '#e5b344', accent: '#5fa8d8',
};

/* ───────── درخت و لانه ───────── */

const GROUND = 700;
const NEST = { x: 424, y: 300 };
const PERCH = [
  { x: 706, y: 202 }, { x: 940, y: 356 }, { x: 618, y: 530 }, { x: 1046, y: 214 },
];
const TRUNK = [
  { x0: 210, y0: GROUND + 20, x1: 268, y1: 180, w0: 54, w1: 18 },
  { x0: 1118, y0: GROUND + 20, x1: 1074, y1: 150, w0: 46, w1: 15 },
];
/* شاخه‌ها: از تنه تا هر نشیمن */
const BRANCH = [
  { from: 0, x: NEST.x, y: NEST.y + 26 },
  { from: 0, x: PERCH[0].x, y: PERCH[0].y + 16 },
  { from: 1, x: PERCH[1].x, y: PERCH[1].y + 16 },
  { from: 0, x: PERCH[2].x, y: PERCH[2].y + 16 },
  { from: 1, x: PERCH[3].x, y: PERCH[3].y + 16 },
];
const LEAFY = [
  { x: 250, y: 170, r: 130 }, { x: 400, y: 128, r: 96 }, { x: 150, y: 250, r: 92 },
  { x: 1080, y: 130, r: 120 }, { x: 950, y: 190, r: 86 }, { x: 1170, y: 250, r: 84 },
  { x: 620, y: 150, r: 74 },
];

const GRAV = 780;
const FLAP = 1450;
const FEED_WIN = 1.15;          /* چند ثانیه دهان باز باشد */

const STAGES = [
  { n: 'تخم', need: 5 },
  { n: 'جوجهٔ بی‌پر', need: 6 },
  { n: 'بال درآوردن', need: 5 },
  { n: 'اوّلین پرواز', need: PERCH.length },
  { n: 'پرنده', need: 1 },
];

const S = {
  phase: 'intro', phaseT: 0,
  stage: 0, got: 0, score: 0, best: 0,
  x: NEST.x, y: NEST.y - 6, vx: 0, vy: 0, ang: 0,
  aim: null, wig: 0, gape: 0, flapT: 0, lift: 0,
  mom: null, momT: 2,           /* مادر با لقمه */
  sib: [{ g: 0 }, { g: 0 }],
  perched: -1, done: [false, false, false, false],
  cat: { x: 620, dir: 1, pounce: 0 },
  hurt: 0, won: false, winT: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const ST = () => STAGES[Math.min(S.stage, STAGES.length - 1)];
function tip(msg) { S.tip = msg; S.tipT = 3.4; }
const canFly = () => S.stage >= 3;
const bodyR = () => (S.stage <= 1 ? 20 : S.stage === 2 ? 24 : 26);
const momHere = () => S.mom && S.mom.t > .75 && S.mom.t < .75 + FEED_WIN;

function resetGame() {
  S.stage = 0; S.got = 0;
  S.x = NEST.x; S.y = NEST.y - 6; S.vx = 0; S.vy = 0; S.ang = 0;
  S.aim = null; S.wig = 0; S.gape = 0; S.flapT = 0; S.lift = 0;
  S.mom = null; S.momT = 2.4;
  S.sib = [{ g: 0 }, { g: 0 }];
  S.perched = -1; S.done = [false, false, false, false];
  S.cat = { x: 620, dir: 1, pounce: 0 };
  S.hurt = 0; S.won = false; S.winT = 0;
}

function startGame(keep) {
  S.phase = 'play'; S.phaseT = 0;
  if (!keep) S.score = 0;
  S.tut.on = !keep; S.tut.step = 0; S.tut.t = 0;
  resetGame();
}

/* ───────── پیشرفتِ مرحله ───────── */

function grow() {
  S.got = 0;
  S.stage++;
  S.score += 100;
  if (S.score > S.best) S.best = S.score;
  sfx.win();
  bits.confetti(S.x, S.y, 20, [P.birdLt, P.gold, P.card]);
  if (S.stage === 1) toast.say('از تخم بیرون آمدی', 'good');
  if (S.stage === 2) { S.mom = null; toast.say('پَر درآوردی — بال بزن', 'good'); }
  if (S.stage === 3) { S.y = NEST.y - 30; S.vy = -120; toast.say('حالا از لانه بپر', 'good'); }
  if (S.stage === 4) toast.say('برگرد سرِ لانه', 'good');
}

function collect() {
  S.got++;
  S.score += 20;
  if (S.score > S.best) S.best = S.score;
  sfx.pop();
  if (S.got >= ST().need) grow();
}

function finish() {
  S.won = true; S.winT = .001;
  S.score += 250;
  if (S.score > S.best) S.best = S.score;
  sfx.win();
  bits.confetti(NEST.x, NEST.y, 34, [P.egg, P.gold, P.card, P.leafLt]);
}

/* ───────── ورودی ───────── */

const BTN_GO = { x: SCENE_W / 2 - 150, y: 494, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 500, w: 300, h: 68 };
const TUT_TAP = [0, 1, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.aim) { S.aim.x = p.x; S.aim.y = p.y; return; }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startGame(); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.score = 0; resetGame(); sfx.tap(); }
    return;
  }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (S.winT) return;
  if (S.stage === 0) {
    S.got++; S.wig = 1;
    sfx.tick();
    bits.spark(S.x, S.y, 4, [P.egg, P.card]);
    if (S.got >= ST().need) grow();
    return;
  }
  if (S.stage === 1) {
    /* دهان را باز کن */
    S.gape = .9;
    if (momHere() && !S.mom.given) {
      S.mom.given = 'me';
      collect();
      bits.spark(S.x, S.y - 18, 8, [P.worm, P.beak]);
    } else if (!momHere()) {
      sfx.tick();
    }
    return;
  }
  S.aim = { x: p.x, y: p.y };
  try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
});

function release() { S.aim = null; }
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

/* ───────── حرکت ───────── */

function flapStep(dt) {
  if (S.stage === 2) {
    /* تمرینِ بال، همان‌جا روی لانه */
    if (S.aim) {
      S.lift = Math.min(1, S.lift + dt * 1.9);
      S.flapT += dt;
      if (S.flapT >= 1.2) { S.flapT = 0; collect(); }
    } else {
      S.lift = Math.max(0, S.lift - dt * 2.4);
      S.flapT = Math.max(0, S.flapT - dt * .8);
    }
    S.x = NEST.x + Math.sin(S.t * 9) * 5 * S.lift;
    S.y = NEST.y - 6 - S.lift * 62 + Math.sin(S.t * 13) * 4 * S.lift;
    return;
  }
  /* پرواز */
  if (S.aim) {
    const dx = S.aim.x - S.x, dy = S.aim.y - S.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    S.vx += dx / d * FLAP * dt;
    S.vy += dy / d * FLAP * dt;
    S.flapT += dt;
  } else S.flapT = 0;
  S.vy += GRAV * dt;
  const k = Math.exp(-1.7 * dt);
  S.vx *= k; S.vy *= k;
  const v = Math.hypot(S.vx, S.vy);
  const MX = 430;
  if (v > MX) { S.vx = S.vx / v * MX; S.vy = S.vy / v * MX; }
  S.x += S.vx * dt; S.y += S.vy * dt;
  S.ang = clamp(S.vy / 700, -.5, .5) + (S.vx < 0 ? 0 : 0);
  S.x = clamp(S.x, 40, SCENE_W - 40);
  if (S.y < HUD_H + 30) { S.y = HUD_H + 30; S.vy = Math.abs(S.vy) * .3; }
  /* نشستن روی شاخه */
  const list = S.stage === 4 ? [{ x: NEST.x, y: NEST.y - 6, nest: true }] : PERCH;
  for (let i = 0; i < list.length; i++) {
    const q = list[i];
    if (Math.hypot(q.x - S.x, q.y - S.y) > 44) continue;
    if (q.nest) { finish(); return; }
    if (S.done[i]) { S.perched = i; continue; }
    S.done[i] = true;
    S.perched = i;
    S.x = q.x; S.y = q.y - 4; S.vx = 0; S.vy = 0;
    bits.confetti(q.x, q.y, 14, [P.leafLt, P.gold, P.card]);
    collect();
    return;
  }
  /* زمین: گربه آنجاست */
  if (S.y > GROUND - 46) {
    S.y = GROUND - 46;
    if (S.hurt <= 0) {
      S.hurt = 1.8; S.shake = .24;
      S.cat.pounce = 1;
      sfx.nope();
      toast.say('گربه!', 'bad');
      const back = S.perched >= 0 ? PERCH[S.perched] : { x: NEST.x, y: NEST.y - 20 };
      S.x = back.x; S.y = back.y - 30; S.vx = 0; S.vy = -160;
      /* شاخه‌های رفته پس گرفته نمی‌شوند، فقط امتیاز کم می‌شود */
      S.score = Math.max(0, S.score - 30);
    }
  }
}

/* ───────── مادر ───────── */

function stepMom(dt) {
  if (S.stage !== 1) { S.mom = null; return; }
  if (S.mom) {
    S.mom.t += dt;
    const m = S.mom;
    if (m.t > .75 + FEED_WIN && !m.given) {
      /* لقمه به جوجهٔ بغلی رسید */
      m.given = 'sib';
      const i = Math.floor(Math.random() * S.sib.length);
      S.sib[i].g = 1;
      sfx.nope();
      toast.say('لقمه به جوجهٔ بغلی رسید', 'bad');
    }
    if (m.t > 2.6) { S.mom = null; S.momT = 1.4 + Math.random() * 1.6; }
    return;
  }
  S.momT -= dt;
  if (S.momT <= 0) { S.mom = { t: 0, given: null, side: Math.random() < .5 ? -1 : 1 }; sfx.slide(); }
}

function stepCat(dt) {
  const c = S.cat;
  if (c.pounce > 0) { c.pounce -= dt; return; }
  if (!canFly()) return;
  const want = clamp(S.x, 380, 980);
  c.x += clamp(want - c.x, -70 * dt, 70 * dt) * 1.6;
  c.dir = want > c.x ? 1 : -1;
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.hurt > 0) S.hurt -= dt;
  if (S.tut.on) S.tut.t += dt;
  if (S.wig > 0) S.wig = Math.max(0, S.wig - dt * 2);
  if (S.gape > 0) S.gape = Math.max(0, S.gape - dt * 1.4);
  for (const b of S.sib) if (b.g > 0) b.g = Math.max(0, b.g - dt * .5);

  if (S.phase === 'play' && !S.winT) {
    if (S.stage === 0) { /* تخم */ }
    else if (S.stage === 1) stepMom(dt);
    else flapStep(dt);
    stepCat(dt);
  }
  if (S.winT) {
    S.winT += dt;
    if (S.winT > 2.8) { S.winT = 0; S.phase = 'won'; S.phaseT = 0; }
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { resetGame(); runLoop(step); });

/* ───────── ابزارِ نقاشی ───────── */

function rrPath(x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function numText(str, x, y, o = {}) {
  ctx.save();
  ctx.direction = 'ltr';
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = o.color || P.ink;
  ctx.font = `${o.weight || 700} ${o.size || 18}px "${o.family || 'Vazirmatn'}", Tahoma, sans-serif`;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(shapes, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const s of shapes) { ctx.moveTo(s.x + s.r, s.y); ctx.arc(s.x, s.y, s.r, 0, TAU, true); }
  ctx.fillStyle = `rgba(24, 22, 12, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 244, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '30, 26, 12');
  ctx.fillStyle = P.leaf;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: P.inkSoft }); yy += 30; }
  return h + 20;
}

/* ───────── باغ ───────── */

function paintYardStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, P.skyLo); g.addColorStop(.65, P.sky); g.addColorStop(1, '#eef6e6');
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, GROUND);
  ctx.fillStyle = 'rgba(255, 244, 196, .8)';
  ctx.beginPath(); ctx.arc(620, 120, 44, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255, 248, 214, .3)';
  ctx.beginPath(); ctx.arc(620, 120, 78, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  for (const q of [[190, 120, 76], [330, 96, 48], [860, 150, 64], [1010, 112, 44]]) {
    ctx.beginPath(); ctx.ellipse(q[0], q[1], q[2], q[2] * .48, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = P.farLo;
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  for (let x = 0; x <= SCENE_W; x += 20) ctx.lineTo(x, 596 + Math.sin(x * .007) * 34);
  ctx.lineTo(SCENE_W, GROUND); ctx.fill();
  ctx.fillStyle = P.far;
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  for (let x = 0; x <= SCENE_W; x += 20) ctx.lineTo(x, 646 + Math.sin(x * .011 + 2) * 20);
  ctx.lineTo(SCENE_W, GROUND); ctx.fill();
  const sg = ctx.createLinearGradient(0, GROUND, 0, SCENE_H);
  sg.addColorStop(0, P.ground); sg.addColorStop(1, P.groundLo);
  ctx.fillStyle = sg; ctx.fillRect(0, GROUND, SCENE_W, SCENE_H - GROUND);
  for (const b of [[480, 706, 66], [860, 712, 54], [1130, 708, 60], [90, 710, 58]]) {
    ctx.fillStyle = '#4f8f3e';
    ctx.beginPath(); ctx.ellipse(b[0], b[1], b[2], b[2] * .56, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = '#63a850';
    for (let i = 0; i < 4; i++) {
      const A = Math.PI + .34 + i * .78;
      ctx.beginPath();
      ctx.arc(b[0] + Math.cos(A) * b[2] * .56, b[1] + Math.sin(A) * b[2] * .36, b[2] * .3, 0, TAU);
      ctx.fill();
    }
  }
  ctx.strokeStyle = '#5f8f44'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 80; i++) {
    const x = noise1(i * 3.7) * SCENE_W;
    ctx.beginPath(); ctx.moveTo(x, GROUND + 6);
    ctx.quadraticCurveTo(x + 6, GROUND - 12, x + (i % 2 ? 13 : -13), GROUND - 24 - noise1(i) * 12);
    ctx.stroke();
  }
}

function taper(x0, y0, x1, y1, w0, w1, cx, cy) {
  ctx.beginPath();
  const px = cx === undefined ? (x0 + x1) / 2 : cx;
  const py = cy === undefined ? (y0 + y1) / 2 : cy;
  const N = 18;
  const pt = (t) => ({
    x: (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * px + t * t * x1,
    y: (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * py + t * t * y1,
  });
  const side = (sgn) => {
    for (let i = 0; i <= N; i++) {
      const t = sgn > 0 ? i / N : 1 - i / N;
      const a = pt(Math.max(0, t - .02)), b = pt(Math.min(1, t + .02));
      const dx = b.x - a.x, dy = b.y - a.y, dl = Math.max(.001, Math.hypot(dx, dy));
      const w = lerp(w0, w1, t) * sgn;
      const q = pt(t);
      const X = q.x + (dy / dl) * w, Y = q.y - (dx / dl) * w;
      (i === 0 && sgn > 0) ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
    }
  };
  side(1); side(-1);
  ctx.closePath();
}

function drawTrees() {
  /* برگ‌های پشت */
  for (const l of LEAFY) {
    ctx.fillStyle = P.leafDk;
    wobbleCircle(l.x, l.y, l.r, l.x * .1, 6); ctx.fill();
  }
  for (const t of TRUNK) {
    withShadow(16, 8, .28, () => {
      ctx.fillStyle = P.bark;
      taper(t.x0, t.y0, t.x1, t.y1, t.w0, t.w1, t.x0 - 26, (t.y0 + t.y1) / 2);
      ctx.fill();
    }, '40, 30, 16');
    ctx.save();
    taper(t.x0, t.y0, t.x1, t.y1, t.w0, t.w1, t.x0 - 26, (t.y0 + t.y1) / 2);
    ctx.clip();
    ctx.strokeStyle = P.barkLo; ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(t.x0 - 20 + i * 9, t.y0);
      ctx.quadraticCurveTo(t.x0 - 34 + i * 9, (t.y0 + t.y1) / 2, t.x1 - 14 + i * 5, t.y1);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fillRect(t.x0 - t.w0, t.y1, t.w0 * .5, t.y0 - t.y1);
    ctx.restore();
  }
  for (const b of BRANCH) {
    const t = TRUNK[b.from];
    const u = clamp((t.y0 - b.y) / (t.y0 - t.y1), 0, 1);
    const bx = lerp(t.x0, t.x1, u), by = b.y + 40;
    const cx = (bx + b.x) / 2, cy = by - 54;
    ctx.fillStyle = P.bark;
    taper(bx, by, b.x, b.y, 14, 5, cx, cy);
    ctx.fill();
    ctx.fillStyle = P.barkLt;
    ctx.save();
    taper(bx, by, b.x, b.y, 14, 5, cx, cy);
    ctx.clip();
    ctx.globalAlpha = .3;
    ctx.fillRect(bx - 200, by - 40, 500, 8);
    ctx.restore();
    /* برگ‌های روی شاخه، دو طرف و نامنظم */
    for (let i = 0; i < 9; i++) {
      const u2 = .22 + i * .088;
      const t2 = u2;
      const px2 = (1 - t2) * (1 - t2) * bx + 2 * (1 - t2) * t2 * cx + t2 * t2 * b.x;
      const py2 = (1 - t2) * (1 - t2) * by + 2 * (1 - t2) * t2 * cy + t2 * t2 * b.y;
      const sd = i % 2 ? 1 : -1;
      ctx.fillStyle = i % 3 ? P.leaf : P.leafLt;
      ctx.save();
      ctx.translate(px2 + noise1(i * 2.3) * 10 - 5, py2 + sd * 13);
      ctx.rotate(Math.sin(S.t * 1.2 + i) * .12 + sd * .55 + noise1(i) * .4);
      ctx.beginPath(); ctx.ellipse(0, 0, 22, 10, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = P.leafDk; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.stroke();
      ctx.restore();
    }
  }
  /* برگ‌های جلو */
  for (const l of LEAFY) {
    ctx.fillStyle = P.leaf;
    wobbleCircle(l.x - l.r * .12, l.y - l.r * .14, l.r * .82, l.x * .2, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    wobbleCircle(l.x - l.r * .3, l.y - l.r * .34, l.r * .4, l.x * .3, 5); ctx.fill();
  }
}

function drawNest() {
  const x = NEST.x, y = NEST.y;
  withShadow(14, 7, .3, () => {
    ctx.fillStyle = P.nestDk;
    ctx.beginPath(); ctx.ellipse(x, y + 22, 92, 34, 0, 0, TAU); ctx.fill();
  }, '40, 30, 16');
  ctx.fillStyle = P.nest;
  ctx.beginPath(); ctx.ellipse(x, y + 14, 92, 36, 0, Math.PI, TAU); ctx.fill();
  ctx.fillStyle = P.nestDk;
  ctx.beginPath(); ctx.ellipse(x, y + 6, 70, 18, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.nestLt; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const a = noise1(i * 3.1) * TAU;
    const rx = 60 + noise1(i * 1.7) * 44;
    const x0 = x + Math.cos(a) * rx, y0 = y + 12 + Math.sin(a) * rx * .34;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + Math.cos(a + 1.5) * 34, y0 + Math.sin(a + 1.5) * 11);
    ctx.stroke();
  }
}

function drawEggInNest() {
  const w = S.wig * Math.sin(S.t * 40) * 3;
  for (let i = -1; i <= 1; i++) {
    const me = i === 0;
    const x = NEST.x + i * 34 + (me ? w : 0), y = NEST.y - 2 + Math.abs(i) * 4;
    ctx.fillStyle = ball(x, y, 22, '#f7f0dc', P.egg, '#bfae8c');
    ctx.beginPath(); ctx.ellipse(x, y, me ? 22 : 19, me ? 27 : 24, i * .12, 0, TAU); ctx.fill();
    ctx.fillStyle = P.eggDot;
    ctx.globalAlpha = .5;
    for (let k = 0; k < 7; k++) {
      const a = k * 2.3 + i;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 11, y + Math.sin(a) * 15, 2.4, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (me && S.got > 0) {
      ctx.strokeStyle = P.barkLo; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 16, y - 6);
      for (let k = 1; k <= Math.min(6, S.got + 1); k++) {
        ctx.lineTo(x - 16 + k * 5.6, y - 6 + (k % 2 ? 7 : -5));
      }
      ctx.stroke();
    }
  }
}

/* ───────── جوجه و پرنده ───────── */

function chickArt(gape, downy) {
  /* بدنِ لخت با کرکِ کم؛ سر بزرگ و چشمِ بسته */
  ctx.fillStyle = ball(0, -6, 26, P.chickLt, P.chick, P.chickDk);
  ctx.beginPath(); ctx.ellipse(0, 4, 22, 19, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-2, -22, 18, 16, 0, 0, TAU); ctx.fill();
  /* بالِ کوچکِ بی‌پر */
  ctx.fillStyle = P.chickDk;
  ctx.beginPath(); ctx.ellipse(16, 6, 10, 6, .6, 0, TAU); ctx.fill();
  if (downy) {
    ctx.strokeStyle = P.down; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const a = -2.6 + i * .32;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 16, -22 + Math.sin(a) * 14);
      ctx.lineTo(Math.cos(a) * 26, -22 + Math.sin(a) * 24);
      ctx.stroke();
    }
  }
  /* چشمِ بسته */
  ctx.strokeStyle = P.chickDk; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(-10, -24, 6, .3, 2.6); ctx.stroke();
  /* منقارِ باز */
  const g = clamp(gape, 0, 1);
  ctx.fillStyle = P.beak;
  ctx.beginPath();
  ctx.moveTo(-14, -20);
  ctx.lineTo(-34, -24 - g * 10);
  ctx.lineTo(-14, -16);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c8503f';
  ctx.beginPath();
  ctx.moveTo(-14, -18);
  ctx.lineTo(-34, -14 + g * 12);
  ctx.lineTo(-14, -12);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.beak;
  ctx.beginPath();
  ctx.moveTo(-14, -16);
  ctx.lineTo(-34, -12 + g * 14);
  ctx.lineTo(-14, -10);
  ctx.closePath(); ctx.fill();
}

function birdArt(L, flap, o = {}) {
  const b = o.body || P.bird, lt = o.light || P.birdLt, dk = o.dark || P.birdDk;
  /* بالِ دور */
  ctx.fillStyle = dk;
  ctx.beginPath();
  ctx.moveTo(4, -4);
  ctx.quadraticCurveTo(L * .5, -L * .5 * flap, L * 1.15, -L * .18 * flap);
  ctx.quadraticCurveTo(L * .45, L * .12, 4, -4);
  ctx.fill();
  /* دُم */
  ctx.fillStyle = dk;
  ctx.beginPath();
  ctx.moveTo(L * .5, 2); ctx.lineTo(L * 1.25, -L * .2); ctx.lineTo(L * 1.3, L * .16);
  ctx.closePath(); ctx.fill();
  /* بدن */
  ctx.fillStyle = ball(0, -L * .25, L, lt, b, dk);
  ctx.beginPath(); ctx.ellipse(0, 0, L * .78, L * .56, .06, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f2e8d6';
  ctx.beginPath(); ctx.ellipse(-L * .1, L * .22, L * .5, L * .3, .06, 0, TAU); ctx.fill();
  /* سر */
  ctx.fillStyle = ball(-L * .5, -L * .5, L * .45, lt, b, dk);
  ctx.beginPath(); ctx.arc(-L * .58, -L * .38, L * .4, 0, TAU); ctx.fill();
  ctx.fillStyle = P.bib;
  ctx.beginPath(); ctx.ellipse(-L * .66, -L * .18, L * .18, L * .13, .3, 0, TAU); ctx.fill();
  /* منقار */
  ctx.fillStyle = P.beak;
  ctx.beginPath();
  ctx.moveTo(-L * .9, -L * .44);
  ctx.lineTo(-L * 1.28, -L * .34);
  ctx.lineTo(-L * .9, -L * .24);
  ctx.closePath(); ctx.fill();
  if (o.worm) {
    ctx.strokeStyle = P.worm; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-L * 1.2, -L * .3);
    ctx.quadraticCurveTo(-L * 1.5, -L * .1 + Math.sin(S.t * 8) * 4, -L * 1.2, L * .12);
    ctx.stroke();
  }
  /* چشم */
  ctx.fillStyle = '#fdfaf2';
  ctx.beginPath(); ctx.arc(-L * .72, -L * .52, L * .12, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1e1a12';
  ctx.beginPath(); ctx.arc(-L * .74, -L * .52, L * .07, 0, TAU); ctx.fill();
  /* پا */
  if (o.legs) {
    ctx.strokeStyle = P.beak; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-L * .1 + sd * L * .16, L * .5);
      ctx.lineTo(-L * .1 + sd * L * .16, L * .82);
      ctx.moveTo(-L * .1 + sd * L * .16, L * .82);
      ctx.lineTo(-L * .3 + sd * L * .16, L * .92);
      ctx.moveTo(-L * .1 + sd * L * .16, L * .82);
      ctx.lineTo(L * .08 + sd * L * .16, L * .92);
      ctx.stroke();
    }
  }
  /* بالِ نزدیک */
  ctx.fillStyle = lt;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.quadraticCurveTo(L * .45, -L * .85 * flap, L * 1.05, -L * .5 * flap);
  ctx.quadraticCurveTo(L * .4, L * .06, 0, -6);
  ctx.fill();
  ctx.strokeStyle = dk; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.quadraticCurveTo(L * .45, -L * .85 * flap, L * 1.05, -L * .5 * flap);
  ctx.stroke();
}

function drawSibs() {
  if (S.stage > 1) return;
  for (let i = 0; i < S.sib.length; i++) {
    const x = NEST.x + (i ? 46 : -46), y = NEST.y - 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(i ? -.86 : .86, .86);
    chickArt(S.sib[i].g * .9 + (momHere() ? .5 : 0), true);
    ctx.restore();
  }
}

function drawHero() {
  ctx.save();
  if (S.hurt > 0) ctx.globalAlpha = .5 + .5 * Math.sin(S.t * 28);
  ctx.translate(S.x, S.y);
  if (S.stage === 1) {
    ctx.scale(1.05, 1.05);
    chickArt(S.gape, true);
  } else if (S.stage === 2) {
    const fl = .35 + .65 * Math.abs(Math.sin(S.t * 12));
    ctx.rotate(Math.sin(S.t * 9) * .05 * S.lift);
    birdArt(26, S.lift > .05 ? fl : .25, { legs: true });
  } else {
    ctx.rotate(S.ang);
    if (S.vx < -6) ctx.scale(1, 1);
    const fl = S.flapT > 0 ? .3 + .7 * Math.abs(Math.sin(S.t * 15)) : .5;
    birdArt(28, fl, { legs: S.vy > -20 });
  }
  ctx.restore();
}

function drawMom() {
  if (!S.mom) return;
  const m = S.mom;
  const u = clamp(m.t / .75, 0, 1);
  const away = m.t > .75 + FEED_WIN ? clamp((m.t - .75 - FEED_WIN) / .8, 0, 1) : 0;
  const fromX = m.side > 0 ? SCENE_W + 120 : -120;
  const x = away > 0 ? lerp(NEST.x, fromX, easeIn(away)) : lerp(fromX, NEST.x, easeOut(u));
  const y = NEST.y - 96 + Math.sin(S.t * 4) * 6;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(m.side > 0 ? -1 : 1, 1);
  const fl = .25 + .75 * Math.abs(Math.sin(S.t * 13));
  birdArt(34, fl, { worm: !m.given, legs: false });
  ctx.restore();
  if (momHere() && !m.given) {
    ctx.save();
    ctx.globalAlpha = .5 + .4 * Math.sin(S.t * 9);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(NEST.x, NEST.y - 24, 62 + Math.sin(S.t * 9) * 5, 0, TAU); ctx.stroke();
    ctx.restore();
  }
}

function drawCat() {
  const c = S.cat;
  const y = GROUND - 6 - (c.pounce > 0 ? Math.sin(clamp(c.pounce, 0, 1) * Math.PI) * 90 : 0);
  ctx.save();
  ctx.translate(c.x, y);
  ctx.scale(c.dir >= 0 ? -1 : 1, 1);
  ctx.fillStyle = 'rgba(30, 40, 20, .25)';
  ctx.beginPath(); ctx.ellipse(0, 6, 56, 10, 0, 0, TAU); ctx.fill();
  /* دُم */
  ctx.strokeStyle = P.cat; ctx.lineWidth = 11; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(44, -26);
  ctx.quadraticCurveTo(80, -34, 74, -74 + Math.sin(S.t * 2.2) * 10);
  ctx.stroke();
  ctx.fillStyle = ball(0, -46, 52, P.catLt, P.cat, '#3a3a44');
  ctx.beginPath(); ctx.ellipse(4, -34, 50, 26, -.05, 0, TAU); ctx.fill();
  ctx.fillStyle = P.cat;
  for (const x of [-28, 30]) ctx.fillRect(x - 6, -22, 13, 24);
  ctx.beginPath(); ctx.ellipse(-46, -56, 26, 23, 0, 0, TAU); ctx.fill();
  for (const sd of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(-46 + sd * 12, -72); ctx.lineTo(-52 + sd * 20, -98);
    ctx.lineTo(-32 + sd * 14, -84); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = P.catEye;
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(-56 + sd * 10, -60, 6, 8, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = '#20202a';
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(-56 + sd * 10, -60, 2, 7, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = '#d0787f';
  ctx.beginPath();
  ctx.moveTo(-70, -52); ctx.lineTo(-62, -52); ctx.lineTo(-66, -46); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.6;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(-68, -48); ctx.lineTo(-100, -56 + i * 9); ctx.stroke();
  }
  ctx.restore();
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = 'rgba(38, 44, 26, .82)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(229, 179, 68, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(ST().n, SCENE_W - 120, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  const need = ST().need;
  for (let k = 0; k < need; k++) {
    const x = SCENE_W - 250 - k * 26;
    ctx.fillStyle = k < S.got ? P.gold : 'rgba(255,255,255,.2)';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, 8, 0, TAU); ctx.fill();
  }
  numText(fa(S.score), 120, HUD_H / 2, { size: 22, color: P.gold });
  text('امتیاز', 192, HUD_H / 2, { size: 16, color: 'rgba(255,255,255,.7)' });
  for (let k = 0; k < STAGES.length; k++) {
    const x = 320 + k * 42;
    ctx.fillStyle = k < S.stage ? P.leafLt : k === S.stage ? P.gold : 'rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, k === S.stage ? 9 : 6, 0, TAU); ctx.fill();
    if (k) {
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 34, HUD_H / 2); ctx.lineTo(x - 12, HUD_H / 2); ctx.stroke();
    }
  }
  /* نوارِ قوّتِ بال */
  if (S.stage === 2) {
    const bx = 560, bw = 240;
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    ctx.beginPath(); rrPath(bx, HUD_H / 2 - 7, bw, 14, 7); ctx.fill();
    ctx.fillStyle = P.accent;
    ctx.beginPath(); rrPath(bx, HUD_H / 2 - 7, bw * clamp(S.flapT / 1.2, 0, 1), 14, 7); ctx.fill();
  }
}

function drawTargets() {
  if (S.stage !== 3 && S.stage !== 4) return;
  if (S.stage === 4) {
    const k = .5 + .5 * Math.sin(S.t * 3);
    ctx.save();
    ctx.globalAlpha = .35 + k * .4;
    ctx.strokeStyle = P.gold; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(NEST.x, NEST.y - 4, 66 + k * 10, 0, TAU); ctx.stroke();
    ctx.restore();
    return;
  }
  for (let i = 0; i < PERCH.length; i++) {
    const q = PERCH[i];
    const k = .5 + .5 * Math.sin(S.t * 3 + i);
    ctx.save();
    ctx.globalAlpha = S.done[i] ? .3 : .35 + k * .45;
    ctx.strokeStyle = S.done[i] ? P.good : P.gold;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(q.x, q.y - 4, 34 + (S.done[i] ? 0 : k * 8), 0, TAU); ctx.stroke();
    ctx.restore();
  }
}

function drawAim() {
  if (!S.aim || S.tut.on || S.stage < 3) return;
  ctx.save();
  ctx.globalAlpha = .45;
  ctx.strokeStyle = P.card; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.arc(S.aim.x, S.aim.y, 16 + Math.sin(S.t * 7) * 3, 0, TAU); ctx.stroke();
  ctx.restore();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: NEST.x, y: NEST.y, r: 130 }], .68);
    const h = tutCard(420, 430, 520, ['اینجا لانه است و یکی از این تخم‌ها تویی.'], 'از تخم تا پرنده');
    tutMore(680, 430 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: NEST.x, y: NEST.y, r: 130 }], .66);
    const h = tutCard(420, 430, 520, ['چند بار روی صفحه بزن', 'تا پوسته بشکند.']);
    tutMore(680, 430 + h + 8, S.t, P.ink);
  } else {
    spot([{ x: NEST.x, y: NEST.y - 60, r: 170 }], .62);
    const h = tutCard(420, 452, 540,
      ['بعد وقتی مادر سرِ لانه رسید، بزن', 'تا دهانت باز شود و لقمه به تو برسد.']);
    tutMore(690, 452 + h + 8, S.t, P.ink);
  }
}

function birdIcon(x, y) {
  ctx.save();
  ctx.translate(x + 8, y); ctx.scale(.66, .66);
  birdArt(30, .8, { legs: true });
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 900, h: 330, y: 128,
    paper: P.paper, band: P.leaf, ink: P.ink, inkSoft: P.inkSoft,
    icon: birdIcon,
    title: 'از تخم تا پرنده',
    body: 'یک تخم در لانه است. اوّل جوجه‌ای می‌شوی که هنوز پَر ندارد\nو باید سرِ وقت دهانش را باز کند، بعد پَر درمی‌آوری،\nو آخر از لانه پرواز می‌کنی. پایین نرو — گربه آنجاست.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#4f9440', btnHotFill: '#65ab53',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 900, h: 330, y: 132,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: P.inkSoft,
    icon: birdIcon,
    title: 'چرخه بسته شد',
    body: 'تخم، جوجهٔ بی‌پر، جوجهٔ پَردار، پرنده — و باز هم تخم در لانه.\nهمان پرهایی که آخر درآوردی، همان‌هایی هستند که\nبدنت را گرم نگه می‌دارند و با آن‌ها پرواز می‌کنی.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#4f9440', btnHotFill: '#65ab53',
  });
}

/* ───────── قاب ───────── */

function draw() {
  beginScene(P.sky);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 47) * k * .5);
  }
  ctx.drawImage(staticLayer('yard', SCENE_W, SCENE_H, paintYardStatic), 0, 0, SCENE_W, SCENE_H);
  drawTrees();
  drawCat();
  drawNest();
  drawTargets();
  if (S.stage === 0) drawEggInNest();
  else { drawSibs(); drawHero(); }
  drawMom();
  drawAim();
  bits.draw();
  ctx.restore();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 560;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 52, w, 40, P.card, 91, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 32, { size: 17, color: P.ink });
    ctx.restore();
  }
  if (S.winT) {
    ctx.save();
    ctx.globalAlpha = clamp(S.winT / 1.2, 0, 1) * .45;
    ctx.fillStyle = '#fff8e0';
    ctx.fillRect(0, 0, SCENE_W, SCENE_H);
    ctx.restore();
  }
  endScene(.1, 'rgba(40, 40, 16, .3)', .3, .12);
}

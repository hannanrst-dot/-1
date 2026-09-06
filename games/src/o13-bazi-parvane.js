/*!
title: از تخم تا پروانه — چرخهٔ زندگی (بازی)
bg: #9fd0e0
*/

/* ═══════════════════════════════════════════════════════════════════════
   از تخم تا پروانه — چرخهٔ زندگیِ دگردیسیِ کامل

   چهار پردهٔ زندگیِ پروانه، همان‌طور که هست:

     تخم   — زیرِ برگ گذاشته می‌شود، نه رویش. (پناهِ باران و آفتاب)
     لارو  — از لبهٔ برگ می‌جَود، بزرگ می‌شود و چون پوستش کِش نمی‌آید
             آن را می‌اندازد. پرنده شکارچیِ اوست؛ لارو زیرِ برگ پنهان
             می‌شود، جایی که از بالا دیده نمی‌شود.
     شفیره — خودش را به بالای ساقه می‌بندد و در پیله می‌رود.
     پروانه — با خرطومش شهد می‌خورد و گردهٔ گل‌ها را جابه‌جا می‌کند،
             و آخر سر روی برگی تخم می‌گذارد و چرخه بسته می‌شود.

   بازی هیچ‌جا جواب نمی‌گوید: بچّه از سایهٔ پرنده یاد می‌گیرد که باید
   دور بزند و زیرِ برگ برود، و از جای تخمِ اوّل یاد می‌گیرد که تخم را
   کجا بگذارد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  sky: '#bfe3ef', skyLo: '#8ec7dc', sun: '#ffeeb4',
  hill: '#9cc78a', hillLo: '#7fb072',
  soil: '#6a4a2c', soilLo: '#4a3220',
  leaf: '#57a63c', leafLt: '#8ad257', leafDk: '#356b28', vein: '#2f5f22',
  stem: '#478d33', stemDk: '#2c5e20',
  cat: '#9ecf3f', catDk: '#5f9420', catLt: '#cbe97e', catFace: '#33511a',
  silk: '#f2ecd8', pupa: '#c2a04a', pupaLt: '#e6c87c',
  wing: '#e8823a', wingLt: '#ffc46a', wingDk: '#a5461c', wingIn: '#2a2018',
  petal: '#e86a9a', petalB: '#b878e8', petalC: '#f2a03a', core: '#f7d84a',
  bird: '#4a4a5c', birdLt: '#8189a0', shadow: 'rgba(20, 26, 34, .3)',
  paper: '#fbf7ec', card: '#ffffff',
  ink: '#2a2418', inkSoft: '#7d7460',
  good: '#5fb07f', bad: '#d3624a', gold: '#e5b344', accent: '#5fa8d8',
};

/* ───────── باغ ───────── */

const GROUND = 706;
const A0 = { x: 300, y: GROUND }, A1 = { x: 268, y: 430 }, A2 = { x: 344, y: 168 };

/** نقطه‌ای روی ساقه، v از پایین (۰) تا بالا (۱). */
function stemPt(v) {
  const k = 1 - v;
  return {
    x: k * k * A0.x + 2 * k * v * A1.x + v * v * A2.x,
    y: k * k * A0.y + 2 * k * v * A1.y + v * v * A2.y,
  };
}

const LEAVES = [
  { v: .16, side: 1, L: 178, W: 54, a: -.30 },
  { v: .31, side: -1, L: 190, W: 58, a: -.24 },
  { v: .46, side: 1, L: 172, W: 52, a: -.36 },
  { v: .60, side: -1, L: 164, W: 50, a: -.28 },
  { v: .73, side: 1, L: 152, W: 46, a: -.42 },
  { v: .85, side: -1, L: 140, W: 43, a: -.34 },
];

/* هندسهٔ هر برگ، یک‌بار حساب می‌شود */
const G = LEAVES.map((lf) => {
  const b = stemPt(lf.v);
  const ang = lf.side > 0 ? lf.a : Math.PI - lf.a;
  const d = { x: Math.cos(ang), y: Math.sin(ang) };
  let n = { x: d.y, y: -d.x };
  if (n.y > 0) { n.x = -n.x; n.y = -n.y; }
  return { b, d, n, L: lf.L, W: lf.W, ang, side: lf.side };
});

const FLOWERS = [
  { x: 742, y: 452, r: 40, c: P.petal },
  { x: 900, y: 560, r: 44, c: P.petalB },
  { x: 1046, y: 430, r: 42, c: P.petalC },
  { x: 872, y: 322, r: 38, c: P.petal },
  { x: 1088, y: 616, r: 44, c: P.petalB },
];

const BIRD_T = 11;              /* هر چند ثانیه پرنده سر می‌زند */
const BIRD_WARN = 2.2;          /* سایه چند ثانیه پیش از او می‌آید */

/* مرحله‌های زندگی */
const STAGES = [
  { n: 'تخم', need: 5 },
  { n: 'لاروِ کوچک', need: 6 },
  { n: 'لاروِ بزرگ', need: 7 },
  { n: 'شفیره', need: 5 },
  { n: 'پروانه', need: 5 },
];

const S = {
  phase: 'intro', phaseT: 0,
  stage: 0, got: 0, score: 0, best: 0,
  where: { k: 'leaf', i: 2, s: 1.5 },   /* تخم زیرِ برگِ سوم */
  dir: 1, wig: 0,
  x: 0, y: 0, vx: 0, vy: 0, ang: 0,     /* برای پروانه */
  aim: null,
  bites: [], eaten: [[], [], [], [], [], []],
  moult: null, silk: 0, pupaT: 0,
  nectar: 0, drink: null, sip: 0, readyEgg: false, laid: 0,
  wind: 0, windT: 0,
  bird: BIRD_T, birdX: -200, birdRun: 0, birdLane: 0,
  hurt: 0,
  won: false, winT: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const ST = () => STAGES[Math.min(S.stage, STAGES.length - 1)];
function tip(msg) { S.tip = msg; S.tipT = 3.4; }
const isLarva = () => S.stage === 1 || S.stage === 2;
const isFly = () => S.stage >= 4;
const catR = () => (S.stage === 0 ? 9 : S.stage === 1 ? 15 : 20);

/* ───────── سطحِ برگ ───────── */

/** پهنای نیم‌برگ در t، با گازهای خورده‌شده. */
function wAt(i, t, side) {
  const g = G[i];
  let w = g.W * Math.pow(Math.sin(Math.PI * clamp(t, 0, 1)), .62) * (1 - .3 * t);
  for (const e of S.eaten[i]) {
    if (e.side !== side) continue;
    const dd = (t - e.t) / .11;
    w -= g.W * .72 * Math.exp(-dd * dd);
  }
  return Math.max(3, w);
}

/** نقطه‌ای روی لبهٔ برگ؛ s از ۰ (بُنِ رو) تا ۱ (نوک) تا ۲ (بُنِ زیر). */
function surfPt(i, s) {
  const g = G[i];
  const side = s <= 1 ? 1 : -1;
  const t = s <= 1 ? s : 2 - s;
  const w = wAt(i, t, side);
  return {
    x: g.b.x + g.d.x * t * g.L + g.n.x * w * side,
    y: g.b.y + g.d.y * t * g.L + g.n.y * w * side,
    side, t,
  };
}

/** جای بدن: u فاصله از سر، به واحدِ همان مسیر. */
function bodyPt(u) {
  const w = S.where;
  if (w.k === 'stem') {
    const v = clamp(w.v - S.dir * u * .035, .04, .96);
    const q = stemPt(v), q2 = stemPt(clamp(v + .01, 0, 1));
    const dx = q2.x - q.x, dy = q2.y - q.y, dl = Math.max(.001, Math.hypot(dx, dy));
    return { x: q.x + (dy / dl) * 12, y: q.y - (dx / dl) * 12 };
  }
  const s = clamp(w.s - S.dir * u * .055, 0, 2);
  const q = surfPt(w.i, s);
  const g = G[w.i];
  return { x: q.x + g.n.x * q.side * catR() * .8, y: q.y + g.n.y * q.side * catR() * .8 };
}

/** آیا از بالا دیده می‌شود؟ (زیرِ برگ امن است) */
const exposed = () => S.where.k === 'stem' || S.where.s <= 1;

function headPt() { return bodyPt(0); }

/* ───────── چیدنِ خوراک ───────── */

function spawnBite(n) {
  for (let k = 0; k < n; k++) {
    for (let tryN = 0; tryN < 30; tryN++) {
      const i = Math.floor(Math.random() * LEAVES.length);
      const s = .18 + Math.random() * 1.64;
      const near = S.bites.some((b) => b.i === i && Math.abs(b.s - s) < .3)
        || S.eaten[i].some((e) => Math.abs((e.side > 0 ? e.t : 2 - e.t) - s) < .3);
      if (near) continue;
      S.bites.push({ i, s, ph: Math.random() * TAU });
      break;
    }
  }
}

function resetGame() {
  S.stage = 0; S.got = 0;
  S.where = { k: 'leaf', i: 2, s: 1.5 };
  S.dir = 1; S.wig = 0; S.aim = null;
  S.bites.length = 0;
  S.eaten = [[], [], [], [], [], []];
  S.moult = null; S.silk = 0; S.pupaT = 0;
  S.nectar = 0; S.drink = null; S.sip = 0; S.readyEgg = false; S.laid = 0;
  S.wind = 0; S.windT = 2;
  S.bird = BIRD_T; S.birdRun = 0; S.birdX = -200;
  S.hurt = 0; S.won = false; S.winT = 0;
  for (const f of FLOWERS) f.done = false;
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
  const h = headPt();
  bits.confetti(h.x, h.y, 20, [P.catLt, P.leafLt, P.card]);
  if (S.stage === 1) {
    S.where = { k: 'leaf', i: 2, s: 1.5 };
    spawnBite(5);
    toast.say('لارو بیرون آمد', 'good');
  } else if (S.stage === 2) {
    /* پوست‌اندازی: پوستِ کهنه همان‌جا می‌ماند */
    const p = headPt();
    S.moult = { x: p.x, y: p.y, t: 0 };
    spawnBite(3);
    toast.say('پوست انداخت و بزرگ‌تر شد', 'good');
  } else if (S.stage === 3) {
    S.bites.length = 0;
    toast.say('برو بالای ساقه', 'good');
  } else if (S.stage === 4) {
    const q = stemPt(.95);
    S.x = q.x + 40; S.y = q.y + 10; S.vx = 60; S.vy = -20;
    toast.say('بال درآوردی — برو سراغِ گل‌ها', 'good');
  }
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
  bits.confetti(S.x, S.y, 36, [P.wingLt, P.gold, P.card, P.leafLt]);
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
    const h = headPt();
    bits.spark(h.x, h.y, 4, [P.silk, P.leafLt]);
    if (S.got >= ST().need) grow();
    return;
  }
  if (S.stage === 3) {
    /* بالای ساقه، تارِ ابریشم می‌تند */
    if (S.where.k === 'stem' && S.where.v > .88) {
      S.got++; S.silk = 1;
      sfx.tick();
      const h = headPt();
      bits.spark(h.x, h.y, 5, [P.silk, P.card]);
      if (S.got >= ST().need) { S.pupaT = .001; toast.say('پیله بسته شد', 'good'); }
      return;
    }
    S.aim = { x: p.x, y: p.y };
    try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
    return;
  }
  S.aim = { x: p.x, y: p.y };
  try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
});

function release() { S.aim = null; }
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

/* ───────── خزیدن روی گیاه ───────── */

const CRAWL = 1.05;             /* واحدِ s در ثانیه */
const CLIMB = .34;              /* واحدِ v در ثانیه */

/** نزدیک‌ترین جای گیاه به نقطهٔ هدف. */
function targetOf(aim) {
  let best = null, bd = 1e9;
  for (let i = 0; i < LEAVES.length; i++) {
    for (let k = 0; k <= 24; k++) {
      const sv = k / 12;
      const q = surfPt(i, sv);
      const d = Math.hypot(q.x - aim.x, q.y - aim.y);
      if (d < bd) { bd = d; best = { k: 'leaf', i, s: sv }; }
    }
  }
  for (let k = 0; k <= 28; k++) {
    const v = .04 + k / 28 * .92;
    const q = stemPt(v);
    const d = Math.hypot(q.x - aim.x, q.y - aim.y);
    if (d < bd) { bd = d; best = { k: 'stem', v }; }
  }
  return best;
}

function crawl(dt) {
  if (!S.aim) return;
  const tg = targetOf(S.aim);
  const w = S.where;
  if (w.k === 'leaf') {
    if (tg.k === 'leaf' && tg.i === w.i) {
      const d = tg.s - w.s;
      if (Math.abs(d) < .025) return;
      S.dir = Math.sign(d);
      w.s = clamp(w.s + S.dir * CRAWL * dt, 0, 2);
      return;
    }
    /* برو به بُنِ برگ و از آنجا روی ساقه */
    const goal = w.s <= 1 ? 0 : 2;
    S.dir = goal === 0 ? -1 : 1;
    w.s += S.dir * CRAWL * dt;
    if (w.s <= 0 || w.s >= 2) { S.where = { k: 'stem', v: LEAVES[w.i].v }; S.dir = 1; }
    return;
  }
  /* روی ساقه */
  const goalV = tg.k === 'stem' ? tg.v : LEAVES[tg.i].v;
  const d = goalV - w.v;
  if (Math.abs(d) > .012) {
    S.dir = Math.sign(d);
    w.v = clamp(w.v + S.dir * CLIMB * dt, .04, .96);
  }
  if (tg.k === 'leaf' && Math.abs(w.v - LEAVES[tg.i].v) <= .022) {
    S.where = { k: 'leaf', i: tg.i, s: tg.s <= 1 ? .03 : 1.97 };
    S.dir = tg.s <= 1 ? 1 : -1;
  }
}

/* ───────── پرواز ───────── */

const FLY_SP = 300;

function flyStep(dt) {
  if (S.aim) {
    const dx = S.aim.x - S.x, dy = S.aim.y - S.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    S.vx += dx / d * FLY_SP * 2.4 * dt;
    S.vy += dy / d * FLY_SP * 2.4 * dt;
  }
  S.vx += S.wind * dt;
  S.vy += 26 * dt;                       /* کمی سنگینی */
  const k = Math.exp(-1.9 * dt);
  S.vx *= k; S.vy *= k;
  const sp = Math.hypot(S.vx, S.vy);
  if (sp > FLY_SP) { S.vx = S.vx / sp * FLY_SP; S.vy = S.vy / sp * FLY_SP; }
  S.x += S.vx * dt; S.y += S.vy * dt;
  if (sp > 14) S.ang = Math.atan2(S.vy, S.vx);
  S.x = clamp(S.x, 40, SCENE_W - 40);
  S.y = clamp(S.y, HUD_H + 30, GROUND - 24);
  /* شهد خوردن */
  if (S.drink) {
    S.drink.t += dt;
    if (S.drink.t > 1.3) {
      const f = FLOWERS[S.drink.i];
      f.done = true;
      bits.confetti(f.x, f.y, 14, [P.core, P.card, f.c]);
      S.drink = null;
      S.nectar++;
      S.got = S.nectar;
      S.score += 30;
      if (S.score > S.best) S.best = S.score;
      sfx.pop();
      if (S.nectar >= ST().need && !S.readyEgg) {
        S.readyEgg = true;
        toast.say('حالا زیرِ یک برگ تخم بگذار', 'good');
      }
    }
    return;
  }
  if (!S.readyEgg) {
    for (let i = 0; i < FLOWERS.length; i++) {
      const f = FLOWERS[i];
      if (f.done) continue;
      if (Math.hypot(f.x - S.x, f.y - S.y) > f.r + 18) continue;
      S.drink = { i, t: 0 };
      sfx.slide();
      break;
    }
    return;
  }
  /* تخم‌گذاری زیرِ برگ */
  for (let i = 0; i < LEAVES.length; i++) {
    let bs = -1, bd = 1e9;
    for (let k = 22; k <= 38; k++) {
      const q = surfPt(i, k / 20);
      const d = Math.hypot(q.x - S.x, q.y - S.y);
      if (d < bd) { bd = d; bs = k / 20; }
    }
    if (bd < 34) {
      S.laid = 1;
      S.where = { k: 'leaf', i, s: bs };
      finish();
      return;
    }
  }
}

/* ───────── پرنده ───────── */

function stepBird(dt) {
  if (!isLarva()) return;
  if (S.birdRun > 0) {
    S.birdRun -= dt;
    S.birdX += 620 * dt;
    if (S.birdRun <= 0) S.bird = BIRD_T;
    return;
  }
  S.bird -= dt;
  if (S.bird <= 0) {
    S.birdRun = 2.4;
    S.birdX = -180;
    S.birdLane = headPt().y;
    sfx.nope();
  }
}

function birdHit() {
  const h = headPt();
  if (Math.abs(S.birdX - h.x) > 46) return;
  if (!exposed()) return;                /* زیرِ برگ امن است */
  if (S.hurt > 0) return;
  S.hurt = 1.6; S.shake = .22;
  sfx.nope();
  if (S.got > 0) { S.got--; S.score = Math.max(0, S.score - 20); }
  toast.say('پرنده!', 'bad');
  /* از ترس به بُنِ برگ می‌خزد */
  if (S.where.k === 'leaf') S.where.s = S.where.s > 1 ? 1.92 : .08;
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
  if (S.silk > 0) S.silk = Math.max(0, S.silk - dt * 2);
  if (S.moult) { S.moult.t += dt; if (S.moult.t > 9) S.moult = null; }

  if (S.phase === 'play' && !S.winT) {
    if (S.pupaT > 0) {
      S.pupaT += dt;
      if (S.pupaT > 6) { S.pupaT = 0; grow(); }
    } else if (S.stage === 0) {
      /* تخم فقط تکان می‌خورد */
    } else if (isFly()) {
      S.windT -= dt;
      if (S.windT <= 0) { S.windT = 3 + Math.random() * 3; S.wind = (Math.random() * 2 - 1) * 190; }
      flyStep(dt);
    } else {
      crawl(dt);
      stepBird(dt);
      if (S.birdRun > 0) birdHit();
      /* گاز زدنِ برگ */
      if (isLarva() && S.where.k === 'leaf') {
        const w = S.where;
        for (let i = 0; i < S.bites.length; i++) {
          const b = S.bites[i];
          if (b.i !== w.i || Math.abs(b.s - w.s) > .1) continue;
          S.bites.splice(i, 1);
          const q = surfPt(b.i, b.s);
          S.eaten[b.i].push({ t: q.t, side: q.side });
          bits.spark(q.x, q.y, 7, [P.leafLt, P.catLt]);
          const before = S.stage;
          collect();
          if (S.stage === before && isLarva()) spawnBite(1);
          break;
        }
      }
    }
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
  ctx.fillStyle = `rgba(16, 26, 14, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 244, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '20, 40, 16');
  ctx.fillStyle = P.leaf;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: P.inkSoft }); yy += 30; }
  return h + 20;
}

/* ───────── باغ ───────── */

function paintGardenStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, P.skyLo); g.addColorStop(.6, P.sky); g.addColorStop(1, '#e4f2e0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, GROUND);
  ctx.fillStyle = 'rgba(255, 238, 180, .75)';
  ctx.beginPath(); ctx.arc(1050, 130, 54, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255, 244, 205, .3)';
  ctx.beginPath(); ctx.arc(1050, 130, 92, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  for (const q of [[210, 150, 70], [340, 122, 46], [700, 178, 58], [820, 150, 40]]) {
    ctx.beginPath(); ctx.ellipse(q[0], q[1], q[2], q[2] * .5, 0, 0, TAU); ctx.fill();
  }
  /* تپه‌های دور */
  ctx.fillStyle = P.hillLo;
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  for (let x = 0; x <= SCENE_W; x += 20) ctx.lineTo(x, 560 + Math.sin(x * .006) * 44 + Math.sin(x * .017) * 16);
  ctx.lineTo(SCENE_W, GROUND); ctx.fill();
  ctx.fillStyle = P.hill;
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  for (let x = 0; x <= SCENE_W; x += 20) ctx.lineTo(x, 618 + Math.sin(x * .009 + 2) * 26);
  ctx.lineTo(SCENE_W, GROUND); ctx.fill();
  /* خاک */
  const sg = ctx.createLinearGradient(0, GROUND, 0, SCENE_H);
  sg.addColorStop(0, P.soil); sg.addColorStop(1, P.soilLo);
  ctx.fillStyle = sg; ctx.fillRect(0, GROUND, SCENE_W, SCENE_H - GROUND);
  ctx.fillStyle = 'rgba(255,255,255,.09)';
  for (let i = 0; i < 90; i++) {
    const x = noise1(i * 2.3) * SCENE_W, y = GROUND + 6 + noise1(i * 5.1) * 44;
    ctx.beginPath(); ctx.ellipse(x, y, 3 + noise1(i) * 4, 2, 0, 0, TAU); ctx.fill();
  }
  /* بوته‌های میانه */
  for (const b of [[540, 668, 74], [640, 674, 56], [452, 678, 48], [716, 670, 64]]) {
    ctx.fillStyle = '#6cb257';
    ctx.beginPath();
    ctx.ellipse(b[0], b[1], b[2], b[2] * .58, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = '#7cc164';
    for (let i = 0; i < 4; i++) {
      const A = Math.PI + .34 + i * .78;
      ctx.beginPath();
      ctx.arc(b[0] + Math.cos(A) * b[2] * .58, b[1] + Math.sin(A) * b[2] * .38, b[2] * .3, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    ctx.beginPath();
    ctx.ellipse(b[0] - b[2] * .28, b[1] - b[2] * .26, b[2] * .38, b[2] * .16, -.35, 0, TAU); ctx.fill();
  }
  /* علف */
  ctx.strokeStyle = '#4f9440'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const x = noise1(i * 3.7) * SCENE_W;
    ctx.beginPath(); ctx.moveTo(x, GROUND + 4);
    ctx.quadraticCurveTo(x + 6, GROUND - 14, x + (i % 2 ? 14 : -14), GROUND - 26 - noise1(i) * 12);
    ctx.stroke();
  }
}

function drawStem() {
  ctx.beginPath();
  for (let k = 0; k <= 30; k++) {
    const v = k / 30, q = stemPt(v), q2 = stemPt(Math.min(1, v + .02));
    const dx = q2.x - q.x, dy = q2.y - q.y, dl = Math.max(.001, Math.hypot(dx, dy));
    const w = lerp(16, 5, v);
    const px = q.x + (dy / dl) * w, py = q.y - (dx / dl) * w;
    k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  for (let k = 30; k >= 0; k--) {
    const v = k / 30, q = stemPt(v), q2 = stemPt(Math.min(1, v + .02));
    const dx = q2.x - q.x, dy = q2.y - q.y, dl = Math.max(.001, Math.hypot(dx, dy));
    const w = lerp(16, 5, v);
    ctx.lineTo(q.x - (dy / dl) * w, q.y + (dx / dl) * w);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(250, 0, 370, 0);
  g.addColorStop(0, P.stemDk); g.addColorStop(.5, P.stem); g.addColorStop(1, P.stemDk);
  ctx.fillStyle = g; ctx.fill();
}

function leafPath(i) {
  ctx.beginPath();
  for (let k = 0; k <= 34; k++) {
    const t = k / 34, q = surfPt(i, t);
    k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
  }
  for (let k = 34; k >= 0; k--) {
    const t = k / 34, q = surfPt(i, 2 - t);
    ctx.lineTo(q.x, q.y);
  }
  ctx.closePath();
}

function drawLeaves() {
  for (let i = 0; i < LEAVES.length; i++) {
    const g = G[i];
    withShadow(12, 6, .22, () => {
      leafPath(i);
      const lg = ctx.createLinearGradient(
        g.b.x + g.n.x * g.W, g.b.y + g.n.y * g.W,
        g.b.x - g.n.x * g.W, g.b.y - g.n.y * g.W);
      lg.addColorStop(0, P.leafLt); lg.addColorStop(.55, P.leaf); lg.addColorStop(1, P.leafDk);
      ctx.fillStyle = lg;
      ctx.fill();
    }, '30, 60, 20');
    ctx.save();
    leafPath(i); ctx.clip();
    ctx.strokeStyle = P.vein; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.globalAlpha = .5;
    ctx.beginPath();
    ctx.moveTo(g.b.x, g.b.y);
    ctx.lineTo(g.b.x + g.d.x * g.L, g.b.y + g.d.y * g.L);
    ctx.stroke();
    ctx.lineWidth = 1.8;
    for (let k = 1; k < 8; k++) {
      const t = k / 8;
      const mx = g.b.x + g.d.x * t * g.L, my = g.b.y + g.d.y * t * g.L;
      for (const sd of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + g.d.x * 22 + g.n.x * sd * g.W, my + g.d.y * 22 + g.n.y * sd * g.W);
        ctx.stroke();
      }
    }
    ctx.restore();
    /* لبهٔ روشن */
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2;
    leafPath(i); ctx.stroke();
  }
}

function drawBites() {
  for (const b of S.bites) {
    const q = surfPt(b.i, b.s);
    const g = G[b.i];
    const k = .5 + .5 * Math.sin(S.t * 3 + b.ph);
    const cx = q.x - g.n.x * q.side * 6, cy = q.y - g.n.y * q.side * 6;
    ctx.save();
    ctx.globalAlpha = .3 + k * .3;
    ctx.fillStyle = '#f2ffb0';
    ctx.beginPath(); ctx.arc(cx, cy, 18 + k * 4, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = ball(cx, cy, 11, '#f6ffc8', '#c2e86a', '#7ab02c');
    ctx.beginPath(); ctx.arc(cx, cy, 11, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(90, 140, 30, .7)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(cx, cy, 11, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.beginPath(); ctx.ellipse(cx - 3.4, cy - 4, 3.2, 2.2, -.5, 0, TAU); ctx.fill();
  }
}

function drawFlowers() {
  for (const f of FLOWERS) {
    ctx.strokeStyle = '#3f8f34'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(f.x, GROUND);
    ctx.quadraticCurveTo(f.x + 16, (f.y + GROUND) / 2, f.x, f.y + f.r * .6);
    ctx.stroke();
    ctx.fillStyle = '#4f9f40';
    ctx.save();
    ctx.translate(f.x + 8, (f.y + GROUND) / 2); ctx.rotate(-.5);
    ctx.beginPath(); ctx.ellipse(22, 0, 24, 10, 0, 0, TAU); ctx.fill();
    ctx.restore();
    const sw = f.done ? 1 : .8 + .2 * Math.sin(S.t * 1.6 + f.x);
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(Math.sin(S.t * .8 + f.x * .01) * .06);
    for (let k = 0; k < 7; k++) {
      const A = k * TAU / 7 + S.t * .04;
      ctx.fillStyle = k % 2 ? shade(f.c, .16) : f.c;
      ctx.save();
      ctx.rotate(A);
      ctx.beginPath();
      ctx.ellipse(0, -f.r * .62, f.r * .3, f.r * .62 * sw, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = f.done ? '#c8a83a' : P.core;
    ctx.beginPath(); ctx.arc(0, 0, f.r * .3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(150, 108, 24, .38)';
    for (let k = 0; k < 12; k++) {
      const A = k * 2.4, rr = f.r * (.08 + (k % 3) * .06);
      ctx.beginPath();
      ctx.arc(Math.cos(A) * rr, Math.sin(A) * rr, 1.5, 0, TAU); ctx.fill();
    }
    ctx.restore();
    if (f.done) {
      ctx.save();
      ctx.globalAlpha = .55 + .25 * Math.sin(S.t * 3 + f.x);
      ctx.fillStyle = P.gold;
      for (let k = 0; k < 5; k++) {
        const A = S.t * .8 + k * 1.3;
        ctx.beginPath();
        ctx.arc(f.x + Math.cos(A) * (f.r + 14), f.y + Math.sin(A) * (f.r + 14), 3, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

/* ───────── قهرمان ───────── */

function drawEgg() {
  const p = headPt();
  const w = S.wig * Math.sin(S.t * 40) * 3;
  ctx.save();
  ctx.translate(p.x + w, p.y);
  withShadow(8, 3, .3, () => {
    ctx.fillStyle = P.silk;
    ctx.beginPath(); ctx.ellipse(0, 0, 9, 12, 0, 0, TAU); ctx.fill();
  });
  ctx.strokeStyle = 'rgba(150, 160, 120, .7)'; ctx.lineWidth = 1.4;
  for (let k = -2; k <= 2; k++) {
    ctx.beginPath(); ctx.moveTo(k * 3.4, -11); ctx.lineTo(k * 3.6, 11); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.beginPath(); ctx.ellipse(-3, -5, 3, 4, -.4, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawCat() {
  const n = S.stage === 1 ? 8 : 10;
  const r = catR();
  ctx.save();
  if (S.hurt > 0) ctx.globalAlpha = .55 + .45 * Math.sin(S.t * 30);
  /* سایهٔ بدن روی برگ */
  ctx.fillStyle = 'rgba(30, 60, 20, .18)';
  for (let k = n; k >= 0; k--) {
    const p2 = bodyPt(k);
    ctx.beginPath(); ctx.arc(p2.x + 3, p2.y + 4, r * (1 - k * .04), 0, TAU); ctx.fill();
  }
  /* از دُم به سر، تا سر رو باشد */
  for (let k = n; k >= 0; k--) {
    const p2 = bodyPt(k);
    const rr = r * (k === 0 ? 1.06 : 1 - k * .04);
    const lit = k % 2 === 0;
    ctx.strokeStyle = P.catDk; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(p2.x, p2.y, rr, 0, TAU); ctx.stroke();
    ctx.fillStyle = ball(p2.x, p2.y, rr, lit ? '#e8f7b0' : P.catLt, lit ? P.cat : P.cat, P.catDk);
    ctx.beginPath(); ctx.arc(p2.x, p2.y, rr, 0, TAU); ctx.fill();
    if (!lit && k > 0) {
      ctx.fillStyle = 'rgba(58, 96, 22, .55)';
      ctx.beginPath(); ctx.arc(p2.x, p2.y, rr * .5, 0, TAU); ctx.fill();
    }
    /* پاهای کوتاه */
    if (k > 1 && k < n) {
      const q = bodyPt(k + .35);
      const dx = q.x - p2.x, dy = q.y - p2.y, dl = Math.max(.001, Math.hypot(dx, dy));
      ctx.strokeStyle = P.catDk; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      for (const sd of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p2.x - (dy / dl) * rr * 1.2 * sd, p2.y + (dx / dl) * rr * 1.2 * sd);
        ctx.stroke();
      }
    }
  }
  const h = bodyPt(0), h2 = bodyPt(1);
  const dx = h.x - h2.x, dy = h.y - h2.y, dl = Math.max(.001, Math.hypot(dx, dy));
  const fx = dx / dl, fy = dy / dl, nx = -fy, ny = fx;
  ctx.fillStyle = P.catFace;
  for (const sd of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(h.x + fx * r * .5 + nx * sd * r * .45, h.y + fy * r * .5 + ny * sd * r * .45, r * .19, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  for (const sd of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(h.x + fx * r * .58 + nx * sd * r * .45 - 1, h.y + fy * r * .58 + ny * sd * r * .45 - 1.4, r * .07, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = P.catDk; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (const sd of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(h.x + nx * sd * r * .5, h.y + ny * sd * r * .5);
    ctx.quadraticCurveTo(
      h.x + fx * r * .8 + nx * sd * r * 1.0, h.y + fy * r * .8 + ny * sd * r * 1.0,
      h.x + fx * r * 1.3 + nx * sd * r * .9, h.y + fy * r * 1.3 + ny * sd * r * .9);
    ctx.stroke();
  }
  ctx.restore();
  if (S.silk > 0) {
    ctx.strokeStyle = 'rgba(250, 246, 232, .9)'; ctx.lineWidth = 2;
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(h.x + Math.cos(k * 1.7 + S.t) * 26 * S.silk, h.y + Math.sin(k * 1.7 + S.t) * 26 * S.silk);
      ctx.stroke();
    }
  }
}

function drawMoult() {
  if (!S.moult) return;
  ctx.save();
  ctx.globalAlpha = clamp((9 - S.moult.t) / 3, 0, 1) * .8;
  ctx.fillStyle = '#cfd8b0';
  for (let k = 0; k < 5; k++) {
    ctx.beginPath();
    ctx.arc(S.moult.x - k * 9, S.moult.y + k * 3, 8 - k * .8, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawPupa() {
  const q = stemPt(.965);
  const u = clamp(S.pupaT / 6, 0, 1);
  ctx.fillStyle = P.silk;
  ctx.beginPath(); ctx.ellipse(q.x + 4, q.y + 6, 11, 6, .2, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.silk; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(q.x + 4, q.y + 6); ctx.lineTo(q.x + 10, q.y + 22); ctx.stroke();
  ctx.save();
  ctx.translate(q.x + 10, q.y + 22);
  ctx.scale(1.55, 1.55);
  ctx.rotate(Math.sin(S.t * 1.4) * .07 + (u > .8 ? Math.sin(S.t * 24) * .05 : 0));
  withShadow(12, 6, .3, () => {
    ctx.fillStyle = P.pupa;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-22, 26, -12, 62);
    ctx.quadraticCurveTo(0, 78, 12, 62);
    ctx.quadraticCurveTo(22, 26, 0, 0);
    ctx.fill();
  }, '60, 50, 16');
  const gg = ctx.createLinearGradient(-20, 0, 20, 60);
  gg.addColorStop(0, 'rgba(255,255,255,.4)');
  gg.addColorStop(1, 'rgba(90, 60, 10, .25)');
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-22, 26, -12, 62);
  ctx.quadraticCurveTo(0, 78, 12, 62);
  ctx.quadraticCurveTo(22, 26, 0, 0);
  ctx.fill();
  /* رنگِ بال از پشتِ پیله پیدا می‌شود */
  if (u > .45) {
    ctx.save();
    ctx.globalAlpha = (u - .45) / .55 * .8;
    ctx.fillStyle = P.wing;
    ctx.beginPath(); ctx.ellipse(-5, 40, 9, 17, .2, 0, TAU); ctx.fill();
    ctx.fillStyle = P.wingDk;
    ctx.beginPath(); ctx.ellipse(6, 44, 6, 13, -.2, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = 'rgba(90, 66, 20, .5)'; ctx.lineWidth = 1.6;
  for (let k = 1; k < 5; k++) {
    ctx.beginPath();
    ctx.moveTo(-16 + k, 16 + k * 10); ctx.quadraticCurveTo(0, 22 + k * 10, 16 - k, 16 + k * 10);
    ctx.stroke();
  }
  ctx.fillStyle = P.gold;
  for (const d of [[-7, 22], [5, 26], [-2, 34]]) {
    ctx.beginPath(); ctx.arc(d[0], d[1], 2, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function wingShape(up) {
  ctx.beginPath();
  if (up) {
    /* بالِ جلو: پهن و رو به بالا */
    ctx.moveTo(-3, -16);
    ctx.quadraticCurveTo(-30, -46, -62, -34);
    ctx.quadraticCurveTo(-72, -20, -52, -2);
    ctx.quadraticCurveTo(-30, 8, -3, 5);
  } else {
    /* بالِ عقب: گردتر و کوچک‌تر */
    ctx.moveTo(-3, 3);
    ctx.quadraticCurveTo(-30, 8, -44, 24);
    ctx.quadraticCurveTo(-50, 42, -28, 44);
    ctx.quadraticCurveTo(-10, 40, -3, 15);
  }
  ctx.closePath();
}

function drawWings(flap) {
  for (const sd of [-1, 1]) {
    ctx.save();
    ctx.scale(sd * flap, 1);
    for (const up of [false, true]) {
      wingShape(up);
      const g = ctx.createLinearGradient(-66, -40, -4, 30);
      g.addColorStop(0, P.wingDk); g.addColorStop(.4, P.wing); g.addColorStop(1, P.wingLt);
      ctx.fillStyle = g; ctx.fill();
      ctx.save();
      wingShape(up); ctx.clip();
      /* حاشیهٔ تیرهٔ لبه */
      ctx.strokeStyle = P.wingIn; ctx.lineWidth = 11;
      wingShape(up); ctx.stroke();
      /* خال‌های روشنِ حاشیه */
      ctx.fillStyle = 'rgba(255, 240, 210, .9)';
      if (up) {
        for (let k = 0; k < 5; k++) {
          const t = k / 4;
          ctx.beginPath();
          ctx.arc(-62 + t * 14 + t * t * 8, -32 + t * 30, 2.6, 0, TAU); ctx.fill();
        }
      } else {
        for (let k = 0; k < 4; k++) {
          const t = k / 3;
          ctx.beginPath();
          ctx.arc(-46 + t * 20, 28 + t * 14, 2.4, 0, TAU); ctx.fill();
        }
      }
      /* رگه‌های بال */
      ctx.strokeStyle = 'rgba(60, 34, 16, .34)'; ctx.lineWidth = 1.6;
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.moveTo(-2, up ? -6 : 6);
        ctx.lineTo(up ? -58 + k * 6 : -42 + k * 6, up ? -34 + k * 12 : 16 + k * 9);
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = P.wingIn; ctx.lineWidth = 2.4;
      wingShape(up); ctx.stroke();
      /* چشمکِ بال */
      ctx.fillStyle = P.wingIn;
      if (up) {
        ctx.beginPath(); ctx.ellipse(-42, -22, 8, 10, .3, 0, TAU); ctx.fill();
        ctx.fillStyle = P.wingLt;
        ctx.beginPath(); ctx.ellipse(-42, -22, 3.4, 4.4, .3, 0, TAU); ctx.fill();
      } else {
        ctx.beginPath(); ctx.ellipse(-30, 27, 6, 7, -.2, 0, TAU); ctx.fill();
        ctx.fillStyle = P.card;
        ctx.beginPath(); ctx.ellipse(-30, 27, 2.4, 3, -.2, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }
}

function drawButterfly() {
  const flap = .35 + .65 * Math.abs(Math.sin(S.t * (S.drink ? 3 : 7.5)));
  ctx.save();
  ctx.translate(S.x, S.y);
  ctx.rotate(clamp(S.vx / 900, -.34, .34));
  ctx.scale(1.3, 1.3);
  drawWings(flap);
  ctx.fillStyle = '#3a2c1e';
  ctx.beginPath(); ctx.ellipse(0, 2, 8, 22, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#54402c';
  ctx.beginPath(); ctx.ellipse(-2, -4, 5, 12, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -22, 8, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#3a2c1e'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (const sd of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(sd * 3, -28);
    ctx.quadraticCurveTo(sd * 14, -44, sd * 20, -40);
    ctx.stroke();
    ctx.fillStyle = '#3a2c1e';
    ctx.beginPath(); ctx.arc(sd * 20, -40, 2.6, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = P.card;
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.arc(sd * 3.4, -24, 2.4, 0, TAU); ctx.fill();
  }
  /* خرطوم */
  const un = S.drink ? clamp(S.drink.t / .35, 0, 1) : 0;
  ctx.strokeStyle = '#2f2418'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  if (un > 0) ctx.quadraticCurveTo(4, -6 + un * 14, 2, -12 + un * 40);
  else ctx.arc(4, -12, 5, -1.6, 4.2);
  ctx.stroke();
  ctx.restore();
}

function drawBird() {
  if (!isLarva()) return;
  /* سایهٔ هشدار */
  if (S.birdRun <= 0 && S.bird < BIRD_WARN) {
    const u = 1 - S.bird / BIRD_WARN;
    const sx = lerp(-120, 1320, u);
    ctx.save();
    ctx.globalAlpha = .55 * Math.sin(u * Math.PI) + .2;
    ctx.fillStyle = P.shadow;
    ctx.beginPath(); ctx.ellipse(sx, S.birdLane || 420, 96, 34, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  if (S.birdRun <= 0) return;
  const y = (S.birdLane || 420) - 104 + Math.sin(S.t * 3) * 12;
  const fl = Math.sin(S.t * 11);
  ctx.save();
  ctx.translate(S.birdX, y);
  ctx.scale(-1, 1);                       /* سرش رو به مسیرِ پرواز */
  /* بالِ دور */
  ctx.fillStyle = shade(P.bird, -.2);
  ctx.beginPath();
  ctx.moveTo(-2, -4);
  ctx.quadraticCurveTo(18, -22 + fl * 30, 54, -6 + fl * 24);
  ctx.quadraticCurveTo(22, 6, -2, -4);
  ctx.fill();
  /* دُم */
  ctx.fillStyle = shade(P.bird, -.12);
  ctx.beginPath();
  ctx.moveTo(30, 0); ctx.lineTo(76, -12); ctx.lineTo(80, 4); ctx.lineTo(34, 12);
  ctx.closePath(); ctx.fill();
  /* بدن */
  ctx.fillStyle = P.bird;
  ctx.beginPath(); ctx.ellipse(0, 0, 44, 21, .08, 0, TAU); ctx.fill();
  ctx.fillStyle = P.birdLt;
  ctx.beginPath(); ctx.ellipse(-6, 8, 30, 11, .1, 0, TAU); ctx.fill();
  /* سر */
  ctx.fillStyle = P.bird;
  ctx.beginPath(); ctx.ellipse(-42, -10, 19, 16, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath();
  ctx.moveTo(-56, -8); ctx.lineTo(-82, -4); ctx.lineTo(-56, 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.card;
  ctx.beginPath(); ctx.arc(-47, -15, 4.4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1c1c26';
  ctx.beginPath(); ctx.arc(-48, -15, 2.2, 0, TAU); ctx.fill();
  /* بالِ نزدیک */
  ctx.fillStyle = P.birdLt;
  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.quadraticCurveTo(14, -44 - fl * 26, 56, -30 - fl * 22);
  ctx.quadraticCurveTo(26, -2, -4, -4);
  ctx.fill();
  ctx.strokeStyle = shade(P.bird, -.25); ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.quadraticCurveTo(14, -44 - fl * 26, 56, -30 - fl * 22);
  ctx.stroke();
  ctx.restore();
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = 'rgba(28, 44, 24, .82)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(232, 196, 106, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(ST().n, SCENE_W - 110, HUD_H / 2, { size: 26, family: 'Lalezar', color: P.paper });
  const need = ST().need;
  for (let k = 0; k < need; k++) {
    const x = SCENE_W - 230 - k * 26;
    ctx.fillStyle = k < S.got ? P.gold : 'rgba(255,255,255,.2)';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, 8, 0, TAU); ctx.fill();
  }
  numText(fa(S.score), 120, HUD_H / 2, { size: 22, color: P.gold });
  text('امتیاز', 190, HUD_H / 2, { size: 16, color: 'rgba(255,255,255,.7)' });
  /* گامِ زندگی */
  for (let k = 0; k < STAGES.length; k++) {
    const x = 320 + k * 42;
    ctx.fillStyle = k < S.stage ? P.leafLt : k === S.stage ? P.gold : 'rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, k === S.stage ? 9 : 6, 0, TAU); ctx.fill();
    if (k) {
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 34, HUD_H / 2); ctx.lineTo(x - 12, HUD_H / 2); ctx.stroke();
    }
  }
}

function drawAim() {
  if (!S.aim || S.tut.on) return;
  ctx.save();
  ctx.globalAlpha = .5;
  ctx.strokeStyle = P.card; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.arc(S.aim.x, S.aim.y, 16 + Math.sin(S.t * 7) * 3, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(S.aim.x, S.aim.y, 3.4, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawGoal() {
  if (S.stage !== 3 || S.pupaT > 0) return;
  const q = stemPt(.96);
  const k = .5 + .5 * Math.sin(S.t * 3);
  ctx.save();
  ctx.globalAlpha = .4 + k * .5;
  ctx.strokeStyle = P.gold; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(q.x, q.y, 26 + k * 8, 0, TAU); ctx.stroke();
  ctx.fillStyle = P.gold;
  ctx.beginPath();
  ctx.moveTo(q.x, q.y - 46 - k * 6);
  ctx.lineTo(q.x - 11, q.y - 62 - k * 6);
  ctx.lineTo(q.x + 11, q.y - 62 - k * 6);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawTutorial() {
  const st = S.tut.step;
  const h0 = headPt();
  if (st === 0) {
    spot([{ x: h0.x, y: h0.y, r: 84 }], .68);
    const h = tutCard(340, 452, 520, ['اینجا زیرِ برگ، یک تخمِ پروانه است.'], 'از تخم تا پروانه');
    tutMore(600, 452 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: h0.x, y: h0.y, r: 84 }], .66);
    const h = tutCard(340, 452, 520, ['چند بار روی صفحه بزن', 'تا تخم باز شود.']);
    tutMore(600, 452 + h + 8, S.t, P.ink);
  } else {
    spot([{ x: 340, y: 400, r: 210 }], .64);
    const h = tutCard(600, 140, 540,
      ['بعد هرجای گیاه را نگه داری، به همان‌سو می‌خزی.', 'جوانه‌های روشنِ لبهٔ برگ را بخور تا بزرگ شوی.']);
    tutMore(870, 140 + h + 8, S.t, P.ink);
  }
}

function flyIcon(x, y) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(.62, .62);
  drawWings(1);
  ctx.fillStyle = '#3a2c1e';
  ctx.beginPath(); ctx.ellipse(0, 2, 8, 20, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -20, 7, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 900, h: 330, y: 132,
    paper: P.paper, band: P.leaf, ink: P.ink, inkSoft: P.inkSoft,
    icon: flyIcon,
    title: 'از تخم تا پروانه',
    body: 'یک تخمِ ریز زیرِ برگ است. اوّل لارو می‌شوی و برگ می‌خوری،\nبعد پیله می‌بندی و آخر بال درمی‌آوری.\nمواظبِ پرنده باش — از بالا نگاه می‌کند.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#57a63c', btnHotFill: '#6cbc4c',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 900, h: 330, y: 136,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: P.inkSoft,
    icon: flyIcon,
    title: 'چرخه بسته شد',
    body: 'تخم، لارو، شفیره، پروانه — و باز هم تخم.\nلارو برگ می‌خورد و پروانه شهد؛ یکی می‌خزد و یکی پرواز می‌کند،\nولی هر دو یک جانورند.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#57a63c', btnHotFill: '#6cbc4c',
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
  ctx.drawImage(staticLayer('garden', SCENE_W, SCENE_H, paintGardenStatic), 0, 0, SCENE_W, SCENE_H);
  drawFlowers();
  drawStem();
  drawLeaves();
  drawMoult();
  drawBites();
  if (S.stage === 0) drawEgg();
  else if (S.pupaT > 0) drawPupa();
  else if (isFly()) drawButterfly();
  else drawCat();
  if (S.laid) {
    const p = surfPt(S.where.i, S.where.s);
    ctx.fillStyle = P.silk;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 8, 11, 0, 0, TAU); ctx.fill();
  }
  drawBird();
  drawGoal();
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
    ctx.globalAlpha = clamp(S.winT / 1.2, 0, 1) * .5;
    ctx.fillStyle = '#fff8e0';
    ctx.fillRect(0, 0, SCENE_W, SCENE_H);
    ctx.restore();
  }
  endScene(.1, 'rgba(30, 40, 16, .3)', .3, .12);
}

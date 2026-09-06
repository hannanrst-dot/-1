/*!
title: از تخم تا لاک‌پشتِ دریایی — چرخهٔ زندگی (بازی)
bg: #101d33
*/

/* ═══════════════════════════════════════════════════════════════════════
   از تخم تا لاک‌پشتِ دریایی — علومِ سوم، درس ۱۳ «خزندگان»

   کتاب می‌گوید خزندگان تخم‌گذارند، با شش نفس می‌کشند و بدنشان از
   پولکِ سخت پوشیده است. لاک‌پشتِ دریایی همهٔ این‌ها را دارد و
   زندگی‌اش یکی از عجیب‌ترین سفرهای طبیعت است:

     تخم       زیرِ شنِ ساحل، جایی که مادر آن را چال کرده.
     بیرون آمدن  بچّه‌لاک‌پشت باید خودش را از زیرِ شن بالا بکشد.
     دویدن به دریا  شب است و ماه روی آب افتاده؛ باید تا لبِ آب برود،
               از خرچنگ‌ها و مرغِ دریایی جان به در ببرد.
     رشد در دریا  عروسِ دریایی می‌خورد — ولی کیسهٔ پلاستیکی هم شبیهِ
               عروسِ دریایی است و خوردنش او را مریض می‌کند.
     برگشتن    سال‌ها بعد به همان ساحلی برمی‌گردد که از آن بیرون آمده
               و همان‌جا تخم می‌گذارد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  night: '#101d33', nightLo: '#0a1424', nightHi: '#24406b',
  day: '#8fc8e0', dayLo: '#cfe8f2', dayHi: '#5fa4c8',
  moon: '#f4f0dc', star: '#e8f0ff',
  sand: '#d8bf8e', sandLo: '#b59a68', sandDk: '#8a7348', sandLt: '#f0dcae',
  sea: '#1f6f8c', seaLo: '#0d3e52', seaLt: '#5fb0c4', foam: '#e0f4fa',
  shell: '#4f7248', shellLt: '#7fa06a', shellDk: '#2f4a2c',
  skin: '#5d6b52', skinLt: '#8a9a76', skinDk: '#3a452f',
  egg: '#f2ecd8', eggDk: '#c4b894',
  crab: '#c95b3f', crabLt: '#e8886a', crabDk: '#8a3820',
  gull: '#eef2f6', gullDk: '#93a3b0', gullBeak: '#e8a63a',
  jelly: 'rgba(214, 168, 232, .78)', jellyLt: 'rgba(244, 216, 250, .9)',
  bag: 'rgba(232, 240, 246, .62)', bagEdge: 'rgba(255,255,255,.8)',
  paper: '#fbf7ec', card: '#ffffff',
  ink: '#1b2330', inkSoft: '#78889a',
  good: '#5fb07f', bad: '#d3624a', gold: '#e5b344', accent: '#5fc0d8',
};

/* ───────── ساحل و دریا ───────── */

const WORLD = 3000;
const SEA_Y = 400;                       /* سطحِ دریا */
const NEST_X = 280;                      /* لانهٔ زیرِ شن */
const WATER_X = 1500;                    /* لبِ آب */
/* ساحلِ کم‌شیب تا لبِ آب، و بعد شیبِ تندِ زیرِ آب */
const sandY = (x) => (x <= WATER_X
  ? 336 + (x - 200) * .0492
  : Math.min(736, SEA_Y + (x - WATER_X) * .58));
const CAM_X = 470;

const CHECK = [620, 900, 1180, 1462];    /* چهار گامِ دویدن تا آب */
const CRABS = [{ x: 540, r: 90 }, { x: 830, r: 76 }, { x: 1120, r: 96 }, { x: 1360, r: 70 }];

const STAGES = [
  { n: 'تخم زیرِ شن', need: 5 },
  { n: 'بیرون آمدن از شن', need: 5 },
  { n: 'دویدن به سوی دریا', need: CHECK.length },
  { n: 'رشد در دریا', need: 7 },
  { n: 'برگشتن به ساحل', need: 1 },
];

const S = {
  phase: 'intro', phaseT: 0,
  stage: 0, got: 0, score: 0, best: 0,
  x: NEST_X, y: sandY(NEST_X) + 74, vx: 0, vy: 0, ang: 0,
  aim: null, wig: 0, dig: 0, day: 0,
  jelly: [], bags: [],
  gull: null, gullT: 5, crabPh: 0,
  laid: 0, hurt: 0, sick: 0, tracks: [],
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
const cam = () => clamp(S.x - CAM_X, 0, WORLD - SCENE_W);
const sx = () => S.x - cam();
const inSea = () => S.stage >= 3;
const turtleL = () => (S.stage <= 2 ? 36 : S.stage === 3 ? 50 : 68);

function spawnSea() {
  S.jelly.length = 0; S.bags.length = 0;
  for (let i = 0; i < 9; i++) {
    S.jelly.push({
      x: 1760 + Math.random() * 1100,
      y: SEA_Y + 60 + Math.random() * 180,
      ph: Math.random() * TAU, vy: -6 - Math.random() * 10,
    });
  }
  for (let i = 0; i < 6; i++) {
    S.bags.push({
      x: 1760 + Math.random() * 1100,
      y: SEA_Y + 60 + Math.random() * 180,
      ph: Math.random() * TAU, rot: Math.random() * TAU,
    });
  }
}

function resetGame() {
  S.stage = 0; S.got = 0;
  S.x = NEST_X; S.y = sandY(NEST_X) + 74; S.vx = 0; S.vy = 0; S.ang = 0;
  S.aim = null; S.wig = 0; S.dig = 0; S.day = 0;
  S.jelly.length = 0; S.bags.length = 0;
  S.gull = null; S.gullT = 6;
  S.laid = 0; S.hurt = 0; S.sick = 0; S.tracks = [];
  S.won = false; S.winT = 0;
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
  bits.confetti(sx(), S.y, 20, [P.sandLt, P.shellLt, P.card]);
  if (S.stage === 1) toast.say('از تخم بیرون آمدی', 'good');
  if (S.stage === 2) { S.y = sandY(S.x) - 10; toast.say('حالا برو سمتِ ماه روی آب', 'good'); }
  if (S.stage === 3) {
    spawnSea();
    S.x = WATER_X + 420; S.y = SEA_Y + 110;
    toast.say('رسیدی به دریا', 'good');
  }
  if (S.stage === 4) toast.say('برگرد به همان ساحل', 'good');
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
  S.laid = 1;
  S.score += 250;
  if (S.score > S.best) S.best = S.score;
  sfx.win();
  bits.confetti(sx(), S.y, 34, [P.egg, P.gold, P.sandLt, P.card]);
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
    bits.spark(sx(), S.y, 4, [P.egg, P.sandLt]);
    if (S.got >= ST().need) grow();
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

/** کندنِ شن، رو به بالا. */
function digStep(dt) {
  if (S.aim) {
    S.dig += dt;
    S.y -= 26 * dt;
    S.x += (S.aim.x + cam() - S.x) * clamp(dt * 1.2, 0, 1);
    if (Math.random() < dt * 22) {
      bits.add(sx() + (Math.random() * 2 - 1) * 16, S.y - 14, 1, 'dot', [P.sandLt, P.sand],
        { speed: 40, lift: 40, size: 3, life: .6, grav: 240 });
    }
    if (S.dig >= 1.1) { S.dig = 0; collect(); }
  } else S.dig = Math.max(0, S.dig - dt * .6);
  S.y = Math.max(sandY(S.x) - 8, S.y);
}

/** خزیدن روی شن. */
function crawlStep(dt) {
  const sp = 128;
  if (S.aim) {
    const dx = (S.aim.x + cam()) - S.x;
    S.vx += Math.sign(dx) * sp * 3 * dt;
  }
  S.vx *= Math.exp(-3 * dt);
  if (Math.abs(S.vx) > sp) S.vx = Math.sign(S.vx) * sp;
  S.x += S.vx * dt;
  S.x = clamp(S.x, 120, WATER_X + 40);
  S.y = sandY(S.x) - 10 + Math.sin(S.t * 9) * (Math.abs(S.vx) > 20 ? 2.6 : 0);
  const last = S.tracks[S.tracks.length - 1];
  if (Math.abs(S.vx) > 20 && (!last || Math.abs(S.x - last.x) > 24)) {
    S.tracks.push({ x: S.x, y: sandY(S.x) });
    if (S.tracks.length > 70) S.tracks.shift();
  }
  S.ang = Math.sin(S.t * 9) * (Math.abs(S.vx) > 20 ? .07 : 0);
  /* گام‌های ساحل */
  if (S.got < CHECK.length && S.x > CHECK[S.got]) collect();
  if (S.x >= WATER_X + 20 && S.got >= CHECK.length - 1) { /* آب */ }
  /* خرچنگ‌ها */
  for (const c of CRABS) {
    const cx = c.x + Math.sin(S.t * 1.2 + c.x) * c.r;
    if (S.hurt > 0) break;
    if (Math.abs(cx - S.x) > 34 || Math.abs(sandY(cx) - 14 - S.y) > 44) continue;
    S.hurt = 1.7; S.shake = .22;
    sfx.nope();
    S.vx = -220;
    S.x -= 60;
    S.score = Math.max(0, S.score - 20);
    toast.say('خرچنگ!', 'bad');
  }
}

/** شنا در دریا. */
function swimStep(dt) {
  const sp = S.stage === 3 ? 250 : 300;
  if (S.aim) {
    const dx = (S.aim.x + cam()) - S.x, dy = S.aim.y - S.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    S.vx += dx / d * sp * 2.6 * dt;
    S.vy += dy / d * sp * 2.6 * dt;
  }
  const k = Math.exp(-2.2 * dt);
  S.vx *= k; S.vy *= k;
  const v = Math.hypot(S.vx, S.vy);
  if (v > sp) { S.vx = S.vx / v * sp; S.vy = S.vy / v * sp; }
  S.x += S.vx * dt; S.y += S.vy * dt;
  if (v > 12) S.ang = Math.atan2(S.vy, S.vx);
  S.x = clamp(S.x, 240, WORLD - 80);
  S.y = clamp(S.y, SEA_Y + 26, Math.max(SEA_Y + 60, sandY(S.x) - 16));
  if (S.stage === 3) {
    for (let i = 0; i < S.jelly.length; i++) {
      const j = S.jelly[i];
      if (Math.hypot(j.x - S.x, j.y - S.y) >= turtleL() * .8 + 26) continue;
      S.jelly.splice(i, 1);
      bits.spark(j.x - cam(), j.y, 8, [P.jellyLt, P.foam]);
      const before = S.stage;
      collect();
      if (S.stage === before) {
        S.jelly.push({ x: 1760 + Math.random() * 1100, y: SEA_Y + 60 + Math.random() * 180,
          ph: Math.random() * TAU, vy: -6 - Math.random() * 10 });
      }
      break;
    }
    for (let i = 0; i < S.bags.length; i++) {
      const b = S.bags[i];
      if (S.hurt > 0) break;
      if (Math.hypot(b.x - S.x, b.y - S.y) >= turtleL() * .8 + 24) continue;
      S.bags.splice(i, 1);
      S.hurt = 2.2; S.sick = 2.4; S.shake = .2;
      sfx.nope();
      if (S.got > 0) { S.got--; S.score = Math.max(0, S.score - 30); }
      toast.say('این عروسِ دریایی نبود — پلاستیک بود', 'bad');
      S.bags.push({ x: 1760 + Math.random() * 1100, y: SEA_Y + 60 + Math.random() * 180,
        ph: Math.random() * TAU, rot: Math.random() * TAU });
      break;
    }
  } else if (S.stage === 4) {
    /* بالا آمدن روی همان ساحل */
    if (S.x < 520 && S.y > sandY(S.x) - 40) finish();
  }
}

/* ───────── مرغِ دریایی ───────── */

function stepGull(dt) {
  if (S.stage !== 2) { S.gull = null; return; }
  if (S.gull) {
    const g = S.gull;
    g.t += dt;
    g.x += 560 * dt;
    if (g.t > .9 && !g.hit && Math.abs(g.x - S.x) < 42 && S.hurt <= 0) {
      g.hit = true;
      S.hurt = 1.7; S.shake = .24;
      sfx.nope();
      S.vx = -260; S.x -= 70;
      S.score = Math.max(0, S.score - 20);
      toast.say('مرغِ دریایی!', 'bad');
    }
    if (g.t > 2.6) { S.gull = null; S.gullT = 5 + Math.random() * 3; }
    return;
  }
  S.gullT -= dt;
  if (S.gullT <= 0) { S.gull = { t: 0, x: S.x - 520, hit: false, lane: sandY(S.x) - 150 }; sfx.slide(); }
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.hurt > 0) S.hurt -= dt;
  if (S.sick > 0) S.sick -= dt;
  if (S.tut.on) S.tut.t += dt;
  if (S.wig > 0) S.wig = Math.max(0, S.wig - dt * 2);
  S.day += (( inSea() ? 1 : 0) - S.day) * clamp(dt * .5, 0, 1);

  if (S.phase === 'play' && !S.winT) {
    if (S.stage === 0) { /* تخم */ }
    else if (S.stage === 1) digStep(dt);
    else if (S.stage === 2) { crawlStep(dt); stepGull(dt); }
    else swimStep(dt);
    for (const j of S.jelly) {
      j.y += j.vy * dt;
      j.x += Math.sin(S.t * .6 + j.ph) * 12 * dt;
      if (j.y < SEA_Y + 40) j.y = Math.max(SEA_Y + 40, sandY(j.x) - 40);
    }
    for (const b of S.bags) {
      b.y += Math.sin(S.t * .5 + b.ph) * 10 * dt;
      b.x += Math.cos(S.t * .4 + b.ph) * 14 * dt;
      b.rot += dt * .3;
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
  ctx.fillStyle = `rgba(4, 10, 22, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 246, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '4, 12, 26');
  ctx.fillStyle = P.accent;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: P.inkSoft }); yy += 30; }
  return h + 20;
}

const mix = (a, b, t) => {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return `rgb(${Math.round(lerp(pa[0], pb[0], t))}, ${Math.round(lerp(pa[1], pb[1], t))}, ${Math.round(lerp(pa[2], pb[2], t))})`;
};

/* ───────── آسمان و ساحل ───────── */

function drawSky() {
  const d = S.day;
  const g = ctx.createLinearGradient(0, 0, 0, SEA_Y);
  g.addColorStop(0, mix(P.nightLo.slice(1), P.dayHi.slice(1), d));
  g.addColorStop(.6, mix(P.night.slice(1), P.day.slice(1), d));
  g.addColorStop(1, mix(P.nightHi.slice(1), P.dayLo.slice(1), d));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SEA_Y + 4);
  /* ستاره‌ها */
  if (d < .95) {
    ctx.save();
    ctx.globalAlpha = 1 - d;
    ctx.fillStyle = P.star;
    for (let i = 0; i < 70; i++) {
      const x = ((noise1(i * 2.7) * WORLD - cam() * .3) % SCENE_W + SCENE_W) % SCENE_W;
      const y = 30 + noise1(i * 5.3) * 380;
      const tw = .4 + .6 * Math.abs(Math.sin(S.t * 1.4 + i));
      ctx.globalAlpha = (1 - d) * tw;
      ctx.beginPath(); ctx.arc(x, y, 1 + noise1(i) * 1.6, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  /* ماه یا خورشید */
  const mx = ((WATER_X + 700) - cam() * .5) % (SCENE_W + 400) - 100;
  const my = lerp(140, 108, d);
  ctx.save();
  ctx.globalAlpha = 1 - d * .85;
  const hg = ctx.createRadialGradient(mx, my, 40, mx, my, 130);
  hg.addColorStop(0, 'rgba(244, 240, 220, .30)');
  hg.addColorStop(1, 'rgba(244, 240, 220, 0)');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.arc(mx, my, 130, 0, TAU); ctx.fill();
  ctx.fillStyle = P.moon;
  ctx.beginPath(); ctx.arc(mx, my, 48, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(210, 205, 180, .5)';
  for (const c of [[-16, -10, 9], [12, 8, 7], [4, -20, 5]]) {
    ctx.beginPath(); ctx.arc(mx + c[0], my + c[1], c[2], 0, TAU); ctx.fill();
  }
  ctx.restore();
  if (d > .1) {
    ctx.save();
    ctx.globalAlpha = d;
    const sg2 = ctx.createRadialGradient(mx, my, 40, mx, my, 126);
    sg2.addColorStop(0, 'rgba(255, 226, 150, .5)');
    sg2.addColorStop(1, 'rgba(255, 226, 150, 0)');
    ctx.fillStyle = sg2;
    ctx.beginPath(); ctx.arc(mx, my, 126, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath(); ctx.arc(mx, my, 46, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function drawSeaWater() {
  const xs = clamp(WATER_X - cam(), -20, SCENE_W + 20);
  const wave = (x) => SEA_Y + Math.sin((x + cam() * .6) * .02 + S.t * 2.2) * 5;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(xs, wave(xs));
  for (let x = xs; x <= SCENE_W + 20; x += 12) ctx.lineTo(x, wave(x));
  ctx.lineTo(SCENE_W + 20, SCENE_H + 10);
  ctx.lineTo(xs, SCENE_H + 10);
  ctx.closePath();
  ctx.clip();
  const g = ctx.createLinearGradient(0, SEA_Y, 0, SCENE_H);
  g.addColorStop(0, S.day > .5 ? 'rgba(95, 176, 196, .74)' : 'rgba(31, 111, 140, .78)');
  g.addColorStop(1, 'rgba(13, 62, 82, .92)');
  ctx.fillStyle = g;
  ctx.fillRect(0, SEA_Y - 20, SCENE_W + 20, SCENE_H);
  /* راهِ نورِ ماه روی آب */
  const mx = ((WATER_X + 700) - cam() * .5) % (SCENE_W + 400) - 100;
  ctx.globalAlpha = .22 * (1 - S.day * .7);
  ctx.fillStyle = P.moon;
  ctx.beginPath();
  ctx.moveTo(mx - 40, SEA_Y);
  ctx.lineTo(mx + 40, SEA_Y);
  ctx.lineTo(mx + 210, SCENE_H);
  ctx.lineTo(mx - 210, SCENE_H);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(224, 244, 250, .12)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    for (let x = 0; x <= SCENE_W; x += 16) {
      const y = SEA_Y + 40 + i * 46 + Math.sin((x + cam() * .5) * .012 + S.t * .8 + i) * 7;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  /* خطِ سطحِ آب */
  ctx.strokeStyle = 'rgba(230, 248, 252, .75)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = xs; x <= SCENE_W; x += 12) {
    const y = wave(x);
    x === xs ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawBeach() {
  ctx.save();
  ctx.translate(-cam(), 0);
  const x0 = cam() - 40, x1 = cam() + SCENE_W + 40;
  ctx.beginPath();
  ctx.moveTo(x0, SCENE_H + 10);
  for (let x = x0; x <= x1; x += 16) ctx.lineTo(x, sandY(x) + Math.sin(x * .02) * 3);
  ctx.lineTo(x1, SCENE_H + 10);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, 460, 0, SCENE_H);
  g.addColorStop(0, P.sandLt); g.addColorStop(.4, P.sand); g.addColorStop(1, P.sandDk);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  /* دانه‌های شن */
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  for (let i = 0; i < 220; i++) {
    const x = x0 + noise1(i * 2.1) * (x1 - x0);
    const y = sandY(x) + 10 + noise1(i * 5.7) * 200;
    ctx.fillRect(x, y, 2.4, 2.4);
  }
  ctx.fillStyle = 'rgba(90, 70, 40, .18)';
  for (let i = 0; i < 120; i++) {
    const x = x0 + noise1(i * 3.3 + 1) * (x1 - x0);
    const y = sandY(x) + 20 + noise1(i * 7.1) * 180;
    ctx.beginPath(); ctx.ellipse(x, y, 5, 3, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
  /* حفرهٔ لانه */
  ctx.fillStyle = 'rgba(120, 96, 56, .4)';
  ctx.beginPath(); ctx.ellipse(NEST_X, sandY(NEST_X) + 60, 84, 46, 0, 0, TAU); ctx.fill();
  /* صدف و سنگ‌ریزه */
  for (let i = 0; i < 40; i++) {
    const x = 160 + noise1(i * 2.9) * (WATER_X - 100);
    if (x < x0 - 40 || x > x1 + 40) continue;
    const y = sandY(x) + 24 + noise1(i * 6.1) * 250;
    if (i % 4 === 0) {
      ctx.fillStyle = '#f2e4cc';
      ctx.save();
      ctx.translate(x, y); ctx.rotate(noise1(i) * 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let k = 0; k <= 6; k++) {
        const a = Math.PI + k / 6 * Math.PI;
        ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(160, 130, 90, .6)'; ctx.lineWidth = 1.2;
      for (let k = 1; k < 5; k++) {
        ctx.beginPath(); ctx.moveTo(0, 0);
        const a = Math.PI + k / 5 * Math.PI;
        ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10); ctx.stroke();
      }
      ctx.restore();
    } else {
      ctx.fillStyle = i % 3 ? 'rgba(150, 126, 86, .5)' : 'rgba(196, 172, 128, .7)';
      ctx.beginPath(); ctx.ellipse(x, y, 5 + noise1(i * 4) * 5, 3.4, noise1(i) * 3, 0, TAU); ctx.fill();
    }
  }
  /* بوته‌های شنی بالای ساحل */
  for (let i = 0; i < 9; i++) {
    const x = 170 + i * 150 + noise1(i * 3.7) * 60;
    if (x > WATER_X - 120 || x < x0 - 60 || x > x1 + 60) continue;
    const y = sandY(x) + 6;
    ctx.strokeStyle = '#7f8a52'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let k = -3; k <= 3; k++) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + k * 7, y - 26, x + k * 16, y - 40 - Math.abs(k) * -4);
      ctx.stroke();
    }
  }
  /* ردِ پای لاک‌پشت */
  ctx.strokeStyle = 'rgba(150, 122, 78, .55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (const t of S.tracks) {
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(t.x - 6, t.y + 6 + sd * 7);
      ctx.lineTo(t.x + 6, t.y + 10 + sd * 9);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawFoam() {
  ctx.save();
  ctx.globalAlpha = .6;
  ctx.fillStyle = P.foam;
  for (let i = 0; i < 5; i++) {
    const w = 90 + i * 30;
    const x = WATER_X - cam() + Math.sin(S.t * .9 + i) * 26;
    ctx.beginPath();
    ctx.ellipse(x, SEA_Y + 6 + i * 5, w, 8, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/* ───────── لاک‌پشت ───────── */

/** لاک‌پشتِ دریایی از پهلو؛ سر رو به راست. */
function turtleArt(L, o = {}) {
  const sw = o.swim === undefined ? 1 : o.swim;
  const f1 = Math.sin(S.t * (o.fast ? 7 : 3.4)) * sw;
  const f2 = Math.sin(S.t * (o.fast ? 7 : 3.4) + 1.6) * sw;
  /* بالهٔ عقب */
  ctx.fillStyle = P.skinDk;
  ctx.save();
  ctx.translate(-L * .62, L * .28); ctx.rotate(.5 + f2 * .3);
  ctx.beginPath(); ctx.ellipse(-L * .16, 0, L * .26, L * .12, 0, 0, TAU); ctx.fill();
  ctx.restore();
  /* بالهٔ جلوِ دور */
  ctx.fillStyle = P.skinDk;
  ctx.save();
  ctx.translate(L * .18, L * .18); ctx.rotate(-.5 + f1 * .55);
  ctx.beginPath(); ctx.ellipse(L * .34, 0, L * .5, L * .15, 0, 0, TAU); ctx.fill();
  ctx.restore();
  /* لاک */
  const sh = o.baby ? '#7fae66' : P.shell;
  const shl = o.baby ? '#b8dc9a' : P.shellLt;
  ctx.fillStyle = ball(0, -L * .22, L, shl, sh, P.shellDk);
  ctx.beginPath();
  ctx.ellipse(0, 0, L * .82, L * .5, 0, 0, TAU);
  ctx.fill();
  if (o.baby) {
    ctx.strokeStyle = 'rgba(255, 250, 226, .55)'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.ellipse(0, -L * .04, L * .8, L * .48, 0, Math.PI * 1.05, TAU * .98); ctx.stroke();
  }
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, 0, L * .82, L * .5, 0, 0, TAU); ctx.clip();
  ctx.strokeStyle = P.shellDk; ctx.lineWidth = Math.max(1.6, L * .035);
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * L * .3, -L * .55);
    ctx.quadraticCurveTo(i * L * .34, 0, i * L * .3, L * .55);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(0, 0, L * .48, L * .28, 0, 0, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ctx.beginPath(); ctx.ellipse(-L * .2, -L * .24, L * .34, L * .12, -.3, 0, TAU); ctx.fill();
  ctx.restore();
  /* سر */
  ctx.fillStyle = ball(L * .84, -L * .16, L * .3, P.skinLt, P.skin, P.skinDk);
  ctx.beginPath(); ctx.ellipse(L * .92, -L * .08, L * .26, L * .2, .1, 0, TAU); ctx.fill();
  ctx.fillStyle = P.skinDk;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(L * (.78 + (i % 3) * .1), -L * (.16 - (i % 2) * .1), L * .035, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = '#fdfaf2';
  ctx.beginPath(); ctx.arc(L * .98, -L * .16, L * .075, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1b2530';
  ctx.beginPath(); ctx.arc(L * 1.0, -L * .16, L * .042, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.skinDk; ctx.lineWidth = Math.max(1.4, L * .03);
  ctx.beginPath(); ctx.moveTo(L * 1.16, -L * .02); ctx.lineTo(L * 1.0, L * .02); ctx.stroke();
  /* بالهٔ جلوِ نزدیک */
  ctx.fillStyle = P.skin;
  ctx.save();
  ctx.translate(L * .3, L * .1); ctx.rotate(-.35 + f1 * .7);
  ctx.beginPath(); ctx.ellipse(L * .42, 0, L * .58, L * .17, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.skinDk; ctx.lineWidth = Math.max(1.2, L * .025);
  ctx.beginPath(); ctx.ellipse(L * .42, 0, L * .58, L * .17, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}

function drawEggs() {
  const y = sandY(NEST_X) + 74;
  for (let i = 0; i < 9; i++) {
    const a = i * 2.1;
    const x = NEST_X + Math.cos(a) * (14 + (i % 3) * 20);
    const yy = y + Math.sin(a) * 16;
    const me = i === 0;
    const w = me ? S.wig * Math.sin(S.t * 40) * 3 : 0;
    ctx.fillStyle = ball(x, yy, 17, '#fbf7e8', P.egg, P.eggDk);
    ctx.beginPath(); ctx.arc(x + w, yy, me ? 18 : 15, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.beginPath(); ctx.arc(x + w - 5, yy - 5, 4, 0, TAU); ctx.fill();
    if (me && S.got > 0) {
      ctx.strokeStyle = P.eggDk; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 12, yy - 4);
      for (let k = 1; k <= Math.min(6, S.got + 1); k++) ctx.lineTo(x - 12 + k * 4.4, yy - 4 + (k % 2 ? 6 : -4));
      ctx.stroke();
    }
    if (me) {
      ctx.save();
      ctx.globalAlpha = .3 + .3 * Math.sin(S.t * 4);
      ctx.strokeStyle = P.card; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(x + w, yy, 28, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }
  if (S.laid) return;
}

function drawHero() {
  ctx.save();
  if (S.hurt > 0) ctx.globalAlpha = .5 + .5 * Math.sin(S.t * 26);
  ctx.translate(S.x, S.y);
  ctx.rotate(clamp(S.ang, -.6, .6));
  if (S.stage === 2 && S.vx < -6) ctx.scale(-1, 1);
  turtleArt(turtleL(), { fast: S.stage <= 2, baby: S.stage <= 2, swim: S.stage >= 3 ? 1 : .5 });
  ctx.restore();
  if (S.sick > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.sick, 0, 1) * .8;
    ctx.fillStyle = P.bad;
    for (let i = 0; i < 3; i++) {
      const a = S.t * 3 + i * 2.1;
      ctx.beginPath();
      ctx.arc(S.x + Math.cos(a) * 40, S.y - 50 + Math.sin(a) * 10, 5, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}

function drawJelly() {
  for (const j of S.jelly) {
    if (j.x < cam() - 60 || j.x > cam() + SCENE_W + 60) continue;
    const pu = .8 + .2 * Math.sin(S.t * 2 + j.ph);
    ctx.save();
    ctx.translate(j.x, j.y);
    ctx.fillStyle = P.jelly;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22 * pu, 18 / pu, 0, Math.PI, TAU);
    ctx.fill();
    ctx.fillStyle = P.jellyLt;
    ctx.beginPath();
    ctx.ellipse(-5, -5, 9 * pu, 6 / pu, -.3, Math.PI, TAU);
    ctx.fill();
    ctx.strokeStyle = P.jelly; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 7, 0);
      ctx.quadraticCurveTo(i * 9 + Math.sin(S.t * 3 + i) * 5, 18, i * 7 + Math.sin(S.t * 2 + i) * 8, 34);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawBags() {
  for (const b of S.bags) {
    if (b.x < cam() - 60 || b.x > cam() + SCENE_W + 60) continue;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.sin(b.rot) * .4);
    ctx.fillStyle = P.bag;
    ctx.beginPath();
    ctx.moveTo(-24, -10);
    ctx.quadraticCurveTo(-8, -28, 10, -14);
    ctx.quadraticCurveTo(28, -22, 26, 0);
    ctx.quadraticCurveTo(30, 20, 8, 22);
    ctx.quadraticCurveTo(-12, 30, -20, 12);
    ctx.quadraticCurveTo(-32, 4, -24, -10);
    ctx.fill();
    ctx.strokeStyle = P.bagEdge; ctx.lineWidth = 1.8;
    ctx.stroke();
    /* دسته‌های کیسه — تنها نشانهٔ فرق */
    ctx.beginPath();
    ctx.moveTo(-10, -18); ctx.quadraticCurveTo(-4, -32, 4, -20);
    ctx.moveTo(8, -16); ctx.quadraticCurveTo(16, -30, 22, -14);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 9 - 4, -6); ctx.quadraticCurveTo(i * 11, 6, i * 9 + 3, 18);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawCrabs() {
  if (S.stage !== 2) return;
  for (const c of CRABS) {
    const x = c.x + Math.sin(S.t * 1.2 + c.x) * c.r;
    if (x < cam() - 60 || x > cam() + SCENE_W + 60) continue;
    const y = sandY(x) - 14;
    const dir = Math.cos(S.t * 1.2 + c.x) >= 0 ? 1 : -1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(.82, .82);
    ctx.fillStyle = 'rgba(60, 40, 20, .3)';
    ctx.beginPath(); ctx.ellipse(0, 14, 30, 6, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = P.crabDk; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      const a = -.4 + i * .45;
      ctx.beginPath();
      ctx.moveTo(sd * 14, 2);
      ctx.quadraticCurveTo(sd * (26 + i * 5), 4 + Math.sin(S.t * 9 + i) * 3, sd * (32 + i * 6), 14);
      ctx.stroke();
    }
    ctx.fillStyle = ball(0, -6, 26, P.crabLt, P.crab, P.crabDk);
    ctx.beginPath(); ctx.ellipse(0, 0, 26, 17, 0, 0, TAU); ctx.fill();
    /* گازانبرها */
    ctx.fillStyle = P.crab;
    for (const sd of [-1, 1]) {
      ctx.save();
      ctx.translate(sd * 26, -4);
      ctx.rotate(sd * (.4 + Math.sin(S.t * 5) * .22));
      ctx.beginPath(); ctx.ellipse(sd * 12, 0, 14, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = P.crabDk;
      ctx.beginPath(); ctx.ellipse(sd * 18, -4, 8, 4, sd * .4, 0, TAU); ctx.fill();
      ctx.fillStyle = P.crab;
      ctx.restore();
    }
    ctx.fillStyle = P.crabDk;
    for (const sd of [-1, 1]) {
      ctx.fillRect(sd * 8 - 2, -24, 4, 12);
      ctx.fillStyle = '#fdfaf2';
      ctx.beginPath(); ctx.arc(sd * 8, -26, 5, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1b1b22';
      ctx.beginPath(); ctx.arc(sd * 8 + dir * 1.5, -26, 2.4, 0, TAU); ctx.fill();
      ctx.fillStyle = P.crabDk;
    }
    ctx.restore();
  }
}

function drawGull() {
  if (!S.gull) return;
  ctx.save();
  ctx.translate(-cam(), 0);
  const g = S.gull;
  const y = g.lane + Math.sin(g.t * 4) * 14 - (g.t < .9 ? (1 - g.t / .9) * 120 : 0);
  ctx.save();
  ctx.translate(g.x, y);
  ctx.scale(-1, 1);
  const fl = Math.sin(S.t * 12);
  ctx.fillStyle = P.gullDk;
  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.quadraticCurveTo(22, -18 + fl * 26, 64, -6 + fl * 20);
  ctx.quadraticCurveTo(26, 6, -2, -2);
  ctx.fill();
  ctx.fillStyle = P.gull;
  ctx.beginPath(); ctx.ellipse(0, 0, 40, 16, .06, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-36, -10, 16, 13, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = P.gullDk;
  ctx.beginPath();
  ctx.moveTo(28, 0); ctx.lineTo(62, -10); ctx.lineTo(62, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.gullBeak;
  ctx.beginPath();
  ctx.moveTo(-48, -8); ctx.lineTo(-76, -2); ctx.lineTo(-48, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1b2530';
  ctx.beginPath(); ctx.arc(-42, -13, 3, 0, TAU); ctx.fill();
  ctx.fillStyle = P.gull;
  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.quadraticCurveTo(18, -36 - fl * 24, 58, -26 - fl * 18);
  ctx.quadraticCurveTo(24, -2, -4, -4);
  ctx.fill();
  ctx.restore();
  if (g.t < .9) {
    ctx.save();
    ctx.globalAlpha = .45;
    ctx.fillStyle = 'rgba(10, 20, 30, .5)';
    ctx.beginPath(); ctx.ellipse(g.x, sandY(g.x) - 6, 60, 12, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = 'rgba(10, 20, 36, .84)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(95, 192, 216, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(ST().n, SCENE_W - 140, HUD_H / 2, { size: 24, family: 'Lalezar', color: P.paper });
  const need = ST().need;
  for (let k = 0; k < need; k++) {
    const x = SCENE_W - 300 - k * 26;
    ctx.fillStyle = k < S.got ? P.gold : 'rgba(255,255,255,.2)';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, 8, 0, TAU); ctx.fill();
  }
  numText(fa(S.score), 120, HUD_H / 2, { size: 22, color: P.gold });
  text('امتیاز', 192, HUD_H / 2, { size: 16, color: 'rgba(255,255,255,.7)' });
  for (let k = 0; k < STAGES.length; k++) {
    const x = 320 + k * 42;
    ctx.fillStyle = k < S.stage ? P.accent : k === S.stage ? P.gold : 'rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, k === S.stage ? 9 : 6, 0, TAU); ctx.fill();
    if (k) {
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 34, HUD_H / 2); ctx.lineTo(x - 12, HUD_H / 2); ctx.stroke();
    }
  }
  if (S.stage >= 1) {
    const mx = 560, mw = 300, my = HUD_H - 12;
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.beginPath(); rrPath(mx, my - 4, mw, 7, 4); ctx.fill();
    ctx.fillStyle = P.accent;
    ctx.beginPath(); ctx.arc(mx + clamp(S.x / WORLD, 0, 1) * mw, my, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = P.sandLt;
    ctx.beginPath(); ctx.arc(mx + (NEST_X / WORLD) * mw, my, 4, 0, TAU); ctx.fill();
  }
}

function drawGoal() {
  if (S.stage === 2) {
    /* لبِ آب */
    const k = .5 + .5 * Math.sin(S.t * 2.6);
    ctx.save();
    ctx.globalAlpha = .3 + k * .35;
    ctx.fillStyle = P.moon;
    const gx = WATER_X - cam();
    ctx.beginPath();
    ctx.moveTo(gx - 26, SEA_Y - 70 - k * 8);
    ctx.lineTo(gx + 4, SEA_Y - 96 - k * 8);
    ctx.lineTo(gx + 34, SEA_Y - 70 - k * 8);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  if (S.stage === 4) {
    const k = .5 + .5 * Math.sin(S.t * 3);
    ctx.save();
    ctx.globalAlpha = .3 + k * .4;
    ctx.strokeStyle = P.gold; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(NEST_X - cam(), sandY(NEST_X) - 10, 70 + k * 10, 0, TAU); ctx.stroke();
    ctx.restore();
  }
}

function drawAim() {
  if (!S.aim || S.tut.on || S.stage === 0) return;
  ctx.save();
  ctx.globalAlpha = .45;
  ctx.strokeStyle = P.card; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.arc(S.aim.x, S.aim.y, 16 + Math.sin(S.t * 7) * 3, 0, TAU); ctx.stroke();
  ctx.restore();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: sx(), y: S.y, r: 120 }], .7);
    const h = tutCard(340, 210, 540,
      ['شب است. اینجا زیرِ شنِ ساحل،', 'یکی از این تخم‌ها تویی.'], 'از تخم تا لاک‌پشتِ دریایی');
    tutMore(610, 210 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: sx(), y: S.y, r: 120 }], .68);
    const h = tutCard(340, 210, 540, ['چند بار روی صفحه بزن', 'تا پوسته بشکند.']);
    tutMore(610, 210 + h + 8, S.t, P.ink);
  } else {
    spot([{ x: sx(), y: S.y - 60, r: 150 }], .64);
    const h = tutCard(340, 170, 560,
      ['بعد صفحه را نگه دار تا خودت را از زیرِ شن بالا بکشی', 'و سرِ شن بیایی.']);
    tutMore(620, 170 + h + 8, S.t, P.ink);
  }
}

function turtleIcon(x, y) {
  ctx.save();
  ctx.translate(x - 6, y); ctx.scale(.62, .62);
  turtleArt(46, { swim: .6 });
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 920, h: 340, y: 126,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: P.inkSoft,
    icon: turtleIcon,
    title: 'از تخم تا لاک‌پشتِ دریایی',
    body: 'زیرِ شنِ ساحل از تخم بیرون می‌آیی و باید خودت را بالا بکشی.\nبعد شبانه تا لبِ آب بدوی — خرچنگ و مرغِ دریایی آنجا هستند.\nدر دریا بزرگ می‌شوی و سال‌ها بعد به همین ساحل برمی‌گردی.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 920, h: 340, y: 130,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    icon: turtleIcon,
    title: 'چرخه بسته شد',
    body: 'تخم، بچّه‌لاک‌پشت، لاک‌پشتِ دریا — و باز هم تخم در همان ساحل.\nآن کیسه‌های پلاستیکی هم یادت ماند: از دور درست شبیهِ\nعروسِ دریایی‌اند، ولی غذا نیستند.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

/* ───────── قاب ───────── */

function draw() {
  beginScene(P.night);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 47) * k * .5);
  }
  drawSky();
  drawBeach();
  drawSeaWater();
  ctx.save();
  ctx.translate(-cam(), 0);
  drawJelly();
  drawBags();
  if (S.stage === 0) drawEggs(); else drawHero();
  if (S.laid) {
    for (let i = 0; i < 8; i++) {
      const a = i * 2.3;
      ctx.fillStyle = P.egg;
      ctx.beginPath();
      ctx.arc(NEST_X + Math.cos(a) * (14 + (i % 3) * 16), sandY(NEST_X) + 30 + Math.sin(a) * 12, 12, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
  drawCrabs2();
  drawFoam();
  drawGull();
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
    const w = 600;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 52, w, 40, P.card, 91, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 32, { size: 17, color: P.ink });
    ctx.restore();
  }
  if (S.winT) {
    ctx.save();
    ctx.globalAlpha = clamp(S.winT / 1.2, 0, 1) * .45;
    ctx.fillStyle = '#e8f8ff';
    ctx.fillRect(0, 0, SCENE_W, SCENE_H);
    ctx.restore();
  }
  endScene(.1, 'rgba(4, 10, 24, .44)', .3, .12);
}

/** خرچنگ‌ها در مختصاتِ جهان کشیده می‌شوند. */
function drawCrabs2() {
  ctx.save();
  ctx.translate(-cam(), 0);
  drawCrabs();
  ctx.restore();
}

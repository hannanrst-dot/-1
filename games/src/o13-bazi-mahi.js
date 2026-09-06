/*!
title: از تخم تا ماهی — چرخهٔ زندگیِ ماهی (بازی)
bg: #17495f
*/

/* ═══════════════════════════════════════════════════════════════════════
   از تخم تا ماهی — علومِ سوم، درس ۱۳، فعّالیتِ «چرخهٔ زندگیِ ماهی»

   سه جملهٔ کتاب:
     ۱ــ ماهی درون آب تخم می‌گذارد.
     ۲ــ بچّه‌ماهی‌ها از تخم خارج می‌شوند و در آب به دنبال غذا می‌گردند.
     ۳ــ بچّه‌ماهی‌ها در آب رشد می‌کنند.

   اینجا همان سه جمله یک سفر است: تخم در سنگ‌ریزه‌های بالادستِ رودخانه،
   نوزادی که هنوز دهان ندارد و از کیسهٔ زردهٔ خودش می‌خورد، بچّه‌ماهی‌ای
   که در گودالِ پایین‌دست غذا می‌گیرد، و ماهیِ جوانی که باید خلافِ جریان
   تا همان سنگ‌ریزه‌ها برگردد.

   ── قانونِ آب ───────────────────────────────────────────────────
   جریانِ رودخانه در سطح تندترین و کنارِ کف کندترین است، و پشتِ هر
   سنگ تقریباً می‌ایستد. بازی این را نمی‌گوید؛ ماهی که بالا برود پس
   می‌رود و ماهی که کفِ رود و پشتِ سنگ‌ها برود جلو می‌رود. همان کاری
   که ماهیِ واقعی می‌کند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  sky: '#9fd3e8', skyLo: '#6fb2cf',
  mount: '#88a9ba', mountLo: '#6d8ea3', mountSnow: '#eef6fa',
  water: '#2b7ea3', waterLo: '#0f3d55', waterLt: '#6fc0da', foam: '#dff2f8',
  bed: '#6b5f4a', bedLo: '#4a4133',
  gravel: '#9d8f72', gravelLt: '#c6b795', gravelDk: '#6d6250',
  rock: '#6f7a72', rockLt: '#9aa79c', rockDk: '#48524c',
  weed: '#3f8f5a', weedLt: '#63bd77',
  fish: '#d8834a', fishLt: '#f7c78c', fishDk: '#9d5326', belly: '#f3ecd8',
  egg: '#f0c98a', eggDot: '#8a5a2a', yolk: '#f3a64a',
  pike: '#4e6b52', pikeLt: '#7f9d78',
  heron: '#cfd8de', heronDk: '#8b98a4', heronBeak: '#e8b03a',
  food: '#c9e86a', foodLt: '#eefaa8',
  paper: '#fbf7ec', card: '#ffffff',
  ink: '#14313f', inkSoft: '#6d8d99',
  good: '#5fb07f', bad: '#d3624a', gold: '#e5b344', accent: '#5fc0d8',
};

/* ───────── رودخانه ───────── */

const SURF = 150;               /* سطحِ آب */
const BED = 690;                /* کفِ رود */
const WORLD = 3000;             /* درازای رودخانه */
const NEST_X = 260;             /* سنگ‌ریزه‌های تخم‌ریزی، بالادست */
const POOL_X = 2160;            /* گودالِ آرامِ پایین‌دست */
const CUR = 330;                /* تندیِ جریان کنارِ سطح */
const CAM_X = 470;              /* ماهی کجای صفحه بماند */

const CHECK = [2160, 1760, 1340, 900, 480];   /* پنج تنگهٔ بالادست */

const ROCKS = [];
const WEEDS = [];
const MOTES = [];
const HERONS = [{ x: 2320 }, { x: 1520 }, { x: 760 }];

(function buildRiver() {
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  /* تخته‌سنگی که مرغِ ماهی‌خوار رویش می‌ایستد */
  for (const h of HERONS) ROCKS.push({ x: h.x, y: SURF + 128, r: 96, s: 4 });
  /* اوّل سنگ‌های دو سوی هر تنگه، تا جایشان محفوظ بماند */
  for (const c of CHECK) {
    ROCKS.push({ x: c, y: 250, r: 72, s: 1 });
    ROCKS.push({ x: c, y: 640, r: 78, s: 2 });
  }
  /* سنگ‌های پراکنده — هیچ‌کدام روی هم نمی‌افتند، وگرنه ماهی گیر می‌کند */
  const free = (x, y, r) => !ROCKS.some((o) => Math.hypot(o.x - x, o.y - y) < o.r + r + 54);
  for (let i = 0; i < 24; i++) {
    for (let k = 0; k < 50; k++) {
      const x = 380 + rnd() * (WORLD - 660);
      if (CHECK.some((c) => Math.abs(c - x) < 210)) continue;
      const r = 34 + rnd() * 36;
      const y = BED - 40 - rnd() * 190;
      if (!free(x, y, r)) continue;
      ROCKS.push({ x, y, r, s: rnd() * 6 });
      break;
    }
  }
  for (let i = 0; i < 60; i++) {
    WEEDS.push({ x: rnd() * WORLD, h: 60 + rnd() * 130, ph: rnd() * TAU, w: 8 + rnd() * 10 });
  }
  for (let i = 0; i < 110; i++) {
    MOTES.push({ x: rnd() * WORLD, y: SURF + 20 + rnd() * (BED - SURF - 30), r: .8 + rnd() * 1.8 });
  }
})();

/** تندیِ جریان در هر نقطه — رو به پایین‌دست (راست). */
function currentAt(x, y) {
  const d = clamp((y - SURF) / (BED - SURF), 0, 1);
  let v = CUR * (1 - .9 * Math.pow(d, 1.5));
  for (const r of ROCKS) {
    if (x > r.x && x < r.x + r.r * 3.4 && Math.abs(y - r.y) < r.r * 1.25) { v *= .2; break; }
  }
  if (x < NEST_X + 260) v *= .3;             /* آبِ آرامِ لانه */
  if (x > POOL_X - 120) v *= .3;             /* گودالِ آرام */
  return v;
}

/* مرحله‌های زندگی — همان سه جملهٔ کتاب، به‌علاوهٔ راهِ برگشت */
const STAGES = [
  { n: 'تخم', need: 5 },
  { n: 'نوزاد با کیسهٔ زرده', need: 6 },
  { n: 'بچّه‌ماهی', need: 7 },
  { n: 'ماهیِ جوان', need: CHECK.length },
  { n: 'ماهیِ بزرگ', need: 1 },
];

const S = {
  phase: 'intro', phaseT: 0,
  stage: 0, got: 0, score: 0, best: 0,
  wx: NEST_X, y: BED - 40, vx: 0, vy: 0, ang: 0, wig: 0,
  aim: null, drift: null,
  yolk: 1, nestT: 0,
  food: [], pike: null,
  heron: null, heronT: 0,
  lay: 0,
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
const cam = () => clamp(S.wx - CAM_X, 0, WORLD - SCENE_W);
const sx = () => S.wx - cam();
const fishLen = () => (S.stage <= 1 ? 20 : S.stage === 2 ? 30 : S.stage === 3 ? 46 : 62);
const swimSp = () => (S.stage === 1 ? 80 : S.stage === 2 ? 215 : S.stage === 3 ? 335 : 355);
const inNest = () => Math.abs(S.wx - NEST_X) < 150 && S.y > BED - 150;

function spawnFood(n) {
  for (let i = 0; i < n; i++) {
    S.food.push({
      x: POOL_X - 200 + Math.random() * 700,
      y: SURF + 80 + Math.random() * (BED - SURF - 180),
      ph: Math.random() * TAU,
    });
  }
}

function resetGame() {
  S.stage = 0; S.got = 0;
  S.wx = NEST_X; S.y = BED - 40; S.vx = 0; S.vy = 0; S.ang = 0;
  S.aim = null; S.drift = null;
  S.yolk = 1; S.nestT = 0;
  S.food.length = 0; S.pike = null;
  S.heron = null; S.heronT = 3;
  S.lay = 0; S.hurt = 0; S.won = false; S.winT = 0;
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
  bits.confetti(sx(), S.y, 20, [P.fishLt, P.foam, P.card]);
  if (S.stage === 1) toast.say('از تخم بیرون آمدی', 'good');
  if (S.stage === 2) {
    /* آب او را با خود می‌برد به گودالِ پایین‌دست */
    S.drift = { t: 0, x0: S.wx, x1: POOL_X + 120, y0: S.y, y1: 430 };
    spawnFood(8);
    S.pike = { x: POOL_X + 620, y: 420, vx: -60, vy: 0, flee: 0 };
    toast.say('آب تو را با خود برد', 'good');
  }
  if (S.stage === 3) {
    S.food.length = 0; S.pike = null;
    toast.say('حالا برگرد بالادست', 'good');
  }
  if (S.stage === 4) toast.say('برو سرِ سنگ‌ریزه‌ها', 'good');
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
  S.lay = 1;
  S.score += 250;
  if (S.score > S.best) S.best = S.score;
  sfx.win();
  bits.confetti(sx(), S.y, 34, [P.egg, P.gold, P.foam, P.card]);
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
  if (S.winT || S.drift) return;
  if (S.stage === 0) {
    S.got++; S.wig = 1;
    sfx.tick();
    bits.spark(sx(), S.y, 4, [P.egg, P.foam]);
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

/* ───────── شنا ───────── */

function swim(dt) {
  const sp = swimSp();
  if (S.aim) {
    const dx = (S.aim.x + cam()) - S.wx, dy = S.aim.y - S.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    S.vx += dx / d * sp * 2.8 * dt;
    S.vy += dy / d * sp * 2.8 * dt;
    S.wig = Math.min(1, S.wig + dt * 3);
  } else S.wig = Math.max(0, S.wig - dt * 2);
  const k = Math.exp(-2.4 * dt);
  S.vx *= k; S.vy *= k;
  const v = Math.hypot(S.vx, S.vy);
  if (v > sp) { S.vx = S.vx / v * sp; S.vy = S.vy / v * sp; }
  const cu = currentAt(S.wx, S.y);
  S.wx += (S.vx + cu) * dt;
  S.y += S.vy * dt;
  if (v > 14) S.ang = Math.atan2(S.vy, S.vx + cu * .3);
  S.wx = clamp(S.wx, 90, WORLD - 90);
  S.y = clamp(S.y, SURF + 22, BED - 18);
  /* سنگ‌ها جامدند — ماهی روی آن‌ها سُر می‌خورد، نه اینکه بچسبد */
  for (const r of ROCKS) {
    const dx = S.wx - r.x, dy = S.y - r.y;
    const d = Math.hypot(dx, dy);
    const rr = r.r + fishLen() * .35;
    if (d >= rr || d < .001) continue;
    const nx = dx / d, ny = dy / d;
    S.wx = r.x + nx * rr;
    S.y = r.y + ny * rr;
    const vn = S.vx * nx + S.vy * ny;
    if (vn < 0) { S.vx -= vn * nx; S.vy -= vn * ny; }
    /* اگر درست روبه‌روی سنگ ایستاده، از نزدیک‌ترین لبه رد شود */
    const tan = -S.vx * ny + S.vy * nx;
    if (Math.abs(tan) < 50) {
      const sg = ny >= 0 ? 1 : -1;
      S.vx += -ny * sg * 90;
      S.vy += nx * sg * 90;
    }
  }
}

/* ───────── شکارچی‌ها ───────── */

function stepPike(dt) {
  const f = S.pike;
  if (!f) return;
  if (f.flee > 0) f.flee -= dt;
  const dx = S.wx - f.x, dy = S.y - f.y;
  const d = Math.max(1, Math.hypot(dx, dy));
  /* لای علف‌های کفِ رود، بچّه‌ماهی دیده نمی‌شود */
  const hidden = S.y > BED - 120;
  let tx, ty, sp;
  if (f.flee > 0) { tx = f.x - dx * 3; ty = f.y - dy * 3; sp = 190; }
  else if (!hidden && d < 430) { tx = S.wx; ty = S.y; sp = 165; }
  else { tx = POOL_X + 340 + Math.sin(S.t * .4) * 340; ty = 380 + Math.sin(S.t * .7) * 90; sp = 110; }
  const ax = tx - f.x, ay = ty - f.y;
  const ad = Math.max(1, Math.hypot(ax, ay));
  f.vx += ax / ad * sp * 1.5 * dt;
  f.vy += ay / ad * sp * 1.5 * dt;
  const k = Math.exp(-1.5 * dt);
  f.vx *= k; f.vy *= k;
  const v = Math.hypot(f.vx, f.vy);
  if (v > sp) { f.vx = f.vx / v * sp; f.vy = f.vy / v * sp; }
  f.x += f.vx * dt; f.y += f.vy * dt;
  f.x = clamp(f.x, POOL_X - 420, WORLD - 60);
  f.y = clamp(f.y, SURF + 40, BED - 40);
  if (S.hurt <= 0 && f.flee <= 0 && d < fishLen() + 34) {
    S.hurt = 1.9; S.shake = .2;
    f.flee = 2.8;
    sfx.nope();
    S.vx = -dx / d * 380; S.vy = -dy / d * 380;
    if (S.got > 0) { S.got--; S.score = Math.max(0, S.score - 20); }
    toast.say('ماهیِ بزرگ!', 'bad');
  }
}

function stepHeron(dt) {
  if (S.stage < 2 || S.stage > 3) { S.heron = null; return; }
  if (S.heron) {
    S.heron.t += dt;
    const h = S.heron;
    if (h.t > .8 && !h.hit && S.y < SURF + 190 && Math.abs(S.wx - h.x) < 70) {
      h.hit = true;
      if (S.hurt <= 0) {
        S.hurt = 1.6; S.shake = .24;
        sfx.nope();
        S.vy = 320;
        if (S.got > 0) { S.got--; S.score = Math.max(0, S.score - 20); }
        toast.say('مرغِ ماهی‌خوار!', 'bad');
      }
    }
    if (h.t > 1.8) S.heron = null;
    return;
  }
  S.heronT -= dt;
  if (S.heronT > 0) return;
  for (const q of HERONS) {
    if (Math.abs(S.wx - q.x) > 150 || S.y > SURF + 210) continue;
    S.heron = { x: q.x, t: 0, hit: false };
    S.heronT = 3.2;
    sfx.slide();
    return;
  }
  S.heronT = .4;
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.hurt > 0) S.hurt -= dt;
  if (S.tut.on) S.tut.t += dt;
  if (S.wig > 0 && S.stage === 0) S.wig = Math.max(0, S.wig - dt * 2);

  if (S.phase === 'play' && !S.winT) {
    if (S.drift) {
      S.drift.t += dt / 3.2;
      const u = easeInOut(clamp(S.drift.t, 0, 1));
      S.wx = lerp(S.drift.x0, S.drift.x1, u);
      S.y = lerp(S.drift.y0, S.drift.y1, u);
      S.ang = .1;
      if (S.drift.t >= 1) S.drift = null;
    } else if (S.stage === 0) {
      /* تخم فقط تکان می‌خورد */
    } else {
      swim(dt);
      stepHeron(dt);
      if (S.stage === 1) {
        /* کیسهٔ زرده کم‌کم تمام می‌شود، ولی فقط وقتی در لانه باشد */
        if (inNest()) {
          S.nestT += dt;
          S.yolk = clamp(1 - S.got / ST().need - S.nestT / (ST().need * 1.7), 0, 1);
          if (S.nestT >= 1.7) { S.nestT = 0; collect(); }
        } else {
          S.nestT = Math.max(0, S.nestT - dt);
          if (Math.random() < dt * .7) tip('بینِ سنگ‌ریزه‌های کفِ رود بمان.');
        }
      } else if (S.stage === 2) {
        stepPike(dt);
        for (let i = 0; i < S.food.length; i++) {
          const f = S.food[i];
          if (Math.hypot(f.x - S.wx, f.y - S.y) >= fishLen() + 14) continue;
          S.food.splice(i, 1);
          bits.spark(f.x - cam(), f.y, 6, [P.food, P.foam]);
          const before = S.stage;
          collect();
          if (S.stage === before) spawnFood(1);
          break;
        }
      } else if (S.stage === 3) {
        if (S.got < CHECK.length && S.wx < CHECK[S.got]) {
          collect();
          if (S.stage === 3) toast.say('یک تنگه رد شد', 'good');
        }
      } else if (S.stage === 4) {
        if (inNest()) { S.nestT += dt; if (S.nestT > 1.4) finish(); }
        else S.nestT = 0;
      }
      /* ذرّه‌های شناور، تا تندیِ آب دیده شود */
      for (const m of MOTES) {
        m.x += currentAt(m.x, m.y) * dt;
        if (m.x > cam() + SCENE_W + 60) { m.x = cam() - 60; m.y = SURF + 20 + Math.random() * (BED - SURF - 30); }
        if (m.x < cam() - 120) m.x = cam() + SCENE_W + 40;
      }
      /* غذاها با آب می‌روند */
      for (const f of S.food) {
        f.x += currentAt(f.x, f.y) * dt * .5;
        f.y += Math.sin(S.t * 1.4 + f.ph) * 14 * dt;
        if (f.x > WORLD - 60) f.x = POOL_X - 300;
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
  ctx.fillStyle = `rgba(6, 26, 34, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 246, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '4, 22, 30');
  ctx.fillStyle = P.accent;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: P.inkSoft }); yy += 30; }
  return h + 20;
}

/* ───────── رودخانه ───────── */

function drawSkyAndHills() {
  const g = ctx.createLinearGradient(0, 0, 0, SURF);
  g.addColorStop(0, P.skyLo); g.addColorStop(1, P.sky);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SURF);
  const px = -cam() * .18;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, SCENE_W, SURF); ctx.clip();
  for (let rep = -1; rep < 4; rep++) {
    const ox = px + rep * 900;
    ctx.fillStyle = P.mountLo;
    ctx.beginPath();
    ctx.moveTo(ox - 60, SURF);
    ctx.lineTo(ox + 160, 62); ctx.lineTo(ox + 380, SURF);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.mount;
    ctx.beginPath();
    ctx.moveTo(ox + 240, SURF);
    ctx.lineTo(ox + 470, 78); ctx.lineTo(ox + 720, SURF);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.mountSnow;
    ctx.beginPath();
    ctx.moveTo(ox + 160, 62); ctx.lineTo(ox + 192, 96); ctx.lineTo(ox + 172, 90);
    ctx.lineTo(ox + 150, 102); ctx.lineTo(ox + 128, 96);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawWater() {
  const g = ctx.createLinearGradient(0, SURF, 0, BED + 60);
  g.addColorStop(0, P.waterLt); g.addColorStop(.35, P.water); g.addColorStop(1, P.waterLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, SURF, SCENE_W, SCENE_H - SURF);
  /* تیرهای نور */
  ctx.save();
  ctx.globalAlpha = .13;
  ctx.fillStyle = P.foam;
  const off = (-cam() * .5) % 320;
  for (let i = -1; i < 6; i++) {
    const x = off + i * 320 + Math.sin(S.t * .3 + i) * 12;
    ctx.beginPath();
    ctx.moveTo(x, SURF); ctx.lineTo(x + 70, SURF);
    ctx.lineTo(x + 210, BED + 40); ctx.lineTo(x + 70, BED + 40);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawSurface() {
  ctx.save();
  ctx.strokeStyle = 'rgba(230, 248, 252, .75)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = 0; x <= SCENE_W; x += 12) {
    const y = SURF + Math.sin((x + cam() * .6) * .022 + S.t * 2.4) * 5
      + Math.sin((x + cam()) * .05 - S.t * 1.6) * 2.4;
    x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = .3;
  ctx.fillStyle = P.foam;
  for (let i = 0; i < 16; i++) {
    const x = ((i * 190 - cam() * .6) % (SCENE_W + 200)) - 100;
    ctx.beginPath();
    ctx.ellipse(x, SURF + 12 + Math.sin(S.t * 2 + i) * 3, 34, 4, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawBed() {
  const g = ctx.createLinearGradient(0, BED - 30, 0, SCENE_H);
  g.addColorStop(0, P.bed); g.addColorStop(1, P.bedLo);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cam() - 20, SCENE_H);
  for (let x = cam() - 20; x <= cam() + SCENE_W + 20; x += 24) {
    ctx.lineTo(x, BED - 6 + Math.sin(x * .012) * 12 + Math.sin(x * .04) * 5);
  }
  ctx.lineTo(cam() + SCENE_W + 20, SCENE_H);
  ctx.closePath(); ctx.fill();
  /* سنگ‌ریزه */
  ctx.save();
  ctx.globalAlpha = .8;
  const x0 = Math.floor((cam() - 40) / 19) * 19;
  for (let x = x0; x < cam() + SCENE_W + 40; x += 19) {
    const n = noise1(x * .07), n2 = noise1(x * .21), n3 = noise1(x * .53);
    ctx.fillStyle = n < .4 ? P.gravelDk : n < .78 ? P.gravel : P.gravelLt;
    ctx.beginPath();
    ctx.ellipse(x + n2 * 16, BED + 2 + n3 * 46, 7 + n * 6, 5 + n2 * 3, n * 3, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawNest() {
  ctx.save();
  ctx.globalAlpha = .95;
  for (let i = 0; i < 34; i++) {
    const a = i * 1.7;
    const x = NEST_X + Math.cos(a) * (30 + (i % 7) * 18);
    const y = BED - 22 + Math.sin(a) * 16 + (i % 5) * 4;
    ctx.fillStyle = i % 3 === 0 ? P.gravelLt : i % 3 === 1 ? P.gravel : P.gravelDk;
    ctx.beginPath(); ctx.ellipse(x, y, 12, 9, a, 0, TAU); ctx.fill();
  }
  ctx.restore();
  /* تخم‌های تازه، پایانِ بازی */
  if (S.lay) {
    for (let i = 0; i < 12; i++) {
      const a = i * 2.1;
      ctx.fillStyle = P.egg;
      ctx.beginPath();
      ctx.arc(NEST_X + Math.cos(a) * (18 + (i % 4) * 12), BED - 30 + Math.sin(a) * 12, 7, 0, TAU);
      ctx.fill();
      ctx.fillStyle = P.eggDot;
      ctx.beginPath();
      ctx.arc(NEST_X + Math.cos(a) * (18 + (i % 4) * 12), BED - 30 + Math.sin(a) * 12, 2.6, 0, TAU);
      ctx.fill();
    }
  }
}

function drawWeeds() {
  for (const w of WEEDS) {
    if (w.x < cam() - 60 || w.x > cam() + SCENE_W + 60) continue;
    const sw = Math.sin(S.t * 1.4 + w.ph) * 16 + 10;
    const g = ctx.createLinearGradient(w.x, BED, w.x, BED - w.h);
    g.addColorStop(0, P.weed); g.addColorStop(1, P.weedLt);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(w.x - w.w / 2, BED + 10);
    ctx.quadraticCurveTo(w.x - w.w / 4 + sw * .5, BED - w.h * .6, w.x + sw, BED - w.h);
    ctx.quadraticCurveTo(w.x + w.w / 4 + sw * .5, BED - w.h * .6, w.x + w.w / 2, BED + 10);
    ctx.closePath(); ctx.fill();
  }
}

function drawRocks() {
  for (const r of ROCKS) {
    if (r.x < cam() - 160 || r.x > cam() + SCENE_W + 160) continue;
    withShadow(14, 8, .3, () => {
      ctx.fillStyle = ball(r.x, r.y, r.r, P.rockLt, P.rock, P.rockDk);
      wobbleCircle(r.x, r.y, r.r, r.s, 3.4);
      ctx.fill();
    }, '10, 30, 40');
    ctx.fillStyle = 'rgba(255,255,255,.13)';
    ctx.beginPath();
    ctx.ellipse(r.x - r.r * .3, r.y - r.r * .4, r.r * .42, r.r * .2, -.5, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(60, 120, 80, .3)';
    ctx.beginPath();
    ctx.ellipse(r.x + r.r * .2, r.y + r.r * .5, r.r * .5, r.r * .2, .2, 0, TAU); ctx.fill();
  }
}

function drawGates() {
  for (let i = 0; i < CHECK.length; i++) {
    const x = CHECK[i];
    if (x < cam() - 120 || x > cam() + SCENE_W + 120) continue;
    const done = S.stage > 3 || (S.stage === 3 && S.got > i);
    ctx.save();
    ctx.globalAlpha = done ? .16 : .2 + .12 * Math.sin(S.t * 2.4 + i);
    const gg = ctx.createLinearGradient(x - 30, 0, x + 30, 0);
    gg.addColorStop(0, 'rgba(255,255,255,0)');
    gg.addColorStop(.5, done ? P.good : P.gold);
    gg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(x - 30, 322, 60, 244);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = done ? .7 : .95;
    ctx.fillStyle = done ? P.good : P.gold;
    const yy = 448 + Math.sin(S.t * 2 + i) * 8;
    ctx.beginPath();
    ctx.moveTo(x - 22, yy); ctx.lineTo(x + 6, yy - 15); ctx.lineTo(x + 6, yy + 15);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

function drawMotes() {
  ctx.save();
  for (const m of MOTES) {
    if (m.x < cam() - 40 || m.x > cam() + SCENE_W + 40) continue;
    const v = currentAt(m.x, m.y);
    const L = clamp(v / 12, 1.5, 30);
    ctx.globalAlpha = .1 + clamp(v / CUR, 0, 1) * .32;
    ctx.strokeStyle = P.foam;
    ctx.lineWidth = m.r * 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(m.x - L, m.y); ctx.lineTo(m.x, m.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFood() {
  for (const f of S.food) {
    if (f.x < cam() - 40 || f.x > cam() + SCENE_W + 40) continue;
    const k = .5 + .5 * Math.sin(S.t * 4 + f.ph);
    ctx.save();
    ctx.globalAlpha = .3 + k * .3;
    ctx.fillStyle = P.foodLt;
    ctx.beginPath(); ctx.arc(f.x, f.y, 15 + k * 4, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = ball(f.x, f.y, 8, P.foodLt, P.food, '#7ba02c');
    ctx.beginPath(); ctx.arc(f.x, f.y, 8, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(90, 130, 30, .6)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(f.x, f.y, 8, 0, TAU); ctx.stroke();
  }
}

/* ───────── ماهی ───────── */

/** بدنِ ماهی در مختصاتِ خودش؛ سر رو به راست. */
function fishBody(L, o = {}) {
  const b = o.body || P.fish, lt = o.light || P.fishLt, dk = o.dark || P.fishDk;
  const H = L * .46;
  const wag = Math.sin(S.t * (o.fast ? 14 : 8)) * (o.wag === undefined ? .5 : o.wag);
  /* دُم */
  ctx.fillStyle = dk;
  ctx.save();
  ctx.translate(-L * .92, 0);
  ctx.rotate(wag * .4);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-L * .3, -H * .2, -L * .46, -H * .95);
  ctx.quadraticCurveTo(-L * .24, 0, -L * .46, H * .95);
  ctx.quadraticCurveTo(-L * .3, H * .2, 0, 0);
  ctx.fill();
  ctx.restore();
  /* بالهٔ پشتی */
  ctx.fillStyle = dk;
  ctx.beginPath();
  ctx.moveTo(-L * .1, -H * .8);
  ctx.quadraticCurveTo(-L * .1, -H * 1.7, L * .3, -H * .7);
  ctx.closePath(); ctx.fill();
  if (L > 40) {
    ctx.beginPath();
    ctx.ellipse(-L * .62, -H * .78, L * .09, H * .2, -.2, 0, TAU); ctx.fill();
  }
  /* بالهٔ شکمی */
  ctx.beginPath();
  ctx.moveTo(-L * .18, H * .7);
  ctx.quadraticCurveTo(-L * .3, H * 1.5, L * .04, H * .78);
  ctx.closePath(); ctx.fill();
  /* بدن */
  ctx.fillStyle = ball(0, -H * .3, L, lt, b, dk);
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * .3, -H, -L * .5, -H * .72);
  ctx.quadraticCurveTo(-L * .88, -H * .4, -L * .95, 0);
  ctx.quadraticCurveTo(-L * .88, H * .4, -L * .5, H * .72);
  ctx.quadraticCurveTo(L * .3, H, L, 0);
  ctx.fill();
  /* شکمِ روشن */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * .3, -H, -L * .5, -H * .72);
  ctx.quadraticCurveTo(-L * .88, -H * .4, -L * .95, 0);
  ctx.quadraticCurveTo(-L * .88, H * .4, -L * .5, H * .72);
  ctx.quadraticCurveTo(L * .3, H, L, 0);
  ctx.clip();
  ctx.fillStyle = P.belly;
  ctx.beginPath();
  ctx.ellipse(-L * .1, H * .74, L * .8, H * .5, 0, 0, TAU); ctx.fill();
  if (o.parr) {
    ctx.fillStyle = 'rgba(50, 70, 90, .45)';
    for (let k = 0; k < 6; k++) {
      ctx.beginPath();
      ctx.ellipse(-L * .7 + k * L * .27, -H * .06, L * .07, H * .5, 0, 0, TAU); ctx.fill();
    }
  }
  if (o.spots) {
    for (let k = 0; k < 16; k++) {
      const n1 = noise1(k * 3.1), n2 = noise1(k * 7.7);
      ctx.fillStyle = k % 3 === 0 ? 'rgba(210, 60, 50, .75)' : 'rgba(40, 40, 40, .5)';
      ctx.beginPath();
      ctx.arc(-L * .82 + n1 * L * 1.5, -H * .8 + n2 * H * 1.3, L * .035, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
  /* آبشش */
  ctx.strokeStyle = 'rgba(150, 60, 30, .5)'; ctx.lineWidth = Math.max(1.6, L * .045);
  ctx.beginPath(); ctx.arc(L * .42, 0, H * .62, -1.05, 1.05); ctx.stroke();
  /* بالهٔ سینه‌ای */
  ctx.fillStyle = dk;
  ctx.save();
  ctx.translate(L * .3, H * .34);
  ctx.rotate(.5 + Math.sin(S.t * 7) * .22);
  ctx.beginPath(); ctx.ellipse(L * .1, 0, L * .2, H * .17, 0, 0, TAU); ctx.fill();
  ctx.restore();
  /* چشم */
  const er = Math.max(3.2, L * (o.bigEye ? .16 : .1));
  ctx.fillStyle = '#fdfaf2';
  ctx.beginPath(); ctx.arc(L * .66, -H * .28, er, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1b2530';
  ctx.beginPath(); ctx.arc(L * .69, -H * .28, er * .58, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.beginPath(); ctx.arc(L * .64, -H * .38, er * .26, 0, TAU); ctx.fill();
  /* دهان */
  ctx.strokeStyle = dk; ctx.lineWidth = Math.max(1.4, L * .04);
  ctx.beginPath(); ctx.moveTo(L * .96, H * .1); ctx.lineTo(L * .8, H * .16); ctx.stroke();
}

function drawEggs() {
  ctx.save();
  for (let i = 0; i < 14; i++) {
    const a = i * 2.1;
    const x = NEST_X + Math.cos(a) * (16 + (i % 4) * 13);
    const y = BED - 34 + Math.sin(a) * 12;
    const me = i === 0;
    const w = me ? S.wig * Math.sin(S.t * 40) * 3 : 0;
    ctx.fillStyle = ball(x, y, 9, '#ffe6b8', P.egg, '#c08a3c');
    ctx.beginPath(); ctx.arc(x + w, y, me ? 10 : 8.4, 0, TAU); ctx.fill();
    ctx.fillStyle = P.eggDot;
    ctx.beginPath(); ctx.arc(x + w + 2, y - 1, me ? 4 : 3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.beginPath(); ctx.arc(x + w - 3, y - 3.4, 2.2, 0, TAU); ctx.fill();
    if (me) {
      ctx.save();
      ctx.globalAlpha = .35 + .3 * Math.sin(S.t * 4);
      ctx.strokeStyle = P.card; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(x + w, y, 17, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawHero() {
  ctx.save();
  if (S.hurt > 0) ctx.globalAlpha = .5 + .5 * Math.sin(S.t * 28);
  ctx.translate(S.wx, S.y);
  ctx.rotate(clamp(S.ang, -.7, .7));
  const L = fishLen();
  if (S.stage === 1) {
    /* نوزاد: بدنِ نازک و کیسهٔ زردهٔ درشت */
    ctx.fillStyle = 'rgba(240, 250, 252, .5)';
    ctx.beginPath();
    ctx.moveTo(L * 1.1, 0);
    ctx.quadraticCurveTo(0, -L * .34, -L * 1.5, -L * .5 * (1 + Math.sin(S.t * 7) * .3));
    ctx.quadraticCurveTo(-L * .6, 0, -L * 1.5, L * .5 * (1 + Math.sin(S.t * 7) * .3));
    ctx.quadraticCurveTo(0, L * .34, L * 1.1, 0);
    ctx.fill();
    ctx.fillStyle = ball(0, -L * .2, L, '#f2d9b8', '#d8b083', '#9d7a52');
    ctx.beginPath(); ctx.ellipse(L * .1, 0, L * .9, L * .26, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = ball(-L * .1, L * .2, L * .62, '#ffd48a', P.yolk, '#c9762a');
    ctx.beginPath();
    ctx.arc(-L * .05, L * .34, L * .52 * (.4 + S.yolk * .6), 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath();
    ctx.arc(-L * .2, L * .2, L * .16 * (.4 + S.yolk * .6), 0, TAU); ctx.fill();
    ctx.fillStyle = '#1b2530';
    ctx.beginPath(); ctx.arc(L * .72, -L * .12, L * .2, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.arc(L * .66, -L * .2, L * .07, 0, TAU); ctx.fill();
  } else if (S.stage === 2) {
    fishBody(L, { parr: true, bigEye: true, fast: true, body: '#9db8c4', light: '#d8e8ee', dark: '#5f7d8c' });
  } else {
    fishBody(L, { spots: true });
  }
  ctx.restore();
}

function drawPike() {
  const f = S.pike;
  if (!f) return;
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(Math.atan2(f.vy, f.vx) + (f.vx < 0 ? Math.PI : 0));
  if (f.vx < 0) ctx.scale(1, -1);
  fishBody(58, { body: P.pike, light: P.pikeLt, dark: '#2f4a34', fast: true });
  ctx.restore();
}

function drawHerons() {
  for (const q of HERONS) {
    if (q.x < cam() - 200 || q.x > cam() + SCENE_W + 200) continue;
    const act = S.heron && S.heron.x === q.x ? S.heron : null;
    const dive = act ? clamp(act.t / .8, 0, 1) : 0;
    const back = act && act.t > .9 ? clamp((act.t - .9) / .9, 0, 1) : 0;
    const k = dive - back;
    ctx.save();
    ctx.translate(q.x, SURF);
    /* پاها در آب */
    ctx.strokeStyle = P.heronDk; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sd * 12, -6); ctx.lineTo(sd * 16, 92); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sd * 16, 92); ctx.lineTo(sd * 30, 100); ctx.stroke();
    }
    /* بدن، باریک و کشیده */
    ctx.fillStyle = P.heron;
    ctx.beginPath(); ctx.ellipse(6, -38, 42, 21, .06, 0, TAU); ctx.fill();
    ctx.fillStyle = P.heronDk;
    ctx.beginPath();
    ctx.moveTo(22, -46); ctx.quadraticCurveTo(72, -50, 96, -22);
    ctx.quadraticCurveTo(52, -26, 22, -36); ctx.fill();
    ctx.fillStyle = P.heron;
    ctx.beginPath();
    ctx.moveTo(-8, -50); ctx.quadraticCurveTo(30, -62, 52, -44);
    ctx.quadraticCurveTo(24, -36, -8, -40); ctx.fill();
    /* گردنِ بلندِ خمیده و منقارِ خنجری — هنگام شکار پایین می‌آید */
    const ny = -84 + k * 182, nx = -26 - k * 10;
    ctx.strokeStyle = P.heron; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, -48);
    ctx.bezierCurveTo(26 - k * 42, -70 - k * 6, -34 + k * 20, -74 + k * 92, nx, ny);
    ctx.stroke();
    ctx.fillStyle = P.heron;
    ctx.beginPath(); ctx.ellipse(nx, ny, 14, 11, .1, 0, TAU); ctx.fill();
    /* کاکل */
    ctx.strokeStyle = P.heronDk; ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(nx + 8, ny - 6); ctx.quadraticCurveTo(nx + 26, ny - 16, nx + 34, ny - 6);
    ctx.stroke();
    ctx.fillStyle = P.heronBeak;
    ctx.beginPath();
    ctx.moveTo(nx - 11, ny - 2 + k * 3);
    ctx.lineTo(nx - 78, ny + 12 + k * 34);
    ctx.lineTo(nx - 9, ny + 9 + k * 3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(120, 90, 20, .5)'; ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(nx - 11, ny + 3 + k * 3); ctx.lineTo(nx - 76, ny + 12 + k * 34); ctx.stroke();
    ctx.fillStyle = '#f7f4ea';
    ctx.beginPath(); ctx.arc(nx - 4, ny - 3, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#22303a';
    ctx.beginPath(); ctx.arc(nx - 5, ny - 3, 2.2, 0, TAU); ctx.fill();
    ctx.restore();
    if (act && act.t < .8) {
      ctx.save();
      ctx.globalAlpha = .6 * Math.sin(act.t / .8 * Math.PI);
      ctx.fillStyle = P.bad;
      ctx.beginPath(); ctx.arc(q.x, SURF + 120, 16, 0, TAU); ctx.fill();
      text('!', q.x, SURF + 120, { size: 24, family: 'Lalezar', color: P.card });
      ctx.restore();
    }
  }
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = 'rgba(12, 38, 50, .84)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(95, 192, 216, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(ST().n, SCENE_W - 130, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  const need = ST().need;
  for (let k = 0; k < need; k++) {
    const x = SCENE_W - 290 - k * 26;
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
  /* نقشهٔ رودخانه */
  if (S.stage >= 1) {
    const mx = 560, mw = 300, my = HUD_H - 12;
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.beginPath(); rrPath(mx, my - 4, mw, 7, 4); ctx.fill();
    ctx.fillStyle = P.accent;
    const u = 1 - clamp((S.wx - NEST_X) / (WORLD - NEST_X), 0, 1);
    ctx.beginPath(); ctx.arc(mx + mw - u * mw, my, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = P.gold;
    ctx.beginPath(); ctx.arc(mx + mw, my, 4, 0, TAU); ctx.fill();
  }
}

function drawAim() {
  if (!S.aim || S.tut.on || S.stage === 0) return;
  ctx.save();
  ctx.globalAlpha = .45;
  ctx.strokeStyle = P.foam; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.arc(S.aim.x, S.aim.y, 16 + Math.sin(S.t * 7) * 3, 0, TAU); ctx.stroke();
  ctx.restore();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: sx(), y: S.y, r: 96 }], .68);
    const h = tutCard(340, 300, 520,
      ['اینجا سنگ‌ریزه‌های بالادستِ رودخانه است', 'و یکی از این تخم‌ها تویی.'], 'از تخم تا ماهی');
    tutMore(600, 300 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: sx(), y: S.y, r: 96 }], .66);
    const h = tutCard(340, 300, 520, ['چند بار روی صفحه بزن', 'تا از تخم بیرون بیایی.']);
    tutMore(600, 300 + h + 8, S.t, P.ink);
  } else {
    spot([{ x: sx(), y: S.y, r: 110 }], .6);
    const h = tutCard(340, 180, 520,
      ['بعد هرجای آب را نگه داری، به همان‌سو شنا می‌کنی.', 'آبِ رودخانه هم تو را می‌بَرد.']);
    tutMore(600, 180 + h + 8, S.t, P.ink);
  }
}

function fishIcon(x, y) {
  ctx.save();
  ctx.translate(x + 12, y); ctx.scale(.7, .7);
  fishBody(46, { spots: true });
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 900, h: 330, y: 130,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: P.inkSoft,
    icon: fishIcon,
    title: 'از تخم تا ماهی',
    body: 'ماهی تخمش را لای سنگ‌ریزه‌های بالادستِ رودخانه می‌گذارد.\nنوزاد اوّل از کیسهٔ زردهٔ خودش می‌خورد، بعد آب او را پایین می‌بَرد،\nو ماهیِ بزرگ‌شده باید خلافِ جریان برگردد.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 900, h: 330, y: 134,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    icon: fishIcon,
    title: 'چرخه بسته شد',
    body: 'تخم، نوزاد، بچّه‌ماهی، ماهیِ بزرگ — و باز هم تخم.\nدیدی که آبِ کفِ رود و پشتِ سنگ‌ها کندتر است؟\nماهیِ واقعی هم برای بالا رفتن از همان‌جا می‌رود.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

/* ───────── قاب ───────── */

function draw() {
  beginScene(P.waterLo);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 47) * k * .5);
  }
  drawSkyAndHills();
  drawWater();
  ctx.save();
  ctx.translate(-cam(), 0);
  drawBed();
  drawNest();
  drawWeeds();
  drawMotes();
  drawGates();
  drawRocks();
  drawFood();
  drawPike();
  if (S.stage === 0) drawEggs(); else drawHero();
  drawHerons();
  ctx.restore();
  drawSurface();
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
    ctx.fillStyle = '#e8f8ff';
    ctx.fillRect(0, 0, SCENE_W, SCENE_H);
    ctx.restore();
  }
  endScene(.1, 'rgba(4, 24, 34, .42)', .26, .12);
}

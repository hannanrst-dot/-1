/*!
title: برکهٔ باد — نیرو همه‌جا (بازی)
bg: #10222b
*/

/* ═══════════════════════════════════════════════════════════════════════
   برکهٔ باد — علومِ سوم، درس ۹ «نیرو همه‌جا (۱)»  (بازی)

   فعّالیتِ کتاب: «قایقی بسازید که روی آب بماند. با نیروی فوت کردن آن
   را به حرکت درآورید. با فوت کردن، قایقِ در حالِ حرکت را متوقّف کنید.
   آیا می‌توانید با فوت کردن جهتِ حرکتِ قایق را تغییر دهید؟»

   اینجا انگشتِ بچّه همان فوت است: هرجای آب را نگه دارد، از آنجا باد
   می‌وزد و قایق را از خودش دور می‌کند. بقیه‌اش کشفِ خودِ اوست — که
   از پشت بوزی راه می‌افتد، از جلو بوزی می‌ایستد، از پهلو بوزی
   می‌پیچد. و آهن‌ربا هم بی‌آنکه دست بزند نیرو وارد می‌کند.

   ── درستیِ فیزیکی ───────────────────────────────────────────────
   قایق قانونِ حرکت را دارد و هیچ‌جا «انگار حرکت می‌کند» نیست:

        شتاب = نیرو ÷ جرم        (پس کلکِ سنگین دیرتر راه می‌افتد)
        سرعت = سرعت + شتاب × زمان
        مقاومتِ آب سرعت را کم می‌کند، پس قایقِ رهاشده کم‌کم می‌ایستد.

   بادِ فوت هرچه دورتر باشد ضعیف‌تر است (با مربّعِ فاصله کم می‌شود)،
   و نیروی آهن‌ربا هم بدونِ تماس و با مربّعِ فاصله کار می‌کند — یکی
   می‌کشد و یکی می‌راند. برخورد با سنگ هم قایقِ کاغذی را می‌چلاند:
   نیرو شکلِ جسم را هم عوض می‌کند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  water: '#1d5f75', waterDk: '#10404f', waterLt: '#3d90a8', foam: '#bfe6ef',
  shore: '#3f6a4a', shoreDk: '#274634', sand: '#c9b483', sandDk: '#9c8759',
  paper: '#fbf6e6', paperDk: '#d9cfae', card: '#ffffff',
  boat:  '#f7f1dd', boatDk: '#cbbf9a', boatIn: '#e2d7b4',
  rock:  '#7d8790', rockDk: '#4d565e',
  reed:  '#4f9f5e', leaf: '#3f8f52',
  ink:   '#12303a', inkSoft: '#6f8b93',
  good:  '#59b47f', bad: '#d3624a', gold: '#e5b344', accent: '#5fc0d8',
  magN:  '#d3624a', magS: '#4f7fc4', wind: '#cfeef6',
  dock:  '#a3763f', dockDk: '#6d4c26',
};

/* ───────── قانونِ حرکت ───────── */

const BOAT_R = 22;
const K_WIND = 520;          /* توانِ باد (شتابِ بیشینه، پیکسل بر مجذورِ ثانیه) */
const R0 = 130;              /* از این فاصله به بعد باد ضعیف می‌شود */
const DRAG = 1.15;           /* مقاومتِ آب */
const G_MAG = 2400000;       /* توانِ آهن‌ربا */
const REST = .45;            /* واکنشِ برخورد */
const V_STOP = 26;           /* «ایستاده» یعنی از این کندتر */

const POND = { x: 30, y: 90, w: 1140, h: 646 };

const LEVELS = [
  { name: 'تا اسکله', mass: 1,
    start: { x: 210, y: 400 }, goal: { x: 950, y: 400, r: 56 },
    rocks: [], mags: [] },

  { name: 'آرام بایست', mass: 1, stop: true,
    start: { x: 200, y: 250 }, goal: { x: 900, y: 500, r: 52 },
    rocks: [], mags: [] },

  { name: 'دور بزن', mass: 1,
    start: { x: 160, y: 620 }, goal: { x: 1030, y: 190, r: 52 },
    rocks: [{ x: 620, y: 150, r: 46 }, { x: 620, y: 240, r: 46 },
            { x: 620, y: 330, r: 46 }, { x: 620, y: 420, r: 46 }],
    mags: [] },

  { name: 'کلکِ سنگین', mass: 3.2,
    start: { x: 200, y: 400 }, goal: { x: 990, y: 400, r: 58 },
    rocks: [{ x: 600, y: 200, r: 44 }, { x: 600, y: 600, r: 44 }],
    mags: [] },

  { name: 'آهن‌رباها', mass: 1, iron: true,
    start: { x: 160, y: 400 }, goal: { x: 1040, y: 400, r: 54 },
    rocks: [],
    mags: [{ x: 600, y: 214, p: 1 }, { x: 600, y: 586, p: -1 }] },

  { name: 'برکهٔ سخت', mass: 1.6, iron: true, stop: true,
    start: { x: 150, y: 620 }, goal: { x: 1040, y: 190, r: 50 },
    rocks: [{ x: 560, y: 620, r: 44 }, { x: 560, y: 530, r: 44 },
            { x: 560, y: 440, r: 44 }, { x: 830, y: 150, r: 44 },
            { x: 830, y: 240, r: 44 }],
    mags: [{ x: 300, y: 300, p: -1 }, { x: 900, y: 520, p: 1 }] },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  level: 0, score: 0, best: 0,
  b: { x: 0, y: 0, vx: 0, vy: 0, ang: 0, squash: 0 },
  blow: null,               /* {x, y} تا وقتی انگشت روی آب است */
  dents: 0,
  inGoal: 0,
  won: false, winT: 0,
  puffs: [], ripples: [],
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const L = () => LEVELS[Math.min(S.level, LEVELS.length - 1)];
function tip(msg) { S.tip = msg; S.tipT = 3.2; }

function loadLevel(i) {
  S.level = i;
  const lv = LEVELS[i];
  S.b = { x: lv.start.x, y: lv.start.y, vx: 0, vy: 0, ang: 0, squash: 0 };
  S.blow = null; S.dents = 0; S.inGoal = 0;
  S.won = false; S.winT = 0;
  S.puffs.length = 0; S.ripples.length = 0;
}

function startLevel(i, keep) {
  S.phase = 'play'; S.phaseT = 0;
  if (!keep) S.score = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  loadLevel(i);
}

/* ───────── فیزیک ───────── */

/** نیروی باد روی قایق، از نقطه‌ای که انگشت روی آن است. */
function windForce(bx, by, wx, wy) {
  const dx = bx - wx, dy = by - wy;
  const d = Math.max(6, Math.hypot(dx, dy));
  const f = K_WIND / (1 + (d / R0) * (d / R0));
  return { fx: f * dx / d, fy: f * dy / d };
}

/** نیروی آهن‌ربا: بدونِ تماس، با مربّعِ فاصله. */
function magForce(bx, by, m) {
  const dx = m.x - bx, dy = m.y - by;
  const d = Math.max(46, Math.hypot(dx, dy));
  const f = G_MAG / (d * d) * m.p;      /* p=+۱ می‌کشد، p=−۱ می‌راند */
  return { fx: f * dx / d, fy: f * dy / d };
}

function physics(dt) {
  const lv = L();
  const b = S.b;
  let fx = 0, fy = 0;
  if (S.blow) {
    const w = windForce(b.x, b.y, S.blow.x, S.blow.y);
    fx += w.fx; fy += w.fy;
  }
  if (lv.iron) for (const m of lv.mags) {
    const g = magForce(b.x, b.y, m);
    fx += g.fx; fy += g.fy;
  }
  b.vx += fx / lv.mass * dt;
  b.vy += fy / lv.mass * dt;
  const k = Math.exp(-DRAG * dt);
  b.vx *= k; b.vy *= k;
  b.x += b.vx * dt; b.y += b.vy * dt;

  /* لبهٔ برکه */
  const pad = BOAT_R + 6;
  if (b.x < POND.x + pad) { b.x = POND.x + pad; b.vx = Math.abs(b.vx) * REST; }
  if (b.x > POND.x + POND.w - pad) { b.x = POND.x + POND.w - pad; b.vx = -Math.abs(b.vx) * REST; }
  if (b.y < POND.y + pad) { b.y = POND.y + pad; b.vy = Math.abs(b.vy) * REST; }
  if (b.y > POND.y + POND.h - pad) { b.y = POND.y + POND.h - pad; b.vy = -Math.abs(b.vy) * REST; }

  /* سنگ‌ها — نیرو شکلِ قایقِ کاغذی را هم عوض می‌کند */
  for (const r of lv.rocks) {
    const dx = b.x - r.x, dy = b.y - r.y;
    const d = Math.hypot(dx, dy), min = r.r + BOAT_R;
    if (d >= min || d < 1e-6) continue;
    const nx = dx / d, ny = dy / d;
    b.x = r.x + nx * min; b.y = r.y + ny * min;
    const vn = b.vx * nx + b.vy * ny;
    b.vx -= (1 + REST) * vn * nx;
    b.vy -= (1 + REST) * vn * ny;
    const sp = Math.abs(vn);
    if (sp > 120) {
      b.squash = Math.min(1, b.squash + sp / 900);
      if (sp > 260) {
        S.dents++;
        sfx.nope(); S.shake = .16;
        bits.spark(b.x, b.y, 10, [P.foam, P.boat]);
        if (S.dents >= 3) {
          tip('قایق خیلی چروک شد — از اوّل.');
          S.b = { x: lv.start.x, y: lv.start.y, vx: 0, vy: 0, ang: 0, squash: .6 };
          S.dents = 0;
        }
      }
    }
    ripple(b.x, b.y, 1);
  }

  const sp = Math.hypot(b.vx, b.vy);
  if (sp > 8) b.ang = Math.atan2(b.vy, b.vx);
  b.squash = Math.max(0, b.squash - dt * .5);

  /* رسیدن */
  const g = lv.goal;
  const dg = Math.hypot(b.x - g.x, b.y - g.y);
  const ok = dg < g.r - 6 && (!lv.stop || sp < V_STOP);
  if (ok) S.inGoal += dt; else S.inGoal = 0;
  if (!S.won && S.inGoal > (lv.stop ? .7 : .3)) winLevel();
}

function winLevel() {
  if (S.won) return;
  S.won = true; S.winT = .001;
  S.score += 120 + S.level * 30;
  if (S.score > S.best) S.best = S.score;
  sfx.win();
  const g = L().goal;
  bits.confetti(g.x, g.y, 30, [P.gold, P.foam, P.good, '#fff']);
}

function ripple(x, y, k) {
  if (S.ripples.length > 26) return;
  S.ripples.push({ x, y, r: 6, a: .5 * k });
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.tut.on) S.tut.t += dt;

  if (S.phase === 'play' && !S.winT) physics(dt);

  /* باد و موج */
  if (S.blow && S.puffs.length < 30 && Math.random() < dt * 26) {
    const a = Math.random() * TAU;
    S.puffs.push({ x: S.blow.x, y: S.blow.y, a, r: 8, life: 0 });
  }
  for (let i = S.puffs.length - 1; i >= 0; i--) {
    const p = S.puffs[i];
    p.life += dt; p.r += dt * 190;
    if (p.life > .8) S.puffs.splice(i, 1);
  }
  for (let i = S.ripples.length - 1; i >= 0; i--) {
    const r = S.ripples[i];
    r.r += dt * 60; r.a -= dt * .7;
    if (r.a <= 0) S.ripples.splice(i, 1);
  }
  if (Math.hypot(S.b.vx, S.b.vy) > 60 && Math.random() < dt * 12) ripple(S.b.x, S.b.y, .6);

  if (S.winT) {
    S.winT += dt;
    if (S.winT > 2.2) {
      S.winT = 0;
      if (S.level >= LEVELS.length - 1) { S.phase = 'won'; S.phaseT = 0; }
      else { loadLevel(S.level + 1); toast.say(L().name, 'good'); }
    }
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { loadLevel(0); runLoop(step); });

/* ───────── جای‌ها و ورودی ───────── */

const BTN_RESET = { x: SCENE_W - 190, y: 12, w: 150, h: 34 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };
const TUT_TAP = [0, 1, 2], TUT_LAST = 2;

const inPond = (p) => p.x > POND.x && p.x < POND.x + POND.w && p.y > POND.y && p.y < POND.y + POND.h;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.blow) { if (inPond(p)) { S.blow.x = p.x; S.blow.y = p.y; } return; }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else if (inRect(p, BTN_RESET)) S.hover = { k: 'reset' };
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startLevel(0); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.score = 0; loadLevel(0); sfx.tap(); }
    return;
  }
  if (inRect(p, BTN_RESET)) { loadLevel(S.level); sfx.tap(); return; }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (S.winT) return;
  if (!inPond(p)) return;
  S.blow = { x: p.x, y: p.y };
  try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ }
  sfx.slide();
});

function release() { S.blow = null; }
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

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
  for (const s of shapes) {
    ctx.moveTo(s.x + s.r, s.y);
    ctx.arc(s.x, s.y, s.r, 0, TAU, true);
  }
  ctx.fillStyle = `rgba(6, 20, 26, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 246, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '4, 16, 22');
  ctx.fillStyle = P.accent;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#5f7b84' }); yy += 30; }
  return h + 20;
}

/* ───────── برکه ───────── */

function paintPondStatic() {
  ctx.fillStyle = P.shoreDk;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.beginPath(); rrPath(0, HUD_H, SCENE_W, SCENE_H - HUD_H, 0); ctx.clip();
  ctx.fillStyle = texCloth(P.shore, '#20402c');
  ctx.fillRect(0, HUD_H, SCENE_W, SCENE_H - HUD_H);
  ctx.restore();
  /* ماسهٔ لبه */
  ctx.fillStyle = P.sandDk;
  ctx.beginPath(); rrPath(POND.x - 16, POND.y - 16, POND.w + 32, POND.h + 32, 46); ctx.fill();
  ctx.fillStyle = P.sand;
  ctx.beginPath(); rrPath(POND.x - 10, POND.y - 10, POND.w + 20, POND.h + 20, 42); ctx.fill();
  /* آب */
  ctx.save();
  ctx.beginPath(); rrPath(POND.x, POND.y, POND.w, POND.h, 38); ctx.clip();
  const g = ctx.createLinearGradient(0, POND.y, 0, POND.y + POND.h);
  g.addColorStop(0, P.waterLt); g.addColorStop(.4, P.water); g.addColorStop(1, P.waterDk);
  ctx.fillStyle = g;
  ctx.fillRect(POND.x, POND.y, POND.w, POND.h);
  /* موج‌های ثابت */
  ctx.strokeStyle = 'rgba(191,230,239,.10)'; ctx.lineWidth = 3;
  for (let i = 0; i < 26; i++) {
    const y = POND.y + 24 + i * 25;
    ctx.beginPath();
    for (let x = POND.x; x < POND.x + POND.w; x += 22) {
      ctx.lineTo(x, y + Math.sin((x + i * 60) * .02) * 5);
    }
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(16,64,79,.5)'; ctx.lineWidth = 4;
  ctx.beginPath(); rrPath(POND.x, POND.y, POND.w, POND.h, 38); ctx.stroke();
}

function drawReeds() {
  ctx.save();
  ctx.strokeStyle = P.reed; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) {
    const x = POND.x + 20 + ((i * 137) % (POND.w - 40));
    const on = i % 2 === 0;
    const y = on ? POND.y - 4 : POND.y + POND.h + 4;
    const dir = on ? -1 : 1;
    const sw = Math.sin(S.t * 1.4 + i) * 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + sw * .5, y + dir * 22, x + sw, y + dir * 44);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRocks() {
  for (const r of L().rocks) {
    contact(r.x, r.y + r.r * .5, r.r * 1.1, r.r * .5, .3);
    ctx.fillStyle = P.rockDk;
    wobbleCircle(r.x, r.y + 3, r.r, r.x, 3); ctx.fill();
    ctx.fillStyle = ball(r.x, r.y, r.r, '#a9b3bb', P.rock, P.rockDk);
    wobbleCircle(r.x, r.y, r.r, r.x, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    wobbleEllipse(r.x - r.r * .3, r.y - r.r * .35, r.r * .34, r.r * .2, -.5, r.y, 1); ctx.fill();
  }
}

function drawMagnets() {
  const lv = L();
  for (const m of lv.mags) {
    /* میدانِ دیدنی */
    ctx.save();
    ctx.globalAlpha = .22 + .06 * Math.sin(S.t * 2 + m.x);
    ctx.strokeStyle = m.p > 0 ? P.magN : P.magS;
    ctx.lineWidth = 2;
    for (let k = 1; k <= 3; k++) {
      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = (m.p > 0 ? -1 : 1) * S.t * 22;
      ctx.beginPath(); ctx.arc(m.x, m.y, 40 + k * 32, 0, TAU); ctx.stroke();
    }
    ctx.restore();
    /* قرصِ آهن‌ربا: پیکان‌های به‌داخل یعنی می‌کشد، به‌بیرون یعنی می‌راند */
    ctx.save();
    ctx.translate(m.x, m.y);
    withShadow(14, 5, .45, () => {
      ctx.fillStyle = '#4d565e';
      wobbleCircle(0, 0, 30, m.x, 1.4); ctx.fill();
    }, '0,0,0');
    ctx.fillStyle = ball(0, 0, 28, '#b9c3cb', '#8d99a3', '#5c6870');
    wobbleCircle(0, 0, 27, m.x + 3, 1.2); ctx.fill();
    ctx.fillStyle = m.p > 0 ? P.magN : P.magS;
    wobbleCircle(0, 0, 19, m.x + 7, 1); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
      const a = i * TAU / 4 + Math.PI / 4;
      const ca = Math.cos(a), sa = Math.sin(a);
      const r0 = m.p > 0 ? 17 : 7, r1 = m.p > 0 ? 8 : 16;
      ctx.beginPath();
      ctx.moveTo(ca * r0, sa * r0); ctx.lineTo(ca * r1, sa * r1);
      ctx.stroke();
      /* نوکِ پیکان */
      ctx.save();
      ctx.translate(ca * r1, sa * r1);
      ctx.rotate(a + (m.p > 0 ? Math.PI : 0));
      ctx.beginPath();
      ctx.moveTo(4, 0); ctx.lineTo(-3, -4); ctx.lineTo(-3, 4);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

function drawGoal() {
  const g = L().goal;
  const k = .5 + .5 * Math.sin(S.t * 2.4);
  ctx.save();
  ctx.globalAlpha = .5 + .3 * k;
  ctx.strokeStyle = P.gold; ctx.lineWidth = 4;
  ctx.setLineDash([12, 10]);
  ctx.lineDashOffset = -S.t * 26;
  ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, TAU); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = .16;
  ctx.fillStyle = P.gold;
  ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, TAU); ctx.fill();
  ctx.restore();
  /* اسکلهٔ چوبی */
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.fillStyle = P.dockDk;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); rrPath(-30 + i * 0, -34 + (i + 1) * 22, 60, 15, 4); ctx.fill();
  }
  ctx.fillStyle = P.dock;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); rrPath(-30, -36 + (i + 1) * 22, 60, 14, 4); ctx.fill();
  }
  ctx.fillStyle = P.dockDk;
  ctx.beginPath(); ctx.arc(-24, -30, 5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(24, 24, 5, 0, TAU); ctx.fill();
  ctx.restore();
  if (L().stop) {
    ctx.save();
    ctx.globalAlpha = .8;
    text('اینجا آرام بایست', g.x, g.y + g.r + 22, { size: 15, color: P.paper });
    ctx.restore();
  }
}

function drawBoat() {
  const b = S.b;
  const sp = Math.hypot(b.vx, b.vy);
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.ang);
  const sq = 1 - b.squash * .3;
  ctx.scale(1.25, 1.25 * sq);
  /* سایه روی آب */
  ctx.fillStyle = 'rgba(8,40,50,.3)';
  wobbleEllipse(2, 6, 26, 14, 0, 5, 1.4); ctx.fill();
  /* بدنهٔ کاغذی */
  ctx.fillStyle = P.boatDk;
  ctx.beginPath();
  ctx.moveTo(30, 0); ctx.lineTo(-18, -19); ctx.lineTo(-22, 0); ctx.lineTo(-18, 19);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.boat;
  ctx.beginPath();
  ctx.moveTo(28, 0); ctx.lineTo(-16, -17); ctx.lineTo(-19, 0); ctx.lineTo(-16, 17);
  ctx.closePath(); ctx.fill();
  /* بادبانِ کاغذی */
  ctx.fillStyle = P.boatIn;
  ctx.beginPath();
  ctx.moveTo(6, 0); ctx.lineTo(-12, -12); ctx.lineTo(-12, 12);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = P.boatDk; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(26, 0); ctx.stroke();
  ctx.strokeStyle = 'rgba(64,44,20,.45)'; ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(28, 0); ctx.lineTo(-16, -17); ctx.lineTo(-19, 0); ctx.lineTo(-16, 17);
  ctx.closePath(); ctx.stroke();
  if (L().iron) {
    ctx.fillStyle = '#8d9bb0';
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c3ced6';
    ctx.beginPath(); ctx.arc(-1.5, -1.5, 3.4, 0, TAU); ctx.fill();
  }
  ctx.restore();
  /* دنبالهٔ کف */
  if (sp > 40) {
    ctx.save();
    ctx.globalAlpha = clamp(sp / 400, 0, .5);
    ctx.fillStyle = P.foam;
    const a = Math.atan2(b.vy, b.vx);
    wobbleEllipse(b.x - Math.cos(a) * 30, b.y - Math.sin(a) * 30, 16, 9, a, 7, 1.4);
    ctx.fill();
    ctx.restore();
  }
}

function drawWind() {
  for (const r of S.ripples) {
    ctx.strokeStyle = `rgba(191,230,239,${Math.max(0, r.a)})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, TAU); ctx.stroke();
  }
  if (!S.blow) return;
  const w = S.blow;
  /* موجِ بادِ فوت */
  ctx.save();
  ctx.globalAlpha = .5;
  ctx.strokeStyle = P.wind; ctx.lineWidth = 2.4;
  for (const p of S.puffs) {
    const k = clamp(1 - p.life / .8, 0, 1);
    ctx.globalAlpha = k * .55;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, p.a - .5, p.a + .5);
    ctx.stroke();
  }
  ctx.restore();
  /* لکّهٔ باد */
  ctx.save();
  const g = ctx.createRadialGradient(w.x, w.y, 4, w.x, w.y, 70);
  g.addColorStop(0, 'rgba(207,238,246,.42)');
  g.addColorStop(1, 'rgba(207,238,246,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(w.x, w.y, 70, 0, TAU); ctx.fill();
  ctx.restore();
  /* پیکانِ نیرو روی قایق */
  const b = S.b;
  const f = windForce(b.x, b.y, w.x, w.y);
  const mag = Math.hypot(f.fx, f.fy);
  const len = clamp(mag / K_WIND * 96, 10, 96);
  const a = Math.atan2(f.fy, f.fx);
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(a);
  ctx.globalAlpha = .85;
  ctx.strokeStyle = P.wind; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(26 + len, 0); ctx.stroke();
  ctx.fillStyle = P.wind;
  ctx.beginPath();
  ctx.moveTo(30 + len, 0); ctx.lineTo(18 + len, -9); ctx.lineTo(18 + len, 9);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#0a1a21';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(95,192,216,.25)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 330, HUD_H / 2, { size: 24, family: 'Lalezar', color: P.paper });
  numText(fa(S.level + 1) + ' / ' + fa(LEVELS.length), 640, HUD_H / 2, { size: 21, color: P.gold });
  numText(fa(S.score), 300, HUD_H / 2, { size: 20, color: P.paper });
  text('بیشترین ' + fa(S.best), 150, HUD_H / 2, { size: 15, color: 'rgba(251,246,230,.6)' });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * clamp((S.level + (S.won ? 1 : 0)) / LEVELS.length, 0, 1), 5, 3); ctx.fill();
  button(BTN_RESET, 'از اوّل', {
    hot: S.hover && S.hover.k === 'reset', fill: '#2b5b68', hotFill: '#3d7a8a', size: 17, r: 10 });
  /* چروکِ قایق */
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < S.dents ? P.bad : 'rgba(255,255,255,.2)';
    ctx.beginPath(); ctx.arc(SCENE_W - 480 - i * 20, HUD_H / 2, 6, 0, TAU); ctx.fill();
  }
}

function drawTutorial() {
  const st = S.tut.step;
  const b = S.b, g = L().goal;
  if (st === 0) {
    spot([{ x: b.x, y: b.y, r: 90 }], .68);
    const h = tutCard(360, 380, 480, ['یک قایقِ کاغذی روی برکه.'], 'برکهٔ باد');
    tutMore(600, 380 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: b.x + 150, y: b.y, r: 80 }], .66);
    const h = tutCard(300, 380, 600,
      ['هرجای آب را نگه داری، از همان‌جا باد می‌وزد', 'و قایق را از خودش دور می‌کند.']);
    tutMore(600, 380 + h + 8, S.t, P.ink);
  } else {
    spot([{ x: g.x, y: g.y, r: g.r + 26 }], .66);
    const h = tutCard(300, 400, 600, ['قایق را برسان به اسکله.']);
    tutMore(600, 400 + h + 8, S.t, P.ink);
  }
}

function boatIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.water;
  ctx.beginPath(); rrPath(-52, 10, 104, 16, 8); ctx.fill();
  ctx.fillStyle = P.boatDk;
  ctx.beginPath();
  ctx.moveTo(-36, 12); ctx.lineTo(36, 12); ctx.lineTo(24, 30); ctx.lineTo(-24, 30);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.boat;
  ctx.beginPath();
  ctx.moveTo(0, -26); ctx.lineTo(26, 10); ctx.lineTo(-26, 10);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 860, h: 306, y: 128,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: '#5f7b84',
    icon: boatIcon,
    title: 'برکهٔ باد',
    body: 'انگشتت همان فوتِ توست: هرجای آب را نگه داری، از آنجا باد می‌وزد\nو قایق را از خودش دور می‌کند.\nقایق را برسان به اسکله — و ببین با باد چه کارهایی می‌شود کرد.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 800, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#5f7b84',
    icon: boatIcon,
    title: 'ناخدای برکه',
    body: 'با یک باد، هم راه انداختی، هم نگه داشتی، هم پیچاندی.\nکلکِ سنگین دیرتر راه افتاد و آهن‌ربا بی‌آنکه دست بزند نیرو آورد.\nامتیازت: ' + fa(S.score),
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function draw() {
  beginScene(P.waterDk);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  const layer = staticLayer('pond', SCENE_W, SCENE_H, paintPondStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.beginPath(); rrPath(POND.x, POND.y, POND.w, POND.h, 38); ctx.clip();
  drawGoal();
  drawMagnets();
  drawWind();
  drawRocks();
  drawBoat();
  bits.draw();
  ctx.restore();
  drawReeds();
  ctx.restore();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 470;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 56, w, 42, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 35, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.07, 'rgba(4, 24, 32, .42)', 0, .1);
}

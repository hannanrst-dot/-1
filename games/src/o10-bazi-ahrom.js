/*!
title: کارگاهِ اهرم — نیرو همه‌جا ۲ (بازی)
bg: #221b16
*/

/* ═══════════════════════════════════════════════════════════════════════
   کارگاهِ اهرم — علومِ سوم، درس ۱۰ «نیرو همه‌جا (۲)»  (بازی)

   کتاب می‌پرسد: «تنهٔ سنگینِ درخت جلوی آب را گرفته بود؛ پدرِ علی چگونه
   توانست آن را جابه‌جا کند؟» و بعد: «وزنه را یک بار با دست بلند کنید و
   بار دیگر با یک تخته و تکیه‌گاه.»

   اینجا همان تخته و تکیه‌گاه است. زورِ بچّه ثابت است — هرچه فشار بدهد
   بیشتر از این نمی‌شود. پس تنها کاری که از دستش برمی‌آید این است که
   تکیه‌گاه را جابه‌جا کند و جای دستش را عوض کند.

   ── درستیِ فیزیکی ───────────────────────────────────────────────
   تخته یک جسمِ صُلبِ چرخان حولِ تکیه‌گاه است و گشتاورها واقعی‌اند:

        گشتاور = نیرو × فاصله از تکیه‌گاه × کسینوسِ زاویه
        شتابِ زاویه‌ای = گشتاورِ خالص ÷ لختیِ چرخشی

   وزنِ تخته هم حساب می‌شود. و دو چیز با هم درگیرند، همان چیزی که
   اهرم را اهرم می‌کند:
     ▸ هرچه تکیه‌گاه به بار نزدیک‌تر باشد، بلند کردنش آسان‌تر است،
     ▸ ولی همان‌قدر هم بار کمتر بالا می‌رود.
   پس برای هر کار یک «جای درست» هست، نه نزدیک‌ترین جا. بازی این را
   نمی‌گوید؛ فقط می‌گذارد بچّه خودش پیدایش کند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  sky:   '#3b5668', skyLo: '#263a49', dirt: '#6b4f38', dirtDk: '#3f2f21',
  grass: '#5d8f4a', grassDk: '#3d6b31',
  wood:  '#b98a53', woodDk: '#7d5a30', woodLt: '#dcb27c',
  rock:  '#8d949c', rockDk: '#565d64', rockLt: '#b8bfc6',
  bark:  '#7b5a3a', barkDk: '#4d3722', leaf: '#4f9f5e',
  barrel: '#a8622f', barrelDk: '#6d3d19', hoop: '#8d949c',
  paper: '#fbf3e2', card: '#ffffff',
  ink:   '#2a1f16', inkSoft: '#8a7a68',
  good:  '#6aa85e', bad: '#c8563e', gold: '#e0a63f', accent: '#d98b3a',
  force: '#d94f3d', pushc: '#3f8fd0',
};

/* ───────── قانونِ اهرم ───────── */

const G = 9.81;
const PXM = 260;              /* پیکسل بر متر */
const GROUND_Y = 660;
const LOAD_X = 330;           /* جای بارِ روی زمین */
const HF = .28;               /* بلندیِ تکیه‌گاه، متر */
const FMAX = 300;             /* زورِ بچّه، نیوتون */
const PLANK_M = 4;            /* جرمِ تخته، کیلوگرم */
const DAMP = 2.2;

const LEVELS = [
  { name: 'سنگِ کوچک', L: 1.8, m: 15,  H: .40, kind: 'rock' },
  { name: 'سنگِ بزرگ', L: 1.8, m: 40,  H: .40, kind: 'rock' },
  { name: 'تنهٔ درخت', L: 1.8, m: 90,  H: .34, kind: 'log' },
  { name: 'تختهٔ کوتاه', L: 1.2, m: 40, H: .36, kind: 'rock' },
  { name: 'بشکهٔ سنگین', L: 2.2, m: 70, H: .36, kind: 'barrel' },
  { name: 'کارِ آخر',  L: 2.0, m: 110, H: .33, kind: 'log' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  level: 0, score: 0, best: 0,
  d: .6,                 /* فاصلهٔ تکیه‌گاه از بار، متر */
  th: 0, om: 0,          /* زاویه و سرعتِ زاویه‌ای */
  press: null,           /* {s} فاصلهٔ جای دست از سرِ بار، متر */
  drag: null,
  hold: 0,
  won: false, winT: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const L = () => LEVELS[Math.min(S.level, LEVELS.length - 1)];
function tip(msg) { S.tip = msg; S.tipT = 3.2; }

const dLoad = () => S.d;
const dEff = () => L().L - S.d;
const thMax = () => Math.asin(Math.min(1, HF / dLoad()));     /* بار روی زمین */
const thMin = () => -Math.asin(Math.min(1, HF / dEff()));     /* سرِ دست روی زمین */
/** بلندیِ بار از زمین، متر. */
const loadH = () => HF - dLoad() * Math.sin(S.th);

function loadLevel(i) {
  S.level = i;
  S.d = Math.min(.6, LEVELS[i].L * .45);
  S.th = thMax(); S.om = 0;
  S.press = null; S.drag = null; S.hold = 0;
  S.won = false; S.winT = 0;
}

function startLevel(i, keep) {
  S.phase = 'play'; S.phaseT = 0;
  if (!keep) S.score = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  loadLevel(i);
}

/* ───────── جای‌ها روی صحنه ───────── */

const fulX = () => LOAD_X + dLoad() * PXM;
const fulTopY = () => GROUND_Y - HF * PXM;
/** نقطه‌ای روی تخته، به فاصلهٔ s متر از سرِ بار. */
function plankPt(s) {
  const u = s - dLoad();                 /* از تکیه‌گاه، مثبت یعنی سمتِ دست */
  return {
    x: fulX() + u * PXM * Math.cos(S.th),
    y: fulTopY() + u * PXM * Math.sin(S.th),
  };
}

/* ───────── فیزیک ───────── */

function physics(dt) {
  const lv = L();
  const dl = dLoad(), de = dEff();
  const Wl = lv.m * G, Wp = PLANK_M * G;
  /* گشتاورها حولِ تکیه‌گاه؛ مثبت یعنی سمتِ بار پایین می‌رود */
  let tau = Wl * dl + Wp * (dl - lv.L / 2);
  if (S.press !== null) tau -= FMAX * (S.press - dl);
  tau *= Math.cos(S.th);
  /* لختیِ چرخشی حولِ تکیه‌گاه */
  const I = PLANK_M * (lv.L * lv.L / 12 + Math.pow(lv.L / 2 - dl, 2)) + lv.m * dl * dl;
  S.om += tau / I * dt;
  S.om *= Math.exp(-DAMP * dt);
  S.th += S.om * dt;
  const hi = thMax(), lo = thMin();
  if (S.th > hi) { S.th = hi; if (S.om > 0) S.om = 0; }
  if (S.th < lo) { S.th = lo; if (S.om < 0) S.om = 0; }

  if (!S.won) {
    if (loadH() >= lv.H) {
      S.hold += dt;
      if (S.hold > .5) winLevel();
    } else S.hold = 0;
  }
}

function winLevel() {
  if (S.won) return;
  S.won = true; S.winT = .001;
  S.score += 120 + S.level * 30;
  if (S.score > S.best) S.best = S.score;
  sfx.win();
  const p = plankPt(0);
  bits.confetti(p.x, p.y - 30, 28, [P.gold, P.leaf, P.card, '#fff']);
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.tut.on) S.tut.t += dt;
  if (S.phase === 'play' && !S.winT) physics(dt);
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

/* ───────── ورودی ───────── */

const BTN_RESET = { x: SCENE_W - 186, y: 12, w: 150, h: 34 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };
const TUT_TAP = [0, 1, 2], TUT_LAST = 2;

/** فاصلهٔ نقطه تا تخته، و جایش روی تخته. */
function onPlank(p) {
  const a = plankPt(0), b = plankPt(L().L);
  const vx = b.x - a.x, vy = b.y - a.y;
  const len2 = vx * vx + vy * vy;
  const u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / len2, 0, 1);
  const qx = a.x + vx * u, qy = a.y + vy * u;
  return { d: Math.hypot(p.x - qx, p.y - qy), s: u * L().L };
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.drag === 'ful') {
    const d = (p.x - LOAD_X) / PXM;
    S.d = clamp(d, .14, L().L - .14);
    S.th = clamp(S.th, thMin(), thMax());
    return;
  }
  if (S.press !== null && S.drag === 'push') {
    const q = onPlank(p);
    S.press = q.s;
    return;
  }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    if (inRect(p, BTN_RESET)) S.hover = { k: 'reset' };
    if (Math.hypot(p.x - fulX(), p.y - (GROUND_Y - 18)) < 60) S.hover = { k: 'ful' };
    else if (onPlank(p).d < 34) S.hover = { k: 'plank' };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  const cap = () => { try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ } };
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startLevel(0); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.score = 0; loadLevel(0); sfx.tap(); }
    return;
  }
  if (inRect(p, BTN_RESET)) { loadLevel(S.level); sfx.tap(); return; }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (S.winT) return;
  if (Math.hypot(p.x - fulX(), p.y - (GROUND_Y - 18)) < 60) {
    S.drag = 'ful'; cap(); sfx.tap();
    return;
  }
  const q = onPlank(p);
  if (q.d < 40) {
    S.press = q.s; S.drag = 'push'; cap(); sfx.slide();
  }
});

function release() { S.press = null; S.drag = null; }
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
  for (const s of shapes) { ctx.moveTo(s.x + s.r, s.y); ctx.arc(s.x, s.y, s.r, 0, TAU, true); }
  ctx.fillStyle = `rgba(24, 14, 8, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 250, 240, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '30, 16, 8');
  ctx.fillStyle = P.accent;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#7a6a58' }); yy += 30; }
  return h + 20;
}

function arrow(x, y, len, col, w) {
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + len - 12); ctx.stroke();
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x, y + len); ctx.lineTo(x - w * 1.6, y + len - 16); ctx.lineTo(x + w * 1.6, y + len - 16);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ───────── صحنه ───────── */

function paintYardStatic() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, GROUND_Y);
  g.addColorStop(0, P.skyLo); g.addColorStop(1, P.sky);
  ctx.fillStyle = g;
  ctx.fillRect(0, HUD_H, SCENE_W, GROUND_Y - HUD_H);
  /* تپّه‌های دور */
  ctx.fillStyle = 'rgba(30,58,73,.7)';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= SCENE_W; x += 40) {
    ctx.lineTo(x, GROUND_Y - 90 - Math.sin(x * .006) * 46 - Math.sin(x * .013) * 22);
  }
  ctx.lineTo(SCENE_W, GROUND_Y); ctx.closePath(); ctx.fill();
  /* زمین */
  ctx.save();
  ctx.beginPath(); ctx.rect(0, GROUND_Y, SCENE_W, SCENE_H - GROUND_Y); ctx.clip();
  ctx.fillStyle = texStone(P.dirt, P.dirtDk);
  ctx.fillRect(0, GROUND_Y, SCENE_W, SCENE_H - GROUND_Y);
  ctx.fillStyle = vgrad(GROUND_Y, SCENE_H, 'rgba(255,255,255,.12)', 'rgba(0,0,0,.4)');
  ctx.fillRect(0, GROUND_Y, SCENE_W, SCENE_H - GROUND_Y);
  ctx.restore();
  /* درختِ کنارِ کارگاه */
  ctx.save();
  ctx.translate(1090, GROUND_Y);
  ctx.fillStyle = '#5a4028';
  ctx.beginPath(); rrPath(-16, -170, 32, 172, 8); ctx.fill();
  ctx.strokeStyle = '#4a331f'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(-46, -160); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -140); ctx.lineTo(44, -178); ctx.stroke();
  for (const [cx, cy, r] of [[-46, -196, 56], [46, -212, 62], [0, -238, 66], [4, -180, 58]]) {
    ctx.fillStyle = '#3f6b31';
    wobbleCircle(cx, cy + 6, r, cx, 4); ctx.fill();
    ctx.fillStyle = '#4f8f3e';
    wobbleCircle(cx, cy, r * .92, cx + 3, 4); ctx.fill();
  }
  ctx.restore();
  /* ابرها */
  ctx.fillStyle = 'rgba(226,238,246,.16)';
  for (const [cx, cy, r] of [[210, 160, 40], [258, 148, 52], [312, 164, 36],
                             [880, 128, 34], [926, 118, 44], [968, 132, 30]]) {
    wobbleCircle(cx, cy, r, cx, 3); ctx.fill();
  }
  /* چمنِ لبه */
  ctx.fillStyle = P.grassDk;
  ctx.fillRect(0, GROUND_Y - 6, SCENE_W, 10);
  ctx.fillStyle = P.grass;
  for (let x = 0; x < SCENE_W; x += 9) {
    const h = 8 + ((x * 37) % 11);
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 2);
    ctx.lineTo(x + 3, GROUND_Y - h);
    ctx.lineTo(x + 6, GROUND_Y + 2);
    ctx.closePath(); ctx.fill();
  }
}

function drawTarget() {
  const lv = L();
  const y = GROUND_Y - lv.H * PXM;
  ctx.save();
  ctx.strokeStyle = 'rgba(224,166,63,.75)'; ctx.lineWidth = 3;
  ctx.setLineDash([13, 10]);
  ctx.lineDashOffset = -S.t * 20;
  ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(LOAD_X + 130, y); ctx.stroke();
  ctx.restore();
  /* تیرکِ نشانه */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(66, y - 6, 12, GROUND_Y - y + 6, 4); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath();
  ctx.moveTo(78, y - 34); ctx.lineTo(140, y - 22); ctx.lineTo(78, y - 10);
  ctx.closePath(); ctx.fill();
  text('تا اینجا', 112, y - 22, { size: 13, color: '#3a2a10' });
}

function drawLoad() {
  const lv = L();
  const p = plankPt(0);
  const k = clamp(Math.sqrt(lv.m / 40), .7, 1.5);
  ctx.save();
  ctx.translate(p.x, p.y - 6);
  ctx.rotate(S.th * .5);
  ctx.scale(k, k);
  if (lv.kind === 'rock') {
    ctx.fillStyle = P.rockDk;
    wobbleCircle(0, -30, 42, 3, 5); ctx.fill();
    ctx.fillStyle = ball(0, -34, 42, P.rockLt, P.rock, P.rockDk);
    wobbleCircle(0, -34, 40, 7, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    wobbleEllipse(-14, -50, 15, 8, -.5, 3, 1.6); ctx.fill();
  } else if (lv.kind === 'log') {
    ctx.fillStyle = P.barkDk;
    ctx.beginPath(); rrPath(-66, -66, 132, 60, 22); ctx.fill();
    ctx.save();
    ctx.beginPath(); rrPath(-64, -64, 128, 56, 20); ctx.clip();
    ctx.fillStyle = texWood(P.bark, P.barkDk);
    ctx.fillRect(-64, -64, 128, 56);
    ctx.restore();
    ctx.fillStyle = '#c9a276';
    ctx.beginPath(); ctx.ellipse(-58, -36, 12, 28, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#8d6c46'; ctx.lineWidth = 2;
    for (let r = 4; r < 26; r += 7) {
      ctx.beginPath(); ctx.ellipse(-58, -36, r * .43, r, 0, 0, TAU); ctx.stroke();
    }
    ctx.fillStyle = P.leaf;
    wobbleEllipse(46, -74, 22, 10, -.6, 5, 1.6); ctx.fill();
  } else {
    ctx.fillStyle = P.barrelDk;
    ctx.beginPath(); rrPath(-38, -78, 76, 78, 18); ctx.fill();
    ctx.save();
    ctx.beginPath(); rrPath(-36, -76, 72, 74, 16); ctx.clip();
    ctx.fillStyle = texWood(P.barrel, P.barrelDk);
    ctx.fillRect(-36, -76, 72, 74);
    ctx.fillStyle = vgrad(-76, 0, 'rgba(255,255,255,.18)', 'rgba(0,0,0,.3)');
    ctx.fillRect(-36, -76, 72, 74);
    ctx.restore();
    ctx.fillStyle = P.hoop;
    ctx.fillRect(-38, -64, 76, 8);
    ctx.fillRect(-38, -22, 76, 8);
  }
  ctx.restore();
  /* پیکانِ وزن */
  const w = lv.m * G;
  arrow(p.x, p.y + 8, clamp(w / 12, 22, 96), P.force, 5);
}

function drawPlank() {
  const lv = L();
  const a = plankPt(0), b = plankPt(lv.L);
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x));
  const len = lv.L * PXM;
  withShadow(16, 6, .4, () => {
    ctx.fillStyle = P.woodDk;
    ctx.beginPath(); rrPath(-10, -8, len + 20, 22, 6); ctx.fill();
  }, '20,10,4');
  ctx.save();
  ctx.beginPath(); rrPath(-8, -7, len + 16, 19, 5); ctx.clip();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.fillRect(-8, -7, len + 16, 19);
  ctx.fillStyle = vgrad(-7, 12, 'rgba(255,255,255,.24)', 'rgba(0,0,0,.26)');
  ctx.fillRect(-8, -7, len + 16, 19);
  ctx.restore();
  ctx.restore();
}

function drawFulcrum() {
  const x = fulX(), y = GROUND_Y;
  const hot = (S.hover && S.hover.k === 'ful') || S.drag === 'ful';
  contact(x, y + 2, 46, 10, .4);
  withShadow(14, 5, .4, () => {
    ctx.fillStyle = P.woodDk;
    ctx.beginPath();
    ctx.moveTo(x, y - HF * PXM - 4);
    ctx.lineTo(x + 44, y + 2); ctx.lineTo(x - 44, y + 2);
    ctx.closePath(); ctx.fill();
  }, '20,10,4');
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y - HF * PXM); ctx.lineTo(x + 40, y); ctx.lineTo(x - 40, y);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = texWood(hot ? P.woodLt : P.wood, P.woodDk);
  ctx.fillRect(x - 44, y - HF * PXM, 88, HF * PXM + 4);
  ctx.fillStyle = vgrad(y - HF * PXM, y, 'rgba(255,255,255,.2)', 'rgba(0,0,0,.3)');
  ctx.fillRect(x - 44, y - HF * PXM, 88, HF * PXM + 4);
  ctx.restore();
  if (hot || S.tut.on) {
    ctx.save();
    ctx.globalAlpha = .5 + .3 * Math.sin(S.t * 3.2);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 3;
    ctx.setLineDash([8, 7]);
    ctx.beginPath(); ctx.arc(x, y - 22, 56, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  /* دو پیکانِ کوچکِ «مرا بکش» */
  ctx.save();
  ctx.globalAlpha = .55;
  ctx.fillStyle = P.paper;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + s * 62, y - 16);
    ctx.lineTo(x + s * 48, y - 24); ctx.lineTo(x + s * 48, y - 8);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawHand() {
  if (S.press === null) return;
  const p = plankPt(S.press);
  arrow(p.x, p.y - 96, 74, P.pushc, 6);
  /* دستِ فشاردهنده */
  ctx.save();
  ctx.translate(p.x, p.y - 30);
  ctx.fillStyle = '#eebb90';
  wobbleEllipse(0, 0, 20, 16, 0, 5, 1.4); ctx.fill();
  ctx.fillStyle = '#dca87c';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); rrPath(-6 + i * 9, -2, 8, 18, 4); ctx.fill();
  }
  ctx.fillStyle = '#4f7fc4';
  ctx.beginPath(); rrPath(-16, -20, 32, 14, 6); ctx.fill();
  ctx.restore();
}

function drawGauge() {
  const lv = L();
  const dl = dLoad(), de = dEff();
  /* دو ترازِ کوچک: گشتاورِ بار و گشتاورِ دست */
  const tl = lv.m * G * dl;
  const tp = S.press !== null ? FMAX * Math.max(0, S.press - dl) : 0;
  const mx = Math.max(tl, tp, 1);
  const bx = 40, by = HUD_H + 26, bw = 210, bh = 16;
  const row = (y, v, col, label) => {
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); rrPath(bx, y, bw, bh, 8); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); rrPath(bx, y, Math.max(6, bw * v / mx), bh, 8); ctx.fill();
    text(label, bx + bw + 10, y + bh / 2, { size: 14, color: P.paper, align: 'right' });
  };
  row(by, tl, P.force, 'بار');
  row(by + 26, tp, P.pushc, 'دستِ تو');
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#17100b';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224,166,63,.22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 330, HUD_H / 2, { size: 24, family: 'Lalezar', color: P.paper });
  numText(fa(S.level + 1) + ' / ' + fa(LEVELS.length), 640, HUD_H / 2, { size: 21, color: P.gold });
  numText(fa(S.score), 300, HUD_H / 2, { size: 20, color: P.paper });
  text('بیشترین ' + fa(S.best), 150, HUD_H / 2, { size: 15, color: 'rgba(251,243,226,.6)' });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * clamp((S.level + (S.won ? 1 : 0)) / LEVELS.length, 0, 1), 5, 3); ctx.fill();
  button(BTN_RESET, 'از اوّل', {
    hot: S.hover && S.hover.k === 'reset', fill: '#6b4a24', hotFill: '#8a6231', size: 17, r: 10 });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    const p = plankPt(0);
    spot([{ x: p.x, y: p.y - 40, r: 100 }], .7);
    const h = tutCard(430, 300, 500, ['این را باید بلند کنی.'], 'کارگاهِ اهرم');
    tutMore(680, 300 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: fulX(), y: GROUND_Y - 22, r: 84 }], .68);
    const h = tutCard(430, 260, 540, ['تکیه‌گاه را بکش و هرجا خواستی بگذار.']);
    tutMore(700, 260 + h + 8, S.t, P.ink);
  } else {
    const p = plankPt(L().L * .9);
    spot([{ x: p.x, y: p.y, r: 90 }], .68);
    const h = tutCard(360, 260, 560,
      ['روی تخته را نگه دار تا با همهٔ زورت فشار بدهی.', 'هرجای تخته را که بخواهی.']);
    tutMore(640, 260 + h + 8, S.t, P.ink);
  }
}

function leverIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.woodDk;
  ctx.beginPath();
  ctx.moveTo(6, 4); ctx.lineTo(22, 26); ctx.lineTo(-10, 26);
  ctx.closePath(); ctx.fill();
  ctx.save();
  ctx.translate(6, 2); ctx.rotate(-.24);
  ctx.fillStyle = P.wood;
  ctx.beginPath(); rrPath(-54, -6, 108, 12, 5); ctx.fill();
  ctx.restore();
  ctx.fillStyle = P.rock;
  ctx.beginPath(); ctx.arc(-42, -6, 15, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 880, h: 306, y: 128,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: '#7a6a58',
    icon: leverIcon,
    title: 'کارگاهِ اهرم',
    body: 'زورِ تو همیشه به یک اندازه است و بیشتر نمی‌شود.\nولی یک تخته و یک تکیه‌گاه داری — تکیه‌گاه را جابه‌جا کن\nو جای دستت را عوض کن تا بارِ سنگین بالا برود.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#a5682a', btnHotFill: '#c9863b',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 820, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#7a6a58',
    icon: leverIcon,
    title: 'همه را بلند کردی',
    body: 'با همان زورِ همیشگی، تنهٔ درخت را هم بلند کردی.\nتکیه‌گاهِ نزدیک‌تر به بار، کار را آسان‌تر می‌کند —\nولی بار را کمتر بالا می‌برد. امتیازت: ' + fa(S.score),
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#a5682a', btnHotFill: '#c9863b',
  });
}

function draw() {
  beginScene(P.skyLo);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, 0);
  }
  const layer = staticLayer('yard', SCENE_W, SCENE_H, paintYardStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawTarget();
  drawPlank();
  drawFulcrum();
  drawLoad();
  drawHand();
  bits.draw();
  ctx.restore();
  drawGauge();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 470;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 54, w, 42, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 33, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.08, 'rgba(20, 10, 4, .42)', 0, .12);
}

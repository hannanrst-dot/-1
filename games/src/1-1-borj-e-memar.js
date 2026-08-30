/*!
title: برجِ معمار — الگویابی
bg: #2a2018
*/

/* ═══════════════════════════════════════════════════════════════════════
   برجِ معمار — ریاضی سوم، فصل ۱، درس ۱ (حلّ مسئله: الگویابی)
   ───────────────────────────────────────────────────────────────────────
   کتاب با ساختمانی شروع می‌کند که هر طبقه دو واحد بیشتر از طبقهٔ زیرش
   دارد و می‌پرسد «چه رابطه‌ای هست؟». اینجا بچه به‌جای جواب‌دادن، خودش
   بنّاست: چند طبقهٔ اول از قبل ساخته شده، و او باید بفهمد قاعده چیست تا
   بتواند طبقهٔ بعد را بچیند. هیچ‌جا از او پرسیده نمی‌شود «الگو چیست؟» —
   اگر بفهمد، برج بالا می‌رود؛ اگر نفهمد، برج بالا نمی‌رود. همین.

   تلفیق: برج‌ها ایرانی‌اند (کبوترخانهٔ اصفهان، بادگیر یزد) و کبوترها
   دور برج می‌چرخند — گوشه‌ای از مطالعات و علوم، بدون یک خط متن اضافه.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

/* ───────── پالتِ غروبِ کویر ─────────
   ساختارِ روشنایی عمدی است: آسمانِ نزدیکِ افق روشن‌ترین جای تصویر،
   زمین تیره‌تر و کمی سردتر، و آجرها روشن‌تر از زمین. به همین دلیل
   برج بدون هیچ خطِ دور، خودش از پس‌زمینه جدا می‌شود.                */
const P = {
  skyHigh:  '#b96a4c',
  skyMid:   '#e19a67',
  skyLow:   '#f7d6a4',
  sunCore:  '#fff3d0',
  cloud:    '#ffe4bd',
  farHill:  '#9c6b57',
  farTown:  '#8e6150',
  nearTown: '#7d5342',
  groundFar:'#9a6842',
  ground:   '#7f5334',
  groundLit:'#b88453',
  sandLit:  '#cf9c68',
  brick:    '#dd8548',
  brickLit: '#f0a464',
  brickDk:  '#b25e30',
  mortar:   '#f6dcb2',
  wood:     '#7a5230',
  woodLit:  '#9a6c3e',
  woodDark: '#4a3520',
  rope:     '#e0c396',
  paper:    '#f7eeda',
  ink:      '#3d2617',
  inkSoft:  '#8a6a4e',
  robe:     '#4f6f84',
  robeDk:   '#3e5a6c',
  skin:     '#dcaa7c',
  green:    '#7d9a4e',
  red:      '#c2503f',
  gold:     '#f0b64c',
  dove:     '#f6f1e6',
  doveDk:   '#cdc2b2',
};

/* ───────── برج‌ها ─────────
   rule = 'const'  →  هر طبقه به‌اندازهٔ step بیشتر از طبقهٔ زیرش
   rule = 'grow'   →  خودِ اضافه‌شونده هر بار یکی بیشتر می‌شود (۱،۲،۴،۷،۱۱)
   given           →  چند طبقه از قبل ساخته شده است
   hole            →  طبقه‌ای که وسطِ برجِ ساخته‌شده خالی مانده           */
const LEVELS = [
  {
    name: 'کبوترخانهٔ روستا',
    story: 'استاد بنّا رفته آجر بیاورد. دو طبقهٔ اوّل را خودش چیده است.\nخوب نگاه کن ببین چطور چیده — بعد طبقهٔ بعدی را تو بچین.',
    rule: 'const', start: 2, step: 2, floors: 5, given: 2,
  },
  {
    name: 'بادگیرِ یزد',
    story: 'این یکی باریک‌تر شروع می‌شود ولی تندتر بالا می‌رود.\nقاعده‌اش با برجِ قبلی فرق دارد؛ خودت پیدایش کن.',
    rule: 'const', start: 1, step: 3, floors: 5, given: 2,
  },
  {
    name: 'برجِ پلّه‌ای',
    story: 'اینجا هر بار به‌اندازهٔ دفعهٔ قبل اضافه نمی‌شود.\nهر طبقه، یک آجر بیشتر از دفعهٔ قبل اضافه می‌کند!',
    rule: 'grow', start: 1, floors: 5, given: 3,
  },
  {
    name: 'برجِ سوراخ',
    story: 'باد یکی از طبقه‌های وسطِ برج را خراب کرده و بالایش روی داربست مانده.\nهمان طبقه را دوباره بساز تا برج نیفتد.',
    rule: 'const', start: 2, step: 3, floors: 5, given: 5, hole: 2,
  },
];

/* ───────── وضعیت ───────── */

const S = {
  level: 0,
  phase: 'intro',              // intro | build | done | free
  target: [],                  // تعداد آجرِ درستِ هر طبقه
  built: [],                   // آجرهای چیده‌شده
  active: 0,                   // طبقه‌ای که الان دستِ بچه است
  drop: [],                    // آجرهایی که در حال افتادن‌اند
  t: 0, introT: 0, doneT: 0,
  hover: null,
  lockT: 0,                    // درخششِ لحظهٔ قفل‌شدن طبقه
  shake: 0,
  stars: 0,
  doves: [],
  free: { start: 2, step: 2, floors: 5, running: false, runT: 0 },
  masterMood: 'idle',
  masterT: 0,
};

const bits = new Bits();
const toast = new Toast();

function L() { return LEVELS[S.level]; }

/** تعداد آجرِ طبقهٔ i را از روی قاعده حساب می‌کند. */
function ruleCount(lv, i) {
  if (lv.rule === 'grow') {
    let c = lv.start;
    for (let k = 1; k <= i; k++) c += k;
    return c;
  }
  return lv.start + lv.step * i;
}

function loadLevel(i) {
  S.level = i;
  const lv = LEVELS[i];
  S.target = Array.from({ length: lv.floors }, (_, k) => ruleCount(lv, k));
  S.built = S.target.map((c, k) => {
    if (lv.hole !== undefined) return k === lv.hole ? 0 : c;
    return k < lv.given ? c : 0;
  });
  S.active = lv.hole !== undefined ? lv.hole : lv.given;
  S.phase = 'intro';
  S.introT = 0;
  S.drop.length = 0;
  S.doves = Array.from({ length: 7 }, (_, k) => ({
    a: k * 1.1, r: 186 + k * 30, sp: .24 + k * .045, y: 226 + k * 22, flap: k,
  }));
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
  if (S.lockT > 0) S.lockT -= dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.masterT > 0) { S.masterT -= dt; if (S.masterT <= 0) S.masterMood = 'idle'; }

  for (const d of S.drop) {
    d.t += dt * 2.6;
    if (d.t >= 1) {
      d.done = true;
      bits.add(d.tx, d.ty + 8, 7, 'dot', [P.sand, P.mortar], { speed: 90, lift: 20, size: 2.6, life: .5 });
      sfx.place();
    }
  }
  S.drop = S.drop.filter((d) => !d.done);

  for (const d of S.doves) { d.a += d.sp * dt; d.flap += dt * 9; }

  if (S.free.running) {
    S.free.runT += dt * 1.5;
    if (S.free.runT >= S.free.floors) S.free.running = false;
  }

  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── ورودی ───────── */

const BTN_GO   = { x: 470, y: 556, w: 260, h: 76 };
const FREE_BTN = { x: 946, y: 664, w: 214, h: 62 };
const BTN_TAKE = { x: 604, y: 690, w: 156, h: 48 };
const F_START_L = { x: 986,  y: 566, r: 22 };
const F_START_R = { x: 1120, y: 566, r: 22 };
const F_STEP_L  = { x: 986,  y: 624, r: 22 };
const F_STEP_R  = { x: 1120, y: 624, r: 22 };

/** ناحیهٔ لمسِ طبقهٔ فعّال — عمداً سخاوتمند، چون انگشتِ بچهٔ هشت‌ساله
 *  دقیق نیست و نباید برای گذاشتنِ یک آجر چند بار تلاش کند.          */
function activeRowRect() {
  const y = floorY(S.active);
  return { x: TOWER_X - 300, y: y - BRICK_H - 22, w: 600, h: BRICK_H + 40 };
}

function hitTest(p) {
  if (S.phase === 'intro' || S.phase === 'done') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (S.phase === 'free') {
    for (const b of [F_START_L, F_START_R, F_STEP_L, F_STEP_R]) if (inCircle(p, b, 6)) return b;
    if (inRect(p, FREE_BTN)) return FREE_BTN;
    return null;
  }
  // چون آجرها وسط‌چین می‌شوند، جای هر آجر با اضافه‌شدنِ بعدی جابه‌جا می‌شود.
  // پس «زدن روی آجر برای برداشتن» گیج‌کننده است: ضربهٔ دوم روی همان نقطه،
  // آجرِ تازه‌چیده را برمی‌داشت. ردیف همیشه اضافه می‌کند و برداشتن دکمهٔ خود را دارد.
  if (S.built[S.active] > 0 && inRect(p, BTN_TAKE)) return BTN_TAKE;
  if (inRect(p, activeRowRect())) return 'row';
  return null;
}

cv.addEventListener('pointermove', (e) => {
  S.hover = hitTest(toStage(e));
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});
cv.addEventListener('pointerleave', () => { S.hover = null; });

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  const h = hitTest(p);
  if (!h) return;

  if (S.phase === 'intro') { S.phase = 'build'; sfx.tap(); return; }
  if (S.phase === 'done') { nextLevel(); return; }

  if (S.phase === 'free') {
    if (h === F_START_L) return tuneFree('start', -1);
    if (h === F_START_R) return tuneFree('start', +1);
    if (h === F_STEP_L)  return tuneFree('step', -1);
    if (h === F_STEP_R)  return tuneFree('step', +1);
    if (h === FREE_BTN)  { S.free.running = true; S.free.runT = 0; sfx.slide(); return; }
    return;
  }

  if (h === BTN_TAKE) {                      // یک آجر از طبقهٔ فعّال بردار
    if (S.built[S.active] > 0) { S.built[S.active]--; sfx.tap(); }
    return;
  }
  if (h === 'row') addBrick();
});

function tuneFree(key, d) {
  S.free[key] = clamp(S.free[key] + d, key === 'start' ? 1 : 1, key === 'start' ? 6 : 5);
  S.free.running = false;
  sfx.pop();
}

function addBrick() {
  const n = S.built[S.active];
  if (n >= 14) { toast.say('این طبقه دیگر جا ندارد', 'bad'); sfx.nope(); return; }
  S.built[S.active] = n + 1;
  const b = brickBox(S.active, n, n + 1);
  S.drop.push({ t: 0, floor: S.active, idx: n, tx: b.x + b.w/2, ty: b.y + b.h/2 });
  sfx.tick();
  checkFloor();
}

/** طبقه وقتی درست شد خودش قفل می‌شود — نه دکمه‌ای، نه تأییدی. */
function checkFloor() {
  if (S.built[S.active] !== S.target[S.active]) return;
  setTimeout(() => {
    if (S.built[S.active] !== S.target[S.active]) return;
    S.lockT = .9;
    S.stars++;
    S.masterMood = 'happy'; S.masterT = 2;
    const y = floorY(S.active);
    bits.confetti(430, y - 14, 26, [P.brickLit, P.mortar, P.green, P.sun]);
    sfx.good();

    const lv = L();
    const remaining = S.built.findIndex((c, k) => c < S.target[k]);
    if (remaining === -1) {
      S.phase = 'done'; S.doneT = 0;
      sfx.win();
      bits.confetti(430, 300, 70, [P.brickLit, P.mortar, P.green, P.sun, P.red]);
    } else {
      S.active = remaining;
      toast.say(lv.hole !== undefined ? 'برج دوباره سرِ پا شد!' : 'طبقه جا افتاد — یکی بالاتر برو', 'good');
    }
  }, 340);
}

function nextLevel() {
  if (S.level + 1 < LEVELS.length) loadLevel(S.level + 1);
  else { S.phase = 'free'; S.free.running = false; }
}

/* ═══════════════════════════════════════════════════════════════════════
   ترکیب‌بندی
   ───────────────────────────────────────────────────────────────────────
   افق روی ۵۵۶ است. جرثقیل سمتِ چپ، برج کمی چپ‌ترِ مرکز (نقطهٔ طلایی)،
   استاد بنّا در پیش‌زمینهٔ راست و بزرگ‌تر از اندازهٔ واقعی‌اش، و نقشه
   روی سه‌پایه در گوشهٔ راست. اجسامِ پیش‌زمینه (فرغون، تودهٔ آجر، سطل)
   لبهٔ پایینِ تصویر را می‌بندند تا صحنه عمق بگیرد.
   ═══════════════════════════════════════════════════════════════════════ */

const HORIZON = 474;
const BASE_Y = 662, FLOOR_H = 54, BRICK_W = 52, BRICK_H = 46, TOWER_X = 452;

function floorY(i) { return BASE_Y - i * FLOOR_H; }

function brickBox(floor, idx, count) {
  const w = count * BRICK_W;
  return { x: TOWER_X - w/2 + idx * BRICK_W, y: floorY(floor) - BRICK_H, w: BRICK_W, h: BRICK_H };
}

/* ───────── ترسیم ───────── */

function draw() {
  beginScene('#241a13');
  drawSky();
  drawFarHills();
  drawTown();
  drawGround();
  drawCrane();
  drawScaffold();
  drawTower();
  drawGoalFlag();
  drawTakeButton();
  drawDoves();
  drawProps();
  drawMaster(860, 690);
  drawEasel();
  bits.draw();
  toast.draw(20, { ink: P.ink });

  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'done') drawDone();
  if (S.phase === 'free') drawFreePanel();

  endScene(.10, 'rgba(52,28,12,.26)');
}

/* ───────── آسمانِ غروب ───────── */

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, HORIZON + 20);
  g.addColorStop(0, P.skyHigh);
  g.addColorStop(.45, P.skyMid);
  g.addColorStop(1, P.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, HORIZON + 20);

  // هالهٔ خورشید، پایین و نزدیکِ افق
  const sx = 246, sy = 476;
  const halo = ctx.createRadialGradient(sx, sy, 10, sx, sy, 330);
  halo.addColorStop(0, 'rgba(255,244,214,.85)');
  halo.addColorStop(.45, 'rgba(255,214,150,.32)');
  halo.addColorStop(1, 'rgba(255,214,150,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, SW, HORIZON + 20);
  ctx.fillStyle = P.sunCore;
  wobbleCircle(sx, sy, 46, 3, 1.6);
  ctx.fill();

  // ابرهای نازکِ کشیده — کم و کم‌رنگ، فقط برای اینکه آسمان تخت نباشد
  for (let i = 0; i < 5; i++) {
    const y = 96 + i * 74;
    const w = 150 + noise1(i * 3.7) * 220;
    const x = 120 + noise1(i * 5.1) * 940;
    ctx.globalAlpha = .30 - i * .035;
    ctx.fillStyle = P.cloud;
    wobbleEllipse(x, y, w, 7 + i, 0, i * 3, 3.2);
    ctx.fill();
    ctx.globalAlpha = .18 - i * .02;
    wobbleEllipse(x - w * .3, y + 13, w * .6, 5, 0, i * 7, 2.4);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // پرندگانِ خیلی دور: چند خطِ کوچک
  ctx.strokeStyle = 'rgba(120,74,52,.45)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const x = 560 + i * 46 + Math.sin(S.t * .3 + i) * 8;
    const y = 130 + noise1(i * 9.1) * 90;
    const w = 6 + noise1(i) * 4;
    ctx.beginPath();
    ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x, y - 4, x + w, y);
    ctx.stroke();
  }
}

/** تپه‌های دور — روشن و کم‌کنتراست، چون هوا بینشان است. */
function drawFarHills() {
  ctx.fillStyle = P.farHill;
  ctx.globalAlpha = .34;
  ctx.beginPath();
  ctx.moveTo(0, HORIZON);
  for (let x = 0; x <= SW; x += 40) {
    ctx.lineTo(x, HORIZON - 34 - Math.sin(x * .0042) * 26 - noise1(x * .01) * 16);
  }
  ctx.lineTo(SW, HORIZON);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
}

/** خطِ شهرِ کویری: خانه‌های خشتی، گنبد و بادگیر. */
function drawTown() {
  const draw = (alpha, color, dy, scale) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, HORIZON + dy);
    let x = -20;
    let i = 0;
    while (x < SW + 40) {
      const r = noise1(x * .017 + scale);
      const h = (26 + r * 46) * scale;
      const w = 44 + noise1(x * .031) * 40;
      ctx.lineTo(x, HORIZON + dy - h);
      if (r > .82) {                                   // گنبد
        ctx.quadraticCurveTo(x + w/2, HORIZON + dy - h - w * .62, x + w, HORIZON + dy - h);
      } else if (r < .13) {                            // بادگیر
        ctx.lineTo(x + w * .28, HORIZON + dy - h);
        ctx.lineTo(x + w * .28, HORIZON + dy - h - 30 * scale);
        ctx.lineTo(x + w * .72, HORIZON + dy - h - 30 * scale);
        ctx.lineTo(x + w * .72, HORIZON + dy - h);
        ctx.lineTo(x + w, HORIZON + dy - h);
      } else {
        ctx.lineTo(x + w, HORIZON + dy - h);
      }
      x += w; i++;
    }
    ctx.lineTo(SW + 40, HORIZON + dy);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  };
  draw(.52, P.farTown, 0, .92);      // ردیفِ دور
  draw(.80, P.nearTown, 18, 1.10);   // ردیفِ نزدیک‌تر، تیره‌تر

  // چند نخل، با برگ‌های پُر — نه خطِ خالی
  for (const [px, sc] of [[86, .95], [1104, 1.05], [1158, .8]]) {
    ctx.save();
    ctx.translate(px, HORIZON + 16);
    ctx.scale(sc, sc);
    ctx.globalAlpha = .72;
    ctx.fillStyle = P.nearTown;
    ctx.beginPath();                       // تنه
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(-1, -46, 5, -86);
    ctx.lineTo(12, -85);
    ctx.quadraticCurveTo(6, -46, 3, 0);
    ctx.closePath(); ctx.fill();
    for (let k = -2; k <= 2; k++) {        // برگ‌ها
      ctx.beginPath();
      ctx.moveTo(8, -86);
      ctx.quadraticCurveTo(8 + k * 22, -110 - Math.abs(k) * 3, 8 + k * 42, -88 + Math.abs(k) * 12);
      ctx.quadraticCurveTo(8 + k * 20, -96, 8, -82);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

/* ───────── زمینِ کارگاه ───────── */

function drawGround() {
  const g = ctx.createLinearGradient(0, HORIZON, 0, SH);
  g.addColorStop(0, P.groundFar);
  g.addColorStop(.35, P.ground);
  g.addColorStop(1, '#6b4529');
  ctx.fillStyle = g;
  ctx.fillRect(0, HORIZON, SW, SH - HORIZON);

  // نوارِ روشنِ نورِ غروب که روی خاک افتاده
  ctx.globalAlpha = .5;
  const lit = ctx.createLinearGradient(0, HORIZON, SW * .7, SH);
  lit.addColorStop(0, P.groundLit);
  lit.addColorStop(1, 'rgba(184,132,83,0)');
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.moveTo(0, HORIZON + 6);
  ctx.quadraticCurveTo(420, HORIZON + 70, 900, SH);
  ctx.lineTo(0, SH);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;

  // تیرگیِ لبهٔ پایین، تا نگاه روی برج بماند
  const fg = ctx.createLinearGradient(0, SH - 190, 0, SH);
  fg.addColorStop(0, 'rgba(58,34,16,0)');
  fg.addColorStop(1, 'rgba(58,34,16,.42)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, SH - 190, SW, 190);

  // چند بوتهٔ خشک روی خاک
  for (let i = 0; i < 9; i++) {
    const x = 40 + noise1(i * 11.3) * (SW - 80);
    const y = HORIZON + 40 + noise1(i * 4.7) * 250;
    ctx.globalAlpha = .5;
    ctx.strokeStyle = '#6d4a2c';
    ctx.lineWidth = 2;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + k * 5, y - 9, x + k * 11, y - 15 + Math.abs(k) * 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // برجستگی‌های ریزِ خاک
  for (let i = 0; i < 30; i++) {
    const x = noise1(i * 7.3) * SW;
    const y = HORIZON + 16 + noise1(i * 3.1) * (SH - HORIZON - 26);
    const w = 14 + noise1(i * 1.7) * 30;
    ctx.globalAlpha = .16 + noise1(i * 2.3) * .16;
    ctx.fillStyle = noise1(i * 5.5) > .5 ? P.sandLit : '#5f3d23';
    wobbleEllipse(x, y, w, 3.4, 0, i, 1.2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // سایهٔ بلندِ برج روی خاک (خورشید از چپ است، پس سایه به راست می‌افتد)
  ctx.globalAlpha = .22;
  ctx.fillStyle = '#4a2f1a';
  ctx.beginPath();
  ctx.moveTo(TOWER_X - 150, BASE_Y + 16);
  ctx.lineTo(TOWER_X + 520, BASE_Y + 48);
  ctx.lineTo(TOWER_X + 520, BASE_Y + 70);
  ctx.lineTo(TOWER_X - 150, BASE_Y + 34);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;

  // پیِ سنگیِ برج
  withShadow(18, 8, .34, () => {
    ctx.fillStyle = '#8d5a33';
    wobbleRect(TOWER_X - 344, BASE_Y - 4, 688, 30, 7, 5, 2.4);
    ctx.fill();
  });
  ctx.fillStyle = '#a06a3d';
  wobbleRect(TOWER_X - 340, BASE_Y - 2, 680, 10, 4, 7, 1.4);
  ctx.fill();
}

/* ───────── جرثقیلِ چوبی ───────── */

function drawCrane() {
  const bx = 96, top = 72;
  // دکلِ خرپا: دو ریلِ عمودی با ضربدرهای بین‌شان
  ctx.strokeStyle = P.wood;
  ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bx - 17, BASE_Y + 8); ctx.lineTo(bx - 9, top);
  ctx.moveTo(bx + 17, BASE_Y + 8); ctx.lineTo(bx + 9, top);
  ctx.stroke();
  ctx.strokeStyle = P.woodLit;
  ctx.lineWidth = 4;
  for (let y = top + 26; y < BASE_Y; y += 52) {
    const t0 = (y - top) / (BASE_Y - top), t1 = (y + 52 - top) / (BASE_Y - top);
    const l0 = lerp(bx - 9, bx - 17, t0), r0 = lerp(bx + 9, bx + 17, t0);
    const l1 = lerp(bx - 9, bx - 17, t1), r1 = lerp(bx + 9, bx + 17, t1);
    ctx.beginPath();
    ctx.moveTo(l0, y); ctx.lineTo(r1, y + 52);
    ctx.moveTo(r0, y); ctx.lineTo(l1, y + 52);
    ctx.moveTo(l1, y + 52); ctx.lineTo(r1, y + 52);
    ctx.stroke();
  }
  // بازو
  ctx.strokeStyle = P.wood;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(bx - 62, top + 4); ctx.lineTo(bx + 292, top + 4);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = P.woodLit;
  ctx.beginPath();
  ctx.moveTo(bx - 62, top + 22); ctx.lineTo(bx + 292, top + 22);
  ctx.stroke();
  ctx.lineWidth = 3;
  for (let x = bx - 56; x < bx + 292; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, top + 22); ctx.lineTo(x + 22, top + 4);
    ctx.moveTo(x + 22, top + 22); ctx.lineTo(x + 44, top + 4);
    ctx.stroke();
  }
  // مهارِ طنابی از نوکِ دکل
  ctx.strokeStyle = P.rope;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bx, top - 46); ctx.lineTo(bx + 288, top + 2);
  ctx.moveTo(bx, top - 46); ctx.lineTo(bx - 58, top + 2);
  ctx.moveTo(bx, top - 46); ctx.lineTo(bx, top + 4);
  ctx.stroke();
  // وزنهٔ تعادل
  withShadow(8, 4, .3, () => {
    ctx.fillStyle = P.brickDk;
    wobbleRect(bx - 78, top + 22, 34, 40, 5, 41, 1.4);
    ctx.fill();
  });
  // پرچمِ کوچکِ سرِ دکل
  const fl = Math.sin(S.t * 3) * 5;
  ctx.fillStyle = P.red;
  ctx.beginPath();
  ctx.moveTo(bx, top - 46);
  ctx.quadraticCurveTo(bx + 22, top - 52 + fl, bx + 42, top - 42 + fl);
  ctx.quadraticCurveTo(bx + 22, top - 38, bx, top - 30);
  ctx.closePath(); ctx.fill();

  // طنابِ آویز، قلاب و آجرِ آماده
  const hx = bx + 288, sway = Math.sin(S.t * 1.3) * 9;
  ctx.strokeStyle = P.rope;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hx, top + 8); ctx.lineTo(hx + sway, 186);
  ctx.stroke();
  ctx.save();
  ctx.translate(hx + sway, 186);
  ctx.rotate(sway * .005);
  ctx.strokeStyle = '#8d8f92';                    // قلاب
  ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 6, 8, Math.PI * .15, Math.PI * .9, true);
  ctx.stroke();
  withShadow(8, 4, .32, () => {
    ctx.fillStyle = P.brick;
    wobbleRect(-21, 12, 42, 30, 5, 77, 1.4);
    ctx.fill();
  });
  ctx.fillStyle = P.mortar;
  ctx.globalAlpha = .5;
  wobbleRect(-18, 14, 36, 4, 2, 79, .8);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ───────── داربست ─────────
   فقط دو طرفِ برج و پشتِ آن، تا جلوی دیدِ آجرها را نگیرد. */

function drawScaffold() {
  const floors = S.built.length;
  const yTop = floorY(floors) - 24;
  const L0 = TOWER_X - 264, R0 = TOWER_X + 264;

  // تخته‌های افقی که از این‌سر تا آن‌سرِ داربست کشیده شده‌اند.
  // اینها هم سازه را واقعی می‌کنند، هم ارتفاعِ نهاییِ برج را نشان می‌دهند.
  const workFrom = Math.max(1, S.active), workTo = Math.min(floors, S.active + 2);
  for (let i = workFrom; i <= workTo; i++) {
    const y = floorY(i) + 8;
    const half = Math.max(S.target[i] || 3, 3) * BRICK_W / 2 + 74;
    ctx.globalAlpha = i === S.active ? .95 : .5;
    withShadow(6, 3, .2, () => {
      ctx.fillStyle = i % 2 ? P.wood : P.woodLit;
      wobbleRect(TOWER_X - half, y, half * 2, 10, 3, i * 17, 1.2);
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,238,200,.25)';
    wobbleRect(TOWER_X - half + 4, y + 1, half * 2 - 8, 3, 2, i * 19, .8);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // پایه‌های عمودی و مهارهای ضربدری
  for (const side of [-1, 1]) {
    const x0 = TOWER_X + side * 264;
    ctx.strokeStyle = P.wood;
    ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, BASE_Y + 8);
    ctx.lineTo(x0 - side * 14, yTop);
    ctx.stroke();
    ctx.strokeStyle = P.woodLit;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x0 + side * 34, BASE_Y + 8);
    ctx.lineTo(x0 + side * 22, yTop + 26);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(122,82,48,.55)';
    ctx.lineWidth = 4;
    for (let i = 0; i < floors; i++) {
      const ya = floorY(i) + 10, yb = floorY(i + 1) + 10;
      ctx.beginPath();
      ctx.moveTo(x0 + side * 32, ya); ctx.lineTo(x0 - side * 4, yb);
      ctx.moveTo(x0 - side * 4, ya); ctx.lineTo(x0 + side * 32, yb);
      ctx.stroke();
    }
    // سطل و ابزار آویزان از داربست — جزئیاتِ کارگاه
    if (side === 1) {
      const y = floorY(2) + 10;
      ctx.strokeStyle = P.rope; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x0 + 12, y); ctx.lineTo(x0 + 12, y + 26); ctx.stroke();
      ctx.fillStyle = '#7f8285';
      ctx.beginPath();
      ctx.moveTo(x0 + 2, y + 26); ctx.lineTo(x0 + 22, y + 26);
      ctx.lineTo(x0 + 18, y + 46); ctx.lineTo(x0 + 6, y + 46);
      ctx.closePath(); ctx.fill();
    }
  }

  // نردبان، چسبیده به داربستِ چپ
  const lx = TOWER_X - 222;
  ctx.strokeStyle = P.woodLit;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(lx - 14, BASE_Y + 6); ctx.lineTo(lx - 4, yTop + 16);
  ctx.moveTo(lx + 16, BASE_Y + 6); ctx.lineTo(lx + 26, yTop + 16);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = P.wood;
  for (let y = BASE_Y - 6; y > yTop + 20; y -= 28) {
    const t = (BASE_Y - y) / (BASE_Y - yTop);
    ctx.beginPath();
    ctx.moveTo(lerp(lx - 14, lx - 4, t), y);
    ctx.lineTo(lerp(lx + 16, lx + 26, t), y);
    ctx.stroke();
  }
}

/** پرچمِ کوچکِ «هدف» روی نوکِ داربست: بچه می‌بیند برج تا کجا باید برود. */
function drawGoalFlag() {
  const floors = S.built.length;
  const y = floorY(floors) - 6;
  const x = TOWER_X - 264;
  ctx.strokeStyle = P.rope;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x - 14, y + 26); ctx.lineTo(x - 14, y - 16); ctx.stroke();
  const fl = Math.sin(S.t * 2.6) * 4;
  ctx.fillStyle = P.gold;
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 16);
  ctx.quadraticCurveTo(x + 14, y - 22 + fl, x + 34, y - 10 + fl);
  ctx.quadraticCurveTo(x + 12, y - 4, x - 14, y + 2);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = .8;
  text(`طبقهٔ ${fa(floors)}`, x + 66, y - 8,
    { size: 15, color: '#fff3dc', stroke: 'rgba(80,44,20,.6)', strokeWidth: 4 });
  ctx.globalAlpha = 1;
}

/* ───────── برج ───────── */

function drawTower() {
  const shake = S.shake > 0 ? Math.sin(S.shake * 50) * 4 : 0;
  for (let f = 0; f < S.built.length; f++) {
    const n = S.built[f];
    for (let k = 0; k < n; k++) {
      drawBrick(f, k, n, S.drop.find((d) => d.floor === f && d.idx === k), shake);
    }
    if (f === S.active && S.phase === 'build') drawActiveLedge(f, n);
  }
  if (S.lockT > 0) {
    const k = S.lockT / .9;
    const y = floorY(Math.max(0, S.active - 1));
    ctx.strokeStyle = `rgba(255,238,190,${k})`;
    ctx.lineWidth = 5 * k;
    ctx.beginPath();
    ctx.moveTo(TOWER_X - 250 * k - 40, y + 2);
    ctx.lineTo(TOWER_X + 250 * k + 40, y + 2);
    ctx.stroke();
  }
}

/** سکّوی طبقهٔ فعّال: یک تختهٔ چوبیِ واقعی، و جای خالیِ آجرِ بعدی که
 *  نبض می‌زند. بچه بدون خواندنِ هیچ متنی می‌فهمد کجا باید بزند.       */
function drawActiveLedge(f, n) {
  const y = floorY(f);
  const half = Math.max(n + 1, 2) * BRICK_W / 2 + 26;

  withShadow(10, 5, .28, () => {                 // تختهٔ چوبی
    ctx.fillStyle = P.woodLit;
    wobbleRect(TOWER_X - half, y, half * 2, 9, 3, f + 91, 1.2);
    ctx.fill();
  });
  ctx.fillStyle = 'rgba(255,240,205,.35)';
  wobbleRect(TOWER_X - half + 3, y + 1, half * 2 - 6, 3, 1.5, f + 93, .8);
  ctx.fill();

  // جای خالیِ آجرِ بعدی
  const nb = brickBox(f, n, n + 1);
  const pulse = .45 + Math.sin(S.t * 3) * .35;
  ctx.save();
  ctx.setLineDash([7, 6]);
  ctx.lineDashOffset = -S.t * 14;
  ctx.strokeStyle = `rgba(255,244,214,${pulse})`;
  ctx.lineWidth = 3;
  wobbleRect(nb.x + 2, nb.y + 2, nb.w - 4, nb.h - 4, 4, 7, 1.2);
  ctx.stroke();
  ctx.restore();

  if (n === 0) {
    const bob = Math.sin(S.t * 2.4) * 4;
    text('اینجا بزن', TOWER_X, y - 74 + bob,
      { size: 19, color: '#fff3dc', family: 'Lalezar', stroke: 'rgba(80,44,20,.65)', strokeWidth: 5 });
    ctx.fillStyle = 'rgba(255,243,220,.9)';
    ctx.beginPath();
    ctx.moveTo(TOWER_X, y - 46 + bob);
    ctx.lineTo(TOWER_X - 10, y - 62 + bob);
    ctx.lineTo(TOWER_X + 10, y - 62 + bob);
    ctx.closePath(); ctx.fill();
  }
}

function drawBrick(f, k, n, dropping, shake) {
  const b = brickBox(f, k, n);
  let x = b.x + shake, y = b.y, rot = 0, alpha = 1;
  if (dropping) {
    const t = easeOut(clamp(dropping.t, 0, 1));
    y = lerp(216, b.y, t);
    rot = (1 - t) * .3;
    alpha = clamp(dropping.t * 3, 0, 1);
  }
  const tone = noise1(f * 13 + k * 7);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + b.w/2, y + b.h/2);
  ctx.rotate(rot);
  withShadow(9, 5, .34, () => {
    ctx.fillStyle = tone > .62 ? P.brickLit : tone > .28 ? P.brick : P.brickDk;
    wobbleRect(-b.w/2 + 2, -b.h/2 + 2, b.w - 4, b.h - 4, 4, f * 31 + k, 1.4);
    ctx.fill();
  });
  // بندکشیِ روشنِ لبهٔ بالا و سایهٔ نازکِ لبهٔ پایین
  ctx.fillStyle = P.mortar;
  ctx.globalAlpha = alpha * .55;
  wobbleRect(-b.w/2 + 3, -b.h/2 + 1.5, b.w - 6, 4, 2, f + k, .8);
  ctx.fill();
  ctx.fillStyle = '#8d4c24';
  ctx.globalAlpha = alpha * .3;
  wobbleRect(-b.w/2 + 3, b.h/2 - 5.5, b.w - 6, 3, 2, f + k + 2, .8);
  ctx.fill();
  // دو خالِ ریزِ کاهگل
  ctx.globalAlpha = alpha * .22;
  ctx.fillStyle = '#7a4220';
  ctx.beginPath();
  ctx.arc(-6 + noise1(f * 3 + k) * 12, -2 + noise1(k * 5 + f) * 8, 1.8, 0, TAU);
  ctx.arc(4 + noise1(f * 7 + k) * 9, 4 - noise1(k * 2 + f) * 7, 1.4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** دکمهٔ «یکی کم کن» — تختهٔ چوبیِ کوچکی که کنارِ پای برج کوبیده شده. */
function drawTakeButton() {
  if (S.phase !== 'build' || S.built[S.active] === 0) return;
  const b = BTN_TAKE, hot = S.hover === BTN_TAKE;
  const dy = hot ? 3 : 0;
  ctx.strokeStyle = P.woodDark;                 // میخِ چوبی در خاک
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(b.x + b.w/2, b.y + b.h - 4); ctx.lineTo(b.x + b.w/2, b.y + b.h + 22);
  ctx.stroke();
  withShadow(10, hot ? 3 : 6, .3, () => {
    ctx.fillStyle = hot ? P.woodLit : P.wood;
    wobbleRect(b.x, b.y + dy, b.w, b.h, 8, 55, 1.6);
    ctx.fill();
  });
  ctx.fillStyle = 'rgba(255,238,200,.2)';
  wobbleRect(b.x + 5, b.y + 4 + dy, b.w - 10, 6, 3, 57, .8);
  ctx.fill();
  text('↶  یکی کم کن', b.x + b.w/2, b.y + b.h/2 + dy,
    { size: 19, color: '#fff3dc', family: 'Lalezar' });
}

/* ───────── کبوترها ───────── */

function drawDoves() {
  for (const d of S.doves) {
    const x = TOWER_X + Math.cos(d.a) * d.r;
    const y = d.y + Math.sin(d.a * 1.6) * 30;
    const behind = Math.sin(d.a) > 0;
    const flap = Math.sin(d.flap);
    const dir = Math.cos(d.a + .5) > 0 ? 1 : -1;
    ctx.save();
    ctx.globalAlpha = behind ? .42 : 1;
    ctx.translate(x, y);
    ctx.scale(dir * 1.15, 1.15);
    ctx.rotate(Math.sin(d.a) * .12 - flap * .05);

    ctx.fillStyle = P.doveDk;                 // دمِ کوتاه و باریک
    ctx.beginPath();
    ctx.moveTo(-11, -2);
    ctx.lineTo(-20, -5);
    ctx.lineTo(-20, 1);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = P.dove;                   // بدنِ کشیده
    ctx.beginPath();
    ctx.moveTo(-12, -1);
    ctx.quadraticCurveTo(-4, -8, 8, -6);
    ctx.quadraticCurveTo(16, -5, 15, -1);
    ctx.quadraticCurveTo(12, 5, 0, 5);
    ctx.quadraticCurveTo(-8, 4, -12, -1);
    ctx.closePath(); ctx.fill();

    ctx.beginPath();                          // سر
    ctx.arc(13, -7, 5.2, 0, TAU);
    ctx.fill();

    ctx.fillStyle = P.doveDk;                 // بالِ دور
    ctx.beginPath();
    ctx.moveTo(-2, -4);
    ctx.quadraticCurveTo(-12, -10 - flap * 7, 2, -6 - flap * 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.dove;                   // بالِ نزدیک، بالای بدن
    ctx.beginPath();
    ctx.moveTo(-1, -4);
    ctx.quadraticCurveTo(-6, -18 - flap * 13, 9, -9 - flap * 8);
    ctx.quadraticCurveTo(4, -4, -1, -4);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#e0a55c';                // نوک
    ctx.beginPath();
    ctx.moveTo(17, -7.4); ctx.lineTo(22, -6.4); ctx.lineTo(17, -5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.ink;                    // چشم
    ctx.beginPath(); ctx.arc(14.6, -8.6, 1.2, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

/* ───────── وسایلِ پیش‌زمینه ───────── */

function drawProps() {
  // تودهٔ آجر، پایین چپ
  const px = 298, py = 730;
  withShadow(14, 6, .3, () => {
    ctx.fillStyle = '#5f3d23';
    ctx.globalAlpha = .3;
    wobbleEllipse(px + 6, py + 16, 92, 13, 0, 5, 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  for (let r = 0; r < 3; r++) {
    const cnt = 5 - r;
    for (let k = 0; k < cnt; k++) {
      const bw = 34, bh = 20;
      const bx = px - (cnt * bw) / 2 + k * bw + (r % 2 ? 8 : 0);
      const by = py - r * (bh - 2);
      ctx.fillStyle = noise1(r * 5 + k) > .5 ? P.brickLit : P.brick;
      withShadow(5, 3, .26, () => {
        wobbleRect(bx, by, bw - 3, bh - 3, 3, r * 9 + k, 1.2);
        ctx.fill();
      });
      ctx.fillStyle = P.mortar;
      ctx.globalAlpha = .4;
      wobbleRect(bx + 2, by + 1, bw - 7, 3, 1.5, r + k, .7);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // فرغون، پایین راست
  ctx.save();
  ctx.translate(1012, 720);
  ctx.globalAlpha = .3;
  ctx.fillStyle = '#5f3d23';
  wobbleEllipse(4, 40, 74, 11, 0, 9, 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = P.woodDark;                   // دسته و پایه
  ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(56, -12); ctx.lineTo(96, -30);
  ctx.moveTo(52, 4);  ctx.lineTo(70, 34);
  ctx.stroke();
  withShadow(10, 5, .3, () => {                   // تغار
    ctx.fillStyle = '#8d8f92';
    ctx.beginPath();
    ctx.moveTo(-64, -22);
    ctx.lineTo(58, -14);
    ctx.quadraticCurveTo(46, 22, 6, 22);
    ctx.quadraticCurveTo(-44, 20, -64, -22);
    ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = '#a8aaad';
  ctx.beginPath();
  ctx.moveTo(-64, -22); ctx.lineTo(58, -14);
  ctx.lineTo(52, -6); ctx.lineTo(-58, -14);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.sandLit;                      // خاکِ داخلش
  wobbleEllipse(-6, -14, 46, 8, 0, 3, 2);
  ctx.fill();
  ctx.fillStyle = P.woodDark;                     // چرخ
  wobbleCircle(-46, 26, 17, 11, 1.2);
  ctx.fill();
  ctx.fillStyle = '#8d8f92';
  wobbleCircle(-46, 26, 6, 13, .8);
  ctx.fill();
  ctx.restore();

  // سطلِ ملات و بیلچه، کنارِ برج
  ctx.save();
  ctx.translate(146, 732);
  ctx.globalAlpha = .28;
  ctx.fillStyle = '#5f3d23';
  wobbleEllipse(2, 22, 30, 7, 0, 15, 1.4);
  ctx.fill();
  ctx.globalAlpha = 1;
  withShadow(8, 4, .3, () => {
    ctx.fillStyle = '#7f8285';
    ctx.beginPath();
    ctx.moveTo(-22, -20); ctx.lineTo(22, -20);
    ctx.lineTo(16, 20); ctx.lineTo(-16, 20);
    ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = P.mortar;
  wobbleEllipse(0, -20, 22, 5, 0, 17, 1.2);
  ctx.fill();
  ctx.strokeStyle = '#5d6063';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -22, 22, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  ctx.restore();
}

/* ───────── استاد بنّا ───────── */

function drawMaster(x, footY) {
  const happy = S.masterMood === 'happy';
  const bob = Math.sin(S.t * 1.5) * 3 + (happy ? Math.abs(Math.sin(S.t * 7.5)) * -8 : 0);
  ctx.save();
  ctx.translate(x, footY + bob);
  ctx.scale(.66, .66);

  // سایه روی خاک
  ctx.globalAlpha = .26;
  ctx.fillStyle = '#4a2f1a';
  wobbleEllipse(14, 2, 60, 11, 0, 3, 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // چکمه‌ها
  ctx.fillStyle = P.woodDark;
  wobbleRect(-38, -22, 32, 24, 6, 21, 1.2); ctx.fill();
  wobbleRect(8, -22, 32, 24, 6, 23, 1.2); ctx.fill();

  // قبا
  withShadow(18, 9, .3, () => {
    ctx.fillStyle = P.robe;
    ctx.beginPath();
    ctx.moveTo(-50, -16);
    ctx.quadraticCurveTo(-58, -120, -34, -152);
    ctx.lineTo(34, -152);
    ctx.quadraticCurveTo(58, -120, 50, -16);
    ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = P.robeDk;                       // سایهٔ داخلیِ قبا
  ctx.beginPath();
  ctx.moveTo(16, -16);
  ctx.quadraticCurveTo(40, -110, 30, -150);
  ctx.lineTo(34, -152);
  ctx.quadraticCurveTo(58, -120, 50, -16);
  ctx.closePath(); ctx.fill();

  // پیش‌بندِ چرمی
  ctx.fillStyle = '#a5713f';
  ctx.beginPath();
  ctx.moveTo(-30, -128);
  ctx.lineTo(30, -128);
  ctx.quadraticCurveTo(34, -54, 22, -34);
  ctx.lineTo(-22, -34);
  ctx.quadraticCurveTo(-34, -54, -30, -128);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8a5a2f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, -92); ctx.lineTo(30, -92);
  ctx.stroke();
  // جیبِ پیش‌بند
  ctx.fillStyle = '#8a5a2f';
  wobbleRect(-18, -86, 36, 22, 4, 27, 1);
  ctx.fill();

  // دست‌ها — یکی ماله دارد
  ctx.strokeStyle = P.skin;
  ctx.lineWidth = 15; ctx.lineCap = 'round';
  const armL = happy ? -58 : -18;
  ctx.beginPath();
  ctx.moveTo(-42, -122); ctx.lineTo(-58, -76 + armL * .1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(42, -122); ctx.lineTo(62, -84 + (happy ? -44 : 0));
  ctx.stroke();
  // ماله
  ctx.save();
  ctx.translate(62, -84 + (happy ? -44 : 0));
  ctx.rotate(happy ? -.9 : -.25);
  ctx.fillStyle = '#9fa2a6';
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(30, -8); ctx.lineTo(36, 2); ctx.lineTo(2, 8);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.woodDark;
  wobbleRect(-12, -5, 14, 10, 3, 31, .8);
  ctx.fill();
  ctx.restore();

  // سر
  withShadow(12, 6, .24, () => {
    ctx.fillStyle = P.skin;
    wobbleCircle(0, -186, 38, 9, 1.8);
    ctx.fill();
  });
  // ریشِ سفید
  ctx.fillStyle = '#f2ece0';
  ctx.beginPath();
  ctx.moveTo(-25, -174);
  ctx.quadraticCurveTo(-22, -128, 0, -126);
  ctx.quadraticCurveTo(22, -128, 25, -174);
  ctx.quadraticCurveTo(0, -158, -25, -174);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ddd5c6';
  ctx.beginPath();
  ctx.moveTo(-14, -168); ctx.quadraticCurveTo(0, -160, 14, -168);
  ctx.quadraticCurveTo(0, -164, -14, -168);
  ctx.closePath(); ctx.fill();
  // چشم و ابرو
  ctx.fillStyle = P.ink;
  for (const s of [-1, 1]) {
    if (happy) {
      ctx.strokeStyle = P.ink; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(s * 14, -192, 8, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else {
      ctx.beginPath(); ctx.ellipse(s * 14, -190, 4.4, 5.2, 0, 0, TAU); ctx.fill();
    }
  }
  ctx.strokeStyle = '#e8e0d2'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-24, -206); ctx.lineTo(-7, -203);
  ctx.moveTo(24, -206);  ctx.lineTo(7, -203);
  ctx.stroke();
  // گونه
  ctx.globalAlpha = .3;
  ctx.fillStyle = P.red;
  wobbleCircle(-26, -180, 8, 1, .7); ctx.fill();
  wobbleCircle(26, -180, 8, 2, .7); ctx.fill();
  ctx.globalAlpha = 1;
  // کلاهِ حصیری
  withShadow(10, 5, .26, () => {
    ctx.fillStyle = '#d6ac66';
    wobbleEllipse(0, -216, 62, 15, 0, 11, 2);
    ctx.fill();
  });
  ctx.fillStyle = '#c39a56';
  wobbleEllipse(0, -230, 30, 18, 0, 13, 1.6);
  ctx.fill();
  ctx.fillStyle = '#a97f42';
  wobbleEllipse(0, -218, 31, 6, 0, 15, 1.2);
  ctx.fill();
  ctx.restore();
}

/* ───────── نقشه روی سه‌پایه ───────── */

const BP = { x: 908, y: 64, w: 264, h: 330 };

function drawEasel() {
  const { x, y, w, h } = BP;
  // سه‌پایهٔ چوبی
  ctx.strokeStyle = P.woodDark;
  ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 56, y + h - 20); ctx.lineTo(x + 22, y + h + 128);
  ctx.moveTo(x + w - 56, y + h - 20); ctx.lineTo(x + w - 22, y + h + 128);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.strokeStyle = P.woodLit;
  ctx.beginPath();
  ctx.moveTo(x + 36, y + h + 66); ctx.lineTo(x + w - 36, y + h + 66);
  ctx.stroke();

  paper(x, y, w, h, P.paper, 21, 10, .36);
  // چسبِ گوشه‌ها
  ctx.fillStyle = 'rgba(214,172,102,.75)';
  for (const [cx, rot] of [[x + 14, -.32], [x + w - 14, .32]]) {
    ctx.save(); ctx.translate(cx, y - 5); ctx.rotate(rot);
    wobbleRect(-21, -8, 42, 17, 2, cx, 1); ctx.fill();
    ctx.restore();
  }

  text('نقشهٔ برج', x + w/2, y + 32, { size: 25, color: P.ink, family: 'Lalezar' });
  text(L().name, x + w/2, y + 58, { size: 15, color: P.inkSoft });
  ctx.strokeStyle = 'rgba(160,120,80,.3)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + 24, y + 74); ctx.lineTo(x + w - 24, y + 74); ctx.stroke();

  const rows = S.built.length;
  const rowH = (h - 108) / rows;
  for (let i = rows - 1; i >= 0; i--) {
    const ry = y + 96 + (rows - 1 - i) * rowH + rowH / 2;
    const known = S.built[i] >= S.target[i];
    const active = i === S.active && S.phase === 'build';

    if (active) {
      ctx.fillStyle = 'rgba(194,80,63,.11)';
      wobbleRect(x + 18, ry - rowH/2 + 3, w - 36, rowH - 6, 7, i, 1.2);
      ctx.fill();
    }
    text(`طبقهٔ ${fa(i + 1)}`, x + w - 26, ry, { size: 15, color: P.inkSoft, align: 'right' });

    // به‌جای عدد، خودِ آجرها — بچه می‌شمارد نه می‌خوانَد
    const shown = known ? S.target[i] : S.built[i];
    const cw = 14;
    const sx = x + w - 108;
    for (let k = 0; k < shown; k++) {
      ctx.fillStyle = known ? P.brick : P.brickLit;
      wobbleRect(sx - k * cw, ry - 7, 10, 14, 2, i * 5 + k, .7);
      ctx.fill();
    }
    if (active && !known) {
      text('؟', sx - shown * cw - 2, ry + 1,
        { size: 25, color: P.red, family: 'Lalezar', align: 'right' });
    }
    if (known) text(fa(S.target[i]), x + 34, ry, { size: 21, color: P.ink, family: 'Lalezar', align: 'left' });
  }
  drawDeltas(x, y, rows, rowH);
}

/** کمانِ «چقدر اضافه شد» بین دو طبقهٔ ساخته‌شده. */
function drawDeltas(x, y, rows, rowH) {
  for (let i = 0; i + 1 < rows; i++) {
    if (S.built[i] < S.target[i] || S.built[i+1] < S.target[i+1]) continue;
    const yTop = y + 96 + (rows - 1 - (i+1)) * rowH + rowH/2;
    const yBot = y + 96 + (rows - 1 - i) * rowH + rowH/2;
    const ax = x + 62;
    ctx.strokeStyle = P.green;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(ax, yBot - 9);
    ctx.quadraticCurveTo(ax - 26, (yTop + yBot)/2, ax, yTop + 9);
    ctx.stroke();
    ctx.fillStyle = P.green;
    ctx.beginPath();
    ctx.moveTo(ax, yTop + 9); ctx.lineTo(ax - 7, yTop + 16); ctx.lineTo(ax + 5, yTop + 17);
    ctx.closePath(); ctx.fill();
    text(`+${fa(S.target[i+1] - S.target[i])}`, ax - 34, (yTop + yBot)/2,
      { size: 16, color: P.green, family: 'Lalezar' });
  }
}

/* ───────── پرده‌ها ───────── */

function drawIntro() {
  overlay({
    t: S.introT, title: L().name, body: L().story,
    btn: BTN_GO, btnLabel: 'بزن بریم', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.brick, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.green, btnHotFill: '#8eae5b',
    icon: (cx, cy) => {
      for (let f = 0; f < 3; f++) {
        const n = f + 2;
        for (let k = 0; k < n; k++) {
          ctx.fillStyle = f === 2 ? P.brickLit : P.brick;
          wobbleRect(cx - n*9 + k*18, cy + 16 - f*15, 15, 12, 2, f*3+k, .8);
          ctx.fill();
        }
      }
    },
  });
}

function drawDone() {
  const lv = L();
  const seq = S.target.map((c) => fa(c)).join('  ،  ');
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.doneT, title: `${lv.name} ساخته شد!`,
    body: lv.rule === 'grow'
      ? `تعداد آجرها این‌طور بالا رفت:   ${seq}\nهر بار یکی بیشتر از دفعهٔ قبل اضافه شد.`
      : `تعداد آجرها این‌طور بالا رفت:   ${seq}\nهر طبقه ${fa(lv.step)} آجر بیشتر از طبقهٔ زیرش داشت.`,
    btn: BTN_GO, btnLabel: last ? 'حالا نوبتِ توست' : 'برجِ بعدی', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.green, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.green, btnHotFill: '#8eae5b',
    icon: (cx, cy) => star(cx, cy, 30, P.gold),
  });
}

/* ───────── حالتِ آزاد ───────── */

function drawFreePanel() {
  const F = S.free;
  const x = 946, y = 496, w = 214, h = 246;
  paper(x - 8, y, w + 16, h, P.paper, 61, 12, .36);
  text('برجِ خودت', x + w/2, y + 28, { size: 22, color: P.ink, family: 'Lalezar' });

  text('طبقهٔ اوّل چند آجر؟', x + w/2, y + 56, { size: 13, color: P.inkSoft });
  roundButton(F_START_L, '−', { fill: P.brickDk, hot: S.hover === F_START_L, size: 26 });
  text(fa(F.start), x + w/2, y + 70, { size: 32, color: P.ink, family: 'Lalezar' });
  roundButton(F_START_R, '+', { fill: P.brick, hot: S.hover === F_START_R, size: 26 });

  text('هر طبقه چندتا بیشتر؟', x + w/2, y + 108, { size: 13, color: P.inkSoft });
  roundButton(F_STEP_L, '−', { fill: P.brickDk, hot: S.hover === F_STEP_L, size: 26 });
  text(fa(F.step), x + w/2, y + 128, { size: 32, color: P.green, family: 'Lalezar' });
  roundButton(F_STEP_R, '+', { fill: P.brick, hot: S.hover === F_STEP_R, size: 26 });

  button(FREE_BTN, 'بساز!', { hot: S.hover === FREE_BTN, fill: P.green, hotFill: '#8eae5b', size: 24 });

  const shown = F.running ? Math.min(F.floors, Math.floor(F.runT) + 1) : F.floors;
  for (let f = 0; f < shown; f++) {
    const n = F.start + F.step * f;
    for (let k = 0; k < n; k++) {
      const b = brickBox(f, k, n);
      ctx.fillStyle = noise1(f*3+k) > .5 ? P.brickLit : P.brick;
      withShadow(6, 3, .28, () => {
        wobbleRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4, 4, f*31+k, 1.3);
        ctx.fill();
      });
    }
    text(fa(n), TOWER_X + 290, floorY(f) - 15,
      { size: 20, color: '#fff3dc', family: 'Lalezar', stroke: 'rgba(80,44,20,.6)', strokeWidth: 5 });
  }
  text('هر عددی خواستی بگذار و ببین برج چطور بالا می‌رود', TOWER_X, 128,
    { size: 19, color: '#fff3dc', stroke: 'rgba(80,44,20,.55)', strokeWidth: 5 });
}

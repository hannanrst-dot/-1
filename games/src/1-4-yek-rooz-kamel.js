/*!
title: یک روزِ کامل — ساعت در بعدازظهر
bg: #12172a
*/

/* ═══════════════════════════════════════════════════════════════════════
   یک روزِ کامل — ریاضی سوم، فصل ۱، درس ۴ (ساعت در بعدازظهر)
   ───────────────────────────────────────────────────────────────────────
   سختیِ این درس این است که «۴ بعدازظهر» و «ساعت ۱۶» یک لحظه‌اند، ولی
   بچه دو عدد می‌بیند. اینجا آن لحظه یک چیزِ دیدنی است: با چرخاندنِ عقربه،
   آسمانِ شهر رنگ عوض می‌کند، خورشید و ماه جابه‌جا می‌شوند، چراغ‌ها روشن
   می‌شوند و مردمِ میدان کارشان را عوض می‌کنند. زیرِ ساعت هم نوارِ
   شبانه‌روز است: ۰ تا ۲۴، با نیمهٔ ظهر مشخّص.

   بچه عقربه را می‌چرخاند تا کارِ خواسته‌شده در شهر اتفاق بیفتد؛ عدد را
   جایی تایپ نمی‌کند. تلفیق: اذانِ ظهر و مغرب از دینی، زنگِ مدرسه و
   بازارِ شهر از مطالعات.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

/* ───────── پالت ─────────
   آسمان از روی ساعت ساخته می‌شود، پس پالت چند حالت دارد و بینشان
   درون‌یابی می‌شود. باقیِ شهر ثابت است تا تغییرِ نور دیده شود.        */
const SKIES = [
  { h: 0,  top: '#141a33', low: '#25314f', sun: null,      light: .12 },
  { h: 5,  top: '#2c3a63', low: '#7a6a86', sun: null,      light: .3  },
  { h: 7,  top: '#6ea6c8', low: '#f2c48a', sun: '#ffd98a', light: .68 },
  { h: 11, top: '#7fc0e6', low: '#cfe9f3', sun: '#fff6d4', light: 1   },
  { h: 15, top: '#74b6de', low: '#e5dfc2', sun: '#ffeeb4', light: .92 },
  { h: 18, top: '#5d7fae', low: '#f0a267', sun: '#ffbd6a', light: .58 },
  { h: 20, top: '#2f3f6b', low: '#8a5f74', sun: null,      light: .26 },
  { h: 24, top: '#141a33', low: '#25314f', sun: null,      light: .12 },
];

const P = {
  wall:     '#d9c4a0',
  wallDk:   '#bda37c',
  wallShade:'#a28d6a',
  roof:     '#9c5a45',
  roofDk:   '#7c4432',
  dome:     '#2f8f9c',
  domeDk:   '#20707c',
  brick:    '#c08a5e',
  window:   '#5a6a86',
  windowOn: '#ffd98a',
  street:   '#6b6152',
  streetDk: '#544c40',
  tree:     '#4a7a44',
  treeDk:   '#355b32',
  clockFace:'#f6ecd6',
  clockRim: '#b98a48',
  ink:      '#2e2a1e',
  inkSoft:  '#7a7256',
  paper:    '#f8f0dd',
  red:      '#c2503f',
  green:    '#6f9a52',
  gold:     '#e8b448',
  night:    '#1b2340',
};

/* ───────── کارهای روز ───────── */
// hour بر مبنای ۲۴ ساعته است؛ خودِ بازی هر دو شکل را نشان می‌دهد.
const TASKS = [
  { hour: 7,  label: 'رفتن به مدرسه',       icon: 'school',
    story: 'صبح است. عقربه را بچرخان تا برسی به ساعتی که زنگِ مدرسه می‌خورد.' },
  { hour: 12, label: 'اذانِ ظهر',           icon: 'mosque',
    story: 'خورشید دارد می‌رسد بالای سرِ شهر. عقربه را ببر تا لحظه‌ای که\nصدای اذانِ ظهر از مناره بلند می‌شود.' },
  { hour: 16, label: 'بازی در پارک',        icon: 'ball',
    story: 'حالا بعدازظهر است. «چهارِ بعدازظهر» روی نوارِ شبانه‌روز کجاست؟\nخوب به عددِ زیرِ نوار نگاه کن.' },
  { hour: 19, label: 'اذانِ مغرب و شام',    icon: 'moon',
    story: 'آفتاب دارد پشتِ بام‌ها می‌رود. برو به ساعتِ ۱۹ —\nیعنی هفتِ بعدازظهر.' },
  { hour: 21, label: 'وقتِ خواب',           icon: 'bed',
    story: 'آخرین کارِ روز. عقربه را ببر به ۹ِ شب.\nببین روی نوار چه عددی می‌شود.' },
];

/* ───────── وضعیت ───────── */

const S = {
  task: 0,
  phase: 'intro',
  hour: 6,               // اعشاری، ۰ تا ۲۴
  dragging: false,
  t: 0, introT: 0, doneT: 0,
  hover: null,
  stars: 0,
  hold: 0,               // چقدر روی ساعتِ درست مانده
  people: [],
  birds: [],
  smoke: [],
};

const bits = new Bits();
const toast = new Toast();
const T = () => TASKS[S.task];

function loadTask(i) {
  S.task = i;
  S.hour = i === 0 ? 5 : clamp(TASKS[i].hour - 4, 0, 23);
  S.phase = 'intro'; S.introT = 0;
  S.hold = 0;
  S.people = Array.from({ length: 5 }, (_, k) => ({
    x: 120 + k * 210 + noise1(k * 3) * 60,
    sp: (noise1(k * 7) > .5 ? 1 : -1) * (16 + noise1(k) * 18),
    kind: k % 3, hue: noise1(k * 5),
  }));
  S.birds = Array.from({ length: 5 }, (_, k) => ({ a: k * 1.4, r: 90 + k * 26, cx: 300 + k * 190, cy: 130 + k * 22 }));
}

/* ───────── نور و آسمان ───────── */

function skyAt(h) {
  let a = SKIES[0], b = SKIES[SKIES.length - 1];
  for (let i = 0; i + 1 < SKIES.length; i++) {
    if (h >= SKIES[i].h && h <= SKIES[i + 1].h) { a = SKIES[i]; b = SKIES[i + 1]; break; }
  }
  const t = (h - a.h) / Math.max(.0001, b.h - a.h);
  return {
    top: mixHex(a.top, b.top, t),
    low: mixHex(a.low, b.low, t),
    light: lerp(a.light, b.light, t),
    sun: a.sun && b.sun ? mixHex(a.sun, b.sun, t) : (t < .5 ? a.sun : b.sun),
  };
}

function mixHex(c1, c2, t) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.substr(i, 2), 16));
  const A = p(c1), B = p(c2);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t, 0, 1))).toString(16).padStart(2, '0')).join('');
}

const isNight = () => S.hour < 6.4 || S.hour > 18.4;

/* ───────── چیدمان ───────── */

const CLOCK = { x: 952, y: 250, r: 122 };
const BAR = { x: 120, y: 658, w: 960, h: 34 };
const BTN_GO = { x: 470, y: 556, w: 260, h: 76 };

/** ساعت از روی موقعیت روی نوارِ شبانه‌روز. */
function hourFromBar(px) {
  return clamp((px - BAR.x) / BAR.w * 24, 0, 24);
}

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
loadTask(0);
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt;
  if (S.phase === 'intro') S.introT += dt;
  if (S.phase === 'done') S.doneT += dt;

  for (const p of S.people) {
    p.x += p.sp * dt * (isNight() ? .4 : 1);
    if (p.x < 60) { p.x = 60; p.sp *= -1; }
    if (p.x > SCENE_W - 60) { p.x = SCENE_W - 60; p.sp *= -1; }
  }
  for (const b of S.birds) b.a += dt * 1.1;
  if (Math.random() < .3) S.smoke.push({ x: 214 + rnd(6), y: 386, r: 5 + Math.random() * 5, life: 0 });
  for (const q of S.smoke) { q.life += dt; q.y -= 22 * dt; q.r += 10 * dt; }
  S.smoke = S.smoke.filter((q) => q.life < 2.6);

  // نگه‌داشتنِ عقربه روی ساعتِ درست
  if (S.phase === 'play') {
    if (Math.round(S.hour) === T().hour && !S.dragging) {
      S.hold += dt;
      if (S.hold > .7) succeed();
    } else if (Math.round(S.hour) !== T().hour) S.hold = 0;
  }

  bits.step(dt);
  toast.step(dt);
  draw();
}

const rnd = (a) => (Math.random() - .5) * 2 * a;

function succeed() {
  S.phase = 'done'; S.doneT = 0;
  S.stars++;
  sfx.win();
  bits.confetti(CLOCK.x, CLOCK.y, 60, [P.gold, P.green, P.red, '#fff']);
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase === 'intro' || S.phase === 'done') return inRect(p, BTN_GO) ? BTN_GO : null;
  const d = Math.hypot(p.x - CLOCK.x, p.y - CLOCK.y);
  if (d < CLOCK.r + 26) return 'clock';
  if (p.y > BAR.y - 40 && p.y < BAR.y + BAR.h + 30 && p.x > BAR.x - 20 && p.x < BAR.x + BAR.w + 20) return 'bar';
  return null;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = hitTest(p);
  cv.style.cursor = S.hover ? (S.hover === 'clock' ? 'grab' : 'pointer') : 'default';
  if (!S.dragging) return;
  if (S.dragging === 'clock') setHourFromAngle(p);
  else S.hour = hourFromBar(p.x);
});
cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  const h = hitTest(p);
  if (!h) return;
  if (S.phase === 'intro') { S.phase = 'play'; sfx.tap(); return; }
  if (S.phase === 'done') {
    if (S.task + 1 < TASKS.length) loadTask(S.task + 1);
    else { loadTask(0); S.phase = 'play'; }
    return;
  }
  cv.setPointerCapture(e.pointerId);
  S.dragging = h;
  if (h === 'clock') setHourFromAngle(p); else S.hour = hourFromBar(p.x);
  sfx.tick();
});
const release = () => {
  if (!S.dragging) return;
  S.dragging = false;
  S.hour = Math.round(S.hour * 2) / 2;         // به نیم‌ساعتِ نزدیک بچسبد
};
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);

/** عقربه را از روی زاویهٔ انگشت می‌چرخاند و صبح/بعدازظهر را نگه می‌دارد. */
let lastAng = null;
function setHourFromAngle(p) {
  let a = Math.atan2(p.y - CLOCK.y, p.x - CLOCK.x) + Math.PI / 2;
  if (a < 0) a += TAU;
  const h12 = (a / TAU) * 12;
  const prev = S.hour;
  const half = Math.floor(prev / 12);           // ۰ = قبل‌ازظهر، ۱ = بعدازظهر
  let cand = half * 12 + h12;
  // اگر از ۱۲ رد شد، به نیمهٔ بعد/قبل برود
  if (cand - prev > 6) cand -= 12;
  if (prev - cand > 6) cand += 12;
  S.hour = clamp(cand, 0, 24);
  const now = Math.floor(S.hour);
  if (lastAng !== now) { lastAng = now; sfx.tick(); }
}

/* ───────── ترسیم ───────── */

function draw() {
  const sky = skyAt(S.hour);
  beginScene('#12172a');
  drawSky(sky);
  drawTown(sky);
  drawStreet(sky);
  drawPeople(sky);
  drawClockTower(sky);
  drawBar();
  drawTaskCard();
  bits.draw();
  toast.draw(20, { ink: P.ink });
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'done') drawDone();
  endScene(.10, `rgba(10,14,30,${.5 - sky.light * .28})`);
}

function drawSky(sky) {
  const g = ctx.createLinearGradient(0, 0, 0, 470);
  g.addColorStop(0, sky.top);
  g.addColorStop(1, sky.low);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, 470);

  // خورشید یا ماه، روی کمانِ روز
  const dayT = clamp((S.hour - 6) / 12, 0, 1);
  const nightT = S.hour > 18 ? (S.hour - 18) / 12 : (S.hour + 6) / 12;
  if (S.hour > 5.6 && S.hour < 18.6) {
    const x = lerp(90, SW - 250, dayT);
    const y = 400 - Math.sin(Math.PI * dayT) * 320;
    const halo = ctx.createRadialGradient(x, y, 10, x, y, 200);
    halo.addColorStop(0, 'rgba(255,244,200,.55)');
    halo.addColorStop(1, 'rgba(255,244,200,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, 200, 0, TAU); ctx.fill();
    ctx.fillStyle = sky.sun || '#ffe9a8';
    wobbleCircle(x, y, 44, 3, 1.6);
    ctx.fill();
  } else {
    const x = lerp(400, SW - 300, clamp(nightT, 0, 1));
    const y = 330 - Math.sin(Math.PI * clamp(nightT, 0, 1)) * 250;
    const halo = ctx.createRadialGradient(x, y, 8, x, y, 130);
    halo.addColorStop(0, 'rgba(226,232,255,.28)');
    halo.addColorStop(1, 'rgba(226,232,255,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, 130, 0, TAU); ctx.fill();
    // هلال با پاک‌کردنِ یک دایره از روی ماه — نه با رنگِ آسمان،
    // وگرنه روی گرادیانِ آسمان یک لکهٔ تیره می‌ماند.
    ctx.save();
    ctx.fillStyle = '#f2f0e2';
    wobbleCircle(x, y, 34, 5, 1.4);
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    wobbleCircle(x + 17, y - 9, 30, 7, 1.2);
    ctx.fill();
    ctx.restore();
    // ستاره‌ها
    for (let i = 0; i < 40; i++) {
      const sx = noise1(i * 7.7) * SW, sy = noise1(i * 3.3) * 380;
      const tw = .4 + Math.sin(S.t * 2 + i) * .3;
      ctx.globalAlpha = tw * (1 - skyAt(S.hour).light);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(sx, sy, 1.6, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // پرنده‌ها فقط در روشنایی
  if (skyAt(S.hour).light > .5) {
    ctx.strokeStyle = 'rgba(60,60,70,.4)';
    ctx.lineWidth = 2.4;
    for (const b of S.birds) {
      const x = b.cx + Math.cos(b.a) * b.r, y = b.cy + Math.sin(b.a * 1.6) * 18;
      const f = Math.sin(S.t * 8 + b.a) * 4;
      ctx.beginPath();
      ctx.moveTo(x - 9, y); ctx.quadraticCurveTo(x, y - 5 - f, x + 9, y);
      ctx.stroke();
    }
  }
}

/* ───────── شهر ───────── */

function drawTown(sky) {
  const on = 1 - sky.light;                      // چقدر چراغ‌ها روشن‌اند

  // ردیفِ خانه‌های دور
  for (let i = 0; i < 9; i++) {
    const x = -30 + i * 148;
    const h = 110 + noise1(i * 3.1) * 90;
    ctx.globalAlpha = .5;
    ctx.fillStyle = mixHex(P.wallDk, P.night, on * .7);
    wobbleRect(x, 470 - h, 130, h, 4, i, 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // مسجد با گنبد و مناره، سمتِ چپ
  drawMosque(214, 470, on);
  // ساختمانِ مدرسه، وسط
  drawSchool(560, 470, on);
  // خانه‌های کوچک سمت راست
  drawHouse(760, 470, on, 0);
  drawHouse(1096, 470, on, 1);

  // درخت‌های میدان
  for (const [x, sc] of [[430, 1], [700, .82], [1010, .9], [86, .78]]) {
    ctx.save();
    ctx.translate(x, 470);
    ctx.scale(sc, sc);
    ctx.fillStyle = mixHex('#6b4a30', P.night, on * .7);
    wobbleRect(-8, -70, 16, 72, 3, x, 1.2);
    ctx.fill();
    for (const [dx, dy, r] of [[-26, -96, 32], [22, -100, 30], [0, -122, 34], [-6, -80, 26]]) {
      ctx.fillStyle = mixHex(r > 31 ? P.tree : P.treeDk, P.night, on * .72);
      wobbleCircle(dx, dy, r, x + dx, 3.4);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawMosque(x, baseY, on) {
  const wallC = mixHex(P.wall, P.night, on * .62);
  // مناره
  ctx.fillStyle = wallC;
  wobbleRect(x - 96, baseY - 262, 34, 262, 5, 3, 1.6);
  ctx.fill();
  ctx.fillStyle = mixHex(P.dome, P.night, on * .5);
  ctx.beginPath();
  ctx.moveTo(x - 102, baseY - 262);
  ctx.quadraticCurveTo(x - 79, baseY - 312, x - 56, baseY - 262);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = on > .4 ? P.windowOn : wallC;   // چراغِ مناره
  wobbleRect(x - 90, baseY - 250, 22, 20, 3, 5, 1);
  ctx.fill();

  // بدنه
  withShadow(16, 8, .3, () => {
    ctx.fillStyle = wallC;
    wobbleRect(x - 60, baseY - 150, 172, 150, 6, 7, 2);
    ctx.fill();
  }, '20, 24, 40');
  // گنبد
  ctx.fillStyle = mixHex(P.dome, P.night, on * .5);
  ctx.beginPath();
  ctx.moveTo(x - 40, baseY - 150);
  ctx.quadraticCurveTo(x + 26, baseY - 254, x + 92, baseY - 150);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = mixHex(P.domeDk, P.night, on * .5);
  ctx.beginPath();
  ctx.moveTo(x + 50, baseY - 178);
  ctx.quadraticCurveTo(x + 78, baseY - 200, x + 92, baseY - 150);
  ctx.lineTo(x + 50, baseY - 150);
  ctx.closePath(); ctx.fill();
  // درِ قوسی
  ctx.fillStyle = on > .4 ? mixHex('#3a3020', P.windowOn, .5) : '#3a3020';
  ctx.beginPath();
  ctx.moveTo(x + 6, baseY);
  ctx.lineTo(x + 6, baseY - 66);
  ctx.quadraticCurveTo(x + 26, baseY - 100, x + 46, baseY - 66);
  ctx.lineTo(x + 46, baseY);
  ctx.closePath(); ctx.fill();
  // دودِ اجاقِ خانهٔ کناری
  for (const q of S.smoke) {
    ctx.globalAlpha = (1 - q.life / 2.6) * .22;
    ctx.fillStyle = '#e6e6e0';
    wobbleCircle(q.x, q.y, q.r, q.x, 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSchool(x, baseY, on) {
  const wallC = mixHex(P.brick, P.night, on * .62);
  withShadow(16, 8, .3, () => {
    ctx.fillStyle = wallC;
    wobbleRect(x - 100, baseY - 178, 208, 178, 6, 11, 2);
    ctx.fill();
  }, '20, 24, 40');
  ctx.fillStyle = mixHex(P.roof, P.night, on * .55);
  ctx.beginPath();
  ctx.moveTo(x - 116, baseY - 178);
  ctx.lineTo(x + 4, baseY - 232);
  ctx.lineTo(x + 124, baseY - 178);
  ctx.closePath(); ctx.fill();
  // پنجره‌ها — کلاس‌ها فقط صبح تا ظهر روشن‌اند
  const classOn = S.hour >= 7 && S.hour <= 13;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const wx = x - 82 + c * 48, wy = baseY - 156 + r * 62;
      ctx.fillStyle = classOn || on > .45 ? P.windowOn : mixHex(P.window, P.night, on * .6);
      wobbleRect(wx, wy, 32, 40, 3, r * 5 + c, 1);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.28)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wx + 16, wy); ctx.lineTo(wx + 16, wy + 40);
      ctx.stroke();
    }
  }
  // زنگِ مدرسه
  ctx.fillStyle = mixHex(P.gold, P.night, on * .4);
  ctx.beginPath();
  ctx.moveTo(x - 12, baseY - 244);
  ctx.quadraticCurveTo(x + 4, baseY - 272, x + 20, baseY - 244);
  ctx.closePath(); ctx.fill();
}

function drawHouse(x, baseY, on, seed) {
  const wallC = mixHex(seed ? P.wall : P.wallDk, P.night, on * .62);
  const h = 128 + seed * 22;
  withShadow(14, 7, .28, () => {
    ctx.fillStyle = wallC;
    wobbleRect(x - 70, baseY - h, 150, h, 5, seed * 9 + 3, 1.8);
    ctx.fill();
  }, '20, 24, 40');
  ctx.fillStyle = mixHex(P.roofDk, P.night, on * .55);
  wobbleRect(x - 80, baseY - h - 16, 170, 18, 4, seed + 5, 1.4);
  ctx.fill();
  // بادگیر
  ctx.fillStyle = wallC;
  wobbleRect(x - 12, baseY - h - 66, 48, 52, 4, seed + 7, 1.4);
  ctx.fill();
  ctx.fillStyle = mixHex(P.roofDk, P.night, on * .5);
  for (let k = 0; k < 3; k++) {
    wobbleRect(x - 6 + k * 15, baseY - h - 58, 7, 34, 2, seed + k, .8);
    ctx.fill();
  }
  // پنجره‌ها — شب روشن، روز خاموش
  for (let c = 0; c < 2; c++) {
    ctx.fillStyle = on > .38 ? P.windowOn : mixHex(P.window, P.night, on * .6);
    wobbleRect(x - 46 + c * 66, baseY - h + 32, 40, 44, 4, seed * 3 + c, 1.2);
    ctx.fill();
  }
}

function drawStreet(sky) {
  const on = 1 - sky.light;
  const g = ctx.createLinearGradient(0, 466, 0, SH);
  g.addColorStop(0, mixHex(P.street, P.night, on * .6));
  g.addColorStop(1, mixHex(P.streetDk, P.night, on * .7));
  ctx.fillStyle = g;
  ctx.fillRect(0, 466, SW, SH - 466);
  // سنگ‌فرش
  ctx.strokeStyle = 'rgba(0,0,0,.16)';
  ctx.lineWidth = 2;
  for (let r = 0; r < 4; r++) {
    const y = 486 + r * 34;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SW, y); ctx.stroke();
    for (let x = (r % 2 ? 0 : 40); x < SW; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 34); ctx.stroke();
    }
  }
  // تیرِ چراغِ خیابان
  for (const lx of [330, 880]) {
    ctx.strokeStyle = mixHex('#4a4a44', P.night, on * .5);
    ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lx, 500); ctx.lineTo(lx, 356);
    ctx.quadraticCurveTo(lx, 340, lx + 26, 340);
    ctx.stroke();
    ctx.fillStyle = on > .38 ? P.windowOn : '#6a6a60';
    wobbleCircle(lx + 28, 348, 12, lx, 1);
    ctx.fill();
    if (on > .38) {
      const gg = ctx.createRadialGradient(lx + 28, 348, 6, lx + 28, 348, 150);
      gg.addColorStop(0, `rgba(255,217,138,${.3 * on})`);
      gg.addColorStop(1, 'rgba(255,217,138,0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(lx + 28, 348, 150, 0, TAU); ctx.fill();
    }
  }
}

/** مردمِ میدان — کوچک و ساده، فقط برای زنده‌بودنِ شهر. */
function drawPeople(sky) {
  const on = 1 - sky.light;
  for (const p of S.people) {
    const walk = Math.sin(S.t * 5 + p.x * .1) * (isNight() ? 2 : 5);
    const y = 516 + (p.kind % 2) * 22;
    const col = ['#c2503f', '#4f6f84', '#6f9a52'][p.kind];
    ctx.save();
    ctx.translate(p.x, y);
    ctx.scale(p.sp > 0 ? 1 : -1, 1);
    ctx.globalAlpha = .3;
    ctx.fillStyle = '#000';
    wobbleEllipse(2, 3, 14, 4, 0, p.x, 1);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = mixHex('#3a3226', P.night, on * .5);
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-3, -4); ctx.lineTo(-3 - walk * .4, 2);
    ctx.moveTo(3, -4); ctx.lineTo(3 + walk * .4, 2);
    ctx.stroke();
    ctx.fillStyle = mixHex(col, P.night, on * .55);
    wobbleRect(-9, -30, 18, 28, 5, p.x, 1);
    ctx.fill();
    ctx.fillStyle = mixHex('#d9a97e', P.night, on * .5);
    wobbleCircle(0, -38, 9, p.x + 1, .8);
    ctx.fill();
    ctx.restore();
  }
}

/* ───────── ساعتِ بزرگِ میدان ───────── */

function drawClockTower(sky) {
  const c = CLOCK;
  const on = 1 - sky.light;
  // پایهٔ برجِ ساعت
  ctx.fillStyle = mixHex(P.wallDk, P.night, on * .6);
  wobbleRect(c.x - 62, c.y + 60, 124, 420, 6, 3, 2);
  ctx.fill();
  ctx.fillStyle = mixHex(P.roofDk, P.night, on * .5);
  wobbleRect(c.x - 76, c.y + 52, 152, 22, 4, 5, 1.4);
  ctx.fill();

  withShadow(24, 12, .4, () => {                  // قابِ ساعت
    ctx.fillStyle = mixHex(P.clockRim, P.night, on * .35);
    wobbleCircle(c.x, c.y, c.r + 20, 7, 2.4);
    ctx.fill();
  }, '20, 24, 40');
  ctx.fillStyle = P.clockFace;
  wobbleCircle(c.x, c.y, c.r, 9, 2);
  ctx.fill();

  // شماره‌ها و خط‌ها
  for (let k = 1; k <= 12; k++) {
    const a = -Math.PI / 2 + (k / 12) * TAU;
    text(fa(k), c.x + Math.cos(a) * (c.r - 26), c.y + Math.sin(a) * (c.r - 26),
      { size: 24, color: P.ink, family: 'Lalezar' });
  }
  ctx.strokeStyle = 'rgba(46,42,30,.35)';
  for (let k = 0; k < 60; k++) {
    const a = (k / 60) * TAU;
    const big = k % 5 === 0;
    ctx.lineWidth = big ? 3 : 1.4;
    ctx.beginPath();
    ctx.moveTo(c.x + Math.cos(a) * (c.r - 8), c.y + Math.sin(a) * (c.r - 8));
    ctx.lineTo(c.x + Math.cos(a) * (c.r - (big ? 16 : 12)), c.y + Math.sin(a) * (c.r - (big ? 16 : 12)));
    ctx.stroke();
  }

  // عقربه‌ها
  const h12 = S.hour % 12;
  const ah = -Math.PI / 2 + (h12 / 12) * TAU;
  const am = -Math.PI / 2 + ((S.hour % 1) * 60 / 60) * TAU;
  ctx.strokeStyle = P.ink;
  ctx.lineCap = 'round';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(c.x - Math.cos(am) * 14, c.y - Math.sin(am) * 14);
  ctx.lineTo(c.x + Math.cos(am) * (c.r - 26), c.y + Math.sin(am) * (c.r - 26));
  ctx.stroke();
  ctx.strokeStyle = P.red;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(c.x - Math.cos(ah) * 14, c.y - Math.sin(ah) * 14);
  ctx.lineTo(c.x + Math.cos(ah) * (c.r - 52), c.y + Math.sin(ah) * (c.r - 52));
  ctx.stroke();
  ctx.fillStyle = P.clockRim;
  wobbleCircle(c.x, c.y, 12, 11, 1);
  ctx.fill();

  // دستگیرهٔ کشیدن روی نوکِ عقربهٔ ساعت‌شمار
  const gx = c.x + Math.cos(ah) * (c.r - 52), gy = c.y + Math.sin(ah) * (c.r - 52);
  const hot = S.hover === 'clock' || S.dragging === 'clock';
  ctx.fillStyle = hot ? P.gold : 'rgba(232,180,72,.7)';
  wobbleCircle(gx, gy, hot ? 17 : 14, 13, 1.2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(46,42,30,.5)';
  ctx.lineWidth = 2;
  wobbleCircle(gx, gy, hot ? 17 : 14, 13, 1.2);
  ctx.stroke();

  // ساعت به دو شکل، زیرِ صفحه
  const H = Math.floor(S.hour) % 24;
  const mm = Math.round((S.hour % 1) * 60);
  const pm = H >= 12;
  const h12s = H % 12 === 0 ? 12 : H % 12;
  const label = `${fa(h12s)}:${fa(String(mm).padStart(2, '0'))} ${pm ? 'بعدازظهر' : 'صبح'}`;
  paper(c.x - 118, c.y + c.r + 42, 236, 84, P.paper, 51, 10, .34);
  text(label, c.x, c.y + c.r + 70, { size: 25, color: P.ink, family: 'Lalezar' });
  text(`یعنی ساعتِ ${fa(H)}`, c.x, c.y + c.r + 102, { size: 18, color: P.inkSoft });
}

/* ───────── نوارِ شبانه‌روز ───────── */

function drawBar() {
  const b = BAR;
  paper(b.x - 22, b.y - 52, b.w + 44, b.h + 108, P.paper, 61, 12, .34);
  text('شبانه‌روز: از نیمه‌شب تا نیمه‌شب', b.x + b.w/2, b.y - 34, { size: 15, color: P.inkSoft });

  // نوار، با رنگِ آسمانِ همان ساعت
  for (let k = 0; k < 24; k++) {
    const sk = skyAt(k + .5);
    ctx.fillStyle = sk.low;
    ctx.fillRect(b.x + (k / 24) * b.w, b.y, b.w / 24 + .5, b.h);
  }
  ctx.strokeStyle = 'rgba(46,42,30,.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x, b.y, b.w, b.h);

  // خطِ ظهر
  const noon = b.x + b.w / 2;
  ctx.strokeStyle = P.red;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(noon, b.y - 12); ctx.lineTo(noon, b.y + b.h + 12); ctx.stroke();
  ctx.setLineDash([]);
  text('ظهر', noon, b.y - 16, { size: 14, color: P.red, stroke: P.paper, strokeWidth: 4 });

  for (let k = 0; k <= 24; k += 2) {
    const x = b.x + (k / 24) * b.w;
    ctx.strokeStyle = 'rgba(46,42,30,.45)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, b.y + b.h); ctx.lineTo(x, b.y + b.h + 7); ctx.stroke();
    text(fa(k), x, b.y + b.h + 20, { size: 14, color: P.inkSoft });
  }
  text('صبح', b.x + b.w * .25, b.y + b.h + 42, { size: 15, color: P.inkSoft });
  text('بعدازظهر', b.x + b.w * .75, b.y + b.h + 42, { size: 15, color: P.inkSoft });

  // نشانگرِ ساعتِ فعلی
  const mx = b.x + (S.hour / 24) * b.w;
  ctx.fillStyle = P.ink;
  ctx.beginPath();
  ctx.moveTo(mx, b.y - 4); ctx.lineTo(mx - 9, b.y - 18); ctx.lineTo(mx + 9, b.y - 18);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(46,42,30,.9)';
  ctx.fillRect(mx - 1.5, b.y, 3, b.h);
}

/* ───────── کارتِ مأموریت ───────── */

function drawTaskCard() {
  const x = 62, y = 96, w = 268, h = 168;
  paper(x, y, w, h, P.paper, 71, 12, .34);
  text('کارِ این ساعت', x + w/2, y + 26, { size: 15, color: P.inkSoft });
  drawTaskIcon(x + w/2, y + 70, T().icon);
  text(T().label, x + w/2, y + 122, { size: 23, color: P.ink, family: 'Lalezar' });

  // ستاره‌های به‌دست‌آمده
  for (let i = 0; i < TASKS.length; i++) {
    star(x + 30 + i * 26, y + h - 16, 9, i < S.stars ? P.gold : 'rgba(46,42,30,.16)');
  }
}

function drawTaskIcon(x, y, kind) {
  ctx.save();
  ctx.translate(x, y);
  if (kind === 'school') {
    ctx.fillStyle = P.brick;
    wobbleRect(-28, -14, 56, 34, 4, 3, 1.2); ctx.fill();
    ctx.fillStyle = P.roof;
    ctx.beginPath(); ctx.moveTo(-34, -14); ctx.lineTo(0, -34); ctx.lineTo(34, -14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.windowOn;
    wobbleRect(-8, -6, 16, 26, 2, 5, .8); ctx.fill();
  } else if (kind === 'mosque') {
    ctx.fillStyle = P.wall;
    wobbleRect(-26, -10, 52, 30, 4, 7, 1.2); ctx.fill();
    ctx.fillStyle = P.dome;
    ctx.beginPath(); ctx.moveTo(-22, -10); ctx.quadraticCurveTo(0, -50, 22, -10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.wall;
    wobbleRect(28, -28, 12, 48, 3, 9, .8); ctx.fill();
  } else if (kind === 'ball') {
    ctx.fillStyle = P.green;
    wobbleCircle(0, 0, 24, 11, 1.4); ctx.fill();
    ctx.strokeStyle = '#f8f0dd'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 24, .3, 2.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 24, 3.5, 5.4); ctx.stroke();
  } else if (kind === 'moon') {
    ctx.fillStyle = P.gold;
    wobbleCircle(0, 0, 24, 13, 1.4); ctx.fill();
    ctx.fillStyle = P.paper;
    wobbleCircle(12, -8, 20, 15, 1.2); ctx.fill();
  } else {
    ctx.fillStyle = '#6f7f9a';
    wobbleRect(-30, -4, 60, 24, 4, 17, 1.2); ctx.fill();
    ctx.fillStyle = P.paper;
    wobbleRect(-24, -16, 24, 16, 4, 19, 1); ctx.fill();
    ctx.fillStyle = '#4f5f7a';
    wobbleRect(-34, -20, 8, 40, 3, 21, .8); ctx.fill();
  }
  ctx.restore();
}

/* ───────── پرده‌ها ───────── */

function drawIntro() {
  overlay({
    t: S.introT, title: T().label, body: T().story,
    btn: BTN_GO, btnLabel: 'باشد', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.green, btnHotFill: '#7fa85e',
    icon: (cx, cy) => drawTaskIcon(cx, cy, T().icon),
  });
}

function drawDone() {
  const H = T().hour;
  const pm = H >= 12;
  const h12 = H % 12 === 0 ? 12 : H % 12;
  const last = S.task + 1 >= TASKS.length;
  overlay({
    t: S.doneT,
    title: `ساعتِ ${fa(H)}`,
    body: `${fa(h12)}ِ ${pm ? 'بعدازظهر' : 'صبح'}  و  ساعتِ ${fa(H)} یک لحظه‌اند.\n` +
      (pm ? `چون بعد از ظهر است، ${fa(h12)} به‌علاوهٔ ۱۲ می‌شود ${fa(H)}.`
          : 'قبل از ظهر است، پس هر دو عدد یکی است.'),
    btn: BTN_GO, btnLabel: last ? 'از اوّلِ روز' : 'کارِ بعدی', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.green, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.green, btnHotFill: '#7fa85e',
    icon: (cx, cy) => star(cx, cy, 28, P.gold),
  });
}

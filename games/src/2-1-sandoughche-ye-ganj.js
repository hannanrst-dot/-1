/*!
title: صندوقچهٔ گنج — الگوسازی
bg: #17110c
*/

/* ═══════════════════════════════════════════════════════════════════════
   صندوقچهٔ گنج — ریاضی سوم، فصل ۲، درس ۱ (حلّ مسئله: الگوسازی)
   ───────────────────────────────────────────────────────────────────────
   درسِ کتاب این است: وقتی مسئله «همهٔ حالت‌ها» را می‌خواهد، باید با نظم
   جلو بروی وگرنه بعضی را جا می‌اندازی و بعضی را دوبار می‌نویسی.

   اینجا این حرف زده نمی‌شود؛ خرجش را می‌دهی:

     صندوقچه چند قفل دارد، به تعدادِ همهٔ حالت‌های ممکن. هر ترکیبِ تازه
     یک قفل را باز می‌کند. ولی شمع‌ها شمرده‌اند و هر امتحان یک شمع
     می‌سوزاند — چه تازه باشد چه تکراری.

   پس بچه‌ای که الکی می‌چرخاند، شمع‌هایش تمام می‌شود و صندوق بسته می‌ماند.
   بچه‌ای که با نظم می‌رود، می‌رسد. کسی این را به او نگفته.

   دو کمکِ اختیاری هم هست که خودش باید کشفشان کند:
     • دفترِ گنج هرچه پیدا کرده نشان می‌دهد.
     • اهرمِ «مرتّب کن» دفتر را مرتّب می‌کند و آن‌وقت جای خالی‌ها به چشم
       می‌آید — همان جدولِ مرتّبِ کتاب.
     • سه ترکیبِ تازهٔ پشتِ‌سرِهم یک شمعِ اضافه می‌آورد؛ نظم پاداش دارد.

   قفل‌های مرحلهٔ ۲ و ۳ دقیقاً همان دو تمرینِ صفحهٔ ۲۶ کتاب‌اند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  wallHi:   '#2a1c0f',
  wallMid:  '#180f08',
  wallLo:   '#090603',
  mortar:   '#160e08',
  floor:    '#150e07',
  wood:     '#7d5229',
  woodLit:  '#a26a35',
  woodDk:   '#452a14',
  iron:     '#4b4038',
  ironLit:  '#6b5c50',
  brass:    '#c9973f',
  brassLit: '#e8bd6a',
  brassDk:  '#8d6624',
  glow:     'rgba(255, 196, 96, .30)',
  flame:    '#ffcf6b',
  flameHot: '#fff3c8',
  wax:      '#f2e4c6',
  waxDk:    '#cdb994',
  parch:    '#efdfb8',
  parchDk:  '#d8c496',
  ink:      '#3a2a18',
  inkSoft:  '#8a755a',
  gem:      ['#c8455a', '#4f9a6a', '#4a7fbe', '#e0a03a', '#9a5bb5'],
  good:     '#7fa356',
  bad:      '#c2503f',
  gold:     '#f0c552',
  dust:     'rgba(255, 226, 170, .5)',
};

/* ───────── قفل‌ها ─────────
   digits[k] = رقم‌های مجازِ چرخِ k اُم، از چپ (پرارزش‌تر) به راست.     */

const LEVELS = [
  { name: 'قفلِ کوچک', digits: [[2, 5], [3, 4]], extra: 4,
    hint: 'این قفل دو چرخ دارد. همهٔ عددهایی که می‌شود ساخت را پیدا کن.' },
  { name: 'قفلِ کتاب', digits: [[2, 5], [3, 4], [6, 7]], extra: 4,
    hint: 'سه چرخ. هر کدام دو رقم دارد. قفل‌های بالای صندوق را بشمار.' },
  { name: 'قفلِ نُه', digits: [[4, 8], [9], [0, 5, 7]], extra: 4,
    hint: 'چرخِ وسط فقط یک رقم دارد و نمی‌چرخد.' },
  { name: 'قفلِ بزرگ', digits: [[1, 3, 6], [0, 2], [4, 9]], extra: 4,
    hint: 'دوازده قفل. بی‌نظم بروی، شمع کم می‌آوری.' },
  { name: 'قفلِ استاد', digits: [[2, 4, 7], [1, 5, 8], [0, 3]], extra: 4,
    hint: 'آخرین صندوق. اهرمِ کنارِ دفتر را یادت نرود.' },
];

const PLACES = ['هزارگان', 'صدگان', 'دهگان', 'یکان'];
const placeName = (n, k) => PLACES[4 - n + k];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',        // intro | play | won | lost
  level: 0,
  sel: [0, 0, 0],
  spin: [0, 0, 0],       // انیمیشنِ چرخیدن
  found: [],             // عددهایی که پیدا شده، به ترتیبِ پیدا شدن
  tries: 0,
  triesMax: 0,
  wasted: 0,
  streak: 0,
  sorted: false,
  hearts: 0,
  score: 0, best: 0,
  t: 0, phaseT: 0,
  hover: null,
  shake: 0,
  puff: 0,
  fly: null,             // جواهری که به سمتِ دفتر می‌رود
  lidT: 0,
  motes: [],
  floats: [],
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const dials = () => L().digits;
const nDials = () => L().digits.length;
const totalCombos = () => L().digits.reduce((a, d) => a * d.length, 1);
const current = () => dials().map((d, k) => d[S.sel[k]]).join('');

function loadBest() { try { return +localStorage.getItem('ganj-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('ganj-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── چیدمان ───────── */

const HUD_H = 52;
const RACK = { x: 34, y: 296, w: 276 };                // شمعدان
const CH = { x: 322, y: 250, w: 452, h: 316 };          // صندوقچه
const LOCKROW_Y = 206;
const LEDGER = { x: 812, y: 76, w: 356, h: 552 };
const BTN_TRY = { x: CH.x + CH.w / 2 - 124, y: 600, w: 248, h: 64 };
const BTN_SORT = { x: LEDGER.x + LEDGER.w - 170, y: LEDGER.y + 50, w: 148, h: 42 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

function dialBox(k) {
  const n = nDials(), w = 118, gap = 20;
  const total = n * w + (n - 1) * gap;
  const x0 = CH.x + CH.w / 2 - total / 2;
  return { x: x0 + k * (w + gap), y: CH.y + 62, w, h: 152 };
}

function lockPos(i) {
  const n = totalCombos(), perRow = Math.min(n, 9);
  const rows = Math.ceil(n / perRow);
  const r = Math.floor(i / perRow), c = i % perRow;
  const inRow = Math.min(perRow, n - r * perRow);
  const gap = 30;
  const x0 = CH.x + CH.w / 2 - ((inRow - 1) * gap) / 2;
  return { x: x0 + c * gap, y: LOCKROW_Y - (rows - 1 - r) * 30 };
}

function tileBox(i) {
  const w = 100, h = 58, gx = 12, gy = 10, cols = 3;
  const x0 = LEDGER.x + (LEDGER.w - (cols * w + (cols - 1) * gx)) / 2;
  return { x: x0 + (i % cols) * (w + gx), y: LEDGER.y + 112 + Math.floor(i / cols) * (h + gy), w, h };
}

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 34; i++) {
  S.motes.push({ x: Math.random() * SCENE_W, y: Math.random() * SCENE_H,
                 ph: Math.random() * TAU, sp: .15 + Math.random() * .4, r: .8 + Math.random() * 1.8 });
}
whenFontsReady(() => runLoop(step));

function startLevel(i) {
  S.level = i;
  S.sel = [0, 0, 0];
  S.spin = [0, 0, 0];
  S.found = [];
  S.tries = totalCombos() + LEVELS[i].extra;
  S.triesMax = S.tries;
  S.wasted = 0;
  S.streak = 0;
  S.sorted = false;
  S.fly = null;
  S.lidT = 0;
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0; S.tut.step = 0; S.tut.t = 0;
  toast.say(LEVELS[i].hint, 'info');
}

function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 24 }); }

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.puff > 0) S.puff -= dt;
  for (let k = 0; k < 3; k++) if (S.spin[k] !== 0) {
    S.spin[k] -= Math.sign(S.spin[k]) * dt * 5.2;
    if (Math.abs(S.spin[k]) < .04) S.spin[k] = 0;
  }
  if (S.fly) { S.fly.t += dt * 1.7; if (S.fly.t >= 1) S.fly = null; }
  if (S.phase === 'won') S.lidT = Math.min(1, S.lidT + dt * .9);
  for (const m of S.motes) {
    m.ph += dt * m.sp;
    m.y -= dt * (5 + m.sp * 14);
    m.x += Math.sin(m.ph) * dt * 9;
    if (m.y < -10) { m.y = SCENE_H + 10; m.x = Math.random() * SCENE_W; }
  }
  for (const f of S.floats) { f.t += dt; f.y -= 42 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.5);
  if (S.phase === 'play' && S.tut.on) tutStep(dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── چرخاندن و امتحان ───────── */

function spinDial(k, dir) {
  if (S.phase !== 'play') return;
  const d = dials()[k];
  if (!d || d.length < 2) { S.shake = .16; sfx.tone(150, .1, 'sine', .05); return; }
  S.sel[k] = (S.sel[k] + dir + d.length) % d.length;
  S.spin[k] = dir;
  sfx.tick();
}

function tryCombo() {
  if (S.phase !== 'play') return;
  const v = current();
  const box = dialBox(nDials() - 1);
  S.tries--;

  if (S.found.includes(v)) {
    S.wasted++;
    S.streak = 0;
    S.puff = .6;
    S.shake = .34;
    sfx.nope();
    toast.say('این را قبلاً باز کرده بودی', 'bad');
    bits.add(CH.x + CH.w / 2, CH.y + CH.h - 40, 18, 'dot',
      ['#6b5a44', '#8a755a', '#4a3d2c'], { speed: 130, lift: 70, size: 5, life: 1.1, grav: 90 });
  } else {
    S.found.push(v);
    S.streak++;
    S.score += 100;
    const i = S.found.length - 1;
    S.fly = { t: 0, from: { x: box.x + box.w / 2, y: box.y + box.h / 2 }, to: tileBox(i), val: v,
              col: P.gem[i % P.gem.length] };
    sfx.good();
    bits.confetti(CH.x + CH.w / 2, CH.y + 120, 14, [P.gold, P.brassLit, '#fff']);
    if (S.streak > 0 && S.streak % 3 === 0) {
      S.tries++;
      S.triesMax = Math.max(S.triesMax, S.tries);
      toast.say('سه تای تازه پشتِ هم — یک شمعِ اضافه', 'good');
      floatText(RACK.x + RACK.w / 2, RACK.y + 40, '+۱ شمع', P.flame, 22);
    }
  }

  if (S.found.length >= totalCombos()) {
    const bonus = 300 + S.tries * 60;
    S.score += bonus;
    if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
    S.phase = 'won'; S.phaseT = 0; S.lidT = 0;
    sfx.win();
    bits.confetti(CH.x + CH.w / 2, CH.y + 60, 70, [P.gold, ...P.gem, '#fff']);
  } else if (S.tries <= 0) {
    S.phase = 'lost'; S.phaseT = 0;
    sfx.nope();
  }
}

function toggleSort() { S.sorted = !S.sorted; sfx.slide(); }

/** فهرستِ دفتر: یا به ترتیبِ پیدا شدن، یا مرتّب‌شده. */
function ledgerList() {
  return S.sorted ? S.found.slice().sort((a, b) => +a - +b) : S.found;
}

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;      // پرده‌های خواندنی

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 30) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 1 && S.found.length + S.wasted > 0) { S.tut.step = 2; S.tut.t = 0; }
  if (S.tut.step === 2 && S.tut.t > 30) S.tut.on = false;
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (inRect(p, BTN_TRY)) return BTN_TRY;
  if (S.level >= 1 && inRect(p, BTN_SORT)) return BTN_SORT;
  for (let k = 0; k < nDials(); k++) {
    const b = dialBox(k);
    /* نیمهٔ بالا یک رقم عقب، نیمهٔ پایین یک رقم جلو — ساده‌ترین کاری که
       انگشتِ بچه می‌تواند بکند. */
    if (inRect(p, { x: b.x - 8, y: b.y - 26, w: b.w + 16, h: b.h / 2 + 26 })) return { dial: k, dir: -1 };
    if (inRect(p, { x: b.x - 8, y: b.y + b.h / 2, w: b.w + 16, h: b.h / 2 + 26 })) return { dial: k, dir: 1 };
  }
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
    if (S.level + 1 < LEVELS.length) startLevel(S.level + 1);
    else { S.score = 0; startLevel(0); }
    return;
  }
  if (S.phase === 'lost') { if (h) startLevel(S.level); return; }
  if (!h) return;
  if (h === BTN_TRY) return tryCombo();
  if (h === BTN_SORT) return toggleSort();
  if (h.dial !== undefined) return spinDial(h.dial, h.dir);
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
  if (o.stroke) {
    ctx.lineWidth = o.strokeWidth || 6; ctx.lineJoin = 'round';
    ctx.strokeStyle = o.stroke; ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(10, 6, 3, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function pointHand(x, y) {
  const bob = Math.sin(S.t * 3.4) * 8;
  ctx.save();
  ctx.translate(x, y + bob);
  withShadow(12, 5, .45, () => {
    ctx.fillStyle = '#f6dfc0';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(-9, -2, -10, 16);
    ctx.quadraticCurveTo(-11, 34, 0, 36);
    ctx.quadraticCurveTo(11, 34, 10, 16);
    ctx.quadraticCurveTo(9, -2, 0, -6);
    ctx.closePath(); ctx.fill();
    wobbleCircle(0, -12, 8, 4, 1); ctx.fill();
  });
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

/** شعلهٔ شمع — می‌لرزد، پس صحنه زنده است. */
function flame(x, y, s, seed) {
  const w = Math.sin(S.t * 7 + seed) * 1.4;
  const hh = 1 + Math.sin(S.t * 11 + seed * 2) * .12;
  const g = ctx.createRadialGradient(x, y - 6 * s, 1, x, y - 6 * s, 44 * s);
  g.addColorStop(0, 'rgba(255, 206, 120, .45)');
  g.addColorStop(1, 'rgba(255, 206, 120, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 44 * s, y - 50 * s, 88 * s, 88 * s);
  ctx.fillStyle = P.flame;
  ctx.beginPath();
  ctx.moveTo(x + w, y - 20 * s * hh);
  ctx.quadraticCurveTo(x + 6 * s, y - 6 * s, x, y);
  ctx.quadraticCurveTo(x - 6 * s, y - 6 * s, x + w, y - 20 * s * hh);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.flameHot;
  ctx.beginPath();
  ctx.moveTo(x + w * .5, y - 12 * s * hh);
  ctx.quadraticCurveTo(x + 3 * s, y - 4 * s, x, y - 1 * s);
  ctx.quadraticCurveTo(x - 3 * s, y - 4 * s, x + w * .5, y - 12 * s * hh);
  ctx.closePath(); ctx.fill();
}

function gem(x, y, r, col, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot || 0);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * .82, -r * .2);
  ctx.lineTo(r * .5, r * .85);
  ctx.lineTo(-r * .5, r * .85);
  ctx.lineTo(-r * .82, -r * .2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.34)';
  ctx.beginPath();
  ctx.moveTo(0, -r); ctx.lineTo(r * .82, -r * .2); ctx.lineTo(0, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(r * .5, r * .85); ctx.lineTo(-r * .5, r * .85);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#17110c');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 15;
    ctx.translate(Math.sin(S.t * 62) * k, Math.cos(S.t * 49) * k * .6);
  }

  drawCellar();
  drawRack();
  drawLedger();
  drawLockRow();
  drawChest();
  if (S.phase === 'play' || S.phase === 'lost') { drawDials(); drawTryButton(); }
  drawFly();
  drawMotes();
  bits.draw();
  drawFloats();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    ctx.save();
    ctx.translate(CH.x + CH.w / 2 - SCENE_W / 2, 0); // پیام بالای صندوق، نه روی دفتر
    toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.parch, ink: P.ink });
    ctx.restore();
  }

  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.14, 'rgba(6, 2, 0, .66)');
}

function drawCellar() {
  const g = ctx.createLinearGradient(150, 220, 980, 780);
  g.addColorStop(0, P.wallHi);
  g.addColorStop(.5, P.wallMid);
  g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* سنگ‌های دیوار */
  ctx.save();
  ctx.strokeStyle = P.mortar; ctx.lineWidth = 4;
  for (let r = 0; r < 11; r++) {
    const y = 40 + r * 66;
    ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke();
    for (let c = 0; c < 9; c++) {
      const x = (r % 2 ? 74 : 0) + c * 148;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 66); ctx.stroke();
    }
    /* نورِ لبهٔ بالاییِ سنگ‌ها — از بالا-چپ می‌تابد */
    ctx.globalAlpha = .07;
    ctx.strokeStyle = '#ffe0ac';
    ctx.beginPath(); ctx.moveTo(0, y + 3); ctx.lineTo(SCENE_W, y + 3); ctx.stroke();
    ctx.strokeStyle = P.mortar;
  }
  ctx.restore();

  /* طاقِ آجریِ پشتِ صندوق */
  ctx.save();
  ctx.globalAlpha = .55;
  ctx.fillStyle = P.wallLo;
  ctx.beginPath();
  ctx.moveTo(CH.x - 66, SCENE_H);
  ctx.lineTo(CH.x - 66, 250);
  ctx.quadraticCurveTo(CH.x + CH.w / 2, 66, CH.x + CH.w + 66, 250);
  ctx.lineTo(CH.x + CH.w + 66, SCENE_H);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  /* تارِ عنکبوت گوشهٔ بالا-راست */
  ctx.save();
  ctx.strokeStyle = 'rgba(238, 226, 200, .12)'; ctx.lineWidth = 1.4;
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(SCENE_W, HUD_H, i * 34, Math.PI * .5, Math.PI);
    ctx.stroke();
  }
  for (let i = 0; i <= 5; i++) {
    const a = Math.PI * .5 + (Math.PI * .5) * (i / 5);
    ctx.beginPath();
    ctx.moveTo(SCENE_W, HUD_H);
    ctx.lineTo(SCENE_W + Math.cos(a) * 174, HUD_H + Math.sin(a) * 174);
    ctx.stroke();
  }
  ctx.restore();

  /* هالهٔ نورِ گرم از بالا-چپ */
  const gl = ctx.createRadialGradient(180, 330, 24, 180, 330, 540);
  gl.addColorStop(0, 'rgba(255, 186, 92, .34)');
  gl.addColorStop(.38, 'rgba(255, 186, 92, .10)');
  gl.addColorStop(1, 'rgba(255, 186, 92, 0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  const g2 = ctx.createRadialGradient(CH.x + CH.w / 2, CH.y + 150, 40, CH.x + CH.w / 2, CH.y + 150, 430);
  g2.addColorStop(0, 'rgba(255, 198, 110, .17)');
  g2.addColorStop(1, 'rgba(255, 198, 110, 0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* کف */
  ctx.fillStyle = P.floor;
  ctx.fillRect(0, 668, SCENE_W, SCENE_H - 668);
  ctx.strokeStyle = '#1a1209'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 668); ctx.lineTo(SCENE_W, 668); ctx.stroke();
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 150 - 40, 668); ctx.lineTo(i * 150 - 110, SCENE_H); ctx.stroke();
  }

  /* خمره‌های گوشه — سالن نباید خالی باشد */
  for (const u of [{ x: 78, y: 690, r: 46 }, { x: 168, y: 706, r: 34 }]) {
    withShadow(16, 8, .4, () => {
      ctx.fillStyle = P.woodDk;
      wobbleEllipse(u.x, u.y, u.r, u.r * .95, 0, u.x, 1.6); ctx.fill();
    }, '10, 5, 0');
    ctx.fillStyle = P.wood;
    wobbleEllipse(u.x - 5, u.y - 6, u.r * .82, u.r * .78, 0, u.x + 2, 1.4); ctx.fill();
    ctx.fillStyle = P.woodDk;
    wobbleEllipse(u.x, u.y - u.r * .78, u.r * .5, u.r * .18, 0, u.x + 4, 1); ctx.fill();
  }
}

/* ───────── شمعدان = تعدادِ امتحان‌های باقی‌مانده ───────── */

function drawRack() {
  const n = S.triesMax || 1;
  const rows = n > 11 ? 2 : 1;
  const perRow = Math.ceil(n / rows);
  const gap = Math.min(25, (RACK.w - 26) / Math.max(1, perRow - 1));

  /* میلهٔ چوبیِ شمعدان */
  for (let r = 0; r < rows; r++) {
    const inRow = Math.min(perRow, n - r * perRow);
    const wRow = (inRow - 1) * gap + 26;
    const x0 = RACK.x + RACK.w / 2 - wRow / 2;
    const y = RACK.y + r * 96;
    ctx.fillStyle = P.brassDk;
    wobbleRect(x0 - 6, y + 44, wRow + 12, 11, 4, r * 3 + 1, 1); ctx.fill();
    ctx.fillStyle = P.brass;
    wobbleRect(x0 - 6, y + 42, wRow + 12, 6, 3, r * 3 + 2, .8); ctx.fill();
  }

  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / perRow), c = i % perRow;
    const inRow = Math.min(perRow, n - r * perRow);
    const wRow = (inRow - 1) * gap + 26;
    const x = RACK.x + RACK.w / 2 - wRow / 2 + 13 + c * gap;
    const y = RACK.y + r * 96 + 44;
    const alive = i < S.tries;
    const h = alive ? 34 : 9;
    ctx.fillStyle = alive ? P.wax : P.waxDk;
    wobbleRect(x - 5, y - h, 10, h, 2, i * 2 + 5, .7); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    wobbleRect(x + 1, y - h, 4, h, 2, i * 2 + 6, .6); ctx.fill();
    if (alive) flame(x, y - h - 2, .9, i * 1.7);
    else {
      ctx.save();
      ctx.globalAlpha = .22;
      ctx.strokeStyle = '#cbbba3'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - h - 2);
      ctx.quadraticCurveTo(x + Math.sin(S.t * 1.4 + i) * 8, y - h - 20, x + 4, y - h - 36);
      ctx.stroke();
      ctx.restore();
    }
  }
  text(`شمع‌های باقی‌مانده: ${fa(S.tries)}`, RACK.x + RACK.w / 2, RACK.y - 22,
    { size: 17, color: '#e8d5ae' });
}

/* ───────── ردیفِ قفل‌ها = تعدادِ همهٔ حالت‌ها ───────── */

function drawLockRow() {
  const n = totalCombos();
  for (let i = 0; i < n; i++) {
    const p = lockPos(i);
    const open = i < S.found.length;
    const pop = open && S.found.length - 1 === i && S.fly ? 1 + (1 - S.fly.t) * .4 : 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(pop, pop);
    ctx.fillStyle = open ? P.brassLit : P.iron;
    wobbleRect(-9, -4, 18, 15, 3, i * 3 + 1, .7); ctx.fill();
    ctx.strokeStyle = open ? P.brassLit : P.ironLit;
    ctx.lineWidth = 3.2; ctx.lineCap = 'round';
    ctx.beginPath();
    if (open) { ctx.arc(3, -6, 6, Math.PI * .9, Math.PI * 2.1); }
    else { ctx.arc(0, -5, 6, Math.PI, TAU); }
    ctx.stroke();
    if (open) { ctx.fillStyle = P.brassDk; ctx.beginPath(); ctx.arc(0, 4, 2.2, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
}

/* ───────── صندوقچه ───────── */

function drawChest() {
  const lid = easeOut(S.lidT);
  /* درونِ صندوق وقتی در باز می‌شود */
  if (lid > .02) {
    ctx.fillStyle = '#120c06';
    wobbleRect(CH.x + 14, CH.y - 6, CH.w - 28, 90, 8, 3, 1.4); ctx.fill();
    for (let i = 0; i < 16; i++) {
      const a = noise1(i * 3.3);
      gem(CH.x + 40 + a * (CH.w - 80), CH.y + 34 + noise1(i * 7.1) * 44,
        9 + noise1(i * 5) * 7, P.gem[i % P.gem.length], noise1(i) * TAU);
    }
    const gl = ctx.createRadialGradient(CH.x + CH.w / 2, CH.y + 40, 8, CH.x + CH.w / 2, CH.y + 40, 260);
    gl.addColorStop(0, `rgba(255, 214, 120, ${.34 * lid})`);
    gl.addColorStop(1, 'rgba(255, 214, 120, 0)');
    ctx.fillStyle = gl;
    ctx.fillRect(CH.x - 150, CH.y - 150, CH.w + 300, 400);
  }

  /* درِ صندوق */
  ctx.save();
  ctx.translate(CH.x + CH.w / 2, CH.y + 8);
  ctx.rotate(-lid * 1.05);
  ctx.translate(-(CH.x + CH.w / 2), -(CH.y + 8));
  withShadow(22, 10, .5, () => {
    ctx.fillStyle = P.wood;
    ctx.beginPath();
    ctx.moveTo(CH.x + 6, CH.y + 12);
    ctx.quadraticCurveTo(CH.x + CH.w / 2, CH.y - 54, CH.x + CH.w - 6, CH.y + 12);
    ctx.lineTo(CH.x + CH.w - 6, CH.y + 20);
    ctx.lineTo(CH.x + 6, CH.y + 20);
    ctx.closePath(); ctx.fill();
  }, '10, 5, 0');
  ctx.fillStyle = P.woodLit;
  ctx.beginPath();
  ctx.moveTo(CH.x + 6, CH.y + 12);
  ctx.quadraticCurveTo(CH.x + CH.w / 2, CH.y - 54, CH.x + CH.w - 6, CH.y + 12);
  ctx.quadraticCurveTo(CH.x + CH.w / 2, CH.y - 44, CH.x + 6, CH.y + 12);
  ctx.closePath(); ctx.fill();
  for (const dx of [70, CH.w / 2, CH.w - 70]) {
    ctx.fillStyle = P.iron;
    ctx.beginPath();
    ctx.moveTo(CH.x + dx - 8, CH.y + 20);
    ctx.quadraticCurveTo(CH.x + dx, CH.y - 44, CH.x + dx + 8, CH.y + 20);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  /* بدنه */
  withShadow(26, 12, .5, () => {
    ctx.fillStyle = P.wood;
    wobbleRect(CH.x, CH.y + 18, CH.w, CH.h - 18, 12, 7, 2); ctx.fill();
  }, '10, 5, 0');
  ctx.fillStyle = P.woodLit;
  wobbleRect(CH.x, CH.y + 18, 9, CH.h - 18, 5, 71, 1); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  wobbleRect(CH.x + CH.w - 16, CH.y + 18, 16, CH.h - 18, 5, 73, 1); ctx.fill();

  /* تخته‌های چوب */
  ctx.save();
  ctx.globalAlpha = .3;
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 3;
  for (let i = 1; i < 5; i++) {
    const y = CH.y + 18 + i * (CH.h - 18) / 5;
    ctx.beginPath(); ctx.moveTo(CH.x + 6, y); ctx.lineTo(CH.x + CH.w - 6, y); ctx.stroke();
  }
  ctx.restore();
  /* بندهای آهنی */
  for (const dx of [46, CH.w - 46]) {
    ctx.fillStyle = P.iron;
    wobbleRect(CH.x + dx - 13, CH.y + 18, 26, CH.h - 18, 3, dx, 1); ctx.fill();
    ctx.fillStyle = P.ironLit;
    wobbleRect(CH.x + dx - 13, CH.y + 18, 8, CH.h - 18, 3, dx + 1, 1); ctx.fill();
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = P.ironLit;
      ctx.beginPath(); ctx.arc(CH.x + dx, CH.y + 40 + i * 58, 3.4, 0, TAU); ctx.fill();
    }
  }
  /* صفحهٔ برنجیِ قفل که چرخ‌ها رویش‌اند */
  const fx = CH.x + 76, fw = CH.w - 152;
  withShadow(14, 6, .4, () => {
    ctx.fillStyle = P.brassDk;
    wobbleRect(fx - 8, CH.y + 44, fw + 16, 196, 10, 21, 1.4); ctx.fill();
  }, '10, 5, 0');
  ctx.fillStyle = P.brass;
  wobbleRect(fx - 4, CH.y + 48, fw + 8, 188, 8, 23, 1.2); ctx.fill();
  ctx.fillStyle = P.brassLit;
  wobbleRect(fx - 4, CH.y + 48, fw + 8, 7, 3, 25, .8); ctx.fill();
  for (const cx of [fx - 4, fx + fw + 4]) for (const cy of [CH.y + 56, CH.y + 228]) {
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); ctx.arc(cx + (cx < CH.x + CH.w / 2 ? 8 : -8), cy, 4, 0, TAU); ctx.fill();
  }

  /* گردِ بی‌فایده وقتی تکراری زده‌ای */
  if (S.puff > 0) {
    ctx.save();
    ctx.globalAlpha = S.puff * .8;
    ctx.fillStyle = 'rgba(120, 100, 74, .6)';
    for (let i = 0; i < 7; i++) {
      const k = 1 - S.puff;
      wobbleCircle(CH.x + CH.w / 2 + (i - 3) * 26, CH.y + CH.h - 30 - k * 60,
        14 + k * 22, i * 3, 1.4);
      ctx.fill();
    }
    ctx.restore();
  }
}

/* ───────── چرخ‌های رقم ───────── */

function drawDials() {
  const n = nDials();
  for (let k = 0; k < n; k++) {
    const b = dialBox(k), d = dials()[k];
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const hotUp = S.hover && S.hover.dial === k && S.hover.dir === -1;
    const hotDn = S.hover && S.hover.dial === k && S.hover.dir === 1;
    const locked = d.length < 2;

    /* بدنهٔ چرخ */
    ctx.fillStyle = '#1a130c';
    wobbleRect(b.x, b.y, b.w, b.h, 10, b.x, 1.2); ctx.fill();
    ctx.save();
    ctx.beginPath(); rrPath(b.x + 4, b.y + 4, b.w - 8, b.h - 8, 8); ctx.clip();
    const gg = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
    gg.addColorStop(0, '#0e0a06');
    gg.addColorStop(.5, locked ? '#4a3f33' : '#5d4c36');
    gg.addColorStop(1, '#0e0a06');
    ctx.fillStyle = gg;
    ctx.fillRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8);

    /* رقم‌ها: قبلی بالا، فعلی وسط، بعدی پایین */
    const off = S.spin[k] * 56;
    for (const s of [-1, 0, 1]) {
      const idx = (S.sel[k] + s + d.length * 4) % d.length;
      const y = cy + s * 56 + off;
      ctx.globalAlpha = s === 0 ? 1 : .3;
      numText(fa(d[idx]), cx, y, { size: s === 0 ? 58 : 40, color: '#f6e5c2' });
    }
    ctx.globalAlpha = 1;
    /* خط‌های شیشه */
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    for (let i = 0; i < 9; i++) ctx.fillRect(b.x + 4, b.y + 8 + i * 17, b.w - 8, 2);
    ctx.restore();

    /* قابِ برنجی و دندانه‌های کناری */
    ctx.strokeStyle = locked ? P.brassDk : P.brass;
    ctx.lineWidth = 5;
    ctx.beginPath(); rrPath(b.x + 3, b.y + 3, b.w - 6, b.h - 6, 9); ctx.stroke();
    ctx.fillStyle = locked ? P.brassDk : P.brassLit;
    for (let i = 0; i < 7; i++) {
      const y = b.y + 16 + i * 20;
      wobbleRect(b.x - 7, y, 8, 11, 2, i + b.x, .6); ctx.fill();
      wobbleRect(b.x + b.w - 1, y, 8, 11, 2, i + b.x + 1, .6); ctx.fill();
    }

    /* پیکان‌های بالا و پایین */
    if (!locked) {
      for (const [dir, hot] of [[-1, hotUp], [1, hotDn]]) {
        const y = dir < 0 ? b.y - 19 : b.y + b.h + 19;
        ctx.fillStyle = hot ? P.brassLit : P.brassDk;
        ctx.beginPath();
        ctx.moveTo(cx, y + dir * 12);
        ctx.lineTo(cx - 17, y - dir * 8);
        ctx.lineTo(cx + 17, y - dir * 8);
        ctx.closePath(); ctx.fill();
      }
    } else {
      text('ثابت', cx, b.y + b.h + 16, { size: 13, color: 'rgba(240, 220, 180, .5)' });
    }

    text(placeName(n, k), cx, b.y + b.h + 42, { size: 15, color: '#e8d5ae' });
  }
}

function drawTryButton() {
  button(BTN_TRY, 'امتحان کن', {
    hot: S.hover === BTN_TRY, fill: '#8d6624', hotFill: '#a87c2f', size: 28,
  });
}

/* ───────── دفترِ گنج ───────── */

function drawLedger() {
  const b = LEDGER;
  ctx.save();
  ctx.rotate(-.006);
  withShadow(22, 10, .45, () => {
    ctx.fillStyle = P.parch;
    wobbleRect(b.x, b.y, b.w, b.h, 8, 61, 3); ctx.fill();
  }, '10, 5, 0');
  /* لکه‌های کهنگی */
  ctx.globalAlpha = .12;
  ctx.fillStyle = '#9a7c4a';
  for (let i = 0; i < 7; i++) {
    wobbleCircle(b.x + 30 + noise1(i * 4.1) * (b.w - 60), b.y + 30 + noise1(i * 8.3) * (b.h - 60),
      18 + noise1(i * 2) * 34, i * 3, 2.4);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  /* میخِ بالا */
  ctx.fillStyle = P.iron;
  ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + 12, 7, 0, TAU); ctx.fill();
  ctx.fillStyle = P.ironLit;
  ctx.beginPath(); ctx.arc(b.x + b.w / 2 - 2, b.y + 10, 3, 0, TAU); ctx.fill();

  text('دفترِ گنج', b.x + 84, b.y + 40, { size: 24, family: 'Lalezar', color: P.ink });
  text(`${fa(S.found.length)} از ${fa(totalCombos())}`, b.x + 84, b.y + 68,
    { size: 16, color: P.inkSoft });

  /* اهرمِ مرتّب‌سازی */
  if (S.level >= 1) {
    button(BTN_SORT, S.sorted ? 'مرتّب ✓' : 'مرتّب کن', {
      hot: S.hover === BTN_SORT, fill: S.sorted ? '#7f6a33' : '#8d6624',
      hotFill: '#a87c2f', size: 18, r: 10, family: 'Vazirmatn',
    });
  }

  /* خانه‌های خالی و پُر */
  const list = ledgerList();
  for (let i = 0; i < totalCombos(); i++) {
    const t = tileBox(i);
    ctx.save();
    if (i < list.length) {
      ctx.fillStyle = '#e2cf9f';
      wobbleRect(t.x, t.y, t.w, t.h, 7, i * 3 + 1, 1); ctx.fill();
      ctx.strokeStyle = P.parchDk; ctx.lineWidth = 2;
      ctx.beginPath(); rrPath(t.x, t.y, t.w, t.h, 7); ctx.stroke();
      gem(t.x + 17, t.y + t.h / 2, 9, P.gem[i % P.gem.length], .2);
      numText(fa(list[i]), t.x + t.w / 2 + 10, t.y + t.h / 2, { size: 27, color: P.ink });
    } else {
      ctx.globalAlpha = .35;
      ctx.strokeStyle = P.parchDk; ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath(); rrPath(t.x, t.y, t.w, t.h, 7); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawFly() {
  if (!S.fly) return;
  const k = easeOut(S.fly.t);
  const x = lerp(S.fly.from.x, S.fly.to.x + S.fly.to.w / 2, k);
  const y = lerp(S.fly.from.y, S.fly.to.y + S.fly.to.h / 2, k) - Math.sin(k * Math.PI) * 90;
  gem(x, y, lerp(20, 9, k), S.fly.col, S.fly.t * 6);
}

function drawMotes() {
  ctx.save();
  for (const m of S.motes) {
    ctx.globalAlpha = .06 + .12 * (.5 + .5 * Math.sin(m.ph * 2));
    ctx.fillStyle = P.dust;
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.5, 0, 1);
    text(f.txt, f.x, f.y, { size: f.size, color: f.col, alpha: k, family: 'Lalezar',
      stroke: 'rgba(20, 10, 0, .55)', strokeWidth: 5 });
  }
}

/* ───────── نوارِ بالا ───────── */

function drawHUD() {
  ctx.fillStyle = 'rgba(20, 13, 7, .78)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(201, 151, 63, .5)';
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);

  text(L().name, SCENE_W - 26, HUD_H / 2, { size: 20, family: 'Lalezar', color: '#f0dcb4', align: 'right' });
  text(`صندوقِ ${fa(S.level + 1)} از ${fa(LEVELS.length)}`, SCENE_W - 168, HUD_H / 2,
    { size: 15, color: 'rgba(240, 220, 180, .6)', align: 'right' });

  numText(fa(S.score), 26, HUD_H / 2 - 1, { size: 26, color: P.gold, align: 'left' });
  text(`رکورد ${fa(S.best)}`, 108, HUD_H / 2, { size: 14, color: 'rgba(240, 220, 180, .55)', align: 'left' });
  if (S.wasted > 0) {
    text(`دوباره‌کاری: ${fa(S.wasted)}`, 214, HUD_H / 2,
      { size: 15, color: '#dd8a72', align: 'left' });
  }
  if (S.streak >= 2) {
    text(`${fa(S.streak)} تای پشتِ هم`, SCENE_W / 2, HUD_H / 2, { size: 16, color: P.good });
  }
}

/* ───────── آموزش ───────── */

function drawTutorial() {
  const st = S.tut.step;
  let holes = [], msg = '', hand = null;
  const b0 = dialBox(0), bn = dialBox(nDials() - 1);

  if (st === 0) {
    const n = totalCombos(), perRow = Math.min(n, 9);
    holes = [{ x: CH.x + CH.w / 2 - perRow * 15 - 10, y: LOCKROW_Y - Math.ceil(n / perRow) * 30 - 4,
               w: perRow * 30 + 20, h: Math.ceil(n / perRow) * 30 + 34 }];
    msg = 'این صندوق به تعدادِ همهٔ عددهایی که می‌شود ساخت قفل دارد. باید همه را باز کنی.';
  } else if (st === 1) {
    holes = [{ x: b0.x - 24, y: b0.y - 34, w: bn.x + bn.w - b0.x + 48, h: b0.h + 68 },
             { x: BTN_TRY.x - 8, y: BTN_TRY.y - 8, w: BTN_TRY.w + 16, h: BTN_TRY.h + 16 }];
    msg = 'روی بالا یا پایینِ هر چرخ بزن تا رقمش عوض شود، بعد امتحان کن.';
    hand = { x: bn.x + bn.w / 2, y: bn.y + bn.h + 44 };
  } else {
    holes = [{ x: RACK.x - 10, y: RACK.y - 40, w: RACK.w + 20, h: 120 },
             { x: LEDGER.x - 6, y: LEDGER.y - 6, w: LEDGER.w + 12, h: 210 }];
    msg = 'هر امتحان یک شمع می‌سوزاند، حتی اگر تکراری باشد. دفتر یادت می‌آورد چه باز کرده‌ای.';
  }

  spot(holes, .58);
  const w = 500, h = 92, x = CH.x + CH.w / 2 - w / 2, y = HUD_H + 14;
  paper(x, y, w, h, P.parch, 41, 12, .45);
  ctx.fillStyle = P.brass;
  wobbleRect(x, y, 9, h, 4, 43, .8); ctx.fill();
  textWrap(msg, x + w / 2 + 6, y + h / 2 - 12, w - 54, { size: 18, color: P.ink, lineHeight: 27 });
  if (TUT_TAP.indexOf(st) >= 0) tutMore(x + w / 2, y + h + 14, S.t, P.ink);
  if (hand) pointHand(hand.x, hand.y);
}

/* ───────── پرده‌ها ───────── */

function chestIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.wood;
  wobbleRect(-34, -8, 68, 34, 6, 3, 1.2); ctx.fill();
  ctx.fillStyle = P.woodLit;
  ctx.beginPath();
  ctx.moveTo(-34, -8); ctx.quadraticCurveTo(0, -40, 34, -8);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.brass;
  wobbleRect(-8, -2, 16, 18, 3, 5, .8); ctx.fill();
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); ctx.arc(0, 6, 3.4, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT,
    w: 740, h: 350, y: 168,
    title: 'صندوقچهٔ گنج',
    body: 'هر چرخ فقط چند رقمِ مشخّص دارد. همهٔ عددهایی را که می‌شود ساخت پیدا کن\nتا همهٔ قفل‌ها باز شوند. امّا شمع‌ها شمرده‌اند.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'برویم پایین',
    paper: P.parch, band: P.brass, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#8d6624', btnHotFill: '#a87c2f',
    icon: chestIcon,
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  const stars = S.wasted === 0 ? 3 : (S.wasted <= 2 ? 2 : 1);
  overlay({
    t: S.phaseT,
    w: 720, h: 320, y: 190,
    title: last ? 'همهٔ صندوق‌ها باز شد!' : 'صندوق باز شد!',
    body: S.wasted === 0
      ? `بدون حتّی یک دوباره‌کاری. امتیازت ${fa(S.score)} شد.`
      : `${fa(S.wasted)} بار تکراری زدی. امتیازت ${fa(S.score)} شد.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: last ? 'از اوّل' : 'صندوقِ بعدی',
    paper: P.parch, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#8d6624', btnHotFill: '#a87c2f',
    icon: (x, y) => {
      for (let i = 0; i < 3; i++) {
        star(x + (i - 1) * 46, y + 6, i < stars ? 22 : 15,
          i < stars ? P.gold : 'rgba(120, 100, 70, .4)', Math.sin(S.t * 2 + i) * .15);
      }
    },
  });
}

function drawLost() {
  overlay({
    t: S.phaseT,
    w: 720, h: 320, y: 200,
    title: 'شمع‌ها تمام شد',
    body: `${fa(S.found.length)} قفل از ${fa(totalCombos())} باز شد. این بار با نظم برو تا تکراری نزنی.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'دوباره',
    paper: P.parch, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#c2503f', btnHotFill: '#d05f4d',
    icon: (x, y) => {
      ctx.fillStyle = P.waxDk;
      wobbleRect(x - 6, y - 4, 12, 22, 3, 9, .8); ctx.fill();
      ctx.save();
      ctx.globalAlpha = .35;
      ctx.strokeStyle = '#cbbba3'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.quadraticCurveTo(x + Math.sin(S.t * 1.6) * 12, y - 26, x + 6, y - 44);
      ctx.stroke();
      ctx.restore();
    },
  });
}

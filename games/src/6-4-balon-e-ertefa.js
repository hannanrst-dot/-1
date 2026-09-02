/*!
title: بالنِ ارتفاع — جمع و تفریق
bg: #1a2740
*/

/* ═══════════════════════════════════════════════════════════════════════
   بالنِ ارتفاع — ریاضی سوم، فصل ۶، درس ۴ (جمع و تفریق)
   ───────────────────────────────────────────────────────────────────────
   روشِ کتاب برای جمع و تفریقِ ذهنی همین است: اوّل هزارتاها را اضافه کن،
   بعد صدتاها، بعد ده‌تاها، بعد یکی‌ها. برای تفریق هم به همین ترتیب کم کن.

   پس بالن را ساختیم. چهار طنابِ مشعل داری: ۱۰۰۰، ۱۰۰، ۱۰ و ۱.
     • طناب را پایین بکِش → مشعل روشن می‌شود و بالن همان‌قدر بالا می‌رود.
     • طناب را بالا بکِش → دریچه باز می‌شود و همان‌قدر پایین می‌آید.

   باید دقیقاً به حلقهٔ طلاییِ ارتفاعِ خواسته‌شده برسی. سوختِ مشعل
   شمرده است، پس نمی‌شود با ۱ یکی‌یکی بالا رفت: باید از هزارتا شروع
   کنی و بیایی پایین — همان کاری که کتاب می‌خواهد یاد بدهد.

   ارتفاع‌ها طوری ساخته می‌شوند که هیچ‌جا نیازی به «قرض گرفتن» یا
   «یکی به بالا بردن» نباشد؛ آن‌ها درسِ بعدی‌اند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  sky0: '#0f1c33', sky1: '#25436b', sky2: '#4a7fa8', sky3: '#8fc0cf', sky4: '#d8ecec',
  cloud:'#eef6fa', cloudDk: '#c3d8e4',
  balloon1: '#e05c48', balloon2: '#f2c14e', balloon3: '#4f9c8a', balloon4: '#e8e2d0',
  rope: '#c9a25f', ropeDk: '#8a6634',
  wood: '#8a6134', woodDk: '#573a1c', woodLt: '#b98b52',
  brass:'#d3a94f', brassDk: '#9a7a2c', brassLt: '#f3dc9a',
  fire: '#ffb03a', fireHot: '#fff2c0',
  paper:'#f7eeda', ink: '#243040', inkSoft: '#7d8ba0',
  good: '#5f9c6b', bad: '#cd5b45', gold: '#eab53f',
};

const CORDS = [
  { v: 1000, n: 'هزارتا', c: '#d0553f' },
  { v: 100,  n: 'صدتا',  c: '#e0a03c' },
  { v: 10,   n: 'ده‌تا',  c: '#4f9c8a' },
  { v: 1,    n: 'یکی',   c: '#6d8fc4' },
];

const LEVELS = [
  { name: 'پروازِ اوّل', up: true, dmax: 2, slack: 3, time: 62, quota: 3,
    hint: 'طنابِ هزارتا را پایین بکِش تا مشعل روشن شود.' },
  { name: 'بادِ موافق', up: true, dmax: 3, slack: 2, time: 60, quota: 4,
    hint: 'از بزرگ شروع کن: اوّل هزارتا، بعد صدتا، بعد ده‌تا، بعد یکی.' },
  { name: 'فرود',      up: false, dmax: 3, slack: 2, time: 58, quota: 4,
    hint: 'حالا باید پایین بیایی: طناب را بالا بکِش تا دریچه باز شود.' },
  { name: 'کوه و درّه', up: null, dmax: 3, slack: 2, time: 54, quota: 5,
    hint: 'گاهی بالا، گاهی پایین. سوخت را حرام نکن.' },
  { name: 'تا غروب',   up: null, dmax: 3, slack: 1, time: 52, endless: true,
    hint: 'تا سوخت هست، پرواز کن.' },
];

const HUD_H = 52;
const SKY = { x: 0, y: HUD_H, w: 1010, h: 540 };
const RULER = { x: 916, y: 96, w: 84, h: 470 };
const PANEL = { x: 1022, y: 96, w: 162, h: 470 };
const RACK = { x: 28, y: 592, w: 860, h: 156 };
const GAUGE = { x: 916, y: 592, w: 268, h: 156 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };
const TOPALT = 9999;

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  alt: 0, shownAlt: 0, target: 0, start: 0,
  fuel: 0, need: 0,
  drag: null,          // { i, y0, dir }
  burn: 0, vent: 0,
  ringT: 0,
  solved: 0,
  timeLeft: 0,
  tanks: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  clouds: [], birds: [], puffs: [],
  t: 0, phaseT: 0, hover: null, shake: 0, nope: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function loadBest() { try { return +localStorage.getItem('balon-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('balon-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 9; i++) S.clouds.push({ x: Math.random() * 1000, y: 110 + Math.random() * 430,
  s: .6 + Math.random() * .9, sp: 5 + Math.random() * 12, seed: Math.random() * 99 });
for (let i = 0; i < 5; i++) S.birds.push({ x: Math.random() * 900, y: 150 + Math.random() * 300,
  sp: 16 + Math.random() * 22, ph: Math.random() * TAU });
whenFontsReady(() => runLoop(step));

/* ───────── دورِ تازه ───────── */

const dig = (v) => [Math.floor(v / 1000) % 10, Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10];
const num = (d) => d[0] * 1000 + d[1] * 100 + d[2] * 10 + d[3];

/** ارتفاعِ آغاز و هدف، بی هیچ «قرض گرفتن» یا «یکی به بالا». */
function newRound() {
  const lv = L();
  const up = lv.up === null ? Math.random() < .5 : lv.up;
  for (let tries = 0; tries < 60; tries++) {
    const a = [R(1, 8), R(0, 9), R(0, 9), R(0, 9)];
    const step2 = [R(0, lv.dmax), R(0, lv.dmax), R(0, lv.dmax), R(0, lv.dmax)];
    if (step2.reduce((x, y) => x + y, 0) < 2) continue;
    const b = a.slice();
    let ok = true;
    for (let i = 0; i < 4; i++) {
      b[i] = up ? a[i] + step2[i] : a[i] - step2[i];
      if (b[i] < 0 || b[i] > 9) { ok = false; break; }
    }
    if (!ok || b[0] < 1) continue;
    S.start = num(a);
    S.target = num(b);
    S.need = step2.reduce((x, y) => x + y, 0);
    S.alt = S.start;
    S.shownAlt = S.start;
    S.fuel = S.need + lv.slack;
    S.solved = 0;
    S.ringT = 0;
    return;
  }
  S.start = 3000; S.target = 4210; S.need = 3; S.alt = 3000; S.shownAlt = 3000;
  S.fuel = 6; S.solved = 0; S.ringT = 0;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.tanks = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newRound();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

const altY = (a) => 552 - clamp(a / TOPALT, 0, 1) * 430;

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.nope > 0) S.nope -= dt;
  if (S.burn > 0) S.burn -= dt;
  if (S.vent > 0) S.vent -= dt;
  S.shownAlt += (S.alt - S.shownAlt) * Math.min(1, dt * 5);
  if (Math.abs(S.alt - S.shownAlt) < .6) S.shownAlt = S.alt;
  S.ringT += dt;
  for (const c of S.clouds) { c.x += c.sp * dt; if (c.x > 1090) { c.x = -90; c.y = 110 + Math.random() * 430; } }
  for (const b of S.birds) { b.x += b.sp * dt; if (b.x > 960) { b.x = -40; b.y = 150 + Math.random() * 300; } }
  for (const q of S.puffs) { q.t += dt; q.y -= q.sp * dt; q.r += 26 * dt; }
  S.puffs = S.puffs.filter((q) => q.t < 1.2);

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.solved) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseTank('باد بالن را برد!'); }
    }
    if (S.solved) { S.solved += dt; if (S.solved > 1.7) newRound(); }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseTank(msg) {
  if (S.solved) return;
  S.tanks--;
  S.combo = 0;
  S.shake = .45;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.tanks <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newRound();
}

function puff(x, y, n, col, sp) {
  for (let i = 0; i < n; i++) {
    S.puffs.push({ x: x + (Math.random() - .5) * 30, y, t: 0, r: 8 + Math.random() * 10,
      col, sp: sp + Math.random() * 26 });
  }
}

function fire(i, dir) {
  if (S.solved || S.phase !== 'play') return;
  if (S.fuel <= 0) {
    S.nope = .8; S.shake = .12; sfx.nope();
    toast.say('سوخت تمام شد!', 'bad');
    loseTank('بالن بی‌سوخت ماند.');
    return;
  }
  const v = CORDS[i].v * dir;
  const na = S.alt + v;
  if (na < 0 || na > TOPALT) {
    S.nope = .7; S.shake = .12; sfx.nope();
    toast.say(dir > 0 ? 'بالاتر از این نمی‌شود.' : 'پایین‌تر از این نمی‌شود.', 'bad');
    return;
  }
  S.alt = na;
  S.fuel--;
  const bx = 420;
  if (dir > 0) { S.burn = .45; puff(bx, altY(S.alt) + 128, 4, '#ffd79a', 40); sfx.tone(160 + i * 40, .2, 'sawtooth', .04); }
  else { S.vent = .45; puff(bx, altY(S.alt) - 128, 4, '#dfeaf2', 30); sfx.tone(420 - i * 40, .16, 'sine', .04); }
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
  if (S.alt === S.target) { win(); return; }
  if (S.fuel <= 0) {
    S.nope = .9;
    toast.say('سوخت تمام شد و به حلقه نرسیدی.', 'bad');
    loseTank('سوخت تمام شد.');
  }
}

function win() {
  S.solved = .001;
  S.combo++;
  S.cleared++;
  const pts = 280 + S.fuel * 130 + Math.round(S.timeLeft * 5) + Math.min(S.combo, 6) * 70;
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(420, altY(S.alt), 44, [P.gold, P.brassLt, '#fff', P.balloon2]);
  sfx.win();
  toast.say(S.fuel >= L().slack ? 'با کمترین سوخت! درست از هزارتا شروع کردی.' : 'رسیدی!',
    S.fuel >= L().slack ? 'good' : 'info');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

function cordBox(i) {
  const w = (RACK.w - 40) / 4;
  return { x: RACK.x + 20 + i * w, y: RACK.y + 14, w: w - 12, h: RACK.h - 28 };
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.drag) { S.drag.y = p.y; return; }
  S.hover = null;
  for (let i = 0; i < 4; i++) if (inRect(p, cordBox(i))) S.hover = i;
  cv.style.cursor = S.hover !== null ? 'grab' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { startLevel(0); return; }
  if (S.phase === 'won') {
    if (!inRect(p, BTN_GO)) return;
    if (L().endless) startLevel(S.level, true);
    else if (S.level + 1 < LEVELS.length) startLevel(S.level + 1, true);
    else startLevel(0);
    return;
  }
  if (S.phase === 'lost') { if (inRect(p, BTN_GO)) startLevel(S.level); return; }
  if (tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  for (let i = 0; i < 4; i++) if (inRect(p, cordBox(i))) {
    S.drag = { i, y0: p.y, y: p.y };
    sfx.tap();
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    return;
  }
});

cv.addEventListener('pointerup', (e) => {
  const d = S.drag;
  S.drag = null;
  if (!d || S.phase !== 'play') return;
  const dy = d.y - d.y0;
  if (Math.abs(dy) < 18) {
    /* ضربهٔ ساده = مشعل، یعنی بالا رفتن */
    fire(d.i, 1);
    return;
  }
  fire(d.i, dy > 0 ? 1 : -1);
});

cv.addEventListener('pointercancel', () => { S.drag = null; });

const TUT_TAP = [0, 2], TUT_LAST = 2;

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
  if (o.stroke) { ctx.lineWidth = o.strokeWidth || 5; ctx.lineJoin = 'round';
    ctx.strokeStyle = o.stroke; ctx.strokeText(str, x, y); }
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(10, 18, 32, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(247, 238, 218, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '6, 12, 24');
  ctx.fillStyle = P.brassDk;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#5f6d80' }); yy += 30; }
  return h + 20;
}

function paintSkyStatic() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, 580);
  g.addColorStop(0, P.sky0);
  g.addColorStop(.28, P.sky1);
  g.addColorStop(.62, P.sky2);
  g.addColorStop(.86, P.sky3);
  g.addColorStop(1, P.sky4);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, 580);
  /* کوه‌های دور */
  ctx.fillStyle = 'rgba(70, 96, 124, .55)';
  ctx.beginPath();
  ctx.moveTo(0, 580); ctx.lineTo(0, 520);
  for (let x = 0; x <= 1010; x += 16) ctx.lineTo(x, 520 - Math.abs(Math.sin(x * .006 + 1)) * 54);
  ctx.lineTo(1010, 580); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(48, 70, 96, .7)';
  ctx.beginPath();
  ctx.moveTo(0, 580); ctx.lineTo(0, 552);
  for (let x = 0; x <= 1010; x += 16) ctx.lineTo(x, 552 - Math.abs(Math.sin(x * .011 + 3)) * 34);
  ctx.lineTo(1010, 580); ctx.closePath(); ctx.fill();
  /* زمینِ پایین */
  ctx.fillStyle = '#2c4a3c';
  ctx.fillRect(0, 566, 1010, 40);
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.sky0);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('sky', SCENE_W, SCENE_H, paintSkyStatic), 0, 0, SCENE_W, SCENE_H);
  drawClouds();
  drawBirds();
  drawRing();
  drawBalloon();
  drawPuffs();
  drawRuler();
  drawAlti();
  drawRack();
  drawGauge();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    ctx.save();
    ctx.translate(SKY.w / 2 - SCENE_W / 2, 0);
    toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
    ctx.restore();
  }
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.1, 'rgba(6, 12, 24, .46)', .4, .16);
}

function drawClouds() {
  for (const c of S.clouds) {
    ctx.save();
    ctx.globalAlpha = .5;
    ctx.translate(c.x, c.y);
    ctx.scale(c.s, c.s);
    ctx.fillStyle = P.cloudDk;
    for (const [dx, dy, r] of [[-40, 6, 26], [0, -6, 34], [38, 8, 24], [14, 12, 26]]) {
      wobbleCircle(dx, dy + 4, r, c.seed + dx, 2); ctx.fill();
    }
    ctx.fillStyle = P.cloud;
    for (const [dx, dy, r] of [[-40, 2, 26], [0, -10, 34], [38, 4, 24], [14, 8, 26]]) {
      wobbleCircle(dx, dy, r, c.seed + dx + 1, 2); ctx.fill();
    }
    ctx.restore();
  }
}

function drawBirds() {
  ctx.strokeStyle = 'rgba(30, 44, 66, .4)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (const b of S.birds) {
    const f = Math.sin(S.t * 4 + b.ph) * 5;
    ctx.beginPath();
    ctx.moveTo(b.x - 9, b.y + f); ctx.quadraticCurveTo(b.x, b.y - 5, b.x + 9, b.y + f);
    ctx.stroke();
  }
}

/** حلقهٔ طلاییِ ارتفاعِ خواسته‌شده. */
function drawRing() {
  const y = altY(S.target);
  const pulse = .8 + .2 * Math.sin(S.ringT * 3);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, y - 30, 0, y + 30);
  g.addColorStop(0, 'rgba(234, 181, 63, 0)');
  g.addColorStop(.5, 'rgba(234, 181, 63, .3)');
  g.addColorStop(1, 'rgba(234, 181, 63, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, y - 30, SKY.w, 60);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 5;
  ctx.setLineDash([16, 12]);
  ctx.globalAlpha = pulse;
  ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(SKY.w - 20, y); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = P.brassLt; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.ellipse(420, y, 118, 26, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(420, y, 118, 26, 0, 0, TAU); ctx.stroke();
  ctx.restore();
  /* تابلوی هدف */
  const bx = 700, w = 210, h = 56;
  ctx.fillStyle = 'rgba(20, 30, 48, .78)';
  ctx.beginPath(); rrPath(bx, y - h / 2, w, h, 12); ctx.fill();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(bx, y - h / 2, w, h, 12); ctx.stroke();
  text('برسان به', bx + w - 30, y, { size: 16, color: 'rgba(247, 238, 218, .8)', align: 'right' });
  numText(fa(S.target), bx + 66, y + 1, { size: 30, color: P.gold });
}

function drawBalloon() {
  const x = 420, y = altY(S.shownAlt);
  const sway = Math.sin(S.t * 1.1) * 5;
  ctx.save();
  ctx.translate(x + sway, y);
  /* شعلهٔ مشعل */
  if (S.burn > 0) {
    const k = clamp(S.burn / .45, 0, 1);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, -18, 2, 0, -18, 70 * k);
    g.addColorStop(0, 'rgba(255, 200, 110, .8)');
    g.addColorStop(1, 'rgba(255, 160, 60, 0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, -18, 70 * k, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = P.fire;
    ctx.beginPath();
    ctx.moveTo(0, -66 * k); ctx.quadraticCurveTo(16, -22, 0, -6);
    ctx.quadraticCurveTo(-16, -22, 0, -66 * k);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.fireHot;
    ctx.beginPath(); ctx.ellipse(0, -22, 6, 16 * k, 0, 0, TAU); ctx.fill();
  }
  /* بدنهٔ بالن */
  const bw = 108, bh = 132;
  ctx.save();
  ctx.translate(0, -bh - 26);
  const cols = [P.balloon1, P.balloon4, P.balloon2, P.balloon4, P.balloon3, P.balloon4];
  for (let i = 0; i < 6; i++) {
    const a0 = -Math.PI / 2 + (i / 6) * TAU, a1 = -Math.PI / 2 + ((i + 1) / 6) * TAU;
    ctx.fillStyle = cols[i];
    ctx.beginPath();
    ctx.moveTo(0, bh * .62);
    for (let t2 = 0; t2 <= 1; t2 += .1) {
      const a = a0 + (a1 - a0) * t2;
      ctx.lineTo(Math.cos(a) * bw, Math.sin(a) * bh * .78);
    }
    ctx.closePath(); ctx.fill();
  }
  /* حجم */
  const sg = ctx.createRadialGradient(-bw * .35, -bh * .3, 8, 0, 0, bw * 1.3);
  sg.addColorStop(0, 'rgba(255,255,255,.34)');
  sg.addColorStop(.55, 'rgba(255,255,255,0)');
  sg.addColorStop(1, 'rgba(0,0,0,.34)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.ellipse(0, 0, bw, bh * .78, 0, 0, TAU); ctx.fill();
  ctx.restore();
  /* طناب‌ها و سبد */
  ctx.strokeStyle = P.ropeDk; ctx.lineWidth = 3;
  for (const dx of [-34, -12, 12, 34]) {
    ctx.beginPath(); ctx.moveTo(dx * 1.5, -bh + 24); ctx.lineTo(dx, 12); ctx.stroke();
  }
  ctx.fillStyle = P.woodDk;
  wobbleRect(-44, 10, 88, 54, 8, 3, 1.4); ctx.fill();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  wobbleRect(-40, 13, 80, 48, 7, 5, 1.2); ctx.fill();
  ctx.strokeStyle = P.ropeDk; ctx.lineWidth = 3;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-40, 13 + i * 12); ctx.lineTo(40, 13 + i * 12); ctx.stroke();
  }
  /* دریچهٔ بخار */
  if (S.vent > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.vent / .45, 0, 1) * .6;
    ctx.fillStyle = '#eaf2f8';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(-20 + i * 20, -bh * 1.9 - i * 12, 14 + i * 5, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawPuffs() {
  for (const q of S.puffs) {
    ctx.save();
    ctx.globalAlpha = clamp(1 - q.t / 1.2, 0, 1) * .45;
    ctx.fillStyle = q.col;
    ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

/** خط‌کشِ ارتفاع کنارِ آسمان. */
function drawRuler() {
  const b = RULER;
  ctx.fillStyle = 'rgba(16, 26, 44, .7)';
  ctx.beginPath(); rrPath(b.x, b.y - 22, b.w, b.h + 44, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(211, 169, 79, .3)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(b.x, b.y - 22, b.w, b.h + 44, 14); ctx.stroke();
  for (let a = 0; a <= 9000; a += 1000) {
    const y = altY(a);
    const big = a % 2000 === 0;
    ctx.strokeStyle = big ? P.brassLt : 'rgba(211, 169, 79, .4)';
    ctx.lineWidth = big ? 2.4 : 1.4;
    ctx.beginPath(); ctx.moveTo(b.x + 10, y); ctx.lineTo(b.x + (big ? 30 : 22), y); ctx.stroke();
    if (big) numText(fa(a), b.x + b.w - 24, y, { size: 15, color: 'rgba(247, 238, 218, .7)' });
  }
  /* نشانهٔ بالن و هدف */
  const yb = altY(S.shownAlt), yt = altY(S.target);
  ctx.fillStyle = P.gold;
  ctx.beginPath(); ctx.moveTo(b.x + 4, yt); ctx.lineTo(b.x + 16, yt - 7); ctx.lineTo(b.x + 16, yt + 7); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e05c48';
  ctx.beginPath(); ctx.moveTo(b.x + b.w - 4, yb); ctx.lineTo(b.x + b.w - 16, yb - 7); ctx.lineTo(b.x + b.w - 16, yb + 7); ctx.closePath(); ctx.fill();
}

/** ارتفاع‌سنجِ برنجی. */
function drawAlti() {
  const b = PANEL;
  ctx.fillStyle = shade(P.brassDk, -.5);
  ctx.beginPath(); rrPath(b.x - 5, b.y - 5, b.w + 10, b.h + 10, 18); ctx.fill();
  const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
  g.addColorStop(0, P.brassLt); g.addColorStop(.4, P.brass); g.addColorStop(1, P.brassDk);
  ctx.fillStyle = g;
  ctx.beginPath(); rrPath(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 17); ctx.fill();
  ctx.fillStyle = '#101a26';
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 14); ctx.fill();

  text('ارتفاعِ الان', b.x + b.w / 2, b.y + 30, { size: 16, color: 'rgba(247, 238, 218, .6)' });
  /* چهار پنجرهٔ رقم */
  const d = dig(Math.round(S.shownAlt));
  const names = ['هزارتا', 'صدتا', 'ده‌تا', 'یکی'];
  const td = dig(S.target);
  for (let i = 0; i < 4; i++) {
    const y = b.y + 62 + i * 88;
    const same = d[i] === td[i];
    ctx.fillStyle = same ? 'rgba(95, 156, 107, .22)' : 'rgba(255,255,255,.05)';
    ctx.beginPath(); rrPath(b.x + 14, y, b.w - 28, 74, 10); ctx.fill();
    ctx.strokeStyle = same ? 'rgba(120, 200, 140, .6)' : 'rgba(211, 169, 79, .3)';
    ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(b.x + 14, y, b.w - 28, 74, 10); ctx.stroke();
    text(names[i], b.x + b.w / 2, y + 16, { size: 13, color: 'rgba(247, 238, 218, .5)' });
    numText(fa(d[i]), b.x + b.w / 2 - 26, y + 48, { size: 34, color: same ? '#9be8ad' : P.brassLt });
    numText(fa(td[i]), b.x + b.w / 2 + 30, y + 48, { size: 22, color: 'rgba(234, 181, 63, .7)' });
    ctx.strokeStyle = 'rgba(247, 238, 218, .25)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(b.x + b.w / 2 + 2, y + 34); ctx.lineTo(b.x + b.w / 2 + 2, y + 62); ctx.stroke();
  }
}

/** چهار طنابِ مشعل. */
function drawRack() {
  const b = RACK;
  ctx.fillStyle = 'rgba(20, 32, 52, .8)';
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 18); ctx.fill();
  ctx.strokeStyle = 'rgba(211, 169, 79, .28)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 18); ctx.stroke();
  /* تیرکِ چوبی که طناب‌ها از آن آویزان‌اند */
  ctx.fillStyle = P.woodDk;
  ctx.fillRect(b.x + 14, b.y + 12, b.w - 28, 14);
  ctx.fillStyle = P.woodLt;
  ctx.fillRect(b.x + 14, b.y + 12, b.w - 28, 4);

  for (let i = 0; i < 4; i++) {
    const c = cordBox(i), cd = CORDS[i];
    const cx = c.x + c.w / 2;
    const dragging = S.drag && S.drag.i === i;
    const dy = dragging ? clamp(S.drag.y - S.drag.y0, -46, 46) : 0;
    const hot = S.hover === i;
    /* طناب */
    ctx.strokeStyle = P.ropeDk; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, b.y + 20); ctx.lineTo(cx, c.y + 56 + dy); ctx.stroke();
    ctx.strokeStyle = P.rope; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 1, b.y + 20); ctx.lineTo(cx - 1, c.y + 56 + dy); ctx.stroke();
    /* دستهٔ چوبی */
    const hy = c.y + 78 + dy;
    contact(cx, hy + 34, 34, 8, .3);
    ctx.fillStyle = shade(cd.c, -.4);
    wobbleRect(cx - 44, hy - 22, 88, 46, 12, i, 1.4); ctx.fill();
    ctx.fillStyle = hot || dragging ? shade(cd.c, .16) : cd.c;
    wobbleRect(cx - 42, hy - 24, 84, 44, 11, i + 3, 1.2); ctx.fill();
    ctx.save();
    ctx.beginPath(); wobbleRect(cx - 42, hy - 24, 84, 44, 11, i + 3, 1.2); ctx.clip();
    const g = ctx.createLinearGradient(0, hy - 24, 0, hy + 20);
    g.addColorStop(0, 'rgba(255,255,255,.3)');
    g.addColorStop(.5, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(0,0,0,.28)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 42, hy - 24, 84, 44);
    ctx.restore();
    numText(fa(cd.v), cx, hy - 2, { size: 26, color: '#fff', stroke: 'rgba(0,0,0,.3)', strokeWidth: 4 });
    text(cd.n, cx, c.y + c.h - 32, { size: 16, family: 'Lalezar', color: 'rgba(247, 238, 218, .75)' });
    /* راهنمای جهت */
    if (dragging) {
      const up = dy < -18, down = dy > 18;
      ctx.save();
      ctx.globalAlpha = .9;
      ctx.fillStyle = up ? '#9fd8ff' : (down ? P.fire : 'rgba(255,255,255,.4)');
      const ay = up ? hy - 56 : hy + 52;
      ctx.beginPath();
      if (up) { ctx.moveTo(cx, ay - 14); ctx.lineTo(cx - 13, ay + 6); ctx.lineTo(cx + 13, ay + 6); }
      else { ctx.moveTo(cx, ay + 14); ctx.lineTo(cx - 13, ay - 6); ctx.lineTo(cx + 13, ay - 6); }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  text('پایین بکِش = مشعل (بالا رفتن)   •   بالا بکِش = دریچه (پایین آمدن)',
    b.x + b.w / 2, b.y + b.h - 12, { size: 14, color: 'rgba(247, 238, 218, .5)' });
}

/** مخزنِ سوخت و ساعتِ باد. */
function drawGauge() {
  const b = GAUGE;
  ctx.fillStyle = 'rgba(20, 32, 52, .8)';
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 18); ctx.fill();
  ctx.strokeStyle = 'rgba(211, 169, 79, .28)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 18); ctx.stroke();
  text('سوختِ مشعل', b.x + b.w / 2, b.y + 26, { size: 17, family: 'Lalezar', color: 'rgba(247, 238, 218, .8)' });
  const n = Math.min(S.fuel, 12);
  for (let i = 0; i < 12; i++) {
    const x = b.x + 22 + (i % 6) * 38, y = b.y + 56 + Math.floor(i / 6) * 34;
    const on = i < n;
    if (on) {
      const gg = ctx.createRadialGradient(x, y, 1, x, y, 18);
      gg.addColorStop(0, 'rgba(255, 176, 58, .5)');
      gg.addColorStop(1, 'rgba(255, 176, 58, 0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = on ? P.fire : 'rgba(150, 170, 190, .2)';
    ctx.beginPath(); rrPath(x - 8, y - 13, 16, 26, 7); ctx.fill();
    if (on) { ctx.fillStyle = P.fireHot; ctx.beginPath(); ctx.arc(x, y - 6, 3.4, 0, TAU); ctx.fill(); }
  }
  const k = clamp(S.timeLeft / L().time, 0, 1);
  const gy0 = b.y + b.h - 30;
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.beginPath(); rrPath(b.x + 20, gy0, b.w - 40, 16, 8); ctx.fill();
  ctx.fillStyle = k > .3 ? '#6fa8c4' : P.bad;
  ctx.beginPath(); rrPath(b.x + 20, gy0, (b.w - 40) * k, 16, 8); ctx.fill();
  text(k > .3 ? 'باد' : 'باد تند شد!', b.x + b.w / 2, gy0 - 14,
    { size: 13, color: k > .3 ? 'rgba(247,238,218,.55)' : '#ffb0a0' });
}

function drawHUD() {
  ctx.fillStyle = 'rgba(16, 26, 44, .9)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(211, 169, 79, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 206 - i * 32;
    ctx.save();
    ctx.globalAlpha = i < S.tanks ? 1 : .22;
    ctx.fillStyle = i < S.tanks ? '#d8a24a' : '#7d8696';
    ctx.beginPath(); rrPath(x - 9, HUD_H / 2 - 12, 18, 24, 7); ctx.fill();
    ctx.fillStyle = 'rgba(16,26,44,.6)';
    ctx.fillRect(x - 5, HUD_H / 2 - 6, 10, 3);
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(247, 238, 218, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: 300, y: 120, w: 620, h: 420 }], .72);
    const h = tutCard(240, 220, 560,
      ['باید بالن را دقیقاً به حلقهٔ طلایی برسانی.', 'ارتفاعِ الان و ارتفاعِ خواسته‌شده کنارِ هم است.'], 'بالنِ ارتفاع');
    tutMore(520, 220 + h + 12, S.t, P.ink);
  } else if (st === 1) {
    spot([RACK], .7);
    tutCard(240, 300, 560, ['طنابِ هزارتا را پایین بکِش تا مشعل روشن شود.',
      'بالا بکِشی، دریچه باز می‌شود و پایین می‌آیی.']);
  } else {
    spot([PANEL, RACK], .68);
    const h = tutCard(200, 260, 600,
      ['از بزرگ شروع کن: اوّل هزارتا، بعد صدتا،', 'بعد ده‌تا، بعد یکی — هر رقم که جور شد سبز می‌شود.',
       'سوخت شمرده است، پس یکی‌یکی بالا نرو.'], 'ترتیبِ کار');
    tutMore(500, 260 + h + 12, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function balloonIcon(x, y) {
  ctx.save();
  ctx.translate(x, y - 4);
  const cols = [P.balloon1, P.balloon4, P.balloon2, P.balloon4, P.balloon3, P.balloon4];
  for (let i = 0; i < 6; i++) {
    const a0 = -Math.PI / 2 + (i / 6) * TAU, a1 = -Math.PI / 2 + ((i + 1) / 6) * TAU;
    ctx.fillStyle = cols[i];
    ctx.beginPath(); ctx.moveTo(0, 22);
    for (let t2 = 0; t2 <= 1; t2 += .12) {
      const a = a0 + (a1 - a0) * t2;
      ctx.lineTo(Math.cos(a) * 26, Math.sin(a) * 30);
    }
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(-10, 30, 20, 14, 4); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 760, h: 290, y: 136,
    paper: P.paper, band: '#4f9c8a', ink: P.ink, inkSoft: '#7d8ba0',
    icon: balloonIcon,
    title: 'بالنِ ارتفاع',
    body: 'باید بالن را دقیقاً به حلقهٔ طلایی برسانی.\nچهار طنابِ مشعل داری: ۱۰۰۰، ۱۰۰، ۱۰ و ۱ — پایین بکِش تا بالا بروی،\nبالا بکِش تا پایین بیایی. سوخت شمرده است، پس از بزرگ شروع کن.',
    btn: BTN_GO, btnLabel: 'پرواز کن', btnHot: S.hover === BTN_GO,
    btnFill: '#4f9c8a', btnHotFill: '#5db09c',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#7d8ba0',
    icon: balloonIcon,
    title: L().endless ? 'پرواز تمام شد' : 'به همهٔ حلقه‌ها رسیدی!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ پروازها را رفتی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'پروازِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#4f9c8a', btnHotFill: '#5db09c',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#7d8ba0',
    icon: (x, y) => { ctx.fillStyle = '#9aa8b8';
      ctx.beginPath(); ctx.ellipse(x, y, 26, 14, .3, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7d8696';
      ctx.beginPath(); rrPath(x - 9, y + 8, 18, 12, 4); ctx.fill(); },
    title: 'بالن نشست',
    body: 'امتیاز: ' + fa(S.score) + '\nاوّل هزارتاها، بعد صدتاها، بعد ده‌تاها، بعد یکی‌ها.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#4f9c8a', btnHotFill: '#5db09c',
  });
}

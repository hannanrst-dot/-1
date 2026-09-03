/*!
title: دفترِ مزرعه — زنگ علوم (بازی)
bg: #1d3320
*/

/* ═══════════════════════════════════════════════════════════════════════
   دفترِ مزرعه — علوم سوم، درس ۱ «زنگ علوم» (بازی)
   ───────────────────────────────────────────────────────────────────────
   کارِ مریم و سارا در کتاب همین است: با ذرّه‌بین جانورانِ کوچکِ مزرعه را
   مشاهده می‌کنند، شمارهٔ پا و بال و شاخکشان را در دفتر می‌نویسند، و بعد
   از روی همان جدول می‌گویند کدام جانور کدام است.

   اینجا مزرعه واقعاً پهن است و می‌توانی هرجا را بگردی. جانورها لای علف
   پنهان‌اند و از دور فقط یک نقطه‌اند؛ زیرِ ذرّه‌بین است که پا و بال و
   شاخکشان پیدا می‌شود — درست به همان تعدادی که در طبیعت دارند:

     مورچه   ۶ پا، بی‌بال،  ۲ شاخک
     مگس     ۶ پا، ۲ بال،   ۲ شاخک
     پروانه  ۶ پا، ۴ بال،   ۲ شاخک
     عنکبوت  ۸ پا، بی‌بال،  بی‌شاخک   (عنکبوت حشره نیست)
     کرمِ خاکی  بی‌پا، بی‌بال، بی‌شاخک

   شمردن را خودت انجام می‌دهی؛ دفتر فقط چیزی را می‌نویسد که تو شمرده‌ای.
   آخرِ کار، کارتِ معمّا نشانه‌ها را می‌گوید و باید از روی دفترِ خودت
   بگویی کدام جانور است. هیچ اسمی از پیش کنارِ جانور نوشته نشده.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  sky:   '#3f6b46', grass: '#2c5230', grassDk: '#173019', grassLt: '#4e7f4a',
  soil:  '#4a3520', soilDk: '#2a1c0e',
  wood:  '#8a5f33', woodDk: '#4d3218', woodLt: '#b88752',
  brass: '#cfa74e', brassDk: '#8f7327', brassLt: '#f2dd99',
  glass: '#bfe6ee',
  paper: '#f6f0dc', card: '#fffcf0', ink: '#26301f', inkSoft: '#7b8a74',
  good:  '#5da26f', bad: '#cd5b45', gold: '#eab53f',
};

/* جانوران — شمارها همان است که در طبیعت هست */
const BUG = [
  { id: 'ant',    n: 'مورچه',     legs: 6, wings: 0, ant: 2, c: '#7a3b1c', d: '#4a2210' },
  { id: 'fly',    n: 'مگس',       legs: 6, wings: 2, ant: 2, c: '#3c4750', d: '#1e262c' },
  { id: 'butter', n: 'پروانه',    legs: 6, wings: 4, ant: 2, c: '#e0813c', d: '#a4520f' },
  { id: 'spider', n: 'عنکبوت',    legs: 8, wings: 0, ant: 0, c: '#4a3a2c', d: '#241a12' },
  { id: 'worm',   n: 'کرمِ خاکی', legs: 0, wings: 0, ant: 0, c: '#c98a86', d: '#8e5450' },
];

const LEVELS = [
  { name: 'گوشهٔ مزرعه', bugs: 3, riddles: 1, time: 130, quota: 2,
    hint: 'ذرّه‌بین را روی علف‌ها بگردان؛ نقطه‌ها جانورند.' },
  { name: 'کنارِ جوی',   bugs: 4, riddles: 1, time: 140, quota: 2,
    hint: 'زیرِ ذرّه‌بین بزن تا دفترِ ثبت باز شود.' },
  { name: 'زیرِ درخت',   bugs: 5, riddles: 2, time: 165, quota: 2,
    hint: 'عنکبوت حشره نیست؛ پاهایش را خوب بشمار.' },
  { name: 'تمامِ مزرعه', bugs: 5, riddles: 2, time: 160, quota: 3,
    hint: 'کارتِ معمّا را با جدولِ خودت جور کن.' },
  { name: 'تا آفتاب هست', bugs: 5, riddles: 2, time: 155, endless: true,
    hint: 'تا آفتاب هست، مزرعه هست.' },
];

const FIELD = { x: 0, y: HUD_H, w: 828, h: SCENE_H - HUD_H };
const NOTE = { x: 848, y: 70, w: 332, h: 672 };
const LENS_R = 104, LENS_K = 2.7;
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', stage: 'look',
  level: 0,
  bugs: [],             /* { k, x, y, a, seen, rec } */
  lens: { x: 400, y: 400 }, lensOn: false,
  card: -1, draft: [0, 0, 0], wrong: 0,
  riddle: null, rIdx: 0, rTotal: 0, flash: 0, flashRow: -1,
  timeLeft: 0, lamps: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  done: 0, doneT: 0, seed: 1,
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function loadBest() { try { return +localStorage.getItem('mazrae-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('mazrae-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();

/* ───────── دورِ تازه ───────── */

function newRound() {
  const lv = L();
  const kinds = [0, 1, 2, 3, 4];
  for (let i = kinds.length - 1; i > 0; i--) { const j = R(0, i); const t = kinds[i]; kinds[i] = kinds[j]; kinds[j] = t; }
  const use = kinds.slice(0, lv.bugs);
  S.bugs = [];
  for (const k of use) {
    let x, y, ok = false, guard = 0;
    while (!ok && guard++ < 200) {
      x = R(90, FIELD.w - 90);
      y = R(FIELD.y + 90, SCENE_H - 90);
      ok = S.bugs.every((b) => Math.hypot(b.x - x, b.y - y) > 190);
    }
    S.bugs.push({ k, x, y, a: Math.random() * TAU, seen: false, rec: null,
                  wob: Math.random() * 6, sp: .12 + Math.random() * .2 });
  }
  S.stage = 'look';
  S.card = -1; S.draft = [0, 0, 0]; S.wrong = 0;
  S.riddle = null; S.rIdx = 0; S.rTotal = lv.riddles;
  S.flash = 0; S.flashRow = -1;
  S.done = 0; S.doneT = 0;
  S.seed = R(1, 9999);
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.lamps = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newRound();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

newRound();
whenFontsReady(() => runLoop(step));

const recorded = () => S.bugs.filter((b) => b.rec).length;

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.wrong > 0) S.wrong -= dt;
  if (S.flash > 0) { S.flash -= dt; if (S.flash <= 0) S.flashRow = -1; }
  for (const b of S.bugs) {
    if (S.card >= 0) continue;
    b.wob += dt * b.sp * 3;
    b.a += Math.sin(b.wob) * dt * .5;
    const nx = b.x + Math.cos(b.a) * b.sp * 26 * dt;
    const ny = b.y + Math.sin(b.a) * b.sp * 26 * dt;
    if (nx > 60 && nx < FIELD.w - 60) b.x = nx; else b.a = Math.PI - b.a;
    if (ny > FIELD.y + 60 && ny < SCENE_H - 60) b.y = ny; else b.a = -b.a;
  }

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.done) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseLamp('آفتاب غروب کرد!'); }
    }
    if (S.done) { S.doneT += dt; if (S.doneT > 2.4) { newRound(); S.timeLeft = L().time; } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseLamp(msg) {
  if (S.done) return;
  S.lamps--;
  S.combo = 0;
  S.shake = .5;
  S.card = -1;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.lamps <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newRound();
}

/** ثبتِ شمارش در دفتر. */
function record() {
  const b = S.bugs[S.card];
  if (!b) return;
  const k = BUG[b.k];
  if (S.draft[0] !== k.legs || S.draft[1] !== k.wings || S.draft[2] !== k.ant) {
    S.wrong = 1; S.shake = .12;
    sfx.nope();
    toast.say('دوباره خوب بشمار.', 'bad');
    return;
  }
  b.rec = S.draft.slice();
  S.card = -1;
  sfx.place();
  bits.add(b.x, b.y, 12, 'dot', [P.brassLt, P.card], { speed: 140, lift: 50, size: 3, life: .5, grav: 280 });
  S.score += 90;
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
  if (recorded() === S.bugs.length) {
    S.stage = 'riddle';
    askRiddle();
    sfx.good();
    toast.say('دفتر پُر شد. حالا کارتِ معمّا.', 'good');
  }
}

function askRiddle() {
  const pool = S.bugs.map((b, i) => i);
  const prev = S.riddle ? S.riddle.i : -1;
  let i = pool[R(0, pool.length - 1)];
  let g = 0;
  while (i === prev && pool.length > 1 && g++ < 8) i = pool[R(0, pool.length - 1)];
  S.riddle = { i };
}

function answer(row) {
  if (S.stage !== 'riddle' || !S.riddle || S.done) return;
  if (row === S.riddle.i) {
    S.flash = 1; S.flashRow = row;
    sfx.good();
    S.score += 180;
    S.rIdx++;
    if (S.rIdx >= S.rTotal) finish();
    else { askRiddle(); toast.say('درست بود! معمّای بعد.', 'good'); }
  } else {
    S.flash = 1; S.flashRow = row;
    S.shake = .16;
    sfx.nope();
    S.timeLeft = Math.max(5, S.timeLeft - 5);
    toast.say('نشانه‌ها را با جدول جور کن.', 'bad');
  }
}

function finish() {
  S.done = .001; S.doneT = 0;
  S.combo++;
  S.cleared++;
  S.score += 300 + Math.round(S.timeLeft * 3) + Math.min(S.combo, 6) * 70;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(FIELD.w / 2, 340, 46, [P.gold, P.brassLt, P.grassLt, '#fff']);
  sfx.win();
  toast.say('دفترِ مزرعه کامل شد!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 700; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

const CARD = { x: 232, y: 140, w: 420, h: 508 };
function stepBtn(i, plus) {
  return { x: CARD.x + (plus ? CARD.w - 96 : 40), y: CARD.y + 138 + i * 88, w: 56, h: 56 };
}
const CARD_OK = { x: CARD.x + 96, y: CARD.y + 404, w: 228, h: 60 };
function noteRow(i) {
  return { x: NOTE.x + 14, y: NOTE.y + 96 + i * 96, w: NOTE.w - 28, h: 86 };
}
const bugAt = (p) => S.bugs.findIndex((b) => Math.hypot(b.x - p.x, b.y - p.y) < 26);
const underLens = (b) => Math.hypot(b.x - S.lens.x, b.y - S.lens.y) < LENS_R - 16;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (p.x < FIELD.w && p.y > FIELD.y) { S.lens.x = p.x; S.lens.y = p.y; S.lensOn = true; }
  else S.lensOn = false;
  S.hover = null;
  if (S.card >= 0) {
    for (let i = 0; i < 3; i++) {
      if (inRect(p, stepBtn(i, false))) S.hover = { k: 'minus', i };
      if (inRect(p, stepBtn(i, true))) S.hover = { k: 'plus', i };
    }
    if (inRect(p, CARD_OK)) S.hover = { k: 'ok' };
  } else if (S.stage === 'riddle') {
    for (let i = 0; i < S.bugs.length; i++) if (inRect(p, noteRow(i))) S.hover = { k: 'row', i };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
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
  if (S.done) return;

  if (S.card >= 0) {
    for (let i = 0; i < 3; i++) {
      if (inRect(p, stepBtn(i, false))) { S.draft[i] = Math.max(0, S.draft[i] - 1); sfx.tap(); return; }
      if (inRect(p, stepBtn(i, true))) { S.draft[i] = Math.min(12, S.draft[i] + 1); sfx.tap(); return; }
    }
    if (inRect(p, CARD_OK)) { record(); return; }
    if (!inRect(p, CARD)) { S.card = -1; sfx.tap(); }
    return;
  }
  if (S.stage === 'riddle') {
    for (let i = 0; i < S.bugs.length; i++) if (inRect(p, noteRow(i))) { answer(i); return; }
  }
  /* برداشتنِ جانور برای ثبت — فقط زیرِ ذرّه‌بین */
  const i = bugAt(p);
  if (i >= 0 && underLens(S.bugs[i]) && !S.bugs[i].rec) {
    S.card = i; S.draft = [0, 0, 0]; S.wrong = 0;
    sfx.pop();
    return;
  }
  if (i >= 0 && !underLens(S.bugs[i])) toast.say('ذرّه‌بین را رویش بگیر.', 'info');
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
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(6, 14, 8, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 252, 240, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '6, 14, 8');
  ctx.fillStyle = P.grassLt;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6c7a68' }); yy += 30; }
  return h + 20;
}

/* ───────── جانورها ─────────
   شمارِ پا و بال و شاخک دقیقاً همان چیزی است که کشیده می‌شود؛
   بچّه از روی همین شکل می‌شمارد، پس باید درست باشد.            */

function legPair(x, y, len, ang, col, w) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + s * len * .6, y + Math.sin(ang) * len * .5,
                         x + s * len, y + len * .75);
    ctx.stroke();
  }
}

function drawBug(k, sc, t) {
  const b = BUG[k];
  ctx.save();
  ctx.scale(sc, sc);
  if (b.id === 'worm') {
    ctx.strokeStyle = b.d; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    for (let i = 0; i <= 8; i++) ctx.lineTo(-18 + i * 4.5, Math.sin(i * .9 + t * 2) * 3.4);
    ctx.stroke();
    ctx.strokeStyle = b.c; ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    for (let i = 0; i <= 8; i++) ctx.lineTo(-18 + i * 4.5, Math.sin(i * .9 + t * 2) * 3.4);
    ctx.stroke();
    ctx.strokeStyle = b.d; ctx.lineWidth = 1.6;
    for (let i = 1; i < 8; i++) {
      const x = -18 + i * 4.5, y = Math.sin(i * .9 + t * 2) * 3.4;
      ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke();
    }
    ctx.restore();
    return;
  }
  const sw = Math.sin(t * 6) * .12;
  /* پاها */
  if (b.legs > 0) {
    const pairs = b.legs / 2;
    for (let i = 0; i < pairs; i++) {
      const px = -8 + i * (16 / Math.max(1, pairs - 1)) * (pairs > 1 ? 1 : 0);
      legPair(px, 2, b.id === 'spider' ? 15 : 11, sw + i, b.d, b.id === 'spider' ? 2 : 1.8);
    }
  }
  /* بال‌ها */
  if (b.wings === 4) {
    for (const s of [-1, 1]) {
      ctx.fillStyle = 'rgba(255, 236, 200, .92)';
      ctx.beginPath(); ctx.ellipse(s * 12, -8, 13, 10, s * (.5 + sw), 0, TAU); ctx.fill();
      ctx.fillStyle = b.c;
      ctx.beginPath(); ctx.ellipse(s * 12, -8, 13, 10, s * (.5 + sw), 0, TAU);
      ctx.globalAlpha = .8; ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255, 240, 210, .95)';
      ctx.beginPath(); ctx.ellipse(s * 10, 7, 9, 7, s * (-.4 + sw), 0, TAU); ctx.fill();
      ctx.fillStyle = b.d;
      ctx.globalAlpha = .55;
      ctx.beginPath(); ctx.ellipse(s * 10, 7, 9, 7, s * (-.4 + sw), 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
  } else if (b.wings === 2) {
    for (const s of [-1, 1]) {
      ctx.fillStyle = 'rgba(226, 240, 246, .62)';
      ctx.beginPath(); ctx.ellipse(s * 10, -3, 12, 5.5, s * (.35 + sw), 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(120, 150, 165, .7)'; ctx.lineWidth = .9;
      ctx.beginPath(); ctx.ellipse(s * 10, -3, 12, 5.5, s * (.35 + sw), 0, TAU); ctx.stroke();
    }
  }
  /* بدن */
  if (b.id === 'spider') {
    ctx.fillStyle = b.d;
    ctx.beginPath(); ctx.ellipse(3, 0, 11, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = b.c;
    ctx.beginPath(); ctx.ellipse(-8, 0, 6, 5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e8e2d0';
    ctx.beginPath(); ctx.arc(-10, -2, 1.6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(-10, 2, 1.6, 0, TAU); ctx.fill();
  } else if (b.id === 'ant') {
    ctx.fillStyle = b.c;
    ctx.beginPath(); ctx.ellipse(10, 0, 7, 5.5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 4, 3.6, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-9, 0, 5, 4.4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = b.d;
    ctx.beginPath(); ctx.ellipse(10, 1.4, 7, 4, 0, 0, TAU); ctx.fill();
  } else {
    ctx.fillStyle = b.d;
    ctx.beginPath(); ctx.ellipse(4, 0, 10, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = b.c;
    ctx.beginPath(); ctx.ellipse(-8, 0, 5.4, 4.8, 0, 0, TAU); ctx.fill();
    if (b.id === 'fly') {
      ctx.fillStyle = '#b03a2a';
      ctx.beginPath(); ctx.ellipse(-10, -1.6, 2.6, 2.2, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-10, 2, 2.6, 2.2, 0, 0, TAU); ctx.fill();
    }
  }
  /* شاخک‌ها */
  if (b.ant > 0) {
    ctx.strokeStyle = b.d; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-11, s * 2);
      ctx.quadraticCurveTo(-20, s * 6 + sw * 6, -25, s * 11);
      ctx.stroke();
      if (b.id === 'butter') { ctx.fillStyle = b.d; ctx.beginPath(); ctx.arc(-25, s * 11, 2.2, 0, TAU); ctx.fill(); }
    }
  }
  ctx.restore();
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintFieldStatic() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, SCENE_H);
  g.addColorStop(0, P.sky); g.addColorStop(.3, P.grass); g.addColorStop(1, P.grassDk);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  /* خاکِ زیرِ علف */
  ctx.save();
  ctx.globalAlpha = .35;
  ctx.fillStyle = texStone(P.soil, '#6b4d2c');
  ctx.fillRect(0, HUD_H, FIELD.w, SCENE_H - HUD_H);
  ctx.restore();
  /* تیغه‌های علف — سه لایه، از دور به نزدیک */
  for (let layer = 0; layer < 3; layer++) {
    const n = 260, hMin = 26 + layer * 16, hMax = 60 + layer * 30;
    for (let i = 0; i < n; i++) {
      const s = layer * 1000 + i;
      const x = noise1(s * 1.7) * FIELD.w;
      const y = HUD_H + 40 + noise1(s * 3.1 + 5) * (SCENE_H - HUD_H - 40);
      const h = hMin + noise1(s * .9) * (hMax - hMin);
      const lean = (noise1(s * 2.3) - .5) * 26;
      ctx.strokeStyle = layer === 0 ? 'rgba(20, 46, 24, .8)'
                      : (layer === 1 ? 'rgba(44, 82, 48, .85)' : 'rgba(78, 127, 74, .75)');
      ctx.lineWidth = 2 + layer * .8; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + lean * .4, y - h * .6, x + lean, y - h);
      ctx.stroke();
    }
  }
  /* چند گلِ ریز */
  for (let i = 0; i < 26; i++) {
    const x = noise1(i * 5.3 + 2) * FIELD.w, y = HUD_H + 70 + noise1(i * 7.1) * (SCENE_H - HUD_H - 90);
    const c = ['#f0d36a', '#e8a0c0', '#f6f2e4'][i % 3];
    ctx.strokeStyle = 'rgba(60, 100, 60, .8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2, y - 22); ctx.stroke();
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * TAU;
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(x + 2 + Math.cos(a) * 4, y - 22 + Math.sin(a) * 4, 3.4, 2.8, a, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = '#d9a026';
    ctx.beginPath(); ctx.arc(x + 2, y - 22, 2, 0, TAU); ctx.fill();
  }
  /* کندهٔ چوب گوشهٔ مزرعه */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); ctx.ellipse(120, 690, 96, 34, -.12, 0, TAU); ctx.fill();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.beginPath(); ctx.ellipse(120, 682, 92, 30, -.12, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(60, 38, 14, .5)'; ctx.lineWidth = 2;
  for (let r = 12; r < 88; r += 16) {
    ctx.beginPath(); ctx.ellipse(120, 682, r, r * .33, -.12, 0, TAU); ctx.stroke();
  }
  /* نوارِ کنارِ دفتر */
  ctx.fillStyle = P.woodDk;
  ctx.fillRect(FIELD.w, HUD_H, SCENE_W - FIELD.w, SCENE_H - HUD_H);
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.fillRect(FIELD.w + 6, HUD_H, SCENE_W - FIELD.w - 6, SCENE_H - HUD_H);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fillRect(FIELD.w, HUD_H, 8, SCENE_H - HUD_H);
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.grass);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  const layer = staticLayer('field', SCENE_W, SCENE_H, paintFieldStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawSpecks();
  if (S.lensOn && S.card < 0) drawLens(layer);
  drawNote();
  bits.draw();
  ctx.restore();

  if (S.card >= 0) drawCard();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.1, 'rgba(6, 16, 8, .44)', .34, .12);
}

/** بیرونِ ذرّه‌بین، جانور فقط یک نقطهٔ ریز است. */
function drawSpecks() {
  for (const b of S.bugs) {
    if (b.rec) continue;
    const near = S.lensOn ? Math.hypot(b.x - S.lens.x, b.y - S.lens.y) : 9999;
    ctx.save();
    /* نزدیکِ ذرّه‌بین، علفِ بالای سرش تکان می‌خورد — سرنخ هست، ولی جانور پیدا نیست */
    if (near < 230) {
      const k = clamp(1 - (near - LENS_R) / 130, 0, 1);
      ctx.globalAlpha = k * .5;
      ctx.strokeStyle = '#cfe6b8'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const a = b.a + (i - 1) * .7 + Math.sin(S.t * 7 + i + b.wob) * .22;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x + Math.cos(a) * 16, b.y + Math.sin(a) * 16 - 12);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = .85;
    ctx.fillStyle = 'rgba(22, 40, 22, .92)';
    ctx.beginPath(); ctx.ellipse(b.x, b.y, 5, 3.6, b.a, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function drawLens(layer) {
  const { x, y } = S.lens;
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, LENS_R, 0, TAU); ctx.clip();
  /* صحنه، بزرگ‌شده حولِ مرکزِ ذرّه‌بین */
  ctx.translate(x, y);
  ctx.scale(LENS_K, LENS_K);
  ctx.translate(-x, -y);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  for (const b of S.bugs) {
    if (b.rec) continue;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.a);
    drawBug(b.k, 1, S.t + b.wob);
    ctx.restore();
  }
  ctx.restore();
  /* برقِ شیشه */
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, LENS_R, 0, TAU); ctx.clip();
  const g = ctx.createLinearGradient(x - LENS_R, y - LENS_R, x + LENS_R * .4, y + LENS_R);
  g.addColorStop(0, 'rgba(255,255,255,.22)');
  g.addColorStop(.45, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - LENS_R, y - LENS_R, LENS_R * 2, LENS_R * 2);
  ctx.restore();
  /* قابِ برنجی و دسته */
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 16;
  ctx.beginPath(); ctx.arc(x, y, LENS_R + 6, 0, TAU); ctx.stroke();
  ctx.strokeStyle = P.brass; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(x, y, LENS_R + 6, 0, TAU); ctx.stroke();
  ctx.strokeStyle = P.brassLt; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, LENS_R + 2, -2.4, -.9); ctx.stroke();
  ctx.save();
  ctx.translate(x, y); ctx.rotate(.9);
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 20; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(LENS_R + 10, 0); ctx.lineTo(LENS_R + 76, 0); ctx.stroke();
  ctx.strokeStyle = P.wood; ctx.lineWidth = 13;
  ctx.beginPath(); ctx.moveTo(LENS_R + 10, 0); ctx.lineTo(LENS_R + 76, 0); ctx.stroke();
  ctx.restore();
}

/* ───────── دفتر ───────── */

const COL = [
  { n: 'پا', icon: 'leg' },
  { n: 'بال', icon: 'wing' },
  { n: 'شاخک', icon: 'ant' },
];

function featIcon(x, y, kind, col, sc = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  if (kind === 'leg') {
    ctx.beginPath(); ctx.moveTo(-6, -8); ctx.quadraticCurveTo(2, -2, -2, 9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -8); ctx.quadraticCurveTo(10, -1, 7, 9); ctx.stroke();
  } else if (kind === 'wing') {
    ctx.fillStyle = col;
    ctx.globalAlpha = .35;
    ctx.beginPath(); ctx.ellipse(0, -1, 11, 6, -.35, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.ellipse(0, -1, 11, 6, -.35, 0, TAU); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-6, 9); ctx.quadraticCurveTo(-8, -4, -1, -9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, 9); ctx.quadraticCurveTo(8, -4, 1, -9); ctx.stroke();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(-1, -9, 2.4, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(1, -9, 2.4, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawNote() {
  paper(NOTE.x, NOTE.y, NOTE.w, NOTE.h, P.card, 21, 12, .34);
  ctx.strokeStyle = 'rgba(38, 48, 31, .2)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(NOTE.x + 22, NOTE.y + 14); ctx.lineTo(NOTE.x + 22, NOTE.y + NOTE.h - 14); ctx.stroke();
  text('دفترِ مشاهده', NOTE.x + NOTE.w - 24, NOTE.y + 32, { size: 21, family: 'Lalezar', color: P.ink, align: 'right' });
  /* سرستون‌ها */
  for (let c = 0; c < 3; c++) {
    const x = NOTE.x + NOTE.w - 84 - c * 68;
    featIcon(x, NOTE.y + 62, COL[c].icon, P.inkSoft, .9);
    text(COL[c].n, x, NOTE.y + 82, { size: 12, color: P.inkSoft });
  }
  ctx.strokeStyle = 'rgba(38, 48, 31, .22)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(NOTE.x + 34, NOTE.y + 92); ctx.lineTo(NOTE.x + NOTE.w - 22, NOTE.y + 92); ctx.stroke();

  for (let i = 0; i < S.bugs.length; i++) {
    const b = S.bugs[i], r = noteRow(i);
    const hot = S.hover && S.hover.k === 'row' && S.hover.i === i;
    const lit = S.flashRow === i && S.flash > 0;
    ctx.fillStyle = lit ? (i === (S.riddle ? S.riddle.i : -1) ? 'rgba(93, 162, 111, .25)' : 'rgba(205, 91, 69, .2)')
                        : (b.rec ? 'rgba(38, 48, 31, .05)' : 'rgba(38, 48, 31, .02)');
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 10); ctx.fill();
    if (b.rec && S.stage === 'riddle') {
      ctx.strokeStyle = hot ? P.gold : 'rgba(38, 48, 31, .18)'; ctx.lineWidth = hot ? 3 : 1.6;
      ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 10); ctx.stroke();
    }
    if (!b.rec) {
      ctx.strokeStyle = 'rgba(38, 48, 31, .16)'; ctx.lineWidth = 1.6; ctx.setLineDash([6, 6]);
      ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 10); ctx.stroke();
      ctx.setLineDash([]);
      text('هنوز ثبت نشده', r.x + r.w / 2, r.y + r.h / 2, { size: 14, color: 'rgba(38, 48, 31, .3)' });
      continue;
    }
    /* شکلِ جانور و شمارها */
    ctx.save();
    ctx.translate(r.x + 44, r.y + r.h / 2);
    drawBug(b.k, .82, S.t + b.wob);
    ctx.restore();
    for (let c = 0; c < 3; c++) {
      const x = r.x + r.w - 40 - c * 68;
      numText(fa(b.rec[c]), x, r.y + r.h / 2, { size: 26, color: b.rec[c] ? P.ink : 'rgba(38,48,31,.3)' });
    }
  }
  /* پیشرفت */
  const y = NOTE.y + NOTE.h - 34;
  text(S.stage === 'look' ? 'ثبت‌شده' : 'معمّا', NOTE.x + NOTE.w - 30, y, { size: 15, color: P.inkSoft, align: 'right' });
  numText(S.stage === 'look' ? fa(recorded()) + ' / ' + fa(S.bugs.length)
                             : fa(S.rIdx) + ' / ' + fa(S.rTotal),
    NOTE.x + 76, y, { size: 20, color: P.ink });
}

/* ───────── کارتِ ثبت ───────── */

function drawCard() {
  ctx.fillStyle = 'rgba(6, 14, 8, .62)';
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  const b = S.bugs[S.card];
  paper(CARD.x, CARD.y, CARD.w, CARD.h, P.card, 51, 16, .5);
  text('چند تا می‌بینی؟', CARD.x + CARD.w / 2, CARD.y + 34, { size: 22, family: 'Lalezar', color: P.ink });
  /* جانور، بزرگ */
  ctx.save();
  ctx.translate(CARD.x + CARD.w / 2, CARD.y + 98);
  drawBug(b.k, 3, S.t + b.wob);
  ctx.restore();
  ctx.strokeStyle = 'rgba(38, 48, 31, .18)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(CARD.x + 30, CARD.y + 132); ctx.lineTo(CARD.x + CARD.w - 30, CARD.y + 132); ctx.stroke();

  for (let i = 0; i < 3; i++) {
    const y = CARD.y + 138 + i * 88;
    featIcon(CARD.x + CARD.w / 2 - 78, y + 28, COL[i].icon, P.ink, 1.15);
    text(COL[i].n, CARD.x + CARD.w / 2 - 78, y + 52, { size: 13, color: P.inkSoft });
    numText(fa(S.draft[i]), CARD.x + CARD.w / 2 + 26, y + 30, { size: 40, color: P.ink });
    for (const plus of [false, true]) {
      const bb = stepBtn(i, plus);
      const hot = S.hover && S.hover.k === (plus ? 'plus' : 'minus') && S.hover.i === i;
      ctx.fillStyle = hot ? '#4e7f4a' : '#6b8f63';
      ctx.beginPath(); ctx.arc(bb.x + bb.w / 2, bb.y + bb.h / 2 + 2, bb.w / 2, 0, TAU); ctx.fill();
      ctx.fillStyle = hot ? '#63a05b' : '#7fa876';
      ctx.beginPath(); ctx.arc(bb.x + bb.w / 2, bb.y + bb.h / 2, bb.w / 2 - 2, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bb.x + 16, bb.y + bb.h / 2); ctx.lineTo(bb.x + bb.w - 16, bb.y + bb.h / 2);
      if (plus) { ctx.moveTo(bb.x + bb.w / 2, bb.y + 16); ctx.lineTo(bb.x + bb.w / 2, bb.y + bb.h - 16); }
      ctx.stroke();
    }
  }
  button(CARD_OK, 'ثبت در دفتر', { hot: S.hover && S.hover.k === 'ok', fill: '#4e7f4a', hotFill: '#63a05b', size: 24 });
  if (S.wrong > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.wrong, 0, 1);
    ctx.strokeStyle = P.bad; ctx.lineWidth = 4;
    ctx.beginPath(); rrPath(CARD.x - 4, CARD.y - 4, CARD.w + 8, CARD.h + 8, 18); ctx.stroke();
    ctx.restore();
  }
  text('برای بستن، بیرونِ کارت بزن', CARD.x + CARD.w / 2, CARD.y + CARD.h - 20,
    { size: 13, color: 'rgba(38, 48, 31, .4)' });
}

/* ───────── کارتِ معمّا و نوار ───────── */

function drawHUD() {
  ctx.fillStyle = 'rgba(14, 28, 16, .93)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(207, 167, 78, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 236 - i * 30;
    ctx.save();
    ctx.globalAlpha = i < S.lamps ? 1 : .22;
    ctx.fillStyle = i < S.lamps ? P.brass : '#5f6a5c';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, 10, 0, TAU); ctx.fill();
    ctx.strokeStyle = i < S.lamps ? P.brassLt : '#828d7f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 7, HUD_H / 2 + 7); ctx.lineTo(x + 14, HUD_H / 2 + 14); ctx.stroke();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), 640, HUD_H / 2, { size: 21, color: P.gold });
  } else {
    text('بی‌پایان', 640, HUD_H / 2, { size: 21, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 24, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 132, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(246, 240, 220, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  /* کارتِ معمّا، وسطِ نوار */
  if (S.stage === 'riddle' && S.riddle && !S.done) {
    const k = BUG[S.bugs[S.riddle.i].k];
    const w = 300, x = 300;
    ctx.fillStyle = 'rgba(207, 167, 78, .18)';
    ctx.beginPath(); rrPath(x, 6, w, HUD_H - 12, 10); ctx.fill();
    ctx.strokeStyle = P.brassLt; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(x, 6, w, HUD_H - 12, 10); ctx.stroke();
    text('کدام است؟', x + w - 16, HUD_H / 2, { size: 16, family: 'Lalezar', color: P.brassLt, align: 'right' });
    for (let c = 0; c < 3; c++) {
      const cx = x + 178 - c * 58;
      featIcon(cx - 14, HUD_H / 2, COL[c].icon, P.brassLt, .78);
      numText(fa([k.legs, k.wings, k.ant][c]), cx + 12, HUD_H / 2, { size: 22, color: P.paper });
    }
  }
  const kk = clamp(S.timeLeft / L().time, 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = kk > .3 ? P.brass : P.bad;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * kk, 5, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: 60, y: 140, w: 700, h: 520 }], .72);
    const h = tutCard(150, 200, 520,
      ['جانورهای مزرعه لای علف پنهان‌اند.', 'از دور فقط یک نقطه‌اند؛ ذرّه‌بین را رویشان بگردان.'], 'دفترِ مزرعه');
    tutMore(410, 200 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: NOTE.x, y: NOTE.y, w: NOTE.w, h: NOTE.h }], .7);
    tutCard(80, 220, 620, ['زیرِ ذرّه‌بین روی جانور بزن تا کارتِ ثبت باز شود.',
      'پا و بال و شاخکش را خودت بشمار و بنویس.']);
  } else {
    spot([{ x: 280, y: 4, w: 340, h: HUD_H - 8 }, { x: NOTE.x, y: NOTE.y, w: NOTE.w, h: NOTE.h }], .72);
    const h = tutCard(150, 300, 540,
      ['دفتر که پُر شد، کارتِ معمّا بالای صحنه می‌آید:',
       'نشانه‌ها را می‌گوید و تو باید سطرِ درست را در دفترِ خودت بزنی.'], 'از روی دفترِ خودت');
    tutMore(420, 300 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function lensIcon(x, y) {
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(x - 8, y - 6, 24, 0, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(191, 230, 238, .5)';
  ctx.beginPath(); ctx.arc(x - 8, y - 6, 22, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 10, y + 12); ctx.lineTo(x + 30, y + 30); ctx.stroke();
  ctx.save();
  ctx.translate(x - 8, y - 6);
  drawBug(0, 1.1, 0);
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 800, h: 300, y: 128,
    paper: P.paper, band: P.grassLt, ink: P.ink, inkSoft: '#6c7a68',
    icon: lensIcon,
    title: 'دفترِ مزرعه',
    body: 'مثلِ مریم و سارا: با ذرّه‌بین جانورهای کوچکِ مزرعه را پیدا کن،\nپا و بال و شاخکشان را خودت بشمار و در دفتر بنویس.\nآخر، کارتِ معمّا نشانه‌ها را می‌گوید و تو از روی دفترت جوابش را می‌دهی.',
    btn: BTN_GO, btnLabel: 'برو به مزرعه', btnHot: S.hover === BTN_GO,
    btnFill: '#4e7f4a', btnHotFill: '#63a05b',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#6c7a68',
    icon: lensIcon,
    title: L().endless ? 'آفتاب رفت' : 'همهٔ دفترها پُر شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ مزرعه را گشتی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'گوشهٔ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#4e7f4a', btnHotFill: '#63a05b',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#6c7a68',
    icon: (x, y) => { lensIcon(x + 30, y); ctx.fillStyle = '#7d8a78';
      ctx.beginPath(); ctx.arc(x - 40, y, 11, 0, TAU); ctx.fill(); },
    title: 'روز تمام شد',
    body: 'امتیاز: ' + fa(S.score) + '\nذرّه‌بین را آرام بگردان؛ نقطه‌ها جانورند.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#4e7f4a', btnHotFill: '#63a05b',
  });
}

/*!
title: مزرعهٔ علی‌آقا — کسر
bg: #24313a
*/

/* ═══════════════════════════════════════════════════════════════════════
   مزرعهٔ علی‌آقا — ریاضی سوم، فصل ۳، درس ۲ (کسر)
   ───────────────────────────────────────────────────────────────────────
   فعّالیتِ خودِ کتاب (ص ۴۶): «علی آقا کشاورز است و یک قطعه زمین دارد.
   او نیمی از زمینش را گندم کاشته است. نیمِ دیگر را دو قسمت کرده و در
   یک قسمت یونجه و در قسمتِ دیگر جو کاشته است.»

   و همان‌جا کتاب می‌گوید: «۲ قسمت از ۳ قسمتِ مساوی را با ۲/۳ نشان
   می‌دهیم و آن را دو سوم می‌خوانیم» — با نام‌های صورت، خطّ کسری، مخرج.

   ── قانونِ بازی ─────────────────────────────────────────────────
   دو کار بیشتر نیست و هر دو در خودِ زمین دیده می‌شود:

     مخرج = زمین به چند قسمتِ مساوی بریده شده
     صورت = چند قسمت از آن‌ها کاشته شده

   بازی جواب را نمی‌نویسد؛ همین‌که بچّه تعدادِ قسمت‌ها را عوض می‌کند،
   عددِ پایینِ کسر جلوی چشمش عوض می‌شود، و هر قسمتی که می‌کارد عددِ
   بالا را یکی زیاد می‌کند. سفارشِ علی‌آقا هم به حرف گفته می‌شود
   («دو سومِ زمین»)، نه با عدد.

   دو مرحلهٔ آخر همان فعّالیتِ دومِ کتاب است: نوارِ کاغذیِ فاطمه. نوار
   را باید طوری تا کرد که سرِ گیره یا پاک‌کن درست روی یک خط بیفتد —
   وگرنه هیچ کسری جواب نمی‌دهد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  sky: '#8fc2d8', skyLo: '#5f9cbc', hill: '#7fae62', hillLo: '#5f8f4a',
  soil: '#8a6038', soilLo: '#5f4224', soilDk: '#3f2c17', ridge: '#a87a4a',
  wheat: '#e0b23c', wheatDk: '#a87a1c', wheatLt: '#f2d472',
  barley: '#c98a4a', barleyDk: '#94602a', barleyLt: '#e8b478',
  clover: '#5fa84a', cloverDk: '#3a7030', cloverLt: '#8fd06a', flower: '#a86ad0',
  tape: '#f6eed8', tapeDk: '#d8ccae', tapeLine: '#8a7c58',
  wood: '#7a5636', woodDk: '#523a22',
  paper: '#fbf7ec', card: '#ffffff', line: '#c9b795',
  ink: '#26333c', inkSoft: '#6f8492',
  good: '#5e9f5e', bad: '#c0503a', gold: '#e0a63f', accent: '#4c9ec4',
  skin: '#e0b088', shirt: '#4c7fa8', hat: '#d8c088',
};

/* ───────── محصول‌ها ───────── */

const CROPS = {
  w: { n: 'گندم', c: P.wheat, d: P.wheatDk, l: P.wheatLt },
  b: { n: 'جو', c: P.barley, d: P.barleyDk, l: P.barleyLt },
  c: { n: 'یونجه', c: P.clover, d: P.cloverDk, l: P.cloverLt },
};
const CKEYS = ['w', 'b', 'c'];

const ONES = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده'];
const ORD = ['', '', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم'];
const fracWord = (m, n) => (m === 1 && n === 2) ? 'نصف' : ONES[m] + ' ' + ORD[n];

/* ───────── مرحله‌ها ───────── */

const LV = [
  { kind: 'farm', ask: 'نصفِ زمینم را گندم بکار.', need: [['w', 1, 2]] },
  { kind: 'farm', ask: 'یک‌چهارمِ زمین را جو بکار.', need: [['b', 1, 4]] },
  { kind: 'farm', ask: 'دو سومِ زمین را یونجه بکار.', need: [['c', 2, 3]] },
  { kind: 'farm', ask: 'سه چهارمِ زمین را گندم بکار.', need: [['w', 3, 4]] },
  { kind: 'farm', ask: 'نصفِ زمین گندم، یک‌چهارمش جو، یک‌چهارمش یونجه.',
    need: [['w', 1, 2], ['b', 1, 4], ['c', 1, 4]] },
  { kind: 'farm', ask: 'پنج ششمِ زمین را یونجه بکار.', need: [['c', 5, 6]] },
  { kind: 'tape', obj: 'clip', objN: 'گیرهٔ کاغذ', m: 2, n: 3,
    ask: 'نوار را به قسمت‌های مساوی تا کن تا سرِ گیره روی یک خط بیفتد، بعد همان‌قدر را رنگ کن.' },
  { kind: 'tape', obj: 'eraser', objN: 'پاک‌کن', m: 3, n: 4,
    ask: 'حالا همین کار را برای پاک‌کن بکن.' },
];

/* ───────── جای‌ها ───────── */

const ASK = { x: 24, y: 70, w: 296, h: 156 };
const FRAC = { x: 24, y: 240, w: 296, h: 242 };
const PAL = { x: 24, y: 496, w: 296, h: 158 };
const BTN_CHECK = { x: 24, y: 668, w: 296, h: 64 };
const FIELD = { x: 344, y: 172, w: 824, h: 296 };
const TAPE = { x: 344, y: 300, w: 824, h: 116 };
const DIAL_Y = 528;
const BTN_MINUS = { x: 470, y: DIAL_Y, w: 84, h: 76 };
const BTN_PLUS = { x: 958, y: DIAL_Y, w: 84, h: 76 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 506, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 510, w: 300, h: 68 };
const palBtn = (i) => ({ x: PAL.x + 14, y: PAL.y + 40 + i * 40, w: PAL.w - 28, h: 34 });

/* ───────── حالت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  lv: 0, parts: 2, sel: 'w', cells: [],
  score: 0, best: 0,
  ok: 0, wrong: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

function loadBest() { try { return +localStorage.getItem('kasr-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('kasr-best', String(v)); } catch { /* خصوصی */ } }
S.best = loadBest();

function tip(msg) { S.tip = msg; S.tipT = 4.2; }
const L = () => LV[Math.min(S.lv, LV.length - 1)];
const isTape = () => L().kind === 'tape';
const box = () => (isTape() ? TAPE : FIELD);
const cw = () => box().w / S.parts;
const countOf = (k) => S.cells.filter((c) => c === k).length;

function setParts(n) {
  const v = clamp(n, 2, 10);
  if (v === S.parts) return;
  S.parts = v;
  S.cells = new Array(v).fill(null);
  sfx.slide();
}

function startLevel(i, keep) {
  S.lv = i;
  S.parts = 2;
  S.cells = new Array(2).fill(null);
  S.sel = isTape() ? 'w' : (L().need[0][0]);
  if (!keep) { /* امتیاز می‌ماند */ }
}

function startGame() {
  S.phase = 'play'; S.phaseT = 0;
  S.score = 0; S.ok = 0; S.wrong = 0;
  S.tut.on = true; S.tut.step = 0; S.tut.t = 0;
  startLevel(0, false);
}

/* ───────── داوری ───────── */

/** آیا کاشتِ روی زمین با سفارش می‌خواند؟ */
function judge() {
  const lv = L();
  if (lv.kind === 'tape') {
    const painted = S.cells.filter((c) => c !== null).length;
    if (painted === 0) return { ok: false, why: 'هنوز چیزی رنگ نکرده‌ای.' };
    for (let i = 0; i < S.parts; i++) {
      const should = i < painted;
      if ((S.cells[i] !== null) !== should) {
        return { ok: false, why: 'رنگ‌ها باید از سرِ نوار پشتِ سرِ هم باشند.' };
      }
    }
    if (Math.abs(painted / S.parts - lv.m / lv.n) > 1e-9) {
      return { ok: false, why: 'اندازه‌ای که رنگ کرده‌ای با طولِ ' + lv.objN + ' یکی نیست.' };
    }
    return { ok: true };
  }
  const used = {};
  for (const c of S.cells) if (c) used[c] = (used[c] || 0) + 1;
  for (const [k, m, n] of lv.need) {
    const got = used[k] || 0;
    if (Math.abs(got / S.parts - m / n) > 1e-9) {
      return { ok: false, why: 'قسمتِ ' + CROPS[k].n + ' هنوز درست نیست.' };
    }
    delete used[k];
  }
  if (Object.keys(used).length) {
    return { ok: false, why: 'چیزی کاشته‌ای که علی‌آقا نخواسته بود.' };
  }
  return { ok: true };
}

function check() {
  const r = judge();
  if (!r.ok) {
    S.wrong++;
    tip(r.why);
    S.shake = .14;
    sfx.nope();
    return;
  }
  S.ok++;
  S.score += 100;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  sfx.win();
  const b = box();
  bits.confetti(b.x + b.w / 2, b.y + b.h / 2, 26, [P.gold, P.card, P.cloverLt, P.wheatLt]);
  if (S.lv >= LV.length - 1) {
    S.phase = 'won'; S.phaseT = 0;
    return;
  }
  toast.say('آفرین', 'good');
  startLevel(S.lv + 1, true);
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 1, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    if (inRect(p, BTN_CHECK)) S.hover = { k: 'check' };
    if (inRect(p, BTN_MINUS)) S.hover = { k: 'minus' };
    if (inRect(p, BTN_PLUS)) S.hover = { k: 'plus' };
    if (!isTape()) for (let i = 0; i < 3; i++) if (inRect(p, palBtn(i))) S.hover = { k: 'pal', i };
    const b = box();
    if (inRect(p, b)) S.hover = { k: 'cell', i: clamp(Math.floor((p.x - b.x) / cw()), 0, S.parts - 1) };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startGame(); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; sfx.tap(); }
    return;
  }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (inRect(p, BTN_MINUS)) { setParts(S.parts - 1); return; }
  if (inRect(p, BTN_PLUS)) { setParts(S.parts + 1); return; }
  if (inRect(p, BTN_CHECK)) { check(); return; }
  if (!isTape()) {
    for (let i = 0; i < 3; i++) {
      if (!inRect(p, palBtn(i))) continue;
      S.sel = CKEYS[i]; sfx.tick(); return;
    }
  }
  const b = box();
  if (inRect(p, b)) {
    const i = clamp(Math.floor((p.x - b.x) / cw()), 0, S.parts - 1);
    const want = isTape() ? 'w' : S.sel;
    S.cells[i] = S.cells[i] === want ? null : want;
    sfx.tap();
    bits.spark(b.x + (i + .5) * cw(), b.y + b.h / 2, 5, [CROPS[want].l, P.card]);
  }
});

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.tut.on) S.tut.t += dt;
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { startLevel(0, false); runLoop(step); });

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
    if (s.r) { ctx.moveTo(s.x + s.r, s.y); ctx.arc(s.x, s.y, s.r, 0, TAU, true); }
    else { ctx.moveTo(s.x, s.y); ctx.lineTo(s.x, s.y + s.h); ctx.lineTo(s.x + s.w, s.y + s.h); ctx.lineTo(s.x + s.w, s.y); ctx.closePath(); }
  }
  ctx.fillStyle = `rgba(10, 22, 30, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 246, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '6, 24, 32');
  ctx.fillStyle = P.gold;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: P.inkSoft }); yy += 30; }
  return h + 20;
}

/* ───────── منظره ───────── */

function paintScene() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, 470);
  g.addColorStop(0, P.skyLo); g.addColorStop(1, P.sky);
  ctx.fillStyle = g;
  ctx.fillRect(0, HUD_H, SCENE_W, 470 - HUD_H);
  ctx.fillStyle = 'rgba(255, 244, 200, .85)';
  ctx.beginPath(); ctx.arc(1110, 116, 34, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255, 250, 220, .28)';
  ctx.beginPath(); ctx.arc(1110, 116, 62, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  for (const c of [[430, 122, 56], [520, 104, 38], [820, 136, 46]]) {
    ctx.beginPath(); ctx.ellipse(c[0], c[1], c[2], c[2] * .5, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = P.hillLo;
  ctx.beginPath();
  ctx.moveTo(0, 470);
  for (let x = 0; x <= SCENE_W; x += 20) ctx.lineTo(x, 396 + Math.sin(x * .006) * 26);
  ctx.lineTo(SCENE_W, 470); ctx.fill();
  ctx.fillStyle = P.hill;
  ctx.beginPath();
  ctx.moveTo(0, 470);
  for (let x = 0; x <= SCENE_W; x += 20) ctx.lineTo(x, 432 + Math.sin(x * .009 + 2) * 16);
  ctx.lineTo(SCENE_W, 470); ctx.fill();
  const sg = ctx.createLinearGradient(0, 470, 0, SCENE_H);
  sg.addColorStop(0, P.hill); sg.addColorStop(1, '#4f7f3f');
  ctx.fillStyle = sg;
  ctx.fillRect(0, 470, SCENE_W, SCENE_H - 470);
  ctx.strokeStyle = '#3f6f34'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 60; i++) {
    const x = noise1(i * 3.7) * SCENE_W, y = 500 + noise1(i * 5.1) * 240;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 5, y - 12, x + (i % 2 ? 11 : -11), y - 22);
    ctx.stroke();
  }
}

function drawFarmer(x, y) {
  ctx.save();
  ctx.translate(x, y);
  const bob = Math.sin(S.t * 1.6) * 2;
  ctx.fillStyle = 'rgba(20, 40, 16, .25)';
  ctx.beginPath(); ctx.ellipse(0, 4, 34, 8, 0, 0, TAU); ctx.fill();
  /* پاها */
  ctx.strokeStyle = '#4a5a68'; ctx.lineWidth = 11; ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * 9, -34); ctx.lineTo(s * 12, -2); ctx.stroke();
  }
  /* تن */
  ctx.fillStyle = P.shirt;
  ctx.beginPath();
  ctx.moveTo(-20, -36 + bob);
  ctx.quadraticCurveTo(-24, -84 + bob, 0, -88 + bob);
  ctx.quadraticCurveTo(24, -84 + bob, 20, -36 + bob);
  ctx.closePath(); ctx.fill();
  /* دست‌ها */
  ctx.strokeStyle = P.shirt; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(-16, -76 + bob); ctx.lineTo(-34, -48 + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(16, -76 + bob); ctx.lineTo(36, -60 + bob); ctx.stroke();
  ctx.fillStyle = P.skin;
  ctx.beginPath(); ctx.arc(-34, -46 + bob, 6, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(36, -58 + bob, 6, 0, TAU); ctx.fill();
  /* بیل */
  ctx.strokeStyle = P.wood; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(38, -70 + bob); ctx.lineTo(48, 4); ctx.stroke();
  ctx.fillStyle = '#9aa7ae';
  ctx.beginPath();
  ctx.moveTo(40, 0); ctx.lineTo(58, 0); ctx.lineTo(54, 22); ctx.lineTo(44, 22);
  ctx.closePath(); ctx.fill();
  /* سر */
  ctx.fillStyle = P.skin;
  ctx.beginPath(); ctx.arc(0, -104 + bob, 19, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3a2a1c';
  ctx.beginPath(); ctx.arc(-7, -108 + bob, 2.6, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -108 + bob, 2.6, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -100 + bob, 7, .3, 2.8); ctx.stroke();
  /* کلاه */
  ctx.fillStyle = P.hat;
  ctx.beginPath(); ctx.ellipse(0, -118 + bob, 34, 9, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -128 + bob, 17, 14, 0, Math.PI, TAU); ctx.fill();
  ctx.restore();
}

/* ───────── زمین ───────── */

function cropArt(k, x, y, w, h, seed) {
  const C = CROPS[k];
  if (k === 'c') {
    for (let i = 0; i < Math.max(10, w / 9); i++) {
      const px = x + 8 + noise1(seed + i * 2.3) * (w - 16);
      const py = y + 22 + noise1(seed + i * 5.1) * (h - 44);
      ctx.strokeStyle = C.d; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(px, py + 16); ctx.lineTo(px, py); ctx.stroke();
      ctx.fillStyle = i % 3 ? C.c : C.l;
      for (let f = 0; f < 3; f++) {
        const a = -Math.PI / 2 + (f - 1) * .9;
        ctx.beginPath();
        ctx.ellipse(px + Math.cos(a) * 7, py + Math.sin(a) * 6, 6, 4.4, a, 0, TAU);
        ctx.fill();
      }
      if (i % 4 === 0) {
        ctx.fillStyle = P.flower;
        ctx.beginPath(); ctx.arc(px, py - 8, 3.4, 0, TAU); ctx.fill();
      }
    }
    return;
  }
  const awn = k === 'b';
  const rows = Math.max(1, Math.round(h / 78));
  const N = Math.max(6, Math.floor(w / 15));
  for (let i = 0; i < N * rows; i++) {
    const r = Math.floor(i / N);
    const px = x + 7 + noise1(seed + i * 2.7) * (w - 14);
    const base = y + h - 12 - r * (h - 34) / rows;
    const hh = 34 + noise1(seed + i * 4.1) * 20;
    const sw = Math.sin(S.t * 1.4 + i + seed) * 4;
    ctx.strokeStyle = C.d; ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(px, base);
    ctx.quadraticCurveTo(px + sw * .4, base - hh * .6, px + sw, base - hh);
    ctx.stroke();
    /* خوشه */
    ctx.fillStyle = C.c;
    for (let g = 0; g < 5; g++) {
      const t = g / 5;
      ctx.beginPath();
      ctx.ellipse(px + sw * (1 - t * .3), base - hh + 4 + g * 5, 4.4, 3.2, .2, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = C.l;
    ctx.beginPath(); ctx.ellipse(px + sw, base - hh + 2, 3.4, 2.6, 0, 0, TAU); ctx.fill();
    if (awn) {
      ctx.strokeStyle = C.l; ctx.lineWidth = 1.4;
      for (let a2 = -1; a2 <= 1; a2++) {
        ctx.beginPath();
        ctx.moveTo(px + sw, base - hh + 2);
        ctx.lineTo(px + sw + a2 * 7, base - hh - 14);
        ctx.stroke();
      }
    }
  }
}

function drawField() {
  const b = FIELD;
  withShadow(18, 9, .32, () => {
    ctx.fillStyle = P.soilLo;
    ctx.beginPath(); rrPath(b.x - 10, b.y - 10, b.w + 20, b.h + 20, 14); ctx.fill();
  }, '10, 30, 40');
  const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
  g.addColorStop(0, P.soil); g.addColorStop(1, P.soilDk);
  ctx.fillStyle = g;
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.clip();
  /* شیار خاک */
  ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 3;
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.moveTo(b.x, b.y + 12 + i * 17); ctx.lineTo(b.x + b.w, b.y + 12 + i * 17); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(60, 40, 18, .3)';
  for (let i = 0; i < 90; i++) {
    ctx.beginPath();
    ctx.ellipse(b.x + noise1(i * 2.1) * b.w, b.y + noise1(i * 5.3) * b.h, 5, 3, 0, 0, TAU);
    ctx.fill();
  }
  /* هر قسمت */
  const w = cw();
  for (let i = 0; i < S.parts; i++) {
    const x = b.x + i * w;
    const k = S.cells[i];
    if (k) {
      ctx.fillStyle = shade(CROPS[k].d, -.45);
      ctx.fillRect(x, b.y, w, b.h);
      cropArt(k, x, b.y, w, b.h, i * 7 + 3);
    }
    const hot = S.hover && S.hover.k === 'cell' && S.hover.i === i;
    if (hot && !S.tut.on) {
      ctx.fillStyle = 'rgba(255, 244, 200, .14)';
      ctx.fillRect(x, b.y, w, b.h);
    }
  }
  ctx.restore();
  /* مرزِ قسمت‌ها */
  ctx.strokeStyle = P.ridge; ctx.lineWidth = 5;
  for (let i = 1; i < S.parts; i++) {
    const x = b.x + i * cw();
    ctx.beginPath(); ctx.moveTo(x, b.y); ctx.lineTo(x, b.y + b.h); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2;
  for (let i = 1; i < S.parts; i++) {
    const x = b.x + i * cw();
    ctx.beginPath(); ctx.moveTo(x - 2, b.y); ctx.lineTo(x - 2, b.y + b.h); ctx.stroke();
  }
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 5;
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
  /* شمارهٔ هر قسمت */
  for (let i = 0; i < S.parts; i++) {
    const x = b.x + (i + .5) * cw();
    ctx.fillStyle = 'rgba(20, 30, 36, .5)';
    ctx.beginPath(); ctx.arc(x, b.y + b.h + 22, 15, 0, TAU); ctx.fill();
    numText(fa(i + 1), x, b.y + b.h + 22, { size: 15, color: P.card });
  }
}

function drawTapeScene() {
  const b = TAPE;
  const lv = L();
  /* میزِ چوبی */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(b.x - 40, b.y - 130, b.w + 80, 330, 16); ctx.fill();
  ctx.fillStyle = P.wood;
  ctx.beginPath(); rrPath(b.x - 34, b.y - 124, b.w + 68, 318, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(60, 40, 20, .3)'; ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(b.x - 30, b.y - 110 + i * 38); ctx.lineTo(b.x + b.w + 30, b.y - 110 + i * 38);
    ctx.stroke();
  }
  /* شیء بالای نوار */
  const objW = b.w * lv.m / lv.n;
  const oy = b.y - 56;
  if (lv.obj === 'clip') {
    ctx.strokeStyle = '#b9c2c8'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(b.x + 14, oy + 22);
    ctx.lineTo(b.x + objW - 26, oy + 22);
    ctx.quadraticCurveTo(b.x + objW - 2, oy + 22, b.x + objW - 2, oy + 6);
    ctx.quadraticCurveTo(b.x + objW - 2, oy - 10, b.x + objW - 30, oy - 10);
    ctx.lineTo(b.x + 30, oy - 10);
    ctx.quadraticCurveTo(b.x + 8, oy - 10, b.x + 8, oy + 4);
    ctx.stroke();
    ctx.strokeStyle = '#e2e8ec'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b.x + 18, oy + 19); ctx.lineTo(b.x + objW - 30, oy + 19);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#e88fa4';
    withShadow(10, 5, .3, () => {
      ctx.beginPath(); rrPath(b.x + 4, oy - 16, objW - 8, 44, 8); ctx.fill();
    }, '20, 10, 10');
    ctx.fillStyle = '#f7b8c6';
    ctx.beginPath(); rrPath(b.x + 4, oy - 16, objW - 8, 16, 8); ctx.fill();
    ctx.fillStyle = '#5f7fa8';
    ctx.beginPath(); rrPath(b.x + 4, oy + 14, objW - 8, 14, 6); ctx.fill();
  }
  /* خطّ‌چینِ سرِ شیء */
  ctx.save();
  ctx.setLineDash([8, 7]);
  ctx.strokeStyle = 'rgba(255, 250, 220, .8)'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(b.x + objW, oy - 20); ctx.lineTo(b.x + objW, b.y + b.h + 18);
  ctx.stroke();
  ctx.restore();
  text(lv.objN, b.x + objW / 2, oy - 34, { size: 18, family: 'Lalezar', color: '#f4e8c8' });
  /* نوارِ کاغذی */
  withShadow(14, 7, .3, () => {
    ctx.fillStyle = P.tape;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 8); ctx.fill();
  }, '20, 12, 4');
  ctx.save();
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 8); ctx.clip();
  ctx.globalAlpha = .5;
  ctx.fillStyle = texPaper(P.tape);
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.globalAlpha = 1;
  const w = cw();
  for (let i = 0; i < S.parts; i++) {
    if (!S.cells[i]) continue;
    ctx.fillStyle = 'rgba(224, 178, 60, .55)';
    ctx.fillRect(b.x + i * w, b.y, w, b.h);
  }
  const hot = S.hover && S.hover.k === 'cell';
  if (hot && !S.tut.on) {
    ctx.fillStyle = 'rgba(76, 158, 196, .18)';
    ctx.fillRect(b.x + S.hover.i * w, b.y, w, b.h);
  }
  ctx.restore();
  /* خطِ تاها */
  ctx.strokeStyle = P.tapeLine; ctx.lineWidth = 3;
  for (let i = 1; i < S.parts; i++) {
    const x = b.x + i * w;
    ctx.beginPath(); ctx.moveTo(x, b.y); ctx.lineTo(x, b.y + b.h); ctx.stroke();
  }
  ctx.strokeStyle = P.tapeDk; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 8); ctx.stroke();
  for (let i = 0; i < S.parts; i++) {
    numText(fa(i + 1), b.x + (i + .5) * w, b.y + b.h + 20, { size: 15, color: '#f4e8c8' });
  }
}

/* ───────── کارتِ کسر ───────── */

function drawFracCard() {
  paper(FRAC.x, FRAC.y, FRAC.w, FRAC.h, P.paper, 41, 14, .34);
  const cxx = FRAC.x + FRAC.w / 2;
  const k = isTape() ? 'w' : S.sel;
  const m = countOf(k), n = S.parts;
  text('کسرِ ' + (isTape() ? 'رنگ‌شده' : CROPS[k].n), cxx, FRAC.y + 30,
    { size: 19, family: 'Lalezar', color: P.ink });
  /* صورت */
  numText(fa(m), cxx, FRAC.y + 82, { size: 52, family: 'Lalezar', color: P.ink });
  /* خطّ کسری */
  ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cxx - 46, FRAC.y + 118); ctx.lineTo(cxx + 46, FRAC.y + 118);
  ctx.stroke();
  /* مخرج */
  numText(fa(n), cxx, FRAC.y + 154, { size: 52, family: 'Lalezar', color: P.ink });
  /* نام‌ها */
  ctx.strokeStyle = P.inkSoft; ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(cxx + 34, FRAC.y + 82); ctx.lineTo(cxx + 74, FRAC.y + 74); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cxx + 50, FRAC.y + 118); ctx.lineTo(cxx + 74, FRAC.y + 114); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cxx + 34, FRAC.y + 154); ctx.lineTo(cxx + 74, FRAC.y + 158); ctx.stroke();
  ctx.setLineDash([]);
  text('صورت', cxx + 108, FRAC.y + 72, { size: 14, color: P.inkSoft });
  text('خطّ کسری', cxx + 118, FRAC.y + 113, { size: 14, color: P.inkSoft });
  text('مخرج', cxx + 106, FRAC.y + 158, { size: 14, color: P.inkSoft });
  /* خواندن */
  ctx.fillStyle = 'rgba(76, 158, 196, .16)';
  ctx.beginPath(); rrPath(FRAC.x + 18, FRAC.y + FRAC.h - 54, FRAC.w - 36, 40, 10); ctx.fill();
  text(m > 0 && m <= 10 && n <= 10 ? fracWord(m, n) + (isTape() ? 'ِ نوار' : 'ِ زمین') : '—',
    cxx, FRAC.y + FRAC.h - 34, { size: 20, family: 'Lalezar', color: P.ink });
}

function drawAsk() {
  paper(ASK.x, ASK.y, ASK.w, ASK.h, P.card, 51, 14, .34);
  ctx.fillStyle = 'rgba(224, 166, 63, .22)';
  ctx.beginPath(); rrPath(ASK.x, ASK.y, ASK.w, 30, 8); ctx.fill();
  text(isTape() ? 'نوارِ کاغذیِ فاطمه' : 'سفارشِ علی‌آقا', ASK.x + ASK.w / 2, ASK.y + 16,
    { size: 17, family: 'Lalezar', color: P.ink });
  textWrap(L().ask, ASK.x + ASK.w / 2, ASK.y + 62, ASK.w - 34,
    { size: 17, color: P.ink, lineHeight: 27 });
}

function drawPalette() {
  if (isTape()) {
    paper(PAL.x, PAL.y, PAL.w, PAL.h, P.card, 61, 14, .34);
    text('رنگِ مداد', PAL.x + PAL.w / 2, PAL.y + 30, { size: 18, family: 'Lalezar', color: P.ink });
    textWrap('روی هر قسمت بزن تا رنگ شود.', PAL.x + PAL.w / 2, PAL.y + 68, PAL.w - 40,
      { size: 15, color: P.inkSoft, lineHeight: 24 });
    ctx.fillStyle = 'rgba(224, 178, 60, .55)';
    ctx.beginPath(); rrPath(PAL.x + 40, PAL.y + 100, PAL.w - 80, 34, 8); ctx.fill();
    ctx.strokeStyle = P.tapeLine; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(PAL.x + 40, PAL.y + 100, PAL.w - 80, 34, 8); ctx.stroke();
    return;
  }
  paper(PAL.x, PAL.y, PAL.w, PAL.h, P.card, 61, 14, .34);
  text('چه بکارم؟', PAL.x + PAL.w / 2, PAL.y + 24, { size: 18, family: 'Lalezar', color: P.ink });
  for (let i = 0; i < 3; i++) {
    const k = CKEYS[i], b = palBtn(i), on = S.sel === k;
    const hot = S.hover && S.hover.k === 'pal' && S.hover.i === i;
    ctx.fillStyle = on ? CROPS[k].c : (hot ? 'rgba(0,0,0,.08)' : 'rgba(0,0,0,.04)');
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 9); ctx.fill();
    ctx.strokeStyle = on ? CROPS[k].d : 'rgba(110, 132, 146, .4)';
    ctx.lineWidth = on ? 3 : 2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 9); ctx.stroke();
    ctx.save();
    ctx.beginPath(); rrPath(b.x + 6, b.y + 4, 46, b.h - 8, 6); ctx.clip();
    ctx.fillStyle = shade(CROPS[k].d, -.3);
    ctx.fillRect(b.x + 6, b.y + 4, 46, b.h - 8);
    cropArt(k, b.x + 6, b.y - 16, 46, b.h + 12, i * 3 + 1);
    ctx.restore();
    text(CROPS[k].n, b.x + b.w - 16, b.y + b.h / 2,
      { size: 17, color: on ? '#3a2a10' : P.ink, align: 'right' });
    const cnt = countOf(k);
    if (cnt) numText(fa(cnt), b.x + 74, b.y + b.h / 2, { size: 16, color: on ? '#3a2a10' : P.inkSoft });
  }
}

function drawDial() {
  const cxx = (BTN_MINUS.x + BTN_PLUS.x + BTN_PLUS.w) / 2;
  text(isTape() ? 'نوار را به چند قسمتِ مساوی تا کنیم؟' : 'زمین را به چند قسمتِ مساوی تقسیم کنیم؟',
    cxx, DIAL_Y - 22, { size: 19, family: 'Lalezar', color: '#eaf4f8' });
  button(BTN_MINUS, '−', {
    hot: S.hover && S.hover.k === 'minus', disabled: S.parts <= 2,
    fill: '#4a6a7a', hotFill: '#5d8496', size: 40, family: 'Lalezar',
  });
  button(BTN_PLUS, '+', {
    hot: S.hover && S.hover.k === 'plus', disabled: S.parts >= 10,
    fill: '#4a6a7a', hotFill: '#5d8496', size: 40, family: 'Lalezar',
  });
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.beginPath(); rrPath(BTN_MINUS.x + 104, DIAL_Y, 380, 76, 14); ctx.fill();
  numText(fa(S.parts), cxx, DIAL_Y + 38, { size: 44, family: 'Lalezar', color: P.gold });
  text('قسمت', cxx + 86, DIAL_Y + 40, { size: 20, color: '#dceaf0' });
}

/* ───────── سردر و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = 'rgba(14, 26, 34, .86)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224, 166, 63, .28)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text('مزرعهٔ علی‌آقا', SCENE_W - 116, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  for (let k = 0; k < LV.length; k++) {
    const x = 470 + k * 34;
    ctx.fillStyle = k < S.lv ? P.good : k === S.lv ? P.gold : 'rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2, k === S.lv ? 9 : 6, 0, TAU); ctx.fill();
  }
  numText(fa(S.score), 120, HUD_H / 2, { size: 22, color: P.gold });
  text('امتیاز', 190, HUD_H / 2, { size: 16, color: 'rgba(255,255,255,.7)' });
  numText(fa(S.best), 268, HUD_H / 2, { size: 18, color: 'rgba(255,255,255,.6)' });
  text('بهترین', 340, HUD_H / 2, { size: 14, color: 'rgba(255,255,255,.45)' });
}

function drawTutorial() {
  const b = box();
  if (S.tut.step === 0) {
    spot([{ x: ASK.x - 6, y: ASK.y - 6, w: ASK.w + 12, h: ASK.h + 12 }], .7);
    const h = tutCard(420, 250, 560,
      ['علی‌آقا هر بار یک سفارش می‌دهد،', 'با حرف — نه با عدد.'], 'مزرعهٔ علی‌آقا');
    tutMore(700, 250 + h + 8, S.t, P.ink);
  } else if (S.tut.step === 1) {
    spot([{ x: BTN_MINUS.x - 10, y: DIAL_Y - 44, w: BTN_PLUS.x + BTN_PLUS.w - BTN_MINUS.x + 20, h: 130 }], .68);
    const h = tutCard(360, 180, 600,
      ['با − و + زمین را به قسمت‌های مساوی تقسیم کن.', 'همین عدد، مخرجِ کسر است.']);
    tutMore(660, 180 + h + 8, S.t, P.ink);
  } else {
    spot([{ x: b.x - 8, y: b.y - 8, w: b.w + 16, h: b.h + 16 },
      { x: FRAC.x - 6, y: FRAC.y - 6, w: FRAC.w + 12, h: FRAC.h + 12 }], .66);
    const h = tutCard(360, 596, 600,
      ['روی هر قسمت بزن تا کاشته شود؛ صورتِ کسر یکی زیاد می‌شود.', 'آخرش دکمهٔ «به علی‌آقا نشان بده» را بزن.']);
    tutMore(660, 596 - 78, S.t, P.ink);
  }
}

function fracIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  numText('۲', 0, -18, { size: 30, family: 'Lalezar', color: P.ink });
  ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-18, 2); ctx.lineTo(18, 2); ctx.stroke();
  numText('۳', 0, 22, { size: 30, family: 'Lalezar', color: P.ink });
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 900, h: 342, y: 130,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: P.inkSoft,
    icon: fracIcon,
    title: 'مزرعهٔ علی‌آقا',
    body: 'علی‌آقا زمینش را به قسمت‌های مساوی تقسیم می‌کند و در بعضی از آن‌ها\nمی‌کارد. تو باید همان‌قدری را بکاری که او می‌خواهد.\nپایینِ کسر یعنی زمین چند قسمت شده، بالایش یعنی چند قسمت کاشته‌ای.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#a5763a', btnHotFill: '#c08d47',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 920, h: 340, y: 134,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    icon: fracIcon,
    title: 'همهٔ سفارش‌ها انجام شد',
    body: 'دیدی که یک کسر دو خبر می‌دهد: مخرج می‌گوید به چند قسمتِ مساوی\nتقسیم شده و صورت می‌گوید چندتای آن‌ها را برداشته‌ای —\nچه زمینِ علی‌آقا باشد، چه نوارِ کاغذیِ فاطمه.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#a5763a', btnHotFill: '#c08d47',
  });
}

/* ───────── قاب ───────── */

function draw() {
  beginScene(P.sky);
  ctx.save();
  if (S.shake > 0) ctx.translate(Math.sin(S.t * 55) * S.shake * 10, 0);
  paintScene();
  if (isTape()) drawTapeScene(); else { drawField(); drawFarmer(1108, 700); }
  drawDial();
  drawAsk();
  drawFracCard();
  drawPalette();
  button(BTN_CHECK, 'به علی‌آقا نشان بده', {
    hot: S.hover && S.hover.k === 'check', fill: '#4f8f4a', hotFill: '#63a55c', size: 21,
  });
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
    const w = 640;
    paper(FIELD.x + FIELD.w / 2 - w / 2, SCENE_H - 48, w, 40, P.card, 91, 12, .3);
    text(S.tip, FIELD.x + FIELD.w / 2, SCENE_H - 28, { size: 17, color: P.ink });
    ctx.restore();
  }
  endScene(.1, 'rgba(10, 30, 40, .34)', .22, .12);
}

/*!
title: کششِ زمین — نیرو همه‌جا (آزمایش)
bg: #1b2333
*/

/* ═══════════════════════════════════════════════════════════════════════
   کششِ زمین — علومِ سوم، درس ۹ «نیرو همه‌جا (۱)»

   آزمایشِ کتاب: «زمین چه اجسامی را با نیروی بیشتری به طرفِ خود
   می‌کشد؟ اجسام را در دست بگیرید و سنگینی‌شان را مقایسه کنید. جرمِ
   هرکدام را با ترازو اندازه بگیرید. به فنر وصل کنید و طولِ فنر را
   اندازه بگیرید و در جدول بنویسید.»

   همان جدول اینجاست و خودش پر نمی‌شود: هر جسم را باید اوّل روی ترازو
   بگذاری و بعد به فنر آویزان کنی، بعد ثبت کنی. آخرِ کار هم باید
   خودت اجسام را از پرکشش‌ترین به کم‌کشش‌ترین بچینی.

   ── درستیِ فیزیکی ───────────────────────────────────────────────
   فنر از قانونِ هوک پیروی می‌کند و وزن از قانونِ گرانش:

        وزن = جرم × شتابِ گرانش (۹٫۸۱ نیوتون بر کیلوگرم)
        کشیدگیِ فنر = وزن ÷ ثابتِ فنر
        طولِ فنر = طولِ آزاد + کشیدگی

   ثابتِ فنر ۴۹ نیوتون بر متر است؛ پس نیم‌کیلو آب فنر را ۱۰ سانتی‌متر
   می‌کشد. جرم‌ها هم جرم‌های واقعیِ همان چیزهاست. هیچ عددی دستی
   نوشته نشده — همه از همین دو قانون درمی‌آید.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  bg:    '#1b2333', bgLo: '#121824', bgHi: '#28344a',
  wood:  '#96703f', woodDk: '#5b4526', woodLt: '#c39a63',
  steel: '#9aa9ba', steelDk: '#5d6a79', steelLt: '#d6e0ea',
  paper: '#fbf7ec', card: '#ffffff',
  ink:   '#1e2733', inkSoft: '#78838f',
  good:  '#4e9f6c', bad: '#c04a34', gold: '#e0a63f', accent: '#5b8fd6',
  apple: '#d34b47', appleLf: '#4e9f5c', water: '#68b6d8', ball: '#c9d84a',
  rock:  '#8a8f96', book: '#7f5aa8', rubber: '#e8829f',
};

/* ───────── قانونِ فنر و وزن ───────── */

const G = 9.81;                /* نیوتون بر کیلوگرم */
const K_SPRING = 49;           /* نیوتون بر متر */
const L0_CM = 8;               /* طولِ آزادِ فنر، سانتی‌متر */
const PXCM = 17;               /* پیکسل بر سانتی‌متر */

/** طولِ فنر وقتی جسمی به جرمِ m گرم از آن آویزان است. */
function springLen(gramme) {
  const w = gramme / 1000 * G;             /* نیوتون */
  const x = w / K_SPRING * 100;            /* سانتی‌متر */
  return L0_CM + x;
}

const OBJS = [
  { id: 'pak',   n: 'پاک‌کن',        g: 20 },
  { id: 'tenis', n: 'توپِ تنیس',     g: 58 },
  { id: 'sib',   n: 'سیب',           g: 150 },
  { id: 'sang',  n: 'سنگ',           g: 240 },
  { id: 'ketab', n: 'کتاب',          g: 350 },
  { id: 'botri', n: 'بطریِ نیم‌لیتری آب', g: 500 },
];
const objBy = (id) => OBJS.find((o) => o.id === id);
const NEED = 4;

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  onScale: null, onHook: null,
  weighed: {},                /* شناسه → جرمِ خوانده‌شده */
  rows: [],                   /* {id, g, len} */
  order: [null, null, null, null],
  mark: null, markT: 0,
  drag: null,                 /* {id, x, y, from} */
  springT: 0, springV: 0, springL: L0_CM,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
function tip(msg) { S.tip = msg; S.tipT = 3.6; }

const hungMass = () => (S.onHook ? objBy(S.onHook).g : 0);
const targetLen = () => springLen(hungMass());
const recorded = (id) => S.rows.some((r) => r.id === id);

/* ───────── جای‌ها ───────── */

const PAN = { x: 24, y: 96, w: 320, h: 640 };
const STAND = { x: 360, y: 96, w: 430, h: 640 };
const SHELF = { x: 806, y: 96, w: 370, h: 400 };
const SCALE = { x: 806, y: 512, w: 370, h: 224 };

const SPRING_X = STAND.x + 232;
const SPRING_TOP = STAND.y + 96;
const BTN_REC = { x: PAN.x + 16, y: PAN.y + 470, w: PAN.w - 32, h: 56 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };
const BTN_CHECK = { x: SCENE_W / 2 - 150, y: 634, w: 300, h: 60 };

function shelfSlot(i) {
  const c = i % 2, r = (i / 2) | 0;
  return { x: SHELF.x + 22 + c * 172, y: SHELF.y + 66 + r * 110, w: 150, h: 96 };
}
const HOOK = () => ({ x: SPRING_X, y: SPRING_TOP + S.springL * PXCM });
const PAN_SCALE = { x: SCALE.x + 96, y: SCALE.y + 92, w: 180, h: 20 };
/* جای ۱ سمتِ راست است: از پرکشش‌ترین به کم‌کشش‌ترین */
function orderSlot(i) { return { x: 1000 - i * 210, y: 462, w: 180, h: 132 }; }
function poolSlot(i) { return { x: 1000 - i * 210, y: 232, w: 180, h: 132 }; }

/* ───────── ورودی ───────── */

function pickFrom(id, from) {
  S.drag = { id, x: 0, y: 0, from };
  if (from === 'scale') S.onScale = null;
  if (from === 'hook') S.onHook = null;
  sfx.tap();
}

function dropDrag(p) {
  const d = S.drag;
  if (!d) return;
  S.drag = null;
  if (inRect(p, SCALE)) {
    if (S.onScale && S.onScale !== d.id) { tip('اوّل این را از ترازو بردار.'); sfx.nope(); return; }
    S.onScale = d.id;
    S.weighed[d.id] = objBy(d.id).g;
    sfx.place();
    return;
  }
  const h = HOOK();
  if (Math.hypot(p.x - h.x, p.y - h.y) < 150 && p.x > STAND.x && p.x < STAND.x + STAND.w) {
    if (S.onHook && S.onHook !== d.id) { tip('اوّل این را از فنر بردار.'); sfx.nope(); return; }
    S.onHook = d.id;
    sfx.place();
    return;
  }
  sfx.pop();
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.drag) { S.drag.x = p.x; S.drag.y = p.y; return; }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else if (S.phase === 'order') {
    if (inRect(p, BTN_CHECK)) S.hover = { k: 'check' };
    for (let i = 0; i < 4; i++) if (inRect(p, orderSlot(i))) S.hover = { k: 'slot', i };
  } else {
    if (inRect(p, BTN_REC)) S.hover = { k: 'rec' };
    for (let i = 0; i < OBJS.length; i++) if (inRect(p, shelfSlot(i))) S.hover = { k: 'obj', i };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  const cap = () => { try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ } };
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { S.phase = 'lab'; S.phaseT = 0; sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) {
      S.phase = 'intro'; S.phaseT = 0;
      S.rows = []; S.weighed = {}; S.onScale = null; S.onHook = null;
      S.order = [null, null, null, null]; S.mark = null;
      sfx.tap();
    }
    return;
  }
  if (S.phase === 'order') {
    if (inRect(p, BTN_CHECK)) { checkOrder(); return; }
    /* برداشتن از جای چیدمان */
    for (let i = 0; i < 4; i++) {
      if (!inRect(p, orderSlot(i)) || !S.order[i]) continue;
      S.drag = { id: S.order[i], x: p.x, y: p.y, from: 'order' + i };
      S.order[i] = null; S.mark = null; cap(); sfx.tap();
      return;
    }
    /* برداشتن از ردیفِ پایین */
    const rest = S.rows.filter((r) => S.order.indexOf(r.id) < 0);
    for (let i = 0; i < rest.length; i++) {
      if (!inRect(p, poolSlot(i))) continue;
      S.drag = { id: rest[i].id, x: p.x, y: p.y, from: 'pool' };
      S.mark = null; cap(); sfx.tap();
      return;
    }
    return;
  }
  if (inRect(p, BTN_REC)) { record(); return; }
  if (S.onScale) {
    const b = PAN_SCALE;
    if (Math.abs(p.x - (b.x + b.w / 2)) < 90 && Math.abs(p.y - (b.y - 40)) < 80) {
      pickFrom(S.onScale, 'scale'); S.drag.x = p.x; S.drag.y = p.y; cap(); return;
    }
  }
  if (S.onHook) {
    const h = HOOK();
    if (Math.hypot(p.x - h.x, p.y - h.y - 44) < 70) {
      pickFrom(S.onHook, 'hook'); S.drag.x = p.x; S.drag.y = p.y; cap(); return;
    }
  }
  for (let i = 0; i < OBJS.length; i++) {
    if (!inRect(p, shelfSlot(i))) continue;
    const id = OBJS[i].id;
    if (S.onScale === id || S.onHook === id) return;
    pickFrom(id, 'shelf'); S.drag.x = p.x; S.drag.y = p.y; cap();
    return;
  }
});

function release(e) {
  if (!S.drag) return;
  const p = { x: S.drag.x, y: S.drag.y };
  if (S.phase === 'order') {
    for (let i = 0; i < 4; i++) {
      if (!inRect(p, orderSlot(i)) || S.order[i]) continue;
      S.order[i] = S.drag.id; S.drag = null; sfx.place(); return;
    }
    S.drag = null; sfx.pop();
    return;
  }
  dropDrag(p);
}
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

function record() {
  if (!S.onHook) { tip('اوّل یک جسم به فنر آویزان کن.'); S.shake = .1; sfx.nope(); return; }
  const id = S.onHook;
  if (recorded(id)) { tip('این را ثبت کرده‌ای.'); return; }
  if (S.weighed[id] === undefined) { tip('جرمش را هنوز با ترازو اندازه نگرفته‌ای.'); S.shake = .12; sfx.nope(); return; }
  if (Math.abs(S.springL - targetLen()) > .4) { tip('صبر کن فنر آرام بگیرد.'); return; }
  S.rows.push({ id, g: objBy(id).g, len: targetLen() });
  sfx.good();
  bits.confetti(PAN.x + PAN.w / 2, PAN.y + 300, 16, [P.good, P.gold, P.card]);
  if (S.rows.length >= NEED) {
    S.phase = 'order'; S.phaseT = 0;
    toast.say('حالا بچین', 'good');
  } else toast.say('ثبت شد', 'good');
}

function checkOrder() {
  if (S.order.some((o) => !o)) { tip('هر چهار جا را پر کن.'); S.shake = .1; sfx.nope(); return; }
  const want = S.rows.slice().sort((a, b) => b.g - a.g).map((r) => r.id);
  S.mark = S.order.map((id, i) => id === want[i]);
  S.markT = 2.6;
  if (S.mark.every(Boolean)) {
    sfx.win();
    S.phase = 'won'; S.phaseT = 0;
  } else { sfx.nope(); S.shake = .14; }
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.markT > 0) S.markT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  /* فنر با نوسانِ میرا به طولِ تازه می‌رسد */
  const tgt = targetLen();
  S.springV += (tgt - S.springL) * 90 * dt;
  S.springV *= Math.exp(-8 * dt);
  S.springL += S.springV * dt;
  if (Math.abs(tgt - S.springL) < .01 && Math.abs(S.springV) < .05) { S.springL = tgt; S.springV = 0; }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => runLoop(step));

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

const faNum = (v, d) => fa(v.toFixed(d)).replace('.', '٫');

/* ───────── اجسام ───────── */

function drawObj(id, x, y, k) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  if (id === 'sib') {
    ctx.fillStyle = ball(0, 0, 28, '#f08a72', P.apple, '#9c2f2c');
    wobbleCircle(0, 2, 27, 3, 1.6); ctx.fill();
    ctx.strokeStyle = '#6b4526'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(3, -38); ctx.stroke();
    ctx.fillStyle = P.appleLf;
    wobbleEllipse(14, -36, 13, 7, -.5, 5, 1); ctx.fill();
  } else if (id === 'tenis') {
    ctx.fillStyle = ball(0, 0, 24, '#e6f07a', P.ball, '#8a9a2c');
    wobbleCircle(0, 0, 23, 7, 1.2); ctx.fill();
    ctx.strokeStyle = '#fbfbee'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(-26, 0, 22, -.7, .7); ctx.stroke();
    ctx.beginPath(); ctx.arc(26, 0, 22, Math.PI - .7, Math.PI + .7); ctx.stroke();
  } else if (id === 'botri') {
    ctx.fillStyle = 'rgba(190,225,240,.5)';
    ctx.beginPath(); rrPath(-20, -46, 40, 88, 12); ctx.fill();
    ctx.fillStyle = P.water;
    ctx.beginPath(); rrPath(-17, -18, 34, 57, 9); ctx.fill();
    ctx.fillStyle = '#dfe8f2';
    ctx.beginPath(); rrPath(-9, -60, 18, 18, 5); ctx.fill();
    ctx.fillStyle = '#4f7fc4';
    ctx.beginPath(); rrPath(-11, -66, 22, 10, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.beginPath(); rrPath(-14, -40, 6, 70, 3); ctx.fill();
  } else if (id === 'sang') {
    ctx.fillStyle = ball(0, 0, 30, '#b4b9bf', P.rock, '#5d636a');
    wobbleCircle(0, 0, 28, 11, 3.4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    wobbleEllipse(-9, -10, 11, 6, -.4, 3, 1); ctx.fill();
  } else if (id === 'ketab') {
    ctx.fillStyle = '#4e3670';
    ctx.beginPath(); rrPath(-32, -24, 64, 50, 5); ctx.fill();
    ctx.fillStyle = P.book;
    ctx.beginPath(); rrPath(-32, -28, 64, 50, 5); ctx.fill();
    ctx.fillStyle = '#f2eee2';
    ctx.beginPath(); rrPath(24, -24, 8, 42, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.beginPath(); rrPath(-24, -20, 34, 5, 2); ctx.fill();
    ctx.beginPath(); rrPath(-24, -8, 26, 5, 2); ctx.fill();
  } else {
    ctx.fillStyle = '#c05f7c';
    ctx.beginPath(); rrPath(-26, -12, 52, 26, 6); ctx.fill();
    ctx.fillStyle = P.rubber;
    ctx.beginPath(); rrPath(-26, -16, 52, 26, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    ctx.beginPath(); rrPath(-20, -12, 30, 5, 2); ctx.fill();
  }
  ctx.restore();
}

/* ───────── پایه و فنر ───────── */

function drawStand() {
  ctx.fillStyle = '#151d2b';
  ctx.beginPath(); rrPath(STAND.x, STAND.y, STAND.w, STAND.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(91,143,214,.2)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(STAND.x, STAND.y, STAND.w, STAND.h, 16); ctx.stroke();
  text('فنر و خط‌کش', STAND.x + STAND.w - 20, STAND.y + 28,
    { size: 16, color: 'rgba(236,242,250,.5)', align: 'right' });

  /* پایهٔ فلزی */
  const baseY = STAND.y + STAND.h - 40;
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(SPRING_X + 60, STAND.y + 52, 20, baseY - STAND.y - 52, 6); ctx.fill();
  ctx.fillStyle = P.steel;
  ctx.beginPath(); rrPath(SPRING_X + 62, STAND.y + 52, 12, baseY - STAND.y - 52, 5); ctx.fill();
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(SPRING_X - 40, baseY, 160, 22, 8); ctx.fill();
  ctx.fillStyle = P.steel;
  ctx.beginPath(); rrPath(SPRING_X - 40, baseY - 4, 160, 20, 8); ctx.fill();
  /* بازوی افقی */
  ctx.fillStyle = P.steel;
  ctx.beginPath(); rrPath(SPRING_X - 14, SPRING_TOP - 22, 96, 16, 6); ctx.fill();

  /* خط‌کشِ عمودی */
  const rx = SPRING_X - 118;
  ctx.fillStyle = '#f0e6c8';
  ctx.beginPath(); rrPath(rx - 26, SPRING_TOP - 10, 52, 24 * PXCM + 20, 8); ctx.fill();
  ctx.strokeStyle = '#c9b98d'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(rx - 26, SPRING_TOP - 10, 52, 24 * PXCM + 20, 8); ctx.stroke();
  for (let c = 0; c <= 24; c++) {
    const y = SPRING_TOP + c * PXCM;
    const big = c % 5 === 0;
    ctx.strokeStyle = '#8a7c58'; ctx.lineWidth = big ? 2 : 1.2;
    ctx.beginPath();
    ctx.moveTo(rx + 18, y); ctx.lineTo(rx + 18 - (big ? 18 : 10), y);
    ctx.stroke();
    if (big) numText(fa(c), rx - 12, y, { size: 12, color: '#6b6047' });
  }

  /* فنر */
  const h = HOOK();
  ctx.save();
  ctx.strokeStyle = P.steelLt; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  const coils = 12, len = h.y - SPRING_TOP;
  for (let i = 0; i <= 90; i++) {
    const u = i / 90;
    const y = SPRING_TOP + u * len;
    const x = SPRING_X + Math.sin(u * coils * TAU) * 15;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 90; i++) {
    const u = i / 90;
    const y = SPRING_TOP + u * len + 2;
    const x = SPRING_X + Math.sin(u * coils * TAU) * 15;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
  /* قلّاب */
  ctx.strokeStyle = P.steel; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(h.x, h.y + 8, 9, Math.PI * .1, Math.PI * 1.9); ctx.stroke();

  /* جسمِ آویزان */
  if (S.onHook) {
    drawObj(S.onHook, h.x, h.y + 52, 1);
    /* پیکانِ کششِ زمین */
    const w = objBy(S.onHook).g / 1000 * G;
    const al = clamp(26 + w * 22, 26, 92);
    ctx.save();
    ctx.strokeStyle = P.gold; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(h.x - 62, h.y + 40); ctx.lineTo(h.x - 62, h.y + 40 + al);
    ctx.stroke();
    ctx.fillStyle = P.gold;
    ctx.beginPath();
    ctx.moveTo(h.x - 62, h.y + 50 + al);
    ctx.lineTo(h.x - 71, h.y + 36 + al);
    ctx.lineTo(h.x - 53, h.y + 36 + al);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* خواندنِ طولِ فنر */
  const bx = STAND.x + 20, by = STAND.y + STAND.h - 76;
  ctx.fillStyle = 'rgba(251,247,236,.94)';
  ctx.beginPath(); rrPath(bx, by, 230, 46, 12); ctx.fill();
  text('طولِ فنر', bx + 216, by + 23, { size: 14, color: P.inkSoft, align: 'right' });
  numText(faNum(S.springL, 1), bx + 96, by + 23, { size: 20, color: P.ink });
  text('سانتی‌متر', bx + 16, by + 23, { size: 11, color: P.inkSoft, align: 'left' });
}

function drawShelf() {
  ctx.fillStyle = '#151d2b';
  ctx.beginPath(); rrPath(SHELF.x, SHELF.y, SHELF.w, SHELF.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(91,143,214,.2)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(SHELF.x, SHELF.y, SHELF.w, SHELF.h, 16); ctx.stroke();
  text('چیزها', SHELF.x + SHELF.w - 20, SHELF.y + 28,
    { size: 16, color: 'rgba(236,242,250,.5)', align: 'right' });
  OBJS.forEach((o, i) => {
    const b = shelfSlot(i);
    const away = S.onScale === o.id || S.onHook === o.id || (S.drag && S.drag.id === o.id);
    const done = recorded(o.id);
    ctx.fillStyle = away ? 'rgba(255,255,255,.03)' : (done ? 'rgba(78,159,108,.16)' : 'rgba(255,255,255,.07)');
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.fill();
    ctx.strokeStyle = done ? 'rgba(78,159,108,.6)' : 'rgba(214,224,234,.22)'; ctx.lineWidth = 2;
    ctx.setLineDash(away ? [6, 6] : []);
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.stroke();
    ctx.setLineDash([]);
    if (!away) {
      ctx.save();
      ctx.globalAlpha = 1;
      drawObj(o.id, b.x + b.w / 2, b.y + 44, .62);
      ctx.restore();
    }
    text(o.n, b.x + b.w / 2, b.y + b.h - 14,
      { size: o.n.length > 12 ? 12 : 14, color: 'rgba(236,242,250,.8)' });
  });
}

function drawScale() {
  ctx.fillStyle = '#151d2b';
  ctx.beginPath(); rrPath(SCALE.x, SCALE.y, SCALE.w, SCALE.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(91,143,214,.2)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(SCALE.x, SCALE.y, SCALE.w, SCALE.h, 16); ctx.stroke();
  text('ترازو', SCALE.x + SCALE.w - 20, SCALE.y + 28,
    { size: 16, color: 'rgba(236,242,250,.5)', align: 'right' });
  /* جسمِ روی ترازو */
  if (S.onScale) drawObj(S.onScale, PAN_SCALE.x + PAN_SCALE.w / 2, PAN_SCALE.y - 6, .82);
  /* کفه */
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(PAN_SCALE.x - 6, PAN_SCALE.y, PAN_SCALE.w + 12, PAN_SCALE.h, 6); ctx.fill();
  ctx.fillStyle = P.steel;
  ctx.beginPath(); rrPath(PAN_SCALE.x, PAN_SCALE.y - 3, PAN_SCALE.w, PAN_SCALE.h - 3, 6); ctx.fill();
  /* بدنه */
  ctx.fillStyle = '#3d4757';
  ctx.beginPath(); rrPath(SCALE.x + 60, PAN_SCALE.y + 20, 250, 76, 12); ctx.fill();
  /* نمایشگر */
  ctx.fillStyle = '#0d1a14';
  ctx.beginPath(); rrPath(SCALE.x + 96, PAN_SCALE.y + 36, 178, 44, 8); ctx.fill();
  const g = S.onScale ? objBy(S.onScale).g : 0;
  numText(fa(g), SCALE.x + 168, PAN_SCALE.y + 58, { size: 26, color: '#7fe3a2' });
  text('گرم', SCALE.x + 230, PAN_SCALE.y + 58, { size: 14, color: '#4e9f6c' });
}

/* ───────── دفترچه ───────── */

function drawPanel() {
  paper(PAN.x, PAN.y, PAN.w, PAN.h, P.paper, 31, 16, .4);
  ctx.fillStyle = P.accent;
  ctx.beginPath(); rrPath(PAN.x, PAN.y, PAN.w, 10, 5); ctx.fill();
  text('جدولِ من', PAN.x + PAN.w / 2, PAN.y + 44, { size: 26, family: 'Lalezar', color: P.ink });
  text('اوّل ترازو، بعد فنر، بعد ثبت', PAN.x + PAN.w / 2, PAN.y + 74, { size: 14, color: P.inkSoft });

  /* سرستون */
  const x0 = PAN.x + 14, w = PAN.w - 28;
  ctx.fillStyle = '#e7e3d4';
  ctx.beginPath(); rrPath(x0, PAN.y + 92, w, 32, 8); ctx.fill();
  text('جسم', x0 + w - 14, PAN.y + 108, { size: 13, color: P.inkSoft, align: 'right' });
  text('جرم', x0 + 118, PAN.y + 108, { size: 13, color: P.inkSoft });
  text('طولِ فنر', x0 + 44, PAN.y + 108, { size: 13, color: P.inkSoft });
  for (let i = 0; i < NEED; i++) {
    const y = PAN.y + 130 + i * 46;
    const r = S.rows[i];
    ctx.fillStyle = r ? '#f4f1e4' : '#eceadd';
    ctx.beginPath(); rrPath(x0, y, w, 40, 8); ctx.fill();
    if (!r) { text('—', x0 + w / 2, y + 20, { size: 16, color: '#c3c0b0' }); continue; }
    text(objBy(r.id).n, x0 + w - 12, y + 20,
      { size: objBy(r.id).n.length > 12 ? 11 : 13, color: P.ink, align: 'right' });
    numText(fa(r.g), x0 + 118, y + 20, { size: 15, color: P.ink });
    numText(faNum(r.len, 1), x0 + 44, y + 20, { size: 15, color: P.accent });
  }

  /* نمودارِ جرم و کشیدگی */
  const gx = x0 + 12, gy = PAN.y + 330, gw = w - 34, gh = 116;
  ctx.fillStyle = '#eceadd';
  ctx.beginPath(); rrPath(gx - 10, gy - 12, gw + 22, gh + 34, 10); ctx.fill();
  ctx.strokeStyle = '#b9b5a2'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gx + gw, gy); ctx.lineTo(gx + gw, gy + gh); ctx.lineTo(gx, gy + gh);
  ctx.stroke();
  text('جرم ←', gx + gw / 2, gy + gh + 14, { size: 11, color: P.inkSoft });
  for (const r of S.rows) {
    const px = gx + gw - (r.g / 520) * gw;
    const py = gy + gh - ((r.len - L0_CM) / 12) * gh;
    ctx.fillStyle = P.accent;
    ctx.beginPath(); ctx.arc(px, py, 5.4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(px - 1.4, py - 1.4, 2, 0, TAU); ctx.fill();
  }

  button(BTN_REC, 'ثبت کن', {
    hot: S.hover && S.hover.k === 'rec', fill: '#3f6fb5', hotFill: '#5b8fd6', size: 24 });
}

/* ───────── پردهٔ چیدن ───────── */

function drawOrder() {
  ctx.fillStyle = 'rgba(16, 22, 34, .96)';
  ctx.fillRect(0, HUD_H, SCENE_W, SCENE_H - HUD_H);
  text('زمین کدام را با نیروی بیشتری می‌کشد؟', SCENE_W / 2, 132,
    { size: 30, family: 'Lalezar', color: P.paper });
  text('از پرکشش‌ترین تا کم‌کشش‌ترین بچین', SCENE_W / 2, 176,
    { size: 17, color: 'rgba(236,242,250,.66)' });

  const rest = S.rows.filter((r) => S.order.indexOf(r.id) < 0);
  rest.forEach((r, i) => {
    const b = poolSlot(i);
    if (S.drag && S.drag.id === r.id) return;
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(214,224,234,.28)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.stroke();
    drawObj(r.id, b.x + b.w / 2, b.y + 64, .68);
    text(objBy(r.id).n, b.x + b.w / 2, b.y + b.h - 16,
      { size: objBy(r.id).n.length > 12 ? 11 : 13, color: 'rgba(236,242,250,.8)' });
  });

  text('بیشترین', orderSlot(0).x + 90, 428, { size: 16, color: P.gold });
  text('کمترین', orderSlot(3).x + 90, 428, { size: 16, color: 'rgba(236,242,250,.55)' });
  ctx.strokeStyle = 'rgba(224,166,63,.4)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(orderSlot(0).x + 20, 428); ctx.lineTo(orderSlot(3).x + 160, 428);
  ctx.setLineDash([7, 7]); ctx.stroke(); ctx.setLineDash([]);

  for (let i = 0; i < 4; i++) {
    const b = orderSlot(i);
    const hot = S.hover && S.hover.k === 'slot' && S.hover.i === i;
    const ok = (S.mark && S.markT > 0) ? S.mark[i] : null;
    ctx.fillStyle = ok === true ? 'rgba(78,159,108,.22)'
      : ok === false ? 'rgba(192,74,52,.22)' : (hot ? 'rgba(255,255,255,.13)' : 'rgba(255,255,255,.05)');
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.fill();
    ctx.strokeStyle = ok === true ? P.good : ok === false ? P.bad : 'rgba(224,166,63,.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash(S.order[i] ? [] : [8, 7]);
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(224,166,63,.85)';
    ctx.beginPath(); ctx.arc(b.x + b.w - 20, b.y + 20, 14, 0, TAU); ctx.fill();
    numText(fa(i + 1), b.x + b.w - 20, b.y + 20, { size: 15, color: '#221a08' });
    if (S.order[i] && !(S.drag && S.drag.id === S.order[i])) {
      drawObj(S.order[i], b.x + b.w / 2, b.y + 70, .68);
      text(objBy(S.order[i]).n, b.x + b.w / 2, b.y + b.h - 16,
        { size: objBy(S.order[i]).n.length > 12 ? 11 : 13, color: 'rgba(236,242,250,.85)' });
    }
  }
  button(BTN_CHECK, 'ببین درست است؟', {
    hot: S.hover && S.hover.k === 'check', fill: '#3f6fb5', hotFill: '#5b8fd6', size: 22 });
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#0e1420';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224,166,63,.22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text('کششِ زمین', SCENE_W - 140, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  numText(fa(S.rows.length) + ' / ' + fa(NEED), 300, HUD_H / 2, { size: 20, color: P.gold });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * (S.rows.length / NEED), 5, 3); ctx.fill();
}

function springIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = P.steelLt; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const u = i / 60;
    const yy = -34 + u * 52;
    const xx = Math.sin(u * 7 * TAU) * 11;
    i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
  }
  ctx.stroke();
  ctx.fillStyle = P.apple;
  ctx.beginPath(); ctx.arc(0, 32, 13, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 880, h: 310, y: 130,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: P.inkSoft,
    icon: springIcon,
    title: 'زمین کدام را بیشتر می‌کشد؟',
    body: 'هر چیزی را اوّل روی ترازو بگذار تا جرمش را ببینی،\nبعد به فنر آویزانش کن و طولِ فنر را از خط‌کش بخوان.\nچهار تا را در جدول ثبت کن، بعد خودت بچینشان.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#3f6fb5', btnHotFill: '#5b8fd6',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 840, h: 300, y: 140,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    icon: springIcon,
    title: 'درست چیدی',
    body: 'هرچه جرمِ جسم بیشتر بود، فنر بیشتر کشیده شد.\nیعنی زمین آن را با نیروی بیشتری به سمتِ خودش می‌کشد،\nو نقطه‌های نمودارت هم روی یک خط افتادند.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#3f6fb5', btnHotFill: '#5b8fd6',
  });
}

function draw() {
  beginScene(P.bgLo);
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.bgHi); g.addColorStop(1, P.bgLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, 0);
  }
  drawPanel();
  drawStand();
  drawShelf();
  drawScale();
  if (S.phase === 'order') drawOrder();
  if (S.drag) {
    ctx.save();
    ctx.globalAlpha = .95;
    drawObj(S.drag.id, S.drag.x, S.drag.y, .9);
    ctx.restore();
  }
  bits.draw();
  ctx.restore();
  drawHUD();
  toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
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
  endScene(.08, 'rgba(6, 10, 20, .44)', 0, .1);
}

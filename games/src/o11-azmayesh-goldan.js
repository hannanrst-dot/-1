/*!
title: گلدانِ شیشه‌ای — بکارید و ببینید (آزمایش)
bg: #1a2418
*/

/* ═══════════════════════════════════════════════════════════════════════
   گلدانِ شیشه‌ای — علومِ سوم، درس ۱۱ «بکارید و ببینید»

   فعّالیتِ کتاب: «مریم و زهرا چند دانه لوبیا و گندم را در ظرفِ شفاف
   کاشتند… برای مشاهدهٔ بهترِ ریشه‌ها یکی از لوبیاها و گندم‌ها را از
   خاک خارج کردند… جدولِ طبقه‌بندیِ ریشه‌ها، برگ‌ها و دانه‌ها را پر
   کنید… و بعد الگو را کشف کنید: با دیدنِ برگ می‌توان نوعِ ریشه و
   دانه را پیش‌بینی کرد.»

   اینجا همان سه کار است: می‌کاری و روزها را جلو می‌بری، بعد از خاک
   درشان می‌آوری و جدول را خودت پر می‌کنی، و آخر با دیدنِ برگِ چهار
   گیاهِ تازه، ریشه و دانه‌شان را پیش‌بینی می‌کنی و بعد بررسی می‌کنی.
   دفترچه هیچ‌وقت جواب را نمی‌نویسد؛ فقط می‌گوید درست بود یا نه.

   ── درستیِ زیستی ───────────────────────────────────────────────
   شکلِ جوانه زدن، ریشه و برگ همان چیزی است که واقعاً اتّفاق می‌افتد:

   ▸ لوبیا (دولپه): اوّل ریشهٔ اصلی پایین می‌رود، بعد ساقه مثلِ قلّاب
     خم می‌شود و دو لپه را از خاک بیرون می‌کشد، بعد برگ‌های پهن با
     رگبرگ‌های شبکه‌ای می‌آیند. ریشه‌اش راست است: یک ریشهٔ کلفت با
     ریشه‌های نازکِ کناری.
   ▸ گندم (تک‌لپه): چند ریشهٔ هم‌اندازه با هم بیرون می‌زنند و ریشهٔ
     افشان می‌سازند؛ برگِ اوّل از غلافی راست بالا می‌آید و دراز و
     باریک است با رگبرگ‌های موازی.

   و همین الگو برای ذرّت و برنج (تک‌لپه) و نخود و آفتاب‌گردان (دولپه)
   هم برقرار است — همان‌طور که در کتاب آمده.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  bg:   '#1a2418', bgLo: '#111a10', bgHi: '#27351f',
  soil: '#6b4c33', soilDk: '#40301f', soilWet: '#4e3722',
  glass: 'rgba(206, 232, 239, .22)', glassLt: 'rgba(255,255,255,.5)',
  leaf: '#4f9f5e', leafDk: '#2f6b3a', leafLt: '#8fcf7a', stem: '#4a8f42',
  root: '#e2d3ad', rootDk: '#b09a70',
  seedA: '#e8d9a8', seedADk: '#b8a06a',
  seedB: '#d9a06a', seedBDk: '#a06a3a',
  paper: '#fbf7e8', card: '#ffffff',
  ink:  '#22301f', inkSoft: '#7d8b78',
  good: '#4e9f6c', bad: '#c04a34', gold: '#e0a63f', accent: '#5aa87a',
  water: '#5fb0d8',
};

/* ───────── گیاهانِ درس ───────── */

const PLANTS = {
  lubia:  { n: 'لوبیا',        k: 'di',   days: [0, 2, 4, 6, 9] },
  gandom: { n: 'گندم',         k: 'mono', days: [0, 2, 3, 5, 8] },
  zorrat: { n: 'ذرّت',          k: 'mono' },
  berenj: { n: 'برنج',         k: 'mono' },
  nokhod: { n: 'نخود',         k: 'di' },
  aftab:  { n: 'آفتاب‌گردان',  k: 'di' },
};

/* ویژگی‌های هر گروه — همان جدولِ کتاب، ولی نوشته نمی‌شود؛ داوری با آن است. */
const TRAITS = {
  mono: { root: 'افشان', leaf: 'دراز و باریک', seed: 'یک قسمتی' },
  di:   { root: 'راست',  leaf: 'پهن',          seed: 'دو قسمتی' },
};
const ROOT_OPT = ['راست', 'افشان'];
const LEAF_OPT = ['پهن', 'دراز و باریک'];
const SEED_OPT = ['یک قسمتی', 'دو قسمتی'];

const QUIZ = ['zorrat', 'nokhod', 'berenj', 'aftab'];

const S = {
  phase: 'intro', phaseT: 0,
  cups: [null, null],        /* دانهٔ داخلِ هر لیوان */
  watered: false,
  day: 0, playing: false, playT: 0,
  pulled: false,
  split: [false, false],
  tbl: [[-1, -1, -1], [-1, -1, -1]],   /* [لیوان][ریشه, برگ, دانه] */
  mark: null, markT: 0,
  qi: 0, qa: [-1, -1], qmark: null, qshow: 0, qdone: [0, 0, 0, 0],
  drag: null,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
function tip(msg) { S.tip = msg; S.tipT = 3.6; }

const cupPlant = (i) => (S.cups[i] ? PLANTS[S.cups[i]] : null);
const bothPlanted = () => S.cups.every((c) => c);
const grown = () => S.day >= 9;

/* ───────── جای‌ها ───────── */

const PAN = { x: 24, y: 96, w: 330, h: 640 };
const STAGE = { x: 370, y: 96, w: 806, h: 640 };
const CUP_Y = STAGE.y + 300;          /* لبهٔ بالای لیوان */
const CUP_W = 210, CUP_H = 230;
const cupX = (i) => STAGE.x + 150 + i * 380;
const SOIL_TOP = CUP_Y + 40;

const BTN_WATER = { x: STAGE.x + 60, y: STAGE.y + 570, w: 210, h: 52 };
const BTN_DAY = { x: STAGE.x + 290, y: STAGE.y + 570, w: 210, h: 52 };
const BTN_PULL = { x: STAGE.x + 520, y: STAGE.y + 570, w: 210, h: 52 };
const BTN_REC = { x: PAN.x + 16, y: PAN.y + 556, w: PAN.w - 32, h: 56 };
const BTN_CHECK = { x: PAN.x + 16, y: PAN.y + 556, w: PAN.w - 32, h: 56 };
const BTN_NEXT = { x: PAN.x + 16, y: PAN.y + 556, w: PAN.w - 32, h: 56 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };

function seedSlot(i) { return { x: STAGE.x + 60 + i * 150, y: STAGE.y + 24, w: 130, h: 92 }; }
function chipRect(row, i, opts) {
  const y = PAN.y + 150 + row * 128;
  const w = (PAN.w - 32 - 10) / 2;
  return { x: PAN.x + 16 + i * (w + 10), y: y + 34, w, h: 46 };
}
function qChip(row, i) {
  const y = PAN.y + 240 + row * 130;
  const w = (PAN.w - 32 - 10) / 2;
  return { x: PAN.x + 16 + i * (w + 10), y: y + 34, w, h: 46 };
}

/* ───────── ورودی ───────── */

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.drag) { S.drag.x = p.x; S.drag.y = p.y; return; }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else if (S.phase === 'grow') {
    if (inRect(p, BTN_WATER)) S.hover = { k: 'water' };
    if (inRect(p, BTN_DAY)) S.hover = { k: 'day' };
    if (inRect(p, BTN_PULL)) S.hover = { k: 'pull' };
    for (let i = 0; i < 2; i++) if (inRect(p, seedSlot(i))) S.hover = { k: 'seed', i };
  } else if (S.phase === 'table') {
    if (inRect(p, BTN_REC)) S.hover = { k: 'rec' };
    for (let r = 0; r < 3; r++) for (let i = 0; i < 2; i++)
      if (inRect(p, chipRect(r, i))) S.hover = { k: 'chip', r, i };
    for (let i = 0; i < 2; i++) {
      const x = cupX(i);
      if (Math.abs(p.x - x) < 90 && p.y > SCENE_H - 210 && p.y < SCENE_H - 90) S.hover = { k: 'split', i };
    }
  } else if (S.phase === 'pattern') {
    if (inRect(p, S.qshow ? BTN_NEXT : BTN_CHECK)) S.hover = { k: 'check' };
    for (let r = 0; r < 2; r++) for (let i = 0; i < 2; i++)
      if (inRect(p, qChip(r, i))) S.hover = { k: 'q', r, i };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  const cap = () => { try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ } };
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { S.phase = 'grow'; S.phaseT = 0; sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) {
      S.phase = 'intro'; S.phaseT = 0;
      S.cups = [null, null]; S.watered = false; S.day = 0; S.pulled = false;
      S.split = [false, false]; S.tbl = [[-1, -1, -1], [-1, -1, -1]]; S.mark = null;
      S.qi = 0; S.qa = [-1, -1]; S.qmark = null; S.qshow = 0; S.qdone = [0, 0, 0, 0];
      sfx.tap();
    }
    return;
  }
  if (S.phase === 'grow') {
    if (inRect(p, BTN_WATER)) { water(); return; }
    if (inRect(p, BTN_DAY)) { oneDay(); return; }
    if (inRect(p, BTN_PULL)) { pullOut(); return; }
    for (let i = 0; i < 2; i++) {
      if (!inRect(p, seedSlot(i))) continue;
      const id = i ? 'gandom' : 'lubia';
      if (S.cups.indexOf(id) >= 0) return;
      S.drag = { id, x: p.x, y: p.y };
      cap(); sfx.tap();
      return;
    }
    return;
  }
  if (S.phase === 'table') {
    if (inRect(p, BTN_REC)) { checkTable(); return; }
    for (let r = 0; r < 3; r++) for (let i = 0; i < 2; i++) {
      if (!inRect(p, chipRect(r, i))) continue;
      const c = S.tblCol || 0;
      S.tbl[c][r] = S.tbl[c][r] === i ? -1 : i;
      S.mark = null; sfx.tap();
      return;
    }
    for (let i = 0; i < 2; i++) {
      const x = cupX(i);
      if (Math.abs(p.x - x) < 90 && p.y > SCENE_H - 210 && p.y < SCENE_H - 90) {
        S.split[i] = !S.split[i]; sfx.place();
        return;
      }
    }
    return;
  }
  if (S.phase === 'pattern') {
    if (inRect(p, S.qshow ? BTN_NEXT : BTN_CHECK)) { S.qshow ? nextQ() : checkQ(); return; }
    if (S.qshow) return;
    for (let r = 0; r < 2; r++) for (let i = 0; i < 2; i++) {
      if (!inRect(p, qChip(r, i))) continue;
      S.qa[r] = S.qa[r] === i ? -1 : i; S.qmark = null; sfx.tap();
      return;
    }
  }
});

function release() {
  const d = S.drag;
  if (!d) return;
  S.drag = null;
  for (let i = 0; i < 2; i++) {
    if (Math.abs(d.x - cupX(i)) > CUP_W / 2 + 30 || d.y < CUP_Y - 40 || d.y > CUP_Y + CUP_H + 40) continue;
    if (S.cups[i]) { tip('این لیوان پر است.'); sfx.nope(); return; }
    S.cups[i] = d.id;
    sfx.place();
    return;
  }
  sfx.pop();
}
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

function water() {
  if (!bothPlanted()) { tip('اوّل هر دو دانه را بکار.'); S.shake = .1; sfx.nope(); return; }
  if (S.watered) { tip('آب داده‌ای؛ حالا روزها را جلو ببر.'); return; }
  S.watered = true;
  sfx.slide();
  bits.add(cupX(0), SOIL_TOP - 40, 10, 'dot', [P.water, '#9fd8ea'], { speed: 40, lift: -60, size: 4, life: .7, grav: 400 });
  bits.add(cupX(1), SOIL_TOP - 40, 10, 'dot', [P.water, '#9fd8ea'], { speed: 40, lift: -60, size: 4, life: .7, grav: 400 });
  toast.say('حالا هر روز نگاهش کن', 'good');
}

function oneDay() {
  if (!S.watered) { tip('اوّل آب بده.'); S.shake = .1; sfx.nope(); return; }
  if (S.day >= 12) { tip('دوازده روز بس است.'); return; }
  S.day++;
  sfx.tick();
}

function pullOut() {
  if (!grown()) { tip('هنوز خوب بزرگ نشده‌اند.'); S.shake = .1; sfx.nope(); return; }
  S.pulled = true;
  S.phase = 'table'; S.phaseT = 0;
  S.tblCol = 0;
  sfx.good();
  toast.say('حالا جدول را پر کن', 'good');
}

function checkTable() {
  const c = S.tblCol;
  if (S.tbl[c].some((v) => v < 0)) { tip('هر سه سطر را پر کن.'); S.shake = .1; sfx.nope(); return; }
  const pl = cupPlant(c), tr = TRAITS[pl.k];
  const want = [ROOT_OPT.indexOf(tr.root), LEAF_OPT.indexOf(tr.leaf), SEED_OPT.indexOf(tr.seed)];
  S.mark = S.tbl[c].map((v, i) => v === want[i]);
  S.markT = 2.6;
  if (!S.mark.every(Boolean)) { sfx.nope(); S.shake = .14; return; }
  sfx.good();
  bits.confetti(PAN.x + PAN.w / 2, PAN.y + 300, 18, [P.good, P.gold, P.card]);
  if (c === 0) { S.tblCol = 1; S.mark = null; toast.say('حالا آن‌یکی', 'good'); }
  else { S.phase = 'pattern'; S.phaseT = 0; toast.say('حالا پیش‌بینی', 'good'); }
}

function checkQ() {
  if (S.qa.some((v) => v < 0)) { tip('هر دو را جواب بده.'); S.shake = .1; sfx.nope(); return; }
  const pl = PLANTS[QUIZ[S.qi]], tr = TRAITS[pl.k];
  const want = [ROOT_OPT.indexOf(tr.root), SEED_OPT.indexOf(tr.seed)];
  S.qmark = S.qa.map((v, i) => v === want[i]);
  if (S.qmark.every(Boolean)) {
    S.qshow = 1; S.qdone[S.qi] = 1;
    sfx.good();
    bits.confetti(STAGE.x + STAGE.w / 2, 360, 18, [P.good, P.leafLt, P.gold]);
  } else { sfx.nope(); S.shake = .14; }
}

function nextQ() {
  S.qshow = 0; S.qa = [-1, -1]; S.qmark = null;
  if (S.qi >= QUIZ.length - 1) { S.phase = 'won'; S.phaseT = 0; sfx.win(); return; }
  S.qi++;
  sfx.tap();
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.markT > 0) S.markT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
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

/* ───────── دانه ───────── */

function drawSeed(kind, x, y, k, split) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  if (kind === 'mono') {
    ctx.fillStyle = P.seedADk;
    wobbleEllipse(0, 1, 20, 13, -.2, 3, 1.2); ctx.fill();
    ctx.fillStyle = P.seedA;
    wobbleEllipse(0, 0, 19, 12, -.2, 5, 1.2); ctx.fill();
    ctx.strokeStyle = P.seedADk; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-12, 3); ctx.lineTo(12, -3); ctx.stroke();
    if (split) {
      ctx.strokeStyle = '#7a6a3a'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.ellipse(-7, 2, 5, 7, -.2, 0, TAU); ctx.stroke();
    }
  } else {
    const gap = split ? 10 : 0;
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * gap, 0);
      ctx.fillStyle = P.seedBDk;
      ctx.beginPath(); ctx.ellipse(s * 5, 1, 12, 15, s * .18, 0, TAU); ctx.fill();
      ctx.fillStyle = P.seedB;
      ctx.beginPath(); ctx.ellipse(s * 5, 0, 11, 14, s * .18, 0, TAU); ctx.fill();
      ctx.restore();
    }
    if (!split) {
      ctx.strokeStyle = P.seedBDk; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(0, 13); ctx.stroke();
    } else {
      ctx.fillStyle = '#8fbf6a';
      ctx.beginPath(); ctx.ellipse(0, 2, 4, 8, 0, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

/* ───────── برگ‌ها ───────── */

function drawBladeLeaf(x, y, len, s, col, colDk) {
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = 11; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * len * .55, y - len * .55, x + s * len * .95, y - len * .2);
  ctx.stroke();
  ctx.strokeStyle = colDk; ctx.lineWidth = 1.2;
  for (const o of [-3, 0, 3]) {
    ctx.beginPath();
    ctx.moveTo(x, y + o * .4);
    ctx.quadraticCurveTo(x + s * len * .55, y - len * .55 + o, x + s * len * .95, y - len * .2 + o);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBroadLeaf(x, y, w, s, col, colDk) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(s * .45);
  ctx.fillStyle = colDk;
  wobbleEllipse(s * w * .9, 3, w, w * .74, 0, 3, 1.8); ctx.fill();
  ctx.fillStyle = col;
  wobbleEllipse(s * w * .9, 0, w * .95, w * .7, 0, 7, 1.8); ctx.fill();
  ctx.strokeStyle = colDk; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * w * 1.8, 0); ctx.stroke();
  for (let v = 1; v <= 3; v++) {
    const t = v / 4;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(s * w * 1.8 * t, 0);
    ctx.quadraticCurveTo(s * w * 1.8 * t + s * 12, -w * .3, s * w * 1.8 * t + s * 18, -w * .5);
    ctx.moveTo(s * w * 1.8 * t, 0);
    ctx.quadraticCurveTo(s * w * 1.8 * t + s * 12, w * .3, s * w * 1.8 * t + s * 18, w * .5);
    ctx.stroke();
  }
  ctx.restore();
}

/* ───────── رشدِ واقعی در لیوان ───────── */

function drawSprout(kind, cx, soilY, day, pulled) {
  const mono = kind === 'mono';
  const d = clamp(day, 0, 12);
  const rootLen = mono ? Math.max(0, d - 1) * 15 : Math.max(0, d - 1) * 19;
  const shoot = mono ? Math.max(0, d - 2) * 17 : Math.max(0, d - 3) * 16;

  /* ریشه */
  ctx.save();
  ctx.strokeStyle = P.root; ctx.lineCap = 'round';
  if (mono) {
    for (let i = 0; i < 7; i++) {
      const a = (i / 6 - .5) * 1.9;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(cx, soilY + 6);
      ctx.quadraticCurveTo(cx + Math.sin(a) * rootLen * .6, soilY + rootLen * .6,
        cx + Math.sin(a) * rootLen * 1.05, soilY + Math.cos(a * .7) * rootLen);
      ctx.stroke();
    }
  } else {
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, soilY + 6);
    ctx.quadraticCurveTo(cx + 5, soilY + rootLen * .6, cx + 2, soilY + rootLen);
    ctx.stroke();
    ctx.lineWidth = 2;
    for (let j = 1; j <= 5; j++) {
      const t = j / 6, by = soilY + rootLen * t, s = j % 2 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(cx + 3, by);
      ctx.quadraticCurveTo(cx + s * 16, by + 5, cx + s * 26, by + 14);
      ctx.stroke();
    }
  }
  ctx.restore();

  /* دانه، تا وقتی هنوز پیداست */
  if (d < 6 || mono) drawSeed(kind, cx, soilY + 8, .9, false);

  if (shoot <= 0) return;
  /* ساقه */
  ctx.strokeStyle = P.stem; ctx.lineWidth = mono ? 5 : 6; ctx.lineCap = 'round';
  if (!mono && d < 6) {
    /* قلّابِ لوبیا: ساقه خمیده بیرون می‌آید */
    ctx.beginPath();
    ctx.moveTo(cx, soilY);
    ctx.quadraticCurveTo(cx - 4, soilY - shoot, cx + 16, soilY - shoot + 8);
    ctx.stroke();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(cx, soilY);
  ctx.lineTo(cx, soilY - shoot);
  ctx.stroke();

  if (mono) {
    const n = d < 5 ? 1 : d < 8 ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const s = i % 2 ? 1 : -1;
      drawBladeLeaf(cx, soilY - shoot * (.35 + i * .26), shoot * (.7 - i * .1), s, P.leaf, P.leafDk);
    }
  } else {
    /* دو لپه، بعد برگ‌های پهن */
    ctx.fillStyle = '#a8cf7a';
    for (const s of [-1, 1]) {
      wobbleEllipse(cx + s * 15, soilY - shoot + 6, 15, 10, 0, 3 + s, 1.4); ctx.fill();
    }
    if (d >= 7) {
      const w = Math.min(30, (d - 6) * 11);
      for (const s of [-1, 1]) drawBroadLeaf(cx, soilY - shoot - 10, w, s, P.leaf, P.leafDk);
    }
  }
}

function drawCup(i) {
  const x = cupX(i), y = CUP_Y;
  const id = S.cups[i];
  ctx.save();
  /* شیشه */
  ctx.fillStyle = P.glass;
  ctx.beginPath();
  ctx.moveTo(x - CUP_W / 2, y);
  ctx.lineTo(x + CUP_W / 2, y);
  ctx.lineTo(x + CUP_W / 2 - 18, y + CUP_H);
  ctx.lineTo(x - CUP_W / 2 + 18, y + CUP_H);
  ctx.closePath(); ctx.fill();
  /* خاک */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - CUP_W / 2 + 4, SOIL_TOP);
  ctx.lineTo(x + CUP_W / 2 - 4, SOIL_TOP);
  ctx.lineTo(x + CUP_W / 2 - 20, y + CUP_H - 4);
  ctx.lineTo(x - CUP_W / 2 + 20, y + CUP_H - 4);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = texStone(S.watered ? P.soilWet : P.soil, P.soilDk);
  ctx.fillRect(x - CUP_W, SOIL_TOP, CUP_W * 2, CUP_H);
  if (id) drawSprout(PLANTS[id].k, x, SOIL_TOP + 26, S.day, false);
  ctx.restore();
  /* بخشِ بالای خاک */
  if (id && S.day > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - CUP_W, STAGE.y + 40, CUP_W * 2, SOIL_TOP + 26 - (STAGE.y + 40));
    ctx.clip();
    drawSprout(PLANTS[id].k, x, SOIL_TOP + 26, S.day, false);
    ctx.restore();
  }
  /* لبه و برقِ شیشه */
  ctx.strokeStyle = 'rgba(206,232,239,.5)'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - CUP_W / 2, y);
  ctx.lineTo(x + CUP_W / 2, y);
  ctx.lineTo(x + CUP_W / 2 - 18, y + CUP_H);
  ctx.lineTo(x - CUP_W / 2 + 18, y + CUP_H);
  ctx.closePath(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ctx.beginPath();
  ctx.moveTo(x - CUP_W / 2 + 16, y + 10);
  ctx.lineTo(x - CUP_W / 2 + 34, y + 10);
  ctx.lineTo(x - CUP_W / 2 + 40, y + CUP_H - 14);
  ctx.lineTo(x - CUP_W / 2 + 26, y + CUP_H - 14);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  /* نام */
  if (id) text(PLANTS[id].n, x, y + CUP_H + 26, { size: 18, color: P.paper });
  else text(i ? 'لیوانِ دوم' : 'لیوانِ اوّل', x, y + CUP_H + 26,
    { size: 16, color: 'rgba(251,247,232,.5)' });
}

/* ───────── گیاهِ درآمده از خاک ───────── */

function drawSpecimen(i) {
  const x = cupX(i), id = S.cups[i];
  if (!id) return;
  const pl = PLANTS[id];
  text(pl.n, x, 178, { size: 22, family: 'Lalezar', color: P.paper });
  ctx.save();
  ctx.translate(x, 420);
  ctx.scale(.9, .9);
  drawSprout(pl.k, 0, 0, 12, true);
  ctx.restore();
  /* دانهٔ خیس‌خورده، با یک ضربه باز می‌شود */
  const sy = SCENE_H - 150;
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  ctx.beginPath(); rrPath(x - 86, sy - 56, 172, 108, 14); ctx.fill();
  ctx.strokeStyle = S.split[i] ? P.good : 'rgba(224,236,224,.3)'; ctx.lineWidth = 2;
  ctx.setLineDash(S.split[i] ? [] : [7, 6]);
  ctx.beginPath(); rrPath(x - 86, sy - 56, 172, 108, 14); ctx.stroke();
  ctx.setLineDash([]);
  drawSeed(pl.k, x, sy - 12, 1.7, S.split[i]);
  text(S.split[i] ? 'باز شد' : 'برای باز کردن بزن', x, sy + 34,
    { size: 13, color: 'rgba(223,240,224,.6)' });
}

/* ───────── برگِ گیاهِ معمّا ───────── */

function drawQuizLeaf(id, cx, cy) {
  const pl = PLANTS[id];
  ctx.save();
  if (id === 'zorrat') {
    ctx.strokeStyle = P.stem; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy + 120); ctx.lineTo(cx, cy - 40); ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const s = i % 2 ? 1 : -1;
      drawBladeLeaf(cx, cy + 60 - i * 46, 150, s, P.leaf, P.leafDk);
    }
  } else if (id === 'berenj') {
    ctx.strokeStyle = P.stem; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * 16, cy + 120); ctx.lineTo(cx + i * 26, cy - 10); ctx.stroke();
      drawBladeLeaf(cx + i * 16, cy + 60, 130, i >= 0 ? 1 : -1, P.leaf, P.leafDk);
    }
  } else if (id === 'nokhod') {
    /* برگِ مرکّب با برگچه‌های پهن و رگبرگِ شبکه‌ای */
    ctx.strokeStyle = P.stem; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy + 120); ctx.lineTo(cx, cy - 30); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const y = cy + 70 - i * 50;
      for (const s of [-1, 1]) drawBroadLeaf(cx, y, 26, s, P.leaf, P.leafDk);
    }
  } else {
    /* آفتاب‌گردان: برگِ پهنِ بزرگِ قلبی */
    ctx.strokeStyle = P.stem; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy + 120); ctx.lineTo(cx, cy - 40); ctx.stroke();
    for (let i = 0; i < 2; i++) {
      const y = cy + 60 - i * 70;
      for (const s of [-1, 1]) drawBroadLeaf(cx, y, 44 - i * 6, s, P.leaf, P.leafDk);
    }
  }
  ctx.restore();
  text(pl.n, cx, cy + 172, { size: 24, family: 'Lalezar', color: P.paper });
}

/* ───────── پرده‌ها ───────── */

function drawStageGrow() {
  /* دانه‌های آماده */
  for (let i = 0; i < 2; i++) {
    const b = seedSlot(i);
    const id = i ? 'gandom' : 'lubia';
    const used = S.cups.indexOf(id) >= 0;
    ctx.fillStyle = used ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.08)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.fill();
    ctx.strokeStyle = used ? 'rgba(255,255,255,.1)' : 'rgba(224,236,224,.3)'; ctx.lineWidth = 2;
    ctx.setLineDash(used ? [6, 6] : []);
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.stroke();
    ctx.setLineDash([]);
    if (!used && !(S.drag && S.drag.id === id)) {
      drawSeed(PLANTS[id].k, b.x + b.w / 2, b.y + 36, 1, false);
      text(PLANTS[id].n, b.x + b.w / 2, b.y + b.h - 18, { size: 14, color: '#dff0e0' });
    }
  }
  text('دانه را بکش توی لیوان', STAGE.x + 460, STAGE.y + 66,
    { size: 16, color: 'rgba(223,240,224,.55)' });
  drawCup(0); drawCup(1);
  button(BTN_WATER, 'آب بده', {
    hot: S.hover && S.hover.k === 'water', fill: '#3f7f9f', hotFill: '#55a0c0',
    size: 21, disabled: S.watered });
  button(BTN_DAY, 'یک روز جلو', {
    hot: S.hover && S.hover.k === 'day', fill: '#3f8f4a', hotFill: '#55a860', size: 21 });
  button(BTN_PULL, 'از خاک درآور', {
    hot: S.hover && S.hover.k === 'pull', fill: grown() ? '#a5682a' : '#4a5c4a',
    hotFill: '#c9863b', size: 20 });
}

function drawStageTable() {
  drawSpecimen(0); drawSpecimen(1);
  const c = S.tblCol || 0;
  const x = cupX(c);
  ctx.save();
  ctx.globalAlpha = .4 + .25 * Math.sin(S.t * 2.6);
  ctx.strokeStyle = P.gold; ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.beginPath(); rrPath(x - 150, 150, 300, 500, 18); ctx.stroke();
  ctx.restore();
}

function drawStagePattern() {
  const id = QUIZ[S.qi];
  drawQuizLeaf(id, STAGE.x + STAGE.w / 2, 250);
  if (S.qshow) {
    const pl = PLANTS[id];
    const bx = STAGE.x + 50, by = 462, bw = STAGE.w - 100, bh = 258;
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.beginPath(); rrPath(bx, by, bw, bh, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(90,168,122,.45)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(bx, by, bw, bh, 16); ctx.stroke();
    text('از خاک درآوردیم و دانه‌اش را باز کردیم', bx + bw / 2, by + 24,
      { size: 16, color: 'rgba(223,240,224,.75)' });
    text('ریشه‌اش', bx + bw * .3, by + 56, { size: 15, color: P.gold });
    text('دانه‌اش', bx + bw * .72, by + 56, { size: 15, color: P.gold });
    ctx.save();
    ctx.translate(bx + bw * .3, by + 156);
    ctx.scale(.45, .45);
    drawSprout(pl.k, 0, 0, 12, true);
    ctx.restore();
    drawSeed(pl.k, bx + bw * .72, by + 150, 2.4, true);
  }
  /* دانه‌های پیشرفت */
  for (let i = 0; i < QUIZ.length; i++) {
    ctx.fillStyle = S.qdone[i] ? P.good : (i === S.qi ? P.gold : 'rgba(255,255,255,.2)');
    ctx.beginPath(); ctx.arc(STAGE.x + STAGE.w / 2 - 30 + i * 20, 140, 7, 0, TAU); ctx.fill();
  }
}

/* ───────── دفترچه ───────── */

function drawPanel() {
  paper(PAN.x, PAN.y, PAN.w, PAN.h, P.paper, 31, 16, .4);
  ctx.fillStyle = P.accent;
  ctx.beginPath(); rrPath(PAN.x, PAN.y, PAN.w, 10, 5); ctx.fill();

  if (S.phase === 'grow' || S.phase === 'intro') {
    text('دفترچه', PAN.x + PAN.w / 2, PAN.y + 44, { size: 26, family: 'Lalezar', color: P.ink });
    text('اوّل بکار، آب بده و روزها را جلو ببر', PAN.x + PAN.w / 2, PAN.y + 78,
      { size: 15, color: P.inkSoft });
    /* روزشمار */
    ctx.fillStyle = '#eceadd';
    ctx.beginPath(); rrPath(PAN.x + 16, PAN.y + 410, PAN.w - 32, 76, 14); ctx.fill();
    ctx.strokeStyle = '#d8d8cd'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(PAN.x + 16, PAN.y + 410, PAN.w - 32, 76, 14); ctx.stroke();
    text('روزِ', PAN.x + PAN.w - 44, PAN.y + 448, { size: 18, color: P.inkSoft, align: 'right' });
    numText(fa(S.day), PAN.x + PAN.w / 2 - 10, PAN.y + 450, { size: 34, color: P.accent });
    for (let d = 1; d <= 12; d++) {
      ctx.fillStyle = d <= S.day ? P.accent : '#d8d8cd';
      ctx.beginPath(); ctx.arc(PAN.x + 40 + (d - 1) * 20, PAN.y + 470, 5, 0, TAU); ctx.fill();
    }
    const steps = ['دو دانه را در لیوان بکار', 'آب بده', 'تا روزِ ۹ صبر کن', 'از خاک درشان بیاور'];
    const done = [bothPlanted(), S.watered, grown(), S.pulled];
    for (let i = 0; i < 4; i++) {
      const y = PAN.y + 110 + i * 72;
      ctx.fillStyle = done[i] ? '#eef6f0' : '#f0f0e8';
      ctx.beginPath(); rrPath(PAN.x + 16, y, PAN.w - 32, 54, 12); ctx.fill();
      ctx.strokeStyle = done[i] ? P.good : '#d8d8cd'; ctx.lineWidth = done[i] ? 3 : 2;
      ctx.beginPath(); rrPath(PAN.x + 16, y, PAN.w - 32, 54, 12); ctx.stroke();
      text(steps[i], PAN.x + PAN.w - 32, y + 27, { size: 15, color: P.ink, align: 'right' });
      ctx.fillStyle = done[i] ? P.good : '#d8d8cd';
      ctx.beginPath(); ctx.arc(PAN.x + 40, y + 27, 12, 0, TAU); ctx.fill();
      if (done[i]) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.8; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(PAN.x + 34, y + 27); ctx.lineTo(PAN.x + 38, y + 32); ctx.lineTo(PAN.x + 46, y + 21);
        ctx.stroke();
      }
    }
    return;
  }

  if (S.phase === 'table') {
    const c = S.tblCol || 0;
    const pl = cupPlant(c);
    text('جدولِ من', PAN.x + PAN.w / 2, PAN.y + 44, { size: 26, family: 'Lalezar', color: P.ink });
    text(pl ? pl.n + ' را نگاه کن و بنویس' : '', PAN.x + PAN.w / 2, PAN.y + 78,
      { size: 15, color: P.accent });
    const rows = [['ریشه', ROOT_OPT], ['برگ', LEAF_OPT], ['دانه', SEED_OPT]];
    rows.forEach(([label, opts], r) => {
      const y = PAN.y + 150 + r * 128;
      text(label, PAN.x + PAN.w - 22, y + 10, { size: 17, color: P.ink, align: 'right' });
      if (S.mark && S.markT > 0) {
        const ok = S.mark[r];
        ctx.fillStyle = ok ? P.good : P.bad;
        ctx.beginPath(); ctx.arc(PAN.x + 30, y + 10, 11, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
        ctx.save(); ctx.translate(PAN.x + 30, y + 10);
        ctx.beginPath();
        if (ok) { ctx.moveTo(-5, 0); ctx.lineTo(-1, 5); ctx.lineTo(6, -5); }
        else { ctx.moveTo(-5, -5); ctx.lineTo(5, 5); ctx.moveTo(5, -5); ctx.lineTo(-5, 5); }
        ctx.stroke(); ctx.restore();
      }
      for (let i = 0; i < 2; i++) {
        const b = chipRect(r, i);
        const on = S.tbl[c][r] === i;
        const hot = S.hover && S.hover.k === 'chip' && S.hover.r === r && S.hover.i === i;
        ctx.fillStyle = on ? P.accent : (hot ? '#e7f0e7' : '#f0f0e8');
        ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
        ctx.strokeStyle = on ? '#2f7f5a' : '#d6d6cb'; ctx.lineWidth = 2;
        ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
        text(opts[i], b.x + b.w / 2, b.y + b.h / 2,
          { size: opts[i].length > 8 ? 13 : 16, color: on ? '#fff' : P.ink });
      }
    });
    button(BTN_REC, 'ثبت کن', {
      hot: S.hover && S.hover.k === 'rec', fill: '#3f8f6a', hotFill: '#55a880', size: 24 });
    return;
  }

  /* پردهٔ الگو */
  const id = QUIZ[S.qi];
  text('پیش‌بینی کن', PAN.x + PAN.w / 2, PAN.y + 44, { size: 26, family: 'Lalezar', color: P.ink });
  text('فقط با نگاه به برگش', PAN.x + PAN.w / 2, PAN.y + 78, { size: 15, color: P.inkSoft });
  text(PLANTS[id].n, PAN.x + PAN.w / 2, PAN.y + 112, { size: 20, color: P.accent });
  const rows = [['ریشه‌اش', ROOT_OPT], ['دانه‌اش', SEED_OPT]];
  rows.forEach(([label, opts], r) => {
    const y = PAN.y + 240 + r * 130;
    text(label, PAN.x + PAN.w - 22, y + 10, { size: 17, color: P.ink, align: 'right' });
    if (S.qmark) {
      const ok = S.qmark[r];
      ctx.fillStyle = ok ? P.good : P.bad;
      ctx.beginPath(); ctx.arc(PAN.x + 30, y + 10, 11, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.save(); ctx.translate(PAN.x + 30, y + 10);
      ctx.beginPath();
      if (ok) { ctx.moveTo(-5, 0); ctx.lineTo(-1, 5); ctx.lineTo(6, -5); }
      else { ctx.moveTo(-5, -5); ctx.lineTo(5, 5); ctx.moveTo(5, -5); ctx.lineTo(-5, 5); }
      ctx.stroke(); ctx.restore();
    }
    for (let i = 0; i < 2; i++) {
      const b = qChip(r, i);
      const on = S.qa[r] === i;
      const hot = S.hover && S.hover.k === 'q' && S.hover.r === r && S.hover.i === i;
      ctx.fillStyle = on ? P.accent : (hot ? '#e7f0e7' : '#f0f0e8');
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
      ctx.strokeStyle = on ? '#2f7f5a' : '#d6d6cb'; ctx.lineWidth = 2;
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
      text(opts[i], b.x + b.w / 2, b.y + b.h / 2,
        { size: opts[i].length > 8 ? 13 : 16, color: on ? '#fff' : P.ink });
    }
  });
  button(S.qshow ? BTN_NEXT : BTN_CHECK, S.qshow ? 'بعدی' : 'بررسی کن', {
    hot: S.hover && S.hover.k === 'check',
    fill: S.qshow ? '#a5682a' : '#3f8f6a', hotFill: S.qshow ? '#c9863b' : '#55a880', size: 24 });
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#0d150c';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224,166,63,.22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text('گلدانِ شیشه‌ای', SCENE_W - 150, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  const n = (S.phase === 'grow' || S.phase === 'intro') ? 0
    : S.phase === 'table' ? 1 + (S.tblCol || 0)
    : 3 + S.qdone.reduce((a, b) => a + b, 0);
  numText(fa(n) + ' / ' + fa(7), 300, HUD_H / 2, { size: 20, color: P.gold });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * (n / 7), 5, 3); ctx.fill();
}

function cupIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(206,232,239,.3)';
  ctx.beginPath();
  ctx.moveTo(-26, -22); ctx.lineTo(26, -22); ctx.lineTo(20, 26); ctx.lineTo(-20, 26);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.soil;
  ctx.beginPath();
  ctx.moveTo(-24, -4); ctx.lineTo(24, -4); ctx.lineTo(20, 24); ctx.lineTo(-20, 24);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = P.stem; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -30); ctx.stroke();
  ctx.fillStyle = P.leaf;
  wobbleEllipse(-12, -32, 12, 8, -.4, 3, 1); ctx.fill();
  wobbleEllipse(12, -32, 12, 8, .4, 5, 1); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 880, h: 310, y: 130,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: P.inkSoft,
    icon: cupIcon,
    title: 'لوبیا و گندم بکاریم',
    body: 'دو دانه را در لیوانِ شفاف می‌کاریم و هر روز نگاهشان می‌کنیم.\nبعد از خاک درشان می‌آوریم و جدولِ ریشه و برگ و دانه را پر می‌کنیم.\nآخرش هم با دیدنِ برگِ چهار گیاهِ تازه، بقیه‌اش را پیش‌بینی می‌کنی.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#3f8f6a', btnHotFill: '#55a880',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 860, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: P.inkSoft,
    icon: cupIcon,
    title: 'الگو را پیدا کردی',
    body: 'دانهٔ دو قسمتی با ریشهٔ راست و برگِ پهن می‌آید،\nدانهٔ یک قسمتی با ریشهٔ افشان و برگِ دراز و باریک.\nحالا فقط با دیدنِ برگِ یک گیاه، بقیه‌اش را می‌دانی.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#3f8f6a', btnHotFill: '#55a880',
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
  ctx.fillStyle = '#16200f';
  ctx.beginPath(); rrPath(STAGE.x, STAGE.y, STAGE.w, STAGE.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(90,168,122,.2)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(STAGE.x, STAGE.y, STAGE.w, STAGE.h, 16); ctx.stroke();
  ctx.save();
  ctx.beginPath(); rrPath(STAGE.x, STAGE.y, STAGE.w, STAGE.h, 16); ctx.clip();
  if (S.phase === 'grow' || S.phase === 'intro') drawStageGrow();
  else if (S.phase === 'table') drawStageTable();
  else drawStagePattern();
  ctx.restore();
  drawPanel();
  if (S.drag) drawSeed(PLANTS[S.drag.id].k, S.drag.x, S.drag.y, 1.2, false);
  bits.draw();
  ctx.restore();
  drawHUD();
  toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 480;
    paper(STAGE.x + STAGE.w / 2 - w / 2, SCENE_H - 52, w, 42, P.paper, 51, 12, .3);
    text(S.tip, STAGE.x + STAGE.w / 2, SCENE_H - 31, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.08, 'rgba(8, 16, 8, .42)', 0, .1);
}

/*!
title: هوای داخلِ آب — هر کدام جای خود (آزمایش)
bg: #141d26
*/

/* ═══════════════════════════════════════════════════════════════════════
   هوای داخلِ آب — علومِ سوم، درس ۱۲ «هر کدام جای خود (۱)»

   آزمایشِ کتاب: «ظرفِ شیشه‌ای را تا نیمه از آب پُر کنید و روی توریِ
   سه‌پایه بگذارید. شمع را زیرش روشن کنید. مدّتی صبر کنید تا آب گرم
   شود. از مشاهدهٔ حباب‌هایی که روی دیوارهٔ لیوان تشکیل شده‌اند چه
   نتیجه‌ای می‌گیرید؟»

   و پرسشِ همان صفحه: «چرا غوّاص زیرِ آب به استوانکِ هوا نیاز دارد؟
   آیا در آب هوا وجود دارد؟»

   ── درستیِ فیزیکی ───────────────────────────────────────────────
   مقدارِ هوایی که در آب حل می‌شود با گرم شدن کم می‌شود — و عددهای
   این آزمایش، عددهای واقعیِ حلّالیتِ اکسیژن در آبِ شیرین در فشارِ
   یک جوّ است (میلی‌گرم در لیتر):

     ۰°:۱۴٫۶   ۱۰°:۱۱٫۳   ۲۰°:۹٫۱   ۳۰°:۷٫۶   ۴۰°:۶٫۴   ۵۰°:۵٫۶
     ۶۰°:۴٫۸   ۷۰°:۳٫۹    ۸۰°:۲٫۹   ۹۰°:۱٫۶   ۱۰۰°:۰

   بینِ این عددها درون‌یابی می‌شود. هرچه دما بالا می‌رود، هوای حل‌شده
   کم می‌شود و همان مقدارِ اضافه به شکلِ حباب‌های ریز روی دیوارهٔ
   لیوان می‌نشیند — این‌ها هوای حل‌شده‌اند، نه بخارِ آب. بخارِ آب
   فقط سرِ ۱۰۰ درجه و به شکلِ حباب‌های درشت از کفِ ظرف بالا می‌آید.

   گرم شدنِ آب هم قانونِ خودش را دارد: آهنگِ گرم شدن از گرمای شعله
   منهای گرمایی است که به هوای اتاق می‌رود، پس آبِ بی‌شعله خودش
   کم‌کم به دمای اتاق برمی‌گردد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  bg: '#141d26', bgLo: '#0d141b', bgHi: '#22303e',
  steel: '#9aa9ba', steelDk: '#5d6a79', steelLt: '#d6e0ea',
  glass: 'rgba(190, 226, 240, .20)', glassEdge: 'rgba(206, 232, 245, .55)',
  water: '#3f8fc4', waterLt: '#7fc4e8', waterDk: '#2b6a94',
  flame: '#ffb54a', flameLt: '#ffe6a8', wax: '#f0e6d2',
  paper: '#fbf7ec', card: '#ffffff',
  ink: '#1b2733', inkSoft: '#78889a',
  good: '#4e9f6c', bad: '#c04a34', gold: '#e0a63f', accent: '#4c9ec4',
  fish: '#e8703f', fishLt: '#ffa06a',
};

/* ───────── قانونِ حلّالیتِ هوا در آب ───────── */

/* حلّالیتِ اکسیژن در آبِ شیرین، میلی‌گرم در لیتر (جدولِ واقعی) */
const SOL = [
  [0, 14.6], [5, 12.8], [10, 11.3], [15, 10.1], [20, 9.1], [25, 8.3],
  [30, 7.6], [35, 7.0], [40, 6.4], [50, 5.6], [60, 4.8], [70, 3.9],
  [80, 2.9], [90, 1.6], [100, 0],
];
/** هوای حل‌شدنی در این دما. */
function solubility(T) {
  const t = clamp(T, 0, 100);
  for (let i = 0; i < SOL.length - 1; i++) {
    const [t0, c0] = SOL[i], [t1, c1] = SOL[i + 1];
    if (t <= t1) return c0 + (c1 - c0) * (t - t0) / (t1 - t0);
  }
  return 0;
}

const T_ROOM = 20;
const C0 = solubility(T_ROOM);     /* هوای حل‌شده در آغاز */
const HEAT = 3.2;                  /* گرمای شعله، درجه بر ثانیه */
const LOSS = .02;                  /* رفتنِ گرما به هوای اتاق */
const FISH_NEED = 5;               /* زیرِ این مقدار، ماهی به تنگ می‌آید */
/* هوا تا وقتی آب کمی «بیش از اشباع» نشود حباب نمی‌شود؛ این هم واقعی است
   و برای همین حباب‌ها حدودِ چهل درجه پیدا می‌شوند، نه همان اوّلِ کار. */
const NUC = 2.5;

/** هوایی که از آب بیرون زده. */
const released = (T) => Math.max(0, C0 - solubility(T));
/** آن بخشی که واقعاً به شکلِ حباب روی دیواره می‌نشیند. */
const bubbled = (T) => Math.max(0, released(T) - NUC);

/* ───────── دفترچه ───────── */

const SLOTS = [
  { n: 'اوّلین حباب‌ها', u: 'درجه', hint: 'همان دمایی که حباب‌ها تازه پیدا می‌شوند.' },
  { n: 'هوا در ۶۰ درجه', u: 'میلی‌گرم', hint: 'آب را ببر روی ۶۰ درجه.' },
  { n: 'ماهی به تنگ آمد', u: 'درجه', hint: 'ماهی را بگذار و ببین کِی بی‌قرار می‌شود.' },
  { n: 'سرِ جوش', u: 'میلی‌گرم', hint: 'تا ۱۰۰ درجه گرمش کن.' },
];

const QS = [
  { q: 'وقتی آب گرم‌تر شد، هوای حل‌شده در آن…',
    opts: ['کمتر شد', 'بیشتر شد', 'فرقی نکرد'] },
  { q: 'حباب‌های ریزی که به دیوارهٔ لیوان چسبیدند چه بودند؟',
    opts: ['هوایی که در آب حل شده بود', 'بخارِ آب', 'آبِ کثیف'] },
];

const S = {
  phase: 'intro', phaseT: 0,
  T: T_ROOM, flame: false, fish: false,
  firstBubbleT: null,
  rec: [null, null, null, null],
  ans: [-1, -1], mark: null, markT: 0,
  bub: [], rise: [],
  gasp: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
function tip(msg) { S.tip = msg; S.tipT = 3.8; }

const oxy = () => solubility(S.T);
const boiling = () => S.T >= 99.5;
const gasping = () => S.fish && oxy() < FISH_NEED;
const allRec = () => S.rec.every((r) => r !== null);

/* ───────── جای‌ها ───────── */

const PAN = { x: 24, y: 96, w: 320, h: 640 };
const STAGE = { x: 364, y: 96, w: 812, h: 640 };
const BX = STAGE.x + 300, BY = STAGE.y + 44;       /* گوشهٔ بالا-چپِ لیوان */
const BW = 210, BH = 210;
const WATER_TOP = BY + 70;
const BTN_FLAME = { x: STAGE.x + 40, y: STAGE.y + 540, w: 220, h: 56 };
const BTN_FISH = { x: STAGE.x + 286, y: STAGE.y + 540, w: 220, h: 56 };
const BTN_REC = { x: PAN.x + 16, y: PAN.y + 470, w: PAN.w - 32, h: 54 };
const BTN_CHECK = { x: SCENE_W / 2 - 160, y: 646, w: 320, h: 58 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };
function qOpt(qi, i) {
  const w = 250, gap = 14;
  return { x: SCENE_W / 2 + (1 - i) * (w + gap) - w / 2, y: 300 + qi * 160, w, h: 60 };
}

/* ───────── ورودی ───────── */

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else if (S.phase === 'quiz') {
    if (inRect(p, BTN_CHECK)) S.hover = { k: 'check' };
    for (let q = 0; q < 2; q++) for (let i = 0; i < QS[q].opts.length; i++)
      if (inRect(p, qOpt(q, i))) S.hover = { k: 'opt', q, i };
  } else {
    if (inRect(p, BTN_FLAME)) S.hover = { k: 'flame' };
    if (inRect(p, BTN_FISH)) S.hover = { k: 'fish' };
    if (inRect(p, BTN_REC)) S.hover = { k: 'rec' };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { S.phase = 'lab'; S.phaseT = 0; sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) {
      S.phase = 'intro'; S.phaseT = 0;
      S.T = T_ROOM; S.flame = false; S.fish = false; S.firstBubbleT = null;
      S.rec = [null, null, null, null]; S.ans = [-1, -1]; S.mark = null;
      S.bub.length = 0; S.rise.length = 0;
      sfx.tap();
    }
    return;
  }
  if (S.phase === 'quiz') {
    if (inRect(p, BTN_CHECK)) { checkQuiz(); return; }
    for (let q = 0; q < 2; q++) for (let i = 0; i < QS[q].opts.length; i++) {
      if (!inRect(p, qOpt(q, i))) continue;
      S.ans[q] = S.ans[q] === i ? -1 : i; S.mark = null; sfx.tap();
      return;
    }
    return;
  }
  if (inRect(p, BTN_FLAME)) { S.flame = !S.flame; sfx.slide(); return; }
  if (inRect(p, BTN_FISH)) { S.fish = !S.fish; sfx.pop(); return; }
  if (inRect(p, BTN_REC)) { record(); return; }
});

/** این حالت به کدام خانه می‌خورد؟ */
function slotFor() {
  const r = bubbled(S.T);
  if (S.rec[0] === null && r > 0 && r < 1.2) return 0;
  if (Math.abs(S.T - 60) <= 2) return 1;
  if (S.fish && gasping() && Math.abs(oxy() - FISH_NEED) <= .6) return 2;
  if (boiling()) return 3;
  return -1;
}

function record() {
  const si = slotFor();
  if (si < 0) {
    if (S.rec[0] === null) tip('صبر کن تا اوّلین حباب‌ها روی دیواره پیدا شوند.');
    else if (S.rec[1] === null) tip('آب را ببر روی ۶۰ درجه.');
    else if (S.rec[2] === null) tip('ماهی را بگذار و همان لحظه‌ای که بی‌قرار می‌شود ثبت کن.');
    else tip('تا ۱۰۰ درجه گرمش کن.');
    S.shake = .12; sfx.nope();
    return;
  }
  if (S.rec[si] !== null) { tip('این خانه پر است.'); return; }
  S.rec[si] = (si === 0 || si === 2) ? S.T : oxy();
  sfx.good();
  bits.confetti(PAN.x + PAN.w / 2, PAN.y + 300, 16, [P.good, P.gold, P.card]);
  if (allRec()) { S.phase = 'quiz'; S.phaseT = 0; toast.say('حالا نتیجه', 'good'); }
  else toast.say(SLOTS[si].n + ' ثبت شد', 'good');
}

function checkQuiz() {
  if (S.ans.some((a) => a < 0)) { tip('هر دو را جواب بده.'); S.shake = .1; sfx.nope(); return; }
  /* داوری از روی عددهای خودِ بچّه */
  const less = S.rec[1] < C0 - .2, more = S.rec[1] > C0 + .2;
  const t0 = less ? 0 : more ? 1 : 2;
  /* حباب‌های دیواره پیش از جوش پیدا شدند، پس بخارِ آب نبودند */
  const t1 = (S.rec[0] !== null && S.rec[0] < 95) ? 0 : 1;
  S.mark = [S.ans[0] === t0, S.ans[1] === t1];
  S.markT = 2.6;
  if (S.mark.every(Boolean)) { sfx.win(); S.phase = 'won'; S.phaseT = 0; }
  else { sfx.nope(); S.shake = .14; }
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.markT > 0) S.markT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);

  if (S.phase === 'lab' || S.phase === 'quiz') {
    /* گرم و سرد شدنِ آب */
    let dT = (S.flame ? HEAT : 0) - LOSS * (S.T - T_ROOM);
    if (S.T >= 100 && S.flame) dT = 0;           /* سرِ جوش دما می‌ایستد */
    S.T = clamp(S.T + dT * dt, T_ROOM, 100);
    if (S.firstBubbleT === null && bubbled(S.T) > 0) S.firstBubbleT = S.T;
  }
  /* حباب‌های دیواره: به‌اندازهٔ هوای بیرون‌زده */
  const want = Math.round(clamp(bubbled(S.T) / (C0 - NUC), 0, 1) * 46);
  while (S.bub.length < want) {
    const side = Math.random() < .5 ? -1 : 1;
    S.bub.push({
      x: BX + BW / 2 + side * (BW / 2 - 10 - Math.random() * 16),
      y: WATER_TOP + 14 + Math.random() * (BY + BH - WATER_TOP - 26),
      r: 1.6 + Math.random() * 2.6, ph: Math.random() * TAU,
    });
  }
  while (S.bub.length > want) S.bub.pop();
  /* حباب‌های درشتِ جوش از کفِ ظرف */
  if (boiling() && S.flame) {
    if (Math.random() < dt * 26) {
      S.rise.push({ x: BX + 20 + Math.random() * (BW - 40), y: BY + BH - 14, r: 4 + Math.random() * 5 });
    }
  }
  for (let i = S.rise.length - 1; i >= 0; i--) {
    const b = S.rise[i];
    b.y -= dt * 130; b.r += dt * 3;
    if (b.y < WATER_TOP + 6) S.rise.splice(i, 1);
  }
  if (gasping()) S.gasp = Math.min(1, S.gasp + dt * 2); else S.gasp = Math.max(0, S.gasp - dt * 2);

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

/* ───────── دستگاه ───────── */

function drawFish() {
  const cy = WATER_TOP + (S.gasp > .5 ? 22 : 90) + Math.sin(S.t * 2) * 6;
  const cx = BX + BW / 2 + Math.sin(S.t * .8) * 34;
  ctx.save();
  ctx.translate(cx, cy);
  const k = .62;
  ctx.scale(k, k);
  ctx.fillStyle = P.fish;
  wobbleEllipse(0, 0, 40, 24, 0, 3, 1.4); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(34, 0); ctx.lineTo(60, -18); ctx.lineTo(60, 18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.fishLt;
  wobbleEllipse(-4, -18, 16, 8, -.3, 5, 1.2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-24, -5, 6, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1b2733';
  ctx.beginPath(); ctx.arc(-25, -5, 3, 0, TAU); ctx.fill();
  /* دهانِ باز وقتی به تنگ آمده */
  ctx.strokeStyle = '#8a3a24'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  if (S.gasp > .5) ctx.arc(-38, 4, 6, -1.2, 1.2);
  else { ctx.moveTo(-40, 2); ctx.lineTo(-34, 2); }
  ctx.stroke();
  ctx.restore();
  if (S.gasp > .5) {
    ctx.save();
    ctx.globalAlpha = .5 + .3 * Math.sin(S.t * 6);
    ctx.fillStyle = P.bad;
    ctx.beginPath(); ctx.arc(cx + 46, cy - 34, 15, 0, TAU); ctx.fill();
    text('!', cx + 46, cy - 34, { size: 22, family: 'Lalezar', color: '#fff' });
    ctx.restore();
  }
}

function drawBeaker() {
  /* سه‌پایه و توری */
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 9; ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(BX + BW / 2 + s * 86, BY + BH + 116);
    ctx.lineTo(BX + BW / 2 + s * 52, BY + BH + 14);
    ctx.stroke();
  }
  ctx.fillStyle = P.steelDk;
  ctx.beginPath(); rrPath(BX - 44, BY + BH + 4, BW + 88, 12, 5); ctx.fill();
  ctx.fillStyle = P.steel;
  ctx.beginPath(); rrPath(BX - 44, BY + BH, BW + 88, 10, 5); ctx.fill();
  /* توریِ فلزی */
  ctx.strokeStyle = 'rgba(154,169,186,.55)'; ctx.lineWidth = 1.6;
  for (let x = BX - 40; x < BX + BW + 44; x += 9) {
    ctx.beginPath(); ctx.moveTo(x, BY + BH); ctx.lineTo(x, BY + BH + 10); ctx.stroke();
  }

  /* آب */
  ctx.save();
  ctx.beginPath(); rrPath(BX + 4, BY + 4, BW - 8, BH - 8, 12); ctx.clip();
  const hot = clamp((S.T - 20) / 80, 0, 1);
  const g = ctx.createLinearGradient(0, WATER_TOP, 0, BY + BH);
  g.addColorStop(0, shade(P.waterLt, hot * .18));
  g.addColorStop(1, shade(P.waterDk, hot * .12));
  ctx.fillStyle = g;
  ctx.fillRect(BX, WATER_TOP, BW, BH);
  /* سطحِ آب */
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.fillRect(BX, WATER_TOP, BW, 4);
  if (S.fish) drawFish();
  /* حباب‌های ریزِ دیواره */
  for (const b of S.bub) {
    const wob = Math.sin(S.t * 2 + b.ph) * .6;
    ctx.fillStyle = 'rgba(230, 248, 255, .8)';
    ctx.beginPath(); ctx.arc(b.x + wob, b.y, b.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.arc(b.x + wob, b.y, b.r, 0, TAU); ctx.stroke();
  }
  /* حباب‌های درشتِ جوش */
  for (const b of S.rise) {
    ctx.fillStyle = 'rgba(235, 250, 255, .85)';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill();
  }
  ctx.restore();

  /* شیشه */
  ctx.fillStyle = P.glass;
  ctx.beginPath(); rrPath(BX, BY, BW, BH, 14); ctx.fill();
  ctx.strokeStyle = P.glassEdge; ctx.lineWidth = 4;
  ctx.beginPath(); rrPath(BX, BY, BW, BH, 14); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ctx.beginPath(); rrPath(BX + 14, BY + 16, 16, BH - 40, 8); ctx.fill();

  /* شمع */
  const cx = BX + BW / 2, cy = BY + BH + 116;
  ctx.fillStyle = '#c9bda6';
  ctx.beginPath(); ctx.ellipse(cx, cy + 6, 40, 10, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = P.wax;
  ctx.beginPath(); rrPath(cx - 18, cy - 52, 36, 58, 6); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.12)';
  ctx.beginPath(); rrPath(cx + 6, cy - 52, 12, 58, 6); ctx.fill();
  ctx.strokeStyle = '#4a3a2c'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, cy - 52); ctx.lineTo(cx, cy - 62); ctx.stroke();
  if (S.flame) {
    const f = 1 + Math.sin(S.t * 9) * .07;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gg = ctx.createRadialGradient(cx, cy - 78, 3, cx, cy - 78, 90);
    gg.addColorStop(0, 'rgba(255, 200, 120, .5)');
    gg.addColorStop(1, 'rgba(255, 180, 74, 0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(cx, cy - 78, 90, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = P.flame;
    wobbleEllipse(cx, cy - 80, 13 * f, 26 * f, 0, 11, 1.6); ctx.fill();
    ctx.fillStyle = P.flameLt;
    wobbleEllipse(cx, cy - 74, 6 * f, 13 * f, 0, 13, 1.2); ctx.fill();
  }

  /* دماسنج */
  const tx = BX + BW + 56, ty = BY - 10, th = BH + 40;
  ctx.fillStyle = 'rgba(255,255,255,.1)';
  ctx.beginPath(); rrPath(tx - 16, ty, 32, th, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(214,224,234,.5)'; ctx.lineWidth = 2.4;
  ctx.beginPath(); rrPath(tx - 16, ty, 32, th, 16); ctx.stroke();
  ctx.fillStyle = '#d9553f';
  const hf = (S.T - 0) / 100;
  ctx.beginPath(); rrPath(tx - 7, ty + th - 30 - (th - 54) * hf, 14, (th - 54) * hf + 24, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(tx, ty + th - 18, 15, 0, TAU); ctx.fill();
  for (let d = 0; d <= 100; d += 20) {
    const y = ty + th - 30 - (th - 54) * (d / 100);
    ctx.strokeStyle = 'rgba(214,224,234,.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx + 16, y); ctx.lineTo(tx + 26, y); ctx.stroke();
    numText(fa(d), tx + 44, y, { size: 12, color: 'rgba(214,224,234,.6)' });
  }
}

function drawMeters() {
  const box = (x, y, w, label, val, unit, col) => {
    ctx.fillStyle = 'rgba(251,247,236,.95)';
    ctx.beginPath(); rrPath(x, y, w, 52, 12); ctx.fill();
    text(label, x + w - 14, y + 26, { size: 14, color: P.inkSoft, align: 'right' });
    numText(val, x + 76, y + 26, { size: 22, color: col || P.ink });
    text(unit, x + 16, y + 26, { size: 11, color: P.inkSoft, align: 'left' });
  };
  box(STAGE.x + 40, STAGE.y + 440, 240, 'دمای آب', faNum(S.T, 0), 'درجه', '#d9553f');
  box(STAGE.x + 300, STAGE.y + 440, 260, 'هوای حل‌شده', faNum(oxy(), 1), 'میلی‌گرم',
    oxy() < FISH_NEED ? P.bad : P.accent);
  /* نوارِ هوای حل‌شده */
  const bx = STAGE.x + 580, by = STAGE.y + 440;
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  ctx.beginPath(); rrPath(bx, by, 190, 52, 12); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath(); rrPath(bx + 14, by + 18, 162, 16, 8); ctx.fill();
  ctx.fillStyle = oxy() < FISH_NEED ? P.bad : P.accent;
  ctx.beginPath(); rrPath(bx + 14, by + 18, 162 * clamp(oxy() / C0, 0, 1), 16, 8); ctx.fill();
  /* خطِ نیازِ ماهی */
  const nx = bx + 14 + 162 * (FISH_NEED / C0);
  ctx.strokeStyle = P.gold; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(nx, by + 12); ctx.lineTo(nx, by + 40); ctx.stroke();
  text('نیازِ ماهی', bx + 95, by - 8, { size: 11, color: P.gold });
}

/* ───────── دفترچه ───────── */

function drawPanel() {
  paper(PAN.x, PAN.y, PAN.w, PAN.h, P.paper, 31, 16, .4);
  ctx.fillStyle = P.accent;
  ctx.beginPath(); rrPath(PAN.x, PAN.y, PAN.w, 10, 5); ctx.fill();
  text('دفترچه', PAN.x + PAN.w / 2, PAN.y + 44, { size: 26, family: 'Lalezar', color: P.ink });
  text('چهار چیز را ثبت کن', PAN.x + PAN.w / 2, PAN.y + 76, { size: 15, color: P.inkSoft });
  const si = S.phase === 'lab' ? slotFor() : -1;
  for (let i = 0; i < 4; i++) {
    const y = PAN.y + 104 + i * 88;
    const on = S.rec[i] !== null, here = si === i;
    ctx.fillStyle = on ? '#eef6f0' : (here ? '#f6f0e0' : '#f0f0e8');
    ctx.beginPath(); rrPath(PAN.x + 16, y, PAN.w - 32, 76, 12); ctx.fill();
    ctx.strokeStyle = on ? P.good : (here ? P.gold : '#d8d8cd'); ctx.lineWidth = (on || here) ? 3 : 2;
    ctx.beginPath(); rrPath(PAN.x + 16, y, PAN.w - 32, 76, 12); ctx.stroke();
    text(SLOTS[i].n, PAN.x + PAN.w - 30, y + 22, { size: 16, color: P.ink, align: 'right' });
    if (on) {
      numText(faNum(S.rec[i], i === 1 || i === 3 ? 1 : 0), PAN.x + 74, y + 50, { size: 21, color: P.good });
      text(SLOTS[i].u, PAN.x + 112, y + 50, { size: 12, color: P.inkSoft, align: 'left' });
    } else {
      text(SLOTS[i].hint, PAN.x + PAN.w / 2, y + 52, { size: 12, color: '#a49f8d' });
    }
  }
  button(BTN_REC, 'ثبت کن', {
    hot: S.hover && S.hover.k === 'rec', fill: '#2f7f96', hotFill: '#4fa3b8', size: 23 });
}

/* ───────── پردهٔ نتیجه ───────── */

function drawQuiz() {
  ctx.fillStyle = 'rgba(12, 20, 28, .96)';
  ctx.fillRect(0, HUD_H, SCENE_W, SCENE_H - HUD_H);
  text('چه نتیجه‌ای گرفتی؟', SCENE_W / 2, 132, { size: 32, family: 'Lalezar', color: P.paper });
  text('از روی همان چیزهایی که خودت دیدی و ثبت کردی', SCENE_W / 2, 176,
    { size: 16, color: 'rgba(236,242,250,.6)' });
  for (let q = 0; q < 2; q++) {
    const y = 250 + q * 160;
    text(QS[q].q, SCENE_W / 2, y, { size: 19, color: P.paper });
    if (S.mark && S.markT > 0) {
      const ok = S.mark[q];
      ctx.save();
      ctx.translate(SCENE_W / 2 - 470, y);
      ctx.fillStyle = ok ? P.good : P.bad;
      ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      if (ok) { ctx.moveTo(-6, 0); ctx.lineTo(-1, 5); ctx.lineTo(7, -6); }
      else { ctx.moveTo(-5, -5); ctx.lineTo(5, 5); ctx.moveTo(5, -5); ctx.lineTo(-5, 5); }
      ctx.stroke();
      ctx.restore();
    }
    for (let i = 0; i < QS[q].opts.length; i++) {
      const b = qOpt(q, i);
      const on = S.ans[q] === i;
      const hot = S.hover && S.hover.k === 'opt' && S.hover.q === q && S.hover.i === i;
      ctx.fillStyle = on ? P.accent : (hot ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.06)');
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.fill();
      ctx.strokeStyle = on ? '#9fd8ea' : 'rgba(214,224,234,.26)'; ctx.lineWidth = 2;
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.stroke();
      text(QS[q].opts[i], b.x + b.w / 2, b.y + b.h / 2,
        { size: QS[q].opts[i].length > 16 ? 14 : 17, color: on ? '#fff' : 'rgba(236,242,250,.85)' });
    }
  }
  button(BTN_CHECK, 'ببین درست است؟', {
    hot: S.hover && S.hover.k === 'check', fill: '#2f7f96', hotFill: '#4fa3b8', size: 22 });
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#0a1119';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224,166,63,.22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text('هوای داخلِ آب', SCENE_W - 150, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  const n = S.rec.filter((r) => r !== null).length;
  numText(fa(n) + ' / ' + fa(4), 300, HUD_H / 2, { size: 20, color: P.gold });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * (n / 4), 5, 3); ctx.fill();
}

function bubIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(63,143,196,.5)';
  ctx.beginPath(); rrPath(-30, -26, 60, 56, 8); ctx.fill();
  ctx.strokeStyle = P.glassEdge; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(-30, -26, 60, 56, 8); ctx.stroke();
  ctx.fillStyle = 'rgba(230,248,255,.9)';
  for (const [cx, cy, r] of [[-18, 2, 4], [-16, -12, 3], [18, -4, 4.6], [16, 12, 3.4], [-20, 16, 3]]) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 880, h: 310, y: 130,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: P.inkSoft,
    icon: bubIcon,
    title: 'آیا در آب هوا هست؟',
    body: 'لیوانِ آب را روی سه‌پایه گذاشته‌ایم و شمع زیرش است.\nگرمش کن و به دیوارهٔ لیوان نگاه کن.\nیک ماهی هم داری تا ببینی چه وقت به تنگ می‌آید.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 860, h: 300, y: 140,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    icon: bubIcon,
    title: 'در آب هوا هست',
    body: 'حباب‌های ریزِ روی دیواره، همان هوایی بودند که در آب حل شده بود\nو با گرم شدن بیرون زدند. برای همین ماهی می‌تواند در آب نفس بکشد —\nو برای همین آبِ گرم برای ماهی سخت‌تر است.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
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
  ctx.fillStyle = '#101822';
  ctx.beginPath(); rrPath(STAGE.x, STAGE.y, STAGE.w, STAGE.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(76,158,196,.2)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(STAGE.x, STAGE.y, STAGE.w, STAGE.h, 16); ctx.stroke();
  ctx.save();
  ctx.beginPath(); rrPath(STAGE.x, STAGE.y, STAGE.w, 400, 16); ctx.clip();
  drawBeaker();
  ctx.restore();
  drawMeters();
  button(BTN_FLAME, S.flame ? 'شمع را خاموش کن' : 'شمع را روشن کن', {
    hot: S.hover && S.hover.k === 'flame',
    fill: S.flame ? '#8a4a2a' : '#a5682a', hotFill: '#c9863b', size: 20 });
  button(BTN_FISH, S.fish ? 'ماهی را بردار' : 'ماهی را بگذار', {
    hot: S.hover && S.hover.k === 'fish', fill: '#2f6f8f', hotFill: '#4890b0', size: 20 });
  drawPanel();
  bits.draw();
  ctx.restore();
  if (S.phase === 'quiz') drawQuiz();
  drawHUD();
  toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 520;
    paper(STAGE.x + STAGE.w / 2 - w / 2, SCENE_H - 52, w, 42, P.paper, 51, 12, .3);
    text(S.tip, STAGE.x + STAGE.w / 2, SCENE_H - 31, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.08, 'rgba(4, 10, 18, .44)', 0, .1);
}

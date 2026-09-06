/*!
title: تخته و تکیه‌گاه — نیرو همه‌جا ۲ (آزمایش)
bg: #1a1f2b
*/

/* ═══════════════════════════════════════════════════════════════════════
   تخته و تکیه‌گاه — علومِ سوم، درس ۱۰ «نیرو همه‌جا (۲)»

   آزمایشِ کتاب، مو‌به‌مو:
     ۱ــ وزنه را یک بار با دست بلند کنید و بار دیگر با تخته و تکیه‌گاه.
     ۲ــ بدون تغییرِ جای تکیه‌گاه و وزنه، دست را کم‌کم به تکیه‌گاه
         نزدیک کنید. نیرو چه تغییری می‌کند؟
     ۳ــ بدون تغییرِ جای تکیه‌گاه و دست، وزنه را نزدیک کنید. نیرو چه
         تغییری می‌کند؟

   نیروسنج عددِ نیرو را نشان می‌دهد و بچّه چهار حالت را در دفترچه ثبت
   می‌کند. آخرِ کار خودش باید بگوید چه نتیجه‌ای گرفته — و داوری از روی
   همان عددهایی است که خودش ثبت کرده، نه از روی جوابِ آماده.

   ── درستیِ فیزیکی ───────────────────────────────────────────────
   تکیه‌گاه دقیقاً وسطِ تخته است، پس وزنِ خودِ تخته گشتاوری نمی‌سازد و
   تعادل فقط بینِ وزنه و دست است:

        نیروی دست × فاصلهٔ دست = وزنِ وزنه × فاصلهٔ وزنه

   یعنی نیرو = وزن × (فاصلهٔ وزنه ÷ فاصلهٔ دست). بدونِ اهرم هم نیرو
   برابرِ خودِ وزن است. همهٔ عددها از همین یک قانون می‌آید.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  bg:    '#1a1f2b', bgLo: '#11151f', bgHi: '#28303f',
  wood:  '#b98a53', woodDk: '#7d5a30', woodLt: '#dcb27c',
  steel: '#9aa9ba', steelDk: '#5d6a79', steelLt: '#d6e0ea',
  weight: '#6d7683', weightDk: '#434b56', weightLt: '#98a3b0',
  paper: '#fbf7ec', card: '#ffffff',
  ink:   '#1e2733', inkSoft: '#78838f',
  good:  '#4e9f6c', bad: '#c04a34', gold: '#e0a63f', accent: '#5b8fd6',
  gauge: '#e05a4c', hand: '#eebb90',
};

/* ───────── قانونِ اهرم ───────── */

const G = 9.81;
const MASS = 2;                  /* جرمِ وزنه، کیلوگرم */
const W = MASS * G;              /* وزنِ وزنه، نیوتون */
const PLANK_L = 1.2;             /* درازای تخته، متر */
const PXM = 430;                 /* پیکسل بر متر */
const DL_MIN = .05, DL_MAX = .55;
const DH_MIN = .05, DH_MAX = .55;

/** نیرویی که دست باید وارد کند تا تخته در تعادل بماند. */
function needForce(lever, dl, dh) {
  if (!lever) return W;           /* بدونِ اهرم، خودِ وزن */
  return W * dl / dh;
}

/* ───────── دفترچه ───────── */

const SLOTS = [
  { n: 'با دست', hint: 'بدونِ اهرم بلندش کن.' },
  { n: 'با اهرم', hint: 'وزنه دور، دستِ تو هم دور.' },
  { n: 'دست نزدیک‌تر', hint: 'وزنه سرِ جایش، دستت نزدیکِ تکیه‌گاه.' },
  { n: 'وزنه نزدیک‌تر', hint: 'دستت سرِ جایش، وزنه نزدیکِ تکیه‌گاه.' },
];

const QS = [
  { q: 'هرچه دستت از تکیه‌گاه دورتر باشد، نیرویی که لازم داری…',
    opts: ['کمتر می‌شود', 'بیشتر می‌شود', 'فرقی نمی‌کند'] },
  { q: 'هرچه وزنه به تکیه‌گاه نزدیک‌تر باشد، نیرویی که لازم داری…',
    opts: ['کمتر می‌شود', 'بیشتر می‌شود', 'فرقی نمی‌کند'] },
];

const S = {
  phase: 'intro', phaseT: 0,
  lever: true,
  dl: .40, dh: .50,
  rec: [null, null, null, null],   /* نیروی ثبت‌شده در هر خانه */
  recAt: [null, null, null, null], /* {dl, dh} */
  ans: [-1, -1], mark: null, markT: 0,
  drag: null,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
function tip(msg) { S.tip = msg; S.tipT = 4; }

const force = () => needForce(S.lever, S.dl, S.dh);
const allRec = () => S.rec.every((r) => r !== null);

/* ───────── جای‌ها ───────── */

const PAN = { x: 24, y: 96, w: 320, h: 640 };
const BEN = { x: 360, y: 96, w: 816, h: 640 };
const FUL_X = BEN.x + 406;
const PLANK_Y = BEN.y + 300;
const GROUND_Y = BEN.y + 470;
const BTN_REC = { x: PAN.x + 16, y: PAN.y + 470, w: PAN.w - 32, h: 56 };
const TAB_H = { x: BEN.x + 30, y: BEN.y + 24, w: 190, h: 44 };
const TAB_L = { x: BEN.x + 236, y: BEN.y + 24, w: 190, h: 44 };
const BTN_CHECK = { x: SCENE_W / 2 - 160, y: 640, w: 320, h: 60 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };

const weightX = () => FUL_X - S.dl * PXM;
const handX = () => FUL_X + S.dh * PXM;
function qOpt(qi, i) {
  const w = 240, gap = 16;
  return { x: SCENE_W / 2 + (1 - i) * (w + gap) - w / 2, y: 300 + qi * 168, w, h: 62 };
}

/* ───────── ورودی ───────── */

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.drag === 'w') {
    S.dl = clamp((FUL_X - p.x) / PXM, DL_MIN, DL_MAX);
    return;
  }
  if (S.drag === 'h') {
    S.dh = clamp((p.x - FUL_X) / PXM, DH_MIN, DH_MAX);
    return;
  }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else if (S.phase === 'quiz') {
    if (inRect(p, BTN_CHECK)) S.hover = { k: 'check' };
    for (let q = 0; q < 2; q++) for (let i = 0; i < 3; i++)
      if (inRect(p, qOpt(q, i))) S.hover = { k: 'opt', q, i };
  } else {
    if (inRect(p, BTN_REC)) S.hover = { k: 'rec' };
    if (inRect(p, TAB_H)) S.hover = { k: 'tabH' };
    if (inRect(p, TAB_L)) S.hover = { k: 'tabL' };
    if (Math.hypot(p.x - weightX(), p.y - (PLANK_Y - 30)) < 56) S.hover = { k: 'w' };
    else if (S.lever && Math.hypot(p.x - handX(), p.y - (PLANK_Y + 60)) < 62) S.hover = { k: 'h' };
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
      S.rec = [null, null, null, null]; S.recAt = [null, null, null, null];
      S.ans = [-1, -1]; S.mark = null; S.lever = true; S.dl = .40; S.dh = .50;
      sfx.tap();
    }
    return;
  }
  if (S.phase === 'quiz') {
    if (inRect(p, BTN_CHECK)) { checkQuiz(); return; }
    for (let q = 0; q < 2; q++) for (let i = 0; i < 3; i++) {
      if (!inRect(p, qOpt(q, i))) continue;
      S.ans[q] = S.ans[q] === i ? -1 : i; S.mark = null; sfx.tap();
      return;
    }
    return;
  }
  if (inRect(p, BTN_REC)) { record(); return; }
  if (inRect(p, TAB_H)) { S.lever = false; sfx.tap(); return; }
  if (inRect(p, TAB_L)) { S.lever = true; sfx.tap(); return; }
  if (Math.hypot(p.x - weightX(), p.y - (PLANK_Y - 30)) < 56) { S.drag = 'w'; cap(); sfx.tap(); return; }
  if (S.lever && Math.hypot(p.x - handX(), p.y - (PLANK_Y + 60)) < 62) { S.drag = 'h'; cap(); sfx.tap(); return; }
});

function release() { S.drag = null; }
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

/** این حالت به کدام خانهٔ دفترچه می‌خورد؟ */
function slotFor() {
  if (!S.lever) return 0;
  const base = S.recAt[1];
  if (S.dh >= .45 && S.dl >= .20 && (!base || Math.abs(S.dl - base.dl) < .04 || S.rec[1] === null)) {
    if (S.rec[1] === null) return 1;
  }
  if (base) {
    if (S.dh <= .22 && Math.abs(S.dl - base.dl) <= .04) return 2;
    if (S.dl <= .13 && Math.abs(S.dh - base.dh) <= .04) return 3;
  }
  return -1;
}

function record() {
  const si = slotFor();
  if (si < 0) {
    if (S.rec[1] === null) tip('برای خانهٔ دوم: وزنه دور از تکیه‌گاه و دستت هم دور.');
    else if (S.rec[2] === null && S.rec[3] === null) tip('یکی را عوض کن و آن‌یکی را سرِ جایش نگه دار.');
    else if (S.rec[2] === null) tip('دستت را نزدیکِ تکیه‌گاه ببر و وزنه را سرِ جایش نگه دار.');
    else tip('وزنه را نزدیکِ تکیه‌گاه ببر و دستت را سرِ جایش نگه دار.');
    S.shake = .12; sfx.nope();
    return;
  }
  if (S.rec[si] !== null) { tip('این خانه پر است.'); return; }
  S.rec[si] = force();
  S.recAt[si] = { dl: S.dl, dh: S.dh };
  sfx.good();
  bits.confetti(PAN.x + PAN.w / 2, PAN.y + 300, 16, [P.good, P.gold, P.card]);
  if (allRec()) { S.phase = 'quiz'; S.phaseT = 0; toast.say('حالا نتیجه', 'good'); }
  else toast.say(SLOTS[si].n + ' ثبت شد', 'good');
}

function checkQuiz() {
  if (S.ans.some((a) => a < 0)) { tip('هر دو را جواب بده.'); S.shake = .1; sfx.nope(); return; }
  /* داوری از روی عددهای خودِ بچّه */
  const cmp = (a, b) => (Math.abs(a - b) < .05 ? 2 : (a < b ? 0 : 1));
  const t0 = cmp(S.rec[1], S.rec[2]);   /* دستِ دورتر در برابرِ دستِ نزدیک */
  const t1 = cmp(S.rec[3], S.rec[1]);   /* وزنهٔ نزدیک در برابرِ وزنهٔ دور */
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

function line2(x0, y0, x1, y1, col, w, dash) {
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.restore();
}

/* ───────── نیمکت ───────── */

function drawWeight(x, y, k) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = P.weightDk;
  ctx.beginPath(); rrPath(-34, -46, 68, 50, 7); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(-32, -44, 64, 46, 6); ctx.clip();
  ctx.fillStyle = P.weight;
  ctx.fillRect(-32, -44, 64, 46);
  ctx.fillStyle = vgrad(-44, 2, 'rgba(255,255,255,.26)', 'rgba(0,0,0,.34)');
  ctx.fillRect(-32, -44, 64, 46);
  ctx.restore();
  ctx.strokeStyle = P.weightLt; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -46, 13, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#e9edf2';
  numText(fa(MASS), 0, -22, { size: 17, color: '#f2f5f8' });
  text('کیلو', 0, -6, { size: 10, color: 'rgba(242,245,248,.75)' });
  ctx.restore();
}

/** نیروسنجِ فنری. */
function drawGauge(x, yTop, f) {
  const stretch = clamp(f / 40, 0, 1) * 46;
  ctx.save();
  ctx.fillStyle = '#e9eef4';
  ctx.beginPath(); rrPath(x - 26, yTop, 52, 116, 10); ctx.fill();
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(x - 26, yTop, 52, 116, 10); ctx.stroke();
  for (let i = 0; i <= 8; i++) {
    const yy = yTop + 12 + i * 12;
    line2(x + 8, yy, x + (i % 2 ? 16 : 20), yy, '#8c98a6', i % 2 ? 1.2 : 2);
  }
  ctx.strokeStyle = P.gauge; ctx.lineWidth = 3.4;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const yy = yTop + 12 + u * (34 + stretch);
    const xx = x - 6 + Math.sin(u * 6 * TAU) * 9;
    i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
  }
  ctx.stroke();
  const iy = yTop + 12 + 34 + stretch;
  ctx.fillStyle = P.gauge;
  ctx.beginPath(); rrPath(x - 22, iy - 3, 44, 6, 3); ctx.fill();
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yTop - 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, yTop + 116); ctx.lineTo(x, yTop + 134); ctx.stroke();
  ctx.restore();
}

/** خواندنِ عددِ نیرو — همیشه یک‌جای ثابت، تا با چیزی قاطی نشود. */
function drawReading(f) {
  const x = BEN.x + 130, y = BEN.y + 552;
  ctx.fillStyle = 'rgba(251,247,236,.96)';
  ctx.beginPath(); rrPath(x - 90, y, 180, 50, 12); ctx.fill();
  text('نیرو', x + 72, y + 25, { size: 14, color: P.inkSoft, align: 'right' });
  numText(faNum(f, 1), x - 4, y + 25, { size: 22, color: P.gauge });
  text('نیوتون', x - 54, y + 25, { size: 11, color: P.inkSoft });
}

function drawHand(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.hand;
  wobbleEllipse(0, 0, 24, 19, 0, 5, 1.4); ctx.fill();
  ctx.fillStyle = '#dca87c';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); rrPath(-7 + i * 11, -22, 10, 22, 5); ctx.fill();
  }
  ctx.fillStyle = '#4f7fc4';
  ctx.beginPath(); rrPath(-20, 12, 40, 18, 8); ctx.fill();
  ctx.restore();
}

function drawBench() {
  ctx.fillStyle = '#141a26';
  ctx.beginPath(); rrPath(BEN.x, BEN.y, BEN.w, BEN.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(91,143,214,.2)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(BEN.x, BEN.y, BEN.w, BEN.h, 16); ctx.stroke();

  /* دو زبانه */
  for (const [b, on, label] of [[TAB_H, !S.lever, 'با دست'], [TAB_L, S.lever, 'با اهرم']]) {
    const hot = S.hover && ((S.hover.k === 'tabH' && b === TAB_H) || (S.hover.k === 'tabL' && b === TAB_L));
    ctx.fillStyle = on ? P.accent : (hot ? '#2b3d4c' : '#1d2534');
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.fill();
    ctx.strokeStyle = on ? '#a9c8f2' : 'rgba(214,224,234,.18)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.stroke();
    text(label, b.x + b.w / 2, b.y + b.h / 2, { size: 19, color: on ? '#f4f8ff' : 'rgba(214,224,234,.7)' });
  }

  if (!S.lever) {
    /* بلند کردنِ مستقیم با دست */
    const x = FUL_X;
    drawHand(x, PLANK_Y - 212);
    drawGauge(x, PLANK_Y - 190, force());
    drawWeight(x, PLANK_Y + 32, 1);
    drawReading(force());
    text('وزنه را مستقیم بلند کن', FUL_X, PLANK_Y + 96,
      { size: 16, color: 'rgba(224,236,246,.6)' });
    return;
  }

  /* پایهٔ تکیه‌گاه */
  ctx.save();
  ctx.beginPath(); rrPath(FUL_X - 110, GROUND_Y, 220, 18, 6); ctx.clip();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.fillRect(FUL_X - 110, GROUND_Y, 220, 18);
  ctx.restore();

  /* تکیه‌گاه */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath();
  ctx.moveTo(FUL_X, PLANK_Y + 8); ctx.lineTo(FUL_X + 52, GROUND_Y + 2);
  ctx.lineTo(FUL_X - 52, GROUND_Y + 2); ctx.closePath(); ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(FUL_X, PLANK_Y + 8); ctx.lineTo(FUL_X + 48, GROUND_Y);
  ctx.lineTo(FUL_X - 48, GROUND_Y); ctx.closePath(); ctx.clip();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.fillRect(FUL_X - 52, PLANK_Y, 104, GROUND_Y - PLANK_Y + 4);
  ctx.fillStyle = vgrad(PLANK_Y, GROUND_Y, 'rgba(255,255,255,.2)', 'rgba(0,0,0,.3)');
  ctx.fillRect(FUL_X - 52, PLANK_Y, 104, GROUND_Y - PLANK_Y + 4);
  ctx.restore();

  /* تخته */
  const half = PLANK_L / 2 * PXM;
  withShadow(14, 5, .4, () => {
    ctx.fillStyle = P.woodDk;
    ctx.beginPath(); rrPath(FUL_X - half - 8, PLANK_Y - 12, half * 2 + 16, 24, 7); ctx.fill();
  }, '10,14,22');
  ctx.save();
  ctx.beginPath(); rrPath(FUL_X - half - 6, PLANK_Y - 10, half * 2 + 12, 20, 6); ctx.clip();
  ctx.fillStyle = texWood(P.woodLt, P.woodDk);
  ctx.fillRect(FUL_X - half - 6, PLANK_Y - 10, half * 2 + 12, 20);
  ctx.fillStyle = vgrad(PLANK_Y - 10, PLANK_Y + 10, 'rgba(255,255,255,.26)', 'rgba(0,0,0,.24)');
  ctx.fillRect(FUL_X - half - 6, PLANK_Y - 10, half * 2 + 12, 20);
  ctx.restore();
  /* درجه‌بندیِ روی تخته، هر ۱۰ سانتی‌متر */
  for (let c = -5; c <= 5; c++) {
    if (!c) continue;
    const x = FUL_X + c * .1 * PXM;
    line2(x, PLANK_Y - 10, x, PLANK_Y - 3, 'rgba(70,44,18,.5)', c % 5 ? 1.4 : 2.4);
  }

  /* وزنه */
  const wx = weightX();
  drawWeight(wx, PLANK_Y - 10, 1);
  if (S.hover && S.hover.k === 'w') {
    ctx.save();
    ctx.globalAlpha = .5 + .3 * Math.sin(S.t * 3.2);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 3;
    ctx.setLineDash([8, 7]);
    ctx.beginPath(); ctx.arc(wx, PLANK_Y - 32, 52, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  /* دست و نیروسنج */
  const hx = handX();
  ctx.strokeStyle = P.steelDk; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(hx, PLANK_Y + 8); ctx.lineTo(hx, PLANK_Y + 42); ctx.stroke();
  drawGauge(hx, PLANK_Y + 62, force());
  drawHand(hx, PLANK_Y + 226);
  drawReading(force());
  if (S.hover && S.hover.k === 'h') {
    ctx.save();
    ctx.globalAlpha = .5 + .3 * Math.sin(S.t * 3.2);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 3;
    ctx.setLineDash([8, 7]);
    ctx.beginPath(); ctx.arc(hx, PLANK_Y + 60, 56, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  /* فاصله‌ها */
  const dy = PLANK_Y - 124;
  const span = (x0, x1, y, col, val) => {
    line2(x0, y, x1, y, col, 2, [6, 6]);
    line2(x0, y - 7, x0, y + 7, col, 2);
    line2(x1, y - 7, x1, y + 7, col, 2);
    ctx.fillStyle = 'rgba(20,26,38,.9)';
    ctx.beginPath(); rrPath((x0 + x1) / 2 - 46, y - 15, 92, 30, 9); ctx.fill();
    numText(fa(Math.round(val * 100)), (x0 + x1) / 2 - 8, y, { size: 15, color: col });
    text('س‌م', (x0 + x1) / 2 + 26, y, { size: 11, color: 'rgba(224,236,246,.7)' });
  };
  span(wx, FUL_X, dy, '#e9a35a', S.dl);
  span(FUL_X, hx, dy, '#7fb0e8', S.dh);
  text('وزنه و دست را بکش', BEN.x + BEN.w / 2, BEN.y + 108,
    { size: 15, color: 'rgba(224,236,246,.5)' });
}

/* ───────── دفترچه ───────── */

function drawPanel() {
  paper(PAN.x, PAN.y, PAN.w, PAN.h, P.paper, 31, 16, .4);
  ctx.fillStyle = P.accent;
  ctx.beginPath(); rrPath(PAN.x, PAN.y, PAN.w, 10, 5); ctx.fill();
  text('دفترچه', PAN.x + PAN.w / 2, PAN.y + 44, { size: 26, family: 'Lalezar', color: P.ink });
  text('چهار حالت را ثبت کن', PAN.x + PAN.w / 2, PAN.y + 74, { size: 14, color: P.inkSoft });

  const si = S.phase === 'lab' ? slotFor() : -1;
  for (let i = 0; i < 4; i++) {
    const y = PAN.y + 100 + i * 88;
    const on = S.rec[i] !== null;
    const here = si === i;
    ctx.fillStyle = on ? '#eef6f0' : (here ? '#f6f0e0' : '#f0f0e8');
    ctx.beginPath(); rrPath(PAN.x + 16, y, PAN.w - 32, 76, 12); ctx.fill();
    ctx.strokeStyle = on ? P.good : (here ? P.gold : '#d8d8cd'); ctx.lineWidth = (on || here) ? 3 : 2;
    ctx.beginPath(); rrPath(PAN.x + 16, y, PAN.w - 32, 76, 12); ctx.stroke();
    text(SLOTS[i].n, PAN.x + PAN.w - 30, y + 22, { size: 16, color: P.ink, align: 'right' });
    if (on) {
      numText(faNum(S.rec[i], 1), PAN.x + 74, y + 50, { size: 20, color: P.good });
      text('نیوتون', PAN.x + 112, y + 50, { size: 12, color: P.inkSoft, align: 'left' });
      const at = S.recAt[i];
      if (at && i > 0) {
        text('وزنه ' + fa(Math.round(at.dl * 100)) + ' • دست ' + fa(Math.round(at.dh * 100)),
          PAN.x + PAN.w - 30, y + 52, { size: 11, color: P.inkSoft, align: 'right' });
      }
    } else {
      text(SLOTS[i].hint, PAN.x + PAN.w / 2, y + 52, { size: 12, color: '#a49f8d' });
    }
  }
  button(BTN_REC, 'ثبت کن', {
    hot: S.hover && S.hover.k === 'rec', fill: '#3f6fb5', hotFill: '#5b8fd6', size: 24 });
}

/* ───────── پردهٔ نتیجه ───────── */

function drawQuiz() {
  ctx.fillStyle = 'rgba(16, 20, 30, .96)';
  ctx.fillRect(0, HUD_H, SCENE_W, SCENE_H - HUD_H);
  text('چه نتیجه‌ای گرفتی؟', SCENE_W / 2, 130, { size: 32, family: 'Lalezar', color: P.paper });
  text('از روی عددهایی که خودت ثبت کردی', SCENE_W / 2, 172,
    { size: 16, color: 'rgba(236,242,250,.6)' });
  for (let q = 0; q < 2; q++) {
    const y = 250 + q * 168;
    text(QS[q].q, SCENE_W / 2, y, { size: 19, color: P.paper });
    if (S.mark && S.markT > 0) {
      const ok = S.mark[q];
      ctx.fillStyle = ok ? P.good : P.bad;
      ctx.beginPath(); ctx.arc(SCENE_W / 2 - 430, y, 13, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      if (ok) { ctx.moveTo(-6, 0); ctx.lineTo(-1, 5); ctx.lineTo(7, -6); }
      else { ctx.moveTo(-5, -5); ctx.lineTo(5, 5); ctx.moveTo(5, -5); ctx.lineTo(-5, 5); }
      ctx.save();
      ctx.translate(SCENE_W / 2 - 430, y);
      ctx.stroke();
      ctx.restore();
    }
    for (let i = 0; i < 3; i++) {
      const b = qOpt(q, i);
      const on = S.ans[q] === i;
      const hot = S.hover && S.hover.k === 'opt' && S.hover.q === q && S.hover.i === i;
      ctx.fillStyle = on ? P.accent : (hot ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.06)');
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.fill();
      ctx.strokeStyle = on ? '#a9c8f2' : 'rgba(214,224,234,.26)'; ctx.lineWidth = 2;
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.stroke();
      text(QS[q].opts[i], b.x + b.w / 2, b.y + b.h / 2,
        { size: 17, color: on ? '#fff' : 'rgba(236,242,250,.85)' });
    }
  }
  button(BTN_CHECK, 'ببین درست است؟', {
    hot: S.hover && S.hover.k === 'check', fill: '#3f6fb5', hotFill: '#5b8fd6', size: 22 });
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#0d111a';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224,166,63,.22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text('تخته و تکیه‌گاه', SCENE_W - 150, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  const n = S.rec.filter((r) => r !== null).length;
  numText(fa(n) + ' / ' + fa(4), 300, HUD_H / 2, { size: 20, color: P.gold });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * (n / 4), 5, 3); ctx.fill();
}

function leverIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.woodDk;
  ctx.beginPath();
  ctx.moveTo(0, 2); ctx.lineTo(18, 26); ctx.lineTo(-18, 26);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.wood;
  ctx.beginPath(); rrPath(-62, -6, 124, 12, 5); ctx.fill();
  ctx.fillStyle = P.weight;
  ctx.beginPath(); rrPath(-56, -28, 30, 24, 5); ctx.fill();
  ctx.strokeStyle = P.gauge; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(44, 8); ctx.lineTo(44, 30); ctx.stroke();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 880, h: 310, y: 130,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: P.inkSoft,
    icon: leverIcon,
    title: 'تخته و تکیه‌گاه',
    body: 'یک وزنهٔ دو کیلویی داریم و یک نیروسنج که می‌گوید چقدر زور لازم است.\nیک بار مستقیم بلندش کن، بعد با تخته و تکیه‌گاه.\nبعد جای دست و جای وزنه را عوض کن و هر بار عدد را ثبت کن.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#3f6fb5', btnHotFill: '#5b8fd6',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 840, h: 300, y: 140,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    icon: leverIcon,
    title: 'نتیجه‌ات درست بود',
    body: 'با اهرم، همان وزنه را با نیروی کمتری بلند کردی.\nدستِ دورتر از تکیه‌گاه و وزنهٔ نزدیک‌تر به آن، کار را آسان‌تر کرد —\nهمان کاری که پدرِ علی با تنهٔ درخت کرد.',
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
  drawBench();
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
    const w = 540;
    paper(BEN.x + BEN.w / 2 - w / 2, SCENE_H - 54, w, 42, P.paper, 51, 12, .3);
    text(S.tip, BEN.x + BEN.w / 2, SCENE_H - 33, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.08, 'rgba(6, 10, 20, .44)', 0, .1);
}

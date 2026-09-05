/*!
title: کارگاهِ آینه — جست‌وجو کنیم و بسازیم (بازی)
bg: #1d1a26
*/

/* ═══════════════════════════════════════════════════════════════════════
   کارگاهِ آینه — علومِ سوم، درس ۸ «جست‌وجو کنیم و بسازیم»  (بازی)

   کتاب می‌گوید با یک لولهٔ مقوّایی، یک بادکنک، زَرورق و چند حلقه‌کش
   خودت آینه بساز؛ بعد بادکنک را به بیرون بکش و به داخل فشار بده و
   ببین تصویرت چه می‌شود.

   اینجا همان کار است: اوّل آینه را می‌سازی — بادکنک را می‌بُری، روی
   لوله می‌کشی، کش می‌اندازی و چروک‌هایش را صاف می‌کنی — و بعد با
   پمپِ کوچک، غشا را فرو می‌بری یا بیرون می‌آوری.

   ── درستیِ فیزیکی ───────────────────────────────────────────────
   غشای کشیده‌شده یک «کلاهکِ کره» است. اگر شعاعِ دهانه a و بلندیِ
   برآمدگی s باشد، شعاعِ خمیدگیِ آن از هندسه به دست می‌آید:

           شعاعِ خمیدگی = (a² + s²) ÷ (۲s) ،   کانون = شعاع ÷ ۲

   و تصویر از همان قانونِ آینهٔ کروی می‌آید:
           ۱/فاصلهٔ جسم + ۱/فاصلهٔ تصویر = ۱/کانون
           بزرگ‌نمایی = − فاصلهٔ تصویر ÷ فاصلهٔ جسم

   پس هرچه بیشتر فشار بدهی، آینه گودتر و کانون نزدیک‌تر می‌شود؛ و
   همان‌طور که کتاب می‌پرسد، تصویر با فاصلهٔ جسم هم عوض می‌شود.
   بازی هیچ‌کدام از این‌ها را نمی‌گوید — فقط می‌گذارد ببینی.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  bg:    '#1d1a26', bgLo: '#141119', bgHi: '#2b2636',
  wood:  '#8f6a42', woodDk: '#543d24', woodLt: '#b98d5c',
  tube:  '#c9a077', tubeDk: '#8d6b48',
  balloon: '#e2607f', balloonDk: '#a8394f', balloonLt: '#ff9db4',
  foil:  '#dfe8f2', foilDk: '#8d9bb0', foilLo: '#5b697d',
  band:  '#6ac0a8', bandDk: '#3d8571',
  paper: '#fbf6ea', card: '#ffffff',
  ink:   '#241d2c', inkSoft: '#7d7590',
  good:  '#5fb07f', bad: '#cd6a52', gold: '#e0a63f', accent: '#7f9fd8',
  toyA:  '#e05a4c', toyB: '#4f7fc4', toyC: '#f0c34a', skin: '#eebb90',
};

/* ───────── قانونِ آینهٔ ساخته‌شده ───────── */

const APER = 40;              /* شعاعِ دهانهٔ لوله، میلی‌متر */
const S_MAX = 14;             /* بیشترین فرورفتگی یا برآمدگی، میلی‌متر */
const FLAT_S = .4;            /* کمتر از این، غشا تخت است */

/** شعاعِ خمیدگیِ کلاهکِ کره از هندسه. */
const radiusOf = (s) => (APER * APER + s * s) / (2 * Math.abs(s));
/** کانون؛ مثبت برای فرورفته، منفی برای برآمده، بی‌نهایت برای تخت. */
function focalOf(s) {
  if (Math.abs(s) < FLAT_S) return Infinity;
  const f = radiusOf(s) / 2;
  return s > 0 ? f : -f;
}
/** بزرگ‌نمایی؛ منفی یعنی وارونه. */
function magOf(s, d) {
  const f = focalOf(s);
  if (!isFinite(f)) return 1;
  if (Math.abs(d - f) < 1e-6) return 999;
  const di = d * f / (d - f);
  return -di / d;
}

/* ───────── آلبومِ عکس‌ها ───────── */

const SHOTS = [
  { n: 'به همان اندازه', test: (m) => m > 0 && Math.abs(m - 1) < .06 },
  { n: 'کمی کوچک‌تر',    test: (m) => m > .32 && m < .72 },
  { n: 'خیلی کوچک',      test: (m) => m > 0 && m <= .3 },
  { n: 'بزرگ‌تر',        test: (m) => m > 1.6 },
  { n: 'وارونه',         test: (m) => m < 0 && Math.abs(m) <= 1.2 },
  { n: 'وارونه و بزرگ',  test: (m) => m < 0 && Math.abs(m) > 1.8 },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  build: 0,              /* گامِ ساخت ۰..۳ */
  cut: 0,                /* پیشرفتِ بریدن */
  cutX: null,
  onTube: false,
  bands: [false, false],
  wrinkle: [1, 1, 1, 1, 1, 1],
  s: 0,                  /* فرورفتگیِ غشا، میلی‌متر */
  toy: 300,              /* فاصلهٔ اسباب‌بازی، میلی‌متر */
  album: SHOTS.map(() => 0),
  flash: 0, shotT: 0,
  drag: null,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
function tip(msg) { S.tip = msg; S.tipT = 3.4; }

const curMag = () => magOf(S.s, S.toy);
const doneAll = () => S.album.every((v) => v);

/* ───────── جای‌ها ───────── */

/* پردهٔ ساخت */
const BAL0 = { x: 340, y: 430 };            /* بادکنک روی میز */
const CUT_Y = 430, CUT_X0 = 190, CUT_X1 = 256;
const TUBE = { x: 830, y: 300, w: 180, h: 250 };   /* لولهٔ ایستاده */
const MOUTH = { x: 920, y: 300, rx: 90, ry: 30 };
const HOOK = [{ x: 200, y: 214 }, { x: 200, y: 300 }];

/* پردهٔ آلبوم */
const VIEW = { x: 24, y: 72, w: 512, h: 548 };
const BEN = { x: 552, y: 72, w: 624, h: 548 };
const MIR = { x: VIEW.x + VIEW.w / 2, y: VIEW.y + 236, r: 168 };
const MX = BEN.x + BEN.w - 96;             /* رأسِ آینه روی نیمکت */
const BY = BEN.y + 330;                    /* خطِ نیمکت */
const PXMM = 1.16;
const TOY_MIN = 46, TOY_MAX = 420;
const PUMP = { x: BEN.x + 40, y: BEN.y + 430, w: BEN.w - 80, h: 40 };
const BTN_SHOT = { x: VIEW.x + 126, y: VIEW.y + 452, w: 260, h: 64 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };
function filmRect(i) { return { x: 26 + i * 192, y: 636, w: 180, h: 108 }; }

const toyX = () => MX - S.toy * PXMM;

/* ───────── ورودی ───────── */

function setPump(px) {
  const u = clamp((px - PUMP.x) / PUMP.w, 0, 1);
  let s = (u * 2 - 1) * S_MAX;
  if (Math.abs(s) < FLAT_S) s = 0;
  S.s = Math.round(s * 10) / 10;
}
const pumpX = () => PUMP.x + PUMP.w * (S.s / S_MAX + 1) / 2;

function setToy(px) { S.toy = clamp(Math.round((MX - px) / PXMM), TOY_MIN, TOY_MAX); }

function takeShot() {
  const m = curMag();
  for (let i = 0; i < SHOTS.length; i++) {
    if (S.album[i] || !SHOTS[i].test(m)) continue;
    S.album[i] = 1;
    S.flash = .5; S.shotT = 1.2;
    sfx.good();
    bits.confetti(MIR.x, MIR.y, 22, [P.gold, P.card, P.accent]);
    if (doneAll()) { S.phase = 'won'; S.phaseT = 0; sfx.win(); }
    else toast.say(SHOTS[i].n, 'good');
    return;
  }
  tip('این تصویر هنوز به هیچ‌کدام از قاب‌ها نمی‌خورد.');
  S.shake = .12; sfx.nope();
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.drag === 'pump') { setPump(p.x); return; }
  if (S.drag === 'toy') { setToy(p.x); return; }
  if (S.drag === 'cut' && S.build === 0) {
    if (Math.abs(p.y - CUT_Y) < 46 && p.x > CUT_X0 - 40 && p.x < CUT_X1 + 40) {
      const u = clamp((p.x - CUT_X0) / (CUT_X1 - CUT_X0), 0, 1);
      if (S.cutX === null || u > S.cutX) { S.cut = Math.max(S.cut, u); S.cutX = u; }
      if (S.cut >= .96) { S.build = 1; S.drag = null; sfx.pop(); }
    }
    return;
  }
  if (S.drag === 'bal' && S.build === 1) {
    S.balP = p;
    if (Math.hypot(p.x - MOUTH.x, (p.y - MOUTH.y) * 1.6) < 90) {
      S.onTube = true; S.build = 2; S.drag = null; sfx.place();
    }
    return;
  }
  if (typeof S.drag === 'object' && S.drag && S.drag.k === 'band') {
    S.drag.p = p;
    if (Math.hypot(p.x - MOUTH.x, (p.y - MOUTH.y - 30) * 1.4) < 96) {
      S.bands[S.drag.i] = true;
      S.drag = null;
      sfx.place();
      if (S.bands.every(Boolean)) S.build = 3;
    }
    return;
  }
  if (S.drag === 'smooth' && S.build === 3) {
    let n = 0;
    S.wrinkle.forEach((w, i) => {
      if (!w) return;
      const q = wrinkleAt(i);
      if (Math.hypot(p.x - q.x, p.y - q.y) < 34) { S.wrinkle[i] = 0; sfx.tick(); }
      else n++;
    });
    if (S.wrinkle.every((w) => !w)) {
      S.build = 4; S.drag = null;
      S.phase = 'album'; S.phaseT = 0;
      sfx.win();
      bits.confetti(MOUTH.x, MOUTH.y, 30, [P.foil, P.gold, P.band]);
    }
    return;
  }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else if (S.phase === 'album') {
    if (inRect(p, BTN_SHOT)) S.hover = { k: 'shot' };
    if (Math.abs(p.x - pumpX()) < 30 && Math.abs(p.y - (PUMP.y + PUMP.h / 2)) < 34) S.hover = { k: 'pump' };
    if (Math.abs(p.x - toyX()) < 40 && p.y > BY - 120 && p.y < BY + 16) S.hover = { k: 'toy' };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  const cap = () => { try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ } };
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { S.phase = 'build'; S.phaseT = 0; sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) {
      S.phase = 'intro'; S.phaseT = 0;
      S.build = 0; S.cut = 0; S.cutX = null; S.onTube = false;
      S.bands = [false, false]; S.wrinkle = [1, 1, 1, 1, 1, 1];
      S.album = SHOTS.map(() => 0); S.s = 0; S.toy = 300;
      sfx.tap();
    }
    return;
  }
  if (S.phase === 'build') {
    if (S.build === 0 && Math.abs(p.y - CUT_Y) < 60 && p.x > CUT_X0 - 60 && p.x < CUT_X1 + 60) {
      S.drag = 'cut'; S.cutX = null; cap(); sfx.slide(); return;
    }
    if (S.build === 1 && Math.hypot(p.x - BAL0.x, p.y - BAL0.y) < 110) {
      S.drag = 'bal'; S.balP = p; cap(); sfx.tap(); return;
    }
    if (S.build === 2) {
      for (let i = 0; i < 2; i++) {
        if (S.bands[i]) continue;
        if (Math.hypot(p.x - HOOK[i].x, p.y - HOOK[i].y) < 46) {
          S.drag = { k: 'band', i, p }; cap(); sfx.tap(); return;
        }
      }
    }
    if (S.build === 3) { S.drag = 'smooth'; cap(); return; }
    return;
  }
  /* پردهٔ آلبوم */
  if (inRect(p, BTN_SHOT)) { takeShot(); return; }
  if (inRect(p, PUMP) || (Math.abs(p.x - pumpX()) < 30 && Math.abs(p.y - (PUMP.y + PUMP.h / 2)) < 36)) {
    S.drag = 'pump'; setPump(p.x); cap(); sfx.tap(); return;
  }
  if (Math.abs(p.x - toyX()) < 40 && p.y > BY - 120 && p.y < BY + 16) {
    S.drag = 'toy'; cap(); sfx.tap(); return;
  }
});

function release() {
  if (S.drag === 'cut' && S.cut < .96) S.cut = 0;
  S.drag = null; S.cutX = null;
}
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
addEventListener('blur', release);

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.flash > 0) S.flash -= dt;
  if (S.shotT > 0) S.shotT -= dt;
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

function glowRing(x, y, r, col) {
  ctx.save();
  ctx.globalAlpha = .35 + .3 * Math.sin(S.t * 3.4);
  ctx.strokeStyle = col; ctx.lineWidth = 4;
  ctx.setLineDash([10, 9]);
  ctx.lineDashOffset = -S.t * 24;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.restore();
}

function wrinkleAt(i) {
  const a = i * TAU / 6 + .4;
  return { x: MOUTH.x + Math.cos(a) * 52, y: MOUTH.y + Math.sin(a) * 17 };
}

/* ───────── اسباب‌بازی ───────── */

/** آدمکِ اسباب‌بازی: کلاهِ قرمز بالا، پایهٔ زرد پایین — وارونگی پیداست. */
function drawToy(x, base, k, flip) {
  ctx.save();
  ctx.translate(x, base);
  ctx.scale(k, (flip ? -1 : 1) * k);
  /* پایه */
  ctx.fillStyle = P.toyC;
  ctx.beginPath(); rrPath(-30, -14, 60, 14, 5); ctx.fill();
  /* تن */
  ctx.fillStyle = P.toyB;
  ctx.beginPath(); rrPath(-22, -62, 44, 50, 12); ctx.fill();
  /* دست‌ها */
  ctx.strokeStyle = P.toyB; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-20, -50); ctx.lineTo(-34, -34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(20, -50); ctx.lineTo(34, -34); ctx.stroke();
  /* سر */
  ctx.fillStyle = P.skin;
  ctx.beginPath(); ctx.arc(0, -78, 19, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3a2b22';
  ctx.beginPath(); ctx.arc(-6, -80, 2.6, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -80, 2.6, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#8a5a44'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(0, -74, 7, .3, Math.PI - .3); ctx.stroke();
  /* کلاه */
  ctx.fillStyle = P.toyA;
  ctx.beginPath(); rrPath(-24, -100, 48, 8, 4); ctx.fill();
  ctx.beginPath(); rrPath(-14, -116, 28, 18, 6); ctx.fill();
  ctx.restore();
}

/* ───────── پردهٔ ساخت ───────── */

function drawBalloon(x, y, cut) {
  ctx.save();
  ctx.translate(x, y);
  /* گردنِ بادکنک — با پیشرفتِ بریدن کوتاه می‌شود */
  if (cut < .96) {
    ctx.fillStyle = P.balloonDk;
    ctx.beginPath();
    rrPath(-166 + cut * 76, -15, 96 - cut * 76, 30, 11);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.beginPath(); rrPath(-160 + cut * 76, -11, 84 - cut * 76, 6, 3); ctx.fill();
  }
  const g = ctx.createRadialGradient(-24, -30, 8, 0, 0, 96);
  g.addColorStop(0, P.balloonLt); g.addColorStop(.55, P.balloon); g.addColorStop(1, P.balloonDk);
  ctx.fillStyle = g;
  wobbleEllipse(0, 0, 86, 72, 0, 7, 2.4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  wobbleEllipse(-30, -32, 20, 12, -.5, 3, 1.2); ctx.fill();
  ctx.restore();
}

function drawScissors(x, y, a) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(a);
  ctx.strokeStyle = P.foilDk; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(34, -13); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(34, 13); ctx.stroke();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(-18, -11, 11, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(-18, 11, 11, 0, TAU); ctx.stroke();
  ctx.fillStyle = P.foil;
  ctx.beginPath(); ctx.arc(-6, 0, 4, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawTube(withSkin) {
  /* بدنهٔ لوله */
  ctx.save();
  ctx.beginPath(); rrPath(MOUTH.x - MOUTH.rx, MOUTH.y, MOUTH.rx * 2, TUBE.h, 8); ctx.clip();
  ctx.fillStyle = texWood(P.tube, '#8a6238');
  ctx.fillRect(MOUTH.x - MOUTH.rx, MOUTH.y, MOUTH.rx * 2, TUBE.h);
  ctx.fillStyle = vgrad(MOUTH.y, MOUTH.y + TUBE.h, 'rgba(255,255,255,.16)', 'rgba(0,0,0,.42)');
  ctx.fillRect(MOUTH.x - MOUTH.rx, MOUTH.y, MOUTH.rx * 2, TUBE.h);
  ctx.restore();
  /* دهانه */
  ctx.fillStyle = withSkin ? P.balloon : '#2a2130';
  ctx.beginPath(); ctx.ellipse(MOUTH.x, MOUTH.y, MOUTH.rx, MOUTH.ry, 0, 0, TAU); ctx.fill();
  if (withSkin) {
    const g = ctx.createRadialGradient(MOUTH.x - 26, MOUTH.y - 8, 6, MOUTH.x, MOUTH.y, MOUTH.rx);
    g.addColorStop(0, P.balloonLt); g.addColorStop(1, P.balloonDk);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(MOUTH.x, MOUTH.y, MOUTH.rx, MOUTH.ry, 0, 0, TAU); ctx.fill();
  }
  ctx.strokeStyle = P.tubeDk; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(MOUTH.x, MOUTH.y, MOUTH.rx, MOUTH.ry, 0, 0, TAU); ctx.stroke();
  /* حلقه‌های کش */
  S.bands.forEach((on, i) => {
    if (!on) return;
    ctx.strokeStyle = i ? P.bandDk : P.band; ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.ellipse(MOUTH.x, MOUTH.y + 24 + i * 18, MOUTH.rx + 3, MOUTH.ry + 2, 0, 0, TAU);
    ctx.stroke();
  });
}

const BUILD_TIP = [
  'با قیچی، سرِ بادکنک را ببُر — انگشتت را روی خطِ چین بکش.',
  'بادکنک را بکش روی دهانهٔ لوله.',
  'دو حلقه‌کش را بینداز دورِ لوله.',
  'چروک‌ها را با انگشت صاف کن.',
];

function drawBuild() {
  ctx.save();
  /* میزِ کار */
  ctx.beginPath(); rrPath(24, 96, SCENE_W - 48, SCENE_H - 140, 18); ctx.clip();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.fillRect(24, 96, SCENE_W - 48, SCENE_H - 140);
  ctx.fillStyle = vgrad(96, SCENE_H - 44, 'rgba(255,255,255,.1)', 'rgba(0,0,0,.4)');
  ctx.fillRect(24, 96, SCENE_W - 48, SCENE_H - 140);
  ctx.restore();

  drawTube(S.onTube);

  /* بادکنک */
  if (!S.onTube) {
    const at = (S.drag === 'bal' && S.balP) ? S.balP : BAL0;
    drawBalloon(at.x, at.y, S.cut);
    if (S.build === 0) {
      /* خطِ چینِ برش و قیچی */
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3;
      ctx.setLineDash([9, 8]);
      ctx.beginPath(); ctx.moveTo(CUT_X0, CUT_Y); ctx.lineTo(CUT_X1, CUT_Y); ctx.stroke();
      ctx.restore();
      drawScissors(CUT_X0 + (CUT_X1 - CUT_X0) * S.cut, CUT_Y - 26, .2 + Math.sin(S.t * 8) * .12 * (S.drag === 'cut' ? 1 : 0));
      glowRing((CUT_X0 + CUT_X1) / 2, CUT_Y, 76, P.gold);
    } else if (S.build === 1) {
      glowRing(BAL0.x, BAL0.y, 96, P.gold);
      glowRing(MOUTH.x, MOUTH.y, 100, P.band);
    }
  }

  /* حلقه‌های کشِ روی قلّاب */
  if (S.build <= 2) {
    HOOK.forEach((h, i) => {
      if (S.bands[i]) return;
      ctx.fillStyle = P.woodDk;
      ctx.beginPath(); rrPath(h.x - 5, h.y - 34, 10, 26, 4); ctx.fill();
      ctx.fillStyle = P.foilDk;
      ctx.beginPath(); ctx.arc(h.x, h.y - 34, 7, 0, TAU); ctx.fill();
      const at = (S.drag && S.drag.k === 'band' && S.drag.i === i) ? S.drag.p : h;
      ctx.strokeStyle = i ? P.bandDk : P.band; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.ellipse(at.x, at.y, 30, 22, .3, 0, TAU); ctx.stroke();
      if (S.build === 2) glowRing(at.x, at.y, 44, P.band);
    });
  }

  /* چروک‌ها */
  if (S.build === 3) {
    S.wrinkle.forEach((w, i) => {
      if (!w) return;
      const q = wrinkleAt(i);
      ctx.strokeStyle = 'rgba(80,30,50,.6)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(q.x - 12, q.y + k * 5);
        ctx.quadraticCurveTo(q.x, q.y + k * 5 - 5, q.x + 12, q.y + k * 5);
        ctx.stroke();
      }
      glowRing(q.x, q.y, 26, P.gold);
    });
  }

  /* راهنمای گام */
  const w = 620;
  paper(SCENE_W / 2 - w / 2, 108, w, 52, P.paper, 61, 14, .35);
  text(BUILD_TIP[Math.min(S.build, 3)], SCENE_W / 2, 134, { size: 18, color: P.ink });
  /* دانه‌های گام */
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i < S.build ? P.good : (i === S.build ? P.gold : 'rgba(255,255,255,.3)');
    ctx.beginPath(); ctx.arc(SCENE_W / 2 - 30 + i * 20, 176, 7, 0, TAU); ctx.fill();
  }
}

/* ───────── پردهٔ آلبوم ───────── */

/** نیمرخِ غشا: کلاهکِ کره با همان بلندیِ s. */
function membranePath(cx, cy, halfH, s) {
  const px = s * PXMM * 4;          /* بلندیِ برآمدگی روی صحنه */
  ctx.beginPath();
  ctx.moveTo(cx, cy - halfH);
  ctx.quadraticCurveTo(cx - px * 1.34, cy, cx, cy + halfH);
}

function drawBench() {
  ctx.fillStyle = '#221d2c';
  ctx.beginPath(); rrPath(BEN.x, BEN.y, BEN.w, BEN.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(127,159,216,.22)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(BEN.x, BEN.y, BEN.w, BEN.h, 16); ctx.stroke();
  text('روی میز', BEN.x + BEN.w - 24, BEN.y + 28, { size: 16, color: 'rgba(240,236,250,.5)', align: 'right' });

  /* میزِ چوبی */
  ctx.save();
  ctx.beginPath(); rrPath(BEN.x + 20, BY, BEN.w - 40, 16, 6); ctx.clip();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.fillRect(BEN.x + 20, BY, BEN.w - 40, 16);
  ctx.restore();

  /* خط‌کشِ سانتی‌متری */
  const ry = BY + 34;
  line2(BEN.x + 28, ry, MX, ry, 'rgba(240,236,250,.3)', 2);
  for (let c = 0; c <= 44; c += 2) {
    const x = MX - c * 10 * PXMM;
    if (x < BEN.x + 28) break;
    const big = c % 10 === 0;
    line2(x, ry, x, ry + (big ? 11 : 6), 'rgba(240,236,250,.3)', big ? 2 : 1.3);
    if (big && c) numText(fa(c), x, ry + 24, { size: 12, color: 'rgba(240,236,250,.55)' });
  }

  /* لولهٔ خوابیده با غشا رو به چپ */
  const halfH = 64;
  ctx.save();
  ctx.beginPath(); rrPath(MX, BY - halfH - 6, 86, halfH * 2 + 12, 10); ctx.clip();
  ctx.fillStyle = texWood(P.tube, '#8a6238');
  ctx.fillRect(MX, BY - halfH - 6, 86, halfH * 2 + 12);
  ctx.fillStyle = vgrad(BY - halfH, BY + halfH, 'rgba(255,255,255,.14)', 'rgba(0,0,0,.4)');
  ctx.fillRect(MX, BY - halfH - 6, 86, halfH * 2 + 12);
  ctx.restore();
  /* غشای زَرورقی */
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = P.foilLo; ctx.lineWidth = 12;
  membranePath(MX, BY, halfH, S.s); ctx.stroke();
  const g = ctx.createLinearGradient(MX - 30, 0, MX + 10, 0);
  g.addColorStop(0, P.foil); g.addColorStop(1, P.foilDk);
  ctx.strokeStyle = g; ctx.lineWidth = 7;
  membranePath(MX, BY, halfH, S.s); ctx.stroke();
  ctx.restore();
  /* کش‌ها */
  for (let i = 0; i < 2; i++) {
    ctx.strokeStyle = i ? P.bandDk : P.band; ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(MX + 14 + i * 16, BY - halfH - 4);
    ctx.lineTo(MX + 14 + i * 16, BY + halfH + 4);
    ctx.stroke();
  }

  /* اسباب‌بازی روی میز */
  const tx = toyX();
  contact(tx, BY + 2, 40, 9, .5);
  drawToy(tx, BY, .78, false);
  if (S.hover && S.hover.k === 'toy') glowRing(tx, BY - 46, 62, P.gold);

  /* فاصله */
  line2(tx, BY + 20, MX, BY + 20, 'rgba(224,166,63,.7)', 2, [7, 6]);
  const mid = (tx + MX) / 2;
  ctx.fillStyle = 'rgba(251,246,234,.92)';
  ctx.beginPath(); rrPath(mid - 62, BY - 178, 124, 34, 9); ctx.fill();
  numText(fa(Math.round(S.toy / 10)), mid - 16, BY - 161, { size: 18, color: P.ink });
  text('سانتی‌متر', mid + 26, BY - 161, { size: 12, color: P.inkSoft });

  /* پمپ */
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  ctx.beginPath(); rrPath(PUMP.x, PUMP.y + 12, PUMP.w, 16, 8); ctx.fill();
  ctx.fillStyle = 'rgba(127,159,216,.35)';
  ctx.beginPath(); ctx.arc(PUMP.x + PUMP.w / 2, PUMP.y + 20, 5, 0, TAU); ctx.fill();
  const px = pumpX();
  withShadow(12, 5, .5, () => {
    ctx.fillStyle = S.hover && S.hover.k === 'pump' ? P.gold : '#c9cede';
    wobbleRect(px - 22, PUMP.y - 6, 44, PUMP.h + 12, 10, 7, 1.2); ctx.fill();
  }, '0,0,0');
  ctx.strokeStyle = 'rgba(40,30,60,.45)'; ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(px + i * 7, PUMP.y + 4); ctx.lineTo(px + i * 7, PUMP.y + PUMP.h - 4);
    ctx.stroke();
  }
  text('بیرون بکش', PUMP.x + 56, PUMP.y + 56, { size: 14, color: 'rgba(240,236,250,.55)' });
  text('فشار بده', PUMP.x + PUMP.w - 52, PUMP.y + 56, { size: 14, color: 'rgba(240,236,250,.55)' });
}

function line2(x0, y0, x1, y1, col, w, dash) {
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.restore();
}

function drawView() {
  ctx.fillStyle = '#221d2c';
  ctx.beginPath(); rrPath(VIEW.x, VIEW.y, VIEW.w, VIEW.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(127,159,216,.22)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(VIEW.x, VIEW.y, VIEW.w, VIEW.h, 16); ctx.stroke();
  text('در آینه چه می‌بینی', VIEW.x + VIEW.w - 24, VIEW.y + 28,
    { size: 16, color: 'rgba(240,236,250,.5)', align: 'right' });

  /* قابِ فلزیِ آینه */
  withShadow(22, 8, .5, () => {
    ctx.fillStyle = P.tubeDk;
    ctx.beginPath(); ctx.arc(MIR.x, MIR.y, MIR.r + 16, 0, TAU); ctx.fill();
  }, '0,0,0');
  ctx.fillStyle = P.band;
  ctx.beginPath(); ctx.arc(MIR.x, MIR.y, MIR.r + 8, 0, TAU); ctx.fill();

  /* رویهٔ آینه */
  ctx.save();
  ctx.beginPath(); ctx.arc(MIR.x, MIR.y, MIR.r, 0, TAU); ctx.clip();
  const dish = clamp(S.s / S_MAX, -1, 1);
  const g = ctx.createRadialGradient(
    MIR.x - 40 * (1 - dish), MIR.y - 46 * (1 - dish), 10,
    MIR.x, MIR.y, MIR.r * 1.1);
  g.addColorStop(0, dish > 0 ? '#8ea3b8' : '#f2f7fc');
  g.addColorStop(.55, '#b9c8dc');
  g.addColorStop(1, dish > 0 ? '#e6eef7' : '#6d7d92');
  ctx.fillStyle = g;
  ctx.fillRect(MIR.x - MIR.r, MIR.y - MIR.r, MIR.r * 2, MIR.r * 2);

  /* تصویرِ اسباب‌بازی */
  const m = curMag();
  const am = Math.abs(m);
  /* بزرگ‌نماییِ خیلی زیاد را فشرده می‌کنیم تا تصویر از قاب بیرون نزند؛
     ترتیبِ بزرگی و وارونگی همان چیزی است که فیزیک می‌گوید. */
  const k = am <= 1.4 ? Math.max(am, .07) : Math.min(2.3, 1.4 + (am - 1.4) * .12);
  ctx.save();
  ctx.globalAlpha = .96;
  drawToy(MIR.x, MIR.y + (m < 0 ? -62 : 62) * k, k, m < 0);
  ctx.restore();

  /* برقِ آینه */
  ctx.globalAlpha = .3;
  ctx.fillStyle = '#ffffff';
  wobbleEllipse(MIR.x - 62, MIR.y - 94, 46, 22, -.5, 3, 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  if (S.flash > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.flash * 2, 0, 1);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(MIR.x, MIR.y, MIR.r, 0, TAU); ctx.fill();
    ctx.restore();
  }

  button(BTN_SHOT, 'عکس بگیر', {
    hot: S.hover && S.hover.k === 'shot', fill: '#b07a2e', hotFill: '#d29a45', size: 26 });
}

function drawFilm() {
  for (let i = 0; i < SHOTS.length; i++) {
    const r = filmRect(i);
    ctx.fillStyle = S.album[i] ? '#f4efe2' : 'rgba(255,255,255,.06)';
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 12); ctx.fill();
    ctx.strokeStyle = S.album[i] ? P.gold : 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;
    ctx.setLineDash(S.album[i] ? [] : [7, 6]);
    ctx.beginPath(); rrPath(r.x, r.y, r.w, r.h, 12); ctx.stroke();
    ctx.setLineDash([]);
    /* نشانهٔ خواسته: آدمکِ کوچکِ نمونه */
    const kk = [.5, .3, .16, .7, .4, .7][i], fl = i >= 4;
    const ix = r.x + 42;
    ctx.save();
    ctx.globalAlpha = S.album[i] ? 1 : .5;
    drawToy(ix, fl ? r.y + 16 : r.y + r.h - 12, kk, fl);
    ctx.restore();
    text(SHOTS[i].n, r.x + r.w - 12, r.y + 26,
      { size: 14, color: S.album[i] ? P.ink : 'rgba(240,236,250,.7)', align: 'right' });
    if (S.album[i]) {
      ctx.fillStyle = P.good;
      ctx.beginPath(); ctx.arc(r.x + r.w - 20, r.y + r.h - 20, 12, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(r.x + r.w - 26, r.y + r.h - 20);
      ctx.lineTo(r.x + r.w - 22, r.y + r.h - 15);
      ctx.lineTo(r.x + r.w - 14, r.y + r.h - 26);
      ctx.stroke();
    }
  }
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#100d16';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224,166,63,.22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text('کارگاهِ آینه', SCENE_W - 130, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  const n = S.album.reduce((a, b) => a + b, 0);
  numText(fa(n) + ' / ' + fa(SHOTS.length), 300, HUD_H / 2, { size: 20, color: P.gold });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * (n / SHOTS.length), 5, 3); ctx.fill();
}

function kitIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.tube;
  ctx.beginPath(); rrPath(-30, -16, 60, 44, 8); ctx.fill();
  ctx.fillStyle = P.balloon;
  ctx.beginPath(); ctx.ellipse(0, -16, 30, 11, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.band; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.ellipse(0, -2, 32, 12, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 860, h: 306, y: 132,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: P.inkSoft,
    icon: kitIcon,
    title: 'خودت آینه بساز',
    body: 'یک لولهٔ مقوّایی، یک بادکنک و دو حلقه‌کش.\nاوّل آینه را می‌سازی، بعد با پمپ غشا را فرو می‌بری یا بیرون می‌آوری.\nشش قابِ آلبوم منتظرِ شش‌جور تصویرند.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#b07a2e', btnHotFill: '#d29a45',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 820, h: 300, y: 140,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    icon: kitIcon,
    title: 'آلبوم پر شد',
    body: 'یک آینه ساختی که هم تخت می‌شود، هم فرورفته، هم برآمده.\nهرچه گودترش کردی تصویر زودتر عوض شد، و فاصلهٔ اسباب‌بازی\nهم کارِ خودش را کرد.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#b07a2e', btnHotFill: '#d29a45',
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
  if (S.phase === 'build') drawBuild();
  else {
    drawView();
    drawBench();
    drawFilm();
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
    const w = 520;
    paper(SCENE_W / 2 - w / 2, 596, w, 40, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, 616, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.08, 'rgba(8, 6, 14, .44)', 0, .1);
}

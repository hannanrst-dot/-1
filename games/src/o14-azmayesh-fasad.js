/*!
title: چرا فاسد می‌شود؟ — از گذشته تا آینده (آزمایش)
bg: #1b232b
*/

/* ═══════════════════════════════════════════════════════════════════════
   چرا فاسد می‌شود؟ — علومِ سوم، درس ۱۴ «از گذشته تا آینده»

   کتاب سه راهِ نگه‌داری را نشان می‌دهد (نمک، خشک کردن، خنک کردن) و
   می‌پرسد در آینده چه تغییری خواهند کرد. این آزمایش، چراییِ هر سه را
   با یک آزمایشِ کنترل‌شده نشان می‌دهد: چهار شیشهٔ یکسان، یک تکه نانِ
   یکسان در هرکدام، و هر بار فقط یک چیز عوض می‌شود.

   ── درستیِ علمی ─────────────────────────────────────────────────
   آنچه غذا را فاسد می‌کند، رشدِ میکروب‌هاست، و رشدِ میکروب دو شرط
   می‌خواهد: گرما و آب.

   ۱) گرما — «قانونِ ۱۰ درجه» (Q10≈۲): با هر ۱۰ درجه بالا رفتنِ دما،
      سرعتِ رشد تقریباً دو برابر می‌شود:
          ضریبِ دما = ۲ به توانِ (دما − ۲۵)/۱۰
      پس ۱۲ درجه (سرداب) نزدیک نصفِ ۲۵ درجه است و ۲ درجه (یخدان)
      نزدیک یک‌پنجمِ آن.

   ۲) آب — «فعّالیتِ آبی» (a_w). میکروب زیرِ a_w حدودِ ۰٫۶ اصلاً رشد
      نمی‌کند. نانِ تازه ۰٫۹۸، نانِ نمک‌زده ۰٫۷۸ و نانِ خشک‌شده ۰٫۶۶:
          ضریبِ آب = (a_w − ۰٫۶) ÷ ۰٫۳۸

   روزهای فاسد شدن از همین دو ضریب درمی‌آید، نه از عددهای دلخواه:
      تازه در اتاق ۴ روز | تازه در سرداب ۱۰ روز | تازه در یخدان ۲۰ روز
      نمک‌زده در اتاق ۸ روز | خشک‌شده در اتاق ۲۵ روز
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  bg: '#1b232b', bgLo: '#121920', bgHi: '#2b3742',
  bench: '#5f4a33', benchLo: '#3f3020', benchLt: '#7d6244',
  glass: 'rgba(196, 226, 238, .18)', glassEdge: 'rgba(214, 238, 248, .6)',
  lid: '#b0b8c0', lidDk: '#7d858e',
  bread: '#e0b878', breadDk: '#b98f4e', crust: '#a8722f',
  mold: '#7f9f4a', moldDk: '#4f6b28', moldGrey: '#8a8a92', rot: '#5f5a3a',
  salt: '#f2eee2', drop: '#7fc4e8',
  warm: '#e07a4a', cool: '#5fa8d8', cold: '#8fd0ea',
  paper: '#fbf7ec', card: '#ffffff', line: '#c9b795',
  ink: '#1e2830', inkSoft: '#78889a',
  good: '#5e9f6c', bad: '#c0503a', gold: '#e0a63f', accent: '#4c9ec4',
};

/* ───────── قانونِ علمی ───────── */

const T_OF = { room: 25, cellar: 12, ice: 2 };
const T_N = { room: 'اتاق', cellar: 'سرداب', ice: 'یخدان' };
const AW = { fresh: .98, salt: .78, dry: .66 };
const ST_N = { fresh: 'تازه', salt: 'نمک‌زده', dry: 'خشک‌شده' };
const T0 = 4;                      /* روزِ فاسد شدنِ نانِ تازه در ۲۵ درجه */
const DAYS = 30;                   /* آزمایش چند روز طول می‌کشد */
const DAY_T = .55;                 /* هر روز چند ثانیه */

/** قانونِ ۱۰ درجه: با هر ۱۰ درجه، دو برابر. */
const fT = (T) => Math.pow(2, (T - 25) / 10);
/** فعّالیتِ آبی: زیرِ ۰٫۶ میکروب رشد نمی‌کند. */
const fW = (aw) => clamp((aw - .60) / .38, 0, 1);
/** چند روز طول می‌کشد تا فاسد شود. */
const spoilDays = (temp, state) => T0 / (fT(T_OF[temp]) * fW(AW[state]));

/* خانه‌های دفترچه: هر بار فقط یک چیز عوض می‌شود */
const SLOTS = [
  { n: 'تازه، در اتاق',      temp: 'room',   state: 'fresh' },
  { n: 'تازه، در سرداب',     temp: 'cellar', state: 'fresh' },
  { n: 'نمک‌زده، در اتاق',   temp: 'room',   state: 'salt' },
  { n: 'خشک‌شده، در اتاق',   temp: 'room',   state: 'dry' },
];

const QS = [
  { q: 'از روی عددهایت: کدام‌یک بیشتر جلوی فاسد شدن را گرفت؟',
    opts: ['بردن به سرداب', 'خشک کردن', 'هیچ‌کدام'], a: 1 },
  { q: 'چرا نمک زدن و خشک کردن جواب می‌دهند؟',
    opts: ['غذا را سرد می‌کنند', 'آبِ غذا را کم می‌کنند', 'غذا را می‌پزند'], a: 1 },
];

/* ───────── جای‌ها ───────── */

const NOTE = { x: 24, y: 70, w: 322, h: 676 };
const BENCH = { x: 362, y: 70, w: 814, h: 676 };
const JAR = { w: 152, h: 224, y: 150 };
const jarX = (i) => 452 + i * 190;

const BTN_RUN = { x: 396, y: 664, w: 260, h: 58 };
const BTN_RESET = { x: 672, y: 664, w: 172, h: 58 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 500, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 506, w: 300, h: 68 };
const BTN_CHECK = { x: SCENE_W / 2 - 160, y: 606, w: 320, h: 58 };
const TEMPS = ['room', 'cellar', 'ice'];
const STATES = ['fresh', 'salt', 'dry'];
function tBtn(i) { return { x: 906 + 0 * i, y: 0, w: 0, h: 0 }; }
function ctlT(i) { return { x: 396 + i * 132, y: 542, w: 122, h: 50 }; }
function ctlS(i) { return { x: 806 + i * 122, y: 542, w: 112, h: 50 }; }
function qOpt(qi, i) {
  const w = 226, gap = 14;
  return { x: SCENE_W / 2 + (1 - i) * (w + gap) - w / 2, y: 306 + qi * 152, w, h: 58 };
}

/* ───────── حالت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  day: 0, running: false,
  jars: [], sel: 0,
  rec: [null, null, null, null],
  ans: [-1, -1], mark: null, markT: 0,
  ans2: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

function tip(msg) { S.tip = msg; S.tipT = 4; }
const allRec = () => S.rec.every((r) => r !== null);

function newJar(temp, state) {
  return { temp, state, d: 0, spoiledOn: null, ph: Math.random() * TAU };
}

function reset(keep) {
  S.phase = 'lab'; S.phaseT = 0;
  S.day = 0; S.running = false; S.sel = 0;
  S.jars = [newJar('room', 'fresh'), newJar('cellar', 'fresh'),
    newJar('room', 'salt'), newJar('room', 'dry')];
  if (!keep) { S.rec = [null, null, null, null]; S.ans = [-1, -1]; S.mark = null; }
}

/** این شیشه به کدام خانهٔ دفترچه می‌خورد؟ */
function slotFor(j) {
  for (let k = 0; k < SLOTS.length; k++) {
    if (SLOTS[k].temp === j.temp && SLOTS[k].state === j.state) return k;
  }
  return -1;
}

/* ───────── ورودی ───────── */

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else if (S.phase === 'quiz') {
    if (inRect(p, BTN_CHECK)) S.hover = { k: 'check' };
    for (let q = 0; q < QS.length; q++) for (let i = 0; i < QS[q].opts.length; i++)
      if (inRect(p, qOpt(q, i))) S.hover = { k: 'opt', q, i };
  } else {
    if (inRect(p, BTN_RUN)) S.hover = { k: 'run' };
    if (inRect(p, BTN_RESET)) S.hover = { k: 'reset' };
    for (let i = 0; i < 3; i++) {
      if (inRect(p, ctlT(i))) S.hover = { k: 'temp', i };
      if (inRect(p, ctlS(i))) S.hover = { k: 'state', i };
    }
    for (let i = 0; i < 4; i++) {
      if (inRect(p, { x: jarX(i) - JAR.w / 2, y: JAR.y, w: JAR.w, h: JAR.h })) S.hover = { k: 'jar', i };
    }
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { reset(false); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; reset(false); sfx.tap(); }
    return;
  }
  if (S.phase === 'quiz') {
    if (inRect(p, BTN_CHECK)) { checkQuiz(); return; }
    for (let q = 0; q < QS.length; q++) for (let i = 0; i < QS[q].opts.length; i++) {
      if (!inRect(p, qOpt(q, i))) continue;
      S.ans[q] = i; S.mark = null; sfx.tap(); return;
    }
    return;
  }
  for (let i = 0; i < 4; i++) {
    if (!inRect(p, { x: jarX(i) - JAR.w / 2, y: JAR.y, w: JAR.w, h: JAR.h })) continue;
    S.sel = i; sfx.tick(); return;
  }
  for (let i = 0; i < 3; i++) {
    if (inRect(p, ctlT(i))) { setJar('temp', TEMPS[i]); return; }
    if (inRect(p, ctlS(i))) { setJar('state', STATES[i]); return; }
  }
  if (inRect(p, BTN_RUN)) { S.running = !S.running; sfx.slide(); return; }
  if (inRect(p, BTN_RESET)) {
    S.day = 0; S.running = false;
    for (const j of S.jars) { j.d = 0; j.spoiledOn = null; }
    sfx.tap();
    toast.say('نان‌های تازه گذاشته شد', 'info');
    return;
  }
});

function setJar(what, val) {
  const j = S.jars[S.sel];
  if (!j) return;
  if (S.day > 0 && j.d > 0) {
    tip('این شیشه شروع شده؛ اوّل «نانِ تازه» را بزن.');
    S.shake = .12; sfx.nope();
    return;
  }
  j[what] = val;
  j.spoiledOn = null;
  sfx.tap();
}

function checkQuiz() {
  if (S.ans.some((x) => x < 0)) { tip('هر دو را جواب بده.'); S.shake = .1; sfx.nope(); return; }
  S.mark = QS.map((q, i) => S.ans[i] === q.a);
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

  if (S.phase === 'lab' && S.running) {
    const dd = dt / DAY_T;
    S.day = Math.min(DAYS, S.day + dd);
    for (const j of S.jars) {
      if (j.spoiledOn !== null) continue;
      j.d = Math.min(1, j.d + dd / spoilDays(j.temp, j.state));
      if (j.d >= 1) {
        j.spoiledOn = S.day;
        const k = slotFor(j);
        if (k >= 0 && S.rec[k] === null) {
          S.rec[k] = S.day;
          sfx.good();
          bits.confetti(jarX(S.jars.indexOf(j)), JAR.y + 120, 14, [P.gold, P.card, P.mold]);
          toast.say(SLOTS[k].n + ' ثبت شد', 'good');
          if (allRec()) { S.running = false; S.phase = 'quiz'; S.phaseT = 0; }
        } else {
          sfx.nope();
          toast.say('فاسد شد', 'bad');
        }
      }
    }
    if (S.day >= DAYS) S.running = false;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { reset(false); runLoop(step); });

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

/* ───────── شیشه‌ها ───────── */

function drawBread(x, y, j, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const shrink = j.state === 'dry' ? .82 : 1;
  ctx.scale(shrink, shrink);
  /* تکهٔ نان */
  const dark = j.d > .6 ? clamp((j.d - .6) / .4, 0, 1) : 0;
  ctx.fillStyle = shade(j.state === 'dry' ? P.breadDk : P.bread, -dark * .5);
  ctx.beginPath();
  ctx.moveTo(-34, 16);
  ctx.lineTo(-34, -8);
  ctx.quadraticCurveTo(-34, -30, -12, -30);
  ctx.quadraticCurveTo(0, -38, 12, -30);
  ctx.quadraticCurveTo(34, -30, 34, -8);
  ctx.lineTo(34, 16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = shade(P.crust, -dark * .5); ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = `rgba(160, 114, 47, ${.25 * (1 - dark)})`;
  for (let k = 0; k < 9; k++) {
    const a = k * 2.1 + j.ph;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 20, -6 + Math.sin(a) * 12, 2.6, 0, TAU); ctx.fill();
  }
  /* نمک */
  if (j.state === 'salt') {
    ctx.fillStyle = P.salt;
    for (let k = 0; k < 22; k++) {
      const a = k * 1.7 + j.ph;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 26, -6 + Math.sin(a * 1.3) * 18, 1.8, 0, TAU); ctx.fill();
    }
  }
  /* کپک */
  if (j.d > .12) {
    const m = clamp((j.d - .12) / .88, 0, 1);
    for (let k = 0; k < 16; k++) {
      const a = k * 1.63 + j.ph;
      const rr = 6 + (k % 4) * 6;
      const cx = Math.cos(a) * rr * 1.5, cy = -6 + Math.sin(a) * rr * .9;
      const sz = m * (3 + (k % 3) * 3.4);
      if (sz < .4) continue;
      ctx.fillStyle = k % 3 === 0 ? P.moldGrey : (k % 3 === 1 ? P.mold : P.moldDk);
      ctx.globalAlpha = .55 + m * .45;
      ctx.beginPath(); ctx.arc(cx, cy, sz, 0, TAU); ctx.fill();
      ctx.globalAlpha = .3 + m * .3;
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.2;
      for (let f = 0; f < 5; f++) {
        const a2 = f * 1.26 + S.t * .3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a2) * sz * 1.9, cy + Math.sin(a2) * sz * 1.9);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawJar(i) {
  const j = S.jars[i];
  const x = jarX(i), y = JAR.y, w = JAR.w, h = JAR.h;
  const sel = S.sel === i;
  const hot = S.hover && S.hover.k === 'jar' && S.hover.i === i;
  /* سایه روی میز */
  ctx.fillStyle = 'rgba(10, 14, 18, .35)';
  ctx.beginPath(); ctx.ellipse(x, y + h + 6, w * .46, 12, 0, 0, TAU); ctx.fill();
  /* درونِ شیشه: رنگِ دما */
  ctx.save();
  ctx.beginPath(); rrPath(x - w / 2, y, w, h, 16); ctx.clip();
  ctx.fillStyle = 'rgba(236, 246, 250, .16)';
  ctx.fillRect(x - w / 2, y, w, h);
  const tc = j.temp === 'room' ? 'rgba(232, 138, 84, .30)'
    : j.temp === 'cellar' ? 'rgba(95, 168, 216, .26)' : 'rgba(160, 218, 240, .34)';
  ctx.fillStyle = tc;
  ctx.fillRect(x - w / 2, y, w, h);
  /* قفسهٔ کوچکِ داخل */
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(x - w / 2, y + h - 40, w, 40);
  drawBread(x, y + h - 74, j, 1);
  /* بخارِ سرد یا گرمای اتاق */
  if (j.temp !== 'room') {
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    for (let k = 0; k < 4; k++) {
      const a = S.t * .6 + k * 1.6 + j.ph;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * 34, y + 60 + Math.sin(a * .8) * 22, 26, 8, 0, 0, TAU);
      ctx.fill();
    }
  }
  /* برقِ شیشه */
  const gg = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y + h);
  gg.addColorStop(0, 'rgba(255,255,255,.20)');
  gg.addColorStop(.45, 'rgba(255,255,255,.03)');
  gg.addColorStop(1, 'rgba(255,255,255,.12)');
  ctx.fillStyle = gg;
  ctx.fillRect(x - w / 2, y, w, h);
  ctx.restore();
  /* بدنه */
  ctx.strokeStyle = sel ? P.gold : (hot ? P.accent : P.glassEdge);
  ctx.lineWidth = sel ? 4.6 : 3;
  ctx.beginPath(); rrPath(x - w / 2, y, w, h, 16); ctx.stroke();
  /* درِ شیشه */
  ctx.fillStyle = P.lidDk;
  ctx.beginPath(); rrPath(x - w / 2 - 8, y - 22, w + 16, 26, 8); ctx.fill();
  ctx.fillStyle = P.lid;
  ctx.beginPath(); rrPath(x - w / 2 - 8, y - 22, w + 16, 12, 6); ctx.fill();
  /* دماسنج */
  const T = T_OF[j.temp];
  const tx = x + w / 2 + 18;
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(tx, y + 24); ctx.lineTo(tx, y + h - 26); ctx.stroke();
  const u = clamp((T + 5) / 40, 0, 1);
  ctx.strokeStyle = T > 20 ? P.warm : T > 8 ? P.cool : P.cold;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(tx, y + h - 26);
  ctx.lineTo(tx, y + h - 26 - u * (h - 52));
  ctx.stroke();
  ctx.fillStyle = T > 20 ? P.warm : T > 8 ? P.cool : P.cold;
  ctx.beginPath(); ctx.arc(tx, y + h - 22, 8, 0, TAU); ctx.fill();
  /* برچسب */
  const lw = 130;
  ctx.fillStyle = sel ? 'rgba(224, 166, 63, .92)' : 'rgba(20, 28, 34, .8)';
  ctx.beginPath(); rrPath(x - lw / 2, y + h + 16, lw, 46, 10); ctx.fill();
  text(T_N[j.temp] + ' • ' + ST_N[j.state], x, y + h + 32,
    { size: 15, color: sel ? '#2a2010' : P.card });
  if (j.spoiledOn !== null) {
    text('روزِ ' + faNum(j.spoiledOn, 0), x, y + h + 50,
      { size: 15, family: 'Lalezar', color: sel ? '#5a3a06' : P.bad });
  } else {
    /* نوارِ خرابی */
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    ctx.beginPath(); rrPath(x - 50, y + h + 44, 100, 8, 4); ctx.fill();
    ctx.fillStyle = j.d > .6 ? P.bad : j.d > .3 ? P.gold : P.good;
    ctx.beginPath(); rrPath(x - 50, y + h + 44, 100 * j.d, 8, 4); ctx.fill();
  }
}

/* ───────── دفترچه ───────── */

function drawNote() {
  paper(NOTE.x, NOTE.y, NOTE.w, NOTE.h, P.paper, 31, 14, .35);
  text('دفترچهٔ آزمایش', NOTE.x + NOTE.w / 2, NOTE.y + 34, { size: 24, family: 'Lalezar', color: P.ink });
  text('هر بار فقط یک چیز را عوض کن', NOTE.x + NOTE.w / 2, NOTE.y + 62,
    { size: 14, color: P.inkSoft });
  const y0 = NOTE.y + 86, rh = 74;
  const maxD = 30;
  for (let k = 0; k < SLOTS.length; k++) {
    const y = y0 + k * rh;
    const has = S.rec[k] !== null;
    ctx.fillStyle = has ? 'rgba(94, 159, 108, .14)' : 'rgba(120, 136, 154, .1)';
    ctx.beginPath(); rrPath(NOTE.x + 14, y, NOTE.w - 28, rh - 10, 10); ctx.fill();
    ctx.strokeStyle = has ? P.good : 'rgba(120, 136, 154, .4)';
    ctx.lineWidth = has ? 2.4 : 2;
    if (!has) ctx.setLineDash([8, 6]);
    ctx.beginPath(); rrPath(NOTE.x + 14, y, NOTE.w - 28, rh - 10, 10); ctx.stroke();
    ctx.setLineDash([]);
    text(SLOTS[k].n, NOTE.x + NOTE.w - 26, y + 20, { size: 16, color: P.ink, align: 'right' });
    /* میلهٔ روزها */
    const bx = NOTE.x + 26, bw = NOTE.w - 100;
    ctx.fillStyle = 'rgba(120, 136, 154, .2)';
    ctx.beginPath(); rrPath(bx, y + 36, bw, 14, 7); ctx.fill();
    if (has) {
      ctx.fillStyle = P.accent;
      ctx.beginPath(); rrPath(bx, y + 36, bw * clamp(S.rec[k] / maxD, 0, 1), 14, 7); ctx.fill();
      numText(faNum(S.rec[k], 0), NOTE.x + NOTE.w - 40, y + 43, { size: 17, color: P.ink });
      text('روز', NOTE.x + NOTE.w - 62, y + 43, { size: 12, color: P.inkSoft });
    } else {
      text('؟', NOTE.x + NOTE.w - 44, y + 43, { size: 22, family: 'Lalezar', color: 'rgba(120,136,154,.6)' });
    }
  }
  /* راهنمای محور */
  const bx = NOTE.x + 26, bw = NOTE.w - 100;
  ctx.strokeStyle = P.line; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx, y0 + 4 * rh - 4); ctx.lineTo(bx + bw, y0 + 4 * rh - 4); ctx.stroke();
  for (let d = 0; d <= 30; d += 10) {
    const x = bx + bw * (d / maxD);
    ctx.beginPath(); ctx.moveTo(x, y0 + 4 * rh - 4); ctx.lineTo(x, y0 + 4 * rh + 2); ctx.stroke();
    numText(fa(d), x, y0 + 4 * rh + 14, { size: 12, color: P.inkSoft });
  }
  text('روزِ فاسد شدن', NOTE.x + NOTE.w / 2, y0 + 4 * rh + 40, { size: 14, color: P.inkSoft });
}

/* ───────── میز و دکمه‌ها ───────── */

function drawBench() {
  ctx.fillStyle = 'rgba(255,255,255,.03)';
  ctx.beginPath(); rrPath(BENCH.x, BENCH.y, BENCH.w, BENCH.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(76, 158, 196, .2)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(BENCH.x, BENCH.y, BENCH.w, BENCH.h, 16); ctx.stroke();
  /* تختهٔ میز */
  ctx.fillStyle = P.benchLo;
  ctx.beginPath(); rrPath(BENCH.x + 14, JAR.y + JAR.h + 4, BENCH.w - 28, 18, 6); ctx.fill();
  ctx.fillStyle = P.bench;
  ctx.beginPath(); rrPath(BENCH.x + 14, JAR.y + JAR.h + 4, BENCH.w - 28, 9, 4); ctx.fill();
  /* پیشانی */
  text('چهار شیشه، چهار نانِ یکسان', BENCH.x + BENCH.w / 2, BENCH.y + 30,
    { size: 22, family: 'Lalezar', color: 'rgba(232, 242, 248, .9)' });
}

function drawControls() {
  const j = S.jars[S.sel];
  text('جای شیشهٔ ' + fa(S.sel + 1), 396 + 178, 514, { size: 17, color: 'rgba(232,242,248,.75)', align: 'right' });
  text('حالتِ نان', 806 + 168, 514, { size: 17, color: 'rgba(232,242,248,.75)', align: 'right' });
  for (let i = 0; i < 3; i++) {
    const on = j && j.temp === TEMPS[i];
    button(ctlT(i), T_N[TEMPS[i]], {
      hot: S.hover && S.hover.k === 'temp' && S.hover.i === i,
      fill: on ? (TEMPS[i] === 'room' ? '#a5552e' : TEMPS[i] === 'cellar' ? '#2f6f8f' : '#3f8fa8') : '#4a5560',
      hotFill: on ? '#c06a3c' : '#5d6a76', size: 19, r: 12,
    });
    numText(fa(T_OF[TEMPS[i]]) + '°', ctlT(i).x + ctlT(i).w / 2, ctlT(i).y + 62,
      { size: 14, color: 'rgba(232,242,248,.6)' });
  }
  for (let i = 0; i < 3; i++) {
    const on = j && j.state === STATES[i];
    button(ctlS(i), ST_N[STATES[i]], {
      hot: S.hover && S.hover.k === 'state' && S.hover.i === i,
      fill: on ? '#7a6a2e' : '#4a5560', hotFill: on ? '#96843c' : '#5d6a76', size: 19, r: 12,
    });
    numText('a=' + faNum(AW[STATES[i]], 2), ctlS(i).x + ctlS(i).w / 2, ctlS(i).y + 62,
      { size: 13, color: 'rgba(232,242,248,.6)' });
  }
  button(BTN_RUN, S.running ? 'نگه دار' : 'روزها را جلو ببر', {
    hot: S.hover && S.hover.k === 'run',
    fill: S.running ? '#8a5a2a' : '#2f7f96', hotFill: S.running ? '#a5703a' : '#4fa3b8', size: 21,
  });
  button(BTN_RESET, 'نانِ تازه', {
    hot: S.hover && S.hover.k === 'reset', fill: '#5f6b76', hotFill: '#75828e', size: 20,
  });
  /* تقویم */
  const cx = 1014, cy = 692;
  ctx.fillStyle = 'rgba(255,255,255,.1)';
  ctx.beginPath(); rrPath(cx - 150, cy - 28, 300, 56, 12); ctx.fill();
  text('روزِ', cx + 118, cy, { size: 18, color: 'rgba(232,242,248,.8)' });
  numText(faNum(S.day, 0), cx + 74, cy, { size: 26, family: 'Lalezar', color: P.gold });
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.beginPath(); rrPath(cx - 138, cy + 12, 180, 9, 4.5); ctx.fill();
  ctx.fillStyle = P.accent;
  ctx.beginPath(); rrPath(cx - 138, cy + 12, 180 * clamp(S.day / DAYS, 0, 1), 9, 4.5); ctx.fill();
  numText('از ' + fa(DAYS), cx - 100, cy - 8, { size: 14, color: 'rgba(232,242,248,.55)' });
}

/* ───────── پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#0f161d';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224, 166, 63, .22)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text('چرا فاسد می‌شود؟', SCENE_W - 150, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  const n = S.rec.filter((r) => r !== null).length;
  numText(fa(n) + ' / ' + fa(4), 300, HUD_H / 2, { size: 20, color: P.gold });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * (n / 4), 5, 3); ctx.fill();
}

function drawQuiz() {
  ctx.fillStyle = 'rgba(10, 18, 24, .8)';
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  paper(150, 120, 900, 566, P.paper, 81, 18, .4);
  text('حالا از روی عددهای خودت', 600, 176, { size: 30, family: 'Lalezar', color: P.ink });
  for (let q = 0; q < QS.length; q++) {
    text(QS[q].q, 600, 262 + q * 152, { size: 20, color: P.ink });
    for (let i = 0; i < QS[q].opts.length; i++) {
      const b = qOpt(q, i);
      const on = S.ans[q] === i;
      const ok = S.mark && S.markT > 0 && on ? S.mark[q] : null;
      button(b, QS[q].opts[i], {
        hot: S.hover && S.hover.k === 'opt' && S.hover.q === q && S.hover.i === i,
        fill: ok === true ? P.good : ok === false ? P.bad : (on ? '#3f7f8c' : '#b09a76'),
        hotFill: on ? '#4f96a4' : '#c2ac88', size: 19, r: 12,
      });
    }
  }
  button(BTN_CHECK, 'ببین درست است؟', {
    hot: S.hover && S.hover.k === 'check', fill: '#5e9f6c', hotFill: '#6eb07c', size: 24,
  });
}

function jarIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(160, 200, 214, .35)';
  ctx.beginPath(); rrPath(-22, -22, 44, 48, 8); ctx.fill();
  ctx.strokeStyle = P.accent; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(-22, -22, 44, 48, 8); ctx.stroke();
  ctx.fillStyle = P.lidDk;
  ctx.beginPath(); rrPath(-27, -32, 54, 12, 5); ctx.fill();
  ctx.fillStyle = P.bread;
  ctx.beginPath(); rrPath(-14, 0, 28, 20, 6); ctx.fill();
  ctx.fillStyle = P.mold;
  ctx.beginPath(); ctx.arc(-4, 6, 4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(6, 12, 3, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 920, h: 336, y: 128,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: P.inkSoft,
    icon: jarIcon,
    title: 'چرا فاسد می‌شود؟',
    body: 'چهار شیشه و چهار تکه نانِ کاملاً یکسان.\nجای هر شیشه و حالتِ نانش را خودت انتخاب کن،\nروزها را جلو ببر و ببین کدام دیرتر فاسد می‌شود.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 940, h: 340, y: 132,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    icon: jarIcon,
    title: 'فاسد شدن، کارِ میکروب است',
    body: 'میکروب برای رشد دو چیز می‌خواهد: گرما و آب.\nسرداب و یخدان گرما را کم می‌کنند؛ نمک و آفتاب آب را.\nبرای همین نانِ خشک از همه دیرتر فاسد شد.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

/* ───────── قاب ───────── */

function draw() {
  beginScene(P.bgLo);
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.bgHi); g.addColorStop(1, P.bgLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  if (S.shake > 0) ctx.translate(Math.sin(S.t * 55) * S.shake * 10, 0);
  drawBench();
  for (let i = 0; i < 4; i++) drawJar(i);
  drawControls();
  drawNote();
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
    const w = 560;
    paper(BENCH.x + BENCH.w / 2 - w / 2, SCENE_H - 46, w, 38, P.card, 91, 12, .3);
    text(S.tip, BENCH.x + BENCH.w / 2, SCENE_H - 27, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.08, 'rgba(4, 10, 18, .44)', 0, .1);
}

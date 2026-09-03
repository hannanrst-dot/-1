/*!
title: قندشکنِ قهوه‌خانه — تفریق با تعویض
bg: #16232a
*/

/* ═══════════════════════════════════════════════════════════════════════
   قندشکنِ قهوه‌خانه — ریاضی سوم، فصل ۶، درس ۶ (تفریق در جدولِ ارزشِ مکانی)
   ───────────────────────────────────────────────────────────────────────
   سؤالِ کلیدیِ کتاب این است: «آیا می‌تواند از سکّه‌های ۱۰ ریالیِ خود ۵ تا
   بردارد؟ اگر ۱ سکّهٔ ۱۰۰ ریالی را با ۱۰ سکّهٔ ۱۰ ریالی عوض کند…».

   در قهوه‌خانه همین کار را با قند می‌کنیم، چون دیدنی‌تر است. چهار جعبه
   قند داری و اندازهٔ خودِ قندها فرق دارد: قالبِ هزارتایی، کلّهٔ صدتایی،
   حبّهٔ ده‌تایی و دانهٔ یکی.

     • روی جعبه بزن → یک قند می‌رود توی سینیِ مشتری.
     • قندِ بزرگ را بکِش روی سندان → قندشکن می‌آید پایین و آن را به
       ۱۰ تای کوچک‌تر می‌شکند.

   وقتی جعبه‌ای خالی است ولی سفارش هنوز از همان اندازه می‌خواهد، چاره‌ای
   جز شکستنِ قندِ بزرگ‌تر نیست — همان «قرض گرفتن».

   سفارش را کتاب می‌گوید، جواب را نه: آخرِ کار خودِ جعبه‌ها باقی‌مانده‌اند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  wall:  '#1d3038', wallHi: '#2c4650', wallLo: '#0f1a1f',
  tile:  '#2f6470', tileLt: '#4a8894', tileDk: '#1c454e',
  wood:  '#7d5630', woodDk: '#4a2f16', woodLt: '#a9784a',
  copper:'#c07a45', copperLt: '#e8a86a', copperDk: '#8a4f26',
  brass: '#cfa74e', brassDk: '#93752c', brassLt: '#f2dd99',
  iron:  '#4b535c', ironLt: '#7f8994', ironDk: '#2a3036',
  sugar: '#f4efe2', sugarDk: '#cdc4b0', sugarLt: '#ffffff',
  lamp:  '#ffd08a',
  paper: '#f6ecd6', ink: '#25333a', inkSoft: '#7d8f96',
  good:  '#5f9c6b', bad: '#cd5b45', gold: '#eab53f',
};

const BOX = [
  { v: 1000, n: 'قالب', sub: 'هزارتایی', r: 30 },
  { v: 100,  n: 'کلّه',  sub: 'صدتایی',  r: 23 },
  { v: 10,   n: 'حبّه',  sub: 'ده‌تایی',  r: 16 },
  { v: 1,    n: 'دانه', sub: 'یکی',     r: 10 },
];

const LEVELS = [
  { name: 'چایِ صبح', borrows: 1, dmax: 3, time: 64, quota: 4,
    hint: 'روی جعبه بزن تا یک قند برود توی سینی.' },
  { name: 'مشتریِ ظهر', borrows: 1, dmax: 4, time: 60, quota: 4,
    hint: 'جعبهٔ خالی؟ قندِ بزرگ‌تر را بکِش روی سندان تا بشکند.' },
  { name: 'دو شکستن', borrows: 2, dmax: 4, time: 58, quota: 5,
    hint: 'گاهی باید دو بار بشکنی.' },
  { name: 'شبِ شلوغ', borrows: 3, dmax: 4, time: 52, quota: 5,
    hint: 'زنجیرهٔ شکستن: از بزرگ به کوچک.' },
  { name: 'تا سماور سرد شود', borrows: 0, dmax: 4, time: 52, endless: true,
    hint: 'تا سماور جوش است، سفارش بده.' },
];

const HUD_H = 52;
const BOXR = { y: 228, w: 190, h: 210, gap: 22 };
const ANVIL = { x: 560, y: 632, r: 92 };
const TRAY = { x: 900, y: 556, w: 270, h: 180 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  have: 0, want: 0,
  box: [0, 0, 0, 0],
  need: [0, 0, 0, 0],
  paid: [0, 0, 0, 0],
  drag: null,          // { i, x, y }
  hammer: 0, crack: 0,
  fly: [],
  breaks: 0, minBreaks: 0,
  solved: 0,
  timeLeft: 0,
  cups: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  steam: [],
  t: 0, phaseT: 0, hover: null, shake: 0, nope: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const dig = (v) => [Math.floor(v / 1000) % 10, Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10];

function loadBest() { try { return +localStorage.getItem('ghand-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('ghand-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
newRound();               /* پشتِ پردهٔ شروع، قهوه‌خانه پُر باشد نه خالی */
whenFontsReady(() => runLoop(step));

/* ───────── دورِ تازه ───────── */

/** چند بار باید بشکنیم تا این تفریق انجام شود. */
function borrowsOf(have, want) {
  const h = dig(have).slice(), w = dig(want);
  let n = 0;
  for (let i = 3; i >= 0; i--) {
    while (h[i] < w[i]) {
      let j = i - 1;
      while (j >= 0 && h[j] === 0) j--;
      if (j < 0) return 99;
      h[j]--;
      for (let k = j + 1; k <= i; k++) { h[k] += 10; if (k < i) h[k]--; n++; }
    }
    h[i] -= w[i];
  }
  return n;
}

/* دور را می‌سازیم، نه اینکه تصادفی بگیریم و رد کنیم: اوّل تصمیم می‌گیریم
   کدام ستون‌ها قرض بدهند، بعد رقم‌ها را طوری می‌چینیم که همان درآید. */
function newRound() {
  const lv = L();
  const nB = lv.borrows || R(1, 3);
  for (let tries = 0; tries < 400; tries++) {
    /* کدام ستون‌ها (یکی، ده، صد) قرض بدهند */
    const flag = [0, 0, 0];
    const pool = [0, 1, 2];
    for (let k = 0; k < nB; k++) pool.splice(R(0, pool.length - 1), 1).forEach((q) => { flag[q] = 1; });
    const w = [0, 0, 0, 0], h = [0, 0, 0, 0];
    let cin = 0, okAll = true;
    for (let q = 0; q < 3; q++) {          /* q=0 یکی، q=1 ده، q=2 صد */
      const idx = 3 - q;
      let wd;
      if (flag[q]) {
        wd = R(cin ? 0 : 1, lv.dmax);      /* برای قرض، رقمِ سفارش باید بزرگ‌تر باشد */
        const top = wd + cin - 1;
        if (top < 0) { okAll = false; break; }
        h[idx] = R(0, Math.min(top, 9));
      } else {
        wd = R(0, lv.dmax);
        const low = wd + cin;
        if (low > 9) { okAll = false; break; }
        h[idx] = R(low, 9);
      }
      w[idx] = wd;
      cin = flag[q];
    }
    if (!okAll) continue;
    const w0 = R(0, Math.min(lv.dmax, 3));
    const low0 = w0 + cin;
    if (low0 > 9) continue;
    w[0] = w0;
    h[0] = R(Math.max(2, low0), 9);

    const a = h[0] * 1000 + h[1] * 100 + h[2] * 10 + h[3];
    const b = w[0] * 1000 + w[1] * 100 + w[2] * 10 + w[3];
    const taps = w[0] + w[1] + w[2] + w[3];
    if (b < 200 || a - b < 100) continue;
    if (taps < 3 || taps > 14) continue;
    if (borrowsOf(a, b) !== nB) continue;
    S.have = a; S.want = b;
    S.box = h.slice();
    S.need = w.slice();
    S.paid = [0, 0, 0, 0];
    S.minBreaks = nB;
    S.breaks = 0;
    S.solved = 0;
    S.fly = [];
    return;
  }
  S.have = 6403; S.want = 2158;
  S.box = dig(6403); S.need = dig(2158); S.paid = [0, 0, 0, 0];
  S.minBreaks = borrowsOf(6403, 2158); S.breaks = 0; S.solved = 0; S.fly = [];
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.cups = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newRound();
  toast.say(lv.hint, 'info');
}

/* ───────── جای‌ها ───────── */

const SLOT = [
  { c: 3, k: .78, w: 55, h: 56 },
  { c: 4, k: .80, w: 41, h: 44 },
  { c: 4, k: 1,   w: 41, h: 40 },
  { c: 5, k: 1,   w: 33, h: 32 },
];

function boxRect(i) {
  const total = 4 * BOXR.w + 3 * BOXR.gap;
  return { x: (SCENE_W - total) / 2 + i * (BOXR.w + BOXR.gap), y: BOXR.y, w: BOXR.w, h: BOXR.h };
}
function slotPos(i, n) {
  const b = boxRect(i), s = SLOT[i];
  const col = n % s.c, row = Math.floor(n / s.c);
  return { x: b.x + b.w / 2 + (col - (s.c - 1) / 2) * s.w, y: b.y + b.h - 26 - row * s.h };
}
function trayCol(i) {
  const w = (TRAY.w - 16) / 4;
  return { x: TRAY.x + 8 + i * w, y: TRAY.y + 46, w, h: TRAY.h - 58 };
}
const trayTotal = () => S.paid[0] * 1000 + S.paid[1] * 100 + S.paid[2] * 10 + S.paid[3];
const onAnvil = (p) => Math.hypot(p.x - ANVIL.x, p.y - ANVIL.y + 20) <= ANVIL.r + 24;

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.nope > 0) S.nope -= dt;
  if (S.hammer > 0) S.hammer -= dt;
  if (S.crack > 0) S.crack -= dt;

  /* بخارِ سماور */
  if (S.phase !== 'intro' && Math.random() < dt * 12) {
    S.steam.push({ x: 208 + (Math.random() - .5) * 10, y: 556, r: 6 + Math.random() * 6, a: 0, life: 0, dur: 2.4 + Math.random() });
  }
  for (const s of S.steam) { s.life += dt; s.y -= (18 + s.r) * dt; s.x += Math.sin(s.life * 1.6 + s.r) * 9 * dt; s.r += 9 * dt; }
  S.steam = S.steam.filter((s) => s.life < s.dur);

  for (const f of S.fly) f.t += dt;
  S.fly = S.fly.filter((f) => f.t < f.dur);

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.solved) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseCup('مشتری خسته شد و رفت!'); }
    }
    if (S.solved) {
      S.solved += dt;
      if (S.solved > 2.1) { newRound(); S.timeLeft = L().time; }
    }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function nope(msg) {
  S.nope = .7; S.shake = .12; sfx.nope();
  toast.say(msg, 'bad');
}

function loseCup(msg) {
  if (S.solved) return;
  S.cups--;
  S.combo = 0;
  S.shake = .5;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.cups <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newRound();
}

/** یک قند از جعبه می‌رود توی سینیِ مشتری. */
function give(i) {
  if (S.phase !== 'play' || S.solved) return;
  if (S.box[i] <= 0) { nope('جعبهٔ ' + BOX[i].n + ' خالی است — قندِ بزرگ‌تر را بشکن.'); return; }
  S.box[i]--; S.paid[i]++;
  const a = slotPos(i, S.box[i]), c = trayCol(i);
  S.fly.push({ i, x0: a.x, y0: a.y, x1: c.x + c.w / 2, y1: c.y + c.h - 26, t: 0, dur: .34, k: .55 });
  sfx.place();
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
  check();
}

/** پس گرفتنِ یک قند از سینی — هیچ‌وقت بن‌بست نداریم. */
function takeBack(i) {
  if (S.phase !== 'play' || S.solved) return;
  if (S.paid[i] <= 0) return;
  S.paid[i]--; S.box[i]++;
  const c = trayCol(i), a = slotPos(i, S.box[i] - 1);
  S.fly.push({ i, x0: c.x + c.w / 2, y0: c.y + c.h - 26, x1: a.x, y1: a.y, t: 0, dur: .34, k: .55 });
  sfx.tap();
}

/** قندشکن: یک قندِ بزرگ می‌شود ۱۰ تای کوچک‌تر. همان «قرض گرفتن». */
function breakSugar(i) {
  if (S.phase !== 'play' || S.solved) return;
  if (i >= 3) { nope('دانه از این کوچک‌تر نمی‌شود.'); return; }
  if (S.box[i] <= 0) { nope('جعبهٔ ' + BOX[i].n + ' خالی است.'); return; }
  S.box[i]--;
  S.breaks++;
  S.hammer = .46; S.crack = .7;
  const tgt = i + 1;
  for (let n = 0; n < 10; n++) {
    const a = slotPos(tgt, S.box[tgt] + n);
    S.fly.push({ i: tgt, x0: ANVIL.x + (Math.random() - .5) * 40, y0: ANVIL.y - 34,
                 x1: a.x, y1: a.y, t: -n * .035, dur: .5, k: 1, arc: 150 });
  }
  S.box[tgt] += 10;
  sfx.tone(150, .18, 'sawtooth', .09);
  sfx.tone(880, .12, 'triangle', .06, .04);
  bits.add(ANVIL.x, ANVIL.y - 30, 22, 'dot', [P.sugarLt, P.sugar, P.sugarDk],
    { speed: 340, lift: 160, size: 4, life: .8, grav: 900 });
  if (S.tut.on && S.tut.step === 2) S.tut.on = false;
}

function check() {
  if (trayTotal() === S.want) win();
}

function win() {
  S.solved = .001;
  S.combo++;
  S.cleared++;
  const extra = Math.max(0, S.breaks - S.minBreaks);
  const pts = 300 + S.minBreaks * 150 + Math.round(S.timeLeft * 5) + Math.min(S.combo, 6) * 70 - extra * 70;
  S.score += Math.max(90, pts);
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(TRAY.x + TRAY.w / 2, TRAY.y, 40, [P.sugarLt, P.gold, P.brassLt, '#fff']);
  sfx.win();
  toast.say('چای شیرین شد! باقیِ قند توی جعبه‌هاست.', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.drag) {
    S.drag.x = p.x; S.drag.y = p.y;
    if (Math.hypot(p.x - S.drag.x0, p.y - S.drag.y0) > 10) S.drag.moved = true;
    S.drag.anvil = onAnvil(p);
    return;
  }
  S.hover = null;
  for (let i = 0; i < 4; i++) if (inRect(p, boxRect(i))) S.hover = { kind: 'box', i };
  for (let i = 0; i < 4; i++) if (inRect(p, trayCol(i)) && S.paid[i] > 0) S.hover = { kind: 'tray', i };
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
  for (let i = 0; i < 4; i++) if (inRect(p, trayCol(i))) { takeBack(i); return; }
  for (let i = 0; i < 4; i++) if (inRect(p, boxRect(i))) {
    S.drag = { i, x: p.x, y: p.y, x0: p.x, y0: p.y, moved: false, anvil: false };
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    return;
  }
});

cv.addEventListener('pointerup', (e) => {
  const d = S.drag;
  S.drag = null;
  if (!d || S.phase !== 'play') return;
  const p = toStage(e);
  if (onAnvil(p)) { breakSugar(d.i); return; }
  if (inRect(p, TRAY) || inRect(p, boxRect(d.i))) { give(d.i); return; }
  sfx.tap();
});

cv.addEventListener('pointercancel', () => { S.drag = null; });

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
  ctx.fillStyle = `rgba(6, 12, 15, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(246, 236, 214, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '4, 10, 12');
  ctx.fillStyle = P.tile;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#57676d' }); yy += 30; }
  return h + 20;
}

/** یک قند. شکلش اندازه‌اش را لو می‌دهد: قالب و کلّه مخروط، حبّه مکعب، دانه بلور. */
function sugarPiece(x, y, i, k = 1, seed = 0) {
  const r = BOX[i].r * k;
  ctx.save();
  ctx.translate(x, y);
  if (i <= 1) {
    const h = r * 2.15, w = r * 1.32;
    contact(0, h * .48 + 3, w * .86, 5.5, .4);
    ctx.beginPath();
    ctx.moveTo(0, -h * .5);
    ctx.quadraticCurveTo(w * .3, -h * .12, w, h * .38);
    ctx.quadraticCurveTo(0, h * .54, -w, h * .38);
    ctx.quadraticCurveTo(-w * .3, -h * .12, 0, -h * .5);
    ctx.closePath();
    const g = ctx.createLinearGradient(-w, -h * .5, w * .8, h * .5);
    g.addColorStop(0, P.sugarLt); g.addColorStop(.4, P.sugar); g.addColorStop(1, shade(P.sugarDk, -.14));
    ctx.fillStyle = g; ctx.fill();
    /* برقِ لبهٔ چپ و سایهٔ راست */
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-w * .12, -h * .46); ctx.quadraticCurveTo(-w * .5, -h * .05, -w * .82, h * .3); ctx.stroke();
    if (i === 0) {
      /* کاغذِ آبیِ دورِ قالب — نشانهٔ هزارتایی */
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, -h * .5);
      ctx.quadraticCurveTo(w * .3, -h * .12, w, h * .38);
      ctx.quadraticCurveTo(0, h * .54, -w, h * .38);
      ctx.quadraticCurveTo(-w * .3, -h * .12, 0, -h * .5);
      ctx.closePath(); ctx.clip();
      ctx.fillStyle = P.tileDk; ctx.fillRect(-w, h * .06, w * 2, h * .5);
      ctx.fillStyle = P.tile; ctx.fillRect(-w, h * .06, w * 2, h * .16);
      ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(-w, h * .06, w * .5, h * .5);
      ctx.restore();
    }
  } else if (i === 2) {
    const a = r * .96;
    contact(0, a * .95, a * 1.05, 5, .4);
    /* رویه */
    ctx.beginPath();
    ctx.moveTo(0, -a * 1.1); ctx.lineTo(a, -a * .62); ctx.lineTo(0, -a * .14); ctx.lineTo(-a, -a * .62);
    ctx.closePath(); ctx.fillStyle = P.sugarLt; ctx.fill();
    /* دو وجهِ جلو */
    ctx.beginPath();
    ctx.moveTo(-a, -a * .62); ctx.lineTo(0, -a * .14); ctx.lineTo(0, a * .84); ctx.lineTo(-a, a * .34);
    ctx.closePath(); ctx.fillStyle = P.sugar; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(a, -a * .62); ctx.lineTo(0, -a * .14); ctx.lineTo(0, a * .84); ctx.lineTo(a, a * .34);
    ctx.closePath(); ctx.fillStyle = shade(P.sugarDk, -.06); ctx.fill();
  } else {
    contact(0, r * .8, r * .9, 4, .34);
    ctx.beginPath();
    for (let n = 0; n < 6; n++) {
      const ang = n / 6 * TAU + seed;
      const rr = r * (.78 + .3 * noise1(seed * 3 + n));
      const px = Math.cos(ang) * rr, py = Math.sin(ang) * rr * .86;
      n ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = ball(-r * .3, -r * .3, r * 1.5, P.sugarLt, P.sugar, P.sugarDk);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.beginPath(); ctx.ellipse(-r * .28, -r * .3, r * .26, r * .16, -.6, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintTeahouseStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallLo); g.addColorStop(.45, P.wall); g.addColorStop(1, P.wallHi);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.globalAlpha = .3;
  ctx.fillStyle = texStone('#22383f', '#33525c');
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();

  /* کاشیِ فیروزه‌ای تا نیمهٔ دیوار */
  const TY = 96, TH = 96;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, TY, SCENE_W, TH); ctx.clip();
  ctx.fillStyle = P.tileDk; ctx.fillRect(0, TY, SCENE_W, TH);
  for (let x = -20; x < SCENE_W + 40; x += 84) {
    ctx.fillStyle = P.tile;
    ctx.beginPath(); rrPath(x + 4, TY + 6, 76, TH - 12, 6); ctx.fill();
    ctx.strokeStyle = P.tileLt; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 42, TY + 18); ctx.lineTo(x + 66, TY + TH / 2); ctx.lineTo(x + 42, TY + TH - 18);
    ctx.lineTo(x + 18, TY + TH / 2); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = 'rgba(242, 221, 153, .5)';
    ctx.beginPath(); ctx.arc(x + 42, TY + TH / 2, 5, 0, TAU); ctx.fill();
  }
  const tg = ctx.createLinearGradient(0, TY, 0, TY + TH);
  tg.addColorStop(0, 'rgba(255,255,255,.16)'); tg.addColorStop(1, 'rgba(0,0,0,.34)');
  ctx.fillStyle = tg; ctx.fillRect(0, TY, SCENE_W, TH);
  ctx.restore();
  ctx.fillStyle = P.brassDk; ctx.fillRect(0, TY - 5, SCENE_W, 5);
  ctx.fillStyle = P.brassDk; ctx.fillRect(0, TY + TH, SCENE_W, 5);

  /* طاقچهٔ چوبیِ زیرِ جعبه‌ها */
  const SY = BOXR.y + BOXR.h;
  ctx.fillStyle = P.woodDk; ctx.fillRect(120, SY, SCENE_W - 240, 22);
  ctx.fillStyle = texWood(P.wood, P.woodDk); ctx.fillRect(124, SY, SCENE_W - 248, 14);
  ctx.fillStyle = P.woodLt; ctx.fillRect(124, SY, SCENE_W - 248, 3);
  /* پایه‌های طاقچه */
  ctx.fillStyle = P.woodDk;
  for (const x of [180, SCENE_W - 208]) {
    ctx.beginPath(); rrPath(x, SY + 22, 28, 46, 6); ctx.fill();
  }

  /* پیشخوانِ سنگی */
  const CY = 500;
  ctx.fillStyle = '#0e1a1f'; ctx.fillRect(0, CY - 14, SCENE_W, SCENE_H - CY + 14);
  ctx.fillStyle = texStone('#2b4149', '#40606b'); ctx.fillRect(0, CY, SCENE_W, SCENE_H - CY);
  const cg = ctx.createLinearGradient(0, CY, 0, SCENE_H);
  cg.addColorStop(0, 'rgba(255, 214, 150, .22)');
  cg.addColorStop(.4, 'rgba(0,0,0,0)');
  cg.addColorStop(1, 'rgba(0,0,0,.46)');
  ctx.fillStyle = cg; ctx.fillRect(0, CY, SCENE_W, SCENE_H - CY);
  ctx.fillStyle = 'rgba(122, 168, 178, .5)'; ctx.fillRect(0, CY, SCENE_W, 3);

  /* فانوس‌های آویز */
  for (const lx of [96, 1104]) {
    ctx.strokeStyle = '#12242a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, HUD_H); ctx.lineTo(lx, 150); ctx.stroke();
    ctx.fillStyle = P.brassDk;
    ctx.beginPath();
    ctx.moveTo(lx - 30, 214); ctx.lineTo(lx - 20, 154); ctx.lineTo(lx + 20, 154); ctx.lineTo(lx + 30, 214);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255, 208, 138, .9)';
    ctx.beginPath();
    ctx.moveTo(lx - 24, 208); ctx.lineTo(lx - 16, 160); ctx.lineTo(lx + 16, 160); ctx.lineTo(lx + 24, 208);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = P.brassDk; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(lx - 20, 184); ctx.lineTo(lx + 20, 184); ctx.stroke();
    /* مخروطِ نور */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const lg = ctx.createLinearGradient(0, 214, 0, SCENE_H);
    lg.addColorStop(0, 'rgba(148, 106, 46, .5)');
    lg.addColorStop(1, 'rgba(60, 44, 18, 0)');
    ctx.fillStyle = lg;
    for (const k of [1, .62]) {
      ctx.globalAlpha = k * .4;
      ctx.beginPath();
      ctx.moveTo(lx - 26 * k, 214); ctx.lineTo(lx + 26 * k, 214);
      ctx.lineTo(lx + 300 * k, SCENE_H); ctx.lineTo(lx - 300 * k, SCENE_H);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.wall);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('teahouse', SCENE_W, SCENE_H, paintTeahouseStatic), 0, 0, SCENE_W, SCENE_H);
  drawSamovar();
  drawOrder();
  drawBoxes();
  drawAnvil();
  drawTray();
  drawFly();
  bits.draw();
  if (S.drag) sugarPiece(S.drag.x, S.drag.y - 26, S.drag.i, 1, 3);
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.1, 'rgba(3, 9, 12, .5)', .4, .16);
}

/** سماورِ مسی — ساعتِ شنیِ بازی هم هست: هرچه چای کم‌تر، وقت کم‌تر. */
function drawSamovar() {
  const x = 208, y = 640;
  const k = clamp(S.timeLeft / L().time, 0, 1);
  contact(x, y + 92, 74, 14, .55);
  /* پایه */
  ctx.fillStyle = P.copperDk;
  ctx.beginPath(); rrPath(x - 56, y + 66, 112, 28, 8); ctx.fill();
  /* بدنه */
  ctx.beginPath();
  ctx.moveTo(x - 42, y + 68);
  ctx.quadraticCurveTo(x - 62, y - 4, x - 34, y - 52);
  ctx.lineTo(x + 34, y - 52);
  ctx.quadraticCurveTo(x + 62, y - 4, x + 42, y + 68);
  ctx.closePath();
  const g = ctx.createLinearGradient(x - 56, 0, x + 56, 0);
  g.addColorStop(0, P.copperDk); g.addColorStop(.28, P.copperLt);
  g.addColorStop(.55, P.copper); g.addColorStop(1, P.copperDk);
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 2.4; ctx.stroke();
  /* گردن و قوری */
  ctx.fillStyle = P.copperDk;
  ctx.beginPath(); rrPath(x - 24, y - 68, 48, 18, 5); ctx.fill();
  ctx.fillStyle = P.brass;
  ctx.beginPath(); ctx.ellipse(x, y - 84, 28, 16, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); ctx.ellipse(x, y - 92, 8, 6, 0, 0, TAU); ctx.fill();
  /* شیر */
  ctx.strokeStyle = P.brass; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 34, y + 22); ctx.lineTo(x + 58, y + 22); ctx.lineTo(x + 58, y + 40); ctx.stroke();
  /* نوارِ چای (وقتِ مشتری) */
  ctx.fillStyle = 'rgba(8, 16, 20, .6)';
  ctx.beginPath(); rrPath(x - 18, y - 30, 36, 88, 8); ctx.fill();
  ctx.fillStyle = k > .3 ? '#b5651f' : P.bad;
  ctx.beginPath(); rrPath(x - 15, y - 27 + 82 * (1 - k), 30, 82 * k, 6); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.beginPath(); rrPath(x - 15, y - 27 + 82 * (1 - k), 10, 82 * k, 6); ctx.fill();
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(x - 18, y - 30, 36, 88, 8); ctx.stroke();
  /* برقِ مس */
  ctx.fillStyle = 'rgba(255, 236, 200, .35)';
  ctx.beginPath(); ctx.ellipse(x - 24, y - 6, 7, 34, .1, 0, TAU); ctx.fill();
  /* بخار */
  ctx.save();
  for (const s of S.steam) {
    const a = clamp(1 - s.life / s.dur, 0, 1);
    ctx.globalAlpha = a * .3;
    ctx.fillStyle = '#dff0f4';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
  }
  ctx.restore();
  /* استکان‌های سرو شده */
  const n = Math.min(S.cleared, 6);
  for (let i = 0; i < n; i++) {
    const gx = 316 + (i % 3) * 52, gy = 640 + Math.floor(i / 3) * 78;
    /* نعلبکیِ برنجی */
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); ctx.ellipse(gx, gy + 6, 21, 7, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = P.brass;
    ctx.beginPath(); ctx.ellipse(gx, gy + 4, 19, 6, 0, 0, TAU); ctx.fill();
    /* استکانِ کمرباریک */
    ctx.beginPath();
    ctx.moveTo(gx - 12, gy - 36);
    ctx.quadraticCurveTo(gx - 6, gy - 14, gx - 9, gy + 2);
    ctx.lineTo(gx + 9, gy + 2);
    ctx.quadraticCurveTo(gx + 6, gy - 14, gx + 12, gy - 36);
    ctx.closePath();
    ctx.fillStyle = 'rgba(148, 68, 22, .92)'; ctx.fill();
    ctx.fillStyle = 'rgba(226, 240, 244, .26)';
    ctx.beginPath(); rrPath(gx - 12, gy - 38, 24, 12, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(233, 245, 248, .55)'; ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(gx - 12, gy - 36);
    ctx.quadraticCurveTo(gx - 6, gy - 14, gx - 9, gy + 2);
    ctx.lineTo(gx + 9, gy + 2);
    ctx.quadraticCurveTo(gx + 6, gy - 14, gx + 12, gy - 36);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.beginPath(); ctx.ellipse(gx - 6, gy - 22, 2.4, 9, .12, 0, TAU); ctx.fill();
  }
}

/** برگهٔ سفارش. فقط خواستهٔ مشتری — نه جواب، نه باقی‌مانده. */
function drawOrder() {
  const w = 430, h = 74, x = SCENE_W / 2 - w / 2, y = 108;
  ctx.fillStyle = 'rgba(4, 10, 13, .4)';
  ctx.beginPath(); rrPath(x + 3, y + 5, w, h, 12); ctx.fill();
  paper(x, y, w, h, P.paper, 41, 12, .3);
  ctx.strokeStyle = 'rgba(47, 100, 112, .45)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(x + 8, y + 8, w - 16, h - 16, 8); ctx.stroke();
  text('سفارشِ مشتری', x + w - 34, y + 26, { size: 15, color: P.inkSoft, align: 'right' });
  numText(fa(S.want), x + w - 40, y + 50, { size: 33, color: P.ink, align: 'right' });
  text('واحد قند', x + w - 150, y + 52, { size: 13, color: P.inkSoft, align: 'right' });
  /* نشانِ سختی: چند بار باید شکست — بدونِ گفتنِ کجا */
  for (let i = 0; i < S.minBreaks; i++) {
    const hx = x + 42 + i * 26;
    ctx.fillStyle = i < S.breaks ? P.good : P.iron;
    ctx.beginPath(); ctx.arc(hx, y + 30, 7, 0, TAU); ctx.fill();
  }
  text('کم‌ترین شکستن', x + 128, y + 54, { size: 12, color: P.inkSoft });
}

function drawBoxes() {
  for (let i = 0; i < 4; i++) {
    const b = boxRect(i);
    const hot = S.hover && S.hover.kind === 'box' && S.hover.i === i;
    const empty = S.box[i] === 0;
    /* بدنهٔ جعبه */
    contact(b.x + b.w / 2, b.y + b.h + 10, b.w * .46, 12, .5);
    ctx.fillStyle = P.woodDk;
    wobbleRect(b.x - 7, b.y - 7, b.w + 14, b.h + 14, 12, i, 1.6); ctx.fill();
    ctx.save();
    ctx.beginPath(); wobbleRect(b.x, b.y, b.w, b.h, 10, i + 3, 1.4); ctx.clip();
    ctx.fillStyle = texWood('#5d3d1c', '#311d0c');
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 2;
    for (let v = 1; v < 4; v++) {
      ctx.beginPath(); ctx.moveTo(b.x + v * b.w / 4, b.y); ctx.lineTo(b.x + v * b.w / 4, b.y + b.h); ctx.stroke();
    }
    const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
    g.addColorStop(0, 'rgba(0,0,0,.62)');
    g.addColorStop(.34, 'rgba(255,214,150,.1)');
    g.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = g; ctx.fillRect(b.x, b.y, b.w, b.h);
    /* سایهٔ درونیِ لبه‌ها */
    ctx.strokeStyle = 'rgba(0,0,0,.42)'; ctx.lineWidth = 14;
    ctx.beginPath(); rrPath(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 12); ctx.stroke();
    /* قندها */
    const n = Math.min(S.box[i], SLOT[i].c * 5);
    for (let k = 0; k < n; k++) {
      const p = slotPos(i, k);
      sugarPiece(p.x, p.y, i, SLOT[i].k, i * 5 + k);
    }
    ctx.restore();
    ctx.strokeStyle = empty ? 'rgba(205, 91, 69, .8)' : (hot ? P.brassLt : P.brassDk);
    ctx.lineWidth = hot ? 4 : 2.6;
    wobbleRect(b.x, b.y, b.w, b.h, 10, i + 3, 1.4); ctx.stroke();
    if (S.box[i] > n) numText('+' + fa(S.box[i] - n), b.x + b.w - 26, b.y + 22, { size: 17, color: P.paper });

    /* پلاکِ برنجی */
    ctx.fillStyle = shade(P.brassDk, -.35);
    ctx.beginPath(); rrPath(b.x + 10, b.y - 36, b.w - 20, 32, 8); ctx.fill();
    const pg = ctx.createLinearGradient(0, b.y - 36, 0, b.y - 4);
    pg.addColorStop(0, P.brassLt); pg.addColorStop(1, P.brassDk);
    ctx.fillStyle = pg;
    ctx.beginPath(); rrPath(b.x + 11, b.y - 35, b.w - 22, 29, 7); ctx.fill();
    text(BOX[i].n, b.x + b.w / 2 + 28, b.y - 20, { size: 18, family: 'Lalezar', color: '#22190a' });
    numText(fa(BOX[i].v), b.x + b.w / 2 - 34, b.y - 19, { size: 17, color: '#3d2e10' });

    /* شمارنده */
    const cy = b.y + b.h + 40;
    ctx.fillStyle = empty ? 'rgba(120, 34, 22, .85)' : 'rgba(6, 14, 18, .72)';
    ctx.beginPath(); rrPath(b.x + b.w / 2 - 32, cy - 21, 64, 42, 10); ctx.fill();
    numText(fa(S.box[i]), b.x + b.w / 2, cy, { size: 27, color: empty ? '#ffd9cf' : P.brassLt });
  }
}

/** سندان و قندشکن. */
function drawAnvil() {
  const x = ANVIL.x, y = ANVIL.y;
  const hot = S.drag && S.drag.anvil;
  contact(x, y + 66, 92, 14, .6);
  /* کُندهٔ زیرِ سندان */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(x - 66, y + 20, 132, 48, 10); ctx.fill();
  ctx.fillStyle = texWood('#5a3a1a', '#2c1a08');
  ctx.beginPath(); rrPath(x - 62, y + 22, 124, 40, 8); ctx.fill();
  /* سندانِ آهنی */
  ctx.fillStyle = P.ironDk;
  ctx.beginPath();
  ctx.moveTo(x - 84, y - 26); ctx.lineTo(x + 84, y - 26);
  ctx.lineTo(x + 52, y + 6); ctx.lineTo(x + 40, y + 24);
  ctx.lineTo(x - 40, y + 24); ctx.lineTo(x - 52, y + 6);
  ctx.closePath(); ctx.fill();
  const ig = ctx.createLinearGradient(0, y - 26, 0, y + 24);
  ig.addColorStop(0, P.ironLt); ig.addColorStop(.4, P.iron); ig.addColorStop(1, P.ironDk);
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.moveTo(x - 80, y - 24); ctx.lineTo(x + 80, y - 24);
  ctx.lineTo(x + 50, y + 4); ctx.lineTo(x + 38, y + 20);
  ctx.lineTo(x - 38, y + 20); ctx.lineTo(x - 50, y + 4);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.28)';
  ctx.fillRect(x - 80, y - 24, 160, 4);

  /* قندشکن: تیغهٔ لولایی که پایین می‌آید */
  const k = S.hammer > 0 ? clamp(S.hammer / .46, 0, 1) : 0;
  const ang = 0.98 - 0.86 * easeOut(k);
  ctx.save();
  ctx.translate(x + 96, y - 60);
  ctx.rotate(ang);
  ctx.fillStyle = P.ironDk;
  ctx.beginPath(); rrPath(-116, -9, 124, 18, 6); ctx.fill();
  ctx.fillStyle = P.ironLt;
  ctx.beginPath(); rrPath(-114, -7, 120, 7, 3); ctx.fill();
  ctx.fillStyle = P.iron;
  ctx.beginPath();
  ctx.moveTo(-116, -9); ctx.lineTo(-96, -9); ctx.lineTo(-104, 22); ctx.lineTo(-120, 16);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.wood;
  ctx.beginPath(); rrPath(0, -11, 46, 22, 8); ctx.fill();
  ctx.restore();
  /* لولا */
  ctx.fillStyle = P.brass;
  ctx.beginPath(); ctx.arc(x + 96, y - 60, 9, 0, TAU); ctx.fill();
  ctx.fillStyle = P.ironDk;
  ctx.beginPath(); rrPath(x + 88, y - 58, 16, 84, 5); ctx.fill();

  /* تابلوی راهنما */
  ctx.fillStyle = hot ? 'rgba(95, 156, 107, .9)' : 'rgba(6, 14, 18, .6)';
  ctx.beginPath(); rrPath(x - 92, y + 74, 184, 34, 9); ctx.fill();
  ctx.strokeStyle = hot ? P.sugarLt : 'rgba(207, 167, 78, .5)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(x - 92, y + 74, 184, 34, 9); ctx.stroke();
  text('قند را اینجا بکِش', x, y + 91, { size: 16, family: 'Lalezar', color: hot ? '#f3fff2' : P.brassLt });

  if (S.crack > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.crack / .7, 0, 1) * .8;
    ctx.strokeStyle = P.sugarLt; ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * .5;
      ctx.beginPath(); ctx.moveTo(x, y - 30);
      ctx.lineTo(x + Math.cos(a) * 60, y - 30 + Math.sin(a) * 46);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (hot) {
    ctx.save();
    ctx.globalAlpha = .4 + .3 * Math.sin(S.t * 8);
    ctx.strokeStyle = P.sugarLt; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y - 12, ANVIL.r, 0, TAU); ctx.stroke();
    ctx.restore();
  }
}

/** سینیِ مشتری: هرچه گذاشته، با جمعِ خودش. */
function drawTray() {
  const t = trayTotal();
  const over = t > S.want;
  contact(TRAY.x + TRAY.w / 2, TRAY.y + TRAY.h + 10, TRAY.w * .46, 12, .55);
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); rrPath(TRAY.x - 8, TRAY.y - 8, TRAY.w + 16, TRAY.h + 16, 16); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 12); ctx.clip();
  const g = ctx.createLinearGradient(TRAY.x, TRAY.y, TRAY.x + TRAY.w, TRAY.y + TRAY.h);
  g.addColorStop(0, P.brassLt); g.addColorStop(.5, P.brass); g.addColorStop(1, P.brassDk);
  ctx.fillStyle = g; ctx.fillRect(TRAY.x, TRAY.y, TRAY.w, TRAY.h);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.fillRect(TRAY.x, TRAY.y + 38, TRAY.w, TRAY.h - 38);
  ctx.restore();
  ctx.strokeStyle = over ? P.bad : shade(P.brassDk, -.2);
  ctx.lineWidth = over ? 4 : 2.6;
  ctx.beginPath(); rrPath(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 12); ctx.stroke();

  /* جمعِ سینی — کارِ خودِ بچّه، نه جواب */
  text('توی سینی', TRAY.x + TRAY.w - 14, TRAY.y + 20, { size: 14, color: '#3d2e10', align: 'right' });
  numText(fa(t), TRAY.x + 74, TRAY.y + 21, { size: 26, color: over ? '#7b1d10' : '#22190a', align: 'left' });

  for (let i = 0; i < 4; i++) {
    const c = trayCol(i);
    const hot = S.hover && S.hover.kind === 'tray' && S.hover.i === i;
    if (S.paid[i] > 0) {
      ctx.fillStyle = hot ? 'rgba(255, 246, 214, .3)' : 'rgba(0,0,0,.2)';
      ctx.beginPath(); rrPath(c.x + 2, c.y, c.w - 4, c.h, 8); ctx.fill();
    }
    const n = Math.min(S.paid[i], 5);
    const tk = [.44, .58, .82, 1.05][i];
    for (let k = 0; k < n; k++) {
      sugarPiece(c.x + c.w / 2, c.y + c.h - 18 - k * 20, i, tk, i + k);
    }
    if (S.paid[i] > 0) {
      ctx.fillStyle = 'rgba(6, 14, 18, .75)';
      ctx.beginPath(); rrPath(c.x + c.w / 2 - 17, c.y + c.h + 2, 34, 24, 7); ctx.fill();
      numText(fa(S.paid[i]), c.x + c.w / 2, c.y + c.h + 14, { size: 17, color: P.brassLt });
    }
  }
  text('برای پس گرفتن، روی ستون بزن', TRAY.x + TRAY.w / 2, TRAY.y - 20,
    { size: 13, color: 'rgba(226, 240, 244, .5)' });
}

function drawFly() {
  for (const f of S.fly) {
    if (f.t < 0) continue;
    const k = clamp(f.t / f.dur, 0, 1);
    const x = lerp(f.x0, f.x1, k);
    const y = lerp(f.y0, f.y1, k) - Math.sin(k * Math.PI) * (f.arc || 90);
    sugarPiece(x, y, f.i, f.k, 11);
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(8, 20, 25, .92)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(122, 168, 178, .35)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 196 - i * 30;
    ctx.save();
    ctx.globalAlpha = i < S.cups ? 1 : .22;
    ctx.fillStyle = i < S.cups ? '#8a3f14' : '#5d5a52';
    ctx.beginPath(); rrPath(x - 8, HUD_H / 2 - 11, 16, 22, 4); ctx.fill();
    ctx.strokeStyle = i < S.cups ? P.brassLt : '#857f72'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(x - 10, HUD_H / 2 - 14, 20, 28, 5); ctx.stroke();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(246, 236, 214, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
}

function drawTutorial() {
  const st = S.tut.step;
  const bs = boxRect(0), be = boxRect(3);
  if (st === 0) {
    spot([{ x: bs.x, y: bs.y - 40, w: be.x + be.w - bs.x, h: bs.h + 90 }], .76);
    const h = tutCard(280, 520, 640,
      ['چهار جعبه قند داری. هر جعبه یک اندازه:', 'قالبِ هزارتایی، کلّهٔ صدتایی، حبّهٔ ده‌تایی و دانهٔ یکی.'],
      'قندشکنِ قهوه‌خانه');
    tutMore(600, 520 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: bs.x, y: bs.y - 40, w: be.x + be.w - bs.x, h: bs.h + 90 },
          { x: TRAY.x - 10, y: TRAY.y - 10, w: TRAY.w + 20, h: TRAY.h + 20 }], .72);
    tutCard(300, 84, 600, ['روی جعبه بزن تا یک قند برود توی سینیِ مشتری.',
      'تا وقتی جمعِ سینی برابرِ سفارش نشود، چای شیرین نمی‌شود.']);
  } else {
    spot([{ x: ANVIL.x - 130, y: ANVIL.y - 130, w: 260, h: 250 }], .72);
    const h = tutCard(280, 96, 640,
      ['جعبه‌ای خالی شد ولی هنوز از همان اندازه می‌خواهی؟',
       'یک قندِ بزرگ‌تر را بکِش روی سندان:', 'قندشکن آن را به ۱۰ تای کوچک‌تر می‌شکند.'],
      'قرض گرفتن');
    tutMore(600, 96 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function sugarIcon(x, y) {
  sugarPiece(x - 58, y + 2, 1, 1, 2);
  sugarPiece(x + 16, y + 6, 2, 1.2, 4);
  sugarPiece(x + 56, y + 12, 3, 1.5, 6);
  sugarPiece(x - 14, y - 14, 0, .82, 8);
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 780, h: 296, y: 132,
    paper: P.paper, band: P.tile, ink: P.ink, inkSoft: '#57676d',
    icon: sugarIcon,
    title: 'قندشکنِ قهوه‌خانه',
    body: 'مشتری سفارش می‌دهد. قندها در چهار جعبه‌اند: قالبِ هزارتایی، کلّهٔ صدتایی،\nحبّهٔ ده‌تایی و دانهٔ یکی. روی جعبه بزن تا یک قند برود توی سینی.\nجعبه خالی شد؟ قندِ بزرگ‌تر را بکِش روی سندان تا ۱۰ تا شود.',
    btn: BTN_GO, btnLabel: 'سماور را روشن کن', btnHot: S.hover === BTN_GO,
    btnFill: '#2f6470', btnHotFill: '#3d7f8e',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#57676d',
    icon: sugarIcon,
    title: L().endless ? 'سماور سرد شد' : 'همه چایشان را خوردند!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ قهوه‌خانه‌ها را گرداندی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'مشتریِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#2f6470', btnHotFill: '#3d7f8e',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#57676d',
    icon: (x, y) => {
      ctx.fillStyle = '#8a3f14';
      ctx.beginPath(); rrPath(x - 16, y - 12, 32, 40, 6); ctx.fill();
      ctx.strokeStyle = P.brassDk; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - 26, y + 32); ctx.lineTo(x + 26, y + 32); ctx.stroke();
      sugarPiece(x + 40, y + 22, 3, 1, 3);
    },
    title: 'استکان‌ها تمام شد',
    body: 'امتیاز: ' + fa(S.score) + '\nپیش از آنکه جعبه خالی بماند، قندِ بزرگ‌تر را بشکن.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#2f6470', btnHotFill: '#3d7f8e',
  });
}

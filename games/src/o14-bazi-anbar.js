/*!
title: انبارِ خانه — از گذشته تا آینده (بازی)
bg: #2a1f16
*/

/* ═══════════════════════════════════════════════════════════════════════
   انبارِ خانه — علومِ سوم، درس ۱۴ «از گذشته تا آینده»

   کتاب سه راهِ قدیمیِ نگه‌داریِ خوراکی را نشان می‌دهد:
     نمک زدن (نمک‌سود)، خشک کردن در آفتاب، و خنک نگه داشتن
     (سرداب و یخدان).

   ── قانونِ بازی ─────────────────────────────────────────────────
   خوراکی وقتی فاسد می‌شود که هم آب داشته باشد و هم گرم باشد.
   پس آهنگِ فاسد شدن اینجا حاصلِ‌ضربِ دو چیز است:

       سرعتِ خرابی  =  پایه × گرمای جا × آبِ خوراکی

   نمک و آفتاب «آبِ خوراکی» را کم می‌کنند، سرداب و یخدان «گرمای جا»
   را. هیچ‌کدام بهتر از دیگری نیستند؛ هر خوراکی راهِ خودش را دارد:
   شیر و انار نه خشک می‌شوند نه نمک‌سود، پس فقط جای خنک به کارشان
   می‌آید. و آفتابِ تابستان تند است و آفتابِ پاییز کم‌جان — پس هر
   کاری فصلِ خودش را دارد.

   بازی هیچ‌کدامِ این‌ها را نمی‌نویسد؛ نوارِ سلامتِ هر خوراکی جلوی
   چشم پایین می‌رود و بچّه خودش می‌بیند کدام راه برای کدام خوراکی
   جواب داده است.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  sky: '#9fc8dc', skyLo: '#6fa4c0', skyWin: '#c8d8e4', skyHot: '#bfe0ec',
  sun: '#ffe9a8', cloud: '#f2f6f8', snow: '#f4f8fb',
  wall: '#c9a878', wallLo: '#a8865a', wallDk: '#7a5f3d',
  wood: '#8a6238', woodLo: '#5f4225', woodLt: '#ab7f4c',
  brick: '#b07a52', brickDk: '#8a5c3a',
  earth: '#6a4d31', earthLo: '#4a3520',
  cellar: '#3f3226', cellarLo: '#2a2118',
  ice: '#cfe6f0', iceLt: '#eaf6fb', iceDk: '#8fb8c8',
  salt: '#f0ece0', saltDk: '#c8c0ac',
  straw: '#c9a45c',
  paper: '#fbf7ec', card: '#ffffff',
  ink: '#33281c', inkSoft: '#8a7a62',
  good: '#5e9f5e', bad: '#c0503a', gold: '#e0a63f', accent: '#4c9ec4',
  meat: '#c2634f', meatDk: '#8a3f2f', fish: '#8fa8b8', fishDk: '#5f7d90',
  milk: '#f6f2e6', milkDk: '#cfc7b0',
  leaf: '#5aa03f', leafDk: '#38702a', grape: '#7a4a9c', grapeDk: '#4f2f6a',
  tomato: '#d34f3a', apple: '#c83a4a', anar: '#c0392f', anarDk: '#8a2418',
  rot: '#6a6a4a', rotDk: '#454531',
};

/* ───────── فصل‌ها و هوا ───────── */

const SEASONS = [
  { n: 'بهار',    warm: 1.0,  sun: .85 },
  { n: 'تابستان', warm: 1.35, sun: 1.35 },
  { n: 'پاییز',   warm: .85,  sun: .40 },
  { n: 'زمستان',  warm: .50,  sun: .15 },
];
const SEASON_T = 22;                 /* هر فصل چند ثانیه */
const YEAR_T = SEASON_T * 4;
const BASE = .036;                   /* آهنگِ پایهٔ خرابی */
const DRY_NEED = 6;                  /* آفتاب‌ثانیهٔ لازم برای خشک شدن */
const NEED_GOOD = 10;                /* برای بردن چند خوراکی سالم بماند */

/* ───────── جاهای نگه‌داری ───────── */

const STORES = {
  dry:    { n: 'خشک‌کنِ آفتاب', cap: 4, x: 262, y: 70,  w: 438, h: 222, cols: 4 },
  ice:    { n: 'یخدان',        cap: 3, x: 712, y: 70,  w: 472, h: 222, cols: 3 },
  shelf:  { n: 'طاقچه',        cap: 8, x: 262, y: 304, w: 428, h: 216, cols: 4 },
  salt:   { n: 'نمک‌سود',      cap: 4, x: 702, y: 304, w: 482, h: 216, cols: 2 },
  cellar: { n: 'سرداب',        cap: 8, x: 262, y: 532, w: 922, h: 214, cols: 8 },
};
const ORDER = ['dry', 'ice', 'shelf', 'salt', 'cellar'];
/* گرمای هر جا نسبت به بیرون */
const WARMTH = { dry: 1, shelf: 1, salt: 1, cellar: .34, ice: .10, basket: 1 };

const BASKET = { x: 16, y: 70, w: 234, h: 676 };

/* ───────── خوراکی‌ها ───────── */

const KINDS = {
  shir:  { n: 'شیر',      dry: false, salt: false },
  sabzi: { n: 'سبزی',     dry: true,  salt: false },
  mahi:  { n: 'ماهی',     dry: true,  salt: true },
  angur: { n: 'انگور',    dry: true,  salt: false },
  gojeh: { n: 'گوجه',     dry: true,  salt: false },
  anar:  { n: 'انار',     dry: false, salt: false },
  sib:   { n: 'سیب',      dry: true,  salt: false },
  gusht: { n: 'گوشت',     dry: true,  salt: true },
};
const DRIED_N = { sabzi: 'سبزیِ خشک', angur: 'کشمش', gojeh: 'گوجهٔ خشک',
  sib: 'برگهٔ سیب', mahi: 'ماهیِ خشک', gusht: 'قدید' };

/* هر فصل سه خوراکی می‌رسد */
const ARRIVE = [
  ['shir', 'sabzi', 'mahi'],
  ['angur', 'gojeh', 'shir'],
  ['anar', 'sib', 'gusht'],
  ['gusht', 'sabzi', 'anar'],
];

const S = {
  phase: 'intro', phaseT: 0,
  day: 0, season: 0, next: 0,
  items: [], sel: null,
  score: 0, best: 0,
  won: false, winT: 0, lost: 0,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

function tip(msg) { S.tip = msg; S.tipT = 4; }
const SE = () => SEASONS[clamp(S.season, 0, 3)];
const inStore = (k) => S.items.filter((i) => i.at === k);
const alive = (i) => i.f > 0 && !i.ruined;
const goodCount = () => S.items.filter(alive).length;

/** آبِ خوراکی: نمک و خشکی آن را کم می‌کند. */
function water(i) {
  if (i.dried) return .22;
  if (i.salted) return .30;
  /* زیرِ آفتاب، آبش کم‌کم می‌رود؛ پس همان‌جا هم کندتر خراب می‌شود */
  if (i.at === 'dry' && KINDS[i.kind].dry) return 1 - .78 * clamp(i.dry / DRY_NEED, 0, 1);
  return 1;
}
/** آهنگِ خرابی در هر ثانیه. */
function rate(i) {
  return BASE * WARMTH[i.at === 'basket' ? 'basket' : i.at] * SE().warm * water(i);
}

function addItem(kind) {
  S.items.push({
    id: S.items.length, kind, at: 'basket',
    f: 1, dry: 0, dried: false, salted: false, ruined: false, born: S.day,
    ph: Math.random() * TAU,
  });
}

function resetGame() {
  S.day = 0; S.season = 0; S.next = 0;
  S.items.length = 0; S.sel = null;
  S.won = false; S.winT = 0; S.lost = 0;
  for (const k of ARRIVE[0]) addItem(k);
}

function startGame(keep) {
  S.phase = 'play'; S.phaseT = 0;
  if (!keep) S.score = 0;
  S.tut.on = !keep; S.tut.step = 0; S.tut.t = 0;
  resetGame();
}

/* ───────── چیدن ───────── */

function slotOf(store, n) {
  const st = STORES[store];
  const cols = st.cols, rows = Math.ceil(st.cap / cols);
  const cw = st.w / cols, ch = (st.h - 26) / rows;
  const r = Math.floor(n / cols), c = n % cols;
  return { x: st.x + cw * (cols - 1 - c) + cw / 2, y: st.y + 26 + ch * r + ch / 2 };
}
function basketSlot(n) {
  const c = n % 2, r = Math.floor(n / 2);
  return { x: BASKET.x + 60 + (1 - c) * 114, y: BASKET.y + 118 + r * 132 };
}
function posOf(i) {
  if (i.at === 'basket') return basketSlot(inStore('basket').indexOf(i));
  return slotOf(i.at, inStore(i.at).indexOf(i));
}

function place(item, store) {
  if (item.at === store) { S.sel = null; return; }
  if (store !== 'basket' && inStore(store).length >= STORES[store].cap) {
    tip('اینجا دیگر جا ندارد.');
    S.shake = .12; sfx.nope();
    return;
  }
  item.at = store;
  if (store === 'salt' && !item.salted) {
    item.salted = true;
    if (!KINDS[item.kind].salt) {
      item.ruined = true;
      sfx.nope();
      toast.say('نمک این یکی را خراب کرد', 'bad');
    } else {
      sfx.good();
      toast.say('نمک‌سود شد', 'good');
    }
  } else sfx.tap();
  S.sel = null;
}

/* ───────── ورودی ───────── */

const BTN_GO = { x: SCENE_W / 2 - 150, y: 500, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 506, w: 300, h: 68 };
const TUT_TAP = [0, 1, 2], TUT_LAST = 2;

function itemAt(p) {
  for (const i of S.items) {
    const q = posOf(i);
    if (Math.hypot(q.x - p.x, q.y - p.y) < 40) return i;
  }
  return null;
}
function storeAt(p) {
  for (const k of ORDER) {
    const st = STORES[k];
    if (inRect(p, st)) return k;
  }
  if (inRect(p, BASKET)) return 'basket';
  return null;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    const i = itemAt(p);
    if (i) S.hover = { k: 'item', id: i.id };
    else { const st = storeAt(p); if (st) S.hover = { k: 'store', s: st }; }
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startGame(); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.score = 0; resetGame(); sfx.tap(); }
    return;
  }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (S.winT) return;
  const it = itemAt(p);
  if (it) {
    if (!alive(it)) { tip('این یکی دیگر به درد نمی‌خورد.'); return; }
    S.sel = S.sel === it.id ? null : it.id;
    sfx.tick();
    return;
  }
  const st = storeAt(p);
  if (st && S.sel !== null) {
    const item = S.items.find((x) => x.id === S.sel);
    if (item) place(item, st);
    return;
  }
  if (st) tip('اوّل یک خوراکی را بزن، بعد جایش را.');
});

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.tut.on) S.tut.t += dt;

  if (S.phase === 'play' && !S.winT && !S.tut.on) {
    S.day += dt;
    const se = Math.min(3, Math.floor(S.day / SEASON_T));
    if (se !== S.season) {
      S.season = se;
      toast.say(SE().n + ' رسید', 'info');
    }
    /* رسیدنِ خوراکی‌های تازه */
    while (S.next < 4 && S.day >= S.next * SEASON_T) {
      if (S.next > 0) for (const k of ARRIVE[S.next]) addItem(k);
      S.next++;
    }
    for (const i of S.items) {
      if (!alive(i)) continue;
      /* خشک شدن زیرِ آفتاب */
      if (i.at === 'dry' && !i.dried && !i.salted) {
        if (KINDS[i.kind].dry) {
          i.dry += SE().sun * dt;
          if (i.dry >= DRY_NEED) {
            i.dried = true;
            sfx.good();
            const q = posOf(i);
            bits.confetti(q.x, q.y, 12, [P.gold, P.card, P.straw]);
            toast.say(DRIED_N[i.kind] + ' شد', 'good');
          }
        } else i.dry = 0;
      }
      const before = i.f;
      i.f = Math.max(0, i.f - rate(i) * dt);
      if (before > 0 && i.f <= 0) {
        S.lost++;
        sfx.nope();
        toast.say(KINDS[i.kind].n + ' فاسد شد', 'bad');
      }
    }
    if (S.day >= YEAR_T) {
      S.winT = .001;
      const g = goodCount();
      S.score = g * 100;
      if (S.score > S.best) S.best = S.score;
      S.won = g >= NEED_GOOD;
      if (S.won) sfx.win(); else sfx.nope();
    }
  }
  if (S.winT) {
    S.winT += dt;
    if (S.winT > 1.6) { S.winT = 0; S.phase = 'won'; S.phaseT = 0; }
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { resetGame(); runLoop(step); });

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
  for (const s of shapes) { ctx.moveTo(s.x + s.r, s.y); ctx.arc(s.x, s.y, s.r, 0, TAU, true); }
  ctx.fillStyle = `rgba(28, 20, 12, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 244, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '40, 28, 14');
  ctx.fillStyle = P.gold;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: P.inkSoft }); yy += 30; }
  return h + 20;
}

/* ───────── خوراکی‌ها ───────── */

function foodArt(i, x, y, s) {
  const k = i.kind, d = i.dried, rot = i.f <= 0, ru = i.ruined;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (rot) ctx.globalAlpha = .9;
  const A = rot ? P.rot : null, B = rot ? P.rotDk : null;
  const c1 = (a) => (rot ? A : a), c2 = (b) => (rot ? B : b);
  if (k === 'shir') {
    ctx.fillStyle = c1(P.milk);
    ctx.beginPath();
    ctx.moveTo(-16, 18); ctx.lineTo(-13, -8);
    ctx.quadraticCurveTo(-13, -16, -6, -18);
    ctx.lineTo(6, -18);
    ctx.quadraticCurveTo(13, -16, 13, -8);
    ctx.lineTo(16, 18);
    ctx.quadraticCurveTo(0, 24, -16, 18);
    ctx.fill();
    ctx.fillStyle = c2(P.milkDk);
    ctx.beginPath(); ctx.ellipse(0, -18, 8, 4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath(); ctx.ellipse(-7, 4, 3.4, 10, .1, 0, TAU); ctx.fill();
  } else if (k === 'sabzi') {
    ctx.strokeStyle = c2(d ? '#7f6a34' : P.leafDk); ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let j = -2; j <= 2; j++) {
      ctx.beginPath(); ctx.moveTo(j * 3, 20);
      ctx.quadraticCurveTo(j * 7, 0, j * 11 - 1, d ? -8 : -18); ctx.stroke();
    }
    ctx.fillStyle = c1(d ? '#a08d48' : P.leaf);
    for (let j = -2; j <= 2; j++) {
      ctx.save();
      ctx.translate(j * 11 - 1, d ? -8 : -18); ctx.rotate(j * .3);
      ctx.beginPath(); ctx.ellipse(0, 0, d ? 6 : 9, d ? 3.4 : 6, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = c2('#9a7a3a'); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-9, 14); ctx.lineTo(9, 14); ctx.stroke();
  } else if (k === 'mahi') {
    ctx.fillStyle = c1(d ? '#a08258' : P.fish);
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.quadraticCurveTo(4, -13, -14, -8);
    ctx.quadraticCurveTo(-20, 0, -14, 8);
    ctx.quadraticCurveTo(4, 13, 18, 0);
    ctx.fill();
    ctx.fillStyle = c2(d ? '#7a6040' : P.fishDk);
    ctx.beginPath();
    ctx.moveTo(-14, 0); ctx.lineTo(-26, -9); ctx.lineTo(-26, 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fdfaf2';
    ctx.beginPath(); ctx.arc(11, -3, 3.2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1b2530';
    ctx.beginPath(); ctx.arc(11.6, -3, 1.7, 0, TAU); ctx.fill();
  } else if (k === 'angur') {
    const col = d ? '#6a4a2c' : P.grape, colD = d ? '#452e18' : P.grapeDk;
    ctx.strokeStyle = c2('#7f6a34'); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(2, -12); ctx.stroke();
    const R = d ? 4.4 : 6;
    for (const q of [[0, -6], [-8, 0], [8, 0], [-4, 8], [5, 8], [0, 16], [-11, -8], [11, -8]]) {
      ctx.fillStyle = ball(q[0], q[1], R, 'rgba(255,255,255,.6)', c1(col), c2(colD));
      ctx.beginPath(); ctx.arc(q[0] * (d ? .8 : 1), q[1] * (d ? .8 : 1), R, 0, TAU); ctx.fill();
    }
  } else if (k === 'gojeh') {
    if (d) {
      ctx.fillStyle = c1('#a8442e');
      for (const q of [[-8, -4], [6, -6], [-2, 8]]) {
        ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(q[0] * .1);
        ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
    } else {
      ctx.fillStyle = ball(0, -6, 19, '#f08a70', c1(P.tomato), c2('#8f2c20'));
      ctx.beginPath(); ctx.arc(0, 2, 18, 0, TAU); ctx.fill();
      ctx.fillStyle = c2(P.leafDk);
      for (let j = 0; j < 5; j++) {
        ctx.save(); ctx.translate(0, -14); ctx.rotate(j * 1.26);
        ctx.beginPath(); ctx.ellipse(0, -4, 3.4, 7, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }
  } else if (k === 'anar') {
    ctx.fillStyle = ball(0, -6, 20, '#e8705f', c1(P.anar), c2(P.anarDk));
    ctx.beginPath(); ctx.arc(0, 2, 19, 0, TAU); ctx.fill();
    ctx.fillStyle = c2(P.anarDk);
    ctx.beginPath();
    ctx.moveTo(-6, -16); ctx.lineTo(-3, -24); ctx.lineTo(0, -18);
    ctx.lineTo(3, -24); ctx.lineTo(6, -16);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    ctx.beginPath(); ctx.ellipse(-7, -4, 6, 4, -.5, 0, TAU); ctx.fill();
  } else if (k === 'sib') {
    if (d) {
      ctx.fillStyle = c1('#d8b47e');
      for (const q of [[-8, -2], [7, -6], [-1, 9]]) {
        ctx.beginPath(); ctx.arc(q[0], q[1], 8, 0, TAU); ctx.fill();
        ctx.fillStyle = c2('#b08d55');
        ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, TAU); ctx.fill();
        ctx.fillStyle = c1('#d8b47e');
      }
    } else {
      ctx.fillStyle = ball(0, -6, 19, '#ef7a86', c1(P.apple), c2('#8a2430'));
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.bezierCurveTo(-22, -18, -20, 16, 0, 18);
      ctx.bezierCurveTo(20, 16, 22, -18, 0, -10);
      ctx.fill();
      ctx.strokeStyle = c2('#6a4a24'); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(3, -20, 8, -22); ctx.stroke();
      ctx.fillStyle = c1(P.leaf);
      ctx.beginPath(); ctx.ellipse(-7, -18, 7, 4, -.5, 0, TAU); ctx.fill();
    }
  } else if (k === 'gusht') {
    ctx.fillStyle = c1(d ? '#8a4a34' : P.meat);
    ctx.beginPath();
    ctx.moveTo(-16, -8);
    ctx.quadraticCurveTo(0, -20, 16, -8);
    ctx.quadraticCurveTo(22, 4, 10, 14);
    ctx.quadraticCurveTo(-6, 20, -16, 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c2(d ? '#5f2f1e' : P.meatDk);
    for (let j = -1; j <= 1; j++) {
      ctx.beginPath();
      ctx.ellipse(j * 8, -2 + j * 3, 3.4, 8, .3, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath(); ctx.ellipse(-4, -8, 8, 3.4, -.3, 0, TAU); ctx.fill();
  }
  /* دانه‌های نمک */
  if (i.salted && !rot) {
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    for (let j = 0; j < 9; j++) {
      const a = j * 2.1 + i.ph;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 15, Math.sin(a) * 12, 1.8, 0, TAU); ctx.fill();
    }
  }
  /* مگس‌های فاسد */
  if (rot) {
    ctx.fillStyle = '#2a2a20';
    for (let j = 0; j < 3; j++) {
      const a = S.t * 3 + j * 2.1 + i.ph;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 22, -18 + Math.sin(a * 1.7) * 8, 2.4, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
  /* نشانِ خراب‌شده با نمک */
  if (ru && !rot) {
    ctx.save();
    ctx.strokeStyle = P.bad; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 16, y - 16); ctx.lineTo(x + 16, y + 16);
    ctx.moveTo(x + 16, y - 16); ctx.lineTo(x - 16, y + 16);
    ctx.stroke();
    ctx.restore();
  }
}

function drawItem(i) {
  const q = posOf(i);
  const selected = S.sel === i.id;
  const hot = S.hover && S.hover.k === 'item' && S.hover.id === i.id;
  const dy = selected ? -6 + Math.sin(S.t * 6) * 3 : (hot ? -3 : 0);
  ctx.save();
  if (i.at === 'dry' && !i.dried && KINDS[i.kind].dry) {
    /* آویزان از بند */
    ctx.strokeStyle = '#8a7448'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(q.x, STORES.dry.y + 54); ctx.lineTo(q.x, q.y - 20); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(20, 12, 4, .22)';
  ctx.beginPath(); ctx.ellipse(q.x, q.y + 26, 22, 6, 0, 0, TAU); ctx.fill();
  foodArt(i, q.x, q.y + dy, 1);
  /* نوارِ سلامت */
  const bw = 44, by = q.y + 34;
  ctx.fillStyle = 'rgba(16, 10, 4, .62)';
  ctx.beginPath(); rrPath(q.x - bw / 2 - 2, by - 2, bw + 4, 11, 5); ctx.fill();
  const f = clamp(i.f, 0, 1);
  ctx.fillStyle = i.ruined ? P.inkSoft : f > .55 ? P.good : f > .25 ? P.gold : P.bad;
  ctx.beginPath(); rrPath(q.x - bw / 2, by, bw * f, 7, 3.5); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); rrPath(q.x - bw / 2, by, bw, 7, 3.5); ctx.stroke();
  /* پیشرفتِ خشک شدن */
  if (i.at === 'dry' && !i.dried && KINDS[i.kind].dry) {
    ctx.strokeStyle = P.gold; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(q.x, q.y + dy, 30, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(i.dry / DRY_NEED, 0, 1));
    ctx.stroke();
  }
  if (selected) {
    ctx.strokeStyle = P.gold; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.arc(q.x, q.y + dy, 34 + Math.sin(S.t * 6) * 2, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}

/* ───────── خانه ───────── */

function bayPath(st, pad) {
  const q = pad || 0;
  ctx.beginPath();
  rrPath(st.x - q, st.y - q, st.w + q * 2, st.h + q * 2, 14);
}

function drawWallBack() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, SCENE_H);
  g.addColorStop(0, P.wall); g.addColorStop(.62, P.wallLo); g.addColorStop(1, P.wallDk);
  ctx.fillStyle = g;
  ctx.fillRect(0, HUD_H, SCENE_W, SCENE_H - HUD_H);
  ctx.fillStyle = 'rgba(120, 90, 50, .16)';
  for (let j = 0; j < 26; j++) ctx.fillRect(0, HUD_H + 12 + j * 28, SCENE_W, 3);
  ctx.fillStyle = 'rgba(255,255,255,.05)';
  for (let j = 0; j < 200; j++) {
    ctx.fillRect(noise1(j * 2.1) * SCENE_W, HUD_H + noise1(j * 5.3) * (SCENE_H - HUD_H), 3, 3);
  }
  /* کفِ خاکیِ زیرزمین */
  ctx.fillStyle = 'rgba(40, 28, 14, .35)';
  ctx.fillRect(0, 520, SCENE_W, SCENE_H - 520);
}

/** خشک‌کنِ آفتاب: بیرونِ خانه، زیرِ آسمان. */
function drawDryBay() {
  const st = STORES.dry, se = SE();
  ctx.save();
  bayPath(st); ctx.clip();
  const g = ctx.createLinearGradient(0, st.y, 0, st.y + st.h);
  g.addColorStop(0, se.warm > 1.1 ? P.skyHot : (se.warm < .7 ? P.skyWin : P.skyLo));
  g.addColorStop(1, P.sky);
  ctx.fillStyle = g;
  ctx.fillRect(st.x, st.y, st.w, st.h);
  /* آفتاب */
  const sx2 = st.x + st.w - 62, sy2 = st.y + 58;
  ctx.save();
  ctx.globalAlpha = clamp(se.sun, .18, 1);
  const hg = ctx.createRadialGradient(sx2, sy2, 12, sx2, sy2, 76);
  hg.addColorStop(0, 'rgba(255, 233, 168, .85)');
  hg.addColorStop(1, 'rgba(255, 233, 168, 0)');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.arc(sx2, sy2, 76, 0, TAU); ctx.fill();
  ctx.fillStyle = P.sun;
  ctx.beginPath(); ctx.arc(sx2, sy2, 24, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.sun; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let j = 0; j < 8; j++) {
    const a2 = j * TAU / 8 + S.t * .14;
    ctx.beginPath();
    ctx.moveTo(sx2 + Math.cos(a2) * 32, sy2 + Math.sin(a2) * 32);
    ctx.lineTo(sx2 + Math.cos(a2) * 42, sy2 + Math.sin(a2) * 42);
    ctx.stroke();
  }
  ctx.restore();
  if (se.sun < .6) {
    ctx.save();
    ctx.globalAlpha = clamp(1 - se.sun, 0, 1) * .95;
    ctx.fillStyle = P.cloud;
    for (const c of [[sx2 - 40, sy2 + 4, 44], [sx2 + 8, sy2 - 10, 32], [sx2 - 84, sy2 + 12, 30]]) {
      ctx.beginPath();
      ctx.ellipse(c[0] + Math.sin(S.t * .3 + c[0]) * 6, c[1], c[2], c[2] * .6, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  if (se.warm < .7) {
    ctx.fillStyle = P.snow;
    for (let j = 0; j < 40; j++) {
      const x = st.x + (noise1(j * 2.7) * st.w + S.t * 12) % st.w;
      const y = st.y + ((noise1(j * 5.1) * st.h + S.t * 30) % st.h);
      ctx.globalAlpha = .8;
      ctx.beginPath(); ctx.arc(x, y, 1.4 + noise1(j * 7) * 1.6, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  /* لبهٔ بام */
  ctx.fillStyle = P.woodLo;
  ctx.fillRect(st.x, st.y + st.h - 22, st.w, 22);
  ctx.fillStyle = P.wood;
  ctx.fillRect(st.x, st.y + st.h - 26, st.w, 8);
  /* بندِ رخت */
  ctx.strokeStyle = P.wood; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (const x of [st.x + 26, st.x + st.w - 26]) {
    ctx.beginPath(); ctx.moveTo(x, st.y + st.h - 26); ctx.lineTo(x, st.y + 44); ctx.stroke();
  }
  ctx.strokeStyle = '#8a7448'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(st.x + 26, st.y + 50);
  ctx.quadraticCurveTo(st.x + st.w / 2, st.y + 62, st.x + st.w - 26, st.y + 50);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = P.wallDk; ctx.lineWidth = 4;
  bayPath(st); ctx.stroke();
}

/** یخدان: گنبدِ سرد. */
function drawIceBay() {
  const st = STORES.ice;
  ctx.save();
  bayPath(st); ctx.clip();
  const g = ctx.createLinearGradient(0, st.y, 0, st.y + st.h);
  g.addColorStop(0, P.iceLt); g.addColorStop(1, P.iceDk);
  ctx.fillStyle = g;
  ctx.fillRect(st.x, st.y, st.w, st.h);
  /* طاقِ گنبد */
  ctx.strokeStyle = 'rgba(120, 150, 165, .45)'; ctx.lineWidth = 3;
  for (let j = 0; j < 6; j++) {
    ctx.beginPath();
    ctx.arc(st.x + st.w / 2, st.y + st.h + 40, 60 + j * 46, Math.PI, TAU);
    ctx.stroke();
  }
  /* قالب‌های یخ */
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  for (let j = 0; j < 14; j++) {
    const x = st.x + 14 + noise1(j * 3.1) * (st.w - 28);
    const y = st.y + 26 + noise1(j * 7.3) * (st.h - 40);
    ctx.save(); ctx.translate(x, y); ctx.rotate(noise1(j) * 2);
    ctx.fillRect(-11, -7, 22, 14);
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.4;
    ctx.strokeRect(-11, -7, 22, 14);
    ctx.restore();
  }
  /* بخارِ سرد */
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  for (let j = 0; j < 5; j++) {
    const a2 = S.t * .5 + j * 1.3;
    ctx.beginPath();
    ctx.ellipse(st.x + st.w / 2 + Math.cos(a2) * 130, st.y + st.h - 26 + Math.sin(a2 * .7) * 12,
      54, 12, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#6f8fa0'; ctx.lineWidth = 4;
  bayPath(st); ctx.stroke();
}

/** طاقچه: تختهٔ چوبی روی دیوار. */
function drawShelfBay() {
  const st = STORES.shelf;
  ctx.save();
  bayPath(st); ctx.clip();
  ctx.fillStyle = 'rgba(70, 46, 20, .22)';
  ctx.fillRect(st.x, st.y, st.w, st.h);
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  for (let j = 0; j < 6; j++) ctx.fillRect(st.x, st.y + 18 + j * 34, st.w, 4);
  const rows = 2, ch = (st.h - 26) / rows;
  for (let r = 0; r < rows; r++) {
    const y = st.y + 26 + ch * r + ch / 2 + 30;
    ctx.fillStyle = P.woodLo;
    ctx.beginPath(); rrPath(st.x + 6, y, st.w - 12, 13, 5); ctx.fill();
    ctx.fillStyle = P.wood;
    ctx.beginPath(); rrPath(st.x + 6, y, st.w - 12, 6, 3); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = P.wallDk; ctx.lineWidth = 4;
  bayPath(st); ctx.stroke();
}

/** نمک‌سود: خمرهٔ نمک. */
function drawSaltBay() {
  const st = STORES.salt;
  ctx.save();
  bayPath(st); ctx.clip();
  ctx.fillStyle = 'rgba(70, 46, 20, .22)';
  ctx.fillRect(st.x, st.y, st.w, st.h);
  /* بدنهٔ خمره */
  const jx = st.x + 24, jw = st.w - 48, jy = st.y + 32, jh = st.h - 44;
  ctx.fillStyle = P.brick;
  ctx.beginPath();
  ctx.moveTo(jx + 10, jy);
  ctx.quadraticCurveTo(jx - 24, jy + jh * .5, jx + 26, jy + jh);
  ctx.lineTo(jx + jw - 26, jy + jh);
  ctx.quadraticCurveTo(jx + jw + 24, jy + jh * .5, jx + jw - 10, jy);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.brickDk;
  ctx.beginPath(); ctx.ellipse(jx + jw / 2, jy, jw / 2 - 8, 16, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = P.salt;
  ctx.beginPath(); ctx.ellipse(jx + jw / 2, jy + 3, jw / 2 - 16, 11, 0, 0, TAU); ctx.fill();
  /* نمکِ درونِ خمره */
  ctx.fillStyle = 'rgba(240, 236, 224, .5)';
  ctx.beginPath();
  ctx.ellipse(jx + jw / 2, jy + jh - 22, jw / 2 - 22, 34, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = P.saltDk;
  for (let j = 0; j < 40; j++) {
    const x = jx + 24 + noise1(j * 2.3) * (jw - 48);
    const y = jy + jh - 52 + noise1(j * 5.9) * 54;
    ctx.beginPath(); ctx.arc(x, y, 1.6 + noise1(j) * 1.6, 0, TAU); ctx.fill();
  }
  ctx.strokeStyle = P.woodLo; ctx.lineWidth = 6;
  for (const yy of [jy + jh * .38, jy + jh * .78]) {
    ctx.beginPath(); ctx.moveTo(jx - 16, yy); ctx.lineTo(jx + jw + 16, yy); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = P.wallDk; ctx.lineWidth = 4;
  bayPath(st); ctx.stroke();
}

/** سرداب: زیرزمینِ طاق‌دار. */
function drawCellarBay() {
  const st = STORES.cellar;
  ctx.save();
  bayPath(st); ctx.clip();
  const g = ctx.createLinearGradient(0, st.y, 0, st.y + st.h);
  g.addColorStop(0, P.cellar); g.addColorStop(1, P.cellarLo);
  ctx.fillStyle = g;
  ctx.fillRect(st.x, st.y, st.w, st.h);
  ctx.strokeStyle = 'rgba(176, 122, 82, .45)'; ctx.lineWidth = 3;
  for (let j = 0; j < 8; j++) {
    ctx.beginPath();
    ctx.arc(st.x + 58 + j * 116, st.y + st.h, 58, Math.PI, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(176, 122, 82, .18)';
  for (let j = 0; j < 8; j++) ctx.fillRect(st.x + j * 116, st.y + 22, 4, st.h);
  /* نورِ چراغ */
  const lg = ctx.createRadialGradient(st.x + 60, st.y + 40, 8, st.x + 60, st.y + 40, 150);
  lg.addColorStop(0, 'rgba(255, 214, 130, .30)');
  lg.addColorStop(1, 'rgba(255, 214, 130, 0)');
  ctx.fillStyle = lg;
  ctx.fillRect(st.x, st.y, 300, st.h);
  ctx.fillStyle = P.gold;
  ctx.beginPath(); ctx.arc(st.x + 60, st.y + 40, 7 + Math.sin(S.t * 5) * 1.2, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#1e1810'; ctx.lineWidth = 4;
  bayPath(st); ctx.stroke();
}

function drawBasket() {
  ctx.fillStyle = 'rgba(60, 40, 18, .34)';
  ctx.beginPath(); rrPath(BASKET.x, BASKET.y, BASKET.w, BASKET.h, 16); ctx.fill();
  ctx.save();
  ctx.beginPath(); rrPath(BASKET.x, BASKET.y, BASKET.w, BASKET.h, 16); ctx.clip();
  ctx.strokeStyle = 'rgba(201, 164, 92, .55)'; ctx.lineWidth = 7;
  for (let j = 0; j < 18; j++) {
    ctx.beginPath();
    ctx.moveTo(BASKET.x - 4, BASKET.y + 48 + j * 42);
    ctx.quadraticCurveTo(BASKET.x + BASKET.w / 2, BASKET.y + 56 + j * 42,
      BASKET.x + BASKET.w + 4, BASKET.y + 48 + j * 42);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(160, 126, 62, .5)'; ctx.lineWidth = 5;
  for (let j = 0; j < 5; j++) {
    const x = BASKET.x + 20 + j * 48;
    ctx.beginPath(); ctx.moveTo(x, BASKET.y); ctx.lineTo(x, BASKET.y + BASKET.h); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = P.straw; ctx.lineWidth = 5;
  ctx.beginPath(); rrPath(BASKET.x, BASKET.y, BASKET.w, BASKET.h, 16); ctx.stroke();
  ctx.fillStyle = 'rgba(24, 16, 8, .62)';
  ctx.beginPath(); rrPath(BASKET.x + 16, BASKET.y + 12, BASKET.w - 32, 30, 9); ctx.fill();
  text('تازه‌رسیده‌ها', BASKET.x + BASKET.w / 2, BASKET.y + 28,
    { size: 20, family: 'Lalezar', color: P.card });
}

function drawLabels() {
  for (const k of ORDER) {
    const st = STORES[k];
    const hot = S.hover && S.hover.k === 'store' && S.hover.s === k;
    const full = inStore(k).length >= st.cap;
    if (S.sel !== null) {
      ctx.save();
      ctx.globalAlpha = hot ? .95 : .5;
      ctx.strokeStyle = full ? P.bad : P.gold;
      ctx.lineWidth = hot ? 5 : 3.4;
      ctx.setLineDash([12, 8]);
      bayPath(st, 6); ctx.stroke();
      ctx.restore();
    }
    const lw = Math.max(126, st.n.length * 13 + 70);
    ctx.fillStyle = 'rgba(24, 16, 8, .68)';
    ctx.beginPath(); rrPath(st.x + st.w / 2 - lw / 2, st.y - 1, lw, 28, 9); ctx.fill();
    text(st.n, st.x + st.w / 2 + 18, st.y + 13, { size: 18, family: 'Lalezar', color: P.card });
    numText(fa(inStore(k).length) + '/' + fa(st.cap), st.x + st.w / 2 - lw / 2 + 26, st.y + 13,
      { size: 14, color: full ? '#f0a08a' : 'rgba(255,255,255,.75)' });
  }
}

/* ───────── نوار و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = 'rgba(34, 24, 14, .86)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(224, 166, 63, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text('انبارِ خانه', SCENE_W - 100, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  /* سالِ در گذر */
  const bx = 340, bw = 460;
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(bx, HUD_H / 2 - 9, bw, 18, 9); ctx.fill();
  for (let k = 0; k < 4; k++) {
    ctx.save();
    ctx.globalAlpha = k <= S.season ? .95 : .35;
    ctx.fillStyle = ['#7fbf5f', '#e8b44a', '#c98a3a', '#9fc8dc'][k];
    ctx.beginPath();
    rrPath(bx + k * (bw / 4) + 2, HUD_H / 2 - 9, bw / 4 - 4, 18, 8);
    ctx.fill();
    ctx.restore();
    text(SEASONS[k].n, bx + k * (bw / 4) + bw / 8, HUD_H / 2,
      { size: 14, color: k <= S.season ? '#33281c' : 'rgba(255,255,255,.6)' });
  }
  ctx.fillStyle = P.card;
  ctx.beginPath();
  ctx.arc(bx + clamp(S.day / YEAR_T, 0, 1) * bw, HUD_H / 2, 6, 0, TAU); ctx.fill();
  /* شمارشِ سالم */
  const g = goodCount();
  numText(fa(g) + ' / ' + fa(NEED_GOOD), 130, HUD_H / 2, { size: 22, color: g >= NEED_GOOD ? '#8fd46a' : P.gold });
  text('سالم', 205, HUD_H / 2, { size: 16, color: 'rgba(255,255,255,.7)' });
  if (S.lost > 0) {
    numText(fa(S.lost), 250, HUD_H / 2, { size: 20, color: '#f0a08a' });
    text('فاسد', 296, HUD_H / 2, { size: 15, color: 'rgba(255,255,255,.55)' });
  }
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: BASKET.x + BASKET.w / 2, y: 360, r: 210 }], .7);
    const h = tutCard(420, 200, 560,
      ['یک سالِ کامل پیشِ رو داری و هر فصل', 'چند خوراکیِ تازه می‌رسد.'], 'انبارِ خانه');
    tutMore(700, 200 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: 560, y: 150, r: 250 }, { x: 985, y: 180, r: 200 }], .66);
    const h = tutCard(360, 480, 600,
      ['یک خوراکی را بزن، بعد جایی را که می‌خواهی بگذاری‌اش:',
        'خشک‌کنِ آفتاب، یخدان، طاقچه، نمک‌سود یا سرداب.']);
    tutMore(660, 480 + h + 8, S.t, P.ink);
  } else {
    spot([{ x: 700, y: 300, r: 260 }], .62);
    const h = tutCard(360, 560, 600,
      ['زیرِ هر خوراکی یک نوارِ سلامت است.', 'ببین کدام راه برای کدام خوراکی جواب می‌دهد.']);
    tutMore(660, 560 + h + 8, S.t, P.ink);
  }
}

function jarIcon(x, y) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(1.3, 1.3);
  ctx.fillStyle = P.brick;
  ctx.beginPath();
  ctx.moveTo(-16, -14);
  ctx.quadraticCurveTo(-26, 4, -12, 20);
  ctx.lineTo(12, 20);
  ctx.quadraticCurveTo(26, 4, 16, -14);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.brickDk;
  ctx.beginPath(); ctx.ellipse(0, -14, 17, 6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = P.salt;
  ctx.beginPath(); ctx.ellipse(0, -13, 13, 4, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 920, h: 340, y: 126,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: P.inkSoft,
    icon: jarIcon,
    title: 'انبارِ خانه',
    body: 'یخچال نداریم. یک سال وقت داری و پنج راهِ قدیمی:\nخشک‌کنِ آفتاب، نمک‌سود، طاقچه، سرداب و یخدان.\nآخرِ سال باید دستِ‌کم ده خوراکی سالم مانده باشد.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#a5763a', btnHotFill: '#c08d47',
  });
}

function drawWon() {
  const g = goodCount();
  overlay({
    t: S.phaseT, w: 940, h: 350, y: 122,
    paper: P.paper, band: S.won ? P.good : P.bad, ink: P.ink, inkSoft: P.inkSoft,
    icon: jarIcon,
    title: S.won ? 'زمستان را رد کردی' : 'سال تمام شد',
    body: (S.won
      ? 'از دوازده خوراکی، ' + fa(g) + ' تا سالم ماند.\n'
      : 'از دوازده خوراکی فقط ' + fa(g) + ' تا سالم ماند.\n') +
      'نمک و آفتاب آبِ خوراکی را می‌گیرند و سرداب و یخدان\nگرما را — و خوراکی بی آب یا بی گرما دیر فاسد می‌شود.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#a5763a', btnHotFill: '#c08d47',
  });
}

/* ───────── قاب ───────── */

function draw() {
  beginScene('#2a1f16');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, 0);
  }
  drawWallBack();
  drawDryBay();
  drawIceBay();
  drawShelfBay();
  drawSaltBay();
  drawCellarBay();
  drawBasket();
  drawLabels();
  for (const i of S.items) drawItem(i);
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
    const w = 560;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 46, w, 38, P.card, 91, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 27, { size: 17, color: P.ink });
    ctx.restore();
  }
  endScene(.12, 'rgba(30, 18, 6, .38)', .2, .12);
}

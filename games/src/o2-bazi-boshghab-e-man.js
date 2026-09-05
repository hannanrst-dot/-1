/*!
title: بشقابِ من — خوراکی‌ها (بازی)
bg: #2e2418
*/

/* ═══════════════════════════════════════════════════════════════════════
   بشقابِ من — علومِ سوم، درس ۲ «خوراکی‌ها»  (بازی)

   درسِ کتاب: «بشقابِ سلامت» به ما نشان می‌دهد بهتر است هر روز چه مقدار
   از هر گروهِ موادّ غذایی بخوریم؛ مثلاً از گروه میوه‌ها و سبزی‌ها بیشتر
   و از گروه چربی‌ها کمتر. و: «غذاهایی که می‌خوریم معمولاً مخلوطی از چند
   گروه موادّ غذایی هستند» (آش رشته: سبزی، حبوبات، رشته، کشک).

   بازی همین دو چیز است، ولی نه با پرسش:
   ▸ بشقاب پنج قاچ دارد و پهنای هر قاچ به اندازهٔ سهمِ همان گروه است؛
     پس خودِ بشقاب نسبت‌ها را نشان می‌دهد، بی‌آنکه چیزی نوشته شود.
   ▸ هر قاچ نواربه‌نوار پر می‌شود؛ هر نوار یک واحد. خطِ سفید جای هدف است.
   ▸ روی هر خوراکی که بزنی، تکّه‌تکّه می‌شود و هر تکّه در گروهِ خودش
     می‌نشیند. مخلوط‌ها چند تکّه می‌شوند — بچّه خودش کشف می‌کند که
     آش رشته چند گروه دارد، بی‌آنکه جایی نوشته باشد.
   ▸ سرریز خطاست: از خطِ سفید که رد شوی، نوارها بیرون می‌ریزند.
   ▸ هر خوراکی را می‌شود دوباره برداشت؛ پس هیچ‌وقت به بن‌بست نمی‌خوری.

   بازارِ هر مرحله طوری ساخته می‌شود که دستِ‌کم یک ترکیبِ درست دارد
   (اوّل جواب ساخته می‌شود، بعد چند خوراکیِ اضافه کنارش گذاشته می‌شود)،
   ولی جواب هیچ‌جا نوشته یا نشان داده نمی‌شود.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  cloth:  '#e7dcc6', clothLo: '#cfc0a2', clothHi: '#f4ecdb',
  wood:   '#a9855a', woodDk: '#6f5533', woodLt: '#cdae83',
  china:  '#fbfaf6', chinaLo: '#dfe0d8', chinaRim: '#c9cbc0',
  ink:    '#3b3428', inkSoft: '#8b8270',
  paper:  '#fdfaf0', card: '#ffffff',
  good:   '#4e8f5c', bad: '#c04a34', gold: '#c9962c', accent: '#3f7d8c',
  spill:  '#b3452f',
};

/* ───────── گروه‌های موادّ غذایی ─────────
   رنگ‌ها همان رنگ‌های آشنای بشقابِ سلامت است.                        */

const GROUPS = [
  { id: 'ghalat', n: 'غلّات و سیب‌زمینی', c: '#e08a2e', d: '#a25c14', l: '#f3b364' },
  { id: 'sabzi',  n: 'میوه و سبزی',       c: '#5da24e', d: '#356b2c', l: '#8fc97a' },
  { id: 'gusht',  n: 'گوشت و حبوبات',     c: '#9b4f96', d: '#6a2f66', l: '#c07dbb' },
  { id: 'labani', n: 'شیر و لبنیات',      c: '#4a86c4', d: '#2c5b8e', l: '#84b3e0' },
  { id: 'charbi', n: 'چربی‌ها',           c: '#d9b73f', d: '#9a7c15', l: '#f0d97c' },
];
const NG = GROUPS.length;

/* ───────── خوراکی‌ها ─────────
   v = [غلّات، سبزی، گوشت، لبنیات، چربی] — چند واحد از هر گروه.
   مخلوط‌ها همان‌هایی‌اند که کتاب مثال زده یا در سفرهٔ ایرانی آشنایند. */

const FOODS = [
  /* تک‌گروهی‌ها */
  { id: 'nan',    n: 'نان سنگک', v: [2, 0, 0, 0, 0], mix: 0 },
  { id: 'berenj', n: 'برنج',     v: [3, 0, 0, 0, 0], mix: 0 },
  { id: 'sibz',   n: 'سیب‌زمینی', v: [2, 0, 0, 0, 0], mix: 0 },
  { id: 'sib',    n: 'سیب',      v: [0, 1, 0, 0, 0], mix: 0 },
  { id: 'khiar',  n: 'خیار',     v: [0, 1, 0, 0, 0], mix: 0 },
  { id: 'goje',   n: 'گوجه',     v: [0, 1, 0, 0, 0], mix: 0 },
  { id: 'havij',  n: 'هویج',     v: [0, 1, 0, 0, 0], mix: 0 },
  { id: 'angur',  n: 'انگور',    v: [0, 1, 0, 0, 0], mix: 0 },
  { id: 'kahu',   n: 'کاهو',     v: [0, 2, 0, 0, 0], mix: 0 },
  { id: 'esfnj',  n: 'اسفناج',   v: [0, 2, 0, 0, 0], mix: 0 },
  { id: 'shir',   n: 'شیر',      v: [0, 0, 0, 2, 0], mix: 0 },
  { id: 'mast',   n: 'ماست',     v: [0, 0, 0, 2, 0], mix: 0 },
  { id: 'tokhm',  n: 'تخم‌مرغ',  v: [0, 0, 1, 0, 0], mix: 0 },
  { id: 'morgh',  n: 'مرغ',      v: [0, 0, 2, 0, 0], mix: 0 },
  { id: 'adas',   n: 'عدس',      v: [0, 0, 2, 0, 0], mix: 0 },
  { id: 'lubia',  n: 'لوبیا',    v: [0, 0, 2, 0, 0], mix: 0 },
  { id: 'mahi',   n: 'ماهی',     v: [0, 0, 2, 0, 0], mix: 0 },
  { id: 'roghan', n: 'روغن',     v: [0, 0, 0, 0, 1], mix: 0 },
  { id: 'kare',   n: 'کره',      v: [0, 0, 0, 0, 1], mix: 0 },
  /* دوگروهی‌های ساده */
  { id: 'panir',  n: 'پنیر',     v: [0, 0, 0, 1, 1], mix: 1 },
  { id: 'gerdu',  n: 'گردو',     v: [0, 0, 1, 0, 1], mix: 1 },
  /* غذاهای مخلوط */
  { id: 'salad',  n: 'سالاد شیرازی', v: [0, 3, 0, 0, 0], mix: 1 },
  { id: 'shirb',  n: 'شیربرنج',      v: [2, 0, 0, 2, 0], mix: 1 },
  { id: 'adasi',  n: 'عدسی',         v: [0, 1, 2, 0, 0], mix: 1 },
  { id: 'omlet',  n: 'املت',         v: [0, 1, 1, 0, 1], mix: 1 },
  { id: 'kuku',   n: 'کوکو سبزی',    v: [0, 2, 1, 0, 1], mix: 1 },
  { id: 'kotlet', n: 'کتلت',         v: [1, 0, 2, 0, 1], mix: 1 },
  { id: 'makar',  n: 'ماکارونی',     v: [3, 0, 1, 0, 1], mix: 1 },
  { id: 'ghorme', n: 'قرمه‌سبزی',    v: [0, 2, 2, 0, 1], mix: 1 },
  { id: 'ash',    n: 'آش رشته',      v: [2, 2, 2, 1, 0], mix: 1 },
];

const LEVELS = [
  { name: 'صبحانه',      target: [3, 2, 1, 2, 1], market: 8,  maxUse: 6, mix: false, quota: 2 },
  { name: 'ناهار',       target: [4, 3, 2, 2, 1], market: 9,  maxUse: 7, mix: true,  quota: 2 },
  { name: 'شام',         target: [4, 4, 3, 2, 1], market: 10, maxUse: 7, mix: true,  quota: 3 },
  { name: 'یک روزِ کامل', target: [6, 6, 4, 3, 2], market: 12, maxUse: 8, mix: true,  quota: 3 },
  { name: 'سفرهٔ مهمانی', target: null,            market: 12, maxUse: 8, mix: true,  endless: true },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  level: 0, cleared: 0, score: 0, best: 0,
  target: [0, 0, 0, 0, 0],
  market: [],            /* {f, x, y, used} */
  placed: [],            /* {f, t} */
  carry: null,           /* {i, dx, dy, x, y, moved, t0} */
  fly: [],
  wedge: [],             /* زاویه و شعاعِ هر قاچ — از روی هدف ساخته می‌شود */
  slotT: [],             /* زمانِ پیدا شدنِ هر نوار، برای جانِ حرکت */
  spill: 0, winT: 0,
  t: 0, hover: null, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const L = () => LEVELS[Math.min(S.level, LEVELS.length - 1)];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/* ───────── ساختِ مرحله ─────────
   اوّل یک جوابِ درست ساخته می‌شود، بعد چند خوراکیِ اضافه کنارش؛ پس
   بازار همیشه دستِ‌کم یک راهِ حل دارد. جواب هیچ‌جا نشان داده نمی‌شود. */

/** آیا با این خوراکی‌ها می‌شود دقیقاً به هدف رسید؟ زیرمجموعه را برمی‌گرداند. */
function findSolution(pool, target, maxItems) {
  const need = target.slice();
  const chosen = [];
  const seen = new Set();
  function rec(start, left) {
    if (need.every((x) => x === 0)) return true;
    if (left === 0 || start >= pool.length) return false;
    /* کلیدِ یادداشت: چه چیزی مانده و از کجا شروع کرده‌ایم */
    const key = start + '|' + left + '|' + need.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    /* اگر بیشترین چیزی که از اینجا به بعد می‌شود گرفت کمتر از نیاز است، بی‌خود نگرد */
    for (let i = start; i < pool.length; i++) {
      const v = FOODS[pool[i]].v;
      let fits = true;
      for (let g = 0; g < NG; g++) if (v[g] > need[g]) { fits = false; break; }
      if (!fits) continue;
      for (let g = 0; g < NG; g++) need[g] -= v[g];
      chosen.push(pool[i]);
      if (rec(i + 1, left - 1)) return true;
      chosen.pop();
      for (let g = 0; g < NG; g++) need[g] += v[g];
    }
    return false;
  }
  return rec(0, maxItems) ? chosen.slice() : null;
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = R(0, i); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

/** هدفِ مرحلهٔ بی‌پایان — شکلِ بشقابِ سلامت را نگه می‌دارد. */
function randomTarget() {
  const gh = R(4, 6), sb = R(4, 6), gu = R(3, 4), lb = R(2, 3), ch = R(1, 2);
  return [gh, sb, gu, lb, Math.min(ch, lb, gu)];
}

function newRound() {
  const lv = L();
  const eligible = [];
  for (let i = 0; i < FOODS.length; i++) if (lv.mix || FOODS[i].mix === 0) eligible.push(i);

  for (let tries = 0; tries < 400; tries++) {
    const target = lv.endless ? randomTarget() : lv.target.slice();
    const pool = shuffled(eligible);
    const sol = findSolution(pool, target, lv.maxUse);
    if (!sol || sol.length < 3) continue;
    /* بازار: جوابْ به‌علاوهٔ چند خوراکیِ اضافه */
    const rest = shuffled(eligible.filter((i) => sol.indexOf(i) < 0));
    const market = shuffled(sol.concat(rest.slice(0, Math.max(0, lv.market - sol.length))));
    S.target = target;
    S.market = market.map((f) => ({ f, used: false, t: 0 }));
    S.placed = [];
    S.fly = [];
    S.spill = 0; S.winT = 0;
    S.builtBy = 'search';
    buildWedges();
    return;
  }
  /* راهِ پشتیبان: هدف را از روی یک دستهٔ واقعیِ خوراکی می‌سازیم، پس
     بشقاب همیشه حل‌شدنی است — هرگز بازارِ بی‌جواب ساخته نمی‌شود. */
  for (let tries = 0; tries < 600; tries++) {
    const take = shuffled(eligible).slice(0, R(4, lv.maxUse));
    const t = [0, 0, 0, 0, 0];
    for (const f of take) for (let g = 0; g < NG; g++) t[g] += FOODS[f].v[g];
    /* شکلِ بشقابِ سلامت باید حفظ بماند */
    if (t.some((x) => x < 1)) continue;
    if (t[0] < t[2] || t[1] < t[2]) continue;
    if (t[4] > t[3] || t[4] > t[2] || t[4] > 2) continue;
    const rest = shuffled(eligible.filter((i) => take.indexOf(i) < 0));
    S.target = t;
    S.market = shuffled(take.concat(rest.slice(0, Math.max(0, lv.market - take.length))))
      .map((f) => ({ f, used: false, t: 0 }));
    S.placed = []; S.fly = []; S.spill = 0; S.winT = 0;
    S.builtBy = 'draw';
    buildWedges();
    return;
  }
}

/** پهنای هر قاچ به اندازهٔ سهمِ همان گروه — بشقاب خودش نسبت را می‌گوید. */
function buildWedges() {
  const total = S.target.reduce((a, b) => a + b, 0) || 1;
  const MIN = TAU * .075;
  const raw = S.target.map((t) => Math.max(MIN, TAU * t / total));
  const sum = raw.reduce((a, b) => a + b, 0);
  const w = raw.map((r) => r * TAU / sum);
  /* خطِ هدف برای همهٔ قاچ‌ها روی یک دایره است — مثلِ خطِ پیمانهٔ لیوان.
     پس پهنای نوارها در هر قاچ فرق می‌کند، ولی «تا کجا باید پر شود»
     یک حلقهٔ پیوسته است و از دور دیده می‌شود. */
  const rt = PLATE.r0 + (PLATE.r - PLATE.r0) * .76;
  let a = -Math.PI / 2;
  S.wedge = w.map((width, g) => {
    const band = (rt - PLATE.r0) / Math.max(1, S.target[g]);
    const seg = { a0: a, a1: a + width, g, band, rt,
                  slots: S.target[g] + Math.max(1, Math.floor((PLATE.r - rt) / band)) };
    a += width;
    return seg;
  });
  S.slotT = GROUPS.map(() => []);
}

function startLevel(i, keep) {
  S.level = i;
  S.phase = 'play'; S.phaseT = 0;
  S.cleared = 0;
  if (!keep) S.score = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newRound();
}

/* ───────── شمارش ───────── */

function fillOf() {
  const f = [0, 0, 0, 0, 0];
  for (const p of S.placed) { const v = FOODS[p.f].v; for (let g = 0; g < NG; g++) f[g] += v[g]; }
  return f;
}
const isWin = () => { const f = fillOf(); return f.every((x, g) => x === S.target[g]); };
const isOver = () => { const f = fillOf(); return f.some((x, g) => x > S.target[g]); };

/* ───────── گذاشتن و برداشتن ───────── */

function place(mi) {
  const m = S.market[mi];
  if (!m || m.used) return;
  m.used = true;
  const before = fillOf();
  S.placed.push({ f: m.f, t: 0, from: mi });
  /* تکّه‌های پرنده — هر واحد یک تکّه */
  const v = FOODS[m.f].v;
  const c = marketCard(mi);
  for (let g = 0; g < NG; g++) {
    for (let k = 0; k < v[g]; k++) {
      const s = slotPos(g, before[g] + k);
      S.fly.push({ x0: c.x + c.w / 2, y0: c.y + c.h / 2, x1: s.x, y1: s.y,
                   col: GROUPS[g].c, t: 0, dur: .34 + k * .05 + g * .03 });
      S.slotT[g][before[g] + k] = -(.34 + k * .05 + g * .03);
    }
  }
  sfx.place();
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
  const f = fillOf();
  if (f.some((x, g) => x > S.target[g])) { S.spill = 1.2; sfx.nope(); S.shake = .16; }
  else if (isWin()) win();
}

function unplace(pi) {
  const p = S.placed[pi];
  if (!p) return;
  S.placed.splice(pi, 1);
  const m = S.market[p.from];
  if (m) { m.used = false; m.t = 0; }
  sfx.pop();
}

function win() {
  S.winT = .001;
  S.cleared++;
  S.score += 60 + S.level * 20;
  if (S.score > S.best) S.best = S.score;
  sfx.win();
  const cx = PLATE.x, cy = PLATE.y;
  bits.confetti(cx, cy, 34, [GROUPS[0].c, GROUPS[1].c, GROUPS[2].c, GROUPS[3].c, GROUPS[4].c]);
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.spill > 0) S.spill -= dt;
  if (S.tut.on) S.tut.t += dt;
  for (const m of S.market) if (m.t < 9) m.t += dt;
  for (const p of S.placed) if (p.t < 9) p.t += dt;
  for (let g = 0; g < NG; g++) {
    const row = S.slotT[g] || [];
    for (let i = 0; i < row.length; i++) if (row[i] < 1) row[i] += dt;
  }
  for (let i = S.fly.length - 1; i >= 0; i--) {
    S.fly[i].t += dt;
    if (S.fly[i].t >= S.fly[i].dur) S.fly.splice(i, 1);
  }
  if (S.winT > 0) {
    S.winT += dt;
    if (S.winT > 1.5) {
      S.winT = 0;
      if (!L().endless && S.cleared >= L().quota) {
        if (S.level >= LEVELS.length - 1) { S.phase = 'won'; S.phaseT = 0; }
        else { S.level++; S.phaseT = 0; newRound(); toast.say(L().name, 'good'); }
      } else newRound();
    }
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { newRound(); runLoop(step); });

/* ───────── جای‌ها ───────── */

const PLATE = { x: 362, y: 420, r: 218, r0: 66 };
const MARKET = { x: 704, y: 84, w: 472, h: 500 };
const TRAY = { x: 24, y: 664, w: 660, h: 84 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 470, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };

function marketCard(i) {
  const col = i % 3, row = Math.floor(i / 3);
  return { x: MARKET.x + 8 + col * 152, y: MARKET.y + 52 + row * 112, w: 140, h: 100 };
}
function trayChip(i) {
  return { x: TRAY.x + 12 + i * 82, y: TRAY.y + 12, w: 74, h: 60 };
}
/** میانهٔ نوارِ شمارهٔ k از قاچِ g */
function slotPos(g, k) {
  const w = S.wedge[g];
  if (!w) return { x: PLATE.x, y: PLATE.y };
  const r = PLATE.r0 + (k + .5) * w.band;
  const a = (w.a0 + w.a1) / 2;
  return { x: PLATE.x + Math.cos(a) * r, y: PLATE.y + Math.sin(a) * r };
}
/** قاچی که این نقطه رویش است */
function wedgeAt(p) {
  const dx = p.x - PLATE.x, dy = p.y - PLATE.y;
  const d = Math.hypot(dx, dy);
  if (d > PLATE.r + 14) return -1;
  let a = Math.atan2(dy, dx);
  for (const w of S.wedge) {
    let a0 = w.a0, a1 = w.a1;
    let aa = a;
    while (aa < a0) aa += TAU;
    if (aa <= a1) return w.g;
  }
  return -1;
}
const onPlate = (p) => Math.hypot(p.x - PLATE.x, p.y - PLATE.y) <= PLATE.r + 18;

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.carry) {
    S.carry.x = p.x; S.carry.y = p.y;
    if (Math.hypot(p.x - S.carry.px, p.y - S.carry.py) > 8) S.carry.moved = true;
    return;
  }
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won' || S.phase === 'lost') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    for (let i = 0; i < S.market.length; i++) {
      if (!S.market[i].used && inRect(p, marketCard(i))) S.hover = { k: 'card', i };
    }
    for (let i = 0; i < S.placed.length; i++) if (inRect(p, trayChip(i))) S.hover = { k: 'chip', i };
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startLevel(0); sfx.good(); } return; }
  if (S.phase === 'won' || S.phase === 'lost') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.level = 0; S.score = 0; newRound(); sfx.tap(); }
    return;
  }
  if (S.winT > 0) return;
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;

  /* برداشتنِ خوراکی از سینی */
  for (let i = 0; i < S.placed.length; i++) {
    if (inRect(p, trayChip(i))) { unplace(i); return; }
  }
  /* برداشتنِ کارت از بازار */
  for (let i = 0; i < S.market.length; i++) {
    if (S.market[i].used) continue;
    const c = marketCard(i);
    if (!inRect(p, c)) continue;
    S.carry = { i, x: p.x, y: p.y, px: p.x, py: p.y,
                dx: p.x - (c.x + c.w / 2), dy: p.y - (c.y + c.h / 2), moved: false };
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    sfx.tap();
    return;
  }
});

function dropCarry(p) {
  if (!S.carry) return;
  const c = S.carry;
  S.carry = null;
  /* یا روی بشقاب رها شده، یا فقط یک ضربهٔ کوتاه بوده */
  if ((p && onPlate(p)) || !c.moved) place(c.i);
  else sfx.tap();
}

cv.addEventListener('pointerup', (e) => { dropCarry(toStage(e)); });
cv.addEventListener('pointercancel', () => { S.carry = null; });
cv.addEventListener('pointerleave', () => { S.carry = null; });
addEventListener('blur', () => { S.carry = null; });

/* ───────── ابزارِ نقاشی ───────── */

function rrPath(x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** عددها همیشه چپ‌به‌راست، حتی وسطِ متنِ فارسی. */
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

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(24, 18, 10, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 252, 240, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '24, 18, 10');
  ctx.fillStyle = GROUPS[1].c;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#7b7264' }); yy += 30; }
  return h + 20;
}

/* ───────── شکلِ خوراکی‌ها ─────────
   هر خوراکی با رنگِ گروه‌هایش کشیده می‌شود تا بچّه کم‌کم پیوند را ببیند. */

function foodIcon(id, s) {
  ctx.save();
  ctx.scale(s, s);
  const G = (i) => GROUPS[i].c, D = (i) => GROUPS[i].d, Lc = (i) => GROUPS[i].l;
  const ell = (x, y, rx, ry, rot, col) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill();
  };
  const line = (x0, y0, x1, y1, col, w) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  };
  switch (id) {
    case 'nan':
      ell(0, 0, 22, 13, -.2, G(0)); ell(-4, -3, 16, 8, -.2, Lc(0));
      ctx.fillStyle = D(0);
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 7, i * 1.6, 1.5, 0, TAU); ctx.fill(); }
      break;
    case 'berenj':
      ctx.fillStyle = '#efe7d2';
      ctx.beginPath(); ctx.moveTo(-20, 6); ctx.quadraticCurveTo(0, -20, 20, 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = G(0);
      ctx.beginPath(); ctx.ellipse(0, 8, 22, 6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 7; i++) ell(-12 + i * 4, -2 - (i % 3) * 3, 2.2, 1.2, .5, '#fff');
      break;
    case 'sibz':
      ell(0, 0, 20, 14, .2, G(0)); ell(-5, -4, 8, 5, .2, Lc(0));
      ctx.fillStyle = D(0);
      for (const [x, y] of [[-8, 4], [6, -5], [10, 6]]) { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill(); }
      break;
    case 'sib':
      ell(0, 2, 15, 16, 0, '#cf4436'); ell(-5, -3, 6, 6, 0, '#e8837a');
      line(0, -12, 1, -20, '#6b4a2c', 3); ell(7, -18, 6, 3.4, -.5, G(1));
      break;
    case 'khiar':
      ell(0, 0, 8, 20, .35, G(1)); ell(-2, -3, 4, 12, .35, Lc(1));
      ctx.fillStyle = D(1);
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 3, i * 6, 1.2, 0, TAU); ctx.fill(); }
      break;
    case 'goje':
      ell(0, 2, 16, 15, 0, '#cf4436'); ell(-5, -3, 6, 5, 0, '#ea8175');
      ctx.strokeStyle = G(1); ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5;
        ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(Math.cos(a) * 8, -12 + Math.sin(a) * 5); ctx.stroke(); }
      break;
    case 'havij':
      ctx.fillStyle = '#e08a2e';
      ctx.beginPath(); ctx.moveTo(-7, -12); ctx.lineTo(7, -12); ctx.lineTo(1, 20); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(150,80,10,.5)'; ctx.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-5 + i, -6 + i * 7); ctx.lineTo(5 - i * 1.5, -8 + i * 7); ctx.stroke(); }
      for (const dx of [-6, 0, 6]) line(dx * .5, -12, dx, -22, G(1), 3.4);
      break;
    case 'angur':
      for (const [x, y] of [[0, -6], [-8, 0], [8, 0], [-4, 8], [4, 8], [0, 16]]) ell(x, y, 6.4, 6.4, 0, '#7a4a9c');
      for (const [x, y] of [[-2, -8], [-10, -2], [6, -2]]) ell(x, y, 2.2, 2.2, 0, '#b58ccf');
      line(0, -12, 2, -20, '#6b4a2c', 2.6);
      break;
    case 'shir':
      ctx.fillStyle = '#f2f6fa';
      ctx.beginPath(); ctx.moveTo(-13, -14); ctx.lineTo(13, -14); ctx.lineTo(11, 18); ctx.lineTo(-11, 18); ctx.closePath(); ctx.fill();
      ctx.fillStyle = G(3);
      ctx.beginPath(); ctx.moveTo(-12, 2); ctx.lineTo(12, 2); ctx.lineTo(11, 18); ctx.lineTo(-11, 18); ctx.closePath(); ctx.fill();
      ctx.fillStyle = D(3); ctx.fillRect(-13, -18, 26, 5);
      break;
    case 'mast':
      ctx.fillStyle = G(3);
      ctx.beginPath(); ctx.moveTo(-16, -10); ctx.lineTo(16, -10); ctx.lineTo(12, 16); ctx.lineTo(-12, 16); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fbfdff'; ell(0, -10, 16, 5, 0, '#fbfdff');
      ctx.fillStyle = D(3); ell(0, -13, 17, 4.4, 0, D(3));
      break;
    case 'panir':
      ctx.fillStyle = '#f7f2df';
      ctx.beginPath(); ctx.moveTo(-18, 10); ctx.lineTo(-6, -12); ctx.lineTo(18, -12); ctx.lineTo(18, 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e2d8b8';
      ctx.beginPath(); ctx.moveTo(-18, 10); ctx.lineTo(-6, -12); ctx.lineTo(-6, 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ddd2ae';
      for (const [x, y] of [[2, -2], [10, 4], [6, -8]]) { ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill(); }
      break;
    case 'tokhm':
      ell(0, 0, 18, 13, 0, '#fbfaf2'); ell(2, 0, 7, 6.4, 0, '#e8b52c');
      break;
    case 'morgh':
      ctx.fillStyle = '#c98a5e';
      ctx.beginPath(); ctx.ellipse(2, 2, 16, 12, -.15, 0, TAU); ctx.fill();
      ctx.fillStyle = '#a86a3e';
      ctx.beginPath(); ctx.ellipse(2, 5, 14, 7, -.15, 0, TAU); ctx.fill();
      line(-12, -6, -20, -16, '#efe4d0', 6); ell(-21, -17, 4, 4, 0, '#efe4d0');
      break;
    case 'adas':
      for (const [x, y] of [[-9, -6], [0, -9], [9, -5], [-6, 3], [4, 2], [-1, 10], [10, 6], [-11, 8]])
        ell(x, y, 5.2, 4, .3, G(2));
      for (const [x, y] of [[-9, -7], [0, -10], [4, 1]]) ell(x, y, 2, 1.4, .3, Lc(2));
      break;
    case 'lubia':
      for (const [x, y, r] of [[-8, -5, .4], [6, -7, -.3], [-2, 4, .2], [9, 5, .5]]) {
        ctx.fillStyle = '#a5563f';
        ctx.save(); ctx.translate(x, y); ctx.rotate(r);
        ctx.beginPath(); ctx.ellipse(0, 0, 9, 5.4, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#c8785e';
        ctx.beginPath(); ctx.ellipse(-2, -1.4, 4, 2, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
      break;
    case 'mahi':
      ctx.fillStyle = '#7fa8bd';
      ctx.beginPath(); ctx.ellipse(0, 0, 19, 11, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5b8296';
      ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(26, -9); ctx.lineTo(26, 9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a9cbdb';
      ctx.beginPath(); ctx.ellipse(-3, 2, 13, 6, 0, 0, TAU); ctx.fill();
      ell(-12, -2, 2.6, 2.6, 0, '#22303a');
      break;
    case 'roghan':
      ctx.fillStyle = 'rgba(240,236,214,.9)';
      ctx.beginPath(); rrPath(-11, -10, 22, 28, 6); ctx.fill();
      ctx.fillStyle = G(4);
      ctx.beginPath(); rrPath(-9, 0, 18, 16, 5); ctx.fill();
      ctx.fillStyle = D(4); ctx.fillRect(-4, -20, 8, 11);
      break;
    case 'kare':
      ctx.fillStyle = Lc(4);
      ctx.beginPath(); ctx.moveTo(-18, 6); ctx.lineTo(-10, -8); ctx.lineTo(18, -8); ctx.lineTo(10, 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = G(4); ctx.fillRect(-18, 6, 28, 8);
      ctx.fillStyle = D(4);
      ctx.beginPath(); ctx.moveTo(10, 6); ctx.lineTo(18, -8); ctx.lineTo(18, 0); ctx.lineTo(10, 14); ctx.closePath(); ctx.fill();
      break;
    case 'gerdu':
      ell(0, 0, 16, 15, 0, '#b98a56'); ell(0, 0, 12, 12, 0, '#d9b183');
      ctx.strokeStyle = '#9c6d3c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.stroke();
      for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(0, -8); ctx.quadraticCurveTo(s * 9, -3, 0, 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 2); ctx.quadraticCurveTo(s * 8, 6, 0, 11); ctx.stroke();
      }
      break;
    case 'salad':
      ell(0, 6, 20, 10, 0, '#eef2e2');
      for (const [x, y, c] of [[-9, 0, '#cf4436'], [0, -4, G(1)], [9, 1, Lc(1)], [-4, 4, '#cf4436'], [5, 5, G(1)]])
        ell(x, y, 5, 4.4, .3, c);
      break;
    case 'shirb':
      ell(0, 6, 20, 11, 0, '#f6f7f2');
      ctx.fillStyle = G(3); ell(0, 3, 18, 8, 0, G(3));
      ctx.fillStyle = '#fdfdfa';
      for (let i = 0; i < 8; i++) ell(-12 + i * 3.4, 1 + (i % 3) * 2, 2.4, 1.6, .4, '#fdfdfa');
      ctx.fillStyle = G(0);
      for (let i = 0; i < 4; i++) ell(-7 + i * 5, -3, 2, 1.6, .3, G(0));
      break;
    case 'adasi':
      ell(0, 5, 20, 11, 0, '#8b4a2e');
      for (const [x, y] of [[-9, 2], [-1, 0], [7, 3], [-5, 7], [4, 8]]) ell(x, y, 4.4, 3.4, .3, G(2));
      for (const [x, y] of [[-6, -2], [3, -3]]) ell(x, y, 3.4, 2.6, .4, G(1));
      break;
    case 'omlet':
      ell(0, 4, 20, 12, 0, '#f0c14a');
      for (const [x, y] of [[-8, 2], [6, 5]]) ell(x, y, 6, 5, 0, '#cf4436');
      for (const [x, y] of [[-2, 8], [9, 0]]) ell(x, y, 4, 3, .4, G(1));
      break;
    case 'kuku':
      ell(0, 0, 18, 13, 0, '#3f6b33');
      ell(-4, -3, 10, 6, 0, '#54873f');
      ctx.fillStyle = '#e8b52c';
      for (const [x, y] of [[7, 4], [-9, 5], [2, 7]]) { ctx.beginPath(); ctx.arc(x, y, 2, 0, TAU); ctx.fill(); }
      break;
    case 'kotlet':
      ell(0, 0, 19, 12, 0, '#a86a3e'); ell(-4, -3, 11, 6, 0, '#c58a58');
      ctx.strokeStyle = '#7d4a25'; ctx.lineWidth = 1.6;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 8, -9); ctx.lineTo(i * 8 + 3, 9); ctx.stroke(); }
      break;
    case 'makar':
      ell(0, 6, 20, 11, 0, '#f3ead2');
      ctx.strokeStyle = G(0); ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(-13 + i * 7, 8);
        ctx.quadraticCurveTo(-11 + i * 7, -6 + (i % 2) * 4, -6 + i * 7, 4); ctx.stroke();
      }
      ctx.fillStyle = '#c0432c'; ell(0, 8, 14, 4, 0, '#c0432c');
      break;
    case 'ghorme':
      ell(0, 5, 20, 11, 0, '#2f4f26');
      for (const [x, y] of [[-8, 2], [4, 1], [10, 6]]) ell(x, y, 5, 4, .3, '#7a4a2e');
      for (const [x, y] of [[-2, 7], [-11, 7]]) ell(x, y, 4, 3, .5, '#4d7a3a');
      break;
    case 'ash':
      ell(0, 5, 21, 12, 0, '#4f6b3a');
      ctx.strokeStyle = '#efe7d2'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(-12 + i * 8, 8);
        ctx.quadraticCurveTo(-9 + i * 8, 0, -5 + i * 8, 6); ctx.stroke();
      }
      for (const [x, y] of [[-8, 1], [6, 2]]) ell(x, y, 4, 3.2, .3, G(2));
      ctx.fillStyle = '#f3f5ee';
      ctx.beginPath(); ctx.ellipse(2, 9, 9, 3, .2, 0, TAU); ctx.fill();
      break;
    default:
      ell(0, 0, 14, 14, 0, '#bbb');
  }
  ctx.restore();
}

/* ───────── نقاشیِ صحنه ───────── */

function paintClothStatic() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, SCENE_H);
  g.addColorStop(0, P.clothHi); g.addColorStop(1, P.clothLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.fillStyle = texCloth(P.cloth, 'rgba(150,130,96,.5)');
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  /* نوارِ سفرهٔ ایرانی */
  ctx.save();
  ctx.globalAlpha = .16;
  for (let x = -40; x < SCENE_W + 40; x += 96) {
    ctx.fillStyle = '#9c3b2c';
    ctx.beginPath(); ctx.moveTo(x, HUD_H); ctx.lineTo(x + 30, HUD_H); ctx.lineTo(x + 12, SCENE_H); ctx.lineTo(x - 18, SCENE_H); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  /* میزِ چوبیِ بازار */
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.beginPath(); rrPath(MARKET.x - 14, MARKET.y - 26, MARKET.w + 28, MARKET.h + 52, 18); ctx.fill();
  ctx.strokeStyle = 'rgba(60,40,18,.4)'; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(MARKET.x - 14, MARKET.y - 26, MARKET.w + 28, MARKET.h + 52, 18); ctx.stroke();
}

function drawPlate() {
  const fill = fillOf();
  /* سایه و لبهٔ بشقاب */
  contact(PLATE.x, PLATE.y + PLATE.r * .82, PLATE.r * .95, PLATE.r * .2, .22);
  withShadow(26, 10, .3, () => {
    ctx.fillStyle = P.chinaRim;
    ctx.beginPath(); ctx.arc(PLATE.x, PLATE.y, PLATE.r + 22, 0, TAU); ctx.fill();
  }, '60, 50, 30');
  ctx.fillStyle = P.china;
  ctx.beginPath(); ctx.arc(PLATE.x, PLATE.y, PLATE.r + 14, 0, TAU); ctx.fill();
  ctx.fillStyle = P.chinaLo;
  ctx.beginPath(); ctx.arc(PLATE.x, PLATE.y, PLATE.r + 4, 0, TAU); ctx.fill();
  ctx.fillStyle = P.china;
  ctx.beginPath(); ctx.arc(PLATE.x, PLATE.y, PLATE.r, 0, TAU); ctx.fill();

  for (const w of S.wedge) {
    const g = w.g, G0 = GROUPS[g];
    const band = w.band;
    const tgt = S.target[g], got = fill[g];
    /* پشتِ نوارها: تا خطِ هدف رنگِ کم‌رنگِ گروه، بعد از آن خاکستریِ «نه» */
    for (let k = 0; k < w.slots; k++) {
      const r0 = PLATE.r0 + k * band, r1 = r0 + band - 2.4;
      ctx.beginPath();
      ctx.arc(PLATE.x, PLATE.y, r1, w.a0 + .012, w.a1 - .012);
      ctx.arc(PLATE.x, PLATE.y, r0, w.a1 - .012, w.a0 + .012, true);
      ctx.closePath();
      if (k < got) {
        const over = k >= tgt;
        const born = clamp((S.slotT[g][k] === undefined ? 1 : S.slotT[g][k]), 0, 1);
        if (born <= 0) continue;
        ctx.save();
        ctx.globalAlpha = clamp(born * 2, 0, 1);
        ctx.fillStyle = over ? P.spill : (k % 2 ? G0.c : G0.l);
        ctx.fill();
        ctx.strokeStyle = over ? '#7d2b1a' : G0.d; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.restore();
      } else if (k < tgt) {
        ctx.fillStyle = G0.c;
        ctx.save(); ctx.globalAlpha = .1; ctx.fill(); ctx.restore();
        ctx.strokeStyle = 'rgba(70, 64, 44, .16)'; ctx.lineWidth = 1; ctx.stroke();
      } else {
        /* بیرونِ خطِ هدف: راه‌راهِ کم‌رنگ، یعنی اینجا جای خوراکی نیست */
        ctx.save();
        ctx.clip();
        ctx.fillStyle = 'rgba(60, 56, 40, .03)';
        ctx.fillRect(PLATE.x - PLATE.r, PLATE.y - PLATE.r, PLATE.r * 2, PLATE.r * 2);
        ctx.strokeStyle = 'rgba(70, 64, 44, .09)'; ctx.lineWidth = 2;
        for (let d = -PLATE.r; d < PLATE.r; d += 9) {
          ctx.beginPath();
          ctx.moveTo(PLATE.x + d, PLATE.y - PLATE.r);
          ctx.lineTo(PLATE.x + d + PLATE.r * 2, PLATE.y + PLATE.r);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    /* خطِ هدف — باید از دور دیده شود */
    const rt = w.rt;
    const doneW = got === tgt;
    ctx.strokeStyle = 'rgba(40, 34, 20, .8)'; ctx.lineWidth = doneW ? 9 : 8;
    ctx.beginPath(); ctx.arc(PLATE.x, PLATE.y, rt, w.a0 + .02, w.a1 - .02); ctx.stroke();
    ctx.strokeStyle = doneW ? G0.l : '#fffdf6'; ctx.lineWidth = doneW ? 6 : 5;
    ctx.beginPath(); ctx.arc(PLATE.x, PLATE.y, rt, w.a0 + .02, w.a1 - .02); ctx.stroke();
    /* دو میخِ کوچک سرِ خط، تا جای «هدف» گم نشود */
    for (const a of [w.a0 + .02, w.a1 - .02]) {
      ctx.fillStyle = doneW ? G0.d : '#3a3320';
      ctx.beginPath();
      ctx.arc(PLATE.x + Math.cos(a) * rt, PLATE.y + Math.sin(a) * rt, 5, 0, TAU);
      ctx.fill();
    }
    /* مرزِ قاچ */
    ctx.strokeStyle = 'rgba(120, 112, 90, .3)'; ctx.lineWidth = 2;
    for (const a of [w.a0, w.a1]) {
      ctx.beginPath();
      ctx.moveTo(PLATE.x + Math.cos(a) * PLATE.r0, PLATE.y + Math.sin(a) * PLATE.r0);
      ctx.lineTo(PLATE.x + Math.cos(a) * PLATE.r, PLATE.y + Math.sin(a) * PLATE.r);
      ctx.stroke();
    }
    /* نامِ گروه بیرونِ بشقاب */
    const am = (w.a0 + w.a1) / 2;
    const lx = PLATE.x + Math.cos(am) * (PLATE.r + 46), ly = PLATE.y + Math.sin(am) * (PLATE.r + 46);
    ctx.save();
    ctx.globalAlpha = .95;
    const lab = G0.n;
    ctx.font = '700 14px "Vazirmatn", Tahoma, sans-serif';
    const lw = ctx.measureText(lab).width + 20;
    ctx.fillStyle = got === tgt ? G0.c : 'rgba(255,255,255,.86)';
    ctx.beginPath(); rrPath(lx - lw / 2, ly - 13, lw, 26, 13); ctx.fill();
    ctx.strokeStyle = G0.d; ctx.lineWidth = got === tgt ? 2.4 : 1.4;
    ctx.beginPath(); rrPath(lx - lw / 2, ly - 13, lw, 26, 13); ctx.stroke();
    text(lab, lx, ly, { size: 14, color: got === tgt ? '#fff' : G0.d });
    ctx.restore();
  }
  /* میانهٔ بشقاب */
  ctx.fillStyle = P.chinaLo;
  ctx.beginPath(); ctx.arc(PLATE.x, PLATE.y, PLATE.r0 - 4, 0, TAU); ctx.fill();
  ctx.fillStyle = P.china;
  ctx.beginPath(); ctx.arc(PLATE.x, PLATE.y, PLATE.r0 - 9, 0, TAU); ctx.fill();
  /* پنج نگینِ میانه: هر گروهی که درست پر شده باشد روشن می‌شود */
  for (let i = 0; i < NG; i++) {
    const a = -Math.PI / 2 + i * TAU / NG;
    const on = fill[i] === S.target[i];
    const cx = PLATE.x + Math.cos(a) * 32, cy = PLATE.y + Math.sin(a) * 32;
    ctx.fillStyle = on ? GROUPS[i].c : 'rgba(255,255,255,.5)';
    ctx.beginPath(); ctx.arc(cx, cy, on ? 10 : 7, 0, TAU); ctx.fill();
    ctx.strokeStyle = on ? GROUPS[i].d : 'rgba(90, 84, 66, .3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, on ? 10 : 7, 0, TAU); ctx.stroke();
    if (on) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy); ctx.lineTo(cx - 1, cy + 3.4); ctx.lineTo(cx + 4.4, cy - 3.4);
      ctx.stroke();
    }
  }
  if (S.spill > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.spill, 0, 1) * .9;
    ctx.strokeStyle = P.spill; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(PLATE.x, PLATE.y, PLATE.r + 20, 0, TAU); ctx.stroke();
    ctx.restore();
  }
}

function drawMarket() {
  text('بازار', MARKET.x + MARKET.w - 10, MARKET.y + 18,
    { size: 22, family: 'Lalezar', color: '#f6ecd8', align: 'right' });
  for (let i = 0; i < S.market.length; i++) {
    const m = S.market[i], c = marketCard(i);
    if (m.used) {
      ctx.fillStyle = 'rgba(40, 28, 12, .22)';
      ctx.beginPath(); rrPath(c.x, c.y, c.w, c.h, 12); ctx.fill();
      continue;
    }
    if (S.carry && S.carry.i === i) {
      ctx.fillStyle = 'rgba(40, 28, 12, .18)';
      ctx.beginPath(); rrPath(c.x, c.y, c.w, c.h, 12); ctx.fill();
      continue;
    }
    const hot = S.hover && S.hover.k === 'card' && S.hover.i === i;
    const k = clamp(m.t / .3, 0, 1);
    ctx.save();
    ctx.globalAlpha = k;
    const dy = hot ? -3 : 0;
    withShadow(hot ? 16 : 9, hot ? 6 : 4, .3, () => {
      ctx.fillStyle = P.card;
      ctx.beginPath(); rrPath(c.x, c.y + dy, c.w, c.h, 12); ctx.fill();
    }, '60, 40, 18');
    /* نوارِ رنگیِ گروه‌ها بالای کارت — بی‌آنکه چیزی بنویسد */
    const v = FOODS[m.f].v, tot = v.reduce((a, b) => a + b, 0) || 1;
    let bx = c.x + 8;
    for (let g = 0; g < NG; g++) {
      if (!v[g]) continue;
      const bw = (c.w - 16) * v[g] / tot;
      ctx.fillStyle = GROUPS[g].c;
      ctx.beginPath(); rrPath(bx, c.y + dy + 6, bw - 2, 5, 2.5); ctx.fill();
      bx += bw;
    }
    ctx.save();
    ctx.translate(c.x + c.w / 2, c.y + dy + 50);
    foodIcon(FOODS[m.f].id, 1.05);
    ctx.restore();
    text(FOODS[m.f].n, c.x + c.w / 2, c.y + dy + 84, { size: 14, color: P.ink });
    ctx.restore();
  }
}

function drawTray() {
  ctx.fillStyle = 'rgba(60, 50, 30, .1)';
  ctx.beginPath(); rrPath(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 14); ctx.fill();
  if (!S.placed.length) {
    text('خوراکی‌ها را از بازار بردار', TRAY.x + TRAY.w / 2, TRAY.y + TRAY.h / 2,
      { size: 15, color: 'rgba(60, 52, 34, .38)' });
    return;
  }
  for (let i = 0; i < S.placed.length; i++) {
    const p = S.placed[i], c = trayChip(i);
    if (c.x + c.w > TRAY.x + TRAY.w) break;
    const hot = S.hover && S.hover.k === 'chip' && S.hover.i === i;
    const k = clamp(p.t / .25, 0, 1);
    ctx.save();
    ctx.globalAlpha = k;
    ctx.fillStyle = hot ? '#ffe9e2' : P.card;
    ctx.beginPath(); rrPath(c.x, c.y, c.w, c.h, 10); ctx.fill();
    ctx.strokeStyle = hot ? P.bad : 'rgba(60,52,34,.2)'; ctx.lineWidth = hot ? 2.4 : 1.4;
    ctx.beginPath(); rrPath(c.x, c.y, c.w, c.h, 10); ctx.stroke();
    ctx.save();
    ctx.translate(c.x + c.w / 2, c.y + 26);
    foodIcon(FOODS[p.f].id, .62);
    ctx.restore();
    text(FOODS[p.f].n, c.x + c.w / 2, c.y + 50, { size: 11, color: P.inkSoft });
    if (hot) {
      ctx.strokeStyle = P.bad; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(c.x + c.w - 15, c.y + 7); ctx.lineTo(c.x + c.w - 7, c.y + 15);
      ctx.moveTo(c.x + c.w - 7, c.y + 7); ctx.lineTo(c.x + c.w - 15, c.y + 15);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawFly() {
  for (const f of S.fly) {
    const k = easeOut(clamp(f.t / f.dur, 0, 1));
    const x = lerp(f.x0, f.x1, k), y = lerp(f.y0, f.y1, k) - Math.sin(k * Math.PI) * 46;
    ctx.fillStyle = f.col;
    ctx.beginPath(); ctx.arc(x, y, 9 - k * 3, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(x, y, 9 - k * 3, 0, TAU); ctx.stroke();
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(52, 36, 18, .94)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(207, 167, 78, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.paper, align: 'right' });
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), 640, HUD_H / 2, { size: 21, color: P.gold });
  } else {
    text('بی‌پایان', 640, HUD_H / 2, { size: 21, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 300, HUD_H / 2, { size: 20, color: P.paper });
  text('بیشترین ' + fa(S.best), 150, HUD_H / 2, { size: 15, color: 'rgba(246,236,216,.6)' });
  const kk = clamp((S.level + S.cleared / Math.max(1, L().quota)) / LEVELS.length, 0, 1);
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * kk, 5, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: PLATE.x - PLATE.r - 30, y: PLATE.y - PLATE.r - 30, w: (PLATE.r + 30) * 2, h: (PLATE.r + 30) * 2 }], .72);
    const h = tutCard(MARKET.x - 6, 150, MARKET.w + 12,
      ['هر قاچ برای یک گروهِ خوراکی است.', 'قاچِ پهن‌تر یعنی از آن گروه بیشتر بخور.',
       'هر قاچ را تا خطِ سفید پر کن — نه کمتر، نه بیشتر.'], 'بشقابِ من');
    tutMore(MARKET.x + MARKET.w / 2, 150 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    /* بازار باید روشن بماند؛ کارتِ راهنما روی بشقاب می‌رود */
    spot([{ x: MARKET.x, y: MARKET.y, w: MARKET.w, h: MARKET.h }], .6);
    tutCard(96, 300, 500, ['روی یک خوراکی در بازار بزن', 'تا در بشقاب بنشیند.']);
  } else {
    spot([{ x: TRAY.x, y: TRAY.y, w: TRAY.w, h: TRAY.h },
          { x: PLATE.x - PLATE.r - 20, y: PLATE.y - PLATE.r - 20, w: (PLATE.r + 20) * 2, h: (PLATE.r + 20) * 2 }], .7);
    const h = tutCard(MARKET.x - 6, 130, MARKET.w + 12,
      ['دیدی؟ یک خوراکی می‌تواند تکّه‌های چند گروه داشته باشد.',
       'اگر پشیمان شدی، در سینیِ پایین رویش بزن تا برگردد.'], 'تکّه‌ها');
    tutMore(MARKET.x + MARKET.w / 2, 130 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function plateIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.chinaRim;
  ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.fill();
  ctx.fillStyle = P.china;
  ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.fill();
  const share = [3, 3, 2, 2, 1], tot = 11;
  let a = -Math.PI / 2;
  for (let g = 0; g < NG; g++) {
    const w = TAU * share[g] / tot;
    ctx.fillStyle = GROUPS[g].c;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 22, a, a + w); ctx.closePath(); ctx.fill();
    a += w;
  }
  ctx.fillStyle = P.china;
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 840, h: 300, y: 128,
    paper: P.paper, band: GROUPS[1].c, ink: P.ink, inkSoft: '#7b7264',
    icon: plateIcon,
    title: 'بشقابِ من',
    body: 'بشقابِ سلامت می‌گوید از هر گروهِ خوراکی چه‌قدر بخوریم.\nخوراکی‌ها را از بازار بردار؛ هر خوراکی تکّه‌تکّه می‌شود و\nهر تکّه در گروهِ خودش می‌نشیند. هر قاچ را تا خطِ سفید پر کن.',
    btn: BTN_GO, btnLabel: 'برو به بازار', btnHot: S.hover === BTN_GO,
    btnFill: '#4e7f4a', btnHotFill: '#63a05b',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 760, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#7b7264',
    icon: plateIcon,
    title: 'سفره‌ات کامل شد',
    body: 'صبحانه و ناهار و شام و یک روزِ کامل را با اندازهٔ درست چیدی.\nامتیازت: ' + fa(S.score),
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#4e7f4a', btnHotFill: '#63a05b',
  });
}

function draw() {
  beginScene(P.cloth);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  const layer = staticLayer('cloth', SCENE_W, SCENE_H, paintClothStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawPlate();
  drawMarket();
  drawTray();
  drawFly();
  bits.draw();
  ctx.restore();

  /* کارتی که در دست است */
  if (S.carry) {
    const m = S.market[S.carry.i];
    if (m) {
      const c = marketCard(S.carry.i);
      const x = S.carry.x - S.carry.dx, y = S.carry.y - S.carry.dy;
      ctx.save();
      ctx.globalAlpha = .96;
      withShadow(22, 10, .38, () => {
        ctx.fillStyle = P.card;
        ctx.beginPath(); rrPath(x - c.w / 2, y - c.h / 2, c.w, c.h, 12); ctx.fill();
      }, '60, 40, 18');
      ctx.save();
      ctx.translate(x, y - 4);
      foodIcon(FOODS[m.f].id, 1.05);
      ctx.restore();
      text(FOODS[m.f].n, x, y + c.h / 2 - 16, { size: 14, color: P.ink });
      ctx.restore();
    }
  }

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  endScene(.1, 'rgba(50, 34, 14, .4)', .3, .1);
}

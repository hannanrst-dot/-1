/*!
title: دکّهٔ من — ارزش پول
bg: #201811
*/

/* ═══════════════════════════════════════════════════════════════════════
   دکّهٔ من — ریاضی سوم، فصل ۲، درس ۴ (ارزش پول)
   ───────────────────────────────────────────────────────────────────────
   این یکی عمداً یک «بازی» است، نه تمرینِ تعاملی. یعنی چیزهایی دارد که
   تمرین ندارد:

   • مقاومت: هر مشتری نوارِ صبر دارد. صبرش که تمام شود، می‌رود.
   • کمبود: صندوقِ تو پولِ خردِ بی‌نهایت ندارد. اگر ۵۰۰ تمام کنی، باید
     با چیزِ دیگری باقی را جور کنی. همین یک قید، بازی را واقعی می‌کند.
   • انتخاب با پیامد: سه مشتری هم‌زمان منتظرند و تو انتخاب می‌کنی کدام
     را اوّل راه بیندازی. اشتباهِ انتخاب یعنی از دست دادنِ یکی از آن‌ها.
   • باخت: سه بار که مشتری برود، دکّه آن روز تعطیل می‌شود.
   • آزادیِ واقعی: صبح با بودجه‌ات هرچه خواستی می‌خری، و شب سودت را
     صرفِ ارتقایی می‌کنی که خودت انتخاب می‌کنی. دو بچه دو دکّهٔ متفاوت
     خواهند داشت.

   و ریاضیِ زیرِ همهٔ این‌ها همان درس است: قیمت چهار رقمی، پولِ داده‌شده،
   و باقی‌مانده — که بچه باید با سکه و اسکناسِ موجود بسازد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

/* ───────── پالتِ بازارِ سرپوشیده ───────── */
const P = {
  domeTop:  '#3a2b3f',
  domeLow:  '#5a4340',
  beamLit:  '#c99a5e',
  beam:     '#9a7040',
  beamDk:   '#6b4a28',
  wall:     '#7d5f43',
  wallDk:   '#5c452f',
  floor:    '#6b5238',
  floorDk:  '#4a3826',
  awning:   '#b8503f',
  awning2:  '#e8d9b6',
  wood:     '#a8763f',
  woodLit:  '#c99a5e',
  woodDk:   '#71482a',
  cloth:    '#3f6f7a',
  brass:    '#d9a94e',
  brassDk:  '#9a7028',
  coin500:  '#c8a44e',
  coin1000: '#cfcfd4',
  coin2000: '#d99a4e',
  note5000: '#7fa86a',
  note10000:'#a87fb8',
  paper:    '#f7edd6',
  ink:      '#2f2418',
  inkSoft:  '#7d6b4e',
  good:     '#6f9a52',
  bad:      '#c2503f',
  gold:     '#e8b448',
  skin:     '#d8a878',
};

/* ───────── پول ─────────
   پنج واحد، همان‌هایی که بچه در بازارِ واقعی می‌بیند.               */
const MONEY = [
  { v: 500,   kind: 'coin', col: P.coin500,   label: '۵۰۰' },
  { v: 1000,  kind: 'coin', col: P.coin1000,  label: '۱۰۰۰' },
  { v: 2000,  kind: 'coin', col: P.coin2000,  label: '۲۰۰۰' },
  { v: 5000,  kind: 'note', col: P.note5000,  label: '۵۰۰۰' },
  { v: 10000, kind: 'note', col: P.note10000, label: '۱۰۰۰۰' },
];

/* ───────── جنس‌های بازار ───────── */
const GOODS = [
  { id: 'nan',    name: 'نان سنگک', cost: 1000, price: 1500, art: 'bread' },
  { id: 'khorma', name: 'خرما',     cost: 2000, price: 3000, art: 'dates' },
  { id: 'pesteh', name: 'پسته',     cost: 3500, price: 5000, art: 'pistachio' },
  { id: 'keshmesh',name:'کشمش',     cost: 1500, price: 2500, art: 'raisin' },
  { id: 'chai',   name: 'چای',      cost: 2500, price: 4000, art: 'tea' },
  { id: 'ghand',  name: 'قند',      cost: 1500, price: 2000, art: 'sugar' },
];

const UPGRADES = [
  { id: 'saye',   name: 'سایه‌بان',      desc: 'مشتری‌ها زیر سایه صبورترند.', cost: 4000 },
  { id: 'tablo',  name: 'تابلوی دکّه',   desc: 'مشتریِ بیشتری سراغت می‌آید.', cost: 5000 },
  { id: 'sandogh',name: 'صندوقِ خرد',    desc: 'هر صبح سکهٔ خردِ بیشتری داری.', cost: 3500 },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',       // intro | shop | day | evening | closed
  day: 1,
  cash: 8000,           // پولِ نقد برای خرید جنس
  dayStartCash: 8000,   // پولِ اوّلِ روز، برای حسابِ سودِ واقعی
  box: {},              // تعداد هر واحدِ پول در صندوق
  shelf: [],            // { good, qty }
  queue: [],
  active: null,
  tray: [],             // واحدهای پولی که برای باقی گذاشته‌ای
  hearts: 3,
  score: 0, combo: 0, bestCombo: 0,
  served: 0, target: 6,
  spawnT: 0,
  upgrades: [],
  t: 0, phaseT: 0,
  hover: null,
  floats: [],           // عددهای شناور (+امتیاز، −ضرر)
  shake: 0,
  best: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();

/* ───────── ذخیرهٔ رکورد ───────── */
function loadBest() { try { return +localStorage.getItem('dokke-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('dokke-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── راه‌اندازیِ روز ───────── */

function startDay() {
  S.phase = 'shop'; S.phaseT = 0;
  S.dayStartCash = S.cash;
  S.served = 0;
  S.hearts = 3;
  S.combo = 0;
  S.queue = [];
  S.active = null;
  S.tray = [];
  S.tut = { on: S.day === 1, step: 0, t: 0 };
  S.target = 5 + S.day * 2;
  // صندوقِ خرد: هر روز از نو، و با ارتقا بیشتر
  const extra = S.upgrades.includes('sandogh') ? 4 : 0;
  S.box = { 500: 6 + extra, 1000: 5 + extra, 2000: 3, 5000: 2, 10000: 0 };
}

function openStall() {
  if (S.shelf.reduce((a, s) => a + s.qty, 0) === 0) {
    toast.say('اوّل باید چیزی برای فروش بخری', 'bad');
    sfx.nope();
    return;
  }
  S.phase = 'day'; S.phaseT = 0;
  S.spawnT = 1.4;
  sfx.good();
}

/* ───────── مشتری ───────── */

const FACES = [
  { skin: '#e2b184', hair: '#3a2a1c', cloth: '#7fa8c9', hat: 'none' },
  { skin: '#c9a274', hair: '#4a3220', cloth: '#d98f5a', hat: 'cap' },
  { skin: '#d8a878', hair: '#8a6a52', cloth: '#9db97a', hat: 'scarf' },
  { skin: '#b98a5c', hair: '#2f2018', cloth: '#c58aa8', hat: 'none' },
  { skin: '#eec39c', hair: '#5a3a24', cloth: '#b08fc9', hat: 'scarf' },
  { skin: '#caa079', hair: '#3a2a1c', cloth: '#c9a25a', hat: 'cap' },
];

/** آیا با صندوقِ فعلی می‌شود این مبلغ را جور کرد؟ (حریصانه از بزرگ به کوچک) */
function canMakeChange(amount) {
  let left = amount;
  for (const m of [...MONEY].reverse()) {
    const take = Math.min(Math.floor(left / m.v), S.box[m.v] || 0);
    left -= take * m.v;
  }
  return left === 0;
}

function spawnCustomer() {
  const stocked = S.shelf.filter((s) => s.qty > 0);
  // چند مشتری هم‌زمان — همان چیزی که بازی را زنده می‌کند.
  // فقط در حینِ آموزش یکی، تا صحنه شلوغ و گیج‌کننده نشود.
  const maxQueue = S.tut.on ? 1 : 3;
  if (!stocked.length || S.queue.length >= maxQueue) return;

  // اوّلین مشتریِ روزِ اوّل عمداً ساده‌ترین حالت است: قیمت ۳۰۰۰، اسکناس
  // ۵۰۰۰، باقی ۲۰۰۰. قاعده باید با یک نمونهٔ تمیز جا بیفتد.
  if (S.tut.on && S.served === 0 && S.queue.length === 0) {
    const easy = stocked.find((x) => x.good.price === 3000) || stocked[0];
    const v = [5000, 10000].find((n) => n > easy.good.price) || 10000;
    S.queue.push(makeCustomer(easy, v));
    sfx.pop();
    return;
  }

  // چند ترکیب را امتحان می‌کنیم تا یکی پیدا شود که باقی‌اش با صندوقِ فعلی
  // ساختنی باشد. اگر هیچ‌کدام نشد، این لحظه مشتری نمی‌آید و بچه نفس می‌کشد.
  for (let tries = 0; tries < 8; tries++) {
    const cand = stocked[Math.floor(Math.random() * stocked.length)];
    const opts = [5000, 10000, 20000].filter((v) => v > cand.good.price);
    if (!opts.length) continue;
    const v = opts[Math.floor(Math.random() * Math.min(opts.length, 2))];
    if (!canMakeChange(v - cand.good.price)) continue;
    S.queue.push(makeCustomer(cand, v));
    sfx.pop();
    return;
  }
}

/** یک مشتری از روی جنسِ انتخابی و اسکناسی که می‌دهد می‌سازد. */
function makeCustomer(item, paidV) {
  const price = item.good.price;
  const paid = paidV === 20000 ? [10000, 10000] : [paidV];
  // صبرِ مشتری عمداً سخاوتمند است: بچهٔ هشت‌ساله باید فرصت داشته باشد
  // بشمارد، اشتباه کند و دوباره بچیند. فشار باید حس شود، نه خفه کند.
  const patience = (34 - S.day * 2.5) * (S.upgrades.includes('saye') ? 1.5 : 1);
  return {
    id: Math.random(),
    good: item.good,
    price,
    paid,
    change: paidV - price,
    patience: 1, maxP: Math.max(16, patience),
    face: FACES[Math.floor(Math.random() * FACES.length)],
    x: 0, mood: 'wait',
    born: S.t,
  };
}

/* ───────── چیدمان ───────── */

const HUD_H = 62;
const SHELF = { x: 32, y: 108, w: 336, h: 380 };
const COUNTER = { x: 396, y: 520, w: 456, h: 40 };
const BOXP = { x: 880, y: 202, w: 296, h: 418 };
const TRAY = { x: 396, y: 588, w: 456, h: 104 };
const BTN_GIVE = { x: 396, y: 704, w: 216, h: 46 };
const BTN_BACK = { x: 636, y: 704, w: 216, h: 46 };
const BTN_OPEN = { x: 470, y: 690, w: 260, h: 56 };

function boxSlot(i) {
  return { x: BOXP.x + 26, y: BOXP.y + 74 + i * 66, w: BOXP.w - 52, h: 56 };
}
function shelfSlot(i) {
  const col = i % 2, row = Math.floor(i / 2);
  return { x: SHELF.x + 18 + col * 156, y: SHELF.y + 44 + row * 112, w: 142, h: 100 };
}
function queueSpot(i) {
  return { x: 468 + i * 142, y: 516 };
}

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
S.shelf = GOODS.map((g) => ({ good: g, qty: 0 }));
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;

  if (S.phase === 'day') {
    S.spawnT -= dt;
    const rate = 4.2 - S.day * .3 - (S.upgrades.includes('tablo') ? .6 : 0);
    if (S.spawnT <= 0 && S.served + S.queue.length < S.target) {
      spawnCustomer();
      S.spawnT = Math.max(2.2, rate);
    }
    // اگر کسی انتخاب نشده، خودبه‌خود اوّلینِ صف را جلو می‌آوریم؛ بچه
    // نباید برای شروعِ کار مجبور باشد چیزی را کشف کند.
    if (!S.active && S.queue.length) S.active = S.queue[0];
    for (const c of S.queue) {
      if (S.tut.on) continue;                    // در آموزش، صبر کم نمی‌شود
      c.patience -= dt / c.maxP;
      if (c.patience <= 0) leaveAngry(c);
    }
    if (S.served >= S.target || S.hearts <= 0) endDay();
  }

  if (S.tut.on && S.phase === 'day') {
    S.tut.t += dt;
    const c = S.active;
    if (S.tut.step === 0 && c && S.tut.t > 30) { S.tut.step = 1; S.tut.t = 0; }
    if (S.tut.step === 1 && c && trayTotal() > 0 && S.tut.t > 1.4) { S.tut.step = 2; S.tut.t = 0; }
  }

  for (const f of S.floats) { f.t += dt; f.y -= 44 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.4);

  bits.step(dt);
  toast.step(dt);
  draw();
}

function floatText(x, y, txt, col) { S.floats.push({ x, y, txt, col, t: 0 }); }

function leaveAngry(c) {
  S.queue = S.queue.filter((q) => q !== c);
  if (S.active === c) { S.active = null; returnTray(); }
  S.hearts--;
  S.combo = 0;
  S.shake = .4;
  sfx.nope();
  floatText(660, 380, 'رفت!', P.bad);
  toast.say('مشتری منتظر ماند و رفت', 'bad');
}

/* ───────── دادنِ باقی ───────── */

const trayTotal = () => S.tray.reduce((a, v) => a + v, 0);
/** سودِ واقعیِ امروز: پولِ الان منهای پولِ اوّلِ صبح (پس خرجِ جنس هم کم شده). */
const dayProfit = () => S.cash - S.dayStartCash;

function addToTray(v) {
  if (!S.active) { toast.say('اوّل یک مشتری را انتخاب کن', 'info'); return; }
  if ((S.box[v] || 0) <= 0) { sfx.nope(); toast.say('از این دیگر نداری!', 'bad'); return; }
  S.box[v]--;
  S.tray.push(v);
  sfx.tap();
}

function returnTray() {
  for (const v of S.tray) S.box[v] = (S.box[v] || 0) + 1;
  S.tray = [];
}

function give() {
  const c = S.active;
  if (!c) { toast.say('اوّل یک مشتری را انتخاب کن', 'info'); return; }
  const t = trayTotal();
  if (t < c.change) {
    sfx.nope();
    S.shake = .25;
    toast.say('هنوز کم است — بیشتر بگذار', 'info');
    c.patience = Math.max(.02, c.patience - .06);
    return;
  }
  // فروش انجام شد
  const over = t - c.change;
  const speed = c.patience;                       // هرچه سریع‌تر، امتیازِ بیشتر
  const gain = c.price + (over > 0 ? -over : 0);
  S.cash += gain;
  for (const v of c.paid) S.box[v] = (S.box[v] || 0) + 1;
  const item = S.shelf.find((s) => s.good.id === c.good.id);
  if (item) item.qty--;

  if (over > 0) {
    S.combo = 0;
    floatText(700, 430, `−${fa(over)} ضرر`, P.bad);
    toast.say('بیشتر از باقی دادی — از سودت کم شد', 'bad');
    sfx.nope();
  } else {
    S.combo++;
    S.bestCombo = Math.max(S.bestCombo, S.combo);
    const pts = Math.round(100 + speed * 120) * Math.min(S.combo, 5);
    S.score += pts;
    floatText(700, 420, `+${fa(pts)}`, P.good);
    if (S.combo >= 2) floatText(700, 470, `${fa(S.combo)} تایی!`, P.gold);
    sfx.good();
    bits.confetti(700, 440, 20, [P.gold, P.good, P.brass]);
  }

  S.tray = [];
  S.queue = S.queue.filter((q) => q !== c);
  S.active = null;
  S.served++;
  if (S.tut.on) { S.tut.on = false; toast.say('حالا خودت بلدی! مشتریِ بعدی می‌آید…', 'good'); }
}

function endDay() {
  S.phase = 'evening'; S.phaseT = 0;
  S.active = null;
  returnTray();
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  sfx.win();
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase === 'intro') return inRect(p, BTN_OPEN) ? BTN_OPEN : null;
  if (S.phase === 'shop') {
    for (let i = 0; i < S.shelf.length; i++) if (inRect(p, shopRow(i))) return { buy: i };
    if (inRect(p, BTN_OPEN)) return BTN_OPEN;
    return null;
  }
  if (S.phase === 'evening') {
    for (let i = 0; i < UPGRADES.length; i++) if (inRect(p, upRect(i))) return { up: i };
    if (inRect(p, BTN_OPEN)) return BTN_OPEN;
    return null;
  }
  if (S.phase === 'closed') return inRect(p, BTN_OPEN) ? BTN_OPEN : null;

  // روزِ کاری
  for (let i = 0; i < MONEY.length; i++) if (inRect(p, boxSlot(i))) return { money: i };
  for (let i = 0; i < S.tray.length; i++) if (inCircle(p, trayCoin(i), 4)) return { takeBack: i };
  if (inRect(p, BTN_GIVE)) return BTN_GIVE;
  if (inRect(p, BTN_BACK)) return BTN_BACK;
  for (let i = 0; i < S.queue.length; i++) {
    const q = queueSpot(i);
    if (Math.hypot(p.x - q.x, p.y - (q.y - 96)) < 82) return { cust: i };
  }
  return null;
}

cv.addEventListener('pointermove', (e) => {
  S.hover = hitTest(toStage(e));
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});
cv.addEventListener('pointerleave', () => { S.hover = null; });
cv.addEventListener('pointerdown', (e) => {
  /* پردهٔ اوّلِ آموزش فقط خواندنی است؛ با یک ضربه می‌رود پردهٔ بعد. */
  if (S.phase === 'day' && S.tut.on && S.tut.step === 0 && S.active) {
    S.tut.step = 1; S.tut.t = 0; sfx.tap(); return;
  }
  const h = hitTest(toStage(e));
  if (!h) return;
  if (S.phase === 'intro') { startDay(); return; }
  if (S.phase === 'shop') {
    if (h === BTN_OPEN) return openStall();
    if (h.buy !== undefined) return buyGood(h.buy);
    return;
  }
  if (S.phase === 'evening') {
    if (h === BTN_OPEN) { S.day++; startDay(); return; }
    if (h.up !== undefined) return buyUpgrade(h.up);
    return;
  }
  if (S.phase === 'closed') { S.day = 1; S.cash = 8000; S.score = 0; S.upgrades = []; S.shelf.forEach(s => s.qty = 0); startDay(); return; }

  if (h.money !== undefined) return addToTray(MONEY[h.money].v);
  if (h.takeBack !== undefined) {
    const v = S.tray.splice(h.takeBack, 1)[0];
    S.box[v] = (S.box[v] || 0) + 1;
    sfx.tap();
    return;
  }
  if (h === BTN_GIVE) return give();
  if (h === BTN_BACK) { returnTray(); sfx.slide(); return; }
  if (h.cust !== undefined) {
    const c = S.queue[h.cust];
    if (S.active !== c) { returnTray(); S.active = c; sfx.tap(); }
    return;
  }
});

function buyGood(i) {
  const s = S.shelf[i];
  if (S.cash < s.good.cost) { sfx.nope(); toast.say('پولت کم است', 'bad'); return; }
  if (s.qty >= 5) { sfx.nope(); toast.say('بیشتر از ۵ تا جا ندارد', 'info'); return; }
  S.cash -= s.good.cost;
  s.qty++;
  sfx.place();
}

function buyUpgrade(i) {
  const u = UPGRADES[i];
  if (S.upgrades.includes(u.id)) { toast.say('این را داری', 'info'); return; }
  if (S.cash < u.cost) { sfx.nope(); toast.say('پولت کم است', 'bad'); return; }
  S.cash -= u.cost;
  S.upgrades.push(u.id);
  sfx.good();
  bits.confetti(SCENE_W/2, 300, 30, [P.gold, P.good]);
  toast.say(`${u.name} خریدی!`, 'good');
}

/* ───────── ترسیم ───────── */

function draw() {
  beginScene('#201811');
  drawBazaar();
  drawStall();
  drawShelfGoods();
  drawCounter();
  drawSacks();
  if (S.phase === 'day') {
    drawQueue();
    drawCashBox();
    drawTray();
    drawDayButtons();
  }
  if (S.phase === 'day' && S.tut.on) drawTutorial();
  drawHUD();
  drawFloats();
  bits.draw();
  toast.draw(HUD_H + 12, { ink: P.ink });

  if (S.phase === 'intro')   drawIntro();
  if (S.phase === 'shop')    drawShopPanel();
  if (S.phase === 'evening') drawEvening();
  if (S.phase === 'closed')  drawClosed();
  endScene(.11, 'rgba(26,16,8,.44)');
}

/* ─── بازار ─── */

function drawBazaar() {
  const g = ctx.createLinearGradient(0, 0, 0, 520);
  g.addColorStop(0, P.domeTop);
  g.addColorStop(1, P.domeLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, 520);

  // طاق‌های آجریِ بازارِ سرپوشیده، با نورِ روزنه
  for (let i = 0; i < 4; i++) {
    const cx = 150 + i * 320;
    ctx.fillStyle = 'rgba(255,225,170,.05)';
    ctx.beginPath();
    ctx.moveTo(cx - 120, 300);
    ctx.quadraticCurveTo(cx, 40, cx + 120, 300);
    ctx.closePath(); ctx.fill();
    // روزنهٔ نور از سقف
    const lg = ctx.createLinearGradient(cx, 40, cx - 60, 560);
    lg.addColorStop(0, 'rgba(255,232,180,.16)');
    lg.addColorStop(1, 'rgba(255,232,180,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(cx - 26, 40); ctx.lineTo(cx + 26, 40);
    ctx.lineTo(cx - 30, 560); ctx.lineTo(cx - 130, 560);
    ctx.closePath(); ctx.fill();
  }
  drawNeighbours();

  // کف
  const fg = ctx.createLinearGradient(0, 500, 0, SH);
  fg.addColorStop(0, P.floor);
  fg.addColorStop(1, P.floorDk);
  ctx.fillStyle = fg;
  ctx.fillRect(0, 500, SW, SH - 500);
  ctx.strokeStyle = 'rgba(0,0,0,.18)';
  ctx.lineWidth = 2;
  for (let x = -60; x < SW + 160; x += 110) {
    ctx.beginPath(); ctx.moveTo(x, 500); ctx.lineTo(x - 70, SH); ctx.stroke();
  }
}

/** دکّه‌های همسایه و آویزهای بازار — عمق و شلوغیِ راسته. */
function drawNeighbours() {
  // قالیچه‌های آویزان از سقف
  for (const [x, w, c1, c2] of [[452, 96, '#8a4438', '#c9a06a'], [700, 84, '#3f6f7a', '#d9b26a'],
                                [822, 76, '#6b4a86', '#c98a5e']]) {
    ctx.globalAlpha = .55;
    withShadow(10, 6, .3, () => {
      ctx.fillStyle = c1;
      wobbleRect(x, 96, w, 150, 3, x, 1.6);
      ctx.fill();
    }, '10, 8, 6');
    ctx.fillStyle = c2;
    for (let k = 0; k < 4; k++) {
      wobbleRect(x + 8, 112 + k * 34, w - 16, 8, 2, x + k, .8);
      ctx.fill();
    }
    ctx.strokeStyle = '#e8d9b6';
    ctx.lineWidth = 2;
    for (let k = 0; k < 8; k++) {
      ctx.beginPath();
      ctx.moveTo(x + 4 + k * (w - 8) / 7, 246);
      ctx.lineTo(x + 4 + k * (w - 8) / 7, 258);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // فانوس‌های آویزان
  for (const x of [420, 620, 820, 1010]) {
    ctx.strokeStyle = 'rgba(40,26,14,.7)';
    ctx.lineWidth = 2.5;
    const sway = Math.sin(S.t * .8 + x) * 3;
    ctx.beginPath(); ctx.moveTo(x, 62); ctx.lineTo(x + sway, 116); ctx.stroke();
    ctx.fillStyle = P.brassDk;
    wobbleRect(x + sway - 14, 116, 28, 10, 3, x, 1); ctx.fill();
    ctx.fillStyle = '#f0c86a';
    ctx.beginPath();
    ctx.moveTo(x + sway - 15, 126);
    ctx.quadraticCurveTo(x + sway - 20, 160, x + sway, 168);
    ctx.quadraticCurveTo(x + sway + 20, 160, x + sway + 15, 126);
    ctx.closePath(); ctx.fill();
    const gl = ctx.createRadialGradient(x + sway, 148, 6, x + sway, 148, 120);
    gl.addColorStop(0, 'rgba(255,214,140,.20)');
    gl.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = gl;
    ctx.beginPath(); ctx.arc(x + sway, 148, 120, 0, TAU); ctx.fill();
  }
  // دکّهٔ همسایه، سمت راست و دورتر
  ctx.globalAlpha = .5;
  ctx.fillStyle = P.woodDk;
  wobbleRect(1060, 300, 190, 210, 6, 9, 2); ctx.fill();
  ctx.fillStyle = '#8a5f38';
  for (let k = 0; k < 3; k++) { wobbleRect(1070, 322 + k * 66, 170, 10, 3, k, 1); ctx.fill(); }
  for (let k = 0; k < 6; k++) {
    ctx.fillStyle = ['#b8503f', '#c9a06a', '#6b8a4a'][k % 3];
    wobbleCircle(1096 + (k % 3) * 54, 308 + Math.floor(k / 3) * 66, 17, k * 3, 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ─── دکّه ─── */

function drawStall() {
  // سایه‌بانِ راه‌راه
  const aw = { x: 12, y: 62, w: 380 };
  ctx.save();
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? P.awning : P.awning2;
    ctx.beginPath();
    ctx.moveTo(aw.x + i * (aw.w / 10), aw.y);
    ctx.lineTo(aw.x + (i + 1) * (aw.w / 10), aw.y);
    ctx.lineTo(aw.x + (i + 1) * (aw.w / 10) + 6, aw.y + 34);
    ctx.lineTo(aw.x + i * (aw.w / 10) + 6, aw.y + 34);
    ctx.closePath(); ctx.fill();
  }
  // کنگره‌های پایینِ سایه‌بان
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? P.awning : P.awning2;
    wobbleCircle(aw.x + 6 + (i + .5) * (aw.w / 10), aw.y + 34, aw.w / 20, i, 1);
    ctx.fill();
  }
  ctx.restore();
  if (S.upgrades.includes('saye')) {
    ctx.fillStyle = 'rgba(255,220,160,.10)';
    ctx.beginPath();
    ctx.moveTo(aw.x, aw.y + 40); ctx.lineTo(aw.x + aw.w + 20, aw.y + 40);
    ctx.lineTo(aw.x + aw.w - 40, 520); ctx.lineTo(aw.x + 20, 520);
    ctx.closePath(); ctx.fill();
  }

  // قفسه
  withShadow(20, 10, .4, () => {
    ctx.fillStyle = P.wood;
    wobbleRect(SHELF.x, SHELF.y, SHELF.w, SHELF.h, 8, 3, 2);
    ctx.fill();
  }, '10, 8, 6');
  ctx.fillStyle = '#8a5f38';
  wobbleRect(SHELF.x + 10, SHELF.y + 12, SHELF.w - 20, SHELF.h - 24, 6, 5, 1.6);
  ctx.fill();
  // نورِ ملایمی که از سایه‌بان روی قفسه می‌افتد
  const sg = ctx.createLinearGradient(SHELF.x, SHELF.y, SHELF.x + SHELF.w, SHELF.y + SHELF.h);
  sg.addColorStop(0, 'rgba(255,226,170,.20)');
  sg.addColorStop(1, 'rgba(255,226,170,0)');
  ctx.fillStyle = sg;
  wobbleRect(SHELF.x + 10, SHELF.y + 12, SHELF.w - 20, SHELF.h - 24, 6, 5, 1.6);
  ctx.fill();
  for (let r = 0; r < 3; r++) {
    const y = SHELF.y + 32 + r * 112 + 100;
    ctx.fillStyle = P.woodLit;
    wobbleRect(SHELF.x + 10, y, SHELF.w - 20, 12, 3, r * 7, 1.2);
    ctx.fill();
  }
  // تابلوی دکّه
  if (S.upgrades.includes('tablo')) {
    withShadow(10, 5, .35, () => {
      ctx.fillStyle = P.brass;
      wobbleRect(SHELF.x + 40, SHELF.y - 44, SHELF.w - 80, 38, 6, 11, 1.4);
      ctx.fill();
    }, '10, 8, 6');
    text('دکّهٔ من', SHELF.x + SHELF.w/2, SHELF.y - 24, { size: 24, color: P.ink, family: 'Lalezar' });
  }
}

function drawShelfGoods() {
  for (let i = 0; i < S.shelf.length; i++) {
    const s = S.shelf[i], r = shelfSlot(i);
    if (s.qty === 0) {
      ctx.globalAlpha = .18;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = P.woodLit;
      ctx.lineWidth = 2;
      wobbleRect(r.x + 8, r.y + 8, r.w - 16, r.h - 16, 6, i, 1);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      continue;
    }
    drawGood(s.good.art, r.x + r.w/2, r.y + r.h - 22, .9);
    // تعداد
    ctx.fillStyle = P.paper;
    wobbleCircle(r.x + r.w - 16, r.y + 16, 15, i * 3, 1);
    ctx.fill();
    text(fa(s.qty), r.x + r.w - 16, r.y + 17, { size: 17, color: P.ink, family: 'Lalezar' });
    text(`${fa(s.good.price)}`, r.x + r.w/2, r.y + r.h - 2, { size: 14, color: '#f0dfae' });
  }
}

/** جنس‌ها را با مسیر می‌کشیم — نه ایموجی. */
function drawGood(art, x, y, sc) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  if (art === 'bread') {
    ctx.fillStyle = '#d99f52';
    wobbleEllipse(0, -22, 44, 24, -.06, 3, 2.4); ctx.fill();
    ctx.fillStyle = '#b87a34';
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.ellipse(k * 14, -22 + Math.abs(k) * 2, 3.4, 9, .1, 0, TAU);
      ctx.fill();
    }
  } else if (art === 'dates') {
    ctx.fillStyle = '#8a5a3a';                     // ظرفِ سفالی
    wobbleEllipse(0, -14, 40, 16, 0, 5, 2); ctx.fill();
    ctx.fillStyle = '#6b4326';
    for (let k = 0; k < 7; k++) {
      const px = -26 + (k % 4) * 17, py = -26 - Math.floor(k / 4) * 12;
      ctx.save(); ctx.translate(px, py); ctx.rotate(.4 + k);
      wobbleEllipse(0, 0, 10, 6, 0, k, .8); ctx.fill();
      ctx.restore();
    }
  } else if (art === 'pistachio') {
    ctx.fillStyle = '#c9a06a';                     // کیسهٔ کنفی
    ctx.beginPath();
    ctx.moveTo(-30, 0); ctx.quadraticCurveTo(-36, -44, -16, -52);
    ctx.lineTo(16, -52); ctx.quadraticCurveTo(36, -44, 30, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a67f4d';
    wobbleEllipse(0, -52, 20, 7, 0, 7, 1.2); ctx.fill();
    ctx.fillStyle = '#b6c98a';
    for (let k = 0; k < 6; k++) {
      ctx.save();
      ctx.translate(-16 + (k % 3) * 16, -58 - Math.floor(k / 3) * 9);
      ctx.rotate(k);
      wobbleEllipse(0, 0, 8, 5, 0, k + 2, .7); ctx.fill();
      ctx.restore();
    }
  } else if (art === 'raisin') {
    ctx.fillStyle = '#7a6a4e';
    wobbleEllipse(0, -14, 38, 15, 0, 9, 2); ctx.fill();
    ctx.fillStyle = '#4e3a24';
    for (let k = 0; k < 12; k++) {
      const a = noise1(k * 3.3) * TAU;
      wobbleCircle(Math.cos(a) * 22, -24 + Math.sin(a) * 9, 5, k, .6);
      ctx.fill();
    }
  } else if (art === 'tea') {
    ctx.fillStyle = '#b8503f';                     // قوطیِ چای
    wobbleRect(-26, -58, 52, 58, 6, 11, 1.4); ctx.fill();
    ctx.fillStyle = '#8f3a2c';
    wobbleRect(-26, -58, 52, 12, 4, 13, 1); ctx.fill();
    ctx.fillStyle = '#e8d9b6';
    wobbleEllipse(0, -30, 16, 12, 0, 15, 1.2); ctx.fill();
    ctx.fillStyle = '#8f3a2c';
    text('چای', 0, -29, { size: 13, color: '#8f3a2c' });
  } else {
    ctx.fillStyle = '#f0ece0';                     // کلّهٔ قند
    ctx.beginPath();
    ctx.moveTo(-24, 0); ctx.quadraticCurveTo(-14, -56, 0, -62);
    ctx.quadraticCurveTo(14, -56, 24, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d6d2c4';
    ctx.beginPath();
    ctx.moveTo(8, 0); ctx.quadraticCurveTo(12, -50, 0, -62);
    ctx.quadraticCurveTo(14, -56, 24, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.cloth;
    wobbleRect(-26, -8, 52, 12, 3, 17, 1); ctx.fill();
  }
  ctx.restore();
}

function drawSacks() {
  for (const [x, y, sc, col] of [[92, 700, 1, '#c9a06a'], [176, 716, .82, '#b08f5c'], [40, 730, .7, '#c9a06a']]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.globalAlpha = .3;
    ctx.fillStyle = '#241608';
    wobbleEllipse(6, 6, 46, 11, 0, x, 2); ctx.fill();
    ctx.globalAlpha = 1;
    withShadow(12, 6, .34, () => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-40, 0);
      ctx.quadraticCurveTo(-48, -64, -22, -74);
      ctx.lineTo(22, -74);
      ctx.quadraticCurveTo(48, -64, 40, 0);
      ctx.closePath(); ctx.fill();
    }, '10, 8, 6');
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    ctx.beginPath();
    ctx.moveTo(14, 0); ctx.quadraticCurveTo(34, -60, 18, -73);
    ctx.lineTo(22, -74); ctx.quadraticCurveTo(48, -64, 40, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a67f4d';
    wobbleEllipse(0, -74, 26, 9, 0, x + 1, 1.4); ctx.fill();
    ctx.restore();
  }
}

function drawCounter() {
  const c = COUNTER;
  withShadow(18, 9, .42, () => {
    ctx.fillStyle = P.wood;
    wobbleRect(c.x - 20, c.y, c.w + 40, c.h, 8, 21, 1.8);
    ctx.fill();
  }, '10, 8, 6');
  ctx.fillStyle = P.woodLit;
  wobbleRect(c.x - 16, c.y + 3, c.w + 32, 9, 4, 23, 1.2);
  ctx.fill();
  ctx.fillStyle = P.woodDk;
  wobbleRect(c.x - 6, c.y + c.h, c.w + 12, 34, 4, 25, 1.4);
  ctx.fill();
}

/* ─── صف مشتری ─── */

function drawQueue() {
  for (let i = 0; i < S.queue.length; i++) {
    const c = S.queue[i];
    const spot = queueSpot(i);
    const isActive = S.active === c;
    const y = spot.y + (isActive ? 22 : 0);
    drawCustomer(spot.x, y, c, isActive);
    drawPatience(spot.x, y - (isActive ? 212 : 178), c);
    // خواسته‌اش
    if (isActive) drawOrderBubble(c);
  }
  if (S.queue.length === 0 && S.phase === 'day') {
    text('منتظرِ مشتری…', 660, 420, { size: 20, color: 'rgba(247,237,214,.5)' });
  }
}

function drawCustomer(x, y, c, active) {
  const f = c.face;
  const bob = Math.sin(S.t * 1.6 + c.id * 9) * 3;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(active ? .95 : .78, active ? .95 : .78);
  if (!active) ctx.globalAlpha = .82;

  ctx.globalAlpha *= 1;
  ctx.fillStyle = 'rgba(20,12,6,.3)';
  wobbleEllipse(6, 6, 44, 10, 0, 3, 2); ctx.fill();

  withShadow(14, 7, .3, () => {                    // تن
    ctx.fillStyle = f.cloth;
    ctx.beginPath();
    ctx.moveTo(-46, 0);
    ctx.quadraticCurveTo(-54, -96, -28, -118);
    ctx.lineTo(28, -118);
    ctx.quadraticCurveTo(54, -96, 46, 0);
    ctx.closePath(); ctx.fill();
  }, '10, 8, 6');
  ctx.strokeStyle = f.skin;
  ctx.lineWidth = 13; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-38, -92); ctx.lineTo(-52, -50);
  ctx.moveTo(38, -92);  ctx.lineTo(52, -50);
  ctx.stroke();
  withShadow(10, 5, .26, () => {
    ctx.fillStyle = f.skin;
    wobbleCircle(0, -150, 34, c.id * 7, 1.7);
    ctx.fill();
  }, '10, 8, 6');
  ctx.fillStyle = f.hair;
  ctx.beginPath();
  ctx.moveTo(-34, -156);
  ctx.quadraticCurveTo(-36, -192, 0, -188);
  ctx.quadraticCurveTo(36, -192, 34, -156);
  ctx.quadraticCurveTo(16, -172, 0, -170);
  ctx.quadraticCurveTo(-16, -172, -34, -156);
  ctx.closePath(); ctx.fill();
  if (f.hat === 'cap') {
    ctx.fillStyle = P.awning;
    ctx.beginPath();
    ctx.moveTo(-38, -172); ctx.quadraticCurveTo(0, -212, 38, -172);
    ctx.closePath(); ctx.fill();
  } else if (f.hat === 'scarf') {
    ctx.fillStyle = P.cloth;
    ctx.beginPath();
    ctx.moveTo(-38, -148);
    ctx.quadraticCurveTo(-42, -192, 0, -190);
    ctx.quadraticCurveTo(42, -192, 38, -148);
    ctx.quadraticCurveTo(28, -132, 16, -124);
    ctx.lineTo(-16, -124);
    ctx.quadraticCurveTo(-28, -132, -38, -148);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = f.skin;
    wobbleEllipse(0, -148, 25, 28, 0, c.id * 3, 1.4); ctx.fill();
  }
  // چهره؛ هرچه صبرش کمتر، اخم بیشتر
  const worried = c.patience < .35;
  ctx.fillStyle = P.ink;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(s * 12, -150, 3.8, worried ? 5.6 : 4.6, 0, 0, TAU); ctx.fill();
  }
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
  if (worried) {
    ctx.beginPath();
    ctx.moveTo(-22, -168); ctx.lineTo(-6, -162);
    ctx.moveTo(22, -168);  ctx.lineTo(6, -162);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -128, 9, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(0, -136, 9, .2 * Math.PI, .8 * Math.PI); ctx.stroke();
  }
  ctx.restore();

  if (!active) {
    // حلقهٔ «مرا انتخاب کن»
    const hot = S.hover && S.hover.cust !== undefined && S.queue[S.hover.cust] === c;
    ctx.strokeStyle = hot ? 'rgba(255,240,200,.9)' : 'rgba(255,240,200,.28)';
    ctx.lineWidth = hot ? 4 : 2.5;
    ctx.setLineDash([8, 7]);
    ctx.lineDashOffset = -S.t * 16;
    wobbleCircle(x, y - 100, 70, c.id * 5, 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

/** نوارِ صبر — قلبِ فشارِ بازی. */
function drawPatience(x, y, c) {
  const w = 96, h = 12;
  ctx.fillStyle = 'rgba(20,12,6,.5)';
  wobbleRect(x - w/2, y, w, h, 6, c.id * 11, 1);
  ctx.fill();
  const k = clamp(c.patience, 0, 1);
  ctx.fillStyle = k > .5 ? P.good : k > .25 ? P.gold : P.bad;
  wobbleRect(x - w/2 + 2, y + 2, (w - 4) * k, h - 4, 4, c.id * 13, .8);
  ctx.fill();
  if (k < .3) {                                   // تپشِ هشدار
    ctx.globalAlpha = .4 + Math.sin(S.t * 12) * .3;
    ctx.strokeStyle = P.bad;
    ctx.lineWidth = 3;
    wobbleRect(x - w/2, y, w, h, 6, c.id * 11, 1);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/** سفارشِ مشتریِ فعّال. عمداً هیچ جملهٔ «این منهای این» ندارد:
 *  فقط ارزشِ محصول و پولی که مشتری داده — و کاری که باید بکنی.
 *  خودِ کشفِ تفریق کارِ بچه است، نه کارِ نوشته.                     */
function drawOrderBubble(c) {
  const w = 500, h = 168, x = 640, cx = x - w/2, y = 66;
  paper(cx, y, w, h, P.paper, 31, 12, .44);

  // راست: خودِ جنس
  drawGood(c.good.art, cx + w - 62, y + 86, .66);
  text(c.good.name, cx + w - 62, y + 106, { size: 14, color: P.inkSoft });

  // وسط: ارزشِ محصول
  text('ارزشِ محصول', cx + w - 194, y + 32, { size: 15, color: P.inkSoft });
  text(`${fa(c.price)}`, cx + w - 194, y + 68, { size: 34, color: P.ink, family: 'Lalezar' });
  text('تومان', cx + w - 194, y + 96, { size: 14, color: P.inkSoft });

  // خطِ جداکننده
  ctx.strokeStyle = 'rgba(125,107,78,.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 152, y + 22); ctx.lineTo(cx + 152, y + 112);
  ctx.stroke();

  // چپ: پولی که مشتری داده — بزرگ و خوانا
  text('پولِ مشتری', cx + 78, y + 32, { size: 15, color: P.inkSoft });
  const gap = c.paid.length > 1 ? 74 : 0;
  c.paid.forEach((v, i) => drawMoney(cx + 78 + (i - (c.paid.length - 1) / 2) * gap, y + 78, v, 1.06));

  // نوارِ پایین فقط کار را می‌گوید، نه جواب را. مبلغِ باقی هیچ‌جا نوشته
  // نمی‌شود؛ حساب‌کردنش تمامِ کارِ بچه است.
  ctx.fillStyle = P.awning;
  wobbleRect(cx + 12, y + h - 40, w - 24, 32, 6, 33, 1.2);
  ctx.fill();
  text('باقیِ پولش را بده', x, y + h - 24, { size: 19, color: '#fff8ec', family: 'Lalezar' });
}

/* ─── صندوق ─── */

function drawCashBox() {
  paper(BOXP.x, BOXP.y, BOXP.w, BOXP.h, P.paper, 41, 12, .42);
  text('صندوقِ پول', BOXP.x + BOXP.w/2, BOXP.y + 28, { size: 22, color: P.ink, family: 'Lalezar' });
  text('از هر کدام چند تا مانده', BOXP.x + BOXP.w/2, BOXP.y + 48, { size: 13, color: P.inkSoft });
  ctx.strokeStyle = 'rgba(125,107,78,.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(BOXP.x + 22, BOXP.y + 60); ctx.lineTo(BOXP.x + BOXP.w - 22, BOXP.y + 60);
  ctx.stroke();

  for (let i = 0; i < MONEY.length; i++) {
    const m = MONEY[i], r = boxSlot(i), n = S.box[m.v] || 0;
    const hot = S.hover && S.hover.money === i && n > 0;
    ctx.fillStyle = n > 0 ? (hot ? 'rgba(216,168,72,.24)' : 'rgba(120,96,60,.10)') : 'rgba(120,96,60,.05)';
    wobbleRect(r.x, r.y, r.w, r.h, 8, i * 5, 1.2);
    ctx.fill();
    ctx.globalAlpha = n > 0 ? 1 : .3;
    drawMoney(r.x + 44, r.y + r.h/2, m.v, .82);
    ctx.globalAlpha = 1;
    // تعدادِ باقی‌ماندهٔ همین واحد — همان چیزی که باید حواسش باشد
    text(fa(n), r.x + r.w - 46, r.y + r.h/2 - 4,
      { size: 28, color: n > 0 ? (n <= 1 ? P.bad : P.ink) : P.bad, family: 'Lalezar' });
    text(n > 0 ? 'تا مانده' : 'تمام شد', r.x + r.w - 46, r.y + r.h/2 + 20,
      { size: 12, color: n > 0 ? P.inkSoft : P.bad });
  }
}

/** سکه یا اسکناس. */
function drawMoney(x, y, v, sc) {
  const m = MONEY.find((q) => q.v === v);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  if (m.kind === 'coin') {
    withShadow(6, 3, .3, () => {
      ctx.fillStyle = m.col;
      wobbleCircle(0, 0, 26, v, 1.2);
      ctx.fill();
    }, '10, 8, 6');
    ctx.strokeStyle = 'rgba(0,0,0,.2)';
    ctx.lineWidth = 2;
    wobbleCircle(0, 0, 21, v + 1, 1);
    ctx.stroke();
    text(m.label, 0, 1, { size: 15, color: 'rgba(40,30,10,.85)', family: 'Lalezar' });
  } else {
    withShadow(6, 3, .3, () => {
      ctx.fillStyle = m.col;
      wobbleRect(-34, -20, 68, 40, 5, v, 1.2);
      ctx.fill();
    }, '10, 8, 6');
    ctx.strokeStyle = 'rgba(255,255,255,.4)';
    ctx.lineWidth = 2;
    wobbleRect(-29, -15, 58, 30, 4, v + 1, 1);
    ctx.stroke();
    text(m.label, 0, 1, { size: 16, color: 'rgba(255,255,255,.95)', family: 'Lalezar' });
  }
  ctx.restore();
}

/* ─── سینیِ باقی ─── */

function trayCoin(i) {
  const per = 7;
  const col = i % per, row = Math.floor(i / per);
  return { x: TRAY.x + 42 + col * 60, y: TRAY.y + 34 + row * 46, r: 24 };
}

function drawTray() {
  withShadow(14, 7, .4, () => {
    ctx.fillStyle = P.brassDk;
    wobbleRect(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 12, 51, 1.6);
    ctx.fill();
  }, '10, 8, 6');
  ctx.fillStyle = P.brass;
  wobbleRect(TRAY.x + 8, TRAY.y + 8, TRAY.w - 16, TRAY.h - 16, 9, 53, 1.4);
  ctx.fill();
  ctx.fillStyle = 'rgba(90,60,20,.22)';
  wobbleRect(TRAY.x + 14, TRAY.y + 14, TRAY.w - 28, TRAY.h - 28, 7, 55, 1.2);
  ctx.fill();

  if (!S.tray.length) {
    text('سینیِ باقی — از صندوق بردار و اینجا بگذار',
      TRAY.x + TRAY.w/2, TRAY.y + TRAY.h/2, { size: 16, color: 'rgba(60,40,12,.6)' });
  }
  for (let i = 0; i < S.tray.length; i++) {
    const c = trayCoin(i);
    const hot = S.hover && S.hover.takeBack === i;
    ctx.save();
    if (hot) { ctx.translate(0, -3); ctx.globalAlpha = .85; }
    drawMoney(c.x, c.y, S.tray[i], .74);
    ctx.restore();
  }
  // جمعِ سینی
  const t = trayTotal();
  ctx.fillStyle = P.paper;
  wobbleRect(TRAY.x + TRAY.w - 152, TRAY.y - 26, 152, 30, 6, 57, 1.2);
  ctx.fill();
  text(`روی سینی: ${fa(t)}`, TRAY.x + TRAY.w - 76, TRAY.y - 11, { size: 16, color: P.ink });
}

function drawDayButtons() {
  // رنگِ دکمه عمداً ثابت است: اگر با سبزشدن خبر بدهد که درست شده،
  // بچه دیگر حساب نمی‌کند، فقط منتظرِ سبزشدن می‌ماند.
  button(BTN_GIVE, 'بفرمایید', {
    hot: S.hover === BTN_GIVE, disabled: !S.active,
    fill: P.good, hotFill: '#7fae5e', size: 22, r: 10,
  });
  button(BTN_BACK, 'سینی را خالی کن', {
    hot: S.hover === BTN_BACK, fill: P.woodDk, hotFill: P.wood, size: 18, r: 10,
  });
}

/* ─── نوارِ بالا ─── */

/** دستِ اشاره‌گرِ کاغذی که به جایی که باید بزنی اشاره می‌کند. */
function pointer(x, y, dir) {
  const bob = Math.sin(S.t * 4) * 7;
  ctx.save();
  ctx.translate(x, y + (dir === 'down' ? -bob : bob));
  if (dir === 'left') ctx.rotate(-Math.PI / 2);
  if (dir === 'right') ctx.rotate(Math.PI / 2);
  if (dir === 'up') ctx.rotate(Math.PI);
  withShadow(10, 5, .4, () => {
    ctx.fillStyle = P.gold;
    ctx.beginPath();
    ctx.moveTo(0, 22); ctx.lineTo(-17, -6); ctx.lineTo(-7, -6);
    ctx.lineTo(-7, -26); ctx.lineTo(7, -26); ctx.lineTo(7, -6);
    ctx.lineTo(17, -6);
    ctx.closePath(); ctx.fill();
  }, '10, 8, 6');
  ctx.restore();
}

/** قابِ نبض‌دار دورِ چیزی که باید بهش دست بزنی. */
function spotlight(r) {
  ctx.save();
  ctx.strokeStyle = `rgba(232,180,72,${.55 + Math.sin(S.t * 4) * .35})`;
  ctx.lineWidth = 5;
  ctx.setLineDash([12, 8]);
  ctx.lineDashOffset = -S.t * 22;
  wobbleRect(r.x - 8, r.y - 8, r.w + 16, r.h + 16, 12, 3, 1.4);
  ctx.stroke();
  ctx.restore();
}

/** آموزشِ اوّلین فروش — سه گام، بدون هیچ فشارِ زمانی. */
function drawTutorial() {
  const c = S.active;
  if (!c) return;
  const steps = [
    {
      txt: `مشتری ${c.good.name} می‌خواهد.\nبالا را نگاه کن: ارزشِ محصول، و پولی که داده.\nحساب کن چقدر باید به او پس بدهی.`,
      at: () => { spotlight({ x: 390, y: 66, w: 500, h: 168 }); },
    },
    {
      txt: 'از صندوقِ پول سکه و اسکناس بردار و روی سینی بگذار،\nتا اندازهٔ باقیِ او شود.',
      at: () => {
        // عمداً کلِ صندوق را قاب می‌گیریم، نه همان سکه‌ای که لازم است.
        // اشاره به سکهٔ درست یعنی گفتنِ جواب.
        spotlight(BOXP);
        pointer(BOXP.x - 30, BOXP.y + BOXP.h / 2, 'right');
      },
    },
    {
      txt: 'هر وقت فکر کردی درست شد،\nدکمهٔ «بفرمایید» را بزن.',
      at: () => { spotlight(BTN_GIVE); pointer(BTN_GIVE.x + BTN_GIVE.w / 2, BTN_GIVE.y - 34, 'down'); },
    },
  ];
  const st = steps[Math.min(S.tut.step, 2)];
  const readable = S.tut.step === 0;          // پردهٔ اوّل فقط خواندنی است

  // نوارِ آموزش، پایینِ صحنه و بیرون از راهِ دست
  const w = 496, h = 104, x = 376, y = 250;
  ctx.save();
  ctx.globalAlpha = .96;
  paper(x, y, w, h, '#fffaf0', 81, 12, .45);
  ctx.restore();
  ctx.fillStyle = P.gold;
  wobbleRect(x, y, w, 8, 4, 83, 1);
  ctx.fill();
  textWrap(st.txt, x + w / 2, y + 34, w - 60, { size: 19, color: P.ink, lineHeight: 28 });
  if (readable) tutMore(x + w / 2, y + h + 12, S.t, P.ink);
  st.at();
}

function drawHUD() {
  ctx.fillStyle = 'rgba(28,18,10,.82)';
  ctx.fillRect(0, 0, SW, HUD_H);
  ctx.fillStyle = P.brassDk;
  ctx.fillRect(0, HUD_H - 4, SW, 4);

  let x = SW - 26;
  const chip = (label, value, col) => {
    ctx.font = '400 24px "Lalezar", Tahoma, sans-serif';
    const w = ctx.measureText(value).width + 30;
    text(value, x - w/2 + 12, HUD_H/2 + 4, { size: 24, color: col, family: 'Lalezar', align: 'center' });
    text(label, x - w - 4, HUD_H/2 + 3, { size: 14, color: 'rgba(247,237,214,.65)', align: 'right' });
    x -= w + 34 + ctx.measureText(label).width;
  };
  chip('روز', fa(S.day), '#f7edd6');
  chip('پولِ من', fa(S.cash), P.gold);
  chip('امتیاز', fa(S.score), P.good);
  if (S.combo > 1) chip('پشتِ‌سرِ‌هم', `×${fa(Math.min(S.combo, 5))}`, P.awning);

  // دل‌ها
  for (let i = 0; i < 3; i++) {
    const hx = 40 + i * 34;
    ctx.fillStyle = i < S.hearts ? P.bad : 'rgba(247,237,214,.16)';
    ctx.beginPath();
    ctx.moveTo(hx, HUD_H/2 + 8);
    ctx.bezierCurveTo(hx - 16, HUD_H/2 - 4, hx - 10, HUD_H/2 - 16, hx, HUD_H/2 - 6);
    ctx.bezierCurveTo(hx + 10, HUD_H/2 - 16, hx + 16, HUD_H/2 - 4, hx, HUD_H/2 + 8);
    ctx.closePath(); ctx.fill();
  }
  if (S.phase === 'day') {
    text(`${fa(S.served)} از ${fa(S.target)} مشتری`, 220, HUD_H/2,
      { size: 16, color: 'rgba(247,237,214,.8)' });
  }
  if (S.best > 0) {
    text(`رکورد: ${fa(S.best)}`, SW/2, HUD_H - 12, { size: 13, color: 'rgba(247,237,214,.4)' });
  }
}

function drawFloats() {
  for (const f of S.floats) {
    ctx.globalAlpha = clamp(1.4 - f.t, 0, 1);
    text(f.txt, f.x, f.y, { size: 26, color: f.col, family: 'Lalezar',
      stroke: 'rgba(20,12,6,.6)', strokeWidth: 5 });
    ctx.globalAlpha = 1;
  }
}

/* ─── پرده‌ها ─── */

function drawIntro() {
  overlay({
    t: S.phaseT,
    title: 'دکّهٔ من',
    body: 'بازارِ شهر باز شده و دکّهٔ گوشهٔ راسته مالِ توست.\n' +
          'صبح جنس می‌خری، روز می‌فروشی و باقیِ پولِ مشتری‌ها را می‌دهی.\n' +
          'حواست باشد: صبرِ مشتری‌ها تمام می‌شود و پولِ خردِ صندوقت هم بی‌نهایت نیست.',
    btn: BTN_OPEN, btnLabel: 'برویم بازار', btnHot: S.hover === BTN_OPEN,
    paper: P.paper, band: P.awning, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.good, btnHotFill: '#7fae5e', h: 300,
    icon: (cx, cy) => { drawMoney(cx - 40, cy, 1000, .8); drawMoney(cx + 34, cy, 5000, .8); },
  });
}

function shopRow(i) {
  return { x: 306, y: 178 + i * 74, w: 590, h: 62 };
}

function drawShopPanel() {
  ctx.fillStyle = 'rgba(28,18,10,.72)';
  ctx.fillRect(0, 0, SW, SH);
  paper(268, 74, 666, 592, P.paper, 61, 16, .5);
  text('بازارِ عمده‌فروش‌ها', SW/2, 116, { size: 30, color: P.ink, family: 'Lalezar' });
  text(`با ${fa(S.cash)} تومان هرچه خواستی بخر. جا برای هر جنس تا ۵ تا.`,
    SW/2, 148, { size: 16, color: P.inkSoft });

  for (let i = 0; i < S.shelf.length; i++) {
    const s = S.shelf[i], r = shopRow(i);
    const hot = S.hover && S.hover.buy === i;
    const can = S.cash >= s.good.cost && s.qty < 5;
    ctx.fillStyle = hot && can ? 'rgba(111,154,82,.20)' : 'rgba(120,96,60,.08)';
    wobbleRect(r.x, r.y, r.w, r.h, 10, i * 7, 1.4);
    ctx.fill();
    if (!can) { ctx.globalAlpha = .45; }
    drawGood(s.good.art, r.x + r.w - 46, r.y + r.h - 8, .48);
    text(s.good.name, r.x + r.w - 96, r.y + 22, { size: 19, color: P.ink, align: 'right' });
    text(`می‌خری ${fa(s.good.cost)}`, r.x + r.w - 96, r.y + 44, { size: 14, color: P.inkSoft, align: 'right' });
    text(`می‌فروشی ${fa(s.good.price)}`, r.x + r.w - 246, r.y + 44, { size: 14, color: P.good, align: 'right' });
    text(`سودِ هر تا: ${fa(s.good.price - s.good.cost)}`, r.x + 130, r.y + 32,
      { size: 15, color: P.gold, align: 'center' });
    ctx.globalAlpha = 1;
    // تعدادِ خریداری‌شده
    for (let k = 0; k < 5; k++) {
      ctx.fillStyle = k < s.qty ? P.good : 'rgba(120,96,60,.18)';
      wobbleCircle(r.x + 32 + k * 20, r.y + r.h/2, 8, i * 3 + k, .8);
      ctx.fill();
    }
  }
  const any = S.shelf.reduce((a, s) => a + s.qty, 0);
  button(BTN_OPEN, any ? 'دکّه را باز کن' : 'اوّل جنس بخر', {
    hot: S.hover === BTN_OPEN, disabled: !any,
    fill: P.good, hotFill: '#7fae5e', size: 26,
  });
}

function upRect(i) { return { x: 316, y: 344 + i * 84, w: 570, h: 72 }; }

function drawEvening() {
  ctx.fillStyle = 'rgba(28,18,10,.74)';
  ctx.fillRect(0, 0, SW, SH);
  paper(276, 74, 650, 596, P.paper, 71, 16, .5);
  const win = S.hearts > 0;
  text(win ? `روزِ ${fa(S.day)} تمام شد` : 'دکّه زودتر بسته شد', SW/2, 122,
    { size: 32, color: win ? P.ink : P.bad, family: 'Lalezar' });
  const prof = dayProfit();
  text(`سودِ امروز: ${prof >= 0 ? '' : '−'}${fa(Math.abs(prof))} تومان    ·    امتیاز: ${fa(S.score)}`,
    SW/2, 164, { size: 19, color: prof >= 0 ? P.inkSoft : P.bad });
  text(`بهترین زنجیره: ${fa(S.bestCombo)} مشتریِ پشتِ سرِ هم`, SW/2, 194,
    { size: 16, color: P.gold });

  const stars = prof > 6000 ? 3 : prof > 3000 ? 2 : prof > 500 ? 1 : 0;
  for (let i = 0; i < 3; i++) star(SW/2 + 44 - i * 44, 244, 22, i < stars ? P.gold : 'rgba(47,36,24,.14)');

  text('با سودت چه می‌خری؟', SW/2, 306, { size: 20, color: P.ink, family: 'Lalezar' });
  for (let i = 0; i < UPGRADES.length; i++) {
    const u = UPGRADES[i], r = upRect(i);
    const owned = S.upgrades.includes(u.id);
    const can = !owned && S.cash >= u.cost;
    const hot = S.hover && S.hover.up === i && can;
    ctx.fillStyle = owned ? 'rgba(111,154,82,.18)' : hot ? 'rgba(216,168,72,.24)' : 'rgba(120,96,60,.08)';
    wobbleRect(r.x, r.y, r.w, r.h, 10, i * 9, 1.4);
    ctx.fill();
    ctx.globalAlpha = can || owned ? 1 : .45;
    text(u.name, r.x + r.w - 24, r.y + 24, { size: 21, color: P.ink, align: 'right' });
    text(u.desc, r.x + r.w - 24, r.y + 50, { size: 15, color: P.inkSoft, align: 'right' });
    text(owned ? 'خریده‌ای ✓' : `${fa(u.cost)} تومان`, r.x + 24, r.y + r.h/2,
      { size: 18, color: owned ? P.good : P.gold, family: 'Lalezar', align: 'left' });
    ctx.globalAlpha = 1;
  }
  button(BTN_OPEN, win ? `روزِ ${fa(S.day + 1)}` : 'دوباره', {
    hot: S.hover === BTN_OPEN, fill: P.good, hotFill: '#7fae5e', size: 26,
  });
}

function drawClosed() {
  overlay({
    t: S.phaseT, title: 'دکّه تعطیل شد',
    body: `سه مشتری منتظر ماندند و رفتند.\nامتیازت: ${fa(S.score)}`,
    btn: BTN_OPEN, btnLabel: 'از اوّل', btnHot: S.hover === BTN_OPEN,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.good, btnHotFill: '#7fae5e',
  });
}

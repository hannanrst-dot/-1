/**
 * آزمایشگاه آهن‌ربا — علوم سوم، درس ۱۰ (آهن‌ربا در زندگی)
 * ────────────────────────────────────────────────────────
 * سه ایستگاه، هر کدام روی یک مفهوم اصلی درس:
 *   ۱) آهن‌ربا فقط بعضی مواد را می‌کشد → بچه با آهن‌ربا «جارو» می‌کند و
 *      دفترچه‌ی آزمایش خودش پر می‌شود. هیچ سؤال تستی در کار نیست.
 *   ۲) هر آهن‌ربا دو قطب دارد؛ هم‌نام‌ها همدیگر را می‌رانند → بچه باید یک بار
 *      دو آهن‌ربا را بچسباند و یک بار فقط با نیروی دفع، آهن‌ربای دوم را هُل بدهد.
 *   ۳) دور آهن‌ربا میدان نامرئی هست → بچه براده‌ی آهن می‌پاشد و شکل میدان
 *      جلوی چشمش ساخته می‌شود؛ قطب‌نماها هم می‌چرخند.
 *
 * فیزیک با تقریب «دو تک‌قطبِ روبه‌رو» حساب می‌شود: برای این سن هم درست است
 * هم شکل میدانِ حاصل دقیقاً همان چیزی است که در آزمایش براده‌ی آهن می‌بینند.
 */

import {
  faNum, clamp, lerp, rand, randInt, shuffle, Loop, Particles, fitCanvas,
  sfx, setHint, toast, celebrate, store,
} from '/assets/js/engine.js';

/* ═══ اشیای ایستگاه ۱ ═══════════════════════════════════════════ */

const THINGS = [
  { name: 'پیچ آهنی',      icon: '🔩', magnetic: true  },
  { name: 'گیره‌ی کاغذ',    icon: '📎', magnetic: true  },
  { name: 'قیچی',          icon: '✂️', magnetic: true  },
  { name: 'پیچ‌گوشتی',      icon: '🪛', magnetic: true  },
  { name: 'چکش',           icon: '🔨', magnetic: true  },
  { name: 'مداد چوبی',     icon: '✏️', magnetic: false },
  { name: 'لیوان پلاستیکی', icon: '🥤', magnetic: false },
  { name: 'برگ کاغذ',      icon: '📄', magnetic: false },
  { name: 'اسفنج',         icon: '🧽', magnetic: false },
  { name: 'تکه چوب',       icon: '🪵', magnetic: false },
];

/* ═══ وضعیت ═════════════════════════════════════════════════════ */

const saved = store.get('magnet-lab', { stars: 0, unlocked: 0 });

const S = {
  station: 0,
  unlocked: saved.unlocked || 0,
  stars: saved.stars || 0,
  // آهن‌ربای اصلی (در دست بچه)
  A: { x: 0, y: 0, ang: 0, L: 118, held: false },
  // آهن‌ربای دوم (فقط ایستگاه ۲) — جسم صلبی که نیرو و گشتاور می‌گیرد
  B: { x: 0, y: 0, ang: 0, L: 118, vx: 0, vy: 0, va: 0 },
  things: [],
  tested: [],       // { name, magnetic }
  filings: [],      // { x, y, a } براده‌های آهن
  compasses: [],
  poleTaskDone: [false, false],
  railed: false,      // مرحله‌ی دوم: آهن‌ربای آبی روی ریل می‌نشیند
  railY: 0,
  pushLineX: 0,
  done: [false, false, false],
  flipCd: 0,
};

const $ = (id) => document.getElementById(id);
const cv = $('cv');
const parts = new Particles(cv);
let ctx, W, H;

function resize() {
  const r = fitCanvas(cv);
  ctx = r.ctx; W = r.w; H = r.h;
  if (!S.things.length) setupStation(0);
}
new ResizeObserver(resize).observe(cv.parentElement);
resize();

/* ═══ ریاضیِ میدان ══════════════════════════════════════════════ */

/** دو قطب یک آهن‌ربا: N با بار ‎+1‎ و S با بار ‎−1‎. */
function poles(m) {
  const hx = Math.cos(m.ang) * m.L / 2;
  const hy = Math.sin(m.ang) * m.L / 2;
  return [
    { x: m.x + hx, y: m.y + hy, q: +1 },   // N
    { x: m.x - hx, y: m.y - hy, q: -1 },   // S
  ];
}

/** میدان در نقطه‌ی (x,y) از مجموع آهن‌رباهای فعال. */
function fieldAt(x, y, magnets) {
  let bx = 0, by = 0;
  for (const m of magnets) {
    for (const p of poles(m)) {
      const dx = x - p.x, dy = y - p.y;
      const r2 = Math.max(dx * dx + dy * dy, 120);
      const r = Math.sqrt(r2);
      const k = (p.q * 9000) / (r2 * r);
      bx += k * dx; by += k * dy;
    }
  }
  return { x: bx, y: by, mag: Math.hypot(bx, by) };
}

const activeMagnets = () => (S.station === 1 ? [S.A, S.B] : [S.A]);

/* ═══ چیدن ایستگاه‌ها ══════════════════════════════════════════ */

function setupStation(i) {
  S.station = i;
  S.A = { x: W * 0.5, y: Math.min(H * 0.80, H - 78), ang: 0, L: clamp(W * 0.16, 78, 118), held: false };
  S.things = [];
  S.filings = [];
  S.compasses = [];
  parts.clear();

  document.querySelectorAll('[data-st]').forEach((b) => {
    b.setAttribute('aria-current', String(+b.dataset.st === i));
    b.disabled = +b.dataset.st > S.unlocked;
  });
  $('bookCard').hidden = i !== 0;

  if (i === 0) {
    S.tested = [];
    renderBook();
    const pool = shuffle(THINGS.slice());
    pool.forEach((t, k) => {
      const col = k % 5, row = Math.floor(k / 5);
      S.things.push({
        ...t,
        x: W * (0.13 + col * 0.185) + rand(18, -18),
        y: H * (0.22 + row * 0.24) + rand(14, -14),
        vx: 0, vy: 0, stuck: false, seen: false, wobble: rand(Math.PI * 2),
      });
    });
    setTask('ایستگاه ۱ — آهن‌ربا چه چیزهایی را می‌کشد؟',
      'آهن‌ربا را روی هر وسیله ببر و ببین چه می‌شود. دفترچه‌ی کنار صفحه خودش پر می‌شود.');
    setHint('آهن‌ربا را بکش و <b>نزدیک</b> وسیله‌ها ببر. لازم نیست به آن‌ها بخوری!');
  }

  if (i === 1) {
    S.B = { x: W * 0.5, y: H * 0.4, ang: Math.PI, L: S.A.L, vx: 0, vy: 0, va: 0 };
    S.A.x = W * 0.5; S.A.y = Math.min(H * 0.80, H - 78);
    S.poleTaskDone = [false, false];
    S.railed = false;
    S.pushLineX = W * 0.18;
    setTask('ایستگاه ۲ — دو قطب، دو رفتار',
      'اول دو آهن‌ربا را به هم بچسبان. بعد بدون دست‌زدن، فقط با نیروی دفع، آهن‌ربای آبی را از خط رد کن.');
    setHint('آهن‌ربا را بچرخان: با <b>دو انگشت</b> یا کلید‌های <b>→ ←</b> یا دکمه‌ی چرخش.');
  }

  if (i === 2) {
    S.A.x = W * 0.5; S.A.y = H * 0.5;
    S.compasses = [
      { x: W * 0.22, y: H * 0.25, a: 0 },
      { x: W * 0.78, y: H * 0.25, a: 0 },
      { x: W * 0.22, y: H * 0.75, a: 0 },
      { x: W * 0.78, y: H * 0.75, a: 0 },
    ];
    setTask('ایستگاه ۳ — میدان نامرئی',
      'روی صفحه انگشت بکش تا براده‌ی آهن بپاشی. ببین براده‌ها خودشان شکل نیروی آهن‌ربا را می‌کشند.');
    setHint('روی صفحه <b>بکش</b> تا براده بریزد. آهن‌ربا را هم جابه‌جا کن و تفاوت را ببین.');
  }

  updateBar();
}

function setTask(title, text) {
  $('taskTitle').textContent = title;
  $('taskText').textContent = text;
}

function updateBar() {
  const p = (S.done.filter(Boolean).length / 3) * 100;
  $('bar').style.width = `${p}%`;
  $('stars').textContent = faNum(S.stars);
}

/* ═══ دفترچه‌ی آزمایش ═══════════════════════════════════════════ */

function renderBook() {
  const yes = S.tested.filter((t) => t.magnetic);
  const no = S.tested.filter((t) => !t.magnetic);
  const fill = (el, arr) => {
    el.innerHTML = arr.length
      ? arr.map((t) => `<div class="book__item">${t.icon} ${t.name}</div>`).join('')
      : '<div class="book__empty">هنوز خالی</div>';
  };
  fill($('listYes'), yes);
  fill($('listNo'), no);
}

function recordThing(t) {
  if (t.seen) return;
  t.seen = true;
  S.tested.push(t);
  renderBook();
  t.magnetic ? sfx.pick() : sfx.click();
  setHint(t.magnetic
    ? `<b>${t.name}</b> از جنس <b>آهن</b> است ← آهن‌ربا آن را می‌کشد.`
    : `<b>${t.name}</b> آهنی نیست ← آهن‌ربا کاری با آن ندارد.`);

  if (S.tested.length === THINGS.length && !S.done[0]) finishStation(0);
}

/* ═══ ورودی کاربر ══════════════════════════════════════════════ */

let pointer = { x: 0, y: 0, down: false };

function toCanvas(e) {
  const r = cv.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

cv.addEventListener('pointerdown', (e) => {
  cv.setPointerCapture(e.pointerId);
  const p = toCanvas(e);
  pointer = { ...p, down: true };
  if (S.station === 2) { sprinkle(p.x, p.y); return; }
  if (Math.hypot(p.x - S.A.x, p.y - S.A.y) < S.A.L * 0.85) {
    S.A.held = true;
    sfx.click();
  }
});

cv.addEventListener('pointermove', (e) => {
  const p = toCanvas(e);
  if (S.station === 2 && pointer.down) sprinkle(p.x, p.y);
  if (S.A.held) {
    S.A.x = clamp(p.x, 30, W - 30);
    S.A.y = clamp(p.y, 30, H - 30);
  }
  pointer.x = p.x; pointer.y = p.y;
});

const release = () => { S.A.held = false; pointer.down = false; };
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);

// چرخاندن آهن‌ربا: کلیدهای جهت، چرخ ماوس، یا دکمه‌ی روی صفحه
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') S.A.ang += 0.16;
  if (e.key === 'ArrowLeft') S.A.ang -= 0.16;
  if (e.key === ' ') { S.A.ang += Math.PI; sfx.pop(); e.preventDefault(); }
});
cv.addEventListener('wheel', (e) => { S.A.ang += Math.sign(e.deltaY) * 0.12; e.preventDefault(); }, { passive: false });

document.querySelectorAll('[data-st]').forEach((b) => {
  b.addEventListener('click', () => setupStation(+b.dataset.st));
});
$('reset').addEventListener('click', () => { setupStation(S.station); sfx.whoosh(); });

// چرخاندن آهن‌ربا با دکمه — روی تبلت و موبایل صفحه‌کلید و چرخ ماوس نداریم.
let spinHold = null;
const spin = (d) => { S.A.ang += d; };
for (const [id, d] of [['rotL', -0.11], ['rotR', 0.11]]) {
  const el = $(id);
  const start = (e) => { e.preventDefault(); spin(d); spinHold = setInterval(() => spin(d), 55); };
  const stop = () => { clearInterval(spinHold); spinHold = null; };
  el.addEventListener('pointerdown', start);
  el.addEventListener('pointerup', stop);
  el.addEventListener('pointerleave', stop);
  el.addEventListener('pointercancel', stop);
}
$('flip').addEventListener('click', () => {
  S.A.ang += Math.PI;
  sfx.pop();
  setHint('آهن‌ربا برعکس شد: حالا قطبی که روبه‌رو بود، عوض شده.');
});

function sprinkle(x, y) {
  if (S.filings.length > 1400) return;
  for (let i = 0; i < 5; i++) {
    S.filings.push({ x: x + rand(26, -26), y: y + rand(26, -26), a: rand(Math.PI) });
  }
  if (S.filings.length > 620 && !S.done[2]) finishStation(2);
}

/* ═══ پایان هر ایستگاه ═════════════════════════════════════════ */

function finishStation(i) {
  if (S.done[i]) return;
  S.done[i] = true;
  S.stars++;
  S.unlocked = Math.max(S.unlocked, Math.min(i + 1, 2));
  store.set('magnet-lab', { stars: S.stars, unlocked: S.unlocked });
  updateBar();
  parts.confetti(W / 2, H / 2, 70);

  const texts = [
    { emoji: '🔎', title: 'دفترچه‌ات کامل شد!',
      body: 'همه‌ی چیزهایی که چسبیدند از جنس <b>آهن</b> بودند. چوب، کاغذ، پلاستیک و اسفنج آهنی نیستند، برای همین آهن‌ربا کاری با آن‌ها ندارد.' },
    { emoji: '🧲', title: 'قطب‌ها را کشف کردی!',
      body: 'قطب‌های <b>ناهم‌نام</b> (N و S) همدیگر را می‌کشند، ولی قطب‌های <b>هم‌نام</b> (N و N) همدیگر را می‌رانند — بدون اینکه به هم بخورند!' },
    { emoji: '✨', title: 'میدان را دیدی!',
      body: 'براده‌ها روی خط‌هایی نشستند که از یک قطب بیرون می‌آیند و به قطب دیگر می‌رسند. نزدیک قطب‌ها این خط‌ها <b>فشرده‌ترند</b>، چون نیرو آنجا قوی‌تر است.' },
  ][i];

  setTimeout(() => celebrate({
    ...texts,
    buttonText: i < 2 ? 'ایستگاه بعدی' : 'پایان',
    onNext: () => {
      if (i < 2) setupStation(i + 1);
      else celebrate({
        emoji: '🏆', title: 'دانشمند آهن‌ربا شدی!',
        body: `هر سه ایستگاه را تمام کردی و <b>${faNum(S.stars)}</b> ستاره گرفتی.`,
        buttonText: 'از اول', onNext: () => { S.done = [false, false, false]; setupStation(0); },
      });
    },
  }), 500);
}

/* ═══ حلقه‌ی شبیه‌سازی ══════════════════════════════════════════ */

function tick(dt) {
  if (S.flipCd > 0) S.flipCd -= dt;
  if (S.station === 0) stepThings(dt);
  if (S.station === 1) stepSecondMagnet(dt);
  if (S.station === 2) stepFilings(dt);
  stepCompasses(dt);
  parts.update(dt);
  draw();
}

/** اشیای آهنی به سمت نزدیک‌ترین قطب کشیده می‌شوند و می‌چسبند. */
function stepThings(dt) {
  const ps = poles(S.A);
  for (const t of S.things) {
    t.wobble += dt * 3;

    if (!t.magnetic) {
      // فقط برای بازخورد: اگر آهن‌ربا خیلی نزدیک شد، ثبت می‌شود ولی تکان نمی‌خورد
      if (Math.hypot(t.x - S.A.x, t.y - S.A.y) < S.A.L * 0.62) recordThing(t);
      continue;
    }

    if (t.stuck) {
      // چسبیده به قطب: با آهن‌ربا حرکت می‌کند
      const p = ps[t.stuckPole];
      t.x = p.x + Math.cos(S.A.ang) * t.stuckOff * (t.stuckPole ? -1 : 1);
      t.y = p.y + Math.sin(S.A.ang) * t.stuckOff * (t.stuckPole ? -1 : 1);
      continue;
    }

    let fx = 0, fy = 0, nearest = 1e9, ni = 0;
    ps.forEach((p, i) => {
      const dx = p.x - t.x, dy = p.y - t.y;
      const r = Math.max(Math.hypot(dx, dy), 12);
      if (r < nearest) { nearest = r; ni = i; }
      const f = 260000 / (r * r);            // جذب به هر دو قطب (رفتار مادّه‌ی آهنی)
      fx += (dx / r) * f; fy += (dy / r) * f;
    });

    if (nearest < 240) {
      recordThing(t);
      t.vx += fx * dt; t.vy += fy * dt;
    }
    t.vx *= 0.90; t.vy *= 0.90;             // اصطکاک میز
    t.x += t.vx * dt; t.y += t.vy * dt;

    if (nearest < 26) {
      t.stuck = true;
      t.stuckPole = ni;
      t.stuckOff = rand(22, 8);
      t.vx = t.vy = 0;
      sfx.drop();
      parts.sparkle(t.x, t.y, 12, '#eb3b5a');
    }
  }
}

/** آهن‌ربای دوم: جسم صلبی که از هر چهار جفتِ قطب نیرو و گشتاور می‌گیرد.
 *  همین گشتاور است که باعث می‌شود آهن‌ربا خودش بچرخد تا قطب ناهم‌نام روبه‌رو شود —
 *  همان کاری که دو آهن‌ربای واقعی روی میز می‌کنند. */
const K_POLE = 3.2e6;   // ثابت نیروی بین دو قطب

function stepSecondMagnet(dt) {
  const pa = poles(S.A), pb = poles(S.B);
  let fx = 0, fy = 0, torque = 0;

  for (const a of pa) {
    for (const b of pb) {
      const dx = b.x - a.x, dy = b.y - a.y;
      const r = Math.max(Math.hypot(dx, dy), 30);
      const f = (a.q * b.q * K_POLE) / (r * r);   // هم‌علامت ⇒ مثبت ⇒ دفع
      const Fx = (dx / r) * f, Fy = (dy / r) * f;
      fx += Fx; fy += Fy;
      const rx = b.x - S.B.x, ry = b.y - S.B.y;   // بازوی گشتاور حول مرکز B
      torque += rx * Fy - ry * Fx;
    }
  }

  const I = (S.B.L * S.B.L) / 6;                  // ممان اینرسی تقریبی میله
  const linDamp = Math.pow(0.02, dt);             // میرایی: انگار روی میز سُر می‌خورد
  const angDamp = Math.pow(0.004, dt);

  S.B.vx = (S.B.vx + fx * dt) * linDamp;
  S.B.vy = (S.B.vy + fy * dt) * linDamp;
  S.B.va = (S.B.va + (torque / I) * dt) * angDamp;

  S.B.x = clamp(S.B.x + S.B.vx * dt, 40, W - 40);
  S.B.y = clamp(S.B.y + S.B.vy * dt, 40, H - 40);
  S.B.ang += S.B.va * dt;

  if (S.railed) {                 // روی ریل فقط سُر می‌خورد؛ نمی‌چرخد و بالا/پایین نمی‌رود
    S.B.ang = Math.PI;
    S.B.va = 0;
    S.B.vy = 0;
    S.B.y = S.railY;
  }

  resolveContact();

  if (S.railed) { S.B.y = S.railY; }

  const gap = Math.hypot(S.B.x - S.A.x, S.B.y - S.A.y);
  const speed = Math.hypot(S.B.vx, S.B.vy);

  // مأموریت الف: دو آهن‌ربا به هم بچسبند (یعنی نزدیک و آرام)
  if (!S.poleTaskDone[0] && gap < S.A.L * 1.05 && speed < 26) {
    S.poleTaskDone[0] = true;
    sfx.good();
    toast('چسبیدند! قطب N به قطب S', 'ok');
    parts.ring((S.A.x + S.B.x) / 2, (S.A.y + S.B.y) / 2, '#20bf6b', 110);
    // مثل آزمایش واقعی کلاس، آهن‌ربای دوم را روی ریل می‌گذاریم تا نچرخد
    S.railed = true;
    S.railY = clamp(S.B.y, 90, H - 90);
    S.B.ang = Math.PI;
    S.B.vx = S.B.vy = S.B.va = 0;
    setTask('ایستگاه ۲ — حالا نوبت دفع است',
      'آهن‌ربای آبی روی ریل نشست و دیگر نمی‌چرخد. آهن‌ربای قرمز را از سمت راست به آن نزدیک کن و بدون دست‌زدن، از خط پایان ردش کن.');
    setHint('اگر آبی به‌جای دورشدن <b>جذب</b> شد، یعنی قطب اشتباه روبه‌رو است — با دکمه‌ی <b>🔄 برعکسش کن</b> امتحان کن.');
  }

  // مأموریت ب: فقط با نیروی دفع، آهن‌ربای آبی را از خط پایان رد کن
  if (S.poleTaskDone[0] && !S.poleTaskDone[1] && S.B.x < S.pushLineX) {
    S.poleTaskDone[1] = true;
    finishStation(1);
  }
}

/** دو آهن‌ربای واقعی از داخل هم رد نمی‌شوند: هیچ دو قطبی نباید
 *  از ضخامت میله به هم نزدیک‌تر شوند. همین قید ساده باعث می‌شود
 *  وقتی جذب می‌کنند، پهلو‌به‌پهلو یا سربه‌سر «بچسبند» و بایستند. */
const MIN_POLE_GAP = 36;

function resolveContact() {
  for (let pass = 0; pass < 3; pass++) {
    let hit = false;
    for (const a of poles(S.A)) {
      for (const b of poles(S.B)) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const r = Math.hypot(dx, dy) || 0.001;
        if (r >= MIN_POLE_GAP) continue;
        hit = true;
        const ux = dx / r, uy = dy / r;
        const push = MIN_POLE_GAP - r;
        S.B.x = clamp(S.B.x + ux * push, 40, W - 40);
        S.B.y = clamp(S.B.y + uy * push, 40, H - 40);
        // سرعت در راستای برخورد گرفته می‌شود (برخورد نرم، بدون جهیدن)
        const vn = S.B.vx * ux + S.B.vy * uy;
        if (vn < 0) { S.B.vx -= vn * ux; S.B.vy -= vn * uy; }
      }
    }
    if (!hit) break;
  }
}

/** براده‌ها به‌آرامی روی راستای میدان می‌چرخند. */
function stepFilings(dt) {
  const ms = activeMagnets();
  for (const f of S.filings) {
    const b = fieldAt(f.x, f.y, ms);
    if (b.mag < 1e-4) continue;
    const target = Math.atan2(b.y, b.x);
    let d = target - f.a;
    while (d > Math.PI / 2) d -= Math.PI;      // راستا مهم است، نه جهت
    while (d < -Math.PI / 2) d += Math.PI;
    f.a += d * clamp(dt * 6, 0, 1);
  }
}

function stepCompasses(dt) {
  const ms = activeMagnets();
  for (const c of S.compasses) {
    const b = fieldAt(c.x, c.y, ms);
    const target = Math.atan2(b.y, b.x);
    let d = target - c.a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    c.a += d * clamp(dt * 5, 0, 1);
  }
}

/* ═══ ترسیم ════════════════════════════════════════════════════ */

function draw() {
  if (W < 40 || H < 40) return;                    // بوم هنوز اندازه نگرفته
  // میز آزمایشگاه
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, '#f2f6ff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (S.station === 2) drawFieldGlow();
  if (S.station === 1) drawPushLine();
  if (S.station === 2) drawFilings();

  for (const c of S.compasses) drawCompass(c);
  if (S.station === 0) for (const t of S.things) drawThing(t);
  if (S.station === 1) drawMagnet(S.B, '#3867d6', true);
  drawMagnet(S.A, '#eb3b5a', false);
  parts.draw();
}

function drawFieldGlow() {
  const ps = poles(S.A);
  for (const p of ps) {
    const g = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, 130);
    g.addColorStop(0, p.q > 0 ? 'rgba(235,59,90,.16)' : 'rgba(56,103,214,.16)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 130, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFilings() {
  const ms = activeMagnets();
  ctx.lineCap = 'round';
  for (const f of S.filings) {
    const b = fieldAt(f.x, f.y, ms);
    const s = clamp(b.mag * 260, 0.12, 1);
    ctx.strokeStyle = `rgba(45,58,92,${0.22 + s * 0.62})`;
    ctx.lineWidth = 1 + s * 1.6;
    const L = 4 + s * 5;
    ctx.beginPath();
    ctx.moveTo(f.x - Math.cos(f.a) * L, f.y - Math.sin(f.a) * L);
    ctx.lineTo(f.x + Math.cos(f.a) * L, f.y + Math.sin(f.a) * L);
    ctx.stroke();
  }
}

function drawPushLine() {
  if (S.railed) {                       // ریل افقی زیر آهن‌ربای آبی
    ctx.save();
    ctx.strokeStyle = '#dfe7f7';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(30, S.railY + 26);
    ctx.lineTo(W - 30, S.railY + 26);
    ctx.stroke();
    ctx.strokeStyle = '#c6d0e6';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = S.poleTaskDone[0] ? '#20bf6b' : '#c6d0e6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(S.pushLineX, 20);
  ctx.lineTo(S.pushLineX, H - 20);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = S.poleTaskDone[0] ? '#20bf6b' : '#9fb0d6';
  ctx.font = '800 14px Vazirmatn, Tahoma, sans-serif';
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(S.pushLineX - 16, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('خط پایان', 0, 0);
  ctx.restore();
  ctx.restore();
}

function drawThing(t) {
  ctx.save();
  ctx.translate(t.x, t.y);
  if (!t.stuck) ctx.rotate(Math.sin(t.wobble) * 0.05);
  // سایه‌ی کوچک روی میز
  ctx.fillStyle = 'rgba(23,34,77,.07)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // دیسک روشن پشت آیکن تا روی هر پس‌زمینه‌ای خوانا بماند
  ctx.fillStyle = t.stuck ? 'rgba(235,59,90,.14)' : '#ffffff';
  ctx.strokeStyle = t.seen ? (t.magnetic ? 'rgba(32,191,107,.55)' : 'rgba(159,176,214,.5)') : '#e6ecf9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = '30px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(t.icon, 0, 0);
  if (t.seen) {
    ctx.font = '800 11px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = t.magnetic ? '#20bf6b' : '#9fb0d6';
    ctx.fillText(t.name, 0, 30);
  }
  ctx.restore();
}

function drawCompass(c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#c6d0e6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.rotate(c.a);
  ctx.fillStyle = '#eb3b5a';                 // نیم‌سوزنِ رو به شمالِ میدان
  ctx.beginPath();
  ctx.moveTo(17, 0); ctx.lineTo(-3, -5); ctx.lineTo(-3, 5);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3867d6';
  ctx.beginPath();
  ctx.moveTo(-17, 0); ctx.lineTo(3, -5); ctx.lineTo(3, 5);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawMagnet(m, tint, isSecond) {
  const w = m.L, h = 34;
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.ang);

  ctx.fillStyle = 'rgba(23,34,77,.12)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.85, w * 0.5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // قرارداد ثابت در کل بازی: قطب N قرمز، قطب S آبی — برای هر دو آهن‌ربا یکسان،
  // وگرنه بچه رنگ را با «کدام آهن‌ربا» اشتباه می‌گیرد نه با «کدام قطب».
  ctx.fillStyle = '#eb3b5a';                     // نیمه‌ی N (راست)
  ctx.fillRect(0, -h / 2, w / 2, h);
  ctx.fillStyle = '#3867d6';                     // نیمه‌ی S (چپ)
  ctx.fillRect(-w / 2, -h / 2, w / 2, h);

  // آهن‌ربای دوم با قاب تیره و خط‌چین از آهن‌ربای دستِ بچه جدا می‌شود
  ctx.strokeStyle = isSecond ? '#17224d' : 'rgba(255,255,255,.9)';
  ctx.lineWidth = isSecond ? 3 : 2;
  if (isSecond) ctx.setLineDash([7, 5]);
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.setLineDash([]);

  ctx.fillStyle = '#fff';
  ctx.font = '900 17px Vazirmatn, Tahoma, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.save(); ctx.translate(w * 0.25, 0); ctx.rotate(-m.ang); ctx.fillText('N', 0, 0); ctx.restore();
  ctx.save(); ctx.translate(-w * 0.25, 0); ctx.rotate(-m.ang); ctx.fillText('S', 0, 0); ctx.restore();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#9fb0d6';
  ctx.font = '700 12px Vazirmatn, Tahoma, sans-serif';
  ctx.textAlign = 'center';
  if (isSecond) ctx.fillText('آهن‌ربای دوم', m.x, m.y + 38);
  else if (!m.held && S.station !== 2) ctx.fillText('↔ مرا بکش', m.x, m.y + 38);
  ctx.restore();
}

/* ═══ راه‌اندازی ═══════════════════════════════════════════════ */

setupStation(0);
new Loop(tick).start();

// قلاب کوچک برای تست خودکار و برای معلمی که می‌خواهد مستقیم به یک ایستگاه برود.
window.__lab = { S, go: setupStation };

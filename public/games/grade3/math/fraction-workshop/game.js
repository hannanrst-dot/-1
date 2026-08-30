/**
 * کارگاه کسر — ریاضی سوم، فصل ۳ (عددهای کسری)
 * ────────────────────────────────────────────
 * ایده‌ی آموزشی: کسر یک «دستور کار» است، نه دو عدد روی هم.
 *   مخرج  = پیتزا را به چند قسمت مساوی بریدیم؟   → بچه با چاقو انتخاب می‌کند
 *   صورت  = چند تا از آن قسمت‌ها را برداشتیم؟    → بچه با دست برمی‌دارد
 * محور اعداد پایین صفحه هم‌زمان نشان می‌دهد این کسر کجای بین ۰ و ۱ می‌نشیند،
 * و همین باعث می‌شود کسرهای مساوی (۱/۲ و ۳/۶) خودشان را لو بدهند.
 */

import {
  faNum, clamp, lerp, ease, rand, Loop, Particles, fitCanvas,
  sfx, setHint, toast, celebrate, store,
} from '/assets/js/engine.js';

/* ═══ سفارش‌ها ═══════════════════════════════════════════════════
   fixedDen ≠ null یعنی پیتزا از قبل بریده شده و بچه باید کسر مساوی
   را خودش کشف کند (مثلاً «نصف» از پیتزای ۶ قسمتی = ۳ قسمت).       */

const ORDERS = [
  { num: 1, den: 2, fixedDen: null, showFraction: true,
    say: 'سلام! من <b>نصفِ</b> یک پیتزا می‌خوام.' },
  { num: 3, den: 4, fixedDen: null, showFraction: true,
    say: 'برای من <b>سه تا از چهار قسمت</b> مساوی بذار.' },
  { num: 2, den: 3, fixedDen: null, showFraction: true,
    say: 'پیتزا رو به <b>سه قسمت مساوی</b> ببُر و <b>دو تاش</b> رو بده.' },
  { num: 5, den: 8, fixedDen: null, showFraction: true,
    say: 'من گرسنه‌ام! <b>پنج تا از هشت قسمت</b> لطفاً.' },
  { num: 1, den: 2, fixedDen: 6, showFraction: false,
    say: 'من <b>نصفِ</b> پیتزا می‌خوام… ولی این پیتزا از قبل به ۶ قسمت بریده شده!' },
  { num: 1, den: 3, fixedDen: 6, showFraction: false,
    say: 'من <b>یک‌سومِ</b> پیتزا می‌خوام. این هم که ۶ قسمتیه…' },
  { num: 3, den: 4, fixedDen: 8, showFraction: false,
    say: 'من <b>سه‌چهارمِ</b> پیتزا می‌خوام، از همین پیتزای ۸ قسمتی.' },
  { num: 2, den: 5, fixedDen: null, showFraction: true,
    say: 'آخرین سفارش: <b>دو تا از پنج قسمت</b> مساوی.' },
];

const FACES = ['🙂', '😀', '🤗', '😋', '🧒', '👦', '👧', '🐻'];

/* ═══ وضعیت بازی ════════════════════════════════════════════════ */

const saved = store.get('fraction-workshop', { stars: 0, best: 0 });

const S = {
  level: 0,
  den: 4,
  slices: [],      // { fly: 0..1 ، هدف: 0 روی پیتزا / 1 روی بشقاب }
  target: [],      // مقدار هدف هر برش
  cutAnim: 1,      // پیشرفت انیمیشن برش‌خوردن
  hover: -1,
  stars: saved.stars || 0,
  marker: 0,       // موقعیت نرم نشانگر روی محور اعداد
  toppings: [],
  shakeT: 0,
  solved: false,
};

/* ═══ عناصر صفحه ════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);
const cv = $('cv');
const parts = new Particles(cv);
let ctx, W, H;

/* ═══ راه‌اندازی ════════════════════════════════════════════════ */

function resize() {
  const r = fitCanvas(cv);
  ctx = r.ctx; W = r.w; H = r.h;
}
new ResizeObserver(resize).observe(cv.parentElement);
resize();

$('lvlTotal').textContent = faNum(ORDERS.length);
$('stars').textContent = faNum(S.stars);

$('more').addEventListener('click', () => changeDen(+1));
$('less').addEventListener('click', () => changeDen(-1));
$('reset').addEventListener('click', () => { returnAll(); sfx.whoosh(); });
$('deliver').addEventListener('click', deliver);
cv.addEventListener('pointerdown', onTap);
cv.addEventListener('pointermove', onHover);
cv.addEventListener('pointerleave', () => { S.hover = -1; });

/* ═══ منطق ══════════════════════════════════════════════════════ */

function loadLevel(i) {
  S.level = i;
  S.solved = false;
  const o = ORDERS[i];
  setDen(o.fixedDen ?? 4, true);
  renderOrder(o);
  $('lvl').textContent = faNum(i + 1);
  $('bar').style.width = `${(i / ORDERS.length) * 100}%`;
  $('face').textContent = FACES[i % FACES.length];
  $('face').className = 'customer__face';
  const locked = o.fixedDen != null;
  $('lockNote').hidden = !locked;
  $('more').disabled = locked;
  $('less').disabled = locked;
  setHint(locked
    ? 'این پیتزا از قبل بریده شده. ببین <b>چند قسمت</b> از آن همان مقدار خواسته‌شده می‌شود.'
    : 'اول با <b>+</b> و <b>−</b> تعداد قسمت‌ها را درست کن، بعد قسمت‌ها را بردار.');
}

function renderOrder(o) {
  const frac = o.showFraction
    ? `<span class="want"><span>${faNum(o.num)}</span><span class="want__bar"></span><span>${faNum(o.den)}</span></span>`
    : miniPie(o.num, o.den);
  $('order').innerHTML = `${o.say}<div style="margin-top:10px">${frac}</div>`;
}

/** یک دایره‌ی کوچک SVG که مقدار خواسته‌شده را رنگی نشان می‌دهد. */
function miniPie(num, den) {
  const R = 34, C = 40;
  let d = '';
  for (let i = 0; i < num; i++) {
    const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / den;
    const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / den;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    d += `M${C},${C} L${C + R * Math.cos(a0)},${C + R * Math.sin(a0)} `
       + `A${R},${R} 0 ${large} 1 ${C + R * Math.cos(a1)},${C + R * Math.sin(a1)} Z `;
  }
  const lines = Array.from({ length: den }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / den;
    return `<line x1="${C}" y1="${C}" x2="${C + R * Math.cos(a)}" y2="${C + R * Math.sin(a)}" stroke="#fff" stroke-width="2"/>`;
  }).join('');
  return `<svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="${C}" cy="${C}" r="${R}" fill="#f0e2c8" stroke="#d9b98a" stroke-width="3"/>
    <path d="${d}" fill="#fc5c9c" opacity=".85"/>${lines}</svg>`;
}

function setDen(n, silent = false) {
  S.den = clamp(n, 2, 12);
  S.slices = Array.from({ length: S.den }, () => ({ fly: 0 }));
  S.target = Array.from({ length: S.den }, () => 0);
  S.cutAnim = silent ? 1 : 0;
  S.toppings = Array.from({ length: 14 }, () => ({
    a: rand(Math.PI * 2), r: rand(0.82, 0.18), s: rand(9, 5),
  }));
  updateBuilt();
}

function changeDen(d) {
  const next = clamp(S.den + d, 2, 12);
  if (next === S.den) return;
  setDen(next);
  sfx.pop();
  $('denView').style.transform = 'scale(1.35)';
  setTimeout(() => ($('denView').style.transform = ''), 180);
  setHint(`پیتزا به <b>${faNum(next)}</b> قسمت <b>مساوی</b> بریده شد. مخرج کسر همین است.`);
}

/** چند برش روی بشقاب است؟ (اعلان تابعی است تا در زمان راه‌اندازی هم در دسترس باشد) */
function takenCount() {
  return S.target.filter((t) => t === 1).length;
}

function updateBuilt() {
  const n = takenCount();
  $('denView').textContent = faNum(S.den);
  $('denView2').textContent = faNum(S.den);
  $('numView').textContent = faNum(n);
  $('builtFrac').classList.remove('flash');
  void $('builtFrac').offsetWidth;
  $('builtFrac').classList.add('flash');
  $('builtWords').textContent = n === 0
    ? 'هنوز چیزی برنداشته‌ای'
    : `${faNum(n)} تا از ${faNum(S.den)} قسمتِ مساوی`;
}

function returnAll() {
  S.target = S.target.map(() => 0);
  updateBuilt();
}

/* ─── برخورد با اشاره‌گر ─────────────────────────────────────── */

function layout() {
  const bottom = clamp(H * 0.16, 46, 74);          // جای محور اعداد
  const cy = (H - bottom) / 2 + 6;
  // روی صفحه‌ی باریک شعاع کوچک‌تر می‌شود تا پیتزا و بشقاب روی هم نیفتند
  const R = Math.max(24, Math.min(W * 0.185, (H - bottom) * 0.40));
  return { R, bottom, pizza: { x: W * 0.71, y: cy }, plate: { x: W * 0.27, y: cy } };
}

/** برش زیر نقطه‌ی (x,y) را پیدا می‌کند؛ اگر جایی نبود ‎-1‎. */
function sliceAt(x, y) {
  const L = layout();
  for (const [where, isPlate] of [[L.pizza, false], [L.plate, true]]) {
    const dx = x - where.x, dy = y - where.y;
    if (Math.hypot(dx, dy) > L.R) continue;
    let a = Math.atan2(dy, dx) + Math.PI / 2;
    if (a < 0) a += Math.PI * 2;
    const i = Math.floor((a / (Math.PI * 2)) * S.den) % S.den;
    if (isPlate ? S.target[i] === 1 : S.target[i] === 0) return i;
  }
  return -1;
}

function toCanvas(e) {
  const r = cv.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function onHover(e) {
  const p = toCanvas(e);
  S.hover = S.cutAnim < 1 ? -1 : sliceAt(p.x, p.y);
  cv.style.cursor = S.hover >= 0 ? 'pointer' : 'default';
}

function onTap(e) {
  if (S.cutAnim < 1 || S.solved) return;
  const p = toCanvas(e);
  const i = sliceAt(p.x, p.y);
  if (i < 0) return;
  const goingToPlate = S.target[i] === 0;
  S.target[i] = goingToPlate ? 1 : 0;
  goingToPlate ? sfx.pick() : sfx.drop();
  const L = layout();
  parts.ring(goingToPlate ? L.pizza.x : L.plate.x, goingToPlate ? L.pizza.y : L.plate.y,
    goingToPlate ? '#20bf6b' : '#f7b731', L.R * 0.7);
  updateBuilt();

  const n = takenCount();
  if (n > 0) {
    setHint(`<b>${faNum(n)}</b> قسمت از <b>${faNum(S.den)}</b> قسمت روی بشقاب است ← کسر <b>${faNum(n)}/${faNum(S.den)}</b>`);
  }
}

/* ─── تحویل سفارش ──────────────────────────────────────────── */

function deliver() {
  if (S.solved) return;
  const o = ORDERS[S.level];
  const n = takenCount();
  const mine = n / S.den;
  const want = o.num / o.den;
  const face = $('face');

  if (Math.abs(mine - want) < 1e-9) {
    S.solved = true;
    const L = layout();
    parts.confetti(L.plate.x, L.plate.y, 70);
    face.className = 'customer__face happy';
    face.textContent = '😍';

    const equivalent = S.den !== o.den;
    S.stars += equivalent ? 2 : 1;
    $('stars').textContent = faNum(S.stars);
    store.set('fraction-workshop', { stars: S.stars, best: Math.max(saved.best || 0, S.level + 1) });

    const body = equivalent
      ? `تو <b>${faNum(n)}/${faNum(S.den)}</b> درست کردی و مشتری <b>${faNum(o.num)}/${faNum(o.den)}</b> می‌خواست — و این دو <b>دقیقاً یک اندازه‌اند</b>! به این‌ها می‌گویند کسرهای مساوی. ببین روی محور اعداد هم هر دو در یک نقطه‌اند.`
      : `دقیقاً همان چیزی که خواسته بود: <b>${faNum(n)}</b> قسمت از <b>${faNum(S.den)}</b> قسمتِ مساوی.`;

    setTimeout(() => celebrate({
      emoji: equivalent ? '🤯' : '🎉',
      title: equivalent ? 'کشف بزرگ!' : 'سفارش آماده شد!',
      body,
      buttonText: S.level + 1 < ORDERS.length ? 'مشتری بعدی' : 'پایان',
      onNext: () => {
        if (S.level + 1 < ORDERS.length) loadLevel(S.level + 1);
        else finish();
      },
    }), 700);
    return;
  }

  // بازخورد مهربان: کجای کار فرق دارد؟
  face.className = 'customer__face sad';
  face.textContent = '🤔';
  S.shakeT = 0.45;
  sfx.nope();
  if (n === 0) {
    toast('هنوز چیزی روی بشقاب نگذاشته‌ای', 'warn');
    setHint('روی قسمت‌های پیتزا بزن تا بیایند روی بشقاب.');
  } else if (mine < want) {
    toast('کمی کمتر از چیزی است که خواسته', 'warn');
    setHint(`نشانگر آبی روی محور اعداد <b>عقب‌تر</b> از نقطه‌ی مشتری است. یک قسمت دیگر بردار.`);
  } else {
    toast('کمی بیشتر از چیزی است که خواسته', 'warn');
    setHint(`نشانگر آبی <b>جلوتر</b> از نقطه‌ی مشتری است. یک قسمت را برگردان.`);
  }
}

function finish() {
  celebrate({
    emoji: '🏆',
    title: 'کارگاه را چرخاندی!',
    body: `همه‌ی سفارش‌ها آماده شد و <b>${faNum(S.stars)}</b> ستاره گرفتی.<br>
           حالا می‌دانی <b>مخرج</b> یعنی به چند قسمت مساوی بریده‌ایم و <b>صورت</b> یعنی چند تا برداشته‌ایم.`,
    buttonText: 'دوباره از اول',
    onNext: () => { S.stars = 0; $('stars').textContent = '۰'; loadLevel(0); },
  });
}

/* ═══ ترسیم ═════════════════════════════════════════════════════ */

function tick(dt) {
  // پیشروی انیمیشن‌ها
  if (S.cutAnim < 1) {
    S.cutAnim = clamp(S.cutAnim + dt * 1.6, 0, 1);
    if (S.cutAnim >= 1) sfx.click();
  }
  for (let i = 0; i < S.slices.length; i++) {
    const s = S.slices[i];
    s.fly += (S.target[i] - s.fly) * clamp(dt * 9, 0, 1);
  }
  const goal = takenCount() / S.den;
  S.marker += (goal - S.marker) * clamp(dt * 7, 0, 1);
  if (S.shakeT > 0) S.shakeT -= dt;
  parts.update(dt);

  draw();
}

function draw() {
  if (W < 40 || H < 40) return;                    // بوم هنوز اندازه نگرفته
  const L = layout();
  ctx.clearRect(0, 0, W, H);

  drawPlate(L);
  drawPizzaBase(L);
  drawEmptySlots(L);
  for (let i = 0; i < S.den; i++) drawSlice(L, i);
  if (S.cutAnim < 1) drawKnife(L);
  drawNumberLine(L);
  parts.draw();
}

function drawPlate(L) {
  ctx.save();
  ctx.translate(L.plate.x, L.plate.y);
  ctx.fillStyle = '#f6f8ff';
  ctx.strokeStyle = '#c9d6f2';
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 7]);
  ctx.beginPath();
  ctx.arc(0, 0, L.R * 1.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  if (H > 330) {                                   // روی صفحه‌ی کوتاه جا نمی‌شود
    ctx.fillStyle = '#9fb0d6';
    ctx.font = '700 15px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('بشقاب مشتری', 0, L.R * 1.14 + 26);
  }
  ctx.restore();
}

function drawPizzaBase(L) {
  const shake = S.shakeT > 0 ? Math.sin(S.shakeT * 60) * 5 : 0;
  ctx.save();
  ctx.translate(L.pizza.x + shake, L.pizza.y);
  ctx.fillStyle = '#e8d3aa';               // خمیر بیرونی
  ctx.beginPath();
  ctx.arc(0, 0, L.R * 1.06, 0, Math.PI * 2);
  ctx.fill();
  if (H > 330) {
    ctx.fillStyle = '#9fb0d6';
    ctx.font = '700 15px Vazirmatn, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('پیتزای کامل (یک واحد)', 0, L.R * 1.06 + 26);
  }
  ctx.restore();
}

/** جای خالیِ برش‌هایی که برداشته شده‌اند را خط‌چین می‌کشد
 *  تا بچه ببیند «چقدر از کل رفته و چقدر مانده». */
function drawEmptySlots(L) {
  const step = (Math.PI * 2) / S.den;
  ctx.save();
  ctx.translate(L.pizza.x, L.pizza.y);
  ctx.setLineDash([7, 6]);
  ctx.strokeStyle = 'rgba(180,150,105,.85)';
  ctx.lineWidth = 2;
  for (let i = 0; i < S.den; i++) {
    if (S.slices[i].fly < 0.12) continue;
    wedgePath(L.R, -Math.PI / 2 + i * step + 0.01, -Math.PI / 2 + (i + 1) * step - 0.01);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSlice(L, i) {
  const s = S.slices[i];
  const step = (Math.PI * 2) / S.den;
  const a0 = -Math.PI / 2 + i * step;
  const a1 = a0 + step;
  const f = ease.inOutCubic(clamp(s.fly, 0, 1));

  // مسیر پروازِ برش از پیتزا به بشقاب، با یک قوس ملایم
  const shake = S.shakeT > 0 && f < 0.5 ? Math.sin(S.shakeT * 60) * 5 : 0;
  const x = lerp(L.pizza.x + shake, L.plate.x, f);
  const y = lerp(L.pizza.y, L.plate.y, f) - Math.sin(Math.PI * f) * L.R * 0.55;
  const scale = 1 + Math.sin(Math.PI * f) * 0.12;

  // فاصله‌ی برش‌ها بعد از بریده‌شدن
  const cut = clamp(S.cutAnim * S.den - i, 0, 1);
  const gap = cut * 1.6 + (f > 0.02 ? 2 : 0);
  const mid = (a0 + a1) / 2;

  ctx.save();
  ctx.translate(x + Math.cos(mid) * gap, y + Math.sin(mid) * gap);
  ctx.scale(scale, scale);

  const isHover = S.hover === i && f < 0.5;
  if (isHover) {
    ctx.shadowColor = 'rgba(32,191,107,.65)';
    ctx.shadowBlur = 18;
  }

  // خمیر برش
  wedgePath(L.R, a0 + 0.006, a1 - 0.006);
  ctx.fillStyle = f > 0.5 ? '#f2c98f' : '#f0d9a8';
  ctx.fill();

  // سسِ روی برش
  wedgePath(L.R * 0.9, a0 + 0.012, a1 - 0.012);
  ctx.fillStyle = isHover ? '#ff8f4d' : '#ef7d3d';
  ctx.fill();

  // پنیر و پپرونی — فقط آن‌هایی که زاویه‌شان داخل همین برش می‌افتد.
  // زاویه‌ی t.a از همان مبدأیی شمرده می‌شود که برش‌ها؛ پس برشِ هر پپرونی
  // برابر است با floor(t.a / step) و با بریده‌شدنِ دوباره خودکار جابه‌جا می‌شود.
  for (const t of S.toppings) {
    if (Math.floor(t.a / step) % S.den !== i) continue;
    const ang = -Math.PI / 2 + t.a;
    const tx = Math.cos(ang) * t.r * L.R * 0.82;
    const ty = Math.sin(ang) * t.r * L.R * 0.82;
    ctx.beginPath();
    ctx.arc(tx, ty, t.s, 0, Math.PI * 2);
    ctx.fillStyle = '#c0392b';
    ctx.fill();
  }

  // خط برش
  ctx.strokeStyle = 'rgba(255,255,255,.95)';
  ctx.lineWidth = 2 * cut;
  if (cut > 0.02) {
    wedgePath(L.R, a0 + 0.006, a1 - 0.006);
    ctx.stroke();
  }
  ctx.restore();
}

function wedgePath(R, a0, a1) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, R, a0, a1);
  ctx.closePath();
}

function drawKnife(L) {
  const a = -Math.PI / 2 + S.cutAnim * Math.PI * 2;
  ctx.save();
  ctx.translate(L.pizza.x + Math.cos(a) * L.R * 1.3, L.pizza.y + Math.sin(a) * L.R * 1.3);
  ctx.rotate(a + Math.PI / 2);
  ctx.font = '30px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔪', 0, 0);
  ctx.restore();
}

/** محور اعداد: نشان می‌دهد کسرِ ساخته‌شده کجای بین ۰ و ۱ می‌نشیند. */
function drawNumberLine(L) {
  const y = H - 44;                                  // محور همیشه ۴۴ پیکسل بالاتر از لبه
  const x0 = W * 0.12, x1 = W * 0.88;
  const o = ORDERS[S.level];

  ctx.save();
  ctx.strokeStyle = '#c9d6f2';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y); ctx.lineTo(x1, y);
  ctx.stroke();

  // خط‌های تقسیم مطابق مخرج فعلی
  ctx.font = '700 12px Vazirmatn, Tahoma, sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i <= S.den; i++) {
    const x = lerp(x0, x1, i / S.den);
    const big = i === 0 || i === S.den;
    ctx.strokeStyle = big ? '#8fa3cc' : '#dde5f7';
    ctx.lineWidth = big ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(x, y - (big ? 13 : 8));
    ctx.lineTo(x, y + (big ? 13 : 8));
    ctx.stroke();
    if (big) {
      ctx.fillStyle = '#5a6a99';
      ctx.fillText(i === 0 ? '۰' : '۱', x, y + 27);
    }
  }

  // نقطه‌ی هدفِ مشتری (صورتی)
  const tx = lerp(x0, x1, o.num / o.den);
  ctx.fillStyle = '#fc5c9c';
  ctx.beginPath();
  ctx.moveTo(tx, y - 15);
  ctx.lineTo(tx - 8, y - 30);
  ctx.lineTo(tx + 8, y - 30);
  ctx.closePath();
  ctx.fill();
  ctx.fillText('مشتری', tx, y - 36);

  // نشانگر بچه (سبز/آبی)
  const mx = lerp(x0, x1, S.marker);
  ctx.fillStyle = '#20bf6b';
  ctx.beginPath();
  ctx.arc(mx, y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#20bf6b';
  ctx.fillText(`${faNum(takenCount())}/${faNum(S.den)}`, mx, y + 27);
  ctx.restore();
}

/* ═══ راه‌اندازی ════════════════════════════════════════════════
   عمداً انتهای فایل: تا اینجا همه‌ی توابع و ثابت‌ها تعریف شده‌اند. */
loadLevel(0);
new Loop(tick).start();

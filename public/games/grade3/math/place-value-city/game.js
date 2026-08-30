/**
 * شهر عددها — ریاضی سوم، فصل ۲ (عددهای چهار رقمی)
 * ────────────────────────────────────────────────
 * ایده‌ی آموزشی: «ارزش مکانی» یعنی هر خانه ظرفیتش ۹ تاست؛ ده‌تایی که شد،
 * بسته می‌شود و به خانه‌ی بعدی می‌رود. اینجا بچه این اتفاق را نمی‌خوانَد،
 * می‌بیند: ده تا مکعبِ یکی جمع می‌شوند، به هم می‌چسبند و یک میله‌ی ده‌تایی
 * می‌سازند که پرواز می‌کند به ستون بعدی. برعکسش (شکستن) هم هست.
 *
 * قاب هر ستون یک «ده‌خانه» است تا بچه بدون شمردن ببیند چقدر تا پر شدن مانده.
 */

import {
  faNum, clamp, lerp, ease, Loop, Particles, fitCanvas,
  sfx, setHint, toast, celebrate, store,
} from '/assets/js/engine.js';

/* ═══ ستون‌ها ═══════════════════════════════════════════════════ */
// ترتیب آرایه از کم‌ارزش به پرارزش؛ روی صفحه راست‌ترین ستون «یکی» است.
const PLACES = [
  { name: 'یکی',      value: 1,    color: '#f7b731', ink: '#7a5200' },
  { name: 'ده‌تایی',   value: 10,   color: '#20bf6b', ink: '#0b5c33' },
  { name: 'صدتایی',   value: 100,  color: '#4b7bec', ink: '#123a80' },
  { name: 'هزارتایی', value: 1000, color: '#a55eea', ink: '#4c2273' },
];

/* ═══ مأموریت‌ها ════════════════════════════════════════════════ */

const MISSIONS = [
  { start: 0,    target: 324,  say: 'عدد <b>۳۲۴</b> را با بلوک‌ها بساز.' },
  { start: 0,    target: 407,  say: 'عدد <b>۴۰۷</b> را بساز. ستونِ ده‌تایی باید <b>خالی</b> بماند — همان رقم صفر.' },
  { start: 9,    target: 10,   say: 'الان ۹ تا «یکی» داری. <b>یکی دیگر</b> اضافه کن و خوب نگاه کن!' },
  { start: 99,   target: 100,  say: 'عدد ۹۹ روی میز است. <b>یکی</b> اضافه کن…' },
  { start: 1999, target: 2000, say: '۱۹۹۹! فقط <b>یکی</b> اضافه کن و آبشار را تماشا کن.' },
  { start: 1000, target: 999,  say: 'یک هزارتایی داری و می‌خواهیم <b>یکی کم</b> شود. از ستون «یکی» کم کن و ببین چطور می‌شکند.' },
  { start: 0,    target: 2506, say: 'عدد <b>۲۵۰۶</b> را بساز.' },
  { start: 0,    target: 3070, say: 'آخرین مأموریت: عدد <b>۳۰۷۰</b>.' },
];

/* ═══ وضعیت ═════════════════════════════════════════════════════ */

const saved = store.get('place-value-city', { stars: 0 });

const S = {
  n: [0, 0, 0, 0],     // تعداد بلوک هر ستون
  pop: [[], [], [], []], // زمانِ ظاهرشدن هر بلوک، برای انیمیشن ورود
  anim: null,          // { type:'bundle'|'break', place, t }
  queue: [],
  level: 0,
  stars: saved.stars || 0,
  solved: false,
  settleT: 0,
  lastValue: -1,
};

const $ = (id) => document.getElementById(id);
const cv = $('cv');
const parts = new Particles(cv);
let ctx, W, H;

function resize() { const r = fitCanvas(cv); ctx = r.ctx; W = r.w; H = r.h; }
new ResizeObserver(resize).observe(cv.parentElement);
resize();

/* ═══ دکمه‌های زیر هر ستون ═════════════════════════════════════ */

// در چیدمان راست‌چین، اولین ستونِ گرید سمت راست می‌نشیند؛ راست‌ترین ستونِ
// بوم هم «یکی» است، پس ترتیب طبیعی PLACES دقیقاً زیر ستون خودش می‌افتد.
$('controls').innerHTML = PLACES.map((_, i) => i).map((i) => `
  <div class="colctrl">
    <button class="sq" data-add="${i}" style="background:${PLACES[i].color}" aria-label="افزودن به ${PLACES[i].name}">+</button>
    <button class="sq sq--minus" data-sub="${i}" aria-label="کم‌کردن از ${PLACES[i].name}">−</button>
  </div>`).join('');

$('controls').addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  const sub = e.target.closest('[data-sub]');
  if (add) addOne(+add.dataset.add);
  if (sub) subOne(+sub.dataset.sub);
});

$('lvlTotal').textContent = faNum(MISSIONS.length);
$('stars').textContent = faNum(S.stars);

/* ═══ منطق عدد ══════════════════════════════════════════════════ */

const value = () => S.n.reduce((a, c, i) => a + c * PLACES[i].value, 0);
const busy = () => S.anim !== null || S.queue.length > 0;

function setNumber(v) {
  S.n = [0, 0, 0, 0];
  let rest = clamp(v, 0, 9999);
  for (let i = 3; i >= 0; i--) {
    S.n[i] = Math.floor(rest / PLACES[i].value);
    rest -= S.n[i] * PLACES[i].value;
  }
  S.pop = S.n.map((c) => Array.from({ length: c }, () => -1)); // بدون انیمیشن ورود
}

function loadMission(i) {
  S.level = i;
  S.solved = false;
  S.anim = null;
  S.queue.length = 0;
  const m = MISSIONS[i];
  setNumber(m.start);
  S.lastValue = -1;
  $('mission').innerHTML = m.say;
  $('lvl').textContent = faNum(i + 1);
  $('bar').style.width = `${(i / MISSIONS.length) * 100}%`;
  refreshReadout();
  setHint('دکمه‌ی <b>+</b> زیر هر ستون یک بلوک به آن ستون اضافه می‌کند.');
}

function addOne(p) {
  if (busy()) return;
  if (p === 3 && S.n[3] >= 9) {
    toast('بیشتر از ۹۹۹۹ توی این شهر جا نمی‌شود!', 'warn');
    sfx.nope();
    return;
  }
  S.n[p]++;
  S.pop[p].push(performance.now());
  sfx.pop();
  scheduleRegroup();
  refreshReadout();
}

function subOne(p) {
  if (busy()) return;
  if (S.n[p] > 0) {
    S.n[p]--;
    S.pop[p].pop();
    sfx.click();
    refreshReadout();
    return;
  }
  // ستون خالی است → باید از ستون بالاتر یکی را «بشکنیم»
  const higher = [p + 1, p + 2, p + 3].find((q) => q <= 3 && S.n[q] > 0);
  if (higher === undefined) {
    toast('چیزی برای کم‌کردن نمانده', 'warn');
    sfx.nope();
    return;
  }
  // اول از نزدیک‌ترین ستونِ پر شروع می‌کنیم و پله‌پله می‌شکنیم
  for (let q = higher; q > p; q--) S.queue.push({ type: 'break', place: q, then: q === p + 1 ? p : null });
  S.queue.push({ type: 'subAfterBreak', place: p });
  nextAnim();
}

/** اگر ستونی به ۱۰ رسید، بستنِ آن را در صف می‌گذارد (آبشاری هم کار می‌کند). */
function scheduleRegroup() {
  for (let p = 0; p < 3; p++) {
    if (S.n[p] >= 10) {
      S.queue.push({ type: 'bundle', place: p });
      nextAnim();
      return;
    }
  }
}

function nextAnim() {
  if (S.anim || S.queue.length === 0) return;
  const job = S.queue.shift();
  if (job.type === 'subAfterBreak') {
    S.n[job.place]--;
    S.pop[job.place].pop();
    refreshReadout();
    sfx.click();
    nextAnim();
    return;
  }
  S.anim = { ...job, t: 0 };
  if (job.type === 'bundle') {
    sfx.whoosh();
    setHint(`ده تا <b>${PLACES[job.place].name}</b> جمع شد ← با هم می‌شوند یک <b>${PLACES[job.place + 1].name}</b>`);
  } else {
    sfx.whoosh();
    setHint(`یک <b>${PLACES[job.place].name}</b> می‌شکند ← ده تا <b>${PLACES[job.place - 1].name}</b>`);
  }
}

function finishAnim() {
  const a = S.anim;
  if (a.type === 'bundle') {
    S.n[a.place] -= 10;
    S.pop[a.place].splice(0, 10);
    S.n[a.place + 1]++;
    S.pop[a.place + 1].push(performance.now());
    sfx.good();
    toast(`ده تا ${PLACES[a.place].name} = یک ${PLACES[a.place + 1].name}`, 'ok');
  } else {
    S.n[a.place]--;
    S.pop[a.place].pop();
    S.n[a.place - 1] += 10;
    for (let k = 0; k < 10; k++) S.pop[a.place - 1].push(performance.now() + k * 40);
    sfx.good();
    toast(`یک ${PLACES[a.place].name} = ده تا ${PLACES[a.place - 1].name}`, 'ok');
  }
  S.anim = null;
  refreshReadout();
  if (S.queue.length === 0) scheduleRegroup();
  nextAnim();
}

/* ═══ نمایش عدد ═════════════════════════════════════════════════ */

function refreshReadout() {
  const v = value();
  const digits = String(v).padStart(4, '0').split('');
  $('bignum').innerHTML = digits.map((d, k) => {
    const place = 3 - k;                       // چپ‌ترین رقم = هزارتایی
    const dim = v < PLACES[place].value;       // رقم‌های صفرِ سمت چپ کم‌رنگ
    return `<span style="color:${dim ? '#c6d0e6' : PLACES[place].ink}">${faNum(d)}</span>`;
  }).join('');

  const partsTxt = [3, 2, 1, 0]
    .filter((p) => S.n[p] > 0)
    .map((p) => `<span style="color:${PLACES[p].ink}">${faNum(S.n[p] * PLACES[p].value)}</span>`);
  $('expanded').innerHTML = partsTxt.length ? partsTxt.join(' + ') : '۰';

  if (v !== S.lastValue) {
    S.lastValue = v;
    $('bignum').querySelectorAll('span').forEach((s) => {
      s.classList.remove('digit-flash');
      void s.offsetWidth;
      s.classList.add('digit-flash');
    });
  }
  S.settleT = 0;
}

/* ═══ بررسی رسیدن به هدف ═══════════════════════════════════════ */

function checkGoal(dt) {
  if (S.solved || busy()) { S.settleT = 0; return; }
  S.settleT += dt;
  if (S.settleT < 0.7) return;
  const m = MISSIONS[S.level];
  if (value() !== m.target) return;

  S.solved = true;
  S.stars++;
  $('stars').textContent = faNum(S.stars);
  store.set('place-value-city', { stars: S.stars });
  parts.confetti(W / 2, H / 2, 80);
  const blocks = S.n.reduce((a, c) => a + c, 0);
  celebrate({
    emoji: '🎉',
    title: `عدد ${faNum(m.target)} ساخته شد!`,
    body: `با فقط <b>${faNum(blocks)}</b> بلوک. ${expandedSentence()}`,
    buttonText: S.level + 1 < MISSIONS.length ? 'مأموریت بعدی' : 'پایان',
    onNext: () => {
      if (S.level + 1 < MISSIONS.length) loadMission(S.level + 1);
      else finish();
    },
  });
}

function expandedSentence() {
  const p = [3, 2, 1, 0].filter((i) => S.n[i] > 0)
    .map((i) => `${faNum(S.n[i])} تا ${PLACES[i].name}`);
  return p.length ? `یعنی ${p.join(' و ')}.` : '';
}

function finish() {
  celebrate({
    emoji: '🏆',
    title: 'شهردار شهر عددها شدی!',
    body: `<b>${faNum(S.stars)}</b> ستاره گرفتی. حالا می‌دانی چرا هر خانه فقط تا <b>۹</b> جا دارد
           و ده‌تایی که شد، بسته می‌شود و می‌رود خانه‌ی بغلی.`,
    buttonText: 'بازی آزاد',
    onNext: () => {
      $('mission').innerHTML = '🎈 <b>بازی آزاد:</b> هر عددی خواستی بساز و بشکن!';
      S.solved = true;                     // در بازی آزاد پرده‌ی جشن نمی‌آید
      setNumber(0);
      refreshReadout();
    },
  });
}

/* ═══ چیدمان ستون‌ها روی بوم ═══════════════════════════════════ */

function layout() {
  const padX = 10, headH = 34, footH = 26;
  const colW = (W - padX * 2) / 4;
  const frameTop = headH + 8;
  const frameH = H - frameTop - footH;
  return { padX, colW, frameTop, frameH, headH };
}

/** جعبه‌ی ستون p روی صفحه (راست‌ترین ستون = یکی). */
function colBox(p) {
  const L = layout();
  const idxFromRight = p;                          // p=0 یکی → راست‌ترین
  const x = W - L.padX - (idxFromRight + 1) * L.colW;
  return { x, y: L.frameTop, w: L.colW, h: L.frameH };
}

/** مرکز خانه‌ی شماره i (۰ تا ۹) از ده‌خانه‌ی ستون p. */
function slotCenter(p, i) {
  const b = colBox(p);
  const pad = 10;
  const cw = (b.w - pad * 2) / 2;
  const ch = (b.h - pad * 2) / 5;
  const col = i % 2;            // ۰ = خانه‌ی راست
  const row = Math.floor(i / 2);
  const x = b.x + pad + (1 - col) * cw + cw / 2;
  const y = b.y + b.h - pad - (row + 0.5) * ch;
  return { x, y, cw, ch };
}

/* ═══ حلقه ═════════════════════════════════════════════════════ */

function tick(dt) {
  if (S.anim) {
    S.anim.t += dt * 1.25;
    if (S.anim.t >= 1) {
      const a = S.anim;
      const c = a.type === 'bundle' ? slotCenter(a.place + 1, S.n[a.place + 1]) : slotCenter(a.place - 1, 4);
      parts.sparkle(c.x, c.y, 22, PLACES[a.type === 'bundle' ? a.place + 1 : a.place - 1].color);
      parts.ring(c.x, c.y, PLACES[a.type === 'bundle' ? a.place + 1 : a.place - 1].color, 70);
      finishAnim();
    }
  }
  parts.update(dt);
  checkGoal(dt);
  draw();
}

/* ═══ ترسیم ════════════════════════════════════════════════════ */

function draw() {
  if (W < 40 || H < 40) return;                    // بوم هنوز اندازه نگرفته
  ctx.clearRect(0, 0, W, H);
  for (let p = 3; p >= 0; p--) drawColumn(p);
  parts.draw();
}

function drawColumn(p) {
  const b = colBox(p);
  const P = PLACES[p];
  const full = S.n[p] >= 10;

  // سرستون
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '800 15px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = P.ink;
  ctx.fillText(P.name, b.x + b.w / 2, b.y - 12);

  // قاب ده‌خانه
  const pad = 10;
  const cw = (b.w - pad * 2) / 2;
  const ch = (b.h - pad * 2) / 5;
  ctx.strokeStyle = full ? P.color : '#e3eaf8';
  ctx.lineWidth = full ? 4 : 2;
  roundRect(b.x + pad - 4, b.y + pad - 4, cw * 2 + 8, ch * 5 + 8, 14);
  ctx.fillStyle = full ? P.color + '18' : '#fafcff';
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#eef3fc';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(b.x + pad, b.y + pad + i * ch);
    ctx.lineTo(b.x + pad + cw * 2, b.y + pad + i * ch);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(b.x + pad + cw, b.y + pad);
  ctx.lineTo(b.x + pad + cw, b.y + pad + ch * 5);
  ctx.stroke();

  // شمارنده‌ی پایین ستون
  ctx.font = '900 20px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = S.n[p] ? P.ink : '#c6d0e6';
  ctx.fillText(faNum(S.n[p]), b.x + b.w / 2, b.y + b.h + 20);
  ctx.restore();

  // بلوک‌ها
  const now = performance.now();
  for (let i = 0; i < Math.min(S.n[p], 10); i++) {
    const c = slotCenter(p, i);
    const born = S.pop[p][i];
    let scale = 1, alpha = 1, dy = 0;

    if (born > 0) {
      const age = (now - born) / 320;
      if (age < 0) continue;                       // هنوز نوبتش نشده
      if (age < 1) { scale = ease.outBack(clamp(age, 0, 1)); alpha = clamp(age * 2, 0, 1); }
    }

    // انیمیشن «بسته‌شدن»: ده بلوک به سمت ستون بعدی جمع می‌شوند
    if (S.anim && S.anim.type === 'bundle' && S.anim.place === p && i < 10) {
      const t = ease.inOutCubic(clamp(S.anim.t, 0, 1));
      const dest = slotCenter(p + 1, S.n[p + 1]);
      const x = lerp(c.x, dest.x, t);
      const y = lerp(c.y, dest.y, t) - Math.sin(Math.PI * t) * 40;
      drawBlock(p, x, y, c.cw, c.ch, (1 - t * 0.75) * scale, 1 - t * 0.35);
      continue;
    }
    // انیمیشن «شکستن»: آخرین بلوک به ستون پایین‌تر پرواز می‌کند
    if (S.anim && S.anim.type === 'break' && S.anim.place === p && i === S.n[p] - 1) {
      const t = ease.inOutCubic(clamp(S.anim.t, 0, 1));
      const dest = slotCenter(p - 1, 4);
      const x = lerp(c.x, dest.x, t);
      const y = lerp(c.y, dest.y, t) - Math.sin(Math.PI * t) * 40;
      drawBlock(p, x, y, c.cw, c.ch, 1 - t * 0.3, 1 - t * 0.6);
      continue;
    }

    drawBlock(p, c.x, c.y + dy, c.cw, c.ch, scale, alpha);
  }
}

/** هر بلوک شکل خودش را دارد: مکعبِ یکی، میله‌ی ده‌تایی، صفحه‌ی صدتایی، مکعبِ هزارتایی. */
function drawBlock(p, x, y, cw, ch, scale = 1, alpha = 1) {
  const P = PLACES[p];
  const s = Math.min(cw, ch) * 0.78 * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.fillStyle = P.color;
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = 1.4;

  if (p === 0) {                                   // یکی — یک مکعب کوچک
    roundRect(-s / 2, -s / 2, s, s, s * 0.22);
    ctx.fill(); ctx.stroke();
  } else if (p === 1) {                            // ده‌تایی — میله‌ی ۱۰ خانه‌ای
    const w = Math.min(cw * 0.34, s * 0.45);
    const h = ch * 0.86 * scale;
    roundRect(-w / 2, -h / 2, w, h, 5);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.75)';
    for (let k = 1; k < 10; k++) {
      const yy = -h / 2 + (h / 10) * k;
      ctx.beginPath(); ctx.moveTo(-w / 2, yy); ctx.lineTo(w / 2, yy); ctx.stroke();
    }
  } else if (p === 2) {                            // صدتایی — صفحه‌ی ۱۰×۱۰
    roundRect(-s / 2, -s / 2, s, s, 5);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.6)';
    ctx.lineWidth = 1;
    for (let k = 1; k < 10; k++) {
      const o = -s / 2 + (s / 10) * k;
      ctx.beginPath(); ctx.moveTo(o, -s / 2); ctx.lineTo(o, s / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s / 2, o); ctx.lineTo(s / 2, o); ctx.stroke();
    }
  } else {                                         // هزارتایی — مکعب سه‌بعدی
    const a = s * 0.82, d = a * 0.3;
    ctx.beginPath();                               // وجه جلو
    ctx.rect(-a / 2, -a / 2 + d / 2, a, a);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = shade(P.color, 22);            // وجه بالا
    ctx.beginPath();
    ctx.moveTo(-a / 2, -a / 2 + d / 2);
    ctx.lineTo(-a / 2 + d, -a / 2 - d / 2);
    ctx.lineTo(a / 2 + d, -a / 2 - d / 2);
    ctx.lineTo(a / 2, -a / 2 + d / 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = shade(P.color, -18);           // وجه کناری
    ctx.beginPath();
    ctx.moveTo(a / 2, -a / 2 + d / 2);
    ctx.lineTo(a / 2 + d, -a / 2 - d / 2);
    ctx.lineTo(a / 2 + d, a / 2 - d / 2);
    ctx.lineTo(a / 2, a / 2 + d / 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** رنگ را روشن‌تر یا تیره‌تر می‌کند (برای وجه‌های مکعب). */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => clamp(v + amt, 0, 255).toString(16).padStart(2, '0'));
  return `#${c.join('')}`;
}

/* ═══ راه‌اندازی ════════════════════════════════════════════════
   عمداً انتهای فایل: تا اینجا همه‌ی توابع و ثابت‌ها تعریف شده‌اند. */
loadMission(0);
new Loop(tick).start();

// قلاب کوچک برای تست و برای معلمی که می‌خواهد مستقیم به یک مأموریت برود.
window.__jump = (i) => loadMission(clamp(i, 0, MISSIONS.length - 1));

/*!
title: کارگاهِ چرخنده — احتمال
bg: #1a1226
*/

/* ═══════════════════════════════════════════════════════════════════════
   کارگاهِ چرخنده — ریاضی سوم، فصل ۷، درس ۳ (احتمال)
   ───────────────────────────────────────────────────────────────────────
   کتاب می‌پرسد: «چند حالت ممکن است اتّفاق بیفتد؟ شانسِ کدام رنگ بیشتر
   است؟ چرا؟ چه کسری از چرخنده سبز است؟» و بعد می‌گوید هر جمله را در یکی
   از سه دسته بگذارید: به‌طور حتم، احتمال دارد، به‌طور حتم نه.

   اینجا بچّه جوابِ این سؤال‌ها را نمی‌دهد — خودش چرخنده را می‌سازد.
   مشتریِ بازارِ شب سفارش می‌دهد: «قرمز هرگز نیاید»، «سبز از آبی بیشتر
   باشد»، «نصفِ چرخ زرد باشد». بچّه با قلم‌مو قسمت‌ها را رنگ می‌کند تا
   سفارش جور دربیاید.

   شانس اینجا یک عددِ نوشته‌شده نیست؛ اندازهٔ یک تکّه از چرخ است. هر وقت
   بخواهی می‌توانی اهرم را بکِشی و ۱۰ بار بچرخانی تا جدولِ آزمایش پُر
   شود — همان کارِ کتاب. جدول جوابِ سفارش را نمی‌گوید، فقط نشان می‌دهد
   چه پیش آمد.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  night: '#241a38', nightLo: '#120c1e', nightHi: '#3d2c58',
  tent:  '#6d2f4a', tentLt: '#8f4363', tentDk: '#41182c',
  wood:  '#7d5533', woodDk: '#452b13', woodLt: '#ac7f4e',
  brass: '#cfa74e', brassDk: '#8f7327', brassLt: '#f2dd99',
  paper: '#f6edda', card: '#fdf6e7', ink: '#2b2338', inkSoft: '#7c7290',
  good:  '#5da26f', bad: '#cd5b45', gold: '#eab53f', lamp: '#ffd08a',
};

/* رنگ‌های چرخنده — همان‌هایی که کتاب به کار می‌برد */
const WC = [
  { n: 'قرمز', c: '#d2543a', d: '#8f3421' },
  { n: 'آبی',  c: '#4f86c6', d: '#2f5b90' },
  { n: 'سبز',  c: '#5da26f', d: '#37714a' },
  { n: 'زرد',  c: '#e0b13c', d: '#a37c1c' },
];

const LEVELS = [
  { name: 'سفارشِ ساده', n: 6,  pal: 2, conds: 1, quota: 3, time: 78,
    hint: 'رنگ را بردار و روی قسمت‌های چرخ بکِش.' },
  { name: 'کدام بیشتر؟', n: 8,  pal: 3, conds: 1, quota: 3, time: 76,
    hint: 'هرچه قسمتِ یک رنگ بیشتر، شانسش بیشتر.' },
  { name: 'دو شرط', n: 12, pal: 3, conds: 2, quota: 3, time: 84,
    hint: 'هر دو شرط باید هم‌زمان درست باشد.' },
  { name: 'بازارِ شلوغ', n: 12, pal: 4, conds: 2, quota: 4, time: 78,
    hint: 'نصف یعنی نیمی از قسمت‌ها، نه نصفِ رنگ‌ها.' },
  { name: 'تا چراغ‌ها روشن است', n: 12, pal: 4, conds: 2, time: 80, endless: true,
    hint: 'تا بازار باز است، چرخنده بساز.' },
];

const WHEEL = { x: 352, y: 404, r: 186 };
const ORDER = { x: 626, y: 92, w: 300, h: 330 };
const TALLY = { x: 626, y: 442, w: 300, h: 268 };
const PAL   = { x: 950, y: 92, w: 226, h: 330 };
const LEVER = { x: 950, y: 442, w: 226, h: 268 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0, n: 6, pal: 2,
  sec: [],                 /* رنگِ هر قسمت */
  conds: [],
  brush: 0,
  na: -Math.PI / 2, spin: null,   /* عقربه می‌چرخد، نه خودِ چرخ */
  tally: [0, 0, 0, 0], spins: 0,
  ok: false, sold: 0,
  timeLeft: 0, lanterns: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  sparks: [],
  t: 0, phaseT: 0, hover: null, shake: 0, nope: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const countOf = (k) => S.sec.reduce((a, v) => a + (v === k ? 1 : 0), 0);

function loadBest() { try { return +localStorage.getItem('charkhande-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('charkhande-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();

/* ───────── شرط‌ها ───────── */

/** هر شرط را روی یک چیدمانِ دلخواه می‌سنجیم. */
function condOK(q, sec) {
  const cnt = (k) => sec.reduce((a, v) => a + (v === k ? 1 : 0), 0);
  const n = sec.length;
  switch (q.k) {
    case 'always': return cnt(q.a) === n;
    case 'never':  return cnt(q.a) === 0;
    case 'more':   return cnt(q.a) > cnt(q.b) && cnt(q.b) > 0;
    case 'equal':  return cnt(q.a) === cnt(q.b) && cnt(q.a) > 0;
    case 'half':   return cnt(q.a) * 2 === n;
    case 'third':  return cnt(q.a) * 3 === n;
    case 'most':   return [0, 1, 2, 3].every((k) => k === q.a || cnt(k) < cnt(q.a)) && cnt(q.a) > 0;
    default: return false;
  }
}
const allOK = (sec) => S.conds.every((q) => condOK(q, sec));

/** سفارش را از یک چیدمانِ واقعی می‌سازیم، پس همیشه ساختنی است. */
function newOrder() {
  const lv = L();
  const n = lv.n, pal = lv.pal;
  for (let tries = 0; tries < 600; tries++) {
    /* یک چیدمانِ نمونه. گاهی عمداً یک‌رنگ یا بی‌یک‌رنگ می‌سازیمش تا
       «به‌طور حتم» و «هرگز» — که کتاب رویشان تأکید دارد — کم پیش نیاید. */
    const sec = [];
    const mood = Math.random();
    if (mood < .14) {
      const k = R(0, pal - 1);
      for (let i = 0; i < n; i++) sec.push(k);
    } else if (mood < .44) {
      const skip = R(0, pal - 1);
      for (let i = 0; i < n; i++) { let k = R(0, pal - 1); if (k === skip) k = (k + 1) % pal; sec.push(k); }
    } else {
      for (let i = 0; i < n; i++) sec.push(R(0, pal - 1));
    }
    const cnt = (k) => sec.reduce((a, v) => a + (v === k ? 1 : 0), 0);

    const pool = [];
    for (let a = 0; a < pal; a++) {
      if (cnt(a) === n) pool.push({ k: 'always', a });
      if (cnt(a) === 0) pool.push({ k: 'never', a });
      if (cnt(a) * 2 === n) pool.push({ k: 'half', a });
      if (cnt(a) * 3 === n) pool.push({ k: 'third', a });
      if (cnt(a) > 0 && [0, 1, 2, 3].every((k) => k === a || cnt(k) < cnt(a))) pool.push({ k: 'most', a });
      for (let b = 0; b < pal; b++) {
        if (a === b) continue;
        if (cnt(a) > cnt(b) && cnt(b) > 0) pool.push({ k: 'more', a, b });
        if (cnt(a) === cnt(b) && cnt(a) > 0) pool.push({ k: 'equal', a, b });
      }
    }
    if (pool.length < lv.conds) continue;
    /* چند شرط که با هم تکراری یا هم‌معنی نباشند */
    const picked = [];
    const seen = new Set();
    for (let g = 0; g < 60 && picked.length < lv.conds; g++) {
      const q = pool[R(0, pool.length - 1)];
      const key = q.k + ':' + q.a + ':' + (q.b === undefined ? '' : q.b);
      if (seen.has(key)) continue;
      if (picked.some((o) => o.k === q.k && o.a === q.a)) continue;
      seen.add(key);
      picked.push(q);
    }
    if (picked.length < lv.conds) continue;
    /* چرخِ خالیِ آغاز نباید از همان اوّل سفارش را برآورده کند */
    const start = [];
    let base = -1;
    for (let k = 0; k < pal; k++) {
      const t = new Array(n).fill(k);
      if (!picked.every((q) => condOK(q, t))) { base = k; break; }
    }
    if (base < 0) continue;
    for (let i = 0; i < n; i++) start.push(base);
    S.n = n; S.pal = pal;
    S.sec = start;
    S.conds = picked;
    S.tally = [0, 0, 0, 0];
    S.spins = 0;
    S.ok = false;
    S.brush = (base + 1) % pal;
    S.spin = null;
    return;
  }
  S.n = 6; S.pal = 2; S.sec = new Array(6).fill(0);
  S.conds = [{ k: 'equal', a: 0, b: 1 }];
  S.tally = [0, 0, 0, 0]; S.spins = 0; S.ok = false; S.brush = 1; S.spin = null;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.lanterns = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newOrder();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

newOrder();
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.nope > 0) S.nope -= dt;
  for (const s of S.sparks) { s.t += dt; s.y -= 30 * dt; }
  S.sparks = S.sparks.filter((s) => s.t < s.life);

  if (S.spin) {
    const sp = S.spin;
    sp.t += dt;
    const k = easeOut(clamp(sp.t / sp.dur, 0, 1));
    S.na = lerp(sp.from, sp.to, k);
    if (sp.t >= sp.dur) {
      S.tally[S.sec[sp.seq[sp.i]]]++;
      S.spins++;
      sfx.tone(520 + S.sec[sp.seq[sp.i]] * 90, .08, 'sine', .07);
      sp.i++;
      if (sp.i >= sp.seq.length) { S.spin = null; finishSpin(); }
      else nextSpin(sp);
    }
  }

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.sold) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseLantern('بازار بسته شد!'); }
    }
    if (S.sold) { S.sold += dt; if (S.sold > 2.1) { newOrder(); S.timeLeft = L().time; } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseLantern(msg) {
  if (S.sold) return;
  S.lanterns--;
  S.combo = 0;
  S.shake = .5;
  S.spin = null;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.lanterns <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newOrder();
}

/** رنگ زدنِ یک قسمت. */
function paintSector(i) {
  if (S.phase !== 'play' || S.sold || S.spin) return;
  if (i < 0 || i >= S.n) return;
  if (S.sec[i] === S.brush) return;
  S.sec[i] = S.brush;
  S.tally = [0, 0, 0, 0]; S.spins = 0;      /* چرخ عوض شد، آزمایشِ قبلی بی‌اعتبار است */
  S.ok = allOK(S.sec);
  sfx.tone(360 + i * 14, .05, 'triangle', .05);
  const a = -Math.PI / 2 + (i + .5) / S.n * TAU;
  S.sparks.push({ x: WHEEL.x + Math.cos(a) * WHEEL.r * .7, y: WHEEL.y + Math.sin(a) * WHEEL.r * .7,
                  t: 0, life: .5, c: WC[S.brush].c });
  if (S.tut.on && S.tut.step === 1 && S.ok) { S.tut.step = 2; S.tut.t = 0; }
}

/** اهرم: ۱۰ بار می‌چرخانَد و جدولِ آزمایش را پُر می‌کند. */
function pullLever() {
  if (S.phase !== 'play' || S.sold || S.spin) return;
  const seq = [];
  for (let i = 0; i < 10; i++) seq.push(R(0, S.n - 1));
  S.tally = [0, 0, 0, 0]; S.spins = 0;
  S.spin = { seq, i: 0, t: 0, dur: .42, from: S.na, to: S.na };
  nextSpin(S.spin);
  sfx.slide();
}

function nextSpin(sp) {
  const i = sp.seq[sp.i];
  const step2 = TAU / S.n;
  /* خودِ چرخ سرِ جایش می‌ماند — کاری که بچّه ساخته نباید جابه‌جا شود.
     عقربه می‌چرخد تا روی قسمتِ i بایستد، درست مثلِ چرخندهٔ کتاب. */
  let target = -Math.PI / 2 + (i + .5) * step2 + (Math.random() - .5) * step2 * .5;
  while (target < sp.to + TAU * 2) target += TAU;
  sp.from = S.na;
  sp.to = target;
  sp.t = 0;
  sp.dur = .42;
}

function finishSpin() {
  S.drawing = false;
  if (S.ok) sell();
  else {
    S.nope = .8;
    sfx.nope();
    toast.say('مشتری هنوز راضی نیست — شرط‌ها را ببین.', 'bad');
  }
}

function sell() {
  S.sold = .001;
  S.combo++;
  S.cleared++;
  S.score += 320 + S.conds.length * 140 + Math.round(S.timeLeft * 4) + Math.min(S.combo, 6) * 70;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(WHEEL.x, WHEEL.y, 46, [P.gold, P.brassLt, WC[0].c, WC[2].c, '#fff']);
  sfx.win();
  toast.say('مشتری چرخنده را برد!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function potBox(i) {
  const h = 48, gap = 8;
  return { x: PAL.x + 24, y: PAL.y + 58 + i * (h + gap), w: PAL.w - 48, h };
}
const leverKnob = () => ({ x: LEVER.x + LEVER.w / 2, y: LEVER.y + 172, r: 34 });

/** کدام قسمتِ چرخ زیرِ انگشت است؟ */
function sectorAt(p) {
  const dx = p.x - WHEEL.x, dy = p.y - WHEEL.y;
  const d = Math.hypot(dx, dy);
  if (d > WHEEL.r || d < 34) return -1;
  let a = Math.atan2(dy, dx) + Math.PI / 2;
  a = ((a % TAU) + TAU) % TAU;
  return Math.floor(a / (TAU / S.n)) % S.n;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.drawing) {
    if (e.buttons === 0 && e.pointerType === 'mouse') { S.drawing = false; return; }
    paintSector(sectorAt(p));
    return;
  }
  S.hover = null;
  const s = sectorAt(p);
  if (s >= 0) S.hover = { k: 'sec', i: s };
  for (let i = 0; i < S.pal; i++) if (inRect(p, potBox(i))) S.hover = { k: 'pot', i };
  if (inCircle(p, leverKnob(), 10)) S.hover = { k: 'lever' };
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
  S.drawing = false;
  for (let i = 0; i < S.pal; i++) if (inRect(p, potBox(i))) { S.brush = i; sfx.tap(); return; }
  if (inCircle(p, leverKnob(), 12)) { pullLever(); return; }
  const s = sectorAt(p);
  if (s >= 0) {
    S.drawing = true;
    paintSector(s);
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
  }
});

cv.addEventListener('pointerup', () => { S.drawing = false; });
cv.addEventListener('pointercancel', () => { S.drawing = false; });
cv.addEventListener('pointerleave', () => { S.drawing = false; });
addEventListener('blur', () => { S.drawing = false; });

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
  ctx.fillStyle = o.color || P.ink;
  ctx.fillText(str, x, y);
  ctx.restore();
}

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(8, 5, 16, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(246, 237, 218, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '8, 5, 16');
  ctx.fillStyle = P.tent;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6b6280' }); yy += 30; }
  return h + 20;
}

function disc(x, y, r, k) {
  ctx.fillStyle = WC[k].d;
  ctx.beginPath(); ctx.arc(x, y + 2, r, 0, TAU); ctx.fill();
  ctx.fillStyle = ball(x - r * .3, y - r * .3, r * 2, shade(WC[k].c, .4), WC[k].c, WC[k].d);
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.42)';
  ctx.beginPath(); ctx.ellipse(x - r * .32, y - r * .34, r * .3, r * .18, -.6, 0, TAU); ctx.fill();
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintFairStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.nightLo); g.addColorStop(.45, P.night); g.addColorStop(1, '#0e0918');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  /* ستاره‌ها */
  for (let i = 0; i < 130; i++) {
    const x = noise1(i * 1.7) * SCENE_W, y = HUD_H + noise1(i * 3.1 + 7) * 260;
    ctx.fillStyle = `rgba(255, 246, 220, ${.15 + noise1(i * .9) * .5})`;
    ctx.beginPath(); ctx.arc(x, y, .6 + noise1(i * 2.3) * 1.5, 0, TAU); ctx.fill();
  }
  /* سایبانِ راه‌راهِ بازار */
  ctx.fillStyle = P.tentDk;
  ctx.beginPath();
  ctx.moveTo(0, HUD_H); ctx.lineTo(SCENE_W, HUD_H);
  ctx.lineTo(SCENE_W, 108);
  for (let x = SCENE_W; x >= 0; x -= 60) ctx.quadraticCurveTo(x - 30, 140, x - 60, 108);
  ctx.closePath(); ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, HUD_H); ctx.lineTo(SCENE_W, HUD_H); ctx.lineTo(SCENE_W, 104);
  for (let x = SCENE_W; x >= 0; x -= 60) ctx.quadraticCurveTo(x - 30, 136, x - 60, 104);
  ctx.closePath(); ctx.clip();
  for (let x = 0; x < SCENE_W; x += 60) {
    ctx.fillStyle = (x / 60) % 2 ? P.tent : P.tentLt;
    ctx.fillRect(x, HUD_H, 60, 100);
  }
  const tg = ctx.createLinearGradient(0, HUD_H, 0, 140);
  tg.addColorStop(0, 'rgba(0,0,0,.42)'); tg.addColorStop(1, 'rgba(255, 208, 138, .18)');
  ctx.fillStyle = tg; ctx.fillRect(0, HUD_H, SCENE_W, 100);
  ctx.restore();

  /* زمینِ کارگاه */
  ctx.fillStyle = '#2a1c2e';
  ctx.fillRect(0, 640, SCENE_W, SCENE_H - 640);
  ctx.fillStyle = texWood('#4a3220', '#241408');
  ctx.fillRect(0, 648, SCENE_W, SCENE_H - 648);
  ctx.fillStyle = 'rgba(255, 208, 138, .12)';
  ctx.fillRect(0, 648, SCENE_W, 3);

  /* ریسهٔ چراغ */
  ctx.strokeStyle = 'rgba(20, 12, 30, .8)'; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= SCENE_W; x += 20) ctx.lineTo(x, 150 + Math.sin(x * .012) * 16);
  ctx.stroke();
  for (let x = 30; x < SCENE_W; x += 96) {
    const y = 150 + Math.sin(x * .012) * 16;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const lg = ctx.createRadialGradient(x, y + 14, 2, x, y + 14, 60);
    lg.addColorStop(0, 'rgba(255, 208, 138, .34)');
    lg.addColorStop(1, 'rgba(255, 208, 138, 0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(x, y + 14, 60, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); rrPath(x - 4, y, 8, 8, 3); ctx.fill();
    ctx.fillStyle = P.lamp;
    ctx.beginPath(); ctx.ellipse(x, y + 15, 8, 10, 0, 0, TAU); ctx.fill();
  }

  /* سه‌پایهٔ چوبیِ چرخنده */
  ctx.strokeStyle = P.woodDk; ctx.lineWidth = 22; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(WHEEL.x - 96, 704); ctx.lineTo(WHEEL.x, WHEEL.y + 40);
  ctx.lineTo(WHEEL.x + 96, 704);
  ctx.stroke();
  ctx.strokeStyle = P.wood; ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(WHEEL.x - 96, 704); ctx.lineTo(WHEEL.x, WHEEL.y + 40);
  ctx.lineTo(WHEEL.x + 96, 704);
  ctx.stroke();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.night);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('fair', SCENE_W, SCENE_H, paintFairStatic), 0, 0, SCENE_W, SCENE_H);
  drawWheel();
  drawFractions();
  drawOrder();
  drawTally();
  drawPalette();
  drawLever();
  for (const s of S.sparks) {
    ctx.save();
    ctx.globalAlpha = clamp(1 - s.t / s.life, 0, 1);
    ctx.fillStyle = s.c;
    ctx.beginPath(); ctx.arc(s.x, s.y, 7 * (1 - s.t / s.life) + 2, 0, TAU); ctx.fill();
    ctx.restore();
  }
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.1, 'rgba(6, 3, 12, .5)', .42, .16);
}

function drawWheel() {
  const { x, y, r } = WHEEL;
  contact(x, y + r + 16, r * .7, 14, .5);
  /* قابِ چوبی */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); ctx.arc(x, y, r + 22, 0, TAU); ctx.fill();
  ctx.fillStyle = ball(x - r * .3, y - r * .3, r * 2.4, P.woodLt, P.wood, P.woodDk);
  ctx.beginPath(); ctx.arc(x, y, r + 16, 0, TAU); ctx.fill();

  const stepA = TAU / S.n;
  for (let i = 0; i < S.n; i++) {
    const a0 = -Math.PI / 2 + i * stepA, a1 = a0 + stepA;
    const k = S.sec[i];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, a0, a1);
    ctx.closePath();
    const mid = (a0 + a1) / 2;
    const gx = x + Math.cos(mid) * r * .5, gy = y + Math.sin(mid) * r * .5;
    const g = ctx.createRadialGradient(gx - 20, gy - 20, 4, x, y, r);
    g.addColorStop(0, shade(WC[k].c, .3));
    g.addColorStop(.7, WC[k].c);
    g.addColorStop(1, WC[k].d);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(28, 16, 40, .5)'; ctx.lineWidth = 2.4;
    ctx.stroke();
    if (S.hover && S.hover.k === 'sec' && S.hover.i === i && !S.spin) {
      ctx.fillStyle = 'rgba(255,255,255,.16)';
      ctx.fill();
    }
  }
  /* برقِ لاکِ چرخ */
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  const sg = ctx.createLinearGradient(x - r, y - r, x + r * .4, y + r);
  sg.addColorStop(0, 'rgba(255,255,255,.22)');
  sg.addColorStop(.45, 'rgba(255,255,255,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  /* پیچ‌های قاب */
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU;
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * (r + 9), y + Math.sin(a) * (r + 9), 4, 0, TAU); ctx.fill();
  }
  /* توپیِ میانه */
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); ctx.arc(x, y + 2, 30, 0, TAU); ctx.fill();
  ctx.fillStyle = ball(x - 8, y - 8, 52, P.brassLt, P.brass, P.brassDk);
  ctx.beginPath(); ctx.arc(x, y, 28, 0, TAU); ctx.fill();
  /* عقربهٔ چرخان روی چرخِ ثابت */
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(S.na);
  withShadow(16, 6, .45, () => {
    ctx.fillStyle = '#22182e';
    ctx.beginPath();
    ctx.moveTo(-16, -13); ctx.lineTo(r - 16, -6);
    ctx.lineTo(r - 2, 0); ctx.lineTo(r - 16, 6); ctx.lineTo(-16, 13);
    ctx.closePath(); ctx.fill();
  }, '10, 6, 20');
  const ng = ctx.createLinearGradient(0, -13, 0, 13);
  ng.addColorStop(0, P.brassLt); ng.addColorStop(.5, P.brass); ng.addColorStop(1, P.brassDk);
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.moveTo(-13, -10); ctx.lineTo(r - 18, -4.5);
  ctx.lineTo(r - 6, 0); ctx.lineTo(r - 18, 4.5); ctx.lineTo(-13, 10);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.beginPath(); ctx.moveTo(-10, -7); ctx.lineTo(r - 20, -2.6); ctx.lineTo(r - 20, -.6); ctx.lineTo(-10, -3);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  /* پیچِ میانِ عقربه */
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
  ctx.fillStyle = P.brassLt;
  ctx.beginPath(); ctx.arc(x - 1.5, y - 1.5, 4.5, 0, TAU); ctx.fill();
}

/** «چه کسری از چرخنده سبز است؟» — کارِ خودِ بچّه، زیرِ چرخ. */
function drawFractions() {
  const y = 700;
  const w = 92, gap = 10;
  const total = S.pal * w + (S.pal - 1) * gap;
  for (let k = 0; k < S.pal; k++) {
    const x = WHEEL.x - total / 2 + k * (w + gap);
    ctx.fillStyle = 'rgba(12, 7, 22, .78)';
    ctx.beginPath(); rrPath(x, y - 24, w, 48, 10); ctx.fill();
    ctx.strokeStyle = WC[k].c; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(x, y - 24, w, 48, 10); ctx.stroke();
    disc(x + 20, y, 12, k);
    numText(fa(countOf(k)) + '/' + fa(S.n), x + 62, y + 1, { size: 22, color: '#f3ecff' });
  }
}

/** برگهٔ سفارشِ مشتری — شرط‌ها با نشانه، نه با فرمول. */
function drawOrder() {
  paper(ORDER.x, ORDER.y, ORDER.w, ORDER.h, P.card, 31, 12, .34);
  text('سفارشِ مشتری', ORDER.x + ORDER.w - 22, ORDER.y + 30,
    { size: 22, family: 'Lalezar', color: P.ink, align: 'right' });
  ctx.strokeStyle = 'rgba(43, 35, 56, .2)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(ORDER.x + 22, ORDER.y + 50); ctx.lineTo(ORDER.x + ORDER.w - 22, ORDER.y + 50); ctx.stroke();

  for (let i = 0; i < S.conds.length; i++) {
    const q = S.conds[i];
    const y = ORDER.y + 74 + i * 96;
    const ok = condOK(q, S.sec);
    ctx.fillStyle = ok ? 'rgba(93, 162, 111, .16)' : 'rgba(205, 91, 69, .1)';
    ctx.beginPath(); rrPath(ORDER.x + 18, y, ORDER.w - 36, 82, 12); ctx.fill();
    ctx.strokeStyle = ok ? P.good : 'rgba(205, 91, 69, .5)'; ctx.lineWidth = 2;
    ctx.beginPath(); rrPath(ORDER.x + 18, y, ORDER.w - 36, 82, 12); ctx.stroke();
    condArt(ORDER.x + ORDER.w / 2, y + 30, q);
    text(condText(q), ORDER.x + ORDER.w / 2, y + 64, { size: 16, color: P.ink });
    /* نشانِ درست/هنوز‌نه */
    ctx.fillStyle = ok ? P.good : 'rgba(205, 91, 69, .8)';
    ctx.beginPath(); ctx.arc(ORDER.x + 40, y + 16, 12, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    if (ok) { ctx.moveTo(ORDER.x + 34, y + 16); ctx.lineTo(ORDER.x + 39, y + 21); ctx.lineTo(ORDER.x + 47, y + 11); }
    else { ctx.moveTo(ORDER.x + 35, y + 11); ctx.lineTo(ORDER.x + 45, y + 21);
           ctx.moveTo(ORDER.x + 45, y + 11); ctx.lineTo(ORDER.x + 35, y + 21); }
    ctx.stroke();
  }
}

function condText(q) {
  switch (q.k) {
    case 'always': return 'همیشه ' + WC[q.a].n;
    case 'never':  return 'هرگز ' + WC[q.a].n;
    case 'more':   return WC[q.a].n + ' بیشتر از ' + WC[q.b].n;
    case 'equal':  return WC[q.a].n + ' و ' + WC[q.b].n + ' برابر';
    case 'half':   return 'نصفِ چرخ ' + WC[q.a].n;
    case 'third':  return 'یک‌سومِ چرخ ' + WC[q.a].n;
    case 'most':   return 'بیشترین شانس: ' + WC[q.a].n;
    default: return '';
  }
}

function condArt(cx, y, q) {
  const sym = (s, x2) => text(s, x2, y + 1, { size: 26, family: 'Lalezar', color: P.ink });
  if (q.k === 'always' || q.k === 'never') {
    disc(cx + 26, y, 17, q.a);
    ctx.strokeStyle = q.k === 'always' ? P.good : P.bad; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    if (q.k === 'always') { ctx.moveTo(cx - 30, y); ctx.lineTo(cx - 18, y + 12); ctx.lineTo(cx + 2, y - 12); }
    else { ctx.moveTo(cx - 28, y - 12); ctx.lineTo(cx - 4, y + 12); ctx.moveTo(cx - 4, y - 12); ctx.lineTo(cx - 28, y + 12); }
    ctx.stroke();
  } else if (q.k === 'more') {
    disc(cx + 36, y, 22, q.a);
    disc(cx - 34, y, 11, q.b);
    ctx.fillStyle = 'rgba(43, 35, 56, .5)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(cx - 6 + i * 7, y, 2.2 + i * .8, 0, TAU); ctx.fill();
    }
  } else if (q.k === 'equal') {
    disc(cx + 36, y, 17, q.a);
    disc(cx - 36, y, 17, q.b);
    sym('=', cx);
  } else if (q.k === 'half' || q.k === 'third') {
    /* نیم‌دایره یا یک‌سومِ دایره، به رنگِ خواسته */
    const rr = 19;
    ctx.fillStyle = 'rgba(43, 35, 56, .18)';
    ctx.beginPath(); ctx.arc(cx + 30, y, rr, 0, TAU); ctx.fill();
    ctx.fillStyle = WC[q.a].c;
    ctx.beginPath(); ctx.moveTo(cx + 30, y);
    ctx.arc(cx + 30, y, rr, -Math.PI / 2, -Math.PI / 2 + (q.k === 'half' ? Math.PI : TAU / 3));
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(43, 35, 56, .5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx + 30, y, rr, 0, TAU); ctx.stroke();
    text(q.k === 'half' ? '۱ از ۲' : '۱ از ۳', cx - 24, y + 1, { size: 18, color: P.ink });
  } else {
    disc(cx + 26, y, 17, q.a);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const h = 8 + i * 7;
      ctx.beginPath(); ctx.moveTo(cx - 30 + i * 12, y + 12); ctx.lineTo(cx - 30 + i * 12, y + 12 - h); ctx.stroke();
    }
  }
}

/** جدولِ آزمایش — همان کارِ کتاب: ۱۰ بار بچرخان و بنویس. */
function drawTally() {
  ctx.fillStyle = 'rgba(12, 7, 22, .8)';
  ctx.beginPath(); rrPath(TALLY.x, TALLY.y, TALLY.w, TALLY.h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(207, 167, 78, .34)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(TALLY.x, TALLY.y, TALLY.w, TALLY.h, 14); ctx.stroke();
  text('جدولِ آزمایش', TALLY.x + TALLY.w - 20, TALLY.y + 26,
    { size: 19, family: 'Lalezar', color: P.brassLt, align: 'right' });
  numText(fa(S.spins) + ' از ۱۰', TALLY.x + 58, TALLY.y + 27, { size: 17, color: 'rgba(246, 237, 218, .6)' });

  if (S.spins === 0 && !S.spin) {
    text('اهرم را بکِش تا ۱۰ بار بچرخد.', TALLY.x + TALLY.w / 2, TALLY.y + 118,
      { size: 16, color: 'rgba(246, 237, 218, .4)' });
    text('چرخ که عوض شود، آزمایش از نو.', TALLY.x + TALLY.w / 2, TALLY.y + 146,
      { size: 15, color: 'rgba(246, 237, 218, .3)' });
    return;
  }
  for (let k = 0; k < S.pal; k++) {
    const y = TALLY.y + 66 + k * 48;
    disc(TALLY.x + TALLY.w - 40, y, 15, k);
    /* چوب‌خط، مثلِ دفترِ کلاس */
    for (let i = 0; i < S.tally[k]; i++) {
      const gx = TALLY.x + TALLY.w - 84 - Math.floor(i / 5) * 44 - (i % 5) * 8;
      ctx.strokeStyle = WC[k].c; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      if (i % 5 === 4) { ctx.moveTo(gx + 30, y - 12); ctx.lineTo(gx - 4, y + 12); }
      else { ctx.moveTo(gx, y - 12); ctx.lineTo(gx, y + 12); }
      ctx.stroke();
    }
    numText(fa(S.tally[k]) + '/' + fa(S.spins), TALLY.x + 40, y + 1,
      { size: 19, color: 'rgba(246, 237, 218, .75)' });
  }
}

function drawPalette() {
  ctx.fillStyle = 'rgba(12, 7, 22, .8)';
  ctx.beginPath(); rrPath(PAL.x, PAL.y, PAL.w, PAL.h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(207, 167, 78, .34)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(PAL.x, PAL.y, PAL.w, PAL.h, 14); ctx.stroke();
  text('قلم‌مو', PAL.x + PAL.w / 2, PAL.y + 32, { size: 21, family: 'Lalezar', color: P.brassLt });
  for (let i = 0; i < S.pal; i++) {
    const b = potBox(i);
    const on = S.brush === i;
    const hot = S.hover && S.hover.k === 'pot' && S.hover.i === i;
    ctx.fillStyle = on ? 'rgba(242, 221, 153, .2)' : 'rgba(255,255,255,.05)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.fill();
    if (on || hot) {
      ctx.strokeStyle = on ? P.brassLt : 'rgba(242, 221, 153, .4)'; ctx.lineWidth = on ? 3 : 2;
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 12); ctx.stroke();
    }
    /* قوطیِ رنگ */
    ctx.fillStyle = '#2c2038';
    ctx.beginPath(); rrPath(b.x + 10, b.y + 10, 38, 30, 6); ctx.fill();
    ctx.fillStyle = WC[i].c;
    ctx.beginPath(); ctx.ellipse(b.x + 29, b.y + 14, 17, 6.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = shade(WC[i].c, .35);
    ctx.beginPath(); ctx.ellipse(b.x + 25, b.y + 12, 6.5, 3, 0, 0, TAU); ctx.fill();
    text(WC[i].n, b.x + b.w - 16, b.y + b.h / 2, { size: 19, family: 'Lalezar', color: on ? P.brassLt : '#e6ddf5', align: 'right' });
  }
  text('روی چرخ بکِش', PAL.x + PAL.w / 2, PAL.y + PAL.h - 18, { size: 14, color: 'rgba(246, 237, 218, .45)' });
}

function drawLever() {
  ctx.fillStyle = 'rgba(12, 7, 22, .8)';
  ctx.beginPath(); rrPath(LEVER.x, LEVER.y, LEVER.w, LEVER.h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(207, 167, 78, .34)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(LEVER.x, LEVER.y, LEVER.w, LEVER.h, 14); ctx.stroke();
  text('بچرخان', LEVER.x + LEVER.w / 2, LEVER.y + 32, { size: 21, family: 'Lalezar', color: P.brassLt });
  const k = leverKnob();
  const hot = S.hover && S.hover.k === 'lever';
  const busy = !!S.spin;
  /* شیار و میله */
  ctx.fillStyle = 'rgba(0,0,0,.5)';
  ctx.beginPath(); rrPath(k.x - 16, LEVER.y + 62, 32, 120, 16); ctx.fill();
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(k.x, LEVER.y + 76); ctx.lineTo(k.x, k.y - (busy ? -14 : 0)); ctx.stroke();
  if (S.ok && !busy) {
    ctx.save();
    ctx.globalAlpha = .3 + .25 * Math.sin(S.t * 5);
    ctx.fillStyle = P.gold;
    ctx.beginPath(); ctx.arc(k.x, k.y, k.r + 16, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); ctx.arc(k.x, k.y + 4 + (busy ? 14 : 0), k.r, 0, TAU); ctx.fill();
  ctx.fillStyle = ball(k.x - 10, k.y - 10, k.r * 2, P.brassLt, P.brass, P.brassDk);
  ctx.beginPath(); ctx.arc(k.x, k.y + (busy ? 14 : 0), k.r - 2, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.beginPath(); ctx.ellipse(k.x - 10, k.y - 11 + (busy ? 14 : 0), 9, 5, -.6, 0, TAU); ctx.fill();
  if (hot && !busy) {
    ctx.save();
    ctx.globalAlpha = .5 + .3 * Math.sin(S.t * 6);
    ctx.strokeStyle = P.brassLt; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(k.x, k.y, k.r + 10, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  text(S.ok ? 'سفارش جور است' : 'هر وقت خواستی بیازما',
    LEVER.x + LEVER.w / 2, LEVER.y + LEVER.h - 32,
    { size: 15, color: S.ok ? P.good : 'rgba(246, 237, 218, .45)' });
  if (S.nope > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.nope, 0, 1);
    ctx.strokeStyle = P.bad; ctx.lineWidth = 4;
    ctx.beginPath(); rrPath(LEVER.x, LEVER.y, LEVER.w, LEVER.h, 14); ctx.stroke();
    ctx.restore();
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(14, 9, 24, .93)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(207, 167, 78, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 236 - i * 32;
    ctx.save();
    ctx.globalAlpha = i < S.lanterns ? 1 : .22;
    ctx.fillStyle = i < S.lanterns ? P.brassDk : '#544c62';
    ctx.beginPath(); rrPath(x - 9, HUD_H / 2 - 11, 18, 23, 5); ctx.fill();
    ctx.fillStyle = i < S.lanterns ? P.lamp : '#7a7288';
    ctx.beginPath(); ctx.ellipse(x, HUD_H / 2 + 1, 6, 8, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(246, 237, 218, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
  const k = clamp(S.timeLeft / L().time, 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.beginPath(); rrPath(SCENE_W / 2 - 150, HUD_H - 8, 300, 6, 3); ctx.fill();
  ctx.fillStyle = k > .3 ? P.brass : P.bad;
  ctx.beginPath(); rrPath(SCENE_W / 2 - 150, HUD_H - 8, 300 * k, 6, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: ORDER.x, y: ORDER.y, w: ORDER.w, h: ORDER.h }], .76);
    const h = tutCard(120, 200, 480,
      ['مشتری می‌گوید چرخنده چه شکلی باشد:', 'کدام رنگ همیشه، کدام هرگز، کدام بیشتر.'], 'کارگاهِ چرخنده');
    tutMore(360, 200 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: WHEEL.x - WHEEL.r - 30, y: WHEEL.y - WHEEL.r - 46, w: WHEEL.r * 2 + 60, h: WHEEL.r * 2 + 76 },
          { x: PAL.x, y: PAL.y, w: PAL.w, h: PAL.h }], .72);
    tutCard(300, 96, 600, ['رنگ را از قلم‌مو بردار و روی قسمت‌های چرخ بکِش.',
      'هرچه قسمتِ یک رنگ بیشتر باشد، شانسش بیشتر است.']);
  } else {
    spot([{ x: TALLY.x, y: TALLY.y, w: TALLY.w, h: TALLY.h }, { x: LEVER.x, y: LEVER.y, w: LEVER.w, h: LEVER.h }], .72);
    const h = tutCard(90, 130, 500,
      ['اهرم را بکِش تا چرخ ۱۰ بار بچرخد.',
       'جدول می‌گوید چه پیش آمد — نه اینکه چه باید بشود.'], 'بیازما');
    tutMore(340, 130 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function wheelIcon(x, y) {
  const r = 30;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, i / 6 * TAU, (i + 1) / 6 * TAU);
    ctx.closePath();
    ctx.fillStyle = WC[i % 3].c;
    ctx.fill();
  }
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.fillStyle = P.ink;
  ctx.beginPath(); ctx.moveTo(x - 8, y - r - 12); ctx.lineTo(x + 8, y - r - 12); ctx.lineTo(x, y - r + 8); ctx.closePath(); ctx.fill();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 790, h: 300, y: 128,
    paper: P.paper, band: P.tent, ink: P.ink, inkSoft: '#6b6280',
    icon: wheelIcon,
    title: 'کارگاهِ چرخنده',
    body: 'مشتریِ بازارِ شب سفارش می‌دهد: کدام رنگ همیشه بیاید، کدام هرگز،\nکدام شانسش بیشتر باشد. قسمت‌های چرخ را رنگ کن تا سفارش جور دربیاید.\nهر وقت خواستی اهرم را بکِش و ۱۰ بار بچرخان تا ببینی چه پیش می‌آید.',
    btn: BTN_GO, btnLabel: 'کارگاه را باز کن', btnHot: S.hover === BTN_GO,
    btnFill: '#6d2f4a', btnHotFill: '#8f4363',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#6b6280',
    icon: wheelIcon,
    title: L().endless ? 'بازار خوابید' : 'همهٔ سفارش‌ها رفت!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ کارگاه‌ها را گرداندی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'مشتریِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#6d2f4a', btnHotFill: '#8f4363',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#6b6280',
    icon: (x, y) => {
      ctx.fillStyle = '#8f7327';
      ctx.beginPath(); rrPath(x - 13, y - 14, 26, 34, 6); ctx.fill();
      ctx.fillStyle = '#6d6578';
      ctx.beginPath(); ctx.ellipse(x, y + 2, 7, 9, 0, 0, TAU); ctx.fill();
      wheelIcon(x + 60, y + 2);
    },
    title: 'چراغ‌ها خاموش شد',
    body: 'امتیاز: ' + fa(S.score) + '\nاوّل شرط‌ها را جور کن، بعد بچرخان.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#6d2f4a', btnHotFill: '#8f4363',
  });
}

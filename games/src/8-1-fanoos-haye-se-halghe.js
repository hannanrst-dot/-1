/*!
title: سه حلقهٔ نور — حذف حالت‌های نامطلوب
bg: #131022
*/

/* ═══════════════════════════════════════════════════════════════════════
   سه حلقهٔ نور — ریاضی سوم، فصل ۸، درس ۱ (حذف حالت‌های نامطلوب)
   ───────────────────────────────────────────────────────────────────────
   معمّای کتاب همین است: «عددهای ۱ تا ۷ را در شکل زیر قرار دهید. در دایره
   فقط عدد زوج هست. عدد ۴ هم در دایره است هم در مستطیل…»

   اینجا سه فانوس، سه حلقهٔ نور روی حیاط انداخته‌اند و حلقه‌ها روی هم
   افتاده‌اند: هفت جای جدا درست می‌شود. هفت چراغِ شماره‌دار داری و هر جا
   فقط یک چراغ می‌گیرد.

   کنارِ صحنه برگه‌های سرنخ است. هر برگه دربارهٔ یک چراغ می‌گوید داخلِ
   کدام حلقه هست (✓) یا نیست (✗) — با نشانه، نه با نوشته. بعضی سرنخ‌ها
   کاملند و جای چراغ را دقیق می‌گویند؛ بعضی فقط یک تکّه از خبر را
   می‌دهند و یکی از چراغ‌ها هم هیچ سرنخی ندارد.

   پس چاره یکی است: حالت‌های نامطلوب را حذف کن. جایی که چراغِ دیگری
   گرفته، دیگر جای این یکی نیست. معمّا همیشه یک جواب دارد و بس — خودِ
   بازی پیش از دادنِ سرنخ‌ها این را وارسی می‌کند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 52;

const P = {
  night: '#1a1530', nightLo: '#0d0a18', nightHi: '#2e2550',
  stone: '#3b3352', stoneDk: '#221c33', stoneLt: '#5b5079',
  wood:  '#7a5433', woodDk: '#452c14', woodLt: '#a87c4c',
  brass: '#cfa74e', brassDk: '#8f7327', brassLt: '#f2dd99',
  paper: '#f4ecd9', card: '#fdf7e8', ink: '#2a2338', inkSoft: '#7a7290',
  good:  '#5da26f', bad: '#cd5b45', gold: '#eab53f', glass: '#ffd9a0',
};

/* سه فانوس: رنگ، نشان و حلقهٔ نورش */
const RING = [
  { n: 'مهر',   c: '#e0a03c', d: '#a06d16', x: 404, y: 300, r: 138 },
  { n: 'ماه',   c: '#5aa8d8', d: '#2f6f99', x: 301, y: 476, r: 138 },
  { n: 'ستاره', c: '#9b7ad4', d: '#5f4794', x: 507, y: 476, r: 138 },
];

const LEVELS = [
  { name: 'حیاطِ اوّل', weaken: 1, quota: 2, time: 96, hint: 'چراغ را در جایی بگذار که سرنخش می‌گوید.' },
  { name: 'یک سرنخ کم', weaken: 3, quota: 2, time: 104, hint: 'جایی که پُر شد، دیگر جای بقیّه نیست.' },
  { name: 'نیمه‌سرنخ',  weaken: 5, quota: 3, time: 112, hint: '✓ یعنی داخلِ آن حلقه، ✗ یعنی بیرونش.' },
  { name: 'شبِ تاریک',  weaken: 8, quota: 3, time: 120, hint: 'حالت‌های نامطلوب را یکی‌یکی حذف کن.' },
  { name: 'تا فانوس‌ها روشن‌اند', weaken: 8, time: 116, endless: true, hint: 'تا فانوس‌ها روشن‌اند، معمّا هست.' },
];

const TRAY = { x: 664, y: 470, w: 512, h: 168 };
const CLUE = { x: 664, y: 88, w: 512, h: 366 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  sol: [],            /* sol[t] = شناسهٔ ناحیه برای چراغِ t (۰..۶) */
  clues: [],
  spot: {},           /* مرکزِ هر ناحیه */
  at: [],             /* at[t] = ناحیه‌ای که چراغ در آن گذاشته شده، یا ‑۱ */
  held: -1, hx: 0, hy: 0, px: 0, py: 0,
  bad: 0, badRegion: -1,
  timeLeft: 0, lamps: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  done: 0, doneT: 0, moths: [],
  t: 0, phaseT: 0, hover: null, shake: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/* ناحیه‌ها: هر عدد ۱..۷ یعنی «در کدام حلقه‌ها هست» */
const REGIONS = [1, 2, 3, 4, 5, 6, 7];
const inShape = (p, i) => Math.hypot(p.x - RING[i].x, p.y - RING[i].y) <= RING[i].r;
const regionAt = (p) => (inShape(p, 0) ? 4 : 0) + (inShape(p, 1) ? 2 : 0) + (inShape(p, 2) ? 1 : 0);
const hasShape = (reg, i) => !!(reg & (4 >> i));

function loadBest() { try { return +localStorage.getItem('halghe-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('halghe-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();

/* مرکزِ هر ناحیه را یک‌بار با نمونه‌برداری پیدا می‌کنیم. */
function findSpots() {
  const sum = {}, n = {};
  for (const r of REGIONS) { sum[r] = { x: 0, y: 0 }; n[r] = 0; }
  for (let y = 140; y < 640; y += 3) for (let x = 140; x < 670; x += 3) {
    const r = regionAt({ x, y });
    if (!r) continue;
    sum[r].x += x; sum[r].y += y; n[r]++;
  }
  const out = {};
  for (const r of REGIONS) out[r] = n[r] ? { x: sum[r].x / n[r], y: sum[r].y / n[r] } : { x: 400, y: 400 };
  /* اگر مرکزِ ثقل بیرونِ ناحیه افتاد، نزدیک‌ترین نقطهٔ داخل را برمی‌داریم */
  for (const r of REGIONS) {
    if (regionAt(out[r]) === r) continue;
    let best = null, bd = 1e9;
    for (let y = 140; y < 640; y += 3) for (let x = 140; x < 670; x += 3) {
      if (regionAt({ x, y }) !== r) continue;
      const d = Math.hypot(x - out[r].x, y - out[r].y);
      if (d < bd) { bd = d; best = { x, y }; }
    }
    if (best) out[r] = best;
  }
  S.spot = out;
}
findSpots();

/* ───────── ساختنِ معمّا ───────── */

/** آیا این چیدمان با سرنخ می‌خوانَد؟ (perm[t] = ناحیهٔ چراغِ t) */
function fits(perm, q) {
  const reg = perm[q.tok];
  if (q.t === 'exact') return reg === q.reg;
  if (q.t === 'in') return hasShape(reg, q.s);
  return !hasShape(reg, q.s);
}

/** چند چیدمان با این دسته سرنخ می‌خوانَد؟ (تا سقفِ ۲ می‌شماریم) */
function countSolutions(clues) {
  const used = new Array(8).fill(false);
  const perm = new Array(7).fill(0);
  let found = 0;
  const rec = (t) => {
    if (found > 1) return;
    if (t === 7) { found++; return; }
    for (const r of REGIONS) {
      if (used[r]) continue;
      perm[t] = r;
      let ok = true;
      for (const q of clues) {
        if (q.tok > t) continue;
        if (!fits(perm, q)) { ok = false; break; }
      }
      if (ok) { used[r] = true; rec(t + 1); used[r] = false; }
      if (found > 1) return;
    }
  };
  rec(0);
  return found;
}

function newPuzzle() {
  const lv = L();
  /* یک چیدمانِ تصادفی */
  const regs = REGIONS.slice();
  for (let i = regs.length - 1; i > 0; i--) { const j = R(0, i); const t = regs[i]; regs[i] = regs[j]; regs[j] = t; }
  S.sol = regs.slice();

  /* از سرنخِ کاملِ همه شروع می‌کنیم و کم‌کم ضعیفشان می‌کنیم؛
     هر بار وارسی می‌شود که جواب همچنان یکتا بماند. */
  let clues = [];
  for (let t = 0; t < 7; t++) clues.push({ t: 'exact', tok: t, reg: S.sol[t] });
  let weakened = 0;
  const order = [0, 1, 2, 3, 4, 5, 6];
  for (let g = 0; g < 60 && weakened < lv.weaken; g++) {
    for (let i = order.length - 1; i > 0; i--) { const j = R(0, i); const t = order[i]; order[i] = order[j]; order[j] = t; }
    let moved = false;
    for (const tok of order) {
      if (weakened >= lv.weaken) break;
      const idx = clues.findIndex((q) => q.tok === tok);
      if (idx < 0) continue;
      const cur = clues[idx];
      const tries = [];
      if (cur.t === 'exact') {
        for (let s = 0; s < 3; s++) {
          tries.push(hasShape(S.sol[tok], s) ? { t: 'in', tok, s } : { t: 'out', tok, s });
        }
      }
      tries.push(null);                                  /* حذفِ کاملِ سرنخ */
      for (let i = tries.length - 1; i > 0; i--) { const j = R(0, i); const t2 = tries[i]; tries[i] = tries[j]; tries[j] = t2; }
      for (const nw of tries) {
        const next = nw ? clues.map((q, i) => (i === idx ? nw : q)) : clues.filter((_, i) => i !== idx);
        if (countSolutions(next) === 1) { clues = next; weakened++; moved = true; break; }
      }
    }
    if (!moved) break;
  }
  S.clues = clues;
  S.at = new Array(7).fill(-1);
  S.held = -1;
  S.bad = 0; S.badRegion = -1;
  S.done = 0; S.doneT = 0;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  if (!keep) { S.score = 0; S.lamps = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newPuzzle();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

newPuzzle();
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.bad > 0) { S.bad -= dt; if (S.bad <= 0) S.badRegion = -1; }

  if (Math.random() < dt * 1.6 && S.moths.length < 7) {
    const s = RING[R(0, 2)];
    S.moths.push({ a: Math.random() * TAU, r: s.r * (.5 + Math.random() * .5), s, v: (Math.random() < .5 ? 1 : -1) * (.4 + Math.random()), t: 0, life: 6 + Math.random() * 5 });
  }
  for (const m of S.moths) { m.t += dt; m.a += m.v * dt; m.r += Math.sin(m.t * 2) * 12 * dt; }
  S.moths = S.moths.filter((m) => m.t < m.life);

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.done) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; loseLamp('شب تمام شد!'); }
    }
    if (S.done) { S.doneT += dt; if (S.doneT > 2.2) { newPuzzle(); S.timeLeft = L().time; } }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function loseLamp(msg) {
  if (S.done) return;
  S.lamps--;
  S.combo = 0;
  S.shake = .5;
  S.held = -1;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.lamps <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newPuzzle();
}

function place(tok, reg) {
  if (S.phase !== 'play' || S.done) return false;
  if (!reg) { S.held = -1; return false; }
  if (S.at.some((r, i) => r === reg && i !== tok)) {
    S.bad = .8; S.badRegion = reg; S.shake = .12; sfx.nope();
    toast.say('این جا چراغ دارد.', 'bad');
    return false;
  }
  if (reg !== S.sol[tok]) {
    S.bad = .8; S.badRegion = reg; S.shake = .16; sfx.nope();
    toast.say('سرنخ‌ها این جا را نمی‌گویند.', 'bad');
    return false;
  }
  S.at[tok] = reg;
  S.held = -1;
  sfx.place();
  bits.add(S.spot[reg].x, S.spot[reg].y, 12, 'dot', [P.glass, P.brassLt, '#fff'],
    { speed: 160, lift: 60, size: 3.4, life: .6, grav: 260 });
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
  if (S.at.every((r) => r > 0)) finish();
  return true;
}

function finish() {
  S.done = .001; S.doneT = 0;
  S.combo++;
  S.cleared++;
  S.score += 400 + Math.round(S.timeLeft * 4) + Math.min(S.combo, 6) * 80;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  bits.confetti(400, 380, 50, [P.gold, P.brassLt, RING[0].c, RING[1].c, RING[2].c, '#fff']);
  sfx.win();
  toast.say('همهٔ چراغ‌ها سرِ جایشان!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function traySlot(i) {
  const w = 62, gap = 10;
  const total = 7 * w + 6 * gap;
  return { x: TRAY.x + (TRAY.w - total) / 2 + i * (w + gap), y: TRAY.y + 62, w, h: 74 };
}
const lampR = 26;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.held >= 0) { S.hx = p.x; S.hy = p.y; return; }
  S.hover = null;
  for (let t = 0; t < 7; t++) {
    if (S.at[t] < 0) { if (inRect(p, traySlot(t))) S.hover = { k: 'tray', t }; }
    else if (Math.hypot(p.x - S.spot[S.at[t]].x, p.y - S.spot[S.at[t]].y) < lampR + 6) S.hover = { k: 'placed', t };
  }
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
  if (S.done) return;
  if (S.held >= 0) { place(S.held, regionAt(p)); return; }
  for (let t = 0; t < 7; t++) {
    if (S.at[t] < 0) {
      if (inRect(p, traySlot(t))) { S.held = t; S.hx = p.x; S.hy = p.y; S.px = p.x; S.py = p.y; sfx.tap();
        try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ } return; }
    } else if (Math.hypot(p.x - S.spot[S.at[t]].x, p.y - S.spot[S.at[t]].y) < lampR + 6) {
      S.at[t] = -1; S.held = t; S.hx = p.x; S.hy = p.y; S.px = p.x; S.py = p.y; sfx.tap();
      try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
      return;
    }
  }
});

cv.addEventListener('pointerup', (e) => {
  if (S.held < 0 || S.phase !== 'play') return;
  const p = toStage(e);
  /* ضربهٔ ساده چراغ را در دست نگه می‌دارد تا با ضربهٔ دوم بگذاردش؛
     کشیدن همان‌جا که رها شد می‌نشاند. */
  if (Math.hypot(p.x - S.px, p.y - S.py) < 14) return;
  const reg = regionAt(p);
  if (reg) place(S.held, reg);
  else S.held = -1;
});

cv.addEventListener('pointercancel', () => { S.held = -1; });

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
  ctx.fillStyle = `rgba(6, 4, 12, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(253, 247, 232, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '6, 4, 12');
  ctx.fillStyle = P.brassDk;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6a6280' }); yy += 30; }
  return h + 20;
}

/** نشانِ هر فانوس: مهر، ماه، ستاره. */
function emblem(x, y, i, r, col) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = col || RING[i].c;
  if (i === 0) {
    ctx.beginPath(); ctx.arc(0, 0, r * .52, 0, TAU); ctx.fill();
    ctx.strokeStyle = col || RING[i].c; ctx.lineWidth = r * .16; ctx.lineCap = 'round';
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * .72, Math.sin(a) * r * .72);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.stroke();
    }
  } else if (i === 1) {
    ctx.beginPath(); ctx.arc(0, 0, r * .9, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(r * .5, -r * .32, r * .82, 0, TAU); ctx.fill();
  } else {
    star(0, 0, r, col || RING[i].c, -Math.PI / 10);
  }
  ctx.restore();
}

/** چراغِ شماره‌دار. */
function lamp(x, y, t, o = {}) {
  const r = o.r || lampR;
  contact(x, y + r + 4, r * .8, 6, .4);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 2, x, y, r * 2.6);
  g.addColorStop(0, 'rgba(255, 217, 160, .34)');
  g.addColorStop(1, 'rgba(255, 217, 160, 0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); ctx.arc(x, y + 3, r, 0, TAU); ctx.fill();
  ctx.fillStyle = ball(x - r * .3, y - r * .3, r * 2, '#fff3d6', P.glass, '#b9822f');
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.brass; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.fillStyle = P.brassDk;
  ctx.beginPath(); rrPath(x - r * .3, y - r - 8, r * .6, 8, 3); ctx.fill();
  numText(fa(t + 1), x, y + 1, { size: r * 1.05, color: '#4a3208' });
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.beginPath(); ctx.ellipse(x - r * .34, y - r * .38, r * .24, r * .14, -.6, 0, TAU); ctx.fill();
}

/* ───────── پس‌زمینهٔ ثابت ───────── */

function paintYardStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.nightLo); g.addColorStop(.45, P.night); g.addColorStop(1, '#0a0714');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  for (let i = 0; i < 120; i++) {
    const x = noise1(i * 1.7) * SCENE_W, y = HUD_H + noise1(i * 3.1 + 7) * 240;
    ctx.fillStyle = `rgba(255, 246, 220, ${.1 + noise1(i * .9) * .45})`;
    ctx.beginPath(); ctx.arc(x, y, .6 + noise1(i * 2.3) * 1.4, 0, TAU); ctx.fill();
  }
  /* سنگ‌فرشِ حیاط */
  ctx.fillStyle = P.stoneDk;
  ctx.fillRect(0, 120, SCENE_W, SCENE_H - 120);
  ctx.save();
  ctx.globalAlpha = .55;
  ctx.fillStyle = texStone(P.stone, P.stoneLt);
  ctx.fillRect(0, 120, SCENE_W, SCENE_H - 120);
  ctx.restore();
  ctx.strokeStyle = 'rgba(10, 7, 20, .5)'; ctx.lineWidth = 2.4;
  for (let y = 120; y < SCENE_H; y += 62) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y); ctx.stroke();
    const off = ((y - 120) / 62) % 2 ? 46 : 0;
    for (let x = off; x < SCENE_W; x += 92) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 62); ctx.stroke(); }
  }
  const vg = ctx.createLinearGradient(0, 120, 0, SCENE_H);
  vg.addColorStop(0, 'rgba(0,0,0,.18)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 120, SCENE_W, SCENE_H - 120);

  /* میزِ چوبیِ سرنخ‌ها و سینی */
  ctx.fillStyle = P.woodDk;
  ctx.beginPath(); rrPath(CLUE.x - 22, CLUE.y - 18, CLUE.w + 44, TRAY.y + TRAY.h - CLUE.y + 40, 16); ctx.fill();
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.beginPath(); rrPath(CLUE.x - 16, CLUE.y - 12, CLUE.w + 32, TRAY.y + TRAY.h - CLUE.y + 28, 12); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.fillRect(CLUE.x - 16, TRAY.y + TRAY.h + 16, CLUE.w + 32, 8);
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.night);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('yard', SCENE_W, SCENE_H, paintYardStatic), 0, 0, SCENE_W, SCENE_H);
  drawRings();
  drawMoths();
  drawPlaced();
  drawClues();
  drawTray();
  bits.draw();
  if (S.held >= 0) lamp(S.hx, S.hy - 16, S.held, { r: lampR + 3 });
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.11, 'rgba(4, 2, 10, .5)', .44, .16);
}

function drawRings() {
  /* نورِ هر فانوس */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const s of RING) {
    const g = ctx.createRadialGradient(s.x, s.y, 8, s.x, s.y, s.r);
    g.addColorStop(0, s.c + '55');
    g.addColorStop(.7, s.c + '22');
    g.addColorStop(1, s.c + '00');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
  }
  ctx.restore();
  /* جای اشتباه، قرمز می‌زند */
  if (S.bad > 0 && S.badRegion > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.bad, 0, 1) * .5;
    ctx.fillStyle = P.bad;
    ctx.beginPath();
    ctx.arc(S.spot[S.badRegion].x, S.spot[S.badRegion].y, 40, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  /* لبهٔ حلقه‌ها و نشانِ هر فانوس */
  for (let i = 0; i < 3; i++) {
    const s = RING[i];
    ctx.strokeStyle = s.c; ctx.lineWidth = 3;
    ctx.globalAlpha = .8;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1;
    /* فانوس روی لبهٔ بیرونی */
    const a = i === 0 ? -Math.PI * .78 : (i === 1 ? Math.PI * .84 : Math.PI * .16);
    const lx = s.x + Math.cos(a) * (s.r + 30), ly = s.y + Math.sin(a) * (s.r + 30);
    ctx.strokeStyle = P.woodDk; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(lx, ly - 22); ctx.lineTo(lx, ly - 40); ctx.stroke();
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); rrPath(lx - 19, ly - 22, 38, 42, 8); ctx.fill();
    ctx.fillStyle = s.d;
    ctx.beginPath(); rrPath(lx - 15, ly - 18, 30, 34, 6); ctx.fill();
    emblem(lx, ly - 1, i, 11, s.c);
  }
}

function drawMoths() {
  ctx.save();
  ctx.fillStyle = 'rgba(246, 236, 214, .5)';
  for (const m of S.moths) {
    const x = m.s.x + Math.cos(m.a) * m.r, y = m.s.y + Math.sin(m.a) * m.r;
    const w = 4 + Math.abs(Math.sin(m.t * 14)) * 4;
    ctx.beginPath(); ctx.ellipse(x, y, w, 2.6, m.a, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawPlaced() {
  for (let t = 0; t < 7; t++) {
    if (S.at[t] < 0) continue;
    const c = S.spot[S.at[t]];
    lamp(c.x, c.y, t);
  }
}

/** برگه‌های سرنخ: شماره چراغ و ✓/✗ کنارِ نشانِ هر فانوس. */
function drawClues() {
  paper(CLUE.x, CLUE.y, CLUE.w, CLUE.h, P.card, 21, 12, .34);
  text('سرنخ‌ها', CLUE.x + CLUE.w - 22, CLUE.y + 30, { size: 22, family: 'Lalezar', color: P.ink, align: 'right' });
  /* راهنمای نشان‌ها */
  for (let i = 0; i < 3; i++) {
    const x = CLUE.x + 60 + i * 96;
    emblem(x, CLUE.y + 28, i, 11, RING[i].d);
    text(RING[i].n, x + 22, CLUE.y + 29, { size: 14, color: P.inkSoft, align: 'left' });
  }
  ctx.strokeStyle = 'rgba(42, 35, 56, .22)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(CLUE.x + 22, CLUE.y + 50); ctx.lineTo(CLUE.x + CLUE.w - 22, CLUE.y + 50); ctx.stroke();

  const byTok = {};
  for (const q of S.clues) byTok[q.tok] = q;
  const cols = 2, cw = (CLUE.w - 48) / cols;
  for (let t = 0; t < 7; t++) {
    const col = t % cols, row = Math.floor(t / cols);
    const x = CLUE.x + 24 + (cols - 1 - col) * cw, y = CLUE.y + 70 + row * 74;
    const q = byTok[t];
    const solved = S.at[t] > 0;
    ctx.fillStyle = solved ? 'rgba(93, 162, 111, .14)' : 'rgba(42, 35, 56, .05)';
    ctx.beginPath(); rrPath(x, y, cw - 10, 66, 10); ctx.fill();
    ctx.strokeStyle = solved ? 'rgba(93, 162, 111, .6)' : 'rgba(42, 35, 56, .14)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); rrPath(x, y, cw - 10, 66, 10); ctx.stroke();
    /* شمارهٔ چراغ */
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); ctx.arc(x + cw - 40, y + 33, 19, 0, TAU); ctx.fill();
    ctx.fillStyle = P.glass;
    ctx.beginPath(); ctx.arc(x + cw - 40, y + 33, 16, 0, TAU); ctx.fill();
    numText(fa(t + 1), x + cw - 40, y + 34, { size: 20, color: '#4a3208' });
    if (!q) {
      text('بی‌سرنخ', x + 62, y + 34, { size: 16, color: 'rgba(42, 35, 56, .45)' });
      continue;
    }
    /* نشانه‌ها */
    const marks = q.t === 'exact'
      ? [0, 1, 2].map((s) => ({ s, on: hasShape(q.reg, s) }))
      : [{ s: q.s, on: q.t === 'in' }];
    const bw = marks.length * 62;
    for (let m = 0; m < marks.length; m++) {
      const mx = x + 30 + (bw - 62) / 2 - (m - (marks.length - 1) / 2) * 62 + 0;
      const mk = marks[m];
      emblem(mx, y + 27, mk.s, 12, RING[mk.s].d);
      ctx.strokeStyle = mk.on ? P.good : P.bad; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      ctx.beginPath();
      if (mk.on) { ctx.moveTo(mx - 9, y + 50); ctx.lineTo(mx - 3, y + 56); ctx.lineTo(mx + 10, y + 43); }
      else { ctx.moveTo(mx - 8, y + 44); ctx.lineTo(mx + 8, y + 56); ctx.moveTo(mx + 8, y + 44); ctx.lineTo(mx - 8, y + 56); }
      ctx.stroke();
    }
  }
}

function drawTray() {
  text('چراغ‌ها', TRAY.x + TRAY.w - 22, TRAY.y + 32, { size: 20, family: 'Lalezar', color: P.brassLt, align: 'right' });
  text('بردار و در حیاط بگذار', TRAY.x + 130, TRAY.y + 33, { size: 14, color: 'rgba(244, 236, 217, .5)' });
  for (let t = 0; t < 7; t++) {
    const b = traySlot(t);
    if (S.at[t] > 0 || S.held === t) {
      ctx.strokeStyle = 'rgba(207, 167, 78, .3)'; ctx.lineWidth = 1.6; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + 34, lampR, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      continue;
    }
    const hot = S.hover && S.hover.k === 'tray' && S.hover.t === t;
    lamp(b.x + b.w / 2, b.y + 34 - (hot ? 5 : 0), t);
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(13, 10, 24, .93)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(207, 167, 78, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 266 - i * 30;
    ctx.save();
    ctx.globalAlpha = i < S.lamps ? 1 : .22;
    ctx.fillStyle = i < S.lamps ? P.glass : '#5c5570';
    ctx.beginPath(); ctx.arc(x, HUD_H / 2 + 1, 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = i < S.lamps ? P.brass : '#7d7590'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, HUD_H / 2 + 1, 11, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(244, 236, 217, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
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
    spot([{ x: 150, y: 146, w: 510, h: 480 }], .76);
    const h = tutCard(636, 200, 540,
      ['سه فانوس، سه حلقهٔ نور که روی هم افتاده‌اند.', 'هفت جای جدا درست می‌شود و هر جا یک چراغ می‌گیرد.'], 'سه حلقهٔ نور');
    tutMore(906, 200 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: CLUE.x, y: CLUE.y, w: CLUE.w, h: CLUE.h }, { x: TRAY.x, y: TRAY.y, w: TRAY.w, h: TRAY.h }], .72);
    tutCard(60, 250, 540, ['چراغ را بردار و آنجا بگذار که سرنخش می‌گوید:',
      '✓ یعنی داخلِ آن حلقه، ✗ یعنی بیرونش.']);
  } else {
    spot([{ x: CLUE.x, y: CLUE.y, w: CLUE.w, h: CLUE.h }], .74);
    const h = tutCard(40, 190, 560,
      ['یکی از چراغ‌ها سرنخ ندارد و بعضی سرنخ‌ها نیمه‌اند.',
       'جایی که چراغِ دیگری گرفته، دیگر جای این یکی نیست:',
       'حالت‌های نامطلوب را حذف کن تا یک جا بماند.'], 'حذف کن');
    tutMore(320, 190 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function ringsIcon(x, y) {
  const r = 22, d = 15;
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + i / 3 * TAU;
    ctx.strokeStyle = RING[i].c; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r, 0, TAU); ctx.stroke();
  }
  ctx.fillStyle = P.glass;
  ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 800, h: 300, y: 128,
    paper: P.paper, band: P.brassDk, ink: P.ink, inkSoft: '#6a6280',
    icon: ringsIcon,
    title: 'سه حلقهٔ نور',
    body: 'سه فانوس، سه حلقهٔ نور روی هم: هفت جای جدا.\nهفت چراغِ شماره‌دار داری و هر جا فقط یک چراغ می‌گیرد.\nسرنخ‌ها می‌گویند هر چراغ داخلِ کدام حلقه هست (✓) و کدام نیست (✗).',
    btn: BTN_GO, btnLabel: 'فانوس‌ها را روشن کن', btnHot: S.hover === BTN_GO,
    btnFill: '#8f7327', btnHotFill: '#b08f38',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#6a6280',
    icon: ringsIcon,
    title: L().endless ? 'سپیده زد' : 'همهٔ حیاط‌ها روشن شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ شب‌ها را گذراندی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'حیاطِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#8f7327', btnHotFill: '#b08f38',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#6a6280',
    icon: (x, y) => {
      ctx.fillStyle = '#6d6580';
      ctx.beginPath(); ctx.arc(x - 30, y, 13, 0, TAU); ctx.fill();
      ringsIcon(x + 30, y);
    },
    title: 'چراغ‌ها خاموش شد',
    body: 'امتیاز: ' + fa(S.score) + '\nاوّل سرنخ‌های کامل، بعد بقیّه با حذف کردن.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#8f7327', btnHotFill: '#b08f38',
  });
}

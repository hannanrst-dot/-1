/*!
title: کاروانِ شن — تقسیم
bg: #7d4258
*/

/* ═══════════════════════════════════════════════════════════════════════
   کاروانِ شن — ریاضی سوم، فصل ۴، درس ۵ (تقسیم)
   ───────────────────────────────────────────────────────────────────────
   تقسیم یعنی «پخشِ عادلانه». اینجا فعلِ فیزیکی‌اش پیدا شد:

     انگشتت را روی شترها بکِش — به هر شتری که انگشتت رد شود، یک بار
     می‌رسد. یک‌بار کشیدن یعنی یک دور پخش‌کردن.

   کاروان وقتی راه می‌افتد که بارِ همهٔ شترها یکی باشد و توی مِهار چیزی
   نمانده باشد. شترِ سنگین‌تر می‌لنگد و کاروان نمی‌رود — پس بچّه بدونِ
   هیچ عددی می‌بیند که «مساوی» یعنی چه.

   دو جورِ درس، همان دو سؤالِ کتاب:
     • کاروانِ آماده  — شترها آماده‌اند، هر کدام چند بار برمی‌دارد؟  (۲۴÷۴)
     • بارِ اندازه    — هر شتر فقط تا خطِ زنبیلش جا دارد، چند شتر لازم است؟ (۲۴÷۳)

   طوفانِ شن از راست می‌آید. تا نرسیده باید کاروان رفته باشد.
   هیچ‌جای بازی جوابی نوشته نمی‌شود؛ جوابْ همان کوهِ بارِ روی شتر است.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  sky1: '#f9d382', sky2: '#ea8a53', sky3: '#7d4258',
  sun:  '#fff2c8',
  dune1:'#eec98d', dune2:'#d9a969', dune3:'#bb8a52', dune4:'#96683c',
  sand: '#f2d9a6',
  camel:'#b57c47', camelDk:'#8a5a30', camelLt:'#d6a771',
  sack: '#b8543f', sackDk:'#8c3b2c', sackLt:'#d97a5c',
  sackB:'#6f7f45', sackBDk:'#4e5c2e',
  rope: '#8a6b3f', wood:'#7a5230', woodDk:'#523318',
  paper:'#fbf1dc', ink:'#4a3520', inkSoft:'#9a7f5f',
  good: '#6f9a4e', bad: '#c9503f', gold:'#eeb840',
  storm:'#c9a06a',
};

const LEVELS = [
  { name: 'راهِ نزدیک', kind: 'A', maxK: 3, maxQ: 5, time: 44, quota: 3,
    hint: 'انگشتت را روی شترها بکِش تا بار پخش شود.' },
  { name: 'زنبیل‌های اندازه', kind: 'B', maxK: 4, maxQ: 4, time: 42, quota: 3,
    hint: 'زنبیل‌ها خطِ پُری دارند. هر جای خالی را بزن تا شتر بیاید.' },
  { name: 'بارِ نابرابر', kind: 'C', maxK: 6, maxQ: 7, time: 42, quota: 4,
    hint: 'بعضی شترها از قبل بار دارند. برعکس بکِش تا پس بگیری.' },
  { name: 'طوفانِ شن', kind: 'M', maxK: 8, maxQ: 8, time: 34, quota: 5,
    hint: 'طوفان تندتر می‌آید. زود پخش کن.' },
  { name: 'جادّهٔ بی‌پایان', kind: 'M', maxK: 8, maxQ: 8, time: 34, endless: true,
    hint: 'تا وقتی مشکِ آب داری، بار ببر.' },
];

const HUD_H = 52;
const JOURNAL = { x: 22, y: 64, w: 262, h: 152 };
const PILE    = { x: 22, y: 230, w: 262, h: 410 };
const BAND    = { x: 316, y: 402, w: 866, h: 320 };
const BTN_GO  = { x: 470, y: 566, w: 260, h: 76 };
const PITCH = 108, GROUND = 646, HORIZON = 452;

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  kind: 'A',
  need: 0,            // ظرفیتِ زنبیل در بارِ اندازه
  pile: 0, total: 0,
  camels: [],         // { load, x, tx, walk, bob, gone }
  fly: [],
  storm: 0, stormOn: true,
  water: 3,           // مشکِ آب = جان
  score: 0, best: 0, combo: 0,
  cleared: 0, quota: 0,
  banner: null, log: [],
  sw: null,           // کشیدنِ انگشت
  t: 0, phaseT: 0, hover: null, shake: 0, blow: 0,
  grains: [], depart: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const maxCamels = () => Math.min(8, L().maxK);
const KINDS = ['A', 'B', 'C'];
const roundKind = () => (L().kind === 'M' ? pick(KINDS, Math.random() * 999) : L().kind);

function loadBest() { try { return +localStorage.getItem('karevan-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('karevan-best', String(v)); } catch { /* حالتِ خصوصی */ } }

/* جای هر شتر روی خط، وقتی n شتر داریم. */
function slotX(i, n) { return 749 - (n - 1) * PITCH / 2 + i * PITCH; }
function reflow() { S.camels.forEach((c, i) => { c.tx = slotX(i, S.camels.length); }); }
function newCamel(x) { return { load: 0, x, tx: x, bob: Math.random() * TAU, kick: 0, gone: 0 }; }

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 70; i++) {
  S.grains.push({ x: Math.random() * SCENE_W, y: HORIZON + Math.random() * (SCENE_H - HORIZON),
                  sp: 40 + Math.random() * 120, r: .8 + Math.random() * 1.8, a: .1 + Math.random() * .25 });
}
whenFontsReady(() => runLoop(step));

function newRound() {
  const lv = L();
  S.kind = roundKind();
  S.storm = 0;
  S.fly = [];
  S.depart = 0;
  const k = 2 + Math.floor(Math.random() * (Math.min(lv.maxK, 8) - 1));
  const CAP = 42;                       // بیش از این، شمردنش برای بچّه خسته‌کننده است
  if (S.kind === 'B') {
    const m = clamp(2 + Math.floor(Math.random() * 4), 2, Math.max(2, Math.floor(CAP / k)));
    S.need = m;
    S.total = S.pile = m * k;
    S.camels = [newCamel(slotX(0, 1))];                             // بقیه را خودش می‌آورد
  } else {
    const q = clamp(2 + Math.floor(Math.random() * (lv.maxQ - 1)), 2, Math.max(2, Math.floor(CAP / k)));
    S.need = 0;
    S.total = k * q;
    S.camels = [];
    for (let i = 0; i < k; i++) S.camels.push(newCamel(slotX(i, k)));
    if (S.kind === 'C') {
      /* بارِ نابرابرِ از پیش‌بسته: مجموعش هرچه باشد، با پس‌گرفتن حل می‌شود. */
      let left = S.total;
      for (let tries = 0; tries < 30; tries++) {
        const pre = S.camels.map(() => Math.floor(Math.random() * (q + 2)));
        const sum = pre.reduce((a, v) => a + v, 0);
        const same = pre.every((v) => v === pre[0]);
        if (sum > S.total - 1 || same || sum < 2) continue;
        S.camels.forEach((c, i) => { c.load = pre[i]; });
        left = S.total - sum;
        break;
      }
      S.pile = left;
    } else {
      S.pile = S.total;
    }
  }
  reflow();
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.banner = null;
  S.log = [];
  if (!keep) { S.water = 3; S.score = 0; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newRound();
  if (S.tut.on) { S.kind = 'A'; S.total = S.pile = 6; S.camels = [newCamel(0), newCamel(0), newCamel(0)]; reflow();
    S.camels.forEach((c) => { c.x = c.tx; }); }
  toast.say(lv.hint, 'info');
}

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.blow > 0) S.blow -= dt;
  if (S.banner) { S.banner.t += dt; if (S.banner.t > 2.6) S.banner = null; }

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.depart && L().time) {
      S.storm += dt / L().time;
      if (S.storm >= 1) stormHit();
    }
    if (S.depart > 0) {
      S.depart += dt;
      for (const c of S.camels) c.x += (240 + c.gone * 40) * dt;
      if (S.depart > 1.9) { S.depart = 0; newRound(); }
    }
  }

  for (const c of S.camels) {
    c.bob += dt * 2.2;
    if (c.kick > 0) c.kick -= dt;
    if (!S.depart) c.x += (c.tx - c.x) * Math.min(1, dt * 8);
  }
  for (const f of S.fly) f.t += dt;
  S.fly = S.fly.filter((f) => f.t < f.dur);
  for (const g of S.grains) {
    g.x -= (g.sp + S.storm * 200) * dt;
    if (g.x < -6) { g.x = SCENE_W + 6; g.y = HORIZON + Math.random() * (SCENE_H - HORIZON); }
  }
  if (S.tut.on && S.phase === 'play') tutStep(dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── پخشِ بار ───────── */

const capacity = () => (S.kind === 'B' ? S.need : 99);
const loads = () => S.camels.map((c) => c.load);
const allEqual = () => S.camels.length > 0 && loads().every((v) => v === S.camels[0].load && v > 0);

function pileSpot(i) {
  const col = i % 6, row = Math.floor(i / 6);
  return { x: PILE.x + 32 + col * 40, y: PILE.y + PILE.h - 46 - row * 40 };
}

function flySack(x0, y0, x1, y1, back) {
  S.fly.push({ x0, y0, x1, y1, t: 0, dur: .3, back, seed: Math.random() * 99 });
}

function give(i) {
  const c = S.camels[i];
  if (S.pile <= 0) return false;
  if (c.load >= capacity()) { c.kick = .25; sfx.nope(); return false; }
  const s = pileSpot(S.pile - 1);
  S.pile--; c.load++;
  flySack(s.x, s.y, c.x, GROUND - 79 - (c.load - 1) * 15, false);
  sfx.tone(300 + c.load * 26, .07, 'triangle', .05);
  c.kick = .18;
  return true;
}

function take(i) {
  const c = S.camels[i];
  if (c.load <= 0) return false;
  const s = pileSpot(S.pile);
  flySack(c.x, GROUND - 79 - (c.load - 1) * 15, s.x, s.y, true);
  c.load--; S.pile++;
  sfx.tone(240 - c.load * 8, .06, 'sine', .05);
  c.kick = .14;
  return true;
}

/** کاروان خودش راه می‌افتد؛ نه دکمه‌ای، نه تأییدی. */
function checkDepart() {
  if (S.depart || S.pile !== 0 || !allEqual()) return;
  if (S.kind === 'B' && S.camels[0].load !== S.need) return;
  const n = S.camels.length, q = S.camels[0].load;
  S.depart = .001;
  S.combo++;
  S.cleared++;
  const speedBonus = Math.round((1 - S.storm) * 400);
  const pts = 200 + S.total * 8 + speedBonus + Math.min(S.combo, 6) * 60;
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  S.banner = { t: 0, head: `${fa(S.total)} ÷ ${fa(n)}`, q, n };
  S.log.unshift({ txt: `${fa(S.total)} ÷ ${fa(n)}`, q });
  if (S.log.length > 4) S.log.pop();
  bits.confetti(749, 470, 46, [P.gold, P.sackLt, '#fff', P.camelLt]);
  sfx.win();
  S.camels.forEach((c, i) => { c.gone = i; });
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 600; S.phase = 'won'; S.phaseT = 0; }
}

function stormHit() {
  S.water--;
  S.combo = 0;
  S.shake = .55; S.blow = 1.1;
  sfx.nope();
  bits.add(1000, 520, 34, 'dot', [P.storm, '#e2c79c', '#a8845a'],
    { speed: 420, lift: 60, size: 5, life: .9, grav: 120 });
  toast.say('طوفان رسید! بار پراکنده شد.', 'bad');
  if (S.water <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  newRound();
}

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 2 && S.tut.t > 40) S.tut.on = false;
}

/* ───────── ورودی ───────── */

/** کدام شتر زیرِ این نقطه است؟ */
function camelAt(p) {
  if (p.y < BAND.y || p.y > BAND.y + BAND.h) return -1;
  for (let i = 0; i < S.camels.length; i++) {
    if (Math.abs(p.x - S.camels[i].x) < PITCH / 2 - 4) return i;
  }
  return -1;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  cv.style.cursor = camelAt(p) >= 0 ? 'grab' : 'default';
  if (!S.sw) return;
  const w = S.sw;
  w.moved += Math.abs(p.x - w.lx) + Math.abs(p.y - w.ly);
  if (!w.dir && Math.abs(p.x - w.x0) > 16) w.dir = p.x > w.x0 ? 1 : -1;
  w.lx = p.x; w.ly = p.y;
  if (!w.dir || S.depart) return;
  const i = camelAt(p);
  if (i >= 0 && w.seen.indexOf(i) < 0) {
    w.seen.push(i);
    if (w.dir > 0) give(i); else take(i);
    checkDepart();
    if (S.tut.on && S.tut.step === 1 && w.seen.length >= 2) { S.tut.step = 2; S.tut.t = 0; }
  }
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
  S.sw = { x0: p.x, y0: p.y, lx: p.x, ly: p.y, dir: 0, moved: 0, seen: [] };
  try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
});

function endSweep(p) {
  const w = S.sw;
  S.sw = null;
  if (!w || S.depart || S.phase !== 'play') return;
  if (w.moved > 14 || w.seen.length) return;          // کشیدن بود، نه ضربه
  /* ضربه: شتر آوردن یا فرستادن — فقط در «بارِ اندازه» */
  if (S.kind !== 'B') { S.shake = .1; return; }
  const i = camelAt(p);
  if (i >= 0) {
    if (S.camels[i].load > 0) { S.camels[i].kick = .3; sfx.nope(); return; }
    if (S.camels.length <= 1) { S.camels[i].kick = .3; sfx.nope(); return; }
    S.camels.splice(i, 1); reflow(); sfx.tone(220, .12, 'sine', .06);
  } else if (p.y >= BAND.y && p.y <= BAND.y + BAND.h) {
    if (S.camels.length >= maxCamels()) { S.shake = .12; sfx.nope(); return; }
    const n = S.camels.length + 1;
    S.camels.push(newCamel(SCENE_W + 90));
    reflow();
    sfx.tone(420, .12, 'triangle', .06);
  }
  checkDepart();
}

cv.addEventListener('pointerup', (e) => endSweep(toStage(e)));
cv.addEventListener('pointercancel', () => { S.sw = null; });
cv.addEventListener('pointerleave', () => { S.sw = null; S.hover = null; });

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
  ctx.fillStyle = `rgba(60, 30, 20, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

/** یک بارِ کوچک (کیسه). */
function sack(x, y, s, alt, seed) {
  const c = alt ? P.sackB : P.sack, d = alt ? P.sackBDk : P.sackDk;
  const w = s * .46, hb = s * .46, ht = s * .5;
  const body = (o) => {
    ctx.beginPath();
    ctx.moveTo(x - w - o, y + hb);
    ctx.quadraticCurveTo(x - w * 1.12 - o, y - s * .1, x - w * .42, y - ht + o);
    ctx.lineTo(x + w * .42, y - ht + o);
    ctx.quadraticCurveTo(x + w * 1.12 + o, y - s * .1, x + w + o, y + hb);
    ctx.quadraticCurveTo(x, y + hb + s * .16, x - w - o, y + hb);
    ctx.closePath();
  };
  ctx.fillStyle = d; body(1.4); ctx.fill();
  ctx.fillStyle = c; body(0); ctx.fill();
  /* نورِ گوشهٔ چپِ بالا */
  ctx.save(); body(0); ctx.clip();
  ctx.fillStyle = 'rgba(255, 240, 210, .22)';
  ctx.beginPath(); ctx.moveTo(x - w, y + hb); ctx.lineTo(x - w * .4, y - ht); ctx.lineTo(x - w * .05, y - ht);
  ctx.lineTo(x - w * .5, y + hb); ctx.closePath(); ctx.fill();
  ctx.restore();
  /* بندِ دورِ دهانه */
  ctx.strokeStyle = P.rope; ctx.lineWidth = Math.max(1.4, s * .09);
  ctx.beginPath(); ctx.moveTo(x - w * .5, y - ht + s * .1); ctx.lineTo(x + w * .5, y - ht + s * .1); ctx.stroke();
  /* گرهٔ دهانه */
  ctx.fillStyle = P.rope;
  ctx.beginPath(); ctx.ellipse(x, y - ht - s * .04, w * .34, s * .1, 0, 0, TAU); ctx.fill();
}

/** تیرک‌ها و ریسمانِ «تا اینجا جا دارد». */
function loadLine(x, padY, cap, load) {
  const top = padY - 9 - (cap - 1) * 15 - 12;
  const full = load >= cap;
  ctx.strokeStyle = P.wood; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const dx of [-25, 25]) {
    ctx.beginPath(); ctx.moveTo(x + dx, padY + 4); ctx.lineTo(x + dx, top); ctx.stroke();
  }
  ctx.strokeStyle = full ? P.gold : 'rgba(74, 53, 32, .75)';
  ctx.lineWidth = full ? 6 : 4;
  ctx.beginPath(); ctx.moveTo(x - 30, top); ctx.lineTo(x + 30, top); ctx.stroke();
  /* پرچمکِ سرِ ریسمان */
  ctx.fillStyle = full ? P.gold : '#c07a3e';
  ctx.beginPath();
  ctx.moveTo(x + 30, top); ctx.lineTo(x + 47, top + 6); ctx.lineTo(x + 30, top + 12);
  ctx.closePath(); ctx.fill();
}

/** شتر — پیکرهٔ ساده و گرم، با زنبیلِ بار روی کوهان. */
function drawCamel(c, i) {
  const bob = Math.sin(c.bob) * 2.4 + (c.kick > 0 ? Math.sin(S.t * 50) * 3 : 0);
  const x = c.x, y = GROUND + bob;
  ctx.save();
  /* سایه روی شن */
  ctx.fillStyle = 'rgba(120, 78, 44, .22)';
  wobbleEllipse(x + 8, GROUND + 16, 54, 11, 0, i * 3, 1.4); ctx.fill();

  ctx.save();
  ctx.translate(x, y); ctx.scale(.86, .86); ctx.translate(-x, -y);
  /* پاها */
  ctx.strokeStyle = P.camelDk; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) {
    const lx = x - 26 + k * 18, sw = Math.sin(c.bob + k * 1.6) * 3;
    ctx.beginPath(); ctx.moveTo(lx, y - 34); ctx.lineTo(lx + sw, y + 12); ctx.stroke();
  }
  /* تنه */
  ctx.fillStyle = P.camel;
  wobbleEllipse(x, y - 52, 44, 25, 0, i * 5 + 1, 1.8); ctx.fill();
  /* کوهان */
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 62);
  ctx.quadraticCurveTo(x - 4, y - 96, x + 16, y - 62);
  ctx.closePath(); ctx.fill();
  /* گردن و سر */
  ctx.strokeStyle = P.camel; ctx.lineWidth = 15; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 34, y - 58);
  ctx.quadraticCurveTo(x + 58, y - 76, x + 56, y - 100);
  ctx.stroke();
  ctx.fillStyle = P.camel;
  wobbleEllipse(x + 60, y - 106, 15, 10, -.3, i * 7 + 2, 1.2); ctx.fill();
  ctx.fillStyle = P.camelLt;
  wobbleEllipse(x + 70, y - 108, 7, 5, -.3, i * 7 + 5, .8); ctx.fill();
  /* گوش و چشم */
  ctx.fillStyle = P.camelDk;
  wobbleEllipse(x + 50, y - 116, 4, 6, .3, i + 9, .6); ctx.fill();
  ctx.fillStyle = '#3a2416';
  ctx.beginPath(); ctx.arc(x + 62, y - 109, 2.2, 0, TAU); ctx.fill();
  /* دُم */
  ctx.strokeStyle = P.camelDk; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x - 42, y - 58);
  ctx.quadraticCurveTo(x - 56, y - 46, x - 52 + Math.sin(c.bob * 1.3) * 4, y - 30); ctx.stroke();

  ctx.restore();

  /* پالان و بار — بیرون از مقیاسِ بدن تا با کیسه‌های مِهار هم‌اندازه بماند */
  const padY = y - 70;
  ctx.fillStyle = '#8d5f33';
  wobbleRect(x - 30, padY, 60, 13, 5, i * 13 + 4, 1); ctx.fill();
  ctx.fillStyle = '#b0824c';
  wobbleRect(x - 30, padY, 60, 5, 3, i * 13 + 6, .8); ctx.fill();
  if (S.kind === 'B') loadLine(x, padY, S.need, c.load);
  for (let k = 0; k < c.load; k++) {
    sack(x + (k % 2 ? 4 : -4), padY - 9 - k * 15, 27, S.kind === 'B', i * 11 + k);
  }
  ctx.restore();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.sky3);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 41) * k * .4);
  }
  drawSky();
  drawDunes();
  drawPile();
  const order = S.camels.map((c, i) => ({ c, i })).sort((a, b) => a.c.x - b.c.x);
  for (const o of order) drawCamel(o.c, o.i);
  drawFly();
  bits.draw();
  drawStorm();
  ctx.restore();

  drawJournal();
  drawBanner();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    ctx.save();
    ctx.translate(BAND.x + BAND.w / 2 - SCENE_W / 2, 0);
    toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
    ctx.restore();
  }
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.13, 'rgba(90, 44, 30, .34)');
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, HORIZON + 40);
  g.addColorStop(0, P.sky3);
  g.addColorStop(.45, P.sky2);
  g.addColorStop(1, P.sky1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, HORIZON + 40);

  /* خورشیدِ پایین‌رفته */
  const sx = 528, sy = HORIZON - 44;
  ctx.save();
  ctx.globalAlpha = .3;
  ctx.fillStyle = P.sun;
  wobbleCircle(sx, sy, 96, 3, 3); ctx.fill();
  ctx.restore();
  ctx.fillStyle = P.sun;
  wobbleCircle(sx, sy, 46, 5, 1.6); ctx.fill();

  /* پرنده‌های دور */
  ctx.strokeStyle = 'rgba(80, 44, 50, .38)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const bx = 640 + i * 62 + Math.sin(S.t * .4 + i) * 14, by = 150 + (i % 3) * 34;
    const f = Math.sin(S.t * 3 + i * 1.4) * 5;
    ctx.beginPath();
    ctx.moveTo(bx - 11, by + f); ctx.quadraticCurveTo(bx, by - 5, bx + 11, by + f);
    ctx.stroke();
  }
}

function drawDunes() {
  const bands = [
    { y: HORIZON, amp: 26, col: P.dune1, ph: 0, f: .0052 },
    { y: HORIZON + 54, amp: 34, col: P.dune2, ph: 2.1, f: .0041 },
    { y: HORIZON + 128, amp: 30, col: P.dune3, ph: 4.2, f: .0034 },
  ];
  for (const b of bands) {
    ctx.fillStyle = b.col;
    ctx.beginPath();
    ctx.moveTo(0, SCENE_H);
    ctx.lineTo(0, b.y);
    for (let x = 0; x <= SCENE_W; x += 12) {
      ctx.lineTo(x, b.y + Math.sin(x * b.f + b.ph) * b.amp + Math.sin(x * b.f * 2.6 + b.ph) * b.amp * .3);
    }
    ctx.lineTo(SCENE_W, SCENE_H);
    ctx.closePath(); ctx.fill();
  }
  /* شنِ جلو */
  ctx.fillStyle = P.sand;
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H); ctx.lineTo(0, GROUND + 6);
  for (let x = 0; x <= SCENE_W; x += 14) ctx.lineTo(x, GROUND + 6 + Math.sin(x * .009 + 1.4) * 9);
  ctx.lineTo(SCENE_W, SCENE_H); ctx.closePath(); ctx.fill();

  /* نخل‌های واحه، سمتِ چپ */
  drawPalm(350, HORIZON + 46, .92);
  drawPalm(398, HORIZON + 32, .72);

  /* دانه‌های شن در باد */
  ctx.save();
  for (const g of S.grains) {
    ctx.globalAlpha = g.a * (.5 + S.storm * .8);
    ctx.fillStyle = '#fff3d8';
    ctx.beginPath(); ctx.ellipse(g.x, g.y, g.r * 3, g.r, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawPalm(x, base, s) {
  ctx.save();
  ctx.translate(x, base);
  ctx.scale(s, s);
  ctx.strokeStyle = '#6b4a2c'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-10, -60, -4, -112); ctx.stroke();
  ctx.fillStyle = '#5c7a3a';
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * .52;
    ctx.save();
    ctx.translate(-4, -112);
    ctx.rotate(a + Math.sin(S.t * .8 + i) * .04);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(38, -14, 66, 6);
    ctx.quadraticCurveTo(36, 4, 0, 8);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/** مِهارِ بار — کیسه‌های پخش‌نشده روی حصیر. */
function drawPile() {
  withShadow(18, 8, .3, () => {
    ctx.fillStyle = '#c9a771';
    wobbleRect(PILE.x, PILE.y, PILE.w, PILE.h, 16, 21, 2.4); ctx.fill();
  }, '110, 70, 40');
  ctx.fillStyle = 'rgba(255, 244, 220, .3)';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(PILE.x + 10, PILE.y + 16 + i * 44, PILE.w - 20, 3);
  }
  ctx.strokeStyle = P.rope; ctx.lineWidth = 5;
  wobbleRect(PILE.x + 6, PILE.y + 6, PILE.w - 12, PILE.h - 12, 12, 23, 2); ctx.stroke();

  text('بارِ کاروان', PILE.x + PILE.w / 2, PILE.y + 26,
    { size: 22, family: 'Lalezar', color: '#5c3f22' });

  for (let i = 0; i < S.pile; i++) {
    const s = pileSpot(i);
    sack(s.x, s.y, 32, S.kind === 'B', i * 3 + 1);
  }
  if (S.pile === 0) {
    text('خالی شد', PILE.x + PILE.w / 2, PILE.y + PILE.h - 40,
      { size: 19, color: 'rgba(92, 63, 34, .55)' });
  }
}

function drawFly() {
  for (const f of S.fly) {
    const k = clamp(f.t / f.dur, 0, 1);
    const x = lerp(f.x0, f.x1, k);
    const y = lerp(f.y0, f.y1, k) - Math.sin(k * Math.PI) * 78;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((f.back ? -1 : 1) * k * 3.4);
    sack(0, 0, 28, S.kind === 'B', f.seed);
    ctx.restore();
  }
}

/** دیوارِ طوفان از سمتِ راست. */
function drawStorm() {
  const k = clamp(S.storm, 0, 1);
  const x = lerp(SCENE_W + 130, 900, k);
  ctx.save();
  const g = ctx.createLinearGradient(x - 150, 0, SCENE_W, 0);
  g.addColorStop(0, 'rgba(201, 160, 106, 0)');
  g.addColorStop(.45, `rgba(206, 166, 112, ${.34 + k * .34})`);
  g.addColorStop(1, `rgba(168, 124, 74, ${.55 + k * .42})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - 150, HUD_H);
  for (let y = HUD_H; y <= SCENE_H; y += 16) {
    ctx.lineTo(x - 150 + Math.sin(y * .03 + S.t * 3) * 22, y);
  }
  ctx.lineTo(SCENE_W, SCENE_H); ctx.lineTo(SCENE_W, HUD_H);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  if (k > .72) {
    ctx.save();
    ctx.globalAlpha = (k - .72) / .28 * (.5 + .5 * Math.sin(S.t * 8));
    text('طوفان!', SCENE_W - 96, 132, { size: 34, family: 'Lalezar', color: '#8b3a2c' });
    ctx.restore();
  }
}

/** دفترِ کاروان — سفرهای رفته. جواب با کیسه کشیده می‌شود، نه با عدد. */
function drawJournal() {
  const b = JOURNAL;
  withShadow(18, 8, .34, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 14, 41, 2.2); ctx.fill();
  }, '110, 70, 40');
  ctx.fillStyle = P.wood;
  wobbleRect(b.x, b.y, b.w, 10, 5, 43, 1); ctx.fill();
  text('دفترِ کاروان', b.x + b.w / 2, b.y + 34, { size: 22, family: 'Lalezar', color: P.ink });

  if (!S.log.length) {
    textWrap('هر کاروانی که راه بیفتد\nاینجا ثبت می‌شود.', b.x + b.w / 2, b.y + 76, b.w - 34,
      { size: 14, color: P.inkSoft, lineHeight: 22 });
    return;
  }
  for (let i = 0; i < S.log.length; i++) {
    const e = S.log[i], y = b.y + 68 + i * 30;
    ctx.save();
    ctx.globalAlpha = 1 - i * .18;
    numText(e.txt, b.x + b.w - 18, y, { size: 19, color: P.ink, align: 'right' });
    /* بارِ هر شتر، به شکلِ کیسه */
    const n = Math.min(e.q, 8);
    for (let k = 0; k < n; k++) sack(b.x + 26 + k * 17, y, 16, false, k * 5 + i);
    if (e.q > 8) numText('…', b.x + 26 + 8 * 17, y, { size: 15, color: P.inkSoft });
    ctx.restore();
  }
}

/** لحظهٔ راه‌افتادن: «۲۴ ÷ ۴» و بارِ یک شتر — بی هیچ عددِ جواب. */
function drawBanner() {
  if (!S.banner) return;
  const t = S.banner.t;
  const k = clamp(t / .22, 0, 1) * clamp((2.6 - t) / .5, 0, 1);
  const cx = BAND.x + BAND.w / 2, cy = 210;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.translate(0, (1 - easeOut(clamp(t / .4, 0, 1))) * 20);
  withShadow(24, 10, .4, () => {
    ctx.fillStyle = 'rgba(74, 53, 32, .92)';
    wobbleRect(cx - 240, cy - 54, 480, 108, 18, 61, 2.4); ctx.fill();
  }, '40, 20, 10');
  ctx.strokeStyle = 'rgba(238, 184, 64, .6)'; ctx.lineWidth = 3;
  wobbleRect(cx - 240, cy - 54, 480, 108, 18, 61, 2.4); ctx.stroke();
  numText(S.banner.head, cx, cy - 22, { size: 34, color: P.gold });
  const n = Math.min(S.banner.q, 10);
  const w = (n - 1) * 26;
  for (let i = 0; i < n; i++) sack(cx - w / 2 + i * 26, cy + 22, 24, false, i * 4 + 2);
  if (S.banner.q > 10) numText('…', cx + w / 2 + 22, cy + 22, { size: 20, color: P.paper });
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = 'rgba(74, 40, 46, .8)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(238, 184, 64, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);

  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });

  /* مشک‌های آب = جان */
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 206 - i * 34;
    ctx.save();
    ctx.globalAlpha = i < S.water ? 1 : .22;
    ctx.fillStyle = i < S.water ? '#5fa8c4' : '#8f8a86';
    ctx.beginPath();
    ctx.moveTo(x, HUD_H / 2 - 13);
    ctx.quadraticCurveTo(x + 12, HUD_H / 2 - 4, x + 8, HUD_H / 2 + 8);
    ctx.quadraticCurveTo(x, HUD_H / 2 + 16, x - 8, HUD_H / 2 + 8);
    ctx.quadraticCurveTo(x - 12, HUD_H / 2 - 4, x, HUD_H / 2 - 13);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2,
      { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }

  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(251, 241, 220, .55)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
}

/* ───────── آموزش ───────── */

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .45, () => {
    ctx.fillStyle = 'rgba(253, 245, 226, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '60, 30, 16');
  ctx.fillStyle = P.wood;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6b5236' }); yy += 30; }
  return h + 20;
}

/** دستی که روی شترها می‌کشد. */
function drawSwipeHand() {
  const n = S.camels.length;
  if (!n) return;
  const k = (S.t * .55) % 1;
  const x = lerp(S.camels[0].x - 40, S.camels[n - 1].x + 40, easeInOut(k));
  const y = GROUND - 44;
  ctx.save();
  ctx.globalAlpha = .35;
  ctx.strokeStyle = '#fff3d8'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(S.camels[0].x - 40, y); ctx.lineTo(S.camels[n - 1].x + 40, y); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.translate(x, y);
  withShadow(12, 5, .4, () => {
    ctx.fillStyle = '#f6dfc0';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(-9, -2, -10, 16);
    ctx.quadraticCurveTo(-11, 34, 0, 36);
    ctx.quadraticCurveTo(11, 34, 10, 16);
    ctx.quadraticCurveTo(9, -2, 0, -6);
    ctx.closePath(); ctx.fill();
    wobbleCircle(0, -12, 8, 4, 1); ctx.fill();
  }, '60, 30, 16');
  ctx.restore();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([PILE], .72);
    const h = tutCard(360, 250, 500,
      ['این بارها باید روی شترها برود.', 'ولی شترها با هم قهر می‌کنند:',
       'تا بارِ همه یکی نشود، کاروان راه نمی‌افتد.'], 'کاروانِ شن');
    tutMore(610, 250 + h + 16, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: S.camels[0].x - 70, y: GROUND - 150, w: (S.camels.length - 1) * PITCH + 140, h: 200 }], .68);
    drawSwipeHand();
    tutCard(360, 180, 500, ['انگشتت را روی شترها بکِش.',
      'به هر شتری که رد شوی، یک بار می‌رسد.'], 'یک دور پخش کن');
  } else {
    spot([{ x: S.camels[0].x - 70, y: GROUND - 190, w: (S.camels.length - 1) * PITCH + 140, h: 240 },
          PILE], .68);
    const h = tutCard(360, 150, 500,
      ['برعکس بکِش تا بار را پس بگیری.',
       'وقتی مِهار خالی شد و بارِ همه یکی بود،',
       'کاروان خودش راه می‌افتد.'], 'برعکس هم می‌شود');
    tutMore(610, 150 + h + 16, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function camelIcon(x, y) {
  ctx.save();
  ctx.translate(x - 8, y + 10); ctx.scale(.46, .46);
  ctx.fillStyle = P.camel;
  wobbleEllipse(0, -52, 44, 25, 0, 1, 1.8); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-22, -62); ctx.quadraticCurveTo(-4, -96, 16, -62); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = P.camel; ctx.lineWidth = 15; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(34, -58); ctx.quadraticCurveTo(58, -76, 56, -100); ctx.stroke();
  ctx.fillStyle = P.camel;
  wobbleEllipse(60, -106, 15, 10, -.3, 2, 1.2); ctx.fill();
  ctx.strokeStyle = P.camelDk; ctx.lineWidth = 7;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-26 + k * 18, -34); ctx.lineTo(-26 + k * 18, 12); ctx.stroke(); }
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 730, h: 268, y: 146,
    paper: P.paper, band: '#c07a3e', ink: P.ink, inkSoft: '#8a6a45',
    icon: camelIcon,
    title: 'کاروانِ شن',
    body: 'بار باید عادلانه روی شترها پخش شود.\nانگشتت را روی شترها بکِش — به هر کدام که رد شوی یک بار می‌رسد.\nتا طوفان نرسیده، کاروان را راه بینداز.',
    btn: BTN_GO, btnLabel: 'راه بیفت', btnHot: S.hover === BTN_GO,
    btnFill: '#a8643a', btnHotFill: '#bd7343',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: '#eeb840', ink: P.ink, inkSoft: '#8a6a45',
    icon: camelIcon,
    title: L().endless ? 'کاروان رسید' : 'به منزل رسیدی!',
    body: 'کیسه‌های امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ راه‌ها را رفتی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'راهِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#a8643a', btnHotFill: '#bd7343',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: '#c9503f', ink: P.ink, inkSoft: '#8a6a45',
    icon: (x, y) => { ctx.fillStyle = P.storm; wobbleCircle(x, y, 24, 151, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.4)'; wobbleCircle(x - 8, y - 6, 10, 153, 2); ctx.fill(); },
    title: 'طوفان کاروان را برد',
    body: 'کیسه‌های امتیاز: ' + fa(S.score) + '\nبارِ همهٔ شترها باید یکی باشد.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#a8643a', btnHotFill: '#bd7343',
  });
}

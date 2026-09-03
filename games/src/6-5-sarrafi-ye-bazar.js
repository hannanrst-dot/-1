/*!
title: صرّافیِ بازار — جمع با تعویض
bg: #1e1410
*/

/* ═══════════════════════════════════════════════════════════════════════
   صرّافیِ بازار — ریاضی سوم، فصل ۶، درس ۵ (جمع در جدولِ ارزشِ مکانی)
   ───────────────────────────────────────────────────────────────────────
   قلبِ این درس یک جملهٔ کتاب است: «اگر ۱۰ سکّهٔ ۱۰۰ ریالی را با یک سکّهٔ
   ۱۰۰۰ ریالی عوض کند…». یعنی همان «یکی به بالا بردن»، ولی با سکّه.

   پس صرّافِ بازار شدی. چهار سینیِ چوبی داری: هزارتایی، صدتایی، ده‌تایی
   و یکی. مشتری پولش را می‌ریزد روی پیشخوان و سکّه‌ها توی سینی‌ها جمع
   می‌شوند. قانونِ بازار یکی است:

       هیچ سینی‌ای حق ندارد ۱۰ سکّه یا بیشتر داشته باشد.

   سینیِ پُر کج می‌شود و کم‌کم می‌ریزد. باید اهرمِ برنجیِ زیرش را بکشی تا
   ۱۰ سکّه برود توی قیف و یک سکّهٔ بزرگ‌تر بیفتد توی سینیِ سمتِ چپ. گاهی
   همین یک سکّه، سینیِ بعدی را هم پُر می‌کند و باید دوباره عوض کنی —
   همان زنجیرهٔ «انتقال».

   عددِ جواب از پیش نوشته نمی‌شود؛ آخرِ کار خودِ سینی‌ها جواب‌اند.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

const P = {
  wall:  '#2a1c14', wallHi: '#40291d', wallLo: '#150d09',
  wood:  '#7a5029', woodDk: '#482c14', woodLt: '#a97444',
  cloth: '#6d1f28', clothDk: '#48111a', clothLt: '#8e2f39',
  brass: '#d0a94e', brassDk: '#95762b', brassLt: '#f4de9d',
  coin1: '#e8c96a', coin1d: '#a8892f',   // هزارتایی — طلایی
  coin2: '#cfd6dd', coin2d: '#8e979f',   // صدتایی — نقره‌ای
  coin3: '#c98a55', coin3d: '#8d5a2f',   // ده‌تایی — مسی
  coin4: '#9fb6a8', coin4d: '#66807a',   // یکی — برنزِ سبز
  lamp:  '#ffd28a',
  paper: '#f6e9cd', ink: '#33241a', inkSoft: '#8a765a',
  good:  '#6f9c56', bad: '#cd5b3f', gold: '#eab53f',
};

const COL = [
  { v: 1000, n: 'هزارتایی', c: '#e8c96a', d: '#a8892f' },
  { v: 100,  n: 'صدتایی',  c: '#cfd6dd', d: '#8e979f' },
  { v: 10,   n: 'ده‌تایی',  c: '#c98a55', d: '#8d5a2f' },
  { v: 1,    n: 'یکی',     c: '#9fb6a8', d: '#66807a' },
];

const LEVELS = [
  { name: 'دکّهٔ کوچک', carries: 1, tip: 15, time: 60, quota: 4,
    hint: 'سینی‌ای که ۱۰ سکّه یا بیشتر دارد کج می‌شود. اهرمش را بکِش.' },
  { name: 'بازارِ روز', carries: 2, tip: 13, time: 58, quota: 4,
    hint: 'گاهی سکّهٔ تازه سینیِ بعدی را هم پُر می‌کند.' },
  { name: 'زنجیره',    carries: 3, tip: 12, time: 56, quota: 5,
    hint: 'از سینیِ راست شروع کن؛ زنجیره خودش جلو می‌رود.' },
  { name: 'شبِ شلوغ',  carries: 3, tip: 10, time: 50, quota: 5,
    hint: 'سینی‌ها زودتر می‌ریزند. دست بجنبان.' },
  { name: 'تا بستنِ بازار', carries: 0, tip: 10, time: 50, endless: true,
    hint: 'تا بازار باز است، پول بشمار.' },
];

const HUD_H = 52;
const TRAY = { y: 226, w: 190, h: 226, gap: 22 };
const COUNTER = { y: 512 };
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',
  level: 0,
  a: 0, b: 0,
  cnt: [0, 0, 0, 0],
  tilt: [0, 0, 0, 0],
  pull: [0, 0, 0, 0],
  flyC: [],           // سکّه‌های در حالِ رفتن
  drag: null,
  need: 0, done: 0,
  solved: 0,
  timeLeft: 0,
  purses: 3,
  cleared: 0, quota: 0,
  score: 0, best: 0, combo: 0,
  spill: 0, log: [],
  t: 0, phaseT: 0, hover: null, shake: 0, nope: 0,
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function loadBest() { try { return +localStorage.getItem('sarraf-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('sarraf-best', String(v)); } catch { /* حالتِ خصوصی */ } }

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
whenFontsReady(() => runLoop(step));

/* ───────── دورِ تازه ───────── */

const dig = (v) => [Math.floor(v / 1000) % 10, Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10];

/** شمارشِ تعویض‌های لازم برای این جمع (با زنجیره). */
function carriesOf(cnt) {
  const c = cnt.slice();
  let n = 0, guard = 0;
  for (let i = 3; i >= 0 && guard++ < 40; i--) {
    while (c[i] >= 10) {
      c[i] -= 10;
      if (i > 0) c[i - 1]++;
      n++;
    }
  }
  return n;
}

function newRound() {
  const lv = L();
  const want = lv.carries || R(1, 3);
  for (let tries = 0; tries < 200; tries++) {
    const a = R(1000, 6000), b = R(1000, 3800);
    if (a + b > 9999) continue;
    const da = dig(a), db = dig(b);
    const cnt = [0, 1, 2, 3].map((i) => da[i] + db[i]);
    if (cnt[0] >= 10) continue;                 // از هزارتا بالاتر نداریم
    const n = carriesOf(cnt);
    if (n !== want) continue;
    S.a = a; S.b = b;
    S.cnt = cnt;
    S.need = n;
    S.done = 0;
    S.tilt = [0, 0, 0, 0];
    S.pull = [0, 0, 0, 0];
    S.flyC = [];
    S.solved = 0;
    return;
  }
  S.a = 4735; S.b = 2231;
  S.cnt = [6, 9, 6, 6]; S.need = 0; S.done = 0;
  S.tilt = [0, 0, 0, 0]; S.pull = [0, 0, 0, 0]; S.flyC = []; S.solved = 0;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  S.cleared = 0;
  S.quota = lv.endless ? Infinity : lv.quota;
  S.combo = 0;
  S.timeLeft = lv.time;
  S.log = [];
  if (!keep) { S.score = 0; S.purses = 3; }
  S.phase = 'play'; S.phaseT = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  newRound();
  toast.say(lv.hint, 'info');
}

/* ───────── حلقه ───────── */

function trayBox(i) {
  const total = 4 * TRAY.w + 3 * TRAY.gap;
  return { x: (SCENE_W - total) / 2 + i * (TRAY.w + TRAY.gap), y: TRAY.y, w: TRAY.w, h: TRAY.h };
}
function leverBox(i) {
  const b = trayBox(i);
  return { x: b.x + b.w / 2 - 46, y: b.y + b.h + 72, w: 92, h: 70 };
}

const overfull = () => S.cnt.some((c) => c >= 10);

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.nope > 0) S.nope -= dt;
  if (S.spill > 0) S.spill -= dt;
  for (let i = 0; i < 4; i++) {
    if (S.pull[i] > 0) S.pull[i] -= dt;
    const full = S.cnt[i] >= 10;
    if (S.phase === 'play' && !S.solved && full) S.tilt[i] += dt / L().tip;
    else S.tilt[i] = Math.max(0, S.tilt[i] - dt * 1.6);
    if (S.tilt[i] >= 1) { S.tilt[i] = 0; spill(i); }
  }
  for (const f of S.flyC) { f.t += dt; }
  S.flyC = S.flyC.filter((f) => f.t < f.dur);

  if (S.phase === 'play') {
    const frozen = S.tut.on && S.tut.step < 2;
    if (!frozen && !S.solved) {
      S.timeLeft -= dt;
      if (S.timeLeft <= 0) { S.timeLeft = 0; losePurse('بازار بسته شد!'); }
    }
    if (S.solved) { S.solved += dt; if (S.solved > 1.9) newRound(); }
    if (S.tut.on) S.tut.t += dt;
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

function spill(i) {
  S.spill = 1;
  const b = trayBox(i);
  bits.add(b.x + b.w / 2, b.y + b.h, 26, 'dot', [COL[i].c, COL[i].d, '#fff'],
    { speed: 320, lift: 120, size: 5, life: 1.1, grav: 900 });
  losePurse('سینی ریخت! سکّه‌ها پخشِ زمین شد.');
}

function losePurse(msg) {
  if (S.solved) return;
  S.purses--;
  S.combo = 0;
  S.shake = .5;
  sfx.nope();
  toast.say(msg, 'bad');
  if (S.purses <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.timeLeft = L().time;
  newRound();
}

/** اهرم: ۱۰ سکّه می‌رود توی قیف، یک سکّهٔ بزرگ‌تر می‌افتد سمتِ چپ. */
function exchange(i) {
  if (S.solved || S.phase !== 'play') return;
  if (i === 0) {
    S.nope = .7; sfx.nope();
    toast.say('بالاتر از هزارتایی سکّه نداریم.', 'bad');
    return;
  }
  if (S.cnt[i] < 10) {
    S.nope = .7; S.shake = .1; sfx.nope();
    toast.say('این سینی هنوز ۱۰ سکّه ندارد.', 'bad');
    return;
  }
  S.cnt[i] -= 10;
  S.cnt[i - 1] += 1;
  S.done++;
  S.pull[i] = .45;
  S.tilt[i] = 0;
  const from = trayBox(i), to = trayBox(i - 1);
  S.flyC.push({ x0: from.x + from.w / 2, y0: from.y + from.h - 40,
                x1: to.x + to.w / 2, y1: to.y + to.h - 40, t: 0, dur: .42, col: COL[i - 1] });
  sfx.tone(300 + (3 - i) * 90, .16, 'triangle', .06);
  bits.add(from.x + from.w / 2, from.y + from.h - 30, 12, 'dot', [COL[i].c, P.brassLt],
    { speed: 180, lift: 60, size: 4, life: .6, grav: 400 });
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
  if (!overfull()) win();
}

function win() {
  S.solved = .001;
  S.combo++;
  S.cleared++;
  const extra = Math.max(0, S.done - S.need);
  const pts = 280 + S.need * 120 + Math.round(S.timeLeft * 5) + Math.min(S.combo, 6) * 70 - extra * 60;
  S.score += Math.max(80, pts);
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  S.log.unshift({ a: S.a, b: S.b, s: S.a + S.b });
  if (S.log.length > 3) S.log.pop();
  bits.confetti(SCENE_W / 2, 380, 44, [P.brassLt, P.gold, '#fff', P.coin1]);
  sfx.win();
  toast.say('حساب صاف شد!', 'good');
  if (S.tut.on) S.tut.on = false;
  if (!L().endless && S.cleared >= S.quota) { S.score += 800; S.phase = 'won'; S.phaseT = 0; }
}

/* ───────── ورودی ───────── */

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  if (S.phase !== 'play') { S.hover = inRect(p, BTN_GO) ? BTN_GO : null; cv.style.cursor = S.hover ? 'pointer' : 'default'; return; }
  if (S.drag) { S.drag.y = p.y; return; }
  S.hover = null;
  for (let i = 1; i < 4; i++) if (inRect(p, leverBox(i))) S.hover = i;
  cv.style.cursor = S.hover !== null ? 'grab' : 'default';
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
  for (let i = 1; i < 4; i++) if (inRect(p, leverBox(i))) {
    S.drag = { i, y0: p.y, y: p.y };
    sfx.tap();
    try { cv.setPointerCapture(e.pointerId); } catch { /* بعضی مرورگرها */ }
    return;
  }
});

cv.addEventListener('pointerup', () => {
  const d = S.drag;
  S.drag = null;
  if (!d || S.phase !== 'play') return;
  exchange(d.i);
});

cv.addEventListener('pointercancel', () => { S.drag = null; });

const TUT_TAP = [0, 2], TUT_LAST = 2;

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
  ctx.fillStyle = `rgba(12, 7, 4, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(246, 233, 205, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '10, 6, 3');
  ctx.fillStyle = P.brassDk;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6d5b44' }); yy += 30; }
  return h + 20;
}

/** سکّه با حجم و برقِ لبه. */
function coin(x, y, r, c, d, seed) {
  ctx.save();
  ctx.fillStyle = d;
  ctx.beginPath(); ctx.ellipse(x, y + 2.5, r, r * .92, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = ball(x, y, r, shade(c, .35), c, shade(d, -.2));
  ctx.beginPath(); ctx.ellipse(x, y, r, r * .92, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = shade(c, .45); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(x, y, r * .74, r * .68, 0, 0, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.beginPath(); ctx.ellipse(x - r * .34, y - r * .36, r * .3, r * .18, -.6, 0, TAU); ctx.fill();
  ctx.restore();
}

function paintShopStatic() {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  g.addColorStop(0, P.wallLo);
  g.addColorStop(.42, P.wall);
  g.addColorStop(1, P.wallHi);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  ctx.globalAlpha = .45;
  ctx.fillStyle = texWood('#3a2416', '#1b100a');
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.restore();
  /* گره‌چینیِ پشتِ صرّافی */
  ctx.save();
  ctx.globalAlpha = .16;
  ctx.strokeStyle = P.brass; ctx.lineWidth = 2.4;
  for (let x = -60; x < SCENE_W + 60; x += 58) {
    for (let y = 70; y < 500; y += 58) {
      ctx.beginPath();
      ctx.moveTo(x, y + 29); ctx.lineTo(x + 29, y); ctx.lineTo(x + 58, y + 29);
      ctx.lineTo(x + 29, y + 58); ctx.closePath(); ctx.stroke();
    }
  }
  ctx.restore();
  /* پیشخوانِ چوبی */
  ctx.fillStyle = P.woodDk;
  ctx.fillRect(0, COUNTER.y - 12, SCENE_W, SCENE_H - COUNTER.y + 12);
  ctx.fillStyle = texWood(P.wood, P.woodDk);
  ctx.fillRect(0, COUNTER.y, SCENE_W, SCENE_H - COUNTER.y);
  const cg = ctx.createLinearGradient(0, COUNTER.y, 0, SCENE_H);
  cg.addColorStop(0, 'rgba(255, 220, 160, .26)');
  cg.addColorStop(.35, 'rgba(0,0,0,0)');
  cg.addColorStop(1, 'rgba(0,0,0,.4)');
  ctx.fillStyle = cg;
  ctx.fillRect(0, COUNTER.y, SCENE_W, SCENE_H - COUNTER.y);
  ctx.fillStyle = P.woodLt;
  ctx.fillRect(0, COUNTER.y, SCENE_W, 3);
  /* پارچهٔ مخملِ زیرِ سینی‌ها */
  ctx.fillStyle = P.clothDk;
  ctx.beginPath(); rrPath(120, TRAY.y - 26, SCENE_W - 240, TRAY.h + 64, 18); ctx.fill();
  ctx.fillStyle = texCloth(P.cloth, P.clothDk);
  ctx.beginPath(); rrPath(126, TRAY.y - 20, SCENE_W - 252, TRAY.h + 52, 14); ctx.fill();
  ctx.strokeStyle = P.brassDk; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(126, TRAY.y - 20, SCENE_W - 252, TRAY.h + 52, 14); ctx.stroke();
  /* چراغِ آویز */
  ctx.strokeStyle = '#2c1d12'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(SCENE_W / 2, HUD_H); ctx.lineTo(SCENE_W / 2, 108); ctx.stroke();
  ctx.fillStyle = P.brassDk;
  ctx.beginPath();
  ctx.moveTo(SCENE_W / 2 - 46, 150); ctx.lineTo(SCENE_W / 2 - 16, 108);
  ctx.lineTo(SCENE_W / 2 + 16, 108); ctx.lineTo(SCENE_W / 2 + 46, 150);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.brass;
  ctx.beginPath();
  ctx.moveTo(SCENE_W / 2 - 40, 146); ctx.lineTo(SCENE_W / 2 - 14, 111);
  ctx.lineTo(SCENE_W / 2 + 14, 111); ctx.lineTo(SCENE_W / 2 + 40, 146);
  ctx.closePath(); ctx.fill();
  /* نورِ چراغ روی پیشخوان */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const lg = ctx.createLinearGradient(0, 150, 0, SCENE_H);
  lg.addColorStop(0, 'rgba(150, 112, 52, .5)');
  lg.addColorStop(1, 'rgba(70, 52, 22, 0)');
  ctx.fillStyle = lg;
  for (const k of [1, .68]) {
    ctx.globalAlpha = k * .45;
    ctx.beginPath();
    ctx.moveTo(SCENE_W / 2 - 40 * k, 150); ctx.lineTo(SCENE_W / 2 + 40 * k, 150);
    ctx.lineTo(SCENE_W / 2 + 520 * k, SCENE_H); ctx.lineTo(SCENE_W / 2 - 520 * k, SCENE_H);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene(P.wall);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  ctx.drawImage(staticLayer('shop', SCENE_W, SCENE_H, paintShopStatic), 0, 0, SCENE_W, SCENE_H);
  /* حبابِ چراغ که سوسو می‌زند */
  ctx.fillStyle = P.lamp;
  ctx.beginPath(); ctx.ellipse(SCENE_W / 2, 149, 38 * (.95 + Math.sin(S.t * 6) * .05), 10, 0, 0, TAU); ctx.fill();
  drawBill();
  drawTrays();
  drawLevers();
  drawFly();
  drawLedger();
  bits.draw();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 10, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();
  endScene(.1, 'rgba(8, 4, 2, .52)', .42, .16);
}

/** برگهٔ مشتری: دو مبلغ، بی هیچ جواب. */
function drawBill() {
  const w = 470, h = 72, x = SCENE_W / 2 - w / 2, y = 112;
  ctx.fillStyle = 'rgba(12, 7, 4, .35)';
  ctx.beginPath(); rrPath(x + 3, y + 5, w, h, 12); ctx.fill();
  paper(x, y, w, h, P.paper, 41, 12, .3);
  ctx.strokeStyle = 'rgba(149, 118, 43, .5)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(x + 8, y + 8, w - 16, h - 16, 8); ctx.stroke();
  text('داشت', x + w - 40, y + 30, { size: 15, color: P.inkSoft, align: 'right' });
  numText(fa(S.a), x + w - 130, y + 34, { size: 30, color: P.ink });
  text('آورد', x + 176, y + 30, { size: 15, color: P.inkSoft, align: 'right' });
  numText(fa(S.b), x + 74, y + 34, { size: 30, color: P.ink });
  text('+', x + w / 2 - 6, y + 34, { size: 26, family: 'Lalezar', color: '#95762b' });
  text('ریال', x + w / 2, y + h - 16, { size: 13, color: P.inkSoft });
}

function drawTrays() {
  for (let i = 0; i < 4; i++) {
    const b = trayBox(i), c = COL[i];
    const full = S.cnt[i] >= 10;
    const tl = S.tilt[i];
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h);
    ctx.rotate(Math.sin(S.t * 9) * tl * .05);
    ctx.translate(-(b.x + b.w / 2), -(b.y + b.h));
    /* سینیِ چوبی */
    contact(b.x + b.w / 2, b.y + b.h + 8, b.w * .46, 12, .5);
    ctx.fillStyle = P.woodDk;
    wobbleRect(b.x - 6, b.y - 6, b.w + 12, b.h + 12, 12, i, 1.6); ctx.fill();
    ctx.save();
    ctx.beginPath(); wobbleRect(b.x, b.y, b.w, b.h, 10, i + 3, 1.4); ctx.clip();
    ctx.fillStyle = texWood('#6a441f', '#3a2210');
    ctx.fillRect(b.x, b.y, b.w, b.h);
    const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
    g.addColorStop(0, 'rgba(0,0,0,.4)');
    g.addColorStop(.35, 'rgba(255,220,160,.1)');
    g.addColorStop(1, 'rgba(0,0,0,.35)');
    ctx.fillStyle = g;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.restore();
    ctx.strokeStyle = full ? P.bad : P.brassDk;
    ctx.lineWidth = full ? 4 : 2.6;
    wobbleRect(b.x, b.y, b.w, b.h, 10, i + 3, 1.4); ctx.stroke();

    /* سکّه‌ها: سه‌تا در هر ردیف، از پایین */
    const n = Math.min(S.cnt[i], 18);
    for (let k = 0; k < n; k++) {
      const col = k % 3, row = Math.floor(k / 3);
      const x = b.x + 44 + col * 51 + (row % 2 ? 8 : 0);
      const y = b.y + b.h - 34 - row * 33;
      coin(x, y, 22, c.c, c.d, i * 7 + k);
    }
    if (S.cnt[i] > 18) numText('+' + fa(S.cnt[i] - 18), b.x + b.w - 26, b.y + 24, { size: 18, color: P.paper });
    ctx.restore();

    /* پلاکِ برنجیِ بالای سینی */
    ctx.fillStyle = shade(P.brassDk, -.3);
    ctx.beginPath(); rrPath(b.x + 12, b.y - 34, b.w - 24, 30, 8); ctx.fill();
    const pg = ctx.createLinearGradient(0, b.y - 34, 0, b.y - 4);
    pg.addColorStop(0, P.brassLt); pg.addColorStop(1, P.brassDk);
    ctx.fillStyle = pg;
    ctx.beginPath(); rrPath(b.x + 13, b.y - 33, b.w - 26, 27, 7); ctx.fill();
    text(c.n, b.x + b.w / 2, b.y - 19, { size: 17, family: 'Lalezar', color: '#2c1f08' });

    /* شمارهٔ سکّه‌ها */
    const cy = b.y + b.h + 32;
    ctx.fillStyle = full ? 'rgba(150, 40, 26, .85)' : 'rgba(14, 9, 5, .7)';
    ctx.beginPath(); rrPath(b.x + b.w / 2 - 34, cy - 22, 68, 44, 10); ctx.fill();
    numText(fa(S.cnt[i]), b.x + b.w / 2, cy, { size: 28, color: full ? '#ffd9cf' : P.brassLt });

    /* هشدارِ سینیِ پُر */
    if (full) {
      ctx.save();
      ctx.globalAlpha = .3 + .35 * Math.sin(S.t * 7);
      ctx.strokeStyle = P.bad; ctx.lineWidth = 5;
      wobbleRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16, 13, i, 1.6); ctx.stroke();
      ctx.restore();
      /* نوارِ کج شدن */
      ctx.fillStyle = 'rgba(0,0,0,.45)';
      ctx.beginPath(); rrPath(b.x + 16, b.y + 10, b.w - 32, 12, 6); ctx.fill();
      ctx.fillStyle = tl > .6 ? P.bad : P.gold;
      ctx.beginPath(); rrPath(b.x + 18, b.y + 12, (b.w - 36) * clamp(tl, 0, 1), 8, 4); ctx.fill();
    }
  }
}

function drawLevers() {
  for (let i = 1; i < 4; i++) {
    const b = leverBox(i);
    const can = S.cnt[i] >= 10;
    const hot = S.hover === i;
    const dragging = S.drag && S.drag.i === i;
    const dy = dragging ? clamp(S.drag.y - S.drag.y0, 0, 30) : (S.pull[i] > 0 ? 22 * clamp(S.pull[i] / .45, 0, 1) : 0);
    /* شیارِ اهرم */
    ctx.fillStyle = 'rgba(10, 6, 3, .6)';
    ctx.beginPath(); rrPath(b.x + 30, b.y - 4, 32, b.h + 4, 16); ctx.fill();
    ctx.strokeStyle = P.brassDk; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(b.x + b.w / 2, b.y + 6); ctx.lineTo(b.x + b.w / 2, b.y + 34 + dy); ctx.stroke();
    /* دستهٔ اهرم */
    const ky = b.y + 42 + dy;
    if (can) {
      const gg = ctx.createRadialGradient(b.x + b.w / 2, ky, 2, b.x + b.w / 2, ky, 40);
      gg.addColorStop(0, 'rgba(244, 222, 157, .5)');
      gg.addColorStop(1, 'rgba(244, 222, 157, 0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(b.x + b.w / 2, ky, 40, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = shade(P.brassDk, -.4);
    ctx.beginPath(); ctx.arc(b.x + b.w / 2, ky + 4, 22, 0, TAU); ctx.fill();
    ctx.fillStyle = ball(b.x + b.w / 2, ky, 22,
      can ? P.brassLt : '#7d7159', can ? P.brass : '#5d543f', shade(can ? P.brassDk : '#42392a', -.3));
    ctx.beginPath(); ctx.arc(b.x + b.w / 2, ky, 22, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.beginPath(); ctx.ellipse(b.x + b.w / 2 - 7, ky - 8, 7, 4, -.6, 0, TAU); ctx.fill();
    text('تعویضِ ۱۰ تا', b.x + b.w / 2, b.y + b.h + 4,
      { size: 15, family: 'Lalezar', color: can ? P.brassLt : 'rgba(246, 233, 205, .35)' });
    if (hot && can) {
      ctx.save();
      ctx.globalAlpha = .5 + .3 * Math.sin(S.t * 6);
      ctx.strokeStyle = P.brassLt; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(b.x + b.w / 2, ky, 30, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }
}

function drawFly() {
  for (const f of S.flyC) {
    const k = clamp(f.t / f.dur, 0, 1);
    const x = lerp(f.x0, f.x1, k);
    const y = lerp(f.y0, f.y1, k) - Math.sin(k * Math.PI) * 110;
    coin(x, y, 22, f.col.c, f.col.d, 9);
  }
}

/** دفترِ حساب: مشتری‌های تمام‌شده — نوشتهٔ خودِ بچّه، نه جوابِ از پیش. */
function drawLedger() {
  const w = 560, h = 118, x = SCENE_W / 2 - w / 2, y = 632;
  ctx.fillStyle = 'rgba(14, 8, 4, .5)';
  ctx.beginPath(); rrPath(x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(208, 169, 78, .24)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(x, y, w, h, 14); ctx.stroke();
  text('دفترِ حساب', x + w / 2, y + 20, { size: 16, family: 'Lalezar', color: 'rgba(246, 233, 205, .7)' });
  if (!S.log.length) {
    text('هر مشتری که حسابش صاف شود، اینجا نوشته می‌شود.', x + w / 2, y + 62,
      { size: 15, color: 'rgba(246, 233, 205, .35)' });
    return;
  }
  for (let i = 0; i < S.log.length; i++) {
    const e = S.log[i], ly = y + 48 + i * 26;
    ctx.save();
    ctx.globalAlpha = 1 - i * .22;
    numText(fa(e.a) + ' + ' + fa(e.b) + ' = ' + fa(e.s), x + w / 2, ly,
      { size: 19, color: i ? 'rgba(244, 222, 157, .75)' : P.brassLt });
    ctx.restore();
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(24, 14, 8, .9)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(208, 169, 78, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 23, family: 'Lalezar', color: P.paper, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 206 - i * 32;
    ctx.save();
    ctx.globalAlpha = i < S.purses ? 1 : .22;
    ctx.fillStyle = i < S.purses ? '#8d4a2c' : '#6f675c';
    ctx.beginPath(); ctx.ellipse(x, HUD_H / 2 + 2, 11, 10, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = i < S.purses ? P.brassLt : '#8a8375'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x - 6, HUD_H / 2 - 8); ctx.lineTo(x + 6, HUD_H / 2 - 8); ctx.stroke();
    ctx.restore();
  }
  if (!L().endless) {
    numText(fa(Math.min(S.cleared, L().quota)) + ' / ' + fa(L().quota), SCENE_W / 2, HUD_H / 2, { size: 22, color: P.gold });
  } else {
    text('بی‌پایان', SCENE_W / 2, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.gold });
  }
  numText(fa(S.score), 24, HUD_H / 2, { size: 25, color: P.gold, align: 'left' });
  numText('بیشترین ' + fa(S.best), 140, HUD_H / 2 + 1,
    { size: 14, color: 'rgba(246, 233, 205, .5)', align: 'left', family: 'Vazirmatn', weight: 700 });
  if (S.combo > 1) numText('×' + fa(S.combo), 248, HUD_H / 2, { size: 22, color: P.gold, align: 'left' });
  /* ساعتِ بازار */
  const k = clamp(S.timeLeft / L().time, 0, 1);
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.beginPath(); rrPath(SCENE_W / 2 - 150, HUD_H - 8, 300, 6, 3); ctx.fill();
  ctx.fillStyle = k > .3 ? P.brass : P.bad;
  ctx.beginPath(); rrPath(SCENE_W / 2 - 150, HUD_H - 8, 300 * k, 6, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: 126, y: TRAY.y - 40, w: SCENE_W - 252, h: TRAY.h + 80 }], .74);
    const h = tutCard(300, 566, 600,
      ['پولِ مشتری توی چهار سینی ریخته شده.', 'قانونِ بازار: هیچ سینی‌ای ۱۰ سکّه یا بیشتر ندارد.'], 'صرّافیِ بازار');
    tutMore(600, 566 + h + 10, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: 200, y: TRAY.y + TRAY.h + 56, w: SCENE_W - 400, h: 120 }], .7);
    tutCard(300, 96, 600, ['اهرمِ زیرِ سینیِ پُر را بکِش:',
      '۱۰ سکّه می‌رود و یک سکّهٔ بزرگ‌تر می‌آید سمتِ چپ.']);
  } else {
    spot([{ x: 126, y: TRAY.y - 40, w: SCENE_W - 252, h: TRAY.h + 190 }], .68);
    const h = tutCard(280, 96, 640,
      ['سینیِ پُر کم‌کم کج می‌شود و می‌ریزد.', 'گاهی سکّهٔ تازه سینیِ بعدی را هم پُر می‌کند —',
       'آن‌وقت باید دوباره عوض کنی.'], 'زنجیرهٔ تعویض');
    tutMore(600, 96 + h + 10, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function coinIcon(x, y) {
  coin(x - 18, y + 6, 18, P.coin3, P.coin3d, 3);
  coin(x + 16, y + 4, 20, P.coin2, P.coin2d, 5);
  coin(x, y - 10, 22, P.coin1, P.coin1d, 7);
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 760, h: 290, y: 136,
    paper: P.paper, band: P.brassDk, ink: P.ink, inkSoft: '#8a765a',
    icon: coinIcon,
    title: 'صرّافیِ بازار',
    body: 'پولِ مشتری توی چهار سینی می‌ریزد: هزارتایی، صدتایی، ده‌تایی و یکی.\nقانونِ بازار: هیچ سینی‌ای حق ندارد ۱۰ سکّه یا بیشتر داشته باشد.\nاهرمِ زیرِ سینیِ پُر را بکِش تا ۱۰ سکّه یکی شود و برود سمتِ چپ.',
    btn: BTN_GO, btnLabel: 'باز کن دکّه را', btnHot: S.hover === BTN_GO,
    btnFill: '#95762b', btnHotFill: '#b08f38',
  });
}

function drawWon() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#8a765a',
    icon: coinIcon,
    title: L().endless ? 'بازار بسته شد' : 'حسابِ همه صاف شد!',
    body: 'امتیاز: ' + fa(S.score) + (last ? '\nهمهٔ بازارها را گرداندی. از اوّل؟' : ''),
    btn: BTN_GO, btnLabel: last ? 'دوباره' : 'بازارِ بعد', btnHot: S.hover === BTN_GO,
    btnFill: '#95762b', btnHotFill: '#b08f38',
  });
}

function drawLost() {
  overlay({
    t: S.phaseT, w: 720, h: 250, y: 160,
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: '#8a765a',
    icon: (x, y) => { ctx.fillStyle = '#8d4a2c';
      ctx.beginPath(); ctx.ellipse(x, y + 6, 24, 18, .2, 0, TAU); ctx.fill();
      coin(x - 22, y + 20, 10, P.coin3, P.coin3d, 1);
      coin(x + 20, y + 22, 10, P.coin2, P.coin2d, 2); },
    title: 'کیسه خالی شد',
    body: 'امتیاز: ' + fa(S.score) + '\nسینیِ پُر را زودتر عوض کن تا نریزد.',
    btn: BTN_GO, btnLabel: 'دوباره', btnHot: S.hover === BTN_GO,
    btnFill: '#95762b', btnHotFill: '#b08f38',
  });
}

/*!
title: سرزمینِ باران — آبِ باارزش (بازی)
bg: #16283a
*/

/* ═══════════════════════════════════════════════════════════════════════
   سرزمینِ باران — علومِ سوم، درس ۵ «آب مادّه‌ای با ارزش»  (بازی)

   کتاب چرخهٔ آب را در پنج جمله می‌گوید:
     ۱ آبِ دریاها و خاک و گیاهان با گرما و نورِ خورشید تبخیر می‌شود.
     ۲ بخارِ آب سرد می‌شود و ابر به وجود می‌آید.
     ۳ باد ابرها را جابه‌جا می‌کند.
     ۴ ذرّه‌های ریزِ آب در ابر به هم می‌چسبند و می‌بارند.
     ۵ آب دوباره به زمین و دریاها برمی‌گردد.

   در این بازی بچّه خودش چرخه را می‌گرداند — هیچ‌کدام از این پنج جمله
   نوشته نمی‌شود، ولی هر پنج تا در دستِ اوست:
   ▸ خورشید را روی آب می‌گذارد ⟵ بخار بالا می‌رود (فقط از روی آب؛
     روی خشکی خبری نیست، و همین خودش درس است).
   ▸ بخار هرچه بالاتر می‌رود سردتر می‌شود؛ از خطِّ هوای سرد که رد شد،
     ابر می‌شود. کوه هم بخار را به بالا هُل می‌دهد، پس دامنهٔ کوه
     زودتر ابری می‌شود — همان چیزی که در طبیعت هست.
   ▸ باد را خودش کم و زیاد می‌کند و ابر را می‌راند.
   ▸ ابر که پُر شد، می‌بارد؛ بارانی که روی مزرعه بیفتد به کار می‌آید و
     بارانی که در دریا بیفتد هدر رفته — نه غلط، فقط چرخه.

   قانون‌ها ساده‌اند ولی واقعی: بخار فقط از سطحِ آب، بالا رفتن و سرد
   شدن، هُل خوردنِ هوا روی کوه، و باریدن وقتی ابر سنگین شد.

   نکتهٔ کلیدیِ بازی از همین قانونِ آخر درمی‌آید: ابری که با باد در
   حرکت است کشیده و رقیق می‌ماند و نمی‌بارد، ولی تا باد را نگه داری،
   ذرّه‌ها به هم می‌چسبند، ابر جمع و سنگین می‌شود و می‌بارد. پس کار
   این است که ابر را روی مزرعه ببری و همان‌جا باد را بخوابانی.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;
const BAR_Y = 694;                 /* نوارِ باد پایینِ صحنه */

const P = {
  sky:    '#4d7ea8', skyHi: '#7fb2d4', skyLo: '#2c5878',
  night:  '#16283a',
  sea:    '#2f7fa8', seaDk: '#1b5674', seaLt: '#6fb8d4',
  land:   '#6b8f4a', landDk: '#41602a', landLt: '#96b96e',
  rock:   '#7c8a94', rockDk: '#4d5a63', rockLt: '#a9b6bf',
  soil:   '#8a6a44', soilDk: '#5c4526',
  sun:    '#f6c33c', sunDk: '#d9962c', sunGlow: 'rgba(246, 195, 60, .28)',
  vapor:  'rgba(226, 240, 246, .55)',
  cloud:  '#eef4f8', cloudDk: '#b9cbd6',
  rain:   '#5fb4de',
  paper:  '#fbfaf2', card: '#ffffff',
  ink:    '#1f3040', inkSoft: '#7d8f9c',
  good:   '#5aa86a', bad: '#c04a34', gold: '#d8ab3c', accent: '#4fa3b8',
};

/* ───────── زمین ─────────
   هر ستون یک بلندی دارد (۰ یعنی سطحِ دریا) و یک جنس.               */

const COLS = 24, COLW = 50;
const GROUND_Y = 616;            /* بلندیِ صفر — دریا باید پیدا باشد */
const UNIT = 44;                 /* هر پلّهٔ بلندی چند پیکسل */
const COLD_Y = 232;              /* خطِّ هوای سرد: بالاتر از این، بخار ابر می‌شود */

/* k: نوعِ ستون — 'sea' دریا، 'land' خشکی، 'farm' مزرعه، 'lake' دریاچه */
const LEVELS = [
  { name: 'از دریا تا مزرعه', need: 10, suns: 1,
    cols: [['sea', 0, 6], ['land', 1, 7], ['farm', 1, 2], ['land', 1, 9]] },
  { name: 'کوه سرِ راه', need: 12, suns: 1,
    cols: [['sea', 0, 5], ['land', 1, 4], ['land', 4, 3], ['land', 1, 5], ['farm', 1, 2], ['land', 1, 5]] },
  { name: 'دریاچهٔ پشتِ کوه', need: 12, suns: 2,
    cols: [['sea', 0, 4], ['land', 1, 3], ['land', 5, 3], ['lake', 1, 3], ['land', 1, 6],
           ['farm', 1, 2], ['land', 1, 3]] },
  { name: 'دو مزرعه', need: 14, suns: 2,
    cols: [['sea', 0, 4], ['farm', 1, 2], ['land', 1, 4], ['land', 5, 3], ['land', 1, 5],
           ['farm', 1, 2], ['land', 1, 4]] },
  { name: 'سرزمینِ باران', need: 16, suns: 2,
    cols: [['sea', 0, 3], ['land', 2, 3], ['land', 6, 2], ['lake', 1, 2], ['land', 1, 3],
           ['land', 4, 3], ['farm', 1, 2], ['land', 1, 4], ['farm', 1, 2]] },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  level: 0, score: 0, best: 0,
  col: [],               /* {k, h} برای هر ستون */
  suns: [],              /* شمارهٔ ستون‌هایی که خورشید رویشان است */
  sunsLeft: 1,
  wind: 1,               /* -2 تا +2 */
  parts: [],             /* {x, y, st, r, t} — st: 0 بخار، ۱ ابر، ۲ باران */
  got: 0, need: 10,
  evapT: 0, winT: 0, winT2: 0,
  t: 0, hover: null, tip: '', tipT: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const L = () => LEVELS[Math.min(S.level, LEVELS.length - 1)];
function tip(msg) { S.tip = msg; S.tipT = 3.4; }

/** بلندیِ سطحِ ستون i به پیکسل. */
const topOf = (i) => GROUND_Y - (S.col[i] ? S.col[i].h : 0) * UNIT;
const isWater = (i) => S.col[i] && (S.col[i].k === 'sea' || S.col[i].k === 'lake');
const colAt = (x) => clamp(Math.floor(x / COLW), 0, COLS - 1);

function loadLevel(i) {
  S.level = i;
  const lv = LEVELS[i];
  S.col = [];
  for (const [k, h, n] of lv.cols) for (let j = 0; j < n; j++) S.col.push({ k, h });
  while (S.col.length < COLS) S.col.push({ k: 'land', h: 1 });
  S.col.length = COLS;
  S.suns = [];
  S.sunsLeft = lv.suns;
  S.wind = 1;
  S.parts = [];
  S.got = 0; S.need = lv.need;
  S.evapT = 0; S.winT = 0;
}

function startLevel(i, keep) {
  S.phase = 'play'; S.phaseT = 0;
  if (!keep) S.score = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  loadLevel(i);
}

/* ───────── خورشید ───────── */

function putSun(i) {
  const at = S.suns.indexOf(i);
  if (at >= 0) { S.suns.splice(at, 1); S.sunsLeft++; sfx.pop(); return; }
  if (!isWater(i)) { tip('خورشید روی آب کار می‌کند، نه روی خشکی.'); sfx.nope(); return; }
  if (S.sunsLeft <= 0) {
    /* خورشیدِ اضافه نداری: قدیمی‌ترین را جابه‌جا کن */
    const old = S.suns.shift();
    if (old !== undefined) S.sunsLeft++;
  }
  S.suns.push(i); S.sunsLeft--;
  sfx.place();
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
}

/* ───────── شبیه‌سازیِ چرخه ───────── */

const RISE = 88;        /* سرعتِ بالا رفتنِ بخار، پیکسل بر ثانیه */
const WINDPX = 34;      /* هر پلّهٔ باد چند پیکسل بر ثانیه */
const FALL = 210;       /* سرعتِ افتادنِ باران */
const RAIN_N = 6;       /* چند ذرّهٔ ابر در یک ستون تا باران شروع شود */
const MAXP = 150;
const SATURATE = 40;    /* بیشترین بخار و ابری که هوا نگه می‌دارد */
const CLOUD_LIFE = 22;  /* ابری که نبارد، بعد از این چند ثانیه محو می‌شود */
const EVAP_T = .22;     /* هر چند ثانیه یک ذرّهٔ بخار از زیرِ هر خورشید */
const STICK = 45;       /* «به هم چسبیدنِ» ذرّه‌های ابر، پیکسل بر ثانیه */

function simulate(dt) {
  /* ۱) تبخیر — فقط از روی آب، و فقط جایی که خورشید می‌تابد */
  /* هوا ظرفیّت دارد: بیش از این نمی‌تواند بخار نگه دارد، پس ابر
     بی‌نهایت دراز نمی‌شود. (خورشید را هم می‌شود دوباره زد و برداشت.) */
  let inAir = 0;
  for (const q of S.parts) if (q.st !== 2) inAir++;
  S.evapT += dt;
  const period = EVAP_T;
  while (S.evapT >= period) {
    S.evapT -= period;
    if (inAir >= SATURATE) break;
    for (const i of S.suns) {
      if (!isWater(i) || S.parts.length >= MAXP) continue;
      inAir++;
      S.parts.push({ x: i * COLW + COLW / 2 + (Math.random() - .5) * 26,
                     y: topOf(i) - 4, st: 0, r: 7 + Math.random() * 4, t: 0 });
    }
  }
  /* ۲) حرکت */
  const wind = S.wind * WINDPX;
  const cloudCount = new Array(COLS).fill(0);
  for (const p of S.parts) if (p.st === 1) cloudCount[colAt(p.x)]++;

  for (let n = S.parts.length - 1; n >= 0; n--) {
    const p = S.parts[n];
    p.t += dt;
    if (p.st === 0) {
      /* بخار بالا می‌رود و با باد می‌رود */
      p.y -= RISE * dt;
      p.x += wind * dt;
      /* کوه هوا را به بالا هُل می‌دهد */
      const c = colAt(p.x);
      const gt = topOf(c);
      if (p.y > gt - 6) p.y = gt - 6;
      /* از خطِّ هوای سرد که گذشت، ابر می‌شود */
      if (p.y <= COLD_Y) {
        p.st = 1; p.y = COLD_Y - Math.random() * 26; p.r = 12 + Math.random() * 8;
        p.ct = 0;
        sfx.tone(560, .05, 'sine', .04);
      }
    } else if (p.st === 1) {
      /* ابری که نمی‌بارد، کم‌کم دوباره بخار می‌شود و محو می‌گردد —
         وگرنه یک ابرِ کوچکِ همیشگی روی صحنه می‌ماند و راه را می‌بندد. */
      p.ct = (p.ct || 0) + dt;
      if (p.ct > CLOUD_LIFE) { S.parts.splice(n, 1); continue; }
      /* ابر با باد می‌رود */
      p.x += wind * dt;
      /* ابر روی همان بلندیِ میعان می‌ماند و پایین‌تر نمی‌آید */
      p.y = clamp(p.y + Math.sin(S.t * 1.4 + p.x * .02) * 8 * dt, COLD_Y - 30, COLD_Y);
      /* «ذرّه‌های ریزِ آب در ابر به هم می‌چسبند» — همان جملهٔ کتاب.
         ولی فقط وقتی هوا آرام است: بادِ تند ابر را کش می‌دهد و پخش
         می‌کند، پس ابرِ در حال سفر نمی‌بارد. تا باد را بخوابانی،
         ذرّه‌ها جمع می‌شوند، ابر سنگین می‌شود و می‌بارد. */
      const c0 = colAt(p.x);
      if (S.wind === 0) {
        let bestC = c0, bestN = cloudCount[c0];
        for (let d = -2; d <= 2; d++) {
          const cc = c0 + d;
          if (cc < 0 || cc >= COLS) continue;
          if (cloudCount[cc] > bestN) { bestN = cloudCount[cc]; bestC = cc; }
        }
        if (bestC !== c0) p.x += Math.sign(bestC - c0) * STICK * dt;
      }
      /* ابرِ سنگین می‌بارد */
      if (cloudCount[c0] >= RAIN_N && Math.random() < dt * 3.5) {
        p.st = 2; p.r = 5; p.vy = 0;
      }
    } else {
      /* باران می‌افتد */
      p.vy = (p.vy || 0) + 520 * dt;
      p.y += Math.min(FALL, p.vy) * dt;
      p.x += wind * dt * .25;
      const c = colAt(p.x);
      if (p.y >= topOf(c) - 3) {
        if (S.col[c].k === 'farm') {
          S.got++;
          bits.spark(p.x, topOf(c) - 6, 5, [P.rain, '#fff', P.landLt]);
          sfx.tone(760, .06, 'sine', .05);
          if (S.got >= S.need && !S.winT) winLevel();
        } else {
          bits.spark(p.x, topOf(c) - 3, 3, [P.rain, '#dff']);
        }
        S.parts.splice(n, 1);
        continue;
      }
    }
    /* از صحنه که بیرون رفت، تمام */
    if (p.x < -40 || p.x > SCENE_W + 40 || p.y < 40) S.parts.splice(n, 1);
  }
}

function winLevel() {
  if (S.winT) return;              /* یک بار، نه با هر قطرهٔ بعدی */
  S.score += 120 + S.level * 30;
  if (S.score > S.best) S.best = S.score;
  sfx.win();
  bits.confetti(SCENE_W / 2, 300, 34, [P.rain, P.landLt, P.gold, '#fff']);
  S.winT = .001;
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.tut.on) S.tut.t += dt;
  if (S.phase === 'play' && !S.winT) simulate(dt);
  if (S.winT) {
    S.winT += dt;
    simulate(dt);
    if (S.winT > 2.2) {
      S.winT = 0;
      if (S.level >= LEVELS.length - 1) { S.phase = 'won'; S.phaseT = 0; }
      else { loadLevel(S.level + 1); toast.say(L().name, 'good'); }
    }
  }
  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => { loadLevel(0); runLoop(step); });

/* ───────── جای‌ها ───────── */

function windBtn(i) { return { x: 372 + i * 92, y: BAR_Y + 8, w: 84, h: 50 }; }
const BTN_GO = { x: SCENE_W / 2 - 150, y: 470, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    for (let i = 0; i < 5; i++) if (inRect(p, windBtn(i))) S.hover = { k: 'wind', i };
    if (!S.hover && p.y > HUD_H && p.y < BAR_Y) {
      const c = colAt(p.x);
      if (isWater(c)) S.hover = { k: 'col', i: c };
    }
  }
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { startLevel(0); sfx.good(); } return; }
  if (S.phase === 'won') {
    if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; S.score = 0; loadLevel(0); sfx.tap(); }
    return;
  }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  for (let i = 0; i < 5; i++) if (inRect(p, windBtn(i))) { S.wind = i - 2; sfx.tap(); return; }
  if (p.y > HUD_H && p.y < BAR_Y) putSun(colAt(p.x));
});

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

function spot(rects, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 22);
  ctx.fillStyle = `rgba(8, 18, 28, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 253, 246, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '8, 18, 28');
  ctx.fillStyle = P.accent;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6d7f8c' }); yy += 30; }
  return h + 20;
}

function sunShape(cx, cy, r, t) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = P.sunGlow;
  ctx.beginPath(); ctx.arc(0, 0, r * 2.1, 0, TAU); ctx.fill();
  ctx.rotate(t * .35);
  ctx.strokeStyle = P.sunDk; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = i * TAU / 8;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r + 5), Math.sin(a) * (r + 5));
    ctx.lineTo(Math.cos(a) * (r + 14), Math.sin(a) * (r + 14));
    ctx.stroke();
  }
  ctx.rotate(-t * .35);
  ctx.fillStyle = P.sunDk;
  ctx.beginPath(); ctx.arc(0, 2, r, 0, TAU); ctx.fill();
  ctx.fillStyle = P.sun;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.45)';
  ctx.beginPath(); ctx.arc(-r * .3, -r * .3, r * .3, 0, TAU); ctx.fill();
  ctx.restore();
}

/* ───────── نقاشیِ صحنه ───────── */

function drawSky() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, GROUND_Y);
  g.addColorStop(0, P.skyLo); g.addColorStop(.55, P.sky); g.addColorStop(1, P.skyHi);
  ctx.fillStyle = g;
  ctx.fillRect(0, HUD_H, SCENE_W, GROUND_Y - HUD_H + UNIT * 8);
  /* خطِّ هوای سرد */
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.42)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
  ctx.beginPath(); ctx.moveTo(0, COLD_Y); ctx.lineTo(SCENE_W, COLD_Y); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(20, 40, 58, .3)';
  ctx.beginPath(); rrPath(18, COLD_Y - 30, 168, 26, 13); ctx.fill();
  text('اینجا هوا سرد است', 102, COLD_Y - 17, { size: 14, color: '#eaf4fa' });
}

/** کفِ زمین: زیرِ آب گودتر است، پس دریا و دریاچه در گودال می‌نشینند. */
const floorOf = (i) => isWater(i) ? topOf(i) + 52 : topOf(i);

function drawLand() {
  /* خطِ زمین را یک‌تکّه و نرم می‌کشیم تا کوه، کوه دیده شود نه ستون */
  const pts = [];
  for (let i = 0; i < COLS; i++) pts.push({ x: i * COLW + COLW / 2, y: floorOf(i) });
  const terrain = () => {
    ctx.beginPath();
    ctx.moveTo(-20, SCENE_H + 20);
    ctx.lineTo(-20, pts[0].y);
    ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const mx = (a.x + b.x) / 2;
      ctx.quadraticCurveTo(mx, a.y, mx, (a.y + b.y) / 2);
      ctx.quadraticCurveTo(mx, b.y, b.x, b.y);
    }
    ctx.lineTo(SCENE_W + 20, pts[pts.length - 1].y);
    ctx.lineTo(SCENE_W + 20, SCENE_H + 20);
    ctx.closePath();
  };
  /* تنِ خاک */
  ctx.fillStyle = P.soilDk;
  terrain(); ctx.fill();
  ctx.save();
  terrain(); ctx.clip();
  ctx.fillStyle = P.soil;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  /* رگه‌های خاک */
  ctx.strokeStyle = 'rgba(60, 40, 20, .16)'; ctx.lineWidth = 3;
  for (let y = GROUND_Y + 20; y < SCENE_H; y += 26) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCENE_W, y + 6); ctx.stroke();
  }
  ctx.restore();

  /* پوستهٔ رویِ زمین: سنگ روی بلندی‌ها، سبزه روی پستی‌ها */
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (let i = 0; i < COLS; i++) {
    if (isWater(i)) continue;
    const x0 = i * COLW, y0 = topOf(i);
    const yPrev = i > 0 && !isWater(i - 1) ? topOf(i - 1) : y0;
    const yNext = i < COLS - 1 && !isWater(i + 1) ? topOf(i + 1) : y0;
    ctx.beginPath();
    ctx.moveTo(x0, (y0 + yPrev) / 2);
    ctx.lineTo(x0 + COLW / 2, y0);
    ctx.lineTo(x0 + COLW, (y0 + yNext) / 2);
    ctx.strokeStyle = S.col[i].h >= 3 ? P.rock : P.land;
    ctx.lineWidth = 13;
    ctx.stroke();
    ctx.strokeStyle = S.col[i].h >= 3 ? P.rockLt : P.landLt;
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  ctx.restore();

  /* آب: از سطحِ خودش تا کفِ گودال */
  for (let i = 0; i < COLS; i++) {
    if (!isWater(i)) continue;
    const x = i * COLW, wy = topOf(i);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, wy, COLW + 1, SCENE_H - wy);
    ctx.clip();
    const g = ctx.createLinearGradient(0, wy, 0, SCENE_H);
    g.addColorStop(0, P.seaLt); g.addColorStop(.25, P.sea); g.addColorStop(1, P.seaDk);
    ctx.fillStyle = g;
    ctx.fillRect(x, wy, COLW + 1, SCENE_H - wy);
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    for (let k = 0; k < 2; k++) {
      const yy = wy + 9 + k * 14 + Math.sin(S.t * 1.6 + i * .5 + k) * 3;
      ctx.fillRect(x + 6 + k * 12, yy, 22, 2.4);
    }
    ctx.restore();
    /* برقِ سطح */
    ctx.fillStyle = 'rgba(230, 248, 255, .55)';
    ctx.fillRect(x, wy - 1, COLW + 1, 3);
  }

  /* مزرعه‌ها */
  for (let i = 0; i < COLS; i++) {
    if (S.col[i].k !== 'farm') continue;
    const x = i * COLW, ty = topOf(i);
    const grow = clamp(S.got / Math.max(1, S.need), 0, 1);
    for (let k = 0; k < 4; k++) {
      const gx = x + 9 + k * 11, hh = 10 + grow * 26;
      ctx.strokeStyle = grow > .5 ? '#3f8f3a' : '#6b8f4a';
      ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(gx, ty);
      ctx.quadraticCurveTo(gx + 2, ty - hh * .6, gx + Math.sin(S.t + k) * 2.4, ty - hh);
      ctx.stroke();
      if (grow > .55) {
        ctx.fillStyle = '#e8b52c';
        ctx.beginPath(); ctx.arc(gx + Math.sin(S.t + k) * 2.4, ty - hh, 3.8, 0, TAU); ctx.fill();
      }
    }
    /* تابلو فقط یک بار برای هر مزرعه، نه برای هر ستون */
    if (i === 0 || S.col[i - 1].k !== 'farm') {
      let w = 1;
      while (i + w < COLS && S.col[i + w].k === 'farm') w++;
      ctx.fillStyle = 'rgba(20, 40, 30, .5)';
      ctx.beginPath(); rrPath(x + 4, ty - 66, COLW * w - 8, 21, 9); ctx.fill();
      text('مزرعه', x + COLW * w / 2, ty - 55, { size: 12, color: '#dff2e2' });
    }
  }
}

function drawParts() {
  for (const p of S.parts) {
    if (p.st === 0) {
      ctx.save();
      ctx.globalAlpha = .55;
      ctx.fillStyle = P.cloud;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
      ctx.globalAlpha = .3;
      ctx.beginPath(); ctx.arc(p.x + p.r * .5, p.y + 3, p.r * .7, 0, TAU); ctx.fill();
      ctx.restore();
    } else if (p.st === 1) {
      /* ابرِ رو به محو شدن کم‌رنگ‌تر می‌شود */
      const fade = clamp((CLOUD_LIFE - (p.ct || 0)) / 4, 0, 1);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.fillStyle = P.cloudDk;
      ctx.beginPath(); ctx.arc(p.x, p.y + 4, p.r, 0, TAU); ctx.fill();
      ctx.fillStyle = P.cloud;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x - p.r * .6, p.y + 4, p.r * .68, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x + p.r * .6, p.y + 3, p.r * .6, 0, TAU); ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = P.rain;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 2.6, 7, 0, 0, TAU);
      ctx.fill();
    }
  }
}

function drawSuns() {
  for (const i of S.suns) {
    const x = i * COLW + COLW / 2;
    sunShape(x, HUD_H + 66, 22, S.t);
    /* پرتوها تا سطحِ آب */
    ctx.save();
    ctx.globalAlpha = .18 + .06 * Math.sin(S.t * 2);
    const g = ctx.createLinearGradient(0, HUD_H + 90, 0, topOf(i));
    g.addColorStop(0, 'rgba(246, 195, 60, .8)');
    g.addColorStop(1, 'rgba(246, 195, 60, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 16, HUD_H + 90); ctx.lineTo(x + 16, HUD_H + 90);
    ctx.lineTo(x + 40, topOf(i)); ctx.lineTo(x - 40, topOf(i));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  /* جای‌های ممکن برای خورشید، وقتی انگشت رویشان است */
  if (S.hover && S.hover.k === 'col') {
    const i = S.hover.i, x = i * COLW;
    ctx.strokeStyle = 'rgba(246, 195, 60, .8)'; ctx.lineWidth = 3;
    ctx.setLineDash([7, 5]);
    ctx.strokeRect(x + 2, HUD_H + 4, COLW - 4, topOf(i) - HUD_H - 8);
    ctx.setLineDash([]);
  }
}

function drawBar() {
  ctx.fillStyle = 'rgba(14, 28, 42, .92)';
  ctx.fillRect(0, BAR_Y, SCENE_W, SCENE_H - BAR_Y);
  ctx.fillStyle = 'rgba(120, 190, 210, .3)';
  ctx.fillRect(0, BAR_Y, SCENE_W, 2);
  text('باد', 348, BAR_Y + 33, { size: 19, family: 'Lalezar', color: '#dfeff6', align: 'right' });
  const LB = ['⟸', '⟵', '■', '⟶', '⟹'];
  for (let i = 0; i < 5; i++) {
    const b = windBtn(i), on = S.wind === i - 2;
    const hot = S.hover && S.hover.k === 'wind' && S.hover.i === i;
    ctx.fillStyle = on ? P.accent : (hot ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.08)');
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
    ctx.strokeStyle = on ? '#bfe6f2' : 'rgba(255,255,255,.18)'; ctx.lineWidth = on ? 2.4 : 1.2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
    numText(LB[i], b.x + b.w / 2, b.y + b.h / 2 + 1, { size: 22, color: on ? '#fff' : '#cfe2ec' });
  }
  /* خورشیدهای باقی‌مانده — سمتِ راستِ نوار، دور از راهنما */
  text('خورشید', SCENE_W - 24, BAR_Y + 33, { size: 17, family: 'Lalezar', color: '#dfeff6', align: 'right' });
  for (let i = 0; i < L().suns; i++) {
    const x = SCENE_W - 108 - i * 42;
    ctx.save();
    ctx.globalAlpha = i < S.sunsLeft ? 1 : .25;
    sunShape(x, BAR_Y + 32, 12, S.t);
    ctx.restore();
  }
  text('روی آب بزن تا خورشید آنجا بتابد', 24, BAR_Y + 33,
    { size: 14, color: 'rgba(223,239,246,.72)', align: 'left' });
}

function drawHUD() {
  ctx.fillStyle = 'rgba(14, 28, 42, .94)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(120, 190, 210, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.paper, align: 'right' });
  /* نوارِ آبِ مزرعه */
  const bw = 260, bx = 470, by = HUD_H / 2 - 9;
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(bx, by, bw, 18, 9); ctx.fill();
  const k = clamp(S.got / S.need, 0, 1);
  ctx.fillStyle = k >= 1 ? P.good : P.rain;
  ctx.beginPath(); rrPath(bx, by, bw * k, 18, 9); ctx.fill();
  numText(fa(Math.min(S.got, S.need)) + ' / ' + fa(S.need), bx + bw / 2, by + 9, { size: 14, color: '#fff' });
  text('آبِ مزرعه', bx + bw + 12, HUD_H / 2, { size: 15, color: '#bcd6e0', align: 'left' });
  numText(fa(S.score), 300, HUD_H / 2, { size: 20, color: P.paper });
  text('بیشترین ' + fa(S.best), 150, HUD_H / 2, { size: 15, color: 'rgba(251,250,242,.6)' });
  const kk = clamp((S.level + k) / LEVELS.length, 0, 1);
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * kk, 5, 3); ctx.fill();
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: 0, y: HUD_H, w: 340, h: GROUND_Y - HUD_H }], .72);
    const h = tutCard(400, 250, 560,
      ['خورشید آبِ دریا را بخار می‌کند.', 'بخار بالا می‌رود و سرد که شد، ابر می‌شود.'], 'سرزمینِ باران');
    tutMore(680, 250 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: 0, y: HUD_H, w: 320, h: GROUND_Y - HUD_H }], .6);
    tutCard(360, 290, 620, ['روی دریا بزن تا خورشید آنجا بتابد.', 'دوباره که بزنی، خورشید برداشته می‌شود.']);
  } else {
    spot([{ x: 340, y: BAR_Y, w: 520, h: 66 }], .7);
    const h = tutCard(300, 240, 600,
      ['باد ابر را جابه‌جا می‌کند.', 'ابر که سنگین شد، می‌بارد —', 'باران را به مزرعه برسان.'], 'باد و باران');
    tutMore(600, 240 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function cycleIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  sunShape(-46, -6, 13, 0);
  ctx.fillStyle = P.cloud;
  ctx.beginPath(); ctx.arc(6, -10, 15, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(-8, -4, 11, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(20, -3, 10, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.rain; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-6 + i * 13, 8); ctx.lineTo(-9 + i * 13, 20); ctx.stroke();
  }
  ctx.fillStyle = P.sea;
  ctx.beginPath(); rrPath(-56, 22, 112, 10, 5); ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 840, h: 300, y: 128,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: '#6d7f8c',
    icon: cycleIcon,
    title: 'سرزمینِ باران',
    body: 'خورشید را روی آب بگذار تا بخار شود؛ بخار بالا می‌رود و ابر می‌شود.\nبا باد ابر را برانِ روی مزرعه تا ببارد.\nآبی که امروز می‌بارد، همان آبی است که دیروز از دریا بالا رفت.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 780, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#6d7f8c',
    icon: cycleIcon,
    title: 'چرخه را گرداندی',
    body: 'تبخیر، ابر، باد و باران — همان چرخه‌ای که آبِ زمین را می‌گرداند.\nامتیازت: ' + fa(S.score),
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function draw() {
  beginScene(P.night);
  drawSky();
  drawSuns();
  drawParts();
  drawLand();
  bits.draw();
  drawBar();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 520;
    paper(SCENE_W / 2 - w / 2, BAR_Y - 60, w, 44, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, BAR_Y - 38, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.08, 'rgba(8, 20, 34, .4)', 0, .1);
}

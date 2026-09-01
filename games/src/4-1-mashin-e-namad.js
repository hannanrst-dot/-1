/*!
title: ماشینِ نماد — روش‌های نمادین
bg: #14100d
*/

/* ═══════════════════════════════════════════════════════════════════════
   ماشینِ نماد — ریاضی سوم، فصل ۴، درس ۱ (حلّ مسئله: روش‌های نمادین)
   ───────────────────────────────────────────────────────────────────────
   جملهٔ خودِ کتاب: «تبدیل کردن مسئله به یک تساوی، درک مسئله را بهتر می‌کند
   و راهِ پیدا کردنِ جواب را هم مشخّص می‌سازد.»

   پس در این بازی، کارِ بچه پیدا کردنِ جواب نیست؛ نوشتنِ تساوی است.
   جواب را ماشین حساب می‌کند:

     تا وقتی تساویِ درستی روی ریل نچیده‌ای، ماشین نمی‌چرخد. تساوی که
     جور شد، خودش جواب را روی نوارِ کاغذی چاپ می‌کند و قفلِ جعبه باز
     می‌شود.

   و چون یک مسئله چند تساویِ درست دارد، ماشین همه‌شان را قبول می‌کند:
   «۱۰۰۰ − ۹۹۹ = ☐» به همان خوبیِ «۹۹۹ + ☐ = ۱۰۰۰» است. تنها شرطش این
   است که تساوی راست باشد و فقط با یک عددِ خاص راست باشد — یعنی واقعاً
   جوابِ مسئله را معیّن کند.

   کارت‌های ماشین شمرده‌اند، پس چیدنِ الکی و چرخاندن جواب نمی‌دهد.

   مسئله‌های ۲ و ۳ و ۴ دقیقاً همان‌هایی‌اند که در صفحهٔ ۶۲ کتاب آمده.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const SLOTS = 7;

const P = {
  wallHi:  '#3a2f24',
  wallLo:  '#120e0a',
  desk:    '#5c3d24',
  deskLit: '#7b5330',
  deskDk:  '#3a2514',
  felt:    '#2f4a3c',
  feltLit: '#3c5c4a',
  brass:   '#d3a349',
  brassLit:'#efc878',
  brassDk: '#8f6a24',
  iron:    '#4b443c',
  ironLit: '#6d6459',
  glass:   'rgba(210, 240, 230, .18)',
  lamp:    '#2f6a52',
  lampLit: '#57a483',
  glow:    'rgba(255, 214, 140, .22)',
  tape:    '#f6efdc',
  tapeDk:  '#ded4bb',
  paper:   '#fbf3e2',
  paperDk: '#e6d9bd',
  ink:     '#2a231b',
  inkSoft: '#7d7264',
  numTile: '#e8dcc0',
  opTile:  '#c98a4a',
  eqTile:  '#7f9ac2',
  boxTile: '#b06a8a',
  good:    '#6fa85c',
  bad:     '#cf5f4a',
  gold:    '#f0c552',
};

/* ───────── مسئله‌ها ─────────
   tray هیچ‌وقت خودِ جواب را ندارد، وگرنه «☐ = جواب» می‌شد یک راهِ مفت.  */

const LEVELS = [
  { story: 'پنج تا گردو داشتم. مادرم چندتای دیگر داد و شدند دوازده تا.\nچندتا داد؟',
    ans: 7, nums: [5, 12, 3], cards: 3,
    hint: 'عددهای مسئله و جای خالی را روی ریل بچین تا یک تساوی شود.' },
  { story: 'بعد از ۹۹۹ چه عددی است؟\nیعنی چه عددی با ۹۹۹ جمع شود تا هزار شود؟',
    ans: 1, nums: [999, 1000, 990], cards: 3,
    hint: 'مسئلهٔ صفحهٔ ۶۲ کتاب.' },
  { story: 'از هزار چند واحد برداریم تا نهصد و نود به دست بیاید؟',
    ans: 10, nums: [1000, 990, 999], cards: 3,
    hint: 'اینجا کم می‌کنیم، پس علامتِ منها لازم است.' },
  { story: 'عددی را با هزار جمع کردیم؛ حاصل هزار و صد شد.\nآن عدد چند بود؟',
    ans: 100, nums: [1000, 1100, 900], cards: 3,
    hint: 'همان مسئلهٔ دوّمِ کتاب.' },
  { story: 'بیست و پنج تا مداد در جعبه بود. چندتا برداشتیم و هجده تا ماند.\nچندتا برداشتیم؟',
    ans: 7, nums: [25, 18, 43], cards: 3,
    hint: 'برداشتن یعنی کم کردن.' },
  { story: 'در قلّکم چهارده سکّه داشتم. شش تا خرج کردم و بعد چندتا انداختم.\nحاال بیست تا دارم. چندتا انداختم؟',
    ans: 12, nums: [14, 6, 20], cards: 3,
    hint: 'این مسئله دو کار دارد: کم کردن و بعد جمع کردن.' },
  { endless: true, cards: 3,
    hint: 'مسئله‌ها پشتِ سرِ هم می‌آیند.' },
];

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro',        // intro | play | print | won | lost
  level: 0,
  story: '', ans: 0,
  tray: [],              // { kind:'n'|'op'|'eq'|'box', v, used }
  rail: new Array(SLOTS).fill(null),   // اندیسِ کارت در tray
  cards: 0, cardsMax: 0,
  crank: 0,              // انیمیشنِ چرخاندن
  tapeMsg: '', tapeOk: false, tapeT: 0,
  solved: 0,
  hearts: 3,
  score: 0, best: 0,
  t: 0, phaseT: 0,
  hover: null,
  shake: 0,
  motes: [],
  floats: [],
  tut: { on: true, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];

function loadBest() { try { return +localStorage.getItem('namad-best') || 0; } catch { return 0; } }
function saveBest(v) { try { localStorage.setItem('namad-best', String(v)); } catch { /* حالت خصوصی */ } }

/* ───────── چیدمان ───────── */

const HUD_H = 52;
const SLIP = { x: 28, y: 82, w: 300, h: 226 };
const BOX = { x: 62, y: 342, w: 232, h: 196 };
const MACH = { x: 356, y: 96, w: 812, h: 462 };
const TAPE = { x: 452, y: 132, w: 620, h: 104 };
const RAIL_Y = 302, SLOT_W = 96, SLOT_H = 92, SLOT_GAP = 12;
const RAIL_X = MACH.x + MACH.w / 2 - (SLOTS * SLOT_W + (SLOTS - 1) * SLOT_GAP) / 2;
const BTN_CRANK = { x: MACH.x + MACH.w / 2 - 116, y: 434, w: 232, h: 74 };
const TRAY_Y = 592;
const BTN_GO = { x: 470, y: 566, w: 260, h: 76 };

function slotBox(i) { return { x: RAIL_X + i * (SLOT_W + SLOT_GAP), y: RAIL_Y, w: SLOT_W, h: SLOT_H }; }
function trayBox(i) {
  const n = S.tray.length, w = 84, gap = 12, per = Math.min(n, 9);
  const rows = Math.ceil(n / per);
  const r = Math.floor(i / per), c = i % per;
  const inRow = Math.min(per, n - r * per);
  const x0 = SCENE_W / 2 - (inRow * w + (inRow - 1) * gap) / 2;
  return { x: x0 + c * (w + gap), y: TRAY_Y + r * 84, w, h: 72 };
}

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
S.best = loadBest();
for (let i = 0; i < 26; i++) {
  S.motes.push({ x: Math.random() * SCENE_W, y: Math.random() * SCENE_H,
                 ph: Math.random() * TAU, sp: .2 + Math.random() * .4, r: .8 + Math.random() * 1.6 });
}
whenFontsReady(() => runLoop(step));

/** مسئلهٔ تصادفیِ حالتِ آزاد. جوابش هیچ‌وقت روی کارت‌ها نیست. */
function randomProblem() {
  const kind = Math.floor(Math.random() * 3);
  let a, b, ans, story;
  if (kind === 0) {                               // a + ☐ = b
    a = 3 + Math.floor(Math.random() * 40);
    ans = 2 + Math.floor(Math.random() * 30);
    b = a + ans;
    story = `${fa(a)} تا داشتم. چندتای دیگر آمد و شدند ${fa(b)} تا.\nچندتا آمد؟`;
  } else if (kind === 1) {                        // a − ☐ = b
    a = 12 + Math.floor(Math.random() * 40);
    ans = 2 + Math.floor(Math.random() * (a - 6));
    b = a - ans;
    story = `${fa(a)} تا داشتم. چندتا رفت و ${fa(b)} تا ماند.\nچندتا رفت؟`;
  } else {                                        // a − b + ☐ = c
    a = 14 + Math.floor(Math.random() * 30);
    b = 3 + Math.floor(Math.random() * 8);
    ans = 3 + Math.floor(Math.random() * 20);
    const c = a - b + ans;
    story = `${fa(a)} تا داشتم. ${fa(b)} تا خرج کردم و بعد چندتا اضافه شد.\nحاال ${fa(c)} تا دارم. چندتا اضافه شد؟`;
    const nums = [a, b, c].filter((n) => n !== ans);
    while (nums.length < 3) nums.push(a + b);
    return { story, ans, nums };
  }
  const nums = [a, b];
  let extra = a + b;
  while (extra === ans || nums.indexOf(extra) >= 0) extra++;
  nums.push(extra);
  return { story, ans, nums };
}

function loadProblem(pr) {
  S.story = pr.story;
  S.ans = pr.ans;
  S.tray = [];
  for (const n of pr.nums) S.tray.push({ kind: 'n', v: n });
  S.tray.push({ kind: 'op', v: '+' }, { kind: 'op', v: '+' },
               { kind: 'op', v: '−' }, { kind: 'op', v: '−' },
               { kind: 'eq' }, { kind: 'box' });
  S.rail = new Array(SLOTS).fill(null);
  S.cards = L().cards;
  S.cardsMax = L().cards;
  S.tapeMsg = ''; S.tapeT = 0;
}

function startLevel(i, keep) {
  const lv = LEVELS[i];
  S.level = i;
  loadProblem(lv.endless ? randomProblem() : { story: lv.story, ans: lv.ans, nums: lv.nums });
  if (!keep) { S.hearts = 3; S.solved = 0; }
  S.phase = 'play'; S.phaseT = 0;
  S.crank = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  toast.say(lv.hint, 'info');
}

function floatText(x, y, txt, col, size) { S.floats.push({ x, y, txt, col, t: 0, size: size || 24 }); }

function step(dt) {
  S.t += dt; S.phaseT += dt;
  if (S.shake > 0) S.shake -= dt;
  if (S.crank > 0) S.crank = Math.max(0, S.crank - dt * 1.6);
  if (S.tapeT > 0) S.tapeT -= dt;
  for (const m of S.motes) {
    m.ph += dt * m.sp; m.y -= dt * (5 + m.sp * 10); m.x += Math.sin(m.ph) * dt * 8;
    if (m.y < -10) { m.y = SCENE_H + 10; m.x = Math.random() * SCENE_W; }
  }
  for (const f of S.floats) { f.t += dt; f.y -= 42 * dt; }
  S.floats = S.floats.filter((f) => f.t < 1.5);
  if (S.phase === 'play' && S.tut.on) tutStep(dt);
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── چیدنِ ریل ───────── */

const onRail = (i) => S.rail.indexOf(i) >= 0;

function placeCard(i) {
  if (S.phase !== 'play' || onRail(i)) return;
  const k = S.rail.indexOf(null);
  if (k < 0) { S.shake = .16; sfx.nope(); return; }
  S.rail[k] = i;
  sfx.place();
}

function pullCard(k) {
  if (S.phase !== 'play' || S.rail[k] === null) return;
  /* کارت‌های بعدی می‌آیند جلو تا وسطِ تساوی جای خالی نماند. */
  S.rail.splice(k, 1);
  S.rail.push(null);
  sfx.tap();
}

function clearRail() { S.rail = new Array(SLOTS).fill(null); sfx.slide(); }

/* ───────── خواندنِ تساوی ─────────
   ماشین هر تساویِ درستی را قبول می‌کند، نه فقط یک شکلِ خاص را.        */

function tokens() { return S.rail.filter((i) => i !== null).map((i) => S.tray[i]); }

/** آیا چیدمان یک تساویِ خوش‌ساخت است؟ */
function parseEq(tk) {
  const eqs = tk.filter((t) => t.kind === 'eq').length;
  const boxes = tk.filter((t) => t.kind === 'box').length;
  const nums = tk.filter((t) => t.kind === 'n').length;
  if (eqs !== 1) return { err: 'یک علامتِ مساوی لازم است' };
  if (boxes !== 1) return { err: 'یک جای خالی لازم است' };
  if (nums < 2) return { err: 'دستِ‌کم دو عدد لازم است' };
  const at = tk.findIndex((t) => t.kind === 'eq');
  const left = tk.slice(0, at), right = tk.slice(at + 1);
  for (const side of [left, right]) {
    if (!side.length) return { err: 'دو طرفِ مساوی باید پُر باشد' };
    for (let i = 0; i < side.length; i++) {
      const wantVal = i % 2 === 0;
      const isVal = side[i].kind === 'n' || side[i].kind === 'box';
      if (wantVal !== isVal) return { err: 'ترتیبِ عدد و علامت جور نیست' };
    }
    if (side.length % 2 === 0) return { err: 'یک عدد کم است' };
  }
  return { left, right };
}

function evalSide(side, x) {
  const v = (t) => (t.kind === 'box' ? x : t.v);
  let s = v(side[0]);
  for (let i = 1; i < side.length; i += 2) {
    s = side[i].v === '+' ? s + v(side[i + 1]) : s - v(side[i + 1]);
  }
  return s;
}

function crank() {
  if (S.phase !== 'play') return;
  const p = parseEq(tokens());
  S.crank = 1;
  sfx.tone(180, .26, 'sawtooth', .06);
  if (p.err) {
    S.cards--;
    S.shake = .3;
    S.tapeMsg = p.err; S.tapeOk = false; S.tapeT = 3.4;
    sfx.nope();
    return outOfCards();
  }
  const holds = (x) => evalSide(p.left, x) === evalSide(p.right, x);
  if (!holds(S.ans)) {
    S.cards--;
    S.shake = .3;
    S.tapeMsg = 'این تساوی راست نیست'; S.tapeOk = false; S.tapeT = 3.4;
    sfx.nope();
    return outOfCards();
  }
  /* تساوی باید فقط با یک عدد راست باشد، وگرنه جواب را معیّن نمی‌کند. */
  if (holds(S.ans + 1) || holds(S.ans - 1)) {
    S.cards--;
    S.shake = .26;
    S.tapeMsg = 'این تساوی با هر عددی راست است'; S.tapeOk = false; S.tapeT = 3.4;
    sfx.nope();
    return outOfCards();
  }
  /* درست شد — حاال ماشین جواب را حساب می‌کند، نه بچه. */
  S.tapeMsg = `جای خالی = ${fa(S.ans)}`;
  S.tapeOk = true; S.tapeT = 6;
  const pts = 300 + S.cards * 150;
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; saveBest(S.best); }
  S.solved++;
  floatText(MACH.x + MACH.w / 2, TAPE.y + 40, `+${fa(pts)}`, P.gold);
  bits.confetti(BOX.x + BOX.w / 2, BOX.y + 40, 60, [P.gold, P.brassLit, P.tape, '#fff']);
  sfx.win();
  S.phase = 'won'; S.phaseT = 0;
}

function outOfCards() {
  if (S.cards > 0) return;
  S.hearts--;
  if (S.hearts <= 0) { S.phase = 'lost'; S.phaseT = 0; return; }
  S.cards = S.cardsMax;
  S.rail = new Array(SLOTS).fill(null);
  toast.say('کارت‌ها تمام شد — یک دل کم شد', 'bad');
}

/* ───────── آموزش ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

function tutStep(dt) {
  S.tut.t += dt;
  if (S.tut.step === 0 && S.tut.t > 30) { S.tut.step = 1; S.tut.t = 0; }
  if (S.tut.step === 1 && S.rail.some((q) => q !== null)) { S.tut.step = 2; S.tut.t = 0; }
  if (S.tut.step === 2 && S.tut.t > 30) S.tut.on = false;
}

/* ───────── ورودی ───────── */

const BTN_CLEAR = { x: MACH.x + MACH.w - 190, y: 442, w: 150, h: 56 };

function hitTest(p) {
  if (S.phase !== 'play') return inRect(p, BTN_GO) ? BTN_GO : null;
  if (inRect(p, BTN_CRANK)) return BTN_CRANK;
  if (inRect(p, BTN_CLEAR)) return BTN_CLEAR;
  for (let k = 0; k < SLOTS; k++) if (inRect(p, slotBox(k))) return { slot: k };
  for (let i = 0; i < S.tray.length; i++) if (inRect(p, trayBox(i))) return { card: i };
  return null;
}

cv.addEventListener('pointermove', (e) => {
  S.hover = hitTest(toStage(e));
  cv.style.cursor = S.hover ? 'pointer' : 'default';
});
cv.addEventListener('pointerleave', () => { S.hover = null; });
cv.addEventListener('pointerdown', (e) => {
  if (S.phase === 'play' && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  const h = hitTest(toStage(e));
  if (S.phase === 'intro') { if (h) startLevel(0); return; }
  if (S.phase === 'won') {
    if (!h) return;
    if (L().endless) startLevel(S.level, true);
    else if (S.level + 1 < LEVELS.length) startLevel(S.level + 1, true);
    else { S.score = 0; startLevel(0); }
    return;
  }
  if (S.phase === 'lost') { if (h) { S.score = 0; startLevel(S.level); } return; }
  if (!h) return;
  if (h === BTN_CRANK) return crank();
  if (h === BTN_CLEAR) return clearRail();
  if (h.slot !== undefined) return pullCard(h.slot);
  if (h.card !== undefined) return placeCard(h.card);
});

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
  for (const r of rects) rrPath(r.x - 12, r.y - 12, r.w + 24, r.h + 24, 20);
  ctx.fillStyle = `rgba(10, 7, 4, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function pointHand(x, y) {
  const bob = Math.sin(S.t * 3.4) * 8;
  ctx.save();
  ctx.translate(x, y + bob);
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
  }, '20, 12, 6');
  ctx.strokeStyle = '#c9a982'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  ctx.restore();
}

/** یک کارتِ نماد. */
function cardFace(c, b, o = {}) {
  const dy = o.hot ? 3 : 0;
  const col = c.kind === 'n' ? P.numTile
    : c.kind === 'op' ? P.opTile
      : c.kind === 'eq' ? P.eqTile : P.boxTile;
  withShadow(12, o.hot ? 3 : 6, .38, () => {
    ctx.fillStyle = col;
    wobbleRect(b.x, b.y + dy, b.w, b.h, 10, b.x + b.y, 1.4); ctx.fill();
  }, '20, 12, 6');
  ctx.fillStyle = 'rgba(255,255,255,.24)';
  wobbleRect(b.x + 4, b.y + 4 + dy, b.w - 8, 8, 4, b.x + 1, .8); ctx.fill();
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2 + dy;
  if (c.kind === 'n') {
    const s = c.v >= 1000 ? 26 : (c.v >= 100 ? 30 : 36);
    numText(fa(c.v), cx, cy, { size: s, color: P.ink });
  } else if (c.kind === 'op') {
    numText(c.v === '+' ? '+' : '−', cx, cy - 2, { size: 44, color: '#fff6e8' });
  } else if (c.kind === 'eq') {
    ctx.strokeStyle = '#fff6e8'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 8); ctx.lineTo(cx + 15, cy - 8);
    ctx.moveTo(cx - 15, cy + 8); ctx.lineTo(cx + 15, cy + 8);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#fff6e8'; ctx.lineWidth = 4;
    ctx.setLineDash([7, 5]);
    ctx.beginPath(); rrPath(cx - 17, cy - 17, 34, 34, 6); ctx.stroke();
    ctx.setLineDash([]);
  }
}

/* ───────── صحنه ───────── */

function draw() {
  beginScene('#14100d');
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 13;
    ctx.translate(Math.sin(S.t * 58) * k, Math.cos(S.t * 45) * k * .5);
  }

  drawOffice();
  drawSlip();
  drawBox();
  drawMachine();
  drawRail();
  drawTray();
  bits.draw();
  drawFloats();
  ctx.restore();

  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) {
    ctx.save();
    ctx.translate(MACH.x + MACH.w / 2 - SCENE_W / 2, 0);
    toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.paper, ink: P.ink });
    ctx.restore();
  }

  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.phase === 'lost') drawLost();

  endScene(.14, 'rgba(6, 4, 2, .58)');
}

function drawOffice() {
  const g = ctx.createLinearGradient(200, 80, 900, 760);
  g.addColorStop(0, P.wallHi);
  g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* قابِ چوبیِ دیوار */
  ctx.save();
  ctx.globalAlpha = .16;
  ctx.strokeStyle = '#0d0906'; ctx.lineWidth = 4;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath(); ctx.moveTo(i * 124, 0); ctx.lineTo(i * 124, SCENE_H); ctx.stroke();
  }
  ctx.restore();

  /* چراغِ سبزِ روی میز */
  const lx = 190, ly = 92;
  const gl = ctx.createRadialGradient(lx, ly + 60, 20, lx, ly + 60, 560);
  gl.addColorStop(0, P.glow);
  gl.addColorStop(1, 'rgba(255, 214, 140, 0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  /* گردوغبارِ توی نور */
  ctx.save();
  for (const m of S.motes) {
    ctx.globalAlpha = .05 + .1 * (.5 + .5 * Math.sin(m.ph * 2));
    ctx.fillStyle = '#ffe9c4';
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
  }
  ctx.restore();

  /* میزِ چوبی */
  ctx.fillStyle = P.deskDk;
  ctx.fillRect(0, 556, SCENE_W, SCENE_H - 556);
  ctx.fillStyle = P.desk;
  wobbleRect(0, 550, SCENE_W, 22, 0, 21, 1.4); ctx.fill();
  ctx.fillStyle = P.deskLit;
  wobbleRect(0, 548, SCENE_W, 7, 0, 23, .8); ctx.fill();
  ctx.fillStyle = P.felt;
  wobbleRect(150, 572, SCENE_W - 300, SCENE_H - 572, 6, 25, 2); ctx.fill();
  ctx.fillStyle = P.feltLit;
  wobbleRect(150, 572, SCENE_W - 300, 6, 3, 27, .8); ctx.fill();

  /* دوات و قلم و مُهر، گوشهٔ میز */
  ctx.save();
  ctx.translate(96, 700);
  ctx.fillStyle = '#1e2a34';
  wobbleRect(-26, -26, 52, 40, 5, 31, 1.2); ctx.fill();
  ctx.fillStyle = '#2c3d4a';
  wobbleEllipse(0, -26, 26, 8, 0, 33, 1); ctx.fill();
  ctx.strokeStyle = '#c9a06a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(6, -30); ctx.lineTo(40, -78); ctx.stroke();
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.moveTo(38, -80); ctx.lineTo(48, -72); ctx.lineTo(58, -96);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(SCENE_W - 104, 704);
  ctx.fillStyle = P.desk;
  wobbleRect(-30, -14, 60, 22, 4, 35, 1); ctx.fill();
  ctx.fillStyle = P.deskLit;
  wobbleRect(-12, -44, 24, 32, 5, 37, 1); ctx.fill();
  ctx.fillStyle = '#8a3a3a';
  wobbleRect(-30, 6, 60, 8, 3, 39, .8); ctx.fill();
  ctx.restore();
}

/** برگهٔ مسئله، زیرِ نورِ چراغ. */
function drawSlip() {
  const b = SLIP;
  ctx.save();
  ctx.rotate(-.012);
  withShadow(20, 9, .45, () => {
    ctx.fillStyle = P.paper;
    wobbleRect(b.x, b.y, b.w, b.h, 6, 41, 2.6); ctx.fill();
  }, '20, 12, 6');
  ctx.fillStyle = P.opTile;
  wobbleRect(b.x, b.y, b.w, 9, 4, 43, .8); ctx.fill();
  ctx.save();
  ctx.globalAlpha = .1;
  ctx.fillStyle = '#9a7c4a';
  for (let i = 0; i < 5; i++) {
    wobbleCircle(b.x + 30 + noise1(i * 4.1) * (b.w - 60), b.y + 30 + noise1(i * 8.3) * (b.h - 60),
      16 + noise1(i * 2) * 26, i * 3, 2.2);
    ctx.fill();
  }
  ctx.restore();
  text('مسئله', b.x + b.w / 2, b.y + 36, { size: 22, family: 'Lalezar', color: P.inkSoft });
  ctx.strokeStyle = 'rgba(125, 114, 100, .3)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(b.x + 24, b.y + 52); ctx.lineTo(b.x + b.w - 24, b.y + 52); ctx.stroke();
  textWrap(S.story, b.x + b.w / 2, b.y + 84, b.w - 44, { size: 17, color: P.ink, lineHeight: 28 });
  ctx.restore();
}

/** جعبهٔ قفل‌دار: با تساویِ درست باز می‌شود. */
function drawBox() {
  const b = BOX;
  const open = S.phase === 'won' ? easeOut(clamp(S.phaseT * 1.4, 0, 1)) : 0;
  if (open > .05) {
    const gl = ctx.createRadialGradient(b.x + b.w / 2, b.y + 40, 8, b.x + b.w / 2, b.y + 40, 220);
    gl.addColorStop(0, `rgba(255, 220, 130, ${.36 * open})`);
    gl.addColorStop(1, 'rgba(255, 220, 130, 0)');
    ctx.fillStyle = gl;
    ctx.fillRect(b.x - 160, b.y - 160, b.w + 320, b.h + 320);
    numText(fa(S.ans), b.x + b.w / 2, b.y + 34, { size: 54, color: '#ffeec0' });
  }
  /* در */
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + 28);
  ctx.rotate(-open * .95);
  ctx.translate(-(b.x + b.w / 2), -(b.y + 28));
  ctx.fillStyle = P.deskLit;
  wobbleRect(b.x + 6, b.y + 12, b.w - 12, 32, 6, 51, 1.2); ctx.fill();
  ctx.fillStyle = P.brass;
  wobbleRect(b.x + b.w / 2 - 22, b.y + 20, 44, 18, 4, 53, .8); ctx.fill();
  ctx.restore();
  /* بدنه */
  withShadow(20, 10, .42, () => {
    ctx.fillStyle = P.desk;
    wobbleRect(b.x, b.y + 40, b.w, b.h - 40, 8, 55, 1.6); ctx.fill();
  }, '20, 12, 6');
  ctx.fillStyle = P.brassDk;
  wobbleRect(b.x + 10, b.y + 40, 12, b.h - 40, 3, 57, 1); ctx.fill();
  wobbleRect(b.x + b.w - 22, b.y + 40, 12, b.h - 40, 3, 59, 1); ctx.fill();
  ctx.fillStyle = open > .05 ? P.brassLit : P.iron;
  wobbleRect(b.x + b.w / 2 - 20, b.y + 62, 40, 36, 6, 61, 1); ctx.fill();
  ctx.strokeStyle = open > .05 ? P.brassLit : P.ironLit;
  ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  if (open > .05) ctx.arc(b.x + b.w / 2 + 10, b.y + 56, 12, Math.PI * .9, Math.PI * 2.1);
  else ctx.arc(b.x + b.w / 2, b.y + 56, 12, Math.PI, TAU);
  ctx.stroke();
  text('جوابِ مسئله', b.x + b.w / 2, b.y - 16, { size: 16, color: 'rgba(251, 243, 226, .6)' });
}

/* ───────── ماشین ───────── */

function drawMachine() {
  const b = MACH;
  withShadow(28, 14, .5, () => {
    ctx.fillStyle = P.brassDk;
    wobbleRect(b.x, b.y, b.w, b.h, 18, 71, 2); ctx.fill();
  }, '20, 12, 6');
  ctx.fillStyle = P.brass;
  wobbleRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16, 14, 73, 1.6); ctx.fill();
  ctx.fillStyle = P.brassLit;
  wobbleRect(b.x + 8, b.y + 8, b.w - 16, 12, 6, 75, 1); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  wobbleRect(b.x + 8, b.y + b.h - 26, b.w - 16, 18, 6, 77, 1); ctx.fill();
  for (const cx of [b.x + 26, b.x + b.w - 26]) for (const cy of [b.y + 26, b.y + b.h - 26]) {
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = P.brassLit;
    ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 3, 0, TAU); ctx.fill();
  }

  /* قابِ تیرهٔ پشتِ ریل */
  ctx.fillStyle = 'rgba(30, 20, 8, .34)';
  wobbleRect(RAIL_X - 34, RAIL_Y - 20, SLOTS * (SLOT_W + SLOT_GAP) - SLOT_GAP + 68, SLOT_H + 52, 12, 79, 1.6);
  ctx.fill();

  /* چرخ‌دنده‌های کناری */
  for (const gx of [b.x + 40, b.x + b.w - 40]) {
    const rot = S.t * .5 + (gx > b.x + b.w / 2 ? 1 : 0) + (S.crank > 0 ? (1 - S.crank) * 5 : 0);
    ctx.save();
    ctx.translate(gx, RAIL_Y + SLOT_H / 2);
    ctx.rotate(rot);
    ctx.fillStyle = P.brassDk;
    for (let i = 0; i < 9; i++) {
      ctx.save();
      ctx.rotate(i / 9 * TAU);
      wobbleRect(-5, -30, 10, 12, 2, i, .6); ctx.fill();
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill();
    ctx.fillStyle = P.brass;
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill();
    ctx.fillStyle = P.brassDk;
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill();
    ctx.restore();
  }

  /* نوارِ کاغذی که از بالای ماشین بیرون می‌آید */
  const t = TAPE;
  ctx.fillStyle = P.iron;
  wobbleRect(t.x - 14, t.y - 16, t.w + 28, 14, 5, 81, 1); ctx.fill();
  withShadow(14, 6, .34, () => {
    ctx.fillStyle = P.tape;
    wobbleRect(t.x, t.y, t.w, t.h, 4, 83, 1.6); ctx.fill();
  }, '20, 12, 6');
  ctx.fillStyle = P.tapeDk;
  for (let i = 0; i < 2; i++) {
    for (let x = t.x + 12; x < t.x + t.w - 8; x += 26) {
      ctx.beginPath();
      ctx.arc(x, i ? t.y + t.h - 8 : t.y + 8, 3.4, 0, TAU);
      ctx.fill();
    }
  }
  if (S.tapeT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tapeT, 0, 1);
    text(S.tapeMsg, t.x + t.w / 2, t.y + t.h / 2,
      { size: S.tapeOk ? 30 : 21, family: S.tapeOk ? 'Lalezar' : 'Vazirmatn',
        color: S.tapeOk ? P.good : P.bad });
    ctx.restore();
  } else {
    text('ماشینِ نماد', t.x + t.w / 2, t.y + t.h / 2 - 12,
      { size: 24, family: 'Lalezar', color: 'rgba(42, 35, 27, .45)' });
    text('تساوی را روی ریل بچین و اهرم را بکش', t.x + t.w / 2, t.y + t.h / 2 + 18,
      { size: 14, color: 'rgba(42, 35, 27, .38)' });
  }

  /* کارت‌های مانده */
  for (let i = 0; i < S.cardsMax; i++) {
    const x = MACH.x + 44 + i * 30, y = 452;
    ctx.save();
    ctx.globalAlpha = i < S.cards ? 1 : .22;
    ctx.fillStyle = i < S.cards ? P.tape : '#7d7264';
    wobbleRect(x - 10, y - 14, 22, 30, 3, i * 3 + 1, .8); ctx.fill();
    ctx.restore();
  }
  text('کارت', MACH.x + 44 + (S.cardsMax - 1) * 15, 486, { size: 13, color: 'rgba(42, 35, 27, .6)' });

  /* اهرم */
  const pull = S.crank > 0 ? Math.sin((1 - S.crank) * Math.PI) : 0;
  button({ x: BTN_CRANK.x, y: BTN_CRANK.y + pull * 6, w: BTN_CRANK.w, h: BTN_CRANK.h },
    'اهرم را بکش', {
      hot: S.hover === BTN_CRANK, disabled: S.phase !== 'play',
      fill: '#8f6a24', hotFill: '#a97f2e', size: 26,
    });
  button(BTN_CLEAR, 'ریل را خالی کن', {
    hot: S.hover === BTN_CLEAR, disabled: S.phase !== 'play',
    fill: '#6a5b4a', hotFill: '#7d6c58', size: 15, r: 12, family: 'Vazirmatn',
  });
}

function drawRail() {
  /* میلهٔ ریل */
  ctx.fillStyle = P.iron;
  wobbleRect(RAIL_X - 18, RAIL_Y + SLOT_H - 6, SLOTS * (SLOT_W + SLOT_GAP) - SLOT_GAP + 36, 16, 5, 91, 1);
  ctx.fill();
  ctx.fillStyle = P.ironLit;
  wobbleRect(RAIL_X - 18, RAIL_Y + SLOT_H - 6, SLOTS * (SLOT_W + SLOT_GAP) - SLOT_GAP + 36, 5, 3, 93, .8);
  ctx.fill();

  for (let k = 0; k < SLOTS; k++) {
    const b = slotBox(k);
    const idx = S.rail[k];
    if (idx === null) {
      ctx.save();
      ctx.globalAlpha = .5;
      ctx.strokeStyle = 'rgba(40, 30, 16, .6)'; ctx.lineWidth = 3;
      ctx.setLineDash([8, 7]);
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    } else {
      cardFace(S.tray[idx], b, { hot: S.hover && S.hover.slot === k });
    }
  }
}

function drawTray() {
  for (let i = 0; i < S.tray.length; i++) {
    const b = trayBox(i);
    if (onRail(i)) {
      ctx.save();
      ctx.globalAlpha = .2;
      ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 2.4;
      ctx.setLineDash([6, 6]);
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      continue;
    }
    cardFace(S.tray[i], b, { hot: S.hover && S.hover.card === i });
  }
}

function drawFloats() {
  for (const f of S.floats) {
    const k = clamp(1 - f.t / 1.5, 0, 1);
    numText(f.txt, f.x, f.y, { size: f.size, color: f.col, alpha: k });
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(20, 14, 8, .8)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(211, 163, 73, .45)';
  ctx.fillRect(0, HUD_H - 3, SCENE_W, 3);
  for (let i = 0; i < 3; i++) {
    const x = SCENE_W - 32 - i * 33;
    ctx.save();
    ctx.globalAlpha = i < S.hearts ? 1 : .22;
    ctx.fillStyle = i < S.hearts ? '#d4574a' : '#574c40';
    ctx.translate(x, HUD_H / 2);
    const s = i < S.hearts ? 1 + Math.sin(S.t * 3 + i) * .05 : 1;
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-14, -2, -9, -13, 0, -6);
    ctx.bezierCurveTo(9, -13, 14, -2, 0, 9);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const nm = L().endless ? 'مسئله‌های آزاد' : `مسئلهٔ ${fa(S.level + 1)} از ${fa(LEVELS.length - 1)}`;
  text(nm, SCENE_W - 146, HUD_H / 2, { size: 18, family: 'Lalezar', color: '#f4e5c6', align: 'right' });
  numText(fa(S.score), 26, HUD_H / 2 - 1, { size: 26, color: P.gold, align: 'left' });
  text(`رکورد ${fa(S.best)}`, 108, HUD_H / 2, { size: 14, color: 'rgba(244, 229, 198, .58)', align: 'left' });
  if (S.solved) text(`${fa(S.solved)} حل‌شده`, 216, HUD_H / 2, { size: 15, color: P.good, align: 'left' });
}

/* ───────── آموزش ───────── */

function drawTutorial() {
  const st = S.tut.step;
  let holes = [], msg = '', hand = null;

  if (st === 0) {
    holes = [{ x: SLIP.x - 6, y: SLIP.y - 6, w: SLIP.w + 12, h: SLIP.h + 12 },
             { x: BOX.x - 6, y: BOX.y - 6, w: BOX.w + 12, h: BOX.h + 40 }];
    msg = 'جوابِ مسئله توی جعبهٔ قفل‌دار است. تو قرار نیست حسابش کنی.';
  } else if (st === 1) {
    holes = [{ x: trayBox(0).x - 10, y: TRAY_Y - 10, w: SCENE_W - 2 * (trayBox(0).x - 10), h: 92 },
             { x: RAIL_X - 20, y: RAIL_Y - 12, w: SLOTS * (SLOT_W + SLOT_GAP), h: SLOT_H + 30 }];
    msg = 'کارت‌ها را بزن تا روی ریل بروند و یک تساوی بسازند.';
    hand = { x: trayBox(0).x + 42, y: TRAY_Y - 62 };
  } else {
    holes = [{ x: BTN_CRANK.x - 10, y: BTN_CRANK.y - 10, w: BTN_CRANK.w + 20, h: BTN_CRANK.h + 20 },
             { x: TAPE.x - 8, y: TAPE.y - 22, w: TAPE.w + 16, h: TAPE.h + 30 }];
    msg = 'اهرم را که بکشی، اگر تساوی درست باشد ماشین خودش جواب را چاپ می‌کند.';
  }

  spot(holes, .6);
  /* کارتِ آموزش گوشهٔ چپ می‌نشیند، چون وسطِ صحنه همیشه هدفِ نورافکن است. */
  const w = 310, h = 150, x = 22, y = 580;
  paper(x, y, w, h, P.paper, 61, 14, .45);
  ctx.fillStyle = P.opTile;
  wobbleRect(x, y, 9, h, 4, 63, .8); ctx.fill();
  textWrap(msg, x + w / 2 + 6, y + 40, w - 46, { size: 16, color: P.ink, lineHeight: 25 });
  if (TUT_TAP.indexOf(st) >= 0) tutMore(x + w / 2, y - 42, S.t, P.ink);
  if (hand) pointHand(hand.x, hand.y);
}

/* ───────── پرده‌ها ───────── */

function machIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.brassDk;
  wobbleRect(-70, -30, 140, 62, 8, 3, 1.2); ctx.fill();
  ctx.fillStyle = P.brass;
  wobbleRect(-64, -24, 128, 50, 6, 5, 1); ctx.fill();
  ctx.fillStyle = P.tape;
  wobbleRect(-44, -44, 88, 22, 3, 7, 1); ctx.fill();
  ctx.fillStyle = P.numTile;
  for (let i = 0; i < 3; i++) wobbleRect(-46 + i * 32, -8, 26, 26, 4, i + 9, .8), ctx.fill();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT,
    w: 760, h: 352, y: 164,
    title: 'ماشینِ نماد',
    body: 'مسئله را بخوان و با کارت‌ها یک تساوی بساز؛ جای خالی همان چیزی است\nکه نمی‌دانی. اهرم را که بکشی، ماشین خودش جواب را حساب می‌کند.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'شروع',
    paper: P.paper, band: P.brass, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#8f6a24', btnHotFill: '#a97f2e',
    icon: machIcon,
  });
}

function drawWon() {
  const last = !L().endless && S.level + 1 >= LEVELS.length;
  overlay({
    t: S.phaseT,
    w: 720, h: 320, y: 190,
    title: 'قفل باز شد!',
    body: `ماشین گفت جای خالی ${fa(S.ans)} است. امتیازت ${fa(S.score)} شد.`,
    btn: BTN_GO, btnHot: S.hover === BTN_GO,
    btnLabel: L().endless ? 'مسئلهٔ بعدی' : (last ? 'از اوّل' : 'مسئلهٔ بعدی'),
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#8f6a24', btnHotFill: '#a97f2e',
    icon: (x, y) => star(x, y + 6, 26, P.gold, Math.sin(S.t * 2) * .2),
  });
}

function drawLost() {
  overlay({
    t: S.phaseT,
    w: 720, h: 306, y: 196,
    title: 'ماشین خاموش شد',
    body: 'اوّل مسئله را بخوان و توی سرت تساوی را بساز، بعد کارت بچین.',
    btn: BTN_GO, btnHot: S.hover === BTN_GO, btnLabel: 'دوباره',
    paper: P.paper, band: P.bad, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: '#cf5f4a', btnHotFill: '#dd6f59',
    icon: machIcon,
  });
}

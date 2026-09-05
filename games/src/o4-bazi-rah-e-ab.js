/*!
title: راهِ آب — مواد اطراف ما (بازی)
bg: #1b2733
*/

/* ═══════════════════════════════════════════════════════════════════════
   راهِ آب — علومِ سوم، درس ۴ «مواد اطراف ما»  (بازی)

   درسِ کتاب: مواد سه حالت دارند — جامد، مایع، گاز. و چهار تغییرِ حالت:
   ذوب (جامد ← مایع)، انجماد (مایع ← جامد)، تبخیر (مایع ← گاز) و
   میعان (گاز ← مایع).

   در این بازی این چهار تغییر «ابزارِ کار»اند، نه چیزی که پرسیده شود:
   ▸ یک قطره باید به ظرفِ هدف برسد، ولی نه با هر حالتی — ظرف فقط
     حالتِ خودش را می‌پذیرد.
   ▸ حالت را دما تعیین می‌کند، با همان مرزهای واقعیِ آب: زیرِ صفر
     یخ، بینِ صفر تا صد آب، صد و بالاتر بخار. دماسنجِ کنارِ صحنه همیشه
     دیده می‌شود، پس بچّه خودش پیوندِ دما و حالت را می‌بیند.
   ▸ رفتارِ هر حالت هم واقعی است و همین معمّا را می‌سازد:
        بخار بالا می‌رود، آب پایین می‌ریزد، یخ فقط می‌افتد و
        از پهلو نمی‌لغزد.
   ▸ ابزارها فقط شعله و یخ‌سازند. جای گذاشتنشان با خودِ بچّه است و هر
     چند بار که بخواهد می‌تواند عوض کند و دوباره امتحان کند؛ هیچ
     حرکتی برگشت‌ناپذیر نیست و هیچ بن‌بستی وجود ندارد.

   جواب هیچ‌جا نوشته یا نشان داده نمی‌شود؛ فقط قانونِ فیزیکی روشن است.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  wall:   '#33475a', wallLo: '#1b2733', wallHi: '#48607a',
  stone:  '#5c7285', stoneDk: '#3a4d5e', stoneLt: '#8296a8',
  air:    '#22333f', airLo: '#1a2733',
  water:  '#4f9fc4', waterDk: '#2c6f92', waterLt: '#9fd8ea',
  ice:    '#d6ecf5', iceDk: '#8fbdd0',
  steam:  '#e8f0f4', steamDk: '#a8c2cc',
  fire:   '#e8702a', fireLt: '#f6b23c', fireDk: '#a8410c',
  cold:   '#6fb6e0', coldDk: '#2f6f96',
  paper:  '#fbfaf2', card: '#ffffff',
  ink:    '#20303a', inkSoft: '#7d8f99',
  good:   '#4e9f6c', bad: '#c04a34', gold: '#d8ab3c', accent: '#4fa3b8',
};

/* ───────── قانونِ فیزیکی ─────────
   مرزهای حالت همان مرزهای واقعیِ آب است: صفر و صد درجه.            */

const T_FREEZE = 0, T_BOIL = 100, T_ROOM = 20;
const T_MIN = -40, T_MAX = 140;
const HEAT = 60, COOL = 60, RELAX = 4;

/** حالتِ ماده از روی دما: ۰ جامد، ۱ مایع، ۲ گاز. */
function stateOf(T) {
  if (T <= T_FREEZE) return 0;
  if (T >= T_BOIL) return 2;
  return 1;
}
const STATE_N = ['جامد', 'مایع', 'گاز'];

/** دمای تازه، بعد از یک تپشِ زمان در خانه‌ای از این جور. */
function nextTemp(T, cell) {
  if (cell === 'H') return Math.min(T_MAX, T + HEAT);
  if (cell === 'C') return Math.max(T_MIN, T - COOL);
  /* دور از شعله و یخ، کم‌کم به دمای اتاق برمی‌گردد */
  if (T > T_ROOM) return Math.max(T_ROOM, T - RELAX);
  if (T < T_ROOM) return Math.min(T_ROOM, T + RELAX);
  return T;
}

/* ───────── مرحله‌ها ─────────
   '#' دیوار، '.' خالی، 'S' سرچشمه، 'G' ظرفِ هدف.
   want: حالتی که ظرف می‌پذیرد. h و c: چند شعله و چند یخ‌ساز داری.  */

const LEVELS = [
  { name: 'آب پایین می‌ریزد', want: 1, h: 0, c: 0, map: [
    '#############',
    '#...........#',
    '#....S......#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#....G......#',
    '#############'] },
  { name: 'از روی پلّه', want: 1, h: 0, c: 0, map: [
    '#############',
    '#....S......#',
    '#...........#',
    '#..#####....#',
    '#...........#',
    '#.......G...#',
    '#...........#',
    '#...........#',
    '#############'] },
  { name: 'بخار بالا می‌رود', want: 2, h: 1, c: 0, map: [
    '#############',
    '#....G......#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#....S......#',
    '#...........#',
    '#...#.#.....#',
    '#############'] },
  { name: 'سرد که شود', want: 1, h: 1, c: 1, map: [
    '#############',
    '#...........#',
    '#.......G...#',
    '#......###..#',
    '#...........#',
    '#....S......#',
    '#...........#',
    '#...#.#.....#',
    '#############'] },
  { name: 'یخ می‌افتد', want: 0, h: 0, c: 1, map: [
    '#############',
    '#...........#',
    '#....S......#',
    '#...........#',
    '#...........#',
    '#....#.#....#',
    '#....#G#....#',
    '#....###....#',
    '#############'] },
  { name: 'راهِ دراز', want: 0, h: 1, c: 2, map: [
    '#############',
    '#...........#',
    '#.#######.#.#',
    '#.........#.#',
    '#....S....#.#',
    '#.........#.#',
    '#.........#.#',
    '#...#.#...#G#',
    '#############'] },
];

const COLS = 13, ROWS = 9, CELL = 54;
const GRID = { x: 44, y: 150 };

/* ───────── وضعیت ───────── */

const S = {
  phase: 'intro', phaseT: 0,
  level: 0, score: 0, best: 0,
  cell: [],              /* نقشهٔ خانه‌ها، با ابزارهای گذاشته‌شده */
  leftH: 0, leftC: 0,
  tool: 'H',
  run: null,             /* {x, y, T, st, dir, tick, path} */
  runT: 0, won: false, failMsg: '',
  src: { x: 0, y: 0 }, goal: { x: 0, y: 0 },
  t: 0, hover: null, tip: '', tipT: 0, shake: 0,
  tut: { on: false, step: 0, t: 0 },
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

const L = () => LEVELS[Math.min(S.level, LEVELS.length - 1)];
const at = (x, y) => (x < 0 || y < 0 || x >= COLS || y >= ROWS) ? '#' : S.cell[y][x];
const open = (x, y) => { const c = at(x, y); return c !== '#'; };

function loadLevel(i) {
  S.level = i;
  const lv = LEVELS[i];
  S.cell = lv.map.map((row) => row.split(''));
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (S.cell[y][x] === 'S') S.src = { x, y };
    if (S.cell[y][x] === 'G') S.goal = { x, y };
  }
  S.leftH = lv.h; S.leftC = lv.c;
  S.tool = lv.h > 0 ? 'H' : 'C';
  S.run = null; S.won = false; S.failMsg = '';
}

function startLevel(i, keep) {
  S.phase = 'play'; S.phaseT = 0;
  if (!keep) S.score = 0;
  S.tut.on = i === 0 && !keep; S.tut.step = 0; S.tut.t = 0;
  loadLevel(i);
}

/* ───────── گذاشتن و برداشتنِ ابزار ───────── */

function placeTool(x, y) {
  if (S.run) { tip('اوّل «از نو» بزن.'); return; }
  const c = at(x, y);
  if (c === '#' || c === 'S' || c === 'G') { sfx.nope(); return; }
  if (c === 'H') { S.cell[y][x] = '.'; S.leftH++; sfx.pop(); return; }
  if (c === 'C') { S.cell[y][x] = '.'; S.leftC++; sfx.pop(); return; }
  if (S.tool === 'H') {
    if (S.leftH <= 0) { tip('شعلهٔ دیگری نداری.'); S.shake = .12; sfx.nope(); return; }
    S.cell[y][x] = 'H'; S.leftH--;
  } else {
    if (S.leftC <= 0) { tip('یخ‌سازِ دیگری نداری.'); S.shake = .12; sfx.nope(); return; }
    S.cell[y][x] = 'C'; S.leftC--;
  }
  sfx.place();
  if (S.tut.on && S.tut.step === 1) { S.tut.step = 2; S.tut.t = 0; }
}

function resetRun() {
  S.run = null; S.won = false; S.failMsg = ''; S.runT = 0;
}

function launch() {
  if (S.run) { resetRun(); return; }
  S.run = { x: S.src.x, y: S.src.y, T: T_ROOM, st: 1, dir: 1, tick: 0, trail: [] };
  S.runT = 0; S.won = false; S.failMsg = '';
  sfx.slide();
}

/* ───────── یک تپشِ شبیه‌سازی ─────────
   ترتیب: اوّل دما، بعد حالت، بعد حرکت — همان ترتیبِ طبیعی.        */

const MAX_TICK = 90;

function simStep() {
  const r = S.run;
  if (!r || S.won || S.failMsg) return;
  r.tick++;
  if (r.tick > MAX_TICK) { S.failMsg = 'قطره سرگردان شد.'; sfx.nope(); return; }
  /* ۱) دما از خانه‌ای که در آن است */
  r.T = nextTemp(r.T, at(r.x, r.y));
  const before = r.st;
  r.st = stateOf(r.T);
  if (before !== r.st) {
    sfx.tone(before < r.st ? 700 : 420, .09, 'sine', .07);
    bits.spark(cellX(r.x) + CELL / 2, cellY(r.y) + CELL / 2, 8,
      [r.st === 2 ? P.steam : (r.st === 0 ? P.ice : P.waterLt), '#fff']);
  }
  /* ۲) حرکت، بر پایهٔ حالت */
  let nx = r.x, ny = r.y;
  if (r.st === 2) {
    if (open(r.x, r.y - 1)) ny = r.y - 1;
    else if (open(r.x + r.dir, r.y)) nx = r.x + r.dir;
    else if (open(r.x - r.dir, r.y)) { r.dir = -r.dir; nx = r.x + r.dir; }
  } else if (r.st === 1) {
    if (open(r.x, r.y + 1)) ny = r.y + 1;
    else if (open(r.x + r.dir, r.y)) nx = r.x + r.dir;
    else if (open(r.x - r.dir, r.y)) { r.dir = -r.dir; nx = r.x + r.dir; }
  } else {
    /* یخ فقط می‌افتد؛ از پهلو نمی‌لغزد */
    if (open(r.x, r.y + 1)) ny = r.y + 1;
  }
  r.trail.push({ x: r.x, y: r.y, st: r.st });
  if (r.trail.length > 26) r.trail.shift();
  r.x = nx; r.y = ny;
  /* ۳) رسیدن به ظرف */
  if (r.x === S.goal.x && r.y === S.goal.y) {
    if (r.st === L().want) win();
    else { S.failMsg = 'با حالتِ ' + STATE_N[r.st] + ' نمی‌شود.'; sfx.nope(); }
  }
}

function win() {
  S.won = true;
  S.score += 100 + S.level * 30;
  if (S.score > S.best) S.best = S.score;
  sfx.win();
  bits.confetti(cellX(S.goal.x) + CELL / 2, cellY(S.goal.y) + CELL / 2, 30,
    [P.waterLt, P.ice, P.gold, '#fff']);
}

/* ───────── حلقه ───────── */

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.tut.on) S.tut.t += dt;
  if (S.run && !S.won && !S.failMsg) {
    S.runT += dt;
    while (S.runT >= .34) { S.runT -= .34; simStep(); }
  }
  if (S.won) {
    S.runT += dt;
    if (S.runT > 1.9) {
      S.runT = 0;
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

const cellX = (x) => GRID.x + x * CELL;
const cellY = (y) => GRID.y + y * CELL;
const PANEL = { x: 790, y: 96, w: 386, h: 640 };
const BTN_H = { x: PANEL.x + 22, y: PANEL.y + 96, w: 164, h: 84 };
const BTN_C = { x: PANEL.x + 200, y: PANEL.y + 96, w: 164, h: 84 };
const BTN_RUN = { x: PANEL.x + 22, y: PANEL.y + 552, w: 208, h: 62 };
const BTN_RESET = { x: PANEL.x + 244, y: PANEL.y + 552, w: 120, h: 62 };
const THERM = { x: PANEL.x + 40, y: PANEL.y + 210, w: 34, h: 290 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 470, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };

function cellAtPoint(p) {
  const x = Math.floor((p.x - GRID.x) / CELL), y = Math.floor((p.y - GRID.y) / CELL);
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return null;
  return { x, y };
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else {
    if (inRect(p, BTN_H)) S.hover = { k: 'toolH' };
    if (inRect(p, BTN_C)) S.hover = { k: 'toolC' };
    if (inRect(p, BTN_RUN)) S.hover = { k: 'run' };
    if (inRect(p, BTN_RESET)) S.hover = { k: 'reset' };
    const c = cellAtPoint(p);
    if (c && !S.run) { const v = at(c.x, c.y); if (v !== '#' && v !== 'S' && v !== 'G') S.hover = { k: 'cell', x: c.x, y: c.y }; }
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
  if (S.won) return;
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (inRect(p, BTN_H)) { S.tool = 'H'; sfx.tap(); return; }
  if (inRect(p, BTN_C)) { S.tool = 'C'; sfx.tap(); return; }
  if (inRect(p, BTN_RUN)) { launch(); return; }
  if (inRect(p, BTN_RESET)) { resetRun(); sfx.tap(); return; }
  const c = cellAtPoint(p);
  if (c) placeTool(c.x, c.y);
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
  ctx.fillStyle = `rgba(8, 16, 22, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 252, 244, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '8, 16, 22');
  ctx.fillStyle = P.accent;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: '#6d7f88' }); yy += 30; }
  return h + 20;
}

/* ───────── شکل‌ها ───────── */

function flame(cx, cy, s, t) {
  const w = 1 + Math.sin(t * 7) * .08;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s * w, s);
  ctx.fillStyle = P.fireDk;
  ctx.beginPath();
  ctx.moveTo(0, -20); ctx.quadraticCurveTo(13, -4, 9, 6);
  ctx.quadraticCurveTo(6, 15, 0, 15); ctx.quadraticCurveTo(-6, 15, -9, 6);
  ctx.quadraticCurveTo(-13, -4, 0, -20); ctx.fill();
  ctx.fillStyle = P.fire;
  ctx.beginPath();
  ctx.moveTo(0, -13); ctx.quadraticCurveTo(9, -2, 6, 6);
  ctx.quadraticCurveTo(4, 12, 0, 12); ctx.quadraticCurveTo(-4, 12, -6, 6);
  ctx.quadraticCurveTo(-9, -2, 0, -13); ctx.fill();
  ctx.fillStyle = P.fireLt;
  ctx.beginPath();
  ctx.moveTo(0, -5); ctx.quadraticCurveTo(4, 2, 2.6, 7);
  ctx.quadraticCurveTo(1.4, 11, 0, 11); ctx.quadraticCurveTo(-1.4, 11, -2.6, 7);
  ctx.quadraticCurveTo(-4, 2, 0, -5); ctx.fill();
  ctx.restore();
}

function snow(cx, cy, s, t) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * .5);
  ctx.scale(s, s);
  ctx.strokeStyle = P.cold; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI / 3;
    ctx.beginPath();
    ctx.moveTo(-Math.cos(a) * 14, -Math.sin(a) * 14);
    ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
    ctx.stroke();
  }
  ctx.strokeStyle = P.coldDk; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    const bx = Math.cos(a) * 9, by = Math.sin(a) * 9;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(a + 1) * 5, by + Math.sin(a + 1) * 5);
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(a - 1) * 5, by + Math.sin(a - 1) * 5);
    ctx.stroke();
  }
  ctx.restore();
}

/** قطره در سه حالت — شکل و رنگ هر حالت با بقیه فرق دارد. */
function blob(cx, cy, st, t, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  if (st === 0) {
    /* یخ — مکعبِ زاویه‌دار */
    ctx.fillStyle = P.iceDk;
    ctx.beginPath(); rrPath(-15, -13, 30, 28, 5); ctx.fill();
    ctx.fillStyle = P.ice;
    ctx.beginPath(); rrPath(-15, -16, 30, 28, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.beginPath(); rrPath(-10, -12, 11, 8, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(90,150,175,.7)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); rrPath(-15, -16, 30, 28, 5); ctx.stroke();
  } else if (st === 1) {
    /* آب — قطرهٔ کلاسیک */
    ctx.fillStyle = P.waterDk;
    ctx.beginPath();
    ctx.moveTo(0, -18); ctx.quadraticCurveTo(15, 0, 15, 6);
    ctx.arc(0, 6, 15, 0, Math.PI);
    ctx.quadraticCurveTo(-15, 0, 0, -18); ctx.fill();
    ctx.fillStyle = P.water;
    ctx.beginPath();
    ctx.moveTo(0, -15); ctx.quadraticCurveTo(12.5, 0, 12.5, 5);
    ctx.arc(0, 5, 12.5, 0, Math.PI);
    ctx.quadraticCurveTo(-12.5, 0, 0, -15); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.beginPath(); ctx.ellipse(-4.4, 3, 3.4, 5, -.4, 0, TAU); ctx.fill();
  } else {
    /* بخار — ابرِ نرم و نیمه‌شفاف */
    ctx.globalAlpha = .82;
    for (const [dx, dy, r] of [[-8, 2, 10], [8, 3, 9], [0, -5, 12], [-3, 8, 8]]) {
      ctx.fillStyle = P.steamDk;
      ctx.beginPath(); ctx.arc(dx + Math.sin(t * 3 + dx) * 1.6, dy, r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = .95;
    for (const [dx, dy, r] of [[-7, 0, 8], [7, 1, 7], [0, -6, 9]]) {
      ctx.fillStyle = P.steam;
      ctx.beginPath(); ctx.arc(dx + Math.sin(t * 3 + dx) * 1.6, dy, r, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

/* ───────── نقاشیِ صحنه ───────── */

function paintBackStatic() {
  const g = ctx.createLinearGradient(0, HUD_H, 0, SCENE_H);
  g.addColorStop(0, P.wallHi); g.addColorStop(1, P.wallLo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  ctx.fillStyle = texStone(P.wall, P.wallHi);
  ctx.globalAlpha = .5; ctx.fillRect(0, 0, SCENE_W, SCENE_H); ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255, 253, 246, .95)';
  ctx.beginPath(); rrPath(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(10, 22, 30, .25)'; ctx.lineWidth = 2;
  ctx.beginPath(); rrPath(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 16); ctx.stroke();
}

function drawGrid() {
  const gw = COLS * CELL, gh = ROWS * CELL;
  /* هوای درونِ نقشه */
  ctx.fillStyle = P.airLo;
  ctx.beginPath(); rrPath(GRID.x - 6, GRID.y - 6, gw + 12, gh + 12, 12); ctx.fill();
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = S.cell[y][x], px = cellX(x), py = cellY(y);
      if (c === '#') {
        ctx.fillStyle = P.stoneDk;
        ctx.beginPath(); rrPath(px + 1, py + 1, CELL - 2, CELL - 2, 5); ctx.fill();
        ctx.fillStyle = P.stone;
        ctx.beginPath(); rrPath(px + 1, py + 1, CELL - 2, CELL - 6, 5); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.09)';
        ctx.beginPath(); rrPath(px + 5, py + 4, CELL - 10, 7, 3); ctx.fill();
        continue;
      }
      ctx.fillStyle = P.air;
      ctx.beginPath(); rrPath(px + 1, py + 1, CELL - 2, CELL - 2, 5); ctx.fill();
      const hot = S.hover && S.hover.k === 'cell' && S.hover.x === x && S.hover.y === y;
      if (hot) {
        ctx.strokeStyle = S.tool === 'H' ? P.fire : P.cold; ctx.lineWidth = 2.4;
        ctx.beginPath(); rrPath(px + 2, py + 2, CELL - 4, CELL - 4, 5); ctx.stroke();
      }
      if (c === 'H') flame(px + CELL / 2, py + CELL / 2 + 6, 1.1, S.t + x);
      else if (c === 'C') snow(px + CELL / 2, py + CELL / 2, 1, S.t + x);
      else if (c === 'S') {
        /* شیرِ آب */
        ctx.fillStyle = P.stoneLt;
        ctx.beginPath(); rrPath(px + 12, py + 6, CELL - 24, 14, 4); ctx.fill();
        ctx.fillStyle = P.stoneDk;
        ctx.beginPath(); rrPath(px + CELL / 2 - 6, py + 18, 12, 12, 3); ctx.fill();
        ctx.fillStyle = P.water;
        ctx.beginPath(); ctx.arc(px + CELL / 2, py + 36, 5, 0, TAU); ctx.fill();
      } else if (c === 'G') {
        /* ظرفِ هدف، با نشانهٔ حالتی که می‌پذیرد */
        const want = L().want;
        ctx.fillStyle = 'rgba(255,255,255,.1)';
        ctx.beginPath(); rrPath(px + 8, py + 10, CELL - 16, CELL - 18, 7); ctx.fill();
        ctx.strokeStyle = want === 0 ? P.ice : (want === 2 ? P.steam : P.waterLt);
        ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
        ctx.beginPath(); rrPath(px + 8, py + 10, CELL - 16, CELL - 18, 7); ctx.stroke();
        ctx.setLineDash([]);
        ctx.save();
        ctx.globalAlpha = .5 + .25 * Math.sin(S.t * 3);
        blob(px + CELL / 2, py + CELL / 2, want, S.t, .62);
        ctx.restore();
      }
    }
  }
  /* ردِّ قطره */
  if (S.run) {
    for (let i = 0; i < S.run.trail.length; i++) {
      const p = S.run.trail[i], k = (i + 1) / S.run.trail.length;
      ctx.save();
      ctx.globalAlpha = .1 + k * .22;
      ctx.fillStyle = p.st === 0 ? P.ice : (p.st === 2 ? P.steam : P.water);
      ctx.beginPath(); ctx.arc(cellX(p.x) + CELL / 2, cellY(p.y) + CELL / 2, 6 + k * 5, 0, TAU); ctx.fill();
      ctx.restore();
    }
    const r = S.run;
    blob(cellX(r.x) + CELL / 2, cellY(r.y) + CELL / 2, r.st, S.t, 1);
  }
  /* قابِ نقشه */
  ctx.strokeStyle = 'rgba(10, 22, 30, .5)'; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(GRID.x - 6, GRID.y - 6, gw + 12, gh + 12, 12); ctx.stroke();
}

function drawPanel() {
  const b = PANEL;
  text('ابزار', b.x + b.w - 18, b.y + 30, { size: 20, family: 'Lalezar', color: P.ink, align: 'right' });
  text('روی نقشه بزن تا بگذاری؛ دوباره بزن تا برداری.', b.x + b.w / 2, b.y + 60,
    { size: 13, color: P.inkSoft });
  for (const [bb, kind, n, left] of [[BTN_H, 'H', 'شعله', S.leftH], [BTN_C, 'C', 'یخ‌ساز', S.leftC]]) {
    const on = S.tool === kind, hot = S.hover && S.hover.k === (kind === 'H' ? 'toolH' : 'toolC');
    ctx.fillStyle = on ? (kind === 'H' ? 'rgba(232,112,42,.2)' : 'rgba(111,182,224,.22)')
                       : (hot ? 'rgba(32,48,58,.08)' : 'rgba(32,48,58,.04)');
    ctx.beginPath(); rrPath(bb.x, bb.y, bb.w, bb.h, 12); ctx.fill();
    ctx.strokeStyle = on ? (kind === 'H' ? P.fire : P.cold) : 'rgba(32,48,58,.15)';
    ctx.lineWidth = on ? 3 : 1.4;
    ctx.beginPath(); rrPath(bb.x, bb.y, bb.w, bb.h, 12); ctx.stroke();
    if (kind === 'H') flame(bb.x + 42, bb.y + 46, 1.05, S.t);
    else snow(bb.x + 42, bb.y + 42, .95, S.t);
    text(n, bb.x + bb.w - 14, bb.y + 30, { size: 16, family: 'Lalezar', color: P.ink, align: 'right' });
    numText('×' + fa(left), bb.x + bb.w - 26, bb.y + 60, { size: 18, color: left ? P.accent : P.bad });
  }
  /* دماسنج */
  const th = THERM;
  const T = S.run ? S.run.T : T_ROOM;
  const yOf = (v) => th.y + th.h - ((v - T_MIN) / (T_MAX - T_MIN)) * th.h;
  ctx.fillStyle = '#e8ecec';
  ctx.beginPath(); rrPath(th.x, th.y, th.w, th.h, th.w / 2); ctx.fill();
  ctx.beginPath(); ctx.arc(th.x + th.w / 2, th.y + th.h + 22, 24, 0, TAU); ctx.fill();
  /* سه بازهٔ حالت روی دماسنج */
  const stNow = stateOf(T);
  const bands = [[T_MIN, T_FREEZE, P.ice, 'جامد', 0], [T_FREEZE, T_BOIL, P.water, 'مایع', 1],
                 [T_BOIL, T_MAX, P.steamDk, 'گاز', 2]];
  for (const [a, z, col, nm, si] of bands) {
    const on = si === stNow;
    ctx.save(); ctx.globalAlpha = on ? .55 : .22;
    ctx.fillStyle = col;
    ctx.fillRect(th.x + th.w + 8, yOf(z), 26, yOf(a) - yOf(z));
    ctx.restore();
    ctx.strokeStyle = shade(col, -.35); ctx.lineWidth = on ? 3 : 1.2;
    ctx.strokeRect(th.x + th.w + 8, yOf(z), 26, yOf(a) - yOf(z));
    text(nm, th.x + th.w + 76, (yOf(a) + yOf(z)) / 2,
      { size: on ? 17 : 14, family: on ? 'Lalezar' : 'Vazirmatn', color: shade(col, -.4) });
  }
  /* مرزهای صفر و صد */
  for (const v of [T_FREEZE, T_BOIL]) {
    ctx.strokeStyle = 'rgba(32,48,58,.6)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(th.x - 8, yOf(v)); ctx.lineTo(th.x + th.w + 30, yOf(v)); ctx.stroke();
    numText(fa(v), th.x - 22, yOf(v), { size: 12, color: P.inkSoft });
  }
  /* جیوه */
  const st = stateOf(T);
  const col = st === 0 ? P.cold : (st === 2 ? P.fire : P.water);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(th.x + th.w / 2, th.y + th.h + 22, 18, 0, TAU); ctx.fill();
  ctx.beginPath(); rrPath(th.x + 7, yOf(T), th.w - 14, th.y + th.h - yOf(T) + 10, (th.w - 14) / 2); ctx.fill();
  numText(fa(Math.round(T)) + '°', th.x + th.w / 2, th.y + th.h + 22, { size: 15, color: '#fff' });
  text('دما و حالت', th.x + 62, th.y - 22, { size: 16, family: 'Lalezar', color: P.inkSoft });

  /* پیام */
  if (S.failMsg) {
    ctx.fillStyle = 'rgba(192,74,52,.14)';
    ctx.beginPath(); rrPath(b.x + 22, b.y + 500, b.w - 44, 40, 9); ctx.fill();
    text(S.failMsg, b.x + b.w / 2, b.y + 520, { size: 15, color: P.bad });
  } else if (S.won) {
    ctx.fillStyle = 'rgba(78,159,108,.16)';
    ctx.beginPath(); rrPath(b.x + 22, b.y + 500, b.w - 44, 40, 9); ctx.fill();
    text('رسید!', b.x + b.w / 2, b.y + 520, { size: 17, family: 'Lalezar', color: P.good });
  }
  button(BTN_RUN, S.run ? 'دوباره' : 'رها کن', {
    hot: S.hover && S.hover.k === 'run', fill: '#2f7f96', hotFill: '#4fa3b8', size: 22 });
  button(BTN_RESET, 'از نو', {
    hot: S.hover && S.hover.k === 'reset', fill: '#5c6870', hotFill: '#77848d', size: 20 });
}

function drawHUD() {
  ctx.fillStyle = 'rgba(18, 30, 40, .94)';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(120, 190, 210, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text(L().name, SCENE_W - 24, HUD_H / 2, { size: 22, family: 'Lalezar', color: P.paper, align: 'right' });
  numText(fa(S.level + 1) + ' / ' + fa(LEVELS.length), 640, HUD_H / 2, { size: 21, color: P.gold });
  numText(fa(S.score), 300, HUD_H / 2, { size: 20, color: P.paper });
  text('بیشترین ' + fa(S.best), 150, HUD_H / 2, { size: 15, color: 'rgba(251,250,242,.6)' });
  const kk = clamp((S.level + (S.won ? 1 : 0)) / LEVELS.length, 0, 1);
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240, 5, 3); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); rrPath(24, HUD_H - 9, 240 * kk, 5, 3); ctx.fill();
  /* هدفِ این مرحله، بی‌کلام */
  const want = L().want;
  const gx = 760;
  text('ظرف فقط ' + STATE_N[want] + ' را می‌پذیرد', gx, HUD_H / 2, { size: 15, color: '#bcd6e0', align: 'left' });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: GRID.x - 8, y: GRID.y - 8, w: COLS * CELL + 16, h: ROWS * CELL + 16 }], .74);
    const h = tutCard(PANEL.x - 4, 190, PANEL.w + 8,
      ['قطره باید به ظرف برسد.', 'آب پایین می‌ریزد، بخار بالا می‌رود،', 'یخ فقط می‌افتد.'], 'راهِ آب');
    tutMore(PANEL.x + PANEL.w / 2, 190 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: PANEL.x, y: PANEL.y, w: PANEL.w, h: PANEL.h }], .6);
    tutCard(90, 300, 560, ['شعله و یخ‌ساز را از این تخته بردار', 'و روی نقشه بگذار.']);
  } else {
    spot([{ x: THERM.x - 40, y: THERM.y - 40, w: 200, h: THERM.h + 90 }], .72);
    const h = tutCard(90, 250, 560,
      ['دماسنج می‌گوید قطره در کدام حالت است.', 'زیرِ صفر یخ، تا صد آب، از صد بالاتر بخار.'], 'دما و حالت');
    tutMore(370, 250 + h + 8, S.t, P.ink);
  }
}

/* ───────── پرده‌ها ───────── */

function dropIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  blob(-34, 4, 0, 0, .8);
  blob(0, 4, 1, 0, .8);
  blob(34, 4, 2, 0, .8);
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 840, h: 300, y: 128,
    paper: P.paper, band: P.accent, ink: P.ink, inkSoft: '#6d7f88',
    icon: dropIcon,
    title: 'راهِ آب',
    body: 'یخ و آب و بخار، هر سه یک مادّه‌اند؛ فقط دمایشان فرق دارد.\nهر کدام جورِ خودش حرکت می‌کند: آب پایین، بخار بالا، یخ فقط می‌افتد.\nشعله و یخ‌ساز را جایی بگذار که قطره به ظرف برسد.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 780, h: 300, y: 140,
    paper: P.paper, band: P.gold, ink: P.ink, inkSoft: '#6d7f88',
    icon: dropIcon,
    title: 'راه را بلد شدی',
    body: 'ذوب و انجماد و تبخیر و میعان را به کار بردی و قطره را رساندی.\nامتیازت: ' + fa(S.score),
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#2f7f96', btnHotFill: '#4fa3b8',
  });
}

function draw() {
  beginScene(P.wallLo);
  ctx.save();
  if (S.shake > 0) {
    const k = S.shake * 10;
    ctx.translate(Math.sin(S.t * 55) * k, Math.cos(S.t * 43) * k * .4);
  }
  const layer = staticLayer('back', SCENE_W, SCENE_H, paintBackStatic);
  ctx.drawImage(layer, 0, 0, SCENE_W, SCENE_H);
  drawGrid();
  drawPanel();
  bits.draw();
  ctx.restore();
  drawHUD();
  if (!(S.phase === 'play' && S.tut.on)) toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'play' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 480;
    paper(SCENE_W / 2 - w / 2, SCENE_H - 58, w, 42, P.paper, 51, 12, .3);
    text(S.tip, SCENE_W / 2, SCENE_H - 37, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.09, 'rgba(6, 16, 24, .44)', 0, .1);
}

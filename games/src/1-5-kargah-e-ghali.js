/*!
title: کارگاه قالی — الگوهای متقارن
bg: #17131c
*/

/* ═══════════════════════════════════════════════════════════════════════
   کارگاه قالی — ریاضی سوم، فصل ۱، درس ۵ (الگوهای متقارن)
   ───────────────────────────────────────────────────────────────────────
   خودِ کتاب می‌گوید «طرح فرش را با توجّه به خط‌های تقارن رنگ کنید».
   پس همان را می‌سازیم: یک دار قالی با نقشهٔ خانه‌خانه و یک خطّ تقارن.

   کارِ بچه ساده است: روی خانه‌ها گره می‌زند. اما هر گره‌ای که می‌زند،
   قرینه‌اش هم خودبه‌خود بافته می‌شود. یعنی تقارن چیزی نیست که به او
   توضیح داده شود؛ چیزی است که زیرِ دستش اتفاق می‌افتد.

   سه جور مرحله:
   • نیمهٔ راستِ نقشه بافته شده — نیمهٔ چپ را کامل کن.
   • دو خطّ تقارن (افقی و عمودی) — یک گره، چهار گره می‌شود.
   • بافتِ آزاد: هر طرحی خواستی، با قرینه‌سازیِ خودکار.

   تلفیق: نقش‌های ایرانیِ قالی و رنگ‌های گیاهی (روناس، نیل، اسپرک) —
   گوشه‌ای از مطالعات و هنر، بدون یک خط متن اضافه.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;

/* ───────── پالتِ کارگاهِ قالی ─────────
   رنگ‌ها اسمِ رنگرزیِ سنّتی دارند چون همان‌ها هم روی پالتِ بازی نوشته
   می‌شوند: روناسِ سرخ، نیلِ آبی، اسپرکِ زرد، سبزِ پسته‌ای.           */
const P = {
  roomTop:  '#2c2333',
  roomLow:  '#3d3040',
  floor:    '#4b3a2e',
  floorDk:  '#332619',
  loom:     '#8a5f38',
  loomLit:  '#a8784a',
  loomDk:   '#5e3f24',
  warp:     '#e8dcc0',
  canvas:   '#f0e4cc',
  canvasDk: '#d9c9a8',
  grid:     'rgba(90, 62, 38, .22)',
  runas:    '#b8323f',   // روناس
  nil:      '#2f5fa8',   // نیل
  esparak:  '#e0a52c',   // اسپرک
  pesteh:   '#5c8a3e',   // پسته‌ای
  ghahve:   '#6b4326',   // قهوه‌ای گردو
  sefid:    '#f4ecd8',   // سفید
  mirror:   '#d8b45c',
  ink:      '#2f2418',
  inkSoft:  '#7d6b4e',
  paper:    '#f7edd6',
  gold:     '#e8b448',
  green:    '#6f9a52',
  red:      '#c2503f',
};

const DYES = [
  { c: P.runas,   name: 'روناس' },
  { c: P.nil,     name: 'نیل' },
  { c: P.esparak, name: 'اسپرک' },
  { c: P.pesteh,  name: 'پسته‌ای' },
  { c: P.ghahve,  name: 'گردویی' },
  { c: P.sefid,   name: 'سفید' },
];

/* ───────── نقشه‌ها ─────────
   نقشه با حرف نوشته می‌شود: نقطه یعنی خانهٔ خالی، حرف یعنی رنگ.
   فقط نیمهٔ راست را می‌نویسیم؛ نیمهٔ چپ کارِ بچه است.               */
const KEY = { r: P.runas, n: P.nil, e: P.esparak, p: P.pesteh, g: P.ghahve, s: P.sefid };

const LEVELS = [
  {
    name: 'قالیچهٔ گلِ ساده',
    story: 'استادِ قالی‌باف نیمهٔ راستِ نقشه را بافته و رفته چای بیاورد.\nنیمهٔ چپ را تو کامل کن. حواست باشد: هر گره‌ای بزنی، قرینه‌اش هم بافته می‌شود.',
    cols: 12, rows: 10, axes: 'v',
    half: [
      '..rr..',
      '.reer.',
      'reeeer',
      'reeeer',
      '.reer.',
      '..rr..',
      '.nppn.',
      'n.pp.n',
      '..nn..',
      '......',
    ],
  },
  {
    name: 'ترنجِ چهارقسمتی',
    story: 'این نقشه دو خطّ تقارن دارد: یکی ایستاده، یکی خوابیده.\nهر گره که بزنی، سه گرهٔ دیگر هم خودشان بافته می‌شوند!',
    cols: 12, rows: 12, axes: 'vh',
    half: [
      '....ee',
      '...eee',
      '..eern',
      '.eernn',
      'eernnp',
      'eernpp',
    ],
  },
  {
    name: 'حاشیهٔ قالی',
    story: 'حاشیهٔ قالی هم متقارن است. این یکی ریزتر است، پس دقّت بیشتری می‌خواهد.',
    cols: 14, rows: 10, axes: 'v',
    half: [
      'ggggggg',
      'g.....s',
      'g.rr..s',
      'g.rr.ns',
      'g...nns',
      'g..nn.s',
      'gs....s',
      'g..ee.s',
      'g.....s',
      'ggggggg',
    ],
  },
  { name: 'دارِ خودت', story: 'حالا دارِ قالی مالِ خودت است.\nهر طرحی که دوست داری ببافـ — قرینه‌اش خودش درست می‌شود.',
    cols: 14, rows: 12, axes: 'vh', free: true },
];

/* ───────── وضعیت ───────── */

const S = {
  level: 0,
  phase: 'intro',
  cols: 12, rows: 10, axes: 'v',
  grid: [],          // رنگِ هر خانه یا null
  target: [],        // نقشهٔ کامل (در حالتِ غیرآزاد)
  dye: 0,
  t: 0, introT: 0, doneT: 0,
  hover: null, hoverCell: null,
  painting: false, erasing: false,
  stars: 0,
  shuttle: 0,        // ماکو که روی دار حرکت می‌کند
  weaver: 'idle', weaverT: 0,
};

const bits = new Bits();
const toast = new Toast();
const L = () => LEVELS[S.level];

const idx = (c, r) => r * S.cols + c;

function loadLevel(i) {
  S.level = i;
  const lv = LEVELS[i];
  S.cols = lv.cols; S.rows = lv.rows; S.axes = lv.axes;
  S.grid = new Array(lv.cols * lv.rows).fill(null);
  S.target = new Array(lv.cols * lv.rows).fill(null);

  if (!lv.free) {
    // نقشه را از نیمهٔ راست باز می‌کنیم و قرینه‌اش را می‌سازیم
    const halfCols = Math.ceil(lv.cols / 2);
    const halfRows = lv.axes === 'vh' ? Math.ceil(lv.rows / 2) : lv.rows;
    for (let r = 0; r < halfRows; r++) {
      const row = lv.half[r] || '';
      for (let c = 0; c < halfCols; c++) {
        const ch = row[c] || '.';
        if (ch === '.') continue;
        for (const [cc, rr] of mirrors(c, r)) S.target[idx(cc, rr)] = KEY[ch];
      }
    }
    // نیمهٔ راست از قبل بافته شده است
    for (let r = 0; r < lv.rows; r++) {
      for (let c = 0; c < lv.cols; c++) {
        const rightHalf = c >= Math.floor(lv.cols / 2);   // راستِ تصویر
        const topHalf = lv.axes !== 'vh' || r < Math.ceil(lv.rows / 2);
        if (rightHalf && topHalf) S.grid[idx(c, r)] = S.target[idx(c, r)];
      }
    }
  }
  S.dye = 0;
  S.phase = 'intro'; S.introT = 0;
}

/** همهٔ خانه‌هایی که قرینهٔ (c,r) هستند، خودش هم داخلشان. */
function mirrors(c, r) {
  const out = [[c, r]];
  const mc = S.cols - 1 - c, mr = S.rows - 1 - r;
  if (S.axes.includes('v')) out.push([mc, r]);
  if (S.axes.includes('h')) out.push([c, mr]);
  if (S.axes === 'vh') out.push([mc, mr]);
  return out.filter(([x, y], i, a) => a.findIndex(([p, q]) => p === x && q === y) === i);
}

function isSolved() {
  if (L().free) return false;
  for (let k = 0; k < S.grid.length; k++) if (S.grid[k] !== S.target[k]) return false;
  return true;
}

/* ───────── چیدمان ───────── */

const LOOM = { x: 372, y: 118, w: 470, h: 512 };
const PAL = { x: 906, y: 178, w: 238, h: 372 };
const BTN_GO = { x: 470, y: 556, w: 260, h: 76 };
const BTN_CLEAR = { x: 928, y: 578, w: 194, h: 48 };

function cellSize() {
  return Math.min((LOOM.w - 44) / S.cols, (LOOM.h - 80) / S.rows);
}
function gridOrigin() {
  const cs = cellSize();
  return { x: LOOM.x + (LOOM.w - cs * S.cols) / 2, y: LOOM.y + 44, cs };
}
function cellAt(p) {
  const g = gridOrigin();
  const c = Math.floor((p.x - g.x) / g.cs), r = Math.floor((p.y - g.y) / g.cs);
  if (c < 0 || r < 0 || c >= S.cols || r >= S.rows) return null;
  return { c, r };
}
function dyeRect(i) {
  const col = i % 2, row = Math.floor(i / 2);
  return { x: PAL.x + 22 + col * 100, y: PAL.y + 66 + row * 82, w: 84, h: 64 };
}

/* ───────── حلقه ───────── */

const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);
loadLevel(0);
whenFontsReady(() => runLoop(step));

function step(dt) {
  S.t += dt;
  S.shuttle = (S.shuttle + dt * .5) % 1;
  if (S.phase === 'intro') S.introT += dt;
  if (S.phase === 'done') S.doneT += dt;
  if (S.weaverT > 0) { S.weaverT -= dt; if (S.weaverT <= 0) S.weaver = 'idle'; }
  bits.step(dt);
  toast.step(dt);
  draw();
}

/* ───────── ورودی ───────── */

function hitTest(p) {
  if (S.phase === 'intro' || S.phase === 'done') return inRect(p, BTN_GO) ? BTN_GO : null;
  for (let i = 0; i < DYES.length; i++) if (inRect(p, dyeRect(i))) return { dye: i };
  if (inRect(p, BTN_CLEAR)) return BTN_CLEAR;
  const cell = cellAt(p);
  return cell ? { cell } : null;
}

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  const h = hitTest(p);
  S.hover = h;
  S.hoverCell = h && h.cell ? h.cell : null;
  cv.style.cursor = h ? 'pointer' : 'default';
  if (S.painting && h && h.cell) paint(h.cell.c, h.cell.r, S.erasing);
});
cv.addEventListener('pointerleave', () => { S.hover = null; S.hoverCell = null; S.painting = false; });

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  const h = hitTest(p);
  if (!h) return;
  if (S.phase === 'intro') { S.phase = 'play'; sfx.tap(); return; }
  if (S.phase === 'done') {
    if (S.level + 1 < LEVELS.length) loadLevel(S.level + 1);
    else { loadLevel(LEVELS.length - 1); S.phase = 'play'; }
    return;
  }
  if (h.dye !== undefined) { S.dye = h.dye; sfx.tap(); return; }
  if (h === BTN_CLEAR) { clearLoom(); return; }
  if (h.cell) {
    cv.setPointerCapture(e.pointerId);
    // اگر همان رنگ آنجا هست، پاک می‌کنیم؛ وگرنه رنگ می‌زنیم
    S.erasing = S.grid[idx(h.cell.c, h.cell.r)] === DYES[S.dye].c;
    S.painting = true;
    paint(h.cell.c, h.cell.r, S.erasing);
  }
});
const stopPaint = () => {
  if (!S.painting) return;
  S.painting = false;
  if (isSolved()) finish();
};
cv.addEventListener('pointerup', stopPaint);
cv.addEventListener('pointercancel', stopPaint);

function paint(c, r, erase) {
  const col = erase ? null : DYES[S.dye].c;
  let changed = false;
  const g = gridOrigin();
  for (const [cc, rr] of mirrors(c, r)) {
    const k = idx(cc, rr);
    if (S.grid[k] === col) continue;
    S.grid[k] = col;
    changed = true;
    if (!erase) {
      bits.add(g.x + (cc + .5) * g.cs, g.y + (rr + .5) * g.cs, 3, 'dot',
        [col, P.warp], { speed: 46, lift: 12, size: 1.8, life: .4, grav: 120 });
    }
  }
  if (changed) {
    sfx.tick();
    S.weaver = 'work'; S.weaverT = .5;
  }
}

function clearLoom() {
  const lv = L();
  if (lv.free) S.grid.fill(null);
  else loadLevelKeepPhase();
  sfx.slide();
  toast.say('دار پاک شد', 'info');
}
function loadLevelKeepPhase() {
  const p = S.phase;
  loadLevel(S.level);
  S.phase = p;
}

function finish() {
  S.phase = 'done'; S.doneT = 0;
  S.stars++;
  S.weaver = 'happy'; S.weaverT = 3;
  sfx.win();
  bits.confetti(LOOM.x + LOOM.w/2, LOOM.y + LOOM.h/2, 80,
    [P.runas, P.nil, P.esparak, P.pesteh, P.gold]);
}

/* ───────── ترسیم ───────── */

function draw() {
  beginScene('#17131c');
  drawRoom();
  drawLoom();
  drawGrid();
  drawMirrorLines();
  drawShuttle();
  drawWeaver(216, 662);
  drawPalette();
  bits.draw();
  toast.draw(20, { ink: P.ink });
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'done') drawDone();
  endScene(.11, 'rgba(20,12,24,.42)');
}

function drawRoom() {
  const g = ctx.createLinearGradient(0, 0, 0, 560);
  g.addColorStop(0, P.roomTop);
  g.addColorStop(1, P.roomLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, 560);
  // طاقچه‌های گچی روی دیوار
  for (const x of [78, 1058]) {
    ctx.fillStyle = 'rgba(255,240,214,.06)';
    ctx.beginPath();
    ctx.moveTo(x - 44, 300);
    ctx.lineTo(x - 44, 150);
    ctx.quadraticCurveTo(x, 78, x + 44, 150);
    ctx.lineTo(x + 44, 300);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,214,.1)';
    wobbleRect(x - 50, 296, 100, 12, 3, x, 1.2);
    ctx.fill();
  }
  // کف و قالیچهٔ زیرِ پا
  const fg = ctx.createLinearGradient(0, 546, 0, SH);
  fg.addColorStop(0, P.floor);
  fg.addColorStop(1, P.floorDk);
  ctx.fillStyle = fg;
  ctx.fillRect(0, 546, SW, SH - 546);
  ctx.strokeStyle = 'rgba(0,0,0,.2)';
  ctx.lineWidth = 2;
  for (let x = -40; x < SW + 120; x += 96) {
    ctx.beginPath(); ctx.moveTo(x, 546); ctx.lineTo(x - 50, SH); ctx.stroke();
  }
  // نورِ پنجره روی کف
  const lg = ctx.createLinearGradient(300, 546, 720, SH);
  lg.addColorStop(0, 'rgba(255,226,170,.14)');
  lg.addColorStop(1, 'rgba(255,226,170,0)');
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.moveTo(240, 546); ctx.lineTo(700, 546); ctx.lineTo(880, SH); ctx.lineTo(120, SH);
  ctx.closePath(); ctx.fill();
}

/** دارِ قالی: دو ستونِ چوبی، دو غلتک، و تارهای کشیده. */
function drawLoom() {
  const l = LOOM;
  // ستون‌ها
  for (const px of [l.x - 34, l.x + l.w + 34]) {
    withShadow(20, 10, .4, () => {
      ctx.fillStyle = P.loom;
      wobbleRect(px - 20, l.y - 66, 40, l.h + 150, 6, px, 1.8);
      ctx.fill();
    }, '10, 8, 16');
    ctx.fillStyle = P.loomLit;
    wobbleRect(px - 20, l.y - 66, 13, l.h + 150, 4, px + 1, 1.2);
    ctx.fill();
    // پایه
    ctx.fillStyle = P.loomDk;
    wobbleRect(px - 34, l.y + l.h + 76, 68, 18, 4, px + 2, 1.2);
    ctx.fill();
  }
  // غلتکِ بالا و پایین
  for (const py of [l.y - 32, l.y + l.h + 32]) {
    withShadow(12, 6, .35, () => {
      ctx.fillStyle = P.loomLit;
      wobbleRect(l.x - 48, py - 15, l.w + 96, 30, 12, py, 1.6);
      ctx.fill();
    }, '10, 8, 16');
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    wobbleRect(l.x - 44, py + 3, l.w + 88, 9, 5, py + 1, 1.2);
    ctx.fill();
  }
  // تارها
  const g = gridOrigin();
  ctx.strokeStyle = P.warp;
  ctx.globalAlpha = .5;
  ctx.lineWidth = 2;
  for (let c = 0; c <= S.cols; c++) {
    const x = g.x + c * g.cs;
    ctx.beginPath();
    ctx.moveTo(x, l.y - 30); ctx.lineTo(x, l.y + l.h + 30);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // پارچهٔ بافته‌نشده پشتِ نقشه
  ctx.fillStyle = P.canvas;
  wobbleRect(g.x - 6, g.y - 6, g.cs * S.cols + 12, g.cs * S.rows + 12, 4, 31, 1.6);
  ctx.fill();
}

function drawGrid() {
  const g = gridOrigin();
  const lv = L();
  for (let r = 0; r < S.rows; r++) {
    for (let c = 0; c < S.cols; c++) {
      const x = g.x + c * g.cs, y = g.y + r * g.cs;
      const col = S.grid[idx(c, r)];
      // خانهٔ خالی
      ctx.fillStyle = (c + r) % 2 ? P.canvas : P.canvasDk;
      ctx.fillRect(x, y, g.cs, g.cs);
      if (col) drawKnot(x, y, g.cs, col);
      // عمداً هیچ راهنمای کم‌رنگی از نقشهٔ نهایی نمی‌کشیم: آن یعنی نشان‌دادنِ
      // جواب. مرجعِ بچه همان نیمهٔ بافته‌شدهٔ آن‌طرفِ خطّ تقارن است — و چون
      // هر گره قرینه‌اش را هم می‌بافد، رنگِ اشتباه فوراً آن نیمه را خراب
      // می‌کند و خودش دیده می‌شود.
      ctx.strokeStyle = P.grid;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + .5, y + .5, g.cs - 1, g.cs - 1);
    }
  }
  // پیش‌نمایشِ گره و قرینه‌هایش زیرِ انگشت
  if (S.hoverCell && S.phase === 'play') {
    for (const [cc, rr] of mirrors(S.hoverCell.c, S.hoverCell.r)) {
      const x = g.x + cc * g.cs, y = g.y + rr * g.cs;
      const me = cc === S.hoverCell.c && rr === S.hoverCell.r;
      ctx.globalAlpha = me ? .55 : .35;
      drawKnot(x, y, g.cs, DYES[S.dye].c);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = me ? '#fff' : 'rgba(255,255,255,.6)';
      ctx.lineWidth = me ? 3 : 2;
      ctx.strokeRect(x + 1, y + 1, g.cs - 2, g.cs - 2);
    }
  }
}

/** یک گرهٔ قالی: مربّعِ کمی گِرد با تابِ نخ. */
function drawKnot(x, y, s, col) {
  ctx.fillStyle = col;
  const m = s * .08;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x + m, y + m, s - m*2, s - m*2, s * .22)
                : ctx.rect(x + m, y + m, s - m*2, s - m*2);
  ctx.fill();
  // تابِ نخ: دو خطِ مورّبِ روشن‌تر
  ctx.strokeStyle = 'rgba(255,255,255,.16)';
  ctx.lineWidth = Math.max(1, s * .07);
  ctx.beginPath();
  ctx.moveTo(x + m + 2, y + s - m - 2);
  ctx.lineTo(x + s - m - 2, y + m + 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.14)';
  ctx.beginPath();
  ctx.moveTo(x + m + 2, y + s * .55);
  ctx.lineTo(x + s * .55, y + m + 2);
  ctx.stroke();
}

/** خطّ تقارن — طلاییِ نازک، با برچسبِ کوچک. */
function drawMirrorLines() {
  const g = gridOrigin();
  const w = g.cs * S.cols, h = g.cs * S.rows;
  ctx.save();
  ctx.strokeStyle = P.mirror;
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 7]);
  ctx.lineDashOffset = -S.t * 12;
  if (S.axes.includes('v')) {
    ctx.beginPath();
    ctx.moveTo(g.x + w / 2, g.y - 22); ctx.lineTo(g.x + w / 2, g.y + h + 22);
    ctx.stroke();
  }
  if (S.axes.includes('h')) {
    ctx.beginPath();
    ctx.moveTo(g.x - 22, g.y + h / 2); ctx.lineTo(g.x + w + 22, g.y + h / 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
  text('خطّ تقارن', g.x + w / 2, g.y - 34,
    { size: 15, color: P.mirror, stroke: 'rgba(30,22,14,.7)', strokeWidth: 4 });
}

/** ماکو که آرام روی دار عقب و جلو می‌رود — کارگاه زنده به‌نظر برسد. */
function drawShuttle() {
  const g = gridOrigin();
  const t = Math.sin(S.shuttle * TAU) * .5 + .5;
  const x = g.x + t * g.cs * S.cols;
  const y = LOOM.y + LOOM.h + 6;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.loomDk;
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.quadraticCurveTo(0, -11, 26, 0);
  ctx.quadraticCurveTo(0, 11, -26, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = DYES[S.dye].c;
  wobbleEllipse(0, 0, 12, 5, 0, 3, .8);
  ctx.fill();
  ctx.restore();
}

/* ───────── پالتِ رنگ‌های گیاهی ───────── */

function drawPalette() {
  paper(PAL.x, PAL.y, PAL.w, PAL.h, P.paper, 41, 12, .4);
  text('رنگ‌های گیاهی', PAL.x + PAL.w/2, PAL.y + 30, { size: 22, color: P.ink, family: 'Lalezar' });
  ctx.strokeStyle = 'rgba(125,107,78,.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAL.x + 22, PAL.y + 48); ctx.lineTo(PAL.x + PAL.w - 22, PAL.y + 48);
  ctx.stroke();

  for (let i = 0; i < DYES.length; i++) {
    const r = dyeRect(i);
    const on = S.dye === i;
    const hot = S.hover && S.hover.dye === i;
    // کلافِ نخ
    withShadow(on ? 14 : 8, on ? 3 : 5, .35, () => {
      ctx.fillStyle = DYES[i].c;
      wobbleRect(r.x, r.y - (on ? 3 : 0), r.w, r.h - 18, 8, i * 7, 1.6);
      ctx.fill();
    }, '40, 30, 16');
    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.lineWidth = 2;
    for (let k = 1; k < 4; k++) {
      ctx.beginPath();
      ctx.moveTo(r.x + 6, r.y - (on ? 3 : 0) + k * 11);
      ctx.lineTo(r.x + r.w - 6, r.y - (on ? 3 : 0) + k * 11 - 4);
      ctx.stroke();
    }
    if (on || hot) {
      ctx.strokeStyle = on ? P.ink : 'rgba(47,36,24,.4)';
      ctx.lineWidth = on ? 4 : 2;
      wobbleRect(r.x - 5, r.y - 5 - (on ? 3 : 0), r.w + 10, r.h - 8, 10, i * 3, 1.4);
      ctx.stroke();
    }
    text(DYES[i].name, r.x + r.w/2, r.y + r.h - 6,
      { size: 14, color: on ? P.ink : P.inkSoft, weight: on ? 900 : 700 });
  }
  button(BTN_CLEAR, 'پاک کن', { hot: S.hover === BTN_CLEAR, fill: P.loom, hotFill: P.loomLit, size: 20, r: 10 });

  // ستاره‌ها
  for (let i = 0; i < LEVELS.length; i++) {
    star(PAL.x + 34 + i * 30, PAL.y + PAL.h - 22, 11, i < S.stars ? P.gold : 'rgba(47,36,24,.16)');
  }
}

/* ───────── قالی‌باف ───────── */

function drawWeaver(x, footY) {
  const happy = S.weaver === 'happy';
  const work = S.weaver === 'work';
  const bob = Math.sin(S.t * 1.3) * 2 + (happy ? Math.abs(Math.sin(S.t * 7)) * -6 : 0);
  ctx.save();
  ctx.translate(x, footY + bob);
  ctx.scale(1.02, 1.02);

  ctx.globalAlpha = .3;
  ctx.fillStyle = '#1a1208';
  wobbleEllipse(8, 6, 56, 12, 0, 3, 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // نشسته روی زیرانداز، پس فقط بالاتنه دیده می‌شود
  ctx.fillStyle = P.runas;
  wobbleEllipse(0, -6, 62, 22, 0, 5, 2.4);
  ctx.fill();
  ctx.fillStyle = '#8f2733';
  wobbleEllipse(16, -2, 44, 16, 0, 7, 2);
  ctx.fill();

  withShadow(16, 8, .38, () => {                 // پیراهنِ نیلی
    ctx.fillStyle = P.nil;
    ctx.beginPath();
    ctx.moveTo(-44, -12);
    ctx.quadraticCurveTo(-52, -104, -26, -128);
    ctx.lineTo(26, -128);
    ctx.quadraticCurveTo(52, -104, 44, -12);
    ctx.closePath(); ctx.fill();
  }, '10, 8, 16');
  ctx.fillStyle = '#254c86';
  ctx.beginPath();
  ctx.moveTo(16, -12);
  ctx.quadraticCurveTo(36, -96, 22, -126);
  ctx.lineTo(26, -128);
  ctx.quadraticCurveTo(52, -104, 44, -12);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = '#d8a878';                   // دست‌ها، به‌سمت دار
  ctx.lineWidth = 13; ctx.lineCap = 'round';
  const wob = work ? Math.sin(S.t * 16) * 8 : Math.sin(S.t * 1.6) * 3;
  ctx.beginPath();
  ctx.moveTo(-32, -104); ctx.lineTo(-58, -70 + wob * .4);
  ctx.moveTo(32, -104);  ctx.lineTo(78, -96 + wob);
  ctx.stroke();

  withShadow(12, 6, .3, () => {                  // سر
    ctx.fillStyle = '#d8a878';
    wobbleCircle(0, -156, 34, 9, 1.7);
    ctx.fill();
  }, '10, 8, 16');
  ctx.fillStyle = P.esparak;                     // روسریِ اسپرکی
  ctx.beginPath();
  ctx.moveTo(-38, -150);
  ctx.quadraticCurveTo(-42, -200, 0, -196);
  ctx.quadraticCurveTo(42, -200, 38, -150);
  ctx.quadraticCurveTo(30, -132, 18, -122);
  ctx.lineTo(-18, -122);
  ctx.quadraticCurveTo(-30, -132, -38, -150);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c78f22';
  ctx.beginPath();
  ctx.moveTo(20, -150);
  ctx.quadraticCurveTo(34, -180, 38, -150);
  ctx.quadraticCurveTo(30, -132, 18, -122);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d8a878';                     // صورت از زیر روسری
  wobbleEllipse(0, -152, 27, 30, 0, 11, 1.4);
  ctx.fill();

  ctx.fillStyle = P.ink;
  for (const s2 of [-1, 1]) {
    if (happy) {
      ctx.strokeStyle = P.ink; ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.arc(s2 * 11, -158, 7, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else { ctx.beginPath(); ctx.ellipse(s2 * 11, -156, 3.8, 4.6, 0, 0, TAU); ctx.fill(); }
  }
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -142, happy ? 11 : 8, .18 * Math.PI, .82 * Math.PI);
  ctx.stroke();
  ctx.globalAlpha = .3;
  ctx.fillStyle = P.runas;
  wobbleCircle(-20, -146, 7, 1, .6); ctx.fill();
  wobbleCircle(20, -146, 7, 2, .6); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ───────── پرده‌ها ───────── */

function drawIntro() {
  overlay({
    t: S.introT, title: L().name, body: L().story,
    btn: BTN_GO, btnLabel: 'شروعِ بافت', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.runas, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.green, btnHotFill: '#7fa85e',
    icon: (cx, cy) => {
      const s = 15;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
        const on = [[1,2],[1,3],[0,2],[0,3],[2,1],[2,4]].some(([a,b]) => a===r && b===c);
        ctx.fillStyle = on ? P.runas : (c + r) % 2 ? P.canvas : P.canvasDk;
        ctx.fillRect(cx - 45 + c * s, cy - 22 + r * s, s - 1, s - 1);
      }
      ctx.strokeStyle = P.mirror; ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx, cy - 26); ctx.lineTo(cx, cy + 26); ctx.stroke();
      ctx.setLineDash([]);
    },
  });
}

function drawDone() {
  const last = S.level + 1 >= LEVELS.length;
  overlay({
    t: S.doneT, title: `${L().name} بافته شد!`,
    body: S.axes === 'vh'
      ? 'این نقشه دو خطّ تقارن داشت، برای همین با هر گره چهار گره بافته می‌شد.\nیعنی فقط یک‌چهارمِ نقشه را زدی و بقیه‌اش خودش آمد.'
      : 'یک خطّ تقارن داشت: هر گره دو تا می‌شد.\nنصفِ نقشه را زدی و نصفِ دیگر خودش بافته شد.',
    btn: BTN_GO, btnLabel: last ? 'دارِ خودت' : 'نقشهٔ بعدی', btnHot: S.hover === BTN_GO,
    paper: P.paper, band: P.green, ink: P.ink, inkSoft: P.inkSoft,
    btnFill: P.green, btnHotFill: '#7fa85e',
    icon: (cx, cy) => star(cx, cy, 28, P.gold),
  });
}

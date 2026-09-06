/*!
title: پنج گروهِ مهره‌داران — هر کدام جای خود ۲ (آزمایش)
bg: #2f2116
*/

/* ═══════════════════════════════════════════════════════════════════════
   پنج گروهِ مهره‌داران — علومِ سوم، درس ۱۳

   جدولِ کتاب (ص ۱۱۲): «دانشمندان مهره‌داران را بر اساسِ پوششِ بدن،
   نوعِ تنفّس و تخم‌گذار یا بچّه‌زا بودن در ۵ گروهِ اصلی طبقه‌بندی
   کرده‌اند: ماهی‌ها، دوزیستان، خزندگان، پرندگان، پستانداران.»

   اینجا همان جدول را بچّه خودش پر می‌کند. سه ابزار روی میز هست و
   هیچ‌کدام جواب نمی‌گویند؛ فقط نشان می‌دهند:

     ذره‌بین  → پوششِ بدن را از نزدیک نشان می‌دهد (پولک، پوستِ لغزنده،
                پولکِ سختِ خشک، پَر، مو).
     تماشای نفس → هوا از کجا می‌آید و می‌رود (آبشش یا شش).
     زادگاه   → تخم در آب، تخم با پوستهٔ سخت، یا بچّهٔ زنده و شیر.

   ── درستیِ زیست‌شناسی ────────────────────────────────────────────
   ماهی‌ها:     پولک   | آبشش            | تخم در آب
   دوزیستان:   پوستِ لغزنده | اوّل آبشش بعد شش | تخم در آب
   خزندگان:    پولکِ سخت | شش            | تخم با پوستهٔ سخت
   پرندگان:    پَر     | شش             | تخم با پوستهٔ سخت
   پستانداران: مو      | شش             | بچّه‌زا و شیرده

   سه جانورِ فریب‌دهنده هم روی قفسه هست: پنگوئن (که پَر دارد، پس
   پرنده است)، وال (که با شش نفس می‌کشد و شیر می‌دهد، پس پستاندار
   است) و خفاش (که پرواز می‌کند ولی مو دارد و بچّه‌زاست). فقط سه
   نشانه راست می‌گویند، نه شکلِ ظاهر.
   ═══════════════════════════════════════════════════════════════════════ */

const SCENE_W = 1200, SCENE_H = 760;
const HUD_H = 56;

const P = {
  wood: '#4a3524', woodGrain: '#5f462f', woodDk: '#2b1e14',
  paper: '#f6ecd8', paperDk: '#e4d5b8', card: '#fffaef',
  ink: '#3b2c1e', inkSoft: '#8b7358', line: '#c9b795',
  brass: '#c2913c', brassLt: '#e8c274',
  good: '#5e8f4e', bad: '#b8503a',
  accent: '#3f7f8c', accentLt: '#6fb0bd',
  glass: 'rgba(214, 238, 245, .20)', glassEdge: 'rgba(226, 244, 250, .55)',
  water: '#4f9ec6', waterLt: '#9ad6ef', waterDk: '#2f6f96',
  flesh: '#d98d92', fleshDk: '#a85f68',
  straw: '#c9a45c',
};
P.jelly = 'rgba(198, 232, 236, .62)';
P.milk = '#f7f2e6';

/* ───────── داده‌های جانوری ───────── */

const GROUPS = ['ماهی‌ها', 'دوزیستان', 'خزندگان', 'پرندگان', 'پستانداران'];

const SKIN_N = {
  scale: 'پولک', moist: 'پوستِ لُخت و لغزنده',
  scute: 'پولکِ سختِ خشک', feather: 'پَر', hair: 'مو',
};
const BREATH_N = { gill: 'آبشش', lung: 'شش', both: 'اوّل آبشش، بعد شش' };
const BIRTH_N = { eggW: 'تخم در آب', eggL: 'تخم با پوستهٔ سخت', live: 'بچّه‌زا و شیرده' };

/* c: رنگ‌های بدن | org: جای آبشش، شش و سوراخِ نفس در مختصاتِ خودِ جانور
   box: نیم‌پهنا و نیم‌بلندیِ بدن، برای ذره‌بین                        */
const ANIMALS = [
  { id: 'mahi', n: 'ماهی', g: 0, skin: 'scale', br: 'gill', bi: 'eggW',
    c: { b: '#d9762f', l: '#f5c07a', d: '#a5501c', e: '#2a1c12' },
    org: { gx: -46, gy: 0, lx: -6, ly: 4, nx: -84, ny: 6 }, box: [96, 52] },
  { id: 'bali', n: 'ماهیِ بالی', g: 0, skin: 'scale', br: 'gill', bi: 'eggW',
    c: { b: '#3a7fa8', l: '#a9dcef', d: '#245a7c', e: '#17222b' },
    org: { gx: -44, gy: 0, lx: -6, ly: 4, nx: -82, ny: 4 }, box: [98, 48] },
  { id: 'ghurbaghe', n: 'قورباغه', g: 1, skin: 'moist', br: 'both', bi: 'eggW',
    c: { b: '#6fa63f', l: '#a8d16a', d: '#47702a', e: '#22301a' },
    org: { gx: -30, gy: 10, lx: 0, ly: 6, nx: -54, ny: -6 }, box: [82, 52] },
  { id: 'samandar', n: 'سمندر', g: 1, skin: 'moist', br: 'both', bi: 'eggW',
    c: { b: '#2c2a2e', l: '#e2b52c', d: '#141317', e: '#0d0c10' },
    org: { gx: -40, gy: 4, lx: -8, ly: 2, nx: -74, ny: -2 }, box: [100, 40] },
  { id: 'mar', n: 'مار', g: 2, skin: 'scute', br: 'lung', bi: 'eggL',
    c: { b: '#8a9c46', l: '#c8d182', d: '#5c6a2a', e: '#241f10' },
    org: { gx: -50, gy: 0, lx: -20, ly: 6, nx: -86, ny: -12 }, box: [104, 52] },
  { id: 'lakposht', n: 'لاک‌پشت', g: 2, skin: 'scute', br: 'lung', bi: 'eggL',
    c: { b: '#7a6435', l: '#b79a58', d: '#4e3f1e', e: '#241d10' },
    org: { gx: -54, gy: 8, lx: 0, ly: 4, nx: -84, ny: 0 }, box: [92, 56] },
  { id: 'oghab', n: 'عقاب', g: 3, skin: 'feather', br: 'lung', bi: 'eggL',
    c: { b: '#6b4a2c', l: '#e8dcc4', d: '#3f2a17', e: '#f0b429' },
    org: { gx: -30, gy: 0, lx: -6, ly: 6, nx: -66, ny: -22 }, box: [86, 60] },
  { id: 'pengoen', n: 'پنگوئن', g: 3, skin: 'feather', br: 'lung', bi: 'eggL',
    c: { b: '#2b3440', l: '#f4f0e4', d: '#161d26', e: '#e8922c' },
    org: { gx: -20, gy: 0, lx: 0, ly: 8, nx: -40, ny: -40 }, box: [58, 74] },
  { id: 'gorbe', n: 'گربه', g: 4, skin: 'hair', br: 'lung', bi: 'live',
    c: { b: '#b98d52', l: '#e6cda0', d: '#7d5a2c', e: '#3a2a16' },
    org: { gx: -34, gy: 0, lx: -18, ly: 10, nx: -60, ny: -18 }, box: [86, 60] },
  { id: 'val', n: 'وال', g: 4, skin: 'hair', sparse: true, br: 'lung', bi: 'live',
    c: { b: '#4c6273', l: '#cfdde4', d: '#2e4150', e: '#141d24' },
    org: { gx: -40, gy: 0, lx: -14, ly: 4, nx: -34, ny: -34 }, box: [106, 46] },
  { id: 'khofash', n: 'خفاش', g: 4, skin: 'hair', br: 'lung', bi: 'live',
    c: { b: '#5b4436', l: '#8d6f57', d: '#33261d', e: '#1c1410' },
    org: { gx: -14, gy: 0, lx: 0, ly: 6, nx: -22, ny: -18 }, box: [104, 52] },
];
const byId = (id) => ANIMALS.find((a) => a.id === id);

const QS = [
  { q: 'کدام گروه اوّل با آبشش و بعد با شش نفس می‌کشد؟',
    opts: ['ماهی‌ها', 'دوزیستان', 'خزندگان'], a: 1 },
  { q: 'پنگوئن با کدام‌یک هم‌گروه است؟',
    opts: ['وال', 'عقاب', 'لاک‌پشت'], a: 1 },
];

/* ───────── جای‌ها ───────── */

const SHELF = { x: 16, y: 70, w: 192, h: 676 };
const BENCH = { x: 220, y: 70, w: 760, h: 676 };
const RACK = { x: 992, y: 70, w: 192, h: 676 };
const CX = BENCH.x + BENCH.w / 2;          /* میانهٔ میز */
const AY = 262;                            /* بلندیِ جانور روی میز */

const cardOf = (i) => ({ x: SHELF.x + 8, y: 82 + i * 58.6, w: 176, h: 54 });
const drawerOf = (g) => ({ x: RACK.x + 8, y: 82 + g * 132, w: 176, h: 124 });
const toolOf = (i) => ({ x: 232 + i * 250, y: 456, w: 236, h: 60 });
const evOf = (i) => ({ x: 232 + i * 250, y: 532, w: 236, h: 174 });
const BTN_NOTE = { x: 24, y: 11, w: 158, h: 34 };
const BTN_GO = { x: SCENE_W / 2 - 150, y: 486, w: 300, h: 68 };
const BTN_AGAIN = { x: SCENE_W / 2 - 150, y: 492, w: 300, h: 68 };
const BTN_CHECK = { x: SCENE_W / 2 - 160, y: 610, w: 320, h: 58 };
function qOpt(qi, i) {
  const w = 226, gap = 14;
  return { x: SCENE_W / 2 + (1 - i) * (w + gap) - w / 2, y: 306 + qi * 156, w, h: 58 };
}

/* ───────── حالت ───────── */

const KEYS = ['skin', 'br', 'bi'];
const S = {
  phase: 'intro', phaseT: 0,
  tut: { on: false, step: 0, t: 0 },
  cur: null,                 /* جانورِ روی میز */
  found: {},                 /* id → {skin,br,bi} */
  placed: {},                /* id → شمارهٔ گروه */
  note: [null, null, null, null, null],   /* سطرهای دفترچه */
  noteOpen: false,
  tool: null,                /* 'lens' */
  lens: { x: CX, y: AY }, scan: 0,
  play: null,                /* {k:'br'|'bi', t} */
  ans: [-1, -1], mark: null, markT: 0,
  enter: 0, wrong: 0, wrongG: -1, fly: null,
  t: 0, hover: null, tip: '', tipT: 0, shake: 0, mistakes: 0,
};

const bits = new Bits();
const toast = new Toast();
const cv = document.getElementById('stage');
initStage(cv, SCENE_W, SCENE_H);

function tip(msg) { S.tip = msg; S.tipT = 4; }
const curA = () => (S.cur ? byId(S.cur) : null);
const fnd = (id) => S.found[id] || {};
const allFound = (id) => KEYS.every((k) => fnd(id)[k]);
const placedN = () => Object.keys(S.placed).length;
const inGroup = (g) => ANIMALS.filter((a) => S.placed[a.id] === g);

function reset(keep) {
  S.phase = 'lab'; S.phaseT = 0;
  S.cur = null; S.found = {}; S.placed = {};
  S.note = [null, null, null, null, null];
  S.noteOpen = false; S.tool = null; S.scan = 0; S.play = null;
  S.ans = [-1, -1]; S.mark = null; S.mistakes = 0; S.fly = null;
  S.tut.on = !keep; S.tut.step = 0; S.tut.t = 0;
}

/* ───────── ورودی ───────── */

const TUT_TAP = [0, 1, 2], TUT_LAST = 2;

cv.addEventListener('pointermove', (e) => {
  const p = toStage(e);
  S.hover = null;
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) S.hover = BTN_GO; }
  else if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) S.hover = BTN_AGAIN; }
  else if (S.phase === 'quiz') {
    if (inRect(p, BTN_NOTE)) S.hover = { k: 'note' };
    if (inRect(p, BTN_CHECK)) S.hover = { k: 'check' };
    for (let q = 0; q < QS.length; q++) for (let i = 0; i < QS[q].opts.length; i++)
      if (inRect(p, qOpt(q, i))) S.hover = { k: 'opt', q, i };
  } else if (S.noteOpen) {
    S.hover = { k: 'note' };
  } else {
    if (S.tool === 'lens') S.lens = { x: p.x, y: p.y };
    if (inRect(p, BTN_NOTE)) S.hover = { k: 'note' };
    for (let i = 0; i < ANIMALS.length; i++) if (inRect(p, cardOf(i))) S.hover = { k: 'card', i };
    for (let i = 0; i < 3; i++) if (inRect(p, toolOf(i))) S.hover = { k: 'tool', i };
    for (let g = 0; g < 5; g++) if (inRect(p, drawerOf(g))) S.hover = { k: 'drawer', g };
  }
  cv.style.cursor = S.hover ? 'pointer' : (S.tool === 'lens' ? 'none' : 'default');
});

cv.addEventListener('pointerdown', (e) => {
  const p = toStage(e);
  if (S.phase === 'intro') { if (inRect(p, BTN_GO)) { reset(false); sfx.good(); } return; }
  if (S.phase === 'won') { if (inRect(p, BTN_AGAIN)) { S.phase = 'intro'; S.phaseT = 0; sfx.tap(); } return; }
  if (S.phase === 'quiz') {
    if (S.noteOpen) { S.noteOpen = false; sfx.tap(); return; }
    if (inRect(p, BTN_NOTE)) { S.noteOpen = true; sfx.slide(); return; }
    if (inRect(p, BTN_CHECK)) { checkQuiz(); return; }
    for (let q = 0; q < QS.length; q++) for (let i = 0; i < QS[q].opts.length; i++) {
      if (!inRect(p, qOpt(q, i))) continue;
      S.ans[q] = i; S.mark = null; sfx.tap(); return;
    }
    return;
  }
  if (S.tut.on && tutTap(S.tut, TUT_TAP, TUT_LAST)) return;
  if (S.noteOpen) { S.noteOpen = false; sfx.tap(); return; }
  if (inRect(p, BTN_NOTE)) { S.noteOpen = true; sfx.slide(); return; }

  for (let i = 0; i < ANIMALS.length; i++) {
    if (!inRect(p, cardOf(i))) continue;
    const a = ANIMALS[i];
    if (S.cur === a.id) return;
    S.cur = a.id; S.tool = null; S.scan = 0; S.play = null; S.enter = 0;
    sfx.pop();
    return;
  }
  if (!S.cur) {
    if (inRect(p, { x: BENCH.x, y: BENCH.y, w: BENCH.w, h: 400 })) {
      tip('یکی از جانورهای قفسه را بزن تا روی میز بیاید.');
    }
    return;
  }
  const a = curA();
  for (let i = 0; i < 3; i++) {
    if (!inRect(p, toolOf(i))) continue;
    useTool(i, a);
    return;
  }
  if (S.tool === 'lens') { S.lens = { x: p.x, y: p.y }; return; }
  for (let g = 0; g < 5; g++) {
    if (!inRect(p, drawerOf(g))) continue;
    fileTo(g, a);
    return;
  }
});

function useTool(i, a) {
  const k = KEYS[i];
  if (i === 0) {
    S.tool = S.tool === 'lens' ? null : 'lens';
    S.scan = 0;
    if (S.tool === 'lens') { S.lens = { x: CX, y: AY }; sfx.slide(); }
    else sfx.tap();
    return;
  }
  S.tool = null;
  S.play = { k, t: 0 };
  sfx.slide();
}

/** جانور را در گروهِ g بایگانی می‌کند. */
function fileTo(g, a) {
  if (S.placed[a.id] !== undefined) { tip('این یکی بایگانی شده است.'); return; }
  if (!allFound(a.id)) {
    tip('اوّل هر سه ابزار را روی این جانور امتحان کن.');
    S.shake = .12; sfx.nope(); return;
  }
  if (g !== a.g) {
    S.wrong = .9; S.wrongG = g; S.mistakes++;
    tip('این خانه به نشانه‌های این جانور نمی‌خورد. دوباره به سه کارت نگاه کن.');
    sfx.nope();
    return;
  }
  S.placed[a.id] = g;
  const d = drawerOf(g);
  S.fly = { id: a.id, t: 0, x0: CX, y0: AY, x1: d.x + d.w / 2, y1: d.y + 62 };
  if (S.note[g] === null) {
    S.note[g] = { skin: a.skin, br: a.br, bi: a.bi, id: a.id };
    toast.say('سطرِ ' + GROUPS[g] + ' در دفترچه پر شد', 'good');
  } else toast.say(GROUPS[g], 'good');
  bits.confetti(d.x + d.w / 2, d.y + 40, 18, [P.good, P.brassLt, P.card]);
  sfx.good();
  S.cur = null; S.tool = null; S.play = null; S.scan = 0;
  if (placedN() === ANIMALS.length) { S.phase = 'quiz'; S.phaseT = 0; sfx.win(); }
}

function checkQuiz() {
  if (S.ans.some((x) => x < 0)) { tip('هر دو را جواب بده.'); S.shake = .1; sfx.nope(); return; }
  S.mark = QS.map((q, i) => S.ans[i] === q.a);
  S.markT = 2.6;
  if (S.mark.every(Boolean)) { sfx.win(); S.phase = 'won'; S.phaseT = 0; }
  else { sfx.nope(); S.shake = .14; }
}

/* ───────── حلقه ───────── */

const PLAY_T = 5.2;

function step(dt) {
  S.t += dt;
  if (S.phaseT < 9) S.phaseT += dt;
  if (S.tut.on) S.tut.t += dt;
  if (S.tipT > 0) S.tipT -= dt;
  if (S.markT > 0) S.markT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
  if (S.wrong > 0) { S.wrong = Math.max(0, S.wrong - dt); if (S.wrong === 0) S.wrongG = -1; }
  if (S.enter < 2) S.enter += dt;

  const a = curA();
  if (S.tool === 'lens' && a && !S.tut.on) {
    const d = Math.hypot((S.lens.x - CX) / (a.box[0] * BS), (S.lens.y - AY) / (a.box[1] * BS));
    if (d < 1) S.scan = Math.min(1, S.scan + dt / 1.35);
    else S.scan = Math.max(0, S.scan - dt * .5);
    if (S.scan >= 1 && !fnd(a.id).skin) {
      S.found[a.id] = Object.assign({}, fnd(a.id), { skin: true });
      sfx.good();
      bits.confetti(evOf(0).x + 118, evOf(0).y + 40, 12, [P.brassLt, P.card, P.accentLt]);
      S.tool = null; S.scan = 0;
      toast.say('پوششِ بدن ثبت شد', 'good');
    }
  }
  if (S.play && a) {
    S.play.t += dt;
    if (S.play.t >= PLAY_T) {
      const k = S.play.k;
      if (!fnd(a.id)[k]) {
        S.found[a.id] = Object.assign({}, fnd(a.id), { [k]: true });
        const i = KEYS.indexOf(k);
        bits.confetti(evOf(i).x + 118, evOf(i).y + 40, 12, [P.brassLt, P.card, P.accentLt]);
        sfx.good();
        toast.say(k === 'br' ? 'نوعِ تنفّس ثبت شد' : 'زادگاه ثبت شد', 'good');
      }
      S.play = null;
    }
  }
  if (S.fly) { S.fly.t += dt; if (S.fly.t > .75) S.fly = null; }

  bits.step(dt);
  toast.step(dt);
  draw();
}

whenFontsReady(() => runLoop(step));

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

function spot(shapes, alpha) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  for (const s of shapes) { ctx.moveTo(s.x + s.r, s.y); ctx.arc(s.x, s.y, s.r, 0, TAU, true); }
  ctx.fillStyle = `rgba(24, 16, 10, ${alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
}

function tutCard(x, y, w, lines, title) {
  const h = 26 + (title ? 44 : 0) + lines.length * 30;
  withShadow(24, 10, .5, () => {
    ctx.fillStyle = 'rgba(255, 251, 242, .97)';
    wobbleRect(x, y, w, h + 20, 16, 101, 2.2); ctx.fill();
  }, '40, 26, 14');
  ctx.fillStyle = P.brass;
  wobbleRect(x, y, w, 9, 4, 103, 1); ctx.fill();
  let yy = y + 34;
  if (title) { text(title, x + w / 2, yy + 6, { size: 25, family: 'Lalezar', color: P.ink }); yy += 44; }
  for (const l of lines) { text(l, x + w / 2, yy, { size: 18, color: P.inkSoft }); yy += 30; }
  return h + 20;
}

function eyeAt(x, y, r, c) {
  ctx.fillStyle = '#fdf8ec';
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = c || '#1d1710';
  ctx.beginPath(); ctx.arc(x - r * .2, y, r * .55, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath(); ctx.arc(x - r * .5, y - r * .45, r * .25, 0, TAU); ctx.fill();
}

/* ───────── شکلِ جانورها ───────── */

/** بدنِ جانور در مختصاتِ خودش؛ سر رو به چپ. */
function animalArt(id, t) {
  const a = byId(id), c = a.c;
  const br = Math.sin(t * 2.1) * .5 + .5;      /* نفسِ آرام */
  if (id === 'mahi' || id === 'bali') {
    const slim = id === 'bali' ? .82 : 1;
    ctx.fillStyle = c.d;
    ctx.beginPath();
    ctx.moveTo(64, 0); ctx.quadraticCurveTo(92, -8, 108, -40);
    ctx.quadraticCurveTo(96, -4, 96, 0); ctx.quadraticCurveTo(96, 4, 108, 40);
    ctx.quadraticCurveTo(92, 8, 64, 0); ctx.fill();
    ctx.fillStyle = c.b;
    ctx.beginPath(); ctx.moveTo(-30, -34 * slim);
    ctx.quadraticCurveTo(6, -70 * slim, 46, -26 * slim); ctx.closePath(); ctx.fill();
    wobbleEllipse(0, 0, 84, 42 * slim, 0, 3, 2); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 0, 84, 42 * slim, 0, 0, TAU); ctx.clip();
    ctx.fillStyle = c.l;
    wobbleEllipse(-4, 22 * slim, 70, 22, 0, 7, 1.6); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2;
    for (let r = 0; r < 5; r++) for (let q = 0; q < 8; q++) {
      ctx.beginPath();
      ctx.arc(-70 + q * 22 + (r % 2) * 11, -32 + r * 16, 11, -2.5, -.6);
      ctx.stroke();
    }
    ctx.restore();
    if (id === 'bali') {
      ctx.fillStyle = 'rgba(120, 190, 220, .78)';
      for (const s of [-1, 1]) {
        ctx.save(); ctx.translate(-14, s * 12); ctx.rotate(s * (.5 + Math.sin(t * 3) * .1));
        ctx.beginPath(); ctx.ellipse(30, 0, 62, 17, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(40,90,120,.5)'; ctx.lineWidth = 1.4;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(88, -12 + i * 5); ctx.stroke();
        }
        ctx.restore();
      }
    } else {
      ctx.save();
      ctx.globalAlpha = .8;
      ctx.fillStyle = c.d;
      ctx.translate(-14, 22); ctx.rotate(.62 + Math.sin(t * 3) * .14);
      ctx.beginPath(); ctx.ellipse(16, 0, 22, 8, 0, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(-2, 30); ctx.quadraticCurveTo(18, 58, 42, 26); ctx.closePath(); ctx.fill();
    }
    ctx.save();
    ctx.globalAlpha = .45;
    ctx.strokeStyle = c.d; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(-46, 0, 26, -1, 1); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = c.d; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-84, 6); ctx.quadraticCurveTo(-74, 12, -62, 10); ctx.stroke();
    eyeAt(-62, -12, 8, c.e);
    return;
  }
  if (id === 'ghurbaghe') {
    ctx.fillStyle = c.d;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(38, s * 26); ctx.rotate(s * .5);
      ctx.beginPath(); ctx.ellipse(0, 0, 34, 15, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(26, 12, 20, 10, -.5, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.translate(-36, s * 20); ctx.rotate(-s * .5);
      ctx.strokeStyle = c.d; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-14, 16); ctx.stroke();
      ctx.lineWidth = 4;
      for (let f = -1; f <= 1; f++) {
        ctx.beginPath(); ctx.moveTo(-14, 16); ctx.lineTo(-24 + f * 5, 22 + f * 3); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.fillStyle = c.b;
    wobbleEllipse(0, 4, 68, 40, 0, 3, 2); ctx.fill();
    ctx.fillStyle = c.l;
    wobbleEllipse(-4, 20, 52, 20, 0, 9, 1.6); ctx.fill();
    ctx.fillStyle = c.b;
    wobbleEllipse(-46, -8, 34, 26, 0, 5, 1.8); ctx.fill();
    ctx.fillStyle = c.d;
    ctx.globalAlpha = .4;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.ellipse(-30 + i * 15, -14 + (i % 3) * 16, 8, 5, .4, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const q of [[-60, -26], [-36, -32]]) {
      ctx.fillStyle = c.l;
      ctx.beginPath(); ctx.arc(q[0], q[1], 13, 0, TAU); ctx.fill();
      eyeAt(q[0] - 2, q[1] - 2, 8, c.e);
    }
    ctx.strokeStyle = c.d; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-74, 2); ctx.quadraticCurveTo(-56, 12, -34, 4); ctx.stroke();
    return;
  }
  if (id === 'samandar') {
    ctx.fillStyle = c.b;
    ctx.beginPath();
    ctx.moveTo(-88, 0);
    ctx.quadraticCurveTo(-70, -22, -20, -20);
    ctx.quadraticCurveTo(40, -20, 62, -12);
    ctx.quadraticCurveTo(96, -6, 104, 0);
    ctx.quadraticCurveTo(96, 6, 62, 12);
    ctx.quadraticCurveTo(40, 20, -20, 20);
    ctx.quadraticCurveTo(-70, 22, -88, 0);
    ctx.fill();
    ctx.lineCap = 'round';
    for (const sg of [-1, 1]) for (const q of [[-50, -1], [26, 1]]) {
      const x = q[0], dir = q[1];
      const ex = x + dir * 22, ey = sg * (34 + Math.sin(t * 2 + x) * 2);
      ctx.strokeStyle = c.b; ctx.lineWidth = 11;
      ctx.beginPath(); ctx.moveTo(x, sg * 12); ctx.quadraticCurveTo(x + dir * 14, sg * 24, ex, ey); ctx.stroke();
      ctx.lineWidth = 4;
      for (let f = -1; f <= 1; f++) {
        ctx.beginPath(); ctx.moveTo(ex, ey);
        ctx.lineTo(ex + dir * 9 + f * 4, ey + sg * 8); ctx.stroke();
      }
    }
    ctx.fillStyle = c.l;
    for (const p2 of [[-64, -8], [-38, 8], [-14, -10], [12, 6], [36, -6], [58, 4]]) {
      ctx.beginPath(); ctx.ellipse(p2[0], p2[1], 11, 7, .2, 0, TAU); ctx.fill();
    }
    eyeAt(-72, -8, 6, c.e);
    return;
  }
  if (id === 'mar') {
    const N = 42, pts = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      pts.push({ x: -92 + u * 190, y: Math.sin(u * 6.6 + t * 1.1) * 26 * (1 - u * .2),
                 w: lerp(19, 3, u * u) });
    }
    ctx.fillStyle = c.b;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const q = pts[i], n = pts[Math.min(N, i + 1)], pr = pts[Math.max(0, i - 1)];
      const ang = Math.atan2(n.y - pr.y, n.x - pr.x) + Math.PI / 2;
      const x = q.x + Math.cos(ang) * q.w, y = q.y + Math.sin(ang) * q.w;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    for (let i = N; i >= 0; i--) {
      const q = pts[i], n = pts[Math.min(N, i + 1)], pr = pts[Math.max(0, i - 1)];
      const ang = Math.atan2(n.y - pr.y, n.x - pr.x) + Math.PI / 2;
      ctx.lineTo(q.x - Math.cos(ang) * q.w, q.y - Math.sin(ang) * q.w);
    }
    ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip();
    ctx.globalAlpha = .34;
    ctx.fillStyle = c.d;
    for (let i = 0; i < N; i += 4) {
      ctx.beginPath(); ctx.ellipse(pts[i].x, pts[i].y, 5, 18, .3, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    ctx.fillStyle = c.b;
    ctx.beginPath(); ctx.ellipse(pts[0].x - 8, pts[0].y, 22, 15, -.2, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#c04a3a'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    const tg = 6 + Math.sin(t * 3) * 5;
    ctx.beginPath();
    ctx.moveTo(pts[0].x - 26, pts[0].y + 2);
    ctx.lineTo(pts[0].x - 26 - tg, pts[0].y + 2);
    ctx.moveTo(pts[0].x - 26 - tg, pts[0].y + 2);
    ctx.lineTo(pts[0].x - 34 - tg, pts[0].y - 4);
    ctx.moveTo(pts[0].x - 26 - tg, pts[0].y + 2);
    ctx.lineTo(pts[0].x - 34 - tg, pts[0].y + 8);
    ctx.stroke();
    eyeAt(pts[0].x - 12, pts[0].y - 6, 6, c.e);
    return;
  }
  if (id === 'lakposht') {
    ctx.fillStyle = c.d;
    ctx.lineCap = 'round';
    for (const q of [[-38, -1], [40, 1]]) {
      ctx.save(); ctx.translate(q[0], 24); ctx.rotate(q[1] * .5);
      ctx.beginPath(); ctx.ellipse(0, 12, 15, 22, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = shade(c.d, -.3); ctx.lineWidth = 3.4;
      for (let f = -1; f <= 1; f++) {
        ctx.beginPath(); ctx.moveTo(f * 7, 26); ctx.lineTo(f * 9, 34); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.fillStyle = c.l;
    ctx.beginPath(); ctx.ellipse(-62, 6 - br * 3, 26, 19, -.2, 0, TAU); ctx.fill();
    ctx.strokeStyle = shade(c.l, -.4); ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(-84, 8 - br * 3); ctx.quadraticCurveTo(-74, 14 - br * 3, -60, 12 - br * 3); ctx.stroke();
    ctx.strokeStyle = c.d; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-46, 12); ctx.lineTo(-28, 12); ctx.stroke();
    ctx.fillStyle = c.b;
    ctx.beginPath(); ctx.ellipse(4, 0, 76, 48, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = c.d;
    ctx.beginPath(); ctx.ellipse(4, 0, 76, 12, 0, 0, Math.PI); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(4, 0, 76, 48, 0, Math.PI, TAU); ctx.clip();
    ctx.strokeStyle = c.d; ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(4 + i * 26, -50); ctx.lineTo(4 + i * 30, 4); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(4, 0, 46, 30, 0, Math.PI, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    ctx.beginPath(); ctx.ellipse(-16, -26, 30, 12, -.4, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = c.d; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(74, 2); ctx.lineTo(90, 10); ctx.stroke();
    eyeAt(-70, 0, 6, c.e);
    return;
  }
  if (id === 'oghab') {
    ctx.fillStyle = c.b;
    ctx.beginPath(); ctx.ellipse(6, 6, 58, 42, -.16, 0, TAU); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(48, -14); ctx.quadraticCurveTo(84, 0, 92, 34);
    ctx.quadraticCurveTo(58, 30, 40, 22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.d;
    ctx.beginPath();
    ctx.moveTo(-6, -22); ctx.quadraticCurveTo(52, -16, 62, 34);
    ctx.quadraticCurveTo(16, 34, -14, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(-4 + i * 8, -16 + i * 4);
      ctx.quadraticCurveTo(28 + i * 6, -4 + i * 6, 40 + i * 5, 26); ctx.stroke();
    }
    ctx.fillStyle = c.l;
    ctx.beginPath(); ctx.ellipse(-42, -22, 30, 26, -.1, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-16, 6, 26, 24, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = c.e;
    ctx.beginPath();
    ctx.moveTo(-64, -26); ctx.quadraticCurveTo(-86, -22, -78, -4);
    ctx.quadraticCurveTo(-70, -12, -58, -12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = c.e; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(-6 + s * 11, 36); ctx.lineTo(-6 + s * 11, 48);
      ctx.moveTo(-6 + s * 11, 48); ctx.lineTo(-16 + s * 11, 53);
      ctx.moveTo(-6 + s * 11, 48); ctx.lineTo(3 + s * 11, 53); ctx.stroke();
    }
    eyeAt(-56, -30, 7, '#3a2a12');
    return;
  }
  if (id === 'pengoen') {
    ctx.fillStyle = c.e;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(-4 + s * 16, 72, 18, 8, s * .2, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = c.b;
    wobbleEllipse(0, 8, 46, 62, 0, 3, 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -50, 32, 30, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = c.l;
    wobbleEllipse(-4, 16, 32, 48, 0, 7, 1.6); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-6, -46, 22, 24, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = c.b;
    ctx.beginPath(); ctx.ellipse(6, -62, 26, 20, .2, 0, TAU); ctx.fill();
    ctx.fillStyle = c.d;
    ctx.save(); ctx.translate(36, 4); ctx.rotate(Math.sin(t * 2.4) * .22);
    ctx.beginPath(); ctx.ellipse(0, 18, 12, 38, .12, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = c.e;
    ctx.beginPath();
    ctx.moveTo(-24, -48); ctx.lineTo(-46, -42); ctx.lineTo(-24, -38); ctx.closePath(); ctx.fill();
    eyeAt(-16, -56, 6, '#1a1410');
    return;
  }
  if (id === 'gorbe') {
    ctx.fillStyle = c.d;
    ctx.save(); ctx.translate(52, 20);
    ctx.rotate(Math.sin(t * 1.7) * .3);
    ctx.strokeStyle = c.b; ctx.lineWidth = 13; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(34, -6, 28, -44); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = c.b;
    wobbleEllipse(4, 14, 56, 40, -.08, 3, 2); ctx.fill();
    ctx.fillStyle = c.d;
    for (const x of [-28, 26]) {
      ctx.beginPath(); ctx.ellipse(x, 48, 15, 10, 0, 0, TAU); ctx.fill();
      ctx.fillRect(x - 8, 26, 16, 20);
    }
    ctx.fillStyle = c.b;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-46 + s * 14, -34); ctx.lineTo(-52 + s * 20, -64);
      ctx.lineTo(-30 + s * 16, -50); ctx.closePath(); ctx.fill();
    }
    ctx.beginPath(); ctx.ellipse(-44, -20, 34, 30, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = c.l;
    ctx.beginPath(); ctx.ellipse(-52, -10, 20, 15, 0, 0, TAU); ctx.fill();
    wobbleEllipse(0, 30, 34, 20, 0, 11, 1.4); ctx.fill();
    ctx.fillStyle = c.d;
    ctx.globalAlpha = .5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.ellipse(-6 + i * 18, -8 + (i % 2) * 6, 5, 13, .2, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#d0787f';
    ctx.beginPath();
    ctx.moveTo(-62, -14); ctx.lineTo(-54, -14); ctx.lineTo(-58, -8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.6;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(-60, -8); ctx.lineTo(-92, -16 + i * 9); ctx.stroke();
    }
    eyeAt(-58, -28, 7, '#2c6b3a');
    eyeAt(-34, -30, 7, '#2c6b3a');
    return;
  }
  if (id === 'val') {
    ctx.fillStyle = c.b;
    ctx.beginPath();
    ctx.moveTo(-98, 2);
    ctx.quadraticCurveTo(-70, -40, 10, -36);
    ctx.quadraticCurveTo(66, -32, 78, -6);
    ctx.quadraticCurveTo(96, -30, 108, -34);
    ctx.quadraticCurveTo(100, 0, 108, 34);
    ctx.quadraticCurveTo(96, 30, 78, 8);
    ctx.quadraticCurveTo(60, 34, 0, 36);
    ctx.quadraticCurveTo(-72, 36, -98, 2);
    ctx.fill();
    ctx.fillStyle = c.l;
    ctx.beginPath();
    ctx.moveTo(-92, 8); ctx.quadraticCurveTo(-40, 34, 20, 30);
    ctx.quadraticCurveTo(56, 26, 74, 6);
    ctx.quadraticCurveTo(30, 22, -92, 8);
    ctx.fill();
    ctx.strokeStyle = c.d; ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(-58 + i * 13, 15 + i * .6);
      ctx.quadraticCurveTo(-54 + i * 13, 25, -48 + i * 13, 31 - i * 1.2);
      ctx.stroke();
    }
    ctx.fillStyle = c.d;
    ctx.save(); ctx.translate(-18, 26); ctx.rotate(.5 + Math.sin(t * 2) * .12);
    ctx.beginPath(); ctx.ellipse(14, 0, 30, 11, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = c.d; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-96, 14); ctx.quadraticCurveTo(-72, 22, -44, 20); ctx.stroke();
    ctx.fillStyle = c.d;
    ctx.beginPath(); ctx.ellipse(-34, -34, 7, 4, 0, 0, TAU); ctx.fill();
    eyeAt(-74, 0, 6, c.e);
    return;
  }
  if (id === 'khofash') {
    const fl = Math.sin(t * 3.4) * .28;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(0, -6); ctx.scale(s, 1); ctx.rotate(fl);
      ctx.fillStyle = c.l;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.quadraticCurveTo(56, -46, 104, -30);
      ctx.quadraticCurveTo(86, -8, 92, 8);
      ctx.quadraticCurveTo(70, -4, 62, 14);
      ctx.quadraticCurveTo(48, 0, 34, 20);
      ctx.quadraticCurveTo(20, 6, 0, 16);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = c.d; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (const e of [[100, -28], [88, 4], [58, 12], [30, 18]]) {
        ctx.beginPath(); ctx.moveTo(2, -4); ctx.lineTo(e[0], e[1]); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.fillStyle = c.b;
    wobbleEllipse(0, 8, 22, 32, 0, 3, 1.6); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -26, 22, 19, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = c.d;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * 6, -40); ctx.quadraticCurveTo(s * 26, -66, s * 24, -34);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = c.l;
    ctx.beginPath(); ctx.ellipse(0, -18, 12, 10, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f7f2e6';
    ctx.beginPath(); ctx.moveTo(-4, -12); ctx.lineTo(-1, -6); ctx.lineTo(-7, -8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -12); ctx.lineTo(7, -8); ctx.lineTo(1, -6); ctx.closePath(); ctx.fill();
    eyeAt(-8, -28, 5, c.e);
    eyeAt(8, -28, 5, c.e);
    return;
  }
}

/* ───────── بافتِ پوشش، زیرِ ذره‌بین ───────── */

function skinPatch(a, cx, cy, r, t) {
  const c = a.c, k = a.skin;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
  ctx.fillStyle = c.b;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  if (k === 'scale') {
    const st = r * .42;
    for (let row = -4; row < 5; row++) for (let col = -4; col < 5; col++) {
      const x = cx + col * st + (row % 2 ? st / 2 : 0), y = cy + row * st * .68;
      const g = ctx.createLinearGradient(x, y - st * .6, x, y + st * .6);
      g.addColorStop(0, c.l); g.addColorStop(1, c.d);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, st * .58, Math.PI, TAU * .5); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, y, st * .58, .25, Math.PI - .25); ctx.stroke();
    }
    const g2 = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g2.addColorStop(0, 'rgba(255,255,255,0)');
    g2.addColorStop(.5 + .18 * Math.sin(t * 1.4), 'rgba(255,255,255,.3)');
    g2.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g2; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  } else if (k === 'moist') {
    const g = ctx.createRadialGradient(cx - r * .3, cy - r * .3, r * .1, cx, cy, r);
    g.addColorStop(0, c.l); g.addColorStop(1, c.d);
    ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = c.d;
    ctx.globalAlpha = .5;
    for (let i = 0; i < 40; i++) {
      const x = cx - r + noise1(i * 2.1) * r * 2, y = cy - r + noise1(i * 5.3) * r * 2;
      ctx.beginPath(); ctx.ellipse(x, y, r * .09, r * .06, .3, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 7; i++) {
      const ph = t * .5 + i;
      const x = cx + Math.cos(ph) * r * .5, y = cy + Math.sin(ph * 1.3) * r * .5;
      ctx.beginPath(); ctx.ellipse(x, y, r * .17, r * .1, -.5, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.ellipse(cx - r * .35, cy - r * .4, r * .22, r * .11, -.6, 0, TAU); ctx.fill();
  } else if (k === 'scute') {
    const st = r * .46;
    for (let row = -4; row < 5; row++) for (let col = -4; col < 5; col++) {
      const x = cx + col * st * 1.5, y = cy + row * st * .87 + (col % 2 ? st * .44 : 0);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const A = i * TAU / 6;
        const px = x + Math.cos(A) * st * .52, py = y + Math.sin(A) * st * .52;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = i2(c, (row * 3 + col) % 3);
      ctx.fill();
      ctx.strokeStyle = 'rgba(30,20,10,.55)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - st * .3, y); ctx.lineTo(x + st * .3, y); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(60,44,24,.16)';
    for (let i = 0; i < 90; i++) {
      const x = cx - r + noise1(i * 1.7) * r * 2, y = cy - r + noise1(i * 4.1) * r * 2;
      ctx.fillRect(x, y, 2, 2);
    }
  } else if (k === 'feather') {
    ctx.fillStyle = shade(c.d, .28); ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    for (let f = 0; f < 3; f++) {
      const x0 = cx - r * .72 + f * r * .72, y0 = cy + r * .95, x1 = x0 + r * .2, y1 = cy - r * 1.05;
      ctx.fillStyle = f % 2 ? c.b : c.l;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x0 - r * .46, cy, x1, y1);
      ctx.quadraticCurveTo(x0 + r * .46, cy, x0, y0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.30)'; ctx.lineWidth = 1.1;
      for (let i = 1; i < 16; i++) {
        const u = i / 16;
        const sx = lerp(x0, x1, u), sy = lerp(y0, y1, u);
        const wd = Math.sin(u * Math.PI) * r * .42;
        ctx.beginPath();
        ctx.moveTo(sx - wd, sy + wd * .5); ctx.lineTo(sx, sy);
        ctx.lineTo(sx + wd, sy + wd * .5); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(40,28,16,.7)'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
  } else {
    const g = ctx.createRadialGradient(cx - r * .3, cy - r * .4, r * .1, cx, cy, r);
    g.addColorStop(0, a.sparse ? c.l : c.b);
    g.addColorStop(1, c.d);
    ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    const n = a.sparse ? 16 : 150;
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = cx - r + noise1(i * 1.9) * r * 2, y = cy - r + noise1(i * 3.7 + 1) * r * 2;
      const len = r * (a.sparse ? .42 : .55) * (.6 + noise1(i * 7.3) * .6);
      const ang = -1.15 + noise1(i * 2.7) * .5;
      ctx.strokeStyle = i % 3 === 0 ? c.l : (i % 3 === 1 ? c.b : c.d);
      ctx.lineWidth = a.sparse ? 2.4 : 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(ang) * len * .6 + 6, y + Math.sin(ang) * len * .6,
                           x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
    if (a.sparse) {
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath(); ctx.ellipse(cx - r * .3, cy - r * .45, r * .3, r * .12, -.5, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(40,26,14,.45)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
}
const i2 = (c, k) => (k === 0 ? c.b : k === 1 ? c.d : c.l);

/* ───────── اندام‌ها ───────── */

function lungsShape(x, y, s, infl) {
  ctx.fillStyle = P.flesh;
  for (const sg of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x, y - 14 * s);
    ctx.quadraticCurveTo(x + sg * (17 + 7 * infl) * s, y - 8 * s, x + sg * (14 + 6 * infl) * s, y + 15 * s);
    ctx.quadraticCurveTo(x + sg * 7 * s, y + 23 * s, x + sg * 2 * s, y + 5 * s);
    ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = P.fleshDk; ctx.lineWidth = 3.4 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y - 30 * s); ctx.lineTo(x, y - 8 * s); ctx.stroke();
  for (const sg of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(x, y - 12 * s); ctx.lineTo(x + sg * 9 * s, y + 4 * s); ctx.stroke();
  }
}

function gillsShape(x, y, s, ph) {
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = i % 2 ? '#c8404a' : '#e0616a';
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.arc(x + i * 5 * s, y, (16 - i * 3) * s * (1 + .07 * Math.sin(ph - i * .5)), -1.25, 1.25);
    ctx.stroke();
  }
}

/** نوزادِ دوزیستان: بچّه‌قورباغه با آبششِ بیرونی. */
function larvaArt(a, t) {
  const c = a.c;
  ctx.fillStyle = c.d;
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.quadraticCurveTo(44, -26, 74, -22);
  ctx.quadraticCurveTo(58, 0, 74, 22);
  ctx.quadraticCurveTo(44, 26, 6, 0);
  ctx.fill();
  ctx.fillStyle = c.b;
  wobbleEllipse(-16, 0, 44, 30, 0, 3, 1.8); ctx.fill();
  ctx.fillStyle = c.l;
  wobbleEllipse(-20, 10, 30, 14, 0, 5, 1.4); ctx.fill();
  /* آبششِ بیرونیِ پَرمانند، دو دسته پشتِ سر */
  ctx.lineCap = 'round';
  for (const sg of [-1, 1]) {
    const bx = -8, by = sg * 24;
    for (let i = 0; i < 5; i++) {
      const A = sg * (.9 + i * .26), L = 32 - i * 3;
      const ex = bx + Math.cos(A) * L, ey = by + Math.sin(A) * L + Math.sin(t * 5 + i) * 2.4;
      ctx.strokeStyle = '#d4636c'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + Math.cos(A) * L * .5, by + Math.sin(A) * L * .4, ex, ey); ctx.stroke();
      ctx.strokeStyle = 'rgba(238, 152, 160, .95)'; ctx.lineWidth = 2;
      for (let j = 1; j <= 3; j++) {
        const u = j / 4;
        const px = lerp(bx, ex, u), py = lerp(by, ey, u);
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + sg * 8, py + sg * 4); ctx.stroke();
      }
    }
    ctx.strokeStyle = '#c8535e'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-8, sg * 18); ctx.lineTo(bx, by); ctx.stroke();
  }
  eyeAt(-38, -8, 6, c.e);
}

/* ───────── پنجرهٔ مشاهده ───────── */

const W = { x: 264, y: 92, w: 672, h: 340 };
const BS = 1.7;                       /* بزرگ‌نماییِ جانور روی میز */

function winBack(kind, t) {
  ctx.save();
  ctx.beginPath(); rrPath(W.x, W.y, W.w, W.h, 18); ctx.clip();
  if (kind === 'water') {
    const g = ctx.createLinearGradient(0, W.y, 0, W.y + W.h);
    g.addColorStop(0, P.waterLt); g.addColorStop(1, P.waterDk);
    ctx.fillStyle = g; ctx.fillRect(W.x, W.y, W.w, W.h);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      for (let x = W.x; x <= W.x + W.w; x += 16) {
        const y = W.y + 30 + i * 66 + Math.sin(x * .015 + t * .9 + i) * 7;
        x === W.x ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (kind === 'sand') {
    const g = ctx.createLinearGradient(0, W.y, 0, W.y + W.h);
    g.addColorStop(0, '#b9dcea'); g.addColorStop(.55, '#f0e3c4'); g.addColorStop(1, '#c9a86a');
    ctx.fillStyle = g; ctx.fillRect(W.x, W.y, W.w, W.h);
    ctx.fillStyle = 'rgba(255, 226, 150, .85)';
    ctx.beginPath(); ctx.arc(W.x + 96, W.y + 58, 32, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255, 238, 190, .3)';
    ctx.beginPath(); ctx.arc(W.x + 96, W.y + 58, 54, 0, TAU); ctx.fill();
  } else {
    const g = ctx.createLinearGradient(0, W.y, 0, W.y + W.h);
    g.addColorStop(0, '#dcecf2'); g.addColorStop(1, '#f3ead6');
    ctx.fillStyle = g; ctx.fillRect(W.x, W.y, W.w, W.h);
    ctx.fillStyle = 'rgba(255, 232, 170, .8)';
    ctx.beginPath(); ctx.arc(W.x + 92, W.y + 62, 34, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255, 240, 200, .35)';
    ctx.beginPath(); ctx.arc(W.x + 92, W.y + 62, 56, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    for (let i = 0; i < 3; i++) {
      const x = W.x + 90 + i * 210 + Math.sin(t * .2 + i) * 20;
      ctx.beginPath(); ctx.ellipse(x, W.y + 60 + i * 18, 62, 22, 0, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(60, 42, 24, .35)'; ctx.lineWidth = 4;
  ctx.beginPath(); rrPath(W.x, W.y, W.w, W.h, 18); ctx.stroke();
}

function bubbleUp(x, y, seed, t, n, spread) {
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  for (let i = 0; i < n; i++) {
    const ph = (t * .42 + noise1(seed + i * 3.1)) % 1;
    const r = 3 + noise1(seed + i * 5.7) * 4;
    ctx.globalAlpha = .75 * (1 - ph);
    ctx.beginPath();
    ctx.arc(x - ph * 40 + Math.sin(ph * 9 + i) * 8,
            y - ph * (W.h * .42) - 10, r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** تماشای نفس. */
function breathView(a, u) {
  const t = S.t, o = a.org;
  const both = a.br === 'both';
  const larva = both && u < .44;
  const wet = a.br === 'gill' || larva || a.id === 'val' || a.id === 'ghurbaghe' || a.id === 'samandar';
  winBack(wet ? 'water' : 'air', t);
  const infl = .5 + .5 * Math.sin(t * 1.9);
  ctx.save();
  ctx.translate(CX, AY);
  ctx.scale(BS * (larva ? 1.35 : 1), BS * (larva ? 1.35 : 1));
  ctx.globalAlpha = larva ? .9 : .62;
  if (larva) larvaArt(a, t); else animalArt(a.id, t);
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.shadowColor = 'rgba(220, 90, 100, .8)'; ctx.shadowBlur = 16;
  if (larva) { /* آبششش بیرون است و خودش پیداست */ }
  else if (a.br === 'gill') gillsShape(o.gx, o.gy, 1, t * 3.4);
  else lungsShape(o.lx, o.ly, 1, infl);
  ctx.restore();
  /* راهِ هوا */
  ctx.fillStyle = larva || a.br === 'gill' ? 'rgba(70, 200, 255, .95)' : 'rgba(255, 255, 255, .98)';
  const from = larva ? { x: -56, y: 4 } : { x: o.nx, y: o.ny };
  const to = larva ? { x: -8, y: 22 } : (a.br === 'gill' ? { x: o.gx, y: o.gy } : { x: o.lx, y: o.ly });
  for (let i = 0; i < 7; i++) {
    const ph = ((t * .6 + i / 7) % 1);
    const x = lerp(from.x, to.x, ph);
    const y = lerp(from.y, to.y, ph);
    ctx.globalAlpha = Math.sin(ph * Math.PI) * .95;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(30, 60, 80, .3)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  if (larva) {
    bubbleUp(CX + 30, AY - 20, 3, t, 10);
  } else if (a.br === 'gill') {
    bubbleUp(CX + o.gx * BS + 26, AY + o.gy * BS, 3, t, 10);
  } else if (wet) {
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(W.x + 20, W.y + 46); ctx.lineTo(W.x + W.w - 20, W.y + 46); ctx.stroke();
    bubbleUp(CX + o.nx * BS, AY + o.ny * BS, 9, t, 5);
  }
  if (!both) {
    text(a.br === 'gill' ? 'زیرِ آب می‌ماند و بالا نمی‌آید' : 'باید هوای بیرون را بگیرد',
      CX, W.y + 30, { size: 20, family: 'Lalezar', color: wet ? '#e8f6fb' : '#33454f' });
  }
  if (both) {
    const lbl = u < .44 ? 'نوزاد، در آب' : 'بزرگ‌سال، بیرونِ آب';
    text(lbl, CX, W.y + 30, { size: 20, family: 'Lalezar', color: '#26404c' });
    if (u > .38 && u < .52) {
      ctx.save();
      ctx.globalAlpha = 1 - Math.abs(u - .45) / .07;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(W.x, W.y, W.w, W.h);
      ctx.restore();
    }
  }
}

/** زادگاه. */
function birthView(a, u) {
  const t = S.t, c = a.c;
  if (a.bi === 'eggW') {
    winBack('water', t);
    const cx = CX, cy = AY + 10;
    ctx.fillStyle = P.jelly;
    ctx.beginPath(); ctx.ellipse(cx, cy, 130, 74, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 22; i++) {
      const A = i * 2.4, rr = 20 + (i % 5) * 22;
      const x = cx + Math.cos(A) * rr * 1.5, y = cy + Math.sin(A) * rr * .8;
      ctx.fillStyle = 'rgba(240, 250, 252, .85)';
      ctx.beginPath(); ctx.arc(x, y, 15, 0, TAU); ctx.fill();
      ctx.fillStyle = c.d;
      const wig = u > .5 ? Math.sin(t * 8 + i) * 2 : 0;
      ctx.beginPath(); ctx.arc(x + wig, y, 6.5, 0, TAU); ctx.fill();
    }
    if (u > .62) {
      const k = (u - .62) / .38;
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.translate(cx - 40 - k * (90 + i * 30), cy - 40 + i * 22 + Math.sin(t * 4 + i) * 8);
        ctx.scale(.34, .34);
        ctx.globalAlpha = clamp(k * 3, 0, 1);
        larvaArt(a, t + i);
        ctx.restore();
      }
    }
    text('تخم‌های نرم، بی‌پوسته، در آب', CX, W.y + 30, { size: 20, family: 'Lalezar', color: '#1f3d4d' });
    return;
  }
  if (a.bi === 'eggL') {
    winBack('sand', t);
    const gy = AY + 74, cx = CX;
    /* زمین */
    ctx.save();
    ctx.beginPath(); rrPath(W.x, W.y, W.w, W.h, 18); ctx.clip();
    ctx.fillStyle = a.g === 3 ? '#a8bb72' : '#d8bc80';
    ctx.beginPath();
    ctx.moveTo(W.x, gy + 4);
    ctx.quadraticCurveTo(cx, gy - 24, W.x + W.w, gy + 4);
    ctx.lineTo(W.x + W.w, W.y + W.h); ctx.lineTo(W.x, W.y + W.h);
    ctx.fill();
    if (a.g === 3) {
      /* لانهٔ بافته */
      ctx.fillStyle = '#b8863c';
      ctx.beginPath(); ctx.ellipse(cx, gy + 26, 210, 62, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#8f6526';
      ctx.beginPath(); ctx.ellipse(cx, gy + 8, 168, 40, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#c9a45c'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      for (let i = 0; i < 34; i++) {
        const A = noise1(i * 3.3) * TAU, r0 = 130 + noise1(i * 1.7) * 88;
        const x0 = cx + Math.cos(A) * r0, y0 = gy + 24 + Math.sin(A) * r0 * .3;
        ctx.beginPath(); ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + Math.cos(A + 1.4) * 52, y0 + Math.sin(A + 1.4) * 14); ctx.stroke();
      }
    } else {
      /* گودالِ شنی */
      ctx.fillStyle = '#c2a068';
      ctx.beginPath(); ctx.ellipse(cx, gy + 20, 200, 52, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#b08d55';
      ctx.beginPath(); ctx.ellipse(cx, gy + 12, 150, 34, 0, 0, TAU); ctx.fill();
    }
    ctx.restore();
    for (let i = 0; i < 3; i++) {
      const x = cx - 104 + i * 104, cracked = i === 1 && u > .55;
      withShadow(12, 6, .32, () => {
        ctx.fillStyle = '#f6eedb';
        ctx.beginPath(); ctx.ellipse(x, gy - 10, 36, 48, i * .18 - .18, 0, TAU); ctx.fill();
      });
      const eg = ctx.createLinearGradient(x - 36, gy - 58, x + 36, gy + 38);
      eg.addColorStop(0, 'rgba(255,255,255,.6)');
      eg.addColorStop(1, 'rgba(140,116,80,.35)');
      ctx.fillStyle = eg;
      ctx.beginPath(); ctx.ellipse(x, gy - 10, 36, 48, i * .18 - .18, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(150,128,96,.75)'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.ellipse(x, gy - 10, 36, 48, i * .18 - .18, 0, TAU); ctx.stroke();
      if (cracked) {
        const k = clamp((u - .55) / .45, 0, 1);
        ctx.strokeStyle = '#8a7550'; ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(x - 32, gy - 24);
        for (let j = 1; j <= 7; j++) ctx.lineTo(x - 32 + j * 9.4, gy - 24 + (j % 2 ? 11 : -7));
        ctx.stroke();
        ctx.save();
        ctx.translate(x, gy - 46 - k * 30); ctx.scale(.36, .36);
        ctx.globalAlpha = k;
        animalArt(a.id, t);
        ctx.restore();
      }
    }
    text('تخم با پوستهٔ سخت، بیرونِ آب', CX, W.y + 30, { size: 20, family: 'Lalezar', color: '#4a3a1c' });
    return;
  }
  winBack(a.id === 'val' ? 'water' : 'air', t);
  const gy = AY + 40;
  ctx.save();
  ctx.translate(CX + 90, gy - 30); ctx.scale(1.05, 1.05);
  animalArt(a.id, t);
  ctx.restore();
  const k = clamp((u - .25) / .5, 0, 1);
  ctx.save();
  ctx.translate(CX - 140 + k * 100, gy + 30 + Math.sin(t * 3) * 4);
  ctx.scale(.44, .44);
  animalArt(a.id, t * 1.3);
  ctx.restore();
  if (u > .62) {
    ctx.save();
    ctx.globalAlpha = clamp((u - .62) * 4, 0, 1);
    ctx.fillStyle = P.milk;
    for (let i = 0; i < 5; i++) {
      const ph = (t * .8 + i / 5) % 1;
      ctx.globalAlpha = (1 - ph) * .9;
      ctx.beginPath();
      ctx.arc(CX + 10 - ph * 40, gy + 6 + ph * 22, 6, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  text('بچّهٔ زنده، و شیر خوردن', CX, W.y + 30, { size: 20, family: 'Lalezar', color: '#33454f' });
}

/* ───────── نشانه‌های کوچک ───────── */

function brIcon(a, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (a.br === 'gill') { gillsShape(-4, 0, 1, S.t * 3); dropletHint(24, -6); }
  else if (a.br === 'lung') lungsShape(0, 0, 1, .5 + .5 * Math.sin(S.t * 2));
  else {
    ctx.save(); ctx.translate(-30, 0); ctx.scale(.8, .8); gillsShape(0, 0, 1, S.t * 3); ctx.restore();
    ctx.save(); ctx.translate(30, 0); ctx.scale(.8, .8); lungsShape(0, 0, 1, .5 + .5 * Math.sin(S.t * 2)); ctx.restore();
    ctx.strokeStyle = P.inkSoft; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(6, 0); ctx.lineTo(0, -6); ctx.moveTo(6, 0); ctx.lineTo(0, 6); ctx.stroke();
  }
  ctx.restore();
}
function dropletHint(x, y) {
  ctx.fillStyle = 'rgba(90, 170, 210, .8)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(x + i * 9, y - i * 8, 4 - i * .6, 0, TAU); ctx.fill();
  }
}

function biIcon(a, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (a.bi === 'eggW') {
    ctx.fillStyle = 'rgba(150, 205, 220, .55)';
    ctx.beginPath(); ctx.ellipse(0, 0, 44, 24, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 5; i++) {
      const x2 = -28 + i * 14, y2 = (i % 2 ? -6 : 6);
      ctx.fillStyle = '#f2fbfd';
      ctx.beginPath(); ctx.arc(x2, y2, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = a.c.d;
      ctx.beginPath(); ctx.arc(x2, y2, 4.4, 0, TAU); ctx.fill();
    }
  } else if (a.bi === 'eggL') {
    ctx.strokeStyle = P.straw; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath(); ctx.moveTo(-42 + i * 13, 22); ctx.lineTo(-30 + i * 13, 14); ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#f6eedb';
      ctx.beginPath(); ctx.ellipse(-26 + i * 26, 2, 13, 18, i * .3 - .3, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(150,130,100,.7)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(-26 + i * 26, 2, 13, 18, i * .3 - .3, 0, TAU); ctx.stroke();
    }
  } else {
    ctx.save(); ctx.translate(22, 4); ctx.scale(.32, .32); animalArt(a.id, S.t); ctx.restore();
    ctx.save(); ctx.translate(-28, 14); ctx.scale(.17, .17); animalArt(a.id, S.t * 1.3); ctx.restore();
    ctx.fillStyle = P.milk;
    ctx.strokeStyle = P.inkSoft; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-30, -22); ctx.quadraticCurveTo(-20, -8, -30, -4);
    ctx.quadraticCurveTo(-40, -8, -30, -22); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

/* ───────── قفسه و بایگانی ───────── */

const miniS = (a) => 25 / Math.max(a.box[0], a.box[1] * 1.15);

function miniAnimal(id, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  animalArt(id, S.t + id.length);
  ctx.restore();
}

function drawShelf() {
  ctx.fillStyle = texWood(P.wood, P.woodGrain);
  ctx.beginPath(); rrPath(SHELF.x, SHELF.y, SHELF.w, SHELF.h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(20,12,6,.5)'; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(SHELF.x, SHELF.y, SHELF.w, SHELF.h, 14); ctx.stroke();
  for (let i = 0; i < ANIMALS.length; i++) {
    const a = ANIMALS[i], b = cardOf(i);
    const done = S.placed[a.id] !== undefined;
    const sel = S.cur === a.id;
    const hot = S.hover && S.hover.k === 'card' && S.hover.i === i;
    ctx.save();
    if (done) ctx.globalAlpha = .5;
    paper(b.x, b.y + (hot && !done ? -2 : 0), b.w, b.h, sel ? '#fff4d8' : P.card, 20 + i, 10, .3);
    if (sel) {
      ctx.strokeStyle = P.brass; ctx.lineWidth = 3.4;
      ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
    }
    miniAnimal(a.id, b.x + 36, b.y + 27, miniS(a));
    text(a.n, b.x + b.w - 14, b.y + 28, { size: 17, color: P.ink, align: 'right' });
    if (done) {
      ctx.fillStyle = P.good;
      ctx.beginPath(); ctx.arc(b.x + b.w - 13, b.y + 12, 10, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.x + b.w - 18, b.y + 12); ctx.lineTo(b.x + b.w - 14, b.y + 16);
      ctx.lineTo(b.x + b.w - 8, b.y + 7); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawRack() {
  ctx.fillStyle = texWood(P.woodDk, P.wood);
  ctx.beginPath(); rrPath(RACK.x, RACK.y, RACK.w, RACK.h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(20,12,6,.5)'; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(RACK.x, RACK.y, RACK.w, RACK.h, 14); ctx.stroke();
  const armed = S.cur && allFound(S.cur) && S.placed[S.cur] === undefined;
  for (let g = 0; g < 5; g++) {
    const b = drawerOf(g);
    const hot = S.hover && S.hover.k === 'drawer' && S.hover.g === g;
    const bad = S.wrongG === g && S.wrong > 0;
    ctx.save();
    if (bad) ctx.translate(Math.sin(S.t * 60) * S.wrong * 8, 0);
    ctx.fillStyle = texWood('#6a4f34', '#7d5f3f');
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
    const g2 = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
    g2.addColorStop(0, 'rgba(255,255,255,.16)');
    g2.addColorStop(1, 'rgba(0,0,0,.28)');
    ctx.fillStyle = g2;
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.fill();
    ctx.strokeStyle = bad ? P.bad : (armed ? (hot ? P.brassLt : P.brass) : 'rgba(20,12,6,.45)');
    ctx.lineWidth = armed || bad ? 3.6 : 2;
    if (armed && !bad) {
      ctx.save();
      ctx.shadowColor = 'rgba(232, 194, 116, .8)';
      ctx.shadowBlur = 12 + 8 * Math.sin(S.t * 3);
    }
    ctx.beginPath(); rrPath(b.x, b.y, b.w, b.h, 10); ctx.stroke();
    if (armed && !bad) ctx.restore();
    /* پلاکِ برنجی */
    ctx.fillStyle = P.brass;
    ctx.beginPath(); rrPath(b.x + 16, b.y + 8, b.w - 32, 30, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    ctx.fillRect(b.x + 20, b.y + 11, b.w - 40, 3);
    text(GROUPS[g], b.x + b.w / 2, b.y + 24, { size: 18, family: 'Lalezar', color: '#3a2a10' });
    /* درونِ کشو */
    ctx.save();
    ctx.beginPath(); rrPath(b.x + 12, b.y + 46, b.w - 24, b.h - 58, 8); ctx.clip();
    ctx.fillStyle = 'rgba(24, 14, 6, .5)';
    ctx.fillRect(b.x + 12, b.y + 46, b.w - 24, b.h - 58);
    const mem = inGroup(g);
    for (let i = 0; i < mem.length; i++) {
      miniAnimal(mem[i].id, b.x + 34 + i * 52, b.y + 46 + (b.h - 58) / 2, miniS(mem[i]) * .82);
    }
    ctx.restore();
    ctx.restore();
  }
}

/* ───────── میز ───────── */

function drawBench() {
  ctx.fillStyle = texWood('#563c26', '#6b4c31');
  ctx.beginPath(); rrPath(BENCH.x, BENCH.y, BENCH.w, BENCH.h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(20,12,6,.5)'; ctx.lineWidth = 3;
  ctx.beginPath(); rrPath(BENCH.x, BENCH.y, BENCH.w, BENCH.h, 16); ctx.stroke();

  const a = curA();
  if (S.play && a) {
    if (S.play.k === 'br') breathView(a, clamp(S.play.t / PLAY_T, 0, 1));
    else birthView(a, clamp(S.play.t / PLAY_T, 0, 1));
    /* نوارِ زمانِ مشاهده */
    const u = clamp(S.play.t / PLAY_T, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); rrPath(W.x + 20, W.y + W.h - 20, W.w - 40, 8, 4); ctx.fill();
    ctx.fillStyle = P.brassLt;
    ctx.beginPath(); rrPath(W.x + 20, W.y + W.h - 20, (W.w - 40) * u, 8, 4); ctx.fill();
  } else if (a) {
    winBack('air', S.t);
    const k = easeBack(clamp(S.enter / .5, 0, 1));
    ctx.save();
    ctx.translate(CX, AY + Math.sin(S.t * 1.6) * 4);
    ctx.scale(BS * k, BS * k);
    animalArt(a.id, S.t);
    ctx.restore();
    text(a.n, CX, W.y + W.h - 34, { size: 26, family: 'Lalezar', color: '#3f4d52' });
    if (S.tool === 'lens') drawLens(a);
  } else {
    winBack('air', S.t);
    ctx.save();
    ctx.setLineDash([12, 10]);
    ctx.strokeStyle = 'rgba(90, 70, 46, .45)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(CX, AY, 96, 0, TAU); ctx.stroke();
    ctx.restore();
    text('یکی از جانورهای قفسه را بزن', CX, AY, { size: 24, family: 'Lalezar', color: '#7a6a52' });
  }
  drawTools();
  drawEvidence();
}

function drawLens(a) {
  const R = 78, x = clamp(S.lens.x, W.x + 8, W.x + W.w - 8), y = clamp(S.lens.y, W.y + 8, W.y + W.h - 8);
  ctx.save();
  ctx.beginPath(); rrPath(W.x, W.y, W.w, W.h, 18); ctx.clip();
  ctx.fillStyle = 'rgba(20, 14, 6, .34)';
  ctx.beginPath();
  ctx.rect(W.x, W.y, W.w, W.h);
  ctx.arc(x, y, R, 0, TAU, true);
  ctx.fill();
  const over = Math.hypot((x - CX) / (a.box[0] * BS), (y - AY) / (a.box[1] * BS)) < 1;
  if (over) skinPatch(a, x, y, R, S.t);
  else {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.clip();
    ctx.translate(x, y); ctx.scale(2.2, 2.2); ctx.translate(-CX, -AY);
    ctx.translate(CX, AY); ctx.scale(BS, BS);
    animalArt(a.id, S.t);
    ctx.restore();
  }
  /* شیشه و قاب */
  const gl = ctx.createLinearGradient(x - R, y - R, x + R, y + R);
  gl.addColorStop(0, 'rgba(255,255,255,.28)');
  gl.addColorStop(.5, 'rgba(255,255,255,.03)');
  gl.addColorStop(1, 'rgba(255,255,255,.16)');
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.brass; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.stroke();
  ctx.strokeStyle = P.brassLt; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, R - 5, 0, TAU); ctx.stroke();
  ctx.strokeStyle = P.brass; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + R * .74, y + R * .74); ctx.lineTo(x + R * 1.5, y + R * 1.5); ctx.stroke();
  if (S.scan > 0) {
    ctx.strokeStyle = P.good; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, R + 10, -Math.PI / 2, -Math.PI / 2 + TAU * S.scan); ctx.stroke();
  }
  ctx.restore();
  if (!over) text('ذره‌بین را روی بدنش نگه دار', CX, W.y + 28, { size: 19, family: 'Lalezar', color: '#5d4a30' });
}

const TOOL_N = ['ذره‌بین', 'تماشای نفس', 'زادگاه'];
const EV_N = ['پوششِ بدن', 'نوعِ تنفّس', 'زادگاه'];

function drawTools() {
  const a = curA();
  for (let i = 0; i < 3; i++) {
    const b = toolOf(i);
    const has = a && fnd(a.id)[KEYS[i]];
    const on = i === 0 ? S.tool === 'lens' : (S.play && S.play.k === KEYS[i]);
    button(b, TOOL_N[i], {
      hot: S.hover && S.hover.k === 'tool' && S.hover.i === i,
      disabled: !a,
      fill: on ? '#2f6f7c' : (has ? '#6b8f57' : '#a5763a'),
      hotFill: on ? '#3f8c9c' : (has ? '#7ba465' : '#c08d47'),
      size: 22,
    });
    if (has) {
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.x + 18, b.y + 32); ctx.lineTo(b.x + 26, b.y + 40); ctx.lineTo(b.x + 40, b.y + 22);
      ctx.stroke();
    }
  }
}

function drawEvidence() {
  const a = curA();
  for (let i = 0; i < 3; i++) {
    const b = evOf(i);
    paper(b.x, b.y, b.w, b.h, P.paper, 60 + i, 12, .3);
    ctx.fillStyle = 'rgba(194, 145, 60, .22)';
    ctx.beginPath(); rrPath(b.x, b.y, b.w, 30, 8); ctx.fill();
    text(EV_N[i], b.x + b.w / 2, b.y + 16, { size: 17, family: 'Lalezar', color: P.ink });
    const has = a && fnd(a.id)[KEYS[i]];
    if (!has) {
      ctx.save();
      ctx.setLineDash([9, 8]);
      ctx.strokeStyle = 'rgba(140, 118, 84, .5)'; ctx.lineWidth = 3;
      ctx.beginPath(); rrPath(b.x + 20, b.y + 44, b.w - 40, b.h - 64, 12); ctx.stroke();
      ctx.restore();
      text('؟', b.x + b.w / 2, b.y + b.h / 2 + 12, { size: 44, family: 'Lalezar', color: 'rgba(140,118,84,.45)' });
      continue;
    }
    if (i === 0) skinPatch(a, b.x + b.w / 2, b.y + 92, 46, S.t);
    else if (i === 1) brIcon(a, b.x + b.w / 2, b.y + 92, a.br === 'both' ? .85 : 1.15);
    else biIcon(a, b.x + b.w / 2, b.y + 92, 1.05);
    const nm = i === 0 ? SKIN_N[a.skin] : i === 1 ? BREATH_N[a.br] : BIRTH_N[a.bi];
    text(nm, b.x + b.w / 2, b.y + b.h - 22, { size: 17, color: P.ink, maxWidth: b.w - 20 });
  }
}

/* ───────── دفترچه ───────── */

const COLS = [[860, 1060], [610, 860], [370, 610], [140, 370]];

function drawNotebook() {
  ctx.fillStyle = 'rgba(26, 18, 10, .72)';
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  const k = easeOut(clamp(S.phaseT, 0, 1));
  paper(130, 96, 940, 594, P.paper, 71, 18, .4);
  text('دفترچهٔ گروه‌ها', 600, 136, { size: 32, family: 'Lalezar', color: P.ink });
  const hy = 178, rh = 92;
  const HEAD = ['گروه', 'پوششِ بدن', 'نوعِ تنفّس', 'زادگاه'];
  ctx.strokeStyle = P.line; ctx.lineWidth = 2;
  for (let c = 0; c < 4; c++) {
    text(HEAD[c], (COLS[c][0] + COLS[c][1]) / 2, hy, { size: 19, family: 'Lalezar', color: P.inkSoft });
    if (c) { ctx.beginPath(); ctx.moveTo(COLS[c][1], hy + 20); ctx.lineTo(COLS[c][1], hy + 20 + rh * 5); ctx.stroke(); }
  }
  for (let g = 0; g <= 5; g++) {
    ctx.beginPath(); ctx.moveTo(140, hy + 20 + g * rh); ctx.lineTo(1060, hy + 20 + g * rh); ctx.stroke();
  }
  for (let g = 0; g < 5; g++) {
    const cy = hy + 20 + g * rh + rh / 2;
    const r = S.note[g];
    text(GROUPS[g], 1040, cy, { size: 21, family: 'Lalezar', color: P.ink, align: 'right' });
    if (r) {
      const a = byId(r.id);
      miniAnimal(a.id, 900, cy, miniS(a) * .72);
      skinPatch(a, 655, cy, 28, S.t);
      text(SKIN_N[r.skin], 845, cy, { size: 15, color: P.ink, align: 'right', maxWidth: 150 });
      brIcon(a, 412, cy, r.br === 'both' ? .62 : .8);
      text(BREATH_N[r.br], 598, cy, { size: 15, color: P.ink, align: 'right', maxWidth: 145 });
      biIcon(a, 188, cy, .62);
      text(BIRTH_N[r.bi], 356, cy, { size: 15, color: P.ink, align: 'right', maxWidth: 128 });
    } else {
      ctx.save();
      ctx.globalAlpha = .35;
      for (let c = 1; c < 4; c++) {
        ctx.strokeStyle = P.inkSoft; ctx.lineWidth = 3; ctx.lineCap = 'round';
        const mx = (COLS[c][0] + COLS[c][1]) / 2;
        ctx.beginPath(); ctx.moveTo(mx - 26, cy); ctx.lineTo(mx + 26, cy); ctx.stroke();
      }
      ctx.restore();
    }
  }
  text('برای بستن، هرجا را بزن', 600, 712, { size: 16, color: 'rgba(255, 244, 220, .8)' });
  if (k < 1) { /* فقط برای آرامیِ ورود */ }
}

/* ───────── سردر و پرده‌ها ───────── */

function drawHUD() {
  ctx.fillStyle = '#241a11';
  ctx.fillRect(0, 0, SCENE_W, HUD_H);
  ctx.fillStyle = 'rgba(194, 145, 60, .3)';
  ctx.fillRect(0, HUD_H - 2, SCENE_W, 2);
  text('پنج گروهِ مهره‌داران', SCENE_W - 150, HUD_H / 2, { size: 25, family: 'Lalezar', color: P.paper });
  const n = placedN();
  numText(fa(n) + ' / ' + fa(ANIMALS.length), 700, HUD_H / 2, { size: 20, color: P.brassLt });
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); rrPath(400, HUD_H - 10, 260, 6, 3); ctx.fill();
  ctx.fillStyle = P.brassLt;
  ctx.beginPath(); rrPath(400, HUD_H - 10, 260 * (n / ANIMALS.length), 6, 3); ctx.fill();
  button(BTN_NOTE, 'دفترچه', {
    hot: S.hover && S.hover.k === 'note', fill: '#7a5a2c', hotFill: '#96702f', size: 19, r: 10,
  });
}

function drawQuiz() {
  ctx.fillStyle = 'rgba(26, 18, 10, .78)';
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  paper(150, 120, 900, 570, P.paper, 81, 18, .4);
  text('حالا از روی دفترچه‌ات', 600, 176, { size: 30, family: 'Lalezar', color: P.ink });
  for (let q = 0; q < QS.length; q++) {
    text(QS[q].q, 600, 262 + q * 156, { size: 21, color: P.ink });
    for (let i = 0; i < QS[q].opts.length; i++) {
      const b = qOpt(q, i);
      const on = S.ans[q] === i;
      const ok = S.mark && S.markT > 0 && on ? S.mark[q] : null;
      button(b, QS[q].opts[i], {
        hot: S.hover && S.hover.k === 'opt' && S.hover.q === q && S.hover.i === i,
        fill: ok === true ? P.good : ok === false ? P.bad : (on ? '#3f7f8c' : '#b09a76'),
        hotFill: on ? '#4f96a4' : '#c2ac88', size: 20, r: 12,
      });
    }
  }
  button(BTN_CHECK, 'ببین درست است؟', {
    hot: S.hover && S.hover.k === 'check', fill: '#5e8f4e', hotFill: '#6ea75c', size: 24,
  });
}

function labIcon(x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = P.brass; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(-6, -6, 22, 0, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(160, 210, 226, .45)';
  ctx.beginPath(); ctx.arc(-6, -6, 22, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.brass; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(26, 26); ctx.stroke();
  ctx.restore();
}

function drawIntro() {
  overlay({
    t: S.phaseT, w: 900, h: 320, y: 128,
    paper: P.paper, band: P.brass, ink: P.ink, inkSoft: P.inkSoft,
    icon: labIcon,
    title: 'پنج گروهِ مهره‌داران',
    body: 'یازده جانور روی قفسه است و پنج کشوی خالی کنارِ میز.\nسه ابزار داری: ذره‌بین، تماشای نفس و زادگاه.\nهر جانور را وارسی کن و در کشویی بگذار که به نشانه‌هایش می‌خورد.',
    btn: BTN_GO, btnLabel: 'شروع', btnHot: S.hover === BTN_GO,
    btnFill: '#a5763a', btnHotFill: '#c08d47',
  });
}

function drawWon() {
  overlay({
    t: S.phaseT, w: 900, h: 320, y: 132,
    paper: P.paper, band: P.good, ink: P.ink, inkSoft: P.inkSoft,
    icon: labIcon,
    title: 'جدول کامل شد',
    body: 'پنج گروه، از روی سه نشانه شناخته شدند: پوششِ بدن، نوعِ تنفّس و زادگاه.\nپنگوئن با پَرَش پرنده بود، وال با شش و شیرش پستاندار،\nو خفاش با موی بدنش پستاندار — نه شکلِ ظاهر، که نشانه‌ها می‌گویند.',
    btn: BTN_AGAIN, btnLabel: 'از نو', btnHot: S.hover === BTN_AGAIN,
    btnFill: '#a5763a', btnHotFill: '#c08d47',
  });
}

function drawTutorial() {
  const st = S.tut.step;
  if (st === 0) {
    spot([{ x: SHELF.x + SHELF.w / 2, y: 400, r: 190 }], .68);
    const h = tutCard(330, 190, 540,
      ['یازده جانور روی قفسه است.', 'یکی را بزن تا روی میز بیاید.'], 'پنج گروهِ مهره‌داران');
    tutMore(600, 190 + h + 8, S.t, P.ink);
  } else if (st === 1) {
    spot([{ x: CX, y: 560, r: 240 }], .66);
    const h = tutCard(330, 150, 540,
      ['با این سه ابزار به بدنش نگاه کن:', 'پوششِ بدن، نفس کشیدن، و زادگاهش.']);
    tutMore(600, 150 + h + 8, S.t, P.ink);
  } else {
    spot([{ x: RACK.x + RACK.w / 2, y: 400, r: 200 }], .66);
    const h = tutCard(300, 190, 540,
      ['بعد در کشویی بگذارش که', 'به هر سه نشانه‌اش می‌خورد.']);
    tutMore(570, 190 + h + 8, S.t, P.ink);
  }
}

/* ───────── قاب ───────── */

function draw() {
  beginScene(P.woodDk);
  ctx.fillStyle = texWood('#33251a', '#43301f');
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  const vg = ctx.createRadialGradient(SCENE_W / 2, SCENE_H / 2, 120, SCENE_W / 2, SCENE_H / 2, 760);
  vg.addColorStop(0, 'rgba(255, 230, 180, .12)');
  vg.addColorStop(1, 'rgba(0, 0, 0, .34)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, SCENE_W, SCENE_H);

  ctx.save();
  if (S.shake > 0) ctx.translate(Math.sin(S.t * 55) * S.shake * 10, 0);
  drawShelf();
  drawBench();
  drawRack();
  if (S.fly) {
    const k = easeOut(clamp(S.fly.t / .75, 0, 1));
    ctx.save();
    ctx.globalAlpha = 1 - k * .3;
    miniAnimal(S.fly.id, lerp(S.fly.x0, S.fly.x1, k), lerp(S.fly.y0, S.fly.y1, k) - Math.sin(k * Math.PI) * 60,
      lerp(BS, .2, k));
    ctx.restore();
  }
  bits.draw();
  ctx.restore();

  if (S.phase === 'quiz') drawQuiz();
  drawHUD();
  if (S.noteOpen) drawNotebook();
  toast.draw(HUD_H + 8, { good: P.good, bad: P.bad, info: P.card, ink: P.ink });
  if (S.phase === 'lab' && S.tut.on) drawTutorial();
  if (S.phase === 'intro') drawIntro();
  if (S.phase === 'won') drawWon();
  if (S.tipT > 0 && !S.noteOpen) {
    ctx.save();
    ctx.globalAlpha = clamp(S.tipT, 0, 1);
    const w = 620;
    paper(CX - w / 2, SCENE_H - 42, w, 36, P.card, 91, 12, .3);
    text(S.tip, CX, SCENE_H - 24, { size: 16, color: P.ink });
    ctx.restore();
  }
  endScene(.12, 'rgba(20, 10, 4, .40)', .2, .12);
}

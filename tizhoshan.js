/*!
 * tizhoshan.js — بخشِ «تیزهوشان» برای سایتِ «ستاره‌های دانش»
 * موضوع: هوش و استعدادِ تصویری — فصلِ «تحلیل».
 *
 * ⚠️ محتوا ۱۰۰٪ اورجینال و برنامه‌ای است؛ هیچ متن/تصویری از هیچ کتابی کپی نشده.
 *    همه‌ی شکل‌ها با موتورِ SVGِ داخلی و به‌صورتِ تولیدشونده ساخته می‌شوند.
 *
 * مهارت‌ها (مبحث‌ها):
 *   ۱) انتخابِ تصویرِ متفاوت           ← کامل (۹ نوع سؤالِ تولیدشونده + درسنامه + تمرین + آزمون)
 *   ۲..۷) نوع۲/مناسب/مشابه/قاعده/دسته‌بندی ← اسکلت (به‌زودی، با همین موتور)
 *
 * توابعِ سراسری:
 *   window.renderTizHub()  — نقطه‌ی ورود؛ کلِ رابط را داخلِ #sec-tizhoshan رندر می‌کند.
 *
 * قلاب‌های اختیاریِ سایت (همه گارد شده): currentGrade, CUR, ROLE, toPersianNum,
 *   fbSaveResultAuto, qdMissionProgress.
 *
 * تضمینِ دقت: چرخش/آینه با ماتریسِ SVG اعمال می‌شود و شکل‌های «متفاوت» با یک
 *   تفاوتِ واحدِ آشکار ساخته می‌شوند ⇒ جواب قطعی و بی‌ابهام، و هیچ دو گزینه‌ی یکسان.
 *
 * قلابِ دیباگ: اگر window.__TZ_DEBUG===true باشد، window.__tz شاملِ موتور و مولدها می‌شود.
 */
(function () {
  'use strict';

  /* ====================================================================
   * ۰) قلاب‌ها و کمک‌ابزارها
   * ================================================================== */
  var PAL = {
    teal: '#2F9E93', tealD: '#247e75', tealL: '#e6f3f1',
    cream: '#F4F1E9', lilac: '#8B7BE0', lilacL: '#efecfb',
    ink: '#2b3040', inkSoft: '#5b6172',
    ok: '#2F9E93', bad: '#e06a5b', gold: '#e0a13c',
    line: '#2b3040', paper: '#ffffff'
  };

  function grade() { try { if (typeof window.currentGrade === 'function') return (window.currentGrade() | 0) || 5; } catch (e) {} return 5; }
  function role() { try { if (typeof window.ROLE === 'string') return window.ROLE; } catch (e) {} return 'student'; }
  function cur() { try { if (window.CUR && typeof window.CUR === 'object') return window.CUR; } catch (e) {} return null; }
  function toFa(n) {
    try { if (typeof window.toPersianNum === 'function') return window.toPersianNum(n); } catch (e) {}
    return String(n).replace(/[0-9]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; });
  }

  function saveBest(skill, score, isQuiz, wrongArr) {
    var c = cur(), key = 'tz_' + skill;
    if (c) {
      c.activities = c.activities || {};
      var prev = c.activities[key] || {};
      if (!prev.bestScore || score > prev.bestScore) prev.bestScore = score;
      c.activities[key] = prev;
      try { if (typeof window.fbSaveResultAuto === 'function') window.fbSaveResultAuto(c.username, key, score, !!isQuiz, wrongArr || []); } catch (e) {}
    }
    try { if (typeof window.qdMissionProgress === 'function') window.qdMissionProgress('tizhoshan', 1); } catch (e) {}
  }

  function h(tag, props) {
    var node = document.createElement(tag);
    if (props) for (var k in props) {
      if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
      var v = props[k]; if (v == null) continue;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') { for (var st in v) node.style[st] = v[st]; }
      else node.setAttribute(k, v);
    }
    for (var i = 2; i < arguments.length; i++) {
      var ch = arguments[i]; if (ch == null) continue;
      if (Array.isArray(ch)) ch.forEach(function (c) { if (c != null) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
      else node.appendChild(typeof ch === 'string' ? document.createTextNode(ch) : ch);
    }
    return node;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }

  function RNG(seed) { this.s = (seed >>> 0) || 1; }
  RNG.prototype.next = function () { var x = this.s; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; this.s = x >>> 0; return this.s / 4294967296; };
  RNG.prototype.int = function (a, b) { return a + Math.floor(this.next() * (b - a + 1)); };
  RNG.prototype.pick = function (a) { return a[this.int(0, a.length - 1)]; };
  RNG.prototype.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = this.int(0, i); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  RNG.prototype.sample = function (a, k) { return this.shuffle(a).slice(0, k); };

  /* ====================================================================
   * ۱) موتورِ SVG
   * ================================================================== */
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs) { var n = document.createElementNS(NS, tag); if (attrs) for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]); return n; }
  function add(g, tag, attrs) { var n = s(tag, attrs); g.appendChild(n); return n; }
  var DEF = { fill: 'none', stroke: PAL.line, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  function merge(a, b) { var o = {}; for (var k in a) o[k] = a[k]; if (b) for (var j in b) o[j] = b[j]; return o; }

  /** جعبه‌ی ۱۰۰×۱۰۰، مرکز (۵۰،۵۰). چرخش/آینه با ترنسفورمِ دقیق. */
  function figure(drawFn, opts) {
    opts = opts || {};
    var svg = s('svg', { viewBox: '0 0 100 100', class: 'tz-fig', width: opts.size || 90, height: opts.size || 90 });
    if (opts.frame !== false) svg.appendChild(s('rect', { x: 3, y: 3, width: 94, height: 94, rx: 7, fill: 'none', stroke: '#c9cfdd', 'stroke-width': 1.6 }));
    var g = s('g', {});
    var t = '';
    if (opts.mirror === 'v') t += ' translate(100 0) scale(-1 1)';
    else if (opts.mirror === 'h') t += ' translate(0 100) scale(1 -1)';
    if (opts.rot) t = 'rotate(' + opts.rot + ' 50 50)' + t;
    if (t) g.setAttribute('transform', t.trim());
    drawFn(g);
    svg.appendChild(g);
    return svg;
  }

  function polyPts(n, r, cx, cy, start) {
    cx = cx == null ? 50 : cx; cy = cy == null ? 50 : cy; r = r || 34; start = start == null ? -90 : start;
    var p = [];
    for (var i = 0; i < n; i++) { var a = (start + i * 360 / n) * Math.PI / 180; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return p;
  }
  function ptsStr(p) { return p.map(function (q) { return q[0].toFixed(2) + ',' + q[1].toFixed(2); }).join(' '); }

  var DASHES = { solid: null, dashed: '7 5', dotted: '0.5 6' };
  function styleFor(o) {
    o = o || {};
    var a = merge(DEF, {});
    if (o.sw) a['stroke-width'] = o.sw;
    if (o.fill === 'solid') { a.fill = PAL.line; }
    else if (o.fill && o.fill !== 'none') a.fill = o.fill;
    if (o.dash && DASHES[o.dash]) { a['stroke-dasharray'] = DASHES[o.dash]; if (o.dash === 'dotted') a['stroke-linecap'] = 'round'; }
    return a;
  }
  function drawPoly(g, n, o) { o = o || {}; return add(g, 'polygon', merge(styleFor(o), { points: ptsStr(polyPts(n, o.r, o.cx, o.cy, o.start)) })); }
  function drawCircle(g, o) { o = o || {}; return add(g, 'circle', merge(styleFor(o), { cx: o.cx || 50, cy: o.cy || 50, r: o.r || 30 })); }
  function drawDot(g, x, y, r) { return add(g, 'circle', { cx: x, cy: y, r: r || 3.4, fill: PAL.line }); }
  function dotRing(g, count, R, start) { polyPts(count, R, 50, 50, start).forEach(function (p) { drawDot(g, p[0], p[1]); }); }

  var _clip = 0;
  function hatchInto(g, buildShape, angle, spacing, sw) {
    spacing = spacing || 7; sw = sw || 1.6;
    var id = 'tzclip' + (++_clip);
    var cp = s('clipPath', { id: id }); buildShape(cp); g.appendChild(cp);
    var lines = s('g', { 'clip-path': 'url(#' + id + ')', transform: 'rotate(' + (angle || 0) + ' 50 50)' });
    for (var x = -60; x <= 160; x += spacing) lines.appendChild(s('line', { x1: x, y1: -60, x2: x, y2: 160, stroke: PAL.line, 'stroke-width': sw }));
    g.appendChild(lines);
    buildShape(g, true);
  }

  function arrowInto(g, angle, head) {
    var gg = s('g', { transform: 'rotate(' + angle + ' 50 50)' });
    gg.appendChild(s('line', merge(DEF, { x1: 26, y1: 50, x2: 68, y2: 50 })));
    if (head === 'solid') gg.appendChild(s('polygon', { points: '74,50 60,43 60,57', fill: PAL.line }));
    else { gg.appendChild(s('line', merge(DEF, { x1: 74, y1: 50, x2: 61, y2: 43 }))); gg.appendChild(s('line', merge(DEF, { x1: 74, y1: 50, x2: 61, y2: 57 }))); }
    g.appendChild(gg);
  }

  function smallShape(g, kind, cx, cy, r) {
    var o = merge(DEF, { 'stroke-width': 2.4 });
    if (kind === 'circle') add(g, 'circle', merge(o, { cx: cx, cy: cy, r: r }));
    else if (kind === 'square') add(g, 'rect', merge(o, { x: cx - r, y: cy - r, width: 2 * r, height: 2 * r }));
    else if (kind === 'triangle') add(g, 'polygon', merge(o, { points: ptsStr(polyPts(3, r * 1.15, cx, cy, -90)) }));
    else if (kind === 'diamond') add(g, 'polygon', merge(o, { points: ptsStr(polyPts(4, r * 1.15, cx, cy, -90)) }));
  }

  /* ====================================================================
   * ۲) موتیف‌های chiral (دست‌دار) — آینه‌شان با هیچ چرخشی روی اصل نمی‌افتد
   *    (به‌صورتِ pixel در تستِ داخلی هم راستی‌آزمایی می‌شود.)
   * ================================================================== */
  function mFlag(g) { add(g, 'path', merge(DEF, { d: 'M28 26 H72 V60 L54 74 H28 Z' })); drawDot(g, 40, 40, 4); }
  function mEll(g) { add(g, 'path', merge(DEF, { d: 'M34 26 V70 H68 V58 H50 V26 Z' })); drawDot(g, 60, 64, 3.4); }
  function mHook(g) { add(g, 'path', merge(DEF, { d: 'M32 68 C32 40 68 40 68 62' })); add(g, 'path', merge(DEF, { d: 'M68 62 l-8 -3 M68 62 l-3 8' })); drawDot(g, 32, 68, 3.6); }
  function mTri(g) { add(g, 'polygon', merge(DEF, { points: '30,72 72,72 30,30' })); drawDot(g, 41, 62, 3.4); }
  function mBoot(g) { add(g, 'path', merge(DEF, { d: 'M38 24 H56 V58 H72 V72 H38 Z' })); drawDot(g, 47, 34, 3.2); }
  function mZig(g) { add(g, 'path', merge(DEF, { d: 'M28 30 H62 L44 50 H70 L48 74' })); drawDot(g, 62, 30, 3.2); }
  var MOTIFS = [mFlag, mEll, mHook, mTri, mBoot, mZig];
  // موتیف‌های «حرف‌نما» — دست‌داریِ بسیار خوانا (مثلِ حرف در آینه). بدونِ تقارنِ چرخشی.
  function glF(g) { add(g, 'path', merge(DEF, { 'stroke-width': 6, d: 'M40 26 V74 M40 26 H64 M40 50 H60' })); }
  function glL(g) { add(g, 'path', merge(DEF, { 'stroke-width': 6, d: 'M42 26 V74 H68' })); }
  function glP(g) { add(g, 'path', merge(DEF, { 'stroke-width': 6, d: 'M40 74 V26 H58 A12 12 0 0 1 58 50 H40' })); }
  function glR(g) { add(g, 'path', merge(DEF, { 'stroke-width': 6, d: 'M40 74 V26 H57 A12 12 0 0 1 57 50 H40 M50 50 L66 74' })); }
  function glJ(g) { add(g, 'path', merge(DEF, { 'stroke-width': 6, d: 'M62 26 V60 A13 13 0 0 1 36 60' })); }
  function glG(g) { add(g, 'path', merge(DEF, { 'stroke-width': 6, d: 'M66 40 A22 22 0 1 0 68 62 H54 V52' })); }
  var GLYPHS = [glF, glL, glP, glR, glJ, glG];

  /* ====================================================================
   * ۳) مولدهای سؤالِ «تصویرِ متفاوت» (۹ نوع، همه بی‌ابهام)
   *    هر مولد برمی‌گرداند: {prompt, why, tag, options:[...], answer, render(opt)}
   * ================================================================== */
  function placeAnswer(rng, opts, oddOpt, n) {
    n = n || 4; var idx = rng.int(0, n - 1); var arr = []; var j = 0;
    for (var i = 0; i < n; i++) arr.push(i === idx ? oddOpt : opts[j++]);
    return { options: arr, answer: idx };
  }

  // ۱) دوران/آینه (دست‌دار) — همیشه گام‌های ۹۰° و موتیف‌های خوش‌سیلوئت (قابلِ ردیابی)
  function oddChirality(rng, level) {
    var motif = rng.pick([mFlag, mEll, mBoot, mZig, mHook]);
    var angles = rng.shuffle([0, 90, 180, 270]);
    var mir = rng.next() < 0.5 ? 'v' : 'h';
    var same = [{ rot: angles[0] }, { rot: angles[1] }, { rot: angles[2] }];
    var odd = { rot: angles[3], mirror: mir };
    var pa = placeAnswer(rng, same, odd);
    return {
      prompt: 'کدام شکل با بقیه فرق دارد؟', tag: 'دوران و آینه',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(motif, { rot: o.rot, mirror: o.mirror || null, size: 96 }); },
      why: 'سه شکل فقط چرخیده‌اند و روی هم می‌افتند؛ اما این یکی «آینه» شده و با هیچ چرخشی مثلِ بقیه نمی‌شود (شکلِ دست‌دار).'
    };
  }

  // ۲) شمارشِ نقطه‌ها (کلِ شکل با زاویه‌ی نامتقارن می‌چرخد تا هیچ دو گزینه‌ای یکسان نشود)
  function oddDots(rng, level) {
    var n = rng.pick([5, 6]);
    var k = rng.int(3, level >= 2 ? 5 : 4);
    var oddK = rng.next() < 0.5 ? k + 1 : Math.max(2, k - 1);
    var rots = rng.shuffle([0, 15, 30, 45]); // مضربِ تقارنِ ۵/۶/۷‌ضلعی نیستند ⇒ چندضلعی همیشه متمایز
    var same = [{ c: k, rot: rots[0] }, { c: k, rot: rots[1] }, { c: k, rot: rots[2] }];
    var pa = placeAnswer(rng, same, { c: oddK, rot: rots[3] });
    return {
      prompt: 'کدام شکل با بقیه فرق دارد؟', tag: 'شمارش',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(function (g) { drawPoly(g, n, { r: 33, start: -90 }); dotRing(g, o.c, 15, -72); }, { rot: o.rot, size: 96 }); },
      why: 'همه ' + toFa(k) + ' نقطه‌ی داخلی دارند، اما این یکی ' + toFa(oddK) + ' نقطه دارد. شمردنی‌ها سرنخِ خوبی‌اند.'
    };
  }

  // ۳) شمارشِ ضلع‌ها
  function oddSides(rng, level) {
    var n = rng.pick([5, 6, 7]);
    var oddN = rng.next() < 0.5 ? n + 1 : n - 1;
    var starts = rng.sample([-90, -60, -30, 0, 30], 4);
    function draw(sides, st) { return function (g) { drawPoly(g, sides, { r: 34, start: st }); var p = polyPts(sides, 34, 50, 50, st); drawDot(g, p[0][0], p[0][1], 3.6); }; }
    var same = [{ sides: n, s: starts[0] }, { sides: n, s: starts[1] }, { sides: n, s: starts[2] }];
    var pa = placeAnswer(rng, same, { sides: oddN, s: starts[3] });
    return {
      prompt: 'کدام شکل با بقیه فرق دارد؟', tag: 'شمارشِ ضلع',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(draw(o.sides, o.s), { size: 96 }); },
      why: 'سه شکل ' + toFa(n) + '‌ضلعی‌اند، اما این یکی ' + toFa(oddN) + '‌ضلعی است. نقطه‌ی گوشه کمکت می‌کند بشماری.'
    };
  }

  // ۴) پُری/توخالی
  function oddFill(rng, level) {
    var shapes = rng.sample([3, 4, 5, 6], 4);
    var filledFirst = rng.next() < 0.5; // آیا اکثریت توپُرند یا توخالی
    var starts = [-90, -60, -30, 0];
    var same = [];
    for (var i = 0; i < 3; i++) same.push({ n: shapes[i], s: starts[i], fill: filledFirst ? 'solid' : 'none' });
    var odd = { n: shapes[3], s: starts[3], fill: filledFirst ? 'none' : 'solid' };
    var pa = placeAnswer(rng, same, odd);
    return {
      prompt: 'کدام شکل با بقیه فرق دارد؟', tag: 'پُری',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(function (g) { drawPoly(g, o.n, { r: 33, start: o.s, fill: o.fill }); }, { size: 96 }); },
      why: filledFirst ? 'سه شکل توپُر (پُررنگ) هستند، اما این یکی فقط خطِ دور دارد و توخالی است.' : 'سه شکل توخالی‌اند، اما این یکی توپُر است.'
    };
  }

  // ۵) جنسِ خط (توپر/خط‌چین/نقطه‌چین)
  function oddLineStyle(rng, level) {
    var styles = ['solid', 'dashed', 'dotted'];
    var base = rng.pick(styles);
    var oddS = rng.pick(styles.filter(function (x) { return x !== base; }));
    var shapes = rng.sample([3, 4, 5, 6], 4);
    var starts = [-90, -60, -30, 0];
    var name = { solid: 'خطِ صاف و پیوسته', dashed: 'خط‌چین', dotted: 'نقطه‌چین' };
    var same = [];
    for (var i = 0; i < 3; i++) same.push({ n: shapes[i], s: starts[i], dash: base });
    var pa = placeAnswer(rng, same, { n: shapes[3], s: starts[3], dash: oddS });
    return {
      prompt: 'کدام شکل با بقیه فرق دارد؟', tag: 'جنسِ خط',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(function (g) { drawPoly(g, o.n, { r: 33, start: o.s, dash: o.dash, sw: o.dash === 'dotted' ? 3.4 : 3 }); }, { size: 96 }); },
      why: 'سه شکل با ' + name[base] + ' رسم شده‌اند، اما خطِ این یکی ' + name[oddS] + ' است.'
    };
  }

  // ۶) نوکِ فلش (توپر/توخالی)
  function oddArrow(rng, level) {
    var dirs = rng.sample([0, 45, 90, 135, 180, 225, 270, 315], 4);
    var solidMost = rng.next() < 0.5;
    var same = [];
    for (var i = 0; i < 3; i++) same.push({ a: dirs[i], head: solidMost ? 'solid' : 'open' });
    var pa = placeAnswer(rng, same, { a: dirs[3], head: solidMost ? 'open' : 'solid' });
    return {
      prompt: 'کدام فلش با بقیه فرق دارد؟', tag: 'فلش',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(function (g) { arrowInto(g, o.a, o.head); }, { size: 96 }); },
      why: solidMost ? 'نوکِ سه فلش توپُر است، اما نوکِ این یکی توخالی (باز) است. جهتِ فلش‌ها فرق دارد ولی مهم نیست.' : 'نوکِ سه فلش توخالی است، اما نوکِ این یکی توپُر است.'
    };
  }

  // ۷) شکلِ داخلی متفاوت
  function oddInner(rng, level) {
    var outers = rng.sample([3, 4, 5, 6], 4);
    var innerKinds = ['circle', 'square', 'triangle', 'diamond'];
    var base = rng.pick(innerKinds);
    var oddK = rng.pick(innerKinds.filter(function (x) { return x !== base; }));
    var name = { circle: 'دایره', square: 'مربع', triangle: 'مثلث', diamond: 'لوزی' };
    var starts = [-90, -60, -30, 0];
    var same = [];
    for (var i = 0; i < 3; i++) same.push({ n: outers[i], s: starts[i], inner: base });
    var pa = placeAnswer(rng, same, { n: outers[3], s: starts[3], inner: oddK });
    return {
      prompt: 'کدام شکل با بقیه فرق دارد؟', tag: 'شکلِ داخلی',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(function (g) { drawPoly(g, o.n, { r: 36, start: o.s }); smallShape(g, o.inner, 50, 50, 11); }, { size: 96 }); },
      why: 'شکلِ بیرونی مهم نیست؛ داخلِ سه شکل یک ' + name[base] + ' هست، اما داخلِ این یکی ' + name[oddK] + ' است.'
    };
  }

  // ۸) اندازه‌ی شکلِ داخلی (شکل‌های بیرونیِ متفاوت تا تکرار نشود؛ فقط اندازه‌ی داخلی سرنخ است)
  function oddSize(rng, level) {
    var outers = rng.sample([3, 4, 5, 6], 4);
    var inner = rng.pick(['circle', 'square']);
    var starts = [-90, -60, -30, 0];
    var small = 9, big = 18;
    var same = [];
    for (var i = 0; i < 3; i++) same.push({ n: outers[i], s: starts[i], r: small });
    var pa = placeAnswer(rng, same, { n: outers[3], s: starts[3], r: big });
    return {
      prompt: 'کدام شکل با بقیه فرق دارد؟', tag: 'اندازه',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(function (g) { drawPoly(g, o.n, { r: 36, start: o.s }); smallShape(g, inner, 50, 50, o.r); }, { size: 96 }); },
      why: 'شکلِ بیرونی مهم نیست؛ در سه شکل جزءِ داخلی کوچک است، اما در این یکی جزءِ داخلی بزرگ‌تر است.'
    };
  }

  // ۹) تراکمِ هاشور
  function oddHatch(rng, level) {
    var rots = rng.shuffle([0, 90, 180, 270]);
    var dense = 6, sparse = 13;
    var same = [{ rot: rots[0], sp: dense }, { rot: rots[1], sp: dense }, { rot: rots[2], sp: dense }];
    var pa = placeAnswer(rng, same, { rot: rots[3], sp: sparse });
    function draw(sp) { return function (g) { function shp(t, k) { var p = '30,72 72,72 30,28'; if (k) add(t, 'polygon', merge(DEF, { points: p })); else add(t, 'polygon', { points: p }); } hatchInto(g, shp, 0, sp, 1.8); }; }
    return {
      prompt: 'کدام شکل با بقیه فرق دارد؟', tag: 'هاشور',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(draw(o.sp), { rot: o.rot, size: 96 }); },
      why: 'سه مثلث فقط چرخیده‌اند و هاشورِ متراکم (نزدیک‌به‌هم) دارند؛ اما هاشورِ این یکی بازتر و کم‌تراکم‌تر است.'
    };
  }

  // ۱۰) شمارشِ خط (دسته‌خطوطِ موازی)
  function oddLineCount(rng, level) {
    var k = rng.int(3, level >= 2 ? 5 : 4);
    var oddK = rng.next() < 0.5 ? k + 1 : Math.max(2, k - 1);
    var rots = rng.sample([0, 25, 50, 75, 110, 140], 4);
    function draw(count) { return function (g) { var w = (count - 1) * 8; for (var i = 0; i < count; i++) { var x = 50 - w / 2 + i * 8; add(g, 'line', merge(DEF, { x1: x, y1: 28, x2: x, y2: 72 })); } }; }
    var same = [{ c: k, rot: rots[0] }, { c: k, rot: rots[1] }, { c: k, rot: rots[2] }];
    var pa = placeAnswer(rng, same, { c: oddK, rot: rots[3] });
    return {
      prompt: 'کدام شکل با بقیه فرق دارد؟', tag: 'شمارشِ خط',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(draw(o.c), { rot: o.rot, size: 96 }); },
      why: 'همه ' + toFa(k) + ' خط دارند، اما این یکی ' + toFa(oddK) + ' خط دارد.'
    };
  }

  /* ---- صحنه‌ی ترکیبی (سطحِ آزمونِ حرفه‌ای) ---- */
  function drawRay(g, angle, r1, r2, head) {
    var a = angle * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux;
    var x1 = 50 + r1 * ux, y1 = 50 + r1 * uy, x2 = 50 + r2 * ux, y2 = 50 + r2 * uy;
    add(g, 'line', merge(DEF, { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1) }));
    var bx = x2 - 9 * ux, by = y2 - 9 * uy;
    var p1 = [(bx + 5 * px).toFixed(1), (by + 5 * py).toFixed(1)], p2 = [(bx - 5 * px).toFixed(1), (by - 5 * py).toFixed(1)];
    if (head === 'solid') add(g, 'polygon', { points: x2.toFixed(1) + ',' + y2.toFixed(1) + ' ' + p1.join(',') + ' ' + p2.join(','), fill: PAL.line });
    else { add(g, 'line', merge(DEF, { x1: x2.toFixed(1), y1: y2.toFixed(1), x2: p1[0], y2: p1[1] })); add(g, 'line', merge(DEF, { x1: x2.toFixed(1), y1: y2.toFixed(1), x2: p2[0], y2: p2[1] })); }
  }
  function makeScene(rng, level) {
    return { n: rng.pick([4, 5, 6]), theta: 23 * rng.int(1, 7), inner: rng.pick(['triangle', 'square', 'circle', 'diamond']), head: rng.next() < 0.5 ? 'solid' : 'open', dot: level >= 3 };
  }
  function drawScene(spec) {
    return function (g) {
      drawPoly(g, spec.n, { r: 31, start: -90 });
      drawRay(g, spec.theta, 6, 42, spec.head);
      var ia = (spec.theta + 90) * Math.PI / 180;
      smallShape(g, spec.inner, 50 + 15 * Math.cos(ia), 50 + 15 * Math.sin(ia), 8);
      if (spec.dot) { var da = (spec.theta - 90) * Math.PI / 180; drawDot(g, 50 + 15 * Math.cos(da), 50 + 15 * Math.sin(da), 3.2); }
    };
  }
  var KIND_FA = { triangle: 'مثلث', square: 'مربع', circle: 'دایره', diamond: 'لوزی' };

  // A) صحنه: ۳ چرخش + ۱ قرینه (آینه) — حرفه‌ای
  function sceneChirality(rng, level) {
    var spec = makeScene(rng, level);
    var angles = rng.shuffle([0, 90, 180, 270]);
    var mir = rng.next() < 0.5 ? 'v' : 'h';
    var same = [{ rot: angles[0] }, { rot: angles[1] }, { rot: angles[2] }];
    var pa = placeAnswer(rng, same, { rot: angles[3], mirror: mir });
    return {
      prompt: 'کدام تصویر با بقیه فرق دارد؟', tag: 'دوران و آینه (ترکیبی)',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(drawScene(spec), { rot: o.rot, mirror: o.mirror || null, size: 96 }); },
      why: 'سه تصویر فقط چرخیده‌اند و کاملاً روی هم می‌افتند؛ اما این یکی «آینه (قرینه)» شده — جهتِ فلش نسبت به جای شکلِ داخلی برعکس شده و با هیچ چرخشی مثلِ بقیه نمی‌شود.'
    };
  }
  // B) صحنه: جزءِ داخلی متفاوت (بین چرخش‌ها)
  function sceneInnerSwap(rng, level) {
    var spec = makeScene(rng, level);
    var oddKind = rng.pick(['triangle', 'square', 'circle', 'diamond'].filter(function (k) { return k !== spec.inner; }));
    var oddSpec = merge(spec, { inner: oddKind });
    var angles = rng.shuffle([0, 90, 180, 270]);
    var same = [{ rot: angles[0], sp: spec }, { rot: angles[1], sp: spec }, { rot: angles[2], sp: spec }];
    var pa = placeAnswer(rng, same, { rot: angles[3], sp: oddSpec });
    return {
      prompt: 'کدام تصویر با بقیه فرق دارد؟', tag: 'جزءِ متفاوت (ترکیبی)',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(drawScene(o.sp), { rot: o.rot, size: 96 }); },
      why: 'تصویرها فقط چرخیده‌اند و همه یک ' + KIND_FA[spec.inner] + 'ِ کوچک دارند؛ اما جزءِ داخلیِ این یکی ' + KIND_FA[oddKind] + ' است.'
    };
  }
  // C) صحنه: نوکِ فلش متفاوت (بین چرخش‌ها)
  function sceneArrowHead(rng, level) {
    var spec = makeScene(rng, level);
    var oddHead = spec.head === 'solid' ? 'open' : 'solid';
    var oddSpec = merge(spec, { head: oddHead });
    var angles = rng.shuffle([0, 90, 180, 270]);
    var same = [{ rot: angles[0], sp: spec }, { rot: angles[1], sp: spec }, { rot: angles[2], sp: spec }];
    var pa = placeAnswer(rng, same, { rot: angles[3], sp: oddSpec });
    return {
      prompt: 'کدام تصویر با بقیه فرق دارد؟', tag: 'نوکِ فلش (ترکیبی)',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(drawScene(o.sp), { rot: o.rot, size: 96 }); },
      why: 'همه چرخیده‌اند و نوکِ فلششان ' + (spec.head === 'solid' ? 'توپُر' : 'توخالی') + ' است؛ اما نوکِ فلشِ این یکی ' + (oddHead === 'solid' ? 'توپُر' : 'توخالی') + ' است.'
    };
  }

  // ۱۱) حرف‌نما: ۳ چرخش + ۱ آینه (دست‌داریِ بسیار خوانا)
  function oddGlyph(rng, level) {
    var gl = rng.pick(GLYPHS);
    var angles = rng.shuffle([0, 90, 180, 270]);
    var mir = rng.next() < 0.5 ? 'v' : 'h';
    var same = [{ rot: angles[0] }, { rot: angles[1] }, { rot: angles[2] }];
    var pa = placeAnswer(rng, same, { rot: angles[3], mirror: mir });
    return {
      prompt: 'کدام شکل با بقیه فرق دارد؟', tag: 'دوران و آینه (حرف‌نما)',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(gl, { rot: o.rot, mirror: o.mirror || null, size: 96 }); },
      why: 'سه شکل فقط چرخیده‌اند؛ اما این یکی «آینه (برعکس)» شده — مثلِ حرفی که در آینه وارونه می‌شود و با هیچ چرخشی صاف نمی‌شود.'
    };
  }

  // ۱۲) تاس: شمارشِ خال‌ها روی صفحه‌ی مربعی
  function oddDice(rng, level) {
    var cells = []; for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) cells.push([36 + c * 14, 36 + r * 14]);
    var k = rng.int(3, level >= 2 ? 6 : 5);
    var oddK = rng.next() < 0.5 ? k + 1 : Math.max(2, k - 1);
    function draw(count, seed2) {
      var rr = new RNG(seed2);
      var pick = rr.sample(cells, count);
      return function (g) {
        add(g, 'rect', merge(DEF, { x: 26, y: 26, width: 48, height: 48, rx: 6 }));
        pick.forEach(function (p) { drawDot(g, p[0], p[1], 3.6); });
      };
    }
    var seeds = rng.sample([11, 23, 37, 51, 67, 83], 4);
    var same = [{ c: k, s: seeds[0] }, { c: k, s: seeds[1] }, { c: k, s: seeds[2] }];
    var pa = placeAnswer(rng, same, { c: oddK, s: seeds[3] });
    return {
      prompt: 'کدام تاس با بقیه فرق دارد؟', tag: 'شمارشِ خال',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(draw(o.c, o.s), { size: 96 }); },
      why: 'همه ' + toFa(k) + ' خال دارند، اما این یکی ' + toFa(oddK) + ' خال دارد. جای خال‌ها مهم نیست، تعدادشان مهم است.'
    };
  }

  // ۱۳) تودرتو: چند شکلِ هم‌مرکز؛ جزءِ درونی متفاوت
  function oddNested(rng, level) {
    var outers = rng.sample([3, 4, 5, 6], 4);
    var kinds = ['triangle', 'square', 'circle', 'diamond'];
    var base = rng.pick(kinds);
    var odd = rng.pick(kinds.filter(function (k) { return k !== base; }));
    var starts = [-90, -60, -30, 0];
    var same = [];
    for (var i = 0; i < 3; i++) same.push({ n: outers[i], s: starts[i], inner: base });
    var pa = placeAnswer(rng, same, { n: outers[3], s: starts[3], inner: odd });
    return {
      prompt: 'کدام شکل با بقیه فرق دارد؟', tag: 'تودرتو',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(function (g) { drawPoly(g, o.n, { r: 40, start: o.s }); drawCircle(g, { r: 24 }); smallShape(g, o.inner, 50, 50, 9); }, { size: 96 }); },
      why: 'شکلِ بیرونی و حلقه‌ی میانی مهم نیستند؛ در سه شکل هسته‌ی درونی ' + KIND_FA[base] + ' است، اما در این یکی ' + KIND_FA[odd] + '.'
    };
  }

  // ۱۴) فلشِ پَردار: شمارشِ پرها
  function oddBeadArrow(rng, level) {
    var k = rng.int(3, 5);
    var oddK = rng.next() < 0.5 ? k + 1 : k - 1;
    var dirs = rng.sample([0, 45, 90, 135, 180, 225, 270, 315], 4);
    function draw(count) {
      return function (g) {
        add(g, 'line', merge(DEF, { x1: 24, y1: 50, x2: 66, y2: 50 }));
        add(g, 'polygon', { points: '74,50 62,44 62,56', fill: PAL.line });
        var step = 26 / (count + 1);
        for (var i = 1; i <= count; i++) { var x = 28 + i * step; add(g, 'line', merge(DEF, { x1: x, y1: 44, x2: x, y2: 56, 'stroke-width': 2.4 })); }
      };
    }
    var same = [{ c: k, d: dirs[0] }, { c: k, d: dirs[1] }, { c: k, d: dirs[2] }];
    var pa = placeAnswer(rng, same, { c: oddK, d: dirs[3] });
    return {
      prompt: 'کدام فلش با بقیه فرق دارد؟', tag: 'شمارشِ پَر',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(draw(o.c), { rot: o.d, size: 96 }); },
      why: 'جهتِ فلش‌ها مهم نیست؛ همه ' + toFa(k) + ' پَر دارند، اما این یکی ' + toFa(oddK) + ' پَر دارد.'
    };
  }

  // ۱۵) تقارن: کدام شکل خطِ تقارن ندارد (منتظم در برابرِ نامنتظم)
  function oddSymmetry(rng, level) {
    var regs = rng.sample([4, 5, 6, 7, 8], 3);
    var starts = [-90, -66, -42];
    var irrPts = (function () {
      var p = []; var pull = rng.int(0, 4);
      for (var i = 0; i < 5; i++) { var ang = (-90 + i * 72 + rng.int(-16, 16)) * Math.PI / 180; var rad = 24 + (i === pull ? 12 : rng.int(-5, 5)); p.push([50 + rad * Math.cos(ang), 50 + rad * Math.sin(ang)]); }
      return ptsStr(p);
    })();
    var same = [{ kind: 'reg', n: regs[0], s: starts[0] }, { kind: 'reg', n: regs[1], s: starts[1] }, { kind: 'reg', n: regs[2], s: starts[2] }];
    var pa = placeAnswer(rng, same, { kind: 'irr' });
    return {
      prompt: 'کدام شکل خطِ تقارن ندارد؟', tag: 'تقارن',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(function (g) { if (o.kind === 'reg') drawPoly(g, o.n, { r: 34, start: o.s }); else add(g, 'polygon', merge(DEF, { points: irrPts })); }, { size: 96 }); },
      why: 'سه شکل منتظم‌اند و خطِ تقارن دارند (می‌شود تا زد و دو نیمه روی هم می‌افتند)؛ اما این یکی نامنتظم است و هیچ خطِ تقارنی ندارد.'
    };
  }

  // شکل با شکافِ واضح در وسطِ یک ضلع (برای «باز») یا کاملاً بسته
  function drawMaybeOpen(g, n, r, start, open) {
    var p = polyPts(n, r, 50, 50, start);
    if (!open) { add(g, 'polygon', merge(DEF, { points: ptsStr(p) })); return; }
    var a = p[0], b = p[1];
    var g1 = [a[0] + (b[0] - a[0]) * 0.32, a[1] + (b[1] - a[1]) * 0.32];
    var g2 = [a[0] + (b[0] - a[0]) * 0.68, a[1] + (b[1] - a[1]) * 0.68];
    var d = 'M' + g1[0].toFixed(1) + ' ' + g1[1].toFixed(1) + ' L' + a[0].toFixed(1) + ' ' + a[1].toFixed(1);
    for (var i = n - 1; i >= 1; i--) d += ' L' + p[i][0].toFixed(1) + ' ' + p[i][1].toFixed(1);
    d += ' L' + g2[0].toFixed(1) + ' ' + g2[1].toFixed(1);
    add(g, 'path', merge(DEF, { d: d }));
  }

  // ۱۶) باز/بسته: کدام شکل «باز» است (شکافِ واضح دارد)
  function oddOpenClosed(rng, level) {
    var shapes = rng.sample([3, 4, 5, 6], 4);
    var starts = [-90, -60, -30, 0];
    var openMost = rng.next() < 0.5;
    var same = [];
    for (var i = 0; i < 3; i++) same.push({ n: shapes[i], s: starts[i], open: openMost });
    var pa = placeAnswer(rng, same, { n: shapes[3], s: starts[3], open: !openMost });
    return {
      prompt: openMost ? 'کدام شکل «بسته» است؟' : 'کدام شکل «باز» است؟', tag: 'باز و بسته',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(function (g) { drawMaybeOpen(g, o.n, 34, o.s, o.open); }, { size: 96 }); },
      why: openMost ? 'سه شکل باز‌اند و یک شکاف دارند؛ اما این یکی کاملاً بسته است.' : 'سه شکل بسته‌اند و دورشان کامل است؛ اما این یکی «باز» است و یک شکاف دارد.'
    };
  }

  // ۱۷) رابطه‌ای (خلاقانه): فلش به‌سمتِ نقطه یا خلافِ آن
  function oddRelation(rng, level) {
    var n = rng.pick([4, 5, 6]);
    var phi = 23 * rng.int(1, 7);
    var rots = rng.sample([0, 40, 80, 130, 170, 220, 260], 4);
    function draw(toward) {
      return function (g) {
        drawPoly(g, n, { r: 34, start: -90 });
        var da = phi * Math.PI / 180; drawDot(g, 50 + 27 * Math.cos(da), 50 + 27 * Math.sin(da), 5);
        drawRay(g, toward ? phi : phi + 180, 2, 21, 'solid');
      };
    }
    var same = [{ t: true, rot: rots[0] }, { t: true, rot: rots[1] }, { t: true, rot: rots[2] }];
    var pa = placeAnswer(rng, same, { t: false, rot: rots[3] });
    return {
      prompt: 'کدام تصویر با بقیه فرق دارد؟', tag: 'رابطه‌ی فلش و نقطه',
      options: pa.options, answer: pa.answer,
      render: function (o) { return figure(draw(o.t), { rot: o.rot, size: 96 }); },
      why: 'در سه تصویر، فلش دقیقاً به‌سمتِ نقطه اشاره می‌کند؛ اما در این یکی فلش خلافِ جهتِ نقطه (به بیرون) است. جهتِ کلیِ تصویر مهم نیست، رابطه‌ی فلش و نقطه مهم است.'
    };
  }

  var GENS_EASY = [oddChirality, oddDots, oddFill, oddLineStyle, oddArrow, oddSides, oddLineCount, oddDice, oddSymmetry, oddOpenClosed];
  var GENS_MED = [oddChirality, oddGlyph, oddDots, oddSides, oddInner, oddArrow, oddHatch, oddSize, oddLineCount, oddNested, oddBeadArrow, oddSymmetry, oddOpenClosed, oddRelation, sceneArrowHead, sceneInnerSwap];
  var GENS_HARD = [sceneChirality, sceneChirality, sceneInnerSwap, sceneArrowHead, oddGlyph, oddChirality, oddInner, oddNested, oddSize, oddHatch, oddBeadArrow, oddRelation];
  function poolFor(level) { return level >= 3 ? GENS_HARD : level === 2 ? GENS_MED : GENS_EASY; }
  function genQuestion(rng, level) { return rng.pick(poolFor(level))(rng, level || 1); }

  /* ====================================================================
   * ۴) درسنامه‌ی کاملِ مبحث ۱ — متنِ اورجینال، آموزشِ ۵ سرنخ + تکنیک‌ها
   * ================================================================== */
  function artRow(makers) { var w = h('div', { class: 'tz-artrow' }); makers.forEach(function (m) { w.appendChild(m()); }); return w; }

  function lessonM1() {
    var seed = (Date.now() & 0xffff) | 1;
    function ex(gen, level) { return function () { return buildInteractive(toInter(gen(new RNG(seed++), level || 1))); }; }
    return [
      { title: 'کارآگاهِ شکل‌ها شو! 🔎',
        body: 'سه‌تا شکل کنارِ هم می‌بینی که انگار مثلِ هم‌اند… اما یکی‌شان یواشکی فرق دارد. رازِ کارآگاهی این است: اول ببین سه‌تای دیگر چه چیزِ مشترکی دارند؛ همان که در جمعشان نمی‌گنجد، جوابِ توست. در این درس پنج «سرنخ» یاد می‌گیری تا هیچ تفاوتی از چشمت پنهان نماند.',
        art: function () { return figure(mFlag, { size: 118, frame: false }); } },

      { title: 'سرنخِ ۱ — شمردنی‌ها ✋',
        body: 'اولین کار همیشه شمردن است: تعدادِ ضلع‌ها، گوشه‌ها، نقطه‌ها، یا اجزای داخلِ شکل. اگر سه شکل یک عدد بدهند و یکی عددِ دیگر، همان «متفاوت» است. با دقت بشمار؛ گاهی فقط یک نقطه یا یک ضلع فرق دارد!',
        art: artFn([5, 5, 5, 6], function (n) { return figure(function (g) { drawPoly(g, n, { r: 30 }); }, { size: 72 }); }) },
      { title: 'تمرینِ سرنخِ ۱ ✏️', interactive: ex(oddDots, 1) },

      { title: 'سرنخِ ۲ — جنسِ خط و هاشور ✍️',
        body: 'به خودِ خط‌ها نگاه کن: صاف و پیوسته؟ خط‌چین؟ نقطه‌چین؟ کلفت یا نازک؟ و اگر شکل هاشور (خط‌های موازیِ داخل) دارد، به جهت و تراکمِ هاشور دقت کن. گاهی همه‌ی شکل‌ها یکی‌اند و فقط «جنسِ خط» یا «تراکمِ هاشور» یکی‌شان فرق دارد.',
        art: artRow([function () { return figure(function (g) { drawPoly(g, 4, { r: 30, dash: 'solid' }); }, { size: 72 }); },
          function () { return figure(function (g) { drawPoly(g, 4, { r: 30, dash: 'dashed' }); }, { size: 72 }); },
          function () { return figure(function (g) { drawPoly(g, 4, { r: 30, dash: 'dotted', sw: 3.4 }); }, { size: 72 }); }]) },
      { title: 'تمرینِ سرنخِ ۲ ✏️', interactive: ex(oddLineStyle, 1) },

      { title: 'سرنخِ ۳ — فلش‌ها و جهت‌ها ➡️',
        body: 'فلش‌ها پر از سرنخ‌اند: جهتشان به کدام سو است؟ نوکشان توپُر است یا توخالی؟ از کجا شروع شده‌اند؟ وقتی شکل‌ها فلش دارند، اول جهت، بعد شکلِ نوک، و بعد بدنه‌ی فلش را مقایسه کن.',
        art: artRow([function () { return figure(function (g) { arrowInto(g, 0, 'solid'); }, { size: 72 }); },
          function () { return figure(function (g) { arrowInto(g, 90, 'solid'); }, { size: 72 }); },
          function () { return figure(function (g) { arrowInto(g, 180, 'open'); }, { size: 72 }); }]) },
      { title: 'تمرینِ سرنخِ ۳ ✏️', interactive: ex(oddArrow, 1) },

      { title: 'سرنخِ ۴ — اجزای داخلی و اندازه 🎯',
        body: 'شکلِ بیرونی همیشه مهم نیست! گاهی همه‌ی شکل‌های بیرونی فرق دارند تا حواست پرت شود، ولی سرنخِ اصلی داخلِ آن‌هاست: یک دایره‌ی کوچک، یک مربع، یا اندازه‌ای که با بقیه فرق می‌کند. همیشه به «داخل» هم سر بزن.',
        art: artRow([function () { return figure(function (g) { drawPoly(g, 5, { r: 34 }); smallShape(g, 'circle', 50, 50, 10); }, { size: 72 }); },
          function () { return figure(function (g) { drawPoly(g, 4, { r: 34 }); smallShape(g, 'circle', 50, 50, 10); }, { size: 72 }); },
          function () { return figure(function (g) { drawPoly(g, 6, { r: 34 }); smallShape(g, 'square', 50, 50, 10); }, { size: 72 }); }]) },
      { title: 'تمرینِ سرنخِ ۴ ✏️', interactive: ex(oddInner, 2) },

      { title: 'سرنخِ ۵ — دوران و آینه 🪞',
        body: 'مهم‌ترین و حرفه‌ای‌ترین سرنخ! گاهی شکل‌ها فقط «چرخیده‌اند» و روی هم می‌افتند. اما اگر یکی «آینه» شده باشد، دیگر با هیچ چرخشی مثلِ بقیه نمی‌شود — مثلِ دستِ چپ و راست که هرچه بچرخانی روی هم نمی‌افتند. به این‌ها می‌گوییم شکلِ دست‌دار. برای تشخیص، یک جزءِ نامتقارن (مثلِ یک نقطه یا یک بریدگی) را دنبال کن و ببین سمتش عوض شده یا نه.',
        art: artRow([function () { return figure(mEll, { rot: 0, size: 72 }); },
          function () { return figure(mEll, { rot: 120, size: 72 }); },
          function () { return figure(mEll, { rot: 240, size: 72 }); },
          function () { return figure(mEll, { mirror: 'v', size: 72 }); }]) },
      { title: 'تمرینِ سرنخِ ۵ ✏️', interactive: ex(oddChirality, 1) },

      { title: 'تکنیکِ کارآگاهی 🕵️',
        body: 'دو تکنیکِ طلایی: (۱) «سه‌تای مشترک را پیدا کن»: به‌جای گشتن دنبالِ تفاوت، ببین کدام ویژگی در سه گزینه مشترک است؛ آن یکیِ ناهماهنگ جواب است. (۲) «حذفِ گزینه»: هر گزینه‌ای که مطمئنی مثلِ بقیه است را کنار بگذار تا فقط جواب بماند. و یادت باشد ترتیبِ بررسی: اول بشمار، بعد خط و هاشور، بعد فلش، بعد داخل، و آخر دوران و آینه.',
        art: function () { return figure(mHook, { size: 110, frame: false }); } },

      { title: 'آماده‌ای! 🌟',
        body: 'حالا پنج سرنخ و دو تکنیک را بلدی. در بخشِ «تمرین» می‌توانی بی‌نهایت سؤالِ تازه با سه سطحِ سختی حل کنی، و در «آزمون» خودت را محک بزنی. برویم!',
        art: function () { return figure(mBoot, { size: 104, frame: false }); } }
    ];
    function artFn(list, maker) { return function () { var w = h('div', { class: 'tz-artrow' }); list.forEach(function (n) { w.appendChild(maker(n)); }); return w; }; }
  }

  function toInter(q) { return { prompt: q.prompt, why: q.why, answer: q.answer, build: function () { return q.options.map(function (o) { return q.render(o); }); } }; }

  /* ====================================================================
   * ۵) داده‌ی مبحث‌ها
   * ================================================================== */
  var MABAHETH = [
    { id: 'motafavet1', n: 1, title: 'تصویرِ متفاوت', sub: 'یکی با بقیه فرق دارد', icon: '🔍', color: PAL.teal, ready: true, lesson: lessonM1, gen: genQuestion },
    { id: 'motafavet2', n: 2, title: 'تصویرِ متفاوت (نوع ۲)', sub: '۵ گزینه‌ای', icon: '🧩', color: PAL.lilac, ready: false },
    { id: 'monaseb', n: 3, title: 'تصویرِ مناسب', sub: 'کدام مناسب است؟', icon: '🎯', color: PAL.gold, ready: false },
    { id: 'moshabeh1', n: 4, title: 'ویژگیِ مشابه (نوع ۱)', sub: 'شبیه‌ترین گزینه', icon: '🔗', color: PAL.teal, ready: false },
    { id: 'moshabeh2', n: 5, title: 'ویژگیِ مشابه (نوع ۲)', sub: '۵ گزینه‌ای', icon: '🪞', color: PAL.lilac, ready: false },
    { id: 'ejraye_qaede', n: 6, title: 'اجرای قاعده', sub: 'قاعده را ادامه بده', icon: '⚙️', color: PAL.gold, ready: false },
    { id: 'dastebandi', n: 7, title: 'دسته‌بندیِ شکل‌ها', sub: 'گروه‌بندیِ درست', icon: '🗂️', color: PAL.teal, ready: false }
  ];

  /* ====================================================================
   * ۶) رابطِ کاربری
   * ================================================================== */
  var ROOT = null;
  function mountRoot() { ROOT = document.getElementById('sec-tizhoshan'); if (!ROOT) return null; ROOT.classList.add('tz-root'); ROOT.setAttribute('dir', 'rtl'); return ROOT; }
  function backBtn(fn, label) { return h('button', { class: 'tz-back', onclick: fn }, '→ ' + (label || 'بازگشت')); }

  function renderHub() {
    if (!ROOT) return; clear(ROOT);
    ROOT.appendChild(h('div', { class: 'tz-hero' },
      h('div', { class: 'tz-hero-badge' }, '✦ تیزهوشان'),
      h('h1', { class: 'tz-hero-title' }, 'هوش و استعدادِ تصویری'),
      h('p', { class: 'tz-hero-sub' }, 'فصلِ تحلیل — پایه‌ی ' + toFa(grade()) + ' — با هم کارآگاهِ شکل‌ها می‌شویم!')));
    var grid = h('div', { class: 'tz-grid' });
    MABAHETH.forEach(function (m) {
      grid.appendChild(h('button', { class: 'tz-card' + (m.ready ? '' : ' tz-card-soon'), style: { '--tz-c': m.color }, onclick: function () { if (m.ready) openMabhath(m); } },
        h('span', { class: 'tz-card-ic' }, m.icon),
        h('span', { class: 'tz-card-n' }, 'مبحثِ ' + toFa(m.n)),
        h('span', { class: 'tz-card-t' }, m.title),
        h('span', { class: 'tz-card-s' }, m.sub),
        m.ready ? null : h('span', { class: 'tz-soon' }, 'به‌زودی')));
    });
    ROOT.appendChild(grid);
  }

  function openMabhath(m) {
    clear(ROOT);
    ROOT.appendChild(backBtn(renderHub, 'مبحث‌ها'));
    ROOT.appendChild(h('h2', { class: 'tz-h2' }, m.icon + ' مبحثِ ' + toFa(m.n) + ' — ' + m.title));
    var tabs = h('div', { class: 'tz-tabs' });
    var stage = h('div', { class: 'tz-stage' });
    var TABS = [
      { label: '📖 درسنامه', fn: function () { runLesson(m, stage); } },
      { label: '🎨 تمرین', fn: function () { runPractice(m, stage); } },
      { label: '🏁 آزمون', fn: function () { runQuizIntro(m, stage); } }
    ];
    TABS.forEach(function (t, i) {
      var b = h('button', { class: 'tz-tab', onclick: function () { Array.prototype.forEach.call(tabs.children, function (c) { c.classList.remove('on'); }); b.classList.add('on'); t.fn(); } }, t.label);
      if (i === 0) b.classList.add('on'); tabs.appendChild(b);
    });
    ROOT.appendChild(tabs); ROOT.appendChild(stage);
    runLesson(m, stage);
  }

  /* ---- درسنامه ---- */
  function runLesson(m, stage) {
    clear(stage);
    var pages = m.lesson ? m.lesson() : []; var idx = 0;
    var card = h('div', { class: 'tz-lesson' }); var dots = h('div', { class: 'tz-dots' });
    stage.appendChild(card); stage.appendChild(dots);
    function draw() {
      clear(card); clear(dots);
      var p = pages[idx];
      card.appendChild(h('h3', { class: 'tz-lt' }, p.title));
      if (p.interactive) card.appendChild(p.interactive());
      else { if (p.art) { var a = h('div', { class: 'tz-lart' }); a.appendChild(typeof p.art === 'function' ? p.art() : p.art); card.appendChild(a); } card.appendChild(h('p', { class: 'tz-lb' }, p.body)); }
      pages.forEach(function (_, i) { dots.appendChild(h('span', { class: 'tz-dot' + (i === idx ? ' on' : '') })); });
      card.appendChild(h('div', { class: 'tz-lnav' },
        idx > 0 ? h('button', { class: 'tz-btn ghost', onclick: function () { idx--; draw(); } }, 'قبلی') : h('span'),
        h('span', { class: 'tz-lpage' }, toFa(idx + 1) + ' / ' + toFa(pages.length)),
        idx < pages.length - 1 ? h('button', { class: 'tz-btn', onclick: function () { idx++; draw(); } }, 'بعدی ←')
          : h('button', { class: 'tz-btn', onclick: function () { runPractice(m, stage); } }, 'برویم تمرین! 🎨')));
    }
    draw();
  }

  function buildInteractive(q) {
    var wrap = h('div', { class: 'tz-inter' });
    wrap.appendChild(h('p', { class: 'tz-qprompt' }, q.prompt));
    var opts = h('div', { class: 'tz-opts' }); var figs = q.build(); var done = false;
    figs.forEach(function (fig, i) {
      var b = h('button', { class: 'tz-opt', onclick: function () {
        if (done) return; done = true;
        var ok = i === q.answer; b.classList.add(ok ? 'ok' : 'bad'); opts.children[q.answer].classList.add('ok');
        wrap.appendChild(h('div', { class: 'tz-fb ' + (ok ? 'ok' : 'bad') }, (ok ? '✓ آفرین! ' : '✗ نه، دقت کن: ') + q.why));
      } }, fig, h('span', { class: 'tz-opt-n' }, toFa(i + 1)));
      opts.appendChild(b);
    });
    wrap.appendChild(opts);
    return wrap;
  }

  /* ---- تمرین (نامحدود، با انتخابِ سختی) ---- */
  function runPractice(m, stage) {
    clear(stage);
    var level = 1, solved = 0, seed = (Date.now() & 0xffffff) | 1;
    var head = h('div', { class: 'tz-practicehead' });
    var levels = [{ n: 1, t: 'آسان' }, { n: 2, t: 'متوسط' }, { n: 3, t: 'سخت' }];
    var pills = h('div', { class: 'tz-pills' });
    levels.forEach(function (L) {
      var p = h('button', { class: 'tz-pill' + (L.n === level ? ' on' : ''), onclick: function () { level = L.n; Array.prototype.forEach.call(pills.children, function (c) { c.classList.remove('on'); }); p.classList.add('on'); next(); } }, L.t);
      pills.appendChild(p);
    });
    var counter = h('span', { class: 'tz-solved' });
    head.appendChild(h('span', { class: 'tz-lbl' }, 'سختی:')); head.appendChild(pills); head.appendChild(counter);
    var box = h('div', {});
    stage.appendChild(head); stage.appendChild(box);
    var bag = [];
    function nextGen() { if (!bag.length) bag = new RNG(seed++).shuffle(poolFor(level)); return bag.pop(); }
    function next() {
      counter.textContent = 'حل‌شده: ' + toFa(solved);
      clear(box);
      var q = nextGen()(new RNG(seed++), level);
      box.appendChild(h('div', { class: 'tz-tagline' }, 'سرنخ: ' + q.tag));
      box.appendChild(h('p', { class: 'tz-qprompt' }, q.prompt));
      var opts = h('div', { class: 'tz-opts' }); var done = false;
      q.options.forEach(function (o, i) {
        var b = h('button', { class: 'tz-opt', onclick: function () {
          if (done) return; done = true;
          var ok = i === q.answer; b.classList.add(ok ? 'ok' : 'bad'); opts.children[q.answer].classList.add('ok');
          if (ok) solved++; counter.textContent = 'حل‌شده: ' + toFa(solved);
          box.appendChild(h('div', { class: 'tz-fb ' + (ok ? 'ok' : 'bad') }, (ok ? '✓ درست! ' : '✗ اشتباه — ') + q.why));
          box.appendChild(h('div', { class: 'tz-lnav' }, h('span'), h('button', { class: 'tz-btn', onclick: next }, 'سؤالِ تازه ←')));
        } }, q.render(o), h('span', { class: 'tz-opt-n' }, toFa(i + 1)));
        opts.appendChild(b);
      });
      box.appendChild(opts);
    }
    next();
  }

  /* ---- آزمون ---- */
  function runQuizIntro(m, stage) {
    clear(stage);
    var box = h('div', { class: 'tz-report' },
      h('h3', { class: 'tz-lt' }, 'آزمونِ ' + m.title + ' 🏁'),
      h('p', { class: 'tz-lb' }, 'در آزمون، سؤال‌ها از آسان به سخت جلو می‌روند. هر سؤال بازخوردِ آموزنده دارد و در پایان کارنامه‌ات را می‌بینی. چند سؤال حل کنیم؟'));
    var row = h('div', { class: 'tz-pills' });
    [10, 15, 20].forEach(function (nn) { row.appendChild(h('button', { class: 'tz-btn', onclick: function () { runQuiz(m, stage, nn); } }, toFa(nn) + ' سؤال')); });
    box.appendChild(row); stage.appendChild(box);
  }

  function runQuiz(m, stage, total) {
    clear(stage);
    total = total || 15;
    var rng = new RNG((Date.now() & 0xffffff) ^ (m.n * 2654435761));
    var qs = []; for (var i = 0; i < total; i++) { var lv = i < total / 3 ? 1 : i < 2 * total / 3 ? 2 : 3; qs.push(m.gen(rng, lv)); }
    var idx = 0, correct = 0, wrong = [];
    var bar = h('div', { class: 'tz-barwrap' }, h('div', { class: 'tz-bar' }));
    var box = h('div', {}); stage.appendChild(bar); stage.appendChild(box);
    function draw() {
      bar.firstChild.style.width = (idx / total * 100) + '%';
      clear(box);
      if (idx >= total) return finish();
      var q = qs[idx];
      box.appendChild(h('div', { class: 'tz-qcount' }, 'سؤالِ ' + toFa(idx + 1) + ' از ' + toFa(total) + ' — امتیاز: ' + toFa(correct)));
      box.appendChild(h('p', { class: 'tz-qprompt' }, q.prompt));
      var opts = h('div', { class: 'tz-opts' }); var done = false;
      q.options.forEach(function (o, i) {
        var b = h('button', { class: 'tz-opt', onclick: function () {
          if (done) return; done = true;
          var ok = i === q.answer; b.classList.add(ok ? 'ok' : 'bad'); opts.children[q.answer].classList.add('ok');
          if (ok) correct++; else wrong.push(idx + 1);
          box.appendChild(h('div', { class: 'tz-fb ' + (ok ? 'ok' : 'bad') }, (ok ? '✓ درست! ' : '✗ اشتباه — ') + q.why));
          box.appendChild(h('div', { class: 'tz-lnav' }, h('span'), h('button', { class: 'tz-btn', onclick: function () { idx++; draw(); } }, idx < total - 1 ? 'سؤالِ بعد ←' : 'دیدنِ کارنامه')));
        } }, q.render(o), h('span', { class: 'tz-opt-n' }, toFa(i + 1)));
        opts.appendChild(b);
      });
      box.appendChild(opts);
    }
    function finish() {
      bar.firstChild.style.width = '100%'; clear(box);
      var pct = Math.round(correct / total * 100);
      saveBest(m.id, pct, true, wrong);
      var msg = pct >= 80 ? 'عالی بود! کارآگاهِ حرفه‌ای شدی 🌟' : pct >= 50 ? 'خوب بود، با کمی تمرین عالی می‌شوی 💪' : 'اشکال ندارد، دوباره تمرین کن؛ حتماً بهتر می‌شوی 🌱';
      box.appendChild(h('div', { class: 'tz-report' },
        h('div', { class: 'tz-score' }, toFa(correct) + ' / ' + toFa(total)),
        h('div', { class: 'tz-pct' }, '٪' + toFa(pct)),
        h('p', { class: 'tz-msg' }, msg),
        wrong.length ? h('p', { class: 'tz-wrong' }, 'سؤال‌های اشتباه: ' + wrong.map(toFa).join('، ')) : null,
        h('div', { class: 'tz-lnav' },
          h('button', { class: 'tz-btn ghost', onclick: function () { runPractice(m, stage); } }, 'رفتن به تمرین'),
          h('button', { class: 'tz-btn', onclick: function () { runQuizIntro(m, stage); } }, 'آزمونِ تازه 🔁'))));
    }
    draw();
  }

  /* ====================================================================
   * ۷) استایل‌ها
   * ================================================================== */
  function injectStyles() {
    if (document.getElementById('tz-styles')) return;
    var css = [
      '.tz-root{font-family:Vazirmatn,Vazir,Tahoma,sans-serif;color:' + PAL.ink + ';background:' + PAL.cream + ';padding:18px;border-radius:20px;max-width:940px;margin:0 auto;line-height:1.9}',
      '.tz-root *{box-sizing:border-box}',
      '.tz-hero{background:linear-gradient(135deg,' + PAL.teal + ',' + PAL.tealD + ');color:#fff;border-radius:18px;padding:22px;text-align:center;box-shadow:0 10px 26px rgba(47,158,147,.28)}',
      '.tz-hero-badge{display:inline-block;background:rgba(255,255,255,.2);padding:4px 14px;border-radius:999px;font-size:.85rem;margin-bottom:8px}',
      '.tz-hero-title{margin:6px 0;font-size:1.5rem}.tz-hero-sub{margin:0;opacity:.92;font-size:.95rem}',
      '.tz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin-top:18px}',
      '.tz-card{cursor:pointer;border:none;text-align:center;background:' + PAL.paper + ';border-radius:16px;padding:16px 10px;display:flex;flex-direction:column;align-items:center;gap:3px;box-shadow:0 4px 14px rgba(43,48,64,.08);border-top:4px solid var(--tz-c);transition:transform .15s,box-shadow .15s;font-family:inherit}',
      '.tz-card:hover{transform:translateY(-3px);box-shadow:0 10px 22px rgba(43,48,64,.14)}',
      '.tz-card-soon{opacity:.6;cursor:default}.tz-card-ic{font-size:1.9rem}',
      '.tz-card-n{font-size:.78rem;color:var(--tz-c);font-weight:700}.tz-card-t{font-weight:700;font-size:1rem;color:' + PAL.ink + '}',
      '.tz-card-s{font-size:.8rem;color:' + PAL.inkSoft + '}',
      '.tz-soon{margin-top:6px;font-size:.72rem;background:' + PAL.lilacL + ';color:' + PAL.lilac + ';padding:2px 10px;border-radius:999px}',
      '.tz-back{background:none;border:none;color:' + PAL.tealD + ';font-family:inherit;font-size:.95rem;cursor:pointer;padding:6px 2px;font-weight:700}',
      '.tz-h2{margin:6px 0 12px;font-size:1.25rem}',
      '.tz-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}',
      '.tz-tab{flex:1;min-width:110px;cursor:pointer;border:2px solid #e3e0d6;background:' + PAL.paper + ';border-radius:12px;padding:10px;font-family:inherit;font-size:.92rem;color:' + PAL.inkSoft + ';transition:.15s}',
      '.tz-tab.on{background:' + PAL.teal + ';color:#fff;border-color:' + PAL.teal + '}',
      '.tz-stage{background:' + PAL.paper + ';border-radius:16px;padding:18px;box-shadow:0 4px 14px rgba(43,48,64,.06)}',
      '.tz-lesson{text-align:center}.tz-lt{margin:0 0 10px;font-size:1.2rem;color:' + PAL.tealD + '}',
      '.tz-lb{font-size:1rem;color:' + PAL.ink + ';text-align:justify;background:' + PAL.tealL + ';padding:14px;border-radius:12px}',
      '.tz-lart{margin:8px 0}.tz-artrow{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}',
      '.tz-fig{background:#fff;border-radius:10px}',
      '.tz-dots{display:flex;gap:6px;justify-content:center;margin:12px 0;flex-wrap:wrap}',
      '.tz-dot{width:9px;height:9px;border-radius:50%;background:#d8d4c8}.tz-dot.on{background:' + PAL.teal + ';width:22px;border-radius:6px}',
      '.tz-lnav{display:flex;justify-content:space-between;align-items:center;margin-top:16px;gap:10px}',
      '.tz-lpage{font-size:.82rem;color:' + PAL.inkSoft + '}',
      '.tz-btn{cursor:pointer;border:none;background:' + PAL.teal + ';color:#fff;font-family:inherit;font-size:.98rem;padding:11px 20px;border-radius:12px;font-weight:700;box-shadow:0 4px 12px rgba(47,158,147,.28)}',
      '.tz-btn.ghost{background:#eee9dd;color:' + PAL.inkSoft + ';box-shadow:none}',
      '.tz-qprompt{font-size:1.05rem;font-weight:700;text-align:center;margin:6px 0 14px}',
      '.tz-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(94px,1fr));gap:12px;justify-items:center}',
      '.tz-opt{position:relative;cursor:pointer;border:3px solid #e3e0d6;background:#fff;border-radius:14px;padding:8px;font-family:inherit;transition:.12s;display:flex;flex-direction:column;align-items:center}',
      '.tz-opt:hover{border-color:' + PAL.lilac + '}.tz-opt.ok{border-color:' + PAL.ok + ';box-shadow:0 0 0 3px ' + PAL.tealL + '}.tz-opt.bad{border-color:' + PAL.bad + '}',
      '.tz-opt-n{margin-top:4px;font-size:.85rem;color:' + PAL.inkSoft + ';font-weight:700}',
      '.tz-fb{margin-top:14px;padding:12px 14px;border-radius:12px;font-size:.95rem;text-align:justify}',
      '.tz-fb.ok{background:' + PAL.tealL + ';color:' + PAL.tealD + '}.tz-fb.bad{background:#fbeae7;color:' + PAL.bad + '}',
      '.tz-qcount{font-size:.85rem;color:' + PAL.inkSoft + ';text-align:center;margin-bottom:8px}',
      '.tz-tagline{font-size:.8rem;color:' + PAL.lilac + ';text-align:center;font-weight:700;margin-bottom:6px}',
      '.tz-barwrap{height:10px;background:#e9e4d7;border-radius:999px;overflow:hidden;margin-bottom:14px}',
      '.tz-bar{height:100%;width:0;background:linear-gradient(90deg,' + PAL.teal + ',' + PAL.lilac + ');transition:width .3s}',
      '.tz-report{text-align:center}.tz-score{font-size:2rem;font-weight:800;color:' + PAL.teal + '}',
      '.tz-pct{font-size:1.1rem;color:' + PAL.lilac + ';font-weight:700}.tz-msg{font-size:1.05rem;margin:8px 0}.tz-wrong{font-size:.9rem;color:' + PAL.inkSoft + '}',
      '.tz-practicehead{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}',
      '.tz-lbl{font-size:.9rem;color:' + PAL.inkSoft + ';font-weight:700}',
      '.tz-pills{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}',
      '.tz-pill{cursor:pointer;border:2px solid #e3e0d6;background:#fff;border-radius:999px;padding:6px 16px;font-family:inherit;font-size:.9rem;color:' + PAL.inkSoft + '}',
      '.tz-pill.on{background:' + PAL.lilac + ';color:#fff;border-color:' + PAL.lilac + '}',
      '.tz-solved{margin-inline-start:auto;font-size:.85rem;color:' + PAL.tealD + ';font-weight:700}',
      '@media(max-width:480px){.tz-root{padding:12px}.tz-hero-title{font-size:1.25rem}.tz-tab{min-width:46%}}'
    ].join('\n');
    var st = document.createElement('style'); st.id = 'tz-styles'; st.textContent = css; document.head.appendChild(st);
  }

  /* ====================================================================
   * ۸) نقطه‌ی ورود
   * ================================================================== */
  function renderTizHub() {
    injectStyles();
    if (!mountRoot()) { console.warn('[tizhoshan] #sec-tizhoshan یافت نشد.'); return; }
    renderHub();
  }
  window.renderTizHub = renderTizHub;

  if (window.__TZ_DEBUG === true) {
    window.__tz = { figure: figure, RNG: RNG, injectStyles: injectStyles, MOTIFS: MOTIFS, genQuestion: genQuestion,
      GLYPHS: GLYPHS,
      gens: { oddChirality: oddChirality, oddDots: oddDots, oddSides: oddSides, oddFill: oddFill, oddLineStyle: oddLineStyle, oddArrow: oddArrow, oddInner: oddInner, oddSize: oddSize, oddHatch: oddHatch, oddLineCount: oddLineCount, oddGlyph: oddGlyph, oddDice: oddDice, oddNested: oddNested, oddBeadArrow: oddBeadArrow, oddSymmetry: oddSymmetry, oddOpenClosed: oddOpenClosed, oddRelation: oddRelation, sceneChirality: sceneChirality, sceneInnerSwap: sceneInnerSwap, sceneArrowHead: sceneArrowHead } };
  }
})();

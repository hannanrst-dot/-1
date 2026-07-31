/*!
 * tizhoshan.js — بخشِ «تیزهوشان» برای سایتِ «ستاره‌های دانش»
 * منبع: کتابِ «هوش کمپلکسِ ششم» (مهروماه) — بخش ۱: هوش و استعداد تصویری، فصل ۱: تحلیل.
 * محتوا کاملاً اورجینال بازنویسی شده (بدونِ کپیِ متن کتاب).
 *
 * مهارت‌ها (مبحث‌های فصلِ تحلیل):
 *   ۱) انتخابِ تصویرِ متفاوت (نوع ۱)   ← پیاده‌سازی‌شده
 *   ۲) انتخابِ تصویرِ متفاوت (نوع ۲)   ← اسکلت (به‌زودی)
 *   ۳) انتخابِ تصویرِ مناسب            ← اسکلت (به‌زودی)
 *   ۴) ویژگیِ مشابه (نوع ۱)           ← اسکلت (به‌زودی)
 *   ۵) ویژگیِ مشابه (نوع ۲)           ← اسکلت (به‌زودی)
 *   ۶) اجرای قاعده در شکل‌ها           ← اسکلت (به‌زودی)
 *   ۷) دسته‌بندیِ شکل‌ها               ← اسکلت (به‌زودی)
 *
 * توابعِ سراسری:
 *   window.renderTizHub()  — نقطه‌ی ورود؛ کلِ رابط را داخلِ #sec-tizhoshan رندر می‌کند.
 *
 * قلاب‌های اختیاریِ سایت (همه گارد شده‌اند): currentGrade, CUR, ROLE,
 *   toPersianNum, fbSaveResultAuto, qdMissionProgress.
 *
 * وابستگی: ندارد. فقط وانیلا JS + SVGِ اینلاین. استایل‌ها با <style id="tz-styles"> تزریق می‌شوند.
 *
 * موتورِ شکل: هر شکل از یک «اسپکِ» دقیق ساخته می‌شود و چرخش/آینه با ماتریسِ SVG
 *   اعمال می‌شود؛ پس گزینه‌ها بی‌خطا و جوابِ «متفاوت» ریاضیاتی قطعی است.
 */
(function () {
  'use strict';

  /* ======================================================================
   * ۰) قلاب‌های سایت (گارد‌شده) و کمک‌ابزارها
   * ==================================================================== */
  var PAL = {
    teal: '#2F9E93', tealD: '#247e75', tealL: '#e6f3f1',
    cream: '#F4F1E9', lilac: '#8B7BE0', lilacL: '#efecfb',
    ink: '#2b3040', inkSoft: '#5b6172',
    ok: '#2F9E93', bad: '#e06a5b', gold: '#e0a13c',
    line: '#2b3040', paper: '#ffffff'
  };

  function grade() {
    try { if (typeof window.currentGrade === 'function') return window.currentGrade() | 0 || 5; } catch (e) {}
    return 5;
  }
  function role() {
    try { if (typeof window.ROLE === 'string') return window.ROLE; } catch (e) {}
    return 'student';
  }
  function cur() {
    try { if (window.CUR && typeof window.CUR === 'object') return window.CUR; } catch (e) {}
    return null;
  }
  function toFa(n) {
    try { if (typeof window.toPersianNum === 'function') return window.toPersianNum(n); } catch (e) {}
    return String(n).replace(/[0-9]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; });
  }

  /** ذخیره‌ی بهترین امتیازِ یک مهارت (هماهنگ با کارنامه‌ی سایت). */
  function saveBest(skill, score, isQuiz, wrongArr) {
    var c = cur();
    var key = 'tz_' + skill;
    if (c) {
      c.activities = c.activities || {};
      var prev = c.activities[key] || {};
      if (!prev.bestScore || score > prev.bestScore) prev.bestScore = score;
      c.activities[key] = prev;
      try {
        if (typeof window.fbSaveResultAuto === 'function') {
          window.fbSaveResultAuto(c.username, key, score, !!isQuiz, wrongArr || []);
        }
      } catch (e) {}
    }
    try {
      if (typeof window.qdMissionProgress === 'function') window.qdMissionProgress('tizhoshan', 1);
    } catch (e) {}
  }

  /* DOM helper: h('div', {class:'x', onclick:fn}, child, child...) */
  function h(tag, props) {
    var node = document.createElement(tag);
    if (props) {
      for (var k in props) {
        if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
        var v = props[k];
        if (v == null) continue;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') { for (var s in v) node.style[s] = v[s]; }
        else node.setAttribute(k, v);
      }
    }
    for (var i = 2; i < arguments.length; i++) {
      var ch = arguments[i];
      if (ch == null) continue;
      if (Array.isArray(ch)) { ch.forEach(function (c) { if (c != null) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); }); }
      else node.appendChild(typeof ch === 'string' ? document.createTextNode(ch) : ch);
    }
    return node;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

  /* شمارنده‌ی شبه‌تصادفی با seed تا آزمون‌ها تکرارپذیر و تولیدشونده باشند */
  function RNG(seed) { this.s = seed >>> 0 || 1; }
  RNG.prototype.next = function () { this.s ^= this.s << 13; this.s ^= this.s >>> 17; this.s ^= this.s << 5; this.s >>>= 0; return this.s / 4294967296; };
  RNG.prototype.int = function (a, b) { return a + Math.floor(this.next() * (b - a + 1)); };
  RNG.prototype.pick = function (arr) { return arr[this.int(0, arr.length - 1)]; };
  RNG.prototype.shuffle = function (arr) { arr = arr.slice(); for (var i = arr.length - 1; i > 0; i--) { var j = this.int(0, i); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; };

  /* ======================================================================
   * ۱) موتورِ SVG — دقتِ بی‌خطای شکل
   * ==================================================================== */
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    return n;
  }
  /** جعبه‌ی ۱۰۰×۱۰۰ با مرکزِ (۵۰،۵۰). محتوا را در یک <g> با ترنسفورمِ دقیق می‌گذارد. */
  function figure(drawFn, opts) {
    opts = opts || {};
    var svg = s('svg', { viewBox: '0 0 100 100', class: 'tz-fig', width: opts.size || 92, height: opts.size || 92 });
    if (opts.frame !== false) svg.appendChild(s('rect', { x: 3, y: 3, width: 94, height: 94, rx: 7, fill: 'none', stroke: '#c9cfdd', 'stroke-width': 1.6 }));
    var g = s('g', {});
    // ترنسفورم‌ها: چرخشِ دقیق حول مرکز، و در صورتِ آینه یک اسکیلِ منفی
    var t = '';
    if (opts.mirror === 'v') t += ' translate(100 0) scale(-1 1)';
    else if (opts.mirror === 'h') t += ' translate(0 100) scale(1 -1)';
    if (opts.rot) t = 'rotate(' + opts.rot + ' 50 50)' + t;
    if (t) g.setAttribute('transform', t.trim());
    drawFn(g);
    svg.appendChild(g);
    return svg;
  }
  function add(g, tag, attrs) { var n = s(tag, attrs); g.appendChild(n); return n; }

  var DEF = { fill: 'none', stroke: PAL.line, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  function merge(a, b) { var o = {}; for (var k in a) o[k] = a[k]; if (b) for (var j in b) o[j] = b[j]; return o; }

  /** رأس‌های یک nـضلعیِ منتظم (زاویه‌ی شروع بر حسب درجه). */
  function polyPts(n, r, cx, cy, start) {
    cx = cx == null ? 50 : cx; cy = cy == null ? 50 : cy; r = r || 34; start = start == null ? -90 : start;
    var p = [];
    for (var i = 0; i < n; i++) {
      var a = (start + i * 360 / n) * Math.PI / 180;
      p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return p;
  }
  function ptsStr(pts) { return pts.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' '); }
  function polygon(g, n, o) { o = o || {}; return add(g, 'polygon', merge(DEF, merge({ points: ptsStr(polyPts(n, o.r, o.cx, o.cy, o.start)) }, o.attr))); }

  /* هاشورِ برنامه‌ای داخلِ یک مسیر (با clipPath) — زاویه و تراکمِ دقیق */
  var _clip = 0;
  function hatchInto(g, buildShape, angle, spacing, sw) {
    spacing = spacing || 7; sw = sw || 1.6;
    var id = 'tzclip' + (++_clip);
    var cp = s('clipPath', { id: id });
    buildShape(cp);
    g.appendChild(cp);
    var lines = s('g', { 'clip-path': 'url(#' + id + ')', transform: 'rotate(' + (angle || 0) + ' 50 50)' });
    for (var x = -60; x <= 160; x += spacing) lines.appendChild(s('line', { x1: x, y1: -60, x2: x, y2: 160, stroke: PAL.line, 'stroke-width': sw }));
    g.appendChild(lines);
    // خطِ دورِ شکل
    buildShape(g, true);
  }

  /* ======================================================================
   * ۲) موتیف‌های chiral (دست‌دار) — آینه‌شان با چرخش روی اصل نمی‌افتد
   * ==================================================================== */
  // پرچمِ گوشه‌دار: مربع + بریدگیِ مثلثی در یک گوشه + یک نقطه‌ی نامتقارن.
  function motifFlag(g) {
    add(g, 'path', merge(DEF, { d: 'M28 26 H72 V60 L54 74 H28 Z' }));     // پنج‌ضلعیِ نامتقارن (گوشه‌ی پایین-راست بریده)
    add(g, 'circle', merge(DEF, { cx: 40, cy: 40, r: 4, fill: PAL.line })); // نقطه‌ی نامتقارن بالا-چپ
  }
  // « لِ » با دنباله: یک L با یک دندانه — کاملاً نامتقارن
  function motifEll(g) {
    add(g, 'path', merge(DEF, { d: 'M34 26 V70 H66 V58 H50 V26 Z' }));
    add(g, 'circle', merge(DEF, { cx: 60, cy: 64, r: 3.4, fill: PAL.line }));
  }
  // فلشِ خمیده chiral
  function motifHook(g) {
    add(g, 'path', merge(DEF, { d: 'M32 68 C32 40 68 40 68 62' }));
    add(g, 'path', merge(DEF, { d: 'M68 62 l-8 -4 M68 62 l-4 8', 'stroke-width': 3 }));
    add(g, 'circle', merge(DEF, { cx: 32, cy: 68, r: 3.6, fill: PAL.line }));
  }
  // مثلثِ قائم‌الزاویه با علامتِ داخلی نامتقارن
  function motifRTri(g) {
    add(g, 'polygon', merge(DEF, { points: '30,72 72,72 30,30' }));
    add(g, 'circle', merge(DEF, { cx: 40, cy: 62, r: 3.4, fill: PAL.line }));
  }

  /* ======================================================================
   * ۳) مولدِ سؤالِ «تصویرِ متفاوت» (مبحث ۱)
   *    ۳ گزینه هم‌نهشت (چرخش‌های مختلفِ یک موتیفِ chiral) + ۱ گزینه آینه ⇒ جوابِ قطعی.
   * ==================================================================== */
  var MOTIFS = [motifFlag, motifEll, motifHook, motifRTri];

  function makeOddQuestion(rng) {
    var motif = rng.pick(MOTIFS);
    // چهار زاویه‌ی متمایز تا هر ۴ گزینه ظاهراً فرق کنند
    var angles = rng.shuffle([0, 90, 180, 270]);
    var oddMirror = rng.next() < 0.5 ? 'v' : 'h';
    var options = [];
    for (var i = 0; i < 4; i++) options.push({ rot: angles[i], mirror: null });
    var oddIndex = rng.int(0, 3);
    options[oddIndex].mirror = oddMirror; // فقط این یکی آینه شده ⇒ chiral ⇒ قطعاً متفاوت
    return {
      kind: 'odd',
      prompt: 'کدام شکل با بقیه فرق دارد؟',
      render: function (opt) { return figure(motif, { rot: opt.rot, mirror: opt.mirror, size: 96 }); },
      options: options,
      answer: oddIndex,
      why: 'سه شکل فقط چرخیده‌اند و روی هم می‌افتند؛ ولی این یکی «آینه» شده — با هیچ چرخشی مثلِ بقیه نمی‌شود (شکلِ دست‌دار).'
    };
  }

  /* مولدِ «شمارش»: ۳ گزینه با k نشانه، گزینه‌ی متفاوت با k±۱ نشانه */
  function makeCountQuestion(rng) {
    var n = rng.pick([5, 6, 7]);          // ضلعِ چندضلعیِ پایه
    var k = rng.int(3, 4);                // تعداد نقطه‌ی «هم‌تعداد»
    var oddK = rng.next() < 0.5 ? k + 1 : k - 1;
    function draw(count, start) {
      return function (g) {
        polygon(g, n, { r: 32, start: start });
        var pts = polyPts(count, 16, 50, 50, start + 18);
        pts.forEach(function (p) { add(g, 'circle', { cx: p[0], cy: p[1], r: 3.4, fill: PAL.line }); });
      };
    }
    var starts = rng.shuffle([-90, -54, -18, 18]);
    var oddIndex = rng.int(0, 3);
    var options = [];
    for (var i = 0; i < 4; i++) options.push({ count: i === oddIndex ? oddK : k, start: starts[i] });
    return {
      kind: 'count',
      prompt: 'کدام شکل با بقیه فرق دارد؟',
      render: function (opt) { return figure(draw(opt.count, opt.start), { size: 96 }); },
      options: options,
      answer: oddIndex,
      why: 'همه‌ی شکل‌ها ' + toFa(k) + ' نقطه‌ی داخلی دارند، اما این یکی ' + toFa(oddK) + ' نقطه دارد. «شمردنی‌ها» سرنخِ خوبی‌اند.'
    };
  }

  /* مولدِ «هاشور/تراکم»: شکلِ نامتقارن (مثلثِ قائم) در ۴ دورانِ متمایز؛ ۳ گزینه هاشورِ
     متراکم و یک گزینه هاشورِ کم‌تراکم ⇒ تفاوت قطعی و بی‌ابهام (سرنخِ «مقدارِ هاشورخوردگی»). */
  function makeHatchQuestion(rng) {
    var rots = rng.shuffle([0, 90, 180, 270]);   // دورانِ مثلث ⇒ ۴ ظاهرِ متمایز
    var dense = 6, sparse = 13;
    var oddIndex = rng.int(0, 3);
    function draw(spacing) {
      return function (g) {
        function shp(t, stroked) {
          var pts = '30,72 72,72 30,28';         // مثلثِ قائم (گوشه‌ی قائم پایین-چپ)
          if (stroked) add(t, 'polygon', merge(DEF, { points: pts }));
          else add(t, 'polygon', { points: pts });
        }
        hatchInto(g, shp, 0, spacing, 1.8);      // هاشور با شکل هم‌چرخ می‌شود؛ تنها تراکم فرق دارد
      };
    }
    var options = [];
    for (var i = 0; i < 4; i++) options.push({ rot: rots[i], spacing: i === oddIndex ? sparse : dense });
    return {
      kind: 'hatch',
      prompt: 'کدام شکل با بقیه فرق دارد؟',
      render: function (opt) { return figure(draw(opt.spacing), { rot: opt.rot, size: 96 }); },
      options: options,
      answer: oddIndex,
      why: 'همه‌ی مثلث‌ها فقط چرخیده‌اند و هاشورِ متراکم (نزدیک‌به‌هم) دارند؛ اما هاشورِ این یکی بازتر و کم‌تراکم‌تر است.'
    };
  }

  var GENERATORS = [makeOddQuestion, makeCountQuestion, makeHatchQuestion];
  function genQuestion(rng) { return rng.pick(GENERATORS)(rng); }

  /* ======================================================================
   * ۴) نمونه‌سؤال‌های شبیه‌سازی‌شده‌ی کتاب (مبحث ۱) — با بازخوردِ آموزنده
   *    (شکل‌ها اورجینال و تمیز؛ منطقِ سؤال وفادار به کتاب.)
   * ==================================================================== */
  function figFromDraw(draw) { return function () { return figure(draw, { size: 96 }); }; }

  var BOOK_M1 = [
    // شبیهِ نمونه‌ی درسنامه: سه شکل با هاشورِ افقی، یکی خطِ تقارن ندارد.
    {
      prompt: 'کدام‌یک از تصویرها متفاوت است؟ (سرنخ: تقارن)',
      build: function () {
        function hatchPoly(nSides, start) {
          return figure(function (g) {
            function shp(t, st) { var p = polyPts(nSides, 33, 50, 50, start); if (st) add(t, 'polygon', merge(DEF, { points: ptsStr(p) })); else add(t, 'polygon', { points: ptsStr(p) }); }
            hatchInto(g, shp, 0, 7, 1.6);
          }, { size: 96 });
        }
        return [hatchPoly(6, -90), hatchPoly(4, -45), hatchPoly(8, -90), // متقارن‌ها
          figure(function (g) { // متفاوت: چندضلعیِ نامنتظم بدونِ محورِ تقارن
            function shp(t, st) { var p = [[24,40],[52,26],[76,44],[64,72],[34,70]]; if (st) add(t,'polygon',merge(DEF,{points:ptsStr(p)})); else add(t,'polygon',{points:ptsStr(p)}); }
            hatchInto(g, shp, 0, 7, 1.6);
          }, { size: 96 })];
      },
      answer: 3,
      why: 'همه‌ی شکل‌ها چندضلعیِ منتظم‌اند و خطِ تقارن دارند؛ اما فقط شکلِ چهارم نامنتظم است و خطِ تقارن ندارد.'
    }
  ];

  /* ======================================================================
   * ۵) محتوای درسنامه‌ی مبحث ۱ (چند صفحه، دکمه‌ی «بعدی») — متن اورجینال
   * ==================================================================== */
  function lessonM1() {
    return [
      { // ۱) قلابِ کنجکاوی
        title: 'یک راز کوچک 🔎',
        body: 'سه‌تا شکل کنارِ هم می‌بینی که انگار مثلِ هم‌اند… اما یکی‌شان یواشکی فرق دارد! چشمِ کارآگاهیِ تو باید همان یکی را پیدا کند. راز این است: قبل از اینکه دنبالِ «تفاوت» بگردی، اول ببین سه‌تای دیگر چه چیزِ مشترکی دارند.',
        art: function () { return figure(motifFlag, { size: 120, frame: false }); }
      },
      { // ۲) توضیحِ مفهوم
        title: 'شکل‌ها را «بشمار» ✋',
        body: 'اولین سرنخ، شمردن است: تعدادِ ضلع‌ها، گوشه‌ها، نقطه‌ها. اگر همه‌ی شکل‌ها یک عدد بدهند و یکی عددِ دیگری، همان «متفاوت» است.',
        art: function () {
          var wrap = h('div', { class: 'tz-artrow' });
          [5, 5, 5, 6].forEach(function (n, i) { wrap.appendChild(figure(function (g) { polygon(g, n, { r: 30 }); }, { size: 74 })); });
          return wrap;
        }
      },
      { // ۳) دوران و آینه
        title: 'چرخیده یا آینه شده؟ 🪞',
        body: 'گاهی شکل‌ها فقط «چرخیده‌اند» و روی هم می‌افتند. اما اگر یکی «آینه» شده باشد، دیگر با هیچ چرخشی مثلِ بقیه نمی‌شود — به این شکل‌ها می‌گوییم دست‌دار (مثلِ دستِ چپ و راست). دنبالِ همین آینه‌شده بگرد!',
        art: function () {
          var wrap = h('div', { class: 'tz-artrow' });
          [{ rot: 0 }, { rot: 90 }, { rot: 180 }, { mirror: 'v' }].forEach(function (o) { wrap.appendChild(figure(motifEll, { rot: o.rot || 0, mirror: o.mirror || null, size: 74 })); });
          return wrap;
        }
      },
      { // ۴) نمونه‌ی حل‌شده‌ی تعاملی
        title: 'با هم حل کنیم ✏️',
        interactive: BOOK_M1[0]
      },
      { // ۵) جمع‌بندی
        title: 'جمع‌بندی 🌟',
        body: 'برای پیداکردنِ «متفاوت»: (۱) بشمار (ضلع، گوشه، نقطه)، (۲) به هاشور و جنسِ خط نگاه کن، (۳) ببین چیزی چرخیده یا آینه شده. سه‌تای مشترک را پیدا کن، آن یکیِ ناهماهنگ جوابت است. حالا برویم تمرین!',
        art: function () { return figure(motifHook, { size: 110, frame: false }); }
      }
    ];
  }

  /* ======================================================================
   * ۶) داده‌ی مبحث‌ها
   * ==================================================================== */
  var MABAHETH = [
    { id: 'motafavet1', n: 1, title: 'تصویرِ متفاوت', sub: 'یکی با بقیه فرق دارد', icon: '🔍', color: PAL.teal, ready: true,
      lesson: lessonM1, book: BOOK_M1, gen: genQuestion },
    { id: 'olgoo_tasviri', n: 2, title: 'تصویرِ متفاوت (نوع ۲)', sub: '۵ گزینه‌ای', icon: '🧩', color: PAL.lilac, ready: false },
    { id: 'monaseb', n: 3, title: 'تصویرِ مناسب', sub: 'کدام مناسب است؟', icon: '🎯', color: PAL.gold, ready: false },
    { id: 'moshabeh1', n: 4, title: 'ویژگیِ مشابه (نوع ۱)', sub: 'شبیه‌ترین گزینه', icon: '🔗', color: PAL.teal, ready: false },
    { id: 'moshabeh2', n: 5, title: 'ویژگیِ مشابه (نوع ۲)', sub: '۵ گزینه‌ای', icon: '🪞', color: PAL.lilac, ready: false },
    { id: 'ejraye_qaede', n: 6, title: 'اجرای قاعده', sub: 'قاعده را ادامه بده', icon: '⚙️', color: PAL.gold, ready: false },
    { id: 'dastebandi', n: 7, title: 'دسته‌بندیِ شکل‌ها', sub: 'گروه‌بندیِ درست', icon: '🗂️', color: PAL.teal, ready: false }
  ];

  /* ======================================================================
   * ۷) رابطِ کاربری
   * ==================================================================== */
  var ROOT = null;
  function mountRoot() {
    ROOT = document.getElementById('sec-tizhoshan');
    if (!ROOT) return null;
    ROOT.classList.add('tz-root');
    ROOT.setAttribute('dir', 'rtl');
    return ROOT;
  }

  function backBtn(fn, label) {
    return h('button', { class: 'tz-back', onclick: fn }, '→ ' + (label || 'بازگشت'));
  }

  function renderHub() {
    if (!ROOT) return;
    clear(ROOT);
    var head = h('div', { class: 'tz-hero' },
      h('div', { class: 'tz-hero-badge' }, '✦ تیزهوشان'),
      h('h1', { class: 'tz-hero-title' }, 'هوش و استعدادِ تصویری'),
      h('p', { class: 'tz-hero-sub' }, 'فصلِ تحلیل — پایه‌ی ' + toFa(grade()) + ' — با هم کارآگاهِ شکل‌ها می‌شویم!')
    );
    var grid = h('div', { class: 'tz-grid' });
    MABAHETH.forEach(function (m) {
      var card = h('button', { class: 'tz-card' + (m.ready ? '' : ' tz-card-soon'), style: { '--tz-c': m.color }, onclick: function () { if (m.ready) openMabhath(m); } },
        h('span', { class: 'tz-card-ic' }, m.icon),
        h('span', { class: 'tz-card-n' }, 'مبحثِ ' + toFa(m.n)),
        h('span', { class: 'tz-card-t' }, m.title),
        h('span', { class: 'tz-card-s' }, m.sub),
        m.ready ? null : h('span', { class: 'tz-soon' }, 'به‌زودی')
      );
      grid.appendChild(card);
    });
    ROOT.appendChild(head);
    ROOT.appendChild(grid);
  }

  function openMabhath(m) {
    clear(ROOT);
    ROOT.appendChild(backBtn(renderHub, 'مبحث‌ها'));
    ROOT.appendChild(h('h2', { class: 'tz-h2' }, m.icon + ' مبحثِ ' + toFa(m.n) + ' — ' + m.title));
    var tabs = h('div', { class: 'tz-tabs' });
    var stage = h('div', { class: 'tz-stage' });
    var TABS = [
      { key: 'lesson', label: '📖 درسنامه', fn: function () { runLesson(m, stage); } },
      { key: 'book', label: '📝 نمونه‌سؤال کتاب', fn: function () { runBook(m, stage); } },
      { key: 'quiz', label: '🏁 آزمون', fn: function () { runQuiz(m, stage); } }
    ];
    TABS.forEach(function (t, i) {
      var b = h('button', { class: 'tz-tab', onclick: function () { Array.prototype.forEach.call(tabs.children, function (c) { c.classList.remove('on'); }); b.classList.add('on'); t.fn(); } }, t.label);
      if (i === 0) b.classList.add('on');
      tabs.appendChild(b);
    });
    ROOT.appendChild(tabs);
    ROOT.appendChild(stage);
    runLesson(m, stage);
  }

  /* ---- درسنامه ---- */
  function runLesson(m, stage) {
    clear(stage);
    var pages = m.lesson ? m.lesson() : [];
    var idx = 0;
    var card = h('div', { class: 'tz-lesson' });
    var dots = h('div', { class: 'tz-dots' });
    stage.appendChild(card); stage.appendChild(dots);
    function draw() {
      clear(card); clear(dots);
      var p = pages[idx];
      card.appendChild(h('h3', { class: 'tz-lt' }, p.title));
      if (p.interactive) {
        card.appendChild(buildInteractive(p.interactive));
      } else {
        if (p.art) { var a = h('div', { class: 'tz-lart' }); a.appendChild(p.art()); card.appendChild(a); }
        card.appendChild(h('p', { class: 'tz-lb' }, p.body));
      }
      pages.forEach(function (_, i) { dots.appendChild(h('span', { class: 'tz-dot' + (i === idx ? ' on' : '') })); });
      var nav = h('div', { class: 'tz-lnav' },
        idx > 0 ? h('button', { class: 'tz-btn ghost', onclick: function () { idx--; draw(); } }, 'قبلی') : h('span'),
        idx < pages.length - 1
          ? h('button', { class: 'tz-btn', onclick: function () { idx++; draw(); } }, 'بعدی ←')
          : h('button', { class: 'tz-btn', onclick: function () { runQuiz(m, stage); } }, 'برویم تمرین! 🏁')
      );
      card.appendChild(nav);
    }
    draw();
  }

  /* نمونه‌ی تعاملی داخلِ درسنامه: کاربر یک گزینه می‌زند، بازخورد می‌گیرد */
  function buildInteractive(q) {
    var wrap = h('div', { class: 'tz-inter' });
    wrap.appendChild(h('p', { class: 'tz-qprompt' }, q.prompt));
    var opts = h('div', { class: 'tz-opts' });
    var figs = q.build();
    var done = false;
    figs.forEach(function (fig, i) {
      var b = h('button', { class: 'tz-opt', onclick: function () {
        if (done) return; done = true;
        var correct = i === q.answer;
        b.classList.add(correct ? 'ok' : 'bad');
        opts.children[q.answer].classList.add('ok');
        wrap.appendChild(h('div', { class: 'tz-fb ' + (correct ? 'ok' : 'bad') }, (correct ? '✓ آفرین! ' : '✗ نه، دقت کن: ') + q.why));
      } }, fig, h('span', { class: 'tz-opt-n' }, toFa(i + 1)));
      opts.appendChild(b);
    });
    wrap.appendChild(opts);
    return wrap;
  }

  /* ---- نمونه‌سؤالِ کتاب ---- */
  function runBook(m, stage) {
    clear(stage);
    if (!m.book || !m.book.length) { stage.appendChild(h('p', { class: 'tz-empty' }, 'به‌زودی…')); return; }
    var i = 0;
    var box = h('div', {});
    stage.appendChild(box);
    function draw() {
      clear(box);
      var q = m.book[i];
      box.appendChild(h('div', { class: 'tz-qcount' }, 'نمونه‌ی ' + toFa(i + 1) + ' از ' + toFa(m.book.length)));
      var inter = buildInteractive({ prompt: q.prompt, build: q.build, answer: q.answer, why: q.why });
      box.appendChild(inter);
      box.appendChild(h('div', { class: 'tz-lnav' },
        i > 0 ? h('button', { class: 'tz-btn ghost', onclick: function () { i--; draw(); } }, 'قبلی') : h('span'),
        i < m.book.length - 1 ? h('button', { class: 'tz-btn', onclick: function () { i++; draw(); } }, 'بعدی ←') : h('span')
      ));
    }
    draw();
  }

  /* ---- آزمونِ تولیدشونده ---- */
  function runQuiz(m, stage) {
    clear(stage);
    var TOTAL = 15;
    var rng = new RNG((Date.now() & 0xffffff) ^ (m.n * 2654435761));
    var qs = []; for (var i = 0; i < TOTAL; i++) qs.push(m.gen(rng));
    var idx = 0, correct = 0, wrong = [];
    var bar = h('div', { class: 'tz-barwrap' }, h('div', { class: 'tz-bar' }));
    var box = h('div', {});
    stage.appendChild(bar); stage.appendChild(box);
    function progress() { bar.firstChild.style.width = (idx / TOTAL * 100) + '%'; }
    function draw() {
      progress();
      clear(box);
      if (idx >= TOTAL) return finish();
      var q = qs[idx];
      box.appendChild(h('div', { class: 'tz-qcount' }, 'سؤالِ ' + toFa(idx + 1) + ' از ' + toFa(TOTAL) + ' — امتیاز: ' + toFa(correct)));
      box.appendChild(h('p', { class: 'tz-qprompt' }, q.prompt));
      var opts = h('div', { class: 'tz-opts' });
      var done = false;
      q.options.forEach(function (opt, i) {
        var b = h('button', { class: 'tz-opt', onclick: function () {
          if (done) return; done = true;
          var ok = i === q.answer;
          b.classList.add(ok ? 'ok' : 'bad');
          opts.children[q.answer].classList.add('ok');
          if (ok) correct++; else wrong.push(idx + 1);
          box.appendChild(h('div', { class: 'tz-fb ' + (ok ? 'ok' : 'bad') }, (ok ? '✓ درست! ' : '✗ اشتباه — ') + q.why));
          box.appendChild(h('div', { class: 'tz-lnav' }, h('span'),
            h('button', { class: 'tz-btn', onclick: function () { idx++; draw(); } }, idx < TOTAL - 1 ? 'سؤالِ بعد ←' : 'دیدنِ کارنامه')));
        } }, q.render(opt), h('span', { class: 'tz-opt-n' }, toFa(i + 1)));
        opts.appendChild(b);
      });
      box.appendChild(opts);
    }
    function finish() {
      bar.firstChild.style.width = '100%';
      clear(box);
      var pct = Math.round(correct / TOTAL * 100);
      saveBest(m.id, pct, true, wrong);
      var msg = pct >= 80 ? 'عالی بود! کارآگاهِ حرفه‌ای شدی 🌟' : pct >= 50 ? 'خوب بود، با کمی تمرین عالی می‌شوی 💪' : 'اشکال ندارد، دوباره تمرین کن؛ بهتر می‌شوی 🌱';
      box.appendChild(h('div', { class: 'tz-report' },
        h('div', { class: 'tz-score' }, toFa(correct) + ' / ' + toFa(TOTAL)),
        h('div', { class: 'tz-pct' }, '٪' + toFa(pct)),
        h('p', { class: 'tz-msg' }, msg),
        wrong.length ? h('p', { class: 'tz-wrong' }, 'سؤال‌های اشتباه: ' + wrong.map(toFa).join('، ')) : null,
        h('div', { class: 'tz-lnav' },
          h('button', { class: 'tz-btn ghost', onclick: function () { runLesson(m, stage); } }, 'مرورِ درس'),
          h('button', { class: 'tz-btn', onclick: function () { runQuiz(m, stage); } }, 'آزمونِ تازه 🔁'))
      ));
    }
    draw();
  }

  /* ======================================================================
   * ۸) استایل‌ها (یک‌بار)
   * ==================================================================== */
  function injectStyles() {
    if (document.getElementById('tz-styles')) return;
    var css = [
      '.tz-root{font-family:Vazirmatn,Vazir,Tahoma,sans-serif;color:' + PAL.ink + ';background:' + PAL.cream + ';padding:18px;border-radius:20px;max-width:920px;margin:0 auto;line-height:1.9}',
      '.tz-root *{box-sizing:border-box}',
      '.tz-hero{background:linear-gradient(135deg,' + PAL.teal + ',' + PAL.tealD + ');color:#fff;border-radius:18px;padding:22px;text-align:center;box-shadow:0 10px 26px rgba(47,158,147,.28)}',
      '.tz-hero-badge{display:inline-block;background:rgba(255,255,255,.2);padding:4px 14px;border-radius:999px;font-size:.85rem;margin-bottom:8px}',
      '.tz-hero-title{margin:6px 0;font-size:1.5rem}',
      '.tz-hero-sub{margin:0;opacity:.92;font-size:.95rem}',
      '.tz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin-top:18px}',
      '.tz-card{cursor:pointer;border:none;text-align:center;background:' + PAL.paper + ';border-radius:16px;padding:16px 10px;display:flex;flex-direction:column;align-items:center;gap:3px;box-shadow:0 4px 14px rgba(43,48,64,.08);border-top:4px solid var(--tz-c);transition:transform .15s,box-shadow .15s;font-family:inherit}',
      '.tz-card:hover{transform:translateY(-3px);box-shadow:0 10px 22px rgba(43,48,64,.14)}',
      '.tz-card-soon{opacity:.6;cursor:default}',
      '.tz-card-ic{font-size:1.9rem}',
      '.tz-card-n{font-size:.78rem;color:var(--tz-c);font-weight:700}',
      '.tz-card-t{font-weight:700;font-size:1rem;color:' + PAL.ink + '}',
      '.tz-card-s{font-size:.8rem;color:' + PAL.inkSoft + '}',
      '.tz-soon{margin-top:6px;font-size:.72rem;background:' + PAL.lilacL + ';color:' + PAL.lilac + ';padding:2px 10px;border-radius:999px}',
      '.tz-back{background:none;border:none;color:' + PAL.tealD + ';font-family:inherit;font-size:.95rem;cursor:pointer;padding:6px 2px;font-weight:700}',
      '.tz-h2{margin:6px 0 12px;font-size:1.25rem}',
      '.tz-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}',
      '.tz-tab{flex:1;min-width:120px;cursor:pointer;border:2px solid #e3e0d6;background:' + PAL.paper + ';border-radius:12px;padding:10px;font-family:inherit;font-size:.92rem;color:' + PAL.inkSoft + ';transition:.15s}',
      '.tz-tab.on{background:' + PAL.teal + ';color:#fff;border-color:' + PAL.teal + '}',
      '.tz-stage{background:' + PAL.paper + ';border-radius:16px;padding:18px;box-shadow:0 4px 14px rgba(43,48,64,.06)}',
      '.tz-lesson{text-align:center}',
      '.tz-lt{margin:0 0 10px;font-size:1.2rem;color:' + PAL.tealD + '}',
      '.tz-lb{font-size:1rem;color:' + PAL.ink + ';text-align:justify;background:' + PAL.tealL + ';padding:14px;border-radius:12px}',
      '.tz-lart{margin:8px 0}',
      '.tz-artrow{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}',
      '.tz-fig{background:#fff;border-radius:10px}',
      '.tz-dots{display:flex;gap:6px;justify-content:center;margin:12px 0}',
      '.tz-dot{width:9px;height:9px;border-radius:50%;background:#d8d4c8}',
      '.tz-dot.on{background:' + PAL.teal + ';width:22px;border-radius:6px}',
      '.tz-lnav{display:flex;justify-content:space-between;align-items:center;margin-top:16px;gap:10px}',
      '.tz-btn{cursor:pointer;border:none;background:' + PAL.teal + ';color:#fff;font-family:inherit;font-size:.98rem;padding:11px 22px;border-radius:12px;font-weight:700;box-shadow:0 4px 12px rgba(47,158,147,.28)}',
      '.tz-btn.ghost{background:#eee9dd;color:' + PAL.inkSoft + ';box-shadow:none}',
      '.tz-qprompt{font-size:1.05rem;font-weight:700;text-align:center;margin:6px 0 14px}',
      '.tz-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:12px;justify-items:center}',
      '.tz-opt{position:relative;cursor:pointer;border:3px solid #e3e0d6;background:#fff;border-radius:14px;padding:8px;font-family:inherit;transition:.12s;display:flex;flex-direction:column;align-items:center}',
      '.tz-opt:hover{border-color:' + PAL.lilac + '}',
      '.tz-opt.ok{border-color:' + PAL.ok + ';box-shadow:0 0 0 3px ' + PAL.tealL + '}',
      '.tz-opt.bad{border-color:' + PAL.bad + '}',
      '.tz-opt-n{margin-top:4px;font-size:.85rem;color:' + PAL.inkSoft + ';font-weight:700}',
      '.tz-fb{margin-top:14px;padding:12px 14px;border-radius:12px;font-size:.95rem;text-align:justify}',
      '.tz-fb.ok{background:' + PAL.tealL + ';color:' + PAL.tealD + '}',
      '.tz-fb.bad{background:#fbeae7;color:' + PAL.bad + '}',
      '.tz-qcount{font-size:.85rem;color:' + PAL.inkSoft + ';text-align:center;margin-bottom:8px}',
      '.tz-barwrap{height:10px;background:#e9e4d7;border-radius:999px;overflow:hidden;margin-bottom:14px}',
      '.tz-bar{height:100%;width:0;background:linear-gradient(90deg,' + PAL.teal + ',' + PAL.lilac + ');transition:width .3s}',
      '.tz-report{text-align:center}',
      '.tz-score{font-size:2rem;font-weight:800;color:' + PAL.teal + '}',
      '.tz-pct{font-size:1.1rem;color:' + PAL.lilac + ';font-weight:700}',
      '.tz-msg{font-size:1.05rem;margin:8px 0}',
      '.tz-wrong{font-size:.9rem;color:' + PAL.inkSoft + '}',
      '.tz-empty{text-align:center;color:' + PAL.inkSoft + ';padding:24px}',
      '@media(max-width:480px){.tz-root{padding:12px}.tz-hero-title{font-size:1.25rem}.tz-tab{min-width:100%}}'
    ].join('\n');
    var st = document.createElement('style'); st.id = 'tz-styles'; st.textContent = css;
    document.head.appendChild(st);
  }

  /* ======================================================================
   * ۹) نقطه‌ی ورود
   * ==================================================================== */
  function renderTizHub() {
    injectStyles();
    if (!mountRoot()) { console.warn('[tizhoshan] #sec-tizhoshan یافت نشد.'); return; }
    renderHub();
  }
  window.renderTizHub = renderTizHub;

  /* قلابِ دیباگ برای تستِ داخلی (بی‌اثر مگر window.__TZ_DEBUG===true) */
  if (window.__TZ_DEBUG === true) {
    window.__tz = { figure: figure, RNG: RNG, injectStyles: injectStyles,
      makeOddQuestion: makeOddQuestion, makeCountQuestion: makeCountQuestion, makeHatchQuestion: makeHatchQuestion,
      BOOK_M1: BOOK_M1 };
  }
})();

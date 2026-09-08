// ═══ آزمایشگاه ماشین‌های ساده — هماهنگ‌کنندهٔ برنامه ═══
import { fa, num, clamp, easeInOut } from './core/format.js';
import { solve, setLab, LAB, MACHINES, MACHINE_IDS } from './physics/machines.js';
import { explain } from './physics/explain.js';
import { DEFAULT_PARAMS, MACHINE_CONTROLS, resolveParams, describeSetup } from './content/controls.js';
import { CURRICULUM, CLASSROOM_TIPS, reportHTML } from './content/curriculum.js';
import { Stage } from './render/stage.js';
import { el, card, buildControls, quantityTable, stepsList, logTable, drawChart, CHART_SPEC } from './ui/components.js';

const SAVE_KEY = 'azmayeshgah_mashinhaye_sadeh_v1';
const RUN_SECONDS = 3.4;

function preferredTheme() {
  const stamped = document.documentElement.dataset.theme;
  if (stamped === 'dark' || stamped === 'light') return stamped;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

class App {
  constructor() {
    this.state = {
      machine: 'INCLINED_PLANE',
      params: {},
      log: [],
      view: { vectors: false, dims: true, steps: true, chart: false, records: false },
      lab: { g: 10, ideal: false },
      theme: null
    };
    this.t = 0;
    this.running = false;
    this.slow = false;

    this.load();
    for (const id of MACHINE_IDS) {
      if (!this.state.params[id]) this.state.params[id] = { ...DEFAULT_PARAMS[id] };
    }
    if (!this.state.theme) this.state.theme = preferredTheme();
    setLab(this.state.lab);
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      this.state = {
        ...this.state, ...saved,
        view: { ...this.state.view, ...(saved.view || {}) },
        lab: { ...this.state.lab, ...(saved.lab || {}) }
      };
    } catch { /* ذخیرهٔ خراب را نادیده بگیر */ }
  }

  save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); } catch { /* حافظه پر */ }
  }

  get machine() { return this.state.machine; }
  get params() { return this.state.params[this.state.machine]; }

  compute() {
    setLab(this.state.lab);
    return solve(this.machine, resolveParams(this.machine, this.params));
  }

  // ─────────── راه‌اندازی ───────────
  init() {
    this.dom = {
      bar: document.getElementById('machineBar'),
      canvas: document.getElementById('stageCanvas'),
      side: document.getElementById('sidepanel'),
      btnRun: document.getElementById('btnRun'),
      btnRunText: document.getElementById('btnRunText'),
      btnVectors: document.getElementById('btnVectors'),
      btnDims: document.getElementById('btnDims'),
      btnSlow: document.getElementById('btnSlow'),
      modal: document.getElementById('modal'),
      modalTitle: document.getElementById('modalTitle'),
      modalBody: document.getElementById('modalBody')
    };

    this.stage = new Stage(this.dom.canvas);
    this.stage.getState = () => this.viewState();
    this.stage.onHandleChange = (id, v) => this.onDrag(id, v);

    this.applyTheme();
    this.bind();
    this.stage.resize();
    this.stage.start();
    this.renderBar();
    this.renderSide();

    document.fonts?.ready.then(() => this.stage.render());
    window.addEventListener('resize', () => { this.stage.resize(); this.refreshChart(); });
  }

  viewState() {
    const state = this.compute();
    this.dom.canvas.setAttribute('aria-label', this.describe(state));
    return {
      machine: this.machine, state, t: this.t,
      showVectors: this.state.view.vectors,
      showDims: this.state.view.dims,
      interactive: !this.running
    };
  }

  describe(r) {
    if (r.machine === 'GEARS') {
      return `${MACHINES[r.machine].name}: نسبت دنده ${fa(num(r.ratio, 2))}، گشتاور خروجی ${fa(num(r.outputTorqueNm, 1))} نیوتون‌متر.`;
    }
    return `${MACHINES[r.machine].name}: وزن بار ${fa(num(r.loadN, 0))} نیوتون، نیروی لازم ${fa(num(r.effortN, 1))} نیوتون، مزیت مکانیکی ${fa(num(r.maActual || 1, 2))}.`;
  }

  applyTheme() {
    document.documentElement.dataset.theme = this.state.theme;
    this.stage.setTheme(this.state.theme);
  }

  bind() {
    const d = this.dom;
    d.btnRun.addEventListener('click', () => this.run());
    document.getElementById('btnReset').addEventListener('click', () => this.reset());
    d.btnVectors.addEventListener('click', () => this.toggleView('vectors', d.btnVectors));
    d.btnDims.addEventListener('click', () => this.toggleView('dims', d.btnDims));
    d.btnSlow.addEventListener('click', () => {
      this.slow = !this.slow;
      d.btnSlow.setAttribute('aria-pressed', this.slow ? 'true' : 'false');
    });
    d.btnDims.setAttribute('aria-pressed', this.state.view.dims ? 'true' : 'false');
    d.btnVectors.setAttribute('aria-pressed', this.state.view.vectors ? 'true' : 'false');

    document.getElementById('btnTheme').addEventListener('click', () => {
      this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme();
      this.refreshChart();
      this.save();
    });
    document.getElementById('btnReport').addEventListener('click', () => this.printReport());
    document.getElementById('btnHelp').addEventListener('click', () => this.openHelp());
    d.modal.querySelectorAll('[data-close]').forEach((n) => n.addEventListener('click', () => this.closeModal()));
    window.addEventListener('keydown', (e) => this.onKey(e));
  }

  toggleView(key, btn) {
    this.state.view[key] = !this.state.view[key];
    btn.setAttribute('aria-pressed', this.state.view[key] ? 'true' : 'false');
    this.save();
  }

  onKey(e) {
    if (e.key === 'Escape') { this.closeModal(); return; }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (e.code === 'Space') { e.preventDefault(); this.run(); }
    else if (k === 'r' || k === 'ق') this.reset();
    else if (k === 'v' || k === 'و') this.dom.btnVectors.click();
    else if (k === 'd' || k === 'ی') this.dom.btnDims.click();
    else if (/^[1-8]$/.test(e.key)) this.setMachine(MACHINE_IDS[Number(e.key) - 1]);
  }

  // ─────────── ناوبری و پارامترها ───────────
  setMachine(id) {
    if (!id || id === this.state.machine) return;
    this.state.machine = id;
    this.reset();
    this.renderBar();
    this.renderSide();
    this.save();
  }

  setParam(key, value) {
    const p = this.params;
    p[key] = value;
    if (key === 'beamLengthM') {
      p.fulcrumM = Math.min(p.fulcrumM, value - 0.1);
      p.loadM = Math.min(p.loadM, p.fulcrumM - 0.05);
    }
    this.reset();
    this.refreshResults();
    this.save();
  }

  onDrag(id, value) {
    const p = this.params;
    if (id === 'fulcrum' && 'fulcrumM' in p) {
      const def = MACHINE_CONTROLS.LEVER.find((c) => c.key === 'fulcrumM');
      p.fulcrumM = Math.round(clamp(value, Math.max(def.min, p.loadM + 0.05), p.beamLengthM - 0.1) * 20) / 20;
    } else if (id === 'rampLength' && 'lengthM' in p) {
      const def = MACHINE_CONTROLS.INCLINED_PLANE.find((c) => c.key === 'lengthM');
      p.lengthM = Math.round(clamp(value, Math.max(def.min, p.heightM * 1.05), def.max) * 10) / 10;
    } else return;
    this.reset();
    this.renderSide();
    this.save();
  }

  // ─────────── اجرای حرکت ───────────
  run() {
    if (this.running) return;
    this.running = true;
    this.t = 0;
    this.dom.btnRun.disabled = true;
    this.dom.btnRunText.textContent = 'در حال حرکت…';
    const duration = (this.slow ? RUN_SECONDS * 2.6 : RUN_SECONDS) * 1000;
    const start = performance.now();
    const step = (now) => {
      const raw = clamp((now - start) / duration, 0, 1);
      this.t = easeInOut(raw);
      if (raw < 1) this._raf = requestAnimationFrame(step);
      else {
        this.running = false;
        this.dom.btnRun.disabled = false;
        this.dom.btnRunText.textContent = 'دوباره اجرا کن';
      }
    };
    this._raf = requestAnimationFrame(step);
  }

  reset() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this.running = false;
    this.t = 0;
    if (this.dom) {
      this.dom.btnRun.disabled = false;
      this.dom.btnRunText.textContent = 'اجرای حرکت';
    }
  }

  // ─────────── نوار ماشین‌ها ───────────
  renderBar() {
    this.dom.bar.replaceChildren(...MACHINE_IDS.map((id, i) => el('button', {
      class: `chip${id === this.state.machine ? ' is-active' : ''}`,
      type: 'button',
      'aria-current': id === this.state.machine ? 'true' : null,
      onclick: () => this.setMachine(id)
    }, [
      el('span', { 'aria-hidden': 'true' }, [MACHINES[id].icon]),
      el('span', {}, [MACHINES[id].short]),
      el('kbd', { 'aria-hidden': 'true' }, [fa(i + 1)])
    ])));
  }

  // ─────────── پنل کناری ───────────
  renderSide() {
    const side = this.dom.side;
    const r = this.compute();
    const id = this.machine;

    // ۱) پارامترها
    const controls = el('div', {});
    controls.append(buildControls(id, this.params, (k, v) => this.setParam(k, v)));
    this._controls = controls;

    const labRow = el('div', { class: 'lab-row' }, [
      el('div', { class: 'lab-item' }, [
        el('span', { class: 'lab-label' }, ['شتاب گرانش g']),
        el('div', { class: 'segment cols-2' }, [10, 9.81].map((g) => el('button', {
          class: `seg${this.state.lab.g === g ? ' is-active' : ''}`, type: 'button',
          onclick: () => { this.state.lab.g = g; setLab(this.state.lab); this.reset(); this.renderSide(); this.save(); }
        }, [el('span', {}, [`${fa(g)} m/s²`]), el('span', { class: 'seg-sub' }, [g === 10 ? 'کتاب درسی' : 'مقدار واقعی'])])))
      ]),
      el('div', { class: 'lab-item' }, [
        el('span', { class: 'lab-label' }, ['اصطکاک']),
        el('div', { class: 'segment cols-2' }, [false, true].map((ideal) => el('button', {
          class: `seg${this.state.lab.ideal === ideal ? ' is-active' : ''}`, type: 'button',
          onclick: () => { this.state.lab.ideal = ideal; setLab(this.state.lab); this.reset(); this.renderSide(); this.save(); }
        }, [el('span', {}, [ideal ? 'آرمانی' : 'واقعی']), el('span', { class: 'seg-sub' }, [ideal ? 'بدون اصطکاک' : 'با اصطکاک'])])))
      ])
    ]);

    // ۲) اندازه‌گیری‌ها
    const measure = el('div', {});
    this._measure = measure;
    measure.append(quantityTable(r), el('p', { class: 'insight' }, [r.insightFa]));

    // ۳) محاسبهٔ گام‌به‌گام
    const steps = el('div', {});
    this._steps = steps;
    steps.append(stepsList(explain(r)));

    // ۴) نمودار
    const chartCanvas = CHART_SPEC[id] ? el('canvas', { class: 'chart' }) : null;
    this._chart = chartCanvas;

    // ۵) ثبت
    const records = el('div', {});
    this._records = records;
    records.append(
      el('div', { class: 'row-end' }, [
        el('button', { class: 'btn btn-quiet', onclick: () => this.record() }, ['➕ ثبت اندازه‌گیری'])
      ]),
      logTable(this.state.log.slice(0, 15), () => { this.state.log = []; this.save(); this.renderSide(); })
    );

    side.replaceChildren(
      card('پارامترهای آزمایش', [labRow, controls]),
      card('اندازه‌گیری‌ها', [measure]),
      card('محاسبهٔ گام‌به‌گام', [steps], {
        collapsible: true, open: this.state.view.steps,
        onToggle: (v) => { this.state.view.steps = v; this.save(); }
      }),
      chartCanvas ? card(CHART_SPEC[id].title, [chartCanvas], {
        collapsible: true, open: this.state.view.chart,
        onToggle: (v) => { this.state.view.chart = v; this.save(); if (v) this.refreshChart(); }
      }) : null,
      card(`ثبت و مقایسه${this.state.log.length ? ` (${fa(this.state.log.length)})` : ''}`, [records], {
        collapsible: true, open: this.state.view.records,
        onToggle: (v) => { this.state.view.records = v; this.save(); }
      })
    );
    this.refreshChart();
  }

  /** فقط بخش‌های وابسته به عدد را تازه می‌کند تا لغزنده‌ها پرش نکنند */
  refreshResults() {
    const r = this.compute();
    if (this._measure) this._measure.replaceChildren(quantityTable(r), el('p', { class: 'insight' }, [r.insightFa]));
    if (this._steps) this._steps.replaceChildren(stepsList(explain(r)));
    this.refreshChart();
  }

  refreshChart() {
    if (this._chart && CHART_SPEC[this.machine] && !this._chart.closest('[hidden]')) {
      drawChart(this._chart, this.machine, resolveParams(this.machine, this.params), this.state.theme === 'dark');
    }
  }

  record() {
    const r = this.compute();
    const isGears = this.machine === 'GEARS';
    this.state.log.unshift({
      machineName: MACHINES[this.machine].short,
      setup: describeSetup(this.machine, resolveParams(this.machine, this.params), r),
      // برای چرخ‌دنده «نیرو» و «مسافت» معنا ندارد؛ به جای صفرِ گمراه‌کننده خالی می‌ماند
      effortN: isGears ? null : r.effortN,
      maActual: isGears ? r.ratio : r.maActual ?? null,
      effortDistanceM: isGears ? null : r.effortDistanceM,
      efficiencyPercent: Math.round((r.efficiency ?? 1) * 100),
      loadN: isGears ? null : r.loadN,
      workInJ: isGears ? null : r.workInJ,
      g: this.state.lab.g,
      ideal: this.state.lab.ideal
    });
    if (this.state.log.length > 60) this.state.log.length = 60;
    this.state.view.records = true;
    this.save();
    this.renderSide();
  }

  // ─────────── پنجره‌ها ───────────
  openModal(title, nodes) {
    this.dom.modalTitle.textContent = title;
    this.dom.modalBody.replaceChildren(...[].concat(nodes).filter(Boolean));
    this.dom.modal.hidden = false;
    this.dom.modal.querySelector('.modal-close').focus();
  }

  closeModal() { this.dom.modal.hidden = true; }

  openHelp() {
    this.openModal('راهنمای آموزگار', [
      el('h3', {}, ['این ابزار چه کاری می‌کند؟']),
      el('p', {}, ['هر ماشین ساده را با اعداد واقعی می‌سازید، آزمایش را اجرا می‌کنید و نتیجه را در سه سطح می‌بینید: نمای صحنه، جدول کمیت‌ها و محاسبهٔ گام‌به‌گام با فرمول. همهٔ اعداد از یک موتور فیزیک واحد می‌آیند؛ هیچ عددی دستی نوشته نشده است.']),
      el('h3', {}, ['پیشنهاد برای کلاس']),
      el('ul', {}, CLASSROOM_TIPS.map((t) => el('li', {}, [t]))),
      el('h3', {}, ['اهداف برنامهٔ درسی']),
      el('ul', {}, CURRICULUM.map((g) => el('li', {}, [el('b', {}, [`${g.title}: `]), g.text]))),
      el('h3', {}, ['میان‌برهای صفحه‌کلید']),
      el('p', { class: 'muted' }, ['فاصله = اجرای حرکت • R = بازنشانی • V = بردارهای نیرو • D = خط‌های اندازه • ۱ تا ۸ = انتخاب ماشین • Esc = بستن'])
    ]);
  }

  printReport() {
    const r = this.compute();
    const html = reportHTML({
      machineName: MACHINES[this.machine].name,
      setup: describeSetup(this.machine, resolveParams(this.machine, this.params), r),
      lab: this.state.lab,
      steps: explain(r),
      result: r,
      log: this.state.log
    });
    try {
      const frame = document.createElement('iframe');
      frame.setAttribute('title', 'گزارش آزمایش');
      frame.style.cssText = 'position:fixed;inset:auto 0 0 auto;width:0;height:0;border:0;opacity:0;';
      frame.srcdoc = html;
      frame.addEventListener('load', () => {
        try { frame.contentWindow.focus(); frame.contentWindow.print(); }
        catch { this.openReportWindow(html); }
        setTimeout(() => frame.remove(), 60000);
      }, { once: true });
      document.body.append(frame);
    } catch { this.openReportWindow(html); }
  }

  openReportWindow(html) {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }
}

const app = new App();
window.addEventListener('DOMContentLoaded', () => { app.init(); window.lab = app; });

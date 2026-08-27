// ═══ کارگاه ماشین‌های ساده — هماهنگ‌کنندهٔ اصلی برنامه ═══
import { fa, num, clamp, easeInOut } from './core/format.js';
import { solve, MACHINES, MACHINE_IDS, PULLERS } from './physics/machines.js';
import { capstone } from './physics/capstone.js';
import { MISSIONS, missionById } from './content/missions.js';
import { DEFAULT_PARAMS, MACHINE_CONTROLS, resolveParams, describeSetup, pullerOptions } from './content/controls.js';
import { CURRICULUM, CLASSROOM_TIPS, notebookHTML } from './content/curriculum.js';
import { Stage } from './render/stage.js';
import { el, card, buildControls, renderHud, measurementTable, drawChart, CHART_SPEC } from './ui/components.js';
import { sound } from './audio.js';

const SAVE_KEY = 'kargah_mashinhaye_sadeh_v2';
const RUN_SECONDS = 3.2;

class App {
  constructor() {
    this.state = {
      mode: 'MISSIONS',
      missionId: 'M1',
      labMachine: 'INCLINED_PLANE',
      missionParams: {},
      labParams: {},
      progress: { completed: [], discoveries: [], badges: [], predictions: {} },
      log: [],
      settings: {
        theme: 'light', contrast: 'normal', reducedMotion: false,
        captions: true, vectors: false, pullerId: 'ADULT',
        volumes: { master: 0.75, sfx: 0.8, ambient: 0.35 }
      }
    };

    this.t = 0;
    this.running = false;
    this.slowmo = false;
    this.hintStep = 0;
    this.lastResult = null;

    this.load();
    for (const m of MISSIONS) {
      if (!this.state.missionParams[m.id]) this.state.missionParams[m.id] = { ...m.params };
    }
    for (const id of MACHINE_IDS) {
      if (!this.state.labParams[id]) this.state.labParams[id] = { ...DEFAULT_PARAMS[id] };
    }
  }

  // ─────────── ذخیره‌سازی ───────────
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      this.state = {
        ...this.state, ...saved,
        progress: { ...this.state.progress, ...(saved.progress || {}) },
        settings: { ...this.state.settings, ...(saved.settings || {}) }
      };
    } catch { /* ذخیرهٔ خراب را نادیده بگیر */ }
  }

  save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); } catch { /* حافظه پر است */ }
  }

  // ─────────── وضعیت جاری ───────────
  get mission() { return missionById(this.state.missionId) || MISSIONS[0]; }

  get machine() {
    return this.state.mode === 'LAB' ? this.state.labMachine : this.mission.machine;
  }

  get params() {
    return this.state.mode === 'LAB'
      ? this.state.labParams[this.state.labMachine]
      : this.state.missionParams[this.state.missionId];
  }

  setParam(key, value) {
    const target = this.params;
    target[key] = value;
    if (this.state.mode === 'MISSIONS' && key === 'beamLengthM') {
      target.fulcrumM = Math.min(target.fulcrumM, value - 0.2);
    }
    this.reset(false);
    this.refreshControls();
    this.save();
  }

  compute() {
    const machine = this.machine;
    const p = resolveParams(machine, {
      ...this.params,
      pullerId: this.params.pullerId || this.state.settings.pullerId
    });
    return machine === 'CAPSTONE' ? capstone(p) : solve(machine, p);
  }

  goalPassed(result) {
    const m = this.state.mode === 'MISSIONS' ? this.mission : null;
    if (m && m.goalTest) return m.goalTest(result);
    return !!result.feasible;
  }

  // ─────────── راه‌اندازی ───────────
  init() {
    this.dom = {
      body: document.body,
      toolbar: document.getElementById('stageToolbar'),
      canvas: document.getElementById('stageCanvas'),
      hud: document.getElementById('hud'),
      side: document.getElementById('sidepanel'),
      captions: document.getElementById('captions'),
      verdict: document.getElementById('verdict'),
      btnRun: document.getElementById('btnRun'),
      btnRunText: document.getElementById('btnRunText'),
      btnReset: document.getElementById('btnReset'),
      btnVectors: document.getElementById('btnVectors'),
      btnSlowmo: document.getElementById('btnSlowmo'),
      modal: document.getElementById('modal'),
      modalTitle: document.getElementById('modalTitle'),
      modalBody: document.getElementById('modalBody'),
      discoveryCount: document.getElementById('discoveryCount'),
      tabs: [...document.querySelectorAll('.tab')]
    };

    this.stage = new Stage(this.dom.canvas);
    this.stage.getState = () => this.viewState();
    this.stage.onHandleChange = (id, value) => this.onHandleDrag(id, value);

    this.applySettings();
    this.bindEvents();
    this.stage.resize();
    this.stage.start();
    this.renderAll();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.stage.render());
    }
    window.addEventListener('resize', () => this.stage.resize());
  }

  viewState() {
    const result = this.compute();
    this.lastResult = result;
    return {
      machine: this.machine,
      state: result,
      t: this.t,
      showVectors: this.state.settings.vectors,
      interactive: !this.running
    };
  }

  onHandleDrag(id, value) {
    const p = this.params;
    if (id === 'fulcrum' && 'fulcrumM' in p) {
      const def = MACHINE_CONTROLS.LEVER.find((c) => c.key === 'fulcrumM');
      p.fulcrumM = Math.round(clamp(value, Math.max(def.min, p.loadM + 0.1), p.beamLengthM - 0.2) * 10) / 10;
    } else if (id === 'rampLength' && 'lengthM' in p) {
      const def = MACHINE_CONTROLS.INCLINED_PLANE.find((c) => c.key === 'lengthM');
      p.lengthM = Math.round(clamp(value, Math.max(def.min, p.heightM * 1.05), def.max) * 4) / 4;
    } else return;
    this.reset(false);
    this.refreshControls();
    this.save();
  }

  applySettings() {
    const s = this.state.settings;
    document.documentElement.dataset.theme = s.theme;
    document.documentElement.dataset.contrast = s.contrast;
    this.stage.setTheme(s.contrast === 'high' ? 'light' : s.theme);
    this.stage.reducedMotion = s.reducedMotion;
    sound.captionsEnabled = s.captions;
    sound.setVolumes(s.volumes);
    this.dom.btnVectors.setAttribute('aria-pressed', s.vectors ? 'true' : 'false');
  }

  // ─────────── رویدادها ───────────
  bindEvents() {
    const d = this.dom;

    for (const tab of d.tabs) {
      tab.addEventListener('click', () => this.setMode(tab.dataset.mode));
    }
    d.btnRun.addEventListener('click', () => this.run());
    d.btnReset.addEventListener('click', () => this.reset(true));
    d.btnVectors.addEventListener('click', () => {
      this.state.settings.vectors = !this.state.settings.vectors;
      d.btnVectors.setAttribute('aria-pressed', this.state.settings.vectors ? 'true' : 'false');
      sound.playClick();
      this.save();
    });
    d.btnSlowmo.addEventListener('click', () => {
      this.slowmo = !this.slowmo;
      d.btnSlowmo.setAttribute('aria-pressed', this.slowmo ? 'true' : 'false');
      sound.playClick();
    });

    document.getElementById('btnProgress').addEventListener('click', () => this.openProgress());
    document.getElementById('btnTeacher').addEventListener('click', () => this.openTeacher());
    document.getElementById('btnSettings').addEventListener('click', () => this.openSettings());

    d.modal.querySelectorAll('[data-close]').forEach((n) =>
      n.addEventListener('click', () => this.closeModal()));

    sound.setCaptionCallback(({ text, icon }) => this.showCaption(`${icon} ${text}`));
    document.body.addEventListener('pointerdown', () => sound.resume(), { once: true });

    window.addEventListener('keydown', (e) => this.onKey(e));
  }

  onKey(e) {
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
    if (e.key === 'Escape') { this.closeModal(); return; }
    if (typing) return;
    const k = e.key.toLowerCase();
    if (e.code === 'Space') { e.preventDefault(); this.run(); }
    else if (k === 'r' || k === 'ق') this.reset(true);
    else if (k === 'h' || k === 'ا') this.nextHint();
    else if (k === 'v' || k === 'و') this.dom.btnVectors.click();
    else if (k === 'm' || k === 'پ') sound.toggleMute();
    else if (/^[1-9]$/.test(e.key)) {
      const idx = Number(e.key) - 1;
      if (this.state.mode === 'MISSIONS' && MISSIONS[idx]) this.goMission(MISSIONS[idx].id);
      else if (MACHINE_IDS[idx]) this.goMachine(MACHINE_IDS[idx]);
    }
  }

  // ─────────── ناوبری ───────────
  setMode(mode) {
    if (this.state.mode === mode) return;
    this.state.mode = mode;
    for (const tab of this.dom.tabs) {
      const on = tab.dataset.mode === mode;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    }
    this.reset(false);
    this.hintStep = 0;
    sound.playClick();
    this.renderAll();
    this.save();
  }

  goMission(id) {
    this.state.missionId = id;
    this.hintStep = 0;
    this.reset(false);
    sound.playClick();
    this.renderAll();
    this.save();
  }

  goMachine(id) {
    this.state.labMachine = id;
    this.reset(false);
    sound.playClick();
    this.renderAll();
    this.save();
  }

  // ─────────── اجرای آزمایش ───────────
  run() {
    if (this.running) return;
    const result = this.compute();
    const ok = this.goalPassed(result);

    this.running = true;
    this.t = 0;
    this.hideVerdict();
    this.dom.btnRun.disabled = true;
    this.dom.btnRunText.textContent = 'در حال آزمایش…';

    if (this.machine === 'FRICTION' && result.useRollers) sound.playRollingSound();
    else if (this.machine === 'PULLEY') sound.playPulleyWhir();
    else if (!ok) sound.playHeavyGrind();
    else sound.playRopeTension();

    const limit = ok ? 1 : 0.22;
    const duration = (this.slowmo ? RUN_SECONDS * 2.6 : RUN_SECONDS) * (ok ? 1 : 0.55);
    const start = performance.now();

    const step = (now) => {
      const raw = clamp((now - start) / (duration * 1000), 0, 1);
      this.t = easeInOut(raw) * limit;
      if (raw < 1) {
        this._raf = requestAnimationFrame(step);
      } else {
        this.running = false;
        this.dom.btnRun.disabled = false;
        ok ? this.onSuccess(result) : this.onFailure(result);
      }
    };
    this._raf = requestAnimationFrame(step);
  }

  reset(playSound = true) {
    if (this._raf) cancelAnimationFrame(this._raf);
    this.running = false;
    this.t = 0;
    this.hideVerdict();
    if (this.dom) {
      this.dom.btnRun.disabled = false;
      this.dom.btnRunText.textContent = 'آزمایش کن';
    }
    if (playSound) sound.playClick();
  }

  onSuccess(result) {
    this.dom.btnRunText.textContent = 'دوباره آزمایش کن';
    this.showVerdict(true, this.successText(result));
    sound.playDiscoveryJingle();
    this.stage.celebrate(this.stage.w * 0.5, this.stage.h * 0.45);
    this.recordExperiment(result, true);

    if (this.state.mode === 'MISSIONS') {
      const m = this.mission;
      if (!this.state.progress.completed.includes(m.id)) {
        this.state.progress.completed.push(m.id);
      }
      if (!this.state.progress.discoveries.some((d) => d.id === m.discovery.id)) {
        this.state.progress.discoveries.push({ ...m.discovery, missionId: m.id });
        setTimeout(() => this.openDiscovery(m, result), 700);
      }
      if (result.badges) {
        for (const b of result.badges) {
          if (!this.state.progress.badges.some((x) => x.id === b.id)) this.state.progress.badges.push(b);
        }
      }
      this.renderToolbar();
      this.updateDiscoveryCount();
    }
    this.save();
  }

  onFailure(result) {
    this.dom.btnRunText.textContent = 'دوباره آزمایش کن';
    this.showVerdict(false, this.failureText(result));
    sound.playHeavyGrind();
    this.recordExperiment(result, false);
    this.save();
  }

  successText(r) {
    if (r.machine === 'CAPSTONE') return 'محموله سالم به درمانگاه رسید! طرح مهندسی تو جواب داد.';
    if (r.machine === 'GEARS') return `گشتاور خروجی به ${fa(r.outputTorqueNm)} نیوتون‌متر رسید — آسیاب می‌چرخد!`;
    return `آفرین! با ${fa(num(r.effortN, 0))} نیوتون کار انجام شد؛ توان ${r.puller.name} ${fa(r.humanLimitN)} نیوتون است.`;
  }

  failureText(r) {
    if (r.machine === 'CAPSTONE') return r.insightFa;
    if (r.machine === 'GEARS') return `گشتاور خروجی فقط ${fa(r.outputTorqueNm)} نیوتون‌متر است؛ هنوز کافی نیست.`;
    return `${fa(num(r.effortN, 0))} نیوتون لازم است، ولی ${r.puller.name} بیشتر از ${fa(r.humanLimitN)} نیوتون نمی‌تواند. طرح را عوض کن!`;
  }

  recordExperiment(result, success) {
    const machineId = this.machine;
    const p = resolveParams(machineId, this.params);
    this.state.log.unshift({
      machine: machineId,
      machineName: machineId === 'CAPSTONE' ? 'مأموریت پایانی' : MACHINES[machineId].name,
      setup: describeSetup(machineId, p, result),
      effortN: result.effortN ?? result.maxForceN ?? 0,
      effortDistanceM: result.effortDistanceM ?? 0,
      workInJ: result.workInJ ?? result.totalWorkJ ?? 0,
      success,
      at: new Date().toLocaleTimeString('fa-IR')
    });
    if (this.state.log.length > 40) this.state.log.length = 40;
  }

  // ─────────── نمایش‌ها ───────────
  showCaption(text) {
    if (!this.state.settings.captions) return;
    const c = this.dom.captions;
    c.textContent = text;
    c.classList.add('is-on');
    clearTimeout(this._captionTimer);
    this._captionTimer = setTimeout(() => c.classList.remove('is-on'), 2200);
  }

  showVerdict(ok, text) {
    const v = this.dom.verdict;
    v.className = `verdict is-on ${ok ? 'v-ok' : 'v-bad'}`;
    v.textContent = `${ok ? '✅' : '⚠️'} ${text}`;
  }

  hideVerdict() {
    if (this.dom) this.dom.verdict.className = 'verdict';
  }

  renderAll() {
    this.renderToolbar();
    this.renderSide();
    this.updateHud();
    this.updateDiscoveryCount();
    this.dom.canvas.setAttribute('aria-label', this.canvasDescription());
  }

  canvasDescription() {
    const r = this.compute();
    const name = this.machine === 'CAPSTONE' ? 'مأموریت پایانی' : MACHINES[this.machine].name;
    if (this.machine === 'GEARS') {
      return `نمای ${name}: نسبت دنده ${fa(r.ratio)}، گشتاور خروجی ${fa(r.outputTorqueNm)} نیوتون‌متر.`;
    }
    return `نمای ${name}: نیروی لازم ${fa(num(r.effortN ?? r.maxForceN, 0))} نیوتون، ${this.goalPassed(r) ? 'در توان' : 'بیش از توان'} ${r.puller.name}.`;
  }

  updateHud() {
    renderHud(this.dom.hud, this.compute());
    this.dom.canvas.setAttribute('aria-label', this.canvasDescription());
  }

  updateDiscoveryCount() {
    this.dom.discoveryCount.textContent = fa(this.state.progress.discoveries.length);
  }

  renderToolbar() {
    const bar = this.dom.toolbar;
    bar.replaceChildren();
    if (this.state.mode === 'MISSIONS') {
      MISSIONS.forEach((m, i) => {
        const done = this.state.progress.completed.includes(m.id);
        const active = m.id === this.state.missionId;
        bar.append(el('button', {
          class: `chip${active ? ' is-active' : ''}${done ? ' is-done' : ''}`,
          type: 'button',
          'aria-current': active ? 'step' : null,
          onclick: () => this.goMission(m.id)
        }, [
          el('span', { class: 'chip-num', 'aria-hidden': 'true' }, [done ? '✓' : fa(i + 1)]),
          el('span', {}, [m.title])
        ]));
      });
    } else {
      for (const id of MACHINE_IDS) {
        const active = id === this.state.labMachine;
        bar.append(el('button', {
          class: `chip${active ? ' is-active' : ''}`,
          type: 'button',
          onclick: () => this.goMachine(id)
        }, [
          el('span', { 'aria-hidden': 'true' }, [MACHINES[id].icon]),
          el('span', {}, [MACHINES[id].short])
        ]));
      }
    }
  }

  refreshControls() {
    this.updateHud();
    if (this._controlsHost) {
      this._controlsHost.replaceChildren(
        buildControls(this.machine, this.params, (k, v) => this.setParam(k, v), this._controlKeys)
      );
    }
    this.refreshChart();
  }

  refreshChart() {
    if (this._chartCanvas && CHART_SPEC[this.machine]) {
      drawChart(this._chartCanvas, this.machine, resolveParams(this.machine, this.params), this.state.settings.theme);
    }
  }

  renderSide() {
    const side = this.dom.side;
    side.replaceChildren();
    this._controlsHost = null;
    this._chartCanvas = null;
    if (this.state.mode === 'MISSIONS') this.renderMissionSide(side);
    else this.renderLabSide(side);
    this.refreshChart();
  }

  // ─────────── پنل مأموریت ───────────
  renderMissionSide(side) {
    const m = this.mission;
    const picked = this.state.progress.predictions[m.id];

    side.append(el('section', { class: 'card story' }, [
      el('div', { class: 'avatar', 'aria-hidden': 'true' }, [m.story.avatar]),
      el('div', {}, [
        el('h3', {}, [m.story.who]),
        el('p', {}, [m.story.text]),
        el('p', { class: 'goal' }, [`🎯 هدف: ${m.goalText || m.story.goal}`])
      ])
    ]));

    // پیش‌بینی
    const optionsWrap = el('div', { class: 'options' });
    const feedback = el('p', { class: 'feedback', hidden: picked === undefined });
    const paint = () => {
      optionsWrap.replaceChildren();
      m.prediction.options.forEach((opt, i) => {
        let cls = 'option';
        if (picked !== undefined) {
          if (i === picked) cls += opt.correct ? ' is-right' : ' is-wrong';
          else if (opt.correct) cls += ' is-right';
        }
        optionsWrap.append(el('button', {
          class: cls, type: 'button', disabled: picked !== undefined,
          onclick: () => {
            this.state.progress.predictions[m.id] = i;
            sound.playSnap();
            this.save();
            this.renderMissionSideRefresh();
          }
        }, [
          el('span', { class: 'mark', 'aria-hidden': 'true' }, [
            picked === undefined ? ['الف', 'ب', 'پ'][i] : (opt.correct ? '✓' : (i === picked ? '✕' : ''))
          ]),
          el('span', {}, [opt.text])
        ]));
      });
      if (picked !== undefined) {
        feedback.hidden = false;
        feedback.textContent = m.prediction.options[picked].feedback;
      }
    };
    paint();

    side.append(card('اول پیش‌بینی کن، بعد آزمایش', '🤔', [
      el('p', { class: 'q' }, [m.prediction.question]),
      optionsWrap,
      feedback
    ], 'quiz'));

    // ابزارها
    const host = el('div', {});
    this._controlsHost = host;
    this._controlKeys = m.controls;
    host.append(buildControls(m.machine, this.params, (k, v) => this.setParam(k, v), m.controls));
    side.append(card('ابزارهای کارگاه', '🛠️', [host]));

    // نمودار
    if (CHART_SPEC[m.machine]) {
      const cv = el('canvas', { class: 'chart' });
      this._chartCanvas = cv;
      side.append(card(CHART_SPEC[m.machine].title, '📈', [
        cv, el('p', { class: 'card-note' }, ['نقطهٔ نارنجی، تنظیم فعلی توست.'])
      ]));
    }

    // راهنمایی
    const hintBox = el('div', { class: 'hint' }, [
      el('span', { 'aria-hidden': 'true' }, ['💡']),
      el('span', { id: 'hintText' }, ['اگر گیر کردی، راهنمایی بگیر — سه پله راهنمایی داریم.'])
    ]);
    this._hintText = hintBox.querySelector('#hintText');
    side.append(card('راهنمایی پله‌پله', '💡', [
      hintBox,
      el('div', { style: 'display:flex;gap:8px;margin-top:10px' }, [
        el('button', { class: 'btn btn-ghost', style: 'flex:1', onclick: () => this.nextHint() }, ['راهنمایی بعدی']),
        el('button', { class: 'btn btn-ghost', style: 'flex:1', onclick: () => this.openDiscovery(m, this.compute(), true) }, ['کارت علمی این درس'])
      ])
    ]));
  }

  renderMissionSideRefresh() {
    const scroll = this.dom.side.scrollTop;
    this.renderSide();
    this.dom.side.scrollTop = scroll;
  }

  nextHint() {
    const m = this.mission;
    if (this.state.mode !== 'MISSIONS' || !this._hintText) return;
    this.hintStep = (this.hintStep % m.hints.length) + 1;
    this._hintText.textContent = `پلهٔ ${fa(this.hintStep)} از ${fa(m.hints.length)}: ${m.hints[this.hintStep - 1]}`;
    sound.playClick();
  }

  // ─────────── پنل آزمایشگاه ───────────
  renderLabSide(side) {
    const id = this.state.labMachine;
    const machine = MACHINES[id];

    side.append(el('section', { class: 'card story', style: 'background:var(--violet-soft);border-color:color-mix(in srgb,var(--violet) 30%,transparent)' }, [
      el('div', { class: 'avatar', 'aria-hidden': 'true' }, [machine.icon]),
      el('div', {}, [
        el('h3', { style: 'color:var(--violet)' }, [machine.name]),
        el('p', {}, [this.compute().insightFa])
      ])
    ]));

    const host = el('div', {});
    this._controlsHost = host;
    this._controlKeys = null;
    host.append(buildControls(id, this.params, (k, v) => this.setParam(k, v), null));
    side.append(card('تنظیم آزادِ همهٔ متغیرها', '🎛️', [
      host,
      id === 'GEARS' ? null : el('div', { class: 'field' }, [
        el('p', { class: 'field-label' }, [el('span', {}, ['چه کسی نیرو را وارد می‌کند؟'])]),
        el('div', { class: 'segment' }, pullerOptions().map((o) => el('button', {
          class: `seg${this.state.settings.pullerId === o.value ? ' is-active' : ''}`,
          type: 'button',
          onclick: () => {
            this.state.settings.pullerId = o.value;
            this.reset(false);
            this.renderSide();
            this.updateHud();
            this.save();
          }
        }, [
          el('span', { class: 'seg-icon', 'aria-hidden': 'true' }, [o.icon]),
          el('span', {}, [o.label]),
          el('span', { class: 'seg-sub' }, [o.sub])
        ])))
      ])
    ]));

    if (CHART_SPEC[id]) {
      const cv = el('canvas', { class: 'chart' });
      this._chartCanvas = cv;
      side.append(card(CHART_SPEC[id].title, '📈', [cv]));
    }

    side.append(card('جدول اندازه‌گیری', '📋', [
      el('div', { style: 'display:flex;gap:8px;margin-bottom:10px' }, [
        el('button', {
          class: 'btn btn-primary', style: 'flex:1;font-size:.86rem;padding:9px 14px',
          onclick: () => {
            this.recordExperiment(this.compute(), this.goalPassed(this.compute()));
            sound.playSnap();
            this.save();
            this.renderSide();
          }
        }, ['➕ ثبت در جدول'])
      ]),
      measurementTable(this.state.log.slice(0, 12), () => {
        this.state.log = [];
        this.save();
        this.renderSide();
      })
    ]));

    side.append(card('نکتهٔ علمی', '🔍', [
      el('p', { class: 'card-note' }, [
        'یادت باشد: هیچ ماشین ساده‌ای مقدارِ «کار» را کم نمی‌کند. هر بار که نیرو کم می‌شود، مسافت زیاد می‌شود. ',
        'فقط بخشی از انرژی صرف اصطکاک می‌شود و بازده را از ۱۰۰٪ کمتر می‌کند.'
      ])
    ]));
  }

  // ─────────── مودال‌ها ───────────
  openModal(title, nodes) {
    this.dom.modalTitle.textContent = title;
    this.dom.modalBody.replaceChildren(...[].concat(nodes));
    this.dom.modal.hidden = false;
    this.dom.modal.querySelector('.modal-close').focus();
  }

  closeModal() { this.dom.modal.hidden = true; }

  openDiscovery(mission, result, quiet = false) {
    const d = mission.discovery;
    if (!quiet) sound.playGentleFanfare();
    const badges = (result && result.badges) || [];
    const nextIdx = MISSIONS.findIndex((m) => m.id === mission.id) + 1;
    this.openModal('کارت کشف علمی', [
      el('div', { class: 'discovery' }, [
        el('span', { class: 'd-icon', 'aria-hidden': 'true' }, [d.icon]),
        el('h3', {}, [d.title]),
        el('p', { class: 'd-topic' }, [`موضوع: ${d.topic}`]),
        el('p', {}, [d.summary]),
        d.formula ? el('p', { class: 'formula' }, [d.formula]) : null
      ]),
      badges.length ? el('div', { class: 'badges' }, badges.map((b) =>
        el('span', { class: 'badge' }, [`${b.icon} ${b.title}`]))) : null,
      el('div', { class: 'modal-actions' }, [
        nextIdx < MISSIONS.length
          ? el('button', {
            class: 'btn btn-primary',
            onclick: () => { this.closeModal(); this.goMission(MISSIONS[nextIdx].id); }
          }, ['مأموریت بعدی 🚀'])
          : el('button', { class: 'btn btn-primary', onclick: () => this.closeModal() }, ['عالی بود! 🎉']),
        el('button', { class: 'btn btn-ghost', onclick: () => this.closeModal() }, ['بستن'])
      ])
    ]);
  }

  openProgress() {
    sound.playClick();
    const found = this.state.progress.discoveries;
    const cards = MISSIONS.map((m) => {
      const has = found.some((d) => d.id === m.discovery.id);
      return el('div', { class: `mini-card${has ? '' : ' is-locked'}` }, [
        el('span', { class: 'm-icon', 'aria-hidden': 'true' }, [has ? m.discovery.icon : '🔒']),
        el('div', {}, [
          el('h4', {}, [has ? m.discovery.title : 'هنوز باز نشده']),
          el('p', {}, [has ? m.discovery.summary : `مأموریت «${m.title}» را کامل کن.`])
        ])
      ]);
    });
    this.openModal('کارت‌های کشف و نشان‌ها', [
      el('p', {}, [`تا اینجا ${fa(found.length)} کارت از ${fa(MISSIONS.length)} کارت علمی را باز کرده‌ای.`]),
      el('div', { class: 'grid-cards' }, cards),
      this.state.progress.badges.length
        ? el('div', {}, [
          el('h3', {}, ['نشان‌های مهندسی']),
          el('div', { class: 'badges' }, this.state.progress.badges.map((b) =>
            el('span', { class: 'badge' }, [`${b.icon} ${b.title}`])))
        ])
        : el('p', { class: 'card-note' }, ['نشان‌های مهندسی در مأموریت پایانی به دست می‌آیند.'])
    ]);
  }

  openTeacher() {
    sound.playClick();
    this.openModal('راهنمای آموزگار و اولیا', [
      el('h3', {}, ['اهداف برنامهٔ درسی']),
      el('ul', {}, CURRICULUM.map((g) => el('li', {}, [el('b', {}, [`${g.title}: `]), g.text]))),
      el('h3', {}, ['پیشنهادهای کلاسی']),
      el('ul', {}, CLASSROOM_TIPS.map((t) => el('li', {}, [t]))),
      el('h3', {}, [`کارنامهٔ دانش‌آموز (${fa(this.state.progress.completed.length)} مأموریت از ${fa(MISSIONS.length)})`]),
      measurementTable(this.state.log.slice(0, 10), () => { this.state.log = []; this.save(); this.openTeacher(); }),
      el('div', { class: 'modal-actions' }, [
        el('button', { class: 'btn btn-primary', onclick: () => this.printNotebook() }, ['🖨 دفترچهٔ مخترع (چاپ / PDF)'])
      ])
    ]);
  }

  printNotebook() {
    const html = notebookHTML({
      rows: this.state.log,
      discoveries: this.state.progress.discoveries,
      badges: this.state.progress.badges
    });
    const win = window.open('', '_blank');
    if (!win) { this.showCaption('⚠️ مرورگر پنجرهٔ چاپ را بست؛ اجازهٔ باز شدن پنجره را بدهید.'); return; }
    win.document.write(html);
    win.document.close();
  }

  openSettings() {
    sound.playClick();
    const s = this.state.settings;
    const themeBtn = (value, labelText, icon) => el('button', {
      class: `seg${(value === 'high' ? s.contrast === 'high' : s.contrast !== 'high' && s.theme === value) ? ' is-active' : ''}`,
      type: 'button',
      onclick: () => {
        if (value === 'high') { s.contrast = 'high'; }
        else { s.contrast = 'normal'; s.theme = value; }
        this.applySettings();
        this.save();
        this.openSettings();
        this.refreshChart();
      }
    }, [el('span', { class: 'seg-icon', 'aria-hidden': 'true' }, [icon]), el('span', {}, [labelText])]);

    const toggle = (labelText, subText, key, onToggle) => {
      const input = el('input', {
        type: 'checkbox', checked: !!s[key],
        onchange: (e) => { s[key] = e.target.checked; (onToggle || (() => {}))(); this.applySettings(); this.save(); }
      });
      return el('label', { class: 'switch', style: 'width:100%' }, [
        input, el('span', { class: 'track', 'aria-hidden': 'true' }),
        el('span', {}, [labelText, subText ? el('span', { class: 'switch-sub' }, [subText]) : null])
      ]);
    };

    const volume = (labelText, key) => {
      const input = el('input', {
        type: 'range', min: 0, max: 1, step: 0.05, value: s.volumes[key],
        oninput: (e) => { s.volumes[key] = Number(e.target.value); sound.setVolumes(s.volumes); this.save(); }
      });
      input.style.setProperty('--fill', `${s.volumes[key] * 100}%`);
      input.addEventListener('input', () => input.style.setProperty('--fill', `${Number(input.value) * 100}%`));
      return el('div', { class: 'field' }, [el('p', { class: 'field-label' }, [el('span', {}, [labelText])]), input]);
    };

    this.openModal('تنظیمات و دسترسی‌پذیری', [
      el('h3', {}, ['ظاهر برنامه']),
      el('div', { class: 'segment' }, [
        themeBtn('light', 'روشن', '☀️'),
        themeBtn('dark', 'تیره', '🌙'),
        themeBtn('high', 'کنتراست بالا', '🔳')
      ]),
      el('h3', {}, ['دسترسی‌پذیری']),
      el('div', { style: 'display:flex;flex-direction:column;gap:8px' }, [
        toggle('کاهش انیمیشن و ذرات متحرک', 'برای دانش‌آموزانی که به حرکت حساس‌اند', 'reducedMotion'),
        toggle('نمایش زیرنویس صداها', 'متن هر صدا روی صحنه نوشته می‌شود', 'captions'),
        toggle('نمایش همیشگی بردارهای نیرو', 'وزن، اصطکاک، تکیه‌گاه و نیروی دست', 'vectors', () => {
          this.dom.btnVectors.setAttribute('aria-pressed', s.vectors ? 'true' : 'false');
        })
      ]),
      el('h3', {}, ['صدا']),
      volume('صدای کلی', 'master'),
      volume('جلوه‌های صوتی', 'sfx'),
      volume('صدای کوهستان', 'ambient'),
      el('h3', {}, ['میان‌برهای صفحه‌کلید']),
      el('p', { class: 'card-note' }, ['فاصله = آزمایش • R = از نو • H = راهنمایی • V = بردارها • M = بی‌صدا • ۱ تا ۹ = رفتن به مأموریت/ماشین • Esc = بستن پنجره']),
      el('div', { class: 'modal-actions' }, [
        el('button', {
          class: 'btn btn-ghost',
          onclick: () => {
            if (!confirm('همهٔ پیشرفت، کارت‌های کشف و جدول اندازه‌گیری پاک شود؟')) return;
            localStorage.removeItem(SAVE_KEY);
            location.reload();
          }
        }, ['♻️ پاک کردن همهٔ پیشرفت'])
      ])
    ]);
  }
}

const app = new App();
window.addEventListener('DOMContentLoaded', () => {
  app.init();
  window.kargah = app;
});

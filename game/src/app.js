// Main Application Orchestrator for Rescue the Mountain Cargo («نجات بار از کوه»)

import { sound } from './audio.js';
import { physics, toPersianDigits, SURFACES, PULLEY_TYPES } from './physics.js';
import { MISSIONS } from './missions.js';
import { CanvasRenderer } from './canvas-renderer.js';
import { FreeLabManager, CURIOSITY_CARDS } from './free-lab.js';
import { teacher, CURRICULUM_GOALS } from './teacher-mode.js';

class RescueCargoGame {
  constructor() {
    this.currentMissionIndex = 0; // 0 to 4
    this.isFreeLabMode = false;
    this.freeLab = new FreeLabManager();

    // Player state per mission
    this.userState = {
      // Mission 1
      m1_surface: 'ROUGH_STONE',
      m1_rollers: false,
      // Mission 2
      m2_rampLength: 2.5,
      m2_surface: 'WOOD_PLANKS',
      m2_rollers: false,
      // Mission 3
      m3_beamLength: 3.0,
      m3_fulcrum: 2.2, // starts too far from load
      // Mission 4
      m4_pulley: 'FIXED',
      // Mission 5 (Capstone)
      m5_rampLength: 4.5,
      m5_rollers: true,
      m5_bridgeBeams: 2,
      m5_pulley: 'MOVABLE',

      completedMissions: [],
      unlockedDiscoveries: [],
      earnedBadges: [],
      highContrast: false,
      reducedMotion: false,
      captions: true
    };

    this.simSpeed = 1.0;
    this.isTesting = false;
    this.simProgress = 0.0;
    this.animFrameId = null;
    this.selectedPrediction = null;
    this.currentHintStep = 0;

    this.loadSavedProgress();
  }

  loadSavedProgress() {
    try {
      const saved = localStorage.getItem('rescue_mountain_cargo_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.userState = { ...this.userState, ...parsed };
      }
    } catch (e) {}
  }

  saveProgress() {
    try {
      localStorage.setItem('rescue_mountain_cargo_save', JSON.stringify(this.userState));
    } catch (e) {}
  }

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new CanvasRenderer(this.canvas);
    this.renderer.reducedMotion = this.userState.reducedMotion;

    // Window resize
    window.addEventListener('resize', () => {
      this.renderer.resize();
      this.render();
    });
    this.renderer.resize();

    // Setup sound captions
    const captionEl = document.getElementById('soundCaptions');
    sound.setCaptionCallback(({ text, icon }) => {
      if (!this.userState.captions) return;
      captionEl.innerHTML = `<span>${icon}</span> <span>${text}</span>`;
      captionEl.classList.add('visible');
      clearTimeout(this.captionTimer);
      this.captionTimer = setTimeout(() => {
        captionEl.classList.remove('visible');
      }, 2200);
    });

    // Apply saved accessibility preferences
    if (this.userState.highContrast) {
      document.body.classList.add('high-contrast');
    }

    this.bindEvents();
    this.bindKeyboardShortcuts();
    this.renderMissionTracker();
    this.loadMissionUI(this.currentMissionIndex);
    this.startRenderLoop();
  }

  bindEvents() {
    // Top Bar Buttons
    document.getElementById('btnTeacherMode').addEventListener('click', () => this.openTeacherModal());
    document.getElementById('btnDiscoveries').addEventListener('click', () => this.openDiscoveriesModal());
    document.getElementById('btnFreeLab').addEventListener('click', () => this.toggleFreeLabMode());
    document.getElementById('btnSettings').addEventListener('click', () => this.openSettingsModal());

    // Test & Reset Buttons
    document.getElementById('btnRunTest').addEventListener('click', () => this.startTest());
    document.getElementById('btnResetTest').addEventListener('click', () => this.resetTest());
    document.getElementById('btnSlowMo').addEventListener('click', () => this.toggleSlowMo());
    document.getElementById('btnHint').addEventListener('click', () => this.showNextHint());

    // Modal Close buttons
    document.querySelectorAll('.btn-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el || e.target.classList.contains('btn-close')) {
          this.closeAllModals();
        }
      });
    });

    // Audio start on first interaction
    document.body.addEventListener('click', () => {
      sound.startMountainAmbience();
    }, { once: true });
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Space or Enter: Start Test if not in modal
      if ((e.code === 'Space' || e.code === 'Enter') && !document.querySelector('.modal-backdrop:not(.hidden)')) {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          this.startTest();
        }
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'ق') {
        this.resetTest();
      } else if (e.key === 'h' || e.key === 'H' || e.key === 'ا') {
        this.showNextHint();
      } else if (e.key === 'm' || e.key === 'M' || e.key === 'پ') {
        sound.toggleMute();
      } else if (e.key === 'Escape') {
        this.closeAllModals();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const mIdx = parseInt(e.key, 10) - 1;
        this.switchMission(mIdx);
      }
    });
  }

  startRenderLoop() {
    const loop = () => {
      this.updateSimulationStep();
      const currentState = this.getCurrentSimulationState();
      this.renderer.render(currentState);
      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  getCurrentSimulationState() {
    if (this.isFreeLabMode) {
      const freeState = this.freeLab.calculateCurrentState();
      return {
        ...freeState,
        missionId: 'FREE_LAB',
        isTesting: this.isTesting
      };
    }

    const mission = MISSIONS[this.currentMissionIndex];
    const s = this.userState;

    if (mission.id === 1) {
      const res = physics.calculateFlatDrag({
        cargoMassKg: mission.cargoMassKg,
        surfaceType: s.m1_surface,
        hasRollers: s.m1_rollers
      });
      return {
        missionId: 1,
        workbenchType: 'FLAT_DRAG',
        cargoMassKg: mission.cargoMassKg,
        selectedSurface: s.m1_surface,
        hasRollers: s.m1_rollers,
        isTesting: this.isTesting,
        ...res
      };
    } else if (mission.id === 2) {
      const res = physics.calculateInclinedPlane({
        cargoMassKg: mission.cargoMassKg,
        heightM: mission.heightM,
        rampLengthM: s.m2_rampLength,
        surfaceType: s.m2_surface,
        hasRollers: s.m2_rollers
      });
      return {
        missionId: 2,
        workbenchType: 'INCLINED_PLANE',
        cargoMassKg: mission.cargoMassKg,
        rampLengthM: s.m2_rampLength,
        selectedSurface: s.m2_surface,
        hasRollers: s.m2_rollers,
        isTesting: this.isTesting,
        ...res
      };
    } else if (mission.id === 3) {
      const res = physics.calculateLever({
        cargoMassKg: mission.cargoMassKg,
        totalBeamLengthM: s.m3_beamLength,
        fulcrumPosM: s.m3_fulcrum,
        loadPosM: 0.3,
        effortPosM: s.m3_beamLength
      });
      return {
        missionId: 3,
        workbenchType: 'LEVER',
        cargoMassKg: mission.cargoMassKg,
        beamLengthM: s.m3_beamLength,
        fulcrumPosM: s.m3_fulcrum,
        isTesting: this.isTesting,
        ...res
      };
    } else if (mission.id === 4) {
      const res = physics.calculatePulley({
        cargoMassKg: mission.cargoMassKg,
        liftHeightM: mission.liftHeightM,
        pulleyTypeId: s.m4_pulley
      });
      return {
        missionId: 4,
        workbenchType: 'PULLEY',
        cargoMassKg: mission.cargoMassKg,
        selectedPulley: s.m4_pulley,
        isTesting: this.isTesting,
        ...res
      };
    } else if (mission.id === 5) {
      const res = physics.calculateCapstone({
        cargoMassKg: mission.cargoMassKg,
        stage1RampLength: s.m5_rampLength,
        stage1UseRollers: s.m5_rollers,
        stage2BridgeBeamCount: s.m5_bridgeBeams,
        stage3PulleyType: s.m5_pulley,
        materialsUsedCount: (s.m5_rollers ? 2 : 1) + s.m5_bridgeBeams + (s.m5_pulley === 'COMPOUND_2' ? 3 : 2),
        materialsBudgetMax: 8
      });
      return {
        missionId: 5,
        workbenchType: 'CAPSTONE',
        cargoMassKg: mission.cargoMassKg,
        stage1RampLength: s.m5_rampLength,
        hasRollers: s.m5_rollers,
        stage2BridgeBeamCount: s.m5_bridgeBeams,
        selectedPulley: s.m5_pulley,
        isTesting: this.isTesting,
        isHumanPullable: res.overallSuccess,
        totalRequiredForceN: res.maxForceEncountered,
        ...res
      };
    }
  }

  updateSimulationStep() {
    if (!this.isTesting) return;

    const state = this.getCurrentSimulationState();
    const speed = 0.008 * this.simSpeed;

    if (state.isHumanPullable) {
      this.simProgress += speed;
      this.renderer.simProgress = Math.min(1.0, this.simProgress);

      if (this.simProgress >= 1.0) {
        this.isTesting = false;
        this.handleTestSuccess(state);
      }
    } else {
      // Struggles and halts after slight movement
      this.simProgress += speed * 0.3;
      this.renderer.simProgress = Math.min(0.22, this.simProgress);
      if (this.simProgress >= 0.22) {
        this.isTesting = false;
        this.handleTestStruggle(state);
      }
    }
  }

  startTest() {
    sound.playClick();
    this.isTesting = true;
    this.simProgress = 0.0;
    this.renderer.simProgress = 0.0;

    const state = this.getCurrentSimulationState();
    if (state.hasRollers) {
      sound.playRollingSound();
    } else if (state.totalRequiredForceN > 250) {
      sound.playHeavyGrind();
    } else if (state.selectedPulley) {
      sound.playPulleyWhir();
    } else {
      sound.playRopeTension();
    }

    const testBtn = document.getElementById('btnRunTest');
    testBtn.innerHTML = '<span>⏳</span> در حال آزمایش...';
  }

  resetTest() {
    sound.playClick();
    this.isTesting = false;
    this.simProgress = 0.0;
    this.renderer.simProgress = 0.0;
    const testBtn = document.getElementById('btnRunTest');
    testBtn.innerHTML = '<span>🚀</span> آزمایش کن';
  }

  toggleSlowMo() {
    sound.playClick();
    this.simSpeed = this.simSpeed === 1.0 ? 0.35 : 1.0;
    const btn = document.getElementById('btnSlowMo');
    if (this.simSpeed < 1.0) {
      btn.classList.add('active');
      btn.innerHTML = '<span>🔍</span> حرکت آهسته (فعال)';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '<span>🔍</span> حرکت آهسته';
    }
  }

  showNextHint() {
    sound.playClick();
    const mission = MISSIONS[this.currentMissionIndex];
    if (!mission || !mission.hints) return;

    this.currentHintStep = (this.currentHintStep + 1) % (mission.hints.length + 1);
    const hintBox = document.getElementById('hintDisplayBox');
    if (this.currentHintStep === 0) {
      hintBox.innerHTML = '<span>💡 برای دریافت راهنمایی کلیک کنید.</span>';
    } else {
      const hintText = mission.hints[this.currentHintStep - 1];
      hintBox.innerHTML = `<strong>راهنمای پله‌ی ${toPersianDigits(this.currentHintStep)}:</strong> ${hintText}`;
    }
  }

  handleTestSuccess(state) {
    const testBtn = document.getElementById('btnRunTest');
    testBtn.innerHTML = '<span>✅</span> آزمایش موفق!';

    sound.playDiscoveryJingle();
    this.renderer.addSparkle(this.canvas.width / (2 * this.renderer.dpr), this.canvas.height / (2 * this.renderer.dpr), 25, '#2ecc71');

    const mission = MISSIONS[this.currentMissionIndex];

    // Log to teacher mode
    teacher.logExperiment({
      missionId: mission.id,
      missionTitle: mission.title,
      setupDesc: state.summaryFa || 'پیکربندی موفق با ماشین ساده',
      forceN: state.totalRequiredForceN,
      distanceM: state.distanceM || state.ropePullDistanceM || 3.0,
      isSuccess: true,
      discovery: mission.discoveryCard ? mission.discoveryCard.summary : 'موفقیت در نجات بار'
    });

    // Mark mission completed & unlock discovery card
    if (!this.userState.completedMissions.includes(mission.id)) {
      this.userState.completedMissions.push(mission.id);
    }
    if (mission.discoveryCard && !this.userState.unlockedDiscoveries.some(d => d.id === mission.discoveryCard.id)) {
      this.userState.unlockedDiscoveries.push(mission.discoveryCard);
      setTimeout(() => {
        this.openDiscoveryRewardModal(mission.discoveryCard, state.badges);
      }, 600);
    }

    this.saveProgress();
    this.renderMissionTracker();
  }

  handleTestStruggle(state) {
    const testBtn = document.getElementById('btnRunTest');
    testBtn.innerHTML = '<span>⚠️</span> نیرو بیش از حد است! بازطراحی کن';
    sound.playHeavyGrind();

    const mission = MISSIONS[this.currentMissionIndex];
    teacher.logExperiment({
      missionId: mission.id,
      missionTitle: mission.title,
      setupDesc: 'تلاش با نیروی بیش از حد توان انسان',
      forceN: state.totalRequiredForceN,
      distanceM: state.distanceM || 0,
      isSuccess: false,
      discovery: 'نیاز به افزایش مزیت مکانیکی یا کاهش اصطکاک'
    });
  }

  renderMissionTracker() {
    const trackerEl = document.getElementById('missionTracker');
    trackerEl.innerHTML = '';

    MISSIONS.forEach((m, idx) => {
      const stepBtn = document.createElement('button');
      stepBtn.className = `tracker-step ${idx === this.currentMissionIndex && !this.isFreeLabMode ? 'active' : ''} ${this.userState.completedMissions.includes(m.id) ? 'completed' : ''}`;
      const statusIcon = this.userState.completedMissions.includes(m.id) ? '✔' : m.badge;
      stepBtn.innerHTML = `<span>${statusIcon}</span> <span>${m.title.split(':')[0]}</span>`;
      stepBtn.addEventListener('click', () => {
        this.switchMission(idx);
      });
      trackerEl.appendChild(stepBtn);
    });

    const labBtn = document.createElement('button');
    labBtn.className = `tracker-step ${this.isFreeLabMode ? 'active' : ''}`;
    labBtn.innerHTML = `<span>🧪</span> <span>کارگاه آزاد</span>`;
    labBtn.addEventListener('click', () => {
      this.toggleFreeLabMode();
    });
    trackerEl.appendChild(labBtn);
  }

  switchMission(idx) {
    sound.playClick();
    this.currentMissionIndex = idx;
    this.isFreeLabMode = false;
    this.resetTest();
    this.currentHintStep = 0;
    this.renderMissionTracker();
    this.loadMissionUI(idx);
  }

  toggleFreeLabMode() {
    sound.playClick();
    this.isFreeLabMode = !this.isFreeLabMode;
    this.resetTest();
    this.renderMissionTracker();
    if (this.isFreeLabMode) {
      this.loadFreeLabUI();
    } else {
      this.loadMissionUI(this.currentMissionIndex);
    }
  }

  loadMissionUI(idx) {
    const mission = MISSIONS[idx];
    const panel = document.getElementById('controlsDynamicContent');

    // 1. Story Box
    const storyHTML = `
      <div class="card story-box">
        <div class="character-avatar">${mission.story.avatar}</div>
        <div class="story-content">
          <h3>${mission.story.character}</h3>
          <p>${mission.story.dialogue}</p>
          <p style="margin-top: 6px; font-weight: 700; color: #b45309;">🎯 هدف: ${mission.story.target}</p>
        </div>
      </div>
    `;

    // 2. Prediction Box
    const predictionHTML = `
      <div class="card prediction-box">
        <h3><span>🤔</span> فکر می‌کنی چه می‌شود؟ (پیش‌بینی تو)</h3>
        <p style="font-size: 0.9rem; color: #15803d;">${mission.prediction.question}</p>
        <div class="prediction-options">
          ${mission.prediction.options.map((opt, oIdx) => `
            <button class="prediction-btn ${this.selectedPrediction === opt.id ? 'selected' : ''}" data-opt="${opt.id}" data-feedback="${opt.feedback}">
              ${opt.text}
            </button>
          `).join('')}
        </div>
        <div id="predictionFeedbackBox" style="margin-top: 8px; font-size: 0.85rem; font-weight: bold; color: #166534;"></div>
      </div>
    `;

    // 3. Workbench Tools HTML
    let workbenchHTML = `<div class="card workbench-panel"><h3><span>🛠️</span> ابزارها و تنظیمات مخترع</h3>`;

    if (mission.workbench.type === 'FLAT_DRAG') {
      workbenchHTML += `
        <div class="tool-group">
          <label>نوع سطح مسیر حرکت:</label>
          <div class="button-toggle-grid">
            ${mission.workbench.availableSurfaces.map(sKey => {
              const surf = SURFACES[sKey];
              return `
                <button class="toggle-btn ${this.userState.m1_surface === sKey ? 'selected' : ''}" data-surface="${sKey}">
                  ${surf.icon} ${surf.name.split(' ')[0]}
                </button>
              `;
            }).join('')}
          </div>
        </div>
        <div class="tool-group" style="margin-top: 10px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="chkRollers" ${this.userState.m1_rollers ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary);">
            <span>استفاده از غلتک‌ها و چرخ‌های چوبی ⚙️</span>
          </label>
        </div>
      `;
    } else if (mission.workbench.type === 'INCLINED_PLANE') {
      workbenchHTML += `
        <div class="tool-group">
          <label>طول سطح شیب‌دار (متر):</label>
          <div class="slider-container">
            <input type="range" id="rngRampLength" min="${mission.workbench.minRampLength}" max="${mission.workbench.maxRampLength}" step="0.2" value="${this.userState.m2_rampLength}">
            <span class="slider-val" id="valRampLength">${toPersianDigits(this.userState.m2_rampLength)} م</span>
          </div>
        </div>
        <div class="tool-group">
          <label>جنس سطح رمپ:</label>
          <div class="button-toggle-grid">
            ${mission.workbench.availableSurfaces.map(sKey => {
              const surf = SURFACES[sKey];
              return `
                <button class="toggle-btn ${this.userState.m2_surface === sKey ? 'selected' : ''}" data-surface-m2="${sKey}">
                  ${surf.icon} ${surf.name.split(' ')[0]}
                </button>
              `;
            }).join('')}
          </div>
        </div>
        <div class="tool-group">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="chkRollersM2" ${this.userState.m2_rollers ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary);">
            <span>افزودن غلتک روی سطح شیب‌دار ⚙️</span>
          </label>
        </div>
      `;
    } else if (mission.workbench.type === 'LEVER') {
      workbenchHTML += `
        <div class="tool-group">
          <label>محل قرارگیری تکیه‌گاه (فاصله از ابتدا):</label>
          <div class="slider-container">
            <input type="range" id="rngFulcrum" min="${mission.workbench.minFulcrum}" max="${mission.workbench.maxFulcrum}" step="0.2" value="${this.userState.m3_fulcrum}">
            <span class="slider-val" id="valFulcrum">${toPersianDigits(this.userState.m3_fulcrum)} م</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">تکیه‌گاه را به سمت تخته‌سنگ (راست/چپ) جابه‌جا کن تا بازوی نیرو بلندتر شود.</p>
        </div>
        <div class="tool-group">
          <label>طول تیرک چوبی اهرم:</label>
          <div class="button-toggle-grid">
            ${mission.workbench.beamLengths.map(len => `
              <button class="toggle-btn ${this.userState.m3_beamLength === len ? 'selected' : ''}" data-beam-len="${len}">
                🪵 ${toPersianDigits(len)} متری
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else if (mission.workbench.type === 'PULLEY') {
      workbenchHTML += `
        <div class="tool-group">
          <label>انتخاب نوع سامانه‌ی قرقره:</label>
          <div class="button-toggle-grid">
            ${mission.workbench.availablePulleys.map(pKey => {
              const p = PULLEY_TYPES[pKey];
              return `
                <button class="toggle-btn ${this.userState.m4_pulley === pKey ? 'selected' : ''}" data-pulley="${pKey}">
                  ${p.icon} ${p.name.split(' ')[0]} ${p.name.split(' ')[1] || ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else if (mission.workbench.type === 'CAPSTONE') {
      workbenchHTML += `
        <div class="tool-group">
          <label>مرحله ۱: طول رمپ ورودی (${toPersianDigits(this.userState.m5_rampLength)} م):</label>
          <input type="range" id="rngCapRamp" min="3.0" max="6.0" step="0.5" value="${this.userState.m5_rampLength}" style="width: 100%;">
        </div>
        <div class="tool-group">
          <label>مرحله ۲: تیرک‌های پل میانی:</label>
          <div class="button-toggle-grid">
            <button class="toggle-btn ${this.userState.m5_bridgeBeams === 1 ? 'selected' : ''}" data-cap-bridge="1">۱ تیرک (ناامن)</button>
            <button class="toggle-btn ${this.userState.m5_bridgeBeams === 2 ? 'selected' : ''}" data-cap-bridge="2">۲ تیرک (ایمن ✔)</button>
          </div>
        </div>
        <div class="tool-group">
          <label>مرحله ۳: بالابَر نهایی ایوان:</label>
          <div class="button-toggle-grid">
            <button class="toggle-btn ${this.userState.m5_pulley === 'FIXED' ? 'selected' : ''}" data-cap-pulley="FIXED">قرقره ثابت</button>
            <button class="toggle-btn ${this.userState.m5_pulley === 'MOVABLE' ? 'selected' : ''}" data-cap-pulley="MOVABLE">قرقره متحرک</button>
            <button class="toggle-btn ${this.userState.m5_pulley === 'COMPOUND_2' ? 'selected' : ''}" data-cap-pulley="COMPOUND_2">قرقره مرکب</button>
          </div>
        </div>
      `;
    }

    workbenchHTML += `</div>`;

    panel.innerHTML = storyHTML + predictionHTML + workbenchHTML;
    this.attachWorkbenchEventListeners(mission);
  }

  loadFreeLabUI() {
    const panel = document.getElementById('controlsDynamicContent');
    const s = this.freeLab.state;

    panel.innerHTML = `
      <div class="card story-box" style="background: #eef2ff; border-color: #c7d2fe;">
        <div class="character-avatar">🧪</div>
        <div class="story-content">
          <h3 style="color: #4338ca;">کارگاه آزاد مخترع کوهستان</h3>
          <p style="color: #3730a3;">در اینجا می‌توانید به دلخواه جرم بار، ماشین ساده، سطوح و قرقره‌ها را ترکیب کرده و داده‌های علمی را اندازه بگیرید!</p>
        </div>
      </div>

      <div class="card workbench-panel">
        <h3><span>⚙️</span> انتخاب ماشین ساده:</h3>
        <div class="button-toggle-grid" style="margin-bottom: 12px;">
          <button class="toggle-btn ${s.workbenchType === 'FLAT_DRAG' ? 'selected' : ''}" data-free-type="FLAT_DRAG">غلتک و چرخ</button>
          <button class="toggle-btn ${s.workbenchType === 'INCLINED_PLANE' ? 'selected' : ''}" data-free-type="INCLINED_PLANE">سطح شیب‌دار</button>
          <button class="toggle-btn ${s.workbenchType === 'LEVER' ? 'selected' : ''}" data-free-type="LEVER">اهرم</button>
          <button class="toggle-btn ${s.workbenchType === 'PULLEY' ? 'selected' : ''}" data-free-type="PULLEY">قرقره‌ها</button>
        </div>

        <div class="tool-group">
          <label>جرم صندوق دارو (${toPersianDigits(s.cargoMassKg)} کیلوگرم):</label>
          <div class="slider-container">
            <input type="range" id="freeCargoMass" min="20" max="100" step="5" value="${s.cargoMassKg}">
            <span class="slider-val">${toPersianDigits(s.cargoMassKg)} kg</span>
          </div>
        </div>
      </div>

      <div class="card prediction-box" style="background: #fdf4ff; border-color: #f5d0fe;">
        <h3 style="color: #86198f;"><span>💡</span> کارت‌های کنجکاوی و چالش‌های اختیاری:</h3>
        ${CURIOSITY_CARDS.map(c => `
          <div style="background: white; border: 1px solid #f0abfc; padding: 10px; border-radius: 8px; margin-top: 8px;">
            <strong>${c.title}</strong>
            <p style="font-size: 0.85rem; color: #701a75; margin-top: 4px;">${c.prompt}</p>
          </div>
        `).join('')}
      </div>
    `;

    // Free Lab Event Listeners
    panel.querySelectorAll('[data-free-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.freeLab.state.workbenchType = btn.dataset.freeType;
        this.loadFreeLabUI();
      });
    });

    const massInput = document.getElementById('freeCargoMass');
    if (massInput) {
      massInput.addEventListener('input', (e) => {
        this.freeLab.state.cargoMassKg = parseInt(e.target.value, 10);
        this.loadFreeLabUI();
      });
    }
  }

  attachWorkbenchEventListeners(mission) {
    const panel = document.getElementById('controlsDynamicContent');

    // Prediction buttons
    panel.querySelectorAll('.prediction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.selectedPrediction = btn.dataset.opt;
        panel.querySelectorAll('.prediction-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('predictionFeedbackBox').textContent = btn.dataset.feedback;
      });
    });

    // Mission 1 Events
    panel.querySelectorAll('[data-surface]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playSnap();
        this.userState.m1_surface = btn.dataset.surface;
        this.loadMissionUI(0);
      });
    });
    const chkRollers = document.getElementById('chkRollers');
    if (chkRollers) {
      chkRollers.addEventListener('change', (e) => {
        sound.playSnap();
        this.userState.m1_rollers = e.target.checked;
      });
    }

    // Mission 2 Events
    const rngRamp = document.getElementById('rngRampLength');
    if (rngRamp) {
      rngRamp.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.userState.m2_rampLength = val;
        document.getElementById('valRampLength').textContent = `${toPersianDigits(val)} م`;
      });
    }
    panel.querySelectorAll('[data-surface-m2]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playSnap();
        this.userState.m2_surface = btn.dataset.surfaceM2;
        this.loadMissionUI(1);
      });
    });
    const chkRollersM2 = document.getElementById('chkRollersM2');
    if (chkRollersM2) {
      chkRollersM2.addEventListener('change', (e) => {
        sound.playSnap();
        this.userState.m2_rollers = e.target.checked;
      });
    }

    // Mission 3 Events
    const rngFulcrum = document.getElementById('rngFulcrum');
    if (rngFulcrum) {
      rngFulcrum.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.userState.m3_fulcrum = val;
        document.getElementById('valFulcrum').textContent = `${toPersianDigits(val)} م`;
      });
    }
    panel.querySelectorAll('[data-beam-len]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playSnap();
        this.userState.m3_beamLength = parseFloat(btn.dataset.beamLen);
        this.loadMissionUI(2);
      });
    });

    // Mission 4 Events
    panel.querySelectorAll('[data-pulley]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playSnap();
        this.userState.m4_pulley = btn.dataset.pulley;
        this.loadMissionUI(3);
      });
    });

    // Mission 5 Events
    const rngCapRamp = document.getElementById('rngCapRamp');
    if (rngCapRamp) {
      rngCapRamp.addEventListener('input', (e) => {
        this.userState.m5_rampLength = parseFloat(e.target.value);
      });
    }
    panel.querySelectorAll('[data-cap-bridge]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playSnap();
        this.userState.m5_bridgeBeams = parseInt(btn.dataset.capBridge, 10);
        this.loadMissionUI(4);
      });
    });
    panel.querySelectorAll('[data-cap-pulley]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playSnap();
        this.userState.m5_pulley = btn.dataset.capPulley;
        this.loadMissionUI(4);
      });
    });
  }

  openDiscoveryRewardModal(card, badges = []) {
    const modal = document.getElementById('modalDiscovery');
    const content = document.getElementById('discoveryModalBody');

    let badgesHTML = '';
    if (badges && badges.length > 0) {
      badgesHTML = `
        <div style="margin-top: 14px; background: #fef3c7; border: 1px solid #fde68a; padding: 12px; border-radius: 12px;">
          <h4 style="color: #92400e; margin-bottom: 6px;">🏅 نشان‌های مهندسی کسب‌شده:</h4>
          ${badges.map(b => `<span style="background: white; border: 1px solid #fcd34d; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; margin: 4px; display: inline-block;">${b.icon} ${b.title}</span>`).join('')}
        </div>
      `;
    }

    content.innerHTML = `
      <div class="discovery-badge-card">
        <div class="discovery-icon">${card.icon}</div>
        <h3>${card.title}</h3>
        <p style="font-weight: bold; color: #15803d; margin-bottom: 8px;">موضوع: ${card.concept}</p>
        <p>${card.summary}</p>
      </div>
      ${badgesHTML}
      <div style="text-align: center; margin-top: 18px;">
        <button id="btnContinueAfterDiscovery" class="btn-primary" style="margin: 0 auto; min-width: 180px;">ادامه‌ی ماجراجویی 🚀</button>
      </div>
    `;

    document.getElementById('btnContinueAfterDiscovery').addEventListener('click', () => {
      this.closeAllModals();
      if (this.currentMissionIndex < MISSIONS.length - 1) {
        this.switchMission(this.currentMissionIndex + 1);
      }
    });

    modal.classList.remove('hidden');
  }

  openTeacherModal() {
    sound.playClick();
    const modal = document.getElementById('modalTeacher');
    const content = document.getElementById('teacherModalBody');

    const logsHTML = teacher.logs.map((log, idx) => `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; color: var(--primary);">
          <span>${log.missionTitle}</span>
          <span style="font-size: 0.85rem; color: #64748b;">${log.timestamp}</span>
        </div>
        <div style="font-size: 0.85rem; margin-top: 4px; color: #334155;">
          ⚡ نیرو: <strong>${toPersianDigits(log.forceN)} N</strong> | 📏 مسافت: <strong>${toPersianDigits(log.distanceM)} m</strong> | ${log.isSuccess ? '✅ موفق' : '⚠️ سنگین'}
        </div>
      </div>
    `).join('');

    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <h3 style="color: var(--primary); margin-bottom: 8px;">📚 انطباق با برنامه درسی علوم پایه پنجم دبستان:</h3>
        <ul style="list-style-type: square; padding-right: 20px; font-size: 0.9rem; line-height: 1.8; color: #334155;">
          ${CURRICULUM_GOALS.map(g => `<li><strong>${g.title}:</strong> ${g.text}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-bottom: 16px;">
        <h3 style="color: var(--primary); margin-bottom: 8px;">🔬 پیشینه‌ی آزمایش‌های ثبت‌شده دانش‌آموز:</h3>
        ${logsHTML || '<p style="color: #64748b;">هنوز آزمایشی ثبت نشده است.</p>'}
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <button id="btnPrintNotebook" class="btn-primary" style="margin: 0 auto;">
          📄 دریافت و چاپ «دفترچه‌ی مخترع»
        </button>
      </div>
    `;

    document.getElementById('btnPrintNotebook').addEventListener('click', () => {
      const printWin = window.open('', '_blank');
      printWin.document.write(teacher.generatePrintableNotebookHTML());
      printWin.document.close();
    });

    modal.classList.remove('hidden');
  }

  openDiscoveriesModal() {
    sound.playClick();
    const modal = document.getElementById('modalDiscoveriesList');
    const content = document.getElementById('discoveriesListBody');

    if (this.userState.unlockedDiscoveries.length === 0) {
      content.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #64748b;">
          <div style="font-size: 3rem; margin-bottom: 10px;">🔍</div>
          <p>هنوز کارت کشفی باز نشده است. مأموریت‌ها را انجام بده تا کارت‌های علمی را جمع‌آوری کنی!</p>
        </div>
      `;
    } else {
      content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${this.userState.unlockedDiscoveries.map(c => `
            <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 14px; display: flex; gap: 12px; align-items: center;">
              <div style="font-size: 2.2rem;">${c.icon}</div>
              <div>
                <h4 style="color: #166534; margin-bottom: 4px;">${c.title}</h4>
                <p style="font-size: 0.9rem; color: #14532d;">${c.summary}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    modal.classList.remove('hidden');
  }

  openSettingsModal() {
    sound.playClick();
    const modal = document.getElementById('modalSettings');
    const content = document.getElementById('settingsModalBody');

    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label style="font-weight: bold;">🔊 صدای کلی بازی:</label>
          <input type="range" id="volMaster" min="0" max="1" step="0.05" value="${sound.volumes.master}" style="width: 100%;">
        </div>
        <div>
          <label style="font-weight: bold;">🪵 جلوه‌های صوتی (ابزارها و قرقره):</label>
          <input type="range" id="volSFX" min="0" max="1" step="0.05" value="${sound.volumes.sfx}" style="width: 100%;">
        </div>
        <div>
          <label style="font-weight: bold;">🍃 صدای باد و پرندگان کوهستان:</label>
          <input type="range" id="volAmbient" min="0" max="1" step="0.05" value="${sound.volumes.ambient}" style="width: 100%;">
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0;"/>
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <input type="checkbox" id="chkHighContrast" ${this.userState.highContrast ? 'checked' : ''} style="width: 20px; height: 20px;">
          <span style="font-weight: bold;">حالت کنتراست بالا (برای وضوح دید بهتر)</span>
        </label>
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <input type="checkbox" id="chkReducedMotion" ${this.userState.reducedMotion ? 'checked' : ''} style="width: 20px; height: 20px;">
          <span style="font-weight: bold;">کاهش انیمیشن‌ها و ذرات متحرک</span>
        </label>
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <input type="checkbox" id="chkCaptions" ${this.userState.captions ? 'checked' : ''} style="width: 20px; height: 20px;">
          <span style="font-weight: bold;">نمایش زیرنویس و متن برای تمام اصوات</span>
        </label>
      </div>
    `;

    document.getElementById('volMaster').addEventListener('input', (e) => sound.setVolumes({ master: parseFloat(e.target.value) }));
    document.getElementById('volSFX').addEventListener('input', (e) => sound.setVolumes({ sfx: parseFloat(e.target.value) }));
    document.getElementById('volAmbient').addEventListener('input', (e) => sound.setVolumes({ ambient: parseFloat(e.target.value) }));

    document.getElementById('chkHighContrast').addEventListener('change', (e) => {
      this.userState.highContrast = e.target.checked;
      document.body.classList.toggle('high-contrast', e.target.checked);
      this.saveProgress();
    });

    document.getElementById('chkReducedMotion').addEventListener('change', (e) => {
      this.userState.reducedMotion = e.target.checked;
      this.renderer.reducedMotion = e.target.checked;
      this.saveProgress();
    });

    document.getElementById('chkCaptions').addEventListener('change', (e) => {
      this.userState.captions = e.target.checked;
      sound.captionsEnabled = e.target.checked;
      this.saveProgress();
    });

    modal.classList.remove('hidden');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
  }
}

// Instantiate and start game on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.rescueGame = new RescueCargoGame();
  window.rescueGame.init();
});

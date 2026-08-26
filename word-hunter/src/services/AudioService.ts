import { RealmTheme } from '../types/game';

/**
 * موتور صدای بازی — همهٔ صداها با Web Audio ساخته می‌شوند
 * تا بازی به هیچ فایل صوتی بیرونی نیاز نداشته باشد
 * (مناسب کلاس‌هایی که اینترنت ندارند).
 */

type Wave = OscillatorType;

const SCALE = { // گام پنتاتونیک شاد
  c: [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51],
};

/** آکورد پایهٔ هر قلمرو — فضای صوتی متفاوت برای هر سرزمین */
const THEME_PAD: Record<RealmTheme, number[]> = {
  forest: [98.0, 146.83, 196.0, 293.66],
  crystal_cave: [110.0, 164.81, 220.0, 329.63],
  sky_city: [130.81, 196.0, 261.63, 392.0],
  dark_fortress: [87.31, 130.81, 155.56, 233.08],
  desert_ruins: [116.54, 174.61, 233.08, 349.23],
  celestial_island: [123.47, 185.0, 246.94, 369.99],
};

class AudioService {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private muted = false;
  private musicOn = true;
  private padNodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode }[] = [];
  private currentTheme: RealmTheme | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.muted = localStorage.getItem('wh_muted') === '1';
    this.musicOn = localStorage.getItem('wh_music') !== '0';
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const load = () => { this.voices = window.speechSynthesis.getVoices(); };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  /* ─────────── زیرساخت ─────────── */

  private ac(): AudioContext | null {
    if (!this.ctx) {
      const C = window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      this.ctx = new C();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.9;
      this.sfxBus.connect(this.master);

      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicOn ? 0.32 : 0;
      this.musicBus.connect(this.master);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /** یک نُت ساده با پوش ADSR */
  private note(
    freq: number,
    opts: {
      type?: Wave; at?: number; dur?: number; gain?: number;
      slideTo?: number; filter?: number; q?: number; bus?: GainNode | null;
    } = {}
  ) {
    const ctx = this.ac();
    if (!ctx || this.muted) return;
    const {
      type = 'sine', at = 0, dur = 0.3, gain = 0.14,
      slideTo, filter, q = 1,
    } = opts;
    const t0 = ctx.currentTime + at;
    try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);

      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.03, dur * 0.2));
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      let node: AudioNode = osc;
      if (filter) {
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(filter, t0);
        f.Q.value = q;
        osc.connect(f);
        node = f;
      }
      node.connect(g);
      g.connect(opts.bus ?? this.sfxBus ?? ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch { /* بی‌صدا رد شو */ }
  }

  /** نویز فیلترشده — برای صدای برخورد، سوت تیر و ترکیدن */
  private noise(opts: { at?: number; dur?: number; gain?: number; from?: number; to?: number; q?: number } = {}) {
    const ctx = this.ac();
    if (!ctx || this.muted) return;
    const { at = 0, dur = 0.2, gain = 0.1, from = 1400, to = 300, q = 2 } = opts;
    const t0 = ctx.currentTime + at;
    try {
      const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(from, t0);
      f.frequency.exponentialRampToValueAtTime(Math.max(60, to), t0 + dur);
      f.Q.value = q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(this.sfxBus ?? ctx.destination);
      src.start(t0);
      src.stop(t0 + dur + 0.02);
    } catch { /* بی‌صدا رد شو */ }
  }

  /* ─────────── تنظیمات ─────────── */

  public toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('wh_muted', this.muted ? '1' : '0');
    const ctx = this.ac();
    if (this.master && ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.9, ctx.currentTime, 0.05);
    }
    if (this.muted) this.stopSpeech();
    return this.muted;
  }

  public getIsMuted() { return this.muted; }

  public toggleMusic(): boolean {
    this.musicOn = !this.musicOn;
    localStorage.setItem('wh_music', this.musicOn ? '1' : '0');
    const ctx = this.ac();
    if (this.musicBus && ctx) {
      this.musicBus.gain.setTargetAtTime(this.musicOn ? 0.32 : 0, ctx.currentTime, 0.2);
    }
    return this.musicOn;
  }

  public getMusicOn() { return this.musicOn; }

  /** با اولین کلیک کاربر صدا را بیدار می‌کند */
  public unlock() { this.ac(); }

  /* ─────────── فضای صوتی ─────────── */

  public startAmbient(theme: RealmTheme = 'forest') {
    const ctx = this.ac();
    if (!ctx) return;
    if (this.currentTheme === theme && this.padNodes.length) return;
    this.stopAmbient();
    this.currentTheme = theme;
    const chord = THEME_PAD[theme] || THEME_PAD.forest;
    try {
      chord.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        osc.type = i === 0 ? 'sine' : i === chord.length - 1 ? 'triangle' : 'sine';
        osc.frequency.value = f;
        osc.detune.value = (i - 1.5) * 5;

        g.gain.value = 0;
        g.gain.setTargetAtTime(0.09 / (i * 0.5 + 1), ctx.currentTime, 1.5);

        // نوسان آرام دامنه، تا صدا یکنواخت و آزاردهنده نباشد
        lfo.frequency.value = 0.05 + i * 0.031;
        lfoGain.gain.value = 0.035 / (i + 1);
        lfo.connect(lfoGain);
        lfoGain.connect(g.gain);

        osc.connect(g);
        g.connect(this.musicBus!);
        osc.start();
        lfo.start();
        this.padNodes.push({ osc, gain: g, lfo });
      });
    } catch { /* بی‌صدا رد شو */ }
  }

  public stopAmbient() {
    const ctx = this.ctx;
    this.padNodes.forEach(({ osc, gain, lfo }) => {
      try {
        if (ctx) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
        osc.stop((ctx?.currentTime ?? 0) + 1.2);
        lfo.stop((ctx?.currentTime ?? 0) + 1.2);
      } catch { /* قبلاً متوقف شده */ }
    });
    this.padNodes = [];
    this.currentTheme = null;
  }

  /* ─────────── جلوه‌های صوتی ─────────── */

  public playBowDraw(power = 0.5) {
    this.noise({ dur: 0.22, gain: 0.05, from: 500 + power * 400, to: 900, q: 1.4 });
    this.note(70 + power * 60, { type: 'sawtooth', dur: 0.22, gain: 0.05, filter: 500 });
  }

  public playBowRelease() {
    this.note(300, { type: 'triangle', dur: 0.16, gain: 0.2, slideTo: 70 });
    this.noise({ dur: 0.24, gain: 0.09, from: 2200, to: 500, q: 3 });
  }

  public playCorrect(combo = 1) {
    const s = SCALE.c;
    const i = Math.min(s.length - 1, combo - 1);
    this.note(s[i], { type: 'sine', dur: 0.42, gain: 0.16 });
    this.note(s[i] * 1.5, { type: 'triangle', at: 0.05, dur: 0.36, gain: 0.1 });
    this.note(s[i] * 2, { type: 'sine', at: 0.1, dur: 0.3, gain: 0.06 });
  }

  public playComboFanfare() {
    [0, 0.07, 0.14, 0.21].forEach((at, i) =>
      this.note(SCALE.c[i + 2], { type: 'triangle', at, dur: 0.4, gain: 0.13 })
    );
  }

  public playWrong() {
    // صدای «دوباره تلاش کن» — نرم و غیرتنبیهی
    this.note(300, { type: 'sine', dur: 0.16, gain: 0.14, slideTo: 210 });
    this.note(210, { type: 'sine', at: 0.14, dur: 0.3, gain: 0.12, slideTo: 160 });
  }

  public playThud() {
    this.note(150, { type: 'sine', dur: 0.1, gain: 0.11, slideTo: 80 });
    this.noise({ dur: 0.09, gain: 0.05, from: 700, to: 180 });
  }

  public playLetterSnap() {
    this.note(660, { type: 'sine', dur: 0.2, gain: 0.14, slideTo: 1320 });
    this.note(990, { type: 'triangle', at: 0.06, dur: 0.22, gain: 0.08 });
  }

  public playLockBreak() {
    this.noise({ dur: 0.3, gain: 0.13, from: 2600, to: 350, q: 1.6 });
    this.note(180, { type: 'square', dur: 0.14, gain: 0.09, slideTo: 70, filter: 900 });
  }

  public playUnlock() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.note(f, { type: 'triangle', at: i * 0.07, dur: 0.5, gain: 0.13 })
    );
  }

  public playCleanse() {
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.note(f, { type: 'sine', at: i * 0.05, dur: 0.55, gain: 0.11 })
    );
    this.noise({ dur: 0.5, gain: 0.04, from: 400, to: 3000, q: 1 });
  }

  public playBossHit() {
    this.note(110, { type: 'sawtooth', dur: 0.3, gain: 0.2, slideTo: 42, filter: 800 });
    this.noise({ dur: 0.28, gain: 0.11, from: 1200, to: 120, q: 1.2 });
  }

  public playBossRage() {
    this.note(70, { type: 'sawtooth', dur: 1.1, gain: 0.2, slideTo: 160, filter: 700 });
    this.noise({ dur: 0.9, gain: 0.09, from: 200, to: 1600, q: 0.8 });
  }

  public playBossDefeat() {
    [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.note(f, { type: 'triangle', at: i * 0.09, dur: 0.7, gain: 0.16 })
    );
    this.note(65, { type: 'sawtooth', at: 0.0, dur: 1.4, gain: 0.14, slideTo: 30, filter: 400 });
  }

  public playCurseThrow() {
    this.note(420, { type: 'sawtooth', dur: 0.32, gain: 0.08, slideTo: 180, filter: 1100 });
  }

  public playCurseBreak() {
    this.noise({ dur: 0.16, gain: 0.09, from: 3000, to: 700, q: 2 });
    this.note(880, { type: 'square', dur: 0.09, gain: 0.05, slideTo: 400, filter: 1800 });
  }

  public playCoin() {
    this.note(987.77, { type: 'sine', dur: 0.1, gain: 0.1 });
    this.note(1318.51, { type: 'sine', at: 0.07, dur: 0.25, gain: 0.09 });
  }

  public playVictory() {
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) =>
      this.note(f, { type: 'triangle', at: i * 0.11, dur: 0.75, gain: 0.16 })
    );
    [261.63, 392.0].forEach((f) => this.note(f, { type: 'sine', dur: 1.6, gain: 0.09 }));
  }

  public playDefeat() {
    [440, 392, 349.23, 293.66].forEach((f, i) =>
      this.note(f, { type: 'triangle', at: i * 0.16, dur: 0.6, gain: 0.13 })
    );
  }

  public playUiClick() {
    this.note(720, { type: 'sine', dur: 0.07, gain: 0.07 });
  }

  /* ─────────── گفتار فارسی ─────────── */

  public hasPersianVoice(): boolean {
    return this.pickVoice() !== undefined;
  }

  private pickVoice(): SpeechSynthesisVoice | undefined {
    if (!this.voices.length && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices.find(
      (v) => v.lang?.toLowerCase().startsWith('fa') || /persian|farsi/i.test(v.name)
    );
  }

  /**
   * واژه را با صدای فارسی می‌خواند.
   * اگر صدای فارسی روی دستگاه نصب نباشد، یک آهنگ کوتاه پخش می‌شود
   * و onEnd فراخوانی می‌گردد تا بازی متوقف نماند.
   */
  public speakPersian(text: string, onEnd?: () => void) {
    if (this.muted) { onEnd?.(); return; }
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.playUnlock();
      setTimeout(() => onEnd?.(), 900);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'fa-IR';
      u.rate = 0.82;
      u.pitch = 1.0;
      const v = this.pickVoice();
      if (v) u.voice = v;
      let done = false;
      const finish = () => { if (!done) { done = true; onEnd?.(); } };
      u.onend = finish;
      u.onerror = finish;
      window.speechSynthesis.speak(u);
      // تور ایمنی: اگر رویداد پایان نیامد
      window.setTimeout(finish, 4000);
    } catch {
      this.playUnlock();
      window.setTimeout(() => onEnd?.(), 900);
    }
  }

  public stopSpeech() {
    try { window.speechSynthesis?.cancel(); } catch { /* پشتیبانی نمی‌شود */ }
  }
}

export const audioService = new AudioService();

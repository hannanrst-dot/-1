// Audio Synthesizer using Web Audio API (100% self-contained, no external audio files needed)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.ambientGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.isMuted = false;
    this.ambientPlaying = false;
    this.captionsEnabled = true;
    this.captionCallback = null;
    this.windNode = null;
    this.birdTimer = null;
    this.volumes = {
      master: 0.8,
      sfx: 0.8,
      ambient: 0.4
    };
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volumes.master;
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.volumes.sfx;
    this.sfxGain.connect(this.masterGain);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = this.volumes.ambient;
    this.ambientGain.connect(this.masterGain);
  }

  resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setCaptionCallback(cb) {
    this.captionCallback = cb;
  }

  showCaption(text, icon = '🔊') {
    if (this.captionsEnabled && this.captionCallback) {
      this.captionCallback({ text, icon });
    }
  }

  setVolumes({ master, sfx, ambient }) {
    if (master !== undefined) {
      this.volumes.master = master;
      if (this.masterGain) this.masterGain.gain.value = this.isMuted ? 0 : master;
    }
    if (sfx !== undefined) {
      this.volumes.sfx = sfx;
      if (this.sfxGain) this.sfxGain.gain.value = sfx;
    }
    if (ambient !== undefined) {
      this.volumes.ambient = ambient;
      if (this.ambientGain) this.ambientGain.gain.value = ambient;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.volumes.master;
    }
    return this.isMuted;
  }

  startMountainAmbience() {
    this.resume();
    if (!this.ctx || this.ambientPlaying) return;
    this.ambientPlaying = true;

    // Mountain wind (filtered pink/brown noise)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 1.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    filter.Q.value = 3.0;

    // Gentle LFO for wind gusting
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.15; // slow gust
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);
    whiteNoise.start();
    this.windNode = whiteNoise;

    // Occasional gentle mountain bird chirps
    this.scheduleNextBird();
  }

  scheduleNextBird() {
    const delay = 6000 + Math.random() * 8000;
    this.birdTimer = setTimeout(() => {
      if (this.ambientPlaying && !this.isMuted) {
        this.playBirdChirp();
      }
      this.scheduleNextBird();
    }, delay);
  }

  playBirdChirp() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    // Bird chirp pitch envelope
    const baseFreq = 2200 + Math.random() * 600;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 800, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, now + 0.18);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playClick() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playSnap() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
    this.showCaption('اتصال قطعه چوبی', '🪵');
  }

  playRopeTension() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.15);
    osc.frequency.linearRampToValueAtTime(210, now + 0.3);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 5;

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
    this.showCaption('کشش طناب', '🪢');
  }

  playPulleyWhir() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(480, now + 0.2);
    osc.frequency.linearRampToValueAtTime(360, now + 0.45);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.52);
    this.showCaption('چرخش قرقره', '⚙️');
  }

  playRollingSound() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.3);
    osc.frequency.linearRampToValueAtTime(100, now + 0.6);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.75);
    this.showCaption('حرکت روان چرخ و غلتک', '🪵');
  }

  playHeavyGrind() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.linearRampToValueAtTime(75, now + 0.3);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 240;

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.65);
    this.showCaption('اصطکاک شدید روی سنگ', '🪨');
  }

  playDiscoveryJingle() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Pentatonic celebratory chime (Dastgah inspired warm notes: D5, F#5, A5, B5, D6)
    const notes = [587.33, 739.99, 880.00, 987.77, 1174.66];
    notes.forEach((freq, idx) => {
      const noteOsc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const noteTime = now + idx * 0.1;

      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(freq, noteTime);

      noteGain.gain.setValueAtTime(0.001, noteTime);
      noteGain.gain.linearRampToValueAtTime(0.16, noteTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

      noteOsc.connect(noteGain);
      noteGain.connect(this.sfxGain);

      noteOsc.start(noteTime);
      noteOsc.stop(noteTime + 0.65);
    });
    this.showCaption('نوای موفقیت و کشف علمی!', '✨');
  }

  playGentleFanfare() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.12, noteTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 1.25);
    });
    this.showCaption('رسیدن به درمانگاه کوهستان!', '🏔️');
  }
}

export const sound = new SoundEngine();

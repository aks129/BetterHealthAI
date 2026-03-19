/**
 * Procedural Sci-Fi Audio Engine
 * Generates ambient music and sound effects using Web Audio API
 * Inspired by Sid Meier's Alpha Centauri soundtrack
 */

type GamePhaseAudio = 'title' | 'faction_select' | 'landing' | 'playing' | 'research' | 'diplomacy' | 'victory';
type SfxType = 'click' | 'select' | 'confirm' | 'cancel' | 'endturn' | 'combat' | 'research_complete' | 'base_founded' | 'diplomacy_change' | 'alert' | 'hover' | 'mindworm' | 'victory_fanfare';

interface FactionAudioTheme {
  baseFreq: number;
  scale: number[];
  padWaveform: OscillatorType;
  arpeggioSpeed: number;
  filterFreq: number;
  reverbDecay: number;
  detune: number;
  brightness: number;
  rhythm: number[];
}

const FACTION_THEMES: Record<string, FactionAudioTheme> = {
  collective: {
    baseFreq: 110, scale: [0, 3, 5, 7, 10, 12, 15], padWaveform: 'sawtooth',
    arpeggioSpeed: 0.25, filterFreq: 800, reverbDecay: 3, detune: -5, brightness: 0.4,
    rhythm: [1, 0, 0.5, 0, 1, 0, 0.5, 0.3],
  },
  drones: {
    baseFreq: 130.81, scale: [0, 2, 4, 7, 9, 12, 14], padWaveform: 'square',
    arpeggioSpeed: 0.4, filterFreq: 1200, reverbDecay: 2, detune: 0, brightness: 0.6,
    rhythm: [1, 0.3, 0.6, 0, 1, 0.3, 0.6, 0],
  },
  gaians: {
    baseFreq: 146.83, scale: [0, 2, 4, 5, 7, 9, 11, 12], padWaveform: 'sine',
    arpeggioSpeed: 0.15, filterFreq: 600, reverbDecay: 5, detune: 7, brightness: 0.3,
    rhythm: [1, 0, 0, 0.4, 0, 0.6, 0, 0],
  },
  prometheans: {
    baseFreq: 98, scale: [0, 1, 5, 7, 8, 12, 13], padWaveform: 'sawtooth',
    arpeggioSpeed: 0.5, filterFreq: 1500, reverbDecay: 1.5, detune: -12, brightness: 0.7,
    rhythm: [1, 0.8, 0, 0.6, 1, 0.8, 0, 0.6],
  },
  lucid: {
    baseFreq: 164.81, scale: [0, 2, 4, 6, 7, 11, 12], padWaveform: 'triangle',
    arpeggioSpeed: 0.3, filterFreq: 2000, reverbDecay: 4, detune: 5, brightness: 0.5,
    rhythm: [1, 0, 0.3, 0.6, 0, 0.3, 0.6, 0],
  },
  consciousness: {
    baseFreq: 123.47, scale: [0, 1, 4, 5, 7, 8, 11, 12], padWaveform: 'square',
    arpeggioSpeed: 0.35, filterFreq: 1800, reverbDecay: 3.5, detune: -3, brightness: 0.55,
    rhythm: [1, 0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5],
  },
  harmony: {
    baseFreq: 138.59, scale: [0, 2, 3, 5, 7, 8, 10, 12], padWaveform: 'sine',
    arpeggioSpeed: 0.12, filterFreq: 500, reverbDecay: 6, detune: 10, brightness: 0.25,
    rhythm: [1, 0, 0, 0, 0.5, 0, 0, 0],
  },
  council: {
    baseFreq: 155.56, scale: [0, 2, 4, 5, 7, 9, 11, 12], padWaveform: 'triangle',
    arpeggioSpeed: 0.2, filterFreq: 900, reverbDecay: 4, detune: 0, brightness: 0.45,
    rhythm: [1, 0, 0.4, 0, 0.7, 0, 0.4, 0],
  },
};

const DEFAULT_THEME: FactionAudioTheme = {
  baseFreq: 130.81, scale: [0, 2, 4, 5, 7, 9, 11, 12], padWaveform: 'triangle',
  arpeggioSpeed: 0.2, filterFreq: 1000, reverbDecay: 3, detune: 0, brightness: 0.4,
  rhythm: [1, 0, 0.5, 0, 1, 0, 0.5, 0],
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;

  // Music state
  private activePads: OscillatorNode[] = [];
  private activePadGains: GainNode[] = [];
  private activeFilters: BiquadFilterNode[] = [];
  private arpeggioInterval: ReturnType<typeof setInterval> | null = null;
  private atmosphereInterval: ReturnType<typeof setInterval> | null = null;
  private driftInterval: ReturnType<typeof setInterval> | null = null;
  private currentPhase: GamePhaseAudio | null = null;
  private currentFactionId: string | null = null;
  private currentTheme: FactionAudioTheme = DEFAULT_THEME;

  private _musicVolume = 0.35;
  private _sfxVolume = 0.5;
  private _muted = false;
  private initialized = false;

  get musicVolume() { return this._musicVolume; }
  get sfxVolume() { return this._sfxVolume; }
  get muted() { return this._muted; }

  async init() {
    if (this.initialized) return;
    try {
      this.ctx = new AudioContext();

      // Master chain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.ctx.destination);

      // Music bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this._musicVolume;

      // Reverb
      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this.createReverbIR(3);
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.value = 0.3;
      this.musicGain.connect(this.convolver);
      this.convolver.connect(this.reverbGain);
      this.reverbGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this._sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
    } catch {
      console.warn('Audio initialization failed');
    }
  }

  private createReverbIR(duration: number): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const rate = this.ctx.sampleRate;
    const length = rate * duration;
    const buffer = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    return buffer;
  }

  setMusicVolume(v: number) {
    this._musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this._muted ? 0 : this._musicVolume, this.ctx!.currentTime, 0.1);
    }
  }

  setSfxVolume(v: number) {
    this._sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(this._muted ? 0 : this._sfxVolume, this.ctx!.currentTime, 0.1);
    }
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this._muted ? 0 : 1, this.ctx.currentTime, 0.1);
    }
    return this._muted;
  }

  setMuted(muted: boolean) {
    this._muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this._muted ? 0 : 1, this.ctx.currentTime, 0.1);
    }
  }

  // ========= MUSIC SYSTEM =========

  setPhase(phase: GamePhaseAudio, factionId?: string) {
    if (!this.initialized) return;
    if (phase === this.currentPhase && factionId === this.currentFactionId) return;

    this.currentPhase = phase;
    if (factionId) this.currentFactionId = factionId;
    this.currentTheme = this.getTheme(factionId);

    this.stopMusic();

    switch (phase) {
      case 'title': this.playTitleMusic(); break;
      case 'faction_select': this.playFactionSelectMusic(); break;
      case 'landing': this.playLandingMusic(); break;
      case 'playing': this.playGameMusic(); break;
      case 'research': this.playResearchMusic(); break;
      case 'diplomacy': this.playDiplomacyMusic(); break;
      case 'victory': this.playVictoryMusic(); break;
    }
  }

  private getTheme(factionId?: string): FactionAudioTheme {
    if (!factionId) return DEFAULT_THEME;
    return FACTION_THEMES[factionId] || DEFAULT_THEME;
  }

  private stopMusic() {
    const t = this.ctx?.currentTime || 0;
    this.activePadGains.forEach(g => {
      try { g.gain.setTargetAtTime(0, t, 0.5); } catch {}
    });
    setTimeout(() => {
      this.activePads.forEach(o => { try { o.stop(); } catch {} });
      this.activePads = [];
      this.activePadGains = [];
      this.activeFilters = [];
    }, 1500);

    if (this.arpeggioInterval) { clearInterval(this.arpeggioInterval); this.arpeggioInterval = null; }
    if (this.atmosphereInterval) { clearInterval(this.atmosphereInterval); this.atmosphereInterval = null; }
    if (this.driftInterval) { clearInterval(this.driftInterval); this.driftInterval = null; }
  }

  // --- Title Screen: Vast, ethereal space ambient ---
  private playTitleMusic() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    // Deep drone pad
    this.createPad(55, 'sine', 0.08, t, 0);
    this.createPad(55.5, 'sine', 0.06, t, 0); // slight detune for width
    this.createPad(82.41, 'triangle', 0.04, t, 0);
    this.createPad(110, 'sine', 0.03, t, 5);

    // Slow ethereal arpeggio
    const titleScale = [0, 7, 12, 16, 19, 24];
    let noteIdx = 0;
    this.arpeggioInterval = setInterval(() => {
      if (!this.ctx || !this.musicGain) return;
      const freq = 220 * Math.pow(2, titleScale[noteIdx % titleScale.length] / 12);
      this.playTone(freq, 'sine', 0.015, 3, 0.5);
      noteIdx++;
    }, 3000);

    // Wind-like noise sweeps
    this.atmosphereInterval = setInterval(() => {
      this.playNoiseSweep(0.02, 4, 200, 600);
    }, 6000);
    this.playNoiseSweep(0.015, 5, 150, 500);
  }

  // --- Faction Select: Mysterious, anticipatory ---
  private playFactionSelectMusic() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    this.createPad(73.42, 'triangle', 0.06, t, 0);
    this.createPad(110, 'sine', 0.04, t, 3);
    this.createPad(146.83, 'triangle', 0.03, t, 7);

    // Gentle pulse
    const pulseNotes = [0, 3, 7, 12, 7, 3];
    let idx = 0;
    this.arpeggioInterval = setInterval(() => {
      if (!this.ctx) return;
      const freq = 220 * Math.pow(2, pulseNotes[idx % pulseNotes.length] / 12);
      this.playTone(freq, 'triangle', 0.012, 2, 0.3);
      idx++;
    }, 2200);
  }

  // --- Landing Sequence: Dramatic descent ---
  private playLandingMusic() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    // Rising tension drone
    this.createPad(65.41, 'sawtooth', 0.04, t, 0, 400);
    this.createPad(98, 'sine', 0.06, t, 0);
    this.createPad(130.81, 'triangle', 0.03, t, 5);

    // Accelerating heartbeat-like pulse
    let beatInterval = 1500;
    const doBeat = () => {
      if (!this.ctx || !this.musicGain) return;
      this.playTone(55, 'sine', 0.08, 0.3, 0.1);
      setTimeout(() => this.playTone(55, 'sine', 0.05, 0.2, 0.1), 200);
      beatInterval = Math.max(400, beatInterval * 0.92);
      this.arpeggioInterval = setTimeout(doBeat, beatInterval) as unknown as ReturnType<typeof setInterval>;
    };
    doBeat();

    // Atmospheric re-entry noise
    this.atmosphereInterval = setInterval(() => {
      this.playNoiseSweep(0.03, 2, 300, 1200);
    }, 3000);
    this.playNoiseSweep(0.025, 3, 200, 800);
  }

  // --- Main Gameplay: Rich ambient with faction personality ---
  private playGameMusic() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const theme = this.currentTheme;

    // Foundation pads (3 detuned layers)
    this.createPad(theme.baseFreq, theme.padWaveform, 0.05, t, 0, theme.filterFreq);
    this.createPad(theme.baseFreq * 1.002, 'sine', 0.04, t, theme.detune, theme.filterFreq * 0.8);
    this.createPad(theme.baseFreq * 1.5, 'triangle', 0.025, t, 0);
    this.createPad(theme.baseFreq * 2, 'sine', 0.015, t, 3);

    // Faction-colored arpeggio
    let noteIdx = 0;
    const arpeggioMs = (1 / theme.arpeggioSpeed) * 1000;
    this.arpeggioInterval = setInterval(() => {
      if (!this.ctx || !this.musicGain) return;
      const semitone = theme.scale[noteIdx % theme.scale.length];
      const octave = Math.floor(noteIdx / theme.scale.length);
      const freq = theme.baseFreq * 2 * Math.pow(2, (semitone + octave * 12) / 12);
      const vol = 0.008 + theme.brightness * 0.012;
      this.playTone(freq, 'triangle', vol, 2, 0.3);

      // Sometimes add a harmony
      if (Math.random() < 0.3) {
        const harmIdx = (noteIdx + 2) % theme.scale.length;
        const harmFreq = theme.baseFreq * 2 * Math.pow(2, theme.scale[harmIdx] / 12);
        this.playTone(harmFreq, 'sine', vol * 0.5, 2.5, 0.4);
      }
      noteIdx++;
    }, arpeggioMs);

    // Atmospheric texture
    this.atmosphereInterval = setInterval(() => {
      if (Math.random() < 0.5) {
        this.playNoiseSweep(0.01, 3, 100, theme.filterFreq * 0.5);
      }
      // Random alien chirp
      if (Math.random() < 0.2) {
        this.playAlienChirp();
      }
    }, 5000);

    // Slow pad drift - modulate filter frequency
    this.driftInterval = setInterval(() => {
      this.activeFilters.forEach(f => {
        if (!this.ctx) return;
        const drift = theme.filterFreq * (0.7 + Math.random() * 0.6);
        f.frequency.setTargetAtTime(drift, this.ctx.currentTime, 2);
      });
    }, 4000);
  }

  // --- Research: Contemplative, crystalline ---
  private playResearchMusic() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    this.createPad(220, 'sine', 0.04, t, 0);
    this.createPad(329.63, 'triangle', 0.025, t, 5);
    this.createPad(110, 'sine', 0.03, t, 0);

    // Glass-like tones
    const crystalNotes = [0, 4, 7, 11, 12, 16, 19];
    let idx = 0;
    this.arpeggioInterval = setInterval(() => {
      if (!this.ctx) return;
      const freq = 440 * Math.pow(2, crystalNotes[idx % crystalNotes.length] / 12);
      this.playTone(freq, 'sine', 0.008, 3, 0.2);
      // Bell harmonics
      this.playTone(freq * 2.76, 'sine', 0.003, 2, 0.1);
      idx++;
    }, 1800);
  }

  // --- Diplomacy: Tense, dialogic ---
  private playDiplomacyMusic() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    this.createPad(146.83, 'triangle', 0.04, t, 0, 700);
    this.createPad(185, 'sine', 0.03, t, -7);

    // Call-and-response pattern
    const callNotes = [0, 3, 7, 10];
    const responseNotes = [12, 10, 7, 3];
    let beat = 0;
    this.arpeggioInterval = setInterval(() => {
      if (!this.ctx) return;
      const isCall = beat % 8 < 4;
      const notes = isCall ? callNotes : responseNotes;
      const noteIdx = beat % 4;
      const freq = 196 * Math.pow(2, notes[noteIdx] / 12);
      this.playTone(freq, isCall ? 'triangle' : 'sine', 0.01, 1.5, 0.2);
      beat++;
    }, 1200);
  }

  // --- Victory: Triumphant, soaring ---
  private playVictoryMusic() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    // Major chord pad
    this.createPad(130.81, 'sine', 0.06, t, 0); // C3
    this.createPad(164.81, 'triangle', 0.04, t, 0); // E3
    this.createPad(196, 'sine', 0.04, t, 0); // G3
    this.createPad(261.63, 'triangle', 0.03, t, 5); // C4

    // Triumphant ascending arpeggios
    const victoryScale = [0, 4, 7, 12, 16, 19, 24, 28];
    let idx = 0;
    let ascending = true;
    this.arpeggioInterval = setInterval(() => {
      if (!this.ctx) return;
      const freq = 261.63 * Math.pow(2, victoryScale[idx] / 12);
      this.playTone(freq, 'triangle', 0.015, 2, 0.3);
      if (ascending) {
        idx++;
        if (idx >= victoryScale.length) { idx = victoryScale.length - 1; ascending = false; }
      } else {
        idx--;
        if (idx < 0) { idx = 0; ascending = true; }
      }
    }, 800);

    // Shimmering high-frequency texture
    this.atmosphereInterval = setInterval(() => {
      if (!this.ctx) return;
      const freq = 2000 + Math.random() * 2000;
      this.playTone(freq, 'sine', 0.003, 1, 0.1);
    }, 400);
  }

  // ========= PAD & TONE HELPERS =========

  private createPad(freq: number, type: OscillatorType, vol: number, startTime: number, detuneCents: number, filterFreq?: number) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detuneCents;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 3);

    osc.connect(gain);

    if (filterFreq) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;
      filter.Q.value = 1;
      gain.connect(filter);
      filter.connect(this.musicGain);
      this.activeFilters.push(filter);
    } else {
      gain.connect(this.musicGain);
    }

    osc.start(startTime);
    this.activePads.push(osc);
    this.activePadGains.push(gain);
  }

  private playTone(freq: number, type: OscillatorType, vol: number, dur: number, attack: number) {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + attack);
    gain.gain.setTargetAtTime(0, t + attack + dur * 0.3, dur * 0.3);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  private playNoiseSweep(vol: number, dur: number, freqLow: number, freqHigh: number) {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const bufSize = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freqLow, t);
    filter.frequency.linearRampToValueAtTime(freqHigh, t + dur * 0.5);
    filter.frequency.linearRampToValueAtTime(freqLow, t + dur);
    filter.Q.value = 2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + dur * 0.3);
    gain.gain.setTargetAtTime(0, t + dur * 0.6, dur * 0.2);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    src.start(t);
  }

  private playAlienChirp() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const baseFreq = 800 + Math.random() * 1200;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * (0.5 + Math.random()), t + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.006, t + 0.05);
    gain.gain.setTargetAtTime(0, t + 0.1, 0.15);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  // ========= SOUND EFFECTS =========

  playSfx(type: SfxType) {
    if (!this.ctx || !this.sfxGain || this._muted) return;
    try {
      switch (type) {
        case 'click': this.sfxClick(); break;
        case 'hover': this.sfxHover(); break;
        case 'select': this.sfxSelect(); break;
        case 'confirm': this.sfxConfirm(); break;
        case 'cancel': this.sfxCancel(); break;
        case 'endturn': this.sfxEndTurn(); break;
        case 'combat': this.sfxCombat(); break;
        case 'research_complete': this.sfxResearchComplete(); break;
        case 'base_founded': this.sfxBaseFounded(); break;
        case 'diplomacy_change': this.sfxDiplomacy(); break;
        case 'alert': this.sfxAlert(); break;
        case 'mindworm': this.sfxMindworm(); break;
        case 'victory_fanfare': this.sfxVictoryFanfare(); break;
      }
    } catch {}
  }

  private sfxTone(freq: number, type: OscillatorType, vol: number, dur: number, attack: number = 0.01) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + attack);
    gain.gain.setTargetAtTime(0, t + attack, dur * 0.4);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  private sfxSweep(startFreq: number, endFreq: number, type: OscillatorType, vol: number, dur: number) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.setTargetAtTime(0, t + dur * 0.5, dur * 0.25);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  private sfxClick() {
    this.sfxTone(1200, 'sine', 0.08, 0.08);
    this.sfxTone(1800, 'sine', 0.04, 0.05);
  }

  private sfxHover() {
    this.sfxTone(2400, 'sine', 0.02, 0.06);
  }

  private sfxSelect() {
    this.sfxSweep(400, 800, 'triangle', 0.1, 0.15);
    this.sfxTone(1200, 'sine', 0.05, 0.1);
  }

  private sfxConfirm() {
    this.sfxSweep(600, 1200, 'sine', 0.12, 0.2);
    setTimeout(() => this.sfxTone(1500, 'sine', 0.08, 0.15), 100);
  }

  private sfxCancel() {
    this.sfxSweep(800, 300, 'triangle', 0.1, 0.2);
  }

  private sfxEndTurn() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    // Sweeping whoosh
    this.sfxSweep(200, 600, 'sine', 0.1, 0.3);
    // Confirmation chord
    setTimeout(() => {
      this.sfxTone(523, 'sine', 0.06, 0.4, 0.05);
      this.sfxTone(659, 'triangle', 0.04, 0.4, 0.05);
      this.sfxTone(784, 'sine', 0.03, 0.4, 0.05);
    }, 200);
  }

  private sfxCombat() {
    if (!this.ctx || !this.sfxGain) return;
    // Impact noise burst
    const t = this.ctx.currentTime;
    const bufSize = this.ctx.sampleRate * 0.3;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 3);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.15;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);

    // Metallic ring
    this.sfxTone(180, 'sawtooth', 0.08, 0.2);
    setTimeout(() => this.sfxSweep(500, 200, 'triangle', 0.06, 0.15), 100);
  }

  private sfxResearchComplete() {
    // Ascending crystalline tones
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.sfxTone(freq, 'sine', 0.08, 0.6, 0.02);
        this.sfxTone(freq * 2, 'sine', 0.03, 0.4, 0.02);
      }, i * 150);
    });
  }

  private sfxBaseFounded() {
    // Deep foundation tone + rising confirmation
    this.sfxTone(130.81, 'sine', 0.12, 0.8, 0.05);
    setTimeout(() => this.sfxSweep(200, 500, 'triangle', 0.08, 0.4), 200);
    setTimeout(() => this.sfxTone(523, 'sine', 0.06, 0.5, 0.03), 400);
  }

  private sfxDiplomacy() {
    // Two-note chime
    this.sfxTone(440, 'triangle', 0.08, 0.3);
    setTimeout(() => this.sfxTone(554, 'triangle', 0.06, 0.3), 200);
  }

  private sfxAlert() {
    // Warning pulse
    this.sfxTone(880, 'square', 0.06, 0.1);
    setTimeout(() => this.sfxTone(880, 'square', 0.06, 0.1), 200);
    setTimeout(() => this.sfxTone(660, 'square', 0.08, 0.2), 400);
  }

  private sfxMindworm() {
    if (!this.ctx || !this.sfxGain) return;
    // Eerie alien sound
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.2);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.5);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.7);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
    gain.gain.setTargetAtTime(0, t + 0.5, 0.15);

    // Tremolo
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 8;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.8);
    lfo.stop(t + 0.8);
  }

  private sfxVictoryFanfare() {
    // Grand ascending chord sequence
    const chords = [
      [261.63, 329.63, 392],
      [293.66, 369.99, 440],
      [329.63, 415.30, 523.25],
      [392, 493.88, 587.33],
    ];
    chords.forEach((chord, i) => {
      setTimeout(() => {
        chord.forEach(freq => {
          this.sfxTone(freq, 'sine', 0.08, 1, 0.05);
          this.sfxTone(freq * 2, 'triangle', 0.03, 0.8, 0.05);
        });
      }, i * 400);
    });
  }

  // Resume context if suspended (needed for browsers that suspend on load)
  async resume() {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  destroy() {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}

// Singleton
export const audioEngine = new AudioEngine();
export type { SfxType, GamePhaseAudio };

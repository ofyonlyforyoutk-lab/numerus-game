/**
 * NUMERUS - Sound Engine
 * All sounds synthesized with Web Audio API - no external files needed.
 * Medieval/mystical themed sound effects.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = true;
    this.musicGain = null;
    this.musicPlaying = false;
    this.musicTimer = null;
  }

  /**
   * Initialize audio context (must be called after user gesture)
   */
  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.08;
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Audio not supported', e);
    }
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Play a tone with envelope
   */
  playTone({ freq = 440, type = 'sine', duration = 0.2, gain = 0.3, decay = 0.05, delay = 0 }) {
    if (!this.enabled || !this.ctx) return;
    
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    
    osc.connect(g);
    g.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + duration + decay);
  }

  /**
   * Play a chord (multiple tones)
   */
  playChord(freqs, { type = 'sine', duration = 0.4, gain = 0.15, delay = 0 } = {}) {
    freqs.forEach((f, i) => {
      this.playTone({ freq: f, type, duration, gain, delay: delay + i * 0.02 });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // GAME SOUNDS
  // ═══════════════════════════════════════════════════════════════

  /** UI Click */
  click() {
    this.playTone({ freq: 520, type: 'triangle', duration: 0.08, gain: 0.2 });
  }

  /** Hover */
  hover() {
    this.playTone({ freq: 660, type: 'sine', duration: 0.04, gain: 0.08 });
  }

  /** Card deal/flip */
  cardDeal() {
    this.playTone({ freq: 300, type: 'triangle', duration: 0.1, gain: 0.25 });
    this.playTone({ freq: 450, type: 'triangle', duration: 0.12, gain: 0.2, delay: 0.05 });
  }

  /** Page turn (codex) - paper rustle */
  pageTurn() {
    this.playTone({ freq: 1600, type: 'triangle', duration: 0.06, gain: 0.08 });
    this.playTone({ freq: 1200, type: 'triangle', duration: 0.08, gain: 0.1, delay: 0.05 });
    this.playTone({ freq: 800, type: 'triangle', duration: 0.1, gain: 0.12, delay: 0.1 });
  }

  /** Card select/click */
  cardSelect() {
    this.playTone({ freq: 880, type: 'sine', duration: 0.15, gain: 0.2 });
    this.playTone({ freq: 1320, type: 'sine', duration: 0.1, gain: 0.1, delay: 0.02 });
  }

  /** Coin/bet sound */
  bet() {
    this.playTone({ freq: 784, type: 'triangle', duration: 0.12, gain: 0.25 });
    this.playTone({ freq: 988, type: 'triangle', duration: 0.15, gain: 0.2, delay: 0.08 });
    this.playTone({ freq: 1319, type: 'triangle', duration: 0.2, gain: 0.15, delay: 0.16 });
  }

  /** Equation submitted */
  equationSubmit() {
    this.playChord([392, 523, 659], { type: 'sine', duration: 0.3, gain: 0.2 });
    this.playTone({ freq: 784, type: 'triangle', duration: 0.3, gain: 0.15, delay: 0.15 });
  }

  /** Destiny chosen - mystical */
  destiny() {
    this.playChord([523, 659, 784, 1047], { type: 'sine', duration: 0.5, gain: 0.15 });
    this.playTone({ freq: 1568, type: 'sine', duration: 0.4, gain: 0.1, delay: 0.2 });
  }

  /** Reveal - suspense */
  reveal() {
    this.playTone({ freq: 262, type: 'sawtooth', duration: 0.4, gain: 0.1 });
    this.playTone({ freq: 330, type: 'sawtooth', duration: 0.5, gain: 0.1, delay: 0.1 });
    this.playTone({ freq: 392, type: 'sawtooth', duration: 0.6, gain: 0.1, delay: 0.2 });
    this.playTone({ freq: 523, type: 'triangle', duration: 0.7, gain: 0.2, delay: 0.3 });
  }

  /** Victory fanfare */
  victory() {
    this.playChord([523, 659, 784], { type: 'triangle', duration: 0.3, gain: 0.2 });
    this.playChord([659, 784, 1047], { type: 'triangle', duration: 0.3, gain: 0.2, delay: 0.15 });
    this.playChord([784, 1047, 1319], { type: 'triangle', duration: 0.5, gain: 0.2, delay: 0.3 });
    // Add final flourish
    this.playTone({ freq: 1568, type: 'sine', duration: 0.8, gain: 0.15, delay: 0.5 });
    this.playTone({ freq: 2093, type: 'sine', duration: 0.8, gain: 0.1, delay: 0.6 });
  }

  /** Defeat */
  defeat() {
    this.playChord([392, 330, 262], { type: 'sine', duration: 0.5, gain: 0.15 });
    this.playTone({ freq: 196, type: 'sine', duration: 0.8, gain: 0.12, delay: 0.3 });
  }

  /** Error */
  error() {
    this.playTone({ freq: 180, type: 'square', duration: 0.2, gain: 0.15 });
    this.playTone({ freq: 140, type: 'square', duration: 0.25, gain: 0.15, delay: 0.1 });
  }

  /** Round transition - mystical chime */
  roundTransition() {
    this.playChord([392, 523, 659], { type: 'sine', duration: 0.6, gain: 0.12 });
    this.playTone({ freq: 784, type: 'sine', duration: 0.8, gain: 0.08, delay: 0.2 });
  }

  /** CPU thinking */
  cpuThink() {
    this.playTone({ freq: 440, type: 'sine', duration: 0.1, gain: 0.05 });
    this.playTone({ freq: 494, type: 'sine', duration: 0.1, gain: 0.05, delay: 0.15 });
  }

  /** Fold */
  fold() {
    this.playTone({ freq: 300, type: 'triangle', duration: 0.2, gain: 0.15 });
    this.playTone({ freq: 220, type: 'triangle', duration: 0.3, gain: 0.1, delay: 0.1 });
  }

  /** Menu ambient - start background music */
  startMusic() {
    if (this.musicPlaying) return;
    this.init();
    if (!this.ctx) return;
    
    this.musicPlaying = true;
    this.musicTimer = setInterval(() => {
      if (!this.musicPlaying) return;
      this.playMenuNote();
    }, 1800);
  }

  playMenuNote() {
    if (!this.ctx || !this.musicGain) return;
    // Simple ambient pattern - low mystical notes
    const notes = [220, 262, 196, 247, 220, 294];
    const note = notes[Math.floor(Math.random() * notes.length)];
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, t);
    
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
    
    osc.connect(g);
    g.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + 3.2);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

// Singleton
export const sound = new SoundEngine();
export default sound;

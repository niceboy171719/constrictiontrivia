class SoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const length = Math.floor(ctx.sampleRate * 0.03);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  unlock() {
    this.ensureContext();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    gainLevel = 0.08,
    delay = 0
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playKeyType(isDelete = false) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Crisp mechanical key-switch click transient
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = this.getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isDelete ? 1400 : 2500 + Math.random() * 450, now);
    filter.Q.setValueAtTime(2.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(isDelete ? 0.045 : 0.065, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSrc.start(now);
    noiseSrc.stop(now + 0.022);

    // 2. Subtle pitched keycap pip
    const baseFreq = isDelete ? 460 : 860 + (Math.random() - 0.5) * 140;
    this.playTone(baseFreq, 0.024, 'triangle', isDelete ? 0.035 : 0.045, 0);
  }

  playAppleEat() {
    this.playTone(440, 0.07, 'square', 0.08, 0);
    this.playTone(660, 0.09, 'square', 0.08, 0.055);
  }

  playCorrect() {
    // Punchy 4-note ascending chime with octave sparkle
    this.playTone(523.25, 0.075, 'square', 0.095, 0);
    this.playTone(659.25, 0.075, 'square', 0.095, 0.055);
    this.playTone(783.99, 0.085, 'square', 0.1, 0.11);
    this.playTone(1046.5, 0.18, 'square', 0.11, 0.165);
    this.playTone(1046.5, 0.2, 'triangle', 0.09, 0.165);
  }

  playWrong() {
    this.playTone(190, 0.12, 'sawtooth', 0.07, 0);
    this.playTone(150, 0.14, 'sawtooth', 0.06, 0.09);
  }

  playUrgentTick() {
    this.playTone(880, 0.035, 'triangle', 0.045, 0);
  }

  playGameOver() {
    this.playTone(300, 0.14, 'sawtooth', 0.08, 0);
    this.playTone(220, 0.14, 'sawtooth', 0.08, 0.12);
    this.playTone(140, 0.28, 'sawtooth', 0.08, 0.24);
  }

  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, idx === notes.length - 1 ? 0.25 : 0.1, 'square', 0.09, idx * 0.09);
    });
  }
}

export const soundEngine = new SoundEngine();

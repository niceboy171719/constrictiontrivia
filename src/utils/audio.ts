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
    const jitter = 0.92 + Math.random() * 0.16;

    // 1. Crisp keycap transient click (short filtered noise, no pitched beep)
    const clickSrc = ctx.createBufferSource();
    clickSrc.buffer = this.getNoiseBuffer(ctx);

    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime((isDelete ? 1900 : 3100) * jitter, now);
    clickFilter.Q.setValueAtTime(1.4, now);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(isDelete ? 0.07 : 0.095, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.011);

    clickSrc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickSrc.start(now);
    clickSrc.stop(now + 0.014);

    // 2. Muted housing bottom-out thock (rapid downward pitch drop, ~18ms)
    const thockOsc = ctx.createOscillator();
    const thockGain = ctx.createGain();
    thockOsc.type = 'sine';
    const startHz = (isDelete ? 145 : 210) * jitter;
    const endHz = (isDelete ? 62 : 78) * jitter;
    thockOsc.frequency.setValueAtTime(startHz, now);
    thockOsc.frequency.exponentialRampToValueAtTime(endHz, now + 0.018);

    thockGain.gain.setValueAtTime(isDelete ? 0.075 : 0.065, now);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.021);

    thockOsc.connect(thockGain);
    thockGain.connect(ctx.destination);
    thockOsc.start(now);
    thockOsc.stop(now + 0.024);
  }

  playAppleEat() {
    this.playTone(440, 0.07, 'square', 0.08, 0);
    this.playTone(660, 0.09, 'square', 0.08, 0.055);
  }

  playCorrect() {
    // Crisp 2-note confirmation chime (G5 -> C6), distinct from apple eat
    this.playTone(783.99, 0.085, 'triangle', 0.13, 0);
    this.playTone(1046.5, 0.19, 'triangle', 0.14, 0.075);
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

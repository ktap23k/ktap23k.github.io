import { AUDIO } from './config.js';

export class AudioManager {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.ctx = null;
    this.masterGain = null;
    this.noiseBuffer = null;
    this.ambientNode = null;
  }

  _ensureContext() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.enabled ? AUDIO.masterVolume : 0;
      this.masterGain.connect(this.ctx.destination);
      this._createNoiseBuffer();
    }
    return this.ctx;
  }

  _createNoiseBuffer() {
    if (!this.ctx) return;
    const size = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  resume() {
    const ctx = this._ensureContext();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        enabled ? AUDIO.masterVolume : 0,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  _now() {
    const ctx = this._ensureContext();
    return ctx ? ctx.currentTime : 0;
  }

  _tone({ frequency, type = 'sine', duration, volume, attack = 0.01, decay = 0.1, slide = 0 }) {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (slide) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, frequency + slide), now + duration);
    }

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration);
  }

  shoot(pitchVar = 0) {
    const base = 880 + pitchVar * 120;
    this._tone({
      frequency: base,
      type: 'square',
      duration: 0.12,
      volume: AUDIO.shootVolume,
      attack: 0.005,
      decay: 0.08,
      slide: -base * 0.4,
    });
  }

  explosion(size = 1) {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx || !this.noiseBuffer) return;

    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800 * size, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25 * size);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(AUDIO.explosionVolume * size, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25 * size);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(ctx.currentTime);
    source.stop(ctx.currentTime + 0.3 * size);
  }

  hit() {
    this._tone({
      frequency: 180,
      type: 'sawtooth',
      duration: 0.1,
      volume: AUDIO.hitVolume,
      attack: 0.005,
      decay: 0.07,
      slide: -100,
    });
  }

  powerup() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [660, 880, 1100];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(AUDIO.powerupVolume, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.2);
    });
  }

  levelUp() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(AUDIO.levelUpVolume, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  }

  startAmbient() {
    if (!this.enabled || this.ambientNode) return;
    const ctx = this._ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 55;
    gain.gain.value = 0.02;

    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    lfo.start();

    this.ambientNode = { osc, gain, lfo, lfoGain };
  }

  stopAmbient() {
    if (!this.ambientNode) return;
    const { osc, lfo } = this.ambientNode;
    osc.stop();
    lfo.stop();
    this.ambientNode = null;
  }
}

/* =========================================
   MATH JUMP ADVENTURE — AUDIO MANAGER
   =========================================
   Tất cả âm thanh được generate programmatically
   bằng Web Audio API, không dùng file audio bên ngoài.
   ========================================= */

const AudioManager = (function () {
  let ctx = null;
  let masterGain = null;
  let bgmGain = null;
  let sfxGain = null;
  let bgmNodes = null;
  let bgmNextNoteTime = 0;
  let bgmTimerId = null;
  let bgmPlaying = false;
  let bgmPausedAt = 0;

  const settings = {
    bgm: true,
    sfx: true,
    bgmPitch: 1
  };

  function init() {
    if (ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);

    bgmGain = ctx.createGain();
    bgmGain.gain.value = settings.bgm ? 0.22 : 0;
    bgmGain.connect(masterGain);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = settings.sfx ? 1 : 0;
    sfxGain.connect(masterGain);
  }

  function resume() {
    init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function setBgm(enabled) {
    settings.bgm = !!enabled;
    if (bgmGain) bgmGain.gain.value = settings.bgm ? 0.22 : 0;
    saveAudioSettings();
  }

  function setSfx(enabled) {
    settings.sfx = !!enabled;
    if (sfxGain) sfxGain.gain.value = settings.sfx ? 1 : 0;
    saveAudioSettings();
  }

  function getSettings() {
    return { bgm: settings.bgm, sfx: settings.sfx };
  }

  function loadAudioSettings(saved) {
    if (saved && typeof saved.bgm === 'boolean') settings.bgm = saved.bgm;
    if (saved && typeof saved.sfx === 'boolean') settings.sfx = saved.sfx;
    if (bgmGain) bgmGain.gain.value = settings.bgm ? 0.22 : 0;
    if (sfxGain) sfxGain.gain.value = settings.sfx ? 1 : 0;
  }

  function saveAudioSettings() {
    try {
      const progress = JSON.parse(localStorage.getItem('mathjump_progress') || '{}');
      progress.audioSettings = getSettings();
      localStorage.setItem('mathjump_progress', JSON.stringify(progress));
    } catch (e) { /* ignore */ }
  }

  /* ---------- Utility nodes ---------- */
  function createOsc(type, freq, startTime, duration, gainEnvelope, dest) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    if (Array.isArray(gainEnvelope)) {
      gainEnvelope.forEach(pt => {
        const t = startTime + pt.t;
        if (pt.type === 'exp') gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, pt.v), t);
        else gain.gain.linearRampToValueAtTime(pt.v, t);
      });
    }
    osc.connect(gain);
    gain.connect(dest || sfxGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
    return { osc, gain };
  }

  function noiseBuffer() {
    const len = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  /* ---------- SFX ---------- */
  function playJump() {
    if (!ctx || !settings.sfx) return;
    const t = ctx.currentTime;
    const env = [{ t: 0, v: 0.25 }, { t: 0.06, v: 0.25, type: 'exp' }, { t: 0.22, v: 0.001, type: 'exp' }];
    const o = createOsc('sine', 220, t, 0.25, env);
    o.osc.frequency.exponentialRampToValueAtTime(520, t + 0.12);
  }

  function playDoubleJump() {
    if (!ctx || !settings.sfx) return;
    const t = ctx.currentTime;
    const env = [{ t: 0, v: 0.2 }, { t: 0.05, v: 0.2, type: 'exp' }, { t: 0.2, v: 0.001, type: 'exp' }];
    const o = createOsc('triangle', 350, t, 0.22, env);
    o.osc.frequency.exponentialRampToValueAtTime(760, t + 0.12);
    // swish
    const swish = ctx.createBufferSource();
    swish.buffer = noiseBuffer();
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.04, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(900, t);
    bpf.frequency.linearRampToValueAtTime(2200, t + 0.18);
    swish.connect(bpf);
    bpf.connect(sg);
    sg.connect(sfxGain);
    swish.start(t);
    swish.stop(t + 0.2);
  }

  function playCorrect() {
    if (!ctx || !settings.sfx) return;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
    notes.forEach((freq, i) => {
      const env = [{ t: 0, v: 0 }, { t: 0.01, v: 0.18 }, { t: 0.12, v: 0.001, type: 'exp' }];
      createOsc('sine', freq, t + i * 0.07, 0.16, env);
    });
  }

  function playWrong() {
    if (!ctx || !settings.sfx) return;
    const t = ctx.currentTime;
    const env = [{ t: 0, v: 0.22 }, { t: 0.05, v: 0.22, type: 'exp' }, { t: 0.32, v: 0.001, type: 'exp' }];
    const o = createOsc('sawtooth', 180, t, 0.35, env);
    o.osc.frequency.exponentialRampToValueAtTime(110, t + 0.32);
  }

  function playHit() {
    if (!ctx || !settings.sfx) return;
    const t = ctx.currentTime;
    const env = [{ t: 0, v: 0.28 }, { t: 0.04, v: 0.28, type: 'exp' }, { t: 0.25, v: 0.001, type: 'exp' }];
    const o = createOsc('square', 160, t, 0.28, env);
    o.osc.frequency.exponentialRampToValueAtTime(90, t + 0.24);
    // noise thud
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.18, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 600;
    src.connect(lpf);
    lpf.connect(ng);
    ng.connect(sfxGain);
    src.start(t);
    src.stop(t + 0.22);
  }

  function playFall() {
    if (!ctx || !settings.sfx) return;
    const t = ctx.currentTime;
    const env = [{ t: 0, v: 0.18 }, { t: 0.05, v: 0.18, type: 'exp' }, { t: 0.45, v: 0.001, type: 'exp' }];
    const o = createOsc('sine', 360, t, 0.48, env);
    o.osc.frequency.exponentialRampToValueAtTime(90, t + 0.45);
  }

  function playPowerup(type) {
    if (!ctx || !settings.sfx) return;
    const t = ctx.currentTime;
    if (type === 'life') {
      const env = [{ t: 0, v: 0 }, { t: 0.02, v: 0.22 }, { t: 0.18, v: 0.001, type: 'exp' }];
      createOsc('sine', 880, t, 0.2, env);
      setTimeout(() => {
        if (!ctx || !settings.sfx) return;
        const t2 = ctx.currentTime;
        createOsc('sine', 1109, t2, 0.18, env);
      }, 90);
    } else if (type === 'invincible') {
      const notes = [987.77, 1318.51, 1567.98, 1975.53]; // B5 E6 G6 B6
      notes.forEach((freq, i) => {
        const env = [{ t: 0, v: 0 }, { t: 0.01, v: 0.12 }, { t: 0.1, v: 0.001, type: 'exp' }];
        createOsc('sine', freq, t + i * 0.06, 0.14, env);
      });
    } else if (type === 'highjump') {
      const env = [{ t: 0, v: 0 }, { t: 0.02, v: 0.18 }, { t: 0.22, v: 0.001, type: 'exp' }];
      const o = createOsc('sine', 300, t, 0.25, env);
      o.osc.frequency.exponentialRampToValueAtTime(900, t + 0.22);
      // wind swoosh
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer();
      const sg = ctx.createGain();
      sg.gain.setValueAtTime(0.05, t);
      sg.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.setValueAtTime(500, t);
      bpf.frequency.linearRampToValueAtTime(1800, t + 0.25);
      src.connect(bpf);
      bpf.connect(sg);
      sg.connect(sfxGain);
      src.start(t);
      src.stop(t + 0.26);
    }
  }

  function playCheckpoint() {
    if (!ctx || !settings.sfx) return;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const env = [{ t: 0, v: 0 }, { t: 0.02, v: 0.2 }, { t: 0.14, v: 0.001, type: 'exp' }];
      createOsc('triangle', freq, t + i * 0.1, 0.18, env);
    });
  }

  function playGameOver() {
    if (!ctx || !settings.sfx) return;
    const t = ctx.currentTime;
    const notes = [392, 349.23, 293.66, 261.63]; // G4 F4 D4 C4
    notes.forEach((freq, i) => {
      const env = [{ t: 0, v: 0 }, { t: 0.06, v: 0.22 }, { t: 0.34, v: 0.001, type: 'exp' }];
      createOsc('sawtooth', freq, t + i * 0.28, 0.42, env);
    });
  }

  function playClick() {
    if (!ctx || !settings.sfx) return;
    const t = ctx.currentTime;
    const env = [{ t: 0, v: 0.12 }, { t: 0.02, v: 0.001, type: 'exp' }];
    createOsc('sine', 800, t, 0.05, env);
  }

  /* ---------- BGM (procedural chiptune loop) ---------- */
  const BGMMelody = [
    { n: 'C5', d: 0.25 }, { n: 'E5', d: 0.25 }, { n: 'G5', d: 0.25 }, { n: 'C6', d: 0.25 },
    { n: 'A5', d: 0.25 }, { n: 'G5', d: 0.25 }, { n: 'E5', d: 0.5 },
    { n: 'D5', d: 0.25 }, { n: 'F5', d: 0.25 }, { n: 'A5', d: 0.25 }, { n: 'F5', d: 0.25 },
    { n: 'G5', d: 0.25 }, { n: 'F5', d: 0.25 }, { n: 'E5', d: 0.5 },
    { n: 'C5', d: 0.25 }, { n: 'E5', d: 0.25 }, { n: 'G5', d: 0.25 }, { n: 'E5', d: 0.25 },
    { n: 'D5', d: 0.25 }, { n: 'E5', d: 0.25 }, { n: 'C5', d: 0.5 }
  ];

  const noteFreqs = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77,
    C6: 1046.5, D6: 1174.66, E6: 1318.51, F6: 1396.92, G6: 1567.98, A6: 1760
  };

  function scheduleBgmNote(note, time) {
    const freq = noteFreqs[note.n] || 440;
    const dur = note.d * 0.55;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq * settings.bgmPitch;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(bgmGain);
    osc.start(time);
    osc.stop(time + dur);

    // simple bass accompaniment every beat
    if (note.n === 'C5' || note.n === 'G5' || note.n === 'A5' || note.n === 'F5' || note.n === 'D5') {
      const bassFreq = noteFreqs[note.n.replace('5', '4').replace('6', '5')] || freq * 0.5;
      const bass = ctx.createOscillator();
      const bg = ctx.createGain();
      bass.type = 'square';
      bass.frequency.value = bassFreq * settings.bgmPitch;
      bg.gain.setValueAtTime(0.0001, time);
      bg.gain.linearRampToValueAtTime(0.05, time + 0.02);
      bg.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 600;
      bass.connect(lpf);
      lpf.connect(bg);
      bg.connect(bgmGain);
      bass.start(time);
      bass.stop(time + 0.2);
    }
  }

  function bgmScheduler() {
    if (!ctx || !bgmPlaying) return;
    const secondsPerBeat = 0.38 / settings.bgmPitch;
    const lookahead = 0.1;
    while (bgmNextNoteTime < ctx.currentTime + lookahead) {
      const note = BGMMelody[Math.floor(bgmNextNoteTime / secondsPerBeat) % BGMMelody.length];
      scheduleBgmNote(note, bgmNextNoteTime);
      bgmNextNoteTime += secondsPerBeat;
    }
    bgmTimerId = setTimeout(bgmScheduler, 50);
  }

  function startBgm() {
    resume();
    if (!ctx || bgmPlaying) return;
    bgmPlaying = true;
    bgmNextNoteTime = ctx.currentTime + 0.05;
    bgmScheduler();
  }

  function stopBgm() {
    bgmPlaying = false;
    if (bgmTimerId) {
      clearTimeout(bgmTimerId);
      bgmTimerId = null;
    }
  }

  function pauseBgm() {
    if (!bgmPlaying) return;
    bgmPausedAt = ctx ? ctx.currentTime : 0;
    stopBgm();
  }

  function unpauseBgm() {
    if (settings.bgm) startBgm();
  }

  function setBgmPitch(pitch) {
    settings.bgmPitch = Math.max(0.8, Math.min(1.5, pitch));
  }

  return {
    init,
    resume,
    setBgm,
    setSfx,
    getSettings,
    loadAudioSettings,
    playJump,
    playDoubleJump,
    playCorrect,
    playWrong,
    playHit,
    playFall,
    playPowerup,
    playCheckpoint,
    playGameOver,
    playClick,
    startBgm,
    stopBgm,
    pauseBgm,
    unpauseBgm,
    setBgmPitch
  };
})();

if (typeof window !== 'undefined') {
  window.AudioManager = AudioManager;
}

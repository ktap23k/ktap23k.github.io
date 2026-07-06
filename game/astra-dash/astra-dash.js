(function() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const storageKey = 'astra_dash_highscore';

  const ui = {
    hud: document.getElementById('hud'),
    score: document.getElementById('scoreText'),
    combo: document.getElementById('comboText'),
    hearts: document.getElementById('heartText'),
    heartIcons: document.getElementById('heartIcons'),
    energy: document.getElementById('energyFill'),
    start: document.getElementById('startScreen'),
    pause: document.getElementById('pauseScreen'),
    over: document.getElementById('gameOverScreen'),
    bestStart: document.getElementById('bestStart'),
    finalScore: document.getElementById('finalScore'),
    finalBest: document.getElementById('finalBest'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    audioBtn: document.getElementById('audioBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    restartPauseBtn: document.getElementById('restartPauseBtn')
  };

  const input = {
    left: false,
    right: false,
    jumpQueued: false,
    dashQueued: false
  };

  const view = {
    w: 0,
    h: 0,
    dpr: 1,
    ground: 0
  };

  const game = {
    state: 'start',
    time: 0,
    last: 0,
    speed: 430,
    score: 0,
    distance: 0,
    best: Number(localStorage.getItem(storageKey) || 0),
    combo: 1,
    comboClock: 0,
    shake: 0,
    spawnObstacle: 0,
    spawnCrystal: 0,
    spawnPower: 9,
    obstacles: [],
    crystals: [],
    powers: [],
    particles: []
  };

  const player = {
    x: 0,
    y: 0,
    w: 46,
    h: 82,
    vy: 0,
    hearts: 3,
    energy: 42,
    invincible: 0,
    dash: 0,
    run: 0,
    hurt: 0,
    landPulse: 0,
    grounded: true
  };

  let displayedHearts = -1;

  const audio = {
    ctx: null,
    master: null,
    music: null,
    sfx: null,
    enabled: localStorage.getItem('astra_dash_audio') !== 'off',
    nextNoteTime: 0,
    note: 0,
    melody: [659, 784, 988, 880, 784, 659, 587, 659, 784, 1047, 988, 784, 659, 523, 587, 659],
    bass: [165, 196, 220, 196, 147, 165, 196, 220]
  };

  function setupAudio() {
    if (audio.ctx || !audio.enabled) return;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;

    audio.ctx = new AudioCtor();
    audio.master = audio.ctx.createGain();
    audio.music = audio.ctx.createGain();
    audio.sfx = audio.ctx.createGain();
    audio.master.gain.value = 0.72;
    audio.music.gain.value = 0.24;
    audio.sfx.gain.value = 0.45;
    audio.music.connect(audio.master);
    audio.sfx.connect(audio.master);
    audio.master.connect(audio.ctx.destination);
  }

  function ensureAudio() {
    if (!audio.enabled) return false;
    setupAudio();
    if (!audio.ctx) return false;
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    return true;
  }

  function updateAudioButton() {
    ui.audioBtn.textContent = audio.enabled ? '♪' : '×';
    ui.audioBtn.setAttribute('aria-label', audio.enabled ? 'Tắt nhạc' : 'Bật nhạc');
    ui.audioBtn.classList.toggle('is-muted', !audio.enabled);
  }

  function scheduleTone(freq, start, duration, type, volume, destination) {
    if (!audio.ctx || !destination) return;
    const osc = audio.ctx.createOscillator();
    const gain = audio.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function playSfx(kind) {
    if (!ensureAudio()) return;
    const now = audio.ctx.currentTime;
    if (kind === 'jump') {
      scheduleTone(392, now, 0.08, 'triangle', 0.12, audio.sfx);
      scheduleTone(659, now + 0.045, 0.12, 'sine', 0.1, audio.sfx);
    } else if (kind === 'dash') {
      scheduleTone(988, now, 0.08, 'sawtooth', 0.1, audio.sfx);
      scheduleTone(1480, now + 0.035, 0.12, 'triangle', 0.08, audio.sfx);
    } else if (kind === 'collect') {
      scheduleTone(880, now, 0.07, 'sine', 0.1, audio.sfx);
      scheduleTone(1175, now + 0.055, 0.08, 'sine', 0.1, audio.sfx);
    } else if (kind === 'power') {
      scheduleTone(523, now, 0.08, 'triangle', 0.1, audio.sfx);
      scheduleTone(784, now + 0.06, 0.1, 'triangle', 0.11, audio.sfx);
      scheduleTone(1047, now + 0.13, 0.16, 'sine', 0.12, audio.sfx);
    } else if (kind === 'hit') {
      scheduleTone(196, now, 0.16, 'sawtooth', 0.12, audio.sfx);
      scheduleTone(147, now + 0.04, 0.22, 'square', 0.06, audio.sfx);
    } else if (kind === 'break') {
      scheduleTone(740, now, 0.08, 'sawtooth', 0.08, audio.sfx);
      scheduleTone(370, now + 0.055, 0.12, 'triangle', 0.09, audio.sfx);
    } else if (kind === 'over') {
      scheduleTone(330, now, 0.14, 'triangle', 0.1, audio.sfx);
      scheduleTone(247, now + 0.12, 0.18, 'triangle', 0.09, audio.sfx);
      scheduleTone(185, now + 0.28, 0.34, 'sine', 0.08, audio.sfx);
    } else if (kind === 'land') {
      scheduleTone(220, now, 0.06, 'triangle', 0.06, audio.sfx);
    }
  }

  function updateMusic() {
    if (game.state !== 'playing' || !audio.enabled || !audio.ctx || !audio.music) return;
    const now = audio.ctx.currentTime;
    if (audio.nextNoteTime < now) audio.nextNoteTime = now + 0.04;

    while (audio.nextNoteTime < now + 0.16) {
      const step = audio.note % audio.melody.length;
      const beat = 60 / 132;
      const tone = audio.melody[step];
      const bass = audio.bass[Math.floor(step / 2) % audio.bass.length];
      const accent = step % 4 === 0 ? 0.08 : 0.052;
      scheduleTone(tone, audio.nextNoteTime, beat * 0.62, 'triangle', accent, audio.music);
      if (step % 2 === 0) scheduleTone(bass, audio.nextNoteTime, beat * 0.9, 'sine', 0.05, audio.music);
      if (step % 4 === 2) scheduleTone(tone * 1.5, audio.nextNoteTime + beat * 0.28, beat * 0.22, 'sine', 0.035, audio.music);
      audio.nextNoteTime += beat * 0.5;
      audio.note += 1;
    }
  }

  function toggleAudio() {
    audio.enabled = !audio.enabled;
    localStorage.setItem('astra_dash_audio', audio.enabled ? 'on' : 'off');
    if (audio.enabled) {
      ensureAudio();
      if (audio.master && audio.ctx) audio.master.gain.setTargetAtTime(0.72, audio.ctx.currentTime, 0.03);
      audio.nextNoteTime = audio.ctx ? audio.ctx.currentTime + 0.04 : 0;
      playSfx('collect');
    } else if (audio.master) {
      audio.master.gain.setTargetAtTime(0.0001, audio.ctx.currentTime, 0.03);
    }
    updateAudioButton();
  }

  function resize() {
    view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    view.w = window.innerWidth;
    view.h = window.innerHeight;
    view.ground = Math.max(300, view.h * 0.76);
    canvas.width = Math.floor(view.w * view.dpr);
    canvas.height = Math.floor(view.h * view.dpr);
    canvas.style.width = view.w + 'px';
    canvas.style.height = view.h + 'px';
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);

    if (game.state === 'start') {
      player.x = view.w * 0.28;
      player.y = view.ground;
    }
  }

  function setScreen(state) {
    game.state = state;
    ui.start.classList.toggle('hidden', state !== 'start');
    ui.pause.classList.toggle('hidden', state !== 'pause');
    ui.over.classList.toggle('hidden', state !== 'over');
    ui.pauseBtn.classList.toggle('hidden', state !== 'playing');
    ui.hud.style.opacity = state === 'start' ? '0' : '1';
    if (state === 'playing' && audio.ctx) audio.nextNoteTime = audio.ctx.currentTime + 0.04;
  }

  function resetGame() {
    game.time = 0;
    game.speed = 430;
    game.score = 0;
    game.distance = 0;
    game.combo = 1;
    game.comboClock = 0;
    game.shake = 0;
    game.spawnObstacle = 0.7;
    game.spawnCrystal = 0.25;
    game.spawnPower = 8;
    game.obstacles = [];
    game.crystals = [];
    game.powers = [];
    game.particles = [];

    player.x = Math.max(118, view.w * 0.22);
    player.y = view.ground;
    player.vy = 0;
    player.hearts = 3;
    player.energy = 42;
    player.invincible = 0;
    player.dash = 0;
    player.run = 0;
    player.hurt = 0;
    player.landPulse = 0;
    player.grounded = true;
    if (audio.ctx) {
      audio.note = 0;
      audio.nextNoteTime = audio.ctx.currentTime + 0.04;
    }
    updateHUD();
  }

  function startGame() {
    ensureAudio();
    resetGame();
    setScreen('playing');
    game.last = performance.now();
  }

  function pauseGame() {
    if (game.state !== 'playing') return;
    setScreen('pause');
  }

  function resumeGame() {
    if (game.state !== 'pause') return;
    ensureAudio();
    setScreen('playing');
    game.last = performance.now();
  }

  function endGame() {
    playSfx('over');
    game.best = Math.max(game.best, Math.floor(game.score));
    localStorage.setItem(storageKey, game.best);
    ui.finalScore.textContent = Math.floor(game.score);
    ui.finalBest.textContent = game.best;
    ui.bestStart.textContent = game.best;
    setScreen('over');
  }

  function updateHUD() {
    ui.score.textContent = Math.floor(game.score);
    ui.combo.textContent = 'x' + game.combo;
    ui.hearts.textContent = player.hearts;
    ui.energy.style.width = Math.round(player.energy) + '%';
    if (displayedHearts === player.hearts) return;
    displayedHearts = player.hearts;
    ui.heartIcons.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('span');
      heart.className = i < player.hearts ? 'is-full' : '';
      ui.heartIcons.appendChild(heart);
    }
  }

  function queueJump() {
    input.jumpQueued = true;
  }

  function queueDash() {
    input.dashQueued = true;
  }

  function spawnObstacle() {
    const tall = Math.random() > 0.55;
    const h = tall ? 84 + Math.random() * 30 : 54 + Math.random() * 22;
    const w = tall ? 42 : 68;
    game.obstacles.push({
      x: view.w + 80,
      y: view.ground - h,
      w,
      h,
      type: tall ? 'spire' : 'sentinel',
      hit: false,
      spin: Math.random() * Math.PI * 2
    });
  }

  function spawnCrystalGroup() {
    const baseX = view.w + 90;
    const arc = Math.random() > 0.5;
    const count = arc ? 6 : 5;
    for (let i = 0; i < count; i++) {
      const y = arc
        ? view.ground - 142 - Math.sin((i / (count - 1)) * Math.PI) * 88
        : view.ground - 120 - Math.random() * 34;
      game.crystals.push({
        x: baseX + i * 52,
        y,
        r: 13,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function spawnPower() {
    game.powers.push({
      x: view.w + 130,
      y: view.ground - 178 - Math.random() * 74,
      r: 18,
      phase: Math.random() * Math.PI * 2
    });
  }

  function addParticles(x, y, color, count, spread) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = (50 + Math.random() * 230) * spread;
      game.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 30,
        life: 0.45 + Math.random() * 0.45,
        max: 0.9,
        size: 2 + Math.random() * 4,
        color
      });
    }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function playerBox() {
    return {
      x: player.x - player.w * 0.38,
      y: player.y - player.h,
      w: player.w * 0.76,
      h: player.h * 0.9
    };
  }

  function updatePlayer(dt) {
    const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const dashActive = player.dash > 0;
    const moveSpeed = dashActive ? 520 : 310;
    const wasGrounded = player.grounded;
    player.x += move * moveSpeed * dt;
    player.x = Math.max(86, Math.min(view.w * 0.48, player.x));

    if (input.jumpQueued && player.grounded) {
      player.vy = -880;
      player.grounded = false;
      playSfx('jump');
      addParticles(player.x - 10, player.y - 8, '#ffd166', 12, 0.55);
    }

    if (input.dashQueued && player.energy >= 34 && player.dash <= 0) {
      player.energy -= 34;
      player.dash = 0.24;
      player.invincible = Math.max(player.invincible, 0.32);
      playSfx('dash');
      addParticles(player.x - 18, player.y - 42, '#45d6ff', 24, 0.7);
    }

    input.jumpQueued = false;
    input.dashQueued = false;

    player.vy += 2350 * dt;
    player.y += player.vy * dt;
    if (player.y >= view.ground) {
      player.y = view.ground;
      player.vy = 0;
      player.grounded = true;
      if (!wasGrounded) {
        player.landPulse = 1;
        playSfx('land');
        addParticles(player.x, player.y + 2, '#66f2a3', 8, 0.36);
      }
    }

    player.dash = Math.max(0, player.dash - dt);
    player.invincible = Math.max(0, player.invincible - dt);
    player.hurt = Math.max(0, player.hurt - dt);
    player.landPulse = Math.max(0, player.landPulse - dt * 3.8);
    player.energy = Math.min(100, player.energy + (dashActive ? 3 : 7) * dt);
    player.run += dt * (dashActive ? 17 : 11);
  }

  function updateWorld(dt) {
    game.time += dt;
    game.speed = Math.min(760, 430 + game.time * 8);
    game.distance += game.speed * dt;
    game.score += dt * (8 + game.combo * 1.4);
    game.comboClock = Math.max(0, game.comboClock - dt);
    if (game.comboClock <= 0) game.combo = Math.max(1, game.combo - 1);
    game.shake = Math.max(0, game.shake - dt * 18);

    game.spawnObstacle -= dt;
    game.spawnCrystal -= dt;
    game.spawnPower -= dt;

    if (game.spawnObstacle <= 0) {
      spawnObstacle();
      game.spawnObstacle = Math.max(0.72, 1.45 - game.time * 0.012) + Math.random() * 0.42;
    }
    if (game.spawnCrystal <= 0) {
      spawnCrystalGroup();
      game.spawnCrystal = 1.05 + Math.random() * 0.72;
    }
    if (game.spawnPower <= 0) {
      spawnPower();
      game.spawnPower = 9 + Math.random() * 8;
    }

    const drift = game.speed * dt;
    game.obstacles.forEach((o) => {
      o.x -= drift;
      o.spin += dt * 4;
    });
    game.crystals.forEach((c) => {
      c.x -= drift;
      c.phase += dt * 5;
    });
    game.powers.forEach((p) => {
      p.x -= drift;
      p.phase += dt * 4.3;
    });
    game.particles.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 360 * dt;
      p.life -= dt;
    });

    game.obstacles = game.obstacles.filter((o) => o.x > -140 && !o.remove);
    game.crystals = game.crystals.filter((c) => c.x > -80 && !c.remove);
    game.powers = game.powers.filter((p) => p.x > -80 && !p.remove);
    game.particles = game.particles.filter((p) => p.life > 0);
  }

  function checkCollisions() {
    const box = playerBox();
    const dashActive = player.dash > 0;

    for (const o of game.obstacles) {
      const obstacleBox = {
        x: o.x + 8,
        y: o.y + 8,
        w: o.w - 16,
        h: o.h - 10
      };
      if (!rectsOverlap(box, obstacleBox)) continue;

      if (dashActive) {
        o.remove = true;
        game.score += 70 * game.combo;
        game.combo = Math.min(12, game.combo + 1);
        game.comboClock = 2.3;
        playSfx('break');
        addParticles(o.x + o.w / 2, o.y + o.h / 2, '#45d6ff', 34, 0.9);
        continue;
      }

      if (player.invincible <= 0) {
        player.hearts -= 1;
        player.invincible = 1.15;
        player.hurt = 0.38;
        player.energy = Math.min(100, player.energy + 18);
        game.combo = 1;
        game.shake = 10;
        playSfx('hit');
        addParticles(player.x, player.y - 46, '#ff5b93', 34, 0.8);
        if (player.hearts <= 0) {
          endGame();
          return;
        }
      }
    }

    for (const c of game.crystals) {
      const dx = c.x - player.x;
      const dy = c.y - (player.y - 48);
      if (dx * dx + dy * dy < 42 * 42) {
        c.remove = true;
        game.combo = Math.min(12, game.combo + 1);
        game.comboClock = 2.5;
        game.score += 25 * game.combo;
        player.energy = Math.min(100, player.energy + 8);
        playSfx('collect');
        addParticles(c.x, c.y, '#ffd166', 16, 0.6);
      }
    }

    for (const p of game.powers) {
      const dx = p.x - player.x;
      const dy = p.y - (player.y - 48);
      if (dx * dx + dy * dy < 48 * 48) {
        p.remove = true;
        player.hearts = Math.min(5, player.hearts + 1);
        player.energy = 100;
        game.score += 180;
        game.comboClock = 3;
        playSfx('power');
        addParticles(p.x, p.y, '#66f2a3', 28, 0.7);
      }
    }
  }

  function drawBackground(t) {
    const sky = ctx.createLinearGradient(0, 0, 0, view.h);
    sky.addColorStop(0, '#101a36');
    sky.addColorStop(0.38, '#1b3150');
    sky.addColorStop(0.72, '#29364a');
    sky.addColorStop(1, '#111827');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, view.w, view.h);

    ctx.save();
    ctx.globalAlpha = 0.65;
    for (let i = 0; i < 74; i++) {
      const x = (i * 173 - (game.distance * 0.06)) % (view.w + 180) - 90;
      const y = 30 + ((i * 47) % Math.max(180, view.ground - 160));
      const r = 0.7 + (i % 4) * 0.35;
      ctx.fillStyle = i % 5 === 0 ? '#ffd166' : '#dff7ff';
      ctx.beginPath();
      ctx.arc(x, y, r * (1 + Math.sin(t * 2 + i) * 0.25), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    drawCityLayer('#17233b', 0.16, view.ground - 140, 120);
    drawCityLayer('#203452', 0.27, view.ground - 92, 88);
    drawGardenRail(t);
  }

  function drawCityLayer(color, speed, base, maxH) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, view.h);
    const step = 74;
    const offset = -(game.distance * speed) % step;
    for (let x = offset - step; x < view.w + step; x += step) {
      const h = 48 + ((Math.sin((x + game.distance * speed) * 0.025) + 1) * 0.5) * maxH;
      ctx.lineTo(x, base - h);
      ctx.lineTo(x + step * 0.5, base - h - 28);
      ctx.lineTo(x + step, base - h * 0.84);
    }
    ctx.lineTo(view.w, view.h);
    ctx.closePath();
    ctx.fill();
  }

  function drawGardenRail(t) {
    const groundGradient = ctx.createLinearGradient(0, view.ground - 22, 0, view.h);
    groundGradient.addColorStop(0, '#35513d');
    groundGradient.addColorStop(0.24, '#22352e');
    groundGradient.addColorStop(1, '#111827');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, view.ground, view.w, view.h - view.ground);

    ctx.strokeStyle = 'rgba(255, 209, 102, 0.38)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, view.ground + 8);
    ctx.lineTo(view.w, view.ground + 8);
    ctx.stroke();

    for (let i = 0; i < 44; i++) {
      const x = (i * 48 - game.distance * 0.95) % (view.w + 80) - 40;
      const y = view.ground + 18 + (i % 3) * 12;
      ctx.strokeStyle = i % 2 ? '#66f2a3' : '#45d6ff';
      ctx.globalAlpha = 0.34;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 14);
      ctx.quadraticCurveTo(x + 6, y - 8 - Math.sin(t * 3 + i) * 3, x + 13, y + 8);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawPlayer(t) {
    const dashActive = player.dash > 0;
    const blink = player.invincible > 0 && Math.floor(t * 18) % 2 === 0;
    if (blink && !dashActive) return;

    const x = player.x;
    const y = player.y;
    const run = player.run;
    const bob = Math.sin(run * 2) * (player.grounded ? 3.2 : 1.2);
    const stride = Math.sin(run);
    const counter = Math.cos(run);
    const airTilt = player.grounded ? 0 : Math.max(-0.16, Math.min(0.18, player.vy / 3600));
    const hurtJolt = player.hurt > 0 ? Math.sin(t * 90) * player.hurt * 8 : 0;

    ctx.save();
    ctx.translate(x + hurtJolt, y + bob);
    ctx.rotate((dashActive ? -0.08 : 0.02) + airTilt);

    if (player.landPulse > 0) {
      ctx.save();
      ctx.globalAlpha = player.landPulse * 0.42;
      ctx.strokeStyle = '#66f2a3';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 4, 42 + (1 - player.landPulse) * 34, 8 + (1 - player.landPulse) * 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (dashActive) {
      ctx.shadowColor = '#45d6ff';
      ctx.shadowBlur = 28;
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = 0.22 - i * 0.035;
        ctx.fillStyle = i % 2 ? 'rgba(255, 209, 102, 0.22)' : 'rgba(69, 214, 255, 0.28)';
        ctx.beginPath();
        ctx.ellipse(-40 - i * 18, -44 + i * 2, 72 - i * 8, 24 - i * 2, -0.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 38 + Math.abs(stride) * 3, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#0e1b2e';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-12, -22);
    ctx.lineTo(-16 - stride * 7, -4);
    ctx.moveTo(15, -22);
    ctx.lineTo(17 + stride * 7, -4);
    ctx.stroke();

    ctx.strokeStyle = dashActive ? '#45d6ff' : '#ffd166';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-16 - stride * 7, -4);
    ctx.lineTo(-32 - stride * 9, -2 + counter * 2);
    ctx.moveTo(17 + stride * 7, -4);
    ctx.lineTo(31 + stride * 9, -2 - counter * 2);
    ctx.stroke();

    const cape = ctx.createLinearGradient(-28, -64, -74, -12);
    cape.addColorStop(0, '#ff5b93');
    cape.addColorStop(0.55, '#a78bfa');
    cape.addColorStop(1, '#2b4fd7');
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(-16, -66);
    ctx.quadraticCurveTo(-66 - stride * 10 - (dashActive ? 24 : 0), -44 + counter * 5, -56, -7);
    ctx.quadraticCurveTo(-28, -14 + stride * 3, -7, -47);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const body = ctx.createLinearGradient(0, -74, 0, -14);
    body.addColorStop(0, '#f8fbff');
    body.addColorStop(0.44, '#8ee9ff');
    body.addColorStop(1, '#246fa5');
    ctx.fillStyle = body;
    ctx.shadowColor = dashActive ? '#45d6ff' : 'rgba(102, 242, 163, 0.55)';
    ctx.shadowBlur = dashActive ? 18 : 8;
    ctx.beginPath();
    ctx.roundRect(-24, -70, 48, 56, 18);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = player.hurt > 0 ? '#ff5b93' : 'rgba(255, 255, 255, 0.68)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#10233a';
    ctx.beginPath();
    ctx.moveTo(-16, -58);
    ctx.lineTo(0, -23);
    ctx.lineTo(16, -58);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(0, -43, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.5)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, -43, 9 + Math.sin(t * 8) * 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#f8fbff';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, -58);
    ctx.lineTo(-34 - stride * 6, -36 + counter * 2);
    ctx.moveTo(18, -58);
    ctx.lineTo(34 + stride * 6, -34 - counter * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(-34 - stride * 6, -36 + counter * 2, 4, 0, Math.PI * 2);
    ctx.arc(34 + stride * 6, -34 - counter * 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffe0c7';
    ctx.beginPath();
    ctx.arc(0, -86, 23, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 143, 112, 0.28)';
    ctx.beginPath();
    ctx.arc(-11, -80, 5, 0, Math.PI * 2);
    ctx.arc(13, -80, 5, 0, Math.PI * 2);
    ctx.fill();

    const hair = ctx.createLinearGradient(-22, -112, 24, -77);
    hair.addColorStop(0, '#27385f');
    hair.addColorStop(0.52, '#6d5dfc');
    hair.addColorStop(1, '#d8b4fe');
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-24, -91);
    ctx.quadraticCurveTo(-18, -120, 14, -113);
    ctx.quadraticCurveTo(33, -108, 31, -88);
    ctx.quadraticCurveTo(24 + stride * 2, -72, 8, -77);
    ctx.quadraticCurveTo(2, -88, -24, -91);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(-10, -111);
    ctx.quadraticCurveTo(-2, -104, -1, -88);
    ctx.quadraticCurveTo(-7, -98, -17, -94);
    ctx.fill();

    ctx.fillStyle = '#122033';
    ctx.beginPath();
    ctx.roundRect(-16, -91, 32, 10, 5);
    ctx.fill();
    const visor = ctx.createLinearGradient(-15, -91, 15, -81);
    visor.addColorStop(0, '#45d6ff');
    visor.addColorStop(1, '#66f2a3');
    ctx.fillStyle = visor;
    ctx.beginPath();
    ctx.roundRect(-13, -89, 26, 6, 4);
    ctx.fill();

    ctx.strokeStyle = '#ff8f70';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(1, -78, 7, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.stroke();

    if (player.hurt > 0) {
      ctx.globalAlpha = Math.min(0.5, player.hurt * 1.5);
      ctx.fillStyle = '#ff5b93';
      ctx.beginPath();
      ctx.roundRect(-26, -72, 52, 60, 18);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawObstacle(o) {
    ctx.save();
    ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ff5b93';
    if (o.type === 'spire') {
      const grad = ctx.createLinearGradient(0, -o.h / 2, 0, o.h / 2);
      grad.addColorStop(0, '#ff5b93');
      grad.addColorStop(1, '#552556');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -o.h / 2);
      ctx.lineTo(o.w / 2, o.h / 2);
      ctx.lineTo(-o.w / 2, o.h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.rotate(Math.sin(o.spin) * 0.08);
      ctx.fillStyle = '#1b2740';
      ctx.beginPath();
      ctx.roundRect(-o.w / 2, -o.h / 2, o.w, o.h, 14);
      ctx.fill();
      ctx.strokeStyle = '#ff5b93';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(0, -4, 8 + Math.sin(o.spin * 2) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCrystal(c) {
    const bob = Math.sin(c.phase) * 5;
    ctx.save();
    ctx.translate(c.x, c.y + bob);
    ctx.rotate(c.phase * 0.4);
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ffd166';
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(13, 0);
    ctx.lineTo(0, 18);
    ctx.lineTo(-13, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(5, 0);
    ctx.lineTo(0, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawPower(p) {
    ctx.save();
    ctx.translate(p.x, p.y + Math.sin(p.phase) * 6);
    ctx.rotate(p.phase * 0.32);
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#66f2a3';
    ctx.strokeStyle = '#66f2a3';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-16, -16, 32, 32, 8);
    ctx.stroke();
    ctx.fillStyle = '#f8fbff';
    ctx.fillRect(-3, -10, 6, 20);
    ctx.fillRect(-10, -3, 20, 6);
    ctx.restore();
  }

  function drawParticles() {
    for (const p of game.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function render(t) {
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.clearRect(0, 0, view.w, view.h);
    if (game.shake > 0) {
      ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
    }
    drawBackground(t);
    game.crystals.forEach(drawCrystal);
    game.powers.forEach(drawPower);
    game.obstacles.forEach(drawObstacle);
    drawParticles();
    drawPlayer(t);
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - game.last) / 1000 || 0);
    game.last = now;

    if (game.state === 'playing') {
      updatePlayer(dt);
      updateWorld(dt);
      checkCollisions();
      updateHUD();
      updateMusic();
    } else if (game.state === 'start') {
      player.run += dt * 5;
      player.energy = 42;
    }

    render(now / 1000);
    requestAnimationFrame(loop);
  }

  function bindControls() {
    ui.bestStart.textContent = game.best;
    ui.startBtn.addEventListener('click', startGame);
    ui.restartBtn.addEventListener('click', startGame);
    ui.restartPauseBtn.addEventListener('click', startGame);
    ui.resumeBtn.addEventListener('click', resumeGame);
    ui.pauseBtn.addEventListener('click', pauseGame);
    ui.audioBtn.addEventListener('click', toggleAudio);

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'Space', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        if (game.state === 'playing') queueJump();
        else if (game.state === 'start' || game.state === 'over') startGame();
      }
      if (['ShiftLeft', 'ShiftRight', 'KeyK'].includes(e.code)) {
        e.preventDefault();
        if (game.state === 'playing') queueDash();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (game.state === 'playing') pauseGame();
        else if (game.state === 'pause') resumeGame();
      }
      if (e.code === 'Enter' && game.state === 'over') startGame();
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
    });

    canvas.addEventListener('pointerdown', () => {
      if (game.state === 'playing') queueJump();
    });

    document.querySelectorAll('[data-action]').forEach((btn) => {
      const action = btn.dataset.action;
      const down = (e) => {
        e.preventDefault();
        if (action === 'left') input.left = true;
        if (action === 'right') input.right = true;
        if (action === 'jump' && game.state === 'playing') queueJump();
        if (action === 'dash' && game.state === 'playing') queueDash();
      };
      const up = (e) => {
        e.preventDefault();
        if (action === 'left') input.left = false;
        if (action === 'right') input.right = false;
      };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('pointerleave', up);
    });

    window.addEventListener('blur', () => {
      input.left = false;
      input.right = false;
      if (game.state === 'playing') pauseGame();
    });
    window.addEventListener('resize', resize);
  }

  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
      const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
      this.beginPath();
      this.moveTo(x + radius, y);
      this.arcTo(x + w, y, x + w, y + h, radius);
      this.arcTo(x + w, y + h, x, y + h, radius);
      this.arcTo(x, y + h, x, y, radius);
      this.arcTo(x, y, x + w, y, radius);
      this.closePath();
      return this;
    };
  }

  resize();
  bindControls();
  updateAudioButton();
  resetGame();
  setScreen('start');
  requestAnimationFrame(loop);
})();

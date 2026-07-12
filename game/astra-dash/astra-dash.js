(function() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
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
    ground: 0,
    fx: 1,
    stars: [],
    paint: {}
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
    w: 52,
    h: 104,
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
  const displayedHud = { score: -1, combo: -1, energy: -1 };
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const modestDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4);

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
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    view.fx = prefersReducedMotion ? 0.55 : modestDevice || coarsePointer ? 0.72 : 1;
    view.dpr = Math.min(window.devicePixelRatio || 1, view.fx < 1 ? 1.35 : 1.75);
    view.w = window.innerWidth;
    view.h = window.innerHeight;
    view.ground = Math.max(300, view.h * 0.76);
    canvas.width = Math.floor(view.w * view.dpr);
    canvas.height = Math.floor(view.h * view.dpr);
    canvas.style.width = view.w + 'px';
    canvas.style.height = view.h + 'px';
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);

    const sky = ctx.createLinearGradient(0, 0, 0, view.h);
    sky.addColorStop(0, '#09152e');
    sky.addColorStop(0.46, '#172d4a');
    sky.addColorStop(0.76, '#253a4c');
    sky.addColorStop(1, '#101827');
    const ground = ctx.createLinearGradient(0, view.ground - 22, 0, view.h);
    ground.addColorStop(0, '#315346');
    ground.addColorStop(0.24, '#203830');
    ground.addColorStop(1, '#0d1725');
    view.paint = { sky, ground };
    const starCount = Math.round(Math.min(72, Math.max(34, view.w / 18)) * view.fx);
    view.stars = Array.from({ length: starCount }, (_, i) => ({
      x: (i * 173) % (view.w + 180),
      y: 28 + ((i * 47) % Math.max(160, view.ground - 150)),
      r: 0.65 + (i % 4) * 0.32,
      phase: i * 0.71
    }));

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
    displayedHud.score = -1;
    displayedHud.combo = -1;
    displayedHud.energy = -1;
    displayedHearts = -1;

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
    const score = Math.floor(game.score);
    const energy = Math.round(player.energy);
    if (displayedHud.score !== score) {
      displayedHud.score = score;
      ui.score.textContent = score;
    }
    if (displayedHud.combo !== game.combo) {
      displayedHud.combo = game.combo;
      ui.combo.textContent = 'x' + game.combo;
    }
    if (displayedHud.energy !== energy) {
      displayedHud.energy = energy;
      ui.energy.style.width = energy + '%';
    }
    if (displayedHearts === player.hearts) return;
    displayedHearts = player.hearts;
    ui.hearts.textContent = player.hearts;
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
    const lastCrystalX = game.crystals.reduce((last, c) => Math.max(last, c.x), view.w + 10);
    game.obstacles.push({
      x: Math.max(view.w + 80, lastCrystalX + 96),
      y: view.ground - h,
      w,
      h,
      type: tall ? 'spire' : 'sentinel',
      hit: false,
      spin: Math.random() * Math.PI * 2
    });
  }

  function spawnCrystalGroup() {
    const lastObstacle = game.obstacles.reduce((latest, obstacle) => {
      if (obstacle.x > view.w - 40 && (!latest || obstacle.x > latest.x)) return obstacle;
      return latest;
    }, null);
    const followsObstacle = lastObstacle && lastObstacle.x < view.w + 330 && Math.random() > 0.42;
    const baseX = followsObstacle
      ? lastObstacle.x - 30
      : Math.max(view.w + 90, game.obstacles.reduce((x, o) => Math.max(x, o.x + o.w + 82), view.w + 90));
    const arc = followsObstacle || Math.random() > 0.46;
    const count = arc ? 7 : 6;
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const obstacleClearance = followsObstacle ? lastObstacle.h + 36 : 0;
      const y = arc
        ? view.ground - Math.max(82 + Math.sin(progress * Math.PI) * 96, obstacleClearance)
        : view.ground - 88 - Math.sin(progress * Math.PI * 2) * 18;
      game.crystals.push({
        x: baseX + i * 48,
        y,
        r: 12,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function spawnPower() {
    game.powers.push({
      x: view.w + 130,
      y: view.ground - 112 - Math.random() * 48,
      r: 18,
      phase: Math.random() * Math.PI * 2
    });
  }

  function addParticles(x, y, color, count, spread) {
    const particleLimit = Math.round(190 * view.fx);
    const amount = Math.min(Math.round(count * view.fx), particleLimit - game.particles.length);
    for (let i = 0; i < amount; i++) {
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
    game.shake = Math.max(0, game.shake - dt * 30);

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
        game.shake = 7;
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
    ctx.fillStyle = view.paint.sky;
    ctx.fillRect(0, 0, view.w, view.h);

    ctx.save();
    ctx.globalAlpha = 0.65;
    for (let i = 0; i < view.stars.length; i++) {
      const star = view.stars[i];
      const x = (star.x - game.distance * 0.06 + view.w + 180) % (view.w + 180) - 90;
      const r = star.r;
      ctx.fillStyle = i % 5 === 0 ? '#ffd166' : '#dff7ff';
      ctx.beginPath();
      ctx.arc(x, star.y, r * (1 + Math.sin(t * 2 + star.phase) * 0.2), 0, Math.PI * 2);
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
    ctx.fillStyle = view.paint.ground;
    ctx.fillRect(0, view.ground, view.w, view.h - view.ground);

    ctx.strokeStyle = 'rgba(255, 209, 102, 0.38)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, view.ground + 8);
    ctx.lineTo(view.w, view.ground + 8);
    ctx.stroke();

    const sproutCount = Math.round(40 * view.fx);
    for (let i = 0; i < sproutCount; i++) {
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

  function drawLimb(points, innerColor, outerWidth, innerWidth) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#101a30';
    ctx.lineWidth = outerWidth;
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
    ctx.stroke();
    ctx.strokeStyle = innerColor;
    ctx.lineWidth = innerWidth;
    ctx.stroke();
  }

  function drawPlayer(t) {
    const dashActive = player.dash > 0;
    const blink = player.invincible > 0 && Math.floor(t * 18) % 2 === 0;
    if (blink && !dashActive) return;

    const x = player.x;
    const y = player.y;
    const cycle = player.run;
    const stride = Math.sin(cycle);
    const stepLift = Math.cos(cycle);
    const bob = player.grounded ? -Math.abs(Math.sin(cycle * 2)) * 2.2 : 0;
    const airTilt = player.grounded ? 0 : Math.max(-0.18, Math.min(0.16, player.vy / 3200));
    const hurtJolt = player.hurt > 0 ? Math.sin(t * 82) * player.hurt * 7 : 0;
    const squash = player.landPulse * 0.075;

    ctx.save();
    ctx.translate(x, y + 3);
    ctx.fillStyle = 'rgba(2, 8, 18, 0.34)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 34 + Math.abs(stride) * 4, 7 - squash * 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x + hurtJolt, y + bob);
    ctx.rotate((dashActive ? -0.12 : 0.025) + airTilt);
    ctx.scale(1 + squash, 1 - squash);

    if (player.landPulse > 0) {
      ctx.save();
      ctx.globalAlpha = player.landPulse * 0.34;
      ctx.strokeStyle = '#66f2a3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 3, 36 + (1 - player.landPulse) * 44, 7 + (1 - player.landPulse) * 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (dashActive) {
      const trails = view.fx < 1 ? 2 : 3;
      for (let i = 0; i < trails; i++) {
        ctx.globalAlpha = 0.19 - i * 0.04;
        ctx.fillStyle = i % 2 ? '#ffd166' : '#45d6ff';
        ctx.beginPath();
        ctx.moveTo(-14, -73 + i * 16);
        ctx.lineTo(-102 - i * 21, -61 + i * 12);
        ctx.lineTo(-22, -42 + i * 9);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    const backFootX = 6 - stride * 26;
    const backFootY = -3 - Math.max(0, -stepLift) * 9;
    drawLimb([4, -42, -1 - stride * 11, -24, backFootX, backFootY], '#46567d', 12, 7);
    drawLimb([backFootX - 2, backFootY, backFootX + 12, backFootY], dashActive ? '#45d6ff' : '#9ca9c9', 10, 5);

    ctx.fillStyle = '#5f53d9';
    ctx.beginPath();
    ctx.moveTo(-15, -72);
    ctx.quadraticCurveTo(-46 - Math.abs(stride) * 12 - (dashActive ? 24 : 0), -72 + stepLift * 5, -72, -42 + stride * 5);
    ctx.quadraticCurveTo(-49, -45, -12, -53);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    drawLimb([-8, -65, -23 + stride * 13, -49, -30 + stride * 22, -34], '#394a72', 11, 6);

    ctx.fillStyle = '#17243d';
    ctx.beginPath();
    ctx.roundRect(-26, -72, 17, 35, 7);
    ctx.fill();

    ctx.fillStyle = player.hurt > 0 ? '#ff719f' : '#ecf8f7';
    ctx.beginPath();
    ctx.moveTo(-15, -72);
    ctx.quadraticCurveTo(4, -79, 19, -67);
    ctx.lineTo(16, -37);
    ctx.quadraticCurveTo(2, -31, -12, -40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#101a30';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#45d6ff';
    ctx.beginPath();
    ctx.moveTo(-10, -66);
    ctx.lineTo(14, -62);
    ctx.lineTo(11, -51);
    ctx.lineTo(-11, -55);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(6, -55, 4.5, 0, Math.PI * 2);
    ctx.fill();

    const frontFootX = 8 + stride * 27;
    const frontFootY = -3 - Math.max(0, stepLift) * 9;
    drawLimb([8, -40, 10 + stride * 12, -23, frontFootX, frontFootY], '#26385d', 13, 8);
    drawLimb([frontFootX - 2, frontFootY, frontFootX + 13, frontFootY], dashActive ? '#45d6ff' : '#ffd166', 11, 6);

    drawLimb([13, -65, 23 - stride * 14, -49, 30 - stride * 22, -37], '#ecf8f7', 12, 7);
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(31 - stride * 22, -36, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f2b38e';
    ctx.beginPath();
    ctx.arc(3, -89, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(17, -92);
    ctx.lineTo(26, -87);
    ctx.lineTo(16, -83);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#332f67';
    ctx.beginPath();
    ctx.arc(-1, -94, 20, Math.PI * 0.95, Math.PI * 2.02);
    ctx.quadraticCurveTo(5, -116, 20, -103);
    ctx.quadraticCurveTo(24, -96, 18, -91);
    ctx.quadraticCurveTo(10, -101, 1, -99);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#a78bfa';
    ctx.beginPath();
    ctx.moveTo(-14, -100);
    ctx.quadraticCurveTo(-32 - Math.abs(stride) * 5, -98, -28, -84 + stepLift * 2);
    ctx.quadraticCurveTo(-15, -90, -4, -99);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#112039';
    ctx.beginPath();
    ctx.roundRect(5, -96, 17, 9, 4.5);
    ctx.fill();
    ctx.fillStyle = '#66f2e0';
    ctx.beginPath();
    ctx.roundRect(9, -94, 12, 5, 2.5);
    ctx.fill();

    ctx.strokeStyle = '#8b4f54';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(16, -82, 5, 0.18 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();

    if (player.hurt > 0) {
      ctx.globalAlpha = Math.min(0.42, player.hurt * 1.4);
      ctx.fillStyle = '#ff5b93';
      ctx.beginPath();
      ctx.roundRect(-29, -111, 59, 109, 23);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawObstacle(o) {
    ctx.save();
    ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
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
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(18, 0);
    ctx.lineTo(0, 24);
    ctx.lineTo(-18, 0);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
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
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#66f2a3';
    ctx.beginPath();
    ctx.roundRect(-22, -22, 44, 44, 11);
    ctx.fill();
    ctx.globalAlpha = 1;
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
      ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function render(t) {
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.clearRect(0, 0, view.w, view.h);
    if (game.shake > 0) ctx.translate(Math.sin(t * 94) * game.shake, Math.cos(t * 81) * game.shake * 0.55);
    drawBackground(t);
    game.crystals.forEach(drawCrystal);
    game.powers.forEach(drawPower);
    game.obstacles.forEach(drawObstacle);
    drawParticles();
    drawPlayer(t);
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - game.last) / 1000 || 0);
    game.last = now;

    if (game.state === 'playing') {
      let remaining = dt;
      const maxStep = 1 / 120;
      while (remaining > 0 && game.state === 'playing') {
        const step = Math.min(maxStep, remaining);
        updatePlayer(step);
        updateWorld(step);
        checkCollisions();
        remaining -= step;
      }
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

(function() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const storageKey = 'astra_dash_highscore';

  const ui = {
    hud: document.getElementById('hud'),
    score: document.getElementById('scoreText'),
    combo: document.getElementById('comboText'),
    hearts: document.getElementById('heartText'),
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
    grounded: true
  };

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
    player.grounded = true;
    updateHUD();
  }

  function startGame() {
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
    setScreen('playing');
    game.last = performance.now();
  }

  function endGame() {
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
    player.x += move * moveSpeed * dt;
    player.x = Math.max(86, Math.min(view.w * 0.48, player.x));

    if (input.jumpQueued && player.grounded) {
      player.vy = -880;
      player.grounded = false;
      addParticles(player.x - 10, player.y - 8, '#ffd166', 12, 0.55);
    }

    if (input.dashQueued && player.energy >= 34 && player.dash <= 0) {
      player.energy -= 34;
      player.dash = 0.24;
      player.invincible = Math.max(player.invincible, 0.32);
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
    }

    player.dash = Math.max(0, player.dash - dt);
    player.invincible = Math.max(0, player.invincible - dt);
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
        addParticles(o.x + o.w / 2, o.y + o.h / 2, '#45d6ff', 34, 0.9);
        continue;
      }

      if (player.invincible <= 0) {
        player.hearts -= 1;
        player.invincible = 1.15;
        player.energy = Math.min(100, player.energy + 18);
        game.combo = 1;
        game.shake = 10;
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
    const bob = Math.sin(run * 2) * (player.grounded ? 3.5 : 1.5);
    const leg = Math.sin(run) * 12;

    ctx.save();
    ctx.translate(x, y + bob);
    if (dashActive) {
      ctx.shadowColor = '#45d6ff';
      ctx.shadowBlur = 28;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'rgba(69, 214, 255, 0.2)';
      ctx.beginPath();
      ctx.ellipse(-34, -42, 70, 26, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 38, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#122033';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-13, -20);
    ctx.lineTo(-18 - leg * 0.35, -2);
    ctx.moveTo(15, -20);
    ctx.lineTo(16 + leg * 0.35, -2);
    ctx.stroke();

    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-18 - leg * 0.35, -2);
    ctx.lineTo(-31 - leg * 0.4, -2);
    ctx.moveTo(16 + leg * 0.35, -2);
    ctx.lineTo(29 + leg * 0.4, -2);
    ctx.stroke();

    const cape = ctx.createLinearGradient(-28, -64, -74, -12);
    cape.addColorStop(0, '#ff5b93');
    cape.addColorStop(1, '#6d5dfc');
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(-16, -66);
    ctx.quadraticCurveTo(-66 - Math.sin(run) * 8, -42, -54, -8);
    ctx.quadraticCurveTo(-22, -17, -8, -48);
    ctx.closePath();
    ctx.fill();

    const body = ctx.createLinearGradient(0, -74, 0, -14);
    body.addColorStop(0, '#f8fbff');
    body.addColorStop(0.44, '#8ee9ff');
    body.addColorStop(1, '#246fa5');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(-24, -70, 48, 56, 18);
    ctx.fill();

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

    ctx.strokeStyle = '#f8fbff';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, -58);
    ctx.lineTo(-34 - Math.sin(run) * 3, -36);
    ctx.moveTo(18, -58);
    ctx.lineTo(34 + Math.sin(run) * 3, -34);
    ctx.stroke();

    ctx.fillStyle = '#ffe0c7';
    ctx.beginPath();
    ctx.arc(0, -86, 23, 0, Math.PI * 2);
    ctx.fill();

    const hair = ctx.createLinearGradient(-22, -112, 24, -77);
    hair.addColorStop(0, '#27385f');
    hair.addColorStop(1, '#a78bfa');
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-22, -89);
    ctx.quadraticCurveTo(-15, -118, 15, -110);
    ctx.quadraticCurveTo(34, -98, 17, -78);
    ctx.quadraticCurveTo(3, -88, -22, -89);
    ctx.fill();

    ctx.fillStyle = '#1d2541';
    ctx.beginPath();
    ctx.arc(-8, -85, 2.3, 0, Math.PI * 2);
    ctx.arc(9, -85, 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ff8f70';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(1, -79, 8, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.stroke();

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
  resetGame();
  setScreen('start');
  requestAnimationFrame(loop);
})();

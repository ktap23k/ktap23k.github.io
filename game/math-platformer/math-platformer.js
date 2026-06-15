/* =========================================
   MATH JUMP ADVENTURE — GAME ENGINE
   ========================================= */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayDesc = document.getElementById('overlayDesc');
const overlayBtn = document.getElementById('overlayBtn');

let levelIndex = 0;
let score = 0;
let lives = 3;
let running = false;
let lastTime = 0;

const keys = { left: false, right: false, jump: false };

const player = {
  x: 0, y: 0, w: 28, h: 28,
  vx: 0, vy: 0,
  onGround: false,
  facing: 1
};

let currentLevel = null;
let cameraX = 0;
let particles = [];
let stars = [];
let clouds = [];
let mountains = [];

/* ========== INPUT ========== */
window.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
    keys.jump = true;
    if (e.code === 'Space') e.preventDefault();
  }
});

window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') keys.jump = false;
});

document.querySelectorAll('.jmp-touch__btn').forEach(btn => {
  const k = btn.dataset.key;
  const start = e => { e.preventDefault(); keys[k] = true; };
  const end = e => { e.preventDefault(); keys[k] = false; };
  btn.addEventListener('touchstart', start, { passive: false });
  btn.addEventListener('touchend', end);
  btn.addEventListener('mousedown', start);
  btn.addEventListener('mouseup', end);
  btn.addEventListener('mouseleave', end);
});

/* ========== BACKGROUND GENERATION ========== */
function initBackground() {
  stars = [];
  clouds = [];
  mountains = [];
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.6,
      size: Math.random() * 2 + 0.5,
      twinkle: Math.random() * Math.PI * 2
    });
  }
  for (let i = 0; i < 8; i++) {
    clouds.push({
      x: Math.random() * canvas.width * 1.5,
      y: Math.random() * canvas.height * 0.45,
      w: 60 + Math.random() * 80,
      speed: 0.1 + Math.random() * 0.2
    });
  }
  for (let i = 0; i < 7; i++) {
    mountains.push({
      x: i * 180 - 50,
      y: canvas.height - 80 - Math.random() * 60,
      w: 120 + Math.random() * 80,
      h: 80 + Math.random() * 100,
      color: Math.random() > 0.5 ? '#64748b' : '#475569'
    });
  }
}

/* ========== PROGRESS ========== */
function loadProgress() {
  const saved = localStorage.getItem('mathjump_progress');
  if (saved) {
    try {
      const p = JSON.parse(saved);
      levelIndex = Math.max(0, Math.min(LEVELS.length - 1, p.level || 0));
      score = p.score || 0;
      lives = p.lives || 3;
    } catch (e) { levelIndex = 0; score = 0; lives = 3; }
  }
}

function saveProgress() {
  localStorage.setItem('mathjump_progress', JSON.stringify({ level: levelIndex, score, lives }));
}

/* ========== LEVEL SETUP ========== */
function setupLevel(idx) {
  levelIndex = idx;
  currentLevel = JSON.parse(JSON.stringify(LEVELS[idx]));
  player.x = currentLevel.playerStart.x;
  player.y = currentLevel.playerStart.y;
  player.vx = 0; player.vy = 0;
  cameraX = 0;
  document.getElementById('questionText').textContent = currentLevel.question;
  updateStats();
  saveProgress();
}

function updateStats() {
  document.getElementById('levelStat').textContent = levelIndex + 1;
  document.getElementById('scoreStat').textContent = score;
  document.getElementById('livesStat').textContent = lives;
}

/* ========== PHYSICS ========== */
const GRAVITY = 0.6;
const MOVE_SPEED = 4.5;
const JUMP_FORCE = -12;
const FRICTION = 0.82;

function update(dt) {
  if (!running || !currentLevel) return;

  if (keys.left) { player.vx -= 0.8; player.facing = -1; }
  if (keys.right) { player.vx += 0.8; player.facing = 1; }
  player.vx *= FRICTION;
  player.vx = Math.max(-MOVE_SPEED, Math.min(MOVE_SPEED, player.vx));
  player.x += player.vx;
  handleCollisions('x');

  player.vy += GRAVITY;
  player.y += player.vy;
  player.onGround = false;
  handleCollisions('y');

  if (keys.jump && player.onGround) {
    player.vy = JUMP_FORCE;
    player.onGround = false;
  }

  if (currentLevel.movingPlatforms) {
    currentLevel.movingPlatforms.forEach(p => {
      p.x += p.dx;
      if (Math.abs(p.x - p.originX) > p.range) p.dx *= -1;
    });
  }

  if (player.y > canvas.height + 60) {
    loseLife();
    return;
  }

  const hazardHit = currentLevel.hazards.some(h => rectIntersect(player, h));
  if (hazardHit) {
    loseLife();
    return;
  }

  for (let i = currentLevel.answers.length - 1; i >= 0; i--) {
    const ans = currentLevel.answers[i];
    const box = { x: ans.x, y: ans.y, w: 34, h: 34 };
    if (rectIntersect(player, box)) {
      if (ans.correct) {
        spawnParticles(ans.x + 17, ans.y + 17, '#22c55e');
        score += 100 + levelIndex * 20;
        showOverlay('🎉 Chính xác!', `Bạn đã vượt qua màn ${levelIndex + 1}.`, 'Màn tiếp theo');
        running = false;
        saveProgress();
        overlayBtn.onclick = () => {
          if (levelIndex + 1 < LEVELS.length) {
            setupLevel(levelIndex + 1);
            hideOverlay();
            running = true;
          } else {
            showOverlay('🏆 Chiến thắng!', `Tổng điểm: ${score}. Bạn đã hoàn thành tất cả các màn!`, 'Chơi lại từ đầu');
            overlayBtn.onclick = () => {
              levelIndex = 0; score = 0; lives = 3;
              setupLevel(0);
              hideOverlay();
              running = true;
            };
          }
        };
      } else {
        spawnParticles(ans.x + 17, ans.y + 17, '#ef4444');
        loseLife('Sai đáp án!');
      }
      return;
    }
  }

  const targetCam = player.x - canvas.width / 3;
  cameraX += (targetCam - cameraX) * 0.1;
  cameraX = Math.max(0, Math.min(cameraX, 1300 - canvas.width));

  updateParticles();
  updateStats();
}

function handleCollisions(axis) {
  const platforms = currentLevel.platforms.concat(currentLevel.movingPlatforms || []);
  for (const p of platforms) {
    if (rectIntersect(player, p)) {
      if (axis === 'x') {
        if (player.vx > 0) player.x = p.x - player.w;
        else if (player.vx < 0) player.x = p.x + p.w;
        player.vx = 0;
      } else {
        if (player.vy > 0) {
          player.y = p.y - player.h;
          player.onGround = true;
          player.vy = 0;
          if (p.dx) player.x += p.dx;
        } else if (player.vy < 0) {
          player.y = p.y + p.h;
          player.vy = 0;
        }
      }
    }
  }
}

function rectIntersect(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function loseLife(msg) {
  lives--;
  saveProgress();
  if (lives <= 0) {
    showOverlay('💔 Game Over', `Điểm của bạn: ${score}. Hãy thử lại!`, 'Chơi lại');
    overlayBtn.onclick = () => {
      levelIndex = 0; score = 0; lives = 3;
      setupLevel(0);
      hideOverlay();
      running = true;
    };
  } else {
    showOverlay('😅 Ôi không!', msg || 'Bạn đã mất một mạng.', 'Thử lại màn này');
    overlayBtn.onclick = () => {
      setupLevel(levelIndex);
      hideOverlay();
      running = true;
    };
  }
  running = false;
}

/* ========== PARTICLES ========== */
function spawnParticles(x, y, color) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      life: 1,
      decay: 0.015 + Math.random() * 0.02,
      color,
      size: 3 + Math.random() * 4
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

/* ========== RENDER ========== */
function draw() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (isDark) {
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#064e3b');
  } else {
    grad.addColorStop(0, '#dbeafe');
    grad.addColorStop(0.5, '#e0f2fe');
    grad.addColorStop(1, '#dcfce7');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars (only visible in dark mode, subtle in light)
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)';
  stars.forEach(s => {
    const alpha = 0.4 + 0.6 * Math.abs(Math.sin(Date.now() * 0.002 + s.twinkle));
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(s.x - cameraX * 0.05, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Mountains parallax
  mountains.forEach(m => {
    const parallaxX = (m.x - cameraX * 0.2) % (canvas.width + 300);
    const drawX = parallaxX < -m.w ? parallaxX + canvas.width + 300 : parallaxX;
    ctx.fillStyle = isDark ? '#1e293b' : '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(drawX, canvas.height);
    ctx.lineTo(drawX + m.w / 2, m.y);
    ctx.lineTo(drawX + m.w, canvas.height);
    ctx.closePath();
    ctx.fill();
  });

  // Clouds parallax
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)';
  clouds.forEach(c => {
    c.x += c.speed;
    if (c.x > canvas.width + 100) c.x = -c.w;
    const drawX = c.x - cameraX * 0.1;
    roundRect(ctx, drawX, c.y, c.w, c.w * 0.35, c.w * 0.15);
    ctx.fill();
  });

  if (!currentLevel) return;
  ctx.save();
  ctx.translate(-cameraX, 0);

  // Platforms
  currentLevel.platforms.forEach(p => {
    drawPlatform(ctx, p, isDark);
  });

  // Moving platforms
  if (currentLevel.movingPlatforms) {
    currentLevel.movingPlatforms.forEach(p => {
      drawPlatform(ctx, p, isDark, true);
    });
  }

  // Hazards
  currentLevel.hazards.forEach(h => {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(h.x, h.y + h.h);
    for (let i = 0; i <= h.w; i += 10) {
      ctx.lineTo(h.x + i, h.y + (i % 20 === 0 ? 0 : h.h));
    }
    ctx.lineTo(h.x + h.w, h.y + h.h);
    ctx.fill();
  });

  // Answers
  currentLevel.answers.forEach(a => {
    const glow = a.correct ? 'rgba(34,197,94,0.4)' : 'rgba(245,158,11,0.4)';
    ctx.shadowColor = glow;
    ctx.shadowBlur = 15;
    ctx.fillStyle = a.correct ? '#22c55e' : '#f59e0b';
    roundRect(ctx, a.x, a.y, 34, 34, 10);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(a.value, a.x + 17, a.y + 17);
  });

  // Player
  ctx.fillStyle = '#e85d04';
  ctx.shadowColor = 'rgba(232, 93, 4, 0.4)';
  ctx.shadowBlur = 12;
  roundRect(ctx, player.x, player.y, player.w, player.h, 10);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Player eyes
  ctx.fillStyle = '#fff';
  const eyeOffset = player.facing > 0 ? 18 : 6;
  ctx.beginPath();
  ctx.arc(player.x + eyeOffset, player.y + 10, 4, 0, Math.PI * 2);
  ctx.arc(player.x + eyeOffset + (player.facing > 0 ? -7 : 7), player.y + 10, 4, 0, Math.PI * 2);
  ctx.fill();

  // Particles
  particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawPlatform(ctx, p, isDark, moving = false) {
  const base = isDark ? (moving ? '#475569' : '#334155') : (moving ? '#64748b' : '#94a3b8');
  const top = isDark ? '#22d3ee' : '#22c55e';

  ctx.fillStyle = base;
  roundRect(ctx, p.x, p.y, p.w, p.h, 6);
  ctx.fill();

  // Top grass/snow strip
  ctx.fillStyle = top;
  ctx.fillRect(p.x, p.y, p.w, 5);

  // Decorative dots
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  for (let i = 10; i < p.w - 5; i += 25) {
    ctx.beginPath();
    ctx.arc(p.x + i, p.y + p.h / 2 + 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

/* ========== LOOP ========== */
function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

/* ========== OVERLAY ========== */
function showOverlay(title, desc, btnText) {
  overlayTitle.textContent = title;
  overlayDesc.textContent = desc;
  overlayBtn.textContent = btnText;
  overlay.classList.add('show');
}

function hideOverlay() {
  overlay.classList.remove('show');
}

/* ========== CONTROLS ========== */
document.getElementById('restartBtn').addEventListener('click', () => {
  running = false;
  showOverlay('Chơi lại màn', 'Bạn sẽ bắt đầu lại màn hiện tại.', 'Bắt đầu');
  overlayBtn.onclick = () => {
    setupLevel(levelIndex);
    hideOverlay();
    running = true;
  };
});

document.getElementById('resetProgressBtn').addEventListener('click', () => {
  if (confirm('Xóa toàn bộ tiến trình và điểm số?')) {
    localStorage.removeItem('mathjump_progress');
    levelIndex = 0; score = 0; lives = 3;
    setupLevel(0);
    running = true;
  }
});

document.getElementById('backBtn').addEventListener('click', () => {
  location.href = '../index.html';
});

/* ========== BOOT ========== */
// Initialize moving platform origins
LEVELS.forEach(l => {
  if (l.movingPlatforms) {
    l.movingPlatforms.forEach(p => { p.originX = p.x; });
  }
});

initBackground();
loadProgress();
setupLevel(levelIndex);
showOverlay('🦊 Math Jump Adventure', 'Dùng phím mũi tên / WASD để di chuyển, Space để nhảy. Thu thập đáp án đúng!', 'Bắt đầu');
overlayBtn.onclick = () => {
  hideOverlay();
  running = true;
  requestAnimationFrame(loop);
};

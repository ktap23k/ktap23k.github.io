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
  for (let i = 0; i < 45; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.55,
      size: Math.random() * 1.8 + 0.4,
      twinkle: Math.random() * Math.PI * 2
    });
  }
  for (let i = 0; i < 7; i++) {
    clouds.push({
      x: Math.random() * canvas.width * 1.5,
      y: 40 + Math.random() * canvas.height * 0.35,
      w: 70 + Math.random() * 90,
      speed: 0.08 + Math.random() * 0.15
    });
  }
  for (let i = 0; i < 6; i++) {
    mountains.push({
      x: i * 220 - 80,
      y: canvas.height - 70 - Math.random() * 50,
      w: 160 + Math.random() * 100,
      h: 70 + Math.random() * 90,
      color: Math.random() > 0.5 ? '#86efac' : '#4ade80'
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

  // Friendly sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (isDark) {
    grad.addColorStop(0, '#141824');
    grad.addColorStop(0.45, '#1a2436');
    grad.addColorStop(1, '#0f2e1e');
  } else {
    grad.addColorStop(0, '#fff8e7');
    grad.addColorStop(0.4, '#ffefc2');
    grad.addColorStop(1, '#d4f5e0');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sun / moon
  ctx.save();
  ctx.translate(canvas.width - 90, 75);
  const orbGlow = isDark ? 'rgba(253, 224, 71, 0.18)' : 'rgba(255, 200, 80, 0.22)';
  const orbCore = isDark ? '#fde047' : '#ffd166';
  ctx.fillStyle = orbGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = orbCore;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Stars (subtle twinkle)
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.45)';
  stars.forEach(s => {
    const alpha = 0.35 + 0.45 * Math.abs(Math.sin(Date.now() * 0.0015 + s.twinkle));
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(s.x - cameraX * 0.04, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Rolling hills parallax
  mountains.forEach(m => {
    const parallaxX = (m.x - cameraX * 0.15) % (canvas.width + 350);
    const drawX = parallaxX < -m.w ? parallaxX + canvas.width + 350 : parallaxX;
    const hillColor = isDark ? '#1f3a2e' : m.color;
    const shadowColor = isDark ? '#14261e' : shadeColor(m.color, -12);

    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.ellipse(drawX + m.w / 2, canvas.height, m.w / 2 + 8, m.h / 2 + 8, 0, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = hillColor;
    ctx.beginPath();
    ctx.ellipse(drawX + m.w / 2, canvas.height, m.w / 2, m.h / 2, 0, Math.PI, 0);
    ctx.fill();
  });

  // Fluffy clouds parallax
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)';
  clouds.forEach(c => {
    c.x += c.speed;
    if (c.x > canvas.width + 120) c.x = -c.w - 40;
    const drawX = c.x - cameraX * 0.08;
    drawCloud(ctx, drawX, c.y, c.w);
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

  // Hazards (softer red-orange spikes)
  currentLevel.hazards.forEach(h => {
    drawSpikes(ctx, h);
  });

  // Answers
  const t = Date.now() * 0.003;
  currentLevel.answers.forEach((a, i) => {
    const bounce = 2 * Math.sin(t + i * 0.8);
    const glow = a.correct ? 'rgba(34,197,94,0.35)' : 'rgba(245,158,11,0.35)';
    ctx.shadowColor = glow;
    ctx.shadowBlur = 12;
    ctx.fillStyle = a.correct ? '#22c55e' : '#f59e0b';
    roundRect(ctx, a.x, a.y + bounce, 34, 34, 10);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, a.x + 3, a.y + bounce + 3, 28, 12, 6);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(a.value, a.x + 17, a.y + bounce + 17);
  });

  // Player — cute fox
  drawFox(ctx, player.x, player.y, player.w, player.h, player.facing);

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
  const base = isDark ? (moving ? '#574c3f' : '#3e352c') : (moving ? '#8d6e63' : '#a1887f');
  const top = isDark ? '#34d399' : '#4ade80';
  const rim = isDark ? '#6ee7b7' : '#86efac';

  // Soft shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  roundRect(ctx, p.x + 2, p.y + 4, p.w, p.h, 6);
  ctx.fill();

  // Earth body
  ctx.fillStyle = base;
  roundRect(ctx, p.x, p.y, p.w, p.h, 6);
  ctx.fill();

  // Grass top
  ctx.fillStyle = top;
  roundRect(ctx, p.x, p.y, p.w, 8, 6);
  ctx.fill();

  // Lighter rim
  ctx.fillStyle = rim;
  ctx.fillRect(p.x, p.y + 6, p.w, 3);

  // Tiny flowers / dots
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)';
  for (let i = 16; i < p.w - 8; i += 32) {
    ctx.beginPath();
    ctx.arc(p.x + i, p.y + 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSpikes(ctx, h) {
  ctx.save();
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(h.x, h.y + h.h);
  for (let i = 0; i <= h.w; i += 12) {
    const peak = (i % 24 === 0) ? 0 : h.h;
    ctx.lineTo(h.x + i, h.y + peak);
  }
  ctx.lineTo(h.x + h.w, h.y + h.h);
  ctx.fill();

  // Highlight
  ctx.clip();
  ctx.fillStyle = '#fb923c';
  ctx.fillRect(h.x, h.y, h.w, h.h * 0.45);
  ctx.restore();
}

function drawCloud(ctx, x, y, w) {
  const h = w * 0.38;
  ctx.beginPath();
  ctx.arc(x + w * 0.25, y + h * 0.55, h * 0.55, 0, Math.PI * 2);
  ctx.arc(x + w * 0.55, y + h * 0.35, h * 0.7, 0, Math.PI * 2);
  ctx.arc(x + w * 0.8, y + h * 0.55, h * 0.5, 0, Math.PI * 2);
  ctx.arc(x + w * 0.5, y + h * 0.75, h * 0.55, 0, Math.PI * 2);
  ctx.fill();
}

function drawFox(ctx, x, y, w, h, facing) {
  const cx = x + w / 2;
  const cy = y + h / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx, y + h - 2, w * 0.55, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  const tx = facing > 0 ? x - 4 : x + w + 4;
  ctx.ellipse(tx, y + h * 0.65, 10, 14, facing * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff7ed';
  ctx.beginPath();
  ctx.ellipse(tx + facing * 3, y + h * 0.7, 5, 8, facing * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#c2410c';
  ctx.beginPath();
  const earLeftX = facing > 0 ? x + 5 : x + w - 5;
  const earRightX = facing > 0 ? x + w - 5 : x + 5;
  ctx.moveTo(earLeftX, y + 4);
  ctx.lineTo(earLeftX + (facing > 0 ? -5 : 5), y - 7);
  ctx.lineTo(earLeftX + (facing > 0 ? 5 : -5), y + 4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(earRightX, y + 4);
  ctx.lineTo(earRightX + (facing > 0 ? -5 : 5), y - 7);
  ctx.lineTo(earRightX + (facing > 0 ? 5 : -5), y + 4);
  ctx.fill();

  // Body
  ctx.fillStyle = '#f97316';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();

  // White belly / muzzle
  ctx.fillStyle = '#fff7ed';
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.62, w * 0.35, h * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#1f2937';
  const eyeBaseX = facing > 0 ? x + 18 : x + w - 18;
  ctx.beginPath();
  ctx.arc(eyeBaseX, y + 11, 3, 0, Math.PI * 2);
  ctx.arc(eyeBaseX - (facing > 0 ? 7 : -7), y + 11, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(eyeBaseX + 1, y + 10, 1.2, 0, Math.PI * 2);
  ctx.arc(eyeBaseX - (facing > 0 ? 6 : -6), y + 10, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.arc(cx + facing * 7, y + 17, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function shadeColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
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

/* =========================================
   PIKACHU GAME LOGIC
   ========================================= */

const ANIMALS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦉','🐴','🦄','🐝','🐞'];
const BASE_TIME = 180;
const BOARD_W = 10;
const BOARD_H = 8;

let level = 1;
let score = 0;
let highScore = 0;
let timeLeft = BASE_TIME;
let timerId = null;
let grid = [];
let selected = null;
let locked = false;
let remainingPairs = 0;

const board = document.getElementById('board');
const boardWrap = document.getElementById('boardWrap');
const lineLayer = document.getElementById('lineLayer');
const particleLayer = document.getElementById('particleLayer');
const pCtx = particleLayer ? particleLayer.getContext('2d') : null;
const ctx = lineLayer.getContext('2d');
const levelStat = document.getElementById('levelStat');
const scoreStat = document.getElementById('scoreStat');
const highStat = document.getElementById('highStat');
const timeBar = document.getElementById('timeBar');
const toast = document.getElementById('toast');

let particles = [];

/* ========== INIT ========== */
function loadHighScore() {
  highScore = parseInt(localStorage.getItem('pikachu_highscore') || '0', 10) || 0;
  highStat.textContent = highScore;
}

function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('pikachu_highscore', highScore);
    highStat.textContent = highScore;
    showToast('🎉 Kỷ lục mới: ' + highScore);
  }
}

function initGame() {
  level = 1;
  score = 0;
  loadHighScore();
  startLevel();
}

function startLevel() {
  selected = null;
  locked = false;
  timeLeft = Math.max(30, BASE_TIME - (level - 1) * 10);
  buildBoard();
  renderBoard();
  updateStats();
  resizeCanvas();
  startTimer();
  ensureSolvable();
  showToast(`Level ${level} — Nối các cặp giống nhau!`);
}

function buildBoard() {
  const totalCells = BOARD_W * BOARD_H;
  const pairs = totalCells / 2;
  const pool = [];
  for (let i = 0; i < pairs; i++) {
    const animal = ANIMALS[i % ANIMALS.length];
    pool.push(animal, animal);
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  grid = [];
  for (let y = 0; y < BOARD_H; y++) {
    const row = [];
    for (let x = 0; x < BOARD_W; x++) {
      row.push(pool[y * BOARD_W + x]);
    }
    grid.push(row);
  }
  remainingPairs = pairs;
}

function renderBoard() {
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${BOARD_W}, 1fr)`;
  for (let y = 0; y < BOARD_H; y++) {
    for (let x = 0; x < BOARD_W; x++) {
      const cell = document.createElement('div');
      cell.className = 'pika-cell' + (grid[y][x] ? '' : ' empty');
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.textContent = grid[y][x] || '';
      cell.addEventListener('click', () => onCellClick(x, y));
      board.appendChild(cell);
    }
  }
}

function getCellEl(x, y) {
  return board.querySelector(`.pika-cell[data-x="${x}"][data-y="${y}"]`);
}

function onCellClick(x, y) {
  if (locked || !grid[y][x]) return;
  const cell = getCellEl(x, y);
  if (selected && selected.x === x && selected.y === y) {
    cell.classList.remove('selected');
    selected = null;
    return;
  }
  if (!selected) {
    selected = { x, y };
    cell.classList.add('selected');
    return;
  }
  const first = selected;
  const second = { x, y };
  if (grid[first.y][first.x] !== grid[second.y][second.x]) {
    getCellEl(first.x, first.y).classList.remove('selected');
    selected = { x, y };
    cell.classList.add('selected');
    return;
  }
  const path = findPath(first, second);
  if (path) {
    locked = true;
    drawPath(path);
    spawnMatchParticles(first, second);
    setTimeout(() => {
      grid[first.y][first.x] = null;
      grid[second.y][second.x] = null;
      const el1 = getCellEl(first.x, first.y);
      const el2 = getCellEl(second.x, second.y);
      el1.classList.add('matched', 'empty');
      el2.classList.add('matched', 'empty');
      el1.classList.remove('selected');
      el1.textContent = '';
      el2.textContent = '';
      clearCanvas();
      selected = null;
      locked = false;
      remainingPairs--;
      const timeBonus = Math.max(5, 20 - level * 2);
      score += 10 * level + timeBonus;
      timeLeft = Math.min(timeLeft + 2, BASE_TIME + level * 10);
      updateStats();
      if (remainingPairs <= 0) {
        saveHighScore();
        level++;
        setTimeout(startLevel, 600);
      } else {
        ensureSolvable();
      }
    }, 220);
  } else {
    cell.classList.add('shake');
    setTimeout(() => cell.classList.remove('shake'), 250);
  }
}

/* ========== PARTICLES ========== */
function spawnMatchParticles(a, b) {
  if (!particleLayer) return;
  const rect = boardWrap.getBoundingClientRect();
  const add = (x, y) => {
    const el = getCellEl(x, y);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left - rect.left + r.width / 2;
    const cy = r.top - rect.top + r.height / 2;
    for (let i = 0; i < 12; i++) {
      particles.push({
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        color: `hsl(${20 + Math.random() * 40}, 90%, 55%)`,
        size: 3 + Math.random() * 4
      });
    }
  };
  add(a.x, a.y);
  add(b.x, b.y);
  if (!particleLoopId) particleLoop();
}

let particleLoopId = null;
function particleLoop() {
  if (!pCtx || !particleLayer) return;
  pCtx.clearRect(0, 0, particleLayer.width, particleLayer.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life -= p.decay;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    pCtx.globalAlpha = p.life;
    pCtx.fillStyle = p.color;
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    pCtx.fill();
  }
  pCtx.globalAlpha = 1;
  if (particles.length) {
    particleLoopId = requestAnimationFrame(particleLoop);
  } else {
    particleLoopId = null;
  }
}

/* ========== PATH FINDING (Onet) ========== */
function findPath(a, b) {
  const visited = new Map();
  const q = [];
  const dirs = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];
  const key = (x, y, dir) => `${x},${y},${dir}`;
  const inBounds = (x, y) => x >= -1 && x <= BOARD_W && y >= -1 && y <= BOARD_H;

  for (let d = 0; d < 4; d++) {
    const nx = a.x + dirs[d].x;
    const ny = a.y + dirs[d].y;
    if (!inBounds(nx, ny)) continue;
    if (isPassable(nx, ny, a, b)) {
      const k = key(nx, ny, d);
      visited.set(k, {x:nx, y:ny, dir:d, turns:0, parent:null, start:a});
      q.push(visited.get(k));
    }
  }
  while (q.length) {
    const cur = q.shift();
    if (cur.x === b.x && cur.y === b.y) {
      const path = [a];
      let node = cur;
      const stack = [];
      while (node && !(node.x === a.x && node.y === a.y)) {
        stack.push({x: node.x, y: node.y});
        node = node.parent;
      }
      while (stack.length) path.push(stack.pop());
      return path;
    }
    for (let d = 0; d < 4; d++) {
      const nx = cur.x + dirs[d].x;
      const ny = cur.y + dirs[d].y;
      if (!inBounds(nx, ny)) continue;
      if (!isPassable(nx, ny, a, b)) continue;
      const newTurns = cur.dir === d ? cur.turns : cur.turns + 1;
      if (newTurns > 2) continue;
      const k = key(nx, ny, d);
      if (visited.has(k)) continue;
      visited.set(k, {x:nx, y:ny, dir:d, turns:newTurns, parent:cur, start:a});
      q.push(visited.get(k));
    }
  }
  return null;
}

function isPassable(x, y, start, end) {
  if (x === start.x && y === start.y) return true;
  if (x === end.x && y === end.y) return true;
  if (x < 0 || y < 0 || x >= BOARD_W || y >= BOARD_H) return true;
  return grid[y][x] === null;
}

/* ========== DRAW PATH ========== */
function drawPath(path) {
  if (path.length < 2) return;
  clearCanvas();
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e85d04';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(232,93,4,.45)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  const wrapRect = boardWrap.getBoundingClientRect();

  function pos(p) {
    const el = getCellEl(p.x, p.y);
    if (el) {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - wrapRect.left + r.width / 2,
        y: r.top - wrapRect.top + r.height / 2
      };
    }
    const gap = parseInt(getComputedStyle(board).gap) || 6;
    const cellW = (board.getBoundingClientRect().width - gap * (BOARD_W - 1)) / BOARD_W;
    const cellH = (board.getBoundingClientRect().height - gap * (BOARD_H - 1)) / BOARD_H;
    const pad = 18;
    return {
      x: pad + p.x * (cellW + gap) + cellW / 2,
      y: pad + p.y * (cellH + gap) + cellH / 2
    };
  }

  const start = pos(path[0]);
  ctx.moveTo(start.x, start.y);
  for (let i = 1; i < path.length; i++) {
    const p = pos(path[i]);
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}

function clearCanvas() {
  ctx.clearRect(0, 0, lineLayer.width, lineLayer.height);
}

function resizeCanvas() {
  const r = boardWrap.getBoundingClientRect();
  lineLayer.width = r.width;
  lineLayer.height = r.height;
  if (particleLayer) {
    particleLayer.width = r.width;
    particleLayer.height = r.height;
  }
}

/* ========== SOLVABILITY ========== */
function ensureSolvable() {
  const hint = findAnyHint();
  if (!hint) {
    shuffleBoard();
    if (!findAnyHint()) ensureSolvable();
  }
}

function findAnyHint() {
  const positions = {};
  for (let y = 0; y < BOARD_H; y++) {
    for (let x = 0; x < BOARD_W; x++) {
      const val = grid[y][x];
      if (!val) continue;
      if (!positions[val]) positions[val] = [];
      positions[val].push({x, y});
    }
  }
  for (const val in positions) {
    const arr = positions[val];
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (findPath(arr[i], arr[j])) return [arr[i], arr[j]];
      }
    }
  }
  return null;
}

function shuffleBoard() {
  if (selected) {
    selected = null;
    clearCanvas();
  }
  const tiles = [];
  for (let y = 0; y < BOARD_H; y++) {
    for (let x = 0; x < BOARD_W; x++) {
      if (grid[y][x]) tiles.push(grid[y][x]);
    }
  }
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  let idx = 0;
  for (let y = 0; y < BOARD_H; y++) {
    for (let x = 0; x < BOARD_W; x++) {
      if (grid[y][x]) grid[y][x] = tiles[idx++];
    }
  }
  renderBoard();
  showToast('🔀 Đã xáo trộn bàn cờ!');
}

/* ========== TIMER & STATS ========== */
function startTimer() {
  stopTimer();
  updateTimeBar();
  timerId = setInterval(() => {
    timeLeft--;
    updateTimeBar();
    if (timeLeft <= 0) {
      stopTimer();
      gameOver();
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function updateTimeBar() {
  const max = Math.max(BASE_TIME, timeLeft);
  const pct = Math.max(0, (timeLeft / max) * 100);
  timeBar.style.width = pct + '%';
}

function updateStats() {
  levelStat.textContent = level;
  scoreStat.textContent = score;
  highStat.textContent = highScore;
}

function gameOver() {
  locked = true;
  saveHighScore();
  showToast(`⏰ Hết giờ! Điểm: ${score}. Chơi lại nhé!`);
  setTimeout(() => {
    if (confirm(`Hết giờ! Điểm của bạn: ${score}. Chơi lại?`)) {
      initGame();
    }
  }, 400);
}

/* ========== UI HELPERS ========== */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

/* ========== EVENTS ========== */
document.getElementById('restartBtn').addEventListener('click', () => {
  stopTimer();
  if (confirm('Bạn muốn chơi lại từ đầu?')) initGame();
  else startTimer();
});

document.getElementById('shuffleBtn').addEventListener('click', () => {
  if (locked) return;
  score = Math.max(0, score - 50);
  updateStats();
  shuffleBoard();
  ensureSolvable();
});

document.getElementById('hintBtn').addEventListener('click', () => {
  if (locked) return;
  const hint = findAnyHint();
  if (!hint) {
    showToast('Không còn nước đi, tự động xáo!');
    shuffleBoard();
    return;
  }
  score = Math.max(0, score - 30);
  updateStats();
  hint.forEach(p => getCellEl(p.x, p.y).classList.add('hint'));
  setTimeout(() => {
    hint.forEach(p => getCellEl(p.x, p.y).classList.remove('hint'));
  }, 1200);
});

document.getElementById('backBtn').addEventListener('click', () => {
  location.href = '../index.html';
});

window.addEventListener('resize', resizeCanvas);

/* ========== BOOT ========== */
window.addEventListener('load', () => {
  resizeCanvas();
  initGame();
});

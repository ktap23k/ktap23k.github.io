/* =========================================
   MATH JUMP ADVENTURE — ENDLESS RUN ENGINE
   ========================================= */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayDesc = document.getElementById('overlayDesc');
const overlayBtn = document.getElementById('overlayBtn');

let score = 0;
let lives = 3;
let running = false;
let paused = false;
let lastTime = 0;
let prevLives = 3;
let bonusStageActive = false;
let bonusTimer = 0;
let slowMotionTimer = 0;
let justHadBonus = false;

const keys = { left: false, right: false, jump: false };

const player = {
  x: 0, y: 0, w: 28, h: 28,
  vx: 0, vy: 0,
  onGround: false,
  facing: 1,
  airJumps: 1,
  maxAirJumpsBase: 1,
  invincibleTimer: 0,
  highJumpTimer: 0,
  animState: 'idle',
  animTimer: 0,
  skin: 'fox'
};

// Endless run state
let runState = {
  segmentIndex: 0,
  seedOffset: Math.floor(Math.random() * 100000),
  checkpoints: [],
  question: '',
  correctAnswer: '',
  world: { platforms: [], movingPlatforms: [], hazards: [], windZones: [], enemies: [], answers: [], powerups: [], coins: [] }
};

let cameraX = 0;
let particles = [];
let stars = [];
let clouds = [];
let mountains = [];
let confetti = [];

/* ========== INPUT ========== */
window.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
    if (!keys.jump) tryJump();
    keys.jump = true;
    if (e.code === 'Space') e.preventDefault();
  }
  if (e.code === 'Enter') {
    e.preventDefault();
    retryFromCheckpoint();
  }
  if (e.code === 'Escape' || e.code === 'KeyP') {
    e.preventDefault();
    togglePause();
  }
  if (e.code === 'KeyH') {
    e.preventDefault();
    useHint();
  }
});

window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') keys.jump = false;
});

document.querySelectorAll('.jmp-touch__btn').forEach(btn => {
  const k = btn.dataset.key;
  const start = e => {
    e.preventDefault();
    if (k === 'jump' && !keys[k]) tryJump();
    keys[k] = true;
  };
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
      runState.segmentIndex = Math.max(0, p.segmentIndex || 0);
      runState.seedOffset = p.seedOffset || Math.floor(Math.random() * 100000);
      runState.checkpoints = Array.isArray(p.checkpoints) ? p.checkpoints : [];
      runState.segmentEnds = Array.isArray(p.segmentEnds) ? p.segmentEnds : [];
      score = p.score || 0;
      lives = Math.max(1, Math.min(5, p.lives || 3));
      if (window.Shop) Shop.load({ coins: p.coins, ownedItems: p.ownedItems, unlockedSkins: p.unlockedSkins, currentSkin: p.currentSkin });
      if (window.Effects) Effects.loadCombo(p.combo);
      if (window.AudioManager) AudioManager.loadAudioSettings(p.audioSettings);
      if (p.currentSkin && player) player.skin = p.currentSkin;
    } catch (e) {
      resetRunState();
    }
  } else {
    resetRunState();
  }
}

function saveProgress() {
  try {
    localStorage.setItem('mathjump_progress', JSON.stringify({
      segmentIndex: runState.segmentIndex,
      seedOffset: runState.seedOffset,
      checkpoints: runState.checkpoints,
      segmentEnds: runState.segmentEnds,
      score,
      lives,
      coins: Shop ? Shop.getCoins() : 0,
      combo: Effects ? Effects.getCombo() : { count: 0, timer: 0, max: 0 },
      ownedItems: Shop ? Shop.getOwnedItems() : {},
      unlockedSkins: Shop ? Shop.getUnlockedSkins() : ['fox'],
      currentSkin: player.skin || 'fox',
      audioSettings: AudioManager ? AudioManager.getSettings() : { bgm: true, sfx: true }
    }));
  } catch (e) { /* ignore private mode */ }
}

function resetRunState() {
  runState = {
    segmentIndex: 0,
    seedOffset: Math.floor(Math.random() * 100000),
    checkpoints: [],
    question: '',
    correctAnswer: '',
    world: { platforms: [], movingPlatforms: [], hazards: [], windZones: [], enemies: [], answers: [], powerups: [], coins: [] }
  };
}

/* ========== RUN SETUP ========== */
function startRun(fresh = false) {
  if (fresh) {
    resetRunState();
    score = 0;
    lives = 3;
    if (Effects) Effects.resetCombo();
    bonusStageActive = false;
    bonusTimer = 0;
    slowMotionTimer = 0;
    justHadBonus = false;
    runState.segmentEnds = [];
  }

  // Apply shop passive items
  if (Shop) {
    if (Shop.hasItem('extraLife')) {
      if (Shop.useItem('extraLife')) lives = Math.min(MAX_LIVES, lives + 1);
    }
    if (Shop.hasItem('shieldStart')) {
      if (Shop.useItem('shieldStart')) player.invincibleTimer = 3000;
    }
  }

  // Rebuild the world up to the current segment index deterministically.
  runState.world = { platforms: [], movingPlatforms: [], hazards: [], windZones: [], enemies: [], answers: [], powerups: [], coins: [] };
  runState.segmentEnds = runState.segmentEnds || [];
  let startX = 0;
  let startY = 480;

  for (let i = 0; i <= runState.segmentIndex; i++) {
    const isActive = i === runState.segmentIndex;
    const segEnd = appendSegment(startX, startY, i, i === 0, isActive);
    runState.segmentEnds[i] = { x: segEnd.endX, y: segEnd.endY };
    startX = segEnd.endX;
    startY = segEnd.endY;
  }

  // Pick question for the active segment
  pickQuestionForSegment();

  // Spawn player at last checkpoint or beginning
  const cp = runState.checkpoints.length > 0
    ? runState.checkpoints[runState.checkpoints.length - 1]
    : { x: 60, y: 480 };
  player.x = cp.x - player.w / 2;
  player.y = cp.y - player.h - 2;
  player.vx = 0;
  player.vy = 0;
  player.facing = 1;
  cameraX = Math.max(0, player.x - canvas.width / 3);

  updateStats();
  updateEffectsUI();
  saveProgress();
}

function pickQuestionForSegment() {
  const isBoss = runState.segmentIndex % 10 === 9 && runState.segmentIndex > 0;
  let q;
  if (isBoss && typeof getBossQuestion === 'function') {
    q = getBossQuestion(runState.segmentIndex);
  } else {
    q = getSegmentQuestion(runState.segmentIndex);
  }
  runState.question = q.q;
  runState.correctAnswer = q.a;
  const label = isBoss ? '💀 Nhiệm vụ BOSS' : 'Nhiệm vụ';
  const labelEl = document.querySelector('.jmp-question__label');
  if (labelEl) labelEl.textContent = label;
  document.getElementById('questionText').textContent = q.q;
}

function appendSegment(startX, startY, segmentIndex, isFirst = false, withCollectables = true) {
  const difficulty = Math.min(18, Math.floor(segmentIndex / 2));
  const seed = runState.seedOffset + segmentIndex * 999983;

  // Bonus stage when combo >= 5 (not twice in a row)
  const comboCount = Effects ? Effects.getCombo().count : 0;
  const isBonus = withCollectables && comboCount >= 5 && !bonusStageActive && !justHadBonus;
  let seg;
  if (isBonus && typeof generateBonusSegment === 'function') {
    seg = generateBonusSegment(startX, startY, seed);
    bonusStageActive = true;
    bonusTimer = 10000;
    justHadBonus = true;
    runState.question = '🎁 Màn Bonus! Thu thập coins trong 10 giây!';
    runState.correctAnswer = '';
    document.getElementById('questionText').textContent = runState.question;
    const labelEl = document.querySelector('.jmp-question__label');
    if (labelEl) labelEl.textContent = 'Bonus Stage';
  } else {
    seg = generateSegment(startX, startY, difficulty, seed, isFirst, segmentIndex);
    bonusStageActive = false;
    bonusTimer = 0;
    justHadBonus = isBonus;
  }

  const q = getSegmentQuestion(segmentIndex);

  runState.world.platforms.push(...seg.platforms);
  runState.world.movingPlatforms.push(...(seg.movingPlatforms || []));
  runState.world.hazards.push(...seg.hazards);
  if (seg.windZones) runState.world.windZones.push(...seg.windZones);
  if (seg.enemies) runState.world.enemies.push(...seg.enemies);
  if (seg.coins) runState.world.coins.push(...seg.coins);

  if (withCollectables && !seg.isBonus) {
    let s = seed >>> 0;
    if (s === 0) s = 12345;
    const rng = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    const activeQ = isBonus ? q : { q: runState.question, a: runState.correctAnswer };
    const answers = makeSegmentAnswers(rng, activeQ.a, seg.answerXs);
    runState.world.answers.push(...answers);
    const powerups = makeSegmentPowerups(rng, seg.powerupSpots);
    runState.world.powerups.push(...powerups);
  }

  return { endX: seg.endX, endY: seg.endY };
}

function findSegmentEnd(segmentIndex) {
  let startX = 0;
  let startY = 480;
  for (let i = 0; i <= segmentIndex; i++) {
    const difficulty = Math.min(18, Math.floor(i / 2));
    const seed = runState.seedOffset + i * 999983;
    const seg = generateSegment(startX, startY, difficulty, seed, i === 0, i);
    startX = seg.endX;
    startY = seg.endY;
  }
  return { x: startX, y: startY };
}

function getWorldWidth() {
  let maxX = canvas.width;
  runState.world.platforms.forEach(p => { maxX = Math.max(maxX, p.x + p.w); });
  runState.world.movingPlatforms.forEach(p => { maxX = Math.max(maxX, p.x + p.w + p.range); });
  runState.world.answers.forEach(a => { maxX = Math.max(maxX, a.x + 80); });
  runState.world.coins.forEach(c => { maxX = Math.max(maxX, c.x + 40); });
  return maxX + 240;
}

function updateStats() {
  document.getElementById('levelStat').textContent = runState.segmentIndex + 1;
  document.getElementById('scoreStat').textContent = score;
  document.getElementById('livesStat').textContent = lives;
  const coinEl = document.getElementById('coinStat');
  if (coinEl) coinEl.textContent = Shop ? Shop.getCoins() : 0;
}

function updateEffectsUI() {
  const panel = document.getElementById('effectsPanel');
  if (!panel) return;
  const items = [];
  if (player.invincibleTimer > 0) {
    items.push(`<span class="jmp-effect jmp-effect--invincible">★ Bất tử ${Math.ceil(player.invincibleTimer / 1000)}s</span>`);
  }
  if (player.highJumpTimer > 0) {
    items.push(`<span class="jmp-effect jmp-effect--highjump">↑ Bay cao ${Math.ceil(player.highJumpTimer / 1000)}s</span>`);
  }
  const combo = Effects ? Effects.getCombo() : { count: 0 };
  if (combo.count >= 2) {
    items.push(`<span class="jmp-effect jmp-effect--combo">🔥 x${combo.count}</span>`);
  }
  if (bonusStageActive && bonusTimer > 0) {
    items.push(`<span class="jmp-effect jmp-effect--bonus">⏱ ${Math.ceil(bonusTimer / 1000)}s</span>`);
  }
  panel.innerHTML = items.join('');
}

/* ========== PHYSICS ========== */
const GRAVITY = 0.6;
const MOVE_SPEED = 4.5;
const JUMP_FORCE = -12;
const FRICTION = 0.82;
const ICE_FRICTION = 0.98;
const HIGH_JUMP_FORCE = -15;
const DOUBLE_JUMP_FORCE = -10;
const MAX_LIVES = 5;

function getMaxAirJumps() {
  return player.highJumpTimer > 0 ? 2 : player.maxAirJumpsBase;
}

function tryJump() {
  if (!running || paused) return;
  if (player.onGround) {
    player.vy = player.highJumpTimer > 0 ? HIGH_JUMP_FORCE : JUMP_FORCE;
    player.onGround = false;
    player.airJumps = getMaxAirJumps();
    if (AudioManager) AudioManager.playJump();
  } else if (player.airJumps > 0) {
    const force = player.highJumpTimer > 0 ? HIGH_JUMP_FORCE : DOUBLE_JUMP_FORCE;
    player.vy = force;
    player.airJumps--;
    spawnParticles(player.x + player.w / 2, player.y + player.h, '#60a5fa');
    if (AudioManager) AudioManager.playDoubleJump();
  }
}

function update(dt) {
  if (!running || paused) return;

  // Timers
  if (player.invincibleTimer > 0) player.invincibleTimer = Math.max(0, player.invincibleTimer - dt);
  if (player.highJumpTimer > 0) player.highJumpTimer = Math.max(0, player.highJumpTimer - dt);
  player.animTimer += dt;

  // BGM pitch up when invincible
  if (AudioManager) {
    AudioManager.setBgmPitch(player.invincibleTimer > 0 ? 1.2 : 1);
  }

  // Slow motion item
  if (Shop && Shop.hasItem('slowMotion') && player.y > canvas.height - 120 && player.vy > 0) {
    if (Shop.useItem('slowMotion')) slowMotionTimer = 3000;
  }
  if (slowMotionTimer > 0) {
    slowMotionTimer -= dt;
    if (slowMotionTimer < 0) slowMotionTimer = 0;
  }
  const timeScale = slowMotionTimer > 0 ? 0.4 : 1;
  const scaledDt = dt * timeScale;

  // Movement (scaled by timeScale for slow motion)
  if (keys.left) { player.vx -= 0.8 * timeScale; player.facing = -1; }
  if (keys.right) { player.vx += 0.8 * timeScale; player.facing = 1; }
  player.vx *= Math.pow(FRICTION, timeScale);
  player.vx = Math.max(-MOVE_SPEED, Math.min(MOVE_SPEED, player.vx));
  player.x += player.vx * timeScale;
  handleCollisions('x');

  player.vy += GRAVITY * timeScale;
  player.y += player.vy * timeScale;
  player.onGround = false;
  handleCollisions('y');

  // Wind zones
  if (runState.world.windZones) {
    runState.world.windZones.forEach(w => {
      if (rectIntersect(player, w)) {
        player.vx += w.force * timeScale;
        spawnWindParticle(w);
      }
    });
  }

  // Moving platforms
  if (runState.world.movingPlatforms) {
    runState.world.movingPlatforms.forEach(p => {
      p.x += p.dx * timeScale;
      if (Math.abs(p.x - p.originX) > p.range) p.dx *= -1;
    });
  }

  // Enemies
  if (runState.world.enemies) {
    runState.world.enemies.forEach(e => {
      e.x += e.dx * timeScale;
      if (Math.abs(e.x - e.originX) > e.range) e.dx *= -1;
      if (rectIntersect(player, e) && player.invincibleTimer <= 0) {
        loseLife('Bị quái vật đụng!');
      }
    });
  }

  // Crumbling platforms
  updateCrumblePlatforms(dt);

  if (player.y > canvas.height + 80) {
    if (AudioManager) AudioManager.playFall();
    loseLife();
    return;
  }

  // Active collision window for performance
  const activeMin = cameraX - 100;
  const activeMax = cameraX + canvas.width + 100;

  const hazardHit = runState.world.hazards.some(h => h.x + h.w >= activeMin && h.x <= activeMax && rectIntersect(player, h));
  if (hazardHit && player.invincibleTimer <= 0) {
    if (AudioManager) AudioManager.playHit();
    Effects.triggerScreenShake(8, 300);
    loseLife();
    return;
  }

  // Power-ups
  for (let i = runState.world.powerups.length - 1; i >= 0; i--) {
    const pup = runState.world.powerups[i];
    if (pup.x + 32 < activeMin || pup.x > activeMax) continue;
    const box = { x: pup.x, y: pup.y, w: 32, h: 32 };
    if (rectIntersect(player, box)) {
      if (AudioManager) AudioManager.playPowerup(pup.type);
      applyPowerup(pup);
      runState.world.powerups.splice(i, 1);
      saveProgress();
    }
  }

  // Coins (bonus stage)
  for (let i = runState.world.coins.length - 1; i >= 0; i--) {
    const c = runState.world.coins[i];
    const box = { x: c.x, y: c.y, w: c.w || 24, h: c.h || 24 };
    if (rectIntersect(player, box)) {
      if (Shop) Shop.addCoins(c.value || 10);
      spawnParticles(c.x + 12, c.y + 12, '#fbbf24');
      Effects.spawnFloatingText(c.x + 12, c.y, '+' + (c.value || 10), '#fbbf24');
      runState.world.coins.splice(i, 1);
      saveProgress();
    }
  }

  // Bonus timer
  if (bonusStageActive) {
    bonusTimer -= dt;
    if (bonusTimer <= 0) {
      bonusStageActive = false;
      extendRun();
    }
  }

  // Answers
  for (let i = runState.world.answers.length - 1; i >= 0; i--) {
    const ans = runState.world.answers[i];
    const box = { x: ans.x, y: ans.y, w: 34, h: 34 };
    if (rectIntersect(player, box)) {
      if (ans.correct) {
        spawnParticles(ans.x + 17, ans.y + 17, '#22c55e');
        const gained = Effects ? Effects.recordCorrect(ans.x + 17, ans.y + 17, runState.segmentIndex) : (100 + runState.segmentIndex * 25);
        score += gained;

        // Coins reward
        if (Shop) {
          Shop.addCoins(10);
          const combo = Effects ? Effects.getCombo() : { count: 0 };
          if (combo.count >= 3) Shop.addCoins(30);
          if (runState.segmentIndex === 0) Shop.addCoins(50);
        }

        // Skin unlock check
        if (Shop) {
          const combo = Effects ? Effects.getCombo() : { count: 0 };
          const newSkins = Shop.checkUnlocks({ segmentIndex: runState.segmentIndex, score, comboMax: combo.max });
          newSkins.forEach(name => Effects.spawnFloatingText(player.x, player.y - 30, 'Mở khóa: ' + name, '#a855f7'));
        }

        // Boss break effect
        const isBoss = runState.segmentIndex % 10 === 9 && runState.segmentIndex > 0;
        if (isBoss) {
          score += 500;
          spawnConfetti(ans.x + 17, ans.y + 17);
          Effects.spawnFloatingText(ans.x + 17, ans.y - 20, '+500 BOSS!', '#a855f7');
        }

        // Save checkpoint at the platform under the answer
        const cp = findCheckpointPlatform(ans);
        runState.checkpoints.push(cp);

        // Remove this answer so it can't be collected again
        runState.world.answers.splice(i, 1);

        if (AudioManager) AudioManager.playCheckpoint();

        // Extend the world to the right with a new segment
        extendRun();
      } else if (player.invincibleTimer <= 0) {
        spawnParticles(ans.x + 17, ans.y + 17, '#ef4444');
        if (Effects) Effects.recordWrong(ans.x + 17, ans.y + 17);
        if (AudioManager) AudioManager.playWrong();
        loseLife('Sai đáp án!');
      }
      saveProgress();
      return;
    }
  }

  // Particles limit
  if (particles.length > 100) particles.splice(0, particles.length - 100);

  const targetCam = player.x - canvas.width / 3;
  cameraX += (targetCam - cameraX) * 0.1;
  cameraX = Math.max(0, Math.min(cameraX, getWorldWidth() - canvas.width));

  updateParticles(scaledDt);
  updateConfetti(scaledDt);
  if (Effects) Effects.update(dt);
  updateStats();
  updateEffectsUI();

  prevLives = lives;
}

function updateCrumblePlatforms(dt) {
  for (let i = runState.world.platforms.length - 1; i >= 0; i--) {
    const p = runState.world.platforms[i];
    if (p.type !== 'crumble') continue;

    // Player standing on this crumbling platform
    if (p.crumbleTimer === null && player.onGround && rectIntersect(player, { x: p.x, y: p.y - 2, w: p.w, h: 2 })) {
      p.crumbleTimer = 2000;
    }

    if (p.crumbleTimer !== null) {
      p.crumbleTimer -= dt;
      if (p.crumbleTimer <= 0) {
        spawnParticles(p.x + p.w / 2, p.y, '#a1887f');
        runState.world.platforms.splice(i, 1);
      }
    }
  }
}

function spawnWindParticle(w) {
  if (Math.random() > 0.15) return;
  particles.push({
    x: w.x + w.w,
    y: w.y + Math.random() * w.h,
    vx: -4 - Math.random() * 3,
    vy: (Math.random() - 0.5) * 1.5,
    life: 1,
    decay: 0.03,
    color: 'rgba(167,243,208,0.6)',
    size: 2 + Math.random() * 3
  });
}

function findCheckpointPlatform(ans) {
  const allPlatforms = runState.world.platforms.concat(runState.world.movingPlatforms || []);
  const ax = ans.x + 17;
  for (const p of allPlatforms) {
    if (ax >= p.x - 10 && ax <= p.x + p.w + 10 && ans.y + 85 >= p.y - 5 && ans.y + 85 <= p.y + p.h + 5) {
      return { x: p.x + p.w / 2, y: p.y };
    }
  }
  return { x: ans.x + 17, y: ans.y + 85 };
}

function applyPowerup(pup) {
  spawnParticles(pup.x + 16, pup.y + 16, pup.color);
  if (pup.type === 'life') {
    lives = Math.min(MAX_LIVES, lives + 1);
    Effects.spawnFloatingText(pup.x + 16, pup.y, '+1 ❤', '#ef4444');
  } else if (pup.type === 'invincible') {
    player.invincibleTimer = 6000;
  } else if (pup.type === 'highjump') {
    player.highJumpTimer = 6000;
    player.airJumps = getMaxAirJumps();
  }
  updateStats();
}

function extendRun() {
  runState.segmentIndex++;

  let startX = 0;
  let startY = 480;
  for (let i = 0; i < runState.segmentIndex; i++) {
    const segEnd = findSegmentEnd(i);
    startX = segEnd.x;
    startY = segEnd.y;
  }

  appendSegment(startX, startY, runState.segmentIndex, false, true);

  if (!bonusStageActive) {
    pickQuestionForSegment();
  }
}

function handleCollisions(axis) {
  const platforms = runState.world.platforms.concat(runState.world.movingPlatforms || []);
  for (const p of platforms) {
    if (!rectIntersect(player, p)) continue;
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
        if (p.type === 'ice') {
          player.vx *= ICE_FRICTION;
        }
      } else if (player.vy < 0) {
        player.y = p.y + p.h;
        player.vy = 0;
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
  Effects.triggerScreenFlash('#ef4444', 0.4);
  saveProgress();
  running = false;
  if (AudioManager) AudioManager.pauseBgm();

  if (AudioManager) {
    if (lives <= 0) AudioManager.playGameOver();
    else AudioManager.playHit();
  }

  if (lives <= 0) {
    Effects.triggerScreenFlash('#dc2626', 0.5);
    const isHighScore = checkHighScore(score);
    const extra = isHighScore ? '<br><input id="playerName" type="text" placeholder="Tên của bạn" maxlength="20" style="margin-top:10px;padding:8px 12px;border-radius:8px;border:none;width:220px;font-size:1rem;text-align:center;">' : '';
    showOverlay('💔 Game Over', `Bạn đạt ${runState.segmentIndex} đoạn — Điểm: ${score}.${extra}`, 'Chơi lại');
    overlayBtn.onclick = () => {
      if (isHighScore) {
        const nameInput = document.getElementById('playerName');
        const name = nameInput ? (nameInput.value.trim() || 'Ẩn danh') : 'Ẩn danh';
        saveHighScore(name, score, runState.segmentIndex);
      }
      startRun(true);
      hideOverlay();
      running = true;
      if (AudioManager) AudioManager.startBgm();
    };
  } else {
    const hasCheckpoint = runState.checkpoints.length > 0;
    showOverlay('😅 Ôi không!', msg || 'Bạn đã mất một mạng.', hasCheckpoint ? 'Thử lại từ checkpoint' : 'Thử lại');
    overlayBtn.onclick = () => {
      respawnAtCheckpoint();
      hideOverlay();
      running = true;
      if (AudioManager) AudioManager.startBgm();
    };
  }
}

function respawnAtCheckpoint() {
  const cp = runState.checkpoints.length > 0
    ? runState.checkpoints[runState.checkpoints.length - 1]
    : { x: 60, y: 480 };
  player.x = cp.x - player.w / 2;
  player.y = cp.y - player.h - 2;
  player.vx = 0;
  player.vy = 0;
  player.invincibleTimer = 1000; // brief mercy invincibility
  cameraX = Math.max(0, player.x - canvas.width / 3);
}

function retryFromCheckpoint() {
  if (overlay.classList.contains('show') && overlayBtn.style.display !== 'none') {
    overlayBtn.click();
    return;
  }
  if (running) {
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#f59e0b');
    respawnAtCheckpoint();
  }
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

function updateParticles(dtScale = 1) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dtScale;
    p.y += p.vy * dtScale;
    p.vy += 0.2 * dtScale;
    p.life -= p.decay * dtScale;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

/* ========== CONFETTI ========== */
function spawnConfetti(x, y) {
  for (let i = 0; i < 40; i++) {
    confetti.push({
      x, y,
      vx: (Math.random() - 0.5) * 10,
      vy: -4 - Math.random() * 6,
      color: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][Math.floor(Math.random() * 6)],
      life: 1.5,
      size: 4 + Math.random() * 5,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3
    });
  }
}

function updateConfetti(dtScale = 1) {
  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    c.x += c.vx * dtScale;
    c.y += c.vy * dtScale;
    c.vy += 0.25 * dtScale;
    c.rotation += c.rotSpeed * dtScale;
    c.life -= 0.015 * dtScale;
    if (c.life <= 0) confetti.splice(i, 1);
  }
}

/* ========== ANIMATION STATE ========== */
function updateAnimState() {
  if (lives < prevLives) {
    player.animState = 'hurt';
    player.animTimer = 0;
    setTimeout(() => { prevLives = lives; }, 500);
    return;
  }
  if (player.animState === 'hurt' && player.animTimer < 500) return;

  if (!player.onGround && player.vy < 0) player.animState = 'jump';
  else if (!player.onGround && player.vy > 0) player.animState = 'fall';
  else if (player.onGround && Math.abs(player.vx) > 0.5) player.animState = 'run';
  else player.animState = 'idle';
}

/* ========== RENDER ========== */
function draw() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  ctx.save();
  if (Effects) Effects.applyShake(ctx);

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

  // Stars
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

  // Clouds
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)';
  clouds.forEach(c => {
    c.x += c.speed;
    if (c.x > canvas.width + 120) c.x = -c.w - 40;
    const drawX = c.x - cameraX * 0.08;
    drawCloud(ctx, drawX, c.y, c.w);
  });

  ctx.save();
  ctx.translate(-cameraX, 0);

  // Active range for performance
  const activeMin = cameraX - 100;
  const activeMax = cameraX + canvas.width + 100;

  // Wind zones
  if (runState.world.windZones) {
    runState.world.windZones.forEach(w => {
      if (w.x + w.w < activeMin || w.x > activeMax) return;
      ctx.fillStyle = isDark ? 'rgba(167,243,208,0.08)' : 'rgba(167,243,208,0.22)';
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = isDark ? 'rgba(167,243,208,0.18)' : 'rgba(167,243,208,0.35)';
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(w.x, w.y, w.w, w.h);
      ctx.setLineDash([]);
    });
  }

  // Platforms
  runState.world.platforms.forEach(p => {
    if (p.x + p.w < activeMin || p.x > activeMax) return;
    drawPlatform(ctx, p, isDark);
  });

  // Moving platforms
  runState.world.movingPlatforms.forEach(p => {
    if (p.x + p.w + p.range < activeMin || p.x - p.range > activeMax) return;
    drawPlatform(ctx, p, isDark, true);
  });

  // Hazards
  runState.world.hazards.forEach(h => {
    if (h.x + h.w < activeMin || h.x > activeMax) return;
    drawSpikes(ctx, h);
  });

  // Enemies
  runState.world.enemies.forEach(e => {
    if (e.x + e.w < activeMin || e.x > activeMax) return;
    drawEnemy(ctx, e);
  });

  // Coins
  const t = Date.now() * 0.003;
  runState.world.coins.forEach((c, i) => {
    if (c.x + 24 < activeMin || c.x > activeMax) return;
    const bounce = 3 * Math.sin(t + i * 1.2);
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = 'rgba(251,191,36,0.55)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(c.x + 12, c.y + 12 + bounce, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fffbeb';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', c.x + 12, c.y + 12 + bounce);
  });

  // Power-ups
  runState.world.powerups.forEach((pup, i) => {
    const bounce = 3 * Math.sin(t + i * 1.2);
    ctx.shadowColor = pup.glow;
    ctx.shadowBlur = 14;
    ctx.fillStyle = pup.color;
    roundRect(ctx, pup.x, pup.y + bounce, 32, 32, 10);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    roundRect(ctx, pup.x + 3, pup.y + bounce + 3, 26, 11, 5);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(pup.label, pup.x + 16, pup.y + bounce + 16);
  });

  // Answers
  runState.world.answers.forEach((a, i) => {
    const bounce = 2 * Math.sin(t + i * 0.8);
    const glow = a.correct ? 'rgba(34,197,94,0.35)' : 'rgba(245,158,11,0.35)';
    ctx.shadowColor = glow;
    ctx.shadowBlur = 12;
    ctx.fillStyle = a.correct ? '#22c55e' : '#f59e0b';
    roundRect(ctx, a.x, a.y + bounce, 34, 34, 10);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, a.x + 3, a.y + bounce + 3, 28, 12, 6);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontSize = 15;
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    let tw = ctx.measureText(a.value).width;
    while (tw > 30 && fontSize > 8) {
      fontSize--;
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      tw = ctx.measureText(a.value).width;
    }
    ctx.fillText(a.value, a.x + 17, a.y + bounce + 17);
  });

  // Player
  if (player.invincibleTimer > 0) {
    const pulse = 1 + 0.15 * Math.sin(Date.now() * 0.015);
    ctx.fillStyle = `rgba(245,158,11,${0.18 + 0.1 * Math.sin(Date.now() * 0.01)})`;
    ctx.beginPath();
    ctx.arc(player.x + player.w / 2, player.y + player.h / 2, player.w * pulse, 0, Math.PI * 2);
    ctx.fill();
  }
  if (player.highJumpTimer > 0) {
    ctx.fillStyle = 'rgba(59,130,246,0.35)';
    ctx.beginPath();
    ctx.ellipse(player.x + player.w / 2, player.y + player.h + 4, player.w * 0.7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
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

  // Confetti
  confetti.forEach(c => {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotation);
    ctx.globalAlpha = Math.max(0, c.life);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
    ctx.restore();
  });
  ctx.globalAlpha = 1;

  // Floating texts
  if (Effects) Effects.drawFloatingTexts(ctx);

  ctx.restore();
  ctx.restore();

  // Screen flash on top
  if (Effects) Effects.applyFlash(ctx, canvas.width, canvas.height);

  // Pause overlay text
  if (paused) {
    ctx.fillStyle = 'rgba(15,23,42,0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⏸ Tạm dừng', canvas.width / 2, canvas.height / 2);
  }
}

function drawPlatform(ctx, p, isDark, moving = false) {
  let base, top, rim;
  if (p.type === 'ice') {
    base = isDark ? '#1e3a4c' : '#bfdbfe';
    top = isDark ? '#7dd3fc' : '#e0f2fe';
    rim = isDark ? '#38bdf8' : '#7dd3fc';
  } else if (p.type === 'crumble' && p.crumbleTimer !== null) {
    base = isDark ? '#4a3b32' : '#d7ccc8';
    top = isDark ? '#a1887f' : '#bcaaa4';
    rim = isDark ? '#d7ccc8' : '#8d6e63';
  } else {
    base = isDark ? (moving ? '#574c3f' : '#3e352c') : (moving ? '#8d6e63' : '#a1887f');
    top = isDark ? '#34d399' : '#4ade80';
    rim = isDark ? '#6ee7b7' : '#86efac';
  }

  ctx.save();
  // Crumble shake
  if (p.type === 'crumble' && p.crumbleTimer !== null) {
    const shake = (2000 - p.crumbleTimer) / 2000 * 2;
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  roundRect(ctx, p.x + 2, p.y + 4, p.w, p.h, 6);
  ctx.fill();

  ctx.fillStyle = base;
  roundRect(ctx, p.x, p.y, p.w, p.h, 6);
  ctx.fill();

  ctx.fillStyle = top;
  roundRect(ctx, p.x, p.y, p.w, 8, 6);
  ctx.fill();

  ctx.fillStyle = rim;
  ctx.fillRect(p.x, p.y + 6, p.w, 3);

  // Ice shine
  if (p.type === 'ice') {
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(p.x + 8, p.y + 4);
    ctx.lineTo(p.x + p.w - 8, p.y + 4);
    ctx.lineTo(p.x + p.w - 20, p.y + 10);
    ctx.lineTo(p.x + 20, p.y + 10);
    ctx.fill();
  }

  // Crumble cracks
  if (p.type === 'crumble' && p.crumbleTimer !== null) {
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(62,39,35,0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x + 10, p.y + 6);
    ctx.lineTo(p.x + p.w / 2, p.y + p.h - 4);
    ctx.lineTo(p.x + p.w - 12, p.y + 8);
    ctx.stroke();
  }

  // Standard dots for normal platforms
  if (p.type !== 'ice' && p.type !== 'crumble') {
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)';
    for (let i = 16; i < p.w - 8; i += 32) {
      ctx.beginPath();
      ctx.arc(p.x + i, p.y + 4, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
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

  ctx.clip();
  ctx.fillStyle = '#fb923c';
  ctx.fillRect(h.x, h.y, h.w, h.h * 0.45);
  ctx.restore();
}

function drawEnemy(ctx, e) {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(0, 0, e.w / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.arc(-6, -3, 4, 0, Math.PI * 2);
  ctx.arc(6, -3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-7, -4, 1.5, 0, Math.PI * 2);
  ctx.arc(5, -4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, 6);
  ctx.lineTo(4, 6);
  ctx.stroke();
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
  const skin = Shop ? Shop.getSkin(player.skin) : { color: '#f97316', secondary: '#ea580c' };
  const baseColor = skin.color;
  const secondary = skin.secondary;

  // Rainbow shimmer
  if (player.skin === 'rainbow') {
    const hue = (Date.now() / 10) % 360;
    ctx.filter = `hue-rotate(${hue}deg)`;
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx, y + h - 2, w * 0.55, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Animation helpers
  const state = player.animState;
  const timer = player.animTimer;
  const runCycle = Math.sin(timer * 0.02);
  const tailAngle = state === 'run' ? facing * 0.6 + runCycle * 0.25 :
                    state === 'jump' || state === 'fall' ? facing * 0.1 :
                    facing * 0.35 + Math.sin(timer * 0.004) * 0.15;
  const bodyTilt = state === 'run' ? facing * 0.08 :
                   state === 'jump' ? -facing * 0.08 :
                   state === 'fall' ? facing * 0.05 :
                   state === 'hurt' ? (Math.floor(timer / 80) % 2 === 0 ? 0.15 : -0.15) : 0;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(bodyTilt);
  ctx.translate(-cx, -cy);

  // Tail
  ctx.fillStyle = secondary;
  ctx.beginPath();
  const tx = facing > 0 ? x - 4 : x + w + 4;
  const ty = y + h * 0.65 + (state === 'run' ? -4 : 0);
  ctx.ellipse(tx, ty, 10, 14, tailAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff7ed';
  ctx.beginPath();
  ctx.ellipse(tx + facing * 3, ty + 3, 5, 8, tailAngle, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  if (state === 'run') {
    ctx.fillStyle = secondary;
    const legVisible1 = Math.sin(timer * 0.025) > 0;
    const legVisible2 = !legVisible1;
    if (legVisible1) {
      ctx.fillRect(x + 4, y + h - 6, 7, 8);
      ctx.fillRect(x + w - 11, y + h - 4, 7, 6);
    } else {
      ctx.fillRect(x + 4, y + h - 4, 7, 6);
      ctx.fillRect(x + w - 11, y + h - 6, 7, 8);
    }
  } else if (state === 'jump') {
    ctx.fillStyle = secondary;
    ctx.fillRect(x + 4, y + h - 10, 7, 8);
    ctx.fillRect(x + w - 11, y + h - 12, 7, 8);
  } else if (state === 'fall') {
    ctx.fillStyle = secondary;
    ctx.fillRect(x + 4, y + h - 2, 7, 8);
    ctx.fillRect(x + w - 11, y + h - 2, 7, 8);
  } else {
    ctx.fillStyle = secondary;
    ctx.fillRect(x + 5, y + h - 4, 7, 6);
    ctx.fillRect(x + w - 12, y + h - 4, 7, 6);
  }

  // Ears
  ctx.fillStyle = secondary;
  const earLeftX = facing > 0 ? x + 5 : x + w - 5;
  const earRightX = facing > 0 ? x + w - 5 : x + 5;
  ctx.beginPath();
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
  ctx.fillStyle = baseColor;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();

  // Chest
  ctx.fillStyle = '#fff7ed';
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.62, w * 0.35, h * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const eyeOpen = !(state === 'hurt' || (state === 'idle' && Math.floor(timer / 3000) % 5 === 4));
  ctx.fillStyle = '#1f2937';
  const eyeBaseX = facing > 0 ? x + 18 : x + w - 18;
  if (eyeOpen) {
    ctx.beginPath();
    ctx.arc(eyeBaseX, y + 11, 3, 0, Math.PI * 2);
    ctx.arc(eyeBaseX - (facing > 0 ? 7 : -7), y + 11, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(eyeBaseX + 1, y + 10, 1.2, 0, Math.PI * 2);
    ctx.arc(eyeBaseX - (facing > 0 ? 6 : -6), y + 10, 1.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(eyeBaseX - 4, y + 11);
    ctx.lineTo(eyeBaseX + 4, y + 11);
    ctx.moveTo(eyeBaseX - (facing > 0 ? 7 : -7) - 4, y + 11);
    ctx.lineTo(eyeBaseX - (facing > 0 ? 7 : -7) + 4, y + 11);
    ctx.stroke();
  }

  // Nose
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.arc(cx + facing * 7, y + 17, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.filter = 'none';
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
  if (!lastTime) lastTime = ts;
  const dt = ts - lastTime;
  lastTime = ts;

  // Hit stop: draw but don't update
  if (Effects && Effects.getHitStop() > 0) {
    Effects.update(dt);
    updateAnimState();
    draw();
    requestAnimationFrame(loop);
    return;
  }

  updateAnimState();
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

/* ========== OVERLAY ========== */
function showOverlay(title, desc, btnText) {
  overlayTitle.textContent = title;
  overlayDesc.innerHTML = desc;
  overlayBtn.textContent = btnText;
  overlayBtn.style.display = 'inline-block';
  overlay.classList.add('show');
}

function hideOverlay() {
  overlay.classList.remove('show');
  // Clear any injected inputs
  overlayDesc.innerHTML = '';
}

/* ========== PAUSE ========== */
function useHint() {
  if (!running || paused || !Shop || !Shop.hasItem('hintRemove')) return;
  // Find a wrong answer in the current active segment and remove it
  const wrongAnswers = runState.world.answers.filter(a => !a.correct);
  if (wrongAnswers.length === 0) return;
  const target = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
  const idx = runState.world.answers.indexOf(target);
  if (idx >= 0) {
    Shop.useItem('hintRemove');
    spawnParticles(target.x + 17, target.y + 17, '#94a3b8');
    Effects.spawnFloatingText(target.x + 17, target.y, 'Gợi ý!', '#94a3b8');
    runState.world.answers.splice(idx, 1);
    saveProgress();
  }
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    if (AudioManager) AudioManager.pauseBgm();
    showPauseOverlay();
  } else {
    if (AudioManager) AudioManager.unpauseBgm();
    hideOverlay();
  }
}

function showPauseOverlay() {
  overlayTitle.textContent = '⏸ Tạm dừng';
  overlayDesc.innerHTML = `
    <div class="jmp-pause-menu">
      <button class="btn btn--primary" id="resumeBtn">Tiếp tục</button>
      <button class="btn btn--ghost" id="pauseBgmBtn">${AudioManager && AudioManager.getSettings().bgm ? '🔊 Tắt nhạc' : '🔇 Bật nhạc'}</button>
      <button class="btn btn--ghost" id="pauseSfxBtn">${AudioManager && AudioManager.getSettings().sfx ? '🔊 Tắt SFX' : '🔇 Bật SFX'}</button>
      <button class="btn btn--ghost" id="pauseShopBtn">🛒 Cửa hàng</button>
      <button class="btn btn--ghost" id="pauseRestartBtn">🔄 Chơi lại màn</button>
      <button class="btn btn--ghost" id="pauseMenuBtn">← Thoát về menu</button>
    </div>
  `;
  overlayBtn.style.display = 'none';
  overlay.classList.add('show');

  document.getElementById('resumeBtn').onclick = () => { if (AudioManager) AudioManager.playClick(); togglePause(); };
  document.getElementById('pauseBgmBtn').onclick = function () {
    if (AudioManager) {
      AudioManager.playClick();
      AudioManager.setBgm(!AudioManager.getSettings().bgm);
    }
    showPauseOverlay();
  };
  document.getElementById('pauseSfxBtn').onclick = function () {
    if (AudioManager) {
      AudioManager.playClick();
      AudioManager.setSfx(!AudioManager.getSettings().sfx);
    }
    showPauseOverlay();
  };
  document.getElementById('pauseShopBtn').onclick = () => { if (AudioManager) AudioManager.playClick(); showShop(); };
  document.getElementById('pauseRestartBtn').onclick = () => {
    if (AudioManager) AudioManager.playClick();
    paused = false;
    restartFromCheckpoint();
  };
  document.getElementById('pauseMenuBtn').onclick = () => {
    if (AudioManager) AudioManager.playClick();
    location.href = '../index.html';
  };
}

/* ========== LEADERBOARD ========== */
function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem('mathjump_leaderboard') || '[]');
  } catch (e) { return []; }
}

function saveHighScore(name, score, segment) {
  const scores = getLeaderboard();
  scores.push({ name: name || 'Ẩn danh', score, segment, date: new Date().toISOString() });
  scores.sort((a, b) => b.score - a.score);
  try {
    localStorage.setItem('mathjump_leaderboard', JSON.stringify(scores.slice(0, 10)));
  } catch (e) { /* ignore */ }
}

function checkHighScore(score) {
  const scores = getLeaderboard();
  return scores.length < 10 || score > (scores[scores.length - 1].score || 0);
}

function showLeaderboard() {
  const scores = getLeaderboard();
  const rows = scores.length
    ? scores.map((s, i) => `<tr><td>#${i + 1}</td><td>${escapeHtml(s.name)}</td><td>${s.score}</td><td>${s.segment}</td></tr>`).join('')
    : '<tr><td colspan="4">Chưa có điểm nào</td></tr>';
  overlayTitle.textContent = '🏆 Bảng xếp hạng';
  overlayDesc.innerHTML = `
    <table class="jmp-leaderboard">
      <thead><tr><th>Hạng</th><th>Tên</th><th>Điểm</th><th>Đoạn</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <button class="btn btn--primary" id="shareScoreBtn">Chia sẻ điểm</button>
  `;
  overlayBtn.textContent = 'Đóng';
  overlayBtn.style.display = 'inline-block';
  overlayBtn.onclick = () => {
    if (AudioManager) AudioManager.playClick();
    hideOverlay();
    if (paused) { paused = false; if (AudioManager) AudioManager.unpauseBgm(); }
  };
  overlay.classList.add('show');

  document.getElementById('shareScoreBtn').onclick = () => {
    if (AudioManager) AudioManager.playClick();
    const text = `Tôi đạt ${score.toLocaleString('vi')} điểm trong Math Jump Adventure! 🦊\nBạn có thể vượt qua tôi không?\n👉 https://ktap23k.github.io/game/math-platformer/`;
    navigator.clipboard.writeText(text).then(() => alert('Đã sao chép nội dung chia sẻ!'));
  };
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

/* ========== SHOP ========== */
function showShop() {
  if (!Shop) return;
  const items = Shop.getItems();
  const skins = ['fox', 'blue', 'ninja', 'golden', 'rainbow'];
  const itemHtml = items.map(it => `
    <div class="jmp-shop__item">
      <div><strong>${it.name}</strong><br><small>${it.desc}</small></div>
      <button class="btn btn--primary jmp-shop__buy" data-item="${it.id}">${it.cost} 🪙</button>
    </div>
  `).join('');
  const skinHtml = skins.map(id => {
    const skin = Shop.getSkin(id);
    const unlocked = Shop.isUnlocked(id);
    const current = Shop.getCurrentSkin().id === id;
    return `
      <div class="jmp-shop__skin ${current ? 'jmp-shop__skin--current' : ''} ${!unlocked ? 'jmp-shop__skin--locked' : ''}" data-skin="${id}">
        <div class="jmp-shop__swatch" style="background:${skin.color}"></div>
        <div>${skin.name}</div>
        <small>${unlocked ? (current ? 'Đang dùng' : 'Nhấn để chọn') : getSkinUnlockText(id)}</small>
      </div>
    `;
  }).join('');

  overlayTitle.textContent = '🛒 Cửa hàng';
  overlayDesc.innerHTML = `
    <div class="jmp-shop__coins">🪙 <span>${Shop.getCoins()}</span> coins</div>
    <div class="jmp-shop__section"><h3>Vật phẩm</h3>${itemHtml}</div>
    <div class="jmp-shop__section"><h3>Skins</h3><div class="jmp-shop__skins">${skinHtml}</div></div>
  `;
  overlayBtn.textContent = 'Đóng';
  overlayBtn.style.display = 'inline-block';
  overlayBtn.onclick = () => {
    if (AudioManager) AudioManager.playClick();
    hideOverlay();
    if (paused) { paused = false; if (AudioManager) AudioManager.unpauseBgm(); }
  };
  overlay.classList.add('show');

  document.querySelectorAll('.jmp-shop__buy').forEach(btn => {
    btn.onclick = () => {
      if (AudioManager) AudioManager.playClick();
      const res = Shop.buy(btn.dataset.item);
      alert(res.ok ? res.msg : res.msg);
      showShop();
      updateStats();
    };
  });

  document.querySelectorAll('.jmp-shop__skin').forEach(el => {
    el.onclick = () => {
      if (AudioManager) AudioManager.playClick();
      const id = el.dataset.skin;
      if (Shop.isUnlocked(id)) {
        Shop.setSkin(id);
        player.skin = id;
        saveProgress();
        showShop();
      } else {
        alert('Skin này chưa được mở khóa!');
      }
    };
  });
}

function getSkinUnlockText(id) {
  const map = { fox: 'Mặc định', blue: 'Đạt đoạn 10', ninja: 'Đạt 5000 điểm', golden: '1000 coins', rainbow: 'Combo x10' };
  return map[id] || '';
}

/* ========== CONTROLS ========== */
document.getElementById('restartBtn').addEventListener('click', () => {
  if (AudioManager) AudioManager.playClick();
  restartFromCheckpoint();
});

function restartFromCheckpoint() {
  running = false;
  paused = false;
  const hasCheckpoint = runState.checkpoints.length > 0;
  showOverlay('Chơi lại', hasCheckpoint ? 'Bắt đầu lại từ checkpoint cuối.' : 'Bắt đầu lại từ đầu.', hasCheckpoint ? 'Thử lại từ checkpoint' : 'Thử lại');
  overlayBtn.onclick = () => {
    respawnAtCheckpoint();
    hideOverlay();
    running = true;
    if (AudioManager) AudioManager.startBgm();
  };
}

document.getElementById('resetProgressBtn').addEventListener('click', () => {
  if (AudioManager) AudioManager.playClick();
  if (confirm('Xóa toàn bộ tiến trình và điểm số?')) {
    localStorage.removeItem('mathjump_progress');
    localStorage.removeItem('mathjump_leaderboard');
    startRun(true);
    running = true;
    if (AudioManager) AudioManager.startBgm();
  }
});

document.getElementById('backBtn').addEventListener('click', () => {
  if (AudioManager) AudioManager.playClick();
  location.href = '../index.html';
});

document.getElementById('shopBtn').addEventListener('click', () => {
  if (AudioManager) AudioManager.playClick();
  if (running && !paused) { paused = true; if (AudioManager) AudioManager.pauseBgm(); }
  showShop();
});

document.getElementById('leaderboardBtn').addEventListener('click', () => {
  if (AudioManager) AudioManager.playClick();
  if (running && !paused) { paused = true; if (AudioManager) AudioManager.pauseBgm(); }
  showLeaderboard();
});

document.getElementById('audioBtn').addEventListener('click', () => {
  if (AudioManager) {
    AudioManager.playClick();
    const s = AudioManager.getSettings();
    if (s.bgm) AudioManager.setBgm(false);
    else AudioManager.setBgm(true);
    updateAudioButton();
  }
});

function updateAudioButton() {
  const btn = document.getElementById('audioBtn');
  if (!btn || !AudioManager) return;
  const s = AudioManager.getSettings();
  btn.textContent = s.bgm ? '🔊' : '🔇';
  btn.title = s.bgm ? 'Tắt nhạc' : 'Bật nhạc';
}

/* ========== BOOT ========== */
initBackground();
if (window.Shop) Shop.init();
loadProgress();
if (window.AudioManager) AudioManager.init();
startRun(false);
if (window.AudioManager) updateAudioButton();
showOverlay('🦊 Math Jump Adventure', 'Dùng phím mũi tên / WASD để di chuyển, Space để nhảy, nhấn 2 lần để bay cao hơn. Thu thập đáp án đúng để mở rộng đường đi và các vật phẩm đặc biệt! Nhấn Enter để thử lại, ESC/P để tạm dừng.', 'Bắt đầu');
overlayBtn.onclick = () => {
  if (AudioManager) {
    AudioManager.resume();
    AudioManager.playClick();
    AudioManager.startBgm();
  }
  hideOverlay();
  running = true;
  requestAnimationFrame(loop);
};

import { Player } from './entities/player.js';
import { Enemy, createEnemy } from './entities/enemy.js';
import { Bullet } from './entities/bullet.js';
import { Particle, Shockwave } from './entities/particle.js';
import { Powerup } from './entities/powerup.js';
import { AudioManager } from './audio.js';
import { InputManager } from './input.js';
import { Renderer } from './renderer.js';
import { LevelManager } from './levels/manager.js';
import { levels } from './levels/index.js';
import { STORAGE_KEYS, PLAYER, COLORS } from './config.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new Renderer(this.canvas);
    this.audio = new AudioManager(
      localStorage.getItem(STORAGE_KEYS.sound) !== 'off'
    );
    this.input = new InputManager(this.canvas);

    this.state = 'start';
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem(STORAGE_KEYS.highscore) || '0', 10);
    this.lastTime = 0;

    this.player = null;
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.powerups = [];
    this.floatingTexts = [];
    this.levelManager = null;

    this.els = {
      score: document.getElementById('scoreDisplay'),
      highScore: document.getElementById('highScoreDisplay'),
      level: document.getElementById('levelDisplay'),
      healthFill: document.getElementById('healthFill'),
      finalScore: document.getElementById('finalScore'),
      finalHighScore: document.getElementById('finalHighScore'),
      gameOverReason: document.getElementById('gameOverReason'),
      soundToggle: document.getElementById('soundToggle'),
      pauseToggle: document.getElementById('pauseToggle'),
      hud: document.getElementById('hud'),
      screens: {
        start: document.getElementById('startScreen'),
        gameOver: document.getElementById('gameOverScreen'),
        pause: document.getElementById('pauseScreen'),
      },
      levelAnnounce: document.getElementById('levelAnnounce'),
      levelAnnounceLabel: document.getElementById('levelAnnounceLabel'),
      levelAnnounceName: document.getElementById('levelAnnounceName'),
    };

    this.bindUI();
    this.updateHUD();
    this.els.soundToggle.textContent = this.audio.enabled ? '🔊' : '🔇';
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);

    if (location.search.includes('autostart=1')) {
      setTimeout(() => this.startGame(), 400);
    }
  }

  bindUI() {
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
    document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
    this.els.soundToggle.addEventListener('click', () => this.toggleSound());
    this.els.pauseToggle.addEventListener('click', () => {
      if (this.state === 'playing') this.pauseGame();
      else if (this.state === 'pause') this.resumeGame();
    });

    window.addEventListener('resize', () => this.renderer.resize());

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.state === 'start') this.startGame();
        else if (this.state === 'gameOver') this.startGame();
        else if (this.state === 'pause') this.resumeGame();
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (this.state === 'playing') this.pauseGame();
        else if (this.state === 'pause') this.resumeGame();
      }
    });
  }

  setScreen(name) {
    this.state = name;
    Object.values(this.els.screens).forEach((s) => s.classList.add('hidden'));
    if (name !== 'playing') {
      this.els.screens[name]?.classList.remove('hidden');
    }

    this.els.pauseToggle.classList.toggle('hidden', name !== 'playing');

    if (name === 'start') {
      this.els.hud.style.visibility = 'hidden';
      this.els.hud.style.opacity = '0';
    } else {
      this.els.hud.style.visibility = 'visible';
      this.els.hud.style.opacity = '1';
    }
  }

  startGame() {
    this.audio.resume();
    this.score = 0;
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.powerups = [];
    this.floatingTexts = [];

    this.player = new Player(this.renderer.width / 2, this.renderer.height - 110);
    this.player.maxSpeed = this.renderer.width < 640 ? 380 : 520;

    this.levelManager = new LevelManager(levels);
    this.levelManager.onLevelChange = (level) => this.onLevelChange(level);

    this.setScreen('playing');
    this.updateHUD();
  }

  onLevelChange(level) {
    this.els.levelAnnounceLabel.textContent = `Cấp độ ${this.levelManager.levelNumber}`;
    this.els.levelAnnounceName.textContent = level.name;
    this.els.levelAnnounce.classList.remove('active');
    void this.els.levelAnnounce.offsetWidth; // reflow
    this.els.levelAnnounce.classList.add('active');
    this.audio.levelUp();
  }

  pauseGame() {
    if (this.state !== 'playing') return;
    this.setScreen('pause');
  }

  resumeGame() {
    if (this.state !== 'pause') return;
    this.setScreen('playing');
    this.lastTime = performance.now();
  }

  gameOver(reason) {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem(STORAGE_KEYS.highscore, this.highScore);
    }
    this.els.finalScore.textContent = this.score;
    this.els.finalHighScore.textContent = this.highScore;
    this.els.gameOverReason.textContent = reason;
    this.setScreen('gameOver');
  }

  toggleSound() {
    const enabled = !this.audio.enabled;
    this.audio.setEnabled(enabled);
    localStorage.setItem(STORAGE_KEYS.sound, enabled ? 'on' : 'off');
    this.els.soundToggle.textContent = enabled ? '🔊' : '🔇';
  }

  spawnEnemy(type, x, y, multiplier) {
    this.enemies.push(createEnemy(type, x, y, multiplier));
  }

  spawnPowerup(x, y) {
    if (Math.random() > 0.14) return;
    const kind = Math.random() > 0.5 ? 'health' : 'rapid';
    this.powerups.push(new Powerup(x, y, kind));
  }

  createExplosion(x, y, color, count = 16, sizeScale = 1) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = 60 + Math.random() * 180;
      this.particles.push(
        new Particle(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          0.5 + Math.random() * 0.5,
          color,
          2 + Math.random() * 3
        )
      );
    }
    this.particles.push(new Shockwave(x, y, color, 40 * sizeScale, 0.35));
  }

  addFloatingText(x, y, text, color) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.textContent = text;
    el.style.color = color;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  updateHUD() {
    this.els.score.textContent = this.score;
    this.els.highScore.textContent = this.highScore;
    this.els.level.textContent = this.levelManager ? this.levelManager.levelNumber : 1;
    this.els.healthFill.style.width =
      Math.max(0, (this.player ? this.player.hp / this.player.maxHp : 1) * 100) + '%';
  }

  checkCollisions() {
    // Bullet vs Enemy
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const b = this.bullets[j];
        const dx = b.x - e.x;
        const dy = b.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < e.size + 6) {
          e.hp--;
          this.createExplosion(b.x, b.y, e.color, 5);
          this.bullets.splice(j, 1);
          if (e.hp <= 0) {
            this.score += e.score;
            this.createExplosion(e.x, e.y, e.color, 22, 1.2);
            this.spawnPowerup(e.x, e.y);
            this.audio.explosion(e.type === 2 ? 1.4 : 1);
            this.enemies.splice(i, 1);
          } else {
            this.audio.hit();
          }
          break;
        }
      }
    }

    // Enemy vs Player
    if (this.player && this.player.invulnerable <= 0) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        const dx = this.player.x - e.x;
        const dy = this.player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < e.size + this.player.width / 2.4) {
          if (this.player.takeDamage(PLAYER.collisionDamage)) {
            this.renderer.addShake(14);
            this.createExplosion(e.x, e.y, e.color, 18);
            this.audio.explosion(1.2);
            this.enemies.splice(i, 1);
          }
        }
      }
    }

    // Powerup vs Player
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      const dx = this.player.x - p.x;
      const dy = this.player.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < p.size + this.player.width / 2.4) {
        if (p.kind === 'health') {
          this.player.heal(30);
          this.addFloatingText(p.x, p.y, '+HP', COLORS.health);
        } else {
          this.player.activateRapidFire();
          this.addFloatingText(p.x, p.y, 'RAPID', COLORS.rapid);
        }
        this.audio.powerup();
        this.createExplosion(p.x, p.y, p.kind === 'health' ? COLORS.health : COLORS.rapid, 10);
        this.powerups.splice(i, 1);
      }
    }

    // Cleanup off-screen enemies
    this.enemies = this.enemies.filter((e) => !e.isOffScreen(this.renderer.height));
  }

  update(dt) {
    if (this.state === 'playing') {
      // Player
      this.player.update(dt, this.input, this.renderer);

      // Shooting
      if (this.input.wantsShoot() && this.player.canShoot()) {
        this.bullets.push(new Bullet(this.player.x - 10, this.player.y - 24));
        this.bullets.push(new Bullet(this.player.x + 10, this.player.y - 24));
        this.player.shoot();
        this.audio.shoot(this.levelManager ? this.levelManager.levelNumber : 1);
      }

      // Level manager spawns
      this.levelManager.update(dt, this.renderer, (type, x, y, mult) => {
        this.spawnEnemy(type, x, y, mult);
      });

      if (this.levelManager.completed) {
        this.levelManager.nextLevel();
      }

      // Entities
      this.bullets.forEach((b) => b.update(dt));
      this.bullets = this.bullets.filter((b) => !b.isOffScreen(this.renderer.height));

      this.enemies.forEach((e) => e.update(dt, this.renderer, this.player.x));

      this.powerups.forEach((p) => p.update(dt));
      this.powerups = this.powerups.filter((p) => !p.isDead(this.renderer.height));

      this.particles.forEach((p) => p.update(dt));
      this.particles = this.particles.filter((p) => !p.isDead());

      this.renderer.updateStars(dt, this.levelManager.currentLevel.theme.starSpeed);

      this.checkCollisions();

      if (this.player.hp <= 0) {
        this.createExplosion(this.player.x, this.player.y, COLORS.player, 45, 1.8);
        this.audio.explosion(1.8);
        this.gameOver('Phi thuyền đã bị phá hủy bởi đại quân đa giác.');
      }

      this.renderer.decayShake(dt);
      this.updateHUD();
    } else {
      // Background still animates in menus
      this.renderer.updateStars(dt, 15);
    }
  }

  draw() {
    const ctx = this.renderer.ctx;
    this.renderer.clear();

    const theme = this.levelManager?.currentLevel?.theme || { nebula: ['#0c0c1a', '#05050b'] };
    this.renderer.drawBackground(theme);
    this.renderer.applyShake();
    this.renderer.drawStars();

    if (this.state === 'playing' || this.state === 'pause') {
      this.bullets.forEach((b) => b.draw(ctx));
      this.powerups.forEach((p) => p.draw(ctx));
      this.enemies.forEach((e) => e.draw(ctx));
      this.particles.forEach((p) => p.draw(ctx));
      if (this.player) this.player.draw(ctx, this.input.wantsShoot());
    }

    this.renderer.restoreShake();
  }

  loop(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

new Game();

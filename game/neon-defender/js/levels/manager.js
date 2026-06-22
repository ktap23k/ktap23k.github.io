import { ENEMY_TYPES } from '../config.js';

export class LevelManager {
  constructor(levels) {
    this.levels = levels;
    this.currentIndex = -1;
    this.current = null;
    this.waveIndex = 0;
    this.timer = 0;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.completed = false;
    this.completionTimer = 0;
    this.completionTimer = 0;
    this.onLevelChange = null;
    this.nextLevel();
  }

  nextLevel() {
    this.currentIndex++;
    if (this.currentIndex >= this.levels.length) {
      // Loop last level with ramping difficulty
      this.currentIndex = this.levels.length - 1;
      const loop = this.loopCount || 0;
      this.current = {
        ...this.levels[this.currentIndex],
        difficultyMultiplier: this.levels[this.currentIndex].difficultyMultiplier + loop * 0.3,
        name: this.levels[this.currentIndex].name + ' +' + (loop + 1),
      };
      this.loopCount = loop + 1;
    } else {
      this.current = this.levels[this.currentIndex];
      this.loopCount = 0;
    }

    this.waveIndex = 0;
    this.timer = 0;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.completed = false;

    if (this.onLevelChange) {
      this.onLevelChange(this.current);
    }
  }

  get currentLevel() {
    return this.current;
  }

  get levelNumber() {
    return this.currentIndex + 1 + (this.loopCount || 0) * this.levels.length;
  }

  _resolveType(type) {
    if (type === 'mixed') {
      const r = Math.random();
      if (r < 0.4) return ENEMY_TYPES.DRONE;
      if (r < 0.75) return ENEMY_TYPES.INTERCEPTOR;
      return ENEMY_TYPES.TANK;
    }
    if (type === 'drone') return ENEMY_TYPES.DRONE;
    if (type === 'interceptor') return ENEMY_TYPES.INTERCEPTOR;
    if (type === 'tank') return ENEMY_TYPES.TANK;
    return ENEMY_TYPES.DRONE;
  }

  _spawnPositions(pattern, count, bounds) {
    const positions = [];
    const margin = 60;
    const usableW = Math.max(20, bounds.width - margin * 2);

    if (pattern === 'line') {
      const gap = usableW / (count + 1);
      for (let i = 0; i < count; i++) {
        positions.push(margin + gap * (i + 1));
      }
    } else if (pattern === 'vshape') {
      const center = bounds.width / 2;
      for (let i = 0; i < count; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const offset = Math.ceil((i + 1) / 2) * (usableW / (count + 2));
        positions.push(center + side * offset);
      }
    } else {
      // random
      for (let i = 0; i < count; i++) {
        positions.push(margin + Math.random() * usableW);
      }
    }
    return positions;
  }

  update(dt, bounds, spawnCallback) {
    if (this.completed) return;

    this.timer += dt;

    // Mark level complete after duration; main will advance.
    if (this.timer >= this.current.duration && !this.completed) {
      this.completed = true;
    }
    if (this.completed) return;

    // Queue waves when their delay is reached
    while (this.waveIndex < this.current.waves.length) {
      const wave = this.current.waves[this.waveIndex];
      if (this.timer >= wave.delay) {
        const positions = this._spawnPositions(wave.pattern, wave.count, bounds);
        for (let i = 0; i < wave.count; i++) {
          this.spawnQueue.push({
            type: this._resolveType(wave.type),
            x: positions[i],
            delay: i * wave.interval,
          });
        }
        this.waveIndex++;
      } else {
        break;
      }
    }

    // Spawn queued enemies
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.spawnQueue.length > 0) {
      const next = this.spawnQueue.shift();
      spawnCallback(next.type, next.x, -60, this.current.difficultyMultiplier);
      this.spawnTimer = this.current.spawnInterval;
    }

    // Fallback ambient spawn to keep pressure
    if (this.spawnQueue.length === 0 && this.waveIndex >= this.current.waves.length) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const typeRoll = Math.random();
        let type = ENEMY_TYPES.DRONE;
        if (typeRoll > 0.7) type = ENEMY_TYPES.INTERCEPTOR;
        if (typeRoll > 0.9) type = ENEMY_TYPES.TANK;
        spawnCallback(
          type,
          60 + Math.random() * (bounds.width - 120),
          -60,
          this.current.difficultyMultiplier
        );
        this.spawnTimer = Math.max(0.35, this.current.spawnInterval - 0.2);
      }
    }
  }

  markComplete() {
    this.completed = true;
  }
}

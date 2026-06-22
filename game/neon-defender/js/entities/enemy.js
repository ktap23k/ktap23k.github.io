import { ENEMY_TYPES, ENEMY_SPECS } from '../config.js';

export class Enemy {
  constructor(type, x, y, levelMultiplier = 1) {
    const spec = ENEMY_SPECS[type];
    this.type = type;
    this.x = x;
    this.y = y;
    this.size = spec.baseSize + Math.random() * spec.sizeVar;
    this.speed = (spec.baseSpeed + Math.random() * spec.speedVar) * levelMultiplier;
    this.hp = Math.floor(spec.baseHp + (levelMultiplier - 1) * 2);
    this.maxHp = this.hp;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = spec.spin * (Math.random() > 0.5 ? 1 : -1);
    this.color = spec.color;
    this.sides = spec.sides;
    this.score = spec.score;
    this.spawnScale = 0;
    this.maxSpeedX = type === ENEMY_TYPES.INTERCEPTOR ? 60 : 0;
    this.vx = 0;
    this.pulse = Math.random() * Math.PI * 2;
  }

  update(dt, bounds, playerX) {
    this.angle += this.spin * dt;
    this.pulse += dt * 3;

    if (this.spawnScale < 1) {
      this.spawnScale += dt * 4;
      if (this.spawnScale > 1) this.spawnScale = 1;
    }

    this.y += this.speed * dt;

    if (this.type === ENEMY_TYPES.INTERCEPTOR) {
      // Slight homing on X
      const dx = playerX - this.x;
      this.vx += dx * 0.02 * dt;
      this.vx = Math.max(-this.maxSpeedX, Math.min(this.maxSpeedX, this.vx));
      this.x += this.vx * dt;
    }

    this.x = Math.max(this.size, Math.min(bounds.width - this.size, this.x));
  }

  isOffScreen(height) {
    return this.y > height + this.size + 20;
  }

  takeDamage(amount) {
    this.hp -= amount;
    return this.hp <= 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.spawnScale, this.spawnScale);
    ctx.rotate(this.angle);

    const pulseScale = 1 + Math.sin(this.pulse) * 0.04;
    ctx.scale(pulseScale, pulseScale);

    // Outer glow ring for tank
    if (this.type === ENEMY_TYPES.TANK) {
      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, this.size + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Body
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = this.color + '22';

    if (this.type === ENEMY_TYPES.INTERCEPTOR) {
      // Arrow shape
      ctx.beginPath();
      ctx.moveTo(0, this.size);
      ctx.lineTo(this.size * 0.9, -this.size * 0.7);
      ctx.lineTo(0, -this.size * 0.4);
      ctx.lineTo(-this.size * 0.9, -this.size * 0.7);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    } else {
      ctx.beginPath();
      for (let i = 0; i < this.sides; i++) {
        const a = (i / this.sides) * Math.PI * 2;
        const px = Math.cos(a) * this.size;
        const py = Math.sin(a) * this.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
    ctx.restore();

    // Core / eye
    ctx.save();
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // HP indicator
    if (this.maxHp > 1) {
      ctx.save();
      ctx.rotate(-this.angle);
      ctx.fillStyle = '#fff';
      ctx.font = '700 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      ctx.fillText(this.hp, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }
}

export function createEnemy(type, x, y, levelMultiplier) {
  return new Enemy(type, x, y, levelMultiplier);
}

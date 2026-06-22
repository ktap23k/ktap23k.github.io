import { COLORS, SIZES } from '../config.js';

export class Bullet {
  constructor(x, y, isPlayer = true, speed = -720) {
    this.x = x;
    this.y = y;
    this.vy = speed;
    this.color = COLORS.bullet;
    this.width = SIZES.bullet.width;
    this.height = SIZES.bullet.height;
    this.isPlayer = isPlayer;
    this.trail = [];
    this.maxTrail = 6;
  }

  update(dt) {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.shift();
    this.y += this.vy * dt;
  }

  isOffScreen(height) {
    return this.y < -30 || this.y > height + 30;
  }

  draw(ctx) {
    // Trail
    ctx.save();
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const alpha = (i / this.trail.length) * 0.5;
      const size = this.width * (i / this.trail.length);
      ctx.beginPath();
      ctx.arc(t.x, t.y, Math.max(1, size), 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }
    ctx.restore();

    // Head
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, 2);
    ctx.fill();

    // Core
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.roundRect(this.x - this.width / 4, this.y - this.height / 3, this.width / 2, this.height / 1.5, 1);
    ctx.fill();
    ctx.restore();
  }
}

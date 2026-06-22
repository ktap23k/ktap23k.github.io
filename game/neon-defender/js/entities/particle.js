export class Particle {
  constructor(x, y, vx, vy, life, color, size, glow = true) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.baseSize = size;
    this.glow = glow;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= Math.pow(0.92, dt);
    this.vy *= Math.pow(0.92, dt);
    this.life -= dt;
  }

  isDead() {
    return this.life <= 0;
  }

  draw(ctx) {
    const t = Math.max(0, this.life / this.maxLife);
    const size = this.baseSize * t;
    ctx.save();
    ctx.globalAlpha = t;
    if (this.glow) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
    }
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Shockwave {
  constructor(x, y, color, maxRadius = 40, duration = 0.4) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.maxRadius = maxRadius;
    this.life = duration;
    this.maxLife = duration;
  }

  update(dt) {
    this.life -= dt;
  }

  isDead() {
    return this.life <= 0;
  }

  draw(ctx) {
    const t = Math.max(0, this.life / this.maxLife);
    const r = this.maxRadius * (1 - t);
    ctx.save();
    ctx.globalAlpha = t * 0.8;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2 + t * 2;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

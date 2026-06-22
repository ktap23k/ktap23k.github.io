import { COLORS, SIZES } from '../config.js';

export class Powerup {
  constructor(x, y, kind) {
    this.x = x;
    this.y = y;
    this.kind = kind; // 'health' | 'rapid'
    this.size = SIZES.powerup;
    this.vy = 60;
    this.life = 10;
    this.angle = 0;
    this.pulse = 0;
  }

  update(dt) {
    this.y += this.vy * dt;
    this.life -= dt;
    this.angle += dt * 2;
    this.pulse += dt * 4;
  }

  isDead(height) {
    return this.life <= 0 || this.y > height + 30;
  }

  draw(ctx) {
    const color = this.kind === 'health' ? COLORS.health : COLORS.rapid;
    const ringScale = 1 + Math.sin(this.pulse) * 0.12;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Outer rotating ring
    ctx.save();
    ctx.scale(ringScale, ringScale);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const r = this.size + 6;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Orb body
    ctx.save();
    ctx.fillStyle = color + '28';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Icon
    ctx.save();
    ctx.rotate(-this.angle);
    ctx.fillStyle = '#fff';
    ctx.font = '700 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText(this.kind === 'health' ? '+' : '»', 0, 1);
    ctx.restore();

    ctx.restore();
  }
}

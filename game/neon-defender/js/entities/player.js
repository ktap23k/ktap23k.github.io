import { COLORS, PLAYER, SIZES } from '../config.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = SIZES.player.width;
    this.height = SIZES.player.height;
    this.hp = PLAYER.maxHp;
    this.maxHp = PLAYER.maxHp;
    this.speed = 0;
    this.maxSpeed = 520;
    this.accel = 2400;
    this.friction = 0.06;
    this.shootTimer = 0;
    this.shootInterval = PLAYER.baseShootInterval;
    this.invulnerable = 0;
    this.tilt = 0;
    this.idlePhase = Math.random() * Math.PI * 2;
    this.rapidTimer = 0;
  }

  update(dt, input, bounds) {
    this.idlePhase += dt * 2;

    const dir = input.dirX();
    if (dir !== 0) {
      this.speed += dir * this.accel * dt;
    } else {
      this.speed *= Math.pow(this.friction, dt);
    }

    if (input.targetX !== null) {
      const dx = input.targetX - this.x;
      this.speed = dx * 8;
      if (Math.abs(dx) < 2) input.targetX = null;
    }

    this.speed = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.speed));
    this.x += this.speed * dt;
    this.x = Math.max(this.width / 2, Math.min(bounds.width - this.width / 2, this.x));

    // Banking tilt based on speed
    const targetTilt = (this.speed / this.maxSpeed) * 0.35;
    this.tilt += (targetTilt - this.tilt) * Math.min(1, dt * 8);

    if (this.invulnerable > 0) this.invulnerable -= dt;
    if (this.rapidTimer > 0) {
      this.rapidTimer -= dt;
      if (this.rapidTimer <= 0) {
        this.shootInterval = PLAYER.baseShootInterval;
      }
    }

    this.shootTimer -= dt;
  }

  canShoot() {
    return this.shootTimer <= 0;
  }

  shoot() {
    this.shootTimer = this.shootInterval;
  }

  activateRapidFire() {
    this.shootInterval = PLAYER.rapidShootInterval;
    this.rapidTimer = PLAYER.rapidDuration / 1000;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  takeDamage(amount) {
    if (this.invulnerable > 0) return false;
    this.hp -= amount;
    this.invulnerable = PLAYER.invulnerableTime;
    return true;
  }

  draw(ctx, shooting) {
    ctx.save();
    ctx.translate(this.x, this.y + Math.sin(this.idlePhase) * 2);
    ctx.rotate(this.tilt);

    if (this.invulnerable > 0 && Math.floor(this.invulnerable * 10) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // Engine glow
    const engineColor = this.rapidTimer > 0 ? COLORS.rapid : COLORS.playerEngine;
    const flicker = 0.8 + Math.random() * 0.4;
    ctx.save();
    ctx.shadowColor = engineColor;
    ctx.shadowBlur = 22 * flicker;
    ctx.fillStyle = engineColor;
    ctx.beginPath();
    ctx.ellipse(-10, this.height / 2 - 2, 5, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(10, this.height / 2 - 2, 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Thruster flame when shooting/moving fast
    if (shooting || Math.abs(this.speed) > 100) {
      const flameLen = 22 + Math.random() * 14;
      ctx.save();
      ctx.shadowColor = engineColor;
      ctx.shadowBlur = 18;
      ctx.fillStyle = engineColor;
      ctx.beginPath();
      ctx.moveTo(-8, this.height / 2 - 4);
      ctx.lineTo(0, this.height / 2 + flameLen);
      ctx.lineTo(8, this.height / 2 - 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Wings
    ctx.save();
    ctx.shadowColor = COLORS.player;
    ctx.shadowBlur = 20;
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2 + 4, this.height / 2 - 4);
    ctx.lineTo(0, this.height / 2 - 16);
    ctx.lineTo(-this.width / 2 - 4, this.height / 2 - 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Inner core
    ctx.save();
    ctx.shadowColor = COLORS.player;
    ctx.shadowBlur = 14;
    ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2 + 10);
    ctx.lineTo(this.width / 2 - 4, this.height / 2 - 10);
    ctx.lineTo(0, this.height / 2 - 18);
    ctx.lineTo(-this.width / 2 + 4, this.height / 2 - 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Cockpit
    ctx.save();
    ctx.shadowColor = COLORS.playerCore;
    ctx.shadowBlur = 12;
    ctx.fillStyle = COLORS.playerCore;
    ctx.beginPath();
    ctx.ellipse(0, -6, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}

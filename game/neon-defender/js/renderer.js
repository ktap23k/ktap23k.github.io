export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;
    this.stars = [];
    this.shake = 0;
    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.initStars();
  }

  initStars() {
    this.stars = [];
    const density = (this.width * this.height) / 5000;
    for (let i = 0; i < density; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 2 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  updateStars(dt, speed = 40) {
    for (const s of this.stars) {
      s.y += s.z * speed * dt;
      s.twinkle += dt * 2;
      if (s.y > this.height) {
        s.y = 0;
        s.x = Math.random() * this.width;
      }
    }
  }

  drawBackground(theme) {
    const g = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.8
    );
    const c1 = theme?.nebula?.[0] || '#0c0c1a';
    const c2 = theme?.nebula?.[1] || '#05050b';
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawStars() {
    for (const s of this.stars) {
      const tw = 0.7 + Math.sin(s.twinkle) * 0.3;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.z * 0.8, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255,255,255,${s.alpha * tw})`;
      this.ctx.fill();
    }
  }

  applyShake() {
    if (this.shake > 0.3) {
      const sx = (Math.random() - 0.5) * this.shake;
      const sy = (Math.random() - 0.5) * this.shake;
      this.ctx.save();
      this.ctx.translate(sx, sy);
    }
  }

  decayShake(dt) {
    if (this.shake > 0) this.shake *= Math.pow(0.05, dt);
  }

  addShake(amount) {
    this.shake = Math.max(this.shake, amount);
  }

  restoreShake() {
    if (this.shake > 0.3) this.ctx.restore();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawGlowCircle(x, y, radius, color, alpha = 1) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = radius * 1.5;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawGlowPolygon(x, y, radius, sides, angle, color, alpha = 1, fillAlpha = 0.15) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const px = Math.cos(a) * radius;
      const py = Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.globalAlpha = fillAlpha;
    ctx.fill();
    ctx.restore();
  }
}

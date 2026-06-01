/**
 * antigravity.js — Particle background effect inspired by Google Antigravity
 * Particles gently float and are repelled by the mouse cursor.
 * The canvas is rendered as a subtle overlay behind UI chrome but above page content.
 */
(function () {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'ag-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  /* Intentionally no z-index so it paints as a fixed overlay below
     explicitly z-indexed UI (header z:100, progress z:200, back-to-top z:50)
     but above normal document flow. */
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  let width, height;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

  const PARTICLE_COUNT = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 15000));
  const CONNECT_DISTANCE = 90;
  const MOUSE_RADIUS = 130;
  const MOUSE_FORCE = 3.5;
  const FRICTION = 0.96;
  const BASE_SPEED = 0.35;

  let mouse = { x: -9999, y: -9999, active: false };

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => { mouse.active = false; });

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(randomY) {
      this.x = Math.random() * width;
      this.y = randomY ? Math.random() * height : height + 10;
      this.vx = (Math.random() - 0.5) * BASE_SPEED;
      this.vy = -(Math.random() * 0.5 + 0.15);
      this.size = Math.random() * 1.8 + 0.8;
      this.mass = this.size;
    }

    update() {
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_FORCE;
          this.vx += (dx / dist) * force / this.mass;
          this.vy += (dy / dist) * force / this.mass;
        }
      }

      this.vx *= FRICTION;
      this.vy *= FRICTION;
      this.vy -= 0.008;

      this.x += this.vx;
      this.y += this.vy;

      if (this.y < -10) this.reset(false);
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
    }

    draw(opacity) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = opacity;
      ctx.fill();
    }
  }

  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

  function drawLines() {
    const dark = isDark();
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DISTANCE) {
          const alpha = (1 - dist / CONNECT_DISTANCE) * 0.12;
          ctx.strokeStyle = dark
            ? `rgba(255,255,255,${alpha})`
            : `rgba(0,0,0,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    const dark = isDark();
    ctx.clearRect(0, 0, width, height);

    const fill = dark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)';
    particles.forEach(p => {
      p.update();
      p.draw(fill);
    });

    drawLines();
    requestAnimationFrame(animate);
  }

  animate();
})();

/* =========================================
   MATH JUMP ADVENTURE — VISUAL EFFECTS
   =========================================
   Screen shake, hit stop, screen flash,
   floating text, combo system.
   ========================================= */

const Effects = (function () {
  const screenShake = { intensity: 0, duration: 0 };
  let hitStopTimer = 0;
  const screenFlash = { color: '', alpha: 0 };
  const floatingTexts = [];
  const combo = { count: 0, timer: 0, max: 0 };
  const COMBO_WINDOW = 10000;
  const MAX_COMBO_MULTIPLIER = 5;

  function update(dt) {
    // Screen shake decay
    if (screenShake.duration > 0) {
      screenShake.duration -= dt;
      screenShake.intensity *= 0.9;
      if (screenShake.duration <= 0) {
        screenShake.duration = 0;
        screenShake.intensity = 0;
      }
    }

    // Hit stop countdown
    if (hitStopTimer > 0) {
      hitStopTimer -= dt;
      if (hitStopTimer <= 0) hitStopTimer = 0;
    }

    // Flash fade
    if (screenFlash.alpha > 0) {
      screenFlash.alpha *= 0.9;
      if (screenFlash.alpha < 0.005) screenFlash.alpha = 0;
    }

    // Floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= 0.02;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }

    // Combo timer
    if (combo.timer > 0) {
      combo.timer -= dt;
      if (combo.timer <= 0) {
        combo.timer = 0;
        combo.count = 0;
      }
    }
  }

  function applyShake(ctx) {
    if (screenShake.duration > 0 && screenShake.intensity > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake.intensity;
      const shakeY = (Math.random() - 0.5) * screenShake.intensity;
      ctx.translate(shakeX, shakeY);
    }
  }

  function applyFlash(ctx, width, height) {
    if (screenFlash.alpha > 0) {
      ctx.fillStyle = screenFlash.color;
      ctx.globalAlpha = screenFlash.alpha;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }
  }

  function drawFloatingTexts(ctx) {
    floatingTexts.forEach(ft => {
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.globalAlpha = 1;
  }

  function triggerScreenShake(intensity, duration) {
    screenShake.intensity = intensity;
    screenShake.duration = duration;
  }

  function triggerHitStop(ms) {
    hitStopTimer = ms;
  }

  function getHitStop() {
    return hitStopTimer;
  }

  function triggerScreenFlash(color, alpha) {
    screenFlash.color = color;
    screenFlash.alpha = alpha;
  }

  function spawnFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: 1, vy: -2 });
  }

  function recordCorrect(x, y, segmentIndex) {
    combo.count++;
    combo.timer = COMBO_WINDOW;
    if (combo.count > combo.max) combo.max = combo.count;

    const multiplier = Math.min(combo.count, MAX_COMBO_MULTIPLIER);
    const base = 100 + segmentIndex * 25;
    const gained = base * multiplier;

    triggerScreenShake(3, 150);
    triggerScreenFlash('#22c55e', 0.3);
    triggerHitStop(100);
    spawnFloatingText(x, y, '+' + gained, '#22c55e');

    if (combo.count >= 2) {
      const comboText = combo.count >= 5 ? `${combo.count} COMBO! 🔥` : `x${combo.count} COMBO!`;
      spawnFloatingText(x, y - 28, comboText, combo.count >= 5 ? '#ef4444' : '#f59e0b');
    }

    return gained;
  }

  function recordWrong(x, y) {
    combo.count = 0;
    combo.timer = 0;
    triggerScreenShake(5, 200);
    triggerScreenFlash('#ef4444', 0.4);
    spawnFloatingText(x, y, 'Sai!', '#ef4444');
  }

  function getCombo() {
    return { count: combo.count, timer: combo.timer, max: combo.max };
  }

  function resetCombo() {
    combo.count = 0;
    combo.timer = 0;
  }

  function loadCombo(saved) {
    if (saved && typeof saved.count === 'number') combo.count = saved.count;
    if (saved && typeof saved.timer === 'number') combo.timer = saved.timer;
    if (saved && typeof saved.max === 'number') combo.max = saved.max;
  }

  return {
    update,
    applyShake,
    applyFlash,
    drawFloatingTexts,
    triggerScreenShake,
    triggerHitStop,
    getHitStop,
    triggerScreenFlash,
    spawnFloatingText,
    recordCorrect,
    recordWrong,
    getCombo,
    resetCombo,
    loadCombo
  };
})();

if (typeof window !== 'undefined') {
  window.Effects = Effects;
}

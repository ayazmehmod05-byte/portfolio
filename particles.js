(function () {
  try {
  const config = {
    particleCount: 110,
    connectDistance: 140,
    lineAlpha: 0.12,
    particleAlpha: 0.85,
    particleSize: 2.1,
    speed: 0.35,
    mouseInfluence: 0.2,
    lineColor: '#34d6c6',
    particleColor: '#a9f8ff',
    backgroundColor: '#05070f'
  };

  const mount = document.getElementById('particles-bg');
  if (!mount) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('particles-bg: Unable to get 2D canvas context.');
    return;
  }
  mount.appendChild(canvas);

  let width = 0;
  let height = 0;
  let rafId = null;
  let lastTime = 0;
  const mouse = { x: -9999, y: -9999 };
  const particles = [];
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    width = mount.clientWidth;
    height = mount.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticles() {
    particles.length = 0;
    for (let i = 0; i < config.particleCount; i += 1) {
      particles.push({
        x: random(0, width),
        y: random(0, height),
        vx: random(-0.2, 0.2),
        vy: random(-0.2, 0.2),
        radius: random(config.particleSize * 0.7, config.particleSize * 1.8),
        phase: random(0, Math.PI * 2),
        shift: random(0.2, 0.7)
      });
    }
  }

  function updateMousePos(event) {
    const rect = mount.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  }

  function clearMouse() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  function draw(time) {
    rafId = requestAnimationFrame(draw);
    const delta = Math.min((time - lastTime) / 16.67, 2);
    lastTime = time;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const mouseActive = mouse.x >= 0 && mouse.y >= 0;
    const influenceRadius = 180;

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      p.phase += 0.02 * delta;
      p.x += p.vx * config.speed * delta + Math.sin(p.phase * 0.7) * 0.12;
      p.y += p.vy * config.speed * delta + Math.cos(p.phase * 0.9) * 0.12;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      if (mouseActive) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < influenceRadius) {
          const force = (1 - dist / influenceRadius) * config.mouseInfluence;
          p.x += dx * force * delta * 0.03;
          p.y += dy * force * delta * 0.03;
        }
      }
    }

    // Draw connection lines
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.connectDistance) {
          const alpha = (1 - dist / config.connectDistance) * config.lineAlpha;
          ctx.strokeStyle = `rgba(52, 214, 198, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    // draw particles
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const glow = p.radius * 3;
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow);
      gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
      gradient.addColorStop(0.2, 'rgba(52,214,198,0.45)');
      gradient.addColorStop(0.8, 'rgba(52,214,198,0.02)');
      gradient.addColorStop(1, 'rgba(52,214,198,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d7f7fc';
      ctx.globalAlpha = config.particleAlpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (mouseActive) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, influenceRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function start() {
    resize();
    createParticles();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', updateMousePos);
    window.addEventListener('mouseout', clearMouse);
    rafId = requestAnimationFrame(time => {
      lastTime = time;
      draw(time);
    });
  }

  function stop() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    window.removeEventListener('mousemove', updateMousePos);
    window.removeEventListener('mouseout', clearMouse);
  }

  start();
  window._particlesBg = { destroy: stop };
  } catch (err) {
    console.error('[portfolio] particles initialization failed:', err);
  }
})();

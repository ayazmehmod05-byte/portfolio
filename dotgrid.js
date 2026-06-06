(function () {
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function createCanvas(container) {
    const c = document.createElement('canvas');
    c.style.position = 'absolute';
    c.style.left = '0';
    c.style.top = '0';
    c.style.width = '100%';
    c.style.height = '100%';
    c.style.pointerEvents = 'none';
    container.style.position = container.style.position || 'relative';
    container.appendChild(c);
    return c;
  }

  function DevicePixelRatioScale(canvas) {
    const ctx = canvas.getContext('2d');
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    return { ctx, resize };
  }

  function initDotGrid(container, opts = {}) {
    if (!container) return;
    const canvas = createCanvas(container);
    const { ctx, resize } = DevicePixelRatioScale(canvas);

    const cfg = Object.assign({
      dotSize: 4,
      gap: 20,
      baseColor: '#2F293A',
      activeColor: '#2E8B57', // sea green
      proximity: 120,
      shockRadius: 250,
      shockStrength: 6,
      resistance: 600,
      returnDuration: 1.4
    }, opts || {});

    let w = 0, h = 0;
    let points = [];
    let mouse = { x: -9999, y: -9999, vx:0, vy:0 };
    let raf = null;

    function rebuild() {
      resize();
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      points = [];
      const cols = Math.ceil(w / cfg.gap) + 1;
      const rows = Math.ceil(h / cfg.gap) + 1;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * cfg.gap;
          const py = y * cfg.gap;
          points.push({
            x: px, y: py,
            ox: px, oy: py,
            vx: 0, vy: 0
          });
        }
      }
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.vx = x - (mouse.x||x);
      mouse.vy = y - (mouse.y||y);
      mouse.x = x; mouse.y = y;
    }

    function onLeave() {
      mouse.x = -9999; mouse.y = -9999; mouse.vx = 0; mouse.vy = 0;
    }

    function update(dt) {
      const ctxAlpha = ctx;
      ctxAlpha.clearRect(0,0,w,h);
      for (let p of points) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // shock / repel
        if (dist < cfg.shockRadius) {
          const force = (1 - dist / cfg.shockRadius) * cfg.shockStrength;
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          p.vx += nx * force * (dt*60);
          p.vy += ny * force * (dt*60);
        }

        // attraction back to origin
        const ax = (p.ox - p.x) / (cfg.returnDuration * 60);
        const ay = (p.oy - p.y) / (cfg.returnDuration * 60);
        p.vx += ax * dt*60;
        p.vy += ay * dt*60;

        // resistance / damping
        const damper = 1 - clamp((dt*60) / (cfg.resistance/100), 0, 0.95);
        p.vx *= damper;
        p.vy *= damper;

        p.x += p.vx * dt*60;
        p.y += p.vy * dt*60;

        // color based on proximity
        const active = dist < cfg.proximity;
        ctx.fillStyle = active ? cfg.activeColor : cfg.baseColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, cfg.dotSize, 0, Math.PI*2);
        ctx.fill();
      }
    }

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.06, (now - last) / 1000);
      last = now;
      update(dt);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      rebuild();
      window.addEventListener('resize', rebuild);
      container.addEventListener('mousemove', onMove);
      container.addEventListener('mouseleave', onLeave);
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', rebuild);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }

    start();
    return { destroy: stop };
  }

  window.initDotGrid = initDotGrid;
})();

(function () {
  var U = window.PortfolioUtils;

  var config = {
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

  var mount = document.getElementById('particles-bg');
  if (!mount) return;

  var canvas = document.createElement('canvas');
  mount.appendChild(canvas);
  var scaled = U.scaleToDPR(canvas);
  var ctx = scaled.ctx;

  var width = 0;
  var height = 0;
  var mouse = U.createMouseTracker(mount);
  var particles = [];

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    var dims = scaled.resize();
    width = dims.width;
    height = dims.height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }

  function createParticles() {
    particles.length = 0;
    for (var i = 0; i < config.particleCount; i += 1) {
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

  function draw(dt) {
    var delta = dt * 60;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    var mx = mouse.state.x;
    var my = mouse.state.y;
    var mouseActive = mx >= 0 && my >= 0;
    var influenceRadius = 180;

    for (var i = 0; i < particles.length; i += 1) {
      var p = particles[i];
      p.phase += 0.02 * delta;
      p.x += p.vx * config.speed * delta + Math.sin(p.phase * 0.7) * 0.12;
      p.y += p.vy * config.speed * delta + Math.cos(p.phase * 0.9) * 0.12;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      if (mouseActive) {
        var dist = U.distance(p.x, p.y, mx, my);
        if (dist < influenceRadius) {
          var force = (1 - dist / influenceRadius) * config.mouseInfluence;
          p.x += (p.x - mx) * force * delta * 0.03;
          p.y += (p.y - my) * force * delta * 0.03;
        }
      }
    }

    for (var i = 0; i < particles.length; i += 1) {
      var p = particles[i];
      for (var j = i + 1; j < particles.length; j += 1) {
        var q = particles[j];
        var dist = U.distance(p.x, p.y, q.x, q.y);
        if (dist < config.connectDistance) {
          var alpha = (1 - dist / config.connectDistance) * config.lineAlpha;
          ctx.strokeStyle = 'rgba(52, 214, 198, ' + alpha + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    for (var i = 0; i < particles.length; i += 1) {
      var p = particles[i];
      var glow = p.radius * 3;
      var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow);
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
      ctx.arc(mx, my, influenceRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  var loop = U.createAnimationLoop(draw);

  function start() {
    resize();
    createParticles();
    window.addEventListener('resize', resize);
    mouse.attach();
    loop.start();
  }

  function stop() {
    loop.stop();
    window.removeEventListener('resize', resize);
    mouse.detach();
  }

  start();
  window._particlesBg = { destroy: stop };
})();

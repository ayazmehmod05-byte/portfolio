(function () {
  var U = window.PortfolioUtils;

  function initDotGrid(container, opts) {
    if (!container) return;
    var canvas = U.createCanvas(container);
    var scaled = U.scaleToDPR(canvas);
    var ctx = scaled.ctx;

    var cfg = Object.assign({
      dotSize: 4,
      gap: 20,
      baseColor: '#2F293A',
      activeColor: '#2E8B57',
      proximity: 120,
      shockRadius: 250,
      shockStrength: 6,
      resistance: 600,
      returnDuration: 1.4
    }, opts || {});

    var w = 0, h = 0;
    var points = [];
    var mouse = U.createMouseTracker(container);

    function rebuild() {
      var dims = scaled.resize();
      w = dims.width;
      h = dims.height;
      points = [];
      var cols = Math.ceil(w / cfg.gap) + 1;
      var rows = Math.ceil(h / cfg.gap) + 1;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var px = x * cfg.gap;
          var py = y * cfg.gap;
          points.push({
            x: px, y: py,
            ox: px, oy: py,
            vx: 0, vy: 0
          });
        }
      }
    }

    function update(dt) {
      ctx.clearRect(0, 0, w, h);
      var mx = mouse.state.x;
      var my = mouse.state.y;

      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var dist = U.distance(p.x, p.y, mx, my);

        if (dist < cfg.shockRadius) {
          var force = (1 - dist / cfg.shockRadius) * cfg.shockStrength;
          var nx = (p.x - mx) / (dist || 1);
          var ny = (p.y - my) / (dist || 1);
          p.vx += nx * force * (dt * 60);
          p.vy += ny * force * (dt * 60);
        }

        var ax = (p.ox - p.x) / (cfg.returnDuration * 60);
        var ay = (p.oy - p.y) / (cfg.returnDuration * 60);
        p.vx += ax * dt * 60;
        p.vy += ay * dt * 60;

        var damper = 1 - U.clamp((dt * 60) / (cfg.resistance / 100), 0, 0.95);
        p.vx *= damper;
        p.vy *= damper;

        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;

        var active = dist < cfg.proximity;
        ctx.fillStyle = active ? cfg.activeColor : cfg.baseColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, cfg.dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    var loop = U.createAnimationLoop(update);

    function start() {
      rebuild();
      window.addEventListener('resize', rebuild);
      mouse.attach();
      loop.start();
    }

    function stop() {
      loop.stop();
      window.removeEventListener('resize', rebuild);
      mouse.detach();
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }

    start();
    return { destroy: stop };
  }

  window.initDotGrid = initDotGrid;
})();

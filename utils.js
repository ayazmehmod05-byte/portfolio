/**
 * Shared utilities for canvas rendering, mouse tracking, and animation loops.
 * Load this script before dotgrid.js, particles.js, and script.js.
 */
window.PortfolioUtils = (function () {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function createCanvas(container) {
    var c = document.createElement('canvas');
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

  function scaleToDPR(canvas) {
    var ctx = canvas.getContext('2d');
    function resize() {
      var dpr = window.devicePixelRatio || 1;
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { width: rect.width, height: rect.height };
    }
    return { ctx: ctx, resize: resize };
  }

  function createMouseTracker(element) {
    var state = { x: -9999, y: -9999, vx: 0, vy: 0 };

    function onMove(e) {
      var rect = element.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      state.vx = x - state.x;
      state.vy = y - state.y;
      state.x = x;
      state.y = y;
    }

    function onLeave() {
      state.x = -9999;
      state.y = -9999;
      state.vx = 0;
      state.vy = 0;
    }

    function attach() {
      element.addEventListener('mousemove', onMove);
      element.addEventListener('mouseleave', onLeave);
    }

    function detach() {
      element.removeEventListener('mousemove', onMove);
      element.removeEventListener('mouseleave', onLeave);
    }

    return { state: state, attach: attach, detach: detach };
  }

  function createAnimationLoop(callback) {
    var rafId = null;
    var last = 0;

    function frame(now) {
      if (!last) last = now;
      var dt = Math.min(0.06, (now - last) / 1000);
      last = now;
      callback(dt);
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      last = 0;
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    return { start: start, stop: stop };
  }

  return {
    clamp: clamp,
    distance: distance,
    createCanvas: createCanvas,
    scaleToDPR: scaleToDPR,
    createMouseTracker: createMouseTracker,
    createAnimationLoop: createAnimationLoop
  };
})();

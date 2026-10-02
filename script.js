window.addEventListener('error', function (e) {
  console.error('[portfolio]', e.message, e.filename + ':' + e.lineno);
});

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.classList.remove('open');
    });
  });
}

const root = document.documentElement;
const hero = document.querySelector('.hero');

function updateMouseVariables(event) {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;

  root.style.setProperty('--pointer-x', x);
  root.style.setProperty('--pointer-y', y);
  root.style.setProperty('--cursor-glow', '0.35');

  if (hero) {
    const rect = hero.getBoundingClientRect();
    const heroX = ((event.clientX - rect.left) / rect.width) * 100;
    const heroY = ((event.clientY - rect.top) / rect.height) * 100;
    root.style.setProperty('--hero-x', Math.max(0, Math.min(100, heroX)));
    root.style.setProperty('--hero-y', Math.max(0, Math.min(100, heroY)));
  }
}

document.addEventListener('mousemove', updateMouseVariables);

document.addEventListener('mouseleave', () => {
  root.style.setProperty('--cursor-glow', '0');
});

document.addEventListener('mouseenter', () => {
  root.style.setProperty('--cursor-glow', '0.35');
});

const startupScreen = document.getElementById('startup-screen');
const STARTUP_RING_LENGTH = 942;
const STARTUP_DURATION_MS = 3200;
const STARTUP_STATUSES = [
  'Booting environment',
  'Loading assets',
  'Preparing interface',
  'Almost ready',
];

function setupStartupName() {
  const nameBlock = document.querySelector('.startup-logo');
  if (!nameBlock) return;
  const rawName = nameBlock.dataset.startupName?.trim() || nameBlock.textContent.trim();
  const lines = rawName.split(/\r?\n/);
  nameBlock.innerHTML = '';

  lines.forEach((line, lineIndex) => {
    const lineWrapper = document.createElement('div');
    lineWrapper.className = 'startup-line';
    line.split('').forEach((char, index) => {
      const letter = document.createElement('span');
      letter.className = 'startup-letter';
      letter.textContent = char === ' ' ? '\u00A0' : char;
      letter.style.animationDelay = `${0.55 + index * 0.07 + lineIndex * 0.55}s`;
      lineWrapper.appendChild(letter);
    });
    nameBlock.appendChild(lineWrapper);
  });
}

function updateStartupVisuals(percent) {
  const fill = document.getElementById('startupProgressFill');
  const percentLabel = document.getElementById('startupPercent');
  const ring = document.getElementById('startupRingProgress');
  const status = document.getElementById('startupStatus');

  if (fill) fill.style.width = `${percent}%`;
  if (percentLabel) percentLabel.textContent = `${Math.round(percent)}%`;
  if (ring) ring.style.strokeDashoffset = `${STARTUP_RING_LENGTH * (1 - percent / 100)}`;

  if (status) {
    const statusIndex = Math.min(
      STARTUP_STATUSES.length - 1,
      Math.floor((percent / 100) * STARTUP_STATUSES.length)
    );
    status.textContent = STARTUP_STATUSES[statusIndex];
  }
}

function runStartupSequence() {
  if (!startupScreen) return;

  const start = performance.now();
  let frameId = 0;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(100, (elapsed / STARTUP_DURATION_MS) * 100);
    updateStartupVisuals(progress);

    if (progress < 100) {
      frameId = requestAnimationFrame(tick);
      return;
    }

    updateStartupVisuals(100);
    setTimeout(hideStartupScreen, 280);
  }

  frameId = requestAnimationFrame(tick);

  document.addEventListener('beforeunload', () => {
    cancelAnimationFrame(frameId);
  }, { once: true });
}

function hideStartupScreen() {
  if (!startupScreen) return;
  startupScreen.classList.add('startup-exit');
  requestAnimationFrame(() => {
    startupScreen.classList.add('startup-hidden');
    document.body.classList.remove('startup-active');
    setTimeout(() => startupScreen.remove(), 720);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('startup-active');
  setupStartupName();
});

window.addEventListener('load', () => {
  runStartupSequence();
});

(function initProEnhancements() {
  try {
    const scrollProgress = document.getElementById('scrollProgress');
    const siteNav = document.getElementById('siteNav');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = [...navLinks]
      .map((link) => {
        const id = link.getAttribute('href')?.slice(1);
        const section = id ? document.getElementById(id) : null;
        return section ? { id, link, section } : null;
      })
      .filter(Boolean);

    let scrollTicking = false;

    function updateOnScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (scrollProgress) scrollProgress.style.width = `${progress}%`;
      if (siteNav) siteNav.classList.toggle('is-scrolled', scrollTop > 24);

      let activeId = 'home';
      sections.forEach(({ id, section }) => {
        const top = section.offsetTop - 120;
        if (scrollTop >= top) activeId = id;
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute('href')?.slice(1);
        link.classList.toggle('is-active', href === activeId);
      });

      scrollTicking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!scrollTicking) {
          scrollTicking = true;
          requestAnimationFrame(updateOnScroll);
        }
      },
      { passive: true }
    );

    updateOnScroll();
  } catch (err) {
    console.error('[portfolio] initProEnhancements failed:', err);
  }
})();

// Wrap words in selectable elements so each word can glow on hover
(function(){
  try {
    function wrapTextNodes(root) {
      const nodes = Array.from(root.childNodes);
      nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.nodeValue;
          if (!text.trim()) return;
          const frag = document.createDocumentFragment();
          const parts = text.split(/(\s+)/);
          parts.forEach(part => {
            if (part.match(/^\s+$/)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              const span = document.createElement('span');
              span.className = 'glow-word';
              span.textContent = part;
              frag.appendChild(span);
            }
          });
          root.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName.toLowerCase();
          if (['a','button','svg','script','style'].includes(tag)) return;
          wrapTextNodes(node);
        }
      });
    }

    function applyWordWrapping() {
      const root = document.querySelector('.page-shell');
      if (!root || root.dataset.wordwrapped) return;
      wrapTextNodes(root);
      root.dataset.wordwrapped = '1';
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyWordWrapping);
    } else {
      applyWordWrapping();
    }
  } catch (err) {
    console.error('[portfolio] word-wrapping failed:', err);
  }
})();

// Scroll-triggered animations with Intersection Observer
(function(){
  const elements = document.querySelectorAll(
    '.work-card, .skill-card, .project-card, .achievement-card, .section-header, .contact-card'
  );

  if (!elements.length) return;

  if (typeof IntersectionObserver === 'undefined') {
    elements.forEach((el) => {
      el.style.opacity = '1';
    });
    return;
  }

  const observerOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -80px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = `fadeInUp 0.8s ease ${index * 0.08}s forwards`;
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach((el, idx) => {
    el.style.opacity = '0';
    el.style.animationDelay = `${idx * 0.1}s`;
    observer.observe(el);
  });
})();

// Enhanced touch and pointer interactions
(function(){
  document.addEventListener('touchstart', function() {
    document.body.classList.add('touch-active');
  });

  document.addEventListener('mousemove', function() {
    document.body.classList.remove('touch-active');
  });

  const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
  interactiveElements.forEach(el => {
    el.addEventListener('mousedown', function() {
      this.style.filter = 'brightness(0.95)';
    });

    el.addEventListener('mouseup', function() {
      this.style.filter = 'brightness(1)';
    });
  });
})();

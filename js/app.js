/* ============================================
   MianGlow — app.js
   Global utilities and page bootstrap
   ============================================ */
'use strict';

/* ---- Sticky nav ---- */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---- Hamburger menu (mobile) ---- */
(function initMobile() {
  const toggle = document.querySelector('.hamburger');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '70px';
    links.style.left = '0';
    links.style.right = '0';
    links.style.background = 'rgba(10,10,15,0.98)';
    links.style.padding = '24px';
    links.style.gap = '20px';
    links.style.borderBottom = '1px solid rgba(212,160,23,0.2)';
  });
})();

/* ---- Scroll-reveal observer ---- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ---- Star field (hero background) ---- */
(function initStars() {
  const container = document.querySelector('.hero-stars');
  if (!container) return;
  const count = 60;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    star.style.cssText = `
      left: ${Math.random() * 100}%;
      top:  ${Math.random() * 100}%;
      width:  ${size}px;
      height: ${size}px;
      --duration: ${(Math.random() * 3 + 2).toFixed(1)}s;
      --delay:    ${(Math.random() * 4).toFixed(1)}s;
    `;
    container.appendChild(star);
  }
})();

/* ---- Live demo name glow ---- */
(function initHeroDemo() {
  const input   = document.getElementById('demo-input');
  const display = document.getElementById('demo-name-display');
  if (!input || !display) return;

  const defaults = ['Alex', 'Sara', 'Jordan', 'Mia', 'Noah'];
  let   demoIdx  = 0;
  let   cycling  = true;
  let   cycleTimer;

  function showName(name) {
    display.textContent = name || '✨';
    display.style.animation = 'none';
    // Force reflow so animation restarts
    void display.offsetWidth;
    display.style.animation = '';
  }

  function cycle() {
    if (!cycling) return;
    showName(defaults[demoIdx % defaults.length]);
    demoIdx++;
    cycleTimer = setTimeout(cycle, 2200);
  }

  input.addEventListener('input', () => {
    cycling = false;
    clearTimeout(cycleTimer);
    showName(input.value.trim() || '✨');
  });

  input.addEventListener('focus', () => {
    cycling = false;
    clearTimeout(cycleTimer);
  });

  cycle();
})();

/* ---- Demo section confetti ---- */
(function initDemoConfetti() {
  const layer = document.querySelector('.demo-confetti-layer');
  if (!layer) return;
  const colors = ['#FFD700','#FF4B8A','#4B9BFF','#FF6B6B','#80FF80','#BF00FF'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top:  ${Math.random() * -20}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --duration: ${(Math.random() * 3 + 3).toFixed(1)}s;
      --delay:    ${(Math.random() * 3).toFixed(1)}s;
      transform: rotate(${Math.random() * 360}deg);
    `;
    layer.appendChild(p);
  }
})();

/* ---- FAQ accordion ---- */
(function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!wasOpen) item.classList.add('open');
    });
  });
})();

/* ---- Smooth CTA scroll ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

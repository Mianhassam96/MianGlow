/* MianGlow — polish.js: loader, transitions, showcase */
'use strict';

/* ---- 1. LOADING SCREEN ---- */
(function initLoader() {
  var loader = document.getElementById('mg-loader');
  if (!loader) return;
  function hide() {
    loader.classList.add('hidden');
    setTimeout(function () { loader.style.display = 'none'; }, 600);
  }
  if (document.readyState === 'complete') {
    setTimeout(hide, 400);
  } else {
    window.addEventListener('load', function () { setTimeout(hide, 300); });
    setTimeout(hide, 2500); // hard cap
  }
})();

/* ---- 2. PAGE TRANSITIONS ---- */
(function initTransitions() {
  document.querySelectorAll('a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        a.target === '_blank') return;

    a.addEventListener('click', function (e) {
      e.preventDefault();
      var dest = href;
      document.body.classList.add('page-out');
      setTimeout(function () { window.location.href = dest; }, 280);
    });
  });
})();

/* ---- 3. SHOWCASE: live animated phone demo ---- */
(function initShowcase() {
  var nameEl    = document.getElementById('sc-name');
  var canvas    = document.getElementById('showcase-canvas');
  if (!nameEl || !canvas) return;

  var ctx = canvas.getContext('2d');

  /* Resize canvas to parent */
  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  || 280;
    canvas.height = rect.height || 440;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* Themes */
  var THEMES = [
    { key:'golden',   name:'Alex',    emoji:'🎂',  colors:['#FFD700','#D4A017','#F5C842','#FF6B6B'],
      bg:'linear-gradient(160deg,#0a0800,#1a1200,#2d2000)', nameColor:'#FFD700' },
    { key:'dreamy',   name:'Sara',    emoji:'🎀',  colors:['#FFB3E8','#FF69B4','#E040FB','#FFD700'],
      bg:'linear-gradient(160deg,#0f0a1a,#1a0d1a,#2d1a35)', nameColor:'#FFB3E8' },
    { key:'party',    name:'Jordan',  emoji:'🎊',  colors:['#FF4B8A','#4BFF91','#FFE500','#4B9BFF'],
      bg:'linear-gradient(160deg,#0a0a15,#0d0d20,#1a1a35)', nameColor:'#FFE500' },
    { key:'neon',     name:'Mia',     emoji:'⚡',  colors:['#00F5FF','#BF00FF','#FF00AA','#80FF80'],
      bg:'linear-gradient(160deg,#060012,#0d001a,#1a003d)', nameColor:'#00F5FF' },
    { key:'galaxy',   name:'Noah',    emoji:'🌌',  colors:['#C77DFF','#7B2FBE','#E0AAFF','#FFFFFF'],
      bg:'linear-gradient(160deg,#02001a,#05003d,#0d0066)', nameColor:'#C77DFF' },
    { key:'tropical', name:'Luna',    emoji:'🌴',  colors:['#FFD166','#06D6A0','#FF6B6B','#FFE500'],
      bg:'linear-gradient(160deg,#0a1a0a,#0d2b1a,#1a3d2a)', nameColor:'#FFD166' }
  ];

  var currentIdx = 0;
  var pieces     = [];
  var running    = false;

  /* Apply theme to phone screen */
  function applyTheme(t) {
    var screen = document.querySelector('.showcase-phone-screen');
    var cake   = document.querySelector('.sc-cake');
    if (screen) screen.style.background = t.bg;
    if (cake)   cake.textContent = t.emoji;
    if (nameEl) {
      nameEl.style.background = 'linear-gradient(135deg,' + t.nameColor + ',#FFFFFF)';
      nameEl.style.webkitBackgroundClip = 'text';
      nameEl.style.webkitTextFillColor  = 'transparent';
      nameEl.style.backgroundClip = 'text';
    }
    document.querySelectorAll('.sc-theme-btn').forEach(function (btn, i) {
      btn.classList.toggle('active', i === currentIdx);
    });
    burstConfetti(t.colors);
  }

  /* Typewriter name effect */
  function typewriterName(text) {
    if (!nameEl) return;
    nameEl.textContent = '';
    var i = 0;
    var iv = setInterval(function () {
      nameEl.textContent += text[i] || '';
      i++;
      if (i >= text.length) clearInterval(iv);
    }, 80);
  }

  /* Confetti burst */
  function burstConfetti(colors) {
    var w = canvas.width, h = canvas.height;
    for (var i = 0; i < 40; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 6;
      var life  = 60 + Math.random() * 50;
      pieces.push({
        x: w / 2, y: h * 0.35,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
        w: 4 + Math.random() * 6, h: 4 + Math.random() * 5,
        r: Math.random() * 360, vr: (Math.random() - .5) * 12,
        g: .2, drag: .96,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: life, max: life
      });
    }
    if (!running) loopCanvas();
  }

  function loopCanvas() {
    running = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = pieces.length - 1; i >= 0; i--) {
      var p = pieces[i];
      p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
      var a = Math.max(0, p.life / p.max);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      if (p.life <= 0 || p.y > canvas.height + 20) pieces.splice(i, 1);
    }
    if (pieces.length > 0) requestAnimationFrame(loopCanvas);
    else running = false;
  }

  /* Auto-cycle themes every 3s */
  function cycleTheme() {
    currentIdx = (currentIdx + 1) % THEMES.length;
    var t = THEMES[currentIdx];
    applyTheme(t);
    typewriterName(t.name);
  }
  var cycleTimer = setInterval(cycleTheme, 3000);

  /* Theme button clicks */
  document.querySelectorAll('.sc-theme-btn').forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      clearInterval(cycleTimer);
      currentIdx = i;
      var t = THEMES[i];
      applyTheme(t);
      typewriterName(t.name);
      cycleTimer = setInterval(cycleTheme, 3000);
    });
  });

  /* Init */
  applyTheme(THEMES[0]);
  typewriterName(THEMES[0].name);

})();

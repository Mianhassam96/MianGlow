/* ============================================
   MianGlow — viewer.js
   Recipient birthday experience
   ============================================ */
'use strict';

(function () {

  /* ---- Parse state from URL hash ---- */
  var hash    = window.location.hash.replace(/^#/, '');
  var state   = null;

  if (hash) {
    state = window.MianGlow.deserialise(hash);
  }

  if (!state) {
    // Show error scene
    show('scene-error');
    return;
  }

  /* ---- Set page title ---- */
  document.title = '🎂 Happy Birthday, ' + state.recipient + '! ✨';

  /* ---- Apply theme to main scene ---- */
  var sceneMain = document.getElementById('scene-main');
  if (sceneMain) sceneMain.setAttribute('data-theme', state.theme || 'golden');

  /* ---- Canvas setup ---- */
  var canvas = document.getElementById('fx-canvas');
  var ctx    = canvas ? canvas.getContext('2d') : null;
  var pieces = [];
  var balloonEls = [];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  /* ---- Theme particle colours ---- */
  var themeColors = {
    golden: ['#FFD700','#D4A017','#F5C842','#FFF8F0','#FF6B6B'],
    dreamy:  ['#FFB3E8','#FF69B4','#E040FB','#FFF0FF','#FFD700'],
    party:   ['#FF4B8A','#4BFF91','#FFE500','#4B9BFF','#FF6B6B','#BF00FF'],
    neon:    ['#00F5FF','#BF00FF','#FF00AA','#E0FFFF','#FFD700']
  };

  function getColors() {
    return themeColors[state.theme] || themeColors.golden;
  }

  /* ============================================================
     SCENE HELPERS
  ============================================================ */
  function show(id) {
    document.querySelectorAll('.scene').forEach(function (s) { s.classList.add('hidden'); });
    var el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      setTimeout(function () { el.style.opacity = '1'; }, 20);
    }
  }

  /* ============================================================
     SCENE 1 — Invite
  ============================================================ */
  show('scene-invite');

  var btnOpen = document.getElementById('btn-open');
  if (btnOpen) {
    btnOpen.addEventListener('click', startExperience);
    btnOpen.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') startExperience();
    });
  }

  /* ============================================================
     EXPERIENCE SEQUENCE
  ============================================================ */
  function startExperience() {
    show('scene-main');
    startFXLoop();

    // Sequence: name → cake → confetti burst → message → photos → finale
    var effects = state.effects || [];

    // Always show name
    setName();

    // Cake
    var cakeDelay = 1400;
    setTimeout(function () { showCake(); }, cakeDelay);

    // Confetti burst after cake
    if (effects.indexOf('confetti') !== -1) {
      setTimeout(function () { burstConfetti(80); }, cakeDelay + 400);
    }

    // Balloons
    if (effects.indexOf('balloons') !== -1) {
      setTimeout(launchBalloons, cakeDelay + 200);
    }

    // Fireworks
    if (effects.indexOf('fireworks') !== -1) {
      setTimeout(function () { launchFireworks(5); }, cakeDelay + 800);
    }

    // Message
    setTimeout(function () { showMessage(); }, cakeDelay + 1600);

    // Photos
    if (state.photos && state.photos.length > 0) {
      setTimeout(function () { showPhotos(); }, cakeDelay + 2600);
    }

    // Finale
    var finaleDelay = cakeDelay + (state.photos && state.photos.length ? 3600 : 2800);
    setTimeout(function () { showFinale(); }, finaleDelay);
  }

  /* ---- Set name ---- */
  function setName() {
    var el = document.getElementById('name-display');
    if (el) el.textContent = state.recipient || '';
  }

  /* ---- Show cake ---- */
  function showCake() {
    var wrap = document.getElementById('cake-wrap');
    if (wrap) {
      wrap.style.opacity = '1';
      wrap.style.animation = 'fadeInUp 0.8s ease both';
    }

    var cakeEl = document.getElementById('cake-emoji');
    if (cakeEl) {
      cakeEl.addEventListener('click', blowCandles);
      cakeEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') blowCandles();
      });
    }
  }

  var candlesBlown = false;

  function blowCandles() {
    if (candlesBlown) return;
    candlesBlown = true;

    var cakeEl   = document.getElementById('cake-emoji');
    var blownEl  = document.getElementById('candles-blown');
    var hintEl   = document.getElementById('cake-hint');

    if (cakeEl)  cakeEl.classList.add('hidden');
    if (blownEl) blownEl.classList.remove('hidden');
    if (hintEl)  hintEl.textContent = '🎉 Candles blown out!';

    burstConfetti(60);
    launchFireworks(3);
  }

  /* ---- Show message ---- */
  function showMessage() {
    var wrap = document.getElementById('message-wrap');
    var msgEl = document.getElementById('message-text');
    var senderEl = document.getElementById('sender-text');

    if (msgEl) msgEl.textContent = state.message && state.message.trim()
      ? state.message
      : 'Wishing you an incredible birthday full of joy, laughter, and all the things you love! 🎉';

    if (senderEl) senderEl.textContent = state.sender && state.sender.trim()
      ? '— with love from ' + state.sender
      : '';

    if (wrap) {
      wrap.classList.remove('hidden');
      wrap.classList.add('visible');
    }
  }

  /* ---- Show photos ---- */
  function showPhotos() {
    if (!state.photos || state.photos.length === 0) return;
    var wrap = document.getElementById('photos-wrap');
    var grid = document.getElementById('photos-grid');

    if (grid) {
      grid.innerHTML = '';
      state.photos.forEach(function (src, i) {
        var img = document.createElement('img');
        img.src = src;
        img.alt = 'Memory ' + (i + 1);
        img.loading = 'lazy';
        grid.appendChild(img);
      });
    }

    if (wrap) {
      wrap.classList.remove('hidden');
      wrap.classList.add('visible');
    }
  }

  /* ---- Show finale ---- */
  function showFinale() {
    var wrap = document.getElementById('finale-wrap');
    if (wrap) {
      wrap.classList.remove('hidden');
      wrap.classList.add('visible');
    }
    burstConfetti(50);
  }

  /* ---- Replay ---- */
  var btnReplay = document.getElementById('btn-replay');
  if (btnReplay) {
    btnReplay.addEventListener('click', function () {
      // Reset and replay
      candlesBlown = false;
      pieces = [];
      balloonEls.forEach(function (b) { b.remove(); });
      balloonEls = [];

      var cakeEl  = document.getElementById('cake-emoji');
      var blownEl = document.getElementById('candles-blown');
      var hintEl  = document.getElementById('cake-hint');
      var msgWrap = document.getElementById('message-wrap');
      var photoWrap = document.getElementById('photos-wrap');
      var finaleWrap = document.getElementById('finale-wrap');
      var cakeWrap = document.getElementById('cake-wrap');

      if (cakeEl)    { cakeEl.classList.remove('hidden'); cakeEl.style.animation = ''; }
      if (blownEl)   blownEl.classList.add('hidden');
      if (hintEl)    hintEl.textContent = 'Tap the cake to blow out the candles!';
      if (msgWrap)   { msgWrap.classList.add('hidden'); msgWrap.classList.remove('visible'); }
      if (photoWrap) { photoWrap.classList.add('hidden'); photoWrap.classList.remove('visible'); }
      if (finaleWrap){ finaleWrap.classList.add('hidden'); finaleWrap.classList.remove('visible'); }
      if (cakeWrap)  cakeWrap.style.opacity = '0';

      startExperience();
    });
  }

  /* ============================================================
     CANVAS FX
  ============================================================ */
  function startFXLoop() {
    if (!ctx) return;
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw confetti
      for (var i = pieces.length - 1; i >= 0; i--) {
        var p = pieces[i];
        p.y += p.vy;
        p.x += p.vx;
        p.r += p.vr;
        p.life -= 1;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        if (p.life <= 0 || p.y > canvas.height + 20) pieces.splice(i, 1);
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  function burstConfetti(count) {
    if (!ctx) return;
    var colors = getColors();
    var cx = canvas.width / 2;
    var cy = canvas.height * 0.3;
    for (var i = 0; i < count; i++) {
      var angle = (Math.random() * Math.PI * 2);
      var speed = 4 + Math.random() * 8;
      var maxLife = 80 + Math.random() * 60;
      pieces.push({
        x: cx + (Math.random() - 0.5) * 100,
        y: cy,
        w: 5 + Math.random() * 7,
        h: 5 + Math.random() * 7,
        r: Math.random() * 360,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        vr: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: maxLife,
        maxLife: maxLife
      });
    }
  }

  function launchBalloons() {
    var layer  = document.getElementById('balloon-layer');
    if (!layer) return;
    var emojis = ['🎈','🎈','🎈','🎀','🎊'];
    var count  = 8;
    for (var i = 0; i < count; i++) {
      (function (idx) {
        setTimeout(function () {
          var b = document.createElement('div');
          b.className = 'balloon';
          b.textContent = emojis[Math.floor(Math.random() * emojis.length)];
          b.style.cssText = 'left:' + (5 + Math.random() * 90) + '%;' +
            'bottom:-80px;' +
            '--duration:' + (7 + Math.random() * 5).toFixed(1) + 's;' +
            '--delay:0s;' +
            'font-size:' + (1.8 + Math.random() * 1.4).toFixed(1) + 'rem;';
          layer.appendChild(b);
          balloonEls.push(b);
          setTimeout(function () { b.remove(); balloonEls = balloonEls.filter(function(x){return x!==b;}); }, 15000);
        }, idx * 400);
      })(i);
    }
  }

  function launchFireworks(count) {
    if (!ctx) return;
    for (var f = 0; f < count; f++) {
      (function (fi) {
        setTimeout(function () {
          var cx = canvas.width  * (0.2 + Math.random() * 0.6);
          var cy = canvas.height * (0.1 + Math.random() * 0.4);
          var colors = getColors();
          var color  = colors[Math.floor(Math.random() * colors.length)];
          var particleCount = 30;
          for (var i = 0; i < particleCount; i++) {
            var angle = (i / particleCount) * Math.PI * 2;
            var speed = 3 + Math.random() * 5;
            var maxLife = 50 + Math.random() * 30;
            pieces.push({
              x: cx, y: cy,
              w: 3, h: 3, r: 0, vr: 0,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: color,
              life: maxLife,
              maxLife: maxLife
            });
          }
        }, fi * 600);
      })(f);
    }
  }

})();

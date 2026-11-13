/* ============================================
   MianGlow — viewer.js  (Phase 3)
   Recipient birthday experience
   Uses: NameReveal, Cake, Confetti, Balloons, Fireworks
   ============================================ */
'use strict';

(function () {

  /* ---- Parse state from URL hash ---- */
  var hash  = window.location.hash.replace(/^#/, '');
  var state = null;

  if (hash) state = window.MianGlow.deserialise(hash);

  if (!state) {
    _show('scene-error');
    return;
  }

  /* ---- Page title ---- */
  document.title = '🎂 Happy Birthday, ' + state.recipient + '! ✨';

  /* ---- Apply theme to main scene ---- */
  var sceneMain = document.getElementById('scene-main');
  if (sceneMain) sceneMain.setAttribute('data-theme', state.theme || 'golden');

  /* ---- Canvas sizing ---- */
  var canvases = ['canvas-confetti', 'canvas-fireworks'];
  function _resizeCanvases() {
    canvases.forEach(function (id) {
      var c = document.getElementById(id);
      if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
    });
  }
  _resizeCanvases();
  window.addEventListener('resize', _resizeCanvases, { passive: true });

  /* ---- Animation instances ---- */
  var confettiAnim  = null;
  var fireworksAnim = null;
  var balloonsAnim  = null;
  var cakeAnim      = null;
  var nameRevealAnim = null;

  var effects = state.effects || [];

  /* ============================================================
     SCENE HELPERS
  ============================================================ */
  function _show(id) {
    document.querySelectorAll('.scene').forEach(function (s) {
      s.classList.add('hidden');
      s.style.opacity = '0';
    });
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    requestAnimationFrame(function () {
      el.style.transition = 'opacity 0.6s ease';
      el.style.opacity    = '1';
    });
  }

  function _reveal(id, delay) {
    setTimeout(function () {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('hidden');
      el.classList.add('visible');
    }, delay || 0);
  }

  /* ============================================================
     SCENE 1 — Invite
  ============================================================ */
  _show('scene-invite');

  var btnOpen = document.getElementById('btn-open');
  if (btnOpen) {
    btnOpen.addEventListener('click', _startExperience);
  }

  /* ============================================================
     EXPERIENCE SEQUENCE
  ============================================================ */
  function _startExperience() {
    _show('scene-main');
    _initConfetti();
    _initFireworks();

    // 1. Name reveal (canvas animation)
    setTimeout(_doNameReveal, 400);

    // 2. Balloons
    if (effects.indexOf('balloons') !== -1) {
      setTimeout(_doBalloons, 600);
    }

    // 3. Cake (after name reveal completes ~2.4s)
    setTimeout(_doCake, 2400);

    // 4. Confetti burst on cake appear
    if (effects.indexOf('confetti') !== -1) {
      setTimeout(function () {
        confettiAnim && confettiAnim.burst(60);
      }, 2600);
    }

    // 5. Message
    setTimeout(_doMessage, 4000);

    // 6. Photos
    var hasPhotos = state.photos && state.photos.length > 0;
    if (hasPhotos) setTimeout(_doPhotos, 5200);

    // 7. Finale
    var finaleDelay = hasPhotos ? 6400 : 5000;
    setTimeout(_doFinale, finaleDelay);
  }

  /* ============================================================
     1. NAME REVEAL
  ============================================================ */
  function _doNameReveal() {
    // Set DOM name
    var nameEl = document.getElementById('name-display');
    if (nameEl) nameEl.textContent = state.recipient || '';

    // Canvas animation
    var container = document.getElementById('name-reveal-container');
    if (container && window.MianGlow.animations.NameReveal) {
      nameRevealAnim = new window.MianGlow.animations.NameReveal(
        container,
        state.recipient || '',
        state.theme,
        function () {
          // Canvas done — DOM name takes over
          if (nameRevealAnim) nameRevealAnim.stop();
        }
      );
      nameRevealAnim.start();
    }
  }

  /* ============================================================
     2. BALLOONS
  ============================================================ */
  function _doBalloons() {
    var layer = document.getElementById('balloon-layer');
    if (!layer || !window.MianGlow.animations.Balloons) return;
    balloonsAnim = new window.MianGlow.animations.Balloons(layer, state.theme, 10);
    balloonsAnim.start();
  }

  /* ============================================================
     3. CAKE
  ============================================================ */
  function _doCake() {
    if (effects.indexOf('cake') === -1) return;

    var wrap   = document.getElementById('cake-wrap');
    var canvas = document.getElementById('cake-canvas');
    if (!wrap || !canvas || !window.MianGlow.animations.Cake) return;

    wrap.classList.remove('hidden');

    // Size canvas to its container
    var rect = wrap.getBoundingClientRect();
    canvas.width  = rect.width  || 280;
    canvas.height = rect.height || 280;

    cakeAnim = new window.MianGlow.animations.Cake(
      canvas,
      state.theme,
      function onBlown() {
        // Extra confetti + fireworks on candle blow
        if (confettiAnim)  confettiAnim.burst(80);
        if (fireworksAnim) fireworksAnim.show(3, 1800);
      }
    );
    cakeAnim.start();
  }

  /* ============================================================
     4. CONFETTI init
  ============================================================ */
  function _initConfetti() {
    if (effects.indexOf('confetti') === -1) return;
    var c = document.getElementById('canvas-confetti');
    if (!c || !window.MianGlow.animations.Confetti) return;
    confettiAnim = new window.MianGlow.animations.Confetti(c, state.theme);
  }

  /* ============================================================
     5. FIREWORKS init
  ============================================================ */
  function _initFireworks() {
    if (effects.indexOf('fireworks') === -1) return;
    var c = document.getElementById('canvas-fireworks');
    if (!c || !window.MianGlow.animations.Fireworks) return;
    fireworksAnim = new window.MianGlow.animations.Fireworks(c, state.theme);
  }

  /* ============================================================
     6. MESSAGE
  ============================================================ */
  function _doMessage() {
    var msgEl    = document.getElementById('message-text');
    var senderEl = document.getElementById('sender-text');

    if (msgEl) {
      msgEl.textContent = (state.message && state.message.trim())
        ? state.message
        : 'Wishing you an incredible birthday full of joy, laughter, and all the things you love! 🎉';
    }
    if (senderEl) {
      senderEl.textContent = (state.sender && state.sender.trim())
        ? '— with love from ' + state.sender
        : '';
    }

    _reveal('message-wrap');

    if (effects.indexOf('confetti') !== -1 && confettiAnim) {
      confettiAnim.burst(40);
    }
  }

  /* ============================================================
     7. PHOTOS
  ============================================================ */
  function _doPhotos() {
    if (!state.photos || state.photos.length === 0) return;

    var grid = document.getElementById('photos-grid');
    if (grid) {
      grid.innerHTML = '';
      state.photos.forEach(function (src, i) {
        var img    = document.createElement('img');
        img.src    = src;
        img.alt    = 'Memory ' + (i + 1);
        img.loading = 'lazy';
        grid.appendChild(img);
      });
    }
    _reveal('photos-wrap');
  }

  /* ============================================================
     8. FINALE
  ============================================================ */
  function _doFinale() {
    _reveal('finale-wrap');

    if (confettiAnim)  confettiAnim.burst(100);
    if (fireworksAnim) fireworksAnim.show(5, 3000);
  }

  /* ============================================================
     REPLAY
  ============================================================ */
  var btnReplay = document.getElementById('btn-replay');
  if (btnReplay) {
    btnReplay.addEventListener('click', function () {
      // Stop all animations
      if (cakeAnim)       cakeAnim.stop();
      if (balloonsAnim)   balloonsAnim.stop();
      if (nameRevealAnim) nameRevealAnim.stop();
      if (confettiAnim)   confettiAnim.clear();
      if (fireworksAnim)  fireworksAnim.clear();

      // Reset DOM
      var ids = ['cake-wrap', 'message-wrap', 'photos-wrap', 'finale-wrap'];
      ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) { el.classList.add('hidden'); el.classList.remove('visible'); }
      });

      // Clear name reveal container
      var nr = document.getElementById('name-reveal-container');
      if (nr) nr.innerHTML = '';

      // Restart
      _startExperience();
    });
  }

})();

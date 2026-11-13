/* ============================================
   MianGlow — creator.js
   5-step birthday creator wizard
   ============================================ */
'use strict';

(function () {

  /* ---- State ---- */
  var state   = window.MianGlow.defaultState();
  var current = 1;
  var TOTAL   = 5;

  /* ---- DOM references ---- */
  var stepDots    = document.querySelectorAll('.step-dot');
  var stepPanels  = document.querySelectorAll('.step-panel');
  var previewName = document.getElementById('preview-name');
  var previewMsg  = document.getElementById('preview-message');
  var previewSender = document.getElementById('preview-sender');
  var previewScreen = document.getElementById('preview-screen');
  var previewEmoji  = document.getElementById('preview-emoji');
  var confettiLayer = document.getElementById('preview-confetti');

  /* ============================================================
     STEP NAVIGATION
  ============================================================ */
  function goTo(step) {
    if (step < 1 || step > TOTAL) return;

    // Validate before advancing
    if (step > current) {
      if (!validateStep(current)) return;
    }

    current = step;

    stepPanels.forEach(function (p) { p.classList.remove('active'); });
    var panel = document.getElementById('step-' + current);
    if (panel) panel.classList.add('active');

    stepDots.forEach(function (d, i) {
      var n = i + 1;
      d.classList.remove('active', 'completed');
      if (n === current)   d.classList.add('active');
      if (n < current)     d.classList.add('completed');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    updatePreview();

    // On step 5, build share URL and populate
    if (current === 5) buildFinalStep();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Wire up all next/prev buttons
  document.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', next);
  });
  document.querySelectorAll('[data-prev]').forEach(function (btn) {
    btn.addEventListener('click', prev);
  });

  /* ============================================================
     VALIDATION
  ============================================================ */
  function validateStep(step) {
    var ok = true;

    if (step === 1) {
      var r = document.getElementById('input-recipient');
      if (!r.value.trim()) {
        showError('error-recipient', 'Please enter the recipient\'s name.');
        r.classList.add('error');
        ok = false;
      } else {
        clearError('error-recipient');
        r.classList.remove('error');
      }
    }

    return ok;
  }

  function showError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
  }

  function clearError(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('visible');
  }

  /* ============================================================
     STEP 1 — Recipient details
  ============================================================ */
  var inputRecipient = document.getElementById('input-recipient');
  var inputSender    = document.getElementById('input-sender');

  if (inputRecipient) {
    inputRecipient.addEventListener('input', function () {
      state.recipient = this.value;
      clearError('error-recipient');
      this.classList.remove('error');
      updatePreview();
    });
  }

  if (inputSender) {
    inputSender.addEventListener('input', function () {
      state.sender = this.value;
      updatePreview();
    });
  }

  /* ============================================================
     STEP 2 — Birthday message
  ============================================================ */
  var inputMessage = document.getElementById('input-message');
  var charCount    = document.getElementById('char-count');

  if (inputMessage) {
    inputMessage.addEventListener('input', function () {
      state.message = this.value;
      var len = this.value.length;
      if (charCount) {
        charCount.textContent = len + ' / 300';
        charCount.classList.toggle('warning', len > 260);
      }
      updatePreview();
    });
  }

  /* ============================================================
     STEP 3 — Theme & Photos
  ============================================================ */
  document.querySelectorAll('input[name="theme"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      state.theme = this.value;
      updatePreview();
    });
  });

  // Photo upload
  var photoInput = document.getElementById('photo-input');
  var photoGrid  = document.getElementById('photo-grid');

  if (photoInput) {
    photoInput.addEventListener('change', function (e) {
      handlePhotoFiles(e.target.files);
    });
  }

  // Drag & drop
  var uploadZone = document.getElementById('upload-zone');
  if (uploadZone) {
    uploadZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      this.classList.add('drag-over');
    });
    uploadZone.addEventListener('dragleave', function () {
      this.classList.remove('drag-over');
    });
    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      handlePhotoFiles(e.dataTransfer.files);
    });
  }

  function handlePhotoFiles(files) {
    var MAX = 6;
    var remaining = MAX - state.photos.length;
    if (remaining <= 0) {
      showToast('Maximum 6 photos allowed.');
      return;
    }
    var toProcess = Array.from(files).slice(0, remaining);
    var promises  = toProcess
      .filter(function (f) { return f.type.startsWith('image/'); })
      .map(function (f) { return window.MianGlow.resizeImage(f, 600, 0.72); });

    Promise.all(promises).then(function (results) {
      state.photos = state.photos.concat(results);
      renderPhotoGrid();
      updatePreview();
    }).catch(function (err) {
      console.error('Photo processing error:', err);
    });
  }

  function renderPhotoGrid() {
    if (!photoGrid) return;
    photoGrid.innerHTML = '';
    state.photos.forEach(function (src, idx) {
      var thumb = document.createElement('div');
      thumb.className = 'photo-thumb';
      var img = document.createElement('img');
      img.src = src; img.alt = 'Photo ' + (idx + 1);
      var btn = document.createElement('button');
      btn.className = 'photo-thumb-remove';
      btn.setAttribute('aria-label', 'Remove photo ' + (idx + 1));
      btn.textContent = '×';
      btn.addEventListener('click', function () {
        state.photos.splice(idx, 1);
        renderPhotoGrid();
        updatePreview();
      });
      thumb.appendChild(img);
      thumb.appendChild(btn);
      photoGrid.appendChild(thumb);
    });
  }

  /* ============================================================
     STEP 4 — Animation effects
  ============================================================ */
  document.querySelectorAll('input[name="effect"]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var effect = this.value;
      if (this.checked) {
        if (state.effects.indexOf(effect) === -1) state.effects.push(effect);
      } else {
        state.effects = state.effects.filter(function (e) { return e !== effect; });
      }
      updatePreview();
    });
    // Set initial checked state
    cb.checked = state.effects.indexOf(cb.value) !== -1;
  });

  /* ============================================================
     LIVE PREVIEW
  ============================================================ */
  function updatePreview() {
    if (!previewName) return;

    // Name
    var name = state.recipient.trim() || 'Your Name';
    previewName.textContent = name;
    previewName.className = 'preview-name theme-' + state.theme;

    // Message
    if (previewMsg) {
      previewMsg.textContent = state.message.trim() || 'Happy Birthday! 🎉 Wishing you an amazing day ✨';
    }

    // Sender
    if (previewSender) {
      previewSender.textContent = state.sender.trim() ? '— from ' + state.sender.trim() : '';
    }

    // Screen background
    if (previewScreen) {
      previewScreen.className = 'preview-screen theme-' + state.theme;
    }

    // Emoji by theme
    if (previewEmoji) {
      var emojis = { golden: '🎂', dreamy: '🎀', party: '🎊', neon: '⚡' };
      previewEmoji.textContent = emojis[state.theme] || '🎂';
    }

    // Effects badges
    updateEffectBadges();

    // Confetti in preview if effect enabled
    if (confettiLayer) {
      confettiLayer.style.display =
        state.effects.indexOf('confetti') !== -1 ? 'block' : 'none';
    }
  }

  function updateEffectBadges() {
    var row = document.getElementById('preview-effects-row');
    if (!row) return;
    row.innerHTML = '';
    var labels = { confetti: '🎉 Confetti', balloons: '🎈 Balloons', cake: '🎂 Cake', nameReveal: '✨ Name Reveal', fireworks: '🎆 Fireworks' };
    state.effects.forEach(function (e) {
      if (labels[e]) {
        var badge = document.createElement('span');
        badge.className = 'preview-effect-badge';
        badge.textContent = labels[e];
        row.appendChild(badge);
      }
    });
  }

  /* ============================================================
     STEP 5 — Share & Download
  ============================================================ */
  function buildFinalStep() {
    var shareInput = document.getElementById('share-link-value');
    var url = window.MianGlow.buildShareURL(state);
    if (shareInput && url) {
      shareInput.value = url;
    }

    // Recipient name in summary
    var summaryName = document.getElementById('summary-name');
    if (summaryName) {
      summaryName.textContent = state.recipient.trim() || 'your friend';
    }
  }

  // Copy link button
  var copyBtn = document.getElementById('btn-copy-link');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var input = document.getElementById('share-link-value');
      if (!input) return;
      navigator.clipboard.writeText(input.value).then(function () {
        showToast('✅ Link copied to clipboard!');
      }).catch(function () {
        input.select();
        document.execCommand('copy');
        showToast('✅ Link copied!');
      });
    });
  }

  // WhatsApp share
  var waBtn = document.getElementById('btn-whatsapp');
  if (waBtn) {
    waBtn.addEventListener('click', function () {
      var input = document.getElementById('share-link-value');
      if (!input) return;
      var text = encodeURIComponent(
        '🎂 I made a birthday surprise for you on MianGlow!\n\n' +
        '✨ Open it here: ' + input.value
      );
      window.open('https://wa.me/?text=' + text, '_blank');
    });
  }

  // Download HTML
  var dlBtn = document.getElementById('btn-download');
  if (dlBtn) {
    dlBtn.addEventListener('click', function () {
      var html = window.MianGlow.generateDownload(state);
      var blob = new Blob([html], { type: 'text/html' });
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement('a');
      var filename = 'happy-birthday-' +
        (state.recipient.trim().toLowerCase().replace(/\s+/g, '-') || 'greeting') + '.html';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📥 Greeting downloaded!');
    });
  }

  /* ============================================================
     TOAST
  ============================================================ */
  var toastEl = document.getElementById('toast');
  var toastTimer;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 3000);
  }

  /* ============================================================
     Init
  ============================================================ */
  goTo(1);
  updatePreview();

  // Expose goTo for inline onclick usage
  window.creatorGoTo = goTo;

})();

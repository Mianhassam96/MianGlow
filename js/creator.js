/* ============================================
   MianGlow — creator.js  (Phase 4+5)
   5-step birthday creator wizard
   ============================================ */
'use strict';

(function () {

  var MG      = window.MianGlow;
  var state   = MG.defaultState();

  /* ---- Read celebration type from URL ---- */
  var urlParams = new URLSearchParams(window.location.search);
  var celType   = urlParams.get('type') || 'birthday';
  state.type    = celType;

  /* Apply celebration defaults (theme, effects) */
  if (window.MianGlow.applyDefaults) window.MianGlow.applyDefaults(state);

  /* Update wizard heading with celebration name */
  var cel = window.MianGlow.getCelebration ? window.MianGlow.getCelebration(celType) : null;
  if (cel) {
    var step1h = document.getElementById('step1-heading');
    if (step1h) step1h.textContent = 'Who is this for? ' + cel.emoji;
    var topbarTitle = document.querySelector('.topbar-right span');
    if (topbarTitle) topbarTitle.textContent = cel.label + ' Creator';
    document.title = 'MianGlow — Create a ' + cel.label + ' Surprise ✨';
  }
  var current = 1;
  var TOTAL   = 5;

  /* ---- DOM refs ---- */
  var stepDots     = document.querySelectorAll('.step-dot');
  var stepPanels   = document.querySelectorAll('.step-panel');
  var previewName  = document.getElementById('preview-name');
  var previewMsg   = document.getElementById('preview-message');
  var previewSndr  = document.getElementById('preview-sender');
  var previewScrn  = document.getElementById('preview-screen');
  var previewEmoji = document.getElementById('preview-emoji');
  var confLayer    = document.getElementById('preview-confetti');

  /* ============================================================
     NAVIGATION
  ============================================================ */
  function goTo(step) {
    if (step < 1 || step > TOTAL) return;
    if (step > current && !_validateStep(current)) return;
    current = step;

    stepPanels.forEach(function (p) { p.classList.remove('active'); });
    var panel = document.getElementById('step-' + current);
    if (panel) panel.classList.add('active');

    stepDots.forEach(function (d, i) {
      var n = i + 1;
      d.classList.toggle('active',    n === current);
      d.classList.toggle('completed', n <  current);
      // accessibility
      d.querySelector('.step-dot-circle').setAttribute('aria-current', n === current ? 'step' : 'false');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    _updatePreview();
    if (current === 5) _buildFinalStep();
  }

  document.querySelectorAll('[data-next]').forEach(function (b) { b.addEventListener('click', function () { goTo(current + 1); }); });
  document.querySelectorAll('[data-prev]').forEach(function (b) { b.addEventListener('click', function () { goTo(current - 1); }); });
  window.creatorGoTo = goTo; // allow inline onclick

  /* ============================================================
     VALIDATION
  ============================================================ */
  function _validateStep(step) {
    if (step === 1) {
      var r = document.getElementById('input-recipient');
      if (!r || !r.value.trim()) {
        _showErr('error-recipient', 'Please enter the recipient\'s name.');
        if (r) r.classList.add('error');
        return false;
      }
      _clearErr('error-recipient');
      r.classList.remove('error');
    }
    return true;
  }

  function _showErr(id, msg) {
    var el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add('visible'); }
  }

  function _clearErr(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('visible');
  }

  /* ============================================================
     STEP 1 — Who
  ============================================================ */
  var inputR = document.getElementById('input-recipient');
  var inputS = document.getElementById('input-sender');

  if (inputR) inputR.addEventListener('input', function () {
    state.recipient = this.value;
    _clearErr('error-recipient');
    this.classList.remove('error');
    _updatePreview();
  });

  if (inputS) inputS.addEventListener('input', function () {
    state.sender = this.value;
    _updatePreview();
  });

  /* ============================================================
     STEP 2 — Message
  ============================================================ */
  var inputMsg  = document.getElementById('input-message');
  var charCount = document.getElementById('char-count');

  if (inputMsg) inputMsg.addEventListener('input', function () {
    state.message = this.value;
    var len = this.value.length;
    if (charCount) {
      charCount.textContent = len + ' / 300';
      charCount.classList.toggle('warning', len > 260);
    }
    _updatePreview();
  });

  /* ============================================================
     STEP 3 — Theme + Photos
  ============================================================ */
  document.querySelectorAll('input[name="theme"]').forEach(function (r) {
    r.addEventListener('change', function () {
      state.theme = this.value;
      _updatePreview();
    });
  });

  var photoInput = document.getElementById('photo-input');
  var photoGrid  = document.getElementById('photo-grid');
  var uploadZone = document.getElementById('upload-zone');

  if (photoInput) photoInput.addEventListener('change', function (e) { _handleFiles(e.target.files); });

  if (uploadZone) {
    uploadZone.addEventListener('dragover',  function (e) { e.preventDefault(); this.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', function ()  { this.classList.remove('drag-over'); });
    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      _handleFiles(e.dataTransfer.files);
    });
    uploadZone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); photoInput && photoInput.click(); }
    });
  }

  function _handleFiles(files) {
    var MAX  = 6;
    var room = MAX - state.photos.length;
    if (room <= 0) { _toast('Maximum 6 photos allowed.'); return; }

    var toProcess = Array.from(files)
      .filter(function (f) { return f.type.startsWith('image/'); })
      .slice(0, room);

    if (toProcess.length === 0) { _toast('Please select image files (JPG, PNG, WEBP).'); return; }

    // Show loading state
    var label = document.getElementById('upload-text');
    if (label) label.textContent = 'Resizing photos…';

    Promise.all(toProcess.map(function (f) { return MG.resizeImage(f, 600, 0.72); }))
      .then(function (results) {
        state.photos = state.photos.concat(results);
        _renderPhotos();
        _updatePreview();
        if (label) label.textContent = 'Drop photos here or click to browse';
      })
      .catch(function () {
        if (label) label.textContent = 'Drop photos here or click to browse';
        _toast('Could not process one or more photos.');
      });
  }

  function _renderPhotos() {
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
        _renderPhotos();
        _updatePreview();
      });
      thumb.appendChild(img);
      thumb.appendChild(btn);
      photoGrid.appendChild(thumb);
    });
  }

  /* ============================================================
     STEP 4 — Effects
  ============================================================ */
  document.querySelectorAll('input[name="effect"]').forEach(function (cb) {
    cb.checked = state.effects.indexOf(cb.value) !== -1;
    cb.addEventListener('change', function () {
      var fx = this.value;
      if (this.checked) { if (state.effects.indexOf(fx) === -1) state.effects.push(fx); }
      else { state.effects = state.effects.filter(function (e) { return e !== fx; }); }
      _updatePreview();
    });
  });

  /* ============================================================
     LIVE PREVIEW
  ============================================================ */
  function _updatePreview() {
    var name = state.recipient.trim() || 'Your Name';
    var EMOJI = { golden: '🎂', dreamy: '🎀', party: '🎊', neon: '⚡', vintage: '🌹', midnight: '🌊', tropical: '🌴', galaxy: '🌌' };

    if (previewName)  { previewName.textContent = name; previewName.className = 'preview-name theme-' + state.theme; }
    if (previewMsg)   previewMsg.textContent  = state.message.trim() || 'Happy Birthday! 🎉 Wishing you an amazing day ✨';
    if (previewSndr)  previewSndr.textContent = state.sender.trim()  ? '— from ' + state.sender.trim() : '';
    if (previewScrn)  previewScrn.className   = 'preview-screen theme-' + state.theme;
    if (previewEmoji) previewEmoji.textContent = EMOJI[state.theme] || '🎂';
    if (confLayer)    confLayer.style.display  = state.effects.indexOf('confetti') !== -1 ? 'block' : 'none';

    _updateEffectBadges();
  }

  function _updateEffectBadges() {
    var row = document.getElementById('preview-effects-row');
    if (!row) return;
    var LABELS = { confetti: '🎉 Confetti', balloons: '🎈 Balloons', cake: '🎂 Cake', nameReveal: '✨ Reveal', fireworks: '🎆 Fireworks', stars: '⭐ Stars' };
    row.innerHTML = '';
    state.effects.forEach(function (e) {
      if (!LABELS[e]) return;
      var b = document.createElement('span');
      b.className = 'preview-effect-badge';
      b.textContent = LABELS[e];
      row.appendChild(b);
    });
  }

  /* ============================================================
     STEP 5 — Share + Download
  ============================================================ */
  function _buildFinalStep() {
    // Track completion
    if (window.MianGlow.Analytics) {
      window.MianGlow.Analytics.greetingCompleted(state.type, state.theme);
    }
    var url = MG.buildShareURL ? MG.buildShareURL(state) : null;
    var shareInput = document.getElementById('share-link-value');

    // Summary name
    var sn = document.getElementById('summary-name');
    if (sn) sn.textContent = state.recipient.trim() || 'your friend';

    if (shareInput && url) {
      shareInput.value = url;
      // URL length feedback
      var check = MG.checkURLLength ? MG.checkURLLength(url) : { ok: true };
      var warn  = document.getElementById('share-link-warn');
      if (warn) {
        if (check.toolong) {
          warn.textContent = '⚠ Link is very long — use the download option for sharing with photos.';
          warn.style.display = 'block';
        } else if (check.warning) {
          warn.textContent = 'ℹ Link is long but should work. Use download if sharing fails.';
          warn.style.display = 'block';
        } else {
          warn.style.display = 'none';
        }
      }
    }

    // Show native share button on mobile
    var nativeBtn = document.getElementById('btn-native-share');
    if (nativeBtn) {
      nativeBtn.style.display = navigator.share ? 'inline-flex' : 'none';
    }
  }

  /* Copy link */
  var copyBtn = document.getElementById('btn-copy-link');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var input = document.getElementById('share-link-value');
    if (!input || !input.value) return;
    var copyFn = MG.copyToClipboard || function (t) { return navigator.clipboard.writeText(t); };
    copyFn(input.value).then(function () {
      _toast('✅ Link copied!');
      if (window.MianGlow.Analytics) window.MianGlow.Analytics.greetingShared('copy', state.type);
    }).catch(function () { _toast('Could not copy — select the link and copy manually.'); });
  });

  /* WhatsApp */
  var waBtn = document.getElementById('btn-whatsapp');
  if (waBtn) waBtn.addEventListener('click', function () {
    var input = document.getElementById('share-link-value');
    if (!input || !input.value) return;
    if (MG.shareWhatsApp) MG.shareWhatsApp(input.value, state.recipient.trim());
    if (window.MianGlow.Analytics) window.MianGlow.Analytics.greetingShared('whatsapp', state.type);
  });

  /* Native share */
  var nativeBtn = document.getElementById('btn-native-share');
  if (nativeBtn) nativeBtn.addEventListener('click', function () {
    var input = document.getElementById('share-link-value');
    if (!input || !input.value) return;
    if (MG.nativeShare) MG.nativeShare(input.value, state.recipient.trim());
    if (window.MianGlow.Analytics) window.MianGlow.Analytics.greetingShared('native', state.type);
  });

  /* Download */
  var dlBtn = document.getElementById('btn-download');
  if (dlBtn) dlBtn.addEventListener('click', function () {
    if (typeof MG.generateDownload !== 'function') { _toast('Download not available.'); return; }
    dlBtn.disabled = true;
    dlBtn.textContent = 'Generating…';
    setTimeout(function () {
      try {
        var html = MG.generateDownload(state);
        var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href   = url;
        a.download = 'happy-birthday-' + (state.recipient.trim().toLowerCase().replace(/\s+/g, '-') || 'greeting') + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        _toast('📥 Greeting downloaded!');
        if (window.MianGlow.Analytics) window.MianGlow.Analytics.greetingDownloaded(state.type, state.theme);
      } catch (e) {
        _toast('Download failed. Please try again.');
        console.error(e);
      }
      dlBtn.disabled = false;
      dlBtn.textContent = 'Download';
    }, 50);
  });

  /* ============================================================
     TOAST
  ============================================================ */
  var toastEl = document.getElementById('toast');
  var toastTm;

  function _toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTm);
    toastTm = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* ============================================================
     INIT
  ============================================================ */
  goTo(1);
  _updatePreview();

})();

/* ============================================
   MianGlow — animations/name-reveal.js
   Cinematic glowing name reveal using Canvas 2D
   ============================================ */
'use strict';

window.MianGlow = window.MianGlow || {};
window.MianGlow.animations = window.MianGlow.animations || {};

window.MianGlow.animations.NameReveal = (function () {

  /**
   * @param {HTMLElement} container  — element to inject canvas into
   * @param {string}      name       — recipient name
   * @param {string}      theme      — 'golden'|'dreamy'|'party'|'neon'
   * @param {Function}    onComplete — called when animation finishes
   */
  function NameReveal(container, name, theme, onComplete) {
    this.container  = container;
    this.name       = name  || '';
    this.theme      = theme || 'golden';
    this.onComplete = onComplete || function () {};
    this.canvas     = null;
    this.ctx        = null;
    this.frame      = 0;
    this.raf        = null;
    this.done       = false;
    this.particles  = [];
  }

  /* Theme colour maps */
  var THEME_COLORS = {
    golden: { primary: '#FFD700', secondary: '#D4A017', glow: 'rgba(212,160,23,', text: '#FFF8F0' },
    dreamy:  { primary: '#FFB3E8', secondary: '#FF69B4', glow: 'rgba(255,105,180,', text: '#FFF0FF' },
    party:   { primary: '#FFE500', secondary: '#FF4B8A', glow: 'rgba(255,229,0,',   text: '#FFFFFF' },
    neon:    { primary: '#00F5FF', secondary: '#BF00FF', glow: 'rgba(0,245,255,',   text: '#E0FFFF' }
  };

  var TOTAL_FRAMES = 120; // 2s at 60fps

  NameReveal.prototype.start = function () {
    var self = this;

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    this.container.style.position = 'relative';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', function () { self._resize(); });

    this._spawnParticles();
    this._loop();
  };

  NameReveal.prototype._resize = function () {
    var rect = this.container.getBoundingClientRect();
    this.canvas.width  = rect.width  || 400;
    this.canvas.height = rect.height || 300;
  };

  NameReveal.prototype._spawnParticles = function () {
    var c = THEME_COLORS[this.theme] || THEME_COLORS.golden;
    var count = 40;
    for (var i = 0; i < count; i++) {
      this.particles.push({
        x:    this.canvas.width  * (0.1 + Math.random() * 0.8),
        y:    this.canvas.height * (0.2 + Math.random() * 0.6),
        size: 1 + Math.random() * 3,
        vx:   (Math.random() - 0.5) * 0.6,
        vy:   -(0.3 + Math.random() * 0.8),
        alpha:  Math.random(),
        color: Math.random() > 0.5 ? c.primary : c.secondary,
        life:  40 + Math.random() * 80,
        maxLife: 120
      });
    }
  };

  NameReveal.prototype._loop = function () {
    var self = this;
    if (this.done) return;

    var ctx   = this.ctx;
    var w     = this.canvas.width;
    var h     = this.canvas.height;
    var f     = this.frame;
    var c     = THEME_COLORS[this.theme] || THEME_COLORS.golden;

    ctx.clearRect(0, 0, w, h);

    // ---- Phase 1 (0–40): glow builds from centre ----
    // ---- Phase 2 (40–80): name fades + scales in ----
    // ---- Phase 3 (80–120): particles scatter, hold ----

    var progress = Math.min(f / TOTAL_FRAMES, 1);

    // Radial glow
    var glowAlpha = Math.min(progress * 2, 1) * 0.5;
    var glowR     = w * 0.15 + w * 0.35 * easeOut(Math.min(f / 60, 1));
    var grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, glowR);
    grad.addColorStop(0,   c.glow + glowAlpha + ')');
    grad.addColorStop(0.5, c.glow + (glowAlpha * 0.4) + ')');
    grad.addColorStop(1,   c.glow + '0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Name text
    var textProgress = Math.max(0, (f - 30) / 50);
    if (textProgress > 0) {
      var tp      = easeSpring(Math.min(textProgress, 1));
      var alpha   = Math.min(textProgress * 2, 1);
      var scale   = 0.5 + tp * 0.5;
      var fontSize = Math.min(w / (this.name.length * 0.65 + 1), h * 0.28);
      fontSize = Math.max(fontSize, 28);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.translate(-w / 2, -h / 2);

      // Glow layers
      ctx.font = 'bold ' + fontSize + 'px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      var glowLayers = [
        { blur: 32, alpha: 0.4 * alpha },
        { blur: 16, alpha: 0.5 * alpha },
        { blur: 8,  alpha: 0.7 * alpha }
      ];
      glowLayers.forEach(function (g) {
        ctx.shadowColor = c.primary;
        ctx.shadowBlur  = g.blur;
        ctx.globalAlpha = g.alpha;
        ctx.fillStyle   = c.primary;
        ctx.fillText(self.name, w / 2, h / 2);
      });

      // Solid text
      ctx.shadowBlur  = 0;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = c.text;
      ctx.fillText(this.name, w / 2, h / 2);

      ctx.restore();
    }

    // Particles
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var p = this.particles[i];
      p.x    += p.vx;
      p.y    += p.vy;
      p.life -= 1;
      var pa = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = pa * 0.8;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (p.life <= 0) {
        // Respawn while animating
        if (f < TOTAL_FRAMES) {
          this.particles.splice(i, 1, {
            x:    this.canvas.width  * (0.1 + Math.random() * 0.8),
            y:    this.canvas.height * (0.5 + Math.random() * 0.4),
            size: 1 + Math.random() * 2.5,
            vx:   (Math.random() - 0.5) * 0.5,
            vy:   -(0.2 + Math.random() * 0.7),
            alpha: Math.random(),
            color: Math.random() > 0.5 ? c.primary : c.secondary,
            life:  40 + Math.random() * 60,
            maxLife: 100
          });
        } else {
          this.particles.splice(i, 1);
        }
      }
    }

    this.frame++;

    if (f >= TOTAL_FRAMES + 20) {
      this.done = true;
      this.onComplete();
      return;
    }

    this.raf = requestAnimationFrame(function () { self._loop(); });
  };

  NameReveal.prototype.stop = function () {
    this.done = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  };

  /* ---- Easing helpers ---- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeSpring(t) {
    var c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  return NameReveal;
})();

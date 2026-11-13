/* ============================================
   MianGlow — animations/confetti.js
   High-quality confetti engine (Canvas 2D)
   ============================================ */
'use strict';

window.MianGlow = window.MianGlow || {};
window.MianGlow.animations = window.MianGlow.animations || {};

window.MianGlow.animations.Confetti = (function () {

  var THEME_PALETTES = {
    golden:   ['#FFD700','#D4A017','#F5C842','#FFF8F0','#FF6B6B','#4B9BFF'],
    dreamy:   ['#FFB3E8','#FF69B4','#E040FB','#FFF0FF','#FFD700','#B39DDB'],
    party:    ['#FF4B8A','#4BFF91','#FFE500','#4B9BFF','#FF6B6B','#BF00FF','#00F5FF'],
    neon:     ['#00F5FF','#BF00FF','#FF00AA','#E0FFFF','#FFD700','#80FF80'],
    vintage:  ['#F4A7B9','#C2185B','#FFD6E0','#FFFFFF','#FF69B4','#E91E63'],
    midnight: ['#90E0EF','#0096C7','#CAF0F8','#FFFFFF','#48CAE4','#023E8A'],
    tropical: ['#FFD166','#06D6A0','#FF6B6B','#FFFFFF','#4BFF91','#FFE500'],
    galaxy:   ['#C77DFF','#7B2FBE','#E0AAFF','#FFFFFF','#9D4EDD','#5A189A']
  };

  var SHAPES = ['rect', 'circle', 'ribbon'];

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {string} theme
   */
  function Confetti(canvas, theme) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.theme   = theme || 'golden';
    this.pieces  = [];
    this.raf     = null;
    this.running = false;
  }

  Confetti.prototype.burst = function (count, originX, originY) {
    count   = count   || 80;
    var w   = this.canvas.width;
    var h   = this.canvas.height;
    originX = (originX !== undefined) ? originX : w / 2;
    originY = (originY !== undefined) ? originY : h * 0.3;

    var palette = THEME_PALETTES[this.theme] || THEME_PALETTES.golden;

    for (var i = 0; i < count; i++) {
      var angle = (Math.random() * Math.PI * 2);
      var speed = 4 + Math.random() * 10;
      var maxLife = 100 + Math.random() * 80;
      this.pieces.push({
        x:       originX + (Math.random() - 0.5) * 60,
        y:       originY,
        w:       5 + Math.random() * 9,
        h:       4 + Math.random() * 7,
        r:       Math.random() * 360,
        vx:      Math.cos(angle) * speed,
        vy:      Math.sin(angle) * speed - 5,
        vr:      (Math.random() - 0.5) * 14,
        gravity: 0.25 + Math.random() * 0.15,
        drag:    0.97,
        color:   palette[Math.floor(Math.random() * palette.length)],
        shape:   SHAPES[Math.floor(Math.random() * SHAPES.length)],
        life:    maxLife,
        maxLife: maxLife,
        wobble:  Math.random() * Math.PI * 2,
        wSpeed:  0.08 + Math.random() * 0.06
      });
    }

    if (!this.running) this._loop();
  };

  Confetti.prototype.rain = function (rate) {
    // Continuous rain from top
    var self = this;
    rate = rate || 3;
    this._rainInterval = setInterval(function () {
      self.burst(rate, Math.random() * self.canvas.width, -10);
    }, 200);
    if (!this.running) this._loop();
  };

  Confetti.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this._rainInterval) clearInterval(this._rainInterval);
  };

  Confetti.prototype.clear = function () {
    this.stop();
    this.pieces = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  Confetti.prototype._loop = function () {
    var self = this;
    this.running = true;

    var ctx = this.ctx;
    var w   = this.canvas.width;
    var h   = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    for (var i = this.pieces.length - 1; i >= 0; i--) {
      var p = this.pieces[i];

      p.vy     += p.gravity;
      p.vx     *= p.drag;
      p.vy     *= p.drag;
      p.x      += p.vx;
      p.y      += p.vy;
      p.r      += p.vr;
      p.wobble += p.wSpeed;
      p.life   -= 1;

      var alpha = Math.max(0, p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r * Math.PI / 180);

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.shape === 'ribbon') {
        ctx.scale(1, Math.sin(p.wobble));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 4, p.w, p.h / 2);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      ctx.restore();

      if (p.life <= 0 || p.y > h + 30 || p.x < -50 || p.x > w + 50) {
        this.pieces.splice(i, 1);
      }
    }

    if (this.pieces.length > 0) {
      this.raf = requestAnimationFrame(function () { self._loop(); });
    } else {
      this.running = false;
    }
  };

  return Confetti;
})();

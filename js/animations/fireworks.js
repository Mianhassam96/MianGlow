/* ============================================
   MianGlow — animations/fireworks.js
   Canvas 2D fireworks engine
   ============================================ */
'use strict';

window.MianGlow = window.MianGlow || {};
window.MianGlow.animations = window.MianGlow.animations || {};

window.MianGlow.animations.Fireworks = (function () {

  var THEME_PALETTES = {
    golden: ['#FFD700','#FFA500','#FF6B6B','#FFFFFF','#F5C842'],
    dreamy:  ['#FFB3E8','#FF69B4','#E040FB','#B39DDB','#FFFFFF'],
    party:   ['#FF4B8A','#4BFF91','#FFE500','#4B9BFF','#FF6B6B','#FFFFFF'],
    neon:    ['#00F5FF','#BF00FF','#FF00AA','#80FF80','#FFFFFF']
  };

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {string} theme
   */
  function Fireworks(canvas, theme) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this.theme     = theme || 'golden';
    this.rockets   = [];
    this.particles = [];
    this.raf       = null;
    this.running   = false;
  }

  /* Launch a single burst at (x,y) */
  Fireworks.prototype.burst = function (x, y) {
    var palette = THEME_PALETTES[this.theme] || THEME_PALETTES.golden;
    var color   = palette[Math.floor(Math.random() * palette.length)];
    var count   = 50 + Math.floor(Math.random() * 40);

    for (var i = 0; i < count; i++) {
      var angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      var speed = 2 + Math.random() * 7;
      var maxLife = 50 + Math.random() * 40;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: color,
        trail: [],
        life: maxLife,
        maxLife: maxLife,
        size: 1.5 + Math.random() * 2.5,
        gravity: 0.08,
        drag:    0.95
      });
    }

    if (!this.running) this._loop();
  };

  /* Launch a rocket from bottom, burst at top */
  Fireworks.prototype.launchRocket = function (x) {
    var self   = this;
    var w      = this.canvas.width;
    var h      = this.canvas.height;
    x = (x !== undefined) ? x : w * (0.2 + Math.random() * 0.6);
    var targetY = h * (0.1 + Math.random() * 0.3);

    this.rockets.push({
      x: x, y: h,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(8 + Math.random() * 4),
      targetY: targetY,
      trail: [],
      color: '#FFFFFF',
      done: false
    });
    if (!this.running) this._loop();
  };

  /* Fire multiple rockets over time */
  Fireworks.prototype.show = function (count, duration) {
    var self     = this;
    count    = count    || 6;
    duration = duration || 4000;
    var interval = duration / count;
    for (var i = 0; i < count; i++) {
      (function (idx) {
        setTimeout(function () {
          self.launchRocket();
        }, idx * interval);
      })(i);
    }
  };

  Fireworks.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  };

  Fireworks.prototype.clear = function () {
    this.stop();
    this.particles = [];
    this.rockets   = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  Fireworks.prototype._loop = function () {
    var self = this;
    this.running = true;
    var ctx  = this.ctx;
    var w    = this.canvas.width;
    var h    = this.canvas.height;

    // Fade trail
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, w, h);

    // ---- Rockets ----
    for (var ri = this.rockets.length - 1; ri >= 0; ri--) {
      var r = this.rockets[ri];
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 12) r.trail.shift();

      // Draw trail
      for (var ti = 0; ti < r.trail.length; ti++) {
        ctx.save();
        ctx.globalAlpha = (ti / r.trail.length) * 0.5;
        ctx.fillStyle   = r.color;
        ctx.beginPath();
        ctx.arc(r.trail[ti].x, r.trail[ti].y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw rocket
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle   = r.color;
      ctx.shadowColor = r.color;
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.1; // slight decel

      if (r.y <= r.targetY || r.vy >= 0) {
        // Burst!
        this.burst(r.x, r.y);
        this.rockets.splice(ri, 1);
      }
    }

    // ---- Particles ----
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var p = this.particles[i];

      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 5) p.trail.shift();

      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x  += p.vx;
      p.y  += p.vy;
      p.life--;

      var alpha = Math.max(0, p.life / p.maxLife);

      // Trail
      for (var tj = 0; tj < p.trail.length; tj++) {
        ctx.save();
        ctx.globalAlpha = alpha * (tj / p.trail.length) * 0.4;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.trail[tj].x, p.trail[tj].y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Particle
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (p.life <= 0 || p.y > h + 20) this.particles.splice(i, 1);
    }

    if (this.particles.length > 0 || this.rockets.length > 0) {
      this.raf = requestAnimationFrame(function () { self._loop(); });
    } else {
      this.running = false;
      ctx.clearRect(0, 0, w, h);
    }
  };

  return Fireworks;
})();

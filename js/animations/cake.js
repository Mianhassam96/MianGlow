/* ============================================
   MianGlow — animations/cake.js
   Animated birthday cake with interactive candles
   ============================================ */
'use strict';

window.MianGlow = window.MianGlow || {};
window.MianGlow.animations = window.MianGlow.animations || {};

window.MianGlow.animations.Cake = (function () {

  var THEME_COLORS = {
    golden:   { cake: '#8B4513', frosting: '#FFD700', candle: '#FF6B6B', flame: '#FFD700', plate: '#D4A017' },
    dreamy:   { cake: '#9B4F7A', frosting: '#FFB3E8', candle: '#E040FB', flame: '#FFB3E8', plate: '#FF69B4' },
    party:    { cake: '#2E5B2E', frosting: '#80FF80', candle: '#FF4B8A', flame: '#FFE500', plate: '#4BFF91' },
    neon:     { cake: '#1A003D', frosting: '#00F5FF', candle: '#BF00FF', flame: '#00F5FF', plate: '#FF00AA' },
    vintage:  { cake: '#7B1A1A', frosting: '#F4A7B9', candle: '#C2185B', flame: '#FFD6E0', plate: '#C2185B' },
    midnight: { cake: '#001233', frosting: '#90E0EF', candle: '#0096C7', flame: '#CAF0F8', plate: '#0096C7' },
    tropical: { cake: '#1A3D2A', frosting: '#FFD166', candle: '#06D6A0', flame: '#FFE500', plate: '#06D6A0' },
    galaxy:   { cake: '#05003D', frosting: '#C77DFF', candle: '#7B2FBE', flame: '#E0AAFF', plate: '#7B2FBE' }
  };

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {string} theme
   * @param {Function} onBlown — called when all candles blown out
   */
  function Cake(canvas, theme, onBlown) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.theme    = theme || 'golden';
    this.onBlown  = onBlown || function () {};
    this.frame    = 0;
    this.raf      = null;
    this.blown    = false;
    this.candles  = [];
    this.sparks   = [];
    this._buildCandles();
  }

  Cake.prototype._buildCandles = function () {
    var count = 5;
    for (var i = 0; i < count; i++) {
      this.candles.push({ lit: true, flicker: Math.random() * Math.PI * 2 });
    }
  };

  Cake.prototype.start = function () {
    var self = this;
    this._resize();
    this._loop();

    // Touch/click to blow
    this.canvas.style.cursor = 'pointer';
    this._clickHandler = function () { self.blowOut(); };
    this.canvas.addEventListener('click',     this._clickHandler);
    this.canvas.addEventListener('touchstart', this._clickHandler, { passive: true });
  };

  Cake.prototype._resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    this.canvas.width  = rect.width  || 300;
    this.canvas.height = rect.height || 300;
  };

  Cake.prototype.blowOut = function () {
    if (this.blown) return;
    this.blown = true;
    var self = this;
    // Blow candles one by one
    this.candles.forEach(function (c, i) {
      setTimeout(function () {
        c.lit = false;
        self._spawnSmoke(i);
      }, i * 120);
    });
    setTimeout(function () { self.onBlown(); }, this.candles.length * 120 + 300);
  };

  Cake.prototype._spawnSmoke = function (candleIdx) {
    var w = this.canvas.width;
    var cakeTop = this.canvas.height * 0.42;
    var spacing = w / (this.candles.length + 1);
    var cx = spacing * (candleIdx + 1);
    for (var i = 0; i < 8; i++) {
      this.sparks.push({
        x: cx, y: cakeTop - 60,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(0.5 + Math.random() * 1.5),
        alpha: 0.6, size: 3 + Math.random() * 4,
        smoke: true
      });
    }
  };

  Cake.prototype._loop = function () {
    var self = this;
    var ctx  = this.ctx;
    var w    = this.canvas.width;
    var h    = this.canvas.height;
    var c    = THEME_COLORS[this.theme] || THEME_COLORS.golden;

    ctx.clearRect(0, 0, w, h);

    var t = this.frame / 60;

    // ---- Draw plate / shadow ----
    var plateY = h * 0.78;
    var plateRx = w * 0.38, plateRy = h * 0.04;
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(w / 2, plateY + 8, plateRx, plateRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ---- Draw cake body ----
    var cakeLeft  = w * 0.18;
    var cakeRight = w * 0.82;
    var cakeTop   = h * 0.42;
    var cakeBot   = h * 0.76;
    var cakeW     = cakeRight - cakeLeft;
    var cakeH     = cakeBot   - cakeTop;

    // Bottom tier
    _roundRect(ctx, cakeLeft, cakeTop + cakeH * 0.4, cakeW, cakeH * 0.6, 10, c.cake);

    // Top tier (slightly narrower)
    var topPad = cakeW * 0.08;
    _roundRect(ctx, cakeLeft + topPad, cakeTop, cakeW - topPad * 2, cakeH * 0.45, 10, c.cake);

    // Frosting drips
    _drawFrosting(ctx, cakeLeft, cakeTop, cakeW, c.frosting);
    _drawFrosting(ctx, cakeLeft + topPad, cakeTop - 2, cakeW - topPad * 2, c.frosting);

    // Decoration dots
    ctx.fillStyle = c.frosting;
    ctx.globalAlpha = 0.7;
    var dotY = cakeTop + cakeH * 0.65;
    for (var d = 0; d < 5; d++) {
      ctx.beginPath();
      ctx.arc(cakeLeft + 20 + d * (cakeW - 30) / 4, dotY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ---- Draw candles ----
    var spacing = cakeW / (this.candles.length + 1);
    for (var i = 0; i < this.candles.length; i++) {
      var cx = cakeLeft + spacing * (i + 1);
      var cy = cakeTop - 2;
      _drawCandle(ctx, cx, cy, c.candle, this.candles[i], t, i);
    }

    // ---- Sparks / smoke ----
    for (var s = this.sparks.length - 1; s >= 0; s--) {
      var sp = this.sparks[s];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha -= 0.015;
      if (sp.smoke) {
        ctx.save();
        ctx.globalAlpha = sp.alpha * 0.5;
        ctx.fillStyle   = '#aaa';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (sp.alpha <= 0) this.sparks.splice(s, 1);
    }

    // ---- Hint text ----
    if (!this.blown) {
      ctx.save();
      ctx.globalAlpha = 0.4 + 0.2 * Math.sin(t * 2);
      ctx.fillStyle   = '#fff';
      ctx.font        = 'bold ' + Math.round(w * 0.045) + 'px Inter, sans-serif';
      ctx.textAlign   = 'center';
      ctx.fillText('Tap to blow out the candles!', w / 2, h * 0.92);
      ctx.restore();
    } else {
      var allOut = this.candles.every(function (c) { return !c.lit; });
      if (allOut) {
        ctx.save();
        ctx.globalAlpha = 0.7 + 0.15 * Math.sin(t * 3);
        ctx.fillStyle   = c.frosting;
        ctx.font        = 'bold ' + Math.round(w * 0.055) + 'px Inter, sans-serif';
        ctx.textAlign   = 'center';
        ctx.fillText('🎉 Make a wish!', w / 2, h * 0.92);
        ctx.restore();
      }
    }

    this.frame++;
    this.raf = requestAnimationFrame(function () { self._loop(); });
  };

  Cake.prototype.stop = function () {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this._clickHandler) {
      this.canvas.removeEventListener('click',     this._clickHandler);
      this.canvas.removeEventListener('touchstart', this._clickHandler);
    }
  };

  /* ---- Helpers ---- */
  function _roundRect(ctx, x, y, w, h, r, color) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function _drawFrosting(ctx, x, y, w, color) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y + 14);
    var drips = 8;
    var step  = w / drips;
    for (var i = 0; i <= drips; i++) {
      var dx = x + i * step;
      if (i % 2 === 0) {
        ctx.quadraticCurveTo(dx - step / 2, y + 22, dx, y + 14);
      } else {
        ctx.quadraticCurveTo(dx - step / 2, y + 2, dx, y + 14);
      }
    }
    ctx.lineTo(x + w, y);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function _drawCandle(ctx, cx, cy, color, candle, t, idx) {
    var cW = 10, cH = 32;
    // Candle body
    ctx.fillStyle = color;
    ctx.fillRect(cx - cW / 2, cy - cH, cW, cH);
    // Wick
    ctx.strokeStyle = '#333';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - cH);
    ctx.lineTo(cx, cy - cH - 6);
    ctx.stroke();

    if (candle.lit) {
      // Flame
      var flicker = Math.sin(t * 8 + candle.flicker + idx) * 2;
      var fy      = cy - cH - 6;
      ctx.save();
      ctx.globalAlpha = 0.9;
      // Outer glow
      var grd = ctx.createRadialGradient(cx + flicker, fy - 8, 1, cx + flicker, fy - 4, 18);
      grd.addColorStop(0, 'rgba(255,220,50,0.9)');
      grd.addColorStop(0.4, 'rgba(255,140,0,0.5)');
      grd.addColorStop(1, 'rgba(255,80,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(cx + flicker, fy - 6, 10, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      // Inner flame shape
      ctx.fillStyle = '#FFF5A0';
      ctx.beginPath();
      ctx.moveTo(cx + flicker, fy - 18);
      ctx.bezierCurveTo(cx + flicker + 5, fy - 10, cx + flicker + 4, fy - 2, cx + flicker, fy);
      ctx.bezierCurveTo(cx + flicker - 4, fy - 2, cx + flicker - 5, fy - 10, cx + flicker, fy - 18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  return Cake;
})();

/* ============================================
   MianGlow — animations/balloons.js
   Floating balloon animation (CSS + DOM)
   ============================================ */
'use strict';

window.MianGlow = window.MianGlow || {};
window.MianGlow.animations = window.MianGlow.animations || {};

window.MianGlow.animations.Balloons = (function () {

  var THEME_BALLOONS = {
    golden:   ['🎈','🎈','🎀','🌟','✨'],
    dreamy:   ['🎈','💖','🎀','💜','🌸'],
    party:    ['🎈','🎊','🎉','🎈','🌈'],
    neon:     ['💜','🎆','⚡','🔵','🟣'],
    vintage:  ['🌹','🎀','🌷','💕','🎈'],
    midnight: ['🌊','💙','⭐','🌙','🎈'],
    tropical: ['🌴','🌺','🌈','🎈','🍍'],
    galaxy:   ['🌌','⭐','💫','🔮','🌠']
  };

  /**
   * @param {HTMLElement} container  — element to inject balloons into
   * @param {string}      theme
   * @param {number}      count
   */
  function Balloons(container, theme, count) {
    this.container = container;
    this.theme     = theme || 'golden';
    this.count     = count || 10;
    this.nodes     = [];
    this._timers   = [];
  }

  Balloons.prototype.start = function () {
    var self    = this;
    var emojis  = THEME_BALLOONS[this.theme] || THEME_BALLOONS.golden;
    var delay   = 0;

    for (var i = 0; i < this.count; i++) {
      (function (idx, d) {
        var t = setTimeout(function () {
          self._launch(emojis[idx % emojis.length]);
        }, d);
        self._timers.push(t);
      })(i, delay);
      delay += 300 + Math.random() * 400;
    }
  };

  Balloons.prototype._launch = function (emoji) {
    var el = document.createElement('div');
    var duration = 7 + Math.random() * 6;
    var size     = 1.6 + Math.random() * 1.4;
    var left     = 3  + Math.random() * 92;
    var sway     = (Math.random() - 0.5) * 60;

    el.textContent = emoji;
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText =
      'position:absolute;' +
      'bottom:-80px;' +
      'left:' + left + '%;' +
      'font-size:' + size.toFixed(1) + 'rem;' +
      'animation:balloonFloat ' + duration.toFixed(1) + 's ease-in forwards;' +
      '--sway:' + sway.toFixed(0) + 'px;' +
      'pointer-events:none;' +
      'user-select:none;' +
      'will-change:transform;';

    this.container.appendChild(el);
    this.nodes.push(el);

    // Remove after animation
    var self = this;
    var t = setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      self.nodes = self.nodes.filter(function (n) { return n !== el; });
    }, (duration + 0.5) * 1000);
    this._timers.push(t);
  };

  Balloons.prototype.stop = function () {
    this._timers.forEach(function (t) { clearTimeout(t); });
    this._timers = [];
    this.nodes.forEach(function (n) {
      if (n.parentNode) n.parentNode.removeChild(n);
    });
    this.nodes = [];
  };

  return Balloons;
})();

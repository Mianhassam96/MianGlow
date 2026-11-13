/* ============================================
   MianGlow — music.js
   Optional background music using Web Audio API
   - Starts ONLY after a user gesture (browser policy)
   - Generates a soft birthday melody procedurally
     (no external files, no copyright issues)
   - Respects prefers-reduced-motion (also silences)
   ============================================ */
'use strict';

window.MianGlow = window.MianGlow || {};

window.MianGlow.Music = (function () {

  var AudioContext = window.AudioContext || window.webkitAudioContext;

  /* ---- Theme-matched tempo / mood ---- */
  var THEME_SETTINGS = {
    golden:   { tempo: 72,  base: 261.63, reverb: 0.6 }, // C4, slow & grand
    dreamy:   { tempo: 60,  base: 293.66, reverb: 0.8 }, // D4, slow & soft
    party:    { tempo: 108, base: 349.23, reverb: 0.3 }, // F4, upbeat
    neon:     { tempo: 90,  base: 329.63, reverb: 0.5 }, // E4, electronic feel
    vintage:  { tempo: 66,  base: 277.18, reverb: 0.7 }, // C#4, romantic
    midnight: { tempo: 60,  base: 311.13, reverb: 0.9 }, // Eb4, calm & deep
    tropical: { tempo: 96,  base: 349.23, reverb: 0.4 }, // F4, bright & warm
    galaxy:   { tempo: 54,  base: 246.94, reverb: 1.0 }  // B3, cosmic
  };

  /* Happy Birthday melody intervals (semitones from root) */
  var MELODY = [
  //  pitch  dur   note name
    [0,  0.5],  // G  "Hap-"
    [0,  0.5],  // G  "-py"
    [2,  1.0],  // A  "Birth-"
    [0,  1.0],  // G  "-day"
    [5,  1.0],  // C  "to"
    [4,  2.0],  // B  "you"
    [0,  0.5],  // G  "Hap-"
    [0,  0.5],  // G  "-py"
    [2,  1.0],  // A  "Birth-"
    [0,  1.0],  // G  "-day"
    [7,  1.0],  // D  "to"
    [5,  2.0],  // C  "you"
    [0,  0.5],  // G  "Hap-"
    [0,  0.5],  // G  "-py"
    [12, 1.0],  // G5 "Birth-"
    [9,  1.0],  // E  "-day"
    [5,  1.0],  // C  "dear"
    [4,  0.5],  // B  "[name]"
    [2,  2.0],  // A
    [10, 0.5],  // F  "Hap-"
    [10, 0.5],  // F  "-py"
    [9,  1.0],  // E  "Birth-"
    [5,  1.0],  // C  "-day"
    [7,  1.0],  // D  "to"
    [5,  3.0]   // C  "you"
  ];

  function semitoneToHz(root, semitones) {
    return root * Math.pow(2, semitones / 12);
  }

  /**
   * @param {string} theme
   * @param {boolean} loop
   */
  function Music(theme, loop) {
    this.theme   = theme  || 'golden';
    this.loop    = loop   !== undefined ? loop : true;
    this._ctx    = null;
    this._master = null;
    this._nodes  = [];
    this._playing = false;
    this._muted   = false;
  }

  Music.prototype.start = function () {
    if (!AudioContext) return; // Not supported
    if (this._playing) return;

    // Respect reduced-motion (also acts as "quiet mode")
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var self     = this;
    var settings = THEME_SETTINGS[this.theme] || THEME_SETTINGS.golden;
    var beatSec  = 60 / settings.tempo;

    this._ctx    = new AudioContext();
    this._master = this._ctx.createGain();
    this._master.gain.setValueAtTime(0.18, this._ctx.currentTime);
    this._master.connect(this._ctx.destination);

    this._playing = true;
    this._schedulemelody(settings, beatSec);
  };

  Music.prototype._schedulemelody = Music.prototype._schedulemelody || function () {};

  Music.prototype._schedulemelody = function (settings, beatSec) {
    var self    = this;
    var ctx     = this._ctx;
    var t       = ctx.currentTime + 0.1;

    MELODY.forEach(function (note) {
      var semitones = note[0];
      var duration  = note[1] * beatSec;
      var freq      = semitoneToHz(settings.base, semitones);

      var osc  = ctx.createOscillator();
      var env  = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Soft bell-like envelope
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.4, t + 0.04);
      env.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.9);

      osc.connect(env);
      env.connect(self._master);

      osc.start(t);
      osc.stop(t + duration);

      self._nodes.push(osc);
      t += duration;
    });

    // Loop
    if (this.loop) {
      var totalDur = MELODY.reduce(function (s, n) { return s + n[1]; }, 0) * beatSec;
      this._loopTimer = setTimeout(function () {
        if (self._playing && !self._muted) {
          self._nodes = [];
          self._schedulemelody(settings, beatSec);
        }
      }, (totalDur + 0.5) * 1000);
    }
  };

  // Fix typo alias
  Music.prototype._schedulemelody = Music.prototype._schedulemelody;

  Music.prototype.stop = function () {
    this._playing = false;
    clearTimeout(this._loopTimer);
    this._nodes.forEach(function (n) { try { n.stop(); } catch (e) {} });
    this._nodes = [];
    if (this._ctx) {
      try { this._ctx.close(); } catch (e) {}
      this._ctx = null;
    }
  };

  Music.prototype.mute = function () {
    this._muted = true;
    if (this._master) this._master.gain.setValueAtTime(0, this._ctx.currentTime);
  };

  Music.prototype.unmute = function () {
    this._muted = false;
    if (this._master) this._master.gain.setValueAtTime(0.18, this._ctx.currentTime);
  };

  Music.prototype.toggle = function () {
    if (this._muted) this.unmute(); else this.mute();
    return !this._muted;
  };

  Music.prototype.isSupported = function () {
    return !!AudioContext;
  };

  return Music;

})();

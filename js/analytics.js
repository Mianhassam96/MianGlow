/* ============================================
   MianGlow — analytics.js
   Privacy-friendly analytics via Plausible
   - No cookies, no personal data, GDPR compliant
   - Falls back silently if Plausible not loaded
   - Tracks the 4 north-star events from the roadmap:
     1. creator_start
     2. greeting_completed
     3. greeting_shared
     4. greeting_downloaded
   ============================================ */
'use strict';

window.MianGlow = window.MianGlow || {};

window.MianGlow.Analytics = (function () {

  /* ---- Internal track wrapper ---- */
  function _track(eventName, props) {
    // Plausible (https://plausible.io) custom event
    if (typeof window.plausible === 'function') {
      window.plausible(eventName, { props: props || {} });
    }

    // Also fire the internal CustomEvent (from app.js hooks)
    try {
      document.dispatchEvent(new CustomEvent('mianglow:track', {
        detail: { event: eventName, params: props || {} }
      }));
    } catch (e) {}
  }

  return {

    /* Called when user lands on creator page */
    creatorStart: function (celebType) {
      _track('Creator Start', { celebration: celebType || 'birthday' });
    },

    /* Called when user reaches step 5 (share page) */
    greetingCompleted: function (celebType, theme) {
      _track('Greeting Completed', {
        celebration: celebType || 'birthday',
        theme: theme || 'golden'
      });
    },

    /* Called when share link is copied */
    greetingShared: function (method, celebType) {
      _track('Greeting Shared', {
        method: method || 'copy',   // 'copy' | 'whatsapp' | 'native'
        celebration: celebType || 'birthday'
      });
    },

    /* Called when HTML download triggered */
    greetingDownloaded: function (celebType, theme) {
      _track('Greeting Downloaded', {
        celebration: celebType || 'birthday',
        theme: theme || 'golden'
      });
    },

    /* Called when recipient opens view.html */
    greetingOpened: function (celebType, theme) {
      _track('Greeting Opened', {
        celebration: celebType || 'birthday',
        theme: theme || 'golden'
      });
    },

    /* Called when recipient blows out candles */
    candlesBlown: function () {
      _track('Candles Blown');
    }

  };

})();

/* ---- Wire analytics into existing button events (non-invasive) ---- */
document.addEventListener('DOMContentLoaded', function () {
  var A = window.MianGlow.Analytics;
  if (!A) return;

  // Creator start
  if (window.location.pathname.indexOf('create') !== -1) {
    var params = new URLSearchParams(window.location.search);
    A.creatorStart(params.get('type') || 'birthday');
  }

  // Recipient opens greeting
  if (window.location.pathname.indexOf('view') !== -1) {
    var hash = window.location.hash.replace(/^#/, '');
    if (hash && window.MianGlow.deserialise) {
      var state = window.MianGlow.deserialise(hash);
      if (state) A.greetingOpened(state.type, state.theme);
    }
  }
});

/* ============================================
   MianGlow — share.js
   Share link building, compression, copy, WhatsApp
   ============================================ */
'use strict';

window.MianGlow = window.MianGlow || {};

/* ---- Build share URL (no photos — too large for URL) ---- */
window.MianGlow.buildShareURL = function (state) {
  var payload = {
    v:  1,                           // shorter key names reduce URL length
    t:  state.type      || 'birthday',
    r:  (state.recipient || '').trim(),
    s:  (state.sender    || '').trim(),
    m:  (state.message   || '').trim(),
    th: state.theme      || 'golden',
    fx: state.effects    || [],
    at: state.createdAt  || Date.now()
  };

  try {
    var json    = JSON.stringify(payload);
    var encoded = btoa(unescape(encodeURIComponent(json)));
    var base    = _viewerBase();
    var url     = base + '#' + encoded;

    // Warn if URL is very long (WhatsApp truncates at ~2000 chars)
    if (url.length > 1800) {
      console.warn('MianGlow: share URL is long (' + url.length + ' chars). Photos are excluded from links.');
    }

    return url;
  } catch (e) {
    console.error('MianGlow share.js: buildShareURL failed', e);
    return null;
  }
};

/* ---- Deserialise (supports both old and new key format) ---- */
window.MianGlow.deserialise = function (encoded) {
  try {
    var json  = decodeURIComponent(escape(atob(encoded)));
    var d     = JSON.parse(json);

    // Normalise short-key format → long-key
    if (d.v !== undefined && d.r !== undefined) {
      return {
        version:   d.v,
        type:      d.t  || 'birthday',
        recipient: d.r  || '',
        sender:    d.s  || '',
        message:   d.m  || '',
        theme:     d.th || 'golden',        effects:   d.fx || ['confetti','balloons','cake','nameReveal'],
        photos:    [],            // photos not in URL
        createdAt: d.at || 0
      };
    }

    // Legacy long-key format
    if (!d.version || !d.type) throw new Error('Invalid payload');
    return d;

  } catch (e) {
    console.warn('MianGlow share.js: deserialise failed', e);
    return null;
  }
};

/* ---- Copy to clipboard ---- */
window.MianGlow.copyToClipboard = function (text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older browsers
  return new Promise(function (resolve) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    resolve();
  });
};

/* ---- WhatsApp share ---- */
window.MianGlow.shareWhatsApp = function (url, recipientName) {
  var name = recipientName ? ' for ' + recipientName : '';
  var text = encodeURIComponent(
    '🎂 I made a birthday surprise' + name + ' on MianGlow!\n\n' +
    '✨ Open here: ' + url
  );
  window.open('https://wa.me/?text=' + text, '_blank', 'noopener,noreferrer');
};

/* ---- Native share (mobile) ---- */
window.MianGlow.nativeShare = function (url, recipientName) {
  if (!navigator.share) return false;
  navigator.share({
    title: 'Happy Birthday' + (recipientName ? ', ' + recipientName + '!' : '!'),
    text:  '🎂 I made you a birthday surprise on MianGlow ✨',
    url:   url
  }).catch(function () {});
  return true;
};

/* ---- URL length check ---- */
window.MianGlow.checkURLLength = function (url) {
  var len = url ? url.length : 0;
  return {
    length: len,
    ok:     len < 1800,
    warning: len >= 1200 && len < 1800,
    toolong: len >= 1800
  };
};

/* ---- Viewer base URL ---- */
function _viewerBase() {
  var loc  = window.location;
  var path = loc.pathname.replace(/\/[^/]*$/, '/');
  return loc.origin + path + 'view.html';
}

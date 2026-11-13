/* ============================================
   MianGlow — data-model.js
   State, validation, image resize
   share/export logic lives in share.js / export.js
   ============================================ */
'use strict';

window.MianGlow = window.MianGlow || {};
var MianGlow = window.MianGlow;

/* ---- Default celebration state ---- */
MianGlow.defaultState = function () {
  return {
    version:   1,
    type:      'birthday',
    recipient: '',
    sender:    '',
    message:   '',
    theme:     'golden',
    effects:   ['confetti', 'balloons', 'cake', 'nameReveal'],
    photos:    [],
    createdAt: Date.now()
  };
};

/* ---- Field validation ---- */
MianGlow.validate = function (state) {
  var errors = {};
  if (!state.recipient || state.recipient.trim().length === 0) {
    errors.recipient = 'Please enter the recipient\'s name.';
  } else if (state.recipient.trim().length > 40) {
    errors.recipient = 'Name must be 40 characters or fewer.';
  }
  if (state.message && state.message.length > 300) {
    errors.message = 'Message must be 300 characters or fewer.';
  }
  if (['golden', 'dreamy', 'party', 'neon'].indexOf(state.theme) === -1) {
    errors.theme = 'Please choose a theme.';
  }
  return { valid: Object.keys(errors).length === 0, errors: errors };
};

/* ---- Client-side image resize ---- */
MianGlow.resizeImage = function (file, maxDim, quality) {
  maxDim  = maxDim  || 600;
  quality = quality || 0.72;
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        var w = img.width, h = img.height;
        if (w > h) { if (w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; } }
        else        { if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/* ---- HTML escape ---- */
MianGlow.escapeHTML = function (str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/* ---- Serialise (legacy — kept for compatibility, share.js overrides buildShareURL) ---- */
MianGlow.serialise = function (state) {
  var payload = {
    v:  state.version || 1,
    t:  state.type    || 'birthday',
    r:  (state.recipient || '').trim(),
    s:  (state.sender    || '').trim(),
    m:  (state.message   || '').trim(),
    th: state.theme   || 'golden',
    fx: state.effects || [],
    at: state.createdAt || Date.now()
  };
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch (e) {
    return null;
  }
};

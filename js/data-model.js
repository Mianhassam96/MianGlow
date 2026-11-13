/* ============================================
   MianGlow — data-model.js
   Celebration state, validation, serialisation
   ============================================ */
'use strict';

const MianGlow = window.MianGlow || {};
window.MianGlow = MianGlow;

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
    photos:    [],   // array of base64 strings (resized)
    createdAt: Date.now()
  };
};

MianGlow.state = MianGlow.defaultState();

/* ---- Validation ---- */
MianGlow.validate = function (state) {
  const errors = {};
  if (!state.recipient || state.recipient.trim().length === 0) {
    errors.recipient = 'Please enter the recipient\'s name.';
  } else if (state.recipient.trim().length > 40) {
    errors.recipient = 'Name must be 40 characters or fewer.';
  }
  if (state.message && state.message.length > 300) {
    errors.message = 'Message must be 300 characters or fewer.';
  }
  if (!['golden', 'dreamy', 'party', 'neon'].includes(state.theme)) {
    errors.theme = 'Please choose a theme.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

/* ---- Serialise to URL-safe string ---- */
MianGlow.serialise = function (state) {
  // Clone without photos (too large for URL)
  const payload = {
    version:   state.version,
    type:      state.type,
    recipient: state.recipient.trim(),
    sender:    state.sender.trim(),
    message:   state.message.trim(),
    theme:     state.theme,
    effects:   state.effects,
    createdAt: state.createdAt
  };
  try {
    const json    = JSON.stringify(payload);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded;
  } catch (e) {
    console.error('MianGlow: serialise failed', e);
    return null;
  }
};

/* ---- Deserialise from URL-safe string ---- */
MianGlow.deserialise = function (encoded) {
  try {
    const json  = decodeURIComponent(escape(atob(encoded)));
    const state = JSON.parse(json);
    if (!state.version || !state.type) throw new Error('Invalid payload');
    return state;
  } catch (e) {
    console.warn('MianGlow: deserialise failed', e);
    return null;
  }
};

/* ---- Build share URL ---- */
MianGlow.buildShareURL = function (state) {
  const encoded = MianGlow.serialise(state);
  if (!encoded) return null;
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  return base + 'view.html#' + encoded;
};

/* ---- Client-side image resize ---- */
MianGlow.resizeImage = function (file, maxDim, quality) {
  maxDim   = maxDim   || 600;
  quality  = quality  || 0.72;
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; } }
        else        { if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; } }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/* ---- Generate standalone HTML download ---- */
MianGlow.generateDownload = function (state) {
  const photosJSON = JSON.stringify(state.photos);
  const stateJSON  = JSON.stringify({
    version:   state.version,
    type:      state.type,
    recipient: state.recipient,
    sender:    state.sender,
    message:   state.message,
    theme:     state.theme,
    effects:   state.effects,
    createdAt: state.createdAt
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Happy Birthday, ${MianGlow.escapeHTML(state.recipient)}! ✨</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#0a0800;color:#fff;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow-x:hidden}
.scene{position:relative;width:100%;max-width:500px;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;padding:2rem;text-align:center}
canvas#bg-canvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}
.content{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:1.5rem;width:100%}
.cake-emoji{font-size:4rem;animation:bounce 2s ease-in-out infinite;filter:drop-shadow(0 0 20px rgba(212,160,23,.5))}
.name-display{font-family:Georgia,serif;font-size:clamp(2.5rem,8vw,4.5rem);font-weight:700;background:linear-gradient(135deg,#D4A017,#FFD700,#F7E7CE);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 24px rgba(212,160,23,.6));animation:glow 3s ease-in-out infinite}
.message{font-size:1.1rem;color:rgba(255,255,255,.8);line-height:1.7;max-width:380px}
.sender{font-size:.9rem;color:rgba(255,255,255,.45);font-style:italic;margin-top:-.5rem}
.photos-row{display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center;margin-top:.5rem}
.photos-row img{width:80px;height:80px;object-fit:cover;border-radius:.75rem;border:2px solid rgba(212,160,23,.4);box-shadow:0 0 16px rgba(212,160,23,.2)}
.replay-btn{margin-top:1rem;background:rgba(212,160,23,.15);border:1px solid rgba(212,160,23,.4);color:#FFD700;padding:.6rem 1.8rem;border-radius:9999px;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .2s}
.replay-btn:hover{background:rgba(212,160,23,.25)}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes glow{0%,100%{filter:drop-shadow(0 0 12px rgba(212,160,23,.4))}50%{filter:drop-shadow(0 0 32px rgba(212,160,23,.8))}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.content > *{animation:fadeUp .7s ease both}
.cake-emoji{animation-delay:.1s}
.name-display{animation-delay:.4s}
.message{animation-delay:.7s}
.sender{animation-delay:.9s}
.photos-row{animation-delay:1.1s}
.replay-btn{animation-delay:1.3s}
</style>
</head>
<body>
<canvas id="bg-canvas"></canvas>
<div class="scene">
<div class="content">
<div class="cake-emoji">🎂</div>
<div class="name-display" id="nameEl"></div>
<div class="message" id="msgEl"></div>
<div class="sender" id="senderEl"></div>
<div class="photos-row" id="photosEl"></div>
<button class="replay-btn" onclick="startEffects()">↺ Replay</button>
</div>
</div>
<script>
var STATE  = ${stateJSON};
var PHOTOS = ${photosJSON};
var nameEl   = document.getElementById('nameEl');
var msgEl    = document.getElementById('msgEl');
var senderEl = document.getElementById('senderEl');
var photosEl = document.getElementById('photosEl');
nameEl.textContent   = STATE.recipient || '';
msgEl.textContent    = STATE.message   || 'Happy Birthday! 🎉';
senderEl.textContent = STATE.sender    ? '— with love from ' + STATE.sender : '';
PHOTOS.forEach(function(src){
  var img = document.createElement('img');
  img.src = src; img.alt = '';
  photosEl.appendChild(img);
});
/* Confetti canvas */
var canvas = document.getElementById('bg-canvas');
var ctx    = canvas.getContext('2d');
var pieces = [];
function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);
function randomColor(){ var c=['#FFD700','#FF4B8A','#4B9BFF','#FF6B6B','#80FF80','#BF00FF']; return c[Math.floor(Math.random()*c.length)]; }
function startEffects(){
  pieces = [];
  for(var i=0;i<120;i++){
    pieces.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height-canvas.height,
      w:6+Math.random()*6, h:6+Math.random()*6, r:Math.random()*360,
      vy:2+Math.random()*4, vx:(Math.random()-.5)*2, vr:(Math.random()-.5)*8,
      color:randomColor() });
  }
}
function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(var i=pieces.length-1;i>=0;i--){
    var p=pieces[i];
    p.y+=p.vy; p.x+=p.vx; p.r+=p.vr;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r*Math.PI/180);
    ctx.fillStyle=p.color; ctx.globalAlpha=.85;
    ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
    ctx.restore();
    if(p.y>canvas.height+20) pieces.splice(i,1);
  }
  requestAnimationFrame(loop);
}
startEffects(); loop();
<\/script>
</body>
</html>`;
};

/* ---- HTML escape helper ---- */
MianGlow.escapeHTML = function (str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/* ============================================
   MianGlow — export.js
   Standalone HTML birthday greeting generator
   ============================================ */
'use strict';

window.MianGlow = window.MianGlow || {};

window.MianGlow.generateDownload = function (state) {

  var photos    = state.photos || [];
  var theme     = state.theme  || 'golden';
  var recipient = window.MianGlow.escapeHTML(state.recipient || '');
  var sender    = window.MianGlow.escapeHTML(state.sender    || '');
  var message   = window.MianGlow.escapeHTML(
    (state.message && state.message.trim())
      ? state.message
      : 'Wishing you an incredible birthday full of joy, laughter, and all the things you love! 🎉'
  );

  /* Theme-specific colours embedded in download */
  var THEMES = {
    golden: { bg: 'linear-gradient(160deg,#0a0800,#1a1200,#2d2000)', name: '#FFD700', glow: 'rgba(212,160,23,.6)', msg: 'rgba(255,248,240,.85)', cake: '🎂', accent: '#D4A017' },
    dreamy:  { bg: 'linear-gradient(160deg,#0f0a1a,#1a0d1a,#2d1a35)', name: '#FFB3E8', glow: 'rgba(255,105,180,.6)', msg: 'rgba(255,240,255,.85)', cake: '🎀', accent: '#FF69B4' },
    party:   { bg: 'linear-gradient(160deg,#0a0a15,#0d0d20,#1a1a35)', name: '#FFE500', glow: 'rgba(255,229,0,.6)',   msg: 'rgba(255,255,255,.85)', cake: '🎊', accent: '#FF4B8A' },
    neon:    { bg: 'linear-gradient(160deg,#060012,#0d001a,#1a003d)', name: '#00F5FF', glow: 'rgba(0,245,255,.7)',  msg: 'rgba(224,255,255,.85)', cake: '⚡', accent: '#BF00FF' }
  };
  var t = THEMES[theme] || THEMES.golden;

  /* Inline photos as <img> tags */
  var photosHTML = '';
  if (photos.length > 0) {
    photosHTML = '<div class="photos">';
    photos.forEach(function (src) {
      photosHTML += '<img src="' + src + '" alt="" loading="lazy"/>';
    });
    photosHTML += '</div>';
  }

  /* Palette for confetti */
  var PALETTES = {
    golden: ["'#FFD700'","'#D4A017'","'#FF6B6B'","'#4B9BFF'","'#FFF8F0'"],
    dreamy:  ["'#FFB3E8'","'#FF69B4'","'#E040FB'","'#FFD700'","'#FFF0FF'"],
    party:   ["'#FF4B8A'","'#4BFF91'","'#FFE500'","'#4B9BFF'","'#FF6B6B'"],
    neon:    ["'#00F5FF'","'#BF00FF'","'#FF00AA'","'#80FF80'","'#E0FFFF'"]
  };
  var palette = PALETTES[theme] || PALETTES.golden;

  return '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'<meta charset="UTF-8"/>\n' +
'<meta name="viewport" content="width=device-width,initial-scale=1.0"/>\n' +
'<title>Happy Birthday, ' + recipient + '! \u2728</title>\n' +
'<style>\n' +
'*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n' +
'html,body{height:100%}\n' +
'body{font-family:"Segoe UI",system-ui,sans-serif;background:' + t.bg + ';color:#fff;min-height:100vh;overflow-x:hidden;display:flex;align-items:center;justify-content:center;}\n' +
'canvas#fx{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;}\n' +
'.wrap{position:relative;z-index:1;max-width:520px;width:100%;margin:0 auto;padding:2rem 1.5rem 4rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:1.5rem;}\n' +
'.cake{font-size:clamp(3.5rem,10vw,5.5rem);cursor:pointer;animation:bounce 2s ease-in-out infinite;filter:drop-shadow(0 0 20px ' + t.glow + ');-webkit-tap-highlight-color:transparent;transition:transform .15s;}\n' +
'.cake:active{transform:scale(.88);}\n' +
'.name{font-family:Georgia,serif;font-size:clamp(2.2rem,8vw,4rem);font-weight:700;color:' + t.name + ';text-shadow:0 0 24px ' + t.glow + ',0 0 48px ' + t.glow.replace('.6','0.3') + ';animation:glow 3s ease-in-out infinite;word-break:break-word;}\n' +
'.msg{font-size:clamp(.95rem,2.5vw,1.1rem);color:' + t.msg + ';line-height:1.75;max-width:400px;padding:1.25rem 1.5rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:1rem;font-style:italic;}\n' +
'.from{font-size:.85rem;color:rgba(255,255,255,.4);font-style:italic;}\n' +
'.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;width:100%;max-width:360px;}\n' +
'.photos img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:.75rem;border:2px solid rgba(255,255,255,.1);}\n' +
'.replay{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);color:#fff;padding:.6rem 2rem;border-radius:9999px;font-size:.9rem;font-weight:600;cursor:pointer;margin-top:.5rem;transition:background .2s;}\n' +
'.replay:hover{background:rgba(255,255,255,.14);}\n' +
'.hint{font-size:.75rem;color:rgba(255,255,255,.3);animation:fadeIn 2s ease 1s both;}\n' +
'.blown{font-size:3rem;animation:popIn .4s cubic-bezier(.34,1.56,.64,1) both;}\n' +
'@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}\n' +
'@keyframes glow{0%,100%{text-shadow:0 0 16px ' + t.glow + '}50%{text-shadow:0 0 32px ' + t.glow + ',0 0 64px ' + t.glow.replace('.6','0.3') + '}}\n' +
'@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}\n' +
'@keyframes fadeIn{from{opacity:0}to{opacity:1}}\n' +
'@keyframes popIn{from{transform:scale(0)}to{transform:scale(1)}}\n' +
'.wrap>*{animation:fadeUp .7s ease both;}\n' +
'.wrap>*:nth-child(1){animation-delay:.1s}\n' +
'.wrap>*:nth-child(2){animation-delay:.4s}\n' +
'.wrap>*:nth-child(3){animation-delay:.8s}\n' +
'.wrap>*:nth-child(4){animation-delay:1s}\n' +
'.wrap>*:nth-child(5){animation-delay:1.2s}\n' +
'.wrap>*:nth-child(6){animation-delay:1.5s}\n' +
'@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<canvas id="fx"></canvas>\n' +
'<div class="wrap">\n' +
'  <div class="cake" id="cakeEl" role="button" tabindex="0" aria-label="Tap to blow out the candles">' + t.cake + '</div>\n' +
'  <div class="name">' + recipient + '</div>\n' +
'  <div class="msg">' + message + '</div>\n' +
(sender ? '  <div class="from">\u2014 with love from ' + sender + '</div>\n' : '') +
photosHTML + '\n' +
'  <button class="replay" onclick="replay()">&#8635; Replay</button>\n' +
'  <div class="hint">Tap the ' + t.cake + ' to blow out the candles!</div>\n' +
'</div>\n' +
'<script>\n' +
'(function(){\n' +
'"use strict";\n' +
'var PALETTE=[' + palette.join(',') + '];\n' +
'var canvas=document.getElementById("fx");\n' +
'var ctx=canvas.getContext("2d");\n' +
'var pieces=[];\n' +
'var blown=false;\n' +
'function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}\n' +
'resize();\n' +
'window.addEventListener("resize",resize);\n' +
'function rnd(a,b){return a+Math.random()*(b-a);}\n' +
'function col(){return PALETTE[Math.floor(Math.random()*PALETTE.length)];}\n' +
'function burst(n,ox,oy){\n' +
'  ox=ox||canvas.width/2; oy=oy||canvas.height*0.35;\n' +
'  for(var i=0;i<(n||80);i++){\n' +
'    var a=Math.random()*Math.PI*2,sp=rnd(3,11),life=rnd(80,150);\n' +
'    pieces.push({x:ox+(Math.random()-.5)*60,y:oy,w:rnd(5,10),h:rnd(4,8),r:Math.random()*360,\n' +
'      vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-4,vr:rnd(-10,10),g:.22,drag:.96,\n' +
'      color:col(),life:life,max:life});\n' +
'  }\n' +
'}\n' +
'function loop(){\n' +
'  ctx.clearRect(0,0,canvas.width,canvas.height);\n' +
'  for(var i=pieces.length-1;i>=0;i--){\n' +
'    var p=pieces[i];\n' +
'    p.vy+=p.g;p.vx*=p.drag;p.vy*=p.drag;\n' +
'    p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life--;\n' +
'    var a=Math.max(0,p.life/p.max);\n' +
'    ctx.save();ctx.globalAlpha=a;ctx.translate(p.x,p.y);ctx.rotate(p.r*Math.PI/180);\n' +
'    ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);\n' +
'    ctx.restore();\n' +
'    if(p.life<=0||p.y>canvas.height+20)pieces.splice(i,1);\n' +
'  }\n' +
'  requestAnimationFrame(loop);\n' +
'}\n' +
'loop();\n' +
'burst(60);\n' +
'var cakeEl=document.getElementById("cakeEl");\n' +
'function blowCandles(){\n' +
'  if(blown)return; blown=true;\n' +
'  cakeEl.classList.remove("cake");\n' +
'  cakeEl.innerHTML=\'<div class="blown">\u2728</div>\';\n' +
'  burst(100);\n' +
'  document.querySelector(".hint").textContent="\uD83C\uDF89 Make a wish!";\n' +
'}\n' +
'cakeEl.addEventListener("click",blowCandles);\n' +
'cakeEl.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" ")blowCandles();});\n' +
'window.replay=function(){\n' +
'  blown=false;\n' +
'  cakeEl.className="cake";\n' +
'  cakeEl.innerHTML="' + t.cake + '";\n' +
'  document.querySelector(".hint").textContent="Tap the ' + t.cake + ' to blow out the candles!";\n' +
'  burst(80);\n' +
'};\n' +
'}());\n' +
'<\/script>\n' +
'</body>\n' +
'</html>';
};

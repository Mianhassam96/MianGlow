/* ============================================
   MianGlow — celebrations.js
   Celebration type definitions
   Extends the platform beyond birthdays
   ============================================ */
'use strict';

window.MianGlow = window.MianGlow || {};

window.MianGlow.CELEBRATIONS = {

  birthday: {
    id:          'birthday',
    label:       'Birthday',
    emoji:       '🎂',
    headline:    'Happy Birthday',
    defaultMsg:  'Wishing you an incredible birthday full of joy and all the things you love! 🎉',
    defaultTheme:'golden',
    defaultFx:   ['confetti','balloons','cake','nameReveal'],
    cakeEmoji:   '🎂',
    shareText:   '🎂 I made a birthday surprise for you on MianGlow!',
    titleTpl:    'Happy Birthday, {name}! ✨'
  },

  anniversary: {
    id:          'anniversary',
    label:       'Anniversary',
    emoji:       '💑',
    headline:    'Happy Anniversary',
    defaultMsg:  'Every moment with you is a gift. Here\'s to many more beautiful years together. 💕',
    defaultTheme:'dreamy',
    defaultFx:   ['confetti','balloons','nameReveal'],
    cakeEmoji:   '💍',
    shareText:   '💑 I made an anniversary surprise for you on MianGlow!',
    titleTpl:    'Happy Anniversary, {name}! 💕'
  },

  graduation: {
    id:          'graduation',
    label:       'Graduation',
    emoji:       '🎓',
    headline:    'Congratulations',
    defaultMsg:  'You did it! All that hard work paid off. The world is yours — go get it! 🌟',
    defaultTheme:'golden',
    defaultFx:   ['confetti','fireworks','nameReveal'],
    cakeEmoji:   '🎓',
    shareText:   '🎓 I made a graduation surprise for you on MianGlow!',
    titleTpl:    'Congratulations, {name}! 🎓'
  },

  eid: {
    id:          'eid',
    label:       'Eid Mubarak',
    emoji:       '🌙',
    headline:    'Eid Mubarak',
    defaultMsg:  'Eid Mubarak! May this blessed occasion bring you peace, joy and happiness. 🌙✨',
    defaultTheme:'galaxy',
    defaultFx:   ['confetti','balloons','fireworks','nameReveal'],
    cakeEmoji:   '🌙',
    shareText:   '🌙 I made an Eid surprise for you on MianGlow!',
    titleTpl:    'Eid Mubarak, {name}! 🌙'
  },

  christmas: {
    id:          'christmas',
    label:       'Christmas',
    emoji:       '🎄',
    headline:    'Merry Christmas',
    defaultMsg:  'Wishing you a magical Christmas filled with warmth, love and all the best things in life! 🎄',
    defaultTheme:'vintage',
    defaultFx:   ['confetti','balloons','fireworks','nameReveal'],
    cakeEmoji:   '🎄',
    shareText:   '🎄 I made a Christmas surprise for you on MianGlow!',
    titleTpl:    'Merry Christmas, {name}! 🎄'
  }

};

/* Helper — get celebration config */
window.MianGlow.getCelebration = function (type) {
  return window.MianGlow.CELEBRATIONS[type] || window.MianGlow.CELEBRATIONS.birthday;
};

/* Update default state based on celebration type */
window.MianGlow.applyDefaults = function (state) {
  var cel = window.MianGlow.getCelebration(state.type);
  if (!state.theme   || state.theme   === 'golden') state.theme   = cel.defaultTheme;
  if (!state.effects || state.effects.length === 0) state.effects = cel.defaultFx.slice();
  return state;
};

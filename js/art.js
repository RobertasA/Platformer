/* Hazelnut Hollow — art: every character is drawn in code (no image files).
   drawAvatar = the customisable child / human villagers. drawCreature = pets and animal folk. */
(function () {
  'use strict';
  const G = window.G, U = G.U, PI = Math.PI, TAU = PI * 2;

  /* ---------- tiny canvas helpers ---------- */
  const rr = G.rr = (c, x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };
  const circ = G.circ = (c, x, y, r, col) => { c.beginPath(); c.arc(x, y, r, 0, TAU); if (col) { c.fillStyle = col; c.fill(); } };
  const ell = G.ell = (c, x, y, rx, ry, col, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); if (col) { c.fillStyle = col; c.fill(); } };
  const poly = G.poly = (c, pts, col) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); if (col) { c.fillStyle = col; c.fill(); } };
  const shade = G.shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
    return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
  };
  const star = G.star = (c, x, y, r, col, pts = 5, rot = -PI / 2) => {
    c.beginPath();
    for (let i = 0; i < pts * 2; i++) { const a = rot + i * PI / pts, q = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    c.closePath(); if (col) { c.fillStyle = col; c.fill(); }
  };
  const heart = G.heart = (c, x, y, r, col) => {
    c.beginPath(); c.moveTo(x, y + r * 0.9);
    c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4);
    c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9);
    if (col) { c.fillStyle = col; c.fill(); }
  };
  G.emoji = (c, ch, x, y, size) => { c.font = size + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, x, y); };
  G.FONT = 'Fredoka, "Baloo 2", "Chalkboard SE", "Comic Sans MS", "Trebuchet MS", sans-serif';

  /* ---------- dress-up options (ids are stored in the save; labels shown in the wardrobe) ---------- */
  G.OPTS = {
    skin: ['#fde3cf', '#f6cfa6', '#e8b88a', '#c98f62', '#a06a43', '#6f4428', '#b7e3a1', '#c9b6ff'],
    hairCol: ['#2b2118', '#7a4a2a', '#b5651d', '#e8b04a', '#f6e27a', '#d9483b', '#ff8ac2', '#8a5cf6', '#4aa8ff', '#3fd08a', '#eeeeee'],
    hair: ['pigtails', 'long', 'bob', 'ponytail', 'braids', 'bun', 'curly', 'afro', 'short', 'spiky', 'none'],
    body: ['dress', 'tee', 'dungarees', 'robe', 'tutu', 'coat', 'suit', 'armour'],
    col: ['#ff5a72', '#ff7eb6', '#ff9f43', '#ffe066', '#7ed957', '#3fd08a', '#4fd1d9', '#4aa8ff', '#6c7bff', '#b77bff', '#8d5a3b', '#ffffff', '#3b3350', '#9aa3b5'],
    motif: ['none', 'heart', 'star', 'moon', 'flower', 'paw', 'cross', 'bolt', 'spots', 'stripes', 'rainbow'],
    hat: ['none', 'witch', 'wizard', 'crown', 'tiara', 'bow', 'flowers', 'catears', 'bunnyears', 'chef', 'nurse', 'explorer', 'pirate', 'knight', 'space', 'fire', 'detective', 'party', 'cap', 'antennae', 'unicorn', 'goldcrown'],
    back: ['none', 'cape', 'fairy', 'butterfly', 'beewings', 'dragonwings', 'backpack', 'cattail', 'rainbowcape'],
    held: ['none', 'wand', 'stethoscope', 'broom', 'magnifier', 'vetbag', 'teddy', 'balloon', 'brush', 'whisk', 'net', 'lantern', 'book', 'sword', 'umbrella', 'flower'],
    face: ['none', 'glasses', 'freckles', 'rosy', 'whiskers', 'mask', 'eyepatch', 'starpaint', 'moustache'],
    pet: ['none', 'cat', 'dog', 'bunny', 'owl', 'frog', 'hedgehog', 'fox', 'mouse', 'tuft', 'dragon', 'unicorn'],
  };
  /* items that must be earned (quest reward) or bought in the toy shop */
  G.LOCKED = { 'hat:goldcrown': 'finale', 'back:rainbowcape': 'shop', 'pet:dragon': 'quest', 'pet:unicorn': 'shop', 'pet:tuft': 'quest', 'hat:antennae': 'quest', 'back:beewings': 'quest', 'hat:detective': 'quest', 'hat:chef': 'quest', 'held:lantern': 'quest', 'back:dragonwings': 'shop', 'hat:unicorn': 'shop' };
  G.isOwned = key => !G.LOCKED[key] || (G.S && G.S.owned[key]);
  G.PRICE = { 'hat:unicorn': 8, 'back:dragonwings': 10, 'back:rainbowcape': 12, 'pet:unicorn': 15 };
  G.ITEM_NAME = { 'hat:unicorn': 'Unicorn horn', 'back:dragonwings': 'Dragon wings', 'back:rainbowcape': 'Rainbow cape', 'pet:unicorn': 'Baby unicorn', 'hat:chef': 'Chef hat', 'held:lantern': 'Night lantern', 'hat:antennae': 'Bug antennae', 'back:beewings': 'Bee wings', 'hat:detective': 'Detective hat', 'pet:tuft': 'Little Tuft' };
  G.UNLOCK_HINT = { 'hat:chef': 'Serve the customers at the café!', 'held:lantern': 'Tuck Mum in at Hush House!', 'hat:antennae': 'Find six bugs in Bugglemead!', 'back:beewings': 'Find all ten bugs in Bugglemead!', 'hat:detective': 'Crack the case in Teapot Tower!', 'pet:tuft': 'Find all six curios for Mr Tuft!', 'hat:goldcrown': 'Finish the whole adventure!' };
  G.lockHint = key => G.LOCKED[key] === 'shop' ? 'Pip sells this in the toy shop for ' + G.PRICE[key] + ' coins!' : G.UNLOCK_HINT[key] || 'Help a friend to win this!';
  /* win an item: owned + NEW badge in the wardrobe */
  G.unlock = key => { G.S.owned[key] = true; (G.S.fresh = G.S.fresh || {})[key] = true; };

  G.PRESETS = [
    { n: 'Witch', i: '🧙‍♀️', a: { body: 'robe', col1: '#6c4bd8', col2: '#ffe066', motif: 'moon', hat: 'witch', back: 'none', held: 'broom', pet: 'cat' } },
    { n: 'Vet', i: '🩺', a: { body: 'coat', col1: '#ffffff', col2: '#4fd1d9', motif: 'paw', hat: 'nurse', back: 'none', held: 'stethoscope', pet: 'dog' } },
    { n: 'Fairy', i: '🧚', a: { body: 'tutu', col1: '#ff7eb6', col2: '#b77bff', motif: 'star', hat: 'flowers', back: 'fairy', held: 'wand', pet: 'bunny' } },
    { n: 'Astronaut', i: '🚀', a: { body: 'suit', col1: '#ffffff', col2: '#ff9f43', motif: 'star', hat: 'space', back: 'backpack', held: 'none', pet: 'none' } },
    { n: 'Knight', i: '🛡️', a: { body: 'armour', col1: '#9aa3b5', col2: '#ff5a72', motif: 'cross', hat: 'knight', back: 'cape', held: 'sword', pet: 'none' } },
    { n: 'Pirate', i: '🏴‍☠️', a: { body: 'tee', col1: '#ff5a72', col2: '#3b3350', motif: 'stripes', hat: 'pirate', back: 'none', held: 'sword', face: 'eyepatch', pet: 'frog' } },
    { n: 'Chef', i: '👩‍🍳', a: { body: 'coat', col1: '#ffffff', col2: '#ff5a72', motif: 'none', hat: 'cap', back: 'none', held: 'whisk', pet: 'mouse' } },
    { n: 'Explorer', i: '🧭', a: { body: 'dungarees', col1: '#8d5a3b', col2: '#ffe066', motif: 'none', hat: 'explorer', back: 'backpack', held: 'magnifier', pet: 'owl' } },
    { n: 'Superhero', i: '🦸', a: { body: 'suit', col1: '#4aa8ff', col2: '#ff5a72', motif: 'bolt', hat: 'none', back: 'cape', held: 'none', face: 'mask', pet: 'none' } },
    { n: 'Princess', i: '👑', a: { body: 'dress', col1: '#b77bff', col2: '#ffe066', motif: 'heart', hat: 'crown', back: 'none', held: 'flower', pet: 'bunny' } },
    { n: 'Wizard', i: '🪄', a: { body: 'robe', col1: '#4aa8ff', col2: '#ffe066', motif: 'star', hat: 'wizard', back: 'none', held: 'wand', pet: 'owl' } },
    { n: 'Bug Hunter', i: '🐞', a: { body: 'dungarees', col1: '#7ed957', col2: '#ff5a72', motif: 'spots', hat: 'bow', back: 'backpack', held: 'net', pet: 'hedgehog' } },
    { n: 'Firefighter', i: '🚒', a: { body: 'coat', col1: '#ffe066', col2: '#ff5a72', motif: 'stripes', hat: 'fire', back: 'none', held: 'none', pet: 'dog' } },
    { n: 'Artist', i: '🎨', a: { body: 'dungarees', col1: '#4fd1d9', col2: '#ff7eb6', motif: 'rainbow', hat: 'bow', back: 'none', held: 'brush', pet: 'fox' } },
    { n: 'Ballerina', i: '🩰', a: { body: 'tutu', col1: '#ffd1e3', col2: '#ff7eb6', motif: 'none', hat: 'tiara', back: 'none', held: 'none', hair: 'bun', pet: 'mouse' } },
    { n: 'Kitty', i: '🐱', a: { body: 'tee', col1: '#ff9f43', col2: '#ff9f43', motif: 'paw', hat: 'catears', back: 'cattail', held: 'none', face: 'whiskers', pet: 'cat' } },
    { n: 'Doctor', i: '👩‍⚕️', a: { body: 'coat', col1: '#ffffff', col2: '#3fd08a', motif: 'cross', hat: 'none', back: 'none', held: 'stethoscope', face: 'glasses', pet: 'none' } },
    { n: 'Party', i: '🎉', a: { body: 'dress', col1: '#ffe066', col2: '#ff5a72', motif: 'spots', hat: 'party', back: 'butterfly', held: 'balloon', pet: 'frog' } },
  ];

  /* ---------- motif on the chest ---------- */
  function motif(c, m, col, a) {
    c.fillStyle = col; c.strokeStyle = col;
    if (m === 'heart') heart(c, 0, -39, 5.5, col);
    else if (m === 'star') star(c, 0, -38, 6.5, col);
    else if (m === 'moon') { circ(c, 0, -38, 6, col); circ(c, 3, -40, 5, a.col1); }
    else if (m === 'flower') { for (let i = 0; i < 5; i++) circ(c, Math.cos(i * TAU / 5) * 4, -38 + Math.sin(i * TAU / 5) * 4, 3, col); circ(c, 0, -38, 2.4, '#fff7c2'); }
    else if (m === 'paw') { ell(c, 0, -36, 4, 3.4, col); circ(c, -4.5, -41, 1.9, col); circ(c, 0, -43, 1.9, col); circ(c, 4.5, -41, 1.9, col); }
    else if (m === 'cross') { c.fillRect(-2, -44, 4, 12); c.fillRect(-6, -40, 12, 4); }
    else if (m === 'bolt') poly(c, [2, -46, -5, -37, -1, -37, -3, -30, 5, -40, 1, -40], col);
    else if (m === 'spots') { [[-6, -44], [5, -45], [-1, -37], [-7, -31], [6, -32]].forEach(p => circ(c, p[0], p[1], 2.4, col)); }
    else if (m === 'stripes') { c.fillRect(-12.5, -46, 25, 4); c.fillRect(-12.5, -38, 25, 4); c.fillRect(-12.5, -30, 25, 4); }
    else if (m === 'rainbow') { ['#ff5a72', '#ffc93c', '#3fd08a', '#4aa8ff'].forEach((k, i) => { c.strokeStyle = k; c.lineWidth = 2; c.beginPath(); c.arc(0, -34, 9 - i * 2.2, PI, TAU); c.stroke(); }); }
  }

  function drawBack(c, a, t, air) {
    const b = a.back, flap = Math.sin(t * (air ? 22 : 5)) * (air ? 0.35 : 0.12);
    if (b === 'cape' || b === 'rainbowcape') {
      const sway = Math.sin(t * 4) * 3;
      c.beginPath(); c.moveTo(-10, -52); c.lineTo(9, -52); c.quadraticCurveTo(-8 + sway, -30, -22 + sway, -8); c.quadraticCurveTo(-26 + sway, -22, -10, -52);
      if (b === 'rainbowcape') { const g = c.createLinearGradient(0, -52, -20, -8); ['#ff5a72', '#ffc93c', '#3fd08a', '#4aa8ff', '#b77bff'].forEach((k, i) => g.addColorStop(i / 4, k)); c.fillStyle = g; } else c.fillStyle = a.col2;
      c.fill();
    } else if (b === 'fairy' || b === 'beewings') {
      c.save(); c.translate(-8, -46); c.globalAlpha = 0.75;
      const col = b === 'fairy' ? '#ffd9f2' : '#e8f8ff';
      c.save(); c.rotate(-0.5 + flap); ell(c, -10, -10, 16, 9, col, -0.5); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke(); c.restore();
      c.save(); c.rotate(0.2 - flap); ell(c, -10, 6, 12, 7, col, 0.5); c.stroke(); c.restore();
      c.restore();
    } else if (b === 'butterfly') {
      c.save(); c.translate(-9, -44); c.scale(1 - Math.abs(flap) * 1.2, 1);
      ell(c, -11, -9, 13, 12, a.col2); ell(c, -9, 9, 10, 9, shade(a.col2, -0.15));
      circ(c, -12, -9, 4, '#fff'); circ(c, -9, 9, 3, '#fff'); c.restore();
    } else if (b === 'dragonwings') {
      c.save(); c.translate(-8, -46); c.rotate(flap);
      poly(c, [0, 0, -26, -18, -22, -4, -28, 4, -16, 4, -18, 14, 0, 6], '#4fbf6b'); c.restore();
    } else if (b === 'backpack') { rr(c, -19, -51, 12, 24, 5); c.fillStyle = a.col2; c.fill(); rr(c, -19, -40, 10, 8, 3); c.fillStyle = shade(a.col2, -0.18); c.fill(); }
    else if (b === 'cattail') { c.strokeStyle = a.hairCol; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-9, -24); c.quadraticCurveTo(-26, -22, -22 + Math.sin(t * 3) * 4, -42); c.stroke(); }
  }

  function drawHeld(c, a, t) {
    const h = a.held; c.lineCap = 'round';
    if (h === 'wand') { c.strokeStyle = '#8d5a3b'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 20); c.lineTo(9, 2); c.stroke(); star(c, 10, 0, 7, '#ffe066'); circ(c, 10, 0, 2, '#fff'); }
    else if (h === 'broom') { c.strokeStyle = '#a06a43'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(-18, 34); c.lineTo(12, 2); c.stroke(); poly(c, [-18, 34, -30, 36, -27, 46, -14, 42], '#e8b04a'); c.strokeStyle = '#b5651d'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-20, 33); c.lineTo(-15, 38); c.stroke(); }
    else if (h === 'magnifier') { c.strokeStyle = '#8d5a3b'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 20); c.lineTo(6, 10); c.stroke(); circ(c, 10, 3, 8, 'rgba(190,235,255,.7)'); c.strokeStyle = '#555'; c.lineWidth = 2.5; c.stroke(); }
    else if (h === 'vetbag') { rr(c, -6, 22, 18, 13, 3); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#ccc'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#ff5a72'; c.fillRect(1.5, 24, 3, 9); c.fillRect(-1.5, 27, 9, 3); }
    else if (h === 'teddy') { circ(c, 3, 28, 7, '#c98f62'); circ(c, 3, 18, 5.5, '#c98f62'); circ(c, -1, 14, 2.2, '#c98f62'); circ(c, 7, 14, 2.2, '#c98f62'); circ(c, 1.5, 17.5, 0.9, '#333'); circ(c, 4.8, 17.5, 0.9, '#333'); }
    else if (h === 'balloon') { c.strokeStyle = '#888'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 20); c.quadraticCurveTo(8, -10, 4 + Math.sin(t * 2) * 3, -42); c.stroke(); ell(c, 4 + Math.sin(t * 2) * 3, -54, 11, 13, a.col2 === '#ffffff' ? '#ff5a72' : a.col2); circ(c, Math.sin(t * 2) * 3, -58, 3, 'rgba(255,255,255,.6)'); }
    else if (h === 'brush') { c.strokeStyle = '#e8b04a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 20); c.lineTo(8, 4); c.stroke(); ell(c, 10, 0, 3.5, 6, '#ff5a72', 0.45); }
    else if (h === 'whisk') { c.strokeStyle = '#8d5a3b'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 20); c.lineTo(5, 9); c.stroke(); c.strokeStyle = '#bbb'; c.lineWidth = 1.5; ell(c, 8, 1, 4, 8, null, 0.45); c.stroke(); ell(c, 8, 1, 1.5, 8, null, 0.45); c.stroke(); }
    else if (h === 'net') { c.strokeStyle = '#a06a43'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 22); c.lineTo(10, -8); c.stroke(); circ(c, 13, -17, 10, 'rgba(255,255,255,.45)'); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
    else if (h === 'lantern') { c.strokeStyle = '#555'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 20); c.lineTo(3, 25); c.stroke(); circ(c, 3, 31, 12, 'rgba(255,224,102,.25)'); rr(c, -3, 25, 12, 13, 3); c.fillStyle = '#ffe066'; c.fill(); c.strokeStyle = '#8d5a3b'; c.lineWidth = 2; c.stroke(); }
    else if (h === 'book') { rr(c, -5, 16, 15, 12, 2); c.fillStyle = a.col2; c.fill(); c.fillStyle = '#fff'; c.fillRect(-3, 18, 11, 2); }
    else if (h === 'sword') { c.strokeStyle = '#d7dbe6'; c.lineWidth = 4; c.beginPath(); c.moveTo(2, 18); c.lineTo(12, -8); c.stroke(); c.strokeStyle = '#e8b04a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-3, 13); c.lineTo(8, 17); c.stroke(); }
    else if (h === 'umbrella') { c.strokeStyle = '#8d5a3b'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 22); c.lineTo(4, -30); c.stroke(); c.beginPath(); c.arc(4, -30, 20, PI, TAU); c.fillStyle = a.col2; c.fill(); }
    else if (h === 'flower') { c.strokeStyle = '#3fa35a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 22); c.lineTo(5, 4); c.stroke(); for (let i = 0; i < 6; i++) circ(c, 5 + Math.cos(i * TAU / 6) * 5, 1 + Math.sin(i * TAU / 6) * 5, 3.4, '#ff7eb6'); circ(c, 5, 1, 3, '#ffe066'); }
  }

  function drawHat(c, a, t) {
    const h = a.hat, k = a.col1 === '#ffffff' ? '#6c4bd8' : a.col1;
    if (h === 'witch' || h === 'wizard') {
      const col = h === 'witch' ? shade(k, -0.25) : k;
      if (h === 'witch') ell(c, 0, -80, 27, 6.5, col);
      c.beginPath(); c.moveTo(-15, -80); c.quadraticCurveTo(-4, -104, 8 + Math.sin(t * 2), -120); c.quadraticCurveTo(9, -98, 15, -80); c.closePath(); c.fillStyle = col; c.fill();
      c.fillStyle = a.col2; c.fillRect(-14, -86, 28, 5);
      if (h === 'witch') { rr(c, -4, -88, 8, 8, 1.5); c.fillStyle = '#ffe066'; c.fill(); } else { star(c, 1, -98, 4.5, '#ffe066'); star(c, -6, -90, 2.5, '#fff'); }
    } else if (h === 'crown' || h === 'goldcrown') {
      poly(c, [-13, -79, -15, -96, -7, -88, 0, -99, 7, -88, 15, -96, 13, -79], h === 'goldcrown' ? '#ffd24a' : '#ffe066');
      circ(c, 0, -85, 2.6, '#ff5a72'); circ(c, -8, -84, 2, '#4aa8ff'); circ(c, 8, -84, 2, '#3fd08a');
      if (h === 'goldcrown') star(c, 0, -103, 4 + Math.sin(t * 5), '#fff');
    } else if (h === 'tiara') { c.strokeStyle = '#ffe066'; c.lineWidth = 3; c.beginPath(); c.arc(0, -68, 17, PI * 1.2, PI * 1.8); c.stroke(); poly(c, [-4, -84, 0, -93, 4, -84], '#ffe066'); circ(c, 0, -86, 2, '#ff7eb6'); }
    else if (h === 'bow') { poly(c, [6, -84, -6, -92, -6, -76], k); poly(c, [6, -84, 18, -92, 18, -76], k); circ(c, 6, -84, 3.5, shade(k, -0.2)); }
    else if (h === 'flowers') { ['#ff7eb6', '#ffe066', '#b77bff', '#ff9f43', '#ff7eb6'].forEach((col, i) => { const an = PI * (1.15 + i * 0.175), x = Math.cos(an) * 17, y = -67 + Math.sin(an) * 17; circ(c, x, y, 4.6, col); circ(c, x, y, 1.8, '#fff'); }); }
    else if (h === 'catears') { poly(c, [-15, -76, -13, -93, -3, -82], a.hairCol); poly(c, [15, -76, 13, -93, 3, -82], a.hairCol); poly(c, [-12, -79, -11.5, -88, -6, -82], '#ffb3c8'); poly(c, [12, -79, 11.5, -88, 6, -82], '#ffb3c8'); }
    else if (h === 'bunnyears') { ell(c, -7, -98, 5, 17, '#fff', -0.15); ell(c, 7, -98, 5, 17, '#fff', 0.15); ell(c, -7, -98, 2.3, 12, '#ffb3c8', -0.15); ell(c, 7, -98, 2.3, 12, '#ffb3c8', 0.15); }
    else if (h === 'chef') { circ(c, -8, -94, 8, '#fff'); circ(c, 8, -94, 8, '#fff'); circ(c, 0, -98, 9, '#fff'); rr(c, -12, -92, 24, 13, 2); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#ddd'; c.lineWidth = 1; c.stroke(); }
    else if (h === 'nurse') { rr(c, -12, -91, 24, 12, 4); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#d6e4ee'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#ff5a72'; c.fillRect(-1.5, -89, 3, 8); c.fillRect(-4, -86.5, 8, 3); }
    else if (h === 'explorer') { c.beginPath(); c.arc(0, -79, 15, PI, TAU); c.fillStyle = '#d9b87a'; c.fill(); ell(c, 0, -79, 22, 4.5, '#c9a35f'); c.fillStyle = '#8d5a3b'; c.fillRect(-15, -84, 30, 3); }
    else if (h === 'pirate') { c.beginPath(); c.moveTo(-22, -78); c.quadraticCurveTo(0, -106, 22, -78); c.quadraticCurveTo(0, -86, -22, -78); c.fillStyle = '#2b2636'; c.fill(); circ(c, 0, -89, 3.4, '#fff'); c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-5, -84); c.lineTo(5, -80); c.moveTo(5, -84); c.lineTo(-5, -80); c.stroke(); }
    else if (h === 'knight') { c.beginPath(); c.arc(0, -68, 19, PI, TAU); c.lineTo(19, -60); c.lineTo(10, -60); c.lineTo(10, -70); c.lineTo(-19, -70); c.closePath(); c.fillStyle = '#b4bccb'; c.fill(); c.beginPath(); c.moveTo(0, -87); c.quadraticCurveTo(-16, -106, -22, -88); c.quadraticCurveTo(-10, -92, 0, -87); c.fillStyle = a.col2; c.fill(); }
    else if (h === 'space') { circ(c, 0, -66, 23, 'rgba(200,235,255,.28)'); c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(0, -66, 18, PI * 1.55, PI * 1.85); c.stroke(); }
    else if (h === 'fire') { c.beginPath(); c.arc(0, -76, 16, PI, TAU); c.fillStyle = '#e8402f'; c.fill(); ell(c, 4, -76, 22, 4.5, '#c7281b'); poly(c, [-4, -80, 0, -89, 4, -80], '#ffe066'); }
    else if (h === 'detective') { c.beginPath(); c.arc(0, -77, 16, PI, TAU); c.fillStyle = '#a57b52'; c.fill(); ell(c, 14, -77, 9, 3.2, '#8d6540'); ell(c, -14, -77, 9, 3.2, '#8d6540'); c.strokeStyle = '#8d6540'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-8, -90); c.lineTo(-8, -78); c.moveTo(0, -93); c.lineTo(0, -78); c.moveTo(8, -90); c.lineTo(8, -78); c.stroke(); circ(c, 0, -93, 2.5, '#8d6540'); }
    else if (h === 'party') { poly(c, [-10, -80, 3, -110, 12, -82], k); c.strokeStyle = a.col2; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-6, -88); c.lineTo(9, -90); c.moveTo(-2, -97); c.lineTo(6, -99); c.stroke(); circ(c, 3, -111, 4, '#fff'); }
    else if (h === 'cap') { c.beginPath(); c.arc(0, -76, 16.5, PI, TAU); c.fillStyle = k; c.fill(); rr(c, 4, -79, 22, 5, 2.5); c.fillStyle = shade(k, -0.2); c.fill(); }
    else if (h === 'antennae') { c.strokeStyle = '#333'; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, -82); c.quadraticCurveTo(-10, -96, -14 + Math.sin(t * 6), -100); c.moveTo(6, -82); c.quadraticCurveTo(10, -96, 14 + Math.sin(t * 6 + 1), -100); c.stroke(); circ(c, -14 + Math.sin(t * 6), -100, 3.5, '#ffd24a'); circ(c, 14 + Math.sin(t * 6 + 1), -100, 3.5, '#ffd24a'); }
    else if (h === 'unicorn') { poly(c, [-4, -82, 3, -108, 6, -82], '#ffe9a8'); c.strokeStyle = '#f0b9ff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-2, -88); c.lineTo(5, -90); c.moveTo(0, -96); c.lineTo(4.5, -98); c.stroke(); }
  }

  function drawHairBack(c, a, t) {
    const h = a.hair, col = a.hairCol, sw = Math.sin(t * 3) * 1.5;
    if (h === 'long') { rr(c, -19, -82, 38, 46, 15); c.fillStyle = col; c.fill(); }
    else if (h === 'bob') { rr(c, -20, -84, 40, 32, 15); c.fillStyle = col; c.fill(); }
    else if (h === 'pigtails') { circ(c, -21 + sw * 0.5, -60, 9, col); circ(c, 21 + sw * 0.5, -60, 9, col); circ(c, -17, -68, 3, '#ff5a72'); circ(c, 17, -68, 3, '#ff5a72'); }
    else if (h === 'ponytail') { ell(c, -20, -58 + sw * 0.5, 7, 15, col, 0.35); circ(c, -15, -72, 3, '#ffe066'); }
    else if (h === 'braids') { for (let i = 0; i < 4; i++) { circ(c, -17 + sw * 0.2 * i, -62 + i * 7, 5 - i * 0.5, col); circ(c, 17 + sw * 0.2 * i, -62 + i * 7, 5 - i * 0.5, col); } circ(c, -17, -36, 2.5, '#ff5a72'); circ(c, 17, -36, 2.5, '#ff5a72'); }
    else if (h === 'bun') circ(c, 0, -89, 9, col);
    else if (h === 'afro') circ(c, 0, -72, 26, col);
    else if (h === 'curly') { for (let i = 0; i < 9; i++) { const an = PI * (0.85 + i * 0.165); circ(c, Math.cos(an) * 18, -68 + Math.sin(an) * 18, 7.5, col); } }
  }
  function drawHairFront(c, a) {
    const h = a.hair, col = a.hairCol; if (h === 'none') return;
    c.fillStyle = col; c.beginPath();
    if (h === 'spiky') { c.moveTo(-17, -70); for (let i = 0; i < 6; i++) { c.lineTo(-14 + i * 6, -92 + (i % 2) * 3); c.lineTo(-11 + i * 6, -80); } c.lineTo(17, -70); c.quadraticCurveTo(0, -84, -17, -70); }
    else if (h === 'afro' || h === 'curly') { c.arc(0, -68, 17.6, PI * 1.05, PI * 1.95); c.quadraticCurveTo(0, -80, -16.5, -73); }
    else { c.arc(0, -67, 17.8, PI * 0.98, PI * 2.02); c.quadraticCurveTo(12, -80, 2, -79); c.quadraticCurveTo(-8, -74, -17.5, -67); }
    c.fill();
  }

  /* ---------- the customisable person. (x,y) = feet. About 92px tall at s=1. ---------- */
  G.drawAvatar = function (c, a, x, y, s = 1, p = {}) {
    const t = p.t || 0, walk = p.walk || 0, air = p.air || 0, face = p.face || 1;
    const sw = walk ? Math.sin(t * 13) : 0;
    const bob = walk ? -Math.abs(Math.cos(t * 13)) * 2 : Math.sin(t * 2.2) * 0.8;
    c.save(); c.translate(x, y);
    if (!p.noShadow) ell(c, 0, 1, 20 * s, 5 * s, 'rgba(0,0,0,.16)');
    c.scale(s * face, s);
    if (p.sleepy) c.rotate(0.05);
    const b = a.body, skirt = b === 'dress' || b === 'tutu', dark2 = shade(a.col2, -0.12);
    c.save(); c.translate(0, bob * 0.5); drawBack(c, a, t, air); c.restore();
    // legs
    const legCol = skirt ? a.skin : b === 'robe' ? shade(a.col1, -0.2) : b === 'armour' ? '#8891a3' : b === 'suit' ? a.col1 : b === 'coat' ? '#5b6b8c' : dark2;
    for (const i of [-1, 1]) {
      c.save(); c.translate(i * 6, -24); c.rotate(-i * sw * 0.55 + (air ? i * 0.3 : 0));
      rr(c, -4.5, 0, 9, 22, 4); c.fillStyle = legCol; c.fill();
      ell(c, 2, 22.5, 8, 4.8, a.shoes); c.restore();
    }
    c.translate(0, bob);
    // back arm
    const arm = (i, front) => {
      c.save(); c.translate(i * 11, -49);
      c.rotate(air ? i * -2.3 : (p.wave && i === 1 ? -2.4 + Math.sin(t * 9) * 0.3 : i * sw * 0.6 + (front && a.held !== 'none' && a.held !== 'stethoscope' ? -0.5 : 0)));
      rr(c, -4, 0, 8, 19, 4); c.fillStyle = b === 'armour' ? '#a7afc0' : b === 'dungarees' ? a.col2 : a.col1; c.fill();
      if (b === 'coat' || b === 'suit') { c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1; c.stroke(); }
      circ(c, 0, 21, 4.6, a.skin);
      if (front) drawHeld(c, a, t);
      c.restore();
    };
    arm(-1, false);
    // body
    if (b === 'dress') { c.beginPath(); c.moveTo(-11, -52); c.lineTo(11, -52); c.quadraticCurveTo(15, -30, 21, -17); c.quadraticCurveTo(0, -11, -21, -17); c.quadraticCurveTo(-15, -30, -11, -52); c.fillStyle = a.col1; c.fill(); c.strokeStyle = a.col2; c.lineWidth = 3; c.beginPath(); c.moveTo(-19.5, -19); c.quadraticCurveTo(0, -13, 19.5, -19); c.stroke(); }
    else if (b === 'robe') { c.beginPath(); c.moveTo(-11, -52); c.lineTo(11, -52); c.quadraticCurveTo(14, -26, 18, -5); c.quadraticCurveTo(0, 0, -18, -5); c.quadraticCurveTo(-14, -26, -11, -52); c.fillStyle = a.col1; c.fill(); c.fillStyle = a.col2; c.fillRect(-12.5, -29, 25, 3.5); }
    else {
      rr(c, -13, -53, 26, 32, 8); c.fillStyle = b === 'armour' ? '#b4bccb' : b === 'dungarees' ? a.col2 : a.col1; c.fill();
      if (b === 'coat' || b === 'suit') { c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1; c.stroke(); }
      if (b === 'dungarees') { rr(c, -10, -44, 20, 23, 4); c.fillStyle = a.col1; c.fill(); c.fillRect(-9, -53, 4, 11); c.fillRect(5, -53, 4, 11); circ(c, -7, -43, 1.6, '#ffe066'); circ(c, 7, -43, 1.6, '#ffe066'); }
      if (b === 'tutu') { ell(c, 0, -22, 24, 8, a.col2); ell(c, 0, -24, 20, 6, shade(a.col2, 0.3)); }
      if (b === 'coat') { c.strokeStyle = shade(a.col2, -0.1); c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -52); c.lineTo(0, -21); c.stroke(); circ(c, 4, -42, 1.5, a.col2); circ(c, 4, -34, 1.5, a.col2); circ(c, 4, -26, 1.5, a.col2); }
      if (b === 'suit') { rr(c, -8, -46, 16, 12, 3); c.fillStyle = a.col2; c.fill(); c.fillStyle = shade(a.col1, -0.15); c.fillRect(-13, -27, 26, 4); }
      if (b === 'armour') { c.strokeStyle = '#8891a3'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-13, -30); c.lineTo(13, -30); c.stroke(); }
      if (b === 'tee') { c.fillStyle = dark2; c.fillRect(-13, -27, 26, 6); }
    }
    if (!(b === 'suit' && a.motif !== 'none')) motif(c, a.motif, b === 'armour' ? a.col2 : (b === 'dungarees' ? a.col2 : (a.col2 === a.col1 ? '#fff' : a.col2)), a);
    else motif(c, a.motif, a.col1, a);
    if (a.held === 'stethoscope') { c.strokeStyle = '#444'; c.lineWidth = 2; c.beginPath(); c.arc(0, -50, 8, 0.1, PI - 0.1); c.stroke(); c.beginPath(); c.moveTo(0, -42); c.lineTo(0, -36); c.stroke(); circ(c, 0, -34, 3.2, '#c9d2de'); c.strokeStyle = '#444'; c.stroke(); }
    arm(1, true);
    // head
    drawHairBack(c, a, t);
    circ(c, 0, -66, 17, a.skin);
    // face
    const blink = (Math.sin(t * 0.9 + 1) > 0.985) || p.sleepy;
    c.fillStyle = '#2b2118';
    if (blink) { c.fillRect(-5, -67, 6, 1.6); c.fillRect(6, -67, 6, 1.6); }
    else { ell(c, -2, -67, 2.3, 3.2, '#2b2118'); ell(c, 9, -67, 2.3, 3.2, '#2b2118'); circ(c, -1.2, -68.2, 0.9, '#fff'); circ(c, 9.8, -68.2, 0.9, '#fff'); }
    circ(c, -8, -60, 3.4, 'rgba(255,120,140,' + (a.face === 'rosy' ? 0.7 : 0.33) + ')'); circ(c, 14, -60, 3, 'rgba(255,120,140,' + (a.face === 'rosy' ? 0.7 : 0.33) + ')');
    c.strokeStyle = '#8a3b2a'; c.lineWidth = 1.7; c.lineCap = 'round'; c.beginPath();
    if (p.mouth === 'o') c.arc(4, -58, 2.2, 0, TAU); else c.arc(4, -61, 5, 0.25, PI - 0.25); c.stroke();
    const f = a.face;
    if (f === 'glasses') { c.strokeStyle = '#3b3350'; c.lineWidth = 1.8; circ(c, -2, -67, 5.2); c.stroke(); circ(c, 9, -67, 5.2); c.stroke(); c.beginPath(); c.moveTo(3.2, -67); c.lineTo(3.8, -67); c.stroke(); }
    else if (f === 'freckles') { c.fillStyle = 'rgba(150,80,40,.55)';[[-7, -62], [-4, -60], [-9, -59], [11, -62], [14, -60], [9, -60]].forEach(q => circ(c, q[0], q[1], 0.9, c.fillStyle)); }
    else if (f === 'whiskers') { c.strokeStyle = '#555'; c.lineWidth = 1; c.beginPath(); for (const k of [-1, 1]) { c.moveTo(4 + k * 6, -62); c.lineTo(4 + k * 16, -64); c.moveTo(4 + k * 6, -60); c.lineTo(4 + k * 16, -59); } c.stroke(); circ(c, 4, -63, 1.6, '#ff8fa8'); }
    else if (f === 'mask') { rr(c, -9, -72, 25, 9, 4.5); c.fillStyle = a.col2; c.fill(); ell(c, -2, -67.5, 2.6, 2.4, '#fff'); ell(c, 9, -67.5, 2.6, 2.4, '#fff'); circ(c, -2, -67.5, 1.3, '#222'); circ(c, 9, -67.5, 1.3, '#222'); }
    else if (f === 'eyepatch') { c.strokeStyle = '#222'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-16, -74); c.lineTo(16, -66); c.stroke(); ell(c, 9, -67, 4.6, 4.2, '#222'); }
    else if (f === 'starpaint') { star(c, 13, -60, 4, '#ffe066'); star(c, -8, -73, 2.5, '#ff7eb6'); }
    else if (f === 'moustache') { c.strokeStyle = a.hairCol; c.lineWidth = 3; c.beginPath(); c.moveTo(4, -61.5); c.quadraticCurveTo(-2, -58, -5, -62); c.moveTo(4, -61.5); c.quadraticCurveTo(10, -58, 13, -62); c.stroke(); }
    drawHairFront(c, a);
    drawHat(c, a, t);
    c.restore();
  };

  /* ---------- creatures: pets, animal villagers, forest folk ---------- */
  const CRE = G.CRE = {
    cat: { b: '#f5a34d', belly: '#fff1dc', ear: 'point', tail: 'long', whisk: 1 },
    blackcat: { b: '#3b3350', belly: '#57506e', ear: 'point', tail: 'long', whisk: 1, eye: '#ffe066' },
    dog: { b: '#c58b5a', belly: '#f5e1c8', ear: 'flop', tail: 'wag', snout: 1 },
    bunny: { b: '#f4f0ea', belly: '#ffffff', ear: 'long', tail: 'puff' },
    owl: { b: '#9a7b5b', belly: '#ead8ba', ear: 'tuft', beak: 1, wing: 1, big: 1 },
    frog: { b: '#7ed957', belly: '#eaffc2', top: 1, wide: 1 },
    hedgehog: { b: '#e9cfa9', belly: '#fff1dc', spikes: '#8d5a3b', snout: 1, ear: 'round' },
    fox: { b: '#f0803c', belly: '#ffffff', ear: 'point', tail: 'bush', snout: 1 },
    mouse: { b: '#b9b4c4', belly: '#f0edf5', ear: 'biground', tail: 'thin', small: 1 },
    tuft: { b: '#b58a5c', belly: '#b58a5c', hairy: 1 },
    dragon: { b: '#6fcf7c', belly: '#fff2a8', ear: 'horn', tail: 'spike', wing: 2, snout: 1 },
    unicorn: { b: '#ffffff', belly: '#ffeef8', ear: 'point', tail: 'rainbow', snout: 1, horn: 1, mane: 1 },
    bear: { b: '#a8754a', belly: '#e2c39e', ear: 'round', snout: 1 },
    mole: { b: '#5d5468', belly: '#8d8499', snout: 1, pink: 1, specs: 1 },
    ogre: { b: '#8ecf6a', belly: '#b6e596', ear: 'round', tusk: 1, brow: 1 },
    troll: { b: '#9fb4d8', belly: '#c9d8f0', ear: 'point', tusk: 1, hairtop: '#ff9f43' },
    badger: { b: '#6b6b76', belly: '#f4f0ea', ear: 'round', snout: 1, stripe: 1 },
    squirrel: { b: '#c9763a', belly: '#f7dcc0', ear: 'point', tail: 'bush' },
    sheep: { b: '#fbf8f0', belly: '#fbf8f0', ear: 'flop', wool: 1, dark: '#4b4453' },
    pig: { b: '#ffb3c8', belly: '#ffd1de', ear: 'point', snout: 2, tail: 'thin' },
    hen: { b: '#fff6e0', belly: '#fff', beak: 1, comb: 1, wing: 1 },
    robot: { b: '#b4bccb', belly: '#7fe3ff', robot: 1 },
  };
  G.drawCreature = function (c, kind, x, y, s = 1, p = {}) {
    if (SPECIAL[kind]) return SPECIAL[kind](c, x, y, s, p);
    const d = CRE[kind] || CRE.cat, t = p.t || 0, face = p.face || 1, walk = p.walk || 0;
    const hop = walk ? -Math.abs(Math.sin(t * 10)) * 5 : 0, br = Math.sin(t * 2.5) * 0.7;
    c.save(); c.translate(x, y);
    ell(c, 0, 1, 15 * s, 4 * s, 'rgba(0,0,0,.15)');
    c.scale(s * face * (d.small ? 0.8 : 1), s * (d.small ? 0.8 : 1)); c.translate(0, hop);
    const dk = shade(d.b.length === 7 ? d.b : '#888888', -0.2);
    // tail
    c.lineCap = 'round';
    const tw = Math.sin(t * (d.tail === 'wag' ? 14 : 3)) * 4;
    if (d.tail === 'long' || d.tail === 'thin') { c.strokeStyle = d.tail === 'thin' ? '#e7a0b0' : d.b; c.lineWidth = d.tail === 'thin' ? 2 : 5; c.beginPath(); c.moveTo(-12, -8); c.quadraticCurveTo(-26, -8, -22 + tw, -28); c.stroke(); }
    else if (d.tail === 'wag') { c.strokeStyle = d.b; c.lineWidth = 5; c.beginPath(); c.moveTo(-12, -14); c.lineTo(-20 + tw * 0.5, -24 + Math.abs(tw) * 0.3); c.stroke(); }
    else if (d.tail === 'puff') circ(c, -15, -9, 5.5, '#fff');
    else if (d.tail === 'bush') { ell(c, -19, -18 + tw * 0.3, 8, 14, d.b, -0.5); ell(c, -22, -27 + tw * 0.3, 4, 5, '#fff', -0.5); }
    else if (d.tail === 'spike') { poly(c, [-10, -4, -30, -6 + tw * 0.4, -12, -16], d.b); poly(c, [-30, -6 + tw * 0.4, -37, -12 + tw * 0.4, -29, -13 + tw * 0.4], '#ff9f43'); }
    else if (d.tail === 'rainbow') { ['#ff5a72', '#ffc93c', '#4aa8ff'].forEach((k, i) => { c.strokeStyle = k; c.lineWidth = 3.5; c.beginPath(); c.moveTo(-12, -14 + i * 2); c.quadraticCurveTo(-24, -14, -20 + tw * 0.5 - i * 2, 0); c.stroke(); }); }
    if (d.wing === 2) { c.save(); c.translate(-4, -24); c.rotate(Math.sin(t * 6) * 0.25); poly(c, [0, 0, -20, -16, -17, -3, -22, 4, -10, 3], '#4fbf6b'); c.restore(); }
    if (d.spikes) { for (let i = 0; i < 7; i++) { const an = PI * (0.95 + i * 0.13); poly(c, [Math.cos(an) * 12 - 2, -14 + Math.sin(an) * 11, Math.cos(an) * 22 - 2, -14 + Math.sin(an) * 20, Math.cos(an + 0.25) * 12 - 2, -14 + Math.sin(an + 0.25) * 11], d.spikes); } ell(c, -3, -15, 14, 12, d.spikes); }
    // feet + body
    ell(c, -7, -1.5, 5.5, 3.2, dk); ell(c, 8, -1.5, 5.5, 3.2, dk);
    if (d.robot) { rr(c, -13, -26, 26, 24, 5); c.fillStyle = d.b; c.fill(); rr(c, -7, -20, 14, 9, 2); c.fillStyle = d.belly; c.fill(); }
    else {
      ell(c, 0, -13 + br * 0.3, d.wide ? 17 : 15, 13 + br * 0.3, d.b);
      if (d.wool) for (let i = 0; i < 8; i++) circ(c, Math.cos(i * TAU / 8) * 13, -14 + Math.sin(i * TAU / 8) * 10, 6, d.b);
      if (!d.hairy) ell(c, 3, -10, 9, 8.5, d.belly);
    }
    if (d.wing === 1) ell(c, -8, -14, 6, 10, dk, 0.3 + Math.sin(t * 3) * 0.08);
    // head
    const hx = d.hairy ? 0 : 7, hy = d.hairy ? -24 : -30 + br;
    const earC = d.dark || d.b;
    if (d.ear === 'point') { poly(c, [hx - 12, hy - 5, hx - 9, hy - 20, hx - 1, hy - 10], earC); poly(c, [hx + 12, hy - 5, hx + 10, hy - 20, hx + 2, hy - 10], earC); poly(c, [hx + 10, hy - 8, hx + 9.5, hy - 16, hx + 5, hy - 10], '#ffb3c8'); }
    else if (d.ear === 'round') { circ(c, hx - 10, hy - 9, 5, earC); circ(c, hx + 10, hy - 9, 5, earC); }
    else if (d.ear === 'biground') { circ(c, hx - 11, hy - 9, 8, earC); circ(c, hx + 11, hy - 9, 8, earC); circ(c, hx + 11, hy - 9, 5, '#ffc2d1'); circ(c, hx - 11, hy - 9, 5, '#ffc2d1'); }
    else if (d.ear === 'long') { ell(c, hx - 6, hy - 22, 4.5, 14, d.b, -0.15); ell(c, hx + 6, hy - 22, 4.5, 14, d.b, 0.2); ell(c, hx + 6, hy - 22, 2, 10, '#ffc2d1', 0.2); }
    else if (d.ear === 'flop') { ell(c, hx - 12, hy - 1, 5, 10, d.dark || dk, 0.25); ell(c, hx + 12, hy - 1, 5, 10, d.dark || dk, -0.25); }
    else if (d.ear === 'tuft') { poly(c, [hx - 12, hy - 8, hx - 13, hy - 18, hx - 4, hy - 11], d.b); poly(c, [hx + 12, hy - 8, hx + 13, hy - 18, hx + 4, hy - 11], d.b); }
    else if (d.ear === 'horn') { poly(c, [hx - 9, hy - 9, hx - 12, hy - 20, hx - 3, hy - 12], '#fff2a8'); poly(c, [hx + 9, hy - 9, hx + 12, hy - 20, hx + 3, hy - 12], '#fff2a8'); }
    if (d.mane) { ['#ff7eb6', '#ffc93c', '#4aa8ff', '#b77bff'].forEach((k, i) => circ(c, hx - 10 - i, hy - 8 + i * 6, 5.5, k)); }
    if (d.horn) poly(c, [hx + 1, hy - 12, hx + 5, hy - 28, hx + 8, hy - 12], '#ffe9a8');
    if (d.comb) { circ(c, hx - 3, hy - 13, 3.5, '#ff5a72'); circ(c, hx + 2, hy - 15, 4, '#ff5a72'); circ(c, hx + 7, hy - 13, 3.5, '#ff5a72'); }
    if (d.top) { circ(c, hx - 7, hy - 9, 6.5, d.b); circ(c, hx + 7, hy - 9, 6.5, d.b); }
    if (d.robot) { rr(c, hx - 12, hy - 11, 24, 21, 5); c.fillStyle = d.b; c.fill(); c.strokeStyle = '#8891a3'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx, hy - 11); c.lineTo(hx, hy - 19); c.stroke(); circ(c, hx, hy - 20, 3, Math.sin(t * 6) > 0 ? '#ff5a72' : '#ffe066'); }
    else if (d.hairy) {
      c.strokeStyle = d.b; c.lineWidth = 3.5;
      for (let i = 0; i < 26; i++) { const an = PI + (i / 25) * PI, wob = Math.sin(t * 3 + i) * 1.5; c.strokeStyle = i % 2 ? d.b : dk; c.beginPath(); c.moveTo(Math.cos(an) * 6, -30 + Math.sin(an) * 6); c.quadraticCurveTo(Math.cos(an) * 20, -32 + Math.sin(an) * 14, Math.cos(an) * 17 + wob, -1 - U.hash(i) * 3); c.stroke(); }
      for (let i = 0; i < 9; i++) { c.strokeStyle = i % 2 ? dk : d.b; c.beginPath(); c.moveTo(-10 + i * 2.5, -34); c.lineTo(-13 + i * 3.3 + Math.sin(t * 3 + i), -2); c.stroke(); }
    } else circ(c, hx, hy, 13, d.b);
    if (d.stripe) { c.fillStyle = '#fff'; rr(c, hx - 3, hy - 13, 6, 16, 3); c.fill(); }
    if (d.hairtop) { for (let i = 0; i < 5; i++) poly(c, [hx - 8 + i * 4, hy - 10, hx - 7 + i * 4, hy - 24 - (i % 2) * 4, hx - 3 + i * 4, hy - 10], d.hairtop); }
    // face
    const big = d.big ? 1.5 : 1, ey = d.top ? hy - 10 : hy - 2, ex1 = d.top ? hx - 7 : hx - 3, ex2 = d.top ? hx + 7 : hx + 7;
    const blink = Math.sin(t * 0.8 + x * 0.01) > 0.985 || p.sleepy;
    if (d.big) { circ(c, ex1 - 1, ey, 5.5, '#fff'); circ(c, ex2 + 1, ey, 5.5, '#fff'); }
    if (d.top) { circ(c, ex1, ey, 4.4, '#fff'); circ(c, ex2, ey, 4.4, '#fff'); }
    if (d.robot) { circ(c, ex1, ey, 3.4, '#7fe3ff'); circ(c, ex2, ey, 3.4, '#7fe3ff'); }
    else if (blink) { c.fillStyle = '#2b2118'; c.fillRect(ex1 - 2.5 - (d.big ? 1 : 0), ey, 5, 1.5); c.fillRect(ex2 - 2.5 + (d.big ? 1 : 0), ey, 5, 1.5); }
    else { ell(c, ex1 - (d.big ? 1 : 0), ey, 2 * big, 2.7 * big, d.eye || '#2b2118'); ell(c, ex2 + (d.big ? 1 : 0), ey, 2 * big, 2.7 * big, d.eye || '#2b2118'); circ(c, ex1 + 0.7, ey - 1, 0.8, '#fff'); circ(c, ex2 + 0.7, ey - 1, 0.8, '#fff'); }
    if (d.specs) { c.strokeStyle = '#ffe066'; c.lineWidth = 1.5; circ(c, ex1, ey, 4.5); c.stroke(); circ(c, ex2, ey, 4.5); c.stroke(); }
    if (d.brow) { c.strokeStyle = dk; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ex1 - 4, ey - 6); c.lineTo(ex1 + 3, ey - 4.5); c.moveTo(ex2 + 4, ey - 6); c.lineTo(ex2 - 3, ey - 4.5); c.stroke(); }
    if (d.snout === 2) { ell(c, hx + 3, hy + 4, 6, 4.5, '#ff8fab'); circ(c, hx + 1, hy + 4, 1.2, '#b0456a'); circ(c, hx + 5, hy + 4, 1.2, '#b0456a'); }
    else if (d.snout) { ell(c, hx + 4, hy + 4, 7, 5, d.belly); ell(c, hx + 5, hy + 2, 2.6, 2, d.pink ? '#ff8fab' : '#2b2118'); }
    else if (d.beak) poly(c, [hx - 1, hy + 2, hx + 5, hy + 2, hx + 2, hy + 8], '#ff9f43');
    else if (!d.robot && !d.hairy) { ell(c, hx + 2, hy + 3, 1.8, 1.3, '#d9506c'); c.strokeStyle = '#2b2118'; c.lineWidth = 1; c.beginPath(); c.arc(hx + 0.2, hy + 4.5, 1.9, 0, PI); c.arc(hx + 3.8, hy + 4.5, 1.9, 0, PI); c.stroke(); }
    if (d.robot) { c.fillStyle = '#555'; c.fillRect(hx - 5, hy + 4, 10, 2); }
    if (d.tusk) { poly(c, [hx - 4, hy + 6, hx - 2, hy, hx, hy + 6], '#fff'); poly(c, [hx + 6, hy + 6, hx + 8, hy, hx + 10, hy + 6], '#fff'); c.strokeStyle = dk; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx - 5, hy + 6); c.lineTo(hx + 11, hy + 6); c.stroke(); }
    if (d.whisk) { c.strokeStyle = 'rgba(60,40,30,.5)'; c.lineWidth = 0.8; c.beginPath(); for (const k of [-1, 1]) { c.moveTo(hx + 2 + k * 5, hy + 3); c.lineTo(hx + 2 + k * 14, hy + 1); c.moveTo(hx + 2 + k * 5, hy + 5); c.lineTo(hx + 2 + k * 14, hy + 6); } c.stroke(); }
    // accessories for story characters
    const acc = p.acc;
    if (acc === 'chef') { circ(c, hx - 5, hy - 19, 5, '#fff'); circ(c, hx + 5, hy - 19, 5, '#fff'); circ(c, hx, hy - 22, 6, '#fff'); rr(c, hx - 8, hy - 18, 16, 8, 2); c.fillStyle = '#fff'; c.fill(); }
    else if (acc === 'bowtie') { poly(c, [3, -22, -4, -26, -4, -18], '#ff5a72'); poly(c, [3, -22, 10, -26, 10, -18], '#ff5a72'); }
    else if (acc === 'scarf') { c.strokeStyle = '#ff5a72'; c.lineWidth = 4; c.beginPath(); c.moveTo(-6, -22); c.lineTo(12, -21); c.stroke(); c.beginPath(); c.moveTo(-4, -21); c.lineTo(-7, -12); c.stroke(); }
    else if (acc === 'crown') poly(c, [hx - 7, hy - 11, hx - 8, hy - 20, hx - 3, hy - 15, hx, hy - 21, hx + 3, hy - 15, hx + 8, hy - 20, hx + 7, hy - 11], '#ffd24a');
    else if (acc === 'hardhat') { c.beginPath(); c.arc(hx, hy - 7, 12, PI, TAU); c.fillStyle = '#ffc93c'; c.fill(); rr(c, hx - 14, hy - 8, 30, 3.5, 1.5); c.fill(); circ(c, hx + 6, hy - 13, 3, '#fff7c2'); }
    else if (acc === 'napkin') poly(c, [-4, -22, 12, -22, 4, -10], '#fff');
    c.restore();
  };

  /* little creatures with their own shapes */
  const SPECIAL = {
    bee(c, x, y, s, p) { const t = p.t || 0; c.save(); c.translate(x, y - 14 * s + Math.sin(t * 5 + x) * 3 * s); c.scale(s * (p.face || 1), s); c.globalAlpha = 0.7; ell(c, -3, -9, 8, 5, '#e8f8ff', -0.5 + Math.sin(t * 40) * 0.3); ell(c, 4, -9, 8, 5, '#e8f8ff', 0.5 - Math.sin(t * 40) * 0.3); c.globalAlpha = 1; ell(c, 0, 0, 12, 9, '#ffd24a'); c.fillStyle = '#3b3350'; c.fillRect(-5, -8.2, 3.6, 16.4); c.fillRect(2, -8.6, 3.6, 17.2); circ(c, 9, -1, 6, '#3b3350'); circ(c, 11, -2, 1.5, '#fff'); poly(c, [-11, -2, -16, 0, -11, 2], '#3b3350'); c.restore(); },
    ladybird(c, x, y, s, p) { const t = p.t || 0; c.save(); c.translate(x, y); c.scale(s * (p.face || 1), s); c.translate(0, p.walk ? -Math.abs(Math.sin(t * 10)) * 2 : 0); circ(c, 9, -7, 5, '#2b2118'); c.beginPath(); c.arc(0, -4, 11, PI, TAU); c.closePath(); c.fillStyle = '#ff4d5e'; c.fill(); circ(c, -4, -9, 2, '#2b2118'); circ(c, 3, -11, 2, '#2b2118'); circ(c, 1, -6, 1.6, '#2b2118'); c.strokeStyle = '#2b2118'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -15); c.lineTo(0, -4); c.stroke(); circ(c, 11, -8, 1, '#fff'); c.restore(); },
    snail(c, x, y, s, p) { const t = p.t || 0; c.save(); c.translate(x, y); c.scale(s * (p.face || 1), s); rr(c, -14, -6, 30, 7, 3.5); c.fillStyle = '#f0d9a8'; c.fill(); circ(c, -3, -13, 10, '#e58f5a'); c.strokeStyle = '#b5651d'; c.lineWidth = 1.8; c.beginPath(); c.arc(-3, -13, 5.5, 0, PI * 1.6); c.stroke(); c.strokeStyle = '#f0d9a8'; c.lineWidth = 2; c.beginPath(); c.moveTo(13, -5); c.lineTo(15, -15 + Math.sin(t * 3)); c.moveTo(10, -5); c.lineTo(10, -15 - Math.sin(t * 3)); c.stroke(); circ(c, 15, -16, 1.6, '#2b2118'); circ(c, 10, -16, 1.6, '#2b2118'); c.restore(); },
    butterfly(c, x, y, s, p) { const t = p.t || 0, f = Math.abs(Math.sin(t * 9 + x)); c.save(); c.translate(x, y - 16 * s + Math.sin(t * 3 + x) * 6 * s); c.scale(s, s); for (const k of [-1, 1]) { c.save(); c.scale(k * (0.3 + f * 0.7), 1); ell(c, 8, -4, 8, 9, p.col || '#ff7eb6'); ell(c, 6, 6, 6, 6, '#ffc93c'); circ(c, 8, -4, 3, '#fff'); c.restore(); } rr(c, -1.5, -8, 3, 16, 1.5); c.fillStyle = '#3b3350'; c.fill(); c.restore(); },
    ghost(c, x, y, s, p) { const t = p.t || 0; c.save(); c.translate(x, y - 10 * s + Math.sin(t * 2) * 4 * s); c.scale(s * (p.face || 1), s); c.globalAlpha = 0.85; c.beginPath(); c.arc(0, -22, 14, PI, TAU); c.lineTo(14, 0); for (let i = 0; i < 4; i++) c.quadraticCurveTo(10.5 - i * 7, -7, 7 - i * 7, 0); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.globalAlpha = 1; ell(c, -1, -22, 2, 3, '#3b3350'); ell(c, 8, -22, 2, 3, '#3b3350'); ell(c, 4, -14, 2.5, 2, '#ff8fab'); c.restore(); },
  };

  /* ---------- gems ---------- */
  G.drawGem = function (c, colour, x, y, r, t = 0) {
    const gi = G.GEM_INFO[colour]; c.save(); c.translate(x, y);
    const g = c.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 2.2); g.addColorStop(0, gi.col + '66'); g.addColorStop(1, gi.col + '00'); circ(c, 0, 0, r * 2.2, g);
    poly(c, [0, -r, r * 0.85, -r * 0.35, r * 0.55, r * 0.9, -r * 0.55, r * 0.9, -r * 0.85, -r * 0.35], gi.col);
    poly(c, [0, -r, r * 0.85, -r * 0.35, 0, -r * 0.1], shade(gi.col, 0.35));
    poly(c, [r * 0.85, -r * 0.35, r * 0.55, r * 0.9, 0, -r * 0.1], gi.dark);
    poly(c, [-r * 0.85, -r * 0.35, 0, -r * 0.1, -r * 0.55, r * 0.9], shade(gi.col, 0.12));
    const tw = (Math.sin(t * 3 + x * 0.05) + 1) / 2; star(c, -r * 0.3, -r * 0.45, r * 0.3 * tw + 1, '#fff', 4);
    c.restore();
  };
  G.gemSVG = (colour, size = 26) => { const g = G.GEM_INFO[colour]; return '<svg width="' + size + '" height="' + size + '" viewBox="-12 -12 24 24"><polygon points="0,-10 8.5,-3.5 5.5,9 -5.5,9 -8.5,-3.5" fill="' + g.col + '" stroke="' + g.dark + '" stroke-width="1.2" stroke-linejoin="round"/><polygon points="0,-10 8.5,-3.5 0,-1" fill="#fff" opacity=".45"/><polygon points="8.5,-3.5 5.5,9 0,-1" fill="' + g.dark + '" opacity=".6"/></svg>'; };

  /* draw any character description: {av:{...}} human or {cre:'cat', s:1.5, acc:'chef'} creature */
  G.drawLook = function (c, look, x, y, s, p) {
    if (look.cre) G.drawCreature(c, look.cre, x, y, s * (look.s || 1), Object.assign({ acc: look.acc }, p));
    else G.drawAvatar(c, look.av, x, y, s * (look.s || 1), p);
  };
  /* render a look onto a small DOM canvas (portraits, wardrobe preview) */
  G.portrait = function (cv, look, zoom = 1) {
    const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
    if (look.cre) { const s = cv.height / 62 * zoom; G.drawCreature(c, look.cre, cv.width / 2 - 4 * s, cv.height * 0.88, s, { t: 1, acc: look.acc }); }
    else { const s = cv.height / 70 * zoom; G.drawAvatar(c, look.av, cv.width / 2, cv.height * 1.32 * zoom + (1 - zoom) * 20, s, { t: 1, noShadow: true }); }
  };
})();

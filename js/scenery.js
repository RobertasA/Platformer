/* Hazelnut Hollow — scenery: parallax backgrounds, tiles and props for each theme. All procedural. */
(function () {
  'use strict';
  const G = window.G, U = G.U, PI = Math.PI, TAU = PI * 2, T = G.TILE;
  const { rr, circ, ell, poly, shade, star } = G;

  G.THEMES = {
    village: { sky: ['#7cc8ff', '#d8f3ff', '#fff3d6'], top: '#7ed16a', topD: '#58b54e', soil: '#c08a56', soilD: '#a57142', plat: 'wood' },
    meadow: { sky: ['#62c4ff', '#c6f1ff', '#f4ffd6'], top: '#9be05c', topD: '#6fc441', soil: '#b98652', soilD: '#9c6d3e', plat: 'leaf' },
    woods: { sky: ['#2f5d6e', '#5fa08d', '#f5d49a'], top: '#5fae5a', topD: '#3f8a47', soil: '#7a5a3d', soilD: '#5f432c', plat: 'wood' },
    house: { sky: ['#232a52', '#2c3566', '#3a4480'], top: '#b9824f', topD: '#8d5a3b', soil: '#9c6a40', soilD: '#7d5230', plat: 'shelf', inside: '#39427a', inside2: '#434d8c', dark: 0.34 },
    tower: { sky: ['#ffb38a', '#ffd6b0', '#fff0d0'], top: '#d9c2f0', topD: '#b79ad9', soil: '#a88bc9', soilD: '#8f72b3', plat: 'shelf', inside: '#fbe9d2', inside2: '#f5dcbd' },
    caves: { sky: ['#1b1638', '#2a2152', '#3b2d6b'], top: '#7b68b8', topD: '#5d4c99', soil: '#4a3b7c', soilD: '#3a2d66', plat: 'stone', dark: 0.25 },
    clouds: { sky: ['#6f7bff', '#c59bff', '#ffc7de'], top: '#ffffff', topD: '#e6e9ff', soil: '#f4f1ff', soilD: '#dcd9f7', plat: 'cloud' },
  };

  /* ---------- backgrounds ---------- */
  function hills(c, camX, W, H, par, base, amp, col, seed) {
    c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) { const wx = x + camX * par; c.lineTo(x, base - Math.sin(wx * 0.004 + seed) * amp - Math.sin(wx * 0.011 + seed * 2) * amp * 0.4); }
    c.lineTo(W + 20, H); c.fill();
  }
  function cloudShape(c, x, y, s, col) { c.fillStyle = col; circ(c, x, y, 26 * s, col); circ(c, x + 30 * s, y - 12 * s, 32 * s, col); circ(c, x + 66 * s, y, 26 * s, col); rr(c, x - 18 * s, y, 104 * s, 24 * s, 12 * s); c.fill(); }
  function clouds(c, camX, W, t, par, y0, n, col, sc) {
    for (let i = 0; i < n; i++) { const span = W + 400, x = ((i * 397 + t * (6 + i % 3 * 3) - camX * par) % span + span) % span - 200; cloudShape(c, x, y0 + U.hash(i, 3) * 140, sc * (0.6 + U.hash(i, 7) * 0.8), col); }
  }
  G.drawBackground = function (c, theme, camX, camY, W, H, t) {
    const th = G.THEMES[theme], g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, th.sky[0]); g.addColorStop(0.6, th.sky[1]); g.addColorStop(1, th.sky[2]); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const vy = -camY * 0.15;
    if (theme === 'village' || theme === 'meadow') {
      circ(c, W * 0.78, 110 + vy, 90, 'rgba(255,244,190,.35)'); circ(c, W * 0.78, 110 + vy, 56, '#fff3a8');
      clouds(c, camX, W, t, 0.05, 50 + vy, 6, 'rgba(255,255,255,.9)', 1);
      hills(c, camX, W, H, 0.12, 430 + vy, 60, theme === 'meadow' ? '#b9eb8f' : '#a9e0a0', 1);
      hills(c, camX, W, H, 0.25, 500 + vy, 46, theme === 'meadow' ? '#96dd6c' : '#8ad184', 4);
      // far trees / giant flowers
      for (let i = 0; i < 14; i++) {
        const span = W + 300, x = ((i * 211 - camX * 0.25) % span + span) % span - 150, wx = x + camX * 0.25, y = 500 + vy - Math.sin(wx * 0.004 + 4) * 46 - Math.sin(wx * 0.011 + 8) * 18;
        if (theme === 'meadow') { c.strokeStyle = '#6fc441'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y + 20); c.lineTo(x, y - 60); c.stroke(); const col = ['#ff9ec7', '#ffd95e', '#c7a6ff', '#ff8a7a'][i % 4]; for (let k = 0; k < 7; k++) circ(c, x + Math.cos(k * TAU / 7) * 18, y - 60 + Math.sin(k * TAU / 7) * 18, 12, col); circ(c, x, y - 60, 11, '#fff3b8'); }
        else { c.fillStyle = '#8a6a4a'; c.fillRect(x - 4, y - 20, 8, 40); circ(c, x, y - 40, 30, '#6fc27a'); circ(c, x - 18, y - 24, 20, '#6fc27a'); circ(c, x + 18, y - 24, 20, '#6fc27a'); }
      }
      hills(c, camX, W, H, 0.4, 590 + vy, 30, theme === 'meadow' ? '#7fd055' : '#74c56d', 9);
    } else if (theme === 'woods') {
      circ(c, W * 0.3, 470 + vy, 160, 'rgba(255,220,150,.25)'); circ(c, W * 0.3, 470 + vy, 70, 'rgba(255,236,180,.8)');
      hills(c, camX, W, H, 0.1, 480 + vy, 40, '#3f7d73', 2);
      for (let layer = 0; layer < 3; layer++) {
        const par = 0.15 + layer * 0.17, col = ['#2f6660', '#27564f', '#1f463f'][layer], n = 9;
        for (let i = 0; i < n; i++) {
          const span = W + 500, x = ((i * (span / n) + U.hash(i, layer) * 120 - camX * par) % span + span) % span - 250, w = 26 + layer * 16 + U.hash(i, layer + 5) * 20;
          c.fillStyle = col; c.fillRect(x, -10, w, H + 20);
          circ(c, x + w / 2, 40 + layer * 30 + vy, 110 + layer * 30, col); circ(c, x + w / 2 - 90, 20 + vy, 80 + layer * 20, col); circ(c, x + w / 2 + 100, 10 + vy, 90 + layer * 20, col);
        }
      }
      for (let i = 0; i < 26; i++) { const x = (U.hash(i, 1) * W + Math.sin(t * 0.5 + i) * 40 + W - camX * 0.5 % W) % W, y = 200 + U.hash(i, 2) * 420 + Math.cos(t * 0.7 + i * 2) * 20, a = (Math.sin(t * 2 + i * 1.7) + 1) / 2; circ(c, x, y, 7, 'rgba(255,246,150,' + a * 0.18 + ')'); circ(c, x, y, 2.2, 'rgba(255,250,190,' + a + ')'); }
    } else if (theme === 'house' || theme === 'tower') {
      if (theme === 'tower') { clouds(c, camX, W, t, 0.03, 60 + vy, 5, 'rgba(255,255,255,.75)', 1); for (let i = 0; i < 16; i++) { const span = W + 300, x = ((i * 137 - camX * 0.1) % span + span) % span - 150, h = 150 + U.hash(i, 9) * 260; c.fillStyle = i % 2 ? '#e9a48a' : '#dd917c'; c.fillRect(x, H - h + vy * 2 + 60, 96, h + 400); c.fillStyle = 'rgba(255,240,200,.7)'; for (let k = 0; k < 6; k++) for (let j = 0; j < 3; j++) if (U.hash(i * 7 + k, j) > 0.4) c.fillRect(x + 14 + j * 26, H - h + vy * 2 + 80 + k * 36, 14, 18); } }
      else { for (let i = 0; i < 40; i++) star(c, U.hash(i, 1) * W, U.hash(i, 2) * H, 1.5 + U.hash(i, 3) * 2, 'rgba(255,255,255,' + (0.4 + 0.5 * Math.sin(t * 2 + i)) + ')', 4); }
    } else if (theme === 'caves') {
      for (let layer = 0; layer < 2; layer++) {
        const par = 0.15 + layer * 0.2; c.fillStyle = layer ? '#2c2358' : '#332a63';
        c.beginPath(); c.moveTo(0, 0); for (let x = 0; x <= W + 30; x += 30) { const wx = Math.floor((x + camX * par) / 30); c.lineTo(x, 60 + layer * 30 + U.hash(wx, layer) * 150); } c.lineTo(W + 30, 0); c.fill();
        c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W + 30; x += 30) { const wx = Math.floor((x + camX * par) / 30); c.lineTo(x, H - 60 - layer * 20 - U.hash(wx, layer + 9) * 120); } c.lineTo(W + 30, H); c.fill();
      }
      for (let i = 0; i < 30; i++) { const span = W + 200, x = ((U.hash(i, 4) * span - camX * 0.3) % span + span) % span - 100, y = U.hash(i, 5) * H, col = ['#ff7eb6', '#7fe3ff', '#b77bff', '#ffe066'][i % 4], a = 0.3 + 0.5 * (Math.sin(t * 1.5 + i) + 1) / 2; c.globalAlpha = a; poly(c, [x, y - 12, x + 6, y, x, y + 12, x - 6, y], col); c.globalAlpha = a * 0.25; circ(c, x, y, 20, col); c.globalAlpha = 1; }
    } else if (theme === 'clouds') {
      for (let i = 0; i < 50; i++) star(c, U.hash(i, 1) * W, U.hash(i, 2) * H * 0.6, 1.5 + U.hash(i, 3) * 2.5, 'rgba(255,255,255,' + (0.4 + 0.5 * Math.sin(t * 2 + i)) + ')', 4);
      c.lineWidth = 16; ['#ff7a8a', '#ffb65e', '#ffe76a', '#8fe38f', '#7cc0ff', '#c59bff'].forEach((k, i) => { c.strokeStyle = k; c.globalAlpha = 0.55; c.beginPath(); c.arc(W * 0.5 - camX * 0.04, H + 180 + vy, 620 - i * 16, PI, TAU); c.stroke(); }); c.globalAlpha = 1;
      clouds(c, camX, W, t, 0.08, 120 + vy, 6, 'rgba(255,255,255,.55)', 1.5);
      clouds(c, camX, W, t, 0.25, 380 + vy, 6, 'rgba(255,255,255,.8)', 2);
    }
  };

  /* interior wallpaper (house, tower): drawn in world space behind the tiles */
  G.drawInterior = function (c, theme, x0, y0, x1, y1) {
    const th = G.THEMES[theme]; if (!th.inside) return;
    c.fillStyle = th.inside; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    c.fillStyle = th.inside2;
    for (let x = Math.floor(x0 / 96) * 96; x < x1; x += 96) {
      if (theme === 'house') c.fillRect(x, y0, 40, y1 - y0);
      else for (let y = Math.floor(y0 / 96) * 96; y < y1; y += 96) { poly(c, [x + 48, y + 24, x + 66, y + 48, x + 48, y + 72, x + 30, y + 48], th.inside2); }
    }
  };

  /* ---------- tiles ---------- */
  G.drawSolid = function (c, theme, x, y, gx, gy, openAbove) {
    const th = G.THEMES[theme], h = U.hash(gx, gy);
    if (theme === 'clouds') {
      c.fillStyle = openAbove ? '#fff' : th.soil; c.fillRect(x, y, T + 1, T + 1);
      if (openAbove) { circ(c, x + 12, y + 2, 14, '#fff'); circ(c, x + 36, y - 2, 16, '#fff'); }
      if (h > 0.6) circ(c, x + 10 + h * 20, y + 30, 5, 'rgba(180,170,240,.25)');
      return;
    }
    c.fillStyle = th.soil; c.fillRect(x, y, T + 1, T + 1);
    if (theme === 'house' || theme === 'tower') {
      c.strokeStyle = th.soilD; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, T - 1, T - 1);
      if (theme === 'tower') { c.beginPath(); c.moveTo(x, y + 24); c.lineTo(x + T, y + 24); c.moveTo(x + (gy % 2 ? 12 : 30), y); c.lineTo(x + (gy % 2 ? 12 : 30), y + 24); c.moveTo(x + (gy % 2 ? 30 : 12), y + 24); c.lineTo(x + (gy % 2 ? 30 : 12), y + T); c.stroke(); }
      else { c.beginPath(); c.moveTo(x, y + 16); c.lineTo(x + T, y + 16); c.moveTo(x, y + 32); c.lineTo(x + T, y + 32); c.stroke(); }
      if (openAbove) { c.fillStyle = th.top; c.fillRect(x, y, T + 1, 9); c.fillStyle = th.topD; c.fillRect(x, y + 9, T + 1, 3); }
      return;
    }
    c.fillStyle = th.soilD; circ(c, x + 8 + h * 30, y + 14 + U.hash(gy, gx) * 24, 4 + h * 3, th.soilD); if (h > 0.5) circ(c, x + 34 - h * 20, y + 34, 3, th.soilD);
    if (openAbove) {
      c.fillStyle = th.top; rr(c, x - 1, y - 5, T + 2, 19, [8, 8, 4, 4]); c.fill();
      c.fillStyle = th.topD; c.beginPath(); c.moveTo(x, y + 13); for (let i = 0; i <= 4; i++) c.quadraticCurveTo(x + i * 12 - 6, y + 20 + (i % 2) * 3, x + i * 12, y + 13); c.lineTo(x, y + 13); c.fill();
      c.fillStyle = th.top; c.fillRect(x, y + 4, T + 1, 10);
      if (theme !== 'caves') { c.strokeStyle = th.topD; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 8 + h * 8, y - 4); c.lineTo(x + 6 + h * 8, y - 10); c.moveTo(x + 30 + h * 8, y - 4); c.lineTo(x + 33 + h * 8, y - 9); c.stroke(); }
    }
  };
  G.drawPlat = function (c, theme, x, y, gx, left, right) {
    const k = G.THEMES[theme].plat;
    if (k === 'wood') { rr(c, x, y, T + 1, 14, [left ? 6 : 0, right ? 6 : 0, right ? 6 : 0, left ? 6 : 0]); c.fillStyle = '#c99158'; c.fill(); c.fillStyle = '#a87440'; c.fillRect(x, y + 10, T + 1, 4); c.fillStyle = '#e0ad74'; c.fillRect(x + 2, y + 2, T - 3, 3); if (gx % 2) { c.fillStyle = '#8d5a3b'; c.fillRect(x + 22, y + 14, 5, 8); } }
    else if (k === 'leaf') { c.fillStyle = '#5cbf4a'; rr(c, x, y, T + 1, 12, [left ? 12 : 0, right ? 12 : 0, right ? 12 : 0, left ? 12 : 0]); c.fill(); c.fillStyle = '#8be06a'; c.fillRect(x + (left ? 6 : 0), y + 2, T - (left ? 6 : 0) - (right ? 6 : 0) + 1, 3); c.strokeStyle = '#3f9a37'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 12, y + 6); c.lineTo(x + 20, y + 11); c.moveTo(x + 34, y + 6); c.lineTo(x + 28, y + 11); c.stroke(); }
    else if (k === 'shelf') { c.fillStyle = '#e0b07a'; c.fillRect(x, y, T + 1, 10); c.fillStyle = '#b98652'; c.fillRect(x, y + 10, T + 1, 4); if (left || right) { c.fillStyle = '#8d5a3b'; poly(c, left ? [x + 4, y + 14, x + 16, y + 14, x + 4, y + 26] : [x + T - 4, y + 14, x + T - 16, y + 14, x + T - 4, y + 26], '#8d5a3b'); } }
    else if (k === 'stone') { rr(c, x, y, T + 1, 16, [left ? 8 : 0, right ? 8 : 0, right ? 8 : 0, left ? 8 : 0]); c.fillStyle = '#8b79c9'; c.fill(); c.fillStyle = '#a998e0'; c.fillRect(x + 2, y + 2, T - 3, 4); }
    else { circ(c, x + 12, y + 10, 13, '#fff'); circ(c, x + 36, y + 9, 14, '#fff'); c.fillStyle = '#fff'; c.fillRect(x, y + 6, T + 1, 12); c.fillStyle = 'rgba(190,180,255,.35)'; c.fillRect(x + 4, y + 17, T - 8, 3); }
  };
  G.drawWater = function (c, theme, x, y, top, t) {
    const col = theme === 'caves' ? ['#7fe3ff', '#4fb3e8'] : theme === 'woods' ? ['#6fd0c4', '#3fa39a'] : ['#8fdcff', '#52b8f0'];
    c.fillStyle = col[1]; c.fillRect(x, y + (top ? 12 : 0), T + 1, T + 1 - (top ? 12 : 0));
    if (top) { c.fillStyle = col[0]; c.beginPath(); c.moveTo(x, y + 20); for (let i = 0; i <= 4; i++) c.lineTo(x + i * 12, y + 12 + Math.sin(t * 3 + (x + i * 12) * 0.05) * 4); c.lineTo(x + T, y + 22); c.lineTo(x, y + 22); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(x + 8 + Math.sin(t * 2 + x) * 6, y + 18, 12, 2.5); }
  };

  /* ---------- props. Each is drawn with (0,0) at its base on the ground. ---------- */
  const win = (c, x, y, w, h, night) => { rr(c, x, y, w, h, 6); c.fillStyle = night ? '#ffe9a0' : '#bfe9ff'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke(); c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke(); };
  const D = {
    tree(c, d, t) { const s = d.s || 1, sw = Math.sin(t * 1.2 + d.x) * 3; c.fillStyle = '#8d5a3b'; rr(c, -11 * s, -110 * s, 22 * s, 112 * s, 6); c.fill(); const col = d.col || '#5cbf62'; circ(c, sw, -150 * s, 62 * s, shade(col, -0.12)); circ(c, -46 * s + sw, -110 * s, 40 * s, col); circ(c, 46 * s + sw, -112 * s, 42 * s, col); circ(c, sw, -160 * s, 50 * s, col); circ(c, -18 * s + sw, -175 * s, 14 * s, shade(col, 0.2)); if (d.v) for (let i = 0; i < 5; i++) circ(c, Math.cos(i * 2.2) * 40 * s + sw, -140 * s + Math.sin(i * 3.1) * 30 * s, 6 * s, d.v === 2 ? '#ffb3d1' : '#ff5a5a'); },
    pine(c, d, t) { const s = d.s || 1; c.fillStyle = '#6b4a30'; c.fillRect(-8 * s, -40 * s, 16 * s, 42 * s); for (let i = 0; i < 4; i++) poly(c, [-(58 - i * 11) * s, -(30 + i * 42) * s, 0, -(110 + i * 42) * s, (58 - i * 11) * s, -(30 + i * 42) * s], i % 2 ? '#2f7d5a' : '#27704f'); },
    bigtree(c, d, t) { c.fillStyle = '#6b4a30'; c.beginPath(); c.moveTo(-50, 2); c.quadraticCurveTo(-28, -60, -30, -330); c.lineTo(34, -330); c.quadraticCurveTo(30, -60, 56, 2); c.fill(); c.strokeStyle = '#573a24'; c.lineWidth = 3; c.beginPath(); c.moveTo(-8, -40); c.quadraticCurveTo(-14, -160, -6, -300); c.moveTo(14, -20); c.quadraticCurveTo(18, -120, 10, -220); c.stroke(); ell(c, 2, -150, 14, 20, '#3d2817'); circ(c, 0, -360, 130, '#2f7d5a'); circ(c, -110, -310, 80, '#2f7d5a'); circ(c, 110, -320, 90, '#358a63'); },
    bush(c, d) { const col = d.col || '#5cbf62'; circ(c, -18, -12, 18, col); circ(c, 16, -12, 20, col); circ(c, 0, -24, 22, shade(col, 0.1)); if (d.v) { circ(c, -10, -20, 4, '#ff5a72'); circ(c, 12, -14, 4, '#ff5a72'); circ(c, 2, -30, 4, '#ff5a72'); } },
    flower(c, d, t) { const sw = Math.sin(t * 2 + d.x) * 2, col = d.col || ['#ff7eb6', '#ffe066', '#b77bff', '#ff8a5a', '#ffffff'][Math.floor(U.hash(d.x) * 5)], h = 20 + U.hash(d.x, 2) * 14; c.strokeStyle = '#4aa84a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(sw, -h / 2, sw, -h); c.stroke(); ell(c, 5, -h * 0.4, 6, 3, '#5cbf62', -0.5); for (let i = 0; i < 6; i++) circ(c, sw + Math.cos(i * TAU / 6) * 6.5, -h + Math.sin(i * TAU / 6) * 6.5, 4.6, col); circ(c, sw, -h, 4, col === '#ffe066' ? '#ff9f43' : '#ffe066'); },
    bigflower(c, d, t) { const sw = Math.sin(t * 1.3 + d.x) * 5, col = d.col || ['#ff7eb6', '#ffd95e', '#c7a6ff', '#ff8a7a'][Math.floor(U.hash(d.x) * 4)], h = d.h || 200; c.strokeStyle = '#4fae45'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-14, -h / 2, sw, -h); c.stroke(); ell(c, 26, -h * 0.35, 32, 13, '#62c455', -0.4); ell(c, -30, -h * 0.55, 30, 12, '#62c455', 0.4); for (let i = 0; i < 9; i++) ell(c, sw + Math.cos(i * TAU / 9) * 42, -h + Math.sin(i * TAU / 9) * 42, 26, 17, col, i * TAU / 9); circ(c, sw, -h, 30, '#ffe9a0'); for (let i = 0; i < 9; i++) circ(c, sw + Math.cos(i * 2.4) * (8 + i * 1.8), -h + Math.sin(i * 2.4) * (8 + i * 1.8), 2.4, '#e5a93c'); },
    mushroom(c, d) { const s = d.s || 1, col = d.col || '#ff5a5a'; c.fillStyle = '#fff3dd'; rr(c, -7 * s, -22 * s, 14 * s, 24 * s, 5); c.fill(); c.beginPath(); c.arc(0, -20 * s, 22 * s, PI, TAU); c.closePath(); c.fillStyle = col; c.fill(); circ(c, -9 * s, -30 * s, 4 * s, '#fff'); circ(c, 7 * s, -34 * s, 3.5 * s, '#fff'); circ(c, 12 * s, -25 * s, 2.5 * s, '#fff'); },
    rock(c, d) { const s = d.s || 1; c.fillStyle = d.col || '#b9b4c4'; c.beginPath(); c.moveTo(-26 * s, 2); c.quadraticCurveTo(-24 * s, -30 * s, -4 * s, -32 * s); c.quadraticCurveTo(24 * s, -30 * s, 28 * s, 2); c.fill(); ell(c, -8 * s, -22 * s, 8 * s, 4 * s, 'rgba(255,255,255,.3)', -0.4); },
    fence(c, d) { const n = d.n || 4; c.fillStyle = '#fff7ea'; for (let i = 0; i < n; i++) { rr(c, i * 20 - 4, -38, 9, 40, [4, 4, 0, 0]); c.fill(); } c.fillRect(-8, -30, n * 20, 5); c.fillRect(-8, -16, n * 20, 5); },
    lamp(c, d, t) { c.fillStyle = '#4b4453'; c.fillRect(-3, -120, 6, 122); rr(c, -9, -4, 18, 6, 2); c.fill(); circ(c, 0, -130, 44, 'rgba(255,230,140,' + (0.16 + Math.sin(t * 3) * 0.03) + ')'); rr(c, -11, -146, 22, 28, 6); c.fillStyle = '#ffe9a0'; c.fill(); c.strokeStyle = '#4b4453'; c.lineWidth = 3; c.stroke(); },
    cottage(c, d, t) { const col = d.col || '#ffe1bd', roof = d.roof || '#e8615a', w = d.w || 230, h = 150; rr(c, -w / 2, -h, w, h + 2, 6); c.fillStyle = col; c.fill(); poly(c, [-w / 2 - 22, -h + 6, 0, -h - 100, w / 2 + 22, -h + 6], roof); c.fillStyle = shade(roof, -0.15); for (let i = 0; i < 4; i++) c.fillRect(-w / 2 - 10 + i * 6, -h + 2 - i * 0, w + 20 - i * 12, 4); c.fillStyle = '#b55'; c.fillRect(w / 4, -h - 90, 22, 54); win(c, -w / 2 + 22, -112, 50, 50); if (w > 200) win(c, w / 2 - 72, -112, 50, 50); circ(c, 0, -h - 34, 15, '#bfe9ff'); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke(); if (d.label) { rr(c, -70, -h + 8, 140, 28, 8); c.fillStyle = '#fff'; c.fill(); c.fillStyle = '#7a4a2a'; c.font = '600 17px ' + G.FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(d.label, 0, -h + 23); } },
    stall(c, d) { c.fillStyle = '#c99158'; c.fillRect(-60, -50, 120, 52); c.fillStyle = '#8d5a3b'; c.fillRect(-58, -130, 6, 82); c.fillRect(52, -130, 6, 82); for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#fff' : (d.col || '#ff7eb6'); c.beginPath(); c.moveTo(-72 + i * 24, -150); c.lineTo(-48 + i * 24, -150); c.lineTo(-48 + i * 24, -122); c.arc(-60 + i * 24, -122, 12, 0, PI); c.fill(); } if (d.label) { G.emoji(c, d.label, 0, -74, 34); } },
    hive(c, d, t) { c.fillStyle = '#8d5a3b'; c.fillRect(-26, -12, 6, 14); c.fillRect(20, -12, 6, 14); for (let i = 0; i < 5; i++) { ell(c, 0, -22 - i * 15, 38 - i * 6, 11, i % 2 ? '#f2b33d' : '#ffc94d'); } ell(c, 0, -30, 9, 11, '#5a3a1a'); },
    sign(c, d) { c.fillStyle = '#8d5a3b'; c.fillRect(-4, -46, 8, 48); rr(c, -34, -76, 68, 40, 6); c.fillStyle = '#e8c08e'; c.fill(); c.strokeStyle = '#8d5a3b'; c.lineWidth = 3; c.stroke(); G.emoji(c, d.icon || '❗', 0, -55, 24); },
    cafe(c, d, t) { rr(c, -170, -190, 340, 192, 10); c.fillStyle = '#f7e2c0'; c.fill(); c.fillStyle = '#7a5a3d'; c.fillRect(-170, -40, 340, 42); poly(c, [-195, -184, -150, -260, 150, -260, 195, -184], '#4f8a6a'); for (let i = 0; i < 7; i++) { c.fillStyle = i % 2 ? '#fff' : '#ff7a6a'; c.beginPath(); c.moveTo(-175 + i * 50, -190); c.lineTo(-125 + i * 50, -190); c.lineTo(-125 + i * 50, -165); c.arc(-150 + i * 50, -165, 25, 0, PI); c.fill(); } win(c, -140, -130, 80, 70, true); win(c, 60, -130, 80, 70, true); rr(c, -92, -252, 184, 40, 10); c.fillStyle = '#fff6e0'; c.fill(); c.fillStyle = '#7a4a2a'; c.font = '700 20px ' + G.FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Twiggy Spoon Café', 0, -231); c.fillStyle = '#b55'; c.fillRect(110, -300, 24, 50); for (let i = 0; i < 3; i++) circ(c, 122 + Math.sin(t + i) * 6, -316 - i * 22 - (t * 14 % 22), 9 + i * 3, 'rgba(255,255,255,' + (0.5 - i * 0.14) + ')'); },
    table(c, d) { c.fillStyle = '#8d5a3b'; c.fillRect(-4, -34, 8, 36); ell(c, 0, 0, 16, 4, '#7a4a2a'); ell(c, 0, -36, 38, 9, d.col || '#fff'); if (d.cloth) { c.fillStyle = d.cloth; c.beginPath(); c.arc(0, -36, 38, 0, PI); c.fill(); ell(c, 0, -36, 38, 9, shade(d.cloth, 0.25)); } if (d.icon) G.emoji(c, d.icon, 0, -54, 24); },
    stool(c, d) { c.fillStyle = '#8d5a3b'; c.fillRect(-9, -18, 4, 20); c.fillRect(5, -18, 4, 20); rr(c, -13, -24, 26, 8, 4); c.fillStyle = d.col || '#ff7a6a'; c.fill(); },
    bed(c, d, t) { rr(c, -90, -34, 180, 30, 6); c.fillStyle = '#8d5a3b'; c.fill(); rr(c, -96, -70, 14, 72, 5); c.fill(); rr(c, 82, -52, 14, 54, 5); c.fill(); rr(c, -82, -48, 164, 22, 8); c.fillStyle = '#fff'; c.fill(); rr(c, -80, -58, 44, 20, 10); c.fillStyle = '#eef'; c.fill(); rr(c, -40, -56, 124, 32, 12); c.fillStyle = d.col || '#ff9ec7'; c.fill(); if (d.mum) { circ(c, -58, -62, 15, '#f6cfa6'); c.beginPath(); c.arc(-60, -64, 16, PI * 0.7, PI * 1.9); c.fillStyle = '#7a4a2a'; c.fill(); circ(c, -76, -58, 9, '#7a4a2a'); c.strokeStyle = '#2b2118'; c.lineWidth = 1.6; c.beginPath(); c.arc(-52, -62, 3, 0.2, PI - 0.2); c.stroke(); ell(c, 10, -54, 60, 20 + Math.sin(t * 1.5) * 2, d.col || '#ff9ec7'); c.fillStyle = '#fff'; c.font = '700 ' + (16 + (t * 0.6 % 1) * 12) + 'px ' + G.FONT; c.globalAlpha = 1 - (t * 0.6 % 1); c.fillText('z', -40 + (t * 0.6 % 1) * 26, -86 - (t * 0.6 % 1) * 40); c.globalAlpha = 1; } },
    window(c, d, t) { const w = d.w || 70, h = d.h || 90, y = -(d.up || 120) - h; rr(c, -w / 2, y, w, h, [w / 2, w / 2, 6, 6]); c.save(); c.clip(); const night = d.night; c.fillStyle = night ? '#1a1f45' : '#9fdcff'; c.fillRect(-w / 2, y, w, h); if (night) { circ(c, 8, y + 30, 13, '#fff6c9'); circ(c, 14, y + 26, 11, '#1a1f45'); star(c, -16, y + 20, 3, '#fff', 4); star(c, -8, y + 56, 2.4, '#fff', 4); } else { circ(c, -8, y + 34, 12, '#fff'); circ(c, 6, y + 30, 14, '#fff'); c.fillStyle = '#8ad184'; c.fillRect(-w / 2, y + h - 22, w, 22); } c.restore(); c.strokeStyle = night ? '#6a74b8' : '#fff'; c.lineWidth = 6; rr(c, -w / 2, y, w, h, [w / 2, w / 2, 6, 6]); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(0, y); c.lineTo(0, y + h); c.moveTo(-w / 2, y + h * 0.55); c.lineTo(w / 2, y + h * 0.55); c.stroke(); if (night) { c.fillStyle = 'rgba(190,210,255,.07)'; poly(c, [-w / 2, y + h, w / 2, y + h, w / 2 + 80, 0, -w / 2 + 30, 0], c.fillStyle); } },
    picture(c, d) { const y = -(d.up || 130); rr(c, -28, y - 44, 56, 46, 4); c.fillStyle = d.col || '#ffe9a0'; c.fill(); c.strokeStyle = '#c99158'; c.lineWidth = 5; c.stroke(); G.emoji(c, d.icon || '🌻', 0, y - 20, 26); },
    bookshelf(c, d) { rr(c, -44, -130, 88, 132, 5); c.fillStyle = '#8d5a3b'; c.fill(); for (let r = 0; r < 3; r++) { c.fillStyle = '#5f3d22'; c.fillRect(-38, -122 + r * 42, 76, 34); for (let i = 0; i < 8; i++) { const hh = 22 + U.hash(i, r + d.x) * 10; c.fillStyle = ['#ff7a6a', '#ffd95e', '#7ed957', '#4aa8ff', '#b77bff', '#ff9ec7'][Math.floor(U.hash(i + d.x, r) * 6)]; c.fillRect(-36 + i * 9, -88 + r * 42 - hh, 7.5, hh); } } },
    clock(c, d, t) { const y = -(d.up || 150); circ(c, 0, y, 24, '#fff'); c.strokeStyle = '#c99158'; c.lineWidth = 5; c.stroke(); c.strokeStyle = '#3b3350'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, y); c.lineTo(0, y - 15); c.moveTo(0, y); c.lineTo(9, y + 4); c.stroke(); },
    grandclock(c, d, t) { rr(c, -22, -170, 44, 172, 6); c.fillStyle = '#7d5230'; c.fill(); circ(c, 0, -140, 17, '#fff7e0'); c.strokeStyle = '#3b3350'; c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -140); c.lineTo(0, -152); c.moveTo(0, -140); c.lineTo(7, -137); c.stroke(); rr(c, -13, -112, 26, 90, 4); c.fillStyle = '#5f3d22'; c.fill(); const a = Math.sin(t * 2) * 0.3; c.strokeStyle = '#ffd24a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -108); c.lineTo(Math.sin(a) * 60, -108 + Math.cos(a) * 60); c.stroke(); circ(c, Math.sin(a) * 60, -108 + Math.cos(a) * 60, 7, '#ffd24a'); },
    plant(c, d, t) { rr(c, -14, -24, 28, 26, [2, 2, 8, 8]); c.fillStyle = '#e58f5a'; c.fill(); for (let i = -2; i <= 2; i++) ell(c, i * 9 + Math.sin(t + i) * 1.5, -40 - (2 - Math.abs(i)) * 8, 6, 22, i % 2 ? '#4fae45' : '#62c455', i * 0.3); },
    sofa(c, d) { rr(c, -70, -62, 140, 46, 16); c.fillStyle = shade(d.col || '#7fb6d9', -0.12); c.fill(); rr(c, -80, -40, 160, 36, 12); c.fillStyle = d.col || '#7fb6d9'; c.fill(); rr(c, -86, -52, 24, 50, 10); c.fill(); rr(c, 62, -52, 24, 50, 10); c.fill(); },
    wardrobe(c, d) { rr(c, -44, -150, 88, 152, 8); c.fillStyle = '#b98652'; c.fill(); c.strokeStyle = '#8d5a3b'; c.lineWidth = 3; c.stroke(); c.beginPath(); c.moveTo(0, -146); c.lineTo(0, -4); c.stroke(); circ(c, -7, -74, 3.5, '#ffd24a'); circ(c, 7, -74, 3.5, '#ffd24a'); },
    fridge(c, d) { rr(c, -34, -140, 68, 142, 10); c.fillStyle = '#e9f3f7'; c.fill(); c.strokeStyle = '#b9cbd4'; c.lineWidth = 2.5; c.stroke(); c.beginPath(); c.moveTo(-34, -92); c.lineTo(34, -92); c.stroke(); c.fillStyle = '#9fb2bd'; rr(c, 20, -124, 5, 22, 2); c.fill(); rr(c, 20, -82, 5, 30, 2); c.fill(); G.emoji(c, '🧲', -10, -112, 16); },
    toybox(c, d) { rr(c, -34, -32, 68, 34, 6); c.fillStyle = '#ff9f43'; c.fill(); star(c, 0, -15, 9, '#ffe066'); G.emoji(c, '🧸', -14, -44, 26); G.emoji(c, '🪀', 16, -42, 20); },
    rug(c, d) { ell(c, 0, -2, d.w || 90, 7, d.col || '#ff9ec7'); ell(c, 0, -2, (d.w || 90) * 0.7, 4.5, 'rgba(255,255,255,.4)'); },
    bath(c, d, t) { rr(c, -70, -44, 140, 42, [8, 8, 24, 24]); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#cfe0ea'; c.lineWidth = 3; c.stroke(); for (let i = 0; i < 6; i++) circ(c, -50 + i * 20, -48 - Math.abs(Math.sin(t + i)) * 6, 10, 'rgba(255,255,255,.9)'); G.emoji(c, '🦆', 20, -60, 22); },
    stove(c, d, t) { rr(c, -40, -70, 80, 72, 6); c.fillStyle = '#d9dee6'; c.fill(); rr(c, -30, -46, 60, 38, 5); c.fillStyle = '#3b3350'; c.fill(); c.fillStyle = '#ff9f43'; c.globalAlpha = 0.6 + Math.sin(t * 5) * 0.2; rr(c, -24, -40, 48, 26, 4); c.fill(); c.globalAlpha = 1; rr(c, -22, -92, 44, 22, [4, 4, 10, 10]); c.fillStyle = '#6b7280'; c.fill(); for (let i = 0; i < 3; i++) circ(c, -8 + i * 8 + Math.sin(t * 2 + i) * 3, -104 - (t * 20 + i * 12) % 36, 6, 'rgba(255,255,255,.4)'); },
    crystal(c, d, t) { const col = d.col || ['#ff7eb6', '#7fe3ff', '#b77bff', '#ffe066', '#7ed957'][Math.floor(U.hash(d.x) * 5)], s = d.s || 1; circ(c, 0, -30 * s, 50 * s, col + '22'); poly(c, [-10 * s, 2, -16 * s, -34 * s, -6 * s, -52 * s, 4 * s, -34 * s, 2 * s, 2], col); poly(c, [-6 * s, -52 * s, 4 * s, -34 * s, 2 * s, 2, -5 * s, -30 * s], shade(col, -0.2)); poly(c, [4 * s, 2, 8 * s, -24 * s, 16 * s, -34 * s, 22 * s, -20 * s, 20 * s, 2], shade(col, 0.2)); poly(c, [-24 * s, 2, -26 * s, -14 * s, -20 * s, -22 * s, -14 * s, -12 * s, -14 * s, 2], shade(col, 0.1)); star(c, -8 * s, -40 * s, 3 + Math.sin(t * 3 + d.x) * 2, '#fff', 4); },
    stalactite(c, d) { const s = d.s || 1; poly(c, [-18 * s, -T * (d.up || 6), 0, -T * (d.up || 6) + 80 * s, 18 * s, -T * (d.up || 6)], '#5d4c99'); },
    minecart(c, d) { poly(c, [-36, -44, 36, -44, 28, -12, -28, -12], '#8d6540'); c.strokeStyle = '#5f432c'; c.lineWidth = 3; c.stroke(); circ(c, -18, -8, 9, '#3b3350'); circ(c, 18, -8, 9, '#3b3350'); G.emoji(c, '💎', -8, -52, 22); G.emoji(c, '💎', 12, -50, 18); },
    castle(c, d, t) { c.fillStyle = '#fff'; rr(c, -180, -260, 360, 262, 8); c.fill(); for (const x of [-210, -60, 90]) { rr(c, x, -380, 120, 382, 8); c.fillStyle = '#f7f1ff'; c.fill(); poly(c, [x - 16, -372, x + 60, -480, x + 136, -372], ['#ff8fb8', '#b98bff', '#7cc0ff'][(x + 210) / 150]); c.fillStyle = '#ffe066'; c.fillRect(x + 58, -520, 4, 44); poly(c, [x + 62, -520, x + 96, -508, x + 62, -496], '#ff5a72'); rr(c, x + 44, -330, 32, 50, [16, 16, 4, 4]); c.fillStyle = '#ffe9a0'; c.fill(); } c.fillStyle = '#e9e0ff'; for (let i = 0; i < 9; i++) c.fillRect(-180 + i * 42, -278, 24, 22); },
    rainbow(c, d) { c.lineWidth = 10; ['#ff7a8a', '#ffb65e', '#ffe76a', '#8fe38f', '#7cc0ff', '#c59bff'].forEach((k, i) => { c.strokeStyle = k; c.beginPath(); c.arc(0, 0, (d.r || 200) - i * 10, PI, TAU); c.stroke(); }); },
    tent(c, d) { poly(c, [-80, 2, 0, -130, 80, 2], d.col || '#ff7a6a'); poly(c, [-20, 2, 0, -70, 20, 2], '#3b3350'); for (let i = 0; i < 5; i++) poly(c, [-64 + i * 32 - 12, -30 - (i === 2 ? 76 : (i % 2 ? 50 : 20)) + 16, -64 + i * 32, -30 - (i === 2 ? 76 : (i % 2 ? 50 : 20)) + 30, -64 + i * 32 + 12, -30 - (i === 2 ? 76 : (i % 2 ? 50 : 20)) + 16], 'rgba(255,255,255,.0)'); c.fillStyle = '#ffe066'; c.fillRect(-2, -160, 4, 32); poly(c, [2, -160, 26, -152, 2, -144], '#ffe066'); },
    shoeshelf(c, d) { rr(c, -50, -100, 100, 102, 5); c.fillStyle = '#c99158'; c.fill(); const sh = ['👟', '👠', '🥾', '👢', '🩰', '👞', '🥿', '🩴', '⛸️']; for (let r = 0; r < 3; r++) { c.fillStyle = '#8d5a3b'; c.fillRect(-46, -68 + r * 32, 92, 4); for (let i = 0; i < 3; i++) G.emoji(c, sh[(r * 3 + i + Math.floor(d.x)) % 9], -30 + i * 30, -80 + r * 32, 20); } },
    teapot(c, d, t) { ell(c, 0, -80, 130, 84, '#ff9ec7'); ell(c, 0, -80, 130, 84); c.strokeStyle = '#fff'; c.lineWidth = 6; c.stroke(); c.strokeStyle = '#ff9ec7'; c.lineWidth = 18; c.beginPath(); c.arc(-140, -80, 40, PI * 0.5, PI * 1.5); c.stroke(); c.beginPath(); c.moveTo(120, -70); c.quadraticCurveTo(190, -80, 180, -150); c.stroke(); ell(c, 0, -164, 50, 12, '#ff7eb6'); circ(c, 0, -180, 14, '#ffe066'); for (let i = 0; i < 5; i++) circ(c, -70 + i * 35, -80 + (i % 2) * 20, 9, '#fff'); for (let i = 0; i < 3; i++) circ(c, 186 + Math.sin(t + i) * 8, -170 - i * 24 - (t * 16 % 24), 10 + i * 4, 'rgba(255,255,255,' + (0.6 - i * 0.18) + ')'); },
    towerext(c, d, t) { rr(c, -90, -520, 180, 522, 8); c.fillStyle = '#f3c9a5'; c.fill(); c.strokeStyle = '#d9a078'; c.lineWidth = 4; c.stroke(); for (let r = 0; r < 6; r++) for (let i = 0; i < 2; i++) { rr(c, -62 + i * 76, -490 + r * 78, 48, 52, [24, 24, 4, 4]); c.fillStyle = '#bfe9ff'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke(); } c.save(); c.translate(0, -520); c.scale(0.55, 0.55); D.teapot(c, d, t); c.restore(); },
    cavemouth(c, d) { c.fillStyle = '#6b6480'; c.beginPath(); c.moveTo(-130, 2); c.quadraticCurveTo(-130, -210, 0, -220); c.quadraticCurveTo(140, -210, 130, 2); c.fill(); c.fillStyle = '#1b1638'; c.beginPath(); c.moveTo(-70, 2); c.quadraticCurveTo(-70, -140, 0, -146); c.quadraticCurveTo(74, -140, 70, 2); c.fill(); D.crystal(c, { x: 3, s: 0.6, col: '#b77bff' }, 0); },
    well(c, d) { rr(c, -30, -34, 60, 36, 6); c.fillStyle = '#b9b4c4'; c.fill(); c.fillStyle = '#8d5a3b'; c.fillRect(-28, -90, 6, 58); c.fillRect(22, -90, 6, 58); poly(c, [-40, -88, 0, -120, 40, -88], '#e8615a'); },
    bench(c, d) { c.fillStyle = '#8d5a3b'; c.fillRect(-34, -22, 5, 24); c.fillRect(29, -22, 5, 24); rr(c, -42, -28, 84, 8, 3); c.fillStyle = '#c99158'; c.fill(); rr(c, -42, -50, 84, 8, 3); c.fill(); },
    mailbox(c, d) { c.fillStyle = '#8d5a3b'; c.fillRect(-3, -40, 6, 42); rr(c, -18, -66, 36, 28, [14, 14, 4, 4]); c.fillStyle = '#e8402f'; c.fill(); c.fillStyle = '#fff'; c.fillRect(-10, -52, 20, 3); },
    bunting(c, d) { const w = d.w || 300, y = -(d.up || 200); c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, y); c.quadraticCurveTo(w / 2, y + 40, w, y); c.stroke(); for (let i = 1; i < 10; i++) { const q = i / 10, x = w * q, yy = y + 80 * q * (1 - q) * 2; poly(c, [x - 9, yy, x + 9, yy, x, yy + 20], ['#ff7a8a', '#ffe76a', '#8fe38f', '#7cc0ff', '#c59bff'][i % 5]); } },
    beanstalk(c, d, t) { const h = d.h || 500; c.strokeStyle = '#4fae45'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); for (let y = 0; y <= h; y += 40) c.lineTo(Math.sin(y * 0.03) * 16, -y); c.stroke(); for (let y = 50; y < h; y += 70) ell(c, Math.sin(y * 0.03) * 16 + (y % 140 ? 26 : -26), -y, 26, 10, '#62c455', y % 140 ? -0.3 : 0.3); },
    cauldron(c, d, t) { for (let i = 0; i < 3; i++) circ(c, -10 + i * 10 + Math.sin(t * 2 + i) * 3, -50 - (t * 18 + i * 14) % 40, 6, 'rgba(160,255,160,.5)'); ell(c, 0, -22, 30, 24, '#3b3350'); ell(c, 0, -40, 28, 8, '#7ed957'); c.strokeStyle = '#3b3350'; c.lineWidth = 5; ell(c, 0, -40, 29, 8); c.stroke(); },
    cobweb(c, d) { const y = -(d.up || 250); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1.2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(0, y); c.lineTo(Math.cos(i * 0.39) * 70, y + Math.sin(i * 0.39) * 70); c.stroke(); } for (let r = 20; r < 70; r += 16) { c.beginPath(); c.arc(0, y, r, 0, PI / 2); c.stroke(); } },
    stairs(c, d) { for (let i = 0; i < (d.n || 4); i++) { c.fillStyle = i % 2 ? '#b98652' : '#c99158'; c.fillRect(i * 24 * (d.flip ? -1 : 1) - (d.flip ? 24 : 0), -(i + 1) * 24, 24, (i + 1) * 24 + 2); } },
    cloudpuff(c, d, t) { cloudShape(c, -40 + Math.sin(t * 0.5 + d.x) * 8, -(d.up || 200), d.s || 1, 'rgba(255,255,255,.85)'); },
    campfire(c, d, t) { c.fillStyle = '#8d5a3b'; c.save(); c.rotate(0.3); c.fillRect(-22, -8, 44, 8); c.restore(); c.save(); c.rotate(-0.3); c.fillRect(-22, -8, 44, 8); c.restore(); circ(c, 0, -24, 46, 'rgba(255,180,80,.15)'); for (let i = 0; i < 3; i++) { const f = Math.sin(t * 9 + i * 2) * 4; poly(c, [-14 + i * 4, -6, 0 + f * 0.4, -44 - f + i * 10, 14 - i * 4, -6], ['#ff7a3a', '#ffb23a', '#ffe76a'][i]); } },
    logpile(c, d) { for (let i = 0; i < 3; i++) { circ(c, -20 + i * 20, -10, 10, '#a57142'); circ(c, -20 + i * 20, -10, 6, '#d9b382'); } for (let i = 0; i < 2; i++) { circ(c, -10 + i * 20, -27, 10, '#a57142'); circ(c, -10 + i * 20, -27, 6, '#d9b382'); } },
    emoji(c, d) { G.emoji(c, d.icon, 0, -(d.up || 0) - (d.size || 30) / 2, d.size || 30); },
  };
  G.drawDecor = function (c, d, t) { const f = D[d.k]; if (!f) return; c.save(); c.translate(d.x, d.y); f(c, d, t); c.restore(); };
  G.DECOR = D;

  /* doors & gates */
  G.drawDoor = function (c, x, y, d, t) {
    c.save(); c.translate(x, y);
    const st = d.style || 'door';
    if (st === 'gate') {
      const open = d.open; c.fillStyle = '#b9b4c4'; rr(c, -62, -168, 124, 170, [62, 62, 4, 4]); c.fill(); c.fillStyle = '#9d97ab'; for (let i = 0; i < 7; i++) { const a = PI + i * PI / 6; circ(c, Math.cos(a) * 54, -106 + Math.sin(a) * 54, 3, '#8a8499'); }
      rr(c, -44, -146, 88, 148, [44, 44, 0, 0]);
      if (open) { const g = c.createLinearGradient(0, -146, 0, 0); g.addColorStop(0, d.glow || '#fff6c9'); g.addColorStop(1, '#ffffff'); c.fillStyle = g; c.fill(); for (let i = 0; i < 5; i++) star(c, -28 + U.hash(i, d.x) * 56, -20 - ((t * 30 + i * 30) % 120), 3 + U.hash(i) * 3, 'rgba(255,255,255,.9)', 4); }
      else { c.fillStyle = '#7a5a3d'; c.fill(); c.strokeStyle = '#5f432c'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -146); c.lineTo(0, 0); c.moveTo(-22, -138); c.lineTo(-22, 0); c.moveTo(22, -138); c.lineTo(22, 0); c.stroke(); rr(c, -13, -84, 26, 30, 6); c.fillStyle = '#ffd24a'; c.fill(); circ(c, 0, -72, 4.5, '#5f432c'); c.fillStyle = '#5f432c'; c.fillRect(-2, -72, 4, 11); }
      if (d.icon) { circ(c, 0, -186, 22, '#fff'); c.strokeStyle = '#ffd24a'; c.lineWidth = 4; c.stroke(); G.emoji(c, d.icon, 0, -185, 24); }
    } else {
      rr(c, -30, -100, 60, 102, [30, 30, 0, 0]); c.fillStyle = d.col || '#e8615a'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 5; c.stroke();
      c.strokeStyle = shade(d.col || '#e8615a', -0.18); c.lineWidth = 2.5; rr(c, -18, -50, 36, 40, 4); c.stroke(); circ(c, 0, -72, 11, 'rgba(255,255,255,.35)'); circ(c, 17, -46, 4, '#ffd24a');
      if (d.icon) { circ(c, 0, -124, 19, '#fff'); G.emoji(c, d.icon, 0, -123, 22); }
    }
    c.restore();
  };
})();

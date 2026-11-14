/* Hazelnut Hollow — procedural bug art for Bugglemead (SPEC §7.2e). G.drawBug(c, kind, x, y, s, {t, face, fly, still}). */
(function () {
  'use strict';
  const G = window.G, PI = Math.PI, TAU = PI * 2;

  /* ---------- tiny local helpers ---------- */
  const circ = (c, x, y, r, col) => { c.beginPath(); c.arc(x, y, r, 0, TAU); if (col) { c.fillStyle = col; c.fill(); } };
  const ell = (c, x, y, rx, ry, col, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); if (col) { c.fillStyle = col; c.fill(); } };
  const line = (c, x1, y1, x2, y2, col, w) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
  const path = (c, pts, col, w) => {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke();
  };
  const INK = '#2b2233';
  const eye = (c, x, y, r) => { circ(c, x, y, r, '#fff'); circ(c, x + r * 0.2, y + r * 0.1, r * 0.58, INK); circ(c, x + r * 0.4, y - r * 0.2, r * 0.24, '#fff'); };
  const smile = (c, x, y, r, w = 1) => { c.strokeStyle = INK; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, 0.15 * PI, 0.85 * PI); c.stroke(); };
  const sh = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16), f = v => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
    return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
  };

  /* Each drawer works in local units, facing right, ground at y = 0, body about 26-34 units long. */
  const DRAW = {};

  DRAW.ladybird = (c, T, still) => {
    const w = still ? 0 : Math.sin(T * 4);
    // far legs (3) peek over the top edge
    for (let i = 0; i < 3; i++) { const hx = -5 + i * 5.5; line(c, hx, -16, hx + (i - 1) * 2.5 - w * (i % 2 ? 1 : -1), -22, '#3a3040', 1.4); }
    // head
    circ(c, 11.5, -8, 5, '#2b2233');
    // near legs (3) under the shell
    for (let i = 0; i < 3; i++) { const hx = -5 + i * 5.5, lift = still ? 0 : Math.max(0, Math.sin(T * 4 + i * 2.1)) * 1.6; line(c, hx, -4, hx + (i - 1) * 3 + w * (i % 2 ? 1 : -1), -lift, INK, 1.8); }
    // antennae
    path(c, [13, -12, 15, -18, 18, -20], INK, 1.2); circ(c, 18, -20, 1.2, INK);
    path(c, [10.5, -12.5, 10.5, -19, 12.5, -22], INK, 1.2); circ(c, 12.5, -22, 1.2, INK);
    // shell
    ell(c, 0, -9, 11.5, 10, '#e8352e');
    c.save(); c.beginPath(); c.ellipse(0, -9, 11.5, 10, 0, 0, TAU); c.clip();
    path(c, [3, -20, 4.5, -10, 3, 0], INK, 1.4);
    circ(c, -5.5, -14, 2.4, INK); circ(c, -6, -6, 2.2, INK); circ(c, -0.5, -9.5, 1.9, INK);
    circ(c, 8, -13, 1.9, INK); circ(c, 8, -5.5, 1.9, INK);
    c.restore();
    ell(c, -4, -16.5, 3.6, 1.5, 'rgba(255,255,255,.5)', -0.4);
    // face
    eye(c, 12.5, -9.5, 2); eye(c, 15.5, -8, 1.9);
  };

  DRAW.bee = (c, T, still) => {
    const fl = still ? 0 : Math.sin(T * 40) * 0.22;
    // legs: 3 pairs
    for (let i = 0; i < 3; i++) { const hx = -6 + i * 6; line(c, hx, -4, hx - 2.5, 1, INK, 1.1); line(c, hx, -4, hx + 2, 1.5, INK, 1.1); }
    // wings: two on each side, forewing big + hindwing small
    const wing = (rot, rx, ry, ox) => { c.save(); c.translate(ox, -20); c.rotate(rot); ell(c, 0, -ry, rx, ry, 'rgba(190,230,255,.65)'); ell(c, -rx * 0.2, -ry * 1.1, rx * 0.35, ry * 0.5, 'rgba(255,255,255,.55)'); c.restore(); };
    wing(-0.75 - fl, 5.5, 11, -3);   // back-left, big
    wing(-0.2 - fl, 4, 7.5, -4);     // back-left, small
    wing(0.55 + fl, 5.5, 11, 1);     // front-right, big
    wing(1.05 + fl, 4, 7.5, 2);      // front-right, small
    // sting
    c.fillStyle = INK; c.beginPath(); c.moveTo(-12, -14); c.lineTo(-18, -11.5); c.lineTo(-12, -9.5); c.fill();
    // body
    ell(c, -1, -11.5, 13, 10, '#ffd23c');
    c.save(); c.beginPath(); c.ellipse(-1, -11.5, 13, 10, 0, 0, TAU); c.clip();
    c.fillStyle = '#3a2d2a'; [-9, -1, 7].forEach(x => { c.beginPath(); c.ellipse(x, -11.5, 2.2, 12, 0.08, 0, TAU); c.fill(); });
    c.restore();
    ell(c, -5, -17.5, 4.5, 1.7, 'rgba(255,255,255,.45)', -0.2);
    // fuzz bumps
    for (let i = 0; i < 6; i++) circ(c, -12 + i * 4.6, -21.2 + (i % 2) * 0.5, 1, '#ffe27a');
    // head
    circ(c, 11, -14, 7, '#ffd23c');
    path(c, [10, -20, 8, -26, 5.5, -27], INK, 1.2); circ(c, 5.5, -27, 1.4, INK);
    path(c, [13, -20, 15, -26, 18, -26.5], INK, 1.2); circ(c, 18, -26.5, 1.4, INK);
    eye(c, 11.5, -15.5, 2.5); eye(c, 15.5, -15, 2.1);
    smile(c, 13.5, -13, 2.4, 1.1); circ(c, 9, -11.5, 1.5, 'rgba(255,120,120,.6)');
  };

  DRAW.butterfly = (c, T, still) => {
    const fl = still ? 1 : 0.35 + 0.65 * Math.abs(Math.sin(T * 8));
    for (let i = 0; i < 3; i++) { const y = -13 + i * 2.5; line(c, -1, y, -5 - i, y + 5.5 + i * 0.5, INK, 1); line(c, 1, y, 5 + i, y + 5.5 + i * 0.5, INK, 1); }
    // four wings: upper pair then lower pair, mirrored
    [-1, 1].forEach(sg => {
      c.save(); c.scale(sg * fl, 1);
      // upper wing
      c.save(); c.translate(0, -21); c.rotate(-0.55);
      ell(c, 11, 0, 12.5, 8.5, '#8e4bd6'); ell(c, 10.5, 0.5, 8.5, 5.5, '#ff7eb6');
      circ(c, 14, -1, 2.6, '#ffb347'); circ(c, 8, 1, 1.7, '#fff'); circ(c, 18, 3, 1.4, '#fff');
      c.restore();
      // lower wing
      c.save(); c.translate(0, -15); c.rotate(0.65);
      ell(c, 7.5, 0, 8.5, 6.2, '#ff9f43'); ell(c, 7, 0, 5, 3.4, '#ff7eb6'); circ(c, 9, 0, 1.8, '#8e4bd6');
      c.restore();
      c.restore();
    });
    // body
    ell(c, 0, -15, 2, 8.5, '#4a3550'); circ(c, 0, -25.5, 3.4, '#4a3550');
    path(c, [-1.3, -28, -4.5, -33, -7, -33.5], INK, 1); circ(c, -7.2, -33.6, 1.6, INK);
    path(c, [1.3, -28, 4.5, -33, 7, -33.5], INK, 1); circ(c, 7.2, -33.6, 1.6, INK);
    eye(c, -1.5, -25.8, 1.5); eye(c, 1.5, -25.8, 1.5); smile(c, 0, -25, 1.2, 0.8);
  };

  DRAW.snail = (c, T, still) => {
    const st = still ? 0 : Math.sin(T * 1.6), bob = still ? 0 : Math.sin(T * 3.2) * 0.8;
    // body (foot) + neck + head
    ell(c, -2 + st * 0.5, -3.5, 16 + st * 1.5, 4, '#9fc9a0');
    ell(c, 11 + st * 1.5, -9, 4.6, 8.5, '#9fc9a0', 0.15); circ(c, 14 + st * 2, -15 + bob, 5, '#9fc9a0');
    ell(c, 0, -1.2, 15, 1.6, 'rgba(0,0,0,.08)');
    // shell
    circ(c, -4, -13, 11.5, '#c8742f'); circ(c, -4, -13, 8.2, '#e39a45');
    c.strokeStyle = '#8d4d1e'; c.lineWidth = 1.7; c.lineCap = 'round'; c.beginPath();
    for (let a = 0; a < 3.2 * TAU; a += 0.2) { const r = 0.9 + a * 0.5; const px = -4 + Math.cos(a) * r, py = -13 + Math.sin(a) * r; a ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.stroke();
    ell(c, -8, -19, 3.4, 1.5, 'rgba(255,255,255,.4)', -0.7);
    // eye stalks
    const hx = 14 + st * 2, hy = -15 + bob;
    path(c, [hx - 1.5, hy - 3, hx - 2.5 + st, hy - 11], '#9fc9a0', 2.1); path(c, [hx + 2.5, hy - 3, hx + 5 + st, hy - 10], '#9fc9a0', 2.1);
    eye(c, hx - 2.5 + st, hy - 12.5, 2.4); eye(c, hx + 5 + st, hy - 11.5, 2.4);
    smile(c, hx + 1.5, hy + 0.5, 2.6, 1); circ(c, hx - 2, hy + 1.5, 1.3, 'rgba(255,120,120,.5)');
  };

  DRAW.worm = (c, T, still) => {
    const N = 8, amp = 3.2;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1), x = -15 + u * 29;
      const y = -6 - u * u * 4 + (still ? Math.sin(i * 0.9) * amp : Math.sin(i * 0.9 - T * 4) * amp);
      pts.push([x, y]);
    }
    for (let i = 0; i < N; i++) {
      const [x, y] = pts[i], r = i === N - 1 ? 5.8 : 4.4 + i * 0.1, col = (i === 5 || i === 4) ? '#ffa3b8' : '#ff8aa5';
      circ(c, x, y, r, col);
      c.strokeStyle = '#d95b7e'; c.lineWidth = 1.2; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r - 0.4, PI * 0.62, PI * 1.38); c.stroke();
    }
    const [hx, hy] = pts[N - 1];
    ell(c, pts[2][0], pts[2][1] - 2.6, 3, 1.1, 'rgba(255,255,255,.4)', -0.2);
    eye(c, hx + 1, hy - 1.8, 2.2); eye(c, hx + 4.4, hy - 1, 1.9);
    smile(c, hx + 3.5, hy + 1.2, 2.2, 1); circ(c, hx - 1.5, hy + 1.8, 1.3, 'rgba(255,255,255,.35)');
  };

  DRAW.spider = (c, T, still) => {
    // front view: 4 jointed legs each side
    const hipY = -13;
    for (let i = 0; i < 4; i++) {
      const tap = still ? 0 : Math.max(0, Math.sin(T * 5 + i * 1.7)) * 2.5;
      [-1, 1].forEach(sg => {
        const hx = sg * (4 + (i % 2) * 1.2), kx = sg * (11 + i * 3.4), ky = -27 + i * 4.2, fx = sg * (13 + i * 5);
        path(c, [hx, hipY - 1 + i, kx, ky, fx, -tap], '#3a2a55', 2);
        circ(c, kx, ky, 1.5, '#3a2a55');
      });
    }
    // abdomen behind, head front
    ell(c, 0, -19, 9.5, 8.8, '#4b3470'); circ(c, 0, -12, 8, '#5a4285');
    ell(c, -3.5, -22, 3.2, 1.6, 'rgba(255,255,255,.22)', -0.4);
    circ(c, 0, -22, 2, '#b77bff'); circ(c, -3.5, -18, 1.3, '#b77bff'); circ(c, 3.5, -18, 1.3, '#b77bff');
    eye(c, -3.3, -12.8, 3.1); eye(c, 3.3, -12.8, 3.1);
    smile(c, 0, -11.2, 3, 1.1);
  };

  DRAW.ant = (c, T, still) => {
    const w = still ? 0 : Math.sin(T * 7);
    const col = '#8a3b2a', dk = '#5e2619';
    // 6 legs: 3 each side from thorax (top-ish view)
    for (let i = 0; i < 3; i++) {
      const hx = 1 + (i - 1) * 3.2, sw = still ? 0 : Math.sin(T * 7 + i * 2.1) * 1.8, dx = (i - 1) * 7;
      path(c, [hx, -10, hx + dx * 0.5 + 1, -4 + 1, hx + dx + sw, 0], dk, 1.5);
      path(c, [hx, -14, hx + dx * 0.5 + 1, -21.5, hx + dx - sw, -17], dk, 1.5);
    }
    // antennae (elbowed)
    path(c, [15.5, -15, 19, -19.5, 23, -17.5], dk, 1.2); path(c, [15, -17, 17, -23, 21.5, -24.5], dk, 1.2);
    // sections
    ell(c, -10, -12, 9, 6.8, col); ell(c, 2, -12, 5.6, 4.4, '#a24a35'); circ(c, 13, -12, 5.4, col);
    ell(c, -13, -15, 4, 1.6, 'rgba(255,255,255,.25)', -0.2);
    eye(c, 14, -14, 2.1); eye(c, 15.2, -10.3, 1.9); smile(c, 14.5, -9.5, 1.6, 0.8);
  };

  DRAW.grasshopper = (c, T, still) => {
    const g = '#6cc04a', gd = '#4a9a36', gl = '#a6dc7a';
    const ph = still ? 1 : (T % 2.6) / 2.6, hop = ph < 0.2 ? -Math.sin(ph / 0.2 * PI) * 6 : 0;
    c.save(); c.translate(0, hop);
    // far legs (darker): 1 back, 2 front
    path(c, [-1, -13, -12, -21, -20, -1], gd, 3); path(c, [10, -11, 12, -6, 12.5, -0.5], gd, 1.3); path(c, [5, -11, 4, -6, 3.5, -0.5], gd, 1.3);
    // body, head
    ell(c, 0, -14, 15, 5.2, g, -0.05); circ(c, 14.5, -15.5, 5.8, g);
    // folded wings
    ell(c, -3, -17.5, 13, 3, gl, -0.08); path(c, [-14, -17.3, 8, -18.5], gd, 0.8);
    // near back leg: thigh up then shin down
    ell(c, -9, -17.5, 8, 3.2, gd, 0.55);
    path(c, [-3, -13, -14, -22, -22, -1], g, 3); path(c, [-22, -1, -25, -0.5], g, 2.2);
    // near front legs
    path(c, [11.5, -11, 14, -6, 15, -0.5], g, 1.5); path(c, [6, -11, 6.5, -6, 6.5, -0.5], g, 1.5);
    // antennae
    path(c, [17, -20, 22, -28, 28, -30], gd, 1); path(c, [14.5, -21, 17, -29, 22, -33], gd, 1);
    eye(c, 16, -16.8, 2.8); smile(c, 17.5, -13.5, 2.1, 0.9); circ(c, 12, -13.5, 1.2, 'rgba(255,120,120,.5)');
    c.restore();
  };

  DRAW.woodlouse = (c, T, still) => {
    const w = still ? 0 : Math.sin(T * 5);
    const rx = 16, by = -9, ry = 8;
    // 7 legs each side (top-ish view): far legs peek above, near legs below
    for (let i = 0; i < 7; i++) {
      const x = -11 + i * 3.7, sw = still ? 0 : Math.sin(T * 5 + i * 0.9) * 1.2;
      line(c, x, by - ry + 1.5, x + sw * 0.6, by - ry - 2.8, '#6e6a78', 1.3);
      line(c, x, by + ry - 1.5, x + sw, by + ry + 1.8, '#4f4b5a', 1.5);
    }
    // head and antennae
    circ(c, 15, by + 0.5, 4.2, '#8f8b9b');
    path(c, [17.5, by - 2.5, 20.5, by - 7.5, 23.5, by - 8], '#4f4b5a', 1); path(c, [17.5, by + 2.5, 20.5, by + 6.5, 23, by + 7], '#4f4b5a', 1);
    // 7 overlapping plates, rear first
    for (let k = 0; k < 7; k++) {
      const x = -12.5 + k * 3.7, u = x / rx, h = ry * Math.sqrt(Math.max(0.12, 1 - u * u * 0.9));
      ell(c, x, by, 4.6, h, k % 2 ? '#9d98ac' : '#b2adc0');
      ell(c, x + 0.3, by - h * 0.45, 2.6, h * 0.22, 'rgba(255,255,255,.28)');
    }
    eye(c, 13.8, by - 1.8, 1.7); eye(c, 15.6, by + 2.2, 1.5);
  };

  DRAW.dragonfly = (c, T, still) => {
    const sim = still ? 0 : Math.sin(T * 28), A = 0.5 + (still ? 0 : sim * 0.1);
    const teal = '#2ec4b6', blue = '#3a8fe0', dk = '#1f6f8f';
    // 6 small legs tucked under thorax
    for (let i = 0; i < 3; i++) { const x = 5 + i * 2.2; line(c, x, -4, x + 2.5, -0.5, INK, 1); line(c, x, -4, x - 1.5, -0.2, INK, 1); }
    // wings: fore + hind, up and down (top view)
    const wing = (sg, rot, len) => {
      c.save(); c.translate(6, -5); c.scale(1, sg); c.rotate(rot * (still ? 1 : 0.92 + 0.08 * sim));
      ell(c, 0, -len * 0.5 - 1, 3.4, len * 0.5, 'rgba(180,235,255,' + A + ')');
      c.strokeStyle = 'rgba(40,120,170,.5)'; c.lineWidth = 0.8; c.stroke();
      line(c, 0, -2, 0, -len, 'rgba(40,120,170,.35)', 0.7);
      c.restore();
    };
    [-1, 1].forEach(sg => { wing(sg, -0.5, 19); wing(sg, 0.45, 20); }); // hind (swept back) + fore (swept forward), up and down = 4 wings
    // abdomen: segmented tail
    for (let i = 0; i < 9; i++) { const x = 1 - i * 2.9, r = 2.7 - i * 0.12; circ(c, x, -5, r, i % 2 ? blue : teal); }
    // thorax, head with big eyes
    circ(c, 7, -5, 4.6, teal); ell(c, 6, -7, 2.4, 1.2, 'rgba(255,255,255,.4)', -0.3);
    circ(c, 14, -5, 4.4, dk);
    eye(c, 14.8, -8, 3.5); eye(c, 14.8, -2, 3.5);
    smile(c, 17, -5, 1.4, 0.8);
  };

  G.BUG_KINDS = ['ladybird', 'bee', 'butterfly', 'snail', 'worm', 'spider', 'ant', 'grasshopper', 'woodlouse', 'dragonfly'];
  const SHADOW = { ladybird: 13, bee: 12, butterfly: 9, snail: 17, worm: 17, spider: 17, ant: 17, grasshopper: 20, woodlouse: 16, dragonfly: 14 };

  G.drawBug = function (c, kind, x, y, s = 1, p = {}) {
    const k = DRAW[kind] ? kind : 'ladybird', face = p.face === -1 ? -1 : 1;
    const still = !!p.still, T = still ? 0 : (+p.t || 0);
    c.save();
    try {
      c.translate(x, y);
      if (!p.fly) ell(c, 0, 1, SHADOW[k] * s, 3.4 * s, 'rgba(0,0,0,.15)');
      c.scale(s * face, s);
      DRAW[k](c, T, still);
    } finally { c.restore(); }
  };

  /* flat one-colour silhouette for "not found yet" journal slots */
  const sil = {};
  G.drawBugSilhouette = function (c, kind, x, y, s = 1, col = '#c9bfae') {
    const k = DRAW[kind] ? kind : 'ladybird';
    let q = 1; try { const m = c.getTransform(); q = Math.max(1, Math.hypot(m.a, m.b)); } catch (e) { /* ignore */ }
    q = Math.round(q * 2) / 2;
    const key = k + '|' + s + '|' + q + '|' + col;
    let o = sil[key];
    const W = 100 * s, H = 90 * s, OX = 50 * s, OY = 66 * s;
    if (!o) {
      o = document.createElement('canvas'); o.width = Math.ceil(W * q); o.height = Math.ceil(H * q);
      const g = o.getContext('2d');
      g.scale(q, q); g.translate(OX, OY);
      G.drawBug(g, k, 0, 0, s, { fly: true, still: true });
      g.setTransform(1, 0, 0, 1, 0, 0);
      try { // make every drawn pixel fully opaque so see-through wings go flat too
        const d = g.getImageData(0, 0, o.width, o.height), a = d.data;
        for (let i = 3; i < a.length; i += 4) a[i] = a[i] > 20 ? 255 : 0;
        g.putImageData(d, 0, 0);
      } catch (e) { /* tainted or unavailable: keep soft alpha */ }
      g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, o.width, o.height);
      sil[key] = o;
    }
    c.drawImage(o, x - OX, y - OY, W, H);
  };
})();

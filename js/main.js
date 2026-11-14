/* Hazelnut Hollow — boot: scaling, title screen, main loop, debug tour (SPEC §2, §9). */
(function () {
  'use strict';
  const G = window.G, U = G.U, $ = U.$;
  const cv = $('#game'), c = cv.getContext('2d'), stage = $('#stage');
  let scale = 1, title = null;

  /* letterbox the 1280×720 stage into the window; sharp canvas on high-DPI screens */
  function fit() {
    const W = window.innerWidth, H = window.innerHeight;
    scale = Math.min(W / G.VW, H / G.VH);
    stage.style.transform = 'translate(' + Math.round((W - G.VW * scale) / 2) + 'px,' + Math.round((H - G.VH * scale) / 2) + 'px) scale(' + scale + ')';
    const k = Math.min(2.5, scale * (window.devicePixelRatio || 1));
    cv.width = Math.round(G.VW * k); cv.height = Math.round(G.VH * k);
    c.setTransform(k, 0, 0, k, 0, 0);
  }
  window.addEventListener('resize', fit); fit();
  G.toLogical = (clientX, clientY) => { const r = stage.getBoundingClientRect(); return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale }; };

  G.loadGame(); G.initTouch(); G.UI.bindHud();
  window.addEventListener('pointerdown', () => G.audioUnlock(), { once: true });

  cv.addEventListener('pointerdown', e => {
    if (G.paused || !G.E.area || title) return;
    const p = G.toLogical(e.clientX, e.clientY);
    G.E.tapAt(p.x + G.E.cam.x, p.y + G.E.cam.y);
  });

  /* ---------- title ---------- */
  function showTitle() {
    title = U.el('div', '', '<h1>Hazelnut Hollow</h1><div class="sub">' + (G.S.created ? 'Welcome back' + (G.S.name ? ', ' + G.S.name : '') + '!' : 'A cosy adventure') + ' 🌰</div>');
    title.id = 'title';
    const row = U.el('div', 'row');
    const play = U.el('button', 'bigbtn green', 'Play ▶'), dress = U.el('button', 'bigbtn alt', 'Dress up 👗');
    row.appendChild(play); if (G.S.created) row.appendChild(dress); title.appendChild(row);
    stage.appendChild(title);
    G.E.load('village');
    play.onclick = () => start(false);
    dress.onclick = () => start(true);
  }
  async function start(dress) {
    G.audioUnlock(); G.sfx('tap');
    if (title) { title.remove(); title = null; }
    if (!G.S.created || dress) await G.UI.creator(!G.S.created);
    G.E.load(G.S.area && G.AREAS[G.S.area] ? G.S.area : 'village');
    G.UI.hud(true); G.UI.gembar();
    if (!G.S.seen.welcome) { G.S.seen.welcome = true; G.saveGame(); setTimeout(() => G.UI.toast('Go and say hello to Professor Hoot! 🦉', true), 1500); }
  }

  /* ---------- main loop ---------- */
  let last = performance.now(), titleCam = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; G.t += dt;
    if (title) {   // gentle pan across the village behind the title
      const a = G.E.area; titleCam += dt * 40; const span = a.w * G.TILE - G.VW;
      G.E.cam.x = span * (0.5 - 0.5 * Math.cos(titleCam / span * Math.PI)); G.E.cam.y = a.h * G.TILE - G.VH;
      G.E.draw(c, G.t);
    } else if (G.E.area) {
      if (!G.paused) G.E.update(dt);
      G.E.draw(c, G.t);
    }
    G.clearHits();
    requestAnimationFrame(frame);
  }
  showTitle();
  requestAnimationFrame(frame);

  /* ---------- debug hooks (used by tools/check.js) ---------- */
  G.debug = {
    tour() { if (title) { title.remove(); title = null; } G.S.created = true; G.S.name = 'Tester'; G.E.load('village'); G.UI.hud(true); G.UI.gembar(); },
    warp(tx) { const P = G.E.player; P.x = tx * G.TILE; P.y = 12 * G.TILE; P.vx = P.vy = 0; G.E.cam.x = U.clamp(P.x - G.VW / 2, 0, G.E.area.w * G.TILE - G.VW); },
    gem(col, subject, level) { return G.PZ.run({ colour: col, subject, level }); },
    give(col, n) { G.S.gems[col] += n; G.UI.gembar(); },
    close() { G.UI.overlay(false); $('#dialogue').classList.add('hidden'); G.paused = false; },
  };
  G.debug.steps = [
    { name: 'walk', run: () => { G.debug.warp(20); } },
    { name: 'talk', run: () => { G.debug.warp(8); G.E.interact(G.E.ents.find(e => e.id === 'hoot')); } },
    { name: 'maths', run: () => { G.debug.close(); G.debug.gem('red', 'maths', 1); } },
    { name: 'words', run: () => { G.debug.close(); G.debug.gem('blue', 'words', 2); } },
    { name: 'write', run: () => { G.debug.close(); G.PZ.run({ colour: 'blue', puzzle: { q: 'Write <b>cat</b>', say: 'Write cat', type: 'write', write: { text: 'cat', mode: 'trace' } } }); } },
    { name: 'gate', run: () => { G.debug.close(); G.debug.give('red', 1); G.debug.warp(33); G.UI.gate(G.E.ents.find(e => e.id === 'gate-house')); } },
    { name: 'creator', run: () => { G.debug.close(); G.UI.creator(false); } },
    { name: 'wood', run: () => { G.debug.close(); G.E.load('writing'); G.debug.warp(12); } },
    { name: 'wood2', run: () => { G.S.quests['lesson:lt-curly'] = 1; G.debug.warp(30); } },
    { name: 'lesson', run: () => { G.debug.close(); G.PZ.run({ colour: 'blue', noAdapt: true, puzzle: { q: '🐶 Write <b>dog</b>', say: 'Write dog', type: 'write', write: { text: 'dog', mode: 'fade' } } }); } },
    { name: 'settings', run: () => { G.debug.close(); G.UI.settings(); } },
    { name: 'house', run: () => { G.debug.close(); G.E.load('house'); G.debug.warp(10); G.E.noise = 0.55; } },
    { name: 'house2', run: () => { G.S.locks['hh-door1'] = G.S.locks['hh-door2'] = true; G.debug.warp(30); } },
    { name: 'mdoor', run: () => { G.debug.warp(47); G.E.interact(G.E.ents.find(e => e.id === 'hh-door3')); } },
    { name: 'mum', run: () => { G.debug.close(); G.S.locks['hh-door3'] = true; G.debug.warp(57); } },
    { name: 'cafe', run: () => { G.debug.close(); G.E.load('cafe'); G.debug.warp(12); } },
    { name: 'order-count', run: () => { G.S.level.maths = 1; G.E.interact(G.E.ents.find(e => e.id === 'cf-bear')); } },
    { name: 'order-read', run: () => { G.debug.close(); G.CAFE.order({ who: 'hettie', kind: 'read' }); } },
    { name: 'order-money', run: () => { G.debug.close(); G.S.level.maths = 2; G.CAFE.order({ who: 'hoot', kind: 'money' }); } },
    { name: 'order-write', run: () => { G.debug.close(); G.CAFE.order({ who: 'ogden', kind: 'write' }); } },
    { name: 'cafe2', run: () => { G.debug.close(); G.debug.warp(38); } },
    { name: 'shop', run: () => { G.debug.close(); G.E.load('village'); G.debug.warp(22); G.S.coins = 11; G.UI.shop(); setTimeout(() => document.querySelectorAll('.shopitem')[1].click(), 50); } },
    { name: 'shop-poor', run: () => { document.querySelectorAll('.shopitem')[3].click(); } },
    { name: 'wardrobe-new', run: () => { G.debug.close(); G.unlock('hat:chef'); G.UI.creator(false); setTimeout(() => document.querySelectorAll('.tabs .tab')[8].click(), 50); } },
    { name: 'outfits', run: () => { G.S.outfits = [Object.assign(G.defaultAvatar(), { hat: 'chef', body: 'robe', col1: '#6c4bd8' })]; document.querySelectorAll('.tabs .tab')[14].click(); } },
    { name: 'curr', run: () => { const r = G.CURR ? G.CURR.selfTest() : ['no CURR']; if (r.length) throw new Error('selfTest: ' + r.slice(0, 3).join('; ')); G.debug.gem('yellow', 'shapes', 2); } },
  ];
})();

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
  /* offline play (SPEC §7.2j): never with ?debug so tests always see fresh files */
  G.offline = { state: 'off' };
  if ('serviceWorker' in navigator && !/[?&]debug/.test(location.search) && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(() => { G.offline.state = 'ready'; }).catch(() => { G.offline.state = 'failed'; });
  }
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
    warp(tx, row = 12) { const P = G.E.player; P.x = tx * G.TILE; P.y = row * G.TILE; P.vx = P.vy = 0; G.E.cam.x = U.clamp(P.x - G.VW / 2, 0, G.E.area.w * G.TILE - G.VW); G.E.cam.y = U.clamp(P.y - G.VH * 0.6, 0, G.E.area.h * G.TILE - G.VH); },
    gem(col, subject, level) { return G.PZ.run({ colour: col, subject, level }); },
    give(col, n) { G.S.gems[col] += n; G.UI.gembar(); },
    close() { if (G.SB.close) G.SB.close(); G.UI.overlay(false); $('#dialogue').classList.add('hidden'); G.paused = false; },
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
    { name: 'meadow', run: () => { G.debug.close(); G.E.load('meadow'); G.debug.warp(8); } },
    { name: 'meadow2', run: () => { G.debug.warp(30); } },
    { name: 'bug-look', run: () => { G.S.level.nature = 0; G.MEAD.look('spider'); } },
    { name: 'bug-wings', run: () => { G.debug.close(); G.S.level.nature = 1; G.MEAD.look('bee'); setTimeout(() => document.querySelectorAll('.bugcard .ans')[0].click(), 50); } },
    { name: 'sort', run: () => { G.debug.close(); G.S.level.nature = 0; G.MEAD.sort(); setTimeout(() => document.querySelector('.sortbug').click(), 50); } },
    { name: 'journal', run: () => { G.debug.close(); G.S.bugs = { ladybird: true, bee: true, spider: true, snail: true }; G.UI.journal(); } },
    { name: 'journal-write', run: () => { G.debug.close(); G.S.handwriting = Object.assign({ a: { best: 0.9, tries: 4 }, c: { best: 0.75, tries: 2 }, d: { best: 0.55, tries: 1 }, s: { best: 0.3, tries: 1 }, A: { best: 0.8, tries: 2 }, '3': { best: 0.9, tries: 3 } }, G.S.handwriting); G.UI.journal('writing'); } },
    { name: 'shore', run: () => { G.debug.close(); G.E.load('writing'); G.debug.warp(70); } },
    { name: 'sentence', run: () => { G.debug.close(); G.PZ.run({ colour: 'blue', noAdapt: true, puzzle: { q: '🏃 Write <b>I can run.</b><br><small>Capital letter, finger spaces, full stop!</small>', say: 'Write I can run', type: 'write', write: { text: 'I can run.', mode: 'trace' } } }); } },
    { name: 'caps', run: () => { G.debug.close(); G.debug.warp(36); } },
    { name: 'tower', run: () => { G.debug.close(); G.E.load('tower'); G.debug.warp(8, 45); } },
    { name: 'tower-f2', run: () => { G.debug.warp(16, 29); } },
    { name: 'tower-top', run: () => { G.S.curios = { shell: true, key: true, compass: true }; G.debug.warp(18, 13); } },
    { name: 'shoes', run: () => { G.debug.close(); G.S.level.patterns = 1; G.TOWER.shoes(); setTimeout(() => { const s = document.querySelectorAll('.shoe'); s[0].click(); s[1].click(); }, 50); } },
    { name: 'postcard', run: () => { G.debug.close(); G.TOWER.postcard(); } },
    { name: 'case', run: () => { G.debug.close(); G.TOWER.case(); } },
    { name: 'cabinet', run: () => { G.debug.close(); G.TOWER.cabinet(); } },
    { name: 'woods', run: () => { G.debug.close(); G.E.load('woods'); G.debug.warp(12); } },
    { name: 'woods2', run: () => { G.debug.warp(33); } },
    { name: 'woods3', run: () => { G.debug.warp(64); } },
    { name: 'trail', run: () => { G.S.level.shapes = 1; G.WOODS.trail({ id: 'wd-trail1', col: 'green' }); } },
    { name: 'story', run: () => { G.debug.close(); G.WOODS.story({ id: 'wd-story' }); } },
    { name: 'caves', run: () => { G.debug.close(); G.E.load('caves'); G.debug.warp(12); } },
    { name: 'caves2', run: () => { G.S.avatar.held = 'lantern'; G.debug.warp(40); } },
    { name: 'chime', run: () => { G.CAVES.chime({ id: 'cv-chime1', col: 'blue' }); } },
    { name: 'nest', run: () => { G.debug.close(); G.debug.warp(72); G.CAVES.nest({ id: 'cv-nest' }); } },
    { name: 'clouds', run: () => { G.debug.close(); G.E.load('clouds'); G.debug.warp(10, 21); } },
    { name: 'clouds2', run: () => { G.debug.warp(31, 15); } },
    { name: 'clouds3', run: () => { G.S.quests.rainbow = true; G.debug.warp(72, 9); } },
    { name: 'weather', run: () => { G.CLOUDS.weather({ id: 'cl-weather' }); } },
    { name: 'starcount', run: () => { G.debug.close(); G.S.level.maths = 1; G.CLOUDS.stars({ id: 'cl-stars' }); } },
    { name: 'rainbow', run: () => { G.debug.close(); G.CLOUDS.rainbow({ id: 'cl-rainbow' }); } },
    { name: 'castle', run: () => { G.debug.close(); G.FINALE.castle({ id: 'cl-castle' }); } },
    { name: 'party', run: () => { G.debug.close(); G.S.gems = { red: 9, blue: 9, green: 9, yellow: 9, purple: 9 }; G.FINALE.party(); } },
    { name: 'grownups', run: () => { G.debug.close(); G.UI.grownups(); } },
    { name: 'map', run: () => { G.debug.close(); G.S.areas = { village: true, house: true, cafe: true, meadow: true }; G.E.load('village'); G.UI.map(); } },
    { name: 'toybox', run: () => { G.debug.close(); G.SB.open(); } },
    { name: 'play-potion', run: () => { G.SB.open('potion'); } },
    { name: 'play-vet', run: () => { G.SB.open('vet'); } },
    { name: 'play-dolls', run: () => { G.SB.open('dolls'); } },
    { name: 'play-art', run: () => { G.SB.open('art'); } },
    { name: 'play-music', run: () => { G.SB.open('music'); } },
    { name: 'play-end', run: () => { G.SB.close(); } },
    { name: 'curr', run: () => { const r = G.CURR ? G.CURR.selfTest() : ['no CURR']; if (r.length) throw new Error('selfTest: ' + r.slice(0, 3).join('; ')); G.debug.gem('yellow', 'shapes', 2); } },
  ];
})();

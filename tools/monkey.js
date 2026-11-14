// Random-input stress test (not part of check.sh; ~150 s). Usage: node tools/monkey.js http://localhost:PORT/
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1180, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' @' + last)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load/.test(m.text())) errs.push('console: ' + m.text()); });
  let last = '';
  await p.goto((process.argv[2] || 'http://localhost:8765/') + '?debug'); await p.waitForTimeout(800);
  await p.evaluate(() => { G.resetGame(); G.S.created = true; G.S.coins = 30; G.debug.tour && G.debug.tour(); G.debug.close(); });
  const rnd = n => Math.floor(Math.random() * n), keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'e', ' '];
  const t0 = Date.now(); let n = 0;
  while (Date.now() - t0 < 150000) {
    n++; const r = Math.random();
    if (r < 0.35) { const k = keys[rnd(keys.length)]; last = 'key ' + k; await p.keyboard.down(k); await p.waitForTimeout(40 + rnd(500)); await p.keyboard.up(k); }
    else if (r < 0.75) { last = await p.evaluate(() => { window.__h = window.__h || {}; const cd = document.querySelector('#overlay .card'); if (cd) __h[cd.className] = (__h[cd.className] || 0) + 1; if (cd && /creator|settings/.test(cd.className + cd.innerHTML.slice(0, 300)) && Math.random() < 0.3) { G.debug.close(); return 'forceclose'; } const bs = [...document.querySelectorAll('#overlay button, #dialogue button, #overlay .ans' + (Math.random() < 0.15 ? ', #hud button' : ''))].filter(x => x.offsetParent && !/reset/i.test(x.className + x.textContent)); if (!bs.length) return 'nobtn'; const x = bs[Math.floor(Math.random() * bs.length)]; x.click(); return 'click ' + (x.className + ':' + x.textContent).slice(0, 40); }); }
    else if (r < 0.85) { const box = await p.evaluate(() => { const c = document.querySelector('#overlay canvas'); if (!c) return null; const r = c.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }); if (box && box[2] > 200) { last = 'scribble'; const x = box[0] + 60 + rnd(box[2] - 120), y = box[1] + 60 + rnd(box[3] - 120); await p.mouse.move(x, y); await p.mouse.down(); for (let i = 0; i < 6; i++) await p.mouse.move(x + rnd(80) - 40, y + rnd(80) - 40); await p.mouse.up(); } }
    else if (r < 0.9) { last = await p.evaluate(() => { const ids = Object.keys(G.AREAS), id = ids[Math.floor(Math.random() * ids.length)]; if (!G.paused) { G.E.load(id); const a = G.AREAS[id], e = a.ents[Math.floor(Math.random() * a.ents.length)]; G.E.player.x = e.x * 48; G.E.player.y = e.row * 48; G.E.player.vy = 0; } return 'load ' + id; }); }
    else { last = 'close'; await p.evaluate(() => { const x = document.querySelector('#overlay .closex'); if (x && Math.random() < 0.5) x.click(); }); }
    await p.waitForTimeout(30);
  }
  const st = await p.evaluate(() => ({ gems: G.S.gems, coins: G.S.coins, quests: Object.keys(G.S.quests).length, parts: G.E.parts.length, paused: G.paused, ov: !document.getElementById('overlay').classList.contains('hidden'), hist: window.__h, heap: performance.memory && Math.round(performance.memory.usedJSHeapSize / 1e6) }));
  console.log('actions', n, JSON.stringify(st)); console.log('errors', [...new Set(errs)].slice(0, 20)); await b.close();
})();

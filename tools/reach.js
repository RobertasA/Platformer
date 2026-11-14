// Reachability audit (AIM: "every area reachable"). For each area: BFS over standable cells, then a bot
// drives the real engine physics along the path to every entity. Fails if anything cannot be reached.
// Usage: node tools/reach.js http://localhost:PORT/index.html
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.argv[2] + '?debug'); await p.waitForTimeout(800);
  const res = await p.evaluate(() => {
    G.resetGame(); G.S.created = true; G.say = () => {}; G.sfx = () => {}; G.debug.tour && G.debug.tour(); G.debug.close();
    const E = G.E, P = E.player, I = G.input, T = G.TILE, real = E.update; E.update = () => {};
    E.pickGem = e => { e.got = true; }; G.UI.toast = () => {}; G.saveGame = () => {};
    const out = {};
    for (const id in G.AREAS) {
      const a = G.AREAS[id]; for (const e of a.ents) if (e.k === 'mdoor' || e.k === 'gate') G.S.locks[e.id] = true;
      E.load(id); const m = a.map, at = (x, y) => (y < 0 || y >= a.h || x < 0 || x >= a.w) ? '#' : m[y][x];
      const stand = (x, r) => r < a.h && r > 1 && '#=~'.includes(at(x, r)) && at(x, r - 1) !== '#' && at(x, r - 2) !== '#' && at(x, r - 1) !== '~';   // water: only the surface row counts
      const key = (x, r) => x + ',' + r;
      const nodes = []; for (let r = 0; r < a.h; r++) for (let x = 0; x < a.w; x++) if (stand(x, r)) nodes.push([x, r]);
      const edges = (x, r) => { const o = [];
        for (const [nx, nr] of nodes) { const dx = Math.abs(nx - x), dy = r - nr; if (!dx && !dy) continue;
          if (dy === 0 && dx === 1) o.push([nx, nr, 1]);
          else if (dy === 0 && dx <= 4) o.push([nx, nr, 3 + dx]);
          else if (dy > 0 && dy <= 2 && dx <= 3) o.push([nx, nr, 4 + dx]);
          else if (dy > 2 && dy <= 4 && dx <= 2) o.push([nx, nr, 7 + dx]);
          else if (dy < 0 && dx <= 3 && dx >= 1) o.push([nx, nr, 3 + dx]); }
        return o; };
      const path = (s, goal) => { const dist = { [key(...s)]: 0 }, prev = {}, q = [[...s, 0]];
        while (q.length) { q.sort((u, v) => u[2] - v[2]); const [x, r, d] = q.shift(); if (goal(x, r)) { const pth = []; let k = key(x, r); while (k) { pth.unshift(k.split(',').map(Number)); k = prev[k]; } return pth; }
          if (d > dist[key(x, r)]) continue;
          for (const [nx, nr, w] of edges(x, r)) { const nk = key(nx, nr); if (dist[nk] === undefined || d + w < dist[nk]) { dist[nk] = d + w; prev[nk] = key(x, r); q.push([nx, nr, d + w]); } } }
        return null; };
      const tick = () => { real(1 / 60); I.jumpHit = false; I.actHit = false; if (E.area.hush) E.noise = 0; G.paused = false; };
      const cell = () => [Math.floor(P.x / T), Math.round(P.y / T)];
      const goTo = (wx, wr) => { // drive to waypoint cell; true if arrived
        for (let n = 0; n < 420; n++) {
          const tx = wx * T + T / 2, dx = tx - P.x, feet = P.y / T, onRow = (P.ground && Math.abs(feet - wr) < 0.2) || (P.inWater && Math.abs(feet - wr) < 0.8);
          if (onRow && Math.abs(dx) < 16) { I.left = I.right = I.jump = false; return true; }
          I.right = dx > 6; I.left = dx < -6; I.jump = false;
          const higher = wr < feet - 0.2, lower = wr > feet + 0.5, dir = Math.sign(dx) || 1;
          if (lower && P.ground && Math.abs(dx) < 30) { let k = 1; while (k < 6 && stand(Math.floor(P.x / T) + k, Math.round(feet)) && stand(Math.floor(P.x / T) - k, Math.round(feet))) k++; const right = !stand(Math.floor(P.x / T) + k, Math.round(feet)); for (let i = 0; i < 40 && P.ground; i++) { I.right = right; I.left = !right; tick(); } continue; }
          const gapAhead = P.ground && !lower && !higher && !stand(Math.floor((P.x + dir * 26) / T), Math.round(feet));
          if (P.ground && ((higher && Math.abs(dx) < T * 3.2) || (gapAhead && Math.abs(dx) > T))) { I.jump = true; I.jumpHit = true; }
          else if (!P.ground && !P.inWater && higher) { I.jump = true; if (P.vy > -60 && P.jumps < 2) I.jumpHit = true; }
          else if (!P.ground && !P.inWater && !lower && P.vy < 0) I.jump = true;
          else if (P.inWater && (higher || !lower)) { I.jump = true; I.jumpHit = n % 10 === 0; }
          tick();
        }
        I.left = I.right = I.jump = false; return false; };
      const fails = [], oks = [];
      const targets = a.ents.filter(e => !['creak', 'squeak', 'check'].includes(e.k));
      for (const e of targets) {
        const s = cell(); if (!stand(...s)) { for (let i = 0; i < 60; i++) tick(); }
        const s2 = cell(); while (!stand(...s2) && s2[1] > 2) s2[1]--;   // sunk in a pond: plan from the surface
        const goal = (x, r) => e.fly ? (Math.abs(x - e.x) <= 2 && r - e.row <= 2.5 && r >= e.row) : (Math.abs(x + 0.5 - e.x) <= 0.8 && (r === Math.ceil(e.row) || (e.k === 'gem' && r > e.row - 0.6 && r - e.row <= 2)));
        const pth = stand(...s2) ? path(s2, goal) : null;
        if (!pth) { fails.push(e.id + ':nopath from ' + s2); E.load(id); continue; }
        let ok = true, stuck = null; for (const [wx, wr] of pth.slice(1)) { if (!goTo(wx, wr)) { ok = false; stuck = [wx, wr, 'at', (P.x / T).toFixed(1), (P.y / T).toFixed(1)]; break; } }
        if (ok && e.k === 'gem' && !e.fly) { const ent = E.ents.find(x => x.id === e.id); if (ent && !ent.got) { I.jump = I.jumpHit = true; for (let i = 0; i < 50; i++) { tick(); } I.jump = false; if (!ent.got) { ok = false; stuck = 'gem not touched'; } } }
        if (ok) oks.push(e.id); else { fails.push(e.id + ':stuck ' + stuck); E.load(id); }
      }
      out[id] = { ok: oks.length, fails };
    }
    return out;
  });
  let bad = errs.length; for (const id in res) { bad += res[id].fails.length; console.log('[reach] ' + id + ': ' + res[id].ok + ' reached' + (res[id].fails.length ? ', FAILED: ' + res[id].fails.join('; ') : '')); }
  if (errs.length) console.error(errs.join('\n')); await b.close(); process.exit(bad ? 1 : 0);
})();

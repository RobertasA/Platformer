/* Hazelnut Hollow — engine: area loading, tile physics, camera, entities, interaction, drawing (SPEC §4). */
(function () {
  'use strict';
  const G = window.G, U = G.U, T = G.TILE;
  const PH = { run: 260, accel: 2200, airAccel: 1500, friction: 2600, jump: 640, gravity: 1500, fall: 1050, coyote: 0.1, buffer: 0.12, cut: 0.45, w: 34, h: 82, swimGrav: 420, swimMax: 160, swimJump: 430 };
  G.PH = PH;

  const E = G.E = { area: null, id: null, cam: { x: 0, y: 0 }, parts: [], ents: [], near: null, trail: [] };
  const P = E.player = { x: 0, y: 0, vx: 0, vy: 0, face: 1, ground: false, coyote: 0, buf: 0, jumps: 0, walkT: 0, safe: { x: 0, y: 0 }, safeT: 0, squash: 0, inWater: false, wave: 0 };

  const tileAt = (tx, ty) => { const a = E.area; if (!a || ty < 0) return '.'; if (tx < 0 || tx >= a.w) return '#'; if (ty >= a.h) return '.'; return a.map[ty][tx]; };
  E.tileAt = tileAt;
  const solid = ch => ch === '#';

  E.load = function (id, at) {
    const a = G.AREAS[id]; if (!a) return false;
    E.area = a; E.id = id; G.S.area = id; G.S.areas[id] = true;
    E.ents = a.ents.map(d => Object.assign({ cool: 0, t: Math.random() * 6 }, d, { px: d.x * T, py: d.row * T }))
      .filter(e => !(e.k === 'gem' && G.S.taken[id + ':' + e.id]));
    const s = at || a.spawn;
    P.x = s.x * T; P.y = s.row * T; P.vx = P.vy = 0; P.safe = { x: P.x, y: P.y }; P.jumps = 0;
    E.cam.x = U.clamp(P.x - G.VW / 2, 0, a.w * T - G.VW); E.cam.y = U.clamp(P.y - G.VH * 0.6, 0, a.h * T - G.VH);
    E.trail = []; E.parts = [];
    G.music.play(a.music || a.theme);
    G.saveGame();
    if (G.UI) G.UI.banner(a.name);
    return true;
  };

  /* ---------- particles ---------- */
  E.burst = function (x, y, col, n = 14, kind = 'spark') {
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = U.rnd(80, 260); E.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: U.rnd(0.5, 1), max: 1, col, kind, r: U.rnd(3, 7) }); }
  };

  /* ---------- physics ---------- */
  function collideX() {
    const top = P.y - PH.h, l = P.x - PH.w / 2, r = P.x + PH.w / 2;
    for (let ty = Math.floor((top + 1) / T); ty <= Math.floor((P.y - 1) / T); ty++) {
      if (P.vx > 0 && solid(tileAt(Math.floor(r / T), ty))) { P.x = Math.floor(r / T) * T - PH.w / 2 - 0.01; P.vx = 0; }
      else if (P.vx < 0 && solid(tileAt(Math.floor(l / T), ty))) { P.x = (Math.floor(l / T) + 1) * T + PH.w / 2 + 0.01; P.vx = 0; }
    }
  }
  function collideY(prevY) {
    const l = Math.floor((P.x - PH.w / 2 + 1) / T), r = Math.floor((P.x + PH.w / 2 - 1) / T);
    P.ground = false;
    if (P.vy >= 0) {
      const ty = Math.floor(P.y / T);
      for (let tx = l; tx <= r; tx++) {
        const ch = tileAt(tx, ty);
        if (solid(ch) || (ch === '=' && prevY <= ty * T + 0.5)) { P.y = ty * T; if (P.vy > 420) land(P.vy); P.vy = 0; P.ground = true; return; }
      }
    } else {
      const ty = Math.floor((P.y - PH.h) / T);
      for (let tx = l; tx <= r; tx++) if (solid(tileAt(tx, ty))) { P.y = (ty + 1) * T + PH.h; P.vy = 0; return; }
    }
  }
  function land(v) { P.squash = Math.min(0.3, v / 3000); G.sfx('land'); for (let i = 0; i < 6; i++) E.parts.push({ x: P.x + U.rnd(-14, 14), y: P.y, vx: U.rnd(-60, 60), vy: U.rnd(-60, -10), life: 0.4, max: 0.4, col: 'rgba(255,255,255,.8)', kind: 'dust', r: U.rnd(3, 6) }); }

  function updatePlayer(dt) {
    const I = G.input, frozen = G.paused;
    const dir = frozen ? 0 : (I.right ? 1 : 0) - (I.left ? 1 : 0);
    const wasWater = P.inWater;
    P.inWater = tileAt(Math.floor(P.x / T), Math.floor((P.y - 20) / T)) === '~';
    if (P.inWater && !wasWater && P.vy > 100) { G.sfx('splash'); E.burst(P.x, P.y - 20, '#bfe9ff', 12); }
    if (dir) { P.face = dir; P.vx += dir * (P.ground ? PH.accel : PH.airAccel) * dt; P.vx = U.clamp(P.vx, -PH.run, PH.run); }
    else { const f = PH.friction * dt; P.vx = Math.abs(P.vx) <= f ? 0 : P.vx - Math.sign(P.vx) * f; }
    if (P.ground) { P.coyote = PH.coyote; P.jumps = 0; } else P.coyote -= dt;
    if (!frozen && I.jumpHit) P.buf = PH.buffer; else P.buf -= dt;
    if (P.buf > 0) {
      if (P.inWater) { P.vy = -PH.swimJump; P.buf = 0; G.sfx('bubble'); }
      else if (P.coyote > 0) { P.vy = -PH.jump; P.coyote = 0; P.buf = 0; P.jumps = 1; G.sfx('jump'); P.squash = -0.2; }
      else if (P.jumps < 2) { P.vy = -PH.jump * 0.88; P.buf = 0; P.jumps = 2; G.sfx('jump2'); E.burst(P.x, P.y, '#fff6c9', 8); }
    }
    if (!I.jump && P.vy < -200 && !P.inWater) P.vy *= Math.pow(PH.cut, dt * 10);   // variable jump height
    P.vy += (P.inWater ? PH.swimGrav : PH.gravity) * dt;
    P.vy = Math.min(P.vy, P.inWater ? PH.swimMax : PH.fall);
    P.x += P.vx * dt; collideX();
    const prevY = P.y; P.y += P.vy * dt; collideY(prevY);
    P.squash *= Math.pow(0.0005, dt);
    if (P.ground && Math.abs(P.vx) > 20) P.walkT += dt; else P.walkT = 0;
    P.safeT -= dt;
    if (P.ground && P.safeT <= 0 && solid(tileAt(Math.floor((P.x - 20) / T), Math.floor(P.y / T))) && solid(tileAt(Math.floor((P.x + 20) / T), Math.floor(P.y / T)))) { P.safe = { x: P.x, y: P.y }; P.safeT = 0.4; }
    if (P.y > E.area.h * T + 200) { P.x = P.safe.x; P.y = P.safe.y; P.vx = P.vy = 0; G.sfx('pop'); if (G.UI) G.UI.toast('Whoops! 🙃'); }
    E.trail.push({ x: P.x, y: P.y, face: P.face, walk: P.walkT > 0 }); if (E.trail.length > 30) E.trail.shift();
  }

  /* ---------- entities ---------- */
  const near = (e, r) => Math.abs(e.px - P.x) < r && Math.abs((e.py - 30) - (P.y - 40)) < r + 30;
  function updateEnts(dt) {
    E.near = null; let best = 1e9;
    for (const e of E.ents) {
      e.t += dt; if (e.cool > 0) e.cool -= dt;
      if (e.k === 'gem') {
        const gy = e.py - 34 + Math.sin(e.t * 3) * 5;
        const touch = Math.abs(e.px - P.x) < 40 && gy > P.y - PH.h - 30 && gy < P.y + 20;
        if (touch && e.cool <= 0 && !G.paused) { e.cool = 1.5; E.pickGem(e); }
        else if (touch) e.cool = Math.max(e.cool, 0.6);   // stay quiet until she steps away
        continue;
      }
      if (e.hidden) continue;
      const d = Math.abs(e.px - P.x);
      if (near(e, 80) && d < best) { best = d; E.near = e; }
    }
    if (!G.paused && G.input.actHit && E.near) E.interact(E.near);
  }

  E.pickGem = async function (e) {
    const info = G.GEM_INFO[e.col];
    G.sfx('gem'); E.burst(e.px, e.py - 34, info.col, 16);
    const res = await G.PZ.run({ colour: e.col, subject: info.subj });
    if (!res.ok) return;    // closed: the gem stays, try again any time
    G.S.taken[E.id + ':' + e.id] = true; G.S.gems[e.col]++; G.S.stats.solved++;
    E.ents.splice(E.ents.indexOf(e), 1);
    G.UI.flyGem(e.col, e.px - E.cam.x, e.py - 34 - E.cam.y);
    G.saveGame();
  };

  E.interact = function (e) {
    if (e.k === 'npc') { G.S.seen['talk:' + e.id] = true; G.UI.talk(G.PEOPLE[e.who], e.talk); }
    else if (e.k === 'sign') G.UI.toast('📜 ' + e.text, true);
    else if (e.k === 'gate') G.UI.gate(e);
    else if (e.k === 'door') {
      G.sfx('door');
      if (e.act === 'wardrobe') G.UI.creator(false);
      else if (e.act === 'play') G.UI.soon('The playroom');
      else if (e.to) E.travel(e.to);
    }
  };
  E.travel = function (to, at) {
    if (!G.AREAS[to]) { G.UI.soon((G.AREA_NAMES && G.AREA_NAMES[to]) || 'That place'); return false; }
    G.UI.fade(() => E.load(to, at)); return true;
  };
  E.tapAt = function (wx, wy) {   // tapping a nearby character / gate also interacts
    for (const e of E.ents) if (e.k !== 'gem' && !e.hidden && Math.abs(e.px - wx) < 60 && wy > e.py - 170 && wy < e.py + 10 && near(e, 200)) { E.interact(e); return true; }
    return false;
  };

  E.update = function (dt) {
    if (!E.area) return;
    updatePlayer(dt);
    updateEnts(dt);
    const a = E.area, look = P.face * 110;
    const tx = U.clamp(P.x - G.VW / 2 + look, 0, a.w * T - G.VW), ty = U.clamp(P.y - G.VH * 0.62, 0, a.h * T - G.VH);
    E.cam.x += (tx - E.cam.x) * Math.min(1, dt * 4); E.cam.y += (ty - E.cam.y) * Math.min(1, dt * 5);
    for (const p of E.parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; }
    E.parts = E.parts.filter(p => p.life > 0);
  };

  /* ---------- drawing ---------- */
  E.draw = function (c, t) {
    const a = E.area; if (!a) return;
    const cx = Math.round(E.cam.x), cy = Math.round(E.cam.y);
    G.drawBackground(c, a.theme, cx, cy, G.VW, G.VH, t);
    c.save(); c.translate(-cx, -cy);
    G.drawInterior(c, a.theme, cx, cy, cx + G.VW, cy + G.VH);
    const x0 = cx - 300, x1 = cx + G.VW + 300;
    for (const d of a.decor) { const dx = d.x, dy = d.y === undefined ? (d.row || 12) * T : d.y; if (dx > x0 && dx < x1) G.drawDecor(c, { ...d, x: dx, y: dy }, t); }
    // tiles
    const gx0 = Math.max(0, Math.floor(cx / T)), gx1 = Math.min(a.w - 1, Math.floor((cx + G.VW) / T));
    const gy0 = Math.max(0, Math.floor(cy / T)), gy1 = Math.min(a.h - 1, Math.floor((cy + G.VH) / T));
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const ch = a.map[gy][gx], x = gx * T, y = gy * T;
      if (ch === '#') G.drawSolid(c, a.theme, x, y, gx, gy, !solid(tileAt(gx, gy - 1)) && tileAt(gx, gy - 1) !== '~');
      else if (ch === '=') G.drawPlat(c, a.theme, x, y, gx, tileAt(gx - 1, gy) !== '=', tileAt(gx + 1, gy) !== '=');
    }
    // entities
    for (const e of E.ents) drawEnt(c, e, t);
    // pet follows a few steps behind
    const pet = G.S.avatar.pet;
    if (pet && pet !== 'none' && E.trail.length) { const q = E.trail[0]; G.drawCreature(c, pet, q.x - q.face * 46, q.y, 0.85, { t, face: q.face, walk: q.walk ? 1 : 0 }); }
    // player
    c.save(); c.translate(P.x, P.y); c.scale(1 + P.squash * 0.6, 1 - P.squash);
    G.drawAvatar(c, G.S.avatar, 0, 0, 1, { t, walk: P.walkT > 0 ? 1 : 0, air: P.ground ? 0 : (P.vy < 0 ? 1 : 2), face: P.face, wave: P.wave > 0 });
    c.restore();
    // water in front of the player
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) if (a.map[gy][gx] === '~') { c.globalAlpha = 0.78; G.drawWater(c, a.theme, gx * T, gy * T, tileAt(gx, gy - 1) !== '~', t); c.globalAlpha = 1; }
    // particles
    for (const p of E.parts) { c.globalAlpha = Math.max(0, p.life / p.max); if (p.kind === 'spark') G.star(c, p.x, p.y, p.r * 1.4, p.col); else G.circ(c, p.x, p.y, p.r, p.col); }
    c.globalAlpha = 1;
    // "press ✋" hint over the nearest thing
    if (E.near && !G.paused) { const e = E.near, h = e.k === 'gate' ? 230 : e.k === 'door' ? 160 : 140, bob = Math.sin(t * 5) * 4; G.circ(c, e.px, e.py - h + bob, 26, 'rgba(255,255,255,.92)'); G.emoji(c, e.k === 'npc' ? '💬' : '✋', e.px, e.py - h + bob, 30); }
    c.restore();
  };

  function drawEnt(c, e, t) {
    if (e.k === 'gem') {
      const y = e.py - 34 + Math.sin(e.t * 3) * 5;
      G.circ(c, e.px, y, 30 + Math.sin(t * 4) * 3, G.GEM_INFO[e.col].col + '33');
      G.drawGem(c, e.col, e.px, y, 18, t);
      if (Math.random() < 0.05) E.parts.push({ x: e.px + U.rnd(-20, 20), y: y + U.rnd(-20, 20), vx: 0, vy: -20, life: 0.6, max: 0.6, col: '#fff', kind: 'spark', r: 3 });
    } else if (e.k === 'npc') {
      const who = G.PEOPLE[e.who]; const face = P.x < e.px ? -1 : 1;
      G.drawLook(c, who.look, e.px, e.py, 1, { t: t + e.t, face });
      if (!G.S.seen['talk:' + e.id]) { const bob = Math.sin(t * 4) * 3; G.circ(c, e.px + 30, e.py - 120 + bob, 16, '#ffc93c'); c.fillStyle = '#fff'; c.font = '700 22px ' + G.FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', e.px + 30, e.py - 119 + bob); }
    } else if (e.k === 'gate') {
      const open = !!G.S.locks[e.id];
      G.drawDoor(c, e.px, e.py, { style: 'gate', open, icon: e.icon }, t);
      if (!open) { // recipe plaque
        const need = Object.entries(e.needs); const w = need.length * 56 + 10;
        G.rr(c, e.px - w / 2, e.py - 70, w, 44, 14); c.fillStyle = 'rgba(255,255,255,.92)'; c.fill();
        need.forEach(([col, n], i) => { const x = e.px - w / 2 + 33 + i * 56; G.drawGem(c, col, x - 8, e.py - 48, 11, t); c.fillStyle = '#3b3350'; c.font = '700 22px ' + G.FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(n, x + 14, e.py - 47); });
      }
    } else if (e.k === 'door') {
      G.drawDoor(c, e.px, e.py, { style: 'door', icon: e.icon, col: e.col }, t);
    } else if (e.k === 'sign' && !e.hidden) {
      G.drawDecor(c, { k: 'sign', x: e.px, y: e.py, icon: e.icon || '📜' }, t);
    }
  }
})();

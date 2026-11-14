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
    E.noise = 0; E.warned = false; E.check = { x: P.x, y: P.y }; E.creakT = 0;
    const nb = document.getElementById('noisebar'); if (nb) nb.classList.toggle('hidden', !a.hush);
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
  function land(v) { if (E.area && E.area.hush) makeNoise(0.05 + Math.max(0, v - 650) / 900 * 0.35); P.squash = Math.min(0.3, v / 3000); G.sfx('land'); for (let i = 0; i < 6; i++) E.parts.push({ x: P.x + U.rnd(-14, 14), y: P.y, vx: U.rnd(-60, 60), vy: U.rnd(-60, -10), life: 0.4, max: 0.4, col: 'rgba(255,255,255,.8)', kind: 'dust', r: U.rnd(3, 6) }); }

  function updatePlayer(dt) {
    const I = G.input, frozen = G.paused;
    const dir = frozen ? 0 : (I.right ? 1 : 0) - (I.left ? 1 : 0);
    const wasWater = P.inWater;
    P.inWater = tileAt(Math.floor(P.x / T), Math.floor((P.y - 20) / T)) === '~';
    if (P.inWater && !wasWater && P.vy > 100) { G.sfx('splash'); E.burst(P.x, P.y - 20, '#bfe9ff', 12); }
    if (dir) { P.face = dir; P.vx += dir * (P.ground ? PH.accel : PH.airAccel) * dt; const top = E.area && E.area.hush ? PH.run * 0.75 : PH.run; P.vx = U.clamp(P.vx, -top, top); }
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
    const oldX = P.x; P.x += P.vx * dt; collideX(); blockDoors(oldX);
    const prevY = P.y; P.y += P.vy * dt; collideY(prevY);
    P.squash *= Math.pow(0.0005, dt);
    if (P.ground && Math.abs(P.vx) > 20) P.walkT += dt; else P.walkT = 0;
    P.safeT -= dt;
    if (P.ground && P.safeT <= 0 && solid(tileAt(Math.floor((P.x - 20) / T), Math.floor(P.y / T))) && solid(tileAt(Math.floor((P.x + 20) / T), Math.floor(P.y / T)))) { P.safe = { x: P.x, y: P.y }; P.safeT = 0.4; }
    if (P.y > E.area.h * T + 200) { P.x = P.safe.x; P.y = P.safe.y; P.vx = P.vy = 0; G.sfx('pop'); if (G.UI) G.UI.toast('Whoops! 🙃'); }
    E.trail.push({ x: P.x, y: P.y, face: P.face, walk: P.walkT > 0 }); if (E.trail.length > 30) E.trail.shift();
  }

  /* closed maths doors are walls (whole height of the room) */
  function blockDoors(oldX) {
    for (const e of E.ents) {
      if (e.k !== 'mdoor' || G.S.locks[e.id]) continue;
      const half = 34 + PH.w / 2;
      if (oldX <= e.px && P.x > e.px - half) { P.x = e.px - half; P.vx = 0; }
      else if (oldX > e.px && P.x < e.px + half) { P.x = e.px + half; P.vx = 0; }
    }
  }

  /* ---------- Hush House noise (SPEC §7.3) ---------- */
  function makeNoise(n) { E.noise = Math.min(1, (E.noise || 0) + n); }
  function updateHush(dt) {
    const onFloor = P.ground && Math.floor(P.y / T) === 12;
    let loud = false;
    for (const e of E.ents) {
      if (e.k === 'check' && P.x > e.px - 20 && P.x > E.check.x + 1) E.check = { x: e.px, y: e.py };
      else if (e.k === 'creak' && onFloor && Math.abs(P.vx) > 20 && P.x > e.x0 * T && P.x < (e.x1 + 1) * T) {
        loud = true; makeNoise(0.42 * dt); E.creakT -= dt;
        if (E.creakT <= 0) { E.creakT = 0.55; G.sfx('creak'); E.parts.push({ x: P.x, y: P.y - 20, vx: 0, vy: -40, life: 0.8, max: 0.8, col: '#fff', kind: 'text', txt: 'creak!', r: 16 }); }
      } else if (e.k === 'squeak' && onFloor && Math.abs(P.x - e.px) < 26 && e.cool <= 0) {
        e.cool = 1.5; e.squish = 0.4; loud = true; makeNoise(0.22); G.sfx('squeak');
        E.parts.push({ x: e.px, y: e.py - 50, vx: 0, vy: -40, life: 0.8, max: 0.8, col: '#fff', kind: 'text', txt: 'squeak!', r: 16 });
      }
      if (e.squish > 0) e.squish -= dt;
    }
    if (!loud) E.noise = Math.max(0, E.noise - 0.07 * dt);
    if (E.noise > 0.7 && !E.warned) { E.warned = true; G.UI.toast('Shh! Mum is stirring… 🤫', true); }
    if (E.noise < 0.4) E.warned = false;
    const bar = document.querySelector('#noisebar .meter i'); if (bar) bar.style.width = Math.round(E.noise * 100) + '%';
    if (E.noise >= 1 && !E.waking) {
      E.waking = true; G.paused = true; G.sfx('snore');
      G.UI.toast('“Mmm… who\'s there?” Back to the night-light, quietly! 🌙', true);
      setTimeout(() => G.UI.fade(() => { P.x = E.check.x; P.y = E.check.y; P.vx = P.vy = 0; E.noise = 0; E.waking = false; G.paused = false; }), 1400);
    }
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
      if (e.hidden || (e.k === 'mdoor' && G.S.locks[e.id]) || e.k === 'creak' || e.k === 'squeak' || e.k === 'check') continue;
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
    else if (e.k === 'lesson') G.LS.run(e);
    else if (e.k === 'sign') G.UI.toast('📜 ' + e.text, true);
    else if (e.k === 'gate') G.UI.gate(e);
    else if (e.k === 'mdoor') E.mathsDoor(e);
    else if (e.k === 'mum') E.tuckIn(e);
    else if (e.k === 'door') {
      G.sfx('door');
      if (e.act === 'wardrobe') G.UI.creator(false);
      else if (e.act === 'play') G.UI.soon('The playroom');
      else if (e.to) E.travel(e.to, e.at);
    }
  };
  E.mathsDoor = async function (e) {
    if (G.S.locks[e.id] || e.busy) return;
    e.busy = true;
    await G.UI.talk({ name: 'Number lock', look: { cre: 'owl', s: 1.3, acc: 'bowtie' } }, ['This door has a number lock. Solve the sum to open it!']);
    const res = await G.PZ.run({ colour: 'red', subject: 'maths' });
    e.busy = false;
    if (!res.ok) return;
    G.S.locks[e.id] = true; G.sfx('door'); E.burst(e.px, e.py - 90, '#ffd24a', 18); G.saveGame();
  };
  E.tuckIn = async function (e) {
    const S = G.S, me = { name: S.name || 'You', look: { av: S.avatar } };
    if (S.quests.hush) { G.UI.toast('Sweet dreams, Mum. 💤', true); return; }
    await G.UI.talk(me, ['Night-night, Mum. Here is your blanket.', 'Mum smiles in her sleep. You were as quiet as a mouse!']);
    S.quests.hush = true; S.gems.yellow++; S.coins += 5; S.owned['held:lantern'] = true;
    G.sfx('fanfare'); E.burst(e.px, e.py - 60, '#ffc93c', 30);
    G.UI.flyGem('yellow', e.px - E.cam.x, e.py - 80 - E.cam.y);
    G.UI.banner('You did it! 🌙'); G.saveGame();
    setTimeout(() => G.UI.toast('You won a night lantern! Find it in the dressing-up cottage. 🏮', true), 2400);
  };
  E.travel = function (to, at) {
    if (!G.AREAS[to]) { G.UI.soon((G.AREA_NAMES && G.AREA_NAMES[to]) || 'That place'); return false; }
    G.UI.fade(() => E.load(to, at)); return true;
  };
  E.tapAt = function (wx, wy) {   // tapping a nearby character / gate also interacts
    for (const e of E.ents) if (e.k !== 'gem' && !e.hidden && !/creak|squeak|check/.test(e.k) && Math.abs(e.px - wx) < 60 && wy > e.py - 170 && wy < e.py + 10 && near(e, 200)) { E.interact(e); return true; }
    return false;
  };

  E.update = function (dt) {
    if (!E.area) return;
    updatePlayer(dt);
    updateEnts(dt);
    if (E.area.hush) updateHush(dt);
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
    for (const p of E.parts) { c.globalAlpha = Math.max(0, p.life / p.max); if (p.kind === 'text') { c.fillStyle = p.col; c.strokeStyle = '#3b3350'; c.lineWidth = 4; c.font = '700 ' + p.r * 1.5 + 'px ' + G.FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeText(p.txt, p.x, p.y); c.fillText(p.txt, p.x, p.y); } else if (p.kind === 'spark') G.star(c, p.x, p.y, p.r * 1.4, p.col); else G.circ(c, p.x, p.y, p.r, p.col); }
    c.globalAlpha = 1;
    // "press ✋" hint over the nearest thing
    if (E.near && !G.paused) { const e = E.near, h = e.k === 'gate' || e.k === 'mdoor' ? 230 : e.k === 'mum' ? 150 : e.k === 'door' ? 160 : 140, bob = Math.sin(t * 5) * 4; G.circ(c, e.px, e.py - h + bob, 26, 'rgba(255,255,255,.92)'); G.emoji(c, e.k === 'npc' ? '💬' : '✋', e.px, e.py - h + bob, 30); }
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
    } else if (e.k === 'lesson') {
      const stone = !!e.words, done = G.S.quests['lesson:' + e.id];
      if (!stone) G.drawDecor(c, { k: 'tree', x: e.px, y: e.py, col: e.col || '#7ed16a', s: 1.1 }, t);
      const w = stone ? 150 : 170, y = e.py - (stone ? 62 : 120);
      c.fillStyle = '#8d5a3b'; if (!stone) c.fillRect(e.px - 5, y + 30, 10, e.py - y - 30);
      G.rr(c, e.px - w / 2, y - 34, w, 64, 14); c.fillStyle = stone ? '#cfd6e6' : '#f3d9ac'; c.fill(); c.strokeStyle = stone ? '#8f9ab3' : '#8d5a3b'; c.lineWidth = 4; c.stroke();
      c.fillStyle = '#3b3350'; c.font = '600 30px ' + G.FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(stone ? e.words.slice(0, 2).map(x => x[0]).join(' ') : e.letters.slice(0, 6).split('').join(' '), e.px + 10, y);
      G.emoji(c, e.icon, e.px - w / 2 + 6, y - 30, 30);
      if (done) G.emoji(c, '⭐', e.px + w / 2 - 6, y - 30, 30);
      else { const bob = Math.sin(t * 4) * 3; G.circ(c, e.px + w / 2 - 6, y - 32 + bob, 16, '#4aa8ff'); G.drawGem(c, 'blue', e.px + w / 2 - 6, y - 32 + bob, 9, t); }
    } else if (e.k === 'mdoor') {
      const open = !!G.S.locks[e.id];
      G.drawDoor(c, e.px, e.py, { style: 'gate', open, icon: open ? '✨' : '🔢', glow: '#ffe9a8' }, t);
      if (!open) { G.rr(c, e.px - 34, e.py - 96, 68, 40, 12); c.fillStyle = '#fff'; c.fill(); c.fillStyle = '#c2264a'; c.font = '700 24px ' + G.FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('+ −', e.px, e.py - 76); }
    } else if (e.k === 'creak') {
      for (let x = e.x0 * T; x < (e.x1 + 1) * T; x += 24) { c.fillStyle = '#7d5230'; c.fillRect(x + 2, e.py - 4, 20, 6); }
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(e.x0 * T + 6, e.py - 8); c.lineTo((e.x1 + 1) * T - 6, e.py - 8); c.stroke(); c.setLineDash([]);
    } else if (e.k === 'squeak') {
      const sq = e.squish > 0 ? 0.7 : 1; c.save(); c.translate(e.px, e.py); c.scale(1 / sq, sq); G.emoji(c, e.icon, 0, -18, 34); c.restore();
    } else if (e.k === 'check') {
      const lit = E.check && Math.abs(E.check.x - e.px) < 2;
      G.circ(c, e.px, e.py - 40, lit ? 34 + Math.sin(t * 3) * 3 : 22, lit ? 'rgba(255,233,140,.35)' : 'rgba(255,255,255,.12)');
      G.rr(c, e.px - 10, e.py - 30, 20, 30, 6); c.fillStyle = '#e3e0ef'; c.fill(); G.emoji(c, '🌙', e.px, e.py - 44, lit ? 30 : 24);
    } else if (e.k === 'mum') {
      G.drawDecor(c, { k: 'bed', x: e.px, y: e.py, mum: true, col: '#b77bff' }, t);
      if (E.noise > 0.7) G.emoji(c, '😟', e.px - 58, e.py - 110 + Math.sin(t * 8) * 3, 30);
      if (G.S.quests.hush) G.emoji(c, '💖', e.px + 40, e.py - 100 + Math.sin(t * 2) * 4, 30);
    } else if (e.k === 'sign' && !e.hidden) {
      G.drawDecor(c, { k: 'sign', x: e.px, y: e.py, icon: e.icon || '📜' }, t);
    }
  }
})();

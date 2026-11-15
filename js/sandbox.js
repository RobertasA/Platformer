/* Hazelnut Hollow — free-play playrooms (SPEC §8). G.SB.register(id, room) / G.SB.open(id?).
   Rooms live in js/play-<id>.js and build themselves inside a 1280×720 stage. No goals, no failure. */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const SB = G.SB = { rooms: {}, order: [] };
  let live = null;

  SB.register = function (id, room) { room.id = id; SB.rooms[id] = room; if (!SB.order.includes(id)) SB.order.push(id); };

  const leave = () => { if (live && live.destroy) { try { live.destroy(); } catch (e) { console.error(e); } } live = null; G.hush(); };
  SB.close = function () { if (G.GM) G.GM.did('play'); leave(); G.UI.overlay(false); G.UI.hud(true); G.paused = false; G.saveGame(); };

  SB.open = function (id) {
    leave(); G.paused = true; G.UI.hud(false);
    const ov = G.UI.overlay(true), wrap = U.el('div', 'sbwrap'); ov.appendChild(wrap);
    const room = id && SB.rooms[id];
    if (!room) {   // the toy box
      wrap.classList.add('toybox');
      wrap.appendChild(U.el('div', 'sbtitle', '🧸 Playroom'));
      const grid = U.el('div', 'sbgrid'); wrap.appendChild(grid);
      for (const rid of SB.order) {
        const r = SB.rooms[rid], b = U.el('button', 'sbroom', '<span class="ic">' + r.icon + '</span><span class="nm">' + r.name + '</span><span class="bl">' + (r.blurb || '') + '</span>');
        b.style.setProperty('--col', r.col || '#ffd27a');
        b.onclick = () => { G.sfx('door'); SB.open(rid); };
        grid.appendChild(b);
      }
      const x = U.el('button', 'closex', '✕'); x.onclick = () => { G.sfx('tap'); SB.close(); }; wrap.appendChild(x);
      setTimeout(() => G.say('What shall we play?', true), 200);
      return;
    }
    const stage = U.el('div', 'sbstage sb-' + id); wrap.appendChild(stage);
    const back = U.el('button', 'sbback', '⬅'); back.onclick = () => { G.sfx('tap'); G.saveGame(); SB.open(); }; wrap.appendChild(back);
    const state = G.S.playsets[id] = G.S.playsets[id] || {};
    const pos = e => { const r = stage.getBoundingClientRect(), k = 1280 / r.width; return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k }; };
    const api = {
      state, W: 1280, H: 720, pos, save: () => G.saveGame(), say: t => G.say(t, true), sfx: n => G.sfx(n),
      spark(x, y, ch) {
        for (let i = 0; i < 7; i++) {
          const s = U.el('span', 'sbspark', ch || U.pick(['✨', '⭐', '💖', '✨'])), a = Math.random() * 6.28, d = 40 + Math.random() * 70;
          s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d - 30 + 'px');
          stage.appendChild(s); setTimeout(() => s.remove(), 800);
        }
      },
      drag(el, h) {
        el.style.touchAction = 'none';
        el.addEventListener('pointerdown', e => {
          e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (_) { }
          const p0 = pos(e); let moved = false; if (h.onStart) h.onStart(p0.x, p0.y, e);
          const mv = ev => { if (ev.pointerId !== e.pointerId) return; const p = pos(ev); if (Math.hypot(p.x - p0.x, p.y - p0.y) > 8) moved = true; if (h.onMove) h.onMove(p.x, p.y, ev); };
          const up = ev => { if (ev.pointerId !== e.pointerId) return; el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); const p = pos(ev); if (h.onEnd) h.onEnd(p.x, p.y, moved, ev); };
          el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
        });
      },
    };
    live = room.mount(stage, api) || {};
  };
})();

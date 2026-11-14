/* Hazelnut Hollow — Dolls' House playroom (SPEC §8.2 `dolls`). */
(function () {
  'use strict';
  const G = window.G;
  const MAX = 60, BIN = { x: 1186, y: 508, r: 78 }, DRAWER_Y = 612;
  const GROUPS = [
    [['🛏️', 'bed'], ['🛋️', 'sofa'], ['🪑', 'chair'], ['🚽', 'toilet'], ['🛁', 'bath'], ['📺', 'telly'], ['🪴', 'plant'], ['🖼️', 'picture'], ['🕰️', 'clock'], ['🪞', 'mirror'], ['🚪', 'door'], ['🧺', 'basket']],
    [['👧', 'girl'], ['👦', 'boy'], ['👩', 'mummy'], ['👨', 'daddy'], ['👵', 'granny'], ['👴', 'grandad'], ['👶', 'baby']],
    [['🐶', 'dog'], ['🐱', 'cat'], ['🐹', 'hamster'], ['🐰', 'bunny'], ['🐦', 'bird']],
    [['🍰', 'cake'], ['🍎', 'apple'], ['🫖', 'teapot'], ['🥣', 'soup'], ['🍪', 'biscuit']],
    [['🧸', 'teddy'], ['🪀', 'yo-yo'], ['⚽', 'ball'], ['🎈', 'balloon'], ['🚂', 'train'], ['📚', 'books'], ['🎁', 'present']],
  ];
  const NAME = {}; GROUPS.forEach(g => g.forEach(s => NAME[s[0]] = s[1]));
  const SND = { '🐱': 'meow', '🐶': 'squeak', '🐹': 'squeak', '🐰': 'squeak', '🐦': 'squeak', '🚪': 'door', '🎈': 'pop', '👶': 'squeak', '🕰️': 'tap', '🛁': 'bubble', '🫖': 'bubble' };
  const DEFAULTS = [{ ch: '🛏️', x: 270, y: 352 }, { ch: '👧', x: 440, y: 352 }, { ch: '🛋️', x: 760, y: 512 }, { ch: '🐱', x: 880, y: 516 }, { ch: '🍰', x: 330, y: 516 }, { ch: '🧸', x: 400, y: 186 }];
  const ROOMS = [
    { x: 150, y: 266, w: 396, h: 152, c: 'bed' }, { x: 554, y: 266, w: 396, h: 152, c: 'bath' },
    { x: 150, y: 434, w: 396, h: 146, c: 'kit' }, { x: 554, y: 434, w: 396, h: 146, c: 'liv' },
  ];

  function mount(stage, api) {
    const timers = new Set();
    const later = (f, ms) => { const t = setTimeout(() => { timers.delete(t); f(); }, ms); timers.add(t); return t; };
    const el = (cls, html, css) => { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; if (css) d.style.cssText = css; return d; };
    const st = api.state;
    if (!Array.isArray(st.items)) { st.items = DEFAULTS.map(o => Object.assign({}, o)); api.save(); }
    st.items = st.items.filter(o => o && typeof o.ch === 'string' && isFinite(o.x) && isFinite(o.y)).slice(0, MAX);
    st.night = !!st.night;

    // ---- scenery
    const add = (cls, html, css) => { const d = el(cls, html, css); stage.appendChild(d); return d; };
    add('d-sky'); add('d-sky d-nightsky');
    let stars = ''; for (let i = 0; i < 46; i++) stars += '<i style="left:' + (Math.random() * 1280 | 0) + 'px;top:' + (Math.random() * 380 | 0) + 'px;animation-delay:' + (Math.random() * 3).toFixed(1) + 's;font-size:' + (8 + Math.random() * 12 | 0) + 'px">✦</i>';
    add('d-stars', stars);
    add('d-sun', '🌞'); add('d-moon', '🌙');
    add('d-cloud', '☁️', 'top:70px;--s:90px;animation-duration:70s;animation-delay:-20s');
    add('d-cloud', '☁️', 'top:190px;--s:64px;animation-duration:95s;animation-delay:-60s');
    add('d-ground');
    // garden
    add('d-tree', '<div class="tr"></div><div class="lf a"></div><div class="lf b"></div><div class="lf c"></div><span class="ap" style="left:34px;top:46px">🍎</span><span class="ap" style="left:110px;top:70px">🍎</span>', 'left:1010px;top:330px');
    add('d-bush', '', 'left:6px;top:520px;width:112px');
    add('d-fence', '', 'left:990px;top:540px;width:290px');
    add('d-deco', '🌷', 'left:1130px;top:545px'); add('d-deco', '🌻', 'left:1000px;top:540px;animation-delay:-.7s'); add('d-deco', '🌼', 'left:30px;top:526px;animation-delay:-1.4s'); add('d-deco', '🦋', 'left:1090px;top:430px;animation:dfly 5s ease-in-out infinite');
    // chimney, roof, attic
    add('d-chimney', '<b class="cap"></b><i class="sm" style="animation-delay:0s">☁️</i><i class="sm" style="animation-delay:-1.3s">☁️</i><i class="sm" style="animation-delay:-2.6s">☁️</i>');
    add('d-roof'); add('d-eave');
    const attic = add('d-attic', '<div class="fl"></div>');
    attic.appendChild(el('d-lampcord', '', 'left:550px;top:50px;height:52px'));
    attic.appendChild(el('d-shade', '', 'left:526px;top:100px'));
    attic.appendChild(el('d-win round', '<b></b>', 'left:660px;top:150px;width:64px;height:64px'));
    attic.appendChild(el('d-win round', '<b></b>', 'left:376px;top:150px;width:64px;height:64px'));
    add('d-frame');
    const lights = el('d-lights');
    const glow = (x, y, r) => lights.appendChild(el('d-glow', '', 'left:' + (x - r) + 'px;top:' + (y - r) + 'px;width:' + 2 * r + 'px;height:' + 2 * r + 'px'));
    ROOMS.forEach((r, i) => {
      const rm = add('d-room ' + r.c, '<div class="fl"></div>', 'left:' + r.x + 'px;top:' + r.y + 'px;width:' + r.w + 'px;height:' + r.h + 'px');
      const wx = i % 2 ? 40 : 276, lx = r.w / 2;
      rm.appendChild(el('d-win', '<b></b><u class="cl"></u><u class="cr"></u>', 'left:' + wx + 'px;top:24px'));
      rm.appendChild(el('d-lampcord', '', 'left:' + lx + 'px;top:0;height:30px'));
      rm.appendChild(el('d-shade', '', 'left:' + (lx - 24) + 'px;top:28px'));
      lights.appendChild(el('d-winlit', '', 'left:' + (r.x + wx) + 'px;top:' + (r.y + 24) + 'px'));
      glow(r.x + lx, r.y + 48, 200);
    });
    lights.appendChild(el('d-winlit round', '', 'left:660px;top:150px;width:64px;height:64px'));
    lights.appendChild(el('d-winlit round', '', 'left:376px;top:150px;width:64px;height:64px'));
    glow(550, 112, 190);
    add('d-wash'); stage.appendChild(lights);

    const layer = add('d-items');
    const binEl = add('d-bin', '<span>🗑️</span>', 'left:' + (BIN.x - 48) + 'px;top:' + (BIN.y - 48) + 'px');

    // ---- day / night switch
    const sw = add('d-switch', '<button class="dsun" aria-label="Day">🌞</button><button class="dmoon" aria-label="Night">🌙</button>');
    const setNight = (n, quiet) => {
      st.night = n; stage.classList.toggle('night', n); api.save();
      if (!quiet) { api.sfx(n ? 'magic' : 'pop'); api.say(n ? 'Night night!' : 'Good morning!'); }
    };
    sw.querySelector('.dsun').addEventListener('pointerup', e => { e.preventDefault(); if (st.night) setNight(false); });
    sw.querySelector('.dmoon').addEventListener('pointerup', e => { e.preventDefault(); if (!st.night) setNight(true); });
    stage.classList.toggle('night', st.night);

    // ---- items
    const clampPos = o => {
      o.x = Math.max(44, Math.min(1236, o.x)); o.y = Math.max(44, Math.min(566, o.y));
      if (o.x < 124 && o.y < 112) o.y = 112;
    };
    const place = (d, o) => { d.style.left = o.x + 'px'; d.style.top = o.y + 'px'; };
    const wobble = d => {
      const g = d.firstChild; g.classList.remove('wob'); void g.offsetWidth; g.classList.add('wob');
      later(() => g.classList.remove('wob'), 700);
    };
    const speak = ch => { api.sfx(SND[ch] || 'squeak'); api.say(NAME[ch] || 'Hello!'); };
    const overBin = p => Math.hypot(p.x - BIN.x, p.y - BIN.y) < BIN.r;
    const removeEl = (d, x, y) => { api.spark(x, y, '💨'); api.sfx('pop'); d.classList.add('gone'); later(() => d.remove(), 220); };

    function makeItem(o, popIn) {
      const d = el('d-it', '<span class="g">' + o.ch + '</span>');
      place(d, o); d.style.zIndex = Math.round(o.y);
      if (popIn) d.classList.add('popin');
      d.addEventListener('pointerdown', e => {
        e.preventDefault(); try { d.setPointerCapture(e.pointerId); } catch (_) { }
        const p0 = api.pos(e), off = { x: o.x - p0.x, y: o.y - p0.y }; let moved = false;
        const mv = ev => {
          if (ev.pointerId !== e.pointerId) return;
          const p = api.pos(ev);
          if (!moved && Math.hypot(p.x - p0.x, p.y - p0.y) > 10) { moved = true; d.classList.add('held'); d.classList.remove('popin'); d.style.zIndex = 900; api.sfx('tap'); }
          if (!moved) return;
          o.x = p.x + off.x; o.y = p.y + off.y; place(d, o);
          binEl.classList.toggle('hot', overBin(p) || p.y > DRAWER_Y);
        };
        const up = ev => {
          if (ev.pointerId !== e.pointerId) return;
          d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', up); d.removeEventListener('pointercancel', up);
          binEl.classList.remove('hot'); const p = api.pos(ev);
          if (!moved) { wobble(d); speak(o.ch); return; }
          d.classList.remove('held');
          if (overBin(p) || p.y > DRAWER_Y) {
            const i = st.items.indexOf(o); if (i >= 0) st.items.splice(i, 1);
            removeEl(d, p.x, p.y); api.save(); return;
          }
          clampPos(o); place(d, o); d.style.zIndex = Math.round(o.y); d.classList.add('settle'); later(() => d.classList.remove('settle'), 400);
          api.sfx('pop'); api.save();
        };
        d.addEventListener('pointermove', mv); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
      });
      layer.appendChild(d); return d;
    }
    st.items.forEach(o => makeItem(o, false));

    // ---- drawer
    const drawer = add('d-drawer');
    const view = el('d-view'), track = el('d-track');
    GROUPS.forEach((g, gi) => {
      if (gi) track.appendChild(el('d-sep'));
      g.forEach(s => track.appendChild(el('d-dk', '<span class="g">' + s[0] + '</span>')));
    });
    const cells = track.querySelectorAll('.d-dk'); const chars = []; GROUPS.forEach(g => g.forEach(s => chars.push(s[0])));
    cells.forEach((c, i) => c.dataset.ch = chars[i]);
    view.appendChild(track);
    const mkArrow = (txt, left) => { const b = el('d-arrow', txt, (left ? 'left:10px' : 'right:10px')); b.style.touchAction = 'none'; return b; };
    const aL = mkArrow('◀', true), aR = mkArrow('▶', false);
    drawer.appendChild(aL); drawer.appendChild(view); drawer.appendChild(aR);
    let scroll = 0;
    const maxScroll = () => Math.max(0, track.scrollWidth - view.clientWidth);
    const setScroll = (v, smooth) => {
      scroll = Math.max(0, Math.min(maxScroll(), v));
      track.classList.toggle('smooth', !!smooth); track.style.transform = 'translateX(' + (-scroll) + 'px)';
      aL.classList.toggle('dim', scroll <= 2); aR.classList.toggle('dim', scroll >= maxScroll() - 2);
    };
    [[aL, -1], [aR, 1]].forEach(([b, dir]) => b.addEventListener('pointerup', e => { e.preventDefault(); api.sfx('tap'); setScroll(scroll + dir * 480, true); }));
    later(() => setScroll(0), 50);

    let dr = null;
    view.addEventListener('pointerdown', e => {
      e.preventDefault(); try { view.setPointerCapture(e.pointerId); } catch (_) { }
      const cell = e.target.closest && e.target.closest('.d-dk');
      dr = { id: e.pointerId, p0: api.pos(e), cell, mode: null, sx: scroll, ghost: null, o: null };
      if (cell) cell.classList.add('press');
    });
    view.addEventListener('pointermove', e => {
      if (!dr || e.pointerId !== dr.id) return;
      const p = api.pos(e), dx = p.x - dr.p0.x, dy = p.y - dr.p0.y;
      if (!dr.mode) {
        if (dr.cell && dy < -14 && -dy > Math.abs(dx) * 0.7) {
          dr.mode = 'drag'; dr.cell.classList.remove('press'); api.sfx('tap');
          dr.o = { ch: dr.cell.dataset.ch, x: p.x, y: p.y }; dr.ghost = makeItem(dr.o, false);
          dr.ghost.classList.add('held'); dr.ghost.style.zIndex = 900; dr.ghost.style.pointerEvents = 'none';
        } else if (Math.abs(dx) > 10) { dr.mode = 'scroll'; if (dr.cell) dr.cell.classList.remove('press'); }
      }
      if (dr.mode === 'scroll') setScroll(dr.sx - dx);
      else if (dr.mode === 'drag') {
        dr.o.x = p.x; dr.o.y = p.y; place(dr.ghost, dr.o);
        binEl.classList.toggle('hot', overBin(p));
      }
    });
    const end = e => {
      if (!dr || e.pointerId !== dr.id) return;
      const p = api.pos(e), d = dr; dr = null; binEl.classList.remove('hot');
      if (d.cell) d.cell.classList.remove('press');
      if (!d.mode && d.cell && e.type === 'pointerup') { wobble(d.cell); speak(d.cell.dataset.ch); return; }
      if (d.mode !== 'drag') return;
      d.ghost.style.pointerEvents = '';
      if (e.type === 'pointercancel' || overBin(p) || p.y > DRAWER_Y) { d.ghost.remove(); if (overBin(p)) api.spark(p.x, p.y, '💨'); return; }
      if (st.items.length >= MAX) { d.ghost.remove(); api.sfx('wrong'); api.say('The house is full!'); return; }
      clampPos(d.o); place(d.ghost, d.o); d.ghost.style.zIndex = Math.round(d.o.y);
      d.ghost.classList.remove('held'); d.ghost.classList.add('popin');
      st.items.push(d.o); api.sfx('pop'); api.spark(d.o.x, d.o.y); api.save();
      speak(d.o.ch);
    };
    view.addEventListener('pointerup', end); view.addEventListener('pointercancel', end);

    later(() => api.say("Let's play house!"), 300);
    return { destroy() { timers.forEach(clearTimeout); timers.clear(); } };
  }

  G.SB.register('dolls', { name: "Dolls' House", icon: '🏠', col: '#ffb3c7', blurb: 'Make a cosy home', mount });
})();

/* Hazelnut Hollow — Vet Clinic playroom (SPEC §8.2 'vet'). Free play: no goals, no failure. */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.SB) return;

  const WORRY = { sick: '🤒', paw: '🩹', mucky: '🦠', hungry: '😋', sleepy: '💤' };
  const WKEYS = Object.keys(WORRY);
  const TOOLS = [
    { id: 'steth', ch: '🩺', nm: 'Listen' }, { id: 'thermo', ch: '🌡️', nm: 'Warm?' },
    { id: 'med', ch: '💊', nm: 'Medicine' }, { id: 'plaster', ch: '🩹', nm: 'Plaster' },
    { id: 'sponge', ch: '🧼', nm: 'Wash' }, { id: 'food', ch: '🥕', nm: 'Snack' },
    { id: 'cuddle', ch: '🧸', nm: 'Cuddle' },
  ];
  const KINDS = ['cat', 'dog', 'bunny', 'owl', 'dragon'];
  const NAMES = { cat: 'Kit', dog: 'Biscuit', bunny: 'Clover', owl: 'Hoot', dragon: 'Ember' };
  const THANKS = ['Thank you, vet!', 'I feel better!', 'Yay! Thank you!', 'You are kind, vet!', 'All better now!', 'Thank you so much!'];
  // slots: feet position + scale on the bench; the table is a single spot
  const SLOTS = [{ x: 150, y: 405, sc: .62 }, { x: 285, y: 405, sc: .62 }, { x: 420, y: 405, sc: .62 }, { x: 215, y: 600, sc: .62 }, { x: 355, y: 600, sc: .62 }];
  const TABLE = { x: 700, y: 478, sc: 1.2 };
  const CW = 240, CH = 200, FX = 120, FY = 186;   // patient canvas size + feet point inside it

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const mk = (cls, html, parent) => { const e = document.createElement('div'); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };

  G.SB.register('vet', {
    name: 'Vet Clinic', icon: '🩺', col: '#9be3c0', blurb: 'Make pets feel better',
    mount(stage, api) {
      let dead = false;
      const timers = new Set();
      const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms); timers.add(id); return id; };
      const st = api.state;
      if (typeof st.cured !== 'number' || !isFinite(st.cured)) st.cured = 0;

      const root = mk('sb-vet', null, stage);
      // ---- scenery ----
      mk('wall', null, root); mk('dado', null, root); mk('floor', null, root);
      mk('window', '<div class="sun">☀️</div><div class="cl c1">☁️</div><div class="cl c2">☁️</div><div class="bars"></div>', root);
      mk('banner', '<span class="cross">✚</span> Vet Clinic', root);
      mk('poster p1', '🦴<small>Chew</small>', root); mk('poster p2', '🥕<small>Yum</small>', root);
      mk('poster p3', '🐾<small>Paws</small>', root);
      mk('plant', '🪴', root); mk('clock', '🕐', root);
      mk('rug', null, root);
      const bench = mk('bench', '<div class="back"></div><div class="seat"></div><div class="legs"><i></i><i></i></div>', root);
      mk('benchtag', 'Waiting', root);
      const table = mk('table', '<div class="pad"></div><div class="top"></div><div class="leg l1"></div><div class="leg l2"></div>', root);
      mk('counter', null, root);
      const tray = mk('tray', '<div class="trayhead">Tools</div>', root);
      const toast = mk('count', '', root);
      const showCount = () => { toast.innerHTML = '💖 ' + st.cured; toast.style.display = st.cured ? '' : 'none'; };
      showCount();

      // ---- patients ----
      const pats = [];
      let onTable = null, tool = null, tAcc = 0, last = performance.now(), raf = 0;

      KINDS.forEach((kind, i) => {
        const el = mk('pt', null, root);
        el.style.width = CW + 'px'; el.style.height = CH + 'px'; el.style.transformOrigin = FX + 'px ' + FY + 'px'; el.style.touchAction = 'none';
        const air = mk('air', null, el), body = mk('body', null, air);
        const cv = document.createElement('canvas'); cv.width = CW * 2; cv.height = CH * 2; cv.style.width = CW + 'px'; cv.style.height = CH + 'px';
        body.appendChild(cv);
        const bub = mk('bub', '', root);
        const p = { kind, i, el, air, body, cv, ctx: cv.getContext('2d'), bub, slot: i, worry: null, stage: 0, rub: 0, spots: [], eat: 0, asleep: false, busy: 0, t: Math.random() * 9, fx: 0, fy: 0, sc: 1, cd: 0 };
        place(p, SLOTS[i], false);
        p.ctx.scale(2, 2);
        pats.push(p);
        let dn = null;
        el.addEventListener('pointerdown', e => { e.preventDefault(); dn = api.pos(e); });
        el.addEventListener('pointerup', e => { if (!dn) return; const q = api.pos(e); const ok = Math.hypot(q.x - dn.x, q.y - dn.y) < 14; dn = null; if (ok) tapPatient(p, q.x, q.y); });
        el.addEventListener('pointercancel', () => { dn = null; });
      });

      function place(p, s, anim) {
        p.fx = s.x; p.fy = s.y; p.sc = s.sc;
        const el = p.el;
        el.style.transition = anim ? 'left .6s cubic-bezier(.3,.7,.4,1), top .6s cubic-bezier(.3,.7,.4,1), transform .6s' : 'none';
        el.style.left = (s.x - FX) + 'px'; el.style.top = (s.y - FY) + 'px'; el.style.transform = 'scale(' + s.sc + ')';
        el.style.zIndex = s === TABLE ? 30 : 10 + Math.round(s.y / 10);
        const bx = s === TABLE ? s.x + 105 : s.x + 30, by = s === TABLE ? s.y - 330 : s.y - 215;
        p.bub.style.transition = anim ? 'left .6s cubic-bezier(.3,.7,.4,1), top .6s cubic-bezier(.3,.7,.4,1)' : 'none';
        p.bub.style.left = bx + 'px'; p.bub.style.top = by + 'px'; p.bub.style.zIndex = 60;
        if (!anim) { p.bub.style.transition = 'none'; }
      }
      const body = p => ({ x: p.fx, y: p.fy - 75 * p.sc });
      const slotFree = () => { const used = new Set(pats.filter(q => q !== onTable).map(q => q.slot)); return used; };

      function hop(p, s, after) {
        p.busy++;
        place(p, s, true);
        p.air.animate([{ transform: 'translateY(0) scale(1,1)' }, { transform: 'translateY(-110px) scale(.94,1.08)', offset: .5 }, { transform: 'translateY(0) scale(1.12,.86)', offset: .9 }, { transform: 'translateY(0) scale(1,1)' }], { duration: 640, easing: 'ease-in-out' });
        api.sfx('squeak');
        later(() => { p.busy--; api.sfx('land'); if (after) after(); }, 640);
      }
      function toTable(p, after) {
        if (onTable === p) { if (after) after(); return; }
        if (onTable) goHome(onTable);
        onTable = p; p.slot = p.slot;
        hop(p, TABLE, after);
      }
      function goHome(p, heart) {
        if (onTable === p) onTable = null;
        const s = SLOTS[p.i];
        clearPlasters(p);
        hop(p, s, () => { if (heart) { puff(p, '💖', 4); } });
      }
      function clearPlasters(p) { p.body.querySelectorAll('.plaster').forEach(n => { n.style.opacity = '0'; setTimeout(() => n.remove(), 400); }); }

      // ---- bubbles / worries ----
      function showWorry(p) {
        p.bub.classList.toggle('on', !!p.worry);
        if (!p.worry) return;
        let ch = WORRY[p.worry]; if (p.worry === 'sick' && p.stage === 1) ch = '💊';
        p.bub.innerHTML = '<span>' + ch + '</span><i class="t1"></i><i class="t2"></i>';
        p.bub.classList.remove('pop'); void p.bub.offsetWidth; p.bub.classList.add('pop');
      }
      function setWorry(p, w) {
        p.worry = w; p.stage = 0; p.rub = 0;
        p.body.querySelectorAll('.spot').forEach(n => n.remove()); p.spots = [];
        if (w === 'mucky') for (let i = 0; i < 4; i++) { const s = mk('spot', '', p.body); s.style.left = (80 + rnd(0, 80)) + 'px'; s.style.top = (80 + rnd(0, 80)) + 'px'; s.style.setProperty('--r', rnd(14, 26) + 'px'); p.spots.push(s); }
        showWorry(p);
      }
      function newWorry(p) { let w; do { w = pick(WKEYS); } while (w === p.last && Math.random() < .8); p.last = w; setWorry(p, w); api.sfx('pop'); }
      // start with a mixed set
      const first = WKEYS.slice().sort(() => Math.random() - .5);
      pats.forEach((p, i) => { p.last = first[i % 5]; setWorry(p, p.last); });

      function cure(p) {
        if (!p.worry) return;
        p.worry = null; showWorry(p);
        st.cured++; try { if (G.S && G.S.stats) G.S.stats.vet = (G.S.stats.vet || 0) + 1; } catch (e) { }
        api.save(); showCount();
        const b = body(p);
        api.sfx('right'); api.spark(b.x, b.y - 20); api.spark(b.x + 30, b.y - 50, '⭐');
        api.say(pick(THANKS));
        p.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18,.84)' }, { transform: 'scale(.9,1.14)' }, { transform: 'scale(1)' }], { duration: 600 });
        later(() => goHome(p, true), 1300);
        later(() => { if (!p.worry) newWorry(p); }, 1300 + rnd(20000, 40000));
      }

      function puff(p, ch, n) {
        const b = body(p);
        for (let i = 0; i < (n || 3); i++) later(() => {
          const h = mk('fl', ch, root); h.style.left = (b.x + rnd(-50, 50)) + 'px'; h.style.top = (b.y - 40) + 'px'; h.style.fontSize = rnd(34, 54) + 'px';
          later(() => h.remove(), 1500);
        }, i * 140);
      }
      function pill(p, html, ms) {
        const b = body(p), e = mk('pill', html, root);
        e.style.left = (b.x + 10) + 'px'; e.style.top = (b.y - 150 * p.sc - 40) + 'px';
        later(() => e.remove(), ms || 2200);
      }
      const squish = p => p.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.9)' }, { transform: 'scale(.94,1.07)' }, { transform: 'scale(1)' }], { duration: 480 });
      const wobble = p => p.body.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' }], { duration: 520 });
      const pulseTool = id => { const b = tray.querySelector('[data-t="' + id + '"]'); if (b) { b.classList.remove('hint'); void b.offsetWidth; b.classList.add('hint'); } };

      // ---- tool actions ----
      function apply(id, p, x, y) {
        if (p.busy && id !== 'sponge') { /* still let little reactions happen */ }
        const b = body(p);
        if (x == null) { x = b.x; y = b.y; }
        const meow = () => api.sfx(p.kind === 'cat' ? 'meow' : 'squeak');
        switch (id) {
          case 'steth': {
            squish(p); let n = 0;
            const h = mk('heartbeat', '❤️', p.body); h.style.left = '112px'; h.style.top = '92px';
            const beat = () => { if (n >= 4) { h.remove(); return; } n++; api.sfx('heart'); h.classList.remove('b'); void h.offsetWidth; h.classList.add('b'); later(beat, 780); };
            beat(); later(() => h.remove(), 4 * 780 + 200);
            break;
          }
          case 'thermo': {
            wobble(p); api.sfx('tap');
            const sick = p.worry === 'sick';
            pill(p, '🌡️ <b>' + (sick ? 39 : 37) + '°</b> ' + (sick ? '🥵' : '😊'), 2600);
            if (sick && p.stage === 0) { later(() => { p.stage = 1; showWorry(p); api.sfx('pop'); pulseTool('med'); }, 800); }
            break;
          }
          case 'med': {
            squish(p); api.sfx('bubble');
            puff(p, '✨', 2);
            if (p.worry === 'sick') { if (p.stage === 1) later(() => cure(p), 600); else { pulseTool('thermo'); pill(p, '🌡️ ?', 1800); } }
            else pill(p, '👅 Blah!', 1500);
            break;
          }
          case 'plaster': {
            const r = p.cv.getBoundingClientRect(), sr = stage.getBoundingClientRect(), k = 1280 / sr.width;
            const rw = r.width * k, rl = (r.left - sr.left) * k, rt = (r.top - sr.top) * k;
            let lx = (x - rl) / rw * CW, ly = (y - rt) / rw * CW;
            lx = Math.max(60, Math.min(180, lx)); ly = Math.max(40, Math.min(170, ly));
            const pl = mk('plaster', '🩹', p.body); pl.style.left = lx + 'px'; pl.style.top = ly + 'px'; pl.style.setProperty('--r', rnd(-40, 40) + 'deg');
            api.sfx('pop'); wobble(p); puff(p, '💖', 1);
            if (p.worry === 'paw') later(() => cure(p), 600);
            break;
          }
          case 'sponge': {
            rub(p, 160, x, y); break;
          }
          case 'food': {
            api.sfx('pop');
            const f = mk('food', '🥕', root); f.style.left = (b.x + 120) + 'px'; f.style.top = (b.y - 100) + 'px';
            requestAnimationFrame(() => { f.style.left = b.x + 'px'; f.style.top = (b.y - 20) + 'px'; });
            later(() => f.remove(), 600);
            later(() => {
              let n = 0; const m = () => {
                if (n++ >= 5) { if (p.worry === 'hungry') cure(p); return; }
                api.sfx('pop'); p.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.13,.88)' }, { transform: 'scale(1)' }], { duration: 230 });
                api.spark(b.x + rnd(-20, 20), b.y - 25, '🥕'); later(m, 260);
              }; m();
            }, 450);
            break;
          }
          case 'cuddle': {
            meow(); puff(p, '💖', 4); p.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12,.92) rotate(-3deg)' }, { transform: 'scale(1)' }], { duration: 700 });
            if (p.worry === 'sleepy' && !p.asleep) {
              p.asleep = true; p.body.classList.add('asleep'); api.sfx('snore');
              const z = mk('zzz', '💤', root); z.style.left = (b.x + 60) + 'px'; z.style.top = (b.y - 120 * p.sc) + 'px';
              later(() => { z.remove(); p.asleep = false; p.body.classList.remove('asleep'); cure(p); }, 3000);
            }
            break;
          }
        }
      }
      function rub(p, amt, x, y) {
        p.rub += amt;
        const n = Math.floor(amt / 40) + 1; const b = body(p);
        for (let i = 0; i < n; i++) {
          const s = mk('suds', '🫧', root); s.style.left = ((x == null ? b.x : x) + rnd(-40, 40)) + 'px'; s.style.top = ((y == null ? b.y : y) + rnd(-30, 30)) + 'px'; s.style.fontSize = rnd(26, 52) + 'px';
          later(() => s.remove(), 1100);
        }
        if (Math.random() < .5) api.sfx('bubble');
        if (p.spots.length) { const f = Math.max(0, 1 - p.rub / 380); p.spots.forEach(s => s.style.opacity = f); }
        if (p.rub > 380 && p.worry === 'mucky') { p.rub = -9999; later(() => cure(p), 350); }
      }

      function tapPatient(p, x, y) {
        if (tool) {
          const run = () => apply(tool, p, null, null);
          if (onTable === p) apply(tool, p, x, y); else toTable(p, run);
          return;
        }
        if (onTable === p) { goHome(p); api.sfx('tap'); } else { api.sfx('tap'); toTable(p); }
      }

      // ---- tool tray ----
      const cells = mk('cells', null, tray);
      let ghost = null, hot = null;
      const rectS = el => { const r = el.getBoundingClientRect(), sr = stage.getBoundingClientRect(), k = 1280 / sr.width; return { l: (r.left - sr.left) * k, t: (r.top - sr.top) * k, r: (r.right - sr.left) * k, b: (r.bottom - sr.top) * k }; };
      const hit = (x, y) => {
        let best = null;
        for (const p of pats) { const r = rectS(p.cv); const w = r.r - r.l; if (x > r.l + w * .12 && x < r.r - w * .12 && y > r.t + w * .1 && y < r.b) { if (!best || p.el.style.zIndex > best.el.style.zIndex) best = p; } }
        return best;
      };
      const setTool = id => {
        tool = tool === id ? null : id;
        cells.querySelectorAll('.tool').forEach(b => b.classList.toggle('sel', b.dataset.t === tool));
        root.classList.toggle('armed', !!tool);
      };
      TOOLS.forEach(t => {
        const b = mk('tool', '<span class="em">' + t.ch + '</span><span class="nm">' + t.nm + '</span>', cells);
        b.dataset.t = t.id;
        let lastX = 0, lastY = 0;
        api.drag(b, {
          onStart(x, y) { api.sfx('tap'); lastX = x; lastY = y; },
          onMove(x, y) {
            if (!ghost) { ghost = mk('ghost', t.ch, root); }
            ghost.style.left = x + 'px'; ghost.style.top = y + 'px';
            const p = hit(x, y); if (hot !== p) { if (hot) hot.el.classList.remove('hot'); hot = p; if (p) p.el.classList.add('hot'); }
            if (t.id === 'sponge' && p) { const d = Math.hypot(x - lastX, y - lastY); if (d > 24) { rub(p, d * 1.4, x, y); lastX = x; lastY = y; } }
            else { lastX = x; lastY = y; }
          },
          onEnd(x, y, moved) {
            if (ghost) { ghost.remove(); ghost = null; }
            if (hot) { hot.el.classList.remove('hot'); hot = null; }
            if (!moved) { setTool(t.id); return; }
            const p = hit(x, y);
            if (!p) { api.sfx('tap'); return; }
            if (t.id === 'sponge' && onTable === p) { return; }   // rubbing already handled while dragging
            if (onTable === p) apply(t.id, p, x, y); else toTable(p, () => apply(t.id, p, null, null));
          },
        });
      });

      // ---- animation loop ----
      function frame(now) {
        if (dead) return;
        raf = requestAnimationFrame(frame);
        const dt = Math.min(.1, (now - last) / 1000); last = now; tAcc += dt;
        if (tAcc < 1 / 30) return; const d = tAcc; tAcc = 0;
        for (const p of pats) {
          p.t += d * (p.asleep ? .35 : 1);
          const c = p.ctx; c.clearRect(0, 0, CW, CH);
          c.save(); c.translate(0, 0);
          try { G.drawCreature(c, p.kind, FX, FY, 4.2, { t: p.t, face: 1 }); } catch (e) { }
          c.restore();
        }
      }
      raf = requestAnimationFrame(frame);

      later(() => api.say('Hello, vet!'), 500);

      return {
        destroy() {
          dead = true; cancelAnimationFrame(raf);
          timers.forEach(clearTimeout); timers.clear();
          if (ghost) ghost.remove();
        },
      };
    },
  });
})();

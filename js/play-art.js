/* Hazelnut Hollow — Art Studio playroom (SPEC §8.2 `art`). A stylus easel: brushes, stamps, mirror, gallery. */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const W = 960, H = 540;
  const COLS = ['#2b2118', '#e23b4e', '#ff8a3c', '#ffd23c', '#58c263', '#2fb8a8', '#3d8bff', '#7a4de0', '#ff7eb6', '#8d5a3b', '#9aa3b5', '#ffffff'];
  const STAMPS = ['⭐', '💖', '🌸', '🦋', '🐱', '🐶', '🦄', '🌈', '🍄', '🐞', '👑', '🌙'];
  const PAPERS = ['#ffffff', '#fff3d6', '#243056'];
  const SIZES = [6, 14, 30];

  function mount(stage, api) {
    const st = api.state; st.gallery = st.gallery || [];
    let tool = 'brush', col = COLS[1], size = 1, stamp = STAMPS[0], mirror = false, paper = st.paper || 0, hue = 0, penSeen = false;
    const undo = [];
    stage.innerHTML = '';
    const easel = U.el('div', 'easel'); stage.appendChild(easel);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.className = 'paper'; easel.appendChild(cv);
    const c = cv.getContext('2d'); c.lineCap = c.lineJoin = 'round';
    const mline = U.el('div', 'mline'); easel.appendChild(mline);
    const setPaper = () => { cv.style.background = PAPERS[paper]; };
    setPaper();

    /* ---- drawing ---- */
    const pt = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height, p: e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 0.5 }; };
    const snap = () => { try { undo.push(c.getImageData(0, 0, W, H)); if (undo.length > 10) undo.shift(); } catch (e) { } };
    const seg = (a, b, x) => {   // one stroke segment; x = mirrored copy
      const ax = x ? W - a.x : a.x, bx = x ? W - b.x : b.x, w = SIZES[size] * (0.55 + b.p * 0.9);
      if (tool === 'eraser') { c.globalCompositeOperation = 'destination-out'; c.strokeStyle = '#000'; c.lineWidth = w * 2.2; }
      else { c.globalCompositeOperation = 'source-over'; c.strokeStyle = tool === 'rainbow' ? 'hsl(' + hue + ',90%,58%)' : col; c.lineWidth = w; }
      if (tool === 'glitter') {
        const n = 2 + size * 2;
        for (let i = 0; i < n; i++) { const r = SIZES[size] * 1.6, gx = bx + (Math.random() - 0.5) * r * 2, gy = b.y + (Math.random() - 0.5) * r * 2, s = 1.5 + Math.random() * (2 + size * 1.5); c.fillStyle = Math.random() < 0.3 ? '#fff' : Math.random() < 0.4 ? '#ffe9a8' : col; c.beginPath(); for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4, rr = k % 2 ? s * 0.4 : s; c.lineTo(gx + Math.cos(an) * rr, gy + Math.sin(an) * rr); } c.fill(); }
      } else { c.beginPath(); c.moveTo(ax, a.y); c.lineTo(bx, b.y); c.stroke(); }
      c.globalCompositeOperation = 'source-over';
    };
    const stampAt = (p, x) => { c.fillStyle = '#000'; G.emoji(c, stamp, x ? W - p.x : p.x, p.y, [44, 78, 124][size]); };
    let last = null, lastStamp = null, active = null;
    const move = (e, first) => {
      const evs = !first && e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of (evs.length ? evs : [e])) {
        const p = pt(ev);
        if (tool === 'stamp') { if (!lastStamp || Math.hypot(p.x - lastStamp.x, p.y - lastStamp.y) > [50, 84, 130][size]) { stampAt(p); if (mirror) stampAt(p, true); lastStamp = p; if (first) G.sfx('pop'); } }
        else { const a = last || p; hue = (hue + Math.hypot(p.x - a.x, p.y - a.y) * 0.6) % 360; seg(a, p); if (mirror) seg(a, p, true); }
        last = p;
      }
    };
    cv.addEventListener('pointerdown', e => {
      if (e.pointerType === 'pen') penSeen = true;
      if ((e.pointerType === 'touch' && penSeen) || active !== null) return;   // palm rejection; one pointer at a time
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) { }
      active = e.pointerId; snap(); last = null; lastStamp = null; move(e, true);
    });
    cv.addEventListener('pointermove', e => { if (e.pointerId === active) move(e); });
    const up = e => { if (e.pointerId === active) { active = null; last = null; } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

    /* ---- tools (left) ---- */
    const left = U.el('div', 'tools'); stage.appendChild(left);
    const tbtn = {}, TOOLS = [['brush', '🖌️', 'Brush'], ['rainbow', '🌈', 'Rainbow brush'], ['glitter', '✨', 'Glitter'], ['eraser', '🧽', 'Rubber']];
    const pick = (t, quiet) => { tool = t; for (const k in tbtn) tbtn[k].classList.toggle('on', k === t); stage.querySelectorAll('.stamp').forEach(b => b.classList.toggle('on', t === 'stamp' && b.textContent === stamp)); stage.querySelectorAll('.sw').forEach(b => b.classList.toggle('on', (t === 'brush' || t === 'glitter') && b.dataset.c === col)); if (!quiet) G.sfx('tap'); };
    for (const [id, ic, nm] of TOOLS) { const b = U.el('button', 'tb', ic); b.onclick = () => { pick(id); api.say(nm); }; tbtn[id] = b; left.appendChild(b); }
    const szb = SIZES.map((s, i) => { const b = U.el('button', 'sz', '<i style="width:' + (10 + i * 14) + 'px;height:' + (10 + i * 14) + 'px"></i>'); b.onclick = () => { size = i; szb.forEach((x, k) => x.classList.toggle('on', k === i)); G.sfx('tap'); }; left.appendChild(b); return b; });
    szb[size].classList.add('on');

    /* ---- colours + stamps (bottom) ---- */
    const bottom = U.el('div', 'tray'); stage.appendChild(bottom);
    const r1 = U.el('div', 'row'), r2 = U.el('div', 'row'); bottom.appendChild(r1); bottom.appendChild(r2);
    for (const k of COLS) { const b = U.el('button', 'sw'); b.dataset.c = k; b.style.background = k; b.onclick = () => { col = k; pick(tool === 'glitter' ? 'glitter' : 'brush'); }; r1.appendChild(b); }
    for (const s of STAMPS) { const b = U.el('button', 'stamp', s); b.onclick = () => { stamp = s; pick('stamp'); }; r2.appendChild(b); }

    /* ---- actions + gallery (right) ---- */
    const right = U.el('div', 'side'); stage.appendChild(right);
    const act = (ic, nm, fn, cls) => { const b = U.el('button', 'ab ' + (cls || ''), ic); b.onclick = () => { G.sfx('tap'); fn(b); }; b.title = nm; right.appendChild(b); return b; };
    act('↩️', 'Undo', () => { const d = undo.pop(); if (d) c.putImageData(d, 0, 0); else api.say('Nothing to undo.'); });
    act('🗑️', 'Clear', () => { snap(); c.clearRect(0, 0, W, H); G.sfx('whoosh'); });
    act('🪞', 'Mirror', b => { mirror = !mirror; b.classList.toggle('on', mirror); mline.classList.toggle('show', mirror); api.say(mirror ? 'Mirror on!' : 'Mirror off.'); });
    act('📄', 'Paper', () => { paper = (paper + 1) % PAPERS.length; st.paper = paper; setPaper(); api.save(); });
    const gal = U.el('div', 'gal');
    const flat = (w, h) => { const o = document.createElement('canvas'); o.width = w; o.height = h; const x = o.getContext('2d'); x.fillStyle = PAPERS[paper]; x.fillRect(0, 0, w, h); x.drawImage(cv, 0, 0, w, h); return o; };
    const drawGal = () => {
      gal.innerHTML = '';
      for (let i = 0; i < 6; i++) {
        const src = st.gallery[i], b = U.el('button', 'th' + (src ? '' : ' empty'), src ? '' : '＋');
        if (src) { b.style.backgroundImage = 'url(' + src + ')'; b.onclick = () => { const im = new Image(); im.onload = () => { snap(); c.clearRect(0, 0, W, H); c.drawImage(im, 0, 0, W, H); G.sfx('magic'); }; im.src = src; }; }
        else b.onclick = save;
        gal.appendChild(b);
      }
    };
    function save() {
      let url; try { url = flat(640, 360).toDataURL('image/jpeg', 0.8); } catch (e) { return; }
      st.gallery.unshift(url); if (st.gallery.length > 6) st.gallery.length = 6;
      try { api.save(); localStorage.setItem('hh-probe', '1'); localStorage.removeItem('hh-probe'); } catch (e) { st.gallery.pop(); }
      drawGal(); G.sfx('fanfare'); api.spark(1185, 420); api.say(U.pick(['Saved! What a lovely picture.', 'Saved in your gallery!', 'Beautiful! I saved it.']));
    }
    act('💾 Save', 'Save', save, 'wide');
    right.appendChild(gal); drawGal();
    pick('brush', true);
    setTimeout(() => api.say('Paint anything you like!'), 300);
    return { destroy() { undo.length = 0; } };
  }

  G.SB.register('art', { name: 'Art Studio', icon: '🎨', col: '#9ed8ff', blurb: 'Paint and stamp', mount });
})();

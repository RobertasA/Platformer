/* Hazelnut Hollow — UI: HUD, toasts, dialogue, gates, character creator / wardrobe, settings (SPEC §9, §10). */
(function () {
  'use strict';
  const G = window.G, U = G.U, $ = U.$;
  const UI = G.UI = {};
  G.AREA_NAMES = { house: 'Hush House', cafe: 'The Twiggy Spoon Café', meadow: 'Bugglemead', writing: 'Writing Wood', tower: 'Teapot Tower', woods: 'Whispering Woods', caves: 'Crystal Caves', clouds: 'Cloudtop Kingdom' };

  /* ---------- overlay / HUD ---------- */
  UI.overlay = on => { const o = $('#overlay'); o.innerHTML = ''; o.classList.toggle('hidden', !on); return o; };
  UI.hud = on => { $('#hud').classList.toggle('hidden', !on); $('#touch').classList.toggle('hidden', !on); };
  UI.gembar = function (bump) {
    const S = G.S, bar = $('#gembar');
    bar.innerHTML = G.GEMS.map(c => '<div class="g' + (c === bump ? ' bump' : '') + '" data-c="' + c + '">' + G.gemSVG(c, 30) + '<span>' + S.gems[c] + '</span></div>').join('')
      + '<div class="g coins">🪙<span>' + S.coins + '</span></div>';
  };
  let toastT = 0, bannerT = 0;
  UI.toast = (msg, speak) => { const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden'); t.style.animation = 'none'; void t.offsetWidth; t.style.animation = ''; clearTimeout(toastT); toastT = setTimeout(() => t.classList.add('hidden'), 2600); if (speak) G.say(msg.replace(/[^\w\s'!?.,£-]/g, ''), true); };
  UI.banner = msg => { const b = $('#banner'); b.textContent = msg; b.classList.remove('hidden'); clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.add('hidden'), 2200); };
  UI.soon = what => { G.sfx('squeak'); UI.toast(what + ' is still being built! 🔨', true); };
  UI.fade = fn => {
    const f = U.el('div', ''); f.style.cssText = 'position:absolute;inset:0;background:#fff8ec;opacity:0;transition:opacity .35s;pointer-events:none;z-index:5';
    $('#stage').appendChild(f); requestAnimationFrame(() => f.style.opacity = '1');
    setTimeout(() => { fn(); f.style.opacity = '0'; setTimeout(() => f.remove(), 400); }, 380);
  };
  UI.flyGem = function (col, sx, sy) {
    const g = U.el('div', '', G.gemSVG(col, 48)); g.style.cssText = 'position:absolute;left:' + (sx - 24) + 'px;top:' + (sy - 24) + 'px;transition:all .8s cubic-bezier(.5,-0.3,.7,1);z-index:4;pointer-events:none';
    $('#stage').appendChild(g);
    const slot = $('#gembar [data-c="' + col + '"]'); const r = slot ? { x: slot.offsetLeft + 14 + $('#hud-left').offsetLeft, y: 18 + $('#hud-left').offsetTop } : { x: 40, y: 30 };
    requestAnimationFrame(() => requestAnimationFrame(() => { g.style.left = r.x + 'px'; g.style.top = r.y + 'px'; g.style.transform = 'scale(.6) rotate(360deg)'; }));
    setTimeout(() => { g.remove(); UI.gembar(col); G.sfx('coin'); UI.toast('You got a ' + G.GEM_INFO[col].name + ' gem!', true); }, 820);
  };

  /* ---------- dialogue: UI.talk(person, ['line', ...]) → Promise ---------- */
  UI.talk = function (who, lines) {
    return new Promise(res => {
      G.paused = true;
      const d = $('#dialogue'), name = $('#dlg-name'), text = $('#dlg-text'), next = $('#dlg-next');
      d.classList.remove('hidden'); name.textContent = who.name; G.portrait($('#dlg-face'), who.look, 1);
      let i = 0;
      const show = () => { text.textContent = lines[i]; G.say(lines[i], true); G.sfx('talk'); };
      const adv = e => { if (e) e.stopPropagation(); i++; if (i >= lines.length) { d.classList.add('hidden'); d.onclick = next.onclick = null; G.hush(); G.paused = false; G.saveGame(); res(); } else show(); };
      next.onclick = adv; d.onclick = adv; show();
    });
  };

  /* ---------- gate card: shows the recipe, spends gems, opens forever ---------- */
  UI.gate = function (e) {
    const S = G.S, open = S.locks[e.id];
    if (open) { G.E.travel(e.to); return; }
    G.paused = true; G.sfx('creak');
    const ov = UI.overlay(true), card = U.el('div', 'card'); card.style.cssText = 'width:760px;text-align:center;display:flex;flex-direction:column;gap:18px;align-items:center';
    const enough = Object.entries(e.needs).every(([c, n]) => S.gems[c] >= n);
    card.innerHTML = '<div style="font-size:64px">' + e.icon + '</div><div style="font-size:40px;font-weight:700">' + e.label + '</div>'
      + '<div class="recipe">' + Object.entries(e.needs).map(([c, n]) => '<div class="need' + (S.gems[c] >= n ? ' ok' : '') + '">' + G.gemSVG(c, 56) + '<span>' + Math.min(S.gems[c], n) + ' / ' + n + '</span></div>').join('') + '</div>';
    const needText = Object.entries(e.needs).map(([c, n]) => n + ' ' + G.GEM_INFO[c].name.toLowerCase() + (n > 1 ? 's' : '')).join(' and ').replace(/rubys/, 'rubies');
    const msg = enough ? 'You have the gems! Open the gate?' : 'This gate needs ' + needText + '. Find gems by solving puzzles!';
    card.appendChild(U.el('div', '', '<div style="font-size:28px">' + msg + '</div>'));
    const row = U.el('div', ''); row.style.cssText = 'display:flex;gap:20px';
    if (enough) {
      const b = U.el('button', 'bigbtn green', 'Open! ✨'); row.appendChild(b);
      b.onclick = () => {
        for (const [c, n] of Object.entries(e.needs)) S.gems[c] -= n;
        S.locks[e.id] = true; S.areas[e.to] = true; G.saveGame(); UI.gembar(); G.sfx('unlock'); G.sfx('magic');
        UI.overlay(false); G.paused = false; G.E.burst(e.px, e.py - 80, '#fff6c9', 40);
        UI.toast('The gate is open!', true);
        setTimeout(() => G.E.travel(e.to), 1400);
      };
    }
    const c = U.el('button', 'bigbtn alt', enough ? 'Not yet' : 'OK'); c.onclick = () => { G.sfx('tap'); G.hush(); UI.overlay(false); G.paused = false; }; row.appendChild(c);
    card.appendChild(row); ov.appendChild(card); G.say(e.label + '. ' + msg, true);
  };

  /* ---------- character creator / wardrobe ---------- */
  const TABS = [
    { id: 'jobs', i: '⭐', n: 'Jobs' }, { id: 'skin', i: '✋', n: 'Skin' }, { id: 'hair', i: '💇', n: 'Hair' }, { id: 'hairCol', i: '🎨', n: 'Hair colour', opt: 'hairCol' },
    { id: 'body', i: '👗', n: 'Clothes' }, { id: 'col1', i: '🔴', n: 'Colour', opt: 'col' }, { id: 'col2', i: '🔵', n: 'Second colour', opt: 'col' },
    { id: 'motif', i: '💖', n: 'Picture' }, { id: 'hat', i: '🎩', n: 'Hats' }, { id: 'back', i: '🦋', n: 'Wings and capes' }, { id: 'held', i: '🪄', n: 'Hold' },
    { id: 'face', i: '👓', n: 'Face' }, { id: 'pet', i: '🐱', n: 'Pet' }, { id: 'shoes', i: '👟', n: 'Shoes', opt: 'col' },
  ];
  const COLOUR_TABS = { skin: 1, hairCol: 1, col1: 1, col2: 1, shoes: 1 };

  UI.creator = function (first) {
    return new Promise(done => {
      G.paused = true; G.music.play('play');
      const S = G.S, av = Object.assign(G.defaultAvatar(), S.avatar);
      const ov = UI.overlay(true), card = U.el('div', 'card creator');
      const left = U.el('div', 'left'), right = U.el('div', 'right');
      const pv = U.el('canvas', 'preview'); pv.width = 640; pv.height = 800; left.appendChild(pv);
      const nm = U.el('input', 'name'); nm.placeholder = 'Your name'; nm.maxLength = 14; nm.value = S.name || ''; left.appendChild(nm);
      const btns = U.el('div', ''); btns.style.cssText = 'display:flex;gap:12px';
      const dice = U.el('button', 'iconbtn', '🎲'); dice.style.cssText += ';width:72px;height:72px;font-size:36px';
      const ok = U.el('button', 'bigbtn green', first ? 'Let’s go! ▶' : 'Done ✓');
      btns.appendChild(dice); btns.appendChild(ok); left.appendChild(btns);
      const tabs = U.el('div', 'tabs'), sw = U.el('div', 'swatches');
      right.appendChild(tabs); right.appendChild(sw);
      card.appendChild(left); card.appendChild(right); ov.appendChild(card);
      let tab = 'jobs', wave = 0, raf = 0, t0 = performance.now();

      const draw = now => {
        const c = pv.getContext('2d'), t = (now - t0) / 1000; c.clearRect(0, 0, 640, 800);
        G.ell(c, 320, 740, 150, 22, 'rgba(0,0,0,.1)');
        if (av.pet && av.pet !== 'none') G.drawCreature(c, av.pet, 500, 740, 2.6, { t, face: -1 });
        G.drawAvatar(c, av, 290, 740, 6.2, { t, wave: wave > now, noShadow: true });
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
      pv.onpointerdown = () => { wave = performance.now() + 1200; G.sfx('magic'); G.say(U.pick(['Hello!', 'Looking good!', 'Wow!', 'Ta-da!']), true); };

      const chipAv = (k, v) => { const a = Object.assign({}, av); a[k] = v; return a; };
      const chipCanvas = (a, zoomHead) => {
        const cv = U.el('canvas'); cv.width = 160; cv.height = 160; const c = cv.getContext('2d');
        if (zoomHead) G.drawAvatar(c, a, 80, 250, 2.6, { t: 1, noShadow: true }); else G.drawAvatar(c, a, 80, 152, 1.45, { t: 1, noShadow: true });
        return cv;
      };
      const renderTab = () => {
        tabs.innerHTML = ''; sw.innerHTML = '';
        for (const tb of TABS) { const b = U.el('button', 'tab' + (tb.id === tab ? ' on' : ''), tb.i); b.title = tb.n; b.onclick = () => { tab = tb.id; G.sfx('tap'); G.say(tb.n, true); renderTab(); }; tabs.appendChild(b); }
        if (tab === 'jobs') {
          for (const pr of G.PRESETS) {
            const ch = U.el('button', 'chip', '<div class="em">' + pr.i + '</div><div>' + pr.n + '</div>');
            ch.onclick = () => { Object.assign(av, { back: 'none', held: 'none', face: 'none', hat: 'none' }, pr.a); for (const k of ['hat', 'back', 'held', 'pet']) if (!G.isOwned(k + ':' + av[k])) av[k] = 'none'; G.sfx('magic'); G.say('A ' + pr.n + '!', true); wave = performance.now() + 1200; };
            sw.appendChild(ch);
          }
          return;
        }
        const k = tab, list = G.OPTS[TABS.find(x => x.id === tab).opt || tab];
        for (const v of list) {
          const key = k + ':' + v, owned = G.isOwned(key);
          const ch = U.el('button', 'chip' + (COLOUR_TABS[k] ? ' col' : '') + (av[k] === v ? ' on' : '') + (owned ? '' : ' locked'));
          if (COLOUR_TABS[k]) ch.style.background = v;
          else if (k === 'pet') { if (v === 'none') ch.innerHTML = '<div class="em">🚫</div>'; else { const cv = U.el('canvas'); cv.width = 160; cv.height = 160; G.drawCreature(cv.getContext('2d'), v, 80, 140, 2.6, { t: 1 }); ch.appendChild(cv); } }
          else if (v === 'none') ch.innerHTML = '<div class="em">🚫</div>';
          else ch.appendChild(chipCanvas(chipAv(k, v), k === 'hat' || k === 'hair' || k === 'face'));
          ch.onclick = () => {
            if (!owned) { G.sfx('squeak'); UI.toast(G.LOCKED[key] === 'shop' ? 'Find this in the toy shop!' : 'Help a friend to win this!', true); return; }
            av[k] = v; G.sfx('pop'); sw.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); ch.classList.add('on');
            if (k !== 'skin' && k !== 'hairCol' && !COLOUR_TABS[k]) renderTabSoon();
          };
          sw.appendChild(ch);
        }
      };
      let rt = 0; const renderTabSoon = () => { clearTimeout(rt); rt = setTimeout(renderTab, 50); };
      dice.onclick = () => {
        const O = G.OPTS, pickOwned = k => U.pick(O[k].filter(v => G.isOwned(k + ':' + v)));
        Object.assign(av, { skin: U.pick(O.skin.slice(0, 6)), hair: pickOwned('hair'), hairCol: U.pick(O.hairCol), body: pickOwned('body'), col1: U.pick(O.col), col2: U.pick(O.col), motif: pickOwned('motif'), hat: pickOwned('hat'), back: Math.random() < 0.5 ? 'none' : pickOwned('back'), held: pickOwned('held'), face: Math.random() < 0.6 ? 'none' : pickOwned('face'), pet: pickOwned('pet') });
        G.sfx('magic'); wave = performance.now() + 1200; renderTab();
      };
      ok.onclick = () => {
        cancelAnimationFrame(raf); S.avatar = av; S.name = nm.value.trim(); S.created = true; G.saveGame();
        G.sfx('fanfare'); UI.overlay(false); G.paused = false; G.hush();
        if (G.E.area) G.music.play(G.E.area.music || G.E.area.theme);
        done();
      };
      nm.onkeydown = e => e.stopPropagation();
      renderTab();
      G.say(first ? 'Make your character! Pick a job, or change anything you like.' : 'Dressing-up time!', true);
    });
  };

  /* ---------- settings (grown-up actions need a 2-second hold) ---------- */
  UI.settings = function () {
    G.paused = true;
    const S = G.S, ov = UI.overlay(true), card = U.el('div', 'card settings');
    card.innerHTML = '<div style="font-size:40px;font-weight:700;text-align:center">⚙️ Settings</div>';
    const tog = (label, get, set) => {
      const l = U.el('label', '', '<span>' + label + '</span>'); const b = U.el('button', 'toggle');
      const r = () => { b.classList.toggle('on', !!get()); b.textContent = get() ? 'On' : 'Off'; };
      b.onclick = () => { set(!get()); r(); G.sfx('tap'); G.saveGame(); }; r(); l.appendChild(b); card.appendChild(l);
    };
    tog('🎵 Music', () => S.settings.music, v => { S.settings.music = v; if (v) G.music.play(G.E.area ? G.E.area.music : 'village'); else G.music.stop(); });
    tog('🔔 Sounds', () => S.settings.sfx, v => S.settings.sfx = v);
    tog('🗣️ Read aloud', () => S.settings.speech, v => S.settings.speech = v);
    tog('✍️ Left-handed', () => S.settings.leftHanded, v => S.settings.leftHanded = v);
    tog('🌈 Extra-kind writing checks', () => (S.settings.writeTol || 1) > 1, v => S.settings.writeTol = v ? 1.4 : 1);
    const yl = U.el('label', '', '<span>📚 School year</span>'); const yb = U.el('button', 'toggle on');
    const yr = () => yb.textContent = S.settings.year === 'auto' ? 'Auto' : 'Year ' + S.settings.year;
    yb.onclick = () => { S.settings.year = S.settings.year === 'auto' ? 1 : S.settings.year === 1 ? 2 : 'auto'; yr(); G.saveGame(); }; yr(); yl.appendChild(yb); card.appendChild(yl);
    const lv = U.el('div', '', '<div style="font-size:20px;color:#7a7390">Levels: ' + G.GEMS.map(c => G.GEM_INFO[c].label + ' ' + (S.level[G.GEM_INFO[c].subj] + 1)).join(' · ') + ' · Puzzles solved: ' + S.stats.solved + (window.BUILD ? '<br>Build ' + window.BUILD : '') + '</div>');
    card.appendChild(lv);
    const row = U.el('div', ''); row.style.cssText = 'display:flex;gap:16px;justify-content:center';
    const reset = U.el('button', 'bigbtn', 'Hold to restart'); reset.style.fontSize = '22px';
    let ht = 0; const cancel = () => { clearTimeout(ht); reset.style.opacity = 1; };
    reset.onpointerdown = () => { reset.style.opacity = 0.6; ht = setTimeout(() => { G.resetGame(); location.reload(); }, 2000); };
    reset.onpointerup = reset.onpointerleave = cancel;
    const close = U.el('button', 'bigbtn green', 'Done ✓'); close.onclick = () => { G.sfx('tap'); UI.overlay(false); G.paused = false; };
    row.appendChild(reset); row.appendChild(close); card.appendChild(row); ov.appendChild(card);
  };

  UI.bindHud = function () {
    document.querySelectorAll('.hbtn').forEach(b => b.addEventListener('click', () => {
      if (G.paused) return; G.audioUnlock(); G.sfx('tap');
      const a = b.dataset.act;
      if (a === 'wardrobe') UI.creator(false);
      else if (a === 'settings') UI.settings();
      else if (a === 'map') UI.soon('The map');
      else if (a === 'play') UI.soon('The playroom');
      else if (a === 'journal') UI.soon('The journal');
    }));
  };
})();

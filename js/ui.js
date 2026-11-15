/* Hazelnut Hollow — UI: HUD, toasts, dialogue, gates, character creator / wardrobe, settings (SPEC §9, §10). */
(function () {
  'use strict';
  const G = window.G, U = G.U, $ = U.$;
  const UI = G.UI = {};
  G.AREA_NAMES = { house: 'Hush House', cafe: 'The Twiggy Spoon Café', meadow: 'Bugglemead', writing: 'Writing Wood', tower: 'Teapot Tower', woods: 'Whispering Woods', caves: 'Crystal Caves', clouds: 'Cloudtop Kingdom' };

  /* ---------- overlay / HUD ---------- */
  UI.overlay = on => { const o = $('#overlay'); o.innerHTML = ''; o.classList.toggle('hidden', !on); if (G.duck) G.duck(!!on); return o; };
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
    { id: 'face', i: '👓', n: 'Face' }, { id: 'pet', i: '🐱', n: 'Pet' }, { id: 'shoes', i: '👟', n: 'Shoes', opt: 'col' }, { id: 'saved', i: '🧺', n: 'My outfits' },
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
      const undo = U.el('button', 'iconbtn', '↩️'); undo.style.cssText += ';width:72px;height:72px;font-size:34px'; undo.title = 'Undo';
      const ok = U.el('button', 'bigbtn green', first ? 'Let’s go! ▶' : 'Done ✓');
      btns.appendChild(undo); btns.appendChild(dice); btns.appendChild(ok); left.appendChild(btns);
      const tabs = U.el('div', 'tabs'), tname = U.el('div', 'tabname'), sw = U.el('div', 'swatches');
      right.appendChild(tabs); right.appendChild(tname); right.appendChild(sw);
      const hist = [], snap = () => { hist.push(JSON.stringify(av)); if (hist.length > 30) hist.shift(); };
      undo.onclick = () => { if (!hist.length) { G.sfx('squeak'); return; } Object.assign(av, JSON.parse(hist.pop())); G.sfx('tap'); renderTab(); };
      if (!Array.isArray(S.outfits)) S.outfits = [];
      const tabFresh = id => Object.keys(S.fresh || {}).some(key => key.split(':')[0] === id);
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
        tname.textContent = TABS.find(x => x.id === tab).n;
        for (const tb of TABS) { const b = U.el('button', 'tab' + (tb.id === tab ? ' on' : '') + (tabFresh(tb.id) && tb.id !== tab ? ' fresh' : ''), tb.i); b.title = tb.n; b.onclick = () => { tab = tb.id; G.sfx('tap'); G.say(tb.n, true); renderTab(); }; tabs.appendChild(b); }
        if (tab === 'jobs') {
          for (const pr of G.PRESETS) {
            const ch = U.el('button', 'chip', '<div class="em">' + pr.i + '</div><div>' + pr.n + '</div>');
            ch.onclick = () => { snap(); Object.assign(av, { back: 'none', held: 'none', face: 'none', hat: 'none' }, pr.a); for (const k of ['hat', 'back', 'held', 'pet']) if (!G.isOwned(k + ':' + av[k])) av[k] = 'none'; G.sfx('magic'); G.say('A ' + pr.n + '!', true); wave = performance.now() + 1200; };
            sw.appendChild(ch);
          }
          return;
        }
        if (tab === 'saved') {
          for (let i = 0; i < 3; i++) {
            const o = S.outfits[i], slot = U.el('div', 'hanger');
            const tile = U.el('button', 'chip big' + (o ? '' : ' empty'));
            if (o) { const cv = U.el('canvas'); cv.width = 200; cv.height = 240; const c = cv.getContext('2d'); if (o.pet && o.pet !== 'none') G.drawCreature(c, o.pet, 160, 230, 1.1, { t: 1, face: -1 }); G.drawAvatar(c, o, 90, 230, 2.1, { t: 1, noShadow: true }); tile.appendChild(cv); }
            else tile.innerHTML = '<div class="em">🧺</div><div>Empty</div>';
            tile.onclick = () => { if (!o) { keep(); return; } snap(); Object.assign(av, o); for (const k of ['hat', 'back', 'held', 'pet']) if (!G.isOwned(k + ':' + av[k])) av[k] = 'none'; G.sfx('magic'); G.say('Ta-da!', true); wave = performance.now() + 1200; };
            const keep = () => { S.outfits[i] = Object.assign({}, av); G.saveGame(); G.sfx('coin'); UI.toast('Outfit kept! 🧺', true); renderTab(); };
            const kb = U.el('button', 'bigbtn small', o ? 'Keep this 💾' : 'Keep this 💾'); kb.onclick = keep;
            slot.appendChild(tile); slot.appendChild(kb); sw.appendChild(slot);
          }
          return;
        }
        const k = tab, list = G.OPTS[TABS.find(x => x.id === tab).opt || tab];
        for (const v of list) {
          const key = k + ':' + v, owned = G.isOwned(key);
          const isNew = owned && S.fresh && S.fresh[key];
          const ch = U.el('button', 'chip' + (COLOUR_TABS[k] ? ' col' : '') + (av[k] === v ? ' on' : '') + (owned ? '' : ' locked') + (isNew ? ' new' : ''));
          if (COLOUR_TABS[k]) ch.style.background = v;
          else if (k === 'pet') { if (v === 'none') ch.innerHTML = '<div class="em">🚫</div>'; else { const cv = U.el('canvas'); cv.width = 160; cv.height = 160; G.drawCreature(cv.getContext('2d'), v, 80, 140, 2.6, { t: 1 }); ch.appendChild(cv); } }
          else if (v === 'none') ch.innerHTML = '<div class="em">🚫</div>';
          else ch.appendChild(chipCanvas(chipAv(k, v), k === 'hat' || k === 'hair' || k === 'face'));
          ch.onclick = () => {
            if (!owned) { G.sfx('squeak'); UI.toast(G.lockHint(key), true); return; }
            snap(); av[k] = v; G.sfx('pop'); sw.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); ch.classList.add('on');
            if (k !== 'skin' && k !== 'hairCol' && !COLOUR_TABS[k]) renderTabSoon();
          };
          sw.appendChild(ch);
        }
        if (S.fresh) for (const key of Object.keys(S.fresh)) if (key.split(':')[0] === k) delete S.fresh[key];
      };
      let rt = 0; const renderTabSoon = () => { clearTimeout(rt); rt = setTimeout(renderTab, 50); };
      dice.onclick = () => {
        snap(); const O = G.OPTS, pickOwned = k => U.pick(O[k].filter(v => G.isOwned(k + ':' + v)));
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

  /* ---------- Pip's toy shop (SPEC §9) ---------- */
  UI.shop = function () {
    return new Promise(done => {
      G.paused = true;
      const S = G.S, ov = UI.overlay(true), card = U.el('div', 'card shop');
      const top = U.el('div', 'top'), face = document.createElement('canvas'); face.width = face.height = 110; face.className = 'cfface';
      G.portrait(face, G.PEOPLE.pip.look, 1); top.appendChild(face);
      const q = U.el('div', 'q'); top.appendChild(q);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      const grid = U.el('div', 'shopgrid'), msg = U.el('div', 'hint'), act = U.el('div', 'shopact');
      card.appendChild(top); card.appendChild(grid); card.appendChild(msg); card.appendChild(act); ov.appendChild(card);
      const items = Object.keys(G.LOCKED).filter(k => G.LOCKED[k] === 'shop').sort((a, b) => G.PRICE[a] - G.PRICE[b]);
      const head = () => { q.innerHTML = '<small>Pip’s Toy Shop</small><br>You have <b>' + S.coins + '</b> 🪙'; };
      const say = m => { msg.textContent = m; G.say(m, true); };
      const finish = () => { G.hush(); UI.overlay(false); G.paused = false; G.saveGame(); UI.gembar(); done(); };
      close.onclick = () => { G.sfx('tap'); finish(); };
      const preview = key => {
        const [k, v] = key.split(':'), cv = U.el('canvas'); cv.width = 180; cv.height = 200; const c = cv.getContext('2d');
        if (k === 'pet') G.drawCreature(c, v, 90, 185, 2.4, { t: 1 });
        else { const a = Object.assign({}, S.avatar); a[k] = v; G.drawAvatar(c, a, 90, k === 'hat' ? 330 : 195, k === 'hat' ? 3.2 : 1.7, { t: 1, noShadow: true }); }
        return cv;
      };
      const pick = key => {
        const name = G.ITEM_NAME[key] || 'This', price = G.PRICE[key], [k, v] = key.split(':');
        grid.querySelectorAll('.shopitem').forEach(x => x.classList.toggle('on', x.dataset.key === key));
        act.innerHTML = '';
        const wear = () => { const b = U.el('button', 'bigbtn green', 'Wear it now ▶'); b.onclick = () => { S.avatar[k] = v; G.sfx('magic'); G.saveGame(); finish(); }; act.appendChild(b); };
        if (S.owned[key]) { say('You have the ' + name.toLowerCase() + ' already! 💖'); if (S.avatar[k] !== v) wear(); return; }
        if (S.coins < price) { G.sfx('squeak'); say('You have ' + S.coins + ' coins. It costs ' + price + '. You need ' + (price - S.coins) + ' more! Serve at the café to earn coins.'); return; }
        say(name + ' costs ' + price + ' coins. Do you want it?');
        const buy = U.el('button', 'bigbtn green', 'Buy for ' + price + ' 🪙');
        buy.onclick = () => {
          S.coins -= price; G.unlock(key); G.sfx('fanfare'); G.saveGame(); head(); UI.gembar(); render(); act.innerHTML = '';
          say('Hooray! The ' + name.toLowerCase() + ' is yours!'); wear();
        };
        act.appendChild(buy);
      };
      const render = () => {
        grid.innerHTML = '';
        for (const key of items) {
          const it = U.el('button', 'shopitem' + (S.owned[key] ? ' have' : '')); it.dataset.key = key;
          it.appendChild(preview(key));
          it.appendChild(U.el('div', 'nm', G.ITEM_NAME[key] || key));
          it.appendChild(U.el('div', 'pr', S.owned[key] ? '💖 Yours' : G.PRICE[key] + ' 🪙'));
          it.onclick = () => { G.sfx('tap'); pick(key); };
          grid.appendChild(it);
        }
      };
      head(); render();
      say('Welcome to my toy shop! Tap a toy to look at it.');
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
    const gu = U.el('button', 'bigbtn', 'For grown-ups 🔒'); gu.style.fontSize = '22px'; gu.title = 'Hold for two seconds';
    let gt = 0; const gcancel = () => { clearTimeout(gt); gu.style.opacity = 1; };
    gu.onpointerdown = () => { gu.style.opacity = 0.6; gt = setTimeout(() => UI.grownups(), 2000); }; gu.onpointerup = gu.onpointerleave = gcancel;
    row.appendChild(reset); row.appendChild(gu); row.appendChild(close); card.appendChild(row); ov.appendChild(card);
  };

  /* ---------- grown-ups page (SPEC §7.2i): plain facts for a parent, never shown to the child as scores ---------- */
  UI.grownups = function () {
    G.paused = true;
    const S = G.S, ov = UI.overlay(true), card = U.el('div', 'card grown');
    const SUBJ = { maths: ['Maths', ['counting and adding within 5', 'adding and taking away within 10', 'number bonds and sums within 20', 'two-digit numbers, twos, fives and tens', 'Year 2: bigger sums, times tables, change']],
      words: ['Reading and spelling', ['first sounds and tracing letters', 'CVC words and simple sentences', 'rhymes, tricky words, spelling', 'digraphs and compound words', 'Year 2: endings, plurals, harder spellings']],
      nature: ['Science', ['animals, senses and seasons', 'plants, materials, baby animals', 'habitats and what animals eat', 'animal groups and life cycles', 'Year 2: food chains, living and dead']],
      shapes: ['Shape, time and money', ['2D shapes, coins, o\'clock', 'half past, corners, position', '3D shapes, measuring, symmetry', 'quarter turns, months, change', 'Year 2: five-minute times, change from £1']],
      patterns: ['Patterns and logic', ['what comes next', 'repeating and growing patterns', 'counting in twos and fives', 'steps of three and four, ordering', 'Year 2: odd and even, mirror pictures']] };
    const hw = S.handwriting || {}, keys = Object.keys(hw), stars = k => { const b = hw[k].best || 0; return b >= 0.85 ? 3 : b >= 0.7 ? 2 : b >= 0.5 ? 1 : 0; };
    const weak = keys.filter(k => hw[k].tries >= 1).sort((a, b) => (hw[a].best || 0) - (hw[b].best || 0)).slice(0, 5).filter(k => stars(k) < 3);
    const quests = Object.keys(S.quests).filter(k => S.quests[k]).length, areas = Object.keys(S.areas).filter(k => S.areas[k] && G.AREAS[k]).length;
    const ps = S.playsets || {}, pics = ps.art && ps.art.gallery ? ps.art.gallery.length : 0, cured = ps.vet && ps.vet.cured || S.stats.vet || 0;
    let h = '<div class="gtitle">For grown-ups</div><div class="gcols"><div>';
    h += '<h3>Learning</h3><p>Puzzles solved: <b>' + S.stats.solved + '</b>. The game moves each subject up or down a level by itself.</p><table>';
    for (const k in SUBJ) { const lv = Math.min(4, S.level[k] || 0); h += '<tr><td>' + SUBJ[k][0] + '</td><td><b>Level ' + (lv + 1) + ' of 5</b></td><td>' + SUBJ[k][1][lv] + '</td></tr>'; }
    h += '</table><h3>Handwriting</h3><p>Letters practised: <b>' + keys.length + '</b>. Formed well (2–3 stars): <b>' + keys.filter(k => stars(k) >= 2).length + '</b>.'
      + (weak.length ? ' Worth practising: <b class="gl">' + weak.join(' &nbsp;') + '</b>.' : keys.length ? ' Nothing stands out as weak.' : ' Nothing written yet — try Writing Wood.') + '</p>';
    h += '</div><div><h3>Adventure</h3><p>Places visited: <b>' + areas + ' of ' + Object.keys(G.AREAS).length + '</b>. Quests and firsts finished: <b>' + quests + '</b>.' + (S.quests.finale ? ' The Cloud Castle is open — the story is complete.' : '') + '</p>'
      + '<p>Gems: ' + G.GEMS.map(c => G.gemSVG(c, 22) + ' ' + S.gems[c]).join(' &nbsp;') + ' &nbsp;🪙 ' + S.coins + '</p>'
      + '<h3>Playroom</h3><p>Potions cast: <b>' + (S.stats.potions || 0) + '</b>. Pets made better: <b>' + cured + '</b>. Pictures saved: <b>' + pics + '</b>.</p>'
      + '<h3>Play offline</h3><p>' + (G.offline && G.offline.state === 'ready' ? 'The game is saved on this device and works without the internet.' : 'Open the game once with the internet on and it saves itself for offline play.') + ' For full screen, use the browser menu → <b>Add to Home Screen</b>.</p>'
      + '<h3>Settings</h3><div class="gset"></div><p class="gfb">Feedback: open an issue labelled <b>feedback</b> on the game\'s GitHub page. One note per issue.</p></div></div>';
    card.innerHTML = h;
    const set = card.querySelector('.gset');
    const tolBtn = U.el('button', 'gbtn'), TOL = [[1.3, 'gentle'], [1, 'normal'], [0.8, 'strict']];
    const tolShow = () => { const cur = S.settings.writeTol || 1, i = cur > 1.1 ? 0 : cur < 0.9 ? 2 : 1; tolBtn.textContent = 'Handwriting checks: ' + TOL[i][1]; return i; };
    tolBtn.onclick = () => { S.settings.writeTol = TOL[(tolShow() + 1) % 3][0]; tolShow(); G.saveGame(); }; tolShow(); set.appendChild(tolBtn);
    const ls = U.el('button', 'gbtn'); const lsShow = () => ls.textContent = 'Say letter sounds while writing: ' + (S.settings.letterSounds === false ? 'off' : 'on'); ls.onclick = () => { S.settings.letterSounds = S.settings.letterSounds === false; lsShow(); G.saveGame(); }; lsShow(); set.appendChild(ls);
    const lh = U.el('button', 'gbtn'); const lhShow = () => lh.textContent = 'Writing hand: ' + (S.settings.leftHanded ? 'left' : 'right'); lh.onclick = () => { S.settings.leftHanded = !S.settings.leftHanded; lhShow(); G.saveGame(); }; lhShow(); set.appendChild(lh);
    const close = U.el('button', 'closex', '✕'); close.onclick = () => { G.sfx('tap'); UI.overlay(false); G.paused = false; }; card.appendChild(close);
    ov.appendChild(card);
  };

  /* bug journal (SPEC §7.2e) */
  /* ---------- world map (SPEC §8.3) ---------- */
  UI.MAP = [['village', '🏡', 150, 430], ['house', '🏠', 330, 290], ['cafe', '☕', 500, 440], ['meadow', '🐞', 660, 300], ['writing', '✏️', 330, 130],
    ['tower', '🫖', 840, 170], ['woods', '🌲', 840, 440], ['caves', '💎', 1000, 320], ['clouds', '☁️', 990, 90]];
  UI.map = function () {
    G.paused = true;
    const ov = UI.overlay(true), card = U.el('div', 'card mapcard'), S = G.S;
    const pts = UI.MAP.map(m => m[2] + ',' + (m[3] + 10)).join(' ');
    card.innerHTML = '<div class="maptitle">🗺️ Hazelnut Hollow</div><svg class="mappath" viewBox="0 0 1120 560"><polyline points="' + pts + '" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 22" opacity=".9"/></svg>';
    const shut = () => { G.hush(); UI.overlay(false); G.paused = false; };
    const tip = U.el('div', 'maptip', 'Tap a place to go there.'); card.appendChild(tip);
    for (const [id, ic, x, y] of UI.MAP) {
      const been = !!S.areas[id] && !!G.AREAS[id], here = G.E.id === id, nm = id === 'village' ? 'Hazelnut Hollow' : G.AREA_NAMES[id];
      const b = U.el('button', 'mapspot' + (been ? '' : ' locked') + (here ? ' here' : ''), '<span class="ic">' + ic + '</span><span class="nm">' + nm + '</span>' + (been ? '' : '<span class="lk">🔒</span>') + (here ? '<span class="pin">📍</span>' : ''));
      b.style.left = x + 'px'; b.style.top = y + 'px';
      b.onclick = () => {
        if (here) { G.sfx('tap'); tip.textContent = 'You are here!'; G.say('You are here!', true); }
        else if (been) { G.sfx('door'); shut(); G.E.travel(id); }
        else { G.sfx('squeak'); b.classList.remove('wob'); void b.offsetWidth; b.classList.add('wob'); tip.textContent = G.AREAS[id] ? 'Find the gate to ' + nm + ' first!' : nm + ' is still a secret…'; G.say(tip.textContent, true); }
      };
      card.appendChild(b);
    }
    const x = U.el('button', 'closex', '✕'); x.onclick = () => { G.sfx('tap'); shut(); }; card.appendChild(x);
    ov.appendChild(card);
  };

  UI.journal = function (tab) {
    G.paused = true;
    const ov = UI.overlay(true), card = U.el('div', 'card journal'), n = G.MEAD.count();
    const tabs = U.el('div', 'jtabs'); card.appendChild(tabs);
    const body = U.el('div', 'jbody'); card.appendChild(body);
    const hint = U.el('div', 'hint', ''); card.appendChild(hint);
    const tell = m => { hint.textContent = m; G.say(m, true); };
    const bugs = () => {
      body.innerHTML = '';
      body.appendChild(U.el('h2', '', '📖 My bug journal <small>' + n + ' of 10 bugs</small>'));
      const grid = U.el('div', 'jgrid'); body.appendChild(grid);
      for (const k of G.MEAD.KINDS) {
        const b = G.BUGS[k], got = G.S.bugs[k], cell = U.el('button', 'jbug' + (got ? '' : ' unk'));
        cell.appendChild(G.MEAD.bugCanvas(k, 130, { sil: !got, still: true }));
        cell.appendChild(U.el('div', 'jname', got ? b.name : '?'));
        cell.onclick = () => { G.sfx('pop'); tell(got ? 'The ' + b.name + '. ' + b.fact : 'Not found yet. Keep looking!'); };
        grid.appendChild(cell);
      }
      return n ? 'Tap a bug to hear about it.' : 'Find bugs in Bugglemead and they will live here!';
    };
    const writing = () => {
      body.innerHTML = '';
      const hw = G.S.handwriting || {}, stars = ch => { const b = hw[ch] ? hw[ch].best : 0; return b >= 0.85 ? 3 : b >= 0.7 ? 2 : b >= 0.5 ? 1 : 0; };
      const rows = ['abcdefghijklmnopqrstuvwxyz'];
      if ([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].some(ch => hw[ch])) rows.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      if ([...'0123456789'].some(ch => hw[ch])) rows.push('0123456789');
      let total = 0; for (const r of rows) for (const ch of r) total += stars(ch);
      body.appendChild(U.el('h2', '', '✏️ My writing <small>' + total + ' ⭐</small>'));
      const wrap = U.el('div', 'lgrid'); body.appendChild(wrap);
      for (const r of rows) for (const ch of r) {
        const st = stars(ch), cell = U.el('button', 'lcell' + (hw[ch] ? '' : ' unk'), '<b>' + ch + '</b><span>' + '★'.repeat(st) + '<i>' + '★'.repeat(3 - st) + '</i></span>');
        cell.onclick = () => { G.sfx('pop'); tell(hw[ch] ? (st === 3 ? 'Super ' + ch + '! Three stars!' : 'Your ' + ch + '. Practise in Writing Wood for more stars!') : 'Try ' + ch + ' in Writing Wood!'); };
        wrap.appendChild(cell);
      }
      return total ? 'Tap a letter. Practise for more stars!' : 'Write letters in Writing Wood to earn stars!';
    };
    const show = which => {
      tabs.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.t === which));
      tell(which === 'writing' ? writing() : bugs());
    };
    for (const [t, label] of [['bugs', '🐞 Bugs'], ['writing', '✏️ Writing']]) {
      const b = U.el('button', 'jtab', label); b.dataset.t = t; b.onclick = () => { G.sfx('tap'); show(t); }; tabs.appendChild(b);
    }
    const close = U.el('button', 'closex', '✕'); close.onclick = () => { G.sfx('tap'); G.hush(); UI.overlay(false); G.paused = false; }; card.appendChild(close);
    ov.appendChild(card);
    show(tab || 'bugs');
  };

  UI.bindHud = function () {
    document.querySelectorAll('.hbtn').forEach(b => b.addEventListener('click', () => {
      if (G.paused) return; G.audioUnlock(); G.sfx('tap');
      const a = b.dataset.act;
      if (a === 'wardrobe') UI.creator(false);
      else if (a === 'settings') UI.settings();
      else if (a === 'map') UI.map();
      else if (a === 'play') G.SB.open();
      else if (a === 'journal') UI.journal();
    }));
  };
})();

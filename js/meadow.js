/* Hazelnut Hollow — Bugglemead (SPEC §7.2e): bug data, magnifier cards, sorting hoops.
   G.MEAD.look(kind) → Promise; G.MEAD.sort() → Promise. Never fails: hint → hint → reveal. */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const M = G.MEAD = {};
  const B = G.BUGS = {
    ladybird:    { name: 'ladybird',    legs: 6,  wings: true,  home: 'leaves',  hi: '🍃', fact: 'Ladybirds eat tiny greenfly.' },
    bee:         { name: 'bee',         legs: 6,  wings: true,  home: 'hive',    hi: '🍯', fact: 'Bees visit flowers and make honey.' },
    butterfly:   { name: 'butterfly',   legs: 6,  wings: true,  home: 'flowers', hi: '🌸', fact: 'A butterfly was once a caterpillar.' },
    snail:       { name: 'snail',       legs: 0,  wings: false, home: 'damp leaves', hi: '🍃', fact: 'A snail carries its shell on its back.' },
    worm:        { name: 'worm',        legs: 0,  wings: false, home: 'soil',    hi: '🟫', fact: 'Worms mix the soil and help plants grow.' },
    spider:      { name: 'spider',      legs: 8,  wings: false, home: 'web',     hi: '🕸️', fact: 'A spider is not an insect. It has eight legs.' },
    ant:         { name: 'ant',         legs: 6,  wings: false, home: 'nest',    hi: '🏔️', fact: 'Ants work together in a big team.' },
    grasshopper: { name: 'grasshopper', legs: 6,  wings: true,  home: 'long grass', hi: '🌾', fact: 'Grasshoppers can jump a long way.' },
    woodlouse:   { name: 'woodlouse',   legs: 14, wings: false, home: 'under logs', hi: '🪵', fact: 'A woodlouse rolls into a ball to stay safe.' },
    dragonfly:   { name: 'dragonfly',   legs: 6,  wings: true,  home: 'pond',    hi: '💧', fact: 'Dragonflies lay their eggs in ponds.' },
  };
  M.KINDS = Object.keys(B);
  const numWord = n => ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] || String(n);
  M.count = () => M.KINDS.filter(k => G.S.bugs && G.S.bugs[k]).length;

  /* a small canvas with a bug drawn on it (animated while on screen) */
  M.bugCanvas = function (kind, size, opts) {
    const cv = document.createElement('canvas'); cv.width = cv.height = size; cv.className = 'bugcv';
    const c = cv.getContext('2d'), sil = opts && opts.sil, still = opts && opts.still;
    const draw = t => {
      c.clearRect(0, 0, size, size);
      if (sil && G.drawBugSilhouette) G.drawBugSilhouette(c, kind, size / 2, size * 0.72, size / 68);
      else if (G.drawBug) G.drawBug(c, kind, size / 2, size * 0.72, size / 68, { t, still });
      else G.emoji(c, '🐞', size / 2, size / 2, size * 0.6);
    };
    draw(0);
    if (!still && !sil) { const t0 = performance.now(); const tick = () => { if (!cv.isConnected) return; draw((performance.now() - t0) / 1000); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
    return cv;
  };

  /* the question for a bug at a level */
  M.make = function (kind, lv) {
    const b = B[kind]; let type = lv <= 0 ? 'legs' : lv === 1 ? 'wings' : U.pick(['legs', 'wings', 'home']);
    if (type === 'legs' && b.legs > 8) type = 'wings';   // woodlouse: too many legs to count
    if (type === 'legs') {
      const opts = U.shuffle(U.shuffle([0, 6, 8, 4].filter(n => n !== b.legs)).slice(0, 2).concat(b.legs));
      return { type, q: 'How many legs does the ' + b.name + ' have?', choices: opts.map(String), answer: opts.indexOf(b.legs),
        hint: b.legs ? 'Count the legs. Touch each one!' : 'Look closely. Can you see any legs?' };
    }
    if (type === 'wings') return { type, q: 'Does the ' + b.name + ' have wings?', choices: ['Yes', 'No'], answer: b.wings ? 0 : 1, hint: 'Look at its back. Wings are thin and see-through or bright.' };
    const homes = U.shuffle([...new Set(M.KINDS.map(k => B[k].hi))].filter(h => h !== b.hi)).slice(0, 2).concat(b.hi), opts = U.shuffle(homes);
    return { type, q: 'Where does the ' + b.name + ' live?', choices: opts, answer: opts.indexOf(b.hi), hint: 'The ' + b.name + ' lives in the ' + b.home + '.' };
  };

  M.look = function (kind) {
    const b = B[kind] || B.ladybird, lv = G.S.level.nature || 0, d = M.make(kind, lv);
    return new Promise(resolve => {
      G.paused = true;
      const ov = G.UI.overlay(true), card = U.el('div', 'card puzzle bugcard');
      const top = U.el('div', 'top');
      const q = U.el('div', 'q', '<small>🔍 ' + b.name + '</small><br>' + d.q); top.appendChild(q);
      const spk = U.el('button', 'iconbtn', '🔊'); spk.onclick = () => G.say(d.q, true); top.appendChild(spk);
      card.appendChild(top);
      const lens = U.el('div', 'lens'); lens.appendChild(M.bugCanvas(kind, 300)); card.appendChild(lens);
      const box = U.el('div', 'answers'); card.appendChild(box);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      ov.appendChild(card);
      let wrong = 0, done = false;
      const finish = r => { G.hush(); G.UI.overlay(false); G.paused = false; resolve(r); };
      close.onclick = () => { G.sfx('tap'); finish({ ok: false }); };
      const fact = revealed => {
        done = true; G.PZ.adapt('nature', wrong === 0 && !revealed, revealed);
        const first = !G.S.bugs[kind]; G.S.bugs[kind] = true;
        if (first) { G.S.coins++; G.UI.gembar && G.UI.gembar(); }
        box.innerHTML = '';
        hint.innerHTML = (revealed ? '' : U.pick(['Well spotted!', 'You looked closely!', 'You counted them!']) + ' ') + b.fact + (first ? '<br><b>New bug for your journal! 📖 +1 🪙</b>' : '');
        G.say(hint.textContent.replace(/[📖🪙+]/gu, ''), true);
        const go = U.el('button', 'bigbtn green', 'Let it go 🍃');
        go.onclick = () => { G.sfx('tap'); finish({ ok: true, first }); M.rewards(); };
        box.appendChild(go); G.saveGame();
      };
      const btns = d.choices.map((ch, i) => {
        const bt = U.el('button', 'ans', ch); bt.onclick = () => {
          if (done || bt.classList.contains('dim')) return;
          if (i === d.answer) { bt.classList.add('right'); G.sfx('right'); setTimeout(() => fact(false), 500); return; }
          wrong++; G.sfx('wrong'); bt.classList.remove('wrong'); void bt.offsetWidth; bt.classList.add('wrong'); setTimeout(() => bt.classList.add('dim'), 400);
          const m = (wrong > 1 ? 'Nearly! ' : '') + d.hint; hint.textContent = m; G.say(m, true);
          if (wrong >= 2 || btns.filter(x => !x.classList.contains('dim')).length <= 2 && d.choices.length === 2) { btns[d.answer].classList.add('right'); setTimeout(() => fact(true), 900); }
        }; box.appendChild(bt); return bt;
      });
      setTimeout(() => G.say('A ' + b.name + '! ' + d.q, true), 250);
    });
  };

  /* milestone prizes, called after a look */
  M.rewards = function () {
    const n = M.count(), S = G.S;
    const give = async (q, key, col, title) => {
      if (S.quests[q]) return; S.quests[q] = true; G.unlock(key); S.gems[col]++;
      G.sfx('fanfare'); G.UI.flyGem && G.UI.flyGem(col, G.VW / 2, G.VH / 2);
      G.UI.toast(title + ' You won ' + G.ITEM_NAME[key] + '! 🎁', true); G.saveGame();
    };
    if (n >= 10) give('bugs10', 'back:beewings', 'purple', 'Bug expert! 🐝');
    else if (n >= 6) give('bugs6', 'hat:antennae', 'green', 'Bug spotter! 🐞');
  };

  /* sorting hoops: tap a bug, then a hoop */
  M.sort = function () {
    const lv = G.S.level.nature || 0, byWings = lv >= 2 && Math.random() < 0.5;
    const hoops = byWings ? [{ n: 'Wings', ok: b => b.wings }, { n: 'No wings', ok: b => !b.wings }]
      : [{ n: 'No legs', ok: b => b.legs === 0 }, { n: '6 legs', ok: b => b.legs === 6 }, { n: '8 legs', ok: b => b.legs === 8 }];
    const of = f => U.shuffle(M.KINDS.filter(k => f(B[k])));
    const set = U.shuffle(byWings ? of(b => b.wings).slice(0, 3).concat(of(b => !b.wings).slice(0, 2))
      : of(b => b.legs === 0).slice(0, 1).concat(['spider'], of(b => b.legs === 6).slice(0, 3)));
    return new Promise(resolve => {
      G.paused = true;
      const ov = G.UI.overlay(true), card = U.el('div', 'card puzzle sortcard');
      const say = byWings ? 'Wings or no wings? Tap a bug, then a hoop.' : 'Count the legs! Tap a bug, then a hoop.';
      const top = U.el('div', 'top'); top.appendChild(U.el('div', 'q', say));
      const spk = U.el('button', 'iconbtn', '🔊'); spk.onclick = () => G.say(say, true); top.appendChild(spk); card.appendChild(top);
      const tray = U.el('div', 'sorttray'); card.appendChild(tray);
      const row = U.el('div', 'hoops'); card.appendChild(row);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      ov.appendChild(card);
      let sel = null, left = set.length, missesTotal = 0;
      const finish = r => { G.hush(); G.UI.overlay(false); G.paused = false; resolve(r); };
      close.onclick = () => { G.sfx('tap'); finish({ ok: false }); };
      const hoopEls = hoops.map(h => {
        const el = U.el('button', 'hoop', '<span>' + h.n + '</span>'); el.h = h; row.appendChild(el);
        el.onclick = () => {
          if (!sel) { hint.textContent = 'Tap a bug first!'; G.say(hint.textContent, true); return; }
          const b = B[sel.kind];
          if (h.ok(b)) { place(sel, el, true); return; }
          sel.miss = (sel.miss || 0) + 1; missesTotal++; G.sfx('wrong');
          el.classList.remove('wob'); void el.offsetWidth; el.classList.add('wob');
          const m = sel.miss >= 3 ? 'This one goes here!' : byWings ? 'Look at its back. Can you see wings?' : 'Count the legs! The ' + b.name + ' has ' + (sel.miss >= 2 ? numWord(b.legs) + ' legs.' : '…');
          hint.textContent = m.replace('…', 'how many?'); G.say(hint.textContent, true);
          if (sel.miss >= 3) place(sel, hoopEls.find(x => x.h.ok(b)), false);
        };
        return el;
      });
      const place = (bt, hoopEl, good) => {
        if (good) { G.sfx('right'); hint.textContent = U.pick(['Good sorting!', 'You checked its legs!', 'You looked closely!']); G.say(hint.textContent, true); }
        bt.classList.remove('sel'); bt.onclick = null; bt.classList.add('placed'); hoopEl.appendChild(bt); sel = null;
        if (--left === 0) setTimeout(win, 700);
      };
      const win = () => {
        G.PZ.adapt('nature', missesTotal === 0, false);
        const first = !G.S.quests.sort; G.S.quests.sort = true;
        let msg = 'All sorted! Bettina is so pleased.';
        if (first) { G.S.gems.green++; G.UI.flyGem && G.UI.flyGem('green', G.VW / 2, G.VH / 2); msg += ' Here is a green gem!'; G.sfx('fanfare'); }
        else { G.S.coins += 2; msg += ' +2 🪙'; G.sfx('coin'); }
        hint.textContent = msg; G.say(msg.replace('🪙', 'coins'), true); G.saveGame();
        const ok = U.el('button', 'bigbtn green', 'Hooray! ▶'); ok.onclick = () => { G.sfx('tap'); finish({ ok: true, first }); }; card.appendChild(ok);
      };
      for (const kind of set) {
        const bt = U.el('button', 'sortbug'); bt.kind = kind; bt.appendChild(M.bugCanvas(kind, 110, { still: true }));
        bt.onclick = () => { if (sel) sel.classList.remove('sel'); sel = bt; bt.classList.add('sel'); G.sfx('pop'); G.say(B[kind].name, true); };
        tray.appendChild(bt);
      }
      setTimeout(() => G.say(say, true), 250);
    });
  };

  /* Bettina's lines depend on progress */
  M.bettinaLines = function () {
    const n = M.count();
    if (n === 0) return ['Hello! I am Bettina Bugbright. I love bugs!', 'Bugs live all over the meadow. Tap a bug to look at it with your magnifier.', 'Count their legs, then let them go home. Find six bugs for a prize!'];
    if (n >= 10) return ['You found every bug! You are a true bug expert. 🐝', 'Try my sorting hoops for more fun.'];
    return ['You have found ' + n + ' bug' + (n > 1 ? 's' : '') + '. ' + (10 - n) + ' more to find!', n < 6 ? 'Find six for a prize!' : 'Find them all for a big prize!', 'Look in your bug journal 📖 to see them.'];
  };
})();

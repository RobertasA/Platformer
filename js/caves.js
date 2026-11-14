/* Hazelnut Hollow — Crystal Caves cards (SPEC §7.2h): crystal chimes, dragon nest, Mole's lines.
   G.CAVES.chime(e) / nest(e) → Promise; moleLines() → [string]. */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const CV = G.CAVES = {};

  const NOTES = [60, 62, 64, 67, 69];
  const NAMES = ['pink', 'orange', 'green', 'blue', 'violet'];

  CV.makeTune = function (n) {
    const t = [];
    while (t.length < n) {
      const k = U.irnd(0, 4), L = t.length;
      if (L >= 2 && t[L - 1] === k && t[L - 2] === k) continue;
      t.push(k);
    }
    return t;
  };

  const open = () => {
    G.paused = true;
    const ov = G.UI.overlay(true), card = U.el('div', 'card puzzle cavecard');
    ov.appendChild(card);
    return card;
  };
  const shut = (extra) => { if (extra) extra(); G.hush(); G.UI.overlay(false); G.paused = false; };
  const topBar = (card, html, say) => {
    const top = U.el('div', 'top'), q = U.el('div', 'q', html); top.appendChild(q);
    const spk = U.el('button', 'iconbtn', '🔊'); spk.onclick = () => G.say(say(), true); top.appendChild(spk);
    card.appendChild(top); return q;
  };
  const retrigger = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const sparkles = (host, n, emoji) => {
    for (let i = 0; i < n; i++) {
      const s = U.el('span', 'cv-spark', emoji || U.pick(['✨', '⭐', '💎', '✨']));
      const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 160;
      s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d * 0.7 + 'px');
      s.style.animationDelay = (Math.random() * 0.25) + 's';
      host.appendChild(s); setTimeout(() => s.remove(), 1600);
    }
  };

  /* ---------- crystal chime ---------- */
  CV.chime = function (e) {
    const lv = G.S.level.patterns || 0, n = lv <= 0 ? 3 : lv === 1 ? 4 : 5;
    const tune = CV.makeTune(n); CV._tune = tune.slice();
    return new Promise(resolve => {
      const card = open(), ask = 'Listen to the crystals. Then play the same tune!';
      topBar(card, 'Copy the crystal tune!', () => ask);
      const row = U.el('div', 'cv-row'); card.appendChild(row);
      const dotsEl = U.el('div', 'cv-dots'); card.appendChild(dotsEl);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const bar = U.el('div', 'cv-bar'); card.appendChild(bar);
      const listen = U.el('button', 'bigbtn alt', '👂 Listen'); bar.appendChild(listen);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      const timers = [];
      const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
      let playing = false, free = false, pos = 0, misses = 0, closed = false, guide = false;

      const dots = [];
      for (let i = 0; i < n; i++) { const d = U.el('span', 'cv-dot'); dotsEl.appendChild(d); dots.push(d); }
      const setDots = k => dots.forEach((d, i) => d.classList.toggle('on', i < k));

      const crystals = NOTES.map((m, i) => {
        const b = U.el('button', 'cv-cr c' + i, '<span class="cv-gem"></span><span class="cv-badges"></span>');
        b.setAttribute('aria-label', NAMES[i] + ' crystal');
        b.onpointerdown = ev => { ev.preventDefault(); tap(i); };
        row.appendChild(b); return b;
      });
      const light = (i, ms) => {
        const b = crystals[i]; G.note(NOTES[i], 0.6, 'sine', 0.35);
        b.classList.add('lit'); later(() => b.classList.remove('lit'), ms || 450);
      };
      const showBadges = () => {
        guide = true;
        crystals.forEach((b, i) => {
          const box = b.querySelector('.cv-badges'); box.innerHTML = '';
          tune.forEach((k, j) => { if (k === i) box.appendChild(U.el('span', 'cv-badge', String(j + 1))); });
        });
      };
      const playTune = () => {
        playing = true; pos = 0; setDots(0); listen.disabled = true;
        tune.forEach((k, j) => later(() => light(k, 500), 400 + j * 650));
        later(() => { playing = false; listen.disabled = false; if (!free) { hint.textContent = 'Now you play!'; } }, 400 + n * 650);
      };
      const finish = () => { closed = true; timers.forEach(clearTimeout); shut(); resolve(); };
      close.onclick = () => { G.sfx('tap'); G.saveGame(); finish(); };
      listen.onclick = () => { if (playing) return; G.sfx('tap'); hint.textContent = 'Listen…'; playTune(); };

      const win = () => {
        free = true; setDots(n); dots.forEach(d => d.classList.add('done'));
        crystals.forEach((b, i) => later(() => { retrigger(b, 'cheer'); }, i * 90));
        sparkles(card, 18); G.sfx('right');
        G.PZ.adapt('patterns', misses === 0, false);
        let msg;
        if (!G.S.quests['chime:' + e.id]) {
          G.S.quests['chime:' + e.id] = true; G.S.gems[e.col]++;
          later(() => { G.sfx('fanfare'); G.UI.flyGem(e.col, 640, 300); }, 500);
          msg = 'Beautiful music! Here is a gem.';
        } else { G.S.coins += 2; G.UI.gembar(); later(() => G.sfx('coin'), 400); msg = 'Lovely tune! +2 🪙'; }
        hint.textContent = msg; later(() => G.say(msg.replace('🪙', 'coins'), true), 500); G.saveGame();
        const ok = U.el('button', 'bigbtn green', 'Done ▶'); ok.onclick = () => { G.sfx('tap'); G.saveGame(); finish(); }; bar.appendChild(ok);
      };
      const tap = i => {
        if (closed || playing) return;
        light(i, 350);
        if (free) return;
        if (tune[pos] === i) {
          pos++; setDots(pos);
          if (pos === n) { playing = true; later(() => { playing = false; win(); }, 450); }
        } else {
          misses++; pos = 0; setDots(0); G.sfx('wrong');
          retrigger(row, 'shake'); hint.textContent = 'Listen again!'; G.say('Listen again!', true);
          if (misses >= 3 && !guide) showBadges();
          playing = true; listen.disabled = true;
          later(playTune, 700);
        }
      };
      later(() => { G.say(ask, true); hint.textContent = 'Listen…'; }, 250);
      later(playTune, 2900);
      playing = true; listen.disabled = true; /* locked until the first tune ends */
    });
  };

  /* ---------- dragon nest ---------- */
  const HELLO = ['Rawr! That means hello.', 'Rawr! I like warm stones.', 'Rawr! Tickle my tummy!'];
  CV.nest = function (e) {
    const f = G.pickCount ? G.pickCount('embers') : { have: 0, total: 3 };
    const hatched = !!G.S.quests.dragon;
    return new Promise(resolve => {
      const card = open();
      const q = topBar(card, '', () => said);
      let said = '', raf = 0, closed = false;
      const timers = [];
      const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
      const scene = U.el('div', 'cv-scene'); card.appendChild(scene);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const bar = U.el('div', 'cv-bar'); card.appendChild(bar);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      const finish = () => { closed = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); G.saveGame(); shut(); resolve(); };
      close.onclick = () => { G.sfx('tap'); finish(); };
      const btn = (txt) => { const b = U.el('button', 'bigbtn green', txt); b.onclick = () => { G.sfx('tap'); finish(); }; bar.appendChild(b); return b; };
      const speak = (t, shown) => { said = t.replace('🪙', 'coins'); hint.textContent = shown || t; G.say(said, true); };
      const nestHTML = '<div class="cv-twigs"></div><div class="cv-stones"></div>';
      const stonesHTML = (have, total, glow) => {
        let s = ''; for (let i = 0; i < total; i++) s += '<span class="cv-stone' + (i < have ? ' got' : '') + (glow ? ' glow' : '') + '" style="--i:' + i + '">🔥</span>';
        return s;
      };

      /* dragon canvas */
      let cvs = null, cx = null, dragonOn = false, hop = 0, pop = 0;
      const mkCanvas = () => {
        cvs = U.el('canvas', 'cv-dragon'); cvs.width = 260; cvs.height = 240; cx = cvs.getContext('2d');
        scene.appendChild(cvs);
        let t0 = performance.now();
        const frame = now => {
          if (closed) return;
          const t = (now - t0) / 1000; cx.clearRect(0, 0, 260, 240);
          if (dragonOn) {
            hop = Math.max(0, hop - 0.035); pop = Math.min(1, pop + 0.05);
            const up = Math.sin(hop * Math.PI) * 36, sc = 4.2 * (0.6 + 0.4 * (1 - Math.pow(1 - pop, 3)));
            G.drawCreature(cx, 'dragon', 130, 225 - up, sc, { t, face: 1 });
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      };

      if (hatched) {
        q.innerHTML = 'Baby dragon';
        scene.innerHTML = '<div class="cv-nest">' + nestHTML + '</div>';
        scene.querySelector('.cv-stones').innerHTML = stonesHTML(f.total, f.total, true);
        mkCanvas(); dragonOn = true; pop = 1;
        let last = -1;
        const hello = () => { let k; do { k = U.irnd(0, HELLO.length - 1); } while (k === last && HELLO.length > 1); last = k; speak(HELLO[k]); };
        cvs.onpointerdown = ev => { ev.preventDefault(); if (hop > 0.05) return; hop = 1; G.sfx('pop'); hello(); };
        later(hello, 250);
        btn('Bye ▶');
      } else if (f.have < f.total) {
        const left = f.total - f.have;
        q.innerHTML = 'A cold egg';
        scene.innerHTML = '<div class="cv-nest"><div class="cv-egg cold shiver"><i></i></div>' + nestHTML + '</div><span class="cv-snow">❄️</span>';
        scene.querySelector('.cv-stones').innerHTML = stonesHTML(f.have, f.total, false);
        const t = 'The egg is cold. Find ' + left + ' more warm stone' + (left === 1 ? '' : 's') + '!';
        later(() => speak(t), 250); hint.textContent = t;
        btn('OK ▶');
      } else {
        q.innerHTML = 'The egg is warm!';
        scene.innerHTML = '<div class="cv-nest"><div class="cv-egg warm" tabindex="0"><i></i><svg class="cv-cracks" viewBox="0 0 150 190"></svg></div>' + nestHTML + '</div>';
        scene.querySelector('.cv-stones').innerHTML = stonesHTML(f.total, f.total, true);
        const egg = scene.querySelector('.cv-egg'), svg = scene.querySelector('.cv-cracks');
        const t = 'The egg is warm! Tap the egg.';
        later(() => speak(t), 250); hint.textContent = t;
        const CR = ['M75 20 L62 55 L84 78 L66 110', 'M66 110 L40 128 M84 78 L116 92 L108 130', 'M75 20 L96 40 L88 62 M62 55 L34 62 M66 110 L74 160 L60 176'];
        let taps = 0;
        const hatch = () => {
          egg.classList.add('burst'); sparkles(scene, 26); G.sfx('fanfare');
          later(() => {
            egg.remove(); mkCanvas(); dragonOn = true; pop = 0;
            G.S.quests.dragon = true; G.unlock('pet:dragon'); G.S.gems.red++; G.UI.flyGem('red', 640, 300); G.saveGame();
            q.innerHTML = 'A baby dragon!';
            speak('A baby dragon! It wants to be your pet. Find it in the dressing-up cottage. Here is a red gem too!');
            hint.textContent = 'A baby dragon! It wants to be your pet. Find it in the dressing-up cottage. Here is a red gem too!';
            btn('Done ▶');
          }, 550);
        };
        const tapEgg = () => {
          if (taps >= 3 || closed) return;
          taps++; G.sfx('pop'); retrigger(egg, 'wobble');
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('d', CR[taps - 1]); p.setAttribute('class', 'cv-crack'); svg.appendChild(p);
          if (taps === 3) { egg.onpointerdown = null; later(hatch, 450); hint.textContent = '✨'; }
          else hint.textContent = taps === 1 ? 'Crack! Tap again!' : 'Nearly there!';
        };
        egg.onpointerdown = ev => { ev.preventDefault(); tapEgg(); };
      }
    });
  };

  /* ---------- Mole ---------- */
  CV.moleLines = function () {
    const Q = G.S.quests || {};
    if (Q.dragon) return ['You hatched the dragon egg! Well done.', 'The way up to the clouds is at the end of the cave.'];
    const f = G.pickCount ? G.pickCount('embers') : { have: 0, total: 3 };
    if (f.have > 0) {
      const left = f.total - f.have;
      return [left > 0 ? 'You found warm stones! The dragon egg is still cold.' : 'You have all the warm stones! Go and warm the egg.',
        left > 0 ? left + ' more warm stone' + (left === 1 ? '' : 's') + ' to find. Look in the dark corners!' : 'It is at the nest. Tap the egg!'];
    }
    return ['Hello! Mind your step. It is dark down here.', 'A lantern helps you see more. Hold one if you have it!', 'The crystals sing. Can you copy their tune?'];
  };
})();

/* Hazelnut Hollow — Cloud Castle finale (SPEC §7.2i). G.FINALE.castle(e) / party() → Promise. */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const FN = G.FINALE = {};

  FN.NEED = { red: 5, blue: 5, green: 5, yellow: 5, purple: 4 };
  const COLS = ['red', 'blue', 'green', 'yellow', 'purple'];
  const have = c => (G.S.gems && G.S.gems[c]) || 0;
  FN.ready = () => COLS.every(c => have(c) >= FN.NEED[c]);

  const open = cls => {
    G.paused = true;
    const ov = G.UI.overlay(true), card = U.el('div', 'card finalecard ' + (cls || ''));
    ov.appendChild(card);
    return card;
  };

  FN.missingText = function () {
    const bits = COLS.filter(c => have(c) < FN.NEED[c]).map(c => { const n = FN.NEED[c] - have(c); return n + ' more ' + c + ' gem' + (n === 1 ? '' : 's'); });
    if (!bits.length) return '';
    const list = bits.length === 1 ? bits[0] : bits.slice(0, -1).join(', ') + ' and ' + bits[bits.length - 1];
    return 'You need ' + list + '.';
  };

  /* ---------- not ready: the door ---------- */
  FN.castle = function (e) {
    if (FN.ready() || (G.S.quests && G.S.quests.finale)) return FN.party();
    return new Promise(resolve => {
      const card = open('door');
      const msg = FN.missingText(), more = 'Gems hide in every land. Look at the map!';
      const door = U.el('div', 'door', '<div class="arch"><div class="leaf l"></div><div class="leaf r"></div><div class="keys">' +
        COLS.map(c => '<span class="kh k-' + c + (have(c) >= FN.NEED[c] ? ' lit' : '') + '">' + G.gemSVG(c, 30) + '</span>').join('') + '</div></div>');
      card.appendChild(door);
      card.appendChild(U.el('h2', 'ttl', 'The Cloud Castle'));
      const row = U.el('div', 'gems');
      for (const c of COLS) {
        const ok = have(c) >= FN.NEED[c];
        row.appendChild(U.el('div', 'gm' + (ok ? ' ok' : ''), '<div class="gi">' + G.gemSVG(c, 56) + (ok ? '<span class="tick">✓</span>' : '') + '</div><div class="ct">' + Math.min(have(c), 99) + ' / ' + FN.NEED[c] + '</div>'));
      }
      card.appendChild(row);
      card.appendChild(U.el('div', 'msg', msg));
      card.appendChild(U.el('div', 'hint', more));
      const ok = U.el('button', 'bigbtn green', 'OK ▶'), close = U.el('button', 'closex', '✕');
      card.appendChild(ok); card.appendChild(close);
      const fin = () => { G.sfx('tap'); G.hush(); G.UI.overlay(false); G.paused = false; resolve(); };
      ok.onclick = fin; close.onclick = fin;
      G.sfx('door');
      setTimeout(() => G.say(msg + ' ' + more, true), 300);
    });
  };

  /* ---------- the party ---------- */
  const goodName = () => {
    const n = String(G.S.name || '').trim();
    return n && n.length <= 10 && /^[A-Za-z]+$/.test(n) ? n : 'I did it';
  };
  FN.writeText = goodName;

  FN.party = function () {
    return new Promise(resolve => {
      const card = open('party');
      const timers = [];
      let pad = null, closed = false, advance = null;
      const later = (f, ms) => { const t = setTimeout(() => { if (!closed) f(); }, ms); timers.push(t); return t; };

      const hall = U.el('div', 'hall');
      hall.innerHTML = '<div class="win w1"></div><div class="win w2"></div><div class="win w3"></div><div class="win w4"></div>' +
        '<div class="bunting">' + Array.from({ length: 14 }, (_, i) => '<i style="--i:' + i + '"></i>').join('') + '</div><div class="carpet"></div>';
      card.appendChild(hall);
      const conf = U.el('div', 'confetti'); card.appendChild(conf);
      const stage = U.el('div', 'stage'); card.appendChild(stage);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);

      const COL = ['#ff5d8f', '#ffd23f', '#4aa8ff', '#3fd08a', '#b36bff', '#ff9a3c'];
      const confetti = (n, burst) => {
        for (let i = 0; i < n; i++) {
          const s = U.el('span', 'cf' + (burst ? ' burst' : ''));
          s.style.cssText = 'left:' + (Math.random() * 100) + '%;background:' + COL[i % COL.length] + ';animation-delay:' + (Math.random() * (burst ? 0.5 : 5)).toFixed(2) + 's;animation-duration:' + (3.5 + Math.random() * 3).toFixed(2) + 's;--dx:' + Math.round(Math.random() * 120 - 60) + 'px;--rot:' + Math.round(300 + Math.random() * 500) + 'deg;width:' + (8 + Math.random() * 8).toFixed(0) + 'px;height:' + (12 + Math.random() * 10).toFixed(0) + 'px';
          conf.appendChild(s);
        }
        if (conf.children.length > 140) while (conf.children.length > 100) conf.firstChild.remove();
      };

      const finish = () => {
        closed = true; timers.forEach(clearTimeout);
        if (pad) { try { pad.destroy(); } catch (_) { } pad = null; }
        G.saveGame(); G.hush(); G.UI.overlay(false); G.paused = false; resolve();
      };
      close.onclick = () => { G.sfx('tap'); finish(); };

      const portrait = (look, size) => {
        const cv = U.el('canvas'); cv.width = cv.height = size; cv.style.width = cv.style.height = size + 'px';
        try { G.portrait(cv, look, 1); } catch (_) { }
        return cv;
      };

      /* ----- stage 1: hall ----- */
      const stage1 = () => {
        stage.innerHTML = '';
        const ids = Object.keys(G.PEOPLE);
        const half = Math.ceil(ids.length / 2);
        const wing = list => {
          const w = U.el('div', 'wing');
          list.forEach((id, k) => {
            const f = U.el('div', 'fr'); f.style.animationDelay = (-((k * 0.37) % 1.6)).toFixed(2) + 's';
            f.appendChild(portrait(G.PEOPLE[id].look, 100));
            f.appendChild(U.el('div', 'nm', G.PEOPLE[id].name));
            w.appendChild(f);
          });
          return w;
        };
        const mid = U.el('div', 'me');
        mid.appendChild(portrait({ av: G.S.avatar }, 210));
        const nb = U.el('div', 'nm big'); nb.textContent = G.S.name || 'You'; mid.appendChild(nb);
        const crowd = U.el('div', 'crowd'); crowd.appendChild(wing(ids.slice(0, half))); crowd.appendChild(mid); crowd.appendChild(wing(ids.slice(half)));
        stage.appendChild(crowd);
        const bubble = U.el('div', 'bubble'), who = U.el('div', 'who'), line = U.el('div', 'line');
        bubble.appendChild(who); bubble.appendChild(line); stage.appendChild(bubble);
        const next = U.el('button', 'bigbtn green go', '▶'); stage.appendChild(next);
        const L = [
          ['hoot', 'You solved so many puzzles!'],
          ['wilf', 'You helped everyone in Hazelnut Hollow.'],
          [G.PEOPLE.luna ? 'luna' : 'hoot', 'Now sign the royal book, hero!'],
        ];
        let i = 0;
        const show = () => {
          const [id, t] = L[i], p = G.PEOPLE[id] || G.PEOPLE.hoot;
          who.textContent = p.name; line.textContent = t;
          bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
          G.sfx(i === 2 ? 'magic' : 'pop'); G.say(t, true);
        };
        advance = () => { G.sfx('tap'); if (++i < L.length) show(); else stage2(); };
        next.onclick = () => advance();
        G.sfx('fanfare'); confetti(40); show();
      };

      /* ----- stage 2: royal book ----- */
      let wrote = false;
      const stage2 = () => {
        stage.innerHTML = ''; card.classList.add('writing');
        const text = goodName(), fallback = text === 'I did it';
        const title = fallback ? 'Write: I did it' : 'Write your name in the royal book!';
        stage.appendChild(U.el('h2', 'ttl', title));
        const book = U.el('div', 'book', '<div class="pg l"></div><div class="pg r"></div><div class="spine"></div>');
        const holder = U.el('div', 'pad'); book.appendChild(holder); stage.appendChild(book);
        const hint = U.el('div', 'hint', ''); stage.appendChild(hint);
        const done = () => {
          if (wrote || closed) return; wrote = true;
          G.sfx('magic'); confetti(24, true);
          later(stage3, 900);
        };
        FN._skipWrite = done;
        pad = G.HW.mount(holder, {
          text, mode: 'fade', tolerance: G.S.settings.writeTol || 1, leftHanded: !!G.S.settings.leftHanded,
          onCoach: m => { hint.textContent = m; },
          onResult: () => done(),
        });
        G.say(title, true);
      };

      /* ----- stage 3: crown ----- */
      const stage3 = () => {
        if (pad) { try { pad.destroy(); } catch (_) { } pad = null; }
        FN._skipWrite = null; card.classList.remove('writing');
        stage.innerHTML = '';
        const first = !(G.S.quests && G.S.quests.finale);
        const hero = U.el('div', 'hero');
        hero.appendChild(U.el('div', 'rays'));
        hero.appendChild(portrait({ av: G.S.avatar }, 250));
        hero.appendChild(U.el('div', 'crown', '👑'));
        stage.appendChild(hero);
        const m1 = first ? 'You are the hero of Hazelnut Hollow!' : 'Welcome back, hero!';
        const m2 = first ? 'Your golden crown is in the dressing-up cottage. Keep playing — your friends and the playroom are still here.' : '';
        const msg = U.el('div', 'msg', m1), sub = U.el('div', 'hint', m2);
        stage.appendChild(msg); stage.appendChild(sub);
        const ok = U.el('button', 'bigbtn green', 'Hooray! ▶'); stage.appendChild(ok);
        ok.onclick = () => { G.sfx('tap'); finish(); };
        later(() => {
          G.sfx('fanfare'); confetti(60, true); confetti(30);
          if (first) {
            G.S.quests = G.S.quests || {}; G.S.quests.finale = true;
            G.unlock('hat:goldcrown'); G.S.coins = (G.S.coins || 0) + 20; G.UI.gembar(); G.saveGame();
          }
          G.say(m1 + ' ' + m2, true);
        }, 900);
      };

      stage1();
    });
  };
})();

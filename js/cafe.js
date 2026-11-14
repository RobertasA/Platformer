/* Hazelnut Hollow — Twiggy Spoon Café order cards (SPEC §7.2d).
   G.CAFE.order({who, kind}) → Promise<{ok, firstTry, revealed}>. kind: count | read | money | write.
   Never fails: wrong → wobble + hint; 3rd wrong → shows the answer and still serves. ✕ closes (ok:false). */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const CAFE = G.CAFE = {};
  CAFE.KINDS = ['count', 'read', 'money', 'write'];
  CAFE.ICON = { count: '🧁', read: '📜', money: '🪙', write: '✏️' };
  const FOOD = { egg: '🥚', tea: '🍵', pie: '🥧', nut: '🥜', ham: '🍖', bun: '🥯', cup: '☕',
    cake: '🍰', milk: '🥛', soup: '🍲', toast: '🍞', honey: '🍯', apple: '🍎', pear: '🍐', bread: '🥖', cheese: '🧀' };
  CAFE.EASY = ['egg', 'tea', 'pie', 'nut', 'ham', 'bun', 'cup'];
  CAFE.HARD = ['cake', 'milk', 'soup', 'toast', 'honey', 'apple', 'pear', 'bread', 'cheese'];
  CAFE.FOOD = FOOD;
  const SUBJ = { count: 'maths', money: 'maths', read: 'words', write: 'words' };
  const numWord = n => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'][n] || String(n);

  /* plain data for an order (also used by tests) */
  CAFE.make = function (kind, lv) {
    if (kind === 'count') {
      const n = lv <= 0 ? U.irnd(2, 4) : lv === 1 ? U.irnd(3, 6) : lv === 2 ? U.irnd(5, 10) : U.irnd(5, 9);
      const more = lv >= 3, target = more ? n + 1 : n;
      return { kind, target, q: 'I would like <b>' + n + '</b> acorn cakes' + (more ? ', and <b>one more</b> for my friend' : '') + ', please!',
        say: 'I would like ' + numWord(n) + ' acorn cakes' + (more ? ', and one more for my friend' : '') + ', please!',
        hint: more ? numWord(n) + ' and one more makes ' + numWord(target) + '.' : 'Count the cakes on the plate. I need ' + numWord(n) + '.' };
    }
    if (kind === 'read') {
      const set = lv >= 2 ? CAFE.HARD : CAFE.EASY, w = U.pick(set);
      const others = U.shuffle(set.filter(x => x !== w)).slice(0, 2), choices = U.shuffle([w].concat(others));
      return { kind, word: w, choices, answer: choices.indexOf(w), q: 'Here is my order. Can you read it?', say: 'Here is my order. Can you read it?', hint: 'Sound it out: ' + w.split('').join('-') + '.' };
    }
    if (kind === 'money') {
      const price = lv <= 0 ? U.irnd(2, 5) : lv === 1 ? U.irnd(3, 10) : U.irnd(6, 20);
      const coins = lv <= 0 ? [1, 2] : lv === 1 ? [1, 2, 5] : [1, 2, 5, 10];
      const item = U.pick(['bun', 'cup of tea', 'slice of pie', 'cake', 'honey toast']);
      return { kind, price, coins, q: 'A ' + item + ' costs <b>' + price + 'p</b>. Can you help me find the coins?', say: 'A ' + item + ' costs ' + numWord(price) + ' pence. Can you help me find the coins?', hint: 'Add up the coins in the purse. We need ' + numWord(price) + ' pence.' };
    }
    const w = U.pick(CAFE.EASY);
    return { kind: 'write', word: w, mode: lv <= 0 ? 'trace' : lv === 1 ? 'fade' : 'memory', q: 'I want <b>' + (lv >= 2 ? 'a ' + FOOD[w] : w) + '</b>, please! Can you write it on your notepad?', say: 'I want ' + (w === 'egg' ? 'an' : 'a') + ' ' + w + ', please! Can you write ' + w + ' on your notepad?' };
  };
  /* greedy coins for the reveal (all coin sets include 1p) */
  CAFE.payWith = (price, coins) => { const out = []; let left = price; for (const c of coins.slice().sort((a, b) => b - a)) while (left >= c) { out.push(c); left -= c; } return out; };

  CAFE.order = function (o) {
    const kind = o.kind || 'count', subj = SUBJ[kind], lv = G.S.level[subj] || 0;
    const d = CAFE.make(kind, lv), who = G.PEOPLE[o.who] || { name: 'Customer', look: { cre: 'bear', s: 1.4 } };
    return new Promise(resolve => {
      G.paused = true;
      const ov = G.UI.overlay(true), card = U.el('div', 'card puzzle cafecard');
      const top = U.el('div', 'top');
      const face = document.createElement('canvas'); face.width = face.height = 110; face.className = 'cfface'; G.portrait(face, who.look, 1); top.appendChild(face);
      const q = U.el('div', 'q', '<small>' + who.name + '</small><br>' + d.q); top.appendChild(q);
      const spk = U.el('button', 'iconbtn', '🔊'); spk.onclick = () => G.say(d.say, true); top.appendChild(spk);
      card.appendChild(top);
      const area = U.el('div', 'cfarea'); card.appendChild(area);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      ov.appendChild(card);
      let wrong = 0, done = false, pad = null;
      const finish = r => { if (pad) pad.destroy(); G.hush(); G.UI.overlay(false); G.paused = false; resolve(r); };
      close.onclick = () => { if (done) return; done = true; G.sfx('tap'); finish({ ok: false }); };
      const success = () => {
        if (done) return; done = true;
        G.sfx('right'); G.PZ.adapt(subj, wrong === 0, false);
        hint.innerHTML = U.pick(['Yum! Thank you!', 'Delicious! Thank you!', 'Perfect! Thank you!', 'Splendid service!']) + ' 💖';
        G.say(hint.textContent.replace('💖', ''), true);
        setTimeout(() => finish({ ok: true, firstTry: wrong === 0 }), 1500);
      };
      const reveal = show => {
        done = true; G.PZ.adapt(subj, false, true);
        hint.textContent = 'Here it is! Thank you for helping.'; G.say(hint.textContent, true);
        if (show) show();
        const nx = U.el('button', 'bigbtn green', 'Serve it ▶'); nx.onclick = () => { G.sfx('tap'); finish({ ok: true, revealed: true }); }; area.appendChild(nx);
      };
      const miss = () => { wrong++; G.sfx('wrong'); const m = (wrong === 1 ? '' : 'Nearly! ') + (d.hint || 'Have another go!'); hint.textContent = m; G.say(m, true); return wrong >= 3; };

      if (kind === 'count') {
        const plate = U.el('div', 'cfplate'), tray = U.el('div', 'cftray'), serve = U.el('button', 'bigbtn green', 'Serve 🍽️');
        area.appendChild(tray); area.appendChild(plate); area.appendChild(serve);
        const put = (into, from) => { const b = U.el('button', 'cfcake', '🧁'); b.onclick = () => { if (done) return; G.sfx('pop'); b.remove(); put(from, into); }; into.appendChild(b); };
        for (let i = 0; i < Math.min(12, d.target + 3); i++) put(tray, plate);
        serve.onclick = () => {
          if (done) return;
          if (plate.children.length === d.target) { serve.remove(); success(); return; }
          plate.classList.remove('wob'); void plate.offsetWidth; plate.classList.add('wob');
          if (miss()) { serve.remove(); reveal(() => { plate.innerHTML = ''; tray.innerHTML = ''; for (let i = 0; i < d.target; i++) plate.appendChild(U.el('span', 'cfcake', '🧁')); }); }
        };
      } else if (kind === 'read') {
        area.appendChild(U.el('div', 'cfticket', d.word));
        const box = U.el('div', 'answers'); area.appendChild(box);
        const btns = d.choices.map((w, i) => {
          const b = U.el('button', 'ans', FOOD[w]); b.onclick = () => {
            if (done || b.classList.contains('dim')) return;
            if (i === d.answer) { b.classList.add('right'); success(); return; }
            b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); setTimeout(() => b.classList.add('dim'), 400);
            if (miss()) reveal(() => btns[d.answer].classList.add('right'));
          }; box.appendChild(b); return b;
        });
      } else if (kind === 'money') {
        const purse = U.el('div', 'cfpurse'), total = U.el('div', 'cftotal'), row = U.el('div', 'cfcoins'), pay = U.el('button', 'bigbtn green', 'Pay 👛');
        area.appendChild(row); area.appendChild(purse); area.appendChild(total); area.appendChild(pay);
        const sum = () => [...purse.children].reduce((a, b) => a + +b.dataset.v, 0);
        const show = () => { total.textContent = 'In the purse: ' + sum() + 'p'; };
        const coinEl = (v, onclick) => { const b = U.el('button', 'coin c' + v, v + 'p'); b.dataset.v = v; b.onclick = onclick; return b; };
        for (const v of d.coins) row.appendChild(coinEl(v, () => {
          if (done || purse.children.length >= 14) return; G.sfx('coin');
          const c = coinEl(v, () => { if (done) return; G.sfx('tap'); c.remove(); show(); }); purse.appendChild(c); show();
        }));
        show();
        pay.onclick = () => {
          if (done) return;
          if (sum() === d.price) { pay.remove(); success(); return; }
          purse.classList.remove('wob'); void purse.offsetWidth; purse.classList.add('wob');
          if (miss()) { pay.remove(); reveal(() => { purse.innerHTML = ''; for (const v of CAFE.payWith(d.price, d.coins)) purse.appendChild(coinEl(v, null)); show(); }); }
        };
      } else {
        area.appendChild(U.el('div', 'cfpic', FOOD[d.word]));
        const holder = U.el('div', 'pad'); area.appendChild(holder);
        pad = G.HW.mount(holder, {
          text: d.word, mode: d.mode, tolerance: G.S.settings.writeTol || 1, leftHanded: !!G.S.settings.leftHanded,
          onCoach: m => { hint.textContent = m; },
          onResult: r => { if (!r.ok) wrong = 1; success(); },
        });
      }
      setTimeout(() => G.say(d.say, true), 250);
    });
  };
})();

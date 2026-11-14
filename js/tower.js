/* Hazelnut Hollow — Teapot Tower (SPEC §7.2g): curios, odd-shoes memory, postcards, detective case, cabinet.
   G.TOWER.shoes() / postcard() / cabinet() → Promise; G.TOWER.case() → async. */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const TW = G.TOWER = {};

  TW.CURIOS = [
    { id: 'shell', icon: '🐚', name: 'shell' }, { id: 'key', icon: '🗝️', name: 'key' }, { id: 'feather', icon: '🪶', name: 'feather' },
    { id: 'compass', icon: '🧭', name: 'compass' }, { id: 'marble', icon: '🔮', name: 'marble' }, { id: 'fossil', icon: '🦴', name: 'fossil' },
  ];
  const cur = () => G.S.curios || (G.S.curios = {});
  TW.curioCount = () => TW.CURIOS.filter(c => cur()[c.id]).length;

  TW.pickCurio = function (id) {
    const c = TW.CURIOS.find(x => x.id === id);
    if (!c || cur()[id]) return false;
    cur()[id] = true; G.sfx('gem');
    G.UI.toast('You found a ' + c.name + '! ' + c.icon, true); G.saveGame();
    return true;
  };

  TW.tuftLines = function () {
    const n = TW.curioCount(), Q = G.S.quests || {};
    if (Q.curios) return ['Thank you, friend. Little Tuft wants to come with you!', 'Look for it in the dressing-up cottage.'];
    if (n >= 6) return ['You found all six curios!', 'Put them in the cabinet on the balcony.', 'Go all the way up!'];
    if (n === 0 && !Q.shoes && !Q.post && !Q.case) return ['Oh! Hello. I am Mr Tuft. I am a bit shy.', 'I collect curios. Six are hidden in my tower. Can you find them?', 'Take them up to the cabinet on the balcony!'];
    const lines = ['You have found ' + n + ' curio' + (n === 1 ? '' : 's') + '!', (6 - n) + ' more to find. Look on every floor!'];
    if (!Q.shoes || !Q.post || !Q.case) lines.push('Try the shoes, the postcards and the secret case too.');
    else lines.push('Take them up to the cabinet on the balcony!');
    return lines;
  };

  /* shared card shell */
  const open = (cls) => {
    G.paused = true;
    const ov = G.UI.overlay(true), card = U.el('div', 'card puzzle twcard ' + cls);
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

  /* ---------- odd shoes (memory pairs) ---------- */
  const SHOES = ['👟', '👞', '👠', '🥾', '👡', '🩰', '🧦', '🩴'];
  TW.shoes = function () {
    const lv = G.S.level.patterns || 0, pairs = lv <= 0 ? 3 : lv === 1 ? 4 : 6;
    const deck = U.shuffle(U.shuffle(SHOES.slice()).slice(0, pairs).flatMap(s => [s, s]));
    return new Promise(resolve => {
      const card = open('shoecard'), ask = 'Odd shoes! Find the pairs.';
      topBar(card, ask, () => ask);
      const grid = U.el('div', 'shoegrid cols' + (pairs === 3 ? 3 : pairs === 4 ? 4 : 6)); card.appendChild(grid);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      let first = null, lock = false, misses = 0, streak = 0, matched = 0, done = false;
      const finish = () => { shut(); resolve(); };
      close.onclick = () => { G.sfx('tap'); G.saveGame(); finish(); };
      const win = () => {
        done = true; G.PZ.adapt('patterns', misses <= pairs, false);
        let msg;
        if (!G.S.quests.shoes) { G.S.quests.shoes = true; G.S.gems.purple++; G.sfx('fanfare'); G.UI.flyGem('purple', 640, 300); msg = 'All the pairs! Here is a purple gem.'; }
        else { G.S.coins += 2; G.UI.gembar(); G.sfx('coin'); msg = 'Great matching! +2 🪙'; }
        hint.textContent = msg; G.say(msg.replace('🪙', 'coins'), true); G.saveGame();
        const ok = U.el('button', 'bigbtn green', 'Done ▶'); ok.onclick = () => { G.sfx('tap'); finish(); }; card.appendChild(ok);
      };
      const cards = deck.map(s => {
        const b = U.el('button', 'shoe', '<span class="bk">❓</span><span class="fc">' + s + '</span>'); b.s = s;
        b.onclick = () => {
          if (lock || done || b.classList.contains('up')) return;
          b.classList.add('up'); G.sfx('pop');
          if (!first) { first = b; return; }
          const a = first; first = null;
          if (a.s === b.s) {
            a.classList.add('got'); b.classList.add('got'); G.sfx('right'); streak = 0;
            if (++matched === pairs) setTimeout(win, 600);
          } else {
            misses++; streak++; lock = true; G.sfx('wrong');
            setTimeout(() => { a.classList.add('wob'); b.classList.add('wob'); }, 250);
            setTimeout(() => {
              a.classList.remove('up', 'wob'); b.classList.remove('up', 'wob'); lock = false;
              if (streak >= 4) {
                streak = 0;
                const left = cards.filter(c => !c.classList.contains('got')), k = left.find(c => left.some(o => o !== c && o.s === c.s));
                if (k) {
                  const two = left.filter(c => c.s === k.s); two.forEach(c => c.classList.add('peek'));
                  hint.textContent = 'Look! These two match.'; G.say(hint.textContent, true);
                  setTimeout(() => { two.forEach(c => c.classList.remove('peek')); if (hint.textContent === 'Look! These two match.') hint.textContent = ''; }, 1200);
                }
              }
            }, 900);
          }
        };
        grid.appendChild(b); return b;
      });
      setTimeout(() => G.say(ask, true), 250);
    });
  };

  /* ---------- postcards ---------- */
  const POST = [
    { from: 'Granny', pic: '🏖️', text: 'I am at the sea. I can see a crab.', q: 'What can Granny see?', choices: ['🦀', '🐄', '🚂'], answer: 0, word: 'crab', hint: 'Read it again: I can see a …' },
    { from: 'Uncle Bo', pic: '⛺', text: 'I am in a tent. I have a red hat.', q: 'What has Uncle Bo got?', choices: ['🎩', '🧢', '👟'], answer: 1, word: 'hat', hint: 'Read it again: I have a red …' },
    { from: 'Auntie Pip', pic: '🏡', text: 'I am on a farm. I can pat a pig.', q: 'What can Auntie Pip pat?', choices: ['🐷', '🐶', '🐱'], answer: 0, word: 'pig', hint: 'Read it again: I can pat a …' },
    { from: 'Cousin Fern', pic: '🏝️', text: 'It is hot. I sit in the sun.', q: 'Where does Fern sit?', choices: ['🌧️', '☀️', '❄️'], answer: 1, word: 'sun', hint: 'Read it again: I sit in the …' },
    { from: 'Grandpa', pic: '🏞️', text: 'I went for a walk. I met a big dog.', q: 'Who did Grandpa meet?', choices: ['🐕', '🐘', '🐸'], answer: 0, word: 'dog', hint: 'Read it again: I met a big …' },
    { from: 'Nana Rose', pic: '🏙️', text: 'I am in a town. I got on a bus.', q: 'What did Nana get on?', choices: ['🚲', '🚌', '🐴'], answer: 1, word: 'bus', hint: 'Read it again: I got on a …' },
  ];
  TW.POSTCARDS = POST;
  TW.postcard = function () {
    const d = U.pick(POST);
    return new Promise(resolve => {
      const card = open('postcardcard');
      const q = topBar(card, d.q, () => d.q);
      const pc = U.el('div', 'postcard'); pc.innerHTML = '<span class="stamp">💌</span><div class="pic">' + d.pic + '</div><div class="ptext">' + d.text + '</div><div class="from">From ' + d.from + '</div>';
      card.appendChild(pc);
      const area = U.el('div', 'answers'); card.appendChild(area);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      let wrong = 0, done = false, pad = null, revealed = false;
      const finish = () => { shut(() => { if (pad) { pad.destroy(); pad = null; } }); resolve(); };
      close.onclick = () => { if (done) return; done = true; G.sfx('tap'); G.saveGame(); finish(); };
      const reward = () => {
        done = true; G.sfx('right');
        G.PZ.adapt('words', wrong === 0 && !revealed, revealed);
        let msg;
        if (!G.S.quests.post) { G.S.quests.post = true; G.S.gems.blue++; G.sfx('fanfare'); G.UI.flyGem('blue', 640, 300); msg = 'What a lovely letter! Here is a blue gem.'; }
        else { G.S.coins += 2; G.UI.gembar(); G.sfx('coin'); msg = 'What a lovely letter! +2 🪙'; }
        hint.textContent = msg; G.say(msg.replace('🪙', 'coins'), true); G.saveGame();
        const ok = U.el('button', 'bigbtn green', 'Done ▶'); ok.onclick = () => { G.sfx('tap'); finish(); }; card.appendChild(ok);
      };
      const step2 = () => {
        area.innerHTML = ''; pc.classList.add('small'); hint.textContent = '';
        q.innerHTML = 'Write back! Write <b>' + d.word + '</b>.';
        const say2 = 'Write back! Write ' + d.word + '.'; G.say(say2, true);
        card.querySelector('.iconbtn').onclick = () => G.say(say2, true);
        const holder = U.el('div', 'pad'); area.appendChild(holder); area.classList.add('writing');
        pad = G.HW.mount(holder, {
          text: d.word, mode: 'fade', tolerance: G.S.settings.writeTol || 1, leftHanded: !!G.S.settings.leftHanded,
          onCoach: m => { hint.textContent = m; },
          onResult: r => { if (done) return; if (r && r.ok === false) wrong = Math.max(wrong, 1); reward(); },
        });
      };
      const btns = d.choices.map((ch, i) => {
        const b = U.el('button', 'ans', ch); b.onclick = () => {
          if (done || b.classList.contains('dim')) return;
          if (i === d.answer) { b.classList.add('right'); G.sfx('right'); done = true; setTimeout(() => { done = false; step2(); }, 700); return; }
          wrong++; G.sfx('wrong'); retrigger(b, 'wrong'); setTimeout(() => b.classList.add('dim'), 400);
          const m = (wrong > 1 ? 'Nearly! ' : '') + d.hint; hint.textContent = m; G.say(m, true);
          if (wrong >= 3 || btns.filter(x => !x.classList.contains('dim')).length <= 2) {
            revealed = true; done = true; btns[d.answer].classList.add('right');
            setTimeout(() => { done = false; step2(); }, 1100);
          }
        }; area.appendChild(b); return b;
      });
      setTimeout(() => G.say(d.text + ' ' + d.q, true), 250);
    });
  };

  /* ---------- detective case ---------- */
  let busy = false;
  TW.case = async function () {
    if (busy) return; busy = true;
    try {
      await G.UI.talk(G.PEOPLE.tuft, ['Shh! A secret case. Crack three codes!']);
      for (let i = 0; i < 3; i++) {
        const r = await G.PZ.run({ colour: 'purple', subject: 'patterns' });
        if (!r || !r.ok) { G.UI.toast('Come back any time! 🕵️'); return; }
      }
      if (!G.S.quests.case) {
        G.S.quests.case = true; G.unlock('hat:detective'); G.S.gems.yellow++; G.sfx('fanfare'); G.UI.flyGem('yellow', 640, 300);
        await G.UI.talk(G.PEOPLE.tuft, ['Case cracked! You are a real detective.', 'Here is a detective hat and a yellow gem!']);
      } else {
        G.S.coins += 2; G.UI.gembar(); G.sfx('coin'); G.UI.toast('Case cracked! +2 🪙', true);
      }
      G.saveGame();
    } finally { busy = false; }
  };

  /* ---------- curio cabinet ---------- */
  TW.cabinet = function () {
    return new Promise(resolve => {
      const n = TW.curioCount();
      const card = open('cabinet');
      card.appendChild(U.el('h2', 'cabtitle', '🗄️ Curio cabinet <small>' + n + ' of 6</small>'));
      const grid = U.el('div', 'cubgrid'); card.appendChild(grid);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      close.onclick = () => { G.sfx('tap'); G.saveGame(); shut(); resolve(); };
      for (const c of TW.CURIOS) {
        const have = !!cur()[c.id];
        const b = U.el('button', 'cubby' + (have ? '' : ' unk'), have ? '<span class="ci">' + c.icon + '</span><span class="cn">' + c.name + '</span>' : '<span class="ci">?</span>');
        b.onclick = () => {
          G.sfx('pop');
          const m = have ? 'A ' + c.name + '!' : 'Not found yet. Look on every floor!';
          hint.textContent = m; G.say(m, true);
        };
        grid.appendChild(b);
      }
      let msg = 'Find all six curios!';
      if (n >= 6 && !G.S.quests.curios) {
        G.S.quests.curios = true; G.unlock('pet:tuft'); G.S.gems.green++; G.sfx('fanfare'); G.UI.flyGem('green', 640, 300);
        msg = 'All six! A little Tuft wants to be your pet. Find it in the dressing-up cottage!'; G.saveGame();
      } else if (n >= 6) msg = 'All six! What a lovely collection.';
      hint.textContent = msg; setTimeout(() => G.say(msg, true), 250);
    });
  };
})();

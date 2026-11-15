/* Hazelnut Hollow — puzzle shell (SPEC §6). A modal card that renders a curriculum puzzle and never fails:
   wrong → wobble + hint; 2nd wrong → hint again; 3rd wrong → shows the answer and still awards the gem.
   G.PZ.run({colour, subject, level?, puzzle?}) → Promise<{ok, firstTry, revealed}>  (ok=false only if closed with ✕) */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const PZ = G.PZ = {};
  const recent = [];

  PZ.maxLevel = () => { const y = G.S.settings.year; return y === 1 ? 2 : 4; };
  PZ.adapt = function (subj, firstTry, revealed) {
    const S = G.S;
    if (firstTry) { S.streak[subj] = (S.streak[subj] || 0) + 1; if (S.streak[subj] >= 3) { S.level[subj] = Math.min(PZ.maxLevel(), S.level[subj] + 1); S.streak[subj] = 0; } }
    else { S.streak[subj] = 0; if (revealed) S.level[subj] = Math.max(0, S.level[subj] - 1); }
    G.saveGame();
  };

  PZ.make = function (subject, level) {
    if (!G.CURR) return { key: 'none', q: 'What is 1 + 1?', say: 'What is one plus one?', type: 'choice', choices: ['1', '2', '3'], answer: 1, hint: 'Hold up one finger, then one more.' };
    return G.CURR.make(subject, level, { avoid: recent });
  };

  PZ.run = function (o) {
    const subject = o.subject || G.GEM_INFO[o.colour].subj, colour = o.colour || G.GEMS.find(c => G.GEM_INFO[c].subj === subject);
    const level = o.level !== undefined ? o.level : G.S.level[subject];
    let p = o.puzzle || PZ.make(subject, level);
    if (p.type === 'write' && !G.HW) p = PZ.make(subject, level === 0 ? 1 : level);   // safety: no pad loaded
    if (p.key) { recent.push(p.key); if (recent.length > 30) recent.shift(); }
    const info = G.GEM_INFO[colour];
    return new Promise(resolve => {
      G.paused = true;
      const ov = G.UI.overlay(true);
      const card = U.el('div', 'card puzzle'); card.style.setProperty('--pc', info.col);
      const top = U.el('div', 'top');
      top.appendChild(U.el('div', '', G.gemSVG(colour, 54)));
      const q = U.el('div', 'q', p.q); top.appendChild(q);
      const spk = U.el('button', 'iconbtn', '🔊'); spk.onclick = () => G.say(p.say || q.textContent, true); top.appendChild(spk);
      card.appendChild(top);
      if (p.html) card.appendChild(U.el('div', 'vis', p.html));
      const area = U.el('div', ''); area.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:14px;width:100%';
      card.appendChild(area);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      ov.appendChild(card);
      let wrong = 0, done = false, pad = null;
      const finish = ok => { if (pad) pad.destroy(); G.hush(); G.UI.overlay(false); G.paused = false; resolve(ok); };
      close.onclick = () => { if (done) return; done = true; G.sfx('tap'); finish({ ok: false }); };

      /* praise names what she did, never what she is (#1); tier = how well a write puzzle was formed (#2) */
      const success = tier => {
        if (done) return; done = true;
        if (!o.noAdapt) PZ.adapt(subject, wrong === 0, false);
        let line;
        if (tier === 'forced') { G.sfx('pop'); line = "Let's do that one again soon."; }
        else if (tier === 'ok') { G.sfx('right'); line = 'Good try! Next time, start at the green dot.'; for (let i = 0; i < 5; i++) sparkle(card); }
        else {
          G.sfx('right'); G.sfx('fanfare'); confetti(card, info.col);
          line = (tier === 'good' ? U.pick(['You started in the right place!', 'You went the right way round!', 'You kept it on the line!'])
            : wrong > 0 ? 'You kept trying!' : p.type === 'order' ? 'You put them in order!' : U.pick(PZ.PRAISE[subject] || PZ.PRAISE.any)) + ' ⭐';
        }
        hint.innerHTML = line;
        G.say(line.replace('⭐', '') + ' ' + (tier ? '' : p.explain || ''), true);
        setTimeout(() => finish({ ok: true, firstTry: wrong === 0 }), tier === 'ok' || tier === 'forced' ? 2200 : 1500);
      };
      const reveal = showAnswer => {
        done = true; if (!o.noAdapt) PZ.adapt(subject, false, true);
        hint.textContent = 'Here it is! ' + (p.explain || '') + ' You still get the gem.';
        G.say(hint.textContent, true);
        if (showAnswer) showAnswer();
        const nx = U.el('button', 'bigbtn green', 'Keep the gem ▶'); nx.onclick = () => { G.sfx('tap'); finish({ ok: true, revealed: true }); };
        area.appendChild(nx);
      };
      /* hint ladder (#3): 1st miss = the cue; 2nd = more help (p.hint2, or `help()` takes a wrong answer away / places the first tile); 3rd = reveal */
      const miss = help => {
        wrong++; G.sfx('wrong');
        let msg = p.hint || 'Have another go!';
        if (wrong === 2) { const did = help ? help() : ''; msg = p.hint2 || PZ.demo(p) || ('Nearly! ' + (did ? did + ' ' : '') + (p.hint || 'Try again.')); }
        hint.textContent = msg; G.say(msg, true);
        return wrong >= 3;
      };

      if (p.type === 'choice') {
        const box = U.el('div', 'answers'); area.appendChild(box);
        const btns = p.choices.map((ch, i) => {
          const b = U.el('button', 'ans' + (String(ch).replace(/<[^>]*>/g, '').length > 4 ? ' small' : ''), ch);
          b.onclick = () => {
            if (done || b.classList.contains('dim')) return;
            if (i === p.answer) { b.classList.add('right'); success(); }
            else {
              b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); setTimeout(() => b.classList.add('dim'), 400);
              const takeAway = () => { const left = btns.filter((x, k) => k !== p.answer && x !== b && !x.classList.contains('dim')); if (left.length < 2) return ''; U.pick(left).classList.add('dim'); return 'I took one away.'; };
              if (miss(takeAway)) reveal(() => btns[p.answer].classList.add('right'));
            }
          };
          box.appendChild(b); return b;
        });
      } else if (p.type === 'order') {
        const slots = U.el('div', 'slots'), box = U.el('div', 'answers'); area.appendChild(slots); area.appendChild(box);
        const picked = []; let locked = 0;
        const sl = p.solution.map(() => { const s = U.el('div', 'slot'); slots.appendChild(s); return s; });
        const tiles = p.tiles.map((tx, i) => { const b = U.el('button', 'ans' + (String(tx).length > 4 ? ' small' : ''), tx); b.onclick = () => tap(i, b); box.appendChild(b); return b; });
        const render = () => sl.forEach((s, i) => { s.innerHTML = picked[i] !== undefined ? p.tiles[picked[i]] : ''; s.classList.toggle('full', picked[i] !== undefined); });
        sl.forEach((s, i) => s.onclick = () => { if (done || picked[i] === undefined || i < locked) return; tiles[picked[i]].classList.remove('dim'); picked.splice(i, 1); render(); G.sfx('tap'); });
        function tap(i, b) {
          if (done || b.classList.contains('dim')) return;
          picked.push(i); b.classList.add('dim'); G.sfx('pop'); render();
          if (picked.length < p.solution.length) return;
          const ok = picked.every((ti, k) => String(p.tiles[ti]) === String(p.solution[k]));
          if (ok) { sl.forEach(s => s.style.background = '#b6f5c9'); success(); return; }
          if (miss(() => { locked = 1; return 'I put the first one in for you.'; })) { reveal(() => { sl.forEach((s, k) => { s.innerHTML = p.solution[k]; s.style.background = '#b6f5c9'; }); }); return; }
          setTimeout(() => {
            picked.length = 0; tiles.forEach(t => t.classList.remove('dim'));
            if (locked) { const fi = p.tiles.findIndex(tx => String(tx) === String(p.solution[0])); picked.push(fi); tiles[fi].classList.add('dim'); }
            render(); if (locked) sl[0].style.background = '#b6f5c9';
          }, 700);
        }
      } else if (p.type === 'write') {
        const holder = U.el('div', 'pad'); area.appendChild(holder);
        pad = G.HW.mount(holder, {
          text: p.write.text, mode: p.write.mode, tolerance: G.S.settings.writeTol || 1, leftHanded: !!G.S.settings.leftHanded,
          onCoach: m => { hint.textContent = m; },
          onResult: r => {
            const hw = G.S.handwriting = G.S.handwriting || {};
            for (const pc of (r.perChar || [])) { const h = hw[pc.ch] = hw[pc.ch] || { best: 0, tries: 0 }; h.tries++; h.best = Math.max(h.best, pc.score || 0); }
            if (!r.ok) wrong = 1;
            const forcedCh = (r.perChar || []).filter(pc => pc.issue).map(pc => pc.ch);
            if (forcedCh.length) { const q = G.S.hwQueue = G.S.hwQueue || []; for (const ch of forcedCh) if (!q.includes(ch)) q.push(ch); if (q.length > 12) q.splice(0, q.length - 12); }
            success(!r.ok ? 'forced' : r.score >= 0.85 ? 'good' : 'ok');
          },
        });
      }
      setTimeout(() => G.say(p.say || q.textContent, true), 250);
    });
  };

  /* a worked demonstration for the commonest puzzles, used as the second hint when the puzzle has no hint2 of its own */
  PZ.demo = function (p) {
    const q = String(p.q || '').replace(/<[^>]+>/g, ''), seq = (a, b) => { const o = []; for (let i = a; a < b ? i <= b : i >= b; i += a < b ? 1 : -1) o.push(i); return o.join(', '); };
    let m;
    if ((m = q.match(/^What is (\d+) \+ (\d+)\?/))) { const a = Math.max(+m[1], +m[2]), b = Math.min(+m[1], +m[2]); return b === 0 ? 'Adding zero changes nothing.' : b > 10 ? '' : 'Start at ' + a + '. Count on ' + b + ': ' + seq(a + 1, a + b) + '.'; }
    if ((m = q.match(/^What is (\d+) − (\d+)\?/))) { const a = +m[1], b = +m[2]; return b === 0 ? 'Taking away zero changes nothing.' : b > 10 ? '' : 'Start at ' + a + '. Count back ' + b + ': ' + seq(a - 1, a - b) + '.'; }
    if ((m = q.match(/^(\d+) \+ \? = (\d+)/))) { const a = +m[1], c = +m[2]; return c - a < 1 || c - a > 10 ? '' : 'Start at ' + a + '. Count up to ' + c + ': ' + seq(a + 1, c) + '. How many did you count?'; }
    if ((m = q.match(/^What sound does (\w+) start with\?/))) { const w = m[1], snd = G.HW && G.HW.SOUND[w[0].toLowerCase()]; return snd ? 'Listen: ' + snd + ', ' + snd + ', ' + w + '.' : ''; }
    return '';
  };
  PZ.PRAISE = {
    maths: ['You worked it out!', 'You counted carefully!'], words: ['You sounded it out!', 'You read it carefully!'],
    nature: ['You thought about it!', 'You looked carefully!'], shapes: ['You looked carefully!', 'You checked it!'],
    patterns: ['You spotted the pattern!', 'You looked carefully!'], any: ['You did it!', 'You looked carefully!'],
  };
  function sparkle(card) { const s = U.el('div', '', '✨'); s.style.cssText = 'position:absolute;left:' + U.irnd(30, 70) + '%;top:' + U.irnd(25, 60) + '%;font-size:30px;pointer-events:none;transition:transform .8s,opacity .8s;'; card.appendChild(s); requestAnimationFrame(() => requestAnimationFrame(() => { s.style.transform = 'translateY(-50px) scale(1.4)'; s.style.opacity = '0'; })); }
  function confetti(card, col) {
    for (let i = 0; i < 24; i++) {
      const s = U.el('div', ''); const a = Math.random() * Math.PI * 2, d = U.rnd(120, 380);
      s.textContent = U.pick(['⭐', '✨', '💖', '🌟']);
      s.style.cssText = 'position:absolute;left:50%;top:40%;font-size:' + U.irnd(22, 40) + 'px;pointer-events:none;transition:transform .9s cubic-bezier(.2,.8,.3,1),opacity .9s;';
      card.appendChild(s);
      requestAnimationFrame(() => requestAnimationFrame(() => { s.style.transform = 'translate(' + Math.cos(a) * d + 'px,' + Math.sin(a) * d * 0.6 + 'px) rotate(' + U.irnd(-90, 90) + 'deg)'; s.style.opacity = '0'; }));
    }
  }
})();

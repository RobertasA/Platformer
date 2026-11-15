/* Hazelnut Hollow — handwriting lessons (SPEC §7.3). A "letter tree" or "word stone" in Writing Wood runs a short
   chain of write-puzzles. Mode per letter follows the ladder trace → fade → memory using S.handwriting[ch].best.
   G.LS.run(e) where e = {id, title, say, letters?:'cadg', words?:[['cat','🐱'],...], sentences?:[['I can run.','🏃'],...], gem?:'blue'} */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const LS = G.LS = {};
  /* ladder: trace → fade → copy → memory (#7); a letter in the come-back queue never gets memory (#6) */
  LS.modeFor = ch => {
    const h = (G.S.handwriting || {})[ch], b = h ? h.best : 0, queued = LS.queue().some(q => q.ch === ch);
    if (b >= 0.85 && h.tries >= 3) return (h.copied || 0) >= 2 && !queued ? 'memory' : 'copy';
    return b >= 0.7 ? 'fade' : 'trace';
  };
  LS.today = () => new Date().toDateString();
  LS.queue = () => { const q = G.S.hwQueue = (G.S.hwQueue || []).map(x => typeof x === 'string' ? { ch: x, stage: 0, day: '' } : x); return q; };
  LS.due = () => LS.queue().filter(q => q.stage === 0 || q.day !== LS.today()).map(q => q.ch);
  /* after a letter is written: join the queue if it went badly, step through it if it went well */
  LS.note = function (ch, score, forced) {
    const q = LS.queue(), i = q.findIndex(x => x.ch === ch), good = !forced && score >= 0.7;
    if (!good) { if (i < 0) { q.push({ ch, stage: 0, day: '' }); if (q.length > 12) q.shift(); } else { q[i].stage = 0; q[i].day = ''; } return; }
    if (i < 0) return;
    if (q[i].stage === 0) { q[i].stage = 1; q[i].day = LS.today(); }
    else if (q[i].day !== LS.today()) q.splice(i, 1);
  };
  const VERB = { trace: 'Trace', fade: 'Trace', copy: 'Copy', memory: 'Write' };
  LS.done = id => !!(G.S.quests['lesson:' + id]);

  LS.run = async function (e) {
    if (LS.busy) return; LS.busy = true;
    try {
      await G.UI.talk(G.PEOPLE.quill, [e.say]);
      const steps = [];
      if (e.letters) {
        const due = LS.due(), fam = U.shuffle(e.letters.split(''));
        const pool = fam.filter(ch => due.includes(ch)).concat(fam.filter(ch => !due.includes(ch))).slice(0, 4);
        for (const ch of pool) {
          const m = LS.modeFor(ch);
          steps.push({ q: VERB[m] + ' the letter <b>' + ch + '</b>', say: VERB[m] + ' the letter ' + ch + '.' + (m === 'copy' ? ' Look at it, then write your own.' : ''), write: { text: ch, mode: m } });
        }
      } else if (e.words) {
        U.shuffle(e.words).slice(0, 3).forEach(([w, pic], i) => {
          const m = ['trace', 'fade', 'copy'][i] || 'fade';
          steps.push({ q: pic + (m === 'copy' ? ' Copy <b>' : ' Write <b>') + w + '</b>', say: 'Write the word ' + w + '. ' + w.split('').join(', ') + '.', write: { text: w, mode: m } });
        });
      } else if (e.sentences) {
        U.shuffle(e.sentences).slice(0, 2).forEach(([t, pic], i) => {
          steps.push({ q: pic + ' Write <b>' + t + '</b><br><small>Capital letter, finger spaces, full stop!</small>', say: 'Write: ' + t.replace('.', '') + '. Start with a capital letter. Leave finger spaces. Finish with a full stop.', write: { text: t, mode: i === 0 ? 'trace' : 'fade' } });
        });
      }
      let n = 0;
      for (const s of steps) {
        const r = await G.PZ.run({ colour: 'blue', subject: 'words', puzzle: Object.assign({ key: 'hw:' + s.write.text, type: 'write', hint: 'Start at the green dot.' }, s), noAdapt: true });
        if (!r.ok) break;
        n++;
      }
      if (n < steps.length) { G.UI.toast('Come back any time! ✏️'); return; }
      const first = !LS.done(e.id);
      G.S.quests['lesson:' + e.id] = (G.S.quests['lesson:' + e.id] || 0) + 1;
      if (first) {
        G.S.gems[e.gem || 'blue']++; G.sfx('fanfare'); G.UI.flyGem(e.gem || 'blue', e.px - G.E.cam.x, e.py - 150 - G.E.cam.y);
        await G.UI.talk(G.PEOPLE.quill, ['Shiver me timbers, what lovely writing! Here is a gem for you.']);
      } else {
        G.S.coins += 2; G.UI.gembar(); G.sfx('coin'); G.UI.toast('Great practice! +2 🪙', true);
      }
      G.saveGame();
    } finally { LS.busy = false; }
  };
})();

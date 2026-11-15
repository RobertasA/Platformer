/* Hazelnut Hollow — grown-up moments (SPEC §7.2m): her kept ink and the "Show a grown-up" gallery (#5),
   today's doings and a question to ask (#5), and a cosy place to stop (#10). */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const GM = G.GM = {};
  const day = () => new Date().toDateString();
  const $ = q => document.querySelector(q);

  GM.today = function () {
    const S = G.S;
    if (!S.today || S.today.day !== day()) S.today = { day: day(), letters: {}, words: [], puzzles: 0, subj: {}, play: 0 };
    return S.today;
  };
  GM.did = function (kind, v) {
    const t = GM.today();
    if (kind === 'puzzle') { t.puzzles++; t.subj[v] = (t.subj[v] || 0) + 1; }
    else if (kind === 'play') t.play++;
    GM.restDue = true;
  };
  /* called with every write-puzzle result: count it for today, and keep her best ink of each text */
  GM.wrote = function (text, r) {
    const t = GM.today(), S = G.S;
    for (const pc of (r.perChar || [])) if (/[a-zA-Z0-9]/.test(pc.ch)) t.letters[pc.ch] = (t.letters[pc.ch] || 0) + 1;
    if (/^[A-Za-z]{2,}/.test(text) && !t.words.includes(text)) { t.words.push(text); if (t.words.length > 12) t.words.shift(); }
    if (!r.ok || !r.ink || !r.ink.length) return;
    const inks = S.inks = S.inks || [], i = inks.findIndex(x => x.t === text);
    const e = { t: text, sc: Math.round(r.score * 100) / 100, w: r.tw || 100, k: r.ink.map(st => [].concat.apply([], st.filter((q, j) => j === 0 || j === st.length - 1 || Math.hypot(q[0] - st[j - 1][0], q[1] - st[j - 1][1]) >= 0 && j % Math.max(1, Math.ceil(st.length / 60)) === 0))), d: day() };
    if (i >= 0) { if (e.sc >= inks[i].sc) { inks.splice(i, 1); inks.push(e); } }
    else { inks.push(e); if (inks.length > 24) inks.shift(); }
  };

  GM.inkCanvas = function (e, w, h) {
    const cv = U.el('canvas'); cv.width = w * 2; cv.height = h * 2; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const c = cv.getContext('2d'); c.scale(2, 2);
    const s = Math.min((w - 16) / e.w, (h - 12) / 150), x0 = (w - e.w * s) / 2, base = 6 + 104 * s, X = x => x0 + x * s, Y = y => base - y * s;
    c.strokeStyle = '#bcd8f0'; c.lineWidth = 1; for (const y of [100, 50]) { c.beginPath(); c.moveTo(4, Y(y)); c.lineTo(w - 4, Y(y)); c.stroke(); }
    c.strokeStyle = '#f0627e'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(4, Y(0)); c.lineTo(w - 4, Y(0)); c.stroke();
    c.strokeStyle = '#16a34a'; c.fillStyle = '#16a34a'; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = Math.max(2.5, 7 * s);
    for (const st of e.k) {
      if (st.length < 4) { c.beginPath(); c.arc(X(st[0]), Y(st[1]), c.lineWidth * 0.7, 0, 6.3); c.fill(); continue; }
      c.beginPath(); for (let i = 0; i < st.length; i += 2) i ? c.lineTo(X(st[i]), Y(st[i + 1])) : c.moveTo(X(st[i]), Y(st[i + 1])); c.stroke();
    }
    return cv;
  };

  GM.showcase = function () {
    G.paused = true;
    const S = G.S, ov = G.UI.overlay(true), card = U.el('div', 'card showcase');
    card.appendChild(U.el('h2', '', 'Look what I wrote! ✏️'));
    const inks = (S.inks || []).slice().reverse(), grid = U.el('div', 'shgrid'); card.appendChild(grid);
    for (const e of inks) { const cell = U.el('div', 'shcell'); cell.appendChild(GM.inkCanvas(e, e.t.length > 1 ? 250 : 120, 120)); cell.appendChild(U.el('div', 'shname', e.t)); grid.appendChild(cell); }
    if (!inks.length) grid.appendChild(U.el('p', 'shempty', 'Write in Writing Wood and your writing will live here!'));
    const bugs = G.MEAD ? G.MEAD.count() : 0, cur = G.TOWER && G.TOWER.curioCount ? G.TOWER.curioCount() : 0, ps = S.playsets || {}, pics = ps.art && ps.art.gallery ? ps.art.gallery.length : 0;
    const row = [];
    if (bugs) row.push('🐞 ' + bugs + (bugs === 1 ? ' bug found' : ' bugs found'));
    if (cur) row.push('🏺 ' + cur + (cur === 1 ? ' curio found' : ' curios found'));
    if (pics) row.push('🎨 ' + pics + (pics === 1 ? ' picture saved' : ' pictures saved'));
    if (row.length) card.appendChild(U.el('div', 'shrow', row.join(' &nbsp;·&nbsp; ')));
    const close = U.el('button', 'closex', '✕'); close.onclick = () => { G.sfx('tap'); G.UI.overlay(false); G.paused = false; }; card.appendChild(close);
    ov.appendChild(card);
    G.say(inks.length ? 'Look what I wrote!' : 'Write in Writing Wood and your writing will live here!', true);
  };
  let offerT = 0;
  GM.offerShow = function () {
    let b = $('#showgrown');
    if (!b) { b = U.el('button', 'bigbtn small alt', 'Show a grown-up! 👀'); b.id = 'showgrown'; b.onclick = () => { G.sfx('tap'); b.classList.add('hidden'); GM.showcase(); }; $('#hud').appendChild(b); }
    b.classList.remove('hidden'); clearTimeout(offerT); offerT = setTimeout(() => b.classList.add('hidden'), 12000);
  };

  /* ---------- grown-ups page: today + a question to ask ---------- */
  GM.ASK = {
    nature: ['Ask her how many legs a spider has. (Eight.)', 'Ask her what a caterpillar turns into. (A butterfly.)', 'Ask her what a baby frog is called. (A tadpole.)', 'Ask her what plants need to grow. (Water and light.)'],
    maths: ['Ask her what 5 and 5 make. (Ten.)', 'Ask her to count on from 8 to 12.', 'Ask her what is one less than 7. (Six.)', 'Ask her to count in twos to ten.'],
    words: ['Ask her for a word that rhymes with cat.', 'Ask her what sound “ship” starts with. (sh.)', 'Ask her to spell “dog”.', 'Ask her to say the sounds in “sun”. (s, u, n.)'],
    shapes: ['Ask her how many sides a triangle has. (Three.)', 'Ask her which coin is worth more, 2p or 5p. (5p.)', 'Ask her to find a circle in the room.', 'Ask her what half past three looks like on a clock.'],
    patterns: ['Ask her what comes next: red, blue, red, blue… (Red.)', 'Ask her what comes next: 2, 4, 6… (Eight.)', 'Clap a pattern and ask her to copy it.', 'Ask her to make a pattern with spoons and forks.'],
  };
  GM.question = function () {
    const t = GM.today(), ls = Object.keys(t.letters).filter(ch => /[a-z]/.test(ch)).sort((a, b) => t.letters[b] - t.letters[a]);
    if (ls.length) return 'Ask her to show you how she writes ‘' + ls[0] + '’. Where does it start?';
    const subs = Object.keys(GM.ASK), d = new Date().getDate();
    const top = Object.keys(t.subj).filter(k => GM.ASK[k]).sort((a, b) => t.subj[b] - t.subj[a])[0] || subs[d % subs.length];
    return GM.ASK[top][d % GM.ASK[top].length];
  };
  GM.todayLines = function () {
    const t = GM.today(), nl = Object.keys(t.letters).length, out = [];
    if (nl) out.push(['✏️', 'wrote ' + nl + (nl === 1 ? ' letter' : ' different letters')]);
    if (t.words.length) out.push(['📝', 'wrote ' + (t.words.length === 1 ? 'a word' : t.words.length + ' words')]);
    if (t.puzzles) out.push(['💎', 'solved ' + t.puzzles + (t.puzzles === 1 ? ' puzzle' : ' puzzles')]);
    if (t.play) out.push(['🧸', 'played in the playroom']);
    return out;
  };
  GM.todayHTML = function () {
    const t = GM.today(), L = GM.todayLines(), ls = Object.keys(t.letters);
    let h = '<h3>Today</h3><p>' + (L.length ? 'She ' + L.map(x => x[1]).join(', ') + '.' : 'Nothing yet today.')
      + (ls.length ? ' Letters: <b class="gl">' + ls.join(' ') + '</b>.' : '') + (t.words.length ? ' Words: <b>' + t.words.join(', ') + '</b>.' : '') + '</p>';
    h += '<h3>Something to ask her</h3><p class="gask">' + GM.question() + '</p>';
    return h;
  };

  /* ---------- a cosy place to stop (#10) ---------- */
  GM.t0 = performance.now(); GM.restDue = false; GM.fresh = true;
  GM.mins = () => { const m = G.S.settings.restMins; return m === undefined ? 20 : m; };
  const hidden = id => { const e = $(id); return !e || e.classList.contains('hidden'); };
  GM.tick = function () {
    if (!G.S || !G.E || !G.E.area || G.paused || hidden('#hud') || !hidden('#overlay') || !hidden('#dialogue') || (G.LS && G.LS.busy)) return;
    if (GM.fresh) { GM.fresh = false; if (G.S.rested) { delete G.S.rested; G.saveGame(); G.UI.toast('👋 🌞'); } }
    const m = GM.mins();
    if (m && GM.restDue && performance.now() - GM.t0 >= m * 60000) GM.rest();
  };
  setInterval(GM.tick, 1500);
  GM.rest = function () {
    G.paused = true; GM.restDue = false;
    const ov = G.UI.overlay(true), card = U.el('div', 'card rest');
    card.appendChild(U.el('div', 'yawn', '🥱'));
    card.appendChild(U.el('h2', '', 'What a busy day!<br>Shall we have a rest?'));
    const row = U.el('div', 'restrow'); card.appendChild(row);
    const bye = U.el('button', 'bigbtn alt', 'Bye for now 🌙'), more = U.el('button', 'bigbtn green', 'A little longer');
    bye.onclick = () => { G.sfx('tap'); GM.bye(); };
    more.onclick = () => { G.sfx('tap'); GM.t0 = performance.now() - (GM.mins() - 10) * 60000; G.UI.overlay(false); G.paused = false; };
    row.appendChild(bye); row.appendChild(more); ov.appendChild(card);
    G.say('What a busy day! Shall we have a rest?', true);
  };
  GM.bye = function () {
    G.paused = true;
    const S = G.S, ov = G.UI.overlay(true), card = U.el('div', 'card cosy');
    const cv = U.el('canvas'); cv.width = 620; cv.height = 520; card.appendChild(cv);
    const side = U.el('div', 'cosyside'); card.appendChild(side);
    side.appendChild(U.el('h2', '', 'Night night! 🌙'));
    const L = GM.todayLines();
    if (L.length) { side.appendChild(U.el('p', '', 'Today you…')); for (const x of L) side.appendChild(U.el('div', 'cosyline', x[0] + ' ' + x[1])); }
    side.appendChild(U.el('p', 'cosysee', 'See you next time!'));
    const again = U.el('button', 'bigbtn small', 'Play again ▶'); side.appendChild(again);
    let alive = true;
    again.onclick = () => { alive = false; G.sfx('tap'); delete S.rested; GM.t0 = performance.now() - (GM.mins() - 10) * 60000; G.UI.overlay(false); G.paused = false; G.saveGame(); };
    ov.appendChild(card);
    S.rested = day(); G.saveGame();
    G.say('Night night! See you next time!', true);
    const c = cv.getContext('2d'), stars = []; for (let i = 0; i < 14; i++) stars.push([70 + Math.random() * 200, 60 + Math.random() * 150, Math.random() * 6]);
    (function draw(now) {
      if (!alive || !cv.isConnected) return;
      requestAnimationFrame(draw);
      const t = now / 1000, W = 620, H = 520;
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4b3f72'); g.addColorStop(1, '#6b5a94'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      /* window with moon and stars */
      c.fillStyle = '#1d2450'; c.fillRect(50, 40, 240, 200);
      c.fillStyle = '#fff6c9'; c.beginPath(); c.arc(215, 105, 34, 0, 6.3); c.fill(); c.fillStyle = '#1d2450'; c.beginPath(); c.arc(230, 96, 30, 0, 6.3); c.fill();
      for (const s of stars) { c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.5 + s[2]); c.fillStyle = '#fff'; c.beginPath(); c.arc(s[0], s[1], 2.2, 0, 6.3); c.fill(); } c.globalAlpha = 1;
      c.strokeStyle = '#e9d8b4'; c.lineWidth = 10; c.strokeRect(50, 40, 240, 200); c.lineWidth = 6; c.beginPath(); c.moveTo(170, 40); c.lineTo(170, 240); c.moveTo(50, 140); c.lineTo(290, 140); c.stroke();
      /* floor and rug */
      c.fillStyle = '#8a6a4a'; c.fillRect(0, 420, W, 100); c.fillStyle = '#e88fb0'; c.beginPath(); c.ellipse(250, 462, 190, 30, 0, 0, 6.3); c.fill(); c.fillStyle = '#f7c3d6'; c.beginPath(); c.ellipse(250, 462, 140, 20, 0, 0, 6.3); c.fill();
      /* bed */
      c.fillStyle = '#7a5230'; c.fillRect(350, 300, 24, 140); c.fillRect(580, 350, 20, 90);
      c.fillStyle = '#fff'; c.fillRect(366, 340, 222, 60); c.fillStyle = '#fdf1d0'; c.beginPath(); c.ellipse(410, 338, 40, 18, 0, 0, 6.3); c.fill();
      c.fillStyle = '#7fb6ff'; c.fillRect(450, 336, 140, 74); c.fillStyle = '#a9d0ff'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(475 + i * 32, 372, 9, 0, 6.3); c.fill(); }
      /* lamp glow */
      const lg = c.createRadialGradient(330, 250, 5, 330, 250, 150); lg.addColorStop(0, 'rgba(255,220,130,.55)'); lg.addColorStop(1, 'rgba(255,220,130,0)'); c.fillStyle = lg; c.fillRect(180, 100, 300, 300);
      c.fillStyle = '#ffd95e'; c.beginPath(); c.moveTo(310, 262); c.lineTo(350, 262); c.lineTo(340, 232); c.lineTo(320, 232); c.closePath(); c.fill(); c.fillStyle = '#7a5230'; c.fillRect(327, 262, 6, 40);
      /* her and her pet */
      try {
        G.drawAvatar(c, S.avatar, 210, 462, 2.6, { t, wave: Math.sin(t * 2) > 0, noShadow: true });
        if (S.avatar.pet && S.avatar.pet !== 'none') G.drawCreature(c, S.avatar.pet, 100, 468, 1.5, { t, face: 1 });
      } catch (e) { }
      /* zzz */
      c.fillStyle = 'rgba(255,255,255,.8)'; c.font = 'bold 26px system-ui,sans-serif'; for (let i = 0; i < 3; i++) { const k = (t * 0.4 + i / 3) % 1; c.globalAlpha = 1 - k; c.fillText('z', 440 + k * 40 + i * 6, 320 - k * 70); } c.globalAlpha = 1;
    })(performance.now());
  };
})();

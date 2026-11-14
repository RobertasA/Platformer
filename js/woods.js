/* Hazelnut Hollow — Whispering Woods (SPEC §7.2h): trail-sign map reading, campfire story sequencing, Rosie's lines.
   G.WOODS.trail(e) / story(e) → Promise; G.WOODS.rosieLines() → string[]; G.WOODS.makeTrail(level) → pure layout. */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const WD = G.WOODS = {};

  const COLS = 5, ROWS = 4;
  const MARKS = [
    { id: 'oak', icon: '🌳', name: 'oak tree', the: 'the oak tree' },
    { id: 'camp', icon: '🏕️', name: 'camp', the: 'the camp' },
    { id: 'pond', icon: '🌊', name: 'pond', the: 'the pond' },
    { id: 'ring', icon: '🍄', name: 'mushroom ring', the: 'the mushroom ring' },
    { id: 'rock', icon: '🪨', name: 'big rock', the: 'the big rock' },
    { id: 'bridge', icon: '🌉', name: 'bridge', the: 'the bridge' },
    { id: 'hive', icon: '🐝', name: 'beehive', the: 'the beehive' },
    { id: 'hut', icon: '🏡', name: 'hut', the: 'the hut' },
  ];
  const DIRS = {
    north: { dx: 0, dy: -1, label: 'north', letter: 'N' }, south: { dx: 0, dy: 1, label: 'south', letter: 'S' },
    east: { dx: 1, dy: 0, label: 'east', letter: 'E' }, west: { dx: -1, dy: 0, label: 'west', letter: 'W' },
  };
  const NUMW = ['', 'one', 'two', 'three'];
  const inGrid = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;

  /* pure: layout + route. cells = 8 landmarks {x,y,mark}; steps = [{dir, n}] */
  WD.makeTrail = function (level) {
    level = level || 0;
    for (let tries = 0; tries < 500; tries++) {
      const spots = [];
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) spots.push({ x, y });
      const cells = U.shuffle(spots).slice(0, MARKS.length).map((c, i) => ({ x: c.x, y: c.y, mark: MARKS[i] }));
      const at = (x, y) => cells.find(c => c.x === x && c.y === y);
      const opts = [];
      for (const s of cells) {
        const plans = [];
        if (level <= 0) plans.push([{ dir: 'north', n: 1 }]);
        else if (level === 1) Object.keys(DIRS).forEach(d => plans.push([{ dir: d, n: 2 }]));
        else {
          const ds = Object.keys(DIRS);
          ds.forEach(a => ds.forEach(b => { if (DIRS[a].dx * DIRS[b].dx + DIRS[a].dy * DIRS[b].dy === 0) plans.push([{ dir: a, n: 1 }, { dir: b, n: 2 }]); }));
        }
        for (const steps of plans) {
          let x = s.x, y = s.y, ok = true;
          for (const st of steps) for (let i = 0; i < st.n; i++) { x += DIRS[st.dir].dx; y += DIRS[st.dir].dy; if (!inGrid(x, y)) ok = false; }
          const end = ok && at(x, y);
          if (end && end !== s) opts.push({ start: s, steps, end });
        }
      }
      if (!opts.length) continue;
      const o = U.pick(opts);
      const others = U.shuffle(cells.filter(c => c !== o.end && c !== o.start)).slice(0, 2);
      const choices = U.shuffle([o.end].concat(others));
      return { cells, start: o.start, steps: o.steps, answer: o.end, choices };
    }
    throw new Error('no trail');
  };
  const route = (t) => {   // list of squares walked, start first
    const pts = [{ x: t.start.x, y: t.start.y }]; let x = t.start.x, y = t.start.y;
    for (const st of t.steps) for (let i = 0; i < st.n; i++) { x += DIRS[st.dir].dx; y += DIRS[st.dir].dy; pts.push({ x, y }); }
    return pts;
  };
  const trailText = (t, level) => {
    const s = 'Start at ' + t.start.mark.the + '. ';
    if (level <= 0) return s + 'Go one square north. What do you find?';
    if (level === 1) return s + 'Go ' + NUMW[t.steps[0].n] + ' squares ' + t.steps[0].dir + '. What do you find?';
    return s + 'Go ' + t.steps[0].n + ' ' + t.steps[0].dir + ', then ' + t.steps[1].n + ' ' + t.steps[1].dir + '. What do you find?';
  };

  /* shared shell */
  const open = (cls) => {
    G.paused = true;
    const ov = G.UI.overlay(true), card = U.el('div', 'card puzzle woodcard ' + cls);
    ov.appendChild(card); return card;
  };
  const shut = () => { G.hush(); G.UI.overlay(false); G.paused = false; };
  const topBar = (card, html, say) => {
    const top = U.el('div', 'top'), q = U.el('div', 'q', html); top.appendChild(q);
    const spk = U.el('button', 'iconbtn', '🔊'); spk.onclick = () => G.say(say(), true); top.appendChild(spk);
    card.appendChild(top); return q;
  };
  const retrigger = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const reward = (hint, card, key, gem, firstMsg, laterMsg) => {
    let msg;
    if (!G.S.quests[key]) { G.S.quests[key] = true; G.S.gems[gem]++; G.sfx('fanfare'); G.UI.flyGem(gem, 640, 300); msg = firstMsg; }
    else { G.S.coins += 2; G.UI.gembar(); G.sfx('coin'); msg = laterMsg; }
    hint.textContent = msg; G.say(msg.replace('🪙', 'coins'), true); G.saveGame();
    return msg;
  };

  /* ---------- trail sign ---------- */
  WD.trail = function (e) {
    const level = G.S.level.shapes || 0;
    const t = WD.makeTrail(level), pts = route(t), text = trailText(t, level);
    return new Promise(resolve => {
      const card = open('trailcard');
      const q = topBar(card, text, () => text);
      const body = U.el('div', 'wmapbody'); card.appendChild(body);
      const map = U.el('div', 'wmap'); body.appendChild(map);
      const CW = 110, CH = 80;
      const sq = {};
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const c = t.cells.find(k => k.x === x && k.y === y);
        const d = U.el('div', 'wcell' + (c ? ' mark' : '') + ((x + y) % 2 ? ' alt' : ''), c ? '<span class="wi">' + c.mark.icon + '</span><span class="wn">' + c.mark.name + '</span>' : '');
        d.style.left = x * CW + 'px'; d.style.top = y * CH + 'px'; map.appendChild(d); sq[x + ',' + y] = d;
      }
      const fox = U.el('div', 'wfox', '🦊');
      const place = (p) => { fox.style.left = p.x * CW + 'px'; fox.style.top = p.y * CH + 'px'; };
      place(pts[0]); map.appendChild(fox);
      const rose = U.el('div', 'wrose',
        '<div class="wr-n">N</div><div class="wr-mid"><span class="wr-w">W</span><span class="wr-c"><span class="wr-arrow"></span><span class="wr-dot"></span></span><span class="wr-e">E</span></div><div class="wr-s">S</div><div class="wr-cap">north is up</div>');
      body.appendChild(rose);
      const area = U.el('div', 'answers'); card.appendChild(area);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      let wrong = 0, done = false, revealed = false, timers = [];
      const later = (f, ms) => { const id = setTimeout(f, ms); timers.push(id); };
      const finish = () => { timers.forEach(clearTimeout); shut(); resolve(); };
      close.onclick = () => { if (done) return; done = true; G.sfx('tap'); G.saveGame(); finish(); };
      const walk = (cb) => {
        pts.slice(1).forEach((p, i) => later(() => { place(p); G.sfx('pop'); fox.classList.add('hop'); later(() => fox.classList.remove('hop'), 400); }, 250 + i * 520));
        later(cb, 250 + (pts.length - 1) * 520 + 500);
      };
      const win = () => {
        done = true; G.PZ.adapt('shapes', wrong === 0 && !revealed, revealed);
        const btn = btns.find(b => b.c === t.answer); btn.classList.add('right'); G.sfx('right');
        pts.forEach(p => sq[p.x + ',' + p.y].classList.add('path'));
        walk(() => {
          sq[pts[pts.length - 1].x + ',' + pts[pts.length - 1].y].classList.add('found');
          reward(hint, card, 'trail:' + e.id, e.col, 'You can read a map! Here is a gem.', 'Good map reading! +2 🪙');
          const ok = U.el('button', 'bigbtn green', 'Done ▶'); ok.onclick = () => { G.sfx('tap'); finish(); }; card.appendChild(ok);
        });
      };
      const btns = t.choices.map(c => {
        const b = U.el('button', 'ans wans', '<span class="wi">' + c.mark.icon + '</span><span class="wn">' + c.mark.name + '</span>'); b.c = c;
        b.onclick = () => {
          if (done || b.classList.contains('dim')) return;
          G.sfx('tap');
          if (c === t.answer) { win(); return; }
          wrong++; G.sfx('wrong'); retrigger(b, 'wrong'); later(() => b.classList.add('dim'), 400);
          let m;
          if (wrong === 1) m = 'North is up the map. Count the squares.';
          else if (wrong === 2) { m = 'Look! The squares glow.'; pts.forEach(p => sq[p.x + ',' + p.y].classList.add('glow')); }
          else { revealed = true; m = 'Let me show you!'; hint.textContent = m; G.say(m, true); win(); return; }
          hint.textContent = m; G.say(m, true);
        };
        area.appendChild(b); return b;
      });
      later(() => G.say(text, true), 250);
    });
  };

  /* ---------- campfire story ---------- */
  const STORIES = [
    { name: 'sunflower', parts: [['🌱', 'A seed goes in the soil.'], ['🌧️', 'The rain falls down.'], ['🌿', 'A little shoot grows.'], ['🌻', 'Look! A big sunflower.']] },
    { name: 'duckling', parts: [['🥚', 'An egg sits in the nest.'], ['🐣', 'Crack! The egg opens.'], ['🐥', 'Out pops a duckling.'], ['🦆', 'Now it can swim.']] },
    { name: 'snowman', parts: [['❄️', 'The snow is falling.'], ['⛄', 'We roll a big snowball.'], ['🥕', 'We add a carrot nose.'], ['🧣', 'Our snowman has a scarf.']] },
    { name: 'cake', parts: [['🥣', 'Mix the cake in a bowl.'], ['🔥', 'Bake it in the oven.'], ['🍰', 'Add the icing on top.'], ['🎂', 'Happy birthday! Yum.']] },
    { name: 'butterfly', parts: [['🥬', 'A tiny egg is on a leaf.'], ['🐛', 'A hungry caterpillar eats.'], ['🛌', 'It sleeps in a cosy case.'], ['🦋', 'A butterfly flies away!']] },
    { name: 'rainbow', parts: [['☁️', 'Grey clouds come.'], ['🌧️', 'It rains and rains.'], ['🌤️', 'The sun peeks out.'], ['🌈', 'A rainbow! How pretty.']] },
  ];
  WD.STORIES = STORIES;
  let lastStory = -1;

  WD.story = function (e) {
    let si; do { si = U.irnd(0, STORIES.length - 1); } while (si === lastStory && STORIES.length > 1);
    lastStory = si;
    const parts = STORIES[si].parts.map((p, i) => ({ i, em: p[0], text: p[1] }));
    return new Promise(resolve => {
      const card = open('storycard');
      const ask = 'Put the story in order.';
      topBar(card, '🔥 ' + ask, () => ask);
      const slots = U.el('div', 'wslots'); card.appendChild(slots);
      const slotEls = parts.map((_, i) => { const s = U.el('div', 'wslot', '<span class="wnum">' + (i + 1) + '</span>'); slots.appendChild(s); return s; });
      const deck = U.el('div', 'wdeck'); card.appendChild(deck);
      const hint = U.el('div', 'hint', 'What happens first?'); card.appendChild(hint);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      let next = 0, mistakes = 0, streak = 0, done = false, timers = [];
      const later = (f, ms) => { const id = setTimeout(f, ms); timers.push(id); };
      const finish = () => { timers.forEach(clearTimeout); shut(); resolve(); };
      close.onclick = () => { G.sfx('tap'); G.saveGame(); done = true; finish(); };
      const cardEls = U.shuffle(parts.slice()).map(p => {
        const b = U.el('button', 'wcard', '<span class="we">' + p.em + '</span><span class="wt">' + p.text + '</span>'); b.p = p;
        b.onclick = () => {
          if (b.classList.contains('placed') || b.classList.contains('flown') || done === 'read') return;
          G.say(p.text, true);
          if (p.i === next) {
            streak = 0; G.sfx('right'); fly(b, p);
          } else {
            mistakes++; streak++; G.sfx('wrong'); retrigger(b, 'wrong');
            hint.textContent = next === 0 ? 'What happens first?' : 'What happens next?';
            if (streak >= 3) cardEls.find(c => c.p.i === next).classList.add('glow');
          }
        };
        deck.appendChild(b); return b;
      });
      const fly = (b, p) => {
        const slot = slotEls[next]; next++;
        cardEls.forEach(c => c.classList.remove('glow'));
        const sc = (b.getBoundingClientRect().width / b.offsetWidth) || 1;
        const rb = b.getBoundingClientRect(), rs = slot.getBoundingClientRect();
        const fill = U.el('div', 'wfill', '<span class="we">' + p.em + '</span><span class="wt">' + p.text + '</span>');
        fill.style.setProperty('--dx', ((rb.left + rb.width / 2 - rs.left - rs.width / 2) / sc) + 'px');
        fill.style.setProperty('--dy', ((rb.top + rb.height / 2 - rs.top - rs.height / 2) / sc) + 'px');
        slot.classList.add('full'); slot.appendChild(fill); b.classList.add('flown');
        if (next < parts.length) hint.textContent = 'What happens next?';
        else { hint.textContent = ''; deck.classList.add('gone'); later(readAll, 700); }
      };
      const readAll = () => {
        done = 'read';
        parts.forEach((p, i) => {
          later(() => {
            slotEls.forEach((s, k) => s.classList.toggle('now', k === i));
            hint.textContent = p.text; G.say(p.text, true);
          }, i * 2600);
        });
        later(() => {
          slotEls.forEach(s => s.classList.remove('now')); done = true;
          G.PZ.adapt('words', mistakes === 0, false);
          reward(hint, card, 'story', 'purple', 'What a lovely story! Here is a purple gem.', 'What a lovely story! +2 🪙');
          const ok = U.el('button', 'bigbtn green', 'Done ▶'); ok.onclick = () => { G.sfx('tap'); finish(); }; card.appendChild(ok);
        }, parts.length * 2600);
      };
      later(() => G.say('Put the story in order. What happens first?', true), 250);
    });
  };

  /* ---------- Rosie Rabbit ---------- */
  WD.rosieLines = function () {
    const f = G.pickCount ? G.pickCount('fireflies') : { have: 0, total: 5 };
    const Q = G.S.quests;
    if (f.have >= f.total && !Q.fireflies) {
      Q.fireflies = true; G.S.gems.yellow++; G.sfx('fanfare'); G.UI.flyGem('yellow', 640, 300); G.saveGame();
      return ['You found all five fireflies!', 'Now the woods can twinkle all night. Here is a yellow gem!'];
    }
    if (Q.fireflies) return ['Thank you, friend! The woods twinkle every night.', 'Read the trail signs. Sit by the campfire for a story!'];
    if (f.have === 0) return ['Hello! I am Rosie, the woods ranger.', 'My five fireflies have flown off. Can you find them?', 'Read the trail signs too. They show you the way!'];
    const more = f.total - f.have;
    return ['You have found ' + f.have + ' firefl' + (f.have === 1 ? 'y' : 'ies') + '. ' + more + ' more to go!', 'Look up in the trees and over the water.'];
  };
})();

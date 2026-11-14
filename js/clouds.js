/* Hazelnut Hollow — Cloudtop Kingdom cards (SPEC §7.2i): weather station, star counter, rainbow maker, Luna's lines.
   G.CLOUDS.weather(e) / stars(e) / rainbow(e) → Promise; lunaLines() → string[]; makeStars(level, askTens) → pure. */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const CL = G.CLOUDS = {};

  /* ---------- shared shell ---------- */
  const open = (cls) => {
    G.paused = true;
    const ov = G.UI.overlay(true), card = U.el('div', 'card puzzle cloudcard ' + cls);
    ov.appendChild(card); return card;
  };
  const shut = () => { G.hush(); G.UI.overlay(false); G.paused = false; };
  const topBar = (card, html, say) => {
    const top = U.el('div', 'top'), q = U.el('div', 'q', html); top.appendChild(q);
    const spk = U.el('button', 'iconbtn', '🔊'); spk.onclick = () => G.say(say(), true); top.appendChild(spk);
    card.appendChild(top); return q;
  };
  const retrigger = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const dotsHtml = (n, total) => { let s = ''; for (let i = 0; i < total; i++) s += '<i class="' + (i < n ? 'on' : '') + '"></i>'; return s; };
  const reward = (hint, key, gem, firstMsg, laterMsg) => {
    let msg;
    if (!G.S.quests[key]) { G.S.quests[key] = true; G.S.gems[gem]++; G.sfx('fanfare'); G.UI.flyGem(gem, 640, 300); msg = firstMsg; }
    else { G.S.coins += 2; G.UI.gembar(); G.sfx('coin'); msg = laterMsg; }
    hint.textContent = msg; G.say(msg.replace('🪙', 'coins'), true); G.saveGame();
  };
  const timers = () => {
    const list = [];
    return { later: (f, ms) => { const id = setTimeout(f, ms); list.push(id); return id; }, clear: () => { list.forEach(clearTimeout); list.length = 0; } };
  };
  const sparkle = (host, n) => {
    for (let i = 0; i < n; i++) {
      const s = U.el('span', 'cspark', U.pick(['✨', '⭐', '💫']));
      s.style.left = U.irnd(5, 92) + '%'; s.style.top = U.irnd(5, 80) + '%'; s.style.animationDelay = (i * 0.07) + 's';
      host.appendChild(s); setTimeout(() => s.remove(), 1800);
    }
  };

  /* ---------- weather station ---------- */
  const ITEMS = {
    hat: { icon: '👒', name: 'sun hat' }, umb: { icon: '☂️', name: 'umbrella' }, scarf: { icon: '🧣', name: 'woolly scarf' },
    mit: { icon: '🧤', name: 'mittens' }, kite: { icon: '🪁', name: 'kite' }, home: { icon: '🏠', name: 'stay indoors' },
  };
  const WEATHER = [
    { id: 'sunny', say: 'sunny and hot', big: '☀️', temp: 28, item: 'hat', not: ['mit', 'scarf'],
      hint: 'The sun is hot. What keeps the sun off your head?', fact: 'A sun hat keeps the sun off!' },
    { id: 'rainy', say: 'rainy', big: '🌧️', temp: 11, item: 'umb', not: [],
      hint: 'Rain makes you wet. What keeps you dry?', fact: 'An umbrella keeps the rain off!' },
    { id: 'snowy', say: 'snowy', big: '❄️', temp: 1, item: 'mit', not: ['scarf'],
      hint: 'Snow is cold. What keeps little hands warm?', fact: 'Mittens keep your hands warm!' },
    { id: 'windy', say: 'windy', big: '🍃', temp: 14, item: 'kite', not: [],
      hint: 'The wind blows hard. What can fly in the wind?', fact: 'A kite loves the wind!' },
    { id: 'frosty', say: 'frosty and cold', big: '🥶', temp: 2, item: 'scarf', not: ['mit'],
      hint: 'It is freezing. What keeps your neck and head warm?', fact: 'A woolly hat and scarf keep you warm!' },
    { id: 'stormy', say: 'stormy', big: '⛈️', temp: 9, item: 'home', not: ['kite', 'umb'],
      hint: 'Thunder and lightning! Where is it safe and dry?', fact: 'In a storm, stay safe indoors!' },
  ];
  const fx = (id) => {
    let h = '';
    const n = (k, f) => { for (let i = 0; i < k; i++) h += f(i); };
    if (id === 'rainy' || id === 'stormy') n(id === 'rainy' ? 16 : 22, i => '<i class="cwdrop" style="left:' + (i * 6 + U.irnd(0, 4)) + '%;animation-delay:-' + (Math.random() * 0.8).toFixed(2) + 's"></i>');
    if (id === 'stormy') h += '<b class="cwflash"></b>';
    if (id === 'snowy') n(14, i => '<i class="cwflake" style="left:' + (i * 7 + U.irnd(0, 4)) + '%;animation-delay:-' + (Math.random() * 4).toFixed(1) + 's">❄</i>');
    if (id === 'windy') n(7, i => '<i class="cwleaf" style="top:' + (8 + i * 12) + '%;animation-delay:-' + (Math.random() * 2.5).toFixed(1) + 's">' + (i % 2 ? '🍃' : '🍂') + '</i>');
    if (id === 'frosty') n(8, i => '<i class="cwflake slow" style="left:' + (i * 12 + 2) + '%;animation-delay:-' + (Math.random() * 5).toFixed(1) + 's">✦</i>');
    return h;
  };
  const therm = (t) => {
    const pct = Math.max(12, Math.min(92, Math.round(12 + (t + 2) / 32 * 80)));
    const col = t >= 22 ? '#e63946' : t >= 12 ? '#ff9f1c' : '#2f8cf0';
    return '<div class="cwtube"><div class="cwmerc" style="height:' + pct + '%;background:' + col + '"></div></div><div class="cwbulb" style="background:' + col + '"></div><div class="cwnum" style="color:' + col + '">' + t + '°</div>';
  };

  let cur = null;   // test hook state
  CL._answer = () => cur && cur();

  CL.weather = function (e) {
    const rounds = U.shuffle(WEATHER.slice()).slice(0, 3);
    return new Promise(resolve => {
      const card = open('cwcard');
      const q = topBar(card, '', () => qText);
      let qText = '';
      const scene = U.el('div', 'cwscene'); card.appendChild(scene);
      const area = U.el('div', 'answers'); card.appendChild(area);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const dots = U.el('div', 'cdots', dotsHtml(0, 3)); card.appendChild(dots);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      const T = timers();
      let done = false, round = 0, allFirst = true, anyRev = false, wrong = 0, w = null, btns = [];
      const finish = () => { cur = null; T.clear(); shut(); resolve(); };
      close.onclick = () => { if (done) return; done = true; G.sfx('tap'); G.saveGame(); finish(); };

      const next = () => {
        if (round >= 3) { endAll(); return; }
        w = rounds[round]; wrong = 0; hint.textContent = ''; hint.classList.remove('fact');
        const pool = U.shuffle(Object.keys(ITEMS).filter(k => k !== w.item && !w.not.includes(k)));
        const keys = U.shuffle([w.item, pool[0], pool[1]]);
        scene.innerHTML = '<div class="cwwin sky-' + w.id + '"><div class="cwfx">' + fx(w.id) + '</div><div class="cwbig">' + w.big + '</div><div class="cwsill"></div></div>' +
          '<div class="cwtherm">' + therm(w.temp) + '</div><div class="cwteddy"><span>🧸</span></div>';
        qText = 'It is ' + w.say + '. What does Teddy need?';
        q.textContent = qText;
        area.innerHTML = ''; btns = [];
        keys.forEach(k => {
          const it = ITEMS[k], b = U.el('button', 'ans cwans', '<span class="cwi">' + it.icon + '</span><span class="cwn">' + it.name + '</span>');
          b.k = k; b.dataset.key = k; b.onclick = () => tap(b); area.appendChild(b); btns.push(b);
        });
        dots.innerHTML = dotsHtml(round, 3);
        T.later(() => G.say(qText, true), 300);
      };
      const good = (b, revealed) => {
        done = true; b.classList.add('right'); G.sfx('right');
        if (revealed) anyRev = true;
        if (wrong > 0) allFirst = false;
        hint.textContent = w.fact; hint.classList.add('fact'); G.say(w.fact, true);
        retrigger(scene.querySelector('.cwteddy'), 'happy');
        round++; dots.innerHTML = dotsHtml(round, 3);
        T.later(() => { done = false; next(); }, 1600 + (revealed ? 500 : 0));
      };
      const tap = (b) => {
        if (done || b.classList.contains('dim')) return;
        G.sfx('tap');
        if (b.k === w.item) { good(b, false); return; }
        wrong++; allFirst = false; G.sfx('wrong'); retrigger(b, 'wrong'); T.later(() => b.classList.add('dim'), 400);
        let m;
        if (wrong === 1) m = w.hint;
        else { m = 'Nearly! ' + w.hint; btns.find(x => x.k === w.item).classList.add('glow'); }
        hint.classList.remove('fact'); hint.textContent = m; G.say(m, true);
      };
      const endAll = () => {
        done = true; area.innerHTML = '';
        G.PZ.adapt('nature', allFirst, anyRev);
        reward(hint, 'weather', 'blue', 'You know your weather! Here is a blue gem.', 'Good weather watching! +2 🪙');
        hint.classList.add('fact');
        const ok = U.el('button', 'bigbtn green', 'Done ▶'); ok.onclick = () => { G.sfx('tap'); finish(); }; card.appendChild(ok);
      };
      cur = () => w && w.item;
      next();
    });
  };

  /* ---------- star counter ---------- */
  CL.makeStars = function (level, askTens) {
    level = level || 0;
    const lo = level <= 0 ? 6 : level === 1 ? 11 : 20, hi = level <= 0 ? 15 : level === 1 ? 29 : 59;
    const n = U.irnd(lo, hi), tens = Math.floor(n / 10), ones = n % 10;
    const ask = !!askTens && n >= 10;
    const answer = ask ? tens : n, want = level >= 1 ? 4 : 3;
    const ok = (v) => Number.isInteger(v) && v >= 0 && v !== answer;
    let cand = [];
    if (ask) cand = [answer - 1, answer + 1, ones, answer + 2, answer - 2, answer + 3];
    else {
      cand = [n + 1, n - 1, n + 10, n - 10];
      const sw = ones * 10 + tens; if (n >= 10 && sw !== n) cand.push(sw);
      cand = U.shuffle(cand).concat([n + 2, n - 2, n + 5, n - 5]);
    }
    const out = [];
    cand.forEach(v => { if (ok(v) && !out.includes(v) && out.length < want - 1) out.push(v); });
    for (let d = 1; out.length < want - 1; d++) [answer + d, answer + d + 20].forEach(v => { if (ok(v) && !out.includes(v) && out.length < want - 1) out.push(v); });
    return { n, tens, ones, q: ask ? 'How many tens?' : 'How many stars?', answer, choices: U.shuffle([answer].concat(out)) };
  };
  const placeSay = (t, o) => {
    const T = t + ' ' + (t === 1 ? 'ten' : 'tens'), O = o + ' ' + (o === 1 ? 'one' : 'ones'), n = t * 10 + o;
    if (!t) return O + ' make ' + n + '.';
    if (!o) return T + (t === 1 ? ' makes ' : ' make ') + n + '.';
    return T + ' and ' + O + ' make ' + n + '.';
  };
  const frames = (n) => {
    let h = '', left = n;
    while (left > 0) {
      const k = Math.min(10, left); left -= k;
      let c = ''; for (let i = 0; i < 10; i++) c += '<i class="' + (i < k ? 'st' : '') + '">' + (i < k ? '⭐' : '') + '</i>';
      h += '<div class="csframe' + (k === 10 ? ' full' : '') + '">' + c + '</div>';
    }
    return h;
  };

  CL.stars = function (e) {
    const level = G.S.level.maths || 0;
    return new Promise(resolve => {
      const card = open('cscard');
      let qText = '';
      const q = topBar(card, '', () => qText);
      const sky = U.el('div', 'cssky'); card.appendChild(sky);
      const area = U.el('div', 'answers'); card.appendChild(area);
      const hint = U.el('div', 'hint', ''); card.appendChild(hint);
      const dots = U.el('div', 'cdots', dotsHtml(0, 3)); card.appendChild(dots);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      const T = timers();
      let done = false, round = 0, allFirst = true, anyRev = false, wrong = 0, s = null, btns = [];
      const finish = () => { cur = null; T.clear(); shut(); resolve(); };
      close.onclick = () => { if (done) return; done = true; G.sfx('tap'); G.saveGame(); finish(); };

      const next = () => {
        if (round >= 3) { endAll(); return; }
        s = CL.makeStars(level, level >= 2 && round % 2 === 1); wrong = 0; hint.textContent = ''; hint.classList.remove('fact');
        sky.innerHTML = frames(s.n);
        qText = s.q; q.textContent = qText;
        area.innerHTML = ''; btns = [];
        s.choices.forEach(v => {
          const b = U.el('button', 'ans csans', String(v)); b.v = v; b.dataset.v = v; b.onclick = () => tap(b); area.appendChild(b); btns.push(b);
        });
        dots.innerHTML = dotsHtml(round, 3);
        T.later(() => G.say(qText, true), 300);
      };
      const good = (b, revealed) => {
        done = true; b.classList.add('right'); G.sfx('right');
        if (revealed) anyRev = true;
        sky.classList.add('shine');
        const m = placeSay(s.tens, s.ones);
        hint.textContent = m; hint.classList.add('fact'); G.say(m, true);
        T.later(() => sky.classList.remove('shine'), 1500);
        round++; dots.innerHTML = dotsHtml(round, 3);
        T.later(() => { done = false; next(); }, 2000);
      };
      const tap = (b) => {
        if (done || b.classList.contains('dim')) return;
        G.sfx('tap');
        if (b.v === s.answer) { good(b, false); return; }
        wrong++; allFirst = false; G.sfx('wrong'); retrigger(b, 'wrong'); T.later(() => b.classList.add('dim'), 400);
        if (wrong >= 3 || btns.filter(x => !x.classList.contains('dim') && x !== b).length <= 1 && wrong >= 2) {
          const m = 'Let me show you!'; hint.classList.remove('fact'); hint.textContent = m; G.say(m, true);
          good(btns.find(x => x.v === s.answer), true); return;
        }
        const m = 'Count the full boxes first. Each full box is ten.';
        hint.classList.remove('fact'); hint.textContent = m; G.say(m, true);
      };
      const endAll = () => {
        done = true; area.innerHTML = '';
        G.PZ.adapt('maths', allFirst, anyRev);
        reward(hint, 'stars', 'yellow', 'You counted the stars! Here is a yellow gem.', 'Good star counting! +2 🪙');
        hint.classList.add('fact');
        const ok = U.el('button', 'bigbtn green', 'Done ▶'); ok.onclick = () => { G.sfx('tap'); finish(); }; card.appendChild(ok);
      };
      cur = () => s && s.answer;
      next();
    });
  };

  /* ---------- rainbow maker ---------- */
  const COLS = [
    { n: 'red', c: '#e63946' }, { n: 'orange', c: '#ff8c1a' }, { n: 'yellow', c: '#ffd60a' }, { n: 'green', c: '#3fc470' },
    { n: 'blue', c: '#2f8cf0' }, { n: 'indigo', c: '#4b3fb5' }, { n: 'violet', c: '#a24fd8' },
  ];
  CL.rainbow = function (e) {
    return new Promise(resolve => {
      const card = open('crcard');
      const intro = 'Paint the rainbow! Tap red first.';
      topBar(card, 'Paint the rainbow!<small>Start with red.</small>', () => intro);
      const sky = U.el('div', 'crsky'); card.appendChild(sky);
      let svg = '<svg viewBox="0 0 600 300" class="crsvg">';
      COLS.forEach((c, i) => {
        const r = 280 - i * 19, d = 'M' + (300 - r) + ' 292 A' + r + ' ' + r + ' 0 0 1 ' + (300 + r) + ' 292';
        svg += '<path class="crbase" d="' + d + '"/><path class="crarc" id="crarc' + i + '" d="' + d + '" pathLength="1" stroke="' + c.c + '"/>';
      });
      sky.innerHTML = svg + '</svg><div class="crcl c1">☁️</div><div class="crcl c2">☁️</div><div class="crcl c3">☁️</div><div class="crcl c4">☁️</div>';
      const row = U.el('div', 'crjars'); card.appendChild(row);
      const hint = U.el('div', 'hint', 'Tap the red jar.'); card.appendChild(hint);
      const close = U.el('button', 'closex', '✕'); card.appendChild(close);
      const T = timers();
      let done = false, idx = 0, misses = 0, totalMiss = 0;
      const finish = () => { cur = null; T.clear(); shut(); resolve(); };
      close.onclick = () => { if (done) return; done = true; G.sfx('tap'); G.saveGame(); finish(); };
      const jars = U.shuffle(COLS.map((c, i) => i)).map(i => {
        const c = COLS[i];
        const b = U.el('button', 'crjar', '<span class="crlid"></span><span class="crbody" style="background:' + c.c + '"><span class="crshine"></span></span><span class="crname">' + c.n + '</span><span class="crtick">✓</span>');
        b.i = i; b.dataset.col = c.n; b.onclick = () => tap(b); row.appendChild(b); return b;
      });
      const tap = (b) => {
        if (done || b.classList.contains('used')) return;
        G.say(COLS[b.i].n, true);
        if (b.i !== idx) {
          G.sfx('wrong'); retrigger(b, 'wrong'); misses++; totalMiss++;
          hint.textContent = 'Next is ' + COLS[idx].n + '.';
          if (misses >= 2) jars.find(j => j.i === idx).classList.add('glow');
          return;
        }
        G.sfx('right'); retrigger(b, 'pour'); b.classList.add('used'); b.classList.remove('glow');
        const arc = sky.querySelector('#crarc' + idx); arc.classList.add('paint');
        idx++; misses = 0;
        if (idx < 7) hint.textContent = 'Now ' + COLS[idx].n + '!';
        else T.later(complete, 900);
      };
      const complete = () => {
        done = true; sky.classList.add('shimmer'); sparkle(sky, 14); G.sfx('magic');
        hint.textContent = 'Red, orange, yellow, green, blue, indigo, violet!';
        G.say('Red, orange, yellow, green, blue, indigo, violet!', true);
        T.later(() => {
          G.PZ.adapt('patterns', totalMiss === 0, false);
          row.remove();
          reward(hint, 'rainbow', 'purple', 'You made a rainbow! Here is a purple gem.', 'Lovely rainbow! +2 🪙');
          const ok = U.el('button', 'bigbtn green', 'Done ▶'); ok.onclick = () => { G.sfx('tap'); finish(); }; card.appendChild(ok);
        }, 3600);
      };
      cur = () => COLS[idx] && COLS[idx].n;
      T.later(() => G.say(intro, true), 300);
    });
  };

  /* ---------- Luna ---------- */
  CL.lunaLines = function () {
    const need = { red: 5, blue: 5, green: 5, yellow: 5, purple: 4 };
    const missing = Object.keys(need).filter(c => (G.S.gems[c] || 0) < need[c]).map(c => ({ c, n: need[c] - (G.S.gems[c] || 0) }));
    if (G.S.quests.finale) return ['Hello, hero of Hazelnut Hollow!', 'The castle is always open for you.'];
    if (!missing.length) return ['You have all the gems!', 'Go to the castle door. A party is waiting!'];
    const part = m => m.n + ' more ' + m.c + (m.n === 1 ? ' gem' : ' gems');
    const two = missing.slice(0, 2).map(part).join(' and ');
    return ['Welcome to Cloudtop Kingdom! I am Luna.', 'The Cloud Castle opens for a hero with lots of gems.', 'You still need ' + two + (missing.length > 2 ? ', and more.' : '.')];
  };
})();

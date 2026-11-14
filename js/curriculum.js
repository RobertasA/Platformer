/* Hazelnut Hollow — curriculum: parametric KS1 puzzle generators. G.CURR.make(subject, level, opts) */
(function () {
  'use strict';
  const G = window.G = window.G || {};
  const U = G.U || {};
  const irnd = U.irnd || ((a, b) => Math.floor(a + Math.random() * (b - a + 1)));
  const pick = U.pick || (a => a[Math.floor(Math.random() * a.length)]);
  const shuffle = U.shuffle || (a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; });
  const CURR = G.CURR = { subjects: ['maths', 'words', 'nature', 'shapes', 'patterns'], _debug: false };
  const GENS = { maths: [], words: [], nature: [], shapes: [], patterns: [] };
  const def = (subject, id, lo, hi, fn, w) => GENS[subject].push({ id, lo, hi, fn, w: w || 1 });

  /* ---------- helpers ---------- */
  const NWS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const nw = n => n < 20 ? NWS[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + NWS[n % 10] : '') : n === 100 ? 'one hundred' : String(n);
  const plain = s => String(s).replace(/<[^>]*>/g, '').replace(/[\p{Extended_Pictographic}️‍]/gu, '').replace(/\s+/g, ' ').trim();
  const strip = s => plain(s).replace(/[^\p{L}\p{N}\s'£-]/gu, '').trim();
  const near = (a, lo, hi, sp, st) => { st = st || 1; const r = []; for (let d = 1; d <= sp; d++) { if (a + d * st <= hi) r.push(a + d * st); if (a - d * st >= lo) r.push(a - d * st); } return r; };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const bigE = e => `<div class="pz-vis"><div class="pz-big">${e}</div></div>`;
  const COLS = ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc', '#ff7043'];

  function ch(o, correct, wrongs, n) {
    correct = String(correct);
    const seen = new Set([correct]); let w = [];
    for (const x of shuffle(wrongs.map(String))) if (!seen.has(x)) { seen.add(x); w.push(x); }
    w = w.slice(0, Math.max(1, (n || 3) - 1));
    if (!w.length) return null;
    const choices = shuffle([correct].concat(w));
    const r = Object.assign({ type: 'choice', choices, answer: choices.indexOf(correct) }, o); if (!r.say) r.say = plain(o.q); return r;
  }
  function ord(o, solution) {
    solution = solution.map(String);
    let tiles = shuffle(solution), t = 0;
    while (tiles.join('|') === solution.join('|') && t++ < 20) tiles = shuffle(solution);
    const r = Object.assign({ type: 'order', tiles, solution }, o); if (!r.say) r.say = plain(o.q); return r;
  }
  const objRow = (e, n, sz) => `<div class="pz-row" style="font-size:${sz || 44}px;letter-spacing:4px">${e.repeat(n)}</div>`;
  const objRows = (e, n) => { let h = ''; const sz = n <= 10 ? 46 : 34; for (let i = 0; i < n; i += 5) h += objRow(e, Math.min(5, n - i), sz); return `<div class="pz-vis">${h}</div>`; };
  function tenFrame(n, capn, col) {
    capn = capn || 10; col = col || '#ff7043'; const rows = Math.ceil(capn / 5); let s = '';
    for (let i = 0; i < capn; i++) { const x = 8 + (i % 5) * 40, y = 8 + Math.floor(i / 5) * 40; s += `<rect x="${x}" y="${y}" width="40" height="40" fill="#fff" stroke="#555" stroke-width="2"/>`; if (i < n) s += `<circle cx="${x + 20}" cy="${y + 20}" r="15" fill="${col}"/>`; }
    return `<div class="pz-vis"><svg viewBox="0 0 216 ${rows * 40 + 16}" width="216" height="${rows * 40 + 16}">${s}</svg></div>`;
  }
  const OBJ = ['🍎', '⭐', '🌰', '🐝', '🍄', '🦋', '🐞', '🍓', '🌼', '🍪'];
  const CH = [
    { n: 'Wilf', p: 'he', P: 'He', t: 'Wilf the fox' }, { n: 'Mrs Bramble', p: 'she', P: 'She', t: 'Mrs Bramble the badger' },
    { n: 'Ogden', p: 'he', P: 'He', t: 'Ogden the ogre' }, { n: 'Bettina', p: 'she', P: 'She', t: 'Bettina Bugbright' },
    { n: 'Mr Tuft', p: 'he', P: 'He', t: 'Mr Tuft' }, { n: 'Mum', p: 'she', P: 'She', t: 'Mum' }];
  const ITEMS = [['hazelnuts', '🌰'], ['acorns', '🌰'], ['berries', '🍓'], ['buttons', '🔘'], ['apples', '🍎'], ['biscuits', '🍪'], ['pebbles', '🪨'], ['sweets', '🍬']];

  /* ================= MATHS ================= */
  def('maths', 'count', 0, 2, L => {
    const n = L === 0 ? irnd(1, 8) : L === 1 ? irnd(5, 14) : irnd(11, 20);
    const html = (n <= 10 && Math.random() < 0.4) ? tenFrame(n) : objRows(pick(OBJ), n);
    return ch({ key: `maths:count:${n}`, q: 'How many can you count?', html, hint: 'Touch each one and count slowly.', explain: `There are ${nw(n)}.` }, n, near(n, 1, 20, L > 1 ? 3 : 2), L === 0 ? 3 : 4);
  }, 3);
  def('maths', 'onemore', 0, 4, L => {
    const more = Math.random() < 0.5; const step = (L >= 3 && Math.random() < 0.6) ? 10 : 1;
    const hi = [10, 20, 50, 100, 100][L];
    const n = more ? irnd(1, hi - step) : irnd(1 + step, hi); const ans = more ? n + step : n - step;
    const sw = step === 1 ? 'one' : 'ten', d = more ? 'more' : 'less';
    return ch({ key: `maths:one${d}:${step}:${n}`, q: `What is ${step} ${d} than ${n}?`, say: `What is ${sw} ${d} than ${nw(n)}?`, hint: step === 1 ? (more ? 'Count on one.' : 'Count back one.') : 'The tens digit changes by one.', explain: `${cap(sw)} ${d} than ${nw(n)} is ${nw(ans)}.` },
      ans, [n, ans + 1, ans - 1, more ? n - step : n + step].filter(x => x >= 0 && x <= 100), L < 2 ? 3 : 4);
  }, 2);
  def('maths', 'bonds', 0, 4, L => {
    const T = L === 0 ? 5 : L === 1 ? pick([5, 10, 10]) : L === 2 ? pick([10, 10, 20]) : L === 3 ? pick([10, 20, 20]) : pick([20, 100, 100]);
    const st = T === 100 ? 10 : 1; const a = T === 100 ? irnd(1, 9) * 10 : irnd(1, T - 1); const b = T - a;
    const w = []; for (let d = 1; d <= 3; d++) { w.push(b + d * st, b - d * st); } w.push(a);
    return ch({ key: `maths:bond:${a}+?=${T}`, q: `${a} + ? = ${T}`, say: `${nw(a)} plus what equals ${nw(T)}?`, html: (T <= 10 && L <= 1) ? tenFrame(a, T) : '', hint: `How many more to get to ${nw(T)}?`, explain: `${cap(nw(a))} and ${nw(b)} make ${nw(T)}.` },
      b, w.filter(x => x >= 1 && x <= T), L < 2 ? 3 : 4);
  }, 2);
  def('maths', 'add', 0, 4, L => {
    let a, b, vis = false;
    if (L === 0) { a = irnd(1, 4); b = irnd(1, 5 - a); vis = true; }
    else if (L === 1) { a = irnd(1, 9); b = irnd(1, 10 - a); vis = a + b <= 8 && Math.random() < 0.5; }
    else if (L === 2) { a = irnd(3, 16); b = irnd(2, 20 - a); }
    else if (L === 3) { if (Math.random() < 0.45) { a = irnd(1, 5) * 10; b = irnd(1, 5) * 10; } else { a = irnd(6, 16); b = irnd(3, 20 - a); } }
    else { const f = irnd(0, 2); if (f === 0) { a = irnd(11, 89); b = irnd(1, Math.min(9, 99 - a)); } else if (f === 1) { a = irnd(11, 79); b = irnd(1, Math.floor((99 - a) / 10)) * 10; } else { a = irnd(11, 59); b = irnd(11, 99 - a); } }
    const s = a + b; const e = pick(OBJ);
    const html = vis ? `<div class="pz-vis">${objRow(e, a)}<div class="pz-big">+</div>${objRow(e, b)}</div>` : '';
    return ch({ key: `maths:add:${a}+${b}`, q: `What is ${a} + ${b}?`, say: `What is ${nw(a)} plus ${nw(b)}?`, html, hint: L >= 4 ? 'Add the tens first, then the ones.' : 'Start at the bigger number and count on.', explain: `${cap(nw(a))} and ${nw(b)} make ${nw(s)}.` },
      s, near(s, 0, L <= 1 ? 10 : 100, 3).concat(L >= 3 && s + 10 <= 100 ? [s + 10] : []), L < 2 ? 3 : 4);
  }, 3);
  def('maths', 'sub', 0, 4, L => {
    let a, b;
    if (L === 0) { a = irnd(2, 5); b = irnd(1, a - 1); }
    else if (L === 1) { a = irnd(3, 10); b = irnd(1, a - 1); }
    else if (L === 2) { a = irnd(8, 20); b = irnd(2, Math.min(9, a - 1)); }
    else if (L === 3) { if (Math.random() < 0.4) { a = irnd(3, 10) * 10; b = irnd(1, a / 10 - 1) * 10; } else { a = irnd(11, 20); b = irnd(2, 9); } }
    else { const f = irnd(0, 2); if (f === 0) { a = irnd(21, 99); b = irnd(1, 9); } else if (f === 1) { a = irnd(31, 99); b = irnd(1, Math.floor(a / 10) - 1) * 10; } else { a = irnd(31, 99); b = irnd(11, a - 5); } }
    const s = a - b; const e = pick(OBJ);
    const html = (L === 0) ? `<div class="pz-vis"><div class="pz-row" style="font-size:44px;letter-spacing:4px">${e.repeat(a - b)}<span style="opacity:.25">${e.repeat(b)}</span></div></div>` : '';
    return ch({ key: `maths:sub:${a}-${b}`, q: `What is ${a} − ${b}?`, say: `What is ${nw(a)} take away ${nw(b)}?`, html, hint: 'Count back, or think what you add to the small number.', explain: `${cap(nw(a))} take away ${nw(b)} leaves ${nw(s)}.` },
      s, near(s, 0, L <= 1 ? a : 100, 3).concat(L >= 2 && a + b <= 100 ? [a + b] : []), L < 2 ? 3 : 4);
  }, 3);
  def('maths', 'missing', 1, 4, L => {
    let q, say, ans, key;
    const f = L === 1 ? 0 : irnd(0, L === 2 ? 1 : 2);
    if (L <= 3) {
      const c = L === 1 ? irnd(3, 10) : irnd(6, 20); const a = irnd(1, c - 1), b = c - a;
      if (f === 0) { ans = b; q = `${a} + <b>?</b> = ${c}`; say = `${nw(a)} plus what equals ${nw(c)}?`; }
      else if (f === 1) { ans = a; q = `<b>?</b> + ${b} = ${c}`; say = `What plus ${nw(b)} equals ${nw(c)}?`; }
      else { ans = b; q = `${c} − <b>?</b> = ${a}`; say = `${nw(c)} take away what equals ${nw(a)}?`; }
    } else {
      const a = irnd(11, 60), b = irnd(5, Math.min(39, 99 - a)), c = a + b;
      if (f === 0) { ans = b; q = `${a} + <b>?</b> = ${c}`; say = `${nw(a)} plus what equals ${nw(c)}?`; }
      else if (f === 1) { ans = a; q = `<b>?</b> + ${b} = ${c}`; say = `What plus ${nw(b)} equals ${nw(c)}?`; }
      else { ans = b; q = `${c} − <b>?</b> = ${a}`; say = `${nw(c)} take away what equals ${nw(a)}?`; }
    }
    return ch({ key: 'maths:miss:' + plain(q), q, say, hint: 'Which number is hiding? Try counting on or back.', explain: `The missing number is ${nw(ans)}.` }, ans, near(ans, 0, 100, 3), 4);
  }, 2);
  def('maths', 'doublehalf', 2, 4, L => {
    const dbl = Math.random() < 0.5; let n, ans;
    if (dbl) { n = L === 2 ? irnd(1, 10) : L === 3 ? irnd(5, 15) : irnd(11, 49); ans = n * 2; }
    else { n = (L === 2 ? irnd(1, 10) : L === 3 ? irnd(2, 15) : irnd(10, 50)) * 2; ans = n / 2; }
    const e = pick(OBJ); const html = (dbl && n <= 7) ? `<div class="pz-vis">${objRow(e, n)}${objRow(e, n)}</div>` : (!dbl && n <= 14) ? objRows(e, n) : '';
    return ch({ key: `maths:${dbl ? 'double' : 'half'}:${n}`, q: dbl ? `What is double ${n}?` : `What is half of ${n}?`, say: dbl ? `What is double ${nw(n)}?` : `What is half of ${nw(n)}?`, html,
      hint: dbl ? 'Double means add the same number again.' : 'Half means share into two equal groups.', explain: dbl ? `Double ${nw(n)} is ${nw(ans)}.` : `Half of ${nw(n)} is ${nw(ans)}.` }, ans, near(ans, 0, 100, 3).concat([n]), 4);
  });
  function baseTen(t, o) {
    let s = ''; for (let i = 0; i < t; i++) s += `<rect x="${i * 14}" y="6" width="10" height="64" fill="#4fc3f7" stroke="#0277bd"/>`;
    for (let i = 0; i < o; i++) s += `<rect x="${t * 14 + 14 + (i % 3) * 13}" y="${6 + Math.floor(i / 3) * 13}" width="10" height="10" fill="#ffb74d" stroke="#e65100"/>`;
    return `<div class="pz-vis"><svg viewBox="0 0 ${t * 14 + 66} 76" width="${(t * 14 + 66) * 1.6}" height="122">${s}</svg></div>`;
  }
  def('maths', 'place', 2, 4, L => {
    const hi = L === 2 ? 39 : L === 3 ? 69 : 99;
    const n = irnd(11, hi), t = Math.floor(n / 10), o = n % 10; const sw = `${nw(t)} tens and ${nw(o)} ones`;
    const f = irnd(0, L === 2 ? 2 : 3);
    if (f === 0 && n <= 59 && n % 10 !== 0) return ch({ key: `maths:bt:${n}`, q: 'What number is this?', say: 'The long sticks are tens and the little squares are ones. What number is this?', html: baseTen(t, o), hint: 'Count the tens, then the ones.', explain: `${cap(nw(t))} tens and ${nw(o)} ones make ${nw(n)}.` }, n, [o * 10 + t, n + 10, n - 10, n + 1, n - 1].filter(x => x > 0 && x <= 100), 4);
    if (f === 1 || f === 0) return ch({ key: `maths:tens:${n}`, q: `How many tens and ones in ${n}?`, say: `How many tens and ones are in ${nw(n)}?`, hint: 'The first digit is the tens.', explain: `${cap(nw(n))} has ${sw}.` },
      `${t} tens and ${o} ones`, [`${o} tens and ${t} ones`, `${t + 1} tens and ${o} ones`, `${t} tens and ${o + 1} ones`], 3);
    if (f === 2) return ch({ key: `maths:tensval:${t}:${o}`, q: `What is ${t} tens and ${o} ones?`, say: `What is ${nw(t)} tens and ${nw(o)} ones?`, hint: 'Tens first, then ones.', explain: `${cap(sw)} make ${nw(n)}.` }, n, [o * 10 + t, n + 10, n - 10, n + 1].filter(x => x > 0 && x <= 100), 4);
    const useT = Math.random() < 0.5; if (t === o || o === 0) return null;
    return ch({ key: `maths:val:${n}:${useT ? 't' : 'o'}`, q: `In ${n}, what is the value of the <b>${useT ? t : o}</b>?`, say: `In ${nw(n)}, what is the value of the ${nw(useT ? t : o)}?`, hint: 'Is it in the tens place or the ones place?', explain: useT ? `It is ${nw(t * 10)}.` : `It is ${nw(o)}.` },
      useT ? t * 10 : o, useT ? [t, o, o * 10, n] : [o * 10, t, t * 10, n], 4);
  });
  def('maths', 'skip', 2, 4, L => {
    const st = pick(L === 2 ? [2, 10] : L === 3 ? [2, 5, 10] : [2, 3, 5, 10]);
    const down = L >= 3 && Math.random() < 0.3;
    let start = st === 10 && L === 4 ? irnd(0, 5) * 10 + irnd(0, 9) : st * irnd(0, L === 2 ? 2 : 4);
    if (down) start = Math.max(start, st * 4) + (st === 10 && L === 4 ? 0 : 0);
    if (!down && start + 5 * st > 100) start = 0;
    const seq = []; for (let i = 0; i < 5; i++) seq.push(down ? start - i * st : start + i * st);
    if (seq.some(x => x < 0 || x > 100)) return null;
    const hole = (L >= 3 && Math.random() < 0.4) ? irnd(1, 3) : 4; const ans = seq[hole];
    const shown = seq.map((x, i) => i === hole ? '<b>?</b>' : x).slice(0, hole === 4 ? 4 : 5);
    const q = (hole === 4 ? 'What comes next? ' : 'What is missing? ') + shown.join(', ') + (hole === 4 ? ', <b>?</b>' : '');
    const say = (hole === 4 ? 'What comes next? ' : 'What number is missing? ') + seq.map((x, i) => i === hole ? 'blank' : x).slice(0, hole === 4 ? 4 : 5).join(', ');
    return ch({ key: `maths:skip:${st}:${down ? 'd' : 'u'}:${seq[0]}:${hole}`, q, say, hint: `Count ${down ? 'back' : 'on'} in ${nw(st)}s.`, explain: `We are counting ${down ? 'back ' : ''}in ${nw(st)}s, so the number is ${nw(ans)}.` },
      ans, [ans + 1, ans - 1, ans + st, ans - st].filter(x => x >= 0 && x <= 100), 4);
  });
  def('maths', 'oddeven', 3, 4, L => {
    const hi = L === 3 ? 20 : 99; const f = Math.random() < 0.6;
    if (f) {
      const n = irnd(L === 3 ? 1 : 11, hi); const even = n % 2 === 0;
      let html = ''; if (n <= 12) { for (let i = 0; i < n; i += 2) html += objRow('🍎', Math.min(2, n - i), 34); html = `<div class="pz-vis">${html}</div>`; }
      return ch({ key: `maths:oe:${n}`, q: `Is ${n} odd or even?`, say: `Is ${nw(n)} odd or even?`, html, hint: 'Even numbers can be shared into pairs. They end in 0, 2, 4, 6 or 8.', explain: `${cap(nw(n))} is ${even ? 'even' : 'odd'}.` }, even ? 'Even' : 'Odd', [even ? 'Odd' : 'Even'], 2);
    }
    const askEven = Math.random() < 0.5; const nums = new Set(); const lo = L === 3 ? 1 : 11;
    const want = irnd(lo, hi); const target = askEven ? (want % 2 ? want + 1 : want) : (want % 2 ? want : want + 1);
    const wr = []; while (wr.length < 2) { let x = irnd(lo, hi); if ((x % 2 === 0) === askEven) x = x === hi ? x - 1 : x + 1; if (!wr.includes(x) && x !== target && (x % 2 === 0) !== askEven) wr.push(x); }
    return ch({ key: `maths:oe2:${askEven ? 'e' : 'o'}:${target}`, q: `Which of these is ${askEven ? 'an even' : 'an odd'} number?`, hint: 'Even numbers end in 0, 2, 4, 6 or 8.', explain: `${cap(nw(target))} is ${askEven ? 'even' : 'odd'}.` }, target, wr, 3);
  });
  def('maths', 'groups', 3, 4, L => {
    const s = pick(L === 3 ? [2, 5, 10] : [2, 3, 5, 10]); const g = L === 3 ? irnd(2, s === 10 ? 4 : 5) : irnd(2, s === 10 ? 10 : 9); const ans = g * s;
    if (ans > 100) return null; const e = pick(OBJ);
    let html = ''; if (ans <= 30) { for (let i = 0; i < g; i++) html += `<div class="pz-row" style="font-size:30px;border:2px dashed #aaa;border-radius:12px;padding:4px 8px;margin:4px">${e.repeat(s)}</div>`; html = `<div class="pz-vis">${html}</div>`; }
    return ch({ key: `maths:grp:${g}x${s}`, q: L === 3 ? `${g} groups of ${s}. How many altogether?` : `${g} × ${s} = ?`, say: L === 3 ? `${nw(g)} groups of ${nw(s)}. How many altogether?` : `What is ${nw(g)} times ${nw(s)}?`, html, hint: `Count in ${nw(s)}s, ${nw(g)} times.`, explain: `${cap(nw(g))} groups of ${nw(s)} make ${nw(ans)}.` },
      ans, [g + s, ans + s, ans - s, ans + 1, ans - 1].filter(x => x > 0 && x <= 100), 4);
  });
  def('maths', 'share', 3, 4, L => {
    const k = pick(L === 3 ? [2, 2, 5, 10] : [2, 3, 4, 5, 10]); const each = irnd(2, k === 10 ? 4 : k >= 4 ? 5 : 8); const n = k * each; const c = pick(CH); const it = pick(ITEMS);
    return ch({ key: `maths:share:${n}/${k}`, q: `Share ${n} ${it[0]} between ${k}. How many each?`, say: `${c.n} shares ${nw(n)} ${it[0]} equally between ${nw(k)} friends. How many does each friend get?`, html: n <= 20 ? objRows(it[1], n) : '', hint: 'Deal them out one at a time, like cards.', explain: `${cap(nw(n))} shared between ${nw(k)} is ${nw(each)} each.` },
      each, [each + 1, each - 1, each + 2, n - k, k].filter(x => x > 0), 4);
  });
  function sector(cx, cy, r, i, k) {
    const a0 = (-90 + 360 * i / k) * Math.PI / 180, a1 = (-90 + 360 * (i + 1) / k) * Math.PI / 180;
    return `M${cx} ${cy}L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)}A${r} ${r} 0 ${360 / k > 180 ? 1 : 0} 1 ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)}Z`;
  }
  def('maths', 'fracshape', 3, 4, L => {
    const opts = L === 3 ? [[2, 1], [4, 1], [2, 1], [4, 1]] : [[2, 1], [4, 1], [4, 3], [3, 1]]; const [k, s] = pick(opts); const circ = Math.random() < 0.5; let b = '';
    if (circ) for (let i = 0; i < k; i++) b += `<path d="${sector(60, 60, 50, i, k)}" fill="${i < s ? '#ffa726' : '#fff'}" stroke="#333" stroke-width="3"/>`;
    else for (let i = 0; i < k; i++) b += `<rect x="${10 + i * 100 / k}" y="25" width="${100 / k}" height="70" fill="${i < s ? '#ffa726' : '#fff'}" stroke="#333" stroke-width="3"/>`;
    const lab = { '1/2': '½', '1/4': '¼', '3/4': '¾', '1/3': '⅓' }; const c = lab[s + '/' + k];
    return ch({ key: `maths:fs:${s}/${k}:${circ ? 'c' : 'r'}`, q: 'What fraction is coloured in?', say: 'What fraction of the shape is coloured in?', html: `<div class="pz-vis"><svg viewBox="0 0 120 120" width="150" height="150">${b}</svg></div>`, hint: 'Count all the equal parts, then the coloured ones.', explain: `${{ '½': 'One half', '¼': 'One quarter', '¾': 'Three quarters', '⅓': 'One third' }[c]} is coloured in.` },
      c, ['½', '¼', '¾', '⅓'], L === 3 ? 3 : 4);
  });
  def('maths', 'fracamount', 3, 4, L => {
    const kinds = L === 3 ? [2, 2, 4] : [2, 4, 3]; const k = pick(kinds); const ans = irnd(1, L === 3 ? (k === 2 ? 10 : 5) : (k === 2 ? 25 : k === 4 ? 10 : 10)); const n = ans * k; if (n > 100) return null;
    const nm = { 2: 'half', 4: 'a quarter', 3: 'a third' }[k]; const e = pick(OBJ);
    return ch({ key: `maths:fa:${k}:${n}`, q: `What is ${nm} of ${n}?`, say: `What is ${nm} of ${nw(n)}?`, html: n <= 20 ? objRows(e, n) : '', hint: `Share ${nw(n)} into ${nw(k)} equal groups.`, explain: `${cap(nm)} of ${nw(n)} is ${nw(ans)}.` },
      ans, [ans + 1, ans - 1, n / 2 === ans ? n / 4 : n / 2, n - ans, ans + 2].filter(x => x > 0 && x === Math.floor(x)), 4);
  });
  def('maths', 'compare', 0, 4, L => {
    if (L <= 1) {
      const hi = L === 0 ? 10 : 20; let a = irnd(1, hi), b = irnd(1, hi); if (a === b) b = a === hi ? a - 1 : a + 1; const big = Math.random() < 0.5;
      return ch({ key: `maths:cmpn:${big ? 'b' : 's'}:${Math.min(a, b)}:${Math.max(a, b)}`, q: `Which number is ${big ? 'bigger' : 'smaller'}?`, say: `Which number is ${big ? 'bigger' : 'smaller'}, ${nw(a)} or ${nw(b)}?`, hint: 'Count: the number you say later is bigger.', explain: `${cap(nw(big ? Math.max(a, b) : Math.min(a, b)))} is ${big ? 'bigger' : 'smaller'}.` }, big ? Math.max(a, b) : Math.min(a, b), [big ? Math.min(a, b) : Math.max(a, b)], 2);
    }
    const hi = L === 2 ? 20 : L === 3 ? 50 : 100; const a = irnd(1, hi); let b = Math.random() < (L >= 3 ? 0.15 : 0.05) ? a : irnd(1, hi);
    if (L === 4 && a > 10 && a % 10 !== 0 && Math.random() < 0.3) b = (a % 10) * 10 + Math.floor(a / 10); if (b < 1 || b > 100) return null;
    const sym = a < b ? '<' : a > b ? '>' : '=';
    return ch({ key: `maths:cmp:${a}?${b}`, q: `Which sign goes in the gap?`, say: `Which sign goes between ${nw(a)} and ${nw(b)}: less than, greater than, or equals?`, html: `<div class="pz-vis"><div class="pz-big">${a}</div><div class="pz-gap"></div><div class="pz-big">${b}</div></div>`, hint: 'The sign opens towards the bigger number.', explain: `${cap(nw(a))} is ${a < b ? 'less than' : a > b ? 'greater than' : 'equal to'} ${nw(b)}.` }, sym, ['<', '>', '='], 3);
  }, 2);
  def('maths', 'order', 0, 4, L => {
    const cnt = [3, 4, 4, 5, 5][L], hi = [10, 20, 50, 100, 99][L], lo = L === 2 ? 10 : 1; const set = new Set();
    if (L === 4) { const t = irnd(1, 8); while (set.size < 3) set.add(t * 10 + irnd(0, 9)); while (set.size < cnt) set.add(irnd(11, hi)); } else while (set.size < cnt) set.add(irnd(lo, hi));
    const asc = L < 2 || Math.random() < 0.6; const sorted = [...set].sort((a, b) => a - b); const sol = asc ? sorted : sorted.slice().reverse();
    return ord({ key: `maths:order:${asc ? 'a' : 'd'}:${sorted.join(',')}`, q: `Put the numbers in order, ${asc ? 'smallest' : 'biggest'} first.`, hint: 'Find the smallest (or biggest) first.', explain: `${sol.map(nw).join(', ')}.` }, sol);
  }, 2);
  def('maths', 'wordprob', 1, 4, L => {
    const c = pick(CH), it = pick(ITEMS); const f = irnd(0, L >= 2 ? (L >= 4 ? 4 : 3) : 1); let q, say, ans, key, hint = 'Is it adding or taking away?';
    if (f === 0) { const a = irnd(2, L === 1 ? 6 : L === 2 ? 12 : L === 3 ? 12 : 45), b = irnd(1, L === 1 ? 10 - a : L === 2 ? 20 - a : L === 3 ? 20 - a : 50); if (b < 1) return null; ans = a + b; q = `${c.n} has ${a} ${it[0]} and finds ${b} more. How many now?`; say = `${c.n} has ${nw(a)} ${it[0]} and finds ${nw(b)} more. How many ${it[0]} does ${c.p} have now?`; key = `add:${a}+${b}`; }
    else if (f === 1) { const a = irnd(3, L === 1 ? 10 : 20), b = irnd(1, a - 1); ans = a - b; q = `${c.n} has ${a} ${it[0]} and gives away ${b}. How many left?`; say = `${c.n} has ${nw(a)} ${it[0]} and gives away ${nw(b)}. How many are left?`; key = `sub:${a}-${b}`; }
    else if (f === 2) { const a = irnd(5, 30), b = irnd(1, a - 1); if (a > 20 && L < 4) return null; const d = pick(CH.filter(x => x !== c)); ans = a - b; q = `${c.n} has ${a} ${it[0]}. ${d.n} has ${b}. How many more has ${c.n}?`; say = `${c.n} has ${nw(a)} ${it[0]}. ${d.n} has ${nw(b)}. How many more does ${c.n} have?`; key = `diff:${a}-${b}`; hint = 'Find the difference between the two numbers.'; }
    else if (f === 3) { const s = pick([2, 5, 10]), g = irnd(2, 5); ans = s * g; q = `${g} baskets with ${s} ${it[0]} in each. How many altogether?`; say = `${c.n} has ${nw(g)} baskets. There are ${nw(s)} ${it[0]} in each basket. How many ${it[0]} altogether?`; key = `mul:${g}x${s}`; hint = `Count in ${nw(s)}s.`; }
    else { const a = irnd(20, 50), b = irnd(5, 15), d = irnd(5, 20); ans = a - b + d; if (ans > 100) return null; q = `${c.n} has ${a} ${it[0]}, eats ${b}, then finds ${d} more. How many now?`; say = `${c.n} has ${nw(a)} ${it[0]}. ${c.P} eats ${nw(b)}, then finds ${nw(d)} more. How many now?`; key = `two:${a}-${b}+${d}`; hint = 'Do it in two steps.'; }
    return ch({ key: `maths:wp:${c.n}:${key}`, q, say, hint, explain: `The answer is ${nw(ans)}.` }, ans, near(ans, 0, 100, 3), L < 2 ? 3 : 4);
  }, 3);

  /* ================= WORDS ================= */
  const CVC = [['cat', '🐱'], ['dog', '🐶'], ['pig', '🐷'], ['hen', '🐔'], ['sun', '☀️'], ['bus', '🚌'], ['bed', '🛏️'], ['hat', '🎩'], ['bat', '🦇'], ['bug', '🐛'], ['fox', '🦊'], ['web', '🕸️'], ['rat', '🐀'], ['map', '🗺️'], ['van', '🚐'], ['log', '🪵'], ['nut', '🥜'], ['bin', '🗑️'], ['box', '📦'], ['leg', '🦵']];
  const CCVC = [['frog', '🐸'], ['crab', '🦀'], ['drum', '🥁'], ['flag', '🚩'], ['clap', '👏'], ['stop', '🛑'], ['tent', '⛺'], ['milk', '🥛'], ['hand', '✋']];
  const INIT = [['a', 'apple', '🍎'], ['a', 'ant', '🐜'], ['b', 'bus', '🚌'], ['c', 'cat', '🐱'], ['d', 'dog', '🐶'], ['e', 'egg', '🥚'], ['f', 'fox', '🦊'], ['g', 'goat', '🐐'], ['h', 'hen', '🐔'], ['k', 'key', '🔑'], ['l', 'leg', '🦵'], ['m', 'map', '🗺️'], ['n', 'nut', '🥜'], ['o', 'orange', '🍊'], ['p', 'pig', '🐷'], ['r', 'rat', '🐀'], ['s', 'sun', '☀️'], ['t', 'tree', '🌳'], ['u', 'umbrella', '☂️'], ['v', 'van', '🚐'], ['w', 'web', '🕸️'], ['z', 'zebra', '🦓']];
  const LETTERS = INIT.map(x => x[0]).filter((x, i, a) => a.indexOf(x) === i);
  def('words', 'initial', 0, 1, L => {
    const [l, w, e] = pick(INIT);
    return ch({ key: `words:init:${w}`, q: `What sound does <b>${w}</b> start with?`, say: `This is ${/^[aeiou]/.test(w) ? 'an' : 'a'} ${w}. What sound does ${w} start with?`, html: bigE(e), hint: `Say ${w} slowly and listen to the first sound.`, explain: `${cap(w)} starts with ${l}.` }, l, LETTERS.filter(x => x !== l), L === 0 ? 3 : 4);
  }, 2);
  def('words', 'whichpic', 0, 1, L => {
    const [l, w, e] = pick(INIT); const others = INIT.filter(x => x[0] !== l); const pics = shuffle(others).filter((x, i, a) => a.findIndex(y => y[0] === x[0]) === i).slice(0, 3).map(x => x[2]);
    return ch({ key: `words:pic:${l}:${w}`, q: `Which picture starts with the sound <b>${l}</b>?`, say: `Which picture starts with the sound ${l}?`, hint: 'Say each picture name and listen to the first sound.', explain: `${cap(w)} starts with ${l}.` }, e, pics, L === 0 ? 3 : 4);
  });
  def('words', 'picword', 1, 4, L => {
    const pool = L >= 3 ? CVC.concat(CCVC) : CVC; const [w, e] = pick(pool);
    let sim = pool.filter(o => o[0] !== w && (L >= 2 && (o[0][0] === w[0] || o[0].slice(-1) === w.slice(-1)))); if (sim.length < 2) sim = pool.filter(o => o[0] !== w);
    return ch({ key: `words:word:${w}`, q: 'Which word matches the picture?', say: 'Which word matches this picture? Sound it out.', html: bigE(e), hint: 'Sound out each letter, then blend them together.', explain: `The word is ${w}.` }, w, sim.map(o => o[0]), L === 1 ? 3 : 4);
  }, 2);
  def('words', 'build', 1, 3, L => {
    const [w, e] = pick(L >= 3 ? CCVC : CVC);
    return ord({ key: `words:build:${w}`, q: 'Tap the letters to spell the word.', say: `Spell the word ${w}. Tap the letters in order.`, html: bigE(e), hint: 'Say the word slowly and listen for each sound.', explain: `${w.split('').join(', ')} spells ${w}.` }, w.split(''));
  }, 2);
  const RHY = [['cat', 'hat', 'bat', 'mat', 'rat', 'sat'], ['dog', 'log', 'frog', 'fog', 'jog'], ['pig', 'wig', 'dig', 'big', 'fig'], ['sun', 'bun', 'run', 'fun'], ['hen', 'pen', 'ten', 'men', 'den'], ['bug', 'mug', 'rug', 'hug', 'jug'], ['bee', 'tree', 'knee', 'three'], ['boat', 'goat', 'coat'], ['rain', 'train', 'plane', 'chain'], ['star', 'car', 'jar', 'bar'], ['light', 'night', 'kite', 'bite', 'right'], ['fish', 'dish', 'wish'], ['moon', 'spoon', 'soon'], ['cake', 'lake', 'snake', 'bake'], ['bed', 'red', 'head', 'shed'], ['ball', 'wall', 'tall', 'small'], ['king', 'ring', 'sing', 'wing'], ['hop', 'top', 'shop', 'mop', 'stop']];
  def('words', 'rhyme', 1, 3, L => {
    const si = irnd(0, RHY.length - 1), set = RHY[si]; const t = pick(set), r = pick(set.filter(x => x !== t));
    const wr = shuffle(RHY.filter((_, i) => i !== si)).slice(0, 3).map(s => pick(s));
    return ch({ key: `words:rhyme:${t}:${r}`, q: `Which word rhymes with <b>${t}</b>?`, say: `Which word rhymes with ${t}?`, hint: 'Rhyming words sound the same at the end.', explain: `${cap(t)} and ${r} rhyme.` }, r, wr, L === 1 ? 3 : 4);
  }, 2);
  const DG = [['ship', '🚢', 'sh'], ['fish', '🐟', 'sh'], ['shell', '🐚', 'sh'], ['chick', '🐥', 'ch'], ['cherry', '🍒', 'ch'], ['chips', '🍟', 'ch'], ['thumb', '👍', 'th'], ['bath', '🛁', 'th'], ['king', '🤴', 'ng'], ['ring', '💍', 'ng'], ['song', '🎵', 'ng'], ['rain', '🌧️', 'ai'], ['snail', '🐌', 'ai'], ['train', '🚂', 'ai'], ['mail', '✉️', 'ai'], ['bee', '🐝', 'ee'], ['tree', '🌳', 'ee'], ['feet', '🦶', 'ee'], ['light', '💡', 'igh'], ['night', '🌃', 'igh'], ['boat', '⛵', 'oa'], ['goat', '🐐', 'oa'], ['coat', '🧥', 'oa'], ['soap', '🧼', 'oa'], ['moon', '🌙', 'oo'], ['spoon', '🥄', 'oo'], ['boot', '🥾', 'oo'], ['broom', '🧹', 'oo'], ['car', '🚗', 'ar'], ['star', '⭐', 'ar'], ['farm', '🚜', 'ar'], ['fork', '🍴', 'or'], ['corn', '🌽', 'or'], ['horse', '🐴', 'or']];
  def('words', 'digraph', 2, 4, L => {
    const ok = L === 2 ? ['sh', 'ch', 'th', 'ng', 'ai', 'ee', 'oa'] : ['sh', 'ch', 'th', 'ng', 'ai', 'ee', 'oa', 'igh', 'oo', 'ar', 'or'];
    const [w, e, d] = pick(DG.filter(x => ok.includes(x[2]))); const pool = ['sh', 'ch', 'th', 'ng'].includes(d) ? ['sh', 'ch', 'th', 'ng'] : ok.filter(x => !['sh', 'ch', 'th', 'ng'].includes(x));
    return ch({ key: `words:dg:${w}`, q: `Which letters make the special sound in <b>${w}</b>?`, say: `Which letters make the special sound in the word ${w}?`, html: bigE(e), hint: 'Say the word slowly. Two letters work together to make one sound.', explain: `${cap(w)} has the sound ${d}.` }, d, pool.filter(x => x !== d && !w.includes(x)), 3);
  }, 2);
  const EXC2 = ['the', 'said', 'was', 'you', 'they', 'are', 'here', 'there', 'where', 'put', 'have', 'like', 'some', 'come', 'were', 'what', 'when', 'your', 'she', 'one'];
  const EXC3 = ['friend', 'school', 'people', 'could', 'would', 'should', 'because', 'water', 'house', 'mother', 'father', 'again', 'once', 'ask', 'any', 'many', 'only', 'our', 'door', 'floor', 'poor', 'busy', 'hour', 'move', 'great', 'break', 'pretty', 'after', 'class', 'grass', 'plant', 'path', 'who', 'whole', 'every', 'told', 'old', 'child', 'climb', 'most', 'both', 'sure', 'sugar', 'eye'];
  function misspell(w) {
    const r = new Set(); const V = 'aeiou';
    for (let i = 0; i < w.length - 1; i++) if (w[i] !== w[i + 1]) r.add(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2));
    for (let i = 0; i < w.length; i++) { if (w.length > 3) r.add(w.slice(0, i) + w.slice(i + 1)); if (V.includes(w[i])) for (const v of V) if (v !== w[i]) r.add(w.slice(0, i) + v + w.slice(i + 1)); r.add(w.slice(0, i) + w[i] + w.slice(i)); }
    r.add(w + 'e'); return [...r].filter(x => x !== w && !EXC2.includes(x) && !EXC3.includes(x) && x.length >= 2);
  }
  def('words', 'exception', 2, 4, L => {
    const pool = L === 2 ? EXC2 : L === 3 ? EXC2.concat(EXC3.slice(0, 22)) : EXC2.concat(EXC3); const w = pick(pool);
    return ch({ key: `words:exc:${w}`, q: `Which one spells <b>${w}</b>?`, say: `Which one is the right spelling of the word ${w}?`, hint: 'Some words are tricky. Look at every letter.', explain: `${cap(w)} is spelt ${w.split('').join(', ')}.` }, w, shuffle(misspell(w)), L === 2 ? 3 : 4);
  }, 2);
  const SENT = ['The cat sat on the mat.', 'Wilf has a red hat.', 'I can see a big bus.', 'Mum is in the garden.', 'We went to the park.', 'The sun is hot today.', 'Ogden likes to eat jam.', 'Mrs Bramble made a pie.', 'Bettina found a ladybird.', 'Mr Tuft has a new spade.', 'The frog is in the pond.', 'Wilf and Mum went home.'];
  def('words', 'capstop', 2, 4, L => {
    const s = pick(SENT); const names = ['Wilf', 'Mum', 'Ogden', 'Bettina', 'Mr Tuft', 'Mrs Bramble'];
    const lowFirst = s[0].toLowerCase() + s.slice(1), noStop = s.slice(0, -1); const w = [lowFirst, noStop];
    let inner = s; for (const n of names) if (s.indexOf(n) > 0) inner = inner.replace(n, n.toLowerCase()); if (inner !== s) w.push(inner); else w.push(lowFirst.slice(0, -1));
    return ch({ key: `words:cap:${s}`, q: 'Which sentence is written correctly?', say: 'Which sentence has a capital letter at the start and a full stop at the end?', hint: 'Start with a capital letter. End with a full stop.', explain: 'A sentence starts with a capital letter and ends with a full stop.' }, s, w, 3);
  });
  const QS = ['Where is my hat', 'Can you see the bird', 'What is your name', 'Who is at the door', 'Is it raining', 'Do you like jam', 'How old are you'];
  const STS = ['The bird is blue', 'I like jam', 'It is raining', 'Wilf has a hat', 'The sun is hot'];
  const EXS = ['Hooray, we won', 'Wow, that is huge', 'Look out, a big bee', 'Stop, there is a frog'];
  def('words', 'punct', 3, 4, L => {
    const f = irnd(0, L === 4 ? 2 : 1);
    if (f === 0) { const q = pick(QS); return ch({ key: `words:pq:${q}`, q: `${q} <b>▢</b>`, say: `${q}. Which mark goes at the end? A full stop, a question mark or a comma?`, hint: 'Asking a question? Use a question mark.', explain: 'A question ends with a question mark.' }, '?', ['.', ','], 3); }
    if (f === 1) { const q = pick(QS), s = shuffle(STS).slice(0, 2); return ch({ key: `words:pq2:${q}`, q: 'Which one is a question?', say: 'Which one of these is a question?', hint: 'A question asks something and ends with a question mark.', explain: 'A question ends with a question mark.' }, q + '?', s.map(x => x + '.'), 3); }
    const x = pick(EXS); return ch({ key: `words:px:${x}`, q: `${x} <b>▢</b>`, say: `${x}. Which mark shows we are excited? An exclamation mark, a full stop or a question mark?`, hint: 'An exclamation mark shows a big feeling.', explain: 'An exclamation mark shows excitement.' }, '!', ['.', '?'], 3);
  });
  const SORD = [[1, 'The cat sat.', 'I can run.', 'Wilf is big.', 'A dog can dig.', 'Mum is here.', 'The sun is hot.'], [2, 'The dog ran up the hill.', 'Wilf has a red hat.', 'I like to play in the park.', 'Mum can see a big bus.', 'The frog sat on a log.'], [3, 'Mrs Bramble made a big apple pie.', 'We went to the park and played.', 'The little frog hopped into the pond.', 'Bettina found a shiny beetle.'], [4, 'Ogden the ogre sat down by the old tree.', 'Bettina found a shiny beetle in the garden.', 'After school we went home for our tea.', 'Mr Tuft planted some seeds in the garden.']];
  def('words', 'sentorder', 1, 4, L => {
    const g = SORD[L - 1]; const s = pick(g.slice(1)); const wd = s.split(' ');
    return ord({ key: `words:sent:${s}`, q: 'Put the words in order to make a sentence.', say: 'Put the words in order to make a sentence.', hint: 'Which word starts the sentence? It has a capital letter.', explain: s }, wd);
  }, 2);
  const PL = [['cat', '🐱', 's'], ['dog', '🐶', 's'], ['hen', '🐔', 's'], ['pig', '🐷', 's'], ['bee', '🐝', 's'], ['hat', '🎩', 's'], ['fox', '🦊', 'es'], ['bus', '🚌', 'es'], ['box', '📦', 'es'], ['peach', '🍑', 'es'], ['church', '⛪', 'es'], ['watch', '⌚', 'es'], ['baby', '👶', 'ies'], ['fly', '🪰', 'ies'], ['cherry', '🍒', 'ies']];
  def('words', 'plural', 3, 4, L => {
    const [w, e, k] = pick(PL.filter(x => L === 4 || x[2] !== 'ies')); const pl = k === 'ies' ? w.slice(0, -1) + 'ies' : w + k;
    const wr = [w, w + 's', w + 'es', k === 'ies' ? w + 'ies' : w + 'ies'].filter(x => x !== pl);
    return ch({ key: `words:plural:${w}`, q: `One ${w}, two ____ .`, say: `One ${w}. Two what? Which word fits the gap?`, html: `<div class="pz-vis"><div class="pz-row" style="font-size:44px">${e}</div><div class="pz-big">→</div><div class="pz-row" style="font-size:44px">${e}${e}</div></div>`, hint: k === 's' ? 'Just add s.' : k === 'es' ? 'Words ending in x, s, ch or sh add es.' : 'Change the y to ies.', explain: `One ${w}, two ${pl}.` }, pl, wr, 4);
  });
  const VERBS = [['jump', 'jumped', 'jumping'], ['walk', 'walked', 'walking'], ['play', 'played', 'playing'], ['look', 'looked', 'looking'], ['help', 'helped', 'helping'], ['paint', 'painted', 'painting'], ['talk', 'talked', 'talking'], ['kick', 'kicked', 'kicking'], ['plant', 'planted', 'planting'], ['climb', 'climbed', 'climbing'], ['hop', 'hopped', 'hopping'], ['clap', 'clapped', 'clapping'], ['skip', 'skipped', 'skipping'], ['bake', 'baked', 'baking'], ['smile', 'smiled', 'smiling'], ['wave', 'waved', 'waving']];
  def('words', 'suffix', 3, 4, L => {
    const [b, ed, ing] = pick(VERBS.slice(0, L === 3 ? 10 : 16)); const c = pick(CH); const past = Math.random() < 0.5;
    const naive = past ? b + 'ed' : b + 'ing'; const correct = past ? ed : ing; const wr = [b, past ? ing : ed, b + 's', naive].filter(x => x !== correct);
    return ch({ key: `words:suffix:${b}:${past ? 'ed' : 'ing'}`, q: past ? `Yesterday, ${c.n} ____ (${b}).` : `Right now, ${c.n} is ____ (${b}).`, say: past ? `Yesterday, ${c.n} blank. Which word fits? ${b}.` : `Right now, ${c.n} is blank. Which word fits? ${b}.`, hint: past ? 'Yesterday means it has already happened. Add ed.' : 'Right now means it is happening. Add ing.', explain: past ? `Yesterday, ${c.n} ${ed}.` : `Right now, ${c.n} is ${ing}.` }, correct, wr, 4);
  });
  const COMP = [['sun', 'flower'], ['foot', 'ball'], ['rain', 'bow'], ['butter', 'fly'], ['tooth', 'brush'], ['bed', 'room'], ['play', 'ground'], ['gold', 'fish'], ['snow', 'man'], ['cup', 'cake'], ['star', 'fish'], ['birth', 'day'], ['rain', 'coat'], ['hair', 'brush'], ['note', 'book'], ['post', 'man'], ['dog', 'house'], ['tree', 'house'], ['sand', 'castle'], ['pan', 'cake']];
  def('words', 'compound', 3, 4, L => {
    const [a, b] = pick(COMP); const all = COMP.map(x => x.join('')); const w = shuffle(COMP).slice(0, 6).flatMap(x => [a + x[1], x[0] + b, b + a]).filter(x => !all.includes(x));
    return ch({ key: `words:comp:${a}${b}`, q: `${a} + ${b} = ?`, say: `${a} and ${b} join to make which word?`, hint: 'Put the two small words together to make one big word.', explain: `${cap(a)} and ${b} make ${a}${b}.` }, a + b, w, 3);
  });
  const ADJ = ['big', 'little', 'happy', 'red', 'sleepy', 'noisy', 'tiny', 'kind'], NOUN = ['fox', 'pig', 'bird', 'frog', 'owl', 'hen', 'mouse', 'badger'], VERB = ['runs', 'jumps', 'sleeps', 'sings', 'hops', 'eats', 'digs', 'swims'];
  def('words', 'pos', 3, 4, L => {
    const a = pick(ADJ), n = pick(NOUN), v = pick(VERB); const t = pick([['noun', n, 'a naming word'], ['verb', v, 'a doing word'], ['adjective', a, 'a describing word']]);
    return ch({ key: `words:pos:${t[0]}:${a}${n}${v}`, q: `The ${a} ${n} ${v}.<br>Which word is the ${t[0]}?`, say: `The ${a} ${n} ${v}. Which word is the ${t[0]}? That is ${t[2]}.`, hint: `A ${t[0]} is ${t[2]}.`, explain: `${cap(t[1])} is the ${t[0]}.` }, t[1], [a, n, v].filter(x => x !== t[1]), 3);
  });
  const COLN = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], THINGS = ['kite', 'hat', 'ball', 'scarf', 'bucket', 'boat'], PLACES = ['park', 'beach', 'shop', 'pond', 'garden', 'hill'], ANIM = ['rabbit', 'hedgehog', 'duck', 'squirrel', 'beetle'], FOOD = ['carrot', 'biscuit', 'apple', 'nut'], ADJ2 = ['sleepy', 'hungry', 'shy', 'happy'];
  const storyHtml = t => `<div class="pz-vis"><div style="max-width:520px;font-size:24px;line-height:1.4;text-align:left;padding:8px 12px;background:#fff8e1;border-radius:12px;color:#333">${t}</div></div>`;
  def('words', 'comprehension', 2, 4, L => {
    const c = pick(CH); const f = irnd(0, L === 2 ? 2 : 5);
    if (f <= 2) {
      const col = pick(COLN), th = pick(THINGS), pl = pick(PLACES); const st = `${c.n} has a ${col} ${th}. ${c.P} takes it to the ${pl}.`;
      const kind = ['colour', 'place', 'who'][f];
      if (kind === 'colour') return ch({ key: `words:rc:col:${c.n}:${col}${th}`, q: `What colour is the ${th}?`, say: `${st} What colour is the ${th}?`, html: storyHtml(st), hint: 'Read the first sentence again.', explain: `The ${th} is ${col}.` }, col, COLN, 3);
      if (kind === 'place') return ch({ key: `words:rc:pl:${c.n}:${pl}${th}`, q: `Where does ${c.n} take it?`, say: `${st} Where does ${c.n} take it?`, html: storyHtml(st), hint: 'Read the second sentence again.', explain: `${c.n} takes it to the ${pl}.` }, pl, PLACES, 3);
      return ch({ key: `words:rc:who:${c.n}:${col}${th}`, q: `Who has a ${col} ${th}?`, say: `${st} Who has a ${col} ${th}?`, html: storyHtml(st), hint: 'Read the first sentence again.', explain: `${c.n} has the ${col} ${th}.` }, c.n, CH.map(x => x.n), 3);
    }
    const an = pick(ANIM), pl = pick(PLACES), ad = pick(ADJ2), fd = pick(FOOD); const st = `${c.n} sees a ${an} by the ${pl}. The ${an} is ${ad}. ${c.P} gives it a ${fd}.`; const kind = f - 3;
    if (kind === 0) return ch({ key: `words:rc:an:${c.n}:${an}${pl}`, q: `What animal does ${c.n} see?`, say: `${st} What animal does ${c.n} see?`, html: storyHtml(st), hint: 'Read the first sentence.', explain: `${c.n} sees a ${an}.` }, an, ANIM, 3);
    if (kind === 1) return ch({ key: `words:rc:ad:${c.n}:${an}${ad}`, q: `How is the ${an}?`, say: `${st} How is the ${an}?`, html: storyHtml(st), hint: 'Read the second sentence.', explain: `The ${an} is ${ad}.` }, ad, ADJ2, 3);
    return ch({ key: `words:rc:fd:${c.n}:${an}${fd}`, q: `What does ${c.n} give the ${an}?`, say: `${st} What does ${c.n} give the ${an}?`, html: storyHtml(st), hint: 'Read the last sentence.', explain: `${c.n} gives it a ${fd}.` }, fd, FOOD, 3);
  }, 2);
  def('words', 'write', 0, 4, L => {
    let text, mode, e = '';
    if (L === 0) { text = pick('litocasunmdrpge'.split('')); mode = 'trace'; }
    else if (L === 1) { text = pick('abcdefghijklmnoprstuvw'.split('')); mode = 'fade'; }
    else if (L === 2) { const p = pick(CVC); text = p[0]; e = p[1]; mode = 'fade'; }
    else { const r = Math.random(); if (r < 0.45) { const p = pick(CVC.concat(CCVC)); text = p[0]; e = p[1]; } else if (L === 3) { text = pick(EXC2.slice(0, 10)); } else text = pick(EXC2.concat(EXC3.slice(0, 20))); mode = 'memory'; }
    const isL = text.length === 1;
    return { key: `words:write:${text}:${mode}`, type: 'write', write: { text, mode }, html: e ? bigE(e) : '', q: isL ? `${mode === 'trace' ? 'Trace' : 'Write'} the letter <b>${text}</b>` : `Write the word: <b>${text}</b> ${e}`, say: isL ? `${mode === 'trace' ? 'Trace' : 'Write'} the letter ${text}.` : `Write the word ${text}. ${mode === 'memory' ? 'Look carefully, then write it from memory.' : ''}`, hint: isL ? 'Start at the top and go slowly.' : 'Say each sound as you write it.', explain: isL ? 'Lovely writing!' : `You wrote ${text}.` };
  });

  /* ================= NATURE ================= */
  function cur(subject, id, lo, hi, list, w) {
    def(subject, id, lo, hi, L => {
      const idx = list.map((_, i) => i).filter(i => (list[i].l || 0) <= L); if (!idx.length) return null;
      const i = pick(idx), it = list[i];
      return ch({ key: `${subject}:${id}:${i}`, q: it.q, say: it.say, html: it.v ? bigE(it.v) : '', hint: it.h || 'Think about it carefully.', explain: it.x || `Yes, ${strip(it.c)}.` }, it.c, it.w, it.n || (L < 2 ? 3 : 4));
    }, w);
  }
  const dietList = [['🐰', 'rabbit', '🥕 carrots'], ['🐮', 'cow', '🌿 grass'], ['🐱', 'cat', '🐟 fish'], ['🐒', 'monkey', '🍌 bananas'], ['🐼', 'panda', '🎋 bamboo'], ['🐸', 'frog', '🪰 flies'], ['🐛', 'caterpillar', '🍃 leaves'], ['🐝', 'bee', '🌼 flowers'], ['🐑', 'sheep', '🌿 grass'], ['🐘', 'elephant', '🌿 leaves and grass']].map(([e, n, c], i) => ({ l: i > 5 ? 1 : 0, q: `What does a ${n} eat?`, v: e, c, w: ['🍕 pizza', '🍫 chocolate', '🍦 ice cream', '🧱 bricks', '🧦 socks'], x: `A ${n} eats ${strip(c)}.` }));
  cur('nature', 'diet', 0, 2, dietList, 2);
  const dTypes = { herbivore: [['🐰', 'rabbit'], ['🐮', 'cow'], ['🐑', 'sheep'], ['🐴', 'horse'], ['🦒', 'giraffe'], ['🐘', 'elephant'], ['🦌', 'deer']], carnivore: [['🦁', 'lion'], ['🐯', 'tiger'], ['🦈', 'shark'], ['🦅', 'eagle'], ['🐺', 'wolf'], ['🐊', 'crocodile']], omnivore: [['🐻', 'bear'], ['🐷', 'pig'], ['🦡', 'badger'], ['🦊', 'fox']] };
  def('nature', 'diettype', 3, 4, L => {
    const k = pick(Object.keys(dTypes)); const [e, n] = pick(dTypes[k]);
    return ch({ key: `nature:dt:${n}`, q: `Is a ${n} a herbivore, carnivore or omnivore?`, say: `Is a ${n} a herbivore, a carnivore or an omnivore?`, html: bigE(e), hint: 'Herbivores eat plants. Carnivores eat meat. Omnivores eat both.', explain: `A ${n} is a ${k}.` }, k, Object.keys(dTypes), 3);
  });
  const hab = [['🐳', 'whale', '🌊 sea', ['🏜️ desert', '🚜 farm', '🌴 jungle'], 0], ['🐸', 'frog', '🏞️ pond', ['🏜️ desert', '❄️ ice and snow', '🌊 sea'], 0], ['🐪', 'camel', '🏜️ desert', ['🌊 sea', '🏞️ pond', '❄️ ice and snow'], 0], ['🐧', 'penguin', '❄️ ice and snow', ['🏜️ desert', '🌴 jungle', '🚜 farm'], 1], ['🐮', 'cow', '🚜 farm', ['🌊 sea', '🏜️ desert', '❄️ ice and snow'], 0], ['🐒', 'monkey', '🌴 jungle', ['🌊 sea', '🏜️ desert', '❄️ ice and snow'], 1], ['🐿️', 'squirrel', '🌳 woods', ['🌊 sea', '🏜️ desert', '❄️ ice and snow'], 1], ['🦇', 'bat', '🕳️ cave', ['🌊 sea', '🏞️ pond', '🏜️ desert'], 2], ['🦆', 'duck', '🏞️ pond', ['🏜️ desert', '❄️ ice and snow', '🕳️ cave'], 1], ['🦉', 'owl', '🌳 woods', ['🌊 sea', '🏜️ desert', '❄️ ice and snow'], 1]].map(([e, n, c, w, l]) => ({ l, q: `Where does a ${n} live?`, v: e, c, w, x: `A ${n} lives ${/sea|pond|desert|jungle|farm|woods|cave|ice/.test(c) ? 'in' : 'in'} the ${strip(c).replace('ice and snow', 'ice and snow')}.` }));
  cur('nature', 'habitat', 0, 3, hab, 2);
  const AG = { mammal: [['🐶', 'dog'], ['🐱', 'cat'], ['🐮', 'cow'], ['🐘', 'elephant'], ['🦁', 'lion'], ['🐰', 'rabbit'], ['🐑', 'sheep'], ['🐻', 'bear'], ['🦇', 'bat', 1], ['🐬', 'dolphin', 1]], bird: [['🐔', 'hen'], ['🦆', 'duck'], ['🦉', 'owl'], ['🦅', 'eagle'], ['🐧', 'penguin', 1], ['🦜', 'parrot']], fish: [['🐟', 'fish'], ['🐠', 'tropical fish'], ['🦈', 'shark'], ['🐡', 'pufferfish']], reptile: [['🐍', 'snake'], ['🐢', 'turtle'], ['🦎', 'lizard'], ['🐊', 'crocodile']], amphibian: [['🐸', 'frog']], insect: [['🐝', 'bee'], ['🦋', 'butterfly'], ['🐞', 'ladybird'], ['🐜', 'ant'], ['🦗', 'cricket']] };
  def('nature', 'group', 0, 4, L => {
    const gs = L <= 1 ? ['mammal', 'bird', 'fish', 'insect'] : L === 2 ? ['mammal', 'bird', 'fish', 'insect', 'reptile'] : Object.keys(AG);
    const usable = g => AG[g].filter(a => !a[2] || L === 4); const g = pick(gs); const [e, n] = pick(usable(g));
    if (L >= 2 && Math.random() < 0.55) {
      const sg = L === 2 ? ['mammal', 'bird', 'fish', 'insect'] : gs;
      return ch({ key: `nature:grp2:${n}`, q: `What kind of animal is a ${n}?`, say: `What kind of animal is a ${n}?`, html: bigE(e), hint: 'Think about its skin, feathers, scales or legs.', explain: `A ${n} is ${/^[aeiou]/.test(g) ? 'an' : 'a'} ${g}.` }, g, sg, 4);
    }
    const others = gs.filter(x => x !== g); const wr = shuffle(others).slice(0, 3).map(x => pick(usable(x))[0]);
    return ch({ key: `nature:grp:${g}:${n}`, q: `Which one is ${/^[aeiou]/.test(g) ? 'an' : 'a'} ${g}?`, hint: g === 'bird' ? 'Birds have feathers and wings.' : g === 'fish' ? 'Fish live in water and have fins.' : g === 'insect' ? 'Insects have six legs.' : g === 'mammal' ? 'Mammals have fur or hair and feed milk to their babies.' : 'Think about what it is like.', explain: `A ${n} is ${/^[aeiou]/.test(g) ? 'an' : 'a'} ${g}.` }, e, wr, L < 2 ? 3 : 4);
  }, 2);
  const babies = [['🐮', 'cow', 'calf', 0], ['🐑', 'sheep', 'lamb', 0], ['🐶', 'dog', 'puppy', 0], ['🐱', 'cat', 'kitten', 0], ['🐔', 'hen', 'chick', 0], ['🐴', 'horse', 'foal', 1], ['🐷', 'pig', 'piglet', 1], ['🦆', 'duck', 'duckling', 1], ['🐸', 'frog', 'tadpole', 2], ['🦁', 'lion', 'cub', 1], ['🦋', 'butterfly', 'caterpillar', 3]]; const BN = babies.map(b => b[2]);
  cur('nature', 'baby', 1, 3, babies.map(([e, p, b, l]) => ({ l, q: `What is a baby ${p} called?`, v: e, c: b, w: BN.filter(x => x !== b), x: `A baby ${p} is called a ${b}.` })), 2);
  const PP = [['Which part of a plant is under the ground?', 'roots', '🌱'], ['Which part holds the plant up tall?', 'stem', '🌱'], ['Which part is green and flat and catches sunlight?', 'leaf', '🍃'], ['Which part has colourful petals?', 'flower', '🌸'], ['Which part can grow into a new plant?', 'seed', '🌰'], ['Which part takes in water from the soil?', 'roots', '🌱', 2], ['Which part do bees visit to get nectar?', 'flower', '🐝', 2]];
  cur('nature', 'plantparts', 1, 4, PP.map(([q, c, v, l]) => ({ l: l || 0, q, v, c, w: ['roots', 'stem', 'leaf', 'flower', 'seed'].filter(x => x !== c), x: `The ${c} ${c === 'roots' ? 'are' : 'is'} the answer.` })), 2);
  const needs = [['water', '💧 water'], ['sunlight', '☀️ sunlight'], ['soil', '🌱 soil'], ['air', '💨 air']];
  cur('nature', 'plantneeds', 0, 2, needs.map(([n, c]) => ({ q: 'Which one does a plant need to grow?', v: '🌻', c, w: ['🍫 chocolate', '📺 television', '🧦 socks', '🧸 toys'], h: 'Plants need water, light, air and soil.', x: `Plants need ${n} to grow.` })).concat([{ l: 1, q: 'What do we give a plant when the soil is dry?', v: '🪴', c: '💧 water', w: ['🍫 chocolate', '🧸 toys', '🧦 socks'], x: 'We give it water.' }]), 2);
  const LC = [[2, ['🌰 seed', '🌱 shoot', '🌿 plant', '🌻 flower'], 'a plant growing, starting with the seed'], [2, ['🥚 egg', '🐣 hatching', '🐥 chick', '🐔 hen'], 'a chicken growing up, starting with the egg'], [3, ['🥚 egg', '🐛 caterpillar', '🟤 chrysalis', '🦋 butterfly'], 'a butterfly growing, starting with the egg'], [3, ['🥚 frogspawn', '🐟 tadpole', '🐸 frog'], 'a frog growing, starting with the frogspawn']];
  def('nature', 'lifecycle', 2, 4, L => {
    const g = pick(LC.filter(x => x[0] <= L)); const i = LC.indexOf(g);
    return ord({ key: `nature:life:${i}`, q: 'Put the pictures in order.', say: `Put these in order to show ${g[2]}.`, hint: 'What happens first? What happens last?', explain: g[1].map(strip).join(', then ') + '.' }, g[1]);
  });
  cur('nature', 'weather', 0, 3, [
    { q: 'What do we use on a rainy day?', c: '☂️ umbrella', w: ['🕶️ sunglasses', '🛷 sledge', '🩴 flip-flops'], v: '🌧️', x: 'We use an umbrella when it rains.' },
    { q: 'What do we wear on a cold snowy day?', c: '🧤 gloves and a hat', w: ['🩳 shorts', '🕶️ sunglasses', '🩴 flip-flops'], v: '❄️', x: 'We wear gloves and a hat when it is cold.' },
    { q: 'Which season is the hottest?', c: '☀️ summer', w: ['❄️ winter', '🍂 autumn'], v: '☀️', x: 'Summer is the hottest season.' },
    { q: 'In which season do leaves fall off the trees?', c: '🍂 autumn', w: ['☀️ summer', '❄️ winter', '🌱 spring'], v: '🍂', l: 1, x: 'Leaves fall in autumn.' },
    { q: 'Which season is the coldest, with frost and snow?', c: '❄️ winter', w: ['☀️ summer', '🍂 autumn', '🌱 spring'], v: '⛄', x: 'Winter is the coldest season.' },
    { q: 'In which season do flowers start to grow and lambs are born?', c: '🌱 spring', w: ['❄️ winter', '🍂 autumn', '☀️ summer'], v: '🌷', l: 1, x: 'It is spring.' },
    { q: 'Which season comes after winter?', c: '🌱 spring', w: ['☀️ summer', '🍂 autumn'], l: 2, x: 'Spring comes after winter.' },
    { q: 'Which season comes after spring?', c: '☀️ summer', w: ['❄️ winter', '🍂 autumn'], l: 2, x: 'Summer comes after spring.' },
    { q: 'Which season comes after summer?', c: '🍂 autumn', w: ['❄️ winter', '🌱 spring'], l: 2, x: 'Autumn comes after summer.' },
    { q: 'What can you see in the sky after rain when the sun shines?', c: '🌈 a rainbow', w: ['⭐ a star', '🌙 the moon', '🪁 a kite'], v: '🌦️', l: 1, x: 'You can see a rainbow.' },
    { q: 'Which one is the weather on a windy day?', c: '🪁 a kite flies high', w: ['⛄ a snowman melts', '🌊 a puddle forms', '🍦 an ice cream melts'], l: 3, x: 'A kite flies high when it is windy.' }], 3);
  def('nature', 'seasonorder', 2, 4, L => ord({ key: 'nature:seasons', q: 'Put the seasons in order, starting with spring.', say: 'Put the seasons in order, starting with spring.', hint: 'Spring, then it gets hot. Then leaves fall.', explain: 'Spring, summer, autumn, winter.' }, ['🌱 spring', '☀️ summer', '🍂 autumn', '❄️ winter']));
  const mats = [['🪟', 'window', 'glass'], ['🔑', 'key', 'metal'], ['🧦', 'sock', 'fabric'], ['🪵', 'log', 'wood'], ['🧸', 'teddy bear', 'fabric'], ['🍴', 'fork', 'metal'], ['🔔', 'bell', 'metal'], ['🥾', 'wellington boot', 'rubber'], ['🧱', 'toy brick', 'plastic'], ['🧶', 'jumper', 'wool']];
  def('nature', 'materials', 1, 4, L => {
    if (L >= 2 && Math.random() < 0.55) return curMat(L);
    const [e, n, m] = pick(mats); return ch({ key: `nature:mat:${n}`, q: `What is a ${n} made of?`, say: `What is a ${n} usually made of?`, html: bigE(e), hint: 'Think about how it feels.', explain: `A ${n} is made of ${m}.` }, m, ['glass', 'metal', 'fabric', 'wood', 'rubber', 'plastic', 'wool'].filter(x => x !== m && !(m === 'fabric' && x === 'wool') && !(m === 'wool' && x === 'fabric') && !(m === 'plastic' && x === 'rubber') && !(m === 'rubber' && x === 'plastic')), L < 2 ? 3 : 4);
  }, 2);
  const matProps = [
    { q: 'Which one is soft?', c: '🧸 teddy bear', w: ['🪨 rock', '🔨 hammer', '🧱 brick'], x: 'A teddy bear is soft.' },
    { q: 'Which one is hard?', c: '🪨 rock', w: ['🧸 teddy bear', '🧶 wool', '☁️ cloud'], x: 'A rock is hard.' },
    { q: 'Which one is waterproof?', c: '☂️ umbrella', w: ['🧻 tissue paper', '🧦 sock', '🍞 bread'], x: 'An umbrella keeps the rain out.' },
    { l: 3, q: 'Which one can you see through?', c: '🪟 window glass', w: ['🧱 brick', '🪵 wood', '📦 box'], x: 'You can see through glass.' },
    { l: 3, q: 'Which material is best for wellies to keep feet dry?', c: 'rubber', w: ['paper', 'wool', 'cloth'], x: 'Rubber keeps water out.' },
    { l: 3, q: 'Which material is best for a cosy blanket?', c: 'wool', w: ['glass', 'metal', 'brick'], x: 'Wool is warm and soft.' },
    { l: 4, q: 'Which material is best for a saucepan that gets very hot?', c: 'metal', w: ['paper', 'wool', 'plastic'], x: 'Metal does not melt in a hot cooker.' }];
  function curMat(L) { const idx = matProps.map((_, i) => i).filter(i => (matProps[i].l || 0) <= L); const i = pick(idx), it = matProps[i]; return ch({ key: `nature:prop:${i}`, q: it.q, hint: 'Think about what the material feels like.', explain: it.x }, it.c, it.w, 4); }
  const FS = [['🪵', 'log', 'Float'], ['🪨', 'rock', 'Sink'], ['🔑', 'key', 'Sink'], ['🦆', 'rubber duck', 'Float'], ['🍎', 'apple', 'Float'], ['🪙', 'coin', 'Sink'], ['🍃', 'leaf', 'Float'], ['🧱', 'brick', 'Sink'], ['⚓', 'anchor', 'Sink'], ['🪶', 'feather', 'Float'], ['🥄', 'metal spoon', 'Sink']];
  def('nature', 'floatsink', 1, 4, L => { const [e, n, a] = pick(FS); return ch({ key: `nature:fs:${n}`, q: `Will the ${n} float or sink?`, html: bigE(e), hint: 'Heavy hard things often sink. Light things float.', explain: `The ${n} will ${a.toLowerCase()}.` }, a, [a === 'Float' ? 'Sink' : 'Float'], 2); });
  cur('nature', 'senses', 0, 3, [
    { q: 'Which part of your body do you use to smell?', c: '👃 nose', w: ['👀 eyes', '👂 ears', '👅 tongue'] }, { q: 'Which part of your body do you use to see?', c: '👀 eyes', w: ['👃 nose', '👂 ears', '👅 tongue'] },
    { q: 'Which part of your body do you use to hear?', c: '👂 ears', w: ['👃 nose', '👀 eyes', '👅 tongue'] }, { q: 'Which part of your body do you use to taste?', c: '👅 tongue', w: ['👃 nose', '👀 eyes', '👂 ears'] },
    { q: 'Which part of your body do you use to feel things?', c: '✋ hands and skin', w: ['👃 nose', '👀 eyes', '👂 ears'], l: 1 },
    { l: 3, q: 'You hear a bird sing. Which sense is it?', c: 'hearing', w: ['sight', 'smell', 'touch'] }, { l: 3, q: 'You smell a flower. Which sense is it?', c: 'smell', w: ['sight', 'hearing', 'taste'] },
    { l: 3, q: 'You stroke soft fur. Which sense is it?', c: 'touch', w: ['sight', 'hearing', 'taste'] }, { l: 3, q: 'You look at a rainbow. Which sense is it?', c: 'sight', w: ['smell', 'hearing', 'touch'] },
    { l: 3, q: 'You eat a sour lemon. Which sense is it?', c: 'taste', w: ['sight', 'hearing', 'touch'] }, { l: 2, q: 'Which part of your body bends in the middle of your arm?', c: 'elbow', w: ['knee', 'ankle', 'toe'] }], 2);
  const LIVE = [['🐱', 'cat', 'Living'], ['🌳', 'tree', 'Living'], ['🌸', 'flower growing in the garden', 'Living'], ['🐟', 'fish', 'Living'], ['🐝', 'bee', 'Living'], ['🪨', 'rock', 'Never alive'], ['🥄', 'spoon', 'Never alive'], ['⚽', 'football', 'Never alive'], ['🚗', 'car', 'Never alive'], ['🧸', 'teddy bear', 'Never alive'], ['🍂', 'dry brown leaf on the ground', 'Dead'], ['🦴', 'bone', 'Dead'], ['🪵', 'log', 'Dead'], ['🐚', 'empty seashell', 'Dead']];
  def('nature', 'living', 0, 4, L => {
    if (L <= 1) { const lv = pick(LIVE.filter(x => x[2] === 'Living')); const nl = shuffle(LIVE.filter(x => x[2] === 'Never alive')).slice(0, 3);
      return ch({ key: `nature:alive:${lv[1]}`, q: 'Which one is alive?', say: 'Which one of these is alive?', hint: 'Living things grow, eat and have babies.', explain: `A ${lv[1]} is alive.` }, lv[0], nl.map(x => x[0]), L === 0 ? 3 : 4); }
    const [e, n, k] = pick(L === 2 ? LIVE.filter(x => x[2] !== 'Dead' || Math.random() < 0.3) : LIVE);
    return ch({ key: `nature:live3:${n}`, q: `Is the ${n} living, never alive or dead?`, say: `Is the ${n} living, never alive, or dead?`, html: bigE(e), hint: 'Dead means it was once alive. Never alive means it never was.', explain: `The ${n} is ${k === 'Living' ? 'living' : k.toLowerCase()}.` }, k, ['Living', 'Never alive', 'Dead'], 3);
  }, 2);
  cur('nature', 'minibeast', 2, 4, [
    { q: 'How many legs does a spider have?', v: '🕷️', c: '8', w: ['6', '4', '10'], x: 'A spider has eight legs.' }, { q: 'How many legs does an insect have?', v: '🐜', c: '6', w: ['4', '8', '10'], x: 'An insect has six legs.' },
    { q: 'How many legs does a ladybird have?', v: '🐞', c: '6', w: ['4', '8', '2'], x: 'A ladybird has six legs.' }, { q: 'Which minibeast has no legs?', c: '🐌 snail', w: ['🐜 ant', '🕷️ spider', '🐞 ladybird'], x: 'A snail has no legs.' },
    { q: 'Which one is NOT an insect?', c: '🕷️ spider', w: ['🐝 bee', '🐞 ladybird', '🦋 butterfly'], x: 'A spider has eight legs, so it is not an insect.' }, { q: 'Which minibeast carries a shell on its back?', c: '🐌 snail', w: ['🐜 ant', '🐝 bee', '🕷️ spider'], x: 'A snail has a shell.' },
    { q: 'Which minibeast spins a web?', c: '🕷️ spider', w: ['🐝 bee', '🐞 ladybird', '🐜 ant'], x: 'A spider spins a web.' }, { q: 'Which minibeast makes honey?', c: '🐝 bee', w: ['🕷️ spider', '🐌 snail', '🐞 ladybird'], x: 'A bee makes honey.' },
    { l: 3, q: 'How many wings does a butterfly have?', v: '🦋', c: '4', w: ['2', '6', '8'], x: 'A butterfly has four wings.' }], 2);
  const FC = [['🌱 grass', '🐰 rabbit', '🦊 fox'], ['🌿 leaf', '🐛 caterpillar', '🐦 bird'], ['🌱 plant', '🐭 mouse', '🦉 owl'], ['🥬 lettuce', '🐌 snail', '🐸 frog']];
  def('nature', 'foodchain', 3, 4, L => {
    const c = pick(FC), i = FC.indexOf(c), nm = x => strip(x);
    if (Math.random() < 0.5) return ord({ key: `nature:chain:${i}`, q: 'Put the food chain in order. Start with the plant.', say: 'Put the food chain in order. Start with the plant, then the animal that eats it.', hint: 'The plant is eaten first.', explain: `${nm(c[0])} is eaten by the ${nm(c[1])}, which is eaten by the ${nm(c[2])}.` }, c);
    return ch({ key: `nature:chainq:${i}`, q: `${c.join(' → ')}<br>What eats the ${nm(c[1])}?`, say: `In this food chain, ${nm(c[0])} is eaten by the ${nm(c[1])}, and the ${nm(c[1])} is eaten by the ${nm(c[2])}. What eats the ${nm(c[1])}?`, hint: 'The arrow points to what does the eating.', explain: `The ${nm(c[2])} eats the ${nm(c[1])}.` }, c[2], [c[0], '🐮 cow', '🐟 fish'], 4);
  });
  cur('nature', 'animalfacts', 0, 2, [
    { q: 'Which animal can fly?', c: '🦅 eagle', w: ['🐶 dog', '🐮 cow', '🐢 turtle'] }, { q: 'Which animal lives in water all the time?', c: '🐟 fish', w: ['🐶 dog', '🐱 cat', '🐴 horse'] }, { q: 'Which animal has a shell?', c: '🐢 turtle', w: ['🐶 dog', '🐱 cat', '🐔 hen'] },
    { q: 'Which animal gives us milk?', c: '🐮 cow', w: ['🐔 hen', '🐟 fish', '🐝 bee'] }, { q: 'Which animal lays eggs that we eat?', c: '🐔 hen', w: ['🐮 cow', '🐷 pig', '🐑 sheep'] }, { q: 'Which animal makes honey?', c: '🐝 bee', w: ['🐞 ladybird', '🐜 ant', '🐛 caterpillar'] },
    { q: 'Which animal has a very long neck?', c: '🦒 giraffe', w: ['🐱 cat', '🐷 pig', '🐭 mouse'] }, { q: 'Which animal has a trunk?', c: '🐘 elephant', w: ['🐱 cat', '🐷 pig', '🐭 mouse'] }, { q: 'Which animal has black and white stripes?', c: '🦓 zebra', w: ['🐘 elephant', '🐮 cow', '🐑 sheep'], l: 1 }, { q: 'Which animal gives us wool?', c: '🐑 sheep', w: ['🐷 pig', '🐔 hen', '🐟 fish'], l: 1 }], 2);

  /* ================= SHAPES ================= */
  function poly(n, r, cx, cy, rot) { const p = []; for (let i = 0; i < n; i++) { const a = (rot + 360 * i / n) * Math.PI / 180; p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); } return p.join(' '); }
  function shapeSvg(name, col, sz) {
    sz = sz || 110; col = col || pick(COLS); const f = `fill="${col}" stroke="#333" stroke-width="3"`; let b;
    switch (name) { case 'circle': b = `<circle cx="50" cy="50" r="38" ${f}/>`; break; case 'square': b = `<rect x="15" y="15" width="70" height="70" ${f}/>`; break; case 'rectangle': b = `<rect x="6" y="26" width="88" height="48" ${f}/>`; break;
      case 'triangle': b = `<polygon points="50,12 90,86 10,86" ${f}/>`; break; case 'pentagon': b = `<polygon points="${poly(5, 40, 50, 54, -90)}" ${f}/>`; break; case 'hexagon': b = `<polygon points="${poly(6, 40, 50, 50, 0)}" ${f}/>`; break; case 'octagon': b = `<polygon points="${poly(8, 40, 50, 50, 22.5)}" ${f}/>`; break; }
    return `<svg viewBox="0 0 100 100" width="${sz}" height="${sz}">${b}</svg>`;
  }
  const N2D = { 0: ['circle', 'square', 'triangle', 'rectangle'], 2: ['circle', 'square', 'triangle', 'rectangle', 'pentagon', 'hexagon', 'octagon'] };
  const SIDES = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6, octagon: 8 };
  def('shapes', 'name2d', 0, 4, L => {
    const pool = N2D[L >= 2 ? 2 : 0]; const s = pick(pool);
    return ch({ key: `shapes:name:${s}`, q: 'What is this shape called?', html: `<div class="pz-vis">${shapeSvg(s)}</div>`, hint: s === 'rectangle' ? 'A rectangle has two long sides and two short sides.' : 'Count the sides and corners.', explain: `It is ${/^[aeiou]/.test(s) ? 'an' : 'a'} ${s}.` }, s, pool, L < 2 ? 3 : 4);
  }, 2);
  def('shapes', 'pick2d', 0, 3, L => {
    const pool = N2D[L >= 2 ? 2 : 0]; const s = pick(pool); const wr = shuffle(pool.filter(x => x !== s)).slice(0, 3).map(x => shapeSvg(x, null, 80));
    const c = shapeSvg(s, null, 80); return ch({ key: `shapes:pick:${s}`, q: `Which one is ${/^[aeiou]/.test(s) ? 'an' : 'a'} <b>${s}</b>?`, hint: 'Check the number of sides.', explain: `That is ${/^[aeiou]/.test(s) ? 'an' : 'a'} ${s}.` }, c, wr, 3);
  });
  def('shapes', 'sides', 1, 4, L => {
    const pool = L <= 1 ? ['triangle', 'square', 'rectangle'] : Object.keys(SIDES); const s = pick(pool); const corners = Math.random() < 0.5;
    if (L >= 3 && Math.random() < 0.2) return ch({ key: 'shapes:circlecorners', q: 'How many corners does a circle have?', html: `<div class="pz-vis">${shapeSvg('circle')}</div>`, hint: 'Run your finger round the edge. Is there a sharp corner?', explain: 'A circle has no corners.' }, 0, [1, 2, 4], 4);
    return ch({ key: `shapes:${corners ? 'corners' : 'sides'}:${s}`, q: `How many ${corners ? 'corners' : 'sides'} does this shape have?`, html: `<div class="pz-vis">${shapeSvg(s)}</div>`, hint: `Count each ${corners ? 'corner' : 'side'} once.`, explain: `A ${s} has ${nw(SIDES[s])} ${corners ? 'corners' : 'sides'}.` }, SIDES[s], near(SIDES[s], 2, 9, 2), L < 2 ? 3 : 4);
  }, 2);
  function solid(name, col) {
    col = col || pick(COLS); const f = `fill="${col}" stroke="#333" stroke-width="2.5" stroke-linejoin="round"`; let b;
    switch (name) {
      case 'cube': b = `<polygon points="15,38 60,38 60,83 15,83" ${f}/><polygon points="15,38 35,18 80,18 60,38" fill="#fff" fill-opacity=".45" stroke="#333" stroke-width="2.5"/><polygon points="60,38 80,18 80,63 60,83" fill="#000" fill-opacity=".25" stroke="#333" stroke-width="2.5"/>`; break;
      case 'cuboid': b = `<polygon points="8,42 66,42 66,80 8,80" ${f}/><polygon points="8,42 26,24 84,24 66,42" fill="#fff" fill-opacity=".45" stroke="#333" stroke-width="2.5"/><polygon points="66,42 84,24 84,62 66,80" fill="#000" fill-opacity=".25" stroke="#333" stroke-width="2.5"/>`; break;
      case 'sphere': b = `<circle cx="50" cy="50" r="38" ${f}/><circle cx="38" cy="36" r="10" fill="#fff" fill-opacity=".5"/>`; break;
      case 'cylinder': b = `<ellipse cx="50" cy="78" rx="30" ry="10" ${f}/><rect x="20" y="24" width="60" height="54" ${f} stroke="none"/><line x1="20" y1="24" x2="20" y2="78" stroke="#333" stroke-width="2.5"/><line x1="80" y1="24" x2="80" y2="78" stroke="#333" stroke-width="2.5"/><ellipse cx="50" cy="24" rx="30" ry="10" fill="#fff" fill-opacity=".45" stroke="#333" stroke-width="2.5"/>`; break;
      case 'cone': b = `<path d="M20 76L50 10L80 76A30 10 0 0 1 20 76Z" ${f}/>`; break;
      case 'pyramid': b = `<polygon points="50,10 10,76 56,88" ${f}/><polygon points="50,10 56,88 90,70" fill="#000" fill-opacity=".25" stroke="#333" stroke-width="2.5" stroke-linejoin="round"/>`; break;
    } return `<svg viewBox="0 0 100 100" width="110" height="110">${b}</svg>`;
  }
  const S3 = ['cube', 'sphere', 'cylinder', 'cone', 'pyramid'];
  const S3O = [['⚽', 'ball', 'sphere'], ['🎲', 'dice', 'cube'], ['🥫', 'tin of beans', 'cylinder'], ['🍦', 'ice cream cone', 'cone'], ['📦', 'cardboard box', 'cuboid'], ['🌍', 'globe', 'sphere'], ['🏀', 'basketball', 'sphere']];
  def('shapes', 'solid3d', 1, 4, L => {
    const f = irnd(0, L >= 4 ? 2 : 1);
    if (f === 0) { const s = pick(S3.concat(L >= 3 ? ['cuboid'] : [])); return ch({ key: `shapes:3d:${s}`, q: 'What is this 3D shape called?', html: `<div class="pz-vis">${solid(s)}</div>`, hint: 'Think about its faces. Is anything round?', explain: `It is ${/^[aeiou]/.test(s) ? 'an' : 'a'} ${s}.` }, s, S3.concat(L >= 3 ? ['cuboid'] : []), L < 2 ? 3 : 4); }
    if (f === 1) { const [e, n, s] = pick(L < 3 ? S3O.filter(x => x[2] !== 'cuboid') : S3O); return ch({ key: `shapes:3dobj:${n}`, q: `What shape is a ${n}?`, html: bigE(e), hint: 'Think about whether it rolls, or has flat faces.', explain: `A ${n} is ${/^[aeiou]/.test(s) ? 'an' : 'a'} ${s}.` }, s, S3.concat(['cuboid']), 4); }
    const F = [['cube', 'faces', 6], ['cube', 'corners', 8], ['cuboid', 'faces', 6], ['cylinder', 'flat faces', 2], ['cone', 'flat faces', 1], ['pyramid', 'corners', 5], ['sphere', 'flat faces', 0], ['cube', 'edges', 12]]; const [s, p, n] = pick(F);
    return ch({ key: `shapes:3dfact:${s}:${p}`, q: `How many ${p} does a ${s} have?`, html: `<div class="pz-vis">${solid(s)}</div>`, hint: 'Look at the picture and count carefully.', explain: `A ${s} has ${nw(n)} ${p}.` }, n, near(n, 0, 14, 3), 4);
  });
  const SYMY = ['50,8 85,45 50,92 15,45', '15,50 50,12 85,50 85,88 15,88', '50,12 90,82 10,82', '8,28 92,28 92,72 8,72', '50,10 80,40 65,90 35,90 20,40'];
  const SYMN = ['25,25 95,25 75,75 5,75', '10,15 92,85 30,85', '20,20 80,15 90,60 55,90 10,70', '10,80 10,20 60,20 90,80'];
  const sp = (p, c) => `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="${p}" fill="${c}" stroke="#333" stroke-width="3" stroke-linejoin="round"/></svg>`;
  def('shapes', 'symshape', 2, 4, L => {
    const yes = L < 4 || Math.random() < 0.5; const a = shuffle(yes ? SYMY : SYMN)[0]; const wr = shuffle(yes ? SYMN : SYMY).slice(0, 2); const c = pick(COLS);
    const i = SYMY.concat(SYMN).indexOf(a); const pickH = x => sp(x, c);
    return ch({ key: `shapes:sym:${yes ? 'y' : 'n'}:${i}`, q: yes ? 'Which shape has a line of symmetry?' : 'Which shape has NO line of symmetry?', say: yes ? 'Which shape has a line of symmetry? That means it looks the same on both sides of a mirror line.' : 'Which shape has no line of symmetry?', hint: 'Imagine folding it in half. Do both halves match?', explain: yes ? 'Both halves match when you fold it.' : 'The halves do not match when you fold it.' }, pickH(a), wr.map(pickH), 3);
  });
  def('shapes', 'symletter', 2, 4, L => {
    const Y = ['A', 'M', 'T', 'U', 'V', 'W', 'Y', 'H', 'O', 'I', 'X'], N = ['F', 'G', 'J', 'L', 'P', 'R', 'S', 'Z', 'N']; const y = pick(Y);
    return ch({ key: `shapes:symL:${y}`, q: 'Which letter looks the same on both sides of a mirror line?', say: 'Which letter looks the same on both sides of a mirror line down the middle?', html: `<div class="pz-vis"><svg viewBox="0 0 100 100" width="90" height="90"><line x1="50" y1="2" x2="50" y2="98" stroke="#e53935" stroke-width="3" stroke-dasharray="6 5"/></svg></div>`, hint: 'Imagine a mirror down the middle of the letter.', explain: `The letter ${y} is symmetrical.` }, y, shuffle(N).slice(0, 3), 4);
  });
  def('shapes', 'position', 0, 4, L => {
    const pool = shuffle(['🐱', '🐶', '🐭', '🐰', '🐸', '🐷', '🐮', '🐔', '🦊']); const hor = Math.random() < 0.6 || L >= 3; const n = L === 0 ? 2 : L < 3 ? 3 : 5; const it = pool.slice(0, n), rest = pool.slice(n);
    const vis = hor ? `<div class="pz-vis"><div class="pz-row" style="font-size:52px;letter-spacing:12px">${it.join('')}</div></div>` : `<div class="pz-vis"><div style="display:flex;flex-direction:column;align-items:center;font-size:48px;line-height:1.2">${it.map(e => `<span>${e}</span>`).join('')}</div></div>`;
    let q, say, c, wr, x; const key = `shapes:pos:${hor ? 'h' : 'v'}:${it.join('')}`;
    if (L === 0) { const first = Math.random() < 0.5; c = first ? it[0] : it[1]; wr = [first ? it[1] : it[0]]; q = hor ? `Which one is on the ${first ? 'left' : 'right'}?` : `Which one is ${first ? 'above' : 'below'} the other?`; x = hor ? `That one is on the ${first ? 'left' : 'right'}.` : `That one is ${first ? 'at the top' : 'at the bottom'}.`; if (!hor) q = `Which one is at the ${first ? 'top' : 'bottom'}?`; }
    else if (L < 3) { const t = it[1]; const mode = irnd(0, L === 2 ? 2 : 1); if (mode === 2) { q = `Which one is between ${it[0]} and ${it[2]}?`; c = it[1]; wr = rest.slice(0, 3); x = 'It is in the middle.'; } else { const first = mode === 0; c = first ? it[0] : it[2]; wr = [first ? it[2] : it[0]].concat(rest.slice(0, 2)); q = hor ? `Which one is on the ${first ? 'left' : 'right'} of ${t}?` : `Which one is ${first ? 'above' : 'below'} ${t}?`; x = hor ? `It is on the ${first ? 'left' : 'right'}.` : `It is ${first ? 'above' : 'below'} it.`; } }
    else { const k = irnd(0, 4), fromL = Math.random() < 0.5; const ord = ['first', 'second', 'third', 'fourth', 'fifth']; c = fromL ? it[k] : it[4 - k]; wr = it.filter(e => e !== c); q = `Which one is ${ord[k]} from the ${fromL ? 'left' : 'right'}?`; x = `It is ${ord[k]} from the ${fromL ? 'left' : 'right'}.`; wr = wr.concat(rest); }
    return ch({ key: key + ':' + plain(q), q, html: vis, hint: hor ? 'Look at the picture carefully. Left is the side where we start reading.' : 'Above means higher up. Below means lower down.', explain: x }, c, wr, L === 0 ? 2 : 4);
  }, 2);
  function arrowSvg(deg) { return `<svg viewBox="0 0 120 120" width="130" height="130"><circle cx="60" cy="60" r="56" fill="#e3f2fd" stroke="#1565c0" stroke-width="3"/><g transform="rotate(${deg} 60 60)"><polygon points="60,14 82,48 68,48 68,100 52,100 52,48 38,48" fill="#e53935" stroke="#333" stroke-width="2"/></g></svg>`; }
  const DIRS = ['up', 'right', 'down', 'left'], DE = ['⬆️', '➡️', '⬇️', '⬅️'];
  def('shapes', 'turn', 3, 4, L => {
    if (L === 3 && Math.random() < 0.3) { const f = [['How many quarter turns make a half turn?', 2, [1, 3, 4]], ['How many quarter turns make a whole turn?', 4, [1, 2, 3]], ['How many half turns make a whole turn?', 2, [1, 3, 4]]][irnd(0, 2)]; return ch({ key: `shapes:turnfact:${f[0]}`, q: f[0], hint: 'A whole turn goes all the way round.', explain: `The answer is ${nw(f[1])}.` }, f[1], f[2], 4); }
    const s = irnd(0, 3), k = pick([1, 2, 3]), acw = L === 4 && Math.random() < 0.4; const e = ((s + (acw ? -k : k)) % 4 + 4) % 4; const tn = ['a quarter turn', 'a half turn', 'a three-quarter turn'][k - 1];
    return ch({ key: `shapes:turn:${s}:${k}:${acw ? 'a' : 'c'}`, q: `The arrow makes ${tn} ${acw ? 'anticlockwise' : 'clockwise'}. Where does it point?`, say: `The arrow makes ${tn} ${acw ? 'anticlockwise' : 'clockwise'}. Where does it point now?`, html: `<div class="pz-vis">${arrowSvg(s * 90)}</div>`, hint: acw ? 'Anticlockwise is the opposite way to the clock hands.' : 'Clockwise is the way the clock hands go.', explain: `It points ${DIRS[e]}.` }, `${DE[e]} ${DIRS[e]}`, DIRS.map((d, i) => `${DE[i]} ${d}`), 4);
  });
  const MEAS = [['heavier', [['🐘', '🐭'], ['🚛', '🚲'], ['🪨', '🪶'], ['🐮', '🐔'], ['🧱', '🎈']], 'heavy'], ['taller', [['🦒', '🐭'], ['🌳', '🌼'], ['🏢', '🏠']], 'tall'], ['longer', [['🐍', '🐛'], ['🚂', '🚗']], 'long'], ['holds more', [['🛁', '🥛'], ['🪣', '☕']], 'more']];
  def('shapes', 'measure', 0, 2, L => {
    const [w, list] = pick(L === 0 ? MEAS.slice(0, 2) : MEAS); const [big, small] = pick(list); const opp = { heavier: 'lighter', taller: 'shorter', longer: 'shorter', 'holds more': 'holds less' }[w]; const useBig = Math.random() < 0.6; const word = useBig ? w : opp;
    return ch({ key: `shapes:meas:${word}:${big}${small}`, q: `Which one is ${word}?`, hint: 'Compare the two things.', explain: `The ${useBig ? 'first' : 'other'} one is ${word}.` }, useBig ? big : small, [useBig ? small : big], 2);
  });
  def('shapes', 'bars', 1, 2, L => {
    const a = irnd(40, 100), b = a + irnd(20, 50) * (Math.random() < 0.5 ? 1 : -1); if (b < 30) return null; const long = Math.random() < 0.6; const redLong = a > b; const ans = long ? (redLong ? 'red' : 'blue') : (redLong ? 'blue' : 'red');
    return ch({ key: `shapes:bars:${long ? 'l' : 's'}:${a}:${b}`, q: `Which ribbon is ${long ? 'longer' : 'shorter'}?`, html: `<div class="pz-vis"><svg viewBox="0 0 160 70" width="240" height="105"><rect x="5" y="8" width="${a * 1.4}" height="20" rx="6" fill="#e53935"/><rect x="5" y="40" width="${b * 1.4}" height="20" rx="6" fill="#1e88e5"/></svg></div>`, hint: 'Look at where each ribbon ends.', explain: `The ${ans} ribbon is ${long ? 'longer' : 'shorter'}.` }, ans, [ans === 'red' ? 'blue' : 'red'], 2);
  });
  def('shapes', 'ruler', 2, 4, L => {
    const n = irnd(2, 10); let t = ''; for (let i = 0; i <= 10; i++) t += `<line x1="${15 + i * 24}" y1="46" x2="${15 + i * 24}" y2="${i % 5 === 0 ? 62 : 56}" stroke="#333" stroke-width="2"/><text x="${15 + i * 24}" y="76" font-size="12" text-anchor="middle" fill="#333">${i}</text>`;
    return ch({ key: `shapes:ruler:${n}`, q: 'How long is the pencil?', say: 'Look at the ruler. How many centimetres long is the pencil?', html: `<div class="pz-vis"><svg viewBox="0 0 270 84" width="324" height="101"><rect x="15" y="8" width="${n * 24}" height="22" fill="#fbc02d" stroke="#333" stroke-width="2"/><polygon points="${15 + n * 24},8 ${15 + n * 24 + 12},19 ${15 + n * 24},30" fill="#f8bbd0" stroke="#333" stroke-width="2"/><rect x="8" y="40" width="254" height="26" fill="#cfd8dc" fill-opacity=".6" stroke="#333" stroke-width="2"/>${t}</svg></div>`, hint: 'The pencil starts at zero. Where does the yellow part end?', explain: `The pencil is ${nw(n)} centimetres long.` }, `${n} cm`, near(n, 1, 11, 2).map(x => `${x} cm`), 3);
  });
  cur('shapes', 'units', 3, 4, [
    { q: 'What would you use to measure how long a table is?', c: '📏 a ruler', w: ['⚖️ scales', '⏰ a clock', '🥛 a jug'] }, { q: 'What would you use to measure how heavy a bag is?', c: '⚖️ scales', w: ['📏 a ruler', '⏰ a clock', '🥛 a jug'] },
    { q: 'What would you use to measure how much juice is in a jug?', c: '🥛 a measuring jug', w: ['📏 a ruler', '⚖️ scales', '⏰ a clock'] }, { q: 'What would you use to find out the time?', c: '⏰ a clock', w: ['📏 a ruler', '⚖️ scales', '🥛 a jug'] }], 1);
  function clock(h, m, sz) {
    let s = '<circle cx="60" cy="60" r="56" fill="#fff" stroke="#333" stroke-width="4"/><g font-size="13" font-weight="bold" text-anchor="middle" fill="#333">';
    for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6; s += `<text x="${(60 + 44 * Math.sin(a)).toFixed(1)}" y="${(64 - 44 * Math.cos(a)).toFixed(1)}">${i}</text>`; }
    s += '</g>'; const hand = (len, deg, w, c) => { const a = deg * Math.PI / 180; return `<line x1="60" y1="60" x2="${(60 + len * Math.sin(a)).toFixed(1)}" y2="${(60 - len * Math.cos(a)).toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`; };
    s += hand(26, (h % 12) * 30 + m * 0.5, 6, '#222') + hand(38, m * 6, 4, '#e53935') + '<circle cx="60" cy="60" r="4" fill="#222"/>';
    return `<svg viewBox="0 0 120 120" width="${sz || 150}" height="${sz || 150}">${s}</svg>`;
  }
  const nx = h => h % 12 + 1;
  function tl(h, m) {
    if (m === 0) return [`${h} o'clock`, `${nw(h)} o'clock`]; if (m === 30) return [`half past ${h}`, `half past ${nw(h)}`]; if (m === 15) return [`quarter past ${h}`, `quarter past ${nw(h)}`]; if (m === 45) return [`quarter to ${nx(h)}`, `quarter to ${nw(nx(h))}`];
    if (m < 30) return [`${m} past ${h}`, `${nw(m)} past ${nw(h)}`]; return [`${60 - m} to ${nx(h)}`, `${nw(60 - m)} to ${nw(nx(h))}`];
  }
  const MSET = L => L === 0 ? [0] : L <= 2 ? [0, 30] : L === 3 ? [0, 15, 30, 45] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  def('shapes', 'readclock', 0, 4, L => {
    const ms = MSET(L), h = irnd(1, 12), m = pick(L === 1 ? [0, 30] : ms); const [t, s] = tl(h, m); const cands = [[h % 12 + 1, m], [(h + 10) % 12 + 1, m]]; for (const m2 of ms) if (m2 !== m) { cands.push([h, m2]); cands.push([irnd(1, 12), m2]); }
    return ch({ key: `shapes:clock:${h}:${m}`, q: 'What time does the clock show?', say: 'What time does the clock show? Look at the short hour hand and the long minute hand.', html: `<div class="pz-vis">${clock(h, m)}</div>`, hint: 'The short hand is the hour. The long hand is the minutes.', explain: `It is ${s}.` }, t, cands.map(c => tl(c[0], c[1])[0]), L < 2 ? 3 : 4);
  }, 3);
  def('shapes', 'pickclock', 1, 4, L => {
    const ms = MSET(L), h = irnd(1, 12), m = pick(ms); const [t, s] = tl(h, m); const cands = [[h % 12 + 1, m], [(h + 10) % 12 + 1, m]]; for (const m2 of ms) if (m2 !== m) cands.push([h, m2]);
    return ch({ key: `shapes:pclock:${h}:${m}`, q: `Which clock shows <b>${t}</b>?`, say: `Which clock shows ${s}?`, hint: 'Check where the long hand points first.', explain: `That clock shows ${s}.` }, clock(h, m, 90), shuffle(cands).slice(0, 2).map(c => clock(c[0], c[1], 90)), 3);
  });
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], MONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  def('shapes', 'calendar', 1, 4, L => {
    const f = irnd(0, L === 1 ? 1 : L === 2 ? 3 : 5); const md = (a, i) => a[(i % a.length + a.length) % a.length];
    if (f === 0) return ch({ key: 'shapes:cal:days7', q: 'How many days are in a week?', hint: 'Monday to Sunday.', explain: 'There are seven days in a week.' }, 7, [5, 6, 8, 10], 3);
    if (f === 1 || f === 2) { const i = irnd(0, 6), aft = Math.random() < 0.5; return ch({ key: `shapes:cal:day:${aft ? 'a' : 'b'}:${DAYS[i]}`, q: `What day comes ${aft ? 'after' : 'before'} ${DAYS[i]}?`, hint: 'Say the days of the week in order.', explain: `${md(DAYS, i + (aft ? 1 : -1))} comes ${aft ? 'after' : 'before'} ${DAYS[i]}.` }, md(DAYS, i + (aft ? 1 : -1)), DAYS.filter((_, j) => j !== (i + (aft ? 1 : 6)) % 7 && j !== i), 4); }
    if (f === 3) { const i = irnd(0, 11), aft = Math.random() < 0.5; return ch({ key: `shapes:cal:mon:${aft ? 'a' : 'b'}:${MONS[i]}`, q: `Which month comes ${aft ? 'after' : 'before'} ${MONS[i]}?`, hint: 'Say the months of the year in order.', explain: `${md(MONS, i + (aft ? 1 : -1))} comes ${aft ? 'after' : 'before'} ${MONS[i]}.` }, md(MONS, i + (aft ? 1 : -1)), MONS.filter((_, j) => j !== (i + (aft ? 1 : 11)) % 12 && j !== i), 4); }
    if (f === 4) { const i = irnd(0, 6), y = Math.random() < 0.5; return ch({ key: `shapes:cal:yt:${y ? 'y' : 't'}:${DAYS[i]}`, q: `${y ? 'Yesterday' : 'Tomorrow'} was${y ? '' : ' not'} ... ${y ? 'Today is' : ''}`.length ? (y ? `Yesterday was ${DAYS[i]}. What day is it today?` : `Today is ${DAYS[i]}. What day is it tomorrow?`) : '', hint: 'Count on one day.', explain: `It is ${md(DAYS, i + 1)}.` }, md(DAYS, i + 1), DAYS.filter((_, j) => j !== (i + 1) % 7), 4); }
    if (L >= 3) { const st = irnd(0, 8); if (Math.random() < 0.5) return ord({ key: `shapes:cal:months:${st}`, q: 'Put the months in order.', hint: 'Start with the first month of the year.', explain: MONS.slice(st, st + 4).join(', ') + '.' }, MONS.slice(st, st + 4)); }
    const st = irnd(0, 3); return ord({ key: `shapes:cal:daysord:${st}`, q: 'Put the days in order.', hint: 'Monday is the first day of the school week.', explain: DAYS.slice(st, st + 4).join(', ') + '.' }, DAYS.slice(st, st + 4));
  });
  cur('shapes', 'timefact', 3, 4, [{ q: 'How many minutes are in one hour?', c: '60', w: ['30', '100', '12'] }, { q: 'How many hours are in one day?', c: '24', w: ['12', '60', '7'] }, { q: 'How many months are in a year?', c: '12', w: ['10', '7', '52'] }, { q: 'How many minutes are in half an hour?', c: '30', w: ['15', '60', '50'] }, { q: 'Which is longer, a minute or an hour?', c: 'an hour', w: ['a minute'], n: 2 }, { q: 'Which takes longer, brushing your teeth or going on holiday?', c: 'going on holiday', w: ['brushing your teeth'], n: 2 }, { q: 'How many days are in a week?', c: '7', w: ['5', '10', '12'] }], 1);
  /* money */
  const POUND = v => v >= 100 ? '£' + v / 100 : v + 'p';
  const sayP = v => v === 1 ? 'one penny' : v === 100 ? 'one pound' : v === 200 ? 'two pounds' : nw(v) + ' pence';
  function coin(v, sz) {
    const cu = v <= 2, gold = v === 100, pr = v === 200; const r = { 1: 15, 2: 19, 5: 13, 10: 18, 20: 15, 50: 19, 100: 17, 200: 20 }[v]; const fill = cu ? '#c0733a' : gold ? '#e6b422' : pr ? '#e6b422' : '#cfd3d8'; const lab = POUND(v);
    let sh = (v === 20 || v === 50) ? `<polygon points="${poly(7, r + 1, 22, 22, -90)}" fill="${fill}" stroke="#555" stroke-width="1.5"/>` : `<circle cx="22" cy="22" r="${r}" fill="${fill}" stroke="#555" stroke-width="1.5"/>${pr ? '<circle cx="22" cy="22" r="14" fill="#d5d8dc" stroke="#777" stroke-width="1"/>' : ''}`;
    return `<svg viewBox="0 0 44 44" width="${sz || 56}" height="${sz || 56}">${sh}<text x="22" y="26.5" font-size="${lab.length > 2 ? 11 : 13}" font-weight="bold" text-anchor="middle" fill="#222">${lab}</text></svg>`;
  }
  def('shapes', 'coinid', 0, 4, L => {
    const pool = L <= 1 ? [1, 2, 5, 10] : L === 2 ? [1, 2, 5, 10, 20, 50] : [1, 2, 5, 10, 20, 50, 100, 200]; const v = pick(pool);
    if (L >= 1 && Math.random() < 0.4) return ch({ key: `shapes:coinpick:${v}`, q: `Which coin is <b>${POUND(v)}</b>?`, say: `Which coin is ${sayP(v)}?`, hint: 'Read the number on the coin.', explain: `That coin is ${sayP(v)}.` }, coin(v), shuffle(pool.filter(x => x !== v)).slice(0, 2).map(x => coin(x)), 3);
    return ch({ key: `shapes:coin:${v}`, q: 'How much is this coin worth?', say: 'How much is this coin worth?', html: `<div class="pz-vis">${coin(v, 110)}</div>`, hint: 'Read the number on the coin.', explain: `This coin is ${sayP(v)}.` }, POUND(v), pool.map(POUND), L === 0 ? 3 : 4);
  }, 2);
  def('shapes', 'cointotal', 1, 4, L => {
    const pool = L === 1 ? [1, 2] : L === 2 ? [1, 2, 5, 10] : L === 3 ? [1, 2, 5, 10, 20] : [1, 2, 5, 10, 20, 50]; const cnt = L === 1 ? irnd(2, 3) : irnd(2, 4);
    let cs = []; for (let i = 0; i < cnt; i++) cs.push(pick(pool)); cs.sort((a, b) => b - a); const tot = cs.reduce((a, b) => a + b, 0); if (tot > 100) return null;
    return ch({ key: `shapes:total:${cs.join('+')}`, q: 'How much money is there altogether?', say: 'How much money is there altogether?', html: `<div class="pz-vis">${cs.map(v => coin(v, cs.length > 3 ? 64 : 76)).join('')}</div>`, hint: 'Start with the biggest coin and count on.', explain: `${cs.map(sayP).join(' and ')} make ${sayP(tot)}.` }, tot + 'p', near(tot, 1, 100, 3).map(x => x + 'p'), L < 3 ? 3 : 4);
  }, 2);
  def('shapes', 'coinsmake', 2, 4, L => {
    const T = L === 2 ? 10 : L === 3 ? pick([10, 20]) : pick([20, 50, 15, 30]); const pool = L === 2 ? [1, 2, 5, 10] : [1, 2, 5, 10, 20, 50];
    const build = target => { let rem = target, c = [], g = 0; while (rem > 0 && g++ < 6) { const op = pool.filter(x => x <= rem); c.push(pick(op)); rem -= c[c.length - 1]; } return rem === 0 ? c : null; };
    let ok = null; for (let i = 0; i < 20 && !(ok && ok.length >= 2 && ok.length <= 4); i++) ok = build(T); if (!ok || ok.length < 2 || ok.length > 4) return null;
    const fm = c => c.slice().sort((a, b) => b - a).map(POUND).join(' + '); const wrongs = [];
    for (let i = 0; i < 30 && wrongs.length < 4; i++) { const d = pick([-5, -2, -1, 1, 2, 5, 10]); const c = build(T + d); if (c && c.length >= 2 && c.length <= 4) wrongs.push(fm(c)); }
    return ch({ key: `shapes:make:${T}:${fm(ok)}`, q: `Which coins make <b>${T}p</b>?`, say: `Which coins make ${sayP(T)}?`, hint: 'Add up each choice.', explain: `${ok.map(sayP).join(' and ')} make ${sayP(T)}.` }, fm(ok), wrongs, 3);
  });
  const SHOP = [['sweet', '🍬'], ['lolly', '🍭'], ['balloon', '🎈'], ['sticker', '⭐'], ['biscuit', '🍪']];
  def('shapes', 'change', 3, 4, L => {
    const [n, e] = pick(SHOP); let pay, cost;
    if (L === 3) { pay = 10; cost = irnd(1, 9); } else if (Math.random() < 0.6) { pay = 20; cost = irnd(2, 18); } else { pay = 100; cost = irnd(1, 19) * 5; }
    const ch2 = pay - cost; return ch({ key: `shapes:change:${pay}:${cost}`, q: `You pay ${POUND(pay)} for a ${n} ${e} that costs ${cost}p. What is your change?`, say: `You pay with ${sayP(pay)} for a ${n} that costs ${sayP(cost)}. How much change do you get?`, hint: `Take ${cost}p away from ${POUND(pay)}.`, explain: `Your change is ${sayP(ch2)}.` }, ch2 + 'p', near(ch2, 1, 99, 3, pay === 100 ? 5 : 1).concat(pay === 100 ? [] : [cost]).map(x => x + 'p'), 4);
  });

  /* ================= PATTERNS ================= */
  const PSETS = [['🍎', '🍌', '🍇', '🍓', '🍊'], ['🔴', '🔵', '🟢', '🟡', '🟣'], ['🐱', '🐶', '🐭', '🐰', '🐸'], ['⭐', '🌙', '☀️', '🌈', '☁️'], ['🟥', '🟦', '🟩', '🟨', '🟧']];
  const gapD = '<div class="pz-gap">?</div>';
  const rowP = (arr, hole) => `<div class="pz-vis"><div class="pz-row" style="font-size:42px;letter-spacing:6px">${arr.map((x, i) => i === hole ? gapD : x).join('')}</div></div>`;
  const UNITS = [[0, ['AB']], [1, ['AAB', 'ABC']], [2, ['ABB', 'AABB', 'ABC', 'ABAC']], [3, ['ABCD', 'AABC', 'ABBC']], [4, ['ABCD', 'AABBC', 'ABCDE', 'ABACA']]];
  def('patterns', 'repeat', 0, 4, L => {
    const u = pick(UNITS[L][1]), set = shuffle(pick(PSETS)); const kinds = [...new Set(u.split(''))]; const map = {}; kinds.forEach((k, i) => map[k] = set[i]); const len = u.length;
    const n = 2 * len + irnd(1, len - 1 || 1) + (len === 2 ? 1 : 0); const seq = []; for (let i = 0; i < n; i++) seq.push(map[u[i % len]]); const ans = map[u[n % len]];
    return ch({ key: `patterns:rep:${u}:${seq.join('')}`, q: 'What comes next in the pattern?', html: rowP(seq.concat([null]), seq.length), hint: 'Find the part that repeats.', explain: 'The pattern repeats, so this one comes next.' }, ans, set.filter(x => x !== ans).slice(0, 3).concat(kinds.map(k => map[k]).filter(x => x !== ans)), L === 0 ? 3 : 4);
  }, 3);
  def('patterns', 'middle', 2, 4, L => {
    const u = pick(UNITS[L][1]), set = shuffle(pick(PSETS)); const kinds = [...new Set(u.split(''))]; const map = {}; kinds.forEach((k, i) => map[k] = set[i]); const len = u.length;
    const n = 3 * len; const seq = []; for (let i = 0; i < n; i++) seq.push(map[u[i % len]]); const h = irnd(len, n - len - 1); const ans = seq[h];
    return ch({ key: `patterns:mid:${u}:${seq.join('')}:${h}`, q: 'Which one is missing from the pattern?', html: rowP(seq, h), hint: 'Look at what comes before and after the gap.', explain: 'That one finishes the pattern.' }, ans, set.filter(x => x !== ans).slice(0, 3), 4);
  });
  def('patterns', 'numseq', 0, 4, L => {
    const st = L === 0 ? 1 : pick(L === 1 ? [1, 2] : L === 2 ? [2, 5, 10, -1, -2] : L === 3 ? [3, 4, 5, 10, -2, -5] : [3, 4, 5, 6, 10, 20, -3, -10]); const d = st; const up = d > 0; const a = Math.abs(d);
    let start = up ? (L === 0 ? irnd(1, 6) : L === 1 ? irnd(1, 10) : irnd(0, 4) * a + (L >= 3 ? irnd(0, 20) : 0)) : irnd(5, 10) * a; if (up && start + 5 * a > 100) start = 0; if (!up && start - 5 * a < 0) start = 5 * a;
    const seq = []; for (let i = 0; i < 6; i++) seq.push(start + i * d); const cnt = L === 0 ? 3 : 4; const mid = L >= 2 && Math.random() < 0.4; const hole = mid ? irnd(1, cnt - 1) : cnt;
    const shown = seq.slice(0, mid ? cnt + 1 : cnt).map((x, i) => i === hole ? '<b>?</b>' : x); if (!mid) shown.push('<b>?</b>'); const ans = seq[hole];
    return ch({ key: `patterns:num:${seq[0]}:${d}:${hole}`, q: `${mid ? 'What is missing? ' : 'What comes next? '}${shown.join(', ')}`, say: `${mid ? 'What number is missing? ' : 'What comes next? '}${seq.slice(0, mid ? cnt + 1 : cnt).map((x, i) => i === hole ? 'blank' : x).join(', ')}`, hint: `Each number ${up ? 'goes up' : 'goes down'} by ${nw(a)}.`, explain: `The numbers go ${up ? 'up' : 'down'} by ${nw(a)}, so the answer is ${nw(ans)}.` }, ans, [ans + 1, ans - 1, ans + a, ans - a].filter(x => x >= 0 && x <= 100), 4);
  }, 3);
  def('patterns', 'grow', 1, 3, L => {
    const d = L === 1 ? 1 : pick([1, 2]), s = irnd(1, 3), e = pick(OBJ); const rows = [s, s + d, s + 2 * d]; const ans = s + 3 * d;
    return ch({ key: `patterns:grow:${s}:${d}`, q: 'The pattern grows. How many in the next row?', html: `<div class="pz-vis" style="flex-direction:column">${rows.map(n => objRow(e, n, 34)).join('')}</div>`, hint: 'How many more does each row have?', explain: `Each row has ${nw(d)} more, so the next row has ${nw(ans)}.` }, ans, near(ans, 1, 12, 2).concat([ans + d + 1]), 3);
  });
  const CATS = { animals: ['🐱', '🐶', '🐮', '🐷', '🐔', '🐸', '🐘', '🦁'], fruit: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍒'], vehicles: ['🚗', '🚌', '🚲', '🚂', '✈️', '🚁', '⛵'], clothes: ['👕', '👖', '🧦', '🧢', '👗', '🧤'], music: ['🥁', '🎸', '🎹', '🎺', '🎻'], weather: ['☀️', '🌧️', '❄️', '🌈', '⛈️'], sport: ['⚽', '🏀', '🎾', '🏈'], tools: ['🔨', '🔧', '✂️', '🧹'], veg: ['🥕', '🌽', '🥦', '🥔', '🧅'] };
  const catNames = { animals: 'animals', fruit: 'fruit', vehicles: 'vehicles', clothes: 'clothes', music: 'instruments', weather: 'weather', sport: 'sports balls', tools: 'tools', veg: 'vegetables' };
  def('patterns', 'odd', 0, 4, L => {
    if (L <= 1) { const c = shuffle(['🔴', '🔵', '🟢', '🟡']).slice(0, 2); const items = shuffle([c[0], c[0], c[0], c[1]]); return ch({ key: `patterns:oddc:${c.join('')}`, q: 'Which one is the odd one out?', say: 'Which one is the odd one out? It is different from the others.', hint: 'Which one is different?', explain: 'It is a different colour.' }, c[1], [c[0]], 2); }
    if (L >= 3 && Math.random() < 0.5) {
      const k = irnd(0, 2); let good = [], bad; const lo = 2; const rnd = (f) => { const s = new Set(); while (s.size < 3) { const x = irnd(lo, 98); if (f(x)) s.add(x); } return [...s]; };
      if (k === 0) { good = rnd(x => x % 2 === 0); bad = (x => x % 2 ? x : x + 1)(irnd(11, 97)); }
      else if (k === 1) { good = rnd(x => x % 5 === 0); bad = pick([12, 23, 34, 47, 58, 61, 73, 89]); } else { good = rnd(x => x % 2 === 1); bad = (x => x % 2 ? x + 1 : x)(irnd(12, 96)); }
      const rule = ['even', 'in the 5 times table', 'odd'][k]; return ch({ key: `patterns:oddn:${k}:${good.join(',')}:${bad}`, q: 'Which number is the odd one out?', say: `Three of these numbers are ${rule}. Which number is the odd one out?`, hint: `Three of them are ${rule}.`, explain: `${cap(nw(bad))} is not ${rule}.` }, bad, good, 4);
    }
    const ks = Object.keys(CATS), a = pick(ks), b = pick(ks.filter(x => x !== a)); const good = shuffle(CATS[a]).slice(0, 3), bad = pick(CATS[b]);
    return ch({ key: `patterns:oddcat:${a}:${b}:${bad}`, q: 'Which one is the odd one out?', say: 'Which one does not belong with the others?', hint: 'Three of them are the same kind of thing.', explain: `The other three are ${catNames[a]}.` }, bad, good, 4);
  }, 2);
  def('patterns', 'belong', 0, 4, L => {
    if (L >= 3 && Math.random() < 0.4) {
      const k = pick([2, 5, 10]); const s = irnd(1, 4); const grp = [1, 2, 3].map(i => (s + i - 1) * k); const ans = (s + 3) * k; if (ans > 100) return null;
      return ch({ key: `patterns:belongn:${k}:${s}`, q: `Which number belongs in this group? ${grp.join(', ')}, ...`, say: `Which number belongs in this group? ${grp.join(', ')}`, hint: `Count in ${nw(k)}s.`, explain: `${cap(nw(ans))} is next when we count in ${nw(k)}s.` }, ans, [ans + 1, ans - 1, ans + 2, ans - 2].filter(x => x % k !== 0), 4);
    }
    const ks = Object.keys(CATS), a = pick(ks); const g = shuffle(CATS[a]); const grp = g.slice(0, 3), ans = g[3] || g[0]; if (!g[3]) return null;
    const wr = shuffle(ks.filter(x => x !== a)).slice(0, 3).map(x => pick(CATS[x]));
    return ch({ key: `patterns:belong:${a}:${grp.join('')}:${ans}`, q: `Which one belongs in this group?<br>${grp.join(' ')}`, say: 'Which one belongs in this group?', hint: 'What do the three have in common?', explain: `They are all ${catNames[a]}.` }, ans, wr, L === 0 ? 3 : 4);
  }, 2);
  def('patterns', 'arrows', 1, 4, L => {
    const g = L === 1 ? 3 : L <= 3 ? 4 : 5, steps = L === 1 ? 2 : L === 2 ? 3 : L === 3 ? 4 : 5; let x = irnd(0, g - 1), y = irnd(0, g - 1); const sx = x, sy = y; const path = [[x, y]], mv = [];
    const D = { up: [0, -1, '↑'], down: [0, 1, '↓'], left: [-1, 0, '←'], right: [1, 0, '→'] }; const dirs = L === 1 ? ['right', 'down'] : L === 2 ? ['right', 'down', 'up'] : ['right', 'down', 'up', 'left'];
    for (let i = 0; i < steps; i++) { const ok = dirs.filter(d => { const nx2 = x + D[d][0], ny2 = y + D[d][1]; return nx2 >= 0 && nx2 < g && ny2 >= 0 && ny2 < g && !(path.length > 1 && false); }); if (!ok.length) return null; const d = pick(ok); x += D[d][0]; y += D[d][1]; mv.push(d); path.push([x, y]); }
    if (x === sx && y === sy) return null; const end = [x, y]; const cell = 40; const others = shuffle(path.slice(0, -1).filter(p => !(p[0] === end[0] && p[1] === end[1]) && !(p[0] === sx && p[1] === sy)));
    const all = []; for (let a = 0; a < g; a++) for (let b = 0; b < g; b++) if (!(a === end[0] && b === end[1]) && !(a === sx && b === sy) && !others.some(o => o[0] === a && o[1] === b)) all.push([a, b]);
    const wr = others.concat(shuffle(all)).filter((p, i, arr) => arr.findIndex(q2 => q2[0] === p[0] && q2[1] === p[1]) === i).slice(0, 2); const cells = shuffle([end].concat(wr)); const letters = ['A', 'B', 'C'];
    let s = ''; for (let a = 0; a < g; a++) for (let b = 0; b < g; b++) s += `<rect x="${5 + a * cell}" y="${5 + b * cell}" width="${cell}" height="${cell}" fill="#f1f8e9" stroke="#689f38" stroke-width="2"/>`;
    cells.forEach((c, i) => { s += `<circle cx="${5 + c[0] * cell + 20}" cy="${5 + c[1] * cell + 20}" r="13" fill="#fff" stroke="#e65100" stroke-width="2.5"/><text x="${5 + c[0] * cell + 20}" y="${5 + c[1] * cell + 26}" font-size="17" font-weight="bold" text-anchor="middle" fill="#e65100">${letters[i]}</text>`; });
    s += `<text x="${5 + sx * cell + 20}" y="${5 + sy * cell + 29}" font-size="26" text-anchor="middle">🐝</text>`; const ai = cells.indexOf(end); const sz = g * cell + 10;
    return ch({ key: `patterns:arrows:${g}:${sx}${sy}:${mv.join('')}`, q: 'The bee follows the arrows. Where does it end up?', say: `The bee follows the arrows: ${mv.join(', ')}. Which letter does it end up on?`, html: `<div class="pz-vis"><svg viewBox="0 0 ${sz} ${sz}" width="${sz * 1.2}" height="${sz * 1.2}">${s}</svg><div class="pz-big" style="font-size:36px;letter-spacing:6px">${mv.map(d => D[d][2]).join(' ')}</div></div>`, hint: 'Move the bee one square for each arrow.', explain: `The bee ends up on ${letters[ai]}.` }, letters[ai], letters.slice(0, cells.length), 3);
  }, 2);
  const ALGO = [[['🫖 Fill the kettle', '♨️ Boil the water', '☕ Pour water on the tea bag', '😋 Drink your tea'], 'make a cup of tea'], [['🪥 Put toothpaste on the brush', '😁 Brush your teeth', '🚰 Spit it out', '💧 Rinse your mouth'], 'brush your teeth'], [['🧦 Put on your socks', '👟 Put on your shoes', '🎀 Tie the laces'], 'get ready to go out'], [['⛏️ Dig a hole', '🌰 Put in the seed', '🟤 Cover it with soil', '💧 Water it'], 'plant a seed'], [['🍞 Put bread in the toaster', '⏰ Wait for the toast to pop', '🧈 Spread the butter', '😋 Eat it'], 'make toast'], [['🚰 Turn on the tap', '🧼 Use the soap', '💦 Rinse your hands', '🧻 Dry your hands'], 'wash your hands']];
  def('patterns', 'algorithm', 1, 4, L => {
    const i = irnd(0, ALGO.length - 1), [steps, name] = ALGO[i]; const use = L === 1 ? steps.slice(0, 3) : steps;
    return ord({ key: `patterns:algo:${i}:${use.length}`, q: `Put the steps in order to ${name}.`, hint: 'What do you do first? What comes last?', explain: use.map(strip).join(', then ') + '.' }, use);
  });
  def('patterns', 'sizeorder', 1, 3, L => {
    const A = ['🐜', '🐭', '🐱', '🐕', '🐴', '🐘']; const cnt = L + 2; const sel = A.filter((_, i) => i === 0 || Math.random() < 0.7); const set = shuffle(A).slice(0, cnt).sort((a, b) => A.indexOf(a) - A.indexOf(b)); const sm = Math.random() < 0.6;
    return ord({ key: `patterns:size:${sm ? 's' : 'b'}:${set.join('')}`, q: `Put them in order, ${sm ? 'smallest' : 'biggest'} first.`, hint: 'Which one is the tiniest?', explain: sm ? 'From the smallest to the biggest.' : 'From the biggest to the smallest.' }, sm ? set : set.slice().reverse());
  });
  function symGrid(g, w, h, col, dash) {
    let s = ''; for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) s += `<rect x="${2 + c * 28}" y="${2 + r * 28}" width="28" height="28" fill="${g[r][c] ? col : '#fff'}" stroke="#999" stroke-width="1.5"/>`;
    if (dash) s += `<line x1="${2 + w * 28}" y1="0" x2="${2 + w * 28}" y2="${h * 28 + 4}" stroke="#e53935" stroke-width="3" stroke-dasharray="6 4"/>`;
    return `<svg viewBox="0 0 ${w * 28 + 6} ${h * 28 + 4}" width="${(w * 28 + 6) * 1.1}" height="${(h * 28 + 4) * 1.1}">${s}</svg>`;
  }
  def('patterns', 'symcomplete', 3, 4, L => {
    const w = L === 3 ? 2 : 3, h = 3, col = pick(COLS); let g, t = 0; do { g = []; for (let r = 0; r < h; r++) { g.push([]); for (let c = 0; c < w; c++) g[r].push(Math.random() < 0.5 ? 1 : 0); } t++; } while (t < 30 && (g.flat().filter(Boolean).length < 2 || g.flat().filter(Boolean).length > w * h - 2));
    const mir = g.map(r => r.slice().reverse()); const flipV = mir.slice().reverse(); const oneOff = mir.map(r => r.slice()); const rr = irnd(0, h - 1), cc = irnd(0, w - 1); oneOff[rr][cc] = 1 - oneOff[rr][cc];
    const key = x => symGrid(x, w, h, col, false); const correct = key(mir);
    return ch({ key: `patterns:sym:${L}:${g.flat().join('')}`, q: 'Which picture completes the mirror image?', say: 'The dotted line is a mirror. Which picture completes the mirror image on the other side?', html: `<div class="pz-vis">${symGrid(g, w, h, col, true)}</div>`, hint: 'The mirror picture flips to the other side, like a butterfly.', explain: 'The picture on the other side is the mirror image.' }, correct, [key(g), key(flipV), key(oneOff)].filter(x => x !== correct), 4);
  });

  /* ================= API ================= */
  const AN = /\b([Aa]) (?=(?:<b>)?(?!uni|use|one\b|once\b|euro|ukul)[aeiou][a-z])/g;   // a elephant → an elephant
  function make(subject, level, opts) {
    level = Math.max(0, Math.min(4, Math.round(+level || 0))); const gens = GENS[subject]; if (!gens) throw new Error('unknown subject ' + subject);
    const avoid = new Set((opts && opts.avoid) || []); const elig = gens.filter(g => level >= g.lo && level <= g.hi); let last = null;
    for (let t = 0; t < 60; t++) {
      let g; const wg = elig.find(x => x.id === 'write');
      if (subject === 'words' && wg && Math.random() < 0.25) g = wg;
      else { const pool = []; for (const x of elig) if (x.id !== 'write' || subject !== 'words') for (let i = 0; i < x.w; i++) pool.push(x); g = pick(pool); }
      let p = null; if (CURR._debug) p = g.fn(level); else { try { p = g.fn(level); } catch (e) { p = null; } }
      if (p) { for (const f of ['q', 'say', 'explain', 'hint']) if (typeof p[f] === 'string') p[f] = p[f].replace(AN, '$1n '); p.subject = subject; p.level = level; if (!p.hint) p.hint = 'Take your time and have another look.'; if (!p.explain) p.explain = 'Well done!'; last = p; if (!avoid.has(p.key)) return p; }
    }
    return last || ch({ key: 'maths:fallback', q: 'What is 1 + 1?', say: 'What is one plus one?', subject, level, hint: 'Count on one.', explain: 'One and one make two.' }, 2, [1, 3, 4], 4);
  }
  CURR.make = make;
  CURR.generators = () => { const o = {}; for (const s of CURR.subjects) o[s] = GENS[s].map(g => g.id); return o; };
  CURR.selfTest = function () {
    const problems = [], bad = (p, m) => problems.push(`${p && p.key}: ${m}`); const old = CURR._debug; CURR._debug = true;
    for (const s of CURR.subjects) for (let i = 0; i < 300; i++) {
      const L = i % 5; let p; try { p = make(s, L); } catch (e) { problems.push(`${s} L${L}: threw ${e.message}`); continue; }
      if (!p || typeof p !== 'object') { bad({ key: s }, 'no puzzle'); continue; }
      if (!p.key || typeof p.key !== 'string') bad(p, 'no key'); if (p.subject !== s || p.level !== L) bad(p, 'subject/level mismatch');
      for (const f of ['q', 'say', 'hint', 'explain']) if (typeof p[f] !== 'string' || !p[f].trim()) bad(p, 'missing ' + f);
      if (/[\p{Extended_Pictographic}]/u.test(p.say || '')) bad(p, 'emoji in say'); if (/[+−=×÷<>£½¼¾⅓→↑←↓]/.test(p.say || '')) bad(p, 'symbol in say: ' + p.say);
      if (/NaN|undefined|null|\[object/.test(JSON.stringify(p))) bad(p, 'NaN/undefined in text'); if ((p.html || '').length > 3500) bad(p, 'html too big ' + p.html.length);
      if (p.type === 'choice') {
        if (!Array.isArray(p.choices) || p.choices.length < 2 || p.choices.length > 4) bad(p, 'choice count'); else {
          if (new Set(p.choices).size !== p.choices.length) bad(p, 'duplicate choices'); if (!Number.isInteger(p.answer) || p.answer < 0 || p.answer >= p.choices.length) bad(p, 'answer out of range');
          if (p.choices.some(c => typeof c !== 'string' || !c.trim())) bad(p, 'empty/non-string choice');
          if (p.choices.every(c => /^-?\d+(p| cm)?$/.test(c)) && p.choices.some(c => parseInt(c, 10) < 0 || parseInt(c, 10) > 100)) bad(p, 'number out of 0..100: ' + p.choices);
        }
      } else if (p.type === 'order') {
        if (!Array.isArray(p.tiles) || !Array.isArray(p.solution) || p.tiles.length !== p.solution.length || p.tiles.length < 2) bad(p, 'order shape'); else if (p.tiles.slice().sort().join('|') !== p.solution.slice().sort().join('|')) bad(p, 'solution not permutation');
      } else if (p.type === 'write') {
        if (!p.write || !p.write.text || !['trace', 'fade', 'memory'].includes(p.write.mode)) bad(p, 'write spec');
      } else bad(p, 'bad type ' + p.type);
    }
    CURR._debug = old; return problems;
  };
})();

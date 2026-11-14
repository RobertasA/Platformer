/* Hazelnut Hollow — Music Room playroom (SPEC §8.2 `music`). Xylophone, drums, bells, record/play, song book. */
(function () {
  'use strict';
  const G = window.G, U = G.U;
  const BARS = [60, 62, 64, 65, 67, 69, 71, 72], LET = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
  const BCOL = ['#ff5a72', '#ff9a3c', '#ffd23c', '#7ad05a', '#2fc4b2', '#4aa8ff', '#7a6cf0', '#c46be0'];
  const BELLS = [72, 74, 76, 79, 81], BELCOL = ['#ff8fb1', '#ffc34d', '#8be28a', '#6cc6ff', '#c59bff'];
  const DRUMS = [['Boom', '#ff7a5c'], ['Tap', '#4aa8ff'], ['Tss', '#ffd23c']];
  const MAXEV = 80;
  const SONGS = [
    { id: 'twinkle', name: 'Twinkle Twinkle', say: 'You played Twinkle Twinkle!', n: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0] },
    { id: 'buns', name: 'Hot Cross Buns', say: 'You played Hot Cross Buns!', n: [2, 1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 1, 0] },
    { id: 'mary', name: 'Mary Had a Little Lamb', say: 'You played Mary Had a Lamb!', n: [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 4, 4, 2, 1, 0, 1, 2, 2, 2, 2, 1, 1, 2, 1, 0] },
  ];
  const ANIMALS = ['cat', 'dog', 'bunny'];
  let want = null;   // test hook: index of the bar wanted next in song mode

  function mount(stage, api) {
    const st = api.state;
    if (!Array.isArray(st.tunes)) st.tunes = [null, null, null];
    while (st.tunes.length < 3) st.tunes.push(null);
    st.tunes = st.tunes.slice(0, 3).map(t => Array.isArray(t) && t.length ? t.filter(e => e && 'xdb'.includes(e.k) && isFinite(e.i) && isFinite(e.t)).slice(0, MAXEV) : null);
    const timers = new Set();
    const later = (f, ms) => { const id = setTimeout(() => { timers.delete(id); f(); }, ms); timers.add(id); return id; };
    stage.innerHTML = '';
    const mk = (tag, cls, html, parent) => { const e = U.el(tag, cls, html || ''); (parent || stage).appendChild(e); return e; };

    /* ---- scene ---- */
    mk('div', 'bg');
    mk('div', 'floor');
    const lights = mk('div', 'lights');
    for (let i = 0; i < 7; i++) { const l = mk('i', 'lamp', '', lights); l.style.left = 150 + i * 160 + 'px'; l.style.setProperty('--c', BCOL[i]); l.style.animationDelay = -i * 0.4 + 's'; }
    mk('div', 'curtain cl'); mk('div', 'curtain cr');
    mk('div', 'valance');
    mk('div', 'bandstand');

    /* ---- band ---- */
    const band = [];
    ANIMALS.forEach((kind, i) => {
      const w = mk('div', 'animal'), cv = document.createElement('canvas'); cv.width = 160; cv.height = 160; w.appendChild(cv);
      G.drawCreature(cv.getContext('2d'), kind, 80, 152, 2.3, { t: 0 });
      w.style.left = [270, 560, 850][i] + 'px'; band.push(w);
    });
    const hop = (i, big) => { const w = band[i % 3]; w.classList.remove('hop', 'big'); void w.offsetWidth; w.classList.add('hop'); if (big) w.classList.add('big'); };
    let bandN = 0;
    const bandHop = (big) => { hop(bandN++, big); if (big) hop(bandN++, big); };

    /* ---- instruments ---- */
    const xylo = mk('div', 'xylo'), barEl = [], drumEl = [], bellEl = [];
    mk('div', 'rail r1', '', xylo); mk('div', 'rail r2', '', xylo);
    const BW = 128, GAP = 8;
    BARS.forEach((m, i) => {
      const b = mk('div', 'bar', '<b>' + LET[i] + '</b>', xylo), h = 270 - i * 10;
      b.style.left = i * (BW + GAP) + 'px'; b.style.height = h + 'px'; b.style.width = BW + 'px'; b.style.setProperty('--c', BCOL[i]);
      barEl.push(b);
    });
    const drums = mk('div', 'drums');
    DRUMS.forEach((d, i) => {
      const e = mk('div', 'drum', '<span>' + d[0] + '</span>', drums); e.style.setProperty('--c', d[1]); e.style.touchAction = 'none';
      e.style.left = i * 170 + 'px'; drumEl.push(e);
    });
    const bells = mk('div', 'bells');
    BELLS.forEach((m, i) => {
      const e = mk('div', 'bell', '<span class="bi">🔔</span>', bells); e.style.setProperty('--c', BELCOL[i]); e.style.touchAction = 'none';
      e.style.left = i * 110 + 'px'; bellEl.push(e);
    });
    xylo.style.touchAction = 'none';

    const lightUp = (el, cls) => { el.classList.remove(cls || 'hit'); void el.offsetWidth; el.classList.add(cls || 'hit'); later(() => el.classList.remove(cls || 'hit'), 380); };
    const noteFloat = (el) => {
      const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect(), k = 1280 / s.width;
      const n = mk('span', 'fnote', U.pick(['🎵', '🎶', '🎵']));
      n.style.left = ((r.left + r.width / 2 - s.left) * k + (Math.random() - 0.5) * 40) + 'px'; n.style.top = ((r.top - s.top) * k + 20) + 'px';
      later(() => n.remove(), 1300);
    };

    /* ---- recording ---- */
    let recording = false, rec = [], t0 = 0, playing = false;
    const recLight = mk('div', 'reclight');
    const sound = (k, i) => {
      if (k === 'x') G.note(BARS[i], 0.9, 'triangle', 0.32);
      else if (k === 'd') G.drum(i);
      else G.note(BELLS[i], 1.4, i % 2 ? 'sine' : 'triangle', 0.26);
    };
    const show = (k, i, silent) => {
      const el = (k === 'x' ? barEl : k === 'd' ? drumEl : bellEl)[i];
      lightUp(el); if (k !== 'd') noteFloat(el); bandHop(k === 'd');
      if (!silent) sound(k, i);
    };
    const play = (k, i, fromUser) => {
      show(k, i);
      if (fromUser) {
        if (recording) {
          const now = performance.now(); if (!rec.length) t0 = now;
          rec.push({ k, i, t: Math.round(now - t0) });
          if (rec.length >= MAXEV) { setRec(false); api.say('That is a long tune!'); }
        }
        if (k === 'x') songHit(i);
      }
    };

    /* xylophone: pointer capture on the container + hit test by x */
    const barAt = (e) => {
      const r = xylo.getBoundingClientRect(); const x = (e.clientX - r.left) * 1280 / (stage.getBoundingClientRect().width);
      const i = Math.floor(x / (BW + GAP)); if (i < 0 || i > 7) return -1;
      return (x - i * (BW + GAP)) <= BW + GAP / 2 ? i : -1;
    };
    const held = new Map();
    xylo.addEventListener('pointerdown', e => {
      e.preventDefault(); try { xylo.setPointerCapture(e.pointerId); } catch (_) { }
      const i = barAt(e); held.set(e.pointerId, i); if (i >= 0) play('x', i, true);
    });
    xylo.addEventListener('pointermove', e => {
      if (!held.has(e.pointerId)) return;
      const i = barAt(e); if (i >= 0 && i !== held.get(e.pointerId)) { held.set(e.pointerId, i); play('x', i, true); }
    });
    const rel = e => held.delete(e.pointerId);
    xylo.addEventListener('pointerup', rel); xylo.addEventListener('pointercancel', rel);
    drumEl.forEach((el, i) => el.addEventListener('pointerdown', e => { e.preventDefault(); play('d', i, true); }));
    bellEl.forEach((el, i) => el.addEventListener('pointerdown', e => { e.preventDefault(); play('b', i, true); }));

    /* ---- controls ---- */
    const bar = mk('div', 'ctrl');
    const bRec = mk('button', 'cb rec', '⏺', bar), bPlay = mk('button', 'cb', '▶', bar);
    const sep = mk('i', 'sep', '', bar);
    const slotEl = [1, 2, 3].map(n => mk('button', 'cb slot', '<span>💾</span><b>' + n + '</b>', bar));
    const sep2 = mk('i', 'sep', '', bar);
    const bBook = mk('button', 'cb book', '🎼', bar);
    bRec.setAttribute('aria-label', 'Record'); bPlay.setAttribute('aria-label', 'Play'); bBook.setAttribute('aria-label', 'Song book');
    const paintSlots = () => slotEl.forEach((b, i) => { const full = !!st.tunes[i]; b.classList.toggle('full', full); b.firstChild.textContent = full ? '🎵' : '💾'; });
    const setRec = on => {
      recording = on; bRec.classList.toggle('on', on); recLight.classList.toggle('on', on);
      bRec.textContent = on ? '⏹' : '⏺';
      if (on) { stopPlay(); rec = []; t0 = 0; api.say('Play something!'); }
      else if (rec.length) bPlay.classList.add('pulse');
    };
    let playIds = [];
    const stopPlay = () => { playIds.forEach(id => { clearTimeout(id); timers.delete(id); }); playIds = []; if (playing) { playing = false; bPlay.textContent = '▶'; bPlay.classList.remove('on'); } };
    const playEvents = (ev) => {
      stopPlay(); if (!ev || !ev.length) { api.say('Record a tune first!'); return; }
      playing = true; bPlay.textContent = '⏹'; bPlay.classList.add('on'); bPlay.classList.remove('pulse');
      ev.forEach(e => playIds.push(later(() => show(e.k, e.i), e.t)));
      playIds.push(later(() => stopPlay(), ev[ev.length - 1].t + 700));
    };
    bRec.addEventListener('pointerdown', e => { e.preventDefault(); G.sfx('tap'); setRec(!recording); });
    bPlay.addEventListener('pointerdown', e => {
      e.preventDefault(); G.sfx('tap');
      if (playing) { stopPlay(); return; } if (recording) setRec(false);
      playEvents(rec);
    });
    slotEl.forEach((b, i) => {
      let tm = null, long = false;
      b.addEventListener('pointerdown', e => {
        e.preventDefault(); long = false;
        if (!st.tunes[i]) return;
        tm = later(() => {
          tm = null; long = true; st.tunes[i] = null; api.save(); paintSlots(); G.sfx('pop'); api.say('Slot ' + (i + 1) + ' is empty.');
        }, 700);
      });
      const end = e => {
        if (tm === null && !long && !(e.type === 'pointerup' && !st.tunes[i])) return; if (tm !== null) { clearTimeout(tm); timers.delete(tm); tm = null; }
        if (long) { long = false; return; }
        if (e.type === 'pointercancel') return;
        G.sfx('tap');
        if (st.tunes[i]) { if (recording) setRec(false); playEvents(st.tunes[i]); }
        else if (rec.length) { if (recording) setRec(false); st.tunes[i] = rec.slice(); api.save(); paintSlots(); api.spark(...mid(b), '🎵'); api.say('Saved!'); }
        else api.say('Record a tune first!');
      };
      b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end); b.addEventListener('pointerleave', e => { if (tm !== null) { clearTimeout(tm); timers.delete(tm); tm = null; } });
    });
    const mid = el => { const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect(), k = 1280 / s.width; return [(r.left + r.width / 2 - s.left) * k, (r.top + r.height / 2 - s.top) * k]; };
    paintSlots();

    /* ---- song book ---- */
    const menu = mk('div', 'menu'); menu.hidden = true;
    mk('div', 'mt', '🎼 Pick a tune', menu);
    SONGS.forEach((s, i) => {
      const b = mk('button', 'sg', '<span>🎵</span>' + s.name, menu); b.style.setProperty('--c', BCOL[i * 2 + 1]);
      b.addEventListener('pointerdown', e => { e.preventDefault(); G.sfx('tap'); startSong(i); });
    });
    const mx = mk('button', 'mx', '✕', menu); mx.addEventListener('pointerdown', e => { e.preventDefault(); G.sfx('tap'); menu.hidden = true; });
    const strip = mk('div', 'strip'); strip.hidden = true;
    const sname = mk('div', 'sname', '', strip), dots = mk('div', 'dots', '', strip);
    const sx = mk('button', 'sx', '✕', strip); sx.addEventListener('pointerdown', e => { e.preventDefault(); G.sfx('tap'); endSong(); });
    let song = null, pos = 0, dotEl = [];
    const paintWant = () => {
      barEl.forEach(b => b.classList.remove('want'));
      if (song) { barEl[song.n[pos]].classList.add('want'); want = song.n[pos]; } else want = null;
      dotEl.forEach((d, i) => { d.classList.toggle('done', i < pos); d.classList.toggle('cur', i === pos); });
    };
    const startSong = i => {
      song = SONGS[i]; pos = 0; menu.hidden = true; strip.hidden = false; sname.textContent = song.name;
      dots.innerHTML = ''; dotEl = song.n.map(() => mk('i', 'dot', '', dots));
      stage.classList.add('songmode'); paintWant(); api.say(song.name + '! Play the glowing bar.');
    };
    const endSong = () => { song = null; strip.hidden = true; stage.classList.remove('songmode'); paintWant(); };
    const songHit = i => {
      if (!song || i !== song.n[pos]) return;
      pos++;
      if (pos >= song.n.length) {
        const s = song; song = null; paintWant();
        api.spark(640, 300, '⭐'); api.spark(400, 330); api.spark(880, 330); G.sfx('fanfare'); api.say(s.say);
        later(() => { if (!song) endSong(); }, 1400); return;
      }
      paintWant();
    };
    bBook.addEventListener('pointerdown', e => { e.preventDefault(); G.sfx('tap'); menu.hidden = !menu.hidden; });

    const room = G.SB.rooms.music;
    room._next = () => want;
    room._info = () => ({ recording, playing, rec: rec.length, song: song && song.id, pos });

    return {
      destroy() {
        timers.forEach(clearTimeout); timers.clear(); playIds = [];
        if (room) { delete room._next; delete room._info; }
      },
    };
  }

  G.SB.register('music', { name: 'Music Room', icon: '🎵', col: '#ffe08a', blurb: 'Play tunes and drums', mount });
})();

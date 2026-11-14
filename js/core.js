/* Hazelnut Hollow — core: namespace, helpers, save data, input */
(function () {
  'use strict';
  const G = window.G = { TILE: 48, VH: 720, VW: 1280, t: 0, paused: false };

  const U = G.U = {
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    rnd: (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a),
    irnd: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: a => a[Math.floor(Math.random() * a.length)],
    shuffle: a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    hash: (x, y = 0) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); },
    el: (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; },
    $: s => document.querySelector(s),
    wait: ms => new Promise(r => setTimeout(r, ms)),
  };

  /* ---------- gems: the five colours and the school subject each one teaches ---------- */
  G.GEMS = ['red', 'blue', 'green', 'yellow', 'purple'];
  G.GEM_INFO = {
    red: { name: 'Ruby', col: '#ff5a72', dark: '#c2264a', subj: 'maths', label: 'Numbers' },
    blue: { name: 'Sapphire', col: '#4aa8ff', dark: '#1c64c4', subj: 'words', label: 'Words' },
    green: { name: 'Emerald', col: '#3fd08a', dark: '#12915a', subj: 'nature', label: 'Nature' },
    yellow: { name: 'Topaz', col: '#ffc93c', dark: '#d98a00', subj: 'shapes', label: 'Shapes & Time' },
    purple: { name: 'Amethyst', col: '#b77bff', dark: '#7036c9', subj: 'patterns', label: 'Patterns' },
  };

  /* ---------- save data ---------- */
  const KEY = 'hazelnut-hollow-save-v1';
  G.defaultAvatar = () => ({
    skin: '#f6cfa6', hair: 'pigtails', hairCol: '#7a4a2a', body: 'dress', col1: '#ff7eb6', col2: '#ffe066',
    motif: 'heart', shoes: '#7a4a2a', hat: 'none', back: 'none', held: 'none', face: 'none', pet: 'cat',
  });
  const blank = () => ({
    v: 1, created: false, name: '', avatar: G.defaultAvatar(),
    gems: { red: 0, blue: 0, green: 0, yellow: 0, purple: 0 }, coins: 0,
    areas: { village: true }, area: 'village',
    taken: {}, locks: {}, quests: {}, bugs: {}, owned: {}, seen: {}, fresh: {}, outfits: [],
    level: { maths: 0, words: 0, nature: 0, shapes: 0, patterns: 0 },
    streak: { maths: 0, words: 0, nature: 0, shapes: 0, patterns: 0 },
    stats: { solved: 0, vet: 0, potions: 0 },
    settings: { music: true, sfx: true, speech: true, year: 'auto' },
    playsets: {},
  });
  G.loadGame = () => {
    let s = blank();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const o = JSON.parse(raw); for (const k in o) { if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) && s[k]) Object.assign(s[k], o[k]); else s[k] = o[k]; } }
    } catch (e) { /* private mode etc: play without saving */ }
    G.S = s; return s;
  };
  let saveT = 0;
  G.saveGame = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(G.S)); } catch (e) { } }, 200); };
  G.resetGame = () => { try { localStorage.removeItem(KEY); } catch (e) { } G.S = blank(); };

  /* ---------- input: keyboard + on-screen touch buttons ---------- */
  const I = G.input = { left: false, right: false, jump: false, jumpHit: false, actHit: false, any: false };
  const keymap = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ' ': 'jump', ArrowUp: 'jump', w: 'jump', W: 'jump', e: 'act', E: 'act', Enter: 'act', ArrowDown: 'act', s: 'act', S: 'act' };
  const press = (k, down) => {
    if (k === 'left' || k === 'right') I[k] = down;
    else if (k === 'jump') { if (down && !I.jump) I.jumpHit = true; I.jump = down; }
    else if (k === 'act') { if (down) I.actHit = true; }
  };
  window.addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const k = keymap[e.key];
    if (k) { if (!e.repeat) press(k, true); e.preventDefault(); }
    if (!e.repeat && G.onKey) G.onKey(e.key);
  });
  window.addEventListener('keyup', e => { const k = keymap[e.key]; if (k) press(k, false); });
  window.addEventListener('blur', () => { I.left = I.right = I.jump = false; });
  G.initTouch = () => {
    const bind = (id, k) => {
      const b = document.getElementById(id);
      const dn = e => { e.preventDefault(); b.classList.add('on'); press(k, true); try { b.setPointerCapture(e.pointerId); } catch (_) { } };
      const up = e => { e.preventDefault(); b.classList.remove('on'); press(k, false); };
      b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
      b.addEventListener('contextmenu', e => e.preventDefault());
    };
    bind('t-left', 'left'); bind('t-right', 'right'); bind('t-jump', 'jump'); bind('t-act', 'act');
    const show = () => { document.getElementById('touch').classList.add('touchy'); };
    window.addEventListener('touchstart', show, { once: true, passive: true });
    if (matchMedia('(pointer: coarse)').matches) show();
  };
  G.clearHits = () => { I.jumpHit = false; I.actHit = false; };
})();

/* Hazelnut Hollow — Potion Kitchen (SPEC §8.2 `potion`). Paint-like mixing, stirring, a silly toad. */
(function () {
  'use strict';
  const G = window.G;

  const ING = [
    { id: 'red', e: '🍓', t: 'Red', col: '#ff5a72', r: 1 },
    { id: 'yellow', e: '🍋', t: 'Yellow', col: '#ffd23c', y: 1 },
    { id: 'blue', e: '🫐', t: 'Blue', col: '#4a8cff', b: 1 },
    { id: 'green', e: '🍃', t: 'Green', col: '#4fbf6b', y: .5, b: .5 },
    { id: 'pink', e: '🌸', t: 'Pink', col: '#ff9ccd', r: .6, w: .9 },
    { id: 'spark', e: '⭐', t: 'Sparkle', col: '#ffc93c', glit: 8 },
    { id: 'spook', e: '🕷️', t: 'Spooky', col: '#5b4a78', k: 1.2 },
    { id: 'ice', e: '🧊', t: 'Ice', col: '#9fe3ff', w: 1 },
  ];
  // paint-like (red-yellow-blue) colour cube corners, indexed by r*4+y*2+b
  const CUBE = [[1, 1, 1], [.2, .45, .95], [1, .86, .15], [.2, .75, .3], [.95, .2, .25], [.62, .25, .82], [1, .55, .1], [.5, .33, .18]];
  // [r=0,y=0,b=0] unused (white); index bits: r=4,y=2,b=1
  function cubeCol(R, Y, B) {
    const out = [0, 0, 0];
    for (let i = 0; i < 8; i++) {
      const wr = (i & 4) ? R : 1 - R, wy = (i & 2) ? Y : 1 - Y, wb = (i & 1) ? B : 1 - B, w = wr * wy * wb, c = CUBE[i];
      out[0] += w * c[0]; out[1] += w * c[1]; out[2] += w * c[2];
    }
    return out.map(v => v * 255);
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = c => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const unhex = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
  const rgba = (c, a) => 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + a + ')';
  const light = (c, t) => c.map(v => lerp(v, 255, t));
  const dark = (c, t) => c.map(v => lerp(v, 20, t));
  function hsl(c) {
    const r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0, s = 0;
    if (d > 0.001) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
    }
    return { h, s, l };
  }
  function colourName(c) {
    const { h, s, l } = hsl(c);
    if (l < 0.2) return 'black';
    if (l > 0.88) return 'white';
    if (s < 0.2) return l > 0.65 ? 'white' : l < 0.35 ? 'black' : 'brown';
    if (h < 15 || h >= 340) return l > 0.72 ? 'pink' : (l < 0.3 || (s < 0.45 && l < 0.65)) ? 'brown' : 'red';
    if (h < 42) return l < 0.42 ? 'brown' : 'orange';
    if (h < 70) return l < 0.3 ? 'brown' : 'yellow';
    if (h < 170) return 'green';
    if (h < 262) return 'blue';
    if (h < 300) return l > 0.78 ? 'pink' : 'purple';
    return l > 0.7 ? 'pink' : 'purple';
  }
  const EFFECT = { red: 'huge', orange: 'tint', yellow: 'float', green: 'spots', blue: 'tiny', purple: 'rainbow', pink: 'hat', brown: 'spots', white: 'float', black: 'tiny' };
  const LINE = {
    tint: c => 'Ribbit! I am ' + c + '!', huge: c => 'Ribbit! I am big and ' + c + '!', tiny: c => 'Eek! I am tiny and ' + c + '!',
    float: c => 'Wheee! I float! I am ' + c + '!', spots: c => 'Ribbit! I have ' + c + ' spots!', hat: c => 'Ribbit! Party hat! I am ' + c + '!',
    rainbow: () => 'Ribbit! Rainbow toad!',
  };

  const TOAD_SVG = '<svg viewBox="0 0 220 170">' +
    '<ellipse class="tl" cx="40" cy="138" rx="34" ry="22"/><ellipse class="tl" cx="180" cy="138" rx="34" ry="22"/>' +
    '<ellipse class="tc" cx="110" cy="105" rx="86" ry="58"/>' +
    '<ellipse class="belly" cx="110" cy="128" rx="54" ry="32" fill="rgba(255,255,230,.45)"/>' +
    '<g class="spots"><circle cx="58" cy="100" r="9"/><circle cx="82" cy="78" r="7"/><circle cx="160" cy="96" r="10"/><circle cx="138" cy="74" r="6"/><circle cx="120" cy="108" r="6"/><circle cx="36" cy="128" r="6"/><circle cx="184" cy="128" r="6"/></g>' +
    '<ellipse class="tl" cx="64" cy="162" rx="26" ry="9"/><ellipse class="tl" cx="156" cy="162" rx="26" ry="9"/>' +
    '<circle class="tc" cx="70" cy="52" r="27"/><circle class="tc" cx="150" cy="52" r="27"/>' +
    '<circle cx="70" cy="50" r="17" fill="#fff"/><circle cx="150" cy="50" r="17" fill="#fff"/>' +
    '<circle cx="73" cy="52" r="9" fill="#2b2336"/><circle cx="147" cy="52" r="9" fill="#2b2336"/>' +
    '<circle cx="76" cy="48" r="3.5" fill="#fff"/><circle cx="150" cy="48" r="3.5" fill="#fff"/>' +
    '<ellipse class="lid a" cx="70" cy="48" rx="21" ry="23"/><ellipse class="lid b" cx="150" cy="48" rx="21" ry="23"/>' +
    '<path d="M62 100 Q110 134 158 100" fill="none" stroke="#2b2336" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="60" cy="96" r="8" fill="rgba(255,120,150,.55)"/><circle cx="160" cy="96" r="8" fill="rgba(255,120,150,.55)"/>' +
    '<circle cx="100" cy="76" r="2.5" fill="#2b2336"/><circle cx="120" cy="76" r="2.5" fill="#2b2336"/>' +
    '<g class="hat"><path d="M84 20 L110 -36 L136 20 Z" fill="#ff5a9c"/><path d="M92 4 L128 4" stroke="#ffe066" stroke-width="7"/><path d="M99 -16 L121 -16" stroke="#4aa8ff" stroke-width="6"/><circle cx="110" cy="-38" r="9" fill="#ffe066"/><ellipse cx="110" cy="20" rx="28" ry="6" fill="#ffe066"/></g>' +
    '</svg>';

  function mount(stage, api) {
    api.state.bottles = Array.isArray(api.state.bottles) ? api.state.bottles.filter(b => typeof b === 'string').slice(0, 8) : [];
    const ST = api.state;
    const U = G.U;
    const timers = new Set();
    let raf = 0, dead = false;
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms); timers.add(id); return id; };
    const el = (cls, html, tag) => { const e = document.createElement(tag || 'div'); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const put = (e, x, y, w, h) => { e.style.left = x + 'px'; e.style.top = y + 'px'; if (w) e.style.width = w + 'px'; if (h) e.style.height = h + 'px'; return e; };

    /* ---------- the mix ---------- */
    const mix = { r: 0, y: 0, b: 0, w: 0, k: 0, n: 0, glit: 0, fz: null, fzw: 0 };
    const WATER = [112, 200, 214];
    function target() {
      const pu = mix.r + mix.y + mix.b + mix.w + mix.k;
      let col = null;
      if (mix.r + mix.y + mix.b > 0) {
        const m = Math.max(mix.r, mix.y, mix.b);
        col = cubeCol(mix.r / m, mix.y / m, mix.b / m);
      } else if (pu > 0) col = [150, 150, 160];
      if (pu > 0) {
        col = light(col, mix.w / pu * 0.95);
        col = dark(col, Math.min(0.92, mix.k / (pu + mix.k * 0.2) * 1.0));
      }
      if (mix.fz) col = col ? col.map((v, i) => lerp(mix.fz[i], v, pu / (pu + mix.fzw))) : mix.fz.slice();
      return col || WATER;
    }
    const isEmpty = () => mix.n === 0;
    let cur = WATER.slice(), tgt = WATER.slice();

    /* ---------- scenery ---------- */
    stage.appendChild(el('wall'));
    const win = el('win', '<div class="moon"></div><span class="st" style="left:18px;top:24px">✦</span><span class="st" style="left:96px;top:96px;animation-delay:.8s;color:#fff">✦</span><span class="st" style="left:30px;top:100px;animation-delay:1.5s;color:#ffe">✦</span>');
    stage.appendChild(win);
    const herbs = el('herbs', ['🌿', '🧄', '🍄', '🌶️', '🌾', '🧅'].map((h, i) => '<span style="left:' + (8 + i * 50) + 'px;animation-delay:' + (i * .5) + 's">' + h + '</span>').join(''));
    stage.appendChild(herbs);
    stage.appendChild(el('web', '🕸️'));
    stage.appendChild(el('floor'));
    stage.appendChild(el('rug'));
    stage.appendChild(el('broom', '<div class="stk"></div><div class="br"></div>'));
    const plank = (x, y, w) => stage.appendChild(put(el('plank'), x, y, w));
    plank(24, 306, 420); plank(24, 476, 420); plank(678, 224, 584);

    /* cauldron canvas */
    const SC = 1.5, CW = 540, CH = 520, CX = 270, RIMY = 250;
    const cv = el('pot', null, 'canvas'); cv.width = CW * SC; cv.height = CH * SC; stage.appendChild(cv);
    const g = cv.getContext('2d');
    const potC = { x: 640, y: 384 };   // liquid centre in stage px
    const nameEl = el('pname', '<i></i><b>Empty pot</b>'); stage.appendChild(nameEl);
    function setName() {
      const nm = isEmpty() ? 'Empty pot' : U.cap ? U.cap(colourName(tgt)) : colourName(tgt)[0].toUpperCase() + colourName(tgt).slice(1);
      nameEl.querySelector('b').textContent = nm; nameEl.style.setProperty('--pc', hex(tgt));
      nameEl.classList.remove('bump'); void nameEl.offsetWidth; nameEl.classList.add('bump');
    }

    /* ---------- jars ---------- */
    const jars = [];
    ING.forEach((ing, i) => {
      const jx = 34 + (i % 4) * 100, jy = i < 4 ? 190 : 360;
      const j = el('jar idle', '<div class="lid"></div><div class="gl"><div class="em">' + ing.e + '</div><div class="tx">' + ing.t + '</div></div>', 'button');
      j.style.setProperty('--jc', ing.col + 'cc'); j.style.setProperty('--dl', (i * .3) + 's'); put(j, jx, jy);
      j.setAttribute('aria-label', ing.t); stage.appendChild(j); jars.push(j);
      let ghost = null;
      const inZone = (x, y) => x > 430 && x < 860 && y > 170 && y < 580;
      api.drag(j, {
        onStart() { j.classList.add('press'); api.sfx('tap'); },
        onMove(x, y) {
          if (!ghost) { if (Math.hypot(x - (jx + 46), y - (jy + 56)) < 14) return; ghost = el('ghost', ing.e); stage.appendChild(ghost); j.classList.add('moved'); }
          ghost.style.left = x + 'px'; ghost.style.top = y + 'px'; cv.classList.toggle('glow', inZone(x, y));
        },
        onEnd(x, y, moved) {
          j.classList.remove('press', 'moved'); cv.classList.remove('glow');
          if (ghost) { ghost.remove(); ghost = null; }
          if (!moved) addIng(ing, jx + 46, jy + 50);
          else if (inZone(x, y)) addIng(ing, x, y);
        },
      });
    });

    function addIng(ing, sx, sy) {
      const e = el('drop', ing.e); stage.appendChild(e);
      const tx = potC.x + U.rnd(-60, 60) - sx, ty = potC.y - 4 - sy;
      const done = () => { e.remove(); if (dead) return; plop(ing, potC.x + (sx + tx - potC.x)); };
      const x0 = sx, y0 = sy;
      e.style.left = x0 + 'px'; e.style.top = y0 + 'px';
      if (e.animate) {
        const an = e.animate([
          { transform: 'translate(-50%,-50%) scale(1) rotate(0)' },
          { transform: 'translate(calc(-50% + ' + tx * .5 + 'px), calc(-50% + ' + (Math.min(0, ty) - 90) + 'px)) scale(1.15) rotate(150deg)', offset: .45 },
          { transform: 'translate(calc(-50% + ' + tx + 'px), calc(-50% + ' + ty + 'px)) scale(.7) rotate(330deg)' },
        ], { duration: 560, easing: 'cubic-bezier(.4,.1,.6,1)', fill: 'forwards' });
        an.onfinish = done;
        later(() => { if (e.parentNode) { e.remove(); } }, 900);   // safety
      } else later(done, 300);
    }

    function plop(ing, lx) {
      mix.r += ing.r || 0; mix.y += ing.y || 0; mix.b += ing.b || 0; mix.w += ing.w || 0; mix.k += ing.k || 0; mix.n++;
      if (ing.glit) { mix.glit = Math.min(60, mix.glit + ing.glit); for (let i = 0; i < 10; i++) rises.push({ x: potC.x + U.rnd(-90, 90), y: potC.y - 10, vy: -U.rnd(60, 140), vx: U.rnd(-30, 30), life: 1.3, star: 1 }); api.sfx('magic'); }
      tgt = target(); setName();
      splash(lx - 370, ing.id === 'ice' ? 0.6 : 1);
      bump = 1; agit = Math.min(3, agit + 1); api.sfx(ing.id === 'spook' ? 'creak' : 'pop');
      if (ing.id !== 'spook') later(() => api.sfx('bubble'), 80);
      if (ing.id === 'spook') for (let i = 0; i < 4; i++) rises.push({ x: potC.x + U.rnd(-90, 90), y: potC.y - 10, vy: -U.rnd(40, 90), vx: U.rnd(-20, 20), life: 1.6, ghost: 1 });
      if (ing.id === 'ice') for (let i = 0; i < 6; i++) rises.push({ x: potC.x + U.rnd(-90, 90), y: potC.y - 10, vy: -U.rnd(30, 80), vx: U.rnd(-30, 30), life: 1.4, flake: 1 });
    }

    /* ---------- spoon ---------- */
    const REST = { x: 706, y: 398 };
    const spoon = el('spoon back hint', '<div class="rot"><div class="hd"></div><div class="bw"></div><div class="hit2"></div></div><div class="hit"></div>');
    spoon.style.setProperty('--lean', '35deg'); put(spoon, REST.x, REST.y); stage.appendChild(spoon);
    const rot = spoon.querySelector('.rot');
    let stirring = false, lastAng = null, accum = 0, swVel = 0, sw = 0, lastStirSfx = 0;
    api.drag(spoon, {
      onStart(x, y) { spoon.classList.remove('back', 'hint'); spoon.classList.add('hold'); api.sfx('tap'); lastAng = null; accum = 0; },
      onMove(x, y) {
        const px = Math.max(60, Math.min(1220, x)), py = Math.max(200, Math.min(660, y));
        spoon.style.left = px + 'px'; spoon.style.top = py + 'px';
        rot.style.setProperty('transform', 'rotate(' + Math.max(-45, Math.min(45, (px - 640) * .22)) + 'deg)');
        const nx = (px - potC.x) / 210, ny = (py - potC.y - 6) / 105;
        if (nx * nx + ny * ny < 1) {
          const a = Math.atan2(ny, nx);
          if (lastAng !== null) {
            let da = a - lastAng; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI;
            swVel = Math.max(-9, Math.min(9, swVel + da * 5)); accum += Math.abs(da); agit = Math.min(3, agit + Math.abs(da) * .5);
            if (accum > 1.4) { accum = 0; const t = performance.now(); if (t - lastStirSfx > 380) { lastStirSfx = t; api.sfx(Math.random() < .5 ? 'bubble' : 'pop'); } bump = Math.max(bump, .4); }
          }
          lastAng = a; stirring = true;
        } else { lastAng = null; stirring = false; }
      },
      onEnd() {
        spoon.classList.remove('hold'); spoon.classList.add('back'); stirring = false;
        spoon.style.left = REST.x + 'px'; spoon.style.top = REST.y + 'px'; rot.style.removeProperty('transform');
      },
    });

    /* ---------- toad ---------- */
    const toad = el('toad', '<div class="tsh"></div><div class="tw"><div class="tin">' + TOAD_SVG + '</div></div>');
    stage.appendChild(toad);
    function tap(e, fn) {
      e.style.touchAction = 'none';
      e.addEventListener('pointerdown', ev => { ev.preventDefault(); e.classList.add('press'); });
      const rel = ev => { e.classList.remove('press'); const r = e.getBoundingClientRect(); if (ev.type === 'pointerup' && ev.clientX >= r.left - 6 && ev.clientX <= r.right + 6 && ev.clientY >= r.top - 6 && ev.clientY <= r.bottom + 6) fn(ev); };
      e.addEventListener('pointerup', rel); e.addEventListener('pointercancel', rel); e.addEventListener('pointerleave', ev => e.classList.remove('press'));
    }
    const hopper = (node, ms) => { node.classList.remove('hop'); void node.offsetWidth; node.classList.add('hop'); later(() => node.classList.remove('hop'), ms || 750); };
    const toadPos = () => ({ x: 850 + 110, y: 468 + 90 });
    tap(toad, () => { hopper(toad); api.sfx('squeak'); api.spark(toadPos().x, toadPos().y - 40, '💚'); });
    later(function again() { if (!toad.classList.contains('float')) hopper(toad); later(again, U.rnd(7000, 11000)); }, 5000);
    const cat = el('cat', '🐈‍⬛'); put(cat, 70, 520); stage.appendChild(cat);
    tap(cat, () => { hopper(cat); api.sfx('meow'); api.spark(120, 540, '💜'); });

    /* ---------- bottles ---------- */
    const slotEls = [];
    const BX = 690, BY = 112;
    for (let i = 0; i < 8; i++) {
      const b = el('bt empty', '<div class="ck"></div><div class="nk"></div><div class="bd"><div class="lq"></div></div>', 'button');
      put(b, BX + i * 72, BY); stage.appendChild(b); slotEls.push(b);
      tap(b, () => onBottle(i));
    }
    function renderBottles(newIdx) {
      slotEls.forEach((b, i) => {
        const c = ST.bottles[i];
        b.classList.toggle('full', !!c); b.classList.toggle('empty', !c);
        if (c) b.style.setProperty('--bc', c); else b.style.removeProperty('--bc');
        if (i === newIdx) { b.classList.remove('new'); void b.offsetWidth; b.classList.add('new'); later(() => b.classList.remove('new'), 700); }
      });
    }
    function flyDrop(from, to, col, done) {
      const f = el('fly'); f.style.cssText += ';width:26px;height:26px;border-radius:50%;background:' + col + ';box-shadow:0 0 12px ' + col + ';left:' + from.x + 'px;top:' + from.y + 'px;margin:-13px 0 0 -13px';
      stage.appendChild(f);
      if (!f.animate) { f.remove(); done(); return; }
      const an = f.animate([{ transform: 'translate(0,0) scale(.6)' }, { transform: 'translate(' + (to.x - from.x) * .5 + 'px,' + (Math.min(from.y, to.y) - from.y - 90) + 'px) scale(1.3)', offset: .5 }, { transform: 'translate(' + (to.x - from.x) + 'px,' + (to.y - from.y) + 'px) scale(.8)' }], { duration: 520, easing: 'ease-in-out', fill: 'forwards' });
      an.onfinish = () => { f.remove(); if (!dead) done(); };
      later(() => f.remove(), 1000);
    }
    function onBottle(i) {
      const slot = { x: BX + i * 72 + 34, y: BY + 60 };
      if (ST.bottles[i]) {            // full: pour back into the pot
        const col = ST.bottles[i]; ST.bottles.splice(i, 1); api.save(); renderBottles(); api.sfx('splash');
        flyDrop(slot, { x: potC.x, y: potC.y - 10 }, col, () => {
          const c = unhex(col);
          if (mix.fz) { mix.fz = mix.fz.map((v, k) => (v * mix.fzw + c[k]) / (mix.fzw + 1)); mix.fzw++; } else { mix.fz = c; mix.fzw = 1; }
          mix.n++; tgt = target(); setName(); splash(potC.x - 370, 1); bump = 1; agit = Math.min(3, agit + 1); api.sfx('bubble');
        });
        return;
      }
      if (isEmpty()) { slotEls[i].classList.remove('shake'); void slotEls[i].offsetWidth; slotEls[i].classList.add('shake'); api.sfx('tap'); api.say('Add something first!'); return; }
      const idx = ST.bottles.length, col = hex(tgt);
      api.sfx('splash'); bump = .6;
      flyDrop({ x: potC.x, y: potC.y - 10 }, { x: BX + idx * 72 + 34, y: BY + 60 }, col, () => {
        if (ST.bottles.length >= 8) return;
        ST.bottles.push(col); api.save(); renderBottles(ST.bottles.length - 1); api.sfx('coin'); api.spark(BX + idx * 72 + 34, BY + 60, '✨');
      });
    }
    renderBottles();

    /* ---------- wand + bucket ---------- */
    const wand = el('btn wand', '✨<span class="cap">Cast!</span>', 'button'); put(wand, 1040, 586); wand.setAttribute('aria-label', 'Cast'); stage.appendChild(wand);
    const bucket = el('btn bucket', '🪣<span class="cap">Empty</span>', 'button'); put(bucket, 1156, 586); bucket.setAttribute('aria-label', 'Empty the pot'); stage.appendChild(bucket);
    let resetT = 0;
    function resetToad() { toad.classList.remove('huge', 'tiny', 'float', 'rainbow', 'spotty', 'hatted'); toad.style.setProperty('--toad', '#79c768'); toad.style.setProperty('--spot', '#5aa24b'); }
    tap(wand, () => {
      wand.classList.remove('cast'); void wand.offsetWidth; wand.classList.add('cast'); later(() => wand.classList.remove('cast'), 750);
      if (isEmpty()) { api.sfx('tap'); api.say('Add magic first!'); api.spark(potC.x, potC.y - 30, '💧'); return; }
      const c = colourName(tgt); let eff = EFFECT[c] || 'tint';
      if (mix.glit >= 16) eff = 'rainbow';
      clearTimeout(resetT); resetToad();
      const col = hex(tgt), tp = toadPos();
      api.sfx('magic'); later(() => api.sfx('unlock'), 200);
      // a trail of sparkles from the pot to the toad
      for (let i = 0; i < 6; i++) later(() => flyDrop({ x: potC.x + 60, y: potC.y - 20 }, { x: tp.x + U.rnd(-30, 30), y: tp.y + U.rnd(-40, 20) }, col, () => { }), i * 70);
      later(() => {
        toad.classList.remove('hop'); void toad.offsetWidth;
        if (eff !== 'spots') toad.style.setProperty('--toad', col);
        toad.style.setProperty('--spot', col);
        if (eff === 'huge') toad.classList.add('huge');
        if (eff === 'tiny') toad.classList.add('tiny');
        if (eff === 'float') toad.classList.add('float');
        if (eff === 'spots') toad.classList.add('spotty');
        if (eff === 'hat') toad.classList.add('hatted');
        if (eff === 'rainbow') toad.classList.add('rainbow');
        toad.classList.add('rib'); later(() => toad.classList.remove('rib'), 700);
        const pf = el('poof', '💥'); put(pf, tp.x, tp.y - 20); stage.appendChild(pf); later(() => pf.remove(), 950);
        api.spark(tp.x, tp.y - 30, eff === 'rainbow' ? '🌈' : undefined); api.sfx('squeak');
        api.say(LINE[eff](c));
        if (G.S && G.S.stats) G.S.stats.potions = (G.S.stats.potions || 0) + 1;
        api.save();
        resetT = later(() => { resetToad(); api.sfx('pop'); }, 7500);
      }, 450);
    });
    tap(bucket, () => {
      api.sfx('splash'); bucket.classList.remove('cast'); void bucket.offsetWidth; bucket.classList.add('cast'); later(() => bucket.classList.remove('cast'), 750);
      if (!isEmpty()) { splash(CX, 1.4); for (let i = 0; i < 6; i++) later(() => api.sfx('pop'), i * 90); }
      mix.r = mix.y = mix.b = mix.w = mix.k = mix.n = mix.glit = mix.fzw = 0; mix.fz = null; tgt = WATER.slice(); setName(); bump = 1; agit = 0;
      glitter.length = 0;
    });

    /* ---------- canvas animation ---------- */
    const bubs = [], steam = [], drops = [], rings = [], rises = [], glitter = [], pops = [];
    let bump = 0, agit = 0, tAll = 0, steamAcc = 0, bubAcc = 0, popSfx = 0, last = performance.now();
    function splash(lxCanvas, k) {
      const n = Math.round(9 * (k || 1));
      for (let i = 0; i < n; i++) drops.push({ x: lxCanvas + U.rnd(-40, 40), y: RIMY, vx: U.rnd(-90, 90), vy: -U.rnd(140, 300), life: 1 });
      rings.push({ x: lxCanvas, r: 6, a: 1 });
    }
    function star(c, x, y, r, rot) {
      c.beginPath();
      for (let i = 0; i < 8; i++) { const a = rot + i * Math.PI / 4, rr = i % 2 ? r * .3 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      c.closePath(); c.fill();
    }
    function frame(now) {
      if (dead) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; tAll += dt;
      for (let i = 0; i < 3; i++) cur[i] += (tgt[i] - cur[i]) * (1 - Math.exp(-5 * dt));
      bump = Math.max(0, bump - dt * 2.2); agit = Math.max(0, agit - dt * .5);
      swVel *= Math.exp(-1.6 * dt); sw += swVel * dt;
      // spawn
      steamAcc += dt * (4 + agit * 5 + (isEmpty() ? 0 : 3));
      while (steamAcc > 1) { steamAcc--; steam.push({ x: CX + U.rnd(-100, 100), y: RIMY - 10, vx: U.rnd(-10, 10), vy: -U.rnd(30, 60), r: U.rnd(16, 28), life: 0, max: U.rnd(2, 3.2) }); }
      bubAcc += dt * (2.2 + agit * 4 + Math.abs(swVel) * 1.5);
      while (bubAcc > 1) { bubAcc--; const a = Math.random() * 6.28, d = Math.sqrt(Math.random()); bubs.push({ x: Math.cos(a) * d * .85, y: Math.sin(a) * d * .8, r: U.rnd(6, 15), life: 0, max: U.rnd(.7, 1.5) }); }
      if (mix.glit > 0) while (glitter.length < mix.glit) glitter.push({ x: U.rnd(-.9, .9), y: U.rnd(-.8, .8), ph: Math.random() * 6.28, sp: U.rnd(2, 5) });
      if (mix.glit > 0 && Math.random() < dt * 6) rises.push({ x: potC.x + U.rnd(-100, 100), y: potC.y - 6, vy: -U.rnd(40, 100), vx: U.rnd(-20, 20), life: 1.2, star: 1 });

      g.setTransform(SC, 0, 0, SC, 0, 0); g.clearRect(0, 0, CW, CH);
      const sq = 1 + bump * .05 * Math.sin(tAll * 30), ty = bump * 4 * Math.sin(tAll * 24);
      g.save(); g.translate(CX, 330 + ty); g.scale(1 / sq * (1 + bump * .02), sq); g.translate(-CX, -330);
      // fire
      g.save();
      g.fillStyle = '#5b3a22'; g.save(); g.translate(CX - 70, 478); g.rotate(.12); g.fillRect(-60, -9, 130, 18); g.restore(); g.save(); g.translate(CX + 70, 478); g.rotate(-.12); g.fillRect(-60, -9, 130, 18); g.restore();
      for (let i = 0; i < 7; i++) {
        const fx = CX - 120 + i * 40, h = 50 + 34 * Math.sin(tAll * 7 + i * 1.7) + (i === 3 ? 30 : 0), w = 24 + Math.sin(tAll * 5 + i) * 4;
        const fg = g.createLinearGradient(0, 480, 0, 480 - h); fg.addColorStop(0, '#ffe066'); fg.addColorStop(.5, '#ff9a3c'); fg.addColorStop(1, 'rgba(255,90,60,.0)');
        g.fillStyle = fg; g.beginPath(); g.moveTo(fx - w, 482); g.quadraticCurveTo(fx - w * .6, 482 - h * .6, fx + Math.sin(tAll * 9 + i) * 6, 482 - h); g.quadraticCurveTo(fx + w * .6, 482 - h * .6, fx + w, 482); g.closePath(); g.fill();
      }
      g.restore();
      // legs
      g.fillStyle = '#2b2736'; [[CX - 110, 430], [CX + 110, 430]].forEach(l => { g.beginPath(); g.ellipse(l[0], l[1] + 20, 20, 32, 0, 0, 7); g.fill(); });
      // body
      const bg = g.createLinearGradient(CX - 170, 0, CX + 170, 0); bg.addColorStop(0, '#6a6280'); bg.addColorStop(.25, '#4a4460'); bg.addColorStop(.7, '#2f2b40'); bg.addColorStop(1, '#201d2e');
      g.fillStyle = bg; g.beginPath(); g.moveTo(CX + 168, RIMY); g.lineTo(CX + 168, 300); g.ellipse(CX, 300, 168, 150, 0, 0, Math.PI, false); g.lineTo(CX - 168, RIMY); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.ellipse(CX - 105, 335, 18, 70, .4, 0, 7); g.fill();
      // glow of potion on the body
      
      // rivets band
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(CX - 168, 262, 336, 8);
      g.fillStyle = '#8a82a3'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(CX - 135 + i * 45, 288, 5, 0, 7); g.fill(); }
      // rim
      const rg = g.createLinearGradient(0, RIMY - 48, 0, RIMY + 48); rg.addColorStop(0, '#8d85a8'); rg.addColorStop(1, '#4e486a');
      g.fillStyle = rg; g.beginPath(); g.ellipse(CX, RIMY, 168, 48, 0, 0, 7); g.fill();
      g.fillStyle = '#17141f'; g.beginPath(); g.ellipse(CX, RIMY + 2, 150, 39, 0, 0, 7); g.fill();
      // liquid
      const LX = CX, LY = RIMY + 3, LRX = 142, LRY = 34;
      const lg = g.createRadialGradient(LX, LY - 8, 6, LX, LY, LRX); lg.addColorStop(0, hex(light(cur, .35))); lg.addColorStop(.6, hex(cur)); lg.addColorStop(1, hex(dark(cur, .35)));
      g.fillStyle = lg; g.beginPath(); g.ellipse(LX, LY, LRX, LRY, 0, 0, 7); g.fill();
      g.save(); g.beginPath(); g.ellipse(LX, LY, LRX, LRY, 0, 0, 7); g.clip();
      // swirl
      const sa = Math.min(.55, .12 + Math.abs(swVel) * .06);
      for (let k = 0; k < 3; k++) {
        g.strokeStyle = k % 2 ? rgba(dark(cur, .3), sa) : rgba(light(cur, .6), sa); g.lineWidth = 10 - k * 2; g.lineCap = 'round'; g.beginPath();
        for (let s = 0; s <= 1; s += .04) { const a = sw + k * 2.09 + s * 5.5, r = s * 130; const px = LX + Math.cos(a) * r, py = LY + Math.sin(a) * r * .26; s === 0 ? g.moveTo(px, py) : g.lineTo(px, py); }
        g.stroke();
      }
      // ripples
      for (let i = rings.length - 1; i >= 0; i--) { const rg2 = rings[i]; rg2.r += dt * 160; rg2.a -= dt * 1.3; if (rg2.a <= 0) { rings.splice(i, 1); continue; } g.strokeStyle = 'rgba(255,255,255,' + rg2.a * .7 + ')'; g.lineWidth = 3; g.beginPath(); g.ellipse(rg2.x, LY, rg2.r, rg2.r * .26, 0, 0, 7); g.stroke(); }
      // glitter
      g.fillStyle = '#fff'; for (const p of glitter) { const tw = Math.max(0, Math.sin(tAll * p.sp + p.ph)); if (tw < .15) continue; star(g, LX + p.x * LRX * .95, LY + p.y * LRY * .9, 2 + tw * 5, tAll * p.sp); }
      // bubbles
      for (let i = bubs.length - 1; i >= 0; i--) {
        const b = bubs[i]; b.life += dt; const t = b.life / b.max;
        if (t >= 1) { pops.push({ x: LX + b.x * LRX, y: LY + b.y * LRY, r: b.r, t: 0 }); bubs.splice(i, 1); if (tAll - popSfx > .25 && Math.random() < .35) { popSfx = tAll; api.sfx('pop'); } continue; }
        const r = b.r * Math.min(1, t * 3) * (1 + (t > .85 ? (t - .85) * 3 : 0)), bx = LX + b.x * LRX, by = LY + b.y * LRY - r * .5;
        g.fillStyle = rgba(light(cur, .5), .45); g.beginPath(); g.ellipse(bx, by, r, r * .85, 0, 0, 7); g.fill();
        g.strokeStyle = rgba(light(cur, .85), .9); g.lineWidth = 2; g.stroke();
        g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(bx - r * .35, by - r * .35, r * .22, 0, 7); g.fill();
      }
      for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; p.t += dt * 4; if (p.t >= 1) { pops.splice(i, 1); continue; } g.strokeStyle = 'rgba(255,255,255,' + (1 - p.t) + ')'; g.lineWidth = 2; g.beginPath(); g.ellipse(p.x, p.y, p.r * (1 + p.t), p.r * (1 + p.t) * .8, 0, 0, 7); g.stroke(); }
      g.restore();
      // shine on rim front
      g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 4; g.beginPath(); g.ellipse(CX, RIMY, 164, 45, 0, .15 * Math.PI, .85 * Math.PI); g.stroke();
      g.restore();

      // droplets
      for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i]; d.vy += 700 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt * .9; if (d.life <= 0 || d.y > RIMY + 6 && d.vy > 0) { drops.splice(i, 1); continue; } g.fillStyle = rgba(light(cur, .2), .95); g.beginPath(); g.arc(d.x, d.y, 5, 0, 7); g.fill(); }
      // steam
      for (let i = steam.length - 1; i >= 0; i--) {
        const s = steam[i]; s.life += dt; if (s.life > s.max) { steam.splice(i, 1); continue; }
        s.x += (s.vx + Math.sin(tAll * 2 + i) * 14) * dt; s.y += s.vy * dt; const t = s.life / s.max, a = Math.sin(t * Math.PI) * .16;
        g.fillStyle = rgba(light(cur, .55), a); g.beginPath(); g.arc(s.x, s.y, s.r * (1 + t * 1.3), 0, 7); g.fill();
      }
      // rising sparkles / flakes / ghosts (stage coordinates -> canvas)
      for (let i = rises.length - 1; i >= 0; i--) {
        const p = rises[i]; p.life -= dt; if (p.life <= 0) { rises.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt;
        const cx2 = p.x - 370, cy2 = p.y - 130, a = Math.min(1, p.life);
        if (p.star) { g.fillStyle = 'rgba(255,240,150,' + a + ')'; star(g, cx2, cy2, 6 + a * 4, tAll * 4); }
        else if (p.flake) { g.fillStyle = 'rgba(220,245,255,' + a + ')'; star(g, cx2, cy2, 8, tAll * 2); }
        else { g.fillStyle = 'rgba(255,255,255,' + a * .45 + ')'; g.beginPath(); g.ellipse(cx2, cy2, 14, 20, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(40,20,60,' + a + ')'; g.beginPath(); g.arc(cx2 - 5, cy2 - 3, 2.5, 0, 7); g.arc(cx2 + 5, cy2 - 3, 2.5, 0, 7); g.fill(); }
      }
    }
    setName(); nameEl.classList.remove('bump');
    raf = requestAnimationFrame(frame);
    later(() => api.say('Pop things in the pot!'), 500);

    return {
      destroy() {
        dead = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers.clear();
      },
    };
  }

  G.SB.register('potion', { name: 'Potion Kitchen', icon: '🧪', col: '#c9a6ff', blurb: 'Mix magic potions', mount });
})();

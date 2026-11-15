/* Hazelnut Hollow — handwriting: glyph model (UK school print), deterministic stroke analyser, and the writing pad.
   G.HW.GLYPHS  glyph table (y is UP from the baseline: baseline 0, x-height 50, ascender/cap 100, descender -40)
   G.HW.analyse(ch, strokes, box, tolerance) pure function (also works in Node: module.exports)
   G.HW.mount(container, opts) -> { destroy, clear, demo, layout }                                             */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const G = root.G = root.G || {};

  /* =====================================================================================================
     1. GLYPHS
     ===================================================================================================== */
  const D2R = Math.PI / 180;
  // ellipse arc, angles in degrees (0 = right, 90 = up); a1 > a0 is anticlockwise, a1 < a0 clockwise
  function E(cx, cy, rx, ry, a0, a1) {
    const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 9)), out = [];
    for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * D2R; out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    return out;
  }
  const arc = (cx, cy, r, a0, a1) => E(cx, cy, r, r, a0, a1);
  function J() { // join polylines, dropping duplicate joints
    const out = [];
    for (const part of arguments) for (const q of part) { const l = out[out.length - 1]; if (l && Math.hypot(l[0] - q[0], l[1] - q[1]) < 0.8) continue; out.push(q); }
    return out;
  }
  const L = function () { return Array.prototype.slice.call(arguments); };
  const GL = {};
  const def = (ch, w, strokes) => { GL[ch] = { w, strokes: strokes.map(s => s.map(p => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10])) }; };
  const ring = cx => E(cx, 25, 21, 25, 60, 420);                       // a/d/g/q round: 1-2 o'clock, anticlockwise
  const arch = (xl, xr) => J(E((xl + xr) / 2, 30, (xr - xl) / 2, 20, 180, 0), L([xr, 0])); // up the stem, clockwise over, down

  // ---- lower case
  def('a', 56, [ring(26), L([47, 50], [47, 0])]);
  def('b', 54, [L([6, 100], [6, 0]), E(27, 25, 21, 25, 190, -170)]);
  def('c', 50, [E(27, 25, 21, 25, 45, 315)]);
  def('d', 56, [ring(26), L([47, 100], [47, 0])]);
  def('e', 54, [J(L([5, 25], [47, 25]), E(26, 25, 21, 25, 0, 325))]);
  def('f', 44, [J(E(32, 84, 16, 16, 30, 180), L([16, 0])), L([4, 50], [32, 50])]);
  def('g', 56, [ring(26), J(L([47, 50], [47, -10]), E(30, -10, 17, 17, 0, -160))]);
  def('h', 52, [L([6, 100], [6, 0]), arch(6, 44)]);
  def('i', 20, [L([10, 50], [10, 0]), [[10, 72]]]);
  def('j', 28, [J(L([20, 50], [20, -18]), E(9, -18, 11, 11, 0, -150)), [[20, 72]]]);
  def('k', 48, [L([6, 100], [6, 0]), L([40, 50], [8, 22], [42, 0])]);
  def('l', 20, [L([10, 100], [10, 0])]);
  def('.', 20, [[[10, 5]]]);                                           // full stop: one dot on the line
  def('m', 72, [L([6, 50], [6, 0]), arch(6, 34), arch(34, 62)]);
  def('n', 52, [L([6, 50], [6, 0]), arch(6, 44)]);
  def('o', 54, [E(27, 25, 21, 25, 60, 420)]);
  def('p', 54, [L([6, 50], [6, -40]), E(27, 25, 21, 25, 190, -170)]);
  def('q', 56, [ring(26), L([47, 50], [47, -40])]);
  def('r', 40, [L([6, 50], [6, 0]), E(24, 30, 18, 20, 180, 55)]);
  def('s', 40, [J(E(20, 37.5, 15, 12.5, 40, 270), E(20, 12.5, 15, 12.5, 90, -140))]);
  def('t', 40, [J(L([18, 80], [18, 10]), E(28, 10, 10, 10, 180, 270)), L([4, 50], [34, 50])]);
  def('u', 52, [J(L([6, 50], [6, 22]), E(25, 22, 19, 22, 180, 360), L([44, 50])), L([44, 50], [44, 0])]);
  def('v', 48, [L([4, 50], [24, 0], [44, 50])]);
  def('w', 60, [L([4, 50], [17, 0], [30, 50], [43, 0], [56, 50])]);
  def('x', 48, [L([6, 50], [42, 0]), L([42, 50], [6, 0])]);
  def('y', 48, [L([4, 50], [24, 0]), L([44, 50], [8, -40])]);
  def('z', 48, [L([6, 50], [42, 50], [6, 0], [42, 0])]);

  // ---- capitals (top to bottom, left to right)
  def('A', 60, [L([30, 100], [4, 0]), L([30, 100], [56, 0]), L([13, 35], [47, 35])]);
  def('B', 58, [L([6, 100], [6, 0]), J(L([6, 100], [26, 100]), E(26, 75, 22, 25, 90, -90), L([28, 50]), E(28, 25, 24, 25, 90, -90), L([6, 0]))]);
  def('C', 70, [E(36, 50, 32, 50, 45, 315)]);
  def('D', 66, [L([6, 100], [6, 0]), J(L([6, 100], [24, 100]), E(24, 50, 36, 50, 90, -90), L([6, 0]))]);
  def('E', 50, [L([6, 100], [6, 0]), L([6, 100], [42, 100]), L([6, 50], [36, 50]), L([6, 0], [42, 0])]);
  def('F', 48, [L([6, 100], [6, 0]), L([6, 100], [42, 100]), L([6, 52], [36, 52])]);
  def('G', 74, [J(E(36, 50, 32, 50, 45, 360), L([40, 50]))]);
  def('H', 56, [L([6, 100], [6, 0]), L([48, 100], [48, 0]), L([6, 50], [48, 50])]);
  def('I', 20, [L([10, 100], [10, 0])]);
  def('J', 42, [J(L([36, 100], [36, 25]), E(19, 25, 17, 17, 0, -160))]);
  def('K', 54, [L([6, 100], [6, 0]), L([46, 100], [8, 45]), L([19.7, 62], [48, 0])]);
  def('L', 44, [L([6, 100], [6, 0], [40, 0])]);
  def('M', 70, [L([6, 100], [6, 0]), L([6, 100], [34, 25], [62, 100], [62, 0])]);
  def('N', 54, [L([6, 100], [6, 0]), L([6, 100], [46, 0], [46, 100])]);
  def('O', 72, [E(36, 50, 32, 50, 80, 440)]);
  def('P', 52, [L([6, 100], [6, 0]), J(L([6, 100], [24, 100]), E(24, 75, 22, 25, 90, -90), L([6, 50]))]);
  def('Q', 72, [E(36, 50, 32, 50, 80, 440), L([44, 22], [66, -6])]);
  def('R', 56, [L([6, 100], [6, 0]), J(L([6, 100], [24, 100]), E(24, 75, 22, 25, 90, -90), L([6, 50])), L([22, 50], [48, 0])]);
  def('S', 58, [J(E(28, 75, 22, 25, 40, 270), E(28, 25, 24, 25, 90, -140))]);
  def('T', 52, [L([26, 100], [26, 0]), L([4, 100], [48, 100])]);
  def('U', 58, [J(L([6, 100], [6, 30]), E(28, 30, 22, 30, 180, 360), L([50, 100]))]);
  def('V', 56, [L([4, 100], [28, 0], [52, 100])]);
  def('W', 76, [L([4, 100], [20, 0], [38, 100], [56, 0], [72, 100])]);
  def('X', 58, [L([6, 100], [52, 0]), L([52, 100], [6, 0])]);
  def('Y', 52, [L([4, 100], [26, 50], [26, 0]), L([48, 100], [26, 50])]);
  def('Z', 54, [L([6, 100], [48, 100], [6, 0], [48, 0])]);

  // ---- digits
  def('0', 56, [E(28, 50, 24, 50, 80, 440)]);
  def('1', 40, [L([22, 100], [22, 0])]);
  def('2', 56, [J(E(26, 74, 22, 26, 160, -35), L([6, 0], [50, 0]))]);
  def('3', 54, [J(E(24, 75, 20, 25, 150, -90), E(24, 26, 22, 26, 90, -150))]);
  def('4', 56, [L([38, 100], [4, 32], [50, 32]), L([38, 100], [38, 0])]);
  def('5', 54, [J(L([10, 100], [7, 52]), E(26, 30, 22, 30, 140, -150)), L([10, 100], [46, 100])]);
  def('6', 56, [J(E(44, 48, 40, 52, 100, 188), E(26, 30, 22, 30, 180, 540))]);
  def('7', 56, [L([6, 100], [50, 100], [20, 0])]);
  def('8', 56, [J(E(28, 76, 20, 24, 45, 270), E(28, 26, 23, 26, 90, -250))]);
  def('9', 56, [J(E(28, 72, 22, 28, 60, 420), L([50, 72], [50, 22]), E(28, 22, 22, 22, 0, -80))]);

  /* =====================================================================================================
     2. ANALYSER
     ===================================================================================================== */
  const N = 32;
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function pathLen(p) { let s = 0; for (let i = 1; i < p.length; i++) s += dist(p[i - 1], p[i]); return s; }
  function resample(p, n) {
    const out = [];
    if (p.length === 1 || pathLen(p) < 1e-6) { for (let i = 0; i < n; i++) out.push(p[0].slice()); return out; }
    const total = pathLen(p), step = total / (n - 1);
    let j = 1, acc = 0; out.push(p[0].slice());
    for (let i = 1; i < n - 1; i++) {
      const target = i * step;
      while (j < p.length - 1 && acc + dist(p[j - 1], p[j]) < target) { acc += dist(p[j - 1], p[j]); j++; }
      const seg = dist(p[j - 1], p[j]) || 1, t = clamp((target - acc) / seg, 0, 1);
      out.push([p[j - 1][0] + (p[j][0] - p[j - 1][0]) * t, p[j - 1][1] + (p[j][1] - p[j - 1][1]) * t]);
    }
    out.push(p[p.length - 1].slice());
    return out;
  }
  function meanDist(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += dist(a[i], b[i]); return s / a.length; }
  function chamfer(a, b) {
    let s1 = 0, s2 = 0;
    for (const p of a) { let m = 1e9; for (const q of b) { const d = dist(p, q); if (d < m) m = d; } s1 += m; }
    for (const q of b) { let m = 1e9; for (const p of a) { const d = dist(p, q); if (d < m) m = d; } s2 += m; }
    return (s1 + s2) / (a.length + b.length);
  }
  function bbox(strokes) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const s of strokes) for (const p of s) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
  }
  function area(p) { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a / 2; }
  function perms(n) {
    const out = [], a = [...Array(n).keys()];
    (function rec(k) { if (k === n) { out.push(a.slice()); return; } for (let i = k; i < n; i++) { [a[k], a[i]] = [a[i], a[k]]; rec(k + 1); [a[k], a[i]] = [a[i], a[k]]; } })(0);
    return out;
  }
  function compositions(n, k) { // split n items into k non-empty contiguous groups -> arrays of sizes
    const out = [];
    (function rec(left, parts, acc) {
      if (parts === 1) { out.push(acc.concat(left)); return; }
      for (let s = 1; s <= left - parts + 1; s++) rec(left - s, parts - 1, acc.concat(s));
    })(n, k, []);
    return out;
  }
  function toGlyph(strokes, box) {
    const s = box.s || 1, bx = box.x || 0, by = box.y || 0, flip = box.flipY !== false;
    return strokes.map(st => st.map(p => {
      const px = Array.isArray(p) ? p[0] : p.x, py = Array.isArray(p) ? p[1] : p.y;
      return [(px - bx) / s, flip ? (by - py) / s : (py - by) / s];
    }));
  }

  const MSG = {
    start: 'Start at the dot!',
    direction: 'Go the other way!',
    circle: 'Go round the other way, like a c!',
    order: 'Follow the numbers. Do the lines in order!',
    shape: 'Nearly! Follow the dotted line.',
    line: 'Sit on the line!',
    lineDesc: 'Let the tail hang down below the line!',
    tooBig: 'A little smaller, please!',
    tooSmall: 'Make it a bit bigger!',
    dot: "Don't forget the dot!",
    dotPlace: 'Put the dot just above.',
    stop: "Don't forget the full stop!",
    stopPlace: 'Put a little dot on the line.',
    fewer: 'Keep going! There is more to draw.',
  };

  function analyse(ch, strokes, box, tolMul) {
    const T = tolMul || 1, MT = 18 * T, ST = 25 * T;
    const g = GL[ch];
    if (!g) return { score: 1, issue: null, ok: true };
    box = box || { x: 0, y: 0, s: 1 };
    const Dall = toGlyph(strokes || [], box).filter(s => s.length > 0);
    const expMain = g.strokes.filter(s => s.length > 1), expDot = g.strokes.find(s => s.length === 1);
    const tiny = s => { const b = bbox([s]); return Math.hypot(b.w, b.h) < 14; };
    const dots = Dall.filter(tiny), main = Dall.filter(s => !tiny(s));
    const n = expMain.length, k = main.length;
    const R = (issue, msg, score, extra) => Object.assign({ score: issue ? Math.min(score, 0.49) : score, issue, ok: !issue && score >= 0.5, msg: issue ? msg : '' }, extra || {});
    const sc = m => clamp(1 - m / (36 * T), 0, 1);

    if (n === 0 && expDot) { // full stop: any small mark near the dot
      if (!Dall.length) return R('stroke-count', MSG.stop, 0, { few: true });
      const near = Dall.some(d => { const b = bbox([d]); return Math.hypot(b.w, b.h) < 30 && dist([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2], expDot[0]) < 40 * T; });
      return near ? R(null, '', 1) : R('shape', MSG.stopPlace, 0.3);
    }
    if (k === 0) return R('stroke-count', MSG.fewer, 0, { few: true });
    if (k > n) return R('stroke-count', 'Try to draw it in just ' + n + (n === 1 ? ' line.' : ' lines.'), 0.2, { many: true });

    const stat = (d, e) => {
      const dr = resample(d, N), er = resample(e, N);
      return { f: meanDist(dr, er), r: meanDist(dr, er.slice().reverse()), c: chamfer(dr, er), start: dist(d[0], e[0]), d, e, dr, er };
    };
    const shapeErr = st => st.f;
    // returns null if the stroke is fine, otherwise the issue name
    const diagStroke = st => {
      const bb = bbox([st.e]), size = Math.max(bb.w, bb.h);
      if (dist(st.e[0], st.e[st.e.length - 1]) < 0.3 * size) { // closed shape: winding check
        const bd = bbox([st.d]);
        if (dist(st.d[0], st.d[st.d.length - 1]) < 0.5 * Math.max(bd.w, bd.h)) {
          const ae = area(st.er), ad = area(st.dr);
          if (ae * ad < 0 && Math.abs(ad) > 0.25 * Math.abs(ae)) return 'circle';
        }
      }
      if (st.r < st.f * 0.75 && st.r <= MT * 1.4 && st.f > MT * 0.5) return 'direction';
      if (st.start > ST) return 'start';
      if (shapeErr(st) > MT) return 'shape';
      return null;
    };
    const diag = sts => { for (const st of sts) { const i = diagStroke(st); if (i) return i; } return null; };

    // ---- decide how the drawn strokes pair with expected strokes (merging allowed when fewer were drawn)
    let groups; // array of arrays of expected-stroke indices
    if (k === n) groups = expMain.map((e, i) => [i]);
    else {
      let best = null;
      for (const comp of compositions(n, k)) {
        let idx = 0; const gr = comp.map(sz => { const a = []; for (let q = 0; q < sz; q++) a.push(idx++); return a; });
        const sts = gr.map((a, i) => stat(main[i], J.apply(null, a.map(q => expMain[q]))));
        const cost = sts.reduce((s, st) => s + shapeErr(st) + 0.2 * st.start, 0);
        if (!best || cost < best.cost) best = { cost, gr };
      }
      groups = best.gr;
    }
    const pairs = groups.map((a, i) => stat(main[i], J.apply(null, a.map(q => expMain[q]))));
    let issue = diag(pairs), extra = {};

    if (issue && k === n && n > 1) { // maybe right shapes, wrong order
      const M = main.map(d => expMain.map(e => stat(d, e)));
      for (const p of perms(n)) {
        if (p.every((v, i) => v === i)) continue;
        if (diag(p.map((v, i) => M[i][v])) === null) { issue = 'order'; break; }
      }
    }
    if (issue && issue !== 'order') { // right shape, wrong place/size? refit drawn bbox onto expected bbox
      const eb = bbox(groups.map((a, i) => pairs[i].e)), db = bbox(main);
      const sx = db.w > 6 ? eb.w / db.w : 1, sy = db.h > 6 ? eb.h / db.h : 1;
      const fitted = main.map(s => s.map(p => [eb.x0 + (p[0] - db.x0) * sx, eb.y0 + (p[1] - db.y0) * sy]));
      const fitSt = fitted.map((d, i) => stat(d, pairs[i].e));
      if (diag(fitSt) === null) {
        const ratio = db.h > 6 ? db.h / eb.h : (db.w / Math.max(1, eb.w));
        if (Math.abs(ratio - 1) > 0.28) issue = ratio > 1 ? 'size+' : 'size-';
        else if (Math.abs(db.y0 - eb.y0) > 18 * T) { issue = 'line'; extra.floating = db.y0 > eb.y0; }
      }
    }
    if (issue === 'stroke-count') issue = null; // (not produced above; safety)
    const mean = pairs.reduce((s, st) => s + shapeErr(st), 0) / pairs.length;
    const score = sc(mean);

    // fewer strokes drawn than expected and the strokes so far are fine -> just unfinished
    if (issue && k < n) {
      const pre = main.map((d, i) => stat(d, expMain[i]));
      if (diag(pre) === null) return R('stroke-count', MSG.fewer, 0.3, { few: true });
    }
    if (issue) {
      let out;
      switch (issue) {
        case 'circle': return R('direction', MSG.circle, score, { circle: true });
        case 'direction': return R('direction', MSG.direction, score);
        case 'start': return R('start', MSG.start, score);
        case 'order': return R('order', MSG.order, score);
        case 'shape': return R('shape', MSG.shape, score);
        case 'size+': return R('size', MSG.tooBig, score);
        case 'size-': return R('size', MSG.tooSmall, score);
        case 'line': return R('line', (g.strokes.some(s => s.some(p => p[1] < -10)) ? MSG.lineDesc : MSG.line), score, extra);
      }
    }
    // ---- raw fit is good: final baseline + size check on the whole letter
    {
      const eb = bbox(expMain), db = bbox(main);
      if (Math.abs(db.y0 - eb.y0) > 18 * T) return R('line', g.strokes.some(s => s.some(p => p[1] < -10)) ? MSG.lineDesc : MSG.line, score);
      if (eb.h > 20) {
        const ratio = db.h / eb.h;
        if (ratio > 1.32) return R('size', MSG.tooBig, score);
        if (ratio < 0.7) return R('size', MSG.tooSmall, score);
      }
    }
    // ---- dot (i, j)
    if (expDot) {
      if (!dots.length) return R('stroke-count', MSG.dot, 0.45, { dot: true, few: true });
      const dd = Math.min.apply(null, dots.map(d => { const b = bbox([d]); return dist([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2], expDot[0]); }));
      if (dd > 42 * T) return R('shape', MSG.dotPlace, score);
    }
    return R(null, '', Math.max(score, 0.5));
  }

  /* =====================================================================================================
     3. PAD
     ===================================================================================================== */
  const INK = '#1d3a8a', GREEN = '#1f9d55';
  const say = t => { try { if (G.say) G.say(t); } catch (e) { } };
  const sfx = n => { try { if (G.sfx) G.sfx(n); } catch (e) { } };
  const rrect = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };

  function mount(container, opts) {
    opts = Object.assign({ text: 'a', mode: 'trace', tolerance: 1, leftHanded: false }, opts || {});
    const chars = Array.from(String(opts.text));
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'display:block;width:100%;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;border-radius:18px;background:#fffdf5;box-shadow:0 2px 8px rgba(0,0,0,.18);cursor:crosshair';
    container.appendChild(cvs);
    const c = cvs.getContext('2d');
    let W = 900, H = 380, dpr = 1, destroyed = false, raf = 0;

    // items: one per character
    const items = chars.map(ch => (ch === ' ' || !GL[ch]) ? { ch: ' ', w: 36, space: true } : { ch, w: GL[ch].w, g: GL[ch] });
    let TW = 0; items.forEach((it, i) => { it.ox = TW; TW += it.w + (i < items.length - 1 ? 8 : 0); });
    const letterIdx = items.map((it, i) => it.space ? -1 : i).filter(i => i >= 0);
    let cur = letterIdx.length ? letterIdx[0] : -1;

    const S = { s: 2, x0: 0, base: 0 };
    const X = wx => S.x0 + wx * S.s, Y = wy => S.base - wy * S.s;
    function layout() {
      W = container.clientWidth || 900;
      H = container.clientHeight >= 200 ? container.clientHeight : 380;
      dpr = root.devicePixelRatio || 1;
      cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr); cvs.style.height = H + 'px';
      const top = 74;
      S.s = Math.max(0.6, Math.min(2.2, (W - 110) / Math.max(1, TW), (H - top - 12) / 140));
      S.x0 = (W - TW * S.s) / 2; S.base = top + 100 * S.s;
    }
    layout();

    // state
    let ink = [], doneInk = [], fading = [], parts = [], bubble = null, demoS = null;
    let active = null, curStroke = null, penSeen = false, idleT = null, fails = 0, showModel = false, finished = false, startT = performance.now();
    const results = [];
    let forced = false;

    const btnW = { clear: 104, show: 128 }, btnH = 56;
    function btnRect(which) {
      const y = 8, gap = 10;
      if (opts.leftHanded) return which === 'clear' ? { x: 12, y, w: btnW.clear, h: btnH } : { x: 12 + btnW.clear + gap, y, w: btnW.show, h: btnH };
      return which === 'show' ? { x: W - 12 - btnW.show, y, w: btnW.show, h: btnH } : { x: W - 12 - btnW.show - gap - btnW.clear, y, w: btnW.clear, h: btnH };
    }
    const inR = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

    const effMode = () => (opts.mode === 'memory' && fails >= 2) ? 'fade' : opts.mode;

    function coach(msg) {
      bubble = { text: msg, t0: performance.now() };
      say(msg);
      try { if (opts.onCoach) opts.onCoach(msg); } catch (e) { }
    }

    /* ---------- drawing ---------- */
    function polyPath(pts, fx, fy) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(fx(p[0]), fy(p[1])) : c.moveTo(fx(p[0]), fy(p[1]))); }
    function drawPaper() {
      c.fillStyle = '#fffdf5'; rrect(c, 0, 0, W, H, 18); c.fill();
      const x1 = 14, x2 = W - 14;
      // current slot highlight
      if (cur >= 0 && !finished) {
        const it = items[cur];
        c.fillStyle = 'rgba(255,224,102,.22)'; rrect(c, X(it.ox) - 4, Y(100) - 6, it.w * S.s + 8, 146 * S.s + 12, 12); c.fill();
      }
      c.lineCap = 'butt';
      c.strokeStyle = '#bcd8f0'; c.lineWidth = 2; c.setLineDash([]);
      for (const y of [100, -40]) { c.beginPath(); c.moveTo(x1, Y(y)); c.lineTo(x2, Y(y)); c.stroke(); }
      c.setLineDash([9, 8]); c.strokeStyle = '#c9def2'; c.beginPath(); c.moveTo(x1, Y(50)); c.lineTo(x2, Y(50)); c.stroke(); c.setLineDash([]);
      c.strokeStyle = '#f0627e'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(x1, Y(0)); c.lineTo(x2, Y(0)); c.stroke();
      // finger spaces: a little finger-tip oval in each gap between words
      for (const it of items) if (it.space) {
        const cx = X(it.ox + it.w / 2), cy = Y(-16);
        c.fillStyle = 'rgba(240,180,150,.55)'; c.beginPath(); c.ellipse(cx, cy, 7 * S.s, 11 * S.s, 0, 0, 6.3); c.fill();
        c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(cx, cy - 4 * S.s, 4 * S.s, 4 * S.s, 0, 0, 6.3); c.fill();
      }
    }
    function drawGuides(t) {
      const em = effMode();
      items.forEach((it, i) => {
        if (it.space || i < cur || cur < 0 || finished) return;
        const isCur = i === cur;
        let alpha;
        if (em === 'trace') alpha = isCur ? 0.6 : 0.3;
        else if (em === 'fade') alpha = isCur ? 0.15 : 0;
        else alpha = 0;
        if (!alpha) return;
        c.save(); c.globalAlpha = alpha; c.strokeStyle = '#7d8aa3'; c.fillStyle = '#7d8aa3'; c.lineCap = 'round'; c.lineJoin = 'round';
        c.lineWidth = Math.max(6, 5 * S.s); c.setLineDash([0.1, Math.max(10, 7 * S.s)]);
        it.g.strokes.forEach(st => {
          if (st.length === 1) { c.setLineDash([]); c.lineWidth = 3; c.beginPath(); c.arc(X(it.ox + st[0][0]), Y(st[0][1]), 8, 0, 6.3); c.stroke(); c.setLineDash([0.1, Math.max(10, 7 * S.s)]); c.lineWidth = Math.max(6, 5 * S.s); return; }
          polyPath(st, px => X(it.ox + px), py => Y(py)); c.stroke();
        });
        c.restore();
      });
      // start dots for the current letter
      if (cur >= 0 && !finished && em !== 'memory') {
        const it = items[cur], n = it.g.strokes.length, pulse = 1 + 0.18 * Math.sin(t / 220);
        it.g.strokes.forEach((st, si) => {
          if (si < ink.length) return;
          const px = X(it.ox + st[0][0]), py = Y(st[0][1]);
          let dx = 0, dy = 0;
          for (let q = 1; q < st.length; q++) { const ex = X(it.ox + st[q][0]) - px, ey = Y(st[q][1]) - py; if (Math.hypot(ex, ey) > 10) { const m = Math.hypot(ex, ey); dx = ex / m; dy = ey / m; break; } }
          c.save();
          if (dx || dy) { // arrow ahead of the dot
            const ax = px + dx * 30, ay = py + dy * 30, ang = Math.atan2(dy, dx);
            c.translate(ax, ay); c.rotate(ang); c.fillStyle = '#16a34a'; c.beginPath(); c.moveTo(9, 0); c.lineTo(-6, -8); c.lineTo(-6, 8); c.closePath(); c.fill(); c.rotate(-ang); c.translate(-ax, -ay);
          }
          c.fillStyle = 'rgba(46,204,113,.35)'; c.beginPath(); c.arc(px, py, 20 * pulse, 0, 6.3); c.fill();
          c.fillStyle = '#22c55e'; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(px, py, 12 * pulse, 0, 6.3); c.fill(); c.stroke();
          if (n > 1) { c.fillStyle = '#fff'; c.font = 'bold 15px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(si + 1), px, py + 1); }
          c.restore();
        });
      }
    }
    function drawInk(strokes, col, alpha) {
      c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.globalAlpha = alpha;
      for (const st of strokes) {
        const p = st.pts, n = p.length;
        if (n < 2) { const q = p[0]; c.beginPath(); c.arc(X(q.x), Y(q.y), q.w * 0.75, 0, 6.3); c.fill(); continue; }
        for (let i = 1; i < n; i++) {
          const a = i === 1 ? p[0] : mid(p[i - 1], p[i]), b = i === n - 1 ? p[n - 1] : mid(p[i], p[i + 1]);
          c.beginPath(); c.moveTo(X(a.x), Y(a.y)); c.quadraticCurveTo(X(p[i].x), Y(p[i].y), X(b.x), Y(b.y)); c.lineWidth = p[i].w; c.stroke();
        }
      }
      c.restore();
    }
    const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

    function burst(wx, wy) {
      for (let i = 0; i < 16; i++) {
        const a = Math.random() * 6.3, v = 80 + Math.random() * 180;
        parts.push({ x: X(wx), y: Y(wy), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: 0.9 + Math.random() * 0.4, age: 0, col: ['#ffc93c', '#ff7eb6', '#4ade80', '#60a5fa'][i % 4], size: 14 + Math.random() * 14, star: true });
      }
    }
    function drawParts(dt) {
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.age += dt; if (p.age > p.life) { parts.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt;
        c.globalAlpha = 1 - p.age / p.life; c.fillStyle = p.col;
        if (p.star) { c.font = p.size + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('★', p.x, p.y); }
        else { c.beginPath(); c.arc(p.x, p.y, p.size, 0, 6.3); c.fill(); }
        c.globalAlpha = 1;
      }
    }

    /* ---------- demo ---------- */
    function demo() {
      if (destroyed || finished || cur < 0) return;
      const it = items[cur]; let t = 0; const segs = [];
      it.g.strokes.forEach(st => {
        const dur = st.length === 1 ? 350 : 700;
        segs.push({ pts: st.length === 1 ? [st[0], st[0]] : resample(st, 60), start: t, dur, dot: st.length === 1 });
        t += dur + 280;
      });
      demoS = { t0: performance.now(), segs, end: t, ox: it.ox };
    }
    function drawDemo(now, dt) {
      if (!demoS) return;
      const el = now - demoS.t0;
      if (el > demoS.end + 500) { demoS = null; return; }
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#a855f7'; c.fillStyle = '#a855f7'; c.lineWidth = 8; c.globalAlpha = el > demoS.end ? 1 - (el - demoS.end) / 500 : 0.85;
      let pen = null;
      for (const sg of demoS.segs) {
        if (el < sg.start) break;
        let pr = Math.min(1, (el - sg.start) / sg.dur); pr = pr * pr * (3 - 2 * pr);
        const upto = Math.max(1, Math.round(pr * (sg.pts.length - 1)));
        if (sg.dot) { const q = sg.pts[0]; c.beginPath(); c.arc(X(demoS.ox + q[0]), Y(q[1]), 9 * Math.min(1, pr * 2), 0, 6.3); c.fill(); pen = [q[0], q[1]]; continue; }
        c.beginPath();
        for (let i = 0; i <= upto; i++) { const q = sg.pts[i]; i ? c.lineTo(X(demoS.ox + q[0]), Y(q[1])) : c.moveTo(X(demoS.ox + q[0]), Y(q[1])); }
        c.stroke(); pen = sg.pts[upto];
      }
      c.restore();
      if (pen) {
        const px = X(demoS.ox + pen[0]), py = Y(pen[1]);
        if (el < demoS.end) for (let i = 0; i < 2; i++) parts.push({ x: px + (Math.random() - .5) * 10, y: py + (Math.random() - .5) * 10, vx: (Math.random() - .5) * 60, vy: (Math.random() - .5) * 60 + 20, life: .55, age: 0, col: ['#fde047', '#f0abfc', '#93c5fd'][Math.floor(Math.random() * 3)], size: 3 + Math.random() * 3 });
        c.save(); c.fillStyle = '#fff'; c.strokeStyle = '#a855f7'; c.lineWidth = 3; c.beginPath(); c.arc(px, py, 19, 0, 6.3); c.fill(); c.stroke();
        c.font = '22px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('✏️', px, py + 1); c.restore();
      }
    }

    function drawBubble(now) {
      if (!bubble) return;
      const age = now - bubble.t0; if (age > 5200) { bubble = null; return; }
      const a = age > 4600 ? 1 - (age - 4600) / 600 : Math.min(1, age / 150);
      c.save(); c.globalAlpha = a;
      let fs = 24; c.font = 'bold ' + fs + 'px system-ui,sans-serif';
      const maxW = W - 2 * (btnW.clear + btnW.show + 40) + 40;
      while (c.measureText(bubble.text).width > Math.max(220, maxW) && fs > 14) { fs -= 2; c.font = 'bold ' + fs + 'px system-ui,sans-serif'; }
      const tw = c.measureText(bubble.text).width, bw = tw + 36, bh = 44, bx = (W - bw) / 2, by = 12;
      c.fillStyle = '#fff3c4'; c.strokeStyle = '#f0b429'; c.lineWidth = 3; rrect(c, bx, by, bw, bh, 22); c.fill(); c.stroke();
      c.fillStyle = '#5a3b00'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(bubble.text, W / 2, by + bh / 2 + 1);
      c.restore();
    }
    function drawButtons() {
      for (const [k, label] of [['clear', '↺ clear'], ['show', '▶ show me']]) {
        const r = btnRect(k);
        c.fillStyle = '#e6f0ff'; c.strokeStyle = '#7fa8e8'; c.lineWidth = 3; rrect(c, r.x, r.y, r.w, r.h, 16); c.fill(); c.stroke();
        c.fillStyle = '#1d4ed8'; c.font = 'bold 20px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 1);
      }
    }
    function drawModel() {
      if (!showModel || cur < 0 || finished) return;
      const it = items[cur], ms = 0.5, w = it.w * ms, bx = opts.leftHanded ? W - 16 - w - 8 : 16, base = 64;
      c.save(); c.fillStyle = 'rgba(255,255,255,.9)'; c.strokeStyle = '#d6c6f5'; c.lineWidth = 2; rrect(c, bx - 8, 6, w + 16, 74, 10); c.fill(); c.stroke();
      c.strokeStyle = '#7a4ad0'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
      it.g.strokes.forEach((st, i) => {
        if (st.length === 1) { c.beginPath(); c.arc(bx + st[0][0] * ms, base - st[0][1] * ms, 2.5, 0, 6.3); c.fillStyle = '#7a4ad0'; c.fill(); return; }
        polyPath(st, px => bx + px * ms, py => base - py * ms); c.stroke();
        c.fillStyle = '#22c55e'; c.beginPath(); c.arc(bx + st[0][0] * ms, base - st[0][1] * ms, 4, 0, 6.3); c.fill();
      });
      c.restore();
    }

    let lastT = performance.now();
    function frame(now) {
      if (destroyed) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      drawPaper();
      drawGuides(now);
      for (const d of doneInk) drawInk(d.strokes, GREEN, 1);
      for (let i = fading.length - 1; i >= 0; i--) {
        const f = fading[i], age = now - f.t0, a = age < 600 ? 1 : 1 - (age - 600) / 400;
        if (a <= 0) { fading.splice(i, 1); continue; }
        drawInk(f.strokes, INK, a);
      }
      drawInk(ink, INK, 1);
      if (curStroke) drawInk([curStroke], INK, 1);
      drawModel();
      drawDemo(now, dt);
      drawParts(dt);
      drawBubble(now);
      drawButtons();
    }

    /* ---------- input ---------- */
    function local(e) { const r = cvs.getBoundingClientRect(); return { x: (e.clientX - r.left) * (W / (r.width || W)), y: (e.clientY - r.top) * (H / (r.height || H)) }; }
    function mkPt(e, pos) {
      const pen = e.pointerType === 'pen', pr = pen ? (e.pressure > 0 ? e.pressure : 0.5) : 0.5;
      return { x: (pos.x - S.x0) / S.s, y: (S.base - pos.y) / S.s, p: pr, w: pen ? 2.5 + 9 * pr : 7.5 };
    }
    cvs.addEventListener('contextmenu', e => e.preventDefault());
    cvs.addEventListener('pointerdown', e => {
      if (destroyed) return;
      if (e.pointerType === 'pen') penSeen = true;
      if (e.pointerType === 'touch' && penSeen) return;        // palm rejection
      e.preventDefault();
      const pos = local(e);
      if (inR(pos, btnRect('clear'))) { clear(); return; }
      if (inR(pos, btnRect('show'))) { demo(); return; }
      if (active !== null || finished || cur < 0) return;
      demoS = null; clearTimeout(idleT);
      try { cvs.setPointerCapture(e.pointerId); } catch (_) { }
      active = e.pointerId;
      curStroke = { pts: [mkPt(e, pos)], pen: e.pointerType === 'pen' };
    });
    cvs.addEventListener('pointermove', e => {
      if (e.pointerId !== active || !curStroke) return;
      e.preventDefault();
      const evs = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
      for (const ev of evs) {
        const q = mkPt(ev, local(ev)), l = curStroke.pts[curStroke.pts.length - 1];
        if (Math.hypot(q.x - l.x, q.y - l.y) * S.s < 1.5) continue;
        q.w = l.w * 0.6 + q.w * 0.4; // smooth width
        curStroke.pts.push(q);
      }
    });
    function up(e) {
      if (e.pointerId !== active) return;
      active = null;
      if (curStroke) { ink.push(curStroke); curStroke = null; }
      const expected = items[cur] ? items[cur].g.strokes.length : 1;
      clearTimeout(idleT);
      if (ink.length >= expected) idleT = setTimeout(() => evaluate(true), 40);
      else idleT = setTimeout(() => evaluate(false), 700);
    }
    cvs.addEventListener('pointerup', up);
    cvs.addEventListener('pointercancel', up);

    /* ---------- judging ---------- */
    function evaluate(late) {
      if (destroyed || finished || cur < 0 || !ink.length) return;
      const it = items[cur];
      const res = analyse(it.ch, ink.map(s => s.pts), { x: it.ox, y: 0, s: 1, flipY: false }, opts.tolerance);
      if (res.ok) return success(res);
      if (!late && res.issue === 'stroke-count' && res.few) { idleT = setTimeout(() => evaluate(true), 1300); return; }
      fail(res);
    }
    function success(res, forcedAccept) {
      const it = items[cur];
      doneInk.push({ strokes: ink });
      ink = []; fails = 0; showModel = false;
      burst(it.ox + it.w / 2, 50);
      sfx(forcedAccept ? 'pop' : 'right');
      results.push({ ch: it.ch, score: forcedAccept ? Math.min(res.score, 0.3) : res.score, issue: forcedAccept ? (res.issue || 'gave-up') : null });
      if (forcedAccept) forced = true;
      /* say the sound of the letter just written; a whole word is blended at the end (#12) */
      const sounds = opts.sounds !== false && G.S && G.S.settings.letterSounds !== false, text = String(opts.text || ''), oneWord = !/\s/.test(text);
      if (sounds && oneWord) say(HW.soundOf(it.ch));
      const k = letterIdx.indexOf(cur);
      if (k + 1 < letterIdx.length) { cur = letterIdx[k + 1]; if (opts.mode === 'trace' && items.length > 1) { /* gentle: no auto demo for later letters */ } }
      else {
        cur = -1; finished = true;
        const score = results.reduce((s, r) => s + r.score, 0) / Math.max(1, results.length);
        const blend = sounds && oneWord && /^[a-z]{2,}$/.test(text);
        if (blend) setTimeout(() => { if (!destroyed) say(text); }, 650);
        setTimeout(() => { if (destroyed) return; try { if (opts.onResult) opts.onResult({ ok: !forced && score >= 0.5, score, perChar: results.slice() }); } catch (e) { } }, blend ? 1700 : sounds && oneWord ? 1000 : 700);
      }
    }
    function fail(res) {
      fails++;
      fading.push({ strokes: ink, t0: performance.now() });
      ink = [];
      showModel = true;
      if (fails >= 4) { sfx('pop'); return success(res, true); }
      sfx('wrong');
      coach(res.msg || MSG.shape);
      if (fails === 3) setTimeout(() => { if (!destroyed && !finished && fails >= 3) demo(); }, 1800);
    }
    function clear() {
      clearTimeout(idleT); ink = []; curStroke = null; active = null;
    }

    /* ---------- lifecycle ---------- */
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(() => { if (!destroyed) layout(); }); ro.observe(container); }
    const onWin = () => { if (!destroyed) layout(); };
    root.addEventListener('resize', onWin);
    raf = requestAnimationFrame(frame);
    let demoTimer = null;
    if (opts.mode === 'trace') demoTimer = setTimeout(() => { if (!destroyed && !ink.length && active === null) demo(); }, 450);

    function destroy() {
      destroyed = true; cancelAnimationFrame(raf); clearTimeout(idleT); clearTimeout(demoTimer);
      if (ro) ro.disconnect(); root.removeEventListener('resize', onWin);
      if (cvs.parentNode) cvs.parentNode.removeChild(cvs);
    }
    return {
      destroy, clear, demo, canvas: cvs,
      layout: () => ({ x0: S.x0, base: S.base, s: S.s, W, H, current: cur, slots: items.map(it => ({ ch: it.ch, ox: it.ox, w: it.w })) }),
    };
  }

  const HW = { GLYPHS: GL, mount, analyse, resample };
  /* what the voice says for a letter just written: the phonics sound for a–z (say-as spellings for the en-GB voice),
     "capital A" for capitals, the number name for digits, nothing for punctuation */
  const SOUND = { a: 'a', b: 'buh', c: 'kuh', d: 'duh', e: 'eh', f: 'fff', g: 'guh', h: 'huh', i: 'ih', j: 'juh', k: 'kuh', l: 'lll', m: 'mmm', n: 'nnn', o: 'o', p: 'puh', q: 'kwuh', r: 'rrr', s: 'sss', t: 'tuh', u: 'uh', v: 'vvv', w: 'wuh', x: 'ks', y: 'yuh', z: 'zzz' };
  const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  HW.SOUND = SOUND;
  HW.soundOf = ch => SOUND[ch] || (/[A-Z]/.test(ch) ? 'capital ' + ch : /[0-9]/.test(ch) ? NUM[+ch] : '');
  G.HW = HW;
  if (typeof module !== 'undefined' && module.exports) module.exports = HW;
})();

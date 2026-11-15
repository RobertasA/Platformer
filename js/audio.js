/* Hazelnut Hollow — audio: synthesised sound effects, gentle generative music, read-aloud speech */
(function () {
  'use strict';
  const G = window.G;
  let ac = null, master = null, musicGain = null;
  const ctx = () => {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ac = new AC(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
      musicGain = ac.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  };
  G.audioUnlock = () => { ctx(); };

  function tone(f, dur, type = 'sine', vol = 0.3, when = 0, slide = 0, out) {
    const a = ctx(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + when;
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(out || master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(dur, vol = 0.2, when = 0, freq = 1200) {
    const a = ctx(); if (!a) return;
    const n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq; s.buffer = buf; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(master); s.start(a.currentTime + when);
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12); // midi note -> Hz
  G.note = (midi, dur = 0.5, type = 'triangle', vol = 0.3) => tone(N(midi), dur, type, vol);
  G.drum = k => { if (k === 0) tone(120, 0.25, 'sine', 0.6, 0, -80); else if (k === 1) noise(0.12, 0.35, 0, 2500); else noise(0.05, 0.25, 0, 6000); };

  const SFX = {
    jump: () => tone(380, 0.16, 'sine', 0.2, 0, 300),
    jump2: () => tone(520, 0.16, 'sine', 0.2, 0, 380),
    land: () => noise(0.05, 0.08, 0, 400),
    coin: () => { tone(N(88), 0.08, 'square', 0.1); tone(N(93), 0.2, 'square', 0.1, 0.07); },
    gem: () => [76, 80, 83, 88].forEach((n, i) => tone(N(n), 0.3, 'triangle', 0.25, i * 0.08)),
    right: () => [72, 76, 79, 84].forEach((n, i) => tone(N(n), 0.22, 'triangle', 0.28, i * 0.09)),
    wrong: () => { tone(220, 0.18, 'sine', 0.2, 0, -40); tone(196, 0.25, 'sine', 0.2, 0.15, -40); },
    pop: () => tone(700, 0.08, 'sine', 0.25, 0, 500),
    tap: () => tone(520, 0.05, 'sine', 0.15),
    talk: () => tone(U.irnd(380, 520), 0.07, 'triangle', 0.12),
    door: () => { tone(200, 0.2, 'triangle', 0.25, 0, 100); tone(300, 0.3, 'triangle', 0.2, 0.15, 150); },
    unlock: () => [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => tone(N(n), 0.4, 'triangle', 0.25, i * 0.1)),
    bounce: () => tone(200, 0.3, 'sine', 0.3, 0, 500),
    creak: () => { tone(160, 0.5, 'sawtooth', 0.12, 0, 120); tone(310, 0.4, 'sawtooth', 0.06, 0.1, -100); },
    splash: () => noise(0.4, 0.3, 0, 900),
    magic: () => { for (let i = 0; i < 8; i++) tone(N(72 + U.irnd(0, 24)), 0.25, 'sine', 0.15, i * 0.05); },
    fanfare: () => [67, 67, 67, 72, 76, 72, 76, 79, 84].forEach((n, i) => tone(N(n), 0.3, 'square', 0.12, i * 0.14)),
    squeak: () => tone(900, 0.2, 'sine', 0.25, 0, 600),
    snore: () => tone(90, 0.8, 'sawtooth', 0.08, 0, 30),
    buzz: () => tone(180, 0.3, 'sawtooth', 0.1, 0, 20),
    meow: () => tone(700, 0.4, 'triangle', 0.2, 0, -250),
    heart: () => { tone(80, 0.12, 'sine', 0.5); tone(70, 0.14, 'sine', 0.4, 0.18); },
    bubble: () => { for (let i = 0; i < 5; i++) tone(U.irnd(300, 900), 0.1, 'sine', 0.15, i * 0.07, 300); },
  };
  const U = G.U;
  G.sfx = name => { if (!G.S || !G.S.settings.sfx) return; const f = SFX[name]; if (f) try { f(); } catch (e) { } };

  /* ---------- music: a tiny generative sequencer, one mood per theme ---------- */
  const MOODS = {
    village: { scale: [60, 62, 64, 67, 69, 72, 74, 76], bpm: 104, bass: [48, 53, 55, 48], type: 'triangle' },
    meadow: { scale: [62, 64, 66, 69, 71, 74, 76, 78], bpm: 116, bass: [50, 55, 57, 50], type: 'triangle' },
    woods: { scale: [57, 60, 62, 64, 67, 69, 72, 74], bpm: 92, bass: [45, 41, 43, 45], type: 'sine' },
    house: { scale: [60, 63, 65, 67, 70, 72, 75, 77], bpm: 66, bass: [48, 44, 46, 48], type: 'sine' },
    tower: { scale: [58, 60, 62, 65, 67, 70, 72, 74], bpm: 112, bass: [46, 51, 53, 46], type: 'square' },
    caves: { scale: [57, 59, 60, 64, 65, 69, 71, 72], bpm: 80, bass: [45, 40, 41, 45], type: 'sine' },
    clouds: { scale: [65, 67, 69, 72, 74, 77, 79, 81], bpm: 100, bass: [53, 58, 60, 53], type: 'triangle' },
    play: { scale: [60, 62, 64, 67, 69, 72, 74, 76], bpm: 120, bass: [48, 55, 53, 55], type: 'triangle' },
  };
  let timer = null, step = 0, mood = null, pat = [];
  const newPattern = () => { pat = []; let p = U.irnd(2, 5); for (let i = 0; i < 16; i++) { p = U.clamp(p + U.irnd(-2, 2), 0, 7); pat.push(Math.random() < 0.62 ? p : -1); } };
  /* quieter music while a card, pad or playroom is open (#9) */
  G.duck = on => { try { if (musicGain && ac) musicGain.gain.setTargetAtTime(on ? 0.04 : 0.16, ac.currentTime, 0.25); } catch (e) { } };
  G.music = {
    play(name) {
      if (mood === MOODS[name] && timer) return;
      this.stop(); mood = MOODS[name] || MOODS.village; step = 0; newPattern();
      if (!G.S.settings.music) return;
      timer = setInterval(() => {
        if (!ac || ac.state !== 'running' || document.hidden) return;
        const m = mood, i = step % 16, bar = Math.floor(step / 16);
        if (i === 0 && bar % 2 === 0 && step > 0 && Math.random() < 0.5) newPattern();
        const quiet = mood === MOODS.house ? 0.5 : 1;
        if (pat[i] >= 0) tone(N(m.scale[pat[i]]), 0.5, m.type, (m.type === 'square' ? 0.25 : 0.5) * quiet, 0, 0, musicGain);
        if (i % 4 === 0) tone(N(m.bass[bar % 4]), 0.9, 'sine', 0.6 * quiet, 0, 0, musicGain);
        if (i % 8 === 4) tone(N(m.bass[bar % 4] + 7), 0.6, 'sine', 0.3 * quiet, 0, 0, musicGain);
        step++;
      }, 60000 / mood.bpm / 2);
    },
    stop() { if (timer) clearInterval(timer); timer = null; mood = null; },
    refresh(name) { this.stop(); if (G.S.settings.music) this.play(name); },
  };

  /* ---------- speech: reads questions and stories aloud for early readers ---------- */
  let voice = null;
  const pickVoice = () => {
    if (!window.speechSynthesis) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find(v => /en-GB/i.test(v.lang) && /female|Kate|Serena|Martha|Sonia|Libby|Google UK English Female/i.test(v.name)) || vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  };
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  G.say = (text, force) => {
    if (!window.speechSynthesis || !G.S || (!G.S.settings.speech && !force)) return;
    try {
      speechSynthesis.cancel();
      const clean = String(text).replace(/<[^>]+>/g, ' ').replace(/_+/g, ' blank ').replace(/[^\w\s.,!?'£:;+\-=×÷]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!clean) return;
      const u = new SpeechSynthesisUtterance(clean);
      if (voice) u.voice = voice; u.lang = 'en-GB'; u.rate = 0.92; u.pitch = 1.1;
      speechSynthesis.speak(u);
    } catch (e) { }
  };
  G.hush = () => { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } };
})();

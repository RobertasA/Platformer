// Generates the app icons from the game's own drawing code (SPEC §7.2j).
// Usage: node tools/icons.js http://localhost:PORT/   → writes icons/*.png
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto((process.argv[2] || 'http://localhost:8765/') + '?debug'); await p.waitForTimeout(800);
  const out = await p.evaluate(() => {
    const make = (size, pad) => {
      const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d'), k = size / 512;
      c.scale(k, k);
      const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#7fc8ff'); g.addColorStop(0.7, '#d9f4ff'); c.fillStyle = g; c.fillRect(0, 0, 512, 512);
      G.circ(c, 400, 110, 60, '#fff3a8'); G.circ(c, 400, 110, 44, '#ffd95e');
      c.fillStyle = '#8fd97a'; c.beginPath(); c.ellipse(120, 520, 330, 170, 0, 0, 7); c.fill(); c.fillStyle = '#6cc563'; c.beginPath(); c.ellipse(430, 540, 300, 150, 0, 0, 7); c.fill();
      const s = pad ? 2.3 : 2.9;
      G.drawAvatar(c, G.defaultAvatar(), 236, pad ? 420 : 470, s, { t: 0.4, face: 1, wave: true });
      G.drawGem(c, 'red', pad ? 372 : 404, pad ? 300 : 300, pad ? 34 : 44, 0.3);
      return cv.toDataURL('image/png');
    };
    return { 'icon-512.png': make(512), 'icon-192.png': make(192), 'apple-touch-icon.png': make(180), 'icon-maskable-512.png': make(512, true) };
  });
  fs.mkdirSync('icons', { recursive: true });
  for (const f in out) fs.writeFileSync('icons/' + f, Buffer.from(out[f].split(',')[1], 'base64'));
  console.log('wrote', Object.keys(out).join(', ')); await b.close();
})();

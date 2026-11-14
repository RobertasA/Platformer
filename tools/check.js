// Headless smoke test. Playwright + Chromium are preinstalled in the cloud env.
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const browser = await chromium.launch();
  const sizes = [['tablet', 1180, 820], ['phone', 844, 390]];
  let bad = 0;
  for (const [name, w, h] of sizes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    // game may expose G.debug.* hooks for scripted tours; run if present
    await page.evaluate(() => window.G && G.debug && G.debug.tour && G.debug.tour()).catch(() => { });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `shots/${name}.png` });
    // optional scripted steps: G.debug.steps = [{name, run: () => ...}] — each gets its own screenshot
    const n = await page.evaluate(() => (window.G && G.debug && G.debug.steps || []).length).catch(() => 0);
    for (let i = 0; i < n; i++) {
      const label = await page.evaluate(i => { const s = G.debug.steps[i]; s.run(); return s.name; }, i).catch(e => { errs.push('step ' + i + ': ' + e.message); return 'step' + i; });
      await page.waitForTimeout(550);
      await page.screenshot({ path: `shots/${name}-${i + 1}-${label}.png` });
    }
    if (errs.length) { bad++; console.error(`[${name}] ERRORS:\n  ` + errs.join('\n  ')); } else console.log(`[${name}] ok`);
    await ctx.close();
  }
  await browser.close();
  process.exit(bad ? 1 : 0);
})();

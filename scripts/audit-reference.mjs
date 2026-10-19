import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('scratch/reference', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const observations = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto('https://daily-shallot-076239.framer.app/', { waitUntil: 'domcontentloaded' });
    for (const elapsed of [0, 150, 300, 600, 900, 1400, 2200]) {
      if (elapsed) await page.waitForTimeout(elapsed === 150 ? 150 : elapsed === 300 ? 150 : elapsed === 600 ? 300 : elapsed === 900 ? 300 : elapsed === 1400 ? 500 : 800);
      observations.push({ width, elapsedAfterLoad: elapsed, elements: await page.locator('h1').evaluateAll(elements => elements.map(el => {
        const parents = [];
        for (let p = el; p && parents.length < 8; p = p.parentElement) {
          const s = getComputedStyle(p); parents.push({ tag: p.tagName, opacity: s.opacity, transform: s.transform, clipPath: s.clipPath, overflow: s.overflow });
        }
        return { text: el.textContent, children: el.children.length, parents };
      })) });
      await page.screenshot({ path: `scratch/reference/framer-${width}-${elapsed}.png` });
    }
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: `scratch/reference/framer-${width}-refresh.png` });
    await page.close();
  }
  await fs.writeFile('scratch/reference/observations.json', JSON.stringify(observations, null, 2));
  console.log('Saved desktop/mobile entrance screenshots and DOM transform observations.');
} finally { await browser.close(); }

import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome' });
const evidence = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto('https://daily-shallot-076239.framer.app/');
    await page.waitForTimeout(1500);
    const title = page.getByText('Fund Growth', { exact: true }).first();
    const top = await title.evaluate(el => el.getBoundingClientRect().top + scrollY);
    for (const offset of [-850, -550, -250, 100]) {
      await page.evaluate(y => scrollTo(0, y), top + offset);
      await page.waitForTimeout(450);
      evidence.push({width, offset, state: await title.evaluate(el => {
        const section = el.closest('section');
        return { scroll: scrollY, text: section?.innerText, nodes: [...(section?.querySelectorAll('[data-framer-name]') || [])].map(e => ({name:e.getAttribute('data-framer-name'), opacity:getComputedStyle(e).opacity, transform:getComputedStyle(e).transform, position:getComputedStyle(e).position})).filter(e=>e.transform!=='none'||e.position==='sticky'), videos:section?.querySelectorAll('video').length };
      })});
      await page.screenshot({path:`scratch/phase3/framer-benefits-${width}-${offset}.png`});
    }
    await title.hover();
    await page.screenshot({path:`scratch/phase3/framer-benefits-${width}-hover.png`});
    await page.close();
  }
  await fs.writeFile('scratch/phase3/framer-benefits.json', JSON.stringify(evidence,null,2));
  console.log('Captured desktop/mobile benefit scroll and hover states.');
} finally { await browser.close(); }

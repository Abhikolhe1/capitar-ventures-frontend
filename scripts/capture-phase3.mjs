import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome' });
const observations = [];
try {
  for (const width of [1440,1280,1024,768,430,390,375]) {
    const page = await browser.newPage({ viewport: { width, height: 950 }, reducedMotion: 'reduce' });
    if (process.env.CAPITAR_CAPTURE_FALLBACK === 'true') await page.route('**/api/**', route => route.abort());
    await page.goto('http://127.0.0.1:3039');
    const section = page.locator('#capital-efficiency');
    await section.waitFor();
    await page.evaluate(() => document.fonts.ready);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await section.locator('img').evaluateAll(els => Promise.all(els.map(el => el.decode().catch(() => {}))));
    observations.push({ width, state: await section.evaluate(el => ({
      rect: el.getBoundingClientRect().toJSON(), overflow: document.documentElement.scrollWidth > innerWidth,
      cards: [...el.querySelectorAll('article')].map(e => ({title: e.querySelector('h3')?.textContent, rect:e.getBoundingClientRect().toJSON()})),
      images: [...el.querySelectorAll('img')].map(e=>({src:e.getAttribute('src'),complete:e.complete,width:e.naturalWidth})),
    }))});
    await section.screenshot({path:`scratch/phase3/implementation-${width}.png`});
    await page.close();
  }
  await fs.writeFile('scratch/phase3/implementation.json',JSON.stringify(observations,null,2));
  console.log('Captured seven responsive section screenshots and layout/media observations.');
} finally { await browser.close(); }

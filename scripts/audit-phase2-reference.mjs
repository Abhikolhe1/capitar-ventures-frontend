import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const dir = 'scratch/phase2';
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const observations = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto('https://daily-shallot-076239.framer.app/');
    await page.waitForTimeout(2400);
    const read = () => page.locator('section[data-framer-name="About"]').evaluate(section => ({
      scroll: window.scrollY,
      section: section.getBoundingClientRect().toJSON(),
      metrics: [...section.querySelectorAll('[data-framer-name="Content"] [data-border="true"]')].filter(el => el.getBoundingClientRect().width).map(el => ({
        text: el.innerText, opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform,
        box: el.getBoundingClientRect().toJSON(),
        children: [...el.querySelectorAll('p')].map(p => ({ text: p.textContent, opacity: getComputedStyle(p).opacity, transform: getComputedStyle(p).transform })),
      })),
      links: [...section.querySelectorAll('a')].map(a => ({ text: a.innerText, href: a.getAttribute('href') })),
      sticky: [...section.querySelectorAll('*')].filter(el => ['sticky', 'fixed'].includes(getComputedStyle(el).position)).map(el => ({ tag: el.tagName, text: el.textContent?.slice(0,80) })),
    }));
    const initialTop = await page.locator('section[data-framer-name="About"]').evaluate(e => e.getBoundingClientRect().top + window.scrollY);
    await page.evaluate(y => window.scrollTo(0, Math.max(0, y - innerHeight)), initialTop);
    observations.push({ width, stage: 'before', state: await read() });
    await page.screenshot({ path: `${dir}/framer-${width}-before.png` });
    await page.mouse.wheel(0, 80);
    await page.waitForTimeout(80);
    observations.push({ width, stage: 'enter', state: await read() });
    await page.screenshot({ path: `${dir}/framer-${width}-enter.png` });
    await page.mouse.wheel(0, 380);
    for (const [stage, delay] of [['partial', 150], ['middle', 400], ['complete', 1800]]) {
      await page.waitForTimeout(delay);
      observations.push({ width, stage, state: await read() });
      await page.screenshot({ path: `${dir}/framer-${width}-${stage}.png` });
    }
    const metric = page.locator('section[data-framer-name="About"] [data-framer-name="Content"] [data-border="true"]').first();
    await metric.hover();
    observations.push({ width, stage: 'hover', state: await read() });
    await page.screenshot({ path: `${dir}/framer-${width}-hover.png` });
    await metric.click();
    observations.push({ width, stage: 'click', url: page.url(), state: await read() });
    for (let index = 0; index < 8; index++) { await page.mouse.wheel(0, 600); await page.waitForTimeout(160); }
    await page.screenshot({ path: `${dir}/framer-${width}-page-bottom.png` });
    await page.mouse.wheel(0, -12000);
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, 460);
    await page.waitForTimeout(300);
    observations.push({ width, stage: 'reentry', state: await read() });
    await page.close();
  }
  await fs.writeFile(`${dir}/framer-observations.json`, JSON.stringify(observations, null, 2));
  console.log('Saved complete-page scroll inspection, counter stages, hover/click and desktop/mobile evidence.');
} finally { await browser.close(); }

import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch({channel:'chrome'});
const evidence = [];
try {
  for (const [width, motion] of [[1440,'no-preference'],[390,'no-preference'],[390,'reduce']]) {
    const page = await browser.newPage({viewport:{width,height:900},reducedMotion:motion});
    await page.goto('http://127.0.0.1:3039');
    await page.locator('main[aria-busy="false"]').waitFor();
    const card = page.locator('#capital-efficiency article').first();
    const read = () => card.evaluate(el=>({opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform,rect:el.getBoundingClientRect().toJSON()}));
    evidence.push({width,motion,stage:'before',state:await read()});
    const top = await card.evaluate(el=>el.getBoundingClientRect().top+scrollY);
    await page.evaluate(y=>scrollTo(0,y-450),top);
    await page.waitForTimeout(100);
    evidence.push({width,motion,stage:'partial',state:await read()});
    await page.screenshot({path:`scratch/phase3/motion-${width}-${motion}-partial.png`});
    await page.waitForTimeout(1100);
    evidence.push({width,motion,stage:'complete',state:await read()});
    await page.screenshot({path:`scratch/phase3/motion-${width}-${motion}-complete.png`});
    await page.evaluate(()=>scrollTo(0,0));
    await page.waitForTimeout(120);
    await page.evaluate(y=>scrollTo(0,y-450),top);
    evidence.push({width,motion,stage:'reentry',state:await read()});
    await page.close();
  }
  await fs.writeFile('scratch/phase3/motion.json',JSON.stringify(evidence,null,2));
  console.log('Captured partial/completed/reentry motion on desktop/mobile and reduced motion.');
} finally { await browser.close(); }

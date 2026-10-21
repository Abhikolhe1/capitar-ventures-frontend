import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('scratch/phase4',{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try {
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:3039/');
  await page.locator('main[aria-busy="false"]').waitFor();
  await page.waitForTimeout(1500);
  for(const section of await page.locator('main section').all()) {
    await section.scrollIntoViewIfNeeded();
    await section.locator('img').evaluateAll(es=>Promise.all(es.map(e=>e.decode().catch(()=>{}))));
  }
  await page.screenshot({path:'scratch/phase4/baseline-1440.png',fullPage:true});
  await fs.writeFile('scratch/phase4/baseline.json',JSON.stringify({errors,sections:await page.locator('main section').evaluateAll(es=>es.map(e=>({id:e.id,rect:e.getBoundingClientRect().toJSON()})))},null,2));
  await page.close();
  const observations=[];
  for(const width of [1440,390]) {
    const reference=await browser.newPage({viewport:{width,height:900}});
    await reference.goto('https://daily-shallot-076239.framer.app/');
    await reference.waitForTimeout(1400);
    observations.push({width,stage:'inventory',sections:await reference.locator('section').evaluateAll(es=>es.map(e=>({name:e.getAttribute('data-framer-name'),text:e.innerText,top:e.getBoundingClientRect().top+scrollY,height:e.getBoundingClientRect().height})))});
    await fs.writeFile('scratch/phase4/framer-inventory.json',JSON.stringify(observations,null,2));
    await reference.close();
  }
} finally { await browser.close(); }

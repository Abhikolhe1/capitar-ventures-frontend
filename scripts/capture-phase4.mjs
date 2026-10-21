import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'}),evidence=[];
try {
 for(const width of [1440,1280,1024,768,430,390,375]) {
  const page=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'});
  if(process.env.CAPITAR_CAPTURE_FALLBACK==='true') await page.route('**/api/**',route=>route.abort());
  await page.goto('http://localhost:3039');
  await page.locator('main[aria-busy="false"]').waitFor();
  const section=page.locator('#capitar-difference');
  try { await section.waitFor({timeout:10000}); } catch(error) {
   await fs.writeFile('scratch/phase4/capture-error.txt',await page.locator('body').innerText());
   console.log(await page.locator('main').innerText());
   throw error;
  }
  await section.scrollIntoViewIfNeeded();
  await page.evaluate(()=>document.fonts.ready);
  await section.locator('img').evaluateAll(es=>Promise.all(es.map(e=>e.decode().catch(()=>{}))));
  await section.screenshot({path:`scratch/phase4/implementation-${width}.png`});
  evidence.push({width,state:await section.evaluate(s=>({rect:s.getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth,cards:[...s.querySelectorAll('article')].map(e=>({rect:e.getBoundingClientRect().toJSON(),title:e.querySelector('h3').textContent})),images:[...s.querySelectorAll('img')].map(e=>({src:e.src,complete:e.complete,naturalWidth:e.naturalWidth,rect:e.getBoundingClientRect().toJSON()}))}))});
  await page.close();
 }
 await fs.writeFile('scratch/phase4/implementation.json',JSON.stringify(evidence,null,2));
 console.log('Captured seven responsive section layouts.');
} finally {await browser.close();}

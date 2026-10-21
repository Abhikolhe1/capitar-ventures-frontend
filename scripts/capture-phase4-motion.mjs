import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../../capitar-ventures-backend/package.json',import.meta.url));
const sharp=require('sharp');
const browser=await chromium.launch({channel:'chrome'}),evidence=[];
try {
 for(const [width,motion] of [[1440,'no-preference'],[390,'no-preference'],[390,'reduce']]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:motion});
  await page.goto('http://localhost:3039');
  await page.locator('main[aria-busy="false"]').waitFor();
  const section=page.locator('#capitar-difference');
  const top=await section.evaluate(e=>e.getBoundingClientRect().top+scrollY);
  const read=()=>section.evaluate(s=>({scroll:scrollY,intro:s.querySelector('[data-difference-intro]').getBoundingClientRect().toJSON(),nodes:[...s.querySelectorAll('[data-difference-heading],[data-difference-title],[data-difference-description]')].map(e=>({text:e.textContent,opacity:getComputedStyle(e).opacity,filter:getComputedStyle(e).filter,transform:getComputedStyle(e).transform,rect:e.getBoundingClientRect().toJSON()}))}));
  evidence.push({width,motion,stage:'before',state:await read()});
  await page.evaluate(y=>scrollTo(0,y-350),top);
  await page.waitForTimeout(180);
  evidence.push({width,motion,stage:'initial',state:await read()});
  await page.screenshot({path:`scratch/phase4/motion-${width}-${motion}-initial.png`});
  await page.waitForTimeout(500);
  evidence.push({width,motion,stage:'middle',state:await read()});
  await page.screenshot({path:`scratch/phase4/motion-${width}-${motion}-middle.png`});
  await page.waitForTimeout(1600);
  for(const offset of [100,500,750]) {
   await page.evaluate(y=>scrollTo(0,y),top+offset);
   await page.waitForTimeout(2200);
   evidence.push({width,motion,stage:`scroll-${offset}`,state:await read()});
   await page.screenshot({path:`scratch/phase4/motion-${width}-${motion}-${offset}.png`});
  }
  await page.evaluate(y=>scrollTo(0,y+100),top);
  evidence.push({width,motion,stage:'reverse',state:await read()});
  if(width===1440) {
   // Compare Portfolio and Capital Efficiency; Hero's continuously playing video varies between captures.
   await page.emulateMedia({reducedMotion:'reduce'});
   for(const item of await page.locator('main section').all())await item.scrollIntoViewIfNeeded();
   await page.evaluate(()=>scrollTo(0,0));
   await page.waitForTimeout(400);
   await page.screenshot({path:'scratch/phase4/regression-full.png',fullPage:true});
  }
  await page.close();
 }
 await fs.writeFile('scratch/phase4/local-motion.json',JSON.stringify(evidence,null,2));
 const [before,after]=await Promise.all(['baseline-1440.png','regression-full.png'].map(path=>sharp(`scratch/phase4/${path}`).extract({left:0,top:900,width:1440,height:1635}).removeAlpha().raw().toBuffer()));
 let differing=0,total=0;
 for(let i=0;i<before.length;i++){const delta=Math.abs(before[i]-after[i]);total+=delta;if(delta>10)differing++;}
 const result={meanChannelDelta:total/before.length,channelsDifferingOver10:differing/before.length};
 await fs.writeFile('scratch/phase4/regression-comparison.json',JSON.stringify(result,null,2));
 console.log('Captured desktop/mobile/reduced motion stages and prior-section comparison:',result);
} finally {await browser.close();}

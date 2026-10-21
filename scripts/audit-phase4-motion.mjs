import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'}), observations=[];
try {
 for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.goto('https://daily-shallot-076239.framer.app/');
  await page.waitForTimeout(1200);
  const section=page.locator('section[data-framer-name="Why us"]');
  const top=await section.evaluate(e=>e.getBoundingClientRect().top+scrollY);
  const read=()=>section.evaluate(s=>({scroll:scrollY,rect:s.getBoundingClientRect().toJSON(),nodes:[...s.querySelectorAll('[data-framer-name],h2,h3,h4,span')].map(e=>({name:e.getAttribute('data-framer-name')||e.tagName,text:e.textContent.slice(0,90),position:getComputedStyle(e).position,top:getComputedStyle(e).top,transform:getComputedStyle(e).transform,opacity:getComputedStyle(e).opacity,filter:getComputedStyle(e).filter,rect:e.getBoundingClientRect().toJSON()})),links:[...s.querySelectorAll('a')].map(e=>({text:e.innerText,href:e.getAttribute('href')}))}));
  for(const offset of [-700,-300,0,400,900,1500,2100,2700,1500,400]) {
   await page.evaluate(y=>scrollTo(0,y),top+offset);
   await page.waitForTimeout(1100);
   observations.push({width,offset,state:await read()});
   await page.screenshot({path:`scratch/phase4/framer-${width}-${observations.length}-${offset}.png`});
  }
  await page.evaluate(y=>scrollTo(0,y+1500),top);
  await page.waitForTimeout(400);
  await page.mouse.move(width/2,450);
  observations.push({width,stage:'hover',state:await read()});
  await page.close();
 }
 await fs.writeFile('scratch/phase4/framer-motion.json',JSON.stringify(observations,null,2));
 console.log('Captured source entrance, progression, exit, reverse and hover states on desktop/mobile.');
} finally {await browser.close();}

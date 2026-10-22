import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const fallback=JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json',import.meta.url),'utf8'));

test('published Case Study follows Difference with original assets at seven widths',async({page,request})=>{
 const response=await request.get('http://localhost:3035/api/homepage');expect(response.ok()).toBeTruthy();const content=(await response.json()).data.caseStudy;
 expect(content.items.map((x:{name:string})=>x.name)).toEqual(['Qubehealth','mPokket','Craev','Pidge']);
 for(const item of content.items)for(const media of [item.image,item.logo])expect((await request.get('http://localhost:3035'+media.url)).ok()).toBeTruthy();
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [1440,1280,1024,768,430,390,375]){await page.setViewportSize({width,height:950});await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');const section=page.locator('#case-study');await section.scrollIntoViewIfNeeded();await section.locator('img').evaluateAll(es=>Promise.all(es.map(e=>(e as HTMLImageElement).decode())));
 await expect(section.locator('li')).toHaveCount(4);await expect(page.locator('#four-signals')).toHaveCount(0);await expect(section.locator('[data-case-card][data-active=true] h3')).toHaveText('Qubehealth');
 const geometry=await section.evaluate(e=>({top:e.getBoundingClientRect().top,previous:document.querySelector('#capitar-difference')!.getBoundingClientRect().bottom+parseFloat(getComputedStyle(document.querySelector('#capitar-difference')!).marginBottom),height:e.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth,clipped:[...e.querySelectorAll('h2,h3,p')].some(n=>n.getClientRects().length>0 && getComputedStyle(n).visibility!=='hidden' && n.scrollWidth>n.clientWidth+1)}));expect(geometry.top).toBeCloseTo(geometry.previous,0);expect(geometry.overflow).toBeFalsy();expect(geometry.clipped).toBeFalsy();if(width===1440)expect(geometry.height).toBe(950);
 await section.screenshot({path:'test-results/case-study-'+width+'.png'});
 }expect(errors).toEqual([]);
});

test('arrow and keyboard card selection retain one expanded panel and wrap',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');const section=page.locator('#case-study');await section.scrollIntoViewIfNeeded();const active=section.locator('[data-case-card][data-active=true]');
 await section.getByRole('button',{name:'Next case study',exact:true}).click();await expect(active.locator('h3')).toHaveText('mPokket');
 await section.getByRole('button',{name:'Previous case study',exact:true}).click();await expect(active.locator('h3')).toHaveText('Qubehealth');await section.getByRole('button',{name:'Previous case study',exact:true}).click();await expect(active.locator('h3')).toHaveText('Pidge');
 await section.getByRole('button',{name:'Show Craev case study',exact:true}).focus();await page.keyboard.press('Enter');await expect(active.locator('h3')).toHaveText('Craev');await expect(section.locator('[data-case-card][data-active=true]')).toHaveCount(1);
 await page.screenshot({path:'test-results/case-study-selected.png'});
});

test('scroll entrance settles once, survives focus and scrolled reload',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:900});await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');const section=page.locator('#case-study'),header=section.locator('[data-case-header]');await expect(header).toHaveCSS('opacity','0');await section.scrollIntoViewIfNeeded();await expect.poll(async()=>Number(await header.evaluate(e=>getComputedStyle(e).opacity))).toBeGreaterThan(0);await page.screenshot({path:'test-results/case-entrance-progress.png'});await expect(header).toHaveCSS('opacity','1');await expect(header).toHaveCSS('transform','none');await expect(section.locator('[data-case-deck]')).toHaveCSS('opacity','1');await page.mouse.wheel(0,-1200);await section.scrollIntoViewIfNeeded();await expect(header).toHaveCSS('opacity','1');await page.evaluate(()=>dispatchEvent(new Event('focus')));await expect(header).toHaveCSS('opacity','1');await page.reload();await section.scrollIntoViewIfNeeded();await expect(header).toHaveCSS('opacity','1');
});

test('CMS edits, missing optional fields, invalid and disabled content remain isolated',async({page})=>{
 const data=structuredClone(fallback);data.caseStudy.heading='CMS case heading';data.caseStudy.items=data.caseStudy.items.reverse().map((x:object)=>({...x,image:null,logo:null,description:'',metricValue:''}));await page.route('**/api/homepage',r=>r.fulfill({json:{data}}));await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');const section=page.locator('#case-study');await expect(section.locator('h2')).toHaveText('CMS case heading');await expect(section.locator('img:not([aria-hidden="true"])')).toHaveCount(0);await expect(section.locator('[data-active=true] h3')).toHaveText('Pidge');data.caseStudy.items=[];await page.reload();await expect(section.locator('li')).toHaveCount(0);await expect(section.getByRole('button',{name:'Next case study'})).toBeDisabled();data.caseStudy.enabled=false;await page.reload();await expect(section).toHaveCount(0);data.caseStudy.enabled=true;data.caseStudy.heading='';await page.reload();await expect(section).toHaveCount(0);await expect(page.locator('h1')).toBeVisible();
});

test('mobile API and image failures retain readable fallback',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});await page.route('**/api/**',r=>r.abort());await page.route('**/case-qubehealth.webp',r=>r.abort());await page.goto('/');const section=page.locator('#case-study');await section.scrollIntoViewIfNeeded();await expect(section.locator('h2')).toBeVisible();await expect(section.locator('img[src*="case-qubehealth.webp"]')).toHaveCount(0);await expect(section.locator('li')).toHaveCount(4);
});


test('desktop cards expand on hover without clicking and settle on the hovered card',async({page})=>{
 await page.setViewportSize({width:1440,height:950});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 const section=page.locator('#case-study');await section.scrollIntoViewIfNeeded();
 await expect(section.locator('[data-case-deck]')).toHaveCSS('opacity','1');
 const cards=section.locator('[data-case-card]');
 const before=(await cards.nth(1).boundingBox())!.width;
 await cards.nth(1).hover();
 await expect(cards.nth(1)).toHaveAttribute('data-active','true');
 await expect.poll(async()=>(await cards.nth(1).boundingBox())!.width).toBeGreaterThan(before+200);
 await cards.nth(3).hover();await expect(cards.nth(3)).toHaveAttribute('data-active','true');
 await expect(section.locator('[data-active=true]')).toHaveCount(1);
 await page.mouse.move(10,10);await expect(cards.nth(3)).toHaveAttribute('data-active','true');
 await section.screenshot({path:'test-results/case-study-hover.png'});
});


test.describe('phone touch layout',()=>{
 test.use({viewport:{width:375,height:812},hasTouch:true,isMobile:true});
 test('tapped card stays above a horizontally scrollable thumbnail row',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
  const section=page.locator('#case-study');await section.scrollIntoViewIfNeeded();
  for(const name of ['Pidge','mPokket','Craev','Qubehealth']){
   await section.getByRole('button',{name:'Show '+name+' case study',exact:true}).tap();
   const active=section.locator('[data-case-card][data-active=true]');await expect(active.locator('h3')).toHaveText(name);
   const expanded=(await active.boundingBox())!;
   for(const card of await section.locator('[data-case-card][data-active=false]').all())expect((await card.boundingBox())!.y).toBeGreaterThanOrEqual(expanded.y+expanded.height-1);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(375);
  }
  await expect(section.getByRole('button',{name:'Next case study',exact:true})).toBeHidden();
  const thumbnails=section.getByRole('list',{name:'Choose a case study',exact:true});
  expect(await thumbnails.evaluate(e=>e.scrollWidth>e.clientWidth)).toBeTruthy();
  await section.screenshot({path:'test-results/case-study-phone-touch.png'});
 });
});

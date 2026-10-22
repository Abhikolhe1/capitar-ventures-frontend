import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const fallback=JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json',import.meta.url),'utf8'));
function mediaUrls(value:any):any {if(Array.isArray(value))return value.map(mediaUrls);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,key==='url'&&typeof item==='string'&&item.startsWith('/assets/')?'http://127.0.0.1:3039'+item:mediaUrls(item)]));return value;}
const content=mediaUrls(fallback);
for(const width of [1440,390])test('later section reveals complete once and survive CMS refresh at '+width,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'no-preference'});
 await page.route('**/api/global',r=>r.fulfill({json:{data:content.global}}));await page.route('**/api/homepage',r=>r.fulfill({json:{data:content}}));
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 for(const target of await page.locator('[data-scroll-reveal]').all())await expect(target).toHaveCSS('opacity','0');
 for(const id of ['team','insights-news','client-testimonials','site-footer']){
  const section=page.locator('#'+id);const targets=section.locator('[data-scroll-reveal]');
  for(const target of await targets.all()){await target.scrollIntoViewIfNeeded();await expect(target).toHaveCSS('opacity','1');await expect(target).toHaveCSS('transform','none');}
  await page.evaluate(()=>dispatchEvent(new Event('focus')));await expect(targets.first()).toHaveCSS('opacity','1');
  await page.evaluate(()=>scrollTo(0,0));await section.scrollIntoViewIfNeeded();await expect(targets.first()).toHaveCSS('opacity','1');
 }
 await page.locator('#insights-news').scrollIntoViewIfNeeded();await page.getByRole('tab',{name:'News',exact:true}).click();await expect(page.locator('#insights-news [data-scroll-reveal="editorial-panel"]')).toHaveCSS('opacity','1');
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
});

test('reduced motion leaves all later-section content readable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.route('**/api/global',r=>r.fulfill({json:{data:content.global}}));await page.route('**/api/homepage',r=>r.fulfill({json:{data:content}}));await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 for(const target of await page.locator('[data-scroll-reveal]').all()){await expect(target).toHaveCSS('opacity','1');await expect(target).toHaveCSS('transform','none');}
});

import {test,expect} from '@playwright/test';

for(const width of [1440,390])test('heading fills in reading order with scroll and reverses at '+width,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');await page.evaluate(()=>document.fonts.ready);
 const heading=page.locator('#proof-heading'),words=heading.locator('[data-proof-word]');const metrics=await page.locator('[data-proof-number]').allTextContents();
 const bounds=await heading.evaluate(e=>({top:e.getBoundingClientRect().top+scrollY,height:e.getBoundingClientRect().height}));
 const start=bounds.top-900*.6,end=bounds.top+bounds.height-900*.35;
 await page.evaluate(y=>scrollTo(0,y),start-40);await expect(words.first()).toHaveCSS('color','rgb(216, 218, 221)');
 await page.evaluate(y=>scrollTo(0,y),(start+end)/2);
 await expect(words.first()).toHaveCSS('color','rgb(18, 18, 18)');await expect(words.last()).toHaveCSS('color','rgb(216, 218, 221)');
 await page.evaluate(y=>scrollTo(0,y),end+40);await expect(words.last()).not.toHaveCSS('color','rgb(216, 218, 221)');
 await expect.poll(async()=>words.last().evaluate(e=>getComputedStyle(e).color)).toBe(await words.last().getAttribute('data-proof-color')==='rgba(18,18,18,0.6)'?'rgba(18, 18, 18, 0.6)':'rgb(18, 18, 18)');
 await page.evaluate(y=>scrollTo(0,y),start-40);await expect(words.first()).toHaveCSS('color','rgb(216, 218, 221)');
 expect(await page.locator('[data-proof-number]').allTextContents()).toEqual(metrics);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
});

test('reduced motion keeps readable final text and static metrics',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('[data-proof-word]').first()).toHaveCSS('color','rgb(18, 18, 18)');await expect(page.locator('[data-proof-number]').first()).toHaveText('30');
 await page.locator('#proof-heading').scrollIntoViewIfNeeded();await expect(page.locator('[data-proof-word]').first()).toHaveCSS('color','rgb(18, 18, 18)');
});

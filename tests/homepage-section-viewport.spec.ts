import {test,expect} from '@playwright/test';

test('desktop sections adapt to viewport height without clipping; sticky Difference is exempt',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 for(const [width,height] of [[1920,1080],[1440,900],[1536,667],[1366,768],[1280,720],[1024,600],[900,600],[1280,500]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>document.fonts.ready);
  for(const id of ['portfolio-proof-points','capital-efficiency','case-study']){
   const section=page.locator('#'+id);await section.scrollIntoViewIfNeeded();
   const geometry=await section.evaluate(el=>{const r=el.getBoundingClientRect();return {height:r.height,overflow:document.documentElement.scrollWidth>innerWidth,outside:[...el.querySelectorAll('h2,h3,p,article,[data-case-image-button]')].filter(n=>{const x=n.getBoundingClientRect();return x.width>0&&x.height>0&&(x.top<r.top-1||x.bottom>r.bottom+1||x.left<r.left-1||x.right>r.right+1)}).map(n=>n.textContent),clipped:[...el.querySelectorAll('h2,h3,p')].filter(n=>n.getClientRects().length>0&&n.scrollWidth>n.clientWidth+1).map(n=>n.textContent)};});
   expect(geometry.height,id+' '+width+'x'+height).toBeCloseTo(height,0);expect(geometry.overflow).toBeFalsy();expect(geometry.outside).toEqual([]);expect(geometry.clipped).toEqual([]);
   if(width===1536||height===500)await section.screenshot({path:'test-results/viewport-'+id+'-'+width+'-'+height+'.png'});
  }
  expect((await page.locator('main > section').first().boundingBox())!.height).toBe(height);
 }
 expect((await page.locator('#capitar-difference').boundingBox())!.height).toBeGreaterThan(500);
});

test('phone sections retain natural readable height',async({page})=>{
 await page.setViewportSize({width:390,height:812});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 expect((await page.locator('#capital-efficiency').boundingBox())!.height).toBeGreaterThan(812);
 expect((await page.locator('#case-study').boundingBox())!.height).toBeGreaterThan(812);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
});

test('Team, editorial, testimonials and footer fill a desktop viewport with visible controls', async ({ page }) => {
 await page.emulateMedia({ reducedMotion: 'reduce' });
 await page.goto('/');
 await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
 for (const [width, height] of [[1440, 900], [1280, 720], [1024, 600], [900, 600], [1280, 500]]) {
  await page.setViewportSize({ width, height });
  await page.evaluate(() => document.fonts.ready);
  for (const id of ['team', 'insights-news', 'client-testimonials', 'site-footer']) {
   const section = page.locator('#' + id);
   await section.scrollIntoViewIfNeeded();
   const geometry = await section.evaluate(el => {
    const bounds = el.getBoundingClientRect();
    const outside = [...el.querySelectorAll('h2,h3,p,article,button')].filter(node => {
     const rect = node.getBoundingClientRect();
     return getComputedStyle(node).visibility !== 'hidden' && rect.width > 0 && rect.height > 0 &&
      rect.right > bounds.left && rect.left < bounds.right &&
      (rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1);
    }).map(node => node.textContent);
    return { height: bounds.height, outside, overflow: document.documentElement.scrollWidth > innerWidth };
   });
   expect(geometry.height, `${id} at ${width}x${height}`).toBeCloseTo(height, 0);
   expect(geometry.outside, id).toEqual([]);
   expect(geometry.overflow, id).toBeFalsy();
  }
 }
});

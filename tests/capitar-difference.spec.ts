import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const fallback=JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json',import.meta.url),'utf8'));
const cms='http://localhost:3035';

test('published fourth section resolves its exact assets and fits all seven widths',async({page,request})=>{
 const response=await request.get(`${cms}/api/homepage`);
 expect(response.ok()).toBeTruthy();
 const content=(await response.json()).data.capitarDifference;
 expect(content.heading).toBe(fallback.capitarDifference.heading);
 expect(content.items.map((item:{number:string})=>item.number)).toEqual(['01','02','03','04']);
 for(const media of [content.cardBackground,...content.items.map((item:{image:unknown})=>item.image)]){
  expect(media.url).toMatch(/^\/uploads\//);
  expect((await request.get(cms+media.url)).ok()).toBeTruthy();
 }
 const errors:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [1440,1280,1024,768,430,390,375]){
  await page.setViewportSize({width,height:950});
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
  const section=page.locator('#capitar-difference');
  await section.scrollIntoViewIfNeeded();
  await page.evaluate(()=>document.fonts.ready);
  await section.locator('img').evaluateAll(es=>Promise.all(es.map(e=>(e as HTMLImageElement).decode())));
  await expect(section.locator('article')).toHaveCount(4);
  await expect(section.getByRole('button',{name:'About Us'})).toBeDisabled();
  const geometry=await section.evaluate(el=>({
   height:el.getBoundingClientRect().height,top:el.getBoundingClientRect().top,
   previousBottom:document.querySelector('#capital-efficiency')!.getBoundingClientRect().bottom,
   overflow:document.documentElement.scrollWidth>innerWidth,
   clipped:[...el.querySelectorAll('h2,h3,p')].some(e=>e.scrollWidth>e.clientWidth+1),
   cardHeights:[...el.querySelectorAll('article')].map(e=>e.getBoundingClientRect().height),
  }));
  expect(geometry.top).toBeCloseTo(geometry.previousBottom,0);
  expect(geometry.overflow).toBeFalsy();
  expect(geometry.clipped).toBeFalsy();
  if(width===1440){expect(geometry.height).toBeCloseTo(1671.65,0);expect(geometry.cardHeights).toEqual([440,440,440,440]);}
  await section.screenshot({path:`test-results/difference-${width}.png`});
 }
 expect(errors).toEqual([]);
});

for (const reducedMotion of ['no-preference','reduce'] as const) {
test(`desktop intro sticks, releases and reveals once with motion setting ${reducedMotion}`,async({page})=>{
 await page.emulateMedia({reducedMotion});
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/');
 await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 const section=page.locator('#capitar-difference');
 const heading=section.locator('h2');
 await expect(heading).toHaveCSS('opacity','0');
 const top=await section.evaluate(e=>e.getBoundingClientRect().top+scrollY);
 // Temporary test-only space permits checking release before a future section exists.
 await page.evaluate(()=>{const tail=document.createElement('div');tail.id='test-scroll-space';tail.style.height='1200px';document.body.append(tail);});
 await page.evaluate(y=>scrollTo(0,y+100),top);
 await expect(heading).toHaveCSS('opacity','1');
 const intro=section.locator('[data-difference-intro]');
 expect((await intro.boundingBox())!.y).toBeCloseTo(0,0);
 const first=section.locator('article').first();
 const before=(await first.boundingBox())!.y;
 await page.evaluate(y=>scrollTo(0,y+500),top);
 expect((await intro.boundingBox())!.y).toBeCloseTo(0,0);
 expect((await first.boundingBox())!.y).toBeCloseTo(before-400,0);
 await expect(first.locator('h3')).toHaveCSS('opacity','1');
 await page.evaluate(y=>scrollTo(0,y+1300),top);
 expect((await intro.boundingBox())!.y).toBeLessThan(-100);
 await page.evaluate(y=>scrollTo(0,y+100),top);
 expect((await intro.boundingBox())!.y).toBeCloseTo(0,0);
 await expect(heading).toHaveCSS('opacity','1');
 await expect(first.locator('h3')).toHaveCSS('opacity','1');
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await expect(heading).toHaveCSS('opacity','1');
 await page.screenshot({path:'test-results/difference-sticky-complete.png'});
});

}

test('CMS text/order, absent media, empty lists and invalid or disabled sections are isolated',async({page})=>{
 const content=structuredClone(fallback.capitarDifference);
 content.heading='CMS edited difference heading';
 content.description='';
 content.cardBackground=null;
 content.items=content.items.reverse().map((item:object)=>({...item,image:null}));
 content.cta={label:'CMS link',enabled:true,href:'#capital-efficiency'};
 await page.route('**/api/homepage',route=>route.fulfill({json:{data:{...fallback,capitarDifference:content}}}));
 await page.goto('/');
 await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('#difference-heading')).toHaveText(content.heading);
 await expect(page.locator('#capitar-difference [data-difference-number]').first()).toHaveText('04');
 await expect(page.locator('#capitar-difference article img')).toHaveCount(0);
 const link=page.getByRole('link',{name:'CMS link'});
 await link.click();
 await expect(page).toHaveURL(/#capital-efficiency$/);
 content.cta.href='javascript:alert(1)';
 content.items=[];
 await page.reload();
 await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('#capitar-difference article')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'CMS link'})).toBeDisabled();
 content.enabled=false;
 await page.reload();
 await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('#capitar-difference')).toHaveCount(0);
 content.enabled=true;content.heading='';
 await page.reload();
 await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('#capitar-difference')).toHaveCount(0);
 await expect(page.locator('h1')).toBeVisible();
 await expect(page.locator('#capital-efficiency')).toHaveCount(1);
});

test('mobile and reduced motion retain readable flow and handle API/image failure',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/api/**',route=>route.abort());
 await page.route('**/difference-art-1.webp',route=>route.abort());
 await page.goto('/');
 const section=page.locator('#capitar-difference');
 await section.scrollIntoViewIfNeeded();
 await expect(section.locator('img[src*="difference-art-1"]')).toHaveCount(0);
 await expect(section.locator('h2')).toHaveCSS('opacity','1');
 await expect(section.locator('[data-difference-intro]')).toHaveCSS('position','relative');
 await section.locator('article').first().scrollIntoViewIfNeeded();
 await expect(section.locator('article').first().locator('h3')).toHaveCSS('filter','none');
 const boxes=await section.locator('article').all();
 for(let index=1;index<boxes.length;index++)expect((await boxes[index].boundingBox())!.y).toBeGreaterThan((await boxes[index-1].boundingBox())!.y);
 await page.reload();
 await section.locator('article').last().scrollIntoViewIfNeeded();
 await expect(section.locator('article').last().locator('h3')).toBeVisible();
});

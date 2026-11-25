import { test, expect } from '@playwright/test';

const companies = Array.from({length:23}, (_, i) => ({
  id:i+1, name:`Company ${i+1}`, description:'Company description',
  founder:{name:'Founder'}, sector:i<11?'Alpha':'Beta', stage:'Series A',
  websiteUrl:`https://company.example/${i+1}`,
}));

for (const [width, preference] of [[1440,'no-preference'],[1440,'reduce'],[390,null]] as const) {
  test(`Load more appends nine, resets filters and retries at ${width}px with OS ${preference ?? 'system'}`, async ({page}) => {
    test.setTimeout(60000);
    await page.emulateMedia({reducedMotion:preference});
    await page.setViewportSize({width,height:900});
    await page.route('**/api/**',r=>r.fulfill({status:503,body:'{}'}));
    let failNext = false;
    const requests:number[]=[];
    await page.route('**/api/portfolio/companies?*',route=>{
      const query=new URL(route.request().url()).searchParams;
      const skip=Number(query.get('skip')), limit=Number(query.get('limit'));
      requests.push(skip);
      expect(limit).toBe(9);
      if(failNext){failNext=false;return route.fulfill({status:503,body:'{}'});}
      const filtered=companies.filter(c=>!query.get('sector')||c.sector===query.get('sector'));
      return route.fulfill({json:{data:filtered.slice(skip,skip+limit),meta:{pagination:{total:filtered.length},sectors:['Alpha','Beta'],stages:['Series A']}}});
    });
    await page.goto('/portfolio',{waitUntil:'domcontentloaded'});
    const grid=page.locator('.portfolio-grid');
    await expect(grid).toHaveAttribute('aria-busy','false');
    await expect(grid.locator('li')).toHaveCount(9);
    await expect(page.getByRole('navigation',{name:'Portfolio companies pages'})).toHaveCount(0);
    const more=page.getByRole('button',{name:'Load more',exact:true});
    failNext=true;
    await more.click();
    await expect(page.getByRole('status').filter({hasText:'Unable to load more'})).toBeVisible();
    await expect(grid.locator('li')).toHaveCount(9);
    await more.click();
    await expect(grid.locator('li')).toHaveCount(18);
    await expect(grid.locator('h3').first()).toHaveText('Company 1');
    await more.click();
    await expect(grid.locator('li')).toHaveCount(23);
    await expect(more).toHaveCount(0);
    expect(requests.filter(skip=>skip>0)).toEqual([9,9,18]);
    await page.getByRole('combobox',{name:'Sector',exact:true}).click();
    await page.getByRole('option',{name:'Beta',exact:true}).click();
    await expect(grid).toHaveAttribute('aria-busy','false');
    await expect(grid.locator('li')).toHaveCount(9);
    await expect(grid.locator('h3').first()).toHaveText('Company 12');
    await more.click();
    await expect(grid.locator('li')).toHaveCount(12);
    await expect(more).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
    if(width===1440){
      const card=grid.locator('article').first();
      await card.hover();
      const arrow=card.locator('.portfolio-card__arrow');
      await expect(arrow).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
      await expect(arrow).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
      await expect(arrow).toHaveCSS('border-top-color','rgb(255, 255, 255)');
      await expect(arrow.locator('img')).toHaveCSS('filter','brightness(0) invert(1)');
      await card.screenshot({path:'test-results/portfolio-white-arrow.png'});
      await page.route('https://company.example/12',r=>r.fulfill({body:'Company website'}));
      const box=(await arrow.boundingBox())!;
      await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
      await expect(page).toHaveURL('https://company.example/12');
    }
  });
}

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
const fallback = JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json', import.meta.url), 'utf8'));

test('published capital section resolves all media and fits seven viewport widths after Portfolio', async ({ page, request }) => {
  const response = await request.get('http://localhost:3035/api/homepage');
  expect(response.ok()).toBeTruthy();
  const capital = (await response.json()).data.capitalEfficiency;
  expect(capital.heading).toBe(fallback.capitalEfficiency.heading);
  expect(capital.benefits.map((b: {title:string})=>b.title)).toEqual(fallback.capitalEfficiency.benefits.map((b: {title:string})=>b.title));
  for (const media of [capital.backgroundImage, ...capital.benefits.flatMap((b: {icon:unknown;artwork:unknown})=>[b.icon,b.artwork])]) {
    expect(media.url).toMatch(/^\/uploads\//);
    expect((await request.get(`http://localhost:3035${media.url}`)).ok()).toBeTruthy();
  }
  const errors: string[] = [];
  page.on('pageerror', error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const width of [1440,1280,1024,768,430,390,375]) {
    await page.setViewportSize({width,height:950});
    await page.goto('/');
    await expect(page.locator('#main-content')).toHaveAttribute('aria-busy','false');
    const section = page.locator('#capital-efficiency');
    await section.scrollIntoViewIfNeeded();
    await page.evaluate(()=>document.fonts.ready);
    await expect(section.locator('article')).toHaveCount(4);
    await section.locator('img').evaluateAll(els=>Promise.all(els.map(el=>(el as HTMLImageElement).decode())));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
    const geometry = await section.evaluate(el=>({
      height:el.getBoundingClientRect().height,
      top:el.getBoundingClientRect().top,
      proofBottom:document.querySelector('#portfolio-proof-points')!.getBoundingClientRect().bottom,
      clipped:[...el.querySelectorAll('h2,h3,p')].some(e=>e.scrollWidth>e.clientWidth+1),
      visible:[...el.querySelectorAll('article')].every(e=>getComputedStyle(e).opacity==='1'),
    }));
    expect(geometry.top).toBeCloseTo(geometry.proofBottom,0);
    expect(geometry.clipped).toBeFalsy();
    expect(geometry.visible).toBeTruthy();
    if (width===1440) expect(geometry.height).toBe(950);
    await section.screenshot({path:`test-results/capital-${width}.png`});
  }
  expect(errors).toEqual([]);
});

test('benefit reveal completes once, remains visible on reentry and CMS refresh, and supports reload', async ({ page }) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy','false');
  const cards = page.locator('#capital-efficiency article');
  await expect(cards.first()).toHaveCSS('opacity','0');
  await cards.first().scrollIntoViewIfNeeded();
  await expect(cards.first()).toHaveCSS('opacity','1');
  await expect(cards.first()).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  await page.mouse.wheel(0,-2500);
  await page.waitForTimeout(250);
  await cards.first().scrollIntoViewIfNeeded();
  await expect(cards.first()).toHaveCSS('opacity','1');
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(cards.first()).toHaveCSS('opacity','1');
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy','false');
  await cards.last().scrollIntoViewIfNeeded();
  await expect(cards.last()).toHaveCSS('opacity','1');
});

test('CMS text, order, missing media and disabled or invalid content remain isolated', async ({ page }) => {
  const capital = structuredClone(fallback.capitalEfficiency);
  capital.heading = 'CMS editable capital heading';
  capital.description = '';
  capital.benefits = capital.benefits.reverse().map((b: object)=>({...b,icon:null,artwork:null}));
  await page.route('**/api/homepage',route=>route.fulfill({json:{data:{...fallback,capitalEfficiency:capital}}}));
  await page.goto('/');
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('#capital-heading')).toHaveText('CMS editable capital heading');
  await expect(page.locator('#capital-efficiency h3').first()).toHaveText('Capitalize on momentum');
  await expect(page.locator('#capital-efficiency article img')).toHaveCount(0);
  capital.benefits = [];
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('#capital-efficiency article')).toHaveCount(0);
  capital.enabled = false;
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('#capital-efficiency')).toHaveCount(0);
  capital.enabled = true;
  capital.heading = '';
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('#capital-efficiency')).toHaveCount(0);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#portfolio-proof-points')).toHaveCount(1);
});

test('below-fold fallback renders through CMS outage, and failed optional images disappear', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/api/**',route=>route.abort());
  await page.route('**/capital-growth-art.webp',route=>route.abort());
  await page.goto('/');
  const section = page.locator('#capital-efficiency');
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('h3').first()).toHaveText('Accelerate growth');
  await expect(section.locator('img[src*="capital-growth-art"]')).toHaveCount(0);
  await expect(section.locator('article').first()).toHaveCSS('opacity','1');
});

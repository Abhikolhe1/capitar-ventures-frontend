import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const fallback = JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json', import.meta.url), 'utf8'));

test('published proof content and responsive geometry match the section structure', async ({ page, request }) => {
  const response = await request.get('http://localhost:3035/api/homepage');
  expect(response.ok()).toBeTruthy();
  const proof = (await response.json()).data.portfolioProofPoints;
  expect(proof.metrics.map((metric: { label: string }) => metric.label)).toEqual(fallback.portfolioProofPoints.metrics.map((metric: { label: string }) => metric.label));
  expect(proof.backgroundLeft.url).toMatch(/^\/uploads\//);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 1280, 1024, 768, 430, 390, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
    const section = page.locator('#portfolio-proof-points');
    await section.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    await expect(section.locator('dt')).toHaveCount(4);
    await expect(section.locator('[data-proof-number]').nth(1)).toHaveText('400');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const geometry = await section.evaluate(el => ({ top: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height, hero: document.querySelector('section')!.getBoundingClientRect().height, clipped: [...el.querySelectorAll('dt,h2')].some(node => node.scrollWidth > node.clientWidth + 1) }));
    expect(geometry.top).toBeCloseTo(geometry.hero, 0);
    expect(geometry.clipped).toBeFalsy();
    if (width === 1440) expect(geometry.height).toBe(685);
    await section.screenshot({ path: `test-results/proof-${width}.png` });
  }
  expect(errors).toEqual([]);
});

test('counters play once, preserve accessible final values, and survive refresh', async ({ page }) => {
  await page.route('**/api/homepage', route => route.fulfill({ json: { data: fallback } }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('[data-proof-number]').first()).toHaveText('0');
  await page.locator('#portfolio-proof-points').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-proof-number]').nth(1)).toHaveText('400');
  await page.mouse.wheel(0, -2000);
  await page.waitForTimeout(200);
  await page.locator('#portfolio-proof-points').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-proof-number]').nth(1)).toHaveText('400');
  await page.reload();
  await page.locator('#portfolio-proof-points').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-proof-number]').nth(1)).toHaveText('400');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('CMS changes, optional fields, disabled sections and invalid proof data are isolated', async ({ page }) => {
  let proof: unknown = { ...fallback.portfolioProofPoints, heading: 'Published CMS proof statement', mutedText: '', backgroundLeft: null, backgroundRight: null, metrics: [{value:'42',label:'CMS metric'}] };
  await page.route('**/api/homepage', route => route.fulfill({ json: { data: { hero: fallback.hero, portfolioProofPoints: proof } } }));
  await page.goto('/');
  await expect(page.locator('#proof-heading')).toHaveText('Published CMS proof statement');
  await expect(page.locator('#portfolio-proof-points dt')).toHaveText('CMS metric');
  proof = { ...fallback.portfolioProofPoints, enabled: false };
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#portfolio-proof-points')).toHaveCount(0);
  proof = { heading: 123, metrics: null };
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#portfolio-proof-points')).toHaveCount(0);
  await expect(page.locator('h1')).toBeVisible();
});

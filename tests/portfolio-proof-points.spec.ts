import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const fallback = JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json', import.meta.url), 'utf8'));

test('proof section height and top spacing stay independent of desktop viewport height', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  await page.evaluate(() => document.fonts.ready);
  const section = page.locator('#portfolio-proof-points');
  const originalHeight = (await section.boundingBox())!.height;
  // Verified against Figma's desktop Stats Overview Container: 1440 × 685.
  expect(originalHeight).toBeCloseTo(685, 0);
  for (const height of [1080, 720, 500]) {
    await page.setViewportSize({ width: 1440, height });
    expect((await section.boundingBox())!.height).toBeCloseTo(originalHeight, 0);
    const padding = await section.locator(':scope > div').last().evaluate(el => getComputedStyle(el).paddingTop);
    expect(padding).toBe('84px');
  }
});

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
    const offsets = await section.locator('[data-proof-metric]').evaluateAll(items => items.map(item => {
      const column = item.getBoundingClientRect();
      const value = item.querySelector('dd')!.getBoundingClientRect();
      const label = item.querySelector('dt')!.getBoundingClientRect();
      return [Math.abs(value.left + value.width / 2 - column.left - column.width / 2), Math.abs(label.left + label.width / 2 - column.left - column.width / 2)];
    }));
    for (const [valueOffset, labelOffset] of offsets) {
      expect(valueOffset).toBeLessThan(1);
      expect(labelOffset).toBeLessThan(1);
    }
    if (width === 1440) expect(geometry.height).toBeCloseTo(685, 0);
    await section.screenshot({ path: `test-results/proof-${width}.png` });
  }
  expect(errors).toEqual([]);
});

test('proof numbers reveal on scroll and settle without changing their values', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  const values = page.locator('[data-proof-value]');
  await expect(values.first()).toHaveCSS('opacity', '0');
  await page.locator('#portfolio-proof-points dl').scrollIntoViewIfNeeded();
  await expect(values.last()).toHaveCSS('opacity', '1');
  await expect(values.last()).toHaveCSS('filter', 'none');
  await expect(page.locator('[data-proof-number]').nth(1)).toHaveText('400');
});

test('metrics show final values before scrolling and retain them through refresh', async ({ page }) => {
  await page.route('**/api/homepage', route => route.fulfill({ json: { data: fallback } }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('[data-proof-number]').first()).toHaveText(String(fallback.portfolioProofPoints.metrics[0].value));
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

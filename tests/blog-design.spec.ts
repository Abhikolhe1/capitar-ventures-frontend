import { test, expect } from '@playwright/test';

test('desktop geometry and typography match the native Figma reference with a viewport hero', async ({ page }) => {
  await page.setViewportSize({ width: 1441, height: 900 });
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/blog');
  await expect(page.locator('.blog-card')).toHaveCount(9);
  await page.evaluate(() => document.fonts.ready);
  for (const [selector, width, height] of [
    ['#blog-hero', 1441, 900], ['#blog-featured', 1441, 640],
    ['#blog-latest', 1441, 1591], ['#blog-newsletter', 1441, 445],
    ['.blog-feature', 1241, 440], ['.blog-grid', 1241, 1267],
    ['.blog-card', 397.667, 401], ['.blog-card__media', 383.667, 209],
    ['.blog-feature__cta button', 132.36, 40],
  ] as const) {
    const box = await page.locator(selector).first().boundingBox();
    expect(Math.abs(box!.width - width), selector + ' width').toBeLessThan(.1);
    expect(Math.abs(box!.height - height), selector + ' height').toBeLessThan(.1);
  }
  await expect(page.locator('h1')).toHaveCSS('font-size', '72px');
  await expect(page.locator('h1')).toHaveCSS('line-height', '72px');
  await expect(page.locator('.blog-hero__emphasis')).toHaveCSS('font-weight', '700');
  for (const selector of ['.blog-feature h2', '.blog-latest h2', '.blog-newsletter h2']) {
    await expect(page.locator(selector)).toHaveCSS('font-size', '42px');
    await expect(page.locator(selector)).toHaveCSS('line-height', '50px');
  }
  await expect(page.locator('.blog-card h3').first()).toHaveCSS('font-family', /LT Superior Serif/);
  await expect(page.locator('.blog-card p').first()).toHaveCSS('line-height', '26px');
  const uncovered = await page.locator('.blog-card__media').evaluateAll(slots => slots.some(slot => {
    const frame = slot.getBoundingClientRect(), image = slot.querySelector('img')!.getBoundingClientRect();
    return image.left > frame.left + .1 || image.right < frame.right - .1 || image.top > frame.top + .1 || image.bottom < frame.bottom - .1;
  }));
  expect(uncovered, 'source crops cover every image slot without blank strips').toBe(false);
});

test('short mobile landscape keeps hero copy readable', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/blog');
  await expect(page.locator('h1')).toBeVisible();
  const layout = await page.locator('#blog-hero').evaluate(hero => ({
    height: hero.getBoundingClientRect().height,
    copy: hero.querySelector('.blog-hero__content')!.getBoundingClientRect().height,
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));
  expect(layout.height).toBeGreaterThanOrEqual(390);
  expect(layout.height).toBeGreaterThanOrEqual(layout.copy);
  expect(layout.overflow).toBe(false);
});

import { test, expect } from '@playwright/test';

test('reveal starts later and upward exit fades gradually', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  const target = page.locator('[data-capital-card]').first();
  const top = await target.evaluate(el => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(y => scrollTo(0, y - innerHeight * 0.82), top);
  await page.waitForTimeout(150);
  await expect(target).toHaveCSS('opacity', '0');
  await page.evaluate(y => scrollTo(0, y - innerHeight * 0.55), top);
  await expect(target).toHaveCSS('opacity', '1');
  await page.evaluate(y => scrollTo(0, y - innerHeight * 0.82), top);
  await page.waitForTimeout(250);
  const intermediateOpacity = await target.evaluate(el => Number(getComputedStyle(el).opacity));
  expect(intermediateOpacity).toBeGreaterThan(0);
  expect(intermediateOpacity).toBeLessThan(1);
  await expect(target).toHaveCSS('opacity', '0');
});

test('previous sections reveal from above when scrolling upward', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  for (const [selector, triggerSelector, start] of [
    ['[data-proof-value]', '#portfolio-proof-points dl', 0.7],
    ['[data-capital-card]', '[data-capital-card]', 0.7],
    ['[data-difference-title]', '[data-difference-card]', 0.7],
    ['[data-case-header]', '[data-case-header]', 0.7],
    ['[data-scroll-reveal="team-track"]', '[data-scroll-reveal="team-track"]', 0.7],
    ['[data-scroll-reveal="editorial-panel"]', '[data-scroll-reveal="editorial-panel"]', 0.7],
  ] as const) {
    const element = page.locator(selector).first();
    const trigger = page.locator(triggerSelector).first();
    const boundary = await trigger.evaluate((el, ratio) => el.getBoundingClientRect().top + scrollY - innerHeight * ratio, start);
    await page.evaluate(y => scrollTo(0, y + 120), boundary);
    await expect(element).toHaveCSS('opacity', '1');
    const end = await trigger.evaluate(el => el.getBoundingClientRect().bottom + scrollY);
    await page.evaluate(y => scrollTo(0, y + 180), end);
    await page.waitForTimeout(1600);
    await page.evaluate(y => scrollTo(0, y - 180), end);
    await expect.poll(async () => Number(await element.evaluate(el => getComputedStyle(el).opacity))).toBeLessThan(1);
    await expect(element).toHaveCSS('opacity', '1');
    await page.evaluate(y => scrollTo(0, Math.max(0, y - 160)), boundary);
    await page.waitForTimeout(100);
    await page.evaluate(y => scrollTo(0, y + 120), boundary);
    await expect(element).toHaveCSS('opacity', '1');
  }
});

test('small direction changes do not restart visible content', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
    const target = page.locator('[data-capital-card]').first();
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveCSS('opacity', '1');
    for (const delta of [20, -15, 10, -20]) {
      await page.evaluate(y => scrollBy(0, y), delta);
      await page.waitForTimeout(80);
      await expect(target).toHaveCSS('opacity', '1');
    }
  }
});

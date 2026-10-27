import { test, expect } from '@playwright/test';

test('shared background keeps its approved colors in both scroll directions and on mobile', async ({ page }) => {
  await page.route('**/api/global', route => route.abort());
  await page.route('**/api/homepage', route => route.abort());
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 600 });
    for (const progress of [0, 0.5, 1, 0.5, 0]) {
      await page.locator('#portfolio-proof-points').evaluate((section, value) => {
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top - window.innerHeight * (0.95 - value * 0.6));
      }, progress);
      const expected = progress === 0 ? 'rgb(17, 17, 41)' : progress === 1 ? 'rgb(248, 249, 250)' : 'rgb(184, 212, 241)';
      await expect.poll(async () => {
        const colors = await page.locator('main > section').evaluateAll(sections => sections.map(section => getComputedStyle(section).backgroundColor));
        const canvas = await page.locator('[data-page-color-canvas]').evaluate(element => getComputedStyle(element).backgroundColor);
        return colors.every(color => color === 'rgba(0, 0, 0, 0)') && canvas;
      }).toBe(expected);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('#portfolio-proof-points')).toHaveCSS('background-color', 'rgb(248, 249, 250)');
  await expect(page.locator('[data-flow-ink]')).toHaveCount(0);
  await expect(page.locator('[data-page-color-canvas]')).toHaveCount(0);
});

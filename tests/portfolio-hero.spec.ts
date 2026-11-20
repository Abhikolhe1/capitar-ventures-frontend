import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const fallback = JSON.parse(readFileSync(new URL('../src/content/portfolio.json', import.meta.url), 'utf8'));

for (const reducedMotion of ['reduce', 'no-preference', null] as const) {
  test(`Portfolio keeps its shorter hero and fixed colors with ${reducedMotion ?? 'system'} motion`, async ({ page }) => {
    test.setTimeout(90000);
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(() => localStorage.setItem('capitar-motion', 'reduced'));
    await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
    for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 600 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.goto('/portfolio');
      await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
      await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
      const hero = page.locator('.portfolio-hero');
      const art = page.locator('.portfolio-hero__art');
      await expect(art).toHaveCSS('opacity', '1');
      await expect(art).toHaveCSS('background-image', /hero-glass-tiles\.png/);
      expect((await hero.boundingBox())!.height).toBe(viewport.width < 600 ? 590 : 675);
      await expect(page.locator('header')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      for (const delta of [320, 600, -600, -320]) {
        await page.mouse.wheel(0, delta);
        await page.waitForTimeout(700);
        await expect(page.locator('[data-page-color-canvas]')).toHaveCount(0);
        await expect(page.locator('.portfolio-companies')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
        await expect(art).toHaveCSS('opacity', '1');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: `test-results/portfolio-hero-${viewport.width}-${reducedMotion ?? 'system'}.png` });
    }
    await page.goto('/');
    await expect(page.locator('[data-page-color-canvas]')).toHaveCount(1);
    await page.goto('/portfolio');
    await expect(page.locator('[data-page-color-canvas]')).toHaveCount(0);
  });
}

test('Portfolio replaces its legacy seeded banner but respects a newly selected CMS image', async ({ page }) => {
  const data = structuredClone(fallback);
  data.hero.backgroundImage.url = '/uploads/portfolio_hero_background_8a2c40ef94.webp';
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/api/portfolio', route => route.fulfill({ json: { data } }));
  await page.goto('/portfolio');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('.portfolio-hero__art')).toHaveCSS('background-image', /hero-glass-tiles\.png/);
  data.hero.backgroundImage.url = '/uploads/custom-portfolio-banner.png';
  await page.reload();
  await expect(page.locator('.portfolio-hero__art')).toHaveCSS('background-image', /custom-portfolio-banner\.png/);
});

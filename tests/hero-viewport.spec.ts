import { test, expect } from '@playwright/test';

test('desktop hero and clients fit the viewport at short and tall desktop sizes', async ({ page }) => {
  for (const [width, height] of [[1440, 900], [1440, 800], [1366, 768], [1280, 720], [1024, 600], [1280, 500]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('[data-entrance="header"]')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-entrance="clients"]')).toHaveCSS('opacity', '1');
    const geometry = await page.evaluate(() => {
      const hero = document.querySelector('section')!.getBoundingClientRect();
      const cta = document.querySelector('[data-entrance="content"]:last-child')?.getBoundingClientRect();
      const clients = document.querySelector('[data-entrance="clients"]')!.getBoundingClientRect();
      const heading = document.querySelector('h1')!.getBoundingClientRect();
      return { hero: hero.height, bottom: clients.bottom, clientTop: clients.top, headingBottom: heading.bottom, scrollHeight: document.documentElement.scrollHeight, scrollWidth: document.documentElement.scrollWidth, ctaBottom: cta?.bottom };
    });
    expect(geometry.hero).toBe(height);
    expect(geometry.bottom).toBeLessThanOrEqual(height + 1);
    expect(geometry.headingBottom).toBeLessThan(geometry.clientTop);
    // The Hero still fits one viewport; Phase 2 intentionally extends the page below it.
    expect(geometry.scrollHeight).toBeGreaterThanOrEqual(height);
    expect(geometry.scrollWidth).toBe(width);
    await page.screenshot({ path: `test-results/hero-fit-${width}-${height}.png` });
  }
});

test('header slides away on downward wheel and returns on upward wheel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 768 });
  await page.goto('/');
  await expect(page.locator('[data-entrance="header"]')).toHaveCSS('opacity', '1');
  await page.mouse.wheel(0, 150);
  await expect(page.locator('header')).toHaveAttribute('data-scroll-hidden', 'true');
  await expect(page.locator('header')).toHaveCSS('opacity', '0');
  await expect(page.locator('header')).toHaveAttribute('inert', '');
  await page.mouse.wheel(0, -150);
  await expect(page.locator('header')).toHaveAttribute('data-scroll-hidden', 'false');
  await expect(page.locator('header')).toHaveCSS('opacity', '1');
  await expect(page.locator('header')).not.toHaveAttribute('inert', '');
});

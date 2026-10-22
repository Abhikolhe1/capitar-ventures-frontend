import { test, expect } from '@playwright/test';

test('desktop wheel scrolling eases and anchor navigation reaches the section', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await page.mouse.move(1300, 500);
  await page.mouse.wheel(0, 700);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(680);
  await page.locator('footer').getByRole('link', { name: 'Our Offerings', exact: true }).click();
  await expect.poll(() => page.locator('#capital-efficiency').evaluate(e => Math.abs(e.getBoundingClientRect().top - 96))).toBeLessThan(2);
  await expect(page.locator('#capital-heading')).toHaveCSS('opacity', '1');
});

test('reduced motion keeps native scrolling and the reference font', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  for (const selector of ['#team h3', '#insights-news h3']) {
    for (const heading of await page.locator(selector).all()) {
      await expect(heading).toHaveCSS('font-family', /LT Superior/);
    }
  }
  await expect(page.locator('[data-scroll-reveal="capital-heading"]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-scroll-reveal="proof-metrics"]')).toHaveCSS('opacity', '1');
});

test('smooth scrolling honors the navigation drawer body lock', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  const before = await page.evaluate(() => scrollY);
  await page.mouse.move(50, 500);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await page.getByRole('button', { name: 'Close navigation', exact: true }).click();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
});

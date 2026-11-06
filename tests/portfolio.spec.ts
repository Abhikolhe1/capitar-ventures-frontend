import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('capitar-motion', 'reduced'));
  await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
});

for (const reducedMotion of ['reduce', 'no-preference', null] as const) {
  test(`portfolio filters and card interaction with ${reducedMotion ?? 'system'} motion`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion });
    await page.setViewportSize({ width: 1440, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/portfolio');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      "The founders we've backed"
    );
    await expect(page.locator('.portfolio-grid > li')).toHaveCount(12);
    const card = page.locator('.portfolio-card').first();
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await expect(card).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el, '::after').opacity))
      .toBe('1');
    await page.mouse.move(0, 0);
    await card.getByRole('button').focus();
    await expect(card).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.getByLabel('Sector', { exact: true }).selectOption('D2C / B2C');
    await expect(page.locator('.portfolio-grid > li')).toHaveCount(4);
    await page.getByLabel('Stage at investment').selectOption('Pre Series A');
    await expect(page.getByText('No companies match these filters.')).toBeVisible();
    await page.getByRole('button', { name: 'View all companies' }).click();
    await expect(page.locator('.portfolio-grid > li')).toHaveCount(12);
    expect(
      await page
        .locator('.portfolio-card__logo')
        .evaluateAll((images) =>
          images.every((image) => (image as HTMLImageElement).naturalWidth > 0)
        )
    ).toBe(true);
    await page.locator('[data-case-header]').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Next case study', exact: true }).click();
    await expect(page.locator('#case-study [role="status"]')).toHaveText('mPokket');
    expect(errors).toEqual([]);
  });
}

test('phone layout supports tap highlight, filters and navigation', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem('capitar-motion', 'reduced'));
  await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/portfolio');
  const toggle = page.locator('.portfolio-card__toggle').first();
  await toggle.tap();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.portfolio-card').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page.getByLabel('Sector', { exact: true }).selectOption('D2C / B2C');
  await expect(page.locator('.portfolio-grid > li')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true
  );
  await page.getByRole('link', { name: 'Know more about venture debt' }).click();
  await expect(page).toHaveURL(/\/venture-debt$/);
  await context.close();
});

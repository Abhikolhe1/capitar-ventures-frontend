import { test, expect } from '@playwright/test';

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  for (const width of [390, 1440]) {
    test(`reveals run at ${width}px with ${reducedMotion} motion preference`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion });
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
      await expect(page.locator('[data-entrance="header"]')).toHaveCSS('opacity', '1');
      const marquee = page.getByRole('region', { name: 'Trusted clients' }).locator(':scope > div');
      await expect(marquee).toHaveCSS('animation-name', 'trusted-clients-scroll');
      const value = page.locator('[data-proof-value]').first();
      await expect(value).toHaveCSS('opacity', '0');
      await value.scrollIntoViewIfNeeded();
      await expect(value).toHaveCSS('opacity', '1');
      await expect(value).toHaveCSS('filter', 'none');
      const capital = page.locator('[data-capital-card]').first();
      await capital.scrollIntoViewIfNeeded();
      await expect(capital).toHaveCSS('opacity', '1');
      const caseHeader = page.locator('[data-case-header]');
      await caseHeader.scrollIntoViewIfNeeded();
      await expect(caseHeader).toHaveCSS('opacity', '1');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
}

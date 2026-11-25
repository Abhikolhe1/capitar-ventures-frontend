import { test, expect } from '@playwright/test';

for (const preference of ['no-preference', 'reduce', null] as const) {
  test(`footer card shares the actual background under OS ${preference ?? 'system'}`, async ({ page }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: preference });
    await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
    await page.goto('/portfolio', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20000 });
    const footer = page.locator('#site-footer');
    for (const width of [1441, 1024, 390]) {
      await page.setViewportSize({ width, height: 950 });
      await footer.scrollIntoViewIfNeeded();
      const panel = footer.locator('[data-footer-panel]');
      await expect(panel).toHaveAttribute('data-footer-shared-background', 'true');
      await expect(footer.locator('[data-footer-background="cta"]')).toHaveCount(0);
      await expect(footer.locator('video')).toHaveCount(width > 599 ? 1 : 0);
      await expect(footer.locator('[data-footer-cta]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      const geometry = await panel.evaluate(element => {
        const p = element.getBoundingClientRect();
        const c = element.querySelector('[data-footer-cta]')!.getBoundingClientRect();
        const mask = getComputedStyle(element, '::before').maskImage;
        const svg = decodeURIComponent(mask.slice(mask.indexOf(',') + 1, mask.lastIndexOf('"')));
        const rect = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('rect[rx]')!;
        return { x: c.x - p.x, y: c.y - p.y, width: c.width, height: c.height,
          hole: ['x', 'y', 'width', 'height'].map(key => Number(rect.getAttribute(key))) };
      });
      [geometry.x, geometry.y, geometry.width, geometry.height].forEach((value, i) => expect(geometry.hole[i]).toBeCloseTo(value, 1));
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      if (preference === null) await footer.screenshot({ path: `test-results/footer-shared-${width}.png` });
    }
  });
}

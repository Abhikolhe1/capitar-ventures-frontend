import { test, expect } from '@playwright/test';

for (const [width, preference] of [[320, 'no-preference'], [393, 'reduce'], [599, null]] as const) {
  test(`mobile footer matches Figma order at ${width}px with OS ${preference ?? 'system'}`, async ({ page, context }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: preference });
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
    await page.goto('/portfolio');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20000 });
    const footer = page.locator('#site-footer');
    await footer.scrollIntoViewIfNeeded();
    const geometry = await footer.evaluate(el => {
      const selectors = ['[data-footer-cta]', '[data-footer-brand]', 'address', '[data-footer-contact]', '[data-footer-links]', '[data-footer-ai-copy]', '[aria-label="Explore Capitar with AI"]', '[data-footer-legal]'];
      return {
        items: selectors.map(s => el.querySelector(s)!.getBoundingClientRect().toJSON()),
        panel: el.querySelector('[data-footer-panel]')!.getBoundingClientRect().toJSON(),
        marker: el.querySelector('[data-footer-links] li > div')!.getBoundingClientRect().toJSON(),
        link: el.querySelector('[data-footer-links] li > a')!.getBoundingClientRect().toJSON(),
        clipped: [...el.querySelectorAll('nav,p,address')].some(e => e.scrollWidth > e.clientWidth + 1),
      };
    });
    for (let i = 1; i < geometry.items.length; i++) {
      expect(geometry.items[i].top).toBeGreaterThanOrEqual(geometry.items[i - 1].bottom - 1);
    }
    expect(geometry.panel.x).toBe(10);
    expect(geometry.panel.width).toBe(width - 20);
    expect(geometry.marker.x).toBeLessThan(geometry.link.x);
    expect(geometry.clipped).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await expect(footer.locator('[data-footer-panel]')).toHaveAttribute('data-footer-shared-background', 'true');
    await expect(footer.locator('[data-footer-background="cta"]')).toHaveCount(0);
    for (const image of await footer.locator('img').all()) {
      await expect.poll(() => image.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
    }
    await footer.getByRole('button', { name: 'Copy email' }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/@/);
    await page.setViewportSize({ width: 1440, height: 950 });
    await expect(footer.locator('[data-footer-company]')).toHaveCSS('display', 'block');
    const desktop = await footer.locator('[data-footer-grid]').evaluate(e => getComputedStyle(e).gridTemplateColumns.split(' ').length);
    expect(desktop).toBe(3);
  });
}

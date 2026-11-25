import { test, expect } from '@playwright/test';

for (const preference of ['no-preference', 'reduce', null] as const) {
  test(`Difference enters earlier and retains its sticky position with OS ${preference ?? 'system'}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: preference });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20000 });
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#capitar-difference');
    const intro = section.locator('[data-difference-intro]');
    const heading = section.locator('h2');
    const first = section.locator('[data-difference-card]').first();
    const top = await section.evaluate(element => element.getBoundingClientRect().top + scrollY);
    await page.evaluate(y => scrollTo(0, y - 200), top);
    await expect(heading).toHaveCSS('opacity', '1');
    await expect(first.locator('h3')).toHaveCSS('opacity', '1');
    expect(await intro.evaluate(element => parseFloat(getComputedStyle(element).paddingTop))).toBe(80);
    expect((await first.boundingBox())!.y - (await section.boundingBox())!.y).toBeCloseTo(384.49, 0);
    await page.mouse.wheel(0, 300);
    await expect.poll(async () => (await intro.boundingBox())!.y).toBeCloseTo(85.5, 0);
    const pinnedHeading = (await heading.boundingBox())!.y;
    await page.mouse.wheel(0, 250);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(top + 200);
    expect((await heading.boundingBox())!.y).toBeCloseTo(pinnedHeading, 0);
    await page.mouse.wheel(0, -650);
    await expect.poll(async () => (await intro.boundingBox())!.y).toBeGreaterThan(100);
    await expect(heading).toHaveCSS('opacity', '1');
    if (preference === null) await page.screenshot({ path: 'test-results/difference-earlier-entry.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(intro).toHaveCSS('position', 'relative');
    await expect(intro).toHaveCSS('top', '0px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
}

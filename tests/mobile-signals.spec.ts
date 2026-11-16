import { test, expect } from '@playwright/test';

test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
});
for (const preference of ['reduce', 'no-preference', null] as const) {
  test(
    'mobile signals scroll through every matching image and back: ' + (preference ?? 'system'),
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: preference });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/venture-debt');
      await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
      const track = page.locator('.vd-signals-track'),
        panel = page.locator('.vd-signals-grid');
      await expect(track).toHaveAttribute('data-mobile-pinned', 'true', { timeout: 15_000 });
      await expect(panel).toHaveCSS('position', 'sticky');
      const start = await track.evaluate((el) => el.getBoundingClientRect().top + scrollY - 58);
      await page.evaluate((y) => scrollTo(0, y), start + 12);
      const seen = new Set<string>();
      for (let i = 0; i < 16; i++) {
        const index = await page.locator('.vd-pixel-reveal').getAttribute('data-pixel-index');
        seen.add(index!);
        const box = await page.locator('.vd-signal-art').boundingBox();
        expect(box!.y).toBeGreaterThanOrEqual(58);
        expect(box!.y + box!.height).toBeLessThanOrEqual(845);
        if (seen.size === 4) break;
        await page.mouse.wheel(0, 240);
        await page.waitForTimeout(200);
      }
      expect([...seen]).toEqual(['0', '1', '2', '3']);
      await expect(page.locator('#signal-3')).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#signal-panel-0')).toHaveCSS('visibility', 'hidden');
      await expect(page.locator('#signal-panel-3')).toHaveCSS('visibility', 'visible');
      await expect(page.locator('.vd-pixel-reveal > img')).toHaveCSS('opacity', '1');
      for (let i = 0; i < 16; i++) {
        if ((await page.locator('.vd-pixel-reveal').getAttribute('data-pixel-index')) === '0')
          break;
        await page.mouse.wheel(0, -240);
        await page.waitForTimeout(180);
      }
      await expect(page.locator('#signal-0')).toHaveAttribute('aria-expanded', 'true');
      // Let native wheel inertia finish before testing a separate tap interaction.
      await expect
        .poll(async () => {
          const before = await page.evaluate(() => scrollY);
          await page.waitForTimeout(300);
          return Math.abs((await page.evaluate(() => scrollY)) - before) < 1;
        })
        .toBe(true);
      await page.locator('#signal-2').click();
      await expect(page.locator('.vd-pixel-reveal')).toHaveAttribute('data-pixel-index', '2');
    }
  );
}
for (const [width, height] of [
  [320, 600],
  [390, 844],
  [768, 1024],
]) {
  test('mobile signals content and artwork fit ' + width + 'x' + height, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/venture-debt');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    const track = page.locator('.vd-signals-track');
    await expect(track).toHaveAttribute('data-mobile-pinned', 'true', { timeout: 15_000 });
    const top = await track.evaluate(
      (el) =>
        el.getBoundingClientRect().top +
        scrollY -
        parseFloat(getComputedStyle(el.firstElementChild!).top)
    );
    await page.evaluate((y) => scrollTo(0, y), top + 20);
    for (const selector of ['#signal-0', '#signal-3', '.vd-signal-art']) {
      const box = await page.locator(selector).boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(height + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true
    );
  });
}
test('short mobile keeps readable native flow and desktop retains its existing grid', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 568 });
  await page.goto('/venture-debt');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
  await expect(page.locator('.vd-signal-detail').first()).toHaveCSS('visibility', 'visible');
  await expect(page.locator('.vd-signals-grid')).not.toHaveCSS('position', 'sticky');
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.vd-signals-grid')).toHaveCSS('display', 'grid');
  await expect(page.locator('.vd-signals-grid')).toHaveCSS('position', 'sticky');
  await expect(page.locator('.vd-signals-grid')).toHaveCSS('top', '86px');
  await expect(page.locator('.vd-signals-track')).not.toHaveAttribute('data-mobile-pinned', 'true');
});

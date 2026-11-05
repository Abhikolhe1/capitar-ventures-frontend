import { test, expect } from '@playwright/test';
test.use({
  browserName: process.env.PIXEL_BROWSER === 'webkit' ? 'webkit' : 'chromium',
  channel: '',
});
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`fixed background and four foreground reveals at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
    await page.goto('/venture-debt');
    const background = page.locator('.vd-signal-background');
    const canvas = page.locator('.vd-pixel-reveal canvas');
    await page.locator('.vd-pixel-reveal').scrollIntoViewIfNeeded();
    for (const index of viewport.width < 900 ? [3] : [0, 1, 2, 3, 2, 1, 0]) {
      if (viewport.width < 900)
        await page
          .locator(`#signal-${index}`)
          .evaluate((button: HTMLButtonElement) => button.click());
      else await page.locator(`#signal-${index}`).click();
      await expect(page.locator('.vd-pixel-reveal')).toHaveAttribute(
        'data-pixel-index',
        String(index)
      );
      await expect(page.locator('.vd-pixel-reveal')).toHaveAttribute(
        'data-figma-art',
        String(index)
      );
      await expect(background).toHaveCSS('background-color', 'rgb(11, 15, 45)');
      await expect(background).toHaveCSS('opacity', '1');
      await expect
        .poll(() => page.locator('.vd-pixel-reveal').getAttribute('data-reveal-progress'))
        .toBe('1');
      await expect(page.locator('.vd-pixel-reveal img')).toHaveCSS('opacity', '1');
      expect(
        await page
          .locator('.vd-pixel-reveal img')
          .evaluate((i: HTMLImageElement) => i.naturalWidth > 0)
      ).toBe(true);
      const sizes = await page.locator('.vd-signal-art').evaluate((el) => {
        const bg = el.querySelector('.vd-signal-background')!.getBoundingClientRect();
        const art = el.querySelector('.vd-pixel-reveal')!.getBoundingClientRect();
        return {
          bg: bg.width,
          art: art.width,
          inCard:
            art.left >= bg.left - 1 &&
            art.right <= bg.right + 1 &&
            art.top >= bg.top - 1 &&
            art.bottom <= bg.bottom + 1,
        };
      });
      expect(sizes.inCard).toBe(true);
      await page.screenshot({ path: `test-results/layered-signal-${viewport.width}-${index}.png` });
    }
    // Mid-animation pixels contain real artwork while the background stays fixed.
    if (viewport.width < 900) {
      await page.evaluate(() => scrollTo(0, 0));
      await expect
        .poll(() => page.locator('.vd-pixel-reveal').getAttribute('data-reveal-progress'))
        .toBe('0');
      await page.locator('.vd-pixel-reveal').scrollIntoViewIfNeeded();
    } else await page.locator('#signal-1').evaluate((button: HTMLButtonElement) => button.click());
    await expect
      .poll(
        () =>
          canvas.evaluate((c: HTMLCanvasElement) => {
            const p = Number(c.parentElement!.dataset.revealProgress);
            if (p <= 0 || p >= 1) return false;
            return c
              .getContext('2d')!
              .getImageData(0, 0, c.width, c.height)
              .data.some((v, i) => i % 4 === 3 && v > 0);
          }),
        { intervals: [30] }
      )
      .toBe(true);
    await expect(background).toHaveCSS('opacity', '1');
  });
}

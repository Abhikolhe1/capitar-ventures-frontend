import { test, expect } from '@playwright/test';

test('signal image pixel reveal completes and replays on selection', async ({ page }) => {
  await page.route('**/api/venture-debt', (route) =>
    route.fulfill({
      json: {
        data: { before: { image: { url: '/uploads/venture_debt_ab23b_52fba65e75.png' } } },
      },
    })
  );
  await page.route('**/api/homepage', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/venture-debt');
  await expect(page.locator('.vd-pixel-reveal img')).toHaveAttribute('src', /signal-shield\.png$/);
  await expect
    .poll(() =>
      page.locator('.vd-pixel-reveal img').evaluate((node) => {
        const image = node as HTMLImageElement;
        return image.naturalWidth > 0 && image.naturalHeight > 0;
      })
    )
    .toBe(true);
  await page.locator('#signal-1').click();
  const canvas = page.locator('.vd-pixel-reveal canvas');
  await expect(page.locator('.vd-pixel-reveal')).toHaveAttribute('data-pixel-index', '1');
  await expect
    .poll(() =>
      canvas.evaluate((node) => {
        const c = node as HTMLCanvasElement;
        return c
          .getContext('2d')!
          .getImageData(0, 0, c.width, c.height)
          .data.some((v, i) => i % 4 === 3 && v > 0);
      })
    )
    .toBe(false);
  await page.locator('#signal-2').click();
  await expect(page.locator('.vd-pixel-reveal')).toHaveAttribute('data-pixel-index', '2');
  await expect(page.locator('.vd-signal-number')).toHaveCount(0);
  await expect(page.locator('.vd-signal-glow')).toHaveCount(0);
  await expect
    .poll(() => canvas.evaluate((node) => (node as HTMLCanvasElement).width))
    .toBeGreaterThan(0);
});

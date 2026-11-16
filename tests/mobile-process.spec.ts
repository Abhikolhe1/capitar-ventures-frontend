import { test, expect } from '@playwright/test';

test.setTimeout(60_000);
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
});

for (const preference of ['reduce', 'no-preference', null] as const) {
  test(`mobile process advances and reverses with OS ${preference ?? 'system'}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: preference });
    await page.goto('/venture-debt');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    const track = page.locator('.vd-process-track');
    await expect(track).toHaveAttribute('data-mobile-pinned', 'true');
    await expect(page.locator('.vd-process-grid')).toHaveCSS('position', 'sticky');
    await track.evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY - 46));
    const seen = new Set<string>();
    for (let i = 0; i < 18; i++) {
      seen.add((await page.locator('.vd-step[data-active="true"] button').getAttribute('id'))!);
      for (const selector of ['#vd-process-title', '#step-0', '#step-3']) {
        const box = await page.locator(selector).boundingBox();
        expect(box!.y).toBeGreaterThanOrEqual(58);
        expect(box!.y + box!.height).toBeLessThanOrEqual(845);
      }
      if (seen.size === 4) break;
      await page.mouse.wheel(0, 240);
      await page.waitForTimeout(250);
    }
    expect([...seen]).toEqual(['step-0', 'step-1', 'step-2', 'step-3']);
    await expect(page.locator('#step-panel-0')).toHaveCSS('visibility', 'hidden');
    await expect(page.locator('#step-panel-3')).toHaveCSS('visibility', 'visible');
    for (let i = 0; i < 18; i++) {
      if ((await page.locator('#step-0').getAttribute('aria-expanded')) === 'true') break;
      await page.mouse.wheel(0, -240);
      await page.waitForTimeout(250);
    }
    await expect(page.locator('#step-0')).toHaveAttribute('aria-expanded', 'true');
  });
}

for (const [width, height] of [[320, 600], [390, 844], [768, 1024]]) {
  test(`process fits one screen at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/venture-debt');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    const track = page.locator('.vd-process-track');
    await expect(track).toHaveAttribute('data-mobile-pinned', 'true');
    await track.evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(el.firstElementChild!).top) + 12));
    for (const selector of ['#vd-process-title', '#step-0', '#step-3', '#step-panel-0 .vd-step-description']) {
      const box = await page.locator(selector).boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(height + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

for (const height of [568, 844]) {
  test(`inactive process descriptions stay collapsed at 390x${height}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height });
    await page.goto('/venture-debt');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    for (const index of [0, 1, 2, 3, 0]) {
      if (height >= 600) {
        await page.locator(`#step-${index}`).click();
      } else {
        await page.locator(`#step-${index}`).evaluate((el) => scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * 0.5));
      }
      await expect(page.locator(`#step-${index}`)).toHaveAttribute('aria-expanded', 'true');
      const inactive = page.locator('.vd-step:not([data-active="true"]) .vd-step-detail');
      await expect(inactive).toHaveCount(3);
      for (const detail of await inactive.all()) {
        await expect(detail).toHaveCSS('visibility', 'hidden');
        expect((await detail.boundingBox())!.height).toBe(0);
      }
      await expect(page.locator(`#step-panel-${index}`)).toHaveCSS('visibility', 'visible');
    }
  });
}

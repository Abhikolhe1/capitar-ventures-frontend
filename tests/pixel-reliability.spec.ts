import { test, expect } from '@playwright/test';

async function coverage(page: import('@playwright/test').Page) {
  return page
    .locator('.vd-pixel-reveal')
    .evaluate((el) => 1 - Number((el as HTMLElement).dataset.revealProgress || 0));
}

const browserName = process.env.PIXEL_BROWSER === 'webkit' ? 'webkit' : 'chromium';
test.use({
  browserName,
  channel: '',
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true,
  reducedMotion: 'no-preference',
});
test.describe(browserName, () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
  });

  for (const [width, height] of [
    [375, 667],
    [390, 844],
    [360, 800],
    [768, 1024],
    [800, 360],
    [1920, 1080],
  ]) {
    test(`visible reveal, replay and orientation at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('/venture-debt');
      const image = page.locator('.vd-pixel-reveal img');
      await expect
        .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth > 0), {
          timeout: 20000,
        })
        .toBe(true);
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => coverage(page)).toBe(0);
      // Leave and return: the same card must animate again on reverse scroll.
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await expect.poll(() => coverage(page)).toBeGreaterThan(0.98);
      // Sample inside the browser from the moment scrolling begins. An
      // automation scroll can otherwise return after the short reveal ends.
      const replayed = await image.evaluate(async (img) => {
        img.scrollIntoView({ block: 'center', behavior: 'instant' });
        const c = img.parentElement!.querySelector('canvas')!;
        const start = performance.now();
        while (performance.now() - start < 1800) {
          const progress = Number(c.parentElement!.dataset.revealProgress || 0);
          if (progress > 0 && progress < 1) return true;
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
        return false;
      });
      expect(replayed).toBe(true);
      await expect.poll(() => coverage(page)).toBe(0);
      await page.setViewportSize({ width: height, height: width });
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => coverage(page)).toBe(0);
      const dimensions = await page
        .locator('.vd-pixel-reveal canvas')
        .evaluate((c: HTMLCanvasElement) => ({
          width: c.width,
          expected: Math.round(c.clientWidth * Math.min(devicePixelRatio, 2)),
        }));
      expect(dimensions.width).toBe(dimensions.expected);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true
      );
      expect(errors).toEqual([]);
    });
  }

  test('delayed image still receives its full reveal', async ({ page }) => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/signal-shield.png', async (route) => {
      await held;
      await route.continue();
    });
    await page.goto('/venture-debt', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
    await page.locator('.vd-pixel-reveal').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1300);
    expect(await coverage(page)).toBeGreaterThan(0.98);
    release();
    await expect
      .poll(() =>
        page
          .locator('.vd-pixel-reveal img')
          .evaluate((img: HTMLImageElement) => img.naturalWidth > 0)
      )
      .toBe(true);
    await expect
      .poll(
        async () => {
          const c = await coverage(page);
          return c > 0 && c < 0.98;
        },
        { intervals: [30] }
      )
      .toBe(true);
    await expect.poll(() => coverage(page)).toBe(0);
  });

  test('OS motion preferences still reveal the complete foreground', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/venture-debt');
    await page.locator('.vd-pixel-reveal').scrollIntoViewIfNeeded();
    await expect.poll(() => coverage(page)).toBe(0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect.poll(() => coverage(page)).toBe(0);
  });

  test('missing visibility API leaves the image unobscured', async ({ page }) => {
    // Remove it only for this component after other page initialization.
    await page.goto('/venture-debt');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('#signal-1')).toBeAttached();
    await page.evaluate(() => {
      Object.defineProperty(window, 'IntersectionObserver', {
        value: undefined,
        configurable: true,
      });
    });
    await page.locator('#signal-1').click();
    await expect(page.locator('.vd-pixel-reveal')).toHaveAttribute('data-pixel-index', '1');
    await expect.poll(() => coverage(page)).toBe(0);
  });

  if (browserName === 'chromium') {
    test('slower CPU and rapid selection do not leave a covered card', async ({
      page,
      context,
    }) => {
      const session = await context.newCDPSession(page);
      await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.goto('/venture-debt');
      await page.locator('.vd-pixel-reveal').scrollIntoViewIfNeeded();
      for (const index of [1, 3, 2, 0]) await page.locator(`#signal-${index}`).click();
      await expect(page.locator('.vd-pixel-reveal')).toHaveAttribute('data-pixel-index', '0');
      await expect.poll(() => coverage(page), { timeout: 10000 }).toBe(0);
      await session.detach();
    });
  }
});

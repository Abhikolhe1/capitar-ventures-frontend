import { test, expect } from '@playwright/test';

test('touch layout keeps native scrolling and animates selected cards', async ({
  browser,
  browserName,
  baseURL,
}) => {
  test.skip(browserName === 'firefox', 'Firefox does not support mobile context emulation.');
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    await page.goto('/venture-debt');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await page.locator('#signal-2').tap();
    await expect(page.locator('.vd-pixel-reveal')).toHaveAttribute('data-pixel-index', '2');
    await page.locator('.vd-pixel-reveal').scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.locator('.vd-pixel-reveal canvas').evaluate(
          (canvas: HTMLCanvasElement) =>
            canvas.width > 0 &&
            !canvas
              .getContext('2d')!
              .getImageData(0, 0, canvas.width, canvas.height)
              .data.some((value, i) => i % 4 === 3 && value > 0)
        )
      )
      .toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  } finally {
    await context.close();
  }
});

for (const size of [
  { width: 390, height: 844 },
  { width: 1366, height: 600 },
  { width: 1440, height: 730 },
]) {
  test(`OS reduced motion does not disable site effects at ${size.width}x${size.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const draw = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (...args) {
        if (this.canvas.closest('.vd-pixel-reveal') && this.globalAlpha > 0 && this.globalAlpha < 1)
          this.canvas.dataset.animated = 'true';
        return draw.apply(this, args);
      };
    });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/venture-debt');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
      true
    );
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
    await page.locator('.vd-pixel-reveal').scrollIntoViewIfNeeded();
    await expect(page.locator('.vd-pixel-reveal canvas')).toHaveAttribute('data-animated', 'true');
    await expect
      .poll(() =>
        page.locator('.vd-pixel-reveal canvas').evaluate(
          (c: HTMLCanvasElement) =>
            !c
              .getContext('2d')!
              .getImageData(0, 0, c.width, c.height)
              .data.some((value, i) => i % 4 === 3 && value > 0)
        )
      )
      .toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    expect(errors).toEqual([]);
  });
}

test('real system preference and native wheel input retain pinned animations', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 730 });
  // null removes Playwright's default no-preference override.
  await page.emulateMedia({ reducedMotion: null });
  await page.goto('/venture-debt');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('.vd-signals-grid')).toHaveCSS('position', 'sticky');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  const geometry = await page.locator('.vd-signals-track').evaluate((track) => {
    const panel = track.firstElementChild as HTMLElement;
    return {
      start: scrollY + track.getBoundingClientRect().top - parseFloat(getComputedStyle(panel).top),
      distance: (track as HTMLElement).offsetHeight - panel.offsetHeight,
    };
  });
  await page.mouse.move(1200, 400);
  await page.mouse.wheel(0, geometry.start + geometry.distance * 0.85);
  await expect(page.locator('#signal-3')).toHaveAttribute('aria-expanded', 'true');
  const imageRevealed = () =>
    page.locator('.vd-pixel-reveal canvas').evaluate(
      (canvas: HTMLCanvasElement) =>
        canvas.width > 0 &&
        !canvas
          .getContext('2d')!
          .getImageData(0, 0, canvas.width, canvas.height)
          .data.some((value, i) => i % 4 === 3 && value > 0)
    );
  await expect.poll(imageRevealed).toBe(true);
  await page.mouse.wheel(0, -geometry.distance * 0.7);
  await expect(page.locator('#signal-0')).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(imageRevealed).toBe(true);
});

test('saved reduction is ignored and motion toggle is absent', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('capitar-motion', 'reduced'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 730 });
  await page.goto('/venture-debt');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await expect(page.locator('.vd-signals-grid')).toHaveCSS('position', 'sticky');
  await expect(page.getByRole('button', { name: /^(Reduce|Enable) animations$/ })).toHaveCount(0);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
});

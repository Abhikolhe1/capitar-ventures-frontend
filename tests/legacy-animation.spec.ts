import { test, expect } from '@playwright/test';

test.use({
  browserName: process.env.PIXEL_BROWSER === 'webkit' ? 'webkit' : 'chromium',
  channel: '',
});

test('older browser APIs still boot, scroll through signals, and animate the card', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'ResizeObserver', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    delete (window as unknown as Record<string, unknown>).IntersectionObserver;
    delete (window as unknown as Record<string, unknown>).IntersectionObserverEntry;
    const match = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      const media = match(query);
      Object.defineProperty(media, 'addEventListener', { value: undefined, configurable: true });
      Object.defineProperty(media, 'removeEventListener', { value: undefined, configurable: true });
      if (query.includes('prefers-reduced-motion'))
        Object.defineProperty(media, 'matches', { value: false });
      return media;
    };
    const scroll = window.scroll.bind(window);
    window.scroll = window.scrollTo = ((x: number, y: number) => {
      if (typeof x === 'object') throw new Error('Old browser does not support scroll options');
      scroll(x, y);
    }) as typeof window.scroll;
    Object.defineProperty(window, '__forceSmoothScrollPolyfill__', { value: true });
    // Count drawn intermediate frames without relying on automation timing.
    const paint = CanvasRenderingContext2D.prototype.fillRect;
    CanvasRenderingContext2D.prototype.fillRect = function (...args) {
      if (this.canvas.closest('.vd-pixel-reveal') && this.globalAlpha > 0 && this.globalAlpha < 1)
        this.canvas.dataset.animated = 'true';
      return paint.apply(this, args);
    };
  });
  await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
  if (process.env.PIXEL_LEGACY_BUNDLE) {
    // Exercise the actual compiled SystemJS/legacy entry on a current engine.
    // This checks bundle loading, not an emulation of an old JS parser.
    await page.route('**/venture-debt', async (route) => {
      if (route.request().resourceType() !== 'document') return route.fallback();
      const response = await route.fetch();
      const html = (await response.text())
        .replace(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g, '')
        .replace(/\snomodule\b/g, '');
      await route.fulfill({ response, body: html });
    });
  }
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/venture-debt');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20000 });
  expect(
    await page.evaluate(
      () => typeof ResizeObserver === 'function' && typeof IntersectionObserver === 'function'
    )
  ).toBe(true);
  expect(
    await page.evaluate(() => matchMedia('(prefers-reduced-motion: no-preference)').matches)
  ).toBe(true);
  for (const index of [0, 1, 3, 2]) {
    await page.locator('.vd-signals-track').evaluate((track, selected) => {
      const panel = track.firstElementChild as HTMLElement;
      scrollTo(
        0,
        scrollY +
          track.getBoundingClientRect().top -
          parseFloat(getComputedStyle(panel).top) +
          (((track as HTMLElement).offsetHeight - panel.offsetHeight) * (selected + 0.4)) / 4
      );
    }, index);
    await expect(page.locator('.vd-pixel-reveal')).toHaveAttribute(
      'data-pixel-index',
      String(index)
    );
    await expect(page.locator('.vd-pixel-reveal canvas')).toHaveAttribute('data-animated', 'true');
  }
  const size = await page.locator('.vd-signal-art').boundingBox();
  expect(size!.height).toBeGreaterThan(100);
  expect(errors).toEqual([]);
});

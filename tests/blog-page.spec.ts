import { test, expect } from '@playwright/test';

for (const [width, height, preference] of [[1440, 900, 'no-preference'], [1366, 600, 'reduce'], [768, 1024, null], [390, 844, 'reduce'], [320, 740, 'no-preference']] as const) {
  test(`public blog layout ${width}x${height}, OS ${preference ?? 'system'}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: preference });
    await page.addInitScript(() => localStorage.setItem('capitar-motion', 'reduced'));
    await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/blog');
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Insights, ideas and');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.locator('h1').evaluate(e => +getComputedStyle(e).opacity)).toBe(1);
    const hero = await page.locator('#blog-hero').boundingBox();
    expect(hero!.y).toBe(0);
    expect(hero!.height).toBeGreaterThanOrEqual(height);
    expect(hero!.height).toBeLessThanOrEqual(height + 1);
    expect(await page.locator('#blog-featured').evaluate(e => e.getBoundingClientRect().top)).toBeGreaterThanOrEqual(height);
    if (width >= 900) await expect(page.locator('h1')).toHaveCSS('font-size', '72px');
    await page.screenshot({ path: `test-results/blog-${width}-hero.png` });
    const sections = page.locator('main > section');
    await expect(sections).toHaveCount(4);
    await expect(page.locator('.blog-card')).toHaveCount(9);
    await expect.poll(() => page.locator('.blog-hero__content').evaluate(e => +getComputedStyle(e).opacity)).toBe(1);
    for (const target of ['.blog-feature', '.blog-card', '.blog-newsletter']) {
      await page.locator(target).first().scrollIntoViewIfNeeded();
      const reveal = target === '.blog-newsletter' ? '.blog-newsletter__content' : target;
      await expect.poll(() => page.locator(reveal).first().evaluate(e => +getComputedStyle(e).opacity)).toBe(1);
      await page.screenshot({ path: `test-results/blog-${width}-${target.slice(1)}.png` });
    }
    const geometry = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      columns: getComputedStyle(document.querySelector('.blog-grid')!).gridTemplateColumns.split(' ').length,
      clipped: [...document.querySelectorAll('.blog-card')].some(card => {
        const copy = card.querySelector('.blog-card__copy')!.getBoundingClientRect();
        const image = card.querySelector('.blog-card__media')!.getBoundingClientRect();
        return copy.bottom > image.top + 1 || image.bottom > card.getBoundingClientRect().bottom - 5 || card.scrollWidth > card.clientWidth + 1;
      }),
    }));
    expect(geometry.width).toBe(width);
    expect(geometry.columns).toBe(width < 600 ? 1 : width < 900 ? 2 : 3);
    expect(geometry.clipped).toBe(false);
    for (const image of await page.locator('main img').all()) {
      if (await image.getAttribute('loading') === 'lazy') await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
    }
    await expect(page.locator('#site-footer')).toBeAttached();
    expect(errors).toEqual([]);
  });
}

test('categories, sorting and failed subscription stay honest and usable', async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/blog');
  await page.getByRole('button', { name: 'Growth', exact: true }).click();
  await expect(page.getByText('No articles in this category yet.')).toBeVisible();
  await expect(page.locator('.blog-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Transformation', exact: true }).click();
  await expect(page.locator('.blog-feature')).toBeAttached();
  await page.getByRole('button', { name: 'View all posts' }).click();
  await expect(page.locator('.blog-card')).toHaveCount(9);
  await page.getByRole('combobox', { name: 'Sort articles', exact: true }).click();
  await page.getByRole('option', { name: 'Oldest first', exact: true }).click();
  await expect(page.locator('.blog-card')).toHaveCount(9);
  await expect(page.getByRole('button', { name: 'Next page' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Known More' })).toBeDisabled();
  await page.getByRole('textbox', { name: 'Email address' }).fill('reader@example.com');
  await page.getByRole('button', { name: 'Subscribe', exact: true }).click();
  await expect(page.locator('.blog-subscribe__status')).toHaveText('We could not subscribe you right now. Please try again later.');
  await expect(page.locator('.blog-subscribe__status')).not.toContainText('Thank you');
  await expect(page.locator('header a[href="/blog"]').first()).toHaveText('News & Insights');
});

test('wheel/reverse reveals and failed media retain readable content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: null });
  await page.route('**/assets/blog/**', route => route.abort());
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/blog');
  await expect(page.locator('.blog-feature')).toBeAttached();
  await page.mouse.wheel(0, 1000);
  await expect.poll(() => page.locator('.blog-feature').evaluate(e => +getComputedStyle(e).opacity)).toBe(1);
  await page.mouse.wheel(0, 1000);
  await expect.poll(() => page.locator('.blog-card').nth(3).evaluate(e => +getComputedStyle(e).opacity)).toBe(1);
  await page.mouse.wheel(0, -1000);
  await expect.poll(() => page.locator('.blog-feature').evaluate(e => +getComputedStyle(e).opacity)).toBe(1);
  await expect(page.locator('.blog-feature h2')).toBeVisible();
  await page.locator('#blog-newsletter').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.blog-newsletter__content').evaluate(e => +getComputedStyle(e).opacity)).toBe(1);
  await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
});

test('touch scrolling and category selection stay native without storage', async ({ browser, browserName, baseURL }) => {
  test.skip(browserName === 'firefox', 'Firefox does not support mobile context emulation.');
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } }); });
    await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
    await page.goto('/blog');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await page.getByRole('button', { name: 'Growth', exact: true }).tap();
    await expect(page.locator('.blog-empty')).toBeVisible();
    await page.getByRole('button', { name: 'View all posts' }).tap();
    await expect(page.locator('.blog-card')).toHaveCount(9);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  } finally { await context.close(); }
});

import { test, expect } from '@playwright/test';

test('local seeded CMS supplies the blog and uploaded source images', async ({ page }) => {
  test.skip(process.env.BLOG_LIVE_CMS !== 'true', 'Opt in with the seeded local CMS running on the configured origin.');
  const response = page.waitForResponse(r => r.url().includes('/api/blog-articles?') && r.status() === 200);
  await page.goto('/blog');
  const articles = (await (await response).json()).data;
  await expect(page.locator('.blog-card')).toHaveCount(articles.length);
  await expect(page.locator('.blog-hero image')).toHaveAttribute('href', /\/uploads\/blog_hero_arcs_/);
  await expect(page.locator('.blog-feature__image')).toHaveAttribute('src', /\/uploads\/blog_featured_architecture_/);
  await page.locator('.blog-card').first().scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.blog-card__image').first().evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
  await page.locator('.blog-newsletter').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.blog-newsletter__art').evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
});

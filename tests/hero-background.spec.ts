import { test, expect } from '@playwright/test';

test('original video plays and background fills wide desktop viewports', async ({ page }) => {
  for (const [width, height] of [[1920, 1080], [2560, 1440]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
    const video = page.locator('video');
    await expect(video).toBeVisible();
    await page.waitForFunction(() => {
      const video = document.querySelector('video');
      return video && !video.paused && video.readyState >= 2 && video.currentTime > 0.1;
    });
    const state = await video.evaluate(video => {
      const bounds = video.getBoundingClientRect();
      const section = video.closest('section')!.getBoundingClientRect();
      return { duration: video.duration, time: video.currentTime, muted: video.muted, loop: video.loop, left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, sectionLeft: section.left, sectionWidth: section.width, scrollWidth: document.documentElement.scrollWidth };
    });
    expect(state.duration).toBeCloseTo(4.064, 1);
    expect(state.muted).toBeTruthy();
    expect(state.loop).toBeTruthy();
    expect(state.sectionLeft).toBe(0);
    expect(state.sectionWidth).toBe(width);
    expect(state.left).toBeLessThanOrEqual(0);
    expect(state.right).toBeGreaterThanOrEqual(width);
    expect(state.top).toBeLessThanOrEqual(0);
    expect(state.bottom).toBeGreaterThanOrEqual(height);
    expect(state.scrollWidth).toBe(width);
    await expect(page.locator('[data-entrance="header"]')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: `test-results/hero-background-${width}.png` });
    const before = await video.evaluate(video => video.currentTime);
    await page.waitForTimeout(300);
    expect(await video.evaluate(video => video.currentTime)).not.toBe(before);
  }
});

test('CMS video failure falls back to the original local clip and keeps looping', async ({ page }) => {
  await page.route('**/uploads/*.mp4', route => route.abort());
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  const video = page.locator('video');
  await expect(video).toHaveAttribute('src', '/assets/capitar/hero.mp4');
  await page.waitForFunction(() => {
    const video = document.querySelector('video');
    return video && !video.paused && video.readyState >= 2 && video.currentTime > 0.1;
  });
  await video.evaluate(video => { video.currentTime = video.duration - 0.2; });
  await page.waitForFunction(() => {
    const video = document.querySelector('video');
    return video && !video.paused && video.currentTime < 1;
  });
  expect(await video.evaluate(video => video.muted && video.defaultMuted)).toBeTruthy();
});

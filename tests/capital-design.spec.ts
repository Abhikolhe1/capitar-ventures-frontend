import { test, expect } from '@playwright/test';

test('Capital Efficiency preserves Figma card dimensions independently of desktop viewport height', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  for (const [width, height] of [[1441, 950], [1366, 768], [1280, 720], [1024, 600], [900, 600], [1280, 500], [393, 852]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#capital-efficiency');
    await section.scrollIntoViewIfNeeded();
    const metrics = await section.evaluate(el => {
      const bounds = el.getBoundingClientRect();
      const grid = el.querySelector('[data-capital-grid]')!.getBoundingClientRect();
      const outside = [...el.querySelectorAll('article,h2,h3,p')].filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1 || node.scrollWidth > node.clientWidth + 1;
      }).map(node => node.textContent);
      const title = getComputedStyle(el.querySelector('h3')!);
      return { height: bounds.height, gridHeight: grid.height, titleSize: title.fontSize, titleLine: title.lineHeight, outside };
    });
    expect(metrics.outside, `${width}x${height}`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    if (width >= 900) {
      expect(metrics.height).toBeGreaterThanOrEqual(950);
      expect(metrics.gridHeight).toBeCloseTo(564, 0);
      expect(metrics.titleSize).toBe('30px');
    }
    if (width === 1441) {
      expect(metrics.gridHeight).toBeCloseTo(564, 0);
      expect(metrics.titleSize).toBe('30px');
      expect(metrics.titleLine).toBe('30px');
    }
    if (width === 393) {
      expect(metrics.titleSize).toBe('20px');
      expect(metrics.titleLine).toBe('20px');
      await expect(section.locator('picture source[srcset*=runway]')).toHaveAttribute('srcset', '/assets/capitar/capital-runway-mobile.png');
    }
    await section.locator('img').evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode().catch(() => {}))));
    if (width === 1441 || width === 393) await section.screenshot({ path: `test-results/capital-design-${width}.png` });
  }
});

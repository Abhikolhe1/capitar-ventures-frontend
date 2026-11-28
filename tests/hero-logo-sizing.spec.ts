import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const fallback = JSON.parse(readFileSync(new URL('../src/content/homepage.json', import.meta.url), 'utf8'));

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`CMS logo dimensions grow without overlap at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: null });
    await page.route('**/api/global', route => route.fulfill({ json: { data: fallback.global } }));
    let size = { width: 120, height: 40 };
    await page.route('**/api/homepage', route => route.fulfill({ json: { data: {
      hero: {
        ...fallback.hero,
        trustedClients: ['First', 'Second', 'Third'].map(name => ({
          name, ...size,
          logo: { url: new URL('/assets/capitar/qubehealth.png', page.url()).href },
        })),
      },
    } } }));

    const scale = viewport.width < 600 ? 0.7 : 1;
    const region = page.getByRole('region', { name: 'Trusted clients' });
    const logo = region.locator('img').first();
    for (size of [{ width: 120, height: 40 }, { width: 240, height: 80 }, { width: 330, height: 110 }]) {
      await page.goto('/');
      await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
      await expect(logo).toHaveCSS('width', `${Number((size.width * scale).toFixed(3))}px`);
      await expect(logo).toHaveCSS('height', `${Number((size.height * scale).toFixed(3))}px`);
      expect(await logo.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      const geometry = await region.evaluate(el => {
        const groups = [...el.querySelectorAll('ul')].map(group => group.getBoundingClientRect());
        const images = [...el.querySelectorAll('ul:first-child img')].map(img => img.getBoundingClientRect());
        return {
          widths: groups.map(group => group.width),
          viewportWidth: el.getBoundingClientRect().width,
          gap: groups[1].left - groups[0].right,
          overlaps: images.slice(1).some((image, i) => image.left < images[i].right),
          pageWidth: document.documentElement.scrollWidth,
        };
      });
      expect(geometry.widths[0]).toBeCloseTo(geometry.widths[1], 1);
      expect(geometry.widths[0]).toBeGreaterThanOrEqual(geometry.viewportWidth - 1);
      expect(geometry.gap).toBeCloseTo(0, 1);
      expect(geometry.overlaps).toBe(false);
      expect(geometry.pageWidth).toBe(viewport.width);
    }
    await page.screenshot({ path: `test-results/hero-logo-sizing-${viewport.width}.png` });
  });
}

import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const fallback = JSON.parse(readFileSync(new URL('../src/content/about-us.json', import.meta.url), 'utf8'));

for (const width of [1440, 390]) {
  for (const reducedMotion of ['reduce', 'no-preference', null] as const) {
    test(`CMS portraits fit after fallback replacement and scroll, ${width}, ${reducedMotion}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion });
      await page.addInitScript(() => localStorage.setItem('capitar-motion', 'reduced'));
      await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
      await page.route('**/api/about-us', async route => {
        // Let the fallback's inline portrait crops render before replacing them.
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.fulfill({ json: { data: {
          ...fallback,
          people: { ...fallback.people, team: fallback.people.team.map((member: object, index: number) => ({
            ...member, name: `CMS member ${index + 1}`, image: { url: new URL('/assets/about/bikramjit-source.png', page.url()).href },
          })) },
        } } });
      });
      await page.goto('/about-us');
      await expect(page.getByText('CMS member 1', { exact: true })).toBeVisible();
      const images = page.locator('.about-team-crop img[data-cms-portrait]');
      await expect(images).toHaveCount(9);
      await expect(page.locator('.about-team-card').first()).toHaveCSS('background-color', 'rgb(237, 244, 249)');
      await expect(page.locator('.about-team-light')).toHaveCount(0);
      for (const image of await images.all()) {
        await image.locator('..').locator('..').scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
        await expect(image).toHaveCSS('object-fit', 'cover');
        const sizes = await image.evaluate(element => {
          const picture = element.getBoundingClientRect(), frame = element.parentElement!.getBoundingClientRect();
          return {
            width: picture.width / frame.width,
            height: picture.height / frame.height,
            left: (picture.left - frame.left) / frame.width,
            bottom: Math.abs(picture.bottom - frame.bottom),
          };
        });
        expect(sizes.width).toBeCloseTo(0.87, 2);
        expect(sizes.height).toBeCloseTo(0.87, 2);
        expect(sizes.left).toBeCloseTo(0.065, 2);
        expect(sizes.bottom).toBeLessThan(1);
      }
      await expect(images.first()).toHaveAttribute('alt', /CMS member 1, .*Capitar Ventures/);
      await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
    });
  }
}

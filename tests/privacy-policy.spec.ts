import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const defaults = JSON.parse(fs.readFileSync(new URL('../src/content/privacy-policy.json', import.meta.url), 'utf8'));
const screenshots = path.resolve('../scratch/privacy-review');
fs.mkdirSync(screenshots, { recursive: true });

for (const [width, preference] of [[1440, 'no-preference'], [390, 'reduce'], [320, null], [768, 'no-preference']] as const) {
  test(`privacy remains readable at ${width}px with ${preference ?? 'system'} motion`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: preference });
    await page.addInitScript(() => localStorage.setItem('capitar-motion', 'reduced'));
    await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
    await page.goto('/privacy-policy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy', exact: true })).toBeVisible();
    await expect(page.locator('.privacy-sections h2')).toHaveCount(10);
    await expect(page.locator('.privacy-sections')).toContainText(defaults.sections[9].blocks[0].items[0]);
    const image = page.locator('.privacy-illustration');
    await expect.poll(() => image.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
    const footer = page.locator('#site-footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.locator('[data-footer-registration]')).toContainText('INP000010308');
    await expect(footer.getByRole('link', { name: 'PRIVACY', exact: true })).toHaveAttribute('href', '/privacy-policy');
    const geometry = await footer.evaluate(el => {
      const registration = el.querySelector('[data-footer-registration]')!.getBoundingClientRect();
      const shortcuts = el.querySelector('[aria-label="Explore Capitar with AI"]')!.getBoundingClientRect();
      const legal = el.querySelector('[data-footer-legal]')!.getBoundingClientRect();
      const panel = el.querySelector('[data-footer-panel]')!.getBoundingClientRect();
      return { registration: registration.toJSON(), shortcuts: shortcuts.toJSON(), legal: legal.toJSON(), panel: panel.toJSON() };
    });
    expect(geometry.registration.top).toBeGreaterThanOrEqual(geometry.shortcuts.bottom);
    expect(geometry.registration.bottom).toBeLessThanOrEqual(geometry.legal.top);
    expect(geometry.registration.right).toBeLessThanOrEqual(geometry.panel.right);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path: path.join(screenshots, `privacy-${width}-footer.png`) });
    if (width === 1440) {
      await page.screenshot({ path: path.join(screenshots, 'privacy-desktop-full.png'), fullPage: true });
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page.locator('header')).toHaveAttribute('data-scroll-hidden', 'false');
      await expect(page.locator('header')).toHaveCSS('opacity', '1');
      await page.screenshot({ path: path.join(screenshots, 'privacy-desktop-top.png') });
    }
    await footer.getByRole('link', { name: 'PRIVACY', exact: true }).click();
    await expect(page).toHaveURL(/\/privacy-policy$/);
  });
}

test('published CMS copy, illustration and registration fields reach the page', async ({ page, baseURL }) => {
  const home = JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json', import.meta.url), 'utf8'));
  const origin = new URL(baseURL || 'http://localhost:3045').origin;
  // Absolute frontend URLs keep mocked CMS media on this test's local origin.
  const absolutize = (value: any): any => Array.isArray(value) ? value.map(absolutize) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).map(([k,v]) => [k, k === 'url' && typeof v === 'string' ? new URL(v, origin).href : absolutize(v)])) : value;
  const global = absolutize(home.global);
  global.footer.registrationLabel = 'Updated SEBI label';
  global.footer.registrationDetails = 'CMS registration line';
  await page.route('**/api/global', route => route.fulfill({ json: { data: global } }));
  await page.route('**/api/homepage', route => route.fulfill({ json: { data: home } }));
  await page.route('**/api/privacy-policy', route => route.fulfill({ json: { data: {
    title: 'CMS Privacy Policy', illustration: { url: `${origin}${defaults.illustration}`, alternativeText: 'CMS illustration' },
    sections: [{ heading: 'CMS section', blocks: [{ type: 'paragraph', children: [{ type: 'text', text: '<script>plain text</script>' }] },
      { type: 'list', format: 'unordered', children: [{ type: 'list-item', children: [{ type: 'text', text: 'CMS list item' }] }] }] }],
  } } }));
  await page.goto('/privacy-policy');
  await expect(page.getByRole('heading', { name: 'CMS Privacy Policy', exact: true })).toBeVisible();
  await expect(page.locator('.privacy-sections h2')).toHaveCount(1);
  await expect(page.locator('.privacy-sections p')).toHaveText('<script>plain text</script>');
  await expect(page.locator('.privacy-sections li')).toHaveText('CMS list item');
  await expect(page.locator('.privacy-illustration')).toHaveAttribute('alt', 'CMS illustration');
  await expect(page.locator('[data-footer-registration]')).toHaveText('Updated SEBI labelCMS registration line');
});

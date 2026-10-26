import { test, expect } from '@playwright/test';
import fs from 'node:fs';
const fallback = JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json', import.meta.url), 'utf8'));

const cms = 'http://localhost:3035/api';
test('published CMS data, above-the-fold media, and responsive layouts', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const global = await request.get(`${cms}/global`);
  const home = await request.get(`${cms}/homepage`);
  expect(global.ok()).toBeTruthy(); expect(home.ok()).toBeTruthy();
  expect((await home.json()).data.hero.trustedClients).toHaveLength(5);
  expect((await request.post(`${cms}/homepage`, { data: {} })).status()).toBe(405);
  for (const width of [1440, 1024, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
    // Below-fold lazy illustrations are decoded after scrolling in their section's dedicated test.
    await page.waitForFunction(() => [...document.images].filter(image => image.loading !== 'lazy').every(image => image.complete && image.naturalWidth > 0));
    await page.waitForFunction(() => !!document.querySelector('[data-entrance="header"]') && getComputedStyle(document.querySelector('[data-entrance="header"]')!).opacity === '1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(await page.evaluate(() => document.fonts.check('72px "LT Superior"'))).toBeTruthy();
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('requested entrance and background play with the browser reduced-motion setting', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => {
    const heading = document.querySelector('h1');
    return heading && Number(getComputedStyle(heading).opacity) < 0.95;
  });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-entrance="header"]')).toHaveCSS('opacity', '1');
  await page.waitForFunction(() => {
    const video = document.querySelector('video');
    return video && !video.paused && video.currentTime > 0.1;
  });
  await expect(page.getByRole('button', { name: /background video/ })).toHaveCount(0);
  await expect(page.locator('h1')).toHaveCSS('transform', 'none');
});

test('CMS outage uses verified fallback', async ({ page }) => {
  await page.route('**/api/global', route => route.abort());
  await page.route('**/api/homepage', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(fallback.hero.heading);
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByRole('img', { name: 'mPokket', exact: true })).toBeVisible();
});

test('delayed CMS updates appear without restarting entrance; CTA is configurable', async ({ page }) => {
  await page.route('**/api/global', route => route.fulfill({ json: { data: fallback.global } }));
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/homepage', async route => {
    await gate;
    await route.fulfill({ json: { data: { hero: { ...fallback.hero, announcementText: 'Our Trusted Clients', primaryCta: { label: 'Explore Portfolio', href: '/', enabled: true } } } } });
  });
  await page.goto('/');
  await page.waitForFunction(() => !!document.querySelector('[data-entrance="header"]') && getComputedStyle(document.querySelector('[data-entrance="header"]')!).opacity === '1');
  release();
  await expect(page.getByText('Our Trusted Clients', { exact: true })).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Explore Portfolio' })).toHaveAttribute('href', '/');
  await expect(page.locator('header')).toHaveCSS('opacity', '1');
  await expect(page.locator('h1')).toHaveCSS('opacity', '1');
  await page.getByRole('link', { name: 'Explore Portfolio' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:3039/');
});-

test('refresh replays a single entrance with header following heading', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => !!document.querySelector('[data-entrance="header"]') && getComputedStyle(document.querySelector('[data-entrance="header"]')!).opacity === '1');
  await page.reload();
  await page.getByRole('heading', { level: 1 }).waitFor();
  const first = await page.evaluate(() => ({ heading: Number(getComputedStyle(document.querySelector('h1')!).opacity), header: Number(getComputedStyle(document.querySelector('[data-entrance="header"]')!).opacity) }));
  expect(first.heading).toBeGreaterThanOrEqual(first.header);
  await page.waitForFunction(() => !!document.querySelector('[data-entrance="header"]') && getComputedStyle(document.querySelector('[data-entrance="header"]')!).opacity === '1');
  await expect(page.locator('header')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
});

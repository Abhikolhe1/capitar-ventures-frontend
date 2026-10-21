import fs from 'node:fs';
import { test, expect } from '@playwright/test';

const fallback = JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json', import.meta.url), 'utf8'));

async function mockCms(page: import('@playwright/test').Page, footer = fallback.global.footer) {
  await page.route('**/api/global', route => {
    const data = structuredClone({ ...fallback.global, footer });
    data.brandLogo.url = new URL(data.brandLogo.url, 'http://127.0.0.1:3039').href;
    if (data.footer) {
      for (const field of ['brandLogo', 'backgroundImage', 'backgroundVideo']) {
        if (data.footer[field]?.url) data.footer[field].url = new URL(data.footer[field].url, 'http://127.0.0.1:3039').href;
      }
      for (const shortcut of data.footer.aiLinks) if (shortcut.icon?.url) shortcut.icon.url = new URL(shortcut.icon.url, 'http://127.0.0.1:3039').href;
    }
    return route.fulfill({ json: { data } });
  });
  await page.route('**/api/homepage', route => route.fulfill({ json: { data: fallback } }));
}

test('footer matches the recording dimensions, follows main, and copies contact details', async ({ page, context }) => {
  await mockCms(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1441, height: 950 });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const footer = page.getByRole('contentinfo', { name: 'Capitar Ventures footer' });
  await footer.scrollIntoViewIfNeeded();
  const dimensions = await footer.evaluate(element => {
    const outer = element.getBoundingClientRect();
    const panel = element.querySelector('[data-footer-panel]')!.getBoundingClientRect();
    const cta = element.querySelector('[data-footer-cta]')!.getBoundingClientRect();
    return { width: outer.width, height: outer.height, panelWidth: panel.width, panelHeight: panel.height, left: panel.left - outer.left, top: panel.top - outer.top, ctaWidth: cta.width, ctaHeight: cta.height, afterMain: element.previousElementSibling?.tagName === 'MAIN' };
  });
  expect(dimensions.width).toBe(1441);
  expect(dimensions.height).toBeCloseTo(950, 1);
  expect(dimensions.panelWidth).toBeCloseTo(1324, 1);
  expect(dimensions.panelHeight).toBeCloseTo(523, 1);
  expect(dimensions.left).toBeCloseTo(58.5, 1);
  expect(dimensions.top).toBeCloseTo((950 - dimensions.panelHeight) / 2, 1);
  expect(dimensions.ctaWidth).toBeCloseTo(352, 1);
  expect(dimensions.ctaHeight).toBe(440);
  expect(dimensions.afterMain).toBeTruthy();
  const icons = footer.getByRole('navigation', { name: 'Explore Capitar with AI' }).locator('img');
  await expect(icons).toHaveCount(4);
  await icons.evaluateAll(images => Promise.all(images.map(element => { const image = element as HTMLImageElement; image.loading = 'eager'; return image.decode(); })));
  await footer.getByRole('button', { name: 'Copy email' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(fallback.global.footer.email);
  await footer.getByRole('button', { name: 'Copy phone' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(fallback.global.footer.phone);
  await expect(footer.locator('video')).toHaveCount(0);
  await expect(footer.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Insights' })).toHaveAttribute('href', '#insights-news');
  await footer.screenshot({ path: 'test-results/footer-desktop.png' });
});

test('footer remains readable without page overflow across responsive widths', async ({ page }) => {
  test.setTimeout(90000);
  await mockCms(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1280, 1024, 768, 390, 375, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    const footer = page.locator('#site-footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByRole('heading')).toHaveText('Interested in learning more about us?');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const clipped = await footer.evaluate(element => [...element.querySelectorAll('nav,p,address')].some(item => item.scrollWidth > item.clientWidth + 1));
    expect(clipped).toBeFalsy();
    await footer.screenshot({ path: `test-results/footer-${width}.png` });
  }
  expect(errors).toEqual([]);
});

test('normal motion reuses the hero animation and falls back if the CMS video fails', async ({ page }) => {
  const content = structuredClone(fallback.global.footer);
  content.backgroundVideo.url = 'http://127.0.0.1:3039/missing-footer-video.mp4';
  await mockCms(page, content);
  await page.route('**/missing-footer-video.mp4', route => route.abort());
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const footer = page.locator('#site-footer');
  await footer.scrollIntoViewIfNeeded();
  const videos = footer.locator('video');
  await expect(videos).toHaveCount(2);
  await expect(videos.first()).toHaveAttribute('src', '/assets/capitar/hero.mp4');
  await expect.poll(() => videos.first().evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0);
  for (const video of await videos.all()) {
    expect(await video.evaluate((element: HTMLVideoElement) => element.muted && element.loop && element.playsInline)).toBeTruthy();
  }
  for (const surface of ['outer', 'cta']) {
    const background = footer.locator(`[data-footer-background="${surface}"]`);
    const poster = (await background.locator('img').boundingBox())!;
    const moving = (await background.locator('video').boundingBox())!;
    expect(moving.x).toBeCloseTo(poster.x, 1);
    expect(moving.y).toBeCloseTo(poster.y, 1);
    expect(moving.width).toBeCloseTo(poster.width, 1);
    expect(moving.height).toBeCloseTo(poster.height, 1);
    expect(await background.locator('video').evaluate(element => getComputedStyle(element).objectPosition)).toBe(await background.locator('img').evaluate(element => getComputedStyle(element).objectPosition));
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(videos).toHaveCount(0);
});

test('CMS controls links and content; disabled or malformed footer stays hidden', async ({ page }) => {
  const content = structuredClone(fallback.global.footer);
  content.cta = { label: 'Contact our team', enabled: true, href: 'mailto:hello@example.com' };
  content.address = 'Edited address';
  content.socialLinks = [{ label: 'Unsafe social link', enabled: true, href: 'javascript:alert(1)' }];
  await mockCms(page, content);
  await page.goto('/');
  const footer = page.locator('#site-footer');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.getByText('Edited address')).toBeVisible();
  await expect(footer.getByRole('link', { name: 'Contact our team' })).toHaveAttribute('href', 'mailto:hello@example.com');
  await expect(footer.getByRole('link', { name: 'Unsafe social link' })).toHaveCount(0);
  content.enabled = false;
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(footer).toHaveCount(0);
  await page.unroute('**/api/global');
  await page.route('**/api/global', route => route.fulfill({ json: { data: { ...fallback.global, footer: 'invalid' } } }));
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(footer).toHaveCount(0);
  await page.unroute('**/api/global');
  await page.route('**/api/global', route => route.fulfill({ json: { data: { ...fallback.global, footer: undefined } } }));
  await page.reload();
  await expect(footer).toHaveCount(1);
  await page.unroute('**/api/global');
  await page.route('**/api/global', route => route.abort());
  await page.reload();
  await expect(footer).toHaveCount(1);
});

test('every AI icon expands its label on hover, focus and click', async ({ page }) => {
  await mockCms(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Explore Capitar with AI' });
  await navigation.scrollIntoViewIfNeeded();
  for (const provider of ['ChatGPT', 'Perplexity', 'Claude', 'Gemini']) {
    const shortcut = navigation.getByRole('button', { name: provider, exact: true });
    await shortcut.hover();
    await expect(shortcut).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(async () => (await shortcut.boundingBox())!.width).toBeGreaterThan(50);
    await expect(navigation.locator('[aria-expanded="true"]')).toHaveCount(1);
    await shortcut.click();
    await page.mouse.move(0, 0);
    await expect(shortcut).toHaveAttribute('aria-expanded', 'true');
  }
  const keyboardShortcut = navigation.getByRole('button', { name: 'Perplexity', exact: true });
  await keyboardShortcut.focus();
  await expect(keyboardShortcut).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(async () => (await keyboardShortcut.boundingBox())!.width).toBeGreaterThan(50);
  await navigation.screenshot({ path: 'test-results/footer-ai-expanded.png' });
});

test('a touch opens an AI label before a second tap follows its configured link', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    const content = structuredClone(fallback.global.footer);
    content.aiLinks[1] = { ...content.aiLinks[1], enabled: true, href: '/footer-ai-target' };
    await mockCms(page, content);
    await page.route('**/footer-ai-target', route => route.fulfill({ contentType: 'text/html', body: '<p>Configured destination</p>' }));
    await page.goto('http://127.0.0.1:3039/');
    const shortcut = page.getByRole('navigation', { name: 'Explore Capitar with AI' }).getByRole('link', { name: 'Perplexity', exact: true });
    await shortcut.scrollIntoViewIfNeeded();
    await shortcut.tap();
    await expect(page).toHaveURL('http://127.0.0.1:3039/');
    await expect(shortcut).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(async () => (await shortcut.boundingBox())!.width).toBeGreaterThan(50);
    await shortcut.tap();
    await expect(page).toHaveURL('http://127.0.0.1:3039/footer-ai-target');
  } finally { await context.close(); }
});

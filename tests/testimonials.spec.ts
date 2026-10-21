import fs from 'node:fs';
import { test, expect } from '@playwright/test';

const fallback = JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json', import.meta.url), 'utf8'));

async function mockCms(page: import('@playwright/test').Page, testimonials = fallback.testimonials) {
  await page.route('**/api/global', route => route.fulfill({ json: { data: fallback.global } }));
  await page.route('**/api/homepage', route => {
    const content = structuredClone(testimonials);
    if (content) for (const item of content.items) {
      for (const field of ['portrait', 'companyLogo']) if (item[field]?.url) item[field].url = new URL(item[field].url, 'http://127.0.0.1:3039').href;
    }
    return route.fulfill({ json: { data: { ...fallback, testimonials: content } } });
  });
}

test('testimonial cards match the recording dimensions and carousel boundaries', async ({ page }) => {
  await mockCms(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/');
  const section = page.locator('#client-testimonials');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('What founders say about us');
  const cards = section.getByRole('article');
  await expect(cards).toHaveCount(4);
  await expect(section.getByRole('img', { name: 'Denis Slavska', exact: true })).toHaveCount(2);
  await expect(section.getByRole('img', { name: 'Jahan Melad', exact: true })).toHaveCount(2);
  for (let index = 0; index < 3; index++) {
    const bounds = (await cards.nth(index).boundingBox())!;
    expect(bounds.width).toBeCloseTo(index === 2 ? 428 : 427, 1);
    expect(bounds.height).toBeCloseTo(523.4, 1);
    await expect(cards.nth(index)).toHaveCSS('border-radius', '24px');
    await expect(cards.nth(index)).toHaveCSS('padding', '32px');
    await expect(cards.nth(index)).toHaveCSS('gap', '52px');
  }
  await expect(section.getByRole('list')).toHaveCSS('gap', '24px');
  // Include offscreen carousel portraits without depending on Chrome's lazy-load distance.
  await section.locator('img').evaluateAll(images => Promise.all(images.map(element => {
    const image = element as HTMLImageElement;
    image.loading = 'eager';
    return image.decode();
  })));
  const geometry = await section.evaluate(element => ({ top: element.getBoundingClientRect().top, previousBottom: document.querySelector('#insights-news')!.getBoundingClientRect().bottom }));
  expect(geometry.top).toBeCloseTo(geometry.previousBottom, 1);
  await section.screenshot({ path: 'test-results/testimonials-desktop.png' });
  const previous = section.getByRole('button', { name: 'Previous testimonials' });
  const next = section.getByRole('button', { name: 'Next testimonials' });
  await expect(previous).toBeDisabled();
  await next.click();
  await expect.poll(() => section.getByRole('list').evaluate(element => element.scrollLeft)).toBeGreaterThan(100);
  await expect(previous).toBeEnabled();
  await next.click();
  await expect(next).toBeDisabled();
  await previous.click();
  await expect(previous).toBeDisabled();
});

test('testimonials stay readable and within the page at desktop and mobile widths', async ({ page }) => {
  test.setTimeout(90000);
  await mockCms(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1024, 768, 390, 375, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    const section = page.locator('#client-testimonials');
    await section.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await expect(section.getByRole('article')).toHaveCount(4);
    await expect(section.getByText(fallback.testimonials.items[0].quote).first()).toBeVisible();
    const overflow = await section.getByRole('article').first().evaluate(element => element.scrollWidth > element.clientWidth + 1);
    expect(overflow).toBeFalsy();
    await section.screenshot({ path: `test-results/testimonials-${width}.png` });
  }
  expect(errors).toEqual([]);
});

test('CMS quote, author and media changes render; long quotes remain accessible', async ({ page }) => {
  const content = structuredClone(fallback.testimonials);
  content.heading = 'CMS testimonials';
  content.items = [{ quote: 'An independently edited testimonial. '.repeat(30), name: 'CMS Author', role: 'Founder', company: 'Example Company', location: 'Mumbai', portrait: { url: '/missing-testimonial.jpg' }, companyLogo: { url: '/missing-logo.png' } }];
  await mockCms(page, content);
  await page.route('**/missing-testimonial.jpg', route => route.abort());
  await page.route('**/missing-logo.png', route => route.abort());
  await page.goto('/');
  const section = page.locator('#client-testimonials');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('CMS testimonials');
  await expect(section.locator('img')).toHaveCount(0);
  await expect(section.getByText('Example Company', { exact: true })).toBeVisible();
  await expect(section.getByText('Founder, Example Company')).toBeVisible();
  const quote = section.getByRole('blockquote');
  await quote.focus();
  await page.keyboard.press('End');
  await expect.poll(() => quote.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await expect(section.getByText('CMS Author', { exact: true })).toBeVisible();
});

test('disabled, empty or invalid CMS sections stay hidden and older APIs keep the preview', async ({ page }) => {
  const content = structuredClone(fallback.testimonials);
  content.enabled = false;
  await mockCms(page, content);
  await page.goto('/');
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#client-testimonials')).toHaveCount(0);
  content.enabled = true;
  content.items = [];
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#client-testimonials')).toHaveCount(0);
  content.items = structuredClone(fallback.testimonials.items);
  content.heading = '';
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#client-testimonials')).toHaveCount(0);
  await page.unroute('**/api/homepage');
  await page.route('**/api/homepage', route => route.fulfill({ json: { data: { hero: fallback.hero } } }));
  await page.reload();
  await expect(page.locator('#client-testimonials article')).toHaveCount(4);
});

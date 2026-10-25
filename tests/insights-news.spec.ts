import fs from 'node:fs';
import { test, expect } from '@playwright/test';

const fallback = JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json', import.meta.url), 'utf8'));

test('desktop Insights uses Figma dimensions independently of screen height', async ({ page }) => {
  await mockCms(page);
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  await page.evaluate(() => document.fonts.ready);
  for (const height of [950, 834, 600]) {
    await page.setViewportSize({ width: 1440, height });
    const geometry = await page.locator('#insights-news').evaluate(el => {
      const bounds = el.getBoundingClientRect();
      const rect = (selector: string) => {
        const r = el.querySelector(selector)!.getBoundingClientRect();
        return { width: r.width, height: r.height };
      };
      return { height: bounds.height, card: rect('article'), copy: rect('[data-editorial-copy]'), tabs: rect('.MuiTabs-root'), padding: getComputedStyle(el).paddingTop };
    });
    expect(geometry.height).toBeCloseTo(834, 0);
    expect(geometry.card).toEqual({ width: 499, height: 445 });
    expect(geometry.copy).toEqual({ width: 485, height: 196 });
    // Preserve the dev1 tab pill requested by the user, independently of Figma section sizing.
    expect(geometry.tabs.height).toBe(52);
    expect(geometry.tabs.width).toBeGreaterThanOrEqual(214);
    await expect(page.locator('#insights-news .MuiTabs-root')).toHaveCSS('border-radius', '999px');
    await expect(page.locator('#insights-news .MuiTabs-root')).toHaveCSS('border-width', '2px');
    await expect(page.locator('#insights-news .MuiTabs-root')).toHaveCSS('padding', '0px');
    expect(parseFloat(geometry.padding)).toBeCloseTo(70.13, 1);
  }
});

async function mockCms(page: import('@playwright/test').Page, insightsNews = fallback.insightsNews) {
  await page.route('**/api/global', route => route.fulfill({ json: { data: fallback.global } }));
  await page.route('**/api/homepage', route => {
    const content = structuredClone(insightsNews);
    for (const key of ['insights', 'news']) {
      for (const item of content[key].items) {
        if (item.image?.url) item.image.url = new URL(item.image.url, 'http://127.0.0.1:3039').href;
      }
    }
    return route.fulfill({ json: { data: { ...fallback, insightsNews: content } } });
  });
}

test('tabs keep the same layout, switch independent CMS content, reset carousel, and support the keyboard', async ({ page }) => {
  const content = structuredClone(fallback.insightsNews);
  content.news.heading = 'Independent News heading';
  content.news.items[0].title = 'An update from the CMS';
  content.news.items[0].href = '/news/example';
  await mockCms(page, content);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/');
  const section = page.locator('#insights-news');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('tab', { name: 'Insights', exact: true })).toHaveAttribute('aria-selected', 'true');
  const card = section.getByRole('article').first();
  expect((await card.boundingBox())!.width).toBeCloseTo(499, 1);
  expect((await card.boundingBox())!.height).toBeCloseTo(445, 1);
  await expect(card).toHaveCSS('border-radius', '20px');
  const initialHeight = (await section.boundingBox())!.height;
  const track = section.getByRole('list');
  await section.getByRole('button', { name: 'Next Insights articles' }).click();
  await expect.poll(() => track.evaluate(element => element.scrollLeft)).toBeGreaterThan(100);
  await section.getByRole('tab', { name: 'News', exact: true }).click();
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Independent News heading');
  await expect(section.getByRole('link', { name: /An update from the CMS/ })).toHaveAttribute('href', '/news/example');
  await expect(section.getByRole('article')).toHaveCount(content.news.items.length);
  await expect(section.locator('img')).toHaveCount(content.news.items.length);
  await expect.poll(() => section.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBeTruthy();
  expect((await section.boundingBox())!.height).toBeCloseTo(initialHeight, 1);
  await expect.poll(() => track.evaluate(element => element.scrollLeft)).toBe(0);
  await expect(section.getByRole('button', { name: 'Previous News articles' })).toBeDisabled();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  await expect(section.getByRole('tab', { name: 'Insights', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(section.getByRole('heading', { level: 3 }).first()).toHaveText('What Is Venture Debt, Really?');
  await section.screenshot({ path: 'test-results/insights-desktop.png' });
  await section.getByRole('tab', { name: 'News', exact: true }).click();
  await section.screenshot({ path: 'test-results/news-desktop.png' });
});

test('the section follows Team and fits desktop and mobile without changing the portraits', async ({ page }) => {
  test.setTimeout(90000);
  await mockCms(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 1024, 768, 390, 375, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    const section = page.locator('#insights-news');
    await section.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(await section.evaluate(element => !!(document.querySelector('#team')!.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING))).toBeTruthy();
    await expect(section.getByRole('article')).toHaveCount(fallback.insightsNews.insights.items.length);
    await section.getByRole('tab', { name: 'News', exact: true }).click();
    await expect(section.getByRole('heading', { level: 3 }).first()).toHaveText('What Is Venture Debt, Really?');
    await section.screenshot({ path: `test-results/editorial-${width}.png` });
  }
  expect(errors).toEqual([]);
});

test('empty tabs, invalid links and failed media remain usable; disabled content stays hidden', async ({ page }) => {
  const content = structuredClone(fallback.insightsNews);
  content.insights.items[0].href = 'javascript:alert(1)';
  content.insights.items[0].image = { url: 'http://127.0.0.1:3039/unavailable-editorial.jpg' };
  content.news.items = [];
  await mockCms(page, content);
  await page.route('**/unavailable-editorial.jpg', route => route.abort());
  await page.goto('/');
  const section = page.locator('#insights-news');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('link')).toHaveCount(0);
  await expect(section.locator('img[src*="unavailable-editorial"]')).toHaveCount(0);
  await expect(section.locator('img')).toHaveCount(content.insights.items.length - 1);
  await section.getByRole('tab', { name: 'News', exact: true }).click();
  await expect(section.getByText('No articles yet.')).toBeVisible();
  await expect(section.getByRole('article')).toHaveCount(0);
  await expect(section.getByRole('button', { name: 'Next News articles' })).toBeDisabled();
  content.enabled = false;
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(section).toHaveCount(0);
});

test('the preview survives API failure and reduced motion removes the tab fade', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/**', route => route.abort());
  await page.goto('/');
  const section = page.locator('#insights-news');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('article')).toHaveCount(fallback.insightsNews.insights.items.length);
  await section.getByRole('tab', { name: 'News', exact: true }).click();
  await expect(section.getByRole('tabpanel')).toHaveCSS('animation-name', 'none');
});

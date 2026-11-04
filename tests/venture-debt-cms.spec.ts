import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const fallback = JSON.parse(readFileSync(new URL('../src/content/venture-debt.json', import.meta.url), 'utf8'));

test('live backend content and uploaded media render in the frontend', async ({ page }) => {
  const published = page.waitForResponse(response => new URL(response.url()).pathname === '/api/venture-debt');
  await page.goto('/venture-debt');
  const response = await published;
  expect(response.status()).toBe(200);
  const { data } = await response.json();
  await expect(page.locator('#vd-title')).toHaveText(`${data.hero.heading}${data.hero.emphasisText}`);
  await expect(page.locator('#before > .vd-container > .vd-heading-row > p')).toHaveText(data.before.description);
  await expect(page.locator('#signal-0')).toContainText(data.before.items[0].title);
  await expect(page.locator('#step-0')).toContainText(data.process.items[0].title);
  await expect(page.locator('#in-practice blockquote')).toContainText(data.practice.quote);
  await expect(page.locator('#faq-0')).toContainText(data.faq.items[0].question);
  const image = page.locator('.vd-banner-base');
  await expect(image).toHaveAttribute('src', new URL(data.hero.backgroundImage.url, response.url()).href);
  await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test('published CMS content drives all venture debt sections and safe links', async ({ page }) => {
  const content = structuredClone(fallback);
  content.title = 'CMS venture debt';
  content.hero.heading = 'CMS hero ';
  content.hero.emphasisText = 'heading';
  content.before.items[1].description = 'CMS signal explanation';
  content.process.items[2].description = 'CMS structure explanation';
  content.practice.quote = 'CMS founder quote';
  content.practice.image.url = '/assets/venture-debt/34b05.png';
  content.faq.items = [{ question: 'CMS question?', answer: 'CMS answer.' }];
  content.timeline[3].label = 'CMS FAQ';
  content.hero.secondaryCta.href = 'javascript:alert(1)';
  await page.route('**/api/venture-debt', route => route.fulfill({ json: { data: content } }));
  await page.goto('/venture-debt');
  await expect(page).toHaveTitle('CMS venture debt');
  await expect(page.locator('#vd-title')).toHaveText('CMS hero heading');
  await expect(page.locator('.vd-secondary')).toHaveCount(0);
  await page.locator('#signal-1').click();
  await expect(page.locator('#signal-panel-1')).toHaveText('CMS signal explanation');
  await page.locator('#step-2').click();
  await expect(page.locator('#step-panel-2')).toHaveText('CMS structure explanation');
  await expect(page.locator('#in-practice blockquote')).toContainText('CMS founder quote');
  await page.locator('#faq-0').click();
  await expect(page.locator('#faq-panel-0')).toHaveText('CMS answer.');
  await expect(page.locator('.vd-chapters a').last()).toContainText('CMS FAQ');
});

test('CMS disabled sections leave the timeline and missing sections keep local defaults', async ({ page }) => {
  await page.route('**/api/venture-debt', route => route.fulfill({ json: { data: { process: { enabled: false }, practice: { enabled: false } } } }));
  await page.goto('/venture-debt');
  await expect(page.locator('#with-capitar')).toHaveCount(0);
  await expect(page.locator('#in-practice')).toHaveCount(0);
  await expect(page.locator('.vd-chapters a')).toHaveCount(2);
  await expect(page.locator('#vd-title')).toHaveText('Could venture debt be right for your next move?');
  await expect(page.locator('#vd-faq-title')).toHaveText(fallback.faq.heading);
});

test('CMS failure keeps the complete fallback page', async ({ page }) => {
  await page.route('**/api/venture-debt', route => route.fulfill({ status: 503, json: { error: 'Unavailable' } }));
  await page.goto('/venture-debt');
  await expect(page.locator('main > section')).toHaveCount(5);
  await expect(page.locator('#vd-title')).toHaveText('Could venture debt be right for your next move?');
});

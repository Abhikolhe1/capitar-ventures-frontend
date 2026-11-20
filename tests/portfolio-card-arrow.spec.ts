import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const fallback = JSON.parse(readFileSync(new URL('../src/content/portfolio.json', import.meta.url), 'utf8'));

test('card arrow slides up, reverses on exit, and shares the card destination', async ({ page }) => {
  const data = structuredClone(fallback);
  data.companies = [{ ...data.companies[0], websiteUrl: 'https://company.example/melorra', caseStudyUrl: '/case-studies/melorra' }];
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/api/portfolio', route => route.fulfill({ json: { data } }));
  await page.route('**/assets/portfolio/melorra.webp', route => route.fulfill({ path: 'public/assets/portfolio/melorra.webp' }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/portfolio');
  const card = page.locator('.portfolio-card');
  const arrow = card.locator('.portfolio-card__arrow');
  const link = card.getByRole('link', { name: 'Visit Melorra website', exact: true });
  await expect(card).toHaveCount(1);
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const translate = () => arrow.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42);
  await expect.poll(translate).toBeGreaterThan(42);
  await card.hover();
  await expect.poll(translate).toBe(0);
  const geometry = await arrow.evaluate(el => {
    const a = el.getBoundingClientRect(), c = el.closest('article')!.getBoundingClientRect();
    return { width: a.width, height: a.height, right: c.right - a.right, bottom: c.bottom - a.bottom };
  });
  expect(geometry).toEqual({ width: 42, height: 42, right: 27, bottom: 27 });
  await card.screenshot({ path: 'test-results/portfolio-card-arrow-hover.png' });
  await page.mouse.move(0, 0);
  await expect.poll(translate).toBeGreaterThan(42);
  await link.focus();
  await expect.poll(translate).toBe(0);
  await link.evaluate(el => (el as HTMLElement).blur());
  await card.hover();
  await expect.poll(translate).toBe(0);
  await expect(card.getByRole('link', { name: 'View Casestudy' })).toHaveAttribute('href', '/case-studies/melorra');
  await page.route('https://company.example/melorra', route => route.fulfill({ body: 'Company website' }));
  const bounds = (await arrow.boundingBox())!;
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await expect(page).toHaveURL('https://company.example/melorra');
});

test('clicking an unlinked card does not keep its hover arrow visible after pointer exit', async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/portfolio');
  const card = page.locator('.portfolio-card').first();
  const arrow = card.locator('.portfolio-card__arrow');
  await card.scrollIntoViewIfNeeded();
  await card.locator('.portfolio-card__toggle').click();
  await page.mouse.move(0, 0);
  await expect.poll(() => arrow.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)).toBeGreaterThan(42);
});

test('unsafe company website URLs do not become clickable links', async ({ page }) => {
  const data = structuredClone(fallback);
  data.companies = [{ ...data.companies[0], websiteUrl: 'javascript:alert(1)' }];
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/api/portfolio', route => route.fulfill({ json: { data } }));
  await page.goto('/portfolio');
  await expect(page.locator('.portfolio-card')).toHaveCount(1);
  await expect(page.locator('.portfolio-card a')).toHaveCount(0);
  await expect(page.locator('button.portfolio-card__toggle')).toHaveCount(1);
});

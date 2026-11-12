import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const portfolio = JSON.parse(
  readFileSync(new URL('../src/content/portfolio.json', import.meta.url), 'utf8')
) as typeof import('../src/content/portfolio.json');

const study = {
  slug: 'test-co',
  companyName: 'Test Co',
  headline: 'A test headline.',
  summary: 'First paragraph.\n\nSecond paragraph.',
  founders: 'A Founder',
  sector: 'Fintech',
  stage: 'Series A',
  website: 'javascript:alert(1)',
  metrics: [{ value: '3x', label: 'Revenue growth' }],
  sections: [{ heading: 'The challenge', body: 'Challenge text.' }],
  quote: { text: 'Great partner.', name: 'A Founder', role: 'CEO, Test Co' },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('capitar-motion', 'reduced'));
  await page.route('**/api/homepage*', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/api/global*', (route) => route.fulfill({ status: 503, body: '{}' }));
});

test('View Casestudy opens the company case study page', async ({ page }) => {
  const data = structuredClone(portfolio);
  data.companies = [
    { ...data.companies[0], key: 'test-co', name: 'Test Co', caseStudyUrl: '/portfolio/test-co' },
  ] as typeof data.companies;
  await page.route('**/api/portfolio', (route) => route.fulfill({ json: { data } }));
  await page.route('**/api/case-studies/test-co', (route) => route.fulfill({ json: { data: study } }));
  await page.goto('/portfolio');
  await page.getByRole('link', { name: 'View Casestudy' }).click();
  await expect(page).toHaveURL(/\/portfolio\/test-co$/);
  await expect(page).toHaveTitle('Test Co case study | Capitar Ventures');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test Co');
  await expect(page.locator('.case-facts')).toContainText('Fintech');
  await expect(page.locator('.case-metrics')).toContainText('Revenue growth');
  await expect(page.locator('.case-story__summary p')).toHaveCount(2);
  await expect(page.locator('.case-quote blockquote')).toHaveText('Great partner.');
  // Unsafe links from the CMS are never rendered.
  await expect(page.locator('.case-website')).toHaveCount(0);
  await page.getByRole('link', { name: /Back to portfolio/ }).click();
  await expect(page).toHaveURL(/\/portfolio$/);
});

test('unknown and unavailable case studies show a clear message', async ({ page }) => {
  await page.route('**/api/case-studies/missing', (route) =>
    route.fulfill({ status: 404, json: { data: null } })
  );
  await page.goto('/portfolio/missing');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Case study not found');
  await page.route('**/api/case-studies/down', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/portfolio/down');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Case study unavailable');
});

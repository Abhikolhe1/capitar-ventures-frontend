import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const fallback = JSON.parse(
  readFileSync(new URL('../src/content/portfolio.json', import.meta.url), 'utf8')
) as typeof import('../src/content/portfolio.json');

test('Portfolio uses CMS sections, company media and filters independently of homepage stories', async ({
  page,
}) => {
  const data = structuredClone(fallback);
  data.title = 'CMS Portfolio';
  data.hero.heading = 'CMS founders';
  data.featuredStories.heading = 'CMS featured stories';
  data.companiesSection.heading = 'CMS companies';
  data.companiesSection.sectorLabel = 'Industry';
  data.companiesSection.stageLabel = 'Investment round';
  data.conversation.heading = 'CMS conversation';
  data.companies = [
    {
      ...data.companies[0],
      key: 'new-company',
      name: 'New CMS Company',
      sector: 'Technology',
      stage: 'Series A',
      founder: { name: 'CMS Founder', role: 'CEO' },
      logo: { url: '/uploads/cms-logo.webp', alternativeText: '' },
    },
  ];
  await page.route('**/api/homepage*', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/api/global*', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/api/portfolio', (route) => route.fulfill({ json: { data } }));
  await page.route('**/uploads/cms-logo.webp', (route) =>
    route.fulfill({ path: 'public/assets/portfolio/melorra.webp' })
  );
  await page.goto('/portfolio');
  await expect(page).toHaveTitle('CMS Portfolio');
  await expect(page.locator('#portfolio-heading')).toContainText('CMS founders');
  await expect(page.locator('#case-study-heading')).toHaveText('CMS featured stories');
  await expect(page.locator('#companies-heading')).toHaveText('CMS companies');
  await expect(page.locator('#conversation-heading')).toHaveText('CMS conversation');
  await expect(page.locator('.portfolio-card')).toHaveCount(1);
  await page.getByRole('combobox', { name: 'Industry', exact: true }).click();
  await expect(page.getByRole('option', { name: 'Technology', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Investment round', exact: true }).click();
  await expect(page.getByRole('option', { name: 'Series A', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  const card = page.locator('.portfolio-card');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toContainText('CMS Founder');
  await expect(card.locator('img')).toHaveAttribute('src', /\/uploads\/cms-logo\.webp$/);
  await expect
    .poll(() => card.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
});

test('View Casestudy appears only for companies with a safe case study link', async ({ page }) => {
  const data = structuredClone(fallback);
  const base = data.companies[0];
  data.companies = [
    { ...base, key: 'with-study', name: 'With Study', caseStudyUrl: '/case-studies/with-study' },
    { ...base, key: 'without-study', name: 'Without Study' },
    { ...base, key: 'unsafe-study', name: 'Unsafe Study', caseStudyUrl: 'javascript:alert(1)' },
  ] as typeof data.companies;
  await page.route('**/api/portfolio', (route) => route.fulfill({ json: { data } }));
  await page.goto('/portfolio');
  const cards = page.locator('.portfolio-card');
  await expect(cards).toHaveCount(3);
  const link = cards.nth(0).getByRole('link', { name: 'View Casestudy' });
  await expect(link).toHaveAttribute('href', '/case-studies/with-study');
  await expect(cards.nth(1).locator('.portfolio-card__case-study')).toHaveCount(0);
  await expect(cards.nth(2).locator('.portfolio-card__case-study')).toHaveCount(0);
  await expect(cards.nth(0)).toContainText('Founders');
  await expect(cards.nth(0)).toContainText('Stage of Investment');
});

test('empty CMS company list and disabled sections are respected; unsafe CTAs stay disabled', async ({
  page,
}) => {
  const data = structuredClone(fallback);
  data.hero.enabled = false;
  data.featuredStories.enabled = false;
  data.companies = [];
  data.conversation.cta.href = 'javascript:alert(1)';
  await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/api/portfolio', (route) => route.fulfill({ json: { data } }));
  await page.goto('/portfolio');
  await expect(page.locator('.portfolio-hero')).toHaveCount(0);
  await expect(page.locator('header')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('#case-study')).toHaveCount(0);
  await expect(page.locator('.portfolio-card')).toHaveCount(0);
  await page.locator('.portfolio-empty').scrollIntoViewIfNeeded();
  await expect(page.getByText('No companies match these filters.')).toBeVisible();
  await expect(page.locator('.portfolio-conversation button')).toBeDisabled();
  await expect(page.locator('.portfolio-conversation a')).toHaveCount(0);
});

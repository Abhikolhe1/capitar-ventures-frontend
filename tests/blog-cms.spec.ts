import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const fallback = JSON.parse(readFileSync(new URL('../src/content/blog.json', import.meta.url), 'utf8'));

function cmsPage(count = 11) {
  return { data: {
    ...fallback,
    hero: { ...fallback.hero, title: ['CMS insights'], image: { url: fallback.hero.image } },
    featured: { ...fallback.featured, title: 'CMS featured', href: '/venture-debt', image: { url: fallback.featured.image } },
    categories: ['Growth', 'Technology'].map(label => ({ label })),
    latest: { ...fallback.latest, pageSize: 3, articles: Array.from({ length: count }, (_, index) => ({
      key: `article-${index}`, category: index % 2 ? 'Technology' : 'Growth', title: `Article ${String(index).padStart(2, '0')}`,
      description: 'CMS article summary', date: `2026-11-${String(index + 1).padStart(2, '0')}`,
      image: { url: fallback.latest.articles[index % 9].image }, href: '/venture-debt',
    })) },
    newsletter: { ...fallback.newsletter, artwork: { url: fallback.newsletter.artwork }, privacyHref: '/privacy', enabled: true },
  } };
}

// Emulates GET /api/blog-articles: the CMS filters, sorts and returns one page only.
type Article = { category: string; title: string; date: string };
async function serveArticles(page: Page, articles: Article[], requests: URLSearchParams[] = []) {
  await page.route('**/api/blog-articles?**', route => {
    const params = new URL(route.request().url()).searchParams;
    requests.push(params);
    const pageNumber = Number(params.get('page')), pageSize = Number(params.get('pageSize'));
    const sort = params.get('sort'), category = params.get('category');
    const list = articles.filter(article => !category || article.category === category);
    list.sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
    const data = list.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map(article => ({ documentId: `doc-${article.title}`, ...article }));
    return route.fulfill({ json: { data, meta: { pagination: { page: pageNumber, pageSize, pageCount: Math.ceil(list.length / pageSize), total: list.length } } } });
  });
  return requests;
}
async function sortBy(page: Page, option: string) {
  await page.getByRole('combobox', { name: 'Sort articles', exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

test('published CMS content controls all sections, categories, sorting and pagination', async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/api/blog', route => route.fulfill({ json: cmsPage() }));
  const requests = await serveArticles(page, cmsPage().data.latest.articles);
  await page.goto('/blog');
  await expect(page.locator('h1')).toHaveText('CMS insights');
  await expect(page.locator('.blog-feature h2')).toContainText('CMS featured');
  await expect(page.getByRole('link', { name: 'Known More' })).toHaveAttribute('href', '/venture-debt');
  await expect(page.locator('.blog-card')).toHaveCount(3);
  await expect(page.locator('.blog-card h3').first()).toHaveText('Article 10');
  await sortBy(page, 'Oldest first');
  await expect(page.locator('.blog-card h3').first()).toHaveText('Article 00');
  await page.getByRole('button', { name: 'Page 2', exact: true }).click();
  await expect(page.locator('.blog-card h3').first()).toHaveText('Article 03');
  // Only the visible page is requested from the CMS.
  expect(Object.fromEntries(requests.at(-1)!)).toEqual({ page: '2', pageSize: '3', sort: 'oldest' });
  await expect(page.locator('.blog-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Technology', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Page 1', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.blog-card h3').first()).toHaveText('Article 01');
  await expect(page.locator('.blog-feature')).toHaveCount(0);
  await expect(page.locator('.blog-newsletter a')).toHaveAttribute('href', '/privacy');
});

test('empty CMS article lists remain empty, unsafe links and images do not execute', async ({ page }) => {
  const payload = cmsPage(0);
  payload.data.featured.href = 'javascript:alert(1)';
  payload.data.hero.image.url = 'javascript:alert(1)';
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/api/blog', route => route.fulfill({ json: payload }));
  await serveArticles(page, []);
  await page.goto('/blog');
  await expect(page.locator('h1')).toHaveText('CMS insights');
  await expect(page.locator('.blog-card')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Known More' })).toBeDisabled();
  await expect(page.locator('.blog-hero image')).toHaveAttribute('href', fallback.hero.image);
  await expect(page.locator('.blog-empty')).toBeVisible();
});

test('subscription validates email, posts to CMS and only acknowledges accepted responses', async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  let accepted = true;
  let received: unknown;
  await page.route('**/api/newsletter-subscriptions', route => {
    received = route.request().postDataJSON();
    return route.fulfill({ json: { data: { accepted } } });
  });
  await page.goto('/blog');
  const email = page.getByRole('textbox', { name: 'Email address' });
  await email.fill('not-an-email');
  await page.getByRole('button', { name: 'Subscribe', exact: true }).click();
  expect(received).toBeUndefined();
  await email.fill('reader@example.com');
  await page.getByRole('button', { name: 'Subscribe', exact: true }).click();
  await expect(page.locator('.blog-subscribe__status')).toHaveText('Thank you. Your subscription request has been received.');
  expect(received).toEqual({ email: 'reader@example.com' });
  await expect(email).toHaveValue('');
  accepted = false;
  await email.fill('another@example.com');
  await page.getByRole('button', { name: 'Subscribe', exact: true }).click();
  await expect(page.locator('.blog-subscribe__status')).toHaveText('We could not subscribe you right now. Please try again later.');
  await expect(email).toHaveValue('another@example.com');
});

test('pagination: numbered pages with gaps, previous/next, URL, back button and focus refresh', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('capitar-motion', 'reduced'));
  await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/api/blog', route => route.fulfill({ json: cmsPage(30) })); // 30 articles, 3 per page = 10 pages
  const requests = await serveArticles(page, cmsPage(30).data.latest.articles);
  await page.goto('/blog');
  const nav = page.getByRole('navigation', { name: 'Article pages' });
  const labels = () => nav.locator('button, span').allTextContents();
  await expect.poll(labels).toEqual(['1', '2', '3', '…', '10', '›']);
  await expect(nav.getByRole('button', { name: 'Previous page' })).toHaveCount(0);

  await nav.getByRole('button', { name: 'Next page' }).click();
  await expect(page).toHaveURL(/\/blog\?page=2$/);
  await expect(nav.getByRole('button', { name: 'Page 2', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.blog-card h3').first()).toHaveText('Article 26');
  await expect(nav.getByRole('button', { name: 'Previous page' })).toBeVisible();

  await nav.getByRole('button', { name: 'Page 10', exact: true }).click();
  await expect.poll(labels).toEqual(['‹', '1', '…', '8', '9', '10', '›']);
  await expect(nav.getByRole('button', { name: 'Next page' })).toBeDisabled();
  await expect(page.locator('.blog-card')).toHaveCount(3);

  await page.goBack();
  await expect(page).toHaveURL(/\/blog\?page=2$/);
  await expect(page.locator('.blog-card h3').first()).toHaveText('Article 26');

  // Returning to the tab re-reads the CMS; the visitor must stay on their page.
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForTimeout(500);
  await expect(nav.getByRole('button', { name: 'Page 2', exact: true })).toHaveAttribute('aria-current', 'page');

  await page.goto('/blog?page=5');
  await expect(nav.getByRole('button', { name: 'Page 5', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect.poll(labels).toEqual(['‹', '1', '…', '4', '5', '6', '…', '10', '›']);
  await page.goto('/blog?page=99');
  await expect(nav.getByRole('button', { name: 'Page 10', exact: true })).toHaveAttribute('aria-current', 'page');

  await page.getByRole('button', { name: 'Technology', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\?category=Technology$/);
  await expect.poll(labels).toEqual(['1', '2', '3', '4', '5', '›']);
  expect(Object.fromEntries(requests.at(-1)!)).toEqual({ page: '1', pageSize: '3', sort: 'latest', category: 'Technology' });
  expect(requests.every(params => params.get('pageSize') === '3')).toBe(true);
});

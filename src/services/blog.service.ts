import axios from 'axios';

import fallback from 'src/content/blog.json';

import { safeHref } from './homepage.service';

export type BlogArticle = {
  id: string; category: string; title: string; description: string;
  date: string; image: string; imageAlt: string; href: string;
};
export type BlogContent = Omit<typeof fallback, 'latest' | 'newsletter'> & {
  latest: Omit<typeof fallback.latest, 'articles' | 'articleCopy'> & { articles: BlogArticle[] };
  newsletter: typeof fallback.newsletter & { enabled: boolean };
};
export const fallbackBlog: BlogContent = {
  ...fallback,
  latest: { ...fallback.latest, articles: fallback.latest.articles.map(article => ({ ...fallback.latest.articleCopy, ...article, imageAlt: '' })) },
  newsletter: { ...fallback.newsletter, enabled: true },
};
const origin = (import.meta.env.VITE_CMS_URL || 'http://localhost:3035').replace(/\/$/, '');
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const string = (value: unknown, defaultValue = '') => typeof value === 'string' ? value : defaultValue;
function image(value: unknown, defaultValue: string) {
  const raw = object(value).url;
  if (typeof raw !== 'string' || !raw.trim()) return defaultValue;
  try {
    const url = new URL(raw, origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : defaultValue;
  } catch { return defaultValue; }
}
function lines(value: unknown, defaultValue: string[]) {
  return Array.isArray(value) && value.length && value.every(line => typeof line === 'string') ? value as string[] : defaultValue;
}
function textFields<T extends Record<string, unknown>>(template: T, value: unknown): T {
  const raw = object(value);
  return Object.fromEntries(Object.entries(template).map(([key, child]) => [key, typeof child === 'string' ? string(raw[key], child) : child])) as T;
}
export function normalizeBlog(payload: unknown): BlogContent {
  const raw = object(payload).data;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Published Blog is unavailable');
  const page = object(raw), hero = object(page.hero), latest = object(page.latest), newsletter = object(page.newsletter);
  const result: BlogContent = {
    ...fallbackBlog,
    hero: { ...textFields(fallback.hero, hero), title: lines(hero.title, fallback.hero.title), image: image(hero.image, fallback.hero.image) },
    featured: { ...textFields(fallback.featured, page.featured), image: image(object(page.featured).image, fallback.featured.image), href: safeHref(object(page.featured).href) || '' },
    categories: Array.isArray(page.categories)
      ? ['All Posts', ...new Set(page.categories.map(item => string(object(item).label)).filter(label => label && label !== 'All Posts'))]
      : fallback.categories,
    latest: {
      ...textFields(fallbackBlog.latest, latest),
      pageSize: typeof latest.pageSize === 'number' ? Math.max(1, Math.min(30, Math.floor(latest.pageSize))) : fallback.latest.pageSize,
      articles: fallbackBlog.latest.articles,
    },
    newsletter: {
      ...textFields(fallbackBlog.newsletter, newsletter),
      title: lines(newsletter.title, fallback.newsletter.title),
      artwork: image(newsletter.artwork, fallback.newsletter.artwork),
      privacyHref: safeHref(newsletter.privacyHref) || '',
      enabled: newsletter.enabled !== false,
    },
  };
  return result;
}
export async function fetchBlog(signal?: AbortSignal) {
  const response = await axios.get(`${origin}/api/blog`, { signal, timeout: 5000 });
  return normalizeBlog(response.data);
}
export type BlogSort = 'latest' | 'oldest' | 'title';
export type BlogArticleQuery = { page: number; pageSize: number; category: string; sort: BlogSort };
export type BlogArticlePage = { articles: BlogArticle[]; total: number };

function normalizeArticle(value: unknown, index: number): BlogArticle {
  const article = object(value);
  return {
    id: string(article.documentId, `article-${index}`),
    category: string(article.category), title: string(article.title), description: string(article.description),
    date: string(article.date), href: safeHref(article.href) || '',
    image: image(article.image, fallback.latest.articles[index % fallback.latest.articles.length].image),
    imageAlt: string(article.imageAlt, string(object(article.image).alternativeText)),
  };
}

// Same filter/sort/page rules as the CMS, applied to the bundled sample articles
// when the CMS cannot be reached.
export function pageFallbackArticles({ page, pageSize, category, sort }: BlogArticleQuery): BlogArticlePage {
  const filtered = fallbackBlog.latest.articles.filter(article => !category || article.category === category);
  filtered.sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) :
    sort === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  return { articles: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

// One page of published articles; the CMS applies the limit and offset.
export async function fetchBlogArticles(query: BlogArticleQuery, signal?: AbortSignal): Promise<BlogArticlePage> {
  const params: Record<string, string | number> = { page: query.page, pageSize: query.pageSize, sort: query.sort };
  if (query.category) params.category = query.category;
  const response = await axios.get(`${origin}/api/blog-articles`, { params, signal, timeout: 5000 });
  const body = object(response.data);
  if (!Array.isArray(body.data)) throw new Error('Blog articles are unavailable');
  const total = Number(object(object(body.meta).pagination).total);
  return {
    articles: body.data.map((item, index) => normalizeArticle(item, (query.page - 1) * query.pageSize + index)),
    total: Number.isFinite(total) && total >= 0 ? total : body.data.length,
  };
}

export async function subscribeToBlog(email: string, signal: AbortSignal) {
  const response = await axios.post(`${origin}/api/newsletter-subscriptions`, { email }, { signal, timeout: 15000 });
  if (object(object(response.data).data).accepted !== true) throw new Error('Subscription unavailable');
}

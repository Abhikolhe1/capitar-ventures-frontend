import './blog.css';

import type { FormEvent } from 'react';
import type { BlogSort, BlogContent } from 'src/services/blog.service';

import { useSearchParams } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

import Portal from '@mui/material/Portal';
import Snackbar from '@mui/material/Snackbar';

import { useBlog } from 'src/hooks/use-blog';
import { useHomepage } from 'src/hooks/use-homepage';
import { useBlogArticles } from 'src/hooks/use-blog-articles';
import { useSectionReveal } from 'src/hooks/use-section-reveal';
import { useSiteReducedMotion } from 'src/hooks/use-site-motion';

import { MainLayout } from 'src/layouts/website/main-layout';
import { subscribeToBlog, fetchBlogArticles } from 'src/services/blog.service';

import { PageMeta } from 'src/components/website/page-meta';
import { SectionBadge } from 'src/components/website/section-badge';
import { FilterSelect } from 'src/components/website/filter-select';
import { ContentButton } from 'src/components/website/content-button';

function Badge({ text, light = false }: { text: string; light?: boolean }) {
  return <SectionBadge text={text} minWidth={0} fontWeight={400} compactMobile color={light ? '#FFFFFF' : '#401E17'} borderColor={light ? '#D9D9D9B3' : '#CC2334'} />;
}

function originalImageCrop(src: string) {
  const path = src.split('?')[0];
  if (/\/(?:founder-conversation\.jpg|blog_founder_conversation_[a-z0-9]+\.jpg)$/.test(path)) return 'founder';
  if (/\/(?:office-conversation\.jpg|blog_office_conversation_[a-z0-9]+\.jpg)$/.test(path)) return 'office';
  if (/\/(?:architecture\.png|blog_architecture_[a-z0-9]+\.png)$/.test(path)) return 'architecture';
  return undefined;
}

function Newsletter({ content }: { content: BlogContent }) {
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get('email') || '').trim();
    controller.current?.abort();
    controller.current = new AbortController();
    setSubmitting(true);
    setMessage('');
    setToast(null);
    try {
      await subscribeToBlog(email, controller.current.signal);
      setMessage('Thank you. Your subscription request has been received.');
      setToast({ ok: true, text: "You're subscribed. We'll email you when new articles are published." });
      form.reset();
    } catch {
      setMessage('We could not subscribe you right now. Please try again later.');
      setToast({ ok: false, text: 'We could not subscribe you right now. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="blog-newsletter" className="blog-newsletter" aria-labelledby="newsletter-title">
      <img className="blog-newsletter__art" data-flow-artwork src={content.newsletter.artwork} alt="" loading="lazy" width="1440" height="445" />
      <div className="blog-newsletter__content" data-scroll-reveal="newsletter-heading">
        <Badge text={content.newsletter.eyebrow} light />
        <h2 id="newsletter-title">{content.newsletter.title.map(line => <span key={line}>{line}</span>)}</h2>
        <p>{content.newsletter.description}</p>
        <form className="blog-subscribe" onSubmit={subscribe} aria-label="Newsletter subscription">
          <label className="blog-sr-only" htmlFor="blog-email">Email address</label>
          <input id="blog-email" name="email" type="email" autoComplete="email" placeholder="Enter your email" required maxLength={254} />
          <button type="submit" className="blog-pill-button" disabled={submitting}>
            {submitting ? 'Subscribing…' : 'Subscribe'}<span><img src="/assets/capitar/arrow.svg" alt="" /></span>
          </button>
        </form>
        <small>By subscribing, you agree to our {content.newsletter.privacyHref ? <a href={content.newsletter.privacyHref}>Privacy Policy</a> : <span>Privacy Policy</span>}.</small>
        <div className="blog-subscribe__status" role="status">{message}</div>
      </div>
      {/* Visible confirmation, rendered at the page root so scroll effects can't move it.
          The status line above is what screen readers announce. */}
      <Portal>
      <Snackbar
        open={!!toast}
        autoHideDuration={6000}
        onClose={(_, reason) => reason !== 'clickaway' && setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <div className={`blog-toast${toast?.ok === false ? ' blog-toast--error' : ''}`}>
          <span className="blog-toast__icon">{toast?.ok === false ? '!' : '✓'}</span>
          <span>{toast?.text}</span>
          <button type="button" className="blog-toast__close" aria-label="Dismiss" onClick={() => setToast(null)}>×</button>
        </div>
      </Snackbar>
      </Portal>
    </section>
  );
}

// Page buttons to show: every page when there are few, otherwise the first, last and
// the current page's neighbours, with gaps ("…") in between.
function pageItems(count: number, current: number): (number | 'gap')[] {
  if (count <= 5) return Array.from({ length: count }, (_, index) => index + 1);
  const pages = new Set([1, count, current - 1, current, current + 1]);
  if (current <= 3) [2, 3].forEach(number => pages.add(number));
  if (current >= count - 2) [count - 2, count - 1].forEach(number => pages.add(number));
  const sorted = [...pages].filter(number => number >= 1 && number <= count).sort((a, b) => a - b);
  return sorted.flatMap((number, index) => (index && number - sorted[index - 1] > 1 ? ['gap' as const, number] : [number]));
}

export default function BlogPage() {
  const { data: content, loaded, fromCms } = useBlog();
  const { content: homepage } = useHomepage();
  const reducedMotion = useSiteReducedMotion();
  const main = useRef<HTMLElement>(null);
  // Page, category and sort live in the URL (?page=2&category=Growth&sort=oldest), so one
  // click changes them together, and the back button and shared links work.
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCategory = searchParams.get('category') || 'All Posts';
  const category = content.categories.includes(requestedCategory) ? requestedCategory : 'All Posts';
  const requestedSort = searchParams.get('sort');
  const sort: BlogSort = requestedSort === 'oldest' || requestedSort === 'title' ? requestedSort : 'latest';
  const requested = Number.parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isFinite(requested) ? Math.max(1, requested) : 1;
  const pageSize = content.latest.pageSize;
  // Only the visible page is requested; the CMS applies the limit and offset.
  const { articles: visible, total, ready, loading, current } = useBlogArticles({
    page, pageSize, sort, category: category === 'All Posts' ? '' : category,
  }, loaded);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  // Placeholder articles have no destination. The grid and its filters appear once a
  // published article links somewhere, and only categories that hold articles are offered.
  const [catalogue, setCatalogue] = useState<{ live: boolean; counts: Record<string, number> } | null>(null);
  const categoryKey = content.categories.join('|');
  useEffect(() => {
    if (!loaded) return undefined;
    const controller = new AbortController();
    Promise.all(content.categories.map(item => fetchBlogArticles(
      { page: 1, pageSize: item === 'All Posts' ? pageSize : 1, sort: 'latest', category: item === 'All Posts' ? '' : item },
      controller.signal
    ).then(result => [item, result] as const)))
      .then(results => setCatalogue({
        live: results.some(([item, result]) => item === 'All Posts' && result.articles.some(article => article.href)),
        counts: Object.fromEntries(results.map(([item, result]) => [item, result.total])),
      }))
      // CMS unreachable: keep the bundled sample layout, as before.
      .catch(() => { if (!controller.signal.aborted) setCatalogue({ live: true, counts: {} }); });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, categoryKey, pageSize]);
  const articlesLive = !!catalogue?.live;
  const categories = content.categories.filter(item => item === 'All Posts' || (catalogue?.counts[item] ?? 1) > 0);
  // A featured story without a link is hidden on the live CMS; during a CMS outage the
  // complete bundled page is kept, as on the site's other pages.
  const featuredVisible = (!!content.featured.href || (loaded && !fromCms)) && (category === 'All Posts' || category === content.featured.category);
  const signature = `${category}-${sort}-${page}-${visible.map(article => article.id).join()}-${JSON.stringify(content)}`;
  useSectionReveal(main, signature);

  function updateQuery(changes: Record<string, string | number | null>, scroll = false) {
    setSearchParams(params => {
      const next = new URLSearchParams(params);
      for (const [name, value] of Object.entries(changes)) {
        if (value === null) next.delete(name);
        else next.set(name, String(value));
      }
      return next;
    }, { preventScrollReset: true });
    if (scroll) {
      document.getElementById('blog-latest')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }
  const goToPage = (number: number) => updateQuery({ page: number > 1 ? number : null }, true);
  const selectCategory = (value: string) => updateQuery({ category: value === 'All Posts' ? null : value, page: null });
  const selectSort = (value: string) => updateQuery({ sort: value === 'latest' ? null : value, page: null });

  // A link to a page past the end (e.g. after articles were removed) lands on the last
  // page, judged only from the results for this exact page/category/sort.
  useEffect(() => {
    if (current && total > 0 && page > pageCount) updateQuery({ page: pageCount > 1 ? pageCount : null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, total, page, pageCount]);

  return (
    <MainLayout global={homepage.global} mainRef={main} mainClassName="blog-page" contentVersion={signature}>
      <PageMeta setTitle title="News & Insights | Capitar Ventures" description={content.hero.description} path="/blog" />
      <section id="blog-hero" className="blog-hero" aria-labelledby="blog-title">
        <div className="blog-hero__art" data-entrance="background" aria-hidden="true">
          {/* Original Figma image-fill transform, read from its native SVG export. */}
          <svg viewBox="0 0 1 1" preserveAspectRatio="none"><image href={content.hero.image} width="887" height="1774" preserveAspectRatio="none" transform="matrix(0 -0.00120339 0.000563698 0 0.168008 1.0337)" /></svg>
        </div>
        <div className="blog-container blog-hero__content">
          <div data-entrance="content"><Badge text={content.hero.eyebrow} light /></div>
          <h1 id="blog-title" data-entrance="heading">{content.hero.title.map((line, index) => <span key={line} className={index === 2 ? 'blog-hero__emphasis' : undefined}>{line}</span>)}</h1>
          <p data-entrance="content">{content.hero.description}</p>
        </div>
      </section>
      {(articlesLive || featuredVisible) && <section id="blog-featured" className="blog-featured" aria-label="Browse insights">
        <div className="blog-container">
          {articlesLive && <div className="blog-toolbar">
            <div className="blog-categories" role="group" aria-label="Filter articles by category">
              {categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => selectCategory(item)}>{item}</button>)}
            </div>
            <FilterSelect
              id="blog-sort"
              className="blog-sort"
              label="Sort articles"
              hideLabel
              menuAlign="right"
              value={sort}
              options={[{ value: 'latest', label: 'Latest first' }, { value: 'oldest', label: 'Oldest first' }, { value: 'title', label: 'Title A–Z' }]}
              onChange={selectSort}
            />
          </div>}
          {featuredVisible && <article className="blog-feature" data-scroll-reveal="featured-article">
            <img className="blog-feature__image" src={content.featured.image} alt={content.featured.imageAlt} width="1241" height="440" />
            <div className="blog-feature__copy">
              <Badge text={`FEATURED  /  ${content.featured.category.toUpperCase()}`} light />
              <h2>{content.featured.title}<strong>{content.featured.emphasis}</strong></h2>
              <p>{content.featured.description}</p>
              <div className="blog-feature__meta"><time dateTime={content.featured.date}>{content.featured.dateLabel}</time><span>{content.featured.readingTime}</span></div>
            </div>
            <div className="blog-feature__cta">
              <ContentButton data={{ label: 'Know More', href: content.featured.href, enabled: !!content.featured.href }} arrow />
            </div>
          </article>}
        </div>
      </section>}
      {articlesLive && <section id="blog-latest" className="blog-latest" aria-labelledby="latest-title">
        <div className="blog-container">
          <div className="blog-latest__heading" data-scroll-reveal="latest-heading"><Badge text={content.latest.eyebrow} /><h2 id="latest-title">{content.latest.title}</h2></div>
          <div className="blog-sr-only" role="status">{ready ? `${total} articles${category !== 'All Posts' ? ` in ${category}` : ''}` : ''}</div>
          {!ready ? <div className="blog-grid" aria-busy="true" /> : visible.length ? <div className="blog-grid" aria-busy={loading}>
            {visible.map(article => <article className="blog-card" key={article.id} data-scroll-reveal="article-card">
              <div className="blog-card__copy">
                <div className="blog-card__top"><span>{article.category.toUpperCase()}</span>
                  {article.href ? <a className="blog-card__arrow" href={article.href} aria-label={`Read ${article.title}`}><img src="/assets/capitar/arrow.svg" alt="" /></a> : <span className="blog-card__arrow" aria-label="Article coming soon" title="Article coming soon"><img src="/assets/capitar/arrow.svg" alt="" /></span>}
                </div>
                <div><h3>{article.href ? <a href={article.href}>{article.title}</a> : article.title}</h3><p>{article.description}</p></div>
              </div>
              <div className="blog-card__media" data-crop={originalImageCrop(article.image)}><img className="blog-card__image" src={article.image} alt={article.imageAlt} loading="lazy" width="384" height="209" /></div>
            </article>)}
          </div> : <p className="blog-empty">No articles in this category yet. <button type="button" onClick={() => selectCategory('All Posts')}>View all posts</button></p>}
          {visible.length > 0 && <nav className="blog-pagination" aria-label="Article pages">
            {page > 1 && <button type="button" aria-label="Previous page" onClick={() => goToPage(page - 1)}>‹</button>}
            {pageItems(pageCount, page).map((item, index) => item === 'gap'
              ? <span key={`gap-${index}`} aria-hidden="true">…</span>
              : <button type="button" key={item} aria-label={`Page ${item}`} aria-current={page === item ? 'page' : undefined} onClick={() => page !== item && goToPage(item)}>{item}</button>)}
            <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => goToPage(page + 1)}>›</button>
          </nav>}
        </div>
      </section>}
      {content.newsletter.enabled && <Newsletter content={content} />}
    </MainLayout>
  );
}

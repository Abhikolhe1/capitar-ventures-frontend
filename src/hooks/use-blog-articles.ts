import type { BlogArticlePage, BlogArticleQuery } from 'src/services/blog.service';

import { useState, useEffect } from 'react';

import { fetchBlogArticles, pageFallbackArticles } from 'src/services/blog.service';

// Loads only the requested page of articles. The previous page stays on screen
// while the next one loads; if the CMS is unreachable the bundled samples are paged.
export function useBlogArticles(query: BlogArticleQuery, enabled = true) {
  const { page, pageSize, category, sort } = query;
  const key = JSON.stringify([page, pageSize, category, sort]);
  const [result, setResult] = useState<(BlogArticlePage & { key: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!enabled) return undefined;
    const current = { page, pageSize, category, sort };
    const controller = new AbortController();
    let request = 0;
    const load = async () => {
      const id = ++request;
      setLoading(true);
      try {
        const next = await fetchBlogArticles(current, controller.signal);
        if (!controller.signal.aborted && id === request) setResult({ ...next, key });
      } catch {
        if (!controller.signal.aborted && id === request) setResult({ ...pageFallbackArticles(current), key });
      } finally {
        if (!controller.signal.aborted && id === request) setLoading(false);
      }
    };
    void load();
    // Pick up newly published articles when the visitor returns to the tab.
    window.addEventListener('focus', load);
    return () => {
      controller.abort();
      window.removeEventListener('focus', load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  return {
    articles: result?.articles ?? [],
    total: result?.total ?? 0,
    ready: result !== null,
    loading,
    /** True when the shown articles belong to the current page/category/sort. */
    current: result?.key === key && !loading,
  };
}

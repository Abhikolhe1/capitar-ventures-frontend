import { useRef, useState, useEffect } from 'react';

import fallback from 'src/content/portfolio.json';
import {
  type CompanyPage,
  type CompanyQuery,
  paginateCompanies,
  fetchPortfolioCompanies,
} from 'src/services/portfolio.service';

// Fetches company batches with optional accumulation for Load more. Keep the
// loaded list during requests and retry failed later batches without mixing sources.
export function usePortfolioCompanies({ limit, skip, sector = '', stage = '', append = false }: CompanyQuery & { append?: boolean }) {
  const cache = useRef(new Map<number, CompanyPage>());
  const source = useRef({ key: '', fallback: false });
  const [failed, setFailed] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const [page, setPage] = useState<CompanyPage>(() =>
    paginateCompanies(fallback.companies, { limit, skip, sector, stage })
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    let request = 0;
    const query = { limit, skip, sector, stage };
    const key = JSON.stringify([limit, sector, stage, append]);
    if (source.current.key !== key) {
      source.current = { key, fallback: false };
      cache.current.clear();
    }
    const publish = (result: CompanyPage) => {
      if (!append) { setPage(result); return; }
      cache.current.set(skip, result);
      const companies = [...cache.current.entries()].filter(([offset]) => offset <= skip)
        .sort(([a], [b]) => a - b).flatMap(([, batch]) => batch.companies);
      setPage({ ...result, companies });
    };
    const refresh = async (background: boolean) => {
      const current = ++request;
      if (!background) setLoading(true);
      if (!background) setFailed(false);
      try {
        const result = append && source.current.fallback
          ? paginateCompanies(fallback.companies, query)
          : await fetchPortfolioCompanies(query, controller.signal);
        if (!controller.signal.aborted && current === request) {
          publish(result);
          setFailed(false);
        }
      } catch {
        // A failed background refresh keeps the last valid page on screen.
        if (!background && !controller.signal.aborted && current === request) {
          if (append && skip > 0) setFailed(true);
          else {
            source.current.fallback = true;
            publish(paginateCompanies(fallback.companies, query));
          }
        }
      } finally {
        if (!controller.signal.aborted && current === request) setLoading(false);
      }
    };
    const onFocus = () => void refresh(true);
    void refresh(false);
    window.addEventListener('focus', onFocus);
    return () => {
      controller.abort();
      window.removeEventListener('focus', onFocus);
    };
  }, [limit, skip, sector, stage, append, retryVersion]);
  return { ...page, loading, failed, retry: () => setRetryVersion(value => value + 1) };
}

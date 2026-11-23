import { useState, useEffect } from 'react';

import fallback from 'src/content/portfolio.json';
import {
  type CompanyPage,
  type CompanyQuery,
  paginateCompanies,
  fetchPortfolioCompanies,
} from 'src/services/portfolio.service';

// Fetches one page of portfolio companies (limit/skip) with the active filters.
// The previous page stays on screen while the next one loads; if the CMS is
// unreachable the bundled companies are paginated locally instead.
export function usePortfolioCompanies({ limit, skip, sector = '', stage = '' }: CompanyQuery) {
  const [page, setPage] = useState<CompanyPage>(() =>
    paginateCompanies(fallback.companies, { limit, skip, sector, stage })
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    let request = 0;
    const query = { limit, skip, sector, stage };
    const refresh = async (background: boolean) => {
      const current = ++request;
      if (!background) setLoading(true);
      try {
        const result = await fetchPortfolioCompanies(query, controller.signal);
        if (!controller.signal.aborted && current === request) setPage(result);
      } catch {
        // A failed background refresh keeps the last valid page on screen.
        if (!background && !controller.signal.aborted && current === request)
          setPage(paginateCompanies(fallback.companies, query));
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
  }, [limit, skip, sector, stage]);
  return { ...page, loading };
}

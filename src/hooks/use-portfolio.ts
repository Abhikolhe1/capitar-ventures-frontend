import { useState, useEffect } from 'react';

import fallback from 'src/content/portfolio.json';
import { fetchPortfolio, type PortfolioContent } from 'src/services/portfolio.service';

export function usePortfolio() {
  const [data, setData] = useState<PortfolioContent>(fallback);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    let request = 0;
    const refresh = async () => {
      const current = ++request;
      try {
        const content = await fetchPortfolio(controller.signal);
        if (!controller.signal.aborted && current === request) setData(content);
      } catch {
        /* Preserve the last valid content during CMS outages. */
      } finally {
        if (!controller.signal.aborted && current === request) setLoading(false);
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => {
      controller.abort();
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return { data, loading };
}

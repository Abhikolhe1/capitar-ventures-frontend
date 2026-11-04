import { useState, useEffect } from 'react';

import fallback from 'src/content/venture-debt.json';
import { fetchVentureDebt, type VentureDebtContent } from 'src/services/venture-debt.service';

export function useVentureDebt() {
  const [content, setContent] = useState<VentureDebtContent>(fallback);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const result = await fetchVentureDebt(controller.signal);
        if (!controller.signal.aborted) setContent(result);
      } catch {
        /* Keep the last valid content when the CMS is unavailable. */
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => {
      controller.abort();
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return { content, loading };
}

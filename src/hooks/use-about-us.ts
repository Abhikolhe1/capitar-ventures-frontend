import { useState, useEffect } from 'react';

import fallback from 'src/content/about-us.json';
import { fetchAboutUs, type AboutUsContent } from 'src/services/about-us.service';

export function useAboutUs() {
  const [data, setData] = useState<AboutUsContent>(fallback);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    let request = 0;
    const refresh = async () => {
      const current = ++request;
      try {
        const content = await fetchAboutUs(controller.signal);
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

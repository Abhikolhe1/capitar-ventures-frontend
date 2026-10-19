import type { HomepageContent } from 'src/types/homepage';

import { useState, useEffect } from 'react';

import fallback from 'src/content/homepage.json';
import { fetchHomepage } from 'src/services/homepage.service';

export function useHomepage() {
  const [content, setContent] = useState<HomepageContent>(fallback);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = () =>
      fetchHomepage(controller.signal)
        .then((data) => {
          if (!controller.signal.aborted) {
            setContent(data);
            setUnavailable(false);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) setUnavailable(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    void refresh();
    window.addEventListener('focus', refresh);
    return () => {
      controller.abort();
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return { content, loading, unavailable };
}

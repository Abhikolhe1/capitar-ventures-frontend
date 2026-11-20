import { useState, useEffect } from 'react';

import { fetchBlog, fallbackBlog } from 'src/services/blog.service';

export function useBlog() {
  const [data, setData] = useState(fallbackBlog);
  // True once the first CMS answer (or failure) is in, so article paging uses the real page size.
  const [loaded, setLoaded] = useState(false);
  // True once content came from the CMS (false while showing the bundled fallback).
  const [fromCms, setFromCms] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let request = 0;
    const refresh = async () => {
      const current = ++request;
      try {
        const content = await fetchBlog(controller.signal);
        if (!controller.signal.aborted && current === request) { setData(content); setFromCms(true); }
      } catch { /* Keep the Figma content or last successful CMS response on failure. */ }
      finally { if (!controller.signal.aborted) setLoaded(true); }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { controller.abort(); window.removeEventListener('focus', refresh); };
  }, []);
  return { data, loaded, fromCms };
}

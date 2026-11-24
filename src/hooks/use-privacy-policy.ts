import { useState, useEffect } from 'react';

import { fetchPrivacyPolicy, privacyPolicyFallback } from 'src/services/privacy-policy.service';

export function usePrivacyPolicy() {
  const [data, setData] = useState(privacyPolicyFallback);
  useEffect(() => {
    const controller = new AbortController();
    let request = 0;
    const refresh = async () => {
      const current = ++request;
      try {
        const content = await fetchPrivacyPolicy(controller.signal);
        if (!controller.signal.aborted && current === request) setData(content);
      } catch {
        // Retain readable Figma content or the last published content during CMS outages.
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => {
      controller.abort();
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return data;
}

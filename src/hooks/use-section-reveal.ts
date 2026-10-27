import type { RefObject } from 'react';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';

import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';
import { createDirectionalReveal } from 'src/hooks/reveal-from-above';

export function useSectionReveal(scope: RefObject<HTMLElement | null>, signature: string) {
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const disposers: (() => void)[] = [];
    const context = gsap.context(() => {
      scope.current?.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach(element => {
        const metrics = element.dataset.scrollReveal === 'proof-metrics';
        const heading = element.dataset.scrollReveal?.includes('heading');
        disposers.push(createDirectionalReveal(
          metrics ? element.querySelectorAll('[data-proof-value]') : element,
          element,
          { opacity: 0, y: metrics ? 24 : 20 },
          { opacity: 1, y: 0, ...(metrics ? { stagger: 0.1 } : {}), duration: heading ? 0.85 : 0.7, ease: 'power2.out' }
        ));
      });
    }, scope);
    const cancel = scheduleScrollRefresh();
    return () => { cancel(); disposers.forEach(dispose => dispose()); context.revert(); };
  }, [scope, signature]);
}

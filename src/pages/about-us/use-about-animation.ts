import type { RefObject } from 'react';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';

import { useSiteReducedMotion } from 'src/hooks/use-site-motion';
import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';
import { createDirectionalReveal } from 'src/hooks/reveal-from-above';

export function useAboutAnimation(scope: RefObject<HTMLElement | null>, version: string) {
  const reducedMotion = useSiteReducedMotion();
  useLayoutEffect(() => {
    const root = scope.current;
    if (!root) return undefined;
    const dispose: (() => void)[] = [];
    const context = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach((element) => {
        if (element.closest('#belief')) return;
        // Separate heading, supporting copy and card entrances are visible on native wheel/touch.
        const children = element.dataset.scrollReveal?.includes('heading')
          ? Array.from(element.children)
          : [];
        const targets = children.length ? children : element;
        dispose.push(
          createDirectionalReveal(
            targets,
            element,
            { opacity: 0, y: 48 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              stagger: children.length ? 0.12 : 0,
              ease: 'power2.out',
            },
            'top 88%'
          )
        );
      });
      // Full-bleed artwork stays fixed. The shared color-flow hook grades its surface
      // against the section color, rather than sliding a rectangular image across it.
    }, root);
    const cancel = scheduleScrollRefresh();
    return () => {
      cancel();
      dispose.forEach((fn) => fn());
      context.revert();
    };
  }, [scope, version, reducedMotion]);
}

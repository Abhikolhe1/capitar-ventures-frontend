import type { RefObject } from 'react';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';

import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';
import { createDirectionalReveal } from 'src/hooks/reveal-from-above';

export function useCaseStudyAnimation(scope: RefObject<HTMLElement | null>, signature: string) {
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const disposers: (() => void)[] = [];
    const context = gsap.context(() => {
      scope.current?.querySelectorAll<HTMLElement>('[data-case-header], [data-case-deck], [data-case-thumbnails]').forEach(element => {
        disposers.push(createDirectionalReveal(element, element, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power2.out' }));
      });
    }, scope);
    const cancel = scheduleScrollRefresh();
    return () => { cancel(); disposers.forEach(dispose => dispose()); context.revert(); };
  }, [scope, signature]);
}

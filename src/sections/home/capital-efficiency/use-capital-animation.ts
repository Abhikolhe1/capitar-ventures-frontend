import type { RefObject } from 'react';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';

import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';
import { createDirectionalReveal } from 'src/hooks/reveal-from-above';

export function useCapitalAnimation(scope: RefObject<HTMLElement | null>, signature: string) {
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const disposers: (() => void)[] = [];
    const context = gsap.context(() => {
      scope.current?.querySelectorAll<HTMLElement>('[data-capital-card]').forEach(card => {
        disposers.push(createDirectionalReveal(card, card, { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out' }));
      });
    }, scope);
    const cancel = scheduleScrollRefresh();
    return () => { cancel(); disposers.forEach(dispose => dispose()); context.revert(); };
  }, [scope, signature]);
}

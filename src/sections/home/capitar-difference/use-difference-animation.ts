import type { RefObject } from 'react';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';

import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';
import { createDirectionalReveal } from 'src/hooks/reveal-from-above';

export function useDifferenceAnimation(scope: RefObject<HTMLElement | null>, signature: string) {
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const disposers: (() => void)[] = [];
    const context = gsap.context(() => {
      const section = scope.current!;
      const intro = section.querySelectorAll('[data-difference-heading], [data-difference-intro-description]');
      disposers.push(createDirectionalReveal(intro, section, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power2.out' }));
      section.querySelectorAll<HTMLElement>('[data-difference-card]').forEach(card => {
        const content = card.querySelectorAll('[data-difference-title], [data-difference-description], [data-difference-image]');
        disposers.push(createDirectionalReveal(content, card, { autoAlpha: 0, y: 18, filter: 'blur(3px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.06, ease: 'power2.out' }));
      });
    }, scope);
    const cancel = scheduleScrollRefresh();
    return () => { cancel(); disposers.forEach(dispose => dispose()); context.revert(); };
  }, [scope, signature]);
}

import type { RefObject } from 'react';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';

import { useSiteReducedMotion } from 'src/hooks/use-site-motion';
import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';
import { createDirectionalReveal } from 'src/hooks/reveal-from-above';

export function useDifferenceAnimation(scope: RefObject<HTMLElement | null>, signature: string) {
  const reducedMotion = useSiteReducedMotion();
  const desktop = useMediaQuery('(min-width:1200px)');
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const disposers: (() => void)[] = [];
    const context = gsap.context(() => {
      const section = scope.current!;
      const intro = section.querySelectorAll('[data-difference-heading], [data-difference-intro-description]');
      disposers.push(createDirectionalReveal(intro, section, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power2.out' }, desktop ? 'top 85%' : 'top 70%'));
      section.querySelectorAll<HTMLElement>('[data-difference-card]').forEach((card, index) => {
        const content = card.querySelectorAll('[data-difference-title], [data-difference-description], [data-difference-image]');
        disposers.push(createDirectionalReveal(content, card, { autoAlpha: 0, y: 18, filter: 'blur(3px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.06, ease: 'power2.out' }, desktop && index === 0 ? 'top 85%' : 'top 70%'));
      });
    }, scope);
    const cancel = scheduleScrollRefresh();
    return () => { cancel(); disposers.forEach(dispose => dispose()); context.revert(); };
  }, [scope, signature, reducedMotion, desktop]);
}

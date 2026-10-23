import type { RefObject } from 'react';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';

gsap.registerPlugin(ScrollTrigger);

export function useProofTextFill(scope: RefObject<HTMLElement | null>, signature: string) {
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('all', () => {
        const heading = scope.current?.querySelector<HTMLElement>('#proof-heading');
        const words = heading?.querySelectorAll<HTMLElement>('[data-proof-word]');
        if (!heading || !words?.length) return;
        gsap.set(words, { color: '#D8DADD' });
        gsap.to(words, {
          color: (_index, element: HTMLElement) => element.dataset.proofColor || '#121212',
          duration: 0.15, stagger: 0.12, ease: 'none',
          scrollTrigger: { trigger: heading, start: 'top 60%', end: 'bottom 35%', scrub: 0.2 },
        });
      });
    }, scope);
    const cancelRefresh = scheduleScrollRefresh();
    return () => { cancelRefresh(); media.revert(); context.revert(); };
  }, [scope, signature]);
}

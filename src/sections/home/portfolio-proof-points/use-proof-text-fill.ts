import type { RefObject } from 'react';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';

import { websiteTokens } from 'src/theme/website-theme';

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
        gsap.set(words, { color: websiteTokens.proof.mutedInk });
        gsap.to(words, {
          color: websiteTokens.proof.ink,
          duration: 0.15, stagger: 0.12, ease: 'none',
          scrollTrigger: { trigger: heading, start: 'top 60%', end: 'bottom 35%', scrub: 0.2 },
        });
      });
    }, scope);
    const cancelRefresh = scheduleScrollRefresh();
    return () => { cancelRefresh(); media.revert(); context.revert(); };
  }, [scope, signature]);
}

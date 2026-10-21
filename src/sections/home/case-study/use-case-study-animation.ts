import type { RefObject } from 'react';

import gsap from 'gsap';
import { useRef, useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export function useCaseStudyAnimation(scope: RefObject<HTMLElement | null>, signature: string) {
  const entered = useRef(false);
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        if (entered.current) return;
        gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: scope.current, start: 'top 80%', once: true, onEnter: () => { entered.current = true; } } })
          .fromTo('[data-case-header]', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.1, clearProps: 'transform' }, 0)
          .fromTo('[data-case-deck]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, clearProps: 'transform' }, 0.15);
      });
    }, scope);
    let active = true;
    void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
    return () => { active = false; media.revert(); context.revert(); };
  }, [scope, signature]);
}

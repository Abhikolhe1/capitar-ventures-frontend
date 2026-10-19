import gsap from 'gsap';
import { type RefObject, useLayoutEffect } from 'react';

// One timeline owns all entrance targets, including the independent layout header.
export function useHeroAnimation(scope: RefObject<HTMLDivElement | null>, ready: boolean) {
  useLayoutEffect(() => {
    if (!ready || !scope.current) return undefined;
    const context = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        timeline
          .fromTo(
            '[data-entrance="heading"]',
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 1.1 },
            0.15
          )
          .fromTo(
            '[data-entrance="content"]',
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 },
            0.3
          )
          .fromTo(
            '[data-entrance="header"]',
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.8 },
            0.8
          )
          .fromTo(
            '[data-entrance="clients"]',
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.8 },
            0.7
          )
          .fromTo(
            '[data-entrance="background"]',
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 1.2 },
            0.45
          );
        return () => {
          timeline.kill();
        };
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-entrance]', { autoAlpha: 1, clearProps: 'transform' });
      });
      return () => mm.revert();
    }, scope);
    return () => context.revert();
  }, [scope, ready]);
}

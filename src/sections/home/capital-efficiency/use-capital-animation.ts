import type { RefObject } from 'react';

import gsap from 'gsap';
import { useRef, useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';

gsap.registerPlugin(ScrollTrigger);

export function useCapitalAnimation(scope: RefObject<HTMLElement | null>, signature: string) {
  const revealed = useRef(new Set<number>());
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const mm = gsap.matchMedia();
    const context = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cancelRefresh = scheduleScrollRefresh();
        gsap.utils
          .toArray<HTMLElement>('[data-capital-card]', scope.current)
          .forEach((card, index) => {
            if (revealed.current.has(index)) return;
            gsap.fromTo(
              card,
              { autoAlpha: 0, y: 15 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 92%',
                  once: true,
                  onEnter: () => {
                    revealed.current.add(index);
                  },
                },
              }
            );
          });
        return cancelRefresh;
      });
    }, scope);
    return () => {
      mm.revert();
      context.revert();
    };
  }, [scope, signature]);
}

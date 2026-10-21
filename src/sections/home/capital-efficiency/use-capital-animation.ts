import type { RefObject } from 'react';

import gsap from 'gsap';
import { useRef, useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useCapitalAnimation(scope: RefObject<HTMLElement | null>, signature: string) {
  const revealed = useRef(new Set<number>());
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const mm = gsap.matchMedia();
    const context = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        let active = true;
        void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
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
        return () => { active = false; };
      });
    }, scope);
    return () => {
      mm.revert();
      context.revert();
    };
  }, [scope, signature]);
}

import type { RefObject } from 'react';

import gsap from 'gsap';
import { useRef, useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Animate groups, not carousel slides, so horizontal scrolling and focus stay stable.
export function useSectionReveal(scope: RefObject<HTMLElement | null>, signature: string) {
  const completed = useRef(new Set<string>());
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        scope.current?.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach(element => {
          const key = element.dataset.scrollReveal!;
          if (completed.current.has(key)) return;
          const heading = key.includes('heading');
          gsap.fromTo(element, { opacity: 0, y: heading ? 30 : 24 }, {
            opacity: 1, y: 0, duration: heading ? 1.1 : 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 90%', once: true, onEnter: () => { completed.current.add(key); } },
            onComplete: () => { gsap.set(element, { clearProps: 'transform' }); },
          });
        });
      });
    }, scope);
    let active = true;
    void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
    return () => { active = false; media.revert(); context.revert(); };
  }, [scope, signature]);
}

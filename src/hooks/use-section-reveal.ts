import type { RefObject } from 'react';

import gsap from 'gsap';
import { useRef, useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';

gsap.registerPlugin(ScrollTrigger);

// Match the hero's policy: reveals run under either OS motion preference.
// Animate groups, not carousel slides, so horizontal scrolling and focus stay stable.
export function useSectionReveal(scope: RefObject<HTMLElement | null>, signature: string) {
  const completed = useRef(new Set<string>());
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('all', () => {
        scope.current?.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach(element => {
          const key = element.dataset.scrollReveal!;
          if (completed.current.has(key)) return;
          if (key === 'proof-metrics') {
            const values = element.querySelectorAll<HTMLElement>('[data-proof-value]');
            gsap.fromTo(values, { opacity: 0, y: 32, filter: 'blur(6px)' }, {
              opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.14, ease: 'power3.out',
              scrollTrigger: { trigger: element, start: 'top 90%', once: true, onEnter: () => { completed.current.add(key); } },
              onComplete: () => { gsap.set(values, { clearProps: 'transform,filter,opacity' }); },
            });
            return;
          }
          const heading = key.includes('heading');
          gsap.fromTo(element, { opacity: 0, y: heading ? 30 : 24 }, {
            opacity: 1, y: 0, duration: heading ? 1.1 : 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 90%', once: true, onEnter: () => { completed.current.add(key); } },
            onComplete: () => { gsap.set(element, { clearProps: 'transform' }); },
          });
        });
      });
    }, scope);
    const cancelRefresh = scheduleScrollRefresh();
    return () => { cancelRefresh(); media.revert(); context.revert(); };
  }, [scope, signature]);
}

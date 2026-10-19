import type { RefObject } from 'react';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Fitted to Framer's observed settling count-up; no badge/heading motion was shown.
const counterMotion = { duration: 1.2, ease: 'power4.out' };

export function usePortfolioAnimation(scope: RefObject<HTMLElement | null>, signature: string) {
  useLayoutEffect(() => {
    const section = scope.current;
    if (!section) return undefined;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const refresh = () => ScrollTrigger.refresh();
        section.querySelectorAll<HTMLElement>('[data-proof-metric]').forEach(metric => {
          const number = metric.querySelector<HTMLElement>('[data-proof-number]');
          if (!number) return;
          const target = Number(number.dataset.value);
          const decimals = Math.min(6, (String(target).split('.')[1] || '').length);
          const count = { value: 0 };
          number.textContent = count.value.toFixed(decimals);
          const tween = gsap.to(count, {
            value: target, ...counterMotion, paused: true,
            onUpdate: () => { number.textContent = count.value.toFixed(decimals); },
            onComplete: () => { number.textContent = String(target); },
          });
          ScrollTrigger.create({
            trigger: metric, start: 'bottom bottom', once: true,
            onEnter: () => { tween.play(); },
          });
        });
        // Fonts can change layout after a refresh or a direct scrolled-page load.
        let active = true;
        void document.fonts.ready.then(() => { if (active) refresh(); });
        return () => { active = false; };
      });
      media.add('(prefers-reduced-motion: reduce)', () => {
        section.querySelectorAll<HTMLElement>('[data-proof-number]').forEach(number => {
          number.textContent = number.dataset.value || '';
        });
      });
    }, section);
    return () => { media.revert(); context.revert(); };
  }, [scope, signature]);
}

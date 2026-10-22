import type { RefObject } from 'react';

import gsap from 'gsap';
import { useRef, useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';

gsap.registerPlugin(ScrollTrigger);

export function useDifferenceAnimation(scope: RefObject<HTMLElement | null>, signature: string) {
  const completed = useRef(new Set<string>());
  useLayoutEffect(() => {
    if (!scope.current) return undefined;
    const context = gsap.context(() => {
      const reveal = (el: HTMLElement, key: string, blur: number, y = 20) => {
        if (completed.current.has(key)) return;
        gsap.fromTo(
          el,
          { autoAlpha: 0, y, filter: `blur(${blur}px)` },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              once: true,
              onEnter: () => {
                completed.current.add(key);
              },
            },
            onComplete: () => {
              gsap.set(el, { clearProps: 'transform,filter' });
            },
          }
        );
      };
      const heading = scope.current?.querySelector<HTMLElement>('[data-difference-heading]');
      const description = scope.current?.querySelector<HTMLElement>(
        '[data-difference-intro-description]'
      );
      if (heading) reveal(heading, 'heading', 8);
      if (description) reveal(description, 'description', 0);
      scope.current
        ?.querySelectorAll<HTMLElement>('[data-difference-card]')
        .forEach((card, index) => {
          for (const [selector, blur, y] of [
            ['[data-difference-title]', 5, 20],
            ['[data-difference-description]', 2, 20],
            ['[data-difference-image]', 0, 0],
          ] as const) {
            const el = card.querySelector<HTMLElement>(selector);
            if (el) reveal(el, `${index}-${selector}`, blur, y);
          }
        });
      return scheduleScrollRefresh();
    }, scope);
    return () => {
      context.revert();
    };
  }, [scope, signature]);
}

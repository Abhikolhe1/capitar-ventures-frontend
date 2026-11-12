import type { RefObject } from 'react';

import gsap from 'gsap';
import { useRef, useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useSiteReducedMotion } from 'src/hooks/use-site-motion';
import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';
import { createDirectionalReveal } from 'src/hooks/reveal-from-above';

gsap.registerPlugin(ScrollTrigger);
export function useBeliefSticky(
  scope: RefObject<HTMLElement | null>,
  version: string,
  count: number,
  activate: (index: number) => void
) {
  const controller = useRef<ScrollTrigger | null>(null);
  const reducedMotion = useSiteReducedMotion();
  useLayoutEffect(() => {
    const section = scope.current?.querySelector<HTMLElement>('#belief');
    if (!section) return undefined;
    const dispose: (() => void)[] = [];
    const context = gsap.context(() => {
      // Track the whole section so entry reveals stay visible throughout the sticky hold.
      section.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach((element) => {
        dispose.push(
          createDirectionalReveal(
            element,
            section,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' },
            'top 88%'
          )
        );
      });
      const media = gsap.matchMedia();
      media.add('(min-width: 900px) and (min-height: 700px) and (pointer: fine)', () => {
        const inner = section.querySelector<HTMLElement>('.about-belief-inner');
        if (count < 2 || !inner || inner.offsetHeight + 32 > window.innerHeight - 68)
          return undefined;
        section.dataset.beliefSticky = 'true';
        let current = -1;
        const update = (trigger: ScrollTrigger) => {
          const index = Math.min(count - 1, Math.max(0, Math.floor(trigger.progress * count)));
          if (current !== index) {
            current = index;
            activate(index);
          }
        };
        controller.current = ScrollTrigger.create({
          trigger: section,
          start: 'top 68px',
          end: 'bottom bottom',
          invalidateOnRefresh: true,
          onUpdate: update,
          onRefresh: update,
        });
        update(controller.current);
        return () => {
          controller.current?.kill();
          controller.current = null;
          delete section.dataset.beliefSticky;
        };
      });
      dispose.push(() => media.revert());
    }, section);
    const cancel = scheduleScrollRefresh();
    return () => {
      cancel();
      dispose.forEach((fn) => fn());
      context.revert();
    };
  }, [scope, version, count, activate, reducedMotion]);
  return (index: number) => {
    activate(index);
    const trigger = controller.current;
    if (trigger)
      window.scrollTo({
        top: trigger.start + ((trigger.end - trigger.start) * (index + 0.35)) / count,
        behavior: 'smooth',
      });
  };
}

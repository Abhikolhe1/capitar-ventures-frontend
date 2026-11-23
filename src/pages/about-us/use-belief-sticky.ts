import type { RefObject } from 'react';

import gsap from 'gsap';
import { useRef, useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useSiteReducedMotion } from 'src/hooks/use-site-motion';
import { scheduleScrollRefresh } from 'src/hooks/scroll-refresh';
import { createDirectionalReveal } from 'src/hooks/reveal-from-above';

gsap.registerPlugin(ScrollTrigger);

const beliefStickyMedia =
  '(min-width: 900px) and (min-height: 640px), (max-width: 899px) and (min-height: 600px)';
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
      // Same breakpoints as Venture Debt's "With Capitar" steps (keep in sync with CSS):
      // desktop pins at >=900x640, mobile opts into a compact panel at >=600px tall.
      media.add(beliefStickyMedia, () => {
        const stage = section.querySelector<HTMLElement>('.about-belief-stage');
        if (count < 2 || !stage) return undefined;
        section.dataset.beliefSticky = 'true';
        // The stage's CSS `top` clears the header (68px desktop, 58-62px mobile).
        const stickyTop = () => Number.parseFloat(getComputedStyle(stage).top) || 0;
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
          start: () => `top ${stickyTop()}px`,
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

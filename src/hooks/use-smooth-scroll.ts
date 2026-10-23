import 'lenis/dist/lenis.css';

import gsap from 'gsap';
import Lenis from 'lenis';
import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll() {
  useEffect(() => {
    const preference = window.matchMedia(
      '(prefers-reduced-motion: no-preference) and (pointer: fine)'
    );
    let dispose: (() => void) | undefined;
    const configure = () => {
      dispose?.();
      dispose = undefined;
      if (!preference.matches) return;
      let bodyLocked = false;
      const scroll = new Lenis({
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        // Native inner scrolling only while an overflowing region can consume the gesture.
        allowNestedScroll: true,
        prevent: (node) => bodyLocked
          || node.hasAttribute('data-scroll-native') || node.hasAttribute('data-lenis-prevent'),
      });
      // MUI's Drawer/Dialog locks body overflow; smoothing must honor that lock too.
      const syncBodyLock = () => {
        const locked = document.body.style.overflow === 'hidden';
        if (locked === bodyLocked) return;
        bodyLocked = locked;
        if (locked) scroll.stop();
        else scroll.start();
      };
      const bodyObserver = new MutationObserver(syncBodyLock);
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] });
      syncBodyLock();
      const tick = (time: number) => scroll.raf(time * 1000);
      // Keep browser hash navigation/focus native, and cancel outstanding wheel inertia.
      const onAnchor = (event: MouseEvent) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (
          !(link instanceof HTMLAnchorElement) ||
          link.hasAttribute('download') ||
          (link.target && link.target !== '_self')
        )
          return;
        let target: URL;
        try {
          target = new URL(link.href);
        } catch {
          return;
        }
        if (
          target.origin === window.location.origin &&
          target.pathname === window.location.pathname &&
          target.search === window.location.search &&
          (target.hash || link.href.endsWith('#'))
        ) {
          scroll.scrollTo(scroll.actualScroll, { immediate: true });
        }
      };
      document.addEventListener('click', onAnchor, true);
      scroll.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      dispose = () => {
        bodyObserver.disconnect();
        document.removeEventListener('click', onAnchor, true);
        gsap.ticker.remove(tick);
        scroll.destroy();
      };
    };
    configure();
    preference.addEventListener('change', configure);
    return () => {
      preference.removeEventListener('change', configure);
      dispose?.();
    };
  }, []);
}

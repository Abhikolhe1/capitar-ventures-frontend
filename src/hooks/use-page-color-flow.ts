import type { RefObject } from 'react';

import gsap from 'gsap';
import { useLayoutEffect } from 'react';

import homepage from 'src/content/homepage.json';

const brightness = (color: string) => {
  const rgb = gsap.utils.splitColor(color);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
};

// Every visible section uses ONE canvas color, including during a handoff.
export function usePageColorFlow(scope: RefObject<HTMLElement | null>, loading: boolean) {
  useLayoutEffect(() => {
    const root = scope.current;
    if (!root || !homepage.sectionTransitions.enabled) return undefined;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const sections = Array.from(root.querySelectorAll<HTMLElement>('main > section, #site-footer'));
      const saved = sections.map(element => ({ element, style: element.getAttribute('style'), color: getComputedStyle(element).backgroundColor }));
      // Hero inherits its navy background before animation.
      if (saved[0]) saved[0].color = '#111129';
      const text = sections.flatMap((section, index) => Array.from(section.querySelectorAll<HTMLElement>('*')).filter(element => {
        if (index === 0) return false;
        if (!Array.from(element.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())) return false;
        let ancestor: HTMLElement | null = element;
        while (ancestor && ancestor !== section) {
          if (ancestor.matches('a, button, [role="tab"]')) return false;
          const bg = getComputedStyle(ancestor).backgroundColor;
          if (bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') return false;
          ancestor = ancestor.parentElement;
        }
        return true;
      }).map(element => ({ element, dark: brightness(saved[index].color) < 145 })));
      sections.forEach(element => element.style.setProperty('background-color', 'var(--page-flow-color)', 'important'));
      const artwork = root.querySelector<HTMLElement>('#capital-efficiency > img');
      const artworkOpacity = artwork?.style.opacity ?? '';
      let frame = 0;
      const paint = () => {
        frame = 0;
        if (!saved.length) return;
        const height = window.innerHeight;
        let color = saved[0].color;
        let heroFade = 0;
        saved.slice(1).some((section, offset) => {
          const { startViewport, endViewport } = homepage.sectionTransitions;
          const progress = gsap.utils.clamp(0, 1, (height * startViewport - section.element.getBoundingClientRect().top) / (height * Math.max(0.1, startViewport - endViewport)));
          if (offset === 0) heroFade = progress;
          if (!progress) return true;
          const previous = saved[offset].color;
          const changesTone = (brightness(previous) < 145) !== (brightness(section.color) < 145);
          const middle = changesTone ? homepage.sectionTransitions.lightBlue : gsap.utils.interpolate(previous, section.color, 0.5);
          color = progress < 0.5
            ? gsap.utils.interpolate(previous, middle, progress * 2)
            : gsap.utils.interpolate(middle, section.color, (progress - 0.5) * 2);
          return progress < 1;
        });
        root.style.setProperty('--page-flow-color', color);
        const dark = brightness(color) < 145;
        text.forEach(item => {
          if (dark === item.dark) item.element.removeAttribute('data-flow-ink');
          else item.element.setAttribute('data-flow-ink', dark ? 'light' : 'dark');
        });
        root.style.setProperty('--hero-flow-opacity', String(1 - heroFade));
        root.style.setProperty('--hero-content-flow-opacity', String(Math.max(0, 1 - heroFade * 1.5)));
        if (artwork) artwork.style.opacity = String(gsap.utils.clamp(0, 1, 1 - brightness(color) / 100));
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      const observer = new ResizeObserver(schedule);
      sections.forEach(element => observer.observe(element));
      paint();
      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        root.style.removeProperty('--page-flow-color');
        root.style.removeProperty('--hero-flow-opacity');
        root.style.removeProperty('--hero-content-flow-opacity');
        saved.forEach(item => { if (item.style === null) item.element.removeAttribute('style'); else item.element.setAttribute('style', item.style); });
        text.forEach(item => item.element.removeAttribute('data-flow-ink'));
        if (artwork) artwork.style.opacity = artworkOpacity;
      };
    });
    return () => media.revert();
  }, [scope, loading]);
}

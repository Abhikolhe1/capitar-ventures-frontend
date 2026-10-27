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
      const saved = sections.map(element => ({
        element,
        background: element.style.getPropertyValue('background-color'),
        priority: element.style.getPropertyPriority('background-color'),
        color: getComputedStyle(element).backgroundColor,
      }));
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
      const { startViewport, endViewport } = homepage.sectionTransitions;
      const transitions = saved.slice(1).map((section, offset) => {
        const previous = saved[offset].color;
        const changesTone = (brightness(previous) < 145) !== (brightness(section.color) < 145);
        const middle = changesTone ? homepage.sectionTransitions.lightBlue : gsap.utils.interpolate(previous, section.color, 0.5);
        return {
          element: section.element,
          top: 0,
          firstHalf: gsap.utils.interpolate(previous, middle),
          secondHalf: gsap.utils.interpolate(middle, section.color),
        };
      });
      let frame = 0;
      let needsMeasure = true;
      let lastColor = '';
      let lastDark: boolean | undefined;
      let lastHeroFade = -1;
      const paint = () => {
        frame = 0;
        if (!saved.length) return;
        const height = window.innerHeight;
        const scrollTop = window.scrollY;
        // Read geometry only after layout changes, before any style writes.
        if (needsMeasure) {
          transitions.forEach(item => { item.top = item.element.getBoundingClientRect().top + scrollTop; });
          needsMeasure = false;
        }
        let color = saved[0].color;
        let heroFade = 0;
        transitions.some((section, offset) => {
          const progress = gsap.utils.clamp(0, 1, (height * startViewport - (section.top - scrollTop)) / (height * Math.max(0.1, startViewport - endViewport)));
          if (offset === 0) heroFade = progress;
          if (!progress) return true;
          color = progress < 0.5
            ? section.firstHalf(progress * 2)
            : section.secondHalf((progress - 0.5) * 2);
          return progress < 1;
        });
        if (color !== lastColor) {
          root.style.setProperty('--page-flow-color', color);
          const luminance = brightness(color);
          const dark = luminance < 145;
          if (dark !== lastDark) {
            text.forEach(item => {
              if (dark === item.dark) item.element.removeAttribute('data-flow-ink');
              else item.element.setAttribute('data-flow-ink', dark ? 'light' : 'dark');
            });
            lastDark = dark;
          }
          if (artwork) artwork.style.opacity = String(gsap.utils.clamp(0, 1, 1 - luminance / 100));
          lastColor = color;
        }
        if (heroFade !== lastHeroFade) {
          root.style.setProperty('--hero-flow-opacity', String(1 - heroFade));
          root.style.setProperty('--hero-content-flow-opacity', String(Math.max(0, 1 - heroFade * 1.5)));
          lastHeroFade = heroFade;
        }
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
      const measure = () => { needsMeasure = true; schedule(); };
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', measure);
      const observer = new ResizeObserver(measure);
      sections.forEach(element => observer.observe(element));
      paint();
      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', measure);
        root.style.removeProperty('--page-flow-color');
        root.style.removeProperty('--hero-flow-opacity');
        root.style.removeProperty('--hero-content-flow-opacity');
        saved.forEach(item => {
          if (item.background) item.element.style.setProperty('background-color', item.background, item.priority);
          else item.element.style.removeProperty('background-color');
        });
        text.forEach(item => item.element.removeAttribute('data-flow-ink'));
        if (artwork) artwork.style.opacity = artworkOpacity;
      };
    });
    return () => media.revert();
  }, [scope, loading]);
}

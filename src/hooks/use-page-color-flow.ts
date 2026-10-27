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
      const canvas = document.createElement('div');
      canvas.dataset.pageColorCanvas = '';
      canvas.setAttribute('aria-hidden', 'true');
      Object.assign(canvas.style, { position: 'fixed', inset: '0', zIndex: '-1', pointerEvents: 'none' });
      const rootBackground = root.style.backgroundColor;
      const rootIsolation = root.style.isolation;
      root.style.backgroundColor = 'transparent';
      root.style.isolation = 'isolate';
      root.prepend(canvas);
      sections.forEach(element => element.style.setProperty('background-color', 'transparent', 'important'));
      const hero = sections[0];
      const fading = hero ? Array.from(hero.children).filter((element): element is HTMLElement => element instanceof HTMLElement).map(element => ({
        element,
        background: element.matches('[data-entrance="background"]'),
        opacity: element.style.getPropertyValue('opacity'),
        priority: element.style.getPropertyPriority('opacity'),
      })) : [];
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
      let lastTint = -1;
      const ctaBlends = new WeakMap<HTMLElement, ReturnType<typeof gsap.utils.interpolate<string>>>();
      const styledCtas = new Set<HTMLElement>();
      let ctas = Array.from(root.querySelectorAll<HTMLElement>('[data-flow-cta]'));
      let ctasChanged = true;
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
        let transitionTint = 0;
        transitions.some((section, offset) => {
          const progress = gsap.utils.clamp(0, 1, (height * startViewport - (section.top - scrollTop)) / (height * Math.max(0.1, startViewport - endViewport)));
          if (offset === 0) heroFade = progress;
          if (!progress) return true;
          // A small pulse only during a handoff, with exact original styles at either end.
          transitionTint = Math.sin(Math.PI * progress) * 0.25;
          color = progress < 0.5
            ? section.firstHalf(progress * 2)
            : section.secondHalf((progress - 0.5) * 2);
          return progress < 1;
        });
        if (color !== lastColor || transitionTint !== lastTint || ctasChanged) {
          canvas.style.backgroundColor = color;
          const luminance = brightness(color);
          const dark = luminance < 145;
          ctas.forEach(cta => {
            const glass = cta.hasAttribute('data-aurora-glass-button');
            // A departing dark section can remain visible after the handoff completes.
            // Keep its glass CTA readable until its own dark surface returns.
            const strength = glass ? gsap.utils.clamp(0, 1, (luminance - 40) / 100) : transitionTint;
            if (strength < 0.001) {
              cta.removeAttribute('data-cta-transition');
              cta.style.removeProperty('--cta-flow-background');
              return;
            }
            let blend = ctaBlends.get(cta);
            if (!blend) {
              blend = gsap.utils.interpolate(getComputedStyle(cta).backgroundColor,
                glass ? 'rgba(65,73,86,0.72)' : 'rgba(100,110,125,0.18)');
              ctaBlends.set(cta, blend);
            }
            cta.style.setProperty('--cta-flow-background', blend(strength));
            cta.setAttribute('data-cta-transition', '');
            styledCtas.add(cta);
          });
          ctasChanged = false;
          if (dark !== lastDark) {
            text.forEach(item => {
              if (dark === item.dark) item.element.removeAttribute('data-flow-ink');
              else item.element.setAttribute('data-flow-ink', dark ? 'light' : 'dark');
            });
            lastDark = dark;
          }
          if (artwork) artwork.style.opacity = String(gsap.utils.clamp(0, 1, 1 - luminance / 100));
          lastColor = color;
          lastTint = transitionTint;
        }
        if (heroFade !== lastHeroFade) {
          fading.forEach(item => {
            item.element.style.setProperty('opacity', String(Math.max(0, 1 - heroFade * (item.background ? 1 : 1.5))), 'important');
          });
          lastHeroFade = heroFade;
        }
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
      const measure = () => { needsMeasure = true; schedule(); };
      // Header switches CTA components after the hero; editorial tabs can replace their CTA.
      const ctaObserver = new MutationObserver(() => {
        ctas = Array.from(root.querySelectorAll<HTMLElement>('[data-flow-cta]'));
        ctasChanged = true;
        schedule();
      });
      ctaObserver.observe(root, { childList: true, subtree: true });
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', measure);
      const observer = new ResizeObserver(measure);
      sections.forEach(element => observer.observe(element));
      paint();
      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        ctaObserver.disconnect();
        styledCtas.forEach(cta => {
          cta.removeAttribute('data-cta-transition');
          ['--cta-flow-background', '--cta-flow-border', '--cta-flow-ink'].forEach(property => cta.style.removeProperty(property));
        });
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', measure);
        canvas.remove();
        root.style.backgroundColor = rootBackground;
        root.style.isolation = rootIsolation;
        fading.forEach(item => {
          if (item.opacity) item.element.style.setProperty('opacity', item.opacity, item.priority);
          else item.element.style.removeProperty('opacity');
        });
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

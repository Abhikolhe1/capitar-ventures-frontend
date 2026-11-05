// Run before React and animation modules initialize. Older Safari/Chrome can
// still animate: these supply the observer and scroll APIs they are missing.
import 'intersection-observer';

import ResizeObserverPolyfill from 'resize-observer-polyfill';
import { polyfill as polyfillScroll } from 'smoothscroll-polyfill';

if (!window.ResizeObserver) window.ResizeObserver = ResizeObserverPolyfill;
polyfillScroll();

// Safari before 14 exposes MediaQueryList.addListener rather than EventTarget.
const nativeMatchMedia = window.matchMedia.bind(window);
const supportsMotionQuery =
  nativeMatchMedia('(prefers-reduced-motion: reduce)').matches ||
  nativeMatchMedia('(prefers-reduced-motion: no-preference)').matches;
window.matchMedia = (query: string) => {
  const media = nativeMatchMedia(
    supportsMotionQuery
      ? query
      : query.replace(/\(prefers-reduced-motion:\s*no-preference\)/g, '(min-width: 0px)')
  );
  if (!media.addEventListener) {
    Object.defineProperties(media, {
      addEventListener: {
        value: (type: string, listener: Parameters<MediaQueryList['addListener']>[0]) => {
          if (type === 'change') media.addListener(listener);
        },
      },
      removeEventListener: {
        value: (type: string, listener: Parameters<MediaQueryList['removeListener']>[0]) => {
          if (type === 'change') media.removeListener(listener);
        },
      },
    });
  }
  return media;
};

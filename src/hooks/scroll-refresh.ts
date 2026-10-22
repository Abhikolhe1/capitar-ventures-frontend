import { ScrollTrigger } from 'gsap/ScrollTrigger';

const pending = new Set<symbol>();
let frame: number | undefined;

// A font/CMS update affects the whole page: measure it once after layout settles.
export function scheduleScrollRefresh() {
  const request = Symbol();
  pending.add(request);
  void document.fonts.ready.then(() => {
    if (!pending.has(request) || frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      if (!pending.size) return;
      pending.clear();
      ScrollTrigger.refresh(true);
    });
  });
  return () => {
    pending.delete(request);
    if (!pending.size && frame !== undefined) {
      cancelAnimationFrame(frame);
      frame = undefined;
    }
  };
}

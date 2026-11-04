import { useRef, useState, useLayoutEffect } from 'react';

const pinnedMedia =
  '(min-width: 900px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)';

// CSS owns the sticky layout; scroll distance drives the open accordion item.
// No wheel interception: touchpads, keyboards and reverse scrolling stay native.
export function usePinnedSteps(count: number, enabled = true) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || !enabled) return undefined;
    const media = window.matchMedia(pinnedMedia);
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!media.matches) {
        // Compact screens use native scrolling through expanded rows instead of
        // pinning a panel taller than the viewport.
        const rows = Array.from(track.querySelectorAll<HTMLElement>('.vd-signal, .vd-step'));
        let index = 0;
        rows.forEach((row, i) => {
          if (row.getBoundingClientRect().top <= window.innerHeight * 0.55) index = i;
        });
        setActive(index);
        return;
      }
      const panel = track.firstElementChild as HTMLElement | null;
      if (!panel) return;
      const top = Number.parseFloat(getComputedStyle(panel).top) || 0;
      const distance = track.offsetHeight - panel.offsetHeight;
      const progress = Math.max(
        0,
        Math.min(1, (top - track.getBoundingClientRect().top) / Math.max(1, distance))
      );
      setActive(Math.min(count - 1, Math.floor(progress * count)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(track);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    media.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      media.removeEventListener('change', schedule);
    };
  }, [count, enabled]);

  const select = (index: number) => {
    setActive(index);
    const track = trackRef.current;
    const panel = track?.firstElementChild as HTMLElement | null;
    if (!track || !panel || !window.matchMedia(pinnedMedia).matches) return;
    const top = Number.parseFloat(getComputedStyle(panel).top) || 0;
    const distance = track.offsetHeight - panel.offsetHeight;
    // Land inside the selected scroll interval so the next wheel movement continues from it.
    window.scrollTo({
      top:
        window.scrollY +
        track.getBoundingClientRect().top -
        top +
        distance * ((index + 0.25) / count),
      behavior: 'instant',
    });
  };

  return { trackRef, active, select };
}

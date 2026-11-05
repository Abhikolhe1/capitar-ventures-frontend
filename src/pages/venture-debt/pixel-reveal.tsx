import type { Media } from 'src/types/homepage';

import { useRef, useEffect } from 'react';

import { useSiteReducedMotion } from 'src/hooks/use-site-motion';

// A small canvas overlay avoids hundreds of animated DOM tiles and never
// samples the image, so cross-origin CMS media needs no canvas CORS access.
export function PixelReveal({ image, index }: { image: Media; index: number }) {
  const reducedMotion = useSiteReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = root.current;
    const surface = canvas.current;
    if (!element || !surface) return undefined;
    const context = surface.getContext('2d');
    if (!context) return undefined;
    const picture = element.querySelector('img');
    if (!picture) return undefined;
    let frame = 0;
    let visible = false;
    let ready = picture.complete && picture.naturalWidth > 0;
    let imageFailed = picture.complete && !picture.naturalWidth;
    let currentProgress = reducedMotion ? 1 : 0;
    const paint = (progress: number) => {
      currentProgress = progress;
      const width = element.clientWidth,
        height = element.clientHeight;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      if (
        surface.width !== Math.round(width * ratio) ||
        surface.height !== Math.round(height * ratio)
      ) {
        surface.width = Math.round(width * ratio);
        surface.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const size = Math.max(14, width / 22);
      const rows = Math.ceil(height / size),
        columns = Math.ceil(width / size);
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
          const noise = ((col * 73 + row * 37 + index * 19) % 101) / 101;
          const threshold = (1 - row / rows) * 0.68 + noise * 0.25;
          if (progress >= threshold + 0.07) continue;
          context.globalAlpha = Math.min(1, Math.max(0, (threshold + 0.07 - progress) / 0.07));
          context.fillStyle = '#ffffff';
          context.fillRect(col * size, row * size, size + 0.5, size + 0.5);
        }
      }
      context.globalAlpha = 1;
    };
    const play = () => {
      cancelAnimationFrame(frame);
      if (reducedMotion || imageFailed || typeof IntersectionObserver === 'undefined') {
        paint(1);
        return;
      }
      paint(0);
      // A slow connection must not consume the reveal before the image arrives.
      if (!ready || !visible) return;
      // Let the active signal settle before revealing its image.
      const start = performance.now() + 250;
      const tick = (time: number) => {
        const progress = Math.max(0, Math.min(1, (time - start) / 950));
        paint(progress);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    if (reducedMotion) paint(1);
    else paint(0);
    const loaded = () => {
      ready = picture.naturalWidth > 0;
      imageFailed = !ready;
      play();
    };
    const failed = () => {
      imageFailed = true;
      cancelAnimationFrame(frame);
      paint(1);
    };
    picture.addEventListener('load', loaded);
    picture.addEventListener('error', failed);
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : new IntersectionObserver(
            ([entry]) => {
              visible = entry.isIntersecting;
              if (entry.isIntersecting) play();
              else {
                cancelAnimationFrame(frame);
                paint(reducedMotion ? 1 : 0);
              }
            },
            { threshold: 0.15 }
          );
    observer?.observe(element);
    // Keep the image usable when an older browser lacks visibility observation.
    if (!observer) paint(1);
    const resize =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => paint(currentProgress));
    resize?.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      resize?.disconnect();
      picture.removeEventListener('load', loaded);
      picture.removeEventListener('error', failed);
    };
  }, [image.url, index, reducedMotion]);
  return (
    <div className="vd-pixel-reveal" ref={root} data-pixel-index={index}>
      <img src={image.url} alt={image.alternativeText || ''} />
      <canvas ref={canvas} aria-hidden="true" />
    </div>
  );
}

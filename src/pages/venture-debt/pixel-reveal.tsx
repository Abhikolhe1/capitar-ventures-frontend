import type { Media } from 'src/types/homepage';

import { useRef, useEffect } from 'react';

// A small canvas overlay avoids hundreds of animated DOM tiles and never
// samples the image, so cross-origin CMS media needs no canvas CORS access.
export function PixelReveal({ image, index }: { image: Media; index: number }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = root.current;
    const surface = canvas.current;
    if (!element || !surface) return undefined;
    const context = surface.getContext('2d');
    if (!context) return undefined;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const paint = (progress: number) => {
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
      if (media.matches) {
        paint(1);
        return;
      }
      paint(0);
      const start = performance.now();
      const tick = (time: number) => {
        const progress = Math.min(1, (time - start) / 950);
        paint(progress);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    if (media.matches) paint(1);
    else paint(0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else {
          cancelAnimationFrame(frame);
          paint(media.matches ? 1 : 0);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(element);
    media.addEventListener('change', play);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener('change', play);
    };
  }, [image.url, index]);
  return (
    <div className="vd-pixel-reveal" ref={root} data-pixel-index={index}>
      <img src={image.url} alt={image.alternativeText || ''} />
      <canvas ref={canvas} aria-hidden="true" />
    </div>
  );
}

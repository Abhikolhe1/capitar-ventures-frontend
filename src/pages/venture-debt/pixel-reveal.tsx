import type { CSSProperties } from 'react';
import type { Media } from 'src/types/homepage';

import { useRef, useLayoutEffect } from 'react';

import { useSiteReducedMotion } from 'src/hooks/use-site-motion';

// Exact image-fill crops returned by Figma. Keep the source files intact.
const crops = [
  { width: 142.82, height: 124.79, left: -21.41, top: 0 },
  { width: 363.21, height: 223.09, left: -212.42, top: 0 },
  { width: 353.21, height: 272.65, left: -58.77, top: -142.99 },
  { width: 315.8, height: 260.54, left: -185.24, top: -133.1 },
];
// Draw only the foreground; transparent pixels expose the fixed background.
export function PixelReveal({ image, index }: { image: Media; index: number }) {
  const isFigmaAsset = /signal-(shield|finance-sprite)\.png$/.test(image.url);
  const crop = isFigmaAsset
    ? crops[index % crops.length]
    : { width: 100, height: 100, left: 0, top: 0 };
  const reducedMotion = useSiteReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    const surface = canvas.current;
    if (!element || !surface) return undefined;
    const picture = element.querySelector('img');
    if (!picture) return undefined;
    // Reset before the browser can paint a new source or active signal.
    picture.style.opacity = reducedMotion ? '1' : '0';
    let context: CanvasRenderingContext2D | null;
    try {
      context = surface.getContext('2d');
    } catch {
      context = null;
    }
    if (!context) {
      picture.style.opacity = '1';
      return undefined;
    }
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
      picture.style.opacity = progress >= 1 ? '1' : '0';
      element.dataset.revealProgress = String(progress);
      if (progress >= 1 || !ready) return;
      const size = Math.max(14, width / 22);
      const rows = Math.ceil(height / size),
        columns = Math.ceil(width / size);
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
          const noise = ((col * 73 + row * 37 + index * 19) % 101) / 101;
          const threshold = (1 - row / rows) * 0.68 + noise * 0.25;
          if (progress <= threshold) continue;
          context.save();
          context.globalAlpha = Math.min(1, (progress - threshold) / 0.07);
          context.beginPath();
          context.rect(col * size, row * size, size + 0.5, size + 0.5);
          context.clip();
          context.drawImage(
            picture,
            (width * crop.left) / 100,
            (height * crop.top) / 100,
            (width * crop.width) / 100,
            (height * crop.height) / 100
          );
          context.restore();
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
  }, [image.url, index, reducedMotion, crop.width, crop.height, crop.left, crop.top]);
  return (
    <div
      className="vd-pixel-reveal"
      ref={root}
      data-pixel-index={index}
      data-figma-art={isFigmaAsset ? index : undefined}
    >
      <img
        src={image.url}
        alt={image.alternativeText || ''}
        style={
          {
            opacity: reducedMotion ? 1 : 0,
            '--art-width': `${crop.width}%`,
            '--art-height': `${crop.height}%`,
            '--art-left': `${crop.left}%`,
            '--art-top': `${crop.top}%`,
          } as CSSProperties
        }
      />
      <canvas ref={canvas} aria-hidden="true" />
    </div>
  );
}

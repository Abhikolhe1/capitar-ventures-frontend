import { useState, useEffect } from 'react';

import source from '../../../public/assets/about/quote-decoration.svg?raw';

// Trusted, unchanged Figma vector paths. Inline SVG lets the native lighten/plus-lighter
// layers composite against the page canvas instead of flattening onto an image surface.
const markup = source.replace('<svg ', '<svg preserveAspectRatio="none" aria-hidden="true" ');
export function QuoteArtwork({ src }: { src: string }) {
  const [replacement, setReplacement] = useState<string>();
  useEffect(() => {
    const controller = new AbortController();
    setReplacement(undefined);
    if (src !== '/assets/about/quote-decoration.svg') {
      void fetch(src, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error('Quote artwork unavailable');
          const content = await response.text();
          // The seeded CMS source is identical. Custom CMS artwork stays a safe image;
          // untrusted downloaded SVG/HTML is never injected into the document.
          if (
            content.replace(/\r\n/g, '\n').trim() !== source.replace(/\r\n/g, '\n').trim() &&
            !controller.signal.aborted
          )
            setReplacement(src);
        })
        .catch(() => {
          /* Keep original Figma decoration if CMS media fails. */
        });
    }
    return () => controller.abort();
  }, [src]);
  return replacement ? (
    <img
      className="about-quote-decoration"
      src={replacement}
      alt=""
      onError={() => setReplacement(undefined)}
    />
  ) : (
    <div
      className="about-quote-decoration"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

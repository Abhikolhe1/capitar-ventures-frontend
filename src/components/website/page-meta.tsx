import { useEffect } from 'react';

// Per-page search and link-preview tags. React 19 places <title>, <meta> and <link>
// in the document head. Absolute URLs follow the address the site is served from.
type Props = {
  title: string;
  description: string;
  path: string;
  /** Render the <title> element too (pages that already set document.title omit it). */
  setTitle?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export function PageMeta({ title, description, path, setTitle = false, jsonLd }: Props) {
  // index.html carries site-wide defaults for previews that do not run JavaScript;
  // once a page renders its own tags, drop them so each tag appears once.
  useEffect(() => {
    document.querySelectorAll('meta[data-default-meta]').forEach((element) => element.remove());
  }, []);
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const url = `${origin}${path}`;
  // "<" is escaped so CMS text can never close the script element early.
  const structuredData = jsonLd ? JSON.stringify(jsonLd).replace(/</g, '\\u003c') : '';
  return (
    <>
      {setTitle && <title>{title}</title>}
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Capitar Ventures" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${origin}/og-image.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      {structuredData && (
         
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      )}
    </>
  );
}

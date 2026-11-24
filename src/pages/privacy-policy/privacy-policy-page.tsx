import './privacy-policy.css';

import { useEffect } from 'react';

import { useHomepage } from 'src/hooks/use-homepage';
import { usePrivacyPolicy } from 'src/hooks/use-privacy-policy';

import { MainLayout } from 'src/layouts/website/main-layout';

import { PageMeta } from 'src/components/website/page-meta';

export default function PrivacyPolicyPage() {
  const { content: homepage, loading } = useHomepage();
  const content = usePrivacyPolicy();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <MainLayout
      global={homepage.global}
      loading={loading}
      colorFlow={false}
      mainClassName="privacy-page"
    >
      <PageMeta
        title={`${content.title} | Capitar Ventures`}
        description="Read the Capitar Ventures Privacy Policy."
        path="/privacy-policy"
      />
      <article className="privacy-content" aria-labelledby="privacy-title">
        <h1 id="privacy-title">{content.title}</h1>
        <img
          className="privacy-illustration"
          src={content.illustration}
          alt={content.illustrationAlt}
          width={320}
          height={278}
        />
        <div className="privacy-sections">
          {content.sections.map((section, index) => (
            <section
              key={`${index}-${section.heading}`}
              aria-labelledby={`privacy-section-${index}`}
            >
              <h2 id={`privacy-section-${index}`}>{section.heading}</h2>
              {section.blocks.map((block, blockIndex) =>
                block.kind === 'list' ? (
                  <ul key={blockIndex}>
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  block.items.map((item, itemIndex) => (
                    <p key={`${blockIndex}-${itemIndex}`}>{item}</p>
                  ))
                )
              )}
            </section>
          ))}
        </div>
      </article>
    </MainLayout>
  );
}

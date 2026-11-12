import './case-study.css';

import type { CaseStudy } from 'src/services/case-study.service';

import { useParams } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

import { RouterLink } from 'src/routes/components/router-link';

import { useHomepage } from 'src/hooks/use-homepage';
import { usePortfolio } from 'src/hooks/use-portfolio';
import { useSectionReveal } from 'src/hooks/use-section-reveal';

import { MainLayout } from 'src/layouts/website/main-layout';
import { fetchCaseStudy, CaseStudyNotFound } from 'src/services/case-study.service';

import { SectionBadge } from 'src/components/website/section-badge';
import { ContentButton } from 'src/components/website/content-button';

type State =
  | { status: 'loading' }
  | { status: 'ready'; study: CaseStudy }
  | { status: 'missing' }
  | { status: 'unavailable' };

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
    </>
  );
}

export default function CaseStudyPage() {
  const { slug = '' } = useParams();
  const { content, loading } = useHomepage();
  const { data: portfolio } = usePortfolio();
  const [state, setState] = useState<State>({ status: 'loading' });
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    window.scrollTo(0, 0);
    fetchCaseStudy(slug, controller.signal)
      .then((study) => setState({ status: 'ready', study }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ status: error instanceof CaseStudyNotFound ? 'missing' : 'unavailable' });
      });
    return () => controller.abort();
  }, [slug]);

  const study = state.status === 'ready' ? state.study : undefined;
  useEffect(() => {
    const previous = document.title;
    document.title = study
      ? `${study.companyName} case study | Capitar Ventures`
      : 'Case study | Capitar Ventures';
    return () => {
      document.title = previous;
    };
  }, [study]);
  useSectionReveal(scope, JSON.stringify(state));

  const conversation = portfolio.conversation;
  const facts = study
    ? [
        { label: 'Founders', value: study.founders },
        { label: 'Sector', value: study.sector },
        { label: 'Stage of investment', value: study.stage },
      ].filter((fact) => fact.value.trim())
    : [];

  return (
    <MainLayout
      global={content.global}
      loading={loading || state.status === 'loading'}
      contentVersion={JSON.stringify(state)}
      mainRef={scope}
    >
      <section className="case-hero" aria-labelledby="case-heading">
        <div className="case-container case-hero__content">
          <RouterLink className="case-back" href="/portfolio" data-entrance="content">
            <span aria-hidden="true">←</span> Back to portfolio
          </RouterLink>
          {study ? (
            <div className={`case-hero__grid${study.heroImage ? '' : ' case-hero__grid--single'}`}>
              <div>
                <div data-entrance="content">
                  <SectionBadge compactMobile text="CASE STUDY" color="#FFFFFF" minWidth={130} />
                </div>
                {study.logo && (
                  <img
                    className="case-hero__logo"
                    src={study.logo.url}
                    alt=""
                    width="72"
                    height="72"
                    data-entrance="content"
                  />
                )}
                <h1 id="case-heading" data-entrance="heading">
                  {study.companyName}
                </h1>
                {study.headline && (
                  <p className="case-hero__headline" data-entrance="content">
                    {study.headline}
                  </p>
                )}
                {facts.length > 0 && (
                  <dl className="case-facts" data-entrance="content">
                    {facts.map((fact) => (
                      <div key={fact.label}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {study.website && (
                  <a
                    className="case-website"
                    href={study.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-entrance="content"
                  >
                    Visit website <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
              {study.heroImage && (
                <img
                  className="case-hero__image"
                  src={study.heroImage.url}
                  alt={study.heroImage.alternativeText || ''}
                  data-entrance="content"
                />
              )}
            </div>
          ) : (
            <div className="case-status" role={state.status === 'loading' ? undefined : 'alert'}>
              {state.status === 'loading' && <p>Loading case study…</p>}
              {state.status === 'missing' && (
                <>
                  <h1 id="case-heading">Case study not found</h1>
                  <p>This case study isn&apos;t available. It may not be published yet.</p>
                </>
              )}
              {state.status === 'unavailable' && (
                <>
                  <h1 id="case-heading">Case study unavailable</h1>
                  <p>We couldn&apos;t load this case study right now. Please try again shortly.</p>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {study && study.metrics.length > 0 && (
        <section className="case-metrics" aria-label="Results">
          <div className="case-container">
            <ul>
              {study.metrics.map((metric) => (
                <li key={`${metric.value}-${metric.label}`} data-scroll-reveal="metric">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {study && (study.summary || study.sections.length > 0) && (
        <section className="case-story" aria-label={`${study.companyName} story`}>
          <div className="case-container">
            {study.summary && (
              <div className="case-story__summary" data-scroll-reveal="summary">
                <Paragraphs text={study.summary} />
              </div>
            )}
            {study.sections.map((section) => (
              <article key={section.heading} className="case-story__row" data-scroll-reveal="row">
                <h2>{section.heading}</h2>
                <div>
                  <Paragraphs text={section.body} />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {study?.quote && (
        <section className="case-quote" aria-label="Founder quote">
          <figure className="case-container" data-scroll-reveal="quote">
            <span className="case-quote__mark" aria-hidden="true">
              “
            </span>
            <blockquote>{study.quote.text}</blockquote>
            {(study.quote.name || study.quote.role) && (
              <figcaption>
                {study.quote.name && <strong>{study.quote.name}</strong>}
                {study.quote.role && <span>{study.quote.role}</span>}
              </figcaption>
            )}
          </figure>
        </section>
      )}

      {conversation.enabled && (
        <section className="case-cta" aria-labelledby="case-cta-heading">
          <div className="case-container" data-scroll-reveal="cta">
            <SectionBadge
              compactMobile
              text={conversation.sectionLabel}
              color="#FFFFFF"
              minWidth={195}
            />
            <h2 id="case-cta-heading">{conversation.heading}</h2>
            <p>{conversation.description}</p>
            <ContentButton arrow data={study?.cta || conversation.cta} />
          </div>
        </section>
      )}
    </MainLayout>
  );
}

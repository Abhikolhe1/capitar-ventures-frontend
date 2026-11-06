import './portfolio.css';

import { useRef, useState, useEffect } from 'react';

import { useHomepage } from 'src/hooks/use-homepage';
import { useSectionReveal } from 'src/hooks/use-section-reveal';

import data from 'src/content/portfolio.json';
import { MainLayout } from 'src/layouts/website/main-layout';

import { SectionBadge } from 'src/components/website/section-badge';
import { ContentButton } from 'src/components/website/content-button';

import { CaseStudySection } from 'src/sections/home/case-study/case-study-section';

export default function PortfolioPage() {
  const { content, loading } = useHomepage();
  const scope = useRef<HTMLElement>(null);
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Portfolio | Capitar Ventures';
    window.scrollTo(0, 0);
    return () => {
      document.title = previousTitle;
    };
  }, []);
  const companies = data.companies.filter(
    (company) => (!sector || company.sector === sector) && (!stage || company.stage === stage)
  );
  useSectionReveal(scope, `${sector}:${stage}`);
  const reset = () => {
    setSector('');
    setStage('');
    setSelected(null);
  };
  const stories = content.caseStudy
    ? {
        ...content.caseStudy,
        sectionLabel: 'FEATURED STORIES',
        heading: 'What founder-first capital\nactually looks like.',
        items: content.caseStudy.items.map((item) => ({
          ...item,
          description:
            item.description ||
            'Strategic capital helping founders reach their next growth milestone.',
          metricValue: undefined,
          metricSuffix: undefined,
          metricLabel: undefined,
        })),
      }
    : undefined;
  return (
    <MainLayout global={content.global} loading={loading}>
      <section className="portfolio-hero" aria-labelledby="portfolio-heading">
        <div className="portfolio-hero__art" data-entrance="background" aria-hidden="true" />
        <div className="portfolio-container portfolio-hero__content">
          <h1 id="portfolio-heading" data-entrance="heading">
            {data.hero.heading} <strong>{data.hero.emphasis}</strong>
          </h1>
          <p data-entrance="content">{data.hero.description}</p>
          <div data-entrance="content">
            <ContentButton
              arrow
              data={{
                label: 'Talk to Us',
                enabled: true,
                href: `mailto:${content.global.footer?.email || 'ACCOUNT@CAPITAR.COM'}`,
              }}
            />
          </div>
        </div>
      </section>
      <CaseStudySection data={stories} variant="portfolio" />
      <section className="portfolio-companies" ref={scope} aria-labelledby="companies-heading">
        <div className="portfolio-container">
          <div data-scroll-reveal="heading">
            <SectionBadge compactMobile text="THE COMPANIES" minWidth={150} />
            <h2 id="companies-heading">Built by founders, backed with conviction.</h2>
          </div>
          <div className="portfolio-filters">
            <div className="portfolio-results" role="status" aria-live="polite">
              <span>Showing results</span>
              <strong>
                {companies.length} {companies.length === 1 ? 'company' : 'companies'}
              </strong>
            </div>
            <label>
              Sector
              <select
                aria-label="Sector"
                value={sector}
                onChange={(event) => {
                  setSector(event.target.value);
                  setSelected(null);
                }}
              >
                <option value="">All Sectors</option>
                {Array.from(new Set(data.companies.map((company) => company.sector))).map(
                  (value) => (
                    <option key={value}>{value}</option>
                  )
                )}
              </select>
            </label>
            <label>
              Stage at investment
              <select
                aria-label="Stage at investment"
                value={stage}
                onChange={(event) => {
                  setStage(event.target.value);
                  setSelected(null);
                }}
              >
                <option value="">All Investments</option>
                {Array.from(new Set(data.companies.map((company) => company.stage))).map(
                  (value) => (
                    <option key={value}>{value}</option>
                  )
                )}
              </select>
            </label>
          </div>
          <ul className="portfolio-grid" aria-label="Portfolio companies">
            {companies.map((company) => (
              <li key={company.id} data-scroll-reveal="card">
                <article className="portfolio-card" data-selected={selected === company.id}>
                  <button
                    className="portfolio-card__toggle"
                    aria-label={`${company.name}: highlight card`}
                    aria-pressed={selected === company.id}
                    onClick={() => setSelected(selected === company.id ? null : company.id)}
                  />
                  <div className="portfolio-card__top">
                    <img
                      className="portfolio-card__logo"
                      src={`/assets/portfolio/${company.logo}.webp`}
                      alt=""
                      width="62"
                      height="62"
                      loading="lazy"
                    />
                    <div className="portfolio-card__founder">
                      <span>{company.founder.name}</span>
                      <small>{company.founder.role}</small>
                    </div>
                  </div>
                  <div className="portfolio-card__copy">
                    <h3>{company.name}</h3>
                    <p>{company.description}</p>
                  </div>
                  <div className="portfolio-card__bottom">
                    <p>Sectors</p>
                    <div className="portfolio-tags">
                      <span>{company.sector}</span>
                      <span>{company.stage}</span>
                    </div>
                    {company.status && (
                      <div className="portfolio-tags">
                        <span>{company.status}</span>
                      </div>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
          {!companies.length && (
            <div className="portfolio-empty">
              <h3>No companies match these filters.</h3>
              <button className="portfolio-reset" onClick={reset}>
                View all companies
              </button>
            </div>
          )}
        </div>
      </section>
      <section className="portfolio-conversation" aria-labelledby="conversation-heading">
        <div className="portfolio-conversation__art" aria-hidden="true" />
        <div className="portfolio-container">
          <SectionBadge compactMobile text="THE CONVERSATION" color="#FFFFFF" minWidth={195} />
          <h2 id="conversation-heading">{data.conversation.heading}</h2>
          <p>{data.conversation.description}</p>
          <ContentButton arrow data={data.conversation.cta} />
        </div>
      </section>
    </MainLayout>
  );
}

import './portfolio.css';

import { useRef, useState, useEffect } from 'react';

import { useHomepage } from 'src/hooks/use-homepage';
import { usePortfolio } from 'src/hooks/use-portfolio';
import { useSectionReveal } from 'src/hooks/use-section-reveal';

import { MainLayout } from 'src/layouts/website/main-layout';

import { SectionBadge } from 'src/components/website/section-badge';
import { ContentButton } from 'src/components/website/content-button';

import { CaseStudySection } from 'src/sections/home/case-study/case-study-section';

import { FilterSelect } from './filter-select';

export default function PortfolioPage() {
  const { content, loading } = useHomepage();
  const { data, loading: portfolioLoading } = usePortfolio();
  const scope = useRef<HTMLElement>(null);
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = data.title;
    return () => {
      document.title = previousTitle;
    };
  }, [data.title]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    setSector((current) =>
      data.companies.some((company) => company.sector === current) ? current : ''
    );
    setStage((current) =>
      data.companies.some((company) => company.stage === current) ? current : ''
    );
    setSelected((current) =>
      data.companies.some((company) => company.key === current) ? current : null
    );
  }, [data.companies]);
  const companies = data.companies.filter(
    (company) => (!sector || company.sector === sector) && (!stage || company.stage === stage)
  );
  useSectionReveal(scope, `${sector}:${stage}:${JSON.stringify(data)}`);
  const reset = () => {
    setSector('');
    setStage('');
    setSelected(null);
  };
  const stories = data.featuredStories;
  return (
    <MainLayout
      global={content.global}
      loading={loading || portfolioLoading}
      contentVersion={JSON.stringify(data)}
    >
      {data.hero.enabled && (
        <section className="portfolio-hero" aria-labelledby="portfolio-heading">
          <div
            className="portfolio-hero__art"
            data-entrance="background"
            aria-hidden="true"
            style={
              data.hero.backgroundImage
                ? { backgroundImage: `url("${data.hero.backgroundImage.url}")` }
                : undefined
            }
          />
          <div className="portfolio-container portfolio-hero__content">
            <h1 id="portfolio-heading" data-entrance="heading">
              {data.hero.heading} <strong>{data.hero.emphasis}</strong>
            </h1>
            <p data-entrance="content">{data.hero.description}</p>
            <div data-entrance="content">
              <ContentButton arrow data={data.hero.cta} />
            </div>
          </div>
        </section>
      )}
      <CaseStudySection data={stories} variant="portfolio" />
      {data.companiesSection.enabled && (
        <section className="portfolio-companies" ref={scope} aria-labelledby="companies-heading">
          <div className="portfolio-container">
            <div data-scroll-reveal="heading">
              <SectionBadge
                compactMobile
                text={data.companiesSection.sectionLabel}
                minWidth={150}
              />
              <h2 id="companies-heading">{data.companiesSection.heading}</h2>
            </div>
            <div className="portfolio-filters">
              <div className="portfolio-results" role="status" aria-live="polite">
                <span>{data.companiesSection.resultsLabel}</span>
                <strong>
                  {companies.length}{' '}
                  {companies.length === 1
                    ? data.companiesSection.companyLabel
                    : data.companiesSection.companiesLabel}
                </strong>
              </div>
              <FilterSelect
                id="portfolio-sector"
                label={data.companiesSection.sectorLabel}
                allLabel={data.companiesSection.allSectorsLabel}
                value={sector}
                options={Array.from(new Set(data.companies.map((company) => company.sector)))}
                onChange={(value) => {
                  setSector(value);
                  setSelected(null);
                }}
              />
              <FilterSelect
                id="portfolio-stage"
                label={data.companiesSection.stageLabel}
                allLabel={data.companiesSection.allStagesLabel}
                value={stage}
                options={Array.from(new Set(data.companies.map((company) => company.stage)))}
                onChange={(value) => {
                  setStage(value);
                  setSelected(null);
                }}
              />
            </div>
            <ul className="portfolio-grid" aria-label="Portfolio companies">
              {companies.map((company) => (
                <li key={company.key} data-scroll-reveal="card">
                  <article className="portfolio-card" data-selected={selected === company.key}>
                    <button
                      className="portfolio-card__toggle"
                      aria-label={`${company.name}: highlight card`}
                      aria-pressed={selected === company.key}
                      onClick={() => setSelected(selected === company.key ? null : company.key)}
                    />
                    <div className="portfolio-card__top">
                      {company.logo && (
                        <img
                          className="portfolio-card__logo"
                          src={company.logo?.url}
                          alt=""
                          width="80"
                          height="80"
                          loading="lazy"
                        />
                      )}
                      {company.caseStudyUrl && (
                        <div className="portfolio-card__case-study">
                          <ContentButton
                            arrow
                            data={{
                              label: data.companiesSection.caseStudyLabel,
                              href: company.caseStudyUrl,
                              enabled: true,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="portfolio-card__copy">
                      <h3>{company.name}</h3>
                      <p>{company.description}</p>
                    </div>
                    <div className="portfolio-card__bottom">
                      {company.founder.name && (
                        <div className="portfolio-card__founders">
                          <h4>{data.companiesSection.foundersLabel}</h4>
                          <p>{company.founder.name}</p>
                        </div>
                      )}
                      <div className="portfolio-card__meta">
                        {company.sector && (
                          <div>
                            <h4>{data.companiesSection.cardTagsLabel}</h4>
                            <span className="portfolio-tag">{company.sector}</span>
                          </div>
                        )}
                        {company.stage && (
                          <div>
                            <h4>{data.companiesSection.cardStageLabel}</h4>
                            <span className="portfolio-tag">{company.stage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
            {!companies.length && (
              <div className="portfolio-empty">
                <h3>{data.companiesSection.emptyHeading}</h3>
                <button className="portfolio-reset" onClick={reset}>
                  {data.companiesSection.resetLabel}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
      {data.conversation.enabled && (
        <section className="portfolio-conversation" aria-labelledby="conversation-heading">
          <div
            className="portfolio-conversation__art"
            aria-hidden="true"
            style={
              data.conversation.backgroundImage
                ? {
                    backgroundImage: `url("${data.conversation.backgroundImage.url}")`,
                    backgroundSize: 'cover',
                  }
                : undefined
            }
          />
          <div className="portfolio-container">
            <SectionBadge
              compactMobile
              text={data.conversation.sectionLabel}
              color="#FFFFFF"
              minWidth={195}
            />
            <h2 id="conversation-heading">{data.conversation.heading}</h2>
            <p>{data.conversation.description}</p>
            <ContentButton arrow data={data.conversation.cta} />
          </div>
        </section>
      )}
    </MainLayout>
  );
}

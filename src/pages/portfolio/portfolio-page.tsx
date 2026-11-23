import './portfolio.css';

import { useRef, useState, useEffect } from 'react';

import Pagination from '@mui/material/Pagination';

import { useHomepage } from 'src/hooks/use-homepage';
import { usePortfolio } from 'src/hooks/use-portfolio';
import { useSectionReveal } from 'src/hooks/use-section-reveal';
import { usePortfolioCompanies } from 'src/hooks/use-portfolio-companies';

import { MainLayout } from 'src/layouts/website/main-layout';

import { PageMeta } from 'src/components/website/page-meta';
import { SectionBadge } from 'src/components/website/section-badge';
import { FilterSelect } from 'src/components/website/filter-select';
import { ContentButton } from 'src/components/website/content-button';

import { ClampText } from './clamp-text';

// import { CaseStudySection } from 'src/sections/home/case-study/case-study-section';

const PAGE_SIZE = 9;

export default function PortfolioPage() {
  const { content, loading } = useHomepage();
  const { data, loading: portfolioLoading } = usePortfolio();
  const scope = useRef<HTMLElement>(null);
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const {
    companies,
    total,
    sectors,
    stages,
    loading: companiesLoading,
  } = usePortfolioCompanies({ limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE, sector, stage });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
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
  // Drop filters that no longer exist after a CMS edit.
  useEffect(() => {
    setSector((current) => (sectors.includes(current) ? current : ''));
  }, [sectors]);
  useEffect(() => {
    setStage((current) => (stages.includes(current) ? current : ''));
  }, [stages]);
  useEffect(() => {
    setSelected((current) => (companies.some((company) => company.key === current) ? current : null));
  }, [companies]);
  // Companies removed in the CMS can leave the visitor past the last page.
  useEffect(() => {
    if (!companiesLoading && page > pageCount) setPage(pageCount);
  }, [companiesLoading, page, pageCount]);
  useSectionReveal(scope, `${sector}:${stage}:${page}:${JSON.stringify(data)}:${JSON.stringify(companies)}`);
  const reset = () => {
    setSector('');
    setStage('');
    setPage(1);
    setSelected(null);
  };
  const changePage = (next: number) => {
    if (next === page) return;
    setPage(next);
    setSelected(null);
    // Bring the section back into view so the new page is read from the start
    // (the controls sit under the grid). Leaves ~96px above the section content
    // for the fixed site header, accounting for the section's own top padding.
    const section = scope.current;
    const top = section?.getBoundingClientRect().top;
    if (section && top !== undefined && top < 0) {
      const padding = parseFloat(getComputedStyle(section).paddingTop) || 0;
      window.scrollTo({ top: window.scrollY + top - Math.max(0, 96 - padding) });
    }
  };
  // const stories = data.featuredStories;
  return (
    <MainLayout
      global={content.global}
      loading={loading || portfolioLoading}
      contentVersion={JSON.stringify(data)}
      colorFlow={false}
    >
      <PageMeta
        title={data.title}
        description="The founders and companies Capitar Ventures has backed with venture debt, by sector and stage."
        path="/portfolio"
      />
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
      {/* Featured Stories is temporarily hidden on desktop and mobile.
      <CaseStudySection data={stories} variant="portfolio" />
      */}
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
                <strong>
                  {total}{' '}
                  {total === 1
                    ? data.companiesSection.companyLabel
                    : data.companiesSection.companiesLabel}
                </strong>
              </div>
              <FilterSelect
                id="portfolio-sector"
                label={data.companiesSection.sectorLabel}
                className="portfolio-filter"
                value={sector}
                options={[
                  { value: '', label: data.companiesSection.allSectorsLabel },
                  ...sectors.map((item) => ({ value: item, label: item })),
                ]}
                onChange={(value) => {
                  setSector(value);
                  setPage(1);
                  setSelected(null);
                }}
              />
              <FilterSelect
                id="portfolio-stage"
                label={data.companiesSection.stageLabel}
                className="portfolio-filter"
                value={stage}
                options={[
                  { value: '', label: data.companiesSection.allStagesLabel },
                  ...stages.map((item) => ({ value: item, label: item })),
                ]}
                onChange={(value) => {
                  setStage(value);
                  setPage(1);
                  setSelected(null);
                }}
              />
            </div>
            <ul
              className="portfolio-grid"
              aria-label="Portfolio companies"
              aria-busy={companiesLoading}
              data-loading={companiesLoading}
            >
              {companies.map((company) => (
                <li key={company.key} data-scroll-reveal="card">
                  <article className="portfolio-card" data-selected={selected === company.key}>
                    {company.websiteUrl ? (
                      <a
                        className="portfolio-card__toggle"
                        href={company.websiteUrl}
                        aria-label={`Visit ${company.name} website`}
                      >
                        <span className="portfolio-card__arrow" aria-hidden="true">
                          <img src="/assets/portfolio/card-arrow.svg" alt="" />
                        </span>
                      </a>
                    ) : (
                      <button
                        className="portfolio-card__toggle"
                        aria-label={`${company.name}: highlight card`}
                        aria-pressed={selected === company.key}
                        onClick={() => setSelected(selected === company.key ? null : company.key)}
                      >
                        <span className="portfolio-card__arrow" aria-hidden="true">
                          <img src="/assets/portfolio/card-arrow.svg" alt="" />
                        </span>
                      </button>
                    )}
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
                      <ClampText as="h3" text={company.name} lines={2} />
                      <ClampText text={company.description} lines={3} />
                    </div>
                    <div className="portfolio-card__bottom">
                      {company.founder.name && (
                        <div className="portfolio-card__founders">
                          <h4>{data.companiesSection.foundersLabel}</h4>
                          <ClampText text={company.founder.name} lines={2} />
                        </div>
                      )}
                      {(company.sector || company.stage) && (
                        <div className="portfolio-card__meta">
                          {/* One heading for both tags, e.g. "Sectors & Stage at Investment". */}
                          <h4>
                            {[
                              company.sector && data.companiesSection.cardTagsLabel,
                              company.stage && data.companiesSection.cardStageLabel,
                            ]
                              .filter(Boolean)
                              .join(' & ')}
                          </h4>
                          <div className="portfolio-card__tags">
                            {company.sector && (
                              <span className="portfolio-tag">{company.sector}</span>
                            )}
                            {company.stage && (
                              <span className="portfolio-tag">{company.stage}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
            {pageCount > 1 && (
              <nav className="portfolio-pagination" aria-label="Portfolio companies pages">
                <Pagination
                  count={pageCount}
                  page={Math.min(page, pageCount)}
                  onChange={(_, next) => changePage(next)}
                  shape="rounded"
                  siblingCount={1}
                  boundaryCount={1}
                />
              </nav>
            )}
            {!companies.length && !companiesLoading && (
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

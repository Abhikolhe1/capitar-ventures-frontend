import './about-us.css';

import type { CSSProperties } from 'react';

import { useRef, useState, useEffect } from 'react';

import { useAboutUs } from 'src/hooks/use-about-us';
import { useHomepage } from 'src/hooks/use-homepage';

import { MainLayout } from 'src/layouts/website/main-layout';

import { PageMeta } from 'src/components/website/page-meta';
import { SectionBadge } from 'src/components/website/section-badge';
import { ContentButton } from 'src/components/website/content-button';
import { TeamPersonCard as TeamCard } from 'src/components/website/team-person-card';

import { QuoteArtwork } from './quote-artwork';
import { useBeliefSticky } from './use-belief-sticky';
import { useAboutAnimation } from './use-about-animation';

const asset = (name: string) => `/assets/about/${name}`;
function Badge({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <SectionBadge
      text={children.toUpperCase()}
      minWidth={0}
      color={light ? '#FFFFFF' : '#401E17'}
      borderColor={light ? '#FFFFFF66' : '#CC233466'}
      lineHeight={1}
    />
  );
}
export default function AboutUsPage() {
  const { content: homepage, loading } = useHomepage();
  const { data: content } = useAboutUs();
  const scope = useRef<HTMLElement>(null);
  const version = JSON.stringify(content);
  const artwork = (name: string) => content.artworks?.[name] || asset(name);
  const [active, setActive] = useState(0);
  useAboutAnimation(scope, version);
  const selectBelief = useBeliefSticky(scope, version, content.belief.items.length, setActive);
  useEffect(() => {
    const previous = document.title;
    window.scrollTo(0, 0);
    return () => {
      document.title = previous;
    };
  }, []);
  useEffect(() => {
    document.title = content.title;
  }, [content.title]);
  return (
    <MainLayout
      global={homepage.global}
      loading={loading}
      contentVersion={version}
      mainRef={scope}
      mainClassName="about-page"
    >
      <PageMeta
        title={content.title}
        description="Capitar Ventures is a SEBI-registered Category II AIF providing venture debt to early-stage startups in India. Meet the team and how we work."
        path="/about-us"
      />
      <section className="about-page about-hero" id="about-hero" aria-labelledby="about-title">
        <div className="about-hero-art" data-entrance="background" aria-hidden="true">
          <div className="about-hero-image">
            <img src={artwork('neon-blue-glass-panel-corridor.png')} alt="" fetchPriority="high" />
          </div>
          <div className="about-hero-tint" />
          <img className="about-hero-overlay" src={artwork('hero-navy-overlay.png')} alt="" />
          <img className="about-hero-bottom-fade" src={artwork('hero-bottom-fade.png')} alt="" />
        </div>
        <div className="about-container about-hero-copy">
          <div data-entrance="content">
            <Badge light>{content.hero.label}</Badge>
          </div>
          <h1 id="about-title" data-entrance="heading">
            {content.hero.heading} <strong>{content.hero.emphasis}</strong>
          </h1>
          <p data-entrance="content">{content.hero.description}</p>
          <div data-entrance="content">
            <ContentButton arrow data={content.hero.cta} />
          </div>
        </div>
      </section>
      <>
        {/* "Our Mission" section hidden for now.
        <section className="about-mission" id="mission" aria-labelledby="mission-title">
          <div
            className="about-section-art about-section-art--light"
            data-flow-artwork
            data-flow-artwork-hold="40"
          >
            <img
              className="about-mission-map"
              src={content.mission.image}
              alt="India's glass network map with connected locations across the country"
              loading="lazy"
              width={1440}
              height={699}
            />
          </div>
          <div className="about-container about-mission-inner">
            <div className="about-mission-heading" data-scroll-reveal="mission-heading">
              <Badge>{content.mission.label}</Badge>
              <h2 id="mission-title">
                {content.mission.heading}
                <br />
                <strong>{content.mission.emphasis}</strong>
              </h2>
            </div>
            <p data-scroll-reveal="mission-description">{content.mission.description}</p>
          </div>
        </section>
        */}
        <section className="about-journey" id="journey" aria-labelledby="journey-title">
          <div className="about-section-art" data-flow-artwork aria-hidden="true">
            <div className="about-journey-art" aria-hidden="true">
              <img src={artwork('journey-glass-growth.png')} alt="" loading="lazy" />
            </div>
            <img
              className="about-journey-fade"
              src={artwork('journey-navy-fade.png')}
              alt=""
              loading="lazy"
            />
            <img
              className="about-journey-glow about-journey-glow--blue"
              src={artwork('journey-blue-glow.png')}
              alt=""
              loading="lazy"
            />
            <img
              className="about-journey-glow about-journey-glow--cyan"
              src={artwork('journey-cyan-glow.png')}
              alt=""
              loading="lazy"
            />
          </div>
          <div className="about-journey-inner">
            <div className="about-journey-copy" data-scroll-reveal="journey-heading">
              <Badge light>{content.journey.label}</Badge>
              <h2 id="journey-title">
                {content.journey.heading}
                <br />
                <strong>{content.journey.emphasis}</strong>
              </h2>
              <p>{content.journey.description}</p>
            </div>
            <ol className="about-milestones" aria-label="Capitar journey">
              {content.journey.milestones.map((item) => (
                <li key={item.period} data-scroll-reveal="milestone">
                  <h3>{item.title}</h3>
                  <span className="about-milestone-period">{item.period}</span>
                  <p>{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        {/* CMS: About Us > Belief > enabled hides this whole section. */}
        {content.belief.enabled && (
          <section
            className="about-belief"
            id="belief"
            aria-labelledby="belief-title"
            style={{ '--belief-scroll': `${content.belief.items.length * 75}vh` } as CSSProperties}
          >
            <div className="about-belief-stage">
              <div className="about-section-art" data-flow-artwork aria-hidden="true">
                <img
                  className="about-belief-waves"
                  src={artwork('belief-waves.png')}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="about-belief-inner">
                <div className="about-belief-copy" data-scroll-reveal="belief-heading">
                  <Badge light>{content.belief.label}</Badge>
                  <h2 id="belief-title">{content.belief.heading}</h2>
                  <p>{content.belief.description}</p>
                </div>
                <div className="about-principles" data-scroll-reveal="belief-principles">
                  {content.belief.items.map((item, index) => (
                    <div
                      className="about-principle"
                      data-active={active === index}
                      key={item.number}
                    >
                      <button
                        type="button"
                        aria-expanded={active === index}
                        aria-controls={`about-principle-${index}`}
                        onClick={() => selectBelief(index)}
                      >
                        <span className="about-principle-number">{item.number}</span>
                        <span className="about-principle-copy">
                          <span className="about-principle-title">{item.title}</span>
                          {item.description && (
                            <span
                              className="about-principle-detail"
                              id={`about-principle-${index}`}
                            >
                              <span className="about-principle-description">
                                {item.description}
                              </span>
                            </span>
                          )}
                        </span>
                      </button>
                      {!item.description && <span id={`about-principle-${index}`} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
        <section className="about-people" id="people" aria-labelledby="people-title">
          <div className="about-container">
            <div className="about-people-header" data-scroll-reveal="people-heading">
              <div>
                <Badge>{content.people.label}</Badge>
                <h2 id="people-title">{content.people.heading}</h2>
              </div>
              <p>{content.people.description}</p>
            </div>
            <div className="about-team-grid">
              {content.people.team.map((member, index) => (
                <TeamCard
                  artwork={artwork}
                  biography={content.people.biography}
                  member={member}
                  index={index}
                  key={`${member.portrait}-${index}`}
                />
              ))}
            </div>
          </div>
        </section>
        <section className="about-quote" aria-labelledby="about-quote-text">
          <QuoteArtwork src={artwork('quote-decoration.svg')} />
          <figure data-scroll-reveal="quote">
            <img
              className="about-quote-mark"
              src={artwork('quotation-mark.png')}
              alt=""
              width={75}
              height={60}
              loading="lazy"
            />
            <blockquote id="about-quote-text">{content.quote.statement}</blockquote>
            <figcaption>{content.quote.label}</figcaption>
          </figure>
        </section>
      </>
    </MainLayout>
  );
}

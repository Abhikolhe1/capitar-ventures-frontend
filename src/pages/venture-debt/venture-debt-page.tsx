import './venture-debt.css';

import { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import { useHomepage } from 'src/hooks/use-homepage';
import { useVentureDebt } from 'src/hooks/use-venture-debt';
import { useSectionReveal } from 'src/hooks/use-section-reveal';

import { MainLayout } from 'src/layouts/website/main-layout';

import { SectionBadge } from 'src/components/website/section-badge';
import { ContentButton } from 'src/components/website/content-button';
import { LiquidGlassButton } from 'src/components/website/liquid-glass-button';

import { PixelReveal } from './pixel-reveal';
import { usePinnedSteps } from './use-pinned-steps';

const asset = (file: string) => `/assets/venture-debt/${file}`;
function Badge({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <SectionBadge
      text={children}
      minWidth={0}
      color={light ? '#FFFFFF' : undefined}
      borderColor={light ? 'rgba(255,255,255,.7)' : undefined}
    />
  );
}

export default function VentureDebtPage() {
  const { content, loading: globalLoading } = useHomepage();
  const { content: page, loading: pageLoading } = useVentureDebt();
  const loading = globalLoading || pageLoading;
  const { hero, before, process, practice, faq: faqContent } = page;
  const chapters = useMemo(
    () =>
      [
        ['before', before],
        ['with-capitar', process],
        ['in-practice', practice],
        ['before-you-decide', faqContent],
      ]
        .filter(([, section]) => typeof section !== 'string' && section.enabled)
        .map(([id]) => [
          String(id),
          page.timeline.find((item) => item.section === id)?.label || String(id),
        ]),
    [before, process, practice, faqContent, page.timeline]
  );
  const signals = before.items;
  const steps = process.items;
  const outcomes = practice.items;
  const questions = faqContent.items;
  const practiceSection = useRef<HTMLElement>(null);
  const chapterTimeline = useRef<HTMLElement>(null);
  useSectionReveal(practiceSection, JSON.stringify(practice));
  const {
    trackRef: signalsTrack,
    active: signalIndex,
    select: setSignal,
  } = usePinnedSteps(Math.max(1, signals.length), before.enabled);
  const {
    trackRef: processTrack,
    active: stepIndex,
    select: setStep,
  } = usePinnedSteps(Math.max(1, steps.length), process.enabled);
  const signal = Math.min(signalIndex, signals.length - 1);
  const step = Math.min(stepIndex, steps.length - 1);
  const [chapter, setChapter] = useState('before');
  const [faq, setFaq] = useState<number | null>(0);
  useEffect(() => {
    document.title = page.title;
    const sections = chapters
      .map(([id]) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    let frame = 0;
    const update = () => {
      frame = 0;
      // Compare every chapter at the same viewport line. IntersectionObserver
      // entries contain only changed intersections, not all visible sections.
      const readingLine = window.innerHeight * 0.3;
      let current = chapters[0]?.[0] || '';
      let lastSectionTop = Infinity;
      sections.forEach((section) => {
        const top = section.getBoundingClientRect().top;
        if (top <= readingLine) current = section.id;
        if (section.id === chapters[chapters.length - 1]?.[0]) lastSectionTop = top;
      });
      setChapter(current);
      const timeline = chapterTimeline.current;
      if (timeline) {
        // Release at the START of the last chapter, rather than the end of main.
        // Match document scrolling exactly, including when scrolling back up.
        const height = timeline.offsetHeight;
        const offset = Math.max(-height, Math.min(0, lastSectionTop - height));
        timeline.style.transform = `translateY(${offset}px)`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    sections.forEach((section) => observer.observe(section));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [page.title, chapters]);
  const global = {
    ...content.global,
    navigation: content.global.navigation.map((item) =>
      item.label === 'Venture Debt'
        ? { ...item, enabled: true, href: '/venture-debt' }
        : { ...item, href: item.href?.startsWith('#') ? `/${item.href}` : item.href }
    ),
  };
  return (
    <MainLayout global={global} loading={loading}>
      {hero.enabled && (
        <Box component="section" className="vd-hero" id="venture-debt" aria-labelledby="vd-title">
          <div className="vd-hero-art" data-entrance="background" aria-hidden="true">
            <img className="vd-banner-base" src={hero.backgroundImage.url} alt="" />
            <img className="vd-banner-glass" src={hero.glassImage.url} alt="" />
            <div className="vd-hero-shade" />
            <img className="vd-hero-glow" src={hero.glowImage.url} alt="" />
          </div>
          <div className="vd-hero-copy vd-container">
            <div data-entrance="content">
              <Badge light>{hero.sectionLabel}</Badge>
            </div>
            <h1 id="vd-title" data-entrance="heading">
              {hero.heading}
              <strong>{hero.emphasisText}</strong>
            </h1>
            <p data-entrance="content">{hero.description}</p>
            <div className="vd-actions" data-entrance="content">
              <ContentButton data={hero.primaryCta} arrow />
              {hero.secondaryCta.enabled && <LiquidGlassButton data={hero.secondaryCta} />}
            </div>
          </div>
        </Box>
      )}
      <nav ref={chapterTimeline} className="vd-chapters" aria-label="Venture debt sections">
        <Box
          className="vd-chapters-inner"
          sx={{ maxWidth: 1441, mx: 'auto', width: '100%', px: { xs: '20px', sm: 6, lg: '100px' } }}
        >
          {chapters.map(([id, label], i) => (
            <a key={id} href={`#${id}`} aria-current={chapter === id ? 'location' : undefined}>
              <span>0{i + 1}</span>
              <span aria-hidden="true">·</span>
              <strong>{label}</strong>
            </a>
          ))}
        </Box>
      </nav>
      {before.enabled && (
        <Box
          component="section"
          id="before"
          className="vd-light vd-before"
          aria-labelledby="vd-before-title"
        >
          <div className="vd-container">
            <div className="vd-heading-row">
              <div>
                <Badge>{before.sectionLabel}</Badge>
                <h2 id="vd-before-title">
                  <span>{before.mutedHeading}</span>
                  <br />
                  {before.heading}
                </h2>
              </div>
              <p>{before.description}</p>
            </div>
            <div className="vd-divider" aria-hidden="true">
              <img src={asset('4a725.svg')} alt="" />
              <img src={asset('3d1ba.svg')} alt="" />
              <img src={asset('4a725.svg')} alt="" />
            </div>
            <div className="vd-scroll-track vd-signals-track" ref={signalsTrack}>
              <div className="vd-signals-grid vd-pinned-panel">
                <div>
                  <Badge>{before.signalsLabel}</Badge>
                  <h2>
                    {before.signalsHeading}
                    <span>{before.signalsMutedHeading}</span>
                  </h2>
                  <div className="vd-signals">
                    {signals.map(({ title, description }, i) => (
                      <div className="vd-signal" data-active={signal === i} key={title}>
                        <button
                          id={`signal-${i}`}
                          onClick={() => setSignal(i)}
                          aria-expanded={signal === i}
                          aria-controls={`signal-panel-${i}`}
                        >
                          <img src={asset('32ee5.svg')} alt="" />
                          <span>{title}</span>
                          <span className="vd-signal-arrow" aria-hidden="true">
                            ↗
                          </span>
                        </button>
                        <div
                          id={`signal-panel-${i}`}
                          role="region"
                          aria-labelledby={`signal-${i}`}
                          className="vd-signal-detail"
                        >
                          <p>{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="vd-signal-art"
                  aria-label={`Signal ${signal + 1}: ${signals[signal]?.title || ''}`}
                >
                  <div className="vd-signal-background" aria-hidden="true">
                    <img src="/assets/venture-debt/signal-background-glow.svg" alt="" />
                  </div>
                  <PixelReveal image={signals[signal]?.image || before.image} index={signal} />
                </div>
              </div>
            </div>
          </div>
        </Box>
      )}
      {process.enabled && (
        <Box
          component="section"
          id="with-capitar"
          className="vd-process"
          aria-labelledby="vd-process-title"
        >
          <div className="vd-scroll-track vd-process-track" ref={processTrack}>
            <div className="vd-container vd-process-grid vd-pinned-panel">
              <div>
                <Badge light>{process.sectionLabel}</Badge>
                <h2 id="vd-process-title">{process.heading}</h2>
                <p>{process.description}</p>
              </div>
              <div className="vd-steps">
                {steps.map(({ label, title, description }, i) => (
                  <div className="vd-step" data-active={step === i} key={label}>
                    <button
                      id={`step-${i}`}
                      onClick={() => setStep(i)}
                      aria-expanded={step === i}
                      aria-controls={`step-panel-${i}`}
                    >
                      <span className="vd-step-number">
                        <span>0{i + 1}</span>
                        <small>{label}</small>
                      </span>
                      <span className="vd-step-copy">
                        <span className="vd-step-title">{title}</span>
                        <span
                          id={`step-panel-${i}`}
                          role="region"
                          aria-labelledby={`step-${i}`}
                          className="vd-step-detail"
                        >
                          <span className="vd-step-description">{description}</span>
                        </span>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="vd-process-curves" aria-hidden="true">
                <img src={process.decoration.url} alt="" />
                <img src={process.decoration.url} alt="" />
              </div>
            </div>
          </div>
        </Box>
      )}
      {practice.enabled && (
        <Box
          component="section"
          id="in-practice"
          ref={practiceSection}
          className="vd-light vd-practice"
          aria-labelledby="vd-practice-title"
        >
          <div className="vd-container">
            <div className="vd-practice-grid">
              <div>
                <div data-scroll-reveal="practice-label">
                  <Badge>{practice.sectionLabel}</Badge>
                </div>
                <h2 id="vd-practice-title" data-scroll-reveal="practice-heading">
                  {practice.heading}
                </h2>
                <blockquote data-scroll-reveal="practice-quote">
                  <p>{practice.quote}</p>
                  <cite>{practice.attribution}</cite>
                </blockquote>
                <div data-scroll-reveal="practice-cta">
                  <ContentButton data={practice.cta} arrow appearance="difference" />
                </div>
              </div>
              <img
                className="vd-office"
                data-scroll-reveal="practice-image"
                src={practice.image.url}
                alt={practice.image.alternativeText}
              />
            </div>
            <div className="vd-outcomes">
              {outcomes.map(({ title, description, icon }, i) => (
                <article key={title} data-scroll-reveal="practice-outcome">
                  <div
                    className={
                      icon ? 'vd-outcome-custom-icon' : `vd-outcome-icon vd-outcome-icon-${i}`
                    }
                  >
                    <img src={icon?.url || practice.outcomeSprite.url} alt="" />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </Box>
      )}
      {faqContent.enabled && (
        <Box
          component="section"
          id="before-you-decide"
          className="vd-light vd-faq"
          aria-labelledby="vd-faq-title"
        >
          <div className="vd-container">
            <div className="vd-heading-row">
              <div>
                <Badge>{faqContent.sectionLabel}</Badge>
                <h2 id="vd-faq-title">{faqContent.heading}</h2>
              </div>
              <p>{faqContent.description}</p>
            </div>
            <div className="vd-questions">
              {questions.map(({ question, answer }, i) => (
                <div className="vd-question" key={question}>
                  <h3>
                    <button
                      id={`faq-${i}`}
                      onClick={() => setFaq(faq === i ? null : i)}
                      aria-expanded={faq === i}
                      aria-controls={`faq-panel-${i}`}
                    >
                      <span>{question}</span>
                      <img src={asset(faq === i ? '4f5cc.svg' : '7efe9.svg')} alt="" />
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-${i}`}
                    hidden={faq !== i}
                  >
                    <p>{answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Box>
      )}
    </MainLayout>
  );
}

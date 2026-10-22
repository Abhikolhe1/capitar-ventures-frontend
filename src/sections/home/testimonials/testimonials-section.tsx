import type { TestimonialContent, TestimonialsContent } from 'src/types/homepage';

import { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useSectionReveal } from 'src/hooks/use-section-reveal';

import { websiteTokens } from 'src/theme/website-theme';

import { SectionBadge } from 'src/components/website/section-badge';

function Arrow({ previous = false }: { previous?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={previous ? 'M19 12H5m5-5-5 5 5 5' : 'M5 12h14m-5-5 5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TestimonialCard({ item }: { item: TestimonialContent }) {
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  useEffect(() => setPortraitFailed(false), [item.portrait?.url]);
  useEffect(() => setLogoFailed(false), [item.companyLogo?.url]);
  const initials = item.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('');
  return (
    <Box
      component="li"
      sx={{
        flex: '0 0 var(--testimonial-card-width)',
        minWidth: 0,
        listStyle: 'none',
        scrollSnapAlign: 'start',
        display: 'flex',
        '&:nth-of-type(3)': { flexBasis: { sm: '428px' } },
      }}
    >
      <Box
        component="article"
        aria-label={`Testimonial from ${item.name}`}
        sx={{
          width: '100%',
          height: { xs: 'auto', sm: '523.4px' },
          minHeight: '523.4px',
          boxSizing: 'border-box',
          bgcolor: '#F9FAFB',
          border: '1px solid rgba(0,0,0,.02)',
          borderRadius: '24px',
          p: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: '32px', sm: '52px' },
        }}
      >
        <Box
          sx={{
            height: 72,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {item.portrait && !portraitFailed ? (
            <Box
              component="img"
              src={item.portrait.url}
              alt={item.portrait.alternativeText || item.name}
              loading="lazy"
              onError={() => setPortraitFailed(true)}
              sx={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 20%', flexShrink: 0 }}
            />
          ) : (
            <Box
              aria-hidden="true"
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: '#0B0F2D',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                fontSize: 24,
                flexShrink: 0,
              }}
            >
              {initials}
            </Box>
          )}
          {(item.companyLogo || item.company) && (
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 96,
                height: 40,
                borderRadius: '999px',
                bgcolor: 'white',
                border: '1px solid rgba(0,0,0,.03)',
                flexShrink: 0,
              }}
            >
              {item.companyLogo && !logoFailed ? (
                <Box
                  component="img"
                  src={item.companyLogo.url}
                  alt={item.companyLogo.alternativeText || item.company || ''}
                  loading="lazy"
                  onError={() => setLogoFailed(true)}
                  sx={{
                    maxWidth: 72,
                    maxHeight: 28,
                    objectFit: 'contain',
                    filter: item.companyLogoMonochrome ? 'brightness(0)' : undefined,
                  }}
                />
              ) : (
                <Typography sx={{ fontSize: 14, color: '#121212' }}>{item.company}</Typography>
              )}
            </Box>
          )}
        </Box>
        <Box
          component="blockquote"
          tabIndex={0}
          aria-label={`Quote from ${item.name}`}
          sx={{
            m: 0,
            minHeight: 0,
            flex: 1,
            overflowY: { xs: 'visible', sm: 'auto' },
            overflowWrap: 'anywhere',
            scrollbarWidth: 'thin',
            '&:focus-visible': { outline: '2px solid #193969', outlineOffset: 4 },
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              height: 32,
              fontFamily: 'Georgia, serif',
              fontSize: 64,
              lineHeight: 1,
              color: '#5178BA',
            }}
          >
            “
          </Box>
          <Typography
            sx={{
              mt: '24px',
              color: '#121212',
              fontSize: { xs: 24, sm: 28 },
              lineHeight: 1.6,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              whiteSpace: 'pre-line',
            }}
          >
            {item.quote}
          </Typography>
        </Box>
        <Box
          component="footer"
          sx={{
            minHeight: 90,
            flexShrink: 0,
            pl: '24px',
            borderLeft: '1px solid #BF8F99',
            color: '#121212',
            overflowWrap: 'anywhere',
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 500, lineHeight: 1.6, letterSpacing: '-0.02em' }}>{item.name}</Typography>
          {(item.role || item.company) && (
            <Typography sx={{ mt: '8px', fontSize: 16, lineHeight: 1.5 }}>
              {[item.role, item.company].filter(Boolean).join(', ')}
            </Typography>
          )}
          {item.location && (
            <Typography sx={{ mt: '8px', fontSize: 14, lineHeight: 1.4, color: '#85858A' }}>
              {item.location}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export function TestimonialsSection({ data }: { data?: TestimonialsContent }) {
  const section = useRef<HTMLElement>(null);
  useSectionReveal(section, JSON.stringify(data));
  const track = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ previous: false, next: false });
  const signature = JSON.stringify(data);
  const update = useCallback(() => {
    const element = track.current;
    if (element)
      setPosition({
        previous: element.scrollLeft > 2,
        next: element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
      });
  }, []);
  useLayoutEffect(() => {
    const element = track.current;
    if (!element) return undefined;
    element.scrollLeft = 0;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [signature, update]);
  if (!data?.enabled || !data.items.length) return null;
  const move = (direction: number) => {
    const element = track.current;
    const card = element?.firstElementChild;
    if (!element || !card) return;
    element.scrollBy({
      left: direction * (card.getBoundingClientRect().width + 24),
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };
  return (
    <Box
      ref={section}
      component="section"
      id="client-testimonials"
      aria-labelledby="testimonials-heading"
      sx={{
        bgcolor: '#FFF',
        color: '#121212',
        pt: { xs: '48px', md: '60px' },
        pb: { xs: '56px', md: '80px' },
        overflow: 'hidden',
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Box
          data-scroll-reveal="testimonials-heading"
          data-testimonials-header
          sx={{
            maxWidth: websiteTokens.maxWidth,
            mx: 'auto',
            px: { xs: 3, sm: 6, md: '60px' },
            mb: '36px',
            display: 'flex',
            alignItems: { xs: 'start', sm: 'end' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
          }}
        >
          <Box>
            <SectionBadge text={data.sectionLabel} minWidth={0} lineHeight={1.4} />
            <Typography
              component="h2"
              id="testimonials-heading"
              sx={{
                mt: '22px',
                fontSize: { xs: 28, md: 42 },
                lineHeight: 1.2,
                fontWeight: 400,
                letterSpacing: '-.02em',
                whiteSpace: 'pre-line',
              }}
            >
              {data.heading}
            </Typography>
          </Box>
          <Box
            aria-label="Testimonial carousel controls"
            sx={{
              display: 'flex',
              gap: '10px',
              alignSelf: { xs: 'end', sm: 'auto' },
              flexShrink: 0,
            }}
          >
            <IconButton
              aria-label="Previous testimonials"
              disabled={!position.previous}
              onClick={() => move(-1)}
              sx={{
                width: 80,
                height: 44,
                borderRadius: '99px 0 0 99px', justifyContent: 'flex-start', px: '18px',
                bgcolor: '#100A42',
                color: 'white',
                '&:hover': { bgcolor: '#242447' },
                '&.Mui-disabled': { bgcolor: '#100A42', color: 'rgba(255,255,255,.4)' },
              }}
            >
              <Arrow previous />
            </IconButton>
            <IconButton
              aria-label="Next testimonials"
              disabled={!position.next}
              onClick={() => move(1)}
              sx={{
                width: 80,
                height: 44,
                borderRadius: '0 99px 99px 0', justifyContent: 'flex-end', px: '18px',
                bgcolor: '#100A42',
                color: 'white',
                '&:hover': { bgcolor: '#242447' },
                '&.Mui-disabled': { bgcolor: '#100A42', color: 'rgba(255,255,255,.4)' },
              }}
            >
              <Arrow />
            </IconButton>
          </Box>
        </Box>
        <Box
          data-scroll-reveal="testimonials-track"
          ref={track}
          component="ul"
          tabIndex={0}
          aria-label="Client testimonials"
          onScroll={update}
          sx={{
            '--testimonial-card-width': { xs: 'calc(100vw - 64px)', sm: '427px' },
            display: 'flex',
            gap: '24px',
            m: 0,
            py: 0,
            pl: { xs: 3, sm: 6, md: `max(60px,calc((100% - ${websiteTokens.maxWidth}px) / 2 + 60px))` },
            pr: 0,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollPaddingInlineStart: { xs: '24px', sm: '48px', md: `max(60px,calc((100% - ${websiteTokens.maxWidth}px) / 2 + 60px))` },
            overscrollBehaviorX: 'contain',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            '&:focus-visible': { outline: '2px solid #193969', outlineOffset: '-2px' },
          }}
        >
          {data.items.map((item, index) => (
            <TestimonialCard key={`${index}-${item.name}`} item={item} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

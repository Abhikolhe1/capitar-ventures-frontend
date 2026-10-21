import type { InsightsNewsContent, EditorialCardContent } from 'src/types/homepage';

import { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { websiteTokens } from 'src/theme/website-theme';

import { SectionBadge } from 'src/components/website/section-badge';

type TabKey = 'insights' | 'news';

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

function EditorialCard({ item }: { item: EditorialCardContent }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [item.image?.url]);
  const body = (
    <>
      <Box
        sx={{
          px: '24px',
          py: '18px',
          minHeight: 194,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}
        >
          <Typography
            sx={{
              color: '#B72D40',
              fontSize: 14,
              lineHeight: 1.2,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {item.category}
          </Typography>
          <Box
            className="editorial-arrow"
            aria-hidden="true"
            sx={{
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: '6px',
              bgcolor: '#101414',
              color: 'white',
              display: 'grid',
              placeItems: 'center',
              '& svg': { transition: 'transform 180ms ease' },
            }}
          >
            <Arrow />
          </Box>
        </Box>
        <Typography
          component="h3"
          title={item.title}
          sx={{
            mt: '20px',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: { xs: 24, sm: 28 },
            lineHeight: 1.2,
            fontWeight: 400,
            color: '#38465C',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.title}
        </Typography>
        {item.description && (
          <Typography
            sx={{
              mt: '8px',
              fontSize: 18,
              lineHeight: 1.4,
              color: '#6B7688',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          borderRadius: '0 0 14px 14px',
          overflow: 'hidden',
          bgcolor: '#E6E8ED',
        }}
      >
        {item.image && !failed && (
          <Box
            component="img"
            src={item.image.url}
            alt={item.image.alternativeText || ''}
            loading="lazy"
            onError={() => setFailed(true)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </Box>
    </>
  );
  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none',
        flex: '0 0 var(--editorial-card-width)',
        minWidth: 0,
        scrollSnapAlign: 'start',
      }}
    >
      <Box
        component="article"
        sx={{
          height: { xs: 420, sm: 445 },
          borderRadius: '20px',
          p: '6px',
          bgcolor: '#F9FAFB',
          border: '1px solid rgba(0,0,0,.02)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          '& a:focus-visible': {
            outline: '2px solid #CC2334',
            outlineOffset: '-2px',
            borderRadius: '14px',
          },
          '& a:hover .editorial-arrow svg': { transform: 'translateX(2px)' },
          '@media (prefers-reduced-motion: reduce)': { '& svg': { transition: 'none' } },
        }}
      >
        <Box
          component={item.href ? 'a' : 'div'}
          href={item.href}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          {body}
        </Box>
      </Box>
    </Box>
  );
}

export function InsightsNewsSection({ data }: { data?: InsightsNewsContent }) {
  const [active, setActive] = useState<TabKey>('insights');
  const [position, setPosition] = useState({ previous: false, next: false });
  const track = useRef<HTMLUListElement>(null);
  const content = data?.[active];
  const signature = JSON.stringify(content);
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
  }, [active, signature, data?.enabled, update]);
  if (!data?.enabled || !content) return null;
  const move = (direction: number) => {
    const element = track.current;
    const card = element?.firstElementChild;
    if (!element || !card) return;
    element.scrollBy({
      left: direction * (card.getBoundingClientRect().width + 20),
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };
  return (
    <Box
      component="section"
      id="insights-news"
      aria-labelledby="editorial-heading"
      sx={{
        bgcolor: '#111129',
        color: '#F9FAFB',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: '48px', md: '70px' },
        pb: { xs: '48px', md: '35px' },
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          pointerEvents: 'none',
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,.23)',
          top: '-150px',
          left: '50%',
          transform: 'rotate(-20deg)',
        },
        '&::after': {
          width: 950,
          height: 950,
          left: '73%',
          top: '-110px',
          bgcolor: 'rgba(255,255,255,.025)',
          borderColor: 'rgba(255,255,255,.6)',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: websiteTokens.maxWidth, mx: 'auto' }}>
        <Box
          sx={{
            px: { xs: 3, sm: 6, md: '60px' },
            mb: '48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'start', sm: 'end' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
          }}
        >
          <Box>
            <SectionBadge
              text={content.sectionLabel}
              color="#F9FAFB"
              borderColor="rgba(255,255,255,.65)"
              minWidth={0}
              fontWeight={400}
            />
            <Typography
              component="h2"
              id="editorial-heading"
              sx={{
                mt: '22px',
                fontSize: { xs: 32, md: 40 },
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: '-.035em',
                maxWidth: 550,
                minHeight: { xs: 77, md: 96 },
                whiteSpace: 'pre-line',
              }}
            >
              {content.heading}
            </Typography>
          </Box>
          <Tabs
            value={active}
            onChange={(_, value: TabKey) => setActive(value)}
            aria-label="Insights and News"
            sx={{
              bgcolor: '#F9FAFB',
              border: '2px solid #F9FAFB',
              borderRadius: '999px',
              minHeight: 48,
              flexShrink: 0,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTabs-flexContainer': { gap: 0 },
              '& .MuiTab-root': {
                flexDirection: 'row',
                minHeight: 48,
                minWidth: 105,
                px: 2,
                py: 1,
                color: '#5F6268',
                fontSize: 18,
                fontWeight: 400,
                textTransform: 'none',
                borderRadius: '999px',
              },
              '& .MuiTab-root.Mui-selected': { bgcolor: '#101414', color: '#F9FAFB' },
              '& .Mui-selected::before': {
                content: '""',
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#CC2334',
                mr: 1,
              },
              '& .Mui-focusVisible': { outline: '2px solid #CC2334', outlineOffset: '-3px' },
            }}
          >
            {(['insights', 'news'] as const).map((key) => (
              <Tab
                key={key}
                value={key}
                label={data[key].label}
                id={`editorial-tab-${key}`}
                aria-controls={`editorial-panel-${key}`}
              />
            ))}
          </Tabs>
        </Box>
        <Box hidden id={`editorial-panel-${active === 'insights' ? 'news' : 'insights'}`} role="tabpanel" aria-labelledby={`editorial-tab-${active === 'insights' ? 'news' : 'insights'}`} />
        <Box
          key={active}
          id={`editorial-panel-${active}`}
          role="tabpanel"
          aria-labelledby={`editorial-tab-${active}`}
          sx={{
            '@keyframes editorial-reveal': { from: { opacity: 0 }, to: { opacity: 1 } },
            '@media (prefers-reduced-motion: no-preference)': {
              animation: 'editorial-reveal 180ms ease-out',
            },
          }}
        >
          <Box
            ref={track}
            component="ul"
            onScroll={update}
            tabIndex={0}
            aria-label={`${content.label} articles`}
            sx={{
              '--editorial-card-width': { xs: 'calc(100vw - 64px)', sm: '499px' },
              display: 'flex',
              gap: '20px',
              m: 0,
              px: { xs: 3, sm: 6, md: '60px' },
              pb: 1,
              minHeight: { xs: 420, sm: 445 },
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollPaddingInlineStart: { xs: '24px', sm: '48px', md: '60px' },
              overscrollBehaviorX: 'contain',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              '&:focus-visible': { outline: '2px solid white', outlineOffset: '-2px' },
            }}
          >
            {content.items.map((item, index) => (
              <EditorialCard key={`${index}-${item.title}`} item={item} />
            ))}
            {!content.items.length && (
              <Box
                component="li"
                sx={{
                  listStyle: 'none',
                  alignSelf: 'center',
                  width: '100%',
                  textAlign: 'center',
                  color: '#C9C9D1',
                }}
              >
                {content.emptyMessage || 'No articles yet.'}
              </Box>
            )}
          </Box>
          <Box
            sx={{
              position: 'relative',
              px: { xs: 3, sm: 6, md: '60px' },
              mt: '32px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: { xs: 'space-between', sm: 'center' },
              alignItems: 'center',
              gap: 2,
              minHeight: 48,
            }}
          >
            {content.cta && (
              <Button
                component={content.cta.enabled && content.cta.href ? 'a' : 'button'}
                href={content.cta.enabled ? content.cta.href : undefined}
                disabled={!content.cta.enabled || !content.cta.href}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,.13)',
                  border: '1px solid rgba(255,255,255,.15)',
                  fontSize: 16,
                  fontWeight: 400,
                  minHeight: 48,
                  px: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,.2)' },
                  '&.Mui-disabled': {
                    color: 'rgba(255,255,255,.7)',
                    bgcolor: 'rgba(255,255,255,.13)',
                  },
                }}
              >
                {content.cta.label}
              </Button>
            )}
            <Box
              sx={{
                display: 'flex',
                gap: '10px',
                position: { sm: 'absolute' },
                right: { sm: 48, md: 60 },
              }}
            >
              <IconButton
                aria-label={`Previous ${content.label} articles`}
                disabled={!position.previous}
                onClick={() => move(-1)}
                sx={{
                  width: 80,
                  height: 44,
                  borderRadius: '99px 0 0 99px',
                  bgcolor: '#F9FAFB',
                  color: '#111129',
                  '&:hover': { bgcolor: '#E3E4E8' },
                  '&.Mui-disabled': { bgcolor: '#F9FAFB', color: '#91939A' },
                }}
              >
                <Arrow previous />
              </IconButton>
              <IconButton
                aria-label={`Next ${content.label} articles`}
                disabled={!position.next}
                onClick={() => move(1)}
                sx={{
                  width: 80,
                  height: 44,
                  borderRadius: '0 99px 99px 0',
                  bgcolor: '#F9FAFB',
                  color: '#111129',
                  '&:hover': { bgcolor: '#E3E4E8' },
                  '&.Mui-disabled': { bgcolor: '#F9FAFB', color: '#91939A' },
                }}
              >
                <Arrow />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

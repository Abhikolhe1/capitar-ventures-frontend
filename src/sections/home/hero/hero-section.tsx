import type { HeroContent } from 'src/types/homepage';

import { Box, Stack, Typography, useMediaQuery } from '@mui/material';

import fallback from 'src/content/homepage.json';
import { websiteTokens } from 'src/theme/website-theme';

import { ContentButton } from 'src/components/website/content-button';

import { HeroBackgroundVideo } from './hero-background-video';
import { TrustedClientsMarquee } from './trusted-clients-marquee';

export function HeroSection({ data }: { data: HeroContent }) {
  const mobile = useMediaQuery('(max-width:599px)');
  const heading = mobile ? data.mobileHeading || fallback.hero.mobileHeading : data.heading;
  const emphasis = mobile ? data.mobileEmphasisText || fallback.hero.mobileEmphasisText : data.emphasisText;
  const video = mobile ? data.backgroundVideoMobile || fallback.hero.backgroundVideoMobile : data.backgroundVideo;
  const poster = mobile ? data.backgroundImageMobile || fallback.hero.backgroundImageMobile : data.backgroundImage;
  if (!data.enabled) return null;
  const emphasisIndex = emphasis ? heading.indexOf(emphasis) : -1;
  return (
    <Box
      component="section"
      aria-labelledby="hero-heading"
      sx={{
        position: 'relative',
        bgcolor: websiteTokens.navy,
        overflow: 'hidden',
        minHeight: { xs: 620, sm: 850, md: '100svh' },
        '@media (min-width: 900px)': {
          minHeight: 0,
          height: '100svh',
          display: 'flex',
          flexDirection: 'column',
        },
        width: '100%',
      }}
    >
      <Box
        data-entrance="background"
        aria-hidden="true"
        sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...(fallback.sectionTransitions.enabled && { maskImage: 'linear-gradient(to bottom, #000 calc(100% - 120px), transparent 100%)' }) }}
      >
        {data.backgroundImage && (
          <Box component="picture">
            <Box
              component="source"
              media="(max-width: 599px)"
              srcSet={data.backgroundImageMobile?.url || fallback.hero.backgroundImageMobile.url}
            />
            <Box
              component="img"
              src={data.backgroundImage.url}
              alt=""
              fetchPriority="high"
              width={1280}
              height={720}
              sx={{
                position: 'absolute',
                width: { xs: '100%', sm: '107%' },
                maxWidth: 'none',
                height: { xs: '100%', sm: '104%' },
                left: { xs: 0, sm: '-6.84%' },
                top: 0,
                objectFit: 'cover',
                objectPosition: { xs: 'right center', sm: '62% center', lg: 'center' },
              }}
            />
          </Box>
        )}
        {video && (
          <HeroBackgroundVideo
            fallbackSrc={mobile ? fallback.hero.backgroundVideoMobile.url : fallback.hero.backgroundVideo.url}
            poster={poster?.url}
            src={video.url}
            sx={{
              position: 'absolute',
              width: { xs: '100%', sm: '107%' },
              maxWidth: 'none',
              height: { xs: '100%', sm: '104%' },
              left: { xs: 0, sm: '-6.84%' },
              top: 0,
              objectFit: 'cover',
              objectPosition: { xs: 'right center', sm: '62% center', lg: 'center' },
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: { xs: 'linear-gradient(180deg,#111129 0%,rgba(17,17,41,.4) 25%,rgba(17,17,41,.12) 100%)', sm: `linear-gradient(90deg, ${websiteTokens.navy}, rgba(17,17,41,0))` },
          }}
        />
      </Box>
      <Stack
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: websiteTokens.maxWidth,
          mx: 'auto',
          px: { xs: '20px', sm: 6, lg: '100px' },
          pt: { xs: '108px', sm: '190px', md: 'clamp(112px, 26svh, 208px)' },
          pb: { xs: '180px', sm: 0, md: 4 },
          alignItems: 'flex-start',
          gap: { xs: '28px', sm: 3 },
          '& > [data-entrance=content]:first-child': { display: { xs: 'none', sm: 'flex' } },
          '& > p': { display: { xs: 'none', sm: 'block' } },
          '& > div:last-child button': { fontSize: { xs: 14, sm: 18 }, minHeight: { xs: 44, sm: 50 }, fontWeight: { xs: 400, sm: 600 } },
          '& > div:last-child button > span': { width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } },
          '@media (min-width: 900px) and (max-height: 700px)': {
            pt: 'clamp(100px, 20svh, 136px)',
            gap: 2,
          },
          '@media (min-width: 900px) and (max-height: 560px)': { pt: '96px', gap: 1.5, pb: 2 },
        }}
      >
        {/* Announcement banner temporarily disabled.
        data.announcementText && (
          <Stack
            data-entrance="content"
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              bgcolor: websiteTokens.panel,
              borderRadius: 10,
              pl: 1.2,
              pr: 0.4,
              py: 0.4,
              maxWidth: '100%',
            }}
          >
            <Typography sx={{ fontSize: { xs: 11, sm: 14 }, lineHeight: 1.5 }}>
              {data.announcementText}
            </Typography>
            {data.announcementLink && (
              <Box
                component={data.announcementLink.enabled ? 'a' : 'span'}
                href={data.announcementLink.enabled ? data.announcementLink.href : undefined}
                aria-disabled={!data.announcementLink.enabled}
                sx={{
                  borderRadius: 10,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  px: 2,
                  py: 0.5,
                  fontSize: { xs: 10, sm: 12 },
                  color: 'text.primary',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {data.announcementLink.label}
              </Box>
            )}
          </Stack>
        )
        */}
        <Typography
          data-entrance="heading"
          id="hero-heading"
          component="h1"
          variant="h1"
          sx={{
            width: { xs: '100%', sm: 680, lg: 760 },
            maxWidth: '100%',
            fontSize: { xs: 36, sm: 64, lg: 72 },
            '@media (min-width: 900px) and (max-height: 700px)': {
              fontSize: 'clamp(40px, 9svh, 60px)',
            },
            '@media (min-width: 900px) and (max-height: 560px)': {
              fontSize: 'clamp(32px, 8svh, 44px)',
            },
            whiteSpace: 'pre-line',
            lineHeight: { xs: 1.1, sm: 1 },
            letterSpacing: { xs: '-0.03em', sm: undefined },
            color: 'text.secondary',
          }}
        >
          {emphasisIndex >= 0 ? (
            <>
              {heading.slice(0, emphasisIndex)}
              <Box component="strong" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {heading.slice(emphasisIndex)}
              </Box>
            </>
          ) : (
            heading
          )}
        </Typography>
        {data.description && (
          <Typography data-entrance="content" sx={{ maxWidth: 560 }}>
            {data.description}
          </Typography>
        )}
        <Box data-entrance="content">
          <ContentButton data={data.primaryCta} arrow />
        </Box>
      </Stack>
      {!!data.trustedClients.length && (
        <Box
          data-entrance="clients"
          sx={{
            position: 'relative',
            bottom: 0,
            '@media(max-width:599px)': { position: 'absolute', borderTop: '1px solid rgba(255,255,255,.18)', borderTopRightRadius: '70px 100%', background: 'linear-gradient(120deg,#1d2039,#171b35)', clipPath: 'polygon(0 0,85% 0,100% 100%,0 100%)' },
            mt: { xs: 0, sm: 10, md: 'auto' },
            width: { xs: '100%', lg: 'calc(965px + max(0px, (100vw - 1441px) / 2))' },
            minHeight: { xs: 104, sm: 167, md: 'clamp(124px, 20.875svh, 167px)' },
            pt: { xs: 3, sm: 4.5, md: 'clamp(20px, 4.5svh, 36px)' },
            pb: { xs: 3, sm: 5, md: 3 },
            flexShrink: 0,
            pl: { xs: '20px', sm: 6, lg: 'calc(100px + max(0px, (100vw - 1441px) / 2))' },
            pr: { xs: 3, lg: '115px' },
            bgcolor: { xs: websiteTokens.panel, lg: 'transparent' },
            '&::before': {
              content: '""',
              display: { xs: 'none', lg: 'block' },
              position: 'absolute',
              zIndex: 0,
              top: 0,
              left: '-70.41px',
              width: 'calc(100% + 70.41px)',
              height: '195.859px',
              backgroundImage: 'url(/assets/capitar/client-panel.svg)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100% 195.859px',
            },
            '& > *': { position: 'relative' },
          }}
        >
          {data.trustedClientsTitle && (
            <Typography sx={{ fontSize: { xs: 14, sm: 16 }, mb: '15px' }}>{mobile ? data.mobileTrustedClientsTitle || fallback.hero.mobileTrustedClientsTitle : data.trustedClientsTitle}</Typography>
          )}
          <TrustedClientsMarquee clients={data.trustedClients} />
        </Box>
      )}
    </Box>
  );
}

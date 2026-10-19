import type { HeroContent } from 'src/types/homepage';

import { Box, Stack, Typography } from '@mui/material';

import fallback from 'src/content/homepage.json';
import { websiteTokens } from 'src/theme/website-theme';

import { ContentButton } from 'src/components/website/content-button';

import { HeroBackgroundVideo } from './hero-background-video';

export function HeroSection({ data }: { data: HeroContent }) {
  if (!data.enabled) return null;
  const emphasisIndex = data.emphasisText ? data.heading.indexOf(data.emphasisText) : -1;
  return (
    <Box
      component="section"
      aria-labelledby="hero-heading"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: 820, sm: 850, md: '100svh' },
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
        sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {data.backgroundImage && (
          <Box component="picture">
            <Box
              component="source"
              media="(max-width: 599px)"
              srcSet={data.backgroundImageMobile?.url || data.backgroundImage.url}
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
                width: '107%',
                maxWidth: 'none',
                height: '104%',
                left: '-6.84%',
                top: 0,
                objectFit: 'cover',
                objectPosition: { xs: '62% center', lg: 'center' },
              }}
            />
          </Box>
        )}
        {data.backgroundVideo && (
          <HeroBackgroundVideo
            fallbackSrc={fallback.hero.backgroundVideo.url}
            poster={data.backgroundImage?.url}
            src={data.backgroundVideo.url}
            sx={{
              position: 'absolute',
              width: '107%',
              maxWidth: 'none',
              height: '104%',
              left: '-6.84%',
              top: 0,
              objectFit: 'cover',
              objectPosition: { xs: '62% center', lg: 'center' },
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, ${websiteTokens.navy}, rgba(17,17,41,0))`,
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
          px: websiteTokens.gutter,
          pt: { xs: '174px', sm: '190px', md: 'clamp(112px, 26svh, 208px)' },
          pb: { md: 4 },
          alignItems: 'flex-start',
          gap: 3,
          '@media (min-width: 900px) and (max-height: 700px)': {
            pt: 'clamp(100px, 20svh, 136px)',
            gap: 2,
          },
          '@media (min-width: 900px) and (max-height: 560px)': { pt: '96px', gap: 1.5, pb: 2 },
        }}
      >
        {data.announcementText && (
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
        )}
        <Typography
          data-entrance="heading"
          id="hero-heading"
          component="h1"
          variant="h1"
          sx={{
            width: { xs: '100%', sm: 556 },
            maxWidth: '100%',
            fontSize: { xs: 42, sm: 64, lg: 72 },
            '@media (min-width: 900px) and (max-height: 700px)': {
              fontSize: 'clamp(40px, 9svh, 60px)',
            },
            '@media (min-width: 900px) and (max-height: 560px)': {
              fontSize: 'clamp(32px, 8svh, 44px)',
            },
            whiteSpace: 'pre-line',
            color: 'text.secondary',
          }}
        >
          {emphasisIndex >= 0 ? (
            <>
              {data.heading.slice(0, emphasisIndex)}
              <Box component="strong" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {data.heading.slice(emphasisIndex)}
              </Box>
            </>
          ) : (
            data.heading
          )}
        </Typography>
        {data.description && (
          <Typography data-entrance="content" sx={{ maxWidth: 480 }}>
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
            mt: { xs: 10, md: 'auto' },
            width: { xs: '100%', lg: 'calc(965px + max(0px, (100vw - 1441px) / 2))' },
            minHeight: { xs: 167, md: 'clamp(124px, 20.875svh, 167px)' },
            pt: { xs: 4.5, md: 'clamp(20px, 4.5svh, 36px)' },
            pb: { xs: 5, md: 3 },
            flexShrink: 0,
            pl: { ...websiteTokens.gutter, lg: 'calc(100px + max(0px, (100vw - 1441px) / 2))' },
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
            <Typography sx={{ fontSize: 16, mb: '15px' }}>{data.trustedClientsTitle}</Typography>
          )}
          <Stack
            component="ul"
            direction="row"
            alignItems="center"
            sx={{
              flexWrap: { xs: 'wrap', lg: 'nowrap' },
              gap: { xs: 2.5, lg: '49px' },
              p: 0,
              m: 0,
              listStyle: 'none',
            }}
          >
            {data.trustedClients.map((client, index) => (
              <Box
                component="li"
                key={`${client.name}-${index}`}
                sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
              >
                <Box
                  component="img"
                  src={client.logo.url}
                  alt={client.name}
                  width={client.width}
                  height={client.height || 40}
                  sx={{
                    display: 'block',
                    width: client.width,
                    height: client.height || 40,
                    objectFit: 'contain',
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

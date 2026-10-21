import type { Media, CapitalBenefitContent } from 'src/types/homepage';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { websiteTokens } from 'src/theme/website-theme';

function BenefitImage({ media, icon = false }: { media?: Media; icon?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  if (!media || failedUrl === media.url) return null;
  return (
    <Box
      component="img"
      src={media.url}
      alt={icon ? '' : media.alternativeText || ''}
      onError={() => setFailedUrl(media.url)}
      loading="lazy"
      decoding="async"
      width={icon ? 42 : media.width}
      height={icon ? 42 : media.height}
      sx={{
        display: 'block',
        width: icon ? 42 : '100%',
        height: icon ? 42 : 'auto',
        objectFit: 'contain',
      }}
    />
  );
}

export function CapitalBenefitCard({ data }: { data: CapitalBenefitContent }) {
  const wide = data.layout === 'wide';
  const tall = data.layout === 'tall';
  return (
    <Box
      component="article"
      data-capital-card
      data-layout={data.layout}
      sx={{
        position: 'relative',
        minWidth: 0,
        bgcolor: websiteTokens.white,
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gridColumn: {
          xs: 'auto',
          sm: wide || tall ? 'span 2' : 'auto',
          lg: wide ? 'span 2' : 'auto',
        },
        gridRow: { lg: tall ? 'span 2' : 'auto' },
        minHeight: { xs: tall ? 480 : wide ? 360 : 280, sm: tall ? 360 : 300, lg: 272 },
        p: { xs: '24px', lg: wide ? '19px 27px 32px' : tall ? '17px 32px 36px' : '24px 23px' },
        ...(!wide && !tall ? { pb: '158px' } : {}),
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: wide || tall ? 'flex-start' : 'flex-end',
          ...(wide || tall ? {} : { position: 'absolute', top: 17, right: 18 }),
        }}
      >
        <BenefitImage media={data.icon} icon />
      </Box>
      <Box
        data-capital-copy
        sx={{
          position: 'relative',
          zIndex: 1,
          ...(wide ? { mt: { xs: '24px', sm: 'auto' }, width: { sm: '40%', lg: '33%' } } : {}),
          ...(tall ? { mt: 'auto', pt: { xs: '310px', sm: '190px', lg: '360px' } } : {}),
          ...(!wide && !tall ? { pr: '42px' } : {}),
        }}
      >
        <Typography
          component="h3"
          sx={{
            color: websiteTokens.capital.ink,
            fontWeight: 400,
            fontSize: { xs: 27, sm: 26, lg: 'clamp(24px, 2.0834vw, 30px)' },
            lineHeight: 1,
            letterSpacing: 0,
            mb: '10px',
            ...(tall ? { mb: '20px' } : {}),
          }}
        >
          {data.title}
        </Typography>
        {data.description && (
          <Typography
            sx={{
              fontSize: 16,
              lineHeight: 1.4,
              letterSpacing: 0,
              whiteSpace: 'pre-line',
              color: websiteTokens.capital.mutedInk,
              ...(!wide && !tall ? { mr: '-42px', maxWidth: 300 } : {}),
              ...(wide ? { maxWidth: 240 } : {}),
              ...(tall ? { maxWidth: 325 } : {}),
            }}
          >
            {data.description}
          </Typography>
        )}
      </Box>
      {data.artwork && (
        <Box
          data-capital-art
          sx={{
            ...(wide
              ? {
                  position: { xs: 'relative', sm: 'absolute' },
                  mt: { xs: '24px', sm: 0 },
                  width: { xs: '100%', sm: '51%', lg: '55%' },
                  right: { sm: '6%' },
                  top: { sm: '50%' },
                  transform: { sm: 'translateY(-50%)' },
                }
              : tall
                ? {
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100%',
                    maxWidth: { xs: 426, sm: 370, lg: 'none' },
                  }
                : {
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: `${data.artworkWidth || 94}%`,
                  }),
          }}
        >
          <BenefitImage media={data.artwork} />
        </Box>
      )}
    </Box>
  );
}

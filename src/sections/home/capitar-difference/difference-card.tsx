import type { Media, DifferenceCardContent } from 'src/types/homepage';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { websiteTokens } from 'src/theme/website-theme';

function Illustration({ media }: { media?: Media }) {
  const [failed, setFailed] = useState<string>();
  if (!media || failed === media.url) return null;
  return (
    <Box
      component="img"
      data-difference-image
      src={media.url}
      alt={media.alternativeText || ''}
      width={media.width}
      height={media.height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(media.url)}
      sx={{
        display: 'block',
        width: '122.61px',
        height: 108,
        objectFit: 'contain',
        maxWidth: '100%',
      }}
    />
  );
}

export function DifferenceCard({
  data,
  background,
}: {
  data: DifferenceCardContent;
  background?: Media;
}) {
  return (
    <Box
      component="article"
      role="listitem"
      data-difference-card
      sx={{
        position: 'relative',
        isolation: 'isolate',
        color: websiteTokens.white,
        bgcolor: websiteTokens.difference.card,
        border: websiteTokens.difference.border,
        borderRadius: websiteTokens.difference.radius,
        boxShadow: websiteTokens.difference.shadow,
        minHeight: 440,
        p: '32.59px 28.99px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '52px',
      }}
    >
      {background && (
        <Box
          component="img"
          src={background.url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '19px',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      )}
      <Box sx={{ minHeight: 108 }}>
        <Illustration media={data.image} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '13.1px' }}>
        {data.number && (
          <Typography
            data-difference-number
            sx={{ fontSize: 24, fontWeight: 600, lineHeight: '17px', letterSpacing: '-0.02em' }}
          >
            {data.number}
          </Typography>
        )}
        <Typography
          component="h3"
          data-difference-title
          sx={{
            fontSize: { xs: 28, md: 32, lg: 'clamp(28px,2.2223vw,32px)' },
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            whiteSpace: 'pre-line',
          }}
        >
          {data.title}
        </Typography>
        {data.description && (
          <Typography
            data-difference-description
            sx={{
              fontSize: { xs: 18, lg: 'clamp(16px,1.25vw,18px)' },
              fontWeight: 400,
              lineHeight: 1.4,
              letterSpacing: 0,
              maxWidth: '295.51px',
            }}
          >
            {data.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

import type { CapitarDifferenceContent } from 'src/types/homepage';

import { useRef } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { websiteTokens } from 'src/theme/website-theme';

import { SectionBadge } from 'src/components/website/section-badge';
import { ContentButton } from 'src/components/website/content-button';

import { DifferenceCard } from './difference-card';
import { useDifferenceAnimation } from './use-difference-animation';

export function CapitarDifferenceSection({ data }: { data?: CapitarDifferenceContent }) {
  const scope = useRef<HTMLElement>(null);
  useDifferenceAnimation(scope, JSON.stringify(data));
  if (!data?.enabled) return null;
  const split = Math.ceil(data.items.length / 2);
  return (
    <Box
      component="section"
      id="capitar-difference"
      ref={scope}
      aria-labelledby="difference-heading"
      sx={{
        position: 'relative',
        bgcolor: websiteTokens.difference.background,
        color: websiteTokens.difference.ink,
        // Extend the sticky boundary behind the following section without adding scroll space.
        pb: { xs: '48px', lg: '111.65px' },
        '&::after': { content: { lg: '""' }, display: { lg: 'block' }, height: { lg: '100svh' } },
        mb: { lg: '-100svh' },
      }}
    >
      <Box
        data-difference-intro
        sx={{
          position: { xs: 'relative', lg: 'sticky' },
          top: 0,
          minHeight: { lg: 538 },
          pt: { xs: '48px', sm: '72px', lg: '165.5px' },
          pb: { xs: '24px', lg: 0 },
          textAlign: 'center',
          maxWidth: 788,
          mx: 'auto',
          px: { xs: '20px', lg: 0 },
          pointerEvents: { lg: 'none' },
          zIndex: 1,
        }}
      >
        <SectionBadge compactMobile text={data.sectionLabel} minWidth={221} fontWeight={400} />
        <Typography
          component="h2"
          id="difference-heading"
          data-difference-heading
          sx={{
            fontSize: { xs: 28, sm: 44, lg: 'clamp(44px,3.4723vw,50px)' },
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: 0,
            whiteSpace: 'pre-line',
            mt: { xs: '24px', sm: '30px' },
          }}
        >
          {data.heading}
        </Typography>
        {data.description && (
          <Typography
            data-difference-intro-description
            sx={{
              fontSize: { xs: 14, sm: 20 },
              lineHeight: 1.4,
              fontWeight: 400,
              letterSpacing: 0,
              color: websiteTokens.difference.mutedInk,
              mt: { xs: '16px', sm: '34px' },
              whiteSpace: 'pre-line',
              maxWidth: 420,
              mx: 'auto',
            }}
          >
            {data.description.replace(/-\n/g, '-\u200b')}
          </Typography>
        )}
        {data.cta && (
          <Box sx={{ mt: { xs: '24px', sm: '32px' }, pointerEvents: 'auto' }}>
            <ContentButton data={data.cta} arrow appearance="difference" />
          </Box>
        )}
      </Box>
      {data.items.length > 0 && (
        <Box
          role="list"
          aria-label={data.sectionLabel}
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0,1fr)',
              sm: 'repeat(2,minmax(0,1fr))',
              lg: 'repeat(2,minmax(0,366px))',
            },
            justifyContent: 'space-between',
            alignItems: 'start',
            maxWidth: '1301.46px',
            width: { xs: 'calc(100% - 40px)', sm: 'calc(100% - 96px)', lg: 'calc(100% - 140px)' },
            mx: 'auto',
            mt: { lg: '-68.01px' },
          columnGap: { xs: '24px', lg: '43.75%' },
            rowGap: { xs: '12px', sm: '24px' },
          }}
        >
          {[data.items.slice(0, split), data.items.slice(split)].map((items, column) => (
            <Box
              key={column}
              role="presentation"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: '12px', sm: '24px', lg: column === 0 ? '83.63px' : '67.31px' },
                pt: { lg: column === 0 ? 0 : '142.7px' },
              }}
            >
              {items.map((item, index) => (
                <DifferenceCard
                  key={`${index}-${item.title}`}
                  data={item}
                  background={data.cardBackground}
                />
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

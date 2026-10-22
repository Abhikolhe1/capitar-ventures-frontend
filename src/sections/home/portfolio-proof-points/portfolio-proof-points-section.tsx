import type { PortfolioProofPointsContent } from 'src/types/homepage';

import { useRef } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { websiteTokens } from 'src/theme/website-theme';

import { SectionBadge } from 'src/components/website/section-badge';

import { ProofMetric } from './proof-metric';
import { useProofTextFill } from './use-proof-text-fill';

export function PortfolioProofPointsSection({ data }: { data?: PortfolioProofPointsContent }) {
  const scope = useRef<HTMLElement>(null);
  useProofTextFill(scope, JSON.stringify({ enabled: data?.enabled, heading: data?.heading, mutedText: data?.mutedText }));
  if (!data?.enabled) return null;
  const mutedIndex = data.mutedText ? data.heading.indexOf(data.mutedText) : -1;
  return (
    <Box component="section" ref={scope} id="portfolio-proof-points" aria-labelledby="proof-heading" sx={{
      position: 'relative', overflow: 'hidden', bgcolor: websiteTokens.proof.background,
      color: websiteTokens.proof.ink, minHeight: { lg: 685 },
    }}>
      <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, display: { xs: 'none', sm: 'block' }, maxWidth: 1440, mx: 'auto', pointerEvents: 'none' }}>
        {data.backgroundLeft && <Box component="img" src={data.backgroundLeft.url} alt="" width={384} height={350} sx={{ position: 'absolute', top: 0, left: { xs: -180, md: 0 } }} />}
        {data.backgroundRight && <Box component="img" src={data.backgroundRight.url} alt="" width={424} height={350} sx={{ position: 'absolute', top: 0, right: { xs: -180, md: 9 } }} />}
      </Box>
      <Box sx={{ position: 'relative', maxWidth: 1440, mx: 'auto', px: { xs: '20px', sm: 6, lg: '70px' }, pt: { xs: 4, md: '84px' }, pb: { xs: 6, md: '106px' } }}>
        <Stack alignItems="center" spacing={0} sx={{ gap: { xs: '16px', md: '40px' } }}>
          <SectionBadge compactMobile text={data.sectionLabel} />
          <Typography component="h2" id="proof-heading" sx={{
            maxWidth: 908, m: 0, fontWeight: 400, fontSize: { xs: 28, sm: 42, md: 50 },
            lineHeight: 1, letterSpacing: 0, textAlign: 'center',
          }}>
            {Array.from(data.heading.matchAll(/\S+|\s+/g), match => {
              const text = match[0], index = match.index || 0;
              if (/^\s+$/.test(text)) return text;
              const muted = mutedIndex >= 0 && index >= mutedIndex && index < mutedIndex + data.mutedText!.length;
              const color = muted ? websiteTokens.proof.mutedInk : websiteTokens.proof.ink;
              return <Box key={index} component="span" data-proof-word data-proof-color={color} sx={{ color, display: 'inline-block' }}>{text}</Box>;
            })}
          </Typography>
        </Stack>
        {!!data.metrics.length && <Box component="dl" sx={{
          display: 'grid', gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', sm: 'repeat(2,minmax(0,1fr))', md: data.metrics.length === 4 ? '182fr 334fr 260fr 266fr' : `repeat(${data.metrics.length},minmax(0,1fr))` },
          m: 0, mt: { xs: 6, md: '86px' }, columnGap: { sm: 6, md: 'clamp(32px,5.97223vw,86px)' }, rowGap: { xs: '56px', sm: 6 },
          position: 'relative',
          '@media(max-width:599px)': { '&& > [data-proof-metric]::before': { display: 'none' }, '&::after': { content: '""', position: 'absolute', left: 0, top: '50%', width: '100%', height: '1px', background: '#ECEDEF', pointerEvents: 'none' } },
          '& > [data-proof-metric]:not(:first-of-type)::before': {
            content: '""', position: 'absolute', bgcolor: websiteTokens.proof.divider,
            top: { xs: -24, md: 6 }, left: { xs: '15%', sm: '-24px', md: 'calc(clamp(32px,5.97223vw,86px) / -2)' },
            width: { xs: '70%', sm: '1.5px' }, height: { xs: '1.5px', sm: '100%', md: 128 },
          },
          '@media (min-width:600px) and (max-width:899px)': { '& > [data-proof-metric]:nth-of-type(3)::before': { display: 'none' } },
        }}>
          {data.metrics.map((metric, index) => <ProofMetric key={index} metric={metric} />)}
        </Box>}
      </Box>
    </Box>
  );
}

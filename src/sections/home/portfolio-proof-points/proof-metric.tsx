import type { ProofMetricContent } from 'src/types/homepage';

import { Box, Typography } from '@mui/material';

import { websiteTokens } from 'src/theme/website-theme';

export function ProofMetric({ metric }: { metric: ProofMetricContent }) {
  const spoken = `${metric.prefix || ''}${metric.value}${metric.valueSuffix || ''} ${metric.suffix || ''}`.trim();
  return (
    <Box data-proof-metric sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, position: 'relative', gap: '12px' }}>
      <Typography component="dt" sx={{ order: 2, fontSize: { xs: 13, sm: 18, md: 20 }, fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.02em', textAlign: 'center', color: websiteTokens.red }}>
        {metric.label}
      </Typography>
      <Typography component="dd" data-proof-value sx={{
        order: 1, m: 0, alignSelf: 'center', textAlign: 'center', fontSize: { xs: 'clamp(30px,9.16vw,36px)', sm: 72, md: 'clamp(64px, 6.94445vw, 100px)' },
        fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', whiteSpace: 'nowrap',
        backgroundImage: websiteTokens.proof.numberGradient, backgroundClip: 'text', color: 'transparent',
      }}>
        <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, p: 0, m: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', color: websiteTokens.proof.ink }}>{spoken}</Box>
        <Box component="span" aria-hidden="true">
          {metric.prefix}
          <Box component="span" sx={{ display: 'inline-grid' }}>
            <Box component="span" sx={{ gridArea: '1 / 1', visibility: 'hidden' }}>{metric.value}</Box>
            <Box component="span" data-proof-number data-value={metric.value} sx={{ gridArea: '1 / 1', textAlign: 'center' }}>{metric.value}</Box>
          </Box>
          {metric.valueSuffix}
          {metric.suffix && <Box component="span" sx={{ fontSize: '0.72em', fontWeight: 400 }}>{' '}{metric.suffix}</Box>}
        </Box>
      </Typography>
    </Box>
  );
}

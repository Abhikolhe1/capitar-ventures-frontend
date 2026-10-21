import type { CapitalEfficiencyContent } from 'src/types/homepage';

import { useRef } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { websiteTokens } from 'src/theme/website-theme';

import { SectionBadge } from 'src/components/website/section-badge';

import { CapitalBenefitCard } from './capital-benefit-card';
import { useCapitalAnimation } from './use-capital-animation';

export function CapitalEfficiencySection({ data }: { data?: CapitalEfficiencyContent }) {
  const scope = useRef<HTMLElement>(null);
  const signature = JSON.stringify(data);
  useCapitalAnimation(scope, signature);
  if (!data?.enabled) return null;
  return (
    <Box
      component="section"
      ref={scope}
      id="capital-efficiency"
      aria-labelledby="capital-heading"
      sx={{
        bgcolor: websiteTokens.capital.background,
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        py: { xs: '56px', sm: '64px', lg: '72px' },
        minHeight: { lg: 950 },
      }}
    >
      {data.backgroundImage && (
        <Box
          component="img"
          src={data.backgroundImage.url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
          sx={{
            position: 'absolute',
            zIndex: -1,
            inset: 0,
            width: '100%',
            height: { xs: 640, lg: 950 },
            objectFit: 'cover',
            objectPosition: 'center top',
            pointerEvents: 'none',
          }}
        />
      )}
      <Box
        sx={{
          maxWidth: 1317,
          mx: 'auto',
          width: { xs: 'calc(100% - 48px)', sm: 'calc(100% - 96px)', lg: 'calc(100% - 123px)' },
        }}
      >
        <Box sx={{ textAlign: 'center', mx: 'auto', maxWidth: 620 }}>
          <SectionBadge
            text={data.sectionLabel}
            color={websiteTokens.white}
            borderColor={websiteTokens.capital.badgeBorder}
            minWidth={186}
            fontWeight={400}
          />
          <Typography
            id="capital-heading"
            component="h2"
            sx={{
              fontSize: { xs: 34, sm: 40, lg: 42 },
              lineHeight: 1.2,
              fontWeight: 400,
              letterSpacing: '-0.02em',
              whiteSpace: 'pre-line',
              mt: '21px',
              color: websiteTokens.white,
            }}
          >
            {data.heading}
          </Typography>
          {data.description && (
            <Typography
              sx={{ mt: '24px', fontSize: 16, lineHeight: '22px', color: 'rgba(255,255,255,0.8)' }}
            >
              {data.description}
            </Typography>
          )}
        </Box>
        {data.benefits.length > 0 && (
          <Box
            data-capital-grid
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0,1fr)',
                sm: 'repeat(2,minmax(0,1fr))',
                lg: 'repeat(3,minmax(0,1fr))',
              },
              gridAutoFlow: 'row dense',
              gridAutoRows: { lg: 'minmax(272px,auto)' },
              gap: '20px',
              mt: { xs: '36px', lg: '44px' },
            }}
          >
            {data.benefits.map((benefit, index) => (
              <CapitalBenefitCard key={`${index}-${benefit.title}`} data={benefit} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

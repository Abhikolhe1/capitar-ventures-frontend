import type { ContentLink } from 'src/types/homepage';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { websiteTokens } from 'src/theme/website-theme';

export function ContentButton({ data, arrow = false, appearance = 'default' }: { data?: ContentLink; arrow?: boolean; appearance?: 'default' | 'difference' }) {
  if (!data) return null;
  const difference = appearance === 'difference';
  return (
    <Button
      component={data.enabled && data.href ? 'a' : 'button'}
      href={data.enabled ? data.href : undefined}
      disabled={!data.enabled || !data.href}
      variant="contained"
      color="secondary"
      sx={{
        gap: 1.5,
        fontSize: 18,
        fontWeight: 600,
        pl: 2.5,
        pr: arrow ? 0.5 : 3,
        py: 0.5,
        minHeight: 50,
        '&.Mui-disabled': { bgcolor: 'secondary.main', color: 'background.default', opacity: 1 },
        ...(difference ? {
          bgcolor: websiteTokens.difference.card, color: websiteTokens.white, gap: '8px', pl: '12px', pr: '5px', py: '3px',
          minHeight: 42, fontSize: 16, fontWeight: 400, border: '1px solid rgba(255,255,255,0.12)',
          '&:hover': { bgcolor: websiteTokens.capital.ink },
          '&.Mui-disabled': { bgcolor: websiteTokens.difference.card, color: websiteTokens.white, opacity: 1 },
          '&:hover img': { transform: 'translateX(2px)' },
        } : {}),
      }}
    >
      {data.label}
      {arrow && (
        <Box
          component="span"
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: difference ? 34 : 40,
            height: difference ? 34 : 40,
            borderRadius: '50%',
            bgcolor: difference ? websiteTokens.white : 'primary.main',
            color: 'text.primary',
          }}
        >
          <Box
            component="img"
            src={difference ? '/assets/capitar/difference-arrow.svg' : '/assets/capitar/arrow.svg'}
            alt=""
            sx={{ transform: difference ? undefined : 'rotate(180deg)', ...(difference ? { transition: 'transform 180ms ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } } : {}) }}
          />
        </Box>
      )}
    </Button>
  );
}

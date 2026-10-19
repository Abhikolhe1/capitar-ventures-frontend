import type { ContentLink } from 'src/types/homepage';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export function ContentButton({ data, arrow = false }: { data?: ContentLink; arrow?: boolean }) {
  if (!data) return null;
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
      }}
    >
      {data.label}
      {arrow && (
        <Box
          component="span"
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: 'text.primary',
          }}
        >
          <Box
            component="img"
            src="/assets/capitar/arrow.svg"
            alt=""
            sx={{ transform: 'rotate(180deg)' }}
          />
        </Box>
      )}
    </Button>
  );
}

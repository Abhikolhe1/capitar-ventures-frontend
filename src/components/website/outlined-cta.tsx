import type { ContentLink } from 'src/types/homepage';

import Button from '@mui/material/Button';

export function OutlinedCta({ data, dark = false }: { data: ContentLink; dark?: boolean }) {
  const enabled = data.enabled && !!data.href;
  const color = dark ? '#171717' : '#FFFFFF';

  return (
    <Button
      data-flow-cta
      data-cta-surface={dark ? 'light' : undefined}
      variant="outlined"
      component={enabled ? 'a' : 'button'}
      href={enabled ? data.href : undefined}
      disabled={!enabled}
      sx={{
        color,
        border: '1px solid currentColor',
        borderRadius: '999px',
        bgcolor: 'transparent',
        minWidth: { xs: 112, md: 145 },
        minHeight: { xs: 42, md: 46 },
        px: { xs: 2, md: 3 },
        fontSize: { xs: 14, md: 16 },
        '&:hover': { bgcolor: 'transparent', borderColor: 'currentColor' },
        '&.Mui-disabled': { color, borderColor: 'currentColor' },
      }}
    >
      {data.label}
    </Button>
  );
}

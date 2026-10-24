import type { ContentLink } from 'src/types/homepage';

import Button from '@mui/material/Button';

// Clear glass: no colored fill or saturation boost. The backdrop supplies the scenery.
export function LiquidGlassButton({ data }: { data: ContentLink }) {
  const enabled = data.enabled && !!data.href;

  return (
    <Button
      data-liquid-glass-button
      component={enabled ? 'a' : 'button'}
      href={enabled ? data.href : undefined}
      disabled={!enabled}
      sx={{
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        borderRadius: '999px',
        minWidth: { xs: 104, md: 137 },
        minHeight: { xs: 40, md: 44 },
        px: { xs: 2, md: 3 },
        fontSize: { xs: 14, md: 16 },
        fontWeight: 500,
        color: '#FFFFFF',
        textShadow: '0 1px 2px rgba(0,0,0,.22)',
        background: 'transparent',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,.18)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.65), inset 0 -1px 0 rgba(255,255,255,.25), 0 2px 6px rgba(0,0,0,.1)',
        transition: 'box-shadow 300ms ease, border-color 300ms ease, transform 300ms cubic-bezier(.22,1,.36,1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          padding: '1.5px',
          background: 'linear-gradient(125deg,rgba(255,255,255,.95),rgba(255,255,255,.04) 28%,rgba(255,255,255,.08) 65%,rgba(255,255,255,.8))',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: '2px',
          borderRadius: 'inherit',
          padding: '2px',
          background: 'linear-gradient(160deg,rgba(255,255,255,.22),transparent 30%,transparent 65%,rgba(255,255,255,.16))',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          pointerEvents: 'none',
        },
        '&:hover': {
          backgroundColor: 'transparent',
          borderColor: 'rgba(255,255,255,.5)',
          transform: 'translateY(-1px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(255,255,255,.4), 0 4px 10px rgba(0,0,0,.12)',
        },
        '&:active': { boxShadow: 'inset 0 1px 4px rgba(0,0,0,.12), inset 0 -1px 2px rgba(255,255,255,.3)' },
        '&.Mui-focusVisible': { outline: '2px solid #FFFFFF', outlineOffset: 4 },
        '&.Mui-disabled': { color: '#FFFFFF', opacity: 1 },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {data.label}
    </Button>
  );
}

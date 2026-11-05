import Button from '@mui/material/Button';

import { setSiteMotionReduced, useSiteReducedMotion } from 'src/hooks/use-site-motion';

export function MotionControl() {
  const reduced = useSiteReducedMotion();
  return (
    <Button
      aria-label={reduced ? 'Enable animations' : 'Reduce animations'}
      onClick={() => setSiteMotionReduced(!reduced)}
      sx={{
        position: 'fixed',
        bottom: 12,
        left: 12,
        zIndex: 1300,
        minHeight: 44,
        px: 2,
        borderRadius: 6,
        fontSize: 12,
        bgcolor: '#FFFFFF',
        color: '#111129',
        border: '1px solid #D8D8E2',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        '&:hover': { bgcolor: '#F2F2F8' },
        '&:focus-visible': { outline: '2px solid #CC2334', outlineOffset: 3 },
      }}
    >
      {reduced ? 'Enable animations' : 'Reduce animations'}
    </Button>
  );
}

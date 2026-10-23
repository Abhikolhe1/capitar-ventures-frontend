// Keep the backdrop treatment behind content so text and logos stay sharp.
export const glassSurface = {
  background: 'linear-gradient(125deg,rgba(255,255,255,.2),rgba(255,255,255,.07) 48%,rgba(255,255,255,.12))',
  backdropFilter: 'blur(18px) saturate(150%)',
  WebkitBackdropFilter: 'blur(18px) saturate(150%)',
  border: '1px solid rgba(255,255,255,.24)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.32), inset 0 -1px 0 rgba(255,255,255,.06), 0 8px 28px rgba(0,0,0,.12)',
  '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))': {
    background: 'linear-gradient(125deg,rgba(64,67,91,.95),rgba(30,33,58,.95))',
  },
} as const;

// Shared CTA treatment keeps header and editorial buttons visually consistent.
export const liquidGlassButton = {
  ...glassSurface,
  position: 'relative',
  isolation: 'isolate',
  color: '#FFFFFF',
  borderRadius: '999px',
  background: 'radial-gradient(ellipse at 15% 0%, rgba(255,255,255,.3), transparent 60%), linear-gradient(125deg,rgba(255,255,255,.16),rgba(255,255,255,.05) 50%,rgba(255,255,255,.18))',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))': {
    background: 'linear-gradient(125deg,rgba(64,67,91,.95),rgba(30,33,58,.95))',
  },
  border: '1px solid rgba(255,255,255,.3)',
  boxShadow: 'inset 0 2px 2px rgba(255,255,255,.35), inset 0 -2px 3px rgba(255,255,255,.12), 0 6px 20px rgba(0,0,0,.16)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-1px',
    borderRadius: 'inherit',
    padding: '1px',
    background: 'linear-gradient(135deg,rgba(255,255,255,.85),rgba(255,255,255,.08) 38%,rgba(255,255,255,.12) 60%,rgba(255,255,255,.6))',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    WebkitMaskComposite: 'xor',
    pointerEvents: 'none',
  },
  minWidth: { xs: 'clamp(104px,31.8vw,125px)', md: 137 },
  minHeight: { xs: 40, md: 44 }, fontSize: { xs: 14, md: 16 },
  px: { xs: 2, md: 3 },
  transition: 'background-color 250ms ease, box-shadow 250ms ease, border-color 250ms ease',
  '&:hover': {
    bgcolor: 'rgba(255,255,255,.12)',
    borderColor: 'rgba(255,255,255,.5)',
    boxShadow: 'inset 0 2px 3px rgba(255,255,255,.5), inset 0 -2px 4px rgba(255,255,255,.18), 0 8px 24px rgba(0,0,0,.2)',
  },
  '&.Mui-focusVisible': { outline: '2px solid rgba(255,255,255,.85)', outlineOffset: 4 },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  '&.Mui-disabled': { color: '#FFFFFF', opacity: 1 },
} as const;

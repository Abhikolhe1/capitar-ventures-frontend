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
  fontWeight: 500,
  textShadow: '0 1px 3px rgba(11,15,45,.28)',
  borderRadius: '999px',
  background: 'radial-gradient(ellipse at 12% 0%, rgba(255,255,255,.38), transparent 58%), radial-gradient(ellipse at 100% 100%, rgba(183,219,239,.18), transparent 65%), linear-gradient(120deg,rgba(224,213,249,.2),rgba(255,255,255,.09) 50%,rgba(209,234,235,.18))',
  backdropFilter: 'blur(24px) saturate(135%)',
  WebkitBackdropFilter: 'blur(24px) saturate(135%)',
  '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))': {
    background: 'linear-gradient(125deg,rgba(64,67,91,.95),rgba(30,33,58,.95))',
  },
  border: '1px solid rgba(239,237,255,.38)',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,.5), inset 0 -1px 3px rgba(212,221,249,.15), 0 4px 14px rgba(10,14,38,.12), 0 1px 4px rgba(204,204,244,.08)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-1px',
    borderRadius: 'inherit',
    padding: '1px',
    background: 'linear-gradient(135deg,rgba(255,255,255,.85),rgba(221,209,251,.22) 38%,rgba(207,231,243,.14) 60%,rgba(226,246,245,.7))',
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
    bgcolor: 'rgba(241,237,255,.07)',
    borderColor: 'rgba(246,243,255,.65)',
    boxShadow: 'inset 0 1px 3px rgba(255,255,255,.65), inset 0 -1px 4px rgba(213,231,249,.22), 0 6px 18px rgba(10,14,38,.15), 0 0 12px rgba(210,202,249,.08)',
  },
  '&.Mui-focusVisible': { outline: '2px solid rgba(255,255,255,.85)', outlineOffset: 4 },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  '&.Mui-disabled': { color: '#FFFFFF', opacity: 1 },
} as const;

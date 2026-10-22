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

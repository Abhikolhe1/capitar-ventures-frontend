import { createTheme } from '@mui/material/styles';

export const websiteTokens = {
  navy: '#111129',
  white: '#FFFFFF',
  red: '#CC2334',
  muted: '#C9C9D1',
  panel: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  gutter: { xs: 3, sm: 6, lg: '100px' },
  maxWidth: 1441,
  proof: {
    background: '#F8F9FA',
    ink: '#121212',
    mutedInk: 'rgba(18,18,18,0.6)',
    badgeInk: '#401E17',
    divider: 'rgba(231,191,195,0.3)',
    numberGradient: 'linear-gradient(180deg, #0B0F2D 15%, rgba(17,5,74,0) 158%)',
  },
};

export const websiteTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: websiteTokens.red },
    secondary: { main: websiteTokens.white },
    background: { default: websiteTokens.navy, paper: websiteTokens.navy },
    text: { primary: websiteTokens.white, secondary: websiteTokens.muted },
    divider: websiteTokens.border,
  },
  typography: {
    fontFamily: '"LT Superior", "DM Sans Variable", sans-serif',
    h1: { fontSize: 72, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em' },
    body1: { fontSize: 16, lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 400 },
  },
  shape: { borderRadius: 24 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          minHeight: 48,
          paddingInline: 24,
          whiteSpace: 'nowrap',
          '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 4 },
        },
      },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
  },
});

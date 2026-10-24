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
  serifFontFamily: '"LT Superior Serif", serif',
  difference: {
    background: '#F8F9FA', card: '#0B0F2D', ink: '#121212', mutedInk: 'rgba(18,18,18,0.8)',
    radius: '21.0929px', border: '2.10929px solid #F0F0F0',
    shadow: '0 5.09px 11.44px rgba(26,103,231,0.10), 0 20.34px 20.34px rgba(26,103,231,0.09), 0 47.04px 27.97px rgba(26,103,231,0.05), 0 82.64px 33.06px rgba(26,103,231,0.01)',
  },
  capital: {
    background: '#0B0F2D', ink: '#193969', mutedInk: 'rgba(25,57,105,0.8)',
    badgeBorder: 'rgba(217,217,217,0.7)',
  },
  proof: {
    background: '#F8F9FA',
    ink: '#121212',
    mutedInk: 'rgba(18,18,18,0.6)',
    badgeInk: '#401E17',
    divider: 'rgba(231,191,195,0.3)',
    numberGradient: 'linear-gradient(180deg, #11054A 0%, rgba(17,5,74,0) 90.39%), linear-gradient(180deg, #0B0F2D 15%, rgba(17,5,74,0) 158%)',
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

import 'src/theme/website-fonts.css';

import type { GlobalContent } from 'src/types/homepage';

import { useRef, type ReactNode } from 'react';

import { Box, CssBaseline, ThemeProvider } from '@mui/material';

import { websiteTheme } from 'src/theme/website-theme';
import { homepageViewportStyles } from 'src/theme/homepage-viewport';

import { Header } from 'src/components/website/header';
import { Footer } from 'src/components/website/footer';

import { useHeroAnimation } from 'src/sections/home/hero/use-hero-animation';

export function MainLayout({
  global,
  loading = false,
  children,
}: {
  global: GlobalContent;
  loading?: boolean;
  children: ReactNode;
}) {
  const scope = useRef<HTMLDivElement>(null);
  useHeroAnimation(scope, true);
  return (
    <ThemeProvider theme={websiteTheme}>
      <CssBaseline />
      <Box
        ref={scope}
        sx={{
          bgcolor: 'background.default',
          position: 'relative',
          minHeight: '100vh',
          '@media (prefers-reduced-motion: reduce)': {
            '& [data-entrance]': { visibility: 'visible' },
          },
        }}
      >
        <Box
          component="a"
          href="#main-content"
          sx={{
            position: 'absolute',
            top: -80,
            left: 16,
            zIndex: 10,
            p: 2,
            bgcolor: 'background.default',
            color: 'text.primary',
            '&:focus': { top: 8 },
          }}
        >
          Skip to content
        </Box>
        <Header data={global} />
        <Box component="main" id="main-content" aria-busy={loading} sx={homepageViewportStyles}>
          {children}
        </Box>
        <Footer data={global.footer} brandLogo={global.brandLogo} />
      </Box>
    </ThemeProvider>
  );
}

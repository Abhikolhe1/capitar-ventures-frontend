import type { ContentLink, GlobalContent } from 'src/types/homepage';

import { useState, useEffect } from 'react';

import { Box, Stack, Button, Drawer, IconButton, Typography } from '@mui/material';

import { websiteTokens } from 'src/theme/website-theme';

function NavItem({ item, close }: { item: ContentLink; close?: () => void }) {
  return (
    <Button
      component={item.enabled && item.href ? 'a' : 'button'}
      href={item.enabled ? item.href : undefined}
      disabled={!item.enabled || !item.href}
      onClick={close}
      sx={{
        color: 'text.primary',
        minHeight: 44,
        px: 0,
        fontSize: 16,
        gap: 0.5,
        '&.Mui-disabled': { color: 'text.primary', opacity: 1 },
      }}
    >
      {item.label}
      {item.showIndicator && <Box component="img" src="/assets/capitar/chevron.svg" alt="" />}
    </Button>
  );
}
export function Header({ data }: { data: GlobalContent }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    let previousY = window.scrollY;
    const onScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      const heroBottom = document.querySelector('main > section')?.getBoundingClientRect().bottom;
      setPastHero(heroBottom !== undefined && heroBottom < 89);
      if (!open && Math.abs(currentY - previousY) > 4) setHidden(currentY > previousY);
      previousY = currentY;
    };
    // Wheel intent also works while the viewport-sized hero has no scroll range.
    const onWheel = (event: WheelEvent) => {
      if (!open && Math.abs(event.deltaY) > 4) setHidden(event.deltaY > 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
    };
  }, [open]);
  return (
    <>
      <Box
        component="header"
        data-scroll-hidden={hidden}
        aria-hidden={hidden || undefined}
        inert={hidden || undefined}
        sx={{
          position: 'fixed',
          inset: '0 0 auto',
          zIndex: 3,
          bgcolor: pastHero ? websiteTokens.navy : 'transparent',
          borderBottom: 1,
          borderColor: 'divider',
          transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
          opacity: hidden ? 0 : 1,
          transition: 'transform 350ms ease, opacity 350ms ease',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        <Stack
          data-entrance="header"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            height: { xs: 76, md: 89 },
            maxWidth: websiteTokens.maxWidth,
            mx: 'auto',
            px: { xs: '20px', sm: 6, lg: '100px' },
          }}
        >
          <Box
            component="a"
            href="/"
            aria-label="Capitar Ventures home"
            sx={{ display: 'inline-flex', flexShrink: 0 }}
          >
            {data.brandLogo && (
              <Box
                component="img"
                src={data.brandLogo.url}
                alt="Capitar Ventures"
                width={121.5}
                height={32}
                sx={{ width: { xs: 112, md: 121.5 }, objectFit: 'contain' }}
              />
            )}
          </Box>
          <Stack
            component="nav"
            aria-label="Main navigation"
            direction="row"
            spacing={4}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {data.navigation.map((item, index) => (
              <NavItem key={`${item.label}-${index}`} item={item} />
            ))}
          </Stack>
          <Box sx={{ display: 'block', ml: { xs: 'auto', md: 0 }, mr: { xs: 1, md: 0 } }}>
            {data.headerCta && (
              <Button
                component={data.headerCta.enabled ? 'a' : 'button'}
                href={data.headerCta.enabled ? data.headerCta.href : undefined}
                disabled={!data.headerCta.enabled}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: 1,
                  borderColor: 'divider',
                  minWidth: { xs: 'clamp(104px,31.8vw,125px)', md: 137 },
                  minHeight: { xs: 40, md: 44 }, fontSize: { xs: 14, md: 16 },
                  px: { xs: 2, md: 3 },
                  '&.Mui-disabled': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                {data.headerCta.label}
              </Button>
            )}
          </Box>
          <IconButton
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(true)}
            sx={{ display: { md: 'none' }, color: 'text.primary' }}
          >
            <Box component="svg" width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth={1.5} />
            </Box>
          </IconButton>
        </Stack>
      </Box>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: { width: 'min(340px, 100vw)', p: 3, borderRadius: 0 } } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography>Navigation</Typography>
          <IconButton aria-label="Close navigation" onClick={() => setOpen(false)}>
            ×
          </IconButton>
        </Stack>
        <Stack
          component="nav"
          id="mobile-navigation"
          aria-label="Mobile navigation"
          alignItems="flex-start"
          spacing={2}
          sx={{ pt: 4 }}
        >
          {data.navigation.map((item, index) => (
            <NavItem key={`${item.label}-${index}`} item={item} close={() => setOpen(false)} />
          ))}
          {data.headerCta && <NavItem item={data.headerCta} close={() => setOpen(false)} />}
        </Stack>
      </Drawer>
    </>
  );
}

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useHomepage } from 'src/hooks/use-homepage';

import { MainLayout } from 'src/layouts/website/main-layout';

import { SectionBadge } from 'src/components/website/section-badge';
import { ContentButton } from 'src/components/website/content-button';

// Branded 404 inside the site header and footer, so visitors can carry on browsing.
const destinations = [
  { label: 'Venture Debt', href: '/venture-debt' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'About Us', href: '/about-us' },
  { label: 'News & Insights', href: '/blog' },
];

export default function Page() {
  const { content, loading } = useHomepage();
  return (
    <MainLayout global={content.global} loading={loading}>
      <title>Page not found | Capitar Ventures</title>
      <meta name="robots" content="noindex" />
      <Box
        component="section"
        id="not-found"
        aria-labelledby="not-found-title"
        sx={{
          bgcolor: '#111129',
          color: '#FFFFFF',
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          px: { xs: '20px', sm: 6, lg: '80px' },
          pt: { xs: '120px', md: '140px' },
          pb: { xs: 8, md: 10 },
        }}
      >
        <Box sx={{ maxWidth: 1281, width: '100%', mx: 'auto' }}>
          <SectionBadge text="ERROR 404" minWidth={0} color="#FFFFFF" borderColor="#FFFFFF66" lineHeight={1} />
          <Typography
            component="h1"
            id="not-found-title"
            sx={{ mt: 3, fontSize: { xs: 44, md: 72 }, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            This page <strong style={{ fontWeight: 600 }}>doesn&apos;t exist.</strong>
          </Typography>
          <Typography sx={{ mt: 3, maxWidth: 556, fontSize: { xs: 18, md: 20 }, lineHeight: 1.4, color: 'rgba(255,255,255,.8)' }}>
            The link may be out of date, or the page may have moved. Head back to the home page, or pick up from one of
            these sections.
          </Typography>
          <Box sx={{ mt: 5 }}>
            <ContentButton arrow data={{ label: 'Go to home', href: '/', enabled: true }} />
          </Box>
          <Box component="nav" aria-label="Main sections" sx={{ mt: 6 }}>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 } }}>
              {destinations.map((item) => (
                <li key={item.href}>
                  <Box
                    component="a"
                    href={item.href}
                    sx={{
                      color: '#FFFFFF',
                      fontSize: 18,
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                      textDecorationColor: 'rgba(255,255,255,.4)',
                      '&:hover': { color: '#FFFFFF', textDecorationColor: '#CC2334' },
                      '&:focus-visible': { outline: '2px solid #CC2334', outlineOffset: 4, borderRadius: '2px' },
                    }}
                  >
                    {item.label}
                  </Box>
                </li>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
}

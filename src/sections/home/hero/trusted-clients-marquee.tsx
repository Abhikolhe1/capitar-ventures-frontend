import type { HeroContent } from 'src/types/homepage';

import { Box } from '@mui/material';

export function TrustedClientsMarquee({ clients }: { clients: HeroContent['trustedClients'] }) {
  if (!clients.length) return null;

  // Repeat short lists to fill the viewport; both groups must be identical for a seamless reset.
  const logos = Array.from({ length: Math.ceil(4 / clients.length) }, () => clients).flat();

  return (
    <Box
      role="region"
      aria-label="Trusted clients"
      sx={{
        overflow: 'hidden',
        width: '100%',
        maskImage: 'linear-gradient(to right, transparent, black 18%, black 82%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 18%, black 82%, transparent)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          animation: `trusted-clients-scroll ${logos.length * 3.5}s linear infinite`,
          '@keyframes trusted-clients-scroll': {
            from: { transform: 'translateX(0)' },
            to: { transform: `translateX(-${logos.length * 25}%)` },
          },
        }}
      >
        {[0, 1].map((copy) => (
          <Box
            component="ul"
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flex: `0 0 ${logos.length * 25}%`,
              listStyle: 'none',
              p: 0,
              m: 0,
            }}
          >
            {logos.map((client, index) => (
              <Box
                component="li"
                key={`${client.name}-${index}`}
                aria-hidden={index >= clients.length ? true : undefined}
                sx={{
                  flex: `0 0 ${100 / logos.length}%`,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: { xs: 1, sm: 2 },
                  boxSizing: 'border-box',
                }}
              >
                <Box
                  component="img"
                  src={client.logo.url}
                  alt={client.name}
                  width={client.width}
                  height={client.height || 40}
                  sx={{
                    display: 'block',
                    width: client.width,
                    maxWidth: '100%',
                    height: { xs: 28, sm: 40 },
                    objectFit: 'contain',
                  }}
                />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

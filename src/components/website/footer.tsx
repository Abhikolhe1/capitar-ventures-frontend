import type { ContentLink, FooterContent, FooterShortcut } from 'src/types/homepage';
import type { ReactNode, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';

import fallback from 'src/content/homepage.json';
import { websiteTokens } from 'src/theme/website-theme';
import { footerViewportStyles } from 'src/theme/homepage-viewport';
import { footerMobileStyles } from 'src/theme/later-section-mobile';

import { HeroBackgroundVideo } from 'src/sections/home/hero/hero-background-video';

import { footerAiDestination, CAPITAR_INTRODUCTION_PROMPT } from './footer-ai';

function FooterLink({
  item,
  children,
  underline = false,
}: {
  item: ContentLink;
  children?: ReactNode;
  underline?: boolean;
}) {
  const enabled = item.enabled && !!item.href;
  return (
    <Box
      component={enabled ? 'a' : 'span'}
      href={enabled ? item.href : undefined}
      aria-disabled={!enabled || undefined}
      sx={{
        color: 'inherit',
        textDecoration: underline ? 'underline' : 'none',
        textUnderlineOffset: '3px',
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 32,
        '&:hover': { color: enabled ? '#CC2334' : undefined },
        '&:focus-visible': { outline: '2px solid #193969', outlineOffset: 3, borderRadius: '2px' },
      }}
    >
      {children || item.label}
    </Box>
  );
}

function CopyContact({ label, value, href }: { label: string; value: string; href: string }) {
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} copied`);
    } catch {
      setMessage(`Unable to copy ${label.toLowerCase()}. Select the text to copy it.`);
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), 2500);
  };
  return (
    <Box>
      <Typography
        sx={{
          color: '#9B9BA1',
          fontSize: 14,
          lineHeight: '20px',
          textTransform: 'uppercase',
          mb: '6px',
        }}
      >
        {label === 'Email' ? 'Mail ID:' : 'Phone number:'}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
        <Box
          component="a"
          href={href}
          sx={{
            fontSize: 14,
            fontWeight: 500,
            lineHeight: '22px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            textAlign: 'right',
            color: '#121212',
            textDecoration: 'none',
            overflowWrap: 'anywhere',
            '&:focus-visible': { outline: '2px solid #193969' },
          }}
        >
          {value}
        </Box>
        <IconButton
          aria-label={`Copy ${label.toLowerCase()}`}
          onClick={copy}
          sx={{ p: 0, minWidth: 24, minHeight: 24, color: '#66666E', flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
              x="8"
              y="8"
              width="12"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </IconButton>
      </Box>
      <Box
        role="status"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          p: 0,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
        }}
      >
        {message}
      </Box>
    </Box>
  );
}

function FooterLinkList({ items, label }: { items: ContentLink[]; label: string }) {
  return (
    <Box component="nav" aria-label={label}>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, borderTop: '1px solid #E7E7EC' }}>
        {items.map((item, index) => (
          <Box
            key={`${index}-${item.label}`}
            component="li"
            sx={{
              display: 'grid',
              gridTemplateColumns: '104px minmax(0,1fr)',
              alignItems: 'center',
              minHeight: 36,
              color: '#808080',
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.25,
              overflowWrap: 'anywhere',
              transition: 'background-color 160ms ease, color 160ms ease',
              '&:hover, &:focus-within': { bgcolor: '#000', color: '#FFF' },
              '& a:hover': { color: 'inherit' },
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          >
            <Box aria-hidden="true" sx={{ width: 7, height: 7, ml: '2px', bgcolor: '#CC2334', transform: 'rotate(45deg)' }} />
            <FooterLink item={item} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function AiShortcuts({ items }: { items: FooterShortcut[] }) {
  const [copyPrompt, setCopyPrompt] = useState<{ label: string; href: string } | null>(null);
  const [copyMessage, setCopyMessage] = useState('');
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const pointerType = useRef('mouse');
  const active = hovered ?? focused ?? selected;
  return (
    <>
    <Box
      component="nav"
      aria-label="Explore Capitar with AI"
      onPointerMove={(event: ReactPointerEvent<HTMLElement>) => {
        if (event.pointerType !== 'mouse') return;
        const { clientX: x, clientY: y } = event;
        // Expanding labels move siblings under a stationary pointer. Ignore those hit-test changes.
        if (pointer.current?.x === x && pointer.current?.y === y) return;
        pointer.current = { x, y };
        const shortcut = event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-footer-ai-index]')
          : null;
        if (shortcut) setHovered(Number(shortcut.dataset.footerAiIndex));
      }}
      onPointerLeave={() => {
        pointer.current = null;
        setHovered(null);
      }}
      onPointerDown={(event: ReactPointerEvent<HTMLElement>) => {
        pointerType.current = event.pointerType;
      }}
      sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mt: '16px' }}
    >
      {items.map((item, index) => {
        const expanded = active === index || !item.icon;
        // A configured CMS link takes precedence. Legacy icons without URLs use our introduction.
        const destination = !item.href ? footerAiDestination(item.label) : undefined;
        const enabled = item.enabled && !!item.href || !!destination && !destination.copyRequired;
        const href = destination?.href ?? item.href;
        return (
          <Box
            key={`${index}-${item.label}`}
            component={enabled ? 'a' : 'button'}
            type={enabled ? undefined : 'button'}
            href={enabled ? href : undefined}
            target={destination && enabled ? '_blank' : undefined}
            rel={destination && enabled ? 'noopener noreferrer' : undefined}
            aria-label={item.label}
            aria-expanded={expanded}
            data-footer-ai-index={index}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(null)}
            onClick={(event: ReactMouseEvent<HTMLElement>) => {
              if (destination?.copyRequired) {
                setCopyMessage('');
                setCopyPrompt({ label: item.label, href: destination.href });
              }
              // First touch opens the label; a subsequent activation follows a configured link.
              if (!destination && enabled && pointerType.current !== 'mouse' && event.detail !== 0 && selected !== index)
                event.preventDefault();
              setSelected(index);
            }}
            sx={{
              appearance: 'none',
              font: 'inherit',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              flexShrink: 0,
              minWidth: 34,
              maxWidth: '100%',
              height: 34,
              p: 0,
              borderRadius: '9px',
              border: '1px solid',
              borderColor: expanded ? '#ECECF0' : '#17174F',
              bgcolor: expanded ? '#F9FAFB' : '#17174F',
              color: expanded ? '#121212' : 'white',
              fontSize: 14,
              overflow: 'hidden',
              transition: 'background-color 350ms ease, border-color 350ms ease',
              '&:focus-visible': { outline: '2px solid #193969', outlineOffset: 3 },
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
                '& .footer-ai-label': { transition: 'none' },
              },
            }}
          >
            {item.icon && (
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: '#17174F',
                  borderRadius: '8px',
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                }}
              >
                <Box
                  component="img"
                  src={item.icon.url}
                  alt=""
                  width={item.icon.width || 22}
                  height={item.icon.height || 22}
                  sx={{ objectFit: 'contain' }}
                />
              </Box>
            )}
            <Box
              component="span"
              className="footer-ai-label"
              aria-hidden={!expanded}
              sx={{
                display: 'block',
                minWidth: 0,
                maxWidth: expanded ? 140 : 0,
                opacity: expanded ? 1 : 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                transition: 'max-width 450ms ease-in-out, opacity 350ms ease-in-out',
              }}
            >
              <Box component="span" sx={{ display: 'block', pl: '6px', pr: '10px' }}>
                {item.label}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
    <Dialog open={!!copyPrompt} onClose={() => setCopyPrompt(null)} fullWidth maxWidth="sm" aria-labelledby="footer-ai-prompt-title">
      <DialogTitle id="footer-ai-prompt-title">Ask {copyPrompt?.label} about Capitar</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>Copy this prompt, then paste it into {copyPrompt?.label}. You may be asked to sign in.</Typography>
        <Box component="textarea" aria-label="Capitar introduction prompt" readOnly value={CAPITAR_INTRODUCTION_PROMPT}
          onFocus={(event) => event.currentTarget.select()}
          sx={{ width: '100%', minHeight: 180, p: 2, font: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
        <Typography role="status" sx={{ mt: 1 }}>{copyMessage}</Typography>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
        <Button onClick={() => setCopyPrompt(null)}>Close</Button>
        <Button onClick={async () => {
          try {
            await navigator.clipboard.writeText(CAPITAR_INTRODUCTION_PROMPT);
            setCopyMessage('Prompt copied. Open Gemini and paste it into the chat.');
          } catch {
            setCopyMessage('Copy was unavailable. Select the prompt above and copy it manually, then open Gemini.');
          }
        }}>Copy prompt</Button>
        <Button component="a" href={copyPrompt?.href} target="_blank" rel="noopener noreferrer">Open {copyPrompt?.label}</Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

export function Footer({ data, brandLogo }: { data?: FooterContent; brandLogo?: { url: string } }) {
  const root = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const mobile = useMediaQuery('(max-width:599.95px)');
  useEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { rootMargin: '200px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [data?.enabled]);
  if (!data?.enabled) return null;
  const poster = data.backgroundImage?.url || fallback.hero.backgroundImage.url;
  const src = data.backgroundVideo?.url || fallback.hero.backgroundVideo.url;
  const logo = data.brandLogo?.url || fallback.global.footer.brandLogo.url || brandLogo?.url;
  const logoMonochrome = data.brandLogo ? data.logoMonochrome : fallback.global.footer.logoMonochrome;
  const navigation = data.navigation.map((item) =>
    item.label.trim().toLowerCase() === 'about us' && !item.href
      ? { ...item, href: '#capitar-difference', enabled: true }
      : item
  );
  const socialLinks = data.socialLinks.filter((item) => item.label.trim().toLowerCase() !== 'facebook');
  const aiLinks = data.aiLinks.map((item) => ({
    ...item,
    icon:
      item.icon ??
      fallback.global.footer.aiLinks.find(
        (shortcut) => shortcut.label.toLowerCase() === item.label.toLowerCase()
      )?.icon,
  }));
  const background = (cta = false) => {
    // Reference crop clips the outermost chevron; fitting the complete symbol shifts all the bends.
    const mediaFraming = {
      position: 'absolute' as const,
      inset: 0,
      width: '100%',
      height: cta ? '179.3%' : '100%',
      top: cta ? '-23.7%' : 0,
      objectFit: 'cover' as const,
      objectPosition: cta ? 'calc(100% + 116.5px) top' : 'calc(100% + 22px) top',
    };
    return (
      <Box
        data-footer-background={cta ? 'cta' : 'outer'}
        aria-hidden="true"
        sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', bgcolor: '#0B0F2D' }}
      >
        <Box component="img" src={poster} alt="" loading="lazy" sx={mediaFraming} />
        {visible && !mobile && (
          <HeroBackgroundVideo
            retryOnInteraction
            src={src}
            fallbackSrc={fallback.hero.backgroundVideo.url}
            poster={poster}
            sx={mediaFraming}
          />
        )}
      </Box>
    );
  };
  return (
    <Box
      ref={root}
      component="footer"
      id="site-footer"
      aria-label="Capitar Ventures footer"
      sx={{ position: 'relative', bgcolor: '#0B0F2D', color: '#37373D', overflow: 'hidden', ...footerViewportStyles, ...footerMobileStyles }}
    >
      {background()}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg,#111129 35%,rgba(17,17,41,.15))',
          pointerEvents: 'none',
        }}
      />
      <Box
        data-footer-shell
        sx={{
          position: 'relative',
          maxWidth: websiteTokens.maxWidth,
          mx: 'auto',
          pt: { xs: '40px', lg: '68.5px' },
          pb: { xs: '40px', lg: '48.5px' },
          px: { xs: 3, sm: 6, lg: '58.5px' },
          boxSizing: 'border-box',
        }}
      >
        <Box
          data-footer-panel
          sx={{
            position: 'relative',
            bgcolor: 'white',
            borderRadius: '20px',
            minHeight: { lg: 523 },
            p: { xs: 3, sm: 4, lg: '40px' },
            pb: { xs: 3, sm: 4, lg: '40px' },
            boxSizing: 'border-box',
          }}
        >
          <Box
            data-footer-grid
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0,1fr)',
                sm: 'repeat(2,minmax(0,1fr))',
                lg: 'minmax(0,342fr) minmax(0,418fr) minmax(0,352fr)',
              },
              gap: { xs: '40px', lg: '66px' },
            }}
          >
            <Box data-footer-company sx={{ minWidth: 0, pb: { lg: '64px' } }}>
              {logo && (
                <Box
                  component="a"
                  href="/"
                  data-footer-brand
                  aria-label="Capitar Ventures home"
                  sx={{
                    display: 'inline-flex',
                    '&:focus-visible': { outline: '2px solid #193969' },
                  }}
                >
                  <Box
                    component="img"
                    src={logo}
                    alt="Capitar Ventures"
                    width={121.5}
                    height={32}
                    sx={{
                      display: 'block',
                      objectFit: 'contain',
                      filter: logoMonochrome ? 'brightness(0)' : undefined,
                    }}
                  />
                </Box>
              )}
              {data.address && (
                <Typography
                  component="address"
                  sx={{
                    mt: '12px',
                    color: '#999999',
                    fontSize: 16,
                    lineHeight: '24px',
                    fontStyle: 'normal',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {data.address}
                </Typography>
              )}
              <Box data-footer-contact sx={{ mt: '28px', display: 'grid', gap: '12px' }}>
                {data.email && (
                  <CopyContact label="Email" value={data.email} href={`mailto:${data.email}`} />
                )}
                {data.phone && (
                  <CopyContact
                    label="Phone"
                    value={data.phone}
                    href={`tel:${data.phone.replace(/[^+\d]/g, '')}`}
                  />
                )}
              </Box>
              {data.aiText && (
                <Typography
                  data-footer-ai-copy
                  sx={{
                    mt: '32px',
                    fontSize: 16,
                    lineHeight: '24px',
                    whiteSpace: 'pre-line',
                    color: '#65656D',
                  }}
                >
                  {data.aiText}
                </Typography>
              )}
              {!!aiLinks.length && <AiShortcuts items={aiLinks} />}
            </Box>
            <Box data-footer-links sx={{ minWidth: 0, pt: { lg: '16px' }, pb: { lg: '64px' } }}>
              <FooterLinkList items={navigation} label="Footer navigation" />
              {!!socialLinks.length && (
                <Box data-footer-social sx={{ mt: '56px' }}>
                  <Typography sx={{ color: '#CC2334', fontSize: 18, lineHeight: '26px' }}>
                    {data.socialLabel || 'Social'}
                  </Typography>
                  <FooterLinkList items={socialLinks} label="Social links" />
                </Box>
              )}
            </Box>
            <Box
              data-footer-cta
              sx={{
                position: 'relative',
                height: { xs: 360, lg: 440 },
                borderRadius: '20px',
                overflow: 'hidden',
                bgcolor: '#0B0F2D',
                p: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gridColumn: { sm: '1 / -1', lg: 'auto' },
              }}
            >
              {background(true)}
              <Typography
                component="h2"
                sx={{
                  position: 'relative',
                  fontSize: 22,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: 'white',
                  maxWidth: 260,
                  whiteSpace: 'pre-line',
                }}
              >
                {data.ctaHeading}
              </Typography>
              {data.cta && (
                <Box
                  data-footer-connect
                  data-flow-cta
                  data-cta-surface="dark"
                  sx={{
                    position: 'relative',
                    mt: 'auto',
                    flexShrink: 0,
                    bgcolor: '#F9FAFB',
                    borderRadius: '8px',
                    color: '#121212',
                    px: '16px',
                    py: '12px',
                    fontSize: 18,
                    '& > *': {
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      width: '100%',
                      minHeight: 68,
                    },
                    '& svg': { transition: 'transform 180ms ease' },
                    '&:hover svg': { transform: data.cta.enabled ? 'translateX(3px)' : undefined },
                    '@media (prefers-reduced-motion: reduce)': { '& svg': { transition: 'none' } },
                  }}
                >
                  <FooterLink item={data.cta}>
                    <Box component="span">{data.cta.label}</Box>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </FooterLink>
                </Box>
              )}
            </Box>
          </Box>
          <Box
            data-footer-legal
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: '16px', lg: '96px' },
              alignItems: 'center',
              mt: { xs: '32px', lg: '0px' },
              position: { lg: 'absolute' },
              left: { lg: 40 },
              bottom: { lg: 24 },
              maxWidth: { lg: 'calc(100% - 440px)' },
              fontSize: 14,
              lineHeight: 1.4,
              color: '#8D8D97',
            }}
          >
            {data.copyright && (
              <Typography sx={{ fontSize: 'inherit', whiteSpace: 'pre-line' }}>
                {data.copyright}
              </Typography>
            )}
            <Box
              component="nav"
              aria-label="Legal links"
              sx={{ display: 'flex', flexWrap: 'wrap', columnGap: '32px', rowGap: 1 }}
            >
              {data.legalLinks.map((item, index) => (
                <Box key={`${index}-${item.label}`} component="span" data-legal-label={item.label.trim().toLowerCase()}><FooterLink item={item} underline /></Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

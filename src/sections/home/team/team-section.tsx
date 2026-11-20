import type { TeamContent } from 'src/types/homepage';

import { useRef, useState, useCallback, useLayoutEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { isSiteMotionReduced } from 'src/hooks/use-site-motion';
import { useSectionReveal } from 'src/hooks/use-section-reveal';

import { websiteTokens } from 'src/theme/website-theme';
import { teamMobileStyles } from 'src/theme/later-section-mobile';

import { SectionBadge } from 'src/components/website/section-badge';
import { TeamPersonCard } from 'src/components/website/team-person-card';

function Arrow({ forward }: { forward?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={forward ? 'M5 12h14m-5-5 5 5-5 5' : 'M19 12H5m5-5-5 5 5 5'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function TeamSection({ data }: { data?: TeamContent }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ previous: false, next: false });
  const update = useCallback(() => {
    const element = track.current;
    if (element) setPosition({ previous: element.scrollLeft > 2, next: element.scrollLeft + element.clientWidth < element.scrollWidth - 2 });
  }, []);
  const signature = JSON.stringify(data);
  useSectionReveal(section, signature);
  useLayoutEffect(() => {
    if (!data?.enabled || !data.members.length) return undefined;
    update();
    const observer = new ResizeObserver(update);
    if (track.current) observer.observe(track.current);
    return () => observer.disconnect();
  }, [signature, data?.enabled, data?.members.length, update]);
  if (!data?.enabled || !data.members.length) return null;
  const move = (direction: number) => {
    const element = track.current;
    const card = element?.firstElementChild;
    if (!element || !card) return;
    const distance = card.getBoundingClientRect().width + parseFloat(getComputedStyle(element).gap || '0');
    element.scrollBy({ left: direction * distance, behavior: isSiteMotionReduced() ? 'instant' : 'smooth' });
  };
  return (
    <Box ref={section} component="section" id="team" aria-labelledby="team-heading" sx={{
      bgcolor: '#F8F9FA', color: '#121212', py: { xs: 6, md: '42px' }, overflow: 'hidden',
      ...teamMobileStyles,
    }}>
      <Box sx={{ width: '100%' }}>
        <Box data-scroll-reveal="team-heading" className="team-heading-row" sx={{ maxWidth: websiteTokens.maxWidth, mx: 'auto', pl: { xs: 3, sm: 6, lg: '53px' }, pr: { xs: 3, sm: 6, lg: '66px' } }}>
          <SectionBadge text={data.sectionLabel} minWidth={0} lineHeight={1.4} />
          <Box sx={{ mt: '22px', mb: { xs: 4, md: '40px' }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr auto' }, alignItems: 'end', gap: { xs: 3, md: 5 } }}>
            <Typography id="team-heading" component="h2" sx={{ m: 0, maxWidth: 486.75, fontSize: { xs: 28, sm: 38, lg: 42 }, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}>{data.heading}</Typography>
            {data.description && <Typography sx={{ maxWidth: 394.13, fontSize: 16, lineHeight: 1.4 }}>{data.description}</Typography>}
            <Box aria-label="Team carousel controls" sx={{ display: 'flex', gap: '10px', justifySelf: { xs: 'end', md: 'auto' } }}>
              <IconButton disabled={!position.previous} aria-label="Previous team members" onClick={() => move(-1)} sx={{ width: 80, height: 44, borderRadius: '99px 0 0 99px', justifyContent: 'flex-start', px: '18px', bgcolor: '#0B0F2D', color: 'white', '&:hover': { bgcolor: '#242447' }, '&.Mui-disabled': { bgcolor: '#0B0F2D', color: 'rgba(255,255,255,.35)' }, '&.Mui-focusVisible': { outline: '2px solid #CC2334', outlineOffset: 3 } }}><Arrow /></IconButton>
              <IconButton disabled={!position.next} aria-label="Next team members" onClick={() => move(1)} sx={{ width: 80, height: 44, borderRadius: '0 99px 99px 0', justifyContent: 'flex-end', px: '18px', bgcolor: '#0B0F2D', color: 'white', '&:hover': { bgcolor: '#242447' }, '&.Mui-disabled': { bgcolor: '#0B0F2D', color: 'rgba(255,255,255,.35)' }, '&.Mui-focusVisible': { outline: '2px solid #CC2334', outlineOffset: 3 } }}><Arrow forward /></IconButton>
            </Box>
          </Box>
        </Box>
        <Box ref={track} data-scroll-reveal="team-track" component="ul" tabIndex={0} aria-label="Capitar team members" onScroll={update} sx={{
          '--team-card-width': { xs: '82%', sm: '44%', md: '400px' },
          display: 'flex', gap: '21.63px', m: 0, p: 0, pl: { xs: 3, sm: 6, lg: `max(53px,calc((100% - ${websiteTokens.maxWidth}px) / 2 + 53px))` }, pb: 1,
          scrollPaddingInlineStart: { xs: '24px', sm: '48px', lg: `max(53px,calc((100% - ${websiteTokens.maxWidth}px) / 2 + 53px))` },
          overflowX: 'auto', scrollSnapType: 'x mandatory', overscrollBehaviorX: 'contain', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
          '&:focus-visible': { outline: `2px solid ${websiteTokens.red}`, outlineOffset: 4 },
        }}>{data.members.map((member, index) => <Box component="li" key={`${member.name}-${index}`} sx={{ flex: '0 0 var(--team-card-width)', minWidth: 0, scrollSnapAlign: 'start', listStyle: 'none' }}><TeamPersonCard member={{ name: member.name, role: member.role, image: member.portrait?.url, biography: member.description, linkedinUrl: member.linkedinUrl }} index={index} biography="" artwork={name => '/assets/about/' + name} /></Box>)}</Box>
      </Box>
    </Box>
  );
}

import type { TeamContent, TeamMemberContent } from 'src/types/homepage';

import { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { websiteTokens } from 'src/theme/website-theme';

import { SectionBadge } from 'src/components/website/section-badge';

function Arrow({ forward }: { forward?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={forward ? 'M5 12h14m-5-5 5 5-5 5' : 'M19 12H5m5-5-5 5 5 5'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function TeamCard({ member }: { member: TeamMemberContent }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [member.portrait?.url]);
  const initials = member.name.split(/\s+/).filter(Boolean).map(word => word[0]).slice(0, 2).join('');
  return (
    <Box component="li" sx={{ flex: '0 0 var(--team-card-width)', minWidth: 0, scrollSnapAlign: 'start', listStyle: 'none' }}>
      <Box component="article" tabIndex={member.description ? 0 : undefined} aria-label={`${member.name}, ${member.role}`} sx={{
        position: 'relative', aspectRatio: '398.03 / 447.79', overflow: 'hidden', borderRadius: '8.65px', bgcolor: '#E6E7EB',
        '--team-detail-gap': member.description ? '20px' : '0px',
        '& .team-shade': { transition: 'height 400ms ease' },
        '& .team-card-content': { transition: 'transform 400ms ease' },
        '& .team-bio': { transition: 'grid-template-rows 400ms ease, opacity 300ms ease, margin-top 400ms ease' },
        '&:focus-within': {
          outline: `2px solid ${websiteTokens.red}`, outlineOffset: 3,
          '& .team-shade': { height: '65%' },
          '& .team-card-content': { transform: 'translateY(-8px)' },
          '& .team-bio': { gridTemplateRows: '1fr', opacity: 1, mt: 'var(--team-detail-gap)', visibility: 'visible' },
        },
        '@media (hover: hover)': { '&:hover': {
          '& .team-shade': { height: '65%' },
          '& .team-card-content': { transform: 'translateY(-8px)' },
          '& .team-bio': { gridTemplateRows: '1fr', opacity: 1, mt: 'var(--team-detail-gap)', visibility: 'visible' },
        } },
        '@media (prefers-reduced-motion: reduce)': { '& .team-shade, & .team-card-content, & .team-bio': { transition: 'none' } },
      }}>
        {member.portrait && !failed ? (
          <Box component="img" className="team-portrait" src={member.portrait.url} alt={member.portrait.alternativeText || member.name} onError={() => setFailed(true)} loading="lazy" width={400} height={450} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${member.portraitPositionY ?? 50}%` }} />
        ) : (
          <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#989BA9', fontSize: 'clamp(64px, 8vw, 112px)', fontWeight: 400 }}>{initials}</Box>
        )}
        <Box className="team-shade" sx={{ position: 'absolute', left: '-12px', right: '-12px', bottom: '-12px', height: '42%', background: 'linear-gradient(180deg, transparent 0%, rgba(158,154,146,.55) 45%, rgba(158,154,146,.96) 100%)', backdropFilter: 'blur(10px)', maskImage: 'linear-gradient(180deg, transparent 0%, #000 65%)', pointerEvents: 'none' }} />
        <Box className="team-card-content" sx={{ position: 'absolute', bottom: { xs: 20, md: 24 }, left: { xs: 20, md: 24 }, right: 20 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography component="h3" sx={{ color: '#FFF', fontFamily: 'Georgia, "Times New Roman", serif', fontSize: { xs: 23, lg: 26 }, lineHeight: 1.2, fontWeight: 600 }}>{member.name}</Typography>
            <Typography sx={{ mt: '6px', color: '#FFF', fontSize: 14, lineHeight: 1.4 }}>{member.role}</Typography>
          </Box>
          <Box component={member.linkedinUrl ? 'a' : 'span'} href={member.linkedinUrl} target={member.linkedinUrl ? '_blank' : undefined} rel={member.linkedinUrl ? 'noopener noreferrer' : undefined} aria-label={member.linkedinUrl ? `${member.name} on LinkedIn` : undefined} aria-hidden={!member.linkedinUrl || undefined} sx={{ width: 44, height: 44, display: 'grid', placeItems: 'center', flexShrink: 0, '&:focus-visible': { outline: '2px solid white', borderRadius: '4px' } }}>
            <Box component="img" src="/assets/images/Frame 2147239325.png" alt="" width={21} height={21} />
          </Box>
          </Box>
          {member.description && <Box className="team-bio" sx={{ display: 'grid', gridTemplateRows: '0fr', opacity: 0, visibility: 'hidden' }}><Box sx={{ overflow: 'hidden', minHeight: 0 }}><Typography sx={{ color: '#FFF', fontSize: 14, lineHeight: 1.5 }}>{member.description}</Typography></Box></Box>}
        </Box>
      </Box>
    </Box>
  );
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
  useLayoutEffect(() => {
    if (!data?.enabled || !data.members.length) return undefined;
    update();
    const observer = new ResizeObserver(update);
    if (track.current) observer.observe(track.current);
    return () => observer.disconnect();
  }, [signature, data?.enabled, data?.members.length, update]);
  useEffect(() => {
    const element = section.current;
    if (!element || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return undefined;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        element.dataset.teamEntered = 'true';
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [signature]);
  if (!data?.enabled || !data.members.length) return null;
  const move = (direction: number) => {
    const element = track.current;
    const card = element?.firstElementChild;
    if (!element || !card) return;
    const distance = card.getBoundingClientRect().width + parseFloat(getComputedStyle(element).gap || '0');
    element.scrollBy({ left: direction * distance, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return (
    <Box ref={section} component="section" id="team" aria-labelledby="team-heading" sx={{
      bgcolor: '#F8F9FA', color: '#121212', py: { xs: 6, md: '42px' }, overflow: 'hidden',
      '@keyframes team-enter': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      '@media (prefers-reduced-motion: no-preference)': { '&[data-team-entered="true"] .team-heading-row': { animation: 'team-enter 650ms ease-out both' }, '&[data-team-entered="true"] li': { animation: 'team-enter 700ms ease-out both' }, '& li:nth-of-type(2)': { animationDelay: '90ms' }, '& li:nth-of-type(3)': { animationDelay: '180ms' } },
    }}>
      <Box sx={{ maxWidth: websiteTokens.maxWidth, mx: 'auto', pl: { xs: 3, sm: 6, lg: '52px' } }}>
        <Box className="team-heading-row" sx={{ pr: { xs: 3, sm: 6, lg: '66px' } }}>
          <SectionBadge text={data.sectionLabel} minWidth={0} fontWeight={400} />
          <Box sx={{ mt: '22px', mb: { xs: 4, md: '40px' }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr auto' }, alignItems: 'end', gap: { xs: 3, md: 5 } }}>
            <Typography id="team-heading" component="h2" sx={{ m: 0, maxWidth: 480, fontSize: { xs: 32, sm: 38, lg: 42 }, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.035em', whiteSpace: 'pre-line' }}>{data.heading}</Typography>
            {data.description && <Typography sx={{ maxWidth: 390, fontSize: 16, lineHeight: 1.4 }}>{data.description}</Typography>}
            <Box aria-label="Team carousel controls" sx={{ display: 'flex', gap: '10px', justifySelf: { xs: 'end', md: 'auto' } }}>
              <IconButton disabled={!position.previous} aria-label="Previous team members" onClick={() => move(-1)} sx={{ width: 80, height: 44, borderRadius: '99px 0 0 99px', bgcolor: '#0B0F2D', color: 'white', '&:hover': { bgcolor: '#242447' }, '&.Mui-disabled': { bgcolor: '#0B0F2D', color: 'rgba(255,255,255,.35)' } }}><Arrow /></IconButton>
              <IconButton disabled={!position.next} aria-label="Next team members" onClick={() => move(1)} sx={{ width: 80, height: 44, borderRadius: '0 99px 99px 0', bgcolor: '#0B0F2D', color: 'white', '&:hover': { bgcolor: '#242447' }, '&.Mui-disabled': { bgcolor: '#0B0F2D', color: 'rgba(255,255,255,.35)' } }}><Arrow forward /></IconButton>
            </Box>
          </Box>
        </Box>
        <Box ref={track} component="ul" tabIndex={0} aria-label="Capitar team members" onScroll={update} sx={{
          '--team-card-width': { xs: '82%', sm: '44%', md: '398.03px' },
          display: 'flex', gap: '22px', m: 0, p: 0, pr: { xs: 3, sm: 6, lg: '52px' }, pb: 1,
          overflowX: 'auto', scrollSnapType: 'x mandatory', overscrollBehaviorX: 'contain', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
          '&:focus-visible': { outline: `2px solid ${websiteTokens.red}`, outlineOffset: 4 },
        }}>{data.members.map((member, index) => <TeamCard key={`${member.name}-${index}`} member={member} />)}</Box>
      </Box>
    </Box>
  );
}

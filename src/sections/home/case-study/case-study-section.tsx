import type { CaseStudyContent } from 'src/types/homepage';

import { useRef, useState } from 'react';

import { Box, IconButton, Typography, useMediaQuery } from '@mui/material';

import { SectionBadge } from 'src/components/website/section-badge';

import { CaseStudyCard } from './case-study-card';
import { useCaseStudyAnimation } from './use-case-study-animation';

export function CaseStudySection({ data }: { data?: CaseStudyContent }) {
  const mobile = useMediaQuery('(max-width:599px)');
  const scope = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState(0);
  useCaseStudyAnimation(scope, JSON.stringify(data));
  if (!data?.enabled) return null;
  const active = Math.min(selected, Math.max(0, data.items.length - 1));
  const move = (direction: number) => setSelected((active + direction + data.items.length) % data.items.length);
  return <Box component="section" ref={scope} id="case-study" aria-labelledby="case-study-heading" sx={{ position: 'relative', zIndex: 3, bgcolor: '#FFFFFF', color: '#121212' }}>
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: '20px', sm: 6, lg: '50px' }, pt: { xs: 6, sm: 6, md: '60px' }, pb: { xs: 6, sm: 6, md: '51px' }, minHeight: { lg: 800 } }}>
      <Box data-case-header sx={{ px: { lg: '10px' }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) minmax(0,1fr) 170px', lg: 'minmax(0,487px) minmax(0,394px) 170px' }, alignItems: 'end', columnGap: { md: 3 }, justifyContent: 'space-between', rowGap: { xs: '12px', md: 3 } }}>
        <Box><SectionBadge compactMobile text={data.sectionLabel} minWidth={122} fontWeight={500} /><Typography component="h2" id="case-study-heading" sx={{ mt: '20px', fontSize: { xs: 28, sm: 38, lg: 42 }, lineHeight: 1.2, letterSpacing: '-0.02em', fontWeight: 400, whiteSpace: { lg: 'pre-line' } }}>{data.heading}</Typography></Box>
        {data.description && <Typography sx={{ fontSize: { xs: 14, sm: 16 }, lineHeight: 1.5, fontWeight: 400 }}>{data.description}</Typography>}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: '10px', justifySelf: 'end' }}>{[-1,1].map(direction => <IconButton key={direction} aria-label={direction < 0 ? 'Previous case study' : 'Next case study'} disabled={data.items.length < 2} onClick={() => move(direction)} sx={{ bgcolor: '#0B0F2D', color: '#FFFFFF', width: { xs: 60, md: 80 }, height: 44, borderRadius: direction < 0 ? '50px 0 0 50px' : '0 50px 50px 0', '&:hover': { bgcolor: '#193969' }, '&.Mui-focusVisible': { outline: '2px solid #CC2334', outlineOffset: 3 } }}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" style={{ transform: direction < 0 ? 'rotate(180deg)' : undefined }}><path d="M3 10h14m-5-4 5 4-5 4" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg></IconButton>)}</Box>
      </Box>
      {mobile ? <>
        <Box component="ul" data-case-deck aria-label="Selected case study" sx={{ p: 0, m: 0, mt: 3 }}>
          {data.items[active] && <CaseStudyCard item={data.items[active]} index={active} active onSelect={() => {}} />}
        </Box>
        <Box component="ul" aria-label="Choose a case study" sx={{ display: 'flex', gap: '12px', overflowX: 'auto', overscrollBehaviorX: 'contain', scrollSnapType: 'x mandatory', p: 0, m: 0, mt: 3, mr: '-20px', pr: '20px', pb: 0.5, '& > li': { flex: '0 0 160px', scrollSnapAlign: 'start' } }}>
          {data.items.map((item,index) => index !== active && <CaseStudyCard key={item.name+index} item={item} index={index} active={false} onSelect={() => setSelected(index)} />)}
        </Box>
      </> : <Box component="ul" data-case-deck aria-label="Case studies" sx={{ display: { xs: 'grid', md: 'flex' }, gridTemplateColumns: 'repeat(3,minmax(0,1fr))', flexWrap: 'nowrap', gap: { xs: '12px', sm: '20px' }, p: 0, m: 0, mt: { xs: '24px', md: '53.2px' }, minHeight: { md: 484 }, mr: { lg: '10px' } }}>
        {data.items.map((item,index) => <CaseStudyCard key={item.name + index} item={item} index={index} active={active === index} onSelect={() => setSelected(index)} />)}
      </Box>}
      <Box role="status" aria-live="polite" sx={{ position: 'absolute', left: 0, top: 0, width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>{data.items.length ? data.items[active].name : ''}</Box>
    </Box>
  </Box>;
}

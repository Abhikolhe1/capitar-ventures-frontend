// Mobile reference: 393px frame, 20px gutters. Keep desktop styles at their callsites.
const mobile = '@media (max-width:599.95px)';
const badge = { fontSize: 12, minHeight: 29, lineHeight: 1.4, px: '10px' };

export const teamMobileStyles = {
  [mobile]: {
    py: '48px',
    '& .team-heading-row': { px: '20px' },
    '& .team-heading-row > span': badge,
    '& .team-heading-row > div:last-child': { mt: '12px', mb: '24px', gap: '12px' },
    '& h2': { fontSize: 28, lineHeight: 1.2 },
    '& .team-heading-row h2 + p': { fontSize: 14, lineHeight: '20px' },
    '& [aria-label="Team carousel controls"]': { display: 'none' },
    // Phones: a two-column grid instead of the side-scrolling row. Cards fill
    // left to right, two per row, so an odd last card sits on the left.
    '& ul': {
      display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px',
      pl: '20px', pr: '20px', pb: 0,
      overflowX: 'visible', scrollSnapType: 'none',
    },
    '& ul > li': { flex: 'none', scrollSnapAlign: 'none' },
    '& article': { aspectRatio: '400 / 478.07764', borderRadius: '14px' },
    // Half-width cards: smaller caption anchored to the bottom edge. The biography
    // panel is too small to read at this width, so the caption stays put on tap.
    '& .about-team-caption': { top: 'auto', bottom: '10px', left: '8%', right: '4%', transform: 'none !important' },
    '& .about-team-identity': { gap: '4px' },
    '& .about-team-name': { fontSize: 15, lineHeight: 1.1 },
    '& .about-team-role': { fontSize: 11, lineHeight: 1.2, mt: '4px' },
    '& .about-team-bio': { display: 'none' },
    '& [data-team-linkedin]': { display: 'grid', width: 32, height: 32 },
    '& [data-team-linkedin] img': { width: 14, height: 14 },
  },
};

export const editorialMobileStyles = {
  [mobile]: {
    minHeight: 0,
    pb: '40px',
    '& [data-editorial-header]': { px: '20px', mb: '24px', gap: '24px' },
    '& [data-editorial-header] span': badge,
    '& h2': { fontSize: 28, lineHeight: 1.2, mt: '12px', minHeight: 0 },
    '& [role=tablist]': { minHeight: 42 },
    '& .MuiTabs-root': { width: 206, minHeight: 46, borderWidth: '1px', p: '2px' },
    '& .MuiTabs-root .MuiTab-root': { minWidth: 100, minHeight: 40, p: '8px', fontSize: 14 },
    '& .MuiTabs-root .MuiTab-root.Mui-selected:first-of-type': { borderRadius: '20px 4px 4px 20px' },
    '& .MuiTabs-root .MuiTab-root.Mui-selected:last-of-type': { borderRadius: '4px 20px 20px 4px' },
    '& ul': { '--editorial-card-width': 'calc(100vw - 40px)', pl: '20px', pr: '20px', pb: 0, minHeight: 310, gap: '12px', scrollPaddingInlineStart: '20px' },
    '& article': { height: 310, borderRadius: '16px' },
    '& [data-editorial-copy]': { px: '16px', py: '16px', minHeight: 138 },
    '& [data-editorial-category]': { fontSize: 12, lineHeight: 1.6 },
    '& .editorial-arrow': { display: 'none' },
    '& article h3': { fontFamily: '"LT Superior", sans-serif', fontSize: 20, lineHeight: 1.2, mt: '12px' },
    '& article h3 + p': { fontSize: 14, lineHeight: '20px', mt: '8px' },
    '& [data-editorial-controls]': { px: '20px', mt: '44px', minHeight: 48 },
    // Figma mobile CTA (1631:555): fill 353px at 393px viewport, 48px tall.
    '& [data-editorial-controls] > .MuiButton-root': {
      width: '100%', height: 48, minHeight: 48,
      padding: '14px 16px', fontSize: 15, lineHeight: '18px',
    },
    '& [data-editorial-arrows]': { display: 'none' },
  },
};

export const testimonialsMobileStyles = {
  [mobile]: {
    py: '48px',
    '& [data-testimonials-header]': { px: '20px', mb: '64px', gap: 0 },
    '& [data-testimonials-header] span': badge,
    '& h2': { fontSize: 28, lineHeight: 1.2, mt: '12px' },
    '& [aria-label="Testimonial carousel controls"]': { display: 'none' },
    '& ul': { '--testimonial-card-width': 'calc(100vw - 40px)', pl: '20px', pr: '20px', pb: 0, gap: '12px', scrollPaddingInlineStart: '20px' },
    '& li:nth-of-type(3)': { flexBasis: 'var(--testimonial-card-width)' },
    '& article': { height: 380, minHeight: 380, p: '24px', gap: '20px', borderRadius: '20px' },
    '& [data-testimonial-identity]': { height: 56, flexShrink: 0 },
    '& [data-testimonial-portrait]': { width: 56, height: 56 },
    '& [data-testimonial-logo]': { width: 80, height: 32 },
    '& [data-testimonial-logo] img': { width: '58.08px', height: '21.57px', maxWidth: '58.08px', maxHeight: '21.57px' },
    '& blockquote': { overflowY: 'auto' },
    '& blockquote > div': { height: 22 },
    '& blockquote > p': { mt: '12px', fontSize: 18, lineHeight: 1.5 },
    '& article footer': { minHeight: 64, pl: '16px' },
    '& article footer p:first-of-type': { fontSize: 14, lineHeight: '22px' },
    '& article footer p:nth-of-type(2)': { fontSize: 12, lineHeight: '18px', mt: '4px' },
    '& article footer p:nth-of-type(3)': { fontSize: 10, lineHeight: '16px', mt: '4px' },
  },
};

export const footerMobileStyles = {
  [mobile]: {
    '& > [data-footer-shell]': { px: '10px', pt: '12px', pb: '10px' },
    '& [data-footer-panel]': { display: 'flex', flexDirection: 'column', borderRadius: '20px', px: '20px', pt: '10px', pb: '20px', minHeight: 0 },
    '& [data-footer-grid]': { gridTemplateColumns: 'minmax(0,1fr)', gap: '16px' },
    '& [data-footer-company]': { display: 'contents' },
    '& [data-footer-cta]': { order: 0, height: 200, p: '14px', mx: '-10px', borderRadius: '16px', boxSizing: 'border-box' },
    '& [data-footer-background=cta]': { display: 'block' },
    '& [data-footer-cta] h2': { fontSize: 18, lineHeight: '26px', maxWidth: 270 },
    '& [data-footer-connect]': { px: '16px', py: '8px', fontSize: 16 },
    '& [data-footer-connect] > *': { minHeight: 32, alignItems: 'center' },
    '& [data-footer-brand]': { order: 1, justifySelf: 'start', mt: '4px' },
    '& address': { order: 2, mt: '-8px', fontSize: 14, lineHeight: '20px' },
    '& [data-footer-contact]': { order: 3, mt: '-8px', gap: '4px' },
    '& [data-footer-contact] > div > p': { display: 'none' },
    '& [data-footer-contact] > div > div': { justifyContent: 'flex-start' },
    '& [data-footer-contact] a': { fontSize: 12, lineHeight: '20px', textAlign: 'left' },
    '& [data-footer-links]': { order: 4, pt: 0, mt: '8px' },
    '& [data-footer-links] li': { gridTemplateColumns: 'minmax(52px,38%) minmax(0,1fr)', minHeight: 36, fontSize: 14, fontWeight: 400, borderBottom: '1px solid #F4F4F6' },
    '& [data-footer-links] li > div:first-child': { gridColumn: 1, gridRow: 1, width: 6, height: 6 },
    '& [data-footer-links] li > a, & [data-footer-links] li > span': { gridColumn: 2, gridRow: 1 },
    '& [data-footer-social]': { mt: '20px' },
    '& [data-footer-social] > p': { fontSize: 16, lineHeight: '24px', mb: '8px' },
    '& [data-footer-ai-copy]': { order: 5, mt: '4px', fontSize: 14, lineHeight: '20px' },
    '& [aria-label="Explore Capitar with AI"]': { order: 6, mt: '-8px' },
    '& [data-footer-registration]': { order: 7, mt: '2px', gap: '8px' },
    '& [data-footer-legal]': { flexDirection: 'column', alignItems: 'stretch', gap: '8px', mt: '20px', pt: 0, fontSize: 10 },
    '& [data-footer-legal] > p': { textAlign: 'left' },
    '& [data-footer-legal] nav': { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: '12px' },
    '& [data-footer-legal] [data-legal-label]': { display: 'inline-flex', borderBottom: 0 },
  },
};

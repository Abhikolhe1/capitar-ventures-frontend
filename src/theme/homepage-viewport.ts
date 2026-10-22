// Desktop sections fill one screen except the Figma-sized Capital Efficiency and sticky Difference sections.
export const homepageViewportStyles = {
  '@media (min-width:900px)': {
    '& > #portfolio-proof-points': {
      height: '100svh', minHeight: 0, display: 'flex', alignItems: 'center',
      '& > div:last-child': { width: '100%', py: 'clamp(20px,5svh,60px)' },
      '& h2': { fontSize: 'clamp(30px,5.55svh,50px)' },
      '& .MuiStack-root': { gap: 'clamp(20px,4svh,40px)' },
      '& dl': { mt: 'clamp(24px,7svh,86px)' },
      '& dd': { fontSize: 'clamp(48px,10svh,100px)' },
    },
    '& > #capital-efficiency': {
      height: 'auto', minHeight: 950, py: '72px',
      '& > img': { height: '100%' },
      '& h2': { fontSize: 42, mt: '21px' },
      '& h2 + p': { mt: '24px' },
      '& [data-capital-grid]': {
        gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
        gridTemplateRows: 'repeat(2,272px)', gridAutoRows: '272px',
        gap: '20px', mt: '44px',
      },
      '& [data-capital-card]': { minHeight: 0, p: '24px 23px', gridColumn: 'auto', gridRow: 'auto' },
      '& [data-capital-card][data-layout=wide]': { gridColumn: 'span 2', p: '19px 27px 32px' },
      '& [data-capital-card][data-layout=tall]': { gridRow: 'span 2', p: '17px 32px 36px' },
      '& [data-capital-card] h3': { fontSize: 30 },
      '& [data-capital-card] p': { fontSize: 16, lineHeight: 1.4 },
      '& [data-capital-copy]': { minWidth: 0 },
      '& [data-layout=tall] [data-capital-copy]': { pt: 0, mt: 'auto' },
      '& [data-layout=wide] [data-capital-copy]': { width: '33%' },
      '& [data-capital-art] img': { width: '100%', height: 'auto', objectFit: 'contain' },
    },
    '& > #case-study': {
      height: '100svh', '--case-card-height': 'clamp(200px,calc(100svh - 300px),484px)',
      '& > div': { height: '100%', minHeight: 0, py: 'clamp(18px,4svh,60px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
      '& h2': { fontSize: 'clamp(28px,4.7svh,42px)', mt: 'clamp(12px,2.2svh,20px)' },
      '& [data-case-header] > p': { fontSize: 'clamp(14px,1.8svh,16px)' },
      '& [data-case-deck]': { minHeight: 'var(--case-card-height)', mt: 'clamp(20px,4.5svh,53px)' },
      '& [data-case-image-button]': { height: 'var(--case-card-height)' },
      '& [data-case-card][data-active=true] [data-case-image-button]': { height: 'calc(var(--case-card-height) - 99px)' },
      '& [data-case-caption]': { pt: '18px' },
      '& [data-case-caption] h3': { fontSize: 'clamp(28px,4.1svh,37px)' },
      '& [data-case-caption] p': { fontSize: 'clamp(16px,2.2svh,20px)', mt: '10px' },
      '& [data-case-metric]': { height: 'clamp(80px,14svh,125px)', p: 'clamp(8px,1.5svh,14px)' },
      '& [data-case-metric] > span:first-of-type': { fontSize: 'clamp(26px,4.4svh,40px)' },
    },
    '& > #team, & > #insights-news, & > #client-testimonials': {
      height: '100svh', minHeight: 0, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', justifyContent: 'safe center',
      py: 'clamp(20px,4svh,60px)',
      '& > div': { width: '100%', flexShrink: 0 },
      '& h2': { fontSize: 'clamp(28px,5.25svh,42px)' },
    },
    '& > #team': {
      '& .team-heading-row > div:last-child': { mt: 'clamp(12px,2svh,22px)', mb: 'clamp(16px,3svh,40px)' },
      '& ul': { '--team-card-width': 'min(398.03px,calc((100svh - 230px) * 398.03 / 447.79))' },
    },
    '& > #insights-news': {
      '& [data-editorial-header]': { mb: 'clamp(16px,3svh,48px)' },
      '& h2': { minHeight: 0, mt: 'clamp(12px,2svh,22px)' },
      '& ul': { minHeight: 0 },
      '& article': { height: 'clamp(280px,calc(100svh - 270px),445px)' },
      '& [data-editorial-controls]': { mt: 'clamp(16px,3svh,32px)' },
    },
    '& > #client-testimonials': {
      '& [data-testimonials-header]': { mb: 'clamp(16px,3svh,36px)' },
      '& h2': { mt: 'clamp(12px,2svh,22px)' },
      '& article': { height: 'clamp(340px,calc(100svh - 230px),523.4px)', minHeight: 0, gap: 'clamp(20px,6.5svh,52px)', p: 'clamp(20px,4svh,32px)' },
    },
  },
};

// Footer lives outside main, so it shares the viewport rule through its own sx.
export const footerViewportStyles = {
  '@media (min-width:900px)': {
    height: '100svh', boxSizing: 'border-box', display: 'flex',
    flexDirection: 'column', justifyContent: 'safe center',
    '& > div:last-child': { width: '100%', flexShrink: 0, py: 'clamp(20px,5svh,68.5px)' },
    '& [data-footer-panel]': { minHeight: 'min(523px,calc(100svh - 80px))', p: 'clamp(24px,5svh,40px)' },
    '& [data-footer-grid]': { gridTemplateColumns: 'minmax(0,342fr) minmax(0,418fr) minmax(0,352fr)', gap: 'clamp(24px,4vw,66px)' },
    '& [data-footer-grid] > div:first-child, & [data-footer-grid] > div:nth-child(2)': { pb: '64px' },
    '& [data-footer-cta]': { gridColumn: 'auto', height: 'clamp(300px,calc(100svh - 180px),440px)' },
    '& [data-footer-legal]': { position: 'absolute', left: 'clamp(24px,5svh,40px)', bottom: 24, mt: 0 },
  },
  '@media (min-width:1200px)': {
    '& [data-footer-grid]': { gap: '66px' },
  },
};

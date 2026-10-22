import type { Ref } from 'react';

import Box from '@mui/material/Box';

import { websiteTokens } from 'src/theme/website-theme';

type Props = {
  text: string;
  compactMobile?: boolean;
  color?: string;
  borderColor?: string;
  minWidth?: number;
  fontWeight?: number;
  ref?: Ref<HTMLSpanElement>;
};

export function SectionBadge({
  text,
  compactMobile = false,
  color = websiteTokens.proof.badgeInk,
  borderColor = websiteTokens.red,
  minWidth = 249,
  fontWeight = 500,
  ref,
}: Props) {
  return (
    <Box
      ref={ref}
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid', borderColor, color, borderRadius: '500px',
        px: '12px', minHeight: { xs: compactMobile ? 28 : 29, sm: 29 }, minWidth: { xs: compactMobile ? 'auto' : minWidth, sm: minWidth }, maxWidth: '100%',
        fontSize: { xs: compactMobile ? 12 : 16, sm: 16 }, fontWeight, lineHeight: { xs: compactMobile ? '26px' : '27px', sm: '27px' }, textAlign: 'center',
      }}
    >
      {text}
    </Box>
  );
}

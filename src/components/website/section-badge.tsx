import type { Ref } from 'react';

import Box from '@mui/material/Box';

import { websiteTokens } from 'src/theme/website-theme';

type Props = {
  text: string;
  color?: string;
  borderColor?: string;
  minWidth?: number;
  fontWeight?: number;
  ref?: Ref<HTMLSpanElement>;
};

export function SectionBadge({
  text,
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
        px: '12px', minHeight: 29, minWidth, maxWidth: '100%',
        fontSize: 16, fontWeight, lineHeight: '27px', textAlign: 'center',
      }}
    >
      {text}
    </Box>
  );
}

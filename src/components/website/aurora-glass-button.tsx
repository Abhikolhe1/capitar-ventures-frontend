import type { ContentLink } from 'src/types/homepage';

import { GlassButton } from './aurora-glass-button.styles';

export function AuroraGlassButton({ data }: { data: ContentLink }) {
  const enabled = data.enabled && !!data.href;
  return (
    <GlassButton
      className="liquid-glass-cta"
      data-aurora-glass-button
      component={enabled ? 'a' : 'button'}
      href={enabled ? data.href : undefined}
      disabled={!enabled}
      sx={{ minWidth: { xs: 112, md: 145 }, minHeight: { xs: 42, md: 46 }, px: { xs: 2, md: 3 }, fontSize: { xs: 14, md: 16 } }}
    >
      <span className="liquid-glass-cta__label">{data.label}</span>
    </GlassButton>
  );
}

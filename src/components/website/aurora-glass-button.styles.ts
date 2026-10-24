import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export const GlassButton = styled(Button)`
/* No colored surface: the scene behind the button supplies all color. */
&.MuiButton-root {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 12%);
  background: transparent;
  color: #fff;
  font-weight: 500;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 38%),
    inset 1px 0 1px rgb(255 255 255 / 12%),
    inset 0 -1px 1px rgb(255 255 255 / 9%),
    inset 0 -5px 9px -8px rgb(0 0 0 / 65%),
    0 4px 14px rgb(0 0 0 / 12%);
  transition: box-shadow 350ms ease, transform 350ms cubic-bezier(.22, 1, .36, 1);
}

&::before,
&::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

/* Thin, uneven specular rim rather than a white wash over the center. */
&::before {
  padding: 1px;
  background:
    radial-gradient(ellipse at 12% 0%, rgb(255 255 255 / 85%), transparent 48%),
    radial-gradient(ellipse at 100% 90%, rgb(255 255 255 / 48%), transparent 38%),
    linear-gradient(150deg, rgb(255 255 255 / 35%), transparent 42%, rgb(255 255 255 / 6%));
}

/* A wider lens edge samples the same backdrop at a second blur level. */
&::after {
  inset: 1px;
  padding: 4px;
  -webkit-backdrop-filter: blur(3px) brightness(1.12);
  backdrop-filter: blur(3px) brightness(1.12);
  box-shadow: inset 0 1px 3px rgb(255 255 255 / 14%), inset 0 -1px 2px rgb(255 255 255 / 8%);
}

.liquid-glass-cta__label {
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 3px rgb(0 0 0 / 22%);
}

&.MuiButton-root:hover {
  background: transparent;
  transform: translateY(-1px);
  box-shadow: inset 0 1px 1px rgb(255 255 255 / 55%), inset 0 -1px 2px rgb(255 255 255 / 18%), 0 5px 16px rgb(0 0 0 / 15%);
}

&.MuiButton-root:active { transform: translateY(0); }
&.MuiButton-root.Mui-disabled { color: #fff; opacity: 1; }
&.Mui-focusVisible { outline: 2px solid #fff; outline-offset: 4px; }

@media (prefers-reduced-motion: reduce) {
  &.MuiButton-root { transition: none; }
}

` as typeof Button;

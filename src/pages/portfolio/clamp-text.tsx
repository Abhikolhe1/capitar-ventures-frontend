import type { ElementType } from 'react';

import { useRef, useState, useLayoutEffect } from 'react';

import Tooltip from '@mui/material/Tooltip';

// Limits text to `lines` with an ellipsis. Only when text is actually cut off does it
// show the full text in a tooltip and sit above the card's full-size link, forwarding
// clicks to that link so the card still opens.
export function ClampText({
  text,
  lines,
  as: Component = 'p',
  className,
}: {
  text: string;
  lines: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [clipped, setClipped] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const measure = () => setClipped(element.scrollHeight > element.clientHeight + 1);
    measure();
    // Re-check when the card resizes and once web fonts change the line breaks.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const card = element.closest('.portfolio-card');
    if (card) observer.observe(card);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [text, lines]);
  const content = (
    <Component
      ref={ref}
      className={['clamp-text', className].filter(Boolean).join(' ')}
      style={{ WebkitLineClamp: lines }}
      data-clipped={clipped || undefined}
      tabIndex={clipped ? 0 : undefined}
      onClick={
        clipped
          ? () =>
              ref.current
                ?.closest('.portfolio-card')
                ?.querySelector<HTMLElement>('.portfolio-card__toggle')
                ?.click()
          : undefined
      }
    >
      {text}
    </Component>
  );
  // Always render the Tooltip (disabled when nothing is cut off) so the text element is
  // never swapped out; swapping would leave the ResizeObserver on a detached node.
  return (
    <Tooltip
      title={clipped ? text : ''}
      disableHoverListener={!clipped}
      disableFocusListener={!clipped}
      disableTouchListener={!clipped}
      placement="top"
      arrow
      enterTouchDelay={300}
      leaveTouchDelay={4000}
      slotProps={{
        tooltip: { className: 'clamp-text-tooltip' },
        arrow: { className: 'clamp-text-tooltip__arrow' },
      }}
    >
      {content}
    </Tooltip>
  );
}

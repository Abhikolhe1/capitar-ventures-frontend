import './filter-select.css';

import type { SvgIconProps } from '@mui/material/SvgIcon';

import { useState, useEffect } from 'react';

import Select from '@mui/material/Select';
import SvgIcon from '@mui/material/SvgIcon';
import MenuItem from '@mui/material/MenuItem';

export type FilterSelectOption = { value: string; label: string };

function Chevron(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 16 16">
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

function Check() {
  return (
    <svg className="site-select-check" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// A styled replacement for the native <select>, whose open list cannot be themed.
// Used by the Portfolio filters and the Blog sort control.
export function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
  hideLabel = false,
  className,
  menuAlign = 'left',
}: {
  id: string;
  label: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  /** Keep the label for screen readers only. */
  hideLabel?: boolean;
  /** Class for the wrapper, which holds the page-specific layout. */
  className?: string;
  /** Which edge of the trigger the open list lines up with. */
  menuAlign?: 'left' | 'right';
}) {
  const labelId = `${id}-label`;
  const [open, setOpen] = useState(false);
  // The page keeps scrolling while the list is open; close it instead of leaving it
  // floating over the content. Scrolling inside the list itself does not close it.
  useEffect(() => {
    if (!open) return undefined;
    // Ignore the few pixels of smooth-scroll momentum that can follow the opening click.
    const start = window.scrollY;
    const close = () => {
      if (Math.abs(window.scrollY - start) > 40) setOpen(false);
    };
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [open]);
  return (
    <div className={className}>
      <span id={labelId} className={hideLabel ? 'site-select-label--hidden' : undefined}>
        {label}
      </span>
      <Select
        id={id}
        labelId={labelId}
        value={value}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        displayEmpty
        variant="standard"
        disableUnderline
        className="site-select"
        IconComponent={Chevron}
        renderValue={(selected) =>
          options.find((option) => option.value === selected)?.label ?? String(selected)
        }
        // Name the control by its label only; the selected value is announced as its value.
        SelectDisplayProps={{ 'aria-labelledby': labelId } as React.HTMLAttributes<HTMLDivElement>}
        onChange={(event) => onChange(String(event.target.value))}
        MenuProps={{
          anchorOrigin: { vertical: 'bottom', horizontal: menuAlign },
          transformOrigin: { vertical: 'top', horizontal: menuAlign },
          marginThreshold: 16,
          disableScrollLock: true,
          // Wheel and touch scroll the list itself rather than the smooth-scrolled page.
          slotProps: {
            paper: {
              className: 'site-select-menu',
              'data-lenis-prevent': '',
            } as React.HTMLAttributes<HTMLDivElement>,
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value || '__all'}
            value={option.value}
            className="site-select-option"
          >
            <span>{option.label}</span>
            {option.value === value && <Check />}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}

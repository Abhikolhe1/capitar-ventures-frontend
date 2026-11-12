import type { SvgIconProps } from '@mui/material/SvgIcon';

import { useState, useEffect } from 'react';

import Select from '@mui/material/Select';
import SvgIcon from '@mui/material/SvgIcon';
import MenuItem from '@mui/material/MenuItem';

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
    <svg className="portfolio-select-check" viewBox="0 0 16 16" aria-hidden="true">
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
export function FilterSelect({
  id,
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  allLabel: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const labelId = `${id}-label`;
  const items = [{ value: '', text: allLabel }, ...options.map((text) => ({ value: text, text }))];
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
    <div className="portfolio-filter">
      <span id={labelId}>{label}</span>
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
        className="portfolio-select"
        IconComponent={Chevron}
        renderValue={(selected) => selected || allLabel}
        // Name the control by its label only; the selected value is announced as its value.
        SelectDisplayProps={{ 'aria-labelledby': labelId } as React.HTMLAttributes<HTMLDivElement>}
        onChange={(event) => onChange(String(event.target.value))}
        MenuProps={{
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
          marginThreshold: 16,
          disableScrollLock: true,
          // Wheel and touch scroll the list itself rather than the smooth-scrolled page.
          slotProps: {
            paper: {
              className: 'portfolio-select-menu',
              'data-lenis-prevent': '',
            } as React.HTMLAttributes<HTMLDivElement>,
          },
        }}
      >
        {items.map((item) => (
          <MenuItem key={item.value || 'all'} value={item.value} className="portfolio-select-option">
            <span>{item.text}</span>
            {item.value === value && <Check />}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}

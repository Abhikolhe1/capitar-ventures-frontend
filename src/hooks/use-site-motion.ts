import { useSyncExternalStore } from 'react';

const storageKey = 'capitar-motion';
const listeners = new Set<() => void>();
let reduced = false;
try {
  reduced = localStorage.getItem(storageKey) === 'reduced';
} catch {
  // Private browsing/storage restrictions must not prevent the site loading.
}
document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';

export function isSiteMotionReduced() {
  return reduced;
}

export function setSiteMotionReduced(value: boolean) {
  reduced = value;
  document.documentElement.dataset.motion = value ? 'reduced' : 'full';
  try {
    localStorage.setItem(storageKey, value ? 'reduced' : 'full');
  } catch {
    // Keep the control working for the current visit when storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}

window.addEventListener('storage', (event) => {
  if (event.key !== storageKey && event.key !== null) return;
  reduced = event.key === storageKey && event.newValue === 'reduced';
  document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
  listeners.forEach((listener) => listener());
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// This site's explicit choice controls its effects; the browser's native
// matchMedia API still reports the real OS preference to other consumers.
export function useSiteReducedMotion() {
  return useSyncExternalStore(subscribe, isSiteMotionReduced, () => false);
}

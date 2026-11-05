// Full motion is the site policy; ignore previous saved reduction choices.
document.documentElement.dataset.motion = 'full';
export function isSiteMotionReduced() {
  return false;
}
export function useSiteReducedMotion() {
  return false;
}

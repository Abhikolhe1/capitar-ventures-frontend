# Screen and animation work

Before changing a screen, layout, animation or responsive behavior, read
[the animation/device incident and validation guide](docs/ANIMATION_DEVICE_RELIABILITY.md).
Follow its implementation policy and select the checks relevant to the change.

- Share the site's motion setting through `src/hooks/use-site-motion.ts` and
  `html[data-motion]`. The approved behavior is full motion by default with a
  no visitor toggle (user-approved 5 November 2026). Do not independently disable
  screen effects using OS motion queries or change this policy without approval.
- Keep touch scrolling native and content usable in compact layouts and when
  images, autoplay, storage, canvas or optional browser APIs fail.
- Test both OS motion preferences, old saved reduction choices and the real system
  preference. `reducedMotion: null` removes Playwright's default motion override.
- Automated Chrome, a fixed viewport, emulated touch and WebKit on Windows do
  not prove that the user's existing browser/profile or physical device works.
- If asked to record the local browser, use the actual requested browser window
  and slow native scrolling. Do not substitute a test-browser video. If recording
  is blocked, report the blocker and keep that verification pending.
- Report tested conditions, skips and remaining device checks accurately. Never
  promise animation on every device or declare a user-reported failure resolved
  solely because an isolated test passed.
- Update the incident guide when a new device-specific cause or regression is
  discovered. Keep credentials, local `.env`, CMS data and generated recordings
  out of commits.

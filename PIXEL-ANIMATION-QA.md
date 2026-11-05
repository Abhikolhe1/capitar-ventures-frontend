# Pixel animation validation

Checked on 5 November 2026. These checks cover the local changes in
`src/pages/venture-debt/pixel-reveal.tsx`; they are not a claim of physical-device certification.

## Changes

### Older-device browser compatibility

The production build now targets Chrome 64+, Firefox 60+, Safari/iOS 12+ and
Chromium Edge 79+. These are build targets, not certified historical-browser results.
Device manufacturing year alone is not the support boundary: its installed browser
and OS must meet the target. Internet Explorer and browsers frozen below these
versions are outside this target.

- Vite legacy chunks and usage-based JavaScript polyfills are emitted, including
  polyfills for older browsers that already support JavaScript modules.
- Browser API polyfills load before React: IntersectionObserver, ResizeObserver,
  scroll options and older MediaQueryList change listeners.
- Browsers that do not recognize reduced-motion queries default to animation.
  The site's approved motion policy now enables animation by default, including
  when the OS requests reduction. The visitor can use **Reduce animations** to
  opt out. See [the incident guide](docs/ANIMATION_DEVICE_RELIABILITY.md) for the
  current policy, evidence boundaries and outstanding physical-device checks.
- Card sizing uses a percentage spacer rather than CSS aspect-ratio. Viewport
  height, sticky positioning, width and positioning rules have older-CSS fallbacks.

Validation: missing-API bootstrap and scroll/pixel animation tests passed in
Chromium and WebKit. A forced production SystemJS/legacy entry passed the same
test. This does not reproduce an actual historical JavaScript engine or device GPU.
The seven existing viewport/timeline/reduced-motion and selection checks passed.

Legacy build mechanism: https://vite.dev/guide/build#browser-compatibility

To test missing APIs and the compiled legacy entry (start `vite preview` on port
3039 for the latter):

```powershell
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3041'
npx playwright test tests/legacy-animation.spec.ts
$env:PIXEL_BROWSER='webkit'
npx playwright test tests/legacy-animation.spec.ts
Remove-Item Env:PIXEL_BROWSER
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3039'
$env:PIXEL_LEGACY_BUNDLE='1'
npx playwright test tests/legacy-animation.spec.ts
Remove-Item Env:PIXEL_LEGACY_BUNDLE
```

### Image lifecycle

- Wait for the card image to load before starting its reveal.
- Repaint the canvas at its current progress after viewport/orientation changes.
- Show the image directly if visibility observation is unavailable.
- Clear the overlay on image failure and honor the saved site motion preference.
- Support the older media-query change listener API.

## Repeatable checks

Results: ten Chromium touch/mobile cases and nine WebKit touch/mobile cases
passed, plus the existing signal-selection regression test. The 375px WebKit
replay case passed after moving frame sampling into the browser to avoid missing
the short animation during an automation scroll. Build and component lint passed.

Start the frontend on port 3041, then in PowerShell:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3041'
npx playwright test tests/pixel-reliability.spec.ts tests/pixel-reveal.spec.ts
$env:PIXEL_BROWSER='webkit'
npx playwright test tests/pixel-reliability.spec.ts
Remove-Item Env:PIXEL_BROWSER
```

The reliability suite covers Chromium and WebKit separately, touch input,
high-DPI mobile viewports, phone/tablet/landscape layouts, reverse entry,
orientation changes, a held image request, reduced motion, missing visibility
observation, and a Chromium CPU slowdown of 4x with rapid selection.

## Remaining physical-device checks

Use at least iPhone Safari, a lower-powered Android phone with Chrome,
and an iPad with Safari. WebKit on Windows does not replace iOS hardware testing.

1. Open `/venture-debt` with a cold cache and scroll normally to Four Signals.
2. Confirm the full card reveals in pixels and eventually has no white tiles.
3. Scroll away and back; confirm the reveal replays while the card is visible.
4. Rotate the device while the card is revealing and after it has finished.
   Confirm the card fits its container without stretched or leftover tiles.
5. Repeat on a slow connection and with rapid scrolling/selection.
6. Enable the device's reduced-motion setting: full site animation should still
   run by default. Select **Reduce animations** on the site: the complete card
   should appear without pixel animation. Select **Enable animations**, reload,
   and repeat the reveal. Confirm the visitor's site choice is preserved.
7. Switch to another app/browser tab and return; confirm the card remains usable.

Record the device, OS/browser version, and any failed step. The target is modern
supported browsers with a usable image fallback, not animation on every legacy device.

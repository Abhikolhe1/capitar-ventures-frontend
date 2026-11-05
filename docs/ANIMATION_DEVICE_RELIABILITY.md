# Animation and device reliability: incident and prevention guide

Recorded: 2026-11-05. Applies to the home page, venture debt page and future screens.
This is a living incident record and implementation/verification contract for
Codex, Claude and human contributors. Root `AGENTS.md` and `CLAUDE.md` point here.

## Incident

The user reported that animations did not work in the normal Chrome window on
the same PC where automated Chrome recordings appeared to work.

There were two independent problems:

1. **Product behavior depended on the OS preference.** Chrome reported
   `prefers-reduced-motion: reduce` on the PC. Separate JS and CSS checks disabled
   venture debt's pixel reveal, desktop pinned progression, smooth scrolling and
   page-color transitions. Some other homepage reveals continued, making motion
   behavior inconsistent across the site.
2. **The verification setup masked the problem.** Automated sessions used a fixed
   viewport and `no-preference` motion emulation. Some tests also jumped directly
   to scroll positions. Their recordings showed genuine rendering in a separate
   browser session, but did not establish normal mouse-wheel behavior in the
   user's existing Chrome profile. Presenting them as that proof was incorrect.

Before the fix, a separate Chrome diagnostic with motion emulation removed and
a 1440 x 730 CSS-pixel viewport reported OS reduction, a static signal panel,
a 547px track and no Lenis smoothing. Forcing `no-preference` made the panel
sticky, the track 2810px high and enabled smoothing. After the fix, the same
real-system diagnostic retained OS reduction while the site had a sticky panel,
a 2810px track and smoothing. These are diagnostic/test results, not observation
of the user's existing normal-profile window.

## Approved product behavior

The user requested animations to work on as many devices as practical. The
explicitly approved policy for this project is:

- Full motion is the site's default even when the OS requests reduced motion.
- A visible **Reduce animations** button switches to reduced motion;
  **Enable animations** restores full motion. Never remove this visitor choice.
- Save the choice under `capitar-motion`. It survives reloads and navigation,
  synchronizes across tabs, and works for the current visit when storage is blocked.
- This is a site-specific policy. Do not change Windows/browser preferences or
  falsify native `matchMedia` results to make the effects or tests work.
- Phones keep native touch scrolling. At compact widths or heights, use readable
  unpinned content and card reveals rather than forcing a desktop-sized sticky panel.
- Autoplay restrictions, unsupported APIs and media errors must leave usable
  content. Do not hide essential information behind a successful animation.

This full-motion default is an explicit project decision, not a general
accessibility recommendation for other products. Changes to it need an explicit
product decision and corresponding tests/documentation updates.

## Implementation contract for every new screen

1. Use `useSiteReducedMotion()` in React effects and
   `isSiteMotionReduced()` in event callbacks from `src/hooks/use-site-motion.ts`.
   Set the choice with `setSiteMotionReduced()`; do not add a second preference store.
2. CSS effects use `html[data-motion='full']` / `html[data-motion='reduced']`.
   CSS-in-JS can scope rules with `html[data-motion="reduced"] &`.
   Do not introduce direct `prefers-reduced-motion` gates for product effects;
   OS queries remain appropriate for diagnostics or browser-compatibility detection.
3. Dispose/rebuild timelines, observers, listeners and animation frames when the
   site choice or content changes. Explicit reduction must reveal content rather
   than freeze a hidden heading, card or canvas overlay.
4. Match JS and CSS breakpoints. Venture debt currently pins only at widths of
   at least 900px and heights of at least 640px. A compact layout is expected;
   a missing reveal, inaccessible row or blank image is not.
5. Reuse the compatibility bootstrap and existing visibility/image-loading
   safeguards. Keep canvas pixel ratio bounded, handle source/viewport changes,
   and do not consume a reveal before its image arrives.
6. Test user input paths: wheel, reverse scroll, touch selection, keyboard/anchor
   navigation as relevant. Programmatic scroll-position tests complement these;
   they cannot replace them.

## Validation before reporting success

For changes affecting motion or layout, select meaningful checks from this matrix.
For text-only changes, do not add redundant animation tests.

| Condition | Required evidence |
| --- | --- |
| OS normal and reduced motion | Full site motion remains available under both, without faking native preference queries |
| Site reduced/full choice | Live updates, no hidden content, saved choice, restore full motion |
| Real system preference | Use `page.emulateMedia({ reducedMotion: null })`; default Playwright contexts can emulate normal motion |
| Desktop wheel and reverse scroll | Active card/step changes; pixel reveal reaches completion |
| Narrow phone / touch / short landscape | Native scrolling, usable rows, card reveal and no horizontal overflow |
| Current Chrome, Firefox and WebKit | Record actual engine coverage and skips; WebKit on Windows is not an iPhone |
| Blocked storage / media or optional API failure | Site loads, controls work where possible, content stays readable |
| User's existing browser, if reported broken | Inspect that exact local URL/profile/window and reproduce with normal input |

Representative sizes: 390 x 844, 768 x 1024, 1366 x 600, 1440 x 730 and
1440 x 900 CSS pixels. Include the reported device size, zoom and input type;
these examples are not a universal device list.

Start the frontend and CMS using the README instructions. Then, as appropriate:

```sh
npm run build
npx playwright test tests/site-motion.spec.ts
npx playwright test tests/animation-preferences.spec.ts tests/venture-debt.spec.ts tests/venture-debt-devices.spec.ts tests/motion-refinements.spec.ts tests/page-color-flow.spec.ts
npx playwright test --config playwright.motion.config.ts
```

Install the required test engines with `npx playwright install firefox webkit`
if missing. The Chrome project uses installed Google Chrome. The dedicated
motion config records automated Chrome clips under ignored `test-results/`.
Those clips are labeled automated test evidence. Firefox's mobile-context
emulation is unsupported and is explicitly skipped; other Firefox checks run.

Set `PLAYWRIGHT_BASE_URL` when validating a different local/public origin. Verify
that requests and media load from the intended CMS too. A successful HTTP response
alone does not verify animation.

## Local-browser recording rules

When the user requests a recording of their device/local browser:

1. Use the existing requested Chrome window/profile and actual localhost or
   supplied tunnel URL. Do not silently replace it with a clean test profile.
2. Record the visible browser window/tab with a local recorder. Show enough
   browser context to identify the origin; avoid unrelated windows and private data.
3. Scroll slowly in small native wheel/touch increments, pause to show reveals,
   and reverse direction. Do not use `scrollTo` jumps, force motion preferences,
   or present an earlier/different session as the current local recording.
4. Inspect the saved video for visible content, understandable pace, actual
   animation and successful playback before handing it over.
5. If the window is minimized, permissions are pending, or the tool stops,
   report that exact limitation. Keep the requested local recording **pending**.
   Never substitute automated footage without the user's agreement.

## Verification status and remaining work

| Item | Status as of 2026-11-05 |
| --- | --- |
| Shared site motion policy and control | Implemented |
| Production build | Passed; existing unused-import and bundle-size warnings |
| Chrome regression run | 26 passed |
| Focused Chrome preference/touch/storage run | 7 passed |
| Chrome/Firefox/WebKit motion run | 15 passed, 1 unsupported Firefox mobile emulation skipped |
| Public tunnel real-system/native-wheel check | Passed in a separate automated Chrome session |
| Automated Chrome wheel reveal completion with no motion emulation | Passed; generated a separate approximately 6-second clip |
| Slow-scroll recording of the user's existing Chrome window | **Pending**: window was minimized and no such recording was captured |
| Physical iPhone/iPad and lower-powered Android validation | **Pending** |

Do not mark the pending rows complete from these automated results. Do not
claim support for every device. Build targets (Chrome 64+, Firefox 60+,
Safari/iOS 12+, Chromium Edge 79+) are compatibility targets, not certification
of those historical browser versions, physical hardware or GPU performance.

## Keep this record current

For each new device-specific issue, append: date, affected screen, local/public
URL type, browser/OS/version, CSS viewport and zoom, input type, native and site
motion preferences, reproduction steps, cause, fix, exact checks/results and
remaining physical-browser checks. Record no secrets or private browsing data.

# About Us source and verification

Source: [Desktop UI / About US](https://www.figma.com/design/Z3woTbcJz1KVV7ukDtBy6o/Capitar-Website?node-id=2424-3579), containing the supplied hero node `2424:3580`.

The design and assets were inspected and downloaded in the user's existing Chrome Figma tab. Figma MCP was not used for this implementation. The native `.fig` was also downloaded using **File > Save local copy** to inspect exact text, image-fill transforms, styles, and measurements. No design layers were edited. No screenshots, screenshot crops, redrawn maps, or newly generated replacement artwork are runtime assets.

## Downloaded assets

All paths below are relative to `public/assets/about/`. [figma-assets.json](../public/assets/about/figma-assets.json) records the exact source node, byte count, dimensions, SHA-256, and usage for every asset.

| File | Use |
| --- | --- |
| `neon-blue-glass-panel-corridor.png` | Original hero image fill, with the Figma crop and horizontal reflection |
| `hero-navy-overlay.png` | Hero navy overlay, including the native blur and clipping |
| `hero-bottom-fade.png` | Hero bottom fade |
| `mission-map.png` | Export of the actual layered mission map, including its source images, vector mask, and fades |
| `glowing-glass-map-of-india.png` | Original map background retained for provenance; incorporated in `mission-map.png` |
| `india-network-foreground-source.png` | Original map foreground retained for provenance; incorporated in `mission-map.png` |
| `journey-glass-growth.png` | Original luminous glass pillars with the Figma crop |
| `journey-navy-fade.png` | Journey bottom fade |
| `journey-blue-glow.png` | Blue light behind the milestones |
| `journey-cyan-glow.png` | Cyan light behind the milestones |
| `belief-waves.png` | Native belief-section waves and gradients |
| `team-source.png` | Original portrait sheet used with the actual Figma crop transforms |
| `bikramjit-source.png` | Original turban portrait used by the corresponding image-fill override |
| `team-red-light.png` | Native team-card red light |
| `team-white-highlight.png` | Native team-card white ring highlight |
| `team-shadow.png` | Native light team-card shadow |
| `team-navy-shadow.png` | Native dark team-card shadow |
| `linkedin.png` | Original 18px team social icon |
| `quote-decoration.svg` | Native quotation background waves |
| `quotation-mark.png` | Original quotation mark |

The two archive-extracted PNGs are unchanged image-fill bytes from the browser-downloaded native source. The other files are Figma image downloads or actual layer exports. Exported blur assets retain Figma's ancestor clipping; their exported dimensions therefore differ from the unbounded layer dimensions. The obsolete hero screenshots/crops, unrelated fund artwork, and old portrait cutouts were removed.

## Implementation

At 1441px, the content sections follow these native measurements:

| Section | Top | Height |
| --- | ---: | ---: |
| Hero | 0 | 738 |
| Mission | 738 | 698 |
| Journey | 1436 | 864 |
| Belief | 2300 | 735 |
| People | 3035 | approximately 1876 |
| Quotation | approximately 4911 | 445 |

The shared `MainLayout`, header, footer, `SectionBadge`, `ContentButton`, hero entrance timeline, section reveals, and site motion policy are reused. The About hero uses a header-color boundary at its actual edge, preventing a white header at the top of this fixed-height hero. Shared header/footer layout dimensions otherwise retain the site's existing behavior.

The source includes nine portrait slots, repeats names/portraits, spells the journey badge “The Journery”, and duplicates “Value beyond the capital.” as the fourth belief title. Those source details are retained. Only the first belief row supplies expanded copy; additional copy has not been invented. Team biography copy comes from the native component's hover state. No profile destination URLs are supplied, so the social artwork does not link to a guessed LinkedIn page.

## Verification and limits

- `npx tsc --noEmit`: passed.
- `npm run build`: passed; existing unused imports in `src/app.tsx`, legacy target notice, and bundle-size warnings remain.
- `npx playwright test --config playwright.about.config.ts`: **38 passed, 1 skipped**. Chrome, Firefox, WebKit; normal, reduced, and real-system motion preferences; saved reduction choice; native wheel and reverse scrolling; four responsive viewport sizes; touch and missing-artwork behavior. Firefox's unsupported mobile context is explicitly skipped.
- Desktop and phone renders inspected at 1441px and 390px. Asset loads, overflow, section dimensions, crops, and interactions checked. Automated renders are QA evidence and are not runtime assets.
- The Figma **Mobile UI** page (`1295:916`) is empty, verified in Chrome and in the native file. Narrow layouts adapt the desktop content; a pixel-exact mobile Figma comparison remains unavailable.
- Automated Windows WebKit is not a physical iPhone/iPad test. Physical-device validation remains pending under the existing project policy.

Final command results are reported in the task response. The follow-up adds the About Us backend described below. No deployment, merge, or push is part of this change.

## Files changed by this rebuild

| Path | Change |
| --- | --- |
| `src/pages/about-us/about-us-page.tsx` | Complete page replacement, native text and source assets, nine team slots, interaction states and shared reveals |
| `src/pages/about-us/about-us.css` | Native desktop dimensions and crop geometry; responsive reflow |
| `src/content/about-us.json` | Content transcribed from native text layers |
| `src/components/website/header.tsx` | About-specific header-color threshold; existing navigation changes preserved |
| `public/assets/about/` | Twenty source assets listed above; obsolete page artwork removed |
| `public/assets/about/figma-assets.json` | Source-node and asset integrity inventory |
| `tests/about-us.spec.ts` | Motion, wheel/reverse, responsive, touch, image failure and interaction checks |
| `playwright.about.config.ts` | Chrome, Firefox and WebKit test projects |
| `docs/ABOUT_US_FIGMA_IMPLEMENTATION.md` | Source inventory, validation and limitations |

The existing footer and route edits were not changed by this rebuild. Their prior uncommitted changes remain in the workspace.

## Follow-up: scroll motion and CMS

About sections are now direct main children, allowing the shared page-color canvas to discover every section. MainLayout accepts an optional main ref and class without changing other pages. The About hook reuses directional GSAP reveals with 48px text entrances and heading-child staggering; fixed original-artwork surfaces now follow the shared canvas color instead of moving independently; it rebuilds and cleans up after CMS changes. Full motion remains enabled for OS reduction and saved legacy choices. Touch remains native; no sections are pinned.

Frontend CMS files: src/services/about-us.service.ts and src/hooks/use-about-us.ts. The page reads published /api/about-us content, preserves Figma fallback on failure, refreshes on browser focus, validates media URLs and CTA destinations, supports custom team portraits and individual biographies, and honors intentional empty lists. Source crop geometry remains attached to the original portrait keys.

Backend files: src/api/about-us (single type, controller, route, service), src/components/about (hero, mission, journey, milestone, belief, principle, people, member, quote, artwork), src/seed-about-us.ts, src/index.ts, scripts/seed-about-us.cjs, scripts/verify-about-us.cjs, package.json, and generated Strapi types. Public access is read-only and forces published status and explicit relation population.

Local CMS setup: npm run seed:about-us seeds and publishes only when no draft or published About Us exists. It uploads the twenty source assets: mission map through the Mission media field, the other nineteen through the keyed Artworks list (including two retained source-fill assets). Existing editorial content is never overwritten. Edit Content Manager > Single Types > About Us; publish changes, then refresh/focus the frontend. Keep artwork keys unchanged when replacing media; custom individual portraits use the Team member Image field with an ordinary cover crop. Leaving that field empty restores the original Figma portrait/crop.

Backend verification uses a separate SQLite database and checks all six sections, all uploaded assets, seed idempotence, publishing, draft privacy, portrait/biography edits, empty lists and rejected public mutations. Frontend tests also sample actual intermediate artwork transforms/opacities and page-color changes during wheel input, in addition to responsive and content checks.

Follow-up validation: frontend and backend TypeScript checks and production builds passed; isolated backend verification passed; local seed/publish completed with nine team members and four milestones. Actual CMS-backed desktop (1441px) and phone (390px) renders had zero missing images, page errors or horizontal overflow, and retained the exact desktop section heights above. The initial cross-engine run passed 34 checks and skipped unsupported Firefox mobile emulation; a WebKit color-sample threshold expected more animation frames than native wheel scrolling supplies. The assertion now checks multiple distinct colors rather than frame rate; all three WebKit motion cases passed on the focused rerun. No application change was needed for that assertion.

## Artwork grading correction

The moving background entrances exposed the opaque image-fill rectangles against changing canvas colors. Four section-sized artwork surfaces now group the original mission, journey, belief and quote assets. Their opacity follows the shared canvas versus each section's native color, with a smooth fade out/restoration during handoffs in both directions. Background surfaces have no translation. Top/bottom source-edge masks match the Homepage approach; the journey source additionally feathers its side edges. Multiply/lighten compositing blends source backgrounds into the shared canvas. Text, cards and controls keep their independent reveals and interactions. No source images, crop geometry, content, section heights or CMS data changed in this correction.

The new regression checks verify fixed transforms, real intermediate opacity, multiple canvas colors and fully faded artwork at every light-blue handoff at desktop and mobile widths. CMS-backed 1441px and 390px renders still have no missing images, page errors or horizontal overflow. Native forward/reverse wheel checks in the existing Chrome profile include the reported quotation area. Frontend TypeScript and build passed with the pre-existing warnings; final cross-engine results are reported with this correction.

Artwork grading validation: full About Us suite passed 38 checks across Chrome, Firefox and WebKit; unsupported Firefox mobile emulation was skipped. TypeScript, ESLint for changed code, and production build passed. Separate Home/Venture Debt wheel smoke checks retained their shared canvas transitions. Existing Chrome profile forward/reverse wheel inspection confirmed the reported quote handoff. Physical mobile hardware remains untested.

## Capitar View: separate base and native vector decoration

Only the quotation section changes in this correction. Native frame 2424:3815 supplies the plain #0B0F2D base; its Filler Elements child 2424:3816 supplies the original vector artwork. QuoteArtwork renders the trusted downloaded SVG as inline vector markup, preserving its original lighten/plus-lighter groups against the shared page canvas. The quote no longer uses the raster-style artwork opacity surface, extra edge mask, or external-image compositing. Other About sections retain their accepted behavior.

Files: src/pages/about-us/quote-artwork.tsx, about-us-page.tsx, about-us.css, tests/about-us.spec.ts and this note. No source asset or backend data changes. The original CMS SVG is identified by content equality (normalized line endings); replacement CMS artwork remains a safe external image with the original decoration as failure fallback. Downloaded CMS markup is never injected.

Validation: TypeScript and changed-file ESLint pass. Twelve focused Chrome/Firefox/WebKit checks cover the vector/base separation, desktop/phone, both OS preferences and real-system preference, wheel/reverse inputs and the other accepted image-surface handoffs. Actual CMS-backed 1441px/390px renders retain section dimensions, zero overflow, zero missing images and no page errors. The real CMS source renders one inline SVG and zero flattened quotation images.
Production build also passed for the final quote-layer implementation; existing unused-import and bundle-size warnings remain.
Existing normal-profile Chrome verification also completed: native wheel reverse/forward through the quotation handoff shows the vectors directly over a continuous changing canvas, with no separate opaque quote image surface.

## Belief sticky sequence

The Belief now has a viewport-height sticky stage on fine-pointer desktops at least 900px wide and 700px high, provided its content fits. Each principle receives a 65vh scroll interval; the active accordion advances 01?04 and reverses with wheel direction. Selecting a principle scrolls to its interval. The shared background canvas and original Figma artwork remain in place. The heading/accordion entrance triggers follow the full track, so they cannot fade out halfway through the sticky hold.

Phones, tablets with a coarse primary pointer, short desktops, and content too tall for the viewport retain the original native accordion flow. The hook disposes/rebuilds on CMS content and breakpoint changes; zero/one-item lists never create a dead scroll track. Full site motion remains enabled under OS reduction and old saved preferences. Other About sections and backend content are unchanged.

Files: about-us-page.tsx, about-us.css, use-about-animation.ts, new use-belief-sticky.ts, and focused tests in tests/about-us.spec.ts. Source desktop section positions after Belief now include the intentional sticky scroll distance rather than the static Figma frame's 735px section length. Non-sticky/mobile layouts retain the prior section sizing.
Belief validation: TypeScript and production build pass; 12 targeted tests pass across Chrome, Firefox and WebKit, including full-page traversal with real-system motion and the sticky sequence under reduce/no-preference/system preferences. Automated CMS-backed first/last desktop steps and native-touch phone renders were visually inspected.

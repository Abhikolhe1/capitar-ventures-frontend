# Phase 2: Portfolio & Proof Points

## Investigation and source priorities

Figma supplied label `762:1133` belongs to `Section Container` (`762:1132`), inside the complete `Stats Overview Container` (`762:1073`). This is immediately after the 800px Hero in the Homepage UI / Capitar Option hierarchy. The following capital-efficiency section is outside this phase.

The Figma MCP Starter-plan call limit prevented further connector reads. Inspection continued in the actual Figma browser using the layer tree, Properties inspector, canvas selection and native exports. The complete section PNG/SVG references are saved in `scratch/phase2/figma-section.png` and `.svg`. They are QA references, never website backgrounds. The Mobile UI page (`1295:916`) has no layers. Smaller layouts therefore adapt the verified desktop design, with stacked metrics on phones and two columns on tablets.

| Area | Existing implementation | Issue | Action |
| --- | --- | --- | --- |
| Theme | MUI website theme, local LT Superior 400/500/600 | Light section needs its own colors; 700 currently maps to 600 | Add section tokens and the actual local Bold face; Hero 400/600 unchanged |
| Animation | Scoped GSAP Hero timeline with context cleanup | Hero selectors must not own Section 2; no existing counter hook | Keep distinct data attributes; add section-scoped ScrollTrigger counters |
| Components | MainLayout, ContentButton, independent Hero | No common section badge; HomePage only renders Hero | Add a small reusable SectionBadge and standalone section |
| Strapi | Strapi 5.52.3, published Homepage with explicit Hero component | Section 2 absent | Extend the same single type, public read populate, normalization and opt-in seed |
| Assets | Local assets + Strapi media | Connector capped | Export both individual Filler_01 SVG nodes through Figma UI |

## Verified design measurements

| Layer | Node | Measurements / styles |
| --- | --- | --- |
| Complete section | 762:1073 | 1440 x 685, y800 after Hero, clipped, #F8F9FA |
| Statement stack | 762:1132 | x326 y84, width787.75, height269, vertical auto layout, gap40; 908px description overflows its centered stack |
| Badge container | 762:1133 | 249 x 29, radius500, inner 1px #CC2334 border, 8px vertical / 12px horizontal padding |
| Badge text | 762:1134 | PORTFOLIO & PROOF POINTS; LT Superior Medium 16, 140%, #401E17; actual glyph box11px high |
| Statement | 762:1135 | 908 x 200; LT Superior Regular 50/50, centered, tracking0; #121212; final phrase at 60% opacity |
| Right grid | 762:1103 | x1007 y0, 424 x 350; individual exported SVG, includes original gradients/opacity |
| Left grid | 762:1074 | x-40 y0, 424 x 350, original rotation -180deg; individual exported SVG preserves appearance |
| Metrics row | 762:1136 | x70 y439, 1300 x 140, horizontal space-between |
| Metric values | 762:1138 / 1142 / 1146 / 1150 | 30 + / ₹400 cr+ / 50% + / <2 wks; 100px LT Superior Bold700, line-height100%, tracking-4%; suffix Regular72; whitespace spans vary70/80.65 |
| Metric columns | Stat Container x4 | 182 / 334 / 260 / 266px; 86px spaces between columns; value line100px, gap12px, label28px |
| Metric labels | Stat Description x4, third 762:1147 | Companies Backed / Capital Deployed / First Institutional Partner / Term Sheet to Disbursement; Medium500 20px/140%, tracking2%, #CC2334 |
| Dividers | Vector45 /46 /47 | x295 /715 /1061; y445..573; 1.5px #E7BFC3 at30% opacity |
| Number gradient | inspected in exported vector reference | #0B0F2D at y454 to transparent #11054A at y597; suffix treatment also uses #11054A to transparent |

Statement: “We work alongside early-stage founders with non-dilutive capital, experienced advice and a clear view of what the business needs next.” The phrase “a clear view of what the business needs next.” is muted. There are no company cards, photographs, CTA, carousel controls or navigation in this section. Only the two grid decorations require media assets; type and separators remain native HTML/CSS.

## Framer behavior audit

`scripts/audit-phase2-reference.mjs` inspects the complete live page at1440 and390, recording before/entry/partial/complete/hover/click/re-entry screenshots and DOM observations. Evidence is in `scratch/phase2/framer-*`; counter sampling is in `framer-counter-timing.json`.

The live prototype differs materially from Figma: proof metrics come first in its About section; they are30+, ₹400cr,10yrs and17+, followed by About Capitar and different copy. The exact Figma badge/statement combination is absent there. Figma wins for content, order, colors and geometry. Only behavior shared by the actual proof metrics is transferred: counter values increase once when their metric is sufficiently visible; there is no metric opacity/translation/stagger, hover transform, click navigation, carousel, or pinned proof row. Later sticky word-color About copy belongs to different content and is not invented for the Figma statement. No badge/heading entrance is claimed as a prototype match.

Desktop metrics begin outside the viewport at y960. At scroll61 their top is899 and values remain0. At scroll445..460 (top515..500), the first values advance, with the larger400 counter around397 in the middle capture before reaching400. The phone metrics enter separately; those below the viewport remain0 until scrolled into view. Re-entry does not reset completed counters. Fine samples show a settling count-up rather than a digit flip. GSAP timing/easing is an approximation fitted to observed progression, not an exposed Framer authoring value. Background and metric containers remain static.

## Implementation plan

1. Export the two actual grid SVGs; keep full-section exports exclusively as QA references.
2. Add `homepage.portfolio-proof-points` and repeatable `homepage.proof-metric` components; populate them in the existing endpoint and seed only missing Section 2 content.
3. Normalize the data into independent frontend types; keep optional/disabled sections safe and retain a verified local fallback.
4. Compose Section 2 after the Hero. Use native text, semantic metrics, scoped styles and a reusable badge.
5. Count once per metric with GSAP/ScrollTrigger, clean up Strict Mode contexts, preserve final accessible text and reduced-motion readability.
6. Compare desktop against the exported1440x685 reference, test all requested responsive widths, CMS changes/visibility/fallback, scroll/refresh/reduced motion and Phase1 regressions. Record actual results below.

## Implementation files

Frontend paths are relative to `capitar-ventures-frontend`:

| File | Responsibility |
| --- | --- |
| `src/sections/home/portfolio-proof-points/portfolio-proof-points-section.tsx` | Independent MUI section, responsive statement/metrics, original background media, semantic section label |
| `src/sections/home/portfolio-proof-points/proof-metric.tsx` | Semantic dt/dd metric, proportional suffixes, static accessible final value, reserved number width |
| `src/sections/home/portfolio-proof-points/use-portfolio-animation.ts` | Scoped once-only viewport counters, GSAP matchMedia/context cleanup, reduced-motion final values |
| `src/components/website/section-badge.tsx` | Reusable badge with text, ref and color overrides |
| `src/pages/home/home-page.tsx` | Composes the new independent section after Hero |
| `src/services/homepage.service.ts` | Same two CMS requests, normalizes decimal numbers/media, isolates invalid optional section from Hero |
| `src/types/homepage.ts` | ProofMetricContent and PortfolioProofPointsContent models |
| `src/content/homepage.json` | Exact verified fallback and shared seed content |
| `src/theme/website-theme.ts` | Light section design tokens |
| `src/theme/website-fonts.css` | Actual Bold700 face; existing Regular/Medium/SemiBold preserved |
| `public/assets/fonts/LTSuperior-Bold.ttf` | Designer font already available in the downloaded project font source/OFL |
| `public/assets/capitar/proof-grid-left.svg`, `proof-grid-right.svg` | Actual individual Figma decoration exports; root sizes384x350 /424x350 preserved |
| `src/components/website/header.tsx` | Minimal compatibility change: navy header background once it reaches light content; Hero stays transparent |
| `tests/portfolio-proof-points.spec.ts` | Published CMS data, all seven viewport widths, counter lifecycle, optional/invalid/disabled data |
| `tests/hero-viewport.spec.ts` | Hero still one viewport; page now intentionally extends below Hero |
| `scripts/audit-phase2-reference.mjs` | Reproducible Framer scroll/hover/click/mobile evidence capture |
| `PHASE2-REPORT.md` | Design/prototype audit, implementation and validation record |

Backend paths are relative to `capitar-ventures-backend`:

| File | Responsibility |
| --- | --- |
| `src/components/homepage/portfolio-proof-points.json` | Optional Homepage component: enabled, label, heading, muted phrase, two image media fields, repeatable metrics |
| `src/components/homepage/proof-metric.json` | Nonnegative numeric value, prefix, valueSuffix, suffix and required label |
| `src/api/homepage/content-types/homepage/schema.json` | Adds portfolioProofPoints to existing single type |
| `src/api/homepage/controllers/homepage.ts` | Explicitly populates published proof metrics/backgrounds alongside existing Hero |
| `src/seed.ts` | Opt-in seeding adds missing Section2, preserves existing Section2; does not replace Hero fields |
| `types/generated/components.d.ts`, `types/generated/contentTypes.d.ts` | Regenerated Strapi schemas |
| `scripts/verify-phase2.cjs` | Actual published update/visibility/media/order and restore checks |

No dependency was added. GSAP ScrollTrigger comes from the existing GSAP package. No portfolio cards or later homepage sections were added.

## CMS editing and runtime

Running frontend: http://localhost:3039/#portfolio-proof-points. Strapi admin: http://localhost:3035/admin.

Edit Content Manager > Homepage > Portfolio & Proof Points. `value` is numeric for count-up, `prefix` precedes it (for example ₹ or <), `valueSuffix` uses the bold number treatment (for example %), and `suffix` uses the smaller regular type (for example cr+). Reorder metrics through Strapi. Save and Publish; refresh the frontend or return focus to retrieve updates. Enable/disable uses the component's enabled field. Media remains managed in Strapi's media library.

GET `/api/homepage` returns published Hero plus portfolioProofPoints with metrics and both backgrounds in one response. GET `/api/global` remains unchanged. No new public writes or per-metric HTTP requests were added. A pre-migration local SQLite backup exists at backend `.tmp/data.phase2-before.db`. The approved backend restart loaded new schemas on3035. Exact local seed is published and verified through the live API. Strapi may regenerate component row IDs on publication; all original Hero content/media values were compared with the pre-change snapshot and preserved.

## Visual evidence and discrepancy fixes

| Evidence | Path |
| --- | --- |
| Full Figma reference | `scratch/phase2/figma-section.png` and `.svg` |
| Framer desktop/mobile stages | `scratch/phase2/framer-{1440,390}-{before,enter,partial,middle,complete,hover,page-bottom}.png` |
| Framer DOM/timing observations | `scratch/phase2/framer-observations.json`, `framer-counter-timing.json` |
| Completed desktop from live CMS | `scratch/phase2/local-counter-complete.png` |
| Local before/partial stages | `scratch/phase2/local-before.png`, `local-counter-partial.png` |
| Header regression evidence | `scratch/phase2/local-header-over-proof.png` |
| Fallback at all widths | `scratch/phase2/implementation-{1440,1280,1024,768,430,390,375}.png` |
| Live CMS at all widths | `test-results/proof-{1440,1280,1024,768,430,390,375}.png` |

Compared the actual1440x685 completed rendering against the exported Figma image: statement line wrapping, muted phrase,84px top space,40px badge gap,86px metric gap,439px metric start and106px bottom space align. The exported left grid is384px wide because the original424px layer extends40px beyond the clipped section. It is used at its exported root width with no extra crop. Corrected the initial badge width and centered metric values to Figma's249px badge and left-aligned value geometry. Numbers keep width reserved during count-up. A first mock-data screenshot used relative media paths normalized against CMS; final fallback and live-CMS screenshots were recaptured with every asset loaded.

## Actual verification

- Backend production build passed, including TypeScript and admin build.
- Frontend production build passed, including TypeScript and Vite. Existing unused Fab/Iconify warnings and large bundle warnings remain outside this phase.
- Targeted ESLint on all new/changed TSX and normalization files passed with no errors/warnings.
- Full Playwright suite: **12 passed**, including all Phase1 video/fallback, responsive Hero, header direction, reduced motion, mobile menu/focus, CMS outage, delayed content and entrance ordering regressions plus3 Section2 tests.
- Actual backend `node scripts/verify-phase2.cjs` passed: published text/visibility changes and restore, media relationships, ordering and preserved Hero. Live GET after restore returns exact seeded content.
- Responsive screenshots checked at1440,1280,1024,768,430,390,375; all assets loaded, no horizontal overflow; desktop height685px at1440.
- Counter re-entry/refresh, reduced-motion readability, disabled sections, missing optional media/text and malformed section data passed browser checks; no page errors observed in responsive test.
- Header update tested via existing down/up test; direct Chrome headless captures recorded the complete section and counter stages. The extension-based final browser check timed out; Playwright Chrome provided the runtime evidence.

## Remaining limitations

Figma connector quota was exhausted, but native browser Properties inspection and actual asset/reference exports enabled implementation. No mobile Figma layers exist; mobile is an explicitly documented adaptation retaining Figma content/order. The supplied Framer page does not contain the exact Figma section composition, so no invented badge/heading animation is attributed to it. Counter duration/easing is fitted from observations, not a claimed exact authoring setting. It is not meaningful to test carousel/hover navigation for metrics: the references show no such interaction. No external deployment was requested or performed.

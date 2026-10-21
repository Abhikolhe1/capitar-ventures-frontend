# Phase 4 — The Capitar Difference

Implemented the verified fourth homepage section using the browser-only Figma workflow explicitly authorized by the user. The matching Strapi content is published locally. Frontend runs at http://localhost:3039 and Strapi/admin at http://localhost:3035/admin.

## A. Section identification

The approved homepage is [Capitar Option `762:923`](https://www.figma.com/design/Z3woTbcJz1KVV7ukDtBy6o/Capitar-Website?node-id=762-923), within Homepage UI `1232:997`. Capital Efficiency ends at y2435. Its immediate successor is **THE CAPITAR DIFFERENCE**, headed **Think like founders. / Solve like partners.** This differs from the brief's tentative Why Venture Debt name. The brief explicitly requires implementing the actual next section, so no design variants were mixed.

The section is composed of five sibling frames, not one separate section parent:

| Figma node | Role | Verified geometry |
|---|---|---|
| `810:1051` | Sticky introduction | x326/y2435,788×538 |
| `810:1055` | 01 Seed to Series B Coverage | x70/y2904.99,366×440 |
| `810:1078` | 02 Custom-Structured Solutions | x70/y3428.62,366×440 |
| `810:1101` | 03 Founder-First Mindset | x1005.46/y3047.69,366×440 |
| `810:1124` | 04 High-Velocity Execution | x1005.46/y3555,366×440 |

Our independent wrapper covers y2435–4106.65 (1671.65px at matching desktop width). The subsequent component `788:848` begins at4106.65 and was not implemented.

## B. Design inspection and assets

Detailed investigation, layer measurements and limitations are in [PHASE4-AUDIT.md](PHASE4-AUDIT.md).

- Background #F8F9FA; centered221×28 badge with red outline and #401E17 text.
- Heading `762:1155`: LT Superior Regular400,50px,100% line height,0% tracking, two explicit lines. Existing local fonts reused.
- Supporting copy: “Combining a founder mindset with custom-tailored capital structures.”
- About Us pill: navy126×42, white34px arrow circle and exact exported navy arrow. **Disabled by the user's explicit request until About is built.**
- Cards: original #0B0F2D background with blue glow/ring artwork,21.0929px radius,2.10929px #F0F0F0 border and four blue shadow layers.
- Content group `810:1141`:303.81×370.6 at31.1/34.7, space-between. Illustration122.61×108.
- Title `810:1145`: LT Superior Semi Bold600,32px,110% line height,-2% tracking. Paragraph `810:1146`: Regular400,18px,140%,0% tracking. Number `810:1144`: Semi Bold600,24px, cap-height trim with17px bounds.

The user's existing Figma tab was inspected directly. Native SVG exports were downloaded through Figma's Export controls. `scripts/export-phase4-assets.ps1` isolates the original background/arrow and each illustration's exact image crop; `scripts/convert-phase4-assets.mjs` optimizes the cube artwork using the existing backend sharp dependency. No section/card screenshot or outlined text is rendered by the website.

Website assets in `public/assets/capitar/`: `difference-card-background.svg`, `difference-arrow.svg`, and `difference-art-1.webp` through `difference-art-4.webp` (327×288 each). Together approximately62KB. All four distinct cube variants are preserved, lazily loaded and CMS-editable. Artwork keeps its original ratio and meaningful alternative text; failed optional images disappear safely. No temporary Figma asset URL is in application code.

Comment #5 was opened, including its replies: vertical scrolling, subtle glass treatment, larger icons. Its anchor led to an empty canvas region, so attachment to this particular section could not be verified. It was not used to override the approved opaque navy card design. No generic glass/stacking effect was invented. The Mobile UI page `1295:916` was opened and is empty; there is no matching mobile frame there. Tablet/phone layouts are documented adaptations.

## C. Motion and interactions

Real Chrome inspection of [Framer](https://daily-shallot-076239.framer.app/) at1440/390 captured previous-section exit, entry, heading/card reveal, mid-scroll, completion, reverse scroll and pointer states. The corresponding Why us section has different copy but the same central sticky introduction and independent side cards.

Observed behavior:

- Intro sticks at top0. Cards pass through normal vertical document flow and remain separate; no stacking, replacement, scale or card pinning.
- Heading spans share opacity.001→1, Y20→0 and blur8→0. Card titles use blur5, paragraphs blur2 with the same20px movement; illustrations fade independently. Sampled word spans share the same progress, so no character/word stagger is added.
- Source reveal settles over roughly1.8–2seconds. At a sampled1100ms stage, heading opacity was~.943; subsequent stages reached~.998 then1. Exact Framer spring parameters are not exposed.
- Completed entrances do not disappear on reverse scrolling. There is no observed informational-card navigation or hover action.

Implementation uses scoped GSAP/ScrollTrigger opacity/Y20/blur reveals, fitted2s expo.out timing with `top 92%` element-relative triggers. Completed elements retain their state on focus-driven CMS refresh. GSAP context cleanup handles Strict Mode and unmount; fonts trigger a guarded measurement refresh. CSS handles sticky positioning and its section boundary, avoiding artificial pin spacers and document-offset calculations.

Desktop uses the Figma staggered side-card placement. At1024/768 the intro is unpinned and cards form two columns; phones use a single ordered flow. The explicitly requested sticky layout and reveals stay active under either system motion setting, consistent with the hero. This avoids overlapping text on smaller screens.

Figma's interactive prototype opened the approved neon Hero variant, but its canvas did not advance with wheel scrolling. Prototype transitions beyond that entry remain unverified. Sticky positioning was independently confirmed in Figma's actual properties panel and against the scrolled Framer reference.

Motion evidence: `scratch/phase4/framer-motion.json`, source stage PNGs, `local-motion.json` and local initial/middle/complete/scroll/reverse PNGs. Scripts remain in the repo for repeatable capture.

## D. Architecture and files

New frontend section:

- `src/sections/home/capitar-difference/capitar-difference-section.tsx`: independent section, introduction, responsive card flow and homepage position.
- `difference-card.tsx`: typed informational card, original artwork and safe optional media.
- `use-difference-animation.ts`: section-scoped reveals and cleanup.

Existing files extended: `src/types/homepage.ts`, `src/services/homepage.service.ts`, `src/content/homepage.json`, `src/pages/home/home-page.tsx`, `src/theme/website-theme.ts`, `src/components/website/content-button.tsx`. The shared button gains an optional appearance prop; default Hero behavior/styles are preserved. Existing SectionBadge and the shared useHomepage fetch are reused. No additional API calls per component or animation dependencies were added.

New verification: `tests/capitar-difference.spec.ts`, `scripts/audit-phase4.mjs`, `audit-phase4-motion.mjs`, `capture-phase4.mjs`, `capture-phase4-motion.mjs`, `export-phase4-assets.ps1`, `convert-phase4-assets.mjs`. Source/reference evidence stays in ignored scratch, not the runtime bundle.

Backend files: Homepage schema/controller, `src/seed.ts`, generated content/component types; new `src/components/homepage/capitar-difference.json`, `difference-card.json`, `scripts/verify-phase4.cjs`.

## E. Strapi integration

Content Manager → **Homepage → capitarDifference**. Edit and publish through http://localhost:3035/admin.

`homepage.capitar-difference` fields: enabled, sectionLabel, heading, description, existing shared.link CTA, cardBackground media and ordered repeatable items. Each `homepage.difference-card` contains number, title, description and image. No fabricated metrics or unrelated fields.

GET `/api/homepage` returns published content with explicit CTA/background/items.image population. Normalization remains in the existing typed service, isolates invalid optional data and accepts safe URLs only. Disabled content hides; missing descriptions/media, empty lists, loading delays and API failure are handled. Existing fallback JSON includes exact verified copy/assets for outage rendering.

The opt-in seed (`CAPITAR_SEED=true`) adds only a missing section and uploads assets by filename; existing authored sections are preserved. Before schema migration, SQLite was backed up to backend `.tmp/data.phase4-before.db`. The local section is published and its CTA remains disabled. Runtime database/uploads are ignored; other environments need seed/content publication after deploying the schema.

Example structure:

```json
{
  "capitarDifference": {
    "enabled": true,
    "sectionLabel": "THE CAPITAR DIFFERENCE",
    "heading": "Think like founders.\nSolve like partners.",
    "cta": { "label": "About Us", "enabled": false },
    "items": [
      { "number": "01", "title": "Seed to Series B\nCoverage" },
      { "number": "02", "title": "Custom-Structured\nSolutions" },
      { "number": "03", "title": "Founder-First\nMindset" },
      { "number": "04", "title": "High-Velocity\nExecution" }
    ]
  }
}
```

## F. Verification and comparisons

[Original native Figma reference](scratch/phase4/figma-section.png) is rendered from the exported SVG solely for comparison. Implementation screenshots from published CMS were captured and visually reviewed at [1440](scratch/phase4/implementation-1440.png), [1280](scratch/phase4/implementation-1280.png), [1024](scratch/phase4/implementation-1024.png), [768](scratch/phase4/implementation-768.png), [430](scratch/phase4/implementation-430.png), [390](scratch/phase4/implementation-390.png), [375](scratch/phase4/implementation-375.png).

Corrected desktop column spacing, cap-height number bounds, phone title sizing, description wrapping around custom-tailored, exact pill dimensions and original image proportions. No horizontal overflow or clipped headings/paragraphs at tested widths. Introduction uses a minimum height so longer CMS copy can grow. All website images were verified nonempty on disk and decoded from published Strapi URLs with correct rendered slots/proportions.

Actual checks:

- Frontend production build/TypeScript: passed; scoped ESLint: passed. Existing app.tsx unused Fab/Iconify and large-chunk warnings remain.
- Backend production build, generated Strapi types, final `tsc --noEmit`: passed.
- Full Playwright suite: **20 passed in2.0min**, including all16 prior Header/Hero/video/Portfolio/Capital tests plus4 new section tests. The final section checks were rerun after layout refinement:4 passed.
- New tests verify published API fields, media HTTP responses/decoding, all7 widths, section order, desktop1671.65px span/440px cards, disabled About button, sticky movement/release/reverse, completed reveal retention through refresh, CMS text/reorder/empty lists/disabled/invalid data, safe configurable CTA, reduced motion, mobile reload and API/image failure.
- Sticky release was tested with a temporary test-only scroll spacer because no future section is implemented; it is not part of application code.
- `scripts/verify-phase4.cjs` passed real published CMS edit/disable/reorder/optional-media checks. Deep comparisons confirmed Hero, Portfolio and Capital content/media associations preserved; test edits restored in finally.
- Baseline screenshot and JS error inventory were captured before edits. Visual comparison found no material previous-section layout change. A raw Portfolio/Capital image comparison is not pixel-identical (mean channel difference1.93/255,4.77% of channels differing>10); no claim of pixel-identical rendering is made. Existing section code is unchanged and its functional/geometry regressions pass.
- Local frontend, Strapi/admin and API return HTTP200. Finished section was also directly checked in the user's Chrome: all4 original illustrations and all background images loaded from Strapi.

## G. Limits and delivery state

Why Venture Debt is outside this verified fourth-section scope. No future section or About route was added. About Us is intentionally disabled as the user requested.

No matching mobile Figma variant exists on the provided Mobile UI page. Figma prototype scrolling did not advance, and comment #5's attachment could not be established. Those limitations are explicit; desktop visual values/assets and Framer motion behavior were independently verified. Exact source spring timing and raster antialiasing/grain are not claimed as identical.

Both local projects remain running. Port3039 was initially an old production preview; it now runs the actual frontend dev server. Phase4 changes are local and uncommitted; they have not been pushed to GitHub.


Scroll behavior correction (2026-10-21): The actual Chrome browser reports reduced motion, which previously disabled both desktop sticky positioning and reveals. Removed that opt-out for this explicitly requested motion. Verified live at 1536px: intro Y stayed 0 while first-card Y changed from -527.8 to -123.8 across a 404px reverse scroll. Five targeted browser tests pass, including sticky/release/reverse/reveal under both motion settings, seven responsive widths, and CMS/failure cases. Frontend production build passes with existing app.tsx unused-import and bundle-size warnings.

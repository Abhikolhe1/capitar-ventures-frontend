# Phase 3 — Capital Efficiency

Implemented the actual next Figma section after Portfolio & Proof Points, as explicitly selected by the user. The original brief's About-specific content is outside this approved target.

## A. Design inspection

Source: [Figma section 767:4181](https://www.figma.com/design/Z3woTbcJz1KVV7ukDtBy6o/Capitar-Website?node-id=767-4181). Inspected in Figma's browser UI, including native PNG/SVG exports and nested text properties. The established homepage variant places Proof Points `762:1073` at y800, height685; Capital Efficiency follows directly at y1485.

| Verified node | Layer / geometry | Implementation |
|---|---|---|
| `767:4181` | Stick Banneer,1441×950, background #0B0F2D | CapitalEfficiencySection |
| `767:4182` | Capitar Decision Container,532×196, x454.5/y71.94, vertical gap24 | Centered section introduction |
| `767:4183` | Decision Details Container,524×150, gap21 | Badge and heading |
| `767:4186` | Decision Header,487.06×100 | Semantic h2 with two explicit lines |
| `767:4188` | Facts Container,1317×564, x61.5/y313.19;3 columns/2 rows;20px gaps | Responsive CSS grid using MUI Box |
| `767:4189` | Fund Growth Container,425.67×272, radius12, row1/column1 | Accelerate growth card |
| `767:4190` | Glossy Blue Dashboard Slider 1 | Original chart raster layer |
| `767:4191` | Growth Details Container,232×84, x23/y24, gap10; child text extends to intrinsic bounds | HTML title and description |
| `767:4192` | Growth Header,285.1×30 | LT Superior Regular400,30px,100% line height,0% tracking |
| `767:4193` | Growth Description,273.26×44 | LT Superior Regular400,16px,140% line height,0% tracking |
| `767:4194` | Growth Stats Container | Original profit annotation/chart details |
| `767:4198` | Growth Stats Header | Original blue icon |
| `767:4202` | Reduce Dilution Container,425.67×272 | Protect your cap table card |
| `767:4215` | Fund Opportunity Container,425.67×564, spans2 rows | Capitalize on momentum card |
| `767:4223` | Fact Item Container,871.33×272, spans2 columns | Maximize runway card |
| `767:4254` | Filler Elements,1440×720 | Original decorative ring/glow layers |

Heading: LT Superior Regular400,42px,120% line height,-2% tracking, white and centered: “Fuel growth.” then “Protect your cap table.” Description is white at80% opacity. Badge native bounds186×28 with #D9D9D9/70% stroke. Card fills are white, titles #193969, descriptions #193969/80%; icons42×42 with12px corners and original blue radial gradients. The existing LT Superior font files are reused.

No CTA, About copy, trust counter, or additional homepage section belongs to this frame. No matching completed mobile/tablet variant was found. Adaptations use2 columns at tablet widths and a single column on phones, retaining original artwork proportions and reading order.

## B. Animation inspection and implementation

[Framer reference](https://daily-shallot-076239.framer.app/) was inspected in real Chrome at1440/390 through scroll positions and hover states. Its About layout differs from this Figma variant. Its About heading has sticky, scroll-linked word-color progression; that effect is not transplanted into the unrelated Capital Efficiency heading.

The corresponding Fund Growth / Reduce Dilution / Extend Runway benefit group starts at opacity0 and translateY15px. At an observation450ms after entering, opacity was approximately.875 and Y1.87px; it subsequently reaches1/0. No card pinning, parallax, image video, separate image movement or navigation was observed. Saved source observations: `scratch/phase3/framer-benefits.json` and screenshots.

Capital cards use one-time scoped GSAP opacity/15px reveals,900ms power3.out, when their top reaches92% of the viewport. Duration/easing/trigger are fitted to the observed behavior; they are not claimed as extracted Framer configuration. The heading/background remain stationary. Cards do not replay on scroll reentry or identical focus-driven CMS refresh. Cleanup uses gsap.context/matchMedia; reduced motion leaves cards fully visible. Content/font changes refresh trigger measurements without replaying completed cards.

Local partial, complete and reentry motion evidence is saved by `scripts/capture-phase3-motion.mjs` in `scratch/phase3/motion.json` and associated desktop/mobile/reduced-motion screenshots.

## C. Architecture and assets

New standalone section files:

- `src/sections/home/capital-efficiency/capital-efficiency-section.tsx`
- `src/sections/home/capital-efficiency/capital-benefit-card.tsx`
- `src/sections/home/capital-efficiency/use-capital-animation.ts`

Homepage composes this section below Portfolio. Existing useHomepage/service remain the sole content loader. Typed normalized content isolates an invalid optional section from Hero/Portfolio. SectionBadge is reused with optional minWidth/fontWeight props; previous defaults are preserved. Capital colors are centralized in websiteTokens. No dependencies were added.

Other frontend changes: `src/types/homepage.ts`, `src/services/homepage.service.ts`, `src/hooks/use-homepage.ts`, `src/content/homepage.json`, `src/pages/home/home-page.tsx`, `src/theme/website-theme.ts`, `src/components/website/section-badge.tsx`, `tests/homepage.spec.ts`, new `tests/capital-efficiency.spec.ts` and the Phase3 investigation/capture/export scripts. The preexisting uncommitted Hero entrance changes and Phase1 report are preserved.

Original Figma layers were separated from the native SVG export, not redrawn. Website assets in `public/assets/capitar/`:

- `capital-background.svg`: original decorative ring/glow vectors.
- `capital-{growth,dilution,momentum,runway}-icon.svg`: original vector icons.
- `capital-growth-art.webp`1063×464, `capital-dilution-art.webp`849×435, `capital-momentum-art.webp`1135×996: high-resolution original raster-backed illustrations.
- `capital-runway-art.svg`480×204: original vector illustration and annotations.

`scripts/export-phase3-assets.ps1` extracts only illustration/icon/background layers and prunes unused SVG definitions; `scripts/convert-phase3-assets.mjs` uses the existing backend sharp dependency to optimize the three raster-backed assets. The site never renders a complete-section or complete-card screenshot. Export references are in ignored `scratch/phase3/figma-capital.png` and `.svg`.

All headings and descriptions are editable HTML. Financial numbers embedded in the original illustrations remain part of editable media, with meaningful CMS alternative text. They are illustrative design labels, not newly invented company KPIs. Images below the fold load lazily; intrinsic dimensions reserve media space. Failed optional images disappear without broken-image icons.

## D. Strapi

Admin: [http://localhost:3035/admin](http://localhost:3035/admin). In Content Manager → Homepage, edit **capitalEfficiency**, then publish.

Homepage gains optional single component `homepage.capital-efficiency`: enabled, sectionLabel, heading, description, backgroundImage and repeatable ordered benefits. Each `homepage.capital-benefit` contains title, description, layout (standard/wide/tall), artworkWidth (standard-card illustration percentage), icon and artwork. Original visual roles remain stable while entries can be reordered.

GET `/api/homepage` explicitly populates background and each benefit's icon/artwork, and forces published content. Existing Global/Hero/Portfolio fields remain intact. The frontend normalizer handles absent descriptions/media, empty lists, disabled content, invalid optional sections, loading delays and API outage fallback.

Example published content:

```json
{
  "capitalEfficiency": {
    "enabled": true,
    "sectionLabel": "CAPITAL EFFICIENCY",
    "heading": "Fuel growth.\nProtect your cap table.",
    "description": "Scaling fast shouldn’t mean giving away too much of your company.",
    "benefits": [
      { "title": "Accelerate growth", "layout": "standard", "artworkWidth": 93.66 },
      { "title": "Protect your cap table", "layout": "standard", "artworkWidth": 74.83 },
      { "title": "Maximize runway", "layout": "wide" },
      { "title": "Capitalize on momentum", "layout": "tall" }
    ]
  }
}
```

Seed is explicit opt-in (`CAPITAR_SEED=true`), uploads original assets once and adds only a missing section. Existing authored content is not replaced. Local data was backed up to backend `.tmp/data.phase3-before.db` before schema migration. The published local section is populated. Fresh environments must run the opt-in seed or create/publish content through Strapi; the database and uploaded files are ignored runtime data.

Backend files changed: Homepage schema/controller, `src/seed.ts`, generated component/content types. New schemas are `src/components/homepage/capital-efficiency.json` and `capital-benefit.json`; CMS verification is `scripts/verify-phase3.cjs`.

## E. Visual verification

Reference: [original Figma frame](scratch/phase3/figma-capital.png).

Implemented from published CMS: [1440 desktop](scratch/phase3/implementation-1440.png), [1280](scratch/phase3/implementation-1280.png), [1024](scratch/phase3/implementation-1024.png), [768](scratch/phase3/implementation-768.png), [430](scratch/phase3/implementation-430.png), [390](scratch/phase3/implementation-390.png), [375](scratch/phase3/implementation-375.png). All seven were visually inspected; browser tests independently capture them in test-results.

Corrected export root transparency, dilution illustration blending on transparent backgrounds, card title line height/tracking, original description line breaks, icon proportions, tablet runway text/art spacing and illustration intrinsic dimensions. Desktop section height is950px at1440; it follows Portfolio without overlap. All tested widths have no horizontal overflow or clipped headings/descriptions. Vector gradients can show slightly different grain/antialiasing from Figma's raster preview; no pixel-identical raster-rendering claim is made.

## F. Validation

- Frontend production build and TypeScript: passed. Existing app.tsx unused Fab/Iconify warnings and existing large-chunk warnings remain.
- Backend production build: passed; generated Strapi types: passed; final backend `tsc --noEmit`: passed.
- Full Playwright suite:16 passed in1.6min, including4 new Capital Efficiency tests and existing Header/Hero/video/Portfolio regressions.
- New tests verify published media HTTP responses and image decoding, seven responsive widths, section order/950px desktop height, no JS page errors, reduced motion, reveal completion/reentry/refresh/reload, CMS text/order/disable/missing-media/empty-list/invalid-section isolation, outage fallback and failed-image handling.
- `scripts/verify-phase3.cjs`: passed real local CMS publication/edit/disable/reorder/media/alternative-text checks; deep comparisons confirm Hero and Portfolio content preserved. Test edits restored in finally.
- A preexisting homepage test waited for every document image before scrolling. It now checks initial-view eager images; the new section tests explicitly scroll and decode all lazy illustrations. The full suite passes with this correction.
- Scoped frontend ESLint and both repositories' diff whitespace checks: passed.
- Frontend3039, Strapi API3035 and admin returned HTTP200 after restart.

## G. Limits and delivery state

No implementation blocker remains. Mobile/tablet layout and exact reveal timing are documented adaptations because the approved Figma frame has no matching responsive variant and Framer has no identical Capital Efficiency heading/layout. Native SVG and raster preview can differ in fine grain/antialiasing.

Both local servers remain running. Changes are uncommitted for review; this phase has not been pushed. No future homepage section or About route was added.

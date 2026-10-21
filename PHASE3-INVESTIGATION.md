# Phase 3 investigation: target discrepancy

The supplied Phase3 brief calls the next section About Capitar but explicitly requires independent verification of the same Figma homepage variant and prohibits mixing design options.

## Repository audit

The homepage currently composes independent Hero and PortfolioProofPoints sections using normalized data from a shared two-request CMS fetch. Strapi5.52.3 uses explicit reusable components on one published Homepage single type. SectionBadge, ContentButton, theme tokens and scoped GSAP lifecycle patterns are available. The latest requested load-animation fix is uncommitted on dev and must be preserved. No implementation files have been changed for Phase3 while the target remains unresolved.

## Verified Figma hierarchy

In the existing variant, Portfolio & Proof Points lives in Stats Overview Container `762:1073`,1440x685 at y800. It ends at y1485.

The next complete sibling is **Stick Banneer `767:4181`**,1441x950 at y1485, background #0B0F2D. Its visible label is **CAPITAL EFFICIENCY**, heading **Fuel growth. Protect your cap table.** and description **Scaling fast shouldn’t mean giving away too much of your company.** It contains a four-card illustrated grid, not About Capitar.

Verified descendants:

- Facts Container `767:4188`:1317x564 at x61.5/y313.19, grid2rows/3columns,20px gaps.
- Fund Opportunity Container `767:4215`:425.67x564 at x891.33 inside the grid, spans2rows, radius12.
- Sibling layer names: Fact Item Container, Reduce Dilution Container, Fund Growth Container, Capitar Decision Container, Filler Elements.
- Visible card labels: Accelerate growth; Protect your cap table; Maximize runway; Capitalize on momentum.

The supplied Figma prototype opens the expected neon Hero at762:923, confirming the file/flow, but its canvas scroll did not reliably advance to Section3. Browser native design inspection reliably exposed the section ordering and geometry above. Figma connector tools are unavailable in this session; inspection used Figma’s actual browser UI.

Searching the Desktop UI page for “About Capitar” returned no results. The requested Framer title therefore cannot be assumed to be the next approved Figma section.

## Framer investigation

The actual live About section was inspected in Chrome at1440 and390 viewport widths through several scroll positions. Evidence is saved in `scratch/phase3/framer-{1440,390}-{700,950,1150,1350,1550}.png`; DOM observations are in `scratch/phase3/framer-observations.json`.

Observed desktop About heading changes word color progressively with scrolling, with each word in an inline span. At scroll700 the first words are dark while later words remain pale; at950 more words are dark. The h2 is position:sticky. This is a scroll-linked word-color effect, not a generic fade-up or character reveal. The CTA points to `./about`. Its styling and the surrounding media/benefits are not permission to copy Framer’s visual layout into a different Figma section.

## Approved target and implementation specification

The user explicitly selected **the actual next Figma section: Capital Efficiency**. This supersedes the About-specific suggestions in the original brief.

Native PNG and SVG exports of `767:4181` are saved in `scratch/phase3/figma-capital.*`. SVG layer geometry confirms: badge x627.5/y72.4375,186x28; white heading at y122.94, two lines; description below at y245.94; card grid y313.188; top cards425.667x272; bottom wide card871.333x272; tall right425.667x564. All cards radius12, gap20, white fill. Icons42x42 with12px corners, radial blue gradients #123C66/#234DCC. Card titles #193969; descriptions same at80% opacity. Heading text node `767:4186`: LT Superior Regular400,42px,120% line height,-2% tracking, centered, explicit two lines. Header group `767:4182`:532x196 at454.5/71.94,vertical gap24; inner group `767:4183`:524x150,gap21. Card typography is measured against original vector glyph bounds and verified visually during QA.

Layer IDs read from Figma's actual layer tree: Fund Growth Container `767:4189`, Reduce Dilution Container `767:4202`, Fund Opportunity Container `767:4215`, Fact Item Container `767:4223`, Filler Elements `767:4254`. There is no CTA in this frame. The Mobile UI page has no matching completed variant; tablet/mobile will preserve the content and art proportions with2/1-column adaptations.

Assets are separated from the native SVG into original background rings, four blue vector icons, and four illustrations. No complete-card or section screenshot is rendered. Three raster-backed illustrations are converted to high-resolution WebP; the runway illustration remains vector. Illustration metrics are original Figma artwork, not company KPIs; CMS alternative text describes them. Text headings/descriptions remain editable HTML. Extraction script: `scripts/export-phase3-assets.ps1`.

Additional live Framer investigation at1440/390 (`scripts/audit-phase3-reference.mjs`) captures the corresponding Fund Growth/Reduce Dilution/Extend Runway benefit group through scroll and hover states. At entry the cards have opacity0 and translateY15; after450ms opacity~.875/Y~1.87; later both reach1/0. No video, parallax or pinned cards. Implement a one-time scoped benefit-card opacity/15px reveal, approximate900ms ease-out; the exact source easing is not exposed. The Figma Capital Efficiency heading has no direct Framer equivalent, so keep its verified layout without transplanting About's unrelated sticky color animation. No interactive card destination was observed.

CMS: optional `capitalEfficiency` on Homepage, section enabled/label/heading/description/background media and ordered repeatable benefits with title/description/layout/icon/artwork. Layout enum standard/wide/tall preserves design roles while allowing reorder. Missing optional media omits the image, failed images hide gracefully, invalid optional section does not discard Hero/Portfolio. Extend existing fetch/normalizer and opt-in non-overwriting seed. Section composes below Portfolio, with its own scoped GSAP cleanup and reduced-motion final state.

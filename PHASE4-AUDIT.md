# Phase 4 design and motion audit

User explicitly authorized browser-only Figma inspection/export after the MCP Starter read quota was exhausted. No Figma MCP calls are used in this workflow. The current application was audited and captured before implementation: `scratch/phase4/baseline-1440.png`, baseline.json (no JS page errors); production build passes with existing app.tsx unused-import and large-chunk warnings.

## Verified target

The approved homepage is Capitar Option `762:923`, within Homepage UI `1232:997`. Capital Efficiency `767:4181` starts y1485 and ends y2435. The actual next section is **THE CAPITAR DIFFERENCE — Think like founders. Solve like partners.**, not Why Venture Debt. The brief explicitly authorizes implementing the actual next section without a target clarification.

This section comprises five sibling frames in `762:923`, rather than a separate enclosing frame:

| Node | Bounds in homepage | Role |
|---|---|---|
| `810:1051` | x326/y2435,788×538 | Sticky introduction, explicitly marked Scroll position: Sticky |
| `810:1055` | x70/y2904.99,366×440 | 01 Seed to Series B Coverage |
| `810:1078` | x70/y3428.62,366×440 | 02 Custom-Structured Solutions |
| `810:1101` | x1005.46/y3047.69,366×440 | 03 Founder-First Mindset |
| `810:1124` | x1005.46/y3555,366×440 | 04 High-Velocity Execution |

The next unrelated section `788:848` starts y4106.65. Our wrapper therefore covers y2435–4106.65 (1671.65px). No future section is implemented.

Background #F8F9FA. Badge native bounds221×28 at x609.875/y2600.5, #CC2334 outline/#401E17 text. Heading `762:1155` is LT Superior Regular400,50px,100% line height,0% tracking, centered,523.48×100, two explicit lines. Description reads “Combining a founder mindset with custom-tailored capital structures.” The navy About Us pill is126×42 with a white circular arrow. The project has no About route; user explicitly selected **keep disabled until About is built**. Existing shared ContentButton will be extended only through an optional appearance prop with preserved defaults.

Cards are navy #0B0F2D, radius21.0929, border2.10929 #F0F0F0, with original blue/purple glow and ring layers. Shadows verified in inspector include0/5.09/11.44 #1A67E7 at10% and0/20.34/20.34 at9%; additional native shadow metadata retained for inspection in the downloaded SVG. Card content group (`810:1141` on card04) is303.81×370.6 at31.1/34.7, vertical space-between. Cube illustration122.61×108. Copy group `810:1143` uses13.1px gap. Title `810:1145`: LT Superior Semi Bold600,32px,110% line height,-2% tracking, white. Paragraph `810:1146`: Regular400,18px,140%,0% tracking, white,295.51×75. All card copy and all four individual cube variants were visually inspected.

## Native assets and comments

Browser Export downloaded `Capitar Option.svg` (native full homepage layers) and first-card SVG. Local originals are ignored references in `scratch/phase4`. Scripts separate the original card background from the text and export each exact crop of the original four cube illustrations. Website assets contain no card/section screenshots and no outlined text. Native SVG reference subset is rendered solely for comparison as `scratch/phase4/figma-section.png`. Source asset node for card04 is image14676 `1234:1002`; the shared uploaded sprite is28b09bbe40c86a182b5a5d9a284fa7cfea87b1f9 with exact per-card crop matrices in native export.

Comment #5 was opened and read in full: vertical scroll, subtle glass effect, larger icons. Its canvas anchor jumps to an empty region outside the selected frame, so association with this section cannot be verified. It is not used to override the final opaque navy Figma cards. Other visible comments request dark/blue/white variants elsewhere; no verified attachment to this section. The Mobile UI page `1295:916` was opened: empty canvas and no layer rows. Therefore no mobile variant exists there; responsive adaptation is documented, not claimed as a Figma mobile match.

## Observed Framer behavior

The corresponding Why us section uses different marketing copy but the same central sticky introduction with independent cards passing on either side. Real Chrome1440/390 captures include previous-section exit, entrance, several scroll positions, final exit, reverse scrolling and pointer movement. Evidence: `scratch/phase4/framer-motion.json` plus stage PNGs; audit scripts are retained.

Sticky parent top0, viewport-height content. Cards translate through normal document flow; no stacking, replacing, scaling, pinning or card exit tween. Reverse scrolling reverses position naturally, while completed text entrances remain revealed. Heading word spans all share Y20→0, opacity.001→1, blur8→0; card headings similarly Y20/blur5, descriptions Y20/blur2. No measurable stagger between words in the sampled frames. Heading opacity~.943 after1100ms,~.998 after the next sampled state: an approximately1.8–2s settling reveal; exact Framer spring configuration isn't exposed. Icons fade independently, no parallax. These are entrance effects, not continuous scroll-linked blur. No hover/navigation behavior on informational cards was observed.

Implementation specification: CSS sticky on desktop, with correctly bounded section and original staggered card positions. Scoped GSAP one-time heading/card-copy blur/20px reveals and icon fades using ScrollTrigger element-relative starts, fitted2s exponential ease. No heading word split needed because all observed spans move together. Completed elements retain their state through content refresh; GSAP context cleanup and font measurement refresh. The explicitly requested desktop sticky layout and reveals remain active under either system motion setting. Tablet/mobile use unpinned introduction and a2/1-column card sequence to prevent overlap.

Figma's prototype link was opened in the browser and verified to the same neon Hero/homepage variant. Its prototype canvas did not advance on wheel scrolling; this limits verification of interactive prototype transitions. Sticky behavior is independently explicit in the design inspector, and the matching Framer layout was fully scrolled and recorded. No unverified prototype click destination was invented. Number node `810:1144` is Semi Bold600,24px/100%/-2% with cap-height vertical trim (17px bounds); HTML reserves17px line height accordingly.

CMS specification: optional `capitarDifference` section with enabled, label, heading, description, existing link CTA, cardBackground media and ordered repeatable cards (number/title/description/image). Shared homepage fetch/normalization, independently isolated optional content, safe URLs, graceful optional media, explicit non-overwriting seed. Existing sections remain intact.


Scroll behavior correction (2026-10-21): The actual Chrome browser reports reduced motion, which previously disabled both desktop sticky positioning and reveals. Removed that opt-out for this explicitly requested motion. Verified live at 1536px: intro Y stayed 0 while first-card Y changed from -527.8 to -123.8 across a 404px reverse scroll. Five targeted browser tests pass, including sticky/release/reverse/reveal under both motion settings, seven responsive widths, and CMS/failure cases. Frontend production build passes with existing app.tsx unused-import and bundle-size warnings.

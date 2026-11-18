# Blog listing page

Source: Desktop UI / Blog Listing Page in [Capitar Website](https://www.figma.com/design/Z3woTbcJz1KVV7ukDtBy6o/Capitar-Website?node-id=2732-6044).
Inspected in the user's existing Chrome session on 18 November 2026; no Figma edits or MCP extraction.

## Downloaded source assets

All files are under `public/assets/blog/`. Original source formats are retained.
Image-fill links were opened from the selected real Figma layer, then copied from Chrome Downloads.

| File | Figma source | Use |
| --- | --- | --- |
| hero-arcs.png | Luminous Glass Arcs on Navy.png; image hash `29192f959e8365e21db7ff0b657452700bf528ca` | Hero background |
| featured-architecture.jpg | Featured image · glass architecture; hash `308552befe96f9907d3597a7398bd29024e2e8c3` | Featured article background |
| founder-conversation.jpg | Card image / Rectangle 1618873505; hash `730b460abc8ded65b895e42db99354af93d71316` | Cards 1, 5, 9 |
| office-conversation.jpg | Card image fill; hash `078f23cc556cd6cf3530928d24eba9d8e13b3d61` | Cards 2, 6, 7 |
| architecture.png | Card image fill; hash `630e3da0f16196816295d235821d7aef8c48b3aa` | Cards 3, 4, 8 |
| newsletter-artwork.png | Stick Banneer / Filler Elements, node `2735:2385`; native Figma PNG export at 1440 × 445 | Newsletter's decorative artwork, above its navy surface |

The banner export contains decoration only. All text, controls and layout are HTML. No screenshot assets or replacement artwork were created. The existing site arrow SVG, shared header/footer, fonts, ContentButton and SectionBadge are reused.

The hero was additionally exported as `01 · Resources hero.svg` to Chrome Downloads for inspection only. Its native image-fill matrix is `matrix(0 -0.00120339 0.000563698 0 0.168008 1.0337)` for the 887 × 1774 source. That exact transform is applied to the source image in an SVG viewport; the section export is not shipped or used as a flattened page asset. Its gradient runs from x=1441 to x=159.821, transparent to opaque #010A2C at offset .818814, over a 20% #010A2C tint. Dev Mode inspection requires an upgrade in this account; native exports provide the source transform without upgrading.

## Measured desktop structure

1441px frame; 100px side gutters. The Figma authoring hero is 602px; the user explicitly requested a full-viewport page hero like Home/Venture Debt, so the implementation uses at least 100svh with centered copy. Categories/feature section 640px (56/64px vertical padding, 32px toolbar gap, feature 1241 × 440). Latest section 1591px, three columns with 24px column gaps and 32px row gaps; cards 397.67 × 401, 6px padding, 209px photos. Card titles: LT Superior Serif Regular, 24px, 100% line height, #193969. Newsletter: 445px, #0B0F2D. Existing shared footer follows.

Rechecked the entire frame in Chrome and downloaded native SVG references for the featured section, latest articles and complete Blog Listing Page (with text outlines disabled for font inspection). These remain inspection references in Downloads and are not runtime assets. Verified source values: hero heading 72px/72px, bold emphasis, -0.02em; hero/featured body 20px/28px; featured/latest/newsletter headings 42px with 50px lines; card category 16px bold; card description 14px/26px; feature CTA 132.36 × 40 with a 32px arrow circle; pagination 48px controls and 8px gaps. The card photo crops now use the exact normalized source-image transforms from the native export, including the architecture's lower crop. Source-image bytes remain unchanged. Unrelated CMS replacement images retain cover sizing.

The Mobile UI page had a Venture Debt frame, with no blog-specific mobile frame found. Responsive blog behavior adapts these same sections to two columns on tablet and one column on phone; categories scroll natively without a scrollbar.

## Content and CMS integration

`src/content/blog.json` preserves the nine repeated Fundamentals cards and featured copy supplied in Figma. No article bodies, category assignments, extra articles or dates were invented. All Posts shows the supplied cards; categories without matching records have an empty state. Sorting is stable when sample records have identical titles and no dates.

Article URLs are empty until supplied. The feature CTA is disabled, and sample card arrows do not pretend to navigate. Additional pagination controls from the design are disabled until there are article records for those pages. The page-size logic handles additional records when provided.

The frontend loads published content from `GET /api/blog` on the existing `VITE_CMS_URL` origin, retaining Figma fallback content on outages. All sections, categories, individual article cards, URLs, dates, images and page size are editable in Strapi's Blog single type. Explicit empty article lists stay empty. Draft content is excluded by the public controller.

The form posts JSON `{ "email": "…" }` to `POST /api/newsletter-subscriptions` on that same CMS origin. It validates email, preserves input on failure and acknowledges only an accepted response. Strapi privately stores deduplicated subscription requests with consent time/source; there is no public subscriber read route. This captures requests; email campaigns require a delivery provider later. A real privacy-policy URL and article destinations remain editorial inputs. No push or deployment was performed.

Motion uses MainLayout's existing hero/color-flow hooks and useSectionReveal. Banner decoration follows the shared color canvas via `data-flow-artwork`; it is not an opaque section screenshot. Full motion follows the existing site policy under both OS motion settings.

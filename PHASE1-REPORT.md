## Client logo correction

The previous connector image assets did not preserve the Figma image crops when forced into width/height boxes. Re-exported the four individual logo nodes at 2x with their Figma crop/filter treatment. Replaced the local fallback PNGs and local CMS media while retaining media IDs and content relations; new URLs invalidate cached originals. Rendering now uses object-fit: contain. The repair can be repeated using backend scripts/repair-client-logo-assets.cjs.

# Playback verification in the user browser

The user Chrome tab reports prefers-reduced-motion: reduce. This previously removed the video completely, explaining why headless normal-motion checks passed while the user saw a still poster. The video now plays under that preference as explicitly requested, without playback controls, per the latest user request. Chrome verification confirmed paused=false, readyState=4, advancing playback (1.03s to 2.85s), and different illuminated chevrons. Three targeted playback/fallback/reduced-motion-playback tests and the production build passed. The client logo cropping issue is corrected in the follow-up above. Current official-site logos differ from the supplied design, so they were not substituted.

# Capitar Phase 1 implementation

## Follow-up: full-width video background

Removed the 1441px cap from the Hero section so its background fills the viewport horizontally. The content keeps a centered 1441px alignment with the Header; the client panel extends from the screen edge. The original 4.064-second Figma MP4 remains the CMS-driven, muted, autoplaying, looping background, with preload=auto. Its poster is retained while media loads. Browser verification confirmed actual playback/time progression and edge-to-edge coverage at 1920×1080 and 2560×1440. This is covered by tests/hero-background.spec.ts.

## Follow-up: viewport sizing and scrolling header

The desktop Hero now fills 100svh from the 900px breakpoint, adapting its heading and vertical spacing to short screens. The client strip sits at the bottom of the hero without creating a vertical scrollbar. Verified at 1440×900, 1440×800, 1366×768, 1280×720, 1024×600 and 1280×500.

The fixed Header slides and fades out over 350ms when scrolling downward and returns when scrolling upward. Wheel intent works even when the viewport-sized hero has no scroll range. Hidden navigation is inert, the mobile drawer stays usable while open, and reduced motion removes the transition. The entrance animation targets the inner header content so it does not compete with scroll animation.

All seven Playwright tests and the production frontend build pass after this follow-up. The running local frontend is on3039 and its CMS origin is configured in .env.local as http://localhost:3035.

## A. Repository audit

The existing frontend is React 19, TypeScript 5, Vite 6 and MUI 7, with React Router 7 and Axios. The lockfile is npm-based despite a Yarn packageManager declaration; npm was retained. The existing theme, authentication, dashboard routes, deployment configuration and template components remain in place. The public `/` route now composes the website layout and independently importable HeroSection. The former dashboard index is available at `/dashboard`; existing `/user`, `/products`, `/blog` and `/auth/login` routes remain.

The backend was already Strapi 5.52.3 with TypeScript, the native upload library, users-permissions, and SQLite. It had no custom application content types. Its existing environment uses port 1340. No project-specific AGENTS.md was found. There were no existing Capitar assets or GSAP dependency.

Three existing template files needed narrow type assertions around es-toolkit's deep-merge return type to pass the existing TypeScript build: chart/use-chart.ts and auth/dashboard layout.tsx. Their runtime behavior is unchanged.

## B. Figma audit and asset manifest

Source: [Capitar Website](https://www.figma.com/design/Z3woTbcJz1KVV7ukDtBy6o/Capitar-Website?node-id=975-1268). Browser inspection covered the overall Desktop UI and selected hero; the Figma connector supplied high-fidelity design context and its rendered visual target.

| Asset / element | Figma node | Local file / verified values |
|---|---|---|
| Hero | 975:1268 | 1441 × 800, #111129 |
| Banner video | 975:1270 | public/assets/capitar/hero.mp4; original 1280 × 720 video, audio removed; still hero-poster.webp derived from frame 1 |
| Banner gradient | 975:1271 | Navy to transparent, implemented in CSS |
| Capitar logo | 975:1273 | logo.svg, 121.5 × 32; x100 / y28.5 |
| Offerings indicator | 975:1307 | chevron.svg, original SVG dimensions |
| Client panel shape | 975:1314 | client-panel.svg; starts at y633 |
| Introduction | 1218:1573 | x100 / y207, width556, 24px gaps |
| Announcement | 1218:1574 | 32px pill; exact Figma copy |
| Main heading | 1218:1578 | LT Superior 400/600, 72px, 100% line height, −2% letter spacing |
| Portfolio CTA | 1218:1579 | 50px high, 18px semibold text, 40px red icon circle |
| CTA arrow | I1218:1582;2:21937 | arrow.svg; wrapper rotates supplied left arrow into design orientation |
| Qubehealth (twice) | 975:1329, 975:1332 | qubehealth.png; 129 × 30.786 display slot |
| Pidge | 975:1330 | pidge.png; 75 × 25.82 slot |
| Craev | 975:1331 | craev.png; 83 × 27.752 slot |
| mPokket | 975:1333 | mpokket.png; 121 × 39.879 slot |
| Client row | 975:1328 | 49px desktop gaps; five entries, preserving repeated Qubehealth |

All runtime assets are local. The logos are individual 2x node exports preserving Figma's crops and image treatment; their pixel dimensions now match their display proportions and use contain sizing. No frame screenshots are used as HTML substitutes. The original SVG root dimensions are retained. LT Superior regular, medium and semibold are self-hosted under public/assets/fonts, downloaded from the [designer's repository](https://github.com/LyonsType/LTSuperior); its OFL.txt is included.

Theme tokens centralize navy, white, red (#CC2334), gutters, typography, container width, borders and button conventions. Header and Hero use MUI components and sx. At mobile widths the layout preserves the same content, wraps logos and opens an accessible Drawer. The connector exposed Desktop UI and References pages; the browser's Mobile UI entry did not yield a verified corresponding hero frame, so responsive geometry is an adaptation rather than a claimed mobile Figma match.

## C. Animation audit

Reference: [Framer site](https://daily-shallot-076239.framer.app/). A clean reload was inspected in Chrome and captured at several stages. Playwright also captured desktop/mobile frames and DOM observations in scratch/reference. The heading consists of whole h1 blocks with no character/word children. Its ancestor starts near opacity 0.001 and translateY(30px), then approaches opacity 1 / translateY(0). No clip-path was observed. The heading and supporting content enter before the header. The wave artwork becomes visible during the entrance. Reloads replay the sequence. Mobile uses the same block entrance pattern.

One GSAP timeline owns all targets in the shared layout. Heading: t0.15, y30 → 0, 1.1s. Content: t0.30, fade/rise, 0.9s with 0.1s stagger. Background: t0.45, 1.2s fade. Clients: t0.70, 0.8s fade/rise. Header: t0.80, 0.8s fade. Easing is power3.out. GSAP context/matchMedia clean up Strict Mode remounts and preference changes. Reduced motion shows the finished layout without an entrance transition. Following the explicit playback request, the background video also plays in this mode; it loops continuously without visible playback controls. There are no animation setTimeout calls.

Observed movement and sequence are reproduced; precise Framer durations/easing were not exposed. Sampling includes browser startup and screenshot overhead, so these timings are approximations, not frame-exact measurements. Figma has different content and artwork from Framer; only the opening behavior is transferred. Content requests do not gate or restart the timeline. CMS updates on window focus update content without replaying the entrance.

## D. Files created / modified

- src/pages/home/home-page.tsx: page-level fetch and section composition.
- src/layouts/website/main-layout.tsx: shared public theme, Header, skip link, main landmark and synchronized entrance scope.
- src/components/website/header.tsx: reusable CMS-driven desktop navigation and mobile Drawer, with native MUI focus management.
- src/components/website/content-button.tsx: configurable CTA and arrow.
- src/sections/home/hero/: standalone presentation section and centralized entrance hook.
- src/theme/website-theme.ts and website-fonts.css: public design tokens and font faces.
- src/services/homepage.service.ts, src/types/homepage.ts, src/hooks/use-homepage.ts: response validation, normalization, safe URLs, cancellation, focus refresh and verified-content fallback.
- src/content/homepage.json: verified design fallback and shared seed input.
- public/assets/capitar and public/assets/fonts: local artwork, logos, SVGs and font files.
- src/routes/sections.tsx and paths.ts: public homepage and preserved dashboard entry.
- index.html: font preloads; .env.example: CMS origin.
- package.json/package-lock.json: GSAP and Playwright test tooling.
- playwright.config.ts and tests/homepage.spec.ts: browser verification; scripts/audit-reference.mjs: repeatable reference capture.
- Backend src/components/: shared.link, shared.client-logo and homepage.hero.
- Backend src/api/global and src/api/homepage: schemas, core services/controllers and published read-only routes.
- Backend src/seed.ts and src/index.ts: opt-in, non-overwriting sample seed with native media uploads.
- Backend types/generated/: Strapi-generated component/content typings.
- Backend scripts/verify-phase1.cjs: local sample-content integration check with restoration.

## E. CMS content model and API

Global contains brandLogo, repeatable navigation links and headerCta. Link contains label, optional href, enabled and showIndicator. Homepage contains one hero component: enabled, announcementText/link, heading, emphasisText, optional description, backgroundImage/mobile/video, primaryCta, trustedClientsTitle and repeatable clients. A client has name, media, width and height.

GET /api/global and GET /api/homepage return published single-type data with explicit nested population in the controller. Only GET is registered. Public create/update/delete routes are absent (POST verified as 405). Admin editing uses Strapi's normal authenticated Content Manager. No admin token or secret is included in browser code. The frontend normalizes Strapi 5's flattened data envelope and rejects invalid required content and unsafe link protocols. Optional media, empty clients and disabled sections render safely. Failed requests use verified local design content.

Future destinations are disabled until configured. No Offerings/Portfolio/About/Insights/Contact pages or fake destination URLs have been created. The Offerings chevron is preserved; a dropdown's destinations are not fabricated.

## F. Verification

- Frontend npm run build: passed (TypeScript and Vite; existing unused-import warnings in app.tsx and large template bundle warnings remain).
- Backend npm run build: passed (TypeScript and Strapi admin build).
- Strapi develop and start: both started successfully on port1340.
- GET Global/Homepage: HTTP200, published content and all required populated media returned; five client entries and dimensions confirmed.
- Public POST Homepage: HTTP405.
- Backend integration test: passed published data, component/media relations, text/media replacement and restoration. Run with the backend server stopped, against the seeded local sample database.
- Five Playwright tests: passed. Coverage includes 1440/1024/768/390/375 layouts, no horizontal overflow, all image loads, actual LT Superior font availability, mobile open/close/Escape/focus restoration, reduced-motion entrance disabled with continuous background playback, outage fallback, delayed CMS content update without timeline restart, configurable CTA navigation, refresh and header-after-heading order.
- Desktop and mobile screenshots were compared visually with the Figma target. Saved implementation screenshots are in test-results/home-{width}.png; reference captures and DOM observations are in scratch/reference. Both are ignored generated artifacts. This is visually verified, not a claim of pixel-perfect or frame-perfect equivalence.

## G. Setup

Use Node22 and npm. From C:\Projects\Capitar Ventures, in two terminals:

```powershell
cd capitar-ventures-backend
npm ci
# Existing .env is preserved. For a new checkout:
Copy-Item .env.example .env
# Set unique APP_KEYS, API_TOKEN_SALT, ADMIN_JWT_SECRET,
# TRANSFER_TOKEN_SALT, JWT_SECRET and ENCRYPTION_KEY in .env.
# Keep PORT=1340. Do not put secrets in VITE_* variables.
$env:CAPITAR_SEED='true'
npm run dev
```

On a fresh database this imports the verified local frontend assets and creates published Global/Homepage content. Existing documents are never replaced. After the first startup, remove CAPITAR_SEED from the environment. Seed asset/content paths can be overridden with CAPITAR_SEED_ASSET_DIR and CAPITAR_SEED_CONTENT for separate deployments.

```powershell
cd capitar-ventures-frontend
npm ci
Copy-Item .env.example .env.local
npm run dev -- --host 127.0.0.1
```

Open http://127.0.0.1:3039/; admin: http://localhost:1340/admin. In Strapi Content Manager, edit Global/Homepage, select media and publish. Set a link's real href and enabled=true once its destination exists. Return focus to the website or refresh to see published updates.

```powershell
# Frontend, with both servers running:
npm run test:phase1
# Backend, with server stopped and local sample database seeded:
npm run test:phase1
# Production builds, in each project:
npm run build
```

The Playwright config uses installed Google Chrome. Production frontend deployment retains existing Vercel/Vite conventions; set VITE_CMS_URL to the deployed CMS origin at build time. Configure the backend media provider, HTTPS origin/CORS and persistent database/storage for the chosen hosting environment. No deployment was requested or performed.

## H. Limits

Unimplemented page destinations and event details remain disabled rather than invented. The mobile layout is adapted from desktop because a matching mobile hero could not be verified. Framer easing/durations remain approximated from observation. Self-hosted fonts use the designer's current release, which may differ slightly from the exact revision used in Figma. Production hosting credentials and media hosting were outside the local implementation scope. The existing dashboard/auth bundle remains large and was not redesigned in this phase.

# Capitar Ventures frontend

React, TypeScript, Material UI and GSAP homepage backed by Strapi.

## Local development
Run npm ci, copy .env.example to .env if needed, then run:

    npm run dev -- --port 3039

Frontend: http://localhost:3039 . CMS admin: http://localhost:3035/admin . Set VITE_CMS_URL to the backend origin for other environments.

## Content editing
In Strapi Content Manager, open the Homepage single type. Edit Hero, Portfolio & Proof Points, Capital Efficiency, The Capitar Difference and Case Study. Upload images/logos/video through Media Library or each component's media field. Item order follows the repeatable component order. Save and Publish to update the public site; unpublished drafts are not returned. Global controls the header logo, navigation and header CTA.

The frontend requests GET /api/homepage for all five sections and GET /api/global for the header. Nested components/media are populated by the backend controller and normalized by src/services/homepage.service.ts. Section components receive normalized data; they do not make their own requests. Content refreshes on page reload or window focus. Local homepage.json and referenced public assets provide the CMS-outage fallback.

## Animation preferences

Before changing screens or animations, follow [AGENTS.md](AGENTS.md) and the
[animation/device incident and validation guide](docs/ANIMATION_DEVICE_RELIABILITY.md).

Animations are enabled by default independently of the operating system's reduced-motion preference. The fixed **Reduce animations** button switches to a static, readable layout; **Enable animations** restores the effects. This site choice is saved as `capitar-motion` in local storage and remains usable for the visit if storage is blocked. It does not change Windows or browser settings. Touch devices keep native scrolling; compact viewports use unpinned content with card reveals instead of desktop pinning.

Run `npx playwright test tests/site-motion.spec.ts` for preference, persistence, touch, viewport and native-wheel regressions. Run `npx playwright test --config playwright.motion.config.ts` for installed Chrome, Firefox and WebKit coverage. The real-system check removes Playwright's default motion override with `reducedMotion: null`.

## Checks
npm run build builds production assets. npx playwright test runs browser checks with both servers running. Test screenshots stay in ignored test-results/. Runtime media under public/assets is required; design audits and temporary reference exports are not part of the app.

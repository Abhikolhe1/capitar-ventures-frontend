# Capitar Ventures frontend

React, TypeScript, Material UI and GSAP homepage backed by Strapi.

## Local development
Run npm ci, copy .env.example to .env if needed, then run:

    npm run dev -- --port 3039

Frontend: http://localhost:3039 . CMS admin: http://localhost:3035/admin . Set VITE_CMS_URL to the backend origin for other environments.

## Content editing
In Strapi Content Manager, open the Homepage single type. Edit Hero, Portfolio & Proof Points, Capital Efficiency, The Capitar Difference and Case Study. Upload images/logos/video through Media Library or each component's media field. Item order follows the repeatable component order. Save and Publish to update the public site; unpublished drafts are not returned. Global controls the header logo, navigation and header CTA.

The frontend requests GET /api/homepage for all five sections and GET /api/global for the header. Nested components/media are populated by the backend controller and normalized by src/services/homepage.service.ts. Section components receive normalized data; they do not make their own requests. Content refreshes on page reload or window focus. Local homepage.json and referenced public assets provide the CMS-outage fallback.

## Checks
npm run build builds production assets. npx playwright test runs browser checks with both servers running. Test screenshots stay in ignored test-results/. Runtime media under public/assets is required; design audits and temporary reference exports are not part of the app.

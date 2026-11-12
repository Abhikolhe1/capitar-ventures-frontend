import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const fallback = JSON.parse(
  readFileSync(new URL('../src/content/about-us.json', import.meta.url), 'utf8')
);

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.addInitScript(() => localStorage.setItem('capitar-motion', 'reduced'));
});

for (const preference of ['reduce', 'no-preference', null] as const) {
  test(`complete About Us with ${preference ?? 'system'} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: preference });
    await page.setViewportSize({ width: 1441, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/about-us');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
    await expect(page.getByRole('banner')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('So we built Capitar.');
    await expect(page.locator('.about-milestones > li')).toHaveCount(4);
    await expect(page.locator('.about-team-card')).toHaveCount(9);
    // Native wheel input traverses all sections, then verifies reverse reveals.
    for (let i = 0; i < 32; i += 1) {
      const quoteTop = await page
        .locator('.about-quote')
        .evaluate((el) => el.getBoundingClientRect().top);
      if (quoteTop < 450 && quoteTop > 0) break;
      await page.mouse.wheel(0, 280);
      await page.waitForTimeout(180);
    }
    await expect(page.locator('.about-quote blockquote')).toBeInViewport();
    await expect
      .poll(() =>
        page.locator('.about-quote figure').evaluate((el) => Number(getComputedStyle(el).opacity))
      )
      .toBeGreaterThan(0.95);
    for (let i = 0; i < 12; i += 1) {
      await page.mouse.wheel(0, -280);
      await page.waitForTimeout(100);
    }
    await page.locator('#belief').scrollIntoViewIfNeeded();
    const buttons = page.locator('.about-principles button');
    await buttons.nth(1).click();
    await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await buttons.first().click();
    await expect(page.locator('.about-principle-description').first()).toBeVisible();
    await page.locator('.about-team-card').first().scrollIntoViewIfNeeded();
    await page.locator('.about-team-toggle').first().click();
    await expect(page.locator('.about-team-toggle').first()).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(page.locator('.about-team-bio').first()).toHaveCSS('visibility', 'visible');
    await page.locator('.about-quote').scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page
          .locator('.about-page img')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0
            )
          )
      )
      .toBe(true);
    expect(errors).toEqual([]);
  });
}

for (const [width, height] of [
  [390, 844],
  [768, 1024],
  [1366, 600],
  [1440, 730],
]) {
  test(`About Us responsive ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/about-us');
    for (const section of [
      '#about-hero',
      '#mission',
      '#journey',
      '#belief',
      '#people',
      '.about-quote',
    ]) {
      await page.locator(section).scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
      ).toBe(true);
    }
    await page.locator('.about-team-card').last().scrollIntoViewIfNeeded();
    await expect(page.locator('.about-team-toggle').last()).toBeInViewport();
    const heading = page.locator('#about-title');
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    expect(await heading.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  });
}

test('touch interactions and missing artwork preserve readable content', async ({
  browser,
  browserName,
  baseURL,
}) => {
  test.skip(browserName === 'firefox', 'Firefox does not support mobile context emulation.');
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.route('**/assets/about/**', (route) => route.abort());
  await page.goto('/about-us');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.locator('.about-team-toggle').first().scrollIntoViewIfNeeded();
  await page.locator('.about-team-toggle').first().tap();
  await expect(page.locator('.about-team-toggle').first()).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.about-team-name').first()).toBeVisible();
  await page.locator('.about-quote').scrollIntoViewIfNeeded();
  await expect(page.locator('.about-quote blockquote')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true
  );
  await context.close();
});

for (const preference of ['reduce', 'no-preference', null] as const) {
  test(
    'visible scroll artwork and color handoffs with ' + (preference ?? 'system'),
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: preference });
      await page.setViewportSize({ width: 1440, height: 730 });
      await page.goto('/about-us');
      await expect(page.locator('#journey [data-flow-artwork]')).toHaveCSS('transform', 'none');
      await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
      await page.evaluate(() => {
        const frames: { opacity: number; transform: string; color: string }[] = [];
        (window as any).aboutFrames = frames;
        const record = () => {
          const image = document.querySelector('#journey [data-flow-artwork]')!;
          const canvas = document.querySelector('[data-page-color-canvas]')!;
          frames.push({
            opacity: Number(getComputedStyle(image).opacity),
            transform: getComputedStyle(image).transform,
            color: getComputedStyle(canvas).backgroundColor,
          });
          if (frames.length < 900) requestAnimationFrame(record);
        };
        requestAnimationFrame(record);
      });
      for (let i = 0; i < 9; i++) {
        await page.mouse.wheel(0, 180);
        await page.waitForTimeout(180);
      }
      await expect
        .poll(() =>
          page
            .locator('#journey [data-flow-artwork]')
            .evaluate((el) => Number(getComputedStyle(el).opacity))
        )
        .toBeGreaterThan(0.95);
      const frames = await page.evaluate(
        () => (window as any).aboutFrames as { opacity: number; transform: string; color: string }[]
      );
      expect(frames.some((frame) => frame.opacity > 0.05 && frame.opacity < 0.95)).toBe(true);
      expect(frames.every((frame) => frame.transform === 'none')).toBe(true);
      // Native WebKit wheel scrolling emits fewer color frames than Lenis.
      expect(new Set(frames.map((frame) => frame.color)).size).toBeGreaterThan(2);
      for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, -180);
        await page.waitForTimeout(150);
      }
      await expect
        .poll(() =>
          page
            .locator('#mission [data-flow-artwork]')
            .evaluate((el) => Number(getComputedStyle(el).opacity))
        )
        .toBeGreaterThan(0.95);
    }
  );
}

test('CMS sections, custom portrait, refresh and outage fallback', async ({ page }) => {
  let payload: unknown = {
    data: {
      ...fallback,
      hero: {
        ...fallback.hero,
        heading: 'CMS About heading',
        cta: { label: 'Visit portfolio', href: '/portfolio', enabled: true },
      },
      people: {
        ...fallback.people,
        team: [
          {
            name: 'CMS Team Member',
            role: 'Partner',
            portrait: 'unknown',
            biography: 'Individual CMS biography',
            image: { url: '/uploads/cms-about.png' },
          },
        ],
      },
    },
  };
  await page.route('**/api/about-us', (route) => route.fulfill({ json: payload }));
  await page.route('**/uploads/cms-about.png', (route) =>
    route.fulfill({ path: 'public/assets/about/bikramjit-source.png', contentType: 'image/png' })
  );
  await page.goto('/about-us');
  await expect(page.locator('h1')).toContainText('CMS About heading');
  await expect(page.getByRole('link', { name: 'Visit portfolio' })).toHaveAttribute(
    'href',
    '/portfolio'
  );
  await expect(page.locator('.about-team-card')).toHaveCount(1);
  await page.locator('.about-team-toggle').click();
  await expect(page.locator('.about-team-bio')).toContainText('Individual CMS biography');
  await expect(page.locator('.about-team-crop img')).toHaveJSProperty('naturalWidth', 1152);
  payload = { data: null };
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForTimeout(300);
  await expect(page.locator('h1')).toContainText('CMS About heading');
  payload = {
    data: {
      ...fallback,
      hero: {
        ...fallback.hero,
        cta: { label: 'Unsafe CTA', href: 'javascript:alert(1)', enabled: true },
      },
      people: { ...fallback.people, team: [] },
    },
  };
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.locator('.about-team-card')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Unsafe CTA' })).toBeDisabled();
  await expect(page.locator('h1')).toContainText(fallback.hero.heading);
});

test('every artwork surface blends with the shared canvas at section handoffs', async ({
  page,
}) => {
  await page.goto('/about-us');
  await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('[data-flow-artwork]')).toHaveCount(3);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 730 });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    );
    for (const selector of ['#mission', '#journey', '#belief', '#people', '.about-quote']) {
      for (const progress of [0.5, 1, 0.5]) {
        await page.locator(selector).evaluate((section, fraction) => {
          const top = section.getBoundingClientRect().top + scrollY;
          window.scrollTo(0, top - innerHeight * (0.95 - fraction * 0.6));
        }, progress);
        await page.waitForTimeout(160);
        const surfaces = await page.locator('[data-flow-artwork]').evaluateAll((elements) =>
          elements.map((el) => ({
            opacity: Number(getComputedStyle(el).opacity),
            transform: getComputedStyle(el).transform,
            mask:
              getComputedStyle(el).maskImage ||
              getComputedStyle(el).getPropertyValue('-webkit-mask-image'),
          }))
        );
        expect(
          surfaces.every(
            (surface) => surface.transform === 'none' && surface.mask.includes('gradient')
          )
        ).toBe(true);
        // At the light-blue handoff, both opaque source backgrounds must be absent.
        if (
          progress === 0.5 &&
          ['#mission', '#journey', '#people', '.about-quote'].includes(selector)
        )
          await expect
            .poll(() =>
              page
                .locator('[data-flow-artwork]')
                .evaluateAll((elements) =>
                  elements.every((element) => Number(getComputedStyle(element).opacity) < 0.01)
                )
            )
            .toBe(true);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true
    );
  }
});

for (const preference of ['reduce', 'no-preference', null] as const) {
  test(
    'Capitar View uses transparent native vectors over the shared canvas: ' +
      (preference ?? 'system'),
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: preference });
      await page.goto('/about-us');
      const decoration = page.locator('.about-quote-decoration');
      await expect(decoration.locator('svg')).toHaveCount(1);
      expect(await decoration.locator('svg path').count()).toBeGreaterThan(10);
      await expect(decoration).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(decoration).toHaveCSS('opacity', '1');
      await expect(decoration).toHaveCSS('mask-image', 'none');
      await expect(page.locator('.about-quote [data-flow-artwork]')).toHaveCount(0);
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 730 });
        await page.locator('.about-quote').scrollIntoViewIfNeeded();
        await page.mouse.wheel(0, -220);
        await page.waitForTimeout(200);
        await expect(decoration).toHaveCSS('opacity', '1');
        await page.mouse.wheel(0, 220);
        await expect(page.locator('.about-quote blockquote')).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
        ).toBe(true);
      }
    }
  );
}

for (const preference of ['reduce', 'no-preference', null] as const) {
  test(
    'Belief sticky steps with wheel and reverse: ' + (preference ?? 'system'),
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: preference });
      await page.setViewportSize({ width: 1440, height: 730 });
      await page.goto('/about-us');
      await expect(page.locator('#belief')).toHaveAttribute('data-belief-sticky', 'true');
      const stage = page.locator('.about-belief-stage');
      await expect(stage).toHaveCSS('position', 'sticky');
      const geometry = await page
        .locator('#belief')
        .evaluate((el) => ({
          start: el.getBoundingClientRect().top + scrollY - 68,
          range: el.clientHeight - innerHeight + 68,
        }));
      await page.evaluate((y) => window.scrollTo(0, y), geometry.start + 20);
      await expect
        .poll(() => stage.evaluate((el) => Math.round(el.getBoundingClientRect().top)))
        .toBe(68);
      const active = page.locator('.about-principle[data-active=true]');
      const seen = new Set<string>();
      for (let i = 0; i < 22; i++) {
        seen.add(await active.locator('.about-principle-number').innerText());
        if (seen.size === 4) break;
        await page.mouse.wheel(0, 120);
        await page.waitForTimeout(160);
      }
      expect([...seen]).toEqual(['01', '02', '03', '04']);
      await expect(page.locator('.about-belief-copy')).toHaveCSS('opacity', '1');
      expect(await stage.evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(68);
      for (let i = 0; i < 18; i++) {
        if ((await active.locator('.about-principle-number').innerText()) === '01') break;
        await page.mouse.wheel(0, -120);
        await page.waitForTimeout(140);
      }
      await expect(active.locator('.about-principle-number')).toHaveText('01');
      await page.locator('.about-principles button').nth(2).click();
      await expect(page.locator('.about-principles button').nth(2)).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(stage).toHaveCSS('position', 'relative');
      await page.locator('.about-principles button').first().click();
      await expect(page.locator('.about-principles button').first()).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
      ).toBe(true);
      await page.setViewportSize({ width: 1366, height: 600 });
      await expect(stage).toHaveCSS('position', 'relative');
    }
  );
}

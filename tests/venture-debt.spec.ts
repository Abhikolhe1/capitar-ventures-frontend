import { test, expect } from '@playwright/test';

test('chapter timeline follows every section forward, backward and through the footer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/venture-debt');
  const ids = ['before', 'with-capitar', 'in-practice', 'before-you-decide'];
  for (const id of [...ids, ...ids.slice().reverse()]) {
    await page.locator(`#${id}`).evaluate(node => window.scrollTo(0, window.scrollY + node.getBoundingClientRect().top - 150));
    await expect(page.locator('.vd-chapters a[aria-current="location"]')).toHaveAttribute('href', `#${id}`);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator('.vd-chapters a[aria-current="location"]')).toHaveAttribute('href', '#before-you-decide');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#in-practice').evaluate(node => window.scrollTo(0, window.scrollY + node.getBoundingClientRect().top - 120));
  await expect(page.locator('.vd-chapters a[aria-current="location"]')).toHaveAttribute('href', '#in-practice');
  await page.locator('#before-you-decide').evaluate(node => window.scrollTo(0, window.scrollY + node.getBoundingClientRect().top - 120));
  await expect(page.locator('.vd-chapters a[aria-current="location"]')).toHaveAttribute('href', '#before-you-decide');
});

test('timeline scrolls away as the last section starts and returns on reverse scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/venture-debt');
  const timeline = page.locator('.vd-chapters');
  const lastTop = await page.locator('#before-you-decide').evaluate(node => window.scrollY + node.getBoundingClientRect().top);
  const height = await timeline.evaluate(node => (node as HTMLElement).offsetHeight);
  await page.evaluate(y => window.scrollTo(0, y), lastTop - height - 20);
  await expect.poll(() => timeline.evaluate(node => node.getBoundingClientRect().top)).toBe(0);
  await expect(page.locator('.vd-chapters a[aria-current="location"]')).toHaveAttribute('href', '#before-you-decide');
  await page.evaluate(y => window.scrollTo(0, y), lastTop - height / 2);
  await expect.poll(() => timeline.evaluate(node => node.getBoundingClientRect().top)).toBeLessThan(-height / 3);
  await page.evaluate(y => window.scrollTo(0, y), lastTop + 20);
  await expect.poll(() => timeline.evaluate(node => node.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await page.evaluate(y => window.scrollTo(0, y), lastTop - height - 20);
  await expect.poll(() => timeline.evaluate(node => node.getBoundingClientRect().top)).toBe(0);
});

test('In Practice reveals and reverses when scrolling in either direction', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/venture-debt');
  const heading = page.locator('#vd-practice-title');
  await expect(heading).toHaveCSS('opacity', '0');
  const position = await heading.evaluate(node => window.scrollY + node.getBoundingClientRect().top);
  await page.evaluate(y => window.scrollTo(0, y), position - 450);
  await expect(heading).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(heading).toHaveCSS('opacity', '0');
  await page.evaluate(y => window.scrollTo(0, y), position - 450);
  await expect(heading).toHaveCSS('opacity', '1');
  await page.locator('#before-you-decide').scrollIntoViewIfNeeded();
  await expect(heading).toHaveCSS('opacity', '0');
  await page.evaluate(y => window.scrollTo(0, y), position - 450);
  await expect(heading).toHaveCSS('opacity', '1');
});

test('both pinned sections advance all four items and reverse with scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/venture-debt');
  for (const [track, prefix] of [['.vd-signals-track', 'signal'], ['.vd-process-track', 'step']]) {
    const geometry = await page.locator(track).evaluate(node => {
      const panel = node.firstElementChild as HTMLElement;
      return {
        start: window.scrollY + node.getBoundingClientRect().top - parseFloat(getComputedStyle(panel).top),
        distance: (node as HTMLElement).offsetHeight - panel.offsetHeight,
        top: parseFloat(getComputedStyle(panel).top),
      };
    });
    expect(geometry.distance).toBeGreaterThan(2000);
    for (const index of [0, 1, 2, 3, 2, 1, 0]) {
      await page.evaluate(y => window.scrollTo(0, y), geometry.start + geometry.distance * ((index + .4) / 4));
      await expect(page.locator(`#${prefix}-${index}`)).toHaveAttribute('aria-expanded', 'true');
      if (prefix === 'signal') {
        await expect(page.locator('.vd-signal-number')).toHaveText(`0${index + 1}`);
        await expect(page.locator('.vd-signal-cube')).toHaveAttribute('style', `transform: rotate(${index * 12}deg);`);
        await expect(page.locator(`#signal-panel-${index}`)).toHaveAttribute('aria-hidden', 'false');
      }
      const panelTop = await page.locator(`${track} > .vd-pinned-panel`).evaluate(node => node.getBoundingClientRect().top);
      expect(Math.abs(panelTop - geometry.top)).toBeLessThan(2);
      await expect(page.locator(`#${prefix}-panel-${index}`)).toBeInViewport();
    }
    await page.screenshot({ path: `test-results/venture-debt-pinned-${prefix}.png` });
    await page.evaluate(y => window.scrollTo(0, y), geometry.start + geometry.distance + 180);
    await expect.poll(() => page.locator(`${track} > .vd-pinned-panel`).evaluate(node => node.getBoundingClientRect().top)).toBeLessThan(geometry.top - 100);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.locator('.vd-signals-grid').evaluate(node => getComputedStyle(node).position)).toBe('static');
});

test('venture debt sections, navigation, accordions and local assets', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/venture-debt');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Could venture debt be right for your next move?'
  );
  await expect(page.locator('main > section')).toHaveCount(5);
  await page.getByRole('button', { name: 'A clear use for the capital' }).click();
  await expect(page.locator('#signal-panel-1')).toBeVisible();
  await expect(page.locator('#signal-panel-0')).toBeHidden();
  await page.locator('#step-2').click();
  await expect(page.locator('#step-panel-2')).toBeVisible();
  await expect(page.locator('#step-panel-0')).toBeHidden();
  await page.locator('#faq-1').click();
  await expect(page.locator('#faq-panel-1')).toBeHidden();
  await page.locator('#faq-1').click();
  await expect(page.locator('#faq-panel-1')).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Venture debt sections' })
    .getByRole('link', { name: '01 Before', exact: true })
    .click();
  await expect(page).toHaveURL(/#before$/);
  await expect.poll(() => page.locator('[data-page-color-canvas]').count()).toBe(1);
  const images = await page.locator('main img').evaluateAll((nodes) =>
    nodes.map((node) => {
      const image = node as HTMLImageElement;
      const rect = image.getBoundingClientRect();
      return {
        src: image.src,
        loaded: image.complete && image.naturalWidth > 0,
        width: rect.width,
        height: rect.height,
      };
    })
  );
  expect(images.every((image) => image.loaded && image.width > 0 && image.height > 0)).toBe(true);
  expect(images.every((image) => !image.src.includes('figma.com'))).toBe(true);
  expect(errors).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/venture-debt');
  await expect.poll(() => page.locator('.vd-hero-art').evaluate(node => getComputedStyle(node).opacity)).toBe('1');
  await page.screenshot({ path: 'test-results/venture-debt-desktop.png', fullPage: true });
});

test('venture debt fits a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/venture-debt');
  await expect(page.locator('#vd-title')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await page.locator('#signal-3').click();
  await expect(page.locator('#signal-panel-3')).toBeVisible();
  await page.goto('/venture-debt');
  await expect.poll(() => page.locator('.vd-hero-art').evaluate(node => getComputedStyle(node).opacity)).toBe('1');
  await page.screenshot({ path: 'test-results/venture-debt-mobile.png', fullPage: true });
});

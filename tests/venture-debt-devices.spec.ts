import { test, expect } from '@playwright/test';

test('timeline uses the same desktop content edges as the header', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/venture-debt');
  await expect(page.locator('.vd-chapters a')).toHaveCount(4);
  await expect(
    page.getByRole('banner').getByRole('link', { name: 'Capitar Ventures home' })
  ).toBeVisible();
  const edges = await page.evaluate(() => {
    const logo = document
      .querySelector('header a[aria-label="Capitar Ventures home"]')!
      .getBoundingClientRect();
    const row = document.querySelector('header > div')!.getBoundingClientRect();
    const header = document.querySelector('header > div')!;
    const links = document.querySelectorAll('.vd-chapters a');
    return {
      left: links[0].getBoundingClientRect().left,
      logo: logo.left,
      right: links[links.length - 1].getBoundingClientRect().right,
      end: row.right - parseFloat(getComputedStyle(header).paddingRight),
    };
  });
  expect(Math.abs(edges.left - edges.logo)).toBeLessThan(2);
  expect(Math.abs(edges.right - edges.end)).toBeLessThan(2);
});

for (const size of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1366, height: 600 },
  { width: 1440, height: 900 },
]) {
  test(`scroll animation updates at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
    await page.goto('/venture-debt');
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20000 });
    const pinned = size.width >= 900 && size.height >= 640;
    for (const [selector, prefix] of [
      ['.vd-signals-track', 'signal'],
      ['.vd-process-track', 'step'],
    ]) {
      for (const index of [0, 1, 2, 3, 2, 1, 0]) {
        await page.locator(selector).evaluate(
          (track, args) => {
            const panel = track.firstElementChild as HTMLElement;
            const y = args.pinned
              ? window.scrollY +
                track.getBoundingClientRect().top -
                parseFloat(getComputedStyle(panel).top) +
                (((track as HTMLElement).offsetHeight - panel.offsetHeight) * (args.index + 0.4)) /
                  4
              : window.scrollY +
                track
                  .querySelector(`#${args.prefix}-${args.index}`)!
                  .closest('.vd-signal, .vd-step')!
                  .getBoundingClientRect().top -
                window.innerHeight * 0.5;
            window.scrollTo(0, y);
          },
          { index, prefix, pinned }
        );
        await expect(page.locator(`#${prefix}-${index}`)).toHaveAttribute('aria-expanded', 'true');
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    await page.locator('#vd-practice-title').scrollIntoViewIfNeeded();
    await expect(page.locator('#vd-practice-title')).toHaveCSS('opacity', '1');
  });
}

test('OS reduction keeps full site motion and foreground selection', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/**', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/venture-debt');
  await expect(page.locator('.vd-signals-grid')).toHaveCSS('position', 'sticky');
  await page.locator('#signal-2').click();
  await expect(page.locator('#signal-panel-2')).toBeVisible();
  await expect(page.locator('.vd-pixel-reveal')).toHaveAttribute('data-pixel-index', '2');
});

import { test, expect } from '@playwright/test';

type Sample = { index: string; progress: number; opacity: string };

for (const reducedMotion of ['reduce', 'no-preference', null] as const) {
  test(`signal artwork never precedes its reveal (${reducedMotion ?? 'system'})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
    await page.addInitScript(() => {
      localStorage.setItem('capitar-motion', 'reduced');
      const samples: Sample[] = [];
      (window as typeof window & { pixelSamples: Sample[] }).pixelSamples = samples;
      const sample = () => {
        const root = document.querySelector<HTMLElement>('.vd-pixel-reveal');
        const image = root?.querySelector('img');
        if (root && image) samples.push({
          index: root.dataset.pixelIndex!,
          progress: Number(root.dataset.revealProgress || 0),
          opacity: getComputedStyle(image).opacity,
        });
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.goto('/venture-debt');
    await page.locator('#signal-0').click();
    const root = page.locator('.vd-pixel-reveal');
    await expect(root).toHaveAttribute('data-reveal-progress', '1');
    const distance = await page.locator('.vd-signals-track').evaluate(el =>
      (el.clientHeight - el.firstElementChild!.clientHeight) / 4);
    await page.mouse.move(700, 450);
    for (const index of [1, 2, 3, 2, 1, 0]) {
      await page.mouse.wheel(0, distance * (index > Number(await root.getAttribute('data-pixel-index')) ? 1 : -1));
      await expect(root).toHaveAttribute('data-pixel-index', String(index));
      await expect(root).toHaveAttribute('data-reveal-progress', '1');
      await expect(root.locator('img')).toHaveCSS('opacity', '1');
    }
    const samples = await page.evaluate(() => (window as typeof window & { pixelSamples: Sample[] }).pixelSamples);
    expect(samples.filter(sample => sample.progress < 1 && sample.opacity !== '0')).toEqual([]);
    // Every newly selected source must first paint hidden, including reverse scroll.
    const firstFrames = samples.filter((sample, index) => index === 0 || sample.index !== samples[index - 1].index);
    expect(firstFrames.length).toBeGreaterThanOrEqual(7);
    expect(firstFrames.every(sample => sample.opacity === '0' && sample.progress < 1)).toBe(true);
  });
}

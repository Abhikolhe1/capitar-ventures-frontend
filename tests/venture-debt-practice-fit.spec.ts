import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const content = JSON.parse(fs.readFileSync(new URL('../src/content/venture-debt.json', import.meta.url), 'utf8'));
// Published CMS copy is longer than the Figma sample and must also fit in full.
content.practice.sectionLabel = 'VENTURE DEBT IN MOTION';
content.practice.heading = 'How has Venture Debt added value to companies such as yours?';
content.practice.quote = '“Capitar proved to be an ideal partner for our high-growth consumer brand by providing a timely bridge loan that powered our expansion and minimized early equity dilution, showcasing their exceptional flexibility & credit proficiency.”';
content.practice.attribution = 'BHARAT BHALLA & VARUN KAPUR, YU FOODS';

for (const preference of ['no-preference', 'reduce', null] as const) {
  test(`Venture Debt in Motion fits one desktop view with OS ${preference ?? 'system'}`, async ({ page }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: preference });
    await page.route('**/api/**', route => route.fulfill({ status: 503, body: '{}' }));
    await page.route('**/api/venture-debt', route => route.fulfill({ json: { data: content } }));
    await page.goto('/venture-debt', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false', { timeout: 20000 });
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#in-practice');
    for (const [width, height] of [[1440,900],[1366,730],[1280,600],[1024,768],[900,600]]) {
      await page.setViewportSize({width,height});
      await section.evaluate(e => scrollTo(0, e.getBoundingClientRect().top + scrollY - 62));
      await expect(section.locator('.vd-outcomes article')).toHaveCount(3);
      await expect(section.locator('.vd-outcomes article').last()).toHaveCSS('opacity', '1');
      const bounds = await section.evaluate(e => ({
        height:e.getBoundingClientRect().height,
        rows:[...e.querySelectorAll('.vd-outcomes article')].map(n=>n.getBoundingClientRect().top),
        image:e.querySelector('img.vd-office')!.getBoundingClientRect().toJSON(),
        outcomes:e.querySelector('.vd-outcomes')!.getBoundingClientRect().toJSON(),
        overflow:document.documentElement.scrollWidth>innerWidth,
        clipped:[...e.querySelectorAll('p,h2,h3,blockquote')].some(n=>n.scrollWidth>n.clientWidth+1),
      }));
      expect(bounds.height, `${width}x${height} section`).toBeLessThanOrEqual(height-62+1);
      expect(Math.max(...bounds.rows)-Math.min(...bounds.rows)).toBeLessThan(1);
      expect(bounds.outcomes.top).toBeGreaterThanOrEqual(bounds.image.bottom);
      expect(bounds.overflow || bounds.clipped).toBe(false);
      if(preference===null) await page.screenshot({path:`test-results/practice-fit-${width}-${height}.png`});
    }
    await page.setViewportSize({width:390,height:844});
    await expect(section.locator('.vd-practice-copy')).toHaveCSS('display','contents');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
  });
}

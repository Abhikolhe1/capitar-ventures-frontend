import fs from 'node:fs';
import { test, expect } from '@playwright/test';
const home = JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json', import.meta.url), 'utf8'));
const about = JSON.parse(fs.readFileSync(new URL('../src/content/about-us.json', import.meta.url), 'utf8'));
async function mock(page: import('@playwright/test').Page) {
  const members = about.people.team.map((m: object, i: number) => ({ ...m, name: 'Shared member ' + (i + 1), role: 'Partner', biography: 'Shared biography from the CMS.', image: { url: new URL('/assets/about/bikramjit-source.png', page.url() === 'about:blank' ? 'http://127.0.0.1:3040' : page.url()).href }, linkedinUrl: i === 1 ? 'https://linkedin.com.evil.example/profile' : 'https://www.linkedin.com/in/member-' + i + '/' }));
  await page.route('**/api/global', r => r.fulfill({ json: { data: home.global } }));
  await page.route('**/api/homepage', r => r.fulfill({ json: { data: home } }));
  await page.route('**/api/about-us', r => r.fulfill({ json: { data: { ...about, people: { ...about.people, team: members } } } }));
}
for (const width of [1440, 390]) {
 test('shared cards and LinkedIn work on home and About Us at ' + width, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mock(page);
  for (const path of ['/', '/about-us']) {
   await page.goto(path); await expect(page.locator('main')).toHaveAttribute('aria-busy', 'false');
   const cards = page.locator('main .about-team-card');
   await expect(cards).toHaveCount(9);
   const card = cards.first(); await card.scrollIntoViewIfNeeded(); await page.mouse.move(0, 0);
   await expect(card).toHaveCSS('background-color', 'rgb(237, 244, 249)');
   await expect(card).toHaveCSS('border-radius', '21.093px');
   const profile = card.getByRole('link', { name: 'Shared member 1 on LinkedIn' });
   await expect(profile).toBeVisible();
   await expect(profile).toHaveAttribute('href', 'https://www.linkedin.com/in/member-0/');
   await expect(profile).toHaveAttribute('target', '_blank');
   await expect(cards.nth(1).getByRole('link')).toHaveCount(0);
   await expect(cards.nth(1).locator('[data-team-linkedin]')).toHaveCount(1);
   const popupPromise = page.waitForEvent('popup');
   await page.context().route('https://www.linkedin.com/in/member-0/', r => r.fulfill({ body: 'LinkedIn profile destination' }));
   await profile.click(); const popup = await popupPromise; await popup.waitForLoadState();
   expect(popup.url()).toBe('https://www.linkedin.com/in/member-0/'); await popup.close();
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
   if (path === '/') {
    const track = page.getByRole('list', { name: 'Capitar team members' });
    if (width > 600) await page.getByRole('button', { name: 'Next team members' }).click();
    else await track.evaluate(e => e.scrollBy({ left: 350, behavior: 'instant' }));
    await expect.poll(() => track.evaluate(e => e.scrollLeft)).toBeGreaterThan(50);
   }
  }
 });
}
test('shared card biography responds to hover and mobile tap', async ({ page }) => {
 await mock(page); await page.goto('/'); await expect(page.getByText('Shared member 1', { exact: true })).toBeVisible();
 const card = page.locator('#team .about-team-card').first(); await card.scrollIntoViewIfNeeded();
 await page.mouse.move(0,0); await expect(card.locator('.about-team-bio')).toBeHidden();
 await card.hover(); await expect(card.locator('.about-team-bio')).toBeVisible();
 await page.mouse.move(0,0); await expect(card.locator('.about-team-bio')).toBeHidden();
 await card.getByRole('button').click(); await expect(card.getByRole('button')).toHaveAttribute('aria-expanded','true');
});
test('homepage remains usable when shared team endpoint is unavailable', async ({ page }) => {
 await page.route('**/api/about-us', r => r.fulfill({ status: 503, body: '{}' }));
 await page.route('**/api/global', r => r.fulfill({ json: { data: home.global } }));
 await page.route('**/api/homepage', r => r.fulfill({ json: { data: home } }));
 await page.goto('/'); await expect(page.locator('main')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('#team .about-team-card')).toHaveCount(home.team.members.length);
});

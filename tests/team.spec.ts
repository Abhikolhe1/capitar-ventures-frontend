import fs from 'node:fs';
import { test, expect } from '@playwright/test';

const fallback = JSON.parse(fs.readFileSync(new URL('../src/content/homepage.json', import.meta.url), 'utf8'));

const previewTeam = { ...fallback.team, members: fallback.team.members.map((member: { portrait: { url: string } }) => ({ ...member, portrait: { ...member.portrait, url: new URL(member.portrait.url, 'http://127.0.0.1:3039').href } })) };

async function mockCms(page: import('@playwright/test').Page, team = previewTeam) {
  await page.route('**/api/global', route => route.fulfill({ json: { data: fallback.global } }));
  await page.route('**/api/homepage', route => route.fulfill({ json: { data: { ...fallback, team } } }));
}

test('team matches the supplied content, scrolls, and fits desktop and mobile', async ({ page }) => {
  test.setTimeout(60000);
  await mockCms(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 1024, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const section = page.locator('#team');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { level: 2 })).toHaveText('The people behind every growth decision');
    await expect(section.getByRole('article')).toHaveCount(4);
    const difference = page.locator('#capitar-difference');
    await expect(difference.locator('article')).toHaveCount(4);
    expect(await difference.evaluate(element => !!(element.compareDocumentPosition(document.querySelector('#team')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBeTruthy();
    if (width >= 1024) {
      const card = section.getByRole('article').first();
      const bounds = (await card.boundingBox())!;
      expect(bounds.width).toBeCloseTo(398.03, 1);
      expect(bounds.height).toBeCloseTo(447.79, 1);
      await expect(card).toHaveCSS('border-radius', '8.65px');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const track = section.getByRole('list', { name: 'Capitar team members' });
    await expect(section.getByRole('button', { name: 'Previous team members' })).toBeDisabled();
    await section.getByRole('button', { name: 'Next team members' }).click();
    await expect.poll(() => track.evaluate(element => element.scrollLeft)).toBeGreaterThan(50);
    await expect(section.getByRole('button', { name: 'Previous team members' })).toBeEnabled();
    await section.getByRole('button', { name: 'Previous team members' }).click();
    await expect.poll(() => track.evaluate(element => element.scrollLeft)).toBeLessThan(3);
    await expect(section.getByRole('link')).toHaveCount(0);
    await expect(section.getByRole('img')).toHaveCount(4);
    await expect(section.getByRole('img').first()).toHaveCSS('object-position', '50% 32%');
    await expect.poll(() => section.getByRole('img').first().evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBeTruthy();
    await section.screenshot({ path: `test-results/team-${width}.png` });
  }
  expect(errors).toEqual([]);
});

test('team respects CMS content, safe LinkedIn profiles, and unavailable portraits', async ({ page }) => {
  await mockCms(page, { ...fallback.team, heading: 'Meet the team', members: [
    { name: 'CMS Member', role: 'Partner', portrait: { url: '/missing-team-photo.png' }, linkedinUrl: 'https://www.linkedin.com/in/example/' },
    { name: 'Second Member', role: 'Principal', linkedinUrl: 'https://linkedin.com.evil.example/profile' },
  ] });
  await page.route('**/missing-team-photo.png', route => route.abort());
  await page.goto('/');
  const section = page.locator('#team');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Meet the team');
  await expect(section.getByRole('article').first()).toHaveAttribute('aria-label', 'CMS Member, Partner');
  await expect(section.getByRole('link', { name: 'CMS Member on LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/example/');
  await expect(section.getByRole('link')).toHaveCount(1);
  await expect(section.getByRole('img')).toHaveCount(0);
});

test('disabled or empty CMS team is hidden, but an older API still gets preview content', async ({ page }) => {
  await mockCms(page, { ...fallback.team, enabled: false });
  await page.goto('/');
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#team')).toHaveCount(0);
  await page.unroute('**/api/homepage');
  await page.route('**/api/homepage', route => route.fulfill({ json: { data: { hero: fallback.hero } } }));
  await page.reload();
  await expect(page.locator('#team')).toHaveCount(1);
  await page.unroute('**/api/homepage');
  await page.route('**/api/homepage', route => route.fulfill({ json: { data: { hero: fallback.hero, team: { ...fallback.team, members: [] } } } }));
  await page.reload();
  await expect(page.locator('#main-content')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#team')).toHaveCount(0);
});

test('hovering the portrait or lower overlay reveals details without changing the portrait', async ({ page }) => {
  await mockCms(page, { ...fallback.team, members: [{ name: 'Preview Member', role: 'Partner', description: fallback.team.description, portrait: { url: 'http://127.0.0.1:3039/assets/images/4b4a17e26c457d60888c06b071f1bec93ba71ba1.jpg' } }] });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const section = page.locator('#team');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute('data-team-entered', 'true');
  await expect(section.locator('li').first()).toHaveCSS('opacity', '1');
  const photo = section.locator('.team-portrait');
  const card = section.getByRole('article');
  const name = card.getByRole('heading');
  const nameOffset = async () => (await name.boundingBox())!.y - (await card.boundingBox())!.y;
  const initialY = await nameOffset();
  const originalPortrait = await photo.getAttribute('src');
  const originalCrop = await photo.evaluate(element => getComputedStyle(element).objectPosition);
  const initialShadeHeight = (await card.locator('.team-shade').boundingBox())!.height;
  await expect(card.locator('.team-bio')).toBeHidden();
  await card.screenshot({ path: 'test-results/team-card-rest.png' });
  await photo.hover({ position: { x: 40, y: 40 } });
  await expect(photo).toHaveCSS('transform', 'none');
  await expect(card.locator('.team-bio')).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(card.locator('.team-bio')).toBeHidden();
  await card.locator('.team-card-content').hover();
  await expect(card.locator('.team-bio')).toBeVisible();
  await expect.poll(async () => initialY - await nameOffset()).toBeGreaterThan(40);
  await expect.poll(async () => (await card.locator('.team-shade').boundingBox())!.height - initialShadeHeight).toBeGreaterThan(60);
  await expect(photo).toHaveAttribute('src', originalPortrait!);
  await expect(photo).toHaveCSS('object-position', originalCrop);
  await expect(photo).toHaveCSS('transform', 'none');
  await card.screenshot({ path: 'test-results/team-card-hover.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(photo).toHaveCSS('transform', 'none');
  await expect(card.locator('.team-card-content')).toHaveCSS('transition-duration', '0s');
  await page.mouse.move(0, 0);
  await card.focus();
  await expect(card.locator('.team-bio')).toBeVisible();
});

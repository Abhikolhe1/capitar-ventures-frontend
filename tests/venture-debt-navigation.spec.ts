import { test, expect } from '@playwright/test';

test('header opens Venture Debt without reloading the document', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Venture Debt', exact: true });
  await expect(link).toBeVisible({ timeout: 15000 });
  await page.evaluate(() => { document.documentElement.dataset.navigationProbe = 'retained'; });
  await link.hover();
  await link.click();
  await expect(page).toHaveURL(/\/venture-debt$/);
  await expect(page.locator('#vd-title')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-navigation-probe', 'retained');
  await page.getByRole('banner').getByRole('link', { name: 'Capitar Ventures home' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-navigation-probe', 'retained');
});

test('mobile drawer navigation closes and opens Venture Debt without a document reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.evaluate(() => { document.documentElement.dataset.navigationProbe = 'mobile'; });
  await page.locator('#mobile-navigation').getByRole('link', { name: 'Venture Debt', exact: true }).click();
  await expect(page).toHaveURL(/\/venture-debt$/);
  await expect(page.locator('#vd-title')).toBeVisible();
  await expect(page.locator('#mobile-navigation')).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute('data-navigation-probe', 'mobile');
});

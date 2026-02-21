// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('unauthenticated user visiting /dashboard is redirected to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /secure login/i })).toBeVisible();
  });

  test('unauthenticated user visiting /dashboard/deductions is redirected to login', async ({
    page,
  }) => {
    await page.goto('/dashboard/deductions');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /secure login/i })).toBeVisible();
  });

  test('unauthenticated user visiting /dashboard/reports is redirected to login', async ({
    page,
  }) => {
    await page.goto('/dashboard/reports');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /secure login/i })).toBeVisible();
  });

  test('unauthenticated user visiting /dashboard/settings is redirected to login', async ({
    page,
  }) => {
    await page.goto('/dashboard/settings');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /secure login/i })).toBeVisible();
  });

  test('landing page loads and links to login', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/cukaipro/i).first()).toBeVisible();
    const loginLink = page.getByRole('link', { name: /start free trial/i }).first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});

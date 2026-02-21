// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('login page loads with Secure Login and CukaiPro branding', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /secure login/i })).toBeVisible();
    await expect(page.getByText(/cukaipro/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /create an account/i })).toBeVisible();
  });

  test('login form has email and password fields and can be filled', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByPlaceholder(/name@company\.com/i);
    const passwordInput = page.getByPlaceholder(/••••••••/);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill('test@example.com');
    await passwordInput.fill('Test1234');

    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('Test1234');
  });

  test('login flow - sign up link navigates to signup page', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: /create an account/i }).click();

    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByText(/cukaipro/i).first()).toBeVisible();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await expect(page.getByText(/cukaipro/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/name@company\.com/i)).toBeVisible();
    await expect(page.getByPlaceholder(/••••••••/)).toBeVisible();
  });
});

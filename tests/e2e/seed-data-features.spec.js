// @ts-check
/**
 * E2E: Run Playwright with seed/mock data — login then create and verify data in the UI.
 *
 * Run (live):
 *   PLAYWRIGHT_BASE_URL=https://cukaipro.vvsdigitalsolutions.com \
 *   E2E_LOGIN_EMAIL=your@email.com E2E_LOGIN_PASSWORD='yourpass' \
 *   npx playwright test tests/e2e/seed-data-features.spec.js --project=chromium
 */
import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_LOGIN_EMAIL || '';
const E2E_PASSWORD = process.env.E2E_LOGIN_PASSWORD || '';

// Seed/mock data for E2E
const SEED = {
  client: {
    name: 'E2E Seed Client Sdn Bhd',
    tin: '12345678901234',
    email: 'seed@e2e-test.com',
    phone: '+60123456789',
  },
};

async function login(page) {
  await page.goto('/login');
  await page.getByPlaceholder(/name@company\.com/i).fill(E2E_EMAIL);
  await page.getByPlaceholder(/••••••••/).fill(E2E_PASSWORD);
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

test.describe('Seed data features', () => {
  test.beforeEach(() => {
    if (!E2E_EMAIL || !E2E_PASSWORD) {
      test.skip(true, 'E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD must be set');
    }
  });

  test('login then add client with seed data and verify success', async ({ page }) => {
    await login(page);

    await page.goto('/dashboard');
    await page.getByRole('button', { name: /point_of_sale Sales/i }).click();
    await page.getByRole('link', { name: /add company\/client/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/sales\/add-client/);
    await expect(page.getByPlaceholder(/e\.g\. TechMaju/i)).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder(/e\.g\. TechMaju/i).fill(SEED.client.name);
    await page.getByPlaceholder(/12345678901234/).fill(SEED.client.tin);
    await page.getByPlaceholder(/billing@company\.com/).fill(SEED.client.email);
    await page.getByPlaceholder(/optional/i).fill(SEED.client.phone);
    await page.getByRole('button', { name: /add client/i }).click();

    await expect(page.getByText(/client added successfully/i)).toBeVisible({ timeout: 10000 });
  });

  test('login then dashboard shows main content (seed data context)', async ({ page }) => {
    await login(page);

    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText(/cukaipro/i).first()).toBeVisible();
  });

  test('login then reports page loads with seed data context', async ({ page }) => {
    await login(page);

    await page.goto('/dashboard/reports');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 8000 });
  });

  test('login then sales quotation list loads', async ({ page }) => {
    await login(page);

    await page.goto('/dashboard/sales/quotation');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('main')).toBeVisible({ timeout: 8000 });
  });
});

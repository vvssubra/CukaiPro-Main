// @ts-check
/**
 * E2E: Login with real credentials and smoke-test all dashboard features.
 *
 * Prerequisites for real login:
 * - .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * - In Supabase: Authentication → URL Configuration, add http://localhost:3000 to Redirect URLs
 * - Supabase project is not paused
 *
 * Run with:
 *   E2E_LOGIN_EMAIL=your@email.com E2E_LOGIN_PASSWORD='yourpass' npx playwright test tests/e2e/all-features.spec.js --project=chromium
 */
import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_LOGIN_EMAIL || '';
const E2E_PASSWORD = process.env.E2E_LOGIN_PASSWORD || '';

/** Dashboard routes to smoke-test after login */
const DASHBOARD_ROUTES = [
  { path: '/dashboard', name: 'Dashboard home' },
  { path: '/dashboard/invoices', name: 'Invoices' },
  { path: '/dashboard/sales/add-client', name: 'Add company' },
  { path: '/dashboard/sales/quotation', name: 'Quotation' },
  { path: '/dashboard/sales/invoices', name: 'Sales Invoices' },
  { path: '/dashboard/sales/credit-notes', name: 'Credit Note' },
  { path: '/dashboard/sales/reports/monthly-analysis', name: 'Monthly' },
  { path: '/dashboard/sales/reports/profit-loss', name: 'Profit' },
  { path: '/dashboard/sales/reports/documents', name: 'Documents' },
  { path: '/dashboard/taxes', name: 'Taxes' },
  { path: '/dashboard/deductions', name: 'Deductions' },
  { path: '/dashboard/tax-filing', name: 'Filing' },
  { path: '/dashboard/sst-filing', name: 'SST' },
  { path: '/dashboard/taxes/ea-form', name: 'EA' },
  { path: '/dashboard/settings', name: 'Settings' },
  { path: '/dashboard/reports', name: 'Reports' },
  { path: '/dashboard/reports/balance-sheet', name: 'Balance' },
  { path: '/dashboard/reports/profit-loss', name: 'Profit' },
  { path: '/dashboard/reports/ledger', name: 'Ledger' },
  { path: '/dashboard/reports/journal', name: 'Journal' },
  { path: '/dashboard/reports/tax-transaction-listing', name: 'Tax' },
  { path: '/dashboard/reports/sst-processor', name: 'SST' },
  { path: '/dashboard/reports/bank-reconciliation', name: 'Bank' },
  { path: '/dashboard/accounts', name: 'Chart of Accounts' },
  { path: '/dashboard/transactions', name: 'Transactions' },
  { path: '/dashboard/help', name: 'Help' },
  { path: '/dashboard/guide', name: 'Guide' },
];

async function loginAndAssertOrSkip(page) {
  await page.goto('/login');
  await page.getByPlaceholder(/name@company\.com/i).fill(E2E_EMAIL);
  await page.getByPlaceholder(/••••••••/).fill(E2E_PASSWORD);
  await page.getByRole('button', { name: /login/i }).click();

  const dashboardArrived = page.waitForURL(/\/dashboard/, { timeout: 12000 }).catch(() => null);
  const connectionError = page.getByText(/connection failed/i).waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);

  const result = await Promise.race([
    dashboardArrived.then(() => 'dashboard'),
    connectionError.then(() => 'connection_failed'),
  ]);

  if (result === 'connection_failed') {
    test.skip(
      true,
      'Supabase connection failed. Add http://localhost:3000 to Supabase Auth → URL Configuration → Redirect URLs and ensure .env has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
  if (result !== 'dashboard') {
    const errBox = page.locator('[class*="red-50"], [class*="red-900"]').first();
    const errText = (await errBox.textContent().catch(() => '')) || (await page.locator('main').textContent()) || 'Unknown error';
    throw new Error(`Login did not redirect to dashboard. Page may show: ${errText.slice(0, 200)}`);
  }
  await expect(page.getByText(/cukaipro/i).first()).toBeVisible();
}

test.describe('All features (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    if (!E2E_EMAIL || !E2E_PASSWORD) {
      test.skip(true, 'E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD must be set');
    }
  });

  test('login with credentials and reach dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder(/name@company\.com/i).fill(E2E_EMAIL);
    await page.getByPlaceholder(/••••••••/).fill(E2E_PASSWORD);
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/cukaipro/i).first()).toBeVisible();
  });

  test('all dashboard routes load after login', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/name@company\.com/i).fill(E2E_EMAIL);
    await page.getByPlaceholder(/••••••••/).fill(E2E_PASSWORD);
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    for (const { path } of DASHBOARD_ROUTES) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.locator('body')).toBeVisible();
      const mainOrHeading = page.getByRole('main').or(page.getByRole('heading').first());
      await expect(mainOrHeading).toBeVisible({ timeout: 8000 });
    }
  });
});

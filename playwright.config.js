/* global process */
// @ts-check
// https://playwright.dev/docs/test-configuration

import { defineConfig, devices } from '@playwright/test';

const useLiveUrl = !!process.env.PLAYWRIGHT_BASE_URL;

/**
 * Playwright config for CukaiPro E2E tests.
 * Run: npm run test:e2e
 * Against live site: PLAYWRIGHT_BASE_URL=https://cukaipro.vvsdigitalsolutions.com npx playwright test tests/e2e/all-features.spec.js --project=chromium
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  ...(useLiveUrl
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        },
      }),
});

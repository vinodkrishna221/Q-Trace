import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Q-Trace web application.
 * Card: QA-6 · Automate the learner-led Playwright journey
 *
 * Configures:
 * - Local-mode target (http://localhost:3000)
 * - Retain trace and video only on failure
 * - Single-worker deterministic execution
 * - Automated webServer dev server startup with existing server reuse
 */

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts/,
  timeout: 180 * 1000,
  expect: {
    timeout: 30 * 1000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1366, height: 768 },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
      },
    },
  ],
  webServer: {
    command: 'node node_modules/next/dist/bin/next dev --turbo -p 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 180 * 1000,
  },
});

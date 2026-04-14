import { defineConfig, devices } from '@playwright/test'

/**
 * E2E tests run against the full Docker stack.
 *
 * Start the stack before running:
 *   docker compose up --build -d
 *
 * Then run:
 *   npx playwright test
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

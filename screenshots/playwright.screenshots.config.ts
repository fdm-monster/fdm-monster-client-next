import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for automated documentation screenshots
 * Chrome-only, desktop-focused configuration for screenshot automation
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './suites',

  // Screenshot tests can take longer due to waiting for animations
  timeout: 90 * 1000,

  // Run tests sequentially for predictable screenshot generation
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying failed tests
    trace: 'retain-on-failure',

    // Screenshot configuration
    screenshot: 'only-on-failure',

    // Video configuration - only on failure to help debug
    video: 'retain-on-failure',

    // Consistent viewport for all desktop screenshots
    viewport: { width: 1920, height: 1080 },

    // Allow more time for screenshot operations
    actionTimeout: 10 * 1000,
  },

  // CHROME ONLY - Desktop focus, no mobile/tablet matrix (for now)
  projects: [
    {
      name: 'chrome-screenshots',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Enable headed mode via HEADED=1 environment variable for debugging
        headless: !process.env.HEADED,
      },
    },
  ],

  // Conditional webServer - skip if SKIP_DEV_SERVER=1 (for CI where server runs separately)
  webServer: process.env.SKIP_DEV_SERVER ? undefined : {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

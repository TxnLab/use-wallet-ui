import { defineConfig, devices } from '@playwright/test'

const CI = !!process.env.CI

export default defineConfig({
  testDir: './tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only was left in source
  forbidOnly: CI,

  // Retry on CI only
  retries: CI ? 2 : 0,

  // Limit parallel workers on CI
  workers: CI ? 1 : undefined,

  // Reporter configuration
  reporter: CI
    ? [['html', { outputFolder: 'playwright-report' }], ['github']]
    : [['html', { outputFolder: 'playwright-report' }]],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:5173',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'on-first-retry',
  },

  // Snapshot configuration for visual regression
  expect: {
    toHaveScreenshot: {
      // Allow 1% pixel difference for anti-aliasing
      maxDiffPixelRatio: 0.01,

      // Threshold for color difference
      threshold: 0.2,

      // Animation stabilization
      animations: 'disabled',
    },
    toMatchSnapshot: {
      // Threshold for image comparison
      threshold: 0.2,
    },
  },

  // Configure projects for different browsers and scenarios
  projects: [
    // Desktop Chrome - Light Mode (default)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Desktop Chrome - Dark Mode (system preference)
    {
      name: 'chromium-dark',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
      },
    },

    // Desktop Firefox
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    // Desktop Safari
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],

  // Web server configuration - start example app before tests
  webServer: {
    command: 'pnpm --filter @txnlab/use-wallet-ui-react-example dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !CI,
    timeout: 120000,
    cwd: '..',
  },
})

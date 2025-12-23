import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for visual and E2E testing.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    /* Base URL for navigation */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",

    /* Force dark color scheme to match app's default theme */
    colorScheme: "dark",

    /* Collect trace on first retry */
    trace: "on-first-retry",

    /* Screenshots on failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  /* Run local dev server before tests if not testing against deployed URL */
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});

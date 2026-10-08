import { defineConfig, devices } from "@playwright/test";

/**
 * Every test mocks the backend API via page.route before navigating (see
 * tests/fixtures/mock-api.ts), so this suite only needs the Next.js
 * frontend running - the FastAPI/Docker backend is never required.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  /* HTML report (npm run test:e2e:report) is the failure artifact: it
   * includes a trace, screenshot and video for any failed test. */
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "unit",
      testDir: "./tests/unit",
    },
    {
      name: "e2e",
      testIgnore: "unit/**",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

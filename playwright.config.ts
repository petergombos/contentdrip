import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import { resolve } from "path";

// Load test environment variables
const envTest = config({ path: resolve(__dirname, ".env.test") });

// Merge .env.test into a single env object for the web server
const testEnv: Record<string, string> = {};
if (envTest.parsed) {
  for (const [key, value] of Object.entries(envTest.parsed)) {
    testEnv[key] = value;
  }
}

const TEST_PORT = process.env.E2E_PORT ?? "3099";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Run tests serially since they share DB state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Single worker to avoid DB conflicts
  reporter: "html",
  timeout: 60_000,

  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",

  use: {
    baseURL: `http://localhost:${TEST_PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `npx next dev --webpack --port ${TEST_PORT}`,
    url: `http://localhost:${TEST_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      ...testEnv,
      NODE_ENV: "development",
      APP_BASE_URL: `http://localhost:${TEST_PORT}`,
    },
  },
});

import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // npm run test:e2e builds with matching overrides before starting this server.
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: `${baseURL}/admin/login`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      SUPABASE_URL: "",
      SUPABASE_ANON_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
      DATABASE_URL: "",
      CRON_SECRET: "",
      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
      NEXT_PUBLIC_SITE_URL: baseURL,
    },
  },
});

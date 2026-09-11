import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Keep these overrides aligned with playwright.config.ts and quality.yml.
// Explicit empty values take precedence over Next's local environment files.
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  cwd: fileURLToPath(new URL("../", import.meta.url)),
  stdio: "inherit",
  env: {
    ...process.env,
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
    NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100",
  },
});

child.on("error", (error) => {
  console.error("E2E build failed to start:", error);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});

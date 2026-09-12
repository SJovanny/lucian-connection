/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
const migrations = fs.readdirSync(migrationsDir)
  .filter((file) => /^\d{12}_[a-z0-9_]+\.sql$/.test(file))
  .sort();

if (migrations.length === 0) {
  throw new Error("Aucune migration SQL trouvée.");
}

for (const migration of migrations) {
  execFileSync(process.execPath, [
    path.join(process.cwd(), "scripts", "apply_migration.js"),
    path.join("supabase", "migrations", migration),
  ], { stdio: "inherit" });
}

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const migrationFile = process.argv[2];
if (!migrationFile) {
  throw new Error("Usage: node scripts/apply_migration.js <path-to-sql-file>");
}

const envPath = path.join(process.cwd(), ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const match = env.match(/^DATABASE_URL=(.+)$/m);
if (!match) {
  throw new Error("DATABASE_URL not found in .env.local");
}
const connectionString = match[1].trim();
const sql = fs.readFileSync(path.join(process.cwd(), migrationFile), "utf8");

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`Applied migration: ${migrationFile}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

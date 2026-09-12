/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { createDatabaseClient } = require("./db_connection");

const migrationFile = process.argv[2];
if (!migrationFile) {
  throw new Error("Usage: node scripts/apply_migration.js <path-to-sql-file>");
}

const absoluteMigrationPath = path.resolve(process.cwd(), migrationFile);
const migrationName = path.basename(absoluteMigrationPath);
const migrationMatch = migrationName.match(/^(\d{12})_([a-z0-9_]+)\.sql$/);
if (!migrationMatch) {
  throw new Error("Migration filename must match YYYYMMDDHHMM_name.sql");
}
const [, version, name] = migrationMatch;
const sql = fs.readFileSync(absoluteMigrationPath, "utf8");

async function main() {
  const client = createDatabaseClient();
  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      ["lucian-connection:migrations"]
    );

    const { rows } = await client.query(
      "SELECT name FROM supabase_migrations.schema_migrations WHERE version = $1 FOR UPDATE",
      [version]
    );
    if (rows[0]) {
      if (rows[0].name !== name) {
        throw new Error(`Migration ${version} is already recorded with another name`);
      }
      await client.query("COMMIT");
      console.log(`Migration already applied: ${migrationFile}`);
      return;
    }

    await client.query(sql);
    await client.query(
      "INSERT INTO supabase_migrations.schema_migrations (version, statements, name) VALUES ($1, $2, $3)",
      [version, [sql], name]
    );
    await client.query("COMMIT");
    console.log(`Applied migration: ${migrationFile}`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

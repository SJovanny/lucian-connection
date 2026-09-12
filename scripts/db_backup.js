/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { getDatabaseConfig, getLibpqEnvironment } = require("./db_connection");

const envArg = process.argv[2] || "prod";
if (!["prod", "local"].includes(envArg)) {
  throw new Error("Usage: node scripts/db_backup.js [prod|local] (défaut: prod)");
}
const envFile = envArg === "local" ? ".env.local" : ".env.prod";

const { connectionString, caPath } = getDatabaseConfig(envFile);

// pg_dump n'est pas toujours dans le PATH (ex: libpq installé via Homebrew
// est "keg-only" et n'est pas symlinké automatiquement). On cherche dans le
// PATH puis dans les emplacements Homebrew connus avant d'abandonner.
function resolvePgDump() {
  const candidates = [
    "pg_dump",
    "/opt/homebrew/opt/libpq/bin/pg_dump",
    "/opt/homebrew/opt/postgresql/bin/pg_dump",
    "/usr/local/opt/libpq/bin/pg_dump",
    "/usr/local/opt/postgresql/bin/pg_dump",
  ];
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ["--version"], { stdio: "ignore" });
      return candidate;
    } catch {
      // essaie le suivant
    }
  }
  throw new Error(
    "pg_dump introuvable. Installe les outils client PostgreSQL avec: brew install libpq"
  );
}

const pgDump = resolvePgDump();

const backupsDir = path.join(process.cwd(), "backups");
fs.mkdirSync(backupsDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outFile = path.join(backupsDir, `${envArg}_${timestamp}.dump`);

console.log(`Sauvegarde de la base "${envArg}" (schéma public) vers ${outFile} ...`);

execFileSync(
  pgDump,
  [
    connectionString,
    "--schema=public",
    "--no-owner",
    "--no-privileges",
    "--format=custom",
    "--file",
    outFile,
  ],
  { stdio: "inherit", env: getLibpqEnvironment(caPath) }
);

const { size } = fs.statSync(outFile);
console.log(`Sauvegarde terminée: ${outFile} (${(size / 1024 / 1024).toFixed(2)} MB)`);
console.log(
  `Pour restaurer: pg_restore --no-owner --no-privileges --clean --if-exists -d "<CONNECTION_STRING>" "${outFile}"`
);

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { Client } = require("pg");

function parseEnvFile(filePath) {
  const values = {};
  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) continue;
    const value = match[2].trim();
    values[match[1]] = value.replace(/^(["'])(.*)\1$/, "$2");
  }

  return values;
}

function resolvePath(value) {
  return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

function getCaPath() {
  const configuredPath = process.env.SUPABASE_DB_CA || process.env.PGSSLROOTCERT;
  if (!configuredPath) {
    throw new Error(
      "SUPABASE_DB_CA est requis. Pointez-le vers le certificat CA PostgreSQL Supabase."
    );
  }

  const caPath = resolvePath(configuredPath);
  if (!fs.existsSync(caPath)) {
    throw new Error(`Certificat CA introuvable: ${caPath}`);
  }

  return caPath;
}

function getDatabaseConfig(envFile = ".env.local") {
  const envPath = path.join(process.cwd(), envFile);
  if (!fs.existsSync(envPath)) {
    throw new Error(`${envFile} introuvable à la racine du projet.`);
  }

  const env = parseEnvFile(envPath);
  const connectionString = env.DIRECT_URL || env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(`DIRECT_URL ou DATABASE_URL introuvable dans ${envFile}`);
  }

  const databaseUrl = new URL(connectionString);
  if (!databaseUrl.protocol.startsWith("postgres")) {
    throw new Error(`URL PostgreSQL invalide dans ${envFile}`);
  }

  const caPath = getCaPath();
  return {
    connectionString,
    caPath,
    clientOptions: {
      host: databaseUrl.hostname,
      port: Number(databaseUrl.port || 5432),
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      database: databaseUrl.pathname.replace(/^\//, "") || "postgres",
      ssl: {
        ca: fs.readFileSync(caPath, "utf8"),
        rejectUnauthorized: true,
      },
      connectionTimeoutMillis: 15_000,
    },
  };
}

function createDatabaseClient(envFile = ".env.local") {
  return new Client(getDatabaseConfig(envFile).clientOptions);
}

function getLibpqEnvironment(caPath) {
  return {
    ...process.env,
    PGSSLROOTCERT: caPath,
    PGSSLMODE: "verify-full",
  };
}

module.exports = {
  createDatabaseClient,
  getDatabaseConfig,
  getLibpqEnvironment,
  parseEnvFile,
};

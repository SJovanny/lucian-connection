const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const envPath = path.join(process.cwd(), ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const match = env.match(/^DATABASE_URL=(.+)$/m);
if (!match) {
  throw new Error("DATABASE_URL not found in .env.local");
}
const connectionString = match[1].trim();

const sql = `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
    CREATE TYPE public.role_enum AS ENUM ('customer', 'admin');
  END IF;
END $$;

-- Drop policies that reference profiles.role directly
DROP POLICY IF EXISTS "Coupons editable by admins" ON coupons;
DROP POLICY IF EXISTS "Admins can insert reductions" ON reductions;
DROP POLICY IF EXISTS "Admins can update reductions" ON reductions;
DROP POLICY IF EXISTS "Admins can delete reductions" ON reductions;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.profiles
  ALTER COLUMN role TYPE public.role_enum
  USING role::public.role_enum;
ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'customer';

-- Recreate admin policies using is_admin()
CREATE POLICY "Coupons editable by admins"
  ON coupons FOR ALL
  USING (is_admin());

CREATE POLICY "Admins can insert reductions"
  ON reductions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update reductions"
  ON reductions FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete reductions"
  ON reductions FOR DELETE
  TO authenticated
  USING (is_admin());
`;

(async () => {
  const client = new Client({ connectionString });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("Role enum applied");
})();

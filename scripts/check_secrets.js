/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const { execFileSync } = require("child_process");

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const secretPatterns = [
  { name: "Stripe secret", pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/g },
  { name: "Stripe webhook secret", pattern: /\bwhsec_[A-Za-z0-9]{20,}\b/g },
  {
    name: "Supabase service-role assignment",
    pattern: /^SUPABASE_SERVICE_ROLE_KEY=(?!your-|$).+/gm,
  },
  {
    name: "Database credential assignment",
    pattern: /^(?:DATABASE_URL|DIRECT_URL)=postgres(?:ql)?:\/\/[^:\s]+:(?!your-|password)[^@\s]+@/gm,
  },
];

const findings = [];
for (const file of trackedFiles) {
  let content;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) findings.push(`${file}: ${name}`);
  }
}

if (findings.length > 0) {
  console.error("Potential secrets detected in tracked files:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`Secret scan passed for ${trackedFiles.length} tracked files.`);

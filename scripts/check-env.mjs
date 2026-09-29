import { existsSync, readFileSync } from "node:fs";

function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
    break;
  }
}

loadLocalEnv();

const coreRequired = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
];

const production = process.env.NODE_ENV === "production" || process.env.CHECK_PRODUCTION === "1";
const required = production
  ? [...coreRequired, "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]
  : coreRequired;
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing required ${production ? "production " : ""}environment variables: ${missing.join(", ")}`);
  console.error("Load them from the deployment environment or a local .env file before launch.");
  process.exit(1);
}

if (production && !process.env.VERCEL && !process.env.VERCEL_OIDC_TOKEN && !process.env.VERCEL_QUEUE_API_TOKEN) {
  console.error("Missing Vercel Queue authentication. Set VERCEL_OIDC_TOKEN or VERCEL_QUEUE_API_TOKEN.");
  process.exit(1);
}

console.log(`Environment preflight passed (${production ? "production" : "development"}).`);

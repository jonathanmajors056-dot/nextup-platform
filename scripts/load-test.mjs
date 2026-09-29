import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const parsedBaseUrl = new URL(baseUrl);
if (!/^https?:$/.test(parsedBaseUrl.protocol)) {
  throw new Error("BASE_URL must use http or https.");
}

const script = fileURLToPath(new URL("../tests/load/opportunities.k6.js", import.meta.url));
if (!existsSync(script)) throw new Error(`Load test script not found: ${script}`);

const env = {
  ...process.env,
  BASE_URL: baseUrl.replace(/\/$/, ""),
  LOAD_RPS: process.env.LOAD_RPS ?? "50",
  LOAD_DURATION: process.env.LOAD_DURATION ?? "2m",
};

const result = spawnSync("k6", ["run", script], { env, stdio: "inherit" });
if (result.error?.code === "ENOENT") {
  console.error("k6 is not installed or not on PATH. Install it from https://k6.io/docs/get-started/installation/");
  process.exit(1);
}
process.exit(result.status ?? 1);

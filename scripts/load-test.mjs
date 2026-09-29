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

function percentile(values, fraction) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

async function runNativeFallback() {
  const total = Math.max(1, Number(process.env.LOAD_REQUESTS ?? 200));
  const concurrency = Math.max(1, Math.min(total, Number(process.env.LOAD_CONCURRENCY ?? 25)));
  const timeoutMs = Math.max(1000, Number(process.env.LOAD_TIMEOUT_MS ?? 10000));
  const results = [];
  let next = 0;

  async function worker() {
    while (next < total) {
      const index = next++;
      const path = index % 5 === 0 ? "/" : "/api/opportunities?limit=24";
      const started = performance.now();
      try {
        const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(timeoutMs) });
        await response.arrayBuffer();
        results.push({ path, status: response.status, ok: response.ok, duration: performance.now() - started });
      } catch (error) {
        results.push({ path, status: 0, ok: false, duration: performance.now() - started, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const failures = results.filter((result) => !result.ok);
  const feed = results.filter((result) => result.path.startsWith("/api/"));
  const home = results.filter((result) => result.path === "/");
  const feedP95 = percentile(feed.map((result) => result.duration), 0.95);
  const homeP95 = percentile(home.map((result) => result.duration), 0.95);
  const errorRate = failures.length / results.length;

  console.log(`Native load fallback: ${results.length} requests, concurrency ${concurrency}, base ${baseUrl}`);
  console.log(JSON.stringify({
    failures: failures.length,
    errorRate: Number(errorRate.toFixed(4)),
    feed: { requests: feed.length, p95Ms: Math.round(feedP95) },
    home: { requests: home.length, p95Ms: Math.round(homeP95) },
    statuses: Object.fromEntries(results.reduce((counts, result) => counts.set(result.status, (counts.get(result.status) ?? 0) + 1), new Map())),
  }, null, 2));

  if (errorRate > 0.01) throw new Error(`Native load test error rate exceeded 1%: ${failures.length}/${results.length}`);
  if (feedP95 > 800) throw new Error(`Native feed p95 exceeded 800ms: ${Math.round(feedP95)}ms`);
  if (homeP95 > 1500) throw new Error(`Native home p95 exceeded 1500ms: ${Math.round(homeP95)}ms`);
}

const result = spawnSync("k6", ["run", script], { env, stdio: "inherit" });
if (result.error?.code === "ENOENT") {
  console.warn("k6 is not installed; running the dependency-free Node load profile instead.");
  await runNativeFallback();
  process.exit(0);
}
process.exit(result.status ?? 1);

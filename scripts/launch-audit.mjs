const baseUrl = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 10000);

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, { ...options, signal: controller.signal });
    const text = await response.text();
    let body = text;
    try {
      body = JSON.parse(text);
    } catch {
      // Keep HTML/text responses available for useful assertion errors.
    }
    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectStatus(name, path, expected, options) {
  const { response, body } = await request(path, options);
  assert(response.status === expected, `${name}: expected ${expected}, received ${response.status}: ${JSON.stringify(body).slice(0, 240)}`);
  return { response, body };
}

const checks = [];
const record = (name) => checks.push(name);

const home = await expectStatus("home page", "/", 200);
assert(typeof home.body === "string" && home.body.includes("Find one opportunity worth your week."), "home page: expected primary heading");
record("home page renders");

const feed = await expectStatus("published feed", "/api/opportunities?limit=2", 200);
assert(Array.isArray(feed.body?.data) && feed.body.data.length > 0, "published feed: expected at least one opportunity");
assert(typeof feed.body.data[0].id === "string", "published feed: expected stable opportunity id");
record("published feed returns data");

const opportunityId = encodeURIComponent(feed.body.data[0].id);
const detail = await expectStatus("opportunity detail", `/api/opportunities/${opportunityId}`, 200);
assert(detail.body?.opportunity?.id === feed.body.data[0].id, "opportunity detail: response id mismatch");
record("opportunity detail matches feed");

await expectStatus("missing opportunity", "/api/opportunities/does-not-exist", 404);
record("missing opportunity returns 404");

await expectStatus("missing opportunity save", "/api/opportunities/does-not-exist/save", 404, { method: "POST" });
record("missing save is rejected");

await expectStatus("invalid progress", `/api/opportunities/${opportunityId}/progress`, 400, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ status: "admin" }),
});
record("invalid progress is rejected");

await expectStatus("invalid analytics event", "/api/events", 400, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ event: "drop-table" }),
});
record("invalid analytics event is rejected");

await expectStatus("short submission", "/api/submissions", 400, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ rawText: "too short" }),
});
record("short submission is rejected");

await expectStatus("oversized submission", "/api/submissions", 400, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ rawText: "x".repeat(30001) }),
});
record("oversized submission is rejected");

await expectStatus("unsafe source URL", "/api/submissions", 400, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ rawText: "A valid enough opportunity message for testing.", sourceUrl: "javascript:alert(1)" }),
});
record("unsafe source URL is rejected");

await expectStatus("wrong feed method", "/api/opportunities", 405, { method: "POST", body: "{}" });
record("unsupported method is rejected");

await expectStatus("unsigned queue callback", "/api/queues/process-submission", 400, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ submissionId: "not-a-real-submission" }),
});
record("unsigned queue callback is rejected");

console.log(`Launch smoke audit passed: ${checks.length} checks against ${baseUrl}`);
for (const check of checks) console.log(`- ${check}`);

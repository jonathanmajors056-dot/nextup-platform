const base = process.env.NEXTUP_URL || "http://localhost:3000";

async function request(path, options) {
  const response = await fetch(`${base}${path}`, options);
  if (!response.ok) throw new Error(`${options?.method ?? "GET"} ${path} returned ${response.status}`);
  return response;
}

const htmlChecks = ["/", "/admin", "/saved", "/opportunities/opportunity-ai-hackathon", "/newsportal", "/newsportal/news-ai-india"];
for (const path of htmlChecks) {
  const body = await (await request(path)).text();
  if (!body.includes("NextUp")) throw new Error(`${path} did not render the NextUp shell`);
}

const health = await (await request("/api/health")).json();
if (health.service !== "nextup" || !Array.isArray(health.items)) throw new Error("Health API did not return readiness items");

const feed = await (await request("/api/opportunities?lat=12.9716&lng=77.5946&radiusKm=50")).json();
if (!Array.isArray(feed.data)) throw new Error("Opportunity API did not return data[]");
const providers = await (await request("/api/admin/providers")).json();
if (!Array.isArray(providers.providers)) throw new Error("Provider API did not return providers[]");
const location = await (await request("/api/location/preferences")).json();
if (!("preference" in location)) throw new Error("Location API did not return preference");
const expiry = await (await request("/api/admin/expire", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).json();
if (typeof expiry.archived !== "number") throw new Error("Expiry API did not return archived count");

const mapResponse = await fetch(`${base}/api/maps/static?center=12.9716%2C77.5946`);
if (![200, 503].includes(mapResponse.status)) throw new Error(`Map fallback returned unexpected ${mapResponse.status}`);

const news = await (await request("/api/news")).json();
if (!Array.isArray(news.items) || news.items.length === 0) throw new Error("News API did not return items[]");
const videos = await (await request("/api/news/videos")).json();
if (!Array.isArray(videos.items)) throw new Error("News video API did not return items[]");
const newsHealth = await (await request("/api/news/sources/health")).json();
if (!Array.isArray(newsHealth.providers)) throw new Error("News source health API did not return providers[]");

console.log(`NextUp local verification passed: ${feed.data.length} opportunities, ${news.items.length} news stories, ${providers.providers.length} opportunity providers, ${newsHealth.providers.length} news providers, map=${mapResponse.status}.`);

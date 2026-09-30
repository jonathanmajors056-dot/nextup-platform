export type ReadinessItem = {
  id: string;
  label: string;
  configured: boolean;
  detail: string;
  requiredFor: "pilot" | "public" | "optional";
};

function present(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getLaunchReadiness() {
  const supabase = present(process.env.NEXT_PUBLIC_SUPABASE_URL) && present(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const admin = present(process.env.ADMIN_REVIEW_KEY);
  const openai = present(process.env.OPENAI_API_KEY);
  const opportunityFeeds = present(process.env.OPPORTUNITY_RSS_URLS) || present(process.env.OPPORTUNITY_API_URLS);
  const newsFeeds = present(process.env.NEWS_RSS_URLS) || present(process.env.NEWS_API_URLS);
  const maps = present(process.env.GOOGLE_MAPS_API_KEY);
  const cron = present(process.env.CRON_SECRET);

  const items: ReadinessItem[] = [
    { id: "database", label: "Supabase persistence", configured: supabase, detail: supabase ? "Connected configuration detected" : "Demo fallback is active; apply supabase/schema.sql before pilot data entry", requiredFor: "pilot" },
    { id: "admin", label: "Admin protection", configured: admin, detail: admin ? "Review endpoints are protected" : "Set ADMIN_REVIEW_KEY before production review operations", requiredFor: "pilot" },
    { id: "ai", label: "AI extraction", configured: openai, detail: openai ? "Draft extraction is available" : "Manual drafts still work; AI extraction is unavailable", requiredFor: "pilot" },
    { id: "opportunity-feeds", label: "Live opportunity feeds", configured: opportunityFeeds, detail: opportunityFeeds ? "Approved RSS/API sources are configured" : "Manual submissions only; add permitted sources", requiredFor: "public" },
    { id: "news-feeds", label: "Live tech news feeds", configured: newsFeeds, detail: newsFeeds ? "Approved news sources are configured" : "NewsPortal is using curated/demo content", requiredFor: "public" },
    { id: "maps", label: "Google Maps preview", configured: maps, detail: maps ? "Server-side map rendering is enabled" : "Location ranking works; map preview is optional", requiredFor: "optional" },
    { id: "expiry-cron", label: "Expiry automation", configured: cron, detail: cron ? "Scheduled expiry requests are authenticated" : "Configure CRON_SECRET for protected scheduled expiry", requiredFor: "pilot" },
  ];

  const pilotBlockers = items.filter((item) => item.requiredFor === "pilot" && !item.configured);
  const publicBlockers = items.filter((item) => item.requiredFor !== "optional" && !item.configured);

  return {
    mode: supabase ? "persistent" as const : "demo" as const,
    pilotReady: pilotBlockers.length === 0,
    publicReady: publicBlockers.length === 0,
    items,
    pilotBlockers: pilotBlockers.map((item) => item.id),
    publicBlockers: publicBlockers.map((item) => item.id),
    generatedAt: new Date().toISOString(),
  };
}

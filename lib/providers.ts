import type { OpportunityProvider } from "./types";
import { mergeHealth } from "./source-health";

function configured(value: string | undefined) {
  return Boolean(value?.trim());
}

/** Provider registry is intentionally declarative so sources can be enabled independently. */
export function listProviders(): OpportunityProvider[] {
  const rssConfigured = configured(process.env.OPPORTUNITY_RSS_URLS);
  const eventbriteConfigured = configured(process.env.EVENTBRITE_API_TOKEN);
  const providers: OpportunityProvider[] = [
    { id: "admin-manual", name: "Admin submissions", kind: "manual", regions: ["IN", "GLOBAL"], supportsOnline: true, status: "configured", lastRunAt: null, lastSuccessAt: null, lastError: null },
    { id: "approved-rss", name: "Approved RSS feeds", kind: "rss", regions: ["IN", "GLOBAL"], supportsOnline: true, status: rssConfigured ? "configured" : "needs_configuration", sourceUrl: rssConfigured ? "Configured by environment" : undefined, lastRunAt: null, lastSuccessAt: null, lastError: null },
    { id: "eventbrite", name: "Eventbrite", kind: "official_api", regions: ["IN", "GLOBAL"], supportsOnline: true, status: eventbriteConfigured ? "configured" : "needs_configuration", lastRunAt: null, lastSuccessAt: null, lastError: null },
  ];
  return providers.map(mergeHealth);
}

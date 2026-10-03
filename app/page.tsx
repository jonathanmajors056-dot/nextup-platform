import { Shell } from "@/components/Shell";
import { OpportunityDashboard } from "@/components/OpportunityDashboard";
import { getLocationPreference, listPublished, listSaved } from "@/lib/store";
import { getViewerId } from "@/lib/identity";
import { rankByLocation } from "@/lib/geo";

async function safeRead<T>(label: string, read: () => Promise<T>, fallback: T) {
  try { return await read(); }
  catch (error) {
    console.error(JSON.stringify({ event: "homepage_read_fallback", resource: label, error: error instanceof Error ? error.message : "provider_error" }));
    return fallback;
  }
}

export default async function HomePage() {
  const viewerId = await safeRead("viewer_identity", getViewerId, "demo-student");
  const preference = await safeRead("location_preferences", () => getLocationPreference(viewerId), null);
  const published = await safeRead("opportunities", () => listPublished(), []);
  const opportunities = await safeRead(
    "location_ranking",
    async () => rankByLocation(published, preference?.latitude != null && preference.longitude != null ? { latitude: preference.latitude, longitude: preference.longitude } : null, preference?.radiusKm ?? 250),
    published,
  );
  const savedIds = await safeRead("saved_opportunities", () => listSaved(viewerId), []);
  return <Shell><main className="main dashboard-main"><OpportunityDashboard opportunities={opportunities} savedIds={savedIds} locationPreference={preference} mapsEnabled={Boolean(process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_GEOCODING_API_KEY)} /></main></Shell>;
}

import { Shell } from "@/components/Shell";
import { OpportunityDashboard } from "@/components/OpportunityDashboard";
import { getLocationPreference, listPublished, listSaved } from "@/lib/store";
import { getViewerId } from "@/lib/identity";
import { rankByLocation } from "@/lib/geo";

export default async function HomePage() {
  const viewerId = await getViewerId();
  const preference = await getLocationPreference(viewerId);
  const opportunities = rankByLocation(await listPublished(), preference?.latitude != null && preference.longitude != null ? { latitude: preference.latitude, longitude: preference.longitude } : null);
  const savedIds = await listSaved(viewerId);
  return <Shell><main className="main dashboard-main"><OpportunityDashboard opportunities={opportunities} savedIds={savedIds} locationPreference={preference} mapsEnabled={Boolean(process.env.GOOGLE_MAPS_API_KEY)} /></main></Shell>;
}

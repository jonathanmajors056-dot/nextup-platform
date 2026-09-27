import { Shell } from "@/components/Shell";
import { OpportunityDashboard } from "@/components/OpportunityDashboard";
import { listPublished, listSaved } from "@/lib/store";
import { getViewerId } from "@/lib/identity";

export default async function HomePage() {
  const opportunities = await listPublished();
  const savedIds = await listSaved(await getViewerId());
  return <Shell><main className="main dashboard-main"><OpportunityDashboard opportunities={opportunities} savedIds={savedIds} /></main></Shell>;
}

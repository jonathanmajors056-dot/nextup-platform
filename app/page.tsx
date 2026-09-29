import { Shell } from "@/components/Shell";
import { OpportunityDashboard } from "@/components/OpportunityDashboard";
import { getCurrentUser } from "@/lib/auth/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { listPublished, listSaved } from "@/lib/store";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; format?: string }> }) {
  const params = await searchParams;
  const page = await listPublished({ q: params.q, category: params.category, format: params.format });
  const user = await getCurrentUser();
  const savedIds = await listSaved(user?.id ?? (hasSupabaseConfig() ? null : "demo-student"));
  return <Shell><main className="main dashboard-main"><OpportunityDashboard opportunities={page.data} savedIds={savedIds} nextCursor={page.nextCursor} initialFilters={{ q: params.q ?? "", category: params.category ?? "All", format: params.format ?? "All" }} /></main></Shell>;
}

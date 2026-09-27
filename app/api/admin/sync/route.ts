import { fetchApprovedSource } from "@/lib/fetch-source";
import { normalizeCandidate } from "@/lib/ingestion";
import { parseRssFeed } from "@/lib/rss";
import { parseOpportunityApi } from "@/lib/json-source";
import { findOpportunityDuplicate, createSubmission, recordSourceItem } from "@/lib/store";
import { opportunityFingerprint } from "@/lib/ingestion";
import { recordSourceRun } from "@/lib/source-health";
import { requireAdmin } from "@/lib/admin-auth";

function approvedFeeds(value: string | undefined) { return (value ?? "").split(",").map((url) => url.trim()).filter((url) => /^https?:\/\//i.test(url)); }

export async function POST(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  const feeds = [
    ...approvedFeeds(process.env.OPPORTUNITY_RSS_URLS).map((url) => ({ url, kind: "rss" as const })),
    ...approvedFeeds(process.env.OPPORTUNITY_API_URLS).map((url) => ({ url, kind: "api" as const })),
  ];
  if (!feeds.length) return Response.json({ synced: 0, message: "No approved RSS or JSON API sources configured." });
  const results: Array<{ url: string; imported: number; duplicates: number; error?: string }> = [];
  for (const feed of feeds) {
    const url = feed.url;
    const providerId = `${feed.kind}:${new URL(url).hostname}`;
    const healthId = feed.kind === "rss" ? "approved-rss" : "approved-api";
    try {
      const { body } = await fetchApprovedSource(url);
      let imported = 0; let duplicates = 0;
      const candidates = feed.kind === "rss" ? parseRssFeed(body, providerId) : parseOpportunityApi(body, providerId);
      for (const candidate of candidates.slice(0, 100)) {
        const draft = normalizeCandidate(candidate);
        const existing = await findOpportunityDuplicate({ officialUrl: draft.officialUrl, title: draft.title, organizer: draft.organizer, registrationDeadline: draft.registrationDeadline });
        if (existing) { duplicates += 1; continue; }
        const opportunity = await createSubmission({ rawText: candidate.rawSource ?? candidate.description ?? candidate.title, sourceType: feed.kind, sourceUrl: draft.sourceUrl, draft });
        await recordSourceItem({ fingerprint: opportunityFingerprint(candidate), providerId: candidate.providerId, externalId: candidate.externalId, opportunityId: opportunity.id, sourceUrl: draft.sourceUrl });
        imported += 1;
      }
      recordSourceRun(healthId, { ok: true });
      results.push({ url, imported, duplicates });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown source error";
      recordSourceRun(healthId, { ok: false, error: message });
      results.push({ url, imported: 0, duplicates: 0, error: message });
    }
  }
  return Response.json({ synced: results.reduce((sum, result) => sum + result.imported, 0), results });
}

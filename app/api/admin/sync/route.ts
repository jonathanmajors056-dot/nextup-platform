import { fetchApprovedSource } from "@/lib/fetch-source";
import { normalizeCandidate } from "@/lib/ingestion";
import { parseRssFeed } from "@/lib/rss";
import { findOpportunityDuplicate, createSubmission, recordSourceItem } from "@/lib/store";
import { opportunityFingerprint } from "@/lib/ingestion";
import { recordSourceRun } from "@/lib/source-health";

function approvedFeeds() { return (process.env.OPPORTUNITY_RSS_URLS ?? "").split(",").map((url) => url.trim()).filter((url) => /^https?:\/\//i.test(url)); }

export async function POST(request: Request) {
  if (process.env.ADMIN_REVIEW_KEY && request.headers.get("x-admin-key") !== process.env.ADMIN_REVIEW_KEY) return Response.json({ error: "Admin authorization required" }, { status: 401 });
  const feeds = approvedFeeds();
  if (!feeds.length) return Response.json({ synced: 0, message: "No approved RSS feeds configured." });
  const results: Array<{ url: string; imported: number; duplicates: number; error?: string }> = [];
  for (const url of feeds) {
    const providerId = `rss:${new URL(url).hostname}`;
    try {
      const { body } = await fetchApprovedSource(url);
      let imported = 0; let duplicates = 0;
      for (const candidate of parseRssFeed(body, providerId).slice(0, 100)) {
        const draft = normalizeCandidate(candidate);
        const existing = await findOpportunityDuplicate({ officialUrl: draft.officialUrl, title: draft.title, organizer: draft.organizer, registrationDeadline: draft.registrationDeadline });
        if (existing) { duplicates += 1; continue; }
        const opportunity = await createSubmission({ rawText: candidate.rawSource ?? candidate.description ?? candidate.title, sourceType: "rss", sourceUrl: draft.sourceUrl, draft });
        await recordSourceItem({ fingerprint: opportunityFingerprint(candidate), providerId: candidate.providerId, externalId: candidate.externalId, opportunityId: opportunity.id, sourceUrl: draft.sourceUrl });
        imported += 1;
      }
      recordSourceRun("approved-rss", { ok: true });
      results.push({ url, imported, duplicates });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown source error";
      recordSourceRun("approved-rss", { ok: false, error: message });
      results.push({ url, imported: 0, duplicates: 0, error: message });
    }
  }
  return Response.json({ synced: results.reduce((sum, result) => sum + result.imported, 0), results });
}

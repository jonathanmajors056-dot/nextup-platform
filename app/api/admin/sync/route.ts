import { fetchApprovedSource } from "@/lib/fetch-source";
import { normalizeCandidate } from "@/lib/ingestion";
import { parseRssFeed } from "@/lib/rss";
import { parseOpportunityApi } from "@/lib/json-source";
import { findOpportunityDuplicate, createSubmission, recordSourceItem } from "@/lib/store";
import { opportunityFingerprint } from "@/lib/ingestion";
import { recordSourceRun } from "@/lib/source-health";
import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { recordOpportunityAudit } from "@/lib/audit";

function approvedFeeds(value: string | undefined) { return (value ?? "").split(",").map((url) => url.trim()).filter((url) => /^https?:\/\//i.test(url)); }

function describeError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const value = error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };
    return [value.message, value.code, value.details, value.hint].filter((part) => typeof part === "string" && part.trim()).join(" · ") || "Unknown source error";
  }
  return "Unknown source error";
}

export async function POST(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  const limited = await enforceRateLimit(request, "adminSync", "opportunity-sync", true); if (limited) return limited;
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
        await recordOpportunityAudit({ opportunityId: opportunity.id, action: "source_sync", metadata: { providerId: candidate.providerId, sourceType: feed.kind, aiConfidence: opportunity.aiConfidence } });
        imported += 1;
      }
      recordSourceRun(healthId, { ok: true });
      results.push({ url, imported, duplicates });
    } catch (error) {
      const message = describeError(error);
      recordSourceRun(healthId, { ok: false, error: message });
      results.push({ url, imported: 0, duplicates: 0, error: message });
    }
  }
  return Response.json({ synced: results.reduce((sum, result) => sum + result.imported, 0), results });
}

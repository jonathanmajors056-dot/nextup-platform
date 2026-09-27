import { createSubmission, findOpportunityDuplicate, recordSourceItem } from "@/lib/store";
import { normalizeCandidate, opportunityFingerprint } from "@/lib/ingestion";
import type { IngestionCandidate } from "@/lib/types";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  try {
    const candidate = await request.json() as IngestionCandidate;
    const draft = normalizeCandidate(candidate);
    const sourceText = candidate.rawSource || [candidate.title, candidate.description, candidate.officialUrl].filter(Boolean).join("\n");
    // Fingerprint is returned now so a persistent source_items table can be
    // added without changing provider payloads or the review workflow.
    const fingerprint = opportunityFingerprint(candidate);
    const existing = await findOpportunityDuplicate({ officialUrl: draft.officialUrl, title: draft.title, organizer: draft.organizer, registrationDeadline: draft.registrationDeadline });
    if (existing) return Response.json({ duplicate: true, fingerprint, opportunity: existing }, { status: 200 });
    const opportunity = await createSubmission({ rawText: sourceText, sourceType: draft.sourceType, sourceUrl: draft.sourceUrl, draft });
    await recordSourceItem({ fingerprint, providerId: candidate.providerId, externalId: candidate.externalId, opportunityId: opportunity.id, sourceUrl: draft.sourceUrl });
    return Response.json({ duplicate: false, fingerprint, opportunity }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid ingestion candidate" }, { status: 400 });
  }
}

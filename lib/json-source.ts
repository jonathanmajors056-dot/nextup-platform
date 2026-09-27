import type { IngestionCandidate } from "./types";

function text(value: unknown) { return typeof value === "string" ? value : value == null ? "" : String(value); }

export function parseOpportunityApi(body: string, providerId: string): IngestionCandidate[] {
  const payload = JSON.parse(body) as unknown;
  const records = Array.isArray(payload) ? payload : payload && typeof payload === "object" && "events" in payload && Array.isArray(payload.events) ? payload.events : payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data) ? payload.data : [];
  return records.map((record) => {
    const item = record && typeof record === "object" ? record as Record<string, unknown> : {};
    const title = text(item.title ?? item.name);
    const officialUrl = text(item.officialUrl ?? item.official_url ?? item.url ?? item.link);
    const description = text(item.description ?? item.summary);
    return {
      providerId, externalId: text(item.externalId ?? item.external_id ?? item.id) || undefined, title, description,
      summary: text(item.summary) || description.slice(0, 220), category: item.category as IngestionCandidate["category"],
      organizer: text(item.organizer ?? item.organization), officialUrl, sourceUrl: text(item.sourceUrl ?? item.source_url) || officialUrl,
      format: item.format as IngestionCandidate["format"], location: text(item.location),
      latitude: typeof item.latitude === "number" ? item.latitude : null, longitude: typeof item.longitude === "number" ? item.longitude : null,
      eventStartDate: text(item.eventStartDate ?? item.event_start_date) || null, eventEndDate: text(item.eventEndDate ?? item.event_end_date) || null,
      registrationDeadline: text(item.registrationDeadline ?? item.registration_deadline) || null, eligibility: text(item.eligibility),
      fees: text(item.fees), benefit: text(item.benefit ?? item.prize), skills: Array.isArray(item.skills) ? item.skills.map(text) : [],
      tags: Array.isArray(item.tags) ? item.tags.map(text) : ["api"], rawSource: JSON.stringify(item),
    } satisfies IngestionCandidate;
  }).filter((candidate) => candidate.title.length >= 3 && Boolean(candidate.officialUrl));
}

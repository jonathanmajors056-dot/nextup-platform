import { createHash } from "node:crypto";
import type { Category, IngestionCandidate, OpportunityDraft } from "./types";

const allowedCategories: Category[] = ["Hackathon", "Competition", "Workshop", "Scholarship", "Internship", "Conference", "Job", "Other"];

function clean(value: string | undefined | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function validUrl(value: string | undefined) {
  try { return value ? new URL(value).toString() : ""; } catch { return ""; }
}

function normalizedDate(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

export function opportunityFingerprint(candidate: Pick<IngestionCandidate, "officialUrl" | "title" | "organizer" | "registrationDeadline">) {
  const canonical = validUrl(candidate.officialUrl).toLowerCase() || [candidate.title, candidate.organizer, candidate.registrationDeadline ?? ""].map((value) => clean(value).toLowerCase()).join("|");
  return createHash("sha256").update(canonical).digest("hex");
}

export function normalizeCandidate(candidate: IngestionCandidate): OpportunityDraft {
  const officialUrl = validUrl(candidate.officialUrl);
  if (!officialUrl) throw new Error("Ingestion candidate requires a valid officialUrl.");
  const category = allowedCategories.includes(candidate.category ?? "Other") ? (candidate.category ?? "Other") : "Other";
  const format = candidate.format === "offline" || candidate.format === "hybrid" ? candidate.format : "online";
  return {
    title: clean(candidate.title) || "Untitled opportunity",
    description: clean(candidate.description),
    summary: clean(candidate.summary) || clean(candidate.description).slice(0, 220),
    category,
    organizer: clean(candidate.organizer) || "Organizer to be confirmed",
    officialUrl,
    sourceUrl: validUrl(candidate.sourceUrl) || officialUrl,
    sourceType: candidate.providerId.includes("rss") ? "rss" : "api",
    format,
    location: clean(candidate.location) || (format === "online" ? "Online" : "Location to be confirmed"),
    eventStartDate: normalizedDate(candidate.eventStartDate),
    eventEndDate: normalizedDate(candidate.eventEndDate),
    registrationDeadline: normalizedDate(candidate.registrationDeadline),
    eligibility: clean(candidate.eligibility),
    fees: clean(candidate.fees),
    benefit: clean(candidate.benefit),
    skills: (candidate.skills ?? []).map(clean).filter(Boolean),
    tags: Array.from(new Set([...(candidate.tags ?? []).map(clean).filter(Boolean), "ingested"])),
    verificationStatus: "awaiting_review",
    aiConfidence: 0,
    status: "draft",
    rawSource: candidate.rawSource,
    lastVerifiedAt: null,
  };
}

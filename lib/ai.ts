import { opportunitySchema } from "./validation";
import { categories, type OpportunityDraft, type Opportunity } from "./types";
import { generateStructuredJSON } from "./ai-client";

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    summary: { type: "string" },
    category: { type: "string", enum: ["Hackathon", "Competition", "Workshop", "Scholarship", "Internship", "Conference", "Job", "Other"] },
    organizer: { type: "string" },
    officialUrl: { type: "string" },
    format: { type: "string", enum: ["online", "offline", "hybrid"] },
    location: { type: "string" },
    eventStartDate: { type: ["string", "null"] },
    eventEndDate: { type: ["string", "null"] },
    registrationDeadline: { type: ["string", "null"] },
    eligibility: { type: "string" },
    fees: { type: "string" },
    benefit: { type: "string" },
    skills: { type: "array", items: { type: "string" } },
    tags: { type: "array", items: { type: "string" } },
    aiConfidence: { type: "number" },
  },
  required: ["title", "description", "summary", "category", "organizer", "officialUrl", "format", "location", "eventStartDate", "eventEndDate", "registrationDeadline", "eligibility", "fees", "benefit", "skills", "tags", "aiConfidence"],
};

function fallback(rawText: string, sourceUrl: string): OpportunityDraft {
  const url = sourceUrl || rawText.match(/https?:\/\/[^\s)]+/)?.[0] || "";
  const firstLine = rawText.split(/\r?\n/).find((line) => line.trim())?.trim() || "New student opportunity";
  const deadlineMatch = rawText.match(/(?:deadline|last date|register by)[:\s-]*([^\n]+)/i);
  const category = /hackathon/i.test(rawText) ? "Hackathon" : /scholar/i.test(rawText) ? "Scholarship" : /intern/i.test(rawText) ? "Internship" : /workshop/i.test(rawText) ? "Workshop" : "Other";
  return {
    title: firstLine.slice(0, 120),
    description: rawText.slice(0, 1200),
    summary: rawText.replace(/\s+/g, " ").slice(0, 180),
    category,
    organizer: "Needs verification",
    officialUrl: url,
    sourceUrl,
    sourceType: "manual",
    format: "online",
    location: "Needs verification",
    eventStartDate: null,
    eventEndDate: null,
    registrationDeadline: deadlineMatch?.[1]?.trim() || null,
    eligibility: "Needs verification",
    fees: "Needs verification",
    benefit: "Needs verification",
    skills: [],
    tags: ["needs-review"],
    verificationStatus: "awaiting_review",
    aiConfidence: 0.2,
    status: "draft",
    lastVerifiedAt: null,
  };
}

export async function extractOpportunity(rawText: string, sourceUrl = "", sourceType: Opportunity["sourceType"] = "manual") {
  const generated = await generateStructuredJSON(
    `Extract a student opportunity from the supplied message. Do not invent facts. Use null or "Needs verification" when information is missing. Dates must be ISO 8601 when confidently known. Return only valid JSON matching this schema: ${JSON.stringify(extractionSchema)}`,
    rawText,
  );
  if (!generated) return { ...fallback(rawText, sourceUrl), sourceType };
  const result = generated.result as Record<string, unknown>;
  const category = categories.includes(result.category as (typeof categories)[number]) ? result.category : "Other";
  const format = result.format === "offline" || result.format === "hybrid" || result.format === "online" ? result.format : "online";
  const text = (value: unknown, fallbackValue = "") => typeof value === "string" ? value : fallbackValue;
  const nullableText = (value: unknown) => typeof value === "string" && value.trim() ? value : null;
  const list = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  const officialUrl = text(result.officialUrl, sourceUrl || rawText.match(/https?:\/\/[^\s)]+/)?.[0] || "https://example.com/verify-source");
  const confidence = typeof result.aiConfidence === "number" && Number.isFinite(result.aiConfidence) ? Math.max(0, Math.min(1, result.aiConfidence)) : 0.5;
  return opportunitySchema.parse({
    ...result,
    title: text(result.title, "New student opportunity"),
    description: text(result.description, rawText.slice(0, 1200)),
    summary: text(result.summary, rawText.replace(/\s+/g, " ").slice(0, 180)),
    category,
    organizer: text(result.organizer, "Needs verification"),
    officialUrl,
    format,
    location: text(result.location, "Needs verification"),
    eventStartDate: nullableText(result.eventStartDate),
    eventEndDate: nullableText(result.eventEndDate),
    registrationDeadline: nullableText(result.registrationDeadline),
    eligibility: text(result.eligibility, "Needs verification"),
    fees: text(result.fees, "Needs verification"),
    benefit: text(result.benefit, "Needs verification"),
    skills: list(result.skills),
    tags: list(result.tags),
    aiConfidence: confidence,
    sourceUrl,
    sourceType,
    verificationStatus: "awaiting_review",
    status: "draft",
    lastVerifiedAt: null,
  });
}

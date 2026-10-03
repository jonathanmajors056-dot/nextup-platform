import { opportunitySchema } from "./validation";
import type { OpportunityDraft, Opportunity } from "./types";

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
  if (!process.env.OPENAI_API_KEY) return { ...fallback(rawText, sourceUrl), sourceType };
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_schema", json_schema: { name: "opportunity_extraction", strict: true, schema: extractionSchema } },
      messages: [
        { role: "system", content: "Extract a student opportunity from the provided message. Do not invent facts. Use null or Needs verification when information is missing. Dates must be ISO 8601 when confidently known." },
        { role: "user", content: rawText },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI extraction failed with ${response.status}`);
  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);
  return opportunitySchema.parse({ ...parsed, sourceUrl, sourceType, verificationStatus: "awaiting_review", status: "draft", lastVerifiedAt: null });
}

import { newsCategories, type NewsCandidate } from "./news-types";
import { generateStructuredJSON } from "./ai-client";

const schema = { type: "object", additionalProperties: false, properties: { summary: { type: "string" }, category: { type: "string", enum: [...newsCategories] }, tags: { type: "array", items: { type: "string" } }, topics: { type: "array", items: { type: "string" } }, entities: { type: "array", items: { type: "string" } }, geography: { type: "string", enum: ["India", "Global", "India + Global"] }, isBreaking: { type: "boolean" } }, required: ["summary", "category", "tags", "topics", "entities", "geography", "isBreaking"] };

export async function enrichNewsCandidate(candidate: NewsCandidate): Promise<NewsCandidate> {
  const generated = await generateStructuredJSON(
    `Enrich this technology news candidate using only facts present in the supplied text. Do not invent facts. Keep the summary concise. Return only valid JSON matching this schema: ${JSON.stringify(schema)}`,
    JSON.stringify({ headline: candidate.headline, publisher: candidate.publisher, description: candidate.description, summary: candidate.summary, url: candidate.canonicalUrl }),
  );
  if (!generated) return candidate;
  return { ...candidate, ...(generated.result as Partial<NewsCandidate>) };
}
